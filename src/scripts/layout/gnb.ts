import { targetElement } from "../core/dom.js";

/**
 * Desktop dropdown.
 *
 * Submenus are `<ul>`s nested in each `#Gnb > li` but positioned against `#Gnb`,
 * so every submenu's first item lines up with the "About" label. Closing is bound
 * to the whole `header`, not to each `li` — that is what stops the flicker when
 * the pointer travels from a top item into its own dropdown.
 */
export function initGnb(): void {
	const gnb = document.getElementById("Gnb");
	const header = document.querySelector("header");
	const backdrop = document.querySelector<HTMLElement>(".GnbBackdrop");
	if (!gnb || !header) return;

	const topItems = Array.prototype.slice.call(gnb.children) as Element[];
	const items = topItems.filter((li) => !!li.querySelector(":scope > ul"));
	if (!items.length) return;

	function closeAll(): void {
		items.forEach((li) => {
			li.classList.remove("isOpen");
		});
		if (backdrop) {
			backdrop.classList.remove("isOpen");
			backdrop.style.height = "0px";
		}
	}

	function open(li: Element): void {
		items.forEach((other) => {
			other.classList.toggle("isOpen", other === li);
		});

		if (!backdrop) return;
		const submenu = li.querySelector(":scope > ul");
		if (!submenu) return;
		// CSS cannot size the shared backdrop to whichever submenu opened.
		backdrop.style.height = submenu.scrollHeight + "px";
		backdrop.classList.add("isOpen");
	}

	function onEnter(li: Element): void {
		if (li.querySelector(":scope > ul")) open(li);
		else closeAll();
	}

	topItems.forEach((li) => {
		li.addEventListener("mouseenter", () => {
			onEnter(li);
		});
		li.addEventListener("focusin", () => {
			onEnter(li);
		});
	});

	header.addEventListener("mouseleave", closeAll);
	header.addEventListener("focusout", (e) => {
		if (!header.contains(targetElement(e.relatedTarget))) closeAll();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeAll();
	});
}

/** Mobile hamburger. */
export function initGnbToggle(): void {
	const headerEl = document.querySelector("header");
	const toggleEl = document.querySelector(".GnbToggle");
	if (!toggleEl || !headerEl) return;

	// Bound after the guard: narrowing from the early return does not reach a
	// function declaration that runs later.
	const header = headerEl;
	const toggle = toggleEl;

	function setOpen(open: boolean): void {
		header.classList.toggle("isMenuOpen", open);
		document.documentElement.classList.toggle("isGnbMenuOpen", open);
		document.body.classList.toggle("isGnbMenuOpen", open);
		toggle.setAttribute("aria-expanded", open ? "true" : "false");
	}

	toggle.addEventListener("click", (e) => {
		e.stopPropagation();
		setOpen(!header.classList.contains("isMenuOpen"));
	});

	document.addEventListener("click", (e) => {
		if (!header.classList.contains("isMenuOpen")) return;
		if (header.contains(targetElement(e.target))) return;
		setOpen(false);
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") setOpen(false);
	});

	window.addEventListener("resize", () => {
		if (
			header.classList.contains("isMenuOpen") &&
			window.matchMedia("(min-width: 992px)").matches
		) {
			setOpen(false);
		}
	});
}
