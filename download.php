<?php

declare(strict_types=1);

$relative = str_replace("\\", "/", (string) ($_GET["id"] ?? ""));
$relative = ltrim($relative, "/");

// Allow only document paths under the documents upload dir.
if (
	!preg_match(
		'#^storage/uploads/documents/[A-Za-z0-9][A-Za-z0-9._-]*\.(pdf|xls|xlsx)$#i',
		$relative,
	)
) {
	http_response_code(404);
	exit();
}

$base = realpath(__DIR__ . "/storage/uploads/documents");
$file = realpath(__DIR__ . "/" . $relative);
if (
	!$base ||
	!$file ||
	!str_starts_with($file, $base . DIRECTORY_SEPARATOR) ||
	!is_file($file)
) {
	http_response_code(404);
	exit();
}

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$mimeMap = [
	"pdf" => "application/pdf",
	"xls" => "application/vnd.ms-excel",
	"xlsx" =>
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
$mime = $mimeMap[$ext] ?? "application/octet-stream";

$downloadName = basename((string) ($_GET["name"] ?? ""));
$downloadName = str_replace(["\0", "/", "\\"], "", $downloadName);
if ($downloadName === "" || $downloadName === "." || $downloadName === "..") {
	$downloadName = basename($file);
}
$asciiFallback = preg_replace('/[^\x20-\x7E]/', "_", $downloadName);
if (!is_string($asciiFallback) || $asciiFallback === "") {
	$asciiFallback = "download." . $ext;
}
$asciiFallback = str_replace(['"', "\\"], "", $asciiFallback);

header("Content-Type: " . $mime);
header("X-Content-Type-Options: nosniff");
header("Content-Length: " . (string) filesize($file));
header(
	"Content-Disposition: attachment; filename=\"" .
		$asciiFallback .
		"\"; filename*=UTF-8''" .
		rawurlencode($downloadName),
);
readfile($file);
