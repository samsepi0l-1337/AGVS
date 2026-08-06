import type { RenderContext } from "../i18n.js";
import { h, renderToString } from "../jsx/jsx-runtime.js";
import { LangSwitch } from "./langSwitch.js";

/**
 * The footer social links.
 *
 * Five copies of the same eleven lines of markup, differing only in the label
 * and the path data — so they become data. Facebook, Instagram, X, LinkedIn and
 * YouTube, in that order; no App Store or Google Play badges, and the
 * scroll-to-top control sits where those would have been.
 */
const SNS_LINKS: ReadonlyArray<{ label: string; path: string }> = [
	{
		label: "Facebook",
		path: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z",
	},
	{
		label: "Instagram",
		path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
	},
	{
		label: "X",
		path: "M3.2 3h4.7l4.2 6 4.9-6H21l-6.6 8.1L21.5 21h-4.7l-4.6-6.5L7 21H2.5l6.9-8.5L3.2 3z",
	},
	{
		label: "LinkedIn",
		path: "M6.5 9.5H3.8V21h2.7V9.5zM5.15 3.5a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zM20.2 21h-2.7v-5.6c0-1.5-.55-2.5-1.85-2.5-.95 0-1.5.65-1.75 1.25-.1.25-.1.6-.1.95V21H11.1s.05-9.5 0-10.5h2.7v1.5c.35-.55 1.15-1.7 3-1.7 2.25 0 3.95 1.45 3.95 4.55V21z",
	},
	{
		label: "YouTube",
		path: "M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z",
	},
];

const CATEGORY_LINKS: ReadonlyArray<{ category: string; label: string }> = [
	{ category: "agv", label: "AGV" },
	{ category: "forklift", label: "ForkLift" },
	{ category: "technology", label: "Technology" },
];

function SnsLink({ label, path }: { label: string; path: string }) {
	return (
		<a href="#" class="FooterSnsLink" aria-label={label}>
			<svg class="FooterSnsIcon" viewBox="0 0 24 24" aria-hidden="true">
				<path fill="currentColor" d={path}></path>
			</svg>
		</a>
	);
}

/** Scroll-to-top, where the store badges would otherwise sit. */
function TopButton({ ariaLabel }: { ariaLabel: string }) {
	return (
		<button type="button" class="FooterTopBtn" aria-label={ariaLabel}>
			<svg class="FooterTopBtnIcon" viewBox="0 0 24 24" aria-hidden="true">
				<path
					fill="currentColor"
					d="M12 5l7 7-1.4 1.4L13 9.8V19h-2V9.8L6.4 13.4 5 12l7-7z"
				></path>
			</svg>
			<span class="FooterTopBtnLabel">TOP</span>
		</button>
	);
}

export function renderFooter(ctx: RenderContext): string {
	return renderToString(
		<footer id="Footer">
			<div class="FooterInner">
				<div class="FooterTop">
					<div class="FooterBrand">
						<strong class="FooterBrandName">AGVS</strong>
						<p class="FooterDesc">{ctx.t("footer.desc")}</p>
						<div class="FooterSns">
							{SNS_LINKS.map((link) => (
								<SnsLink label={link.label} path={link.path} />
							))}
						</div>
					</div>
					<nav class="FooterLinks" aria-label={ctx.t("footer.navAria")}>
						<ul class="FooterLinkCol">
							<li class="FooterLinkTitle">
								<a href="#">{ctx.t("footer.privacy")}</a>
							</li>
							<li class="FooterLinkTitle">
								<a href="Sitemap.php">{ctx.t("footer.sitemap")}</a>
							</li>
						</ul>
						<ul class="FooterLinkCol">
							{CATEGORY_LINKS.map((link) => (
								<li>
									<a href={`DetailList.php?category=${link.category}`}>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					<TopButton ariaLabel={ctx.t("footer.topAria")} />
				</div>
				<div class="FooterDivider"></div>
				<div class="FooterBottom">
					<div class="FooterLegal">
						<p class="FooterCopy">
							Copyrights(C) 2026 AGVS. All Rights Reserved.
						</p>
						<div class="FooterContact">
							<p class="FooterContactLine">
								TEL. +82-70-7734-7890 / FAX. +82-303-0951-0852 / Email:
								<a href="mailto:info@agvsk.com">info@agvsk.com</a>
							</p>
							<p class="FooterContactLine">{ctx.t("footer.address")}</p>
						</div>
					</div>
					<LangSwitch
						ctx={ctx}
						prefix="Footer"
						ariaLabel={ctx.t("footer.langAria")}
					/>
				</div>
			</div>
		</footer>,
	);
}
