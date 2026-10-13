// SPDX-License-Identifier: GPL-3.0-or-later
// Retries the npm queries that failed (HTML instead of JSON = rate limited) in the discovery sweep, slowly.
// Usage: node scripts/discover-retry-npm.js docs/research/discovery-2026-10-12.errors.txt
const fs = require('node:fs');
const path = require('node:path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const errs = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter((l) => l.startsWith('npm '));
  const queries = errs.map((l) => l.slice(4).split(': ')[0]);
  const rows = [], still = [];
  for (const q of queries) {
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) {
      await sleep(4000 * (a + 1));
      try {
        const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=60&quality=0.0&popularity=1.0&maintenance=0.3`);
        const j = await res.json();
        for (const o of j.objects || []) rows.push(['npm', o.package.name, '', o.package.license || '', (o.package.date || '').slice(0, 10), '', 'js', 1, (o.package.description || '').replace(/[\t\r\n]+/g, ' ').slice(0, 160), q].join('\t'));
        ok = true;
      } catch { /* retry */ }
    }
    if (!ok) still.push(q);
  }
  const out = path.join(path.dirname(process.argv[2]), 'discovery-npm-retry.tsv');
  fs.writeFileSync(out, ['source\tname\tstars\tlicense\tlast_push\tarchived\tlanguage\tqueries_matched\tdescription\tquery', ...rows].join('\n'));
  console.log(`retried ${queries.length} queries -> ${rows.length} rows; still failing: ${still.length} ${still.join(', ')}`);
})();
