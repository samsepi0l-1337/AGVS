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

function phpString(value: unknown): string {
	if (value === null || value === undefined || value === false) {
		return "";
	}
	if (value === true) {
		return "1";
	}
	if (typeof value === "object") {
		return "Array";
	}
	return String(value);
}

function stringField(record: Record<string, unknown>, key: string): string {
	const value = record[key];
	return typeof value === "string" ? value : "";
}

function sortOrder(record: Record<string, unknown>): number {
	const value = record.sortOrder;
	return typeof value === "number" ? value : 0;
}

function isPhpEmpty(value: unknown): boolean {
	return (
		value === undefined ||
		value === null ||
		value === false ||
		value === 0 ||
		value === "" ||
		value === "0" ||
		(Array.isArray(value) && value.length === 0)
	);
}

function descriptionLines(
	video: Record<string, unknown>,
	lang: Parameters<PageModule["render"]>[0]["lang"],
): string[] {
	const descriptions = video.descriptions;
	if (
		typeof descriptions !== "object" ||
		descriptions === null ||
		(!Array.isArray(descriptions) &&
			Object.getPrototypeOf(descriptions) !== Object.prototype)
	) {
		return [];
	}

	const localized = Reflect.get(descriptions, lang);
	if (localized !== undefined && localized !== null) {
		const rawDescription = phpString(localized).trim();
		if (rawDescription === "") {
			return [];
		}
		return rawDescription
			.split(/\r\n|[\n\v\f\r\u0085\u2028\u2029]/u)
			.map((line) => line.trim())
			.filter((line) => line !== "");
	}

	if (Array.isArray(descriptions)) {
		return descriptions
			.map((line) => phpString(line))
			.filter((line) => line.trim() !== "");
	}

	return [];
}

export const videoViewPage: PageModule = {
	name: "VideoView",
	render(ctx, data, slug = "") {
		const titleValue = Reflect.get(data.videos, "title");
		const sectionTitle = titleValue ?? "";
		const videos = data.videos.videos
			.filter(
				(candidate) =>
					!Object.prototype.hasOwnProperty.call(candidate, "published") ||
					candidate.published === true,
			)
			.sort((left, right) => sortOrder(left) - sortOrder(right));
		const videoIndex = videos.findIndex((candidate) => candidate.slug === slug);
		if (videoIndex === -1) {
			throw new Error(`Video not found: ${slug}`);
		}

		const video = videos[videoIndex];
		const previousVideo = videoIndex > 0 ? videos[videoIndex - 1] : null;
		const nextVideo =
			videoIndex < videos.length - 1 ? videos[videoIndex + 1] : null;
		const pageTitle = `${phpString(video.title)} | AGVS`;
		const videoType = stringField(video, "type");
		const videoDescriptions = descriptionLines(video, ctx.lang);
		const referenceUrl =
			!isPhpEmpty(video.referenceUrl) ? phpString(video.referenceUrl)
			: !isPhpEmpty(video.source) ? phpString(video.source)
			: "";

		let player = "";
		if (videoType === "youtube") {
			player = `<div class="VideoPlayer VideoPlayerYoutube">
	<iframe
		src="${esc(video.embed)}"
		title="${esc(video.title)}"
		loading="lazy"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowfullscreen
	></iframe>
</div>`;
		} else if (videoType === "local") {
			player = `<div class="VideoPlayer VideoPlayerLocal">
	<video controls preload="metadata" poster="${esc(
		ctx.assetUrl(stringField(video, "poster")),
	)}">
		<source src="${esc(
			ctx.assetUrl(stringField(video, "video")),
		)}" type="video/mp4">
		브라우저가 비디오 재생을 지원하지 않습니다.
	</video>
</div>`;
		}

		const descriptionList =
			videoDescriptions.length === 0 ?
				""
			:	`<ul class="ViewSpecList">
	${videoDescriptions.map((line) => `<li>${esc(line)}</li>`).join("")}
</ul>`;
		const reference =
			referenceUrl !== "" && /^https?:\/\//i.test(referenceUrl) ?
				`<p class="VideoReference">
	<a
		href="${esc(referenceUrl)}"
		target="_blank"
		rel="noopener noreferrer"
	>
		${esc(referenceUrl)}
	</a>
</p>`
			:	"";
		const previousNavigation =
			previousVideo === null ?
				`<span class="ViewNavPlaceholder" aria-hidden="true"></span>`
			:	`<a href="${esc(
					`VideoView.php?item=${rawUrlEncode(stringField(previousVideo, "slug"))}`,
				)}" class="ViewNavLink">
	<span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
	<span class="ViewNavLabel">${esc(previousVideo.title)}</span>
</a>`;
		const nextNavigation =
			nextVideo === null ?
				`<span class="ViewNavPlaceholder" aria-hidden="true"></span>`
			:	`<a href="${esc(
					`VideoView.php?item=${rawUrlEncode(stringField(nextVideo, "slug"))}`,
				)}" class="ViewNavLink">
	<span class="ViewNavLabel">${esc(nextVideo.title)}</span>
	<span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
</a>`;

		return `<!DOCTYPE html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>${esc(pageTitle)}</title>
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
		<main class="VideoViewMain">
			<div class="ViewTopBg">
				<p>${esc(sectionTitle)}</p>
			</div>
			<div class="ViewInner">
				<div class="ViewTitleBar">
					<h2 class="ViewName">${esc(video.title)}</h2>
					<p class="ViewModel">${esc(video.mediaLabel)}</p>
				</div>
				<div class="ViewBody">
					${player}
					${descriptionList}
					${reference}
				</div>
				<div class="ViewNav">
					<div class="ViewNavSide ViewNavPrev">
						${previousNavigation}
					</div>
					<div class="ViewNavCenter">
						<a href="Video.php" class="ViewNavList">목록</a>
					</div>
					<div class="ViewNavSide ViewNavNext">
						${nextNavigation}
					</div>
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
