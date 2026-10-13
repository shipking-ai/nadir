// SPDX-License-Identifier: GPL-3.0-or-later
// Browser chrome renderer: sidebar (workspaces + vertical tabs), toolbar, address bar.
// All page-supplied strings (titles, URLs) are written with textContent / property assignment, never innerHTML.
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const api = window.pelorus;
  let state = null;
  let omniFocused = false;
  let suggestions = [];
  let sel = -1;
  let typed = '';
  let seq = 0;
  let dragId = null;

  document.querySelectorAll('[data-icon]').forEach((el) => Icons.set(el, el.dataset.icon));
  if (api.platform === 'darwin') document.body.classList.add('mac');

  // ---------- helpers ----------
  const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  function displayUrl(url) {
    if (!url || url.startsWith('pelorus://newtab')) return '';
    if (url.startsWith('pelorus://app/')) return 'pelorus://' + (url.split('#/')[1] || 'settings');
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        const path = u.pathname === '/' ? '' : u.pathname;
        return u.host.replace(/^www\./, '') + path + u.search + u.hash;
      }
    } catch { /* fall through */ }
    return url;
  }
  const activeTab = () => state && state.tabs.find((t) => t.id === state.activeId);
  const titleOf = (t) => t.title || (t.url.startsWith('pelorus://newtab') ? 'New tab' : hostOf(t.url) || t.url || 'New tab');

  // ---------- rendering ----------
  function render(s) {
    if (!s) return;
    state = s;
    document.body.classList.toggle('collapsed', !!s.sidebarCollapsed);
    document.body.classList.toggle('fullscreen', !!s.fullscreen);
    renderWorkspaces(s);
    renderTabs(s);
    renderToolbar(s);
    const dl = $('dl-badge');
    dl.hidden = !s.downloadsActive;
    dl.textContent = s.downloadsActive || '';
  }

  function renderWorkspaces(s) {
    const box = $('workspaces');
    box.replaceChildren();
    for (const w of s.workspaces) {
      const b = document.createElement('button');
      b.className = 'ws';
      b.setAttribute('aria-pressed', String(w.id === s.currentWorkspace));
      b.title = w.ephemeral ? 'Private tabs (not saved)' : `Workspace: ${w.name}`;
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.setProperty('--c', w.color);
      const name = document.createElement('span'); name.className = 'name'; name.textContent = w.name;
      const n = document.createElement('span'); n.className = 'count'; n.textContent = w.tabs || '';
      b.append(dot, name, n);
      b.addEventListener('click', () => api.invoke('workspace:switch', w.id));
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!w.ephemeral) api.invoke('workspace:menu', w.id); });
      box.append(b);
    }
    const add = document.createElement('button');
    add.className = 'ws add'; add.setAttribute('aria-label', 'New workspace'); add.title = 'New workspace';
    Icons.set(add, 'plus');
    add.addEventListener('click', () => api.invoke('workspace:create'));
    box.append(add);
  }

  function favEl(t) {
    const f = document.createElement('span');
    f.className = 'fav';
    if (t.favicon && t.kind === 'web') {
      const img = document.createElement('img');
      img.alt = ''; img.referrerPolicy = 'no-referrer'; img.src = t.favicon;
      img.addEventListener('error', () => { img.remove(); f.append(letter(t)); });
      f.append(img);
    } else f.append(letter(t));
    return f;
  }
  function letter(t) {
    const s = document.createElement('span');
    // Decorative glyph drawn by CSS (content: attr(data-t)) so it is not part of the tab's text (WCAG 2.5.3 Label in Name).
    s.setAttribute('aria-hidden', 'true');
    s.dataset.t = t.kind === 'internal' ? 'N' : (hostOf(t.url)[0] || '·').toUpperCase();
    return s;
  }

  function tabEl(t, s) {
    const el = document.createElement('div');
    el.className = 'tab' + (t.loading ? ' loading' : '') + (t.sleeping ? ' sleeping' : '') + (t.id === s.splitId ? ' split' : '');
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', String(t.id === s.activeId));
    el.tabIndex = t.id === s.activeId ? 0 : -1;
    el.dataset.id = t.id;
    el.draggable = true;
    const title = titleOf(t);
    el.title = title + (t.sleeping ? ' (sleeping)' : '') + (t.url && t.kind === 'web' ? '\n' + t.url : '');
    el.setAttribute('aria-label', title + (t.sleeping ? ', sleeping' : '') + (t.audible ? ', playing audio' : ''));

    const ti = document.createElement('span'); ti.className = 'title'; ti.textContent = title;
    const st = document.createElement('span'); st.className = 'state';
    if (t.audible) st.insertAdjacentHTML('beforeend', Icons.svg('audio'));
    if (t.sleeping) st.insertAdjacentHTML('beforeend', Icons.svg('moon'));
    // Mouse-only affordance: a focusable button inside role=tab is invalid (nested-interactive); keyboard users close with Delete or the context menu.
    const x = document.createElement('span'); x.className = 'close'; x.setAttribute('aria-hidden', 'true');
    Icons.set(x, 'close');
    x.addEventListener('click', (e) => { e.stopPropagation(); api.invoke('tab:close', t.id); });
    el.append(favEl(t), ti, st, x);

    el.addEventListener('click', () => api.invoke('tab:activate', t.id));
    el.addEventListener('auxclick', (e) => { if (e.button === 1) { e.preventDefault(); api.invoke('tab:close', t.id); } });
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); api.invoke('tab:menu', t.id); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); api.invoke('tab:activate', t.id); }
      else if (e.key === 'Delete') { e.preventDefault(); api.invoke('tab:close', t.id); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const all = [...document.querySelectorAll('.tab')];
        const i = all.indexOf(el) + (e.key === 'ArrowDown' ? 1 : -1);
        all[(i + all.length) % all.length]?.focus();
      }
    });
    el.addEventListener('dragstart', (e) => { dragId = t.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/x-pelorus-tab', String(t.id)); });
    el.addEventListener('dragover', (e) => { if (dragId != null && dragId !== t.id) { e.preventDefault(); el.classList.add('drop-before'); } });
    el.addEventListener('dragleave', () => el.classList.remove('drop-before'));
    el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('drop-before'); if (dragId != null && dragId !== t.id) api.invoke('tab:reorder', { id: dragId, beforeId: t.id }); dragId = null; });
    el.addEventListener('dragend', () => { dragId = null; });
    return el;
  }

  function renderTabs(s) {
    const hadFocus = document.activeElement && document.activeElement.classList?.contains('tab') ? document.activeElement.dataset.id : null;
    const pinned = $('pinned'); const list = $('tabs');
    pinned.replaceChildren(...s.tabs.filter((t) => t.pinned).map((t) => tabEl(t, s)));
    list.replaceChildren(...s.tabs.filter((t) => !t.pinned).map((t) => tabEl(t, s)));
    list.ondragover = (e) => { if (dragId != null && e.target === list) e.preventDefault(); };
    list.ondrop = (e) => { if (dragId != null && e.target === list) { e.preventDefault(); api.invoke('tab:reorder', { id: dragId, beforeId: null }); dragId = null; } };
    if (hadFocus) document.querySelector(`.tab[data-id="${CSS.escape(hadFocus)}"]`)?.focus({ preventScroll: true });
    const sel = list.querySelector('[aria-selected="true"]');
    if (sel && !omniFocused) sel.scrollIntoView({ block: 'nearest' });
  }

  function siteInfo(t) {
    const el = $('site-info');
    el.className = 'site-info';
    let icon = 'globe'; let text = '';
    if (!t) icon = 'search';
    else if (t.url.startsWith('https:')) { icon = 'lock'; el.classList.add('secure'); }
    else if (t.url.startsWith('http:')) { icon = 'unlock'; text = 'Not secure'; el.classList.add('insecure'); }
    else if (t.url.startsWith('pelorus:')) icon = 'search';
    else if (t.url.startsWith('file:')) icon = 'page';
    el.innerHTML = Icons.svg(icon) + (text ? `<span class="txt">${text}</span>` : '');
    el.title = text ? 'This connection is not encrypted' : (t && t.url.startsWith('https:') ? 'Connection is encrypted (HTTPS)' : '');
  }

  function renderToolbar(s) {
    const t = activeTab();
    $('back').disabled = !t || !t.canGoBack;
    $('forward').disabled = !t || !t.canGoForward;
    const r = $('reload');
    Icons.set(r, t && t.loading ? 'stop' : 'reload');
    r.setAttribute('aria-label', t && t.loading ? 'Stop' : 'Reload');
    siteInfo(t);
    if (!omniFocused) $('omni').value = t ? displayUrl(t.url) : '';
    const b = $('bookmark');
    b.setAttribute('aria-pressed', String(!!s.bookmarked));
    b.disabled = !t || !/^https?:/.test(t.url);
    const n = t ? t.blocked : 0;
    const sn = $('shield-n'); sn.hidden = !n; sn.textContent = n > 99 ? '99+' : n;
    $('shield').setAttribute('aria-label', `Privacy: ${n} request${n === 1 ? '' : 's'} blocked on this page`);
    $('split').setAttribute('aria-pressed', String(s.splitId != null));
  }

  // ---------- address bar ----------
  const omni = $('omni');
  function rect() { const r = $('omni-form').getBoundingClientRect(); return { x: r.left, y: r.bottom + 4, width: r.width }; }
  function showSuggestions() {
    if (!suggestions.length) return api.invoke('omnibox:hide');
    api.invoke('omnibox:render', { selected: sel, rect: rect() });
  }
  async function onInput() {
    typed = omni.value;
    const mine = ++seq;
    if (!typed.trim()) { suggestions = []; sel = -1; return api.invoke('omnibox:hide'); }
    const items = await api.invoke('omnibox:suggest', typed);
    if (mine !== seq) return;
    suggestions = items; sel = -1; showSuggestions();
  }
  omni.addEventListener('focus', () => {
    omniFocused = true;
    const t = activeTab();
    omni.value = t && !t.url.startsWith('pelorus://newtab') ? (t.url.startsWith('pelorus://') ? displayUrl(t.url) : t.url) : '';
    omni.select();
    omni.setAttribute('aria-expanded', 'false');
  });
  omni.addEventListener('blur', () => {
    omniFocused = false;
    setTimeout(() => { if (!omniFocused) { api.invoke('omnibox:hide'); suggestions = []; sel = -1; renderToolbar(state); } }, 120);
  });
  omni.addEventListener('input', onInput);
  omni.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!suggestions.length) return;
      e.preventDefault();
      const n = suggestions.length;
      sel = e.key === 'ArrowDown' ? (sel + 1 >= n ? -1 : sel + 1) : (sel - 1 < -1 ? n - 1 : sel - 1);
      omni.value = sel >= 0 && suggestions[sel].type !== 'search' ? suggestions[sel].url : typed;
      showSuggestions();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (suggestions.length) { suggestions = []; sel = -1; api.invoke('omnibox:hide'); omni.value = typed; }
      else { const t = activeTab(); if (t) { omni.blur(); api.invoke('tab:activate', t.id); } }
    }
  });
  $('omni-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const chosen = sel >= 0 ? suggestions[sel] : null;
    if (chosen && chosen.type === 'tab' && chosen.tabId != null) { api.invoke('tab:activate', chosen.tabId); }
    else api.invoke('tab:navigate', { input: chosen ? chosen.url : omni.value });
    suggestions = []; sel = -1;
    omni.blur();
  });
  function focusAddress() { omni.focus(); omni.select(); }

  // ---------- buttons ----------
  $('back').addEventListener('click', () => api.invoke('tab:nav', { action: 'back' }));
  $('forward').addEventListener('click', () => api.invoke('tab:nav', { action: 'forward' }));
  $('reload').addEventListener('click', () => { const t = activeTab(); api.invoke('tab:nav', { action: t && t.loading ? 'stop' : 'reload' }); });
  $('bookmark').addEventListener('click', () => api.invoke('bookmark:toggle'));
  $('shield').addEventListener('click', () => api.invoke('cmd', 'privacy'));
  $('split').addEventListener('click', () => api.invoke('cmd', 'toggle-split'));
  $('palette').addEventListener('click', () => api.invoke('cmd', 'command-palette'));
  $('new-tab').addEventListener('click', () => api.invoke('tab:new', {}));
  $('collapse').addEventListener('click', () => api.invoke('sidebar:toggle'));
  document.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => api.invoke('cmd', b.dataset.cmd)));

  api.on('state', render);
  api.on('focus-address', focusAddress);
  api.invoke('shell:ready').then(render);
})();
