import { query, queryAll } from "../core/dom.js";
import { animateWindowScroll } from "../core/windowScroll.js";

import type { SnapHandle } from "./sectionSnap.js";

export function initSectionButtons(snap: SnapHandle | null): void {
	const buttons = queryAll(".ScrollBtn[data-target]");
	if (!buttons.length) return;

	buttons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const target = query(btn.getAttribute("data-target") as string);
			if (!target) return;

			if (snap) {
				snap.go(snap.indexOf(target));
				return;
			}
			animateWindowScroll(
				target.getBoundingClientRect().top + window.pageYOffset,
			);
		});
	});
}
