// SPDX-License-Identifier: GPL-3.0-or-later
// nadir://app — history, bookmarks, downloads, privacy, settings, about.
// DOM is built with h(); page-derived text is only ever set via textContent.
(() => {
  'use strict';
  const api = window.nadir;
  const main = document.getElementById('main');
  document.querySelectorAll('[data-i]').forEach((s) => Icons.set(s, s.dataset.i));

  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'text') e.textContent = v;
      else if (k in e && k !== 'list') e[k] = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
    return e;
  }
  const bytes = (n) => { if (!n) return '0 B'; const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (n >= 1024 && i < 3) { n /= 1024; i++; } return `${n.toFixed(n < 10 && i ? 1 : 0)} ${u[i]}`; };
  const when = (t) => { const d = new Date(t); const same = d.toDateString() === new Date().toDateString(); return same ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }); };
  const open = (url, e) => api.invoke('nav:open', { url, newTab: !!(e && (e.ctrlKey || e.metaKey)) });
  const link = (text, url) => h('a', { class: 't', href: '#', title: url, onclick: (e) => { e.preventDefault(); open(url, e); } }, text);
  const empty = (t) => h('div', { class: 'empty', text: t });
  let offDownloads = null;
  let offSettings = null;

  // ---------------- views ----------------
  async function history() {
    const list = h('div', { class: 'list' });
    const q = h('input', { type: 'search', placeholder: 'Search history', 'aria-label': 'Search history' });
    const range = h('select', { 'aria-label': 'Range to clear' }, h('option', { value: 'hour', text: 'Last hour' }), h('option', { value: 'day', text: 'Last 24 hours' }), h('option', { value: 'week', text: 'Last 7 days' }), h('option', { value: 'all', text: 'All time', selected: true }));
    const load = async () => {
      const rows = await api.invoke('history:list', { query: q.value });
      list.replaceChildren(...(rows.length ? rows.map((r) => h('div', { class: 'item' },
        h('div', { class: 'main' }, link(r.title || r.host || r.url, r.url), h('span', { class: 's', text: r.host })),
        h('span', { class: 'when', text: when(r.last_visit) }),
        h('div', { class: 'acts' }, h('button', { class: 'btn', 'aria-label': `Remove ${r.title || r.url} from history`, onclick: async () => { await api.invoke('history:delete', r.id); load(); } }, 'Remove')))) : [empty(q.value ? 'No matches.' : 'No history yet.')]));
    };
    let tm; q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(load, 120); });
    const clear = h('button', { class: 'btn danger', onclick: async () => { await api.invoke('history:clear', { range: range.value }); load(); } }, 'Clear history');
    await load();
    return h('section', { class: 'view' }, h('h2', { text: 'History' }), h('p', { class: 'sub', text: 'Stored only on this device, separately for each workspace. Private tabs are never recorded.' }),
      h('div', { class: 'bar' }, q, range, clear), list);
  }

  async function bookmarks() {
    const list = h('div', { class: 'list' });
    const load = async () => {
      const rows = await api.invoke('bookmarks:list');
      list.replaceChildren(...(rows.length ? rows.map((r) => h('div', { class: 'item' },
        h('div', { class: 'main' }, link(r.title || r.url, r.url), h('span', { class: 's', text: r.url })),
        h('div', { class: 'acts' }, h('button', { class: 'btn', onclick: async () => { await api.invoke('bookmarks:remove', r.url); load(); } }, 'Remove')))) : [empty('No bookmarks. Press Ctrl+D on any page.')]));
    };
    await load();
    return h('section', { class: 'view' }, h('h2', { text: 'Bookmarks' }), h('p', { class: 'sub', text: 'Shared across workspaces.' }), list);
  }

  async function downloads() {
    const list = h('div', { class: 'list' });
    const msg = h('div', { class: 'err', role: 'status' });
    const paint = (rows) => {
      list.replaceChildren(...(rows.length ? rows.map((d) => {
        const pct = d.total ? Math.min(100, Math.round((d.received / d.total) * 100)) : 0;
        const acts = [];
        if (d.state === 'progressing') acts.push(h('button', { class: 'btn', onclick: () => api.invoke('downloads:cancel', { id: d.id }) }, 'Cancel'));
        if (d.state === 'completed' && d.exists) {
          if (d.canOpen) acts.push(h('button', { class: 'btn', onclick: async () => { const r = await api.invoke('downloads:open', { id: d.id }); msg.textContent = r.ok || r.cancelled ? '' : r.reason || 'Could not open file'; } }, 'Open'));
          acts.push(h('button', { class: 'btn', onclick: () => api.invoke('downloads:show', { id: d.id }) }, 'Show in folder'));
        }
        const tags = [];
        if (d.risk) tags.push(h('span', { class: d.risk === 'deceptive' || d.risk === 'executable' || d.risk === 'script' ? 'pill bad' : 'pill warn', text: d.risk === 'deceptive' ? 'disguised file type' : d.risk.replace('_', ' ') }));
        if (d.state === 'completed' && !d.exists) tags.push(h('span', { class: 'pill', text: 'file moved or deleted' }));
        if (d.state === 'interrupted' || d.state === 'cancelled') tags.push(h('span', { class: 'pill', text: d.state }));
        return h('div', { class: 'item' },
          h('div', { class: 'main' }, h('span', { class: 't', text: d.filename }), h('span', { class: 's', text: `${d.state === 'progressing' ? `${bytes(d.received)} of ${d.total ? bytes(d.total) : 'unknown size'}` : bytes(d.received)} · ${new URL(d.url).hostname || 'local'}` }),
            d.state === 'progressing' ? h('div', { class: 'progress' }, h('i', { style: null })) : null),
          h('div', { class: 'acts' }, ...tags), h('span', { class: 'when', text: when(d.started_at) }), h('div', { class: 'acts' }, ...acts));
      }) : [empty('No downloads.')]));
      list.querySelectorAll('.progress > i').forEach((i, n) => { const d = rows.filter((x) => x.state === 'progressing')[n]; i.style.setProperty('--p', `${d && d.total ? Math.round((d.received / d.total) * 100) : 0}%`); });
    };
    paint(await api.invoke('downloads:list'));
    if (offDownloads) offDownloads();
    offDownloads = api.on('downloads:update', paint);
    return h('section', { class: 'view' }, h('h2', { text: 'Downloads' }),
      h('p', { class: 'sub', text: 'Files are saved to your Downloads folder. Nadir flags risky file types by name and never launches programs or scripts itself.' }),
      h('div', { class: 'bar' }, h('button', { class: 'btn', onclick: () => api.invoke('downloads:clear') }, 'Clear list')), msg, list);
  }

  function toggle(label, desc, checked, onchange) {
    const cb = h('input', { type: 'checkbox', class: 'switch', checked, role: 'switch', 'aria-label': label, onchange: () => onchange(cb.checked) });
    return h('div', { class: 'row-set' }, h('div', null, h('div', { text: label }), desc ? h('div', { class: 'd', text: desc }) : null), h('div', { class: 'ctl' }, cb));
  }
  async function set(key, value, errEl) {
    try { await api.invoke('settings:set', { key, value }); if (errEl) errEl.textContent = ''; return true; }
    catch (e) { if (errEl) errEl.textContent = String(e.message || e).replace(/^Error invoking remote method '[^']+': Error: /, ''); return false; }
  }

  async function privacy() {
    const [{ settings: s, blocker }, sum] = await Promise.all([api.invoke('settings:get'), api.invoke('privacy:summary')]);
    const err = h('div', { class: 'err', role: 'alert' });
    const top = sum.blocked.top.length
      ? h('div', { class: 'list' }, ...sum.blocked.top.map((t) => h('div', { class: 'item' }, h('div', { class: 'main' }, h('span', { class: 't mono', text: t.host })), h('span', { class: 'when', text: t.n.toLocaleString() }))))
      : empty('Nothing blocked yet.');
    const perms = sum.permissions.length
      ? h('div', { class: 'list' }, ...sum.permissions.map((p) => h('div', { class: 'item' },
        h('div', { class: 'main' }, h('span', { class: 't', text: p.origin }), h('span', { class: 's', text: `${p.permission} · ${sum.workspaces[p.workspace_id] || p.workspace_id}` })),
        h('span', { class: p.decision === 'allow' ? 'pill warn' : 'pill', text: p.decision === 'allow' ? 'allowed' : 'blocked' }),
        h('div', { class: 'acts' }, h('button', { class: 'btn', onclick: async () => { await api.invoke('permissions:clear', { workspaceId: p.workspace_id, origin: p.origin, permission: p.permission }); render(); } }, 'Reset')))))
      : empty('No saved site permissions. Sites must ask, and everything is blocked by default.');
    const dnsMode = h('select', { 'aria-label': 'Secure DNS mode' }, ...[['off', 'Off (use system DNS)'], ['automatic', 'Automatic (upgrade when supported)'], ['secure', 'Always secure (custom server)']].map(([v, t]) => h('option', { value: v, text: t, selected: s.secureDns.mode === v })));
    const dnsServer = h('input', { type: 'text', value: s.secureDns.server, placeholder: 'https://dns.example/dns-query', 'aria-label': 'DNS-over-HTTPS server', size: 34 });
    const retention = h('input', { type: 'number', min: 0, max: 3650, value: s.historyRetentionDays, 'aria-label': 'History retention in days', style: null });
    retention.style.setProperty('width', '80px');
    const updated = blocker.updatedAt ? new Date(blocker.updatedAt).toLocaleString() : 'never';
    return h('section', { class: 'view' }, h('h2', { text: 'Privacy & security' }),
      h('p', { class: 'sub', text: 'Nadir reduces tracking and limits what sites can do. It does not make you anonymous: sites, your network and your DNS resolver can still see where you connect.' }),
      h('div', { class: 'stat' }, h('div', null, h('b', { text: sum.blocked.total.toLocaleString() }), h('span', { text: 'requests blocked, last 30 days' })), h('div', null, h('b', { text: blocker.listsLoaded ? 'On' : 'Not loaded' }), h('span', { text: `filter lists · updated ${updated}` }))),
      blocker.error ? h('div', { class: 'note', text: `Blocker notice: ${blocker.error}` }) : null,
      h('h3', { text: 'Protection' }),
      toggle('Block ads and trackers', 'Network and cosmetic filtering with Ghostery’s engine. Lists are fetched from Ghostery’s CDN (no browsing data is sent).', s.blocking.enabled, (v) => set('blocking', { enabled: v }, err)),
      toggle('HTTPS first', 'Tries the secure version of http:// pages. If a site has no HTTPS you are asked before continuing over HTTP.', s.httpsUpgrade, (v) => set('httpsUpgrade', v, err)),
      toggle('Strip tracking parameters', 'Removes utm_*, fbclid, gclid and similar from links you open.', s.stripTrackingParams, (v) => set('stripTrackingParams', v, err)),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Global Privacy Control' }), h('div', { class: 'd', text: 'Always sent (Sec-GPC: 1) so sites that honour it can treat you as opted out of data sale/sharing.' })), h('div', { class: 'ctl' }, h('span', { class: 'pill', text: 'always on' }))),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Secure DNS (DNS-over-HTTPS)' }), h('div', { class: 'd', text: sum.dnsError ? `Could not apply: ${sum.dnsError}` : 'Encrypts hostname lookups between Nadir and your DNS provider.' })), h('div', { class: 'ctl' }, dnsMode, dnsServer, h('button', { class: 'btn', onclick: () => set('secureDns', { mode: dnsMode.value, server: dnsServer.value }, err) }, 'Apply'))),
      err,
      h('h3', { text: 'Blocked most often' }), top,
      h('div', { class: 'bar' }, h('button', { class: 'btn', onclick: async (e) => { e.target.disabled = true; const r = await api.invoke('blocklist:refresh'); err.textContent = r.ok ? '' : `Update failed: ${r.error}`; render(); } }, 'Update filter lists now')),
      h('h3', { text: 'Site permissions' }), perms,
      h('h3', { text: 'Data' }),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Keep history for (days)' }), h('div', { class: 'd', text: '0 keeps history until you clear it.' })), h('div', { class: 'ctl' }, retention, h('button', { class: 'btn', onclick: () => set('historyRetentionDays', Number(retention.value), err) }, 'Save'))),
      toggle('Clear browsing data when Nadir closes', 'History, cookies, site storage and cache in every workspace.', s.clearOnExit, (v) => set('clearOnExit', v, err)),
      h('div', { class: 'bar' }, h('button', { class: 'btn danger', onclick: async () => { const r = await api.invoke('data:clear'); if (r.ok) render(); } }, 'Clear browsing data…')));
  }

  async function settings() {
    const { settings: s, workspaces, defaults } = await api.invoke('settings:get');
    const err = h('div', { class: 'err', role: 'alert' });
    const provider = h('select', { 'aria-label': 'Default search engine', onchange: () => set('searchProvider', provider.value, err) },
      ...Object.entries(s.searchProviders).map(([id, p]) => h('option', { value: id, text: p.name, selected: s.searchProvider === id })));
    const custom = h('input', { type: 'text', value: s.searchProviders.custom.url, placeholder: 'https://search.example/?q=%s', 'aria-label': 'Custom search URL', size: 38 });
    const theme = h('select', { 'aria-label': 'Theme', onchange: () => set('theme', theme.value, err) }, ...['system', 'dark', 'light'].map((v) => h('option', { value: v, text: v[0].toUpperCase() + v.slice(1), selected: s.theme === v })));
    const sleep = h('input', { type: 'number', min: 0, max: 1440, value: s.tabSleepMinutes, 'aria-label': 'Minutes before inactive tabs sleep' });
    sleep.style.setProperty('width', '80px');
    return h('section', { class: 'view' }, h('h2', { text: 'Settings' }), h('p', { class: 'sub', text: 'Changes apply immediately.' }),
      h('h3', { text: 'Search' }),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Default search engine' }), h('div', { class: 'd', text: 'Address-bar suggestions come from your own tabs, bookmarks and history. Keystrokes are never sent to a search provider.' })), h('div', { class: 'ctl' }, provider)),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Custom search URL' }), h('div', { class: 'd', text: 'Use %s for the query. Point it at your own SearXNG instance, for example. Must be https:// (or localhost).' })), h('div', { class: 'ctl' }, custom, h('button', { class: 'btn', onclick: async () => { if (await set('searchProviders', { custom: { url: custom.value } }, err)) { await set('searchProvider', 'custom', err); render(); } } }, 'Use'))),
      err,
      h('h3', { text: 'Appearance' }),
      h('div', { class: 'row-set' }, h('div', { text: 'Theme' }), h('div', { class: 'ctl' }, theme)),
      toggle('Collapse sidebar', 'Show only icons. Toggle with Ctrl+B.', s.sidebarCollapsed, (v) => set('sidebarCollapsed', v, err)),
      h('h3', { text: 'Tabs & startup' }),
      toggle('Restore tabs on startup', 'Only the active tab in each workspace loads immediately; the rest load when you open them.', s.restoreSession, (v) => set('restoreSession', v, err)),
      h('div', { class: 'row-set' }, h('div', null, h('div', { text: 'Sleep inactive tabs after (minutes)' }), h('div', { class: 'd', text: 'Frees memory by unloading the page. Scroll position and unsaved form input are lost. Tabs playing audio never sleep. 0 turns this off.' })), h('div', { class: 'ctl' }, sleep, h('button', { class: 'btn', onclick: () => set('tabSleepMinutes', Number(sleep.value), err) }, 'Save'))),
      h('h3', { text: 'Workspaces' }),
      h('div', { class: 'list' }, ...workspaces.map((w) => h('div', { class: 'item' }, h('span', { class: 'pill', text: '●' }), h('div', { class: 'main' }, h('span', { class: 't', text: w.name })),
        h('div', { class: 'acts' }, w.id === 'default' ? h('span', { class: 'pill', text: 'default' }) : h('button', { class: 'btn danger', onclick: async () => { await api.invoke('workspace:remove', w.id); render(); } }, 'Delete…'))))),
      h('p', { class: 'sub', text: 'Each workspace has its own cookies, logins, cache, history and permissions.' }));
  }

  async function about() {
    const i = await api.invoke('about:info');
    const row = (k, v) => h('tr', null, h('td', { text: k }), h('td', { class: 'mono', text: v }));
    const status = h('p', { id: 'update-status', role: 'status', 'aria-live': 'polite', text: '' });
    const btn = h('button', { class: 'btn', id: 'update-check', text: 'Check for updates', onclick: async () => {
      btn.disabled = true; status.replaceChildren('Checking GitHub…');
      try {
        const r = await api.invoke('update:check');
        if (!r.latest) status.replaceChildren('No releases were found.');
        else if (r.newer) status.replaceChildren(`Version ${r.latest}${r.prerelease ? ' (pre-release)' : ''} is available. You have ${r.current}. `, r.url ? link('View the release, checksums and attestation', r.url) : '');
        else status.replaceChildren(`You are up to date (${r.current}; newest release ${r.latest}).`);
      } catch (e) { status.replaceChildren(`Could not check: ${e.message}`); }
      btn.disabled = false;
    } });
    return h('section', { class: 'view' }, h('h2', { text: 'About Nadir' }),
      h('p', { class: 'sub', text: 'A privacy-first, workspace-centric browser. Open source, GPL-3.0-or-later.' }),
      h('table', { class: 'kv' }, row('Nadir', i.app), row('Chromium', i.chromium), row('Electron', i.electron), row('Node.js', i.node), row('V8', i.v8), row('SQLite', i.sqlite), row('Platform', i.platform), row('Data folder', i.userData)),
      h('div', { class: 'note', text: 'Nadir embeds Chromium through Electron, which trails Google Chrome’s release by a few versions. Keep Nadir updated. Chrome Web Store extensions are not supported yet.' }),
      h('h3', { text: 'Updates' }),
      h('p', { class: 'sub', text: 'Nadir does not update itself and never checks in the background. This button asks GitHub (api.github.com) for the list of releases and shows you where to download and verify a newer build. Releases are not code-signed yet; verify the checksum or the build attestation.' }),
      btn, status);
  }

  // ---------------- router ----------------
  const ROUTES = { history, bookmarks, downloads, privacy, settings, about };
  let token = 0;
  async function render() {
    const mine = ++token;
    if (offDownloads) { offDownloads(); offDownloads = null; }
    const name = (location.hash.match(/^#\/(\w+)/) || [])[1];
    const route = Object.hasOwn(ROUTES, name) ? name : 'history';
    document.querySelectorAll('nav a').forEach((a) => (a.dataset.r === route ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = `${route[0].toUpperCase()}${route.slice(1)} — Nadir`;
    try {
      const view = await ROUTES[route]();
      if (mine === token) main.replaceChildren(view);
    } catch (e) {
      if (mine === token) main.replaceChildren(h('div', { class: 'note', text: `Could not load this page: ${e.message}` }));
    }
  }
  window.addEventListener('hashchange', render);
  if (offSettings) offSettings();
  offSettings = api.on('settings:changed', () => { if (/privacy|settings/.test(location.hash) && !document.activeElement?.matches('input[type=text],input[type=number]')) render(); });
  render();
})();
