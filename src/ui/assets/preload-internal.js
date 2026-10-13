// SPDX-License-Identifier: GPL-3.0-or-later
// Preload for pelorus:// internal pages (new tab, history, settings, ...). Sandboxed.
// This preload is bound to the webContents, not the origin, so it also self-checks the origin:
// if a tab ever navigates away from pelorus://, nothing is exposed. The main process validates senders too.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

if (location.protocol === 'pelorus:') {
  const INVOKE = new Set([
    'settings:get', 'settings:set', 'history:list', 'history:delete', 'history:clear', 'bookmarks:list', 'bookmarks:add', 'bookmarks:remove',
    'downloads:list', 'downloads:open', 'downloads:show', 'downloads:cancel', 'downloads:clear', 'privacy:summary', 'permissions:clear',
    'data:clear', 'nav:open', 'nav:go', 'newtab:data', 'workspace:remove', 'workspace:rename', 'about:info', 'update:check', 'blocklist:refresh',
  ]);
  const ON = new Set(['downloads:update', 'settings:changed']);
  contextBridge.exposeInMainWorld('pelorus', {
    invoke: (channel, payload) => (INVOKE.has(channel) ? ipcRenderer.invoke(`pelorus:${channel}`, payload) : Promise.reject(new Error(`Blocked channel: ${channel}`))),
    on: (channel, cb) => {
      if (!ON.has(channel) || typeof cb !== 'function') return () => {};
      const h = (_e, data) => cb(data);
      ipcRenderer.on(`pelorus:${channel}`, h);
      return () => ipcRenderer.removeListener(`pelorus:${channel}`, h);
    },
  });
}
