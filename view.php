<?php

require_once __DIR__ . "/include/lang.php";

// ── Archive mode ────────────────────────────────────────────────────────────────────────
$archiveSlug = isset($_GET["archive"])
	? $_GET["archive"]
	: (getenv("BUILD_ARCHIVE") ?:
	"");
$isArchiveView = $archiveSlug !== "";

if ($isArchiveView) {
	$archiveItems =
		isset($agvsUi["archive"]["items"]) && is_array($agvsUi["archive"]["items"])
			? $agvsUi["archive"]["items"]
			: [];
	$archiveItem = null;
	$archiveIndex = -1;
	foreach ($archiveItems as $ai => $candidate) {
		if (isset($candidate["slug"]) && $candidate["slug"] === $archiveSlug) {
			$archiveItem = $candidate;
			$archiveIndex = $ai;
			break;
		}
	}
	if ($archiveItem === null) {
		header("Location: Archive.php");
		exit();
	}
	$archivePrev = $archiveIndex > 0 ? $archiveItems[$archiveIndex - 1] : null;
	$archiveNext =
		$archiveIndex < count($archiveItems) - 1
			? $archiveItems[$archiveIndex + 1]
			: null;
	$archiveTitle = isset($archiveItem["title"]) ? $archiveItem["title"] : "";
	$archiveBody = isset($archiveItem["body"]) ? $archiveItem["body"] : "";
	$archiveImage = isset($archiveItem["image"]) ? $archiveItem["image"] : "";
	$archiveDetail =
		isset($archiveItem["detail"]) && is_array($archiveItem["detail"])
			? $archiveItem["detail"]
			: [];
	$pageTitle = $archiveTitle . " | AGVS";
} else {
	// ── Product mode ──────────────────────────────────────────────────────────────────────
	$catalog = agvs_load_catalog();

	$categories =
		isset($catalog["categories"]) && is_array($catalog["categories"])
			? $catalog["categories"]
			: [];
	$items =
		isset($catalog["items"]) && is_array($catalog["items"])
			? $catalog["items"]
			: [];

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
		exit();
	}

	$models =
		!empty($item["models"]) && is_array($item["models"]) ? $item["models"] : [];
	$activeModel = null;
	$modelParam = isset($_GET["model"]) ? $_GET["model"] : "";
	if ($modelParam !== "") {
		foreach ($models as $candidateModel) {
			if (
				isset($candidateModel["id"]) &&
				$candidateModel["id"] === $modelParam
			) {
				$activeModel = $candidateModel;
				break;
			}
		}
	}
	if ($activeModel === null && !empty($models)) {
		$activeModel = $models[0];
	}
	$activeSpecs =
		$activeModel !== null &&
		!empty($activeModel["specs"]) &&
		is_array($activeModel["specs"])
			? $activeModel["specs"]
			: [];
	$activeImages =
		$activeModel !== null &&
		!empty($activeModel["images"]) &&
		is_array($activeModel["images"])
			? $activeModel["images"]
			: [];

	$categoryTitle = $item["category"];
	foreach ($categories as $category) {
		if ($category["id"] === $item["category"]) {
			$categoryTitle = $category["title"];
			break;
		}
	}

	$siblingItems = [];
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
}
?><!DOCTYPE html>
<html lang="<?php echo htmlspecialchars(
	$agvsHtmlLang,
	ENT_QUOTES,
	"UTF-8",
); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars(
    	$pageTitle,
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
    href="./stlye/reset.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/view.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="ViewMain">
        <?php if ($isArchiveView): ?>
        <div class="ViewTopBg ViewTopBgArchive">
            <p><?php echo htmlspecialchars(
            	agvs_t("archive.bannerTitle"),
            	ENT_QUOTES,
            	"UTF-8",
            ); ?></p>
        </div>
        <?php else: ?>
        <div class="ViewTopBg ViewTopBg<?php echo htmlspecialchars(
        	ucfirst($item["category"]),
        	ENT_QUOTES,
        	"UTF-8",
        ); ?>">
            <p><?php echo htmlspecialchars(
            	$categoryTitle,
            	ENT_QUOTES,
            	"UTF-8",
            ); ?></p>
        </div>
        <?php endif; ?>
        <div class="ViewInner">
            <div class="ViewTitleBar">
                <h2 class="ViewName"><?php echo htmlspecialchars(
                	$isArchiveView ? $archiveTitle : $item["name"],
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></h2>
                <?php if (!$isArchiveView && !empty($models)): ?>
                <?php $activeModelLabel =
                	$activeModel !== null && isset($activeModel["label"])
                		? $activeModel["label"]
                		: ""; ?>
                <div class="ViewModelSwitch">
                  <button type="button" class="ViewModelSwitchBtn" aria-expanded="false" aria-haspopup="listbox" aria-label="Model">
                    <span class="ViewModelSwitchCurrent"><?php echo htmlspecialchars(
                    	$activeModelLabel,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></span>
                    <svg class="ViewModelSwitchChevron" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M7 10l5 5 5-5H7z"></path>
                    </svg>
                  </button>
                  <ul class="ViewModelSwitchMenu" role="listbox" hidden>
                    <?php foreach ($models as $modelOption): ?>
                    <?php $isActiveModel =
                    	$activeModel !== null &&
                    	$activeModel["id"] === $modelOption["id"]; ?>
                    <li role="option" <?php echo $isActiveModel
                    	? 'aria-selected="true"'
                    	: 'aria-selected="false"'; ?>>
                      <button type="button" class="ViewModelSwitchOption<?php echo $isActiveModel
                      	? " isActive"
                      	: ""; ?>" data-model="<?php echo htmlspecialchars(
	$modelOption["id"],
	ENT_QUOTES,
	"UTF-8",
); ?>">
                        <?php echo htmlspecialchars(
                        	$modelOption["label"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                      </button>
                    </li>
                    <?php endforeach; ?>
                  </ul>
                </div>
                <?php endif; ?>
            </div>
            <?php if (!$isArchiveView && !empty($activeSpecs)): ?>
            <ul class="ViewSpecList">
                <?php foreach ($activeSpecs as $spec): ?>
                <li><?php echo htmlspecialchars(
                	$spec,
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>
            <div class="ViewBody">
                <?php if ($isArchiveView): ?>
                <?php if ($archiveImage !== ""): ?>
                <div class="ViewImageGroup">
                    <img
                    class="ViewImage"
                    src="<?php echo htmlspecialchars(
                    	$archiveImage,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    alt="<?php echo htmlspecialchars(
                    	$archiveTitle,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    >
                    <?php if ($archiveBody !== ""): ?>
                    <p class="ViewImageText"><?php echo htmlspecialchars(
                    	$archiveBody,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></p>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
                <?php else: ?>
                <?php if (empty($activeImages)): ?>
                <div class="ViewImagePlaceholder">
                    <p>준비 중인 이미지입니다.</p>
                </div>
                <?php else: ?>
                <?php foreach ($activeImages as $imageIndex => $image): ?>
                <div class="ViewImageGroup">
                    <img
                    class="ViewImage"
                    src="<?php echo htmlspecialchars(
                    	$image["src"],
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    alt="<?php echo htmlspecialchars(
                    	$item["name"] . " 이미지 " . ($imageIndex + 1),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    >
                    <?php if (!empty($image["text"])): ?>
                    <p class="ViewImageText"><?php echo htmlspecialchars(
                    	$image["text"],
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></p>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>
                <?php endif; ?>
            </div>
            <?php if ($isArchiveView && !empty($archiveDetail)): ?>
            <ul class="ViewSpecList">
                <?php foreach ($archiveDetail as $detailLine): ?>
                <li><?php echo htmlspecialchars(
                	$detailLine,
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>
            <div class="ViewNav">
                <div class="ViewNavSide ViewNavPrev">
                    <?php if ($isArchiveView): ?>
                    <?php if ($archivePrev !== null): ?>
                    <a href="view.php?archive=<?php echo rawurlencode(
                    	$archivePrev["slug"],
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$archivePrev["title"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                    <?php else: ?>
                    <?php if ($prevItem !== null): ?>
                    <a href="view.php?item=<?php echo rawurlencode(
                    	$prevItem["slug"],
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$prevItem["name"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                    <?php endif; ?>
                </div>
                <div class="ViewNavCenter">
                    <?php if ($isArchiveView): ?>
                    <a href="Archive.php" class="ViewNavList"><?php echo htmlspecialchars(
                    	agvs_t("archive.listLabel"),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></a>
                    <?php else: ?>
                    <a href="DetailList.php?category=<?php echo rawurlencode(
                    	$item["category"],
                    ); ?>" class="ViewNavList">목록</a>
                    <?php endif; ?>
                </div>
                <div class="ViewNavSide ViewNavNext">
                    <?php if ($isArchiveView): ?>
                    <?php if ($archiveNext !== null): ?>
                    <a href="view.php?archive=<?php echo rawurlencode(
                    	$archiveNext["slug"],
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$archiveNext["title"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                        <span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                    <?php else: ?>
                    <?php if ($nextItem !== null): ?>
                    <a href="view.php?item=<?php echo rawurlencode(
                    	$nextItem["slug"],
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$nextItem["name"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                        <span class="ViewNavArrow" aria-hidden="true">&#8594;</span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <?php if (!$isArchiveView): ?>
    <script>
    (function () {
      var wrap = document.querySelector(".ViewModelSwitch");
      if (!wrap) return;
      var btn = wrap.querySelector(".ViewModelSwitchBtn");
      var menu = wrap.querySelector(".ViewModelSwitchMenu");
      var itemSlug = <?php echo json_encode($item["slug"]); ?>;
      function setOpen(open) {
        wrap.classList.toggle("isOpen", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        menu.hidden = !open;
      }
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(menu.hidden);
      });
      wrap.querySelectorAll(".ViewModelSwitchOption").forEach(function (opt) {
        opt.addEventListener("click", function () {
          var model = opt.getAttribute("data-model");
          var url = new URL(window.location.href);
          url.searchParams.set("item", itemSlug);
          url.searchParams.set("model", model);
          window.location.href = url.toString();
        });
      });
      document.addEventListener("click", function () { setOpen(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setOpen(false);
      });
    })();
    </script>
    <?php endif; ?>
    <script src="./js/main.js"></script>
</body>
</html>

