// Shared helpers for ROM tests (node:test). Each test boots a fresh emulator.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {
  loadRom, saveScreenshot, readTyped, parseInputScript, replayInput, prepareReplay, maskFromNames, ROOT,
} from '../harness/node.mjs';

export { assert, ROOT };
const GOLDENS = path.join(ROOT, 'tests', 'goldens.json');
const OUT = path.join(ROOT, 'build', 'test-output');

/** Fresh emulator with convenience methods for tests. */
export function boot(opts = {}) {
  const emu = loadRom(opts.rom, opts);
  return Object.assign(emu, {
    /** Read a global C variable by name. type: u8|i8|u16|i16|bool */
    v(name, type = 'u8') {
      return readTyped(emu, emu.symbols.addr(name), type);
    },
    /** Hold buttons ("RIGHT+A", or [] for none) for n frames. */
    hold(buttons, n = 1) {
      const names = Array.isArray(buttons) ? buttons : String(buttons).split('+');
      emu.setButtons(maskFromNames(names));
      emu.run(n);
      return emu;
    },
    /** Release all buttons and wait n frames. */
    idle(n = 1) {
      emu.setButtons(0);
      emu.run(n);
      return emu;
    },
    /** Tap buttons for one frame, then release for one frame. */
    tap(buttons) {
      return emu.hold(buttons, 1).idle(1);
    },
    /** Play an input script like "0-60:RIGHT 30:A 31:-". */
    play(script, frames) {
      const input = replayInput({ events: parseInputScript(script) });
      const end = frames ?? parseInputScript(script).at(-1)[0] + 1;
      for (let f = 0; f < end; f++) {
        emu.setButtons(input(f));
        emu.step();
      }
      return emu;
    },
    /** Play a replay JSON file (from the playtest page) to the end. */
    replay(file) {
      const r = JSON.parse(fs.readFileSync(path.resolve(ROOT, file), 'utf8'));
      const input = prepareReplay(emu, r);
      for (let f = 0; f < r.length; f++) {
        emu.setButtons(input(f));
        emu.step();
      }
      return emu;
    },
    /** Run until predicate(emu) is true; fails after maxFrames. */
    until(pred, maxFrames = 600, what = 'condition') {
      for (let i = 0; i < maxFrames; i++) {
        if (pred(emu)) return emu;
        emu.step();
      }
      assert.fail(`timed out after ${maxFrames} frames waiting for ${what}`);
    },
    shot(name) {
      return saveScreenshot(emu, path.join(OUT, `${name}.png`));
    },
  });
}

const readGoldens = () => (fs.existsSync(GOLDENS) ? JSON.parse(fs.readFileSync(GOLDENS, 'utf8')) : {});

/**
 * Update one entry of goldens.json. Test files run in parallel processes, so the
 * read-modify-write holds a lock (a directory, created atomically); without it,
 * two files updating at once could each write back the other's old entries.
 */
function writeGolden(name, hash) {
  const lock = GOLDENS + '.lock';
  const pause = new Int32Array(new SharedArrayBuffer(4));
  for (let tries = 0; ; tries++) {
    try {
      fs.mkdirSync(lock);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (tries > 2000) throw new Error(`${lock} has been held for over 10 s; delete it if no tests are running`);
      Atomics.wait(pause, 0, 0, 5);
    }
  }
  try {
    const goldens = readGoldens();
    goldens[name] = hash;
    fs.writeFileSync(GOLDENS, JSON.stringify(goldens, null, 2) + '\n');
  } finally {
    fs.rmdirSync(lock);
  }
}

/**
 * Screen regression check. Compares a hash of the current frame against
 * tests/goldens.json. Run with UPDATE_GOLDENS=1 to accept new output.
 * A PNG of the current frame is always written to build/test-output/.
 */
export function matchGolden(emu, name) {
  const goldens = readGoldens();
  const hash = emu.frameHash();
  const png = emu.shot(name);
  if (process.env.UPDATE_GOLDENS || !(name in goldens)) {
    writeGolden(name, hash);
    return;
  }
  assert.equal(hash, goldens[name], `screen "${name}" changed; see ${path.relative(ROOT, png)} (UPDATE_GOLDENS=1 to accept)`);
}

// The CPU budget (Game Boy Color, double speed): a frame is 140,448 CPU cycles,
// and emu.lastFrameCycles counts from the end of vblank (9,120 of them), so an
// update that runs past FRAME_LIMIT misses the next frame. See README, Frame budget.
export const FRAME_CYCLES = 140448;
export const FRAME_LIMIT = FRAME_CYCLES - 9120;  // 131,328

// Scene IDs, must match src/state.h.
export const TITLE = 0, PLAY = 1, GAME_OVER = 2;
// Directions, must match src/game.h.
export const RIGHT = 0, LEFT = 1, UP = 2, DOWN = 3;

/** Run until the given scene is active and its fade-in has finished. */
export function settle(emu, state, what = `state ${state}`) {
  // frame_count > 0: before boot code runs, RAM reads as zeros (= TITLE, settled).
  return emu.until(
    (e) => e.v('frame_count', 'u16') > 0 && e.v('game_state') === state && !e.v('in_transition'),
    300,
    what,
  );
}

export function bootToTitle() {
  return settle(boot(), TITLE, 'title screen');
}

/** From the title, START a game on a fixed seed (so food lands in the same places). */
export function startGame(emu = bootToTitle(), seed = 4242) {
  emu.writeBytes(emu.symbols.addr('test_seed'), [seed & 255, seed >> 8]);
  return settle(emu.tap('START'), PLAY, 'play state');
}

/** Run until the noodle has made `n` more moves. */
export function moves(emu, n = 1) {
  for (let i = 0; i < n; i++) {
    const at = [emu.v('head_x'), emu.v('head_y')];
    emu.until((e) => e.v('dead_timer') || e.v('head_x') !== at[0] || e.v('head_y') !== at[1], 30, 'a move');
  }
  return emu;
}
