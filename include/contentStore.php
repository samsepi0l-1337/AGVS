<?php

declare(strict_types=1);

require_once __DIR__ . "/db.php";

/**
 * Public + admin content store over SQLite.
 * Array shapes match the former items/ui/videos JSON documents.
 */

function agvs_store_ready(): bool
{
	return is_file(AGVS_DB_PATH) && filesize(AGVS_DB_PATH) > 0;
}

function agvs_store_require(): PDO
{
	if (!agvs_store_ready()) {
		throw new RuntimeException(
			"SQLite content DB missing. Run: php scripts/rebuild-sqlite.php",
		);
	}
	$pdo = agvs_db();
	agvs_db_install_schema($pdo);
	return $pdo;
}

function agvs_load_catalog(?string $lang = null): array
{
	global $agvsLang;
	$lang = strtoupper($lang ?? ($agvsLang ?? "KR"));
	if (!in_array($lang, ["KR", "EN", "JP"], true)) {
		$lang = "KR";
	}
	$pdo = agvs_store_require();

	$categories = [];
	$catStmt = $pdo->prepare(
		"SELECT c.id, c.sort_order, i.label, i.title
		 FROM categories c
		 JOIN category_i18n i ON i.category_id = c.id AND i.lang = :lang
		 ORDER BY c.sort_order ASC, c.id ASC",
	);
	$catStmt->execute(["lang" => $lang]);
	foreach ($catStmt as $row) {
		$categories[] = [
			"id" => $row["id"],
			"label" => $row["label"],
			"title" => $row["title"],
		];
	}

	$items = [];
	$itemStmt = $pdo->prepare(
		"SELECT i.slug, i.category_id, i.source, i.thumbnail, i.published, i.sort_order, t.name
		 FROM items i
		 JOIN item_i18n t ON t.slug = i.slug AND t.lang = :lang
		 ORDER BY i.sort_order ASC, i.slug ASC",
	);
	$itemStmt->execute(["lang" => $lang]);
	$modelStmt = $pdo->prepare(
		"SELECT id, model_key, sort_order FROM models
		 WHERE item_slug = :slug ORDER BY sort_order ASC, id ASC",
	);
	$modelI18nStmt = $pdo->prepare(
		"SELECT label, specs_json FROM model_i18n
		 WHERE model_row_id = :id AND lang = :lang",
	);
	$imageStmt = $pdo->prepare(
		"SELECT src, alt_text FROM model_images
		 WHERE model_row_id = :id ORDER BY sort_order ASC, id ASC",
	);

	foreach ($itemStmt as $row) {
		$modelStmt->execute(["slug" => $row["slug"]]);
		$models = [];
		foreach ($modelStmt as $modelRow) {
			$modelI18nStmt->execute([
				"id" => $modelRow["id"],
				"lang" => $lang,
			]);
			$i18n = $modelI18nStmt->fetch() ?: [
				"label" => "",
				"specs_json" => "[]",
			];
			$imageStmt->execute(["id" => $modelRow["id"]]);
			$images = [];
			foreach ($imageStmt as $img) {
				$images[] = [
					"src" => $img["src"],
					"text" => $img["alt_text"],
				];
			}
			$models[] = [
				"id" => $modelRow["model_key"],
				"label" => $i18n["label"],
				"specs" => agvs_json_decode_array($i18n["specs_json"]),
				"images" => $images,
			];
		}
		$thumbnail = agvs_normalize_media_path((string) $row["thumbnail"]);
		if ($thumbnail === "" && !empty($models[0]["images"][0]["src"])) {
			$thumbnail = agvs_normalize_media_path(
				(string) $models[0]["images"][0]["src"],
			);
		}
		$items[] = [
			"slug" => $row["slug"],
			"name" => $row["name"],
			"category" => $row["category_id"],
			"source" => $row["source"],
			"thumbnail" => $thumbnail,
			"published" => ((int) $row["published"]) === 1,
			"sortOrder" => (int) $row["sort_order"],
			"models" => $models,
		];
	}

	return [
		"categories" => $categories,
		"items" => $items,
	];
}

