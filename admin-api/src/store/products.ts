import type {
	ItemRow,
	ModelI18nRow,
	ModelImage,
	ModelImageRow,
	ModelRow,
	ProductModel,
	ProductRecord,
} from "../types.js";
import type { ProductI18nInput, ProductUpsertInput } from "../validation.js";

import { LANGUAGES, type Lang } from "../config.js";
import { getDb, jsonDecodeArray, jsonEncode, nextSortOrder } from "../db.js";
import { normalizeMediaPath, normalizeModelText } from "../media.js";

function isItemRow(value: unknown): value is ItemRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "slug") === "string" &&
		typeof Reflect.get(value, "category_id") === "string" &&
		typeof Reflect.get(value, "source") === "string" &&
		typeof Reflect.get(value, "thumbnail") === "string" &&
		typeof Reflect.get(value, "published") === "number" &&
		typeof Reflect.get(value, "sort_order") === "number"
	);
}

function isModelRow(value: unknown): value is ModelRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "id") === "number" &&
		typeof Reflect.get(value, "item_slug") === "string" &&
		typeof Reflect.get(value, "model_key") === "string" &&
		typeof Reflect.get(value, "sort_order") === "number"
	);
}

function isModelI18nRow(value: unknown): value is ModelI18nRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "model_row_id") === "number" &&
		typeof Reflect.get(value, "lang") === "string" &&
		typeof Reflect.get(value, "label") === "string" &&
		typeof Reflect.get(value, "specs_json") === "string"
	);
}

function isModelImageRow(value: unknown): value is ModelImageRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return (
		typeof Reflect.get(value, "id") === "number" &&
		typeof Reflect.get(value, "model_row_id") === "number" &&
		typeof Reflect.get(value, "src") === "string" &&
		typeof Reflect.get(value, "alt_text") === "string" &&
		typeof Reflect.get(value, "sort_order") === "number"
	);
}

function parseSpecs(raw: string): string[] {
	return jsonDecodeArray(raw).filter(
		(entry): entry is string => typeof entry === "string",
	);
}

export function listProducts(lang: Lang = "KR"): ProductRecord[] {
	const db = getDb();
	const items = db
		.prepare(
			`SELECT i.slug, i.category_id, i.source, i.thumbnail, i.published, i.sort_order, t.name
			 FROM items i
			 JOIN item_i18n t ON t.slug = i.slug AND t.lang = ?
			 ORDER BY i.sort_order ASC, i.slug ASC`,
		)
		.all(lang);

	const modelStmt = db.prepare(
		`SELECT id, item_slug, model_key, sort_order FROM models
		 WHERE item_slug = ? ORDER BY sort_order ASC, id ASC`,
	);
	const modelI18nStmt = db.prepare(
		`SELECT model_row_id, lang, label, subtitle, specs_json FROM model_i18n
		 WHERE model_row_id = ? AND lang = ?`,
	);
	const imageStmt = db.prepare(
		`SELECT id, model_row_id, src, alt_text, sort_order FROM model_images
		 WHERE model_row_id = ? ORDER BY sort_order ASC, id ASC`,
	);

	const result: ProductRecord[] = [];
	for (const raw of items) {
		if (
			typeof raw !== "object" ||
			raw === null ||
			typeof Reflect.get(raw, "name") !== "string"
		) {
			continue;
		}
		const row = {
			slug: String(Reflect.get(raw, "slug")),
			category_id: String(Reflect.get(raw, "category_id")),
			source: String(Reflect.get(raw, "source")),
			thumbnail: String(Reflect.get(raw, "thumbnail")),
			published: Number(Reflect.get(raw, "published")),
			sort_order: Number(Reflect.get(raw, "sort_order")),
		};
		if (!isItemRow(row)) {
			continue;
		}
		const name = String(Reflect.get(raw, "name"));
		const models: ProductModel[] = [];
		for (const modelRaw of modelStmt.all(row.slug)) {
			if (!isModelRow(modelRaw)) {
				continue;
			}
			const i18nRaw = modelI18nStmt.get(modelRaw.id, lang);
			const label = i18nRaw && isModelI18nRow(i18nRaw) ? i18nRaw.label : "";
			const subtitle =
				i18nRaw && isModelI18nRow(i18nRaw) ?
					String(Reflect.get(i18nRaw, "subtitle") ?? "")
				:	"";
			const specs =
				i18nRaw && isModelI18nRow(i18nRaw) ?
					parseSpecs(i18nRaw.specs_json)
				:	[];
			const images: ModelImage[] = [];
			for (const imgRaw of imageStmt.all(modelRaw.id)) {
				if (!isModelImageRow(imgRaw)) {
					continue;
				}
				const src = normalizeMediaPath(imgRaw.src);
				if (src === "") {
					continue;
				}
				images.push({ src, text: imgRaw.alt_text });
			}
			models.push({
				id: modelRaw.model_key,
				label,
				subtitle,
				specs,
				images,
			});
		}
		let thumbnail = normalizeMediaPath(row.thumbnail);
		const firstImage = models[0]?.images[0]?.src;
		if (thumbnail === "" && firstImage) {
			thumbnail = normalizeMediaPath(firstImage);
		}
		result.push({
			slug: row.slug,
			name,
			category: row.category_id,
			source: row.source,
			thumbnail,
			published: row.published === 1,
			sortOrder: row.sort_order,
			models,
		});
	}
	return result;
}

