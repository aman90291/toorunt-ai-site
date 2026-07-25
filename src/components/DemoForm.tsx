"use client";

import { useState } from "react";
import { FORMSUBMIT_URL, FORMSUBMIT_CC } from "@/lib/demo";

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
 * The demo-request form — the body of the /book page. Collects name, email,
 * organisation, location and phone, then relays the request to the team's
 * inboxes via FormSubmit (see lib/demo.ts). This used to live inside the
 * BookDemoDialog modal; the fields, validation and relay are unchanged, only
 * the shell around them moved.
 */
export function DemoForm({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState("");

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

  if (status === "success") {
    return (
      <div className={`py-6 ${className}`} role="status">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-wash text-accent-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-[24px] font-semibold text-ink">Request received.</h2>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-dim">
          Thanks — we&rsquo;ll be in touch shortly to line up your demo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={`flex flex-col gap-4 ${className}`}>
      {FIELDS.map((f) => (
        <label key={f.key} className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-ink-dim">
            {f.label}
            {!f.required && <span className="ml-1 text-ink-faint">(optional)</span>}
          </span>
          <input
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

      {status === "error" && <p className="text-[13px] leading-relaxed text-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-ai mt-1 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="ai-label">{status === "submitting" ? "Sending…" : "Request demo"}</span>
      </button>
      <p className="text-[11px] text-ink-faint">Goes straight to the founders. No sales sequence.</p>
    </form>
  );
}
