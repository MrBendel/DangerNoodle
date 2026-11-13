#pragma bank 255
// Play: a placeholder noodle game, to prove the engine end to end until the
// real design lands. The noodle moves a cell (8x8) at a time inside the room's
// walls, over a floor of 16x16 blocks (game.h: the two grids), and the camera
// follows it round rooms bigger than the screen (room.c). The d-pad turns it
// (two turns can be queued between moves; straight back makes a hairpin), food
// makes it longer and a little faster, and running into a wall or itself ends
// the game. START pauses.
//
// Each move changes at most four cells (old head -> body, new head, tail ->
// floor, new food), queued with gfx_strip_attr and written in vblank. The whole
// room is in the background map (room.c), so a cell's map tile is its own.
#include <gb/gb.h>
#include <gb/cgb.h>
#include <rand.h>
#include <string.h>
#include "sfx.h"
#include "state.h"
#include "input.h"
#include "gfx.h"
#include "game.h"
#include "room.h"
#include "board.h"

#define START_X 7
#define START_Y 8
#define START_LEN 3
#define START_DELAY 10  // frames a move at first
#define MIN_DELAY 4
#define FOOD_PER_SPEEDUP 4
#define DEATH_FRAMES 60  // the crash shows this long before the game over screen

uint16_t game_seed;
uint16_t test_seed;
uint16_t score, best_score;
uint8_t noodle_len, noodle_dir, noodle_prev_dir;
uint8_t head_x, head_y;
uint8_t food_x, food_y;
uint8_t step_delay, step_timer;
uint8_t paused;
uint8_t dead_timer;
uint8_t food_eaten;

// The body, a ring of cells: the head at body_i, the tail noodle_len - 1 behind.
// uint8_t indices wrap at 256 on their own.
uint8_t body_x[256], body_y[256];
uint8_t body_i;
// Which cells the noodle covers, by (y << 5) | x.
uint8_t occupied[ROOM_TH_MAX << 5];
// Turns pressed but not yet made (so a quick RIGHT, DOWN both count).
uint8_t dir_queue[2], dir_queued;

#define CELL(x, y) (((uint16_t)(y) << 5) | (x))
#define OPEN(x, y) ((x) >= ROOM_X0 && (x) <= room_x1 && (y) >= ROOM_Y0 && (y) <= room_y1)

static void put_now(uint8_t x, uint8_t y, uint8_t tile, uint8_t attr) {
    VBK_REG = 1;
    set_bkg_tile_xy(x, y, attr);
    VBK_REG = 0;
    set_bkg_tile_xy(x, y, tile);
}

// One cell, queued for the next vblank.
static void put(uint8_t x, uint8_t y, uint8_t tile, uint8_t attr) {
    uint8_t *t = gfx_strip_attr(x, y, 0, 1);
    t[0] = tile;
    t[STRIP_MAX_LEN] = attr;
}

static uint8_t head_tile(void) {
    return noodle_dir <= DIR_LEFT ? T_HEAD_R : T_HEAD_D;
}
static uint8_t head_attr(void) {
    return PLAY_PAL_NOODLE | (noodle_dir == DIR_LEFT ? A_FLIPX : noodle_dir == DIR_UP ? A_FLIPY : 0);
}

static void hud_score(void) {
    win_number(6, 0, score, 4, 1);
    win_number(16, 0, best_score, 4, 1);
}

// The HUD row: the score and best, or "PAUSED" while paused.
static void hud_draw(void) {
    fill_win_rect(0, 0, SCREEN_TW, HUD_ROWS, 0);
    if (paused) {
        win_text(7, 0, "PAUSED");
        return;
    }
    win_text(0, 0, "SCORE");
    win_text(11, 0, "BEST");
    hud_score();
}

// Food on a free cell: a few random tries, then the first free cell.
static void place_food(uint8_t now) {
    uint8_t x, y, tries = 64;
    do {
        x = rand() & 31;
        y = rand() & 31;
        if (OPEN(x, y) && !occupied[CELL(x, y)]) goto found;
    } while (--tries);
    for (y = ROOM_Y0; y <= room_y1; y++)
        for (x = ROOM_X0; x <= room_x1; x++)
            if (!occupied[CELL(x, y)]) goto found;
    food_x = food_y = 0xFF;  // the board is full
    return;
found:
    food_x = x;
    food_y = y;
    if (now) put_now(x, y, T_FOOD, PLAY_PAL_FOOD);
    else put(x, y, T_FOOD, PLAY_PAL_FOOD);
}

