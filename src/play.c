#pragma bank 255
// Play: a placeholder noodle game, to prove the engine end to end until the
// real design lands. The noodle moves a cell (8x8) at a time inside the room's
// walls, over a floor of 16x16 blocks (game.h: the two grids), and the camera
// follows it round rooms bigger than the screen (room.c). The d-pad turns it
// (two turns can be queued between moves; straight back makes a hairpin), food
// makes it longer and a little faster, and running into a wall or itself ends
// the game. Running into its own body parks it: it waits, head against itself,
// until a turn leads somewhere open; only a park with no way out is a crash.
// START pauses.
//
// The body is background tiles, a tube of straight and bent pieces; each move
// changes at most three cells (old head -> body, tail -> floor, new food), queued
// with gfx_strip_attr and written
// in vblank. The head and the tail tip are sprites that slide at an even pace from cell
// to cell between moves, so the noodle glides instead of jumping 8 px. The cell
// the head is entering stays floor until the next move makes it body. The whole
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
#include "noodle_spr.h"

#define START_X 7
#define START_Y 8
#define START_LEN 3
#define START_DELAY 16  // frames a move at first: a slow, steady beat
#define MIN_DELAY 8
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
uint8_t noodle_parked;  // up against its own body, waiting for a way out

// Sprites: the head and the tail tip (8x16 mode, the art in the top half).
#define SPR_HEAD 0
#define SPR_TAIL 1
#define S_HEAD_R 0  // left: flipped in X
#define S_HEAD_D 2
#define S_HEAD_U 4  // not a flip: tile-art.mjs
#define S_TAIL_R 6  // the tip whose body goes on to the right
#define S_TAIL_D 8
#define S_TAIL_U 10
// The slide: frames since the last move (up to step_delay), and how far (px)
// the ends have moved by then. Each move is a step on a beat, like a roguelike's
// turns: the ends ease in and out of the move over its first 6 frames, then
// rest until the next (MIN_DELAY keeps a rest even at top speed).
uint8_t slide_k;
static const uint8_t slide_px[START_DELAY + 1] = {0, 1, 2, 4, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8};
// Where each end came from, as a step back from its cell (-1, 0, 1).
int8_t head_bx, head_by, tail_bx, tail_by;
uint8_t move_dir;  // the way the head went on its last move
uint8_t head_turned;  // that move was a turn (the head rounds the bend)

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

// The body piece for a cell whose neighbours along the body are directions a
// (toward the tail) and b (toward the head): a straight segment, its divider
// flipped to the tail side so it runs on into the next one toward the head, or
// a bend, likewise.
static uint8_t piece_attr;
static uint8_t piece(uint8_t a, uint8_t b) {
    piece_attr = PLAY_PAL_NOODLE;
    if ((a ^ 1) == b) {
        // Drawn with the divider on the left (across) or the top (down).
        if (a == DIR_RIGHT) piece_attr |= A_FLIPX;
        if (a == DIR_DOWN) piece_attr |= A_FLIPY;
        return a <= DIR_LEFT ? T_TUBE_H : T_TUBE_V;
    }
    // A bend: the tail side picks the drawing (its divider on that edge), flips
    // turn it to the head side.
    if (a <= DIR_LEFT) {  // from the left (flipped: right), turning down (up)
        if (a == DIR_RIGHT) piece_attr |= A_FLIPX;
        if (b == DIR_UP) piece_attr |= A_FLIPY;
        return T_BEND_H;
    }
    // From the top (flipped: bottom), turning right (left).
    if (a == DIR_DOWN) piece_attr |= A_FLIPY;
    if (b == DIR_LEFT) piece_attr |= A_FLIPX;
    return T_BEND_V;
}

// A sprite tile facing d: right, down and up are drawn; left flips right.
static void face(uint8_t n, uint8_t right, uint8_t pal, uint8_t d) {
    set_sprite_tile(n, d <= DIR_LEFT ? right : d == DIR_DOWN ? right + 2 : right + 4);
    set_sprite_prop(n, pal | (d == DIR_LEFT ? S_FLIPX : 0));
}

// The way from cell (x, y) to its neighbour (nx, ny).
static uint8_t dir_to(uint8_t x, uint8_t y, uint8_t nx, uint8_t ny) {
    if (nx > x) return DIR_RIGHT;
    if (nx < x) return DIR_LEFT;
    return ny < y ? DIR_UP : DIR_DOWN;
}

// One end's sprite at room pixel (px, py), hidden off screen.
static void place(uint8_t n, uint8_t px, uint8_t py) {
    int16_t sx = (int16_t)px - scroll_x;
    int16_t sy = (int16_t)py - scroll_y;
    if (sx <= -8 || sx >= 160 || sy <= -8 || sy >= HUD_WY) move_sprite(n, 0, 0);
    else move_sprite(n, (uint8_t)(sx + 8), (uint8_t)(sy + 16));
}

