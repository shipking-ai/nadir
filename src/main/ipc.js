// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { ipcMain, dialog, app, net } = require('electron');
const { checkForUpdate, RELEASES_URL } = require('./updates');
const { DEFAULT_SETTINGS } = require('./store');
const { COMMANDS } = require('../shared/shortcuts');
const { displayHost, isInternalUrl } = require('../shared/urls');

const CMD_IDS = new Set([...COMMANDS.map((c) => c.id), 'command-palette', 'focus-address', 'new-private-tab', 'home', 'next-tab', 'prev-tab', 'tab-last']);

const str = (v, max = 2048) => { if (typeof v !== 'string' || v.length > max) throw new Error('Invalid argument'); return v; };
const int = (v) => { if (!Number.isSafeInteger(v)) throw new Error('Invalid argument'); return v; };
const bool = (v) => !!v;

/** Per-setting validators: anything not listed here cannot be changed over IPC. */
const SETTING_VALIDATORS = {
  searchProvider: (v, c) => { if (!Object.hasOwn(c.searchProviders, str(v, 32))) throw new Error('Unknown provider'); return v; },
  searchProviders: (v) => {
    if (typeof v !== 'object' || v === null) throw new Error('Invalid');
    const out = structuredClone(DEFAULT_SETTINGS.searchProviders);
    const custom = v.custom;
    if (custom && typeof custom.url === 'string') {
      if (custom.url && !(/^https:\/\/[^\s]+%s/.test(custom.url) || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/][^\s]*%s/.test(custom.url))) throw new Error('Custom search URL must be https:// (or localhost) and contain %s');
      out.custom = { name: 'Custom (e.g. your SearXNG)', url: custom.url.slice(0, 500) };
    }
    return out;
  },
  blocking: (v) => ({ enabled: !!(v && v.enabled) }),
  httpsUpgrade: bool, stripTrackingParams: bool, sidebarCollapsed: bool, restoreSession: bool, clearOnExit: bool,
  theme: (v) => { if (!['system', 'light', 'dark'].includes(v)) throw new Error('Invalid theme'); return v; },
  tabSleepMinutes: (v) => { int(v); if (v < 0 || v > 1440) throw new Error('Invalid'); return v; },
  historyRetentionDays: (v) => { int(v); if (v < 0 || v > 3650) throw new Error('Invalid'); return v; },
  secureDns: (v) => {
    if (!v || !['off', 'automatic', 'secure'].includes(v.mode)) throw new Error('Invalid mode');
    const server = typeof v.server === 'string' ? v.server.trim() : '';
    if (server && !/^https:\/\/[^\s]+$/.test(server)) throw new Error('DNS server must be an https:// DoH template');
    if (v.mode === 'secure' && !server) throw new Error('Secure mode needs a DoH server URL');
    return { mode: v.mode, server: server.slice(0, 300) };
  },
};

/**
 * Registers every IPC channel. Each handler declares which surface may call it and the
 * sender is verified against the exact WebContents + main frame, not just the channel name.
 */
