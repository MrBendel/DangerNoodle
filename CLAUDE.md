# Notes for Claude sessions on Danger Noodle

- A Game Boy Color game on the engine from RogueGB (https://github.com/MrBendel/RogueGB):
  look there for systems not carried over yet (sprite slots, camera/scrolling rooms,
  actors, save files in SRAM, far RAM, dialogue, music hooks) before writing new ones.
- The design: `docs/design/README.md` (a snapshot of the live doc it links to) and `docs/design/engine-plan.md`. The current play scene
  (`src/play.c`) is a placeholder that proves the pipeline; replace it freely.
- Engine: GBDK-2020 4.5.0. Reference docs are in `docs/gbdk/` (start with `docs/gbdk/README.md`).
- The user builds and tests with `npm run play` / `npm test` (Node 22+).
- In a cloud session: download GBDK into `tools/` first
  (`curl -fSL -o tools/gbdk-linux64.tar.gz https://github.com/gbdk-2020/gbdk-2020/releases/download/4.5.0/gbdk-linux64.tar.gz`);
  `node tools/build.mjs` extracts it on first use.
- Verify every change with `node tools/test.mjs`. Look at screenshots in
  `build/test-output/` with Read when visuals change; `node tools/test.mjs --update`
  accepts new golden screens.
- The HUD goes at the bottom, on the window layer (`HUD_WY` in `src/gfx.h`): free in hardware,
  where a top HUD needs a scanline interrupt every frame. Don't move it to the top.
- Keep watchable game state in global, non-static variables.
- Bank 0 is for hot code; cold code/data goes in `#pragma bank 255` files or `bank: true`
  assets (README, "Engine rules"). The build fails if bank 0 overflows or passes 90%.
- Game Boy Color only, double speed: a frame is 140,448 CPU cycles (131,328 after vblank,
  `FRAME_LIMIT` in tests/helpers.mjs). Palettes go through `pal_base_*` and `gfx_set_fade`.
- Frame budget: per-frame code avoids 32-bit math and division; VRAM writes go through the
  vblank queue (`gfx_strip`, `gfx_strip_attr`, `gfx_vram_copy`; at most 8 strips and 6
  copies a frame before it flushes the slow way).
- Two grids (`src/game.h`): the noodle moves on 8x8 cells; the floor, enemies, switches
  and blocks are 16x16 (Zelda-style). Walls are 16 px at the back (top) and sides, 8 px
  at the front (bottom). A one-screen room is 8x7 blocks above a one-row HUD; rooms up
  to 14x14 blocks scroll (`src/room.c`: the whole room sits in the 32x32 background
  map). Placeholder art is ASCII in `tools/tile-art.mjs`.
- Never commit build output or the extracted `tools/.gbdk-*` folders.
