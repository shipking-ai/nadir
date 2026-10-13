// SPDX-License-Identifier: GPL-3.0-or-later
// Certificate-error handling against badssl.com (Apache-2.0 test site run by the Chromium project).
// This is the ONLY e2e file that needs the public internet; every test skips cleanly when it is unreachable.
const test = require('node:test');
const assert = require('node:assert/strict');
const { launch, until } = require('./helpers');

let b; let online = false;
test.before(async () => {
  try { online = (await fetch('https://badssl.com/', { signal: AbortSignal.timeout(8000) })).ok; } catch { online = false; }
  if (online) b = await launch();
});
test.after(async () => { await b?.close(); });

for (const host of ['expired', 'self-signed', 'wrong.host', 'untrusted-root']) {
  test(`${host}.badssl.com shows a plain error page with no way to proceed`, async (t) => {
    if (!online) return t.skip('badssl.com unreachable');
    const url = `https://${host}.badssl.com/`;
    await b.navigate(url);
    // The previous test left an error page in the tab, so wait for THIS host's page, not just the title.
    const pageHtml = () => b.ctl('c.tabs.active().host.wc.getURL()').then((u) => decodeURIComponent(String(u).split(',').slice(1).join(',')));
    await until(async () => { const h = await pageHtml(); return h.includes(host) && /isn.t private/.test(h); }, { what: `${host} error page`, timeout: 30000 });
    assert.equal((await b.active()).url, url, 'the typed URL is kept');
    const html = await pageHtml();
    assert.doesNotMatch(html, /proceed|continue anyway|advanced|accept the risk/i, 'no bypass control');
    assert.doesNotMatch(html, /<script/i, 'error page has no script');
  });
}

test('a valid certificate loads normally', async (t) => {
  if (!online) return t.skip('badssl.com unreachable');
  await b.navigate('https://badssl.com/');
  await until(async () => (await b.active()).title === 'badssl.com', { what: 'badssl.com', timeout: 30000 });
});
