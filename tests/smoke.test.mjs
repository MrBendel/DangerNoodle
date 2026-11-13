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

test('the d-pad turns it', () => {
  const emu = startGame();
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

test('the opposite way doubles it back in a hairpin, away from its body', () => {
  const emu = startGame();
  const x = emu.v('head_x'), y = emu.v('head_y');
  // Heading right, never turned: it bends up first.
  emu.tap('LEFT');
  moves(emu);
  assert.equal(emu.v('noodle_dir'), UP, 'first a step to the side');
  moves(emu);
  assert.equal(emu.v('noodle_dir'), LEFT);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [x - 1, y - 1], 'running back beside itself');
  // Again: it bends the way it went before its last turn (up), not into its body.
  emu.tap('RIGHT');
  moves(emu, 2);
  assert.equal(emu.v('noodle_dir'), RIGHT);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [x, y - 2]);
  assert.equal(emu.v('dead_timer'), 0);
});

test('a hairpin into a wall bends the other way', () => {
  const emu = startGame();
  // Up against the back wall (row 2 is the top open row), heading right.
  emu.tap('UP');
  emu.until((e) => e.v('head_y') === 2, 300, 'the top row');
  emu.tap('RIGHT');
  moves(emu);
  const x = emu.v('head_x');
  emu.tap('LEFT');
  moves(emu, 2);
  assert.equal(emu.v('noodle_dir'), LEFT);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [x - 1, 3]);
  assert.equal(emu.v('dead_timer'), 0);
});

test('a one-screen room is 8x7 blocks and fills the playfield', () => {
  const emu = startGame();
  assert.deepEqual([emu.v('room_bw'), emu.v('room_bh')], [8, 7]);
  assert.deepEqual([emu.v('room_tw'), emu.v('room_th')], [20, 17], '16 px back and side walls, an 8 px near wall');
  assert.deepEqual([emu.v('room_x1'), emu.v('room_y1')], [17, 15], 'the last open column and row');
  moves(emu, 5);
  assert.deepEqual([emu.v('scroll_x'), emu.v('scroll_y')], [0, 0], 'it never scrolls');
});

test('a bigger room scrolls after the head, looking ahead', () => {
  const emu = startGame(undefined, 4242, 1);
  assert.deepEqual([emu.v('room_tw'), emu.v('room_th')], [32, 27]);
  // The head starts near the top-left corner: the view is there too, already
  // looking a little ahead (right).
  assert.deepEqual([emu.v('scroll_x'), emu.v('scroll_y')], [7 * 8 + 4 - 80 + 24, 0]);
  // Heading right across the room, the view follows with the head left of centre.
  emu.until((e) => e.v('head_x') === 18, 300, 'the middle of the room');
  emu.idle(20);
  const sx = emu.v('scroll_x');
  const onScreen = emu.v('head_x') * 8 - sx;
  assert.ok(sx > 0, 'scrolled right');
  assert.ok(onScreen >= 40 && onScreen < 80, `head at screen x ${onScreen}: behind centre, room to see ahead`);
  // Down to the bottom row, then right to the last column: the view scrolls
  // down and right, and stops at the room's edges.
  emu.tap('DOWN');
  emu.until((e) => e.v('head_y') === emu.v('room_y1'), 300, 'the bottom row');
  emu.tap('RIGHT');
  emu.until((e) => e.v('head_x') === emu.v('room_x1'), 300, 'the last column');
  assert.equal(emu.v('dead_timer'), 0);
  assert.equal(emu.v('scroll_y'), 27 * 8 - 136, 'the near wall at the bottom of the view');
  assert.equal(emu.v('scroll_x'), 32 * 8 - 160, 'the right wall at the right of the view');
});

test('screen: a bigger room, scrolled', () => {
  const emu = startGame(undefined, 4242, 1);
  emu.tap('DOWN');
  moves(emu, 8);
  matchGolden(emu.idle(30), 'play-big-room');
});

test('eating grows the noodle and scores', () => {
  const emu = startGame();
  // Put the food right in front of the head.
  emu.write8(emu.symbols.addr('food_x'), emu.v('head_x') + 1);
  emu.write8(emu.symbols.addr('food_y'), emu.v('head_y'));
  moves(emu);
  assert.equal(emu.v('score', 'u16'), 1);
  assert.equal(emu.v('noodle_len'), 4);
  assert.notDeepEqual([emu.v('food_x'), emu.v('food_y')], [emu.v('head_x'), emu.v('head_y')], 'new food somewhere else');
});

