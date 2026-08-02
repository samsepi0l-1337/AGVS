## Learned User Preferences

- Prefer camelCase for new HTML/CSS/JS identifiers; when editing nearby code,
  rename non-camelCase to camelCase.
- Use https://www.mrlxzin.com (especially `/html/00_main/`) as the primary
  layout/behavior reference; if copying its left-side progress bar, place it on
  the right of this site.
- Keep motion subtle and non-excessive; no sequential fade-ups. Section 3 title
  underline sweep was removed on 2026-08-01.
- Footer must not include App Store / Google Play badges; SNS icons are
  Facebook, Instagram, X, LinkedIn, and YouTube; put a scroll-to-top control
  where store badges would have been.
- Prefer matching provided reference/example layouts (screenshots or cited
  sites) over inventing alternate structures.
- Footer language switcher labels are KR, EN, and JP.
- Footer copyright uses the form `Copyrights(C) YYYY AGVS. All Rights Reserved.`
- Share header/footer via server-side PHP includes:
  `<?php include __DIR__ . "/include/header.html"; ?>` and the footer
  equivalent, pulling `include/header.html` and `include/footer.html`. Put
  chrome CSS in `stlye/layout.css`; keep chrome JS (GNB, footer lang, Top) and
  FullPage/section snap together in `js/main.js`, which both pages load.
  (Superseded 2026-07-30: this was previously a JS-fetched `data-include` scheme
  with `partials/` and a separate `js/layout.js`; both are gone.)
- Shared header/footer must not depend on `.OverView`; DetailList matches home
  header hover; Top uses snap `go(0)` when available else native scroll; logo
  links to `index.php`, Contact Us stays `#`.
- GNB About top label is language-aware (KR `회사소개` / EN `About` / JP
  `会社紹介`); About submenu labels `Overview` and `AGV Video` stay English in
  all languages.
- Keep `Contact Us` / `CONTACT US` untranslated (header link, Section 3 CTA,
  contact popup title); translate other chrome and section copy per KR/EN/JP.

## Learned Workspace Facts

- Static AGVS marketing site (multi-page): plain HTML/CSS/vanilla JS with
  KR/EN/JP i18n via `include/lang.php` and cookie `agvs_lang`; assets under
  `stlye/` (intentional misspelling), `js/`, and `img/`.
- Product catalog is `data/items{KR|EN|JP}.json`; items use `models[]`
  (`id`, `label`, `specs`, `images[]`). UI chrome/Section 3/contact copy lives
  in `data/ui{KR|EN|JP}.json` and is read through `agvs_t()`.
- Pages include `index.php`, `DetailList.php`, `view.php` (model `<select>`
  drives specs/images), `Overview.php`, `Video.php`, `VideoView.php`, and
  `Sitemap.php`.
- `DetailList.php` is the item list page (filters: 전체, AGV, ForkLift,
  Technology) with page styles in `stlye/DetailList.css`.
- Section 2 is three equal hover-expand panels using `img/sec02_01.png`,
  `img/sec02_02.png`, and `img/sec02_03.png`.
- Section 3 is ~70% left `img/sec03.png` and ~30% right vision copy on a soft
  teal panel (`#E8F6F5`), with localized title/description via `agvs_t("sec03.*")`
  and an untranslated Contact us CTA.
- Footer link columns are 개인정보 처리방침 (AGV, ForkLift) and 사이트맵
  (Technology); no "빠른 링크" column.
- Footer/contact address is KR `경기 시흥시 서울대학로 59-21, 로얄팰리스테크노1차
  703` and EN `703 Royal Palace Techno 1st, 59-21, Seouldaehak-ro, Siheung-si,
  Gyeonggi-do, Republic of Korea`; contact also includes TEL
  (+82-70-7734-7890), FAX (+82-303-0951-0852), and Email (info@agvsk.com).
- GNB top-level label spelling is Technology.
