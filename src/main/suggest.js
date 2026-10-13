// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { resolveInput, displayHost } = require('../shared/urls');
const { rank } = require('../shared/fuzzy');

/**
 * Local-only address-bar suggestions. No keystrokes are sent to any search provider.
 * @returns {{type:'go'|'search'|'tab'|'bookmark'|'history', title:string, url:string, tabId?:number}[]}
 */
function omniboxSuggestions({ text, store, tabs, workspaceId, searchTemplate, searchName }) {
  const q = String(text ?? '').trim();
  if (!q) return [];
  const out = [];
  const seen = new Set();
  const push = (s) => { if (!seen.has(s.url) && out.length < 8) { seen.add(s.url); out.push(s); } };

  const r = resolveInput(q, searchTemplate);
  if (r.kind === 'url') push({ type: 'go', title: r.url, url: r.url });
  else if (r.kind === 'search') push({ type: 'search', title: `Search ${searchName} for “${q}”`, url: r.url });

  for (const t of rank(tabs.filter((t) => t.workspaceId === workspaceId), q, [(t) => t.title, (t) => t.url], 2)) {
    push({ type: 'tab', title: t.title || t.url, url: t.url, tabId: t.id });
  }
  for (const b of store.searchBookmarks(q, 3)) push({ type: 'bookmark', title: b.title, url: b.url });
  for (const h of store.searchHistory(q, { workspaceId, limit: 5 })) push({ type: 'history', title: h.title || displayHost(h.url), url: h.url });

  // A search row should always be reachable, but a confident URL match stays first.
  if (r.kind === 'url' && out.length < 8) push({ type: 'search', title: `Search ${searchName} for “${q}”`, url: searchTemplate.replace('%s', encodeURIComponent(q)) });
  return out;
}

module.exports = { omniboxSuggestions };
