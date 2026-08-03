import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { assertConfig, ADMIN_API_PORT } from "./config.js";
import { getDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";

assertConfig();
getDb();

const app = express();
app.disable("x-powered-by");
app.use(
	cors({
		origin: true,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "agvs-admin-api" });
});

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
		res.status(500).json({ error: message });
	},
);

app.listen(ADMIN_API_PORT, () => {
	console.log(`AGVS admin API listening on http://127.0.0.1:${ADMIN_API_PORT}`);
});
