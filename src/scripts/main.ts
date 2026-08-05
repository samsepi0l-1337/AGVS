import { initDetailList } from "./detail/detailList.js";
import { initAnchorNav } from "./home/anchorNav.js";
import { initDragScroll } from "./home/dragScroll.js";
import { initSec02Hover, initSec02Slider } from "./home/sec02.js";
import { initSectionButtons } from "./home/sectionButtons.js";
import { initSectionSnap } from "./home/sectionSnap.js";
import { initContactPop } from "./layout/contactPop.js";
import { initFooterLang } from "./layout/footerLang.js";
import { initFooterSns } from "./layout/footerSns.js";
import { initGnb, initGnbToggle } from "./layout/gnb.js";
import { initFooterTopBtn } from "./layout/topButton.js";

function init(): void {
	initGnb();
	initGnbToggle();
	initSec02Hover();
	initSec02Slider();
	initContactPop();
	const snap = initSectionSnap();
	initSectionButtons(snap);
	initAnchorNav(snap);
	initFooterTopBtn(snap);
	initFooterLang();
	initDragScroll(snap);
	initDetailList();
	initFooterSns();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
