// SPDX-License-Identifier: GPL-3.0-or-later
// Launches the PACKAGED app (out/Nadir-win32-x64/Nadir.exe) as a normal user would — no NADIR_TEST hook —
// and checks it starts, shows its UI, browses a local page, and has hardening applied.
const { _electron: electron } = require('playwright-core');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');

(async () => {
  const exe = path.resolve(__dirname, '..', 'out', 'Nadir-win32-x64', 'Nadir.exe');
  assert.ok(fs.existsSync(exe), `missing ${exe}; run npm run package`);
  const srv = http.createServer((_q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end('<title>Packaged OK</title><body>hi'); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nadir-pkg-'));
  const t0 = Date.now();
  const app = await electron.launch({ executablePath: exe, env: { ...process.env, NADIR_USER_DATA: userData, NADIR_OFFLINE: '1', NADIR_HEADLESS: '1' }, colorScheme: null });
  const shell = await (async () => { for (let i = 0; i < 150; i++) { const p = app.windows().find((w) => w.url() === 'nadir://shell/'); if (p) return p; await new Promise((r) => setTimeout(r, 100)); } throw new Error('no shell window'); })();
  await shell.waitForSelector('.tab');
  console.log('shell + first tab after', Date.now() - t0, 'ms (includes Playwright attach)');
  const r = await shell.evaluate((u) => window.nadir.invoke('tab:navigate', { input: u }), `http://127.0.0.1:${srv.address().port}/`);
  assert.equal(r.ok, true);
  for (let i = 0; i < 100; i++) { const s = await shell.evaluate(() => window.nadir.invoke('state:get')); if (s.tabs.find((t) => t.id === s.activeId).title === 'Packaged OK') break; if (i === 99) throw new Error('page did not load'); await new Promise((r) => setTimeout(r, 100)); }
  const info = await app.evaluate(({ app: a }) => ({ name: a.getName(), version: a.getVersion(), packaged: a.isPackaged, hook: typeof global.__nadir, sandboxed: process.sandboxed, chrome: process.versions.chrome, electron: process.versions.electron }));
  console.log('app info', JSON.stringify(info));
  assert.equal(info.packaged, true);
  assert.equal(info.hook, 'undefined', 'test hook must not exist in a normal run');
  assert.equal(info.name, 'Nadir');
  assert.ok(fs.existsSync(path.join(userData, 'nadir.db')), 'database created in the profile');
  await app.close(); srv.close();
  console.log('PACKAGED APP OK');
})().catch((e) => { console.error('PACKAGE VERIFY FAILED:', e.message); process.exit(1); });
