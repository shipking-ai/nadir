// SPDX-License-Identifier: GPL-3.0-or-later
// End-to-end tests: a real Nadir process browsing a local server. No external network.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { launch, startServer, until, sleep } = require('./helpers');

let b; let srv;
const tabUrl = async () => (await b.active()).url;
const tabTitle = async () => (await b.active()).title;
const waitTitle = (t) => until(async () => (await tabTitle()) === t, { what: `title "${t}"`, timeout: 15000 });

test.before(async () => { srv = await startServer(); b = await launch(); });
test.after(async () => { await b?.close(); await srv?.close(); });

test('starts with one new-tab page in the default workspace', async () => {
  const s = await b.state();
  assert.equal(s.tabs.length, 1);
  assert.equal(s.currentWorkspace, 'default');
  assert.equal(s.tabs[0].url, 'nadir://newtab/');
  const nt = await b.page('nadir://newtab');
  assert.match(await nt.locator('input.search').getAttribute('placeholder'), /DuckDuckGo/);
});

test('navigates to a page, updates title/url, records history', async () => {
  const r = await b.navigate(`${srv.origin}/`);
  assert.equal(r.ok, true);
  await waitTitle('Home Page');
  assert.equal(await tabUrl(), `${srv.origin}/`);
  const hist = await b.ctl('c.store.recentHistory("default").map(h => h.url)');
  assert.ok(hist.includes(`${srv.origin}/`));
});

test('link click navigates; back/forward work', async () => {
  const page = await b.page(srv.origin);
  await page.click('#l');
  await waitTitle('Second Page');
  await b.invoke('tab:nav', { action: 'back' });
  await waitTitle('Home Page');
  assert.equal((await b.active()).canGoForward, true);
  await b.invoke('tab:nav', { action: 'forward' });
  await waitTitle('Second Page');
});

test('typed text that is not a URL becomes a search; dangerous schemes are refused', async () => {
  const bad = await b.navigate('javascript:alert(1)');
  assert.equal(bad.ok, false);
  const bad2 = await b.navigate('data:text/html,<script>1</script>');
  assert.equal(bad2.ok, false);
  assert.equal(await tabUrl(), `${srv.origin}/page2`, 'tab did not move');
  const t = await b.ctl('c.searchTemplate()');
  assert.match(t.url, /duckduckgo/);
});

test('tabs: open, switch, close, reopen closed', async () => {
  const id = await b.invoke('tab:new', { url: `${srv.origin}/query` });
  await until(async () => (await b.state()).tabs.length === 2);
  assert.equal((await b.state()).activeId, id);
  await waitTitle('Query');
  await b.invoke('tab:close', id);
  await until(async () => (await b.state()).tabs.length === 1);
  await b.ctl('c.tabs.exec("reopen-tab")');
  await until(async () => (await b.state()).tabs.length === 2);
  await waitTitle('Query');
  const s = await b.state();
  await b.invoke('tab:close', s.activeId);
  await until(async () => (await b.state()).tabs.length === 1);
});

test('target=_blank links open in a new tab', async () => {
  await b.navigate(`${srv.origin}/popup-link`);
  await waitTitle('Popup Link');
  const page = await b.page(srv.origin + '/popup-link');
  await page.click('#nt');
  await until(async () => (await b.state()).tabs.length === 2);
  await waitTitle('Second Page');
  await b.invoke('tab:close', (await b.state()).activeId);
  await until(async () => (await b.state()).tabs.length === 1);
});

test('tracking parameters are stripped from navigations', async () => {
  await b.navigate(`${srv.origin}/query?keep=1&utm_source=x&fbclid=y`);
  await waitTitle('Query');
  const page = await b.page(srv.origin + '/query');
  assert.equal(await page.locator('#q').innerText(), '?keep=1');
});

