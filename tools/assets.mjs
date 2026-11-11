// Converts artwork PNGs into GBDK tile data at build time.
//
// Each entry in ASSETS becomes build/gen/<name>.c + <name>.h. Two kinds:
//
// Background tiles (default kind; or `ascii: [tiles]` drawn in a .mjs, `src` being that file):
//   const uint8_t <name>_tiles[];   // 2bpp, 16 bytes per 8x8 tile
//   #define <NAME>_TILE_COUNT n
//   Pixels map to the 4 DMG shades by brightness (lightest = 0, darkest = 3);
//   transparent pixels become shade 0.
//
// Sprites (kind: 'sprite'): 16x16 animation frames for 8x16 sprite mode.
//   <name>_tiles[]   32 bytes per 8x16 column (two 8x8 tiles, top then bottom),
//                    deduplicated, including columns that are flipped copies
//   <name>_frames[]  4 bytes per frame: left column, left flags, right column,
//                    right flags (flags = S_FLIPX / S_FLIPY for flipped columns)
//   <name>_anims[]   2 bytes per animation: first frame, frame count
//   #define <NAME>_ANIM_<ANIM> index, plus column/frame/anim counts
//   Transparent pixels are color 0; opaque colors map to 1..3 from lightest to
//   darkest, with one mapping for all frames of a sprite. `mirror` entries build
//   an animation from another one flipped horizontally, at no ROM or VRAM cost.
//   `crop8: x` makes a narrow sprite: one 8x16 column cropped from x (for small
//   things like bullets, one hardware sprite each).
//   An animation given as { roll: 'file.png' } is generated: the frame rotated
//   0, 90, 180 and 270 degrees clockwise (exact for pixel art). 180 degrees is
//   just both hardware flips, so a roll costs one extra frame of tiles.
//
// `bank: true` puts an asset in a switchable ROM bank (see bankHeader below).
//
// Called by build.mjs; generated files are only rewritten when a source PNG is newer.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { BOARD_TILES, asciiTile } from './tile-art.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const GEN_DIR = path.join(ROOT, 'build', 'gen');

export const ASSETS = [
  // ASCII 32..95: space, punctuation, digits, A-Z. GB Studio sheets start at
  // ASCII 32, 16 glyphs per row, so this is the first 4 rows.
  { name: 'font', bank: true, src: 'artwork/Fonts for GB Studio/light/default/ascii.png', first: 0, count: 64 },
  // 3x3 dialog frame: corners, edges and fill, row-major.
  { name: 'frame', bank: true, src: 'artwork/Fonts for GB Studio/light/frame.png' },
  // The board and the noodle: ASCII art in tools/tile-art.mjs (placeholders).
  { name: 'board', bank: true, ascii: BOARD_TILES, src: 'tools/tile-art.mjs' },
  // Sprites go here as Danger Noodle gets art, e.g.:
  // { name: 'spr_noodle', kind: 'sprite', bank: true, dir: 'artwork/noodle',
  //   anims: { slither_right: numbered('noodle right', 4) }, mirror: { slither_left: 'slither_right' } },
];

/** "player walk down", 4 -> ["player walk down (1).png", ..., "player walk down (4).png"] */
function numbered(prefix, n) {
  return Array.from({ length: n }, (_, i) => `${prefix} (${i + 1}).png`);
}

/** Minimal PNG decoder: 8-bit RGB/RGBA/gray/gray+alpha/indexed, non-interlaced. */
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8, width, height, depth, ctype, interlace, palette = null, trns = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      depth = data[8]; ctype = data[9]; interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`unsupported PNG (depth ${depth}, interlace ${interlace})`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= channels ? px[y * stride + x - channels] : 0;
      const b = y ? px[(y - 1) * stride + x] : 0;
      const c = x >= channels && y ? px[(y - 1) * stride + x - channels] : 0;
      let p;
      if (f === 0) p = 0;
      else if (f === 1) p = a;
      else if (f === 2) p = b;
      else if (f === 3) p = (a + b) >> 1;
      else {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = (v + p) & 0xff;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const s = px.subarray(i * channels, i * channels + channels);
    let r, g, b, a = 255;
    if (ctype === 0) [r, g, b] = [s[0], s[0], s[0]];
    else if (ctype === 4) [r, g, b, a] = [s[0], s[0], s[0], s[1]];
    else if (ctype === 2) [r, g, b] = s;
    else if (ctype === 6) [r, g, b, a] = s;
    else {
      [r, g, b] = palette.subarray(s[0] * 3, s[0] * 3 + 3);
      if (trns && s[0] < trns.length) a = trns[s[0]];
    }
    rgba.set([r, g, b, a], i * 4);
  }
  return { width, height, rgba };
}

