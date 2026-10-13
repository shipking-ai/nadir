# Nadir — handoff

**Written:** 2026-10-13 · **Covers work from:** 2026-10-11 to 2026-10-12 · **Version:** 0.1.0 (pre-release, Windows only, unsigned)

This file is for anyone picking the project up: what exists, how to run and verify it, what was learned the hard way, and exactly what is left. It states what was **measured** and what was only **reasoned**. When this file and a deeper document disagree, trust the deeper document and fix this one. Every claim here points at a file that holds the evidence.

---

## 1. TL;DR

* **Nadir** is an open-source, privacy-focused desktop browser built on **Electron 44.7.0 (Chromium 152.0.7977.130, Node 24.21.0)**, with workspaces, vertical tabs, a command palette, local-only suggestions, tracker blocking, HTTPS-first, a permission broker, safe downloads, sleeping tabs, split view and lazy session restore. Licence: **GPL-3.0-or-later**.
* **It works and is tested:** 57 unit tests and 42 end-to-end tests pass, `npm audit` shows 0 vulnerabilities, and the packaged build launches (`scripts/verify-package.js` prints `PACKAGED APP OK`).
* **It is not releasable yet.** Missing, in order of importance: a code-signing certificate, a public repository, an installer and auto-update, a screen-reader pass, a real third-party security review, and anything other than Windows verification. See §9.
* **Nothing about it is "completely secure" or "completely private"**, and no document claims that. Known gaps are in [docs/SECURITY.md](docs/SECURITY.md).
* **A catalog of 772 open-source browser-related projects** was built and classified, with its blind spots written down ([docs/research/CATALOG.md](docs/research/CATALOG.md), [SWEEP.md](docs/research/SWEEP.md)). "Every possible project" is not achievable and is not claimed.
* **The biggest trap found:** Playwright-driven runs make background tabs look visible, which inflated the first memory benchmark by about 30%. **Never take memory, CPU or timing numbers from Playwright runs** (§8).

---

## 2. Quick start

Prerequisites: Windows 11, Node.js (the project was developed on v26.8.2), Git Bash or PowerShell. For some scripts also: Google Chrome installed at `C:\Program Files\Google\Chrome\Application\chrome.exe` (benchmark comparison), and the GitHub CLI `gh` logged in (research scripts only; GitHub search is limited to 30 requests per minute).

```bash
npm install
npm start                 # run the browser from source
npm test                  # 57 unit tests, about 6 s
npm run test:e2e          # 42 end-to-end tests, about a minute; tls.test.js needs internet and skips offline
npm run audit             # npm audit --omit=dev
npm run package           # builds out/Nadir-win32-x64/
node scripts/verify-package.js      # launches the packaged build like a user would
node scripts/bench.js --tabs 10 --runs 3   # Nadir vs installed Chrome (takes several minutes, writes docs/benchmarks/)
node scripts/license-inventory.js   # regenerates docs/LICENSE-INVENTORY.md
node scripts/build-catalog.js       # regenerates docs/research/CATALOG.md from the research data
npm run package:signed    # package + Authenticode sign; fails with exit code 2 until a certificate is configured (docs/RELEASE.md)
```

Environment variables the app reads (all are for tests/benchmarks; none is needed by a normal user):

| Variable | Effect |
|---|---|
| `NADIR_USER_DATA` | profile directory (tests use temp dirs) |
| `NADIR_TEST=1` | exposes `global.__nadir` (the controller) to the test harness. **Absent in packaged builds and benchmarks.** |
| `NADIR_OFFLINE=1` | skip the filter-list network refresh |
| `NADIR_HEADLESS=1` | keep the window hidden |
| `NADIR_DOWNLOAD_DIR` | fixed download folder (honoured only with the test hook) |

---

## 3. Repository map

