# Accessibility — what is tested, what is not, and how to test it by hand

## Automated (runs in CI on every push) — `test/e2e/a11y.test.js`
- **axe-core 4.14.0** scan, serious/critical violations fail the build, for: the new-tab page, the six internal pages (history, bookmarks, downloads, privacy, settings, about), the browser chrome (tab strip, toolbar), and the overlay surfaces (command palette, address-bar suggestions, find bar). Dark **and** light theme. The latest result is `docs/benchmarks/a11y-axe-latest.json` (moderate/minor findings are recorded there, not failed).
- **Accessibility tree assertions** on the browser chrome (what a screen reader is given): a tab list named "Open tabs", every tab named and exactly one selected, the address box exposed as a named combobox, every button named, a named "Workspaces" group with pressed states.
- **Keyboard reachability:** Tab visits several distinct controls from the address box.

Real defects these found and that were fixed: a button nested in a tab, a tab list containing a non-tab, visible text missing from accessible names, an unnamed suggestions list, and tertiary text that missed 4.5:1 contrast in the palette (light and dark themes).

## NOT tested — and why
- **No real screen reader has been run against Nadir.** NVDA or Narrator output cannot be observed from the automation available here, and installing a screen reader on the development machine was not done. Automated tools find only a fraction of real problems (commonly cited as under half). **Do not describe Nadir as "accessible" or "screen-reader tested".**
- Not covered by assertions: the permission prompt and text-prompt overlays, native context menus and dialogs, focus order across the overlay/shell/page boundary, high-contrast mode, 200% zoom and reflow, reduced-motion behaviour, speech-input (voice control) label matching beyond what axe's label-in-name rule checks.
- Web content is the site's responsibility; this document covers Nadir's own UI.

## Manual test plan (for someone with NVDA or Windows Narrator)
Setup: `npm start` (or the installer), NVDA (free, GPL) or Narrator (Win+Ctrl+Enter), a fresh profile. Test in both light and dark theme. Record: pass / fail / notes + screen-reader name and version.

| # | Task | Expected |
|---|---|---|
| 1 | Start Nadir; with the screen reader running, find the address box without the mouse | Announced as "Search or enter address, combo box"; reachable with Ctrl+L |
| 2 | Type `nadir`, listen while suggestions appear | A suggestions list is announced (name "Suggestions"); arrow keys announce each row; Enter opens it |
| 3 | Open the command palette (Ctrl+K) and run "Open settings" | Palette announced as a dialog/list; the selected row is announced as it changes; focus returns sensibly |
| 4 | Move to the tab strip, switch tabs with arrow keys, close one with Delete | Each tab announced with its title and "selected"/"not selected"; close announced or at least not lost |
| 5 | Switch workspaces from the switcher | Buttons announced with name and pressed state; the change in tabs is perceivable |
| 6 | Visit a page that requests location, then answer the permission prompt with the keyboard | Prompt is announced when it appears; Block/Allow reachable and operable; focus lands on a safe default |
| 7 | Download a file (any link), open the Downloads page | Progress and finished state announced or discoverable; risky-file warning is perceivable |
| 8 | Open each internal page (History, Bookmarks, Downloads, Privacy, Settings, About) | One heading outline, controls named, tables read with headers, no keyboard traps |
| 9 | Use Find in page (Ctrl+F), type a word, press Enter | Field named; match feedback available |
| 10 | Press Tab repeatedly through the whole window and back with Shift+Tab | Visible focus indicator on every stop, logical order, no trap, no skipped control |
| 11 | Zoom the UI to 200% (Ctrl+Plus) and enable Windows high-contrast | UI remains usable, no clipped controls, borders still visible |

File findings as GitHub issues with the label `accessibility`; include the screen reader, version, steps and what was announced.
