import type { PageModule } from "../pages.js";
import { h } from "../jsx/jsx-runtime.js";
import { PageShell, renderPage } from "./shell.js";

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

function VideoCard({
	href,
	thumbnail,
	title,
	mediaLabel,
}: {
	href: string;
	thumbnail: string;
	title: string;
	mediaLabel: string;
}) {
	return (
		<div class="ItemWrap">
			<a href={href}>
				<div class="ItemThumb">
					<img src={thumbnail} alt={title} />
				</div>
				<h3>{title}</h3>
				<p class="ItemCategory">{mediaLabel}</p>
			</a>
		</div>
	);
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

		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title="AGVS-Video"
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/video.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main class="VideoMain">
					<div class="TopBg">
						<p>{sectionTitle}</p>
					</div>
					<div class="VideoInner">
						<div class="ListTitleWrap">
							<div class="ListTitle">
								<h2>{sectionTitle}</h2>
							</div>
						</div>
						<div class="ListItemWrap">
							{videos.map((video) => (
								<VideoCard
									href={`VideoView.php?item=${rawUrlEncode(stringField(video, "slug"))}`}
									thumbnail={ctx.assetUrl(stringField(video, "thumbnail"))}
									title={stringField(video, "title")}
									mediaLabel={stringField(video, "mediaLabel")}
								/>
							))}
						</div>
					</div>
				</main>
			</PageShell>,
		);
	},
};
