// Danger Noodle test harness: emulator wrapper shared by the browser playtest page
// and the headless Node runner. Both use the same Boytacean core, so a replay
// recorded in the browser plays back frame-for-frame in Node.
//
// This file has no Node or DOM dependencies. Pass in the initialized
// Boytacean module (see node.mjs for Node, web/app.js for the browser).

// Button bits match GBDK's J_* constants (gb/gb.h).
export const BTN = {
  RIGHT: 0x01, LEFT: 0x02, UP: 0x04, DOWN: 0x08,
  A: 0x10, B: 0x20, SELECT: 0x40, START: 0x80,
};
export const BTN_NAMES = Object.keys(BTN);

export const SCREEN_W = 160;
export const SCREEN_H = 144;

export function maskFromNames(names) {
  let m = 0;
  for (const n of names) {
    const k = String(n).trim().toUpperCase();
    if (!k) continue;
    if (!(k in BTN)) throw new Error(`Unknown button "${n}" (use ${BTN_NAMES.join(', ')})`);
    m |= BTN[k];
  }
  return m;
}

export function namesFromMask(mask) {
  return BTN_NAMES.filter((n) => mask & BTN[n]);
}

// CRC32, used to fingerprint ROMs and frame buffers without async crypto.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

export function romInfo(rom) {
  const title = new TextDecoder().decode(rom.slice(0x134, 0x143)).replace(/\0.*$/s, '').trim();
  const cgbFlag = rom[0x143];
  return {
    title,
    cgb: cgbFlag === 0x80 ? 'compatible' : cgbFlag === 0xc0 ? 'only' : 'none',
    cartType: rom[0x147],
    romSize: rom.length,
    crc32: crc32(rom),
  };
}

// --- BESS save-state parsing --------------------------------------------------
// Boytacean has no direct WRAM accessor, so memory reads go through a BESS
// snapshot (https://github.com/LIJI32/SameBoy/blob/master/BESS.md). A snapshot
// takes ~0.1 ms, so reading memory every frame is fine.
function parseBess(s) {
  const dv = new DataView(s.buffer, s.byteOffset, s.byteLength);
  const tag = (o) => String.fromCharCode(s[o], s[o + 1], s[o + 2], s[o + 3]);
  if (tag(s.length - 4) !== 'BESS') throw new Error('Not a BESS state');
  let off = dv.getUint32(s.length - 8, true);
  while (off < s.length - 8) {
    const id = tag(off);
    const len = dv.getUint32(off + 4, true);
    if (id === 'CORE') {
      const b = off + 8;
      const regs = {
        pc: dv.getUint16(b + 8, true), af: dv.getUint16(b + 10, true),
        bc: dv.getUint16(b + 12, true), de: dv.getUint16(b + 14, true),
        hl: dv.getUint16(b + 16, true), sp: dv.getUint16(b + 18, true),
        ime: s[b + 20], ie: s[b + 21], execState: s[b + 22],
      };
      const io = s.subarray(b + 24, b + 24 + 0x80);
      let p = b + 24 + 0x80;
      const area = {};
      for (const n of ['ram', 'vram', 'sram', 'oam', 'hram', 'bgpal', 'objpal']) {
        const size = dv.getUint32(p, true);
        const at = dv.getUint32(p + 4, true);
        area[n] = s.subarray(at, at + size);
        p += 8;
      }
      return { regs, io, ...area };
    }
    if (id === 'END ') break;
    off += 8 + len;
  }
  throw new Error('BESS state has no CORE block');
}

/** Compare the current machine to a saved BESS state (WRAM, HRAM, VRAM, OAM, PC/SP). */
export function compareState(emu, stateBytes) {
  const want = parseBess(stateBytes);
  const have = emu.snapshot();
  const diffs = [];
  const cmp = (name, a, b, base) => {
    let n = 0;
    let first = -1;
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) { n++; if (first < 0) first = i; }
    if (n) diffs.push(`${name}: ${n} bytes differ (first at 0x${(base + first).toString(16).toUpperCase()})`);
  };
  cmp('WRAM', have.ram, want.ram, 0xc000);
  cmp('HRAM', have.hram, want.hram, 0xff80);
  cmp('VRAM', have.vram, want.vram, 0x8000);
  cmp('OAM', have.oam, want.oam, 0xfe00);
  if (have.regs.pc !== want.regs.pc) diffs.push(`PC ${have.regs.pc.toString(16)} != ${want.regs.pc.toString(16)}`);
  return { match: diffs.length === 0, diffs };
}

