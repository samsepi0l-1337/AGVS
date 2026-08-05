import { api } from "./api.js";
import type { UploadKind, UploadedFile } from "./api.js";
import {
	append,
	clear,
	element,
	field,
	formFile,
	formText,
	inputControl,
	setButtonBusy,
	setStatus,
	selectControl,
	textareaControl,
} from "./dom.js";
import {
	assertUnchangedSlug,
	nextSortOrder,
	resolvePrimaryModelLabel,
	textToLines,
} from "./model.js";
import {
	languages,
	type ArchiveRecord,
	type ContentType,
	type ItemResponse,
	type Lang,
	type ListResponse,
	type Localized,
	type ProductModel,
	type ProductRecord,
	type SaveResponse,
	type VideoRecord,
} from "./types.js";

type ContentRecord = ProductRecord | VideoRecord | ArchiveRecord;

const typeLabels: Record<ContentType, string> = {
	products: "제품",
	videos: "AGV 영상",
	archives: "자료실",
};

interface CommonControls {
	form: HTMLFormElement;
	originalSlug: HTMLInputElement;
	slug: HTMLInputElement;
	published: HTMLInputElement;
	sortOrder: HTMLInputElement;
	status: HTMLParagraphElement;
	saveButton: HTMLButtonElement;
}

export async function renderContent(
	root: HTMLElement,
	type: ContentType,
	editSlug?: string,
): Promise<void> {
	clear(root);
	root.append(
		element("h1", { text: `${typeLabels[type]} 관리` }),
		element("p", {
			className: "pageLead",
			text: "등록된 항목을 수정하거나 새 콘텐츠를 만듭니다.",
		}),
	);
	const body = element("div", { className: "contentBody" });
	root.append(body);
	showLoading(body);
	try {
		if (editSlug === undefined) {
			await renderList(body, type);
			return;
		}
		await renderEditor(body, type, editSlug);
	} catch (error) {
		showLoadError(body, error);
	}
}

async function renderList(root: HTMLElement, type: ContentType): Promise<void> {
	const items = await loadList(type);
	clear(root);
	const toolbar = element("div", { className: "toolbar" });
	toolbar.append(
		element("span", {
			text: items.length ? `등록 ${items.length}건` : "등록된 항목이 없습니다.",
		}),
		element("a", {
			className: "button",
			text: "새로 등록",
			attributes: { href: `#content/${type}/new` },
		}),
	);
	root.append(toolbar);

	const tableWrap = element("div", { className: "tableWrap" });
	const table = element("table");
	const headerRow = element("tr");
	for (const label of ["제목", "Slug", "공개", "형식", ""]) {
		headerRow.append(element("th", { text: label }));
	}
	table.append(element("thead", {}, [headerRow]));
	const tbody = element("tbody");
	for (const item of items) {
		const row = element("tr");
		row.append(
			element("td", { text: itemTitle(type, item) }),
			element("td", {}, [element("code", { text: item.slug })]),
			element("td", {}, [publicationBadge(item.published)]),
			element("td", { text: itemKind(type, item) }),
			element("td", { className: "tableAction" }, [
				element("a", {
					text: "수정",
					attributes: {
						href: `#content/${type}/${encodeURIComponent(item.slug)}`,
					},
				}),
			]),
		);
		tbody.append(row);
	}
	if (items.length === 0) {
		const emptyCell = element("td", {
			className: "emptyCell",
			text: "새로 등록을 눌러 첫 콘텐츠를 만드세요.",
		});
		emptyCell.colSpan = 5;
		tbody.append(element("tr", {}, [emptyCell]));
	}
	table.append(tbody);
	tableWrap.append(table);
	root.append(tableWrap);
}

async function renderEditor(
	root: HTMLElement,
	type: ContentType,
	editSlug: string,
): Promise<void> {
	const creating = editSlug === "new";
	if (type === "products") {
		const [items, records] = await Promise.all([
			loadProductList(),
			creating ? Promise.resolve(null) : loadProductsByLang(editSlug),
		]);
		renderProductEditor(root, items, records);
		return;
	}
	if (type === "videos") {
		const [items, record] = await Promise.all([
			loadVideoList(),
			creating ? Promise.resolve(null) : loadVideo(editSlug),
		]);
		renderVideoEditor(root, items, record);
		return;
	}
	const [items, records] = await Promise.all([
		loadArchiveList(),
		creating ? Promise.resolve(null) : loadArchivesByLang(editSlug),
	]);
	renderArchiveEditor(root, items, records);
}

