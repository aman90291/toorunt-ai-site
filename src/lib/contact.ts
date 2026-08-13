/** Where people reach the team. One source of truth for every CTA + the footer. */
export const CONTACTS = [
  { name: "Subhash", email: "subhash@toorunt.ai" },
  { name: "AK", email: "ak@toorunt.ai" },
];

const TO = CONTACTS.map((c) => c.email).join(",");

/** "Book a demo" — reaches both founders, prefilled subject. */
export const DEMO_MAILTO = `mailto:${TO}?subject=${encodeURIComponent("tOOrunt AI demo request")}`;

/** Generic "talk to us" — reaches both founders. */
export const CONTACT_MAILTO = `mailto:${TO}?subject=${encodeURIComponent("tOOrunt AI")}`;
