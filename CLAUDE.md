@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

Static Korean corporate marketing site for "AGVS" (Automated Guided Vehicle
System). No build step, no package manager, no framework, no jQuery — plain
HTML/CSS/vanilla JS. Two pages: `index.php` (the one-page main) and
`DetailList.php` (product list). PHP is used for exactly one thing —
`include`-ing `include/header.html` and `include/footer.html` — so the pages
need a PHP-capable server, not a static one.

The design is fluid with `width: 100%` and `max-width: 1920px` wrappers;
inner widths use percentages derived from the original 1920px pixel values.
Font sizes use `clamp()` with 1920px as the maximum, preserving the original
design at that viewport. Four breakpoints handle smaller screens: 1279.98px
(footer nav wraps), 1199.98px, 991.98px (hamburger menu, card grid steps
down), and 767.98px (single-column, stacked footer). A few widths stay in
pixels — GNB submenu, search input, and Contact button sit in non-proportional
containers, so literal percentages there would break the 1920px baseline.
**1920px parity is the standing acceptance criterion:** measured values at a
1920px viewport must not change.

The GNB and section-scroll behavior deliberately imitate
**https://www.mrlxzin.com/html/00_main/** (which uses jQuery + fullPage.js);
this project reimplements the same behavior in vanilla JS. That site is the
design reference for layout questions — its TLS certificate is expired, so fetch
it with `curl -k`.

## Running and verifying

There is no build, lint, or test command. Serve the directory **with PHP**:

```bash
export PATH="/opt/homebrew/bin:$PATH"
php -S localhost:8848
# http://localhost:8848/index.php  ·  http://localhost:8848/DetailList.php
```

`python3 -m http.server` will **not** work — it does not execute PHP, so the two
`include` statements render as nothing and the header and footer silently vanish
from both pages. That failure looks like a CSS bug, not a server bug.
Sanity-check a served page with `curl -s … | grep -c '<?php'` — the answer must
be 0.

Verification means **measuring in a real browser** (Chrome DevTools MCP) — read
computed styles and geometry via `evaluate_script` rather than judging from
screenshots. Two traps:

- A synthetic `MouseEvent('mouseenter')` fires the JS handlers but does **not**
  activate CSS `:hover`. Testing hover styling requires moving a real pointer
  (the `hover` tool). Conversely, a synthetic `mouseleave` does not clear a real
  `:hover` — park the real cursor off-header before reading unhovered colors.
- Smooth scrolling takes ~1s; waits shorter than ~1.2s produce false failures.

## Cache busting — required after every CSS/JS edit

`index.php` and `DetailList.php` link assets with a `?ver=YYYYMMDD<letter>`
query string. Browsers cache these files aggressively and **edits silently do
not apply until the version is bumped**. Bump every reference in both pages at
once:

```bash
perl -pi -e 's/ver=20260730d/ver=20260730e/g' index.php DetailList.php
```

## Line endings and formatting

`index.php`, `DetailList.php`, `include/header.html`, `include/footer.html`,
`stlye/main.css`, `stlye/layout.css` and `stlye/DetailList.css` use **CRLF**;
`stlye/reset.css` and `js/main.js` use **LF**. Prefer `Edit` over `Write` on the
CRLF files — a full rewrite converts them to LF and inflates the diff by the
entire file. To repair: `perl -pi -e 's/\r?\n/\r\n/' <file>`.

A Prettier-on-save formatter is active and will reformat files after edits
(quote style, indentation, blank lines between CSS rules). Expected; don't fight
it.

`stlye/` is a misspelling of `style/`. It is pre-existing and referenced by the
HTML links — leave it.

## Architecture

**Shared chrome lives in `include/`, shared CSS in `stlye/layout.css`.**
`include/header.html` and `include/footer.html` are pulled into both pages with
`<?php include __DIR__ . "/include/header.html"; ?>` — `__DIR__`, so the include
resolves independently of the server's working directory. `layout.css` holds
every header and footer rule; `main.css` is now index-only (Section01–03,
`.ScrollBtn`, `.BgVideo`) and `DetailList.css` is DetailList-only. When those
rules were lifted out of `main.css` their `.OverView ` ancestor prefix was
**removed on purpose**, because `DetailList.php` has no `.OverView` wrapper —
re-adding that prefix silently unstyles the chrome on DetailList while leaving
index looking fine.

