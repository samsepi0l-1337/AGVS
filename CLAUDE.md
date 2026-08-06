# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

Static Korean corporate marketing site for "AGVS" (Automated Guided Vehicle
System). No framework, no jQuery, no bundler — plain HTML/CSS and **TypeScript
throughout; there is no PHP anywhere in this repository.** `src/build/` reads
SQLite at build time and writes `dist/site/`, which is what GitHub Pages serves.

**Source lives under `src/`; every build output lands under `dist/`:**

```
src/
  build/                   the static renderer (TypeScript, run by tsx)
    content.ts             SQLite readers
    i18n.ts  html.ts       t() / assetUrl(); PHP-compatible escaping
    pages.ts  render.ts    page registry; CLI entry
    seed.ts                rebuilds data/agvs.sqlite from the JSON seeds
    templates/*.tsx        shell, header, footer, contactPop, langSwitch
                           + one per page — all TSX, no .ts left
    jsx/jsx-runtime.ts     the string-emitting JSX factory (no React)
  scripts/**/*.ts          browser sources: core, layout, home, detail, main.ts
  assets/css/{base,layout,pages}/*.css
  assets/img/  assets/video/
  api/                     Express admin API + the download route
  admin/                   admin UI: index.html, assets/, ts/

dist/                      ALL generated output, gitignored as one directory
  site/                    the deployable static site  <- Pages uploads this
  browser/                 compiled src/scripts
  admin/                   compiled src/admin/ts
  api/                     compiled src/api
```

`data/` (SQLite + JSON seeds), `storage/` (uploads) and `.github/` stay at the
repo root because they are not source. Nothing is generated inside `src/` any
more — if you find a `js/` directory there, it is stale, and deleting it is
correct.

**How the PHP went away**, in case a regression ever needs archaeology: the
renderer was migrated by building the TypeScript one alongside the PHP one and
diffing their outputs page by page until all 69 pages (23 × KR/EN/JP) rendered
identically, and only then deleting the PHP path. To re-run that parity check,
recover `scripts/build-static.sh`, `scripts/compare-render.sh` and the eight
page `.php` files from `d5b8b36` and run `compare:render` there. The admin UI
and the seed script were migrated afterwards, retiring the last eleven `.php`
files.

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

There is no lint or test command. Build, then serve the output with anything:

```bash
export PATH="/opt/homebrew/bin:$PATH"
pnpm run build                          # build:js -> build:static -> format
cd dist/site && python3 -m http.server 8848
```

There is no live-reload dev server, and that is the trade the migration made:
previewing a source edit means rebuilding. `pnpm run build:static` alone (~1s)
is enough when only markup or content changed; `build:js` is only needed after
editing `src/scripts/`.

`build:static` runs `tsx src/build/render.ts`: it renders KR to
`dist/site/*.html`, EN to `dist/site/en/`, JP to `dist/site/jp/`, copies
`src/assets` to `dist/site/assets`, copies the compiled `dist/scripts` to
`dist/site/assets/js`, and fails loudly on a missing header/footer, a leftover
site-relative `.php` link, or a catalog image that is missing, empty, mis-cased
or not a real JPEG. **Keep those checks.** The case-sensitivity one has caught
real bugs: macOS resolves a mis-cased asset happily and GitHub Pages 404s it.

**Why the browser JS is copied separately.** It used to be emitted into
`src/assets/js/` and rode along inside the wholesale `src/assets` copy. Now that
it lands in `dist/scripts/`, that free ride is gone, so `render.ts` copies it
explicitly and throws if `dist/scripts` is absent. Without that guard a build
with no compiled JS would exit 0 and publish pages whose `./assets/js/main.js`
404s — green build, dead site. Verified by deleting `dist/scripts` and
confirming `build:static` exits 1 naming both `dist/scripts` and `build:js`.

