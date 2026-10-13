// SPDX-License-Identifier: GPL-3.0-or-later
// The "Check for updates" button: user-initiated, reads a release list, never downloads or installs anything.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { launch } = require('./helpers');

let b; let srv; let hits = 0; let body = [];
test.before(async () => {
  srv = http.createServer((q, r) => { hits++; r.writeHead(200, { 'content-type': 'application/json' }); r.end(JSON.stringify(body)); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  b = await launch({ env: { NADIR_UPDATE_URL: `http://127.0.0.1:${srv.address().port}/releases` } });
});
test.after(async () => { await b?.close(); srv?.close(); });

const about = async () => { await b.navigate('nadir://app/#/about'); const p = await b.page('nadir://app'); await p.waitForSelector('#update-check'); return p; };

test('no request is made until the button is pressed', async () => {
  await about();
  await new Promise((r) => setTimeout(r, 1500));
  assert.equal(hits, 0, 'opening About must not contact the network');
});

test('reports a newer release and links to its page', async () => {
  body = [{ tag_name: 'v9.0.0', draft: false, prerelease: true, html_url: 'https://github.com/shipking-ai/nadir/releases/tag/v9.0.0' }];
  const p = await about();
  await p.click('#update-check');
  await p.waitForFunction(() => /9\.0\.0 \(pre-release\) is available/.test(document.getElementById('update-status').textContent));
  assert.equal(hits, 1);
  assert.match(await p.locator('#update-status a').getAttribute('title'), /releases\/tag\/v9\.0\.0$/);
});

test('says so when already up to date and when the list cannot be read', async () => {
  body = [{ tag_name: 'v0.0.1', draft: false, prerelease: true, html_url: 'https://github.com/shipking-ai/nadir/releases/tag/v0.0.1' }];
  let p = await about();
  await p.click('#update-check');
  await p.waitForFunction(() => /up to date/.test(document.getElementById('update-status').textContent));
  body = { message: 'rate limited' };
  p = await about();
  await p.click('#update-check');
  await p.waitForFunction(() => /Could not check/.test(document.getElementById('update-status').textContent));
});
