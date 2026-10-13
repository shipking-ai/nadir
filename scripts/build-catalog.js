// SPDX-License-Identifier: GPL-3.0-or-later
// Builds docs/research/CATALOG.md from:
//   docs/research/seed-repos-verified.tsv      (every seed verified against the GitHub API)
//   docs/research/discovery-<date>.tsv         (topic/keyword/npm/crates sweep) + optional triage file
//   scripts/catalog-classification.js          (class + note per project)
// Usage: node scripts/build-catalog.js
const fs = require('node:fs');
const path = require('node:path');
const classification = require('./catalog-classification');
const additions = require('./catalog-additions');

const root = path.resolve(__dirname, '..', 'docs', 'research');
const NOW = new Date('2026-10-12');
const tsv = (f) => { const [h, ...rows] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t')); return rows.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? '']))); };
const days = (d) => (d ? Math.round((NOW - new Date(d)) / 86400000) : null);
const activity = (r) => { if (r.status === 'ARCHIVED' || r.archived === 'archived') return 'archived'; const d = days(r.last_push || r.pushed); return d == null ? '?' : d <= 120 ? 'active' : d <= 365 ? 'slow' : 'stale'; };
const esc = (s) => String(s).replace(/\|/g, '\\|');
const star = (n) => (n === '' || n == null ? '' : Number(n) >= 1000 ? `${(Number(n) / 1000).toFixed(1)}k` : String(n));

const seed = tsv(path.join(root, 'seed-repos-verified.tsv'));
const found = seed.filter((r) => r.status === 'ok' || r.status === 'ARCHIVED');
const missing = seed.filter((r) => r.status === 'NOT_FOUND');

// Metadata for the additions: sweep rows (GitHub search API) first, then the curated-list cross-check (repos API).
const sweepFile = fs.readdirSync(root).filter((f) => /^discovery-\d{4}-\d{2}-\d{2}\.tsv$/.test(f)).sort().pop();
const sweep = tsv(path.join(root, sweepFile)).filter((r) => r.source === 'github');
const cross = ['crosscheck-lists-verified.tsv', 'resolve-notfound-verified.tsv'].flatMap((f) => tsv(path.join(root, f))).filter((r) => r.status === 'ok' || r.status === 'ARCHIVED');
const meta = new Map();
for (const r of sweep) meta.set(r.name.toLowerCase(), { repo: r.name, stars: r.stars, license: r.license, last_push: r.last_push, archived: r.archived });
for (const r of tsv(path.join(root, 'topic-check-2026-10-12.tsv'))) meta.set(r.name.toLowerCase(), { repo: r.name, stars: r.stars, license: r.license, last_push: r.last_push, archived: r.archived });
for (const r of cross) {
  const canon = r.note.startsWith('RENAMED→') ? r.note.slice(8) : r.repo;
  meta.set(canon.toLowerCase(), { repo: canon, stars: r.stars, license: r.license, last_push: r.last_push, archived: r.status === 'ARCHIVED' ? 'archived' : '' });
}

const classes = ['Core', 'High-value', 'Optional', 'Experimental', 'Reference', 'Rejected', 'Out-of-scope'];
const counts = Object.fromEntries(classes.map((c) => [c, 0]));
const byCat = new Map();
const unclassified = [];
for (const r of found) {
  const key = (r.note.startsWith('RENAMED→') ? r.note.slice(8) : r.repo).toLowerCase();
  const alt = r.repo.toLowerCase();
  const c = classification[key] || classification[alt];
  if (!c) { unclassified.push(r.repo); continue; }
  counts[c.cls]++;
  if (!byCat.has(r.category)) byCat.set(r.category, []);
  byCat.get(r.category).push({ ...r, cls: c.cls, cnote: c.note, act: activity(r) });
}

const addMissing = [];
let addCount = 0;
for (const [key, a] of Object.entries(additions)) {
  const md = meta.get(key);
  if (!md) { addMissing.push(key); continue; }
  counts[a.cls]++; addCount++;
  if (!byCat.has(a.cat)) byCat.set(a.cat, []);
  byCat.get(a.cat).push({ ...md, status: md.archived ? 'ARCHIVED' : 'ok', cls: a.cls, cnote: a.note, act: activity(md) });
}

let out = `# Catalog of open-source browser-related projects

**Generated** by \`node scripts/build-catalog.js\` · data pulled **2026-10-11/12** · sources and method: [SWEEP.md](SWEEP.md).
Every row below was **verified against the GitHub API** (existence, archived flag, last push, licence). ${addCount} rows came from the discovery sweep / curated-list cross-check rather than my original seed list. "Activity": *active* = pushed ≤ 120 days ago, *slow* ≤ 1 year, *stale* > 1 year. Stars are a liveness signal only. The **class** and **note** columns are my judgement from the project's README/status, not measurements.

Classes: **Core** shipped in Nadir · **High-value** worth integrating next · **Optional** useful later/for a scenario · **Experimental** promising, unproven for us · **Reference** study/borrow ideas · **Rejected** unsuitable (abandoned, redundant, purpose or licence conflict) · **Out-of-scope** different product category.

| Class | Count |
|---|---|
${classes.map((c) => `| ${c} | ${counts[c]} |`).join('\n')}
| **Total verified & classified** | **${classes.reduce((s, c) => s + counts[c], 0)}** |

`;
for (const [cat, rows] of byCat) {
  rows.sort((a, b) => classes.indexOf(a.cls) - classes.indexOf(b.cls) || (Number(b.stars) || 0) - (Number(a.stars) || 0));
  out += `\n## ${cat}\n\n| Project | ★ | Licence | Last push | Activity | Class | Note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rows) out += `| [${esc(r.repo)}](https://github.com/${r.repo}) | ${star(r.stars)} | ${esc(r.license || '—')} | ${r.last_push} | ${r.act} | **${r.cls}** | ${esc(r.cnote)} |\n`;
}

const retried = tsv(path.join(root, 'resolve-notfound-verified.tsv'));
const stillMissing = retried.filter((r) => r.status === 'NOT_FOUND').map((r) => r.repo);
const tick = (x) => '`' + x + '`';
out += `\n## Names that GitHub could not find (${missing.length} first-pass misses)\n\nThe first-pass seed list contained ${missing.length} names that returned 404. Most were my own wrong guesses at an owner/repo spelling. **None of them is claimed to exist.** I retried ${retried.length} corrected spellings for the ones that are real projects (docs/research/resolve-notfound-verified.tsv): ${retried.length - stillMissing.length} resolved and are in the tables above; ${stillMissing.length ? stillMissing.map(tick).join(', ') + ' is still not found' : 'none remain unresolved'}. The topic check (see SWEEP.md) then found the real homes of Fen (FENBROWSER/fenbrowser), Starling (starling-browser/starling), Hastur (robinlinden/hastur), Nordstjernen (nordstjernen-web/nordstjernen-browser) and dillo-plus (crossbowerbt/dillo-plus); they are in the tables above.\n\nFirst-pass misses, for the record:\n\n${missing.map((r) => tick(r.repo)).join(' · ')}\n\n### Real projects not hosted on GitHub (confirmed from their own sites, not via the API)\n\nPale Moon (palemoon.org), NetSurf (netsurf-browser.org), LibreWolf (librewolf.dev), Dooble, Tor Browser and Arti (gitlab.torproject.org), suckless surf (surf.suckless.org), Verso (gitlab.com/verso-browser/verso; the GitHub copy is an archived mirror). Their licence/activity details were read from those sites during the research session and are recorded in [LEDGER.md](LEDGER.md); they are not re-verified by this script.\n`;
fs.writeFileSync(path.join(root, 'CATALOG.md'), out);
console.log(`catalog: ${classes.reduce((s, c) => s + counts[c], 0)} classified (${addCount} from sweep), ${unclassified.length} unclassified, ${missing.length} not found`);
if (addMissing.length) console.log('ADDITIONS WITHOUT METADATA:', addMissing.join(', '));
if (unclassified.length) console.log('UNCLASSIFIED:', unclassified.join(', '));