/** Slice an image into 8x8 tiles (row-major) and encode each as 2bpp. */
export function toTiles({ width, height, rgba }) {
  const lum = (i) => (rgba[i + 3] < 128 ? 255 : 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
  // Rank the distinct brightness levels so any 4-color art maps cleanly.
  const levels = [...new Set(Array.from({ length: width * height }, (_, i) => Math.round(lum(i * 4))))].sort((a, b) => b - a);
  if (levels.length > 4) throw new Error(`image has ${levels.length} shades; expected at most 4`);
  const shadeOf = (v) => {
    if (levels.length === 2) return v === levels[0] ? 0 : 3;
    return levels.indexOf(v);
  };
  const tiles = [];
  for (let ty = 0; ty < height / 8; ty++) {
    for (let tx = 0; tx < width / 8; tx++) {
      const t = [];
      for (let y = 0; y < 8; y++) {
        let lo = 0, hi = 0;
        for (let x = 0; x < 8; x++) {
          const s = shadeOf(Math.round(lum(((ty * 8 + y) * width + tx * 8 + x) * 4)));
          lo |= (s & 1) << (7 - x);
          hi |= (s >> 1) << (7 - x);
        }
        t.push(lo, hi);
      }
      tiles.push(t);
    }
  }
  return tiles;
}

const hex = (b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0');
const lumOf = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const reverseBits = (b) => {
  let r = 0;
  for (let i = 0; i < 8; i++) if (b & (1 << i)) r |= 0x80 >> i;
  return r;
};
const S_FLIPX = 0x20;
const S_FLIPY = 0x40;

/** Rotate a 16x16 RGBA image 90 degrees clockwise. */
function rotate90(img) {
  const out = new Uint8Array(img.rgba.length);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      // Destination (x, y) takes source (y, 15 - x).
      const si = ((15 - x) * 16 + y) * 4, di = (y * 16 + x) * 4;
      out.set(img.rgba.subarray(si, si + 4), di);
    }
  }
  return { width: 16, height: 16, rgba: out };
}

/** The PNG files an animation entry reads. */
const animFiles = (v) => (Array.isArray(v) ? v : [v.roll || v.idle || v.run || v.jump].filter(Boolean));
const spriteSources = (a) => {
  return Object.values(a.anims).flatMap(animFiles).map((f) => path.join(ROOT, a.dir, f));
};