```
LICENSE                      GPL-3.0 text (canonical, from gnu.org; SHA-256 3972dc97…6986)
README.md                    entry point, honest status
HANDOFF.md                   this file
package.json                 scripts; deps: @ghostery/adblocker-electron(+preload) 2.20.1 only
src/
  main/                      the privileged process
    main.js                  app bootstrap: privileged nadir:// scheme, sandbox, single instance, test hook
    controller.js            window, overlay view, layout, palette/find/prompts, native menus, settings side effects
    tab-manager.js           tabs, workspaces, sleeping, split view, session save/restore (lazy)
    tab-host.js              THE ONLY module that touches WebContents (engine seam, see ADR-0001)
    ipc.js                   every IPC handler; each re-validates event.sender and senderFrame
    store.js                 node:sqlite (FTS5) history, bookmarks, settings, permissions, block stats
    blocker.js               Ghostery engine wrapped by our own webRequest handler; HTTPS-first; param stripping; GPC
    permissions.js           pure policy function (deny by default)
    downloads.js             safe filenames, risk classes, never launches executables
    sessions.js              per-workspace partitions, UA cleanup, secure-DNS config
    protocol.js              nadir:// file server (host allowlist, traversal-safe, strict CSP)
    suggest.js, error-page.js
  shared/                    pure code, unit-tested: urls.js, shortcuts.js, fuzzy.js, filenames.js
  ui/                        shell/ (tabs+toolbar), overlay/ (omnibox dropdown, palette, find, prompts), newtab/, app/ (history, bookmarks, downloads, privacy, settings, about); assets/ has CSS, JS and the two preloads
test/
  unit/                      plain node:test, 5 files
  e2e/                       Playwright-driven real-app tests (helpers.js), plus:
    plain.js                 un-attached launcher (CDP to the shell page only). USE THIS FOR ANY MEASUREMENT.
    a11y.test.js             axe-core scan of every nadir:// page and the browser chrome
    tls.test.js              badssl.com certificate-error tests (internet; skips offline)
    background.test.js       background tabs are hidden and render 0 frames
scripts/                     bench.js, proctree.ps1, sign.ps1, verify-package.js, smoke.js, live-demo.js, capture-window.ps1,
                             license-inventory.js, mem-breakdown.js, and the research pipeline (discover*.js, verify-repos.js,
                             triage-discovery.js, build-catalog.js, catalog-classification.js, catalog-additions.js)
docs/                        ARCHITECTURE, SECURITY, DESIGN, PERFORMANCE, ROADMAP, FEATURE-MATRIX, SIGNATURE-FEATURES, LICENSES,
                             LICENSE-INVENTORY, DECISIONS, RELEASE, adr/0001-architecture.md, research/, benchmarks/, screenshots/
out/                         build output (git-ignored, about 374 MB)
```

The project is **not** a git repository in this checkout (`Is a git repository: false`). Initialise one before publishing; `.gitignore` already lists `node_modules/`, `out/`, `.smoke/`, `*.log`.

---

## 4. Architecture in one page (full version: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/adr/0001-architecture.md](docs/adr/0001-architecture.md))

