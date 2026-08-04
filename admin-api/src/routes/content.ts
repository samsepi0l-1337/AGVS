import type { Response } from "express";

import { Router } from "express";
import multer from "multer";
import { ZodError } from "zod";

import { requireAuth, requireCsrf } from "../auth.js";
import { backupSqlite } from "../db.js";
import {
	deleteArchive,
	findArchive,
	listArchives,
	upsertArchive,
	upsertArchiveI18n,
} from "../store/archives.js";
import {
	deleteProduct,
	findProduct,
	listProducts,
	upsertProduct,
	upsertProductI18n,
} from "../store/products.js";
import {
	getUiDocument,
	getUiDocumentRaw,
	upsertUiDocument,
} from "../store/ui.js";
import {
	deleteVideo,
	findVideo,
	listVideos,
	upsertVideo,
	upsertVideoI18n,
} from "../store/videos.js";
import { type UploadKind, saveUpload } from "../upload.js";
import {
	archiveI18nSchema,
	archiveUpsertSchema,
	contentTypeSchema,
	deleteSchema,
	langSchema,
	productI18nSchema,
	productUpsertSchema,
	uiDocumentSchema,
	videoI18nSchema,
	videoRecordSchema,
} from "../validation.js";

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 500 * 1024 * 1024 },
});

export const contentRouter = Router();
contentRouter.use(requireAuth);

function zodError(res: Response, error: ZodError): void {
	res.status(400).json({
		error: "Validation failed",
		issues: error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		})),
	});
}

contentRouter.get("/ui/:lang", (req, res) => {
	const langParsed = langSchema.safeParse(req.params.lang);
	if (!langParsed.success) {
		res.status(400).json({ error: "Invalid lang" });
		return;
	}
	const raw = typeof req.query.raw === "string" && req.query.raw === "1";
	res.json({
		ui:
			raw ? getUiDocumentRaw(langParsed.data) : getUiDocument(langParsed.data),
	});
});

