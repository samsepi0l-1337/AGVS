<?php
require_once __DIR__ . "/../include/adminCore.php";
agvs_admin_require_login();
$type = (string) ($_GET["type"] ?? "");
if (!in_array($type, ["products", "videos", "archives"], true)) {
	http_response_code(404);
	exit("Not found");
}
$titleMap = [
	"products" => "제품",
	"videos" => "AGV 영상",
	"archives" => "자료실",
];
$error = "";

function admin_items(string $type, string $lang = "KR"): array
{
	$data = agvs_read_json(agvs_data_path($type, $lang));
	return $type === "archives"
		? $data["archive"]["items"] ?? []
		: $data[$type === "products" ? "items" : "videos"] ?? [];
}
function admin_save_items(string $type, array $items, string $lang = "KR"): void
{
	$path = agvs_data_path($type, $lang);
	$data = agvs_read_json($path);
	if ($type === "archives") {
		$data["archive"]["items"] = $items;
	} else {
		$data[$type === "products" ? "items" : "videos"] = $items;
	}
	agvs_write_json($path, $data);
}
function admin_find(array $items, string $slug): ?array
{
	foreach ($items as $item) {
		if (($item["slug"] ?? "") === $slug) {
			return $item;
		}
	}
	return null;
}
function admin_remove(array $items, string $slug): array
{
	return array_values(
		array_filter($items, fn($item) => ($item["slug"] ?? "") !== $slug),
	);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
	agvs_admin_require_csrf();
	try {
		$action = (string) ($_POST["action"] ?? "");
		$slug = agvs_slug((string) ($_POST["slug"] ?? ""));
		if ($action === "delete") {
			foreach (AGVS_LANGUAGES as $lang) {
				admin_save_items(
					$type,
					admin_remove(admin_items($type, $lang), $slug),
					$lang,
				);
			}
			header("Location: content.php?type=" . $type . "&notice=deleted");
			exit();
		}
		$existing = admin_find(admin_items($type), $slug);
		if (
			!$existing &&
			isset($_POST["originalSlug"]) &&
			$_POST["originalSlug"] !== ""
		) {
			throw new RuntimeException("Slug cannot be changed after publishing.");
		}
		$published = isset($_POST["published"]);
		$sortOrder = max(0, (int) ($_POST["sortOrder"] ?? 0));
		$shared = [
			"slug" => $slug,
			"published" => $published,
			"sortOrder" => $sortOrder,
		];
		if ($type === "products") {
			$category = agvs_slug((string) ($_POST["category"] ?? ""));
			$model = [
				"id" => agvs_slug((string) ($_POST["modelId"] ?? "default")),
				"label" => "",
				"specs" => [],
				"images" => [],
			];
			if (!empty($_FILES["media"]["name"])) {
				$uploaded = agvs_upload($_FILES["media"], "image");
				$model["images"][] = ["src" => $uploaded["path"], "text" => ""];
			}
			foreach (AGVS_LANGUAGES as $lang) {
				$items = admin_remove(admin_items($type, $lang), $slug);
				$model["label"] = trim((string) ($_POST["modelLabel_" . $lang] ?? ""));
				$model["specs"] = array_values(
					array_filter(
						array_map(
							"trim",
							preg_split("/\R/", (string) ($_POST["specs_" . $lang] ?? "")),
						),
					),
				);
				$record = array_merge($shared, [
					"name" => trim((string) ($_POST["name_" . $lang] ?? "")),
					"category" => $category,
					"source" => "",
					"models" => [$model],
				]);
				if ($record["name"] === "" || $model["label"] === "") {
					throw new RuntimeException(
						"All language product and model names are required.",
					);
				}
				$items[] = $record;
				admin_save_items($type, $items, $lang);
			}
		} elseif ($type === "videos") {
			$kind = (string) ($_POST["mediaType"] ?? "youtube");
			$record = array_merge($shared, [
				"title" => trim((string) $_POST["title"]),
				"mediaLabel" => $kind === "youtube" ? "YouTube" : "MP4",
				"type" => $kind,
				"thumbnail" => "",
				"source" => trim((string) ($_POST["referenceUrl"] ?? "")),
				"descriptions" => [],
			]);
			if ($record["title"] === "") {
				throw new RuntimeException("Title is required.");
			}
			if ($kind === "youtube") {
				$record["embed"] = trim((string) ($_POST["embed"] ?? ""));
				if (
					!str_starts_with($record["embed"], "https://www.youtube.com/embed/")
				) {
					throw new RuntimeException("Use a YouTube embed URL.");
				}
			} else {
				if (empty($_FILES["media"]["name"])) {
					throw new RuntimeException("MP4 upload is required.");
				}
				$file = agvs_upload($_FILES["media"], "video");
				$record["video"] = $file["path"];
				$record["poster"] = "";
			}
			foreach (AGVS_LANGUAGES as $lang) {
				$record["descriptions"][$lang] = trim(
					(string) ($_POST["description_" . $lang] ?? ""),
				);
			}
			$items = admin_remove(admin_items($type), $slug);
			$items[] = $record;
			admin_save_items($type, $items);
		} else {
			$attachments = $existing["attachments"] ?? [];
			if (!empty($_FILES["media"]["name"])) {
				$attachments[] = agvs_upload($_FILES["media"], "document");
			}
			foreach (AGVS_LANGUAGES as $lang) {
				$items = admin_remove(admin_items($type, $lang), $slug);
				$record = array_merge($shared, [
					"title" => trim((string) ($_POST["title_" . $lang] ?? "")),
					"body" => trim((string) ($_POST["summary_" . $lang] ?? "")),
					"image" => "",
					"detail" => [],
					"attachments" => $attachments,
				]);
				if ($record["title"] === "") {
					throw new RuntimeException(
						"All language archive titles are required.",
					);
				}
				$items[] = $record;
				admin_save_items($type, $items, $lang);
			}
		}
		header("Location: content.php?type=" . $type . "&notice=saved");
		exit();
	} catch (Throwable $exception) {
		$error = $exception->getMessage();
	}
}

