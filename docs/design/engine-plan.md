# Engine plan

How the design ([README.md](README.md)) maps onto the Game Boy Color and the RogueGB
engine. Proposals, not decisions: change freely.

## Dungeons: two grids, the body in background tiles

- **Two grids** (decided 2026-11-11). The noodle moves on **8×8 cells**; the floor,
  enemies, switches and pushable blocks sit on **16×16 blocks**, Zelda-style. A block
  covers 2×2 cells; block (bx, by) starts at cell (2 + 2bx, 2 + 2by).
- **Walls with depth** (decided 2026-11-12): rooms are seen from a little above and in
  front. The back (top) wall is 16 px, its top and then its brick face; the side walls
  are 16 px; the near (bottom) wall is 8 px. A room of W×H blocks is (4 + 2W)×(3 + 2H)
  cells. The HUD is one row, so the playfield is 160×136 and a **one-screen room is
  8×7 blocks** (16×14 = 224 open cells).
- **Rooms larger than the screen scroll** (decided 2026-11-12), up to **14×14 blocks**
  (32×31 cells), so a whole room fits the 32×32 background map: it's drawn once, the
  body's cell updates go straight to the map, and scrolling is only the scroll
  registers (no streaming). The camera (`src/room.c`) eases after the head, looking
  24 px ahead the way it's going, and stays inside the room. Rooms beyond 14 blocks
  would need RogueGB's row/column streaming (`camera.c`, `room_fill.s`) and body
  updates that skip cells outside the drawn area.
- **What the two grids mean for the rules (to decide while prototyping):** a 16×16
  enemy fills 2×2 cells, so a tight coil around one is a ring of 12 cells. A 16×16
  switch could press when any of its 4 cells is under the body, or need all 4
  (a "weighted" switch for free). Pushable blocks move a block (2 cells) at a time.
- **Smooth movement (optional):** 8 px steps read fine at most speeds. For more polish,
  the head and tail tip can be sprites that slide between cells every frame while the
  body behind them stays background tiles that change once per step.
- **The HUD is at the bottom, on the window layer** (as in RogueGB, decided there
  2026-10-12). The hardware draws the window from line WY down to the bottom of the
  screen for free; a top HUD would need a scanline interrupt every frame to switch the
  window off again. The only per-frame cost is `gfx_sprite_split(HUD_WY)`, which keeps
  sprites from drawing over it. It also suits the overworld: the background scrolls
  under a fixed window. `gfx.h` defines `HUD_ROWS` (1), `PLAYFIELD_TH` and `HUD_WY` (136).
- **The body is drawn in the background, not sprites.** The hardware shows 40 sprites,
  10 per scanline: a sprite body would flicker past ~10 segments in a row. Background
  tiles have no limit, and a move changes at most 4 cells (4 one-tile strips in the
  vblank queue), as the placeholder `src/play.c` does. When the tail leaves a cell, the
  floor comes back as the right quarter of its 16×16 block.
- **Coatings are tile attributes.** On the Color each background tile picks one of 8
  palettes, so a fire- or ice-coated segment is the same tile on another palette, and the
  bulge travelling down the body is a palette or tile change per move. Half-and-half
  bodies come at no cost.
- **Turns and corners:** the segment tiles need straight, corner, head and tail pieces;
  flips (x/y attributes) give the four directions of each, so about 6 tiles a body
  style.
- **Enemies** are 16×16 sprites on the block grid (RogueGB's `sprite_slot.c` draws
  16×16 characters); critters, keys and the bulge's highlight can be 8×8.
- **Coil detection:** when the head moves next to its own body, flood-fill from each
  nearby enemy; an enemy whose region doesn't reach the room's open space is coiled.
  A one-screen room (224 cells) is cheap to fill once per move; the largest (28×28 =
  784 cells) may need the fill spread over frames.
  "Tight loop" vs "loose circle" is a limit on the enclosed area.
- **Switches** are cells under the body: the room's switch list is checked against the
  cells that changed this move (head entering, tail leaving), not the whole body.
- **Room data:** RogueGB's chunk format and editor (`web/chunks.html`, `tools/chunks.mjs`)
  can be adapted for hand-built rooms: walls, water, switches, doors, spawns.

## Thrown food: a length director

Enemies throw food to keep the noodle's length in the range the room is designed for,
not at random (design doc, Combat). A sketch:

- **Each room sets a target length range** (low, high): the same numbers its puzzles
  need, so the HUD's "length needed" and the director agree.
- **Who throws, and how often, comes from where the length sits:** below the range,
  throwers throw more often and nearer the head; inside it, a steady trickle; above it,
  little or nothing. One comparison of `noodle_len` with the range per throw decision:
  cheap, no per-frame cost.
- **It should be invisible:** throws come from enemies' own attack timers, so the
  director only picks which upcoming attack is a food throw, and the player sees
  enemies acting, not a meter being balanced.
- **Pending decisions:** whether thrown food also speeds the noodle up (probably not:
  speed would creep up mid-fight), and whether it can carry an element.

## Overworld: free movement, sprite body

- Smooth (pixel) movement while a direction is held, through RogueGB's scrolling camera
  (`camera.c`, `room_fill.s`) and player movement code.
- **Open question "overworld body":** the sprite limit makes this partly technical. A
  body drawn in sprites can be about 6-8 segments before it flickers on a line, so a
  **short fixed length that uncoils at dungeon doors** is the cheap option. A full
  trailing body in the overworld would have to be drawn in the background as it moves,
  which is harder with free (pixel) movement.

## Carried over from RogueGB later

| Need | RogueGB piece |
|---|---|
| Overworld scrolling | `camera.c`, `camera_lead.s`, `room_fill.s`, `room.c` |
| Enemies and critters | `actor.c`, `actor_draw.s`, `sprite_slot.c` |
| Save files (max length, rescues, hearts, items) | `save.c` (SRAM slots) |
| Family hints in the home burrow | `dialog.c`, `talk.c`, `tools/dialogue.mjs` |
| Cold data in spare RAM | `far.c` |

## Proposed first milestone: one Mossy Hollow room

The smallest slice that tests the dungeon rules:

1. Auto-movement on the 8×8 grid at a slow speed, with corner pieces, in a room of
   16×16 floor blocks inside the walls.
2. Hitting a wall or yourself bounces back and costs a tail segment; at just the head,
   lose a heart and restart the room at the length you entered with.
3. HUD: hearts, current length, the length the room needs.
4. Critters to eat (one segment each, a little faster each time).
5. A latched two-button switch that opens the exit door.
6. One armored enemy: coil to crack, then eat before its timer runs out; its attack on a
   real-time clock bites off a segment.

The boost question decides the input map early: in dungeons A and B are both free, so a
held-button boost costs nothing now and can become the Dash item later.
