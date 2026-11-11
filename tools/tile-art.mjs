// Placeholder background tiles drawn as ASCII art, until Danger Noodle has real
// artwork. Each tile is 8 rows of 8 characters: '.' or '0' is color 0, '1'-'3'
// colors 1-3 (which actual colors is up to the palette: src/palettes.c).
// tools/assets.mjs turns each set into build/gen/<name>.c like any other tiles.

/** Turn a tile on its side (rows become columns): a right-facing head faces down. */
export const transpose = (t) => t.map((_, y) => t.map((row) => row[y]).join(''));

const grass = [
  '........',
  '.....1..',
  '........',
  '.1......',
  '........',
  '......1.',
  '..1.....',
  '........',
];
// Bricks: 1 brick, 2 its shade, 3 mortar.
const wall = [
  '11111213',
  '11111213',
  '22222223',
  '33333333',
  '12131111',
  '12131111',
  '22232222',
  '33333333',
];
// The noodle: 1 outline, 2 scales, 3 belly and eyes.
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
export const BOARD_TILES = [grass, wall, body, headRight, transpose(headRight), food];

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