test('every request carries Global Privacy Control and a UA without Electron/app tokens', async () => {
  await b.navigate(`${srv.origin}/headers`);
  await waitTitle('Headers');
  const info = JSON.parse(await (await b.page(srv.origin + '/headers')).locator('#h').innerText());
  assert.equal(info.gpc, '1');
  assert.match(info.ua, /Chrome\/\d+/);
  assert.ok(!/Electron|nadir/i.test(info.ua), `UA leaks the shell: ${info.ua}`);
});

test('media codec probe (recorded, not asserted): what this build can decode', async () => {
  await b.navigate(`${srv.origin}/codecs`);
  await until(async () => (await tabTitle()).startsWith('codecs:'));
  const codecs = JSON.parse((await tabTitle()).slice('codecs:'.length));
  console.log('CODEC PROBE', JSON.stringify(codecs));
  // Open formats must work; proprietary ones are reported, because Electron builds omit some of them.
  assert.equal(codecs.vp9, true);
  assert.equal(codecs.opus, true);
});

test('workspaces isolate cookies, history and tabs', async () => {
  await b.navigate(`${srv.origin}/cookie-set`);
  await waitTitle('Cookie Set');
  await b.navigate(`${srv.origin}/cookie-read`);
  await waitTitle('Cookie Read');
  assert.match(await (await b.page(srv.origin + '/cookie-read')).locator('#c').innerText(), /sid=abc123/);

  const wsId = await b.ctl('c.createWorkspace("Research")');
  await until(async () => (await b.state()).currentWorkspace === wsId);
  assert.equal((await b.state()).tabs.length, 1, 'new workspace starts with its own single tab');
  await b.navigate(`${srv.origin}/cookie-read`);
  await waitTitle('Cookie Read');
  const page = await until(() => b.pages().filter((p) => p.url().startsWith(srv.origin + '/cookie-read')).pop());
  assert.equal(await page.locator('#c').innerText(), 'none', 'cookie from the other workspace must not be visible');
  assert.equal(await b.ctl('c.store.recentHistory(a).length', wsId) > 0, true);
  assert.equal(await b.ctl('c.store.searchHistory("Cookie", {workspaceId: "default"}).length > 0'), true);

  await b.invoke('workspace:switch', 'default');
  await until(async () => (await b.state()).currentWorkspace === 'default');
  await until(async () => (await b.state()).tabs.some((t) => t.url.includes('cookie-read')));
});

test('private tabs: no history, separate storage, not restored', async () => {
  const before = await b.ctl('c.store.recentHistory(null, 1000).length');
  await b.ctl('c.tabs.newPrivateTab()');
  await until(async () => (await b.state()).currentWorkspace === 'private');
  await b.navigate(`${srv.origin}/cookie-read`);
  await waitTitle('Cookie Read');
  const page = await until(() => b.pages().filter((p) => p.url().startsWith(srv.origin + '/cookie-read')).pop());
  assert.equal(await page.locator('#c').innerText(), 'none');
  assert.equal(await b.ctl('c.store.recentHistory(null, 1000).length'), before, 'private browsing wrote history');
  assert.equal(await b.ctl('c.tabs.serialize().tabs.some(t => t.workspaceId === "private")'), false);
  await b.invoke('tab:close', (await b.state()).activeId);
  await until(async () => (await b.state()).currentWorkspace !== 'private');
});

test('ad/tracker blocking cancels matching sub-resources and counts them per tab', async () => {
  await b.ctl(`(() => { const e = c.blocker.engine.constructor.parse('/blocked-pixel.png^'); c.blocker.engine = e; c.blocker.listsLoaded = true; return true; })()`);
  srv.hits.length = 0;
  await b.navigate(`${srv.origin}/tracked`);
  await waitTitle('Tracked');
  await until(async () => srv.hits.includes('/ok.png'), { what: 'allowed image request' });
  await sleep(500);
  assert.ok(!srv.hits.some((h) => h.startsWith('/blocked-pixel.png')), 'blocked request reached the server');
  await until(async () => (await b.active()).blocked >= 1, { what: 'blocked counter' });
});

