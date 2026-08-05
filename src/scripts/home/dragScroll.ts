import { query, targetClosest } from "../core/dom.js";
import { menuIsOpen, popupIsOpen } from "../core/overlayState.js";

import type { SnapHandle } from "./sectionSnap.js";

export function initDragScroll(snap: SnapHandle | null): void {
	if (!snap) return;
	const area = query<HTMLElement>("main");
	if (!area) return;
	const dragArea = area;

	const THRESHOLD = 5;
	let startY = 0;
	let startScroll = 0;
	let pointerId: number | null = null;
	let dragging = false;

	function blocked(): boolean {
		return menuIsOpen() || popupIsOpen();
	}

	function resetDrag(): void {
		if (dragging && pointerId !== null && dragArea.releasePointerCapture) {
			try {
				dragArea.releasePointerCapture(pointerId);
			} catch (_err) {}
		}
		document.body.classList.remove("isDragging");
		pointerId = null;
		dragging = false;
	}

	function onPointerDown(e: PointerEvent): void {
		if (blocked()) return;
		if (e.pointerType !== "mouse" || e.button !== 0) return;
		if (targetClosest(e.target, "a, button")) return;

		pointerId = e.pointerId;
		startY = e.clientY;
		startScroll = window.pageYOffset;
		dragging = false;
	}

	function onPointerMove(e: PointerEvent): void {
		if (pointerId === null || e.pointerId !== pointerId) return;
		if (blocked()) {
			resetDrag();
			return;
		}

		const delta = e.clientY - startY;

		if (!dragging) {
			if (Math.abs(delta) < THRESHOLD) return;
			dragging = true;
			document.body.classList.add("isDragging");
			if (dragArea.setPointerCapture) {
				try {
					dragArea.setPointerCapture(pointerId);
				} catch (_err) {}
			}
		}

		window.scrollTo(0, startScroll - delta);
		e.preventDefault();
	}

	function onPointerUp(e: PointerEvent): void {
		if (pointerId === null || e.pointerId !== pointerId) return;
		if (blocked()) {
			resetDrag();
			return;
		}

		const wasDragging = dragging;
		if (dragging && dragArea.releasePointerCapture) {
			try {
				dragArea.releasePointerCapture(pointerId);
			} catch (_err) {}
		}
		document.body.classList.remove("isDragging");
		pointerId = null;
		dragging = false;

		if (wasDragging && snap) snap.go(snap.currentIndex());
	}

	dragArea.addEventListener("pointerdown", onPointerDown);
	dragArea.addEventListener("pointermove", onPointerMove);
	dragArea.addEventListener("pointerup", onPointerUp);
	dragArea.addEventListener("pointercancel", onPointerUp);
	dragArea.addEventListener("dragstart", (e) => {
		if (dragging) e.preventDefault();
	});
}