function renderProductEditor(
	root: HTMLElement,
	items: ProductRecord[],
	records: Localized<ProductRecord> | null,
): void {
	clear(root);
	const existing = records?.KR ?? null;
	const common = createCommonEditor("products", existing);
	const category = inputControl("category", existing?.category ?? "agv");
	category.required = true;
	const primaryModel = existing?.models[0];
	const modelId = inputControl("modelId", primaryModel?.id ?? "default");
	modelId.required = true;
	const thumbnailPath = inputControl(
		"thumbnailPath",
		existing?.thumbnail ?? "",
	);
	thumbnailPath.placeholder = "img/... 또는 storage/uploads/images/...";
	const thumbnailFile = inputControl("thumbnail", "", "file");
	thumbnailFile.accept = "image/jpeg,image/png,image/webp";

	append(
		common.form,
		field("카테고리 ID", category),
		field("모델 ID", modelId),
	);
	if (existing && (existing.thumbnail || primaryModel?.images.length)) {
		common.form.append(
			element("p", {
				className: "currentMedia",
				text: `현재 썸네일: ${existing.thumbnail || primaryModel?.images[0]?.src || "없음"} · 갤러리 ${primaryModel?.images.length ?? 0}장 — 새 파일 업로드 시에만 추가됩니다.`,
			}),
		);
	}
	append(
		common.form,
		field("썸네일 경로", thumbnailPath),
		field("썸네일 이미지", thumbnailFile),
	);

	const nameInputs = new Map<Lang, HTMLInputElement>();
	const labelInputs = new Map<Lang, HTMLInputElement>();
	for (const lang of languages) {
		const local = records?.[lang];
		const model = local?.models[0];
		const fieldset = element("fieldset");
		fieldset.append(element("legend", { text: lang }));
		const name = inputControl(`name_${lang}`, local?.name ?? "");
		name.required = true;
		const label = inputControl(`modelLabel_${lang}`, model?.label ?? "");
		label.required = true;
		const subtitle = inputControl(
			`modelSubtitle_${lang}`,
			model?.subtitle ?? "",
		);
		const specs = textareaControl(
			`specs_${lang}`,
			model?.specs.join("\n") ?? "",
		);
		append(
			fieldset,
			field("제품명", name),
			field("모델명", label),
			field("부제목", subtitle),
			field("사양 (줄마다 하나)", specs),
		);
		common.form.append(fieldset);
		nameInputs.set(lang, name);
		labelInputs.set(lang, label);
	}
	const mediaFile = inputControl("media", "", "file");
	mediaFile.accept = "image/jpeg,image/png,image/webp";
	common.form.append(field("제품 이미지 (갤러리 추가)", mediaFile));
	finishCommonEditor(root, "products", existing, common);

	function syncTechnologyLabels(): void {
		if (category.value.trim().toLowerCase() !== "technology") {
			return;
		}
		for (const lang of languages) {
			const name = nameInputs.get(lang);
			const label = labelInputs.get(lang);
			if (name && label && label.value.trim() === "") {
				label.value = name.value.trim();
			}
		}
	}
	category.addEventListener("change", syncTechnologyLabels);
	for (const input of nameInputs.values()) {
		input.addEventListener("input", syncTechnologyLabels);
	}

	common.form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(common.saveButton, true, "저장 중…");
		setStatus(common.status, "저장을 준비하고 있습니다.");
		try {
			const slug = assertUnchangedSlug(
				common.originalSlug.value,
				common.slug.value,
			);
			const categoryValue = formText(common.form, "category");
			const modelIdValue = formText(common.form, "modelId");
			const sortOrder = existing
				? readSortOrder(common.sortOrder)
				: nextSortOrder(readSortOrder(common.sortOrder), items);
			let thumbnail = formText(common.form, "thumbnailPath") ||
				(existing?.thumbnail ?? "");
			const uploadedThumbnail = await uploadIfPresent(
				formFile(common.form, "thumbnail"),
				"image",
				common.status,
				"썸네일",
			);
			if (uploadedThumbnail) {
				thumbnail = uploadedThumbnail.path;
			}
			const images = (primaryModel?.images ?? []).map((image) => ({ ...image }));
			const uploadedImage = await uploadIfPresent(
				formFile(common.form, "media"),
				"image",
				common.status,
				"제품 이미지",
			);
			if (uploadedImage) {
				images.push({ src: uploadedImage.path, text: "" });
			}
			if (!thumbnail && images[0]) {
				thumbnail = images[0].src;
			}
			const modelCount = Math.max(existing?.models.length ?? 0, 1);
			const payload = {} as Localized<ProductRecord>;
			for (const lang of languages) {
				const name = formText(common.form, `name_${lang}`);
				const label = resolvePrimaryModelLabel(
					categoryValue,
					name,
					formText(common.form, `modelLabel_${lang}`),
					modelCount,
				);
				if (!name || !label) {
					throw new Error("모든 언어의 제품명과 모델명이 필요합니다.");
				}
				const localModels = cloneModels(records?.[lang].models ?? []);
				const primary: ProductModel = {
					id: modelIdValue,
					label,
					subtitle: formText(common.form, `modelSubtitle_${lang}`),
					specs: textToLines(formText(common.form, `specs_${lang}`)),
					images: images.map((image) => ({ ...image })),
				};
				if (localModels.length === 0) {
					localModels.push(primary);
				} else {
					localModels[0] = primary;
				}
				payload[lang] = {
					slug,
					name,
					category: categoryValue,
					source: existing?.source ?? "",
					thumbnail,
					published: common.published.checked,
					sortOrder,
					models: localModels,
				};
			}
			setStatus(common.status, "콘텐츠를 저장하고 있습니다.");
			await api.put<SaveResponse<ProductRecord>>(
				`/content/products/${encodeURIComponent(slug)}`,
				payload,
			);
			window.location.hash = "#content/products";
		} catch (error) {
			setStatus(common.status, errorMessage(error), "error");
			setButtonBusy(common.saveButton, false);
		}
	});
}

