#pragma bank 255
// Play: a placeholder noodle game, to prove the engine end to end until the
// real design lands. The noodle moves a tile at a time on a walled board; the
// d-pad turns it (two turns can be queued between moves), food makes it longer
// and a little faster, and running into a wall or itself ends the game.
// START pauses.
//
// Each move changes at most four tiles (old head -> body, new head, tail ->
// grass, new food), queued with gfx_strip_attr and written in vblank.
#include <gb/gb.h>
#include <gb/cgb.h>
#include <rand.h>
#include <string.h>
#include "sfx.h"
#include "state.h"
#include "input.h"
#include "gfx.h"
#include "game.h"
#include "board.h"

// Board tiles, in tools/tile-art.mjs's order.
#define T_GRASS (SCENE_TILES + 0)
#define T_WALL (SCENE_TILES + 1)
#define T_BODY (SCENE_TILES + 2)
#define T_HEAD_R (SCENE_TILES + 3)  // facing right (flipped: left)
#define T_HEAD_D (SCENE_TILES + 4)  // facing down (flipped: up)
#define T_FOOD (SCENE_TILES + 5)
// Background tile attributes (VRAM bank 1): bits 0-2 palette, 5 x flip, 6 y flip.
#define A_FLIPX 0x20
#define A_FLIPY 0x40

#define START_X 6
#define START_Y 9
#define START_LEN 3
#define START_DELAY 8  // frames a move at first
#define MIN_DELAY 3
#define FOOD_PER_SPEEDUP 4
#define DEATH_FRAMES 60  // the crash shows this long before the game over screen

uint16_t game_seed;
uint16_t test_seed;
uint16_t score, best_score;
uint8_t noodle_len, noodle_dir;
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
uint8_t occupied[(BOARD_Y1 + 1) << 5];
// Turns pressed but not yet made (so a quick RIGHT, DOWN both count).
uint8_t dir_queue[2], dir_queued;

#define CELL(x, y) (((uint16_t)(y) << 5) | (x))

static void put_now(uint8_t x, uint8_t y, uint8_t tile, uint8_t attr) {
    VBK_REG = 1;
    set_bkg_tile_xy(x, y, attr);
    VBK_REG = 0;
    set_bkg_tile_xy(x, y, tile);
}

// One tile, queued for the next vblank.
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
    bkg_number(7, 0, score, 4, 1);
    bkg_number(16, 0, best_score, 4, 1);
}

// Food on a free cell: a few random tries, then the first free cell.
static void place_food(uint8_t now) {
    uint8_t x, y, tries = 64;
    do {
        x = rand() & 31;
        y = (rand() & 15) + BOARD_Y0;
        if (x >= BOARD_X0 && x <= BOARD_X1 && y <= BOARD_Y1 && !occupied[CELL(x, y)]) goto found;
    } while (--tries);
    for (y = BOARD_Y0; y <= BOARD_Y1; y++)
        for (x = BOARD_X0; x <= BOARD_X1; x++)
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
    // Attributes: the HUD row, then walls all round, then grass inside.
    VBK_REG = 1;
    fill_bkg_rect(0, 0, SCREEN_TW, 1, PLAY_PAL_TEXT);
    fill_bkg_rect(0, 1, SCREEN_TW, SCREEN_TH - 1, PLAY_PAL_WALL);
    fill_bkg_rect(BOARD_X0, BOARD_Y0, BOARD_X1 - BOARD_X0 + 1, BOARD_Y1 - BOARD_Y0 + 1, PLAY_PAL_BOARD);
    VBK_REG = 0;
    fill_bkg_rect(0, 1, SCREEN_TW, SCREEN_TH - 1, T_WALL);
    fill_bkg_rect(BOARD_X0, BOARD_Y0, BOARD_X1 - BOARD_X0 + 1, BOARD_Y1 - BOARD_Y0 + 1, T_GRASS);
    bkg_text(1, 0, "SCORE");
    bkg_text(11, 0, "BEST");

    memset(occupied, 0, sizeof(occupied));
    initrand(game_seed);
    score = 0;
    food_eaten = 0;
    paused = 0;
    dead_timer = 0;
    dir_queued = 0;
    step_delay = step_timer = START_DELAY;
    noodle_dir = DIR_RIGHT;
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
    hud_score();
}

// "PAUSED" across the middle of the board, or what was under it back.
#define PAUSE_X 7
#define PAUSE_Y 9
#define PAUSE_W 6
static void pause_banner(void) {
    VBK_REG = 1;
    fill_bkg_rect(PAUSE_X, PAUSE_Y, PAUSE_W, 1, PLAY_PAL_TEXT);
    VBK_REG = 0;
    if (paused) {
        bkg_text(PAUSE_X, PAUSE_Y, "PAUSED");
        return;
    }
    for (uint8_t x = PAUSE_X; x < PAUSE_X + PAUSE_W; x++) {
        if (x == head_x && PAUSE_Y == head_y) put_now(x, PAUSE_Y, head_tile(), head_attr());
        else if (occupied[CELL(x, PAUSE_Y)]) put_now(x, PAUSE_Y, T_BODY, PLAY_PAL_NOODLE);
        else if (x == food_x && PAUSE_Y == food_y) put_now(x, PAUSE_Y, T_FOOD, PLAY_PAL_FOOD);
        else put_now(x, PAUSE_Y, T_GRASS, PLAY_PAL_BOARD);
    }
}

static void queue_turn(uint8_t d) {
    uint8_t last = dir_queued ? dir_queue[dir_queued - 1] : noodle_dir;
    // No turning back on yourself (DIR_* pairs differ in bit 0), and no repeats.
    if (dir_queued == 2 || d == last || d == (last ^ 1)) return;
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
        noodle_dir = dir_queue[0];
        dir_queue[0] = dir_queue[1];
        dir_queued--;
        sfx_play(SFX_TURN);
    }
    uint8_t x = head_x, y = head_y;
    switch (noodle_dir) {
        case DIR_RIGHT: x++; break;
        case DIR_LEFT: x--; break;
        case DIR_UP: y--; break;
        default: y++; break;
    }
    uint8_t ate = x == food_x && y == food_y;
    uint8_t grows = ate && noodle_len < NOODLE_MAX;
    // Unless it grows, the tail moves on this step: its cell is free to enter.
    uint8_t tail = body_i - noodle_len + 1;
    if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 0;
    if (x < BOARD_X0 || x > BOARD_X1 || y < BOARD_Y0 || y > BOARD_Y1 || occupied[CELL(x, y)]) {
        if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 1;
        crash();
        return;
    }
    put(head_x, head_y, T_BODY, PLAY_PAL_NOODLE);
    if (grows) noodle_len++;
    else put(body_x[tail], body_y[tail], T_GRASS, PLAY_PAL_BOARD);
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
        pause_banner();
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
}
