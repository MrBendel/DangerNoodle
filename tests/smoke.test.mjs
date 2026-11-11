// The game shell (title -> play -> game over -> title) and the placeholder
// noodle game. Keep at least "boots" and one golden screen per major screen.
import { test } from 'node:test';
import {
  assert, matchGolden, settle, bootToTitle, startGame, moves, FRAME_LIMIT,
  TITLE, PLAY, GAME_OVER, RIGHT, LEFT, UP, DOWN,
} from './helpers.mjs';

test('boots to the title screen and runs one loop per frame', () => {
  const emu = bootToTitle();
  const f0 = emu.v('frame_count', 'u16');
  emu.run(60);
  const fc = emu.v('frame_count', 'u16') - f0;
  // One game loop per frame: a slowdown or a hang shows up here.
  assert.ok(fc >= 59 && fc <= 61, `frame_count advanced ${fc} in 60 frames`);
});

test('the title waits for START', () => {
  const emu = bootToTitle().hold('RIGHT+UP+B+SELECT', 60).idle(5);
  assert.equal(emu.v('game_state'), TITLE);
});

test('START begins a game seeded by press timing', () => {
  const play = (wait) => settle(bootToTitle().idle(wait).tap('START'), PLAY, 'play state');
  const a = play(10), b = play(37);
  assert.notEqual(a.v('game_seed', 'u16'), b.v('game_seed', 'u16'));
  // Same timing, same seed: replays reproduce games.
  assert.equal(play(10).v('game_seed', 'u16'), a.v('game_seed', 'u16'));
});

test('the noodle starts 3 long heading right, and keeps moving on its own', () => {
  const emu = startGame();
  assert.equal(emu.v('noodle_len'), 3);
  assert.equal(emu.v('noodle_dir'), RIGHT);
  const x0 = emu.v('head_x');
  moves(emu, 3);
  assert.equal(emu.v('head_x'), x0 + 3);
});

test('the d-pad turns it, but never straight back on itself', () => {
  const emu = startGame();
  emu.tap('LEFT');
  moves(emu);
  assert.equal(emu.v('noodle_dir'), RIGHT, 'a reverse is ignored');
  emu.tap('DOWN');
  moves(emu);
  assert.equal(emu.v('noodle_dir'), DOWN);
  // Two quick turns between moves both happen: DOWN -> LEFT -> UP is a U-turn.
  const y = emu.v('head_y');
  emu.tap('LEFT').tap('UP');
  moves(emu, 2);
  assert.equal(emu.v('noodle_dir'), UP);
  assert.equal(emu.v('head_y'), y - 1);
});

test('eating grows the noodle and scores', () => {
  const emu = startGame();
  // Put the food right in front of the head.
  emu.write8(emu.symbols.addr('food_x'), emu.v('head_x') + 1);
  emu.write8(emu.symbols.addr('food_y'), emu.v('head_y'));
  moves(emu);
  assert.equal(emu.v('score', 'u16'), 1);
  assert.equal(emu.v('noodle_len'), 4);
  assert.notEqual(emu.v('food_x'), emu.v('head_x'), 'new food somewhere else');
});

test('hitting a wall ends the game; START goes back to the title', () => {
  const emu = startGame();
  emu.until((e) => e.v('dead_timer'), 300, 'the crash');
  assert.equal(emu.v('head_x'), 8, 'crashed at the right wall (block 9 is the wall)');
  settle(emu, GAME_OVER, 'game over screen');
  emu.tap('START');
  assert.equal(emu.v('next_state'), GAME_OVER, 'input is ignored for a moment');
  emu.idle(30).tap('START');
  settle(emu, TITLE, 'title screen');
});

test('START pauses and resumes', () => {
  const emu = startGame().tap('START');
  assert.equal(emu.v('paused'), 1);
  const x = emu.v('head_x');
  emu.idle(60);
  assert.equal(emu.v('head_x'), x, 'frozen while paused');
  emu.tap('START');
  assert.equal(emu.v('paused'), 0);
  moves(emu);
  assert.equal(emu.v('head_x'), x + 1);
});

test('a game fits the frame budget', () => {
  const emu = startGame();
  let worst = 0;
  const legs = ['DOWN', 'LEFT', 'UP', 'RIGHT'];
  for (let f = 0; f < 400; f++) {
    emu.hold(f % 30 === 0 ? legs[(f / 30) % 4] : [], 1);
    worst = Math.max(worst, emu.lastFrameCycles);
  }
  assert.ok(worst < FRAME_LIMIT / 2, `worst frame ${worst} cycles`);
});

test('screen: title', () => {
  matchGolden(bootToTitle().idle(10), 'title');
});

test('screen: play', () => {
  matchGolden(moves(startGame(), 2).idle(1), 'play');
});

test('screen: paused', () => {
  matchGolden(startGame().idle(10).tap('START').idle(5), 'paused');
});

test('screen: game over', () => {
  const emu = startGame();
  emu.until((e) => e.v('dead_timer'), 300, 'the crash');
  matchGolden(settle(emu, GAME_OVER, 'game over screen'), 'game-over');
});
