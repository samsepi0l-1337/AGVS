import { query, queryAll, targetClosest, targetElement } from "../core/dom.js";
import { windowScrollDuration } from "../core/motion.js";
import { menuIsOpen, popupIsOpen } from "../core/overlayState.js";
import {
	animateWindowScroll,
	finishActiveWindowScroll,
} from "../core/windowScroll.js";

export interface SnapHandle {
	go(index: number): number;
	currentIndex(): number;
	indexOf(section: Element | null): number;
	isLocked(): boolean;
}

export function initSectionSnap(): SnapHandle | null {
	const sections = queryAll<HTMLElement>("#FullPage > div");
	const footer = document.getElementById("Footer");
	if (footer) sections.push(footer);
	if (sections.length < 2) return null;

	const LOCK_MS = windowScrollDuration + 100;
	const header = query<HTMLElement>("header");
	const section03Index = sections.indexOf(
		document.getElementById("Section03") as HTMLElement,
	);
	const footerIndex = sections.indexOf(footer as HTMLElement);
	const headerTransitionDelay = windowScrollDuration / 2;
	const headerTransitionDuration =
		windowScrollDuration - headerTransitionDelay;
	const headerSolidEnabled =
		header && section03Index !== -1 && footerIndex !== -1;
	let locked = false;
	let lockTimer: ReturnType<typeof setTimeout> | null = null;
	let lockVersion = 0;

	if (headerSolidEnabled) {
		header.style.setProperty(
			"--headerSolidTransitionDuration",
			headerTransitionDuration + "ms",
		);
		header.style.setProperty("--headerSolidTransitionDelay", "0ms");
	}

	function setHeaderSolid(index: number, animate: boolean): void {
		if (!headerSolidEnabled || !header) return;

		const solid = index === section03Index || index === footerIndex;
		if (header.classList.contains("isSolid") === solid) return;

		header.style.setProperty(
			"--headerSolidTransitionDuration",
			(animate ? headerTransitionDuration : 0) + "ms",
		);
		header.style.setProperty(
			"--headerSolidTransitionDelay",
			(animate && solid ? headerTransitionDelay : 0) + "ms",
		);
		header.classList.toggle("isSolid", solid);

		if (!animate) {
			void header.offsetWidth;
			header.style.setProperty(
				"--headerSolidTransitionDuration",
				headerTransitionDuration + "ms",
			);
		}
	}

	function maxScroll(): number {
		return Math.max(
			0,
			document.documentElement.scrollHeight - window.innerHeight,
		);
	}

	function absoluteTopOf(section: HTMLElement): number {
		return Math.round(
			section.getBoundingClientRect().top + window.pageYOffset,
		);
	}

	function topOf(section: HTMLElement): number {
		return Math.min(absoluteTopOf(section), maxScroll());
	}

	function endOf(section: HTMLElement): number {
		return Math.max(
			topOf(section),
			Math.min(
				absoluteTopOf(section) + section.offsetHeight - window.innerHeight,
				maxScroll(),
			),
		);
	}

	function currentIndex(): number {
		const y = window.pageYOffset;
		let best = 0;
		let bestGap = Infinity;

		for (let i = 0; i < sections.length; i += 1) {
			const sectionTop = topOf(sections[i]);
			const sectionEnd = endOf(sections[i]);
			if (
				sectionEnd > sectionTop + 1 &&
				y >= sectionTop - 1 &&
				y <= sectionEnd + 1
			) {
				return i;
			}
		}

		sections.forEach((section, i) => {
			const gap = Math.abs(topOf(section) - y);
			if (gap < bestGap) {
				bestGap = gap;
				best = i;
			}
		});
		return best;
	}

	function scrollToPosition(
		targetY: number,
		onStart?: (animated: boolean) => void,
	): void {
		const version = ++lockVersion;

		function releaseLock(): void {
			if (version !== lockVersion) return;
			clearTimeout(lockTimer as ReturnType<typeof setTimeout>);
			lockTimer = null;
			locked = false;
		}

		locked = true;
		clearTimeout(lockTimer as ReturnType<typeof setTimeout>);
		lockTimer = setTimeout(() => {
			if (version !== lockVersion) return;
			finishActiveWindowScroll(true);
			releaseLock();
		}, LOCK_MS);

		animateWindowScroll(targetY, releaseLock, onStart);
	}

	function go(index: number): number {
		const i = Math.max(0, Math.min(sections.length - 1, index));
		scrollToPosition(topOf(sections[i]), (animate) => {
			setHeaderSolid(i, animate);
		});
		return i;
	}

	function move(direction: number): void {
		if (locked) return;
		const current = currentIndex();
		const section = sections[current];
		const y = Math.round(window.pageYOffset);
		const sectionTop = topOf(section);
		const sectionEnd = endOf(section);
		const sectionIsTall = sectionEnd > sectionTop + 1;

		if (sectionIsTall && direction > 0 && y < sectionEnd - 1) {
			scrollToPosition(Math.min(sectionEnd, y + window.innerHeight));
			return;
		}

		if (sectionIsTall && direction < 0 && y > sectionTop + 1) {
			scrollToPosition(Math.max(sectionTop, y - window.innerHeight));
			return;
		}

		const next = current + direction;
		if (next < 0 || next > sections.length - 1) return;
		if (direction < 0 && endOf(sections[next]) > topOf(sections[next])) {
			scrollToPosition(endOf(sections[next]));
			return;
		}
		go(next);
	}

	window.addEventListener(
		"wheel",
		(e) => {
			if (menuIsOpen() || popupIsOpen()) return;
			e.preventDefault();
			if (Math.abs(e.deltaY) < 4) return;
			move(e.deltaY > 0 ? 1 : -1);
		},
		{ passive: false },
	);

	window.addEventListener("keydown", (e) => {
		if (menuIsOpen() || popupIsOpen()) return;
		const tag = (targetElement(e.target)?.tagName || "").toLowerCase();
		if (tag === "input" || tag === "textarea" || tag === "select") return;

		switch (e.key) {
			case "ArrowDown":
			case "PageDown":
				e.preventDefault();
				move(1);
				break;
			case "ArrowUp":
			case "PageUp":
				e.preventDefault();
				move(-1);
				break;
			case " ":
				e.preventDefault();
				move(e.shiftKey ? -1 : 1);
				break;
			case "Home":
				e.preventDefault();
				if (!locked) go(0);
				break;
			case "End":
				e.preventDefault();
				if (!locked) go(sections.length - 1);
				break;
		}
	});

	let touchStartX: number | null = null;
	let touchStartY: number | null = null;
	let touchInCarousel = false;
	let touchStartInMenu = false;
	const SWIPE = 40;

	window.addEventListener(
		"touchstart",
		(e) => {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			touchInCarousel = !!targetClosest(e.target, ".Sec02Panels");
			touchStartInMenu = menuIsOpen() || popupIsOpen();
		},
		{ passive: true },
	);

	window.addEventListener(
		"touchmove",
		(e) => {
			if (menuIsOpen() || popupIsOpen()) return;
			if (touchInCarousel && touchStartX !== null) {
				const dx = e.touches[0].clientX - touchStartX;
				const dy = e.touches[0].clientY - (touchStartY as number);
				if (Math.abs(dx) > Math.abs(dy)) return;
			}
			e.preventDefault();
		},
		{ passive: false },
	);

	window.addEventListener("touchend", (e) => {
		if (touchStartY === null) return;
		const deltaX = e.changedTouches[0].clientX - (touchStartX as number);
		const delta = touchStartY - e.changedTouches[0].clientY;
		const wasHorizontalInCarousel =
			touchInCarousel && Math.abs(deltaX) > Math.abs(delta);
		const wasStartedInMenu = touchStartInMenu;
		touchStartX = null;
		touchStartY = null;
		touchInCarousel = false;
		touchStartInMenu = false;
		if (wasStartedInMenu || menuIsOpen() || popupIsOpen()) return;
		if (wasHorizontalInCarousel) return;
		if (Math.abs(delta) < SWIPE) return;
		move(delta > 0 ? 1 : -1);
	});

	let resizeTimer: ReturnType<typeof setTimeout> | null = null;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer as ReturnType<typeof setTimeout>);
		resizeTimer = setTimeout(function realign() {
			if (menuIsOpen() || popupIsOpen() || locked) {
				resizeTimer = setTimeout(realign, 200);
				return;
			}
			go(currentIndex());
		}, 200);
	});

	window.addEventListener(
		"scroll",
		() => {
			if (!locked) setHeaderSolid(currentIndex(), false);
		},
		{ passive: true },
	);

	setHeaderSolid(currentIndex(), false);

	return {
		go: go,
		currentIndex: currentIndex,
		indexOf: (section) => {
			return sections.indexOf(section as HTMLElement);
		},
		isLocked: () => {
			return locked;
		},
	};
}
