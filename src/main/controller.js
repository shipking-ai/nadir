// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const path = require('node:path');
const { BrowserWindow, WebContentsView, Menu, nativeTheme, app, dialog } = require('electron');
const { TabManager, NEWTAB, PRIVATE } = require('./tab-manager');
const { commandForInput, COMMANDS } = require('../shared/shortcuts');
const { rank } = require('../shared/fuzzy');
const { displayHost, resolveInput } = require('../shared/urls');
const { omniboxSuggestions } = require('./suggest');
const { describe } = require('./permissions');

const TOOLBAR_H = 44;
const SIDEBAR_W = 252;
const SIDEBAR_W_COLLAPSED = 56;
const GUTTER = 8;
const isMac = process.platform === 'darwin';
const WS_COLORS = ['#8bd3a8', '#8fb8e8', '#e5c07b', '#d9a0c8', '#e8837a', '#9ad0d6', '#b7a6e8'];

const THEME = {
  dark: { bar: '#101114', symbol: '#e7e9ee' },
  light: { bar: '#ecebe7', symbol: '#1c1e23' },
};

/**
 * Owns the one browser window: the chrome renderer (toolbar/sidebar), the tab views, and a
 * transparent overlay view that sits on top for menus, suggestions, the command palette,
 * find bar and permission prompts (native views cannot be drawn over by the chrome renderer).
 */
class Controller {
  constructor({ store, blocker, downloads, broker, sessions, uiDir, userDataDir }) {
    this.store = store;
    this.blocker = blocker;
    this.downloads = downloads;
    this.broker = broker;
    this.sessions = sessions;
    this.uiDir = uiDir;
    this.userDataDir = userDataDir;
    this.cfg = store.settings();
    this.ov = { kind: null, rect: null };
    this.lastSuggestions = [];
    this.lastPalette = [];
    this.permQueue = [];
    this.permCurrent = null;
    this.promptCurrent = null;
    this.chromeReady = false;
    this.overlayReady = false;
  }

  settings() { return this.cfg; }
  setSetting(key, value) {
    this.store.setSetting(key, value);
    this.cfg = this.store.settings();
    this.applySetting(key);
    this.broadcastSettings(key);
  }