function agvs_load_ui(?string $lang = null): array
{
	global $agvsLang;
	$lang = strtoupper($lang ?? ($agvsLang ?? "KR"));
	if (!in_array($lang, ["KR", "EN", "JP"], true)) {
		$lang = "KR";
	}
	$pdo = agvs_store_require();
	$stmt = $pdo->prepare(
		"SELECT payload_json FROM ui_documents WHERE lang = :lang",
	);
	$stmt->execute(["lang" => $lang]);
	$row = $stmt->fetch();
	$ui = $row ? agvs_json_decode_array($row["payload_json"], []) : [];

	if (!isset($ui["archive"]) || !is_array($ui["archive"])) {
		$ui["archive"] = [];
	}
	$ui["archive"]["items"] = agvs_load_archive_items($lang, false);
	return $ui;
}

function agvs_load_archive_items(
	string $lang,
	bool $publishedOnly = false,
): array {
	$pdo = agvs_store_require();
	$sql =
		"SELECT a.slug, a.image, a.thumbnail, a.attachments_json, a.published, a.sort_order,
		        t.title, t.body, t.detail_json
		 FROM archives a
		 JOIN archive_i18n t ON t.slug = a.slug AND t.lang = :lang";
	if ($publishedOnly) {
		$sql .= " WHERE a.published = 1";
	}
	$sql .= " ORDER BY a.sort_order ASC, a.slug ASC";
	$stmt = $pdo->prepare($sql);
	$stmt->execute(["lang" => $lang]);
	$items = [];
	foreach ($stmt as $row) {
		$image = agvs_normalize_media_path((string) $row["image"]);
		$thumbnail = agvs_normalize_media_path((string) $row["thumbnail"]);
		if ($thumbnail === "") {
			$thumbnail = $image;
		}
		$items[] = [
			"slug" => $row["slug"],
			"title" => $row["title"],
			"body" => $row["body"],
			"image" => $image,
			"thumbnail" => $thumbnail,
			"detail" => agvs_json_decode_array($row["detail_json"]),
			"attachments" => agvs_json_decode_array($row["attachments_json"]),
			"published" => ((int) $row["published"]) === 1,
			"sortOrder" => (int) $row["sort_order"],
		];
	}
	return $items;
}

function agvs_load_videos_document(): array
{
	$pdo = agvs_store_require();
	$titleStmt = $pdo->query(
		"SELECT value FROM video_meta WHERE key = 'title'",
	);
	$titleRow = $titleStmt->fetch();
	$title = $titleRow ? (string) $titleRow["value"] : "AGV Video";

	$videos = [];
	$videoStmt = $pdo->query(
		"SELECT slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order
		 FROM videos ORDER BY sort_order ASC, slug ASC",
	);
	$descStmt = $pdo->prepare(
		"SELECT lang, description FROM video_i18n WHERE slug = :slug",
	);
	foreach ($videoStmt as $row) {
		$descStmt->execute(["slug" => $row["slug"]]);
		$descriptions = ["KR" => "", "EN" => "", "JP" => ""];
		foreach ($descStmt as $desc) {
			$descriptions[$desc["lang"]] = $desc["description"];
		}
		$entry = [
			"slug" => $row["slug"],
			"title" => $row["title"],
			"mediaLabel" => $row["media_label"],
			"type" => $row["type"],
			"thumbnail" => agvs_normalize_media_path((string) $row["thumbnail"]),
			"source" => $row["source"],
			"descriptions" => $descriptions,
			"published" => ((int) $row["published"]) === 1,
			"sortOrder" => (int) $row["sort_order"],
		];
		if ($row["type"] === "youtube") {
			$entry["embed"] = $row["embed"];
		} else {
			$entry["poster"] = agvs_normalize_media_path(
				(string) $row["poster"],
			);
			$entry["video"] = agvs_normalize_media_path((string) $row["video"]);
		}
		$videos[] = $entry;
	}
	return [
		"title" => $title,
		"videos" => $videos,
	];
}

function agvs_admin_load_items(string $type, string $lang = "KR"): array
{
	$lang = strtoupper($lang);
	if ($type === "products") {
		return agvs_load_catalog($lang)["items"];
	}
	if ($type === "videos") {
		return agvs_load_videos_document()["videos"];
	}
	if ($type === "archives") {
		return agvs_load_archive_items($lang, false);
	}
	throw new RuntimeException("Unknown content type.");
}

