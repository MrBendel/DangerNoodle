#pragma bank 255
// Screen setup and fades, banked: called between scenes, never per frame.
#include <gb/gb.h>
#include <gb/cgb.h>
#include <gb/metasprites.h>
#include "gfx.h"
#include "state.h"
#include "font.h"
#include "frame.h"

extern volatile uint8_t vram_ready;  // gfx.c
extern uint8_t strip_count, copy_count;
void gfx_vbl(void);  // gfx.c: the vblank handler, in bank 0
void gfx_lcd(void);  // gfx.c: the sprite split's LCD interrupt, in bank 0
void gfx_lcd_box(void);  // ... and the dialogue box's (gfx_box_split)
void gfx_vbl_box(void);

extern uint16_t pal_bg[PAL_COUNT * 4], pal_obj[PAL_COUNT * 4];  // gfx.c: on screen
extern volatile uint8_t pal_dirty;

uint16_t pal_base_bg[PAL_COUNT * 4], pal_base_obj[PAL_COUNT * 4];

// The starting palettes: the original Game Boy's four greys (color index i is
// shade i: white, light, dark, black), and the flash palette inverted. Scenes
// set their own colors (palettes.c).
#define GREY0 RGB(31, 31, 31)
#define GREY1 RGB(21, 21, 21)
#define GREY2 RGB(10, 10, 10)
#define GREY3 RGB(0, 0, 0)
static const uint16_t grey[4] = {GREY0, GREY1, GREY2, GREY3};
static const uint16_t inverted[4] = {GREY3, GREY2, GREY1, GREY0};

// How far toward white each fade step goes, in 1/256ths.
static const uint8_t fade_mix[FADE_STEPS + 1] = {0, 85, 171, 255};

static uint16_t faded(uint16_t c, uint8_t mix) {
    uint8_t r = c & 31, g = (c >> 5) & 31, b = (c >> 10) & 31;
    if (mix == 255) return RGB(31, 31, 31);
    r += (uint8_t)(((uint16_t)(31 - r) * mix) >> 8);
    g += (uint8_t)(((uint16_t)(31 - g) * mix) >> 8);
    b += (uint8_t)(((uint16_t)(31 - b) * mix) >> 8);
    return RGB(r, g, b);
}

void gfx_set_fade(uint8_t step) BANKED {
    uint8_t mix = fade_mix[step];
    for (uint8_t i = 0; i < PAL_COUNT * 4; i++) {
        pal_bg[i] = faded(pal_base_bg[i], mix);
        pal_obj[i] = faded(pal_base_obj[i], mix);
    }
    pal_dirty = 1;
}

void gfx_init(void) BANKED {
    CRITICAL {
        add_VBL(gfx_vbl);
        add_LCD(gfx_lcd);  // the sprite split (gfx_sprite_split); off until a scene asks
        STAT_REG = 0;
    }
    set_interrupts(IE_REG | LCD_IFLAG);
    // The font and frame are in switchable banks (banked_bkg_data: gfx.c, bank 0).
    banked_bkg_data(FONT_TILES, FONT_TILE_COUNT, font_tiles, BANK(font));
    banked_bkg_data(FRAME_TILES, FRAME_TILE_COUNT, frame_tiles, BANK(frame));
    // Tile attributes (VRAM bank 1: palette, flips, tile bank): nothing flipped,
    // tile bank 0; the background uses the scene's palette, the window the UI's.
    // The window (HUD, panels) uses the UI palette everywhere.
    VBK_REG = 1;
    fill_bkg_rect(0, 0, 32, 32, BG_PAL_SCENE);
    fill_win_rect(0, 0, 32, 32, BG_PAL_UI);
    VBK_REG = 0;
    for (uint8_t p = 0; p < PAL_COUNT; p++) {
        for (uint8_t i = 0; i < 4; i++) {
            pal_base_bg[(p << 2) + i] = grey[i];
            pal_base_obj[(p << 2) + i] = p == SPR_PAL_FLASH ? inverted[i] : grey[i];
        }
    }
}

uint8_t split_box;

