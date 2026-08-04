import { z } from "zod";

export const langSchema = z.enum(["KR", "EN", "JP"]);

export const contentTypeSchema = z.enum(["products", "videos", "archives"]);

const slugSchema = z
	.string()
	.trim()
	.toLowerCase()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message: "Slug must use lowercase letters, numbers, and hyphens.",
	});

const modelImageSchema = z.object({
	src: z.string(),
	text: z.string().default(""),
});

const productModelSchema = z.object({
	id: slugSchema,
	label: z.string().min(1),
	specs: z.array(z.string()),
	images: z.array(modelImageSchema),
});

export const productRecordSchema = z.object({
	slug: slugSchema,
	name: z.string().min(1),
	category: slugSchema,
	source: z.string().default(""),
	thumbnail: z.string().default(""),
	published: z.boolean().default(true),
	sortOrder: z.number().int().min(0),
	models: z.array(productModelSchema).min(1),
});

export const productUpsertSchema = z.object({
	KR: productRecordSchema,
	EN: productRecordSchema,
	JP: productRecordSchema,
});

export const videoRecordSchema = z.object({
	slug: slugSchema,
	title: z.string().min(1),
	mediaLabel: z.string().default(""),
	type: z.enum(["youtube", "local"]),
	thumbnail: z.string().default(""),
	source: z.string().default(""),
	descriptions: z.object({
		KR: z.string(),
		EN: z.string(),
		JP: z.string(),
	}),
	published: z.boolean().default(true),
	sortOrder: z.number().int().min(0),
	embed: z.string().optional(),
	poster: z.string().optional(),
	video: z.string().optional(),
});

const archiveAttachmentSchema = z.object({
	path: z.string(),
	originalName: z.string(),
	mime: z.string(),
	size: z.number().int().nonnegative(),
});

export const archiveRecordSchema = z.object({
	slug: slugSchema,
	title: z.string().min(1),
	body: z.string().default(""),
	image: z.string().default(""),
	thumbnail: z.string().default(""),
	detail: z.array(z.string()),
	attachments: z.array(archiveAttachmentSchema),
	published: z.boolean().default(true),
	sortOrder: z.number().int().min(0),
});

export const archiveUpsertSchema = z.object({
	KR: archiveRecordSchema,
	EN: archiveRecordSchema,
	JP: archiveRecordSchema,
});

export const loginSchema = z.object({
	password: z.string().min(1),
});

export const deleteSchema = z.object({
	slug: slugSchema,
});

/** Product translation fields only — no slug/media/sort/published. */
export const productI18nSchema = z.object({
	name: z.string().min(1),
	models: z
		.array(
			z.object({
				id: slugSchema,
				label: z.string().min(1),
				specs: z.array(z.string()),
			}),
		)
		.min(1),
});

/** Archive translation fields only — no image/attachments/sort/published. */
export const archiveI18nSchema = z.object({
	title: z.string().min(1),
	body: z.string().default(""),
	detail: z.array(z.string()).default([]),
});

/** Video translation field only — title/media stay on the shared row. */
export const videoI18nSchema = z.object({
	description: z.string(),
});

/**
 * Full UI chrome document for one lang. Archive list items are not stored here
 * (they live in archive_i18n); any archive.items in the payload are stripped.
 */
export const uiDocumentSchema = z
	.record(z.string(), z.unknown())
	.refine((value) => !Array.isArray(value), {
		message: "UI payload must be a JSON object.",
	});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
export type VideoRecordInput = z.infer<typeof videoRecordSchema>;
export type ArchiveUpsertInput = z.infer<typeof archiveUpsertSchema>;
export type ProductI18nInput = z.infer<typeof productI18nSchema>;
export type ArchiveI18nInput = z.infer<typeof archiveI18nSchema>;
export type VideoI18nInput = z.infer<typeof videoI18nSchema>;
export type UiDocumentInput = z.infer<typeof uiDocumentSchema>;
