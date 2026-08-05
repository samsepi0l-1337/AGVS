export const languages = ["KR", "EN", "JP"] as const;
export type Lang = (typeof languages)[number];

export const contentTypes = ["products", "videos", "archives"] as const;
export type ContentType = (typeof contentTypes)[number];

export type Localized<T> = Record<Lang, T>;

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
	descriptions: Localized<string>;
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

export interface ListResponse<T> {
	items: T[];
}

export interface ItemResponse<T> {
	item: T;
}

export interface UiResponse {
	ui: Record<string, unknown>;
}

export interface SaveResponse<T = unknown> {
	ok: true;
	item?: T;
	ui?: Record<string, unknown>;
}

export interface AuthenticatedResponse {
	authenticated: true;
	csrfToken: string;
}

export interface UnauthenticatedResponse {
	authenticated: false;
}

export type MeResponse = AuthenticatedResponse | UnauthenticatedResponse;

export interface LoginResponse {
	ok: true;
	csrfToken: string;
}