  // ---- window --------------------------------------------------------------------------
  create() {
    const isDark = nativeTheme.shouldUseDarkColors;
    const t = isDark ? THEME.dark : THEME.light;
    const win = new BrowserWindow({
      width: 1440, height: 900, minWidth: 760, minHeight: 480, show: false, title: 'Pelorus', backgroundColor: t.bar,
      titleBarStyle: 'hidden',
      ...(isMac ? { trafficLightPosition: { x: 14, y: 14 } } : { titleBarOverlay: { color: t.bar, symbolColor: t.symbol, height: TOOLBAR_H } }),
      webPreferences: {
        preload: path.join(this.uiDir, 'assets', 'preload-chrome.js'),
        sandbox: true, contextIsolation: true, nodeIntegration: false, webviewTag: false, spellcheck: false,
      },
    });
    this.win = win;
    win.setMenuBarVisibility(false);
    win.removeMenu?.();

    this.tabs = new TabManager({
      win, store: this.store, blocker: this.blocker, getSettings: () => this.cfg,
      extraState: () => ({ downloadsActive: this.downloads.items.size }),
      getSession: (ws, kind) => this.sessions.getSession(ws, kind),
      internalPreload: path.join(this.uiDir, 'assets', 'preload-internal.js'),
    });
    this.blocker.o.lookupTab = (wcId) => { const tb = this.tabs.byWebContentsId(wcId); return tb ? { tabId: tb.id, workspaceId: tb.workspaceId } : null; };
    this.blocker.o.isTabContents = (wc) => this.tabs.isTabContents(wc);
    this.blocker.o.onBlocked = (b) => this.tabs.addBlocked(b);

    // overlay view (always on top)
    this.overlay = new WebContentsView({
      webPreferences: {
        preload: path.join(this.uiDir, 'assets', 'preload-chrome.js'),
        sandbox: true, contextIsolation: true, nodeIntegration: false, webviewTag: false,
      },
    });
    this.overlay.setBackgroundColor('#00000000');
    this.overlay.setVisible(false);
    win.contentView.addChildView(this.overlay);

    for (const wc of [win.webContents, this.overlay.webContents]) {
      wc.on('before-input-event', (e, input) => {
        const cmd = commandForInput(input, isMac);
        if (cmd) { e.preventDefault(); this.runCommand(cmd); }
      });
      wc.on('will-navigate', (e) => e.preventDefault());
      wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    }

    this.tabs.on('state', (snap) => { if (this.chromeReady && !win.isDestroyed()) win.webContents.send('pelorus:state', snap); this._saveSoon(); });
    this.tabs.on('view-added', () => win.contentView.addChildView(this.overlay)); // keep overlay on top
    this.tabs.on('command', (c) => this.runCommand(c));
    this.tabs.on('focus-address', () => this.send('focus-address'));
    this.tabs.on('found', (r) => { if (this.ov.kind === 'find') this.overlay.webContents.send('pelorus:find:result', { active: r.activeMatchOrdinal, total: r.matches }); });
    this.tabs.on('fullscreen', (v) => { win.setFullScreen(v); setTimeout(() => this.layout(), 50); });
    this.tabs.on('closed', (id) => this.cancelPermissionsFor(id));
    this.tabs.on('navigated', (tab) => this.cancelPermissionsFor(tab.id));

    win.on('resize', () => this.layout());
    win.on('maximize', () => this.layout());
    win.on('unmaximize', () => this.layout());
    win.on('enter-full-screen', () => this.layout());
    win.on('leave-full-screen', () => this.layout());
    win.on('closed', () => { this.win = null; });
    nativeTheme.on('updated', () => this.applyTheme());

    win.loadURL('pelorus://shell/');
    this.overlay.webContents.loadURL('pelorus://overlay/');
    this.layout();
    this.applyTheme();
    this.sleepTimer = setInterval(() => this.tabs.sleepIdle(this.cfg.tabSleepMinutes), 60000);
    this.sleepTimer.unref?.();
    return win;
  }

  send(channel, data) { if (this.win && !this.win.isDestroyed()) this.win.webContents.send(`pelorus:${channel}`, data); }

  // ---- layout ---------------------------------------------------------------------------
  sidebarWidth() { return this.cfg.sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W; }
  layout() {
    if (!this.win || this.win.isDestroyed()) return;
    const [w, h] = this.win.getContentSize();
    const fs = this.win.isFullScreen() && this.tabs.fullscreen;
    const sw = this.sidebarWidth();
    this.tabs.setContentBounds(fs
      ? { x: 0, y: 0, width: w, height: h }
      : { x: sw, y: TOOLBAR_H, width: Math.max(100, w - sw - GUTTER), height: Math.max(100, h - TOOLBAR_H - GUTTER) });
    if (this.ov.kind) this.overlay.setBounds(this.ov.rect || { x: 0, y: 0, width: w, height: h });
  }

  // ---- overlay --------------------------------------------------------------------------
  showOverlay(kind, { rect = null, data = null, focus = false } = {}) {
    const [w, h] = this.win.getContentSize();
    this.ov = { kind, rect };
    this.win.contentView.addChildView(this.overlay);
    this.overlay.setBounds(rect || { x: 0, y: 0, width: w, height: h });
    this.overlay.setVisible(true);
    this.overlay.webContents.send('pelorus:overlay:render', { kind, data });
    if (focus) this.overlay.webContents.focus();
  }
  hideOverlay({ restoreFocus = true } = {}) {
    if (!this.ov.kind) return;
    const kind = this.ov.kind;
    this.ov = { kind: null, rect: null };
    this.overlay.setVisible(false);
    this.overlay.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    if (kind === 'find') this.tabs.active()?.host?.stopFind();
    if (restoreFocus && kind !== 'omnibox') this.tabs.active()?.host?.focus();
    if (kind === 'permission') this.permCurrent = null;
    this._pumpPermissions();
  }
  isOverlay(kind) { return this.ov.kind === kind; }

