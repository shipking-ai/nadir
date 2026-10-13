// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// permissions.js and protocol.js only need `electron` for types at call time; stub it for plain-node tests.
const Module = require('node:module');
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return { app: { getPath: () => '.' }, shell: {} };
  return origLoad.call(this, request, ...rest);
};
const { policyFor, permissionKey, originOf, describe } = require('../../src/main/permissions');
const { resolveUiPath, CSP, UI_ROOT } = require('../../src/main/protocol');
Module._load = origLoad;

test('permission policy: default deny', () => {
  for (const p of ['openExternal', 'usb', 'hid', 'serial', 'window-management', 'mediaKeySystem', 'some-future-permission', 'display-capture', 'keyboardLock'])
    assert.equal(policyFor(p), 'deny', p);
});
test('permission policy: prompt only for main frame', () => {
  for (const p of ['media', 'geolocation', 'notifications', 'clipboard-read']) {
    assert.equal(policyFor(p), 'prompt', p);
    assert.equal(policyFor(p, { isMainFrame: false }), 'deny', `${p} in subframe`);
  }
});
test('permission policy: harmless set is allowed', () => {
  assert.equal(policyFor('clipboard-sanitized-write'), 'allow');
  assert.equal(policyFor('fullscreen'), 'allow');
});
test('permission keys separate camera from microphone', () => {
  assert.equal(permissionKey('media', { mediaTypes: ['video', 'audio'] }), 'media:audio+video');
  assert.equal(permissionKey('media', { mediaTypes: ['audio'] }), 'media:audio');
  assert.equal(permissionKey('geolocation', {}), 'geolocation');
  assert.match(describe('media:audio'), /microphone/);
});
test('originOf', () => {
  assert.equal(originOf('https://a.com:8443/x?y'), 'https://a.com:8443');
  assert.equal(originOf('not a url'), null);
});

test('nadir:// resolves only known hosts and stays inside src/ui', () => {
  const ok = resolveUiPath('nadir://assets/js/x.js');
  assert.equal(ok, path.join(UI_ROOT, 'assets', 'js', 'x.js'));
  assert.equal(resolveUiPath('nadir://shell/'), path.join(UI_ROOT, 'shell', 'index.html'));
  assert.equal(resolveUiPath('nadir://evil/index.html'), null);
  assert.equal(resolveUiPath('https://assets/x.js'), null);
});
test('nadir:// blocks traversal in every encoding we can think of', () => {
  for (const u of [
    'nadir://assets/../shell/index.html', 'nadir://assets/%2e%2e/shell/index.html', 'nadir://assets/..%2fshell/index.html',
    'nadir://assets/%2e%2e%2f%2e%2e%2f%2e%2e%2fpackage.json', 'nadir://assets/..%5cshell%5cindex.html', 'nadir://assets/a%00.js',
  ]) {
    const r = resolveUiPath(u);
    assert.ok(r === null || r.startsWith(path.join(UI_ROOT, 'assets') + path.sep), `${u} -> ${r}`);
  }
});
test('CSP forbids inline script, remote script and network from UI code', () => {
  assert.ok(!/unsafe-inline|unsafe-eval/.test(CSP));
  assert.match(CSP, /script-src nadir:\/\/assets(;|$)/);
  assert.match(CSP, /connect-src 'none'/);
  assert.match(CSP, /default-src 'none'/);
});
