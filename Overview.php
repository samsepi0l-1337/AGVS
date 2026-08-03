<?php require_once __DIR__ . "/include/lang.php"; ?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars(
	$agvsHtmlLang,
	ENT_QUOTES,
	"UTF-8",
); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo htmlspecialchars(
    	agvs_t("overview.metaDescription"),
    	ENT_QUOTES,
    	"UTF-8",
    ); ?>">
    <title><?php echo htmlspecialchars(
    	agvs_t("overview.pageTitle"),
    	ENT_QUOTES,
    	"UTF-8",
    ); ?></title>
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
    href="./stlye/reset.css?ver=20260802o"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802o"
    >
    <link
    rel="stylesheet"
    href="./stlye/Overview.css?ver=20260802o"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802o"
    >
</head>
<body>
    <header class="header" id="header">
        <div class="header-inner">
            <a class="brand" href="index.php" aria-label="<?php echo htmlspecialchars(
            	agvs_t("overview.homeAria"),
            	ENT_QUOTES,
            	"UTF-8",
            ); ?>">
                <img src="./img/WordmarkWhite.png" alt="">
            </a>
            <nav class="nav" id="main-nav" aria-label="<?php echo htmlspecialchars(
            	agvs_t("overview.navAria"),
            	ENT_QUOTES,
            	"UTF-8",
            ); ?>">
                <a class="nav-link" href="#about">ABOUT</a>
                <a class="nav-link" href="#business">OUR BUSINESS</a>
                <a class="nav-link" href="#values">CORE VALUE</a>
                <a class="nav-link" href="#profile">COMPANY</a>
            </nav>
            <div class="HeaderLang LangSwitch">
				<button
					type="button"
					class="HeaderLangBtn LangSwitchBtn"
					aria-expanded="false"
					aria-haspopup="listbox"
					aria-label="<?php echo htmlspecialchars(
     	agvs_t("header.langAria"),
     	ENT_QUOTES,
     	"UTF-8",
     ); ?>"
				>
					<span class="HeaderLangCurrent LangSwitchCurrent"><?php echo htmlspecialchars(
     	$agvsLang,
     	ENT_QUOTES,
     	"UTF-8",
     ); ?></span>
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
        <section class="hero" id="top">
            <div class="container hero-inner">
                <div class="hero-copy reveal is-visible">
                    <div class="hero-kicker">
                        <span class="hero-kicker-dot" aria-hidden="true"></span>
                        SINCE 1995 · INTEGRATED MATERIAL HANDLING
                    </div>
                    <h1 class="hero-title">
                        <?php echo agvs_t("overview.hero.titleHtml"); ?>
                    </h1>
                    <p class="hero-description">
                        <?php echo htmlspecialchars(
                        	agvs_t("overview.hero.description"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                    </p>
                    <div class="hero-actions">
                        <a class="button button-primary" href="#about">
                            <?php echo htmlspecialchars(
                            	agvs_t("overview.hero.ctaAbout"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                            <svg class="button-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                        <a class="button button-ghost" href="#business"><?php echo htmlspecialchars(
                        	agvs_t("overview.hero.ctaBusiness"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></a>
                    </div>

                    <div class="hero-metrics" aria-label="<?php echo htmlspecialchars(
                    	agvs_t("overview.hero.metricsAria"),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>">
                        <div class="hero-metric">
                            <strong class="metric-value">1995</strong>
                            <span class="metric-label"><?php echo htmlspecialchars(
                            	agvs_t("overview.hero.metricFounded"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </div>
                        <div class="hero-metric">
                            <strong class="metric-value">6</strong>
                            <span class="metric-label"><?php echo htmlspecialchars(
                            	agvs_t("overview.hero.metricAreas"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </div>
                        <div class="hero-metric">
                            <strong class="metric-value">HW + SW</strong>
                            <span class="metric-label"><?php echo htmlspecialchars(
                            	agvs_t("overview.hero.metricCapability"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </div>
                    </div>
                </div>

                <div class="hero-visual reveal reveal-delay-2 is-visible" aria-label="<?php echo htmlspecialchars(
                	agvs_t("overview.hero.visualAria"),
                	ENT_QUOTES,
                	"UTF-8",
                ); ?>">
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
                            <h2 class="about-card-title"><?php echo agvs_t(
                            	"overview.about.cardTitleHtml",
                            ); ?></h2>
                            <p class="about-card-copy"><?php echo htmlspecialchars(
                            	agvs_t("overview.about.cardCopy"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></p>
                        </div>
                    </div>
                    <div class="since-card">
                        <span class="since-label">Established</span>
                        <strong class="since-year">1995</strong>
                        <span class="since-copy"><?php echo htmlspecialchars(
                        	agvs_t("overview.about.sinceCopy"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                    </div>
                </div>

                <div class="about-copy reveal reveal-delay-1">
                    <p class="eyebrow">ABOUT AGVS</p>
                    <h2 class="section-title"><?php echo agvs_t(
                    	"overview.about.titleHtml",
                    ); ?></h2>
                    <div class="about-paragraphs">
                        <p>
                            <?php echo htmlspecialchars(
                            	agvs_t("overview.about.p1"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </p>
                        <p>
                            <?php echo htmlspecialchars(
                            	agvs_t("overview.about.p2"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </p>
                    </div>

                    <div class="capability-list">
                        <article class="capability-item">
                            <div class="capability-number">01</div>
                            <div>
                                <h3 class="capability-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap1Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></h3>
                                <p class="capability-copy"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap1Copy"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                        </article>
                        <article class="capability-item">
                            <div class="capability-number">02</div>
                            <div>
                                <h3 class="capability-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap2Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></h3>
                                <p class="capability-copy"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap2Copy"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                        </article>
                        <article class="capability-item">
                            <div class="capability-number">03</div>
                            <div>
                                <h3 class="capability-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap3Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></h3>
                                <p class="capability-copy"><?php echo htmlspecialchars(
                                	agvs_t("overview.about.cap3Copy"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
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
                        <h2 class="section-title"><?php echo agvs_t(
                        	"overview.business.titleHtml",
                        ); ?></h2>
                    </div>
                    <p class="section-lead">
                        <?php echo htmlspecialchars(
                        	agvs_t("overview.business.lead"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                    </p>
                </div>

                <div class="business-layout">
                    <div class="wheel-wrap reveal reveal-delay-1" aria-label="<?php echo htmlspecialchars(
                    	agvs_t("overview.business.wheelAria"),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>">
                        <div class="business-wheel">
                            <div class="wheel-item wheel-1">
                                <span class="wheel-number">1</span>
                                <span class="wheel-name"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.wheel1"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></span>
                                <span class="wheel-sub">AGV</span>
                            </div>
                            <div class="wheel-item wheel-2">
                                <span class="wheel-number">2</span>
                                <span class="wheel-name"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.wheel2"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></span>
                                <span class="wheel-sub">FLA</span>
                            </div>
                            <div class="wheel-item wheel-3">
                                <span class="wheel-number">3</span>
                                <span class="wheel-name"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.wheel3"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></span>
                                <span class="wheel-sub">AS/RS</span>
                            </div>
                            <div class="wheel-item wheel-4">
                                <span class="wheel-number">4</span>
                                <span class="wheel-name"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.wheel4"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></span>
                                <span class="wheel-sub">Automatic Transfer</span>
                            </div>
                            <div class="wheel-item wheel-5">
                                <span class="wheel-number">5</span>
                                <span class="wheel-name"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.wheel5"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></span>
                                <span class="wheel-sub">Conveyor</span>
                            </div>
                            <div class="wheel-item wheel-6">
                                <span class="wheel-number">6</span>
                                <span class="wheel-name"><?php echo agvs_t(
                                	"overview.business.wheel6Html",
                                ); ?></span>
                            </div>
                        </div>
                        <div class="business-note">
                            <strong>Integrated Solution</strong>
                            <span><?php echo htmlspecialchars(
                            	agvs_t("overview.business.note"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </div>
                    </div>

                    <div class="business-list">
                        <article class="business-card reveal">
                            <div class="business-index">01</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b1Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?> <small>AGV</small></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b1Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-1">
                            <div class="business-index">02</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b2Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?> <small>FLA</small></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b2Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-2">
                            <div class="business-index">03</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b3Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?> <small>AS/RS</small></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b3Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal">
                            <div class="business-index">04</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b4Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?> <small>Automatic Transfer</small></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b4Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-1">
                            <div class="business-index">05</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b5Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?> <small>Conveyor</small></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b5Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
                            </div>
                            <span class="business-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                        </article>

                        <article class="business-card reveal reveal-delay-2">
                            <div class="business-index">06</div>
                            <div>
                                <h3 class="business-title"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b6Title"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></h3>
                                <p class="business-description"><?php echo htmlspecialchars(
                                	agvs_t("overview.business.b6Desc"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></p>
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
                        <h2 class="section-title"><?php echo agvs_t(
                        	"overview.values.titleHtml",
                        ); ?></h2>
                    </div>
                    <p class="section-lead">
                        <?php echo htmlspecialchars(
                        	agvs_t("overview.values.lead"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                    </p>
                </div>

                <div class="values-grid">
                    <article class="value-card reveal">
                        <div class="value-index">VALUE 01</div>
                        <div class="value-english">Reliability<span class="value-korean"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v1Label"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span></div>
                        <p class="value-copy"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v1Copy"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></p>
                    </article>
                    <article class="value-card reveal reveal-delay-1">
                        <div class="value-index">VALUE 02</div>
                        <div class="value-english">Usability<span class="value-korean"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v2Label"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span></div>
                        <p class="value-copy"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v2Copy"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></p>
                    </article>
                    <article class="value-card reveal reveal-delay-2">
                        <div class="value-index">VALUE 03</div>
                        <div class="value-english">Scalability<span class="value-korean"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v3Label"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span></div>
                        <p class="value-copy"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v3Copy"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></p>
                    </article>
                    <article class="value-card reveal reveal-delay-3">
                        <div class="value-index">VALUE 04</div>
                        <div class="value-english">Flexibility<span class="value-korean"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v4Label"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span></div>
                        <p class="value-copy"><?php echo htmlspecialchars(
                        	agvs_t("overview.values.v4Copy"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section profile-section" id="profile">
            <div class="container">
                <div class="section-heading reveal">
                    <div>
                        <p class="eyebrow">COMPANY PROFILE</p>
                        <h2 class="section-title"><?php echo htmlspecialchars(
                        	agvs_t("overview.profile.title"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></h2>
                    </div>
                    <p class="section-lead">
                        <?php echo htmlspecialchars(
                        	agvs_t("overview.profile.lead"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                    </p>
                </div>

                <div class="profile-card reveal reveal-delay-1">
                    <div class="profile-side">
                        <div class="profile-side-label">Automation · Logistics · Control</div>
                        <div class="profile-side-copy">
                            <strong>Moving Industry<br />Forward.</strong>
                            <span><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.sideCopy"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </div>
                    </div>

                    <div class="profile-table" role="table" aria-label="<?php echo htmlspecialchars(
                    	agvs_t("overview.profile.tableAria"),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>">
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader"><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.nameLabel"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></div>
                            <div class="profile-value" role="cell">AGVS CO., Ltd.</div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader"><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.foundedLabel"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></div>
                            <div class="profile-value" role="cell"><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.foundedValue"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader"><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.fieldLabel"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></div>
                            <div class="profile-value" role="cell">
                                <?php echo htmlspecialchars(
                                	agvs_t("overview.profile.fieldValue"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?>
                                <small>Automated Guided Vehicle System · Material Handling Equipment</small>
                            </div>
                        </div>
                        <div class="profile-row" role="row">
                            <div class="profile-label" role="rowheader"><?php echo htmlspecialchars(
                            	agvs_t("overview.profile.addressLabel"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></div>
                            <div class="profile-value" role="cell">
                                <?php echo htmlspecialchars(
                                	agvs_t("overview.profile.addressValue"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?>
                                <?php
                                $addressSub = agvs_t(
                                	"overview.profile.addressSub",
                                );
                                if ($addressSub !== ""): ?>
                                <small><?php echo htmlspecialchars(
                                	$addressSub,
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?></small>
                                <?php endif;
                                ?>
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
                        <h2 class="cta-title"><?php echo agvs_t(
                        	"overview.cta.titleHtml",
                        ); ?></h2>
                        <p class="cta-description"><?php echo htmlspecialchars(
                        	agvs_t("overview.cta.description"),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></p>
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
    <script src="./js/main.js?ver=20260802o"></script>
    <script>
        const brandImg = document.querySelector(".brand img");

        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;

            if (scrollY > 50) {
                brandImg.src = "./img/Wordmark.png";
            } else {
                brandImg.src = "./img/WordmarkWhite.png";
            }
        });

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
