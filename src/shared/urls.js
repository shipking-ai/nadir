// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';

/** Schemes a user may type into the address bar and have navigated. */
const NAVIGABLE = new Set(['http:', 'https:', 'file:', 'about:', 'nadir:']);
/** Schemes that execute or embed content and are never navigated from the omnibox. */
const BLOCKED = new Set(['javascript:', 'data:', 'vbscript:', 'blob:', 'filesystem:', 'view-source:']);

const SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i;
const HOST_PORT_RE = /^(localhost|\[[0-9a-f:]+\]|[a-z0-9-]+(\.[a-z0-9-]+)*|\d{1,3}(\.\d{1,3}){3}):\d{1,5}([/?#]|$)/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}(:\d{1,5})?([/?#]|$)/;
const IPV6_RE = /^\[[0-9a-f:]+\](:\d{1,5})?([/?#]|$)/i;
const DOMAIN_RE = /^([\p{L}\p{N}-]+\.)+[\p{L}]{2,}(:\d{1,5})?([/?#]|$)/u;
const LOCAL_RE = /^(localhost|[^./\s]+\.(local|localhost|test|internal|lan))(:\d{1,5})?([/?#]|$)/i;

function isLocalHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.test') || h.endsWith('.internal') || h.endsWith('.lan')) return true;
  if (h === '[::1]' || h === '::1' || h.startsWith('[fe80:') || h.startsWith('[fc') || h.startsWith('[fd')) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a === 10 || a === 127 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254);
  }
  return false;
}

/**
 * Decide what the user meant by a string typed in the address bar.
 * @param {string} raw
 * @param {string} searchTemplate URL template containing %s
 * @returns {{kind:'empty'|'url'|'search'|'blocked', url:string, reason?:string}}
 */
function resolveInput(raw, searchTemplate) {
  const input = String(raw ?? '').trim();
  if (!input) return { kind: 'empty', url: '' };

  const search = () => ({ kind: 'search', url: searchTemplate.replace('%s', encodeURIComponent(input)) });

  // "localhost:3000", "192.168.1.1:8080", "example.com:8443" parse as a scheme; treat as host:port first.
  if (HOST_PORT_RE.test(input) && !/^(https?|file|about|nadir):/i.test(input)) {
    const host = input.startsWith('[') ? input.slice(0, input.indexOf(']') + 1) : input.split(/[:/?#]/)[0];
    return { kind: 'url', url: `${isLocalHost(host) ? 'http' : 'https'}://${input}` };
  }

  const sm = input.match(SCHEME_RE);
  if (sm) {
    const scheme = `${sm[1].toLowerCase()}:`;
    if (BLOCKED.has(scheme)) return { kind: 'blocked', url: '', reason: `The ${scheme} scheme cannot be opened from the address bar.` };
    if (NAVIGABLE.has(scheme)) {
      if (scheme === 'about:' && input.toLowerCase() !== 'about:blank') return { kind: 'blocked', url: '', reason: 'Unknown about: page.' };
      if ((scheme === 'http:' || scheme === 'https:') && !/^https?:\/\/[^\s/?#]+/i.test(input)) return search();
      try { return { kind: 'url', url: new URL(input).href }; } catch { return search(); }
    }
    if (/\s/.test(input)) return search();
    // Unknown scheme such as "mailto:" or "steam:" — never auto-launch external handlers from typed text.
    return { kind: 'blocked', url: '', reason: `The ${scheme} scheme is not supported.` };
  }

  if (/\s/.test(input)) return search();

  if (LOCAL_RE.test(input) || IPV4_RE.test(input) || IPV6_RE.test(input)) {
    return { kind: 'url', url: `http://${input}` };
  }
  if (DOMAIN_RE.test(input)) return { kind: 'url', url: `https://${input}` };
  return search();
}

/** Host label for display. Not a public-suffix implementation. */
function displayHost(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'nadir:') return `nadir://${u.hostname}`;
    if (u.protocol === 'file:') return 'file';
    return u.hostname.replace(/^www\./, '');
  } catch { return ''; }
}

function isInternalUrl(url) { return /^nadir:\/\//i.test(url); }

/** True if an http:// URL should be attempted over https first. */
function shouldUpgrade(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' && !isLocalHost(u.hostname);
  } catch { return false; }
}

function upgradeUrl(url) {
  const u = new URL(url);
  u.protocol = 'https:';
  if (u.port === '80') u.port = '';
  return u.href;
}

/** Strip tracking parameters known to carry no page semantics. */
const TRACKING_PARAMS = /^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_eid|mc_cid|_hsenc|_hsmi|igshid|yclid|ref_src)$/i;
function stripTracking(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
    let changed = false;
    for (const k of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(k)) { u.searchParams.delete(k); changed = true; }
    }
    return changed ? u.href : url;
  } catch { return url; }
}

module.exports = { resolveInput, displayHost, isInternalUrl, isLocalHost, shouldUpgrade, upgradeUrl, stripTracking, NAVIGABLE, BLOCKED };
