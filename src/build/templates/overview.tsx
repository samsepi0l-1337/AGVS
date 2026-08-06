import type { RenderContext } from "../i18n.js";
import type { Child } from "../jsx/jsx-runtime.js";
import { h, raw, renderToString } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import { renderContactPop } from "./contactPop.js";
import { renderFooter } from "./footer.js";
import { LangSwitch } from "./langSwitch.js";

/**
 * Overview renders its own document rather than using PageShell.
 *
 * It is the one page with a page-local header instead of the shared one, and
 * its second inline script runs AFTER the entry module rather than before it.
 * Adding slots to PageShell for both would make the shell worse for the seven
 * pages that fit it, to accommodate the one that does not.
 */

const ARROW_PATH = "M5 12h14M13 6l6 6-6 6";

/** The chevron used by the hero CTA and the closing Contact Us button. */
function ButtonArrow() {
	return (
		<svg class="ButtonArrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d={ARROW_PATH}
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	);
}

/** The same arrow again, at the size the business cards use. */
function BusinessArrow() {
	return (
		<span class="BusinessIcon" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none">
				<path
					d={ARROW_PATH}
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	);
}

function RouteNodeIcon({ path, width }: { path: string; width: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d={path}
				stroke="currentColor"
				stroke-width={width}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	);
}

const ROUTE_NODES: ReadonlyArray<{
	className: string;
	label: string;
	path: string;
	width: string;
}> = [
	{
		className: "NodeA",
		label: "STORAGE",
		path: "M4 6h16v14H4V6Zm3-3h10v3H7V3Zm1 7h8m-8 4h8",
		width: "1.8",
	},
	{
		className: "NodeB",
		label: "TRANSFER",
		path: "M4 8h12m0 0-3-3m3 3-3 3M20 16H8m0 0 3-3m-3 3 3 3",
		width: "1.8",
	},
	{
		className: "NodeC",
		label: "CONVEYOR",
		path: "M3 9h18v6H3V9Zm3 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
		width: "1.6",
	},
	{
		className: "NodeD",
		label: "CONTROL",
		path: "M5 4h14v16H5V4Zm3 4h8m-8 4h5m-5 4h8",
		width: "1.8",
	},
];

const ROUTE_PATH =
	"M60 90 H380 Q430 90 430 140 V290 Q430 340 380 340 H120 Q60 340 60 280 V90";

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
	{ href: "#about", label: "ABOUT" },
	{ href: "#business", label: "OUR BUSINESS" },
	{ href: "#values", label: "CORE VALUE" },
	{ href: "#profile", label: "COMPANY" },
];

/** The six business areas, in wheel order and card order alike. */
const BUSINESS_AREAS: ReadonlyArray<{
	key: string;
	sub: string | null;
	reveal: string;
}> = [
	{ key: "1", sub: "AGV", reveal: "" },
	{ key: "2", sub: "FLA", reveal: " RevealDelay1" },
	{ key: "3", sub: "AS/RS", reveal: " RevealDelay2" },
	{ key: "4", sub: "Automatic Transfer", reveal: "" },
	{ key: "5", sub: "Conveyor", reveal: " RevealDelay1" },
	{ key: "6", sub: null, reveal: " RevealDelay2" },
];

const VALUES: ReadonlyArray<{ english: string; reveal: string }> = [
	{ english: "Reliability", reveal: "" },
	{ english: "Usability", reveal: " RevealDelay1" },
	{ english: "Scalability", reveal: " RevealDelay2" },
	{ english: "Flexibility", reveal: " RevealDelay3" },
];

function OverviewHeader({ ctx }: { ctx: RenderContext }) {
	return (
		<header class="header" id="header">
			<div class="HeaderInner">
				<a class="brand" href="index.php" aria-label={ctx.t("overview.homeAria")}>
					<img src={ctx.assetUrl("./assets/img/WordmarkWhite.png")} alt="" />
				</a>
				<nav class="nav" id="main-nav" aria-label={ctx.t("overview.navAria")}>
					{NAV_LINKS.map((link) => (
						<a class="NavLink" href={link.href}>
							{link.label}
						</a>
					))}
				</nav>
				<LangSwitch
					ctx={ctx}
					prefix="Header"
					ariaLabel={ctx.t("header.langAria")}
				/>
			</div>
		</header>
	);
}

