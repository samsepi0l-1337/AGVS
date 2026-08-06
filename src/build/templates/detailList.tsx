import { phpJsonEncode } from "../html.js";
import { h, raw } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import type { CatalogCategory, CatalogItem } from "../types.js";
import { PageShell, renderPage } from "./shell.js";

function rawUrlEncode(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

/**
 * The original hand-written HTML comments, kept verbatim.
 *
 * JSX `{/* … *\/}` is a JavaScript comment and emits nothing, so a real HTML
 * comment has to go through raw(). These are the designer's own size and intent
 * notes and they are load-bearing documentation for whoever edits the markup.
 */
function Comment({ text }: { text: string }) {
	return raw(`<!--${text}-->`);
}

function ItemCard({
	href,
	category,
	thumbnail,
	name,
	englishName,
}: {
	href: string;
	category: string;
	thumbnail: string;
	name: string;
	englishName: string;
}) {
	return (
		<div class="ItemWrap" data-category={category}>
			<Comment text="랩크기는 자유" />
			<a href={href}>
				<div class="ItemThumb">
					<Comment text="320x230" />
					{thumbnail !== "" && <img src={thumbnail} alt={name} />}
				</div>
				<h3>{name}</h3>
				<Comment text="크기18px굵기700" />
				<p class="ItemCategory">{englishName}</p>
			</a>
		</div>
	);
}

function CategoryButton({
	category,
	isActive,
}: {
	category: CatalogCategory;
	isActive: boolean;
}) {
	return (
		<li>
			<button
				type="button"
				class={isActive ? "isOn" : undefined}
				data-category={category.id}
				aria-pressed={isActive ? "true" : "false"}
				data-title={category.title}
			>
				{category.label}
			</button>
		</li>
	);
}

function SearchBar() {
	return (
		<div class="SearchBar">
			<Comment text="form태그 써서 서치바 만들기" />
			<form class="SearchForm" role="search" onsubmit="return false;">
				<label class="SearchLabel" for="ItemSerch">
					아이템 검색
				</label>
				<input
					type="search"
					id="ItemSerch"
					class="SearchInput"
					placeholder="검색어를 입력해 주세요"
					autocomplete="off"
				/>
				<button type="submit" class="SearchBtn" aria-label="검색"></button>
			</form>
		</div>
	);
}

/**
 * Applies `?category=` before the first paint.
 *
 * It is emitted AFTER the cards on purpose: a synchronous inline script runs as
 * the parser reaches it, so the markup it rewrites already exists and the
 * browser never paints the All Item hero on the way to a filtered category.
 * Moving it into `<head>` would reintroduce that flash.
 */
function initialCategoryScript(categories: CatalogCategory[]): string {
	// Deliberately not esc(): this mirrors PHP json_encode() in JavaScript source.
	const encodedCategories = phpJsonEncode(
		categories.map((category) => ({
			id: category.id,
			title: category.title,
		})),
	);

	return `
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
`;
}

function itemThumbnail(
	ctx: Parameters<PageModule["render"]>[0],
	item: CatalogItem,
): string {
	const source = item.thumbnail || item.models[0]?.images[0]?.src || "";
	return source === "" ? "" : ctx.assetUrl(source);
}

export const detailListPage: PageModule = {
	name: "DetailList",
	render(ctx, data) {
		const initialBannerCategory = "all";
		const bannerCategory =
			initialBannerCategory.charAt(0).toUpperCase() +
			initialBannerCategory.slice(1);

		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title="AGVS-ItemList"
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/detailList.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main class="DetailListMain">
					<div class={`TopBg TopBg${bannerCategory}`}>
						<Comment text=" 백그라운드 이미지 넣어서 하기 백그라운드비지쓰면됨 " />
						<p>{data.catalog.categories[0]?.title ?? ""}</p>
						<Comment text="tittle에따라 이름변경되어야함ex)전체,AGV" />
					</div>
					<div class="DetailListInner">
						<div class="ListTitleWrap">
							<div class="ListTitle">
								<ul>
									{data.catalog.categories.map((category) => (
										<CategoryButton
											category={category}
											isActive={category.id === initialBannerCategory}
										/>
									))}
								</ul>
							</div>
							<SearchBar />
						</div>
						<div class="ListItemWrap">
							{data.catalog.items.map((item) => (
								<ItemCard
									href={`view.php?item=${rawUrlEncode(item.slug)}`}
									category={item.category}
									thumbnail={itemThumbnail(ctx, item)}
									name={item.name}
									englishName={item.models[0]?.label || item.name}
								/>
							))}
						</div>
						<script>
							{raw(initialCategoryScript(data.catalog.categories))}
						</script>
						<p class="ListEmpty" hidden>
							검색 결과가 없습니다.
						</p>
					</div>
				</main>
			</PageShell>,
		);
	},
};
