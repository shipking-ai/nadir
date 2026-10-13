// SPDX-License-Identifier: GPL-3.0-or-later
// Automated accessibility scan (axe-core, MPL-2.0) of every nadir:// page and the browser chrome.
// Automated tools find roughly a third of real accessibility problems at best: a clean result here is NOT
// evidence of screen-reader usability. A manual NVDA/Narrator pass is still open in docs/ROADMAP.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { launch, until } = require('./helpers');

const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
let b;
test.before(async () => { b = await launch(); });
test.after(async () => { await b?.close(); });

// Evaluating the source bypasses the pages' strict CSP (no inline <script>).
async function scan(page) {
  await page.evaluate(AXE);
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
  });
}

const results = {};
const check = (name, v) => {
  results[name] = v;
  const bad = v.filter((x) => x.impact === 'serious' || x.impact === 'critical');
  assert.deepEqual(bad, [], `${name}: serious/critical accessibility violations`);
};

test('new-tab page', async () => {
  const page = await b.page('nadir://newtab');
  await page.waitForSelector('input.search');
  check('newtab', await scan(page));
});

for (const route of ['history', 'bookmarks', 'downloads', 'privacy', 'settings', 'about']) {
  test(`nadir://app/#/${route}`, async () => {
    await b.navigate(`nadir://app/#/${route}`);
    const page = await b.page('nadir://app');
    await page.waitForSelector('nav a[aria-current="page"]');
    await page.waitForLoadState('networkidle').catch(() => {});
    check(route, await scan(page));
  });
}

test('browser chrome (tab strip, toolbar)', async () => {
  check('shell', await scan(b.shell));
});

test.after(() => {
  const out = path.join(__dirname, '..', '..', 'docs', 'benchmarks', 'a11y-axe-latest.json');
  try { fs.writeFileSync(out, JSON.stringify({ tool: `axe-core ${require('axe-core').version}`, date: new Date().toISOString().slice(0, 10), violations: results }, null, 2)); } catch { /* optional artefact */ }
});

// ---- the overlay window (omnibox dropdown, command palette, find bar) and the accessibility tree itself ----

test('command palette (overlay) has no serious/critical violations', async () => {
  await b.ctl('c.runCommand("command-palette")');
  const ov = await b.page('nadir://overlay');
  await ov.waitForSelector('.palette input');
  await ov.waitForSelector('.palette .row');
  check('overlay-palette', await scan(ov));
  await ov.keyboard.press('Escape');
});

test('address-bar suggestions (overlay) have no serious/critical violations', async () => {
  await b.navigate('nadir://app/#/history');
  await b.shell.focus('#omni');
  await b.shell.fill('#omni', 'nadir');
  const ov = await b.page('nadir://overlay');
  await ov.waitForSelector('.omni-list .row', { timeout: 8000 });
  check('overlay-suggestions', await scan(ov));
  await b.shell.keyboard.press('Escape');
});

test('find bar (overlay) has no serious/critical violations', async () => {
  await b.navigate('about:blank'); // find needs a web page, not an internal one
  await until(async () => (await b.active()).kind === 'web', { what: 'a web tab' });
  await b.ctl('c.runCommand("find")');
  const ov = await b.page('nadir://overlay');
  await ov.waitForSelector('input');
  check('overlay-find', await scan(ov));
  await ov.keyboard.press('Escape');
});

test('accessibility tree of the browser chrome: names, roles and states a screen reader would announce', async () => {
  const cdp = await b.shell.context().newCDPSession(b.shell);
  await cdp.send('Accessibility.enable');
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const val = (n, k) => n[k]?.value;
  const named = (role) => nodes.filter((n) => val(n, 'role') === role && !n.ignored);
  const names = (role) => named(role).map((n) => val(n, 'name'));

  assert.ok(names('tablist').includes('Open tabs'), `a tab list named "Open tabs" exists; got ${JSON.stringify(names('tablist'))}`);
  const tabs = named('tab');
  assert.ok(tabs.length >= 1, 'at least one tab');
  for (const t of tabs) assert.ok(val(t, 'name'), 'every tab has an accessible name');
  const selected = tabs.filter((t) => (t.properties || []).some((p) => p.name === 'selected' && p.value.value === true));
  assert.equal(selected.length, 1, 'exactly one tab is announced as selected');

  assert.ok(names('combobox').includes('Search or enter address'), `the address box is a named combobox; got ${JSON.stringify(names('combobox'))}`);
  const unnamedButtons = named('button').filter((n) => !val(n, 'name'));
  assert.deepEqual(unnamedButtons.map((n) => n.backendDOMNodeId), [], 'every button has an accessible name');
  for (const wanted of ['New tab', 'Reload']) assert.ok(names('button').some((n) => new RegExp(wanted, 'i').test(n)), `a "${wanted}" button is exposed`);
  assert.ok(names('group').includes('Workspaces'), 'workspace switcher is a named group');
  assert.ok(named('button').filter((n) => (n.properties || []).some((p) => p.name === 'pressed')).length >= 1, 'workspace buttons expose their pressed state');
});

test('keyboard only: the toolbar and address box can be reached with Tab', async () => {
  await b.shell.focus('#omni');
  const seen = new Set();
  for (let i = 0; i < 25; i++) {
    await b.shell.keyboard.press('Tab');
    const id = await b.shell.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName));
    seen.add(id);
  }
  assert.ok(seen.size >= 5, `Tab visits several distinct controls (saw ${[...seen].join(', ')})`);
});