/** Eat n times: food put right in front of the head before each move. */
function grow(emu, n) {
  for (let i = 0; i < n; i++) {
    emu.write8(emu.symbols.addr('food_x'), emu.v('head_x') + 1);
    emu.write8(emu.symbols.addr('food_y'), emu.v('head_y'));
    moves(emu);
  }
  return emu;
}

/** Tap a turn, then make n moves. */
const turn = (emu, dir, n = 1) => moves(emu.tap(dir), n);

test('each move is an eased step on a beat, then a rest', () => {
  const emu = startGame();
  moves(emu);
  // The head sprite's x (shadow OAM, sprite 0) on each frame until the next move.
  const oamX = () => emu.read8(emu.symbols.addr('shadow_OAM') + 1);
  const xs = [oamX()];
  const x0 = emu.v('head_x');
  while (emu.v('head_x') === x0) xs.push(emu.idle(1) && oamX());
  xs.pop();  // the frame of the next move
  const deltas = xs.slice(1).map((x, i) => x - xs[i]);
  assert.ok(deltas.every((d) => d >= 0) && xs.at(-1) - xs[0] <= 8, `forward, at most a cell: ${xs}`);
  const moving = deltas.filter((d) => d > 0);
  assert.ok(moving.length <= 6, `the step takes a few frames: ${xs}`);
  assert.ok(deltas.slice(-6).every((d) => d === 0), `then a rest: ${xs}`);
  assert.ok(Math.max(...moving) > moving[0] && Math.max(...moving) > moving.at(-1), `eased in and out: ${xs}`);
});

test('round a bend, the head starts half out of it', () => {
  const emu = startGame();
  const oam = emu.symbols.addr('shadow_OAM');
  moves(emu.tap('UP'), 2);
  const bendX = emu.v('head_x') * 8;
  moves(emu.tap('RIGHT'));
  const x = emu.read8(oam + 1) - 8;
  assert.ok(x - bendX >= 4, `head ${x - bendX} px out of the bend cell`);
});

test('the head sprite sits on its cell, whichever way it faces', () => {
  const emu = startGame();
  const oam = emu.symbols.addr('shadow_OAM');
  for (const dir of ['UP', 'LEFT', 'DOWN', 'RIGHT']) {
    moves(emu.tap(dir), 2);
    emu.until((e) => e.v('slide_k') === e.v('step_delay'), 30, 'the end of a slide');
    const at = [emu.read8(oam + 1) - 8, emu.read8(oam) - 16];
    assert.deepEqual(at, [emu.v('head_x') * 8, emu.v('head_y') * 8], `facing ${dir}`);
  }
});

test('running into its own body parks it until a turn leads out', () => {
  const emu = grow(startGame(), 3);  // 6 long, heading right
  turn(emu, 'DOWN');
  turn(emu, 'LEFT');
  emu.tap('UP');  // straight up into its own body
  emu.until((e) => e.v('noodle_parked'), 30, 'parking');
  const at = [emu.v('head_x'), emu.v('head_y')];
  emu.idle(60);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], at, 'it waits');
  assert.equal(emu.v('dead_timer'), 0);
  assert.equal(emu.v('noodle_len'), 6);
  // A turn somewhere open goes at once.
  emu.tap('LEFT').idle(1);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [at[0] - 1, at[1]]);
  assert.equal(emu.v('noodle_parked'), 0);
});

test('parked with no way out is a crash', () => {
  const emu = grow(startGame(), 6);  // 9 long, heading right
  // Coil into a pocket walled by its own body: down 2, left 2, up 1, right 1.
  turn(emu, 'DOWN', 2);
  turn(emu, 'LEFT', 2);
  turn(emu, 'UP');
  emu.tap('RIGHT');
  emu.until((e) => e.v('dead_timer'), 30, 'the crash');
});

