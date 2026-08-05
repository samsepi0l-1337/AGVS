import { api, ApiError } from "./api.js";
import type { LoginResponse, MeResponse, SaveResponse } from "./types.js";

export function loginFailureMessage(error: unknown): string {
	if (error instanceof ApiError && error.status === 401) {
		return "로그인 정보를 확인해 주세요.";
	}
	return error instanceof Error ? error.message : "로그인 정보를 확인해 주세요.";
}

class AuthSession {
	private authenticated = false;

	isAuthenticated(): boolean {
		return this.authenticated;
	}

	async restore(): Promise<boolean> {
		try {
			const response = await api.get<MeResponse>("/auth/me", true);
			if (!response.authenticated) {
				this.clear();
				return false;
			}
			api.setCsrfToken(response.csrfToken);
			this.authenticated = true;
			return true;
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				this.clear();
				return false;
			}
			throw error;
		}
	}

	async login(password: string): Promise<void> {
		const response = await api.post<LoginResponse>("/auth/login", { password });
		api.setCsrfToken(response.csrfToken);
		this.authenticated = true;
	}

	async logout(): Promise<void> {
		try {
			await api.post<SaveResponse>("/auth/logout");
		} finally {
			this.clear();
		}
	}

	clear(): void {
		api.setCsrfToken(null);
		this.authenticated = false;
	}
}

export const authSession = new AuthSession();
