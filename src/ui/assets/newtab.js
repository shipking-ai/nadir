// SPDX-License-Identifier: GPL-3.0-or-later
(async () => {
  'use strict';
  const api = window.pelorus;
  const $ = (id) => document.getElementById(id);
  Icons.set($('sic'), 'search');

  function tiles(box, items, emptyText) {
    box.replaceChildren();
    if (!items.length) { const p = document.createElement('p'); p.className = 'empty-note'; p.textContent = emptyText; box.replaceWith(Object.assign(p, { id: box.id })); return; }
    for (const s of items) {
      const a = document.createElement('a'); a.className = 'tile'; a.href = '#'; a.title = s.url;
      const lt = document.createElement('span'); lt.className = 'lt'; lt.textContent = (s.host[0] || '·').toUpperCase();
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = s.title;
      a.append(lt, nm);
      a.addEventListener('click', (e) => { e.preventDefault(); api.invoke('nav:open', { url: s.url, newTab: e.ctrlKey || e.metaKey }); });
      box.append(a);
    }
  }

  try {
    const d = await api.invoke('newtab:data');
    $('ws-dot').style.setProperty('--c', d.workspace.color);
    $('ws-name').textContent = d.workspace.ephemeral ? 'Private tab — history, cookies and permissions are not saved' : d.workspace.name;
    $('q').placeholder = `Search with ${d.search} or enter address`;
    tiles($('top'), d.topSites, 'Sites you visit often will appear here.');
    tiles($('bm'), d.bookmarks, 'Press Ctrl+D on a page to bookmark it.');
    $('foot').textContent = d.blockedTotal
      ? `Pelorus blocked ${d.blockedTotal.toLocaleString()} tracker and ad requests in the last 30 days.`
      : 'Ad and tracker blocking is on. Counts appear here as you browse.';
  } catch (e) {
    $('foot').textContent = 'Could not load page data.';
  }

  $('f').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('q').value;
    if (v.trim()) api.invoke('nav:go', { input: v });
  });
})();
