import type { PageModule } from "../pages.js";

import { esc } from "../html.js";
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

function sortOrder(record: Record<string, unknown>): number {
	const value = record.sortOrder;
	return typeof value === "number" ? value : 0;
}

export const archivePage: PageModule = {
	name: "Archive",
	render(ctx, data) {
		const archiveItems = data.archiveItems
			.filter(
				(item) =>
					!Object.prototype.hasOwnProperty.call(item, "published") ||
					item.published === true,
			)
			.sort((left, right) => sortOrder(left) - sortOrder(right));
		const items = archiveItems
			.map((archiveItem) => {
				const itemTitle = stringField(archiveItem, "title");
				const itemBody = stringField(archiveItem, "body");
				const thumbnail = stringField(archiveItem, "thumbnail");
				const itemImage = thumbnail || stringField(archiveItem, "image");
				const itemSlug = stringField(archiveItem, "slug");
				const image =
					itemImage === "" ? "" : (
						`<img src="${esc(ctx.assetUrl(itemImage))}" alt="${esc(itemTitle)}">`
					);
				// Deliberately not esc(): the PHP echo applies rawurlencode() only.
				const encodedSlug = rawUrlEncode(itemSlug);

				return `<div class="ItemWrap">
	<a class="ItemLink" href="view.php?archive=${encodedSlug}">
		<div class="ItemThumb">
			${image}
		</div>
		<h3>${esc(itemTitle)}</h3>
		<p class="ItemBody">${esc(itemBody)}</p>
	</a>
</div>`;
			})
			.join("");

		return `<!doctype html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>
			${esc(ctx.t("archive.pageTitle"))}
		</title>
		<link
			rel="preconnect"
			href="https://fonts.googleapis.com"
		/>
		<link
			rel="preconnect"
			href="https://fonts.gstatic.com"
			crossorigin
		/>
		<link
			href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
			rel="stylesheet"
		/>
		<link
			href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
			rel="stylesheet"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/base/reset.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/layout.css?ver=20260804c"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/pages/archive.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		${renderHeader(ctx, data.catalog)}
		<main class="ArchiveMain">
			<div class="TopBg">
				<p>${esc(ctx.t("archive.bannerTitle"))}</p>
			</div>
			<div class="ArchiveInner">
				<div class="ListTitleWrap">
					<div class="ListTitle">
						<h2>${esc(ctx.t("archive.listTitle"))}</h2>
					</div>
				</div>
				<div class="ListItemWrap">
					${items}
				</div>
			</div>
		</main>
		${renderFooter(ctx)}
		${renderContactPop(ctx)}
		<script
			type="module"
			src="./assets/js/main.js?ver=20260804b"
		></script>
	</body>
</html>`;
	},
};
