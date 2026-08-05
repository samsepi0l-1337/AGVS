import { api } from "./api.js";
import {
	append,
	clear,
	element,
	field,
	formText,
	inputControl,
	selectControl,
	setButtonBusy,
	setStatus,
	textareaControl,
} from "./dom.js";
import { resolvePrimaryModelLabel, textToLines } from "./model.js";
import {
	languages,
	type ArchiveRecord,
	type ItemResponse,
	type Lang,
	type ListResponse,
	type ProductRecord,
	type SaveResponse,
	type VideoRecord,
} from "./types.js";
import { renderUiEditor } from "./ui.js";

export type TranslationType = "ui" | "products" | "archives" | "videos";

const typeLabels: Record<TranslationType, string> = {
	ui: "UI 문구",
	products: "제품",
	archives: "자료실",
	videos: "AGV 영상",
};

export async function renderTranslate(
	root: HTMLElement,
	params: URLSearchParams,
): Promise<void> {
	clear(root);
	root.append(
		element("h1", { text: "번역 (i18n only)" }),
		element("p", {
			className: "pageLead",
			text: "언어별 문구만 수정합니다. Slug·미디어·정렬·공개 여부는 구조/미디어 관리에서 다룹니다.",
		}),
	);
	const type = translationType(params.get("type"));
	const lang = language(params.get("lang"));
	root.append(createPicker(type, lang));
	if (!type) {
		root.append(
			element("div", { className: "emptyPrompt" }, [
				element("strong", { text: "번역할 유형과 언어를 선택하세요." }),
				element("p", {
					text: "공유 구조는 바뀌지 않고 선택한 언어의 문구만 저장됩니다.",
				}),
			]),
		);
		return;
	}
	const workspace = element("section", { className: "translationWorkspace" });
	root.append(workspace);
	if (type === "ui") {
		await renderUiEditor(workspace, lang);
		return;
	}
	const editSlug = params.get("edit")?.trim() ?? "";
	try {
		if (!editSlug) {
			await renderTranslationList(workspace, type, lang);
			return;
		}
		if (type === "products") {
			await renderProductTranslation(workspace, lang, editSlug);
		} else if (type === "archives") {
			await renderArchiveTranslation(workspace, lang, editSlug);
		} else {
			await renderVideoTranslation(workspace, lang, editSlug);
		}
	} catch (error) {
		clear(workspace);
		workspace.append(
			element("p", { className: "error", text: errorMessage(error) }),
		);
	}
}

function createPicker(
	type: TranslationType | null,
	lang: Lang,
): HTMLFormElement {
	const form = element("form", { className: "panel translatePick" });
	const typeSelect = selectControl(
		"type",
		[
			{ value: "", label: "선택…" },
			...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
		],
		type ?? "",
	);
	const langSelect = selectControl(
		"lang",
		languages.map((code) => ({ value: code, label: code })),
		lang,
	);
	const openButton = element("button", { text: "열기" });
	openButton.type = "submit";
	append(form, field("유형", typeSelect), field("언어", langSelect), openButton);
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const selectedType = typeSelect.value;
		window.location.hash = selectedType
			? `#translate?type=${encodeURIComponent(selectedType)}&lang=${langSelect.value}`
			: "#translate";
	});
	return form;
}

async function renderTranslationList(
	root: HTMLElement,
	type: Exclude<TranslationType, "ui">,
	lang: Lang,
): Promise<void> {
	root.append(
		element("p", { className: "loadingState", text: "목록을 불러오고 있습니다…" }),
	);
	const items = await loadTranslationList(type, lang);
	clear(root);
	root.append(
		element("div", { className: "toolbar" }, [
			element("strong", { text: `${typeLabels[type]} · ${lang}` }),
			element("a", { text: "유형 다시 선택", attributes: { href: "#translate" } }),
		]),
	);
	const tableWrap = element("div", { className: "tableWrap" });
	const table = element("table");
	const header = element("tr");
	header.append(
		element("th", { text: "제목" }),
		element("th", { text: "Slug" }),
		element("th"),
	);
	table.append(element("thead", {}, [header]));
	const tbody = element("tbody");
	for (const item of items) {
		const title = type === "products"
			? (item as ProductRecord).name
			: (item as ArchiveRecord | VideoRecord).title;
		const row = element("tr");
		row.append(
			element("td", { text: title }),
			element("td", {}, [element("code", { text: item.slug })]),
			element("td", { className: "tableAction" }, [
				element("a", {
					text: "번역",
					attributes: {
						href: translationHref(type, lang, item.slug),
					},
				}),
			]),
		);
		tbody.append(row);
	}
	if (items.length === 0) {
		const cell = element("td", {
			className: "emptyCell",
			text: "이 언어로 번역할 항목이 없습니다.",
		});
		cell.colSpan = 3;
		tbody.append(element("tr", {}, [cell]));
	}
	table.append(tbody);
	tableWrap.append(table);
	root.append(tableWrap);
}