function Hero({ ctx }: { ctx: RenderContext }) {
	return (
		<section class="hero" id="top">
			<div class="container HeroInner">
				<div class="HeroCopy reveal isVisible">
					<div class="HeroKicker">
						<span class="HeroKickerDot" aria-hidden="true"></span>
						SINCE 1995 · INTEGRATED MATERIAL HANDLING
					</div>
					{/* Trusted HTML translation, so it opts out of escaping. */}
					<h1 class="HeroTitle">{raw(ctx.t("overview.hero.titleHtml"))}</h1>
					<p class="HeroDescription">{ctx.t("overview.hero.description")}</p>
					<div class="HeroActions">
						<a class="button ButtonPrimary" href="#about">
							{ctx.t("overview.hero.ctaAbout")}
							<ButtonArrow />
						</a>
						<a class="button ButtonGhost" href="#business">
							{ctx.t("overview.hero.ctaBusiness")}
						</a>
					</div>

					<div
						class="HeroMetrics"
						aria-label={ctx.t("overview.hero.metricsAria")}
					>
						<div class="HeroMetric">
							<strong class="MetricValue">1995</strong>
							<span class="MetricLabel">
								{ctx.t("overview.hero.metricFounded")}
							</span>
						</div>
						<div class="HeroMetric">
							<strong class="MetricValue">6</strong>
							<span class="MetricLabel">
								{ctx.t("overview.hero.metricAreas")}
							</span>
						</div>
						<div class="HeroMetric">
							<strong class="MetricValue">HW + SW</strong>
							<span class="MetricLabel">
								{ctx.t("overview.hero.metricCapability")}
							</span>
						</div>
					</div>
				</div>

				<div
					class="HeroVisual reveal RevealDelay2 isVisible"
					aria-label={ctx.t("overview.hero.visualAria")}
				>
					<div class="SystemBoard">
						<div class="BoardTopbar">
							<div class="BoardDots" aria-hidden="true">
								<i></i>
								<i></i>
								<i></i>
							</div>
							<div class="BoardStatus">SYSTEM ONLINE</div>
						</div>

						<div class="RouteLine" aria-hidden="true">
							<svg viewBox="0 0 500 420" preserveAspectRatio="none">
								<defs>
									<linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
										<stop offset="0" stop-color="#5ed9ff" />
										<stop offset="1" stop-color="#5bf0a5" />
									</linearGradient>
								</defs>
								<path class="RouteShadow" d={ROUTE_PATH} />
								<path class="RoutePath" d={ROUTE_PATH} />
							</svg>
						</div>

						{ROUTE_NODES.map((node) => (
							<div class={`RouteNode ${node.className}`} data-label={node.label}>
								<RouteNodeIcon path={node.path} width={node.width} />
							</div>
						))}

						<div class="AgvUnit" aria-hidden="true">
							<span class="AgvWheel AgvWheelLeft"></span>
							<span class="AgvWheel AgvWheelRight"></span>
						</div>
					</div>

					<div class="FloatingPanel" aria-hidden="true">
						<div class="PanelLabel">OPERATING STATUS</div>
						<div class="PanelValue">
							98.7% <small>ACTIVE</small>
						</div>
						<div class="PanelBars">
							<i></i>
							<i></i>
							<i></i>
							<i></i>
							<i></i>
							<i></i>
							<i></i>
						</div>
					</div>
				</div>
			</div>
			<div class="ScrollGuide" aria-hidden="true">
				SCROLL
			</div>
		</section>
	);
}

function SectionHeading({
	eyebrow,
	title,
	lead,
}: {
	eyebrow: string;
	title: Child;
	lead: string;
}) {
	return (
		<div class="SectionHeading reveal">
			<div>
				<p class="eyebrow">{eyebrow}</p>
				<h2 class="SectionTitle">{title}</h2>
			</div>
			<p class="SectionLead">{lead}</p>
		</div>
	);
}

