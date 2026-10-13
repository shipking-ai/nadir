# Feature matrix

As of 2026-10-13, Nadir 0.2.0 (73 unit + 51 e2e tests). Status vocabulary: **Implemented & tested** · **Implemented, not fully tested** · **Partially implemented** · **Planned** · **Blocked**
"Tested" means an automated test exercises the behaviour (unit = plain Node, e2e = the real app driven by Playwright against a local server). Test names are in `test/`.

## Implemented and tested

| Feature | Evidence |
|---|---|
| URL/omnibox resolution (host, host:port, IPv4/6, unicode, search fallback; blocks `javascript:`/`data:`/`vbscript:`/`blob:`/`view-source:`/unknown schemes) | unit `urls.test.js` (17); e2e "typed text…dangerous schemes refused" |
| Navigation, link clicks, back/forward, history recorded | e2e |
| Tabs: open / switch / close / reopen closed / `target=_blank` | e2e |
| **Workspaces** with isolated cookies, cache, history, tabs | e2e "workspaces isolate…" |
| **Private tabs** (memory-only partition, no history, not restored) | e2e |
| History with FTS5 prefix search, per-workspace, retention, "clear since" | unit `store.test.js` (16) |
| Bookmarks (add/remove/search, survive restart and data clearing) | unit + e2e |
| Ad/tracker **blocking** (network), per-tab counter, on/off switch | e2e (with a test filter list) |
| Real filter lists download + disk cache + reload at startup | manual runs: 6.9 MB cache, loads in <1 s; `listsLoaded:true` (not in CI: needs network) |
| **HTTPS-first** upgrade, explicit HTTP fallback page, no cert bypass | e2e + unit (error page) |
| Tracking-parameter stripping | unit + e2e |
| **Permission broker**: deny-by-default, prompt, remembered per workspace, subframes never prompt | unit (policy) + e2e |
| **Downloads**: safe names, risk classification, disguised extensions, never launches executables | unit + e2e |
| Sleeping tabs (manual + idle timer logic) / lazy wake | e2e (manual sleep, wake); timer path covered by `sleepIdle` logic only by inspection |
| Split view (two panes) | e2e (bounds) |
| Command palette (tabs, history, commands, URLs, workspaces) | unit (fuzzy) + e2e |
| Omnibox suggestions (local only; tabs, bookmarks, history, search row) | unit + e2e |
| Keyboard shortcuts from page / chrome / overlay; plain typing not hijacked | unit (map) + e2e (`sendInputEvent`) |
| Session save/restore (lazy: only the active tab loads) | e2e |
| Settings persistence + validation | unit + e2e |
| IPC trust boundaries; web pages have no privileged API; no navigation into `nadir://` | e2e (8 channels from a raw-`ipcRenderer` window rejected) |
| `nadir://` server: host allowlist, traversal-safe, CSP without inline script | unit `security.test.js` |
| Internal ↔ web renderer swap | e2e |
| Global Privacy Control header on every request; UA free of Electron/app tokens | e2e (found and fixed a `Nadir/0.1.0` UA leak) |
| Packaged build launches and browses (unsigned) | `scripts/verify-package.js` (manual/CI step, not part of `npm test`) |
| Certificate errors (expired, self-signed, wrong host, untrusted root): plain error page, no bypass, no script | e2e `tls.test.js` against badssl.com (needs internet; skips offline) |
| Background tabs are hidden and render no frames; foreground renders at frame rate | e2e `background.test.js` (un-attached launcher) |
| Codec support measured: H.264, AAC, VP9, AV1, Opus, MP3 yes; Widevine no | e2e probe (recorded) |

## Implemented, not fully tested

| Feature | What is missing |
|---|---|
| Secure DNS (DoH) settings | `configureHostResolver` called without error; **not verified** that lookups are actually encrypted (needs packet capture) |
| Find in page | open/close via keyboard tested; match counting and navigation not tested |
| Zoom, DevTools, tab/context menus (native), tab pinning, move tab to workspace, drag-reorder, workspace rename/delete dialogs | no automated tests (native menus/dialogs need a different harness); `reorder`/`moveToWorkspace` logic untested |
| Popups via `window.open` (OAuth-style) | allowed with sandboxed prefs; not tested against real providers |
| Fullscreen video handling | code path exists; not exercised |
| Clear-on-exit, history retention at startup | store parts unit-tested; exit path not e2e-tested |
| Collapsed sidebar, light/dark theme | verified by screenshots, not by assertions |
| Accessibility (roles, focus rings, roving tabindex, reduced motion) | axe-core 4.14.0 automated scan: no serious/critical violations on the 6 internal pages, new-tab page and browser chrome (e2e `a11y.test.js`). **Not tested with a screen reader**; automated scans catch only a fraction of real problems |
| Auto-sleep timer (`tabSleepMinutes`) | logic present; the timer-driven path is not e2e-tested |

## Partially implemented

| Feature | State |
|---|---|
| Tab management | vertical tabs only; no horizontal layout, no tab groups |
| Split view | 2 panes, no resize handle, no synchronised scrolling |
| Privacy dashboard | counts + top hosts + permissions; no per-site view, no fingerprinting protection |
| Search | keyword/prefix (FTS5) only; **no semantic search yet** |

## Planned (not started)

AI panel & local LLM integration · semantic history · reader mode · translation · annotations · picture-in-picture/media controls beyond Chromium defaults · extensions · password manager integration · encrypted sync · import/export from other browsers · multi-window · Linux/macOS builds · installer, signing, auto-update · automation endpoint · developer/researcher modes · themes/CSS customisation · gestures.

## Blocked

| Item | Blocker |
|---|---|
| Signed builds / installer | needs a code-signing certificate (external); `scripts/sign.ps1` is ready but only tested with a throwaway self-signed cert (see RELEASE.md) |
| Chrome Web Store extensions | Electron supports only a subset of the extension API (official docs); helper library is GPL-3.0 and MV3 is pending upstream |
| Widevine / DRM streaming | **measured absent** in this Electron build (probe returns false); needs a Widevine-enabled Chromium distribution |
| Native Ladybird/Servo engine hosts | engines not ready (Ladybird alpha targets Linux/macOS; Servo is a "tech demo") |
| macOS/Linux verification | only a Windows machine was available; code is written cross-platform but **untested** there |
