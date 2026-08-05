import { api } from "./api.js";
import {
	append,
	clear,
	element,
	field,
	inputControl,
	setButtonBusy,
	setStatus,
	textareaControl,
} from "./dom.js";
import { parseJsonObject } from "./model.js";
import type { Lang, SaveResponse, UiResponse } from "./types.js";

export async function renderUiEditor(
	root: HTMLElement,
	lang: Lang,
): Promise<void> {
	clear(root);
	root.append(
		element("p", {
			className: "loadingState",
			text: "UI 문서를 불러오고 있습니다…",
		}),
	);
	try {
		const [current, reference] = await Promise.all([
			loadUi(lang),
			lang === "KR" ? Promise.resolve(null) : loadUi("KR"),
		]);
		renderForm(root, lang, current, reference);
	} catch (error) {
		clear(root);
		root.append(
			element("p", {
				className: "error",
				text: errorMessage(error),
			}),
		);
	}
}

async function loadUi(lang: Lang): Promise<Record<string, unknown>> {
	const response = await api.get<UiResponse>(`/content/ui/${lang}?raw=1`);
	return response.ui;
}

function renderForm(
	root: HTMLElement,
	lang: Lang,
	current: Record<string, unknown>,
	reference: Record<string, unknown> | null,
): void {
	clear(root);
	root.append(
		element("div", { className: "toolbar" }, [
			element("strong", { text: `UI 문서 · ${lang}` }),
			element("span", {
				text: "archive.items는 저장 시 비워지며, 자료실 본문은 자료실 번역에서 편집합니다.",
			}),
		]),
	);
	const form = element("form", { className: "panel editorPanel" });
	form.append(
		inputControl("type", "ui", "hidden"),
		inputControl("lang", lang, "hidden"),
	);
	if (reference) {
		const referenceArea = textareaControl(
			"uiReference",
			JSON.stringify(reference, null, "\t"),
		);
		referenceArea.readOnly = true;
		referenceArea.className = "ref codeArea";
		referenceArea.removeAttribute("name");
		form.append(field("KR 참고 (읽기 전용)", referenceArea));
	}
	const payload = textareaControl(
		"payloadJson",
		JSON.stringify(current, null, "\t"),
	);
	payload.required = true;
	payload.className = "code codeArea";
	const status = element("p", { className: "formStatus notice" });
	status.hidden = true;
	const saveButton = element("button", { text: "저장" });
	saveButton.type = "submit";
	append(
		form,
		field(`${lang} payload_json`, payload),
		status,
		element("div", { className: "formActions" }, [saveButton]),
	);
	root.append(form);

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(saveButton, true, "저장 중…");
		try {
			const parsed = parseJsonObject(payload.value);
			const response = await api.put<SaveResponse>(`/content/ui/${lang}`, parsed);
			payload.value = JSON.stringify(response.ui ?? parsed, null, "\t");
			setStatus(status, "저장되었습니다.");
		} catch (error) {
			setStatus(status, errorMessage(error), "error");
		} finally {
			setButtonBusy(saveButton, false);
		}
	});
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}
