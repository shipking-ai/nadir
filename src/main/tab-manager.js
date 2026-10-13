// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { EventEmitter } = require('node:events');
const { TabHost } = require('./tab-host');
const { resolveInput, isInternalUrl } = require('../shared/urls');

const NEWTAB = 'nadir://newtab/';
const PRIVATE = 'private';
const MAX_CLOSED = 25;

/**
 * Owns tabs, workspaces, sleeping, split view and session (de)serialisation.
 * Talks to the engine only through TabHost.
 *
 * Emits: 'state' (debounced), 'view-added' (so the window can keep the overlay on top),
 *        'fullscreen' bool, 'focus-address', 'command' string (commands the manager can't run itself)
 */
class TabManager extends EventEmitter {
  /**
   * @param {object} o
   * @param {Electron.BrowserWindow} o.win
   * @param {import('./store').Store} o.store
   * @param {(workspaceId:string, kind:'web'|'internal') => Electron.Session} o.getSession
   * @param {string} o.internalPreload
   * @param {import('./blocker').Blocker} o.blocker
   * @param {() => object} [o.getSettings] cached settings accessor (avoids a DB read per call)
   */
  constructor(o) {
    super();
    this.o = o;
    this.tabs = new Map();
    this.order = [];
    this.nextId = 1;
    this.currentWorkspace = 'default';
    this.activeBy = new Map();
    this.splitId = null;
    this.closed = [];
    this.bounds = { x: 0, y: 0, width: 800, height: 600 };
    this.fullscreen = false;
    this._dirty = false;
    this._blocked = new Map();
    this._flush = setInterval(() => this._flushBlocked(), 5000);
    this._flush.unref?.();
  }

  // ---- queries ----------------------------------------------------------------------------
  get(id) { return this.tabs.get(id); }
  active() { return this.tabs.get(this.activeBy.get(this.currentWorkspace)); }
  inWorkspace(ws = this.currentWorkspace) { return this.order.map((id) => this.tabs.get(id)).filter((t) => t.workspaceId === ws); }
  byWebContentsId(id) {
    for (const t of this.tabs.values()) if (t.host && !t.host.destroyed && t.host.wc.id === id) return t;
    return null;
  }
  isTabContents(wc) { return !!this.byWebContentsId(wc.id) && this.byWebContentsId(wc.id).kind === 'web'; }
  settings() { return this.o.getSettings ? this.o.getSettings() : this.o.store.settings(); }

  snapshot() {
    const pub = (t) => ({
      id: t.id, workspaceId: t.workspaceId, url: t.url, title: t.title, favicon: t.favicon, loading: t.loading,
      audible: t.audible, pinned: t.pinned, sleeping: t.sleeping, blocked: t.blocked, kind: t.kind, crashed: t.crashed,
      canGoBack: t.canGoBack, canGoForward: t.canGoForward, zoom: t.zoom,
    });
    const workspaces = this.o.store.workspaces().map((w) => ({ ...w, tabs: this.inWorkspace(w.id).length }));
    const privateTabs = this.inWorkspace(PRIVATE).length;
    if (privateTabs) workspaces.push({ id: PRIVATE, name: 'Private', color: '#9aa1ad', ephemeral: true, tabs: privateTabs });
    const a = this.active();
    return {
      currentWorkspace: this.currentWorkspace,
      activeId: a ? a.id : null,
      splitId: this.splitId,
      tabs: this.inWorkspace().map(pub),
      workspaces,
      bookmarked: a ? this.o.store.isBookmarked(a.url) : false,
      sidebarCollapsed: this.settings().sidebarCollapsed,
      fullscreen: this.fullscreen,
      ...(this.o.extraState ? this.o.extraState() : {}),
    };
  }

  _changed() {
    if (this._dirty) return;
    this._dirty = true;
    setTimeout(() => { this._dirty = false; this.emit('state', this.snapshot()); }, 16);
  }

  // ---- layout -----------------------------------------------------------------------------
  setContentBounds(b) { this.bounds = b; this.layout(); }
  setFullscreen(v) { this.fullscreen = v; this.layout(); this.emit('fullscreen', v); }