void gfx_box_split(uint8_t line) BANKED {
    if (line == 0 && !split_box) return;
    CRITICAL {
        if (line) {
            if (!split_box) {
                remove_LCD(gfx_lcd);
                add_LCD(gfx_lcd_box);
                add_VBL(gfx_vbl_box);
            }
            LYC_REG = line - 1;
            STAT_REG = STATF_LYC;
            split_box = 1;
        } else {
            remove_VBL(gfx_vbl_box);
            remove_LCD(gfx_lcd_box);
            add_LCD(gfx_lcd);
            STAT_REG = 0;
            LCDC_REG |= LCDCF_WINON | LCDCF_OBJON;
            split_box = 0;
        }
    }
}

void gfx_sprite_split(uint8_t line) BANKED {
    gfx_box_split(0);
    if (line) {
        LYC_REG = line - 1;
        STAT_REG = STATF_LYC;
    } else {
        STAT_REG = 0;
        if (obj_restore) gfx_sprites(1);
    }
}

void gfx_clear(void) BANKED {
    gfx_sprite_split(0);
    fill_bkg_rect(0, 0, 32, 32, FONT_TILES);  // tile 0 = space
    // ... and plain attributes: a scene's (flips, palettes, tiles in the second
    // bank) would garble the next one's text.
    VBK_REG = 1;
    fill_bkg_rect(0, 0, 32, 32, BG_PAL_SCENE);
    VBK_REG = 0;
    hide_sprites_range(0, MAX_HARDWARE_SPRITES);
    HIDE_WIN;
    scroll_x = scroll_y = 0;
    strip_count = 0;
    copy_count = 0;
    vram_ready = 0;
    move_bkg(0, 0);
}


void fade_out(void) BANKED {
    for (uint8_t s = 1; s <= FADE_STEPS; s++) {
        gfx_set_fade(s);
        for (uint8_t f = 0; f < FADE_FRAMES; f++) wait_frame();
    }
}

void fade_in(void) BANKED {
    for (uint8_t s = FADE_STEPS; s--;) {
        for (uint8_t f = 0; f < FADE_FRAMES; f++) wait_frame();
        gfx_set_fade(s);
    }
}

// Frame tiles are row-major: 0 1 2 / 3 4 5 / 6 7 8.
#define FRAME_DRAW(fill, set)                                                    \
    fill(x, y, w, h, FRAME_TILES + 4);                                           \
    fill(x + 1, y, w - 2, 1, FRAME_TILES + 1);                                   \
    fill(x + 1, y + h - 1, w - 2, 1, FRAME_TILES + 7);                           \
    fill(x, y + 1, 1, h - 2, FRAME_TILES + 3);                                   \
    fill(x + w - 1, y + 1, 1, h - 2, FRAME_TILES + 5);                           \
    set(x, y, FRAME_TILES + 0);                                                  \
    set(x + w - 1, y, FRAME_TILES + 2);                                          \
    set(x, y + h - 1, FRAME_TILES + 6);                                          \
    set(x + w - 1, y + h - 1, FRAME_TILES + 8)

// Numbers (menus only, so banked: they take no strings, which a banked
// function couldn't read from its caller's bank). Digits are the font's tiles.
static void draw_number(uint8_t win, uint8_t x, uint8_t y, uint16_t n, uint8_t width, uint8_t zero_pad) {
    x += width;
    do {
        uint8_t t = FONT_TILES + ('0' - ' ') + (uint8_t)(n % 10);
        if (win) set_win_tile_xy(--x, y, t);
        else set_bkg_tile_xy(--x, y, t);
        n /= 10;
        width--;
    } while (n && width);
    while (width--) {
        uint8_t t = FONT_TILES + (zero_pad ? '0' - ' ' : 0);
        if (win) set_win_tile_xy(--x, y, t);
        else set_bkg_tile_xy(--x, y, t);
    }
}

void bkg_number(uint8_t x, uint8_t y, uint16_t n, uint8_t width, uint8_t zero_pad) BANKED {
    draw_number(0, x, y, n, width, zero_pad);
}

void win_number(uint8_t x, uint8_t y, uint16_t n, uint8_t width, uint8_t zero_pad) BANKED {
    draw_number(1, x, y, n, width, zero_pad);
}

void bkg_frame(uint8_t x, uint8_t y, uint8_t w, uint8_t h) BANKED {
    FRAME_DRAW(fill_bkg_rect, set_bkg_tile_xy);
}

void win_frame(uint8_t x, uint8_t y, uint8_t w, uint8_t h) BANKED {
    FRAME_DRAW(fill_win_rect, set_win_tile_xy);
}
