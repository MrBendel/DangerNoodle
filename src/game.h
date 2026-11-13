// The current game (play.c): the noodle, its food and the score. Watchable
// globals, for the tests and the playtest page.
#ifndef GAME_H
#define GAME_H

#include <stdint.h>

// Rooms (room.c), seen from a little above and in front. Two grids share a room:
//   - cells: 8x8, the noodle's grid (and its food). Positions below are in cells,
//     which are also background map tiles: (0, 0) is the room's top-left.
//   - blocks: 16x16, the floor and later the enemies, switches and pushable
//     blocks (Zelda-style). A block covers 2x2 cells; block (bx, by) is cells
//     (2 + 2bx .. 3 + 2bx, 2 + 2by .. 3 + 2by).
// The walls: 16 px at the back (the top: its top, then its face) and on the
// sides, 8 px at the front (the bottom), for a little depth. A room of W x H
// blocks is (4 + 2W) x (3 + 2H) cells; open cells are x 2 .. room_x1, y 2 .. room_y1.
// One screen (the 160x136 playfield above the one-row HUD) is 8 x 7 blocks.
// Bigger rooms scroll, up to 14 x 14 blocks (32 x 31 cells): the whole room fits
// the 32x32 background map, so it's drawn once and scrolling streams nothing.
#define ROOM_X0 2  // the first open column (0-1: the left wall) ...
#define ROOM_Y0 2  // ... and row (0: the back wall's top, 1: its face)
#define ROOM_BW_MIN 8   // a room is at least a screen
#define ROOM_BH_MIN 7
#define ROOM_BW_MAX 14
#define ROOM_BH_MAX 14
#define ROOM_TH_MAX (3 + 2 * ROOM_BH_MAX)
#define ROOM_COUNT 2  // 0: one screen; 1: bigger, scrolls both ways
extern uint8_t room_id;           // the room to play (tests set it before START)
extern uint8_t room_bw, room_bh;  // its size in blocks
extern uint8_t room_tw, room_th;  // ... and in cells, walls included
extern uint8_t room_x1, room_y1;  // the last open column and row

#define DIR_RIGHT 0
#define DIR_LEFT 1
#define DIR_UP 2
#define DIR_DOWN 3

#define NOODLE_MAX 250  // segments, at most (the body ring holds 256)

extern uint16_t game_seed;   // the RNG seed this game started from
extern uint16_t test_seed;   // tests set it (nonzero) to start on a known seed
extern uint16_t score, best_score;
extern uint8_t noodle_len;   // segments, the head included
extern uint8_t noodle_dir;   // DIR_*: the way the head last moved
extern uint8_t noodle_prev_dir;  // DIR_*: the way it went before its last turn
extern uint8_t head_x, head_y;  // in cells
extern uint8_t food_x, food_y;
extern uint8_t step_delay;   // frames between moves (fewer as it eats)
extern uint8_t paused;
extern uint8_t dead_timer;   // counts up once the noodle has crashed (0: alive)

#endif
