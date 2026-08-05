<?php

declare(strict_types=1);

const AGVS_DB_ROOT = __DIR__ . "/..";
const AGVS_DB_PATH = AGVS_DB_ROOT . "/data/agvs.sqlite";

function agvs_db(): PDO
{
	static $pdo = null;
	if ($pdo instanceof PDO) {
		return $pdo;
	}
	$dir = dirname(AGVS_DB_PATH);
	if (!is_dir($dir)) {
		mkdir($dir, 0775, true);
	}
	$pdo = new PDO("sqlite:" . AGVS_DB_PATH, null, null, [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	]);
	$pdo->exec("PRAGMA foreign_keys = ON");
	$pdo->exec("PRAGMA busy_timeout = 5000");
	return $pdo;
}

function agvs_db_schema_sql(): string
{
	return <<<'SQL'
	CREATE TABLE IF NOT EXISTS meta (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS categories (
		id TEXT PRIMARY KEY,
		sort_order INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS category_i18n (
		category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
		lang TEXT NOT NULL CHECK (lang IN ('KR', 'EN', 'JP')),
		label TEXT NOT NULL,
		title TEXT NOT NULL,
		PRIMARY KEY (category_id, lang)
	);

	CREATE TABLE IF NOT EXISTS items (
		slug TEXT PRIMARY KEY,
		category_id TEXT NOT NULL REFERENCES categories(id),
		source TEXT NOT NULL DEFAULT '',
		thumbnail TEXT NOT NULL DEFAULT '',
		published INTEGER NOT NULL DEFAULT 1,
		sort_order INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS item_i18n (
		slug TEXT NOT NULL REFERENCES items(slug) ON DELETE CASCADE,
		lang TEXT NOT NULL CHECK (lang IN ('KR', 'EN', 'JP')),
		name TEXT NOT NULL,
		PRIMARY KEY (slug, lang)
	);

	CREATE TABLE IF NOT EXISTS models (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		item_slug TEXT NOT NULL REFERENCES items(slug) ON DELETE CASCADE,
		model_key TEXT NOT NULL,
		sort_order INTEGER NOT NULL DEFAULT 0,
		UNIQUE (item_slug, model_key)
	);

	CREATE TABLE IF NOT EXISTS model_i18n (
		model_row_id INTEGER NOT NULL REFERENCES models(id) ON DELETE CASCADE,
		lang TEXT NOT NULL CHECK (lang IN ('KR', 'EN', 'JP')),
		label TEXT NOT NULL,
		subtitle TEXT NOT NULL DEFAULT '',
		specs_json TEXT NOT NULL DEFAULT '[]',
		PRIMARY KEY (model_row_id, lang)
	);

	CREATE TABLE IF NOT EXISTS model_images (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		model_row_id INTEGER NOT NULL REFERENCES models(id) ON DELETE CASCADE,
		src TEXT NOT NULL,
		alt_text TEXT NOT NULL DEFAULT '',
		sort_order INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS ui_documents (
		lang TEXT PRIMARY KEY CHECK (lang IN ('KR', 'EN', 'JP')),
		payload_json TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS archives (
		slug TEXT PRIMARY KEY,
		image TEXT NOT NULL DEFAULT '',
		thumbnail TEXT NOT NULL DEFAULT '',
		attachments_json TEXT NOT NULL DEFAULT '[]',
		published INTEGER NOT NULL DEFAULT 1,
		sort_order INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS archive_i18n (
		slug TEXT NOT NULL REFERENCES archives(slug) ON DELETE CASCADE,
		lang TEXT NOT NULL CHECK (lang IN ('KR', 'EN', 'JP')),
		title TEXT NOT NULL,
		body TEXT NOT NULL DEFAULT '',
		detail_json TEXT NOT NULL DEFAULT '[]',
		PRIMARY KEY (slug, lang)
	);

	CREATE TABLE IF NOT EXISTS videos (
		slug TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		media_label TEXT NOT NULL DEFAULT '',
		type TEXT NOT NULL,
		thumbnail TEXT NOT NULL DEFAULT '',
		poster TEXT NOT NULL DEFAULT '',
		video TEXT NOT NULL DEFAULT '',
		embed TEXT NOT NULL DEFAULT '',
		source TEXT NOT NULL DEFAULT '',
		published INTEGER NOT NULL DEFAULT 1,
		sort_order INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS video_i18n (
		slug TEXT NOT NULL REFERENCES videos(slug) ON DELETE CASCADE,
		lang TEXT NOT NULL CHECK (lang IN ('KR', 'EN', 'JP')),
		description TEXT NOT NULL DEFAULT '',
		PRIMARY KEY (slug, lang)
	);

	CREATE TABLE IF NOT EXISTS video_meta (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);
	SQL;
}

/**
 * Add thumbnail columns on older DBs created before the field existed.
 * CREATE TABLE IF NOT EXISTS does not alter existing tables.
 */
function agvs_db_ensure_thumbnail_columns(?PDO $pdo = null): void
{
	$pdo = $pdo ?? agvs_db();
	foreach (["items", "archives", "videos"] as $table) {
		$cols = $pdo->query("PRAGMA table_info(" . $table . ")")->fetchAll();
		$names = array_column($cols, "name");
		if (!in_array("thumbnail", $names, true)) {
			$pdo->exec(
				"ALTER TABLE " .
					$table .
					" ADD COLUMN thumbnail TEXT NOT NULL DEFAULT ''",
			);
		}
	}
}

/**
 * Add model_i18n.subtitle on older DBs created before the field existed.
 */
function agvs_db_ensure_model_subtitle_column(?PDO $pdo = null): void
{
	$pdo = $pdo ?? agvs_db();
	$cols = $pdo->query("PRAGMA table_info(model_i18n)")->fetchAll();
	$names = array_column($cols, "name");
	if (!in_array("subtitle", $names, true)) {
		$pdo->exec(
			"ALTER TABLE model_i18n ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''",
		);
	}
}

function agvs_db_install_schema(?PDO $pdo = null): void
{
	$pdo = $pdo ?? agvs_db();
	$pdo->exec(agvs_db_schema_sql());
	agvs_db_ensure_thumbnail_columns($pdo);
	agvs_db_ensure_model_subtitle_column($pdo);
}

/**
 * Normalize stored media paths: strip ./ and leading slashes, reject traversal.
 * Does not invent prefixes — keeps img/... and storage/uploads/... as-is.
 */
function agvs_normalize_media_path(string $path): string
{
	$path = str_replace("\\", "/", trim($path));
	while (str_starts_with($path, "./")) {
		$path = substr($path, 2);
	}
	$path = ltrim($path, "/");
	if ($path === "" || str_contains($path, "..")) {
		return "";
	}
	return $path;
}

/**
 * Model label/subtitle display text: site-code underscores → spaces.
 * Keeps intentional spaces and ampersands (e.g. "GM & DI Engine DS RGV").
 */
function agvs_normalize_model_text(string $value): string
{
	return str_replace("_", " ", trim($value));
}

function agvs_json_encode(mixed $value): string
{
	return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
}

function agvs_json_decode_array(?string $raw, array $fallback = []): array
{
	if ($raw === null || $raw === "") {
		return $fallback;
	}
	$decoded = json_decode($raw, true);
	return is_array($decoded) ? $decoded : $fallback;
}
