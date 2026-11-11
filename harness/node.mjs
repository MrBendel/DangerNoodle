// Node-side helpers for the harness: loads the Boytacean core, ROMs, symbol
// files and writes PNG screenshots. Used by cli.mjs and the tests.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as B from './vendor/boytacean/boytacean.js';
import { Emu, Symbols, SCREEN_W, SCREEN_H } from './emu.mjs';

export * from './emu.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');
export const DEFAULT_ROM = path.join(ROOT, 'build', 'dangernoodle.gb');

let ready = false;
function initCore() {
  if (ready) return;
  B.initSync({ module: fs.readFileSync(path.join(here, 'vendor', 'boytacean', 'boytacean_bg.wasm')) });
  ready = true;
}

/** Load a ROM (and its .noi/.sym symbols if present next to it). */
export function loadRom(romPath = DEFAULT_ROM, { mode = 'auto' } = {}) {
  initCore();
  if (!fs.existsSync(romPath)) {
    throw new Error(`ROM not found: ${romPath}\nRun "node tools/build.mjs" first.`);
  }
  const rom = new Uint8Array(fs.readFileSync(romPath));
  const emu = new Emu(B, rom, { mode });
  const base = romPath.replace(/\.(gb|gbc)$/i, '');
  let symText = '';
  for (const ext of ['.noi', '.sym']) {
    if (fs.existsSync(base + ext)) symText += fs.readFileSync(base + ext, 'utf8') + '\n';
  }
  emu.symbols = new Symbols(symText);
  emu.romPath = romPath;
  return emu;
}

/** Encode a 160x144 RGB frame buffer as PNG (optional integer upscale). */
export function encodePng(rgb, { width = SCREEN_W, height = SCREEN_H, scale = 1 } = {}) {
  const W = width * scale;
  const H = height * scale;
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    const row = y * (W * 3 + 1);
    raw[row] = 0;
    const sy = Math.floor(y / scale);
    for (let x = 0; x < W; x++) {
      const si = (sy * width + Math.floor(x / scale)) * 3;
      const di = row + 1 + x * 3;
      raw[di] = rgb[si];
      raw[di + 1] = rgb[si + 1];
      raw[di + 2] = rgb[si + 2];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(td) : crcFallback(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function crcFallback(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function saveScreenshot(emu, file, scale = 2) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePng(emu.frameBuffer(), { scale }));
  return file;
}
