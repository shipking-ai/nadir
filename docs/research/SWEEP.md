# Discovery sweep — how the catalog was built, and what it does not cover

**Requested:** "Research everywhere to make sure there's no other open-source things related to browsers, we're supposed to have every possible one (if possible)."

**Honest answer up front:** "every possible one" cannot be achieved or proven. There is no registry of open-source browser projects, and GitHub hosts tens of thousands of repos that mention browsers (the single topic `browser` has 11,293 repositories, mostly extensions and unrelated tools). What this sweep delivers instead is a **reproducible, multi-source search with documented coverage and documented blind spots**. [CATALOG.md](CATALOG.md) lists **772 verified and classified projects**. Treat it as a very wide net, not a census.

Date of all data: 2026-10-11/12. Tools: `gh` (authenticated GitHub CLI), the npm registry search API, the crates.io API, `node` scripts in `scripts/`.

## Pipeline

| Step | What | Script / file | Output |
|---|---|---|---|
| 1 | **Seed list**: projects I knew of or found in earlier research, grouped into 20 categories. Every entry checked with `gh api repos/<owner>/<repo>` (existence, archived flag, last push, SPDX licence, stars). Renames are followed. | `scripts/verify-repos.js`, `seed-repos.txt` | `seed-repos-verified.tsv` — 539 entries: 417 ok, 33 archived, **89 not found** |
| 2 | **Topic and keyword sweep**: 231 GitHub topic searches and 94 keyword searches (browser engines, forks of Chromium/Firefox/WebKit, Electron/Tauri shells, privacy, ad blocking, tab management, automation, devtools, protocols such as Gemini/Gopher/IPFS, accessibility, translation, on-device AI, ...), plus 46 npm and 22 crates.io searches. | `scripts/discover.js` | `discovery-2026-10-12.tsv` — **8,987 unique candidates** (6,693 GitHub, 1,591 npm, 703 crates.io) |
| 3 | **Retry** of the 18 npm queries that were rate-limited (the registry returned HTML) | `scripts/discover-retry-npm.js` | `discovery-npm-retry.tsv` — 1,057 rows, 0 queries still failing |
| 4 | **Triage**: remove what is already known, score the rest by whether the description says it *is* a browser/engine, then review the high-scoring and name-matched pools by hand | `scripts/triage-discovery.js` | `discovery-novel-scored.tsv` (8,767 novel candidates, scored) |
| 5 | **Curated-list cross-check**: every GitHub link in two community lists ([nerdyslacker/desktop-web-browsers](https://github.com/nerdyslacker/desktop-web-browsers), [dhamaniasad/HeadlessBrowsers](https://github.com/dhamaniasad/HeadlessBrowsers)) compared with my data; the 86 I lacked were verified by API | `crosscheck-lists.txt` | `crosscheck-lists-verified.tsv` — 69 ok, 14 archived, 3 not found |
| 6 | **Second attempt at the "not found" names** with corrected owner/repo spellings | `resolve-notfound.txt` | `resolve-notfound-verified.tsv` — 29 of 30 resolved |
| 7 | **On-topic completeness check**: for 12 highly on-target topics (`web-browser`, `browser-engine`, `privacy-browser`, `gecko`, `tor-browser`, `android-browser`, `chromium-based`, `firefox-fork`, `electron-browser`, `minimal-browser`, `lightweight-browser`, `qt-webengine`) take **all** results with **no star floor**, and list those not yet classified | `topic-check-2026-10-12.tsv` | 1,529 unclassified repos listed; the 123 with ≥ 25 stars were reviewed by hand |
| 8 | **Classification and catalog**: class + one-line note per project, metadata always from the API data above | `scripts/catalog-classification.js` (seed), `scripts/catalog-additions.js` (everything found later), `scripts/build-catalog.js` | `CATALOG.md` |

Re-run everything with: `node scripts/discover.js`, `node scripts/triage-discovery.js`, `node scripts/build-catalog.js`.

## What the sweep found that the seed list lacked

The seed list was built from memory plus the earlier research, and the sweep shows its limits. **322 of the 772 catalog rows came from steps 2–7**, including real projects I had either missed or mis-spelled:

* From-scratch / alternative engines: **Gosub**, **Fen** (FENBROWSER/fenbrowser), **Starling** (.NET), **Hastur**, a Rust engine by lucid-softworks, **Orinium**, **Retsurf** (Servo + SDL2), **Zervo** (workspace-oriented browser on Servo).
* Browsers with ideas close to Pelorus's: **Glide** (keyboard-first, Gecko), **Yalqen** (vertical tabs + command bar), **kovidgoyal/vise** (tree tabs), **Nyxt** (programmable), **DuckDuckGo's Apple browsers**, **Agregore** and **Peersky** (alt-protocol).
* Tooling Pelorus should adopt: **badssl.com** (TLS error test site), **WebKit Speedometer / JetStream / MotionMark** (benchmarks), **ClearURLs** rules.
* Mobile: **WebLibre**, **Reynard** (Gecko on iOS), **Nira**, **Candy**, **Omni**, **Bare** and others (separate investigation).
* 29 of 30 corrected spellings of names I had guessed wrongly resolved to real, verified repos (for example `versotile-org/verso`, `atlas-engineer/nyxt`, `fanglingsu/vimb`, `Igalia/cog`, `ggml-org/whisper.cpp`, `mattsse/chromiumoxide`).

## Classification summary

| Class | Count |
|---|---|
| Core (shipped in Pelorus) | 9 |
| High-value | 22 |
| Optional | 78 |
| Experimental | 16 |
| Reference | 313 |
| Rejected | 208 |
| Out-of-scope | 126 |

(The exact current numbers are at the top of CATALOG.md; this table is a snapshot and the generator is authoritative.)

### Policy decisions made while classifying
* **Anti-detect / stealth browsers** (about 25 projects whose purpose is to defeat bot detection or spoof fingerprints for scraping or multi-accounting) are catalogued once, as **Rejected**, so nobody re-discovers them and wonders. Pelorus will not integrate detection evasion. Fingerprint *uniformity* (Mullvad-style) and fingerprint *test oracles* are a different matter and remain on the roadmap.
* **Credential-stealing and DRM-circumvention tools** (browser password dumpers, Widevine key extractors) turned up in the sweep. They are **not catalogued**.
* **AGPL / "other" / no-licence** projects are marked in the notes. Nothing is reusable until its licence has been read; see [LICENSES.md](../LICENSES.md).
* A lookalike **uBlock-LLC/uBlock** appeared with 8k stars and was explicitly marked as *not* the upstream uBlock Origin and stale since 2022.

## Coverage and blind spots — read this before claiming completeness

1. **Star floor in step 2.** The 325 GitHub queries only kept repositories with **≥ 150 stars**, and only the top 100 per query by stars. The long tail of small hobby browsers was therefore *not* swept by step 2. Step 7 partially compensates for 12 on-point topics with no floor, but those results are capped by GitHub at 1,000 per query (the `web-browser` topic has 1,159 repos; I fetched the 1,000 plus a second query for the tail).
2. **Not individually reviewed.** Of the 8,767 novel candidates in step 4, I reviewed (a) every candidate scoring ≥ 3, (b) two keyword/name-filtered pools of lower-scoring ones, and (c) the 123 on-topic repos with ≥ 25 stars. The roughly 5,000 candidates that scored 0 on both description and topic signals, and the 1,406 on-topic repos below 25 stars, were **not read one by one**. A relevant project whose description does not contain the usual words can be sitting in there. All of them are in the TSV files for anyone to filter further.
3. **Descriptions, not code.** Classes and notes come from each project's one-line GitHub description, its activity, and licence, plus README knowledge for well-known projects. For most newly found small projects I did not read the code or run them; notes say "per its description" where a claim is the project's own.
4. **GitHub-centric.** GitLab, Codeberg, SourceHut, self-hosted forges and project sites are not searched systematically. Pale Moon, NetSurf, LibreWolf, Dooble, Tor Browser/Arti, suckless surf and Verso are known to be hosted elsewhere (confirmed from their own sites earlier in the research, see [LEDGER.md](LEDGER.md)) and are listed separately at the bottom of CATALOG.md. There are surely others.
5. **Non-English ecosystems.** Queries were English; a few Chinese/Japanese/Russian projects surfaced by accident (for example Turbo Browser, Orinium, Chromium-Gost), so there are likely more.
6. **Registries.** npm and crates.io searches returned libraries (automation, `psl`, bookmark parsers, Electron PDF helpers) and a few small Electron browsers; none changed a decision. PyPI, Maven, NuGet, Go modules, Homebrew, Flathub, F-Droid and Linux distribution package lists were **not** searched.
7. **Wikipedia's list of web browsers and distribution package lists** (Debian, Arch, Nix) were not systematically enumerated; the two community lists in step 5 are the only curated lists I cross-checked.
8. **Activity is a snapshot.** "Active", "slow" and "stale" are computed from the last push date as of 2026-10-12.
9. **Stars are only a liveness signal**, never used as a quality judgement. Several highly starred results were unrelated.

## What would raise coverage further (not done)
* Re-run step 2 with `--stars=10..149` sliced into narrow bands (each band under 1,000 results) for the 30 most on-target topics.
* Add Codeberg/GitLab/SourceHut search, Flathub and F-Droid category dumps, Debian `web-browser` virtual-package providers, and AlternativeTo's open-source browser list.
* Read the README of every Experimental candidate (16 projects) and run the ones that build on Windows.

## Reproducibility notes
* The first sweep had 18 npm failures (rate limiting returned HTML); they were retried at slower speed with no failures.
* `gh search repos` returns at most 1,000 results; queries that hit this limit are noted above.
* Data files keep the raw GitHub values (SPDX ids as lower-case keys in search results, `NOASSERTION` where GitHub could not identify a licence).
