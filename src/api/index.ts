import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ADMIN_API_PORT, assertConfig } from "./config.js";
import { getDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";
import { downloadRouter } from "./routes/download.js";

function findRepoRoot(moduleUrl: string): string {
	let candidate = path.dirname(fileURLToPath(moduleUrl));

	while (true) {
		if (
			existsSync(path.join(candidate, "package.json")) &&
			existsSync(path.join(candidate, "src", "admin", "index.html"))
		) {
			return candidate;
		}

		const parent = path.dirname(candidate);
		if (parent === candidate) {
			throw new Error("Unable to locate the AGVS repository root");
		}
		candidate = parent;
	}
}

function getAllowedAdminOrigins(): Set<string> {
	const configuredOrigins = (process.env.AGVS_ADMIN_ORIGIN ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter((origin) => origin !== "");

	if (configuredOrigins.length > 0) {
		return new Set(configuredOrigins);
	}

	return new Set([
		`http://127.0.0.1:${ADMIN_API_PORT}`,
		`http://localhost:${ADMIN_API_PORT}`,
	]);
}

class CorsOriginError extends Error {
	constructor() {
		super("Origin not allowed by CORS");
		this.name = "CorsOriginError";
	}
}

assertConfig();
getDb();

const repoRoot = findRepoRoot(import.meta.url);
const adminRoot = path.join(repoRoot, "src", "admin");
const adminIndexPath = path.join(adminRoot, "index.html");
const adminAssetsPath = path.join(adminRoot, "assets");
const adminJsPath = path.join(repoRoot, "dist", "admin");
const adminIndexHtml = readFileSync(adminIndexPath, "utf8")
	.replace('href="assets/admin.css"', 'href="/admin/assets/admin.css"')
	.replace('src="js/main.js"', 'src="/admin/js/main.js"');
const allowedAdminOrigins = getAllowedAdminOrigins();

const app = express();
app.disable("x-powered-by");
app.use(
	cors({
		origin(origin, callback) {
			if (!origin || allowedAdminOrigins.has(origin)) {
				callback(null, true);
				return;
			}
			callback(new CorsOriginError());
		},
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "agvs-admin-api" });
});

app.get(["/admin", "/admin/"], (_req, res) => {
	res.type("html").send(adminIndexHtml);
});
app.use(
	"/admin/assets",
	express.static(adminAssetsPath, { index: false, redirect: false }),
);
app.use(
	"/admin/js",
	express.static(adminJsPath, { index: false, redirect: false }),
);

app.use("/download.php", downloadRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);

app.use(
	(
		err: unknown,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		const message = err instanceof Error ? err.message : "Server error";
		const status = err instanceof CorsOriginError ? 403 : 500;
		res.status(status).json({ error: message });
	},
);

app.listen(ADMIN_API_PORT, () => {
	console.log(`AGVS admin API listening on http://127.0.0.1:${ADMIN_API_PORT}`);
});
