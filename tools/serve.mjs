#!/usr/bin/env node
// Local playtest server: rebuilds the ROM when src/ changes and live-reloads
// the playtest page. Recordings and bug reports from the page are saved to
// replays/ so tests (and Claude) can replay them headlessly.
//
//   node tools/serve.mjs [--port 8080] [--no-build] [--open]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const PORT = +(argv[argv.indexOf('--port') + 1] || 0) || 8080;
const AUTO_BUILD = !argv.includes('--no-build');
const REPLAYS = path.join(ROOT, 'replays');
const ROM = path.join(ROOT, 'build', 'dangernoodle.gb');
const SERVED = ['web', 'harness', 'build'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.gb': 'application/octet-stream', '.noi': 'text/plain', '.sym': 'text/plain',
};

// ---- live reload --------------------------------------------------------------
const clients = new Set();
function broadcast(ev) {
  const msg = `data: ${JSON.stringify(ev)}\n\n`;
  for (const res of clients) res.write(msg);
}

let lastBuild = { type: 'build', ok: fs.existsSync(ROM), ms: 0, log: '', crc32: null };
function romCrc() {
  try {
    // Lazy import keeps the server usable even if harness files move.
    const data = fs.readFileSync(ROM);
    let c = 0xffffffff;
    for (const b of data) { c ^= b; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }
    return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
  } catch { return null; }
}
lastBuild.crc32 = romCrc();

function runBuild() {
  broadcast({ type: 'building' });
  // Capture build output by temporarily wrapping stdout.
  let log = '';
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, ...rest) => { log += chunk; return write(chunk, ...rest); };
  let r;
  try { r = build({ quiet: true }); } catch (e) { r = { ok: false, error: e.message }; log += e.message; }
  finally { process.stdout.write = write; }
  if (!r.ok && r.error && !log.includes(r.error)) log += r.error;
  lastBuild = { type: 'build', ok: r.ok, ms: r.ms || 0, log: log.trim(), crc32: r.ok ? romCrc() : null };
  broadcast(lastBuild);
  if (!r.ok) console.log('[serve] build failed');
}

let timer = null;
function scheduleBuild() {
  clearTimeout(timer);
  timer = setTimeout(runBuild, 150);
}
if (AUTO_BUILD) {
  runBuild();
  fs.watch(path.join(ROOT, 'src'), { recursive: true }, (_e, f) => {
    if (f && /\.(c|h|s|inc)$/i.test(f)) scheduleBuild();
  });
  // Artwork and the asset/font tools feed the ROM too.
  fs.watch(path.join(ROOT, 'artwork'), { recursive: true }, (_e, f) => {
    if (f && f.endsWith('.png')) scheduleBuild();
  });
} else {
  // Someone else builds (e.g. an IDE task): just watch the ROM.
  fs.watchFile(ROM, { interval: 300 }, () => {
    lastBuild = { type: 'build', ok: true, ms: 0, log: '', crc32: romCrc() };
    broadcast(lastBuild);
  });
}

// ---- replays API ----------------------------------------------------------------
function listReplays() {
  const out = [];
  for (const kind of ['bugs', 'recordings']) {
    const dir = path.join(REPLAYS, kind);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      const st = fs.statSync(path.join(dir, f));
      out.push({ id: `${kind}/${f}`, name: `${kind === 'bugs' ? 'bug' : 'rec'} · ${f.replace(/\.json$/, '')}`, mtime: st.mtimeMs });
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

function saveReplay({ kind, replay }) {
  const sub = kind === 'bug' ? 'bugs' : 'recordings';
  const dir = path.join(REPLAYS, sub);
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = (replay.note || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const file = `${stamp}${slug ? '_' + slug : ''}.json`;
  // Screenshots are stored next to the JSON as a PNG to keep the JSON readable.
  if (replay.screenshot?.startsWith('data:image/png;base64,')) {
    const png = file.replace(/\.json$/, '.png');
    fs.writeFileSync(path.join(dir, png), Buffer.from(replay.screenshot.split(',')[1], 'base64'));
    replay = { ...replay, screenshot: png };
  }
  fs.writeFileSync(path.join(dir, file), JSON.stringify(replay, null, 1));
  console.log(`[serve] saved replays/${sub}/${file}`);
  return `${sub}/${file}`;
}

// ---- HTTP -------------------------------------------------------------------------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 20e6) reject(new Error('too large')); });
    req.on('end', () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === '/') { res.writeHead(302, { location: '/web/' }); return res.end(); }
    if (p === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
      res.write(`data: ${JSON.stringify(lastBuild)}\n\n`);
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    if (p === '/api/replays' && req.method === 'GET') return json(res, listReplays());
    if (p === '/api/replays' && req.method === 'POST') return json(res, { id: saveReplay(JSON.parse(await readBody(req))) });
    if (p.startsWith('/api/replays/')) {
      const id = p.slice('/api/replays/'.length);
      const file = path.resolve(REPLAYS, id);
      if (!file.startsWith(REPLAYS) || !fs.existsSync(file)) return notFound(res);
      return json(res, JSON.parse(fs.readFileSync(file, 'utf8')));
    }
    // static files (only from whitelisted folders)
    let rel = p.replace(/^\/+/, '');
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(ROOT, rel);
    const top = path.relative(ROOT, file).split(path.sep)[0];
    if (!SERVED.includes(top) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return notFound(res);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(e.message || e));
  }
});
const json = (res, v) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)); };
const notFound = (res, msg = 'not found') => { res.writeHead(404, { 'content-type': 'text/plain' }); res.end(msg); };

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`[serve] playtest page: ${url}`);
  console.log('[serve] editing files in src/ rebuilds and reloads automatically. Ctrl+C to stop.');
  if (argv.includes('--open')) {
    const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
  }
});
