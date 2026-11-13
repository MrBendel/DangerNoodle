// Placeholder sound effects: short register-level sounds on the Game Boy's
// square channels (1 and 2) and its noise channel (4). Channel 3 (wave) is left
// for music. The engine is RogueGB's: each sound is a few steps of register
// values; the hardware's own envelopes and sweeps do the shaping. A sound with
// a higher priority cuts off the one playing on its channel; a lower one is
// dropped.
#ifndef SFX_H
#define SFX_H

#include <gb/gb.h>
#include <stdint.h>

#define SFX_START 0  // a game starts (title)
#define SFX_EAT 1    // the noodle eats
#define SFX_TURN 2   // a soft tick when the noodle turns
#define SFX_DEATH 3  // the noodle crashes
#define SFX_UNLOCK 4  // a shape is made: the door opens
#define SFX_COUNT 5

// --- watchable state ---
extern uint8_t sfx_last;      // the last sound started (0xFF: none yet)
extern uint16_t sfx_played;   // sounds started

void sfx_init(void) BANKED;    // sound on (once, at boot)
void sfx_play(uint8_t id) BANKED;
void sfx_update(void) BANKED;  // per frame: advance multi-step sounds

#endif
