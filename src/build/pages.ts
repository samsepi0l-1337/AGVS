import type { RenderContext } from "./i18n.js";
import type { Catalog, Lang, UiDocument, VideosDocument } from "./types.js";

import { detailListPage } from "./templates/detailList.js";
import { indexPage } from "./templates/index.js";
import { sitemapPage } from "./templates/sitemap.js";
import { videoPage } from "./templates/video.js";

export interface PageData {
	catalog: Catalog;
	videos: VideosDocument;
	archiveItems: Record<string, unknown>[];
}

export interface PageModule {
	/** Output basename without extension, e.g. "DetailList". */
	readonly name: string;
	/** Render one HTML document. `slug` is set only for detail pages. */
	render(ctx: RenderContext, data: PageData, slug?: string): string;
}

// 페이지 모듈을 import한 뒤 이 배열에 추가한다.
export const pages: PageModule[] = [
	indexPage,
	detailListPage,
	sitemapPage,
	videoPage,
];
