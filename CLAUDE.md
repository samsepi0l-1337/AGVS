# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

Static Korean corporate marketing site for "AGVS" (Automated Guided Vehicle
System). No framework, no jQuery — plain HTML/CSS and TypeScript compiled to
browser-native ES modules. PHP renders the pages at **build time** only: what
GitHub Pages serves is pure HTML/CSS/JS, so a visitor never executes PHP. Local
development still needs a PHP-capable server.

**Everything that is source lives under `src/`**, which doubles as the `php -S`
document root:

```
src/
  *.php                    entry pages (index, DetailList, view, Overview,
                           Video, VideoView, Archive, Sitemap, download)
  includes/core/*.php      lang, contentStore, db, adminCore
  includes/layout/*.html   header, footer, contactPop
  admin/                   admin UI (PHP)
  api/                     Express admin API (TypeScript)
  scripts/**/*.ts          browser sources: core, layout, home, detail, main.ts
  assets/css/{base,layout,pages}/*.css
  assets/js/               tsc output — generated, gitignored
  assets/img/  assets/video/
```

`data/` (SQLite + JSON seeds), `storage/` (uploads), `scripts/` (build tooling)
and `.github/` stay at the repo root because they are not source.

The design is fluid with `width: 100%` and `max-width: 1920px` wrappers; inner
widths use percentages derived from the original 1920px pixel values. Font sizes
use `clamp()` with 1920px as the maximum, preserving the original design at that
viewport. Four breakpoints handle smaller screens: 1279.98px (footer nav wraps),
1199.98px, 991.98px (hamburger menu, card grid steps down), and 767.98px
(single-column, stacked footer). A few widths stay in pixels — GNB submenu,
search input, and Contact button sit in non-proportional containers, so literal
percentages there would break the 1920px baseline. **1920px parity is the
standing acceptance criterion:** measured values at a 1920px viewport must not
change.

The GNB and section-scroll behavior deliberately imitate
**<https://www.mrlxzin.com/html/00_main/>** (which uses jQuery + fullPage.js);
this project reimplements the same behavior in vanilla JS. That site is the
design reference for layout questions — its TLS certificate is expired, so fetch
it with `curl -k`.

## Running and verifying

There is no lint or test command. Serve **`src/` with PHP** — the document root
is `src`, not the repo root:

```bash
export PATH="/opt/homebrew/bin:$PATH"
pnpm run build:js          # compile src/scripts -> src/assets/js first
php -S localhost:8848 -t src
# http://localhost:8848/index.php  ·  http://localhost:8848/DetailList.php
```

`build:js` is not optional: `src/assets/js/` is generated and gitignored, so on
a fresh checkout the pages load nothing until tsc has run. Use
`pnpm run scripts:watch` while editing TypeScript.

`python3 -m http.server` will **not** work — it does not execute PHP, so the
`include` statements render as nothing and the header and footer silently vanish
from every page. That failure looks like a CSS bug, not a server bug.
Sanity-check a served page with `curl -s … | grep -c '<?php'` — the answer must
be 0.

The full pipeline is `pnpm run build` (`build:js` → `build:static` → `format`).
`build:static` renders KR to `_site/*.html`, EN to `_site/en/`, JP to
`_site/jp/`, copies `src/assets` to `_site/assets`, and fails loudly on
unexecuted PHP, a missing header/footer, a leftover site-relative `.php` link,
or a catalog image that is missing, empty, mis-cased or not a real JPEG.

Verification means **measuring in a real browser** (Chrome DevTools MCP) — read
computed styles and geometry via `evaluate_script` rather than judging from
screenshots. Two traps:

- A synthetic `MouseEvent('mouseenter')` fires the JS handlers but does **not**
  activate CSS `:hover`. Testing hover styling requires moving a real pointer
  (the `hover` tool). Conversely, a synthetic `mouseleave` does not clear a real
  `:hover` — park the real cursor off-header before reading unhovered colors.
- Smooth scrolling takes ~1s; waits shorter than ~1.2s produce false failures.

## Cache busting — required after every CSS/JS edit

The pages link assets with a `?ver=YYYYMMDD<letter>` query string. Browsers
cache these files aggressively and **edits silently do not apply until the
version is bumped**. Bump every reference across all pages at once:

```bash
perl -pi -e 's/ver=20260804b/ver=20260804c/g' src/*.php
```

**Known gap:** only the entry module carries `?ver=`. The modules it imports
(`./home/sectionSnap.js` and friends) are fetched by the browser at their bare
paths, so bumping the entry does not bust them. This bites local development
only — a hard reload clears it — but it is a real limitation of compiling to ES
modules without a bundler, and worth fixing with hashed filenames if module
caching ever causes a confusing local result.

## Line endings and formatting

