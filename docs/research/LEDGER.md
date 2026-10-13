# Research Ledger

> **Update 2026-10-12:** the wider discovery sweep is documented in [SWEEP.md](SWEEP.md) and [CATALOG.md](CATALOG.md). This ledger keeps the original architecture-deciding shortlist.

**Research date:** 2026-10-11 (all "verified" items were checked on this date).
**Method:** GitHub REST API (`gh api`) for archived flag / last push / SPDX license / latest release; npm registry (`npm view`) for package versions and licenses; official documentation pages for capability claims; one-off web searches where noted. Machine-readable GitHub pull: [`ledger-github.psv`](ledger-github.psv).

**Confidence levels**
- **V** – verified on 2026-10-11 against a primary source (API/registry/official docs).
- **S** – sourced from a secondary source (news/search snippet); treat as likely.
- **M** – from model background knowledge, *not* re-verified today. Re-check before relying on it.

> Star counts are recorded only as a liveness signal. They are not used as evidence of quality.

---

## 1. Engines and shells

| Project | Repo / docs | Status (2026-10-11) | License | Platforms | Verdict | Conf. |
|---|---|---|---|---|---|---|
| Chromium | github.com/chromium/chromium | Active (push today) | BSD-3-Clause (+ many third-party) | Win/Mac/Linux/Android | Engine we ship **via Electron**. Own fork = infeasible here (see ADR-0001) | V |
| Electron | github.com/electron/electron · electronjs.org | Active; v44.7.0 released 2026-10-07; Chromium **152.0.7977.130**, Node **24.21.0** (measured locally). Supports latest 3 stable majors, ~8-week cadence. **Measured locally:** H.264/AAC/VP9/AV1/Opus/MP3 decode; Widevine absent | MIT | Win/Mac/Linux | **Core** | V |
| CEF | github.com/chromiumembedded/cef | Active (push 2026-10-10); no GitHub releases (distributes builds elsewhere) | BSD-style (API reports NOASSERTION) | Win/Mac/Linux | Alternative shell; C++ integration cost. Kept as replacement path behind `TabHost` | V (activity) / M (license text) |
| Tauri / Wry | github.com/tauri-apps/tauri, /wry | Active; wry 0.57.0 (2026-09-08) | Apache-2.0 / MIT | Win/Mac/Linux/mobile | **Rejected for browser core**: multi-webview in one window is still behind an `unstable` feature flag (official v2 beta post; no 2026 evidence it was stabilised); uses the OS webview (WebView2 / WKWebView / WebKitGTK) → three different engines, no per-request blocking API, no extension story | V (status) / S (multiwebview) |
| WebView2 | learn.microsoft.com/microsoft-edge/webview2 | Runtime 154.0.4258.62 installed locally | Proprietary runtime (redistributable, not open source) | Windows | Rejected: closed-source runtime conflicts with the open-source goal | V (local) / M (license) |
| Servo | github.com/servo/servo | Active; **v0.7.0 (2026-10-05)** is labelled a "Tech Demo" in release notes | MPL-2.0 | Win/Mac/Linux/OHOS | **Experimental**. Excellent long-term engine-diversity bet; not usable as daily engine | V |
| Ladybird | github.com/LadybirdBrowser/ladybird | Active; no tagged releases. Official site: first **Alpha for Linux and macOS** "in 2026", beta 2027, stable 2028. Native Windows only *teased* (July 2026); WSL2 otherwise | BSD-2-Clause | Linux/macOS (Windows: WSL2) | **Experimental / rejected for now**. Revisit at Alpha | V (repo) / S (roadmap) |
| Firefox / Gecko | github.com/mozilla-firefox/firefox | Active | MPL-2.0 (+ others; API reports NOASSERTION) | Win/Mac/Linux | Rejected as base: no embeddable Windows shell comparable to Electron/CEF; GeckoView is Android-focused | V (activity) / M (embedding claims) |
| WebKit | github.com/WebKit/WebKit | Active | LGPL/BSD mix (API: none) | Mac/Linux (Win port exists, not a mainstream embed) | Rejected for Windows-first | V (activity) / M (rest) |
| Qt WebEngine | qt.io | – | LGPL-3 / GPL / commercial | Win/Mac/Linux | Not investigated in depth; Chromium-based, C++/Qt cost. Rejected as redundant with Electron | M |

## 2. Existing browsers studied (not wrapped)

| Project | Status | License | What we learn / take |
|---|---|---|---|
| Brave (`brave/brave-core`) | Active (push today) | MPL-2.0 | Proves a maintained Chromium patch-set is a full-time engineering effort; source of `adblock-rust` |
| ungoogled-chromium | Active; **155.0.8059.39-1 (2026-10-08)** | BSD-3-Clause | Reference for de-Googling patch set; indicates upstream Chromium is at ≥155 today |
| Thorium | Active; **M156.0.8078.28 (2026-10-11)** | BSD-3-Clause | Shows upstream is at M156 → **Electron 44 (Chromium 152) lags ~4 majors** |
| Zen Browser | Active; 1.23.2b (2026-10-09) | MPL-2.0 | Gecko-based workspaces / vertical tabs / split view UX reference (UX only; Gecko fork is out of reach here) |
| Helium | **`imputnet/helium`** (my earlier URL guess `helium-browser/helium` was wrong) — active 2026-10-11, GPL-3.0, beta; Chromium-based on ungoogled-chromium, bundles a uBlock Origin fork | GPL-3.0 | Closest prior art for a *Chromium-fork track* (see ADR revisit triggers) |

