# Nadir — Design System

## Identity

- **Name:** *Nadir* — the lowest point beneath you; the ground under everything else. A browser that is a quiet foundation rather than a feed.
- **Name check (2026-10-11):** no browser project named "Nadir" in GitHub search; `nadir-browser` and `@nadir/browser` are unclaimed on npm (bare `nadir` is an unrelated npm package). **This is not a trademark clearance.** Run USPTO / EUIPO / WIPO searches before any public release.
- **Mark:** an inverted triangle (the nadir, pointing down) cut by a single horizontal line (the horizon). One stroke weight, no fill, works at 16 px and in one colour.
- **Voice:** plain, specific, never alarmist. Errors say what happened and what to do next.

## Principles

1. **Chrome recedes, content leads.** The page sits on a rounded card; the chrome is one flat surface.
2. **Every control does something.** No decorative buttons, no fake status.
3. **Local by default, honest about limits.** Settings explain trade-offs (e.g. "tabs that sleep lose scroll position").
4. **Safe choice is the default focus.** Permission prompts focus *Block*; certificate errors offer no bypass.
5. **Keyboard first.** Everything reachable from the palette (Ctrl+K) or a shortcut; roving arrow-key tab list.
6. **Motion is rare and short.** Only the loading spinner and switch toggles animate; all motion is disabled under `prefers-reduced-motion`.

## Tokens (`src/ui/assets/tokens.css`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg-0` | `#101114` | `#ecebe7` | window, sidebar, toolbar |
| `--bg-1` | `#17181d` | `#f7f6f3` | popovers, pages |
| `--bg-2` | `#1f2128` | `#ffffff` | fields, hover |
| `--bg-3` | `#292c35` | `#e1dfd9` | active/pressed |
| `--fg` / `--fg-2` / `--fg-3` | `#e7e9ee` / `#a2a8b4` / `#8a919d` | `#1c1e23` / `#4d5460` / `#5f6672` | text (primary / secondary / hint) |
| `--accent` | `#8bd3a8` | `#2f7d5b` | selection, focus, primary action — the **only** accent colour |
| `--danger` / `--warn` | `#ee8d84` / `#e5c07b` | `#b3392f` / `#8a6410` | blocking actions / insecure |

No gradients, no blur or glass. Elevation is a 1 px border plus one shadow.

**Typography:** system UI stack (Segoe UI Variable → system-ui) at 13 px / 1.45; `Cascadia Mono`/`SF Mono` for URLs, keys and technical values. No web fonts are bundled, so first paint never waits on a font and the UI is fully offline.

**Shape & spacing:** radii 6 / 8 / 12 px; 4 px spacing grid; rows 34 px (tabs), 38–40 px (lists); toolbar 44 px; sidebar 252 px (56 px collapsed).

## Surfaces

| Surface | Implementation | Notes |
|---|---|---|
| Browser chrome | `nadir://shell` | vertical tabs + workspace chips; native window controls via title-bar overlay |
| Address bar | shell input + overlay dropdown | suggestions are **local only**; "Not secure" label for http |
| Vertical tabs | implemented | **Horizontal tabs: not implemented** (planned) |
| Workspaces / groups | workspaces implemented (isolated storage) | tab *groups* inside a workspace: planned |
| Command palette | overlay | tabs, history, bookmarks, workspaces, commands, "go to URL", web search |
| Split view | implemented (two panes) | resizable divider planned |
| Bookmarks / history / downloads / privacy / settings / about | `nadir://app` | one page, hash-routed |
| Permission prompts | overlay card | per-workspace remember; private tabs never remember |
| Context menus | native (Electron `Menu`) | OS-themed by design — keeps them above web content and accessible |
| AI panel, extension manager | **not built** | see roadmap |

## Accessibility (implemented, not yet audited)

Landmarks and roles (`tablist`/`tab`, `combobox`/`listbox`/`option`, `dialog`/`alertdialog`, `aria-live` regions), visible `:focus-visible` rings, `aria-pressed` toggles, roving arrow-key navigation in the tab list, contrast-checked text tokens, `prefers-reduced-motion` and `forced-colors` handling, system theme following. **Not yet done:** a screen-reader pass (NVDA/Narrator), automated axe run on `nadir://` pages, high-contrast theme review, text-scaling test at 200 %.
