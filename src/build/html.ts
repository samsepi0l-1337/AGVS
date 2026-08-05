function phpString(value: unknown): string {
	if (value === null || value === false) {
		return "";
	}
	if (value === true) {
		return "1";
	}
	if (typeof value !== "number") {
		return String(value);
	}
	if (Number.isNaN(value)) {
		return "NAN";
	}
	if (value === Infinity) {
		return "INF";
	}
	if (value === -Infinity) {
		return "-INF";
	}
	if (Object.is(value, -0)) {
		return "-0";
	}
	if (Number.isSafeInteger(value)) {
		return String(value);
	}

	const precise = value.toPrecision(14);
	const exponential = value.toExponential(13).toLowerCase();
	const [coefficient, exponent] = exponential.split("e");
	const numericExponent = Number(exponent);
	if (numericExponent < -4 || numericExponent >= 14) {
		const trimmed = coefficient.replace(/(?:\.0*|(?:(\.\d*?)0+))$/, "$1");
		const scientificCoefficient = trimmed.includes(".") ? trimmed : `${trimmed}.0`;
		return `${scientificCoefficient}E${numericExponent >= 0 ? "+" : ""}${numericExponent}`;
	}

	return precise.replace(/(?:\.0*|(?:(\.\d*?)0+))$/, "$1");
}

export function esc(value: unknown): string {
	const replacements: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#039;",
	};

	return phpString(value).replace(/[&<>"']/g, (character) => replacements[character]);
}

export function phpJsonEncode(value: unknown): string {
	let encoded: string | undefined;
	try {
		encoded = JSON.stringify(value);
	} catch {
		return "";
	}
	if (encoded === undefined) {
		return "";
	}

	return encoded
		.replace(/\//g, "\\/")
		.replace(/[^\x00-\x7f]/g, (character) =>
			`\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
		);
}