  // ---- omnibox --------------------------------------------------------------------------
  searchTemplate() {
    const s = this.cfg;
    const p = s.searchProviders[s.searchProvider];
    return p && p.url.includes('%s') ? { url: p.url, name: p.name } : { url: s.searchProviders.duckduckgo.url, name: s.searchProviders.duckduckgo.name };
  }
  suggest(text) {
    const st = this.searchTemplate();
    const tabs = [...this.tabs.tabs.values()].map((t) => ({ id: t.id, workspaceId: t.workspaceId, title: t.title, url: t.url }));
    this.lastSuggestions = omniboxSuggestions({ text, store: this.store, tabs, workspaceId: this.tabs.currentWorkspace, searchTemplate: st.url, searchName: st.name });
    return this.lastSuggestions;
  }
  renderOmnibox({ selected, rect }) {
    if (!this.lastSuggestions.length) return this.hideOverlay({ restoreFocus: false });
    const r = this._clampRect(rect, this.lastSuggestions.length * 40 + 12);
    this.showOverlay('omnibox', { rect: r, data: { items: this.lastSuggestions.map((s) => ({ type: s.type, title: s.title, url: s.url })), selected } });
  }
  pickSuggestion(i) {
    const s = this.lastSuggestions[i];
    this.hideOverlay({ restoreFocus: false });
    if (!s) return;
    if (s.type === 'tab' && s.tabId != null && this.tabs.get(s.tabId)) return this.tabs.activate(s.tabId);
    const a = this.tabs.active();
    if (a) { this.tabs.navigate(a.id, s.url); a.host?.focus(); }
  }
  _clampRect(r, height) {
    const [w] = this.win.getContentSize();
    const x = Math.max(0, Math.min(Math.round(r.x), w - 200));
    return { x, y: Math.round(r.y), width: Math.min(Math.round(r.width), w - x), height };
  }

  // ---- palette --------------------------------------------------------------------------
  openPalette() {
    this.lastPalette = [];
    this.showOverlay('palette', { focus: true });
  }
  paletteResults(q) {
    q = String(q ?? '').slice(0, 200).trim();
    const out = [];
    const add = (display, action) => out.push({ display, action });
    const wsName = Object.fromEntries(this.store.workspaces().map((w) => [w.id, w.name]));
    const allTabs = [...this.tabs.tabs.values()];

    const cmds = rank(COMMANDS, q, [(c) => c.title], q ? 8 : 10);
    if (!q) {
      allTabs.slice().sort((a, b) => b.lastActive - a.lastActive).slice(0, 5)
        .forEach((t) => add({ type: 'tab', title: t.title || t.url, subtitle: `${wsName[t.workspaceId] || 'Private'} · ${displayHost(t.url)}` }, { kind: 'tab', id: t.id }));
    } else {
      const st = this.searchTemplate();
      const r = resolveInput(q, st.url);
      if (r.kind === 'url') add({ type: 'url', title: `Go to ${r.url}`, subtitle: '' }, { kind: 'url', url: r.url });
      rank(allTabs, q, [(t) => t.title, (t) => t.url], 5)
        .forEach((t) => add({ type: 'tab', title: t.title || t.url, subtitle: `Tab · ${wsName[t.workspaceId] || 'Private'}` }, { kind: 'tab', id: t.id }));
    }
    for (const w of rank(this.store.workspaces(), q, [(w) => w.name], 4)) {
      if (q) add({ type: 'workspace', title: `Switch to workspace: ${w.name}`, subtitle: '', color: w.color }, { kind: 'ws', id: w.id });
    }
    for (const c of cmds) add({ type: 'command', title: c.title, subtitle: '', keys: c.keys }, { kind: 'cmd', id: c.id });
    if (q) {
      for (const b of this.store.searchBookmarks(q, 4)) add({ type: 'bookmark', title: b.title, subtitle: displayHost(b.url) }, { kind: 'url', url: b.url });
      for (const h of this.store.searchHistory(q, { limit: 5 })) add({ type: 'history', title: h.title || displayHost(h.url), subtitle: displayHost(h.url) }, { kind: 'url', url: h.url });
      const st = this.searchTemplate();
      add({ type: 'search', title: `Search ${st.name} for “${q}”`, subtitle: '' }, { kind: 'url', url: st.url.replace('%s', encodeURIComponent(q)) });
    }
    this.lastPalette = out.map((o) => o.action);
    return out.slice(0, 14).map((o) => o.display);
  }
  runPalette(i) {
    const a = this.lastPalette[i];
    this.hideOverlay({ restoreFocus: false });
    if (!a) return;
    if (a.kind === 'tab') this.tabs.activate(a.id);
    else if (a.kind === 'ws') this.tabs.switchWorkspace(a.id);
    else if (a.kind === 'url') this.tabs.createTab({ url: a.url });
    else if (a.kind === 'cmd') setImmediate(() => this.runCommand(a.id));
  }