contentRouter.put("/ui/:lang", requireCsrf, (req, res) => {
	const langParsed = langSchema.safeParse(req.params.lang);
	if (!langParsed.success) {
		res.status(400).json({ error: "Invalid lang" });
		return;
	}
	const parsed = uiDocumentSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	try {
		backupSqlite();
		upsertUiDocument(langParsed.data, parsed.data);
		res.json({ ok: true, ui: getUiDocumentRaw(langParsed.data) });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.post(
	"/upload",
	requireCsrf,
	upload.single("file"),
	(req, res) => {
		const kindRaw = typeof req.body?.kind === "string" ? req.body.kind : "";
		const kind: UploadKind | null =
			kindRaw === "image" || kindRaw === "video" || kindRaw === "document" ?
				kindRaw
			:	null;
		if (!kind) {
			res.status(400).json({ error: "kind must be image|video|document" });
			return;
		}
		const file = req.file;
		if (!file) {
			res.status(400).json({ error: "file required" });
			return;
		}
		try {
			const saved = saveUpload(
				{
					buffer: file.buffer,
					originalName: file.originalname,
					mimetype: file.mimetype,
					size: file.size,
				},
				kind,
			);
			res.json({ ok: true, file: saved });
		} catch (error) {
			res.status(400).json({
				error: error instanceof Error ? error.message : "Upload failed",
			});
		}
	},
);

contentRouter.put("/products/:slug/i18n/:lang", requireCsrf, (req, res) => {
	const slug =
		typeof req.params.slug === "string" ? req.params.slug : "";
	const langParsed = langSchema.safeParse(req.params.lang);
	if (!slug || !langParsed.success) {
		res.status(400).json({ error: "Slug and valid lang required" });
		return;
	}
	const parsed = productI18nSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	try {
		backupSqlite();
		upsertProductI18n(slug, langParsed.data, parsed.data);
		res.json({ ok: true, item: findProduct(slug, langParsed.data) });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.put("/archives/:slug/i18n/:lang", requireCsrf, (req, res) => {
	const slug =
		typeof req.params.slug === "string" ? req.params.slug : "";
	const langParsed = langSchema.safeParse(req.params.lang);
	if (!slug || !langParsed.success) {
		res.status(400).json({ error: "Slug and valid lang required" });
		return;
	}
	const parsed = archiveI18nSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	try {
		backupSqlite();
		upsertArchiveI18n(slug, langParsed.data, parsed.data);
		res.json({ ok: true, item: findArchive(slug, langParsed.data) });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.put("/videos/:slug/i18n/:lang", requireCsrf, (req, res) => {
	const slug =
		typeof req.params.slug === "string" ? req.params.slug : "";
	const langParsed = langSchema.safeParse(req.params.lang);
	if (!slug || !langParsed.success) {
		res.status(400).json({ error: "Slug and valid lang required" });
		return;
	}
	const parsed = videoI18nSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	try {
		backupSqlite();
		upsertVideoI18n(slug, langParsed.data, parsed.data);
		res.json({ ok: true, item: findVideo(slug) });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.put("/products/:slug", requireCsrf, (req, res) => {
	const slug = req.params.slug;
	if (!slug) {
		res.status(400).json({ error: "Slug required" });
		return;
	}
	const parsed = productUpsertSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	if (
		parsed.data.KR.slug !== slug ||
		parsed.data.EN.slug !== slug ||
		parsed.data.JP.slug !== slug
	) {
		res.status(400).json({ error: "Slug mismatch" });
		return;
	}
	try {
		backupSqlite();
		upsertProduct(parsed.data);
		res.json({ ok: true, item: findProduct(slug, "KR") });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.put("/videos/:slug", requireCsrf, (req, res) => {
	const slug = req.params.slug;
	if (!slug) {
		res.status(400).json({ error: "Slug required" });
		return;
	}
	const parsed = videoRecordSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	if (parsed.data.slug !== slug) {
		res.status(400).json({ error: "Slug mismatch" });
		return;
	}
	if (
		parsed.data.type === "youtube" &&
		!(parsed.data.embed ?? "").startsWith("https://www.youtube.com/embed/")
	) {
		res.status(400).json({ error: "Use a YouTube embed URL." });
		return;
	}
	try {
		backupSqlite();
		upsertVideo(parsed.data);
		res.json({ ok: true, item: findVideo(slug) });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.put("/archives/:slug", requireCsrf, (req, res) => {
	const slug = req.params.slug;
	if (!slug) {
		res.status(400).json({ error: "Slug required" });
		return;
	}
	const parsed = archiveUpsertSchema.safeParse(req.body);
	if (!parsed.success) {
		zodError(res, parsed.error);
		return;
	}
	if (
		parsed.data.KR.slug !== slug ||
		parsed.data.EN.slug !== slug ||
		parsed.data.JP.slug !== slug
	) {
		res.status(400).json({ error: "Slug mismatch" });
		return;
	}
	try {
		backupSqlite();
		upsertArchive(parsed.data);
		res.json({ ok: true, item: findArchive(slug, "KR") });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Save failed",
		});
	}
});

contentRouter.get("/:type", (req, res) => {
	const typeParsed = contentTypeSchema.safeParse(req.params.type);
	if (!typeParsed.success) {
		res.status(404).json({ error: "Unknown content type" });
		return;
	}
	const langParsed = langSchema.safeParse(
		typeof req.query.lang === "string" ? req.query.lang : "KR",
	);
	const lang = langParsed.success ? langParsed.data : "KR";
	const type = typeParsed.data;
	if (type === "products") {
		res.json({ items: listProducts(lang) });
		return;
	}
	if (type === "videos") {
		res.json({ items: listVideos() });
		return;
	}
	res.json({ items: listArchives(lang) });
});

contentRouter.get("/:type/:slug", (req, res) => {
	const typeParsed = contentTypeSchema.safeParse(req.params.type);
	if (!typeParsed.success) {
		res.status(404).json({ error: "Unknown content type" });
		return;
	}
	const slug = req.params.slug;
	if (!slug) {
		res.status(400).json({ error: "Slug required" });
		return;
	}
	const langParsed = langSchema.safeParse(
		typeof req.query.lang === "string" ? req.query.lang : "KR",
	);
	const lang = langParsed.success ? langParsed.data : "KR";
	const type = typeParsed.data;
	const item =
		type === "products" ? findProduct(slug, lang)
		: type === "videos" ? findVideo(slug)
		: findArchive(slug, lang);
	if (!item) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json({ item });
});

contentRouter.delete("/:type/:slug", requireCsrf, (req, res) => {
	const typeParsed = contentTypeSchema.safeParse(req.params.type);
	const slugParsed = deleteSchema.safeParse({ slug: req.params.slug });
	if (!typeParsed.success || !slugParsed.success) {
		res.status(400).json({ error: "Invalid type or slug" });
		return;
	}
	const type = typeParsed.data;
	const slug = slugParsed.data.slug;
	try {
		backupSqlite();
		if (type === "products") {
			deleteProduct(slug);
		} else if (type === "videos") {
			deleteVideo(slug);
		} else {
			deleteArchive(slug);
		}
		res.json({ ok: true });
	} catch (error) {
		res.status(400).json({
			error: error instanceof Error ? error.message : "Delete failed",
		});
	}
});
