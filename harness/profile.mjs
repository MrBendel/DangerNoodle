// CPU profiler: runs a scenario and shows, for the most expensive frames, which
// functions the cycles went to (sampling the program counter on every instruction).
// Carried over from RogueGB; its scenarios are Danger Noodle's.
//   node harness/profile.mjs play     start a game and steer the noodle around
//   node harness/profile.mjs title    sit on the title screen
//   --top=N   functions listed per frame (7 by default)
// Functions without an exported symbol (static C functions, asm local labels) are
// counted under the nearest symbol before them.
import fs from 'node:fs';
import { loadRom, DEFAULT_ROM } from './node.mjs';
const emu = loadRom();
// Symbols for bank 0 (0x0000-0x3FFF) and the switchable banks (0x4000-0x7FFF,
// which the .noi lists as bank << 16 | address).
const syms = fs.readFileSync(DEFAULT_ROM.replace(/\.gb$/, '.noi'), 'utf8').split(/\r?\n/).map((l) => /^DEF (\S+) 0x([0-9A-F]+)/i.exec(l)).filter(Boolean)
  .map((m) => ({ name: m[1], addr: parseInt(m[2], 16) }))
  .filter((s) => (s.addr & 0xFFFF) < 0x8000 && !/^_rR[AO]M/.test(s.name) && (/^[_.][A-Za-z_]/.test(s.name) || /^F[a-z_]+\$/.test(s.name)))
  .sort((a, b) => a.addr - b.addr);
const fnAt = (key) => { let lo = 0, hi = syms.length - 1, best = '?'; while (lo <= hi) { const mid = (lo + hi) >> 1; if (syms[mid].addr <= key) { best = syms[mid].name; lo = mid + 1; } else hi = mid - 1; } return best.replace(/\$0\$0$/, ''); };
// In 0x4000-0x7FFF, which code it is depends on the bank switched in.
const fn = (pc) => fnAt(pc >= 0x4000 && pc < 0x8000 ? (emu.read8(0xFF90) << 16) | pc : pc);
const m = { RIGHT: 1, LEFT: 2, UP: 4, DOWN: 8, A: 16, B: 32, SELECT: 64, START: 128 };
const mask = (s) => s.split('+').filter(Boolean).reduce((a, d) => a | m[d], 0);
const step = (b, n = 1) => { emu.setButtons(mask(b)); emu.run(n); };
const scenario = process.argv[2] || 'play';
const topN = Number((process.argv.find((a) => a.startsWith('--top=')) || '--top=7').slice(6));

step('', 30);
let plan;
if (scenario === 'title') plan = Array(300).fill('');
else {
  step('START'); step('', 40);  // into play
  // A slow square spiral: right, down, left, up, so the noodle stays on the board.
  const legs = ['RIGHT', 'DOWN', 'LEFT', 'UP'];
  plan = Array.from({ length: 600 }, (_, f) => legs[Math.floor(f / 40) % 4]);
}

const vs = emu.symbols.addr('vsync');
const frames = [];
plan.forEach((b, idx) => {
  emu.setButtons(mask(b));
  emu.gb.next_frame();
  const h = new Map(); let cyc = 0, r = emu.gb.registers(), pc = r.pc; r.free();
  while ((pc < vs || pc >= vs + 0x10) && cyc < 200000) { const c = emu.gb.clock(); cyc += c; const k = fn(pc); h.set(k, (h.get(k) || 0) + c); r = emu.gb.registers(); pc = r.pc; r.free(); }
  frames.push({ idx, b, cyc, at: `state ${emu.read8(emu.symbols.addr('game_state'))}`, top: [...h.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, topN).map(([k, c]) => `${k}:${c}`) });
  emu.frame++; emu._snap = null;
});
const sorted = [...frames].sort((a, b) => b.cyc - a.cyc);
for (const f of sorted.slice(0, 3)) console.log(f.idx, f.b, f.cyc, f.at, '\n    ' + f.top.join('\n    '));
const med = [...frames].sort((a, b) => a.cyc - b.cyc)[frames.length >> 1];
const BUDGET = 131328;  // a Color frame at double speed (140,448) less vblank: see README, Frame budget
console.log(`frames over budget (${BUDGET}): ${frames.filter((f) => f.cyc > BUDGET).length} of ${frames.length}`);
console.log('median frame', med.cyc, '\n    ' + med.top.join('\n    '));
