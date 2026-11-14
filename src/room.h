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
#define T_BUTTON (SCENE_TILES + 17)     // 16x16 buttons, 4 tiles each, by BUTTON_*
#define BUTTON_PLAIN 0
#define BUTTON_1 1  // 2 and 3 follow
#define BUTTON_HEAD 4
#define BUTTON_TAIL 5
#define BUTTON_HEAVY 6
#define BUTTON_TIMED 7
#define T_DOOR_LOCK (SCENE_TILES + 49)   // the back wall's locked door
#define T_DOORS_SHUT (SCENE_TILES + 50)  // doors in the near wall: shut, open, locked
#define T_DOORW_SHUT (SCENE_TILES + 53)  // ... and in a side wall (top half; flip Y: bottom)
#define T_KEY (SCENE_TILES + 56)
#define T_MAP_ROOM (SCENE_TILES + 57)    // the map: a room seen, the room you're in,
#define T_MAP_HERE (SCENE_TILES + 58)
#define T_MAP_DOOR_H (SCENE_TILES + 59)  // a door across (its bar low in the tile), down,
#define T_MAP_DOOR_V (SCENE_TILES + 60)
#define T_MAP_SHUT_H (SCENE_TILES + 61)  // and shut ones, dotted
#define T_MAP_SHUT_V (SCENE_TILES + 62)
// Background tile attributes (VRAM bank 1): bits 0-2 palette, 5 x flip, 6 y flip.
#define A_FLIPX 0x20
#define A_FLIPY 0x40

// The floor tile under an open cell: which quarter of its 16x16 block (blocks
// start at cell 2, so even cells are their left/top halves).
#define FLOOR_TILE(x, y) (T_GRASS + ((x) & 1) + (((y) & 1) << 1))

// Set room_bw ... room_y1 from room_id.
void room_load(void) BANKED;
// A room fits one screen (rooms slide into each other; a bigger one fades).
uint8_t room_small(uint8_t id) BANKED;
// The room beyond room_id's side `dir` (DIR_*), 0xFF if none.
uint8_t room_beyond(uint8_t dir) BANKED;
// The door at cell (x, y), as its side (DIR_*), or 0xFF.
uint8_t door_at(uint8_t x, uint8_t y) BANKED;
// A side's door now (DS_*): from its kind, the rooms solved, the locks opened.
#define DS_WALL 0
#define DS_OPEN 1
#define DS_SHUT 2    // a shutter: opens when its room is solved
#define DS_LOCKED 3  // opens with a key
uint8_t door_state(uint8_t dir) BANKED;
// Open a locked door, on both its sides.
void door_unlock(uint8_t dir) BANKED;
// The dungeon map, on the window (paused).
void map_draw(void) BANKED;
// What room cell (x, y) shows (walls, doors, floor, switches, food, the key;
// not the body): its tile, and its attributes in cell_attr.
extern uint8_t cell_attr;
uint8_t room_cell(uint8_t x, uint8_t y) BANKED;
// Room id's name ("4 FOUR CORNERS"), into buf (RAM, ROOM_NAME_MAX + 1 bytes).
#define ROOM_NAME_MAX 18
void room_name(uint8_t id, char *buf) BANKED;
// Draw the whole room into the background map (display off).
void room_draw(void) BANKED;

// The camera: the view's top-left in room pixels, 1/16 px (watchable). It eases
// after the noodle's head, looking ahead the way it's going, and stays inside
// the room; scroll_x/scroll_y (gfx.h) are what's drawn.
extern int16_t cam_fx, cam_fy;
// Follow the head (snap: jump straight there, for a room's first frame).
void camera_update(uint8_t snap) BANKED;

#endif
