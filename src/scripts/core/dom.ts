/** Small DOM helpers so the feature modules stay free of cast noise. */

export function queryAll<T extends Element = Element>(
	selector: string,
	root: ParentNode = document,
): T[] {
	return Array.prototype.slice.call(root.querySelectorAll<T>(selector));
}

export function query<T extends Element = Element>(
	selector: string,
	root: ParentNode = document,
): T | null {
	return root.querySelector<T>(selector);
}

/** Narrows an event target to an Element, or null for text/document targets. */
export function targetElement(target: EventTarget | null): Element | null {
	return target instanceof Element ? target : null;
}

/** `closest()` on an event target, guarding non-Element targets. */
export function targetClosest(
	target: EventTarget | null,
	selector: string,
): Element | null {
	const element = targetElement(target);
	return element ? element.closest(selector) : null;
}
