// Placeholder background art drawn as ASCII, until Danger Noodle has real
// artwork. '.' or '0' is color 0, '1'-'3' colors 1-3 (which actual colors is up to
// the palette: src/palettes.c). tools/assets.mjs turns BOARD_TILES into
// build/gen/board.c like any other tiles.
//
// Two sizes share a room (docs/design/engine-plan.md):
//   - the noodle and its food are 8x8 tiles: the noodle moves on an 8x8 grid;
//   - the floor (and later enemies, switches, blocks) are 16x16 metatiles, laid
//     on a 16x16 grid inside the room's walls. A metatile becomes four 8x8
//     tiles: top-left, top-right, bottom-left, bottom-right.

/** Turn art on its side (rows become columns): a right-facing head faces down. */
export const transpose = (t) => t.map((_, y) => t.map((row) => row[y]).join(''));

/** A 16x16 metatile -> its four 8x8 tiles (top-left, top-right, bottom-left, bottom-right). */
export function quarters(mt, name = 'metatile') {
  if (mt.length !== 16 || mt.some((r) => r.length !== 16)) throw new Error(`${name}: a metatile is 16 rows of 16 characters`);
  const q = (x0, y0) => mt.slice(y0, y0 + 8).map((r) => r.slice(x0, x0 + 8));
  return [q(0, 0), q(8, 0), q(0, 8), q(8, 8)];
}

// --- 16x16: the floor ---
const grass = [
  '................',
  '..1.............',
  '.1.1............',
  '...........1....',
  '..........1.1...',
  '................',
  '.....1..........',
  '................',
  '................',
  '.............1..',
  '..1.........1.1.',
  '.1.1............',
  '................',
  '.......1........',
  '......1.1.......',
  '................',
];

// --- 8x8: the walls, seen from a little above and in front (1 lit top, 2 brick
// face, 3 shadow and edges). The back (top) wall is 16 px: its top, then its face.
// The side walls are 16 px of top with an edge where they drop to the floor; the
// near (bottom) wall is an 8 px top. Drawn for the left side; src/room.c flips
// them for the right ---
const wallCap = [
  '11111111',
  '11121111',
  '11111111',
  '11111121',
  '12111111',
  '11111111',
  '11112111',
  '11111111',
];
const wallEdge = [  // the side wall's inner column: its edge on the right
  '11111123',
  '11211123',
  '11111123',
  '11111123',
  '11112123',
  '11111123',
  '12111123',
  '11111123',
];
const wallFace = [  // the back wall's bricks
  '22232222',
  '22232222',
  '33333333',
  '22222223',
  '22222223',
  '33333333',
  '22232222',
  '33333333',
];
const wallBottom = [  // the near wall: an edge along the top
  '33333333',
  '22222222',
  '11111111',
  '11121111',
  '11111111',
  '11111121',
  '12111111',
  '11111111',
];
const wallCorner = [  // where the left wall meets the near wall
  '11111123',
  '11111122',
  '11111111',
  '11121111',
  '11111111',
  '11111121',
  '12111111',
  '11111111',
];

// --- 8x8: the noodle (1 outline, 2 scales, 3 belly and eyes) and its food ---
// The body fills its cells edge to edge, one segment a cell: straight pieces with
// a divider line on one edge only (left across, top down), so the segments run
// into each other, and bends (src/play.c turns them to fit).
// The head and tail tip are their own pieces, open where they meet the body, so
// they slide out of it with no seam.
const segment = [  // left to right; the divider on the left
  '11111111',
  '12222222',
  '12232222',
  '12222232',
  '12322222',
  '12222322',
  '12222222',
  '11111111',
];
// A bend, its divider on the tail side like a segment's: from the left (the
// divider down its left edge), turning down, the outside corner rounded. Flips
// can't move the divider to another edge, so its rotation (transposed: from the
// top, turning right) is a second tile; flips of the two give all eight turns.
const bend = [
  '11111...',
  '1222211.',
  '12232221',
  '12222221',
  '12222321',
  '12322221',
  '12222221',
  '12222221',
];
const headRight = [  // open at the back (left)
  '111111..',
  '2222221.',
  '22312221',
  '22222221',
  '22222221',
  '22312221',
  '2222221.',
  '111111..',
];
// The tip, its body going on to the right. Its own palette (play.c): 3 is grass,
// masking the body it slides over so it keeps its taper.
const tailRight = [
  '33331111',
  '33112222',
  '31222222',
  '12222222',
  '12222222',
  '31222222',
  '33112222',
  '33331111',
];
/** Upside down: a down-facing piece faces up (8x16 sprites can't flip in Y alone). */
const flipY = (t) => [...t].reverse();
// Food: 1 outline and stem, 2 skin, 3 shine.
const food = [
  '...1....',
  '....1...',
  '.111111.',
  '12322221',
  '13222221',
  '12222221',
  '.122221.',
  '..1111..',
];

// Order matters: src/room.h names them (T_GRASS ...).
export const BOARD_TILES = [
  ...quarters(grass, 'grass'),  // T_GRASS: 4 tiles
  wallCap, wallEdge, wallFace, wallBottom, wallCorner,  // T_WALL_CAP ... T_WALL_CORNER
  segment, transpose(segment), bend, transpose(bend), food,  // T_TUBE_H, T_TUBE_V, T_BEND_H, T_BEND_V, T_FOOD
];

// The noodle's moving ends as sprites (src/play.c slides them between cells):
// 8x16 sprite mode, so each 8x8 picture is the top of a pair with a blank bottom.
// A vertical flip in 8x16 mode swaps the pair's halves too (the picture would
// land 8 px low), so up-facing pieces are their own tiles; left is a flip of right.
// Order matters: src/play.c names them (S_HEAD_R ...).
const blank = Array(8).fill('........');
export const NOODLE_SPRITE_TILES = [
  headRight, blank,                    // S_HEAD_R (left: flipped in X)
  transpose(headRight), blank,         // S_HEAD_D
  flipY(transpose(headRight)), blank,  // S_HEAD_U
  tailRight, blank,                    // S_TAIL_R
  transpose(tailRight), blank,         // S_TAIL_D
  flipY(transpose(tailRight)), blank,  // S_TAIL_U
];

/** 8 strings -> 16 bytes of 2bpp. */
export function asciiTile(rows, name = 'tile') {
  if (rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`${name}: a tile is 8 rows of 8 characters`);
  const out = [];
  for (const row of rows) {
    let lo = 0, hi = 0;
    for (let x = 0; x < 8; x++) {
      const c = row[x] === '.' ? 0 : Number(row[x]);
      if (!(c >= 0 && c <= 3)) throw new Error(`${name}: bad color '${row[x]}'`);
      lo |= (c & 1) << (7 - x);
      hi |= (c >> 1) << (7 - x);
    }
    out.push(lo, hi);
  }
  return out;
}
