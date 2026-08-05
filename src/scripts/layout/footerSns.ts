import { queryAll } from "../core/dom.js";

/** The footer SNS icons have no destinations yet. */
export function initFooterSns(): void {
	queryAll(".FooterSns > a").forEach((link) => {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			alert("아직 준비중입니다.");
		});
	});
}
