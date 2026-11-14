#pragma bank 255
// Play: the noodle in the dungeon (room.c). It moves a cell (8x8) at a time
// inside a room's walls, over a floor of 16x16 blocks (game.h: the two grids),
// and the camera follows it round rooms bigger than the screen. The d-pad
// turns it (two turns can be queued between moves; straight back makes a
// hairpin), and food makes it longer and a little faster. Running into a wall,
// its own body, an armored beetle or a closed door parks it: it waits until a
// turn leads somewhere open. Only a park with no way out (or a beetle biting it
// down to its head) is a crash, and the room starts again. START pauses and
// shows the dungeon's map.
//
// Each room is a puzzle: switches the body presses, beetles to coil and eat.
// When every switch is down at once and every beetle eaten, the room is solved
// for good and its shutters open (and its key, if it has one, appears). A key
// opens a locked door. Through a door, the next room slides in (a bigger room
// fades in instead) and the noodle feeds in through the door on its far side,
// its length kept. The HUD shows the room's name at first, then the score, the
// keys, the noodle's length and the length the room needs.
//
// The body is background tiles, a tube of straight and bent pieces; each move
// changes a few cells (old head -> body, tail -> floor, new food), queued with
// gfx_strip_attr and written in vblank. The head and the tail tip are sprites
// that slide from cell to cell between moves, so the noodle glides instead of
// jumping 8 px. The cell the head is entering stays floor until the next move
// makes it body. The whole room is in the background map (room.c), so a cell's
// map tile is its own.
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

#define START_LEN 3     // it grows out to the room's start length as it moves
#define START_DELAY 16  // frames a move at first: a slow, steady beat
#define MIN_DELAY 8
#define FOOD_PER_SPEEDUP 4
#define DEATH_FRAMES 60  // the crash shows this long before the room starts again
#define EXIT_FRAMES 10   // the head slides into the doorway, then the next room
#define SLIDE_SPEED 4    // px a frame the next room slides in (a screen: 40 frames)
#define NAME_FRAMES 120  // the HUD shows the room's name this long
#define TIMED_FRAMES 240 // a timed button stays down this long after the body leaves
// Beetles.
#define ENEMY_BEAT 40     // frames between its steps (a block, 16 px)
#define BITE_EVERY 180    // frames between bites (a real-time clock, not the noodle's)
#define BITE_WARN 40      // it turns red this long before biting, and stands still
#define CRACK_FRAMES 240  // cracked this long before its shell hardens again
#define CRACK_WARN 90     // it flashes when its time is nearly up
#define COIL_MAX 6        // a coil is tight: the beetle's 4 cells and 2 to spare
#define EAT_GROW 3        // segments a beetle is worth
#define EAT_SCORE 5

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
uint8_t grow_pending;   // segments still to grow: the tail waits a move each
uint8_t door_open;
uint8_t exit_timer;     // counts up once the head is in the doorway (0: not yet)
uint8_t exit_side, exit_off;  // the door it went through (DIR_*), and which half
uint8_t play_fresh;     // a new game: the dungeon starts over (title.c sets it)
uint8_t entry_side = 0xFF, entry_off;
uint8_t carry_len;      // the length it brings into the next room
uint8_t name_timer;     // the HUD shows a note (at first the room's name) while this counts down
const char *hud_note;
char room_title[ROOM_NAME_MAX + 1];
// The next room sliding in (slide_dir: the way, DIR_*; 0xFF: none): slide_t px
// so far, and its lines (columns or rows, in the order they come into view)
// drawn so far.
uint8_t slide_dir = 0xFF, slide_t, slide_line;

// Switches (game.h; their cells come from room.c).
uint8_t sw_cover[SW_MAX], sw_down[SW_MAX];
uint8_t sw_was[SW_MAX];    // pressed last frame (a press is an edge)
uint8_t sw_timer[SW_MAX];  // a timed button's frames left
uint8_t sw_next;           // the next button in turn (SW_ORDER)

// Beetles.
uint8_t en_state[ENEMY_MAX];
uint8_t en_timer[ENEMY_MAX];  // to its next step; cracked: to hardening
uint8_t en_bite[ENEMY_MAX];   // to its next bite
uint8_t en_coiled[ENEMY_MAX]; // coiled at the last check (a crack is a new coil)
uint8_t en_k[ENEMY_MAX];      // frames since its step (the slide)
int8_t en_bx[ENEMY_MAX], en_by[ENEMY_MAX];  // where it stepped from (-1, 0, 1)
uint8_t en_step[ENEMY_MAX];   // its legs: steps taken

