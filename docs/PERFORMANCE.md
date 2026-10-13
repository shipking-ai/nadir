# Performance — targets, method, measured results

Raw data: [run 1](benchmarks/results-2026-10-12-run1.json), [run 2](benchmarks/results-2026-10-12-run2.json) · Reproduce: `node scripts/bench.js --tabs 10 --runs 3`

## Targets (PROPOSED — set before measuring)

| Metric | Proposed target |
|---|---|
| Cold start to usable first tab | ≤ 1.0 s on the reference machine |
| Warm start / session restore (11 tabs) | ≤ 1.0 s, only the active tab loaded |
| Idle memory, 1 tab | within ±10 % of Chrome on the same machine |
| Memory, 11 loaded tabs | ≤ 1.2× Chrome |
| Memory after sleeping inactive tabs | ≤ 1.3× the 1-tab figure |
| Idle CPU with 11 loaded tabs | ≤ Chrome |
| Tab switch (IPC + layout) | p95 < 16 ms |
| Address-bar suggestions, 5,000 history rows | p95 < 20 ms |
| AI feature latency, extension overhead, background network | **not measurable yet** (features not built) |

## Method

- **Machine:** Intel i9-10980HK (8c/16t), 31.9 GB RAM, Windows 11 (10.0.26300), RTX 2080 Super Max-Q. One machine, one OS; a normal desktop was running, so absolute numbers carry noise (see the Chrome idle-CPU figure in run 2).
- **Subjects:** Pelorus 0.1.0 (Electron 44.7.0 / Chromium 152.0.7977.130, run from source with the real window shown) vs. Google Chrome **154.0.8037.98** installed on the machine, fresh profile, `--no-first-run`, sync disabled.
- **Workload:** a local HTTP server serving 10 distinct ~60 KB text pages (`/p/0`…`/p/9`) plus the browser's blank/new-tab page → "11 tabs". All pages are the **same origin**.
- **How each browser is driven (this matters a lot, see the correction below):** Chrome is started with a debug port and tabs are opened with HTTP `/json/new`; no client attaches to the pages. Pelorus is started the same way (`--remote-debugging-port`, no test hook) and a client attaches **only to the browser's own shell page** to open tabs and read state; it never attaches to a tab renderer (`launchPlain` in `scripts/bench.js`).
- **Memory & CPU:** for both browsers, the same PowerShell script (`scripts/proctree.ps1`) walks the process tree from the launched root PID and sums `PrivateMemorySize64`, `WorkingSet64` and per-process CPU time. Idle CPU is the delta over 10 s computed only for processes present in both samples.
- Pelorus was started with the real filter lists loaded from its disk cache, 5,000 seeded history rows and a visible window. 3 cold launches per run for the 1-tab figures; the many-tab, latency and CPU measurements ran once per run. **Two complete runs** are reported.

## Correction: the first benchmark was biased against Pelorus

The first version of this document reported **912 MB vs Chrome's 629 MB (≈ 1.45×, target missed)** and offered an untested hypothesis that Pelorus's per-tab renderer processes were to blame. That hypothesis was **wrong**.

Investigating showed that Playwright's Electron driver, which the first benchmark used, attaches to every tab renderer. While it is attached, *background tabs report `document.visibilityState === "visible"`, run `requestAnimationFrame` at the full 60 Hz and timers unthrottled, and keep their GPU compositor surfaces* (the GPU process grew about 31 MB per tab). Driven without attaching to tab renderers, the same Pelorus uses far less. The test harness, not the browser, inflated the figure. The earlier statement that the Playwright overhead was "small" was also wrong.

The e2e tests still use Playwright (fine for functional tests), but **no memory or CPU number should be taken from them**.

## Results (measured, two runs)

