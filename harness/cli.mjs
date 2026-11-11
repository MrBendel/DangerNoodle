#!/usr/bin/env node
// Headless runner for Danger Noodle ROMs.
//
//   node harness/cli.mjs run   [rom] [options]   run frames, apply input, capture output
//   node harness/cli.mjs info  [rom]             ROM header + symbol summary
//   node harness/cli.mjs vars  [rom]             list watchable RAM variables
//
// Run options:
//   --frames N            frames to run (default: replay length, else 300)
//   --input "SCRIPT"      inline input, e.g. "30:START 31:- 60-180:RIGHT 90-92:RIGHT+A"
//   --replay FILE         replay JSON exported from the playtest page
//   --mode auto|dmg|cgb   hardware mode (default: from ROM header)
//   --watch LIST          comma list of name[:type], type = u8|i8|u16|i16|bool
//   --trace N             print watched values every N frames
//   --shot FILE           save final screen as PNG
//   --shots-every N       also save a PNG every N frames (into --out)
//   --out DIR             output dir for periodic shots (default build/shots)
//   --state-in FILE       start from a BESS save state
//   --state-out FILE      write a BESS save state at the end
//   --record FILE         write the input actually used as a replay JSON
//   --json                print the summary as JSON
import fs from 'node:fs';
import path from 'node:path';
import {
  loadRom, saveScreenshot, DEFAULT_ROM, ROOT,
  Recorder, prepareReplay, compareState, fromBase64, parseInputScript, replayInput, readTyped, namesFromMask,
} from './node.mjs';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

function parseWatches(emu, spec) {
  if (!spec) return [];
  return String(spec).split(',').filter(Boolean).map((w) => {
    const [name, type = 'u8'] = w.split(':');
    return { name, type, addr: emu.symbols.addr(name) };
  });
}

function readWatches(emu, watches) {
  const out = {};
  for (const w of watches) out[w.name] = readTyped(emu, w.addr, w.type);
  return out;
}

const hex = (n, w = 4) => '0x' + n.toString(16).toUpperCase().padStart(w, '0');

function cmdInfo(args) {
  const emu = loadRom(args._[1] || DEFAULT_ROM, { mode: args.mode || 'auto' });
  const vars = emu.symbols.variables();
  const summary = { rom: path.relative(ROOT, emu.romPath), ...emu.info, mode: emu.mode, symbols: emu.symbols.map.size, ramVariables: vars.length };
  console.log(args.json ? JSON.stringify(summary, null, 2) : Object.entries(summary).map(([k, v]) => `${k.padEnd(13)} ${v}`).join('\n'));
}

function cmdVars(args) {
  const emu = loadRom(args._[1] || DEFAULT_ROM, { mode: args.mode || 'auto' });
  const vars = emu.symbols.variables();
  if (args.json) return console.log(JSON.stringify(vars.map((v) => ({ name: v.name.slice(1), addr: hex(v.addr) }))));
  if (!vars.length) console.log('No RAM variables found. Build with symbols (tools/build.mjs does this) and make variables global.');
  for (const v of vars) console.log(`${hex(v.addr)}  ${v.name.slice(1)}`);
}

function cmdRun(args) {
  const romPath = args._[1] || DEFAULT_ROM;
  const emu = loadRom(romPath, { mode: args.mode || 'auto' });
  let input = () => 0;
  let replay = null;
  let frames = args.frames ? parseInt(args.frames, 10) : null;

  if (args.replay) {
    replay = JSON.parse(fs.readFileSync(args.replay, 'utf8'));
    input = prepareReplay(emu, replay);
    frames ??= replay.length;
  } else {
    if (args['state-in']) emu.loadState(new Uint8Array(fs.readFileSync(args['state-in'])));
    if (args.input) {
      const events = parseInputScript(args.input);
      input = replayInput({ events });
      frames ??= Math.max(300, events[events.length - 1][0] + 60);
    }
  }
  frames ??= 300;

  const watches = parseWatches(emu, args.watch);
  const trace = args.trace ? parseInt(args.trace, 10) : 0;
  const every = args['shots-every'] ? parseInt(args['shots-every'], 10) : 0;
  const outDir = args.out || path.join(ROOT, 'build', 'shots');
  const rec = args.record ? new Recorder(emu) : null;
  const traceRows = [];
  const shots = [];

  const t0 = performance.now();
  for (let f = 0; f < frames; f++) {
    const mask = input(f);
    rec?.sample(mask);
    emu.setButtons(mask);
    emu.step();
    if (trace && (f + 1) % trace === 0) {
      const row = { frame: f + 1, buttons: namesFromMask(mask).join('+') || '-', ...readWatches(emu, watches) };
      traceRows.push(row);
      if (!args.json) console.log(Object.entries(row).map(([k, v]) => `${k}=${v}`).join(' '));
    }
    if (every && (f + 1) % every === 0) {
      shots.push(saveScreenshot(emu, path.join(outDir, `frame_${String(f + 1).padStart(6, '0')}.png`)));
    }
  }
  const ms = performance.now() - t0;

  if (args.shot) shots.push(saveScreenshot(emu, args.shot));
  if (args['state-out']) fs.writeFileSync(args['state-out'], emu.saveState());
  if (rec) fs.writeFileSync(args.record, JSON.stringify(rec.finish(), null, 1));

  // Bug reports carry the browser's end state: check the replay reproduced it.
  let verify = null;
  if (replay?.end_state && frames === replay.length) verify = compareState(emu, fromBase64(replay.end_state));

  const regs = emu.registers();
  const summary = {
    rom: emu.info.title, crc32: emu.info.crc32, mode: emu.mode,
    frames, ms: Math.round(ms), speedup: +((frames / 59.73) / (ms / 1000)).toFixed(1),
    pc: hex(regs.pc), sp: hex(regs.sp), frameHash: emu.frameHash(),
    watches: readWatches(emu, watches),
    shots: shots.map((s) => path.relative(process.cwd(), s)),
    ...(replay ? { note: replay.note || '', reproduced: verify ? verify.match : null, diffs: verify?.diffs } : {}),
  };
  if (args.json) console.log(JSON.stringify({ ...summary, trace: traceRows }, null, 2));
  else {
    console.log(`ran ${frames} frames of "${summary.rom}" (${summary.mode}) in ${summary.ms} ms (${summary.speedup}x realtime)`);
    console.log(`pc=${summary.pc} sp=${summary.sp} frame=${summary.frameHash}`);
    if (replay?.note) console.log(`note: ${replay.note}`);
    if (verify) console.log(verify.match ? 'reproduced: yes (matches the end state saved by the playtest page)' : `reproduced: NO\n  ${verify.diffs.join('\n  ')}`);
    if (watches.length) console.log('watch: ' + Object.entries(summary.watches).map(([k, v]) => `${k}=${v}`).join(' '));
    for (const s of summary.shots.slice(-3)) console.log('shot: ' + s);
    if (summary.shots.length > 3) console.log(`(${summary.shots.length} shots total)`);
  }
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0] || 'help';
try {
  if (cmd === 'run') cmdRun(args);
  else if (cmd === 'info') cmdInfo(args);
  else if (cmd === 'vars') cmdVars(args);
  else {
    const src = fs.readFileSync(new URL(import.meta.url), 'utf8');
    console.log(src.split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  }
} catch (e) {
  console.error('error: ' + e.message);
  process.exit(1);
}
