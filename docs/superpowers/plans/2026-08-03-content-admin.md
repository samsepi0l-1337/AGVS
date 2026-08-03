# AGVS Content Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user PHP administration area for AGV videos, product
catalog content, archive posts, and uploaded files.

**Architecture:** Keep the PHP and JSON public site. A shared repository
validates and atomically writes language-specific JSON; protected admin pages
invoke it. A media service validates and stores uploaded assets, while public
pages read published records only.

**Tech Stack:** PHP 8.1+, PHP sessions, JSON, vanilla HTML/CSS/JS, pnpm static
build, PHP CLI tests.

## Global Constraints

- One internal administrator; no account, role, inquiry, or analytics features.
- Password comes from `AGVS_ADMIN_PASSWORD_HASH`; plaintext secrets never enter
  Git.
- Every admin mutation requires a valid session and CSRF token.
- Content fields exist for KR, EN, and JP; media assets are shared across
  languages.
- JSON writes use validation, lock, temporary-file replacement, and dated
  backups.
- Uploads permit only JPG, PNG, WebP, MP4, PDF, XLS, and XLSX after MIME and
  size checks.
- Preserve existing slugs and existing public URLs.

---

### Task 1: JSON repository and archive separation

**Files:**

- Create: `include/contentRepository.php`, `include/contentSchema.php`,
  `data/archivesKR.json`, `data/archivesEN.json`, `data/archivesJP.json`
- Modify: `include/lang.php`, `data/uiKR.json`, `data/uiEN.json`,
  `data/uiJP.json`, `.gitignore`
- Test: `tests/ContentRepositoryTest.php`, `tests/run.php`

**Interfaces:** Produces
`agvs_load_collection(string $collection, string $lang): array`,
`agvs_save_collection(string $collection, string $lang, array $document): void`,
and `agvs_validate_collection(string $collection, array $document): array`. The
save function throws `RuntimeException` and leaves the old file untouched on
failure.

- [ ] **Step 1: Write the failing tests**

```php
assertThrows(
	fn() => agvs_validate_collection("archives", [
		"items" => [
			["slug" => "same", "title" => "A"],
			["slug" => "same", "title" => "B"],
		],
	]),
);
agvs_save_collection("archives", "EN", [
	"items" => [
		[
			"slug" => "guide",
			"title" => "Guide",
			"summary" => "",
			"body" => "",
			"image" => "",
			"attachments" => [],
			"published" => true,
			"sortOrder" => 0,
			"publishedAt" => "2026-08-03",
		],
	],
]);
assertSame("guide", agvs_load_collection("archives", "EN")["items"][0]["slug"]);
```

- [ ] **Step 2: Run the test and verify failure**

Run: `php tests/run.php tests/ContentRepositoryTest.php`  
Expected: failure because the repository functions do not exist.

- [ ] **Step 3: Implement the repository and migration**

```php
function agvs_save_collection(
	string $collection,
	string $lang,
	array $document,
): void {
	agvs_validate_collection($collection, $document);
	// Lock target.lock, back up target, write target.tmp, then rename target.tmp over target.
}
```

Map `products` to `items%s.json`, `videos` to `videos.json`, and `archives` to
`archives%s.json`. Move each existing `archive.items` entry from the three UI
files to the matching archive document; map `body` to `summary`, join `detail`
into `body`, and remove the old UI entries.

- [ ] **Step 4: Run passing tests and format check**

Run:
`php tests/run.php tests/ContentRepositoryTest.php; pnpm run format:check`  
Expected: both commands pass.

- [ ] **Step 5: Commit**

```bash
git add include/contentRepository.php include/contentSchema.php include/lang.php data/archives*.json data/ui*.json tests .gitignore
git commit -m "feat: add JSON content repository"
```

### Task 2: Single-user authentication and admin shell

**Files:**

- Create: `include/adminAuth.php`, `config/admin.example.php`,
  `admin/login.php`, `admin/logout.php`, `admin/index.php`,
  `admin/partials/header.php`, `admin/partials/footer.php`,
  `admin/assets/admin.css`
- Test: `tests/AdminAuthTest.php`

