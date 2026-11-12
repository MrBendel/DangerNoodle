# Danger Noodle — Design Doc

> Snapshot of the live design doc, 2026-11-12:
> https://claude.ai/artifact/HHhGKf5oyhKKgrSjeMPUD9
> The live doc is the source of truth; refresh this copy when it changes.
> Engine notes for building it are in [engine-plan.md](engine-plan.md).

## Premise and story

A baby magic snake rescues its family from the Trapper Keeper, who has trapped each
relative in a dungeon to drain their magic.

- **The family:** magic snakes, each with their own element. Each dungeon takes on the
  element of the relative trapped inside it, and their leaking magic soaks into the
  monsters there.
- **The hero:** a baby who hasn't found their own magic yet. They can only borrow magic
  by eating elemental creatures.
- **The villain:** the Trapper Keeper, a collector who catalogs and keeps magical
  creatures. Each dungeon is one of his folders; his lair is the Binder. The velcro rip
  is his signature sound.
- **Growing up:** every rescue raises the snake's maximum length, like heart containers.
  Rescued relatives each teach an ability and move back to the home burrow.
- **Ending:** after rescuing Dad, the snake finds its own magic, a combination of the
  whole family's, and uses it against the Trapper Keeper, who fights with their stolen
  powers.

## Core movement and rules

The overworld is free, relaxed movement; dungeons switch to Snake-style auto-movement on
a grid.

- **Overworld:** move only when a direction is held. No self-collision, so you can't get
  stuck.
- **Dungeons:** the snake moves on its own, slowly by default. Hitting a wall or your own
  body costs a tail segment and bounces you back.
- **Speed:** each piece eaten makes you slightly faster; molting slows you down. A boost
  exists, either held on a button or as the Dash item (button choice still open).
- **Length:** your resource inside a room. Enemies bite off segments, some puzzles need a
  long body, and molting trims you. A HUD counter shows current length.
- **Hearts:** your lives across a dungeon. Getting trapped, getting bitten down to just
  your head, or choosing to give up costs one heart and restarts the room at the length
  you entered with. Room state (enemies, switches, food) resets too.
- **Game over:** lose all hearts and restart the dungeon. Hearts come back from big
  swallows (armored enemies, bosses) and refill between dungeons.

## Combat and enemies

The core loop is coil, crack, eat: trap an enemy to break its armor, then swallow it
before the timer runs out.

1. **Coil:** surround the enemy with your body. In dungeons this must be a tight loop; in
   the overworld a loose circle works.
2. **Crack:** the armor breaks. Bigger armor needs a longer coil; some armor needs an
   element first (melt ice armor with fire spit).
3. **Eat:** reach the cracked enemy before its timer runs out. It flashes faster as time
   runs low. If you're too slow, it re-armors, flees, or despawns into a smaller pickup
   (varies by enemy).

- **Rewards:** eating grows you (small enemies one segment, big ones several) and gives
  you the enemy's element.
- **Enemy attacks:** on a fixed real-time clock, not tied to your movement. An attack next
  to you bites off a segment, so boosting can finish a coil before the next attack lands.
- **Thrown food:** some enemies throw food at you, and eating it grows you. Bites take
  length away and thrown food gives it back, so length (your health in a room) rises and
  falls all through a fight instead of only going down. Throws are not random: the game
  decides how much food to throw to keep your length in the range the room is designed
  for, throwing more when you're short and less when you're long.
- **Small critters** (bugs, mice) are just food, with no fight needed.
- **Overworld combat:** a quick lunge bite as the baseline, plus spit items once earned.
  Precise coiling stays special to dungeons.
- **Items:** boomerang spit stuns; fire spit kills or melts armor.
- **Bosses:** cracked in stages, with a shorter eat timer each phase, ending in a big
  swallow.

## Elements

The snake borrows elements by eating creatures soaked in them; the effect is a coating on
the body.

- **Fire:** pass through frozen tiles, burn webs and vines, melt ice blocks.
- **Ice:** cross water.
- **Travels down the body:** a swallowed element moves along the snake like a visible
  bulge. Only segments it has passed through are coated, so a body can be half-and-half
  (ice in front, plain behind).
- **Wears off:** the coating fades after a set number of tiles, so routes need planning or
  a second creature midway.
- **Combinations (to decide):** eating ice could put out fire, or fire plus ice could make
  steam that lets you pass vents.
- **Elemental switches:** a fire switch only presses under a fire-coated segment.

## Puzzle toolkit

Holding several buttons at once with your body is the signature puzzle; everything else
feeds into it.

