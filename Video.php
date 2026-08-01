<?php
$catalog = json_decode(file_get_contents(__DIR__ . "/data/videos.json"), true);
$sectionTitle = isset($catalog["title"]) ? $catalog["title"] : "";
$videos = isset($catalog["videos"]) && is_array($catalog["videos"]) ? $catalog["videos"] : array();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGVS-Video</title>
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
    <main class="VideoMain">
        <div class="TopBg">
            <p><?php echo htmlspecialchars($sectionTitle, ENT_QUOTES, "UTF-8"); ?></p>
        </div>
        <div class="VideoInner">
            <div class="ListTittleWrap">
                <div class="ListTittle">
                    <h2><?php echo htmlspecialchars($sectionTitle, ENT_QUOTES, "UTF-8"); ?></h2>
                </div>
            </div>
            <div class="ListItemWrap">
                <?php foreach ($videos as $video): ?>
                <div class="ItemWrap">
                    <a href="<?php echo htmlspecialchars("VideoView.php?item=" . rawurlencode($video["slug"]), ENT_QUOTES, "UTF-8"); ?>">
                        <div class="ItemThumb">
                            <img src="<?php echo htmlspecialchars($video["thumbnail"], ENT_QUOTES, "UTF-8"); ?>" alt="<?php echo htmlspecialchars($video["title"], ENT_QUOTES, "UTF-8"); ?>">
                        </div>
                        <h3>
                            <?php echo htmlspecialchars($video["title"], ENT_QUOTES, "UTF-8"); ?>
                        </h3>
                        <p class="ItemCategory"><?php echo htmlspecialchars($video["mediaLabel"], ENT_QUOTES, "UTF-8"); ?></p>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260802h"></script>
</body>
</html>