Several PHP pages and CSS files under `src/` use **CRLF**; the TypeScript
sources and `src/assets/css/base/reset.css` use **LF**. Check with `file` before
a wholesale rewrite, and prefer `Edit` over `Write` on the CRLF files — a full
rewrite converts them to LF and inflates the diff by the entire file. To repair:
`perl -pi -e 's/\r?\n/\r\n/' <file>`.

A Prettier-on-save formatter is active and will reformat files after edits
(quote style, indentation, blank lines between CSS rules). Expected; don't fight
it. Note that `pnpm run format` does **not** cover `.ts` — its glob is
`{js,css,html,json,md,php,yml,yaml}`, so TypeScript is formatted by the editor
only.

The old `stlye/` misspelling is gone; stylesheets live under `src/assets/css/`.

## Architecture

**Shared chrome lives in `src/includes/layout/`, shared CSS in
`src/assets/css/layout/layout.css`.** `header.html` and `footer.html` are pulled
into every page with
`<?php include __DIR__ . "/includes/layout/header.html"; ?>` — `__DIR__`, so the
include resolves independently of the server's working directory. `layout.css`
holds every header and footer rule; `pages/home.css` is index-only
(Section01–03, `.ScrollBtn`, `.BgVideo`) and `pages/detailList.css` is
DetailList-only. When those rules were lifted out of `home.css` their
`.OverView` ancestor prefix was **removed on purpose**, because `DetailList.php`
has no `.OverView` wrapper — re-adding that prefix silently unstyles the chrome
on DetailList while leaving index looking fine.