**Interfaces:** Produces `agvs_admin_require_login(): void`,
`agvs_admin_login(string $password): bool`, `agvs_admin_logout(): void`,
`agvs_csrf_token(): string`, and `agvs_csrf_require(): void`.

- [ ] **Step 1: Write failing tests**

```php
putenv(
	"AGVS_ADMIN_PASSWORD_HASH=" . password_hash("correct", PASSWORD_DEFAULT),
);
startTestSession();
assertFalse(agvs_admin_login("wrong"));
assertTrue(agvs_admin_login("correct"));
$_POST = ["csrfToken" => "wrong"];
assertThrows(fn() => agvs_csrf_require());
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/AdminAuthTest.php`  
Expected: failure because auth helpers do not exist.

- [ ] **Step 3: Implement authentication and dashboard**

```php
if (!password_verify($password, getenv("AGVS_ADMIN_PASSWORD_HASH") ?: "")) {
	return false;
}
session_regenerate_id(true);
$_SESSION["agvsAdminAuthenticated"] = true;
$_SESSION["agvsCsrfToken"] = bin2hex(random_bytes(32));
```

Expire inactive sessions after 30 minutes and use `hash_equals` against
`$_POST['csrfToken']` for every POST action. The dashboard has links only to
products, videos, and archives; it is not linked from public navigation.

- [ ] **Step 4: Verify authentication**

Run: `php tests/run.php tests/AdminAuthTest.php`  
Expected: pass; a browser request to `/admin/index.php` as a guest redirects to
`/admin/login.php`.

- [ ] **Step 5: Commit**

```bash
git add include/adminAuth.php config/admin.example.php admin tests/AdminAuthTest.php
git commit -m "feat: add protected admin shell"
```

### Task 3: Validated media uploads and downloads

**Files:**

- Create: `include/mediaService.php`, `admin/mediaUpload.php`, `download.php`
- Test: `tests/MediaServiceTest.php`
- Modify: `.gitignore`

**Interfaces:** Produces `agvs_store_upload(array $file, string $kind): array`,
`agvs_trash_media(string $path): void`, and
`agvs_download_media(string $path): never`. The returned media metadata is
`path`, `originalName`, `mime`, and `size`.

- [ ] **Step 1: Write failing MIME and naming tests**

```php
assertThrows(
	fn() => agvs_store_upload(
		fakeUpload("bad.pdf", "application/x-php"),
		"document",
	),
);
$stored = agvs_store_upload(fakeUpload("photo.png", "image/png"), "image");
assertMatches('/^uploads\/images\/[a-f0-9-]+\.png$/', $stored["path"]);
assertSame("photo.png", $stored["originalName"]);
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/MediaServiceTest.php`  
Expected: failure because upload helpers do not exist.

- [ ] **Step 3: Implement the media service**

```php
$allowed = [
	"image" => ["image/jpeg", "image/png", "image/webp"],
	"video" => ["video/mp4"],
	"document" => [
		"application/pdf",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	],
];
```

Use `finfo` for MIME, cap image/video/document sizes at 10/500/25 MiB, generate
filenames with `bin2hex(random_bytes(16))`, store under `storage/uploads`, and
move deleted files into `storage/trash`. `download.php` must use `realpath`,
constrain paths to the documents directory, and return 404 for missing or
traversal paths.

- [ ] **Step 4: Verify upload and download behavior**

Run: `php tests/run.php tests/MediaServiceTest.php`  
Expected: pass; manual PDF upload downloads under its original filename, and
`../` returns 404.

- [ ] **Step 5: Commit**

```bash
git add include/mediaService.php admin/mediaUpload.php download.php tests/MediaServiceTest.php .gitignore
git commit -m "feat: add validated content media uploads"
```

### Task 4: Product, category, and model CRUD

**Files:**

- Create: `admin/products.php`, `admin/productEdit.php`,
  `admin/categoryEdit.php`, `admin/productDelete.php`,
  `admin/assets/products.js`
- Modify: `DetailList.php`, `view.php`
- Test: `tests/ProductAdminTest.php`

**Interfaces:** Product records retain `categories[]`, `items[]`, and
`models[]`; add `published` and `sortOrder`. Create/edit operations update KR,
EN, and JP documents under a consistent KR → EN → JP lock order.