function agvs_upsert_by_slug(array $items, array $record): array
{
	$slug = $record["slug"] ?? "";
	foreach ($items as $index => $item) {
		if (($item["slug"] ?? "") === $slug) {
			$items[$index] = $record;
			return array_values($items);
		}
	}
	$items[] = $record;
	return array_values($items);
}

function agvs_remove_by_slug(array $items, string $slug): array
{
	return array_values(
		array_filter($items, fn($item) => ($item["slug"] ?? "") !== $slug),
	);
}

function agvs_find_by_slug(array $items, string $slug): ?array
{
	foreach ($items as $item) {
		if (($item["slug"] ?? "") === $slug) {
			return $item;
		}
	}
	return null;
}

function agvs_next_sort_order(PDO $pdo, string $table): int
{
	$allowed = ["items" => true, "videos" => true, "archives" => true];
	if (!isset($allowed[$table])) {
		throw new InvalidArgumentException("Invalid sort table.");
	}
	$max = (int) $pdo
		->query("SELECT COALESCE(MAX(sort_order), -1) FROM $table")
		->fetchColumn();
	return $max + 1;
}

/**
 * Upsert one product across KR/EN/JP without shifting sibling sort_order.
 * Shared media/models come from the KR record.
 *
 * @param array<string,array> $recordsByLang
 */
function agvs_admin_upsert_product(array $recordsByLang): void
{
	$kr = $recordsByLang["KR"] ?? null;
	if (!$kr) {
		throw new RuntimeException("KR product record required.");
	}
	foreach (["KR", "EN", "JP"] as $lang) {
		if (!isset($recordsByLang[$lang])) {
			throw new RuntimeException("Missing product record for $lang.");
		}
	}

	$pdo = agvs_store_require();
	$slug = (string) $kr["slug"];
	$pdo->beginTransaction();
	try {
		$check = $pdo->prepare("SELECT sort_order FROM items WHERE slug = :s");
		$check->execute(["s" => $slug]);
		$existingRow = $check->fetch();
		$sortOrder = array_key_exists("sortOrder", $kr)
			? (int) $kr["sortOrder"]
			: ($existingRow
				? (int) $existingRow["sort_order"]
				: agvs_next_sort_order($pdo, "items"));

		$thumb = agvs_normalize_media_path((string) ($kr["thumbnail"] ?? ""));
		if ($thumb === "" && !empty($kr["models"][0]["images"][0]["src"])) {
			$thumb = agvs_normalize_media_path(
				(string) $kr["models"][0]["images"][0]["src"],
			);
		}
		$published =
			!array_key_exists("published", $kr) || $kr["published"] ? 1 : 0;

		$pdo->prepare(
			"INSERT INTO items (slug, category_id, source, thumbnail, published, sort_order)
			 VALUES (:slug, :cat, :source, :thumb, :pub, :sort)
			 ON CONFLICT(slug) DO UPDATE SET
			   category_id = excluded.category_id,
			   source = excluded.source,
			   thumbnail = excluded.thumbnail,
			   published = excluded.published,
			   sort_order = excluded.sort_order",
		)->execute([
			"slug" => $slug,
			"cat" => $kr["category"],
			"source" => (string) ($kr["source"] ?? ""),
			"thumb" => $thumb,
			"pub" => $published,
			"sort" => $sortOrder,
		]);

		// Replace models/images for this item only (shared across langs).
		$idStmt = $pdo->prepare("SELECT id FROM models WHERE item_slug = :s");
		$idStmt->execute(["s" => $slug]);
		$oldIds = $idStmt->fetchAll(PDO::FETCH_COLUMN);
		if ($oldIds) {
			$in = implode(",", array_map("intval", $oldIds));
			$pdo->exec("DELETE FROM model_images WHERE model_row_id IN ($in)");
			$pdo->exec("DELETE FROM model_i18n WHERE model_row_id IN ($in)");
			$pdo->prepare("DELETE FROM models WHERE item_slug = :s")->execute([
				"s" => $slug,
			]);
		}

		$modelInsert = $pdo->prepare(
			"INSERT INTO models (item_slug, model_key, sort_order)
			 VALUES (:slug, :key, :sort)",
		);
		$imageInsert = $pdo->prepare(
			"INSERT INTO model_images (model_row_id, src, alt_text, sort_order)
			 VALUES (:mid, :src, :text, :sort)",
		);
		$itemI18n = $pdo->prepare(
			"INSERT INTO item_i18n (slug, lang, name) VALUES (:slug, :lang, :name)
			 ON CONFLICT(slug, lang) DO UPDATE SET name = excluded.name",
		);
		$modelI18n = $pdo->prepare(
			"INSERT INTO model_i18n (model_row_id, lang, label, specs_json)
			 VALUES (:mid, :lang, :label, :specs)
			 ON CONFLICT(model_row_id, lang) DO UPDATE SET
			   label = excluded.label, specs_json = excluded.specs_json",
		);

		$modelRowIds = [];
		foreach ($kr["models"] ?? [] as $mSort => $model) {
			$modelInsert->execute([
				"slug" => $slug,
				"key" => $model["id"],
				"sort" => $mSort,
			]);
			$mid = (int) $pdo->lastInsertId();
			$modelRowIds[$mSort] = $mid;
			foreach ($model["images"] ?? [] as $iSort => $img) {
				$src = agvs_normalize_media_path((string) ($img["src"] ?? ""));
				if ($src === "") {
					continue;
				}
				$imageInsert->execute([
					"mid" => $mid,
					"src" => $src,
					"text" => (string) ($img["text"] ?? ""),
					"sort" => $iSort,
				]);
			}
		}

		foreach (["KR", "EN", "JP"] as $lang) {
			$rec = $recordsByLang[$lang];
			$itemI18n->execute([
				"slug" => $slug,
				"lang" => $lang,
				"name" => $rec["name"],
			]);
			foreach ($rec["models"] ?? [] as $mSort => $model) {
				if (!isset($modelRowIds[$mSort])) {
					continue;
				}
				$modelI18n->execute([
					"mid" => $modelRowIds[$mSort],
					"lang" => $lang,
					"label" => $model["label"],
					"specs" => agvs_json_encode(
						array_values($model["specs"] ?? []),
					),
				]);
			}
		}

		$pdo->commit();
	} catch (Throwable $e) {
		$pdo->rollBack();
		throw $e;
	}
}

