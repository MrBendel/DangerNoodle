#!/usr/bin/env node
// Bundles the playtest page, emulator core and current ROM into one
// self-contained HTML file (build/playtest.html) for the hosted playtest
// artifact. Bug reports and recordings made there go to the artifact's
// database instead of the local replays/ folder.
//
//   node tools/bundle.mjs            -> build/playtest.html (artifact body form)
//   node tools/bundle.mjs --standalone  full HTML document you can open from disk
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const standalone = process.argv.includes('--standalone');

const romPath = path.join(ROOT, 'build', `${CONFIG.name}.gb`);
if (!fs.existsSync(romPath)) {
  console.error(`[bundle] build/${CONFIG.name}.gb missing: run node tools/build.mjs first`);
  process.exit(1);
}
const rom = fs.readFileSync(romPath);
const noi = romPath.replace(/\.gb$/, '.noi');
const sym = fs.existsSync(noi) ? fs.readFileSync(noi, 'utf8') : '';
// Keep only RAM variables from the symbol file, plus _vsync, which the emulator
// wrapper uses to end each frame after the game's update (see Emu._finishGameFrame).
const symSmall = sym
  .split(/\r?\n/)
  .filter((l) => /^DEF _[A-Za-z]\w* 0x(C|D|FF)[0-9A-F]{2,3}\b/i.test(l) || /^DEF _vsync 0x/.test(l))
  .join('\n');
const wasm = fs.readFileSync(path.join(ROOT, 'harness', 'vendor', 'boytacean', 'boytacean_bg.wasm'));

// Turn an ES module into a function body returning its exports.
function moduleToIife(src, name) {
  const names = [];
  let out = src.replace(/^export\s+(async\s+function|function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (_m, kw, id) => {
    names.push(id);
    return `${kw} ${id}`;
  });
  out = out.replace(/^export\s*\{([^}]*)\};?\s*$/gm, (_m, list) => {
    for (const part of list.split(',')) {
      const [local, alias] = part.trim().split(/\s+as\s+/);
      if (local) names.push(alias ? `${alias}: ${local}` : local);
    }
    return '';
  });
  out = out.replace(/new URL\('boytacean_bg\.wasm', import\.meta\.url\)/g, 'null');
  return `const ${name} = (() => {\n${out}\nreturn { ${names.join(', ')} };\n})();\n`;
}

const boy = moduleToIife(read('harness/vendor/boytacean/boytacean.js'), '__boy');
const emu = moduleToIife(read('harness/emu.mjs'), '__emu');
let app = read('web/app.js');
app = app.replace(/^import initCore, \* as B from [^;]+;/m, 'const B = __boy; const initCore = __boy.default;');
app = app.replace(/^import \{([\s\S]*?)\} from '\.\.\/harness\/emu\.mjs';/m, (_m, list) => `const {${list}} = __emu;`);
if (/^import /m.test(app)) throw new Error('bundle: unhandled import in web/app.js');

const backend = `
// Hosted playtest backend: ROM is embedded; reports go to the artifact db (or localStorage on GitHub Pages).
const __b64 = (s) => { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
window.RGB_WASM = __b64(${JSON.stringify(wasm.toString('base64'))});
const __ROM = ${JSON.stringify(rom.toString('base64'))};
const __SYM = ${JSON.stringify(symSmall)};
const __BUILT = ${JSON.stringify(new Date().toISOString())};
const __claude = window.claude;
const __db = __claude?.use ? __claude.use('db') : Promise.resolve(null);
const __dl = __claude?.use ? __claude.use('downloads') : Promise.resolve(null);
const __lsGet = () => { try { return JSON.parse(localStorage.getItem('dn.replays') || '[]'); } catch { return []; } };
const __lsSet = (arr) => { try { localStorage.setItem('dn.replays', JSON.stringify(arr.slice(0, 40))); } catch {} };
window.RGB_BACKEND = {
  name: 'hosted',
  async loadRom() { return { rom: __b64(__ROM), sym: __SYM, label: 'hosted build ' + __BUILT.slice(0, 16).replace('T', ' ') }; },
  async listReplays() {
    const db = await __db;
    if (!db) return __lsGet().map((v) => ({ id: v.id, name: (v.kind === 'bug' ? 'bug' : 'rec') + ' · ' + v.length + 'f · ' + (v.note || v.created.slice(0, 16)) }));
    const snap = await db.collection('reports').orderBy('created', 'desc').limit(40).get();
    return snap.docs.map((d) => { const v = d.data(); return { id: d.id, name: (v.kind === 'bug' ? 'bug' : 'rec') + ' · ' + v.length + 'f · ' + (v.note || v.created.slice(0, 16)) }; });
  },
  async getReplay(id) {
    const db = await __db;
    if (!db) { const found = __lsGet().find((v) => v.id === id); if (!found) throw new Error('replay not found'); return found.replay; }
    const d = await db.doc('reports/' + id).get();
    return JSON.parse(d.data().replay);
  },
  async saveReplay(replay, kind) {
    const db = await __db;
    if (!db) {
      const id = 'local-' + Date.now().toString(36);
      const all = __lsGet();
      all.unshift({ id, kind, note: replay.note || '', created: replay.created, length: replay.length, rom_crc32: replay.rom.crc32, replay });
      __lsSet(all);
      return id;
    }
    const ref = await db.collection('reports').add({
      kind, note: replay.note || '', created: replay.created, length: replay.length,
      rom_crc32: replay.rom.crc32, replay: JSON.stringify(replay),
    });
    return ref.id;
  },
  ...(__claude?.use ? {
    async download(filename, data) {
      const dl = await __dl;
      if (!dl) throw new Error('downloads unavailable here');
      await dl.save({ filename, data });
    },
  } : {}),
};
`;

