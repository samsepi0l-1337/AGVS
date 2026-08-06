# AGVS

AGVS(무인운반차 시스템) 한국어 기업 마케팅 사이트입니다.
프레임워크·jQuery·번들러 없이 순수 HTML/CSS와 TypeScript로 만들어졌고, 빌드
시점에 SQLite를 읽어 `dist/site/`를 생성한 뒤 GitHub Pages가 그것을 서빙합니다.

- 배포 사이트: <https://samsepi0l-1337.github.io/AGVS/>
- 언어: 한국어 / 영어 / 일본어 (페이지당 23개 × 3로케일 = 69개 생성)

설계 의도와 아키텍처 세부는 [`CLAUDE.md`](CLAUDE.md)와
[`AGENTS.md`](AGENTS.md)에 있습니다. 이 문서는 **clone 또는 pull 직후 무엇을
해야 하는가**만 다룹니다.

## 사전 준비물

| 도구    | 버전                              | 확인      |
| ------- | --------------------------------- | --------- |
| Node.js | **22 이상**                       | `node -v` |
| pnpm    | 10.12.1 (`packageManager`가 고정) | `pnpm -v` |

Node 22 미만은 쓰면 안 됩니다. `better-sqlite3`의 linux-x64 prebuild가 Node
20에서 세그폴트로 죽고, 빌드가 exit 139로 끝납니다. CI도 이 때문에 Node 24로
고정되어 있습니다.

PHP는 **필요 없습니다.** 예전에는 렌더러와 관리 화면이 PHP였지만 전부
TypeScript로 이관됐고, 저장소에 `.php` 파일은 하나도 남아 있지 않습니다.

## clone 직후

```bash
git clone https://github.com/samsepi0l-1337/AGVS.git
cd AGVS
pnpm install --frozen-lockfile
pnpm run build
```

이게 전부입니다. `data/agvs.sqlite`가 저장소에 함께 커밋되어 있으므로 별도의 DB
시딩이나 `.env` 없이도 정적 사이트가 바로 빌드됩니다.

빌드 결과 확인:

```bash
cd dist/site && python3 -m http.server 8848
# http://localhost:8848 접속
```

`--frozen-lockfile`은 CI가 쓰는 것과 같은 명령입니다. 이게 실패하면
`pnpm-lock.yaml`이 `package.json`과 어긋난 것이므로, 로컬에서 `pnpm install`로
락파일을 갱신하고 **그 변경을 함께 커밋**해야 합니다.

## pull 직후

```bash
git pull
pnpm install --frozen-lockfile   # package.json / pnpm-lock.yaml이 바뀌었을 때만
pnpm run build
```

**라이브 리로드 개발 서버는 없습니다.** 소스를 고쳤으면 다시 빌드해야 결과가
보입니다 — TypeScript 렌더러로 이관하면서 감수한 트레이드오프입니다. 다만 매번
전체 빌드를 돌릴 필요는 없습니다:

| 무엇을 고쳤나                              | 돌릴 것                                    | 대략 소요 |
| ------------------------------------------ | ------------------------------------------ | --------- |
| 마크업·콘텐츠 (`src/build/templates/`, DB) | `pnpm run build:static`                    | ~1.5초    |
| 브라우저 스크립트 (`src/scripts/`)         | `pnpm run build`                           | 수 초     |
| CSS (`src/assets/css/`)                    | `pnpm run build:static` + **캐시버스팅** ↓ | ~1.5초    |

### CSS/JS를 고쳤으면 캐시버스팅이 필수

페이지는 자산을 `?ver=YYYYMMDD<letter>` 쿼리스트링으로 링크합니다. 브라우저가 이
파일들을 공격적으로 캐싱하기 때문에 **버전을 올리지 않으면 수정이 조용히
반영되지 않습니다.** 모든 페이지의 참조를 한 번에 올리세요:

```bash
perl -pi -e 's/ver=20260804b/ver=20260804c/g' src/build/templates/*.ts
```

알려진 한계: `?ver=`가 붙는 것은 진입 모듈뿐입니다. 그것이 import하는 모듈
(`./home/sectionSnap.js` 등)은 브라우저가 맨 경로로 가져가므로 진입 모듈만
올려서는 무효화되지 않습니다. 로컬 개발에서만 문제가 되고, 하드 리로드로
해결됩니다.

## 스크립트

| 명령                    | 하는 일                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `pnpm run build`        | `build:js` → `build:static` → Prettier 포맷. 로컬·CI 공통 진입점 |
| `pnpm run build:js`     | `tsc -p tsconfig.json` — `src/` 전체를 `dist/`로 컴파일          |
| `pnpm run build:static` | `tsx src/build/render.ts` — `dist/site/` 생성                    |
| `pnpm run typecheck`    | 타입 검사만 (emit 없음)                                          |
| `pnpm run rebuild:db`   | JSON 시드로 `data/agvs.sqlite`를 **재생성** (아래 경고 참조)     |
| `pnpm run admin:dev`    | 관리 UI 컴파일 후 Express API 기동                               |

린트도 테스트도 없습니다. 검증은 빌드 통과와 실제 브라우저 측정입니다.

> **`rebuild:db`는 일상 작업용이 아닙니다.** JSON 시드로 DB를 통째로 다시 만들기
> 때문에 관리 화면으로 넣은 내용이 사라집니다. 번역을 포함한 평상시 콘텐츠
> 수정은 관리 UI(또는 admin API)로 하세요. 시드 파일을 손으로 고치는 것도 번역
> 워크플로가 아닙니다.

## 관리 UI / API를 돌리려면

