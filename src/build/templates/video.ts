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

export const videoPage: PageModule = {
	name: "Video",
	render(ctx, data) {
		const titleValue = Reflect.get(data.videos, "title");
		const sectionTitle = typeof titleValue === "string" ? titleValue : "";
		const videos = data.videos.videos
			.filter(
				(video) =>
					!Object.prototype.hasOwnProperty.call(video, "published") ||
					video.published === true,
			)
			.sort((left, right) => sortOrder(left) - sortOrder(right));
		const items = videos
			.map((video) => {
				const slug = stringField(video, "slug");
				const title = stringField(video, "title");
				const thumbnail = stringField(video, "thumbnail");
				const mediaLabel = stringField(video, "mediaLabel");

				return `<div class="ItemWrap">
	<a href="${esc(`VideoView.php?item=${rawUrlEncode(slug)}`)}">
		<div class="ItemThumb">
			<img src="${esc(ctx.assetUrl(thumbnail))}" alt="${esc(title)}">
		</div>
		<h3>
			${esc(title)}
		</h3>
		<p class="ItemCategory">${esc(mediaLabel)}</p>
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
		<title>AGVS-Video</title>
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
			href="./assets/css/pages/video.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		${renderHeader(ctx, data.catalog)}
		<main class="VideoMain">
			<div class="TopBg">
				<p>${esc(sectionTitle)}</p>
			</div>
			<div class="VideoInner">
				<div class="ListTitleWrap">
					<div class="ListTitle">
						<h2>${esc(sectionTitle)}</h2>
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
