# Pelorus — Security & Privacy Model

Pelorus is **not** completely secure or completely private, and nothing in this document claims otherwise. This describes the protections that exist, how each is tested, and the gaps.

## Threat model (what we defend against)

| # | Threat | Defence | Verified by |
|---|---|---|---|
| T1 | A malicious web page calls privileged browser functions | Tab renderers have **no preload and no IPC**; `sandbox`, `contextIsolation`, no Node; `<webview>` banned | e2e: page sees `undefined` for `pelorus`, `require`, `process`, `electron` |
| T2 | A compromised renderer calls IPC channels directly | Main re-validates `event.sender` + `senderFrame === mainFrame` per channel | e2e: 8 privileged channels called with raw `ipcRenderer` all rejected `Forbidden` |
| T3 | A web page navigates a tab into `pelorus://` to gain the internal preload | Page-initiated navigation to `pelorus:`/`javascript:`/`file:` is cancelled; internal↔web navigation swaps the renderer; internal preload self-checks `location.protocol` | e2e: link to `pelorus://app` does not navigate |
| T4 | XSS in Pelorus's own UI via page titles/URLs | All page-derived text set with `textContent`; strict CSP on `pelorus://` (no inline script/style, `connect-src 'none'`) | unit: CSP assertions; code review (no `innerHTML` with page data) |
| T5 | Path traversal in the `pelorus://` file server | Host allowlist + resolved-path containment | unit: 6 encodings tried |
| T6 | Settings/IPC abuse (prototype keys, bad values) | `Object.hasOwn` allowlist, per-key validators (DoH must be `https://`, custom search must be `https://` or localhost and contain `%s`) | unit + e2e |
| T7 | Sites silently using camera/mic/location/etc. | Deny-by-default policy; prompt per *(workspace, origin, permission)*; **cross-origin subframes never prompt**; Block is focused by default; USB/HID/serial/screen-capture denied | unit (policy) + e2e (prompt, remembered, subframe) |
| T8 | Cross-site tracking & ad networks | Ghostery filter engine (network + cosmetic), tracking-parameter stripping, GPC header, per-workspace storage partitions | e2e (blocking with a test list; workspace cookie isolation) |
| T9 | Downgrade to HTTP | HTTPS-first upgrade; on failure an explicit interstitial; **certificate errors have no "proceed anyway"** | e2e (upgrade, fallback page); unit (error page); e2e against badssl.com expired / self-signed / wrong-host / untrusted-root (error page, no bypass control, no script) |
| T10 | Dangerous downloads | Filename sanitisation (traversal, bidi override, reserved names, length); risk classification incl. disguised double extensions; executable/script/shortcut/disk-image never launched | unit + e2e |
| T11 | Typed-URL attacks | `javascript:`, `data:`, `vbscript:`, `blob:`, `view-source:` and unknown schemes are refused | unit + e2e |
| T12 | Private tabs leaking | Memory-only partition, no history, no persisted permissions, excluded from session restore | e2e |
| T13 | SQL injection via history search | Parameterised SQL; FTS input tokenised and quoted | unit (hostile inputs) |

## Static analysis

- **electronegativity 1.10.3** (Electron security linter, run with `-e 44.7.0` on 2026-10-12): 3 medium findings. One was real and fixed — a never-called `openExternal` helper in `controller.js` (dead code wrapping `shell.openExternal`), now deleted. The other two are informational (preload review — preloads are allowlisted and re-validated in main; legacy auxclick check — all `window.open` paths go through `setWindowOpenHandler`). The tool has been unmaintained since 2023, so it is a supplement, not a gate. A first run without the version flag assumed Electron 0.1.0 and produced misleading output; ignore results from that mode.

## Credential storage, sync, AI — status

- **Passwords:** not implemented. Pelorus does not store passwords; use an external manager. *(Planned: OS keychain via Electron `safeStorage`.)*
- **Sync:** not implemented. *(Planned: end-to-end encrypted blob over a user-chosen transport; keys never leave the device.)*
- **AI:** not implemented. Design constraints for when it is added: local-first (Ollama on loopback); any cloud provider is opt-in per provider with an explicit "this page's text will be sent to X" consent; page content is treated as **data, never instructions**; read-only tools by default; any navigation, form submission or download requested by a model needs a user click; allow-listed tool schema; tests with a corpus of injection pages.
- **Telemetry:** none. The only network request Pelorus itself makes is the filter-list download from Ghostery's CDN (no user identifiers sent), which can be disabled by turning blocking off.

## Fuzzing (added 2026-10-13)

