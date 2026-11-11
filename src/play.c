#pragma bank 255
// Play: a placeholder noodle game, to prove the engine end to end until the
// real design lands. The board is a grid of 16x16 blocks (Zelda-style rooms):
// the noodle moves a block at a time; the d-pad turns it (two turns can be
// queued between moves), food makes it longer and a little faster, and running
// into a wall or itself ends the game. START pauses.
//
// Every block is a 16x16 metatile: four 8x8 background tiles. A move changes at
// most four blocks (old head -> body, new head, tail -> grass, new food), each
// queued as two 2-tile strips with gfx_strip_attr and written in vblank.
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

// Metatiles, in tools/tile-art.mjs's order; each is 4 tiles (TL, TR, BL, BR).
#define MT_GRASS 0
#define MT_WALL 1
#define MT_BODY 2
#define MT_HEAD_R 3  // facing right (flipped: left)
#define MT_HEAD_D 4  // facing down (flipped: up)
#define MT_FOOD 5
#define MT_TILE(mt) (SCENE_TILES + ((mt) << 2))
// Background tile attributes (VRAM bank 1): bits 0-2 palette, 5 x flip, 6 y flip.
#define A_FLIPX 0x20
#define A_FLIPY 0x40

#define START_X 3
#define START_Y 3
#define START_LEN 3
#define START_DELAY 16  // frames a move at first (a block is 16 px)
#define MIN_DELAY 7
#define FOOD_PER_SPEEDUP 3
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

// The body, a ring of blocks: the head at body_i, the tail noodle_len - 1 behind.
// uint8_t indices wrap at 256 on their own.
uint8_t body_x[256], body_y[256];
uint8_t body_i;
// Which blocks the noodle covers, by (y << 4) | x.
uint8_t occupied[BOARD_H << 4];
// Turns pressed but not yet made (so a quick RIGHT, DOWN both count).
uint8_t dir_queue[2], dir_queued;

#define CELL(x, y) (((y) << 4) | (x))

// The block's four tiles, arranged for its flips: a flipped metatile also swaps
// its halves (top-left <-> top-right for an x flip, top <-> bottom for a y flip).
static uint8_t quad[4];
static void arrange(uint8_t mt, uint8_t attr) {
    uint8_t t = MT_TILE(mt), x = attr & A_FLIPX ? 1 : 0, y = attr & A_FLIPY ? 2 : 0;
    quad[0] = t + (0 ^ x ^ y);
    quad[1] = t + (1 ^ x ^ y);
    quad[2] = t + (2 ^ x ^ y);
    quad[3] = t + (3 ^ x ^ y);
}

// A block, written now (the display is off, or a one-off).
static void put_now(uint8_t bx, uint8_t by, uint8_t mt, uint8_t attr) {
    arrange(mt, attr);
    uint8_t x = bx << 1, y = by << 1;
    VBK_REG = 1;
    fill_bkg_rect(x, y, 2, 2, attr);
    VBK_REG = 0;
    set_bkg_tiles(x, y, 2, 2, quad);
}

// A block, queued for the next vblank: two strips of two tiles.
static void put(uint8_t bx, uint8_t by, uint8_t mt, uint8_t attr) {
    arrange(mt, attr);
    for (uint8_t row = 0; row < 2; row++) {
        uint8_t *t = gfx_strip_attr(bx << 1, (by << 1) + row, 0, 2);
        t[0] = quad[row << 1];
        t[1] = quad[(row << 1) + 1];
        t[STRIP_MAX_LEN] = t[STRIP_MAX_LEN + 1] = attr;
    }
}

static uint8_t head_mt(void) {
    return noodle_dir <= DIR_LEFT ? MT_HEAD_R : MT_HEAD_D;
}
static uint8_t head_attr(void) {
    return PLAY_PAL_NOODLE | (noodle_dir == DIR_LEFT ? A_FLIPX : noodle_dir == DIR_UP ? A_FLIPY : 0);
}

static void hud_score(void) {
    win_number(6, 0, score, 4, 1);
    win_number(16, 0, best_score, 4, 1);
}

// Food on a free block: a few random tries, then the first free block.
static void place_food(uint8_t now) {
    uint8_t x, y, tries = 64;
    do {
        x = rand() & 15;
        y = rand() & 7;
        if (x >= BOARD_X0 && x <= BOARD_X1 && y >= BOARD_Y0 && y <= BOARD_Y1 && !occupied[CELL(x, y)]) goto found;
    } while (--tries);
    for (y = BOARD_Y0; y <= BOARD_Y1; y++)
        for (x = BOARD_X0; x <= BOARD_X1; x++)
            if (!occupied[CELL(x, y)]) goto found;
    food_x = food_y = 0xFF;  // the board is full
    return;
found:
    food_x = x;
    food_y = y;
    if (now) put_now(x, y, MT_FOOD, PLAY_PAL_FOOD);
    else put(x, y, MT_FOOD, PLAY_PAL_FOOD);
}

void play_enter(void) BANKED {
    palettes_play();
    banked_bkg_data(SCENE_TILES, BOARD_TILE_COUNT, board_tiles, BANK(board));
    for (uint8_t y = 0; y < BOARD_H; y++)
        for (uint8_t x = 0; x < BOARD_W; x++) {
            uint8_t open = x >= BOARD_X0 && x <= BOARD_X1 && y >= BOARD_Y0 && y <= BOARD_Y1;
            put_now(x, y, open ? MT_GRASS : MT_WALL, open ? PLAY_PAL_BOARD : PLAY_PAL_WALL);
        }
    // The HUD on the window, at the bottom (gfx.h HUD_WY). Its attributes are
    // BG_PAL_UI everywhere (gfx_init).
    fill_win_rect(0, 0, SCREEN_TW, HUD_ROWS, 0);
    win_text(0, 0, "SCORE");
    win_text(11, 0, "BEST");
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
    noodle_len = START_LEN;
    // Tail first, so the head lands at body_i.
    body_i = 0xFF;
    for (uint8_t i = 0; i < START_LEN; i++) {
        body_i++;
        body_x[body_i] = START_X - START_LEN + 1 + i;
        body_y[body_i] = START_Y;
        occupied[CELL(body_x[body_i], START_Y)] = 1;
        put_now(body_x[body_i], START_Y, MT_BODY, PLAY_PAL_NOODLE);
    }
    head_x = START_X;
    head_y = START_Y;
    put_now(head_x, head_y, head_mt(), head_attr());
    place_food(1);
    hud_score();
}

// "PAUSED" on the HUD's second row.
static void pause_banner(void) {
    if (paused) win_text(7, 1, "PAUSED");
    else fill_win_rect(7, 1, 6, 1, 0);
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
    // Unless it grows, the tail moves on this step: its block is free to enter.
    uint8_t tail = body_i - noodle_len + 1;
    if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 0;
    if (x < BOARD_X0 || x > BOARD_X1 || y < BOARD_Y0 || y > BOARD_Y1 || occupied[CELL(x, y)]) {
        if (!grows) occupied[CELL(body_x[tail], body_y[tail])] = 1;
        crash();
        return;
    }
    put(head_x, head_y, MT_BODY, PLAY_PAL_NOODLE);
    if (grows) noodle_len++;
    else put(body_x[tail], body_y[tail], MT_GRASS, PLAY_PAL_BOARD);
    body_i++;
    body_x[body_i] = head_x = x;
    body_y[body_i] = head_y = y;
    occupied[CELL(x, y)] = 1;
    put(x, y, head_mt(), head_attr());
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
