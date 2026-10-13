// SPDX-License-Identifier: GPL-3.0-or-later
// Deterministic fuzzing of the input-handling code that sits on trust boundaries: URL resolution, download file
// names, the nadir:// path resolver, the full-text-search query builder, permission policy and HTML escaping.
// Each test generates a few thousand hostile strings from a seeded generator and checks INVARIANTS (never throws,
// never produces a dangerous result). This is the project's own fuzzing, not an independent security review, and it
// finds crashes/invariant violations in these functions only; it says nothing about the rest of the browser.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return { app: { getPath: () => '.' }, shell: {} };
  return origLoad.call(this, request, ...rest);
};
const { policyFor } = require('../../src/main/permissions');
const { resolveUiPath, UI_ROOT } = require('../../src/main/protocol');
Module._load = origLoad;
const urls = require('../../src/shared/urls');
const { sanitizeFilename, classifyRisk, hasDeceptiveExtension } = require('../../src/shared/filenames');
const { rank, fuzzyScore } = require('../../src/shared/fuzzy');
const { Store, ftsQuery } = require('../../src/main/store');
const { esc, errorPageHtml } = require('../../src/main/error-page');

const N = Number(process.env.FUZZ_ITERATIONS || 3000);

function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PIECES = [
  'http://', 'https://', 'javascript:', 'data:text/html,', 'vbscript:', 'blob:', 'file:///', 'nadir://', 'view-source:', 'about:', 'ftp://', 'chrome://', 'JaVaScRiPt:', ' javascript:', '\tjavascript:', 'java\nscript:',
  'example.com', 'localhost', '127.0.0.1', '[::1]', '[fe80::1]', '10.0.0.1', '192.168.1.1', '0x7f.1', '1.2.3', 'xn--e1afmkfd.xn--p1ai', 'пример.рф', '日本語.jp', 'a'.repeat(200), 'a'.repeat(5000),
  ':8080', ':99999', ':', '@', '#', '?', '&', '=', '%', '%00', '%2e%2e', '%2f', '%5c', '%u0041', '%zz', '/', '//', '\\', '..', '../', '..\\', '.', '/./', '\u0000', '\u0001', '\u007f', '‮', '‭', '⁦', '​', '﻿',
  ' ', '  ', '\n', '\r\n', '\t', '"', "'", '<', '>', '<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', '`', '$', '{', '}', '(', ')', '*', '|', ';', '--', "' OR 1=1 --", '"; DROP TABLE history; --', 'NEAR/3', 'AND', 'OR', 'NOT',
  'utm_source=x', 'fbclid=1', 'gclid=2', 'CON', 'NUL', 'aux', 'com1', 'LPT9', '.exe', '.EXE', '.pdf.exe', '.txt‮gpj.exe', '.lnk', '.js', '.bat', '.html', '😀', '\ud800', '\udfff', '𝒜', 'İ', 'ß', 'ǅ',
];
const gen = (rnd, maxPieces = 8) => { let s = ''; const k = 1 + Math.floor(rnd() * maxPieces); for (let i = 0; i < k; i++) s += PIECES[Math.floor(rnd() * PIECES.length)]; return s; };
const forAll = (name, seed, fn) => {
  const rnd = prng(seed);
  for (let i = 0; i < N; i++) {
    const input = gen(rnd);
    try { fn(input); } catch (e) { e.message = `${name} failed (seed ${seed}, iteration ${i}) for input ${JSON.stringify(input.slice(0, 200))}: ${e.message}`; throw e; }
  }
};

test('fuzz: resolveInput never throws and never yields an executable-scheme URL', () => {
  const tpl = 'https://duckduckgo.com/?q=%s';
  forAll('resolveInput', 1, (input) => {
    const r = urls.resolveInput(input, tpl);
    assert.ok(['empty', 'url', 'search', 'blocked', 'error'].includes(r.kind) || typeof r.kind === 'string', 'kind is a string');
    if (r.kind === 'url') {
      const u = new URL(r.url);
      assert.ok(urls.NAVIGABLE.has(u.protocol), `navigable scheme only, got ${u.protocol}`);
      assert.ok(!urls.BLOCKED.has(u.protocol), 'never a blocked scheme');
    }
    if (r.kind === 'search') assert.ok(r.url.startsWith('https://duckduckgo.com/?q='), 'search stays on the provider');
  });
});

