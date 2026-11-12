// Danger Noodle playtest page. Runs the same Boytacean core and harness code as the
// headless tests, so recordings made here replay exactly in `harness/cli.mjs`.
import initCore, * as B from '../harness/vendor/boytacean/boytacean.js';
import {
  Emu, Symbols, Recorder, BTN, readTyped, prepareReplay, toBase64, fromBase64, SCREEN_W, SCREEN_H,
} from '../harness/emu.mjs';

const FRAME_MS = 1000 / 59.7275;
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem('dn.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('dn.' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ---------------------------------------------------------------------------
// Backend: the local dev server (tools/serve.mjs) by default. The hosted
// playtest bundle swaps in its own backend via window.RGB_BACKEND.
const localBackend = {
  name: 'local',
  async loadRom() {
    const r = await fetch('/build/dangernoodle.gb', { cache: 'no-store' });
    if (!r.ok) throw new Error('No ROM yet. Run "node tools/build.mjs" (or fix the build errors).');
    const rom = new Uint8Array(await r.arrayBuffer());
    let sym = '';
    const s = await fetch('/build/dangernoodle.noi', { cache: 'no-store' });
    if (s.ok) sym = await s.text();
    return { rom, sym, label: 'build/dangernoodle.gb' };
  },
  subscribe(onEvent) {
    const es = new EventSource('/events');
    es.onmessage = (e) => onEvent(JSON.parse(e.data));
    es.onerror = () => setPill('dev server disconnected', 'err');
  },
  async listReplays() {
    const r = await fetch('/api/replays');
    return r.ok ? r.json() : [];
  },
  async getReplay(id) {
    const r = await fetch('/api/replays/' + encodeURIComponent(id));
    return r.json();
  },
  async saveReplay(replay, kind) {
    const r = await fetch('/api/replays', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, replay }),
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()).id;
  },
};
const backend = window.RGB_BACKEND || localBackend;

// ---------------------------------------------------------------------------
// State
let emu = null;
let symbols = new Symbols('');
let paused = false;
let speed = 1;
let fastForward = false;
let rewinding = false;
let acc = 0;
let last = performance.now();
let recorder = null;
let player = null; // { input, length, name }
let quickState = null;
let fpsCount = 0;
let fpsT = performance.now();

const rewindBuf = []; // { frame, state }
const REWIND_MAX = 600; // states, one every 2 frames => ~20 s
const checkpoints = []; // { frame, state } every 600 frames, for bug reports
let history = []; // [absFrame, mask] input changes since oldest checkpoint
let lastMask = -1;

const canvas = $('screen');
const ctx2d = canvas.getContext('2d');
const img = ctx2d.createImageData(SCREEN_W, SCREEN_H);

// ---------------------------------------------------------------------------
// Input
const keyMap = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  KeyW: 'UP', KeyS: 'DOWN', KeyA: 'LEFT', KeyD: 'RIGHT',
  KeyX: 'A', KeyK: 'A', KeyZ: 'B', KeyJ: 'B',
  Enter: 'START', ShiftLeft: 'SELECT', ShiftRight: 'SELECT',
};
const held = { key: 0, touch: 0, pad: 0 };

addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, select')) return;
  const b = keyMap[e.code];
  if (b) { held.key |= BTN[b]; e.preventDefault(); return; }
  if (e.repeat && e.code !== 'KeyN') return;
  switch (e.code) {
    case 'KeyP': togglePause(); break;
    case 'KeyN': stepOnce(); break;
    case 'KeyR': rewinding = true; break;
    case 'Tab': fastForward = true; e.preventDefault(); break;
    case 'KeyM': toggleAudio(); break;
    case 'F2': e.preventDefault(); resetEmu(); break;
    case 'F5': e.preventDefault(); quickSave(); break;
    case 'F9': e.preventDefault(); quickLoad(); break;
    case 'F12': e.preventDefault(); screenshot(); break;
  }
});
addEventListener('keyup', (e) => {
  const b = keyMap[e.code];
  if (b) held.key &= ~BTN[b];
  if (e.code === 'KeyR') rewinding = false;
  if (e.code === 'Tab') fastForward = false;
});
addEventListener('blur', () => {
  held.key = 0;
  held.touch = 0;
  activePointers.clear();
  syncTouchVisuals();
  rewinding = false;
  fastForward = false;
});

