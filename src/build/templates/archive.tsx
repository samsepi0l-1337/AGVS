import { h } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
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

function ArchiveCard({
	href,
	image,
	title,
	body,
}: {
	href: string;
	image: string;
	title: string;
	body: string;
}) {
	return (
		<div class="ItemWrap">
			<a class="ItemLink" href={href}>
				<div class="ItemThumb">
					{image !== "" && <img src={image} alt={title} />}
				</div>
				<h3>{title}</h3>
				<p class="ItemBody">{body}</p>
			</a>
		</div>
	);
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

		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title={ctx.t("archive.pageTitle")}
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/archive.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main class="ArchiveMain">
					<div class="TopBg">
						<p>{ctx.t("archive.bannerTitle")}</p>
					</div>
					<div class="ArchiveInner">
						<div class="ListTitleWrap">
							<div class="ListTitle">
								<h2>{ctx.t("archive.listTitle")}</h2>
							</div>
						</div>
						<div class="ListItemWrap">
							{archiveItems.map((item) => {
								const title = stringField(item, "title");
								const thumbnail = stringField(item, "thumbnail");
								const image = thumbnail || stringField(item, "image");
								return (
									<ArchiveCard
										href={`view.php?archive=${rawUrlEncode(stringField(item, "slug"))}`}
										image={image === "" ? "" : ctx.assetUrl(image)}
										title={title}
										body={stringField(item, "body")}
									/>
								);
							})}
						</div>
					</div>
				</main>
			</PageShell>,
		);
	},
};
