import type { Child } from "../jsx/jsx-runtime.js";
import { h, raw } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import { PageShell, renderPage } from "./shell.js";

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

/**
 * The arrows stay numeric character references.
 *
 * Writing the literal ← would render identically but change the built bytes,
 * and this markup was ported from PHP under a byte-identical-output constraint.
 */
const ARROW_LEFT = raw("&#8592;");
const ARROW_RIGHT = raw("&#8594;");

function Player({
	type,
	embed,
	title,
	poster,
	src,
}: {
	type: string;
	embed: string;
	title: string;
	poster: string;
	src: string;
}) {
	if (type === "youtube") {
		return (
			<div class="VideoPlayer VideoPlayerYoutube">
				<iframe
					src={embed}
					title={title}
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
				></iframe>
			</div>
		);
	}
	if (type === "local") {
		return (
			<div class="VideoPlayer VideoPlayerLocal">
				<video controls preload="metadata" poster={poster}>
					<source src={src} type="video/mp4"></source>
					브라우저가 비디오 재생을 지원하지 않습니다.
				</video>
			</div>
		);
	}
	return raw("");
}

/** Previous / next, or a placeholder that holds the space at either end. */
function NavLink({
	video,
	arrow,
	arrowFirst,
}: {
	video: Record<string, unknown> | null;
	arrow: Child;
	arrowFirst: boolean;
}) {
	if (video === null) {
		return <span class="ViewNavPlaceholder" aria-hidden="true"></span>;
	}
	const href = `VideoView.php?item=${rawUrlEncode(stringField(video, "slug"))}`;
	const label = <span class="ViewNavLabel">{stringField(video, "title")}</span>;
	const glyph = (
		<span class="ViewNavArrow" aria-hidden="true">
			{arrow}
		</span>
	);
	return (
		<a href={href} class="ViewNavLink">
			{arrowFirst ? [glyph, label] : [label, glyph]}
		</a>
	);
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
		const videoDescriptions = descriptionLines(video, ctx.lang);

		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title={`${phpString(video.title)} | AGVS`}
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/video.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main class="VideoViewMain">
					<div class="ViewTopBg">
						<p>{phpString(sectionTitle)}</p>
					</div>
					<div class="ViewInner">
						<div class="ViewTitleBar">
							<h2 class="ViewName">{phpString(video.title)}</h2>
							<p class="ViewModel">{phpString(video.mediaLabel)}</p>
						</div>
						<div class="ViewBody">
							<Player
								type={stringField(video, "type")}
								embed={stringField(video, "embed")}
								title={phpString(video.title)}
								poster={ctx.assetUrl(stringField(video, "poster"))}
								src={ctx.assetUrl(stringField(video, "video"))}
							/>
							{videoDescriptions.length > 0 && (
								<ul class="ViewSpecList">
									{videoDescriptions.map((line) => (
										<li>{line}</li>
									))}
								</ul>
							)}
						</div>
						<div class="ViewNav">
							<div class="ViewNavSide ViewNavPrev">
								<NavLink video={previousVideo} arrow={ARROW_LEFT} arrowFirst />
							</div>
							<div class="ViewNavCenter">
								<a href="Video.php" class="ViewNavList">
									목록
								</a>
							</div>
							<div class="ViewNavSide ViewNavNext">
								<NavLink
									video={nextVideo}
									arrow={ARROW_RIGHT}
									arrowFirst={false}
								/>
							</div>
						</div>
					</div>
				</main>
			</PageShell>,
		);
	},
};
