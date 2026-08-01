<?php
$catalog = json_decode(file_get_contents(__DIR__ . "/data/items.json"), true);
$catalogCategories = isset($catalog["categories"]) && is_array($catalog["categories"]) ? $catalog["categories"] : array();
$catalogItems = isset($catalog["items"]) && is_array($catalog["items"]) ? $catalog["items"] : array();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사이트맵 | AGVS</title>
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
    href="./stlye/reset.css?ver=20260802g"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802g"
    >
    <link
    rel="stylesheet"
    href="./stlye/Sitemap.css?ver=20260802g"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802g"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="SitemapMain">
        <div class="SitemapTopBg">
            <h1>사이트맵</h1>
        </div>
        <div class="SitemapInner">
            <nav class="SitemapGrid" aria-label="사이트맵">
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <span class="SitemapHeadingText">About</span>
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
                <?php foreach ($catalogCategories as $catalogCategoryIndex => $catalogCategory): ?>
                <?php if ($catalogCategoryIndex !== 0): ?>
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <a class="SitemapHeadingLink" href="DetailList.php?category=<?php echo htmlspecialchars(rawurlencode($catalogCategory["id"]), ENT_QUOTES, "UTF-8"); ?>"><?php echo htmlspecialchars($catalogCategory["label"], ENT_QUOTES, "UTF-8"); ?></a>
                    </h2>
                    <ul class="SitemapList">
                        <?php foreach ($catalogItems as $catalogItem): ?>
                        <?php if ($catalogItem["category"] === $catalogCategory["id"]): ?>
                        <li class="SitemapItem">
                            <a class="SitemapItemLink" href="view.php?item=<?php echo htmlspecialchars(rawurlencode($catalogItem["slug"]), ENT_QUOTES, "UTF-8"); ?>"><?php echo htmlspecialchars($catalogItem["name"], ENT_QUOTES, "UTF-8"); ?></a>
                        </li>
                        <?php endif; ?>
                        <?php endforeach; ?>
                    </ul>
                </section>
                <?php endif; ?>
                <?php endforeach; ?>
                <section class="SitemapColumn">
                    <h2 class="SitemapHeading">
                        <span class="SitemapHeadingText">Contact Us</span>
                    </h2>
                </section>
            </nav>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260802g"></script>
</body>
</html>