test('blocking can be switched off', async () => {
  await b.ctl('c.setSetting("blocking", { enabled: false })');
  srv.hits.length = 0;
  await b.navigate(`${srv.origin}/tracked?again=1`);
  await until(async () => srv.hits.some((h) => h.startsWith('/blocked-pixel.png')), { what: 'pixel loads when blocking is off' });
  await b.ctl('c.setSetting("blocking", { enabled: true })');
});

test('permissions: denied by default until the user answers; prompt is shown; remembered per workspace', async () => {
  await b.navigate(`${srv.origin}/geo`);
  await until(async () => b.ctl('!!c.permCurrent'), { what: 'permission prompt queued' });
  assert.equal(await b.ctl('c.overlay.webContents.isDestroyed() === false && c.ov.kind'), 'permission');
  const ov = await b.page('nadir://overlay');
  assert.match(await ov.locator('.perm h2').innerText(), /wants to know your location/);
  assert.equal(await ov.evaluate(() => document.activeElement.textContent), 'Block', 'safe choice has focus');
  await ov.click('text=Block');
  await waitTitle('geo:denied:1');
  assert.equal(await b.ctl('c.store.permissions().length'), 1);
  // remembered: no second prompt
  await b.navigate(`${srv.origin}/geo?again`);
  await waitTitle('geo:denied:1');
  assert.equal(await b.ctl('!!c.permCurrent'), false);
});

test('permissions: cross-origin subframes are denied without prompting', async () => {
  await b.ctl('c.store.permissions().forEach(p => c.store.clearPermission(p.workspace_id, p.origin, p.permission))');
  await b.navigate(`${srv.origin}/geo-frame`);
  await waitTitle('Geo Frame');
  await sleep(1200);
  assert.equal(await b.ctl('!!c.permCurrent'), false, 'a subframe must not be able to raise a prompt');
});

test('web content has no access to privileged APIs and cannot reach nadir:// pages', async () => {
  await b.navigate(`${srv.origin}/probe`);
  await until(async () => (await tabTitle()).startsWith('undefined'));
  assert.equal(await tabTitle(), 'undefined,undefined,undefined,undefined');
  await b.navigate(`${srv.origin}/to-internal`);
  await waitTitle('To Internal');
  const page = await b.page(srv.origin + '/to-internal');
  await page.click('#a', { timeout: 3000, noWaitAfter: true }).catch(() => {});
  await sleep(800);
  assert.equal(await tabUrl(), `${srv.origin}/to-internal`, 'web page navigated into nadir://');
  assert.equal((await b.active()).kind, 'web');
});

test('IPC trust boundaries: each surface can only call its own channels', async () => {
  // shell cannot call internal-page channels
  await assert.rejects(b.invoke('settings:set', { key: 'theme', value: 'dark' }), /Blocked channel/);
  await assert.rejects(b.invoke('history:clear', {}), /Blocked channel/);
  // internal page cannot call shell channels
  await b.navigate('nadir://app/#/settings');
  const app = await b.page('nadir://app');
  await assert.rejects(app.evaluate(() => window.nadir.invoke('tab:close', 1)), /Blocked channel/);
  await assert.rejects(app.evaluate(() => window.nadir.invoke('cmd', 'new-tab')), /Blocked channel/);
  // Main-side enforcement, independent of the preload allowlist: a window with RAW ipcRenderer access
  // (a stand-in for a compromised renderer) must still be rejected for every privileged channel.
  const preload = path.join(b.userData, 'raw-preload.js');
  fs.writeFileSync(preload, "window.raw = require('electron').ipcRenderer;");
  const results = await b.app.evaluate(async ({ BrowserWindow }, preloadPath) => {
    const w = new BrowserWindow({ show: false, webPreferences: { preload: preloadPath, sandbox: true, contextIsolation: false } });
    await w.loadURL('about:blank');
    const out = {};
    for (const [ch, arg] of [['settings:set', { key: 'theme', value: 'dark' }], ['history:clear', {}], ['tab:close', 1], ['cmd', 'new-tab'], ['downloads:open', { id: 1 }], ['data:clear', {}], ['omnibox:pick', 0], ['permission:answer', { decision: 'allow', remember: true }]]) {
      out[ch] = await w.webContents.executeJavaScript(`raw.invoke('nadir:${ch}', ${JSON.stringify(arg)}).then(() => 'ALLOWED', (e) => String(e.message))`);
    }
    w.destroy();
    return out;
  }, preload);
  for (const [ch, r] of Object.entries(results)) assert.match(r, /Forbidden/, `${ch} was reachable from an untrusted renderer: ${r}`);
  // settings validation
  await assert.rejects(app.evaluate(() => window.nadir.invoke('settings:set', { key: '__proto__', value: 1 })), /not editable/);
  await assert.rejects(app.evaluate(() => window.nadir.invoke('settings:set', { key: 'theme', value: 'pink' })), /Invalid theme/);
  await assert.rejects(app.evaluate(() => window.nadir.invoke('settings:set', { key: 'secureDns', value: { mode: 'secure', server: 'http://insecure' } })), /DoH|https/);
  await assert.rejects(app.evaluate(() => window.nadir.invoke('settings:set', { key: 'searchProviders', value: { custom: { url: 'http://evil.example/?q=%s' } } })), /https/);
  const ok = await app.evaluate(() => window.nadir.invoke('settings:set', { key: 'theme', value: 'light' }));
  assert.equal(ok.ok, true);
  assert.equal(await b.ctl('c.cfg.theme'), 'light');
});

