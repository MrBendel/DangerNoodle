// Danger Noodle entry point: boot, then the main loop.
// (The loop, scene changes and VRAM queue come from RogueGB's engine.)
//
// The loop runs exactly one game_state update per frame. Scene changes are
// requested with state_change() and performed here between frames: fade out,
// display off, clear, enter() the new scene, display on, fade in.
//
// Globals are deliberately non-static so the test harness and the playtest
// page can watch them by name (via build/dangernoodle.noi).
#include <gb/gb.h>
#include <gb/cgb.h>
#include "sfx.h"
#include "state.h"
#include "input.h"
#include "gfx.h"

uint8_t game_state = STATE_NONE;
uint8_t next_state = STATE_TITLE;
uint16_t frame_count;
uint8_t in_transition;  // 1 while fading between scenes
uint8_t state_reenter;  // state_restart: enter the same scene again

void state_restart(void) {
    state_reenter = 1;
}

void state_change(uint8_t state) {
    next_state = state;
}

void wait_frame(void) {
    gfx_commit();  // hand this frame's queued VRAM updates to the next vblank
    sfx_update();  // step any sound that has more than one note
    frame_count++;
    vsync();
}

static void enter_next_state(void) {
    in_transition = 1;
    if (game_state != STATE_NONE) fade_out();
    DISPLAY_OFF;
    gfx_clear();
    game_state = next_state;
    switch (game_state) {
        case STATE_TITLE: title_enter(); break;
        case STATE_PLAY: play_enter(); break;
        case STATE_GAME_OVER: game_over_enter(); break;
    }
    DISPLAY_ON;
    fade_in();
    // Re-sample so a button held through the transition (e.g. the START that
    // caused it) doesn't count as a fresh press in the new scene.
    input_update();
    in_transition = 0;
}

void main(void) {
    DISPLAY_OFF;
    // Game Boy Color only: run the CPU at double speed (twice the work per frame).
    cpu_fast();
    sfx_init();
    gfx_init();
    gfx_set_fade(FADE_STEPS);  // start faded out; the first scene fades in
    SPRITES_8x16;  // 16x16 characters = two 8x16 sprites (assets.mjs sprites)
    SHOW_BKG;
    SHOW_SPRITES;

    while (1) {
        input_update();
        if (next_state != game_state || state_reenter) {
            state_reenter = 0;
            enter_next_state();
        }

        switch (game_state) {
            case STATE_TITLE: title_update(); break;
            case STATE_PLAY: play_update(); break;
            case STATE_GAME_OVER: game_over_update(); break;
        }
        wait_frame();
    }
}
