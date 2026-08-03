import { LANGUAGES, type Lang } from "../config.js";
import { getDb, nextSortOrder } from "../db.js";
import { normalizeMediaPath } from "../media.js";
import type { VideoI18nRow, VideoRecord, VideoRow } from "../types.js";
import type { VideoRecordInput } from "../validation.js";

function isVideoRow(value: unknown): value is VideoRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "slug") === "string" &&
		typeof Reflect.get(value, "title") === "string" &&
		typeof Reflect.get(value, "media_label") === "string" &&
		typeof Reflect.get(value, "type") === "string" &&
		typeof Reflect.get(value, "thumbnail") === "string" &&
		typeof Reflect.get(value, "poster") === "string" &&
		typeof Reflect.get(value, "video") === "string" &&
		typeof Reflect.get(value, "embed") === "string" &&
		typeof Reflect.get(value, "source") === "string" &&
		typeof Reflect.get(value, "published") === "number" &&
		typeof Reflect.get(value, "sort_order") === "number"
	);
}

function isVideoI18nRow(value: unknown): value is VideoI18nRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "slug") === "string" &&
		typeof Reflect.get(value, "lang") === "string" &&
		typeof Reflect.get(value, "description") === "string"
	);
}

export function listVideos(): VideoRecord[] {
	const db = getDb();
	const rows = db
		.prepare(
			`SELECT slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order
			 FROM videos ORDER BY sort_order ASC, slug ASC`,
		)
		.all();
	const descStmt = db.prepare(
		`SELECT slug, lang, description FROM video_i18n WHERE slug = ?`,
	);

	const videos: VideoRecord[] = [];
	for (const raw of rows) {
		if (!isVideoRow(raw)) {
			continue;
		}
		const descriptions: Record<Lang, string> = {
			KR: "",
			EN: "",
			JP: "",
		};
		for (const desc of descStmt.all(raw.slug)) {
			if (!isVideoI18nRow(desc)) {
				continue;
			}
			if (desc.lang === "KR" || desc.lang === "EN" || desc.lang === "JP") {
				descriptions[desc.lang] = desc.description;
			}
		}
		const type = raw.type === "local" ? "local" : "youtube";
		const entry: VideoRecord = {
			slug: raw.slug,
			title: raw.title,
			mediaLabel: raw.media_label,
			type,
			thumbnail: normalizeMediaPath(raw.thumbnail),
			source: raw.source,
			descriptions,
			published: raw.published === 1,
			sortOrder: raw.sort_order,
		};
		if (type === "youtube") {
			entry.embed = raw.embed;
		} else {
			entry.poster = normalizeMediaPath(raw.poster);
			entry.video = normalizeMediaPath(raw.video);
		}
		videos.push(entry);
	}
	return videos;
}

export function findVideo(slug: string): VideoRecord | null {
	return listVideos().find((item) => item.slug === slug) ?? null;
}

export function upsertVideo(record: VideoRecordInput): void {
	const db = getDb();
	const upsert = db.transaction(() => {
		const existing = db
			.prepare(`SELECT sort_order FROM videos WHERE slug = ?`)
			.get(record.slug);
		const existingSort =
			typeof existing === "object" &&
			existing !== null &&
			typeof Reflect.get(existing, "sort_order") === "number"
				? Number(Reflect.get(existing, "sort_order"))
				: null;
		const sortOrder =
			typeof record.sortOrder === "number"
				? record.sortOrder
				: (existingSort ?? nextSortOrder(db, "videos"));

		db.prepare(
			`INSERT INTO videos
			 (slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			 ON CONFLICT(slug) DO UPDATE SET
			   title = excluded.title,
			   media_label = excluded.media_label,
			   type = excluded.type,
			   thumbnail = excluded.thumbnail,
			   poster = excluded.poster,
			   video = excluded.video,
			   embed = excluded.embed,
			   source = excluded.source,
			   published = excluded.published,
			   sort_order = excluded.sort_order`,
		).run(
			record.slug,
			record.title,
			record.mediaLabel,
			record.type,
			normalizeMediaPath(record.thumbnail),
			normalizeMediaPath(record.poster ?? ""),
			normalizeMediaPath(record.video ?? ""),
			record.embed ?? "",
			record.source,
			record.published ? 1 : 0,
			sortOrder,
		);

		db.prepare(`DELETE FROM video_i18n WHERE slug = ?`).run(record.slug);
		const desc = db.prepare(
			`INSERT INTO video_i18n (slug, lang, description) VALUES (?, ?, ?)`,
		);
		for (const lang of LANGUAGES) {
			desc.run(record.slug, lang, record.descriptions[lang]);
		}
	});
	upsert();
}

export function deleteVideo(slug: string): void {
	getDb().prepare(`DELETE FROM videos WHERE slug = ?`).run(slug);
}