function renderVideoEditor(
	root: HTMLElement,
	items: VideoRecord[],
	existing: VideoRecord | null,
): void {
	clear(root);
	const common = createCommonEditor("videos", existing);
	const title = inputControl("title", existing?.title ?? "");
	title.required = true;
	const mediaType = selectControl(
		"mediaType",
		[
			{ value: "youtube", label: "YouTube" },
			{ value: "local", label: "MP4 업로드" },
		],
		existing?.type ?? "youtube",
	);
	const embed = inputControl("embed", existing?.embed ?? "");
	embed.placeholder = "https://www.youtube.com/embed/...";
	const referenceUrl = inputControl("referenceUrl", existing?.source ?? "", "url");
	const thumbnailPath = inputControl(
		"thumbnailPath",
		existing?.thumbnail ?? "",
	);
	thumbnailPath.placeholder = "img/... 또는 storage/uploads/images/...";
	const thumbnailFile = inputControl("thumbnail", "", "file");
	thumbnailFile.accept = "image/jpeg,image/png,image/webp";
	const mediaFile = inputControl("media", "", "file");
	mediaFile.accept = "video/mp4";
	append(
		common.form,
		field("제목", title),
		field("형식", mediaType),
		field("YouTube Embed URL", embed),
		field("참조 URL", referenceUrl),
	);
	if (existing && (existing.thumbnail || existing.video)) {
		common.form.append(
			element("p", {
				className: "currentMedia",
				text: `현재 미디어: ${[existing.thumbnail, existing.video].filter(Boolean).join(" / ")}`,
			}),
		);
	}
	append(
		common.form,
		field("썸네일 경로", thumbnailPath),
		field("썸네일 이미지", thumbnailFile),
		field("MP4 파일", mediaFile),
	);
	for (const lang of languages) {
		common.form.append(
			field(
				`${lang} 설명`,
				textareaControl(
					`description_${lang}`,
					existing?.descriptions[lang] ?? "",
				),
			),
		);
	}
	finishCommonEditor(root, "videos", existing, common);

	function updateMediaVisibility(): void {
		common.form.classList.toggle("isLocalVideo", mediaType.value === "local");
	}
	mediaType.addEventListener("change", updateMediaVisibility);
	updateMediaVisibility();

	common.form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(common.saveButton, true, "저장 중…");
		setStatus(common.status, "저장을 준비하고 있습니다.");
		try {
			const slug = assertUnchangedSlug(
				common.originalSlug.value,
				common.slug.value,
			);
			const kind = mediaType.value === "local" ? "local" : "youtube";
			const titleValue = formText(common.form, "title");
			if (!titleValue) {
				throw new Error("제목이 필요합니다.");
			}
			const sortOrder = existing
				? readSortOrder(common.sortOrder)
				: nextSortOrder(readSortOrder(common.sortOrder), items);
			let thumbnail = formText(common.form, "thumbnailPath") ||
				(existing?.thumbnail ?? "");
			const uploadedThumbnail = await uploadIfPresent(
				formFile(common.form, "thumbnail"),
				"image",
				common.status,
				"썸네일",
			);
			if (uploadedThumbnail) {
				thumbnail = uploadedThumbnail.path;
			}
			let video = kind === "local" ? existing?.video ?? "" : "";
			const uploadedVideo = await uploadIfPresent(
				kind === "local" ? formFile(common.form, "media") : null,
				"video",
				common.status,
				"MP4",
			);
			if (uploadedVideo) {
				video = uploadedVideo.path;
			}
			if (kind === "local" && !video) {
				throw new Error("MP4 파일 업로드가 필요합니다.");
			}
			const embedValue = kind === "youtube" ? formText(common.form, "embed") : "";
			if (
				kind === "youtube" &&
				!embedValue.startsWith("https://www.youtube.com/embed/")
			) {
				throw new Error("YouTube Embed URL을 입력해 주세요.");
			}
			const poster = kind === "local" ? existing?.poster ?? "" : "";
			if (!thumbnail && poster) {
				thumbnail = poster;
			}
			const descriptions = {} as Localized<string>;
			for (const lang of languages) {
				descriptions[lang] = formText(common.form, `description_${lang}`);
			}
			const payload: VideoRecord = {
				slug,
				title: titleValue,
				mediaLabel: kind === "youtube" ? "YouTube" : "MP4",
				type: kind,
				thumbnail,
				source: formText(common.form, "referenceUrl"),
				descriptions,
				published: common.published.checked,
				sortOrder,
				embed: embedValue,
				poster,
				video,
			};
			setStatus(common.status, "콘텐츠를 저장하고 있습니다.");
			await api.put<SaveResponse<VideoRecord>>(
				`/content/videos/${encodeURIComponent(slug)}`,
				payload,
			);
			window.location.hash = "#content/videos";
		} catch (error) {
			setStatus(common.status, errorMessage(error), "error");
			setButtonBusy(common.saveButton, false);
		}
	});
}

