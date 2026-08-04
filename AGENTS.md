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
- Share header/footer via PHP includes (`include/header.html`,
  `include/footer.html`; `Overview.php` keeps its page-local header). Put chrome
  CSS in `stlye/layout.css`; keep chrome JS (GNB, footer lang, Top) and
  FullPage/section snap together in `js/main.js`, which both pages load.
  (Superseded 2026-07-30: JS-fetched `data-include` / `partials/` /
  `js/layout.js` are gone.) Shared chrome must not depend on `.OverView`;
  DetailList matches home header hover; Top uses snap `go(0)` when available
  else native scroll; logo links to `index.php`; Contact Us stays `#`.
- GNB About top label is language-aware (KR `회사소개` / EN `About` / JP
  `会社紹介`); About submenu labels `Overview` and `AGV Video` stay English in
  all languages.
- Keep `Contact Us` / `CONTACT US` untranslated (header link, Section 3 CTA,
  contact popup title); translate other chrome and section copy per KR/EN/JP.
- KR is the content source of truth; day-to-day EN/JP work edits only
  language-specific fields via `admin/translate.php` or admin-api i18n PUT—not
  by hand-editing JSON seeds or running `rebuild-sqlite.php` as the translation
  workflow.
- Detail-page hero height 250px and centered title text apply only on mobile
  (`max-width: 767.98px`); desktop detail heroes stay 450px.
- In PHP include templates, keep `<?php` at column 0 when re-entering from HTML
  (leading whitespace is emitted as HTML); indent keywords inside PHP blocks
  only; prefer between-tags `echo` for element text, keep attribute echoes
  inline in attributes.

## Learned Workspace Facts

- Static AGVS marketing site (multi-page): plain HTML/CSS/vanilla JS with
  KR/EN/JP i18n via `include/lang.php` and cookie `agvs_lang`; assets under
  `stlye/` (intentional misspelling), `js/`, and `img/`. Wrappers keep an
  intentional `max-width: 1920px` even when inner widths are %-based; 1920px
  parity remains the acceptance criterion. GNB top-level label spelling is
  Technology.
- Runtime catalog, UI chrome, videos, and archive copy live in
  `data/agvs.sqlite`, read through `include/contentStore.php` and `agvs_t()`.
  `data/items{KR|EN|JP}.json`, `ui*.json`, and `videos.json` are rebuild seeds
  only (`scripts/rebuild-sqlite.php`).
- Pages include `index.php`, `DetailList.php`, `view.php` (model
  `<select class="ViewModelSelect">` styled like `HeaderLangBtn` but wider;
  drives specs/images; also `?archive=slug` for Archive detail), `Overview.php`,
  `Video.php`, `VideoView.php`, `Archive.php`, `Sitemap.php`, plus PHP `admin/`
  and `admin/translate.php` (i18n-only editing).
- `Overview.php` uses its own page-local header (not `include/header.html`);
  copy is keyed under `overview.*` in SQLite UI payloads via `agvs_t()`.
  Scrolled header goes white with `#333333` text and keeps blue hover; avoid
  last-child-only color overrides. Japanese needs `html[lang="ja"]` tweaks
  (`line-break: strict` and related) because fixed `minmax()` floors overflow
  longer JP text.
- `Archive.php` (자료실) is a GNB top-level page with hover submenu; Sitemap
  lists it under 고객지원 with Contact Us. Archive items live in SQLite
  (`archive_i18n` and related tables) and open via `view.php?archive=slug`; PDF
  and Excel attachments download via `download.php` (static build rewrites to
  `storage/` paths).
- `DetailList.php` is the item list page (filters: 전체, AGV, ForkLift,
  Technology) with a horizontal `ul`/`button[data-category]` filter list (not a
  HeaderLang-style dropdown) and page styles in `stlye/DetailList.css`.
- Section 2 is three equal hover-expand panels using `img/sec02_01.png`,
  `img/sec02_02.png`, and `img/sec02_03.png`. Section 3 is ~70% left
  `img/sec03.png` and ~30% right vision copy on a soft teal panel (`#E8F6F5`),
  with localized title/description via `agvs_t("sec03.*")` and an untranslated
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
  header. Use `agvs_asset_url()` for language-stable image and media paths.
- `admin-api/` is a strict TypeScript Express JSON API (session auth, SQLite
  CRUD, i18n-only PUT routes, uploads) sharing `data/agvs.sqlite` with PHP;
  `pnpm run admin:dev` with repo-root `.env` (`AGVS_ADMIN_PASSWORD_HASH`,
  `AGVS_ADMIN_SESSION_SECRET`). PHP `admin/` is not fully wired to the API.
- Package manager is pnpm; local and CI entrypoint is `pnpm run build` (static
  build, then Prettier format). `scripts/build-static.sh` renders KR to
  `_site/*.html`, EN to `_site/en/`, JP to `_site/jp/` (shared assets at
  `_site/` root); static lang switch navigates those paths, while PHP uses
  `?lang=` + cookie. Build reads SQLite via PHP renderers; rewrites
  `download.php` to static file paths; FAIL check allows external `https://`
  `.php` links. CSS/JS links omit `?ver=` cache-bust query strings. Format
  scripts use `--ignore-path .prettierignore` so gitignored `_site/` still
  formats; no Tailwind Prettier plugin; `include/**/*.html` needs a Prettier
  `parser: "php"` override.