// The head and tail sprites, part way along their slide. After the camera, so
// they move with this frame's scroll.
static void noodle_draw(void) {
    uint8_t back = 8 - slide_px[slide_k];
    face(SPR_HEAD, S_HEAD_R, SPR_PAL_NOODLE, noodle_dir);
    // Round a bend, the head starts half out of it (at the old cell, facing the
    // new way, it would cover the bend and stick out past the body) and goes
    // at half pace.
    uint8_t hb = head_turned ? back >> 1 : back;
    place(SPR_HEAD, (head_x << 3) + head_bx * hb, (head_y << 3) + head_by * hb);
    // The tip points along its slide; when it isn't sliding, along the body.
    uint8_t t = body_i - noodle_len + 1, u = t + 1;
    face(SPR_TAIL, S_TAIL_R, SPR_PAL_TAIL, tail_bx || tail_by
        ? dir_to(body_x[t] + tail_bx, body_y[t] + tail_by, body_x[t], body_y[t])
        : dir_to(body_x[t], body_y[t], body_x[u], body_y[u]));
    place(SPR_TAIL, (body_x[t] << 3) + tail_bx * back, (body_y[t] << 3) + tail_by * back);
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
    banked_sprite_data(0, NOODLE_SPR_TILE_COUNT, noodle_spr_tiles, BANK(noodle_spr));
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
    noodle_parked = 0;
    step_delay = step_timer = START_DELAY;
    slide_k = START_DELAY;  // at rest
    head_bx = head_by = tail_bx = tail_by = 0;
    noodle_dir = move_dir = DIR_RIGHT;
    head_turned = 0;
    noodle_prev_dir = DIR_UP;  // so the first double-back bends upward
    noodle_len = START_LEN;
    // Tail first, so the head lands at body_i.
    body_i = 0xFF;
    for (uint8_t i = 0; i < START_LEN; i++) {
        body_i++;
        body_x[body_i] = START_X - START_LEN + 1 + i;
        body_y[body_i] = START_Y;
        occupied[CELL(body_x[body_i], START_Y)] = 1;
        put_now(body_x[body_i], START_Y, T_TUBE_H, PLAY_PAL_NOODLE);
    }
    // The head's cell stays floor: the head is a sprite.
    put_now(START_X, START_Y, FLOOR_TILE(START_X, START_Y), PLAY_PAL_BOARD);
    head_x = START_X;
    head_y = START_Y;
    place_food(1);
    hud_draw();
    camera_update(1);
    noodle_draw();
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
    pal_base_obj[(SPR_PAL_NOODLE << 2) + 2] = RGB8(120, 120, 112);
    pal_base_obj[(SPR_PAL_TAIL << 2) + 2] = RGB8(120, 120, 112);
    gfx_set_fade(0);
}

// Parked with no way out: every cell next to the head is a wall or body (the
// tail's cell counts as open: it moves away as the head moves in).
static uint8_t trapped(uint8_t tail) {
    for (uint8_t d = 0; d < 4; d++) {
        ahead(d);
        if (!OPEN(ahead_x, ahead_y)) continue;
        if (!occupied[CELL(ahead_x, ahead_y)]) return 0;
        if (ahead_x == body_x[tail] && ahead_y == body_y[tail]) return 0;
    }
    return 1;
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
        // A wall is a crash. Its own body parks it, unless there's no way out.
        if (!OPEN(x, y) || trapped(tail)) crash();
        else noodle_parked = 1;
        return;
    }
    noodle_parked = 0;
    // The old head cell joins the body: a tube from where the head came in to
    // where it goes now.
    uint8_t tile = piece(move_dir ^ 1, noodle_dir);
    head_turned = tile >= T_BEND_H;  // T_BEND_H, T_BEND_V
    put(head_x, head_y, tile, piece_attr);
    move_dir = noodle_dir;
    head_bx = head_x - x;
    head_by = head_y - y;
    if (grows) {
        noodle_len++;
        tail_bx = tail_by = 0;  // the tail waits a move
    } else {
        put(body_x[tail], body_y[tail], FLOOR_TILE(body_x[tail], body_y[tail]), PLAY_PAL_BOARD);
        // The tip slides along straights. Into a bend it steps at once, pointing
        // the new way: a straight tip can't follow the curve inside one cell.
        uint8_t t2 = tail + 1, t3 = tail + 2;
        tail_bx = body_x[tail] - body_x[t2];
        tail_by = body_y[tail] - body_y[t2];
        if (body_x[t3] - body_x[t2] != -tail_bx || body_y[t3] - body_y[t2] != -tail_by) {
            tail_bx = tail_by = 0;
            // The tip covers the whole cell now; the bend under it would show.
            put(body_x[t2], body_y[t2], FLOOR_TILE(body_x[t2], body_y[t2]), PLAY_PAL_BOARD);
        }
    }
    body_i++;
    body_x[body_i] = head_x = x;
    body_y[body_i] = head_y = y;
    occupied[CELL(x, y)] = 1;
    slide_k = 0;
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
    // Parked, a turn goes at once rather than at the next beat.
    if (noodle_parked && dir_queued) step_timer = 1;
    if (!--step_timer) {
        step_timer = step_delay;
        step();
    }
    if (slide_k < step_delay) slide_k++;
    camera_update(0);
    noodle_draw();
}