test('fuzz: URL helpers never throw; tracking removal is idempotent and never adds a scheme', () => {
  forAll('url-helpers', 2, (input) => {
    const candidates = [input, `https://${input}`, `http://${input}/?${input}`];
    for (const c of candidates) {
      urls.displayHost(c); urls.isInternalUrl(c); urls.shouldUpgrade(c);
      const up = urls.upgradeUrl(c);
      if (typeof up === 'string' && /^[a-z][a-z0-9+.-]*:/i.test(up)) assert.ok(/^https?:/i.test(up) || !/^https?:/i.test(c), 'upgrade only produces http(s)');
      const once = urls.stripTracking(c);
      assert.equal(urls.stripTracking(once), once, 'stripTracking is idempotent');
    }
  });
});

test('fuzz: sanitizeFilename always yields a safe single path component', () => {
  forAll('sanitizeFilename', 3, (input) => {
    const n = sanitizeFilename(input);
    assert.equal(typeof n, 'string');
    assert.ok(n.length > 0 && n.length <= 150, `length ${n.length}`);
    assert.ok(!/[\\/]/.test(n), 'no path separators');
    assert.ok(!/[\u0000-\u001f\u007f<>:"|?*]/.test(n), 'no control or Windows-illegal characters');
    assert.ok(!/[‪-‮⁦-⁩]/.test(n), 'no bidi override characters');
    assert.ok(n !== '.' && n !== '..', 'not a dot entry');
    assert.ok(!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(n), 'not a reserved device name');
    assert.ok(!/[. ]$/.test(n), `no trailing dot or space: ${JSON.stringify(n.slice(-10))}`);
    classifyRisk(n); hasDeceptiveExtension(n);
  });
});

test('fuzz: nadir:// resolver never escapes the UI directory', () => {
  const hosts = ['shell', 'overlay', 'newtab', 'app', 'assets', 'evil', '', 'SHELL'];
  forAll('resolveUiPath', 4, (input) => {
    for (const h of hosts) {
      for (const u of [`nadir://${h}/${input}`, `nadir://${h}${input}`, `nadir://${input}/`]) {
        const p = resolveUiPath(u);
        if (p !== null) {
          const abs = path.resolve(p);
          assert.ok(abs.startsWith(path.resolve(UI_ROOT) + path.sep), `escaped UI root: ${abs}`);
        }
      }
    }
  });
});

test('fuzz: history search treats every query as data (no throw, no SQL effect)', () => {
  const s = new Store(':memory:');
  s.addVisit({ workspaceId: 'default', url: 'https://example.com/a', title: 'Example page about cats' });
  forAll('ftsQuery/searchHistory', 5, (input) => {
    ftsQuery(input);
    const rows = s.searchHistory(input, { workspaceId: 'default' });
    assert.ok(Array.isArray(rows));
  });
  assert.equal(s.db.prepare('select count(*) c from history').get().c >= 1, true, 'history table survived');
  s.close();
});

test('fuzz: permission policy only allows the explicit allow-list and never prompts in subframes', () => {
  const allowed = new Set(['clipboard-sanitized-write', 'fullscreen']);
  forAll('policyFor', 6, (input) => {
    const main = policyFor(input);
    const sub = policyFor(input, { isMainFrame: false });
    if (main === 'allow') assert.ok(allowed.has(input), `unexpected allow for ${input}`);
    assert.notEqual(sub, 'prompt', 'subframes never prompt');
  });
});

test('fuzz: HTML escaping and the error page never emit raw markup from input', () => {
  forAll('esc/errorPage', 7, (input) => {
    const e = esc(input);
    assert.ok(!/[<>"']/.test(e), 'escaped text has no raw < > " \'');
    const html = errorPageHtml({ url: `https://${input}`, code: 'ERR_X', desc: input, httpFallback: false });
    assert.ok(!/<script/i.test(html), 'no script element');
    // Input text is escaped, so every remaining '<...>' is the page's own template: none may carry an on* handler.
    // Quoted attribute values are removed first: escaped input may legitimately contain the text " onerror=" inside one.
    const bare = html.replace(/<style[\s\S]*?<\/style>/i, '').replace(/"[^"]*"/g, '""');
    assert.ok(!/<[^>]*\son\w+\s*=/i.test(bare), 'no inline event handlers on any tag');
    for (const m of html.matchAll(/href="([^"]*)"/g)) assert.ok(/^(https?:|nadir:\/\/allow-http\?)/i.test(m[1]) , `href must be http(s) or the allow-http link, got ${m[1].slice(0, 40)}`);
  });
});

test('fuzz: fuzzy ranking never throws and respects the limit', () => {
  const items = ['Close tab', 'New workspace', 'github.com/pulls', 'Settings', 'History', 'Privacy dashboard'];
  forAll('rank', 8, (input) => {
    fuzzyScore(input, 'Close tab');
    const r = rank(items, input, [(x) => x], 3);
    assert.ok(r.length <= 3);
  });
});