test('nadir:// pages render and are navigable; swapping between internal and web swaps the renderer', async () => {
  await b.navigate('nadir://app/#/privacy');
  const app = await b.page('nadir://app');
  await app.waitForSelector('text=Privacy & security');
  assert.equal((await b.active()).kind, 'internal');
  await b.navigate(`${srv.origin}/`);
  await waitTitle('Home Page');
  assert.equal((await b.active()).kind, 'web');
  const page = await b.page(srv.origin);
  assert.equal(await page.evaluate(() => typeof window.nadir), 'undefined');
});

test('downloads: saved to the configured folder, listed, risky files flagged and never launchable', async () => {
  await b.navigate(`${srv.origin}/file.zip`);
  await until(async () => (await b.ctl('c.store.downloads().filter(d => d.state === "completed").length')) >= 1, { what: 'zip download' });
  assert.ok(fs.existsSync(path.join(b.downloadDir, 'data.zip')));
  await b.navigate(`${srv.origin}/evil`);
  await until(async () => (await b.ctl('c.store.downloads().filter(d => d.state === "completed").length')) >= 2, { what: 'evil download' });
  const files = fs.readdirSync(b.downloadDir);
  assert.ok(files.includes('invoice.pdf.exe'), `traversal in filename must be stripped, got ${files}`);
  assert.ok(!fs.existsSync(path.join(b.downloadDir, '..', 'invoice.pdf.exe')));
  const list = await b.ctl('c.downloads.list()');
  const evil = list.find((d) => d.filename === 'invoice.pdf.exe');
  assert.equal(evil.risk, 'deceptive');
  assert.equal(evil.canOpen, false);
  const open = await b.ctl('c.downloads.open(a)', evil.id);
  assert.equal(open.ok, false);
  assert.equal(list.find((d) => d.filename === 'data.zip').risk, 'archive');
});

test('HTTPS-first: http to a public name is upgraded; when HTTPS fails the user gets an explicit, safe fallback', async () => {
  await b.ctl('c.blocker.httpExempt.clear()');
  await b.navigate(`http://plain.example.net:${srv.port}/`);
  // The upgraded https:// attempt hits a plain-HTTP server and fails -> error page with the HTTP option.
  await until(async () => (await b.ctl('c.tabs.active().host.wc.getURL()')).startsWith('data:text/html'), { what: 'error page', timeout: 20000 });
  assert.equal(await tabUrl(), `https://plain.example.net:${srv.port}/`);
  const html = decodeURIComponent((await b.ctl('c.tabs.active().host.wc.getURL()')).split(',').slice(1).join(','));
  assert.match(html, /allow-http/);
  assert.match(html, /Continue over insecure HTTP/);
  // explicit consent -> loads over http
  await b.ctl(`c.tabs.active().host.emit('allow-http', 'http://plain.example.net:${srv.port}/')`);
  await waitTitle('Home Page');
  assert.equal(await tabUrl(), `http://plain.example.net:${srv.port}/`);
});

