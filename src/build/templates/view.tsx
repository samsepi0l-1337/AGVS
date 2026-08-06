import { phpString } from "../html.js";
import type { Child } from "../jsx/jsx-runtime.js";
import { h, raw } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import type { CatalogItem, CatalogModel } from "../types.js";
import { PageShell, renderPage } from "./shell.js";

type Ctx = Parameters<PageModule["render"]>[0];
type Data = Parameters<PageModule["render"]>[1];

const VIEW_STYLESHEETS = [
	"./assets/css/base/reset.css",
	"./assets/css/layout/layout.css?ver=20260804c",
	"./assets/css/pages/view.css?ver=20260805d",
	"./assets/css/layout/pop.css",
] as const;

const SCRIPT_SRC = "./assets/js/main.js?ver=20260804b";

/** Kept as numeric character references — see videoView.tsx. */
const ARROW_LEFT = raw("&#8592;");
const ARROW_RIGHT = raw("&#8594;");

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

function arrayField(record: Record<string, unknown>, key: string): unknown[] {
	const value = record[key];
	return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null && !Array.isArray(value) ?
			(value as Record<string, unknown>)
		:	null;
}

function sortOrder(record: Record<string, unknown>): number {
	const value = record.sortOrder;
	return typeof value === "number" ? value : 0;
}

function basename(value: string): string {
	return value.slice(value.lastIndexOf("/") + 1);
}

function normalizedModels(item: CatalogItem): CatalogModel[] {
	const placeholderLabels = new Set(["기본", "Standard", "標準", ""]);
	return item.models.map((model) => {
		const rawLabel = model.label.trim();
		return {
			...model,
			label:
				placeholderLabels.has(rawLabel) && item.name !== "" ?
					item.name
				:	rawLabel,
		};
	});
}

/**
 * Model ids that need a page of their own.
 *
 * An item's FIRST model is what its own `view-<slug>.html` page shows, so only
 * the models after it need one. Exported because `render.ts` enumerates the
 * pages to write and must agree with `modelHref()` below on the basenames.
 */
export function extraModelPageSlugs(item: CatalogItem): string[] {
	return item.models.slice(1).map((model) => model.id);
}

/**
 * Where a model's page lives.
 *
 * This used to be `?model=<id>` on the item's own page, which the PHP renderer
 * resolved server-side. The static build renders one file per item, so that
 * query string reloaded the identical page: the URL changed and nothing else
 * did. Each non-first model now has a pre-rendered page instead, so switching
 * models is a plain navigation — no JS, and no flash of the wrong model.
 *
 * `rewritePhpLinks()` in render.ts turns both forms into the matching
 * `view-<slug>.html`, which is why this emits the same `view.php?item=` shape
 * every other internal link uses.
 */
function modelHref(
	itemSlug: string,
	models: CatalogModel[],
	model: CatalogModel,
): string {
	const target = models[0]?.id === model.id ? itemSlug : model.id;
	return `view.php?item=${rawUrlEncode(target)}`;
}

