import { esc } from "../html.js";
import type { RenderContext } from "../i18n.js";

export function renderContactPop(ctx: RenderContext): string {
	// Deliberately not esc(): the PHP partial emits this trusted HTML translation directly.
	const introHtml = ctx.t("contact.introHtml");

	return `<div
	id="ContactUsPop"
	class="PopOverlay"
	role="dialog"
	aria-modal="true"
	aria-labelledby="ContactUsPopTitle"
	aria-hidden="true"
>
	<div class="Pop">
		<button
			type="button"
			class="PopClose"
			aria-label="${esc(ctx.t("contact.closeAria"))}"
		>
			<svg
				class="GnbToggleClose"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<line
					x1="5"
					y1="5"
					x2="19"
					y2="19"
				/>
				<line
					x1="19"
					y1="5"
					x2="5"
					y2="19"
				/>
			</svg>
		</button>
		<div class="ContactUsWrap">
			<h2 id="ContactUsPopTitle">Contact Us</h2>
			<div class="ContactTop">
				<p>
					${introHtml}
				</p>
			</div>
			<div class="ContactUnder">
				<div class="ContactLeft">
					<form
						action=""
						class="ContactForm"
					>
						<div class="ContactUsInputGroup">
							<input
								type="text"
								id="name"
								name="name"
								placeholder="Name"
								required
							/>
						</div>
						<div class="ContactUsInputGroup">
							<input
								type="text"
								id="email"
								name="email"
								placeholder="Email"
								required
							/>
						</div>
						<div class="ContactUsInputGroup">
							<textarea
								id="message"
								name="message"
								rows="5"
								placeholder="Message"
								required
							></textarea>
						</div>
						<button
							type="submit"
							class="SendBtn"
						>
							Send
						</button>
					</form>
				</div>
				<div class="ContactRight">
					<div class="ContactRightVisit">
						<h3>${esc(ctx.t("contact.addressTitle"))}</h3>
						<p>${esc(ctx.t("contact.address"))}</p>
					</div>
					<div class="ContactRightTalk">
						<h3>${esc(ctx.t("contact.talkTitle"))}</h3>
						<p>
							TEL. +82-70-7734-7890
							<br />
							FAX. +82-303-0951-0852
							<br />
							Email: info@agvsk.com
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div
	class="PopBackdrop"
	aria-hidden="true"
></div>`;
}
