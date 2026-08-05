/**
 * Whether an overlay currently owns the viewport.
 *
 * Read straight from the DOM rather than from module state: the snap, drag and
 * touch handlers all need the answer, and routing it through shared mutable
 * state would make those modules depend on each other's load order.
 */

export function popupIsOpen(): boolean {
	const pop = document.getElementById("ContactUsPop");
	return !!pop && pop.classList.contains("isOpen");
}

export function menuIsOpen(): boolean {
	return !!document.querySelector("header.isMenuOpen");
}
