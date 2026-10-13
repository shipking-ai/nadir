// SPDX-License-Identifier: GPL-3.0-or-later
// Discovery sweep: runs many GitHub topic/keyword searches (via an authenticated `gh`), plus npm and crates.io
// searches, and writes a deduplicated candidate list to docs/research/discovery-<date>.tsv.
// Usage: node scripts/discover.js
// Rate limits: GitHub search allows 30 requests/min authenticated; this script sleeps between calls.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MIN_STARS = 150;

// ---- GitHub: topics -------------------------------------------------------------------------
const TOPICS = [
  // engines, browsers, shells
  'browser-engine', 'web-browser', 'browser', 'browsers', 'chromium', 'chromium-browser', 'chromium-fork', 'firefox', 'firefox-fork', 'gecko',
  'webkit', 'blink', 'servo', 'rendering-engine', 'html-renderer', 'layout-engine', 'javascript-engine', 'css-engine', 'electron-browser',
  'cef', 'chromium-embedded-framework', 'webview', 'webview2', 'qtwebengine', 'tauri', 'electron', 'nwjs', 'wails', 'neutralino',
  'text-browser', 'terminal-browser', 'tui-browser', 'cli-browser', 'minimal-browser', 'lightweight-browser', 'keyboard-driven-browser', 'vim-browser',
  'privacy-browser', 'secure-browser', 'private-browser', 'tor-browser', 'decentralized-browser', 'ipfs-browser', 'p2p-browser', 'gemini-browser', 'gopher',
  'android-browser', 'ios-browser', 'mobile-browser', 'geckoview', 'vr-browser', 'ai-browser', 'agentic-browser', 'browser-agent',
  // privacy / security
  'adblock', 'ad-blocker', 'adblocker', 'adblock-plus', 'tracker-blocker', 'tracking-protection', 'privacy', 'anti-fingerprinting', 'fingerprinting',
  'browser-fingerprinting', 'canvas-fingerprinting', 'cookie-banner', 'cookie-consent', 'cookie-manager', 'dns-over-https', 'dns-over-tls', 'doh', 'dnscrypt',
  'content-blocker', 'filter-lists', 'safe-browsing', 'phishing-detection', 'malicious-url', 'sandbox', 'browser-security', 'https-everywhere', 'hsts',
  'certificate-transparency', 'tls', 'ech', 'vpn-extension', 'proxy-manager', 'socks5-proxy', 'webrtc-leak', 'user-agent-switcher', 'link-cleaner', 'clearurls',
  // extensions
  'webextension', 'webextensions', 'browser-extension', 'chrome-extension', 'firefox-addon', 'manifest-v3', 'userscript', 'userscripts', 'greasemonkey',
  'tampermonkey', 'userstyles', 'stylus', 'devtools-extension', 'extension-manager',
  // productivity / UX
  'tab-manager', 'tabs', 'vertical-tabs', 'tab-groups', 'tab-suspender', 'session-manager', 'workspace-manager', 'bookmark-manager', 'bookmarks', 'bookmarking',
  'read-it-later', 'reader-mode', 'readability', 'web-clipper', 'web-archive', 'web-archiving', 'webpage-archive', 'screenshot', 'full-page-screenshot',
  'pdf-viewer', 'annotation', 'web-annotation', 'highlighter', 'translation', 'web-translation', 'dark-mode', 'new-tab-page', 'start-page', 'speed-dial',
  'command-palette', 'omnibox', 'search-engine', 'metasearch', 'meta-search-engine', 'local-search', 'semantic-search', 'history-search', 'full-text-search',
  'password-manager', 'autofill', 'two-factor', 'passkeys', 'webauthn', 'sync', 'e2ee', 'download-manager', 'video-downloader', 'picture-in-picture',
  'media-player', 'subtitles', 'audio-routing', 'tts', 'screen-reader', 'accessibility', 'a11y', 'keyboard-navigation', 'gesture', 'mouse-gestures',
  // developer
  'devtools', 'chrome-devtools', 'chrome-devtools-protocol', 'cdp', 'webdriver', 'webdriver-bidi', 'selenium', 'puppeteer', 'playwright', 'browser-automation',
  'web-automation', 'headless-browser', 'headless-chrome', 'web-scraping', 'crawler', 'browser-testing', 'e2e-testing', 'browser-use', 'computer-use',
  'accessibility-tree', 'web-agent', 'llm-browser', 'mcp-browser', 'network-inspector', 'http-debugging', 'har', 'web-performance', 'lighthouse', 'profiling',
  'browser-compatibility', 'browserslist', 'polyfill', 'web-standards', 'wpt', 'web-platform-tests', 'html-parser', 'css-parser', 'url-parser', 'public-suffix-list',
  'cookie-parser', 'http3', 'quic', 'websocket', 'webassembly', 'wasm-runtime', 'webgpu', 'webgl',
  // local AI
  'local-llm', 'llm', 'webllm', 'llama-cpp', 'ollama', 'on-device-ai', 'transformers-js', 'embeddings', 'vector-database', 'rag', 'summarization', 'chrome-ai',
  // portability / infra
  'browser-sync', 'bookmark-sync', 'import-export', 'browser-history', 'self-hosted', 'selfhosted', 'webdav', 'syncthing', 'cross-platform-browser',
];