const hapticLabel = $('haptic-label');
function haptic(ms = 12) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
    else hapticLabel?.click();
  } catch { /* ignore */ }
}

const touchpad = $('touchpad');
const dpadEl = $('dpad');
const touchBtns = [...document.querySelectorAll('#touchpad [data-btn]')];
const actionBtns = touchBtns.filter((el) => !dpadEl.contains(el));
const activePointers = new Map(); // pointerId -> { zone: 'dpad' | 'buttons', mask: number }

function computePointerMask(zone, clientX, clientY) {
  let mask = 0;
  if (zone === 'dpad') {
    const r = dpadEl.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    // One direction only, never a diagonal: a snake wants deliberate turns.
    if (dist > 10 && dist < Math.max(r.width, r.height) * 0.95) {
      if (Math.abs(dx) >= Math.abs(dy)) mask = dx > 0 ? BTN.RIGHT : BTN.LEFT;
      else mask = dy > 0 ? BTN.DOWN : BTN.UP;
    }
  } else {
    for (const el of actionBtns) {
      const r = el.getBoundingClientRect();
      const pad = 8;
      if (clientX >= r.left - pad && clientX <= r.right + pad && clientY >= r.top - pad && clientY <= r.bottom + pad) {
        mask |= BTN[el.dataset.btn];
      }
    }
  }
  return mask;
}

function syncTouchVisuals() {
  for (const el of touchBtns) {
    el.classList.toggle('held', !!(held.touch & BTN[el.dataset.btn]));
  }
}

function updateTouchState() {
  const prev = held.touch;
  let next = 0;
  for (const p of activePointers.values()) next |= p.mask;
  held.touch = next;
  if (next !== prev) {
    syncTouchVisuals();
    const pressedNew = (next & ~prev) !== 0;
    haptic(pressedNew ? 14 : 5);
  }
}

touchpad.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const zone = dpadEl.contains(e.target) ? 'dpad' : 'buttons';
  // One finger on the d-pad at a time.
  if (zone === 'dpad' && [...activePointers.values()].some((p) => p.zone === 'dpad')) return;
  const mask = computePointerMask(zone, e.clientX, e.clientY);
  activePointers.set(e.pointerId, { zone, mask });
  touchpad.setPointerCapture?.(e.pointerId);
  updateTouchState();
});

touchpad.addEventListener('pointermove', (e) => {
  const p = activePointers.get(e.pointerId);
  if (!p) return;
  e.preventDefault();
  // A d-pad press keeps its direction until the finger lifts: sliding never
  // turns the noodle. (A press that starts in the dead centre takes the first
  // direction it slides to.)
  if (p.zone === 'dpad' && p.mask) return;
  p.mask = computePointerMask(p.zone, e.clientX, e.clientY);
  updateTouchState();
});

function endPointer(e) {
  if (!activePointers.has(e.pointerId)) return;
  e.preventDefault();
  activePointers.delete(e.pointerId);
  updateTouchState();
}
touchpad.addEventListener('pointerup', endPointer);
touchpad.addEventListener('pointercancel', endPointer);
touchpad.addEventListener('lostpointercapture', endPointer);

function pollGamepad() {
  held.pad = 0;
  for (const gp of navigator.getGamepads?.() || []) {
    if (!gp) continue;
    const p = (i) => gp.buttons[i]?.pressed;
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    if (p(12) || ay < -0.5) held.pad |= BTN.UP;
    if (p(13) || ay > 0.5) held.pad |= BTN.DOWN;
    if (p(14) || ax < -0.5) held.pad |= BTN.LEFT;
    if (p(15) || ax > 0.5) held.pad |= BTN.RIGHT;
    // Positional, Nintendo-style: right face button = A, bottom = B.
    if (p(1) || p(3)) held.pad |= BTN.A;
    if (p(0) || p(2)) held.pad |= BTN.B;
    if (p(9)) held.pad |= BTN.START;
    if (p(8)) held.pad |= BTN.SELECT;
  }
}
const liveMask = () => held.key | held.touch | held.pad;