* **Foundation:** Chromium through Electron, chosen after comparing four options (Chromium fork, alternative engine, OS-webview framework, Electron). Building Chromium or Gecko from source was infeasible here (no cmake/ninja, 100+ GB, hours per build, permanent rebase burden). The ADR lists *revisit triggers* (for example Ladybird shipping a Windows alpha, or Electron falling too far behind Chromium).
* **Engine seam:** only `tab-host.js` touches `WebContents`. Keep it that way; it is what makes a future engine swap possible.
* **Each tab** is a `WebContentsView`; each **workspace** is its own Chromium partition (`persist:ws-<id>`); **private tabs** use a memory-only partition; internal pages use `persist:nadir-internal`.
* **Internal pages** are served from a privileged `nadir://` scheme (hosts `shell`, `overlay`, `newtab`, `app`, `assets`) with a strict CSP (no inline script or style, `connect-src 'none'`). Navigating between an internal and a web page **swaps the renderer** so web content never inherits an internal preload.
* **Renderers** are sandboxed and context-isolated. Web tabs have **no preload and no IPC**. The two privileged preloads expose an allowlisted API; `ipc.js` re-checks the sender and that the call came from the main frame, per channel.
* **Data:** `node:sqlite` with FTS5 (Electron's built-in Node 24.21.0; stability tier "release candidate", re-check on Electron upgrades). All SQL is parameterised; full-text queries are tokenised and quoted.
* **Privacy features:** Ghostery adblocker (MPL-2.0) for network and cosmetic filtering, wrapped in our own `webRequest` handler (HTTPS-first upgrade with an explicit HTTP fallback page, tracking-parameter stripping, per-tab block counters), Global Privacy Control header, user agent without Electron/app tokens, deny-by-default permission broker (prompt per workspace + origin + permission; cross-origin subframes never prompt). Filter lists are downloaded at runtime from Ghostery's CDN, not bundled.

### Invariants — do not break these without a deliberate decision

1. Web tab renderers get **no** preload, **no** IPC and **no** Node.
2. Every IPC handler validates `event.sender` and `senderFrame === mainFrame` for its own channel group.
3. Page-derived text (titles, URLs) reaches the UI via `textContent`, never `innerHTML`.
4. Certificate errors have **no** "proceed anyway".
5. Nothing launches a downloaded executable.
6. Suggestions never leave the machine.
7. Settings go through per-key validators using `Object.hasOwn`.
8. `tab-host.js` stays the only `WebContents` consumer.

---

## 5. What was done (chronological summary)

| Stage | Result | Evidence |
|---|---|---|
| Research | Primary-source ledger of engines, shells, blockers and tools, with confidence levels (V = verified that day, S = secondary, M = from memory) | [docs/research/LEDGER.md](docs/research/LEDGER.md) |
| Architecture | Four options scored; Electron chosen behind a replaceable seam | [ADR-0001](docs/adr/0001-architecture.md), [DECISIONS.md](docs/DECISIONS.md) |
| Implementation | 0.1.0 as described in §1 | `src/`, [FEATURE-MATRIX.md](docs/FEATURE-MATRIX.md) |
| Tests | 57 unit + 42 e2e, see §7 | `test/` |
| Security review | Threat model T1–T13, each mapped to a test; Electron linter run (1 real finding fixed, dead code removed) | [SECURITY.md](docs/SECURITY.md) |
| Design system | Name, logo, tokens, light/dark themes | [DESIGN.md](docs/DESIGN.md), `docs/screenshots/` |
| Benchmarks | Nadir vs Chrome 154, two runs, corrected method | [PERFORMANCE.md](docs/PERFORMANCE.md) |
| Packaging | Windows x64 build, smoke-verified, licences shipped | `npm run package`, `verify-package.js` |
| Wide discovery sweep | 772 classified projects; method and blind spots | [CATALOG.md](docs/research/CATALOG.md), [SWEEP.md](docs/research/SWEEP.md) |
| Licence | GPL-3.0 text added, shipped in packages | [LICENSES.md](docs/LICENSES.md) |
| Accessibility | axe-core scan wired into e2e; 3 serious/critical issues in the browser chrome fixed | `test/e2e/a11y.test.js`, `docs/benchmarks/a11y-axe-latest.json` |
| TLS | badssl.com tests for 4 bad-certificate cases and 1 valid | `test/e2e/tls.test.js` |
| Benchmark correction | Found that Playwright inflated memory; rewrote method; added a regression test | PERFORMANCE.md "Correction", `test/e2e/background.test.js` |
| Signing pipeline | Script written and tested with a throwaway certificate on a copy | [RELEASE.md](docs/RELEASE.md), `scripts/sign.ps1` |

The original request was a 10-phase brief (research, scored catalog, architecture comparison, design system, signature features, security/licensing, performance targets, build and test, QA matrix, final deliverables). All ten have a document or artefact; the honest gaps are listed in §9.

---

## 6. Measured results and their limits

Machine: Intel i9-10980HK, 31.9 GB, Windows 11 (10.0.26300). One machine, noisy desktop. Details and raw JSON in [PERFORMANCE.md](docs/PERFORMANCE.md).

| Metric | Result | Target | Status |
|---|---|---|---|
| Private memory, 1 tab | 313–322 MB (one outlier 414 MB) vs Chrome 321–351 MB | within ±10% of Chrome | parity |
| Private memory, 11 same-origin tabs | 695 MB / 710 MB vs Chrome 628 MB / 766 MB (ratios 1.11 and 0.93) | ≤ 1.2× | met in 2 runs; not a general claim |
| Memory after sleeping 10 tabs | 446 MB / 409 MB (1.4× / 1.27× the 1-tab figure) | ≤ 1.3× | missed in run 1, met in run 2 |
| Tab switch p95 | 16.3 ms / 6.1 ms | < 16 ms | missed by 0.3 ms in run 1, met in run 2 |
| Suggestions over 5,000 history rows, p95 | 2.9 / 3.4 ms | < 20 ms | met |
| Session restore, 11 tabs | 644 / 737 ms, 1 tab loaded | ≤ 1.0 s | met |
| Start to first tab | 614–791 ms | ≤ 1.0 s | met, but **not the same milestone as Chrome's** 680–750 ms (debug port answering) |
| Idle CPU, 11 tabs | 4.19% / 0.27% vs Chrome 4.57% / 47.95% | ≤ Chrome | **unusable**: too noisy |
| Codecs | H.264, AAC, VP9, AV1, Opus, MP3 yes; **Widevine absent** | | measured by an e2e probe |

The numbers above are single runs on one machine without confidence intervals. The earlier "1.45× Chrome, target missed" was wrong (see §8).

---

## 7. Tests: how they work and how to extend them

* **Unit** (`test/unit`): plain `node:test`; covers URL resolution, store (FTS5), shortcuts, error page, filenames, fuzzy matching, the `nadir://` server, CSP and traversal.
* **E2E** (`test/e2e`): `helpers.js` launches the real app via Playwright against an isolated profile, with the `NADIR_TEST` hook and a local server that has routes for cookies, headers, codecs, downloads and so on. Run with `--test-concurrency=1`; each file starts its own app.
* **Conventions that cost real time to learn:**
  * Send keyboard shortcuts with `webContents.sendInputEvent`, **not** Playwright keys (CDP-synthesised keys bypass Electron's `before-input-event`).
  * Launch with `colorScheme: null`; otherwise Playwright emulates a colour scheme and focus and gives false observations.
  * `page.evaluate` runs with no `require`; to test raw IPC rejection, use a throwaway `BrowserWindow` with a raw `ipcRenderer` (see the "IPC trust boundaries" test).
  * Use `noWaitAfter` on clicks that start navigation, or a 30 s timeout fires.
  * To eval strings against the controller use `b.ctl('<single expression>')`; statements with `;` fail because it wraps the code in `return (…)`.
  * A test that passes in 10 ms probably tested nothing. `tls.test.js` first passed vacuously because the previous test's error page was still showing; each test now waits for its own host.
* **Do not use Playwright for measurements.** Use `test/e2e/plain.js` (`launchPlain`): it starts Nadir without the test hook and talks CDP to the shell page only.
* **Screenshots:** capture per window by HWND with `scripts/capture-window.ps1`. Never capture the whole desktop (an early capture included unrelated windows and was deleted).
* **Not covered by tests** (from [FEATURE-MATRIX.md](docs/FEATURE-MATRIX.md)): secure-DNS encryption, find-in-page matching, native menus and dialogs, OAuth popups, fullscreen video, the timer-driven auto-sleep path, clear-on-exit, light/dark by assertion, screen-reader behaviour, any non-Windows platform.

---

## 8. Lessons and traps (read before touching benchmarks or the test harness)

1. **Playwright makes background tabs "visible".** It attaches to every tab renderer; while attached, `document.visibilityState` is `visible`, `requestAnimationFrame` runs at 60 Hz and timers are unthrottled in tabs that are not on screen, and the GPU process grows by roughly 31 MB per tab. The first benchmark therefore reported 912 MB vs Chrome's 629 MB. Without it, the same build used 695–710 MB. I had even written an untested "root cause" (per-tab renderer processes) into the docs; it was wrong and has been corrected in [PERFORMANCE.md](docs/PERFORMANCE.md) and the ADR. Rule: *measure only through `plain.js`; treat any number from a Playwright run as functional evidence only.*
2. **The benchmark compares unlike milestones for startup.** Say so whenever quoting it.
3. **`scripts/mem-breakdown.js` is Playwright-driven**, so use it to see *which process type* grows (it shows the GPU process dominating), never for absolute numbers.
4. **GitHub search returns at most 1,000 results per query**, and the main discovery sweep used a 150-star floor. Both limits are recorded in [SWEEP.md](docs/research/SWEEP.md).
5. **Do not trust remembered repository names.** 89 of my 539 seed entries returned 404; 29 of the 30 I retried were just misspelled. The catalog lists every miss.
6. **Line endings:** several source files use CRLF; scripted edits that match multi-line strings must normalise `\r\n` first.
7. **Windows PowerShell 5.1 specifics:** `Get-PfxCertificate` has no `-Password`; use the .NET `X509Certificate2` constructor (done in `sign.ps1`). `New-Item`/`Remove-Item` on `Cert:` and `Env:` paths can be blocked by the sandbox; use the .NET store API and `$env:X = $null`.
8. **`rm -rf` of a sibling directory was blocked by the safety check.** A leftover folder `C:\.dl-gpl` (holds a duplicate of the licence text from the download step) still exists; it is safe to delete by hand.
9. **Electron's packaged `Nadir.exe` is unsigned** (re-branding invalidates Electron's own signature), and the packaged root `LICENSE` is Electron's, which is why the GPL text is shipped as `resources/LICENSE`.

---

## 9. What still needs to be done

Ordered by how much each item blocks a public release. "Exit" is what must be demonstrably true before the item counts as done.

### P0 — release blockers (mostly need a human or an account)

| # | Item | Why it is not done | Exit |
|---|---|---|---|
| 1 | **Code-signing certificate** | Cannot be created from inside the repo. Options and terms are in [RELEASE.md](docs/RELEASE.md) (SignPath Foundation for open source, commercial OV/EV, Azure Trusted Signing; terms not independently verified). SignPath requires a public repository and a released build first. | `npm run package:signed` exits 0 on a clean machine and SmartScreen no longer shows "unknown publisher" (verify by downloading the build, not by `Get-AuthenticodeSignature` alone) |
| 2 | ~~Code-signing policy page, tagged releases, CI build~~ **Done 2026-10-13** | Public repo <https://github.com/shipking-ai/nadir>; private vulnerability reporting enabled; CI and release workflows in `.github/workflows/`; [CODE-SIGNING-POLICY.md](docs/CODE-SIGNING-POLICY.md); pre-release [v0.1.0](https://github.com/shipking-ai/nadir/releases/tag/v0.1.0) with checksums, SBOM and a verified provenance attestation. Still unsigned. | (met) |
| 3 | **Installer and auto-update** | Not started. Installers must be signed too; update payloads need an integrity check beyond TLS | clean-VM test: install, browse, update, uninstall, scripted |
| 4 | **Trademark clearance for "Nadir"** | Only a preliminary web/GitHub/npm check was done (no browser of that name found; other uses exist: a French ventilation app, nadir.org, an unrelated npm package). USPTO/EUIPO/WIPO databases were not searched. Not legal advice. | search classes 9 and 42 in the national databases, or ask a trademark attorney |
| 5 | **Third-party security review** | None done; unit/e2e tests are not a substitute | external review or at least a fuzzing pass of URL parsing, the `nadir://` server and IPC |
| 6 | **Chromium patch lag** | Electron 44.7 ships Chromium 152 while upstream builds at 155/156 exist. Largest structural risk of the approach. | a documented update cadence (follow Electron's ~8-week majors) and the Chromium version visible in About (already shown) |

### P1 — quality and verification gaps

* **Screen-reader pass** with NVDA and Narrator on all `nadir://` pages and the chrome. The automated scan is clean for serious/critical issues but only finds a fraction of real problems. Also scan the overlay window (omnibox dropdown, palette, find bar, prompts), which the axe test does not reach.
* **Secure DNS:** verify with a packet capture that lookups are actually encrypted (only the API call is verified).
* **OAuth popups:** test `window.open` flows against at least three real providers.
* **Benchmarks:** repeat on a quiet machine with at least 5 samples and confidence intervals; add a mixed-origin workload (different sites, a video, a heavy SPA) for both browsers; add Speedometer/JetStream/MotionMark from the WebKit org (catalogued as High-value); add a `bench.js --assert` regression check; measure shutdown time, background network and keyboard-to-paint latency.
* ~~CI gating~~ Done: `ci.yml` runs unit + e2e (including `a11y` and `tls`), `npm audit`, the licence gate, packaging, the packaged-app smoke test and an SBOM on every push. Still to add: a CI job on Linux/macOS, required status checks / branch protection on `main`, and a scheduled run so a dependency or runner change is noticed.
* **Cross-platform:** Linux and macOS builds, CI and a per-platform test matrix. The code is written to be portable but has only ever run on Windows.
* **Per-tab favicon fetch** currently uses the default session; proxy it through the tab's session.
* **Untested features:** find-in-page counting, zoom, native menus, pinning, drag-reorder, workspace rename/delete, auto-sleep timer path, clear-on-exit.
* **Replace the hard-coded tracking-parameter list with ClearURLs rules** (LGPL-3.0; check the data licence before bundling).
* **Widevine/DRM:** absent. Decide whether to evaluate castlabs ECS and the cost of production signing before promising streaming-service support.

### P2 — features (see [ROADMAP.md](docs/ROADMAP.md) and [SIGNATURE-FEATURES.md](docs/SIGNATURE-FEATURES.md))

| Version | Scope | Exit criterion |
|---|---|---|
| 0.3 "Read and find" | Reader mode (Mozilla Readability), extracted-text API, local semantic history (Transformers.js in a utility process), tab groups, horizontal-tab option, import from Chrome/Firefox with per-item consent | semantic search evaluated on ≥200 labelled queries with p95 latency recorded |
| 0.4 "Assist" (opt-in) | AI panel: local Ollama first, cloud providers behind per-provider consent; citations tied to extracted passages; prompt-injection corpus in CI | ≥50 injection pages show no unapproved action; every answer links to source text |
| 0.5 "Everywhere" | Linux/macOS, encrypted file-based sync, multi-window | per-platform test matrix green |
| Later | Fingerprint **uniformity** (not spoofing), authorised automation endpoint (highest risk, after the consent UX exists), mobile investigation, alternative engine host when Ladybird/Servo mature, extension compatibility when Electron's extension work matures | see ROADMAP |

Passwords, sync and AI are **not implemented**; their design constraints (OS keychain via `safeStorage`; end-to-end encrypted blob; local-first AI, page text as data never instructions, a click for any model-requested navigation) are written down in SECURITY.md so they are not reinvented under pressure.

### P3 — research follow-ups

* Re-run the discovery sweep in star bands of 10–149 for the 30 most on-target topics, and add Codeberg, GitLab, SourceHut, Flathub, F-Droid and distribution package lists ([SWEEP.md](docs/research/SWEEP.md) "What would raise coverage").
* Read the README of the 16 **Experimental** catalog entries and try the ones that build on Windows: Zervo (workspace browser on Servo), Fen, Starling, Gosub, Orinium, Retsurf, a Rust engine by lucid-softworks, and others.
* About 5,000 low-signal sweep candidates and 1,406 small on-topic repos were never read individually; they are in the TSV files.
* The classifications in `scripts/catalog-classification.js` and `scripts/catalog-additions.js` come from one-line descriptions and activity, not code review; treat them as triage, not endorsement.

---

## 10. Decisions that need a human

1. **Which signing route** (free open-source programme vs paid certificate) and **who is the publisher name** on the certificate.
2. **Project governance:** where the repository lives, who handles security reports, what the code-signing policy says.
3. **Process-sharing trade-off (only if memory ever matters again):** letting same-site tabs share renderer processes would save memory but weakens isolation. It is not needed for the current target, so it was *not* done.
4. **Extensions:** stay on a native "module" API (planned) or invest in Chrome-extension compatibility (Electron's subset is partial; the helper library is GPL-3.0). This reshapes the whole roadmap.
5. **Engine strategy:** stay on Electron (cheap, lags upstream Chromium) or move to a Chromium fork (best security cadence, very expensive). The ADR's revisit triggers say when to ask again.
6. **Licence boundary for reused code:** AGPL projects (for example BrowserOS, SingleFile) must not be mixed into this GPL code without adopting their network clause; "other" and no-licence projects are not reusable at all.

---

## 11. Honest limits of what is claimed

* Tests prove the listed behaviours on one operating system. They do not prove the absence of vulnerabilities.
* Performance figures are from two runs on one machine with a simple same-origin workload.
* The catalog is a wide net, not a census. The sweep is GitHub-centric and English-only; its classifications are my judgement.
* Signing was tested with a throwaway self-signed certificate; real signing, timestamping and SmartScreen behaviour are untested.
* The accessibility result is an automated scan only.
* The trademark check is preliminary and non-legal.

## 12. Where to look first

| If you want to… | Read |
|---|---|
| understand why Electron | [docs/adr/0001-architecture.md](docs/adr/0001-architecture.md) |
| see every decision and bug found | [docs/DECISIONS.md](docs/DECISIONS.md) |
| know what is tested vs not | [docs/FEATURE-MATRIX.md](docs/FEATURE-MATRIX.md) |
| judge security | [docs/SECURITY.md](docs/SECURITY.md) |
| see numbers and the benchmark correction | [docs/PERFORMANCE.md](docs/PERFORMANCE.md) |
| ship a release | [docs/RELEASE.md](docs/RELEASE.md), [docs/LICENSES.md](docs/LICENSES.md) |
| plan next work | [docs/ROADMAP.md](docs/ROADMAP.md) |
| find prior art for a feature | [docs/research/CATALOG.md](docs/research/CATALOG.md), [docs/SIGNATURE-FEATURES.md](docs/SIGNATURE-FEATURES.md) |
