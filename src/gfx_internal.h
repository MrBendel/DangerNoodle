// The VRAM queues' records, shared by gfx.c (bank 0), gfx_strips.c (banked) and
// vram_queue.s (which hard-codes the layout: keep them in step).
#ifndef GFX_INTERNAL_H
#define GFX_INTERNAL_H

#include <gb/gb.h>
#include <stdint.h>
#include "gfx.h"

typedef struct {
    uint8_t x, y, vertical, len;
    uint8_t attr;  // attrs[] is filled: write it to VRAM bank 1 too
    uint8_t tiles[STRIP_MAX_LEN];
    uint8_t attrs[STRIP_MAX_LEN];
} Strip;
extern Strip strips[STRIP_MAX];
extern uint8_t strip_count;

// Write the queued strips outside vblank (wait: the display is on, so wait for
// VRAM access per byte). gfx.c's flush calls it after the copies.
void write_strips(uint8_t wait) BANKED;

#endif
