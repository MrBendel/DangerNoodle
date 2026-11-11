// Text from a banked scene's own string constants. text.c runs in its own ROM
// bank, so a string constant in the caller's bank isn't visible from there: copy
// it to the stack first (RogueGB's title.c pattern). Include in one scene file
// each: it defines a static function.
#ifndef SCENE_TEXT_H
#define SCENE_TEXT_H

#include "text.h"

static uint8_t draw(uint8_t font, uint8_t x, uint8_t ty, const char *s, uint8_t tile, uint8_t pal) {
    char line[TEXT_MAX + 1];
    uint8_t n = 0;
    while (s[n] && n < TEXT_MAX) line[n] = s[n], n++;  // (no strncpy: it would land in bank 0)
    line[n] = 0;
    return text_draw(font, x, ty, line, tile, pal);
}

#endif
