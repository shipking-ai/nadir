// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { EventEmitter } = require('node:events');
const { WebContentsView, Menu, clipboard } = require('electron');
const { commandForInput } = require('../shared/shortcuts');
const { errorPageHtml } = require('./error-page');
const { isInternalUrl } = require('../shared/urls');

const isMac = process.platform === 'darwin';

/**
 * The only module that touches Chromium's WebContents for a tab (see ADR-0001).
 * Everything above it speaks in tab ids, URLs and events, so another engine host
 * can replace it later.
 *
 * Emits: 'navigated' {url,inPage}, 'title', 'favicon', 'loading' bool, 'audio' bool,
 *        'crashed' {reason}, 'fail' {url,code,desc}, 'open-url' {url,background},
 *        'command' string, 'found' result, 'zoom' number, 'allow-http' url
 */
class TabHost extends EventEmitter {
  /**
   * @param {object} o
   * @param {'web'|'internal'} o.kind
   * @param {Electron.Session} o.session
   * @param {string} [o.preload] absolute path; only passed for kind === 'internal'
   */
  constructor({ kind, session, preload }) {
    super();
    this.kind = kind;
    this.destroyed = false;
    this.errorFor = null;
    this.view = new WebContentsView({
      webPreferences: {
        session,
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        nodeIntegrationInSubFrames: false,
        webviewTag: false,
        safeDialogs: true,
        spellcheck: true,
        enableWebSQL: false,
        ...(preload ? { preload } : {}),
      },
    });
    // Web pages without their own background must render on white (as in every other browser);
    // Pelorus's internal pages paint their own theme-aware background.
    this.view.setBackgroundColor(kind === 'web' ? '#ffffff' : '#00000000');
    this._wire();
  }

  get wc() { return this.view.webContents; }

  _wire() {
    const wc = this.wc;

    wc.on('did-start-loading', () => this.emit('loading', true));
    wc.on('did-stop-loading', () => this.emit('loading', false));
    wc.on('did-start-navigation', (e) => {
      const d = e.details ?? e;
      if (d.isMainFrame && !String(d.url).startsWith('data:')) this.errorFor = null;
      if (d.isMainFrame && !d.isSameDocument) this.emit('nav-start');
    });
    wc.on('enter-html-full-screen', () => this.emit('fullscreen', true));
    wc.on('leave-html-full-screen', () => this.emit('fullscreen', false));
    wc.on('did-navigate', (_e, url) => {
      if (url.startsWith('data:') && this.errorFor) return this.emit('navigated', { url: this.errorFor, inPage: false });
      this.emit('navigated', { url, inPage: false });
    });
    wc.on('did-navigate-in-page', (_e, url, isMainFrame) => { if (isMainFrame) this.emit('navigated', { url, inPage: true }); });
    wc.on('page-title-updated', (e, title) => { e.preventDefault(); this.emit('title', title); });
    wc.on('page-favicon-updated', (_e, favicons) => {
      const f = favicons.find((u) => /^https?:|^data:image\//.test(u));
      if (f) this.emit('favicon', f);
    });
    wc.on('audio-state-changed', (e) => this.emit('audio', !!(e.audible ?? wc.isCurrentlyAudible())));
    wc.on('render-process-gone', (_e, d) => this.emit('crashed', { reason: d.reason }));
    wc.on('found-in-page', (_e, r) => this.emit('found', r));
    wc.on('zoom-changed', (_e, dir) => this.emit('zoom-wheel', dir));

    wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
      if (!isMainFrame || code === -3 || url.startsWith('data:')) return; // -3 = ERR_ABORTED (user stop / redirect)
      this.emit('fail', { url, code, desc });
    });