  layout() {
    const a = this.active();
    const split = this.splitId != null ? this.tabs.get(this.splitId) : null;
    const showSplit = split && split.workspaceId === this.currentWorkspace && split.id !== a?.id && !split.sleeping;
    const b = this.bounds;
    const gap = 6;
    for (const t of this.tabs.values()) {
      if (!t.host) continue;
      let visible = false;
      let box = b;
      if (a && t.id === a.id) {
        visible = true;
        box = showSplit ? { ...b, width: Math.floor((b.width - gap) / 2) } : b;
      } else if (showSplit && t.id === split.id) {
        const w = Math.floor((b.width - gap) / 2);
        visible = true;
        box = { ...b, x: b.x + w + gap, width: b.width - w - gap };
      }
      if (visible) t.host.setBounds(box);
      t.host.setVisible(visible);
    }
  }

  // ---- creation / destruction -------------------------------------------------------------
  /**
   * @param {{url?:string, workspaceId?:string, background?:boolean, afterId?:number, pinned?:boolean, sleeping?:boolean, title?:string, favicon?:string}} [opts]
   */
  createTab(opts = {}) {
    const url = opts.url || NEWTAB;
    const workspaceId = opts.workspaceId || this.currentWorkspace;
    const tab = {
      id: this.nextId++, workspaceId, url, title: opts.title || '', favicon: opts.favicon || '', loading: false, audible: false,
      pinned: !!opts.pinned, sleeping: false, blocked: 0, kind: isInternalUrl(url) ? 'internal' : 'web', host: null,
      canGoBack: false, canGoForward: false, zoom: 1, lastActive: Date.now(), crashed: false,
    };
    this.tabs.set(tab.id, tab);
    const at = opts.afterId != null ? this.order.indexOf(opts.afterId) : -1;
    if (at >= 0) this.order.splice(at + 1, 0, tab.id); else this.order.push(tab.id);
    if (opts.sleeping) tab.sleeping = true; else this._attach(tab);
    if (!opts.background) this.activate(tab.id);
    else this._changed();
    return tab.id;
  }

  _attach(tab) {
    const { win, getSession, internalPreload } = this.o;
    tab.kind = isInternalUrl(tab.url) ? 'internal' : 'web';
    const host = new TabHost({
      kind: tab.kind,
      session: getSession(tab.kind === 'internal' ? 'internal' : tab.workspaceId, tab.kind),
      preload: tab.kind === 'internal' ? internalPreload : undefined,
    });
    tab.host = host;
    tab.sleeping = false;
    win.contentView.addChildView(host.view);
    try { host.view.setBorderRadius(8); } catch { /* older Electron */ }
    this.emit('view-added');

    const upd = (patch) => { Object.assign(tab, patch); this._changed(); };
    host.on('loading', (v) => upd({ loading: v, ...host.navState() }));
    host.on('nav-start', () => upd({ blocked: 0, crashed: false }));
    host.on('navigated', ({ url, inPage }) => {
      upd({ url, ...host.navState() });
      if (!isInternalUrl(url) && tab.workspaceId !== PRIVATE) this.o.store.addVisit({ workspaceId: tab.workspaceId, url, title: tab.title });
      if (!inPage) this.emit('navigated', tab);
    });
    host.on('title', (title) => {
      upd({ title });
      if (tab.workspaceId !== PRIVATE) this.o.store.updateTitle({ workspaceId: tab.workspaceId, url: tab.url, title });
    });
    host.on('favicon', (favicon) => upd({ favicon }));
    host.on('audio', (audible) => upd({ audible }));
    host.on('zoom', (zoom) => upd({ zoom }));
    host.on('crashed', () => upd({ crashed: true, loading: false }));
    host.on('fullscreen', (v) => { if (this.active()?.id === tab.id) this.setFullscreen(v); });
    host.on('fail', (info) => {
      const httpOrigin = this.o.blocker.takeUpgradeOrigin(info.url);
      host.showError({ ...info, httpFallback: httpOrigin || undefined });
      upd({ loading: false, title: info.url });
    });
    host.on('allow-http', (url) => {
      this.o.blocker.allowHttp(new URL(url).hostname);
      host.loadURL(url);
    });
    host.on('open-url', ({ url, background, replace }) => {
      if (replace) return this.navigate(tab.id, url);
      this.createTab({ url, background, afterId: tab.id, workspaceId: tab.workspaceId });
    });
    host.on('search', (q) => this.createTab({ url: this._searchUrl(q), afterId: tab.id, workspaceId: tab.workspaceId }));
    host.on('command', (cmd) => this.emit('command', cmd));
    host.on('found', (r) => this.emit('found', r));
    host.loadURL(tab.url);
  }

