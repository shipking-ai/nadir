# Roadmap

Ordering reflects risk and dependency, not dates. "Exit criteria" are what must be demonstrably true (by test or measurement) before the item counts as done.

## 0.1 (this release) — "Foundation"
Done: engine seam, workspaces, vertical tabs, command palette, local suggestions, blocking/HTTPS-first, permissions, downloads, sleeping tabs, split view, session restore, settings, privacy dashboard. See [FEATURE-MATRIX](FEATURE-MATRIX.md).

## 0.2 — "Shippable on Windows"
- ~~Installer~~ done (Squirrel, per user). **Code signing**: pipeline ready, no certificate. **Auto-update**: deliberately not built until signing exists (see RELEASE.md); a user-initiated update check ships instead.
- Packaged-build smoke test in CI; SBOM; `npm audit` gate.
- ~~Verify codec support and DRM absence~~ — **done 2026-10-12** (H.264/AAC/VP9/AV1/Opus/MP3 supported; Widevine absent).
- Verify secure DNS with a packet capture.
- Screen-reader pass (NVDA/Narrator) and axe run on `pelorus://` pages; fix findings.
- Popup/OAuth compatibility test against 3 real providers.
- Exit: install on a clean Windows VM, browse, update, uninstall — scripted.

## 0.2 additions from the 2026-10-12 sweep
- ~~Run **axe-core** (MPL-2.0) against every `pelorus://` page~~ — **done 2026-10-12** (`test/e2e/a11y.test.js`; fixed 3 serious/critical issues in the browser chrome; result in `docs/benchmarks/a11y-axe-latest.json`). Still to do: wire it into CI; run **electronegativity** as a supplementary Electron linter (unmaintained since 2023 — never a gate).
- Replace the hard-coded tracking-parameter list with **ClearURLs** rule data (check data licence).
- Decide on Widevine: evaluate castlabs ECS and the cost of production VMP signing before promising DRM streaming.
- Extend `scripts/bench.js` with **browsertime**/Speedometer and a mixed-origin workload.
- Add **WPT** subsets as the acceptance test if a second engine host is ever prototyped.
- ~~Use **badssl.com** for certificate-error e2e tests~~ — **done 2026-10-12** (`test/e2e/tls.test.js`, 4 bad-certificate hosts + 1 valid). Still to do: use **WebKit Speedometer / JetStream / MotionMark** in `scripts/bench.js`.
- Engines to follow (catalogued as Experimental in the 2026-10-12 sweep, none evaluated beyond their descriptions): **Zervo** (workspace browser on Servo), **Fen**, **Starling**, a Rust engine by lucid-softworks, **Orinium**, **Retsurf**.

## 0.3 — "Read and find"
- Reader mode (Mozilla Readability) + extracted-text API.
- Local semantic history search (Transformers.js in a utility process).
- Tab groups; horizontal-tab layout option; tab drag between workspaces.
- Import from Chrome/Firefox (bookmarks, history) with explicit per-item consent.
- Exit: semantic search quality evaluated on a labelled set of ≥200 queries; p95 latency recorded.

## 0.4 — "Assist" (opt-in)
- AI panel: local Ollama first; cloud providers behind per-provider consent.
- Citations tied to extracted passages; prompt-injection test corpus in CI.
- Exit: injection corpus (≥50 pages) shows no unapproved action; every answer links to source text.

## 0.5 — "Everywhere"
- Linux and macOS builds and CI; per-platform test matrix.
- Encrypted file-based sync.
- Multi-window.

## Later / watch list
- Alternative engine host when **Ladybird** ships a Windows alpha or **Servo** leaves "tech demo".
- Chrome-extension compatibility when Electron's extension work (tracking `electron/electron#44411`) matures — or a Chromium-fork track if extension fidelity becomes the top priority.
- Fingerprinting resistance (not started; large, adversarial, needs its own research).
- Authorised automation endpoint (highest risk; after the AI consent UX is proven).
- Mobile: separate investigation — Android WebView/GeckoView based; no code shared with the desktop shell except `src/shared`.