  // ---- commands -------------------------------------------------------------------------
  runCommand(cmd) {
    if (typeof cmd !== 'string') return;
    if (this.tabs.exec(cmd)) return;
    switch (cmd) {
      case 'focus-address': this.hideOverlay({ restoreFocus: false }); this.win.webContents.focus(); this.send('focus-address'); break;
      case 'command-palette': this.isOverlay('palette') ? this.hideOverlay() : this.openPalette(); break;
      case 'find': this.openFind(); break;
      case 'bookmark-toggle': this.toggleBookmark(); break;
      case 'toggle-sidebar': this.setSetting('sidebarCollapsed', !this.cfg.sidebarCollapsed); break;
      case 'new-workspace': this.createWorkspaceInteractive(); break;
      case 'new-private-tab': this.tabs.newPrivateTab(); break;
      case 'clear-data': this.tabs.openInternal('privacy'); break;
      default: break;
    }
  }

  openFind() {
    const a = this.tabs.active();
    if (!a || a.kind !== 'web' || !a.host) return;
    const [w] = this.win.getContentSize();
    this.showOverlay('find', { rect: { x: Math.max(0, w - 392), y: TOOLBAR_H + 2, width: 380, height: 46 }, focus: true });
  }

  toggleBookmark() {
    const a = this.tabs.active();
    if (!a || !/^https?:/i.test(a.url)) return;
    if (this.store.isBookmarked(a.url)) this.store.removeBookmark(a.url);
    else this.store.addBookmark({ url: a.url, title: a.title || a.url });
    this.tabs._changed();
  }

  async createWorkspaceInteractive() {
    const name = await this.promptText({ title: 'New workspace', placeholder: 'Name (e.g. Research, Work)' });
    if (!name) return;
    this.createWorkspace(name);
  }
  createWorkspace(name) {
    const n = String(name).trim().slice(0, 40);
    if (!n) return null;
    const id = `ws${Date.now().toString(36)}`;
    const color = WS_COLORS[this.store.workspaces().length % WS_COLORS.length];
    this.store.addWorkspace({ id, name: n, color });
    this.tabs.switchWorkspace(id);
    return id;
  }

  promptText({ title, placeholder = '', value = '' }) {
    return new Promise((resolve) => {
      this.promptCurrent?.resolve(null);
      this.promptCurrent = { resolve };
      this.showOverlay('prompt', { data: { title, placeholder, value }, focus: true });
    });
  }
  answerPrompt(value) {
    const p = this.promptCurrent;
    this.promptCurrent = null;
    this.hideOverlay();
    p?.resolve(typeof value === 'string' ? value : null);
  }

