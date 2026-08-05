export type Lang = "KR" | "EN" | "JP";
export interface CatalogImage { src: string; text: string; }
export interface CatalogModel { id: string; label: string; subtitle: string; specs: unknown[]; images: CatalogImage[]; }
export interface CatalogItem { slug: string; name: string; category: string; source: string; thumbnail: string; published: boolean; sortOrder: number; models: CatalogModel[]; }
export interface CatalogCategory { id: string; label: string; title: string; }
export interface Catalog { categories: CatalogCategory[]; items: CatalogItem[]; }
export type UiDocument = Record<string, unknown>;
export interface VideosDocument { videos: Record<string, unknown>[]; }
