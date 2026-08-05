import type { PageModule } from "../pages.js";
import type { CatalogItem, CatalogModel } from "../types.js";

import { esc, phpJsonEncode } from "../html.js";
import { renderContactPop } from "./contactPop.js";
import { renderFooter } from "./footer.js";
import { renderHeader } from "./header.js";

function rawUrlEncode(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

function stringField(record: Record<string, unknown>, key: string): string {
	const value = record[key];
	return typeof value === "string" ? value : "";
}

function arrayField(record: Record<string, unknown>, key: string): unknown[] {
	const value = record[key];
	return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null && !Array.isArray(value) ?
			(value as Record<string, unknown>)
		:	null;
}

function sortOrder(record: Record<string, unknown>): number {
	const value = record.sortOrder;
	return typeof value === "number" ? value : 0;
}

function basename(value: string): string {
	return value.slice(value.lastIndexOf("/") + 1);
}

function normalizedModels(item: CatalogItem): CatalogModel[] {
	const placeholderLabels = new Set(["기본", "Standard", "標準", ""]);
	return item.models.map((model) => {
		const rawLabel = model.label.trim();
		return {
			...model,
			label:
				placeholderLabels.has(rawLabel) && item.name !== "" ?
					item.name
				:	rawLabel,
		};
	});
}

function renderArchiveDownloads(
	attachments: Record<string, unknown>[],
	downloadLabel: string,
): string {
	const menuItems = attachments
		.map((attachment) => {
			const attachmentPath = stringField(attachment, "path");
			const originalName = attachment.originalName;
			const attachmentName =
				typeof originalName === "string" ? originalName : (
					basename(attachmentPath)
				);
			const attachmentLabel =
				attachmentName !== "" ?
					`${downloadLabel} · ${attachmentName}`
				:	downloadLabel;
			// Deliberately not esc(): the PHP echo applies rawurlencode() only.
			const encodedPath = rawUrlEncode(attachmentPath);
			// Deliberately not esc(): the PHP echo applies rawurlencode() only.
			const encodedName = rawUrlEncode(attachmentName);

			return `<li>
		<a class="ViewDownloadMenuLink" href="download.php?id=${encodedPath}&amp;name=${encodedName}">
			${esc(attachmentLabel)}
		</a>
	</li>`;
		})
		.join("");

	return `<div class="ViewArchiveDownloads">
	<details class="ViewDownloadMenu">
		<summary class="ViewDownloadMenuBtn">
			<span class="ViewDownloadMenuIcon" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</span>
			<span class="ViewDownloadMenuLabel">${esc(downloadLabel)}</span>
		</summary>
		<ul class="ViewDownloadMenuList">
			${menuItems}
		</ul>
	</details>
</div>`;
}

function renderModelSwitch(
	models: CatalogModel[],
	activeModel: CatalogModel,
): string {
	const options = models
		.map((model) => {
			const isActive = model.id === activeModel.id;
			// Deliberately not esc(): the PHP echo selects one of two fixed ARIA literals.
			const selectedValue = isActive ? "true" : "false";
			// Deliberately not esc(): the PHP echo emits a fixed active-class suffix.
			const activeClass = isActive ? " isActive" : "";
			return `<li role="option" aria-selected="${selectedValue}">
	<button type="button" class="ViewModelSwitchOption${activeClass}" data-model="${esc(model.id)}">
		${esc(model.label)}
	</button>
</li>`;
		})
		.join("");

	return `<div class="ViewModelSwitch">
	<button type="button" class="ViewModelSwitchBtn" aria-expanded="false" aria-haspopup="listbox" aria-label="Model">
		<span class="ViewModelSwitchCurrent">${esc(activeModel.label)}</span>
		<svg class="ViewModelSwitchChevron" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="currentColor" d="M7 10l5 5 5-5H7z"></path>
		</svg>
	</button>
	<ul class="ViewModelSwitchMenu" role="listbox" hidden>
		${options}
	</ul>
</div>`;
}

function renderDocument(
	ctx: Parameters<PageModule["render"]>[0],
	data: Parameters<PageModule["render"]>[1],
	pageTitle: string,
	mainContent: string,
	productScript: string,
): string {
	return `<!DOCTYPE html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${esc(pageTitle)}</title>
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
		<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap" rel="stylesheet" />
		<link rel="stylesheet" href="./assets/css/base/reset.css" />
		<link rel="stylesheet" href="./assets/css/layout/layout.css?ver=20260804c" />
		<link rel="stylesheet" href="./assets/css/pages/view.css?ver=20260805d" />
		<link rel="stylesheet" href="./assets/css/layout/pop.css" />
	</head>
	<body>
		${renderHeader(ctx, data.catalog)}
		${mainContent}
		${renderFooter(ctx)}
		${renderContactPop(ctx)}
		${productScript === "" ? "" : `${productScript}\n\t\t`}<script type="module" src="./assets/js/main.js?ver=20260804b"></script>
	</body>
</html>`;
}

function renderArchive(
	ctx: Parameters<PageModule["render"]>[0],
	data: Parameters<PageModule["render"]>[1],
	archiveItems: Record<string, unknown>[],
	archiveIndex: number,
): string {
	const archiveItem = archiveItems[archiveIndex];
	if (!archiveItem) {
		throw new Error("자료실 항목을 찾을 수 없습니다.");
	}
	const archivePrevious =
		archiveIndex > 0 ? archiveItems[archiveIndex - 1] : null;
	const archiveNext =
		archiveIndex < archiveItems.length - 1 ?
			archiveItems[archiveIndex + 1]
		:	null;
	const archiveTitle = stringField(archiveItem, "title");
	const archiveBody = stringField(archiveItem, "body");
	const archiveImage = stringField(archiveItem, "image");
	const archiveDetail = arrayField(archiveItem, "detail");
	const archiveAttachments = arrayField(archiveItem, "attachments")
		.map((attachment) => recordValue(attachment))
		.filter(
			(attachment): attachment is Record<string, unknown> =>
				attachment !== null && stringField(attachment, "path") !== "",
		);
	const translatedDownloadLabel = ctx.t("archive.download");
	const fallbackDownloadLabels = {
		KR: "다운로드",
		EN: "Download",
		JP: "ダウンロード",
	};
	const downloadLabel =
		translatedDownloadLabel !== "" ?
			translatedDownloadLabel
		:	fallbackDownloadLabels[ctx.lang];
	const downloads =
		archiveAttachments.length > 0 ?
			renderArchiveDownloads(archiveAttachments, downloadLabel)
		:	"";
	let body = "";
	if (archiveImage !== "") {
		body = `<div class="ViewImageGroup">
	<img class="ViewImage" src="${esc(ctx.assetUrl(archiveImage))}" alt="${esc(archiveTitle)}" />
	${archiveBody !== "" ? `<p class="ViewImageText">${esc(archiveBody)}</p>` : ""}
</div>`;
	} else if (archiveBody !== "") {
		body = `<p class="ViewImageText">${esc(archiveBody)}</p>`;
	}
	const detail =
		archiveDetail.length > 0 ?
			`<ul class="ViewSpecList">
	${archiveDetail.map((line) => `<li>${esc(line)}</li>`).join("")}
</ul>`
		:	"";
	let previous = `<span class="ViewNavPlaceholder" aria-hidden="true"></span>`;
	if (archivePrevious) {
		// Deliberately not esc(): the PHP echo applies rawurlencode() only.
		const encodedSlug = rawUrlEncode(stringField(archivePrevious, "slug"));
		previous = `<a href="view.php?archive=${encodedSlug}" class="ViewNavLink">
	<span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
	<span class="ViewNavLabel">${esc(stringField(archivePrevious, "title"))}</span>
</a>`;
	}
	let next = `<span class="ViewNavPlaceholder" aria-hidden="true"></span>`;
	if (archiveNext) {
		// Deliberately not esc(): the PHP echo applies rawurlencode() only.
		const encodedSlug = rawUrlEncode(stringField(archiveNext, "slug"));
		next = `<a href="view.php?archive=${encodedSlug}" class="ViewNavLink">
	<span class="ViewNavLabel">${esc(stringField(archiveNext, "title"))}</span>
	<span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
</a>`;
	}

	const mainContent = `<main class="ViewMain">
	<div class="ViewTopBg ViewTopBgArchive">
		<p>${esc(ctx.t("archive.bannerTitle"))}</p>
	</div>
	<div class="ViewInner">
		<div class="ViewTitleBar">
			<h2 class="ViewName">${esc(archiveTitle)}</h2>
			${downloads}
		</div>
		<div class="ViewBody">
			${body}
		</div>
		${detail}
		<div class="ViewNav">
			<div class="ViewNavSide ViewNavPrev">
				${previous}
			</div>
			<div class="ViewNavCenter">
				<a href="Archive.php" class="ViewNavList">${esc(ctx.t("archive.listLabel"))}</a>
			</div>
			<div class="ViewNavSide ViewNavNext">
				${next}
			</div>
		</div>
	</div>
</main>`;

	return renderDocument(ctx, data, `${archiveTitle} | AGVS`, mainContent, "");
}

function renderProduct(
	ctx: Parameters<PageModule["render"]>[0],
	data: Parameters<PageModule["render"]>[1],
	item: CatalogItem,
): string {
	const models = normalizedModels(item);
	const activeModel = models[0] ?? null;
	const activeSpecs = activeModel?.specs ?? [];
	const activeImages = activeModel?.images ?? [];
	const categoryTitle =
		data.catalog.categories.find((category) => category.id === item.category)
			?.title ?? item.category;
	const siblings = data.catalog.items.filter(
		(candidate) => candidate.category === item.category,
	);
	const siblingIndex = siblings.findIndex(
		(candidate) => candidate.slug === item.slug,
	);
	const previousItem = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
	const nextItem =
		siblingIndex >= 0 && siblingIndex < siblings.length - 1 ?
			siblings[siblingIndex + 1]
		:	null;
	const modelSwitch =
		activeModel === null ? "" : renderModelSwitch(models, activeModel);
	const specs =
		activeSpecs.length > 0 ?
			`<ul class="ViewSpecList">
	${activeSpecs.map((spec) => `<li>${esc(spec)}</li>`).join("")}
</ul>`
		:	"";
	const specsBlock = specs === "" ? "" : `\n\t\t${specs}`;
	const images =
		activeImages.length === 0 ?
			`<div class="ViewImagePlaceholder">
	<p>준비 중인 이미지입니다.</p>
</div>`
		:	activeImages
				.map(
					(image, index) => `<div class="ViewImageGroup">
	<img class="ViewImage" src="${esc(ctx.assetUrl(image.src))}" alt="${esc(`${item.name} 이미지 ${index + 1}`)}" />
	${image.text !== "" ? `<p class="ViewImageText">${esc(image.text)}</p>` : ""}
</div>`,
				)
				.join("");
	let previous = `<span class="ViewNavPlaceholder" aria-hidden="true"></span>`;
	if (previousItem) {
		// Deliberately not esc(): the PHP echo applies rawurlencode() only.
		const encodedSlug = rawUrlEncode(previousItem.slug);
		previous = `<a href="view.php?item=${encodedSlug}" class="ViewNavLink">
	<span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
	<span class="ViewNavLabel">${esc(previousItem.name)}</span>
</a>`;
	}
	let next = `<span class="ViewNavPlaceholder" aria-hidden="true"></span>`;
	if (nextItem) {
		// Deliberately not esc(): the PHP echo applies rawurlencode() only.
		const encodedSlug = rawUrlEncode(nextItem.slug);
		next = `<a href="view.php?item=${encodedSlug}" class="ViewNavLink">
	<span class="ViewNavLabel">${esc(nextItem.name)}</span>
	<span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
</a>`;
	}
	// Deliberately not esc(): the PHP echo applies rawurlencode() only.
	const encodedCategory = rawUrlEncode(item.category);
	const categoryClass =
		item.category.charAt(0).toUpperCase() + item.category.slice(1);

	const mainContent = `<main class="ViewMain">
	<div class="ViewTopBg ViewTopBg${esc(categoryClass)}">
		<p>${esc(categoryTitle)}</p>
	</div>
	<div class="ViewInner">
		<div class="ViewTitleBar">
			<h2 class="ViewName">${esc(item.name)}</h2>
			${modelSwitch}
		</div>${specsBlock}
		<div class="ViewBody">
			${images}
		</div>
		<div class="ViewNav">
			<div class="ViewNavSide ViewNavPrev">
				${previous}
			</div>
			<div class="ViewNavCenter">
				<a href="DetailList.php?category=${encodedCategory}" class="ViewNavList">목록</a>
			</div>
			<div class="ViewNavSide ViewNavNext">
				${next}
			</div>
		</div>
	</div>
</main>`;
	// Deliberately not esc(): this mirrors PHP json_encode() in JavaScript source.
	const encodedItemSlug = phpJsonEncode(item.slug);
	const productScript = `<script>
	(function () {
		var wrap = document.querySelector(".ViewModelSwitch");
		if (!wrap) return;
		var btn = wrap.querySelector(".ViewModelSwitchBtn");
		var menu = wrap.querySelector(".ViewModelSwitchMenu");
		var itemSlug = ${encodedItemSlug};
		function setOpen(open) {
			wrap.classList.toggle("isOpen", open);
			btn.setAttribute("aria-expanded", open ? "true" : "false");
			menu.hidden = !open;
		}
		btn.addEventListener("click", function (e) {
			e.stopPropagation();
			setOpen(menu.hidden);
		});
		wrap.querySelectorAll(".ViewModelSwitchOption").forEach(function (opt) {
			opt.addEventListener("click", function () {
				var model = opt.getAttribute("data-model");
				var url = new URL(window.location.href);
				url.searchParams.set("item", itemSlug);
				url.searchParams.set("model", model);
				window.location.href = url.toString();
			});
		});
		document.addEventListener("click", function () {
			setOpen(false);
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") setOpen(false);
		});
	})();
</script>`;

	return renderDocument(
		ctx,
		data,
		`${item.name} | AGVS`,
		mainContent,
		productScript,
	);
}

export const viewPage: PageModule = {
	name: "view",
	render(ctx, data, slug = "") {
		const archiveItems = data.archiveItems
			.filter(
				(item) =>
					!Object.prototype.hasOwnProperty.call(item, "published") ||
					item.published === true,
			)
			.sort((left, right) => sortOrder(left) - sortOrder(right));
		const archiveIndex = archiveItems.findIndex(
			(item) => stringField(item, "slug") === slug,
		);
		if (archiveIndex !== -1) {
			return renderArchive(ctx, data, archiveItems, archiveIndex);
		}

		const item = data.catalog.items.find(
			(candidate) => candidate.slug === slug,
		);
		if (!item) {
			throw new Error(`카탈로그 항목을 찾을 수 없습니다: ${slug}`);
		}
		return renderProduct(ctx, data, item);
	},
};
