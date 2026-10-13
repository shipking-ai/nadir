// SPDX-License-Identifier: GPL-3.0-or-later
const test = require('node:test');
const assert = require('node:assert/strict');
const { Store, DEFAULT_SETTINGS, ftsQuery } = require('../../src/main/store');

const fresh = () => new Store(':memory:');

test('creates default workspace and default settings', () => {
  const s = fresh();
  assert.deepEqual(s.workspaces().map((w) => w.id), ['default']);
  assert.equal(s.settings().searchProvider, 'duckduckgo');
  s.close();
});

test('settings persist, reject unknown keys, survive corrupt values', () => {
  const s = fresh();
  s.setSetting('theme', 'dark');
  assert.equal(s.settings().theme, 'dark');
  assert.throws(() => s.setSetting('__proto__', 1), /Unknown setting/);
  s.db.prepare("UPDATE kv SET value='{oops' WHERE key='setting:theme'").run();
  assert.equal(s.settings().theme, DEFAULT_SETTINGS.theme);
  s.close();
});

test('history: dedupes per workspace, counts visits, only stores web URLs', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://a.com/', title: 'A' });
  s.addVisit({ workspaceId: 'default', url: 'https://a.com/', title: 'A2' });
  s.addVisit({ workspaceId: 'default', url: 'nadir://settings', title: 'x' });
  s.addVisit({ workspaceId: 'default', url: 'javascript:alert(1)', title: 'x' });
  const rows = s.recentHistory('default');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].visit_count, 2);
  assert.equal(rows[0].title, 'A2');
  s.close();
});

test('history is isolated per workspace', () => {
  const s = fresh();
  s.addWorkspace({ id: 'w2', name: 'Work', color: '#fff' });
  s.addVisit({ workspaceId: 'default', url: 'https://home.example/', title: 'Home page' });
  s.addVisit({ workspaceId: 'w2', url: 'https://work.example/', title: 'Work page' });
  assert.equal(s.searchHistory('work', { workspaceId: 'default' }).length, 0);
  assert.equal(s.searchHistory('work', { workspaceId: 'w2' }).length, 1);
  s.close();
});

test('FTS prefix search matches title and url, ranks frequent+recent first', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://docs.example.org/guide', title: 'Electron Guide' });
  s.addVisit({ workspaceId: 'default', url: 'https://other.example.org/', title: 'Electrical wiring' });
  for (let i = 0; i < 4; i++) s.addVisit({ workspaceId: 'default', url: 'https://docs.example.org/guide', title: 'Electron Guide' });
  const r = s.searchHistory('electr', { workspaceId: 'default' });
  assert.equal(r.length, 2);
  assert.equal(r[0].url, 'https://docs.example.org/guide');
  assert.equal(s.searchHistory('example.org', { workspaceId: 'default' }).length, 2);
  s.close();
});

test('FTS input cannot inject query syntax or SQL', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://a.com/', title: 'hello' });
  for (const evil of ['"', 'hello" OR "', '* NEAR(', "'; DROP TABLE history;--", 'title:hello', '-hello', '(']) {
    assert.doesNotThrow(() => s.searchHistory(evil, { workspaceId: 'default' }), evil);
  }
  assert.equal(s.recentHistory('default').length, 1);
  assert.equal(ftsQuery('a "b" c*'), '"a" "b" "c"*');
  assert.equal(ftsQuery('!!!'), '');
  s.close();
});

test('delete and clear history keep FTS in sync', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://a.com/', title: 'alpha' });
  s.addVisit({ workspaceId: 'default', url: 'https://b.com/', title: 'beta' });
  const [first] = s.recentHistory('default');
  s.deleteHistory(first.id);
  assert.equal(s.searchHistory('beta').length + s.searchHistory('alpha').length, 1);
  s.clearHistory();
  assert.equal(s.searchHistory('alpha').length + s.searchHistory('beta').length, 0);
  s.close();
});

test('retention removes only old rows', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://old.com/', title: 'old' });
  s.addVisit({ workspaceId: 'default', url: 'https://new.com/', title: 'new' });
  s.db.prepare("UPDATE history SET last_visit=? WHERE url='https://old.com/'").run(Date.now() - 40 * 86400000);
  s.enforceRetention(30);
  assert.deepEqual(s.recentHistory('default').map((r) => r.url), ['https://new.com/']);
  s.close();
});

