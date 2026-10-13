// SPDX-License-Identifier: GPL-3.0-or-later
// Background tabs must really be hidden and throttled (no animation frames, visibilityState "hidden").
// Uses the un-attached launcher on purpose: Playwright attaches to every tab renderer and makes background tabs
// look visible (found 2026-10-12, see docs/PERFORMANCE.md), so it cannot be used for this check.
// Pages report their own requestAnimationFrame count to a local server; the test never touches a tab renderer.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { until, sleep } = require('./helpers');
const { launchPlain } = require('./plain');

test('background tabs are hidden and render no frames; the foreground tab renders at frame rate', async () => {
  const log = {};
  const srv = http.createServer((q, r) => {
    const u = new URL(q.url, 'http://x');
    if (u.pathname === '/rep') { (log[u.searchParams.get('id')] ??= []).push({ raf: Number(u.searchParams.get('raf')), vis: u.searchParams.get('vis') }); r.writeHead(204); return r.end(); }
    const id = u.pathname.slice(1);
    r.writeHead(200, { 'content-type': 'text/html' });
    r.end(`<!doctype html><title>${id}</title><script>let n=0,last=0;(function f(){n++;requestAnimationFrame(f)})();setInterval(()=>{navigator.sendBeacon('/rep?id=${id}&raf='+(n-last)+'&vis='+document.visibilityState);last=n},1000)</script>`);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const b = await launchPlain({ userData: fs.mkdtempSync(path.join(os.tmpdir(), 'nadir-bg-')), port: 9557 });
  try {
    await until(async () => (await b.active())?.url === 'nadir://newtab/', { what: 'first tab' });
    await b.invoke('tab:new', { url: `http://127.0.0.1:${port}/A` });
    await until(async () => (log.A || []).length >= 1, { timeout: 15000, what: 'A reporting' });
    await b.invoke('tab:new', { url: `http://127.0.0.1:${port}/B` }); // B becomes the foreground tab, A goes to the background
    await until(async () => (log.B || []).length >= 1, { timeout: 15000, what: 'B reporting' });
    await sleep(5500);
    const settled = (k, skip) => (log[k] || []).slice(skip);
    const bg = settled('A', 3); const fg = settled('B', 2);
    assert.ok(bg.length >= 3 && fg.length >= 3, `enough samples (bg ${bg.length}, fg ${fg.length})`);
    assert.deepEqual([...new Set(bg.map((x) => x.vis))], ['hidden'], 'background tab reports hidden');
    assert.ok(bg.every((x) => x.raf === 0), `background tab ran no animation frames: ${JSON.stringify(bg.map((x) => x.raf))}`);
    assert.deepEqual([...new Set(fg.map((x) => x.vis))], ['visible'], 'foreground tab reports visible');
    assert.ok(fg.every((x) => x.raf >= 20), `foreground tab renders frames: ${JSON.stringify(fg.map((x) => x.raf))}`);
  } finally {
    await b.close();
    srv.close();
  }
});
