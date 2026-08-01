## Learned User Preferences

- Prefer camelCase for new HTML/CSS/JS identifiers; when editing nearby code,
  rename non-camelCase to camelCase.
- Use https://www.mrlxzin.com (especially `/html/00_main/`) as the primary
  layout/behavior reference; if copying its left-side progress bar, place it on
  the right of this site.
- Keep motion subtle and non-excessive; no sequential fade-ups. Section 3
  title underline sweep was removed on 2026-08-01.
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

## Learned Workspace Facts

- Static Korean AGVS marketing site (multi-page): plain HTML/CSS/vanilla JS,
  fixed 1920px width, assets under `stlye/` (intentional misspelling), `js/`,
  and `img/`.
- `DetailList.php` is the item list page (filters: 전체, AGV, ForkLift,
  Technology) with page styles in `stlye/DetailList.css`.
- Section 2 is three equal hover-expand panels using `img/sec02_01.png`,
  `img/sec02_02.png`, and `img/sec02_03.png`.
- Section 3 is ~70% left `img/sec03.png` and ~30% right vision copy on a soft
  teal panel (`#E8F6F5`), with slogans ("물류가 스스로 움직이는 세상" / "AGVS의
  비전", "자율주행 기술로 산업 현장의 미래를 연결합니다.", "Beyond Logistics
  Automation") and a Contact us CTA.
- Footer link columns are 개인정보 처리방침 (AGV, ForkLift) and 사이트맵
  (Technology); no "빠른 링크" column.
- Footer contact from https://www.agvsk.com includes TEL (+82-70-7734-7890), FAX
  (+82-303-0951-0852), Email (info@agvsk.com), and the Siheung address.
- GNB top-level label spelling is Technology.
