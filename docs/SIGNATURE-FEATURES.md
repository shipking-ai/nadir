# Signature Features — analysis and prioritisation

Status key: **Built** = in the app and covered by tests · **Partial** · **Planned** · **Rejected**.
Resource costs are *estimates from design*, not measurements, unless marked *(measured)*.

| # | Feature | Status | Why it's valuable | Implementation approach | Dependencies | Resource cost | Security implications | Limitations |
|---|---|---|---|---|---|---|---|---|
| 1 | **Universal command center** (tabs, history, bookmarks, workspaces, commands) | **Built** | One keyboard entry to everything; replaces menus | Overlay view + `rank()` over local sources; FTS5 for history | none (own code) | negligible; query p50 *(measured, see PERFORMANCE.md)* | Reads local data only; results rendered via `textContent` | Downloads and page *actions* (e.g. "mute site") are not indexed yet |
| 2 | **Workspaces with complete research context** | **Built** (isolation, tabs, history, permissions) · **Partial** (notes/annotations not built) | Separate logins and trackers' view per project; delete a workspace to delete its data | One Chromium partition per workspace; per-workspace history/permissions rows | Electron sessions | Extra renderer processes only for loaded tabs; sleeping tabs free theirs | Strong storage isolation (cookies/cache/IndexedDB); not a defence against fingerprinting or IP correlation | Tab groups, snapshots, "restore this workspace as of date" not built |
| 3 | Multiple search providers | **Built** (DuckDuckGo, Brave, Startpage, Google, custom/SearXNG) | User choice; self-hosted metasearch | Template URL with `%s`; validated (https or localhost) | none | none | Custom URL validated; no keystrokes sent to providers (suggestions are local) | No per-keyword engines (`!g`-style) yet |
| 4 | **Transparent privacy reporting** | **Built** | Shows what was blocked, where, and what the limits are | `webRequest` counters per tab, aggregated per host per day in SQLite | Ghostery engine | one DB upsert per host per 5 s | Stats are local; can be wiped with Clear browsing data | Counts only network blocks Nadir sees; says nothing about fingerprinting |
| 5 | Advanced tracker blocking | **Built** (network + cosmetic filters; HTTPS-first; tracking params; GPC) | Core privacy value | `@ghostery/adblocker` engine, serialised cache on disk | MPL-2.0 lib; Ghostery CDN for lists | engine memory *(measured)* | Filter-list supply chain trust (Ghostery CDN) — pinned lib, no list auth beyond HTTPS | No fingerprinting protection (canvas/WebGL/font) — **not implemented**; no per-site allow-list UI yet |
| 6 | Split-screen browsing | **Built** (two panes) | Compare / reference while writing | Two `WebContentsView`s with computed bounds | none | one extra loaded tab | none new | No synchronised scrolling, no resize handle, 2 panes max |
| 7 | Sleeping tabs | **Built** | Memory | Destroy renderer, keep URL/title; lazy restore | none | frees renderer memory *(measured)* | none | Loses scroll/form state; no per-site exclusions yet |
| 8 | Searchable history with **local semantic indexing** | **Partial** (FTS5 keyword/prefix built; semantic **Planned**) | Find pages by meaning | Embeddings in a utility process with Transformers.js (Apache-2.0) → vectors in SQLite; brute-force cosine is enough at personal scale (sqlite-vec is pre-1.0) | `@huggingface/transformers`, a ~25–90 MB model download | CPU burst per page; ~1.5 KB/page vector | Page text stays on device; model download is the only network use | Not started. Needs a content-extraction step (Readability) and opt-in per workspace |
| 9 | **AI-assisted research with citations** | **Planned** | Multi-page synthesis with traceable evidence | Readability → chunks with source URL + offset → local LLM via Ollama (loopback HTTP) or opt-in cloud provider; answers must cite chunk ids, UI links each claim to the exact passage | Ollama (MIT) or provider API | GPU/CPU heavy (user's model choice) | **Prompt injection** from pages: page text is data in a delimited block, tools are read-only by default, any navigation/form/download needs a click, outputs that cite nothing are flagged; explicit per-provider consent before any text leaves the device | Local model quality varies; citations prove *where* text came from, not that a claim is true |
| 10 | Natural-language tab organisation | **Planned** | "Group my research tabs" | Same LLM path, restricted to tab titles/URLs (no page bodies) → proposed groups the user confirms | as #9 | small | Titles/URLs can still leak; same consent as #9 | Needs tab groups first |
| 11 | Contextual sidebars that adapt to the site | **Planned** | Reader view for articles, table-of-contents, video chapters | Per-site "module" = sandboxed internal page + declared permissions; content via `Readability` | Mozilla Readability (Apache-2.0) | low | Modules get **no** raw page DOM access, only extracted text via a narrow API | Module API not designed yet |
| 12 | Per-site permissions and isolated environments | **Built** | Least privilege | `PermissionBroker` + partitions | none | none | see SECURITY.md T7 | No site-settings page per origin (only a list in Privacy) |
| 13 | User-authorised automation | **Planned** | Repeatable workflows | Expose a **local, off-by-default** automation endpoint speaking the accessibility tree; each workflow declares allowed origins/actions and runs behind an approval banner | Playwright (Apache-2.0) as the client library; browser-use as design reference | low | Largest abuse surface in the list; requires per-workflow consent, origin allow-list, visible "automation active" indicator, kill switch | Not started |
| 14 | Developer / researcher / creator / power-user modes | **Planned** | Tailored defaults | Bundles of settings + palette commands, not forks | none | none | none | Needs user research; a mode switch with 3 clear behaviours would beat 4 vague ones |
| 15 | Importable community extensions / modules | **Rejected for M1** | — | Chrome-extension compatibility is **partial** in Electron and the helper library is GPL-3.0; a native "module" API (see #11) is safer and clearer | — | — | — | Revisit when Electron's extension work matures |
| 16 | Encrypted sync | **Planned** | Multi-device | Export an encrypted bundle (libsodium `secretstream`) of bookmarks/settings/tabs to a folder the user syncs (Syncthing/any), key derived from a passphrase (Argon2id) | libsodium | tiny | Server-less by design → no account, no metadata server | Conflict resolution; history sync deliberately excluded |
| 17 | Reader mode / annotations / screenshots / translation | **Planned** | Productivity | Readability for reader; `capturePage` for screenshots; local translation models (Bergamot) | Readability, Bergamot (MPL-2.0) | model downloads | translation models run locally | none started |
| 18 | Download manager with analysis | **Built** (risk classification by name, never launches executables) · analysis of file *content* **Planned** | Safer downloads | see ARCHITECTURE §4 | none | none | Name-based heuristics only — cannot detect a renamed or malicious PDF | No hash/VirusTotal lookups (would send file hashes to a third party; opt-in only if ever added) |

## Prior art found in the 2026-10-12 sweep (for the planned items)

| Planned item | Open-source prior art (verified) | What to take from it |
|---|---|---|
| AI panel (#9) | **Page Assist** (MIT, active) local-LLM sidebar extension; **Nanobrowser** (Apache-2.0) multi-agent extension; **BrowserOS** (AGPL-3.0) agentic Chromium fork with local models + MCP | UX patterns, Ollama wiring; MIT/Apache code could be reused with attribution; AGPL code cannot be mixed in without adopting AGPL's network clause |
| Agent control / automation (#13) | **playwright-mcp** (Apache-2.0) accessibility-snapshot tools; **browser-use**, **Stagehand**, **BrowserMCP** | Tool schemas that act on the accessibility tree instead of pixels |
| Agent safety evaluation | **WebArena**, **WebVoyager**, **Mind2Web** benchmarks | A ready-made corpus to test that Nadir's approval gates hold |
| Reader / extraction (#11, #8) | **Mozilla Readability** (Apache-2.0), **defuddle** (MIT, active), **trafilatura** (Apache-2.0), **turndown** (HTML→Markdown) | Evaluate defuddle vs Readability on a labelled set; Markdown as the LLM input format |
| Local translation (#17) | **Bergamot** (MPL-2.0, WASM, used by Firefox), **mozilla/translations** (active), **Argos Translate** (MIT) | Fully local translation is demonstrably feasible |
| Encrypted sync (#16) | **Floccus** (MPL-2.0) bookmark sync over WebDAV etc.; **libsodium**; **Syncthing** | Transport-agnostic design, no vendor server |
| Tracking-parameter stripping (built) | **ClearURLs** rules (LGPL-3.0) | Replace our hard-coded parameter list with a maintained rule set |
| Fingerprinting (not built) | **Mullvad Browser** (uniformity), test oracles **FingerprintJS/CreepJS** | Aim for *sameness across users* and measure with oracles; spoofing projects (Camoufox, fingerprint-suite, …) are **rejected** — they exist to evade bot detection |
| Closest whole-product prior art | **Flow Browser** (Electron, GPL-3.0), **Min** (Apache-2.0), **Vieb**, **qutebrowser**, **Nyxt**, **Zen** | Study UX and scope; do not copy code |

## Prioritisation

Ordered by value ÷ risk, with dependencies respected:

1. *(done)* command center, workspaces, blocking, permissions, sleeping tabs, split view, downloads.
2. **Reader mode + extracted-text API** (Readability) — unlocks #8, #9, #10, #11 and is useful alone.
3. **Local semantic search** (#8) — private, offline, immediately useful, no new attack surface beyond a model file.
4. **Tab groups** — prerequisite for #10 and a top user request.
5. **AI research panel** (#9) with local Ollama first, cloud providers behind consent.
6. **Encrypted sync** (#16).
7. **Automation** (#13) last: highest risk, needs the consent UX proven by #9 first.
