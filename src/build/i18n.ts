import type { Lang, UiDocument } from "./types.js";

export interface RenderContext {
	lang: Lang;
	htmlLang: string;
	aboutLabel: string;
	ui: UiDocument;
	t(key: string): string;
	assetUrl(path: string): string;
}

const htmlLangByLang: Record<Lang, string> = {
	KR: "ko",
	EN: "en",
	JP: "ja",
};

const aboutLabelByLang: Record<Lang, string> = {
	KR: "회사소개",
	EN: "About",
	JP: "会社紹介",
};

function lookup(ui: UiDocument, key: string): string {
	let current: unknown = ui;
	for (const part of key.split(".")) {
		if (
			typeof current !== "object" ||
			current === null ||
			!Object.prototype.hasOwnProperty.call(current, part)
		) {
			return "";
		}
		current = (current as Record<string, unknown>)[part];
	}

	return typeof current === "string" ? current : "";
}

function normalizeAssetUrl(path: string): string {
	if (typeof path !== "string" || path === "") {
		return "";
	}
	if (/^(https?:)?\/\//i.test(path) || path.toLowerCase().startsWith("data:")) {
		return path;
	}

	let normalized = path.replace(/\\/g, "/");
	normalized = normalized.replace(/^\.\/+/g, "");
	normalized = normalized.replace(/^\/+/, "");
	normalized = normalized.replace(/^(en|jp)\/+/i, "");
	normalized = normalized.replace(/(^|\/)\.\.(\/|$)/g, "/");
	normalized = normalized.replace(/\/+/g, "/");
	normalized = normalized.replace(/^\/+/, "");
	if (normalized === "") {
		return "";
	}

	normalized = normalized.replace(/^(img|video)\//, "assets/$1/");
	return `./${normalized}`;
}

// Request-time language selection and cookie persistence are intentionally omitted.
export function createContext(lang: Lang, ui: UiDocument): RenderContext {
	return {
		lang,
		htmlLang: htmlLangByLang[lang],
		aboutLabel: aboutLabelByLang[lang],
		ui,
		t: (key) => lookup(ui, key),
		assetUrl: normalizeAssetUrl,
	};
}
