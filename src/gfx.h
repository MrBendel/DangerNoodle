// Shared graphics: font, text and frame drawing, screen fades.
//
// Background tile layout (BG tiles live at 0x9000/0x8800, separate from sprites):
//   0..63    font, ASCII 32..95, so tile = char - 32 and tile 0 is a blank space
//   64..72   dialog frame (3x3)
//   80..     owned by the current scene (SCENE_TILES)
#ifndef GFX_H
#define GFX_H

#include <stdint.h>

#define FONT_TILES  0
#define FRAME_TILES 64
#define SCENE_TILES 80

#define SCREEN_TW 20  // screen size in tiles
#define SCREEN_TH 18

// The HUD: the bottom tile row, on the window layer. The hardware draws the
// window from line WY to the bottom of the screen with no per-frame work, so a
// bottom HUD is free; a top one would need a scanline interrupt to switch the
// window off again every frame (decided in RogueGB, ROADMAP 2026-10-12). Sprites
// are cut off at HUD_WY by gfx_sprite_split so they don't draw over it. One row
// leaves a 17-row playfield: exactly a one-screen room (game.h).
#define HUD_ROWS 1
#define PLAYFIELD_TH (SCREEN_TH - HUD_ROWS)  // 17 rows: 160x136 px
#define HUD_WY (PLAYFIELD_TH * 8)            // 136

// Background scroll, applied by the vblank interrupt (together with the sprite
// update), so the background and sprites always move in the same frame.
extern uint8_t scroll_x;
extern uint8_t scroll_y;

// VRAM updates queued during the frame and written by the vblank interrupt, when
// VRAM can be written without waiting. Writing while the screen is drawing costs a
// wait per byte, which made streaming a row, or swapping a sprite's animation
// frame, take a large part of the frame. wait_frame() calls gfx_commit(), which
// hands everything queued this frame to the next vblank.
//
// Background map strips (a row or a column of tiles):
#define STRIP_MAX_LEN 23  // also STRIP_SIZE in vram_queue.s
#define STRIP_MAX 8  // a snake move: up to 4 16x16 blocks, 2 rows each
// x, y: background map tile coordinates (wrapped to 0-31). vertical: column if 1.
// Returns the buffer to fill with `len` tiles (flushing first if the queue is full).
uint8_t *gfx_strip(uint8_t x, uint8_t y, uint8_t vertical, uint8_t len);
// The same, with tile attributes too: fill len attributes at the returned
// pointer + STRIP_MAX_LEN (written to VRAM bank 1 at the same cells).
uint8_t *gfx_strip_attr(uint8_t x, uint8_t y, uint8_t vertical, uint8_t len);
// Byte copies into VRAM (tile data). `src` must stay valid until the next vblank.
// `bank` is the ROM bank holding src (BANK(asset)), or 0 for bank 0 or RAM: the
// vblank handler switches it in for the copy and back afterwards.
// Six: a HUD redraw (two rows and the two right-hand pieces) and a sprite's new
// frame (two columns) can land on one frame; a seventh flushes, waiting per byte.
#define COPY_MAX 6
void gfx_vram_copy(uint8_t *dst, const uint8_t *src, uint8_t len, uint8_t bank);
// Mark this frame's queued updates ready for the next vblank.
void gfx_commit(void);
// Write everything queued now (waits for VRAM access if the display is on).
void gfx_flush(void);

// Load the font and frame tiles and install the vblank scroll handler.
// Call once at boot; scenes never overwrite these tiles.
void gfx_init(void) BANKED;  // gfx_setup.c

// Clear the background map to blank, hide every sprite, hide the window.
void gfx_clear(void) BANKED;  // gfx_setup.c

// Draw text on the background (or window, with win_text) at tile x, y.
// Lowercase is drawn as uppercase; anything outside the font is a space.
void bkg_text(uint8_t x, uint8_t y, const char *s);
void win_text(uint8_t x, uint8_t y, const char *s);
// Draw an unsigned number, right-aligned in width tiles (zero-padded if zero_pad).
// Banked (menus only).
void bkg_number(uint8_t x, uint8_t y, uint16_t n, uint8_t width, uint8_t zero_pad) BANKED;
void win_number(uint8_t x, uint8_t y, uint16_t n, uint8_t width, uint8_t zero_pad) BANKED;

// Draw a framed box on the background or the window.
// Banked (gfx_setup.c): they take no strings, so they needn't be in bank 0.
void bkg_frame(uint8_t x, uint8_t y, uint8_t w, uint8_t h) BANKED;
void win_frame(uint8_t x, uint8_t y, uint8_t w, uint8_t h) BANKED;

