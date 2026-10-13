// Exploratory launcher: starts Pelorus against a throwaway profile, prints what exists, saves a screenshot.
// Usage: node scripts/smoke.js [outDir]
const { _electron: electron } = require('playwright-core');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

(async () => {
  const out = process.argv[2] || path.join(os.tmpdir(), 'pelorus-smoke');
  fs.mkdirSync(out, { recursive: true });
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pelorus-ud-'));
  const app = await electron.launch({
    args: [path.resolve(__dirname, '..')],
    env: { ...process.env, PELORUS_USER_DATA: userData, PELORUS_TEST: '1' },
  });
  const logs = [];
  app.process().stdout?.on('data', (d) => logs.push(String(d)));
  app.process().stderr?.on('data', (d) => logs.push(String(d)));
  const win = await app.firstWindow();
  win.on('console', (m) => logs.push(`[shell console ${m.type()}] ${m.text()}`));
  win.on('pageerror', (e) => logs.push(`[shell pageerror] ${e.message}`));
  await win.waitForLoadState('domcontentloaded');
  await new Promise((r) => setTimeout(r, 2500));
  console.log('windows:', app.windows().map((w) => w.url()));
  console.log('title:', await win.title());
  console.log('tabs in DOM:', await win.locator('.tab').count());
  await win.screenshot({ path: path.join(out, 'shell.png') });
  const shot = await app.evaluate(async ({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    const img = await w.webContents.capturePage();
    return img.toPNG().toString('base64');
  });
  fs.writeFileSync(path.join(out, 'window.png'), Buffer.from(shot, 'base64'));
  const nt = app.windows().find((p) => p.url().startsWith('pelorus://newtab'));
  if (nt) {
    await nt.screenshot({ path: path.join(out, 'newtab.png') });
    for (const r of ['settings', 'privacy', 'history', 'downloads', 'about']) {
      await nt.evaluate((x) => window.pelorus.invoke('nav:open', { url: `pelorus://app/#/${x}` }), r).catch((e) => console.log('nav err', e.message));
      await new Promise((rr) => setTimeout(rr, 1500));
      const pg = app.windows().find((p) => p.url().startsWith('pelorus://app'));
      if (pg) await pg.screenshot({ path: path.join(out, `app-${r}.png`) });
      else console.log('no app page for', r, app.windows().map((w) => w.url()));
    }
  }
  console.log('logs:\n' + logs.join('\n').slice(0, 4000));
  await app.close();
  console.log('out:', out);
})().catch((e) => { console.error('SMOKE FAILED', e); process.exit(1); });
