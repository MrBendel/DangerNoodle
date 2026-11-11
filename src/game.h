// The current game (play.c): the noodle, its food and the score. Watchable
// globals, for the tests and the playtest page.
#ifndef GAME_H
#define GAME_H

#include <stdint.h>

// The board is a grid of 16x16 blocks (Zelda-style dungeon rooms; enemies are
// 16x16 too): the 160x128 playfield above the HUD is 10x8 blocks, walls all
// round. The HUD is the bottom two tile rows, on the window layer (gfx.h HUD_WY).
// Positions below are in blocks.
#define BOARD_W 10
#define BOARD_H 8
#define BOARD_X0 1   // the first open column ...
#define BOARD_X1 8   // ... and the last (column 9: the right wall)
#define BOARD_Y0 1   // the first open row (row 0: the top wall) ...
#define BOARD_Y1 6   // ... and the last (row 7: the bottom wall)

#define DIR_RIGHT 0
#define DIR_LEFT 1
#define DIR_UP 2
#define DIR_DOWN 3

#define NOODLE_MAX 48  // segments, at most: every open block (the body ring holds 256)

extern uint16_t game_seed;   // the RNG seed this game started from
extern uint16_t test_seed;   // tests set it (nonzero) to start on a known seed
extern uint16_t score, best_score;
extern uint8_t noodle_len;   // segments, the head included
extern uint8_t noodle_dir;   // DIR_*: the way the head last moved
extern uint8_t head_x, head_y;  // in blocks
extern uint8_t food_x, food_y;
extern uint8_t step_delay;   // frames between moves (fewer as it eats)
extern uint8_t paused;
extern uint8_t dead_timer;   // counts up once the noodle has crashed (0: alive)

#endif
