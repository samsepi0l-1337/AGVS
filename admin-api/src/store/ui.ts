import { getDb, jsonEncode } from "../db.js";
import type { Lang } from "../config.js";
import type { UiDocumentRow } from "../types.js";
import type { UiDocumentInput } from "../validation.js";
import { listArchives } from "./archives.js";

function isUiDocumentRow(value: unknown): value is UiDocumentRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "lang") === "string" &&
		typeof Reflect.get(value, "payload_json") === "string"
	);
}

function parseUiPayload(raw: string): Record<string, unknown> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = {};
	}
	if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
		return { ...parsed };
	}
	return {};
}

/** Stored chrome only — archive.items always empty in the DB row. */
export function getUiDocumentRaw(lang: Lang): Record<string, unknown> {
	const row = getDb()
		.prepare(`SELECT lang, payload_json FROM ui_documents WHERE lang = ?`)
		.get(lang);
	if (!isUiDocumentRow(row)) {
		return {};
	}
	const ui = parseUiPayload(row.payload_json);
	const archiveRaw = ui.archive;
	const archive: Record<string, unknown> =
		typeof archiveRaw === "object" &&
		archiveRaw !== null &&
		!Array.isArray(archiveRaw)
			? { ...archiveRaw }
			: {};
	archive.items = [];
	ui.archive = archive;
	return ui;
}

export function getUiDocument(lang: Lang): Record<string, unknown> {
	const ui = getUiDocumentRaw(lang);
	const archiveRaw = ui.archive;
	const archive: Record<string, unknown> =
		typeof archiveRaw === "object" &&
		archiveRaw !== null &&
		!Array.isArray(archiveRaw)
			? { ...archiveRaw }
			: {};
	archive.items = listArchives(lang);
	ui.archive = archive;
	return ui;
}

/**
 * Replace ui_documents.payload_json for one lang. Forces archive.items = []
 * so archive list content stays in archive_i18n / archives tables.
 */
export function upsertUiDocument(lang: Lang, payload: UiDocumentInput): void {
	const next: Record<string, unknown> = { ...payload };
	const archiveRaw = next.archive;
	const archive: Record<string, unknown> =
		typeof archiveRaw === "object" &&
		archiveRaw !== null &&
		!Array.isArray(archiveRaw)
			? { ...archiveRaw }
			: {};
	archive.items = [];
	next.archive = archive;

	getDb()
		.prepare(
			`INSERT INTO ui_documents (lang, payload_json) VALUES (?, ?)
			 ON CONFLICT(lang) DO UPDATE SET payload_json = excluded.payload_json`,
		)
		.run(lang, jsonEncode(next));
}
