import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import {
	ADMIN_PASSWORD_HASH,
	SESSION_COOKIE,
	SESSION_IDLE_SECONDS,
	SESSION_SECRET,
} from "./config.js";
import type { SessionPayload } from "./types.js";

function normalizeBcryptHash(hash: string): string {
	// Node bcrypt expects $2a$ / $2b$; PHP password_hash emits $2y$.
	if (hash.startsWith("$2y$")) {
		return `$2a$${hash.slice(4)}`;
	}
	return hash;
}

function isSessionPayload(value: unknown): value is SessionPayload {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const authenticated = Reflect.get(value, "authenticated");
	const csrf = Reflect.get(value, "csrf");
	const lastActive = Reflect.get(value, "lastActive");
	return (
		authenticated === true &&
		typeof csrf === "string" &&
		csrf.length > 0 &&
		typeof lastActive === "number"
	);
}

function seal(payload: SessionPayload): string {
	const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
		"base64url",
	);
	const sig = crypto
		.createHmac("sha256", SESSION_SECRET)
		.update(body)
		.digest("base64url");
	return `${body}.${sig}`;
}

function unseal(token: string): SessionPayload | null {
	const parts = token.split(".");
	if (parts.length !== 2) {
		return null;
	}
	const [body, sig] = parts;
	if (!body || !sig) {
		return null;
	}
	const expected = crypto
		.createHmac("sha256", SESSION_SECRET)
		.update(body)
		.digest("base64url");
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
		return null;
	}
	try {
		const parsed: unknown = JSON.parse(
			Buffer.from(body, "base64url").toString("utf8"),
		);
		if (!isSessionPayload(parsed)) {
			return null;
		}
		const now = Math.floor(Date.now() / 1000);
		if (now - parsed.lastActive > SESSION_IDLE_SECONDS) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function tokensEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		return false;
	}
	return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string): boolean {
	const hash = ADMIN_PASSWORD_HASH;
	if (!hash) {
		return false;
	}
	try {
		return bcrypt.compareSync(password, normalizeBcryptHash(hash));
	} catch {
		return false;
	}
}

export function createSession(): SessionPayload {
	return {
		authenticated: true,
		csrf: crypto.randomBytes(32).toString("hex"),
		lastActive: Math.floor(Date.now() / 1000),
	};
}

export function setSessionCookie(res: Response, session: SessionPayload): void {
	session.lastActive = Math.floor(Date.now() / 1000);
	res.cookie(SESSION_COOKIE, seal(session), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: SESSION_IDLE_SECONDS * 1000,
	});
}

export function clearSessionCookie(res: Response): void {
	res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function readSession(req: Request): SessionPayload | null {
	const raw = req.cookies?.[SESSION_COOKIE];
	if (typeof raw !== "string" || raw === "") {
		return null;
	}
	return unseal(raw);
}

export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const session = readSession(req);
	if (!session) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	setSessionCookie(res, session);
	res.locals.session = session;
	next();
}

export function requireCsrf(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const session = res.locals.session;
	if (!isSessionPayload(session)) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const header = req.get("x-csrf-token") ?? "";
	let bodyToken = "";
	if (typeof req.body === "object" && req.body !== null) {
		const raw = Reflect.get(req.body, "csrfToken");
		if (typeof raw === "string") {
			bodyToken = raw;
		}
	}
	const token = header || bodyToken;
	if (!tokensEqual(token, session.csrf)) {
		res.status(403).json({ error: "Invalid CSRF token" });
		return;
	}
	next();
}

declare module "express-serve-static-core" {
	interface Locals {
		session?: SessionPayload;
	}
}