// ---- GitHub: keyword queries -----------------------------------------------------------------
const KEYWORDS = [
  'web browser from scratch', 'browser engine written in', 'html css rendering engine', 'chromium fork privacy', 'chromium patches', 'firefox fork privacy',
  'custom browser electron', 'minimal web browser', 'browser built with rust', 'browser built with go', 'browser written in c++ qt', 'browser written in python',
  'browser written in zig', 'browser in swift', 'browser in kotlin', 'open source browser', 'alternative web browser', 'ad blocking engine', 'filter list parser',
  'adblock rust', 'tracker radar', 'fingerprint protection', 'browser fingerprint', 'private search browser', 'browser sidebar', 'ai browser agent open source',
  'natural language browser control', 'browser extension framework', 'webextension polyfill', 'chrome extension in electron', 'extension api electron',
  'tab suspender', 'tab hibernate', 'vertical tabs browser', 'tree style tabs', 'workspaces browser', 'split view browser', 'reader view library',
  'article extraction library', 'webpage to markdown', 'web archive tool', 'readability algorithm', 'semantic history search browser', 'browsing history local ai',
  'doh proxy', 'dns over https client', 'dns filtering', 'local dns blocker', 'privacy proxy', 'mitm proxy', 'http proxy filtering', 'certificate pinning',
  'browser profile manager', 'multi account browser', 'anti detect browser', 'browser isolation', 'remote browser isolation', 'containerised tabs', 'site isolation',
  'sandboxing library', 'wasm sandbox', 'browser benchmark', 'speedometer', 'web performance benchmark', 'memory profiler browser', 'startup time benchmark',
  'webview wrapper', 'embedded browser component', 'webview library cross platform', 'chromium embedded wrapper', 'electron alternative', 'lightweight electron alternative',
  'media extension firefox', 'video speed controller', 'picture in picture extension', 'subtitle extension', 'translation extension local', 'screenshot extension',
  'bookmark manager open source', 'bookmark search', 'password manager open source', 'passkey manager', 'download manager open source',
  'gemini protocol browser', 'gopher browser', 'ipfs browser', 'tor integration browser', 'i2p browser', 'mobile browser open source android', 'ios browser open source',
  'keyboard driven browser', 'vim keybindings browser', 'command palette extension', 'omnibox extension',
];

// ---- npm / crates.io ---------------------------------------------------------------------------
const NPM = ['adblock', 'adblocker', 'filter list', 'electron browser', 'electron extension', 'webextension', 'readability', 'reader mode', 'article extractor',
  'html to markdown', 'tracker blocking', 'url tracking params', 'clean urls', 'public suffix', 'tldts', 'cookie consent', 'fingerprint', 'user agent parser',
  'chrome devtools protocol', 'playwright', 'puppeteer', 'webdriver', 'accessibility tree', 'browser automation', 'local llm', 'webllm', 'transformers.js',
  'embeddings local', 'sqlite fts', 'vector search', 'doh', 'dns over https', 'proxy agent', 'tor', 'bookmarks', 'browser history', 'sync encrypted', 'libsodium',
  'pdf viewer', 'pdf.js', 'screenshot webpage', 'webview', 'wry', 'tauri', 'neutralino', 'nwjs'];
const CRATES = ['browser', 'browser engine', 'html parser', 'css parser', 'servo', 'webview', 'adblock', 'readability', 'url', 'publicsuffix', 'cookie', 'doh',
  'dns over https', 'tls', 'wasm runtime', 'javascript engine', 'layout engine', 'tab', 'chromiumoxide', 'headless chrome', 'webdriver', 'fingerprint'];

