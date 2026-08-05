/**
 * Lightweight MIME sniffing for admin uploads (no extra dependency).
 * Prefer buffer magic bytes; fall back to declared mimetype only for known types.
 */
export function fileTypeFromBuffer(buffer: Buffer, declared: string): string {
	if (
		buffer.length >= 3 &&
		buffer[0] === 0xff &&
		buffer[1] === 0xd8 &&
		buffer[2] === 0xff
	) {
		return "image/jpeg";
	}
	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47
	) {
		return "image/png";
	}
	if (
		buffer.length >= 12 &&
		buffer.toString("ascii", 0, 4) === "RIFF" &&
		buffer.toString("ascii", 8, 12) === "WEBP"
	) {
		return "image/webp";
	}
	if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
		return "application/pdf";
	}
	if (
		buffer.length >= 8 &&
		buffer[0] === 0xd0 &&
		buffer[1] === 0xcf &&
		buffer[2] === 0x11 &&
		buffer[3] === 0xe0
	) {
		return "application/vnd.ms-excel";
	}
	if (
		buffer.length >= 4 &&
		buffer[0] === 0x50 &&
		buffer[1] === 0x4b &&
		buffer[2] === 0x03 &&
		buffer[3] === 0x04
	) {
		// ZIP container — xlsx or similar; trust declared when allowed.
		if (
			declared ===
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		) {
			return declared;
		}
	}
	if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
		return "video/mp4";
	}
	return declared;
}
