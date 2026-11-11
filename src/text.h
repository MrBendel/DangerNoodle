// Text in the fonts from artwork/fonts/font-sheet.png (tools/fonts.mjs):
// proportional letters drawn into fresh tiles, so they can sit at any pixel and
// pack tighter than one letter a tile.
//   FONT_COMPACT  small 3x7 letters: menus, the HUD, loot cards
//   FONT_DISPLAY  big 8x16 letters in three colors: titles and banners
//   FONT_ITALIC   8x8 italic letters with a shadow (colors 3 and 2): dialogue
// Glyph colors are indices (0 see-through, 1-3 ink); the palette picks the
// actual colors, so the same letters can take any theme's colors.
#ifndef TEXT_H
#define TEXT_H

#include <gb/gb.h>
#include <stdint.h>

#define FONT_COMPACT 0
#define FONT_DISPLAY 1
#define FONT_ITALIC 2

#define TEXT_CENTER 0xFF  // as text_draw's x: centered on the screen
#define TEXT_BANK1 0x08   // in text_draw's attr: tiles go to the Color's second VRAM bank

// s must be in RAM (or bank 0): this code runs in its own ROM bank, so a string
// constant in the caller's bank isn't visible from here. Banked callers copy
// theirs to a buffer on the stack first (title.c's draw()).
#define TEXT_MAX 40  // characters in a line, at most
#define TEXT_LINE_TILES 21  // a screen width, plus one when the text starts mid-tile

// The tile row being drawn (2bpp), for callers that upload it themselves.
extern uint8_t text_buf[TEXT_LINE_TILES * 16];
// Draw on the window's map instead of the background's (text_draw).
extern uint8_t text_on_window;

// Width of s in pixels.
uint8_t text_width(uint8_t font, const char *s) BANKED;

// Draw s at pixel x (or TEXT_CENTER) on map tile row ty, into new tiles from
// `tile` on, with tile attributes `attr` (a palette, plus TEXT_BANK1 for tiles in
// the second VRAM bank). A display line takes two tile rows. Writes VRAM
// directly: for screens being set up, or one-off changes.
// Returns the number of tiles used (the next free tile is tile + that).
uint8_t text_draw(uint8_t font, uint8_t x, uint8_t ty, const char *s, uint8_t tile, uint8_t attr) BANKED;

// Letter by letter (dialogue's typewriter), one tile row: start a line (clears
// text_buf, the pen at pixel x), then put characters. After each, the glyph's
// tiles in text_buf are text_dirty_first.. + text_dirty_n (0 for a space).
extern uint8_t text_pen, text_dirty_first, text_dirty_n;
void text_line_start(uint8_t font, uint8_t x) BANKED;
void text_put(char c) BANKED;

#endif
