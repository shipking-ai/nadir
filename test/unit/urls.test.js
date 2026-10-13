// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const u = require('../../src/shared/urls');
const T = 'https://search.example/?q=%s';

test('empty input', () => assert.equal(u.resolveInput('   ', T).kind, 'empty'));
test('plain words search', () => {
  const r = u.resolveInput('best coffee beans', T);
  assert.deepEqual([r.kind, r.url], ['search', 'https://search.example/?q=best%20coffee%20beans']);
});
test('single word searches', () => assert.equal(u.resolveInput('wikipedia', T).kind, 'search'));
test('domain gets https', () => assert.equal(u.resolveInput('example.com/a?b=1', T).url, 'https://example.com/a?b=1'));
test('localhost and ip get http', () => {
  assert.equal(u.resolveInput('localhost:3000', T).url, 'http://localhost:3000');
  assert.equal(u.resolveInput('192.168.1.10:8080/x', T).url, 'http://192.168.1.10:8080/x');
  assert.equal(u.resolveInput('[::1]:8080', T).url, 'http://[::1]:8080');
  assert.equal(u.resolveInput('printer.local', T).url, 'http://printer.local');
});
test('public host:port gets https', () => assert.equal(u.resolveInput('example.com:8443', T).url, 'https://example.com:8443'));
test('explicit scheme preserved', () => assert.equal(u.resolveInput('http://example.com', T).url, 'http://example.com/'));
test('dangerous schemes blocked', () => {
  for (const s of ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'vbscript:x', 'blob:https://a/b', 'view-source:https://a.com', 'JaVaScRiPt:alert(1)'])
    assert.equal(u.resolveInput(s, T).kind, 'blocked', s);
});
test('unknown external schemes blocked, not launched', () => {
  assert.equal(u.resolveInput('mailto:a@b.com', T).kind, 'blocked');
  assert.equal(u.resolveInput('steam://run/1', T).kind, 'blocked');
});
test('about only allows blank', () => {
  assert.equal(u.resolveInput('about:blank', T).kind, 'url');
  assert.equal(u.resolveInput('about:config', T).kind, 'blocked');
});
test('unicode domains', () => assert.equal(u.resolveInput('münchen.de', T).kind, 'url'));
test('text with spaces and scheme-like prefix is a search', () => assert.equal(u.resolveInput('note: buy milk', T).kind, 'search'));
test('query is encoded safely', () => {
  const r = u.resolveInput('a&b=c#d', T);
  assert.equal(r.kind, 'search');
  assert.ok(r.url.endsWith('a%26b%3Dc%23d'));
});
test('isLocalHost', () => {
  for (const h of ['localhost', 'a.localhost', '127.0.0.1', '10.1.2.3', '192.168.0.5', '172.16.0.1', '169.254.1.1', '[::1]'])
    assert.ok(u.isLocalHost(h), h);
  for (const h of ['example.com', '8.8.8.8', '172.32.0.1', '192.169.0.1']) assert.ok(!u.isLocalHost(h), h);
});
test('https upgrade rules', () => {
  assert.ok(u.shouldUpgrade('http://example.com/x'));
  assert.ok(!u.shouldUpgrade('http://localhost:3000'));
  assert.ok(!u.shouldUpgrade('https://example.com'));
  assert.equal(u.upgradeUrl('http://example.com:80/p?q=1'), 'https://example.com/p?q=1');
});
test('stripTracking removes only tracking params', () => {
  assert.equal(u.stripTracking('https://a.com/p?id=3&utm_source=x&fbclid=y'), 'https://a.com/p?id=3');
  assert.equal(u.stripTracking('https://a.com/p?id=3'), 'https://a.com/p?id=3');
  assert.equal(u.stripTracking('nadir://x?utm_a=1'), 'nadir://x?utm_a=1');
});
test('displayHost', () => {
  assert.equal(u.displayHost('https://www.example.com/a'), 'example.com');
  assert.equal(u.displayHost('nadir://history'), 'nadir://history');
});
