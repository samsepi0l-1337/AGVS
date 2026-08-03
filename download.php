<?php
require_once __DIR__ . "/include/adminCore.php";
$relative = (string) ($_GET["id"] ?? "");
if (!str_starts_with($relative, "storage/uploads/documents/")) { http_response_code(404); exit(); }
$base = realpath(__DIR__ . "/storage/uploads/documents");
$file = realpath(__DIR__ . "/" . $relative);
if (!$base || !$file || !str_starts_with($file, $base . DIRECTORY_SEPARATOR) || !is_file($file)) { http_response_code(404); exit(); }
header("Content-Type: application/octet-stream");
header("Content-Length: " . filesize($file));
header("Content-Disposition: attachment; filename=\"" . rawurlencode(basename($file)) . "\"");
readfile($file);
