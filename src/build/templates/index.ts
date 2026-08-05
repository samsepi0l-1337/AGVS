import type { PageModule } from "../pages.js";

import { esc } from "../html.js";
import { renderContactPop } from "./contactPop.js";
import { renderFooter } from "./footer.js";
import { renderHeader } from "./header.js";

export const indexPage: PageModule = {
	name: "index",
	render(ctx, data) {
		// Deliberately not esc(): the PHP page emits these trusted HTML translations directly.
		const titleHtml = ctx.t("sec03.titleHtml");
		const descriptionHtml = ctx.t("sec03.descriptionHtml");

		return `<!doctype html>
<html lang="${esc(ctx.htmlLang)}">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<title>AGVS</title>
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
			href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
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
			href="./assets/css/pages/home.css"
		/>
		<link
			rel="stylesheet"
			href="./assets/css/layout/pop.css"
		/>
	</head>
	<body>
		<div class="Overview">
			${renderHeader(ctx, data.catalog)}
			<main>
				<div id="FullPage">
					<div
						class="Section01"
						id="Section01"
					>
						<video
							class="BgVideo"
							src="${esc(ctx.assetUrl("./assets/video/Freevideo.mp4"))}"
							autoplay
							muted
							loop
							playsinline
						></video>
						<div class="Sec01Btn ScrollBtnWrap">
							<button
								type="button"
								class="ScrollBtn"
								data-target="#Section02"
								aria-label="다음 섹션으로 이동"
							>
								<img
									src="${esc(ctx.assetUrl("./assets/img/Click.png"))}"
									alt=""
								/>
								<img
									src="${esc(ctx.assetUrl("./assets/img/ClickHover.png"))}"
									alt=""
								/>
							</button>
						</div>
					</div>
					<div
						class="Section02"
						id="Section02"
					>
						<div class="Sec02Panels">
							<a
								href="DetailList.php?category=agv"
								class="Sec02Panel Sec02Panel01"
							>
								<span class="Sec02Title">AGV</span>
							</a>
							<a
								href="DetailList.php?category=forklift"
								class="Sec02Panel Sec02Panel02"
							>
								<span class="Sec02Title">ForkLift</span>
							</a>
							<a
								href="DetailList.php?category=technology"
								class="Sec02Panel Sec02Panel03"
							>
								<span class="Sec02Title">Technology</span>
							</a>
						</div>
						<div class="Sec02Dots">
							<button
								type="button"
								class="Sec02Dot"
								aria-label="1번 슬라이드"
							></button>
							<button
								type="button"
								class="Sec02Dot"
								aria-label="2번 슬라이드"
							></button>
							<button
								type="button"
								class="Sec02Dot"
								aria-label="3번 슬라이드"
							></button>
						</div>
						<div class="ScrollBtnWrap">
							<button
								type="button"
								class="ScrollBtn"
								data-target="#Section03"
								aria-label="다음 섹션으로 이동"
							>
								<img
									src="${esc(ctx.assetUrl("./assets/img/Click.png"))}"
									alt=""
								/>
								<img
									src="${esc(ctx.assetUrl("./assets/img/ClickHover.png"))}"
									alt=""
								/>
							</button>
						</div>
					</div>
					<div
						class="Section03"
						id="Section03"
					>
						<section
							class="ContactBanner"
							id="contact"
						>
							<div class="ContactBannerVisual">
								<img
									src="${esc(ctx.assetUrl("./assets/img/sec03.png"))}"
									alt="${esc(ctx.t("sec03.imgAlt"))}"
								/>
							</div>
							<div class="ContactBannerContent">
								<div class="ContactBannerInner">
									<h2 class="ContactBannerTitle">
										${titleHtml}
									</h2>
									<p class="ContactBannerDescription">
										${descriptionHtml}
									</p>
									<a
										href="#"
										class="ContactBannerLink Sec03ContactBtn"
									>
										<span>CONTACT US</span>
										<span
											class="ContactBannerArrow"
											aria-hidden="true"
										></span>
									</a>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
			<div class="AnchorNav">
				<ul>
					<li>
						<a
							href="#Section01"
							aria-label="1번 섹션으로 이동"
						></a>
					</li>
					<li>
						<a
							href="#Section02"
							aria-label="2번 섹션으로 이동"
						></a>
					</li>
					<li>
						<a
							href="#Section03"
							aria-label="3번 섹션으로 이동"
						></a>
					</li>
				</ul>
			</div>
			${renderFooter(ctx)}
			${renderContactPop(ctx)}
		</div>
		<script
			type="module"
			src="./assets/js/main.js?ver=20260804b"
		></script>
	</body>
</html>`;
	},
};
