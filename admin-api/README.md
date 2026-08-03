# AGVS Admin API (TypeScript)

Small Node/Express backend for admin auth and SQLite-backed content CRUD.
Public marketing pages stay on PHP and continue reading `data/agvs.sqlite`.

## Setup

1. Copy env template and set secrets (never commit `.env`):

```bash
cp .env.example .env
```

2. Set `AGVS_ADMIN_PASSWORD_HASH` to a PHP-compatible bcrypt hash (`$2y$…`):

```bash
php -r "echo password_hash('your-password', PASSWORD_BCRYPT, ['cost'=>12]), PHP_EOL;"
```

3. Set `AGVS_ADMIN_SESSION_SECRET` to a long random string (≥16 chars).

4. Ensure the SQLite DB exists (seeded from JSON if needed):

```bash
pnpm run rebuild:db
```

## Run

```bash
pnpm run admin:dev      # tsx watch
pnpm run admin:build   # emit admin-api/dist
pnpm run admin:start   # node admin-api/dist/index.js
pnpm run admin:typecheck
```

Default listen: `http://127.0.0.1:8850`

## Auth

- `POST /api/auth/login` `{ "password": "…" }` → httpOnly signed cookie + `csrfToken`
- `GET /api/auth/me` → session status + CSRF
- `POST /api/auth/logout`
- Mutating requests need `X-CSRF-Token` (or `csrfToken` in JSON body)
- Idle timeout: 30 minutes (mirrors PHP `adminLastActive`)
- Password verify normalizes PHP `$2y$` → `$2a$` for bcryptjs

## Content API

All content routes require auth.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/content/products?lang=KR` | list products |
| GET | `/api/content/videos` | list videos |
| GET | `/api/content/archives?lang=KR` | list archives |
| GET | `/api/content/:type/:slug` | one record |
| PUT | `/api/content/products/:slug` | body = `{ KR, EN, JP }` product records |
| PUT | `/api/content/videos/:slug` | single video record |
| PUT | `/api/content/archives/:slug` | body = `{ KR, EN, JP }` archive records |
| DELETE | `/api/content/:type/:slug` | delete by slug |
| POST | `/api/content/upload` | multipart `file` + `kind=image\|video\|document` |
| GET | `/api/content/ui/:lang` | UI document (+ archive items overlay) |

`sort_order` is preserved on edit; media paths are normalized like PHP `agvs_normalize_media_path`.

The existing PHP `admin/` HTML UI still works against the same SQLite file. This API is the TypeScript admin backend for JSON clients / future UI wiring.
