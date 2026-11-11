#pragma bank 255
// Game over: the score and the best this session. START (or A), after a
// moment so a held button doesn't skip it, returns to the title.
#include <gb/gb.h>
#include "state.h"
#include "input.h"
#include "gfx.h"
#include "game.h"
#include "scene_text.h"

#define INPUT_DELAY 30  // frames before START counts

uint8_t game_over_timer;

// "LABEL 123" into buf (a one-off: the division is fine here).
static void label_number(char *buf, const char *label, uint16_t n) {
    while (*label) *buf++ = *label++;
    *buf++ = ' ';
    char digits[5];
    uint8_t k = 0;
    do {
        digits[k++] = '0' + (uint8_t)(n % 10);
        n /= 10;
    } while (n);
    while (k) *buf++ = digits[--k];
    *buf = 0;
}

void game_over_enter(void) BANKED {
    game_over_timer = 0;
    palettes_menu();
    VBK_REG = 1;
    fill_bkg_rect(0, 0, 32, 32, TITLE_PAL_TEXT);
    VBK_REG = 0;
    char line[TEXT_MAX + 1];
    uint8_t t = SCENE_TILES;
    t += draw(FONT_DISPLAY, TEXT_CENTER, 4, "GAME OVER", t, TITLE_PAL_GOLD);
    label_number(line, "SCORE", score);
    t += text_draw(FONT_COMPACT, TEXT_CENTER, 8, line, t, TITLE_PAL_TEXT);
    label_number(line, "BEST", best_score);
    t += text_draw(FONT_COMPACT, TEXT_CENTER, 10, line, t, TITLE_PAL_HINT);
    draw(FONT_COMPACT, TEXT_CENTER, 14, "PRESS START", t, TITLE_PAL_TEXT);
}

void game_over_update(void) BANKED {
    if (game_over_timer < INPUT_DELAY) {
        game_over_timer++;
        return;
    }
    if (joy_pressed & (J_START | J_A)) state_change(STATE_TITLE);
}
