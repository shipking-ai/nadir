# ADR-0001: Foundation — Chromium via Electron, behind a replaceable `TabHost`

- **Status:** Accepted (2026-10-11). Revisit triggers listed below.
- **Evidence:** [`docs/research/LEDGER.md`](../research/LEDGER.md)

## Context

Goal: a feature-rich, security-conscious, open-source browser. Environment: Windows 11, 32 GB RAM, Node 24-era toolchain, Rust 1.95, VS Build Tools 2022, no cmake/ninja. Compiling a browser engine from source (Chromium/Gecko) needs 100+ GB of source+objects and many hours, and a permanent patch-rebase team to stay secure; that is not available here and would not yield a *usable* product inside this session.

## Options compared

| | A. Chromium fork (Brave/ungoogled style) | B. Alternative engine (Servo / Ladybird / Gecko) | C. Native framework w/ OS webview (Tauri+Wry, WebView2) | D. Embed Chromium via Electron (chosen) |
|---|---|---|---|---|
| Rendering compatibility | Best (current Chromium) | Servo 0.7 is a "tech demo"; Ladybird pre-alpha, no native Windows | Differs per OS (WebView2 / WebKit) | Very good (Chromium 152) |
| Per-tab isolation & many tabs | Native | Engine-dependent | Multiwebview still behind `unstable` flag | `WebContentsView` per tab, separate processes, session partitions |
| Request-level blocking | Anything (patch) | Custom | Limited/OS-dependent | `session.webRequest` + Ghostery engine |
| Extensions | Full | None | None | **Partial** (Electron subset; GPL helper pkg) |
| Security patch lag | Lowest if rebased weekly | Unknown | Tracks OS vendor | **Lags upstream ~3–4 majors** (152 vs ≥155/156) – mitigated by following Electron's 8-week cadence |
| Memory | Best | Unknown | Lowest shell overhead | Chromium + Electron shell overhead (to be measured) |
| Dev cost here | Prohibitive | Prohibitive/blocked | Moderate, but blocked on multi-webview + no extension story | **Low** |
| Licensing | BSD + third party | MPL/BSD | MIT/Apache (+ proprietary runtime on Windows) | MIT (Electron) + Chromium's mixed licences |
| Open-source purity | Yes | Yes | Windows runtime is closed-source | Yes (Electron/Chromium); note proprietary codecs excluded in Electron builds |

## Decision

Build on **D**, but architect for replaceability:

1. All engine interaction goes through `src/main/tab-host.js` (create/navigate/discard/capture/zoom/find, plus events). Nothing else touches `WebContents`. A CEF, Servo, or Chromium-fork host can be substituted later.
2. Privileged browser UI is **not** a webpage with Node access: it runs in sandboxed, context-isolated renderers with a narrow `contextBridge` API, and every IPC handler validates the sender.
3. Everything that can be a separate process/service stays one: local LLM (Ollama, HTTP on loopback), DNS proxy (optional), Playwright (test-only), sync transport (external, encrypted blob).

### Why not the others (short)
- **A:** the right *long-term* answer for extension compatibility and patch freshness; infeasible in this environment. Documented as a roadmap option, enabled by `TabHost`.
- **B:** Servo (v0.7.0 "Tech Demo", MPL-2.0) and Ladybird (Alpha targeted Linux/macOS 2026) can't be a daily-driver engine yet. Revisit when Ladybird ships a Windows alpha or Servo exits tech-demo status.
- **C:** WebView2 is a closed-source runtime; Tauri's multi-webview-in-one-window is unstable; no blocking/extension primitives. Great for apps, wrong for a browser core.

## Consequences

- ✔ Real, current-ish Chromium rendering, a working tab model, request interception, partitions, and downloads available now.
- ✘ **Extension compatibility is partial** (Electron subset only). The Extensions module will be labelled experimental.
- ✘ **Security-patch lag** vs. upstream Chrome. Mitigation: track Electron stable releases (≈ every 8 weeks, 3 supported majors), `npm audit` in CI, show the Chromium version in *About*, never claim parity with Chrome's security.
- ✔ **Measured (2026-10-12):** this build decodes H.264, AAC, VP9, AV1, Opus and MP3 (e2e codec probe). My earlier expectation that proprietary codecs would be missing was **wrong**. ✘ **Widevine DRM is absent** (`requestMediaKeySystemAccess('com.widevine.alpha')` rejects), so DRM-protected streaming services will not play.
- ✔ **Measured (corrected 2026-10-12):** 1-tab memory is at parity with Chrome 154, and 11 loaded same-origin tabs cost 0.93×–1.11× Chrome's private memory in two runs on this machine (see `docs/PERFORMANCE.md`). An earlier figure of ≈ 1.45× was an artefact of the Playwright test harness, which keeps background tabs visible; that is documented there. Two runs on one machine with a simple workload are not a general claim.