## 3. Privacy, security, networking

| Project | Status | License | Decision | Notes | Conf. |
|---|---|---|---|---|---|
| `@ghostery/adblocker` + `-electron` | Active; **2.20.1 (2026-10-09)** | MPL-2.0 | **Core** | Pure-JS/TS engine parsing EasyList/uBlock-syntax filters; Electron `webRequest` integration; MPL-2.0 is compatible with GPL-3.0 (MPL §3.3 secondary license) | V |
| uBlock Origin | Active; 1.75.0 (2026-09-16) | GPL-3.0 | Optional (as an extension, if extension host proves out). Not embeddable as a library | V |
| `brave/adblock-rust` | Active (2026-10-07); no GH releases | MPL-2.0 | Experimental: faster Rust engine; would need N-API binding. Not needed while Ghostery meets perf targets | V |
| DuckDuckGo Tracker Radar | Active; 2026.09.21 | NOASSERTION (CC-BY-NC-SA data; **non-commercial restriction – M**) | Optional data source for the privacy dashboard; license review required before shipping data | V (activity) / M (license) |
| Privacy Badger | Active; release-2026.09.15 | GPL-3.0 (API: NOASSERTION) | Optional (extension) | V |
| Ghostery extension | Active; 10.6.7 (2026-10-07) | GPL-3.0 | Optional/reference | V |
| AdGuard `dnsproxy` | Active; v0.86.0 (2026-10-01) | Apache-2.0 | Optional isolated process for DoH/DoT/DoQ upstream + filtering | V |
| AdGuard Home | Active; v0.107.79 | GPL-3.0 | Not embedded (network appliance) | V |
| Chromium built-in DoH | – | BSD | **Core** via `app.configureHostResolver({secureDnsMode, secureDnsServers})` (Electron API) | M (to be exercised in M2) |
| Bitwarden clients | Active | NOASSERTION (GPL-3 + proprietary SDK parts – M) | Do not embed; integrate via standard extension / external autofill | V/M |
| Vaultwarden | Active | AGPL-3.0 | Server-side; not embedded | V |

## 4. Extensions

| Item | Finding | Conf. |
|---|---|---|
| Electron native extensions | Official docs: supports only a **subset** of Chrome Extension APIs; "Electron does not support arbitrary Chrome extensions from the store"; unpacked only; must be re-loaded every launch; `chrome.storage.sync/managed` unsupported; tabs API partial; full compatibility is a non-goal | V |
| `electron-chrome-extensions` | npm 4.9.0, **last published 2025-07-02**, but repo (`samuelmaddock/electron-browser-shell`) has commits as late as **2026-09-01** (upgrade to latest Electron). **GPL-3.0** with separate proprietary license on request. README: MV3 pending upstream Electron work; Chrome Platform Apps not planned | V |
| `electron-chrome-web-store` | npm 0.13.0 (MIT), downloads CRX from Chrome Web Store | V |
| Conclusion | Chrome-extension compatibility is **partial and a known gap** vs. Chrome. Ship an *Extensions (experimental)* module, never promise "runs all Chrome extensions" | V |

## 5. AI, search, automation, data

| Project | Status | License | Decision | Conf. |
|---|---|---|---|---|
| Ollama | Active; v0.40.3 (2026-10-11) | MIT | **High-value**: local LLM over localhost HTTP; separate process | V |
| llama.cpp | Active; v0.6.0 (2026-10-05) | MIT | High-value (via Ollama or direct server); isolated process | V |
| Transformers.js | Active; 4.3.1 (2026-10-06) | Apache-2.0 | High-value for on-device embeddings (semantic history) in a utility process | V |
| WebLLM (MLC) | Active; v0.2.86 (2026-10-11) | Apache-2.0 | Optional: in-renderer WebGPU LLM; heavy VRAM | V |
| sqlite-vec | Last push 2026-05-18; v0.1.9 (2026-03-31) | Apache-2.0 | Experimental (pre-1.0, slower cadence) – brute-force cosine in JS is enough at personal-history scale | V |
| SQLite FTS5 via `node:sqlite` | Works in Electron 44 (SQLite 3.53.4, FTS5 present) – measured locally. `node:sqlite` stability level to be re-checked (see risks) | V (local) |
| Tantivy | Active; 0.26.1 | MIT | Optional/Rejected: FTS5 suffices | V |
| Meilisearch | Active; v1.54.3 | NOASSERTION (MIT + BUSL parts – M) | Rejected: server, license mix | V/M |
| SearXNG | Active | AGPL-3.0 | Optional **as a user-configured search provider URL** (no code embedded) | V |
| Playwright | Active; v1.64.0 (2026-10-07), `playwright-core` 1.64.0 | Apache-2.0 | **High-value for testing** (Electron launch API) and later user-authorised automation | V |
| browser-use | Active; 0.13.11 (2026-10-07) | MIT | Reference for agent loops / accessibility-tree navigation; Python process, would be isolated. Not embedded | V |
| Mozilla Readability | Last push 2026-08-04 | Apache-2.0 | **High-value** reader mode / clean text for AI | V |
| pdf.js | Active; v6.4.299 | Apache-2.0 | Optional (Chromium already ships a PDF viewer) | V |
| Syncthing | Active; v2.1.6 | MPL-2.0 | Optional **external** transport for encrypted sync (user-run); we would sync an encrypted blob file | V |
| `electron-dl` | v5.0.0 (2026-09-20) | MIT | Not needed – Electron `will-download` suffices | V |
| `better-sqlite3` | 13.0.3 | MIT | Not needed – `node:sqlite` avoids a native build | V |

