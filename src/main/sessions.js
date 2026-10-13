// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { session } = require('electron');
const crypto = require('node:crypto');
const protocol = require('./protocol');

const PRIVATE_ID = 'private';

/**
 * One Chromium storage partition per workspace (cookies, cache, localStorage, IndexedDB are
 * all isolated), one non-persistent partition for private tabs, and one for Nadir's own pages.
 */
function createSessionFactory({ blocker, broker, downloads }) {
  const cache = new Map();
  const runId = crypto.randomBytes(6).toString('hex');

  function cleanUserAgent(ses) {
    // Truthful about the engine, but without the Electron/app tokens that break sites and aid fingerprinting.
    ses.setUserAgent(ses.getUserAgent().replace(/\sElectron\/\S+/i, '').replace(/\s(Nadir|nadir-browser)\/\S+/i, ''));
  }

  function configureWeb(ses) {
    cleanUserAgent(ses);
    blocker.attach(ses);
    broker.install(ses);
    downloads.install(ses);
    // Global Privacy Control: a legally recognised opt-out signal in several jurisdictions.
    ses.webRequest.onBeforeSendHeaders({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
      d.requestHeaders['Sec-GPC'] = '1';
      cb({ requestHeaders: d.requestHeaders });
    });
  }

  function configureInternal(ses) {
    protocol.register(ses);
    ses.setPermissionRequestHandler((_wc, _p, cb) => cb(false));
    ses.setPermissionCheckHandler(() => false);
    ses.setDevicePermissionHandler(() => false);
  }

  /** @param {string} workspaceId @param {'web'|'internal'} kind */
  function getSession(workspaceId, kind) {
    const key = kind === 'internal' ? 'internal' : workspaceId;
    let ses = cache.get(key);
    if (ses) return ses;
    if (key === 'internal') {
      ses = session.fromPartition('persist:nadir-internal');
      configureInternal(ses);
    } else {
      ses = workspaceId === PRIVATE_ID
        ? session.fromPartition(`nadir-private-${runId}`)       // no "persist:" prefix => memory only
        : session.fromPartition(`persist:ws-${workspaceId}`);
      configureWeb(ses);
    }
    cache.set(key, ses);
    return ses;
  }

  /** All sessions that hold web data (for "clear browsing data"). */
  const webSessions = () => [...cache].filter(([k]) => k !== 'internal').map(([, s]) => s);

  return { getSession, webSessions };
}

module.exports = { createSessionFactory, PRIVATE_ID };
