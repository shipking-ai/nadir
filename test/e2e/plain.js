// SPDX-License-Identifier: GPL-3.0-or-later
// Starts Pelorus like a user would (no test hook) and talks CDP to the SHELL page only; never attaches to tab renderers.
// Use this, not Playwright, for anything that measures memory, CPU, throttling or timing (see docs/PERFORMANCE.md).
const { spawn, execFileSync } = require('node:child_process');
const path = require('node:path');
const { until } = require('./helpers');
const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Launches Pelorus the way a user would (no PELORUS_TEST hook) and drives ONLY the shell page over CDP.
 * Playwright's Electron driver attaches to every tab renderer and keeps them "visible/captured", which
 * made background tabs run at full rate and inflated memory by ~25% in the first benchmark (2026-10-12 early run).
 * Chrome is driven the same way (HTTP /json/new, no per-tab attach), so this is the comparable method.
 */
async function launchPlain({ userData, port = 9555 }) {
  const exe = require('electron'); // the electron package exports the path to the platform's binary
  const child = spawn(exe, ['.', `--remote-debugging-port=${port}`], { cwd: ROOT, env: { ...process.env, PELORUS_USER_DATA: userData, PELORUS_OFFLINE: '1' }, stdio: 'ignore' });
  let shell;
  await until(async () => { const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); shell = t.find((x) => x.url === 'pelorus://shell/'); return shell; }, { timeout: 30000, step: 100, what: 'shell target' });
  const ws = new WebSocket(shell.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const ev = (expression) => new Promise((resolve, reject) => {
    const i = ++id; pend.set(i, (m) => (m.result?.exceptionDetails ? reject(new Error(m.result.exceptionDetails.text + ' ' + (m.result.exceptionDetails.exception?.description || ''))) : resolve(m.result?.result?.value)));
    ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  });
  await until(async () => (await ev("typeof window.pelorus === 'object'")) === true, { what: 'preload api' });
  const api = {
    pid: child.pid,
    eval: ev,
    invoke: (ch, payload) => ev(`window.pelorus.invoke(${JSON.stringify(ch)}, ${JSON.stringify(payload ?? null)})`),
    state: () => ev("window.pelorus.invoke('state:get')"),
    active: async () => { const st = await api.state(); return st.tabs.find((t) => t.id === st.activeId); },
    close: async () => {
      try { ws.close(); } catch { /* ignore */ }
      try { execFileSync('taskkill', ['/PID', String(child.pid)], { stdio: 'ignore' }); } catch { /* already gone */ }   // WM_CLOSE: lets the app save its session
      await until(() => child.exitCode !== null, { timeout: 15000, what: 'graceful exit' }).catch(() => { try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* gone */ } });
    },
  };
  return api;
}

module.exports = { launchPlain };