export class Emu {
  /**
   * @param B     initialized Boytacean module
   * @param rom   Uint8Array ROM image
   * @param opts  { mode: 'auto'|'dmg'|'cgb' }
   */
  constructor(B, rom, { mode = 'auto' } = {}) {
    this.B = B;
    this.rom = rom;
    this.info = romInfo(rom);
    this.mode = mode === 'auto' ? (this.info.cgb === 'none' ? 'dmg' : 'cgb') : mode;
    this.padMap = [
      [BTN.RIGHT, B.PadKey.Right], [BTN.LEFT, B.PadKey.Left],
      [BTN.UP, B.PadKey.Up], [BTN.DOWN, B.PadKey.Down],
      [BTN.A, B.PadKey.A], [BTN.B, B.PadKey.B],
      [BTN.SELECT, B.PadKey.Select], [BTN.START, B.PadKey.Start],
    ];
    this.reset();
  }

  reset() {
    const B = this.B;
    if (this.gb) this.gb.free();
    this.gb = new B.GameBoy(this.mode === 'cgb' ? B.GameBoyMode.Cgb : B.GameBoyMode.Dmg);
    if (this.mode === 'dmg') {
      // Skip the boot ROM: start at 0x0100 with post-boot register values.
      this.gb.load_unsafe(false);
      this.gb.load_rom_wa(this.rom);
      this.gb.load_boot_state();
    } else {
      // Boytacean can only fake post-boot state on DMG, so CGB runs its
      // bundled open-source boot ROM (adds ~2.5 s of frames before the game).
      this.gb.load_unsafe(true);
      this.gb.load_rom_wa(this.rom);
    }
    this.frame = 0;
    this.buttons = 0;
    this._snap = null;
    this._fb = null;
  }

  /** Set the full button state (bitmask of BTN values). */
  setButtons(mask) {
    mask &= 0xff;
    const changed = mask ^ this.buttons;
    if (!changed) return;
    for (const [bit, key] of this.padMap) {
      if (!(changed & bit)) continue;
      if (mask & bit) this.gb.key_press(key);
      else this.gb.key_lift(key);
    }
    this.buttons = mask;
  }

  /** Run one video frame. Inputs set before this call apply to this frame. */
  step() {
    this.gb.next_frame();
    // The emulator draws its frame buffer line by line. Grab the picture now, at
    // the frame boundary, while it's one complete frame: finishing the game's
    // update below runs into the next frame, and a buffer read after that mixes
    // the top of the new frame with the rest of the old one (a tear that isn't
    // there on hardware).
    this._fb = this.gb.frame_buffer_eager();
    this._finishGameFrame();
    this.frame++;
    this._snap = null;
  }

  /**
   * next_frame() stops at the end of vblank, but the game's loop starts at the
   * beginning of vblank, so a long update can still be running at that point.
   * Reading memory then would show a half-updated frame (e.g. velocity changed
   * but position not yet). So keep running until the CPU is back in vsync().
   * `lastFrameCycles` records how far (in CPU cycles) the update ran past the end
   * of vblank: a frame is 70224 cycles (140448 on a Game Boy Color at double
   * speed), so this measures the CPU budget used.
   * Needs the `_vsync` symbol; without it this does nothing.
   */
  _finishGameFrame() {
    const syms = this.symbols;
    if (!syms) return;
    if (this._idleFor !== syms) {
      this._idleFor = syms;
      this._idle = null;
      const v = syms.get('_vsync');
      if (v) {
        // The routine ends where the next symbol starts.
        let end = v.addr + 0x20;
        for (const s of syms.map.values()) if (s.addr > v.addr && s.addr < end) end = s.addr;
        this._idle = [v.addr, end];
      }
    }
    this.lastFrameCycles = 0;
    if (!this._idle) return;
    const [lo, hi] = this._idle;
    const r = this.gb.registers();
    const pc = r.pc;
    r.free();
    if (pc >= lo && pc < hi) return; // already idle in vsync
    // A crashed ROM can run forever without calling vsync, and step_to has no
    // limit. The usual crash runs off into RAM or VRAM, so stop there with an
    // error. (HRAM 0xFF80+ is fine: GBDK's sprite DMA routine runs from there.)
    if (pc >= 0x8000 && pc < 0xff80) {
      throw new Error(`CPU is executing outside ROM (pc=0x${pc.toString(16)}) at frame ${this.frame}: the game has crashed`);
    }
    // Run until the game calls vsync() again. If the update takes longer than a
    // whole frame (a real slowdown), this crosses a frame boundary; replays on the
    // playtest page use the same code, so they stay in sync either way.
    this.lastFrameCycles = Number(this.gb.step_to(lo));
  }

  run(frames) {
    for (let i = 0; i < frames; i++) this.step();
  }

  /** 160x144 RGB (3 bytes per pixel). */
  /** The last complete frame (160x144 RGB). */
  frameBuffer() {
    return this._fb ?? this.gb.frame_buffer_eager();
  }

  frameHash() {
    return crc32(this.frameBuffer());
  }