    // ---- navigation policy -------------------------------------------------------------
    wc.on('will-navigate', (e, url) => this._policy(e, url));
    wc.on('will-redirect', (e, url) => this._policy(e, url));
    wc.setWindowOpenHandler(({ url, disposition, features }) => {
      if (this.kind === 'web' && isInternalUrl(url)) return { action: 'deny' };
      if (disposition === 'foreground-tab' || disposition === 'background-tab' || (disposition === 'other' && !features)) {
        this.emit('open-url', { url, background: disposition === 'background-tab' });
        return { action: 'deny' };
      }
      if (disposition === 'new-window' && this.kind === 'web' && /^https?:/i.test(url)) {
        // Real popups (OAuth, payment) need window.opener; allow with the same hardened prefs.
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            autoHideMenuBar: true, width: 520, height: 720,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
          },
        };
      }
      this.emit('open-url', { url, background: false });
      return { action: 'deny' };
    });

    // ---- keyboard & menus --------------------------------------------------------------
    wc.on('before-input-event', (e, input) => {
      const cmd = commandForInput(input, isMac);
      if (cmd) { e.preventDefault(); this.emit('command', cmd); }
    });
    wc.on('context-menu', (_e, p) => this._contextMenu(p));
  }

  /** Block page-initiated navigation to internal or dangerous schemes; handle our own control URLs. */
  _policy(e, url) {
    if (url.startsWith('pelorus://allow-http')) {
      e.preventDefault();
      // Only honoured from our own error page (a data: document we generated).
      if (this.wc.getURL().startsWith('data:text/html')) {
        const u = new URL(url).searchParams.get('u');
        if (u && /^http:\/\//i.test(u)) this.emit('allow-http', u);
      }
      return;
    }
    if (this.kind === 'web') {
      if (isInternalUrl(url) || /^(javascript|file|filesystem):/i.test(url)) {
        if (!(url.startsWith('file:') && this.wc.getURL().startsWith('file:'))) e.preventDefault();
      }
      return;
    }
    // Internal pages may only navigate within pelorus://; anything else is routed through the tab manager.
    if (!isInternalUrl(url)) { e.preventDefault(); this.emit('open-url', { url, background: false, replace: true }); }
  }

  _contextMenu(p) {
    const items = [];
    if (p.linkURL) {
      items.push(
        { label: 'Open link in new tab', click: () => this.emit('open-url', { url: p.linkURL, background: true }) },
        { label: 'Copy link address', click: () => clipboard.writeText(p.linkURL) },
        { type: 'separator' },
      );
    }
    if (p.srcURL && p.mediaType === 'image') {
      items.push(
        { label: 'Open image in new tab', click: () => this.emit('open-url', { url: p.srcURL, background: true }) },
        { label: 'Copy image address', click: () => clipboard.writeText(p.srcURL) },
        { type: 'separator' },
      );
    }
    if (p.isEditable) {
      items.push(
        { role: 'undo', enabled: p.editFlags.canUndo }, { role: 'redo', enabled: p.editFlags.canRedo }, { type: 'separator' },
        { role: 'cut', enabled: p.editFlags.canCut }, { role: 'copy', enabled: p.editFlags.canCopy },
        { role: 'paste', enabled: p.editFlags.canPaste }, { role: 'selectAll' },
      );
      if (p.misspelledWord && p.dictionarySuggestions.length) {
        items.unshift(...p.dictionarySuggestions.slice(0, 4).map((s) => ({ label: s, click: () => this.wc.replaceMisspelling(s) })), { type: 'separator' });
      }
    } else if (p.selectionText) {
      const q = p.selectionText.trim().slice(0, 200);
      items.push(
        { role: 'copy' },
        { label: `Search for “${q.length > 28 ? q.slice(0, 28) + '…' : q}”`, click: () => this.emit('search', q) },
      );
    } else {
      items.push(
        { label: 'Back', enabled: this.wc.navigationHistory.canGoBack(), click: () => this.back() },
        { label: 'Forward', enabled: this.wc.navigationHistory.canGoForward(), click: () => this.forward() },
        { label: 'Reload', click: () => this.reload() },
      );
    }
    items.push({ type: 'separator' }, { label: 'Inspect', click: () => { this.wc.inspectElement(p.x, p.y); if (this.wc.isDevToolsOpened()) this.wc.devToolsWebContents?.focus(); } });
    Menu.buildFromTemplate(items).popup();
  }

  // ---- commands ------------------------------------------------------------------------
  loadURL(url) { return this.wc.loadURL(url).catch(() => { /* failures are reported via did-fail-load */ }); }
  reload(ignoreCache = false) { ignoreCache ? this.wc.reloadIgnoringCache() : this.wc.reload(); }
  stop() { this.wc.stop(); }
  back() { if (this.wc.navigationHistory.canGoBack()) this.wc.navigationHistory.goBack(); }
  forward() { if (this.wc.navigationHistory.canGoForward()) this.wc.navigationHistory.goForward(); }
  setBounds(b) { this.view.setBounds(b); }
  setVisible(v) { this.view.setVisible(v); }
  focus() { if (!this.destroyed) this.wc.focus(); }
  navState() {
    const h = this.wc.navigationHistory;
    return { canGoBack: h.canGoBack(), canGoForward: h.canGoForward() };
  }
  zoom(delta) {
    const z = delta === 0 ? 1 : Math.min(5, Math.max(0.25, this.wc.getZoomFactor() + delta));
    this.wc.setZoomFactor(z);
    this.emit('zoom', z);
    return z;
  }
  find(text, opts = {}) { if (text) this.wc.findInPage(text, opts); else this.wc.stopFindInPage('clearSelection'); }
  stopFind() { this.wc.stopFindInPage('clearSelection'); }
  devtools() { this.wc.isDevToolsOpened() ? this.wc.closeDevTools() : this.wc.openDevTools({ mode: 'detach' }); }
  showError(info) {
    this.errorFor = info.url;
    return this.wc.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorPageHtml(info))).catch(() => {});
  }
  /** Release the renderer process. The view object stays valid until removed from its parent. */
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.removeAllListeners();
    try { this.wc.setAudioMuted(true); } catch { /* already gone */ }
    try { this.wc.close({ waitForBeforeUnload: false }); } catch { /* already gone */ }
  }
}

module.exports = { TabHost };
