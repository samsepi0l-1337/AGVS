import { animateWindowScroll } from "../core/windowScroll.js";

import type { SnapHandle } from "../home/sectionSnap.js";

/** Footer "back to top": use the snap when the page has one, else scroll natively. */
export function initFooterTopBtn(snap: SnapHandle | null): void {
	const btn = document.querySelector(".FooterTopBtn");
	if (!btn) return;

	btn.addEventListener("click", () => {
		if (snap) {
			snap.go(0);
			return;
		}
		animateWindowScroll(0);
	});
}
