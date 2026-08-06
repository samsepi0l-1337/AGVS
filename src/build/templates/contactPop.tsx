import type { RenderContext } from "../i18n.js";
import { Fragment, h, raw, renderToString } from "../jsx/jsx-runtime.js";

/**
 * The X in the popup's close button.
 *
 * A component rather than a copied `<svg>` block — this is the shape the
 * string templates could not express without concatenating markup.
 */
function CloseIcon() {
	return (
		<svg class="GnbToggleClose" viewBox="0 0 24 24" aria-hidden="true">
			<line x1="5" y1="5" x2="19" y2="19" />
			<line x1="19" y1="5" x2="5" y2="19" />
		</svg>
	);
}

function ContactField({
	id,
	placeholder,
}: {
	id: string;
	placeholder: string;
}) {
	return (
		<div class="ContactUsInputGroup">
			<input type="text" id={id} name={id} placeholder={placeholder} required />
		</div>
	);
}

/**
 * The contact popup, shared by every page.
 *
 * Returns a string so the string-template pages can keep interpolating it
 * unchanged while the rest of the templates are converted.
 */
export function renderContactPop(ctx: RenderContext): string {
	return renderToString(
		<>
			<div
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
						aria-label={ctx.t("contact.closeAria")}
					>
						<CloseIcon />
					</button>
					<div class="ContactUsWrap">
						<h2 id="ContactUsPopTitle">Contact Us</h2>
						<div class="ContactTop">
							{/* A trusted HTML translation, so it opts out of escaping. */}
							<p>{raw(ctx.t("contact.introHtml"))}</p>
						</div>
						<div class="ContactUnder">
							<div class="ContactLeft">
								<form action="" class="ContactForm">
									<ContactField id="name" placeholder="Name" />
									<ContactField id="email" placeholder="Email" />
									<div class="ContactUsInputGroup">
										<textarea
											id="message"
											name="message"
											rows="5"
											placeholder="Message"
											required
										></textarea>
									</div>
									<button type="submit" class="SendBtn">
										Send
									</button>
								</form>
							</div>
							<div class="ContactRight">
								<div class="ContactRightVisit">
									<h3>{ctx.t("contact.addressTitle")}</h3>
									<p>{ctx.t("contact.address")}</p>
								</div>
								<div class="ContactRightTalk">
									<h3>{ctx.t("contact.talkTitle")}</h3>
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
			<div class="PopBackdrop" aria-hidden="true"></div>
		</>,
	);
}