  // ---- permission prompts ---------------------------------------------------------------
  askPermission({ tabId, origin, key }) {
    return new Promise((resolve) => {
      this.permQueue.push({ tabId, origin, key, resolve });
      this._pumpPermissions();
    });
  }
  _pumpPermissions() {
    if (this.permCurrent || !this.permQueue.length || !this.win) return;
    if (this.ov.kind && this.ov.kind !== 'omnibox') return; // wait for palette/find/etc. to close
    const req = this.permQueue.shift();
    if (!this.tabs.get(req.tabId)) { req.resolve({ decision: 'deny', remember: false }); return this._pumpPermissions(); }
    this.permCurrent = req;
    const [w] = this.win.getContentSize();
    this.showOverlay('permission', {
      rect: { x: Math.max(0, w - 436), y: TOOLBAR_H + 2, width: 424, height: 156 },
      data: { origin: req.origin, what: describe(req.key), private: this.tabs.get(req.tabId)?.workspaceId === PRIVATE },
    });
  }
  answerPermission({ decision, remember }) {
    const cur = this.permCurrent;
    if (!cur) return;
    this.permCurrent = null;
    this.hideOverlay({ restoreFocus: true });
    cur.resolve({ decision: decision === 'allow' ? 'allow' : 'deny', remember: !!remember });
  }
  cancelPermissionsFor(tabId) {
    this.permQueue = this.permQueue.filter((r) => { if (r.tabId === tabId) { r.resolve({ decision: 'deny', remember: false }); return false; } return true; });
    if (this.permCurrent && this.permCurrent.tabId === tabId) { const c = this.permCurrent; this.permCurrent = null; this.hideOverlay({ restoreFocus: false }); c.resolve({ decision: 'deny', remember: false }); }
  }

