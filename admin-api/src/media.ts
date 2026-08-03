/**
 * Normalize stored media paths: strip ./ and leading slashes, reject traversal.
 * Mirrors PHP agvs_normalize_media_path().
 */
export function normalizeMediaPath(pathValue: string): string {
	let path = pathValue.replace(/\\/g, "/").trim();
	while (path.startsWith("./")) {
		path = path.slice(2);
	}
	path = path.replace(/^\/+/, "");
	if (path === "" || path.includes("..")) {
		return "";
	}
	return path;
}

export function assertSlug(value: string): string {
	const slug = value.trim().toLowerCase();
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error(
			"Slug must use lowercase letters, numbers, and hyphens.",
		);
	}
	return slug;
}
