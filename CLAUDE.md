# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static single-page Korean corporate marketing site for "AGVS" (Automated Guided Vehicle System). No build step, no package manager, no framework, no jQuery — plain HTML/CSS/vanilla JS served as files.

The design target is a **fixed 1920px width**. The header and every section hard-code `width: 1920px`; on wider windows the page sits at the left with empty gutters. Do not make it responsive unless asked.

The GNB and section-scroll behavior deliberately imitate **https://www.mrlxzin.com/html/00_main/** (which uses jQuery + fullPage.js); this project reimplements the same behavior in vanilla JS. That site is the design reference for layout questions — its TLS certificate is expired, so fetch it with `curl -k`.

## Running and verifying

There is no build, lint, or test command. Serve the directory:

```bash
python3 -m http.server 8848
# http://localhost:8848/index.html
```

Verification means **measuring in a real browser** (Chrome DevTools MCP) — read computed styles and geometry via `evaluate_script` rather than judging from screenshots. Two traps:

- A synthetic `MouseEvent('mouseenter')` fires the JS handlers but does **not** activate CSS `:hover`. Testing hover styling requires moving a real pointer (the `hover` tool). Conversely, a synthetic `mouseleave` does not clear a real `:hover` — park the real cursor off-header before reading unhovered colors.
- Smooth scrolling takes ~1s; waits shorter than ~1.2s produce false failures.

## Cache busting — required after every CSS/JS edit

`index.html` links assets with a `?ver=YYYYMMDD<letter>` query string. Browsers cache these files aggressively and **edits silently do not apply until the version is bumped**. Bump all three references at once:

```bash
perl -pi -e 's/ver=20260728h/ver=20260728i/g' index.html
```

## Line endings and formatting

`index.html` and `stlye/main.css` use **CRLF**; `stlye/reset.css` and `js/main.js` use **LF**. Prefer `Edit` over `Write` on the CRLF files — a full rewrite converts them to LF and inflates the diff by the entire file. To repair: `perl -pi -e 's/\r?\n/\r\n/' <file>`.

A Prettier-on-save formatter is active and will reformat files after edits (quote style, indentation, blank lines between CSS rules). Expected; don't fight it.

`stlye/` is a misspelling of `style/`. It is pre-existing and referenced by the HTML links — leave it.

## Architecture

`js/main.js` is one IIFE with four initializers wired together in `init()`. The only shared object is the handle returned by `initSectionSnap()`, passed into the button and drag initializers so all three drive the same `go(index)`.

**Section snapping (`initSectionSnap`) is the core.** Snap targets are the three `#FullPage > div` sections **plus `footer#Footer`**. Sections are `100vh` but the footer is auto-height, so `topOf()` clamps every target to `scrollHeight - innerHeight`; that clamp is what makes the short footer reachable as the final snap point. `wheel` and `touchmove` are registered `{passive: false}` and call `preventDefault()`, so **native scrolling is entirely replaced** — a fixed 900ms `locked` timer is what enforces one-gesture-one-section.

**GNB dropdown (`initGnb`).** Submenus are `<ul>`s nested inside each `#Gnb > li`, but they are positioned against **`#Gnb`, not the `li`**. This is deliberate: every submenu's first item must start at the same x as the "About" label (`left: 30px`, matching the `li` padding). Consequence worth knowing before editing the dropdown: because the containing block is `#Gnb` (~670px wide), an absolutely positioned submenu's shrink-to-fit width is capped by it, so **`max-width` has no effect — set an explicit `width`** (currently `800px`, chosen so the 8-item AGV menu wraps to exactly two rows of four).

The white panel behind the dropdown is a separate element, `.GnbBackdrop`. Its `height` is set from JS (`submenu.scrollHeight`) on open and back to `0px` on close, so it animates to fit whichever submenu opened — CSS alone cannot size it.

Opening/closing is class-driven (`.is-open`), and **closing is bound to `header`'s `mouseleave`, not each `li`** — that is what prevents flicker when the pointer travels from a 1-depth item into its own dropdown.

**Header** is `position: fixed`. Its background is painted on `:hover` only; there is deliberately no scroll-based background state (it was implemented and then removed by request).

**`stlye/reset.css`**: the `header { font-size: 23px; font-weight: 700; color: #ffffff }` rule must stay **outside** any media query. It originally lived inside `@media (max-width: 1920px)`, which made header text fall back to black 16px on windows wider than 1920px.

## Known open defects (deferred, not fixed)

Two non-author verifiers (Codex `gpt-5.6-sol`, Cursor `cursor-grok-4.5-high`) reviewed `js/main.js` and both returned FAIL. The owner chose to defer the fixes. Full findings: `.claude/state/cursor-rescue/*.log`. Highest impact:

- The `wheel` handler never normalizes `deltaMode`. The `Math.abs(e.deltaY) < 4` threshold discards Firefox's line-mode events (`deltaY ≈ 3`) *after* `preventDefault()` has run, so wheel scrolling is dead in Firefox.
- `preventDefault()` is unconditional, which also disables Ctrl+wheel zoom and pinch zoom, and leaves no native-scroll escape for reduced-motion or assistive-tech users.
- The 900ms lock is shorter than a real trackpad momentum tail, so one flick can advance two sections.
- Space on a focused `.ScrollBtn` snaps the section instead of activating the button (the `keydown` guard only excludes `input`/`textarea`/`select`).
- If the footer ever grows taller than the viewport it becomes unreachable, since native scroll is suppressed and the last snap target is its clamped top.