---

## 6. Scoring methodology

Scores are **my structured judgment (1–10)** from the verified facts above, *not* measurements or benchmarks. Each criterion:

- **Feature** – how much of the browser-relevant capability it supplies out of the box.
- **Maturity** – production use evidence, release stability (from release pages / status text).
- **Security** – sandboxing model, patch cadence; penalised for lag behind upstream and for unmeasured claims.
- **Performance** – expected resource profile *(unmeasured; see Phase 7 baseline)*.
- **Maintainability** – language/tooling fit for this workspace, API stability, size of surface we must own.
- **Integration** – effort to wire into this architecture on Windows today.
- **License** – compatibility with a GPL-3.0-or-later distributed combined work.
- **Viability** – activity, governance, bus-factor signals.

| Candidate | Feat | Matur | Sec | Perf | Maint | Integr | Lic | Viab | Class |
|---|---|---|---|---|---|---|---|---|---|
| Electron (Chromium 152) | 8 | 9 | 7¹ | 6 | 8 | 10 | 10 | 9 | **Core** |
| `@ghostery/adblocker-electron` | 8 | 8 | 7 | 8 | 8 | 9 | 9 | 8 | **Core** |
| `node:sqlite` + FTS5 | 7 | 6² | 8 | 8 | 9 | 10 | 10 | 8 | **Core** |
| Playwright (tests/automation) | 9 | 9 | 7 | 7 | 8 | 9 | 10 | 9 | **Core (dev)** |
| Ollama (local LLM) | 9 | 8 | 7 | 7 | 7 | 8 | 10 | 9 | High-value |
| Transformers.js (embeddings) | 7 | 7 | 7 | 6 | 7 | 7 | 10 | 8 | High-value |
| Mozilla Readability | 7 | 8 | 7 | 9 | 9 | 9 | 10 | 6 | High-value |
| AdGuard dnsproxy | 7 | 8 | 8 | 8 | 6 | 6 | 10 | 8 | Optional |
| `electron-chrome-extensions` | 5 | 5 | 5 | 7 | 5 | 6 | 5³ | 6 | Experimental |
| Servo | 4 | 3 | 7 | 6 | 5 | 3 | 8 | 8 | Experimental |
| Ladybird | 3 | 2 | 7 | 6 | 4 | 2 | 10 | 8 | Experimental |
| CEF | 8 | 9 | 7 | 7 | 5 | 5 | 9 | 9 | Optional (replacement path) |
| Tauri/Wry + OS webview | 5 | 6 | 6 | 8 | 7 | 4 | 10 | 9 | **Rejected** (core) |
| WebView2 | 6 | 8 | 7 | 8 | 7 | 4 | 2 | 8 | **Rejected** |
| Meilisearch | 7 | 8 | 6 | 7 | 4 | 4 | 3 | 8 | **Rejected** |
| sqlite-vec | 6 | 4 | 7 | 7 | 6 | 5 | 10 | 5 | Experimental |

¹ Capped: Chromium 152 vs ≥155/156 upstream today (inference from ungoogled/Thorium releases) – patch lag is a real exposure; Electron backports security fixes but we do not measure completeness.
² `node:sqlite` is a Node built-in whose stability tier must be re-checked per Node release.
³ GPL-3.0 is compatible with our chosen licence, but forecloses permissive/proprietary relicensing without a separate license from its author.

## 7. Known gaps in this research (honest list)

- Security-history review (CVE counts) per project was **not** performed; only Electron's published support/patching policy was checked.
- Hardware/system requirements were not verified per project beyond what was run locally.
- Mobile compatibility (Phase 1 item 18) and Qt WebEngine were not researched in depth.
- DuckDuckGo Tracker Radar, CEF, Bitwarden, Meilisearch licenses are flagged **M**.
- The "Helium" repo URL I first tried was wrong; resolved on 2026-10-12 (see §2).
- **Second sweep (2026-10-12):** see [SWEEP.md](SWEEP.md) and the generated [CATALOG.md](CATALOG.md) — 772 verified and classified projects across engines, forks, shells, privacy, extensions, automation, AI, sync, search, accessibility, mobile, standards (322 of them found by the sweep rather than my seed list). It is a wide net, not a census: see the blind spots in SWEEP.md.
