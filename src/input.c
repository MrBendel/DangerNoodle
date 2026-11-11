#include <gb/gb.h>
#include "input.h"

uint8_t joy;
uint8_t joy_prev;
uint8_t joy_pressed;
uint8_t joy_released;
uint8_t joy_raw;  // what the pad reads (joy may be masked by a scene: play.c's chords)

void input_update(void) {
    joy_prev = joy_raw;
    joy = joy_raw = joypad();
    joy_pressed = joy & ~joy_prev;
    joy_released = joy_prev & ~joy;
}
