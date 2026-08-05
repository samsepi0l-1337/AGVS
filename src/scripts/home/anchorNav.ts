import { query, queryAll } from "../core/dom.js";

import type { SnapHandle } from "./sectionSnap.js";

export function initAnchorNav(snap: SnapHandle | null): void {
	const nav = query<HTMLElement>(".AnchorNav");
	if (!nav || !snap) return;
	const anchorNav = nav;

	const links = queryAll<HTMLAnchorElement>("a", anchorNav);
	if (!links.length) return;

	function setActive(index: number): void {
		links.forEach((link, i) => {
			link.classList.toggle("isActive", i === index);
		});
		anchorNav.classList.toggle("isHidden", index >= links.length);
	}

	links.forEach((link, i) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			snap.go(i);
		});
	});

	window.addEventListener(
		"scroll",
		() => {
			setActive(snap.currentIndex());
		},
		{ passive: true },
	);

	setActive(snap.currentIndex());
}
