#!/usr/bin/env bash
# PHP/TS 정적 렌더 결과를 페이지별로 비교한다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PHP_OUT="$ROOT/_site"
TS_OUT="$ROOT/_site-ts"
MAX_DIFFS=3
MAX_DIFF_LINES=120

cd "$ROOT"
pnpm run build:static
pnpm run build:ts

# 공백 차이를 제거한 뒤 실제 마크업만 비교한다.
HTML_FILES=()
while IFS= read -r -d '' file; do
  HTML_FILES+=("$file")
done < <(find "$PHP_OUT" "$TS_OUT" -type f -name '*.html' -print0)

if [ "${#HTML_FILES[@]}" -gt 0 ]; then
  pnpm exec prettier --ignore-path .prettierignore --write "${HTML_FILES[@]}"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

(cd "$PHP_OUT" && find . -type f -name '*.html' -print | sed 's|^\./||' | LC_ALL=C sort) \
  > "$TMP_DIR/php-pages"
(cd "$TS_OUT" && find . -type f -name '*.html' -print | sed 's|^\./||' | LC_ALL=C sort) \
  > "$TMP_DIR/ts-pages"
LC_ALL=C sort -u "$TMP_DIR/php-pages" "$TMP_DIR/ts-pages" > "$TMP_DIR/all-pages"

identical=0
differ=0
missing=0
shownDiffs=0

while IFS= read -r page; do
  [ -n "$page" ] || continue
  phpFile="$PHP_OUT/$page"
  tsFile="$TS_OUT/$page"

  if [ ! -f "$phpFile" ]; then
    echo "missing: $page (missing from _site/)"
    missing=$((missing + 1))
    continue
  fi
  if [ ! -f "$tsFile" ]; then
    echo "missing: $page (missing from _site-ts/)"
    missing=$((missing + 1))
    continue
  fi
  if cmp -s "$phpFile" "$tsFile"; then
    echo "identical: $page"
    identical=$((identical + 1))
    continue
  fi

  echo "differs: $page"
  differ=$((differ + 1))
  if [ "$shownDiffs" -lt "$MAX_DIFFS" ]; then
    diff -u --label "_site/$page" --label "_site-ts/$page" "$phpFile" "$tsFile" \
      > "$TMP_DIR/current.diff" || true
    sed -n "1,${MAX_DIFF_LINES}p" "$TMP_DIR/current.diff"
    diffLines="$(wc -l < "$TMP_DIR/current.diff" | tr -d ' ')"
    if [ "$diffLines" -gt "$MAX_DIFF_LINES" ]; then
      echo "... diff truncated after $MAX_DIFF_LINES lines"
    fi
    shownDiffs=$((shownDiffs + 1))
  fi
done < "$TMP_DIR/all-pages"

echo "$identical identical, $differ differ, $missing missing"
[ "$differ" -eq 0 ] && [ "$missing" -eq 0 ]
