import { queryAll } from "../core/dom.js";

export function initDetailList(): void {
	const root = document.querySelector(".DetailListMain");
	if (!root) return;

	const listWrap = root.querySelector(".ListItemWrap");
	const buttons = queryAll<HTMLButtonElement>(
		".ListTitle button[data-category]",
		root,
	);
	const items =
		listWrap ? queryAll<HTMLElement>(".ItemWrap", listWrap) : [];
	if (!listWrap || !buttons.length || !items.length) return;

	const banner = root.querySelector<HTMLElement>(".TopBg");
	const title = root.querySelector<HTMLElement>(".TopBg p");
	const input = root.querySelector<HTMLInputElement>(".SearchInput");
	const empty = root.querySelector<HTMLElement>(".ListEmpty");

	function buttonFor(value: string | null): HTMLButtonElement | null {
		if (!value) return null;
		return (
			buttons.filter(function (btn) {
				return btn.getAttribute("data-category") === value;
			})[0] || null
		);
	}

	let requested: string | null = null;
	if (window.URLSearchParams) {
		requested = new URLSearchParams(window.location.search).get("category");
	}

	const initial =
		buttonFor(requested) ||
		buttons.filter(function (btn) {
			return btn.classList.contains("isOn");
		})[0];
	let category =
		initial ? initial.getAttribute("data-category") || "all" : "all";

	function apply(): void {
		const keyword = input ? input.value.trim().toLowerCase() : "";
		let shown = 0;

		items.forEach(function (item) {
			const matchCategory =
				category === "all" || item.getAttribute("data-category") === category;
			const heading = item.querySelector("h3");
			const name =
				heading ? (heading.textContent as string).trim().toLowerCase() : "";
			const matchKeyword = !keyword || name.indexOf(keyword) !== -1;
			const visible = matchCategory && matchKeyword;

			item.classList.toggle("isHidden", !visible);
			if (visible) shown += 1;
		});

		if (empty) empty.hidden = shown !== 0;
	}

	function select(btn: HTMLButtonElement): void {
		category = btn.getAttribute("data-category") || "all";

		if (window.history && window.history.replaceState && window.URL) {
			const url = new URL(window.location.href);
			const cat = btn.getAttribute("data-category") || "all";
			if (cat === "all") {
				url.searchParams.delete("category");
			} else {
				url.searchParams.set("category", cat);
			}
			window.history.replaceState(
				null,
				"",
				url.pathname + url.search + url.hash,
			);
		}

		if (banner) {
			// Snapshot the live token list so removals cannot skip adjacent stale banner classes.
			Array.from(banner.classList).forEach(function (className) {
				if (className !== "TopBg" && className.indexOf("TopBg") === 0) {
					banner.classList.remove(className);
				}
			});
			banner.classList.add(
				"TopBg" + category.charAt(0).toUpperCase() + category.slice(1),
			);
		}

		buttons.forEach(function (other) {
			const on = other === btn;
			other.classList.toggle("isOn", on);
			other.setAttribute("aria-pressed", on ? "true" : "false");
		});

		if (title) {
			title.textContent = btn.getAttribute("data-title") || "ALL Item";
		}
	}

	buttons.forEach(function (btn) {
		btn.addEventListener("click", function () {
			select(btn);
			apply();
		});
	});

	if (initial) select(initial);

	if (input) {
		input.addEventListener("input", apply);
		input.addEventListener("search", apply);
	}

	apply();
}