function agvs_admin_upsert_video(array $record): void
{
	$pdo = agvs_store_require();
	$slug = (string) $record["slug"];
	$pdo->beginTransaction();
	try {
		$check = $pdo->prepare("SELECT sort_order FROM videos WHERE slug = :s");
		$check->execute(["s" => $slug]);
		$existingRow = $check->fetch();
		$sortOrder = array_key_exists("sortOrder", $record)
			? (int) $record["sortOrder"]
			: ($existingRow
				? (int) $existingRow["sort_order"]
				: agvs_next_sort_order($pdo, "videos"));

		$pdo->prepare(
			"INSERT INTO videos
			 (slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order)
			 VALUES
			 (:slug, :title, :media, :type, :thumb, :poster, :video, :embed, :source, :pub, :sort)
			 ON CONFLICT(slug) DO UPDATE SET
			   title = excluded.title,
			   media_label = excluded.media_label,
			   type = excluded.type,
			   thumbnail = excluded.thumbnail,
			   poster = excluded.poster,
			   video = excluded.video,
			   embed = excluded.embed,
			   source = excluded.source,
			   published = excluded.published,
			   sort_order = excluded.sort_order",
		)->execute([
			"slug" => $slug,
			"title" => $record["title"],
			"media" => (string) ($record["mediaLabel"] ?? ""),
			"type" => (string) ($record["type"] ?? "youtube"),
			"thumb" => agvs_normalize_media_path(
				(string) ($record["thumbnail"] ?? ""),
			),
			"poster" => agvs_normalize_media_path(
				(string) ($record["poster"] ?? ""),
			),
			"video" => agvs_normalize_media_path(
				(string) ($record["video"] ?? ""),
			),
			"embed" => (string) ($record["embed"] ?? ""),
			"source" => (string) ($record["source"] ?? ""),
			"pub" => !array_key_exists("published", $record) ||
			$record["published"]
				? 1
				: 0,
			"sort" => $sortOrder,
		]);

		$pdo->prepare("DELETE FROM video_i18n WHERE slug = :s")->execute([
			"s" => $slug,
		]);
		$desc = $pdo->prepare(
			"INSERT INTO video_i18n (slug, lang, description) VALUES (:slug, :lang, :d)",
		);
		foreach (["KR", "EN", "JP"] as $lang) {
			$desc->execute([
				"slug" => $slug,
				"lang" => $lang,
				"d" => (string) ($record["descriptions"][$lang] ?? ""),
			]);
		}
		$pdo->commit();
	} catch (Throwable $e) {
		$pdo->rollBack();
		throw $e;
	}
}

