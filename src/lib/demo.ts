import { CONTACTS } from "@/lib/contact";

/**
 * "Book a demo" is a modal form. Any trigger calls openDemo(); the globally-
 * mounted BookDemoDialog listens for this event and opens. (A tiny window-event
 * bus avoids threading state through every server component that has a CTA.)
 */
export const OPEN_DEMO_EVENT = "toorunt:open-demo";
export const CLOSE_DEMO_EVENT = "toorunt:close-demo";

export function openDemo() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_DEMO_EVENT));
}

/**
 * The site is a static export (no backend), so the form is relayed to the team's
 * inboxes by FormSubmit.co — a free forwarder. It POSTs to the primary contact
 * and CCs the rest. One-time activation: the first submission triggers a
 * confirmation email to the primary address; click it once and every later
 * submission is delivered. Swap this URL for another relay (Web3Forms, a real
 * API) without touching the dialog.
 */
export const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACTS[0].email)}`;
export const FORMSUBMIT_CC = CONTACTS.slice(1).map((c) => c.email).join(",");
