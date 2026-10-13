// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');

const UI_ROOT = path.resolve(__dirname, '..', 'ui');
const HOSTS = new Set(['shell', 'overlay', 'newtab', 'app', 'assets']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json',
};

/**
 * Strict CSP for all Pelorus UI. No inline script, no inline style attributes, no network
 * access from UI code (connect-src 'none'); privileged work happens over IPC only.
 */
const CSP = [
  "default-src 'none'",
  'script-src pelorus://assets',
  'style-src pelorus://assets',
  "img-src pelorus://assets data: https: http:",
  'font-src pelorus://assets',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

/** Resolve pelorus://<host>/<path> to a file inside src/ui/<host>, or null. Pure; exported for tests. */
function resolveUiPath(urlString) {
  let u;
  try { u = new URL(urlString); } catch { return null; }
  if (u.protocol !== 'pelorus:' || !HOSTS.has(u.hostname)) return null;
  let rel;
  try { rel = decodeURIComponent(u.pathname); } catch { return null; }
  if (rel.includes('\0') || rel.includes('\\')) return null;
  if (rel === '/' || rel === '') rel = '/index.html';
  const base = path.join(UI_ROOT, u.hostname);
  const full = path.resolve(base, '.' + rel);
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  return full;
}

function register(ses) {
  ses.protocol.handle('pelorus', async (request) => {
    const file = resolveUiPath(request.url);
    const headers = { 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' };
    if (!file) return new Response('Not found', { status: 404, headers });
    try {
      const body = await fs.readFile(file);
      return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' } });
    } catch {
      return new Response('Not found', { status: 404, headers });
    }
  });
}

module.exports = { register, resolveUiPath, CSP, UI_ROOT };
