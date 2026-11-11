# Engine plan

How the design ([README.md](README.md)) maps onto the Game Boy Color and the RogueGB
engine. Proposals, not decisions: change freely.

## Dungeons: the body is background tiles

- **Grid:** 8×8-pixel cells, one screen per room: 20×16 cells under a 2-row HUD (or
  20×17 with a 1-row HUD). Flip-screen rooms fit "restart the room" and need no
  scrolling. A 16×16 grid would give only 10×8 cells, too small for length puzzles.
- **The body is drawn in the background, not sprites.** The hardware shows 40 sprites,
  10 per scanline: a sprite body would flicker or vanish past ~10 segments. Background
  tiles have no limit, and a move changes at most 3-4 tiles (the vblank queue already
  does this in the placeholder `src/play.c`).
- **Coatings are tile attributes.** On the Color each background tile picks one of 8
  palettes, so a fire- or ice-coated segment is the same tile on another palette, and the
  bulge travelling down the body is a palette or tile change per move. Half-and-half
  bodies come at no cost.
- **Turns and corners:** the segment tiles need straight, corner, head and tail pieces;
  flips (x/y attributes) give the four directions of each, so about 6 base tiles a body
  style.
- **Enemies, critters, keys and the bulge's highlight** are sprites (RogueGB's
  `sprite_slot.c` draws 16×16 characters; 8×8 ones are one 8×16 sprite each).
- **Coil detection:** when the head moves next to its own body, flood-fill from each
  nearby enemy; an enemy whose region doesn't reach the room's open space is coiled.
  A 320-cell fill is cheap once per move, and can be spread over frames if needed.
  "Tight loop" vs "loose circle" is a limit on the enclosed area.
- **Switches** are cells under the body: the room's switch list is checked against the
  cells that changed this move (head entering, tail leaving), not the whole body.
- **Room data:** RogueGB's chunk format and editor (`web/chunks.html`, `tools/chunks.mjs`)
  can be adapted for hand-built rooms: walls, water, switches, doors, spawns.

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

1. Auto-movement on the 8×8 grid at a slow speed, with corner tiles.
2. Hitting a wall or yourself bounces back and costs a tail segment; at just the head,
   lose a heart and restart the room at the length you entered with.
3. HUD: hearts, current length, the length the room needs.
4. Critters to eat (one segment each, a little faster each time).
5. A latched two-button switch that opens the exit door.
6. One armored enemy: coil to crack, then eat before its timer runs out; its attack on a
   real-time clock bites off a segment.

The boost question decides the input map early: in dungeons A and B are both free, so a
held-button boost costs nothing now and can become the Dash item later.