// --- Color palettes (Game Boy Color: 8 background + 8 sprite palettes of 4
// colors, RGB555). The scenes set the base palettes; what's on screen is the
// base faded toward white by the current fade step, uploaded by the vblank
// handler (palette RAM can't be written while the screen draws). Every tile
// uses background palette 0 for now; sprites use 0, and 1 to flash. ---
#define PAL_COUNT 8
// Background palettes: 0-5 belong to the scene, 6-7 to the UI (window, HUD).
#define BG_PAL_SCENE 0
#define BG_SCENE_PALS 6
#define BG_PAL_UI 6
// Sprite palettes, by what uses them (the palette is bits 0-2 of a sprite's flags).
#define SPR_PAL_NOODLE 0
#define SPR_PAL_FLASH 1   // colors inverted, for a warning or a hit
#define SPR_PAL_TAIL 2    // the noodle's tail tip: color 3 is grass (a mask)
#define SPR_PAL_BEETLE 3  // its shell
#define SPR_PAL_SOFT 4    // cracked: soft inside
#define SPR_PAL_ANGRY 5   // about to bite
#define SPR_PAL_UI 7
extern uint16_t pal_base_bg[PAL_COUNT * 4], pal_base_obj[PAL_COUNT * 4];
// Put the base palettes on screen at fade step `step` (0 = as they are,
// FADE_STEPS = white); uploaded at the next vblank.
void gfx_set_fade(uint8_t step) BANKED;

// Sprites stop above a HUD: the window can't cover sprites, so from screen
// line `line` down they're switched off (an LCD interrupt at the line before,
// in its last moments), and back on at the next vblank. 0 = no split.
void gfx_sprite_split(uint8_t line) BANKED;
// Show or hide all sprites. Use this rather than SHOW_/HIDE_SPRITES while a
// split is on (the vblank would otherwise turn hidden sprites back on).
void gfx_sprites(uint8_t on);
extern uint8_t obj_restore;  // the split turned sprites off this frame
// A box at the top of the screen (dialogue): the window (from y = 0) shows down to
// screen line `line`, sprites only below it. 0 = off (the window and sprites on).
void gfx_box_split(uint8_t line) BANKED;
extern uint8_t split_box;

// Scene palettes (palettes.c).
// The title's: text, the gold display font, hints, the blinking prompt.
#define TITLE_PAL_TEXT 0
#define TITLE_PAL_GOLD 1
#define TITLE_PAL_HINT 2
#define TITLE_PAL_PROMPT 3
void palettes_title(void) BANKED;
// Play: the board (grass), its walls, the noodle, the food, the HUD row.
#define PLAY_PAL_BOARD 0
#define PLAY_PAL_WALL 1
#define PLAY_PAL_NOODLE 2
#define PLAY_PAL_FOOD 3
#define PLAY_PAL_TEXT 4  // the pause banner (the HUD itself uses BG_PAL_UI)
#define PLAY_PAL_MARK 5  // switches: a shape's stones and buttons, up
#define PLAY_PAL_LIT 7   // a switch held down (latched, or timed)
void palettes_play(void) BANKED;
// The stones light up (on): the room is solved, its shutters open. Off: grey.
void palettes_marks_lit(uint8_t on) BANKED;
// Menus (game over): the title's colors.
void palettes_menu(void) BANKED;

// Fade the background and sprite palettes to white / back to normal.
// Each takes FADE_STEPS * FADE_FRAMES frames.

#define FADE_STEPS  3
#define FADE_FRAMES 4
void fade_out(void) BANKED;  // gfx_setup.c
void fade_in(void) BANKED;

// Copying from a switchable ROM bank. Banked code must not switch banks itself
// (SWITCH_ROM would swap its own code out from under the CPU), so it calls these:
// they live in bank 0, switch to `bank`, copy, and switch back.
void banked_memcpy(void *dst, const void *src, uint16_t n, uint8_t bank);
void banked_sprite_data(uint8_t first, uint8_t n, const uint8_t *data, uint8_t bank);
// The same into the Color's second VRAM bank (sprites whose flags have S_BANK).
void banked_sprite_data_vbk1(uint8_t first, uint8_t n, const uint8_t *data, uint8_t bank);
void banked_bkg_data(uint8_t first, uint8_t n, const uint8_t *data, uint8_t bank);

#endif
