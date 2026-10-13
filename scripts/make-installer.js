// SPDX-License-Identifier: GPL-3.0-or-later
// Builds a per-user Windows installer (Squirrel.Windows via electron-winstaller) from out/Pelorus-win32-x64.
// Usage: npm run package && npm run installer      -> out/installer/Pelorus-Setup-<version>.exe (+ .nupkg and RELEASES)
// The installer is NOT code-signed unless a certificate is configured (same variables as scripts/sign.ps1:
// PELORUS_SIGN_PFX / PELORUS_SIGN_PFX_PASSWORD). Squirrel's RELEASES/.nupkg files are produced because the tool makes them;
// Pelorus does not use them for automatic updates (see docs/RELEASE.md).
const path = require('node:path');
const fs = require('node:fs');
const { createWindowsInstaller } = require('electron-winstaller');
const pkg = require('../package.json');

const appDirectory = path.resolve(__dirname, '..', 'out', 'Pelorus-win32-x64');
const outputDirectory = path.resolve(__dirname, '..', 'out', 'installer');
if (!fs.existsSync(path.join(appDirectory, 'Pelorus.exe'))) { console.error('Run "npm run package" first.'); process.exit(1); }
fs.mkdirSync(outputDirectory, { recursive: true });

const opts = {
  appDirectory, outputDirectory,
  exe: 'Pelorus.exe', name: 'Pelorus', title: 'Pelorus', authors: 'Pelorus', description: pkg.description,
  version: pkg.version.replace(/-.+$/, ''),   // Squirrel/NuGet versions: pre-release suffix is kept in the file name only
  setupExe: `Pelorus-Setup-${pkg.version}.exe`,
  noMsi: true,
  loadingGif: undefined,
};
if (process.env.PELORUS_SIGN_PFX) { opts.certificateFile = process.env.PELORUS_SIGN_PFX; opts.certificatePassword = process.env.PELORUS_SIGN_PFX_PASSWORD; }

createWindowsInstaller(opts).then(() => {
  console.log('installer written to', outputDirectory);
  console.log(fs.readdirSync(outputDirectory).join('\n'));
}, (e) => { console.error('installer build failed:', e.message); process.exit(1); });
