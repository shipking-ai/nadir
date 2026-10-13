// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const path = require('node:path');

const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/** Make a server-suggested filename safe to write on Windows/macOS/Linux. */
function sanitizeFilename(name, fallback = 'download') {
  let n = String(name ?? '');
  try { n = decodeURIComponent(n); } catch { /* keep raw */ }
  n = n.split(/[\\/]/).pop() ?? '';                                // never keep directory parts
  n = n.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '_');             // control + Windows-illegal characters
  n = n.replace(/[‪-‮⁦-⁩]/g, '');              // bidi overrides used to fake extensions
  n = n.replace(/^[\s.]+|[\s.]+$/g, '');                           // leading/trailing dots & spaces
  if (!n || RESERVED.test(n)) n = n ? `_${n}` : fallback;
  if (n.length > 150) {
    const ext = path.extname(n).slice(0, 20);
    n = n.slice(0, 150 - ext.length) + ext;
  }
  return n;
}

/** Pick a non-colliding "name (n).ext" inside dir. `exists` is injectable for tests. */
function uniqueName(dir, filename, exists) {
  const ext = path.extname(filename);
  const base = filename.slice(0, filename.length - ext.length);
  let candidate = filename;
  for (let i = 1; exists(path.join(dir, candidate)); i++) {
    candidate = `${base} (${i})${ext}`;
    if (i > 9999) throw new Error('Too many files with the same name');
  }
  return candidate;
}

const RISK = {
  executable: ['exe', 'msi', 'com', 'scr', 'pif', 'dll', 'cpl', 'msc', 'appx', 'msix', 'apk', 'dmg', 'pkg', 'app', 'deb', 'rpm', 'jar', 'bin', 'run'],
  script: ['bat', 'cmd', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'ps1', 'psm1', 'reg', 'hta', 'sh', 'command', 'py', 'pyw'],
  shortcut: ['lnk', 'url', 'scf', 'desktop', 'webloc'],
  disk_image: ['iso', 'img', 'vhd', 'vhdx'],
  macro_document: ['docm', 'xlsm', 'pptm', 'dotm', 'xlam'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'cab'],
};

/**
 * Classify by file name only. This is a *warning heuristic*, not malware analysis:
 * it cannot detect a malicious PDF or a renamed executable.
 * @returns {'' | keyof typeof RISK}
 */
function classifyRisk(filename) {
  const parts = String(filename).toLowerCase().split('.');
  if (parts.length < 2) return '';
  const ext = parts.pop();
  for (const [kind, list] of Object.entries(RISK)) if (list.includes(ext)) return kind;
  return '';
}

/** Double extensions like "invoice.pdf.exe" are a classic disguise. */
function hasDeceptiveExtension(filename) {
  const parts = String(filename).toLowerCase().split('.');
  if (parts.length < 3) return false;
  const last = parts.pop();
  const prev = parts.pop();
  const harmless = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'mp3', 'mp4', 'zip'];
  return harmless.includes(prev) && ['executable', 'script', 'shortcut'].includes(classifyRisk(`x.${last}`));
}

module.exports = { sanitizeFilename, uniqueName, classifyRisk, hasDeceptiveExtension };
