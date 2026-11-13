#pragma bank 255
// Rooms: their size, drawing their walls and floor, and the camera that scrolls
// over rooms larger than the screen. game.h has the layout.
#include <gb/gb.h>
#include <gb/cgb.h>
#include "gfx.h"
#include "game.h"
#include "room.h"

// The demo rooms, one puzzle or enemy each (the design doc's puzzle toolkit).
// Objects: O_STONES n then n cells (x, y); O_BUTTON flags then its block
// (bx, by); O_BEETLE then its block; O_END. Block (bx, by) is cells
// (2 + 2bx, 2 + 2by): game.h.
#define O_END 0
#define O_STONES 1
#define O_BUTTON 2
#define O_BEETLE 3
typedef struct {
    uint8_t bw, bh;               // blocks
    uint8_t start_x, start_y;     // the head's cell
    uint8_t start_len, need, food;
    const uint8_t *objects;
    const char *name;
} Room;

static const uint8_t s_curve[] = {O_STONES, 11, 12, 3, 13, 3, 14, 3, 12, 4, 12, 5, 13, 5, 14, 5, 14, 6, 12, 7, 13, 7, 14, 7, O_END};
static const uint8_t ring[] = {O_STONES, 8, 12, 4, 13, 4, 14, 4, 12, 5, 14, 5, 12, 6, 13, 6, 14, 6, O_END};
static const uint8_t two_buttons[] = {O_BUTTON, SW_LATCH, 1, 1, O_BUTTON, SW_LATCH, 6, 5, O_END};
static const uint8_t four_corners[] = {O_BUTTON, 0, 2, 2, O_BUTTON, 0, 4, 2, O_BUTTON, 0, 2, 4, O_BUTTON, 0, 4, 4, O_END};
static const uint8_t heavy[] = {O_BUTTON, SW_LATCH | SW_HEAVY, 2, 1, O_BUTTON, SW_LATCH | SW_HEAVY, 5, 4, O_END};
static const uint8_t quick[] = {O_BUTTON, SW_TIMED, 1, 1, O_BUTTON, SW_TIMED, 3, 3, O_BUTTON, SW_TIMED, 5, 5, O_END};
static const uint8_t in_order[] = {O_BUTTON, SW_ORDER(1), 5, 1, O_BUTTON, SW_ORDER(2), 1, 4, O_BUTTON, SW_ORDER(3), 5, 5, O_END};
static const uint8_t head_tail[] = {O_BUTTON, SW_TAIL, 2, 3, O_BUTTON, SW_HEAD, 6, 3, O_END};
static const uint8_t beetle[] = {O_BEETLE, 5, 2, O_END};
static const uint8_t guard[] = {O_BEETLE, 3, 1, O_BUTTON, SW_LATCH | SW_HEAVY, 6, 5, O_END};

static const Room rooms[ROOM_COUNT] = {
    {8, 7, 7, 8, 3, 11, 1, s_curve, "1 THE S"},
    {14, 12, 7, 8, 3, 8, 1, ring, "2 THE RING"},
    {8, 7, 7, 8, 3, 3, 1, two_buttons, "3 TWO BUTTONS"},
    {8, 7, 5, 14, 10, 10, 2, four_corners, "4 FOUR CORNERS"},
    {8, 7, 7, 8, 4, 4, 1, heavy, "5 HEAVY BUTTONS"},
    {8, 7, 6, 14, 3, 3, 1, quick, "6 QUICK STEPS"},
    {8, 7, 7, 8, 3, 3, 1, in_order, "7 IN ORDER"},
    {8, 7, 5, 12, 8, 8, 0, head_tail, "8 HEAD AND TAIL"},
    {8, 7, 7, 8, 12, 12, 2, beetle, "9 COIL A BEETLE"},
    {8, 7, 7, 13, 12, 12, 2, guard, "10 BEETLE GUARD"},
};

