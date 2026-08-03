<?php
require_once __DIR__ . "/include/lang.php";
$archiveItems = [];
if (
	isset($agvsUi["archive"]["items"]) &&
	is_array($agvsUi["archive"]["items"])
) {
	$archiveItems = $agvsUi["archive"]["items"];
}
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
    href="./stlye/reset.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260804a"
    >
    <link
    rel="stylesheet"
    href="./stlye/Archive.css"
    >
    <link
    rel="stylesheet"
    href="./stlye/Pop.css"
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
                $itemAttachments =
                	isset($archiveItem["attachments"]) &&
                	is_array($archiveItem["attachments"])
                		? $archiveItem["attachments"]
                		: [];
                $itemAttachments = array_values(
                	array_filter(
                		$itemAttachments,
                		fn($attachment) => !empty($attachment["path"]),
                	),
                );
                ?>
                <div class="ItemWrap">
                    <a class="ItemLink" href="view.php?archive=<?php echo rawurlencode(
                    	$itemSlug,
                    ); ?>">
                        <div class="ItemThumb">
                            <?php if ($itemImage !== ""): ?>
                            <img src="<?php echo htmlspecialchars(
                            	agvs_asset_url($itemImage),
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
                    <?php if (!empty($itemAttachments)): ?>
                    <div class="ItemDownloads">
                        <?php foreach ($itemAttachments as $attachment): ?>
                        <?php
                        $attPath = (string) $attachment["path"];
                        $attName = (string) ($attachment["originalName"] ??
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
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <?php include __DIR__ . "/include/contactPop.html"; ?>
    <script src="./js/main.js?ver=20260804a"></script>
</body>
</html>