// Sprites (8x16 mode): the head and the tail tip (the art in the top half), and
// two per beetle (its left column, and the right: a flip).
#define SPR_HEAD 0
#define SPR_TAIL 1
#define SPR_ENEMY 2
#define S_HEAD_R 0  // left: flipped in X
#define S_HEAD_D 2
#define S_HEAD_U 4  // not a flip: tile-art.mjs
#define S_TAIL_R 6  // the tip whose body goes on to the right
#define S_TAIL_D 8
#define S_TAIL_U 10
#define S_BEETLE 12  // its legs' other step at +2, cracked at +4
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
// Each cell's body and switch bits (game.h).
#define OCC_BODY 1
#define SW_AT(c) ((occupied[c] >> 1) & 15)
uint8_t occupied[ROOM_TH_MAX << 5];
// Turns pressed but not yet made (so a quick RIGHT, DOWN both count).
uint8_t dir_queue[2], dir_queued;

#define CELL(x, y) (((uint16_t)(y) << 5) | (x))
#define VIEW_PX_W 160  // the playfield
#define VIEW_PX_H (PLAYFIELD_TH * 8)
#define OPEN(x, y) ((x) >= ROOM_X0 && (x) <= room_x1 && (y) >= ROOM_Y0 && (y) <= room_y1)
#define TAIL() ((uint8_t)(body_i - noodle_len + 1))

static void cover_in(uint8_t x, uint8_t y);

// Room cell (x, y) is map tile (x + map_ox, y + map_oy), wrapping.
static void put_now(uint8_t x, uint8_t y, uint8_t tile, uint8_t attr) {
    x = (x + map_ox) & 31;
    y = (y + map_oy) & 31;
    VBK_REG = 1;
    set_bkg_tile_xy(x, y, attr);
    VBK_REG = 0;
    set_bkg_tile_xy(x, y, tile);
}

// One cell, queued for the next vblank.
static void put(uint8_t x, uint8_t y, uint8_t tile, uint8_t attr) {
    uint8_t *t = gfx_strip_attr(x + map_ox, y + map_oy, 0, 1);
    t[0] = tile;
    t[STRIP_MAX_LEN] = attr;
}

// What cell (x, y) shows without the body, again (as the tail leaves it, or
// when a switch or door changes): grass, a switch's stone or button (lit while
// it's held down), food, the key, a door.
static void put_floor(uint8_t x, uint8_t y) {
    uint8_t t = room_cell(x, y);
    put(x, y, t, cell_attr);
}

// A side's door, after it opens.
static void door_redraw(uint8_t d) {
    uint8_t x, y;
    if (d >= DIR_UP) {
        x = door_x;
        y = d == DIR_UP ? DOOR_Y : room_th - 1;
        put_floor(x, y);
        put_floor(x + 1, y);
    } else {
        x = d == DIR_LEFT ? 1 : room_tw - 2;
        y = door_y;
        put_floor(x, y);
        put_floor(x, y + 1);
    }
}

// A button's cells that show (not under the body), after it goes up or down.
static void sw_redraw(uint8_t i) {
    for (uint8_t k = sw_first[i], e = k + sw_n[i]; k < e; k++) {
        uint8_t x = sw_cx[k], y = sw_cy[k];
        if (!(occupied[CELL(x, y)] & OCC_BODY)) put_floor(x, y);
    }
}

