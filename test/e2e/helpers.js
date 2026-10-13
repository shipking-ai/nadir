// SPDX-License-Identifier: GPL-3.0-or-later
const { _electron: electron } = require('playwright-core');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..', '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(fn, { timeout = 15000, step = 100, what = 'condition' } = {}) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < timeout) {
    try { const v = await fn(); if (v) return v; } catch (e) { last = e; }
    await sleep(step);
  }
  throw new Error(`Timed out waiting for ${what}${last ? `: ${last.message}` : ''}`);
}

/** Launch Pelorus against an isolated profile. PELORUS_OFFLINE keeps tests off the network. */
async function launch({ userData, downloadDir, args = [], headless = true, env = {} } = {}) {
  userData ||= fs.mkdtempSync(path.join(os.tmpdir(), 'pelorus-e2e-'));
  downloadDir ||= fs.mkdtempSync(path.join(os.tmpdir(), 'pelorus-dl-'));
  const app = await electron.launch({
    colorScheme: null, // do not let Playwright emulate prefers-color-scheme; we test the real theme
    args: [ROOT, '--host-resolver-rules=MAP *.example.net 127.0.0.1', ...args],
    env: { ...process.env, ...env, PELORUS_USER_DATA: userData, PELORUS_DOWNLOAD_DIR: downloadDir, PELORUS_TEST: '1', PELORUS_OFFLINE: '1', PELORUS_HEADLESS: headless ? '1' : '0' },
  });
  const shell = await until(() => app.windows().find((p) => p.url() === 'pelorus://shell/'), { what: 'shell window' });
  await shell.waitForLoadState('domcontentloaded');
  const api = {
    app, shell, userData, downloadDir,
    pages: () => app.windows(),
    page: (prefix) => until(() => app.windows().find((p) => p.url().startsWith(prefix)), { what: `page ${prefix}` }),
    state: () => shell.evaluate(() => window.pelorus.invoke('state:get')),
    invoke: (ch, payload) => shell.evaluate(([c, p]) => window.pelorus.invoke(c, p), [ch, payload]),
    navigate: (input) => shell.evaluate((i) => window.pelorus.invoke('tab:navigate', { input: i }), input),
    active: async () => { const s = await api.state(); return s.tabs.find((t) => t.id === s.activeId); },
    main: (fn, arg) => app.evaluate(fn, arg),
    ctl: (expr, arg) => app.evaluate((_e, [code, a]) => { const f = new Function('c', 'a', `return (${code})`); return f(global.__pelorus, a); }, [expr, arg]),
    // Bounded close: a quit that never finishes must not stall the whole test run. If it times out, say what was open
    // (so the cause can be found) and kill the process.
    close: async () => {
      const proc = app.process();
      let timer;
      try {
        await Promise.race([app.close(), new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('close timed out')), 20000); })]);
      } catch (e) {
        console.error(`[helpers] ${e.message}; open windows: ${JSON.stringify(app.windows().map((w) => w.url()))}; pid ${proc.pid} exitCode ${proc.exitCode}`);
        try {
          if (process.platform === 'win32') require('node:child_process').execFileSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
          else proc.kill('SIGKILL');
        } catch { /* already gone */ }
      } finally { clearTimeout(timer); }
    },
  };
  await until(async () => (await api.state()).tabs.length >= 1, { what: 'first tab' });
  return api;
}

/** Local web server with routes that exercise the browser. */
function startServer() {
  const hits = [];
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    hits.push(u.pathname + u.search);
    const html = (title, body = '', head = '') => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(`<!doctype html><title>${title}</title>${head}<body>${body}</body>`); };
    switch (u.pathname) {
      case '/': return html('Home Page', '<h1>hello</h1><a id="l" href="/page2">two</a>');
      case '/page2': return html('Second Page', 'second');
      case '/fav': return html('Favicon Page', 'icon', '<link rel="icon" type="image/png" href="/icon.png">');
      case '/icon.png': res.writeHead(200, { 'content-type': 'image/png' }); return res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
      case '/cookie-set': res.setHeader('set-cookie', 'sid=abc123; Path=/'); return html('Cookie Set');
      case '/cookie-read': return html('Cookie Read', `<pre id="c">${req.headers.cookie || 'none'}</pre>`);
      case '/tracked': return html('Tracked', '<img id="px" src="/blocked-pixel.png?x=1"><img id="ok" src="/ok.png">');
      case '/blocked-pixel.png': case '/ok.png': res.writeHead(200, { 'content-type': 'image/gif' }); return res.end(Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'));
      case '/geo': return html('Geo', '', '<script>navigator.geolocation.getCurrentPosition(()=>document.title="geo:granted",e=>document.title="geo:denied:"+e.code)</script>');
      case '/geo-frame': return html('Geo Frame', `<iframe id="f" src="http://127.0.0.1:${srv.address().port}/geo"></iframe>`);
      case '/popup-link': return html('Popup Link', '<a id="nt" target="_blank" href="/page2">blank</a>');
      case '/file.zip': res.writeHead(200, { 'content-type': 'application/zip', 'content-disposition': 'attachment; filename="data.zip"' }); return res.end('PK-test');
      case '/evil': res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-disposition': 'attachment; filename="..\\..\\invoice.pdf.exe"' }); return res.end('MZ-test');
      case '/headers': return html('Headers', `<pre id="h">${JSON.stringify({ gpc: req.headers['sec-gpc'], ua: req.headers['user-agent'] })}</pre>`);
      case '/codecs': return html('Codecs', '', `<script>
        const t = (m) => typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(m);
        const v = document.createElement('video');
        window.__codecs = { h264: t('video/mp4; codecs="avc1.42E01E"'), aac: t('audio/mp4; codecs="mp4a.40.2"'), vp9: t('video/webm; codecs="vp9"'), av1: t('video/mp4; codecs="av01.0.05M.08"'), opus: t('audio/webm; codecs="opus"'),
          h264video: v.canPlayType('video/mp4; codecs="avc1.42E01E"'), mp3: v.canPlayType('audio/mpeg') };
        const done = (w) => { window.__codecs.widevine = w; document.title = 'codecs:' + JSON.stringify(window.__codecs); };
        (navigator.requestMediaKeySystemAccess ? navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{ initDataTypes: ['cenc'], videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }] }]).then(() => done(true), () => done(false)) : Promise.resolve(done(false)));</script>`);
      case '/query': return html('Query', `<pre id="q">${u.search}</pre>`);
      case '/probe': return html('Probe', '', '<script>document.title=[typeof window.pelorus,typeof require,typeof process,typeof window.electron].join(",")</script>');
      case '/to-internal': return html('To Internal', '<a id="a" href="pelorus://app/#/settings">x</a>');
      default: res.writeHead(404); return res.end('nope');
    }
  });
  return new Promise((resolve) => srv.listen(0, '127.0.0.1', () => {
    const port = srv.address().port;
    resolve({ port, hits, origin: `http://127.0.0.1:${port}`, host: (n) => `http://${n}:${port}`, close: () => new Promise((r) => srv.close(r)) });
  }));
}

module.exports = { launch, startServer, until, sleep };