$editSlug = (string) ($_GET["edit"] ?? "");
$edit = $editSlug ? admin_find(admin_items($type), $editSlug) : null;
agvs_admin_header($titleMap[$type] . " 관리");
?>
<h1><?= $titleMap[$type] ?> 관리</h1><?php if (
 	$error
 ): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<?php
if (
	!$editSlug
): ?><div class="toolbar"><span>등록된 항목을 수정하거나 새 콘텐츠를 만듭니다.</span><a class="button" href="content.php?type=<?= $type ?>&edit=new">새로 등록</a></div><table><tr><th>제목</th><th>Slug</th><th>공개</th><th></th></tr><?php foreach (
	admin_items($type)
	as $item
): ?><tr><td><?= htmlspecialchars(
	$item[$type === "products" ? "name" : "title"] ?? "",
) ?></td><td><?= htmlspecialchars(
	$item["slug"] ?? "",
) ?></td><td><?= !array_key_exists("published", $item) || $item["published"]
	? "게시"
	: "비공개" ?></td><td><a href="content.php?type=<?= $type ?>&edit=<?= rawurlencode(
	$item["slug"],
) ?>">수정</a></td></tr><?php endforeach; ?></table><?php else: ?>
<form class="panel" method="post" enctype="multipart/form-data"><input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>"><input type="hidden" name="action" value="save"><input type="hidden" name="originalSlug" value="<?= htmlspecialchars(
	$edit["slug"] ?? "",
) ?>"><label>Slug<input name="slug" required value="<?= htmlspecialchars(
	$edit["slug"] ?? "",
) ?>" <?= $edit
	? "readonly"
	: "" ?>></label><label><input type="checkbox" name="published" <?= !$edit ||
