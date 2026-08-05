export interface ElementOptions {
	className?: string;
	text?: string;
	attributes?: Record<string, string>;
}

type Child = Node | string | null | undefined;

export function element<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options: ElementOptions = {},
	children: readonly Child[] = [],
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tagName);
	if (options.className) {
		node.className = options.className;
	}
	if (options.text !== undefined) {
		node.textContent = options.text;
	}
	for (const [name, value] of Object.entries(options.attributes ?? {})) {
		node.setAttribute(name, value);
	}
	append(node, ...children);
	return node;
}

export function append(parent: Node, ...children: readonly Child[]): void {
	for (const child of children) {
		if (child === null || child === undefined) {
			continue;
		}
		parent.appendChild(
			child instanceof Node ? child : document.createTextNode(child),
		);
	}
}

export function clear(node: Element): void {
	node.replaceChildren();
}

export function requiredElement<T extends Element>(
	selector: string,
	root: ParentNode = document,
): T {
	const node = root.querySelector<T>(selector);
	if (!node) {
		throw new Error(`필수 화면 요소를 찾을 수 없습니다: ${selector}`);
	}
	return node;
}

export function inputControl(
	name: string,
	value = "",
	type = "text",
): HTMLInputElement {
	const input = element("input");
	input.name = name;
	input.type = type;
	input.value = value;
	return input;
}

export function textareaControl(name: string, value = ""): HTMLTextAreaElement {
	const textarea = element("textarea");
	textarea.name = name;
	textarea.value = value;
	return textarea;
}

export function selectControl(
	name: string,
	options: ReadonlyArray<{ value: string; label: string }>,
	selectedValue: string,
): HTMLSelectElement {
	const select = element("select");
	select.name = name;
	for (const item of options) {
		const option = element("option", { text: item.label });
		option.value = item.value;
		option.selected = item.value === selectedValue;
		select.append(option);
	}
	return select;
}

export function field(
	labelText: string,
	control: HTMLElement,
	hint = "",
): HTMLLabelElement {
	const label = element("label", { className: "field" });
	label.append(element("span", { className: "fieldLabel", text: labelText }));
	label.append(control);
	if (hint) {
		label.append(element("small", { className: "fieldHint", text: hint }));
	}
	return label;
}

export function setStatus(
	container: HTMLElement,
	message: string,
	kind: "notice" | "error" = "notice",
): void {
	container.className = `formStatus ${kind}`;
	container.textContent = message;
	container.setAttribute("role", kind === "error" ? "alert" : "status");
	container.hidden = message === "";
}

export function formText(form: HTMLFormElement, name: string): string {
	const value = new FormData(form).get(name);
	return typeof value === "string" ? value.trim() : "";
}

export function formFile(form: HTMLFormElement, name: string): File | null {
	const value = new FormData(form).get(name);
	return value instanceof File && value.size > 0 ? value : null;
}

export function setButtonBusy(
	button: HTMLButtonElement,
	busy: boolean,
	busyText = "처리 중…",
): void {
	if (busy) {
		button.dataset.idleText = button.textContent ?? "";
		button.textContent = busyText;
	} else {
		button.textContent = button.dataset.idleText ?? button.textContent;
	}
	button.disabled = busy;
}

export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 1024) {
		return `${Math.max(0, bytes)} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