function renderArchiveEditor(
	root: HTMLElement,
	items: ArchiveRecord[],
	records: Localized<ArchiveRecord> | null,
): void {
	clear(root);
	const existing = records?.KR ?? null;
	const common = createCommonEditor("archives", existing);
	for (const lang of languages) {
		const local = records?.[lang];
		const fieldset = element("fieldset");
		fieldset.append(element("legend", { text: lang }));
		const title = inputControl(`title_${lang}`, local?.title ?? "");
		title.required = true;
		append(
			fieldset,
			field("제목", title),
			field(
				"요약/본문",
				textareaControl(`summary_${lang}`, local?.body ?? ""),
			),
			field(
				"상세 내용 (줄마다 하나)",
				textareaControl(`detail_${lang}`, local?.detail.join("\n") ?? ""),
			),
		);
		common.form.append(fieldset);
	}
	if (existing && (existing.image || existing.thumbnail)) {
		common.form.append(
			element("p", {
				className: "currentMedia",
				text: `현재 이미지: ${existing.thumbnail || existing.image}`,
			}),
		);
	}
	const thumbnailPath = inputControl(
		"thumbnailPath",
		existing?.thumbnail ?? "",
	);
	thumbnailPath.placeholder = "img/... 또는 storage/uploads/images/...";
	const thumbnailFile = inputControl("thumbnail", "", "file");
	thumbnailFile.accept = "image/jpeg,image/png,image/webp";
	const mediaFile = inputControl("media", "", "file");
	mediaFile.accept = "application/pdf,.xls,.xlsx";
	append(
		common.form,
		field("썸네일 경로", thumbnailPath),
		field("썸네일 이미지", thumbnailFile),
		field("PDF 또는 Excel 첨부", mediaFile),
	);
	if (existing?.attachments.length) {
		const attachmentList = element("ul", { className: "attachmentList" });
		for (const attachment of existing.attachments) {
			attachmentList.append(
				element("li", {
					text: `${attachment.originalName} · ${attachment.mime}`,
				}),
			);
		}
		common.form.append(
			element("div", { className: "currentMedia" }, [
				element("strong", { text: "현재 첨부" }),
				attachmentList,
			]),
		);
	}
	finishCommonEditor(root, "archives", existing, common);

	common.form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setButtonBusy(common.saveButton, true, "저장 중…");
		setStatus(common.status, "저장을 준비하고 있습니다.");
		try {
			const slug = assertUnchangedSlug(
				common.originalSlug.value,
				common.slug.value,
			);
			const sortOrder = existing
				? readSortOrder(common.sortOrder)
				: nextSortOrder(readSortOrder(common.sortOrder), items);
			let thumbnail = formText(common.form, "thumbnailPath") ||
				(existing?.thumbnail ?? "");
			const uploadedThumbnail = await uploadIfPresent(
				formFile(common.form, "thumbnail"),
				"image",
				common.status,
				"썸네일",
			);
			if (uploadedThumbnail) {
				thumbnail = uploadedThumbnail.path;
			}
			const attachments = (existing?.attachments ?? []).map((item) => ({
				...item,
			}));
			const uploadedDocument = await uploadIfPresent(
				formFile(common.form, "media"),
				"document",
				common.status,
				"첨부 파일",
			);
			if (uploadedDocument) {
				attachments.push(uploadedDocument);
			}
			let image = existing?.image ?? "";
			if (!image && thumbnail) {
				image = thumbnail;
			}
			const payload = {} as Localized<ArchiveRecord>;
			for (const lang of languages) {
				const title = formText(common.form, `title_${lang}`);
				if (!title) {
					throw new Error("모든 언어의 자료실 제목이 필요합니다.");
				}
				payload[lang] = {
					slug,
					title,
					body: formText(common.form, `summary_${lang}`),
					image,
					thumbnail,
					detail: textToLines(formText(common.form, `detail_${lang}`)),
					attachments,
					published: common.published.checked,
					sortOrder,
				};
			}
			setStatus(common.status, "콘텐츠를 저장하고 있습니다.");
			await api.put<SaveResponse<ArchiveRecord>>(
				`/content/archives/${encodeURIComponent(slug)}`,
				payload,
			);
			window.location.hash = "#content/archives";
		} catch (error) {
			setStatus(common.status, errorMessage(error), "error");
			setButtonBusy(common.saveButton, false);
		}
	});
}

