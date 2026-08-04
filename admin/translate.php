<?php
require_once __DIR__ . "/../include/adminCore.php";
agvs_admin_require_login();

$type = (string) ($_GET["type"] ?? "");
$lang = strtoupper((string) ($_GET["lang"] ?? "EN"));
$editSlug = (string) ($_GET["edit"] ?? "");
$allowedTypes = ["ui", "products", "archives", "videos"];
$error = "";
$notice = (string) ($_GET["notice"] ?? "");

if ($lang !== "" && !in_array($lang, AGVS_LANGUAGES, true)) {
	$lang = "EN";
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
	agvs_admin_require_csrf();
	try {
		$postType = (string) ($_POST["type"] ?? "");
		$postLang = agvs_admin_require_lang((string) ($_POST["lang"] ?? ""));
		$slug = (string) ($_POST["slug"] ?? "");
		agvs_backup_sqlite();

		if ($postType === "ui") {
			$raw = (string) ($_POST["payloadJson"] ?? "");
			$decoded = json_decode($raw, true);
			if (!is_array($decoded) || array_is_list($decoded)) {
				throw new RuntimeException("UI payload must be a JSON object.");
			}
			agvs_admin_upsert_ui_document($postLang, $decoded);
			header(
				"Location: translate.php?type=ui&lang=" .
					rawurlencode($postLang) .
					"&notice=saved",
			);
			exit();
		}

		if ($postType === "products") {
			$slug = agvs_slug($slug);
			$existing = agvs_find_by_slug(
				agvs_admin_load_items("products", $postLang),
				$slug,
			);
			if (!$existing) {
				throw new RuntimeException("Product not found: $slug");
			}
			$models = [];
			foreach ($existing["models"] ?? [] as $i => $model) {
				$modelId = (string) ($model["id"] ?? "");
				$specs = array_values(
					array_filter(
						array_map(
							"trim",
							preg_split("/\R/", (string) ($_POST["specs_" . $i] ?? "")) ?: [],
						),
						fn($line) => $line !== "",
					),
				);
				$models[] = [
					"id" => $modelId,
					"label" => trim((string) ($_POST["modelLabel_" . $i] ?? "")),
					"specs" => $specs,
				];
			}
			agvs_admin_upsert_product_i18n($slug, $postLang, [
				"name" => trim((string) ($_POST["name"] ?? "")),
				"models" => $models,
			]);
			header(
				"Location: translate.php?type=products&lang=" .
					rawurlencode($postLang) .
					"&edit=" .
					rawurlencode($slug) .
					"&notice=saved",
			);
			exit();
		}

		if ($postType === "archives") {
			$slug = agvs_slug($slug);
			$detail = array_values(
				array_filter(
					array_map(
						"trim",
						preg_split("/\R/", (string) ($_POST["detail"] ?? "")) ?: [],
					),
					fn($line) => $line !== "",
				),
			);
			agvs_admin_upsert_archive_i18n($slug, $postLang, [
				"title" => trim((string) ($_POST["title"] ?? "")),
				"body" => trim((string) ($_POST["body"] ?? "")),
				"detail" => $detail,
			]);
			header(
				"Location: translate.php?type=archives&lang=" .
					rawurlencode($postLang) .
					"&edit=" .
					rawurlencode($slug) .
					"&notice=saved",
			);
			exit();
		}

		if ($postType === "videos") {
			$slug = agvs_slug($slug);
			agvs_admin_upsert_video_i18n($slug, $postLang, [
				"description" => trim((string) ($_POST["description"] ?? "")),
			]);
			header(
				"Location: translate.php?type=videos&lang=" .
					rawurlencode($postLang) .
					"&edit=" .
					rawurlencode($slug) .
					"&notice=saved",
			);
			exit();
		}

		throw new RuntimeException("Unknown translation type.");
	} catch (Throwable $exception) {
		$error = $exception->getMessage();
		$type = (string) ($_POST["type"] ?? $type);
		$lang = strtoupper((string) ($_POST["lang"] ?? $lang));
		$editSlug = (string) ($_POST["slug"] ?? $editSlug);
	}
}

$typeLabels = [
	"ui" => "UI 문구",
	"products" => "제품",
	"archives" => "자료실",
	"videos" => "AGV 영상",
];

agvs_admin_header("번역");
?>
<h1>번역 (i18n only)</h1>
<p>언어별 문구만 수정합니다. 슬러그·미디어·정렬·공개 여부는 <a href="content.php?type=products">구조/미디어 관리</a>에서 다룹니다.</p>
<?php if ($error): ?><p class="error"><?= htmlspecialchars(
	$error,
) ?></p><?php endif; ?>
<?php if (
	$notice === "saved"
): ?><p class="notice">저장되었습니다.</p><?php endif; ?>

