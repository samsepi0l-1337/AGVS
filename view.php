<?php

require_once __DIR__ . "/include/lang.php";
$catalog = agvs_load_catalog();

$categories = isset($catalog["categories"]) && is_array($catalog["categories"]) ? $catalog["categories"] : array();
$items = isset($catalog["items"]) && is_array($catalog["items"]) ? $catalog["items"] : array();

$slug = isset($_GET["item"]) ? $_GET["item"] : (getenv("BUILD_ITEM") ?: "");

$item = null;
foreach ($items as $candidate) {
    if ($candidate["slug"] === $slug) {
        $item = $candidate;
        break;
    }
}

if ($item === null) {
    header("Location: DetailList.php");
    exit;
}

$models = !empty($item["models"]) && is_array($item["models"]) ? $item["models"] : array();
$activeModel = null;
$modelParam = isset($_GET["model"]) ? $_GET["model"] : "";
if ($modelParam !== "") {
    foreach ($models as $candidateModel) {
        if (isset($candidateModel["id"]) && $candidateModel["id"] === $modelParam) {
            $activeModel = $candidateModel;
            break;
        }
    }
}
if ($activeModel === null && !empty($models)) {
    $activeModel = $models[0];
}
$activeSpecs = ($activeModel !== null && !empty($activeModel["specs"]) && is_array($activeModel["specs"]))
    ? $activeModel["specs"]
    : array();
$activeImages = ($activeModel !== null && !empty($activeModel["images"]) && is_array($activeModel["images"]))
    ? $activeModel["images"]
    : array();

$categoryTitle = $item["category"];
foreach ($categories as $category) {
    if ($category["id"] === $item["category"]) {
        $categoryTitle = $category["title"];
        break;
    }
}

$siblingItems = array();
foreach ($items as $candidate) {
    if ($candidate["category"] === $item["category"]) {
        $siblingItems[] = $candidate;
    }
}

$prevItem = null;
$nextItem = null;
foreach ($siblingItems as $siblingIndex => $sibling) {
    if ($sibling["slug"] === $item["slug"]) {
        if ($siblingIndex > 0) {
            $prevItem = $siblingItems[$siblingIndex - 1];
        }
        if ($siblingIndex < count($siblingItems) - 1) {
            $nextItem = $siblingItems[$siblingIndex + 1];
        }
        break;
    }
}

$pageTitle = $item["name"] . " | AGVS";

?><!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($agvsHtmlLang, ENT_QUOTES, "UTF-8"); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, "UTF-8"); ?></title>
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
    href="./stlye/reset.css?ver=20260802m"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802m"
    >
    <link
    rel="stylesheet"
    href="./stlye/view.css?ver=20260802m"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802m"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="ViewMain">
        <div class="ViewTopBg ViewTopBg--<?php echo htmlspecialchars($item["category"], ENT_QUOTES, "UTF-8"); ?>">
            <p><?php echo htmlspecialchars($categoryTitle, ENT_QUOTES, "UTF-8"); ?></p>
        </div>
        <div class="ViewInner">
            <div class="ViewTitleBar">
                <h2 class="ViewName"><?php echo htmlspecialchars($item["name"], ENT_QUOTES, "UTF-8"); ?></h2>
                <?php if (!empty($models)): ?>
                <select class="ViewModelSelect" aria-label="Model">
                    <?php foreach ($models as $modelOption): ?>
                    <option
                    value="<?php echo htmlspecialchars($modelOption["id"], ENT_QUOTES, "UTF-8"); ?>"
                    <?php echo ($activeModel !== null && $activeModel["id"] === $modelOption["id"]) ? " selected" : ""; ?>
                    ><?php echo htmlspecialchars($modelOption["label"], ENT_QUOTES, "UTF-8"); ?></option>
                    <?php endforeach; ?>
                </select>
                <?php endif; ?>
            </div>
            <?php if (!empty($activeSpecs)): ?>
            <ul class="ViewSpecList">
                <?php foreach ($activeSpecs as $spec): ?>
                <li><?php echo htmlspecialchars($spec, ENT_QUOTES, "UTF-8"); ?></li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>
            <div class="ViewBody">
                <?php if (empty($activeImages)): ?>
                <div class="ViewImagePlaceholder">
                    <p>준비 중인 이미지입니다.</p>
                </div>
                <?php else: ?>
                <?php foreach ($activeImages as $imageIndex => $image): ?>
                <div class="ViewImageGroup">
                    <img
                    class="ViewImage"
                    src="<?php echo htmlspecialchars($image["src"], ENT_QUOTES, "UTF-8"); ?>"
                    alt="<?php echo htmlspecialchars($item["name"] . " 이미지 " . ($imageIndex + 1), ENT_QUOTES, "UTF-8"); ?>"
                    >
                    <?php if (!empty($image["text"])): ?>
                    <p class="ViewImageText"><?php echo htmlspecialchars($image["text"], ENT_QUOTES, "UTF-8"); ?></p>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>
            </div>
            <div class="ViewNav">
                <div class="ViewNavSide ViewNavPrev">
                    <?php if ($prevItem !== null): ?>
                    <a href="view.php?item=<?php echo rawurlencode($prevItem["slug"]); ?>" class="ViewNavLink">
                        <span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
                        <span class="ViewNavLabel"><?php echo htmlspecialchars($prevItem["name"], ENT_QUOTES, "UTF-8"); ?></span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                </div>
                <div class="ViewNavCenter">
                    <a href="DetailList.php?category=<?php echo rawurlencode($item["category"]); ?>" class="ViewNavList">목록</a>
                </div>
                <div class="ViewNavSide ViewNavNext">
                    <?php if ($nextItem !== null): ?>
                    <a href="view.php?item=<?php echo rawurlencode($nextItem["slug"]); ?>" class="ViewNavLink">
                        <span class="ViewNavLabel"><?php echo htmlspecialchars($nextItem["name"], ENT_QUOTES, "UTF-8"); ?></span>
                        <span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script>
    (function () {
      var select = document.querySelector(".ViewModelSelect");
      if (!select) return;
      select.addEventListener("change", function () {
        var url = new URL(window.location.href);
        url.searchParams.set("item", <?php echo json_encode($item["slug"]); ?>);
        url.searchParams.set("model", select.value);
        window.location.href = url.toString();
      });
    })();
    </script>
    <script src="./js/main.js?ver=20260802m"></script>
</body>
</html>
