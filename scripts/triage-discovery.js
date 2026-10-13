// SPDX-License-Identifier: GPL-3.0-or-later
// Triage of the discovery sweep: removes what is already in the verified seed, then scores
// the rest by browser-relatedness (topic hits + description keywords). Output feeds manual review.
// Usage: node scripts/triage-discovery.js [discovery.tsv]
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'docs', 'research');
const rd = (f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t'));
const tbl = (f) => { const [h, ...r] = rd(f); return r.map((x) => Object.fromEntries(h.map((k, i) => [k, x[i] ?? '']))); };
const file = process.argv[2] || fs.readdirSync(root).filter((f) => /^discovery-.*\.tsv$/.test(f)).sort().pop();
const disc = tbl(path.join(root, file));
const seed = new Set(tbl(path.join(root, 'seed-repos-verified.tsv')).map((r) => r.repo.toLowerCase()));

// Strong words: a project whose own description says it IS a browser / browser engine / browser shell.
const STRONG = /\b(web ?browser|browser engine|rendering engine|browser (?:fork|shell|ui)|chromium|firefox|gecko|webkit|blink|servo|ladybird|electron-?(?:based)? browser|privacy browser|tor browser|lightweight browser|minimal browser|text[- ]mode browser|terminal browser|gemini browser|gopher|browser for)\b/i;
const WEAK = /\b(browser|webview|tabs?|bookmark|ad ?block|tracker|privacy|fingerprint|cookie|userscript|devtools|extension|web ?extension|headless|webdriver|automation)\b/i;
const NOISE = /\b(awesome|tutorial|course|interview|leetcode|portfolio|template|boilerplate|dotfiles|cheat ?sheet)\b/i;

const novel = disc.filter((r) => !seed.has(r.name.toLowerCase()));
const scored = novel.map((r) => {
  const d = r.description;
  const s = (STRONG.test(d) || STRONG.test(r.name) ? 3 : 0) + (WEAK.test(d) ? 1 : 0) + (Number(r.queries_matched) >= 3 ? 1 : 0) - (NOISE.test(d) ? 2 : 0);
  return { ...r, score: s };
});
fs.writeFileSync(path.join(root, 'discovery-novel-scored.tsv'),
  ['source\tname\tstars\tlicense\tlast_push\tarchived\tscore\tqueries\tdescription',
    ...scored.sort((a, b) => b.score - a.score || (Number(b.stars) || 0) - (Number(a.stars) || 0))
      .map((r) => [r.source, r.name, r.stars, r.license, r.last_push, r.archived, r.score, r.queries_matched, r.description].join('\t'))].join('\n'));
const dist = {}; scored.forEach((r) => { const k = r.source + ':' + r.score; dist[k] = (dist[k] || 0) + 1; });
console.log(file, 'candidates', disc.length, 'already in seed', disc.length - novel.length, 'novel', novel.length);
console.log(dist);
