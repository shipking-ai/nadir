// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { app, shell } = require('electron');
const { sanitizeFilename, uniqueName, classifyRisk, hasDeceptiveExtension } = require('../shared/filenames');

/** Kinds we never launch from the browser, even if the user confirms: reveal in folder instead. */
const NEVER_OPEN = new Set(['executable', 'script', 'shortcut', 'disk_image', 'deceptive']);

class DownloadManager {
  /**
   * @param {object} o
   * @param {import('./store').Store} o.store
   * @param {() => void} o.onChange called (throttled) when the list changes
   * @param {() => string} [o.dir] download directory
   */
  constructor(o) {
    this.o = o;
    this.items = new Map(); // id -> Electron.DownloadItem
    this.dir = o.dir || (() => app.getPath('downloads'));
    this._last = 0;
  }

  install(ses) {
    ses.on('will-download', (_e, item) => this._start(item));
  }

  _start(item) {
    const dir = this.dir();
    const name = sanitizeFilename(item.getFilename());
    let risk = classifyRisk(name);
    if (hasDeceptiveExtension(name)) risk = 'deceptive';
    let target;
    try {
      fs.mkdirSync(dir, { recursive: true });
      target = path.join(dir, uniqueName(dir, name, fs.existsSync));
    } catch {
      item.cancel();
      return;
    }
    item.setSavePath(target);
    const id = this.o.store.addDownload({ url: item.getURL(), filename: path.basename(target), path: target, total: item.getTotalBytes(), risk });
    this.items.set(id, item);
    const changed = (force) => {
      const now = Date.now();
      if (!force && now - this._last < 250) return;
      this._last = now;
      this.o.onChange();
    };
    item.on('updated', (_e, state) => {
      this.o.store.updateDownload(id, { state: state === 'interrupted' ? 'interrupted' : 'progressing', received: item.getReceivedBytes() });
      changed(false);
    });
    item.once('done', (_e, state) => {
      this.o.store.updateDownload(id, { state, received: item.getReceivedBytes() });
      this.items.delete(id);
      changed(true);
    });
    changed(true);
  }

  list() {
    return this.o.store.downloads().map((d) => ({
      ...d,
      exists: d.state === 'completed' && fs.existsSync(d.path),
      canOpen: !NEVER_OPEN.has(d.risk),
    }));
  }
  _row(id) { return this.o.store.downloads(500).find((d) => d.id === id); }

  async open(id, { confirmed = false } = {}) {
    const d = this._row(id);
    if (!d || d.state !== 'completed' || !fs.existsSync(d.path)) return { ok: false, reason: 'File not found' };
    if (NEVER_OPEN.has(d.risk)) return { ok: false, reason: 'Pelorus does not launch this type of file. Show it in its folder instead.' };
    if (d.risk && !confirmed) return { ok: false, needsConfirm: true, reason: `This ${d.risk.replace('_', ' ')} file can contain active content.` };
    const err = await shell.openPath(d.path);
    return err ? { ok: false, reason: err } : { ok: true };
  }
  show(id) {
    const d = this._row(id);
    if (d && fs.existsSync(d.path)) { shell.showItemInFolder(d.path); return true; }
    return false;
  }
  cancel(id) { this.items.get(id)?.cancel(); }
  clear() { this.o.store.clearDownloads(); this.o.onChange(); }
}

module.exports = { DownloadManager, NEVER_OPEN };