  _detach(tab) {
    if (!tab.host) return;
    try { this.o.win.contentView.removeChildView(tab.host.view); } catch { /* window closing */ }
    tab.host.destroy();
    tab.host = null;
  }

  closeTab(id) {
    const tab = this.tabs.get(id);
    if (!tab) return;
    if (!isInternalUrl(tab.url) && tab.workspaceId !== PRIVATE && /^https?:/i.test(tab.url)) {
      this.closed.push({ url: tab.url, title: tab.title, workspaceId: tab.workspaceId });
      if (this.closed.length > MAX_CLOSED) this.closed.shift();
    }
    const siblings = this.inWorkspace(tab.workspaceId);
    const idx = siblings.findIndex((t) => t.id === id);
    const wasActive = this.activeBy.get(tab.workspaceId) === id;
    this._detach(tab);
    this.tabs.delete(id);
    this.order = this.order.filter((x) => x !== id);
    if (this.splitId === id) this.splitId = null;
    this.emit('closed', id);
    if (!wasActive) return this._changed();
    const next = siblings[idx + 1] || siblings[idx - 1];
    if (next && next.id !== id) this.activate(next.id);
    else {
      this.activeBy.delete(tab.workspaceId);
      if (tab.workspaceId === PRIVATE) this.switchWorkspace(this.o.store.workspaces()[0].id);
      else this.createTab({ workspaceId: tab.workspaceId });
    }
  }

  reopenClosed() {
    const c = this.closed.pop();
    if (c) this.createTab({ url: c.url, workspaceId: c.workspaceId });
  }

  // ---- activation / workspaces ------------------------------------------------------------
  activate(id, { focusContent = true } = {}) {
    const tab = this.tabs.get(id);
    if (!tab) return;
    if (tab.workspaceId !== this.currentWorkspace) this.currentWorkspace = tab.workspaceId;
    if (tab.sleeping || !tab.host) this._attach(tab);
    tab.lastActive = Date.now();
    this.activeBy.set(tab.workspaceId, id);
    if (this.splitId === id) this.splitId = null;
    this.layout();
    if (focusContent && tab.host && !(tab.url === NEWTAB)) tab.host.focus();
    if (tab.url === NEWTAB) this.emit('focus-address');
    this._changed();
  }

  activateIndex(n) {
    const list = this.inWorkspace();
    const t = n === 'last' ? list[list.length - 1] : list[n - 1];
    if (t) this.activate(t.id);
  }
  cycle(dir) {
    const list = this.inWorkspace();
    if (list.length < 2) return;
    const i = list.findIndex((t) => t.id === this.active()?.id);
    this.activate(list[(i + dir + list.length) % list.length].id);
  }

  switchWorkspace(wsId) {
    const known = this.o.store.workspaces().some((w) => w.id === wsId) || (wsId === PRIVATE && this.inWorkspace(PRIVATE).length);
    if (!known) return;
    this.currentWorkspace = wsId;
    this.splitId = null;
    const last = this.activeBy.get(wsId);
    const list = this.inWorkspace(wsId);
    if (last && this.tabs.has(last)) this.activate(last);
    else if (list.length) this.activate(list[0].id);
    else this.createTab({ workspaceId: wsId });
  }

  newPrivateTab(url) { this.currentWorkspace = PRIVATE; this.createTab({ url, workspaceId: PRIVATE }); }

  setPinned(id, pinned) {
    const t = this.tabs.get(id);
    if (!t) return;
    t.pinned = !!pinned;
    // pinned tabs sort to the front of their workspace
    const ws = this.inWorkspace(t.workspaceId);
    const rest = this.order.filter((x) => this.tabs.get(x).workspaceId !== t.workspaceId);
    const sorted = [...ws.filter((x) => x.pinned), ...ws.filter((x) => !x.pinned)].map((x) => x.id);
    this.order = [...rest, ...sorted];
    this._changed();
  }