Consequences for the two pages' `<head>`s: `DetailList.php` does not load
`main.css`, so it also must not load the Material Symbols font (that icon font
is referenced only by `main.css`'s `.Sec03ContactBtn`). Noto Sans KR **is**
needed on both, because `stlye/reset.css` declares it as the base `font-family`.

`js/main.js` is one IIFE with a set of initializers wired together in `init()`.
The only shared object is the handle returned by `initSectionSnap()`, passed
into the button and drag initializers so all three drive the same `go(index)`.

**The same `main.js` is loaded by both pages,** so two of its initializers are
written to no-op on DetailList rather than being split into a second file.
`initGnb` queries a bare `header`, not `.OverView header`, because DetailList
has no wrapper. `initDragScroll` starts with `if (!snap) return;` — DetailList
also has a `<main>`, and without that guard drag-scrolling would hijack the list
page's native scrolling. `initSectionSnap` needs no guard: it finds no
`#FullPage` sections and bails on its own.

**Section snapping (`initSectionSnap`) is the core.** Snap targets are the three
`#FullPage > div` sections **plus `footer#Footer`**. Sections are `100vh` but
the footer is auto-height, so `topOf()` clamps every target to
`scrollHeight - innerHeight`; that clamp is what makes the short footer
reachable as the final snap point. `wheel` and `touchmove` are registered
`{passive: false}` and call `preventDefault()`, so **native scrolling is
entirely replaced** — a fixed 900ms `locked` timer is what enforces
one-gesture-one-section.

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

Opening/closing is class-driven (`isOpen`), and **closing is bound to
`header`'s `mouseleave`, not each `li`** — that is what prevents flicker when
the pointer travels from a 1-depth item into its own dropdown.

**Header** is `position: fixed`. Its background is painted on `:hover` only;
there is deliberately no scroll-based background state (it was implemented and
then removed by request).

**`stlye/reset.css`**: the
`header { font-size: 23px; font-weight: 700; color: #ffffff }` rule must stay
**outside** any media query. It originally lived inside
`@media (max-width: 1920px)`, which made header text fall back to black 16px on
windows wider than 1920px.

## Known open defects (deferred, not fixed)

Two non-author verifiers (Codex `gpt-5.6-sol`, Cursor `cursor-grok-4.5-high`)
reviewed `js/main.js` and both returned FAIL. The owner chose to defer the
fixes. Full findings: `.claude/state/cursor-rescue/*.log`. Highest impact:

- The `wheel` handler never normalizes `deltaMode`. The `Math.abs(e.deltaY) < 4`
  threshold discards Firefox's line-mode events (`deltaY ≈ 3`) _after_
  `preventDefault()` has run, so wheel scrolling is dead in Firefox.
- `preventDefault()` is unconditional, which also disables Ctrl+wheel zoom and
  pinch zoom, and leaves no native-scroll escape for reduced-motion or
  assistive-tech users.
- The 900ms lock is shorter than a real trackpad momentum tail, so one flick can
  advance two sections.
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
reserved for LOGIC repos, and this repo is FDW, not LOGIC.

The **measuring in a real browser** via `Chrome DevTools MCP` procedure
described earlier is this project's mechanical check. There is no build, lint,
or test command for this repo, so "tests green" resolves to the cache-bust bump
plus a browser measurement.

Drive the Orca-visible browser tab with `orca tab`, `orca snapshot`,
`orca click`, `orca fill`, and `orca eval` when needed, but keep using the
`Chrome DevTools MCP` measurement tool for actual measurement (computed styles,
geometry, Lighthouse), since Orca has no equivalent. The `Playwright` tool is
deliberately off for this repo because Orca replaces it.
