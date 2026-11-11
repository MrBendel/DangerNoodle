// Joypad, sampled once per frame by the main loop.
#ifndef INPUT_H
#define INPUT_H

#include <stdint.h>

extern uint8_t joy;           // buttons held this frame (J_* masks)
extern uint8_t joy_prev;      // buttons held last frame
extern uint8_t joy_pressed;   // went down this frame
extern uint8_t joy_released;  // went up this frame
// Edges come from the raw pad, so a scene can take buttons out of joy and
// joy_pressed (play.c, while SELECT is held) without a fake press next frame.
extern uint8_t joy_raw;

void input_update(void);

#endif
