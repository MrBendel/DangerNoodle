#pragma bank 255
// Rooms: the dungeon's map, each room's size, doors and puzzle, drawing them,
// and the camera that scrolls over rooms larger than the screen. game.h has the
// layout.
#include <gb/gb.h>
#include <gb/cgb.h>
#include "gfx.h"
#include "game.h"
#include "room.h"

// The dungeon: a grid of rooms (DUNGEON_W x DUNGEON_H), each a puzzle or an
// enemy from the design doc's toolkit, joined by doors in the middle of their
// sides. A door's kind, by side (DIR_* order: right, left, up, down):
#define D_WALL 0
#define D_OPEN 1
#define D_MINE 2    // a shutter, open once this room is solved
#define D_THEIRS 3  // a shutter, open once the room beyond is solved
#define D_LOCK 4    // locked: a key opens it, for good
// (a shutter is D_MINE on one side and D_THEIRS on the other.)
//
// Objects: O_STONES n then n cells (x, y); O_BUTTON flags then its block
// (bx, by); O_BEETLE then its block; O_KEY then its cell; O_SPIKES then its
// wall (DIR_*), first cell along it, length and phase (frames into the spike
// clock, < SPIKE_PERIOD); O_BLADE then its block; O_END. Block (bx, by) is
// cells (2 + 2bx, 2 + 2by): game.h. A puzzle room's key appears when it's
// solved.
#define O_END 0
#define O_STONES 1
#define O_BUTTON 2
#define O_BEETLE 3
#define O_KEY 4
#define O_SPIKES 5
#define O_BLADE 6
typedef struct {
    uint8_t bw, bh;               // blocks
    uint8_t start_x, start_y;     // the head's cell, on a new game (heading right)
    uint8_t start_len, need, food;
    uint8_t gx, gy;               // on the dungeon grid
    uint8_t doors[4];
    const uint8_t *objects;
    const char *name;
} Room;

static const uint8_t empty[] = {O_END};
static const uint8_t s_curve[] = {O_STONES, 11, 12, 3, 13, 3, 14, 3, 12, 4, 12, 5, 13, 5, 14, 5, 14, 6, 12, 7, 13, 7, 14, 7, O_END};
static const uint8_t ring[] = {O_STONES, 8, 12, 4, 13, 4, 14, 4, 12, 5, 14, 5, 12, 6, 13, 6, 14, 6, O_END};
static const uint8_t two_buttons[] = {O_BUTTON, SW_LATCH, 1, 1, O_BUTTON, SW_LATCH, 6, 5, O_END};
static const uint8_t four_corners[] = {O_BUTTON, 0, 2, 2, O_BUTTON, 0, 4, 2, O_BUTTON, 0, 2, 4, O_BUTTON, 0, 4, 4, O_END};
static const uint8_t heavy[] = {O_BUTTON, SW_LATCH | SW_HEAVY, 2, 1, O_BUTTON, SW_LATCH | SW_HEAVY, 5, 4, O_KEY, 9, 10, O_END};
static const uint8_t quick[] = {O_BUTTON, SW_TIMED, 1, 1, O_BUTTON, SW_TIMED, 3, 3, O_BUTTON, SW_TIMED, 5, 5, O_END};
static const uint8_t in_order[] = {O_BUTTON, SW_ORDER(1), 5, 1, O_BUTTON, SW_ORDER(2), 1, 4, O_BUTTON, SW_ORDER(3), 5, 5, O_END};
static const uint8_t head_tail[] = {O_BUTTON, SW_TAIL, 2, 3, O_BUTTON, SW_HEAD, 6, 3, O_END};
static const uint8_t beetle[] = {O_BEETLE, 5, 2, O_END};
static const uint8_t guard[] = {O_BEETLE, 3, 1, O_BUTTON, SW_LATCH | SW_HEAVY, 6, 5, O_END};
// Two blades guard the way down to the button: cross their rows where they
// can't reach you in time, or set one off and slip by while it comes back.
static const uint8_t blades[] = {O_BLADE, 7, 2, O_BLADE, 0, 6, O_BUTTON, SW_LATCH, 6, 6, O_END};
// Spikes in three walls, firing in turn; the buttons are in the corners.
static const uint8_t spikes[] = {
    O_SPIKES, DIR_UP, 2, 16, 0, O_SPIKES, DIR_LEFT, 2, 14, 60, O_SPIKES, DIR_DOWN, 2, 16, 120,
    O_BUTTON, SW_LATCH, 0, 0, O_BUTTON, SW_LATCH, 0, 6, O_END};

