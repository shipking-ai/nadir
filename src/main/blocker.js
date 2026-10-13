// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { ipcMain } = require('electron');
const { ElectronBlocker, fromElectronDetails } = require('@ghostery/adblocker-electron');
const { shouldUpgrade, upgradeUrl, stripTracking } = require('../shared/urls');

const COSMETIC_CHANNEL = '@ghostery/adblocker/inject-cosmetic-filters';
const MUTATION_CHANNEL = '@ghostery/adblocker/is-mutation-observer-enabled';
const REFRESH_AFTER_MS = 3 * 24 * 3600 * 1000;

/**
 * Network/cosmetic blocking, HTTPS-first upgrades and tracking-parameter stripping.
 *
 * Wraps @ghostery/adblocker (MPL-2.0). We do not use its `enableBlockingInSession`
 * because it registers global IPC handlers (fails on the 2nd workspace session) and
 * owns the single `onBeforeRequest` slot we also need for upgrades and per-tab stats.
 */
class Blocker {
  /**
   * @param {object} o
   * @param {string} o.cacheFile where the serialized engine is stored
   * @param {() => object} o.getSettings
   * @param {(webContentsId:number) => ({tabId:number, workspaceId:string}|null)} o.lookupTab
   * @param {(webContents:Electron.WebContents) => boolean} o.isTabContents
   * @param {(info:{tabId:number, host:string, count:number}) => void} o.onBlocked
   * @param {(url:string)=>Promise<Response>} [o.fetch]
   */
  constructor(o) {
    this.o = o;
    this.engine = ElectronBlocker.empty();
    this.listsLoaded = false;
    this.listsUpdatedAt = 0;
    this.lastError = null;
    this.sessions = new WeakSet();
    this.httpExempt = new Set();      // hosts the user chose to open over http
    this.upgraded = new Map();        // https url -> original http url (for fallback)
    this._ipcRegistered = false;
    this._fetch = o.fetch || ((...a) => fetch(...a));
  }

  /**
   * Load cached lists synchronously (fast), then refresh in the background when stale.
   * @param {{refresh?: boolean}} [opts] pass refresh:false to never touch the network (tests, offline use)
   */
  init({ refresh = true } = {}) {
    this._registerIpc();
    try {
      const buf = fs.readFileSync(this.o.cacheFile);
      this.engine = ElectronBlocker.deserialize(new Uint8Array(buf));
      this.listsLoaded = true;
      this.listsUpdatedAt = fs.statSync(this.o.cacheFile).mtimeMs;
    } catch (e) {
      if (e.code !== 'ENOENT') this.lastError = `cache unreadable: ${e.message}`;
    }
    if (refresh && (!this.listsLoaded || Date.now() - this.listsUpdatedAt > REFRESH_AFTER_MS)) {
      this.refresh().catch(() => { /* recorded in lastError */ });
    }
  }

  /** Downloads Ghostery's prebuilt ads+tracking lists. This contacts Ghostery's CDN (no user data sent). */
  async refresh() {
    try {
      const engine = await ElectronBlocker.fromPrebuiltAdsAndTracking(this._fetch);
      this.engine = engine;
      this.listsLoaded = true;
      this.listsUpdatedAt = Date.now();
      this.lastError = null;
      fs.mkdirSync(path.dirname(this.o.cacheFile), { recursive: true });
      const tmp = `${this.o.cacheFile}.tmp`;
      fs.writeFileSync(tmp, engine.serialize());
      fs.renameSync(tmp, this.o.cacheFile);
    } catch (e) {
      this.lastError = `list update failed: ${e.message}`;
      throw e;
    }
  }

  status() {
    return { enabled: !!this.o.getSettings().blocking.enabled, listsLoaded: this.listsLoaded, updatedAt: this.listsUpdatedAt, error: this.lastError };
  }

  allowHttp(host) { this.httpExempt.add(host); }

  /** If this https URL was an upgrade of an http URL, return the original (and forget it). */
  takeUpgradeOrigin(httpsUrl) {
    const o = this.upgraded.get(httpsUrl);
    this.upgraded.delete(httpsUrl);
    return o || null;
  }

  _registerIpc() {
    if (this._ipcRegistered) return;
    this._ipcRegistered = true;
    // Only web-tab renderers may call these; everything else is ignored.
    ipcMain.handle(COSMETIC_CHANNEL, (event, url, msg) => {
      if (!this.o.isTabContents(event.sender) || !this.o.getSettings().blocking.enabled) return;
      return this.engine.onInjectCosmeticFilters(event, url, msg);
    });
    ipcMain.handle(MUTATION_CHANNEL, (event) => {
      if (!this.o.isTabContents(event.sender)) return false;
      return this.engine.onIsMutationObserverEnabled(event);
    });
  }

  /** Attach to one workspace session. Safe to call once per session. */
  attach(ses) {
    if (this.sessions.has(ses)) return;
    this.sessions.add(ses);
    ses.registerPreloadScript({ type: 'frame', filePath: require.resolve('@ghostery/adblocker-electron-preload') });
    ses.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (d, cb) => this._onBeforeRequest(d, cb));
    ses.webRequest.onHeadersReceived({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
      if (!this.o.getSettings().blocking.enabled) return cb({});
      return this.engine.onHeadersReceived(d, cb);
    });
  }

  _onBeforeRequest(details, callback) {
    const settings = this.o.getSettings();
    try {
      if (details.resourceType === 'mainFrame') {
        let url = details.url;
        let changed = false;
        if (settings.stripTrackingParams) {
          const stripped = stripTracking(url);
          if (stripped !== url) { url = stripped; changed = true; }
        }
        if (settings.httpsUpgrade && shouldUpgrade(url) && !this.httpExempt.has(new URL(url).hostname)) {
          const up = upgradeUrl(url);
          this.upgraded.set(up, url);
          if (this.upgraded.size > 200) this.upgraded.delete(this.upgraded.keys().next().value);
          return callback({ redirectURL: up });
        }
        return callback(changed ? { redirectURL: url } : {});
      }
      if (!settings.blocking.enabled || !this.listsLoaded) return callback({});
      const request = fromElectronDetails(details);
      if (request.type === 'other') request.guessTypeOfRequest();
      const { redirect, match } = this.engine.match(request);
      if (!redirect && !match) return callback({});
      const tab = details.webContentsId ? this.o.lookupTab(details.webContentsId) : null;
      if (tab) this.o.onBlocked({ tabId: tab.tabId, host: request.hostname || 'unknown', count: 1 });
      return callback(redirect ? { redirectURL: redirect.dataUrl } : { cancel: true });
    } catch (e) {
      // Fail open for page load, but never silently: surface in status().
      this.lastError = `request handler error: ${e.message}`;
      return callback({});
    }
  }
}

module.exports = { Blocker };
