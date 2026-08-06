# AGENTS.md

## Learned User Preferences

- Prefer camelCase for new HTML/CSS/JS identifiers; when editing nearby code,
  rename non-camelCase to camelCase.
- Use <https://www.mrlxzin.com> (especially `/html/00_main/`) as the primary
  layout/behavior reference; if copying its left-side progress bar, place it on
  the right of this site.
- Keep motion subtle and non-excessive; no sequential fade-ups. Section 3 title
  underline sweep was removed on 2026-08-01.
- Footer must not include App Store / Google Play badges; SNS icons are
  Facebook, Instagram, X, LinkedIn, and YouTube; put a scroll-to-top control
  where store badges would have been.
- Prefer matching provided reference/example layouts (screenshots or cited
  sites) over inventing alternate structures.
- Footer language switcher labels are KR, EN, and JP; copyright uses the form
  `Copyrights(C) YYYY AGVS. All Rights Reserved.`
- Share header/footer via the TS chrome templates
  (`src/build/templates/header.ts`, `footer.ts`; the Overview page keeps its
  page-local header). (Superseded 2026-08-05: these were PHP includes under
  `src/includes/layout/` until the renderer moved to TypeScript.) Put chrome CSS
  in `src/assets/css/layout/layout.css`; keep chrome JS (GNB, footer lang, Top)
  in `src/scripts/layout/` and FullPage/section snap in `src/scripts/home/`, all
  reached from the single `src/scripts/main.ts` entry every page loads.
  (Superseded 2026-07-30: JS-fetched `data-include` / `partials/` /
  `js/layout.js` are gone. Superseded 2026-08-05: the single `js/main.js` IIFE
  is now TypeScript ES modules under `src/scripts/`.) Shared chrome must not
  depend on `.OverView`; DetailList matches home header hover; Top uses snap
  `go(0)` when available else native scroll; logo links to `index.php`; Contact
  Us stays `#`.
- GNB About top label is language-aware (KR `회사소개` / EN `About` / JP
  `会社紹介`); About submenu labels `Overview` and `AGV Video` stay English in
  all languages.
- Keep `Contact Us` / `CONTACT US` untranslated (header link, Section 3 CTA,
  contact popup title); translate other chrome and section copy per KR/EN/JP.
- KR is the content source of truth; day-to-day EN/JP work edits only
  language-specific fields via the admin UI translate screen or an admin-api
  i18n PUT—not by hand-editing JSON seeds or running the seed rebuild as the
  translation workflow.
- Catalog data: **Diesel Engine Assemble Line** is a model under
  `heavy-transporter`, not a separate catalog item; Technology products with a
  single model must use the product name in `ViewModelSelect` labels—never
  placeholder `기본` / `Standard` / `標準`.
- (Retired 2026-08-05: a preference about `<?php` placement in include templates
  no longer applies — there is no PHP. Its replacement: page templates are TSX
  rendered to strings at build time (2026-08-06), where interpolation is escaped
  by default and `raw()` is the visible opt-out; `phpJsonEncode()` is still what
  goes into an inline `<script>`.)

## Learned Workspace Facts

- Static AGVS marketing site (multi-page): plain HTML/CSS/vanilla JS with
  KR/EN/JP i18n via `src/build/i18n.ts` (public site) and cookie `agvs_lang`;
  assets under `src/assets/{css,img,video}/` (compiled JS is generated into
  `dist/scripts/`, never into `src/`). The old `stlye/` misspelling is retired
  (2026-08-05). Wrappers keep an intentional `max-width: 1920px` even when inner
  widths are %-based; 1920px parity remains the acceptance criterion. GNB
  top-level label spelling is Technology.
- Catalog, UI chrome, videos, and archive copy live in `data/agvs.sqlite`, read
  at build time by `src/build/content.ts` and surfaced to templates as
  `ctx.t()`. `data/items{KR|EN|JP}.json`, `ui*.json`, and `videos.json` are
  rebuild seeds only (`pnpm run rebuild:db` -> `src/build/seed.ts`). The admin
  API (`src/api/store/*.ts`) reads and writes the same DB at runtime; the two
  readers are deliberately separate because they shape rows for different
  consumers.
- Page templates are `src/build/templates/*.tsx` (all TSX since 2026-08-07),
  registered in `src/build/pages.ts`: `index`, `detailList`, `view` (model
  `<select class="ViewModelSelect">` styled like `HeaderLangBtn` but wider;
  drives specs/images; also renders the Archive detail branch), `overview`,
  `video`, `videoView`, `archive`, `sitemap`. Output basenames keep their
  original capitalisation (`DetailList.html`) — Pages is case-sensitive. The
  admin UI is `src/admin/{index.html,assets,ts}`, served by the API at `/admin`;
  its translate screen is i18n-only by design.
- The Overview page uses its own page-local header (not the shared
  `renderHeader`); copy is keyed under `overview.*` in SQLite UI payloads via
  `ctx.t()`. Scrolled header goes white with `#333333` text and keeps blue
  hover; avoid last-child-only color overrides. Japanese needs `html[lang="ja"]`
  tweaks (`line-break: strict` and related) because fixed `minmax()` floors
  overflow longer JP text.
- `templates/archive.ts` (자료실): GNB top-level **plain link only** (no
  submenu); hover matches other GNB labels (`#Gnb > li:hover`). Sitemap lists
  under 고객지원. Archive items live in SQLite (`archive_i18n` and related
  tables) and open via `view.php?archive=slug`. PDF/Excel downloads appear on
  **detail only** (top-right), never on the list, and **always** use the compact
  `<details>` menu regardless of attachment count (2026-08-05: the former ≥3
  threshold is gone, so a single file gets the menu too). Files are served via
  `download.php` links, which the static build rewrites to `storage/` paths.