  audio() {
    return {
      samples: this.gb.audio_buffer_eager(true),
      rate: this.gb.audio_sampling_rate(),
      channels: this.gb.audio_channels(),
    };
  }

  // --- memory -----------------------------------------------------------------
  snapshot() {
    if (!this._snap) {
      this._state = this.B.StateManager.save_wa(this.gb, this.B.SaveStateFormat.Bess);
      this._snap = parseBess(this._state);
    }
    return this._snap;
  }

  registers() {
    return { ...this.snapshot().regs };
  }

  /** Read one byte from the CPU address space (no side effects). */
  read8(addr) {
    const s = this.snapshot();
    if (addr < 0x4000) return this.rom[addr] ?? 0xff;
    if (addr < 0x8000) return 0xff; // switchable ROM bank: not tracked
    if (addr < 0xa000) return s.vram[addr - 0x8000];
    if (addr < 0xc000) return s.sram[addr - 0xa000] ?? 0xff;
    if (addr >= 0xe000 && addr < 0xfe00) addr -= 0x2000; // echo RAM
    if (addr < 0xd000) return s.ram[addr - 0xc000];
    if (addr < 0xe000) {
      const bank = this.mode === 'cgb' ? (s.io[0x70] & 7) || 1 : 1;
      return s.ram[bank * 0x1000 + (addr - 0xd000)];
    }
    if (addr < 0xfea0) return s.oam[addr - 0xfe00];
    if (addr < 0xff00) return 0xff;
    if (addr < 0xff80) return s.io[addr - 0xff00];
    if (addr < 0xffff) return s.hram[addr - 0xff80];
    return s.regs.ie;
  }

  read16(addr) {
    return this.read8(addr) | (this.read8(addr + 1) << 8);
  }

  readBytes(addr, len) {
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = this.read8(addr + i);
    return out;
  }

  // --- save states --------------------------------------------------------------
  saveState() {
    return this.B.StateManager.save_wa(this.gb, this.B.SaveStateFormat.Bess);
  }

  loadState(bytes) {
    this.B.StateManager.load_wa(bytes, this.gb, this.B.SaveStateFormat.Bess);
    this._snap = null;
    this._fb = null;
    // The core keeps its own pad state; resync ours by releasing everything.
    for (const [, key] of this.padMap) this.gb.key_lift(key);
    this.buttons = 0;
  }

  /**
   * Write bytes into WRAM (0xC000-0xDFFF) or HRAM. Boytacean has no memory write,
   * so this round-trips a save state with the bytes patched in. For tests and
   * tools only (e.g. setting a debug command variable); buttons are kept.
   */
  writeBytes(addr, bytes) {
    const state = this.saveState();
    const s = parseBess(state);
    bytes.forEach((v, i) => {
      const a = addr + i;
      if (a >= 0xc000 && a < 0xe000) s.ram[a - 0xc000] = v;
      else if (a >= 0xff80 && a < 0xffff) s.hram[a - 0xff80] = v;
      else throw new Error(`writeBytes: 0x${a.toString(16)} is not WRAM/HRAM`);
    });
    const buttons = this.buttons;
    this.loadState(state);
    this.setButtons(buttons);
  }

  write8(addr, v) {
    this.writeBytes(addr, [v & 0xff]);
  }

  // --- cartridge RAM (battery saves) ---------------------------------------------
  /** A copy of the cartridge's battery-backed RAM (the game's save files). */
  sram() {
    return new Uint8Array(this.gb.ram_data_eager());
  }

  /** Put save files back (bytes from sram()); before the game reads them (at boot). */
  setSram(bytes) {
    this.gb.set_ram_data(new Uint8Array(bytes));
  }
}

// --- symbols ------------------------------------------------------------------
// Parses GBDK symbol output: .noi ("DEF _player_x 0xC0A0") or .sym
// ("00:C0A0 _player_x"). C variables get a leading underscore from SDCC; both
// "_player_x" and "player_x" are accepted for lookups.
export function parseSymbols(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    let m = line.match(/^DEF\s+(\S+)\s+0x([0-9a-fA-F]+)/);
    let name, addr, bank = 0;
    if (m) {
      name = m[1];
      const v = parseInt(m[2], 16);
      addr = v & 0xffff;
      bank = v >>> 16;
    } else if ((m = line.match(/^([0-9a-fA-F]{2,}):([0-9a-fA-F]{4})\s+(\S+)/))) {
      bank = parseInt(m[1], 16);
      addr = parseInt(m[2], 16);
      name = m[3];
    } else continue;
    if (/^(l__|s__|\.|___)/.test(name)) continue; // linker area sizes/starts
    map.set(name, { name, addr, bank });
  }
  return map;
}

