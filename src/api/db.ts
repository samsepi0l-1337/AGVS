import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT, SQLITE_PATH } from "./config.js";

let db: Database.Database | null = null;

const SCHEMA_SQL = `
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
`;

interface MaxSortRow {
	maxSort: number;
}

function isMaxSortRow(value: unknown): value is MaxSortRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return typeof Reflect.get(value, "maxSort") === "number";
}

export function getDb(): Database.Database {
	if (db) {
		return db;
	}
	const dir = path.dirname(SQLITE_PATH);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	if (!fs.existsSync(SQLITE_PATH) || fs.statSync(SQLITE_PATH).size === 0) {
		throw new Error(
			`SQLite content DB missing at ${SQLITE_PATH}. Run: pnpm run rebuild:db`,
		);
	}
	db = new Database(SQLITE_PATH);
	db.pragma("foreign_keys = ON");
	db.pragma("busy_timeout = 5000");
	db.exec(SCHEMA_SQL);
	ensureThumbnailColumns(db);
	ensureModelSubtitleColumn(db);
	return db;
}

/** ALTER older DBs that predate thumbnail on list entities. */
function ensureThumbnailColumns(database: Database.Database): void {
	for (const table of ["items", "archives", "videos"] as const) {
		const cols = database.pragma(`table_info(${table})`) as Array<{
			name: string;
		}>;
		if (!cols.some((col) => col.name === "thumbnail")) {
			database.exec(
				`ALTER TABLE ${table} ADD COLUMN thumbnail TEXT NOT NULL DEFAULT ''`,
			);
		}
	}
}

/** ALTER older DBs that predate model_i18n.subtitle. */
function ensureModelSubtitleColumn(database: Database.Database): void {
	const cols = database.pragma(`table_info(model_i18n)`) as Array<{
		name: string;
	}>;
	if (!cols.some((col) => col.name === "subtitle")) {
		database.exec(
			`ALTER TABLE model_i18n ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''`,
		);
	}
}

export function jsonEncode(value: unknown): string {
	return JSON.stringify(value);
}

export function jsonDecodeArray(raw: string | null | undefined): unknown[] {
	if (raw === null || raw === undefined || raw === "") {
		return [];
	}
	try {
		const decoded: unknown = JSON.parse(raw);
		return Array.isArray(decoded) ? decoded : [];
	} catch {
		return [];
	}
}

export function nextSortOrder(
	database: Database.Database,
	table: "items" | "videos" | "archives",
): number {
	const row: unknown = database
		.prepare(`SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM ${table}`)
		.get();
	if (!isMaxSortRow(row)) {
		return 0;
	}
	return row.maxSort + 1;
}

export function backupSqlite(): void {
	if (!fs.existsSync(SQLITE_PATH)) {
		return;
	}
	const backupDir = path.join(REPO_ROOT, "storage", "backups");
	fs.mkdirSync(backupDir, { recursive: true });
	const stamp = new Date()
		.toISOString()
		.replace(/[-:TZ.]/g, "")
		.slice(0, 14);
	fs.copyFileSync(SQLITE_PATH, path.join(backupDir, `${stamp}-agvs.sqlite`));
}
