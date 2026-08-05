import { esc } from "../html.js";
import type { RenderContext } from "../i18n.js";
import type { Catalog } from "../types.js";

function rawUrlEncode(value: string): string {
	return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
		`%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

export function renderHeader(ctx: RenderContext, catalog: Catalog): string {
	const catalogMenus = catalog.categories
		.filter((category) => category.id !== "all")
		.map((category) => {
			const itemLinks = catalog.items
				.filter((item) => item.category === category.id)
				.map((item) => {
					// Deliberately not esc(): the PHP echo applies rawurlencode() only.
					const encodedSlug = rawUrlEncode(item.slug);

					return `<li>
							<a href="view.php?item=${encodedSlug}">
								${esc(item.name)}
							</a>
						</li>`;
				})
				.join("");

			return `<li>
					<a href="DetailList.php?category=${esc(category.id)}">
						${esc(category.label)}
					</a>
					<ul>
						${itemLinks}
					</ul>
				</li>`;
		})
		.join("");

	return `<header>
	<div class="LogoWrap">
		<a href="index.php">
			<img
				class="LogoImage LogoImageWhite"
				src="${esc(ctx.assetUrl("./assets/img/WordmarkWhite.png"))}"
				alt="AGVS"
			/>
			<img
				class="LogoImage LogoImageNavy"
				src="${esc(ctx.assetUrl("./assets/img/Wordmark.png"))}"
				alt=""
				aria-hidden="true"
			/>
		</a>
	</div>
	<div class="GnbContainer">
		<div class="GnbWrap">
			<ul id="Gnb">
				<li class="About">
					<a href="Overview.php">
						${esc(ctx.aboutLabel)}
					</a>
					<ul>
						<li>
							<a href="Overview.php">Overview</a>
						</li>
						<li>
							<a href="Video.php">AGV Video</a>
						</li>
					</ul>
				</li>
				${catalogMenus}
				<li>
					<a href="Archive.php">
						${esc(ctx.t("header.archive"))}
					</a>
				</li>
			</ul>
		</div>
		<div class="HeaderActions">
			<div class="HeaderLang LangSwitch">
				<button
					type="button"
					class="HeaderLangBtn LangSwitchBtn"
					aria-expanded="false"
					aria-haspopup="listbox"
					aria-label="${esc(ctx.t("header.langAria"))}"
				>
					<span class="HeaderLangCurrent LangSwitchCurrent">
						${esc(ctx.lang)}
					</span>
					<svg
						class="HeaderLangChevron LangSwitchChevron"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							fill="currentColor"
							d="M7 10l5 5 5-5H7z"
						></path>
					</svg>
				</button>
				<ul
					class="HeaderLangMenu LangSwitchMenu"
					role="listbox"
					hidden
				>
					<li role="option">
						<button
							type="button"
							class="HeaderLangOption LangSwitchOption"
							data-lang="KR"
						>
							KR
						</button>
					</li>
					<li role="option">
						<button
							type="button"
							class="HeaderLangOption LangSwitchOption"
							data-lang="EN"
						>
							EN
						</button>
					</li>
					<li role="option">
						<button
							type="button"
							class="HeaderLangOption LangSwitchOption"
							data-lang="JP"
						>
							JP
						</button>
					</li>
				</ul>
			</div>
			<div class="ContactUsWrap">
				<div class="ContactUsBtn">
					<a href="#">Contact Us</a>
				</div>
			</div>
		</div>
		<button
			type="button"
			class="GnbToggle"
			aria-label="${esc(ctx.t("header.menuOpenAria"))}"
			aria-expanded="false"
			aria-controls="Gnb"
		>
			<span class="GnbToggleBar"></span>
			<span class="GnbToggleBar"></span>
			<span class="GnbToggleBar"></span>
			<svg
				class="GnbToggleClose"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<line
					x1="5"
					y1="5"
					x2="19"
					y2="19"
				/>
				<line
					x1="19"
					y1="5"
					x2="5"
					y2="19"
				/>
			</svg>
		</button>
	</div>
	<div
		class="GnbBackdrop"
		aria-hidden="true"
	></div>
</header>`;
}
