import type { PageModule } from "../pages.js";
import type { CatalogItem } from "../types.js";

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

function renderItem(
	ctx: Parameters<PageModule["render"]>[0],
	item: CatalogItem,
): string {
	const thumbSrc = item.thumbnail || item.models[0]?.images[0]?.src || "";
	const thumbnail =
		thumbSrc === "" ? "" : (
			`<img src="${esc(ctx.assetUrl(thumbSrc))}" alt="${esc(item.name)}">`
		);
	const englishName = item.models[0]?.label || item.name;
	// Deliberately not esc(): the PHP echo applies rawurlencode() only.
	const encodedSlug = rawUrlEncode(item.slug);

	return `<div class="ItemWrap" data-category="${esc(item.category)}"><!--랩크기는 자유-->
	<a href="view.php?item=${encodedSlug}">
		<div class="ItemThumb"><!--320x230-->
			${thumbnail}
		</div>
		<h3>
			${esc(item.name)}
		</h3><!--크기18px굵기700-->
		<p class="ItemCategory">${esc(englishName)}</p>
	</a>
</div>`;
}

export const detailListPage: PageModule = {
	name: "DetailList",
	render(ctx, data) {
		const initialBannerCategory = "all";
		const bannerCategory =
			initialBannerCategory.charAt(0).toUpperCase() +
			initialBannerCategory.slice(1);
		const categoryButtons = data.catalog.categories
			.map((category) => {
				const isInitialCategory = category.id === initialBannerCategory;
				const activeClass = isInitialCategory ? ' class="isOn"' : "";

				return `<li>
	<button type="button"${activeClass} data-category="${esc(category.id)}" aria-pressed="${
		isInitialCategory ? "true" : "false"
	}" data-title="${esc(category.title)}">${esc(category.label)}</button>
</li>`;
			})
			.join("");
		const items = data.catalog.items
			.map((item) => renderItem(ctx, item))
			.join("");
		// Deliberately not esc(): this mirrors PHP json_encode() in JavaScript source.
		const encodedCategories = phpJsonEncode(
			data.catalog.categories.map((category) => ({
				id: category.id,
				title: category.title,
			})),
		);
		const initialCategoryScript = `<script>
	(function () {
		var root = document.querySelector(".DetailListMain");
		if (!root) return;
		var categories = ${encodedCategories};
		var requested = new URLSearchParams(window.location.search).get("category");
		var category = categories.filter(function (candidate) {
			return candidate.id === requested;
		})[0] || categories.filter(function (candidate) {
			return candidate.id === "all";
		})[0];
		if (!category) return;

		var banner = root.querySelector(".TopBg");
		if (banner) {
			// Copy the live class list before pruning it to keep shifted TopBg entries from being missed.
			Array.prototype.slice.call(banner.classList).forEach(function (className) {
				if (className !== "TopBg" && className.indexOf("TopBg") === 0) {
					banner.classList.remove(className);
				}
			});
			banner.classList.add(
				"TopBg" + category.id.charAt(0).toUpperCase() + category.id.slice(1),
			);
		}

		var title = root.querySelector(".TopBg p");
		if (title) title.textContent = category.title;

		root.querySelectorAll(".ListTitle button[data-category]").forEach(function (button) {
			var on = button.getAttribute("data-category") === category.id;
			button.classList.toggle("isOn", on);
			button.setAttribute("aria-pressed", on ? "true" : "false");
		});

		root.querySelectorAll(".ListItemWrap .ItemWrap").forEach(function (item) {
			var hidden =
				category.id !== "all" &&
				item.getAttribute("data-category") !== category.id;
			item.classList.toggle("isHidden", hidden);
		});
	})();
</script>`;

		return `<!doctype html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>AGVS-ItemList</title>
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
			href="./assets/css/pages/detailList.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		${renderHeader(ctx, data.catalog)}
		<main class="DetailListMain">
			<div class="TopBg TopBg${esc(bannerCategory)}"><!-- 백그라운드 이미지 넣어서 하기 백그라운드비지쓰면됨 -->
				<p>${esc(data.catalog.categories[0]?.title ?? "")}</p><!--tittle에따라 이름변경되어야함ex)전체,AGV-->
			</div>
			<div class="DetailListInner">
				<div class="ListTitleWrap">
					<div class="ListTitle">
						<ul>
							${categoryButtons}
						</ul>
					</div>
					<div class="SearchBar"><!--form태그 써서 서치바 만들기-->
						<form
							class="SearchForm"
							role="search"
							onsubmit="return false;"
						>
							<label
								class="SearchLabel"
								for="ItemSerch"
							>아이템 검색</label>
							<input
								type="search"
								id="ItemSerch"
								class="SearchInput"
								placeholder="검색어를 입력해 주세요"
								autocomplete="off"
							/>
							<button
								type="submit"
								class="SearchBtn"
								aria-label="검색"
							></button>
						</form>
					</div>
				</div>
				<div class="ListItemWrap">
					${items}
				</div>
				${initialCategoryScript}
				<p
					class="ListEmpty"
					hidden
				>검색 결과가 없습니다.</p>
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
