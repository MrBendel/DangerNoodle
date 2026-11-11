// Fonts: artwork/fonts/font-sheet.png -> build/gen/fonts_data.h, glyph tables for
// the text renderer (src/text.c includes it, so the tables share its ROM bank).
// Called by tools/build.mjs; also runnable on its own: node tools/fonts.mjs
//
// Each font is a grid of cells on the sheet, a string of characters per row.
// A glyph keeps its cell's full height (so letters share a baseline) and is
// trimmed to its inked columns: the renderer spaces letters by their real width
// plus the font's gap (proportional text). Colors become indices 0-3 by the
// font's `colors` (0 is see-through), so a palette picks the actual colors: the
// display font's gold can be any theme's colors.
//
// Each glyph row is stored as 2 bytes, 2 bits a pixel from the left, at most 8
// pixels wide.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, GEN_DIR } from './assets.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHEET = path.join(ROOT, 'artwork', 'fonts', 'font-sheet.png');

export const FONTS = [
  {
    // Big gold letters, 8x16 cells: titles, banners, area names.
    name: 'display',
    x: 0, y: 0, cellW: 8, cellH: 16, gap: 0, space: 5,
    rows: ['ABCDEFGHIJKLM', 'NOPQRSTUV', 'WXYZ?!.', '1234567890'],
    // outline 3, lower fill (orange) 2, upper fill (yellow) 1
    colors: { '181425': 3, feae34: 2, fee761: 1 },
    lowercaseAsUpper: true,
  },
  {
    // Small 3x7 letters on a 4 px grid: menus, the HUD, loot cards.
    name: 'compact',
    x: 0, y: 161, cellW: 4, cellH: 7, rowStep: 8, gap: 1, space: 3,
    rows: [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      // after '!': a double quote, a quote, : ; a small x as *, ( ) [ ] _ + - and ÷ as /
      '1234567890.,?!"\':;* ()[]_ +-/',
    ],
    colors: { '181425': 3, '5a6988': 2, '8b9bb4': 1 },
  },
  {
    // Italic 8x8 letters with a soft shadow (the sheet's shaded copy): dialogue.
    name: 'italic',
    x: 96, y: 72, cellW: 8, cellH: 8, gap: 0, space: 4,
    rows: [
      'ABCDEFGHIJKL', 'MNOPQRSTUVWX', 'YZ', 'abcdefghijkl', 'mnopqrstuvw', 'xyz', '0123456789',
      // ¢ and ÷ have no ASCII spot: their cells are skipped (spaces here)
      "$ %\":'?!\\|#", '+-*/ =,.;', '@&_(){}<>[]',
    ],
    colors: { '181425': 3 },
    // The shadow: ink at low opacity on the sheet, a color of its own here.
    faint: 2,
  },
];