// The map (x right, y down), and the way through: west from the entrance, up
// the left side, across the top (the ring is a side room), down the right and
// back west to the heavy buttons, whose key opens the entrance's east door.
//
//   THE RING      COIL A BEETLE   BEETLE GUARD    HEAD AND TAIL
//   THE S         FOUR CORNERS    HEAVY BUTTONS   IN ORDER
//   QUICK STEPS   TWO BUTTONS     ENTRANCE        TREASURE
//                 SPIKE WALLS     BLADE TRAPS
// (the hazards: down from the entrance, a side trip.)
static const Room rooms[ROOM_COUNT] = {
    {8, 7, 7, 6, 3, 3, 1, 2, 2, {D_LOCK, D_OPEN, D_THEIRS, D_OPEN}, empty, "ENTRANCE"},
    {8, 7, 7, 8, 3, 3, 1, 1, 2, {D_OPEN, D_MINE, D_WALL, D_WALL}, two_buttons, "TWO BUTTONS"},
    {8, 7, 6, 14, 3, 3, 1, 0, 2, {D_THEIRS, D_WALL, D_MINE, D_WALL}, quick, "QUICK STEPS"},
    {8, 7, 7, 8, 3, 11, 1, 0, 1, {D_MINE, D_WALL, D_WALL, D_THEIRS}, s_curve, "THE S"},
    {8, 7, 5, 14, 10, 10, 2, 1, 1, {D_WALL, D_THEIRS, D_MINE, D_WALL}, four_corners, "FOUR CORNERS"},
    {8, 7, 7, 8, 12, 12, 2, 1, 0, {D_MINE, D_OPEN, D_WALL, D_THEIRS}, beetle, "COIL A BEETLE"},
    {14, 12, 7, 8, 3, 8, 1, 0, 0, {D_OPEN, D_WALL, D_WALL, D_WALL}, ring, "THE RING"},
    {8, 7, 7, 13, 12, 12, 2, 2, 0, {D_MINE, D_THEIRS, D_WALL, D_WALL}, guard, "BEETLE GUARD"},
    {8, 7, 5, 12, 8, 8, 0, 3, 0, {D_WALL, D_THEIRS, D_WALL, D_MINE}, head_tail, "HEAD AND TAIL"},
    {8, 7, 7, 8, 3, 3, 1, 3, 1, {D_WALL, D_MINE, D_THEIRS, D_WALL}, in_order, "IN ORDER"},
    {8, 7, 7, 8, 4, 4, 1, 2, 1, {D_THEIRS, D_WALL, D_WALL, D_MINE}, heavy, "HEAVY BUTTONS"},
    {8, 7, 7, 8, 3, 3, 2, 3, 2, {D_WALL, D_LOCK, D_WALL, D_WALL}, empty, "TREASURE"},
    {8, 7, 7, 8, 3, 3, 1, 2, 3, {D_WALL, D_MINE, D_OPEN, D_WALL}, blades, "BLADE TRAPS"},
    {8, 7, 7, 8, 3, 3, 1, 1, 3, {D_THEIRS, D_WALL, D_WALL, D_WALL}, spikes, "SPIKE WALLS"},
};

