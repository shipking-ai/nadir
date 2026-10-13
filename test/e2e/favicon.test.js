// SPDX-License-Identifier: GPL-3.0-or-later
// Favicons are fetched by the main process through the tab's own session and shown as data: images. The browser UI
// itself never requests a site's icon (its CSP forbids http/https images), so a site cannot observe the chrome.
const test = require('node:test');
const assert = require('node:assert/strict');
const { launch, startServer, until } = require('./helpers');

let b; let srv;
test.before(async () => { srv = await startServer(); b = await launch(); });
test.after(async () => { await b?.close(); await srv?.close(); });

test('tab favicon arrives as a small data: URL fetched via the tab session', async () => {
  await b.navigate(`${srv.origin}/fav`);
  await until(async () => (await b.active()).favicon?.startsWith('data:image/png;base64,'), { what: 'data: favicon', timeout: 15000 });
  assert.ok(srv.hits.some((h) => h === '/icon.png'), 'the icon was requested (by the main process)');
  const src = await b.shell.evaluate(() => document.querySelector('.tab[aria-selected="true"] .fav img')?.getAttribute('src'));
  assert.match(src || '', /^data:image\/png;base64,/, 'the chrome displays the data: URL, not the site URL');
});

test('the browser UI cannot load http(s) images on its own', async () => {
  const before = srv.hits.length;
  const blocked = await b.shell.evaluate((u) => new Promise((resolve) => { const i = new Image(); i.onload = () => resolve(false); i.onerror = () => resolve(true); i.src = u; }), `${srv.origin}/icon.png?from-chrome`);
  assert.equal(blocked, true, 'image load from the shell page is blocked by CSP');
  await new Promise((r) => setTimeout(r, 500));
  assert.ok(!srv.hits.slice(before).some((h) => h.includes('from-chrome')), 'the request never reached the server');
});
