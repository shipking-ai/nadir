// SPDX-License-Identifier: GPL-3.0-or-later
// Verifies every "owner/repo" in a seed file against the GitHub API. Wrong guesses show up as NOT_FOUND;
// renamed repos are followed (the API redirects) and reported with their canonical name.
// Usage: node scripts/verify-repos.js docs/research/seed-repos.txt [out.tsv]
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const seedFile = process.argv[2];
const outFile = process.argv[3] || seedFile.replace(/\.txt$/, '-verified.tsv');
const lines = fs.readFileSync(seedFile, 'utf8').split(/\r?\n/);
let category = '';
const seen = new Set();
const todo = [];
for (const l of lines) {
  const t = l.trim();
  if (!t) continue;
  if (t.startsWith('# ---')) { category = t.replace(/^#\s*-+\s*/, ''); continue; }
  if (t.startsWith('#')) continue;
  if (seen.has(t.toLowerCase())) continue;
  seen.add(t.toLowerCase());
  todo.push({ repo: t, category });
}

const rows = [];
let n = 0;
for (const { repo, category: cat } of todo) {
  n++;
  let rec;
  try {
    const j = JSON.parse(execFileSync('gh', ['api', `repos/${repo}`, '--jq', '{full_name,archived,pushed_at,created_at,stargazers_count,license:(.license.spdx_id // ""),language,description,fork,default_branch,disabled}'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    rec = { status: j.archived ? 'ARCHIVED' : (j.disabled ? 'DISABLED' : 'ok'), canonical: j.full_name, stars: j.stargazers_count, license: j.license, pushed: (j.pushed_at || '').slice(0, 10), created: (j.created_at || '').slice(0, 4), lang: j.language || '', fork: j.fork ? 'fork' : '', desc: (j.description || '').replace(/[\t\r\n]+/g, ' ').slice(0, 150) };
  } catch (e) {
    const msg = String(e.stderr || e.message);
    rec = { status: /Not Found|404/.test(msg) ? 'NOT_FOUND' : `ERROR`, canonical: '', stars: '', license: '', pushed: '', created: '', lang: '', fork: '', desc: msg.split('\n')[0].slice(0, 100) };
  }
  rows.push([cat, repo, rec.status, rec.canonical && rec.canonical.toLowerCase() !== repo.toLowerCase() ? `RENAMED→${rec.canonical}` : '', rec.stars, rec.license, rec.pushed, rec.created, rec.lang, rec.fork, rec.desc]);
  if (n % 50 === 0) console.log(`${n}/${todo.length}`);
}
const head = ['category', 'repo', 'status', 'note', 'stars', 'license', 'last_push', 'created', 'language', 'fork', 'description'];
fs.writeFileSync(outFile, [head.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n'));
const c = rows.reduce((m, r) => ((m[r[2]] = (m[r[2]] || 0) + 1), m), {});
console.log('DONE', JSON.stringify(c), '->', outFile);
