import { queryAll, targetClosest, targetElement } from "../core/dom.js";

const TRIGGER_SELECTOR = ".ContactUsBtn a, .Sec03ContactBtn";
const FOCUSABLE =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Contact popup: open/close, focus trap, and the `isPopupOpen` body class the
 * scroll lock hangs off. Every scroll handler consults `popupIsOpen()` rather
 * than this module, so nothing here needs to notify them.
 */
export function initContactPop(): void {
	const pop = document.getElementById("ContactUsPop");
	if (!pop) return;

	const closeBtn = pop.querySelector<HTMLElement>(".PopClose");
	const triggers = queryAll(TRIGGER_SELECTOR);
	let lastFocused: Element | null = null;

	function isOpen(): boolean {
		return pop!.classList.contains("isOpen");
	}

	function open(trigger: Element | null): void {
		lastFocused = trigger || document.activeElement;
		pop!.classList.add("isOpen");
		pop!.setAttribute("aria-hidden", "false");
		document.body.classList.add("isPopupOpen");
		if (closeBtn) closeBtn.focus();
	}

	function close(): void {
		if (!isOpen()) return;
		pop!.classList.remove("isOpen");
		pop!.setAttribute("aria-hidden", "true");
		document.body.classList.remove("isPopupOpen");
		if (lastFocused instanceof HTMLElement) {
			lastFocused.focus();
		}
		lastFocused = null;
	}

	triggers.forEach((trigger) => {
		trigger.addEventListener("click", (e) => {
			e.preventDefault();
			open(trigger);
		});
	});

	if (closeBtn) {
		closeBtn.addEventListener("click", close);
	}

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen()) close();
	});

	function focusables(): HTMLElement[] {
		return queryAll<HTMLElement>(FOCUSABLE, pop!).filter(
			(el) =>
				!(el as HTMLElement & { disabled?: boolean }).disabled &&
				el.getClientRects().length > 0,
		);
	}

	document.addEventListener("keydown", (e) => {
		if (e.key !== "Tab" || !isOpen()) return;

		const items = focusables();
		if (!items.length) return;

		const first = items[0] as HTMLElement;
		const last = items[items.length - 1] as HTMLElement;

		if (!pop!.contains(document.activeElement)) {
			e.preventDefault();
			(e.shiftKey ? last : first).focus();
			return;
		}
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	});

	document.addEventListener("click", (e) => {
		if (!isOpen()) return;
		if (pop!.contains(targetElement(e.target))) return;
		if (targetClosest(e.target, TRIGGER_SELECTOR)) return;
		close();
	});
}