<form class="panel translatePick" method="get">
	<label>유형
		<select name="type">
			<option value="">선택…</option>
			<?php foreach ($typeLabels as $key => $label): ?>
			<option value="<?= $key ?>" <?= $type === $key
	? "selected"
	: "" ?>><?= htmlspecialchars($label) ?></option>
			<?php endforeach; ?>
		</select>
	</label>
	<label>언어
		<select name="lang">
			<?php foreach (AGVS_LANGUAGES as $code): ?>
			<option value="<?= $code ?>" <?= $lang === $code
	? "selected"
	: "" ?>><?= $code ?></option>
			<?php endforeach; ?>
		</select>
	</label>
	<button type="submit">열기</button>
</form>

<?php
if ($type && in_array($type, $allowedTypes, true)): ?>

<?php if ($type === "ui"):

	$ui = agvs_admin_load_ui_document($lang);
	$refUi = $lang !== "KR" ? agvs_admin_load_ui_document("KR") : null;
	?>
<div class="toolbar"><strong>UI 문서 · <?= htmlspecialchars($lang) ?></strong>
	<span>archive.items 는 저장 시 비워지며, 자료실 본문은 자료실 번역에서 편집합니다.</span>
</div>
<form class="panel" method="post">
	<input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>">
	<input type="hidden" name="type" value="ui">
	<input type="hidden" name="lang" value="<?= htmlspecialchars($lang) ?>">
	<?php if ($refUi): ?>
	<label>KR 참고 (읽기 전용)<textarea readonly class="ref"><?= htmlspecialchars(
 	json_encode($refUi, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
 ) ?></textarea></label>
	<?php endif; ?>
	<label><?= htmlspecialchars($lang) ?> payload_json
		<textarea name="payloadJson" required class="code"><?= htmlspecialchars(
  	json_encode($ui, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
  ) ?></textarea>
	</label>
	<button>저장</button>
</form>

<?php
elseif (!$editSlug):

	$listType =
		$type === "products"
			? "products"
			: ($type === "videos"
				? "videos"
				: "archives");
	$items = agvs_admin_load_items($listType, $lang);
	?>
<div class="toolbar"><strong><?= htmlspecialchars(
	$typeLabels[$type],
) ?> · <?= htmlspecialchars($lang) ?></strong>
	<a class="button" href="translate.php">유형 다시 선택</a>
</div>
<table>
	<tr><th>제목</th><th>Slug</th><th></th></tr>
	<?php foreach ($items as $item):
 	$title =
 		$type === "products"
 			? (string) ($item["name"] ?? "")
 			: (string) ($item["title"] ?? ""); ?>
	<tr>
		<td><?= htmlspecialchars($title) ?></td>
		<td><?= htmlspecialchars((string) ($item["slug"] ?? "")) ?></td>
		<td><a href="translate.php?type=<?= rawurlencode(
  	$type,
  ) ?>&lang=<?= rawurlencode($lang) ?>&edit=<?= rawurlencode(
	(string) $item["slug"],
) ?>">번역</a></td>
	</tr>
	<?php
 endforeach; ?>
</table>

<?php
else:
	$slug = $editSlug;
	if ($type === "products") {
		$item = agvs_find_by_slug(agvs_admin_load_items("products", $lang), $slug);
		$ref =
			$lang !== "KR"
				? agvs_find_by_slug(agvs_admin_load_items("products", "KR"), $slug)
				: null;
		if (!$item) {
			echo '<p class="error">항목을 찾을 수 없습니다.</p>';
		} else {
			 ?>
<div class="toolbar"><strong>제품 번역 · <?= htmlspecialchars(
	$lang,
) ?> · <?= htmlspecialchars($slug) ?></strong>
	<a href="translate.php?type=products&lang=<?= rawurlencode($lang) ?>">목록</a>
</div>
<form class="panel" method="post">
	<input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>">
	<input type="hidden" name="type" value="products">
	<input type="hidden" name="lang" value="<?= htmlspecialchars($lang) ?>">
	<input type="hidden" name="slug" value="<?= htmlspecialchars($slug) ?>">
	<p class="muted">공유 필드(카테고리·썸네일·이미지·정렬·공개)는 변경되지 않습니다.</p>
	<?php if ($ref): ?>
	<fieldset class="refBox"><legend>KR 참고</legend>
		<p>제품명: <?= htmlspecialchars((string) ($ref["name"] ?? "")) ?></p>
		<?php foreach ($ref["models"] ?? [] as $refModel): ?>
		<p>모델 <?= htmlspecialchars((string) ($refModel["id"] ?? "")) ?>:
			<?= htmlspecialchars((string) ($refModel["label"] ?? "")) ?></p>
		<pre><?= htmlspecialchars(implode("\n", $refModel["specs"] ?? [])) ?></pre>
		<?php endforeach; ?>
	</fieldset>
	<?php endif; ?>
	<label>제품명<input name="name" required value="<?= htmlspecialchars(
 	(string) ($item["name"] ?? ""),
 ) ?>"></label>
	<?php foreach ($item["models"] ?? [] as $i => $model): ?>
	<fieldset>
		<legend>모델 <code><?= htmlspecialchars(
  	(string) ($model["id"] ?? ""),
  ) ?></code></legend>
		<label>모델명<input name="modelLabel_<?= (int) $i ?>" required value="<?= htmlspecialchars(
	(string) ($model["label"] ?? ""),
) ?>"></label>
		<label>사양 (줄마다 하나)<textarea name="specs_<?= (int) $i ?>"><?= htmlspecialchars(
	implode("\n", $model["specs"] ?? []),
) ?></textarea></label>
	</fieldset>
	<?php endforeach; ?>
	<button>저장</button>
</form>
			<?php
		}
	} elseif ($type === "archives") {
		$item = agvs_find_by_slug(agvs_admin_load_items("archives", $lang), $slug);
		$ref =
			$lang !== "KR"
				? agvs_find_by_slug(agvs_admin_load_items("archives", "KR"), $slug)
				: null;
		if (!$item) {
			echo '<p class="error">항목을 찾을 수 없습니다.</p>';
		} else {
			 ?>
<div class="toolbar"><strong>자료실 번역 · <?= htmlspecialchars(
	$lang,
) ?> · <?= htmlspecialchars($slug) ?></strong>
	<a href="translate.php?type=archives&lang=<?= rawurlencode($lang) ?>">목록</a>
</div>
<form class="panel" method="post">
	<input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>">
	<input type="hidden" name="type" value="archives">
	<input type="hidden" name="lang" value="<?= htmlspecialchars($lang) ?>">
	<input type="hidden" name="slug" value="<?= htmlspecialchars($slug) ?>">
	<p class="muted">이미지·첨부·정렬·공개는 변경되지 않습니다.</p>
	<?php if ($ref): ?>
	<fieldset class="refBox"><legend>KR 참고</legend>
		<p><?= htmlspecialchars((string) ($ref["title"] ?? "")) ?></p>
		<pre><?= htmlspecialchars((string) ($ref["body"] ?? "")) ?></pre>
		<pre><?= htmlspecialchars(implode("\n", $ref["detail"] ?? [])) ?></pre>
	</fieldset>
	<?php endif; ?>
	<label>제목<input name="title" required value="<?= htmlspecialchars(
 	(string) ($item["title"] ?? ""),
 ) ?>"></label>
	<label>요약/본문<textarea name="body"><?= htmlspecialchars(
 	(string) ($item["body"] ?? ""),
 ) ?></textarea></label>
	<label>상세 내용 (줄마다 하나)<textarea name="detail"><?= htmlspecialchars(
 	implode("\n", $item["detail"] ?? []),
 ) ?></textarea></label>
	<button>저장</button>
</form>
			<?php
		}
	} else {
		$item = agvs_find_by_slug(agvs_admin_load_items("videos", $lang), $slug);
		if (!$item) {
			echo '<p class="error">항목을 찾을 수 없습니다.</p>';
		} else {
			$refDesc =
				$lang !== "KR" ? (string) ($item["descriptions"]["KR"] ?? "") : ""; ?>
<div class="toolbar"><strong>영상 번역 · <?= htmlspecialchars(
	$lang,
) ?> · <?= htmlspecialchars($slug) ?></strong>
	<a href="translate.php?type=videos&lang=<?= rawurlencode($lang) ?>">목록</a>
</div>
<form class="panel" method="post">
	<input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>">
	<input type="hidden" name="type" value="videos">
	<input type="hidden" name="lang" value="<?= htmlspecialchars($lang) ?>">
	<input type="hidden" name="slug" value="<?= htmlspecialchars($slug) ?>">
	<p class="muted">제목·미디어 URL·공개는 공유 필드입니다. 여기서는 설명만 수정합니다.</p>
	<label>제목 (공유, 읽기 전용)<input value="<?= htmlspecialchars(
 	(string) ($item["title"] ?? ""),
 ) ?>" readonly></label>
	<?php if ($refDesc !== ""): ?>
	<label>KR 설명 (참고)<textarea readonly class="ref"><?= htmlspecialchars(
 	$refDesc,
 ) ?></textarea></label>
	<?php endif; ?>
	<label><?= htmlspecialchars(
 	$lang,
 ) ?> 설명<textarea name="description"><?= htmlspecialchars(
 	(string) ($item["descriptions"][$lang] ?? ""),
 ) ?></textarea></label>
	<button>저장</button>
</form>
			<?php
		}
	}
endif; ?>

<?php endif;
agvs_admin_footer();

