import { easeInOutCubic, reduceMotion, windowScrollDuration } from "./motion.js";

/**
 * The single rAF-driven window scroll. Only one may run at a time — starting a
 * new one cancels the previous, which is what keeps a fast second gesture from
 * fighting the first.
 */

interface ScrollAnimation {
	frameId: number | null;
	onFinish: (() => void) | undefined;
	startTime: number | null;
	startY: number;
	targetY: number;
}

let activeWindowScroll: ScrollAnimation | null = null;

function finishWindowScroll(
	animation: ScrollAnimation | null,
	jumpToEnd: boolean,
): void {
	if (!animation || activeWindowScroll !== animation) return;

	if (animation.frameId !== null) {
		window.cancelAnimationFrame(animation.frameId);
	}
	if (jumpToEnd) window.scrollTo(0, animation.targetY);

	activeWindowScroll = null;
	if (animation.onFinish) animation.onFinish();
}

export function cancelWindowScroll(): void {
	if (activeWindowScroll) finishWindowScroll(activeWindowScroll, false);
}

/**
 * Settle any in-flight scroll immediately. Returns whether one was running, so
 * the section lock can tell "the animation overran" from "nothing to do".
 */
export function finishActiveWindowScroll(jumpToEnd: boolean): boolean {
	if (!activeWindowScroll) return false;
	finishWindowScroll(activeWindowScroll, jumpToEnd);
	return true;
}

export function animateWindowScroll(
	top: number,
	onFinish?: () => void,
	onStart?: (animated: boolean) => void,
): void {
	cancelWindowScroll();

	const maxScroll = Math.max(
		0,
		document.documentElement.scrollHeight - window.innerHeight,
	);
	const targetY = Math.max(0, Math.min(Math.round(top), maxScroll));
	const startY = window.pageYOffset;

	if (reduceMotion || Math.abs(targetY - startY) < 1) {
		if (onStart) onStart(false);
		window.scrollTo(0, targetY);
		if (onFinish) onFinish();
		return;
	}

	const animation: ScrollAnimation = {
		frameId: null,
		onFinish: onFinish,
		startTime: null,
		startY: startY,
		targetY: targetY,
	};
	activeWindowScroll = animation;

	function step(timestamp: number): void {
		if (activeWindowScroll !== animation) return;
		if (animation.startTime === null) {
			animation.startTime = timestamp;
			if (onStart) onStart(true);
		}

		const elapsed = timestamp - animation.startTime;
		const progress = Math.min(elapsed / windowScrollDuration, 1);
		const easedProgress = easeInOutCubic(progress);
		window.scrollTo(
			0,
			animation.startY +
				(animation.targetY - animation.startY) * easedProgress,
		);

		if (progress < 1) {
			animation.frameId = window.requestAnimationFrame(step);
			return;
		}
		finishWindowScroll(animation, true);
	}

	animation.frameId = window.requestAnimationFrame(step);
}
