// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
// "Is there a newer Pelorus?" — a user-initiated check, nothing more. Pelorus never downloads or installs an update by
// itself: builds are not yet code-signed, so an automatic installer would be a way to push unsigned code onto the
// user's machine. The check only reads the public GitHub releases list and shows where to download and verify.

const RELEASES_URL = 'https://api.github.com/repos/shipking-ai/pelorus/releases?per_page=20';
const RELEASE_PAGE_PREFIX = 'https://github.com/shipking-ai/pelorus/releases/';

/** Parse "v1.2.3" / "1.2.3-beta.1" into comparable parts, or null. Build metadata (+x) is ignored per semver. */
function parseVersion(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split('.') : [] };
}

/** -1, 0 or 1 following semver precedence; null if either side is not a version. */
function compareVersions(a, b) {
  const x = parseVersion(a); const y = parseVersion(b);
  if (!x || !y) return null;
  for (const k of ['major', 'minor', 'patch']) if (x[k] !== y[k]) return x[k] < y[k] ? -1 : 1;
  if (!x.pre.length && !y.pre.length) return 0;
  if (!x.pre.length) return 1;   // a release outranks its own pre-release
  if (!y.pre.length) return -1;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i]; const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const pn = /^\d+$/.test(p); const qn = /^\d+$/.test(q);
    if (pn && qn) return Number(p) < Number(q) ? -1 : 1;
    if (pn) return -1;
    if (qn) return 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

/**
 * Pick the newest non-draft release and compare. `fetchFn` is injectable for tests.
 * @returns {Promise<{current:string, latest:string|null, newer:boolean, url:string|null, prerelease:boolean}>}
 */
async function checkForUpdate({ fetchFn, current, url = RELEASES_URL }) {
  const res = await fetchFn(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'Pelorus-update-check' }, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`The release list could not be read (HTTP ${res.status}).`);
  const list = await res.json();
  if (!Array.isArray(list)) throw new Error('Unexpected response from the release list.');
  let best = null;
  for (const r of list) {
    if (!r || r.draft || typeof r.tag_name !== 'string' || !parseVersion(r.tag_name)) continue;
    if (!best || compareVersions(r.tag_name, best.tag_name) === 1) best = r;
  }
  if (!best) return { current, latest: null, newer: false, url: null, prerelease: false };
  const page = typeof best.html_url === 'string' && best.html_url.startsWith(RELEASE_PAGE_PREFIX) ? best.html_url : null; // never surface a URL we did not expect
  return { current, latest: best.tag_name.replace(/^v/, ''), newer: compareVersions(best.tag_name, current) === 1, url: page, prerelease: !!best.prerelease };
}

module.exports = { parseVersion, compareVersions, checkForUpdate, RELEASES_URL, RELEASE_PAGE_PREFIX };
