#pragma bank 255
// Color palettes for each scene (banked: set when a scene starts, before it
// fades in; gfx_set_fade puts them on screen).
#include <gb/gb.h>
#include <gb/cgb.h>
#include <string.h>
#include "gfx.h"

#define C(r, g, b) RGB8(r, g, b)

static void set_bg(uint8_t p, const uint16_t *c) {
    memcpy(&pal_base_bg[p << 2], c, 8);
}

// The title: deep jungle green behind, the display font in gold, the compact
// font in pale green, dim green for the hints. Palette 3 is the blinking prompt.
#define JUNGLE C(20, 40, 28)
static const uint16_t title_text[4] = {JUNGLE, C(120, 160, 120), C(72, 112, 80), C(224, 240, 208)};
static const uint16_t title_gold[4] = {JUNGLE, C(254, 231, 97), C(254, 174, 52), C(24, 20, 37)};
static const uint16_t title_hint[4] = {JUNGLE, C(72, 112, 80), C(72, 112, 80), C(112, 152, 112)};

void palettes_title(void) BANKED {
    set_bg(TITLE_PAL_TEXT, title_text);
    set_bg(TITLE_PAL_GOLD, title_gold);
    set_bg(TITLE_PAL_HINT, title_hint);
    set_bg(TITLE_PAL_PROMPT, title_text);
}

// Play. Color 0 is the grass on every board palette, so the noodle and the
// food sit on the same ground. Walls are bricks (1-3).
#define GRASS C(136, 192, 88)
static const uint16_t board[4] = {GRASS, C(112, 168, 72), C(72, 112, 48), C(24, 40, 24)};
static const uint16_t walls[4] = {GRASS, C(184, 112, 72), C(128, 72, 48), C(48, 28, 24)};
static const uint16_t noodle[4] = {GRASS, C(40, 32, 16), C(232, 184, 48), C(252, 244, 208)};
static const uint16_t food[4] = {GRASS, C(72, 16, 24), C(216, 48, 48), C(255, 208, 200)};
// The HUD row (the GB Studio font): dark band, light letters.
static const uint16_t hud[4] = {C(24, 40, 24), C(24, 40, 24), C(136, 192, 88), C(232, 244, 216)};

void palettes_play(void) BANKED {
    set_bg(PLAY_PAL_BOARD, board);
    set_bg(PLAY_PAL_WALL, walls);
    set_bg(PLAY_PAL_NOODLE, noodle);
    set_bg(PLAY_PAL_FOOD, food);
    set_bg(PLAY_PAL_TEXT, hud);
    set_bg(BG_PAL_UI, hud);  // the window: the HUD
}

// Menus: the title's colors for the compact and display fonts.
void palettes_menu(void) BANKED {
    palettes_title();
}
