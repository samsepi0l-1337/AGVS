<?php

$catalogPath = __DIR__ . "/data/videos.json";
$catalogJson = file_get_contents($catalogPath);
$catalog = json_decode($catalogJson, true);

$sectionTitle = isset($catalog["title"]) ? $catalog["title"] : "";
$videos = isset($catalog["videos"]) && is_array($catalog["videos"]) ? $catalog["videos"] : array();

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
    exit;
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
<html lang="ko">
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
    href="./stlye/reset.css?ver=20260802h"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802h"
    >
    <link
    rel="stylesheet"
    href="./stlye/Video.css?ver=20260802h"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802h"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="VideoViewMain">
        <div class="ViewTopBg">
            <p><?php echo htmlspecialchars($sectionTitle, ENT_QUOTES, "UTF-8"); ?></p>
        </div>
        <div class="ViewInner">
            <div class="ViewTitleBar">
                <h2 class="ViewName"><?php echo htmlspecialchars($video["title"], ENT_QUOTES, "UTF-8"); ?></h2>
                <p class="ViewModel"><?php echo htmlspecialchars($video["mediaLabel"], ENT_QUOTES, "UTF-8"); ?></p>
            </div>
            <div class="ViewBody">
                <?php if ($video["type"] === "youtube"): ?>
                <div class="VideoPlayer VideoPlayerYoutube">
                    <iframe
                    src="<?php echo htmlspecialchars($video["embed"], ENT_QUOTES, "UTF-8"); ?>"
                    title="<?php echo htmlspecialchars($video["title"], ENT_QUOTES, "UTF-8"); ?>"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    ></iframe>
                </div>
                <?php elseif ($video["type"] === "local"): ?>
                <div class="VideoPlayer VideoPlayerLocal">
                    <video controls preload="metadata" poster="<?php echo htmlspecialchars($video["poster"], ENT_QUOTES, "UTF-8"); ?>">
                        <source src="<?php echo htmlspecialchars($video["video"], ENT_QUOTES, "UTF-8"); ?>" type="video/mp4">
                        브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                </div>
                <?php endif; ?>
            </div>
            <div class="ViewNav">
                <div class="ViewNavSide ViewNavPrev">
                    <?php if ($prevVideo !== null): ?>
                    <a href="<?php echo htmlspecialchars("VideoView.php?item=" . rawurlencode($prevVideo["slug"]), ENT_QUOTES, "UTF-8"); ?>" class="ViewNavLink">
                        <span class="ViewNavArrow" aria-hidden="true">&#8592;</span>
                        <span class="ViewNavLabel"><?php echo htmlspecialchars($prevVideo["title"], ENT_QUOTES, "UTF-8"); ?></span>
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
                    <a href="<?php echo htmlspecialchars("VideoView.php?item=" . rawurlencode($nextVideo["slug"]), ENT_QUOTES, "UTF-8"); ?>" class="ViewNavLink">
                        <span class="ViewNavLabel"><?php echo htmlspecialchars($nextVideo["title"], ENT_QUOTES, "UTF-8"); ?></span>
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
    <script src="./js/main.js?ver=20260802h"></script>
</body>
</html>
