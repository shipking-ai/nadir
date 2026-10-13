// SPDX-License-Identifier: GPL-3.0-or-later
// Overlay renderer: address-bar suggestions, command palette, find bar, permission prompt, text prompt.
// Page-derived strings are only ever assigned through textContent.
(() => {
  'use strict';
  const api = window.nadir;
  const root = document.getElementById('root');
  let cleanup = null;

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const iconEl = (name) => { const s = el('span', 'ic'); Icons.set(s, name); return s; };
  const shortUrl = (u) => { try { const x = new URL(u); return x.host.replace(/^www\./, '') + (x.pathname === '/' ? '' : x.pathname); } catch { return u; } };

  function reset() { if (cleanup) { cleanup(); cleanup = null; } root.replaceChildren(); }

  // ---- omnibox suggestions ----
  const OMNI_ICON = { search: 'search', go: 'globe', tab: 'page', bookmark: 'star', history: 'history' };
  function omnibox({ items, selected }) {
    reset();
    const box = el('div', 'omni-list panel');
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', 'Suggestions');
    items.forEach((s, i) => {
      const row = el('div', 'row'); row.setAttribute('role', 'option'); row.id = `s${i}`;
      row.setAttribute('aria-selected', String(i === selected));
      const tx = el('div', 'tx');
      tx.append(el('span', 't', s.title));
      if (s.type !== 'search' && s.type !== 'go') tx.append(el('span', 'u', shortUrl(s.url)));
      row.append(iconEl(OMNI_ICON[s.type] || 'page'), tx);
      if (s.type === 'tab') row.append(el('span', 'tag', 'Switch to tab'));
      row.addEventListener('mousedown', (e) => { e.preventDefault(); api.invoke('omnibox:pick', i); });
      box.append(row);
    });
    root.append(box);
  }

  // ---- command palette ----
  const PAL_ICON = { tab: 'page', url: 'globe', workspace: 'user', command: 'command2', bookmark: 'star', history: 'history', search: 'search' };
  function palette() {
    reset();
    const scrim = el('div', 'scrim');
    const panel = el('div', 'panel palette'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Command palette');
    const field = el('div', 'field');
    const input = el('input'); input.type = 'text'; input.placeholder = 'Search tabs, history, bookmarks, commands…'; input.spellcheck = false;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-controls', 'pal-list'); input.setAttribute('aria-label', 'Command palette');
    field.append(iconEl('search'), input);
    const list = el('div', 'results'); list.id = 'pal-list'; list.setAttribute('role', 'listbox');
    panel.append(field, list); scrim.append(panel); root.append(scrim);
    let items = []; let sel = 0; let seq = 0;

    const paint = () => {
      list.replaceChildren();
      if (!items.length) { list.append(el('div', 'empty', 'No matches')); return; }
      items.forEach((r, i) => {
        const row = el('div', 'row'); row.id = `p${i}`; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(i === sel));
        let ic = iconEl(PAL_ICON[r.type] || 'page');
        if (r.type === 'workspace') { ic = el('span', 'ic'); const d = el('span', 'dot'); d.style.setProperty('--c', r.color); ic.append(d); }
        const tx = el('div', 'tx'); tx.append(el('span', 't', r.title)); if (r.subtitle) tx.append(el('span', 'u', r.subtitle));
        row.append(ic, tx); if (r.keys) row.append(el('kbd', null, r.keys));
        row.addEventListener('mousedown', (e) => { e.preventDefault(); api.invoke('palette:run', i); });
        list.append(row);
      });
      input.setAttribute('aria-activedescendant', `p${sel}`);
      list.children[sel]?.scrollIntoView({ block: 'nearest' });
    };
    const query = async () => { const mine = ++seq; const r = await api.invoke('palette:query', input.value); if (mine === seq) { items = r; sel = 0; paint(); } };
    input.addEventListener('input', query);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { sel = (sel + 1) % items.length; paint(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { sel = (sel - 1 + items.length) % items.length; paint(); } }
      else if (e.key === 'Enter') { e.preventDefault(); if (items.length) api.invoke('palette:run', sel); }
      else if (e.key === 'Escape') { e.preventDefault(); api.invoke('overlay:close'); }
    });
    scrim.addEventListener('mousedown', (e) => { if (e.target === scrim) api.invoke('overlay:close'); });
    input.focus(); query();
  }

  // ---- find bar ----
  function find() {
    reset();
    const bar = el('div', 'find panel');
    const input = el('input'); input.type = 'text'; input.placeholder = 'Find in page'; input.setAttribute('aria-label', 'Find in page'); input.spellcheck = false;
    const cnt = el('span', 'cnt', ''); cnt.setAttribute('aria-live', 'polite');
    const mk = (icon, label, fn) => { const b = el('button', 'ib'); b.setAttribute('aria-label', label); b.title = label; Icons.set(b, icon); b.addEventListener('click', fn); return b; };
    const go = (forward) => api.invoke('find:query', { text: input.value, forward, findNext: true });
    const prev = mk('back', 'Previous match', () => go(false)); prev.firstChild.style.setProperty('transform', 'rotate(90deg)');
    const next = mk('forward', 'Next match', () => go(true)); next.firstChild.style.setProperty('transform', 'rotate(90deg)');
    bar.append(input, cnt, prev, next, mk('close', 'Close find bar', () => api.invoke('find:close')));
    root.append(bar);
    input.addEventListener('input', () => { if (!input.value) cnt.textContent = ''; api.invoke('find:query', { text: input.value, forward: true, findNext: false }); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); go(!e.shiftKey); }
      else if (e.key === 'Escape') { e.preventDefault(); api.invoke('find:close'); }
    });
    const off = api.on('find:result', (r) => { cnt.textContent = input.value ? (r.total ? `${r.active}/${r.total}` : 'No results') : ''; });
    cleanup = off;
    input.focus();
  }

  // ---- permission prompt ----
  function permission({ origin, what, private: isPrivate }) {
    reset();
    const card = el('div', 'card panel perm'); card.setAttribute('role', 'alertdialog'); card.setAttribute('aria-label', 'Site permission request');
    const h = el('h2'); h.append(el('span', 'o', origin), document.createTextNode(` wants to ${what}`));
    const p = el('p', null, isPrivate ? 'Private tab: this choice is not saved.' : 'You can change this later in Settings → Privacy.');
    const rem = el('label'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = !isPrivate; cb.disabled = !!isPrivate;
    rem.append(cb, document.createTextNode('Remember for this workspace'));
    const block = el('button', 'btn', 'Block'); const allow = el('button', 'btn primary', 'Allow');
    const answer = (decision) => api.invoke('permission:answer', { decision, remember: cb.checked });
    block.addEventListener('click', () => answer('deny')); allow.addEventListener('click', () => answer('allow'));
    const btns = el('div', 'btns'); btns.append(rem, block, allow);
    card.append(h, p, btns); root.append(card);
    card.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); answer('deny'); } });
    block.focus(); // the safe choice has focus; Enter never grants by accident
  }

  // ---- text prompt ----
  function prompt({ title, placeholder, value }) {
    reset();
    const scrim = el('div', 'scrim');
    const card = el('form', 'card panel prompt'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', title);
    const input = el('input'); input.type = 'text'; input.placeholder = placeholder || ''; input.value = value || ''; input.maxLength = 40; input.setAttribute('aria-label', title);
    const cancel = el('button', 'btn', 'Cancel'); cancel.type = 'button';
    const ok = el('button', 'btn primary', 'Create'); ok.type = 'submit';
    const btns = el('div', 'btns'); btns.style.setProperty('justify-content', 'flex-end'); btns.append(cancel, ok);
    card.append(el('h2', null, title), input, btns); scrim.append(card); root.append(scrim);
    cancel.addEventListener('click', () => api.invoke('prompt:answer', { value: null }));
    card.addEventListener('submit', (e) => { e.preventDefault(); api.invoke('prompt:answer', { value: input.value }); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); api.invoke('prompt:answer', { value: null }); } });
    scrim.addEventListener('mousedown', (e) => { if (e.target === scrim) api.invoke('prompt:answer', { value: null }); });
    input.focus(); input.select();
  }

  const KINDS = { omnibox, palette, find, permission, prompt };
  api.on('overlay:render', ({ kind, data }) => { (KINDS[kind] || reset)(data || {}); });
  api.invoke('overlay:ready');
})();
