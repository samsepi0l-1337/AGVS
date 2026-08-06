import { h } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import type { CatalogItem } from "../types.js";
import { PageShell, renderPage } from "./shell.js";

function rawUrlEncode(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

function SitemapItem({ href, label }: { href: string; label: string }) {
	return (
		<li class="SitemapItem">
			<a class="SitemapItemLink" href={href}>
				{label}
			</a>
		</li>
	);
}

/** A column headed by plain text, for the sections that are not a catalog category. */
function TextColumn({ heading, children }: { heading: string; children?: unknown }) {
	return (
		<section class="SitemapColumn">
			<h2 class="SitemapHeading">
				<span class="SitemapHeadingText">{heading}</span>
			</h2>
			<ul class="SitemapList">{children as never}</ul>
		</section>
	);
}

/** A column headed by a link to that category's list page. */
function CategoryColumn({
	categoryId,
	label,
	items,
}: {
	categoryId: string;
	label: string;
	items: CatalogItem[];
}) {
	return (
		<section class="SitemapColumn">
			<h2 class="SitemapHeading">
				<a
					class="SitemapHeadingLink"
					href={`DetailList.php?category=${rawUrlEncode(categoryId)}`}
				>
					{label}
				</a>
			</h2>
			<ul class="SitemapList">
				{items.map((item) => (
					<SitemapItem
						href={`view.php?item=${rawUrlEncode(item.slug)}`}
						label={item.name}
					/>
				))}
			</ul>
		</section>
	);
}

export const sitemapPage: PageModule = {
	name: "Sitemap",
	render(ctx, data) {
		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title={ctx.t("sitemap.pageTitle")}
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/sitemap.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main class="SitemapMain">
					<div class="SitemapTopBg">
						<h1>{ctx.t("sitemap.heading")}</h1>
					</div>
					<div class="SitemapInner">
						<nav class="SitemapGrid" aria-label={ctx.t("sitemap.navAria")}>
							<TextColumn heading={ctx.t("sitemap.about")}>
								<SitemapItem href="Overview.php" label="Overview" />
								<SitemapItem href="Video.php" label="AGV Video" />
							</TextColumn>
							{data.catalog.categories.slice(1).map((category) => (
								<CategoryColumn
									categoryId={category.id}
									label={category.label}
									items={data.catalog.items.filter(
										(item) => item.category === category.id,
									)}
								/>
							))}
							<TextColumn heading={ctx.t("sitemap.support")}>
								<li class="SitemapItem">
									<a class="SitemapItemLink Sec03ContactBtn" href="#">
										{ctx.t("sitemap.contactUs")}
									</a>
								</li>
								<SitemapItem
									href="Archive.php"
									label={ctx.t("sitemap.archive")}
								/>
							</TextColumn>
						</nav>
					</div>
				</main>
			</PageShell>,
		);
	},
};