test('unreachable site shows a plain error page and keeps the typed URL', async () => {
  await b.navigate('http://127.0.0.1:1/');
  await until(async () => (await b.ctl('c.tabs.active().host.wc.getURL()')).startsWith('data:text/html'), { what: 'error page' });
  assert.equal(await tabUrl(), 'http://127.0.0.1:1/');
});

test('sleeping tabs release their renderer and wake on activation', async () => {
  await b.navigate(`${srv.origin}/page2`);
  await waitTitle('Second Page');
  const keep = (await b.state()).activeId;
  const other = await b.invoke('tab:new', { url: `${srv.origin}/query` });
  await waitTitle('Query');
  assert.equal(await b.invoke('tab:sleep', keep), true);
  const s = await b.state();
  assert.equal(s.tabs.find((t) => t.id === keep).sleeping, true);
  assert.equal(await b.ctl('c.tabs.get(a).host', keep), null);
  assert.equal(await b.invoke('tab:sleep', other), false, 'the active tab must never sleep');
  await b.invoke('tab:activate', keep);
  await waitTitle('Second Page');
  assert.equal((await b.active()).sleeping, false);
  await b.invoke('tab:close', other);
});

test('split view shows two tabs side by side', async () => {
  const s0 = await b.state();
  await b.ctl('c.tabs.exec("toggle-split")');
  await until(async () => (await b.state()).splitId != null);
  const dims = await b.ctl(`(() => { const t = c.tabs; const a = t.active().host.view.getBounds(); const s = t.get(t.splitId).host.view.getBounds(); return { a, s }; })()`);
  assert.ok(dims.a.width > 100 && dims.s.width > 100);
  assert.ok(dims.s.x >= dims.a.x + dims.a.width, 'split pane is to the right of the active pane');
  await b.ctl('c.tabs.exec("toggle-split")');
  await until(async () => (await b.state()).splitId == null);
  assert.ok(s0.tabs.length >= 1);
});

test('command palette finds tabs, history and commands; Enter runs the selection', async () => {
  await b.ctl('c.runCommand("command-palette")');
  const ov = await b.page('nadir://overlay');
  await ov.waitForSelector('.palette input');
  await ov.fill('.palette input', 'settings');
  await ov.waitForSelector('.palette .row:has-text("Open settings")');
  await ov.keyboard.press('Enter');
  await until(async () => (await b.active()).url.startsWith('nadir://app/#/settings'), { what: 'settings opened by palette' });
  assert.equal(await b.ctl('c.ov.kind'), null, 'palette closed after running');
});

test('address-bar suggestions come from local data and render in the overlay', async () => {
  await b.navigate(`${srv.origin}/`);
  await waitTitle('Home Page');
  await b.shell.focus('#omni');
  await b.shell.fill('#omni', 'Home');
  const ov = await b.page('nadir://overlay');
  await ov.waitForSelector('.omni-list .row:has-text("Home Page")', { timeout: 8000 });
  const rows = await ov.locator('.omni-list .row').allInnerTexts();
  assert.ok(rows.some((r) => /Search DuckDuckGo/.test(r)), 'search row is present');
  await b.shell.keyboard.press('Escape');
});

// Keys are injected with Electron's webContents.sendInputEvent, which travels the same browser-side
// path as real keyboard input (before-input-event). Playwright's CDP keyboard bypasses that path, and
// OS-level injection could hit other apps on the machine, so neither is used.
const press = (target, keyCode, modifiers = []) => b.ctl(`(() => {
  const wc = ${target}; wc.focus();
  wc.sendInputEvent({ type: 'keyDown', keyCode: a.k, modifiers: a.m });
  wc.sendInputEvent({ type: 'keyUp', keyCode: a.k, modifiers: a.m });
  return true; })()`, { k: keyCode, m: modifiers });
