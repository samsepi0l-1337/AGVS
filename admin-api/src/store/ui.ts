import { getDb } from "../db.js";
import type { Lang } from "../config.js";
import type { UiDocumentRow } from "../types.js";
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

export function getUiDocument(lang: Lang): Record<string, unknown> {
	const row = getDb()
		.prepare(`SELECT lang, payload_json FROM ui_documents WHERE lang = ?`)
		.get(lang);
	if (!isUiDocumentRow(row)) {
		return { archive: { items: listArchives(lang) } };
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(row.payload_json);
	} catch {
		parsed = {};
	}
	const ui: Record<string, unknown> =
		typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
			? { ...parsed }
			: {};
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
