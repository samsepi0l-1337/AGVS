/**
 * A string-emitting JSX runtime — the whole of it.
 *
 * There is no React here and no bundler. TypeScript compiles `.tsx` straight to
 * calls into this file (`jsx`, `jsxs`, `Fragment`), each of which returns HTML
 * as a string, so the build stays exactly what it was: `tsx src/build/render.ts`
 * writing static files.
 *
 * The reason for it is escaping. The string templates this replaces carried ~200
 * hand-written `esc()` calls, and forgetting one produced broken markup or worse
 * with nothing to catch it. Here escaping is the default and the exception is
 * explicit: `{value}` is always escaped, `{raw(html)}` is not.
 *
 * `esc()` matches PHP's `htmlspecialchars($v, ENT_QUOTES, 'UTF-8')`, including
 * the `&#039;` form of the apostrophe, because the templates were ported from
 * PHP under a byte-identical-output constraint and the built pages still carry
 * that shape.
 */

/** Markup that is already escaped, or is trusted and must pass through as-is. */
export interface Raw {
	readonly __html: string;
}

export type Child =
	| string
	| number
	| boolean
	| null
	| undefined
	| Raw
	| Child[];

/** HTML elements that must not be given a closing tag. */
const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
]);

/**
 * SVG shape and gradient primitives, which take no children.
 *
 * These are not HTML void elements — `<line></line>` parses fine — but the
 * templates have always written them self-closed, and emitting the paired form
 * changed the built output on every page. HTML5 honours XML self-closing syntax
 * inside foreign (SVG) content, so both render identically; this keeps the
 * bytes stable. Container elements such as `<defs>` and `<linearGradient>` DO
 * take children and are deliberately absent.
 */
const SELF_CLOSING_SVG_ELEMENTS = new Set([
	"circle",
	"ellipse",
	"line",
	"path",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"use",
]);

/** Mirrors PHP htmlspecialchars(ENT_QUOTES, UTF-8) — see html.ts `esc()`. */
function escape(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Opt out of escaping for markup you produced yourself.
 *
 * Every use is a place where the escaping guarantee stops, so pass only strings
 * this build generated — never catalog text, admin input, or anything from the
 * database.
 */
export function raw(html: string): Raw {
	return { __html: html };
}

function isRaw(value: unknown): value is Raw {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as Raw).__html === "string"
	);
}

/** Render children. Everything that is not `Raw` gets escaped. */
function renderChild(child: Child): string {
	if (child === null || child === undefined || child === false) return "";
	if (child === true) return "";
	if (Array.isArray(child)) return child.map(renderChild).join("");
	if (isRaw(child)) return child.__html;
	return escape(String(child));
}

/**
 * `aria-*` and `data-*` are STRING attributes, not boolean ones.
 *
 * `aria-selected="false"` is meaningful and must survive; dropping it the way a
 * real boolean attribute like `hidden` is dropped silently breaks the
 * accessibility tree. Caught while building this — a naive runtime emits
 * `aria-expanded` with no value, or omits it entirely when false.
 */
function isStringValuedAttribute(name: string): boolean {
	return name.startsWith("aria-") || name.startsWith("data-");
}

function renderAttributes(attributes: Record<string, unknown>): string {
	return Object.entries(attributes)
		.filter(([name, value]) => {
			if (value === null || value === undefined) return false;
			if (value === false) return isStringValuedAttribute(name);
			return true;
		})
		.map(([name, value]) => {
			if (value === true && !isStringValuedAttribute(name)) return ` ${name}`;
			return ` ${name}="${escape(String(value))}"`;
		})
		.join("");
}

interface Props {
	children?: Child;
	[attribute: string]: unknown;
}
type Component = (props: Props) => Raw;

/**
 * The classic factory, used via `jsxFactory: "h"` rather than the automatic
 * runtime.
 *
 * The automatic runtime needs `jsxImportSource`, and a RELATIVE one is resolved
 * against each importing file rather than against tsconfig.json, so it cannot
 * name a path that is correct from every directory — measured, not assumed:
 * `./src/build/jsx` failed from `src/build/templates/` with TS2875. A `paths`
 * mapping would fix compilation but not `tsx`'s own resolution at run time.
 *
 * The classic factory needs one ordinary import per `.tsx` file instead, which
 * resolves identically in both, and matches this repo's existing rule that
 * every relative import carries an explicit `.js` specifier.
 */
export function h(
	type: string | Component,
	props: Props | null,
	...children: Child[]
): Raw {
	const attributes = { ...(props ?? {}) };
	delete attributes.children;

	const resolvedChildren: Child =
		children.length > 0 ? children : ((props?.children ?? null) as Child);

	if (typeof type === "function") {
		return type({ ...attributes, children: resolvedChildren });
	}

	const rendered = renderAttributes(attributes);
	if (VOID_ELEMENTS.has(type) || SELF_CLOSING_SVG_ELEMENTS.has(type)) {
		return raw(`<${type}${rendered} />`);
	}
	return raw(`<${type}${rendered}>${renderChild(resolvedChildren)}</${type}>`);
}

/**
 * `<>…</>`. Takes its own narrow prop type rather than `Props`: TypeScript
 * checks the fragment factory against a plain `{ children }` object, which is
 * not assignable to an index-signature type.
 */
export function Fragment(props: { children?: Child }): Raw {
	return raw(renderChild(props.children));
}

/** The string a page module returns. */
export function renderToString(node: Raw): string {
	return node.__html;
}

type AttributeValue = string | number | boolean | null | undefined;

declare global {
	namespace JSX {
		/**
		 * Deliberately loose: any tag, any attribute name.
		 *
		 * COMPONENT props are still fully checked — a missing, unknown, or
		 * wrongly typed prop is a compile error. What this does NOT check is
		 * HTML attribute names, so `clas="Foo"` compiles. Tightening that means
		 * a per-element attribute table, which is hundreds of lines to hand-write
		 * and is the reason frameworks ship their own; borrow Preact's typings if
		 * that check ever becomes worth the dependency.
		 */
		interface IntrinsicElements {
			[tag: string]: Record<string, AttributeValue | Child>;
		}
		type Element = Raw;
		interface ElementChildrenAttribute {
			children: object;
		}
	}
}
