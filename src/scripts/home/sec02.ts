import { query, queryAll } from "../core/dom.js";
import { reduceMotion } from "../core/motion.js";

export function initSec02Hover(): void {
	const container = query<HTMLElement>(".Sec02Panels");
	if (!container) return;

	const panels = queryAll<HTMLElement>(".Sec02Panel", container);
	if (!panels.length) return;

	panels.forEach((panel) => {
		panel.addEventListener("mouseenter", () => {
			panels.forEach((other) => {
				other.classList.toggle("isHoverOn", other === panel);
				other.classList.toggle("isNonHover", other !== panel);
			});
		});
	});

	container.addEventListener("mouseleave", () => {
		panels.forEach((panel) => {
			panel.classList.remove("isHoverOn");
			panel.classList.remove("isNonHover");
		});
	});
}

export function initSec02Slider(): void {
	const panels = query<HTMLElement>(".Sec02Panels");
	const dots = queryAll(".Sec02Dot");
	if (!panels || !dots.length) return;

	function setActive(index: number): void {
		dots.forEach((dot, i) => {
			dot.classList.toggle("isActive", i === index);
		});
	}

	dots.forEach((dot, i) => {
		dot.addEventListener("click", () => {
			panels.scrollTo({
				left: panels.clientWidth * i,
				behavior: reduceMotion ? "auto" : "smooth",
			});
		});
	});

	panels.addEventListener(
		"scroll",
		() => {
			const index = Math.round(panels.scrollLeft / panels.clientWidth);
			setActive(index);
		},
		{ passive: true },
	);

	setActive(0);
}