## Licence decision

Distributed combined work: **GPL-3.0-or-later**. Reasons: the optional extension module (`electron-chrome-extensions`) is GPL-3.0; GPL-3.0 can include MIT/BSD/Apache-2.0 (Apache-2.0 is GPLv3-compatible) and MPL-2.0 code (Ghostery adblocker — MPL §3.3). Files we author carry SPDX `GPL-3.0-or-later`. The extension package will live in its own optional package so the core's licensing is not forced to depend on it. A full inventory is in `docs/LICENSES.md`. *This is an engineering reading of licence texts, not legal advice.*

## Process model and security boundaries

```
┌──────────────────────────── Main process (privileged, Node) ───────────────────────────┐
│ app lifecycle · TabManager · WorkspaceManager · Store(node:sqlite) · Settings           │
│ Blocker(Ghostery) · PermissionBroker · DownloadManager · CommandIndex · IPC router      │
│        │ validated IPC (sender-frame check, schema check)                              │
├────────┼──────────────────────────────────────────────────────────────────────────────┤
│  Shell renderer      Overlay renderer          Tab renderers (1 per tab, untrusted)     │
│  (sandbox, ctxIso,   (sandbox, ctxIso,         sandbox, ctxIso, no preload,             │
│   file://, strict    transparent, on-top,      nodeIntegration off,                     │
│   CSP, preload API)  palette/menus/prompts)    partition = persist:ws-<workspace>       │
└──────────────────────────────────────────────────────────────────────────────────────┘
  Separate services (planned): Ollama (loopback HTTP) · dnsproxy · embeddings utility process
```

Trust rules:
- Tab renderers have **no** preload and no IPC channel to main. Web content can never call a privileged API.
- Shell/overlay renderers load only bundled `file://` content with a CSP forbidding remote script, and can only invoke whitelisted channels.
- Permissions requested by pages are **denied by default**; granting goes through the PermissionBroker with a user prompt, scoped per workspace + origin.
- Navigation to `file:`, `chrome:`-like internal schemes and dangerous schemes from web content is blocked; `javascript:` is never typed into the navigation path.
- AI features (when added): page text is data, never instructions; any action beyond read needs user approval; no browsing data leaves the device without explicit per-provider consent.

## Interface contracts (initial)

- `TabHost`: `create({workspaceId,url}) → tabId`, `navigate`, `goBack/Forward/reload/stop`, `setBounds`, `setVisible`, `discard`, `serialize`, events `title|url|loading|favicon|audio|crash|permission-request|download`.
- `Store`: `history.add/search`, `bookmarks.add/remove/list/search`, `downloads.*`, `settings.get/set`, `session.save/load` (all synchronous, parameterised SQL only).
- `Blocker`: `enable(session)`, `stats(tabId)`, `allowlist(origin)`.
- `PermissionBroker`: `request({workspaceId, origin, permission}) → Promise<'allow'|'deny'>`, persisted decisions.

## Revisit triggers

*(Added 2026-10-12 after the wider sweep — see [CATALOG.md](../research/CATALOG.md).)*
- **DRM/Widevine becomes a requirement** → evaluate castlabs *Electron for Content Security* (`castlabs/electron-releases`, MIT, active; used by Flow Browser). Caveats verified from its README: builds are VMP-signed for *development* servers only; production streaming needs castlabs' paid EVS signing service, and ECS releases lag stock Electron (v44.1.0 vs our 44.7.0).
- **Extension compatibility becomes the top priority** → either the optional `electron-chrome-extensions` module (GPL-3.0; already used in practice by Flow Browser) or the Chromium-fork track (**Helium** = ungoogled-chromium + packaging, GPL-3.0, beta, is the nearest prior art; **BrowserOS** shows an agentic fork, AGPL-3.0).
- **Servo** now publishes an embeddable `servo` crate (0.7.0, 2026-10-05) while the Servo-in-Tauri bridge **Verso is archived** (`versotile-org/verso`, last push 2025-10-08): a native Servo host would have to be built on the crate directly.
- **Electrobun** (MIT, Bun + system webview with optional bundled CEF) is a possible alternative shell behind `TabHost`; not evaluated for Windows maturity.

- Ladybird publishes a Windows alpha, or Servo drops "tech demo" → prototype a second `TabHost`.
- Electron MV3 / extension API work lands (tracking `electron/electron#44411`) → promote the Extensions module.
- Measured baseline shows idle memory per tab materially worse than Chrome/Edge on the same machine → investigate sleeping-tab policy / CEF.