/** Convert a sprite asset (see the header comment) into its C arrays. */
export function buildSprite(a) {
  const dir = path.join(ROOT, a.dir);
  const animNames = [...Object.keys(a.anims), ...Object.keys(a.mirror ?? {})];
  // Frame images per animation, in order.
  const animImages = {};
  for (const [name, v] of Object.entries(a.anims)) {
    const load = (f) => {
      const img = decodePng(fs.readFileSync(path.join(dir, f)));
      if (img.width !== 16 || img.height !== 16) throw new Error(`${a.dir}/${f}: expected 16x16, got ${img.width}x${img.height}`);
      return img;
    };
    if (Array.isArray(v)) animImages[name] = v.map(load);
    else {
      const frames = [load(v.roll)];
      for (let i = 1; i < 4; i++) frames.push(rotate90(frames[i - 1]));
      animImages[name] = frames;
    }
  }
  const images = Object.values(animImages).flat();
  // One color mapping for the whole sprite: lightest opaque color = 1, darkest = 3.
  const opaque = new Map();
  for (const img of images) {
    for (let i = 0; i < img.rgba.length; i += 4) {
      if (img.rgba[i + 3] < 128) continue;
      opaque.set((img.rgba[i] << 16) | (img.rgba[i + 1] << 8) | img.rgba[i + 2], lumOf(img.rgba[i], img.rgba[i + 1], img.rgba[i + 2]));
    }
  }
  if (opaque.size > 3) throw new Error(`${a.name}: ${opaque.size} opaque colors; sprites allow at most 3 plus transparent`);
  const ranked = [...opaque.entries()].sort((x, y) => y[1] - x[1]).map(([rgb]) => rgb);
  const colorIndex = new Map(ranked.map((rgb, i) => [rgb, 4 - ranked.length + i]));

  // Encode one 8x16 column of a frame as 32 bytes (top tile, then bottom tile).
  // x0: left edge of the 8-px column in the frame (0 or 8, or a crop offset).
  const column = (img, x0) => {
    const out = [];
    for (let y = 0; y < 16; y++) {
      let lo = 0, hi = 0;
      for (let x = 0; x < 8; x++) {
        const i = (y * 16 + x0 + x) * 4;
        const c = img.rgba[i + 3] < 128 ? 0 : colorIndex.get((img.rgba[i] << 16) | (img.rgba[i + 1] << 8) | img.rgba[i + 2]);
        lo |= (c & 1) << (7 - x);
        hi |= (c >> 1) << (7 - x);
      }
      out.push(lo, hi);
    }
    return out;
  };
  const columns = [];
  const index = new Map(); // bytes -> [column, flags]
  // Flip a column vertically: reverse the order of its 16 rows (2 bytes each).
  const flipRows = (bytes) => Array.from({ length: 16 }, (_, r) => bytes.slice((15 - r) * 2, (15 - r) * 2 + 2)).flat();
  const addColumn = (bytes) => {
    const variants = [
      [bytes, 0],
      [bytes.map(reverseBits), S_FLIPX],
      [flipRows(bytes), S_FLIPY],
      [flipRows(bytes).map(reverseBits), S_FLIPX | S_FLIPY],
    ];
    for (const [v, flip] of variants) {
      const hit = index.get(v.join(','));
      if (hit) return [hit[0], hit[1] ^ flip];
    }
    columns.push(bytes);
    const ref = [columns.length - 1, 0];
    index.set(bytes.join(','), ref);
    return ref;
  };

  const frames = []; // [left column, left flags, right column, right flags]
  const anims = {}; // name -> [first frame, count]
  for (const [name, imgs] of Object.entries(animImages)) {
    anims[name] = [frames.length, imgs.length];
    for (const img of imgs) {
      if (a.crop8 !== undefined) {
        // Narrow sprite: one 8x16 column cropped from the frame (both slots point at it).
        const col = addColumn(column(img, a.crop8));
        frames.push([...col, ...col]);
      } else frames.push([...addColumn(column(img, 0)), ...addColumn(column(img, 8))]);
    }
  }
  for (const [name, src] of Object.entries(a.mirror ?? {})) {
    const [first, count] = anims[src];
    anims[name] = [frames.length, count];
    for (let i = 0; i < count; i++) {
      const [lc, lf, rc, rf] = frames[first + i];
      frames.push([rc, rf ^ S_FLIPX, lc, lf ^ S_FLIPX]);
    }
  }
  if (columns.length > 255 || frames.length > 255) throw new Error(`${a.name}: too many columns or frames`);
  const NAME = a.name.toUpperCase();
  const header = [
    `// Generated by tools/assets.mjs from ${a.dir}. Do not edit.`,
    `#ifndef GEN_${NAME}_H`, `#define GEN_${NAME}_H`, '#include <stdint.h>',
    `#define ${NAME}_COLUMN_COUNT ${columns.length}`,
    // The column with no pixels (255 if none): a frame using it there needs no sprite.
    `#define ${NAME}_BLANK_COLUMN ${Math.max(-1, columns.findIndex((c) => c.every((b) => b === 0))) & 255}`,
    `#define ${NAME}_FRAME_COUNT ${frames.length}`,
    `#define ${NAME}_ANIM_COUNT ${animNames.length}`,
    ...animNames.map((n, i) => `#define ${NAME}_ANIM_${n.toUpperCase()} ${i}`),
    `extern const uint8_t ${a.name}_tiles[];`,
    `extern const uint8_t ${a.name}_frames[];`,
    `extern const uint8_t ${a.name}_anims[];`,
    '// The art\'s own colors as a Game Boy Color palette (RGB555; entry 0 is transparent).',
    `extern const uint16_t ${a.name}_palette[4];`,
    '#endif', '',
  ].join('\n');
  // Palette entry i holds the color mapped to index i (lightest = 1 .. darkest =
  // 3; with fewer colors the lighter entries repeat the lightest one).
  const rgb555 = (rgb) => ((rgb >> 19) & 31) | (((rgb >> 11) & 31) << 5) | (((rgb >> 3) & 31) << 10);
  const palette = [0x7fff, 0, 0, 0];
  for (const [rgb, i] of colorIndex) palette[i] = rgb555(rgb);
  for (let i = 3; i >= 1; i--) if (![...colorIndex.values()].includes(i)) palette[i] = palette[i + 1] ?? 0x7fff;
  const source = [
    `// Generated by tools/assets.mjs from ${a.dir}. Do not edit.`,
    `#include "${a.name}.h"`,
    `const uint8_t ${a.name}_tiles[] = {`,
    ...columns.map((t) => '    ' + t.map(hex).join(', ') + ','),
    '};',
    `const uint8_t ${a.name}_frames[] = {`,
    ...frames.map((f) => '    ' + f.map(hex).join(', ') + ','),
    '};',
    `const uint8_t ${a.name}_anims[] = {`,
    ...animNames.map((n) => `    ${anims[n][0]}, ${anims[n][1]}, // ${n}`),
    '};',
    `const uint16_t ${a.name}_palette[4] = {${palette.map((c) => '0x' + c.toString(16).padStart(4, '0')).join(', ')}};`,
    '',
  ].join('\n');
  return { header, source, stats: { columns: columns.length, frames: frames.length } };
}