function registerIpc(c) {
  const { store } = c; // `c.tabs` is created later by c.create(), so it is always read lazily

  const isShell = (e) => e.sender === c.win?.webContents && e.senderFrame === e.sender.mainFrame;
  const isOverlay = (e) => e.sender === c.overlay?.webContents && e.senderFrame === e.sender.mainFrame;
  const internalTab = (e) => {
    const t = c.tabs.byWebContentsId(e.sender.id);
    return t && t.kind === 'internal' && e.senderFrame === e.sender.mainFrame && /^nadir:\/\//.test(e.senderFrame.url) ? t : null;
  };
  const SCOPES = {
    shell: isShell, overlay: isOverlay, chrome: (e) => isShell(e) || isOverlay(e), internal: (e) => !!internalTab(e),
  };

  const handle = (channel, scope, fn) => {
    ipcMain.handle(`nadir:${channel}`, async (event, payload) => {
      if (!SCOPES[scope](event)) throw new Error(`Forbidden: ${channel}`);
      return fn(payload, event);
    });
  };
  const tabId = (v) => { int(v); if (!c.tabs.get(v)) throw new Error('No such tab'); return v; };
  const activeId = () => c.tabs.active()?.id;

  // ---------- shell ----------
  handle('shell:ready', 'shell', () => { c.chromeReady = true; return c.tabs.snapshot(); });
  handle('overlay:ready', 'overlay', () => { c.overlayReady = true; return true; });
  handle('state:get', 'chrome', () => c.tabs.snapshot());
  handle('page:info', 'shell', () => ({ platform: process.platform, sidebarWidth: c.sidebarWidth() }));

  handle('tab:new', 'shell', (p) => c.tabs.createTab({ url: p?.url ? str(p.url) : undefined, afterId: activeId() }));
  handle('tab:close', 'shell', (id) => c.tabs.closeTab(tabId(id)));
  handle('tab:activate', 'shell', (id) => { c.hideOverlay({ restoreFocus: false }); c.tabs.activate(tabId(id)); });
  handle('tab:navigate', 'shell', (p) => {
    const id = p?.id != null ? tabId(p.id) : activeId();
    c.hideOverlay({ restoreFocus: false });
    const r = c.tabs.navigate(id, str(p?.input, 4096));
    if (r.ok) c.tabs.get(id)?.host?.focus();
    return r;
  });
  handle('tab:reorder', 'shell', (p) => c.tabs.reorder(tabId(p.id), p.beforeId == null ? null : tabId(p.beforeId)));
  handle('tab:pin', 'shell', (p) => c.tabs.setPinned(tabId(p.id), bool(p.pinned)));
  handle('tab:sleep', 'shell', (id) => c.tabs.sleep(tabId(id)));
  handle('tab:nav', 'shell', (p) => {
    const a = c.tabs.active()?.host;
    if (!a) return;
    if (p.action === 'back') a.back(); else if (p.action === 'forward') a.forward();
    else if (p.action === 'reload') a.reload(false); else if (p.action === 'stop') a.stop();
  });
  handle('tab:menu', 'shell', (id) => c.tabMenu(tabId(id)));
  handle('workspace:switch', 'shell', (id) => { c.hideOverlay({ restoreFocus: false }); c.tabs.switchWorkspace(str(id, 64)); });
  handle('workspace:create', 'shell', () => c.createWorkspaceInteractive());
  handle('workspace:menu', 'shell', (id) => c.workspaceMenu(str(id, 64)));
  handle('cmd', 'chrome', (cmd) => { if (!CMD_IDS.has(str(cmd, 40))) throw new Error('Unknown command'); c.runCommand(cmd); });
  handle('bookmark:toggle', 'shell', () => c.toggleBookmark());
  handle('sidebar:toggle', 'shell', () => c.setSetting('sidebarCollapsed', !c.cfg.sidebarCollapsed));

  handle('omnibox:suggest', 'shell', (text) => c.suggest(str(text, 2000)).map((s) => ({ type: s.type, title: s.title, url: s.url, tabId: s.tabId })));
  handle('omnibox:render', 'shell', (p) => {
    const n = [p?.rect?.x, p?.rect?.y, p?.rect?.width].map(Number);
    if (!n.every(Number.isFinite)) throw new Error('Invalid argument');
    c.renderOmnibox({ selected: int(p.selected), rect: { x: n[0], y: n[1], width: n[2] } });
  });
  handle('omnibox:hide', 'shell', () => { if (c.isOverlay('omnibox')) c.hideOverlay({ restoreFocus: false }); });
  handle('omnibox:pick', 'overlay', (i) => c.pickSuggestion(int(i)));

  // ---------- overlay ----------
  handle('overlay:close', 'overlay', () => {
    if (c.isOverlay('prompt')) return c.answerPrompt(null);
    if (c.isOverlay('permission')) return c.answerPermission({ decision: 'deny', remember: false });
    c.hideOverlay();
  });
  handle('palette:query', 'overlay', (q) => c.paletteResults(q));
  handle('palette:run', 'overlay', (i) => c.runPalette(int(i)));
  handle('find:query', 'overlay', (p) => c.tabs.active()?.host?.find(str(p.text, 500), { forward: p.forward !== false, findNext: !!p.findNext }));
  handle('find:close', 'overlay', () => c.hideOverlay());
  handle('permission:answer', 'overlay', (p) => c.answerPermission({ decision: p.decision, remember: p.remember }));
  handle('prompt:answer', 'overlay', (p) => c.answerPrompt(p?.value));

  // ---------- internal pages ----------
  handle('settings:get', 'internal', () => ({
    settings: c.cfg,
    workspaces: store.workspaces(),
    blocker: c.blocker.status(),
    defaults: { searchProviders: DEFAULT_SETTINGS.searchProviders },
  }));
  handle('settings:set', 'internal', (p) => {
    const key = str(p?.key, 40);
    if (!Object.hasOwn(SETTING_VALIDATORS, key)) throw new Error(`Setting not editable: ${key}`);
    const value = SETTING_VALIDATORS[key](p.value, c.cfg);
    c.setSetting(key, value);
    if (key === 'historyRetentionDays') store.enforceRetention(value);
    return { ok: true, value };
  });
  // User-initiated only (a button on the About page). The URL is fixed; tests may point it at a local server, nothing else may.
  handle('update:check', 'internal', () => checkForUpdate({
    fetchFn: (u, o) => net.fetch(u, o),
    current: app.getVersion(),
    url: process.env.NADIR_TEST === '1' && process.env.NADIR_UPDATE_URL ? process.env.NADIR_UPDATE_URL : RELEASES_URL,
  }));
  handle('about:info', 'internal', () => ({
    app: app.getVersion(), electron: process.versions.electron, chromium: process.versions.chrome, node: process.versions.node,
    v8: process.versions.v8, sqlite: store.db.prepare('select sqlite_version() v').get().v, platform: `${process.platform} ${process.arch}`,
    userData: c.userDataDir,
  }));

  handle('history:list', 'internal', (p) => {
    const ws = c.tabs.currentWorkspace;
    const rows = p?.query ? store.searchHistory(str(p.query, 200), { limit: 200 }) : store.recentHistory(null, 300);
    return rows.map((r) => ({ id: r.id, url: r.url, title: r.title, last_visit: r.last_visit, visit_count: r.visit_count, host: displayHost(r.url), current: r.workspace_id ? r.workspace_id === ws : undefined }));
  });
  handle('history:delete', 'internal', (id) => store.deleteHistory(int(id)));
  handle('history:clear', 'internal', (p) => {
    const ranges = { hour: 3600e3, day: 86400e3, week: 7 * 86400e3 };
    if (p?.range && Object.hasOwn(ranges, p.range)) store.clearHistorySince(Date.now() - ranges[p.range]);
    else store.clearHistory();
    return true;
  });
  handle('bookmarks:list', 'internal', () => store.bookmarks());
  handle('bookmarks:add', 'internal', (p) => { store.addBookmark({ url: str(p.url), title: str(p.title ?? p.url, 500) }); c.tabs._changed(); });
  handle('bookmarks:remove', 'internal', (url) => { store.removeBookmark(str(url)); c.tabs._changed(); });

  handle('downloads:list', 'internal', () => c.downloads.list());
  handle('downloads:open', 'internal', async (p, event) => {
    const r = await c.downloads.open(int(p.id), { confirmed: false });
    if (r.needsConfirm) {
      const { response } = await dialog.showMessageBox(c.win, {
        type: 'warning', buttons: ['Open anyway', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true,
        message: 'Open this file?', detail: `${r.reason}\n\nOnly open files from sources you trust.`,
      });
      if (response === 0) return c.downloads.open(p.id, { confirmed: true });
      return { ok: false, cancelled: true };
    }
    return r;
  });
  handle('downloads:show', 'internal', (p) => c.downloads.show(int(p.id)));
  handle('downloads:cancel', 'internal', (p) => c.downloads.cancel(int(p.id)));
  handle('downloads:clear', 'internal', () => c.downloads.clear());

  handle('privacy:summary', 'internal', () => ({
    blocked: store.blockedSummary(30),
    blocker: c.blocker.status(),
    permissions: store.permissions(),
    workspaces: Object.fromEntries(store.workspaces().map((w) => [w.id, w.name])),
    dnsError: c.lastDnsError || null,
  }));
  handle('permissions:clear', 'internal', (p) => { store.clearPermission(str(p.workspaceId, 64), str(p.origin, 300), str(p.permission, 64)); return true; });
  handle('blocklist:refresh', 'internal', async () => { try { await c.blocker.refresh(); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });
  handle('data:clear', 'internal', async (p) => {
    const { response } = await dialog.showMessageBox(c.win, {
      type: 'warning', buttons: ['Clear data', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true,
      message: 'Clear browsing data?',
      detail: 'This removes history, the download list, cookies, site storage and cache in every workspace. You will be signed out of sites. Bookmarks and settings are kept.',
    });
    if (response !== 0) return { ok: false, cancelled: true };
    await c.clearBrowsingData({});
    return { ok: true };
  });

  handle('nav:open', 'internal', (p, event) => {
    const t = internalTab(event);
    const url = str(p.url);
    if (!/^(https?:|nadir:)/i.test(url)) throw new Error('Unsupported URL');
    const target = p.newTab ? c.tabs.createTab({ url, afterId: t.id, workspaceId: t.workspaceId }) : t.id;
    if (!p.newTab) c.tabs.navigate(t.id, url);
    return target;
  });
  handle('nav:go', 'internal', (p, event) => {
    const t = internalTab(event);
    const r = c.tabs.navigate(t.id, str(p.input, 4096));
    if (r.ok) c.tabs.get(t.id)?.host?.focus();
    return r;
  });
  handle('newtab:data', 'internal', (_p, event) => {
    const t = internalTab(event);
    const ws = store.workspaces().find((w) => w.id === t.workspaceId);
    return {
      workspace: ws ? { id: ws.id, name: ws.name, color: ws.color } : { id: t.workspaceId, name: 'Private', color: '#9aa1ad', ephemeral: true },
      topSites: t.workspaceId === 'private' ? [] : store.topSites(t.workspaceId, 8).map((s) => ({ url: s.url, title: s.title || displayHost(s.url), host: displayHost(s.url) })),
      bookmarks: store.bookmarks().slice(0, 8).map((b) => ({ url: b.url, title: b.title, host: displayHost(b.url) })),
      search: c.searchTemplate().name,
      blockedTotal: store.blockedSummary(30).total,
    };
  });
  handle('workspace:remove', 'internal', (id) => c.removeWorkspace(str(id, 64)));
  handle('workspace:rename', 'internal', (p) => { store.renameWorkspace(str(p.id, 64), str(p.name, 40)); c.tabs._changed(); });
}

module.exports = { registerIpc, SETTING_VALIDATORS, isInternalUrl };
