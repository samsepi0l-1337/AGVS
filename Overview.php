<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="AGVS 회사 소개 및 주요사업 안내">
    <title>회사소개 및 주요사업 | AGVS</title>
    <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
    >
    <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
    >
    <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
    rel="stylesheet"
    >
    <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
    rel="stylesheet"
    >
    <link
    rel="stylesheet"
    href="./stlye/reset.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/Overview.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802e"
    >
</head>
<body>
    <header class="header" id="header">
        <div class="header-inner">
            <a class="brand" href="index.php" aria-label="AGVS 홈으로 이동">
                <img src="./img/Wordmark.png" alt="">
            </a>
            <nav class="nav" id="main-nav" aria-label="주요 메뉴">
                <a class="nav-link" href="#about">ABOUT</a>
                <a class="nav-link" href="#business">OUR BUSINESS</a>
                <a class="nav-link" href="#values">CORE VALUE</a>
                <a class="nav-link" href="#profile">COMPANY</a>
            </nav>
        </div>
    </header>
    <main class="OverviewMain">
        <section class="hero" id="top">
            <div class="container hero-inner">
                <div class="hero-copy reveal is-visible">
                    <div class="hero-kicker">
                        <span class="hero-kicker-dot" aria-hidden="true"></span>
                        SINCE 1995 · INTEGRATED MATERIAL HANDLING
                    </div>
                    <h1 class="hero-title">
                        물류의 흐름을 자동화하고,<br />
                        <span class="gradient-text">생산의 가능성을 확장합니다.</span>
                    </h1>
                    <p class="hero-description">
                        AGVS는 고객의 다양한 생산·물류 환경에 맞춘 무인운반차(AGV)와 제어 시스템을 개발·공급해 온 물류 자동화 전문기업입니다.
                    </p>
                    <div class="hero-actions">
                        <a class="button button-primary" href="#about">
                            AGVS 소개
                            <svg class="button-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                        <a class="button button-ghost" href="#business">주요사업 보기</a>
                    </div>

                    <div class="hero-metrics" aria-label="AGVS 핵심 정보">
                        <div class="hero-metric">
                            <strong class="metric-value">1995</strong>
                            <span class="metric-label">설립연도</span>
                        </div>
                        <div class="hero-metric">
                            <strong class="metric-value">6</strong>
                            <span class="metric-label">핵심 사업영역</span>
                        </div>
                        <div class="hero-metric">
                            <strong class="metric-value">HW + SW</strong>
                            <span class="metric-label">통합 개발역량</span>
                        </div>
                    </div>
                </div>

                <div class="hero-visual reveal reveal-delay-2 is-visible" aria-label="AGV 물류 자동화 시스템 개념도">
                    <div class="system-board">
                        <div class="board-topbar">
                            <div class="board-dots" aria-hidden="true"><i></i><i></i><i></i></div>
                            <div class="board-status">SYSTEM ONLINE</div>
                        </div>

                        <div class="route-line" aria-hidden="true">
                            <svg viewBox="0 0 500 420" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0" stop-color="#5ed9ff" />
                                        <stop offset="1" stop-color="#5bf0a5" />
                                    </linearGradient>
                                </defs>
                                <path class="route-shadow" d="M60 90 H380 Q430 90 430 140 V290 Q430 340 380 340 H120 Q60 340 60 280 V90" />
                                <path class="route-path" d="M60 90 H380 Q430 90 430 140 V290 Q430 340 380 340 H120 Q60 340 60 280 V90" />
                            </svg>
                        </div>

                        <div class="route-node node-a" data-label="STORAGE">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16v14H4V6Zm3-3h10v3H7V3Zm1 7h8m-8 4h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="route-node node-b" data-label="TRANSFER">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8h12m0 0-3-3m3 3-3 3M20 16H8m0 0 3-3m-3 3 3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="route-node node-c" data-label="CONVEYOR">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9h18v6H3V9Zm3 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="route-node node-d" data-label="CONTROL">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5V4Zm3 4h8m-8 4h5m-5 4h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>

                        <div class="agv-unit" aria-hidden="true">
                            <span class="agv-wheel left"></span>
                            <span class="agv-wheel right"></span>
                        </div>
                    </div>

                    <div class="floating-panel" aria-hidden="true">
                        <div class="panel-label">OPERATING STATUS</div>
                        <div class="panel-value">98.7% <small>ACTIVE</small></div>
                        <div class="panel-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
                    </div>
                </div>
            </div>
            <div class="scroll-guide" aria-hidden="true">SCROLL</div>
        </section>

        <section class="section" id="about">
            <div class="container about-grid">
                <div class="about-visual reveal">
                    <div class="about-main-card">
                        <div class="about-card-content">
                            <div class="about-card-kicker">Integrated Automation Partner</div>
                            <h2 class="about-card-title">현장을 이해하는 경험과<br />통합 자동화 기술</h2>
                            <p class="about-card-copy">AGV, 제어 시스템, 기구 설계, 운영 소프트웨어를 하나의 관점에서 연결합니다.</p>
                        </div>
                    </div>
                    <div class="since-card">
                        <span class="since-label">Established</span>
                        <strong class="since-year">1995</strong>
                        <span class="since-copy">축적된 경험과 기술 노하우</span>
                    </div>
                </div>

                <div class="about-copy reveal reveal-delay-1">
                    <p class="eyebrow">ABOUT AGVS</p>
                    <h2 class="section-title">고객의 요구를<br /><span class="accent">실행 가능한 자동화</span>로 연결합니다.</h2>
                    <div class="about-paragraphs">
                        <p>
                            AGVS는 설립 이래 고객의 다양한 요구에 맞춰 AGV와 제어 시스템을 개발·공급해 왔습니다. 축적된 현장 경험과 기술 노하우를 바탕으로 AGV 제어 시스템, 기구 설계, 운영자 인터페이스 소프트웨어를 지속적으로 고도화합니다.
                        </p>
                        <p>
                            장비 단위의 공급을 넘어 차량, 이송설비, 운영 소프트웨어가 하나의 흐름으로 작동하도록 통합 관점에서 시스템을 설계합니다. 신뢰성, 사용성, 확장성, 유연성을 핵심 기준으로 생산과 물류 현장의 효율적인 운영을 지원합니다.
                        </p>
                    </div>

                    <div class="capability-list">
                        <article class="capability-item">
                            <div class="capability-number">01</div>
                            <div>
                                <h3 class="capability-title">통합 시스템 개발</h3>
                                <p class="capability-copy">기구 설계부터 제어 시스템, 운영자 인터페이스까지 유기적으로 구성합니다.</p>
                            </div>
                        </article>
                        <article class="capability-item">
                            <div class="capability-number">02</div>
                            <div>
                                <h3 class="capability-title">현장 맞춤형 자동화</h3>
                                <p class="capability-copy">공정, 공간, 운반 대상과 운영 조건을 고려해 적용 가능한 시스템을 설계합니다.</p>
                            </div>
                        </article>
                        <article class="capability-item">
                            <div class="capability-number">03</div>
                            <div>
                                <h3 class="capability-title">지속 가능한 확장성</h3>
                                <p class="capability-copy">라인 변경과 설비 증설 등 현장의 변화에 대응할 수 있는 구조를 지향합니다.</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section class="section section-soft business-section" id="business">
            <div class="container">
                <div class="section-heading reveal">
                    <div>
                        <p class="eyebrow">OUR BUSINESS</p>
                        <h2 class="section-title">이동 장비부터 제어까지,<br /><span class="accent">하나의 물류 흐름</span>으로 연결합니다.</h2>
                    </div>
                    <p class="section-lead">
                        AGVS는 무인운반차와 무인지게차, 자동창고, 자동이송, 컨베이어, 물류·AGV 관리 소프트웨어를 기반으로 생산 및 물류 자동화 시스템을 구성합니다.
                    </p>
                </div>

                <div class="business-layout">
                    <div class="wheel-wrap reveal reveal-delay-1" aria-label="AGVS 주요사업 6개 영역">
                        <div class="business-wheel">
                            <div class="wheel-item wheel-1">
                                <span class="wheel-number">1</span>
                                <span class="wheel-name">무인운반차</span>
                                <span class="wheel-sub">AGV</span>
                            </div>
                            <div class="wheel-item wheel-2">
                                <span class="wheel-number">2</span>
                                <span class="wheel-name">무인지게차</span>
                                <span class="wheel-sub">FLA</span>
                            </div>
                            <div class="wheel-item wheel-3">
                                <span class="wheel-number">3</span>
                                <span class="wheel-name">자동창고 시스템</span>
                                <span class="wheel-sub">AS/RS</span>
                            </div>
                            <div class="wheel-item wheel-4">
                                <span class="wheel-number">4</span>
                                <span class="wheel-name">자동이송</span>
                                <span class="wheel-sub">Automatic Transfer</span>
                            </div>
                            <div class="wheel-item wheel-5">
                                <span class="wheel-number">5</span>
                                <span class="wheel-name">컨베이어 시스템</span>
                                <span class="wheel-sub">Conveyor</span>
                            </div>
                            <div class="wheel-item wheel-6">
                                <span class="wheel-number">6</span>
                                <span class="wheel-name">물류·AGV 관리<br />소프트웨어 및 제어</span>
                            </div>
                        </div>
                        <div class="business-note">
                            <strong>Integrated Solution</strong>
                            <span>장비·설비·소프트웨어를 통합해 물류 흐름 전체를 설계합니다.</span>
                        </div>
                    </div>

                    <div class="business-list">
                        <article class="business-card reveal">
                            <div class="business-index">01</div>
                            <div>
                                <h3 class="business-title">무인운반차 <small>AGV</small></h3>
                                <p class="business-description">생산·물류 현장에서 자재와 부품을 자동으로 이송하는 무인운반 시스템입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-1">
                            <div class="business-index">02</div>
                            <div>
                                <h3 class="business-title">무인지게차 <small>FLA</small></h3>
                                <p class="business-description">팔레트와 적재물을 무인으로 운반하고 입·출고 작업을 자동화하는 시스템입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-2">
                            <div class="business-index">03</div>
                            <div>
                                <h3 class="business-title">자동창고 시스템 <small>AS/RS</small></h3>
                                <p class="business-description">보관 공간의 활용도와 입·출고 정확도를 높이는 자동 저장·검색 시스템입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal">
                            <div class="business-index">04</div>
                            <div>
                                <h3 class="business-title">자동이송 <small>Automatic Transfer</small></h3>
                                <p class="business-description">공정과 설비 사이의 물류 흐름을 연결하는 자동 이송 솔루션입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-1">
                            <div class="business-index">05</div>
                            <div>
                                <h3 class="business-title">컨베이어 시스템 <small>Conveyor</small></h3>
                                <p class="business-description">제품, 부품, 포장물을 연속적이고 안정적으로 이송하는 맞춤형 시스템입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-2">
                            <div class="business-index">06</div>
                            <div>
                                <h3 class="business-title">물류·AGV 관리 소프트웨어 및 제어시스템</h3>
                                <p class="business-description">차량 배차, 경로, 상태, 작업 정보를 통합 관리하는 운영 소프트웨어와 제어 시스템입니다.</p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section class="section" id="values">
            <div class="container">
                <div class="section-heading reveal">
                    <div>
                        <p class="eyebrow">CORE VALUE</p>
                        <h2 class="section-title">시스템의 완성도를 결정하는<br /><span class="accent">네 가지 기준</span></h2>
                    </div>
                    <p class="section-lead">
                        AGVS는 신뢰성, 사용성, 확장성, 유연성을 중심으로 현장에서 안정적으로 운영되고 변화에 대응할 수 있는 자동화 시스템을 지향합니다.
                    </p>
                </div>

                <div class="values-grid">
                    <article class="value-card reveal">
                        <div class="value-index">VALUE 01</div>
                        <div class="value-english">Reliability<span class="value-korean">신뢰성</span></div>
                        <p class="value-copy">생산 현장에서 안정적으로 운용될 수 있도록 시스템의 일관성과 지속성을 고려합니다.</p>
                    </article>
                    <article class="value-card reveal reveal-delay-1">
                        <div class="value-index">VALUE 02</div>
                        <div class="value-english">Usability<span class="value-korean">사용성</span></div>
                        <p class="value-copy">운영자가 시스템의 상태를 빠르게 이해하고 효율적으로 조작할 수 있는 환경을 설계합니다.</p>
                    </article>
                    <article class="value-card reveal reveal-delay-2">
                        <div class="value-index">VALUE 03</div>
                        <div class="value-english">Scalability<span class="value-korean">확장성</span></div>
                        <p class="value-copy">설비 증설, 차량 추가, 공정 변화에 맞춰 기능과 운용 범위를 확장할 수 있는 구조를 지향합니다.</p>
                    </article>
                    <article class="value-card reveal reveal-delay-3">
                        <div class="value-index">VALUE 04</div>
                        <div class="value-english">Flexibility<span class="value-korean">유연성</span></div>
                        <p class="value-copy">고객별 물류 조건과 다양한 운영 시나리오를 반영할 수 있도록 시스템을 유연하게 구성합니다.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section profile-section" id="profile">
            <div class="container">
                <div class="section-heading reveal">
                    <div>
                        <p class="eyebrow">COMPANY PROFILE</p>
                        <h2 class="section-title">AGVS를 소개합니다.</h2>
                    </div>
                    <p class="section-lead">
                        1995년 설립 이후 무인운반차 시스템과 물류이송장비 분야의 기술을 축적해 왔습니다.
                    </p>
                </div>

                <div class="profile-card reveal reveal-delay-1">
                    <div class="profile-side">
                        <div class="profile-side-label">Automation · Logistics · Control</div>
                        <div class="profile-side-copy">
                            <strong>Moving Industry<br />Forward.</strong>
                            <span>자동화 기술로 더 효율적인 생산과 물류의 흐름을 만듭니다.</span>
                        </div>
                    </div>

                    <div class="profile-table" role="table" aria-label="AGVS 회사 개요">
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader">회사명</div>
                            <div class="profile-value" role="cell">AGVS CO., Ltd.</div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader">설립</div>
                            <div class="profile-value" role="cell">1995년</div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader">사업 분야</div>
                            <div class="profile-value" role="cell">
                                무인운반차 시스템 · 물류이송장비
                                <small>Automated Guided Vehicle System · Material Handling Equipment</small>
                            </div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader">소재지</div>
                            <div class="profile-value" role="cell">
                                경기 시흥시 서울대학로 59-21, 로얄팰리스테크노1차 703
                                <small>703 Royal Palace Techno 1st, 59-21, Seouldaehak-ro, Siheung-si, Gyeonggi-do, Republic of Korea</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container">
                <div class="cta-card reveal">
                    <div class="cta-copy">
                        <h2 class="cta-title">현장에 필요한 자동화,<br />AGVS의 통합 기술로 연결합니다.</h2>
                        <p class="cta-description">AGV부터 자동창고, 이송설비, 운영 소프트웨어까지 하나의 시스템으로 구성합니다.</p>
                    </div>
                    <a class="button button-primary Sec03ContactBtn" href="#">
                        Contact Us
                        <svg class="button-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <!-- contactPop.html renders the shared popup root with id="ContactUsPop". -->
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260802e"></script>
    <script>
        (() => {
            const overview = document.querySelector(".OverviewMain");
            if (!overview) {
                return;
            }

            const header = document.querySelector("body > .header");
            if (header) {
                const navLinks = [...header.querySelectorAll(".nav-link")];
                const sections = [...overview.querySelectorAll("section[id]")];
                const updateHeader = () => {
                    header.classList.toggle("scrolled", window.scrollY > 24);
                };

                if ("IntersectionObserver" in window) {
                    const sectionObserver = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                navLinks.forEach((link) => {
                                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                                });
                            }
                        });
                    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

                    sections.forEach((section) => sectionObserver.observe(section));
                }

                window.addEventListener("scroll", updateHeader, { passive: true });
                updateHeader();
            }

            const reveals = overview.querySelectorAll(".reveal:not(.is-visible)");
            if (!("IntersectionObserver" in window)) {
                reveals.forEach((element) => element.classList.add("is-visible"));
                return;
            }

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            reveals.forEach((element) => revealObserver.observe(element));
        })();
    </script>
</body>
</html>
