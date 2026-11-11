; Write the queued VRAM updates (gfx.c) during vblank.
;
; Called from the vblank handler, after it has set the scroll registers. Vblank
; lasts ~4560 cycles and the sprite DMA uses ~700 of them, so this has to be fast:
; the C version took ~77 cycles per byte and could run past vblank (a scroll
; tear, and VRAM writes the hardware ignores). This is ~20-30 cycles per byte.
;
; Data layout, matching gfx.c:
;   copies[]: dst (2 bytes), src (2), len (1), bank (1)    -> 6 bytes each
;             (bank: the ROM bank holding src, 0 for bank 0 or RAM)
;   strips[]: x, y, vertical, len, attr, tiles[23], attrs[23] -> 51 bytes each
;             (STRIP_MAX_LEN = 23; attr: 1 if attrs[] is filled)
; x and y are background map tile coordinates (0-31); the map is at 0x9800.

    .module vram_queue
    .globl _copies, _copy_count, _strips, _strip_count, __current_bank

STRIP_LEN = 23      ; STRIP_MAX_LEN (gfx.h)
STRIP_SIZE = 51     ; 5 + 2 * STRIP_LEN
VBK = 0x4F          ; VRAM bank (ldh)

    .area _DATA
q_left:   .ds 1     ; entries left
q_next:   .ds 2     ; address of the next entry
s_len:    .ds 1
s_rowlo:  .ds 1     ; low byte of the map row's address, (y & 7) << 5
s_x:      .ds 1
s_hi:     .ds 1     ; high byte of the map row's address
s_vert:   .ds 1
s_attr:   .ds 1

    .area _CODE

; void vram_queue_write(void)
_vram_queue_write::
    ; ---- byte copies -------------------------------------------------------
    ld a, (_copy_count)
    or a, a
    jr z, 20$
    ld (q_left), a
    ld hl, #_copies
10$:
    ld a, (hl+)
    ld e, a
    ld a, (hl+)
    ld d, a             ; de = destination
    ld a, (hl+)
    ld c, a
    ld a, (hl+)
    ld b, a             ; bc = source
    ld a, (hl+)         ; length
    push af
    ld a, (hl+)         ; bank: switch it in (0 = leave as is)
    or a, a
    jr z, 12$
    ld (0x2000), a      ; rROMB0
12$:
    pop af
    push hl             ; next entry
    ld h, b
    ld l, c
    ld c, a
11$:
    ld a, (hl+)
    ld (de), a
    inc de
    dec c
    jr nz, 11$
    pop hl
    ld a, (q_left)
    dec a
    ld (q_left), a
    jr nz, 10$
    ; Switch back to the bank the interrupted code had. GBDK's bank switches
    ; (SWITCH_ROM, banked calls) set _current_bank before the register, so this
    ; is right even if the interrupt landed between the two.
    ld a, (__current_bank)
    ld (0x2000), a

    ; ---- background strips --------------------------------------------------
    ; Each strip's tiles go to the map in VRAM bank 0; if it carries attributes
    ; (palette, bank, flips per tile), they go to the same cells in bank 1.
20$:
    ld a, (_strip_count)
    or a, a
    ret z
    ld (q_left), a
    ld hl, #_strips
21$:
    ; remember where the next strip starts
    ld a, l
    add a, #STRIP_SIZE
    ld (q_next), a
    ld a, h
    adc a, #0
    ld (q_next + 1), a

    ld a, (hl+)
    ld (s_x), a
    ld a, (hl+)         ; y
    ld b, a
    and a, #7
    swap a
    add a, a
    ld (s_rowlo), a     ; (y & 7) << 5
    ld a, b
    srl a
    srl a
    srl a
    add a, #0x98
    ld (s_hi), a        ; high byte of the row's address
    ld a, (hl+)
    ld (s_vert), a
    ld a, (hl+)
    ld (s_len), a
    ld a, (hl+)
    ld (s_attr), a      ; hl -> tiles
    push hl
    call strip_data
    pop hl
    ld a, (s_attr)
    or a, a
    jr z, 40$
    ld bc, #STRIP_LEN   ; -> attributes
    add hl, bc
    ld a, #1
    ldh (VBK), a
    call strip_data
    xor a, a
    ldh (VBK), a

40$:
    ld a, (q_next)
    ld l, a
    ld a, (q_next + 1)
    ld h, a
    ld a, (q_left)
    dec a
    ld (q_left), a
    jr nz, 21$
    ret

; Write s_len bytes from hl along the strip (s_x, s_rowlo, s_hi, s_vert).
strip_data:
    ld a, (s_x)
    ld c, a             ; c = x
    ld a, (s_hi)
    ld d, a
    ld a, (s_vert)
    or a, a
    jr nz, 30$

    ; horizontal: x wraps within the row
    ld a, (s_rowlo)
    ld b, a
    ld a, (s_len)
    ld e, a             ; e as the counter for now
22$:
    push de
    ld a, c
    and a, #31
    or a, b
    ld e, a             ; de -> map[y][x]
    ld a, (hl+)
    ld (de), a
    inc c
    pop de
    dec e
    jr nz, 22$
    ret

    ; vertical: step down a row (32 bytes), wrapping from the bottom to the top
30$:
    ld a, (s_rowlo)
    or a, c             ; c < 32
    ld e, a             ; de -> map[y][x]
    ld a, (s_len)
    ld c, a
31$:
    ld a, (hl+)
    ld (de), a
    ld a, e
    add a, #32
    ld e, a
    jr nc, 32$
    inc d
    ld a, d
    cp a, #0x9C
    jr nz, 32$
    ld d, #0x98         ; wrapped past the bottom of the map
32$:
    dec c
    jr nz, 31$
    ret

; ---------------------------------------------------------------------------
; void pal_write(void): all 8 background and 8 sprite palettes (pal_bg, pal_obj
; in gfx.c, 64 bytes each) into palette RAM, through the auto-incrementing
; index registers. Vblank only: palette RAM can't be written while drawing.
    .globl _pal_bg, _pal_obj

BCPS = 0xFF68       ; background palette index (bit 7: auto-increment)
BCPD = 0xFF69       ; ... data
OCPS = 0xFF6A       ; sprite palette index
OCPD = 0xFF6B       ; ... data

_pal_write::
    ld a, #0x80
    ld (BCPS), a
    ld hl, #_pal_bg
    ld b, #64
1$:
    ld a, (hl+)
    ld (BCPD), a
    dec b
    jr nz, 1$
    ld a, #0x80
    ld (OCPS), a
    ld hl, #_pal_obj
    ld b, #64
2$:
    ld a, (hl+)
    ld (OCPD), a
    dec b
    jr nz, 2$
    ret
