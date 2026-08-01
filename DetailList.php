<?php
$catalog = json_decode(file_get_contents(__DIR__ . "/data/items.json"), true);
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
<html lang="ko">
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
    href="./stlye/reset.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/DetailList.css?ver=20260802e"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802e"
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
                    <ul><!--선택자 잡아서 전체 주거공간 사이에 ㅣ 만들기 마지막 선택자 잡아서 없애기 nth-of-type쓰면됨-->
                        <?php foreach ($catalogCategories as $catalogCategoryIndex => $catalogCategory): ?>
                        <li>
                            <button type="button"<?php echo $catalogCategoryIndex === 0 ? ' class="isOn"' : ""; ?> data-category="<?php echo htmlspecialchars($catalogCategory["id"], ENT_QUOTES, "UTF-8"); ?>" aria-pressed="<?php echo $catalogCategoryIndex === 0 ? "true" : "false"; ?>" data-title="<?php echo htmlspecialchars($catalogCategory["title"], ENT_QUOTES, "UTF-8"); ?>"><?php echo htmlspecialchars($catalogCategory["label"], ENT_QUOTES, "UTF-8"); ?></button>
                        </li>
                        <?php endforeach; ?><!--라스트차일드 쓰면됨-->
                    </ul>
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
                            <?php if (!empty($catalogItem["images"])): ?>
                            <img src="<?php echo htmlspecialchars($catalogItem["images"][0]["src"], ENT_QUOTES, "UTF-8"); ?>" alt="<?php echo htmlspecialchars($catalogItem["name"], ENT_QUOTES, "UTF-8"); ?>">
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
    <script src="./js/main.js?ver=20260802e"></script>
</body>
</html>
