// Placeholder background art drawn as ASCII, until Danger Noodle has real
// artwork. Everything on the board is a 16x16 metatile (the grid of Zelda-style
// dungeon rooms, and the size of the enemies): 16 rows of 16 characters, '.' or
// '0' for color 0, '1'-'3' for colors 1-3 (which actual colors is up to the
// palette: src/palettes.c). Each metatile becomes four 8x8 tiles in the order
// top-left, top-right, bottom-left, bottom-right; tools/assets.mjs turns them
// into build/gen/<name>.c like any other tiles.

/** Turn a metatile on its side (rows become columns): a right-facing head faces down. */
export const transpose = (t) => t.map((_, y) => t.map((row) => row[y]).join(''));

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
// A bevelled stone block: 1 lit edge, 2 face, 3 shadow and cracks.
const wall = [
  '1111111111111112',
  '1122222222222233',
  '1222222222222233',
  '1222222232222233',
  '1222222232222233',
  '1222222222222233',
  '1222222222222233',
  '1222322222222233',
  '1222232222222233',
  '1222222222222233',
  '1222222222222233',
  '1222222222322233',
  '1222222222232233',
  '1222222222222233',
  '1233333333333333',
  '2333333333333333',
];
// The noodle: 1 outline, 2 scales, 3 spots, belly and eyes.
const body = [
  '....11111111....',
  '..112222222211..',
  '.12222222222221.',
  '.12223222232221.',
  '1222333223332221',
  '1222232222322221',
  '1222222222222221',
  '1222222332222221',
  '1222223333222221',
  '1222222332222221',
  '1222222222222221',
  '1222322222232221',
  '.12333222333221.',
  '.12232222223221.',
  '..112222222211..',
  '....11111111....',
];
const headRight = [
  '..111111111111..',
  '.12222222222221.',
  '1222222222222221',
  '1222222222333221',
  '1222222223311321',
  '1222222223311321',
  '1222222222333221',
  '1222222222222221',
  '1222222222222221',
  '1222222222333221',
  '1222222223311321',
  '1222222223311321',
  '1222222222333221',
  '1222222222222221',
  '.12222222222221.',
  '..111111111111..',
];
// Food: 1 outline and stem, 2 skin, 3 shine.
const food = [
  '........11......',
  '.......11.......',
  '...1111111111...',
  '..122222222221..',
  '.12233222222221.',
  '.12332222222221.',
  '1223222222222221',
  '1222222222222221',
  '1222222222222221',
  '1222222222222221',
  '1222222222222221',
  '.12222222222221.',
  '.12222222222221.',
  '..122222222221..',
  '...1111..1111...',
  '................',
];

/** A 16x16 metatile -> its four 8x8 tiles (top-left, top-right, bottom-left, bottom-right). */
export function quarters(mt, name = 'metatile') {
  if (mt.length !== 16 || mt.some((r) => r.length !== 16)) throw new Error(`${name}: a metatile is 16 rows of 16 characters`);
  const q = (x0, y0) => mt.slice(y0, y0 + 8).map((r) => r.slice(x0, x0 + 8));
  return [q(0, 0), q(8, 0), q(0, 8), q(8, 8)];
}

// Order matters: src/play.c names them (MT_GRASS ...), four tiles each.
const METATILES = { grass, wall, body, headRight, headDown: transpose(headRight), food };
export const BOARD_TILES = Object.entries(METATILES).flatMap(([name, mt]) => quarters(mt, name));

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