uint8_t room_id;
uint8_t room_bw, room_bh, room_tw, room_th, room_x1, room_y1;
uint8_t room_start_x, room_start_y, room_start_len, room_need, room_food;
uint8_t room_doors[4];
uint8_t sw_count;
uint8_t sw_flags[SW_MAX], sw_need[SW_MAX], sw_tile[SW_MAX];
uint8_t sw_first[SW_MAX], sw_n[SW_MAX];
uint8_t sw_cx[SW_CELLS_MAX], sw_cy[SW_CELLS_MAX];
uint8_t door_x, door_y;
uint8_t en_count;
uint8_t en_cx[ENEMY_MAX], en_cy[ENEMY_MAX];
uint8_t key_x, key_y, key_shown;
uint8_t spk_count;
uint8_t spk_side[SPIKE_MAX], spk_from[SPIKE_MAX], spk_n[SPIKE_MAX], spk_phase[SPIKE_MAX];
uint8_t spk_state[SPIKE_MAX];
uint8_t bl_count;
uint8_t bl_hx[BLADE_MAX], bl_hy[BLADE_MAX];
uint8_t room_done[ROOM_COUNT], room_seen[ROOM_COUNT], room_locks[ROOM_COUNT], key_got[ROOM_COUNT];
uint8_t keys;
uint8_t map_ox, map_oy;
int16_t view_x, view_y;
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

uint8_t room_small(uint8_t id) BANKED {
    return rooms[id].bw == ROOM_BW_MIN && rooms[id].bh == ROOM_BH_MIN;
}

static uint8_t beyond(uint8_t id, uint8_t dir) {
    uint8_t x = rooms[id].gx, y = rooms[id].gy;
    switch (dir) {
        case DIR_RIGHT: x++; break;
        case DIR_LEFT: x--; break;
        case DIR_UP: y--; break;
        default: y++; break;
    }
    for (uint8_t i = 0; i < ROOM_COUNT; i++)
        if (rooms[i].gx == x && rooms[i].gy == y) return i;
    return 0xFF;
}

uint8_t room_beyond(uint8_t dir) BANKED {
    return beyond(room_id, dir);
}

static uint8_t state_of(uint8_t id, uint8_t dir) {
    uint8_t n;
    switch (rooms[id].doors[dir]) {
        case D_WALL: return DS_WALL;
        case D_OPEN: return DS_OPEN;
        case D_MINE: return room_done[id] ? DS_OPEN : DS_SHUT;
        case D_THEIRS:
            n = beyond(id, dir);
            return n != 0xFF && room_done[n] ? DS_OPEN : DS_SHUT;
        default: return room_locks[id] & (1 << dir) ? DS_OPEN : DS_LOCKED;
    }
}

uint8_t door_state(uint8_t dir) BANKED {
    return state_of(room_id, dir);
}

void door_unlock(uint8_t dir) BANKED {
    room_locks[room_id] |= 1 << dir;
    uint8_t n = beyond(room_id, dir);
    if (n != 0xFF) room_locks[n] |= 1 << (dir ^ 1);  // DIR_* pairs differ in bit 0
}

static uint8_t door_cell(uint8_t x, uint8_t y) {
    uint8_t d = 0xFF;
    if ((uint8_t)(x - door_x) < 2) {
        if (y == DOOR_Y) d = DIR_UP;
        else if (y == room_th - 1) d = DIR_DOWN;
    } else if ((uint8_t)(y - door_y) < 2) {
        if (x == 1) d = DIR_LEFT;
        else if (x == room_tw - 2) d = DIR_RIGHT;
    }
    if (d != 0xFF && !room_doors[d]) return 0xFF;
    return d;
}

