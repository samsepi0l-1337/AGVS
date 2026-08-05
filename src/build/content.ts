import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
	Catalog,
	CatalogCategory,
	CatalogImage,
	CatalogItem,
	CatalogModel,
	Lang,
	UiDocument,
	VideosDocument,
} from "./types.js";

interface CategoryRow {
	id: string;
	label: string;
	title: string;
}

interface ItemRow {
	slug: string;
	category_id: string;
	source: string;
	thumbnail: string | null;
	published: number;
	sort_order: number;
	name: string;
}

interface ModelRow {
	id: number;
	model_key: string;
}

interface ModelI18nRow {
	label: string;
	subtitle: string | null;
	specs_json: string | null;
}

interface ModelImageRow {
	src: string;
	alt_text: string;
}

interface UiRow {
	payload_json: string | null;
}

interface ArchiveRow {
	slug: string;
	title: string;
	body: string;
	image: string | null;
	thumbnail: string | null;
	detail_json: string | null;
	attachments_json: string | null;
	published: number;
	sort_order: number;
}

interface VideoMetaRow {
	value: string | null;
}

interface VideoRow {
	slug: string;
	title: string;
	media_label: string;
	type: string;
	thumbnail: string | null;
	poster: string | null;
	video: string | null;
	embed: string;
	source: string;
	published: number;
	sort_order: number;
}

interface VideoDescriptionRow {
	lang: string;
	description: string;
}

const here = path.dirname(fileURLToPath(import.meta.url));

function findRepoRoot(startDirectory: string): string {
	const maxParentLevels = 6;
	let currentDirectory = startDirectory;
	for (let parentLevels = 0; parentLevels <= maxParentLevels; parentLevels += 1) {
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

let db: Database.Database | null = null;

function sqlitePath(): string {
	const envValue = process.env.AGVS_SQLITE_PATH;
	const configured = envValue === undefined || envValue === null ? "data/agvs.sqlite" : envValue.trim();
	if (path.isAbsolute(configured)) {
		return configured;
	}
	return path.join(findRepoRoot(here), configured);
}

function getDb(): Database.Database {
	if (db) {
		return db;
	}
	const resolvedPath = sqlitePath();
	if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).size === 0) {
		throw new Error(`SQLite content DB missing at ${resolvedPath}.`);
	}
	db = new Database(resolvedPath, { readonly: true });
	db.pragma("foreign_keys = ON");
	db.pragma("busy_timeout = 5000");
	return db;
}

function normalizeLang(lang: Lang): Lang {
	const upper = String(lang).toUpperCase();
	return upper === "KR" || upper === "EN" || upper === "JP" ? upper : "KR";
}

function jsonDecodeArray(raw: string | null): unknown[] {
	if (raw === null || raw === "") {
		return [];
	}
	try {
		const decoded: unknown = JSON.parse(raw);
		return Array.isArray(decoded) ? decoded : [];
	} catch {
		return [];
	}
}

function toAssociativeArray(value: unknown): Record<string, unknown> {
	if (Array.isArray(value)) {
		return Object.assign({}, value) as unknown as Record<string, unknown>;
	}
	if (typeof value === "object" && value !== null) {
		return value as Record<string, unknown>;
	}
	return {};
}

function jsonDecodeUi(raw: string | null): UiDocument {
	if (raw === null || raw === "") {
		return {};
	}
	try {
		return toAssociativeArray(JSON.parse(raw) as unknown);
	} catch {
		return {};
	}
}

function normalizeMediaPath(pathValue: string): string {
	let normalized = pathValue.replace(/\\/g, "/").trim();
	while (normalized.startsWith("./")) {
		normalized = normalized.slice(2);
	}
	normalized = normalized.replace(/^\/+/, "");
	if (normalized === "" || normalized.includes("..")) {
		return "";
	}
	return normalized;
}

function stringValue(value: string | null): string {
	return value ?? "";
}