function createCommonEditor(
	type: ContentType,
	record: ContentRecord | null,
): CommonControls {
	const form = element("form", { className: "panel editorPanel" });
	form.enctype = "multipart/form-data";
	const action = inputControl("action", "save", "hidden");
	const originalSlug = inputControl(
		"originalSlug",
		record?.slug ?? "",
		"hidden",
	);
	const slug = inputControl("slug", record?.slug ?? "");
	slug.required = true;
	slug.readOnly = record !== null;
	slug.pattern = "[a-z0-9]+(?:-[a-z0-9]+)*";
	const published = inputControl("published", "1", "checkbox");
	published.checked = record?.published ?? true;
	const publishedLabel = element("label", { className: "checkField" }, [
		published,
		element("span", { text: "공개" }),
	]);
	const sortOrder = inputControl(
		"sortOrder",
		String(record?.sortOrder ?? 0),
		"number",
	);
	sortOrder.min = "0";
	sortOrder.step = "1";
	const status = element("p", { className: "formStatus notice" });
	status.hidden = true;
	const saveButton = element("button", { text: "저장" });
	saveButton.type = "submit";
	append(
		form,
		action,
		originalSlug,
		field(
			"Slug",
			slug,
			record ? "게시된 콘텐츠의 Slug는 변경할 수 없습니다." : "영문 소문자, 숫자, 하이픈만 사용",
		),
		publishedLabel,
		field("정렬 순서", sortOrder, record ? "현재 목록 위치를 유지합니다." : "0이면 목록 끝에 추가됩니다."),
	);
	return {
		form,
		originalSlug,
		slug,
		published,
		sortOrder,
		status,
		saveButton,
	};
}

function finishCommonEditor(
	root: HTMLElement,
	type: ContentType,
	record: ContentRecord | null,
	common: CommonControls,
): void {
	const actions = element("div", { className: "formActions" });
	actions.append(common.saveButton);
	if (record) {
		const deleteButton = element("button", {
			className: "dangerButton",
			text: "삭제",
		});
		deleteButton.type = "button";
		deleteButton.addEventListener("click", async () => {
			if (!window.confirm("삭제할까요?")) {
				return;
			}
			deleteButton.disabled = true;
			setStatus(common.status, "삭제하고 있습니다.");
			try {
				await api.delete<SaveResponse>(
					`/content/${type}/${encodeURIComponent(record.slug)}`,
				);
				window.location.hash = `#content/${type}`;
			} catch (error) {
				setStatus(common.status, errorMessage(error), "error");
				deleteButton.disabled = false;
			}
		});
		actions.append(deleteButton);
	}
	common.form.append(common.status, actions);
	root.append(
		element("div", { className: "toolbar" }, [
			element("strong", {
				text: record ? `${record.slug} 수정` : "새 콘텐츠 등록",
			}),
			element("a", {
				text: "목록",
				attributes: { href: `#content/${type}` },
			}),
		]),
		common.form,
	);
}