test('bookmarks upsert, search with literal % and _', () => {
  const s = fresh();
  s.addBookmark({ url: 'https://a.com/', title: 'First' });
  s.addBookmark({ url: 'https://a.com/', title: 'Renamed' });
  s.addBookmark({ url: 'https://b.com/100%_sure', title: 'Sure' });
  assert.equal(s.bookmarks().length, 2);
  assert.ok(s.isBookmarked('https://a.com/'));
  assert.equal(s.searchBookmarks('100%').length, 1);
  assert.equal(s.searchBookmarks('%').length, 1);
  s.removeBookmark('https://a.com/');
  assert.ok(!s.isBookmarked('https://a.com/'));
  s.close();
});

test('downloads lifecycle', () => {
  const s = fresh();
  const id = s.addDownload({ url: 'https://a.com/f.zip', filename: 'f.zip', path: 'C:/x/f.zip', total: 10, risk: '' });
  s.updateDownload(id, { received: 5 });
  assert.equal(s.downloads()[0].state, 'progressing');
  s.updateDownload(id, { state: 'completed', received: 10 });
  const d = s.downloads()[0];
  assert.equal(d.state, 'completed');
  assert.ok(d.finished_at > 0);
  s.close();
});

test('permissions decisions persist per workspace+origin', () => {
  const s = fresh();
  s.setPermission('default', 'https://a.com', 'geolocation', 'deny');
  assert.equal(s.getPermission('default', 'https://a.com', 'geolocation'), 'deny');
  assert.equal(s.getPermission('other', 'https://a.com', 'geolocation'), null);
  s.setPermission('default', 'https://a.com', 'geolocation', 'allow');
  assert.equal(s.getPermission('default', 'https://a.com', 'geolocation'), 'allow');
  s.clearPermission('default', 'https://a.com', 'geolocation');
  assert.equal(s.getPermission('default', 'https://a.com', 'geolocation'), null);
  s.close();
});

test('blocked stats aggregate', () => {
  const s = fresh();
  s.addBlocked('tracker.example', 3);
  s.addBlocked('tracker.example', 2);
  s.addBlocked('ads.example');
  const sum = s.blockedSummary();
  assert.equal(sum.total, 6);
  assert.equal(sum.top[0].host, 'tracker.example');
  s.close();
});

test('removing a workspace deletes its data; default is protected', () => {
  const s = fresh();
  s.addWorkspace({ id: 'w2', name: 'Work', color: '#fff' });
  s.addVisit({ workspaceId: 'w2', url: 'https://w.com/', title: 'w' });
  s.setPermission('w2', 'https://w.com', 'media', 'allow');
  s.removeWorkspace('w2');
  assert.equal(s.recentHistory('w2').length, 0);
  assert.equal(s.permissions().length, 0);
  assert.equal(s.searchHistory('w').length, 0);
  assert.throws(() => s.removeWorkspace('default'));
  s.close();
});

test('clearBrowsingData keeps bookmarks and settings', () => {
  const s = fresh();
  s.addBookmark({ url: 'https://a.com/', title: 'A' });
  s.setSetting('theme', 'dark');
  s.addVisit({ workspaceId: 'default', url: 'https://a.com/', title: 'A' });
  s.setState('session', { tabs: [1] });
  s.clearBrowsingData();
  assert.equal(s.recentHistory('default').length, 0);
  assert.equal(s.getState('session'), null);
  assert.equal(s.bookmarks().length, 1);
  assert.equal(s.settings().theme, 'dark');
  s.close();
});

test('clearHistorySince removes only recent rows', () => {
  const s = fresh();
  s.addVisit({ workspaceId: 'default', url: 'https://old.com/', title: 'old' });
  s.addVisit({ workspaceId: 'default', url: 'https://new.com/', title: 'new' });
  s.db.prepare("UPDATE history SET last_visit=? WHERE url='https://old.com/'").run(Date.now() - 3 * 3600e3);
  s.clearHistorySince(Date.now() - 3600e3);
  assert.deepEqual(s.recentHistory('default').map((r) => r.url), ['https://old.com/']);
  assert.equal(s.searchHistory('new').length, 0);
  assert.equal(s.searchHistory('old').length, 1);
  s.close();
});
