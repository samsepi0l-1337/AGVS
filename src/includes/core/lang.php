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

	require_once __DIR__ . "/contentStore.php";

	// agvs_load_catalog() / agvs_load_ui() provided by include/contentStore.php (SQLite).

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

	/**
	 * Normalize a media/asset path for public pages.
	 * Catalog paths may be "img/..." or "./img/..."; static en/jp builds
	 * rewrite "./…" to "../…". Absolute and data: URLs pass through.
	 */
	function agvs_asset_url($path)
	{
		if (!is_string($path) || $path === "") {
			return "";
		}
		if (
			preg_match("#^(https?:)?//#i", $path) ||
			stripos($path, "data:") === 0
		) {
			return $path;
		}
		$path = str_replace("\\", "/", $path);
		$path = preg_replace("#^\./+#", "", $path);
		$path = ltrim($path, "/");
		$path = preg_replace("#^(en|jp)/+#i", "", $path);
		$path = preg_replace("#(^|/)\.\.(/|$)#", "/", $path);
		$path = preg_replace("#/+#", "/", $path);
		$path = ltrim($path, "/");
		if ($path === "") {
			return "";
		}
		// Stored catalog paths keep their historical "img/…" / "video/…" form so
		// the DB, the JSON seeds and admin uploads stay untouched; the public
		// tree serves them from assets/, so the prefix is added on the way out.
		$path = preg_replace("#^(img|video)/#", "assets/$1/", $path);
		return "./" . $path;
	}

	$agvsUi = agvs_load_ui();
}
