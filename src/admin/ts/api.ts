export type UploadKind = "image" | "video" | "document";

export interface UploadedFile {
	path: string;
	originalName: string;
	mime: string;
	size: number;
}

interface ApiFailure {
	error?: string;
	issues?: Array<{ path?: string; message?: string }>;
}

export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

export class ApiClient {
	private csrfToken: string | null = null;
	private unauthorizedHandler: (() => void) | null = null;

	constructor(
		private readonly basePath = "/api",
		private readonly fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
	) {}

	setCsrfToken(token: string | null): void {
		this.csrfToken = token;
	}

	setUnauthorizedHandler(handler: () => void): void {
		this.unauthorizedHandler = handler;
	}

	get<T>(path: string, allowUnauthorized = false): Promise<T> {
		return this.request<T>(path, { method: "GET" }, allowUnauthorized);
	}

	post<T>(path: string, body?: unknown): Promise<T> {
		return this.jsonMutation<T>("POST", path, body);
	}

	put<T>(path: string, body: unknown): Promise<T> {
		return this.jsonMutation<T>("PUT", path, body);
	}

	delete<T>(path: string): Promise<T> {
		return this.request<T>(path, {
			method: "DELETE",
			headers: this.csrfHeaders(),
		});
	}

	upload(
		file: File,
		kind: UploadKind,
	): Promise<{ ok: true; file: UploadedFile }> {
		const body = new FormData();
		body.append("file", file);
		body.append("kind", kind);
		return this.request<{ ok: true; file: UploadedFile }>("/content/upload", {
			method: "POST",
			headers: this.csrfHeaders(),
			body,
		});
	}

	private jsonMutation<T>(
		method: "POST" | "PUT",
		path: string,
		body: unknown,
	): Promise<T> {
		const headers = this.csrfHeaders();
		headers.set("content-type", "application/json");
		return this.request<T>(path, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	}

	private csrfHeaders(): Headers {
		const headers = new Headers();
		if (this.csrfToken) {
			headers.set("x-csrf-token", this.csrfToken);
		}
		return headers;
	}

	private async request<T>(
		path: string,
		init: RequestInit,
		allowUnauthorized = false,
	): Promise<T> {
		const response = await this.fetchImpl(`${this.basePath}${path}`, {
			...init,
			credentials: "include",
		});
		const payload = await this.readPayload(response);
		if (!response.ok) {
			if (response.status === 401 && !allowUnauthorized) {
				this.unauthorizedHandler?.();
			}
			throw new ApiError(this.errorMessage(payload, response.status), response.status);
		}
		return payload as T;
	}

	private async readPayload(response: Response): Promise<unknown> {
		if (response.status === 204) {
			return undefined;
		}
		const text = await response.text();
		if (text === "") {
			return undefined;
		}
		try {
			return JSON.parse(text) as unknown;
		} catch {
			return { error: text };
		}
	}

	private errorMessage(payload: unknown, status: number): string {
		if (typeof payload !== "object" || payload === null) {
			return `요청에 실패했습니다. (${status})`;
		}
		const failure = payload as ApiFailure;
		const issueText = failure.issues
			?.map((issue) => {
				const path = issue.path?.trim() ?? "";
				const message = issue.message?.trim() ?? "";
				return path && message ? `${path}: ${message}` : message;
			})
			.filter((issue) => issue !== "")
			.join(", ");
		return issueText || failure.error || `요청에 실패했습니다. (${status})`;
	}
}

export const api = new ApiClient();
