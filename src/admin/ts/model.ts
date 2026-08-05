interface SortableRecord {
	sortOrder: number;
}

export function assertUnchangedSlug(
	originalSlug: string,
	currentSlug: string,
): string {
	const slug = currentSlug.trim().toLowerCase();
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error("Slug must use lowercase letters, numbers, and hyphens.");
	}
	if (originalSlug !== "" && originalSlug !== slug) {
		throw new Error("Slug cannot be changed after publishing.");
	}
	return slug;
}

export function nextSortOrder(
	requested: number,
	items: readonly SortableRecord[],
): number {
	const normalized = Math.max(0, Math.trunc(requested));
	if (normalized !== 0 || items.length === 0) {
		return normalized;
	}
	return Math.max(...items.map((item) => item.sortOrder), -1) + 1;
}

export function textToLines(value: string): string[] {
	return value
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "");
}

export function parseJsonObject(raw: string): Record<string, unknown> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		throw new Error("UI payload must be valid JSON.");
	}
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		throw new Error("UI payload must be a JSON object.");
	}
	return parsed as Record<string, unknown>;
}

export function resolvePrimaryModelLabel(
	category: string,
	productName: string,
	enteredLabel: string,
	modelCount: number,
): string {
	const label = enteredLabel.trim();
	if (label !== "") {
		return label;
	}
	if (category.trim().toLowerCase() === "technology" && modelCount === 1) {
		return productName.trim();
	}
	return "";
}
