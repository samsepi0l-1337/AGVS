#!/usr/bin/env bash
# PHP include 를 실제로 실행해 정적 HTML 로 렌더한 뒤 _site/ 에 배포본을 만든다.
# GitHub Pages 는 PHP 를 실행하지 않으므로, 빌드 시점에 헤더/푸터를 미리 합쳐 둔다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/_site"
PAGES=(index DetailList)
ASSETS=(stlye js img video)

command -v php >/dev/null 2>&1 || { echo "php 가 필요합니다."; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT"

for page in "${PAGES[@]}"; do
  php "$ROOT/$page.php" > "$OUT/$page.html"
done

# 페이지 간 링크를 .php -> .html 로 치환 (?category= 같은 쿼리는 보존)
for page in "${PAGES[@]}"; do
  perl -pi -e 's/\b(index|DetailList)\.php\b/$1.html/g' "$OUT/$page.html"
done

for dir in "${ASSETS[@]}"; do
  [ -d "$ROOT/$dir" ] && cp -R "$ROOT/$dir" "$OUT/$dir"
done

# Pages 의 기본 Jekyll 처리를 끈다.
touch "$OUT/.nojekyll"

# 렌더 결과 검증: PHP 가 남아 있거나 헤더/푸터가 빠지면 즉시 실패시킨다.
fail=0
for page in "${PAGES[@]}"; do
  f="$OUT/$page.html"
  if grep -q '<?php' "$f"; then
    echo "FAIL: $page.html 에 실행되지 않은 PHP 가 남아 있습니다."; fail=1
  fi
  if ! grep -q '<header>' "$f"; then
    echo "FAIL: $page.html 에 헤더가 없습니다."; fail=1
  fi
  if ! grep -q 'id="Footer"' "$f"; then
    echo "FAIL: $page.html 에 푸터가 없습니다."; fail=1
  fi
  if grep -q '\.php"' "$f" || grep -q '\.php?' "$f"; then
    echo "FAIL: $page.html 에 .php 링크가 남아 있습니다."; fail=1
  fi
done
[ "$fail" -eq 0 ] || exit 1

echo "빌드 완료: $OUT"
ls -1 "$OUT"
