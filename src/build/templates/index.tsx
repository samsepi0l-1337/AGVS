import { h, raw } from "../jsx/jsx-runtime.js";
import type { PageModule } from "../pages.js";
import { PageShell, renderPage } from "./shell.js";

/** The click-to-advance control repeated by sections 01 and 02. */
function ScrollButton({
	target,
	idle,
	hover,
}: {
	target: string;
	idle: string;
	hover: string;
}) {
	return (
		<button
			type="button"
			class="ScrollBtn"
			data-target={target}
			aria-label="다음 섹션으로 이동"
		>
			<img src={idle} alt="" />
			<img src={hover} alt="" />
		</button>
	);
}

const SECTION02_PANELS: ReadonlyArray<{ category: string; label: string }> = [
	{ category: "agv", label: "AGV" },
	{ category: "forklift", label: "ForkLift" },
	{ category: "technology", label: "Technology" },
];

const SECTIONS = ["Section01", "Section02", "Section03"] as const;

export const indexPage: PageModule = {
	name: "index",
	render(ctx, data) {
		const clickIdle = ctx.assetUrl("./assets/img/Click.png");
		const clickHover = ctx.assetUrl("./assets/img/ClickHover.png");

		return renderPage(
			<PageShell
				ctx={ctx}
				catalog={data.catalog}
				title="AGVS"
				wrapperClass="Overview"
				fonts={[
					"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap",
					// Only home.css references this icon font (.Sec03ContactBtn), and
					// only this page loads home.css.
					"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
					"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap",
				]}
				stylesheets={[
					"./assets/css/base/reset.css",
					"./assets/css/layout/layout.css?ver=20260804c",
					"./assets/css/pages/home.css",
					"./assets/css/layout/pop.css",
				]}
				scriptSrc="./assets/js/main.js?ver=20260804b"
			>
				<main>
					<div id="FullPage">
						<div class="Section01" id="Section01">
							<video
								class="BgVideo"
								src={ctx.assetUrl("./assets/video/Freevideo.mp4")}
								autoplay
								muted
								loop
								playsinline
							></video>
							<div class="Sec01Btn ScrollBtnWrap">
								<ScrollButton
									target="#Section02"
									idle={clickIdle}
									hover={clickHover}
								/>
							</div>
						</div>
						<div class="Section02" id="Section02">
							<div class="Sec02Panels">
								{SECTION02_PANELS.map((panel, index) => (
									<a
										href={`DetailList.php?category=${panel.category}`}
										class={`Sec02Panel Sec02Panel0${index + 1}`}
									>
										<span class="Sec02Title">{panel.label}</span>
									</a>
								))}
							</div>
							<div class="Sec02Dots">
								{SECTION02_PANELS.map((_, index) => (
									<button
										type="button"
										class="Sec02Dot"
										aria-label={`${index + 1}번 슬라이드`}
									></button>
								))}
							</div>
							<div class="ScrollBtnWrap">
								<ScrollButton
									target="#Section03"
									idle={clickIdle}
									hover={clickHover}
								/>
							</div>
						</div>
						<div class="Section03" id="Section03">
							<section class="ContactBanner" id="contact">
								<div class="ContactBannerVisual">
									<img
										src={ctx.assetUrl("./assets/img/sec03.png")}
										alt={ctx.t("sec03.imgAlt")}
									/>
								</div>
								<div class="ContactBannerContent">
									<div class="ContactBannerInner">
										{/* Trusted HTML translations, so they opt out of escaping. */}
										<h2 class="ContactBannerTitle">
											{raw(ctx.t("sec03.titleHtml"))}
										</h2>
										<p class="ContactBannerDescription">
											{raw(ctx.t("sec03.descriptionHtml"))}
										</p>
										<a href="#" class="ContactBannerLink Sec03ContactBtn">
											<span>CONTACT US</span>
											<span class="ContactBannerArrow" aria-hidden="true"></span>
										</a>
									</div>
								</div>
							</section>
						</div>
					</div>
				</main>
				<div class="AnchorNav">
					<ul>
						{SECTIONS.map((section, index) => (
							<li>
								<a
									href={`#${section}`}
									aria-label={`${index + 1}번 섹션으로 이동`}
								></a>
							</li>
						))}
					</ul>
				</div>
			</PageShell>,
		);
	},
};
