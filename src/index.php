<?php require_once __DIR__ . "/includes/core/lang.php"; ?>
<!doctype html>
<html lang="<?php echo htmlspecialchars(
	$agvsHtmlLang,
	ENT_QUOTES,
	"UTF-8",
); ?>">
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
      <?php include __DIR__ . "/includes/layout/header.html"; ?>
      <main>
        <div id="FullPage">
          <div
            class="Section01"
            id="Section01"
          >
            <video
              class="BgVideo"
              src="<?php echo htmlspecialchars(
              	agvs_asset_url("./assets/video/Freevideo.mp4"),
              	ENT_QUOTES,
              	"UTF-8",
              ); ?>"
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
                  src="<?php echo htmlspecialchars(
                  	agvs_asset_url("./assets/img/Click.png"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
                  alt=""
                />
                <img
                  src="<?php echo htmlspecialchars(
                  	agvs_asset_url("./assets/img/ClickHover.png"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
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
                  src="<?php echo htmlspecialchars(
                  	agvs_asset_url("./assets/img/Click.png"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
                  alt=""
                />
                <img
                  src="<?php echo htmlspecialchars(
                  	agvs_asset_url("./assets/img/ClickHover.png"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
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
                  src="<?php echo htmlspecialchars(
                  	agvs_asset_url("./assets/img/sec03.png"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
                  alt="<?php echo htmlspecialchars(
                  	agvs_t("sec03.imgAlt"),
                  	ENT_QUOTES,
                  	"UTF-8",
                  ); ?>"
                />
              </div>
              <div class="ContactBannerContent">
                <div class="ContactBannerInner">
                  <h2 class="ContactBannerTitle">
                    <?php echo agvs_t("sec03.titleHtml"); ?>
                  </h2>
                  <p class="ContactBannerDescription">
                    <?php echo agvs_t("sec03.descriptionHtml"); ?>
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
      <?php include __DIR__ . "/includes/layout/footer.html"; ?>
      <?php include __DIR__ . "/includes/layout/contactPop.html"; ?>
    </div>
    <script type="module" src="./assets/js/main.js?ver=20260804b"></script>
  </body>
</html>