!array_key_exists("published", $edit) ||
$edit["published"]
	? "checked"
	: "" ?>> 공개</label><label>정렬 순서<input type="number" name="sortOrder" value="<?= (int) ($edit[
	"sortOrder"
] ?? 0) ?>"></label>
<?php if (
	$type === "products"
): ?><label>카테고리 ID<input name="category" required value="<?= htmlspecialchars(
	$edit["category"] ?? "agv",
) ?>"></label><label>모델 ID<input name="modelId" required value="<?= htmlspecialchars(
	$edit["models"][0]["id"] ?? "default",
) ?>"></label><?php foreach (
	AGVS_LANGUAGES
	as $lang
): ?><fieldset><legend><?= $lang ?></legend><label>제품명<input name="name_<?= $lang ?>" required value="<?= htmlspecialchars(
	$edit ? admin_find(admin_items($type, $lang), $editSlug)["name"] ?? "" : "",
) ?>"></label><label>모델명<input name="modelLabel_<?= $lang ?>" required value="<?= htmlspecialchars(
	$edit
		? admin_find(admin_items($type, $lang), $editSlug)["models"][0]["label"] ??
			""
		: "",
) ?>"></label><label>사양 (줄마다 하나)<textarea name="specs_<?= $lang ?>"><?= htmlspecialchars(
	$edit
		? implode(
			"\n",
			admin_find(admin_items($type, $lang), $editSlug)["models"][0]["specs"] ??
				[],
		)
		: "",
) ?></textarea></label></fieldset><?php endforeach; ?><label>제품 이미지<input type="file" name="media" accept="image/jpeg,image/png,image/webp"></label>
<?php elseif (
	$type === "videos"
): ?><label>제목<input name="title" required value="<?= htmlspecialchars(
	$edit["title"] ?? "",
) ?>"></label><label>형식<select name="mediaType"><option value="youtube">YouTube</option><option value="local">MP4 업로드</option></select></label><label>YouTube Embed URL<input name="embed" value="<?= htmlspecialchars(
	$edit["embed"] ?? "",
) ?>"></label><label>참조 URL<input type="url" name="referenceUrl" value="<?= htmlspecialchars(
	$edit["source"] ?? "",
) ?>"></label><label>MP4 파일<input type="file" name="media" accept="video/mp4"></label><?php foreach (
	AGVS_LANGUAGES
	as $lang
): ?><label><?= $lang ?> 설명<textarea name="description_<?= $lang ?>"><?= htmlspecialchars(
	$edit["descriptions"][$lang] ?? "",
) ?></textarea></label><?php endforeach; ?>
<?php else:foreach (AGVS_LANGUAGES as $lang):
		$local = $edit
			? admin_find(admin_items($type, $lang), $editSlug)
			: []; ?><fieldset><legend><?= $lang ?></legend><label>제목<input name="title_<?= $lang ?>" required value="<?= htmlspecialchars(
	$local["title"] ?? "",
) ?>"></label><label>요약/본문<textarea name="summary_<?= $lang ?>"><?= htmlspecialchars(
	$local["body"] ?? "",
) ?></textarea></label></fieldset><?php
	endforeach; ?><label>PDF 또는 Excel 첨부<input type="file" name="media" accept="application/pdf,.xls,.xlsx"></label><?php if (
	!empty($edit["attachments"])
): ?><p>첨부: <?= htmlspecialchars(
	implode(", ", array_column($edit["attachments"], "originalName")),
) ?></p><?php endif;endif; ?><button>저장</button></form><?php if (
	$edit
): ?><form method="post" onsubmit="return confirm('삭제할까요?')"><input type="hidden" name="csrfToken" value="<?= agvs_admin_csrf() ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="slug" value="<?= htmlspecialchars(
	$edit["slug"],
) ?>"><button>삭제</button></form><?php endif;endif;
agvs_admin_footer();