export function findProduct(
	slug: string,
	lang: Lang = "KR",
): ProductRecord | null {
	return listProducts(lang).find((item) => item.slug === slug) ?? null;
}

export function upsertProduct(recordsByLang: ProductUpsertInput): void {
	const kr = recordsByLang.KR;
	const db = getDb();
	const upsert = db.transaction(() => {
		const existing = db
			.prepare(`SELECT sort_order FROM items WHERE slug = ?`)
			.get(kr.slug);
		const existingSort =
			(
				typeof existing === "object" &&
				existing !== null &&
				typeof Reflect.get(existing, "sort_order") === "number"
			) ?
				Number(Reflect.get(existing, "sort_order"))
			:	null;
		const sortOrder =
			typeof kr.sortOrder === "number" ?
				kr.sortOrder
			:	(existingSort ?? nextSortOrder(db, "items"));

		let thumb = normalizeMediaPath(kr.thumbnail);
		const firstSrc = kr.models[0]?.images[0]?.src;
		if (thumb === "" && firstSrc) {
			thumb = normalizeMediaPath(firstSrc);
		}

		db.prepare(
			`INSERT INTO items (slug, category_id, source, thumbnail, published, sort_order)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT(slug) DO UPDATE SET
			   category_id = excluded.category_id,
			   source = excluded.source,
			   thumbnail = excluded.thumbnail,
			   published = excluded.published,
			   sort_order = excluded.sort_order`,
		).run(
			kr.slug,
			kr.category,
			kr.source,
			thumb,
			kr.published ? 1 : 0,
			sortOrder,
		);

		const oldIds = db
			.prepare(`SELECT id FROM models WHERE item_slug = ?`)
			.all(kr.slug)
			.map((row) =>
				(
					typeof row === "object" &&
					row !== null &&
					typeof Reflect.get(row, "id") === "number"
				) ?
					Number(Reflect.get(row, "id"))
				:	null,
			)
			.filter((id): id is number => id !== null);

		if (oldIds.length > 0) {
			const placeholders = oldIds.map(() => "?").join(",");
			db.prepare(
				`DELETE FROM model_images WHERE model_row_id IN (${placeholders})`,
			).run(...oldIds);
			db.prepare(
				`DELETE FROM model_i18n WHERE model_row_id IN (${placeholders})`,
			).run(...oldIds);
			db.prepare(`DELETE FROM models WHERE item_slug = ?`).run(kr.slug);
		}

		const modelInsert = db.prepare(
			`INSERT INTO models (item_slug, model_key, sort_order) VALUES (?, ?, ?)`,
		);
		const imageInsert = db.prepare(
			`INSERT INTO model_images (model_row_id, src, alt_text, sort_order)
			 VALUES (?, ?, ?, ?)`,
		);
		const itemI18n = db.prepare(
			`INSERT INTO item_i18n (slug, lang, name) VALUES (?, ?, ?)
			 ON CONFLICT(slug, lang) DO UPDATE SET name = excluded.name`,
		);
		const modelI18n = db.prepare(
			`INSERT INTO model_i18n (model_row_id, lang, label, subtitle, specs_json)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(model_row_id, lang) DO UPDATE SET
			   label = excluded.label,
			   subtitle = excluded.subtitle,
			   specs_json = excluded.specs_json`,
		);

		const modelRowIds: number[] = [];
		kr.models.forEach((model, mSort) => {
			const info = modelInsert.run(kr.slug, model.id, mSort);
			const mid = Number(info.lastInsertRowid);
			modelRowIds[mSort] = mid;
			model.images.forEach((img, iSort) => {
				const src = normalizeMediaPath(img.src);
				if (src === "") {
					return;
				}
				imageInsert.run(mid, src, img.text, iSort);
			});
		});

		for (const lang of LANGUAGES) {
			const rec = recordsByLang[lang];
			itemI18n.run(kr.slug, lang, rec.name);
			rec.models.forEach((model, mSort) => {
				const mid = modelRowIds[mSort];
				if (mid === undefined) {
					return;
				}
				modelI18n.run(
					mid,
					lang,
					normalizeModelText(model.label),
					normalizeModelText(model.subtitle ?? ""),
					jsonEncode(model.specs),
				);
			});
		}
	});
	upsert();
}