- `templates/detailList.ts` is the item list page (filters: 전체, AGV, ForkLift,
  Technology) with a horizontal `ul`/`button[data-category]` filter list (not a
  HeaderLang-style dropdown) and page styles in
  `src/assets/css/pages/detailList.css`.
- Section 2 is three equal hover-expand panels using `img/sec02_01.png`,
  `img/sec02_02.png`, and `img/sec02_03.png`. Section 3 is ~70% left
  `img/sec03.png` and ~30% right vision copy on a soft teal panel (`#E8F6F5`),
  with localized title/description via `ctx.t("sec03.*")` and an untranslated
  Contact us CTA.
- Footer link columns are 개인정보 처리방침 (AGV, ForkLift) and 사이트맵
  (Technology); no "빠른 링크" column. Footer/contact address is KR
  `경기 시흥시 서울대학로 59-21, 로얄팰리스테크노1차 703` and EN
  `703 Royal Palace Techno 1st, 59-21, Seouldaehak-ro, Siheung-si, Gyeonggi-do, Republic of Korea`;
  contact also includes TEL (+82-70-7734-7890), FAX (+82-303-0951-0852), and
  Email (<info@agvsk.com>).
- DetailList/view/Archive/Video/Sitemap heroes use desktop height 450px; at
  `max-width: 767.98px` height 250px with centered title text and
  `padding-top: 80px` so copy centers in the visible area below the fixed
  header. Use `ctx.assetUrl()` for language-stable image and media paths.
- `src/api/` (was `admin-api/`) is a strict TypeScript Express JSON API (session
  auth, SQLite CRUD, i18n-only PUT routes, uploads, and the attachment download
  route that replaced `download.php`). It also SERVES the admin UI at `/admin`,
  which is what makes the UI same-origin and lets the CORS allowlist stay tight
  — it rejects unknown origins rather than reflecting them, overridable via
  `AGVS_ADMIN_ORIGIN`. Run it with `pnpm run admin:dev` and a repo-root `.env`
  (`AGVS_ADMIN_PASSWORD_HASH`, `AGVS_ADMIN_SESSION_SECRET`). Mutating requests
  need the `x-csrf-token` header from `/api/auth/me` or login; without it the
  API returns 403. The session cookie stays `sameSite: lax` on purpose —
  `strict` would bounce anyone arriving from an external link back to login.
  Root `package.json` carries `"type": "module"`, which the API's compiled
  output (`dist/api/`) needs.
- Package manager is pnpm; local and CI entrypoint is `pnpm run build`
  (`build:js` → `build:static` → Prettier format). Browser TypeScript compiles
  via **one root `tsconfig.json`** that compiles `src/` as a single project
  (2026-08-06; it replaced a base config plus four per-target ones, and an
  earlier note here claiming a single config was impossible was wrong — it is
  possible, at a cost stated below). `rootDir: "src"` and `outDir: "dist"` fix
  the layout: `src/scripts` → `dist/scripts`, `src/admin/ts` → `dist/admin/ts`,
  `src/api` → `dist/api`, `src/build` → `dist/build` (unused — tsx runs those
  `.ts` sources directly). `composite`, `references`, `declaration` and
  `tsBuildInfoFile` went away with the split, which also removed the way `.d.ts`
  files once leaked into the published site. **The cost:** one project means one
  `lib` and one `types`, so browser and Node globals are visible everywhere —
  `process.env` in a browser module and `document` in a server module both
  typecheck now, where separate projects caught them. Splitting the config back
  out is the fix if that starts biting. Two consumers depend on the emitted
  locations and move with them: `render.ts` copies `dist/scripts` into the site,
  and the API serves `dist/admin/ts` at `/admin/js`. **Every build output lands
  under `dist/` and nothing is generated inside `src/`** (2026-08-05) — a `js/`
  directory under `src/` is stale. `build:static` runs
  `tsx src/build/render.ts`, which renders KR to `dist/site/*.html`, EN to
  `dist/site/en/`, JP to `dist/site/jp/`, copies `src/assets` to
  `dist/site/assets` and copies `dist/scripts` to `dist/site/assets/js`; the
  language switch navigates those paths. That second copy is load-bearing: the
  browser JS no longer lives inside `src/assets`, so without it the build would
  exit 0 and publish pages whose JS 404s — `render.ts` throws when
  `dist/scripts` is missing, and that guard has been triggered deliberately to
  confirm it fires. The renderer also rewrites `download.php` links to static
  file paths and FAILs on a missing header/footer, a leftover site-relative
  `.php` link (external `https://` `.php` is allowed), or a catalog image that
  is missing, empty, mis-cased or not a real JPEG — keep every one of those
  checks. CSS/JS links **do** keep their `?ver=` cache-bust query strings in the
  built output (an earlier note here claimed otherwise — it was wrong). Format
  scripts use `--ignore-path .prettierignore` so gitignored output still
  formats; no Tailwind Prettier plugin; the format glob covers no `.ts` and no
  `.php` (none remains). **GitHub Pages** (`.github/workflows/pages.yml`): push
  to `main` deploys `dist/site/`; the workflow installs no PHP. `src/admin/` and
  `src/api/` do not run on Pages — run them locally with `pnpm run admin:dev`
  and open `/admin` on the API's own port.
- macOS Finder duplicate copies (`* 2.*` files and empty `* 2` dirs) are junk;
  delete them and keep them gitignored (do not treat as source files).
