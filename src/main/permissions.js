// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';

/** Granted without asking: these cannot expose data or devices and need a user gesture anyway. */
const ALLOW = new Set(['clipboard-sanitized-write', 'fullscreen', 'pointerLock']);
/** Ask the user, per workspace + origin. */
const PROMPT = new Set(['media', 'geolocation', 'notifications', 'clipboard-read', 'midi', 'midiSysex', 'idle-detection', 'speaker-selection']);

/**
 * Pure policy. Anything not listed (openExternal, USB/HID/serial, window-management,
 * mediaKeySystem, unknown future permissions, ...) is denied.
 * @returns {'allow'|'prompt'|'deny'}
 */
function policyFor(permission, { isMainFrame = true } = {}) {
  if (ALLOW.has(permission)) return 'allow';
  if (PROMPT.has(permission)) return isMainFrame ? 'prompt' : 'deny'; // cross-origin frames never get to ask
  return 'deny';
}

function permissionKey(permission, details = {}) {
  if (permission === 'media' && Array.isArray(details.mediaTypes) && details.mediaTypes.length) {
    return `media:${[...details.mediaTypes].sort().join('+')}`;
  }
  return permission;
}

function originOf(url) {
  try { const u = new URL(url); return u.protocol === 'file:' ? 'file://' : u.origin; } catch { return null; }
}

/** Human wording for the prompt. */
function describe(key) {
  const map = {
    'media:audio': 'use your microphone', 'media:video': 'use your camera', 'media:audio+video': 'use your camera and microphone',
    media: 'use your camera or microphone', geolocation: 'know your location', notifications: 'show notifications',
    'clipboard-read': 'read your clipboard', midi: 'use MIDI devices', midiSysex: 'use MIDI devices (system exclusive)',
    'idle-detection': 'know when you are idle', 'speaker-selection': 'choose audio output devices',
  };
  return map[key] || key;
}

class PermissionBroker {
  /**
   * @param {object} o
   * @param {import('./store').Store} o.store
   * @param {(wc:Electron.WebContents)=>({id:number,workspaceId:string}|null)} o.tabFor
   * @param {(req:{tabId:number,origin:string,key:string})=>Promise<{decision:'allow'|'deny',remember:boolean}>} o.ask
   * @param {string} o.privateId workspace id whose decisions are never persisted
   */
  constructor(o) { this.o = o; }

  install(ses) {
    ses.setPermissionRequestHandler((wc, permission, callback, details) => {
      this._request(wc, permission, details).then(callback, () => callback(false));
    });
    ses.setPermissionCheckHandler((wc, permission, requestingOrigin, details) => {
      const tab = wc ? this.o.tabFor(wc) : null;
      if (!tab) return false;
      const pol = policyFor(permission, { isMainFrame: details?.isMainFrame !== false });
      if (pol === 'allow') return true;
      if (pol === 'deny') return false;
      const origin = originOf(requestingOrigin);
      return !!origin && this.o.store.getPermission(tab.workspaceId, origin, permissionKey(permission, details)) === 'allow';
    });
    ses.setDisplayMediaRequestHandler((_req, cb) => cb({}), { useSystemPicker: false }); // screen capture: not supported yet
    ses.setDevicePermissionHandler(() => false);                                        // USB / HID / serial: denied
    ses.setBluetoothPairingHandler?.((_d, cb) => cb({ confirmed: false }));
  }

  async _request(wc, permission, details) {
    const tab = this.o.tabFor(wc);
    if (!tab) return false;
    const pol = policyFor(permission, { isMainFrame: details.isMainFrame !== false });
    if (pol === 'allow') return true;
    if (pol === 'deny') return false;
    const origin = originOf(details.requestingUrl);
    if (!origin) return false;
    const key = permissionKey(permission, details);
    const stored = this.o.store.getPermission(tab.workspaceId, origin, key);
    if (stored) return stored === 'allow';
    const { decision, remember } = await this.o.ask({ tabId: tab.id, origin, key });
    if (remember && tab.workspaceId !== this.o.privateId) this.o.store.setPermission(tab.workspaceId, origin, key, decision);
    return decision === 'allow';
  }
}

module.exports = { PermissionBroker, policyFor, permissionKey, originOf, describe };
