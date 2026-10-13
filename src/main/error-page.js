// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Plain-language names for Chromium net error codes we see most. Anything else shows the raw name. */
const REASONS = {
  '-2': ['Something went wrong', 'The request failed.'],
  '-6': ['File not found', 'The file could not be found.'],
  '-7': ['Timed out', 'The server took too long to respond.'],
  '-21': ['Network changed', 'Your network connection changed while loading.'],
  '-100': ['Connection closed', 'The connection was closed unexpectedly.'],
  '-101': ['Connection reset', 'The connection was reset.'],
  '-102': ['Connection refused', 'The server refused the connection.'],
  '-105': ['Site can’t be found', 'The address could not be resolved. Check for typos, or your network and DNS settings.'],
  '-106': ['You’re offline', 'There is no internet connection.'],
  '-109': ['Address unreachable', 'The address can’t be reached from this network.'],
  '-118': ['Timed out', 'The server took too long to respond.'],
  '-137': ['Name resolution failed', 'Secure DNS or your resolver could not look this name up.'],
  '-324': ['Empty response', 'The server closed the connection without sending data.'],
  '-501': ['Insecure connection', 'The connection is not secure.'],
};
const isCert = (code) => code <= -200 && code >= -299;

/**
 * Build the HTML for a failed main-frame navigation. Contains no script.
 * Certificate errors deliberately offer no "proceed anyway" path.
 * @param {{url:string, code:number, desc:string, httpFallback?:string}} i
 */
function errorPageHtml({ url, code, desc, httpFallback }) {
  const [title, text] = isCert(code)
    ? ['Your connection isn’t private', 'Nadir blocked this page because the site’s security certificate could not be verified. Attackers might be trying to read or alter what you send to this site.']
    : (REASONS[String(code)] || ['This page can’t be loaded', 'The page could not be loaded.']);
  const fallback = httpFallback
    ? `<p class="warn">Nadir tried the secure version of this address first. The site may not support HTTPS.</p>
       <p><a class="btn danger" href="nadir://allow-http?u=${encodeURIComponent(httpFallback)}">Continue over insecure HTTP</a></p>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#14151a;--fg:#e6e8ec;--mut:#9aa1ad;--bd:#2c3039;--ac:#8bd3a8;--bad:#e8837a}
@media (prefers-color-scheme:light){:root{--bg:#f6f5f2;--fg:#1c1e23;--mut:#5d6470;--bd:#d9d6cf;--ac:#2f7d5b;--bad:#b3392f}}
html,body{height:100%;margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 "Segoe UI Variable Text","Segoe UI",system-ui,sans-serif}
main{max-width:560px;margin:0 auto;padding:12vh 24px}
h1{font-size:22px;font-weight:600;margin:0 0 12px;letter-spacing:-.01em}
p{color:var(--mut);margin:0 0 16px}code{font:13px "Cascadia Mono",Consolas,monospace;color:var(--fg);word-break:break-all}
.warn{color:var(--bad)}.btn{display:inline-block;padding:8px 14px;border:1px solid var(--bd);border-radius:6px;color:var(--fg);text-decoration:none}
.btn:hover,.btn:focus-visible{border-color:var(--ac);outline:none}.danger{border-color:var(--bad);color:var(--bad)}
small{color:var(--mut)}
</style></head><body><main>
<h1>${esc(title)}</h1>
<p>${esc(text)}</p>
<p><code>${esc(url)}</code></p>
${fallback}
${/^https?:\/\//i.test(String(url)) ? `<p><a class="btn" href="${esc(url)}">Try again</a></p>` : ''}
<p><small>${esc(desc)} (${esc(code)})</small></p>
</main></body></html>`;
}

module.exports = { errorPageHtml, isCert, esc };
