# AGVS Admin API (TypeScript)

Small Node/Express backend for admin auth and SQLite-backed content CRUD. The
public marketing pages are rendered at build time by `src/build/` (TypeScript,
no PHP anywhere) and read the same `data/agvs.sqlite`.

New here? Start with the repo-root [`README.md`](../../README.md) — it covers
clone/pull setup. This file documents the API surface itself.

## Setup

1. Copy env template and set secrets (never commit `.env`):

```bash
cp .env.example .env
```

2. Set `AGVS_ADMIN_PASSWORD_HASH` to a bcrypt hash:

```bash
node -e 'import("bcryptjs").then(m=>console.log(m.default.hashSync("your-password",12)))'
```

That emits `$2b$…`, which is accepted directly. Legacy PHP `$2y$` hashes still
verify — see the auth note below.

3. Set `AGVS_ADMIN_SESSION_SECRET` to a long random string (≥16 chars).

4. `data/agvs.sqlite` is committed, so it is already there after a clone.
   `pnpm run rebuild:db` regenerates it wholesale from the JSON seeds and
   **discards anything entered through the admin UI** — it is a reset, not a
   setup step.

## Run

```bash
pnpm run admin:dev     # compile the admin UI, then tsx watch src/api/index.ts
pnpm run admin:build   # emit dist/api (and the rest of src/)
pnpm run admin:start   # node dist/api/index.js
pnpm run admin:typecheck
```

Default listen: `http://127.0.0.1:8850`

## Auth

- `POST /api/auth/login` `{ "password": "…" }` → httpOnly signed cookie +
  `csrfToken`
- `GET /api/auth/me` → session status + CSRF
- `POST /api/auth/logout`
- Mutating requests need `X-CSRF-Token` (or `csrfToken` in JSON body)
- Idle timeout: 30 minutes (mirrors PHP `adminLastActive`)
- Password verify normalizes PHP `$2y$` → `$2a$` for bcryptjs

## Content API

All content routes require auth.

### Full CRUD (structure + media + all langs)

| Method | Path                            | Notes                                            |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/api/content/products?lang=KR` | list products                                    |
| GET    | `/api/content/videos`           | list videos                                      |
| GET    | `/api/content/archives?lang=KR` | list archives                                    |
| GET    | `/api/content/:type/:slug`      | one record                                       |
| PUT    | `/api/content/products/:slug`   | body = `{ KR, EN, JP }` product records          |
| PUT    | `/api/content/videos/:slug`     | single video record                              |
| PUT    | `/api/content/archives/:slug`   | body = `{ KR, EN, JP }` archive records          |
| DELETE | `/api/content/:type/:slug`      | delete by slug                                   |
| POST   | `/api/content/upload`           | multipart `file` + `kind=image\|video\|document` |

Writable via full CRUD: shared tables (`items`, `models`, `model_images`,
`archives`, `videos`) plus their `*_i18n` rows.

### i18n-only (translation workflow)

Use these when translating KR → EN/JP. They **never** write slug, sort_order,
thumbnail, media paths, attachments, or published flags.

| Method | Path                                     | Body / notes                                    |
| ------ | ---------------------------------------- | ----------------------------------------------- |
| GET    | `/api/content/ui/:lang`                  | UI + archive items overlay                      |
| GET    | `/api/content/ui/:lang?raw=1`            | stored chrome only (`archive.items` empty)      |
| PUT    | `/api/content/ui/:lang`                  | UI JSON object; strips `archive.items` on write |
| PUT    | `/api/content/products/:slug/i18n/:lang` | `{ name, models: [{ id, label, specs }] }`      |
| PUT    | `/api/content/archives/:slug/i18n/:lang` | `{ title, body, detail }`                       |
| PUT    | `/api/content/videos/:slug/i18n/:lang`   | `{ description }` (title/media stay shared)     |

| Tables writable (i18n-only) | Tables not writable                     |
| --------------------------- | --------------------------------------- |
| `ui_documents`              | `items`, `models`, `model_images`       |
| `item_i18n`, `model_i18n`   | `archives` (shared cols), attachments   |
| `archive_i18n`              | `videos` (shared cols: title, media, …) |
| `video_i18n`                | —                                       |

`lang` must be `KR` \| `EN` \| `JP`. Unknown product model `id`s are rejected
(structure changes belong on full CRUD). Do **not** use `pnpm run rebuild:db`
(formerly `rebuild-sqlite.php`) as the day-to-day translation path — it rebuilds
the DB from the JSON seeds and drops everything entered here.

## Translator UI (admin)

1. Log into `/admin` (served by this API, same SQLite).
2. Open **번역**.
3. Pick type (`UI 문구` / 제품 / 자료실 / 영상) and lang (`EN` or `JP`).
4. Edit only the shown translation fields; KR reference is shown when useful.
5. Archive list titles/bodies: use **자료실** translation, not the UI JSON.
6. Structure/media: use the existing 제품·영상·자료실 screens.

`sort_order` is preserved on full-CRUD edit; media paths are normalized the same
way as the retired PHP `agvs_normalize_media_path`.

The `/admin` UI and this TypeScript API share `data/agvs.sqlite`.