export function deleteProduct(slug: string): void {
	getDb().prepare(`DELETE FROM items WHERE slug = ?`).run(slug);
}

/**
 * Upsert item_i18n + model_i18n for one lang. Does not touch items, models,
 * or model_images (shared structure/media).
 */
export function upsertProductI18n(
	slug: string,
	lang: Lang,
	payload: ProductI18nInput,
): void {
	const db = getDb();
	const item = db.prepare(`SELECT slug FROM items WHERE slug = ?`).get(slug);
	if (!item) {
		throw new Error(`Product not found: ${slug}`);
	}

	const models = db
		.prepare(
			`SELECT id, model_key FROM models WHERE item_slug = ? ORDER BY sort_order ASC, id ASC`,
		)
		.all(slug);
	const byKey = new Map<string, number>();
	for (const raw of models) {
		if (
			typeof raw !== "object" ||
			raw === null ||
			typeof Reflect.get(raw, "id") !== "number" ||
			typeof Reflect.get(raw, "model_key") !== "string"
		) {
			continue;
		}
		byKey.set(
			String(Reflect.get(raw, "model_key")),
			Number(Reflect.get(raw, "id")),
		);
	}

	const upsert = db.transaction(() => {
		db.prepare(
			`INSERT INTO item_i18n (slug, lang, name) VALUES (?, ?, ?)
			 ON CONFLICT(slug, lang) DO UPDATE SET name = excluded.name`,
		).run(slug, lang, payload.name);

		const modelI18n = db.prepare(
			`INSERT INTO model_i18n (model_row_id, lang, label, subtitle, specs_json)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(model_row_id, lang) DO UPDATE SET
			   label = excluded.label,
			   subtitle = excluded.subtitle,
			   specs_json = excluded.specs_json`,
		);

		for (const model of payload.models) {
			const mid = byKey.get(model.id);
			if (mid === undefined) {
				throw new Error(
					`Unknown model id "${model.id}" for product ${slug}. Structure edits use full CRUD.`,
				);
			}
			modelI18n.run(
				mid,
				lang,
				normalizeModelText(model.label),
				normalizeModelText(model.subtitle ?? ""),
				jsonEncode(model.specs),
			);
		}
	});
	upsert();
}