// ---------------------------------------------------------------------------
// Audio
let audioCtx = null;
let audioOn = false;
let audioNext = 0;
const AUDIO_GAIN = 1 / 48;  // a raw sample of 48 plays at full scale
function toggleAudio() {
  audioOn = !audioOn;
  if (audioOn && !audioCtx) audioCtx = new AudioContext();
  if (audioCtx) audioOn ? audioCtx.resume() : audioCtx.suspend();
  $('b-audio').textContent = audioOn ? '🔊 Sound' : '🔇 Sound';
  $('b-audio').classList.toggle('on', audioOn);
}
function pumpAudio() {
  const { samples, rate, channels } = emu.audio();
  if (!audioOn || !audioCtx || speed !== 1 || fastForward || !samples.length) return;
  const frames = Math.floor(samples.length / channels);
  const buf = audioCtx.createBuffer(2, frames, rate);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  // The emulator's samples are small (about -60..60 with all four channels at
  // full volume), not full-scale 16-bit, so scale them up (and clip).
  for (let i = 0; i < frames; i++) {
    L[i] = Math.max(-1, Math.min(1, samples[i * channels] * AUDIO_GAIN));
    R[i] = Math.max(-1, Math.min(1, samples[i * channels + (channels > 1 ? 1 : 0)] * AUDIO_GAIN));
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  if (audioNext < now || audioNext > now + 0.25) audioNext = now + 0.05;
  src.start(audioNext);
  audioNext += buf.duration;
}

// ---------------------------------------------------------------------------
// Emulation
async function loadFromBackend() {
  try {
    const { rom, sym, label } = await backend.loadRom();
    start(rom, sym, label);
  } catch (e) {
    showOverlay(e.message);
    setPill('no ROM', 'err');
  }
}

// ---------------------------------------------------------------------------
// Save files: the cartridge's battery RAM, kept in this browser per game title,
// put back at every boot and reset, and stored again whenever the game writes it.
let sramKey = '', sramLast = '';
function loadSram() {
  sramKey = 'sram.' + (emu.info.title || 'rom');
  const b64 = store.get(sramKey, null);
  sramLast = b64 || '';
  if (b64) {
    try { emu.setSram(fromBase64(b64)); } catch { /* a different size: start fresh */ }
  }
}
function storeSram() {
  if (!emu) return;
  const b64 = toBase64(emu.sram());
  if (b64 !== sramLast) {
    sramLast = b64;
    store.set(sramKey, b64);
  }
}
setInterval(storeSram, 2000);
addEventListener('pagehide', storeSram);

function start(rom, symText = '', label = 'ROM') {
  if (emu) storeSram();
  emu?.gb?.free();
  emu = new Emu(B, rom, { mode: 'auto' });
  loadSram();
  symbols = new Symbols(symText);
  emu.symbols = symbols;
  resetBuffers();
  recorder = null;
  player = null;
  updateRecUi();
  hideOverlay();
  fillSymbols();
  setPill(`${emu.info.title || label} · ${emu.mode.toUpperCase()} · ${emu.info.crc32}`, 'ok');
  document.title = `${emu.info.title || 'Danger Noodle'} · playtest`;
}

function resetBuffers() {
  rewindBuf.length = 0;
  checkpoints.length = 0;
  history = [];
  lastMask = -1;
}

function resetEmu() {
  if (!emu) return;
  storeSram();
  emu.reset();
  loadSram();
  resetBuffers();
  hideOverlay();
  player = null;
  if (recorder) { recorder = null; toast('Recording discarded (reset)'); }
  updateRecUi();
}

function tick() {
  let mask;
  if (player) {
    const f = emu.frame - player.startFrame;
    if (f >= player.length) {
      toast(`Replay "${player.name}" finished at frame ${f}`);
      player = null;
      updateRecUi();
      paused = true;
      updatePauseUi();
      return;
    }
    mask = player.input(f);
  } else mask = liveMask();

  if (emu.frame % 600 === 0) {
    checkpoints.push({ frame: emu.frame, state: emu.saveState() });
    if (checkpoints.length > 3) {
      checkpoints.shift();
      const from = checkpoints[0].frame;
      history = history.filter(([f]) => f >= from);
    }
  }
  if (mask !== lastMask) { history.push([emu.frame, mask]); lastMask = mask; }
  recorder?.sample(mask);
  emu.setButtons(mask);
  emu.step();
  if (emu.frame % 2 === 0) {
    rewindBuf.push({ frame: emu.frame, state: emu.saveState() });
    if (rewindBuf.length > REWIND_MAX) rewindBuf.shift();
  }
  pumpAudio();
}

function rewindStep() {
  const s = rewindBuf.pop();
  if (!s) return;
  emu.loadState(s.state);
  emu.frame = s.frame;
  // Anything recorded after this point no longer happened.
  history = history.filter(([f]) => f < s.frame);
  while (checkpoints.length && checkpoints.at(-1).frame > s.frame) checkpoints.pop();
  lastMask = -1;
  if (recorder) { recorder = null; updateRecUi(); toast('Recording stopped (rewind)'); }
  player = null;
}

function render() {
  const fb = emu.frameBuffer();
  const d = img.data;
  for (let i = 0, j = 0; i < fb.length; i += 3, j += 4) {
    d[j] = fb[i]; d[j + 1] = fb[i + 1]; d[j + 2] = fb[i + 2]; d[j + 3] = 255;
  }
  ctx2d.putImageData(img, 0, 0);
}

function loop(now) {
  requestAnimationFrame(loop);
  pollGamepad();
  const dt = Math.min(now - last, 100);
  last = now;
  if (!emu) return;
  if (rewinding) {
    rewindStep();
    render();
  } else if (!paused) {
    acc += dt * speed * (fastForward ? 4 : 1);
    let n = 0;
    try {
      while (acc >= FRAME_MS && n < 16) { tick(); acc -= FRAME_MS; n++; fpsCount++; }
    } catch (e) {
      // Say so, rather than leave the last picture up as if the game hung.
      console.error(e);
      paused = true;
      updatePauseUi();
      showOverlay(`The emulator stopped at frame ${emu.frame}:
${e.message || e}

File a bug report (Record & report) before resetting.`, true);
    }
    if (n === 16) acc = 0;
    if (n) render();
  }
  if (now - fpsT >= 500) {
    $('st-fps').textContent = `${Math.round((fpsCount * 1000) / (now - fpsT))} fps`;
    fpsCount = 0;
    fpsT = now;
    $('st-frame').textContent = `frame ${emu.frame}`;
    $('st-speed').textContent = rewinding ? '◀◀ rewind' : fastForward ? '4x ff' : `${speed}x`;
  }
  if (emu.frame % 6 === 0 || paused) updateWatches();
}

function togglePause() { paused = !paused; updatePauseUi(); }
function updatePauseUi() {
  $('b-pause').textContent = paused ? '▶ Play' : '⏸ Pause';
  $('b-pause').classList.toggle('on', paused);
  $('paused').classList.toggle('hidden', !paused);
}
function stepOnce() {
  if (!emu) return;
  paused = true;
  updatePauseUi();
  tick();
  render();
  $('st-frame').textContent = `frame ${emu.frame}`;
  updateWatches();
}

function quickSave() {
  if (!emu) return;
  quickState = { frame: emu.frame, state: emu.saveState() };
  toast(`State saved at frame ${emu.frame}`);
}
function quickLoad() {
  if (!emu || !quickState) return toast('No saved state');
  emu.loadState(quickState.state);
  emu.frame = quickState.frame;
  rewindBuf.length = 0;
  history = history.filter(([f]) => f < quickState.frame);
  while (checkpoints.length && checkpoints.at(-1).frame > quickState.frame) checkpoints.pop();
  lastMask = -1;
  render();
  toast(`State loaded (frame ${emu.frame})`);
}

function screenshotDataUrl(scale = 4) {
  const c = document.createElement('canvas');
  c.width = SCREEN_W * scale;
  c.height = SCREEN_H * scale;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}
function screenshot() {
  if (!emu) return;
  download(`dangernoodle-f${emu.frame}.png`, screenshotDataUrl());
}
// data: a Blob or a data: URL string
async function download(name, data) {
  if (backend.download) {
    // Hosted page: plain <a download> links are blocked, the viewer saves instead.
    const blob = typeof data === 'string' ? await (await fetch(data)).blob() : data;
    try { await backend.download(name, blob); } catch (e) { if (e?.code !== 'declined') toast(`Couldn't save: ${e.message || e.code}`); }
    return;
  }
  const a = document.createElement('a');
  a.href = typeof data === 'string' ? data : URL.createObjectURL(data);
  a.download = name;
  a.click();
}

// ---------------------------------------------------------------------------
// Recording, replays and bug reports
const sessionReplays = [];

function toggleRecord() {
  if (!emu) return;
  if (!recorder) {
    player = null;
    recorder = new Recorder(emu, { fromState: true });
    toast('Recording… press again to stop');
  } else {
    const replay = recorder.finish({ note: $('note').value.trim(), kind: 'recording' });
    recorder = null;
    keepReplay(replay, 'recording');
  }
  updateRecUi();
}

function bugReport() {
  if (!emu) return;
  const cp = checkpoints[0];
  const startFrame = cp ? cp.frame : 0;
  const events = history.filter(([f]) => f >= startFrame).map(([f, m]) => [f - startFrame, m]);
  if (!events.length || events[0][0] !== 0) events.unshift([0, 0]);
  const replay = {
    version: 1,
    kind: 'bug',
    rom: { title: emu.info.title, crc32: emu.info.crc32 },
    mode: emu.mode,
    length: emu.frame - startFrame,
    start_state: cp ? toBase64(cp.state) : null,
    events,
    note: $('note').value.trim() || '(no description)',
    created: new Date().toISOString(),
    end_state: toBase64(emu.saveState()),
    screenshot: screenshotDataUrl(2),
    watches: Object.fromEntries(watchList.map((w) => [w.name, safeRead(w)])),
  };
  keepReplay(replay, 'bug');
  $('note').value = '';
}

async function keepReplay(replay, kind) {
  const name = `${kind} · ${replay.length}f${replay.note ? ' · ' + replay.note : ''}`;
  const entry = { name, replay, id: null };
  sessionReplays.unshift(entry);
  renderReplays();
  try {
    entry.id = await backend.saveReplay(replay, kind);
    toast(kind === 'bug' ? `Bug report saved (${entry.id})` : `Recording saved (${entry.id})`);
  } catch (e) {
    toast(`Kept in this tab only: ${e.message}`);
  }
  renderReplays();
  refreshSavedReplays();
}

function playReplay(replay, name) {
  if (!emu) return;
  recorder = null;
  const input = prepareReplay(emu, replay);
  resetBuffers();
  player = { input, length: replay.length, name, startFrame: emu.frame };
  paused = false;
  updatePauseUi();
  updateRecUi();
  toast(`Playing "${name}" (${replay.length} frames)`);
}

let savedReplays = [];
async function refreshSavedReplays() {
  try { savedReplays = await backend.listReplays(); } catch { savedReplays = []; }
  renderReplays();
}

function renderReplays() {
  const ul = $('replays');
  ul.innerHTML = '';
  const sessionIds = new Set(sessionReplays.map((e) => e.id).filter(Boolean));
  const rows = [
    ...sessionReplays.map((e) => ({ name: e.name, get: async () => e.replay, saved: !!e.id })),
    ...savedReplays.filter((r) => !sessionIds.has(r.id)).map((r) => ({
      name: r.name || r.id, get: () => backend.getReplay(r.id), saved: true,
    })),
  ].slice(0, 40);
  for (const r of rows) {
    const li = document.createElement('li');
    const n = document.createElement('span');
    n.className = 'name';
    n.textContent = (r.saved ? '' : '◌ ') + r.name;
    n.title = r.name;
    const play = document.createElement('button');
    play.textContent = '▶';
    play.title = 'Play';
    play.onclick = async () => playReplay(await r.get(), r.name);
    const dl = document.createElement('button');
    dl.textContent = '⤓';
    dl.title = 'Download JSON';
    dl.onclick = async () => {
      const blob = new Blob([JSON.stringify(await r.get())], { type: 'application/json' });
      download(r.name.replace(/[^\w.-]+/g, '_').slice(0, 60) + '.json', blob);
    };
    li.append(n, play, dl);
    ul.append(li);
  }
}

function updateRecUi() {
  $('b-rec').textContent = recorder ? '■ Stop' : '● Record';
  $('b-rec').classList.toggle('recording', !!recorder);
  $('st-rec').classList.toggle('hidden', !recorder);
  $('st-play').classList.toggle('hidden', !player);
}

// ---------------------------------------------------------------------------
// Watches
let watchList = store.get('watches', [
  // The noodle: board positions are in tiles (src/game.h).
  { name: 'score', type: 'u16' }, { name: 'noodle_len', type: 'u8' }, { name: 'noodle_dir', type: 'u8' },
  { name: 'head_x', type: 'u8' }, { name: 'head_y', type: 'u8' }, { name: 'step_delay', type: 'u8' },
]);
function fillSymbols() {
  const dl = $('symbols');
  dl.innerHTML = '';
  for (const s of symbols.variables()) {
    const o = document.createElement('option');
    o.value = s.name.slice(1);
    o.label = '0x' + s.addr.toString(16).toUpperCase();
    dl.append(o);
  }
  renderWatches();
}
function safeRead(w) {
  try { return readTyped(emu, symbols.addr(w.name), w.type); } catch { return '?'; }
}
function renderWatches() {
  const tb = $('watches').tBodies[0];
  tb.innerHTML = '';
  watchList.forEach((w, i) => {
    const tr = document.createElement('tr');
    const s = symbols.get(w.name);
    tr.innerHTML = `<td></td><td class="muted"></td><td class="val">–</td><td class="x"><button title="Remove">✕</button></td>`;
    tr.cells[0].textContent = w.name;
    tr.cells[1].textContent = s ? `${w.type} @${s.addr.toString(16).toUpperCase()}` : `${w.type} (missing)`;
    tr.querySelector('button').onclick = () => { watchList.splice(i, 1); store.set('watches', watchList); renderWatches(); };
    tb.append(tr);
  });
  updateWatches();
}
function updateWatches() {
  if (!emu) return;
  const rows = $('watches').tBodies[0].rows;
  watchList.forEach((w, i) => { if (rows[i]) rows[i].cells[2].textContent = String(safeRead(w)); });
}
function addWatch() {
  const name = $('watch-name').value.trim().replace(/^_/, '');
  if (!name) return;
  watchList.push({ name, type: $('watch-type').value });
  store.set('watches', watchList);
  $('watch-name').value = '';
  renderWatches();
}

// ---------------------------------------------------------------------------
// UI plumbing
function setPill(text, cls = '') {
  const p = $('build-status');
  p.textContent = text;
  p.className = 'pill ' + cls;
}
function showOverlay(html, isLog = false) {
  const o = $('overlay');
  o.classList.remove('hidden');
  o.innerHTML = '';
  if (isLog) { const pre = document.createElement('pre'); pre.textContent = html; o.append(pre); }
  else o.textContent = html;
}
function hideOverlay() { $('overlay').classList.add('hidden'); }
let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
}