const rows = new Map();
const note = (key, rec) => { const r = rows.get(key) || { ...rec, hits: new Set() }; rec.hits.forEach((h) => r.hits.add(h)); rows.set(key, r); };
const errors = [];

function gh(args) {
  try { return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })); }
  catch (e) { errors.push(`${args.slice(0, 4).join(' ')}: ${String(e.stderr || e.message).split('\n')[0]}`); return null; }
}
const FIELDS = 'fullName,description,stargazersCount,license,pushedAt,isArchived,language,createdAt';

async function ghSearch(label, extra) {
  const out = gh(['search', 'repos', ...extra, `--stars=>=${MIN_STARS}`, '--limit', '100', '--sort', 'stars', '--json', FIELDS]);
  if (out) for (const r of out) note(`gh:${r.fullName}`, { src: 'github', name: r.fullName, stars: r.stargazersCount, license: r.license?.key || '', pushed: (r.pushedAt || '').slice(0, 10), archived: r.isArchived ? 'archived' : '', lang: r.language || '', desc: (r.description || '').replace(/[\t\n\r]+/g, ' ').slice(0, 160), hits: new Set([label]) });
  await sleep(2300); // stay under 30 req/min
  return out ? out.length : -1;
}

async function npmSearch(q) {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=60&quality=0.0&popularity=1.0&maintenance=0.3`);
    const j = await res.json();
    for (const o of j.objects || []) {
      const p = o.package;
      note(`npm:${p.name}`, { src: 'npm', name: p.name, stars: '', license: p.license || '', pushed: (p.date || '').slice(0, 10), archived: '', lang: 'js', desc: (p.description || '').replace(/[\t\n\r]+/g, ' ').slice(0, 160), hits: new Set([`npm:${q}`]), score: Math.round((o.score?.detail?.popularity || 0) * 100) });
    }
  } catch (e) { errors.push(`npm ${q}: ${e.message}`); }
  await sleep(400);
}

async function cratesSearch(q) {
  try {
    const res = await fetch(`https://crates.io/api/v1/crates?q=${encodeURIComponent(q)}&per_page=40&sort=downloads`, { headers: { 'user-agent': 'nadir-research (open-source browser research)' } });
    const j = await res.json();
    for (const c of j.crates || []) note(`crates:${c.name}`, { src: 'crates.io', name: c.name, stars: '', license: '', pushed: (c.updated_at || '').slice(0, 10), archived: '', lang: 'rust', desc: (c.description || '').replace(/[\t\n\r]+/g, ' ').slice(0, 160), hits: new Set([`crates:${q}`]), downloads: c.downloads });
  } catch (e) { errors.push(`crates ${q}: ${e.message}`); }
  await sleep(1100); // crates.io asks for <= 1 req/s
}

(async () => {
  const t0 = Date.now();
  let n = 0;
  for (const t of TOPICS) { const c = await ghSearch(`topic:${t}`, ['--topic', t]); n++; if (n % 25 === 0) console.log(`topics ${n}/${TOPICS.length}, unique so far ${rows.size}`); if (c === -1) await sleep(5000); }
  n = 0;
  for (const k of KEYWORDS) { const c = await ghSearch(`kw:${k}`, [k]); n++; if (n % 25 === 0) console.log(`keywords ${n}/${KEYWORDS.length}, unique so far ${rows.size}`); if (c === -1) await sleep(5000); }
  for (const q of NPM) await npmSearch(q);
  for (const q of CRATES) await cratesSearch(q);

  const out = [...rows.values()].map((r) => ({ ...r, hits: [...r.hits] }));
  out.sort((a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0) || String(a.name).localeCompare(b.name));
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(__dirname, '..', 'docs', 'research', `discovery-${date}.tsv`);
  const head = ['source', 'name', 'stars', 'license', 'last_push', 'archived', 'language', 'queries_matched', 'description'];
  fs.writeFileSync(file, [head.join('\t'), ...out.map((r) => [r.src, r.name, r.stars, r.license, r.pushed, r.archived, r.lang, r.hits.length, r.desc].join('\t'))].join('\n'));
  fs.writeFileSync(file.replace('.tsv', '.errors.txt'), errors.join('\n'));
  console.log(`DONE ${out.length} unique candidates in ${Math.round((Date.now() - t0) / 1000)}s; ${errors.length} errors -> ${file}`);
})();