Consequences for the pages' `<head>`s: `DetailList.php` does not load
`home.css`, so it also must not load the Material Symbols font (that icon font
is referenced only by `home.css`'s `.Sec03ContactBtn`). Noto Sans KR **is**
needed on all pages, because `assets/css/base/reset.css` declares it as the base
`font-family`.

**Browser scripts are TypeScript ES modules under `src/scripts/`,** grouped by
feature and compiled by `tsc` to `src/assets/js/` with the folder tree
preserved. There is no bundler, so **every relative import must carry an
explicit `.js` specifier** even though the file on disk is `.ts` — an
extensionless import ships a 404. `tsconfig.scripts.json` uses
`moduleResolution: "bundler"` precisely so `.js` specifiers resolve to `.ts`
sources.

- `core/` — `motion` (easing, `windowScrollDuration`), `windowScroll` (the
  single rAF scroll; the active animation is private to this module and
  reachable only through `finishActiveWindowScroll()`), `overlayState`, `dom`
  helpers.
- `layout/` — `gnb`, `contactPop`, `footerLang`, `footerSns`, `topButton`.
- `home/` — `sectionSnap`, `sectionButtons`, `anchorNav`, `dragScroll`, `sec02`.
- `detail/` — `detailList`.

`main.ts` wires them in a fixed order; the only shared object is the
`SnapHandle` returned by `initSectionSnap()`, passed into the button, anchor,
top-button and drag initializers so all of them drive the same `go(index)`.

`overlayState` reads `popupIsOpen()` / `menuIsOpen()` **straight from the DOM**
rather than from module state. That is deliberate: the snap, drag and touch
handlers all need the answer, and routing it through shared mutable state would
make those modules depend on each other's load order.

**The same entry module is loaded by every page,** so several initializers are
written to no-op elsewhere rather than being split into a second bundle.
`initGnb` queries a bare `header`, not `.OverView header`, because DetailList
has no wrapper. `initDragScroll` starts with `if (!snap) return;` — DetailList
also has a `<main>`, and without that guard drag-scrolling would hijack the list
page's native scrolling. `initSectionSnap` needs no guard: it finds no
`#FullPage` sections and bails on its own.

The `<script>` tag is `type="module"`, which is deferred. That is safe because
the tag already sits at the end of `<body>`, and the two inline scripts
(`Overview.php`, `view.php`) do not reference anything the module exports — but
it is a constraint to keep in mind before adding a third inline script that
does.

**Section snapping (`initSectionSnap`) is the core.** Snap targets are the three
`#FullPage > div` sections **plus `footer#Footer`**. Sections are `100vh` but
the footer is auto-height, so `topOf()` clamps every target to
`scrollHeight - innerHeight`; that clamp is what makes the short footer
reachable as the final snap point. `wheel` and `touchmove` are registered
`{passive: false}` and call `preventDefault()`, so **native scrolling is
entirely replaced** — a `locked` timer is what enforces one-gesture-one-section.
It is `LOCK_MS = windowScrollDuration + 100`, i.e. 1350ms, derived in
`home/sectionSnap.ts` from the 1250ms scroll in `core/motion.ts`. (An earlier
version of this file said 900ms; that was stale.) The `lockVersion` counter is
load-bearing — it stops a stale timer from releasing a newer lock.

**GNB dropdown (`initGnb`).** Submenus are `<ul>`s nested inside each
`#Gnb > li`, but they are positioned against **`#Gnb`, not the `li`**. This is
deliberate: every submenu's first item must start at the same x as the "About"
label (`left: 30px`, matching the `li` padding). Consequence worth knowing
before editing the dropdown: because the containing block is `#Gnb` (~670px
wide), an absolutely positioned submenu's shrink-to-fit width is capped by it,
so **`max-width` has no effect — set an explicit `width`** (currently `800px`,
chosen so the 8-item AGV menu wraps to exactly two rows of four).

The white panel behind the dropdown is a separate element, `.GnbBackdrop`. Its
`height` is set from JS (`submenu.scrollHeight`) on open and back to `0px` on
close, so it animates to fit whichever submenu opened — CSS alone cannot size
it.

Opening/closing is class-driven (`isOpen`), and **closing is bound to `header`'s
`mouseleave`, not each `li`** — that is what prevents flicker when the pointer
travels from a 1-depth item into its own dropdown.

**Header** is `position: fixed`. Its background is painted on `:hover` only;
there is deliberately no scroll-based background state (it was implemented and
then removed by request).

**`src/assets/css/base/reset.css`**: the
`header { font-size: 23px; font-weight: 700; color: #ffffff }` rule must stay
**outside** any media query. It originally lived inside
`@media (max-width: 1920px)`, which made header text fall back to black 16px on
windows wider than 1920px.

## Known open defects (deferred, not fixed)

Two non-author verifiers (Codex `gpt-5.6-sol`, Cursor `cursor-grok-4.5-high`)
reviewed the then-single `js/main.js` and both returned FAIL. The owner chose to
defer the fixes, and the TypeScript split was a **mechanical port** — every
defect below was carried over deliberately rather than quietly fixed, so the
findings still stand against the modules named here. Full findings:
`.claude/state/cursor-rescue/*.log`. Highest impact:

- The `wheel` handler never normalizes `deltaMode`. The `Math.abs(e.deltaY) < 4`
  threshold discards Firefox's line-mode events (`deltaY ≈ 3`) _after_
  `preventDefault()` has run, so wheel scrolling is dead in Firefox.
- `preventDefault()` is unconditional, which also disables Ctrl+wheel zoom and
  pinch zoom, and leaves no native-scroll escape for reduced-motion or
  assistive-tech users.
- The 1350ms lock is still shorter than a real trackpad momentum tail, so one
  flick can advance two sections.
- Space on a focused `.ScrollBtn` snaps the section instead of activating the
  button (the `keydown` guard only excludes `input`/`textarea`/`select`).
- If the footer ever grows taller than the viewport it becomes unreachable,
  since native scroll is suppressed and the last snap target is its clamped top.

## Checkouts and Orca worktrees

This repo is used from two kinds of checkout, and the rules differ:

- **This main checkout** (`~/Documents/Cursor/DreamProject/AGVS`) is an ordinary
  git checkout. Normal git applies; nothing here is Orca-managed.
- **An Orca-managed worktree** is any checkout under `~/orca/workspaces/`.
  There, Orca owns the worktree, its terminals and the embedded browser: do not
  `git worktree add` and do not nest worktrees, because the repo sets
  `externalWorktreeVisibility: "hide"`, so a non-Orca worktree would hold the
  branch while staying invisible in the Orca UI. Create siblings with
  `orca worktree create --name <n>`.

Orca worktree names are EPHEMERAL — they are created and destroyed routinely, so
never hardcode one. **Uncommitted work in an Orca worktree is lost when that
worktree is removed**; commit or push before the worktree goes away. (Observed
twice on 2026-07-30: the `otter` and `prowfish` worktrees were both destroyed,
and only committed content survived.)

The harness role for this repo is **FDW (frontend/design/writing)**. The native
Claude-family author lane (`designer`/`writer` subagents) does the authoring for
this repo; Codex+AGY, the two non-author vendor lanes, critically review that
work. Authoring for this repo must **NOT** be routed to the isolated
scratch-based `codex-author` lane used by the LOGIC domain. That lane is
reserved for LOGIC repos, and this repo is FDW, not LOGIC. PLAN is authored by
`planner`/`architect`, TEST/ACCEPTANCE by `test-engineer`, and content by
`designer`/`writer` — all Claude-family lanes; the two non-author verify lanes
remain the two other vendors.

The **measuring in a real browser** via `Chrome DevTools MCP` procedure
described earlier is this project's mechanical check. There is no build, lint,
or test command for this repo, so "tests green" resolves to the cache-bust bump
plus a browser measurement.

Drive the Orca-visible browser tab with `orca tab`, `orca snapshot`,
`orca click`, `orca fill`, and `orca eval` when needed, but keep using the
`Chrome DevTools MCP` measurement tool for actual measurement (computed styles,
geometry, Lighthouse), since Orca has no equivalent. The `Playwright` tool is
deliberately off for this repo because Orca replaces it.

@AGENTS.md
