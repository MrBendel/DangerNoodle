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
// The stones: grey, and gold once the shape is made.
static const uint16_t marks[4] = {GRASS, C(200, 196, 168), C(120, 116, 96), C(64, 60, 48)};
static const uint16_t marks_lit[4] = {GRASS, C(255, 240, 160), C(255, 160, 40), C(136, 80, 24)};
// The beetle (sprites: color 0 is see-through): a blue shell, soft pink once
// cracked, red as it's about to bite.
static const uint16_t beetle[4] = {0, C(160, 216, 248), C(48, 104, 184), C(16, 24, 48)};
static const uint16_t beetle_soft[4] = {0, C(255, 228, 208), C(240, 136, 136), C(88, 24, 40)};
static const uint16_t beetle_angry[4] = {0, C(255, 208, 128), C(232, 64, 40), C(64, 16, 16)};
// Hazards: steel spikes (red holes before they fire), and steel blades.
static const uint16_t spikes[4] = {GRASS, C(208, 212, 224), C(80, 84, 104), C(232, 48, 32)};
static const uint16_t steel[4] = {0, C(240, 244, 255), C(144, 152, 176), C(32, 32, 48)};
// The HUD row (the GB Studio font): dark band, light letters.
static const uint16_t hud[4] = {C(24, 40, 24), C(24, 40, 24), C(136, 192, 88), C(232, 244, 216)};

void palettes_play(void) BANKED {
    set_bg(PLAY_PAL_BOARD, board);
    set_bg(PLAY_PAL_WALL, walls);
    set_bg(PLAY_PAL_NOODLE, noodle);
    set_bg(PLAY_PAL_FOOD, food);
    set_bg(PLAY_PAL_SPIKE, spikes);
    memcpy(&pal_base_obj[SPR_PAL_STEEL << 2], steel, 8);
    set_bg(PLAY_PAL_MARK, marks);
    set_bg(PLAY_PAL_LIT, marks_lit);
    memcpy(&pal_base_obj[SPR_PAL_BEETLE << 2], beetle, 8);
    memcpy(&pal_base_obj[SPR_PAL_SOFT << 2], beetle_soft, 8);
    memcpy(&pal_base_obj[SPR_PAL_ANGRY << 2], beetle_angry, 8);
    set_bg(BG_PAL_UI, hud);  // the window: the HUD
    // The head and tail sprites (color 0 is transparent on sprites).
    memcpy(&pal_base_obj[SPR_PAL_NOODLE << 2], noodle, 8);
    memcpy(&pal_base_obj[SPR_PAL_TAIL << 2], noodle, 6);
    pal_base_obj[(SPR_PAL_TAIL << 2) + 3] = GRASS;
}

void palettes_marks_lit(uint8_t on) BANKED {
    set_bg(PLAY_PAL_MARK, on ? marks_lit : marks);
}

// Menus: the title's colors for the compact and display fonts.
void palettes_menu(void) BANKED {
    palettes_title();
}
