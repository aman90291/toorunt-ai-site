"use client";

import { useEffect, useRef, useState } from "react";
import { OPEN_DEMO_EVENT, CLOSE_DEMO_EVENT, FORMSUBMIT_URL, FORMSUBMIT_CC } from "@/lib/demo";

type Status = "idle" | "submitting" | "success" | "error";
type Form = { name: string; email: string; organisation: string; location: string; phone: string };
const EMPTY: Form = { name: "", email: "", organisation: "", location: "", phone: "" };

const FIELDS: { key: keyof Form; label: string; type: string; required: boolean; autoComplete: string; placeholder: string }[] = [
  { key: "name", label: "Name", type: "text", required: true, autoComplete: "name", placeholder: "Your name" },
  { key: "email", label: "Work email", type: "email", required: true, autoComplete: "email", placeholder: "you@company.com" },
  { key: "organisation", label: "Organisation", type: "text", required: true, autoComplete: "organization", placeholder: "Company or team" },
  { key: "location", label: "Location", type: "text", required: false, autoComplete: "address-level2", placeholder: "City, country" },
  { key: "phone", label: "Phone number", type: "tel", required: false, autoComplete: "tel", placeholder: "+1 555 000 1234" },
];

/**
 * "Book a demo" modal. Collects name, email, organisation, location and phone,
 * then relays the request to the team's inboxes via FormSubmit (see lib/demo.ts).
 * Mounted once, globally; opens on the OPEN_DEMO_EVENT fired by any DemoButton.
 * Accessible (role=dialog, Escape/backdrop close, focus in, background locked).
 */
export function BookDemoDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // open on the global event
  useEffect(() => {
    const onOpen = () => { setStatus("idle"); setError(""); setOpen(true); };
    window.addEventListener(OPEN_DEMO_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_DEMO_EVENT, onOpen);
  }, []);

  // lock background scroll + focus first field + Escape to close, while open
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => firstField.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      window.dispatchEvent(new Event(CLOSE_DEMO_EVENT)); // re-enable scrolljack
    };
  }, [open]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(e.currentTarget as HTMLFormElement).checkValidity()) return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organisation: form.organisation,
          location: form.location,
          phone: form.phone,
          _subject: "tOOrunt AI — new demo request",
          _cc: FORMSUBMIT_CC,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === "true" || data.success === true)) {
        setStatus("success");
        setForm(EMPTY);
      } else {
        throw new Error(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setError("We couldn't send that just now. Please email us directly and we'll set it up.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-dialog-title"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />

      {/* panel */}
      <div
        ref={panelRef}
        data-lenis-prevent
        className="relative z-[1] max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] border border-line-2 bg-ground-2 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:p-7"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ground-3 hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-wash text-accent-text">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="demo-dialog-title" className="mt-5 font-display text-[24px] font-semibold text-ink">
              Request received.
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-ink-dim">
              Thanks — we&rsquo;ll be in touch shortly to line up your demo.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-ground transition-colors hover:bg-accent-text"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="demo-dialog-title" className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
              Book a demo
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">
              A live run on a repo you choose. Tell us where to reach you.
            </p>

            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              {FIELDS.map((f, i) => (
                <label key={f.key} className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-ink-dim">
                    {f.label}
                    {!f.required && <span className="ml-1 text-ink-faint">(optional)</span>}
                  </span>
                  <input
                    ref={i === 0 ? firstField : undefined}
                    type={f.type}
                    required={f.required}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    className="rounded-lg border border-line bg-ground px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent-text"
                  />
                </label>
              ))}

              {status === "error" && (
                <p className="text-[13px] leading-relaxed text-[#c0603f]">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[14px] font-medium text-ground transition-all hover:bg-accent-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Request demo"}
              </button>
              <p className="text-center text-[11px] text-ink-faint">
                Goes straight to the founders. No sales sequence.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
