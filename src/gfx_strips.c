#pragma bank 255
// The slow path for background strips: written outside vblank when a queue
// overflows or the display is off (gfx_flush, gfx.c). Banked: it's rare, and
// bank 0 is full. The usual path is vram_queue.s, in vblank.
#include <gb/gb.h>
#include <gb/cgb.h>
#include "gfx_internal.h"

void write_strips(uint8_t wait) BANKED {
    for (uint8_t i = 0; i < strip_count; i++) {
        Strip *s = &strips[i];
        for (uint8_t layer = 0; layer < 2; layer++) {  // tiles (VRAM bank 0), then attributes (bank 1)
        if (layer && !s->attr) break;
        VBK_REG = layer;
        uint8_t *row = (uint8_t *)0x9800 + ((uint16_t)s->y << 5);
        uint8_t x = s->x;
        const uint8_t *t = layer ? s->attrs : s->tiles;
        uint8_t n = s->len;
        if (s->vertical) {
            uint8_t *p = row + x;
            while (n--) {
                if (wait) set_vram_byte(p, *t++);
                else *p = *t++;
                p += 32;
                if (p >= (uint8_t *)0x9C00) p -= 0x400;  // wrap to the top of the map
            }
        } else if (wait) {
            while (n--) {
                set_vram_byte(row + x, *t++);
                x = (x + 1) & 31;
            }
        } else {
            while (n--) {
                row[x] = *t++;
                x = (x + 1) & 31;  // wrap to the left edge
            }
        }
        }
        VBK_REG = 0;
    }
}
