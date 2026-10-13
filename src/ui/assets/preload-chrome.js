// SPDX-License-Identifier: GPL-3.0-or-later
// Preload for Nadir's own chrome surfaces (toolbar/sidebar and overlay). Sandboxed: only `electron` is available.
// Web pages never get this preload. The main process re-validates every sender, so this allowlist is defence in depth.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const INVOKE = new Set([
  'state:get', 'tab:new', 'tab:close', 'tab:activate', 'tab:navigate', 'tab:reorder', 'tab:pin', 'tab:sleep', 'tab:nav', 'tab:menu',
  'workspace:switch', 'workspace:create', 'workspace:menu', 'cmd', 'omnibox:suggest', 'omnibox:render', 'omnibox:hide', 'omnibox:pick',
  'overlay:close', 'palette:query', 'palette:run', 'find:query', 'find:close', 'permission:answer', 'prompt:answer',
  'bookmark:toggle', 'sidebar:toggle', 'shell:ready', 'overlay:ready', 'page:info',
]);
const ON = new Set(['state', 'focus-address', 'overlay:render', 'find:result', 'theme']);

contextBridge.exposeInMainWorld('nadir', {
  invoke: (channel, payload) => (INVOKE.has(channel) ? ipcRenderer.invoke(`nadir:${channel}`, payload) : Promise.reject(new Error(`Blocked channel: ${channel}`))),
  on: (channel, cb) => {
    if (!ON.has(channel) || typeof cb !== 'function') return () => {};
    const h = (_e, data) => cb(data);
    ipcRenderer.on(`nadir:${channel}`, h);
    return () => ipcRenderer.removeListener(`nadir:${channel}`, h);
  },
  platform: process.platform,
});