void play_enter(void) BANKED {
    palettes_play();
    banked_bkg_data(SCENE_TILES, BOARD_TILE_COUNT, board_tiles, BANK(board));
    room_load();
    room_draw();
    // The HUD on the window, at the bottom (gfx.h HUD_WY). Its attributes are
    // BG_PAL_UI everywhere (gfx_init).
    move_win(7, HUD_WY);
    SHOW_WIN;
    gfx_sprite_split(HUD_WY);  // sprites (enemies, later) stop above the HUD

    memset(occupied, 0, sizeof(occupied));
    initrand(game_seed);
    score = 0;
    food_eaten = 0;
    paused = 0;
    dead_timer = 0;
    dir_queued = 0;
    step_delay = step_timer = START_DELAY;
    noodle_dir = DIR_RIGHT;
    noodle_prev_dir = DIR_UP;  // so the first double-back bends upward
    noodle_len = START_LEN;
    // Tail first, so the head lands at body_i.
    body_i = 0xFF;
    for (uint8_t i = 0; i < START_LEN; i++) {
        body_i++;
        body_x[body_i] = START_X - START_LEN + 1 + i;
        body_y[body_i] = START_Y;
        occupied[CELL(body_x[body_i], START_Y)] = 1;
        put_now(body_x[body_i], START_Y, T_BODY, PLAY_PAL_NOODLE);
    }
    head_x = START_X;
    head_y = START_Y;
    put_now(head_x, head_y, head_tile(), head_attr());
    place_food(1);
    hud_draw();
    camera_update(1);
}

// The cell next to the head in direction d, in ahead_x/ahead_y.
static uint8_t ahead_x, ahead_y;
static void ahead(uint8_t d) {
    ahead_x = head_x;
    ahead_y = head_y;
    switch (d) {
        case DIR_RIGHT: ahead_x++; break;
        case DIR_LEFT: ahead_x--; break;
        case DIR_UP: ahead_y--; break;
        default: ahead_y++; break;
    }
}

static uint8_t ahead_open(uint8_t d) {
    ahead(d);
    return OPEN(ahead_x, ahead_y) && !occupied[CELL(ahead_x, ahead_y)];
}

static void queue_turn(uint8_t d) {
    uint8_t last = dir_queued ? dir_queue[dir_queued - 1] : noodle_dir;
    if (dir_queued == 2 || d == last) return;
    // DIR_* pairs differ in bit 0: d is straight back. The noodle doubles back in
    // a hairpin: one step the way it went before its last turn (away from its own
    // body; the other side if that cell is blocked), then the way pressed.
    if (d == (last ^ 1)) {
        if (dir_queued) return;
        uint8_t side = noodle_prev_dir;
        if (!ahead_open(side)) side ^= 1;
        dir_queue[0] = side;
        dir_queue[1] = d;
        dir_queued = 2;
        return;
    }
    dir_queue[dir_queued++] = d;
}

static void crash(void) {
    dead_timer = 1;
    sfx_play(SFX_DEATH);
    // The noodle greys out.
    pal_base_bg[(PLAY_PAL_NOODLE << 2) + 2] = RGB8(120, 120, 112);
    gfx_set_fade(0);
}

static void step(void) {
    if (dir_queued) {
        noodle_prev_dir = noodle_dir;
        noodle_dir = dir_queue[0];
        dir_queue[0] = dir_queue[1];
        dir_queued--;
        sfx_play(SFX_TURN);
    }
    ahead(noodle_dir);
    uint8_t x = ahead_x, y = ahead_y;
    uint8_t ate = x == food_x && y == food_y;
    uint8_t grows = ate && noodle_len < NOODLE_MAX;
    // Unless it grows, the tail moves on this step: its cell is free to enter.
    uint8_t tail = body_i - noodle_len + 1;
    if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 0;
    if (!OPEN(x, y) || occupied[CELL(x, y)]) {
        if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 1;
        crash();
        return;
    }
    put(head_x, head_y, T_BODY, PLAY_PAL_NOODLE);
    if (grows) noodle_len++;
    else put(body_x[tail], body_y[tail], FLOOR_TILE(body_x[tail], body_y[tail]), PLAY_PAL_BOARD);
    body_i++;
    body_x[body_i] = head_x = x;
    body_y[body_i] = head_y = y;
    occupied[CELL(x, y)] = 1;
    put(x, y, head_tile(), head_attr());
    if (ate) {
        score++;
        if (score > best_score) best_score = score;
        if (++food_eaten == FOOD_PER_SPEEDUP) {
            food_eaten = 0;
            if (step_delay > MIN_DELAY) step_delay--;
        }
        sfx_play(SFX_EAT);
        place_food(0);
        hud_score();
    }
}

void play_update(void) BANKED {
    if (dead_timer) {
        if (++dead_timer > DEATH_FRAMES) state_change(STATE_GAME_OVER);
        return;
    }
    if (joy_pressed & J_START) {
        paused ^= 1;
        hud_draw();
        return;
    }
    if (paused) return;
    uint8_t p = joy_pressed;
    if (p & J_RIGHT) queue_turn(DIR_RIGHT);
    if (p & J_LEFT) queue_turn(DIR_LEFT);
    if (p & J_UP) queue_turn(DIR_UP);
    if (p & J_DOWN) queue_turn(DIR_DOWN);
    if (!--step_timer) {
        step_timer = step_delay;
        step();
    }
    camera_update(0);
}
