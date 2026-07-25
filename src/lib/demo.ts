import { CONTACTS } from "@/lib/contact";

/**
 * "Book a demo" lives at /book (DemoForm.tsx) — every CTA is a plain link
 * there. The site is a static export (no backend), so the form is relayed to
 * the team's inboxes by FormSubmit.co — a free forwarder. It POSTs to the
 * primary contact and CCs the rest. One-time activation: the first submission
 * triggers a confirmation email to the primary address; click it once and
 * every later submission is delivered. Swap this URL for another relay
 * (Web3Forms, a real API) without touching the form.
 *
 * FormSubmit posts to ONE endpoint (the primary); everyone else is CC'd. The
 * one-time activation link is sent to the PRIMARY only — so it must be an
 * inbox we can actually open. Kept separate from CONTACTS so the footer's
 * display order stays independent of who receives the activation mail.
 */
const RELAY_PRIMARY = "ak@toorunt.ai";

export const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${encodeURIComponent(RELAY_PRIMARY)}`;
export const FORMSUBMIT_CC = CONTACTS.map((c) => c.email).filter((e) => e !== RELAY_PRIMARY).join(",");
