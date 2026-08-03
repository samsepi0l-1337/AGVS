import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./config.js";
import { fileTypeFromBuffer } from "./fileType.js";
import { normalizeMediaPath } from "./media.js";
import type { ArchiveAttachment } from "./types.js";

export type UploadKind = "image" | "video" | "document";

const RULES: Record<
	UploadKind,
	{ mimes: readonly string[]; maxBytes: number; subdir: string }
> = {
	image: {
		mimes: ["image/jpeg", "image/png", "image/webp"],
		maxBytes: 10 * 1024 * 1024,
		subdir: "images",
	},
	video: {
		mimes: ["video/mp4"],
		maxBytes: 500 * 1024 * 1024,
		subdir: "videos",
	},
	document: {
		mimes: [
			"application/pdf",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		],
		maxBytes: 25 * 1024 * 1024,
		subdir: "documents",
	},
};

export interface UploadedFile {
	buffer: Buffer;
	originalName: string;
	mimetype: string;
	size: number;
}

export function saveUpload(
	file: UploadedFile,
	kind: UploadKind,
): ArchiveAttachment {
	const rule = RULES[kind];
	if (file.size > rule.maxBytes) {
		throw new Error("Invalid upload.");
	}
	const detected = fileTypeFromBuffer(file.buffer, file.mimetype);
	if (!rule.mimes.includes(detected)) {
		throw new Error("Unsupported file type.");
	}
	const ext = path.extname(file.originalName).toLowerCase().replace(/^\./, "");
	if (ext === "" || ext.includes("..") || ext.includes("/")) {
		throw new Error("Invalid upload.");
	}
	const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
	const relative = normalizeMediaPath(
		`storage/uploads/${rule.subdir}/${name}`,
	);
	if (relative === "") {
		throw new Error("Upload failed.");
	}
	const target = path.join(REPO_ROOT, relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, file.buffer);
	return {
		path: relative,
		originalName: path.basename(file.originalName),
		mime: detected,
		size: file.size,
	};
}
