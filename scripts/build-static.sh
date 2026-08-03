#!/usr/bin/env bash
# PHP include 를 실제로 실행해 정적 HTML 로 렌더한 뒤 _site/ 에 배포본을 만든다.
# GitHub Pages 는 PHP 를 실행하지 않으므로, 빌드 시점에 헤더/푸터를 미리 합쳐 둔다.
# 언어별 HTML: KR → _site/*.html, EN → _site/en/*.html, JP → _site/jp/*.html
# 에셋(stlye/js/img/video)은 _site/ 루트에 한 번만 복사하고, en/jp 페이지는 ../ 로 참조한다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/_site"
PAGES=(index DetailList Overview Sitemap Video Archive)
ASSETS=(stlye js img video)

command -v php >/dev/null 2>&1 || { echo "php 가 필요합니다."; exit 1; }

# php -r 의 출력을 프로세스 치환(< <(...))으로 바로 읽으면 파이프라인의 종료 상태에
# php 실행 결과가 반영되지 않아 set -euo pipefail 로도 실패를 잡을 수 없다.
# 변수에 먼저 담아 종료 상태와 빈 결과를 명시적으로 검사한다.
# 슬러그 목록은 로케일 간 동일하므로 KR 카탈로그에서 한 번만 읽는다.
SLUGS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/itemsKR.json"),true); if(!is_array($d) || !isset($d["items"]) || !is_array($d["items"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["items"] as $i) echo $i["slug"],"\n";')" \
  || { echo "FAIL: 카탈로그에서 슬러그 목록을 읽지 못했습니다."; exit 1; }
[ -n "$SLUGS" ] || { echo "FAIL: 카탈로그에 항목이 없습니다."; exit 1; }

VIDEO_SLUGS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/videos.json"),true); if(!is_array($d) || !isset($d["videos"]) || !is_array($d["videos"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["videos"] as $v) echo $v["slug"],"\n";')" \
  || { echo "FAIL: 영상 카탈로그에서 슬러그 목록을 읽지 못했습니다."; exit 1; }
[ -n "$VIDEO_SLUGS" ] || { echo "FAIL: 영상 카탈로그에 항목이 없습니다."; exit 1; }

ARCHIVE_SLUGS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/uiKR.json"),true); if(!is_array($d) || !isset($d["archive"]["items"]) || !is_array($d["archive"]["items"])){fwrite(STDERR,"ui parse failed\n"); exit(1);} foreach($d["archive"]["items"] as $i) echo $i["slug"],"\n";')" \
  || { echo "FAIL: 자료실 슬러그 목록을 읽지 못했습니다."; exit 1; }
[ -n "$ARCHIVE_SLUGS" ] || { echo "FAIL: 자료실에 항목이 없습니다."; exit 1; }

# CLI 에서 $_GET["lang"] 을 주입한 뒤 require 로 페이지를 렌더한다.
# require 를 쓰면 페이지 내부 __DIR__ 이 소스 트리 기준으로 올바르게 해석된다.
render_php() {
  local lang_code="$1"
  local src="$2"
  local dest="$3"
  php -r '$_GET["lang"]=$argv[1]; require $argv[2];' "$lang_code" "$src" > "$dest"
}

