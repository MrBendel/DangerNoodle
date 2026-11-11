#pragma bank 255
// Placeholder sound effects: see sfx.h. Banked (a short call a frame).
// From RogueGB's sfx.c, with Danger Noodle's sounds.
//
// Register reminders (Pan Docs, "Audio"): a square channel's period x gives
// 131072 / (2048 - x) Hz. NRx2 is the envelope: start volume (bits 7-4), up (bit
// 3), pace (bits 2-0, 0 = hold). NR10 is channel 1's sweep: pace (6-4), down
// (bit 3), step (2-0). NR43 is the noise: clock shift (7-4, higher = lower),
// 7-bit "metallic" mode (bit 3), divider (2-0). Writing bit 7 of NRx4 restarts
// the channel.
#include <gb/gb.h>
#include "sfx.h"

// A step: how many frames before the next one (for the last step: how long the
// sound holds its channel against lower priorities), then the channel's registers:
// sweep (channel 1 only), duty/length, envelope, period low, period high (or for
// noise: length, envelope, the noise setting, 0).
typedef struct {
    uint8_t frames;
    uint8_t sweep, duty, env, lo, hi;
} Step;

#define P(x) ((x) & 0xFF), (((x) >> 8) & 7)  // a period, low and high bits
#define DUTY12 0x00
#define DUTY25 0x40
#define DUTY50 0x80

// --- the sounds ---
static const Step start[] = {{5, 0, DUTY50, 0xA2, P(1849)}, {10, 0, DUTY50, 0xB3, P(1923)}};
static const Step eat[] = {{3, 0, DUTY50, 0xB1, P(1899)}, {6, 0, DUTY50, 0xC2, P(1985)}};  // a bright blip up
static const Step turn[] = {{1, 0, DUTY12, 0x41, P(1985)}};  // a soft tick
static const Step death[] = {{20, 0x77, DUTY12, 0xF7, P(1700)}};  // a long fall

// Each sound's channel (0 = channel 1, 1 = channel 2, 2 = channel 4), priority,
// step count and steps, as separate arrays: plain byte indexing (an array of
// structs would multiply, a slow routine on this CPU).
#define N(steps) (sizeof(steps) / sizeof(Step))
static const uint8_t snd_ch[SFX_COUNT] = {1, 1, 1, 0};
static const uint8_t snd_prio[SFX_COUNT] = {4, 3, 1, 6};
static const uint8_t snd_n[SFX_COUNT] = {N(start), N(eat), N(turn), N(death)};
static const Step *const snd_steps[SFX_COUNT] = {start, eat, turn, death};

uint8_t sfx_last = 0xFF;
uint16_t sfx_played;
// Per channel (0: channel 1, 1: channel 2, 2: channel 4), as plain globals (the
// compiler's array indexing is slow): the step playing, steps after it, frames
// left in it, the sound's priority (0 = free).
const Step *step0, *step1, *step2;
uint8_t more0, more1, more2;
uint8_t left0, left1, left2;
uint8_t prio0, prio1, prio2;
uint8_t sfx_busy;  // channels with a sound being stepped (a bit each)

#define WRITE0(s)     NR10_REG = (s)->sweep; NR11_REG = (s)->duty; NR12_REG = (s)->env; NR13_REG = (s)->lo;     NR14_REG = 0x80 | (s)->hi  /* restart, no length limit */
#define WRITE1(s)     NR21_REG = (s)->duty; NR22_REG = (s)->env; NR23_REG = (s)->lo; NR24_REG = 0x80 | (s)->hi
#define WRITE2(s)     NR41_REG = (s)->duty; NR42_REG = (s)->env; NR43_REG = (s)->lo; NR44_REG = 0x80

void sfx_init(void) BANKED {
    NR52_REG = 0x80;  // sound on
    NR50_REG = 0x77;  // full volume, both sides
    NR51_REG = 0xFF;  // every channel to both sides
    sfx_busy = 0;
    prio0 = prio1 = prio2 = 0;
}

#define START(n, st, prio, count)     if (prio##n > (prio)) return;     step##n = (st); more##n = (count) - 1; left##n = (st)->frames; prio##n = (prio);     sfx_busy |= 1 << n;     WRITE##n(st)

void sfx_play(uint8_t id) BANKED {
    const Step *st = snd_steps[id];
    uint8_t prio = snd_prio[id], n = snd_n[id];
    switch (snd_ch[id]) {
    case 0: START(0, st, prio, n); break;
    case 1: START(1, st, prio, n); break;
    default: START(2, st, prio, n); break;
    }
    sfx_last = id;
    sfx_played++;
}

// One channel's frame: count down its step; then the next step, or free the
// channel (the hardware envelope fades what's left).
#define STEP(n)     if ((sfx_busy & (1 << n)) && !--left##n) {         if (!more##n) {             sfx_busy &= ~(1 << n);             prio##n = 0;         } else {             more##n--;             step##n++;             left##n = step##n->frames;             WRITE##n(step##n);         }     }

void sfx_update(void) BANKED {
    if (!sfx_busy) return;
    STEP(0)
    STEP(1)
    STEP(2)
}