`test/unit/fuzz.test.js` generates thousands of hostile strings from a seeded generator and checks invariants for: URL resolution (never throws, never an executable scheme), URL helpers, download file names (single safe path component), the `pelorus://` path resolver (never leaves the UI directory), history search (data, not SQL), permission policy (allow-list only, subframes never prompt) and error-page escaping (no raw markup, only http(s) links). It found and fixed five real bugs (the fifth, an invalid port such as `example.com:99999` producing an unnavigable URL, only showed up at 100,000 iterations): a lone surrogate typed into the address bar threw in `resolveInput`; `upgradeUrl` threw on invalid URLs; `sanitizeFilename` could return a name ending in a dot or space after truncation; the error page rendered a "Try again" link for any URL scheme. This is the project testing itself, **not** an independent review, and covers only those functions. Run longer with `FUZZ_ITERATIONS=100000 npm test`.

## Updates

Pelorus never updates itself and never checks in the background. The About page's button asks `api.github.com` for the public release list (fixed URL, no cookies, redirects refused) and shows the newest version and its release page, which carries checksums and a build-provenance attestation. See [RELEASE.md](RELEASE.md) for why auto-update is not built.

## Known gaps and risks (unresolved)

1. **Chromium patch lag.** Electron 44.7 ships Chromium 152; upstream Chromium builds at ≥155/156 exist today (inferred from ungoogled-chromium/Thorium releases). Electron backports security fixes but we have not measured completeness. *Mitigation:* ship updates on Electron's cadence; show the Chromium version in **About**. This is the largest risk of the Electron approach.
2. **Extensions:** no extension support. Electron's subset is limited and `electron-chrome-extensions` is GPL-3.0; adding it expands the attack surface.
3. **Per-tab favicon fetch:** the shell renders favicon URLs with the default session (no cookies, but the site sees the request from the shell). Planned: proxy through the tab's session as data URLs.
4. **Popups:** `window.open` popups (needed for OAuth) are allowed with sandboxed prefs but are not yet routed through the workspace UI; untested against real OAuth providers.
5. **Local `file:` pages** can be opened by typing `file://…`; they run in a workspace partition like any page.
6. **Builds are unsigned and there is no auto-update** yet. `scripts/sign.ps1` is ready but no certificate exists, so Windows SmartScreen will warn on download. Releases carry a SHA-256 file and a GitHub build-provenance attestation as a substitute check (see [CODE-SIGNING-POLICY.md](CODE-SIGNING-POLICY.md)); an attestation proves where a file was built, not that the code is free of vulnerabilities.
7. **Not audited.** No third-party security audit or fuzzing has been done. Unit/e2e tests are not a substitute.
8. **`node:sqlite`** is a Node built-in whose stability tier is "experimental/release-candidate" depending on version; pinned by Electron's Node (24.21.0). Re-check on Electron upgrades.
9. DNS-over-HTTPS is configured through Chromium's resolver API; we verified the call succeeds but have **not** verified with packet capture that lookups are encrypted.

## Reporting

**Repository:** <https://github.com/shipking-ai/pelorus>

**Report a vulnerability privately:** use GitHub's private vulnerability reporting at
<https://github.com/shipking-ai/pelorus/security/advisories/new>. Only you and the maintainers can see the report. Please do **not** open a public issue, pull request or discussion for a suspected vulnerability.

A useful report contains: the Pelorus version (About page, or `package.json`), the operating system, the steps to reproduce, what you expected and what happened, and the impact you believe it has. A minimal proof of concept helps; please do not include real personal data.

**What to expect, honestly:**
- Pelorus is a pre-release project (0.1.0) with a very small maintainer team. There is **no guaranteed response time** and **no bug bounty**.
- Only the latest commit on `main` is supported; there are no maintained older versions yet and no signed release builds (see [RELEASE.md](RELEASE.md)).
- Reports are triaged, fixed in private where practical, and disclosed in a GitHub security advisory once a fix exists. Reporters are credited if they wish.

**In scope:** Pelorus's own code in this repository (the `pelorus://` pages, IPC boundaries, permission and download handling, URL handling, storage). **Out of scope here, report upstream instead:** vulnerabilities in Chromium, Electron, Node.js or the Ghostery adblocker library. If you are unsure, report it here and we will route it. Pelorus tracks Electron releases to pick up Chromium fixes, and the gap to upstream Chromium is a known risk (see "Known gaps" above).

Testing guidance: please test only against your own installation and profile. Do not test against other people's data or third-party services, and do not run denial-of-service tests.
