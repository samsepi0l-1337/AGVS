import { Router } from "express";

import {
	clearSessionCookie,
	createSession,
	readSession,
	requireAuth,
	setSessionCookie,
	verifyAdminPassword,
} from "../auth.js";
import { loginSchema } from "../validation.js";

export const authRouter = Router();

authRouter.get("/me", (req, res) => {
	const session = readSession(req);
	if (!session) {
		res.status(401).json({ authenticated: false });
		return;
	}
	setSessionCookie(res, session);
	res.json({ authenticated: true, csrfToken: session.csrf });
});

authRouter.post("/login", (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: "Password required" });
		return;
	}
	if (!verifyAdminPassword(parsed.data.password)) {
		res.status(401).json({ error: "Invalid credentials" });
		return;
	}
	const session = createSession();
	setSessionCookie(res, session);
	res.json({ ok: true, csrfToken: session.csrf });
});

authRouter.post("/logout", requireAuth, (_req, res) => {
	clearSessionCookie(res);
	res.json({ ok: true });
});
