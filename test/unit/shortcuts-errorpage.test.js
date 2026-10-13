// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const { commandForInput, COMMANDS } = require('../../src/shared/shortcuts');
const { errorPageHtml, esc } = require('../../src/main/error-page');

const key = (k, o = {}) => ({ type: 'keyDown', key: k, control: false, meta: false, shift: false, alt: false, ...o });

test('core shortcuts', () => {
  assert.equal(commandForInput(key('t', { control: true })), 'new-tab');
  assert.equal(commandForInput(key('T', { control: true, shift: true })), 'reopen-tab');
  assert.equal(commandForInput(key('k', { control: true })), 'command-palette');
  assert.equal(commandForInput(key('ArrowLeft', { alt: true })), 'back');
  assert.equal(commandForInput(key('F5')), 'reload');
  assert.equal(commandForInput(key('F5', { shift: true })), 'reload-hard');
  assert.equal(commandForInput(key('3', { control: true })), 'tab-3');
  assert.equal(commandForInput(key('9', { control: true })), 'tab-last');
  assert.equal(commandForInput(key('Tab', { control: true, shift: true })), 'prev-tab');
});
test('plain typing and key-up never trigger commands', () => {
  assert.equal(commandForInput(key('t')), null);
  assert.equal(commandForInput({ ...key('t', { control: true }), type: 'keyUp' }), null);
  assert.equal(commandForInput(key('a', { control: true })), null); // leave select-all etc. to the page
  assert.equal(commandForInput(key('c', { control: true })), null);
  assert.equal(commandForInput(key('v', { control: true })), null);
});
test('mac uses meta', () => {
  assert.equal(commandForInput(key('t', { meta: true }), true), 'new-tab');
  assert.equal(commandForInput(key('t', { control: true }), true), null);
});
test('every palette command id is unique', () => {
  const ids = COMMANDS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('error page escapes hostile URLs and has no script', () => {
  const evil = 'https://x.test/"><script>alert(1)</script>';
  const html = errorPageHtml({ url: evil, code: -105, desc: 'ERR_NAME_NOT_RESOLVED' });
  assert.ok(!html.includes('<script'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.equal(esc(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});
test('certificate errors offer no proceed-anyway path', () => {
  const html = errorPageHtml({ url: 'https://bad.test/', code: -202, desc: 'ERR_CERT_AUTHORITY_INVALID' });
  assert.match(html, /isn.t private/);
  assert.ok(!/proceed|continue/i.test(html));
});
test('http fallback link only when provided', () => {
  assert.ok(!errorPageHtml({ url: 'https://a.test/', code: -102, desc: 'x' }).includes('allow-http'));
  const html = errorPageHtml({ url: 'https://a.test/', code: -102, desc: 'x', httpFallback: 'http://a.test/p?q=1' });
  assert.ok(html.includes('nadir://allow-http?u=http%3A%2F%2Fa.test%2Fp%3Fq%3D1'));
});
