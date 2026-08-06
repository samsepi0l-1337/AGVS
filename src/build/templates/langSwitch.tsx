import type { RenderContext } from "../i18n.js";
import { h } from "../jsx/jsx-runtime.js";

/**
 * The KR / EN / JP switcher, shared by the header and the footer.
 *
 * The two were byte-identical apart from a class prefix and the aria-label, and
 * were maintained as two copies of the same markup. `prefix` is that one
 * difference: "Header" or "Footer" produces `HeaderLangBtn LangSwitchBtn` or
 * `FooterLangBtn LangSwitchBtn`, and the `LangSwitch*` half is what
 * `src/scripts/layout/footerLang.ts` binds to.
 */
export const LANGUAGES = ["KR", "EN", "JP"] as const;

function ChevronDown({ prefix }: { prefix: string }) {
	return (
		<svg
			class={`${prefix}LangChevron LangSwitchChevron`}
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path fill="currentColor" d="M7 10l5 5 5-5H7z"></path>
		</svg>
	);
}

export function LangSwitch({
	ctx,
	prefix,
	ariaLabel,
}: {
	ctx: RenderContext;
	prefix: "Header" | "Footer";
	ariaLabel: string;
}) {
	return (
		<div class={`${prefix}Lang LangSwitch`}>
			<button
				type="button"
				class={`${prefix}LangBtn LangSwitchBtn`}
				aria-expanded="false"
				aria-haspopup="listbox"
				aria-label={ariaLabel}
			>
				<span class={`${prefix}LangCurrent LangSwitchCurrent`}>{ctx.lang}</span>
				<ChevronDown prefix={prefix} />
			</button>
			<ul class={`${prefix}LangMenu LangSwitchMenu`} role="listbox" hidden>
				{LANGUAGES.map((language) => (
					<li role="option">
						<button
							type="button"
							class={`${prefix}LangOption LangSwitchOption`}
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
