#pragma bank 255
// Title screen: the logo and a blinking "PRESS START". START (or A) begins a game.
#include <gb/gb.h>
#include "sfx.h"
#include "state.h"
#include "input.h"
#include "gfx.h"
#include "game.h"
#include "scene_text.h"

#define BLINK_MASK 0x20  // "PRESS START" blinks every 32 frames (its palette's ink)

uint8_t title_timer;

// The prompt blinks by its palette: ink, or the background's color.
static void prompt_ink(uint8_t on) {
    pal_base_bg[(TITLE_PAL_PROMPT << 2) + 3] = pal_base_bg[(TITLE_PAL_TEXT << 2) + (on ? 3 : 0)];
    gfx_set_fade(0);
}

void title_enter(void) BANKED {
    title_timer = 0;
    palettes_title();
    VBK_REG = 1;
    fill_bkg_rect(0, 0, 32, 32, TITLE_PAL_TEXT);
    VBK_REG = 0;
    uint8_t t = SCENE_TILES;
    t += draw(FONT_DISPLAY, TEXT_CENTER, 4, "DANGER NOODLE", t, TITLE_PAL_GOLD);
    t += draw(FONT_COMPACT, TEXT_CENTER, 7, "a very long snake", t, TITLE_PAL_TEXT);
    t += draw(FONT_COMPACT, TEXT_CENTER, 11, "PRESS START", t, TITLE_PAL_PROMPT);
    draw(FONT_COMPACT, 4, 16, "v0.0", t, TITLE_PAL_HINT);
}

void title_update(void) BANKED {
    title_timer++;
    if (!(title_timer & (BLINK_MASK - 1))) prompt_ink(!(title_timer & BLINK_MASK));
    if (joy_pressed & (J_START | J_A)) {
        // The frame START lands on seeds the game: different every time for a
        // player, reproducible for a replay. Tests can set test_seed instead.
        game_seed = test_seed ? test_seed : frame_count;
        sfx_play(SFX_START);
        state_change(STATE_PLAY);
    }
}
