import type { PageModule } from "../pages.js";

import { esc } from "../html.js";
import { renderContactPop } from "./contactPop.js";
import { renderFooter } from "./footer.js";

export const overviewPage: PageModule = {
	name: "Overview",
	render(ctx) {
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const heroTitleHtml = ctx.t("overview.hero.titleHtml");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const aboutCardTitleHtml = ctx.t("overview.about.cardTitleHtml");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const aboutTitleHtml = ctx.t("overview.about.titleHtml");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const businessTitleHtml = ctx.t("overview.business.titleHtml");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const wheel6Html = ctx.t("overview.business.wheel6Html");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const valuesTitleHtml = ctx.t("overview.values.titleHtml");
		// Deliberately not esc(): the PHP page emits this trusted HTML translation directly.
		const ctaTitleHtml = ctx.t("overview.cta.titleHtml");
		const addressSub = ctx.t("overview.profile.addressSub");

		return `<!DOCTYPE html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<meta
			name="description"
			content="${esc(ctx.t("overview.metaDescription"))}"
		/>
		<title>${esc(ctx.t("overview.pageTitle"))}</title>
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
			href="./assets/css/pages/overview.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		<header class="header" id="header">
			<div class="HeaderInner">
				<a
					class="brand"
					href="index.php"
					aria-label="${esc(ctx.t("overview.homeAria"))}"
				>
					<img
						src="${esc(ctx.assetUrl("./assets/img/WordmarkWhite.png"))}"
						alt=""
					/>
				</a>
				<nav
					class="nav"
					id="main-nav"
					aria-label="${esc(ctx.t("overview.navAria"))}"
				>
					<a
						class="NavLink"
						href="#about"
					>ABOUT</a>
					<a
						class="NavLink"
						href="#business"
					>OUR BUSINESS</a>
					<a
						class="NavLink"
						href="#values"
					>CORE VALUE</a>
					<a
						class="NavLink"
						href="#profile"
					>COMPANY</a>
				</nav>
				<div class="HeaderLang LangSwitch">
					<button
						type="button"
						class="HeaderLangBtn LangSwitchBtn"
						aria-expanded="false"
						aria-haspopup="listbox"
						aria-label="${esc(ctx.t("header.langAria"))}"
					>
						<span class="HeaderLangCurrent LangSwitchCurrent">${esc(ctx.lang)}</span>
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
			</div>
		</header>
		<main class="OverviewMain">
			<section
				class="hero"
				id="top"
			>
				<div class="container HeroInner">
					<div class="HeroCopy reveal isVisible">
						<div class="HeroKicker">
							<span
								class="HeroKickerDot"
								aria-hidden="true"
							></span>
							SINCE 1995 · INTEGRATED MATERIAL HANDLING
						</div>
						<h1 class="HeroTitle">
							${heroTitleHtml}
						</h1>
						<p class="HeroDescription">
							${esc(ctx.t("overview.hero.description"))}
						</p>
						<div class="HeroActions">
							<a
								class="button ButtonPrimary"
								href="#about"
							>
								${esc(ctx.t("overview.hero.ctaAbout"))}
								<svg
									class="ButtonArrow"
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M5 12h14M13 6l6 6-6 6"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</a>
							<a
								class="button ButtonGhost"
								href="#business"
							>${esc(ctx.t("overview.hero.ctaBusiness"))}</a>
						</div>

						<div
							class="HeroMetrics"
							aria-label="${esc(ctx.t("overview.hero.metricsAria"))}"
						>
							<div class="HeroMetric">
								<strong class="MetricValue">1995</strong>
								<span class="MetricLabel">${esc(ctx.t("overview.hero.metricFounded"))}</span>
							</div>
							<div class="HeroMetric">
								<strong class="MetricValue">6</strong>
								<span class="MetricLabel">${esc(ctx.t("overview.hero.metricAreas"))}</span>
							</div>
							<div class="HeroMetric">
								<strong class="MetricValue">HW + SW</strong>
								<span class="MetricLabel">${esc(ctx.t("overview.hero.metricCapability"))}</span>
							</div>
						</div>
					</div>

					<div
						class="HeroVisual reveal RevealDelay2 isVisible"
						aria-label="${esc(ctx.t("overview.hero.visualAria"))}"
					>
						<div class="SystemBoard">
							<div class="BoardTopbar">
								<div
									class="BoardDots"
									aria-hidden="true"
								><i></i><i></i><i></i></div>
								<div class="BoardStatus">SYSTEM ONLINE</div>
							</div>

							<div
								class="RouteLine"
								aria-hidden="true"
							>
								<svg
									viewBox="0 0 500 420"
									preserveAspectRatio="none"
								>
									<defs>
										<linearGradient
											id="routeGradient"
											x1="0"
											y1="0"
											x2="1"
											y2="1"
										>
											<stop
												offset="0"
												stop-color="#5ed9ff"
											/>
											<stop
												offset="1"
												stop-color="#5bf0a5"
											/>
										</linearGradient>
									</defs>
									<path
										class="RouteShadow"
										d="M60 90 H380 Q430 90 430 140 V290 Q430 340 380 340 H120 Q60 340 60 280 V90"
									/>
									<path
										class="RoutePath"
										d="M60 90 H380 Q430 90 430 140 V290 Q430 340 380 340 H120 Q60 340 60 280 V90"
									/>
								</svg>
							</div>

							<div
								class="RouteNode NodeA"
								data-label="STORAGE"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								><path
										d="M4 6h16v14H4V6Zm3-3h10v3H7V3Zm1 7h8m-8 4h8"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg>
							</div>
							<div
								class="RouteNode NodeB"
								data-label="TRANSFER"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								><path
										d="M4 8h12m0 0-3-3m3 3-3 3M20 16H8m0 0 3-3m-3 3 3 3"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg>
							</div>
							<div
								class="RouteNode NodeC"
								data-label="CONVEYOR"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								><path
										d="M3 9h18v6H3V9Zm3 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
										stroke="currentColor"
										stroke-width="1.6"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg>
							</div>
							<div
								class="RouteNode NodeD"
								data-label="CONTROL"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								><path
										d="M5 4h14v16H5V4Zm3 4h8m-8 4h5m-5 4h8"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg>
							</div>

							<div
								class="AgvUnit"
								aria-hidden="true"
							>
								<span class="AgvWheel AgvWheelLeft"></span>
								<span class="AgvWheel AgvWheelRight"></span>
							</div>
						</div>

						<div
							class="FloatingPanel"
							aria-hidden="true"
						>
							<div class="PanelLabel">OPERATING STATUS</div>
							<div class="PanelValue">98.7% <small>ACTIVE</small></div>
							<div class="PanelBars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
						</div>
					</div>
				</div>
				<div
					class="ScrollGuide"
					aria-hidden="true"
				>SCROLL</div>
			</section>

			<section
				class="section"
				id="about"
			>
				<div class="container AboutGrid">
					<div class="AboutVisual reveal">
						<div class="AboutMainCard">
							<div class="AboutCardContent">
								<div class="AboutCardKicker">Integrated Automation Partner</div>
								<h2 class="AboutCardTitle">${aboutCardTitleHtml}</h2>
								<p class="AboutCardCopy">${esc(ctx.t("overview.about.cardCopy"))}</p>
							</div>
						</div>
						<div class="SinceCard">
							<span class="SinceLabel">Established</span>
							<strong class="SinceYear">1995</strong>
							<span class="SinceCopy">${esc(ctx.t("overview.about.sinceCopy"))}</span>
						</div>
					</div>

					<div class="AboutCopy reveal RevealDelay1">
						<p class="eyebrow">ABOUT AGVS</p>
						<h2 class="SectionTitle">${aboutTitleHtml}</h2>
						<div class="AboutParagraphs">
							<p>
								${esc(ctx.t("overview.about.p1"))}
							</p>
							<p>
								${esc(ctx.t("overview.about.p2"))}
							</p>
						</div>

						<div class="CapabilityList">
							<article class="CapabilityItem">
								<div class="CapabilityNumber">01</div>
								<div>
									<h3 class="CapabilityTitle">${esc(ctx.t("overview.about.cap1Title"))}</h3>
									<p class="CapabilityCopy">${esc(ctx.t("overview.about.cap1Copy"))}</p>
								</div>
							</article>
							<article class="CapabilityItem">
								<div class="CapabilityNumber">02</div>
								<div>
									<h3 class="CapabilityTitle">${esc(ctx.t("overview.about.cap2Title"))}</h3>
									<p class="CapabilityCopy">${esc(ctx.t("overview.about.cap2Copy"))}</p>
								</div>
							</article>
							<article class="CapabilityItem">
								<div class="CapabilityNumber">03</div>
								<div>
									<h3 class="CapabilityTitle">${esc(ctx.t("overview.about.cap3Title"))}</h3>
									<p class="CapabilityCopy">${esc(ctx.t("overview.about.cap3Copy"))}</p>
								</div>
							</article>
						</div>
					</div>
				</div>
			</section>

			<section
				class="section SectionSoft BusinessSection"
				id="business"
			>
				<div class="container">
					<div class="SectionHeading reveal">
						<div>
							<p class="eyebrow">OUR BUSINESS</p>
							<h2 class="SectionTitle">${businessTitleHtml}</h2>
						</div>
						<p class="SectionLead">
							${esc(ctx.t("overview.business.lead"))}
						</p>
					</div>

					<div class="BusinessLayout">
						<div
							class="WheelWrap reveal RevealDelay1"
							aria-label="${esc(ctx.t("overview.business.wheelAria"))}"
						>
							<div class="BusinessWheel">
								<div class="WheelItem Wheel1">
									<span class="WheelNumber">1</span>
									<span class="WheelName">${esc(ctx.t("overview.business.wheel1"))}</span>
									<span class="WheelSub">AGV</span>
								</div>
								<div class="WheelItem Wheel2">
									<span class="WheelNumber">2</span>
									<span class="WheelName">${esc(ctx.t("overview.business.wheel2"))}</span>
									<span class="WheelSub">FLA</span>
								</div>
								<div class="WheelItem Wheel3">
									<span class="WheelNumber">3</span>
									<span class="WheelName">${esc(ctx.t("overview.business.wheel3"))}</span>
									<span class="WheelSub">AS/RS</span>
								</div>
								<div class="WheelItem Wheel4">
									<span class="WheelNumber">4</span>
									<span class="WheelName">${esc(ctx.t("overview.business.wheel4"))}</span>
									<span class="WheelSub">Automatic Transfer</span>
								</div>
								<div class="WheelItem Wheel5">
									<span class="WheelNumber">5</span>
									<span class="WheelName">${esc(ctx.t("overview.business.wheel5"))}</span>
									<span class="WheelSub">Conveyor</span>
								</div>
								<div class="WheelItem Wheel6">
									<span class="WheelNumber">6</span>
									<span class="WheelName">${wheel6Html}</span>
								</div>
							</div>
							<div class="BusinessNote">
								<strong>Integrated Solution</strong>
								<span>${esc(ctx.t("overview.business.note"))}</span>
							</div>
						</div>

						<div class="BusinessList">
							<article class="BusinessCard reveal">
								<div class="BusinessIndex">01</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b1Title"))} <small>AGV</small></h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b1Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>

							<article class="BusinessCard reveal RevealDelay1">
								<div class="BusinessIndex">02</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b2Title"))} <small>FLA</small></h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b2Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>

							<article class="BusinessCard reveal RevealDelay2">
								<div class="BusinessIndex">03</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b3Title"))} <small>AS/RS</small></h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b3Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>

							<article class="BusinessCard reveal">
								<div class="BusinessIndex">04</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b4Title"))} <small>Automatic Transfer</small></h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b4Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>

							<article class="BusinessCard reveal RevealDelay1">
								<div class="BusinessIndex">05</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b5Title"))} <small>Conveyor</small></h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b5Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>

							<article class="BusinessCard reveal RevealDelay2">
								<div class="BusinessIndex">06</div>
								<div>
									<h3 class="BusinessTitle">${esc(ctx.t("overview.business.b6Title"))}</h3>
									<p class="BusinessDescription">${esc(ctx.t("overview.business.b6Desc"))}</p>
								</div>
								<span
									class="BusinessIcon"
									aria-hidden="true"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
									><path
											d="M5 12h14M13 6l6 6-6 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/></svg>
								</span>
							</article>
						</div>
					</div>
				</div>
			</section>

			<section
				class="section"
				id="values"
			>
				<div class="container">
					<div class="SectionHeading reveal">
						<div>
							<p class="eyebrow">CORE VALUE</p>
							<h2 class="SectionTitle">${valuesTitleHtml}</h2>
						</div>
						<p class="SectionLead">
							${esc(ctx.t("overview.values.lead"))}
						</p>
					</div>

					<div class="ValuesGrid">
						<article class="ValueCard reveal">
							<div class="ValueIndex">VALUE 01</div>
							<div class="ValueEnglish">Reliability<span class="ValueKorean">${esc(ctx.t("overview.values.v1Label"))}</span></div>
							<p class="ValueCopy">${esc(ctx.t("overview.values.v1Copy"))}</p>
						</article>
						<article class="ValueCard reveal RevealDelay1">
							<div class="ValueIndex">VALUE 02</div>
							<div class="ValueEnglish">Usability<span class="ValueKorean">${esc(ctx.t("overview.values.v2Label"))}</span></div>
							<p class="ValueCopy">${esc(ctx.t("overview.values.v2Copy"))}</p>
						</article>
						<article class="ValueCard reveal RevealDelay2">
							<div class="ValueIndex">VALUE 03</div>
							<div class="ValueEnglish">Scalability<span class="ValueKorean">${esc(ctx.t("overview.values.v3Label"))}</span></div>
							<p class="ValueCopy">${esc(ctx.t("overview.values.v3Copy"))}</p>
						</article>
						<article class="ValueCard reveal RevealDelay3">
							<div class="ValueIndex">VALUE 04</div>
							<div class="ValueEnglish">Flexibility<span class="ValueKorean">${esc(ctx.t("overview.values.v4Label"))}</span></div>
							<p class="ValueCopy">${esc(ctx.t("overview.values.v4Copy"))}</p>
						</article>
					</div>
				</div>
			</section>

			<section
				class="section ProfileSection"
				id="profile"
			>
				<div class="container">
					<div class="SectionHeading reveal">
						<div>
							<p class="eyebrow">COMPANY PROFILE</p>
							<h2 class="SectionTitle">${esc(ctx.t("overview.profile.title"))}</h2>
						</div>
						<p class="SectionLead">
							${esc(ctx.t("overview.profile.lead"))}
						</p>
					</div>

					<div class="ProfileCard reveal RevealDelay1">
						<div class="ProfileSide">
							<div class="ProfileSideLabel">Automation · Logistics · Control</div>
							<div class="ProfileSideCopy">
								<strong>Moving Industry<br />Forward.</strong>
								<span>${esc(ctx.t("overview.profile.sideCopy"))}</span>
							</div>
						</div>

						<div
							class="ProfileTable"
							role="table"
							aria-label="${esc(ctx.t("overview.profile.tableAria"))}"
						>
							<div
								class="ProfileRow"
								role="row"
							>
								<div
									class="ProfileLabel"
									role="rowheader"
								>${esc(ctx.t("overview.profile.nameLabel"))}</div>
								<div
									class="ProfileValue"
									role="cell"
								>AGVS CO., Ltd.</div>
							</div>
							<div
								class="ProfileRow"
								role="row"
							>
								<div
									class="ProfileLabel"
									role="rowheader"
								>${esc(ctx.t("overview.profile.foundedLabel"))}</div>
								<div
									class="ProfileValue"
									role="cell"
								>${esc(ctx.t("overview.profile.foundedValue"))}</div>
							</div>
							<div
								class="ProfileRow"
								role="row"
							>
								<div
									class="ProfileLabel"
									role="rowheader"
								>${esc(ctx.t("overview.profile.fieldLabel"))}</div>
								<div
									class="ProfileValue"
									role="cell"
								>
									${esc(ctx.t("overview.profile.fieldValue"))}
									<small>Automated Guided Vehicle System · Material Handling Equipment</small>
								</div>
							</div>
							<div
								class="ProfileRow"
								role="row"
							>
								<div
									class="ProfileLabel"
									role="rowheader"
								>${esc(ctx.t("overview.profile.addressLabel"))}</div>
								<div
									class="ProfileValue"
									role="cell"
								>
									${esc(ctx.t("overview.profile.addressValue"))}
									${addressSub === "" ? "" : `<small>${esc(addressSub)}</small>`}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="CtaSection">
				<div class="container">
					<div class="CtaCard reveal">
						<div class="CtaCopy">
							<h2 class="CtaTitle">${ctaTitleHtml}</h2>
							<p class="CtaDescription">${esc(ctx.t("overview.cta.description"))}</p>
						</div>
						<a
							class="button ButtonPrimary Sec03ContactBtn"
							href="#"
						>
							Contact Us
							<svg
								class="ButtonArrow"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M5 12h14M13 6l6 6-6 6"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</a>
					</div>
				</div>
			</section>
		</main>
		${renderFooter(ctx)}
		<!-- contactPop.html renders the shared popup root with id="ContactUsPop". -->
		${renderContactPop(ctx)}
		<script
			type="module"
			src="./assets/js/main.js?ver=20260804b"
		></script>
		<script>
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
		</script>
	</body>
</html>`;
	},
};