The admin UI runs on the API, not a separate server: `pnpm run admin:dev`
compiles `src/admin/ts` and starts Express, then open `/admin` on the API's own
port. Being same-origin is what lets the CORS allowlist stay tight.

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
perl -pi -e 's/ver=20260804b/ver=20260804c/g' src/build/templates/*.ts*
```

**Known gap:** only the entry module carries `?ver=`. The modules it imports
(`./home/sectionSnap.js` and friends) are fetched by the browser at their bare
paths, so bumping the entry does not bust them. This bites local development
only — a hard reload clears it — but it is a real limitation of compiling to ES
modules without a bundler, and worth fixing with hashed filenames if module
caching ever causes a confusing local result.

## Line endings and formatting

**The tree is now uniformly LF.** It used to be a CRLF/LF mix — the PHP pages
and most CSS were CRLF — and this section used to warn against rewriting those
files wholesale. Prettier converted the last of them during the TypeScript
migration; verified with `file` across all 134 tracked source files, zero CRLF.
Keep it that way: no `.gitattributes` pins line endings, so a wholesale rewrite
that reintroduces CRLF would show up as a whole-file diff.

A Prettier-on-save formatter is active and will reformat files after edits
(quote style, indentation, blank lines between CSS rules). Expected; don't fight
it. Note that `pnpm run format` does **not** cover `.ts` — its glob is
`{js,css,html,json,md,php,yml,yaml}`, so TypeScript is formatted by the editor
only.

The old `stlye/` misspelling is gone; stylesheets live under `src/assets/css/`.

## Architecture

**Shared chrome lives in `src/build/templates/{header,footer,contactPop}.tsx`,
shared CSS in `src/assets/css/layout/layout.css`.** Each page template calls
`renderHeader(ctx, catalog)`, `renderFooter(ctx)` and `renderContactPop(ctx)`;
`ctx` is the per-locale `RenderContext` from `i18n.ts` carrying `t()`,
`assetUrl()`, `lang`, `htmlLang` and `aboutLabel`. `layout.css` holds every
header and footer rule; `pages/home.css` is index-only (Section01–03,
`.ScrollBtn`, `.BgVideo`) and `pages/detailList.css` is DetailList-only. When
those rules were lifted out of `home.css` their `.OverView` ancestor prefix was
**removed on purpose**, because the DetailList page has no `.OverView` wrapper —
re-adding that prefix silently unstyles the chrome on DetailList while leaving
index looking fine.

Consequences for the pages' `<head>`s: DetailList does not load `home.css`, so
it also must not load the Material Symbols font (that icon font is referenced
only by `home.css`'s `.Sec03ContactBtn`). Noto Sans KR **is** needed on all
pages, because `assets/css/base/reset.css` declares it as the base
`font-family`.

**Adding a page** means writing `src/build/templates/<name>.tsx` exporting a
`PageModule` (`{ name, render(ctx, data, slug?) }`) and adding one import plus
one array entry to `src/build/pages.ts`. `name` is the output basename and its
capitalisation is load-bearing — GitHub Pages is case-sensitive.

**Templates are TSX, rendered to strings at build time** (2026-08-06). There is
no React and no bundler: `src/build/jsx/jsx-runtime.ts` is a ~150-line factory
that returns HTML strings, wired up with `jsxFactory: "h"`, so each `.tsx` file
imports `h` the same way it imports anything else. The classic factory is used
rather than the automatic runtime because a **relative** `jsxImportSource`
resolves against each importing file rather than against `tsconfig.json`, so it
cannot name a path that is correct from every directory — `./src/build/jsx`
fails from `templates/` with TS2875, and a `paths` mapping would fix compilation
but not `tsx`'s own resolution at run time.

The reason for the switch was escaping, not syntax. The string templates carried
~200 hand-written `esc()` calls and forgetting one was undetectable. In TSX
`{value}` is escaped always and `{raw(html)}` is the visible exception. Two
things the runtime has to get right, both found by getting them wrong first:
`aria-*`/`data-*` are string attributes, so `aria-selected={false}` must render
`"false"` rather than vanish the way `hidden` does; and SVG shape primitives
(`path`, `line`, `rect`, `stop`, …) must stay self-closed, since the paired form
changes the built bytes on every page.

Shared pieces live beside the pages: `shell.tsx` (`PageShell` — the doctype,
head, header, footer, popup and entry script every page repeated) and
`langSwitch.tsx` (`LangSwitch`, used by both header and footer with a `prefix`
of `"Header"` or `"Footer"`). `PageShell` takes an explicit `stylesheets` list
rather than deriving one from the page name, because the rules about which page
loads which sheet are real — see the `<head>` note above.

**All eleven templates are TSX** (2026-08-07). Overview is the one that does NOT
use `PageShell`: it has a page-local header instead of the shared one, and its
second inline script runs after the entry module rather than before it, so it
renders its own document. It still reuses `LangSwitch`.

`scripts/compare-dom.py <before> <after>` is how each conversion was checked —
it compares the element tree, every attribute and whitespace-collapsed text,
because Prettier reflows short elements when the pre-format whitespace changes
and a byte diff therefore reports formatting churn. Use it against a saved copy
of `dist/site` from before any future template edit. Note what it does NOT
catch, which a direct byte diff and the browser did: `&` in an attribute is now
emitted as `&amp;` (correct HTML, identical resolved URL), `<path></path>` is
now `<path />` (equivalent in SVG), and blank lines between blocks are gone.

**`html.ts` reproduces PHP's escaping on purpose**, because the templates were
ported from PHP under a byte-identical-output constraint: `esc()` matches
`htmlspecialchars(ENT_QUOTES, UTF-8)` down to the `&#039;` form of the
apostrophe, and `phpJsonEncode()` matches `json_encode()`'s defaults, which
escape `/` and emit `\uXXXX` rather than raw UTF-8. Use `phpJsonEncode` for
values embedded in an inline `<script>`; plain `JSON.stringify` would change the
bytes.

Catalog paths are still stored in their historical `img/…` form in SQLite; the
`assets/` prefix is added by `ctx.assetUrl()` at render time, which is why the
database, the JSON seeds and admin uploads survived the asset move untouched.

**Browser scripts are TypeScript ES modules under `src/scripts/`,** grouped by
feature and compiled by `tsc` to `dist/scripts/` with the folder tree preserved,
then copied into the built site as `assets/js/`. There is no bundler, so **every
relative import must carry an explicit `.js` specifier** even though the file on
disk is `.ts` — an extensionless import ships a 404. The single `tsconfig.json`
uses `moduleResolution: "bundler"` precisely so `.js` specifiers resolve to
`.ts` sources.

**There is exactly one `tsconfig.json`, compiling `src/` as a single project**
(2026-08-06). It replaced a base config plus four per-target ones. The layout
follows from `rootDir: "src"`, `outDir: "dist"`: `src/scripts` → `dist/scripts`,
`src/admin/ts` → `dist/admin/ts`, `src/api` → `dist/api`, and `src/build` →
`dist/build`, whose JS is unused because tsx runs the `.ts` sources directly.
`composite`, `references`, `declaration` and `tsBuildInfoFile` are all gone with
the split, which also removes the way `.d.ts` files once leaked into the
published site.

**The cost, stated so it is not rediscovered as a bug:** one project means one
`lib` and one `types`, so browser and Node globals are visible everywhere.
`process.env` in a browser module and `document` in a server module both
typecheck now; separate projects used to catch them. If that starts biting,
splitting the config back out is the fix.

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
the tag already sits at the end of `<body>`, and the two inline scripts emitted
by `templates/overview.ts` and `templates/view.ts` do not reference anything the
module exports — but it is a constraint to keep in mind before adding a third
inline script that does.

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