**Length rule:** any puzzle that needs a certain length provides a way to reach it in the
same room or the one before. Rooms show the length you'll need on the HUD.

- **Growing:** nests that keep spawning critters; fruit pots worth one segment.
- **Shrinking:** molting (husks can hold switches down); hazards that cut you, like spike
  gates or a tail-snipping crab.

### Multi-button switches

- **Latched:** stay down once pressed (early dungeons).
- **Timed:** stay down for a few seconds, so speed can replace length.
- **Weighted:** need several segments, so fold over yourself or use a husk.
- **Shapes:** button layout traces the path your body must take (S-curve, spiral).
- **Order matters:** only count when pressed in sequence.
- **Head and tail:** one needs your head, one your tail, so your length must match the gap.
- **Across obstacles:** buttons on both sides of water; needs ice in your middle segments.
- **Moving:** buttons on conveyors drift; hold them as they line up.
- **Elemental:** fire and ice buttons in one room; carry both elements at once.
- **Enemy weight:** a coiled, trapped enemy counts as weight on a button.
- **Four corners:** the classic; husks reduce how long you need to be.

### Other puzzles

- **Push blocks:** only your head can push; coil around a block to stop it sliding past;
  block or husk on a switch.
- **Conveyor belts:** move your body sideways while your head goes forward; carry food past
  for timed grabs; drag you toward spikes if you stall.
- **Keys and doors:** a swallowed key travels down your body and unlocks when your tail
  backs into the lock; keys behind water or ice; small doors only a short snake fits
  through; armored enemies that carry the key and flee.

## Overworld and hub

The overworld is calm exploration that teaches what the body can do; dungeons test it
under pressure.

- **Body length:** either trails freely, or the snake carries a short fixed length and
  uncoils to full length at a dungeon door (to decide).
- **Calm body puzzles:** lie across a gap as a bridge, wrap around a post to pull a lever,
  squeeze through tunnels only a short snake fits.
- **Enemies:** simpler than in dungeons; small creatures are food.
- **Home burrow:** rescued relatives return here. It fills up over the game, and family
  give hints, refill hearts, or sell items.
- **Story reason for the mode switch:** dungeons are cursed or bring out the snake's
  hunting frenzy (to decide).

## The eight dungeons

Each dungeon holds one relative, adds one mechanic, and gives an ability; the ramp runs
basics, then one element at a time, then combining mechanics, then everything.

| # | Dungeon | Relative | Element | New mechanic | Reward | Boss |
|---|---|---|---|---|---|---|
| 1 | Mossy Hollow | Big Sister | Nature | Coiling, eating to grow, latched two-button switches, nests | Boomerang spit | Giant armored beetle, cracked in stages |
| 2 | Ember Caves | Mom | Fire | Fire bugs burn webs and melt ice seals; coating fades | Fire spit | Magma toad; melt armor before coiling |
| 3 | Frostmere | Uncle | Ice | Ice slugs to cross water; sliding ice floors | Reverse (swap head and tail) | Frozen eel in water you cross with ice |
| 4 | Shed Ruins | Grandpa | Earth | Shrink doors, husk switches, four-corner puzzle | Molt on demand | Giant crab that snips your tail |
| 5 | Storm Spire | Aunt | Lightning | Timed switches, powered conveyors, fast enemy beats | Dash | Thunder hawk, the Trapper Keeper's lieutenant |
| 6 | Sunken Sands | Twin cousins | Sand | Quicksand, sand currents, head-and-tail buttons; double growth | Burrow under walls | Antlion in a pit that pulls you in |
| 7 | Gloom Vault | Grandma | Light | Darkness, hidden buttons, glowing attack cues | Glow (light rooms, reveal switches) | Shadow snake that copies your moves |
| 8 | The Binder | Dad | All | Every element and mechanic combined; rescued family hold switches | Your own magic | The Trapper Keeper, using the family's stolen powers |

## Open questions

- [ ] Boost on a held button, or Dash as an equippable item taking an item slot?
- [ ] Within a dungeon, is speed-up permanent pressure or mostly player-controlled?
- [ ] Overworld body: trails freely, or short fixed length that uncoils at dungeon doors?
- [ ] Element combinations: does ice put out fire, or do they make steam?
- [ ] Game over: restart the whole dungeon or a mid-dungeon checkpoint?
- [ ] Why the Trapper Keeper collects magic: his own transformation, or keeping something
      worse sealed (possible twist)?
- [ ] Starting length and how much max length each rescue adds.
