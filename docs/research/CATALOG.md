# Catalog of open-source browser-related projects

**Generated** by `node scripts/build-catalog.js` · data pulled **2026-10-11/12** · sources and method: [SWEEP.md](SWEEP.md).
Every row below was **verified against the GitHub API** (existence, archived flag, last push, licence). 322 rows came from the discovery sweep / curated-list cross-check rather than my original seed list. "Activity": *active* = pushed ≤ 120 days ago, *slow* ≤ 1 year, *stale* > 1 year. Stars are a liveness signal only. The **class** and **note** columns are my judgement from the project's README/status, not measurements.

Classes: **Core** shipped in Pelorus · **High-value** worth integrating next · **Optional** useful later/for a scenario · **Experimental** promising, unproven for us · **Reference** study/borrow ideas · **Rejected** unsuitable (abandoned, redundant, purpose or licence conflict) · **Out-of-scope** different product category.

| Class | Count |
|---|---|
| Core | 9 |
| High-value | 22 |
| Optional | 78 |
| Experimental | 16 |
| Reference | 313 |
| Rejected | 208 |
| Out-of-scope | 126 |
| **Total verified & classified** | **772** |


## Browser engines & from-scratch browsers

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio) | 30.5k | MIT | 2026-10-10 | active | **Optional** | Server-side DOM for tests/extraction in Node. |
| [jsdom/jsdom](https://github.com/jsdom/jsdom) | 21.7k | MIT | 2026-10-07 | active | **Optional** | Needed to run Mozilla Readability in Node (main process). |
| [parcel-bundler/lightningcss](https://github.com/parcel-bundler/lightningcss) | 7.7k | MPL-2.0 | 2026-10-08 | active | **Optional** | Fast CSS parser/transformer (MPL-2.0). |
| [capricorn86/happy-dom](https://github.com/capricorn86/happy-dom) | 4.7k | MIT | 2026-10-12 | active | **Optional** | Faster DOM implementation for tests/extraction. |
| [servo/html5ever](https://github.com/servo/html5ever) | 2.6k | NOASSERTION | 2026-10-05 | active | **Optional** | Spec-compliant HTML parser (Rust). Candidate for a Rust-side extraction service; Readability in JS suffices today. |
| [LadybirdBrowser/ladybird](https://github.com/LadybirdBrowser/ladybird) | 66.5k | BSD-2-Clause | 2026-10-11 | active | **Experimental** | Independent engine, BSD-2. Alpha targeted for Linux/macOS in 2026; no native Windows build. Watch. |
| [servo/servo](https://github.com/servo/servo) | 38.1k | MPL-2.0 | 2026-10-12 | active | **Experimental** | Embeddable via the `servo` crate (0.7.0, 2026-10-05); MPL-2.0. Not a daily-driver engine yet. Revisit trigger in ADR-0001. |
| [h4ckf0r0day/obscura](https://github.com/h4ckf0r0day/obscura) | 28.8k | Apache-2.0 | 2026-10-10 | active | **Experimental** | Rust headless engine with V8 + CDP (Apache-2.0), very popular. README performance claims are vendor claims, unverified here. Candidate backend for a future automation/agent mode; built-in stealth features need careful policy review. |
| [DioxusLabs/blitz](https://github.com/DioxusLabs/blitz) | 4.3k | Apache-2.0 | 2026-10-11 | active | **Experimental** | Modular HTML/CSS renderer in Rust (no JS engine by design), beta; renders many no-JS sites. Possible future lightweight reader/preview surface. |
| [lucid-softworks/browser](https://github.com/lucid-softworks/browser) | 129 | mit | 2026-09-07 | active | **Experimental** | Platform-agnostic Rust engine written from scratch (MIT, active), per description |
| [mxmgorin/retsurf](https://github.com/mxmgorin/retsurf) | 63 | gpl-3.0 | 2026-10-11 | active | **Experimental** | Servo + SDL2 browser for gamepad/keyboard control (GPL-3.0, active) |
| [starling-browser/starling](https://github.com/starling-browser/starling) | 62 | apache-2.0 | 2026-07-07 | active | **Experimental** | Managed-first .NET browser engine built from primitives (Apache-2.0, active); the real home of "Starling" |
| [FENBROWSER/fenbrowser](https://github.com/FENBROWSER/fenbrowser) | 41 | mit | 2026-10-04 | active | **Experimental** | Independent browser engine "focused on correctness" (MIT, active); the real home of the "Fen" name I could not find earlier. Not evaluated beyond its description |
| [goddv/Zervo](https://github.com/goddv/Zervo) | 38 | MPL-2.0 | 2026-08-23 | active | **Experimental** | Workspace-oriented browser on the Servo engine (MPL-2.0, active); the same idea as Pelorus workspaces on a different engine - worth following |
| [orinium-browser/orinium](https://github.com/orinium-browser/orinium) | 27 | apache-2.0 | 2026-10-12 | active | **Experimental** | Japanese-language from-scratch engine (Apache-2.0, active) |
| [SerenityOS/serenity](https://github.com/SerenityOS/serenity) | 33.9k | BSD-2-Clause | 2026-10-08 | active | **Reference** | OS project where LibWeb/LibJS originated. |
| [google/skia](https://github.com/google/skia) | 11.0k | BSD-3-Clause | 2026-10-11 | active | **Reference** | 2D graphics library inside Chromium; not used directly. |
| [weolar/miniblink49](https://github.com/weolar/miniblink49) | 7.8k | apache-2.0 | 2026-05-12 | slow | **Reference** | Blink-derived embeddable kernel for app UIs; how its Blink base tracks current Chromium security fixes is unverified, so not suitable as a default engine |
| [versotile-org/verso](https://github.com/versotile-org/verso) | 5.4k | Apache-2.0 | 2025-10-08 | archived | **Reference** | Servo-based browser; GitHub copy is an archived mirror of the GitLab project (gitlab.com/verso-browser/verso). Superseded in spirit by goddv/Zervo and Servo itself |
| [linebender/vello](https://github.com/linebender/vello) | 4.4k | Apache-2.0 | 2026-10-11 | active | **Reference** | GPU 2D renderer (Rust). |
| [gosub-io/gosub-engine](https://github.com/gosub-io/gosub-engine) | 3.7k | mit | 2026-10-11 | active | **Reference** | Rust, from-scratch engine (per description); active. Watch-list item next to Ladybird/Servo for a future engine host |
| [DioxusLabs/taffy](https://github.com/DioxusLabs/taffy) | 3.6k | MIT | 2026-10-11 | active | **Reference** | Rust layout library (flex/grid), MIT. Used by Blitz. |
| [servo/webrender](https://github.com/servo/webrender) | 3.4k | MPL-2.0 | 2026-10-11 | active | **Reference** | GPU renderer crate (also used by Firefox). Native-engine path only. |
| [litehtml/litehtml](https://github.com/litehtml/litehtml) | 2.5k | BSD-3-Clause | 2026-10-11 | active | **Reference** | Small embeddable HTML/CSS renderer (no JS). |
| [lexbor/lexbor](https://github.com/lexbor/lexbor) | 2.1k | Apache-2.0 | 2026-09-28 | active | **Reference** | Fast C HTML/CSS parsing library. |
| [cloudflare/lol-html](https://github.com/cloudflare/lol-html) | 2.1k | BSD-3-Clause | 2026-07-29 | active | **Reference** | Streaming HTML rewriter. |
| [twilco/kosmonaut](https://github.com/twilco/kosmonaut) | 1.7k | MPL-2.0 | 2025-11-24 | slow | **Reference** | Rust toy engine; slow activity. |
| [dillo-browser/dillo](https://github.com/dillo-browser/dillo) | 1.2k | GPL-3.0 | 2026-04-19 | slow | **Reference** | Ultra-light C browser (GPL-3.0). |
| [danfragoso/thdwb](https://github.com/danfragoso/thdwb) | 1.1k | MIT | 2023-03-07 | stale | **Reference** | Go from-scratch browser; stale since 2023. |
| [servo/rust-cssparser](https://github.com/servo/rust-cssparser) | 874 | MPL-2.0 | 2026-10-08 | active | **Reference** | CSS tokenizer/parser crate. |
| [linebender/parley](https://github.com/linebender/parley) | 753 | Apache-2.0 | 2026-10-09 | active | **Reference** | Text layout (Rust). |
| [ZeroX-DG/moon](https://github.com/ZeroX-DG/moon) | 435 | MIT | 2026-05-31 | slow | **Reference** | Hobby from-scratch browser (learning). |
| [servo/stylo](https://github.com/servo/stylo) | 340 | — | 2026-10-11 | active | **Reference** | Servo/Firefox CSS engine as a crate. Only relevant to a native-engine path. |
| [mplsllc/macsurf](https://github.com/mplsllc/macsurf) | 281 | other | 2026-10-08 | active | **Reference** | Browser for Classic Mac OS 9 (per description); curiosity, shows how small a CSS3/ES5/HTTPS browser can be |
| [OkuBrowser/oku](https://github.com/OkuBrowser/oku) | 211 | — | 2026-10-05 | active | **Reference** | Rust browser project; description is only "Browse & express yourself" and no licence is declared, so nothing beyond its existence is claimed |
| [nordstjernen-web/nordstjernen-browser](https://github.com/nordstjernen-web/nordstjernen-browser) | 182 | other | 2026-10-11 | active | **Reference** | New from-scratch browser; licence is "GPL 3+ or NSL" per its description and the NSL terms were not reviewed. Do not reuse code before reading them |
| [konippi/servo-fetch](https://github.com/konippi/servo-fetch) | 157 | apache-2.0 | 2026-10-10 | active | **Reference** | Servo used as a fetch/render/extract-to-Markdown tool; a data point for embedding Servo headless |
| [LoboEvolution/LoboEvolution](https://github.com/LoboEvolution/LoboEvolution) | 96 | MIT | 2026-10-11 | active | **Reference** | Java browser (MIT, active): pure-Java renderer approach, tiny user base |
| [MQuy/mbrowser](https://github.com/MQuy/mbrowser) | 47 | MIT | 2021-12-27 | stale | **Reference** | Toy browser; stale since 2021. |
| [sujaldev/skylon](https://github.com/sujaldev/skylon) | 47 | mit | 2023-02-05 | stale | **Reference** | Toy browser in Python; learning resource |
| [robinlinden/hastur](https://github.com/robinlinden/hastur) | 36 | bsd-2-clause | 2026-10-12 | active | **Reference** | From-scratch C++ browser by one author (BSD-2-Clause, active); the real home of "Hastur". Educational scale |
| [mjakeman/libweb-gtk](https://github.com/mjakeman/libweb-gtk) | 32 | bsd-2-clause | 2023-07-12 | stale | **Reference** | Proof-of-concept GTK wrapper for Ladybird LibWeb (2023); shows the embedding path |
| [KaykCaputo/hermes-browser](https://github.com/KaykCaputo/hermes-browser) | 28 | mpl-2.0 | 2026-08-05 | active | **Reference** | Rust desktop browser (MPL-2.0, active) |
| [keiya01/kamaitachi](https://github.com/keiya01/kamaitachi) | 27 | — | 2021-06-16 | stale | **Reference** | Toy browser engine; learning resource only |
| [gantonious/browser](https://github.com/gantonious/browser) | 14 | — | 2023-09-20 | stale | **Reference** | Kotlin from-scratch browser; stale. |
| [quittle/wowser](https://github.com/quittle/wowser) | 12 | — | 2024-03-01 | stale | **Reference** | Tiny from-scratch browser; stale. |
| [browserhtml/browserhtml](https://github.com/browserhtml/browserhtml) | 2.6k | other | 2018-07-27 | archived | **Rejected** | Experimental Servo UI in HTML; no pushes since 2018 |
| [maekawatoshiki/naglfar](https://github.com/maekawatoshiki/naglfar) | 592 | MIT | 2022-12-24 | archived | **Rejected** | Archived toy engine. |
| [chrisdone-archive/vado](https://github.com/chrisdone-archive/vado) | 279 | bsd-3-clause | 2019-04-27 | archived | **Rejected** | Archived Haskell demo engine |
| [paulrouget/servoshell](https://github.com/paulrouget/servoshell) | 277 | mpl-2.0 | 2018-01-08 | archived | **Rejected** | Archived Servo shell (2018); upstream servo/servo carries its own shell now |
| [sentialx/WebExpress](https://github.com/sentialx/WebExpress) | 81 | — | 2018-01-21 | archived | **Rejected** | Archived WPF browser (2018) |
| [WebicityBrowser/Webicity](https://github.com/WebicityBrowser/Webicity) | 45 | mit | 2025-02-06 | archived | **Rejected** | Archived .NET engine |
| [servo/rust-selectors](https://github.com/servo/rust-selectors) | 40 | — | 2024-05-28 | archived | **Rejected** | Archived 2024. |
| [ayazhafiz/sherpa_41](https://github.com/ayazhafiz/sherpa_41) | 35 | mit | 2020-02-15 | archived | **Rejected** | Archived toy engine |
| [DioxusLabs/dioxus](https://github.com/DioxusLabs/dioxus) | 39.4k | Apache-2.0 | 2026-10-09 | active | **Out-of-scope** | Rust UI framework. |
| [AngleSharp/AngleSharp](https://github.com/AngleSharp/AngleSharp) | 5.5k | MIT | 2026-10-09 | active | **Out-of-scope** | .NET parser. |
| [LadybirdBrowser/ancient-history](https://github.com/LadybirdBrowser/ancient-history) | 1.6k | bsd-2-clause | 2022-12-25 | archived | **Out-of-scope** | Archived history repo of Ladybird; the live project is LadybirdBrowser/ladybird |
| [html5lib/html5lib-python](https://github.com/html5lib/html5lib-python) | 1.2k | MIT | 2026-04-21 | slow | **Out-of-scope** | Python parser. |
| [therealglazou/bluegriffon](https://github.com/therealglazou/bluegriffon) | 357 | mpl-2.0 | 2021-02-05 | stale | **Out-of-scope** | Gecko-based web editor, last push 2021 |
| [radkovo/CSSBox](https://github.com/radkovo/CSSBox) | 257 | lgpl-3.0 | 2026-03-21 | slow | **Out-of-scope** | Pure-Java (X)HTML/CSS renderer library; not a browser |
| [LayoutFarm/HtmlRenderer](https://github.com/LayoutFarm/HtmlRenderer) | 197 | other | 2022-06-22 | stale | **Out-of-scope** | C# HTML layout/render library, stale since 2022 |
| [reesmichael1/WebWhir](https://github.com/reesmichael1/WebWhir) | 171 | mit | 2025-03-14 | stale | **Out-of-scope** | Toy HTML renderer (2025); too small to evaluate as an engine |
| [jsar-project/runtime](https://github.com/jsar-project/runtime) | 86 | apache-2.0 | 2026-01-19 | slow | **Out-of-scope** | Browser engine library for spatial (XR) web content |

## JavaScript engines

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [nodejs/node](https://github.com/nodejs/node) | 122.3k | NOASSERTION | 2026-10-11 | active | **Core** | Electron main-process runtime (24.21.0). |
| [v8/v8](https://github.com/v8/v8) | 25.3k | NOASSERTION | 2026-10-11 | active | **Core** | Inside Chromium/Electron. |
| [bytecodealliance/wasmtime](https://github.com/bytecodealliance/wasmtime) | 18.7k | Apache-2.0 | 2026-10-12 | active | **Optional** | Sandboxed WASM runtime — a candidate for isolating future extension/module code. |
| [bellard/quickjs](https://github.com/bellard/quickjs) | 11.0k | NOASSERTION | 2026-10-10 | active | **Reference** | Small embeddable JS engine. |
| [boa-dev/boa](https://github.com/boa-dev/boa) | 7.6k | MIT | 2026-10-11 | active | **Reference** | Embeddable JS engine in Rust (native-engine path). |
| [quickjs-ng/quickjs](https://github.com/quickjs-ng/quickjs) | 3.9k | MIT | 2026-10-11 | active | **Reference** | Maintained QuickJS fork. |
| [trynova/nova](https://github.com/trynova/nova) | 2.0k | MPL-2.0 | 2026-09-09 | active | **Reference** | Experimental Rust JS engine. |
| [engine262/engine262](https://github.com/engine262/engine262) | 950 | MIT | 2026-10-03 | active | **Reference** | Spec-faithful JS engine (conformance reference). |
| [mozilla-spidermonkey/spidermonkey-embedding-examples](https://github.com/mozilla-spidermonkey/spidermonkey-embedding-examples) | 228 | NOASSERTION | 2026-09-05 | active | **Reference** | How to embed SpiderMonkey. |
| [denoland/deno](https://github.com/denoland/deno) | 108.8k | MIT | 2026-10-07 | active | **Out-of-scope** | Runtime; not needed. |
| [nicbarker/clay](https://github.com/nicbarker/clay) | 18.2k | Zlib | 2026-05-20 | slow | **Out-of-scope** | C UI layout library; unrelated. |
| [facebook/hermes](https://github.com/facebook/hermes) | 11.4k | MIT | 2026-10-10 | active | **Out-of-scope** | Mobile-focused JS engine. |
| [WebAssembly/wabt](https://github.com/WebAssembly/wabt) | 8.2k | Apache-2.0 | 2026-10-11 | active | **Out-of-scope** | WASM toolkit. |
| [wasm3/wasm3](https://github.com/wasm3/wasm3) | 8.0k | MIT | 2026-09-30 | active | **Out-of-scope** | Interpreter. |
| [Moddable-OpenSource/moddable](https://github.com/Moddable-OpenSource/moddable) | 1.6k | — | 2026-10-09 | active | **Out-of-scope** | Embedded devices. |

## Chromium-based browsers & patchsets

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [chromium/chromium](https://github.com/chromium/chromium) | 25.0k | BSD-3-Clause | 2026-10-12 | active | **Core** | Engine (via Electron). Own fork infeasible here — see ADR-0001. |
| [chromiumembedded/cef](https://github.com/chromiumembedded/cef) | 4.8k | NOASSERTION | 2026-10-10 | active | **Optional** | Replacement path behind TabHost if Electron limits bite. |
| [GoogleChromeLabs/chromium-bidi](https://github.com/GoogleChromeLabs/chromium-bidi) | 171 | Apache-2.0 | 2026-10-09 | active | **Optional** | WebDriver-BiDi mapper (Apache-2.0); relevant to future automation. |
| [ungoogled-software/ungoogled-chromium](https://github.com/ungoogled-software/ungoogled-chromium) | 28.0k | BSD-3-Clause | 2026-10-08 | active | **Reference** | De-Googled patch-set; the base for Helium. A Chromium-fork track would start here. |
| [Eloston/ungoogled-chromium](https://github.com/Eloston/ungoogled-chromium) | 28.0k | BSD-3-Clause | 2026-10-08 | active | **Reference** | De-Googled patch-set; the base for Helium. A Chromium-fork track would start here. |
| [brave/brave-browser](https://github.com/brave/brave-browser) | 23.9k | MPL-2.0 | 2026-10-12 | active | **Reference** | Largest open Chromium fork; shows what a patch-set costs to maintain. |
| [imputnet/helium](https://github.com/imputnet/helium) | 21.5k | GPL-3.0 | 2026-10-11 | active | **Reference** | Beta Chromium-based browser on ungoogled-chromium, GPL-3.0, bundles a uBlock Origin fork. Closest "fork track" prior art. |
| [fathyb/carbonyl](https://github.com/fathyb/carbonyl) | 19.5k | BSD-3-Clause | 2024-07-01 | stale | **Reference** | Chromium in a terminal; stale since mid-2024. |
| [browseros-ai/BrowserOS](https://github.com/browseros-ai/BrowserOS) | 13.9k | AGPL-3.0 | 2026-10-11 | active | **Reference** | Agentic Chromium fork (AGPL-3.0) with local-model support and MCP; closest prior art for Pelorus's AI roadmap. AGPL network clause matters if code were reused. |
| [uazo/cromite](https://github.com/uazo/cromite) | 8.3k | GPL-3.0 | 2026-10-11 | active | **Reference** | Android Chromium fork with adblock; GPL-3.0. |
| [Alex313031/thorium](https://github.com/Alex313031/thorium) | 7.6k | BSD-3-Clause | 2026-10-11 | active | **Reference** | Optimised Chromium builds; tracks M156 today. |
| [duckduckgo/Android](https://github.com/duckduckgo/Android) | 4.8k | Apache-2.0 | 2026-10-11 | active | **Reference** | Apache-2.0 privacy browser; tracker-blocking design reference. |
| [win32ss/supermium](https://github.com/win32ss/supermium) | 4.8k | — | 2026-10-09 | active | **Reference** | Chromium for legacy Windows; licence not declared via API. |
| [ChromeDevTools/devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend) | 4.1k | BSD-3-Clause | 2026-10-11 | active | **Reference** | DevTools UI source (already bundled in Electron). |
| [brave/brave-core](https://github.com/brave/brave-core) | 3.7k | MPL-2.0 | 2026-10-12 | active | **Reference** | Source of Shields and adblock-rust integration ideas (MPL-2.0). |
| [NeverDecaf/chromium-web-store](https://github.com/NeverDecaf/chromium-web-store) | 3.3k | mit | 2026-09-06 | active | **Reference** | Lets ungoogled-chromium install Web Store extensions; shows the extension-install gap on de-Googled builds |
| [ungoogled-software/ungoogled-chromium-windows](https://github.com/ungoogled-software/ungoogled-chromium-windows) | 2.6k | BSD-3-Clause | 2026-10-08 | active | **Reference** | Windows build recipe. |
| [ungoogled-software/ungoogled-chromium-windows](https://github.com/ungoogled-software/ungoogled-chromium-windows) | 2.6k | BSD-3-Clause | 2026-10-08 | active | **Reference** | Windows packaging of ungoogled-chromium (already catalogued); a Windows build recipe for a possible Chromium-fork track |
| [Alex313031/Thorium-Win](https://github.com/Alex313031/Thorium-Win) | 2.5k | bsd-3-clause | 2026-10-11 | active | **Reference** | Windows build repo for Thorium (Thorium itself already catalogued) |
| [GrapheneOS/Vanadium](https://github.com/GrapheneOS/Vanadium) | 2.2k | NOASSERTION | 2026-10-08 | active | **Reference** | Hardened Android Chromium; hardening ideas. |
| [duckduckgo/duckduckgo-privacy-extension](https://github.com/duckduckgo/duckduckgo-privacy-extension) | 1.5k | Apache-2.0 | 2026-10-09 | active | **Reference** | Apache-2.0; consumes Tracker Radar. |
| [gonzazoid/Ultimatum](https://github.com/gonzazoid/Ultimatum) | 1.4k | BSD-3-Clause | 2026-06-30 | active | **Reference** | Chromium fork with WebExtensions on Android (per description); BSD-3-Clause, active |
| [MultiboxLabs/flow-browser](https://github.com/MultiboxLabs/flow-browser) | 1.1k | GPL-3.0 | 2026-05-30 | slow | **Reference** | **Closest prior art**: Electron, GPL-3.0, spaces/profiles, sidebar, command palette, sleeping tabs. Uses castlabs ECS (Widevine) and electron-browser-shell (extensions). Study, do not copy. |
| [henrypp/chrlauncher](https://github.com/henrypp/chrlauncher) | 1.0k | mit | 2026-10-07 | active | **Reference** | Portable updater/launcher for Chromium (MIT); update-flow reference |
| [ungoogled-software/ungoogled-chromium-macos](https://github.com/ungoogled-software/ungoogled-chromium-macos) | 704 | BSD-3-Clause | 2026-10-08 | active | **Reference** | macOS build recipe. |
| [RobRich999/Chromium_Clang](https://github.com/RobRich999/Chromium_Clang) | 593 | — | 2026-09-11 | active | **Reference** | Chromium built with Clang/LLVM; build-pipeline reference only (no licence field) |
| [duckduckgo/apple-browsers](https://github.com/duckduckgo/apple-browsers) | 258 | apache-2.0 | 2026-10-11 | active | **Reference** | DuckDuckGo iOS/macOS browsers (Apache-2.0, active) - the best open privacy-browser UX reference with a tracker-blocking default |
| [tbrowser/Turbo-Browser](https://github.com/tbrowser/Turbo-Browser) | 258 | — | 2026-10-11 | active | **Reference** | Chinese-market Chromium-based browser with vertical tabs, split view, mouse gestures per its description; no licence declared, so code cannot be reused |
| [phibrowser/phibrowser-mac](https://github.com/phibrowser/phibrowser-mac) | 228 | apache-2.0 | 2026-10-11 | active | **Reference** | Agentic, local-first, Swift UI over Chromium (Apache-2.0); AI-browser prior art |
| [Piracola/Helium_Portable](https://github.com/Piracola/Helium_Portable) | 53 | mit | 2026-10-09 | active | **Reference** | Automated portable builds of Helium browser (MIT) |
| [Alex313031/Thorium-Raspi](https://github.com/Alex313031/Thorium-Raspi) | 50 | bsd-3-clause | 2026-10-11 | active | **Reference** | Thorium builds for Raspberry Pi |
| [Alex313031/Thorium-WOA](https://github.com/Alex313031/Thorium-WOA) | 34 | bsd-3-clause | 2026-10-11 | active | **Reference** | Thorium for Windows on ARM |
| [SLT-World/SLBr](https://github.com/SLT-World/SLBr) | 31 | gpl-3.0 | 2026-10-03 | active | **Reference** | WPF C# browser (GPL-3.0, active) - Windows shell on CEF |
| [adobe/brackets](https://github.com/adobe/brackets) | 33.0k | MIT | 2022-06-12 | archived | **Rejected** | Archived editor. |
| [bromite/bromite](https://github.com/bromite/bromite) | 6.3k | GPL-3.0 | 2024-01-24 | stale | **Rejected** | Unmaintained since early 2024 (superseded by Cromite). |
| [duckduckgo/iOS](https://github.com/duckduckgo/iOS) | 2.0k | Apache-2.0 | 2025-02-19 | archived | **Rejected** | Archived 2025. |
| [Alex313031/Thorium-Win-AVX2](https://github.com/Alex313031/Thorium-Win-AVX2) | 423 | bsd-3-clause | 2024-01-24 | stale | **Rejected** | AVX2 build repo, no pushes since 2024-01 |
| [iridium-browser/iridium-browser](https://github.com/iridium-browser/iridium-browser) | 415 | BSD-3-Clause | 2024-01-26 | stale | **Rejected** | Privacy-oriented Chromium patch set; no pushes since 2024-01 |
| [Alex313031/thorium-legacy](https://github.com/Alex313031/thorium-legacy) | 358 | bsd-3-clause | 2024-11-13 | stale | **Rejected** | Legacy Windows builds, no pushes since 2024-11 |
| [atroche/rust-headless-chrome](https://github.com/atroche/rust-headless-chrome) | 27 | MIT | 2024-03-08 | stale | **Rejected** | Stale. |
| [Alex313031/Thorium-Linux-AVX2](https://github.com/Alex313031/Thorium-Linux-AVX2) | 26 | bsd-3-clause | 2024-02-20 | archived | **Rejected** | Archived build repo |
| [chromedp/chromedp](https://github.com/chromedp/chromedp) | 13.3k | MIT | 2026-10-11 | active | **Out-of-scope** | Go CDP client. |
| [cefsharp/CefSharp](https://github.com/cefsharp/CefSharp) | 10.3k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | .NET binding. |
| [go-rod/rod](https://github.com/go-rod/rod) | 7.1k | MIT | 2026-08-11 | active | **Out-of-scope** | Go CDP client. |
| [cztomczak/cefpython](https://github.com/cztomczak/cefpython) | 3.2k | NOASSERTION | 2026-10-09 | active | **Out-of-scope** | Python binding. |
| [mattsse/chromiumoxide](https://github.com/mattsse/chromiumoxide) | 1.4k | Apache-2.0 | 2026-04-03 | slow | **Out-of-scope** | Rust CDP client. |
| [chromiumembedded/java-cef](https://github.com/chromiumembedded/java-cef) | 887 | NOASSERTION | 2026-09-09 | active | **Out-of-scope** | Java binding. |
| [deemru/Chromium-Gost](https://github.com/deemru/Chromium-Gost) | 621 | MIT | 2026-10-01 | active | **Out-of-scope** | Chromium with GOST cryptography (Russian standards); regional use only |
| [aivrar/brave-origin-for-windows](https://github.com/aivrar/brave-origin-for-windows) | 57 | mit | 2026-10-10 | active | **Out-of-scope** | Portable Brave nightly packaging |
| [Piracola/Chrome-Portable](https://github.com/Piracola/Chrome-Portable) | 42 | mit | 2026-10-07 | active | **Out-of-scope** | Portable Chrome packaging |
| [foutrelis/chromium-launcher](https://github.com/foutrelis/chromium-launcher) | 21 | ISC | 2021-11-10 | stale | **Out-of-scope** | Arch packaging helper. |

## Gecko / Firefox-based

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [mozilla/geckoview](https://github.com/mozilla/geckoview) | 552 | — | 2026-10-11 | active | **Optional** | Android embedding path for a future mobile investigation. |
| [Erizur/Marble](https://github.com/Erizur/Marble) | 56 | NOASSERTION | 2026-09-18 | active | **Optional** | Firefox fork restoring the Photon UI (per description); relevant only as a theme/config example |
| [zen-browser/desktop](https://github.com/zen-browser/desktop) | 44.9k | MPL-2.0 | 2026-10-11 | active | **Reference** | MPL-2.0 Firefox fork; workspaces, vertical tabs, split view UX reference. |
| [mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox) | 13.4k | NOASSERTION | 2026-10-12 | active | **Reference** | Gecko; GeckoView is Android-focused; no embeddable Windows shell comparable to Electron/CEF. |
| [mozilla-mobile/firefox-ios](https://github.com/mozilla-mobile/firefox-ios) | 13.1k | MPL-2.0 | 2026-10-11 | active | **Reference** | iOS Firefox (MPL-2.0). |
| [arkenfox/user.js](https://github.com/arkenfox/user.js) | 12.9k | MIT | 2026-09-09 | active | **Reference** | Firefox hardening knowledge base (MIT). |
| [yokoffing/Betterfox](https://github.com/yokoffing/Betterfox) | 10.9k | MIT | 2026-09-07 | active | **Reference** | Firefox tuning (MIT). |
| [Floorp-Projects/Floorp](https://github.com/Floorp-Projects/Floorp) | 8.4k | MPL-2.0 | 2026-10-10 | active | **Reference** | Firefox fork with vertical tabs/workspaces. |
| [BrowserWorks/waterfox](https://github.com/BrowserWorks/waterfox) | 6.4k | NOASSERTION | 2026-10-08 | active | **Reference** | Firefox fork, independent since 2023. |
| [torproject/tor](https://github.com/torproject/tor) | 5.1k | — | 2024-03-05 | stale | **Reference** | Tor daemon (mirror); Tor Browser itself is developed on the Tor Project GitLab. |
| [mullvad/mullvad-browser](https://github.com/mullvad/mullvad-browser) | 2.6k | — | 2026-10-01 | active | **Reference** | Anti-fingerprinting by *uniformity* (same fingerprint for all users) — the model Pelorus should follow rather than spoofing. |
| [Alex313031/Mercury](https://github.com/Alex313031/Mercury) | 1.5k | MPL-2.0 | 2026-08-09 | active | **Reference** | Optimised Firefox fork. |
| [Alex313031/Mercury](https://github.com/Alex313031/Mercury) | 1.5k | MPL-2.0 | 2026-08-09 | active | **Reference** | Firefox fork with compiler optimisations plus patches from LibreWolf/Waterfox/others |
| [glide-browser/glide](https://github.com/glide-browser/glide) | 1.5k | mpl-2.0 | 2026-10-11 | active | **Reference** | MPL-2.0, active; "extensible and keyboard-focused" Firefox-based browser; strongest recent keyboard-first design reference |
| [ironfox-oss/IronFox](https://github.com/ironfox-oss/IronFox) | 1.1k | AGPL-3.0 | 2026-10-11 | active | **Reference** | Android Firefox fork (AGPL-3.0). |
| [goastian/midori-desktop](https://github.com/goastian/midori-desktop) | 408 | mpl-2.0 | 2026-10-06 | active | **Reference** | MPL-2.0 Firefox fork focused on lightness/privacy; follows the Zen/Floorp pattern |
| [garuda-linux/firedragon](https://github.com/garuda-linux/firedragon) | 401 | MPL-2.0 | 2026-10-08 | active | **Reference** | Privacy-focused Firefox fork from Garuda Linux (MPL-2.0, active) |
| [pulse-browser/gluon](https://github.com/pulse-browser/gluon) | 94 | mpl-2.0 | 2023-12-24 | stale | **Reference** | Toolkit to build Firefox forks (MPL-2.0); no pushes since 2023-12 |
| [VastSea0/hilal-browser](https://github.com/VastSea0/hilal-browser) | 29 | mpl-2.0 | 2026-09-21 | active | **Reference** | Hilal Browser (MPL-2.0); description is one line, so nothing else is claimed |
| [mozilla/gecko-dev](https://github.com/mozilla/gecko-dev) | 3.7k | NOASSERTION | 2025-07-09 | archived | **Rejected** | Archived mirror (superseded by mozilla-firefox/firefox). |
| [mozilla-mobile/focus-android](https://github.com/mozilla-mobile/focus-android) | 2.1k | MPL-2.0 | 2022-12-13 | archived | **Rejected** | Archived. |
| [mozilla-mobile/firefox-android](https://github.com/mozilla-mobile/firefox-android) | 1.8k | MPL-2.0 | 2024-06-17 | archived | **Rejected** | Archived (moved into the firefox monorepo). |
| [intika/Librefox](https://github.com/intika/Librefox) | 1.8k | mpl-2.0 | 2021-03-28 | stale | **Rejected** | Hardened-Firefox project, no pushes since 2021-03; LibreWolf is its active descendant (hosted at librewolf.dev, confirmed from its own site) |
| [dothq/browser](https://github.com/dothq/browser) | 1.1k | mpl-2.0 | 2024-12-25 | stale | **Rejected** | Dot Browser: no pushes since 2024-12 (browser-desktop since 2024-04) |
| [pulse-browser/browser](https://github.com/pulse-browser/browser) | 753 | mpl-2.0 | 2024-05-16 | archived | **Rejected** | Experimental Firefox fork, archived; no pushes since 2024-05 |
| [dothq/browser-desktop](https://github.com/dothq/browser-desktop) | 389 | mpl-2.0 | 2024-04-19 | stale | **Rejected** | Dot Browser desktop; no pushes since 2024-04 |
| [Feodor2/Mypal](https://github.com/Feodor2/Mypal) | 138 | — | 2022-04-07 | stale | **Rejected** | Stale since 2022. |
| [gab-ai-inc/defiant-browser](https://github.com/gab-ai-inc/defiant-browser) | 108 | MPL-2.0 | 2021-08-12 | archived | **Rejected** | Archived (2021) fork |
| [Floorp-Projects/Floorp-Portable](https://github.com/Floorp-Projects/Floorp-Portable) | 91 | mpl-2.0 | 2025-05-11 | archived | **Rejected** | Archived portable packaging of Floorp |
| [InternalError503/cyberfox](https://github.com/InternalError503/cyberfox) | 70 | other | 2022-11-04 | stale | **Rejected** | No pushes since 2022-11 |
| [pulse-browser/experiment](https://github.com/pulse-browser/experiment) | 52 | MPL-2.0 | 2024-04-26 | stale | **Rejected** | Same team, "another Gecko browser", no pushes since 2024-04 |
| [torvic9/plasmafox](https://github.com/torvic9/plasmafox) | 51 | NOASSERTION | 2021-05-31 | archived | **Rejected** | Archived Firefox-on-KDE fork (2021) |
| [Alex313031/Mercury-Win7](https://github.com/Alex313031/Mercury-Win7) | 50 | mpl-2.0 | 2024-09-06 | stale | **Rejected** | Windows 7 builds, no pushes since 2024-09 |
| [wysh3/Zen-Browser-Portable](https://github.com/wysh3/Zen-Browser-Portable) | 39 | mpl-2.0 | 2025-02-27 | archived | **Rejected** | Archived portable packaging of Zen |
| [dothq/melon](https://github.com/dothq/melon) | 34 | mpl-2.0 | 2022-10-23 | archived | **Rejected** | Archived Firefox-fork build tool |
| [wicknix/InterWebSnow](https://github.com/wicknix/InterWebSnow) | 31 | NOASSERTION | 2022-10-18 | archived | **Rejected** | Archived Snow Leopard browser |
| [rmottola/Arctic-Fox](https://github.com/rmottola/Arctic-Fox) | 504 | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Firefox-derived browser for legacy OS X / PowerPC; old-hardware niche |
| [Jazzzny/powerfox-classic](https://github.com/Jazzzny/powerfox-classic) | 174 | NOASSERTION | 2026-09-01 | active | **Out-of-scope** | Modern-ish Firefox for Mac OS X 10.6; old-OS niche |
| [roytam1/kmeleon](https://github.com/roytam1/kmeleon) | 133 | — | 2024-07-19 | stale | **Out-of-scope** | K-Meleon (Gecko-based Windows browser), legacy niche |
| [wicknix/SeaLion](https://github.com/wicknix/SeaLion) | 60 | MPL-2.0 | 2026-06-14 | active | **Out-of-scope** | Pale Moon-lineage browser for macOS 10.7-14; legacy niche |

## WebKit / Qt / GTK / other-engine desktop browsers

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [qt/qtwebengine](https://github.com/qt/qtwebengine) | 441 | BSD-3-Clause | 2026-10-09 | active | **Optional** | Alternative shell (Qt/C++, LGPL-3) — Chromium-based; heavier integration than Electron. |
| [Igalia/cog](https://github.com/Igalia/cog) | 348 | MIT | 2026-09-01 | active | **Optional** | WPE launcher / web-app container for embedded kiosks; relevant if Pelorus ever targets embedded displays |
| [qutebrowser/qutebrowser](https://github.com/qutebrowser/qutebrowser) | 11.7k | GPL-3.0 | 2026-10-05 | active | **Reference** | Keyboard-driven browser (GPL-3.0, Python on QtWebEngine); command-mode UX reference. |
| [atlas-engineer/nyxt](https://github.com/atlas-engineer/nyxt) | 11.0k | — | 2026-02-26 | slow | **Reference** | Hackable Common Lisp browser; programmable-browser UX reference. |
| [WebKit/WebKit](https://github.com/WebKit/WebKit) | 10.2k | — | 2026-10-12 | active | **Reference** | Engine for Safari; macOS-only embedding relevance. |
| [luakit/luakit](https://github.com/luakit/luakit) | 2.3k | GPL-3.0 | 2026-06-01 | slow | **Reference** | Lua-scriptable WebKitGTK browser. |
| [OtterBrowser/otter-browser](https://github.com/OtterBrowser/otter-browser) | 2.0k | GPL-3.0 | 2026-10-11 | active | **Reference** | Qt browser (GPL-3.0). |
| [fanglingsu/vimb](https://github.com/fanglingsu/vimb) | 1.5k | GPL-3.0 | 2026-09-04 | active | **Reference** | Vim-like WebKit browser. |
| [fanglingsu/vimb](https://github.com/fanglingsu/vimb) | 1.5k | GPL-3.0 | 2026-09-04 | active | **Reference** | Vim-like WebKitGTK browser, active |
| [nuance-dev/Web](https://github.com/nuance-dev/Web) | 665 | other | 2026-09-14 | active | **Reference** | Native macOS browser with "Glance" quick-lookup and optional local AI (licence field "other") |
| [KDE/falkon](https://github.com/KDE/falkon) | 492 | GPL-3.0 | 2026-10-10 | active | **Reference** | Qt WebEngine browser (KDE). |
| [GNOME/epiphany](https://github.com/GNOME/epiphany) | 401 | GPL-3.0 | 2026-10-11 | active | **Reference** | GNOME Web (WebKitGTK). |
| [Igalia/cog](https://github.com/Igalia/cog) | 348 | MIT | 2026-09-01 | active | **Reference** | WPE WebKit launcher for embedded devices. |
| [kfix/MacPin](https://github.com/kfix/MacPin) | 342 | gpl-3.0 | 2026-10-06 | active | **Reference** | macOS WebKit site-specific browser / webapp container (GPL-3.0, active) |
| [antiwork/chromeless](https://github.com/antiwork/chromeless) | 275 | mit | 2026-07-03 | active | **Reference** | Zero-chrome macOS browser for clean screenshots (MIT) |
| [WebPlatformForEmbedded/WPEWebKit](https://github.com/WebPlatformForEmbedded/WPEWebKit) | 251 | — | 2026-10-10 | active | **Reference** | WebKit port for embedded. |
| [pauljoda/Crest](https://github.com/pauljoda/Crest) | 246 | mpl-2.0 | 2026-10-12 | active | **Reference** | MPL-2.0 browser for Mac/iPhone/iPad, active |
| [KDE/konqueror](https://github.com/KDE/konqueror) | 108 | — | 2026-10-11 | active | **Reference** | KDE browser/file manager. |
| [kageroumado/refrax-browser](https://github.com/kageroumado/refrax-browser) | 46 | gpl-3.0 | 2026-10-07 | active | **Reference** | macOS "maximalist" browser by one developer (GPL-3.0, active) |
| [QupZilla/qupzilla](https://github.com/QupZilla/qupzilla) | 1.1k | gpl-3.0 | 2018-04-29 | archived | **Rejected** | Archived Qt browser; continued as Falkon (KDE), which is already catalogued |
| [uzbl/uzbl](https://github.com/uzbl/uzbl) | 1.0k | GPL-3.0 | 2018-12-28 | stale | **Rejected** | Stale since 2018. |
| [annulen/webkit](https://github.com/annulen/webkit) | 487 | — | 2024-05-27 | stale | **Rejected** | Stale fork (moved to qtwebkit/qtwebkit). |
| [midori-browser/core](https://github.com/midori-browser/core) | 467 | lgpl-2.1 | 2021-05-22 | stale | **Rejected** | Original Midori (WebKit/GTK); no pushes since 2021-05; the Midori name now belongs to the Firefox-based goastian/midori-desktop |
| [zhongwuzw/WebBrowser](https://github.com/zhongwuzw/WebBrowser) | 383 | mit | 2020-01-02 | stale | **Rejected** | iOS browser sample, last push 2020 |
| [jcs/endless](https://github.com/jcs/endless) | 270 | other | 2021-11-05 | archived | **Rejected** | Archived iOS privacy browser (2021) |
| [LeFroid/Viper-Browser](https://github.com/LeFroid/Viper-Browser) | 252 | gpl-3.0 | 2021-11-11 | stale | **Rejected** | Qt5 browser, no pushes since 2021-11 |
| [qt/qtwebkit](https://github.com/qt/qtwebkit) | 212 | NOASSERTION | 2020-09-24 | stale | **Rejected** | Stale since 2020. |
| [niutech/qt-ultralight-browser](https://github.com/niutech/qt-ultralight-browser) | 88 | — | 2022-01-15 | stale | **Rejected** | Qt + Ultralight browser, no pushes since 2022-01 |
| [tarptaeya/crusta](https://github.com/tarptaeya/crusta) | 54 | gpl-3.0 | 2024-08-21 | stale | **Rejected** | Qt browser, no pushes since 2024-08 |
| [jameszaghini/floaty](https://github.com/jameszaghini/floaty) | 43 | mit | 2022-11-24 | stale | **Rejected** | macOS float-on-top browser, last push 2022 |
| [cookiengineer/retrokit](https://github.com/cookiengineer/retrokit) | 56 | — | 2022-01-28 | stale | **Out-of-scope** | Old-WebKit hardening; legacy niche |

## Text-mode & minimalist

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [samuelmaddock/electron-browser-shell](https://github.com/samuelmaddock/electron-browser-shell) | 739 | GPL-3.0 | 2026-09-01 | active | **Experimental** | GPL-3.0 `electron-chrome-extensions` + web-store installer; actively maintained (Sep 2026) and used by Flow Browser. Candidate for Pelorus's optional extension module. |
| [browsh-org/browsh](https://github.com/browsh-org/browsh) | 19.1k | LGPL-2.1 | 2025-07-11 | stale | **Reference** | Terminal front-end over Firefox (LGPL-2.1). |
| [atlas-engineer/nyxt](https://github.com/atlas-engineer/nyxt) | 11.0k | — | 2026-02-26 | slow | **Reference** | Programmable keyboard-driven browser in Lisp (11k stars); strongest "browser as a programmable environment" prior art |
| [minbrowser/min](https://github.com/minbrowser/min) | 9.2k | Apache-2.0 | 2026-08-30 | active | **Reference** | Apache-2.0 Electron minimal browser; permissive prior art for tab/search UX. |
| [zenbu-labs/terminal-browser](https://github.com/zenbu-labs/terminal-browser) | 3.8k | mit | 2026-10-07 | active | **Reference** | A browser rendered inside a terminal (per description); interesting for SSH/remote use, not for Pelorus |
| [yokoffing/filterlists](https://github.com/yokoffing/filterlists) | 3.6k | — | 2026-09-07 | active | **Reference** | Curated filter-list guidance. |
| [OnionBrowser/OnionBrowser](https://github.com/OnionBrowser/OnionBrowser) | 2.7k | NOASSERTION | 2026-10-09 | active | **Reference** | iOS Tor browser. |
| [anthonycr/Lightning-Browser](https://github.com/anthonycr/Lightning-Browser) | 2.4k | MPL-2.0 | 2026-10-10 | active | **Reference** | Android browser (MPL-2.0). |
| [adamschwartz/chrome-tabs](https://github.com/adamschwartz/chrome-tabs) | 1.8k | MIT | 2023-12-28 | stale | **Reference** | Tab UI component. |
| [Jelmerro/Vieb](https://github.com/Jelmerro/Vieb) | 1.6k | GPL-3.0 | 2026-08-22 | active | **Reference** | Vim-like Electron browser (GPL-3.0). |
| [tholian-network/stealth](https://github.com/tholian-network/stealth) | 1.1k | GPL-3.0 | 2023-10-05 | stale | **Reference** | P2P privacy browser/proxy; stale since 2023. |
| [tats/w3m](https://github.com/tats/w3m) | 1.1k | NOASSERTION | 2024-08-19 | stale | **Reference** | Text browser. |
| [rkd77/elinks](https://github.com/rkd77/elinks) | 640 | NOASSERTION | 2026-10-10 | active | **Reference** | Text browser. |
| [CMB/edbrowse](https://github.com/CMB/edbrowse) | 481 | NOASSERTION | 2026-10-11 | active | **Reference** | Scriptable text browser (accessibility-friendly). |
| [psilva261/mycel](https://github.com/psilva261/mycel) | 411 | bsd-3-clause | 2026-01-09 | slow | **Reference** | Go, "rudimentary" browser; small enough to read as a design study |
| [kovidgoyal/vise](https://github.com/kovidgoyal/vise) | 212 | gpl-3.0 | 2026-07-21 | active | **Reference** | Keyboard-driven browser with tabs in a tree (GPL-3.0, active) - closest prior art for a tree-tab layout (see ROADMAP 0.3) |
| [netsurf-browser/netsurf](https://github.com/netsurf-browser/netsurf) | 186 | NOASSERTION | 2026-02-26 | slow | **Reference** | Independent small engine (GPL-2.0); last release 3.11 in Dec 2023. |
| [crossbowerbt/dillo-plus](https://github.com/crossbowerbt/dillo-plus) | 185 | gpl-3.0 | 2025-12-07 | slow | **Reference** | Dillo fork adding protocols; relevant only for the ultra-light-browser niche |
| [ThomasDickey/lynx-snapshots](https://github.com/ThomasDickey/lynx-snapshots) | 184 | NOASSERTION | 2026-05-31 | slow | **Reference** | Lynx. |
| [niutech/carbonyl-terminal](https://github.com/niutech/carbonyl-terminal) | 117 | mit | 2024-01-31 | stale | **Reference** | Packaging of the Carbonyl terminal browser (Chromium rendered into a terminal, MIT); last push 2024-01 |
| [v38armageddon/WebSM](https://github.com/v38armageddon/WebSM) | 10 | NOASSERTION | 2026-02-10 | slow | **Reference** | "Simply minimalist" browser (active in 2026, licence NOASSERTION so not reusable as-is) |
| [beakerbrowser/beaker](https://github.com/beakerbrowser/beaker) | 6.7k | MIT | 2022-12-27 | archived | **Rejected** | Archived P2P browser. |
| [wexond/browser-base](https://github.com/wexond/browser-base) | 2.7k | — | 2023-06-04 | archived | **Rejected** | Archived. |
| [wexond/wexond](https://github.com/wexond/wexond) | 2.7k | — | 2023-06-04 | archived | **Rejected** | Archived. |
| [LulumiProject/lulumi-browser](https://github.com/LulumiProject/lulumi-browser) | 442 | Apache-2.0 | 2022-12-10 | stale | **Rejected** | Stale since 2022. |
| [azer/kaktus](https://github.com/azer/kaktus) | 412 | — | 2024-10-09 | archived | **Rejected** | Archived experimental minimal browser |
| [hulufei/electron-as-browser](https://github.com/hulufei/electron-as-browser) | 249 | MIT | 2024-01-09 | stale | **Rejected** | Stale. |
| [parkouss/webmacs](https://github.com/parkouss/webmacs) | 159 | gpl-3.0 | 2023-04-11 | stale | **Rejected** | Emacs-style keyboard browser; no pushes since 2023-04 and redundant with qutebrowser/Vieb/Nyxt already catalogued |
| [guardianproject/orbot](https://github.com/guardianproject/orbot) | 3.6k | NOASSERTION | 2026-10-09 | active | **Out-of-scope** | Android Tor proxy. |
| [antfu/broz](https://github.com/antfu/broz) | 1.1k | — | 2026-07-22 | active | **Out-of-scope** | Screenshot helper browser. |
| [stjanovitz/tilefinch](https://github.com/stjanovitz/tilefinch) | 38 | mit | 2026-10-11 | active | **Out-of-scope** | Experimental browser for the Sony PSP - curiosity |
| [AntonioND/bunjalloo](https://github.com/AntonioND/bunjalloo) | 36 | gpl-3.0 | 2026-06-07 | slow | **Out-of-scope** | Browser for the Nintendo DS (GPL-3.0, active) - curiosity |

## Browser-like Electron/Tauri/etc. app shells & multi-service

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [electron/electron](https://github.com/electron/electron) | 123.3k | MIT | 2026-10-11 | active | **Core** | Shell + Chromium runtime. |
| [wailsapp/wails](https://github.com/wailsapp/wails) | 36.5k | MIT | 2026-10-12 | active | **Optional** | Go + system webview shell; same limits as Tauri for a browser core. |
| [blackboardsh/electrobun](https://github.com/blackboardsh/electrobun) | 12.9k | MIT | 2026-10-12 | active | **Experimental** | MIT Bun-based desktop framework using the system webview, with an optional `bundleCEF` to bundle Chromium and composable isolated webviews. A possible alternative shell behind TabHost; maturity/Windows behaviour not evaluated. |
| [blackboardsh/electrobun](https://github.com/blackboardsh/electrobun) | 12.9k | MIT | 2026-10-12 | active | **Experimental** | Bun-based desktop app framework (12.9k stars); the "Electron alternative" to watch for the shell layer, not engine |
| [responsively-org/responsively-app](https://github.com/responsively-org/responsively-app) | 25.2k | agpl-3.0 | 2026-10-03 | active | **Reference** | Electron-based multi-viewport dev browser (AGPL-3.0); AGPL means no code reuse in Pelorus; UX reference for responsive testing |
| [meetfranz/franz](https://github.com/meetfranz/franz) | 4.7k | Apache-2.0 | 2026-06-12 | slow | **Reference** | Multi-service app. |
| [ferdium/ferdium-app](https://github.com/ferdium/ferdium-app) | 4.7k | Apache-2.0 | 2026-10-08 | active | **Reference** | Multi-service Electron app (Apache-2.0). |
| [ferdium/ferdium-app](https://github.com/ferdium/ferdium-app) | 4.7k | Apache-2.0 | 2026-10-08 | active | **Reference** | Community successor to Ferdi/Franz multi-service app; workspace UX reference |
| [BrowserBox/BrowserBox](https://github.com/BrowserBox/BrowserBox) | 3.9k | other | 2026-10-11 | active | **Reference** | Remote/isolated browsing server (licence "other"); remote-browser-isolation prior art |
| [nilbuild/pennywise](https://github.com/nilbuild/pennywise) | 3.9k | MIT | 2025-12-22 | slow | **Reference** | Floating mini-window for any site/media (MIT; formerly kamranahmedse/pennywise) |
| [sharpbrowser/SharpBrowser](https://github.com/sharpbrowser/SharpBrowser) | 1.0k | MIT | 2025-04-22 | stale | **Reference** | C#/CefSharp browser (MIT); pattern for a CEF-based Windows shell |
| [saucer/saucer](https://github.com/saucer/saucer) | 949 | MIT | 2026-09-06 | active | **Reference** | C++ webview library (MIT). |
| [HeyPuter/browser.js](https://github.com/HeyPuter/browser.js) | 246 | agpl-3.0 | 2026-10-06 | active | **Reference** | Configurable browser environment that runs in the web page itself (AGPL-3.0, active); AGPL means no code reuse |
| [niutech/splitbrowser](https://github.com/niutech/splitbrowser) | 138 | MIT | 2026-02-11 | slow | **Reference** | Minimal split-view browser (MIT); relevant to Pelorus split view |
| [Rajaniraiyn/awesome-electron-browsers](https://github.com/Rajaniraiyn/awesome-electron-browsers) | 96 | CC0-1.0 | 2026-10-06 | active | **Reference** | Curated list (used in this sweep). |
| [CatalystDevOrg/Catalyst](https://github.com/CatalystDevOrg/Catalyst) | 81 | MIT | 2026-08-13 | active | **Reference** | Minimal customizable browser (MIT, active); did not read the code to see which engine it uses |
| [beamlegacy/beam](https://github.com/beamlegacy/beam) | 71 | NOASSERTION | 2026-10-09 | active | **Reference** | Beam: note-taking browser; licence NOASSERTION so cannot be assumed reusable |
| [snaildos/Fifo-Browser](https://github.com/snaildos/Fifo-Browser) | 70 | GPL-3.0 | 2026-09-30 | active | **Reference** | GPL-3.0, active; description is one word, so no feature claims |
| [gamingdoom/neutron](https://github.com/gamingdoom/neutron) | 66 | mit | 2026-03-10 | slow | **Reference** | PWA tool using Firefox/Gecko (MIT, last push 2026-03) |
| [leonaaraujo/companion](https://github.com/leonaaraujo/companion) | 63 | MIT | 2026-09-12 | active | **Reference** | Tiny floating mini-browser (MIT, active); quick-lookup window idea |
| [YSamed/yalqen](https://github.com/YSamed/yalqen) | 32 | mit | 2026-10-11 | active | **Reference** | Vertical tabs + command bar browser (MIT, active) - the same UX shape as Pelorus, so a useful comparison |
| [james-see/elector](https://github.com/james-see/elector) | 31 | gpl-3.0 | 2025-10-04 | stale | **Reference** | Tor Browser wrapped in Electron (GPL-3.0); a data point on how others have combined Electron and Tor |
| [tauri-apps/tauri](https://github.com/tauri-apps/tauri) | 111.8k | Apache-2.0 | 2026-10-12 | active | **Rejected** | Core: multi-webview still unstable; OS webview differs per platform (ADR-0001). |
| [nwjs/nw.js](https://github.com/nwjs/nw.js) | 41.1k | MIT | 2026-10-10 | active | **Rejected** | Redundant with Electron; weaker per-view isolation APIs. |
| [jiahaog/nativefier](https://github.com/jiahaog/nativefier) | 35.2k | MIT | 2023-09-29 | archived | **Rejected** | Archived. |
| [nativefier/nativefier](https://github.com/nativefier/nativefier) | 35.2k | MIT | 2023-09-29 | archived | **Rejected** | Archived; wrapped sites into Electron apps |
| [webview/webview](https://github.com/webview/webview) | 14.3k | MIT | 2026-03-09 | slow | **Rejected** | Single system webview wrapper. |
| [zserge/webview](https://github.com/zserge/webview) | 14.3k | MIT | 2026-03-09 | slow | **Rejected** | Single system webview wrapper. |
| [neutralinojs/neutralinojs](https://github.com/neutralinojs/neutralinojs) | 8.7k | NOASSERTION | 2026-10-12 | active | **Rejected** | System webview; no per-tab isolation primitives. |
| [ramboxapp/community-edition](https://github.com/ramboxapp/community-edition) | 6.4k | GPL-3.0 | 2022-04-21 | archived | **Rejected** | Archived. |
| [ultralight-ux/Ultralight](https://github.com/ultralight-ux/Ultralight) | 5.0k | — | 2024-04-22 | stale | **Rejected** | Proprietary engine. |
| [tauri-apps/wry](https://github.com/tauri-apps/wry) | 5.0k | Apache-2.0 | 2026-10-10 | active | **Rejected** | As above. |
| [tauri-apps/tao](https://github.com/tauri-apps/tao) | 2.2k | Apache-2.0 | 2026-10-11 | active | **Rejected** | Window library for Tauri. |
| [will-stone/browserosaurus](https://github.com/will-stone/browserosaurus) | 2.0k | GPL-3.0 | 2025-08-02 | archived | **Rejected** | Archived. |
| [Boscop/web-view](https://github.com/Boscop/web-view) | 2.0k | MIT | 2024-05-09 | stale | **Rejected** | Stale binding. |
| [yessGlory17/programmer-browser](https://github.com/yessGlory17/programmer-browser) | 595 | mit | 2023-06-03 | stale | **Rejected** | No pushes since 2023-06 |
| [lirios/browser](https://github.com/lirios/browser) | 219 | NOASSERTION | 2024-06-28 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [webview/webview_rust](https://github.com/webview/webview_rust) | 122 | MIT | 2022-05-14 | stale | **Rejected** | Stale binding. |
| [elzabrowser/elza](https://github.com/elzabrowser/elza) | 81 | GPL-3.0 | 2023-05-14 | stale | **Rejected** | Electron privacy browser, no pushes since 2023-05 |
| [PolySuite/PolyBrowser](https://github.com/PolySuite/PolyBrowser) | 81 | NOASSERTION | 2016-11-25 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [MystPi/ninetails](https://github.com/MystPi/ninetails) | 69 | MIT | 2022-06-18 | archived | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [cachyos/cachyos-browser-settings](https://github.com/cachyos/cachyos-browser-settings) | 66 | MPL-2.0 | 2025-03-05 | archived | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [unstoppabledomains/unstoppable-demo-browser](https://github.com/unstoppabledomains/unstoppable-demo-browser) | 53 | MIT | 2022-03-02 | archived | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [skyebrowser/skye](https://github.com/skyebrowser/skye) | 52 | GPL-3.0 | 2023-07-29 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [ModuleArt/ferny](https://github.com/ModuleArt/ferny) | 50 | gpl-3.0 | 2020-12-11 | archived | **Rejected** | Archived Electron/Chromium browser (2020) |
| [octalmage/minum](https://github.com/octalmage/minum) | 44 | — | 2018-07-02 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [raluvy95/FelidaBrowser](https://github.com/raluvy95/FelidaBrowser) | 43 | GPL-3.0 | 2025-02-07 | archived | **Rejected** | Archived Electron browser |
| [kevinjosethomas/turbo](https://github.com/kevinjosethomas/turbo) | 42 | NOASSERTION | 2023-04-22 | archived | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [cprussin/minichrome](https://github.com/cprussin/minichrome) | 32 | — | 2019-02-17 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [kingbri1/Asobi](https://github.com/kingbri1/Asobi) | 31 | Apache-2.0 | 2024-10-04 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [BonBon-exchange/bonbon-browser](https://github.com/BonBon-exchange/bonbon-browser) | 26 | GPL-3.0 | 2024-11-20 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [octalmage/Ninja-Browser](https://github.com/octalmage/Ninja-Browser) | 24 | GPL-3.0 | 2018-09-28 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [revblaze/Glow](https://github.com/revblaze/Glow) | 12 | — | 2019-11-13 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [PocketStudios/Pocket-Browser](https://github.com/PocketStudios/Pocket-Browser) | 11 | MIT | 2023-02-05 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [makdosx/nexus-browser](https://github.com/makdosx/nexus-browser) | 9 | AGPL-3.0 | 2021-08-19 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [pioplo/Borneo](https://github.com/pioplo/Borneo) | 5 | NOASSERTION | 2013-12-23 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [raphipod/LightBrowser-2020](https://github.com/raphipod/LightBrowser-2020) | 4 | MIT | 2020-12-18 | archived | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [vicr123/theweb](https://github.com/vicr123/theweb) | 3 | GPL-3.0 | 2021-03-09 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [crucial-synthesis/Mitra](https://github.com/crucial-synthesis/Mitra) | 1 | — | 2021-06-28 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [bengl/yaeb](https://github.com/bengl/yaeb) | 1 | MIT | 2020-07-07 | stale | **Rejected** | Small desktop-browser project from a curated list; archived or no pushes in over a year, nothing Pelorus needs that better-maintained projects do not already show |
| [flutter/flutter](https://github.com/flutter/flutter) | 179.8k | BSD-3-Clause | 2026-10-11 | active | **Out-of-scope** | UI toolkit. |
| [pavlobu/deskreen](https://github.com/pavlobu/deskreen) | 21.5k | agpl-3.0 | 2026-07-08 | active | **Out-of-scope** | Screen-sharing to a browser; not a browser |
| [ionic-team/capacitor](https://github.com/ionic-team/capacitor) | 16.8k | MIT | 2026-10-09 | active | **Out-of-scope** | Mobile app runtime. |
| [react-native-webview/react-native-webview](https://github.com/react-native-webview/react-native-webview) | 7.2k | MIT | 2026-09-20 | active | **Out-of-scope** | Mobile webview. |
| [pichillilorenzo/flutter_inappwebview](https://github.com/pichillilorenzo/flutter_inappwebview) | 3.8k | Apache-2.0 | 2026-02-10 | slow | **Out-of-scope** | Mobile webview plugin. |
| [da2x/EdgeDeflector](https://github.com/da2x/EdgeDeflector) | 2.9k | mit | 2022-03-23 | archived | **Out-of-scope** | Windows helper that redirects Edge-only links to the default browser; archived |
| [saucer/saucer](https://github.com/saucer/saucer) | 949 | MIT | 2026-09-06 | active | **Out-of-scope** | C++ webview library |
| [cba85/electron-webview](https://github.com/cba85/electron-webview) | 304 | mit | 2025-11-04 | slow | **Out-of-scope** | Simple Electron webview demo |
| [equodev/chromium](https://github.com/equodev/chromium) | 192 | gpl-3.0 | 2026-09-04 | active | **Out-of-scope** | Chromium inside Java SWT/Swing (GPL-3.0); embedding toolkit |
| [apexskier/DefaultBrowser](https://github.com/apexskier/DefaultBrowser) | 80 | — | 2026-07-08 | active | **Out-of-scope** | macOS menu bar app that routes links to browsers |
| [starTechnology1994/uewebbrowser](https://github.com/starTechnology1994/uewebbrowser) | 33 | — | 2026-09-02 | active | **Out-of-scope** | Enterprise Web UI / Chromium browser control for Unreal Engine |

## Ad / tracker blocking, filter lists, DNS

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [cliqz-oss/adblocker](https://github.com/cliqz-oss/adblocker) | 1.0k | MPL-2.0 | 2026-10-11 | active | **Core** | Network + cosmetic blocking engine (MPL-2.0). |
| [ghostery/adblocker](https://github.com/ghostery/adblocker) | 1.0k | MPL-2.0 | 2026-10-11 | active | **Core** | Network + cosmetic blocking engine (MPL-2.0). |
| [uBlockOrigin/uAssets](https://github.com/uBlockOrigin/uAssets) | 6.1k | GPL-3.0 | 2026-10-12 | active | **High-value** | Filter lists (data) maintained alongside uBO; candidate additional list source (GPL-3.0 data, fetched at runtime). |
| [ClearURLs/Addon](https://github.com/ClearURLs/Addon) | 5.1k | LGPL-3.0 | 2025-07-27 | stale | **High-value** | LGPL-3.0 rules for stripping tracking parameters; replace Pelorus's hard-coded list with its rule data (check data licence). |
| [ClearURLs/Addon](https://github.com/ClearURLs/Addon) | 5.1k | LGPL-3.0 | 2025-07-27 | stale | **High-value** | Maintained tracking-parameter rule set (LGPL-3.0); planned replacement for the hard-coded list; data licence still to be checked before bundling |
| [easylist/easylist](https://github.com/easylist/easylist) | 3.2k | — | 2026-10-12 | active | **High-value** | The canonical filter list (data, via Ghostery bundles). |
| [gorhill/uBlock](https://github.com/gorhill/uBlock) | 68.5k | GPL-3.0 | 2026-10-11 | active | **Optional** | GPL-3.0; usable as an extension if an extension host ships; not embeddable as a library. |
| [mitmproxy/mitmproxy](https://github.com/mitmproxy/mitmproxy) | 45.4k | MIT | 2026-10-05 | active | **Optional** | MIT; developer HTTP(S) inspection (companion tool). |
| [StevenBlack/hosts](https://github.com/StevenBlack/hosts) | 31.2k | MIT | 2026-10-07 | active | **Optional** | Hosts-based blocklists (MIT data). |
| [hagezi/dns-blocklists](https://github.com/hagezi/dns-blocklists) | 27.3k | GPL-3.0 | 2026-10-11 | active | **Optional** | DNS blocklists (GPL-3.0 data). |
| [DNSCrypt/dnscrypt-proxy](https://github.com/DNSCrypt/dnscrypt-proxy) | 13.7k | ISC | 2026-10-10 | active | **Optional** | ISC; encrypted DNS proxy. |
| [AdguardTeam/AdguardFilters](https://github.com/AdguardTeam/AdguardFilters) | 4.5k | GPL-3.0 | 2026-10-12 | active | **Optional** | AdGuard filter lists (GPL-3.0 data). |
| [cavi-au/Consent-O-Matic](https://github.com/cavi-au/Consent-O-Matic) | 4.3k | NOASSERTION | 2026-02-07 | slow | **Optional** | Auto-answers cookie-consent dialogs with the *privacy-preserving* choice; candidate module. |
| [AdguardTeam/dnsproxy](https://github.com/AdguardTeam/dnsproxy) | 3.4k | Apache-2.0 | 2026-10-09 | active | **Optional** | Apache-2.0 DoH/DoT/DoQ proxy as a separate process. |
| [brave/adblock-rust](https://github.com/brave/adblock-rust) | 2.9k | MPL-2.0 | 2026-10-07 | active | **Optional** | MPL-2.0 Rust engine; N-API binding needed; Ghostery meets targets today. |
| [duckduckgo/tracker-radar](https://github.com/duckduckgo/tracker-radar) | 1.7k | NOASSERTION | 2026-10-09 | active | **Optional** | Tracker dataset; data licence flagged non-commercial in our recollection — verify before shipping. |
| [AdguardTeam/FiltersRegistry](https://github.com/AdguardTeam/FiltersRegistry) | 366 | LGPL-3.0 | 2026-10-12 | active | **Optional** | Filter list registry (LGPL-3.0). |
| [AdguardTeam/tsurlfilter](https://github.com/AdguardTeam/tsurlfilter) | 82 | GPL-3.0 | 2026-10-05 | active | **Optional** | GPL-3.0 alternative filtering engine. |
| [mullvad/mullvadvpn-app](https://github.com/mullvad/mullvadvpn-app) | 7.7k | GPL-3.0 | 2026-10-11 | active | **Reference** | GPL-3.0 VPN client; integration-by-documentation only. |
| [AdguardTeam/AdguardBrowserExtension](https://github.com/AdguardTeam/AdguardBrowserExtension) | 4.5k | GPL-3.0 | 2026-09-30 | active | **Reference** | GPL-3.0 extension. |
| [WireGuard/wireguard-go](https://github.com/WireGuard/wireguard-go) | 4.4k | MIT | 2026-10-06 | active | **Reference** | VPN protocol implementation. |
| [uBlockOrigin/uBOL-home](https://github.com/uBlockOrigin/uBOL-home) | 3.9k | GPL-3.0 | 2026-10-11 | active | **Reference** | MV3 declarative uBO Lite. |
| [EFForg/privacybadger](https://github.com/EFForg/privacybadger) | 3.9k | NOASSERTION | 2026-10-09 | active | **Reference** | Learning-based tracker blocking idea (GPL-3.0). |
| [corbindavenport/just-the-browser](https://github.com/corbindavenport/just-the-browser) | 3.0k | mit | 2026-10-07 | active | **Reference** | Scripts that apply enterprise policies to strip AI/telemetry/sponsored content from desktop browsers (MIT); policy list is a hardening checklist |
| [pyllyukko/user.js](https://github.com/pyllyukko/user.js) | 2.9k | mit | 2026-04-07 | slow | **Reference** | Firefox hardening prefs (MIT, active); a checklist for Gecko-side hardening |
| [Cookie-AutoDelete/Cookie-AutoDelete](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete) | 2.0k | MIT | 2025-12-26 | slow | **Reference** | Cookie lifecycle UX (MIT); Pelorus's per-workspace storage covers similar needs. |
| [ghostery/ghostery-extension](https://github.com/ghostery/ghostery-extension) | 1.8k | GPL-3.0 | 2026-10-09 | active | **Reference** | GPL-3.0 extension. |
| [kkapsner/CanvasBlocker](https://github.com/kkapsner/CanvasBlocker) | 1.5k | MPL-2.0 | 2026-09-07 | active | **Reference** | Fingerprint-noise techniques (MPL-2.0); note: randomisation can itself be a fingerprint. |
| [hackademix/noscript](https://github.com/hackademix/noscript) | 1.2k | GPL-3.0 | 2026-10-05 | active | **Reference** | Script-blocking UX (GPL-3.0). |
| [ChaoticSi1ence/SlimBrave-Neo](https://github.com/ChaoticSi1ence/SlimBrave-Neo) | 735 | gpl-3.0 | 2026-10-01 | active | **Reference** | Hardens Brave through Chromium enterprise policies (GPL-3.0); same idea as above |
| [polcak/jsrestrictor](https://github.com/polcak/jsrestrictor) | 268 | GPL-3.0 | 2026-10-06 | active | **Reference** | JS Shield: API restriction research (GPL-3.0). |
| [celenityy/Phoenix](https://github.com/celenityy/Phoenix) | 208 | gpl-3.0 | 2026-10-09 | active | **Reference** | Firefox hardening configs (GPL-3.0, active) |
| [RKNF404/chromium-hardening-guide](https://github.com/RKNF404/chromium-hardening-guide) | 177 | ms-pl | 2026-10-10 | active | **Reference** | Hardening notes for Chromium (licence field says ms-pl); a checklist to cross-read, not authority |
| [duckduckgo/tracker-radar-collector](https://github.com/duckduckgo/tracker-radar-collector) | 169 | NOASSERTION | 2026-10-08 | active | **Reference** | Crawler that builds Tracker Radar. |
| [adblockplus/adblockpluscore](https://github.com/adblockplus/adblockpluscore) | 116 | GPL-3.0 | 2023-10-04 | stale | **Reference** | ABP core (GPL-3.0). |
| [rustybird/qubes-app-split-browser](https://github.com/rustybird/qubes-app-split-browser) | 49 | 0bsd | 2026-02-25 | slow | **Reference** | Tor Browser/Firefox in a Qubes disposable VM (0BSD); isolation-model reference |
| [uBlock-LLC/uBlock](https://github.com/uBlock-LLC/uBlock) | 8.3k | gpl-3.0 | 2022-09-08 | archived | **Rejected** | Not the upstream uBlock Origin (gorhill/uBlock); no pushes since 2022-09 - do not rely on it |
| [EFForg/https-everywhere](https://github.com/EFForg/https-everywhere) | 3.4k | NOASSERTION | 2023-01-25 | archived | **Rejected** | Archived; superseded by browser HTTPS-first modes (which Pelorus implements). |
| [Synzvato/decentraleyes](https://github.com/Synzvato/decentraleyes) | 1.5k | MPL-2.0 | 2019-02-23 | archived | **Rejected** | Archived since 2019. |
| [adblockplus/adblockpluschrome](https://github.com/adblockplus/adblockpluschrome) | 547 | GPL-3.0 | 2021-02-21 | archived | **Rejected** | Archived. |
| [AdguardTeam/CoreLibs](https://github.com/AdguardTeam/CoreLibs) | 49 | Apache-2.0 | 2024-05-17 | stale | **Rejected** | Stale. |
| [duckduckgo/privacy-grade](https://github.com/duckduckgo/privacy-grade) | 12 | NOASSERTION | 2023-03-10 | archived | **Rejected** | Archived. |
| [pi-hole/pi-hole](https://github.com/pi-hole/pi-hole) | 61.2k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Network appliance. |
| [XTLS/Xray-core](https://github.com/XTLS/Xray-core) | 42.1k | MPL-2.0 | 2026-10-12 | active | **Out-of-scope** | Proxy platform. |
| [SagerNet/sing-box](https://github.com/SagerNet/sing-box) | 38.8k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Proxy platform; user-configured at OS level. |
| [AdguardTeam/AdGuardHome](https://github.com/AdguardTeam/AdGuardHome) | 37.4k | GPL-3.0 | 2026-10-08 | active | **Out-of-scope** | Network DNS appliance. |
| [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo) | 34.8k | MIT | 2026-10-11 | active | **Out-of-scope** | Proxy platform. |
| [v2fly/v2ray-core](https://github.com/v2fly/v2ray-core) | 34.7k | MIT | 2026-10-09 | active | **Out-of-scope** | Proxy platform. |
| [projectdiscovery/katana](https://github.com/projectdiscovery/katana) | 17.6k | MIT | 2026-10-08 | active | **Out-of-scope** | Crawler. |
| [cloudflare/cloudflared](https://github.com/cloudflare/cloudflared) | 16.1k | Apache-2.0 | 2026-10-08 | active | **Out-of-scope** | Tunnel client. |
| [zaproxy/zaproxy](https://github.com/zaproxy/zaproxy) | 15.9k | Apache-2.0 | 2026-10-08 | active | **Out-of-scope** | Security testing tool; useful for testing Pelorus, not integrating. |
| [coredns/coredns](https://github.com/coredns/coredns) | 14.4k | Apache-2.0 | 2026-10-09 | active | **Out-of-scope** | DNS server. |
| [shadowsocks/shadowsocks-rust](https://github.com/shadowsocks/shadowsocks-rust) | 10.9k | MIT | 2026-10-12 | active | **Out-of-scope** | Proxy. |
| [0xERR0R/blocky](https://github.com/0xERR0R/blocky) | 7.0k | Apache-2.0 | 2026-10-09 | active | **Out-of-scope** | DNS server. |
| [EnableSecurity/wafw00f](https://github.com/EnableSecurity/wafw00f) | 6.6k | BSD-3-Clause | 2026-04-19 | slow | **Out-of-scope** | WAF detection tool. |
| [NLnetLabs/unbound](https://github.com/NLnetLabs/unbound) | 5.0k | BSD-3-Clause | 2026-10-09 | active | **Out-of-scope** | Resolver. |
| [httptoolkit/httptoolkit](https://github.com/httptoolkit/httptoolkit) | 3.7k | — | 2026-02-04 | slow | **Out-of-scope** | Debugging proxy app. |
| [pi-hole/FTL](https://github.com/pi-hole/FTL) | 1.7k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | DNS engine for Pi-hole. |
| [uBlockOrigin/uBlock-issues](https://github.com/uBlockOrigin/uBlock-issues) | 1.2k | — | 2026-09-19 | active | **Out-of-scope** | Issue tracker. |

## Fingerprinting research / testing

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [fingerprintjs/fingerprintjs](https://github.com/fingerprintjs/fingerprintjs) | 28.6k | MIT | 2026-10-07 | active | **Reference** | MIT; use as a *test oracle* to measure what Pelorus exposes. |
| [niespodd/browser-fingerprinting](https://github.com/niespodd/browser-fingerprinting) | 5.2k | — | 2026-07-27 | active | **Reference** | Research notes on fingerprinting and bot detection. |
| [abrahamjuliot/creepjs](https://github.com/abrahamjuliot/creepjs) | 2.5k | MIT | 2026-06-11 | slow | **Reference** | Fingerprint test oracle. |
| [omegaee/my-fingerprint](https://github.com/omegaee/my-fingerprint) | 1.5k | apache-2.0 | 2026-09-27 | active | **Reference** | Extension that protects against browser fingerprinting (Apache-2.0, active); candidate approach for future Pelorus fingerprint work, to be evaluated against Mullvad-style uniformity |
| [ultrafunkamsterdam/undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) | 12.9k | GPL-3.0 | 2025-07-05 | stale | **Rejected** | Bot-detection evasion. |
| [daijro/camoufox](https://github.com/daijro/camoufox) | 12.5k | MPL-2.0 | 2026-10-11 | active | **Rejected** | Anti-detect Firefox for scraping/agents; spoofing for bot-evasion conflicts with Pelorus's uniformity-based privacy goal. Engineering is interesting reference only. |
| [berstend/puppeteer-extra](https://github.com/berstend/puppeteer-extra) | 7.4k | MIT | 2024-07-18 | stale | **Rejected** | Stealth plugins for scraping; stale. |
| [Kaliiiiiiiiii-Vinyzu/patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) | 4.8k | Apache-2.0 | 2026-10-11 | active | **Rejected** | Bot-detection evasion for Playwright. |
| [adryfish/fingerprint-chromium](https://github.com/adryfish/fingerprint-chromium) | 3.1k | BSD-3-Clause | 2026-10-02 | active | **Rejected** | Fingerprint-spoofing Chromium patches. |
| [apify/fingerprint-suite](https://github.com/apify/fingerprint-suite) | 2.6k | Apache-2.0 | 2026-10-07 | active | **Rejected** | Built to generate realistic fake fingerprints for scraping (bot-evasion purpose). |
| [rebrowser/rebrowser-patches](https://github.com/rebrowser/rebrowser-patches) | 1.4k | — | 2025-05-09 | stale | **Rejected** | Bot-detection evasion patches. |
| [CheshireCaat/playwright-with-fingerprints](https://github.com/CheshireCaat/playwright-with-fingerprints) | 343 | MIT | 2026-09-22 | active | **Rejected** | Fingerprint spoofing for automation (renamed bablosoft/playwright-with-fingerprints). |

## Extensions: tooling and platforms

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [PlasmoHQ/plasmo](https://github.com/PlasmoHQ/plasmo) | 13.2k | MIT | 2026-10-11 | active | **Optional** | Extension framework (MIT). |
| [wxt-dev/wxt](https://github.com/wxt-dev/wxt) | 10.6k | MIT | 2026-10-11 | active | **Optional** | Extension framework (MIT); candidate if first-party extensions are built. |
| [openstyles/stylus](https://github.com/openstyles/stylus) | 6.9k | GPL-3.0 | 2026-10-07 | active | **Optional** | GPL-3.0 user-styles extension; matches "CSS customisation" goal via an extension host. |
| [extension-js/extension.js](https://github.com/extension-js/extension.js) | 5.2k | MIT | 2026-10-10 | active | **Optional** | Extension build tool. |
| [crxjs/chrome-extension-tools](https://github.com/crxjs/chrome-extension-tools) | 4.2k | — | 2026-10-06 | active | **Optional** | Vite plugin for extensions. |
| [mozilla/web-ext](https://github.com/mozilla/web-ext) | 3.1k | MPL-2.0 | 2026-10-10 | active | **Optional** | Dev tooling for WebExtensions (MPL-2.0). |
| [violentmonkey/violentmonkey](https://github.com/violentmonkey/violentmonkey) | 9.0k | MIT | 2026-10-10 | active | **Experimental** | MIT userscript manager; needs an extension host. |
| [sindresorhus/awesome-electron](https://github.com/sindresorhus/awesome-electron) | 27.3k | CC0-1.0 | 2026-05-03 | slow | **Reference** | Curated list (used in this sweep). |
| [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) | 17.8k | Apache-2.0 | 2026-10-06 | active | **Reference** | Official samples; useful for compatibility testing. |
| [Tampermonkey/tampermonkey](https://github.com/Tampermonkey/tampermonkey) | 5.8k | GPL-3.0 | 2025-03-30 | stale | **Reference** | Mirror of a mostly closed project. |
| [mdn/webextensions-examples](https://github.com/mdn/webextensions-examples) | 4.5k | MPL-2.0 | 2026-10-05 | active | **Reference** | Official examples. |
| [greasemonkey/greasemonkey](https://github.com/greasemonkey/greasemonkey) | 2.6k | NOASSERTION | 2026-06-03 | slow | **Reference** | Original userscript manager. |
| [MarshallOfSound/electron-devtools-installer](https://github.com/MarshallOfSound/electron-devtools-installer) | 1.2k | MIT | 2025-11-15 | slow | **Reference** | Installs devtools extensions in Electron. |
| [mozilla/addons-server](https://github.com/mozilla/addons-server) | 903 | BSD-3-Clause | 2026-10-09 | active | **Reference** | AMO server. |
| [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill) | 3.1k | MPL-2.0 | 2026-07-30 | archived | **Rejected** | Archived 2026-07. |
| [getstation/electron-chrome-extension](https://github.com/getstation/electron-chrome-extension) | 154 | — | 2023-02-03 | stale | **Rejected** | Stale (2023); superseded by electron-browser-shell. |
| [thamara/awesome-browser-extensions](https://github.com/thamara/awesome-browser-extensions) | 6 | CC0-1.0 | 2020-07-13 | stale | **Rejected** | Abandoned list. |

## Keyboard-driven / productivity extensions

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [mozilla/readability](https://github.com/mozilla/readability) | 11.5k | Apache-2.0 | 2026-08-04 | active | **High-value** | Apache-2.0 reader-mode/extraction library; planned for 0.3. |
| [mixmark-io/turndown](https://github.com/mixmark-io/turndown) | 11.5k | MIT | 2026-09-03 | active | **High-value** | MIT HTML→Markdown; the text format for AI/context extraction. |
| [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) | 196.9k | Unlicense | 2026-10-10 | active | **Optional** | Unlicense; external media downloader integration (user-invoked). |
| [karakeep-app/karakeep](https://github.com/karakeep-app/karakeep) | 29.6k | AGPL-3.0 | 2026-10-11 | active | **Optional** | Self-hosted bookmarks with AI tagging (AGPL-3.0). |
| [hoarder-app/hoarder](https://github.com/hoarder-app/hoarder) | 29.6k | AGPL-3.0 | 2026-10-11 | active | **Optional** | Self-hosted bookmarks with AI tagging (AGPL-3.0). |
| [ArchiveBox/ArchiveBox](https://github.com/ArchiveBox/ArchiveBox) | 28.7k | MIT | 2026-10-12 | active | **Optional** | Self-hosted archiver (MIT). |
| [philc/vimium](https://github.com/philc/vimium) | 27.1k | MIT | 2026-07-25 | active | **Optional** | MIT keyboard navigation extension. |
| [gildas-lormeau/SingleFile](https://github.com/gildas-lormeau/SingleFile) | 22.6k | AGPL-3.0 | 2026-10-11 | active | **Optional** | AGPL-3.0 single-file page archiving; integrate as external tool, not embedded. |
| [linkwarden/linkwarden](https://github.com/linkwarden/linkwarden) | 20.1k | AGPL-3.0 | 2026-10-11 | active | **Optional** | Self-hosted collaborative bookmarks (AGPL-3.0). |
| [wallabag/wallabag](https://github.com/wallabag/wallabag) | 13.0k | MIT | 2026-10-07 | active | **Optional** | Self-hosted read-it-later (MIT). |
| [go-shiori/shiori](https://github.com/go-shiori/shiori) | 11.7k | MIT | 2026-10-11 | active | **Optional** | Go bookmark manager (MIT). |
| [sissbruecker/linkding](https://github.com/sissbruecker/linkding) | 11.3k | MIT | 2026-10-01 | active | **Optional** | Self-hosted bookmark manager integration target (MIT). |
| [adbar/trafilatura](https://github.com/adbar/trafilatura) | 7.0k | Apache-2.0 | 2026-10-06 | active | **Optional** | Apache-2.0 Python extractor with strong benchmarks; useful as an offline evaluation baseline. |
| [brookhong/Surfingkeys](https://github.com/brookhong/Surfingkeys) | 6.2k | MIT | 2026-10-02 | active | **Optional** | MIT keyboard extension. |
| [gdh1995/vimium-c](https://github.com/gdh1995/vimium-c) | 4.6k | NOASSERTION | 2026-02-03 | slow | **Optional** | Vimium variant. |
| [gildas-lormeau/single-file-cli](https://github.com/gildas-lormeau/single-file-cli) | 1.7k | AGPL-3.0 | 2026-10-10 | active | **Optional** | AGPL-3.0 CLI. |
| [Robbendebiene/Gesturefy](https://github.com/Robbendebiene/Gesturefy) | 1.0k | gpl-3.0 | 2026-10-06 | active | **Optional** | Mouse gestures extension (GPL-3.0, active); gestures could become a Pelorus setting |
| [kepano/defuddle](https://github.com/kepano/defuddle) | 9.7k | MIT | 2026-10-10 | active | **Experimental** | MIT article extractor (active, 9.6k★); evaluate against Readability on a labelled set. |
| [darkreader/darkreader](https://github.com/darkreader/darkreader) | 22.5k | mit | 2026-10-09 | active | **Reference** | Dark mode extension (MIT, active); algorithm reference for a built-in forced-dark option |
| [omnivore-app/omnivore](https://github.com/omnivore-app/omnivore) | 16.3k | AGPL-3.0 | 2026-10-11 | active | **Reference** | Read-it-later (AGPL-3.0); project history is unstable. |
| [zotero/zotero](https://github.com/zotero/zotero) | 15.6k | NOASSERTION | 2026-10-09 | active | **Reference** | Research/annotation tool (AGPL-3.0). |
| [ajayyy/SponsorBlock](https://github.com/ajayyy/SponsorBlock) | 13.9k | GPL-3.0 | 2026-10-03 | active | **Reference** | Crowd-sourced skip segments. |
| [floccusaddon/floccus](https://github.com/floccusaddon/floccus) | 8.6k | MPL-2.0 | 2026-10-11 | active | **Reference** | MPL-2.0 bookmark sync over WebDAV/Nextcloud/etc. — design reference for Pelorus's sync. |
| [tridactyl/tridactyl](https://github.com/tridactyl/tridactyl) | 6.4k | NOASSERTION | 2026-10-07 | active | **Reference** | Firefox-only vim extension. |
| [obsidianmd/obsidian-clipper](https://github.com/obsidianmd/obsidian-clipper) | 5.3k | MIT | 2026-09-22 | active | **Reference** | Clipper (MIT). |
| [mbnuqw/sidebery](https://github.com/mbnuqw/sidebery) | 4.7k | MIT | 2026-09-18 | active | **Reference** | MIT vertical tab/panel UX. |
| [igrigorik/videospeed](https://github.com/igrigorik/videospeed) | 4.5k | MIT | 2026-09-29 | active | **Reference** | Playback-speed control (MIT) — media-feature reference. |
| [deathau/markdownload](https://github.com/deathau/markdownload) | 4.0k | Apache-2.0 | 2025-06-11 | stale | **Reference** | Clipper extension. |
| [piroor/treestyletab](https://github.com/piroor/treestyletab) | 3.8k | NOASSERTION | 2026-10-09 | active | **Reference** | Tree-style vertical tab UX. |
| [hypothesis/h](https://github.com/hypothesis/h) | 3.2k | BSD-2-Clause | 2026-10-09 | active | **Reference** | Annotation server. |
| [mozilla/multi-account-containers](https://github.com/mozilla/multi-account-containers) | 3.2k | mpl-2.0 | 2026-09-22 | active | **Reference** | Prior art for Pelorus workspaces (cookie/storage isolation per context); MPL-2.0 |
| [filips123/PWAsForFirefox](https://github.com/filips123/PWAsForFirefox) | 3.1k | mpl-2.0 | 2026-10-09 | active | **Reference** | PWA install/manage for Firefox (MPL-2.0, active); informs a future PWA mode |
| [joelshepherd/tabliss](https://github.com/joelshepherd/tabliss) | 2.8k | gpl-3.0 | 2024-08-19 | stale | **Reference** | New-tab page extension (GPL-3.0) |
| [salarcode/SmartProxy](https://github.com/salarcode/SmartProxy) | 2.8k | gpl-3.0 | 2026-10-03 | active | **Reference** | Per-site proxy switching extension (GPL-3.0, active); per-workspace proxy is a candidate feature |
| [sienori/Tab-Session-Manager](https://github.com/sienori/Tab-Session-Manager) | 2.5k | MPL-2.0 | 2026-08-17 | active | **Reference** | Save/restore window and tab sessions; informs Pelorus session snapshots |
| [zotero/translators](https://github.com/zotero/translators) | 1.7k | — | 2026-10-09 | active | **Reference** | Site metadata extractors. |
| [webrecorder/pywb](https://github.com/webrecorder/pywb) | 1.7k | GPL-3.0 | 2026-10-09 | active | **Reference** | Web archive replay (GPL-3.0). |
| [webrecorder/archiveweb.page](https://github.com/webrecorder/archiveweb.page) | 1.6k | AGPL-3.0 | 2026-09-04 | active | **Reference** | Archiving extension (AGPL). |
| [rNeomy/auto-tab-discard](https://github.com/rNeomy/auto-tab-discard) | 1.2k | MPL-2.0 | 2026-10-11 | active | **Reference** | MPL-2.0; tab discard heuristics (compare with Pelorus's sleeping tabs). |
| [JingMatrix/ChromeXt](https://github.com/JingMatrix/ChromeXt) | 1.1k | gpl-3.0 | 2026-08-20 | active | **Reference** | Userscripts + DevTools for Android Chromium/WebView browsers (GPL-3.0) |
| [josh-berry/tab-stash](https://github.com/josh-berry/tab-stash) | 1.1k | mpl-2.0 | 2026-10-07 | active | **Reference** | Tabs saved as bookmarks (MPL-2.0); informs tab groups |
| [webrecorder/replayweb.page](https://github.com/webrecorder/replayweb.page) | 994 | AGPL-3.0 | 2026-09-03 | active | **Reference** | WARC replay in browser (AGPL). |
| [stoically/temporary-containers](https://github.com/stoically/temporary-containers) | 907 | mit | 2023-08-14 | stale | **Reference** | Disposable containers; analogue of Pelorus private tabs |
| [hypothesis/client](https://github.com/hypothesis/client) | 737 | NOASSERTION | 2026-10-04 | active | **Reference** | Web annotation client. |
| [tabwrangler/tabwrangler](https://github.com/tabwrangler/tabwrangler) | 654 | GPL-3.0 | 2026-10-12 | active | **Reference** | GPL-3.0 tab auto-close. |
| [b0o/surfingkeys-conf](https://github.com/b0o/surfingkeys-conf) | 472 | mit | 2026-05-07 | slow | **Reference** | Config for the SurfingKeys extension (MIT); keybinding ideas |
| [eoger/tabcenter-redux](https://github.com/eoger/tabcenter-redux) | 371 | mpl-2.0 | 2020-03-11 | archived | **Reference** | Vertical tabs extension for Firefox (stale since 2020) |
| [projectdelphai/panorama-tab-groups](https://github.com/projectdelphai/panorama-tab-groups) | 329 | mpl-2.0 | 2023-01-07 | stale | **Reference** | Tab Groups for Firefox (MPL-2.0, stale since 2023) |
| [internet4000/find](https://github.com/internet4000/find) | 45 | gpl-3.0 | 2025-12-11 | slow | **Reference** | URL- and local-first omnibox actions (GPL-3.0); related to Pelorus command palette ideas |
| [postlight/parser](https://github.com/postlight/parser) | 5.8k | Apache-2.0 | 2024-07-10 | stale | **Rejected** | Stale since mid-2024. |
| [postlight/mercury-parser](https://github.com/postlight/mercury-parser) | 5.8k | Apache-2.0 | 2024-07-10 | stale | **Rejected** | Stale since mid-2024. |
| [go-shiori/go-readability](https://github.com/go-shiori/go-readability) | 939 | MIT | 2025-12-05 | archived | **Rejected** | Archived. |
| [lusakasa/saka](https://github.com/lusakasa/saka) | 220 | MIT | 2023-02-13 | archived | **Rejected** | Archived. |
| [mpv-player/mpv](https://github.com/mpv-player/mpv) | 37.3k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Media player. |
| [sindresorhus/refined-github](https://github.com/sindresorhus/refined-github) | 32.3k | MIT | 2026-10-09 | active | **Out-of-scope** | Site-specific extension. |
| [iv-org/invidious](https://github.com/iv-org/invidious) | 25.3k | AGPL-3.0 | 2026-10-11 | active | **Out-of-scope** | Front-end proxy server. |
| [videolan/vlc](https://github.com/videolan/vlc) | 19.9k | GPL-2.0 | 2026-10-11 | active | **Out-of-scope** | Media player. |
| [TeamPiped/Piped](https://github.com/TeamPiped/Piped) | 10.3k | AGPL-3.0 | 2026-10-10 | active | **Out-of-scope** | Front-end proxy server. |
| [gildas-lormeau/zip.js](https://github.com/gildas-lormeau/zip.js) | 3.9k | BSD-3-Clause | 2026-10-03 | active | **Out-of-scope** | Library. |
| [webrecorder/browsertrix-crawler](https://github.com/webrecorder/browsertrix-crawler) | 1.2k | AGPL-3.0 | 2026-10-08 | active | **Out-of-scope** | Crawler (AGPL). |
| [GeoSpoof/geospoof](https://github.com/GeoSpoof/geospoof) | 296 | apache-2.0 | 2026-10-10 | active | **Out-of-scope** | Geolocation/timezone spoofing extension |

## Translation / on-device AI in browsers

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [ollama/ollama](https://github.com/ollama/ollama) | 182.8k | MIT | 2026-10-11 | active | **High-value** | MIT; loopback local-LLM service for the AI panel. |
| [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | 130.9k | MIT | 2026-10-11 | active | **High-value** | MIT; local inference engine (usually via Ollama). |
| [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp) | 130.9k | MIT | 2026-10-11 | active | **High-value** | MIT; local inference engine (usually via Ollama). |
| [xenova/transformers.js](https://github.com/xenova/transformers.js) | 16.3k | Apache-2.0 | 2026-10-11 | active | **High-value** | Apache-2.0 on-device embeddings for semantic history. |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | 16.3k | Apache-2.0 | 2026-10-11 | active | **High-value** | Apache-2.0 on-device embeddings for semantic history. |
| [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) | 54.3k | MIT | 2026-10-11 | active | **Optional** | MIT local speech-to-text (voice commands). |
| [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) | 54.3k | MIT | 2026-10-11 | active | **Optional** | Local speech-to-text (MIT); would power local dictation / media transcripts |
| [mozilla/pdf.js](https://github.com/mozilla/pdf.js) | 54.0k | Apache-2.0 | 2026-10-11 | active | **Optional** | Apache-2.0 PDF viewer (Chromium already includes one). |
| [Mozilla-Ocho/llamafile](https://github.com/Mozilla-Ocho/llamafile) | 26.2k | NOASSERTION | 2026-10-12 | active | **Optional** | Single-file local LLM distribution. |
| [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) | 19.3k | Apache-2.0 | 2026-10-11 | active | **Optional** | Apache-2.0 in-renderer WebGPU LLM; heavy VRAM. |
| [LibreTranslate/LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) | 17.0k | AGPL-3.0 | 2026-09-28 | active | **Optional** | Self-hosted translation API (AGPL-3.0). |
| [lancedb/lancedb](https://github.com/lancedb/lancedb) | 11.6k | Apache-2.0 | 2026-10-11 | active | **Optional** | Embedded vector DB if scale ever demands. |
| [argosopentech/argos-translate](https://github.com/argosopentech/argos-translate) | 6.5k | MIT | 2026-08-08 | active | **Optional** | MIT local translation engine (Python). |
| [browsermt/bergamot-translator](https://github.com/browsermt/bergamot-translator) | 551 | MPL-2.0 | 2024-05-12 | stale | **Optional** | MPL-2.0 WASM translation engine used by Firefox; last push 2024; feasible for local translation. |
| [asg017/sqlite-vec](https://github.com/asg017/sqlite-vec) | 8.2k | Apache-2.0 | 2026-05-18 | slow | **Experimental** | Pre-1.0 SQLite vector search; brute-force JS cosine suffices at personal scale. |
| [openai/whisper](https://github.com/openai/whisper) | 110.3k | MIT | 2026-08-31 | active | **Reference** | Speech model reference. |
| [facebookresearch/faiss](https://github.com/facebookresearch/faiss) | 41.1k | MIT | 2026-10-11 | active | **Reference** | ANN library. |
| [mlc-ai/mlc-llm](https://github.com/mlc-ai/mlc-llm) | 23.2k | Apache-2.0 | 2026-10-06 | active | **Reference** | LLM compilation/runtime. |
| [nanobrowser/nanobrowser](https://github.com/nanobrowser/nanobrowser) | 14.1k | Apache-2.0 | 2026-10-02 | active | **Reference** | Apache-2.0 multi-agent browsing extension. |
| [ChatGPTBox-dev/chatGPTBox](https://github.com/ChatGPTBox-dev/chatGPTBox) | 10.8k | MIT | 2026-10-08 | active | **Reference** | MIT assistant extension. |
| [n4ze3m/page-assist](https://github.com/n4ze3m/page-assist) | 8.2k | MIT | 2026-10-11 | active | **Reference** | MIT sidebar extension for local models (Ollama); direct prior art for an AI panel — ideas and, since MIT, even code could be reused with attribution. |
| [nmslib/hnswlib](https://github.com/nmslib/hnswlib) | 5.3k | Apache-2.0 | 2026-09-15 | active | **Reference** | ANN index. |
| [deta/surf](https://github.com/deta/surf) | 3.6k | apache-2.0 | 2026-08-24 | active | **Reference** | Apache-2.0 "personal AI notebooks" app organising files and webpages; research-workspace prior art |
| [andrewnguonly/Lumos](https://github.com/andrewnguonly/Lumos) | 1.5k | MIT | 2025-01-26 | stale | **Reference** | Local-LLM RAG extension; stale since early 2025. |
| [webbrain-one/webbrain](https://github.com/webbrain-one/webbrain) | 1.4k | other | 2026-10-12 | active | **Reference** | Browser-agent extension for Chrome/Firefox (licence "other") |
| [mozilla-ai/any-agent](https://github.com/mozilla-ai/any-agent) | 1.2k | Apache-2.0 | 2026-10-01 | active | **Reference** | Agent framework abstraction. |
| [BrowserOperator/browser-operator-core](https://github.com/BrowserOperator/browser-operator-core) | 511 | bsd-3-clause | 2026-03-19 | slow | **Reference** | BSD-3-Clause; AI browser with a multi-agent platform; last push 2026-03 |
| [mozilla/translations](https://github.com/mozilla/translations) | 363 | MPL-2.0 | 2026-09-25 | active | **Reference** | Active Firefox translation models/pipeline (MPL-2.0). |
| [lencx/ChatGPT](https://github.com/lencx/ChatGPT) | 54.6k | — | 2024-08-29 | stale | **Rejected** | No licence declared; stale. |
| [LAION-AI/Open-Assistant](https://github.com/LAION-AI/Open-Assistant) | 37.4k | Apache-2.0 | 2024-08-17 | stale | **Rejected** | Stale. |
| [rhasspy/piper](https://github.com/rhasspy/piper) | 11.3k | MIT | 2025-08-26 | archived | **Rejected** | Archived. |
| [mozilla/firefox-translations](https://github.com/mozilla/firefox-translations) | 568 | MPL-2.0 | 2023-09-04 | archived | **Rejected** | Archived; superseded by mozilla/translations. |
| [asg017/sqlite-lembed](https://github.com/asg017/sqlite-lembed) | 265 | — | 2024-11-24 | stale | **Rejected** | Stale. |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | 35.0k | Apache-2.0 | 2026-10-11 | active | **Out-of-scope** | Vector DB server. |
| [chroma-core/chroma](https://github.com/chroma-core/chroma) | 29.5k | Apache-2.0 | 2026-10-10 | active | **Out-of-scope** | Vector DB server. |

## Automation, agents, testing

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [microsoft/playwright](https://github.com/microsoft/playwright) | 97.5k | Apache-2.0 | 2026-10-11 | active | **Core** | Dev dependency (playwright-core 1.64.0) for the e2e suite. |
| [web-platform-tests/wpt](https://github.com/web-platform-tests/wpt) | 6.2k | NOASSERTION | 2026-10-12 | active | **High-value** | Conformance suite; run against any engine host (Servo/Ladybird candidates are judged by WPT pass-rates). |
| [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) | 95.7k | Apache-2.0 | 2026-10-11 | active | **Optional** | Alternative CDP automation. |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | 30.9k | Apache-2.0 | 2026-10-11 | active | **Optional** | Apache-2.0 page audits (dev tool). |
| [jsdom/jsdom](https://github.com/jsdom/jsdom) | 21.7k | MIT | 2026-10-07 | active | **Optional** | DOM implementation in Node (MIT, active); useful for unit-testing extraction code without a browser |
| [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) | 5.8k | CC0-1.0 | 2026-10-10 | active | **Optional** | CC0 feature-compat DB; useful for compatibility reporting. |
| [sitespeedio/sitespeed.io](https://github.com/sitespeedio/sitespeed.io) | 5.0k | MIT | 2026-10-11 | active | **Optional** | MIT page-perf measurement. |
| [WebKit/Speedometer](https://github.com/WebKit/Speedometer) | 704 | NOASSERTION | 2026-09-23 | active | **Optional** | Responsiveness benchmark (measures the engine, which Pelorus shares with Chrome). |
| [sitespeedio/browsertime](https://github.com/sitespeedio/browsertime) | 653 | Apache-2.0 | 2026-10-05 | active | **Optional** | Apache-2.0 measurement harness for browsers — candidate for extending scripts/bench.js. |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 117.7k | MIT | 2026-10-09 | active | **Reference** | MIT agent loop for browsers (Python). |
| [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) | 95.7k | Apache-2.0 | 2026-10-11 | active | **Reference** | Apache-2.0; Chrome and Firefox automation. Pelorus tests use Playwright instead |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | 43.8k | Apache-2.0 | 2026-10-11 | active | **Reference** | Apache-2.0 CLI for agent-driven browsing; verify scope before drawing conclusions. |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 38.0k | Apache-2.0 | 2026-10-08 | active | **Reference** | Apache-2.0; accessibility-snapshot tool design for agent control. |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | 25.6k | MIT | 2026-10-10 | active | **Reference** | MIT AI browser-automation SDK. |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | 23.2k | AGPL-3.0 | 2026-10-12 | active | **Reference** | AGPL-3.0 vision-based automation. |
| [browser-use/browser-harness](https://github.com/browser-use/browser-harness) | 18.4k | mit | 2026-10-09 | active | **Reference** | MIT, active; LLM browser-task harness - prior art for the agent roadmap item |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | 17.1k | mit | 2026-10-10 | active | **Reference** | MIT; browser automation sharing a logged-in session - exactly the capability that needs strict consent in Pelorus; claims not verified |
| [browser-use/web-ui](https://github.com/browser-use/web-ui) | 16.6k | MIT | 2026-09-25 | active | **Reference** | UI around browser-use. |
| [lexmount/moli](https://github.com/lexmount/moli) | 16.4k | apache-2.0 | 2026-10-12 | active | **Reference** | Rust headless browser for agents (Apache-2.0, very active). Claims in its README were not verified |
| [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) | 8.6k | Apache-2.0 | 2026-10-11 | active | **Reference** | Metric definitions. |
| [steel-dev/steel-browser](https://github.com/steel-dev/steel-browser) | 7.8k | Apache-2.0 | 2026-10-09 | active | **Reference** | Apache-2.0 browser API for agents. |
| [BrowserMCP/mcp](https://github.com/BrowserMCP/mcp) | 7.2k | Apache-2.0 | 2025-04-24 | stale | **Reference** | MCP server over a real browser (Apache-2.0). |
| [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) | 6.7k | mit | 2026-09-05 | active | **Reference** | MIT; a Claude skill giving an agent browser access - threat-model reference for the agent features |
| [magnitudedev/magnitude](https://github.com/magnitudedev/magnitude) | 6.7k | Apache-2.0 | 2026-10-12 | active | **Reference** | Vision-first browser agent. |
| [WPO-Foundation/webpagetest](https://github.com/WPO-Foundation/webpagetest) | 3.3k | NOASSERTION | 2025-09-19 | stale | **Reference** | Perf testing. |
| [nottelabs/notte](https://github.com/nottelabs/notte) | 2.0k | NOASSERTION | 2026-10-11 | active | **Reference** | Agent framework. |
| [web-arena-x/webarena](https://github.com/web-arena-x/webarena) | 1.6k | Apache-2.0 | 2025-11-26 | slow | **Reference** | Benchmark for web agents — use to evaluate Pelorus's AI safety. |
| [platonai/Browser4](https://github.com/platonai/Browser4) | 1.2k | apache-2.0 | 2026-10-11 | active | **Reference** | Apache-2.0, active; "AI-native browser engine" for agents per description |
| [MinorJerry/WebVoyager](https://github.com/MinorJerry/WebVoyager) | 1.1k | Apache-2.0 | 2024-03-04 | stale | **Reference** | Web-agent benchmark. |
| [OSU-NLP-Group/Mind2Web](https://github.com/OSU-NLP-Group/Mind2Web) | 1.0k | MIT | 2025-11-05 | slow | **Reference** | Web-agent dataset. |
| [w3c/webdriver](https://github.com/w3c/webdriver) | 722 | NOASSERTION | 2026-10-07 | active | **Reference** | WebDriver spec. |
| [browser-use/desktop](https://github.com/browser-use/desktop) | 700 | mit | 2026-10-03 | active | **Reference** | Desktop app from the browser-use team (MIT) |
| [w3c/webdriver-bidi](https://github.com/w3c/webdriver-bidi) | 512 | — | 2026-10-08 | active | **Reference** | Next-generation automation protocol spec. |
| [unmodeled-tyler/vessel-browser](https://github.com/unmodeled-tyler/vessel-browser) | 136 | mit | 2026-09-15 | active | **Reference** | Open-source browser built "from the ground-up for agents" (MIT, active) |
| [aduermael/wb](https://github.com/aduermael/wb) | 66 | mit | 2026-07-08 | active | **Reference** | macOS 26+ browser CLI for agents (MIT) |
| [DO-SAY-GO/puppetromium](https://github.com/DO-SAY-GO/puppetromium) | 64 | mit | 2023-07-23 | stale | **Reference** | Single-tab browser driven by Puppeteer with no client-side JS - novelty / remote-isolation idea |
| [plasmate-labs/plasmate](https://github.com/plasmate-labs/plasmate) | 38 | apache-2.0 | 2026-10-12 | active | **Reference** | Engine that returns a structured "Semantic Object Model" for agents (Apache-2.0, active); relevant to agent-facing page extraction |
| [FlareSolverr/FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) | 15.9k | MIT | 2026-09-27 | active | **Rejected** | Exists to bypass anti-bot challenges. |
| [schickling/chromeless](https://github.com/schickling/chromeless) | 13.2k | MIT | 2018-11-13 | archived | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [casperjs/casperjs](https://github.com/casperjs/casperjs) | 7.2k | MIT | 2020-04-03 | archived | **Rejected** | Archived; PhantomJS-era |
| [lavague-ai/LaVague](https://github.com/lavague-ai/LaVague) | 6.4k | Apache-2.0 | 2025-01-21 | stale | **Rejected** | Stale since early 2025. |
| [ultrafunkamsterdam/nodriver](https://github.com/ultrafunkamsterdam/nodriver) | 4.8k | AGPL-3.0 | 2026-10-08 | active | **Rejected** | Stealth automation (anti-detection). |
| [scrapinghub/splash](https://github.com/scrapinghub/splash) | 4.2k | BSD-3-Clause | 2024-08-02 | stale | **Rejected** | Stale since 2024. |
| [jmcarp/robobrowser](https://github.com/jmcarp/robobrowser) | 3.7k | BSD-3-Clause | 2020-09-10 | stale | **Rejected** | No pushes since 2020 |
| [browserbase/mcp-server-browserbase](https://github.com/browserbase/mcp-server-browserbase) | 3.4k | apache-2.0 | 2026-07-20 | archived | **Rejected** | Archived MCP server |
| [alixaxel/chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda) | 3.3k | mit | 2024-09-03 | stale | **Rejected** | Last push 2024-09; superseded by Sparticuz/chromium |
| [laurentj/slimerjs](https://github.com/laurentj/slimerjs) | 3.0k | other | 2023-03-09 | stale | **Rejected** | Gecko-based PhantomJS alternative, last push 2023-03 |
| [adieuadieu/serverless-chrome](https://github.com/adieuadieu/serverless-chrome) | 2.9k | mit | 2022-12-08 | stale | **Rejected** | Serverless Chrome, last push 2022-12 |
| [jeanphix/Ghost.py](https://github.com/jeanphix/Ghost.py) | 2.8k | — | 2024-02-24 | stale | **Rejected** | Old WebKit Python scripting browser |
| [cdpdriver/zendriver](https://github.com/cdpdriver/zendriver) | 1.5k | AGPL-3.0 | 2026-10-02 | active | **Rejected** | Stealth automation (anti-detection). |
| [sourcegraph/webloop](https://github.com/sourcegraph/webloop) | 1.4k | BSD-3-Clause | 2024-04-01 | stale | **Rejected** | Headless WebKit with Go API, last push 2024-04, WebKit-based so far behind current engines |
| [mkoehnke/WKZombie](https://github.com/mkoehnke/WKZombie) | 1.2k | MIT | 2020-09-28 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [hollingsworthd/jBrowserDriver](https://github.com/hollingsworthd/jBrowserDriver) | 818 | NOASSERTION | 2024-07-29 | stale | **Rejected** | Java headless browser driver, last push 2024-07, NOASSERTION licence |
| [phimage/Erik](https://github.com/phimage/Erik) | 613 | mit | 2022-08-05 | stale | **Rejected** | Headless WebKit for Swift, last push 2022 |
| [niwinz/phantompy](https://github.com/niwinz/phantompy) | 611 | BSD-3-Clause | 2017-05-17 | stale | **Rejected** | PhantomJS-era binding |
| [steel-dev/surf.new](https://github.com/steel-dev/surf.new) | 510 | mit | 2025-07-17 | archived | **Rejected** | Archived Operator alternative |
| [joshbuddy/ghostbuster](https://github.com/joshbuddy/ghostbuster) | 276 | — | 2012-04-10 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [angrykoala/wendigo](https://github.com/angrykoala/wendigo) | 151 | MIT | 2024-03-08 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [StanAngeloff/lotte](https://github.com/StanAngeloff/lotte) | 99 | NOASSERTION | 2019-10-23 | archived | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [jabbalaci/Jabba-Webkit](https://github.com/jabbalaci/Jabba-Webkit) | 91 | — | 2014-10-23 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [roryprimrose/Headless](https://github.com/roryprimrose/Headless) | 85 | MIT | 2022-06-22 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [briankircho/browserjet](https://github.com/briankircho/browserjet) | 74 | — | 2011-07-18 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [artsy/benv](https://github.com/artsy/benv) | 74 | MIT | 2017-10-22 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [makinacorpus/spynner](https://github.com/makinacorpus/spynner) | 62 | — | 2020-09-01 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [spacenick/jedi-crawler](https://github.com/spacenick/jedi-crawler) | 36 | — | 2013-10-03 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [safrizal/cdp4j](https://github.com/safrizal/cdp4j) | 35 | MIT | 2017-05-22 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [alexandernst/headless_browser](https://github.com/alexandernst/headless_browser) | 23 | — | 2021-05-29 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [damonjs/damon](https://github.com/damonjs/damon) | 22 | Apache-2.0 | 2016-11-23 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [clubajax/HeadlessBrowser](https://github.com/clubajax/HeadlessBrowser) | 21 | — | 2014-05-25 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [andyjansson/specterjs](https://github.com/andyjansson/specterjs) | 19 | MIT | 2017-08-15 | archived | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [youpy/grope](https://github.com/youpy/grope) | 16 | MIT | 2017-02-21 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [seebigs/node-as-browser](https://github.com/seebigs/node-as-browser) | 16 | — | 2018-09-01 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [tmp8/browser-rb](https://github.com/tmp8/browser-rb) | 11 | — | 2011-01-04 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [pszyller/Guillotine](https://github.com/pszyller/Guillotine) | 8 | LGPL-3.0 | 2014-03-18 | stale | **Rejected** | Old headless-browser/automation library from a curated list (PhantomJS-era or unmaintained); superseded by Playwright/Puppeteer/CDP clients |
| [mendableai/firecrawl](https://github.com/mendableai/firecrawl) | 190.5k | AGPL-3.0 | 2026-10-12 | active | **Out-of-scope** | Crawler service. |
| [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) | 90.6k | MIT | 2026-10-12 | active | **Out-of-scope** | Coding agent. |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | 85.3k | Apache-2.0 | 2026-10-11 | active | **Out-of-scope** | Crawler. |
| [scrapy/scrapy](https://github.com/scrapy/scrapy) | 64.7k | BSD-3-Clause | 2026-10-10 | active | **Out-of-scope** | Crawler. |
| [cypress-io/cypress](https://github.com/cypress-io/cypress) | 51.0k | MIT | 2026-10-11 | active | **Out-of-scope** | Test framework. |
| [SeleniumHQ/selenium](https://github.com/SeleniumHQ/selenium) | 34.5k | Apache-2.0 | 2026-10-12 | active | **Out-of-scope** | Test framework. |
| [apify/crawlee](https://github.com/apify/crawlee) | 26.1k | Apache-2.0 | 2026-10-11 | active | **Out-of-scope** | Crawler. |
| [microsoft/playwright-python](https://github.com/microsoft/playwright-python) | 15.0k | Apache-2.0 | 2026-10-09 | active | **Out-of-scope** | Binding. |
| [browserless/browserless](https://github.com/browserless/browserless) | 13.8k | NOASSERTION | 2026-10-09 | active | **Out-of-scope** | Hosted-browser service. |
| [browserslist/browserslist](https://github.com/browserslist/browserslist) | 13.6k | MIT | 2026-09-30 | active | **Out-of-scope** | Build tool. |
| [chromedp/chromedp](https://github.com/chromedp/chromedp) | 13.3k | MIT | 2026-10-11 | active | **Out-of-scope** | Go CDP driver (MIT, active) |
| [nightwatchjs/nightwatch](https://github.com/nightwatchjs/nightwatch) | 11.9k | MIT | 2026-05-25 | slow | **Out-of-scope** | Test framework. |
| [DevExpress/testcafe](https://github.com/DevExpress/testcafe) | 9.9k | MIT | 2026-10-07 | active | **Out-of-scope** | Test framework. |
| [webdriverio/webdriverio](https://github.com/webdriverio/webdriverio) | 9.8k | MIT | 2026-10-12 | active | **Out-of-scope** | Test framework. |
| [SeleniumHQ/docker-selenium](https://github.com/SeleniumHQ/docker-selenium) | 8.7k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Grid images. |
| [mozilla/geckodriver](https://github.com/mozilla/geckodriver) | 7.5k | MPL-2.0 | 2026-08-25 | active | **Out-of-scope** | Firefox driver. |
| [autoscrape-labs/pydoll](https://github.com/autoscrape-labs/pydoll) | 7.1k | mit | 2026-10-09 | active | **Out-of-scope** | Python CDP automation library without a WebDriver (MIT); its "realistic" behaviour pitch is about evading bot detection, so not used |
| [bda-research/node-crawler](https://github.com/bda-research/node-crawler) | 6.8k | MIT | 2026-06-18 | active | **Out-of-scope** | Crawler. |
| [matthewmueller/x-ray](https://github.com/matthewmueller/x-ray) | 5.9k | MIT | 2026-08-31 | active | **Out-of-scope** | Scraper library |
| [MechanicalSoup/MechanicalSoup](https://github.com/MechanicalSoup/MechanicalSoup) | 4.9k | MIT | 2026-10-07 | active | **Out-of-scope** | Python form automation library |
| [hardkoded/puppeteer-sharp](https://github.com/hardkoded/puppeteer-sharp) | 3.9k | MIT | 2026-10-11 | active | **Out-of-scope** | .NET Puppeteer port |
| [getgauge/taiko](https://github.com/getgauge/taiko) | 3.7k | MIT | 2026-10-09 | active | **Out-of-scope** | Test framework. |
| [mxschmitt/playwright-go](https://github.com/mxschmitt/playwright-go) | 3.5k | mit | 2026-09-14 | active | **Out-of-scope** | Go Playwright port |
| [microsoft/playwright-dotnet](https://github.com/microsoft/playwright-dotnet) | 3.0k | MIT | 2026-10-08 | active | **Out-of-scope** | Binding. |
| [symfony/browser-kit](https://github.com/symfony/browser-kit) | 3.0k | MIT | 2026-08-22 | active | **Out-of-scope** | PHP testing helper |
| [chrome-php/chrome](https://github.com/chrome-php/chrome) | 2.7k | MIT | 2026-07-06 | active | **Out-of-scope** | PHP headless Chrome driver |
| [jonhoo/fantoccini](https://github.com/jonhoo/fantoccini) | 2.0k | Apache-2.0 | 2026-10-01 | active | **Out-of-scope** | Rust WebDriver client. |
| [microlinkhq/browserless](https://github.com/microlinkhq/browserless) | 1.8k | mit | 2026-10-10 | active | **Out-of-scope** | Headless Chrome driver on Puppeteer |
| [Sparticuz/chromium](https://github.com/Sparticuz/chromium) | 1.7k | mit | 2026-10-07 | active | **Out-of-scope** | Chromium build for serverless platforms |
| [microsoft/playwright-java](https://github.com/microsoft/playwright-java) | 1.6k | Apache-2.0 | 2026-10-08 | active | **Out-of-scope** | Binding. |
| [headzoo/surf](https://github.com/headzoo/surf) | 1.5k | MIT | 2024-01-24 | stale | **Out-of-scope** | Stateful Go web-browsing library (not a rendering browser) |
| [stevepryde/thirtyfour](https://github.com/stevepryde/thirtyfour) | 1.4k | NOASSERTION | 2026-10-12 | active | **Out-of-scope** | Rust Selenium/WebDriver client |
| [mattsse/chromiumoxide](https://github.com/mattsse/chromiumoxide) | 1.4k | Apache-2.0 | 2026-04-03 | slow | **Out-of-scope** | Rust CDP client |
| [rubycdp/cuprite](https://github.com/rubycdp/cuprite) | 1.4k | mit | 2026-10-05 | active | **Out-of-scope** | Ruby Capybara driver for headless Chrome |
| [browser-use/terminal](https://github.com/browser-use/terminal) | 651 | mit | 2026-08-16 | active | **Out-of-scope** | Terminal UI for browser-use |
| [SimpleBrowserDotNet/SimpleBrowser](https://github.com/SimpleBrowserDotNet/SimpleBrowser) | 365 | NOASSERTION | 2023-11-26 | stale | **Out-of-scope** | .NET automation browser abstraction |

## Sync, passwords, auth

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [jedisct1/libsodium](https://github.com/jedisct1/libsodium) | 14.0k | NOASSERTION | 2026-10-09 | active | **High-value** | ISC crypto library for planned encrypted sync. |
| [syncthing/syncthing](https://github.com/syncthing/syncthing) | 89.3k | MPL-2.0 | 2026-10-10 | active | **Optional** | MPL-2.0 external transport for encrypted sync blobs. |
| [keepassxreboot/keepassxc](https://github.com/keepassxreboot/keepassxc) | 29.2k | NOASSERTION | 2026-10-10 | active | **Optional** | Local password DB with a browser-integration protocol. |
| [jedisct1/libsodium.js](https://github.com/jedisct1/libsodium.js) | 1.2k | NOASSERTION | 2026-09-25 | active | **Optional** | WASM libsodium. |
| [sodium-friends/sodium-native](https://github.com/sodium-friends/sodium-native) | 0 | — | 2024-10-01 | stale | **Optional** | Node bindings for libsodium. |
| [bitwarden/clients](https://github.com/bitwarden/clients) | 14.0k | NOASSERTION | 2026-10-11 | active | **Reference** | GPL-3.0 + proprietary SDK parts (NOASSERTION): integrate via standard autofill, do not embed. |
| [google/tink](https://github.com/google/tink) | 13.5k | Apache-2.0 | 2024-04-17 | archived | **Reference** | Crypto library family. |
| [go-shiori/shiori](https://github.com/go-shiori/shiori) | 11.7k | MIT | 2026-10-11 | active | **Reference** | Self-hosted bookmark manager (Go); a possible sync target |
| [keepassxreboot/keepassxc-browser](https://github.com/keepassxreboot/keepassxc-browser) | 2.4k | GPL-3.0 | 2026-10-10 | active | **Reference** | GPL-3.0 reference for native-messaging integration. |
| [mozilla-services/syncstorage-rs](https://github.com/mozilla-services/syncstorage-rs) | 1.8k | MPL-2.0 | 2026-10-10 | active | **Reference** | Firefox Sync storage server design (MPL-2.0). |
| [Duo-Labs/webauthn.io](https://github.com/Duo-Labs/webauthn.io) | 746 | BSD-3-Clause | 2026-08-06 | active | **Reference** | WebAuthn demo site for testing. |
| [mozilla/fxa](https://github.com/mozilla/fxa) | 686 | MPL-2.0 | 2026-10-10 | active | **Reference** | Firefox Accounts. |
| [buttercup/buttercup-desktop](https://github.com/buttercup/buttercup-desktop) | 4.4k | GPL-3.0 | 2025-03-04 | archived | **Rejected** | Archived. |
| [mozilla-services/syncserver](https://github.com/mozilla-services/syncserver) | 2.0k | MPL-2.0 | 2023-08-30 | archived | **Rejected** | Archived. |
| [duo-labs/webauthn](https://github.com/duo-labs/webauthn) | 1.0k | BSD-3-Clause | 2022-12-05 | archived | **Rejected** | Archived. |
| [dani-garcia/vaultwarden](https://github.com/dani-garcia/vaultwarden) | 68.9k | AGPL-3.0 | 2026-10-10 | active | **Out-of-scope** | AGPL server. |
| [bitwarden/server](https://github.com/bitwarden/server) | 20.3k | NOASSERTION | 2026-10-11 | active | **Out-of-scope** | Server. |
| [vector-im/element-web](https://github.com/vector-im/element-web) | 13.6k | AGPL-3.0 | 2026-10-11 | active | **Out-of-scope** | Chat client. |
| [tutao/tutanota](https://github.com/tutao/tutanota) | 8.0k | GPL-3.0 | 2026-10-09 | active | **Out-of-scope** | Encrypted email service; not browser-related beyond privacy ethos |
| [passbolt/passbolt_api](https://github.com/passbolt/passbolt_api) | 6.2k | AGPL-3.0 | 2026-10-08 | active | **Out-of-scope** | Team password server. |
| [Psono/psono-client](https://github.com/Psono/psono-client) | 26 | NOASSERTION | 2026-10-09 | active | **Out-of-scope** | Password manager. |

## Devtools, proxies, perf, debugging

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [WebKit/Speedometer](https://github.com/WebKit/Speedometer) | 704 | NOASSERTION | 2026-09-23 | active | **High-value** | The standard responsiveness benchmark; planned for scripts/bench.js alongside JetStream/MotionMark (ROADMAP 0.2) |
| [WebKit/JetStream](https://github.com/WebKit/JetStream) | 59 | NOASSERTION | 2026-08-31 | active | **High-value** | JavaScript/WASM benchmark from the WebKit org |
| [WebKit/MotionMark](https://github.com/WebKit/MotionMark) | 57 | NOASSERTION | 2026-10-05 | active | **High-value** | Graphics benchmark from the WebKit org |
| [cyrus-and/chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface) | 4.6k | MIT | 2026-02-09 | slow | **Optional** | CDP client. |
| [macbre/phantomas](https://github.com/macbre/phantomas) | 2.3k | bsd-2-clause | 2026-10-02 | active | **Optional** | Headless-Chromium web-perf metrics collector (BSD-2-Clause, active); benchmark-script alternative |
| [DistriNet/BugHog](https://github.com/DistriNet/BugHog) | 29 | gpl-3.0 | 2026-05-07 | slow | **Optional** | Framework for pinpointing bug lifecycles across browser versions (GPL-3.0); useful for compatibility research |
| [ChromeDevTools/awesome-chrome-devtools](https://github.com/ChromeDevTools/awesome-chrome-devtools) | 7.2k | CC0-1.0 | 2026-10-06 | active | **Reference** | Curated list. |
| [firefox-devtools/profiler](https://github.com/firefox-devtools/profiler) | 1.5k | mpl-2.0 | 2026-10-09 | active | **Reference** | Firefox Profiler web app (MPL-2.0); Chromium traces can be loaded in it |
| [GoogleChrome/chrome-launcher](https://github.com/GoogleChrome/chrome-launcher) | 1.4k | Apache-2.0 | 2026-10-05 | active | **Reference** | Launch helper used by Lighthouse. |
| [ChromeDevTools/debugger-protocol-viewer](https://github.com/ChromeDevTools/debugger-protocol-viewer) | 896 | other | 2026-10-04 | active | **Reference** | Chrome DevTools Protocol docs viewer |
| [firefox-devtools/debugger](https://github.com/firefox-devtools/debugger) | 4.6k | — | 2023-01-11 | archived | **Rejected** | Debugger UI repo, no pushes since 2023-01 |
| [RemoteDebug/remotedebug-ios-webkit-adapter](https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter) | 2.7k | — | 2021-03-03 | archived | **Rejected** | iOS WebKit debugging adapter, last push 2021 |
| [axemclion/browser-perf](https://github.com/axemclion/browser-perf) | 936 | bsd-2-clause | 2018-02-12 | stale | **Rejected** | Browser perf metrics, last push 2018 |
| [facebook/react](https://github.com/facebook/react) | 250.9k | MIT | 2026-10-09 | active | **Out-of-scope** | UI library. |
| [reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools) | 14.4k | MIT | 2026-10-11 | active | **Out-of-scope** | Framework devtools. |
| [vuejs/devtools](https://github.com/vuejs/devtools) | 2.9k | MIT | 2026-10-10 | active | **Out-of-scope** | Framework devtools. |
| [microsoft/vscode-js-debug](https://github.com/microsoft/vscode-js-debug) | 2.0k | MIT | 2026-10-08 | active | **Out-of-scope** | Debugger. |
| [microsoft/playwright-vscode](https://github.com/microsoft/playwright-vscode) | 489 | Apache-2.0 | 2026-10-08 | active | **Out-of-scope** | Editor integration. |

## Search / local indexing / metasearch

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [sqlite/sqlite](https://github.com/sqlite/sqlite) | 10.6k | NOASSERTION | 2026-10-11 | active | **Core** | Via node:sqlite (SQLite 3.53.4). |
| [searxng/searxng](https://github.com/searxng/searxng) | 38.2k | AGPL-3.0 | 2026-10-11 | active | **Optional** | AGPL-3.0 metasearch; supported as a user-configured provider URL (no code embedded). |
| [quickwit-oss/tantivy](https://github.com/quickwit-oss/tantivy) | 16.2k | MIT | 2026-10-11 | active | **Optional** | MIT Rust FTS; FTS5 already suffices. |
| [quickwit-oss/tantivy](https://github.com/quickwit-oss/tantivy) | 16.2k | MIT | 2026-10-11 | active | **Optional** | Rust full-text search library; FTS5 is enough for Pelorus history today |
| [MarginaliaSearch/MarginaliaSearch](https://github.com/MarginaliaSearch/MarginaliaSearch) | 2.2k | NOASSERTION | 2026-10-09 | active | **Optional** | Independent index of text-oriented sites; interesting provider for the search list |
| [mat-1/metasearch2](https://github.com/mat-1/metasearch2) | 172 | CC0-1.0 | 2026-09-01 | active | **Optional** | Small Rust metasearch engine; usable as a self-hosted custom search provider |
| [YaCy/yacy_search_server](https://github.com/YaCy/yacy_search_server) | 4.1k | NOASSERTION | 2026-09-23 | active | **Reference** | P2P search engine. |
| [MarginaliaSearch/MarginaliaSearch](https://github.com/MarginaliaSearch/MarginaliaSearch) | 2.2k | NOASSERTION | 2026-10-09 | active | **Reference** | Small-web search engine. |
| [Ahwxorg/LibreY](https://github.com/Ahwxorg/LibreY) | 323 | AGPL-3.0 | 2026-06-10 | slow | **Reference** | JS-free privacy metasearch; candidate custom search endpoint |
| [mat-1/metasearch2](https://github.com/mat-1/metasearch2) | 172 | CC0-1.0 | 2026-09-01 | active | **Reference** | Small metasearch (CC0). |
| [meilisearch/meilisearch](https://github.com/meilisearch/meilisearch) | 59.5k | NOASSERTION | 2026-10-08 | active | **Rejected** | Server with mixed licence. |
| [typesense/typesense](https://github.com/typesense/typesense) | 26.9k | GPL-3.0 | 2026-10-09 | active | **Rejected** | GPL server; not needed. |
| [benbusby/whoogle-search](https://github.com/benbusby/whoogle-search) | 11.6k | MIT | 2026-08-14 | archived | **Rejected** | Archived. |
| [benbusby/whoogle-search](https://github.com/benbusby/whoogle-search) | 11.6k | MIT | 2026-08-14 | archived | **Rejected** | Archived; was a self-hosted Google proxy |
| [WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 7.5k | MIT | 2026-08-10 | active | **Rejected** | Native build avoided by node:sqlite. |
| [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) | 9.2k | MIT | 2026-09-28 | active | **Out-of-scope** | Go binding. |
| [Ahmia/ahmia-site](https://github.com/Ahmia/ahmia-site) | 785 | BSD-3-Clause | 2026-10-08 | active | **Out-of-scope** | Onion search. |

## Accessibility / UX / media / misc

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [electron/packager](https://github.com/electron/packager) | 303 | BSD-2-Clause | 2026-10-10 | active | **Core** | Used by `npm run package` (BSD-2-Clause). |
| [electron-userland/electron-builder](https://github.com/electron-userland/electron-builder) | 14.7k | MIT | 2026-10-11 | active | **High-value** | MIT installer/auto-update builder; planned for 0.2. |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | 7.6k | MPL-2.0 | 2026-10-09 | active | **High-value** | MPL-2.0 accessibility engine — run it against every pelorus:// page in CI (roadmap 0.2). |
| [doyensec/electronegativity](https://github.com/doyensec/electronegativity) | 1.1k | Apache-2.0 | 2025-08-23 | stale | **High-value** | Apache-2.0 Electron security linter. Run in this sweep (with the correct `-e 44.7.0`): 3 medium findings, 1 real (dead `openExternal` helper, removed). Maintenance stopped 2023, so use as a supplement, not a gate. |
| [electron/forge](https://github.com/electron/forge) | 7.2k | MIT | 2026-10-10 | active | **Optional** | Alternative packaging toolchain. |
| [pa11y/pa11y](https://github.com/pa11y/pa11y) | 4.6k | LGPL-3.0 | 2026-09-28 | active | **Optional** | LGPL-3.0 a11y CLI. |
| [electron/fiddle](https://github.com/electron/fiddle) | 7.8k | MIT | 2026-10-09 | active | **Reference** | Electron playground. |
| [electron/asar](https://github.com/electron/asar) | 2.9k | MIT | 2026-10-10 | active | **Reference** | Archive format. |
| [nvaccess/nvda](https://github.com/nvaccess/nvda) | 2.7k | NOASSERTION | 2026-10-12 | active | **Reference** | Screen-reader test target (Windows). |
| [w3c/aria](https://github.com/w3c/aria) | 755 | NOASSERTION | 2026-10-09 | active | **Reference** | ARIA spec. |
| [sindresorhus/electron-store](https://github.com/sindresorhus/electron-store) | 5.0k | MIT | 2026-09-20 | active | **Rejected** | SQLite store used instead. |
| [GoogleChrome/accessibility-developer-tools](https://github.com/GoogleChrome/accessibility-developer-tools) | 2.3k | Apache-2.0 | 2022-10-04 | archived | **Rejected** | Archived. |
| [sindresorhus/electron-context-menu](https://github.com/sindresorhus/electron-context-menu) | 1.5k | MIT | 2026-09-20 | active | **Rejected** | Native context menus implemented. |
| [sindresorhus/electron-dl](https://github.com/sindresorhus/electron-dl) | 1.2k | MIT | 2026-09-20 | active | **Rejected** | Unneeded: native will-download used. |
| [sindresorhus/electron-debug](https://github.com/sindresorhus/electron-debug) | 778 | MIT | 2026-09-20 | active | **Out-of-scope** | Dev helper. |

## Mobile browsers (separate investigation)

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [kiwibrowser/src.next](https://github.com/kiwibrowser/src.next) | 4.0k | BSD-3-Clause | 2025-06-12 | stale | **Reference** | Chromium for Android with extensions; slow activity (2025-06). |
| [plateaukao/einkbro](https://github.com/plateaukao/einkbro) | 2.0k | other | 2026-10-11 | active | **Reference** | Android WebView browser tuned for e-ink (licence "other") |
| [minh-ton/reynard-browser](https://github.com/minh-ton/reynard-browser) | 1.8k | gpl-3.0 | 2026-10-12 | active | **Reference** | Experimental Gecko browser for iOS 13+ (GPL-3.0, active) - notable because third-party engines on iOS are rare |
| [FaFre/WebLibre](https://github.com/FaFre/WebLibre) | 1.0k | agpl-3.0 | 2026-10-11 | active | **Reference** | Android browser on Gecko (AGPL-3.0, active); containers/tabs focus |
| [Alex313031/Thorium-Android](https://github.com/Alex313031/Thorium-Android) | 794 | bsd-3-clause | 2026-10-11 | active | **Reference** | Thorium builds for Android |
| [mozilla/application-services](https://github.com/mozilla/application-services) | 675 | NOASSERTION | 2026-10-10 | active | **Reference** | Mozilla's shared sync/places Rust components. |
| [pichillilorenzo/flutter_browser_app](https://github.com/pichillilorenzo/flutter_browser_app) | 595 | apache-2.0 | 2024-10-25 | stale | **Reference** | Flutter browser app on InAppWebView (Apache-2.0); last push 2024-10 |
| [sk2andy/candy-browser](https://github.com/sk2andy/candy-browser) | 540 | mpl-2.0 | 2026-10-11 | active | **Reference** | Gesture-first Android browser with local privacy tools (MPL-2.0, active) |
| [arunkumar9t2/lynket-browser](https://github.com/arunkumar9t2/lynket-browser) | 532 | other | 2025-09-26 | stale | **Reference** | Android Custom Tabs browser |
| [BareBrowser/bare-browser](https://github.com/BareBrowser/bare-browser) | 449 | bsd-3-clause | 2026-09-11 | active | **Reference** | De-Googled Chromium for Android (BSD-3-Clause); patch-set ideas for the mobile investigation |
| [BrowserWorks/waterfox-android](https://github.com/BrowserWorks/waterfox-android) | 380 | other | 2026-09-22 | active | **Reference** | Waterfox for Android (licence field "other") |
| [REBEL-ROOT/omni-browser](https://github.com/REBEL-ROOT/omni-browser) | 375 | gpl-3.0 | 2026-10-01 | active | **Reference** | Android browser on Gecko (GPL-3.0) |
| [woheller69/browser](https://github.com/woheller69/browser) | 305 | gpl-3.0 | 2026-07-07 | active | **Reference** | Privacy-oriented Android browser with Greasemonkey-style scripts and cookie-banner blocker (GPL-3.0) |
| [prirai/nira-browser](https://github.com/prirai/nira-browser) | 209 | mpl-2.0 | 2026-10-09 | active | **Reference** | Android Gecko browser with profiles, PWAs and tab groups (MPL-2.0, active) |
| [torappinfo/uweb](https://github.com/torappinfo/uweb) | 110 | other | 2026-10-12 | active | **Reference** | "Suckless" minimal Android browser (licence "other", active) |
| [goastian/midori-android](https://github.com/goastian/midori-android) | 95 | mpl-2.0 | 2026-10-11 | active | **Reference** | Midori for Android (MPL-2.0, active) |
| [mozilla-mobile/fenix](https://github.com/mozilla-mobile/fenix) | 6.4k | MPL-2.0 | 2023-02-20 | archived | **Rejected** | Archived. |
| [mozilla-mobile/fenix](https://github.com/mozilla-mobile/fenix) | 6.4k | MPL-2.0 | 2023-02-20 | archived | **Rejected** | Archived; Firefox for Android now lives in mozilla-central |
| [JackyAndroid/AndroidChromium](https://github.com/JackyAndroid/AndroidChromium) | 3.1k | apache-2.0 | 2020-09-02 | stale | **Rejected** | Android Chromium source snapshot, last push 2020 |
| [kiwibrowser/src](https://github.com/kiwibrowser/src) | 3.0k | NOASSERTION | 2023-11-18 | archived | **Rejected** | Archived. |
| [mogoweb/chromium_webview](https://github.com/mogoweb/chromium_webview) | 526 | bsd-3-clause | 2015-11-24 | stale | **Rejected** | Android WebView wrapper, last push 2015 |
| [kuoruan/Chromium-Android](https://github.com/kuoruan/Chromium-Android) | 407 | — | 2019-04-08 | archived | **Rejected** | Android Chromium snapshot, last push 2019 |
| [guardianproject/OrWeb](https://github.com/guardianproject/OrWeb) | 96 | NOASSERTION | 2015-11-25 | archived | **Rejected** | Archived 2015. |
| [mengkunsoft/MkBrowser](https://github.com/mengkunsoft/MkBrowser) | 84 | — | 2020-06-15 | stale | **Rejected** | Simple Android browser, last push 2020 |
| [JTechMe/JumpGo-for-Android](https://github.com/JTechMe/JumpGo-for-Android) | 68 | mpl-2.0 | 2018-03-03 | stale | **Rejected** | No pushes since 2018 |
| [alandau/sweb](https://github.com/alandau/sweb) | 65 | — | 2025-02-21 | stale | **Rejected** | Simple Android browser, no licence, last push 2025-02 |
| [Mercandj/browser](https://github.com/Mercandj/browser) | 63 | — | 2019-10-27 | stale | **Rejected** | Kotlin Android browser, last push 2019 |
| [ricky9090/EasyBrowser](https://github.com/ricky9090/EasyBrowser) | 49 | — | 2022-02-01 | stale | **Rejected** | Teaching Android browser, last push 2022 |
| [VladThodo/behe-explorer](https://github.com/VladThodo/behe-explorer) | 49 | apache-2.0 | 2021-10-03 | stale | **Rejected** | Small Android browser, last push 2021 |
| [ghostery/user-agent-android](https://github.com/ghostery/user-agent-android) | 36 | mpl-2.0 | 2024-12-02 | archived | **Rejected** | Archived Ghostery Android browser; Ghostery now ships extensions and the adblocker library Pelorus uses |
| [TeamNewPipe/NewPipe](https://github.com/TeamNewPipe/NewPipe) | 40.1k | GPL-3.0 | 2026-10-11 | active | **Out-of-scope** | Android media client. |
| [apache/cordova](https://github.com/apache/cordova) | 712 | — | 2026-05-19 | slow | **Out-of-scope** | Hybrid mobile app framework |

## Web standards / protocols

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [chromium/badssl.com](https://github.com/chromium/badssl.com) | 3.1k | apache-2.0 | 2026-06-01 | slow | **High-value** | Test site for bad TLS configurations (Apache-2.0, active) - should back Pelorus certificate-error e2e tests |
| [publicsuffix/list](https://github.com/publicsuffix/list) | 3.0k | MPL-2.0 | 2026-10-07 | active | **High-value** | MPL-2.0 Public Suffix List (consumed through tldts in our dependency tree). |
| [w3c/webextensions](https://github.com/w3c/webextensions) | 712 | NOASSERTION | 2026-10-08 | active | **High-value** | WECG: the cross-browser extension specification; required reading before any extension work. |
| [curl/curl](https://github.com/curl/curl) | 43.2k | NOASSERTION | 2026-10-11 | active | **Reference** | Network library. |
| [openssl/openssl](https://github.com/openssl/openssl) | 30.9k | Apache-2.0 | 2026-10-11 | active | **Reference** | TLS. |
| [tc39/ecma262](https://github.com/tc39/ecma262) | 15.7k | NOASSERTION | 2026-10-09 | active | **Reference** | Spec. |
| [cloudflare/quiche](https://github.com/cloudflare/quiche) | 12.8k | BSD-2-Clause | 2026-10-09 | active | **Reference** | QUIC (Rust). |
| [whatwg/html](https://github.com/whatwg/html) | 9.4k | NOASSERTION | 2026-10-10 | active | **Reference** | Spec. |
| [rustls/rustls](https://github.com/rustls/rustls) | 7.7k | NOASSERTION | 2026-10-11 | active | **Reference** | TLS (Rust). |
| [dhamaniasad/HeadlessBrowsers](https://github.com/dhamaniasad/HeadlessBrowsers) | 6.7k | cc0-1.0 | 2025-10-12 | slow | **Reference** | Curated list of headless browsers (CC0); used as a cross-check source in SWEEP.md |
| [w3c/csswg-drafts](https://github.com/w3c/csswg-drafts) | 4.9k | NOASSERTION | 2026-10-10 | active | **Reference** | Specs. |
| [google/boringssl](https://github.com/google/boringssl) | 2.3k | Apache-2.0 | 2026-10-11 | active | **Reference** | TLS in Chromium. |
| [whatwg/fetch](https://github.com/whatwg/fetch) | 2.3k | NOASSERTION | 2026-10-06 | active | **Reference** | Spec. |
| [mozilla/neqo](https://github.com/mozilla/neqo) | 2.2k | Apache-2.0 | 2026-10-12 | active | **Reference** | Firefox QUIC. |
| [whatwg/dom](https://github.com/whatwg/dom) | 1.7k | NOASSERTION | 2026-10-09 | active | **Reference** | Spec. |
| [quicwg/base-drafts](https://github.com/quicwg/base-drafts) | 1.7k | — | 2026-06-14 | active | **Reference** | QUIC specs. |
| [ngtcp2/ngtcp2](https://github.com/ngtcp2/ngtcp2) | 1.5k | MIT | 2026-10-11 | active | **Reference** | QUIC. |
| [aws/s2n-quic](https://github.com/aws/s2n-quic) | 1.4k | Apache-2.0 | 2026-10-09 | active | **Reference** | QUIC (Rust). |
| [chromium/hstspreload.org](https://github.com/chromium/hstspreload.org) | 876 | bsd-3-clause | 2026-09-02 | active | **Reference** | HSTS preload list submission site; the preload list is relevant to HTTPS-first |
| [w3c/webappsec](https://github.com/w3c/webappsec) | 675 | NOASSERTION | 2026-06-10 | slow | **Reference** | Security specs. |
| [whatwg/url](https://github.com/whatwg/url) | 630 | NOASSERTION | 2026-10-07 | active | **Reference** | URL Standard — our URL handling follows it via the WHATWG URL class. |
| [nerdyslacker/desktop-web-browsers](https://github.com/nerdyslacker/desktop-web-browsers) | 617 | — | 2026-09-13 | active | **Reference** | Curated list of desktop browsers; used as a cross-check source in SWEEP.md |
| [WebKit/standards-positions](https://github.com/WebKit/standards-positions) | 334 | — | 2026-10-11 | active | **Reference** | WebKit positions on emerging specs, for compatibility planning |
| [WICG/proposals](https://github.com/WICG/proposals) | 300 | NOASSERTION | 2024-05-07 | stale | **Reference** | Incubations. |
| [w3c/webappsec-csp](https://github.com/w3c/webappsec-csp) | 225 | NOASSERTION | 2026-09-16 | active | **Reference** | CSP spec. |
| [w3c/web-annotation](https://github.com/w3c/web-annotation) | 156 | NOASSERTION | 2017-05-04 | stale | **Reference** | Annotation data model (planned annotations feature). |
| [mozilla/firefox-browser-architecture](https://github.com/mozilla/firefox-browser-architecture) | 134 | mpl-2.0 | 2019-04-08 | archived | **Reference** | Archived Mozilla architecture proposals (2019); background reading |
| [w3c/permissions](https://github.com/w3c/permissions) | 106 | NOASSERTION | 2026-10-06 | active | **Reference** | Permissions API spec (informs our broker). |
| [cliffordfajardo/awesome-web-browsers](https://github.com/cliffordfajardo/awesome-web-browsers) | 91 | mit | 2023-08-22 | stale | **Reference** | Curated list of browsers (MIT); not updated since 2023-08 |
| [webcompat/browser-compat-bugs](https://github.com/webcompat/browser-compat-bugs) | 25 | — | 2022-10-25 | archived | **Reference** | Archived interop bug reports |
| [alrra/browser-logos](https://github.com/alrra/browser-logos) | 6.0k | mit | 2025-10-13 | slow | **Out-of-scope** | Logo asset collection |

## Decentralised / alt-protocol

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [ipfs/kubo](https://github.com/ipfs/kubo) | 17.1k | NOASSERTION | 2026-10-01 | active | **Optional** | IPFS node. |
| [ipfs/ipfs-companion](https://github.com/ipfs/ipfs-companion) | 2.2k | CC0-1.0 | 2026-10-01 | active | **Optional** | CC0 extension adding ipfs:// support. |
| [ipfs/ipfs-desktop](https://github.com/ipfs/ipfs-desktop) | 6.6k | MIT | 2026-10-01 | active | **Reference** | IPFS desktop app. |
| [i2p/i2p.i2p](https://github.com/i2p/i2p.i2p) | 2.7k | NOASSERTION | 2026-10-09 | active | **Reference** | I2P router. |
| [skyjake/lagrange](https://github.com/skyjake/lagrange) | 1.5k | BSD-2-Clause | 2026-10-02 | active | **Reference** | Gemini client (BSD-2-Clause). |
| [makew0rld/amfora](https://github.com/makew0rld/amfora) | 1.4k | GPL-3.0 | 2026-10-01 | active | **Reference** | Gemini client (GPL-3.0). |
| [AgregoreWeb/agregore-browser](https://github.com/AgregoreWeb/agregore-browser) | 925 | AGPL-3.0 | 2026-07-13 | active | **Reference** | Electron browser for the distributed web: IPFS, Hypercore, BitTorrent (AGPL-3.0, active); closest "alt-protocol Electron" prior art |
| [ikskuh/kristall](https://github.com/ikskuh/kristall) | 799 | gpl-3.0 | 2026-09-08 | active | **Reference** | Qt GUI client for Gemini/Gopher/Finger; active; protocol-handler prior art |
| [ipfs/in-web-browsers](https://github.com/ipfs/in-web-browsers) | 357 | mit | 2026-08-18 | active | **Reference** | Tracks IPFS support in browsers |
| [jansc/ncgopher](https://github.com/jansc/ncgopher) | 231 | other | 2026-06-11 | slow | **Reference** | Gopher + Gemini TUI client |
| [xvxx/phetch](https://github.com/xvxx/phetch) | 197 | mit | 2023-06-21 | stale | **Reference** | Gopher TUI client (stale since 2023) |
| [p2plabsxyz/peersky-browser](https://github.com/p2plabsxyz/peersky-browser) | 88 | MIT | 2026-10-11 | active | **Reference** | Local-first P2P browser (MIT, active) |
| [umutcamliyurt/I2P-Browser](https://github.com/umutcamliyurt/I2P-Browser) | 28 | mit | 2026-05-21 | slow | **Reference** | Browser for I2P (MIT) |
| [ipfs/js-ipfs](https://github.com/ipfs/js-ipfs) | 7.4k | NOASSERTION | 2023-05-25 | archived | **Rejected** | Archived. |
| [MozillaReality/FirefoxReality](https://github.com/MozillaReality/FirefoxReality) | 772 | MPL-2.0 | 2023-12-28 | archived | **Rejected** | Archived VR browser. |
| [jankammerath/gophie](https://github.com/jankammerath/gophie) | 229 | gpl-3.0 | 2023-12-18 | stale | **Rejected** | Gopher GUI client; no pushes since 2023-12, redundant with Kristall |
| [dBrowser/dbrowser](https://github.com/dBrowser/dbrowser) | 9 | NOASSERTION | 2022-10-04 | stale | **Rejected** | Web3 browser (IPFS/SSB/Hypercore), no pushes since 2022-10 |
| [holepunchto/hyperbeam](https://github.com/holepunchto/hyperbeam) | 544 | MIT | 2025-04-29 | stale | **Out-of-scope** | E2E-encrypted pipe over Hyperswarm; a building block for sync transports, no browser role |

## Anti-detect / stealth browsers (excluded by policy)

| Project | ★ | Licence | Last push | Activity | Class | Note |
|---|---|---|---|---|---|---|
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | 32.1k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | 11.5k | mit | 2026-10-07 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [Virtual-Browser/VirtualBrowser](https://github.com/Virtual-Browser/VirtualBrowser) | 3.2k | bsd-3-clause | 2026-07-30 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [feder-cr/invisible_playwright](https://github.com/feder-cr/invisible_playwright) | 3.1k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [feder-cr/invisible_selenium](https://github.com/feder-cr/invisible_selenium) | 2.8k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [feder-cr/invisible_playwright_mcp](https://github.com/feder-cr/invisible_playwright_mcp) | 2.7k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [botswin/BotBrowser](https://github.com/botswin/BotBrowser) | 2.6k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [saifyxpro/HeadlessX](https://github.com/saifyxpro/HeadlessX) | 2.3k | other | 2026-10-04 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [AffPapa/neantik](https://github.com/AffPapa/neantik) | 1.5k | mpl-2.0 | 2026-10-12 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [feder-cr/invisible_puppeteer](https://github.com/feder-cr/invisible_puppeteer) | 1.4k | mit | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [sardanioss/httpcloak](https://github.com/sardanioss/httpcloak) | 1.3k | mit | 2026-09-02 | active | **Rejected** | Go HTTP client that imitates browser TLS/HTTP2 fingerprints to bypass bot detection (per description) |
| [ProxyShard/ShardBrowser](https://github.com/ProxyShard/ShardBrowser) | 1.2k | mit | 2026-09-13 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [CloakHQ/CloakBrowser-Manager](https://github.com/CloakHQ/CloakBrowser-Manager) | 978 | other | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [ovobrowsersupport/ovobrowser](https://github.com/ovobrowsersupport/ovobrowser) | 881 | mit | 2026-08-27 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [sheying2013/OpenBrowser](https://github.com/sheying2013/OpenBrowser) | 753 | mit | 2026-10-09 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [tiliondev/fortress](https://github.com/tiliondev/fortress) | 748 | other | 2026-10-05 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [DFarm6/Prism-Browser-Community](https://github.com/DFarm6/Prism-Browser-Community) | 676 | mit | 2026-10-03 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [xiaozhou26/Chromix](https://github.com/xiaozhou26/Chromix) | 437 | bsd-3-clause | 2026-10-12 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [kameleo-io/kameleo](https://github.com/kameleo-io/kameleo) | 212 | — | 2026-10-05 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [rayobyte-data/rayobrowse](https://github.com/rayobyte-data/rayobrowse) | 211 | mit | 2026-07-05 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [clearcotelabs/clearcote-browser](https://github.com/clearcotelabs/clearcote-browser) | 199 | bsd-3-clause | 2026-10-11 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [multizenteam/multizen-browser](https://github.com/multizenteam/multizen-browser) | 195 | mit | 2026-10-09 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |
| [arman-bd/chromiumfish](https://github.com/arman-bd/chromiumfish) | 163 | other | 2026-08-19 | active | **Rejected** | Built to defeat bot detection / spoof fingerprints per its description. Pelorus does not do detection evasion; catalogued for completeness only |

## Names that GitHub could not find (89 first-pass misses)

The first-pass seed list contained 89 names that returned 404. Most were my own wrong guesses at an owner/repo spelling. **None of them is claimed to exist.** I retried 30 corrected spellings for the ones that are real projects (docs/research/resolve-notfound-verified.tsv): 29 resolved and are in the tables above; `Hyperbrowser/hyperbrowser` is still not found. The topic check (see SWEEP.md) then found the real homes of Fen (FENBROWSER/fenbrowser), Starling (starling-browser/starling), Hastur (robinlinden/hastur), Nordstjernen (nordstjernen-web/nordstjernen-browser) and dillo-plus (crossbowerbt/dillo-plus); they are in the tables above.

First-pass misses, for the record:

`versotile/verso` · `fen-browser/Fen` · `sanwuyu/starling` · `nordstjernen/nordstjernen-browser` · `iridiumbrowser/iridium-browser` · `nicolo-ribaudo/chromium-with-patches` · `nicedoc/chromium-browser` · `vivaldi/vivaldi-bundle` · `CefGlue/CefGlue` · `mdsrosa/chromiumoxide` · `librewolf-community/browser` · `LibreWolf/librewolf` · `Divested-Mobile/Mull-fdroid` · `mercury-browser/mercury` · `nickvdyck/geckoview` · `tpo/applications/tor-browser` · `torproject/arti` · `Pale-Moon-Browser/Pale-Moon` · `MoonchildProductions/UXP` · `kuhhh/mypal68` · `bluetech/surf` · `nicolas-ptn/surf` · `tpm-org/surf` · `DavidWood-gh/vimb` · `nyxt/nyxt` · `WebKitGTK/WebKitGTK` · `cogwheel/cog` · `Igalia/wpewebkit` · `nicksherron/w3m` · `dillo-plus/dillo-plus` · `nicolasstrobbe/links` · `NetSurf/netsurf` · `beakerbrowser/hyperbeam` · `guardianproject/fennec` · `scopely/lightning` · `nicodemus/mycel` · `mycel/mycel` · `getferdi/ferdi` · `nicedoc/electron-browser` · `nicolo/saucer` · `sciter-sdk/sciter-js-sdk` · `cordova/cordova` · `electrobun/electrobun` · `nicbarker/electrobun` · `EFForg/cookieblocker` · `Rob--W/clearurls` · `nobody42/localcdn` · `OhMyGuus/I-Don-t-Care-About-Cookies` · `nicedoc/camoufox` · `nicedoc/fingerprint-chromium` · `Jelmerro/nativefier-extensions` · `Tab-Session-Manager/Tab-Session-Manager` · `shiori-dev/shiori` · `whisper/whisper.cpp` · `hyperbrowserai/hyperbrowser` · `Jarvis-Browser/jarvis` · `thirtyfour/thirtyfour` · `mozilla/mozperftest` · `mozilla/talos` · `speedometer/speedometer` · `GoogleChromeLabs/jetstream` · `nicedoc/jetstream` · `passkeys-dev/passkeys.dev` · `debugger-for-chrome/vscode-chrome-debug` · `nicbarker/tantivy` · `nicedoc/sqlite` · `edgesearch/edgesearch` · `whoogle-search/whoogle-search` · `LibreY-Org/LibreY` · `Metasearch2/metasearch2` · `marginalia-search/marginalia-search` · `orcaprojectgnome/orca` · `mozilla/gecko-accessibility` · `nicedoc/aria` · `electron/security` · `brave/brave-android` · `tuta/tutanota` · `vivaldi/vivaldi-android` · `nicedoc/android-browser` · `Mozilla-Fenix/fenix` · `cloudflare/boringtls` · `nicedoc/publicsuffix` · `nicedoc/gemini` · `kensanata/offpunk` · `solderpunk/AV-98` · `gopherus/gopherus` · `Anonymous-Gopher/gopher` · `mozilla/mozilla-reality` · `nicedoc/firefoxreality`

### Real projects not hosted on GitHub (confirmed from their own sites, not via the API)

Pale Moon (palemoon.org), NetSurf (netsurf-browser.org), LibreWolf (librewolf.dev), Dooble, Tor Browser and Arti (gitlab.torproject.org), suckless surf (surf.suckless.org), Verso (gitlab.com/verso-browser/verso; the GitHub copy is an archived mirror). Their licence/activity details were read from those sites during the research session and are recorded in [LEDGER.md](LEDGER.md); they are not re-verified by this script.
