import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCatalog, loadUi, loadVideosDocument } from "./content.js";
import { createContext } from "./i18n.js";
import { pages } from "./pages.js";
import type { PageData, PageModule } from "./pages.js";
import type { Catalog, Lang, UiDocument } from "./types.js";

interface LocaleTarget {
	lang: Lang;
	directory: string;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const maxParentLevels = 6;

function findRepoRoot(startDirectory: string): string {
	let currentDirectory = startDirectory;
	for (let parentLevels = 0; parentLevels <= maxParentLevels; parentLevels += 1) {
		const packageJsonPath = path.join(currentDirectory, "package.json");
		const dataPath = path.join(currentDirectory, "data");
		if (
			fs.existsSync(packageJsonPath) &&
			fs.statSync(packageJsonPath).isFile() &&
			fs.existsSync(dataPath) &&
			fs.statSync(dataPath).isDirectory()
		) {
			return currentDirectory;
		}
		const parentDirectory = path.dirname(currentDirectory);
		if (parentDirectory === currentDirectory) {
			break;
		}
		currentDirectory = parentDirectory;
	}
	throw new Error(
		`Unable to locate repository root from ${startDirectory}; expected package.json and data/ within ${maxParentLevels} parent levels.`,
	);
}

function decodeDownloadPath(encodedPath: string): string {
	const withSpaces = encodedPath.replace(/\+/g, " ");
	try {
		return decodeURIComponent(withSpaces);
	} catch {
		throw new Error(`download.php 경로를 URL 디코딩할 수 없습니다: ${encodedPath}`);
	}
}

function rewritePhpLinks(html: string): string {
	return html
		.replace(/VideoView\.php\?item=([A-Za-z0-9_-]+)/g, "video-$1.html")
		.replace(/view\.php\?archive=([A-Za-z0-9_-]+)/g, "archive-$1.html")
		.replace(/view\.php\?item=([A-Za-z0-9_-]+)/g, "view-$1.html")
		.replace(
			/\b(index|DetailList|Overview|Sitemap|Video|Archive)\.php\b/g,
			"$1.html",
		)
		.replace(
			/download\.php\?id=([^"&]+)(?:&amp;|&)name=[^"]*/g,
			(_match, encodedPath: string) => decodeDownloadPath(encodedPath),
		);
}

function fixLocalePaths(html: string): string {
	return html
		.replace(/\b(href|src|poster)="\.\//g, '$1="../')
		.replace(/\b(href|src|poster)="((?:assets|storage)\/)/g, '$1="../$2');
}

function rewrittenHtml(html: string, nestedLocale: boolean): string {
	const linksRewritten = rewritePhpLinks(html);
	return nestedLocale ? fixLocalePaths(linksRewritten) : linksRewritten;
}

function assertUniquePageNames(): void {
	const names = new Set<string>();
	for (const page of pages) {
		if (names.has(page.name)) {
			throw new Error(`페이지 레지스트리에 중복된 이름이 있습니다: ${page.name}`);
		}
		names.add(page.name);
	}
}

function slugFromRecord(record: Record<string, unknown>, kind: string): string {
	const slug = record.slug;
	if (typeof slug !== "string" || slug === "") {
		throw new Error(`${kind} 데이터에 유효한 slug가 없습니다.`);
	}
	return slug;
}

function archiveItemsFromUi(ui: UiDocument): Record<string, unknown>[] {
	const archive = ui.archive;
	if (typeof archive !== "object" || archive === null || Array.isArray(archive)) {
		throw new Error("UI 문서에 자료실 데이터가 없습니다.");
	}
	const items = (archive as Record<string, unknown>).items;
	if (!Array.isArray(items)) {
		throw new Error("UI 문서에 자료실 항목 배열이 없습니다.");
	}
	for (const item of items) {
		if (typeof item !== "object" || item === null || Array.isArray(item)) {
			throw new Error("UI 문서의 자료실 항목 형식이 올바르지 않습니다.");
		}
	}
	return items as Record<string, unknown>[];
}

function writeRenderedPage(
	page: PageModule,
	ctx: ReturnType<typeof createContext>,
	data: PageData,
	destinationDirectory: string,
	outputBasename: string,
	nestedLocale: boolean,
	slug?: string,
): string {
	const destination = path.join(destinationDirectory, `${outputBasename}.html`);
	try {
		const html = page.render(ctx, data, slug);
		fs.writeFileSync(destination, rewrittenHtml(html, nestedLocale), "utf8");
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`[${ctx.lang}] ${outputBasename}.html 렌더 실패: ${detail}`);
	}
	return destination;
}

function countDetailPages(destinationDirectory: string, prefix: string): number {
	return fs
		.readdirSync(destinationDirectory)
		.filter((name) => name.startsWith(`${prefix}-`) && name.endsWith(".html")).length;
}

function assertDetailCount(
	lang: Lang,
	destinationDirectory: string,
	prefix: string,
	expected: number,
	label: string,
): void {
	const actual = countDetailPages(destinationDirectory, prefix);
	if (actual !== expected) {
		throw new Error(
			`[${lang}] 렌더된 ${label} 상세 페이지 수(${actual})가 슬러그 수(${expected})와 일치하지 않습니다.`,
		);
	}
}

function renderLocale(
	target: LocaleTarget,
	outputRoot: string,
): { catalog: Catalog; files: string[] } {
	const destinationDirectory = path.join(outputRoot, target.directory);
	const nestedLocale = target.directory !== "";
	fs.mkdirSync(destinationDirectory, { recursive: true });

	const ui = loadUi(target.lang);
	const ctx = createContext(target.lang, ui);
	const catalog = loadCatalog(target.lang);
	const videos = loadVideosDocument();
	const archiveItems = archiveItemsFromUi(ui);
	const data: PageData = { catalog, videos, archiveItems };
	const files: string[] = [];

	for (const page of pages) {
		if (page.name === "view" || page.name === "VideoView") {
			continue;
		}
		files.push(
			writeRenderedPage(
				page,
				ctx,
				data,
				destinationDirectory,
				page.name,
				nestedLocale,
			),
		);
	}

	const viewPage = pages.find((page) => page.name === "view");
	if (viewPage) {
		for (const item of catalog.items) {
			files.push(
				writeRenderedPage(
					viewPage,
					ctx,
					data,
					destinationDirectory,
					`view-${item.slug}`,
					nestedLocale,
					item.slug,
				),
			);
		}
		assertDetailCount(target.lang, destinationDirectory, "view", catalog.items.length, "아이템");

		for (const archive of archiveItems) {
			const slug = slugFromRecord(archive, "자료실");
			files.push(
				writeRenderedPage(
					viewPage,
					ctx,
					data,
					destinationDirectory,
					`archive-${slug}`,
					nestedLocale,
					slug,
				),
			);
		}
		assertDetailCount(
			target.lang,
			destinationDirectory,
			"archive",
			archiveItems.length,
			"자료실",
		);
	}

	const videoPage = pages.find((page) => page.name === "VideoView");
	if (videoPage) {
		for (const video of videos.videos) {
			const slug = slugFromRecord(video, "영상");
			files.push(
				writeRenderedPage(
					videoPage,
					ctx,
					data,
					destinationDirectory,
					`video-${slug}`,
					nestedLocale,
					slug,
				),
			);
		}
		assertDetailCount(
			target.lang,
			destinationDirectory,
			"video",
			videos.videos.length,
			"영상",
		);
	}

	return { catalog, files };
}

function copyStaticAssets(repoRoot: string, outputRoot: string): void {
	const sourceAssets = path.join(repoRoot, "src", "assets");
	if (fs.existsSync(sourceAssets) && fs.statSync(sourceAssets).isDirectory()) {
		fs.cpSync(sourceAssets, path.join(outputRoot, "assets"), { recursive: true });
	}

	const sourceUploads = path.join(repoRoot, "storage", "uploads");
	if (fs.existsSync(sourceUploads) && fs.statSync(sourceUploads).isDirectory()) {
		const storageDirectory = path.join(outputRoot, "storage");
		fs.mkdirSync(storageDirectory, { recursive: true });
		fs.cpSync(sourceUploads, path.join(storageDirectory, "uploads"), { recursive: true });
	}

	fs.writeFileSync(path.join(outputRoot, ".nojekyll"), "", "utf8");
}

function validateRenderedPage(file: string, outputRoot: string): string[] {
	const html = fs.readFileSync(file, "utf8");
	const page = path.relative(outputRoot, file).split(path.sep).join("/");
	const failures: string[] = [];
	if (html.includes("<?php")) {
		failures.push(`FAIL: ${page} 에 실행되지 않은 PHP 가 남아 있습니다.`);
	}
	if (!/<header[ >]/.test(html)) {
		failures.push(`FAIL: ${page} 에 헤더가 없습니다.`);
	}
	if (!html.includes('id="Footer"')) {
		failures.push(`FAIL: ${page} 에 푸터가 없습니다.`);
	}

	const attributePattern = /\b(?:href|src|action)="([^"]*)"/g;
	for (const match of html.matchAll(attributePattern)) {
		const value = match[1] ?? "";
		if (/\.php(?:$|\?)/.test(value) && !/^https?:\/\//.test(value)) {
			failures.push(`FAIL: ${page} 에 .php 링크가 남아 있습니다.`);
			break;
		}
	}
	return failures;
}

function hasExactPath(root: string, relativePath: string): boolean {
	const parts = relativePath.split(/[\\/]+/).filter((part) => part !== "");
	let current = root;
	for (const part of parts) {
		if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
			return false;
		}
		if (!fs.readdirSync(current).includes(part)) {
			return false;
		}
		current = path.join(current, part);
	}
	return true;
}