  /** Moving across workspaces changes the storage partition, so the page is unloaded and reloaded lazily. */
  moveToWorkspace(id, wsId) {
    const t = this.tabs.get(id);
    if (!t || t.workspaceId === wsId || !this.o.store.workspaces().some((w) => w.id === wsId)) return;
    const old = t.workspaceId;
    const wasActive = this.activeBy.get(old) === id;
    this._detach(t);
    t.workspaceId = wsId;
    t.sleeping = true;
    if (this.splitId === id) this.splitId = null;
    if (wasActive) {
      const next = this.inWorkspace(old).find((x) => x.id !== id);
      if (next) this.activate(next.id);
      else { this.activeBy.delete(old); this.createTab({ workspaceId: old }); }
    }
    this._changed();
  }

  reorder(id, beforeId) {
    const t = this.tabs.get(id);
    if (!t || id === beforeId) return;
    this.order = this.order.filter((x) => x !== id);
    const at = beforeId == null ? -1 : this.order.indexOf(beforeId);
    if (at >= 0) this.order.splice(at, 0, id); else this.order.push(id);
    this._changed();
  }

  toggleSplit() {
    if (this.splitId != null) { this.splitId = null; return this.layout(), this._changed(); }
    const list = this.inWorkspace();
    const i = list.findIndex((t) => t.id === this.active()?.id);
    const other = list[(i + 1) % list.length];
    if (!other || other.id === this.active()?.id) { this.createTab({ background: true, afterId: this.active()?.id }); return this.toggleSplit(); }
    if (other.sleeping) this._attach(other);
    this.splitId = other.id;
    this.layout();
    this._changed();
  }

  // ---- navigation -------------------------------------------------------------------------
  _searchUrl(q) {
    const s = this.settings();
    const p = s.searchProviders[s.searchProvider];
    const tpl = p && p.url && p.url.includes('%s') ? p.url : s.searchProviders.duckduckgo.url;
    return tpl.replace('%s', encodeURIComponent(q));
  }

  /** @returns {{ok:boolean, reason?:string}} */
  navigate(id, input) {
    const tab = this.tabs.get(id);
    if (!tab) return { ok: false, reason: 'No such tab' };
    const s = this.settings();
    const p = s.searchProviders[s.searchProvider];
    const tpl = p && p.url && p.url.includes('%s') ? p.url : s.searchProviders.duckduckgo.url;
    const r = resolveInput(input, tpl);
    if (r.kind === 'empty') return { ok: false };
    if (r.kind === 'blocked') return { ok: false, reason: r.reason };
    const wantKind = isInternalUrl(r.url) ? 'internal' : 'web';
    tab.url = r.url;
    if (tab.sleeping || !tab.host) { this._attach(tab); return { ok: true }; }
    if (tab.kind !== wantKind) {
      // Different trust level: swap the renderer so web content never inherits internal privileges (or vice versa).
      this._detach(tab);
      this._attach(tab);
      this.layout();
    } else {
      tab.host.loadURL(r.url);
    }
    this._changed();
    return { ok: true };
  }

  // ---- sleeping ---------------------------------------------------------------------------
  sleep(id) {
    const t = this.tabs.get(id);
    if (!t || t.sleeping || !t.host) return false;
    if (id === this.active()?.id || id === this.splitId || t.audible) return false;
    this._detach(t);
    t.sleeping = true;
    t.loading = false;
    this._changed();
    return true;
  }
  sleepOthers() { for (const t of this.tabs.values()) this.sleep(t.id); }
  sleepIdle(minutes) {
    if (!(minutes > 0)) return 0;
    const cutoff = Date.now() - minutes * 60000;
    let n = 0;
    for (const t of this.tabs.values()) if (t.lastActive < cutoff && this.sleep(t.id)) n++;
    return n;
  }

  // ---- blocked-request accounting ---------------------------------------------------------
  addBlocked({ tabId, host, count }) {
    const t = this.tabs.get(tabId);
    if (t) { t.blocked += count; this._changed(); }
    this._blocked.set(host, (this._blocked.get(host) || 0) + count);
  }
  _flushBlocked() {
    for (const [host, n] of this._blocked) { try { this.o.store.addBlocked(host, n); } catch { /* db closing */ } }
    this._blocked.clear();
  }

