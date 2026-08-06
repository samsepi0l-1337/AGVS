import type { RenderContext } from "../i18n.js";
import { Fragment, h, renderToString } from "../jsx/jsx-runtime.js";
import type { Catalog, CatalogCategory, CatalogItem } from "../types.js";

const LANGUAGES = ["KR", "EN", "JP"] as const;

function rawUrlEncode(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

/** The chevron shared by the language switcher. */
function ChevronDown({ class: className }: { class: string }) {
	return (
		<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
			<path fill="currentColor" d="M7 10l5 5 5-5H7z"></path>
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg class="GnbToggleClose" viewBox="0 0 24 24" aria-hidden="true">
			<line x1="5" y1="5" x2="19" y2="19" />
			<line x1="19" y1="5" x2="5" y2="19" />
		</svg>
	);
}

function Logo({ ctx }: { ctx: RenderContext }) {
	return (
		<div class="LogoWrap">
			<a href="index.php">
				<img
					class="LogoImage LogoImageWhite"
					src={ctx.assetUrl("./assets/img/WordmarkWhite.png")}
					alt="AGVS"
				/>
				<img
					class="LogoImage LogoImageNavy"
					src={ctx.assetUrl("./assets/img/Wordmark.png")}
					alt=""
					aria-hidden="true"
				/>
			</a>
		</div>
	);
}

/**
 * One top-level GNB entry with its product submenu.
 *
 * The submenu is a `<ul>` nested in the `<li>` but positioned against `#Gnb`, so
 * every submenu's first item lines up with the About label — see the GNB notes
 * in CLAUDE.md before changing the markup.
 */
function CategoryMenu({
	category,
	items,
}: {
	category: CatalogCategory;
	items: CatalogItem[];
}) {
	return (
		<li>
			<a href={`DetailList.php?category=${category.id}`}>{category.label}</a>
			<ul>
				{items.map((item) => (
					<li>
						<a href={`view.php?item=${rawUrlEncode(item.slug)}`}>{item.name}</a>
					</li>
				))}
			</ul>
		</li>
	);
}

function LanguageSwitch({ ctx }: { ctx: RenderContext }) {
	return (
		<div class="HeaderLang LangSwitch">
			<button
				type="button"
				class="HeaderLangBtn LangSwitchBtn"
				aria-expanded="false"
				aria-haspopup="listbox"
				aria-label={ctx.t("header.langAria")}
			>
				<span class="HeaderLangCurrent LangSwitchCurrent">{ctx.lang}</span>
				<ChevronDown class="HeaderLangChevron LangSwitchChevron" />
			</button>
			<ul class="HeaderLangMenu LangSwitchMenu" role="listbox" hidden>
				{LANGUAGES.map((language) => (
					<li role="option">
						<button
							type="button"
							class="HeaderLangOption LangSwitchOption"
							data-lang={language}
						>
							{language}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

/**
 * The shared site header.
 *
 * Returns a string so the templates still written as string literals can keep
 * interpolating it while they are converted.
 */
export function renderHeader(ctx: RenderContext, catalog: Catalog): string {
	const categories = catalog.categories.filter(
		(category) => category.id !== "all",
	);

	return renderToString(
		<header>
			<Logo ctx={ctx} />
			<div class="GnbContainer">
				<div class="GnbWrap">
					<ul id="Gnb">
						<li class="About">
							<a href="Overview.php">{ctx.aboutLabel}</a>
							<ul>
								<li>
									<a href="Overview.php">Overview</a>
								</li>
								<li>
									<a href="Video.php">AGV Video</a>
								</li>
							</ul>
						</li>
						{categories.map((category) => (
							<CategoryMenu
								category={category}
								items={catalog.items.filter(
									(item) => item.category === category.id,
								)}
							/>
						))}
						<li>
							<a href="Archive.php">{ctx.t("header.archive")}</a>
						</li>
					</ul>
				</div>
				<div class="HeaderActions">
					<LanguageSwitch ctx={ctx} />
					<div class="ContactUsWrap">
						<div class="ContactUsBtn">
							<a href="#">Contact Us</a>
						</div>
					</div>
				</div>
				<button
					type="button"
					class="GnbToggle"
					aria-label={ctx.t("header.menuOpenAria")}
					aria-expanded="false"
					aria-controls="Gnb"
				>
					<span class="GnbToggleBar"></span>
					<span class="GnbToggleBar"></span>
					<span class="GnbToggleBar"></span>
					<CloseIcon />
				</button>
			</div>
			<div class="GnbBackdrop" aria-hidden="true"></div>
		</header>,
	);
}