const PAGE = 'c.tabs.active().host.wc';
const SHELL = 'c.win.webContents';
const OVERLAY = 'c.overlay.webContents';

test('keyboard shortcuts work from the page, the chrome and the overlay; plain typing is not hijacked', async () => {
  await b.navigate(`${srv.origin}/page2`);
  await waitTitle('Second Page');
  const count = async () => (await b.state()).tabs.length;
  const n0 = await count();

  await press(PAGE, 'T', ['control']);
  await until(async () => (await count()) === n0 + 1, { what: 'Ctrl+T from a web page' });
  await press(SHELL, 'T', ['control']);
  await until(async () => (await count()) === n0 + 2, { what: 'Ctrl+T from the chrome' });
  await press(SHELL, 'W', ['control']);
  await until(async () => (await count()) === n0 + 1, { what: 'Ctrl+W' });

  await press(PAGE, 'K', ['control']);
  await until(async () => (await b.ctl('c.ov.kind')) === 'palette', { what: 'palette via Ctrl+K' });
  await press(OVERLAY, 'Escape');
  await until(async () => (await b.ctl('c.ov.kind')) === null, { what: 'palette closed by Escape' });

  const web = (await b.state()).tabs.find((t) => t.url === `${srv.origin}/page2`);
  await b.invoke('tab:activate', web.id);       // find-in-page only opens on web pages, not nadir:// pages
  await press(PAGE, 'F', ['control']);
  await until(async () => (await b.ctl('c.ov.kind')) === 'find', { what: 'find bar via Ctrl+F' });
  await press(OVERLAY, 'Escape');
  await until(async () => (await b.ctl('c.ov.kind')) === null);

  const before = await count();
  await press(PAGE, 'T');                       // plain "t"
  await press(PAGE, 'C', ['control']);          // copy must stay with the page
  await press(PAGE, 'A', ['control']);          // select-all must stay with the page
  await sleep(300);
  assert.equal(await count(), before);

  await press(PAGE, 'Left', ['alt']);           // back (nothing to go back to on this tab: must not throw)
  for (const t of (await b.state()).tabs.slice(1)) await b.invoke('tab:close', t.id);
});

test('settings and bookmarks persist; clear-browsing-data keeps bookmarks', async () => {
  await b.navigate(`${srv.origin}/page2`);
  await waitTitle('Second Page');
  await b.invoke('bookmark:toggle');
  await until(async () => (await b.state()).bookmarked === true);
  await b.ctl('c.clearBrowsingData({})');
  assert.equal(await b.ctl('c.store.recentHistory(null, 10).length'), 0);
  assert.equal(await b.ctl('c.store.bookmarks().length'), 1);
});

test('session restore: tabs come back lazily after a restart; settings persist', async () => {
  await b.navigate(`${srv.origin}/page2`);
  await waitTitle('Second Page');
  const second = await b.invoke('tab:new', { url: `${srv.origin}/query?z=9` });
  await waitTitle('Query');
  await b.ctl('c.saveSession()');
  const userData = b.userData; const downloadDir = b.downloadDir;
  await b.close();

  b = await launch({ userData, downloadDir });
  const s = await b.state();
  const urls = s.tabs.map((t) => t.url);
  assert.ok(urls.includes(`${srv.origin}/page2`) && urls.includes(`${srv.origin}/query?z=9`), `restored ${urls}`);
  const sleepers = s.tabs.filter((t) => t.sleeping);
  assert.ok(sleepers.length >= 1, 'inactive tabs restore asleep (lazy)');
  assert.equal(await b.ctl('c.cfg.theme'), 'light', 'settings survived restart');
  assert.equal(await b.ctl('c.store.bookmarks().length'), 1, 'bookmarks survived restart');
  assert.ok(second);
});