  // ---- session ----------------------------------------------------------------------------
  serialize() {
    return {
      v: 1,
      currentWorkspace: this.currentWorkspace === PRIVATE ? 'default' : this.currentWorkspace,
      active: Object.fromEntries([...this.activeBy].filter(([w]) => w !== PRIVATE)),
      tabs: this.order.map((id) => this.tabs.get(id)).filter((t) => t.workspaceId !== PRIVATE && /^https?:|^nadir:/i.test(t.url))
        .map((t) => ({ ref: t.id, url: t.url, title: t.title, favicon: t.favicon, pinned: t.pinned, workspaceId: t.workspaceId })),
    };
  }

  /** Recreate tabs lazily: only the active tab per workspace actually loads. */
  restore(data) {
    if (!data || data.v !== 1 || !Array.isArray(data.tabs) || !data.tabs.length) return false;
    const known = new Set(this.o.store.workspaces().map((w) => w.id));
    const idMap = new Map();
    for (const t of data.tabs.slice(0, 500)) {
      if (!known.has(t.workspaceId) || typeof t.url !== 'string') continue;
      idMap.set(t.ref, this.createTab({ url: t.url, title: t.title, favicon: t.favicon, pinned: t.pinned, workspaceId: t.workspaceId, background: true, sleeping: true }));
    }
    if (!idMap.size) return false;
    for (const [ws, ref] of Object.entries(data.active || {})) if (idMap.has(ref)) this.activeBy.set(ws, idMap.get(ref));
    const ws = known.has(data.currentWorkspace) ? data.currentWorkspace : 'default';
    this.currentWorkspace = ws;
    const act = this.activeBy.get(ws) ?? this.inWorkspace(ws)[0]?.id;
    if (act != null) this.activate(act);
    else this.createTab({ workspaceId: ws });
    return true;
  }

  dispose() {
    clearInterval(this._flush);
    this._flushBlocked();
    for (const t of this.tabs.values()) this._detach(t);
  }

  // ---- commands ---------------------------------------------------------------------------
  /** Run a browser command. Returns true if handled here; false means the caller (main) must handle it. */
  exec(cmd) {
    const a = this.active();
    switch (cmd) {
      case 'new-tab': this.createTab({ afterId: a?.id }); return true;
      case 'close-tab': if (a) this.closeTab(a.id); return true;
      case 'reopen-tab': this.reopenClosed(); return true;
      case 'reload': a?.host?.reload(false); return true;
      case 'reload-hard': a?.host?.reload(true); return true;
      case 'back': a?.host?.back(); return true;
      case 'forward': a?.host?.forward(); return true;
      case 'next-tab': this.cycle(1); return true;
      case 'prev-tab': this.cycle(-1); return true;
      case 'tab-last': this.activateIndex('last'); return true;
      case 'toggle-split': this.toggleSplit(); return true;
      case 'sleep-tab': {
        if (!a) return true;
        const other = this.inWorkspace().find((t) => t.id !== a.id);
        const target = a.id;
        this.activate(other ? other.id : this.createTab({ background: true }));
        this.sleep(target);
        return true;
      }
      case 'sleep-others': this.sleepOthers(); return true;
      case 'zoom-in': a?.host?.zoom(0.1); return true;
      case 'zoom-out': a?.host?.zoom(-0.1); return true;
      case 'zoom-reset': a?.host?.zoom(0); return true;
      case 'devtools': a?.host?.devtools(); return true;
      case 'history': case 'bookmarks': case 'downloads': case 'settings': case 'privacy':
        this.openInternal(cmd); return true;
      case 'home': if (a) this.navigate(a.id, NEWTAB); return true;
      default:
        if (/^tab-[1-8]$/.test(cmd)) { this.activateIndex(Number(cmd.slice(4))); return true; }
        return false;
    }
  }

  /** Open (or focus) an internal page in the current workspace. */
  openInternal(page) {
    const url = `nadir://app/#/${page}`;
    const existing = this.inWorkspace().find((t) => t.url.startsWith('nadir://app/'));
    if (existing) { this.navigate(existing.id, url); this.activate(existing.id); } else this.createTab({ url });
  }
}

module.exports = { TabManager, NEWTAB, PRIVATE };
