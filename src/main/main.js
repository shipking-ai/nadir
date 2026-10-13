// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const path = require('node:path');
const { app, protocol, session } = require('electron');

// Windows installer lifecycle (Squirrel.Windows): the installer launches the app with --squirrel-* flags to let it create or
// remove its shortcuts. Handle that and exit before anything else starts. A normal launch never has these flags.
if (process.platform === 'win32' && /^--squirrel-/.test(process.argv[1] || '')) {
  const { spawn } = require('node:child_process');
  const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  const exeName = path.basename(process.execPath);
  const run = (args) => new Promise((resolve) => { try { spawn(updateExe, args, { detached: true, stdio: 'ignore' }).on('close', resolve).on('error', resolve); } catch { resolve(); } });
  const ev = process.argv[1];
  (async () => {
    if (ev === '--squirrel-install' || ev === '--squirrel-updated') await run(['--createShortcut', exeName]);
    else if (ev === '--squirrel-uninstall') await run(['--removeShortcut', exeName]);
    app.quit();   // --squirrel-obsolete and --squirrel-firstrun need no work
  })();
  return;
}

// Must happen before 'ready'.
protocol.registerSchemesAsPrivileged([{ scheme: 'nadir', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
app.setName('Nadir');
if (process.env.NADIR_USER_DATA) app.setPath('userData', process.env.NADIR_USER_DATA);
app.enableSandbox(); // every renderer, including ones we forget about, runs sandboxed

const IS_TEST = process.env.NADIR_TEST === '1';
if (!app.requestSingleInstanceLock()) { app.quit(); return; }

const { Store } = require('./store');
const { Blocker } = require('./blocker');
const { DownloadManager } = require('./downloads');
const { PermissionBroker } = require('./permissions');
const { createSessionFactory, PRIVATE_ID } = require('./sessions');
const { Controller } = require('./controller');
const { registerIpc } = require('./ipc');
const protocolHandler = require('./protocol');

let controller = null;
let store = null;
let quitting = false;

const urlFromArgs = (argv) => argv.slice(1).find((a) => /^https?:\/\//i.test(a)) || null;

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (e) => e.preventDefault()); // <webview> is never allowed
});

app.on('second-instance', (_e, argv) => {
  const w = controller?.win;
  if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  const url = urlFromArgs(argv);
  if (url && controller) controller.tabs.createTab({ url });
});

app.whenReady().then(() => {
  const userData = app.getPath('userData');
  store = new Store(path.join(userData, 'nadir.db'));
  store.enforceRetention(store.settings().historyRetentionDays);

  // Chrome surfaces (shell + overlay) live in the default session and may use nothing but the nadir:// scheme.
  const ds = session.defaultSession;
  protocolHandler.register(ds);
  ds.setPermissionRequestHandler((_wc, _p, cb) => cb(false));
  ds.setPermissionCheckHandler(() => false);

  const blocker = new Blocker({
    cacheFile: path.join(userData, 'blocklists.bin'),
    getSettings: () => controller.cfg,
    lookupTab: () => null, isTabContents: () => false, onBlocked: () => {},
  });
  const downloads = new DownloadManager({
    store, onChange: () => controller?.broadcastDownloads(),
    dir: IS_TEST && process.env.NADIR_DOWNLOAD_DIR ? () => process.env.NADIR_DOWNLOAD_DIR : undefined,
  });
  const broker = new PermissionBroker({
    store, privateId: PRIVATE_ID,
    tabFor: (wc) => { const t = controller?.tabs.byWebContentsId(wc.id); return t ? { id: t.id, workspaceId: t.workspaceId } : null; },
    ask: (req) => controller.askPermission(req),
  });
  const sessions = createSessionFactory({ blocker, broker, downloads });

  controller = new Controller({
    store, blocker, downloads, broker, sessions,
    uiDir: protocolHandler.UI_ROOT, userDataDir: userData,
  });
  registerIpc(controller);
  const win = controller.create();
  controller.applySecureDns();
  blocker.init({ refresh: process.env.NADIR_OFFLINE !== '1' });
  win.once('ready-to-show', () => { if (process.env.NADIR_HEADLESS !== '1') win.show(); });
  controller.restoreOrNew(urlFromArgs(process.argv));

  if (IS_TEST) global.__nadir = controller; // test hook, never set in normal runs
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', (e) => {
  if (quitting || !controller) return;
  quitting = true;
  if (controller.cfg.clearOnExit) {
    e.preventDefault();
    controller.clearBrowsingData({}).catch(() => {}).finally(() => { controller.dispose(); store.close(); app.quit(); });
    return;
  }
  controller.dispose();
  store.close();
});
