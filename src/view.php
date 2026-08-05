<?php

require_once __DIR__ . "/includes/core/lang.php";

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
	$archiveItems = array_values(
		array_filter(
			$archiveItems,
			fn($item) => !array_key_exists("published", $item) ||
				$item["published"] === true,
		),
	);
	usort(
		$archiveItems,
		fn($a, $b) => ($a["sortOrder"] ?? 0) <=> ($b["sortOrder"] ?? 0),
	);
	$archiveDownloadLabel = agvs_t("archive.download");
	if ($archiveDownloadLabel === "") {
		$archiveDownloadLabelMap = [
			"KR" => "다운로드",
			"EN" => "Download",
			"JP" => "ダウンロード",
		];
		$archiveDownloadLabel = $archiveDownloadLabelMap[$agvsLang] ?? "Download";
	}
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
	$archiveAttachments =
		isset($archiveItem["attachments"]) && is_array($archiveItem["attachments"])
			? array_values(
				array_filter(
					$archiveItem["attachments"],
					fn($attachment) => !empty($attachment["path"]),
				),
			)
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
	$itemName = isset($item["name"]) ? (string) $item["name"] : "";
	// ViewModelSwitch labels are always English (not localized). Specs/images
	// stay on the page lang; KR/JP model_i18n rows remain for admin/elsewhere.
	$placeholderModelLabels = ["기본", "Standard", "標準", ""];
	$enLabelsById = [];
	$enItemName = "";
	$catalogEn = agvs_load_catalog("EN");
	$itemsEn =
		isset($catalogEn["items"]) && is_array($catalogEn["items"])
			? $catalogEn["items"]
			: [];
	foreach ($itemsEn as $candidateEn) {
		if (($candidateEn["slug"] ?? "") !== $slug) {
			continue;
		}
		$enItemName = isset($candidateEn["name"])
			? (string) $candidateEn["name"]
			: "";
		$modelsEn =
			!empty($candidateEn["models"]) && is_array($candidateEn["models"])
				? $candidateEn["models"]
				: [];
		foreach ($modelsEn as $modelEn) {
			$modelId = isset($modelEn["id"]) ? (string) $modelEn["id"] : "";
			if ($modelId === "") {
				continue;
			}
			$rawEn = isset($modelEn["label"]) ? trim((string) $modelEn["label"]) : "";
			if (
				in_array($rawEn, $placeholderModelLabels, true) &&
				$enItemName !== ""
			) {
				$enLabelsById[$modelId] = $enItemName;
			} else {
				$enLabelsById[$modelId] = $rawEn;
			}
		}
		break;
	}
	foreach ($models as &$modelOption) {
		$modelId = isset($modelOption["id"]) ? (string) $modelOption["id"] : "";
		if ($modelId !== "" && isset($enLabelsById[$modelId])) {
			$modelOption["label"] = $enLabelsById[$modelId];
			continue;
		}
		$rawLabel = isset($modelOption["label"])
			? trim((string) $modelOption["label"])
			: "";
		$fallbackName = $enItemName !== "" ? $enItemName : $itemName;
		if (
			in_array($rawLabel, $placeholderModelLabels, true) &&
			$fallbackName !== ""
		) {
			$modelOption["label"] = $fallbackName;
		} else {
			$modelOption["label"] = $rawLabel;
		}
	}
	unset($modelOption);
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
	$activeSubtitle =
		$activeModel !== null && isset($activeModel["subtitle"])
			? trim((string) $activeModel["subtitle"])
			: "";
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
    href="./assets/css/base/reset.css"
    >
    <link
    rel="stylesheet"
    href="./assets/css/layout/layout.css?ver=20260804c"
    >
    <link
    rel="stylesheet"
    href="./assets/css/pages/view.css?ver=20260805d"
    >
    <link
    rel="stylesheet"
    href="./assets/css/layout/pop.css"
    >
</head>
<body>
    <?php include __DIR__ . "/includes/layout/header.html"; ?>
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
                <?php if ($isArchiveView && !empty($archiveAttachments)): ?>
                <div class="ViewArchiveDownloads">
                    <?php if (count($archiveAttachments) < 3): ?>
                    <div class="ViewArchiveDownloadsInline">
                        <?php foreach ($archiveAttachments as $attachment): ?>
                        <?php
                        $attPath = (string) $attachment["path"];
                        $attName =
                        	(string) ($attachment["originalName"] ??
                        		basename($attPath));
                        $attLabel =
                        	$attName !== ""
                        		? $archiveDownloadLabel . " · " . $attName
                        		: $archiveDownloadLabel;
                        ?>
                        <a
                        class="ArchiveDownloadBtn"
                        href="download.php?id=<?php echo rawurlencode(
                        	$attPath,
                        ); ?>&amp;name=<?php echo rawurlencode($attName); ?>"
                        >
                            <?php echo htmlspecialchars(
                            	$attLabel,
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?>
                        </a>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                    <details class="ViewDownloadMenu">
                        <summary class="ViewDownloadMenuBtn">
                            <span class="ViewDownloadMenuIcon" aria-hidden="true">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                            <span class="ViewDownloadMenuLabel"><?php echo htmlspecialchars(
                            	$archiveDownloadLabel,
                            	ENT_QUOTES,
                            	"UTF-8",
                            ); ?></span>
                        </summary>
                        <ul class="ViewDownloadMenuList">
                            <?php foreach (
                            	$archiveAttachments
                            	as $attachment
                            ): ?>
                            <?php
                            $attPath = (string) $attachment["path"];
                            $attName =
                            	(string) ($attachment["originalName"] ??
                            		basename($attPath));
                            $attLabel =
                            	$attName !== ""
                            		? $attName
                            		: $archiveDownloadLabel;
                            ?>
                            <li>
                                <a
                                class="ViewDownloadMenuLink"
                                href="download.php?id=<?php echo rawurlencode(
                                	$attPath,
                                ); ?>&amp;name=<?php echo rawurlencode(
	$attName,
); ?>"
                                >
                                    <?php echo htmlspecialchars(
                                    	$attLabel,
                                    	ENT_QUOTES,
                                    	"UTF-8",
                                    ); ?>
                                </a>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                    </details>
                </div>
                <?php elseif (!$isArchiveView && !empty($models)): ?>
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
            <?php // Temporarily hide 부제목 (.ViewSubtitle). Field stays in model_i18n /

// seeds / admin for later re-enable — do not drop the schema.
            if (false && !$isArchiveView && $activeSubtitle !== ""): ?>
            <p class="ViewSubtitle"><?php echo htmlspecialchars(
            	$activeSubtitle,
            	ENT_QUOTES,
            	"UTF-8",
            ); ?></p>
            <?php endif; ?>
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
                    	agvs_asset_url($archiveImage),
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
                <?php elseif ($archiveBody !== ""): ?>
                <p class="ViewImageText"><?php echo htmlspecialchars(
                	$archiveBody,
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></p>
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
                    	agvs_asset_url($image["src"]),
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
    <?php include __DIR__ . "/includes/layout/footer.html"; ?>
    <?php include __DIR__ . "/includes/layout/contactPop.html"; ?>
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
    <script type="module" src="./assets/js/main.js?ver=20260804b"></script>
</body>
</html>

