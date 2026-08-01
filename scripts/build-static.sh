#!/usr/bin/env bash
# PHP include 를 실제로 실행해 정적 HTML 로 렌더한 뒤 _site/ 에 배포본을 만든다.
# GitHub Pages 는 PHP 를 실행하지 않으므로, 빌드 시점에 헤더/푸터를 미리 합쳐 둔다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/_site"
PAGES=(index DetailList Overview Sitemap Video)
ASSETS=(stlye js img video)

command -v php >/dev/null 2>&1 || { echo "php 가 필요합니다."; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT"

for page in "${PAGES[@]}"; do
  php "$ROOT/$page.php" > "$OUT/$page.html"
done

# 아이템 상세 페이지: 카탈로그의 각 slug 마다 view.php 를 한 번씩 렌더한다.
# view/ 하위 디렉터리를 만들지 않고 출력 루트에 바로 flat 하게 쓴다 — 헤더/푸터의
# href="#" 앵커와 ./img/... 상대 경로가 <base> 태그나 depth prefix 없이도 그대로 맞는다.
# php -r 의 출력을 프로세스 치환(< <(...))으로 바로 읽으면 파이프라인의 종료 상태에
# php 실행 결과가 반영되지 않아 set -euo pipefail 로도 실패를 잡을 수 없다.
# 변수에 먼저 담아 종료 상태와 빈 결과를 명시적으로 검사한다.
SLUGS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/items.json"),true); if(!is_array($d) || !isset($d["items"]) || !is_array($d["items"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["items"] as $i) echo $i["slug"],"\n";')" \
  || { echo "FAIL: 카탈로그에서 슬러그 목록을 읽지 못했습니다."; exit 1; }
[ -n "$SLUGS" ] || { echo "FAIL: 카탈로그에 항목이 없습니다."; exit 1; }

slugCount=0
while IFS= read -r slug; do
  [ -n "$slug" ] || continue
  BUILD_ITEM="$slug" php "$ROOT/view.php" > "$OUT/view-$slug.html"
  slugCount=$((slugCount + 1))
done <<< "$SLUGS"

renderedCount="$(ls -1 "$OUT"/view-*.html 2>/dev/null | wc -l | tr -d ' ')"
[ "$renderedCount" -eq "$slugCount" ] \
  || { echo "FAIL: 렌더된 상세 페이지 수($renderedCount)가 슬러그 수($slugCount)와 일치하지 않습니다."; exit 1; }

# 영상 상세 페이지: videos.json 의 각 slug 마다 VideoView.php 를 한 번씩 렌더한다.
# 위 상세 페이지 루프와 동일한 이유로, 프로세스 치환 대신 변수에 먼저 담아
# 종료 상태와 빈 결과를 명시적으로 검사한다.
VIDEO_SLUGS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/videos.json"),true); if(!is_array($d) || !isset($d["videos"]) || !is_array($d["videos"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["videos"] as $v) echo $v["slug"],"\n";')" \
  || { echo "FAIL: 영상 카탈로그에서 슬러그 목록을 읽지 못했습니다."; exit 1; }
[ -n "$VIDEO_SLUGS" ] || { echo "FAIL: 영상 카탈로그에 항목이 없습니다."; exit 1; }

videoSlugCount=0
while IFS= read -r slug; do
  [ -n "$slug" ] || continue
  BUILD_ITEM="$slug" php "$ROOT/VideoView.php" > "$OUT/video-$slug.html"
  videoSlugCount=$((videoSlugCount + 1))
done <<< "$VIDEO_SLUGS"

renderedVideoCount="$(ls -1 "$OUT"/video-*.html 2>/dev/null | wc -l | tr -d ' ')"
[ "$renderedVideoCount" -eq "$videoSlugCount" ] \
  || { echo "FAIL: 렌더된 영상 상세 페이지 수($renderedVideoCount)가 슬러그 수($videoSlugCount)와 일치하지 않습니다."; exit 1; }

# 페이지 간 링크를 .php -> .html 로 치환 (?category= 같은 쿼리는 보존)
# 1) 상세 페이지 쿼리 링크를 먼저 생성된 파일명으로 치환한다 — VideoView.php?item=...
#    를 view.php?item=... 보다 먼저 치환해야, VideoView.php 문자열이 뒤이은
#    일반 치환 단계에 남아 있지 않게 된다.
# 2) 그 다음 일반 페이지 링크를 치환한다 — 새로 만든 view-*.html/video-*.html 에도
#    헤더/푸터의 index.php, DetailList.php, Overview.php, Sitemap.php, Video.php
#    링크가 들어 있으므로 전체 파일에 적용한다. Video.php 를 Video|... 알파벳순
#    치환으로 더할 때 VideoView.php 의 "Video" 부분과 부분 매칭되지 않도록
#    \b...\.php\b 로 완전한 파일명 전체를 앵커링한다.
for f in "$OUT"/*.html; do
  perl -pi -e 's/VideoView\.php\?item=([A-Za-z0-9_-]+)/video-$1.html/g' "$f"
  perl -pi -e 's/view\.php\?item=([A-Za-z0-9_-]+)/view-$1.html/g' "$f"
  perl -pi -e 's/\b(index|DetailList|Overview|Sitemap|Video)\.php\b/$1.html/g' "$f"
done

for dir in "${ASSETS[@]}"; do
  [ -d "$ROOT/$dir" ] && cp -R "$ROOT/$dir" "$OUT/$dir"
done

# Pages 의 기본 Jekyll 처리를 끈다.
touch "$OUT/.nojekyll"

# 렌더 결과 검증: PHP 가 남아 있거나 헤더/푸터가 빠지면 즉시 실패시킨다.
# index/DetailList 뿐 아니라 새로 생성된 view-*.html 을 포함해 전체 파일을 검사한다.
fail=0
for f in "$OUT"/*.html; do
  page="$(basename "$f")"
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

# 카탈로그가 참조하는 이미지가 빌드 결과물(_site/)에 실제로 존재하는지 검증한다.
# 소스 트리에만 있고 복사가 안 됐거나, 애초에 존재하지 않는 경로 오타를 잡아낸다.
# 위와 같은 이유로 프로세스 치환 대신 변수에 먼저 담아 종료 상태와 빈 결과를 검사한다.
IMG_SRCS="$(php -r '$d=json_decode(file_get_contents("'"$ROOT"'/data/items.json"),true); if(!is_array($d) || !isset($d["items"]) || !is_array($d["items"])){fwrite(STDERR,"catalog parse failed\n"); exit(1);} foreach($d["items"] as $i) foreach($i["images"] as $m) echo $m["src"],"\n";')" \
  || { echo "FAIL: 카탈로그에서 이미지 경로를 읽지 못했습니다."; exit 1; }
[ -n "$IMG_SRCS" ] || { echo "FAIL: 카탈로그에 이미지가 없습니다."; exit 1; }

# 파일 존재만으로는 부족하다: 이 macOS 파일시스템은 대소문자를 구분하지 않아
# [ -f ... ] 만으로는 Heavy/01.JPG 같은 대소문자 불일치도 통과해 버리지만,
# GitHub Pages 는 대소문자를 구분하므로 실제 배포에서는 404 가 된다.
# 또한 크기가 0 이거나 실제로는 HTML 오류 페이지를 .jpg 로 저장한 경우도 걸러낸다.
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
