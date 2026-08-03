<?php
require_once __DIR__ . "/include/lang.php";
$catalog = agvs_load_videos_document();

$sectionTitle = isset($catalog["title"]) ? $catalog["title"] : "";
$videos =
	isset($catalog["videos"]) && is_array($catalog["videos"])
		? $catalog["videos"]
		: [];
$videos = array_values(
	array_filter(
		$videos,
		fn($video) => !isset($video["published"]) || $video["published"] === true,
	),
);
usort($videos, fn($a, $b) => ($a["sortOrder"] ?? 0) <=> ($b["sortOrder"] ?? 0));

$slug = isset($_GET["item"]) ? $_GET["item"] : (getenv("BUILD_ITEM") ?: "");

$video = null;
foreach ($videos as $candidate) {
	if ($candidate["slug"] === $slug) {
		$video = $candidate;
		break;
	}
}

if ($video === null) {
	header("Location: Video.php");
	exit();
}

$prevVideo = null;
$nextVideo = null;
foreach ($videos as $videoIndex => $candidate) {
	if ($candidate["slug"] === $video["slug"]) {
		if ($videoIndex > 0) {
			$prevVideo = $videos[$videoIndex - 1];
		}
		if ($videoIndex < count($videos) - 1) {
			$nextVideo = $videos[$videoIndex + 1];
		}
		break;
	}
}

$pageTitle = $video["title"] . " | AGVS";
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
    href="./stlye/layout.css?ver=20260804a"
    >
    <link
    rel="stylesheet"
    href="./stlye/Video.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="VideoViewMain">
        <div class="ViewTopBg">
            <p><?php echo htmlspecialchars(
            	$sectionTitle,
            	ENT_QUOTES,
            	"UTF-8",
            ); ?></p>
        </div>
        <div class="ViewInner">
            <div class="ViewTitleBar">
                <h2 class="ViewName"><?php echo htmlspecialchars(
                	$video["title"],
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></h2>
                <p class="ViewModel"><?php echo htmlspecialchars(
                	$video["mediaLabel"],
                	ENT_QUOTES,
                	"UTF-8",
                ); ?></p>
            </div>
            <div class="ViewBody">
                <?php if ($video["type"] === "youtube"): ?>
                <div class="VideoPlayer VideoPlayerYoutube">
                    <iframe
                    src="<?php echo htmlspecialchars(
                    	$video["embed"],
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    title="<?php echo htmlspecialchars(
                    	$video["title"],
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    ></iframe>
                </div>
                <?php elseif ($video["type"] === "local"): ?>
                <div class="VideoPlayer VideoPlayerLocal">
                    <video controls preload="metadata" poster="<?php echo htmlspecialchars(
                    	agvs_asset_url($video["poster"]),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>">
                        <source src="<?php echo htmlspecialchars(
                        	agvs_asset_url($video["video"]),
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>" type="video/mp4">
                        브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                </div>
                <?php endif; ?>
                <?php
                $videoDescriptions = [];
                if (
                	isset($video["descriptions"]) &&
                	is_array($video["descriptions"])
                ) {
                	if (isset($video["descriptions"][$agvsLang])) {
                		$rawDescription = trim(
                			(string) $video["descriptions"][$agvsLang],
                		);
                		if ($rawDescription !== "") {
                			$videoDescriptions = array_values(
                				array_filter(
                					array_map(
                						"trim",
                						preg_split("/\R/u", $rawDescription) ?: [],
                					),
                					fn($line) => $line !== "",
                				),
                			);
                		}
                	} elseif (
                		isset($video["descriptions"][$agvsLang]) &&
                		is_array($video["descriptions"][$agvsLang])
                	) {
                		$videoDescriptions = array_values(
                			array_filter(
                				array_map(
                					static fn($line) => trim((string) $line),
                					$video["descriptions"][$agvsLang],
                				),
                				fn($line) => $line !== "",
                			),
                		);
                	} elseif (
                		array_is_list($video["descriptions"])
                	) {
                		$videoDescriptions = array_values(
                			array_filter(
                				array_map("strval", $video["descriptions"]),
                				fn($line) => trim($line) !== "",
                			),
                		);
                	}
                }
                $referenceUrl = "";
                if (!empty($video["referenceUrl"])) {
                	$referenceUrl = (string) $video["referenceUrl"];
                } elseif (!empty($video["source"])) {
                	$referenceUrl = (string) $video["source"];
                }
                ?>
                <?php if (!empty($videoDescriptions)): ?>
                <ul class="ViewSpecList">
                    <?php foreach ($videoDescriptions as $descriptionLine): ?>
                    <li><?php echo htmlspecialchars(
                    	$descriptionLine,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></li>
                    <?php endforeach; ?>
                </ul>
                <?php endif; ?>
                <?php if (
                	$referenceUrl !== "" &&
                	preg_match("#^https?://#i", $referenceUrl)
                ): ?>
                <p class="VideoReference">
                    <a
                    href="<?php echo htmlspecialchars(
                    	$referenceUrl,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                        <?php echo htmlspecialchars(
                        	$referenceUrl,
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>
                    </a>
                </p>
                <?php endif; ?>
            </div>
            <div class="ViewNav">
                <div class="ViewNavSide ViewNavPrev">
                    <?php if ($prevVideo !== null): ?>
                    <a href="<?php echo htmlspecialchars(
                    	"VideoView.php?item=" . rawurlencode($prevVideo["slug"]),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$prevVideo["title"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
                    </a>
                    <?php else: ?>
                    <span class="ViewNavPlaceholder" aria-hidden="true"></span>
                    <?php endif; ?>
                </div>
                <div class="ViewNavCenter">
                    <a href="Video.php" class="ViewNavList">목록</a>
                </div>
                <div class="ViewNavSide ViewNavNext">
                    <?php if ($nextVideo !== null): ?>
                    <a href="<?php echo htmlspecialchars(
                    	"VideoView.php?item=" . rawurlencode($nextVideo["slug"]),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?>" class="ViewNavLink">
                        <span class="ViewNavLabel"><?php echo htmlspecialchars(
                        	$nextVideo["title"],
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?></span>
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
    <script src="./js/main.js?ver=20260804a"></script>
</body>
</html>
