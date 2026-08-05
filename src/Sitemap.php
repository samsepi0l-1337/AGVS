<?php
require_once __DIR__ . "/includes/core/lang.php";
$catalog = agvs_load_catalog();
$catalogCategories =
	isset($catalog["categories"]) && is_array($catalog["categories"])
		? $catalog["categories"]
		: [];
$catalogItems =
	isset($catalog["items"]) && is_array($catalog["items"])
		? $catalog["items"]
		: [];
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars(
	$agvsHtmlLang,
	ENT_QUOTES,
	"UTF-8",
); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?php echo htmlspecialchars(
        	agvs_t("sitemap.pageTitle"),
        	ENT_QUOTES,
        	"UTF-8",
        ); ?>
    </title>
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
    href="./assets/css/base/reset.css"
    >
    <link
    rel="stylesheet"
    href="./assets/css/layout/layout.css?ver=20260804c"
    >
    <link
    rel="stylesheet"
    href="./assets/css/pages/sitemap.css"
    >
    <link
    rel="stylesheet"
    href="./assets/css/layout/pop.css"
    >
</head>
<body>
    <?php include __DIR__ . "/includes/layout/header.html"; ?>
    <main class="SitemapMain">
        <div class="SitemapTopBg">
            <h1>
                <?php echo htmlspecialchars(
                	agvs_t("sitemap.heading"),
                	ENT_QUOTES,
                	"UTF-8",
                ); ?>
            </h1>
        </div>
        <div class="SitemapInner">
            <nav class="SitemapGrid" aria-label="<?php echo htmlspecialchars(
            	agvs_t("sitemap.navAria"),
            	ENT_QUOTES,
            	"UTF-8",
            ); ?>">
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <span class="SitemapHeadingText">
                            <?php echo htmlspecialchars(
                            	agvs_t("sitemap.about"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </span>
                    </h2>
                    <ul class="SitemapList">
                        <li class="SitemapItem">
                            <a class="SitemapItemLink" href="Overview.php">Overview</a>
                        </li>
                        <li class="SitemapItem">
                            <a class="SitemapItemLink" href="Video.php">AGV Video</a>
                        </li>
                    </ul>
                </section>
							<?php foreach ($catalogCategories as $catalogCategoryIndex => $catalogCategory):
       	if ($catalogCategoryIndex !== 0): ?>
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <a class="SitemapHeadingLink" href="DetailList.php?category=<?php echo htmlspecialchars(
                        	rawurlencode($catalogCategory["id"]),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>">
                            <?php echo htmlspecialchars(
                            	$catalogCategory["label"],
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </a>
                    </h2>
                    <ul class="SitemapList">
									<?php foreach ($catalogItems as $catalogItem):
         	if ($catalogItem["category"] === $catalogCategory["id"]): ?>
                        <li class="SitemapItem">
                            <a class="SitemapItemLink" href="view.php?item=<?php echo htmlspecialchars(
                            	rawurlencode($catalogItem["slug"]),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>">
                                <?php echo htmlspecialchars(
                                	$catalogItem["name"],
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?>
                            </a>
                        </li>
	<?php endif;
         endforeach; ?>
                    </ul>
                </section>
<?php endif;
       endforeach; ?>
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <span class="SitemapHeadingText">
                            <?php echo htmlspecialchars(
                            	agvs_t("sitemap.support"),
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </span>
                    </h2>
                    <ul class="SitemapList">
                        <li class="SitemapItem">
                            <a class="SitemapItemLink Sec03ContactBtn" href="#">
                                <?php echo htmlspecialchars(
                                	agvs_t("sitemap.contactUs"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?>
                            </a>
                        </li>
                        <li class="SitemapItem">
                            <a class="SitemapItemLink" href="Archive.php">
                                <?php echo htmlspecialchars(
                                	agvs_t("sitemap.archive"),
                                	ENT_QUOTES,
                                	"UTF-8",
                                ); ?>
                            </a>
                        </li>
                    </ul>
                </section>
            </nav>
        </div>
    </main>
    <?php include __DIR__ . "/includes/layout/footer.html"; ?>
    <?php include __DIR__ . "/includes/layout/contactPop.html"; ?>
    <script type="module" src="./assets/js/main.js?ver=20260804b"></script>
</body>
</html>
