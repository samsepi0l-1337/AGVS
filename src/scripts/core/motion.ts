/** Motion constants and easing shared by every scroll-driven feature. */

export const reduceMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
).matches;

/** One snap takes this long; the section lock and the header fade derive from it. */
export const windowScrollDuration = 1250;

export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ?
			4 * progress * progress * progress
		:	1 - Math.pow(-2 * progress + 2, 3) / 2;
}