uint8_t door_at(uint8_t x, uint8_t y) BANKED {
    return door_cell(x, y);
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
    for (uint8_t d = 0; d < 4; d++) room_doors[d] = r->doors[d];
    room_tw = 4 + (room_bw << 1);
    room_th = 3 + (room_bh << 1);
    room_x1 = room_tw - 3;
    room_y1 = room_th - 2;
    cam_max_x = (uint8_t)(((uint16_t)room_tw << 3) - VIEW_W);
    cam_max_y = (uint8_t)(((uint16_t)room_th << 3) - VIEW_H);
    // The doors: the middle block of each side (left of, or above, the middle
    // if even).
    door_x = ROOM_X0 + (((room_bw - 1) >> 1) << 1);
    door_y = ROOM_Y0 + (((room_bh - 1) >> 1) << 1);
    // Its switches, enemies and key.
    const uint8_t *o = r->objects;
    uint8_t cells = 0;
    sw_count = en_count = spk_count = bl_count = 0;
    key_x = key_y = 0xFF;
    for (;;) {
        uint8_t kind = *o++;
        if (kind == O_END) break;
        if (kind == O_SPIKES) {
            uint8_t i = spk_count++;
            spk_side[i] = o[0];
            spk_from[i] = o[1];
            spk_n[i] = o[2];
            spk_phase[i] = o[3];
            o += 4;
            continue;
        }
        if (kind == O_BLADE) {
            bl_hx[bl_count] = (ROOM_X0 + (o[0] << 1)) << 3;
            bl_hy[bl_count] = (ROOM_Y0 + (o[1] << 1)) << 3;
            bl_count++;
            o += 2;
            continue;
        }
        if (kind == O_KEY) {
            key_x = o[0];
            key_y = o[1];
            o += 2;
            continue;
        }
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

uint8_t cell_attr;
static uint8_t cell(uint8_t x, uint8_t y) {
    const uint8_t W = room_tw, B = room_th - 1;  // B: the near wall's row
    uint8_t d = door_cell(x, y);
    if (d != 0xFF) {
        uint8_t s = state_of(room_id, d);
        uint8_t k = s == DS_OPEN ? 1 : s == DS_LOCKED ? 2 : 0;  // shut, open, locked
        cell_attr = PLAY_PAL_WALL;
        switch (d) {
            case DIR_UP:
                if (x != door_x) cell_attr |= A_FLIPX;
                return k == 0 ? T_DOOR_SHUT : k == 1 ? T_DOOR_OPEN : T_DOOR_LOCK;
            case DIR_DOWN:
                if (x != door_x) cell_attr |= A_FLIPX;
                return T_DOORS_SHUT + k;
            case DIR_RIGHT:
                cell_attr |= A_FLIPX;
                // fall through
            default:
                if (y != door_y) cell_attr |= A_FLIPY;
                return T_DOORW_SHUT + k;
        }
    }
    if (x >= ROOM_X0 && x <= room_x1 && y >= ROOM_Y0 && y <= room_y1) {
        if (x == food_x && y == food_y) {
            cell_attr = PLAY_PAL_FOOD;
            return T_FOOD;
        }
        if (key_shown && x == key_x && y == key_y) {
            cell_attr = PLAY_PAL_LIT;
            return T_KEY;
        }
        uint8_t occ = occupied[((uint16_t)y << 5) | x];
        if ((occ & OCC_SPIKE) && spk_state[occ >> 6] == SPK_OUT) {
            // Spikes out over the floor, from their wall.
            uint8_t s = spk_side[occ >> 6];
            cell_attr = PLAY_PAL_SPIKE | (s == DIR_DOWN ? A_FLIPY : s == DIR_RIGHT ? A_FLIPX : 0);
            return s >= DIR_UP ? T_SPIKE_D : T_SPIKE_R;
        }
        uint8_t id = (occ >> 1) & 15;
        if (id) {
            id--;
            if (sw_flags[id] & SW_STONES) {
                cell_attr = PLAY_PAL_MARK;
                return sw_tile[id];
            }
            cell_attr = sw_down[id] ? PLAY_PAL_LIT : PLAY_PAL_MARK;
            return sw_tile[id] + (x & 1) + ((y & 1) << 1);
        }
        cell_attr = PLAY_PAL_BOARD;
        return FLOOR_TILE(x, y);
    }
    // A spike plate: in a run along the wall beside its open cells.
    for (uint8_t i = 0; i < spk_count; i++) {
        uint8_t s = spk_side[i], along;
        if (s >= DIR_UP) {
            if (y != (s == DIR_UP ? DOOR_Y : B)) continue;
            along = x;
        } else {
            if (x != (s == DIR_LEFT ? 1 : W - 2) || !y || y == B) continue;
            along = y;
        }
        if ((uint8_t)(along - spk_from[i]) >= spk_n[i]) continue;
        cell_attr = PLAY_PAL_SPIKE;
        return spk_state[i] == SPK_WARN ? T_PLATE_WARN : T_PLATE;
    }
    // The walls, seen from a little above: tops all round, the side walls'
    // edges, the back wall's face, the near wall. The right-hand ones flip.
    cell_attr = PLAY_PAL_WALL;
    if (x >= W - 2 && y) cell_attr |= A_FLIPX;
    if (!y || !x || x == W - 1) return T_WALL_CAP;
    if (y == B) return x == 1 || x == W - 2 ? T_WALL_CORNER : T_WALL_BOTTOM;
    if (x == 1 || x == W - 2) return T_WALL_EDGE;
    return T_WALL_FACE;
}

uint8_t room_cell(uint8_t x, uint8_t y) BANKED {
    return cell(x, y);
}

// The whole room, at (map_ox, map_oy) in the background map (display off).
void room_draw(void) BANKED {
    for (uint8_t y = 0; y < room_th; y++) {
        uint8_t my = (y + map_oy) & 31;
        for (uint8_t x = 0; x < room_tw; x++) {
            uint8_t mx = (x + map_ox) & 31;
            uint8_t t = cell(x, y);
            VBK_REG = 1;
            set_bkg_tile_xy(mx, my, cell_attr);
            VBK_REG = 0;
            set_bkg_tile_xy(mx, my, t);
        }
    }
}

// The map: a box per room seen (the one you're in, lit), the doors between
// them (dotted while shut), the room's name and the keys carried.
#define MAP_X0 2  // the grid's top-left tile: rooms 3x2 tiles, a tile apart
#define MAP_Y0 3
void map_draw(void) BANKED {
    fill_win_rect(0, 0, SCREEN_TW, SCREEN_TH, 0);
    win_text(4, 1, "DUNGEON MAP");
    for (uint8_t i = 0; i < ROOM_COUNT; i++) {
        const Room *r = &rooms[i];
        uint8_t x = MAP_X0 + (r->gx << 2), y = MAP_Y0 + r->gy * 3;
        if (room_seen[i]) fill_win_rect(x, y, 3, 2, i == room_id ? T_MAP_HERE : T_MAP_ROOM);
        // Its doors right and down (the others are its neighbours'), once
        // either side has been seen.
        for (uint8_t d = DIR_RIGHT; d <= DIR_DOWN; d += 3) {
            uint8_t n = beyond(i, d);
            if (!r->doors[d] || n == 0xFF || !(room_seen[i] | room_seen[n])) continue;
            uint8_t open = state_of(i, d) == DS_OPEN;
            if (d == DIR_RIGHT) set_win_tile_xy(x + 3, y, open ? T_MAP_DOOR_H : T_MAP_SHUT_H);
            else set_win_tile_xy(x + 1, y + 2, open ? T_MAP_DOOR_V : T_MAP_SHUT_V);
        }
    }
    win_text(2, 15, rooms[room_id].name);
    win_text(2, 16, "KEYS");
    win_number(7, 16, keys, 1, 1);
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
    view_x = cam_fx >> 4;
    view_y = cam_fy >> 4;
    scroll_x = (uint8_t)view_x + (map_ox << 3);
    scroll_y = (uint8_t)view_y + (map_oy << 3);
}
