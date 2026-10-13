# Licences and distribution notes

*An engineering reading of licence texts, not legal advice. Have counsel review before distributing binaries.*

Full machine-generated list of npm packages: [LICENSE-INVENTORY.md](LICENSE-INVENTORY.md) (`node scripts/license-inventory.js`).

## Nadir's own code

**GPL-3.0-or-later** (SPDX header in source files; `package.json` `license` field).

The repository root contains `LICENSE`, the canonical GPL-3.0 text downloaded from <https://www.gnu.org/licenses/gpl-3.0.txt> on 2026-10-12 (35,149 bytes, SHA-256 `3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986`). The root `LICENSE` of a packaged build is **Electron's** MIT licence; Nadir's GPL text is shipped as `resources/LICENSE` (packager `--extra-resource`), and `LICENSES.chromium.html` sits next to the executable.

## Categories of what ships in a Nadir build

| Component | Licence | Type | Obligation / note |
|---|---|---|---|
| Nadir source | GPL-3.0-or-later | strong copyleft | Distributed binaries must offer corresponding source under GPL-3.0 |
| **Electron** (runtime binary) | MIT | permissive | Keep the notice. Electron's distribution includes `LICENSE` and `LICENSES.chromium.html` — **both must ship with Nadir builds** (the packager copies them; verify in the output folder) |
| **Chromium** and its third-party code (inside Electron) | BSD-3-Clause + many (LGPL FFmpeg, MPL, Apache, OpenSSL-style, …) | mixed | Covered by `LICENSES.chromium.html`; FFmpeg (LGPL) is dynamically linked as a separate library in Electron's build |
| **@ghostery/adblocker** family + `@remusao/*` (12 packages) | MPL-2.0 | weak (file-level) copyleft | Modified MPL files must stay MPL and be offered as source. MPL-2.0 §3.3 allows combination with GPL-3.0 (secondary-license clause); we do not modify these files |
| `tldts-experimental` and other transitive npm packages | MIT / Apache-2.0 / BSD (see inventory) | permissive | Keep notices |
| Filter lists (EasyList, uBlock filters, Ghostery lists, …) | mostly GPL-3.0 / CC-BY-SA-3.0 | **data downloaded at runtime**, not bundled | Fetched from Ghostery's CDN by the user's copy of Nadir; not redistributed in our repo or installer. If lists are ever **bundled**, their individual licences (CC-BY-SA attribution/share-alike) apply — review first |
| Fonts | none bundled (system fonts only) | — | — |
| Icons | original strokes in `src/ui/assets/icons.js` | GPL-3.0-or-later (ours) | — |
| `node:sqlite` / SQLite | public domain (SQLite) | — | — |

## Components evaluated and **not** included

| Component | Licence | Why it matters |
|---|---|---|
| `electron-chrome-extensions` | GPL-3.0 (+ separate commercial licence) | Compatible with our GPL but would tie the project to it; also optional commercial licence needed for any non-GPL fork. Not included |
| uBlock Origin, Privacy Badger, Ghostery extension | GPL-3.0 | Could run as extensions if an extension host is added; not bundled |
| DuckDuckGo Tracker Radar data | data licence marked non-commercial in my recollection (**unverified**) | Do not ship until reviewed |
| AdGuard Home / SearXNG / Vaultwarden | GPL-3.0 / AGPL-3.0 | Network services; integrating by URL only would not make Nadir a derivative work; embedding code would |
| Meilisearch | MIT + source-available parts (**unverified**) | Rejected |
| WebView2 runtime | proprietary redistributable | Rejected for the core |
| Widevine CDM | proprietary | Not shipped; DRM streaming unavailable |

## Practical checklist before a public release

1. ~~Add the GPL-3.0 `LICENSE` text.~~ Done 2026-10-12.
2. Ship Electron's `LICENSE` and `LICENSES.chromium.html` next to the executable; add an in-app "Open-source licences" page.
3. Offer corresponding source (repository link in About).
4. Re-run `scripts/license-inventory.js` on every dependency change; fail CI on `UNKNOWN`/`UNLICENSED`.
5. Trademark: a **preliminary, non-legal** check on 2026-10-12 (web search, `gh search repos`, npm) found no browser called Nadir. Other uses exist: a French window-ventilation app "NADIR", the German site nadir.org, an unrelated npm package `nadir`, and small GitHub repos. The USPTO/EUIPO/WIPO databases were **not** searched directly, so this is not clearance. Do that (class 9 and 42) or ask a trademark attorney before a public launch.
6. Review filter-list licences if lists are ever bundled.
