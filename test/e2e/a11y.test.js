// SPDX-License-Identifier: GPL-3.0-or-later
// Automated accessibility scan (axe-core, MPL-2.0) of every nadir:// page and the browser chrome.
// Automated tools find roughly a third of real accessibility problems at best: a clean result here is NOT
// evidence of screen-reader usability. A manual NVDA/Narrator pass is still open in docs/ROADMAP.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { launch } = require('./helpers');

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