uint8_t room_id = 1;
uint8_t room_bw, room_bh, room_tw, room_th, room_x1, room_y1;
uint8_t room_start_x, room_start_y, room_start_len, room_need, room_food;
uint8_t sw_count;
uint8_t sw_flags[SW_MAX], sw_need[SW_MAX], sw_tile[SW_MAX];
uint8_t sw_first[SW_MAX], sw_n[SW_MAX];
uint8_t sw_cx[SW_CELLS_MAX], sw_cy[SW_CELLS_MAX];
uint8_t door_x;
uint8_t en_count;
uint8_t en_cx[ENEMY_MAX], en_cy[ENEMY_MAX];
int16_t cam_fx, cam_fy;
uint8_t cam_max_x, cam_max_y;  // the largest scroll that keeps the view in the room

#define VIEW_W 160
#define VIEW_H (PLAYFIELD_TH * 8)  // 136
#define CAM_LEAD 24       // px the view looks ahead of the head, the way it's going
#define CAM_MAX_STEP 48   // 1/16 px a frame (3 px): faster than the noodle's 2 px

void room_name(uint8_t id, char *buf) BANKED {
    const char *n = rooms[id].name;
    uint8_t i = 0;
    while (n[i] && i < ROOM_NAME_MAX) buf[i] = n[i], i++;
    buf[i] = 0;
}

// A button's glyph, by its flags.
static uint8_t button_tile(uint8_t f) {
    uint8_t g = BUTTON_PLAIN;
    if (f >> 6) g = BUTTON_1 - 1 + (f >> 6);
    else if (f & SW_HEAD) g = BUTTON_HEAD;
    else if (f & SW_TAIL) g = BUTTON_TAIL;
    else if (f & SW_HEAVY) g = BUTTON_HEAVY;
    else if (f & SW_TIMED) g = BUTTON_TIMED;
    return T_BUTTON + (g << 2);
}

void room_load(void) BANKED {
    if (room_id >= ROOM_COUNT) room_id = 0;
    const Room *r = &rooms[room_id];
    room_bw = r->bw;
    room_bh = r->bh;
    room_start_x = r->start_x;
    room_start_y = r->start_y;
    room_start_len = r->start_len;
    room_need = r->need;
    room_food = r->food;
    room_tw = 4 + (room_bw << 1);
    room_th = 3 + (room_bh << 1);
    room_x1 = room_tw - 3;
    room_y1 = room_th - 2;
    cam_max_x = (uint8_t)(((uint16_t)room_tw << 3) - VIEW_W);
    cam_max_y = (uint8_t)(((uint16_t)room_th << 3) - VIEW_H);
    // The door: the middle block of the back wall (left of middle if even).
    door_x = ROOM_X0 + (((room_bw - 1) >> 1) << 1);
    // Its switches and enemies.
    const uint8_t *o = r->objects;
    uint8_t cells = 0;
    sw_count = en_count = 0;
    for (;;) {
        uint8_t kind = *o++;
        if (kind == O_END) break;
        if (kind == O_BEETLE) {
            en_cx[en_count] = ROOM_X0 + (o[0] << 1);
            en_cy[en_count] = ROOM_Y0 + (o[1] << 1);
            en_count++;
            o += 2;
            continue;
        }
        uint8_t i = sw_count++;
        sw_first[i] = cells;
        if (kind == O_STONES) {
            uint8_t n = *o++;
            sw_flags[i] = SW_STONES;
            sw_need[i] = sw_n[i] = n;
            sw_tile[i] = T_MARK;
            while (n--) {
                sw_cx[cells] = *o++;
                sw_cy[cells] = *o++;
                cells++;
            }
        } else {  // O_BUTTON
            uint8_t f = *o++;
            uint8_t x = ROOM_X0 + (o[0] << 1), y = ROOM_Y0 + (o[1] << 1);
            o += 2;
            sw_flags[i] = f;
            sw_need[i] = f & SW_HEAVY ? 4 : 1;
            sw_n[i] = 4;
            sw_tile[i] = button_tile(f);
            for (uint8_t k = 0; k < 4; k++) {
                sw_cx[cells] = x + (k & 1);
                sw_cy[cells] = y + (k >> 1);
                cells++;
            }
        }
    }
}