async function uploadIfPresent(
	file: File | null,
	kind: UploadKind,
	status: HTMLElement,
	label: string,
): Promise<UploadedFile | null> {
	if (!file) {
		return null;
	}
	setStatus(status, `${label} 파일을 업로드하고 있습니다.`);
	const response = await api.upload(file, kind);
	return response.file;
}

async function loadList(type: ContentType): Promise<ContentRecord[]> {
	if (type === "products") {
		return loadProductList();
	}
	if (type === "videos") {
		return loadVideoList();
	}
	return loadArchiveList();
}

async function loadProductList(lang: Lang = "KR"): Promise<ProductRecord[]> {
	const response = await api.get<ListResponse<ProductRecord>>(
		`/content/products?lang=${lang}`,
	);
	return response.items;
}

async function loadVideoList(): Promise<VideoRecord[]> {
	const response = await api.get<ListResponse<VideoRecord>>("/content/videos");
	return response.items;
}

async function loadArchiveList(lang: Lang = "KR"): Promise<ArchiveRecord[]> {
	const response = await api.get<ListResponse<ArchiveRecord>>(
		`/content/archives?lang=${lang}`,
	);
	return response.items;
}

async function loadProductsByLang(
	slug: string,
): Promise<Localized<ProductRecord>> {
	const entries = await Promise.all(
		languages.map(async (lang) => {
			const response = await api.get<ItemResponse<ProductRecord>>(
				`/content/products/${encodeURIComponent(slug)}?lang=${lang}`,
			);
			return [lang, response.item] as const;
		}),
	);
	return Object.fromEntries(entries) as Localized<ProductRecord>;
}

async function loadVideo(slug: string): Promise<VideoRecord> {
	const response = await api.get<ItemResponse<VideoRecord>>(
		`/content/videos/${encodeURIComponent(slug)}`,
	);
	return response.item;
}

async function loadArchivesByLang(
	slug: string,
): Promise<Localized<ArchiveRecord>> {
	const entries = await Promise.all(
		languages.map(async (lang) => {
			const response = await api.get<ItemResponse<ArchiveRecord>>(
				`/content/archives/${encodeURIComponent(slug)}?lang=${lang}`,
			);
			return [lang, response.item] as const;
		}),
	);
	return Object.fromEntries(entries) as Localized<ArchiveRecord>;
}

function cloneModels(models: readonly ProductModel[]): ProductModel[] {
	return models.map((model) => ({
		...model,
		specs: [...model.specs],
		images: model.images.map((image) => ({ ...image })),
	}));
}

function readSortOrder(input: HTMLInputElement): number {
	const parsed = Number.parseInt(input.value, 10);
	return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function itemTitle(type: ContentType, item: ContentRecord): string {
	return type === "products"
		? (item as ProductRecord).name
		: (item as VideoRecord | ArchiveRecord).title;
}

function itemKind(type: ContentType, item: ContentRecord): string {
	if (type === "products") {
		return (item as ProductRecord).category;
	}
	if (type === "videos") {
		return (item as VideoRecord).mediaLabel || (item as VideoRecord).type;
	}
	return (item as ArchiveRecord).attachments.length ? "첨부 있음" : "본문";
}

function publicationBadge(published: boolean): HTMLSpanElement {
	return element("span", {
		className: published ? "statusBadge isPublished" : "statusBadge isDraft",
		text: published ? "게시" : "비공개",
	});
}

function showLoading(root: HTMLElement): void {
	clear(root);
	root.append(
		element("p", {
			className: "loadingState",
			text: "콘텐츠를 불러오고 있습니다…",
			attributes: { role: "status" },
		}),
	);
}

function showLoadError(root: HTMLElement, error: unknown): void {
	clear(root);
	root.append(
		element("div", { className: "panel errorPanel" }, [
			element("strong", { text: "화면을 불러오지 못했습니다." }),
			element("p", { text: errorMessage(error) }),
		]),
	);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}
