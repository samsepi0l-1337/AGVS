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

export const sitemapPage: PageModule = {
	name: "Sitemap",
	render(ctx, data) {
		const categoryColumns = data.catalog.categories
			.slice(1)
			.map((category) => {
				const itemLinks = data.catalog.items
					.filter((item) => item.category === category.id)
					.map(
						(item) => `<li class="SitemapItem">
	<a class="SitemapItemLink" href="view.php?item=${esc(rawUrlEncode(item.slug))}">
		${esc(item.name)}
	</a>
</li>`,
					)
					.join("");

				return `<section class="SitemapColumn">
	<h2 class="SitemapHeading">
		<a class="SitemapHeadingLink" href="DetailList.php?category=${esc(
			rawUrlEncode(category.id),
		)}">
			${esc(category.label)}
		</a>
	</h2>
	<ul class="SitemapList">
		${itemLinks}
	</ul>
</section>`;
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
			${esc(ctx.t("sitemap.pageTitle"))}
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
			href="./assets/css/pages/sitemap.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		${renderHeader(ctx, data.catalog)}
		<main class="SitemapMain">
			<div class="SitemapTopBg">
				<h1>
					${esc(ctx.t("sitemap.heading"))}
				</h1>
			</div>
			<div class="SitemapInner">
				<nav
					class="SitemapGrid"
					aria-label="${esc(ctx.t("sitemap.navAria"))}"
				>
					<section class="SitemapColumn">
						<h2 class="SitemapHeading">
							<span class="SitemapHeadingText">
								${esc(ctx.t("sitemap.about"))}
							</span>
						</h2>
						<ul class="SitemapList">
							<li class="SitemapItem">
								<a
									class="SitemapItemLink"
									href="Overview.php"
								>Overview</a>
							</li>
							<li class="SitemapItem">
								<a
									class="SitemapItemLink"
									href="Video.php"
								>AGV Video</a>
							</li>
						</ul>
					</section>
					${categoryColumns}
					<section class="SitemapColumn">
						<h2 class="SitemapHeading">
							<span class="SitemapHeadingText">
								${esc(ctx.t("sitemap.support"))}
							</span>
						</h2>
						<ul class="SitemapList">
							<li class="SitemapItem">
								<a
									class="SitemapItemLink Sec03ContactBtn"
									href="#"
								>
									${esc(ctx.t("sitemap.contactUs"))}
								</a>
							</li>
							<li class="SitemapItem">
								<a
									class="SitemapItemLink"
									href="Archive.php"
								>
									${esc(ctx.t("sitemap.archive"))}
								</a>
							</li>
						</ul>
					</section>
				</nav>
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
