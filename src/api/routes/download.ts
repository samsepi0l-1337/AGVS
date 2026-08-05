import { Router } from "express";
import { createReadStream, realpathSync, statSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../config.js";

const DOCUMENT_PATH_PATTERN =
	/^storage\/uploads\/documents\/[A-Za-z0-9][A-Za-z0-9._-]*\.(pdf|xls|xlsx)$/i;

const MIME_TYPES: Readonly<Record<string, string>> = {
	pdf: "application/pdf",
	xls: "application/vnd.ms-excel",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function queryString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function asciiFilenameFallback(filename: string, extension: string): string {
	let fallback = Array.from(Buffer.from(filename, "utf8"), (byte) =>
		byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : "_",
	).join("");

	if (fallback === "") {
		fallback = `download.${extension}`;
	}

	return fallback.replace(/["\\]/g, "");
}

function rawUrlEncode(value: string): string {
	return Array.from(Buffer.from(value, "utf8"), (byte) => {
		const isUnreserved =
			(byte >= 0x41 && byte <= 0x5a) ||
			(byte >= 0x61 && byte <= 0x7a) ||
			(byte >= 0x30 && byte <= 0x39) ||
			byte === 0x2d ||
			byte === 0x2e ||
			byte === 0x5f ||
			byte === 0x7e;

		if (isUnreserved) {
			return String.fromCharCode(byte);
		}

		return `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
	}).join("");
}

export const downloadRouter = Router();

downloadRouter.get("/", (req, res, next) => {
	const relative = queryString(req.query.id)
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");

	if (!DOCUMENT_PATH_PATTERN.test(relative)) {
		res.status(404).end();
		return;
	}

	let documentsPath: string;
	let filePath: string;
	let fileSize: number;

	try {
		documentsPath = realpathSync(
			path.join(REPO_ROOT, "storage", "uploads", "documents"),
		);
		filePath = realpathSync(path.join(REPO_ROOT, relative));
		const stats = statSync(filePath);

		if (
			!filePath.startsWith(`${documentsPath}${path.sep}`) ||
			!stats.isFile()
		) {
			res.status(404).end();
			return;
		}

		fileSize = stats.size;
	} catch {
		res.status(404).end();
		return;
	}

	const extension = path.extname(filePath).slice(1).toLowerCase();
	const mime = MIME_TYPES[extension] ?? "application/octet-stream";
	let downloadName = path
		.basename(queryString(req.query.name))
		.replace(/[\0/\\]/g, "");

	if (downloadName === "" || downloadName === "." || downloadName === "..") {
		downloadName = path.basename(filePath);
	}

	const fallback = asciiFilenameFallback(downloadName, extension);
	const encodedFilename = rawUrlEncode(downloadName);

	res.set({
		"Content-Type": mime,
		"X-Content-Type-Options": "nosniff",
		"Content-Length": String(fileSize),
		"Content-Disposition": `attachment; filename="${fallback}"; filename*=UTF-8''${encodedFilename}`,
	});

	const stream = createReadStream(filePath);
	stream.on("error", (error) => {
		if (res.headersSent) {
			res.destroy(error);
			return;
		}
		next(error);
	});
	stream.pipe(res);
});
