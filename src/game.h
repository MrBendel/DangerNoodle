// The current game (play.c): the noodle, its food and the score. Watchable
// globals, for the tests and the playtest page.
#ifndef GAME_H
#define GAME_H

#include <stdint.h>

// The board, in background tiles: walls all round, the HUD on row 0.
#define BOARD_X0 1   // the first open column ...
#define BOARD_X1 18  // ... and the last
#define BOARD_Y0 2   // the first open row (row 0: HUD, row 1: the top wall) ...
#define BOARD_Y1 16  // ... and the last (row 17: the bottom wall)

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
extern uint8_t head_x, head_y;
extern uint8_t food_x, food_y;
extern uint8_t step_delay;   // frames between moves (fewer as it eats)
extern uint8_t paused;
extern uint8_t dead_timer;   // counts up once the noodle has crashed (0: alive)

#endif