정적 사이트만 빌드할 거라면 이 절은 건너뛰어도 됩니다. 관리 화면은 GitHub
Pages에서 동작하지 않으며 로컬에서만 띄웁니다.

1. 환경 파일을 만듭니다. `.env`는 **절대 커밋하지 마세요** (gitignore되어
   있습니다).

   ```bash
   cp .env.example .env
   ```

2. 관리자 비밀번호의 bcrypt 해시를 만들어 `AGVS_ADMIN_PASSWORD_HASH`에 넣습니다.
   평문 비밀번호는 어떤 파일에도 남기지 마세요.

   ```bash
   node -e 'import("bcryptjs").then(m=>console.log(m.default.hashSync("여기에-비밀번호",12)))'
   ```

   생성되는 `$2b$` 해시를 API가 그대로 받습니다. PHP 시절의 `$2y$` 해시도 계속
   동작합니다(`src/api/auth.ts`가 `$2a$`로 정규화합니다).

3. 세션 서명용 비밀키를 `AGVS_ADMIN_SESSION_SECRET`에 넣습니다(16자 이상).

   ```bash
   node -e 'import("node:crypto").then(c=>console.log(c.randomBytes(32).toString("hex")))'
   ```

4. 기동합니다.

   ```bash
   pnpm run admin:dev
   # http://127.0.0.1:8850/admin
   ```

관리 UI는 API가 같은 오리진에서 직접 서빙합니다. 별도 서버를 띄우지 마세요 —
동일 오리진이라는 점이 CORS 허용목록을 좁게 유지할 수 있는 이유입니다.

### 환경 변수

| 변수                        | 필수 | 기본값             | 용도                              |
| --------------------------- | ---- | ------------------ | --------------------------------- |
| `AGVS_ADMIN_PASSWORD_HASH`  | ✅   | —                  | 관리자 비밀번호 bcrypt 해시       |
| `AGVS_ADMIN_SESSION_SECRET` | ✅   | —                  | 세션 쿠키 HMAC 키 (16자 이상)     |
| `AGVS_SQLITE_PATH`          |      | `data/agvs.sqlite` | 콘텐츠 DB 경로                    |
| `AGVS_ADMIN_API_PORT`       |      | `8850`             | API 리슨 포트                     |
| `AGVS_ADMIN_ORIGIN`         |      | —                  | 추가 CORS 허용 오리진 (쉼표 구분) |

앞의 두 개가 없으면 API는 기동하지 않고 어느 변수가 빠졌는지 알려주며
종료합니다.

API 엔드포인트 전체 목록과 번역 워크플로는
[`src/api/README.md`](src/api/README.md)에 있습니다.

## 저장소 구조

```
src/
  build/        정적 렌더러 (TypeScript, tsx로 실행)
    templates/  header·footer·contactPop + 페이지별 템플릿
  scripts/      브라우저 소스 (core / layout / home / detail + main.ts)
  assets/       css, img, video
  api/          Express 관리 API + 다운로드 라우트
  admin/        관리 UI (index.html, assets, ts)

data/           SQLite + JSON 시드
storage/        업로드 파일 (gitignore — 아래 참조)
dist/           모든 빌드 산출물 (gitignore)
  site/           배포되는 정적 사이트  <- Pages가 업로드하는 대상
  scripts/        컴파일된 브라우저 JS
  admin/ts/       컴파일된 관리 UI JS
  api/            컴파일된 API
```

**빌드 산출물은 전부 `dist/` 아래에만 생깁니다.** `src/` 안에서 생성되는 것은
없습니다 — `src/`에 `js/` 디렉터리가 보이면 옛 잔재이므로 지우는 게 맞습니다.

TypeScript는 루트의 **`tsconfig.json` 하나**가 `src/` 전체를 단일 프로젝트로
컴파일합니다. 번들러가 없으므로 **모든 상대 import는 명시적인 `.js` 확장자를
달아야 합니다** — 디스크의 파일이 `.ts`여도 그렇습니다. 확장자를 빠뜨리면 404가
배포됩니다.

## 배포

`main`에 푸시하면 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)이
빌드해서 `dist/site/`를 GitHub Pages로 올립니다. 수동 작업은 없습니다.

페이지 파일명의 **대소문자가 의미를 갖습니다**(`DetailList.html`). macOS는
대소문자를 구분하지 않지만 GitHub Pages는 구분하므로, 로컬에서 멀쩡하던 링크가
배포 후 404가 될 수 있습니다. 렌더러에 자산 대소문자 검사가 들어 있는 것도 이
때문이니 지우지 마세요.

## 알아둘 것

- **`storage/`는 저장소에 없습니다.** 업로드 파일 디렉터리 전체가 gitignore
  대상이라 clone 직후에도, CI에도 존재하지 않습니다. 그 결과 **자료실 첨부 PDF
  링크는 배포 사이트에서 404입니다** — 확인된 사실이며 이번 변경으로 생긴 문제가
  아닙니다. 첨부를 실제로 서빙하려면 파일을 저장소에 넣든지 외부 스토리지에
  두든지 별도 결정이 필요합니다.
- **macOS Finder 중복본**(`* 2.ts` 파일, 빈 `* 2` 디렉터리)은 소스가 아니라
  쓰레기입니다. gitignore되어 있고, 보이면 지우면 됩니다.
- **Contact Us 폼에는 백엔드가 없습니다.** 폼 서비스 연동 / `mailto:` 링크 / 폼
  제거 중 무엇을 할지 아직 정해지지 않았습니다.
- 알려진 미해결 결함(Firefox 휠 스크롤, 확대 제스처 차단 등)은 `CLAUDE.md`의
  "Known open defects"에 정리되어 있습니다. 의도적으로 보류된 것들입니다.
