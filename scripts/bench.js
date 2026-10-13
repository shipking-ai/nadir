// SPDX-License-Identifier: GPL-3.0-or-later
// Reproducible baseline: Nadir vs. the locally installed Chrome, same machine, same pages, same measurement method.
// Usage: node scripts/bench.js [--tabs 10] [--runs 3] [--skip-chrome]
// Results are written to docs/benchmarks/. Nothing here is a synthetic score; see docs/PERFORMANCE.md for caveats.
const { spawn, execFileSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { launch, until, sleep } = require('../test/e2e/helpers');
const { launchPlain } = require('../test/e2e/plain');
const { Store } = require('../src/main/store');

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const TABS = Number(arg('tabs', 10));
const RUNS = Number(arg('runs', 3));
const SKIP_CHROME = process.argv.includes('--skip-chrome');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PS = path.join(__dirname, 'proctree.ps1');

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const tree = (pid) => JSON.parse(execFileSync('powershell', ['-NoProfile', '-File', PS, '-RootPid', String(pid)]).toString());
const strip = (t) => { const { pids, ...rest } = t; return rest; };
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Local pages: ~60 KB of text each, a little script and a stylesheet-free layout (a plain "article" page). */
function startServer() {
  const para = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';
  const srv = http.createServer((req, res) => {
    const m = req.url.match(/^\/p\/(\d+)/);
    if (!m) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><title>Article ${m[1]}</title><body>${Array.from({ length: 400 }, (_, i) => `<p>${m[1]}.${i} ${para}</p>`).join('')}<script>window.__ready=1</script>`);
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r({ port: srv.address().port, close: () => new Promise((x) => srv.close(x)) })));
}


async function cpuPercent(pid, seconds = 10) {
  // Compare only processes that exist in BOTH samples; summing a changing tree can go negative (seen in a first run).
  const a = tree(pid); const t0 = Date.now();
  await sleep(seconds * 1000);
  const b = tree(pid);
  const common = Object.keys(a.pids).filter((k) => k in b.pids);
  const delta = common.reduce((sum, k) => sum + (b.pids[k] - a.pids[k]), 0);
  return round((delta / ((Date.now() - t0) / 1000)) * 100, 2); // % of one logical core
}

async function benchNadir(srv) {
  const out = { runs: [] };
  // 1) warm the filter-list cache once (needs network); later runs load it from disk.
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nadir-bench-'));
  {
    const w = await launch({ userData, headless: false });
    await w.main(() => {}); // ensure up
    const env = await w.ctl('c.blocker.refresh().then(() => true, (e) => String(e))');
    out.listsRefresh = env === true ? 'ok' : env;
    out.listsLoaded = await w.ctl('c.blocker.listsLoaded');
    await w.close();
  }
  // 2) seed 5,000 history rows for suggestion latency
  {
    const st = new Store(path.join(userData, 'nadir.db'));
    st.db.exec('BEGIN');
    for (let i = 0; i < 5000; i++) st.addVisit({ workspaceId: 'default', url: `https://site${i % 700}.example.org/section/${i}/page`, title: `Article ${i} about topic ${i % 97} and subject ${i % 31}` });
    st.db.exec('COMMIT');
    st.setSetting('restoreSession', false); // timing runs must start from one fresh tab
    st.close();
  }
  for (let r = 0; r < RUNS; r++) {
    const t0 = Date.now();
    const b = await launchPlain({ userData });
    await until(async () => { const t = await b.active(); return t && !t.loading && t.url === 'nadir://newtab/'; }, { timeout: 20000, step: 50, what: 'first tab ready' });
    const startMs = Date.now() - t0;
    const pid = b.pid;
    await sleep(6000);
    const oneTab = strip(tree(pid));
    const run = { startMs, oneTab };
    if (r === 0) {
      const t = [];
      for (let i = 0; i < TABS; i++) {
        await b.invoke('tab:new', { url: `http://127.0.0.1:${srv.port}/p/${i}` });
        await until(async () => (await b.active()).title === `Article ${i}`, { timeout: 20000, what: `tab ${i}` });
      }
      await sleep(8000);
      run.manyTabs = { tabs: TABS + 1, ...strip(tree(pid)) };
      // tab switch round trip (IPC + layout; not paint)
      const ids = (await b.state()).tabs.map((x) => x.id);
      const lat = await b.eval(`(async (list) => {
        const out = [];
        for (let k = 0; k < 40; k++) { const t0 = performance.now(); await window.nadir.invoke('tab:activate', list[k % list.length]); out.push(performance.now() - t0); }
        return out;
      })(${JSON.stringify(ids)})`);
      run.tabSwitchMs = { p50: round(median(lat), 2), p95: round(pct(lat, 0.95), 2) };
      // suggestion latency against 5,000 history rows
      const sug = await b.eval(`(async () => {
        const out = []; const qs = ['article', 'topic 4', 'site1', 'subject 2', 'exam'];
        for (let k = 0; k < 50; k++) { const t0 = performance.now(); await window.nadir.invoke('omnibox:suggest', qs[k % qs.length]); out.push(performance.now() - t0); }
        return out;
      })()`);
      run.suggestMs = { p50: round(median(sug), 2), p95: round(pct(sug, 0.95), 2) };
      run.idleCpuPctOneCore = await cpuPercent(pid, 10);
      { const st = await b.state(); for (const t of st.tabs) if (t.id !== st.activeId && t.kind === 'web') await b.invoke('tab:sleep', t.id); }
      await sleep(6000);
      run.afterSleepingOthers = strip(tree(pid));
    }
    await b.close();
    out.runs.push(run);
  }
  // 3) session restore with many tabs (its own phase so timing runs above stay clean)
  {
    const st = new Store(path.join(userData, 'nadir.db')); st.setSetting('restoreSession', true); st.close();
    let b = await launchPlain({ userData });
    await until(async () => (await b.active())?.url === 'nadir://newtab/', { what: 'fresh tab' });
    for (let i = 0; i < TABS; i++) {
      await b.invoke('tab:new', { url: `http://127.0.0.1:${srv.port}/p/${i}` });
      await until(async () => (await b.active()).title === `Article ${i}`, { timeout: 20000, what: `tab ${i}` });
    }
    await b.close();
    const t0 = Date.now();
    b = await launchPlain({ userData });
    await until(async () => { const t = await b.active(); return t && !t.loading && t.title; }, { timeout: 20000, step: 50, what: 'restored active tab' });
    out.restore = { ms: Date.now() - t0, tabs: (await b.state()).tabs.length, loaded: (await b.state()).tabs.filter((t) => !t.sleeping).length };
    await b.close();
  }
  return out;
}

async function benchChrome(srv) {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-bench-'));
  const port = 9341;
  const version = execFileSync('powershell', ['-NoProfile', '-Command', `(Get-Item '${CHROME}').VersionInfo.ProductVersion`]).toString().trim();
  const t0 = Date.now();
  const child = spawn(CHROME, [`--user-data-dir=${userData}`, `--remote-debugging-port=${port}`, '--no-first-run', '--no-default-browser-check', '--disable-sync', 'about:blank'], { stdio: 'ignore', detached: false });
  try {
    await until(async () => (await fetch(`http://127.0.0.1:${port}/json/list`)).ok, { timeout: 20000, what: 'chrome devtools' });
    const startMs = Date.now() - t0;
    await sleep(6000);
    const run = { version, startMs, oneTab: strip(tree(child.pid)) };
    for (let i = 0; i < TABS; i++) await fetch(`http://127.0.0.1:${port}/json/new?http://127.0.0.1:${srv.port}/p/${i}`, { method: 'PUT' });
    await sleep(14000);
    run.manyTabs = { tabs: TABS + 1, ...strip(tree(child.pid)) };
    run.idleCpuPctOneCore = await cpuPercent(child.pid, 10);
    return run;
  } finally {
    // Only ever kill the tree we spawned, and only if it is demonstrably ours.
    const cmd = execFileSync('powershell', ['-NoProfile', '-Command', `(Get-CimInstance Win32_Process -Filter "ProcessId=${child.pid}").CommandLine`]).toString();
    if (cmd.includes(userData)) execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  }
}

(async () => {
  const srv = await startServer();
  const hw = { cpu: os.cpus()[0].model.trim(), logicalCores: os.cpus().length, ramGB: round(os.totalmem() / 2 ** 30), os: `${os.type()} ${os.release()}` };
  const res = { date: new Date().toISOString(), hardware: hw, tabs: TABS, runs: RUNS, nadir: await benchNadir(srv) };
  if (!SKIP_CHROME && fs.existsSync(CHROME)) res.chrome = await benchChrome(srv);
  await srv.close();
  const file = path.join(__dirname, '..', 'docs', 'benchmarks', `results-${res.date.slice(0, 10)}.json`);
  fs.writeFileSync(file, JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res, null, 2));
  console.log('written', file);
})().catch((e) => { console.error(e); process.exit(1); });
