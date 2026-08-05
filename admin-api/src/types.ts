export type Lang = "KR" | "EN" | "JP";

export type ContentType = "products" | "videos" | "archives";

export interface ModelImage {
	src: string;
	text: string;
}

export interface ProductModel {
	id: string;
	label: string;
	subtitle: string;
	specs: string[];
	images: ModelImage[];
}

export interface ProductRecord {
	slug: string;
	name: string;
	category: string;
	source: string;
	thumbnail: string;
	published: boolean;
	sortOrder: number;
	models: ProductModel[];
}

export interface VideoRecord {
	slug: string;
	title: string;
	mediaLabel: string;
	type: "youtube" | "local";
	thumbnail: string;
	source: string;
	descriptions: Record<Lang, string>;
	published: boolean;
	sortOrder: number;
	embed?: string;
	poster?: string;
	video?: string;
}

export interface ArchiveAttachment {
	path: string;
	originalName: string;
	mime: string;
	size: number;
}

export interface ArchiveRecord {
	slug: string;
	title: string;
	body: string;
	image: string;
	thumbnail: string;
	detail: string[];
	attachments: ArchiveAttachment[];
	published: boolean;
	sortOrder: number;
}

export interface CategoryRow {
	id: string;
	sort_order: number;
}

export interface ItemRow {
	slug: string;
	category_id: string;
	source: string;
	thumbnail: string;
	published: number;
	sort_order: number;
}

export interface ItemI18nRow {
	slug: string;
	lang: string;
	name: string;
}

export interface ModelRow {
	id: number;
	item_slug: string;
	model_key: string;
	sort_order: number;
}

export interface ModelI18nRow {
	model_row_id: number;
	lang: string;
	label: string;
	subtitle: string;
	specs_json: string;
}

export interface ModelImageRow {
	id: number;
	model_row_id: number;
	src: string;
	alt_text: string;
	sort_order: number;
}

export interface ArchiveRow {
	slug: string;
	image: string;
	thumbnail: string;
	attachments_json: string;
	published: number;
	sort_order: number;
}

export interface ArchiveI18nRow {
	slug: string;
	lang: string;
	title: string;
	body: string;
	detail_json: string;
}

export interface VideoRow {
	slug: string;
	title: string;
	media_label: string;
	type: string;
	thumbnail: string;
	poster: string;
	video: string;
	embed: string;
	source: string;
	published: number;
	sort_order: number;
}

export interface VideoI18nRow {
	slug: string;
	lang: string;
	description: string;
}

export interface UiDocumentRow {
	lang: string;
	payload_json: string;
}

export interface SessionPayload {
	authenticated: true;
	csrf: string;
	lastActive: number;
}
