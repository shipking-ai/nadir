// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';

/**
 * Map a keyboard event (as seen by Electron's `before-input-event`) to a browser command.
 * Pure function so it can be unit-tested and shared by every renderer surface.
 * @param {{type:string,key:string,control:boolean,meta:boolean,shift:boolean,alt:boolean}} i
 * @param {boolean} isMac
 * @returns {string|null}
 */
function commandForInput(i, isMac = false) {
  if (i.type !== 'keyDown') return null;
  const mod = isMac ? i.meta : i.control;
  const key = String(i.key);
  const k = key.length === 1 ? key.toLowerCase() : key;

  if (!mod && !i.alt) {
    if (k === 'F5') return i.shift ? 'reload-hard' : 'reload';
    if (k === 'F12') return 'devtools';
    if (k === 'F6') return 'focus-address';
    return null;
  }
  if (i.alt && !mod) {
    if (k === 'ArrowLeft') return 'back';
    if (k === 'ArrowRight') return 'forward';
    if (k === 'Home') return 'home';
    return null;
  }
  if (!mod || i.alt) return null;

  if (i.shift) {
    switch (k) {
      case 't': return 'reopen-tab';
      case 'r': return 'reload-hard';
      case 'Tab': return 'prev-tab';
      case 'Delete': case 'Backspace': return 'clear-data';
      case 'i': return 'devtools';
      case 'p': return 'command-palette';
      case 'b': return 'bookmarks';
      case 'o': return 'bookmarks';
      case '+': case '=': return 'zoom-in';
      default: return null;
    }
  }
  if (/^[1-8]$/.test(k)) return `tab-${k}`;
  switch (k) {
    case '9': return 'tab-last';
    case 't': return 'new-tab';
    case 'n': return 'new-tab';
    case 'w': return 'close-tab';
    case 'l': return 'focus-address';
    case 'k': return 'command-palette';
    case 'f': return 'find';
    case 'r': return 'reload';
    case 'd': return 'bookmark-toggle';
    case 'h': return 'history';
    case 'j': return 'downloads';
    case 'b': return 'toggle-sidebar';
    case '\\': return 'toggle-split';
    case ',': return 'settings';
    case 'Tab': return 'next-tab';
    case '=': case '+': return 'zoom-in';
    case '-': return 'zoom-out';
    case '0': return 'zoom-reset';
    default: return null;
  }
}

/** Human-readable accelerators for the command palette. */
const COMMANDS = [
  { id: 'new-tab', title: 'New tab', keys: 'Ctrl+T' },
  { id: 'close-tab', title: 'Close tab', keys: 'Ctrl+W' },
  { id: 'reopen-tab', title: 'Reopen closed tab', keys: 'Ctrl+Shift+T' },
  { id: 'focus-address', title: 'Focus address bar', keys: 'Ctrl+L' },
  { id: 'find', title: 'Find in page', keys: 'Ctrl+F' },
  { id: 'reload', title: 'Reload', keys: 'Ctrl+R' },
  { id: 'reload-hard', title: 'Reload (bypass cache)', keys: 'Ctrl+Shift+R' },
  { id: 'back', title: 'Back', keys: 'Alt+←' },
  { id: 'forward', title: 'Forward', keys: 'Alt+→' },
  { id: 'bookmark-toggle', title: 'Bookmark this page', keys: 'Ctrl+D' },
  { id: 'toggle-sidebar', title: 'Toggle sidebar', keys: 'Ctrl+B' },
  { id: 'toggle-split', title: 'Split view with next tab', keys: 'Ctrl+\\' },
  { id: 'sleep-tab', title: 'Put this tab to sleep', keys: '' },
  { id: 'sleep-others', title: 'Put all other tabs to sleep', keys: '' },
  { id: 'history', title: 'Open history', keys: 'Ctrl+H' },
  { id: 'bookmarks', title: 'Open bookmarks', keys: 'Ctrl+Shift+B' },
  { id: 'downloads', title: 'Open downloads', keys: 'Ctrl+J' },
  { id: 'settings', title: 'Open settings', keys: 'Ctrl+,' },
  { id: 'privacy', title: 'Open privacy dashboard', keys: '' },
  { id: 'zoom-in', title: 'Zoom in', keys: 'Ctrl+=' },
  { id: 'zoom-out', title: 'Zoom out', keys: 'Ctrl+-' },
  { id: 'zoom-reset', title: 'Reset zoom', keys: 'Ctrl+0' },
  { id: 'devtools', title: 'Developer tools', keys: 'F12' },
  { id: 'new-workspace', title: 'New workspace…', keys: '' },
  { id: 'clear-data', title: 'Clear browsing data…', keys: 'Ctrl+Shift+Del' },
];

module.exports = { commandForInput, COMMANDS };
