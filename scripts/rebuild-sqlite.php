#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Rebuild data/agvs.sqlite from the JSON seed files under data/.
 * Safe to re-run; replaces the entire database.
 *
 * Usage: php scripts/rebuild-sqlite.php
 */

$root = dirname(__DIR__);
require_once $root . "/include/db.php";

$langs = ["KR", "EN", "JP"];

function agvs_read_seed(string $path): array
{
	if (!is_readable($path)) {
		fwrite(STDERR, "Missing seed file: $path\n");
		exit(1);
	}
	$decoded = json_decode((string) file_get_contents($path), true);
	if (!is_array($decoded)) {
		fwrite(STDERR, "Invalid JSON: $path\n");
		exit(1);
	}
	return $decoded;
}

if (is_file(AGVS_DB_PATH)) {
	unlink(AGVS_DB_PATH);
}
foreach (glob(AGVS_DB_PATH . "-*") ?: [] as $sidecar) {
	@unlink($sidecar);
}

$pdo = agvs_db();
agvs_db_install_schema($pdo);
$pdo->beginTransaction();

try {
	$pdo
		->prepare(
			"INSERT INTO meta (key, value) VALUES ('builtAt', :v), ('source', 'json-seed')",
		)
		->execute(["v" => gmdate("c")]);

	// ── Categories + items/models ──────────────────────────────────────────
	$catalogs = [];
	foreach ($langs as $lang) {
		$catalogs[$lang] = agvs_read_seed("$root/data/items$lang.json");
	}
	$krCatalog = $catalogs["KR"];

	$catInsert = $pdo->prepare(
		"INSERT INTO categories (id, sort_order) VALUES (:id, :sort)",
	);
	$catI18n = $pdo->prepare(
		"INSERT INTO category_i18n (category_id, lang, label, title)
		 VALUES (:id, :lang, :label, :title)",
	);
	foreach ($krCatalog["categories"] ?? [] as $sort => $cat) {
		$catInsert->execute(["id" => $cat["id"], "sort" => $sort]);
		foreach ($langs as $lang) {
			$local =
				$catalogs[$lang]["categories"][$sort] ??
				$cat;
			$catI18n->execute([
				"id" => $cat["id"],
				"lang" => $lang,
				"label" => $local["label"] ?? $cat["label"],
				"title" => $local["title"] ?? $cat["title"],
			]);
		}
	}

	$itemInsert = $pdo->prepare(
		"INSERT INTO items (slug, category_id, source, thumbnail, published, sort_order)
		 VALUES (:slug, :cat, :source, :thumb, :pub, :sort)",
	);
	$itemI18n = $pdo->prepare(
		"INSERT INTO item_i18n (slug, lang, name) VALUES (:slug, :lang, :name)",
	);
	$modelInsert = $pdo->prepare(
		"INSERT INTO models (item_slug, model_key, sort_order)
		 VALUES (:slug, :key, :sort)",
	);
	$modelI18n = $pdo->prepare(
		"INSERT INTO model_i18n (model_row_id, lang, label, specs_json)
		 VALUES (:mid, :lang, :label, :specs)",
	);
	$imageInsert = $pdo->prepare(
		"INSERT INTO model_images (model_row_id, src, alt_text, sort_order)
		 VALUES (:mid, :src, :text, :sort)",
	);

	foreach ($krCatalog["items"] ?? [] as $sort => $item) {
		$slug = $item["slug"];
		$thumb = agvs_normalize_media_path((string) ($item["thumbnail"] ?? ""));
		if ($thumb === "" && !empty($item["models"][0]["images"][0]["src"])) {
			$thumb = agvs_normalize_media_path(
				(string) $item["models"][0]["images"][0]["src"],
			);
		}
		$itemInsert->execute([
			"slug" => $slug,
			"cat" => $item["category"],
			"source" => (string) ($item["source"] ?? ""),
			"thumb" => $thumb,
			"pub" => !array_key_exists("published", $item) || $item["published"]
				? 1
				: 0,
			"sort" => (int) ($item["sortOrder"] ?? $sort),
		]);

		$modelRowIds = [];
		foreach ($item["models"] ?? [] as $mSort => $model) {
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

		foreach ($langs as $lang) {
			$localItem = null;
			foreach ($catalogs[$lang]["items"] ?? [] as $candidate) {
				if (($candidate["slug"] ?? "") === $slug) {
					$localItem = $candidate;
					break;
				}
			}
			if (!$localItem) {
				fwrite(STDERR, "Missing item $slug in items$lang.json\n");
				exit(1);
			}
			$itemI18n->execute([
				"slug" => $slug,
				"lang" => $lang,
				"name" => $localItem["name"],
			]);
			foreach ($localItem["models"] ?? [] as $mSort => $model) {
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
	}

	// ── UI documents + archives ────────────────────────────────────────────
	$uiInsert = $pdo->prepare(
		"INSERT INTO ui_documents (lang, payload_json) VALUES (:lang, :json)",
	);
	$archInsert = $pdo->prepare(
		"INSERT INTO archives
		 (slug, image, thumbnail, attachments_json, published, sort_order)
		 VALUES (:slug, :image, :thumb, :att, :pub, :sort)",
	);
	$archI18n = $pdo->prepare(
		"INSERT INTO archive_i18n (slug, lang, title, body, detail_json)
		 VALUES (:slug, :lang, :title, :body, :detail)",
	);

	$uiDocs = [];
	foreach ($langs as $lang) {
		$uiDocs[$lang] = agvs_read_seed("$root/data/ui$lang.json");
	}
	$krArchives = $uiDocs["KR"]["archive"]["items"] ?? [];

	foreach ($langs as $lang) {
		$payload = $uiDocs[$lang];
		if (!isset($payload["archive"]) || !is_array($payload["archive"])) {
			$payload["archive"] = [];
		}
		// Archive rows live in archives tables; keep chrome keys only.
		$payload["archive"]["items"] = [];
		$uiInsert->execute([
			"lang" => $lang,
			"json" => agvs_json_encode($payload),
		]);
	}

	foreach ($krArchives as $sort => $item) {
		$slug = $item["slug"];
		$image = agvs_normalize_media_path((string) ($item["image"] ?? ""));
		$thumb = agvs_normalize_media_path((string) ($item["thumbnail"] ?? ""));
		if ($thumb === "") {
			$thumb = $image;
		}
		$archInsert->execute([
			"slug" => $slug,
			"image" => $image,
			"thumb" => $thumb,
			"att" => agvs_json_encode($item["attachments"] ?? []),
			"pub" => !array_key_exists("published", $item) || $item["published"]
				? 1
				: 0,
			"sort" => (int) ($item["sortOrder"] ?? $sort),
		]);
		foreach ($langs as $lang) {
			$local = null;
			foreach ($uiDocs[$lang]["archive"]["items"] ?? [] as $candidate) {
				if (($candidate["slug"] ?? "") === $slug) {
					$local = $candidate;
					break;
				}
			}
			if (!$local) {
				fwrite(STDERR, "Missing archive $slug in ui$lang.json\n");
				exit(1);
			}
			$archI18n->execute([
				"slug" => $slug,
				"lang" => $lang,
				"title" => $local["title"],
				"body" => (string) ($local["body"] ?? ""),
				"detail" => agvs_json_encode(
					array_values($local["detail"] ?? []),
				),
			]);
		}
	}

	// ── Videos ─────────────────────────────────────────────────────────────
	$videosDoc = agvs_read_seed("$root/data/videos.json");
	$pdo
		->prepare(
			"INSERT INTO video_meta (key, value) VALUES ('title', :v)",
		)
		->execute(["v" => (string) ($videosDoc["title"] ?? "AGV Video")]);

	$videoInsert = $pdo->prepare(
		"INSERT INTO videos
		 (slug, title, media_label, type, thumbnail, poster, video, embed, source, published, sort_order)
		 VALUES
		 (:slug, :title, :media, :type, :thumb, :poster, :video, :embed, :source, :pub, :sort)",
	);
	$videoI18n = $pdo->prepare(
		"INSERT INTO video_i18n (slug, lang, description) VALUES (:slug, :lang, :d)",
	);
	foreach ($videosDoc["videos"] ?? [] as $sort => $video) {
		$videoInsert->execute([
			"slug" => $video["slug"],
			"title" => $video["title"],
			"media" => (string) ($video["mediaLabel"] ?? ""),
			"type" => (string) ($video["type"] ?? "youtube"),
			"thumb" => agvs_normalize_media_path(
				(string) ($video["thumbnail"] ?? ""),
			),
			"poster" => agvs_normalize_media_path(
				(string) ($video["poster"] ?? ""),
			),
			"video" => agvs_normalize_media_path(
				(string) ($video["video"] ?? ""),
			),
			"embed" => (string) ($video["embed"] ?? ""),
			"source" => (string) ($video["source"] ?? ""),
			"pub" => !array_key_exists("published", $video) || $video["published"]
				? 1
				: 0,
			"sort" => (int) ($video["sortOrder"] ?? $sort),
		]);
		foreach ($langs as $lang) {
			$videoI18n->execute([
				"slug" => $video["slug"],
				"lang" => $lang,
				"d" => (string) ($video["descriptions"][$lang] ?? ""),
			]);
		}
	}

	$pdo->commit();
} catch (Throwable $e) {
	$pdo->rollBack();
	fwrite(STDERR, "Rebuild failed: " . $e->getMessage() . "\n");
	exit(1);
}

$counts = [
	"categories" => (int) $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
	"items" => (int) $pdo->query("SELECT COUNT(*) FROM items")->fetchColumn(),
	"models" => (int) $pdo->query("SELECT COUNT(*) FROM models")->fetchColumn(),
	"archives" => (int) $pdo->query("SELECT COUNT(*) FROM archives")->fetchColumn(),
	"videos" => (int) $pdo->query("SELECT COUNT(*) FROM videos")->fetchColumn(),
];
echo "Rebuilt " . AGVS_DB_PATH . "\n";
foreach ($counts as $k => $v) {
	echo "  $k: $v\n";
}
