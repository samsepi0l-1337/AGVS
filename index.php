<!doctype html>
<html lang="ko">
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
      rel="stylesheet"
      href="./stlye/reset.css?ver=20260801b"
    />
    <link
      rel="stylesheet"
      href="./stlye/layout.css?ver=20260801b"
    />
    <link
      rel="stylesheet"
      href="./stlye/main.css?ver=20260801b"
    />
  </head>
  <body>
    <div class="OverView">
      <?php include __DIR__ . "/include/header.html"; ?>
      <main>
        <div id="FullPage">
          <div
            class="Section01"
            id="Section01"
          >
            <video
              class="BgVideo"
              src="./video/Freevideo.mp4"
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
                  src="./img/click.png"
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
                href="#"
                class="Sec02Panel Sec02Panel01"
              >
                <span class="Sec02Title">Interior Design</span>
              </a>
              <a
                href="#"
                class="Sec02Panel Sec02Panel02"
              >
                <span class="Sec02Title">Remodeling</span>
              </a>
              <a
                href="#"
                class="Sec02Panel Sec02Panel03"
              >
                <span class="Sec02Title">Consulting</span>
              </a>
            </div>
            <div class="ScrollBtnWrap">
              <button
                type="button"
                class="ScrollBtn"
                data-target="#Section03"
                aria-label="다음 섹션으로 이동"
              >
                <img
                  src="./img/click.png"
                  alt=""
                />
              </button>
            </div>
          </div>
          <div
            class="Section03"
            id="Section03"
          >
            <div class="Sec03Inner">
              <div
                class="Sec03Visual"
                aria-hidden="true"
              ></div>
              <div class="Sec03Content">
                <div class="Sec03Copy">
                  <h2 class="Sec03Title">
                    <span class="Sec03TitleLine Sec03TitleLine01"
                      >물류가 스스로 움직이는 세상</span
                    >
                    <span class="Sec03TitleLine Sec03TitleLine02"
                      >AGVS의 비전</span
                    >
                  </h2>
                  <p class="Sec03Desc">
                    자율주행 기술로<br />
                    산업 현장의 미래를 연결합니다.
                  </p>
                  <p class="Sec03Tagline">Beyond Logistics Automation</p>
                  <a
                    href="#"
                    class="Sec03ContactBtn"
                  >
                    <span class="Sec03ContactLabel">Contact Us</span>
                    <span
                      class="material-symbols-outlined"
                      aria-hidden="true"
                      >chevron_right</span
                    >
                  </a>
                </div>
              </div>
            </div>
            <div class="ScrollBtnWrap">
              <button
                type="button"
                class="ScrollBtn"
                data-target="#Footer"
                aria-label="맨 아래로 이동"
              >
                <img
                  src="./img/click.png"
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
      </main>
      <?php include __DIR__ . "/include/footer.html"; ?>
    </div>
    <script src="./js/main.js?ver=20260801b"></script>
  </body>
</html>