# 한 언어를 DEST 디렉터리에 렌더한다. DEST 가 en/jp 하위면 에셋 경로를 ../ 로 고친다.
render_locale() {
  local LANG_CODE="$1"
  local DEST="$2"
  mkdir -p "$DEST"

  local page
  for page in "${PAGES[@]}"; do
    render_php "$LANG_CODE" "$ROOT/$page.php" "$DEST/$page.html"
  done

  # 아이템 상세: view/ 하위 없이 flat 하게 쓴다 — 헤더/푸터의 href 와
  # ./img/... 상대 경로가 <base> 나 depth prefix 없이도 맞는다(루트 로케일).
  local slug slugCount=0
  while IFS= read -r slug; do
    [ -n "$slug" ] || continue
    BUILD_ITEM="$slug" render_php "$LANG_CODE" "$ROOT/view.php" "$DEST/view-$slug.html"
    slugCount=$((slugCount + 1))
  done <<< "$SLUGS"

  local renderedCount
  renderedCount="$(ls -1 "$DEST"/view-*.html 2>/dev/null | wc -l | tr -d ' ')"
  [ "$renderedCount" -eq "$slugCount" ] \
    || { echo "FAIL: [$LANG_CODE] 렌더된 상세 페이지 수($renderedCount)가 슬러그 수($slugCount)와 일치하지 않습니다."; exit 1; }

  local videoSlugCount=0
  while IFS= read -r slug; do
    [ -n "$slug" ] || continue
    BUILD_ITEM="$slug" render_php "$LANG_CODE" "$ROOT/VideoView.php" "$DEST/video-$slug.html"
    videoSlugCount=$((videoSlugCount + 1))
  done <<< "$VIDEO_SLUGS"

  local renderedVideoCount
  renderedVideoCount="$(ls -1 "$DEST"/video-*.html 2>/dev/null | wc -l | tr -d ' ')"
  [ "$renderedVideoCount" -eq "$videoSlugCount" ] \
    || { echo "FAIL: [$LANG_CODE] 렌더된 영상 상세 페이지 수($renderedVideoCount)가 슬러그 수($videoSlugCount)와 일치하지 않습니다."; exit 1; }

  local archiveSlugCount=0
  while IFS= read -r slug; do
    [ -n "$slug" ] || continue
    BUILD_ARCHIVE="$slug" render_php "$LANG_CODE" "$ROOT/view.php" "$DEST/archive-$slug.html"
    archiveSlugCount=$((archiveSlugCount + 1))
  done <<< "$ARCHIVE_SLUGS"

  local renderedArchiveCount
  renderedArchiveCount="$(ls -1 "$DEST"/archive-*.html 2>/dev/null | wc -l | tr -d ' ')"
  [ "$renderedArchiveCount" -eq "$archiveSlugCount" ] \
    || { echo "FAIL: [$LANG_CODE] 렌더된 자료실 상세 페이지 수($renderedArchiveCount)가 슬러그 수($archiveSlugCount)와 일치하지 않습니다."; exit 1; }

  # 페이지 간 링크를 .php -> .html 로 치환 (?category= 같은 쿼리는 보존)
  # 1) 상세 쿼리 링크를 먼저 치환 — VideoView.php?item= 을 view.php?item= 보다 먼저
  # 2) 일반 페이지 링크 — \b...\b 로 VideoView.php 의 Video 부분 매칭을 피한다
  local f
  for f in "$DEST"/*.html; do
    perl -pi -e 's/VideoView\.php\?item=([A-Za-z0-9_-]+)/video-$1.html/g' "$f"
    perl -pi -e 's/view\.php\?archive=([A-Za-z0-9_-]+)/archive-$1.html/g' "$f"
    perl -pi -e 's/view\.php\?item=([A-Za-z0-9_-]+)/view-$1.html/g' "$f"
    perl -pi -e 's/\b(index|DetailList|Overview|Sitemap|Video|Archive)\.php\b/$1.html/g' "$f"
  done

  # en/jp 하위 디렉터리: ./stlye ./js ./img ./video → ../… (DetailList.html 등 페이지 링크는 유지)
  case "$DEST" in
    */en|*/jp)
      perl -pi -e 's/\b(href|src)="\.\//$1="..\//g' "$DEST"/*.html
      ;;
  esac
}

rm -rf "$OUT"
mkdir -p "$OUT"

render_locale KR "$OUT"
render_locale EN "$OUT/en"
render_locale JP "$OUT/jp"

for dir in "${ASSETS[@]}"; do
  [ -d "$ROOT/$dir" ] && cp -R "$ROOT/$dir" "$OUT/$dir"
done

# Pages 의 기본 Jekyll 처리를 끈다.
touch "$OUT/.nojekyll"

# 렌더 결과 검증: PHP 가 남아 있거나 헤더/푸터가 빠지면 즉시 실패시킨다.
# 루트·en·jp 전 로케일 HTML 을 검사한다.
fail=0
shopt -s nullglob
for f in "$OUT"/*.html "$OUT"/en/*.html "$OUT"/jp/*.html; do
  page="${f#"$OUT"/}"
  if grep -q '<?php' "$f"; then
    echo "FAIL: $page 에 실행되지 않은 PHP 가 남아 있습니다."; fail=1
  fi
  if ! grep -qE '<header[ >]' "$f"; then
    echo "FAIL: $page 에 헤더가 없습니다."; fail=1
  fi
  if ! grep -q 'id="Footer"' "$f"; then
    echo "FAIL: $page 에 푸터가 없습니다."; fail=1
  fi
  if grep -q '\.php"' "$f" || grep -q '\.php?' "$f"; then
    echo "FAIL: $page 에 .php 링크가 남아 있습니다."; fail=1
  fi
done
shopt -u nullglob

# 카탈로그가 참조하는 이미지가 빌드 결과물(_site/)에 실제로 존재하는지 검증한다.
# 소스 트리에만 있고 복사가 안 됐거나, 애초에 존재하지 않는 경로 오타를 잡아낸다.
IMG_SRCS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/itemsKR.json"),true); if(!is_array($d) || !isset($d["items"]) || !is_array($d["items"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["items"] as $i) foreach($i["models"] as $m) if(!empty($m["images"])) foreach($m["images"] as $img) echo $img["src"],"\n";')" \
  || { echo "FAIL: 카탈로그에서 이미지 경로를 읽지 못했습니다."; exit 1; }
[ -n "$IMG_SRCS" ] || { echo "FAIL: 카탈로그에 이미지가 없습니다."; exit 1; }

# 파일 존재만으로는 부족하다: 이 macOS 파일시스템은 대소문자를 구분하지 않아
# [ -f ... ] 만으로는 Heavy/01.JPG 같은 대소문자 불일치도 통과해 버리지만,
# GitHub Pages 는 대소문자를 구분하므로 실제 배포에서는 404 가 된다.
# 또한 크기가 0 이거나 실제로는 HTML 오류 페이지를 .jpg 로 저장한 경우도 걸러낸다.
# 에셋은 루트에만 있으므로 검사는 $OUT/$imgSrc 기준이다.
while IFS= read -r imgSrc; do
  [ -n "$imgSrc" ] || continue
  imgPath="$OUT/$imgSrc"
  imgDir="$(dirname "$imgPath")"
  imgBase="$(basename "$imgSrc")"

  if [ ! -d "$imgDir" ] || ! ls -1 "$imgDir" 2>/dev/null | grep -Fxq "$imgBase"; then
    echo "FAIL: 카탈로그가 참조하는 이미지가 빌드 결과물에 없습니다(대소문자 불일치 포함): $imgSrc"; fail=1
    continue
  fi

  if [ ! -s "$imgPath" ]; then
    echo "FAIL: 카탈로그가 참조하는 이미지가 빈 파일(0바이트)입니다: $imgSrc"; fail=1
    continue
  fi

  magic="$(head -c2 "$imgPath" | xxd -p)"
  if [ "$magic" != "ffd8" ]; then
    echo "FAIL: 카탈로그가 참조하는 이미지가 유효한 JPEG 가 아닙니다(시그니처 불일치): $imgSrc"; fail=1
    continue
  fi
done <<< "$IMG_SRCS"

[ "$fail" -eq 0 ] || exit 1

echo "빌드 완료: $OUT"
ls -1 "$OUT"
ls -1 "$OUT/en" | head -20
ls -1 "$OUT/jp" | head -20
