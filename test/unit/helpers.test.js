// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeFilename, uniqueName, classifyRisk, hasDeceptiveExtension } = require('../../src/shared/filenames');
const { fuzzyScore, rank } = require('../../src/shared/fuzzy');
const { omniboxSuggestions } = require('../../src/main/suggest');
const { Store } = require('../../src/main/store');

test('sanitizeFilename blocks traversal, illegal chars, reserved names, bidi tricks', () => {
  assert.equal(sanitizeFilename('../../Windows/System32/evil.dll'), 'evil.dll');
  assert.equal(sanitizeFilename('C:\\x\\y\\a.txt'), 'a.txt');
  assert.equal(sanitizeFilename('a<b>c:d"e|f?g*.txt'), 'a_b_c_d_e_f_g_.txt');
  assert.equal(sanitizeFilename('CON'), '_CON');
  assert.equal(sanitizeFilename('nul.txt'), '_nul.txt');
  assert.equal(sanitizeFilename('  ..  '), 'download');
  assert.equal(sanitizeFilename(''), 'download');
  assert.equal(sanitizeFilename('invoice\u202Efdp.exe'), 'invoicefdp.exe');
  assert.equal(sanitizeFilename('a%2F..%2Fb.txt'), 'b.txt');
  const long = sanitizeFilename('x'.repeat(400) + '.pdf');
  assert.ok(long.length <= 150 && long.endsWith('.pdf'));
});
test('uniqueName appends counters', () => {
  const taken = new Set(['d/a.txt', 'd/a (1).txt']);
  const exists = (p) => taken.has(p.replace(/\\/g, '/'));
  assert.equal(uniqueName('d', 'a.txt', exists), 'a (2).txt');
  assert.equal(uniqueName('d', 'b.txt', exists), 'b.txt');
});
test('classifyRisk', () => {
  assert.equal(classifyRisk('setup.exe'), 'executable');
  assert.equal(classifyRisk('run.PS1'), 'script');
  assert.equal(classifyRisk('doc.docm'), 'macro_document');
  assert.equal(classifyRisk('a.zip'), 'archive');
  assert.equal(classifyRisk('photo.png'), '');
  assert.equal(classifyRisk('noextension'), '');
});
test('deceptive double extensions', () => {
  assert.ok(hasDeceptiveExtension('invoice.pdf.exe'));
  assert.ok(hasDeceptiveExtension('photo.jpg.lnk'));
  assert.ok(!hasDeceptiveExtension('archive.tar.gz'));
  assert.ok(!hasDeceptiveExtension('report.pdf'));
});

test('fuzzyScore ordering and non-matches', () => {
  assert.equal(fuzzyScore('zzz', 'new tab'), -1);
  assert.ok(fuzzyScore('new', 'New tab') > fuzzyScore('tab', 'New tab'));
  assert.equal(fuzzyScore('', 'anything'), 0);
});
test('short queries do not match scattered letters', () => {
  assert.equal(fuzzyScore('set', 'Close tab'), -1);
  assert.ok(fuzzyScore('set', 'Reset zoom') > 0);
  assert.ok(fuzzyScore('set', 'Open settings') > 0);
});
test('word-prefix and acronym matches', () => {
  assert.ok(fuzzyScore('new t', 'New tab') > 0);
  assert.ok(fuzzyScore('tab new', 'New tab') > 0, 'word order does not matter');
  assert.ok(fuzzyScore('nt', 'New tab') > 0, 'acronym');
  assert.ok(fuzzyScore('ow', 'Open workspace') > 0);
  assert.equal(fuzzyScore('xt', 'New tab'), -1);
});
test('loose subsequence only for 4+ chars and tight gaps', () => {
  assert.ok(fuzzyScore('rlod', 'Reload') > 0);
  assert.equal(fuzzyScore('abcd', 'a long text with b and c and d spread out'), -1);
});
test('rank orders by best getter', () => {
  const items = [{ t: 'Bookmarks' }, { t: 'New tab' }, { t: 'Settings' }];
  assert.deepEqual(rank(items, 'set', [(i) => i.t]).map((i) => i.t), ['Settings']);
  assert.equal(rank(items, 'b', [(i) => i.t])[0].t, 'Bookmarks');
});

test('omnibox: url first, then local sources, never throws on hostile input', () => {
  const store = new Store(':memory:');
  store.addVisit({ workspaceId: 'default', url: 'https://docs.example.org/guide', title: 'Electron Guide' });
  store.addBookmark({ url: 'https://docs.example.org/bm', title: 'Electron bookmark' });
  const tabs = [{ id: 7, workspaceId: 'default', title: 'Electron tab', url: 'https://t.example/' }, { id: 8, workspaceId: 'other', title: 'Electron hidden', url: 'https://h.example/' }];
  const base = { store, tabs, workspaceId: 'default', searchTemplate: 'https://s.example/?q=%s', searchName: 'S' };
  const s = omniboxSuggestions({ ...base, text: 'electron' });
  assert.equal(s[0].type, 'search');
  assert.deepEqual(new Set(s.map((x) => x.type)), new Set(['search', 'tab', 'bookmark', 'history']));
  assert.ok(!s.some((x) => x.tabId === 8), 'other workspace tabs are not suggested');
  const u = omniboxSuggestions({ ...base, text: 'example.com' });
  assert.equal(u[0].type, 'go');
  assert.equal(u[0].url, 'https://example.com');
  for (const evil of ['"', 'javascript:alert(1)', '%', '\u0000', 'a'.repeat(5000)]) assert.doesNotThrow(() => omniboxSuggestions({ ...base, text: evil }));
  assert.deepEqual(omniboxSuggestions({ ...base, text: '  ' }), []);
  store.close();
});