- [ ] **Step 1: Write failing CRUD tests**

```php
adminCreateProduct([
	"slug" => "test-agv",
	"category" => "agv",
	"translations" => [
		"KR" => ["name" => "테스트"],
		"EN" => ["name" => "Test"],
		"JP" => ["name" => "テスト"],
	],
]);
assertSame(
	"test-agv",
	agvs_load_collection("products", "KR")["items"][0]["slug"],
);
seedProductSlug("duplicate");
assertThrows(fn() => adminCreateProduct(["slug" => "duplicate"]));
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/ProductAdminTest.php`  
Expected: failure because product CRUD does not exist.

- [ ] **Step 3: Implement forms and public filtering**

```php
function agvs_is_published(array $record): bool
{
	return !array_key_exists("published", $record) ||
		$record["published"] === true;
}
```

The edit form has shared slug/category/published/sortOrder fields plus KR/EN/JP
tabs for product name, models, specs, and image descriptions. Keep each model ID
common across languages. Add category CRUD and POST delete confirmations. Filter
drafts in `DetailList.php` and product-mode `view.php` while retaining records
missing `published`.

- [ ] **Step 4: Verify product behavior**

Run:
`php tests/run.php tests/ProductAdminTest.php; pnpm run build; pnpm run format:check`  
Expected:
pass; drafts are absent publicly and existing detail links resolve.

- [ ] **Step 5: Commit**

```bash
git add admin/products.php admin/productEdit.php admin/categoryEdit.php admin/productDelete.php admin/assets/products.js DetailList.php view.php tests/ProductAdminTest.php
git commit -m "feat: manage product catalog content"
```

### Task 5: Video CRUD and public presentation

**Files:**

- Create: `admin/videos.php`, `admin/videoEdit.php`, `admin/videoDelete.php`
- Modify: `Video.php`, `VideoView.php`, `data/videos.json`
- Test: `tests/VideoAdminTest.php`

**Interfaces:** Video fields are `slug`, `title`, `descriptions`,
`referenceUrl`, `type`, `embed`, `video`, `thumbnail`, `poster`, `published`,
`sortOrder`. `youtube` requires an allowed YouTube embed URL; `local` requires
an uploaded MP4 path.

- [ ] **Step 1: Write failing video tests**

```php
assertThrows(
	fn() => validateVideo([
		"slug" => "v",
		"type" => "youtube",
		"embed" => "javascript:alert(1)",
	]),
);
assertThrows(
	fn() => validateVideo(["slug" => "v", "type" => "local", "video" => ""]),
);
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/VideoAdminTest.php`  
Expected: failure because video validation does not exist.

- [ ] **Step 3: Implement video administration**

```php
if (
	$video["type"] === "youtube" &&
	!str_starts_with($video["embed"], "https://www.youtube.com/embed/")
) {
	throw new RuntimeException("Invalid YouTube embed URL.");
}
```

Build list/edit/delete pages with title, three descriptions, reference URL,
thumbnail, sort order, and published state. Migrate current records with
`published: true`, in-order `sortOrder`, blank descriptions, and `referenceUrl`
from `source`. Public pages filter drafts, sort by `sortOrder`, and render the
reference URL using `rel="noopener noreferrer"`.

- [ ] **Step 4: Verify videos**

Run: `php tests/run.php tests/VideoAdminTest.php; pnpm run build`  
Expected: pass; one YouTube video embeds, one MP4 plays, and a draft is hidden.

- [ ] **Step 5: Commit**

```bash
git add admin/videos.php admin/videoEdit.php admin/videoDelete.php Video.php VideoView.php data/videos.json tests/VideoAdminTest.php
git commit -m "feat: manage AGV videos"
```

### Task 6: Archive CRUD, documents, and public migration

**Files:**

- Create: `admin/archives.php`, `admin/archiveEdit.php`,
  `admin/archiveDelete.php`
- Modify: `Archive.php`, `view.php`, `stlye/Archive.css`, `stlye/view.css`
- Test: `tests/ArchiveAdminTest.php`

**Interfaces:** Archive objects have `slug`, `title`, `summary`, `body`,
`image`, `attachments[]`, `published`, `sortOrder`, and `publishedAt`.
Attachment metadata comes from `agvs_store_upload` and is shared by archive slug
across languages.

