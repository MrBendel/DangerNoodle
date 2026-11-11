#!/usr/bin/env node
// Build the ROM, then run the headless test suite.
//
//   node tools/test.mjs              build + run all tests
//   node tools/test.mjs --update     accept current screens as new goldens
//   node tools/test.mjs shooting     only tests whose name matches "shooting"
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const update = args.includes('--update');
const filter = args.find((a) => !a.startsWith('--'));

const b = build({ quiet: true });
if (!b.ok) {
  console.error('[test] build failed, not running tests');
  process.exit(1);
}
// At most 4 test files at once (TEST_JOBS to change it): each runs its own emulators,
// and one per CPU core (node's default) ran this PC out of memory.
const jobs = Math.max(1, parseInt(process.env.TEST_JOBS || '4', 10) || 4);
const nodeArgs = ['--test', '--test-reporter=spec', `--test-concurrency=${jobs}`];
if (filter) nodeArgs.push('--test-name-pattern', filter);
nodeArgs.push('tests/**/*.test.mjs');
// A crashed ROM can hang the emulator inside a test, so the whole run has a limit.
const TIMEOUT_MS = 10 * 60 * 1000;
const r = spawnSync(process.execPath, nodeArgs, {
  cwd: ROOT,
  stdio: 'inherit',
  timeout: TIMEOUT_MS,
  env: { ...process.env, ...(update ? { UPDATE_GOLDENS: '1' } : {}) },
});
if (r.error?.code === 'ETIMEDOUT') console.error(`[test] stopped after ${TIMEOUT_MS / 60000} minutes: probably a hang (a crashed ROM?)`);
if (update && r.status === 0) console.log('[test] goldens updated (tests/goldens.json)');
process.exit(r.status ?? 1);
