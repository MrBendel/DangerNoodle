// Placeholder background art drawn as ASCII, until Danger Noodle has real
// artwork. '.' or '0' is color 0, '1'-'3' colors 1-3 (which actual colors is up to
// the palette: src/palettes.c). tools/assets.mjs turns BOARD_TILES into
// build/gen/board.c like any other tiles.
//
// Two sizes share a room (docs/design/engine-plan.md):
//   - the noodle and its food are 8x8 tiles: the noodle moves on an 8x8 grid;
//   - the floor (and later enemies, switches, blocks) are 16x16 metatiles, laid
//     on a 16x16 grid inside the room's 8 px walls. A metatile becomes four 8x8
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

// --- 8x8: the walls (1 lit stone, 2 face, 3 shadow), drawn for the top-left;
// play.c flips them for the other sides and corners ---
const wallCorner = [
  '11111111',
  '12222222',
  '12232222',
  '12222222',
  '12222322',
  '12222222',
  '12222223',
  '12222233',
];
const wallTop = [
  '11111111',
  '22222222',
  '22322222',
  '22222232',
  '22222222',
  '23222222',
  '22222222',
  '33333333',
];

// --- 8x8: the noodle (1 outline, 2 scales, 3 belly and eyes) and its food ---
const body = [
  '.111111.',
  '12222221',
  '12322321',
  '12222221',
  '12232221',
  '12222321',
  '12222221',
  '.111111.',
];
const headRight = [
  '.11111..',
  '1222221.',
  '12223121',
  '12222221',
  '12222221',
  '12223121',
  '1222221.',
  '.11111..',
];
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

// Order matters: src/play.c names them (T_GRASS ...).
export const BOARD_TILES = [
  ...quarters(grass, 'grass'),  // T_GRASS: 4 tiles
  wallCorner, wallTop, transpose(wallTop),  // T_WALL_CORNER, T_WALL_TOP, T_WALL_LEFT
  body, headRight, transpose(headRight), food,  // T_BODY, T_HEAD_R, T_HEAD_D, T_FOOD
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
