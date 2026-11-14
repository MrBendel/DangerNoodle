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
// The dungeon (room.c): its rooms on a grid, joined by doors on their sides.
#define ROOM_COUNT 12
#define DUNGEON_W 4
#define DUNGEON_H 3
#define ROOM_GOAL 11  // the treasure room: the dungeon is cleared
extern uint8_t room_id;           // the room to play (tests set it before START)
extern uint8_t room_bw, room_bh;  // its size in blocks
extern uint8_t room_tw, room_th;  // ... and in cells, walls included
extern uint8_t room_x1, room_y1;  // the last open column and row
// How a room starts: the head's cell (heading right, the body behind it), the
// length it grows out to, the length its puzzle needs (the HUD shows it), and
// segments a food is worth (0: no food).
extern uint8_t room_start_x, room_start_y, room_start_len, room_need, room_food;

// The dungeon so far, by room: solved (its shutters open), seen (on the map),
// its locked doors opened (a bit per side, DIR_*), its key taken; and the keys
// carried. A new game from the title starts it over (play_fresh).
extern uint8_t room_done[ROOM_COUNT], room_seen[ROOM_COUNT], room_locks[ROOM_COUNT], key_got[ROOM_COUNT];
extern uint8_t keys;
extern uint8_t play_fresh;
// The room's key: its cell (0xFF: none), and whether it's out (a puzzle room's
// key appears when it's solved).
extern uint8_t key_x, key_y, key_shown;
// Each cell, by (y << 5) | x: bit 0, the noodle covers it; bits 1-4, the
// switch it belongs to (its index + 1; 0: none).
extern uint8_t occupied[];
// How the noodle comes in: through the door on side entry_side (DIR_*),
// entry_off cells along it; 0xFF: at the room's start (a new game).
extern uint8_t entry_side, entry_off;
// The room sits at tile (map_ox, map_oy) of the background map: rooms slide in
// beside each other (play.c). view_x, view_y: the screen's top-left, in room px.
extern uint8_t map_ox, map_oy;
extern int16_t view_x, view_y;

// Switches: each is a set of cells the body presses. A shape is stones (8x8,
// all at once); a button is a 16x16 block (any of its cells, or all 4 if heavy).
// When every switch is down at once (and every enemy eaten) the room is solved
// and its shutters open. Doors sit in the middle of a side: the back wall's in
// row DOOR_Y, cells door_x and door_x + 1 (the near wall's likewise); a side
// wall's in its inner column, rows door_y and door_y + 1.
#define SW_MAX 8
#define SW_CELLS_MAX 40
#define SW_LATCH 1    // stays down once pressed
#define SW_TIMED 2    // stays down a while after the body leaves
#define SW_HEAVY 4    // needs all 4 cells: fold over yourself
#define SW_HEAD 8     // only the head presses it
#define SW_TAIL 16    // only the tail tip presses it
#define SW_STONES 32  // a shape's stones, not a button
#define SW_ORDER(n) ((uint8_t)((n) << 6))  // latched, but only pressed in turn (1-3)
#define DOOR_Y 1
extern uint8_t sw_count;
extern uint8_t sw_flags[SW_MAX], sw_need[SW_MAX], sw_tile[SW_MAX];
extern uint8_t sw_first[SW_MAX], sw_n[SW_MAX];  // its cells in sw_cx/sw_cy
extern uint8_t sw_cx[SW_CELLS_MAX], sw_cy[SW_CELLS_MAX];
extern uint8_t sw_cover[SW_MAX];  // its cells under the body now
extern uint8_t sw_down[SW_MAX];
extern uint8_t door_x, door_y;
extern uint8_t room_doors[4];  // its sides' kinds (room.c D_*), by DIR_*
extern uint8_t door_open;      // solved (this visit or before)

// Enemies: beetles on the block grid. Coil round one (a ring of body it can't
// get out of) to crack its shell, then eat it before it hardens again; it bites
// a segment off you on its own clock if you're next to it.
#define ENEMY_MAX 2
#define EN_NONE 0
#define EN_ARMORED 1
#define EN_CRACKED 2
extern uint8_t en_count;  // in the room at the start
extern uint8_t en_state[ENEMY_MAX];
extern uint8_t en_cx[ENEMY_MAX], en_cy[ENEMY_MAX];  // its top-left cell

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
