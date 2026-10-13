// SPDX-License-Identifier: GPL-3.0-or-later
// Per-process-type private-memory breakdown (Browser / GPU / Tab / Utility) via app.getAppMetrics().
// Usage: node scripts/mem-breakdown.js <extraTabs> [electron args]   (env MEM_MODE=detach|vis for two diagnostic experiments)
// CAVEAT: this launches through Playwright, which keeps background tabs visible, so the ABSOLUTE numbers are inflated
// (see docs/PERFORMANCE.md, "Correction"). Use it to see which process type grows, never to compare with Chrome.
const { launch, until, sleep } = require('../test/e2e/helpers');
const { execFileSync } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const N = Number(process.argv[2] || 10);
(async () => {
  const para = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';
  const srv = http.createServer((q, r) => { const m = q.url.match(/^\/p\/(\d+)/); r.writeHead(200, { 'content-type': 'text/html' }); r.end(`<!doctype html><title>Article ${m ? m[1] : 'x'}</title><body>${Array.from({ length: 400 }, (_, i) => `<p>${i} ${para}</p>`).join('')}<script>window.__ready=1</script>`); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pelorus-mem-'));
  const b = await launch({ userData, headless: false, args: process.argv.slice(3) });
  await until(async () => (await b.active())?.url === 'pelorus://newtab/', { what: 'first tab' });
  for (let i = 0; i < N; i++) { await b.invoke('tab:new', { url: `http://127.0.0.1:${srv.address().port}/p/${i}` }); await until(async () => (await b.active()).title === `Article ${i}`, { timeout: 20000, what: 'tab' }); }
  await sleep(8000);
  if (process.env.MEM_MODE === 'detach') { await b.ctl('[...c.tabs.tabs.values()].filter((t) => t.host && t.id !== c.tabs.active().id).map((t) => c.win.contentView.removeChildView(t.host.view)).length'); await sleep(8000); }
  if (process.env.MEM_MODE === 'vis' || process.env.MEM_MODE === 'detach') console.log(await b.ctl("Promise.all([...c.tabs.tabs.values()].filter((t) => t.host).map((t) => t.host.wc.executeJavaScript('document.visibilityState')))"));
  const m = await b.app.evaluate(({ app }) => app.getAppMetrics().map((x) => ({ type: x.type, name: x.name || '', pid: x.pid, priv: x.memory.privateBytes, ws: x.memory.workingSetSize })));
  const by = {}; let tot = 0;
  for (const x of m) { const k = x.type + (x.name ? ':' + x.name : ''); (by[k] ??= { n: 0, privMB: 0 }); by[k].n++; by[k].privMB += x.priv / 1024; tot += x.priv / 1024; }
  for (const k in by) by[k].privMB = Math.round(by[k].privMB);
  console.log(JSON.stringify(by), 'TOTAL_privMB', Math.round(tot), 'procs', m.length);
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
