import type { RenderContext } from "../i18n.js";
import type { Child } from "../jsx/jsx-runtime.js";
import { h, raw, renderToString } from "../jsx/jsx-runtime.js";
import type { Catalog } from "../types.js";
import { renderContactPop } from "./contactPop.js";
import { renderFooter } from "./footer.js";
import { renderHeader } from "./header.js";

/**
 * The document every page repeats.
 *
 * Eight templates each carried their own `<!doctype>`, `<head>`, header call,
 * footer call and closing script tag — the same forty lines eight times, which
 * is how the Material Symbols font ended up loaded on pages that never used it.
 * Here a page supplies only what actually differs.
 *
 * `stylesheets` is an explicit list rather than something derived from the page
 * name on purpose. The rules about which page loads which sheet are real and
 * documented — DetailList must not load home.css, and therefore must not load
 * Material Symbols either, since only home.css references that icon font — so
 * the page states its own sheets and a reader can see them.
 */
export interface ShellProps {
	ctx: RenderContext;
	catalog: Catalog;
	/** Contents of `<title>`. */
	title: string;
	/** Hrefs relative to the page, in order, e.g. `./assets/css/pages/video.css`. */
	stylesheets: readonly string[];
	/** `class` on `<body>`, when the page sets one. */
	bodyClass?: string;
	/** Extra `<head>` entries, e.g. index's Material Symbols font. */
	head?: Child;
	/** Markup placed after the footer and popup, before the entry script. */
	afterFooter?: Child;
	/** The entry module, cache-busted. */
	scriptSrc: string;
	children?: Child;
}

export function PageShell({
	ctx,
	catalog,
	title,
	stylesheets,
	bodyClass,
	head,
	afterFooter,
	scriptSrc,
	children,
}: ShellProps) {
	return (
		<html lang={ctx.htmlLang}>
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
					rel="stylesheet"
				/>
				{head}
				{stylesheets.map((href) => (
					<link rel="stylesheet" href={href} />
				))}
			</head>
			<body class={bodyClass}>
				{raw(renderHeader(ctx, catalog))}
				{children}
				{raw(renderFooter(ctx))}
				{raw(renderContactPop(ctx))}
				{afterFooter}
				<script type="module" src={scriptSrc}></script>
			</body>
		</html>
	);
}

/** `<!doctype html>` is not markup, so it is prefixed rather than rendered. */
export function renderPage(node: ReturnType<typeof PageShell>): string {
	return `<!doctype html>\n${renderToString(node)}`;
}