// The beetle at cell (x, y), as its index + 1 (0: none).
static uint8_t enemy_at(uint8_t x, uint8_t y) {
    for (uint8_t i = 0; i < ENEMY_MAX; i++)
        if (en_state[i] && (uint8_t)(x - en_cx[i]) < 2 && (uint8_t)(y - en_cy[i]) < 2) return i + 1;
    return 0;
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

// A sprite at room pixel (px, py), hidden off screen.
static void place(uint8_t n, uint8_t px, uint8_t py) {
    int16_t sx = (int16_t)px - view_x;
    int16_t sy = (int16_t)py - view_y;
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
    uint8_t t = TAIL(), u = t + 1;
    face(SPR_TAIL, S_TAIL_R, SPR_PAL_TAIL, tail_bx || tail_by
        ? dir_to(body_x[t] + tail_bx, body_y[t] + tail_by, body_x[t], body_y[t])
        : dir_to(body_x[t], body_y[t], body_x[u], body_y[u]));
    place(SPR_TAIL, (body_x[t] << 3) + tail_bx * back, (body_y[t] << 3) + tail_by * back);
}

// The beetles: their shell (red before a bite), or soft once cracked (flashing
// as it hardens), sliding a block at a time.
static void enemies_draw(void) {
    for (uint8_t i = 0; i < ENEMY_MAX; i++) {
        uint8_t n = SPR_ENEMY + (i << 1);
        if (!en_state[i]) {
            move_sprite(n, 0, 0);
            move_sprite(n + 1, 0, 0);
            continue;
        }
        uint8_t tile, pal;
        if (en_state[i] == EN_CRACKED) {
            tile = S_BEETLE + 4;
            pal = en_timer[i] < CRACK_WARN && (en_timer[i] & 8) ? SPR_PAL_BEETLE : SPR_PAL_SOFT;
        } else {
            tile = S_BEETLE + ((en_step[i] & 1) << 1);
            pal = en_bite[i] < BITE_WARN && (en_bite[i] & 4) ? SPR_PAL_ANGRY : SPR_PAL_BEETLE;
        }
        set_sprite_tile(n, tile);
        set_sprite_tile(n + 1, tile);
        set_sprite_prop(n, pal);
        set_sprite_prop(n + 1, pal | S_FLIPX);
        uint8_t k = en_k[i] > START_DELAY ? START_DELAY : en_k[i];
        uint8_t back = 16 - (slide_px[k] << 1);
        uint8_t px = (en_cx[i] << 3) + en_bx[i] * back, py = (en_cy[i] << 3) + en_by[i] * back;
        place(n, px, py);
        place(n + 1, px + 8, py);
    }
}

static void hud_score(void) {
    if (paused || name_timer) return;
    win_number(0, 0, score, 4, 1);
    win_number(7, 0, keys, 1, 1);
    win_number(15, 0, noodle_len, 2, 1);
}

// The HUD row: a note for a moment (the room's name as it comes in, a door
// opening), then the score, the keys and the length.
static void hud_draw(void) {
    if (paused) return;  // the map is up
    fill_win_rect(0, 0, SCREEN_TW, HUD_ROWS, 0);
    if (name_timer) {
        win_text(1, 0, hud_note);
        return;
    }
    // 0000  K1   LEN 03/08: the length, and what the room needs (until it's solved).
    set_win_tile_xy(6, 0, (uint8_t)T_KEY);
    win_text(11, 0, "LEN");
    if (!door_open) {
        win_text(17, 0, "/");
        win_number(18, 0, room_need, 2, 1);
    }
    hud_score();
}

static void note(const char *s) {
    hud_note = s;
    name_timer = NAME_FRAMES;
    hud_draw();
}

// Food on a free cell (not the body, a switch, a beetle or the key): a few
// random tries, then the first free cell. None in a room that has no food.
// later: leave its tile to the room's drawing (room_cell) instead of queueing it.
static void place_food(uint8_t later) {
    uint8_t x, y, tries = 64;
    food_x = food_y = 0xFF;
    if (!room_food) return;
    do {
        x = rand() & 31;
        y = rand() & 31;
        if (OPEN(x, y) && !occupied[CELL(x, y)] && !enemy_at(x, y) && (x != key_x || y != key_y)) goto found;
    } while (--tries);
    for (y = ROOM_Y0; y <= room_y1; y++)
        for (x = ROOM_X0; x <= room_x1; x++)
            if (!occupied[CELL(x, y)] && !enemy_at(x, y) && (x != key_x || y != key_y)) goto found;
    return;  // the board is full
found:
    food_x = x;
    food_y = y;
    if (!later) put(x, y, T_FOOD, PLAY_PAL_FOOD);
}

// A room starts (room_load has run): its switches, beetles and key as the
// dungeon left them, and the noodle at its start (a new game) or in the door
// it came in by (entry_side), feeding in from there: two cells in, the rest of
// its length still to come. Draws nothing: the room's drawing (room_cell)
// covers all of it but the body.
static void room_begin(void) {
    uint8_t done = room_done[room_id];
    memset(occupied, 0, sizeof(occupied));
    for (uint8_t i = 0; i < sw_count; i++) {
        for (uint8_t k = sw_first[i], e = k + sw_n[i]; k < e; k++)
            occupied[CELL(sw_cx[k], sw_cy[k])] = (i + 1) << 1;
        sw_cover[i] = sw_was[i] = sw_timer[i] = 0;
        sw_down[i] = done;
    }
    sw_next = 1;
    for (uint8_t i = 0; i < ENEMY_MAX; i++) {
        en_state[i] = !done && i < en_count ? EN_ARMORED : EN_NONE;
        en_timer[i] = ENEMY_BEAT;
        en_bite[i] = BITE_EVERY;
        en_coiled[i] = en_k[i] = en_step[i] = 0;
        en_bx[i] = en_by[i] = 0;
    }
    if (!sw_count && !en_count) done = room_done[room_id] = 1;  // nothing to solve
    door_open = done;
    room_seen[room_id] = 1;
    key_shown = key_x != 0xFF && !key_got[room_id] && done;
    exit_timer = 0;
    paused = 0;
    dead_timer = 0;
    dir_queued = 0;
    noodle_parked = 0;
    step_timer = step_delay;
    slide_k = START_DELAY;  // at rest
    head_bx = head_by = tail_bx = tail_by = 0;
    head_turned = 0;
    body_i = 0xFF;
    if (entry_side == 0xFF) {
        // A new game: START_LEN cells heading right, tail first so the head
        // lands at body_i (play_enter draws them).
        noodle_dir = DIR_RIGHT;
        noodle_prev_dir = DIR_UP;  // so the first double-back bends upward
        noodle_len = START_LEN;
        grow_pending = room_start_len - START_LEN;
        head_x = room_start_x;
        head_y = room_start_y;
        for (uint8_t i = 0; i < START_LEN; i++) {
            body_i++;
            body_x[body_i] = head_x - START_LEN + 1 + i;
            body_y[body_i] = head_y;
        }
    } else {
        // Through a door: the tail in the doorway, the head just inside.
        uint8_t tx, ty, d = entry_side;
        if (d >= DIR_UP) {
            tx = head_x = door_x + entry_off;
            ty = d == DIR_UP ? DOOR_Y : room_th - 1;
            head_y = d == DIR_UP ? ROOM_Y0 : room_y1;
            noodle_dir = d == DIR_UP ? DIR_DOWN : DIR_UP;
            noodle_prev_dir = DIR_RIGHT;
        } else {
            ty = head_y = door_y + entry_off;
            tx = d == DIR_LEFT ? 1 : room_tw - 2;
            head_x = d == DIR_LEFT ? ROOM_X0 : room_x1;
            noodle_dir = d == DIR_LEFT ? DIR_RIGHT : DIR_LEFT;
            noodle_prev_dir = DIR_UP;
        }
        body_i = 1;
        body_x[0] = tx;
        body_y[0] = ty;
        body_x[1] = head_x;
        body_y[1] = head_y;
        noodle_len = 2;
        // The room feeds you up to the length its puzzle starts from.
        if (carry_len < room_start_len) carry_len = room_start_len;
        grow_pending = carry_len - 2;
        cover_in(head_x, head_y);
    }
    move_dir = noodle_dir;
    for (uint8_t i = body_i - noodle_len + 1; i != (uint8_t)(body_i + 1); i++)
        occupied[CELL(body_x[i], body_y[i])] |= OCC_BODY;
    place_food(1);
    room_name(room_id, room_title);
    hud_note = room_id == ROOM_GOAL ? "DUNGEON CLEAR!" : room_title;
    name_timer = NAME_FRAMES;
}

void play_enter(void) BANKED {
    palettes_play();
    banked_bkg_data(SCENE_TILES, BOARD_TILE_COUNT, board_tiles, BANK(board));
    banked_sprite_data(0, NOODLE_SPR_TILE_COUNT, noodle_spr_tiles, BANK(noodle_spr));
    if (play_fresh) {
        // A new game: the dungeon as it was, the noodle at the room's start.
        play_fresh = 0;
        memset(room_done, 0, sizeof(room_done));
        memset(room_seen, 0, sizeof(room_seen));
        memset(room_locks, 0, sizeof(room_locks));
        memset(key_got, 0, sizeof(key_got));
        keys = 0;
        score = 0;
        food_eaten = 0;
        step_delay = START_DELAY;
        entry_side = 0xFF;
        initrand(game_seed);
    }
    // Drawn whole at the top-left of the map: a new game, or a bigger room
    // fading in.
    map_ox = map_oy = 0;
    slide_dir = 0xFF;
    room_load();
    room_begin();
    palettes_marks_lit(door_open);
    room_draw();
    // The body (the head's cell stays floor: the head is a sprite; through a
    // door, the tail tip is in the doorway and the body still to come).
    if (entry_side == 0xFF)
        for (uint8_t i = body_i - noodle_len + 1; i != body_i; i++) put_now(body_x[i], body_y[i], T_TUBE_H, PLAY_PAL_NOODLE);
    // The HUD on the window, at the bottom (gfx.h HUD_WY). Its attributes are
    // BG_PAL_UI everywhere (gfx_init).
    move_win(7, HUD_WY);
    SHOW_WIN;
    gfx_sprite_split(HUD_WY);  // sprites stop above the HUD
    hud_draw();
    camera_update(1);
    noodle_draw();
    enemies_draw();
}

// The cell next to (x, y) in direction d, in ahead_x/ahead_y.
static uint8_t ahead_x, ahead_y;
static void next_to(uint8_t x, uint8_t y, uint8_t d) {
    ahead_x = x;
    ahead_y = y;
    switch (d) {
        case DIR_RIGHT: ahead_x++; break;
        case DIR_LEFT: ahead_x--; break;
        case DIR_UP: ahead_y--; break;
        default: ahead_y++; break;
    }
}
#define ahead(d) next_to(head_x, head_y, d)

// The head can go to (x, y): open floor, not the body, not an armored beetle.
static uint8_t free_cell(uint8_t x, uint8_t y) {
    if (!OPEN(x, y) || (occupied[CELL(x, y)] & OCC_BODY)) return 0;
    uint8_t e = enemy_at(x, y);
    return !e || en_state[e - 1] == EN_CRACKED;
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
        ahead(side);
        if (!free_cell(ahead_x, ahead_y)) side ^= 1;
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

// Parked with no way out: every cell next to the head is a wall, body or a
// beetle (the tail's cell counts as open: it moves away as the head moves in).
static uint8_t trapped(uint8_t tail) {
    for (uint8_t d = 0; d < 4; d++) {
        ahead(d);
        if (free_cell(ahead_x, ahead_y)) return 0;
        if (ahead_x == body_x[tail] && ahead_y == body_y[tail]) return 0;
    }
    return 1;
}

// The cells that change switches as the body moves: in, and out.
static void cover_in(uint8_t x, uint8_t y) {
    uint8_t id = SW_AT(CELL(x, y));
    if (id) sw_cover[id - 1]++;
}
static void cover_out(uint8_t x, uint8_t y) {
    uint8_t id = SW_AT(CELL(x, y));
    if (id) sw_cover[id - 1]--;
}

// The cell after the tail index t (where the tip goes next) is a bend: a
// straight tip can't follow the curve inside one cell, so the floor shows under
// it instead.
static uint8_t tail_on_bend(uint8_t t) {
    uint8_t u = t + 1, v = t + 2;
    return body_x[v] - body_x[u] != body_x[u] - body_x[t] || body_y[v] - body_y[u] != body_y[u] - body_y[t];
}

// A beetle bites: the tail end comes off. Down to the head and one segment,
// it's a crash.
static void shrink(void) {
    if (noodle_len <= 2) {
        crash();
        return;
    }
    uint8_t t = TAIL(), x = body_x[t], y = body_y[t];
    occupied[CELL(x, y)] &= ~OCC_BODY;
    cover_out(x, y);
    put_floor(x, y);
    noodle_len--;
    tail_bx = tail_by = 0;
    // The new tail's cell: under the tip, a bend shows as floor (as in step).
    if (tail_on_bend(t)) put_floor(body_x[(uint8_t)(t + 1)], body_y[(uint8_t)(t + 1)]);
    sfx_play(SFX_BITE);
    hud_score();
}

// A beetle coiled tight: the floor it can reach (4-way, past no body or wall)
// is no more than COIL_MAX cells.
static uint8_t fill_x[COIL_MAX], fill_y[COIL_MAX];
static uint8_t coiled(uint8_t i) {
    uint8_t n = 0;
    for (uint8_t k = 0; k < 4; k++) {
        fill_x[n] = en_cx[i] + (k & 1);
        fill_y[n] = en_cy[i] + (k >> 1);
        n++;
    }
    for (uint8_t j = 0; j < n; j++) {
        for (uint8_t d = 0; d < 4; d++) {
            next_to(fill_x[j], fill_y[j], d);
            uint8_t x = ahead_x, y = ahead_y;
            if (!OPEN(x, y) || (occupied[CELL(x, y)] & OCC_BODY)) continue;
            uint8_t m = 0;
            while (m < n && (fill_x[m] != x || fill_y[m] != y)) m++;
            if (m < n) continue;
            if (n == COIL_MAX) return 0;
            fill_x[n] = x;
            fill_y[n] = y;
            n++;
        }
    }
    return 1;
}

// After a move: a beetle newly coiled cracks.
static void check_coils(void) {
    for (uint8_t i = 0; i < ENEMY_MAX; i++) {
        if (!en_state[i]) continue;
        uint8_t c = coiled(i);
        if (c && !en_coiled[i] && en_state[i] == EN_ARMORED) {
            en_state[i] = EN_CRACKED;
            en_timer[i] = CRACK_FRAMES;
            sfx_play(SFX_CRACK);
        }
        en_coiled[i] = c;
    }
}

static void take_key(void) {
    key_shown = 0;
    key_got[room_id] = 1;
    keys++;
    sfx_play(SFX_KEY);
    note("GOT A KEY");
}

static void eat_enemy(uint8_t i) {
    en_state[i] = EN_NONE;
    grow_pending += EAT_GROW;
    score += EAT_SCORE;
    if (score > best_score) best_score = score;
    sfx_play(SFX_EAT);
}

// Solved: every switch is down and every beetle eaten. The room stays solved,
// its shutters open, the stones and buttons glow, and its key comes out.
static void unlock(void) {
    door_open = 1;
    room_done[room_id] = 1;
    for (uint8_t d = 0; d < 4; d++)
        if (room_doors[d]) door_redraw(d);
    palettes_marks_lit(1);
    gfx_set_fade(0);
    sfx_play(SFX_UNLOCK);
    note("DOOR OPEN");
    if (key_x != 0xFF && !key_got[room_id]) {
        key_shown = 1;
        if (head_x == key_x && head_y == key_y) take_key();
        else if (!(occupied[CELL(key_x, key_y)] & OCC_BODY)) put_floor(key_x, key_y);
    }
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
    // A door in the wall: open, a way out; shut or locked, it parks the noodle
    // (a key opens a locked one).
    uint8_t side = OPEN(x, y) ? 0xFF : door_at(x, y);
    uint8_t ds = side == 0xFF ? DS_WALL : door_state(side);
    uint8_t door = ds == DS_OPEN;
    uint8_t e = door ? 0 : enemy_at(x, y);
    // Unless it grows, the tail moves on this step: its cell is free to enter.
    uint8_t grows = (grow_pending || ate) && noodle_len < NOODLE_MAX;
    uint8_t tail = TAIL();
    if (!grows) occupied[CELL(body_x[tail], body_y[tail])] &= ~OCC_BODY;
    if (!door && (!OPEN(x, y) || (occupied[CELL(x, y)] & OCC_BODY) || (e && en_state[e - 1] != EN_CRACKED))) {
        if (!grows) occupied[CELL(body_x[tail], body_y[tail])] |= OCC_BODY;
        if (ds == DS_LOCKED && keys) {
            keys--;
            door_unlock(side);
            door_redraw(side);
            sfx_play(SFX_KEY);
            note("UNLOCKED");
            noodle_parked = 1;  // through it on the next beat
            return;
        }
        if (ds == DS_LOCKED && !noodle_parked) {
            sfx_play(SFX_WRONG);
            note("LOCKED");
        }
        // A wall, its own body, a beetle or a closed door parks it, unless
        // there's no way out: then the room starts again.
        if (trapped(tail)) crash();
        else noodle_parked = 1;
        return;
    }
    noodle_parked = 0;
    // The new head's cell, ahead of time: a 2-long noodle's tail looks at it.
    body_x[(uint8_t)(body_i + 1)] = x;
    body_y[(uint8_t)(body_i + 1)] = y;
    if (e) eat_enemy(e - 1);  // cracked: the head swallows it
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
        if (grow_pending) grow_pending--;
        else ate = 2;  // (the food's own segment, this move)
        tail_bx = tail_by = 0;  // the tail waits a move
    } else {
        cover_out(body_x[tail], body_y[tail]);
        put_floor(body_x[tail], body_y[tail]);
        // The tip slides along straights. Into a bend it steps at once, pointing
        // the new way: a straight tip can't follow the curve inside one cell.
        uint8_t t2 = tail + 1;
        tail_bx = body_x[tail] - body_x[t2];
        tail_by = body_y[tail] - body_y[t2];
        if (tail_on_bend(tail)) {
            tail_bx = tail_by = 0;
            // The tip covers the whole cell now; the bend under it would show.
            put_floor(body_x[t2], body_y[t2]);
        }
    }
    body_i++;
    body_x[body_i] = head_x = x;
    body_y[body_i] = head_y = y;
    occupied[CELL(x, y)] |= OCC_BODY;
    cover_in(x, y);
    slide_k = 0;
    if (key_shown && x == key_x && y == key_y) take_key();
    if (ate) {
        // Food is worth room_food segments: one grew already this move.
        grow_pending += room_food - (ate == 2 ? 1 : 0);
        score++;
        if (score > best_score) best_score = score;
        if (++food_eaten == FOOD_PER_SPEEDUP) {
            food_eaten = 0;
            if (step_delay > MIN_DELAY) step_delay--;
        }
        sfx_play(SFX_EAT);
        place_food(0);
    }
    if (grows) hud_score();
    check_coils();
    if (door) {
        exit_timer = 1;
        exit_side = side;
        exit_off = side >= DIR_UP ? x - door_x : y - door_y;
        sfx_play(SFX_START);
    }
}

// The next room slides in beside this one: it's drawn at the map tiles beyond
// this room's (the map wraps, so it overwrites this room's far side, which has
// gone off screen by then), a line at a time just before it comes into view,
// while the view moves over. Both rooms are one screen (room_small).
static void stream_line(uint8_t k) {
    uint8_t d = slide_dir;
    if (d <= DIR_LEFT) {
        uint8_t x = d == DIR_RIGHT ? k : room_tw - 1 - k;
        uint8_t *t = gfx_strip_attr(map_ox + x, map_oy, 1, room_th);
        for (uint8_t y = 0; y < room_th; y++) {
            t[y] = room_cell(x, y);
            t[STRIP_MAX_LEN + y] = cell_attr;
        }
    } else {
        uint8_t y = d == DIR_DOWN ? k : room_th - 1 - k;
        uint8_t *t = gfx_strip_attr(map_ox, map_oy + y, 0, room_tw);
        for (uint8_t x = 0; x < room_tw; x++) {
            t[x] = room_cell(x, y);
            t[STRIP_MAX_LEN + x] = cell_attr;
        }
    }
}

static void slide_start(uint8_t next) {
    uint8_t w = room_tw, h = room_th;
    switch (exit_side) {
        case DIR_RIGHT: map_ox += w; break;
        case DIR_LEFT: map_ox -= w; break;
        case DIR_DOWN: map_oy += h; break;
        default: map_oy -= h; break;
    }
    map_ox &= 31;
    map_oy &= 31;
    room_id = next;
    room_load();
    room_begin();
    slide_dir = exit_side;
    slide_t = slide_line = 0;
}

static void slide_update(void) {
    uint8_t across = slide_dir <= DIR_LEFT;
    uint8_t n = across ? room_tw : room_th, end = across ? VIEW_PX_W : VIEW_PX_H;
    // A line comes into view about every 8 px; draw two ahead.
    while (slide_line < n && (slide_line << 3) <= slide_t + 16) stream_line(slide_line++);
    slide_t += SLIDE_SPEED;
    if (slide_t == end >> 1) {  // half way: the stones take the new room's colors
        palettes_marks_lit(door_open);
        gfx_set_fade(0);
    }
    int16_t t = slide_t;
    view_x = view_y = 0;
    switch (slide_dir) {
        case DIR_RIGHT: view_x = t - VIEW_PX_W; break;
        case DIR_LEFT: view_x = VIEW_PX_W - t; break;
        case DIR_DOWN: view_y = t - VIEW_PX_H; break;
        default: view_y = VIEW_PX_H - t; break;
    }
    scroll_x = (uint8_t)view_x + (map_ox << 3);
    scroll_y = (uint8_t)view_y + (map_oy << 3);
    if (slide_t >= end) {
        slide_dir = 0xFF;
        camera_update(1);
        hud_draw();
    }
    noodle_draw();
    enemies_draw();
}

// START: the map on the window, over the whole screen (and no sprites); again,
// back to the room.
static void pause_toggle(void) {
    paused ^= 1;
    if (paused) {
        map_draw();
        move_win(7, 0);
        gfx_sprites(0);
    } else {
        move_win(7, HUD_WY);
        gfx_sprites(1);
        hud_draw();
    }
}

// The switch i is pressed: down, unless it's out of turn (then every button in
// a turn order pops up again).
static void press(uint8_t i) {
    uint8_t order = sw_flags[i] >> 6;
    if (order && order != sw_next) {
        for (uint8_t j = 0; j < sw_count; j++) {
            if ((sw_flags[j] >> 6) && sw_down[j]) {
                sw_down[j] = 0;
                sw_redraw(j);
            }
        }
        sw_next = 1;
        sfx_play(SFX_WRONG);
        return;
    }
    if (order) sw_next++;
    sw_down[i] = 1;
    if (!(sw_flags[i] & SW_STONES)) {
        sfx_play(SFX_CLICK);
        sw_redraw(i);
    }
}

// Every frame: which switches are pressed, and which stay down. Returns 1 if
// they're all down.
static uint8_t switches_update(void) {
    uint8_t all = 1;
    for (uint8_t i = 0; i < sw_count; i++) {
        uint8_t f = sw_flags[i], p;
        if (f & SW_HEAD) p = SW_AT(CELL(head_x, head_y)) == i + 1;
        else if (f & SW_TAIL) {
            uint8_t t = TAIL();
            p = SW_AT(CELL(body_x[t], body_y[t])) == i + 1;
        } else p = sw_cover[i] >= sw_need[i];
        if (p && !sw_was[i] && !sw_down[i]) press(i);
        sw_was[i] = p;
        if (f & SW_TIMED) {
            if (p) sw_timer[i] = TIMED_FRAMES;
            else if (sw_down[i] && !--sw_timer[i]) {
                sw_down[i] = 0;
                sw_redraw(i);
            }
        } else if (!p && sw_down[i] && !(f & (SW_LATCH | SW_ORDER(3)))) {
            sw_down[i] = 0;
            if (!(f & SW_STONES)) sw_redraw(i);
        }
        all &= sw_down[i];
    }
    return all;
}

// A beetle can step to the block at cell (x, y): inside the room, not on the
// body or the other beetle.
static uint8_t enemy_can_go(uint8_t i, uint8_t x, uint8_t y) {
    if (x < ROOM_X0 || x + 1 > room_x1 || y < ROOM_Y0 || y + 1 > room_y1) return 0;
    for (uint8_t k = 0; k < 4; k++)
        if (occupied[CELL(x + (k & 1), y + (k >> 1))] & OCC_BODY) return 0;
    for (uint8_t j = 0; j < ENEMY_MAX; j++)
        if (j != i && en_state[j] && (uint8_t)(x - en_cx[j] + 1) < 3 && (uint8_t)(y - en_cy[j] + 1) < 3) return 0;
    return 1;
}

// The body is next to the beetle's block (it can bite).
static uint8_t enemy_touching(uint8_t i) {
    uint8_t x = en_cx[i], y = en_cy[i];
    for (uint8_t k = 0; k < 2; k++) {
        if (occupied[CELL(x - 1, y + k)] & OCC_BODY) return 1;
        if (occupied[CELL(x + 2, y + k)] & OCC_BODY) return 1;
        if (occupied[CELL(x + k, y - 1)] & OCC_BODY) return 1;
        if (occupied[CELL(x + k, y + 2)] & OCC_BODY) return 1;
    }
    return 0;
}

// Every frame, on their own clock: beetles wander a block at a time, bite
// what's next to them, and harden again if not eaten in time. Returns the
// number left.
static uint8_t enemies_update(void) {
    uint8_t left = 0;
    for (uint8_t i = 0; i < ENEMY_MAX; i++) {
        if (!en_state[i]) continue;
        left++;
        if (en_k[i] < 255) en_k[i]++;
        if (en_state[i] == EN_CRACKED) {
            if (!--en_timer[i]) {
                en_state[i] = EN_ARMORED;
                en_timer[i] = ENEMY_BEAT;
                en_bite[i] = BITE_EVERY;
            }
            continue;
        }
        if (!--en_bite[i]) {
            en_bite[i] = BITE_EVERY;
            if (enemy_touching(i)) shrink();
        }
        if (--en_timer[i]) continue;
        en_timer[i] = ENEMY_BEAT;
        if (en_bite[i] < BITE_WARN) continue;  // it stands still before a bite
        // A step a random way, or the next way round that's free.
        uint8_t d = rand() & 3;
        for (uint8_t tries = 0; tries < 4; tries++, d = (d + 1) & 3) {
            int8_t dx = d == DIR_RIGHT ? 2 : d == DIR_LEFT ? -2 : 0;
            int8_t dy = d == DIR_DOWN ? 2 : d == DIR_UP ? -2 : 0;
            uint8_t x = en_cx[i] + dx, y = en_cy[i] + dy;
            if (!enemy_can_go(i, x, y)) continue;
            en_cx[i] = x;
            en_cy[i] = y;
            en_bx[i] = -(dx >> 1);
            en_by[i] = -(dy >> 1);
            en_k[i] = 0;
            en_step[i]++;
            break;
        }
    }
    return left;
}

void play_update(void) BANKED {
    if (dead_timer) {
        // The room starts again as it was when the noodle came in, at the
        // length it came in with (entry_side, carry_len). Later: a heart.
        if (++dead_timer > DEATH_FRAMES) state_restart();
        return;
    }
    if (slide_dir != 0xFF) {
        slide_update();
        return;
    }
    // Through the door: let the head slide in, then the next room.
    if (exit_timer) {
        if (++exit_timer > EXIT_FRAMES) {
            uint8_t next = room_beyond(exit_side);
            carry_len = noodle_len + grow_pending;
            entry_side = exit_side ^ 1;  // DIR_* pairs differ in bit 0
            entry_off = exit_off;
            if (room_small(room_id) && room_small(next)) slide_start(next);
            else {
                room_id = next;  // a bigger room fades in
                state_restart();
            }
            return;
        }
        if (slide_k < step_delay) slide_k++;
        camera_update(0);
        noodle_draw();
        enemies_draw();
        return;
    }
    if (joy_pressed & J_START) {
        pause_toggle();
        return;
    }
    if (paused) return;
    if (name_timer && !--name_timer) hud_draw();
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
        if (dead_timer || exit_timer) return;
    }
    uint8_t all = door_open || switches_update();
    uint8_t left = enemies_update();
    if (dead_timer) return;
    if (!door_open && all && !left) unlock();
    if (slide_k < step_delay) slide_k++;
    camera_update(0);
    noodle_draw();
    enemies_draw();
}