void room_draw(void) BANKED {
    const uint8_t W = room_tw, H = room_th, B = H - 1;  // B: the near wall's row
    // Attributes: walls, the right-hand ones flipped, and the floor.
    VBK_REG = 1;
    fill_bkg_rect(0, 0, W, H, PLAY_PAL_WALL);
    fill_bkg_rect(W - 2, 1, 2, H - 1, PLAY_PAL_WALL | A_FLIPX);
    fill_bkg_rect(ROOM_X0, ROOM_Y0, W - 4, H - 3, PLAY_PAL_BOARD);
    VBK_REG = 0;
    // Wall tops all round, then the details.
    fill_bkg_rect(0, 0, W, H, T_WALL_CAP);
    fill_bkg_rect(1, 1, 1, H - 2, T_WALL_EDGE);
    fill_bkg_rect(W - 2, 1, 1, H - 2, T_WALL_EDGE);
    fill_bkg_rect(2, 1, W - 4, 1, T_WALL_FACE);
    fill_bkg_rect(2, B, W - 4, 1, T_WALL_BOTTOM);
    set_bkg_tile_xy(1, B, T_WALL_CORNER);
    set_bkg_tile_xy(W - 2, B, T_WALL_CORNER);
    static const uint8_t grass[4] = {T_GRASS, T_GRASS + 1, T_GRASS + 2, T_GRASS + 3};
    for (uint8_t y = ROOM_Y0; y < B; y += 2)
        for (uint8_t x = ROOM_X0; x < W - 2; x += 2) set_bkg_tiles(x, y, 2, 2, grass);
    // The switches (up), and the door, shut.
    for (uint8_t i = 0; i < sw_count; i++) {
        uint8_t stones = sw_flags[i] & SW_STONES;
        for (uint8_t k = sw_first[i], e = k + sw_n[i]; k < e; k++) {
            uint8_t x = sw_cx[k], y = sw_cy[k];
            VBK_REG = 1;
            set_bkg_tile_xy(x, y, PLAY_PAL_MARK);
            VBK_REG = 0;
            set_bkg_tile_xy(x, y, stones ? sw_tile[i] : sw_tile[i] + (x & 1) + ((y & 1) << 1));
        }
    }
    VBK_REG = 1;
    set_bkg_tile_xy(door_x, DOOR_Y, PLAY_PAL_WALL);
    set_bkg_tile_xy(door_x + 1, DOOR_Y, PLAY_PAL_WALL | A_FLIPX);
    VBK_REG = 0;
    set_bkg_tile_xy(door_x, DOOR_Y, T_DOOR_SHUT);
    set_bkg_tile_xy(door_x + 1, DOOR_Y, T_DOOR_SHUT);
}

// Where the camera wants to be on one axis (1/16 px): the head's cell centred in
// the view, plus the lead, kept inside the room.
static int16_t cam_goal(uint8_t cell, int8_t lead, uint8_t half_view, uint8_t max) {
    int16_t g = ((int16_t)cell << 3) + 4 - half_view + lead;
    if (g < 0) g = 0;
    else if (g > max) g = max;
    return g << 4;
}

// An eighth of the way there a frame, at most CAM_MAX_STEP: the head moves a
// whole cell at a time, and the view glides after it.
static int16_t cam_ease(int16_t f, int16_t goal) {
    int16_t d = goal - f;
    int16_t s = d >> 3;
    if (!s) return goal;
    if (s > CAM_MAX_STEP) s = CAM_MAX_STEP;
    else if (s < -CAM_MAX_STEP) s = -CAM_MAX_STEP;
    return f + s;
}

void camera_update(uint8_t snap) BANKED {
    int8_t lx = 0, ly = 0;
    switch (noodle_dir) {
        case DIR_RIGHT: lx = CAM_LEAD; break;
        case DIR_LEFT: lx = -CAM_LEAD; break;
        case DIR_UP: ly = -CAM_LEAD; break;
        default: ly = CAM_LEAD; break;
    }
    int16_t gx = cam_goal(head_x, lx, VIEW_W / 2, cam_max_x);
    int16_t gy = cam_goal(head_y, ly, VIEW_H / 2, cam_max_y);
    if (snap) {
        cam_fx = gx;
        cam_fy = gy;
    } else {
        cam_fx = cam_ease(cam_fx, gx);
        cam_fy = cam_ease(cam_fy, gy);
    }
    scroll_x = (uint8_t)(cam_fx >> 4);
    scroll_y = (uint8_t)(cam_fy >> 4);
}