/**
 * @param array<string,array> $recordsByLang
 */
function agvs_admin_upsert_archive(array $recordsByLang): void
{
	$kr = $recordsByLang["KR"] ?? null;
	if (!$kr) {
		throw new RuntimeException("KR archive record required.");
	}
	foreach (["KR", "EN", "JP"] as $lang) {
		if (!isset($recordsByLang[$lang])) {
			throw new RuntimeException("Missing archive record for $lang.");
		}
	}

	$pdo = agvs_store_require();
	$slug = (string) $kr["slug"];
	$pdo->beginTransaction();
	try {
		$check = $pdo->prepare(
			"SELECT sort_order FROM archives WHERE slug = :s",
		);
		$check->execute(["s" => $slug]);
		$existingRow = $check->fetch();
		$sortOrder = array_key_exists("sortOrder", $kr)
			? (int) $kr["sortOrder"]
			: ($existingRow
				? (int) $existingRow["sort_order"]
				: agvs_next_sort_order($pdo, "archives"));

		$image = agvs_normalize_media_path((string) ($kr["image"] ?? ""));
		$thumb = agvs_normalize_media_path((string) ($kr["thumbnail"] ?? ""));
		if ($thumb === "") {
			$thumb = $image;
		}

		$pdo->prepare(
			"INSERT INTO archives
			 (slug, image, thumbnail, attachments_json, published, sort_order)
			 VALUES (:slug, :image, :thumb, :att, :pub, :sort)
			 ON CONFLICT(slug) DO UPDATE SET
			   image = excluded.image,
			   thumbnail = excluded.thumbnail,
			   attachments_json = excluded.attachments_json,
			   published = excluded.published,
			   sort_order = excluded.sort_order",
		)->execute([
			"slug" => $slug,
			"image" => $image,
			"thumb" => $thumb,
			"att" => agvs_json_encode($kr["attachments"] ?? []),
			"pub" => !array_key_exists("published", $kr) || $kr["published"]
				? 1
				: 0,
			"sort" => $sortOrder,
		]);

		$i18n = $pdo->prepare(
			"INSERT INTO archive_i18n (slug, lang, title, body, detail_json)
			 VALUES (:slug, :lang, :title, :body, :detail)
			 ON CONFLICT(slug, lang) DO UPDATE SET
			   title = excluded.title, body = excluded.body, detail_json = excluded.detail_json",
		);
		foreach (["KR", "EN", "JP"] as $lang) {
			$rec = $recordsByLang[$lang];
			$i18n->execute([
				"slug" => $slug,
				"lang" => $lang,
				"title" => $rec["title"],
				"body" => (string) ($rec["body"] ?? ""),
				"detail" => agvs_json_encode(
					array_values($rec["detail"] ?? []),
				),
			]);
		}
		$pdo->commit();
	} catch (Throwable $e) {
		$pdo->rollBack();
		throw $e;
	}
}

function agvs_admin_delete_slug(string $type, string $slug): void
{
	$pdo = agvs_store_require();
	$pdo->beginTransaction();
	try {
		if ($type === "products") {
			$pdo
				->prepare("DELETE FROM items WHERE slug = :s")
				->execute(["s" => $slug]);
		} elseif ($type === "videos") {
			$pdo
				->prepare("DELETE FROM videos WHERE slug = :s")
				->execute(["s" => $slug]);
		} elseif ($type === "archives") {
			$pdo
				->prepare("DELETE FROM archives WHERE slug = :s")
				->execute(["s" => $slug]);
		} else {
			throw new RuntimeException("Unknown content type.");
		}
		$pdo->commit();
	} catch (Throwable $e) {
		$pdo->rollBack();
		throw $e;
	}
}
