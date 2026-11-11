// The current game (play.c): the noodle, its food and the score. Watchable
// globals, for the tests and the playtest page.
#ifndef GAME_H
#define GAME_H

#include <stdint.h>

// A room is one screen: the 160x128 playfield above the HUD (the HUD is the
// bottom two tile rows, on the window layer: gfx.h HUD_WY). Two grids share it:
//   - cells: 8x8, the noodle's grid (and its food). The walls are 8 px thick, so
//     the open area is 18x14 cells. Positions below are in cells.
//   - blocks: 16x16, the floor and later the enemies, switches and pushable
//     blocks (Zelda-style), 9x7 of them inside the walls. A block covers 2x2
//     cells; block (bx, by) is cells (1 + 2bx .. 2 + 2bx, 1 + 2by .. 2 + 2by).
#define BOARD_X0 1   // the first open column ...
#define BOARD_X1 18  // ... and the last (column 19: the right wall)
#define BOARD_Y0 1   // the first open row (row 0: the top wall) ...
#define BOARD_Y1 14  // ... and the last (row 15: the bottom wall)
#define BLOCKS_W 9
#define BLOCKS_H 7

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
extern uint8_t head_x, head_y;  // in cells
extern uint8_t food_x, food_y;
extern uint8_t step_delay;   // frames between moves (fewer as it eats)
extern uint8_t paused;
extern uint8_t dead_timer;   // counts up once the noodle has crashed (0: alive)

#endif
