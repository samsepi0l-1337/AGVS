<?php

declare(strict_types=1);

const AGVS_ADMIN_ROOT = __DIR__ . "/../../..";
const AGVS_LANGUAGES = ["KR", "EN", "JP"];

require_once __DIR__ . "/contentStore.php";

function agvs_admin_start(): void
{
	if (session_status() !== PHP_SESSION_ACTIVE) {
		session_set_cookie_params(["httponly" => true, "samesite" => "Lax"]);
		session_start();
	}
	if (
		isset($_SESSION["adminLastActive"]) &&
		time() - $_SESSION["adminLastActive"] > 1800
	) {
		$_SESSION = [];
	}
	$_SESSION["adminLastActive"] = time();
}

function agvs_admin_logged_in(): bool
{
	agvs_admin_start();
	return ($_SESSION["adminAuthenticated"] ?? false) === true;
}

function agvs_admin_require_login(): void
{
	if (!agvs_admin_logged_in()) {
		header("Location: login.php");
		exit();
	}
}

function agvs_admin_login(string $password): bool
{
	agvs_admin_start();
	$hash = getenv("AGVS_ADMIN_PASSWORD_HASH") ?: "";
	if ($hash === "" || !password_verify($password, $hash)) {
		return false;
	}
	session_regenerate_id(true);
	$_SESSION["adminAuthenticated"] = true;
	$_SESSION["adminCsrf"] = bin2hex(random_bytes(32));
	return true;
}

function agvs_admin_csrf(): string
{
	agvs_admin_start();
	if (empty($_SESSION["adminCsrf"])) {
		$_SESSION["adminCsrf"] = bin2hex(random_bytes(32));
	}
	return $_SESSION["adminCsrf"];
}

function agvs_admin_require_csrf(): void
{
	if (!hash_equals(agvs_admin_csrf(), (string) ($_POST["csrfToken"] ?? ""))) {
		http_response_code(403);
		exit("Invalid request.");
	}
}

/** @deprecated JSON paths retained for rebuild seeds only. */
function agvs_data_path(string $kind, string $lang = "KR"): string
{
	$files = [
		"products" => "items%s.json",
		"videos" => "videos.json",
		"archives" => "ui%s.json",
	];
	if (!isset($files[$kind])) {
		throw new RuntimeException("Unknown content type.");
	}
	return AGVS_ADMIN_ROOT .
		"/data/" .
		($kind === "videos" ? $files[$kind] : sprintf($files[$kind], $lang));
}

function agvs_read_json(string $path): array
{
	$decoded = json_decode((string) file_get_contents($path), true);
	if (!is_array($decoded)) {
		throw new RuntimeException("Invalid JSON: " . basename($path));
	}
	return $decoded;
}

function agvs_backup_sqlite(): void
{
	if (!is_file(AGVS_DB_PATH)) {
		return;
	}
	$backupDir = AGVS_ADMIN_ROOT . "/storage/backups";
	if (!is_dir($backupDir)) {
		mkdir($backupDir, 0775, true);
	}
	copy(AGVS_DB_PATH, $backupDir . "/" . date("Ymd-His") . "-agvs.sqlite");
}

function agvs_slug(string $value): string
{
	$value = strtolower(trim($value));
	if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value)) {
		throw new RuntimeException(
			"Slug must use lowercase letters, numbers, and hyphens.",
		);
	}
	return $value;
}

function agvs_upload(array $file, string $kind): array
{
	$rules = [
		"image" => [
			["image/jpeg", "image/png", "image/webp"],
			10 * 1024 * 1024,
			"images",
		],
		"video" => [["video/mp4"], 500 * 1024 * 1024, "videos"],
		"document" => [
			[
				"application/pdf",
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			],
			25 * 1024 * 1024,
			"documents",
		],
	];
	if (
		!isset($rules[$kind]) ||
		($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK ||
		($file["size"] ?? 0) > $rules[$kind][1]
	) {
		throw new RuntimeException("Invalid upload.");
	}
	$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file["tmp_name"]);
	if (!in_array($mime, $rules[$kind][0], true)) {
		throw new RuntimeException("Unsupported file type.");
	}
	$ext = strtolower(pathinfo((string) $file["name"], PATHINFO_EXTENSION));
	$name = bin2hex(random_bytes(16)) . "." . $ext;
	$relative = "storage/uploads/" . $rules[$kind][2] . "/" . $name;
	$target = AGVS_ADMIN_ROOT . "/" . $relative;
	$dir = dirname($target);
	if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
		throw new RuntimeException("Upload failed.");
	}
	if (!move_uploaded_file($file["tmp_name"], $target)) {
		throw new RuntimeException("Upload failed.");
	}
	return [
		"path" => $relative,
		"originalName" => basename((string) $file["name"]),
		"mime" => $mime,
		"size" => (int) $file["size"],
	];
}

function agvs_admin_header(string $title): void
{
	?><!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="assets/admin.css"><title><?= htmlspecialchars(
	$title,
) ?></title></head><body><header><a href="index.php">AGVS 관리자</a><nav><a href="content.php?type=products">제품</a><a href="content.php?type=videos">영상</a><a href="content.php?type=archives">자료실</a><a href="translate.php">번역</a><a href="logout.php">로그아웃</a></nav></header><main><?php
}
function agvs_admin_footer(): void
{
	?></main></body></html><?php
}