export function loadCatalog(lang: Lang): Catalog {
	const resolvedLang = normalizeLang(lang);
	const database = getDb();
	const categoryRows = database
		.prepare(
			`SELECT c.id, c.sort_order, i.label, i.title
			 FROM categories c
			 JOIN category_i18n i ON i.category_id = c.id AND i.lang = ?
			 ORDER BY c.sort_order ASC, c.id ASC`,
		)
		.all(resolvedLang) as CategoryRow[];
	const categories: CatalogCategory[] = [];
	for (const row of categoryRows) {
		categories.push({
			id: row.id,
			label: row.label,
			title: row.title,
		});
	}

	const itemRows = database
		.prepare(
			`SELECT i.slug, i.category_id, i.source, i.thumbnail, i.published, i.sort_order, t.name
			 FROM items i
			 JOIN item_i18n t ON t.slug = i.slug AND t.lang = ?
			 ORDER BY i.sort_order ASC, i.slug ASC`,
		)
		.all(resolvedLang) as ItemRow[];
	const modelStmt = database.prepare(
		`SELECT id, model_key, sort_order FROM models
		 WHERE item_slug = ? ORDER BY sort_order ASC, id ASC`,
	);
	const modelI18nStmt = database.prepare(
		`SELECT label, subtitle, specs_json FROM model_i18n
		 WHERE model_row_id = ? AND lang = ?`,
	);
	const imageStmt = database.prepare(
		`SELECT src, alt_text FROM model_images
		 WHERE model_row_id = ? ORDER BY sort_order ASC, id ASC`,
	);

	const items: CatalogItem[] = [];
	for (const row of itemRows) {
		const models: CatalogModel[] = [];
		for (const modelRow of modelStmt.all(row.slug) as ModelRow[]) {
			// A missing translation is a valid PHP fallback, not a corrupt model.
			const i18n = modelI18nStmt.get(modelRow.id, resolvedLang) as
				| ModelI18nRow
				| undefined;
			const images: CatalogImage[] = [];
			for (const imageRow of imageStmt.all(modelRow.id) as ModelImageRow[]) {
				images.push({
					src: imageRow.src,
					text: imageRow.alt_text,
				});
			}
			models.push({
				id: modelRow.model_key,
				label: i18n?.label ?? "",
				// PHP casts a nullable subtitle to string, yielding an empty string.
				subtitle: stringValue(i18n?.subtitle ?? null),
				specs: jsonDecodeArray(i18n?.specs_json ?? "[]"),
				images,
			});
		}

		let thumbnail = normalizeMediaPath(stringValue(row.thumbnail));
		const firstImage = models[0]?.images[0]?.src;
		if (thumbnail === "" && firstImage) {
			// The fallback goes through the same normalization as a stored thumbnail.
			thumbnail = normalizeMediaPath(firstImage);
		}
		items.push({
			slug: row.slug,
			name: row.name,
			category: row.category_id,
			source: row.source,
			thumbnail,
			published: row.published === 1,
			sortOrder: Number(row.sort_order),
			models,
		});
	}

	return {
		categories,
		items,
	};
}

export function loadUi(lang: Lang): UiDocument {
	const resolvedLang = normalizeLang(lang);
	const row = getDb()
		.prepare("SELECT payload_json FROM ui_documents WHERE lang = ?")
		.get(resolvedLang) as UiRow | undefined;
	const ui = row ? jsonDecodeUi(row.payload_json) : {};
	const archive = toAssociativeArray(ui.archive);
	archive.items = loadArchiveItems(resolvedLang);
	ui.archive = archive;
	return ui;
}

export function loadArchiveItems(lang: Lang): Record<string, unknown>[] {
	const rows = getDb()
		.prepare(
			`SELECT a.slug, a.image, a.thumbnail, a.attachments_json, a.published, a.sort_order,
			        t.title, t.body, t.detail_json
			 FROM archives a
			 JOIN archive_i18n t ON t.slug = a.slug AND t.lang = ?
			 ORDER BY a.sort_order ASC, a.slug ASC`,
		)
		.all(lang) as ArchiveRow[];
	const items: Record<string, unknown>[] = [];
	for (const row of rows) {
		const image = normalizeMediaPath(stringValue(row.image));
		let thumbnail = normalizeMediaPath(stringValue(row.thumbnail));
		if (thumbnail === "") {
			thumbnail = image;
		}
		items.push({
			slug: row.slug,
			title: row.title,
			body: row.body,
			image,
			thumbnail,
			detail: jsonDecodeArray(row.detail_json),
			attachments: jsonDecodeArray(row.attachments_json),
			published: row.published === 1,
			sortOrder: Number(row.sort_order),
		});
	}
	return items;
}

export function loadVideosDocument(): VideosDocument {
	const database = getDb();
	const titleRow = database
		.prepare("SELECT value FROM video_meta WHERE key = 'title'")
		.get() as VideoMetaRow | undefined;
	const title = titleRow ? stringValue(titleRow.value) : "AGV Video";
	const videoRows = database
		.prepare(
			`SELECT slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order
			 FROM videos ORDER BY sort_order ASC, slug ASC`,
		)
		.all() as VideoRow[];
	const descriptionStmt = database.prepare(
		"SELECT lang, description FROM video_i18n WHERE slug = ?",
	);
	const videos: Record<string, unknown>[] = [];
	for (const row of videoRows) {
		const descriptions: Record<string, unknown> = {
			KR: "",
			EN: "",
			JP: "",
		};
		for (const description of descriptionStmt.all(row.slug) as VideoDescriptionRow[]) {
			descriptions[description.lang] = description.description;
		}
		const entry: Record<string, unknown> = {
			slug: row.slug,
			title: row.title,
			mediaLabel: row.media_label,
			type: row.type,
			thumbnail: normalizeMediaPath(stringValue(row.thumbnail)),
			source: row.source,
			descriptions,
			published: row.published === 1,
			sortOrder: Number(row.sort_order),
		};
		if (row.type === "youtube") {
			entry.embed = row.embed;
		} else {
			entry.poster = normalizeMediaPath(stringValue(row.poster));
			entry.video = normalizeMediaPath(stringValue(row.video));
		}
		videos.push(entry);
	}
	const document = {
		title,
		videos,
	};
	return document;
}
