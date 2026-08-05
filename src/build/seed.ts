import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type JsonContainer = JsonRecord | unknown[];
type JsonRecord = Record<string, unknown>;
type Lang = "KR" | "EN" | "JP";
type SqliteValue = bigint | null | number | string;

class CliError extends Error {}

const languages: Lang[] = ["KR", "EN", "JP"];
const here = path.dirname(fileURLToPath(import.meta.url));

const schemaSql = `
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

function findRepoRoot(startDirectory: string): string {
	const maxParentLevels = 6;
	let currentDirectory = startDirectory;
	for (
		let parentLevels = 0;
		parentLevels <= maxParentLevels;
		parentLevels += 1
	) {
		const packageJsonPath = path.join(currentDirectory, "package.json");
		const dataPath = path.join(currentDirectory, "data");
		if (
			fs.existsSync(packageJsonPath) &&
			fs.statSync(packageJsonPath).isFile() &&
			fs.existsSync(dataPath) &&
			fs.statSync(dataPath).isDirectory()
		) {
			return currentDirectory;
		}
		const parentDirectory = path.dirname(currentDirectory);
		if (parentDirectory === currentDirectory) {
			break;
		}
		currentDirectory = parentDirectory;
	}
	throw new Error(
		`Unable to locate repository root from ${startDirectory}; expected package.json and data/ within ${maxParentLevels} parent levels.`,
	);
}

function isJsonContainer(value: unknown): value is JsonContainer {
	return typeof value === "object" && value !== null;
}

function readSeed(seedPath: string): JsonContainer {
	try {
		fs.accessSync(seedPath, fs.constants.R_OK);
	} catch {
		throw new CliError(`Missing seed file: ${seedPath}`);
	}

	let decoded: unknown;
	try {
		decoded = JSON.parse(fs.readFileSync(seedPath, "utf8")) as unknown;
	} catch {
		throw new CliError(`Invalid JSON: ${seedPath}`);
	}
	if (!isJsonContainer(decoded)) {
		throw new CliError(`Invalid JSON: ${seedPath}`);
	}
	return decoded;
}

function get(value: unknown, key: string | number): unknown {
	if (!isJsonContainer(value)) {
		return undefined;
	}
	return (value as JsonRecord)[String(key)];
}

function hasKey(value: unknown, key: string): boolean {
	return (
		isJsonContainer(value) && Object.prototype.hasOwnProperty.call(value, key)
	);
}

function entries(value: unknown): [number | string, unknown][] {
	if (Array.isArray(value)) {
		return value.map((entry, index) => [index, entry]);
	}
	if (isJsonContainer(value)) {
		return Object.entries(value);
	}
	return [];
}

function arrayValues(value: unknown): unknown[] {
	if (Array.isArray(value)) {
		return [...value];
	}
	if (isJsonContainer(value)) {
		return Object.values(value);
	}
	throw new TypeError("array_values() expects an array");
}

function phpTrim(value: string): string {
	return value.replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g, "");
}

function phpString(value: unknown): string {
	if (value === undefined || value === null || value === false) {
		return "";
	}
	if (value === true) {
		return "1";
	}
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "bigint") {
		return String(value);
	}
	return "Array";
}

function phpInt(value: unknown): number {
	if (value === undefined || value === null || value === false) {
		return 0;
	}
	if (value === true) {
		return 1;
	}
	if (typeof value === "number") {
		return Number.isFinite(value) ? Math.trunc(value) : 0;
	}
	if (typeof value === "bigint") {
		return Number(value);
	}
	if (typeof value === "string") {
		const match = phpTrim(value).match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)/);
		return match ? Math.trunc(Number(match[0])) : 0;
	}
	return entries(value).length === 0 ? 0 : 1;
}

function phpTruthy(value: unknown): boolean {
	if (
		value === undefined ||
		value === null ||
		value === false ||
		value === 0 ||
		value === 0n ||
		value === "" ||
		value === "0"
	) {
		return false;
	}
	return !isJsonContainer(value) || entries(value).length > 0;
}

function sqliteValue(value: unknown): SqliteValue {
	if (value === undefined || value === null) {
		return null;
	}
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "bigint"
	) {
		return value;
	}
	if (typeof value === "boolean") {
		return value ? "1" : "";
	}
	throw new TypeError("Cannot bind an array as a SQLite value");
}

function phpArray(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(phpArray);
	}
	if (!isJsonContainer(value)) {
		return value;
	}

	const objectEntries = Object.entries(value);
	if (objectEntries.length === 0) {
		return [];
	}
	const converted = objectEntries.map(([key, entry]) => {
		const integerKey = /^(?:0|-?[1-9]\d*)$/.test(key) ? Number(key) : key;
		return [integerKey, phpArray(entry)] as const;
	});
	if (converted.every(([key], index) => key === index)) {
		return converted.map(([, entry]) => entry);
	}

	const result: JsonRecord = {};
	for (const [key, entry] of converted) {
		result[String(key)] = entry;
	}
	return result;
}

function phpJsonEncode(value: unknown): string {
	const encoded = JSON.stringify(phpArray(value));
	if (encoded === undefined) {
		throw new TypeError("Unable to encode value as JSON");
	}
	return encoded.replaceAll("/", "\\/");
}

function normalizeMediaPath(pathValue: string): string {
	let normalized = phpTrim(pathValue).replaceAll("\\", "/");
	while (normalized.startsWith("./")) {
		normalized = normalized.slice(2);
	}
	normalized = normalized.replace(/^\/+/, "");
	if (normalized === "" || normalized.includes("..")) {
		return "";
	}
	return normalized;
}

function normalizeModelText(value: string): string {
	return phpTrim(value).replaceAll("_", " ");
}

function builtAt(): string {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

function removeExistingDatabase(databasePath: string): void {
	if (fs.existsSync(databasePath) && fs.statSync(databasePath).isFile()) {
		fs.unlinkSync(databasePath);
	}
	const directory = path.dirname(databasePath);
	if (!fs.existsSync(directory)) {
		return;
	}
	const sidecarPrefix = `${path.basename(databasePath)}-`;
	for (const entry of fs.readdirSync(directory)) {
		if (entry.startsWith(sidecarPrefix)) {
			const sidecarPath = path.join(directory, entry);
			if (fs.statSync(sidecarPath).isFile()) {
				fs.unlinkSync(sidecarPath);
			}
		}
	}
}

function populateDatabase(database: Database.Database, repoRoot: string): void {
	database
		.prepare(
			"INSERT INTO meta (key, value) VALUES ('builtAt', ?), ('source', 'json-seed')",
		)
		.run(builtAt());

	const catalogs = {} as Record<Lang, JsonContainer>;
	for (const language of languages) {
		catalogs[language] = readSeed(
			path.join(repoRoot, "data", `items${language}.json`),
		);
	}
	const krCatalog = catalogs.KR;

	const categoryInsert = database.prepare(
		"INSERT INTO categories (id, sort_order) VALUES (:id, :sort)",
	);
	const categoryI18nInsert = database.prepare(
		`INSERT INTO category_i18n (category_id, lang, label, title)
		 VALUES (:id, :lang, :label, :title)`,
	);
	for (const [sort, categoryValue] of entries(
		get(krCatalog, "categories") ?? [],
	)) {
		categoryInsert.run({
			id: sqliteValue(get(categoryValue, "id")),
			sort: phpInt(sort),
		});
		for (const language of languages) {
			const local =
				get(get(catalogs[language], "categories"), sort) ?? categoryValue;
			categoryI18nInsert.run({
				id: sqliteValue(get(categoryValue, "id")),
				lang: language,
				label: sqliteValue(get(local, "label") ?? get(categoryValue, "label")),
				title: sqliteValue(get(local, "title") ?? get(categoryValue, "title")),
			});
		}
	}

	const itemInsert = database.prepare(
		`INSERT INTO items (slug, category_id, source, thumbnail, published, sort_order)
		 VALUES (:slug, :category, :source, :thumbnail, :published, :sort)`,
	);
	const itemI18nInsert = database.prepare(
		"INSERT INTO item_i18n (slug, lang, name) VALUES (:slug, :lang, :name)",
	);
	const modelInsert = database.prepare(
		`INSERT INTO models (item_slug, model_key, sort_order)
		 VALUES (:slug, :key, :sort)`,
	);
	const modelI18nInsert = database.prepare(
		`INSERT INTO model_i18n (model_row_id, lang, label, subtitle, specs_json)
		 VALUES (:modelId, :lang, :label, :subtitle, :specs)`,
	);
	const imageInsert = database.prepare(
		`INSERT INTO model_images (model_row_id, src, alt_text, sort_order)
		 VALUES (:modelId, :src, :text, :sort)`,
	);

	for (const [sort, itemValue] of entries(get(krCatalog, "items") ?? [])) {
		const slug = get(itemValue, "slug");
		let thumbnail = normalizeMediaPath(
			phpString(get(itemValue, "thumbnail") ?? ""),
		);
		const firstImageSource = get(
			get(get(get(itemValue, "models"), 0), "images"),
			0,
		);
		if (thumbnail === "" && phpTruthy(get(firstImageSource, "src"))) {
			thumbnail = normalizeMediaPath(phpString(get(firstImageSource, "src")));
		}
		itemInsert.run({
			slug: sqliteValue(slug),
			category: sqliteValue(get(itemValue, "category")),
			source: phpString(get(itemValue, "source") ?? ""),
			thumbnail,
			published:
				(
					!hasKey(itemValue, "published") ||
					phpTruthy(get(itemValue, "published"))
				) ?
					1
				:	0,
			sort: phpInt(get(itemValue, "sortOrder") ?? sort),
		});

		const modelRowIds = new Map<string, number>();
		for (const [modelSort, modelValue] of entries(
			get(itemValue, "models") ?? [],
		)) {
			const result = modelInsert.run({
				slug: sqliteValue(slug),
				key: sqliteValue(get(modelValue, "id")),
				sort: phpInt(modelSort),
			});
			const modelId = Number(result.lastInsertRowid);
			modelRowIds.set(String(modelSort), modelId);
			for (const [imageSort, imageValue] of entries(
				get(modelValue, "images") ?? [],
			)) {
				const source = normalizeMediaPath(
					phpString(get(imageValue, "src") ?? ""),
				);
				if (source === "") {
					continue;
				}
				imageInsert.run({
					modelId,
					src: source,
					text: phpString(get(imageValue, "text") ?? ""),
					sort: phpInt(imageSort),
				});
			}
		}

		for (const language of languages) {
			let localItem: unknown;
			for (const [, candidate] of entries(
				get(catalogs[language], "items") ?? [],
			)) {
				if ((get(candidate, "slug") ?? "") === slug) {
					localItem = candidate;
					break;
				}
			}
			if (!phpTruthy(localItem)) {
				throw new CliError(
					`Missing item ${phpString(slug)} in items${language}.json`,
				);
			}
			itemI18nInsert.run({
				slug: sqliteValue(slug),
				lang: language,
				name: sqliteValue(get(localItem, "name")),
			});
			for (const [modelSort, modelValue] of entries(
				get(localItem, "models") ?? [],
			)) {
				const modelId = modelRowIds.get(String(modelSort));
				if (modelId === undefined) {
					continue;
				}
				modelI18nInsert.run({
					modelId,
					lang: language,
					label: normalizeModelText(phpString(get(modelValue, "label") ?? "")),
					subtitle: normalizeModelText(
						phpString(get(modelValue, "subtitle") ?? ""),
					),
					specs: phpJsonEncode(arrayValues(get(modelValue, "specs") ?? [])),
				});
			}
		}
	}

	const uiInsert = database.prepare(
		"INSERT INTO ui_documents (lang, payload_json) VALUES (:lang, :json)",
	);
	const archiveInsert = database.prepare(
		`INSERT INTO archives
		 (slug, image, thumbnail, attachments_json, published, sort_order)
		 VALUES (:slug, :image, :thumbnail, :attachments, :published, :sort)`,
	);
	const archiveI18nInsert = database.prepare(
		`INSERT INTO archive_i18n (slug, lang, title, body, detail_json)
		 VALUES (:slug, :lang, :title, :body, :detail)`,
	);

	const uiDocuments = {} as Record<Lang, JsonContainer>;
	for (const language of languages) {
		uiDocuments[language] = readSeed(
			path.join(repoRoot, "data", `ui${language}.json`),
		);
	}
	const krArchives = get(get(uiDocuments.KR, "archive"), "items") ?? [];

	for (const language of languages) {
		const payload = structuredClone(uiDocuments[language]);
		let archive = get(payload, "archive");
		if (!isJsonContainer(archive)) {
			archive = [];
			(payload as JsonRecord).archive = archive;
		}
		(archive as JsonRecord).items = [];
		uiInsert.run({
			lang: language,
			json: phpJsonEncode(payload),
		});
	}

	for (const [sort, archiveValue] of entries(krArchives)) {
		const slug = get(archiveValue, "slug");
		const image = normalizeMediaPath(
			phpString(get(archiveValue, "image") ?? ""),
		);
		let thumbnail = normalizeMediaPath(
			phpString(get(archiveValue, "thumbnail") ?? ""),
		);
		if (thumbnail === "") {
			thumbnail = image;
		}
		archiveInsert.run({
			slug: sqliteValue(slug),
			image,
			thumbnail,
			attachments: phpJsonEncode(get(archiveValue, "attachments") ?? []),
			published:
				(
					!hasKey(archiveValue, "published") ||
					phpTruthy(get(archiveValue, "published"))
				) ?
					1
				:	0,
			sort: phpInt(get(archiveValue, "sortOrder") ?? sort),
		});
		for (const language of languages) {
			let localArchive: unknown;
			for (const [, candidate] of entries(
				get(get(uiDocuments[language], "archive"), "items") ?? [],
			)) {
				if ((get(candidate, "slug") ?? "") === slug) {
					localArchive = candidate;
					break;
				}
			}
			if (!phpTruthy(localArchive)) {
				throw new CliError(
					`Missing archive ${phpString(slug)} in ui${language}.json`,
				);
			}
			archiveI18nInsert.run({
				slug: sqliteValue(slug),
				lang: language,
				title: sqliteValue(get(localArchive, "title")),
				body: phpString(get(localArchive, "body") ?? ""),
				detail: phpJsonEncode(arrayValues(get(localArchive, "detail") ?? [])),
			});
		}
	}

	const videosDocument = readSeed(path.join(repoRoot, "data", "videos.json"));
	database
		.prepare("INSERT INTO video_meta (key, value) VALUES ('title', ?)")
		.run(phpString(get(videosDocument, "title") ?? "AGV Video"));
	const videoInsert = database.prepare(
		`INSERT INTO videos
		 (slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order)
		 VALUES
		 (:slug, :title, :media, :type, :thumbnail, :poster, :video, :embed, :source, :published, :sort)`,
	);
	const videoI18nInsert = database.prepare(
		"INSERT INTO video_i18n (slug, lang, description) VALUES (:slug, :lang, :description)",
	);
	for (const [sort, videoValue] of entries(
		get(videosDocument, "videos") ?? [],
	)) {
		const slug = get(videoValue, "slug");
		videoInsert.run({
			slug: sqliteValue(slug),
			title: sqliteValue(get(videoValue, "title")),
			media: phpString(get(videoValue, "mediaLabel") ?? ""),
			type: phpString(get(videoValue, "type") ?? "youtube"),
			thumbnail: normalizeMediaPath(
				phpString(get(videoValue, "thumbnail") ?? ""),
			),
			poster: normalizeMediaPath(phpString(get(videoValue, "poster") ?? "")),
			video: normalizeMediaPath(phpString(get(videoValue, "video") ?? "")),
			embed: phpString(get(videoValue, "embed") ?? ""),
			source: phpString(get(videoValue, "source") ?? ""),
			published:
				(
					!hasKey(videoValue, "published") ||
					phpTruthy(get(videoValue, "published"))
				) ?
					1
				:	0,
			sort: phpInt(get(videoValue, "sortOrder") ?? sort),
		});
		for (const language of languages) {
			videoI18nInsert.run({
				slug: sqliteValue(slug),
				lang: language,
				description: phpString(
					get(get(videoValue, "descriptions"), language) ?? "",
				),
			});
		}
	}
}

function rebuildDatabase(repoRoot: string, databasePath: string): void {
	fs.mkdirSync(path.dirname(databasePath), { recursive: true });
	removeExistingDatabase(databasePath);
	const database = new Database(databasePath);
	try {
		database.pragma("foreign_keys = ON");
		database.pragma("busy_timeout = 5000");
		database.exec(schemaSql);
		database.transaction(() => populateDatabase(database, repoRoot))();

		const counts = ["categories", "items", "models", "archives", "videos"].map(
			(table) =>
				[
					table,
					Number(
						database.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get(),
					),
				] as const,
		);
		process.stdout.write(`Rebuilt ${databasePath}\n`);
		for (const [table, count] of counts) {
			process.stdout.write(`  ${table}: ${count}\n`);
		}
	} finally {
		database.close();
	}
}

try {
	const repoRoot = findRepoRoot(here);
	// argv[2] overrides the default <repoRoot>/data/agvs.sqlite output path.
	const outputArgument = process.argv[2];
	const databasePath =
		outputArgument ?
			path.resolve(repoRoot, outputArgument)
		:	path.join(repoRoot, "data", "agvs.sqlite");
	rebuildDatabase(repoRoot, databasePath);
} catch (error) {
	const detail = error instanceof Error ? error.message : String(error);
	const message =
		error instanceof CliError ? detail : `Rebuild failed: ${detail}`;
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
}