$('b-pause').onclick = () => { haptic(10); togglePause(); };
$('paused').onclick = () => { haptic(10); togglePause(); };
$('b-step').onclick = () => { haptic(10); stepOnce(); };
$('b-reset').onclick = () => { haptic(10); resetEmu(); };
$('sel-speed').onchange = (e) => { speed = +e.target.value; };
$('b-audio').onclick = () => { haptic(10); toggleAudio(); };
$('b-shot').onclick = () => { haptic(10); screenshot(); };
$('b-rec').onclick = () => { haptic(12); toggleRecord(); };
$('b-report').onclick = () => { haptic(12); bugReport(); };
$('b-save').onclick = () => { haptic(10); quickSave(); };
$('b-load').onclick = () => { haptic(10); quickLoad(); };
$('b-watch').onclick = addWatch;
$('watch-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') addWatch(); });
if (backend.name !== 'local') $('chk-restart').closest('.row').classList.add('hidden');
$('chk-restart').checked = store.get('restartOnBuild', true);
$('chk-restart').onchange = (e) => store.set('restartOnBuild', e.target.checked);

const mobileMq = matchMedia('(max-width: 820px)');
function syncMobilePanels(e) {
  for (const d of document.querySelectorAll('.panel details:not(#build-log-box)')) {
    if (e.matches) d.removeAttribute('open');
    else if (d.querySelector('summary')?.textContent !== 'Controls') d.setAttribute('open', '');
  }
}
syncMobilePanels(mobileMq);
mobileMq.addEventListener?.('change', syncMobilePanels);