function About({ ctx }: { ctx: RenderContext }) {
	return (
		<section class="section" id="about">
			<div class="container AboutGrid">
				<div class="AboutVisual reveal">
					<div class="AboutMainCard">
						<div class="AboutCardContent">
							<div class="AboutCardKicker">Integrated Automation Partner</div>
							<h2 class="AboutCardTitle">
								{raw(ctx.t("overview.about.cardTitleHtml"))}
							</h2>
							<p class="AboutCardCopy">{ctx.t("overview.about.cardCopy")}</p>
						</div>
					</div>
					<div class="SinceCard">
						<span class="SinceLabel">Established</span>
						<strong class="SinceYear">1995</strong>
						<span class="SinceCopy">{ctx.t("overview.about.sinceCopy")}</span>
					</div>
				</div>

				<div class="AboutCopy reveal RevealDelay1">
					<p class="eyebrow">ABOUT AGVS</p>
					<h2 class="SectionTitle">{raw(ctx.t("overview.about.titleHtml"))}</h2>
					<div class="AboutParagraphs">
						<p>{ctx.t("overview.about.p1")}</p>
						<p>{ctx.t("overview.about.p2")}</p>
					</div>

					<div class="CapabilityList">
						{["1", "2", "3"].map((n) => (
							<article class="CapabilityItem">
								<div class="CapabilityNumber">{`0${n}`}</div>
								<div>
									<h3 class="CapabilityTitle">
										{ctx.t(`overview.about.cap${n}Title`)}
									</h3>
									<p class="CapabilityCopy">
										{ctx.t(`overview.about.cap${n}Copy`)}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function Business({ ctx }: { ctx: RenderContext }) {
	return (
		<section class="section SectionSoft BusinessSection" id="business">
			<div class="container">
				<SectionHeading
					eyebrow="OUR BUSINESS"
					title={raw(ctx.t("overview.business.titleHtml"))}
					lead={ctx.t("overview.business.lead")}
				/>

				<div class="BusinessLayout">
					<div
						class="WheelWrap reveal RevealDelay1"
						aria-label={ctx.t("overview.business.wheelAria")}
					>
						<div class="BusinessWheel">
							{BUSINESS_AREAS.map((area) => (
								<div class={`WheelItem Wheel${area.key}`}>
									<span class="WheelNumber">{area.key}</span>
									<span class="WheelName">
										{area.sub === null ?
											raw(ctx.t("overview.business.wheel6Html"))
										:	ctx.t(`overview.business.wheel${area.key}`)}
									</span>
									{area.sub !== null && (
										<span class="WheelSub">{area.sub}</span>
									)}
								</div>
							))}
						</div>
						<div class="BusinessNote">
							<strong>Integrated Solution</strong>
							<span>{ctx.t("overview.business.note")}</span>
						</div>
					</div>

					<div class="BusinessList">
						{BUSINESS_AREAS.map((area) => (
							<article class={`BusinessCard reveal${area.reveal}`}>
								<div class="BusinessIndex">{`0${area.key}`}</div>
								<div>
									<h3 class="BusinessTitle">
										{ctx.t(`overview.business.b${area.key}Title`)}
										{area.sub !== null && [" ", <small>{area.sub}</small>]}
									</h3>
									<p class="BusinessDescription">
										{ctx.t(`overview.business.b${area.key}Desc`)}
									</p>
								</div>
								<BusinessArrow />
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function Values({ ctx }: { ctx: RenderContext }) {
	return (
		<section class="section" id="values">
			<div class="container">
				<SectionHeading
					eyebrow="CORE VALUE"
					title={raw(ctx.t("overview.values.titleHtml"))}
					lead={ctx.t("overview.values.lead")}
				/>

				<div class="ValuesGrid">
					{VALUES.map((value, index) => (
						<article class={`ValueCard reveal${value.reveal}`}>
							<div class="ValueIndex">{`VALUE 0${index + 1}`}</div>
							<div class="ValueEnglish">
								{value.english}
								<span class="ValueKorean">
									{ctx.t(`overview.values.v${index + 1}Label`)}
								</span>
							</div>
							<p class="ValueCopy">
								{ctx.t(`overview.values.v${index + 1}Copy`)}
							</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function ProfileRow({ label, children }: { label: string; children?: Child }) {
	return (
		<div class="ProfileRow" role="row">
			<div class="ProfileLabel" role="rowheader">
				{label}
			</div>
			<div class="ProfileValue" role="cell">
				{children}
			</div>
		</div>
	);
}

function Profile({ ctx }: { ctx: RenderContext }) {
	const addressSub = ctx.t("overview.profile.addressSub");
	return (
		<section class="section ProfileSection" id="profile">
			<div class="container">
				<SectionHeading
					eyebrow="COMPANY PROFILE"
					title={ctx.t("overview.profile.title")}
					lead={ctx.t("overview.profile.lead")}
				/>

				<div class="ProfileCard reveal RevealDelay1">
					<div class="ProfileSide">
						<div class="ProfileSideLabel">
							Automation · Logistics · Control
						</div>
						<div class="ProfileSideCopy">
							<strong>
								Moving Industry
								<br />
								Forward.
							</strong>
							<span>{ctx.t("overview.profile.sideCopy")}</span>
						</div>
					</div>

					<div
						class="ProfileTable"
						role="table"
						aria-label={ctx.t("overview.profile.tableAria")}
					>
						<ProfileRow label={ctx.t("overview.profile.nameLabel")}>
							AGVS CO., Ltd.
						</ProfileRow>
						<ProfileRow label={ctx.t("overview.profile.foundedLabel")}>
							{ctx.t("overview.profile.foundedValue")}
						</ProfileRow>
						<ProfileRow label={ctx.t("overview.profile.fieldLabel")}>
							{ctx.t("overview.profile.fieldValue")}
							<small>
								Automated Guided Vehicle System · Material Handling Equipment
							</small>
						</ProfileRow>
						<ProfileRow label={ctx.t("overview.profile.addressLabel")}>
							{ctx.t("overview.profile.addressValue")}
							{addressSub !== "" && <small>{addressSub}</small>}
						</ProfileRow>
					</div>
				</div>
			</div>
		</section>
	);
}

function Cta({ ctx }: { ctx: RenderContext }) {
	return (
		<section class="CtaSection">
			<div class="container">
				<div class="CtaCard reveal">
					<div class="CtaCopy">
						<h2 class="CtaTitle">{raw(ctx.t("overview.cta.titleHtml"))}</h2>
						<p class="CtaDescription">{ctx.t("overview.cta.description")}</p>
					</div>
					<a class="button ButtonPrimary Sec03ContactBtn" href="#">
						Contact Us
						<ButtonArrow />
					</a>
				</div>
			</div>
		</section>
	);
}

/**
 * Swaps the wordmark on scroll, tracks the active nav link, and reveals
 * sections. Runs after the entry module rather than before it.
 */
const OVERVIEW_SCRIPT = `
		const brandImg = document.querySelector(".brand img");

		window.addEventListener("scroll", () => {
			const scrollY = window.scrollY;

			if (scrollY > 50) {
				brandImg.src = "./assets/img/Wordmark.png";
			} else {
				brandImg.src = "./assets/img/WordmarkWhite.png";
			}
		});

		(() => {
			const overview = document.querySelector(".OverviewMain");
			if (!overview) {
				return;
			}

			const header = document.querySelector("body > .header");
			if (header) {
				const navLinks = [...header.querySelectorAll(".NavLink")];
				const sections = [...overview.querySelectorAll("section[id]")];
				const updateHeader = () => {
					header.classList.toggle("scrolled", window.scrollY > 24);
				};

				if ("IntersectionObserver" in window) {
					const sectionObserver = new IntersectionObserver(
						(entries) => {
							entries.forEach((entry) => {
								if (entry.isIntersecting) {
									navLinks.forEach((link) => {
										link.classList.toggle(
											"active",
											link.getAttribute("href") === \`#\${entry.target.id}\`,
										);
									});
								}
							});
						},
						{ rootMargin: "-35% 0px -55% 0px", threshold: 0 },
					);

					sections.forEach((section) => sectionObserver.observe(section));
				}

				window.addEventListener("scroll", updateHeader, { passive: true });
				updateHeader();
			}

			const reveals = overview.querySelectorAll(".reveal:not(.isVisible)");
			if (!("IntersectionObserver" in window)) {
				reveals.forEach((element) => element.classList.add("isVisible"));
				return;
			}

			const revealObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add("isVisible");
							revealObserver.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.12 },
			);

			reveals.forEach((element) => revealObserver.observe(element));
		})();
	`;

export const overviewPage: PageModule = {
	name: "Overview",
	render(ctx) {
		return `<!doctype html>\n${renderToString(
			<html lang={ctx.htmlLang}>
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<meta
						name="description"
						content={ctx.t("overview.metaDescription")}
					/>
					<title>{ctx.t("overview.pageTitle")}</title>
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
					<link rel="stylesheet" href="./assets/css/base/reset.css" />
					<link
						rel="stylesheet"
						href="./assets/css/layout/layout.css?ver=20260804c"
					/>
					<link rel="stylesheet" href="./assets/css/pages/overview.css" />
					<link rel="stylesheet" href="./assets/css/layout/pop.css" />
				</head>
				<body>
					<OverviewHeader ctx={ctx} />
					<main class="OverviewMain">
						<Hero ctx={ctx} />
						<About ctx={ctx} />
						<Business ctx={ctx} />
						<Values ctx={ctx} />
						<Profile ctx={ctx} />
						<Cta ctx={ctx} />
					</main>
					{raw(renderFooter(ctx))}
					{raw(
						"<!-- contactPop.html renders the shared popup root with id=\"ContactUsPop\". -->",
					)}
					{raw(renderContactPop(ctx))}
					<script
						type="module"
						src="./assets/js/main.js?ver=20260804b"
					></script>
					<script>{raw(OVERVIEW_SCRIPT)}</script>
				</body>
			</html>,
		)}`;
	},
};