export class Symbols {
  constructor(text = '') {
    this.map = parseSymbols(text);
  }
  get(name) {
    return this.map.get(name) || this.map.get('_' + name) || null;
  }
  addr(name) {
    if (typeof name === 'number') return name;
    if (/^(0x|\$)[0-9a-f]+$/i.test(name)) return parseInt(name.replace('$', '0x'), 16);
    const s = this.get(name);
    if (!s) throw new Error(`Unknown symbol "${name}" (is it a global non-static variable?)`);
    return s.addr;
  }
  /** RAM variables only (WRAM/HRAM), which are the useful ones to watch. */
  variables() {
    return [...this.map.values()]
      .filter((s) => (s.addr >= 0xc000 && s.addr < 0xe000) || (s.addr >= 0xff80 && s.addr < 0xffff))
      .filter((s) => s.name.startsWith('_') && !s.name.startsWith('__'))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

/** Read a typed value. type: u8 | i8 | u16 | i16 | bool */
export function readTyped(emu, addr, type = 'u8') {
  switch (type) {
    case 'i8': { const v = emu.read8(addr); return v > 127 ? v - 256 : v; }
    case 'u16': return emu.read16(addr);
    case 'i16': { const v = emu.read16(addr); return v > 32767 ? v - 65536 : v; }
    case 'bool': return emu.read8(addr) !== 0;
    default: return emu.read8(addr);
  }
}

// --- replays ------------------------------------------------------------------
// A replay is the input timeline for a run. `events` lists [frame, mask] pairs
// where the button state changes. If `start_state` is present (base64 BESS)
// the run starts from that state instead of power-on.
export const REPLAY_VERSION = 1;

export class Recorder {
  constructor(emu, { fromState = true, note = '' } = {}) {
    this.emu = emu;
    this.startFrame = emu.frame;
    this.startState = fromState && emu.frame > 0 ? emu.saveState() : null;
    this.events = [];
    this.last = -1;
    this.note = note;
  }
  /** Call once per frame, before emu.step(), with the mask being applied. */
  sample(mask) {
    if (mask !== this.last) {
      this.events.push([this.emu.frame - this.startFrame, mask]);
      this.last = mask;
    }
  }
  finish(extra = {}) {
    return {
      version: REPLAY_VERSION,
      rom: { title: this.emu.info.title, crc32: this.emu.info.crc32 },
      mode: this.emu.mode,
      length: this.emu.frame - this.startFrame,
      start_state: this.startState ? toBase64(this.startState) : null,
      events: this.events,
      note: this.note,
      created: new Date().toISOString(),
      ...extra,
    };
  }
}

/** Returns a function frame -> mask for a replay's events. */
export function replayInput(replay) {
  const ev = replay.events || [];
  let i = 0;
  let mask = 0;
  return (frame) => {
    while (i < ev.length && ev[i][0] <= frame) mask = ev[i++][1];
    return mask;
  };
}

export function prepareReplay(emu, replay) {
  if (replay.rom && replay.rom.crc32 && replay.rom.crc32 !== emu.info.crc32) {
    console.warn(
      `[harness] replay was recorded on ROM ${replay.rom.crc32}, running ${emu.info.crc32}; ` +
        'it may desync if game logic changed.',
    );
  }
  emu.reset();
  if (replay.start_state) emu.loadState(fromBase64(replay.start_state));
  return replayInput(replay);
}

/**
 * Parse a compact input script, e.g. "30:START 31:- 60-120:RIGHT 90-95:RIGHT+A".
 * "a-b:BTNS" holds buttons for frames a..b-1, "a:BTNS" sets state from frame a,
 * "-" means no buttons. Returns replay events.
 */
export function parseInputScript(script) {
  const spans = [];
  for (const tok of script.trim().split(/[\s,;]+/).filter(Boolean)) {
    const m = tok.match(/^(\d+)(?:-(\d+))?:(.+)$/);
    if (!m) throw new Error(`Bad input token "${tok}" (expected frame:BTN or a-b:BTN+BTN)`);
    const mask = m[3] === '-' ? 0 : maskFromNames(m[3].split('+'));
    spans.push({ from: +m[1], to: m[2] !== undefined ? +m[2] : null, mask });
  }
  const last = Math.max(0, ...spans.map((s) => (s.to ?? s.from) + 1));
  const masks = new Array(last + 1).fill(0);
  let held = 0;
  const sets = new Map(spans.filter((s) => s.to === null).map((s) => [s.from, s.mask]));
  for (let f = 0; f <= last; f++) {
    if (sets.has(f)) held = sets.get(f);
    masks[f] = held;
  }
  for (const s of spans) if (s.to !== null) for (let f = s.from; f < s.to; f++) masks[f] |= s.mask;
  const events = [];
  let prev = -1;
  masks.forEach((m, f) => { if (m !== prev) { events.push([f, m]); prev = m; } });
  return events;
}

// --- base64 helpers (work in both Node and browsers) ---------------------------
export function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export function fromBase64(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
