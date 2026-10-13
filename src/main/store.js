// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { DatabaseSync } = require('node:sqlite');

const SCHEMA_VERSION = 1;

const DEFAULT_SETTINGS = Object.freeze({
  searchProvider: 'duckduckgo',
  searchProviders: {
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    brave: { name: 'Brave Search', url: 'https://search.brave.com/search?q=%s' },
    startpage: { name: 'Startpage', url: 'https://www.startpage.com/do/search?q=%s' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=%s' },
    custom: { name: 'Custom (e.g. your SearXNG)', url: '' },
  },
  blocking: { enabled: true },
  httpsUpgrade: true,
  stripTrackingParams: true,
  sidebarCollapsed: false,
  theme: 'system',
  tabSleepMinutes: 15,
  restoreSession: true,
  secureDns: { mode: 'off', server: '' },
  historyRetentionDays: 0, // 0 = keep until cleared
  clearOnExit: false,
});

/** Parameterised-SQL-only persistence for everything the browser remembers. */
class Store {
  /** @param {string} file path or ':memory:' */
  constructor(file) {
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA synchronous = NORMAL;');
    this._stmt = new Map();
    this._migrate();
  }

  _s(sql) {
    let s = this._stmt.get(sql);
    if (!s) { s = this.db.prepare(sql); this._stmt.set(sql, s); }
    return s;
  }

  _migrate() {
    const v = this.db.prepare('PRAGMA user_version').get().user_version;
    if (v >= SCHEMA_VERSION) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, position INTEGER NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY, workspace_id TEXT NOT NULL, url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '',
        visit_count INTEGER NOT NULL DEFAULT 1, last_visit INTEGER NOT NULL, UNIQUE(workspace_id, url));
      CREATE INDEX IF NOT EXISTS history_last ON history(last_visit DESC);
      CREATE VIRTUAL TABLE IF NOT EXISTS history_fts USING fts5(title, url, tokenize='unicode61 remove_diacritics 2');
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY, url TEXT NOT NULL UNIQUE, title TEXT NOT NULL DEFAULT '', folder TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY, url TEXT NOT NULL, filename TEXT NOT NULL, path TEXT NOT NULL DEFAULT '',
        state TEXT NOT NULL, received INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
        risk TEXT NOT NULL DEFAULT '', started_at INTEGER NOT NULL, finished_at INTEGER);
      CREATE TABLE IF NOT EXISTS permissions (
        workspace_id TEXT NOT NULL, origin TEXT NOT NULL, permission TEXT NOT NULL, decision TEXT NOT NULL, updated_at INTEGER NOT NULL,
        PRIMARY KEY (workspace_id, origin, permission));
      CREATE TABLE IF NOT EXISTS blocked_stats (
        day TEXT NOT NULL, host TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (day, host));
    `);
    this.db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    if (this.workspaces().length === 0) this.addWorkspace({ id: 'default', name: 'Home', color: '#8bd3a8' });
  }

  close() { this._stmt.clear(); this.db.close(); }

  // ---- settings & generic state ----
  settings() {
    const rows = this._s('SELECT key, value FROM kv WHERE key LIKE ?').all('setting:%');
    const out = structuredClone(DEFAULT_SETTINGS);
    for (const { key, value } of rows) {
      const k = key.slice('setting:'.length);
      if (Object.hasOwn(DEFAULT_SETTINGS, k)) {
        try { out[k] = JSON.parse(value); } catch { /* keep default on corrupt value */ }
      }
    }
    return out;
  }
  setSetting(key, value) {
    if (!Object.hasOwn(DEFAULT_SETTINGS, key)) throw new Error(`Unknown setting: ${key}`);
    this._s('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
      .run(`setting:${key}`, JSON.stringify(value));
  }
  getState(key, fallback = null) {
    const r = this._s('SELECT value FROM kv WHERE key=?').get(`state:${key}`);
    if (!r) return fallback;
    try { return JSON.parse(r.value); } catch { return fallback; }
  }
  setState(key, value) {
    this._s('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
      .run(`state:${key}`, JSON.stringify(value));
  }

  // ---- workspaces ----
  workspaces() { return this._s('SELECT id,name,color,position FROM workspaces ORDER BY position, created_at').all(); }
  addWorkspace({ id, name, color }) {
    const pos = this._s('SELECT COALESCE(MAX(position),-1)+1 AS p FROM workspaces').get().p;
    this._s('INSERT INTO workspaces(id,name,color,position,created_at) VALUES(?,?,?,?,?)').run(id, String(name).slice(0, 40), color, pos, Date.now());
  }
  renameWorkspace(id, name) { this._s('UPDATE workspaces SET name=? WHERE id=?').run(String(name).slice(0, 40), id); }
  removeWorkspace(id) {
    if (id === 'default') throw new Error('The default workspace cannot be removed');
    this._s('DELETE FROM workspaces WHERE id=?').run(id);
    this._s('DELETE FROM history WHERE workspace_id=?').run(id);
    this._s('DELETE FROM permissions WHERE workspace_id=?').run(id);
    this._rebuildFts();
  }

  // ---- history ----
  addVisit({ workspaceId, url, title }) {
    if (!/^https?:|^file:/i.test(url)) return;
    const now = Date.now();
    const existing = this._s('SELECT id FROM history WHERE workspace_id=? AND url=?').get(workspaceId, url);
    if (existing) {
      this._s('UPDATE history SET visit_count=visit_count+1, last_visit=?, title=CASE WHEN ?<>\'\' THEN ? ELSE title END WHERE id=?')
        .run(now, title || '', title || '', existing.id);
      if (title) {
        this._s('DELETE FROM history_fts WHERE rowid=?').run(existing.id);
        this._s('INSERT INTO history_fts(rowid,title,url) VALUES(?,?,?)').run(existing.id, title, url);
      }
    } else {
      const r = this._s('INSERT INTO history(workspace_id,url,title,last_visit) VALUES(?,?,?,?)').run(workspaceId, url, title || '', now);
      this._s('INSERT INTO history_fts(rowid,title,url) VALUES(?,?,?)').run(Number(r.lastInsertRowid), title || '', url);
    }
  }
  updateTitle({ workspaceId, url, title }) {
    const row = this._s('SELECT id FROM history WHERE workspace_id=? AND url=?').get(workspaceId, url);
    if (!row || !title) return;
    this._s('UPDATE history SET title=? WHERE id=?').run(title, row.id);
    this._s('DELETE FROM history_fts WHERE rowid=?').run(row.id);
    this._s('INSERT INTO history_fts(rowid,title,url) VALUES(?,?,?)').run(row.id, title, url);
  }
  recentHistory(workspaceId, limit = 200) {
    const sql = workspaceId
      ? 'SELECT id,url,title,visit_count,last_visit,workspace_id FROM history WHERE workspace_id=? ORDER BY last_visit DESC LIMIT ?'
      : 'SELECT id,url,title,visit_count,last_visit,workspace_id FROM history ORDER BY last_visit DESC LIMIT ?';
    return workspaceId ? this._s(sql).all(workspaceId, limit) : this._s(sql).all(limit);
  }
  /** Prefix full-text search across title+url. Input is treated as literal tokens, never as FTS syntax. */
  searchHistory(query, { workspaceId = null, limit = 8 } = {}) {
    const fts = ftsQuery(query);
    if (!fts) return [];
    const sql = `SELECT h.id,h.url,h.title,h.visit_count,h.last_visit FROM history_fts f JOIN history h ON h.id=f.rowid
      WHERE history_fts MATCH ? ${workspaceId ? 'AND h.workspace_id=?' : ''}
      ORDER BY (h.visit_count * 1.0) / (1 + (? - h.last_visit) / 86400000.0 / 14) DESC, h.last_visit DESC LIMIT ?`;
    const args = workspaceId ? [fts, workspaceId, Date.now(), limit] : [fts, Date.now(), limit];
    return this._s(sql).all(...args);
  }
  topSites(workspaceId, limit = 8) {
    return this._s('SELECT url,title,visit_count FROM history WHERE workspace_id=? ORDER BY visit_count DESC, last_visit DESC LIMIT ?').all(workspaceId, limit);
  }
  deleteHistory(id) {
    this._s('DELETE FROM history WHERE id=?').run(id);
    this._s('DELETE FROM history_fts WHERE rowid=?').run(id);
  }
  clearHistory({ workspaceId = null, olderThan = null } = {}) {
    if (workspaceId && olderThan) this._s('DELETE FROM history WHERE workspace_id=? AND last_visit<?').run(workspaceId, olderThan);
    else if (workspaceId) this._s('DELETE FROM history WHERE workspace_id=?').run(workspaceId);
    else if (olderThan) this._s('DELETE FROM history WHERE last_visit<?').run(olderThan);
    else this._s('DELETE FROM history').run();
    this._rebuildFts();
  }
  /** Remove everything visited at or after `since` (ms epoch): "clear the last hour". */
  clearHistorySince(since) {
    this._s('DELETE FROM history WHERE last_visit >= ?').run(since);
    this._rebuildFts();
  }
  _rebuildFts() {
    this.db.exec('DELETE FROM history_fts');
    this.db.exec('INSERT INTO history_fts(rowid,title,url) SELECT id,title,url FROM history');
  }
  enforceRetention(days) {
    if (days > 0) this.clearHistory({ olderThan: Date.now() - days * 86400000 });
  }

  // ---- bookmarks ----
  addBookmark({ url, title, folder = '' }) {
    this._s('INSERT INTO bookmarks(url,title,folder,created_at) VALUES(?,?,?,?) ON CONFLICT(url) DO UPDATE SET title=excluded.title, folder=excluded.folder')
      .run(url, title || url, folder, Date.now());
  }
  removeBookmark(url) { this._s('DELETE FROM bookmarks WHERE url=?').run(url); }
  isBookmarked(url) { return !!this._s('SELECT 1 x FROM bookmarks WHERE url=?').get(url); }
  bookmarks() { return this._s('SELECT id,url,title,folder,created_at FROM bookmarks ORDER BY created_at DESC').all(); }
  searchBookmarks(query, limit = 5) {
    const q = `%${String(query).replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    return this._s("SELECT url,title FROM bookmarks WHERE title LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\' ORDER BY created_at DESC LIMIT ?").all(q, q, limit);
  }

  // ---- downloads ----
  addDownload({ url, filename, path, total, risk }) {
    const r = this._s('INSERT INTO downloads(url,filename,path,state,total,risk,started_at) VALUES(?,?,?,?,?,?,?)')
      .run(url, filename, path, 'progressing', total || 0, risk || '', Date.now());
    return Number(r.lastInsertRowid);
  }
  updateDownload(id, { state, received, path }) {
    this._s('UPDATE downloads SET state=COALESCE(?,state), received=COALESCE(?,received), path=COALESCE(?,path), finished_at=CASE WHEN ? IN (\'completed\',\'cancelled\',\'interrupted\') THEN ? ELSE finished_at END WHERE id=?')
      .run(state ?? null, received ?? null, path ?? null, state ?? '', Date.now(), id);
  }
  downloads(limit = 100) { return this._s('SELECT * FROM downloads ORDER BY started_at DESC LIMIT ?').all(limit); }
  clearDownloads() { this._s('DELETE FROM downloads').run(); }

  // ---- permissions ----
  getPermission(workspaceId, origin, permission) {
    const r = this._s('SELECT decision FROM permissions WHERE workspace_id=? AND origin=? AND permission=?').get(workspaceId, origin, permission);
    return r ? r.decision : null;
  }
  setPermission(workspaceId, origin, permission, decision) {
    this._s('INSERT INTO permissions(workspace_id,origin,permission,decision,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(workspace_id,origin,permission) DO UPDATE SET decision=excluded.decision, updated_at=excluded.updated_at')
      .run(workspaceId, origin, permission, decision, Date.now());
  }
  clearPermission(workspaceId, origin, permission) {
    this._s('DELETE FROM permissions WHERE workspace_id=? AND origin=? AND permission=?').run(workspaceId, origin, permission);
  }
  permissions() { return this._s('SELECT workspace_id,origin,permission,decision,updated_at FROM permissions ORDER BY updated_at DESC').all(); }

  // ---- privacy stats ----
  addBlocked(host, n = 1) {
    const day = new Date().toISOString().slice(0, 10);
    this._s('INSERT INTO blocked_stats(day,host,count) VALUES(?,?,?) ON CONFLICT(day,host) DO UPDATE SET count=count+excluded.count').run(day, host, n);
  }
  blockedSummary(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const total = this._s('SELECT COALESCE(SUM(count),0) n FROM blocked_stats WHERE day>=?').get(since).n;
    const top = this._s('SELECT host, SUM(count) n FROM blocked_stats WHERE day>=? GROUP BY host ORDER BY n DESC LIMIT 15').all(since);
    return { total, top };
  }

  /** Wipe all browsing data (history, downloads list, permissions, stats). Bookmarks and settings are kept. */
  clearBrowsingData() {
    this.db.exec('DELETE FROM history; DELETE FROM history_fts; DELETE FROM downloads; DELETE FROM permissions; DELETE FROM blocked_stats;');
    this.db.exec("DELETE FROM kv WHERE key='state:session'");
  }
}

/** Turn arbitrary user text into a safe FTS5 prefix query: each token quoted, last token prefix-matched. */
function ftsQuery(text) {
  const tokens = String(text).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 8);
  if (!tokens.length) return '';
  return tokens.map((t, i) => `"${t.replace(/"/g, '""')}"${i === tokens.length - 1 ? '*' : ''}`).join(' ');
}

module.exports = { Store, DEFAULT_SETTINGS, ftsQuery };