const css = read('web/style.css');
let body = read('web/index.html');
body = body.slice(body.indexOf('<body>') + 6, body.indexOf('</body>'));
body = body.replace(/<script type="module" src="app.js"><\/script>/, '');
body = body.replace('<span>playtest</span>', `<span>playtest · hosted</span>`);

const script = `<script type="module">\n${backend}\n${boy}\n${emu}\n${app}\n</script>`;
const page = `<style>\n${css}\n</style>\n${body}\n${script}\n`;
const pwaHead = [
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<meta name="theme-color" content="#161816">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Danger Noodle">',
  '<title>Danger Noodle Playtest</title>',
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">',
  '<link rel="apple-touch-icon" href="icon-192.png">',
].join('');
const html = standalone
  ? `<!doctype html><html lang="en"><head>${pwaHead}</head><body>${page}</body></html>`
  : `<title>Danger Noodle Playtest</title>\n${page}`;
const out = path.join(ROOT, 'build', standalone ? 'playtest-standalone.html' : 'playtest.html');
fs.writeFileSync(out, html);

if (standalone) {
  const { encodePng } = await import('../harness/node.mjs');
  const pal = {
    0: [0x16, 0x18, 0x16],
    S: [0xd8, 0xd8, 0xd0],
    D: [0x98, 0x98, 0x90],
    B: [0x4a, 0x4e, 0x58],
    L: [0x9b, 0xbc, 0x0f],
    P: [0x0f, 0x38, 0x0f],
    K: [0x22, 0x26, 0x22],
    A: [0xa8, 0x20, 0x40],
  };
  const grid = [
    '0000000000000000',
    '00SSSSSSSSSSSS00',
    '0SSSSSSSSSSSSSS0',
    '0SSBBBBBBBBBBSS0',
    '0SSBLLLLLLLLBSS0',
    '0SSBLLPLLPLLBSS0',
    '0SSBLLPPPPLLBSS0',
    '0SSBLLLLLLLLBSS0',
    '0SSBBBBBBBBBBSS0',
    '0SSSSSSSSSSSSSS0',
    '0SS0K0SSSS00ASS0',
    '0SSKKKSSSSA0SSS0',
    '0SS0K0SSSSSSSSS0',
    '0SSSSSSDDSSSSDS0',
    '00DDDDDDDDDDDD00',
    '0000000000000000',
  ];
  const rgb = new Uint8Array(16 * 16 * 3);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const [r, g, b] = pal[grid[y][x]];
      const i = (y * 16 + x) * 3;
      rgb[i] = r; rgb[i + 1] = g; rgb[i + 2] = b;
    }
  }
  fs.writeFileSync(path.join(ROOT, 'build', 'icon-192.png'), encodePng(rgb, { width: 16, height: 16, scale: 12 }));
  fs.writeFileSync(path.join(ROOT, 'build', 'icon-512.png'), encodePng(rgb, { width: 16, height: 16, scale: 32 }));
}

console.log(`[bundle] ${path.relative(ROOT, out)} (${(html.length / 1024).toFixed(0)} KB, ROM ${rom.length} bytes, crc ${(await import('../harness/emu.mjs')).crc32(new Uint8Array(rom))})`);