| Metric | Pelorus run 1 | Pelorus run 2 | Chrome 154 run 1 | Chrome run 2 | Notes |
|---|---|---|---|---|---|
| Start → first tab ready (3 launches) | 765 / 689 / 614 ms | 791 / 774 / 728 ms | 680 ms | 750 ms | **Not the same milestone.** Pelorus = process start until the shell reports the new-tab page loaded (polled every 50 ms over CDP); Chrome = debug port answers. Same order of magnitude only. |
| Processes, 1 tab | 6 | 6 | 10 | 10 | |
| Private memory, 1 tab | 322 / 317 / 313 MB | 322 / 414 / 321 MB | 321 MB | 351 MB | parity (one Pelorus launch in run 2 was an outlier at 414 MB) |
| Processes, 11 tabs | 16 | 16 | 22 | 23 | |
| **Private memory, 11 tabs** | **695 MB** | **710 MB** | **628 MB** | **766 MB** | ratio **1.11×** (run 1) and **0.93×** (run 2): the ≤ 1.2× target is met in both, subject to the noise caveat below |
| Working set, 11 tabs | 1,531 MB | 1,528 MB | 1,228 MB | 1,436 MB | Pelorus's working set is higher in both runs; the target uses private bytes |
| Approx. private cost per extra tab | ≈ 37 MB | ≈ 39 MB | ≈ 31 MB | ≈ 41 MB | derived: (11-tab − 1-tab) / 10 |
| Private memory after sleeping the 10 web tabs | 446 MB | 409 MB | n/a | n/a | 1.4× / 1.3× the 1-tab figure: the ≤ 1.3× target is met in run 2 and missed in run 1 |
| Idle CPU, 11 tabs (10 s, % of one core) | 4.19 % | 0.27 % | 4.57 % | 47.95 % | very noisy; Chrome's 48 % in run 2 means something else was active on the machine. Not a reliable comparison. |
| Tab switch round trip (IPC + layout, not paint) | p50 6.4 / p95 16.3 ms | p50 4.4 / p95 6.1 ms | not measured | | 40 switches. Run 1 misses the p95 < 16 ms target by 0.3 ms; run 2 meets it. Slower than the first (biased) measurement because background tabs now really hide and show. |
| Suggestions, 5,000 history rows | p50 2.2 / p95 2.9 ms | p50 2.0 / p95 3.4 ms | not measured | | 50 queries; target met |
| Session restore, 11 tabs | 644 ms, 1 of 11 loaded | 737 ms, 1 of 11 loaded | not measured | | lazy restore working; target ≤ 1.0 s met |

## What the numbers do and do not say

- With a fair method, Pelorus's 11-tab memory is **roughly Chrome's, within this test's noise** (0.93×–1.11× in two samples). Two samples cannot support "equal to Chrome"; they only show that the earlier 1.45× was an artefact.
- **Same-origin pages are a deliberately simple workload.** No JavaScript-heavy sites, video or ad networks; real browsing differs in both browsers. Chrome can share renderer processes between same-site tabs; a mixed-site workload could move the ratio either way.
- **Idle CPU is not trustworthy** from these runs (0.27 % vs 4.19 % for the same build). A quiet-machine repeat with at least 5 samples is needed before any claim.
- Chrome's cumulative CPU seconds are not compared (first-run work, different process lifetimes).
- **Not measured:** Speedometer/JetStream/MotionMark (they would measure Chromium, which both share), shutdown time, background network, keyboard-to-paint latency, AI and extension overhead, battery.
- One machine, no confidence intervals. Do not quote these as general claims.

## Next steps

1. Mixed-site workload (10 different origins, one video, one heavy SPA) for both browsers; at least 5 repeats with confidence intervals; quiet machine.
2. ~~Verify background-tab throttling without automation attached~~ Done: `test/e2e/background.test.js` (pages report their own rAF count to a local server). Un-attached, a background tab is `hidden` and renders 0 frames per second while the foreground tab renders 60.
3. Add an automated regression check (`bench.js --assert`) with thresholds from the targets table.
4. Measure shutdown, background network (packet capture), and keyboard-to-render latency with a high-speed method.
