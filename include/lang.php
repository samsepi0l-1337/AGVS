<?php
if (!defined("AGVS_LANG_LOADED")) {
	define("AGVS_LANG_LOADED", true);

	$agvsAllowedLangs = ["KR", "EN", "JP"];
	$agvsLang = "KR";
	$agvsLangResolved = false;

	if (isset($_GET["lang"]) && is_string($_GET["lang"])) {
		$candidate = strtoupper($_GET["lang"]);
		if (in_array($candidate, $agvsAllowedLangs, true)) {
			$agvsLang = $candidate;
			$agvsLangResolved = true;
		}
	}
	if (
		!$agvsLangResolved &&
		isset($_COOKIE["agvs_lang"]) &&
		is_string($_COOKIE["agvs_lang"])
	) {
		$candidate = strtoupper($_COOKIE["agvs_lang"]);
		if (in_array($candidate, $agvsAllowedLangs, true)) {
			$agvsLang = $candidate;
		}
	}

	if (!headers_sent()) {
		setcookie("agvs_lang", $agvsLang, [
			"expires" => time() + 365 * 24 * 60 * 60,
			"path" => "/",
			"samesite" => "Lax",
		]);
	}

	$agvsHtmlLangMap = [
		"KR" => "ko",
		"EN" => "en",
		"JP" => "ja",
	];
	$agvsHtmlLang = $agvsHtmlLangMap[$agvsLang];

	$agvsAboutLabelMap = [
		"KR" => "회사소개",
		"EN" => "About",
		"JP" => "会社紹介",
	];
	$agvsAboutLabel = $agvsAboutLabelMap[$agvsLang];

	function agvs_load_catalog()
	{
		global $agvsLang;
		$file = "items" . $agvsLang . ".json";
		$path = dirname(__DIR__) . "/data/" . $file;
		$empty = [
			"categories" => [],
			"items" => [],
		];
		if (!is_readable($path)) {
			return $empty;
		}
		$raw = file_get_contents($path);
		if ($raw === false) {
			return $empty;
		}
		$decoded = json_decode($raw, true);
		if (!is_array($decoded)) {
			return $empty;
		}
		return [
			"categories" =>
				isset($decoded["categories"]) && is_array($decoded["categories"])
					? $decoded["categories"]
					: [],
			"items" =>
				isset($decoded["items"]) && is_array($decoded["items"])
					? $decoded["items"]
					: [],
		];
	}

	function agvs_load_ui()
	{
		global $agvsLang;
		$path = dirname(__DIR__) . "/data/ui" . $agvsLang . ".json";
		$empty = [];
		if (!is_readable($path)) {
			return $empty;
		}
		$raw = file_get_contents($path);
		if ($raw === false) {
			return $empty;
		}
		$decoded = json_decode($raw, true);
		return is_array($decoded) ? $decoded : $empty;
	}

	/**
	 * Read a dotted UI key, e.g. agvs_t("footer.privacy").
	 * Returns empty string if missing.
	 */
	function agvs_t($key)
	{
		static $ui = null;
		if ($ui === null) {
			$ui = agvs_load_ui();
		}
		$parts = explode(".", $key);
		$cur = $ui;
		foreach ($parts as $part) {
			if (!is_array($cur) || !array_key_exists($part, $cur)) {
				return "";
			}
			$cur = $cur[$part];
		}
		return is_string($cur) ? $cur : "";
	}

	$agvsUi = agvs_load_ui();
}
