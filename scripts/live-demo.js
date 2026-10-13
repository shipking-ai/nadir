// Launches a VISIBLE Pelorus window against a local demo server and keeps it open for screenshots.
// Usage: node scripts/live-demo.js [seconds]   (default 90)
const { launch, startServer, until, sleep } = require('../test/e2e/helpers');
const http = require('node:http');

(async () => {
  const seconds = Number(process.argv[2] || 90);
  const srv = await startServer();
  const b = await launch({ args: [] });
  await b.main(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.show(); w.setSize(1280, 800); w.center(); w.focus(); });
  await b.navigate(`${srv.origin}/`);
  await b.invoke('tab:new', { url: `${srv.origin}/page2` });
  await b.invoke('tab:new', { url: `${srv.origin}/query?demo=1` });
  await b.ctl('c.createWorkspace("Research")');
  await b.invoke('workspace:switch', 'default');
  await b.invoke('tab:new', {});           // new-tab page with most-visited tiles
  await sleep(1800);
  await b.shell.evaluate(() => document.getElementById('omni').blur());
  await sleep(300);
  const { execFileSync } = require('node:child_process');
  const path = require('node:path');
  const shot = async (name) => {
    const hwnd = await b.main(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getNativeWindowHandle().readBigUInt64LE(0).toString());
    const out = path.resolve(__dirname, '..', '.smoke', name);
    console.log(execFileSync('powershell', ['-NoProfile', '-File', path.join(__dirname, 'capture-window.ps1'), '-Hwnd', hwnd, '-Out', out]).toString().trim(), name);
  };
  await shot('composite-1.png');
  await b.ctl('c.runCommand("command-palette")'); await sleep(900);
  const ov = await b.page('pelorus://overlay'); await ov.fill('.palette input', 'set'); await sleep(700);
  await shot('composite-palette.png');
  await b.ctl('c.hideOverlay()');
  await b.ctl('c.setSetting("theme","dark")'); await sleep(1200);
  console.log('shell dark?', await b.shell.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'nativeTheme dark?', await b.main(({ nativeTheme }) => nativeTheme.shouldUseDarkColors));
  await b.invoke('tab:activate', (await b.state()).activeId); await sleep(400);
  console.log('page focused?', await b.ctl('c.tabs.active().host.wc.isFocused()'), '| shell doc focus?', await b.shell.evaluate(() => document.hasFocus()), '| win focused?', await b.ctl('c.win.isFocused()'));
  console.log('omni focused?', await b.shell.evaluate(() => document.activeElement && document.activeElement.id));
  await shot('composite-dark.png');
  console.log('READY');
  await sleep(seconds * 1000);
  await b.close(); await srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
