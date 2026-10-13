// SPDX-License-Identifier: GPL-3.0-or-later
// Diagnostic: can Nadir start on this machine at all? Spawns Electron with logging and a debug port (no Playwright),
// waits up to 60 s for the shell page, prints what it found, and exits non-zero if it never appeared.
// Used by CI to tell "the app does not start" apart from "the test harness cannot attach".
const { spawn } = require('node:child_process');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nadir-probe-'));
  const extra = process.argv.slice(2);
  const child = spawn(require('electron'), [path.resolve(__dirname, '..'), '--remote-debugging-port=9601', ...extra], {
    env: { ...process.env, NADIR_USER_DATA: userData, NADIR_OFFLINE: '1', ELECTRON_ENABLE_LOGGING: '1' }, stdio: ['ignore', 'inherit', 'inherit'],
  });
  let exited = null; child.on('exit', (c, s) => { exited = `code ${c} signal ${s}`; });
  let targets = [];
  for (let i = 0; i < 120 && !exited; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9601/json')).json(); if (targets.some((t) => t.url === 'nadir://shell/')) break; } catch { /* not up yet */ }
    await sleep(500);
  }
  console.log('platform:', process.platform, process.arch, '| exited:', exited);
  console.log('targets:', JSON.stringify(targets.map((t) => ({ type: t.type, url: t.url })), null, 1));
  const ok = targets.some((t) => t.url === 'nadir://shell/');
  child.kill();
  process.exit(ok ? 0 : 1);
})();
