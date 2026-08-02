<?php
require_once __DIR__ . "/include/lang.php";
$catalog = agvs_load_catalog();
$catalogCategories = isset($catalog["categories"]) && is_array($catalog["categories"]) ? $catalog["categories"] : array();
$catalogItems = isset($catalog["items"]) && is_array($catalog["items"]) ? $catalog["items"] : array();

$categoryLabels = array();
foreach ($catalogCategories as $catalogCategory) {
    $categoryLabels[$catalogCategory["id"]] = $catalogCategory["label"];
}

$initialBannerCategory = "all";
if (
    isset($_GET["category"]) &&
    is_string($_GET["category"]) &&
    array_key_exists($_GET["category"], $categoryLabels)
) {
    $initialBannerCategory = $_GET["category"];
}
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($agvsHtmlLang, ENT_QUOTES, "UTF-8"); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGVS-ItemList</title>
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
    href="./stlye/reset.css?ver=20260802n"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802n"
    >
    <link
    rel="stylesheet"
    href="./stlye/DetailList.css?ver=20260802n"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802n"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="DetailListMain">
        <div class="TopBg TopBg--<?php echo htmlspecialchars($initialBannerCategory, ENT_QUOTES, "UTF-8"); ?>"><!-- 백그라운드 이미지 넣어서 하기 백그라운드비지쓰면됨 -->
            <p><?php echo htmlspecialchars($catalogCategories[0]["title"], ENT_QUOTES, "UTF-8"); ?></p><!--tittle에따라 이름변경되어야함ex)전체,AGV-->
        </div>
        <div class="DetailListInner">
            <div class="ListTittleWrap">
                <div class="ListTittle">
                    <?php
                    $initialCategoryLabel = $categoryLabels[$initialBannerCategory] ?? $catalogCategories[0]["label"];
                    ?>
                    <div class="CategorySwitch">
                        <button
                            type="button"
                            class="CategorySwitchBtn"
                            aria-expanded="false"
                            aria-haspopup="listbox"
                            aria-label="카테고리 선택"
                        >
                            <span class="CategorySwitchCurrent"><?php echo htmlspecialchars($initialCategoryLabel, ENT_QUOTES, "UTF-8"); ?></span>
                            <svg
                                class="CategorySwitchChevron"
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
                            class="CategorySwitchMenu"
                            role="listbox"
                            hidden
                        >
                            <?php foreach ($catalogCategories as $catalogCategory): ?>
                            <?php $isInitialCategory = $catalogCategory["id"] === $initialBannerCategory; ?>
                            <li role="option" aria-selected="<?php echo $isInitialCategory ? "true" : "false"; ?>">
                                <button
                                    type="button"
                                    class="CategorySwitchOption<?php echo $isInitialCategory ? " isActive" : ""; ?>"
                                    data-category="<?php echo htmlspecialchars($catalogCategory["id"], ENT_QUOTES, "UTF-8"); ?>"
                                    data-title="<?php echo htmlspecialchars($catalogCategory["title"], ENT_QUOTES, "UTF-8"); ?>"
                                ><?php echo htmlspecialchars($catalogCategory["label"], ENT_QUOTES, "UTF-8"); ?></button>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <div class="ListTittleHidden" hidden aria-hidden="true">
                        <?php foreach ($catalogCategories as $catalogCategory): ?>
                        <?php $isInitialCategory = $catalogCategory["id"] === $initialBannerCategory; ?>
                        <button type="button"<?php echo $isInitialCategory ? ' class="isOn"' : ""; ?> data-category="<?php echo htmlspecialchars($catalogCategory["id"], ENT_QUOTES, "UTF-8"); ?>" aria-pressed="<?php echo $isInitialCategory ? "true" : "false"; ?>" data-title="<?php echo htmlspecialchars($catalogCategory["title"], ENT_QUOTES, "UTF-8"); ?>"><?php echo htmlspecialchars($catalogCategory["label"], ENT_QUOTES, "UTF-8"); ?></button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="SerchBar"><!--form태그 써서 서치바 만들기-->
                    <form class="SerchForm" role="search" onsubmit="return false;">
                        <label class="SerchLabel" for="ItemSerch">아이템 검색</label>
                        <input type="search" id="ItemSerch" class="SerchInput" placeholder="검색어를 입력해 주세요" autocomplete="off">
                        <button type="submit" class="SerchBtn" aria-label="검색"></button>
                    </form>
                </div>
            </div>
            <div class="ListItemWrap">
                <?php foreach ($catalogItems as $catalogItem): ?>
                <div class="ItemWrap" data-category="<?php echo htmlspecialchars($catalogItem["category"], ENT_QUOTES, "UTF-8"); ?>"><!--랩크기는 자유-->
                    <a href="view.php?item=<?php echo rawurlencode($catalogItem["slug"]); ?>">
                        <div class="ItemThumb"><!--320x230-->
                            <?php
                            $thumbSrc = "";
                            if (!empty($catalogItem["models"][0]["images"][0]["src"])) {
                                $thumbSrc = $catalogItem["models"][0]["images"][0]["src"];
                            }
                            ?>
                            <?php if ($thumbSrc !== ""): ?>
                            <img src="<?php echo htmlspecialchars($thumbSrc, ENT_QUOTES, "UTF-8"); ?>" alt="<?php echo htmlspecialchars($catalogItem["name"], ENT_QUOTES, "UTF-8"); ?>">
                            <?php endif; ?>
                        </div>
                        <h3>
                            <?php echo htmlspecialchars($catalogItem["name"], ENT_QUOTES, "UTF-8"); ?>
                        </h3><!--크기18px굵기700-->
                        <p class="ItemCategory"><?php echo htmlspecialchars($categoryLabels[$catalogItem["category"]], ENT_QUOTES, "UTF-8"); ?></p>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
            <p class="ListEmpty" hidden>검색 결과가 없습니다.</p>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260802n"></script>
</body>
</html>