async function renderProductTranslation(
	root: HTMLElement,
	lang: Lang,
	slug: string,
): Promise<void> {
	showEditorLoading(root);
	const [item, reference] = await Promise.all([
		loadProduct(slug, lang),
		lang === "KR" ? Promise.resolve(null) : loadProduct(slug, "KR"),
	]);
	clear(root);
	root.append(editorToolbar("products", lang, slug));
	const form = createTranslationForm("products", lang, slug);
	form.append(
		element("p", {
			className: "muted",
			text: "공유 필드(카테고리·썸네일·이미지·정렬·공개)는 변경되지 않습니다.",
		}),
	);
	if (reference) {
		const refBox = element("fieldset", { className: "refBox" });
		refBox.append(
			element("legend", { text: "KR 참고" }),
			element("p", { text: `제품명: ${reference.name}` }),
		);
		for (const model of reference.models) {
			refBox.append(
				element("p", {
					text: `모델 ${model.id}: ${model.label}${model.subtitle ? ` / 부제목 ${model.subtitle}` : ""}`,
				}),
				element("pre", { text: model.specs.join("\n") }),
			);
		}
		form.append(refBox);
	}
	const name = inputControl("name", item.name);
	name.required = true;
	form.append(field("제품명", name));
	const labelInputs: HTMLInputElement[] = [];
	item.models.forEach((model, index) => {
		const fieldset = element("fieldset");
		fieldset.append(
			element("legend", {}, [
				document.createTextNode("모델 "),
				element("code", { text: model.id }),
			]),
		);
		const label = inputControl(`modelLabel_${index}`, model.label);
		label.required = true;
		labelInputs.push(label);
		append(
			fieldset,
			field("모델명", label),
			field(
				"부제목",
				inputControl(`modelSubtitle_${index}`, model.subtitle),
			),
			field(
				"사양 (줄마다 하나)",
				textareaControl(`specs_${index}`, model.specs.join("\n")),
			),
		);
		form.append(fieldset);
	});
	const { status, saveButton } = appendTranslationActions(form);
	root.append(form);

	function syncTechnologyLabel(): void {
		const first = labelInputs[0];
		if (
			item.category.toLowerCase() === "technology" &&
			item.models.length === 1 &&
			first &&
			first.value.trim() === ""
		) {
			first.value = name.value.trim();
		}
	}
	name.addEventListener("input", syncTechnologyLabel);

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(saveButton, true, "저장 중…");
		try {
			const nameValue = formText(form, "name");
			if (!nameValue) {
				throw new Error("제품명이 필요합니다.");
			}
			const models = item.models.map((model, index) => {
				const label = resolvePrimaryModelLabel(
					item.category,
					nameValue,
					formText(form, `modelLabel_${index}`),
					item.models.length,
				);
				if (!label) {
					throw new Error(`모델 ${model.id}의 모델명이 필요합니다.`);
				}
				return {
					id: model.id,
					label,
					subtitle: formText(form, `modelSubtitle_${index}`),
					specs: textToLines(formText(form, `specs_${index}`)),
				};
			});
			await api.put<SaveResponse>(
				`/content/products/${encodeURIComponent(slug)}/i18n/${lang}`,
				{ name: nameValue, models },
			);
			setStatus(status, "저장되었습니다.");
		} catch (error) {
			setStatus(status, errorMessage(error), "error");
		} finally {
			setButtonBusy(saveButton, false);
		}
	});
}

async function renderArchiveTranslation(
	root: HTMLElement,
	lang: Lang,
	slug: string,
): Promise<void> {
	showEditorLoading(root);
	const [item, reference] = await Promise.all([
		loadArchive(slug, lang),
		lang === "KR" ? Promise.resolve(null) : loadArchive(slug, "KR"),
	]);
	clear(root);
	root.append(editorToolbar("archives", lang, slug));
	const form = createTranslationForm("archives", lang, slug);
	form.append(
		element("p", {
			className: "muted",
			text: "이미지·첨부·정렬·공개는 변경되지 않습니다.",
		}),
	);
	if (reference) {
		form.append(
			element("fieldset", { className: "refBox" }, [
				element("legend", { text: "KR 참고" }),
				element("p", { text: reference.title }),
				element("pre", { text: reference.body }),
				element("pre", { text: reference.detail.join("\n") }),
			]),
		);
	}
	const title = inputControl("title", item.title);
	title.required = true;
	append(
		form,
		field("제목", title),
		field("요약/본문", textareaControl("body", item.body)),
		field(
			"상세 내용 (줄마다 하나)",
			textareaControl("detail", item.detail.join("\n")),
		),
	);
	const { status, saveButton } = appendTranslationActions(form);
	root.append(form);
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(saveButton, true, "저장 중…");
		try {
			const titleValue = formText(form, "title");
			if (!titleValue) {
				throw new Error("제목이 필요합니다.");
			}
			await api.put<SaveResponse>(
				`/content/archives/${encodeURIComponent(slug)}/i18n/${lang}`,
				{
					title: titleValue,
					body: formText(form, "body"),
					detail: textToLines(formText(form, "detail")),
				},
			);
			setStatus(status, "저장되었습니다.");
		} catch (error) {
			setStatus(status, errorMessage(error), "error");
		} finally {
			setButtonBusy(saveButton, false);
		}
	});
}

