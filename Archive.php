<?php
require_once __DIR__ . "/include/lang.php";
$archiveItems = [];
if (
	isset($agvsUi["archive"]["items"]) &&
	is_array($agvsUi["archive"]["items"])
) {
	$archiveItems = $agvsUi["archive"]["items"];
}
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
    <title><?php echo htmlspecialchars(
    	agvs_t("archive.pageTitle"),
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
    href="./stlye/reset.css?ver=20260802q"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260802q"
    >
    <link
    rel="stylesheet"
    href="./stlye/Archive.css?ver=20260802q"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css?ver=20260802q"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="ArchiveMain">
        <div class="TopBg">
            <p><?php echo htmlspecialchars(
            	agvs_t("archive.bannerTitle"),
            	ENT_QUOTES,
            	"UTF-8",
            ); ?></p>
        </div>
        <div class="ArchiveInner">
            <div class="ListTitleWrap">
                <div class="ListTitle">
                    <h2><?php echo htmlspecialchars(
                    	agvs_t("archive.listTitle"),
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></h2>
                </div>
            </div>
            <div class="ListItemWrap">
                <?php foreach ($archiveItems as $archiveItem): ?>
                <?php
                $itemTitle = isset($archiveItem["title"])
                	? $archiveItem["title"]
                	: "";
                $itemBody = isset($archiveItem["body"])
                	? $archiveItem["body"]
                	: "";
                $itemImage = isset($archiveItem["image"])
                	? $archiveItem["image"]
                	: "";
                $itemSlug = isset($archiveItem["slug"])
                	? $archiveItem["slug"]
                	: "";
                ?>
                <a class="ItemWrap" href="view.php?archive=<?php echo rawurlencode(
                	$itemSlug,
                ); ?>">
                    <div class="ItemThumb">
                        <?php if ($itemImage !== ""): ?>
                        <img src="<?php echo htmlspecialchars(
                        	$itemImage,
                        	ENT_QUOTES,
                        	"UTF-8",
                        ); ?>" alt="<?php echo htmlspecialchars(
	$itemTitle,
	ENT_QUOTES,
	"UTF-8",
); ?>">
                        <?php endif; ?>
                    </div>
                    <h3><?php echo htmlspecialchars(
                    	$itemTitle,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></h3>
                    <p class="ItemBody"><?php echo htmlspecialchars(
                    	$itemBody,
                    	ENT_QUOTES,
                    	"UTF-8",
                    ); ?></p>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260802q"></script>
</body>
</html>
