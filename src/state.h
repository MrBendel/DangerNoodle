// Game state machine. Each state is a scene with an enter() (runs once with
// the display faded out, loads tiles/maps) and an update() (runs once per
// frame). main.c owns the loop and performs transitions between frames.
//
// To add a scene: add a STATE_* ID and its *_enter/*_update here, then add it
// to both switches in main.c (and to tests/helpers.mjs's scene IDs).
#ifndef STATE_H
#define STATE_H

#include <stdint.h>

#define STATE_TITLE     0
#define STATE_PLAY      1
#define STATE_GAME_OVER 2
#define STATE_NONE      0xFF  // before the first scene

// Watchable: the state currently running, and the one requested for next frame.
extern uint8_t game_state;
extern uint8_t next_state;
extern uint8_t in_transition;

// Counts every main-loop iteration (one per frame, including transitions).
extern uint16_t frame_count;

// Request a transition. It happens at the start of the next frame, with a fade.
void state_change(uint8_t state);
// Run the current scene's enter() again, with the same fade (the next room).
void state_restart(void);

// End the frame: count it and wait for vblank. Anything that spends frames
// outside the main loop (fades, etc.) should call this instead of vsync().
void wait_frame(void);

// Scenes live in switchable ROM banks (#pragma bank 255); main calls them with
// banked calls, which switch the right bank in and back out.
#include <gb/gb.h>
void title_enter(void) BANKED;
void title_update(void) BANKED;
void play_enter(void) BANKED;
void play_update(void) BANKED;
void game_over_enter(void) BANKED;
void game_over_update(void) BANKED;

#endif
