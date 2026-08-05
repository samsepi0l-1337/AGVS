import { api } from "./api.js";
import { authSession, loginFailureMessage } from "./auth.js";
import { renderContent } from "./content.js";
import {
	clear,
	element,
	requiredElement,
	setButtonBusy,
} from "./dom.js";
import { renderTranslate } from "./translate.js";
import type { ContentType } from "./types.js";

const bootView = requiredElement<HTMLElement>("#bootView");
const loginView = requiredElement<HTMLElement>("#loginView");
const loginForm = requiredElement<HTMLFormElement>("#loginForm");
const loginError = requiredElement<HTMLElement>("#loginError");
const passwordInput = requiredElement<HTMLInputElement>("#adminPassword");
const loginButton = requiredElement<HTMLButtonElement>("#loginButton");
const appView = requiredElement<HTMLElement>("#appView");
const main = requiredElement<HTMLElement>("#adminMain");
const logoutButton = requiredElement<HTMLButtonElement>("#logoutButton");
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav]"));

let routeVersion = 0;

api.setUnauthorizedHandler(() => {
	authSession.clear();
	showLogin("세션이 만료되었습니다. 다시 로그인해 주세요.");
});

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const password = passwordInput.value;
	if (!password) {
		showLoginError("비밀번호를 입력해 주세요.");
		return;
	}
	setButtonBusy(loginButton, true, "로그인 중…");
	showLoginError("");
	try {
		await authSession.login(password);
		passwordInput.value = "";
		showApp();
		if (!window.location.hash || window.location.hash === "#login") {
			window.location.hash = "#dashboard";
		} else {
			await renderRoute();
		}
	} catch (error) {
		showLoginError(loginFailureMessage(error));
	} finally {
		setButtonBusy(loginButton, false);
	}
});

logoutButton.addEventListener("click", async () => {
	logoutButton.disabled = true;
	try {
		await authSession.logout();
	} catch (error) {
		console.error("Logout failed", error);
	} finally {
		logoutButton.disabled = false;
		window.location.hash = "#login";
		showLogin();
	}
});

window.addEventListener("hashchange", () => {
	if (authSession.isAuthenticated()) {
		void renderRoute();
	}
});

void initialize();

async function initialize(): Promise<void> {
	try {
		const restored = await authSession.restore();
		bootView.hidden = true;
		if (!restored) {
			showLogin();
			return;
		}
		showApp();
		if (!window.location.hash || window.location.hash === "#login") {
			window.location.hash = "#dashboard";
			return;
		}
		await renderRoute();
	} catch (error) {
		bootView.hidden = true;
		showLogin(
			error instanceof Error
				? `관리 API에 연결하지 못했습니다: ${error.message}`
				: "관리 API에 연결하지 못했습니다.",
		);
	}
}

async function renderRoute(): Promise<void> {
	const version = ++routeVersion;
	const route = parseRoute();
	if (route.kind === "login") {
		showLogin();
		return;
	}
	showApp();
	const routeRoot = element("section", { className: "routeView" });
	clear(main);
	main.append(routeRoot);
	updateNavigation(route.kind === "content" ? route.type : route.kind);
	if (route.kind === "content") {
		document.title = `${typeTitle(route.type)} 관리 · AGVS 관리자`;
		await renderContent(routeRoot, route.type, route.editSlug);
	} else if (route.kind === "translate") {
		document.title = "번역 · AGVS 관리자";
		await renderTranslate(routeRoot, route.params);
	} else {
		document.title = "대시보드 · AGVS 관리자";
		renderDashboard(routeRoot);
	}
	if (version === routeVersion) {
		main.focus({ preventScroll: true });
	}
}

function renderDashboard(root: HTMLElement): void {
	clear(root);
	root.append(
		element("h1", { text: "콘텐츠 관리" }),
		element("p", {
			className: "pageLead",
			text: "공개 페이지에 표시될 제품, AGV 영상, 자료실 콘텐츠를 관리합니다.",
		}),
	);
	const cards = element("section", {
		className: "cards",
		attributes: { "aria-label": "관리 메뉴" },
	});
	const entries = [
		{
			href: "#content/products",
			label: "제품·카테고리·모델 관리",
			detail: "제품 정보, 모델 사양과 갤러리",
		},
		{
			href: "#content/videos",
			label: "AGV 영상 관리",
			detail: "YouTube 또는 MP4 영상",
		},
		{
			href: "#content/archives",
			label: "자료실 관리",
			detail: "본문, 이미지와 문서 첨부",
		},
		{
			href: "#translate",
			label: "번역 (i18n only)",
			detail: "언어별 문구와 UI 문서",
		},
	];
	for (const entry of entries) {
		cards.append(
			element("a", { attributes: { href: entry.href } }, [
				element("strong", { text: entry.label }),
				element("span", { text: entry.detail }),
			]),
		);
	}
	root.append(cards);
}

function showLogin(message = ""): void {
	bootView.hidden = true;
	appView.hidden = true;
	loginView.hidden = false;
	showLoginError(message);
	document.title = "AGVS 관리자 로그인";
	window.requestAnimationFrame(() => passwordInput.focus());
}

function showApp(): void {
	bootView.hidden = true;
	loginView.hidden = true;
	appView.hidden = false;
}

function showLoginError(message: string): void {
	loginError.textContent = message;
	loginError.hidden = message === "";
}

function updateNavigation(active: string): void {
	for (const link of navLinks) {
		const isActive = link.dataset.nav === active;
		link.classList.toggle("isActive", isActive);
		if (isActive) {
			link.setAttribute("aria-current", "page");
		} else {
			link.removeAttribute("aria-current");
		}
	}
}

type Route =
	| { kind: "dashboard" }
	| { kind: "login" }
	| { kind: "translate"; params: URLSearchParams }
	| { kind: "content"; type: ContentType; editSlug?: string };

function parseRoute(): Route {
	const raw = window.location.hash.replace(/^#/, "") || "dashboard";
	const [path = "dashboard", query = ""] = raw.split("?", 2);
	const parts = path.split("/").filter(Boolean);
	if (parts[0] === "login") {
		return { kind: "login" };
	}
	if (parts[0] === "translate") {
		return { kind: "translate", params: new URLSearchParams(query) };
	}
	const type = contentType(parts[1]);
	if (parts[0] === "content" && type) {
		return {
			kind: "content",
			type,
			editSlug: safeDecode(parts[2]),
		};
	}
	return { kind: "dashboard" };
}

function contentType(value: string | undefined): ContentType | null {
	return value === "products" || value === "videos" || value === "archives"
		? value
		: null;
}

function safeDecode(value: string | undefined): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function typeTitle(type: ContentType): string {
	return type === "products" ? "제품" : type === "videos" ? "AGV 영상" : "자료실";
}