function ModelSwitch({
	models,
	activeModel,
	itemSlug,
}: {
	models: CatalogModel[];
	activeModel: CatalogModel;
	itemSlug: string;
}) {
	return (
		<div class="ViewModelSwitch">
			<button
				type="button"
				class="ViewModelSwitchBtn"
				aria-expanded="false"
				aria-haspopup="listbox"
				aria-label="Model"
			>
				<span class="ViewModelSwitchCurrent">{activeModel.label}</span>
				<svg class="ViewModelSwitchChevron" viewBox="0 0 24 24" aria-hidden="true">
					<path fill="currentColor" d="M7 10l5 5 5-5H7z"></path>
				</svg>
			</button>
			<ul class="ViewModelSwitchMenu" role="listbox" hidden>
				{models.map((model) => {
					const isActive = model.id === activeModel.id;
					return (
						<li role="option" aria-selected={isActive ? "true" : "false"}>
							<a
								href={modelHref(itemSlug, models, model)}
								class={`ViewModelSwitchOption${isActive ? " isActive" : ""}`}
							>
								{model.label}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

/**
 * Archive attachments always use the compact menu.
 *
 * There used to be a flat list below three files and a `<details>` menu at or
 * above it; the threshold is gone, so a single attachment gets the menu too.
 */
function ArchiveDownloads({
	attachments,
	downloadLabel,
}: {
	attachments: Record<string, unknown>[];
	downloadLabel: string;
}) {
	return (
		<div class="ViewArchiveDownloads">
			<details class="ViewDownloadMenu">
				<summary class="ViewDownloadMenuBtn">
					<span class="ViewDownloadMenuIcon" aria-hidden="true">
						<span></span>
						<span></span>
						<span></span>
					</span>
					<span class="ViewDownloadMenuLabel">{downloadLabel}</span>
				</summary>
				<ul class="ViewDownloadMenuList">
					{attachments.map((attachment) => {
						const path = stringField(attachment, "path");
						const originalName = attachment.originalName;
						const name =
							typeof originalName === "string" ? originalName : basename(path);
						const label =
							name !== "" ? `${downloadLabel} · ${name}` : downloadLabel;
						return (
							<li>
								<a
									class="ViewDownloadMenuLink"
									href={`download.php?id=${rawUrlEncode(path)}&name=${rawUrlEncode(name)}`}
								>
									{label}
								</a>
							</li>
						);
					})}
				</ul>
			</details>
		</div>
	);
}

/** Previous / next, or a placeholder holding the space at either end. */
function NavLink({
	href,
	label,
	arrow,
	arrowFirst,
}: {
	href: string | null;
	label: string;
	arrow: Child;
	arrowFirst: boolean;
}) {
	if (href === null) {
		return <span class="ViewNavPlaceholder" aria-hidden="true"></span>;
	}
	const text = <span class="ViewNavLabel">{label}</span>;
	const glyph = (
		<span class="ViewNavArrow" aria-hidden="true">
			{arrow}
		</span>
	);
	return (
		<a href={href} class="ViewNavLink">
			{arrowFirst ? [glyph, text] : [text, glyph]}
		</a>
	);
}

function ViewNav({
	previous,
	next,
	listHref,
	listLabel,
}: {
	previous: Child;
	next: Child;
	listHref: string;
	listLabel: string;
}) {
	return (
		<div class="ViewNav">
			<div class="ViewNavSide ViewNavPrev">{previous}</div>
			<div class="ViewNavCenter">
				<a href={listHref} class="ViewNavList">
					{listLabel}
				</a>
			</div>
			<div class="ViewNavSide ViewNavNext">{next}</div>
		</div>
	);
}

function renderArchive(
	ctx: Ctx,
	data: Data,
	archiveItems: Record<string, unknown>[],
	archiveIndex: number,
): string {
	const archiveItem = archiveItems[archiveIndex];
	if (!archiveItem) {
		throw new Error("자료실 항목을 찾을 수 없습니다.");
	}
	const previousItem = archiveIndex > 0 ? archiveItems[archiveIndex - 1] : null;
	const nextItem =
		archiveIndex < archiveItems.length - 1 ?
			archiveItems[archiveIndex + 1]
		:	null;
	const title = stringField(archiveItem, "title");
	const body = stringField(archiveItem, "body");
	const image = stringField(archiveItem, "image");
	const detail = arrayField(archiveItem, "detail");
	const attachments = arrayField(archiveItem, "attachments")
		.map((attachment) => recordValue(attachment))
		.filter(
			(attachment): attachment is Record<string, unknown> =>
				attachment !== null && stringField(attachment, "path") !== "",
		);
	const translatedDownloadLabel = ctx.t("archive.download");
	const fallbackDownloadLabels = {
		KR: "다운로드",
		EN: "Download",
		JP: "ダウンロード",
	};
	const downloadLabel =
		translatedDownloadLabel !== "" ?
			translatedDownloadLabel
		:	fallbackDownloadLabels[ctx.lang];

	return renderPage(
		<PageShell
			ctx={ctx}
			catalog={data.catalog}
			title={`${title} | AGVS`}
			stylesheets={VIEW_STYLESHEETS}
			scriptSrc={SCRIPT_SRC}
		>
			<main class="ViewMain">
				<div class="ViewTopBg ViewTopBgArchive">
					<p>{ctx.t("archive.bannerTitle")}</p>
				</div>
				<div class="ViewInner">
					<div class="ViewTitleBar">
						<h2 class="ViewName">{title}</h2>
						{attachments.length > 0 && (
							<ArchiveDownloads
								attachments={attachments}
								downloadLabel={downloadLabel}
							/>
						)}
					</div>
					<div class="ViewBody">
						{image !== "" ?
							<div class="ViewImageGroup">
								<img class="ViewImage" src={ctx.assetUrl(image)} alt={title} />
								{body !== "" && <p class="ViewImageText">{body}</p>}
							</div>
						: body !== "" ?
							<p class="ViewImageText">{body}</p>
						:	null}
					</div>
					{detail.length > 0 && (
						<ul class="ViewSpecList">
							{detail.map((line) => (
								<li>{phpString(line)}</li>
							))}
						</ul>
					)}
					<ViewNav
						previous={
							<NavLink
								href={
									previousItem === null ? null : (
										`view.php?archive=${rawUrlEncode(stringField(previousItem, "slug"))}`
									)
								}
								label={
									previousItem === null ? "" : stringField(previousItem, "title")
								}
								arrow={ARROW_LEFT}
								arrowFirst
							/>
						}
						next={
							<NavLink
								href={
									nextItem === null ? null : (
										`view.php?archive=${rawUrlEncode(stringField(nextItem, "slug"))}`
									)
								}
								label={nextItem === null ? "" : stringField(nextItem, "title")}
								arrow={ARROW_RIGHT}
								arrowFirst={false}
							/>
						}
						listHref="Archive.php"
						listLabel={ctx.t("archive.listLabel")}
					/>
				</div>
			</main>
		</PageShell>,
	);
}

/**
 * Opens and closes the model menu.
 *
 * It no longer rewrites the URL: the options are ordinary links, and the old
 * version set `?model=` and reloaded, which on a static site fetched the same
 * file back and left the page unchanged.
 */
const PRODUCT_SCRIPT = `
	(function () {
		var wrap = document.querySelector(".ViewModelSwitch");
		if (!wrap) return;
		var btn = wrap.querySelector(".ViewModelSwitchBtn");
		var menu = wrap.querySelector(".ViewModelSwitchMenu");
		function setOpen(open) {
			wrap.classList.toggle("isOpen", open);
			btn.setAttribute("aria-expanded", open ? "true" : "false");
			menu.hidden = !open;
		}
		btn.addEventListener("click", function (e) {
			e.stopPropagation();
			setOpen(menu.hidden);
		});
		document.addEventListener("click", function () {
			setOpen(false);
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") setOpen(false);
		});
	})();
`;

function renderProduct(
	ctx: Ctx,
	data: Data,
	item: CatalogItem,
	activeModel: CatalogModel | null,
): string {
	const models = normalizedModels(item);
	const specs = activeModel?.specs ?? [];
	const images = activeModel?.images ?? [];
	const categoryTitle =
		data.catalog.categories.find((category) => category.id === item.category)
			?.title ?? item.category;
	const siblings = data.catalog.items.filter(
		(candidate) => candidate.category === item.category,
	);
	const siblingIndex = siblings.findIndex(
		(candidate) => candidate.slug === item.slug,
	);
	const previousItem = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
	const nextItem =
		siblingIndex >= 0 && siblingIndex < siblings.length - 1 ?
			siblings[siblingIndex + 1]
		:	null;
	const categoryClass =
		item.category.charAt(0).toUpperCase() + item.category.slice(1);

	return renderPage(
		<PageShell
			ctx={ctx}
			catalog={data.catalog}
			title={`${item.name} | AGVS`}
			stylesheets={VIEW_STYLESHEETS}
			scriptSrc={SCRIPT_SRC}
			afterFooter={<script>{raw(PRODUCT_SCRIPT)}</script>}
		>
			<main class="ViewMain">
				<div class={`ViewTopBg ViewTopBg${categoryClass}`}>
					<p>{categoryTitle}</p>
				</div>
				<div class="ViewInner">
					<div class="ViewTitleBar">
						<h2 class="ViewName">{item.name}</h2>
						{activeModel !== null && (
							<ModelSwitch
								models={models}
								activeModel={activeModel}
								itemSlug={item.slug}
							/>
						)}
					</div>
					{specs.length > 0 && (
						<ul class="ViewSpecList">
							{specs.map((spec) => (
								<li>{phpString(spec)}</li>
							))}
						</ul>
					)}
					<div class="ViewBody">
						{images.length === 0 ?
							<div class="ViewImagePlaceholder">
								<p>준비 중인 이미지입니다.</p>
							</div>
						:	images.map((image, index) => (
								<div class="ViewImageGroup">
									<img
										class="ViewImage"
										src={ctx.assetUrl(image.src)}
										alt={`${item.name} 이미지 ${index + 1}`}
									/>
									{image.text !== "" && (
										<p class="ViewImageText">{image.text}</p>
									)}
								</div>
							))
						}
					</div>
					<ViewNav
						previous={
							<NavLink
								href={
									previousItem === null ? null : (
										`view.php?item=${rawUrlEncode(previousItem.slug)}`
									)
								}
								label={previousItem === null ? "" : previousItem.name}
								arrow={ARROW_LEFT}
								arrowFirst
							/>
						}
						next={
							<NavLink
								href={
									nextItem === null ? null : (
										`view.php?item=${rawUrlEncode(nextItem.slug)}`
									)
								}
								label={nextItem === null ? "" : nextItem.name}
								arrow={ARROW_RIGHT}
								arrowFirst={false}
							/>
						}
						listHref={`DetailList.php?category=${rawUrlEncode(item.category)}`}
						listLabel="목록"
					/>
				</div>
			</main>
		</PageShell>,
	);
}

export const viewPage: PageModule = {
	name: "view",
	render(ctx, data, slug = "") {
		const archiveItems = data.archiveItems
			.filter(
				(item) =>
					!Object.prototype.hasOwnProperty.call(item, "published") ||
					item.published === true,
			)
			.sort((left, right) => sortOrder(left) - sortOrder(right));
		const archiveIndex = archiveItems.findIndex(
			(item) => stringField(item, "slug") === slug,
		);
		if (archiveIndex !== -1) {
			return renderArchive(ctx, data, archiveItems, archiveIndex);
		}

		const item = data.catalog.items.find(
			(candidate) => candidate.slug === slug,
		);
		if (item) {
			const models = normalizedModels(item);
			return renderProduct(ctx, data, item, models[0] ?? null);
		}

		// Not an item slug — a non-first model addressed by its own id. Only
		// models after the first are looked up here, because the first one is
		// already reachable as the item's own page and would otherwise render
		// the same content under two basenames.
		for (const candidate of data.catalog.items) {
			const models = normalizedModels(candidate);
			const activeModel =
				models.find((model, index) => index > 0 && model.id === slug) ?? null;
			if (activeModel !== null) {
				return renderProduct(ctx, data, candidate, activeModel);
			}
		}

		throw new Error(`카탈로그 항목을 찾을 수 없습니다: ${slug}`);
	},
};