  // ---- native menus ---------------------------------------------------------------------
  tabMenu(id) {
    const t = this.tabs.get(id);
    if (!t) return;
    const others = this.store.workspaces().filter((w) => w.id !== t.workspaceId);
    Menu.buildFromTemplate([
      { label: 'Reload', click: () => t.host?.reload(false), enabled: !!t.host },
      { label: 'Duplicate', click: () => this.tabs.createTab({ url: t.url, afterId: t.id, workspaceId: t.workspaceId }) },
      { label: t.pinned ? 'Unpin tab' : 'Pin tab', click: () => this.tabs.setPinned(id, !t.pinned) },
      { label: t.sleeping ? 'Wake tab' : 'Put tab to sleep', click: () => (t.sleeping ? this.tabs.activate(id) : this.tabs.sleep(id)), enabled: t.sleeping || (this.tabs.active()?.id !== id) },
      ...(others.length && t.workspaceId !== PRIVATE ? [{ label: 'Move to workspace', submenu: others.map((w) => ({ label: w.name, click: () => this.tabs.moveToWorkspace(id, w.id) })) }] : []),
      { type: 'separator' },
      { label: 'Close other tabs', click: () => this.tabs.inWorkspace(t.workspaceId).filter((x) => x.id !== id && !x.pinned).forEach((x) => this.tabs.closeTab(x.id)) },
      { label: 'Close tab', click: () => this.tabs.closeTab(id) },
    ]).popup({ window: this.win });
  }
  workspaceMenu(id) {
    const ws = this.store.workspaces().find((w) => w.id === id);
    if (!ws) return;
    Menu.buildFromTemplate([
      { label: 'Rename…', click: async () => { const n = await this.promptText({ title: 'Rename workspace', value: ws.name }); if (n) { this.store.renameWorkspace(id, n); this.tabs._changed(); } } },
      { label: 'Delete workspace…', enabled: id !== 'default', click: () => this.removeWorkspace(id) },
    ]).popup({ window: this.win });
  }
  async removeWorkspace(id) {
    if (id === 'default') return false;
    const ws = this.store.workspaces().find((w) => w.id === id);
    if (!ws) return false;
    const n = this.tabs.inWorkspace(id).length;
    const { response } = await dialog.showMessageBox(this.win, {
      type: 'warning', buttons: ['Delete workspace', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true,
      message: `Delete the workspace “${ws.name}”?`,
      detail: `Its ${n} open tab${n === 1 ? '' : 's'}, history, site permissions and saved site data (cookies, logins) will be removed. This cannot be undone.`,
    });
    if (response !== 0) return false;
    for (const t of this.tabs.inWorkspace(id)) this.tabs.closeTab(t.id);
    if (this.tabs.currentWorkspace === id) this.tabs.switchWorkspace('default');
    this.store.removeWorkspace(id);
    try { const s = this.sessions.getSession(id, 'web'); await s.clearStorageData(); await s.clearCache(); } catch { /* best effort */ }
    this.tabs._changed();
    return true;
  }

  // ---- data clearing --------------------------------------------------------------------
  async clearBrowsingData({ history = true, siteData = true, cache = true, downloads = true } = {}) {
    if (history) this.store.clearHistory();
    if (downloads) this.store.clearDownloads();
    if (siteData || cache) {
      for (const s of this.sessions.webSessions()) {
        if (siteData) await s.clearStorageData();
        if (cache) await s.clearCache();
      }
    }
    this.tabs._changed();
  }

  // ---- settings side effects ------------------------------------------------------------
  applyTheme() {
    nativeTheme.themeSource = this.cfg.theme;
    const t = nativeTheme.shouldUseDarkColors ? THEME.dark : THEME.light;
    if (this.win && !this.win.isDestroyed()) {
      this.win.setBackgroundColor(t.bar);
      if (!isMac) this.win.setTitleBarOverlay?.({ color: t.bar, symbolColor: t.symbol, height: TOOLBAR_H });
    }
  }
  applySecureDns() {
    const { mode, server } = this.cfg.secureDns;
    try {
      app.configureHostResolver({
        secureDnsMode: mode === 'off' ? 'off' : mode === 'secure' ? 'secure' : 'automatic',
        secureDnsServers: server ? [server] : [],
        enableBuiltInResolver: mode !== 'off',
      });
    } catch (e) { this.lastDnsError = e.message; }
  }
  applySetting(key) {
    if (key === 'theme') this.applyTheme();
    if (key === 'sidebarCollapsed') this.layout();
    if (key === 'secureDns') this.applySecureDns();
    if (key === 'blocking' && this.cfg.blocking.enabled && !this.blocker.listsLoaded) this.blocker.refresh().catch(() => {});
    this.tabs._changed();
  }
  broadcastSettings(key) {
    for (const t of this.tabs.tabs.values()) if (t.kind === 'internal' && t.host && !t.host.destroyed) t.host.wc.send('pelorus:settings:changed', { key });
  }
  broadcastDownloads() {
    const list = this.downloads.list();
    for (const t of this.tabs.tabs.values()) if (t.kind === 'internal' && t.host && !t.host.destroyed) t.host.wc.send('pelorus:downloads:update', list);
    this.send('state', this.tabs.snapshot());
  }

  // ---- session --------------------------------------------------------------------------
  _saveSoon() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => this.saveSession(), 1500);
  }
  saveSession() {
    try { if (this.tabs) this.store.setState('session', this.tabs.serialize()); } catch { /* db closed during shutdown */ }
  }
  restoreOrNew(initialUrl) {
    let restored = false;
    if (this.cfg.restoreSession) restored = this.tabs.restore(this.store.getState('session'));
    if (!restored) this.tabs.createTab({});
    if (initialUrl) this.tabs.createTab({ url: initialUrl });
  }

  dispose() {
    clearInterval(this.sleepTimer);
    clearTimeout(this._saveT);
    this.saveSession();
    this.tabs?.dispose();
  }

}

module.exports = { Controller, TOOLBAR_H, NEWTAB };
