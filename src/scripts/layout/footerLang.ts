import { queryAll } from "../core/dom.js";

interface LangSwitch {
	wrap: HTMLElement;
	btn: HTMLElement;
	menu: HTMLElement;
	current: HTMLElement;
	options: HTMLElement[];
}

type LangCode = "KR" | "EN" | "JP";

export function initFooterLang(): void {
	const wraps = queryAll<HTMLElement>(".LangSwitch");
	if (!wraps.length) return;

	const switches = wraps
		.map(function (wrap): LangSwitch | null {
			const btn = wrap.querySelector<HTMLElement>(".LangSwitchBtn");
			const menu = wrap.querySelector<HTMLElement>(".LangSwitchMenu");
			const current = wrap.querySelector<HTMLElement>(".LangSwitchCurrent");
			const options = queryAll<HTMLElement>(".LangSwitchOption", wrap);
			if (!btn || !menu || !current || !options.length) return null;

			return {
				wrap: wrap,
				btn: btn,
				menu: menu,
				current: current,
				options: options,
			};
		})
		.filter(function (langSwitch): langSwitch is LangSwitch {
			return !!langSwitch;
		});
	if (!switches.length) return;

	function setOpen(langSwitch: LangSwitch, open: boolean): void {
		langSwitch.wrap.classList.toggle("isOpen", open);
		langSwitch.btn.setAttribute("aria-expanded", open ? "true" : "false");
		if (open) langSwitch.menu.removeAttribute("hidden");
		else langSwitch.menu.setAttribute("hidden", "");
	}

	function closeAll(except: LangSwitch): void {
		switches.forEach(function (langSwitch) {
			if (langSwitch !== except) setOpen(langSwitch, false);
		});
	}

	function normalizeLang(code: string | null): LangCode | null {
		const upper = String(code || "")
			.trim()
			.toUpperCase();
		if (upper === "KR" || upper === "EN" || upper === "JP") return upper;
		return null;
	}

	function syncLangUI(code: LangCode): void {
		switches.forEach(function (langSwitch) {
			langSwitch.current.textContent = code;
			langSwitch.options.forEach(function (option) {
				const active = option.getAttribute("data-lang") === code;
				const roleOption = option.closest('[role="option"]');
				option.classList.toggle("isActive", active);
				if (roleOption) {
					roleOption.setAttribute("aria-selected", active ? "true" : "false");
				}
			});
			setOpen(langSwitch, false);
		});
	}

	function buildStaticLangUrl(code: LangCode): string {
		const url = new URL(window.location.href);
		const segments = url.pathname.split("/");
		let file = segments.pop() || "";
		if (!file) {
			// pathname ended with /
			file = "index.html";
		}
		if (file === "en" || file === "jp") {
			segments.push(file);
			file = "index.html";
		}
		if (
			segments.length &&
			(segments[segments.length - 1] === "en" ||
				segments[segments.length - 1] === "jp")
		) {
			segments.pop();
		}
		if (code !== "KR") {
			segments.push(code.toLowerCase());
		}
		segments.push(file);
		url.pathname = segments.join("/") || "/";
		return url.pathname + url.search + url.hash;
	}

	function setLang(code: string | null): void {
		const next = normalizeLang(code);
		if (!next) return;
		const prev = (switches[0].current.textContent as string)
			.trim()
			.toUpperCase();
		if (next === prev) {
			syncLangUI(next);
			return;
		}
		document.cookie =
			"agvs_lang=" +
			encodeURIComponent(next) +
			"; path=/; max-age=31536000; SameSite=Lax";

		const path = window.location.pathname;
		const isStatic = /\.html$/i.test(path) || /\/(en|jp)(\/|$)/i.test(path);

		if (isStatic) {
			window.location.assign(buildStaticLangUrl(next));
			return;
		}

		// PHP local server: keep ?lang=
		const url = new URL(window.location.href);
		if (next === "KR") url.searchParams.delete("lang");
		else url.searchParams.set("lang", next);
		window.location.assign(url.toString());
	}

	function focusOption(langSwitch: LangSwitch, index: number): void {
		const count = langSwitch.options.length;
		langSwitch.options[(index + count) % count].focus();
	}

	syncLangUI(
		normalizeLang(switches[0].current.textContent as string) || "KR",
	);

	switches.forEach(function (langSwitch) {
		langSwitch.btn.addEventListener("click", function (e) {
			e.stopPropagation();
			const opening = !langSwitch.wrap.classList.contains("isOpen");
			if (opening) closeAll(langSwitch);
			setOpen(langSwitch, opening);
		});

		langSwitch.btn.addEventListener("keydown", function (e) {
			if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
			e.preventDefault();
			closeAll(langSwitch);
			setOpen(langSwitch, true);
			focusOption(
				langSwitch,
				e.key === "ArrowUp" ? langSwitch.options.length - 1 : 0,
			);
		});

		langSwitch.options.forEach(function (option, index) {
			option.addEventListener("click", function (e) {
				e.stopPropagation();
				setLang(option.getAttribute("data-lang"));
			});

			option.addEventListener("keydown", function (e) {
				let nextIndex: number | null = null;
				if (e.key === "ArrowDown") nextIndex = index + 1;
				else if (e.key === "ArrowUp") nextIndex = index - 1;
				else if (e.key === "Home") nextIndex = 0;
				else if (e.key === "End") {
					nextIndex = langSwitch.options.length - 1;
				}
				if (nextIndex === null) return;
				e.preventDefault();
				focusOption(langSwitch, nextIndex);
			});
		});

		langSwitch.wrap.addEventListener("focusout", function (e) {
			if (!langSwitch.wrap.contains(e.relatedTarget as Node | null)) {
				setOpen(langSwitch, false);
			}
		});
	});

	document.addEventListener("click", function (e) {
		switches.forEach(function (langSwitch) {
			if (!langSwitch.wrap.contains(e.target as Node | null)) {
				setOpen(langSwitch, false);
			}
		});
	});

	document.addEventListener("keydown", function (e) {
		if (e.key !== "Escape") return;
		switches.forEach(function (langSwitch) {
			if (!langSwitch.wrap.classList.contains("isOpen")) return;
			e.preventDefault();
			setOpen(langSwitch, false);
			langSwitch.btn.focus();
		});
	});
}
