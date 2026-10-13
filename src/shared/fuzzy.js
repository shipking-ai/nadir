// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';

const SEP = /[\s/.\-_:]+/;

/**
 * Score how well `query` matches `text`; -1 means "not a match". Higher is better.
 * Tiers (best to worst): exact, prefix, substring, every query word is a word-prefix,
 * acronym of word initials, and — only for queries of 4+ characters — a loose subsequence.
 * Short queries never match scattered letters ("set" does not match "Close tab").
 */
function fuzzyScore(query, text) {
  const q = String(query).toLowerCase().trim();
  const t = String(text).toLowerCase();
  if (!q) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 900 - t.length / 10;
  const idx = t.indexOf(q);
  if (idx >= 0) return 700 - idx - t.length / 10 + (idx === 0 || SEP.test(t[idx - 1]) ? 60 : 0);

  const words = t.split(SEP).filter(Boolean);
  const qWords = q.split(/\s+/).filter(Boolean);
  if (qWords.length > 1 || words.length > 1) {
    const used = new Set();
    const allPrefix = qWords.every((qw) => {
      const i = words.findIndex((w, k) => !used.has(k) && w.startsWith(qw));
      if (i < 0) return false;
      used.add(i);
      return true;
    });
    if (allPrefix) return 500 - t.length / 10;
  }
  const initials = words.map((w) => w[0]).join('');
  if (q.length >= 2 && !/\s/.test(q) && initials.startsWith(q)) return 400 - t.length / 10;

  if (q.length >= 4 && !/\s/.test(q)) {
    let ti = 0, gaps = 0;
    for (const ch of q) {
      const found = t.indexOf(ch, ti);
      if (found < 0) return -1;
      gaps += found - ti;
      ti = found + 1;
    }
    if (gaps <= q.length) return Math.max(1, 200 - gaps * 10 - t.length / 10);
  }
  return -1;
}

/** Rank items by best score over the given text getters; drops non-matches. */
function rank(items, query, getters, limit = 50) {
  const out = [];
  for (const item of items) {
    let best = -1;
    for (const g of getters) best = Math.max(best, fuzzyScore(query, g(item) ?? ''));
    if (best >= 0) out.push({ item, score: best });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((x) => x.item);
}

module.exports = { fuzzyScore, rank };
