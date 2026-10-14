// SPDX-License-Identifier: GPL-3.0-or-later
// The app must exit promptly when asked to quit, including after accessibility mode has been switched on (which is
// what a screen reader does). On macOS CI the app once failed to exit after the accessibility scan; these two tests
// separate "quit is slow in general" from "quit is slow after accessibility mode was used".
const test = require('node:test');
const assert = require('node:assert/strict');
const { launch } = require('./helpers');

async function timedQuit(b) {
  const proc = b.app.process();
  const t0 = Date.now();
  let timer;
  const result = await Promise.race([
    b.app.close().then(() => 'closed'),
    new Promise((r) => { timer = setTimeout(() => r('timeout'), 15000); }),
  ]);
  clearTimeout(timer);
  const ms = Date.now() - t0;
  if (result === 'timeout') await b.close(); // bounded kill so the run can continue
  console.log(`[quit] ${result} in ${ms} ms (exitCode ${proc.exitCode})`);
  return { result, ms };
}

// Slow quits are intermittent and not yet understood (docs/DECISIONS.md bug 14): 2 of 8 runs of this file were slow on a
// developer Windows PC, 0 of 20 in a standalone loop, and the Windows CI runner saw one. Both tests therefore run as `todo`:
// they execute and print their timing, but a slow run does not fail the build. Turn `todo` off once the cause is known.
const TODO = 'known intermittent: slow quit (DECISIONS.md bug 14)';

test('quit is prompt on a fresh app', { todo: TODO }, async () => {
  const b = await launch();
  const r = await timedQuit(b);
  assert.equal(r.result, 'closed', `quit took more than 15 s (${r.ms} ms)`);
});

test('quit is prompt after accessibility mode was switched on and off', { todo: TODO }, async () => {
  const b = await launch();
  const cdp = await b.shell.context().newCDPSession(b.shell);
  await cdp.send('Accessibility.enable');
  await cdp.send('Accessibility.getFullAXTree');
  await cdp.send('Accessibility.disable');
  await cdp.detach();
  const r = await timedQuit(b);
  assert.equal(r.result, 'closed', `quit took more than 15 s after accessibility use (${r.ms} ms)`);
});
