// Rooms: drawing the walls and floor, and the camera (room.c). game.h has the
// layout and the room globals.
#ifndef ROOM_H
#define ROOM_H

#include <gb/gb.h>
#include <stdint.h>
#include "gfx.h"

// Tiles, in tools/tile-art.mjs's order.
#define T_GRASS (SCENE_TILES + 0)        // a 16x16 floor block: 4 tiles, TL TR BL BR
#define T_WALL_CAP (SCENE_TILES + 4)     // the top of a wall
#define T_WALL_EDGE (SCENE_TILES + 5)    // a side wall's inner column (flipped: the right)
#define T_WALL_FACE (SCENE_TILES + 6)    // the back wall's face
#define T_WALL_BOTTOM (SCENE_TILES + 7)  // the near wall
#define T_WALL_CORNER (SCENE_TILES + 8)  // where a side wall meets the near wall
#define T_TUBE_H (SCENE_TILES + 9)   // the body, left to right
#define T_TUBE_V (SCENE_TILES + 10)  // the body, up and down
#define T_BEND_H (SCENE_TILES + 11)  // from the left (the tail side), turning down
#define T_BEND_V (SCENE_TILES + 12)  // from the top, turning right (its rotation)
#define T_FOOD (SCENE_TILES + 13)
#define T_MARK (SCENE_TILES + 14)       // a stone of the room's shape
#define T_DOOR_SHUT (SCENE_TILES + 15)  // the door's left half (flipped: right)
#define T_DOOR_OPEN (SCENE_TILES + 16)
// Background tile attributes (VRAM bank 1): bits 0-2 palette, 5 x flip, 6 y flip.
#define A_FLIPX 0x20
#define A_FLIPY 0x40

// The floor tile under an open cell: which quarter of its 16x16 block (blocks
// start at cell 2, so even cells are their left/top halves).
#define FLOOR_TILE(x, y) (T_GRASS + ((x) & 1) + (((y) & 1) << 1))

// Set room_bw ... room_y1 from room_id.
void room_load(void) BANKED;
// Draw the whole room into the background map (display off).
void room_draw(void) BANKED;

// The camera: the view's top-left in room pixels, 1/16 px (watchable). It eases
// after the noodle's head, looking ahead the way it's going, and stays inside
// the room; scroll_x/scroll_y (gfx.h) are what's drawn.
extern int16_t cam_fx, cam_fy;
// Follow the head (snap: jump straight there, for a room's first frame).
void camera_update(uint8_t snap) BANKED;

#endif