function validateCatalogImages(catalog: Catalog, outputRoot: string): string[] {
	const failures: string[] = [];
	for (const item of catalog.items) {
		for (const model of item.models) {
			for (const image of model.images) {
				const imagePath = path.join(outputRoot, "assets", image.src);
				if (!hasExactPath(path.join(outputRoot, "assets"), image.src)) {
					failures.push(
						`FAIL: 카탈로그가 참조하는 이미지가 빌드 결과물에 없습니다(대소문자 불일치 포함): ${image.src}`,
					);
					continue;
				}
				const stat = fs.statSync(imagePath);
				if (!stat.isFile() || stat.size === 0) {
					failures.push(
						`FAIL: 카탈로그가 참조하는 이미지가 빈 파일(0바이트)입니다: ${image.src}`,
					);
					continue;
				}
				const signature = fs.readFileSync(imagePath).subarray(0, 2);
				if (signature.length !== 2 || signature[0] !== 0xff || signature[1] !== 0xd8) {
					failures.push(
						`FAIL: 카탈로그가 참조하는 이미지가 유효한 JPEG 가 아닙니다(시그니처 불일치): ${image.src}`,
					);
				}
			}
		}
	}
	return failures;
}

function main(): void {
	const repoRoot = findRepoRoot(here);
	const outputRoot = path.join(repoRoot, "_site");
	fs.rmSync(outputRoot, { recursive: true, force: true });
	fs.mkdirSync(outputRoot, { recursive: true });
	assertUniquePageNames();

	const renderedFiles: string[] = [];
	let krCatalog: Catalog | null = null;
	if (pages.length > 0) {
		const locales: LocaleTarget[] = [
			{ lang: "KR", directory: "" },
			{ lang: "EN", directory: "en" },
			{ lang: "JP", directory: "jp" },
		];
		for (const locale of locales) {
			const result = renderLocale(locale, outputRoot);
			renderedFiles.push(...result.files);
			if (locale.lang === "KR") {
				krCatalog = result.catalog;
			}
		}
	}

	copyStaticAssets(repoRoot, outputRoot);
	const failures = renderedFiles.flatMap((file) => validateRenderedPage(file, outputRoot));
	if (krCatalog) {
		failures.push(...validateCatalogImages(krCatalog, outputRoot));
	}
	if (failures.length > 0) {
		throw new Error(failures.join("\n"));
	}

	console.log(`TS 렌더 완료: ${outputRoot} (${renderedFiles.length} pages rendered)`);
}

try {
	main();
} catch (error) {
	const detail = error instanceof Error ? error.message : String(error);
	console.error(detail.startsWith("FAIL:") ? detail : `FAIL: ${detail}`);
	process.exitCode = 1;
}