const hex = (r, g, b) => [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

const MAGENTA = 'ff00ff';

/**
 * Glyphs of one font from the decoded sheet: { chars: Map(char -> index), glyphs:
 * [{ w, rows }], gap }. Widths, two ways:
 * - Variable-width sheets (GB Studio's convention): the artist paints the unused
 *   columns on a letter's right magenta. Its width is the columns before the first
 *   magenta one (all of them if there's none), blank columns kept, and letters
 *   follow each other with no gap: the spacing is the artist's. A sheet with any
 *   magenta in the font's cells is read this way.
 * - Otherwise each letter is trimmed to its inked columns and the font's gap goes
 *   between letters.
 */
export function sliceFont(img, f) {
  const { width, rgba } = img;
  const step = f.rowStep ?? f.cellH;
  const isMagenta = (x, y) => {
    const o = (y * width + x) * 4;
    return rgba[o + 3] >= 128 && hex(rgba[o], rgba[o + 1], rgba[o + 2]) === MAGENTA;
  };
  let variable = false;
  f.rows.forEach((row, r) => [...row].forEach((ch, i) => {
    for (let y = 0; y < f.cellH; y++) for (let x = 0; x < f.cellW; x++) if (isMagenta(f.x + i * f.cellW + x, f.y + r * step + y)) variable = true;
  }));
  const glyphs = [];
  const chars = new Map();
  f.rows.forEach((row, r) => {
    [...row].forEach((ch, i) => {
      if (ch === ' ') return;  // a blank cell on the sheet
      const x0 = f.x + i * f.cellW, y0 = f.y + r * step;
      const px = [];
      let left = f.cellW, right = -1;
      for (let y = 0; y < f.cellH; y++) {
        const line = [];
        for (let x = 0; x < f.cellW; x++) {
          const o = ((y0 + y) * width + x0 + x) * 4;
          let v = 0;
          if (isMagenta(x0 + x, y0 + y)) v = 0;  // (not the letter: its width, below)
          else if (f.faint && rgba[o + 3] > 0 && rgba[o + 3] < 128) v = f.faint;
          else if (rgba[o + 3] >= 128) {
            const k = hex(rgba[o], rgba[o + 1], rgba[o + 2]);
            v = f.colors[k];
            if (v == null) throw new Error(`fonts: ${f.name} '${ch}' has a color #${k} not in its colors (${Object.keys(f.colors).join(', ')})`);
          }
          if (v) { left = Math.min(left, x); right = Math.max(right, x); }
          line.push(v);
        }
        px.push(line);
      }
      if (variable) {
        // The artist's width: up to the first column with magenta in it.
        let cols = f.cellW;
        for (let x = 0; x < f.cellW && cols === f.cellW; x++)
          for (let y = 0; y < f.cellH; y++) if (isMagenta(x0 + x, y0 + y)) { cols = x; break; }
        left = 0;
        right = cols - 1;
      }
      if (right < 0) throw new Error(`fonts: ${f.name} '${ch}' is empty (row ${r}, cell ${i})`);
      const w = right - left + 1;
      if (w > 8) throw new Error(`fonts: ${f.name} '${ch}' is ${w} px wide (at most 8)`);
      const rows = px.map((line) => {
        let bits = 0;
        for (let x = 0; x < w; x++) bits |= line[left + x] << (14 - 2 * x);
        return bits;
      });
      chars.set(ch, glyphs.length);
      glyphs.push({ ch, w, rows });
    });
  });
  if (f.lowercaseAsUpper) {
    for (let c = 97; c <= 122; c++) {
      const up = String.fromCharCode(c - 32);
      if (!chars.has(String.fromCharCode(c)) && chars.has(up)) chars.set(String.fromCharCode(c), chars.get(up));
    }
  }
  return { chars, glyphs, gap: variable ? 0 : f.gap, variable };
}

/** Write build/gen/fonts_data.h when the sheet (or this tool) is newer. */
export function buildFonts({ quiet = false } = {}) {
  fs.mkdirSync(GEN_DIR, { recursive: true });
  const out = path.join(GEN_DIR, 'fonts_data.h');
  const newest = Math.max(fs.statSync(SHEET).mtimeMs, fs.statSync(fileURLToPath(import.meta.url)).mtimeMs);
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs > newest) return;
  const img = decodePng(fs.readFileSync(SHEET));
  const lines = [
    '// Generated by tools/fonts.mjs from artwork/fonts/font-sheet.png. Do not edit.',
    '// Included only by src/text.c, so the tables live in its ROM bank.',
    '#ifndef GEN_FONTS_DATA_H', '#define GEN_FONTS_DATA_H', '#include <stdint.h>',
    `#define FONT_COUNT ${FONTS.length}`,
  ];
  const table = (name, vals, per = 16) => {
    const out = [];
    for (let i = 0; i < vals.length; i += per) out.push('    ' + vals.slice(i, i + per).join(', ') + ',');
    return [`static const uint8_t ${name}[] = {`, ...out, '};'];
  };
  for (const f of FONTS) {
    const { chars, glyphs, gap } = sliceFont(img, f);
    const map = [];
    for (let c = 32; c < 128; c++) map.push(chars.has(String.fromCharCode(c)) ? chars.get(String.fromCharCode(c)) : 255);
    const data = [];
    for (const g of glyphs) for (const r of g.rows) data.push(r >> 8, r & 255);
    const N = f.name.toUpperCase();
    lines.push(
      `// ${f.name}: ${glyphs.length} glyphs, ${f.cellH} rows each`,
      `#define FONT_${N}_H ${f.cellH}`, `#define FONT_${N}_GAP ${gap}`, `#define FONT_${N}_SPACE ${f.space}`,
      ...table(`font_${f.name}_map`, map), // ASCII 32..127 -> glyph, 255 = none (drawn as a space)
      ...table(`font_${f.name}_w`, glyphs.map((g) => g.w)),
      ...table(`font_${f.name}_rows`, data),
    );
  }
  lines.push('#endif', '');
  fs.writeFileSync(out, lines.join('\n'));
  if (!quiet) console.log(`[fonts] artwork/fonts/font-sheet.png -> build/gen/fonts_data.h (${FONTS.map((f) => f.name).join(', ')})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildFonts();
