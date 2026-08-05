import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "../..");

dotenv.config({ path: path.join(REPO_ROOT, ".env") });

function readEnv(name: string, fallback = ""): string {
	const value = process.env[name];
	return value === undefined || value === null ? fallback : value.trim();
}

const sqliteEnv = readEnv("AGVS_SQLITE_PATH", "data/agvs.sqlite");
export const SQLITE_PATH =
	path.isAbsolute(sqliteEnv) ? sqliteEnv : path.join(REPO_ROOT, sqliteEnv);

export const ADMIN_PASSWORD_HASH = readEnv("AGVS_ADMIN_PASSWORD_HASH");
export const SESSION_SECRET = readEnv("AGVS_ADMIN_SESSION_SECRET");
export const ADMIN_API_PORT = Number.parseInt(
	readEnv("AGVS_ADMIN_API_PORT", "8850"),
	10,
);

export const SESSION_COOKIE = "agvs_admin_session";
export const SESSION_IDLE_SECONDS = 1800;
export const LANGUAGES = ["KR", "EN", "JP"] as const;
export type Lang = (typeof LANGUAGES)[number];

export function assertConfig(): void {
	if (!ADMIN_PASSWORD_HASH) {
		throw new Error(
			"AGVS_ADMIN_PASSWORD_HASH is required. Copy .env.example to .env and set the bcrypt hash.",
		);
	}
	if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
		throw new Error(
			"AGVS_ADMIN_SESSION_SECRET is required (min 16 characters).",
		);
	}
	if (!Number.isFinite(ADMIN_API_PORT) || ADMIN_API_PORT < 1) {
		throw new Error("AGVS_ADMIN_API_PORT must be a positive integer.");
	}
}
