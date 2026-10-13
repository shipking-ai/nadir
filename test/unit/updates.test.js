// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseVersion, compareVersions, checkForUpdate } = require('../../src/main/updates');

test('semver parsing accepts versions and rejects junk', () => {
  assert.deepEqual(parseVersion('v1.2.3'), { major: 1, minor: 2, patch: 3, pre: [] });
  assert.deepEqual(parseVersion('0.2.0-rc.1+build5').pre, ['rc', '1']);
  for (const bad of ['', 'v1', '1.2', '1.2.3.4', 'latest', '1.2.x', null, undefined, '<script>', '1.2.3-', 'v01.2.3 ; rm']) assert.equal(parseVersion(bad), null, String(bad));
});

test('semver precedence follows the spec examples', () => {
  const order = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0', '1.0.1', '1.1.0', '2.0.0'];
  for (let i = 0; i < order.length; i++) for (let j = 0; j < order.length; j++) assert.equal(compareVersions(order[i], order[j]), Math.sign(i - j), `${order[i]} vs ${order[j]}`);
  assert.equal(compareVersions('0.10.0', '0.9.0'), 1, 'numeric, not lexical');
  assert.equal(compareVersions('v0.1.0', '0.1.0'), 0);
  assert.equal(compareVersions('nope', '0.1.0'), null);
});

const reply = (body, ok = true, status = 200) => async () => ({ ok, status, json: async () => body });
const rel = (tag, extra = {}) => ({ tag_name: tag, draft: false, prerelease: true, html_url: `https://github.com/shipking-ai/pelorus/releases/tag/${tag}`, ...extra });

test('update check: newer release is reported with its page', async () => {
  const r = await checkForUpdate({ fetchFn: reply([rel('v0.1.0'), rel('v0.2.0')]), current: '0.1.0' });
  assert.deepEqual(r, { current: '0.1.0', latest: '0.2.0', newer: true, url: 'https://github.com/shipking-ai/pelorus/releases/tag/v0.2.0', prerelease: true });
});

test('update check: same or older release is not an update', async () => {
  assert.equal((await checkForUpdate({ fetchFn: reply([rel('v0.1.0')]), current: '0.1.0' })).newer, false);
  assert.equal((await checkForUpdate({ fetchFn: reply([rel('v0.1.0')]), current: '0.3.0' })).newer, false);
});

test('update check: drafts, junk tags and unexpected URLs are ignored', async () => {
  const r = await checkForUpdate({ fetchFn: reply([rel('v9.9.9', { draft: true }), rel('nightly'), rel('v0.2.0', { html_url: 'https://evil.example/x' }), null, 42]), current: '0.1.0' });
  assert.equal(r.latest, '0.2.0');
  assert.equal(r.url, null, 'a release URL outside the project is never surfaced');
});

test('update check: failures are explicit', async () => {
  await assert.rejects(checkForUpdate({ fetchFn: reply({}, false, 403), current: '0.1.0' }), /HTTP 403/);
  await assert.rejects(checkForUpdate({ fetchFn: reply({ not: 'a list' }), current: '0.1.0' }), /Unexpected/);
  assert.deepEqual(await checkForUpdate({ fetchFn: reply([]), current: '0.1.0' }), { current: '0.1.0', latest: null, newer: false, url: null, prerelease: false });
});

test('update check never follows redirects and sends no credentials', async () => {
  let seen;
  await checkForUpdate({ fetchFn: async (u, o) => { seen = { u, o }; return { ok: true, status: 200, json: async () => [] }; }, current: '0.1.0' });
  assert.equal(seen.o.redirect, 'error');
  assert.equal(seen.o.credentials, 'omit');
  assert.match(seen.u, /^https:\/\/api\.github\.com\/repos\/shipking-ai\/pelorus\/releases/);
});