$('file-replay').onchange = async (e) => {
  const f = e.target.files[0];
  if (f) playReplay(JSON.parse(await f.text()), f.name);
  e.target.value = '';
};
$('file-rom').onchange = async (e) => {
  const f = e.target.files[0];
  if (f) start(new Uint8Array(await f.arrayBuffer()), '', f.name);
  e.target.value = '';
};

function onBackendEvent(ev) {
  if (ev.type === 'building') setPill('building…');
  if (ev.type === 'build') {
    const box = $('build-log-box');
    if (!ev.ok) {
      setPill('build failed', 'err');
      box.classList.remove('hidden');
      $('build-log').textContent = ev.log || '';
      showOverlay(ev.log || 'build failed', true);
      return;
    }
    box.classList.toggle('hidden', !/warning/i.test(ev.log || ''));
    $('build-log').textContent = ev.log || '';
    if (!emu || ev.crc32 !== emu.info.crc32) {
      if (!emu || $('chk-restart').checked) {
        loadFromBackend().then(() => toast(`Rebuilt in ${ev.ms} ms, restarted`));
      } else {
        setPill(`new build ready (${ev.crc32}): press Reset to load`, 'ok');
        $('b-reset').onclick = () => { $('b-reset').onclick = resetEmu; loadFromBackend(); };
      }
    }
  }
}

// ---------------------------------------------------------------------------
// PWA install prompt & service worker
let deferredInstallPrompt = null;
const installBtn = $('b-install');
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBtn?.classList.remove('hidden');
});
addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installBtn?.classList.add('hidden');
  toast('Danger Noodle installed!');
});
if (installBtn) {
  installBtn.onclick = async () => {
    if (!deferredInstallPrompt) return;
    haptic(10);
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') installBtn.classList.add('hidden');
    deferredInstallPrompt = null;
  };
}
if (!window.claude && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ---------------------------------------------------------------------------
await (window.RGB_WASM ? initCore({ module_or_path: window.RGB_WASM }) : initCore());
renderWatches();
await loadFromBackend();
backend.subscribe?.(onBackendEvent);
refreshSavedReplays();
requestAnimationFrame(loop);
// Expose for debugging from the browser console / automation.
window.rgb = { get emu() { return emu; }, symbols: () => symbols, playReplay, bugReport, toggleRecord };
