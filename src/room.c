#pragma bank 255
// Rooms: their size, drawing their walls and floor, and the camera that scrolls
// over rooms larger than the screen. game.h has the layout.
#include <gb/gb.h>
#include <gb/cgb.h>
#include "gfx.h"
#include "game.h"
#include "room.h"

// Room sizes in blocks (W, H), by room_id.
static const uint8_t rooms[ROOM_COUNT][2] = {
    {8, 7},    // one screen
    {14, 12},  // 256x216 px: scrolls both ways
};

uint8_t room_id = 1;
uint8_t room_bw, room_bh, room_tw, room_th, room_x1, room_y1;
int16_t cam_fx, cam_fy;
uint8_t cam_max_x, cam_max_y;  // the largest scroll that keeps the view in the room

#define VIEW_W 160
#define VIEW_H (PLAYFIELD_TH * 8)  // 136
#define CAM_LEAD 24       // px the view looks ahead of the head, the way it's going
#define CAM_MAX_STEP 48   // 1/16 px a frame (3 px): faster than the noodle's 2 px

void room_load(void) BANKED {
    if (room_id >= ROOM_COUNT) room_id = 0;
    room_bw = rooms[room_id][0];
    room_bh = rooms[room_id][1];
    room_tw = 4 + (room_bw << 1);
    room_th = 3 + (room_bh << 1);
    room_x1 = room_tw - 3;
    room_y1 = room_th - 2;
    cam_max_x = (uint8_t)(((uint16_t)room_tw << 3) - VIEW_W);
    cam_max_y = (uint8_t)(((uint16_t)room_th << 3) - VIEW_H);
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