async function renderVideoTranslation(
	root: HTMLElement,
	lang: Lang,
	slug: string,
): Promise<void> {
	showEditorLoading(root);
	const item = await loadVideo(slug);
	clear(root);
	root.append(editorToolbar("videos", lang, slug));
	const form = createTranslationForm("videos", lang, slug);
	form.append(
		element("p", {
			className: "muted",
			text: "제목·미디어 URL·공개는 공유 필드입니다. 여기서는 설명만 수정합니다.",
		}),
	);
	const title = inputControl("sharedTitle", item.title);
	title.readOnly = true;
	title.removeAttribute("name");
	form.append(field("제목 (공유, 읽기 전용)", title));
	if (lang !== "KR" && item.descriptions.KR) {
		const reference = textareaControl("descriptionReference", item.descriptions.KR);
		reference.readOnly = true;
		reference.className = "ref";
		reference.removeAttribute("name");
		form.append(field("KR 설명 (참고)", reference));
	}
	form.append(
		field(`${lang} 설명`, textareaControl("description", item.descriptions[lang])),
	);
	const { status, saveButton } = appendTranslationActions(form);
	root.append(form);
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(saveButton, true, "저장 중…");
		try {
			await api.put<SaveResponse>(
				`/content/videos/${encodeURIComponent(slug)}/i18n/${lang}`,
				{ description: formText(form, "description") },
			);
			setStatus(status, "저장되었습니다.");
		} catch (error) {
			setStatus(status, errorMessage(error), "error");
		} finally {
			setButtonBusy(saveButton, false);
		}
	});
}

function createTranslationForm(
	type: Exclude<TranslationType, "ui">,
	lang: Lang,
	slug: string,
): HTMLFormElement {
	const form = element("form", { className: "panel editorPanel" });
	form.append(
		inputControl("type", type, "hidden"),
		inputControl("lang", lang, "hidden"),
		inputControl("slug", slug, "hidden"),
	);
	return form;
}

function appendTranslationActions(form: HTMLFormElement): {
	status: HTMLParagraphElement;
	saveButton: HTMLButtonElement;
} {
	const status = element("p", { className: "formStatus notice" });
	status.hidden = true;
	const saveButton = element("button", { text: "저장" });
	saveButton.type = "submit";
	form.append(
		status,
		element("div", { className: "formActions" }, [saveButton]),
	);
	return { status, saveButton };
}

function editorToolbar(
	type: Exclude<TranslationType, "ui">,
	lang: Lang,
	slug: string,
): HTMLDivElement {
	return element("div", { className: "toolbar" }, [
		element("strong", { text: `${typeLabels[type]} 번역 · ${lang} · ${slug}` }),
		element("a", {
			text: "목록",
			attributes: { href: translationHref(type, lang) },
		}),
	]);
}

async function loadTranslationList(
	type: Exclude<TranslationType, "ui">,
	lang: Lang,
): Promise<Array<ProductRecord | ArchiveRecord | VideoRecord>> {
	if (type === "products") {
		const response = await api.get<ListResponse<ProductRecord>>(
			`/content/products?lang=${lang}`,
		);
		return response.items;
	}
	if (type === "archives") {
		const response = await api.get<ListResponse<ArchiveRecord>>(
			`/content/archives?lang=${lang}`,
		);
		return response.items;
	}
	const response = await api.get<ListResponse<VideoRecord>>("/content/videos");
	return response.items;
}

async function loadProduct(slug: string, lang: Lang): Promise<ProductRecord> {
	const response = await api.get<ItemResponse<ProductRecord>>(
		`/content/products/${encodeURIComponent(slug)}?lang=${lang}`,
	);
	return response.item;
}

async function loadArchive(slug: string, lang: Lang): Promise<ArchiveRecord> {
	const response = await api.get<ItemResponse<ArchiveRecord>>(
		`/content/archives/${encodeURIComponent(slug)}?lang=${lang}`,
	);
	return response.item;
}

async function loadVideo(slug: string): Promise<VideoRecord> {
	const response = await api.get<ItemResponse<VideoRecord>>(
		`/content/videos/${encodeURIComponent(slug)}`,
	);
	return response.item;
}

function translationHref(
	type: Exclude<TranslationType, "ui">,
	lang: Lang,
	slug = "",
): string {
	const suffix = slug ? `&edit=${encodeURIComponent(slug)}` : "";
	return `#translate?type=${type}&lang=${lang}${suffix}`;
}

function translationType(value: string | null): TranslationType | null {
	return value === "ui" ||
		value === "products" ||
		value === "archives" ||
		value === "videos"
		? value
		: null;
}

function language(value: string | null): Lang {
	const upper = value?.toUpperCase();
	return upper === "KR" || upper === "JP" || upper === "EN" ? upper : "EN";
}

function showEditorLoading(root: HTMLElement): void {
	clear(root);
	root.append(
		element("p", { className: "loadingState", text: "번역 내용을 불러오고 있습니다…" }),
	);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}