- [ ] **Step 1: Write failing archive tests**

```php
assertThrows(
	fn() => adminSaveArchive([
		"slug" => "manual",
		"translations" => [
			"KR" => ["title" => "매뉴얼"],
			"EN" => ["title" => ""],
			"JP" => ["title" => "マニュアル"],
		],
	]),
);
seedDocument("uploads/documents/manual.pdf");
adminDeleteArchive("manual");
assertTrue(is_file(trashPathFor("uploads/documents/manual.pdf")));
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/ArchiveAdminTest.php`  
Expected: failure because archive CRUD does not exist.

- [ ] **Step 3: Implement archive pages and public output**

```php
$archives = agvs_load_collection("archives", $agvsLang)["items"];
$archives = array_values(array_filter($archives, "agvs_is_published"));
```

Create list/edit/delete pages. Require slug, published state, and all language
titles; allow empty summary/body/image/attachments. Render escaped body
paragraphs and PDF/XLS/XLSX download links through
`download.php?id=<urlencoded path>`. Move a deleted attachment to trash only
when no archive item still references it. Replace archive reads from
`$agvsUi['archive']['items']` in `Archive.php` and archive-mode `view.php`.

- [ ] **Step 4: Verify archive behavior**

Run:
`php tests/run.php tests/ArchiveAdminTest.php; pnpm run build; pnpm run format:check`  
Expected:
pass; PDF/XLSX downloads work, draft items are hidden, and deleted attachments
move to trash.

- [ ] **Step 5: Commit**

```bash
git add admin/archives.php admin/archiveEdit.php admin/archiveDelete.php Archive.php view.php stlye/Archive.css stlye/view.css tests/ArchiveAdminTest.php data/archives*.json
git commit -m "feat: manage archive content and downloads"
```

### Task 7: Full verification and deployment guide

**Files:**

- Create: `docs/admin-deployment.md`, `tests/RunnerTest.php`
- Modify: `tests/run.php`, `scripts/build-static.sh`, `README.md`

**Interfaces:** `php tests/run.php` discovers every `tests/*Test.php` file and
exits nonzero on failure. The static script reads archive JSON and excludes
unpublished records.

- [ ] **Step 1: Write a failing suite-discovery test**

```php
$output = shell_exec(PHP_BINARY . " tests/run.php");
assertStringContains("ContentRepositoryTest", $output);
assertStringContains("ArchiveAdminTest", $output);
```

- [ ] **Step 2: Run test and verify failure**

Run: `php tests/run.php tests/RunnerTest.php`  
Expected: failure because the runner does not yet discover the complete suite.

- [ ] **Step 3: Implement final checks and operational documentation**

```php
$files = $argv[1] ?? null ? [$argv[1]] : glob(__DIR__ . "/*Test.php");
foreach ($files as $file) {
	require $file;
}
exit($failures === [] ? 0 : 1);
```

Document `AGVS_ADMIN_PASSWORD_HASH`, writable `storage/uploads`,
`storage/backups`, `storage/trash`, guest admin redirect verification, and
running `pnpm run build` after publishing when static output is served. Update
the static build script to read `archives%s.json` and omit `published === false`
records.

- [ ] **Step 4: Run all final validation**

Run:
`php tests/run.php; pnpm run build; pnpm run format:check; git diff --check`  
Expected: all commands pass. Manually check KR/EN/JP lists and details, guest
admin redirect, all seven allowed upload types, and one rejected executable
upload.

- [ ] **Step 5: Commit**

```bash
git add docs/admin-deployment.md README.md scripts/build-static.sh tests/run.php tests/RunnerTest.php
git commit -m "docs: add admin deployment guide"
```

## Plan Self-Review

- Tasks 1 and 6 implement separate archive JSON per language; Task 2 covers
  single-user login and CSRF; Task 3 covers allowed uploads, downloads, backups,
  and trash; Tasks 4–6 cover every requested content type; Task 7 covers static
  publishing and final validation.
- The plan adds no database, multi-user roles, inquiry workflow, analytics, or
  unrequested CMS feature.
- Every later content task uses the repository, authentication, and media
  interfaces defined in earlier tasks.