/** Regenerates stale assets. Returns the list of generated .c files. */
export function buildAssets({ quiet = false } = {}) {
  fs.mkdirSync(GEN_DIR, { recursive: true });
  const self = fs.statSync(fileURLToPath(import.meta.url)).mtimeMs;
  const out = [];
  for (const a of ASSETS) {
    const c = path.join(GEN_DIR, `${a.name}.c`);
    const h = path.join(GEN_DIR, `${a.name}.h`);
    out.push(c);
    const sources = a.kind === 'sprite'
      ? spriteSources(a)
      : [path.join(ROOT, a.src)];
    const genTime = fs.existsSync(c) && fs.existsSync(h) ? fs.statSync(c).mtimeMs : 0;
    if (genTime > Math.max(self, ...sources.map((f) => fs.statSync(f).mtimeMs))) continue;
    if (a.kind === 'sprite') {
      const { header, source, stats } = buildSprite(a);
      if (!quiet) console.log(`[assets] ${a.dir} -> build/gen/${a.name}.c (${stats.frames} frames, ${stats.columns} unique columns)`);
      fs.writeFileSync(h, bankHeader(a, header));
      fs.writeFileSync(c, bankSource(a, source));
      continue;
    }
    const src = sources[0];
    if (!quiet) console.log(`[assets] ${a.src} -> build/gen/${a.name}.c`);
    const all = a.ascii ? a.ascii.map((t, i) => asciiTile(t, `${a.name} tile ${i}`)) : toTiles(decodePng(fs.readFileSync(src)));
    const tiles = all.slice(a.first ?? 0, (a.first ?? 0) + (a.count ?? all.length));
    const NAME = a.name.toUpperCase();
    fs.writeFileSync(h, bankHeader(a, [
      `// Generated by tools/assets.mjs from ${a.src}. Do not edit.`,
      `#ifndef GEN_${NAME}_H`, `#define GEN_${NAME}_H`, '#include <stdint.h>',
      `#define ${NAME}_TILE_COUNT ${tiles.length}`,
      `extern const uint8_t ${a.name}_tiles[];`, '#endif', '',
    ].join('\n')));
    fs.writeFileSync(c, bankSource(a, [
      `// Generated by tools/assets.mjs from ${a.src}. Do not edit.`,
      `#include "${a.name}.h"`,
      `const uint8_t ${a.name}_tiles[] = {`,
      ...tiles.map((t) => '    ' + t.map(hex).join(', ') + ','),
      '};', '',
    ].join('\n')));
  }
  return out;
}

// `bank: true` assets go in a switchable ROM bank (chosen by bankpack). Code that
// reads them must switch to BANK(<name>) first and switch back afterwards (see
// gfx_init and actors_init). Tables read every frame are copied to RAM at load
// (player_init, actors_init); tiles queued with gfx_vram_copy pass their bank, and
// the vblank handler switches it in for the copy.
function bankHeader(a, header) {
  if (!a.bank) return header;
  return header.replace('#include <stdint.h>', `#include <stdint.h>\n#include <gb/gb.h>\nBANKREF_EXTERN(${a.name})`);
}

function bankSource(a, source) {
  if (!a.bank) return source;
  return `#pragma bank 255\n` + source.replace(/(#include "[^"]+")/, `#include <gb/gb.h>\n$1\nBANKREF(${a.name})`);
}