test('hitting a wall ends the game; START goes back to the title', () => {
  const emu = startGame();
  emu.until((e) => e.v('dead_timer'), 300, 'the crash');
  assert.equal(emu.v('head_x'), 17, 'crashed at the right wall (columns 18-19 are the wall)');
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

test('screen: corners (every bend has its divider on the tail side)', () => {
  const emu = grow(startGame(), 6);
  turn(emu, 'DOWN', 2);
  turn(emu, 'LEFT', 2);
  turn(emu, 'DOWN', 2);
  turn(emu, 'RIGHT');
  matchGolden(emu.idle(10), 'play-corners');
});

// Room 1's shape (src/room.c): a ring of 8 stones, cells (12-14, 4-6) less the
// middle. Its door: the back wall's cells 14 and 15.
function coilTheRing() {
  const emu = grow(startGame(undefined, 4242, 1), 5);  // 8 long, head at (12, 8)
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [12, 8]);
  turn(emu, 'UP', 4);
  turn(emu, 'RIGHT', 2);
  turn(emu, 'DOWN', 2);
  assert.equal(emu.v('sw_cover'), 7);
  assert.equal(emu.v('door_open'), 0, 'not yet: one stone left');
  turn(emu, 'LEFT');
  return emu;
}

test('covering every stone of the shape at once opens the door', () => {
  const emu = coilTheRing();
  assert.equal(emu.v('sw_cover'), 8);
  assert.equal(emu.v('door_open'), 1);
  matchGolden(emu.idle(10), 'play-shape-made');
  // It stays open as the body moves off the stones.
  turn(emu, 'DOWN');
  assert.equal(emu.v('sw_cover'), 7);
  assert.equal(emu.v('door_open'), 1);
});

test('the shut door is a wall; through the open one is the next room, the score kept', () => {
  const shut = startGame(undefined, 4242, 1);
  turn(shut, 'UP');
  shut.until((e) => e.v('dead_timer'), 300, 'the crash into the shut door');
  assert.ok(shut.v('head_x') !== 14 || shut.v('head_y') !== 1);

  const emu = coilTheRing();
  turn(emu, 'DOWN');
  turn(emu, 'RIGHT', 2);  // (15, 7), under the door's right half
  turn(emu, 'UP', 6);
  assert.deepEqual([emu.v('head_x'), emu.v('head_y')], [15, 1]);
  emu.until((e) => e.v('in_transition'), 60, 'the next room');
  settle(emu, PLAY, 'the next room');
  assert.equal(emu.v('room_id'), 2, 'the next room');
  assert.equal(emu.v('score', 'u16'), 5);
  assert.equal(emu.v('noodle_len'), 3);
  assert.equal(emu.v('door_open'), 0);
  assert.equal(emu.v('dead_timer'), 0);
  matchGolden(emu, 'play-next-room');
});

// --- The demo rooms (src/room.c), each solved along a planned path. ---
const SFX_WRONG = 6, SFX_BITE = 8;
const room = (n) => startGame(undefined, 4242, n);
/** Follow a path: [dir, moves] pairs. */
const path = (emu, steps) => {
  for (const [d, n] of steps) turn(emu, d, n);
  return emu;
};
const doorOpens = (emu) => {
  emu.idle(1);  // switches settle each frame
  assert.equal(emu.v('door_open'), 1, 'the door opens');
  assert.equal(emu.v('dead_timer'), 0);
};

test('LEFT and RIGHT on the title pick the room; SELECT skips to the next', () => {
  const emu = bootToTitle();
  emu.write8(emu.symbols.addr('room_id'), 0);
  emu.tap('RIGHT').tap('RIGHT');
  assert.equal(emu.v('room_id'), 2);
  emu.tap('LEFT').tap('LEFT').tap('LEFT');
  assert.equal(emu.v('room_id'), 9, 'it wraps round');
  matchGolden(emu.idle(2), 'title-room-pick');
  const play = room(3);
  play.tap('SELECT');
  settle(play, PLAY, 'the next room');
  assert.equal(play.v('room_id'), 4);
});

test('room 3, two buttons: each stays down once pressed', () => {
  const emu = path(room(2), [['UP', 3], ['LEFT', 2]]);  // (5, 5)
  emu.idle(1);
  assert.equal(emu.v('sw_down'), 1);
  path(emu, [['DOWN', 7], ['RIGHT', 9]]);  // (14, 12)
  doorOpens(emu);
});

test('room 4, four corners: all four held at once', () => {
  const emu = path(room(3), [['RIGHT', 2], ['UP', 7], ['RIGHT', 3], ['DOWN', 2]]);
  emu.idle(1);
  assert.equal(emu.v('door_open'), 0, 'three of four');
  turn(emu, 'DOWN');  // a U through the four, 10 long
  assert.equal(emu.v('noodle_len'), 10);
  doorOpens(emu);
  matchGolden(emu.idle(30), 'room-four-corners');
});

test('room 5, heavy buttons: fold over each to cover all four cells', () => {
  const emu = path(room(4), [['UP', 4], ['LEFT', 1]]);
  emu.idle(1);
  assert.equal(emu.v('sw_down'), 0, 'three cells are not enough');
  turn(emu, 'DOWN');
  emu.idle(1);
  assert.equal(emu.v('sw_down'), 1);
  path(emu, [['DOWN', 5], ['RIGHT', 7], ['DOWN', 1], ['LEFT', 1]]);
  doorOpens(emu);
});

test('room 6, quick steps: timed buttons stay down a while', () => {
  const emu = path(room(5), [['RIGHT', 6], ['UP', 2]]);  // the third button
  path(emu, [['UP', 4], ['LEFT', 3], ['LEFT', 4], ['UP', 3]]);
  doorOpens(emu);
});

test('room 7, in order: out of turn they all pop up', () => {
  const emu = path(room(6), [['RIGHT', 5], ['DOWN', 4]]);  // "3" first
  emu.idle(1);
  assert.equal(emu.v('sfx_last'), SFX_WRONG);
  assert.equal(emu.v('sw_next'), 1);
  path(emu, [['DOWN', 1], ['LEFT', 2], ['UP', 9], ['RIGHT', 2]]);  // "1"
  emu.idle(1);
  assert.equal(emu.v('sw_next'), 2);
  path(emu, [['DOWN', 6], ['LEFT', 7]]);  // "2"
  emu.idle(1);
  assert.equal(emu.v('sw_next'), 3);
  path(emu, [['DOWN', 2], ['RIGHT', 7]]);  // "3"
  doorOpens(emu);
});

test('room 8, head and tail: the length has to match the gap', () => {
  const emu = path(room(7), [['UP', 4], ['RIGHT', 8]]);  // head (13, 8): not yet
  emu.idle(1);
  assert.equal(emu.v('door_open'), 0);
  turn(emu, 'RIGHT');
  doorOpens(emu);
});

/** Room 9's beetle, held still (its step and bite clocks wound back). */
const pin = (emu) => {
  emu.write8(emu.symbols.addr('en_timer'), 200);
  emu.write8(emu.symbols.addr('en_bite'), 200);
  return emu;
};
const pinnedPath = (emu, steps) => {
  for (const [d, n] of steps) {
    emu.tap(d);
    for (let i = 0; i < n; i++) moves(pin(emu));
  }
  return emu;
};

test('room 9: coil the beetle to crack it, then eat it', () => {
  const emu = pin(room(8));
  assert.deepEqual([emu.v('en_cx'), emu.v('en_cy')], [12, 6]);
  pinnedPath(emu, [['RIGHT', 4], ['UP', 3], ['RIGHT', 3], ['DOWN', 3]]);
  assert.equal(emu.v('en_state'), 1, 'armored');
  pinnedPath(emu, [['LEFT', 2]]);  // the ring closes, 12 long
  assert.equal(emu.v('noodle_len'), 12);
  assert.equal(emu.v('en_state'), 2, 'cracked');
  matchGolden(emu.idle(4), 'room-beetle-cracked');
  turn(emu, 'UP');  // into it
  assert.equal(emu.v('en_state'), 0, 'eaten');
  assert.equal(emu.v('score', 'u16'), 5);
  doorOpens(emu);
});

test('room 9: the beetle bites a segment off when you are next to it', () => {
  const emu = pin(room(8));
  pinnedPath(emu, [['RIGHT', 4], ['UP', 1]]);  // (11, 7), beside it
  emu.write8(emu.symbols.addr('grow_pending'), 0);
  const len = emu.v('noodle_len');
  emu.write8(emu.symbols.addr('en_bite'), 2);
  emu.idle(3);
  assert.equal(emu.v('noodle_len'), len - 1);
  assert.equal(emu.v('sfx_last'), SFX_BITE);
});
