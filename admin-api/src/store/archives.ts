import { LANGUAGES, type Lang } from "../config.js";
import { getDb, jsonDecodeArray, jsonEncode, nextSortOrder } from "../db.js";
import { normalizeMediaPath } from "../media.js";
import type {
	ArchiveAttachment,
	ArchiveI18nRow,
	ArchiveRecord,
	ArchiveRow,
} from "../types.js";
import type { ArchiveUpsertInput } from "../validation.js";

function isArchiveRow(value: unknown): value is ArchiveRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "slug") === "string" &&
		typeof Reflect.get(value, "image") === "string" &&
		typeof Reflect.get(value, "thumbnail") === "string" &&
		typeof Reflect.get(value, "attachments_json") === "string" &&
		typeof Reflect.get(value, "published") === "number" &&
		typeof Reflect.get(value, "sort_order") === "number"
	);
}

function isArchiveI18nFields(
	value: unknown,
): value is Pick<ArchiveI18nRow, "title" | "body" | "detail_json"> {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "title") === "string" &&
		typeof Reflect.get(value, "body") === "string" &&
		typeof Reflect.get(value, "detail_json") === "string"
	);
}

function parseAttachments(raw: string): ArchiveAttachment[] {
	const out: ArchiveAttachment[] = [];
	for (const entry of jsonDecodeArray(raw)) {
		if (typeof entry !== "object" || entry === null) {
			continue;
		}
		const pathValue = Reflect.get(entry, "path");
		const originalName = Reflect.get(entry, "originalName");
		const mime = Reflect.get(entry, "mime");
		const size = Reflect.get(entry, "size");
		if (
			typeof pathValue !== "string" ||
			typeof originalName !== "string" ||
			typeof mime !== "string" ||
			typeof size !== "number"
		) {
			continue;
		}
		const normalized = normalizeMediaPath(pathValue);
		if (normalized === "") {
			continue;
		}
		out.push({
			path: normalized,
			originalName,
			mime,
			size,
		});
	}
	return out;
}

export function listArchives(lang: Lang = "KR"): ArchiveRecord[] {
	const db = getDb();
	const rows = db
		.prepare(
			`SELECT a.slug, a.image, a.thumbnail, a.attachments_json, a.published, a.sort_order,
			        t.title, t.body, t.detail_json
			 FROM archives a
			 JOIN archive_i18n t ON t.slug = a.slug AND t.lang = ?
			 ORDER BY a.sort_order ASC, a.slug ASC`,
		)
		.all(lang);

	const items: ArchiveRecord[] = [];
	for (const raw of rows) {
		if (!isArchiveRow(raw) || !isArchiveI18nFields(raw)) {
			continue;
		}
		let image = normalizeMediaPath(raw.image);
		let thumbnail = normalizeMediaPath(raw.thumbnail);
		if (thumbnail === "") {
			thumbnail = image;
		}
		items.push({
			slug: raw.slug,
			title: String(Reflect.get(raw, "title")),
			body: String(Reflect.get(raw, "body")),
			image,
			thumbnail,
			detail: jsonDecodeArray(String(Reflect.get(raw, "detail_json"))).filter(
				(line): line is string => typeof line === "string",
			),
			attachments: parseAttachments(raw.attachments_json),
			published: raw.published === 1,
			sortOrder: raw.sort_order,
		});
	}
	return items;
}

export function findArchive(
	slug: string,
	lang: Lang = "KR",
): ArchiveRecord | null {
	return listArchives(lang).find((item) => item.slug === slug) ?? null;
}

export function upsertArchive(recordsByLang: ArchiveUpsertInput): void {
	const kr = recordsByLang.KR;
	const db = getDb();
	const upsert = db.transaction(() => {
		const existing = db
			.prepare(`SELECT sort_order FROM archives WHERE slug = ?`)
			.get(kr.slug);
		const existingSort =
			typeof existing === "object" &&
			existing !== null &&
			typeof Reflect.get(existing, "sort_order") === "number"
				? Number(Reflect.get(existing, "sort_order"))
				: null;
		const sortOrder =
			typeof kr.sortOrder === "number"
				? kr.sortOrder
				: (existingSort ?? nextSortOrder(db, "archives"));

		let image = normalizeMediaPath(kr.image);
		let thumb = normalizeMediaPath(kr.thumbnail);
		if (thumb === "") {
			thumb = image;
		}

		db.prepare(
			`INSERT INTO archives
			 (slug, image, thumbnail, attachments_json, published, sort_order)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT(slug) DO UPDATE SET
			   image = excluded.image,
			   thumbnail = excluded.thumbnail,
			   attachments_json = excluded.attachments_json,
			   published = excluded.published,
			   sort_order = excluded.sort_order`,
		).run(
			kr.slug,
			image,
			thumb,
			jsonEncode(kr.attachments),
			kr.published ? 1 : 0,
			sortOrder,
		);

		const i18n = db.prepare(
			`INSERT INTO archive_i18n (slug, lang, title, body, detail_json)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(slug, lang) DO UPDATE SET
			   title = excluded.title, body = excluded.body, detail_json = excluded.detail_json`,
		);
		for (const lang of LANGUAGES) {
			const rec = recordsByLang[lang];
			i18n.run(
				kr.slug,
				lang,
				rec.title,
				rec.body,
				jsonEncode(rec.detail),
			);
		}
	});
	upsert();
}

export function deleteArchive(slug: string): void {
	getDb().prepare(`DELETE FROM archives WHERE slug = ?`).run(slug);
}
