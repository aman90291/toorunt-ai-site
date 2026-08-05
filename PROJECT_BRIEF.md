# tOOrunt AI — Website Project Brief

> A single document that lets any designer, engineer, or AI agent pick up this
> marketing site and continue it without re-discovering the context. It covers
> what the product is, how the site is built, the current design system, the
> full history of what we've changed, and the open decisions that are next.

_Last updated: 2026‑08‑05 · Working directory: `/Users/anubhavkhandelwal/Desktop/Website`_

---

## 1. What this is

**tOOrunt AI** is a **governed AI engineering team** — not a copilot, not a single task-agent, but the *organization* around the model: one bot per teammate (each with its own Jira + GitHub identity), **14 hard gates** on every change, a **hash‑chained (tamper‑evident) audit trail**, a secrets vault, and a kill switch. A human makes exactly **three decisions** per change; everything else runs autonomously, on the record.

This repository is the **marketing website** (`toorunt.ai`) — a statically-exported Next.js site. It is *not* the product itself.

### The core thesis (the one idea the whole site sells)
> **"The bottleneck isn't writing code anymore. It's accountability."**
> AI already writes most frontier code. The reason 95% of enterprise AI pilots show no P&L impact isn't that models can't code — it's that a demo dies the moment someone asks *"who approved this?"*. tOOrunt sells the answer to that question.

### Brand voice
Confident, concrete, no hype. Numbers over adjectives. Every claim is backed by a real figure or mechanism from the product — **we never invent testimonials, customers, or commercial terms.**

### Canonical numbers & lines (single source of truth: `src/lib/stats.ts`)
| Value | Meaning |
|---|---|
| **2h 36m** | idea → deployed product (one live "founding run", July 2026) |
| **3** | human decisions per change (sign the PRD, approve the PR, unlock the merge) |
| **14** | gates per change, no exceptions |
| **$20–150** | compute cost per merged PR (metered, on the ledger) |
| **$150** | flat price per gate‑passed, complexity‑normalized merged PR |
| **$500–1,000** | loaded human cost of the same merged PR |
| **75% / 95%** | AI share of new code at Google / enterprise AI pilots with no P&L impact |

Reusable copy lines live in `LINES` (`stats.ts`): `thesis`, `worstCase` ("Worst case is a rejected pull request."), `brain` ("Anthropic sells the engineer's brain. We sell the organization the brain works inside."), `wedge`, `sub`.

---

## 2. Tech stack & architecture

- **Framework:** Next.js 15 (App Router), **static export** (`output: export`) → deploys to GitHub Pages.
- **Styling:** Tailwind CSS v4 (CSS‑first `@theme` tokens in `src/app/globals.css`). No JS theme config.
- **3D / canvas:** `three` + `@react-three/fiber` (hero particle globe; an older wave‑grid also exists).
- **Fonts:** Geist (display + body + UI), Geist Mono (data, labels, eyebrows), Inter (metric fallback).
- **Motion:** native CSS `animation-timeline: view()` + a single IntersectionObserver (`MotionRoot`) driving `data-fx` attributes. No GSAP, no Lenis, no scroll libraries.
- **Analytics:** GA4 (`G-C59E24WX8G`).
- **Forms:** the "Book a demo" form POSTs to FormSubmit.co (no backend) — see `src/lib/demo.ts`.
- **No backend.** Everything is static; dynamic behavior is client-only.

### Repo map
```
src/
  app/
    layout.tsx            # chrome only: Nav, Footer (gated), MotionRoot, PageTransition, GA
    globals.css           # THE design system — all tokens, tones, motion, component CSS
    page.tsx              # HOME
    product/page.tsx      # /product  — how it works
    pricing/page.tsx      # /pricing
    security/page.tsx     # /security
    manifesto/page.tsx    # /manifesto — long-form essay
    book/page.tsx         # /book — two-column "book a demo" (form + demo-flow infographic)
  components/
    ui.tsx                # Container, Section, SectionFrame, Heading, Accent, Hot, Button, Eyebrow, SectionRule
    Nav.tsx  Footer.tsx  FooterGate.tsx  CTASection.tsx
    hero/GlobeHero.tsx    # current hero
    three/
      globe/              # ParticleGlobe, GlobeScene, GlobeMount, positions.ts, shaders.ts
      WaveGrid.tsx  Scene3D.tsx  gl.tsx      # earlier hero (wave grid) + shared GL tiers
    system/               # the dark-revamp building blocks:
      SectionFrame usage, ControlPlane, GateChain, blocks.tsx (Figures/Ledger/Matrix/Signatures),
      charts.tsx, Panel.tsx, MotionRoot.tsx, PageTransition.tsx, PageHead.tsx
    manifesto/            # figures.tsx (conceptual SVG diagrams), GateRail.tsx
    book/DemoFlow.tsx     # the /book ticket-journey infographic
    faq/FaqSearch.tsx
    Receipts.tsx  Surface.tsx  Integrations.tsx  Timeline.tsx  StickyFeatures.tsx
    ReviewLoop.tsx  AutonomyDial.tsx  AuditTrailTicker.tsx  PricingCalculator.tsx
    BrowserFrame.tsx  MediaReveal.tsx  CountUp.tsx  Doodle.tsx  SplitWords.tsx
    DemoButton.tsx  DemoForm.tsx  LogoWordmark.tsx
  content/  features.ts  timeline.ts  faq.ts  receipts.ts
  lib/      gates.ts  stats.ts  pricing.ts  contact.ts  demo.ts  scene.ts  shots.ts
            faq-search.ts  globe-signal.ts
```

---

## 3. Design system — "Deep Cobalt Control Room"

The established **Deep Cobalt** identity remains the foundation: deep navy grounds, cobalt actions and structural light, and a blue particle globe. Supporting powder blue and verification teal create contrast without turning the page into a rainbow. One pale-sage full-screen sequence between hero and content is the only floating control-room screen. The six homepage chapters deliberately use six different compositions: converging evidence figures, a sticky product-card stack, a line-drawn gate workflow, a horizontal human-decision carousel, a comparative cost ledger, and a split market scanner. Compact channel markers and native view-timeline motion hold those scenes together. All tokens are in `src/app/globals.css` under `@theme`; `.on-dark` drops the navy another step for the hero, closing CTA, and footer.

### Palette (measured; all clear WCAG AA on their ground)
| Token | Hex | Role / contrast |
|---|---|---|
| `--color-ground` | `#0a1120` | page — deep cobalt navy |
| `--color-ground-2` | `#101a2c` | raised instruments / cards |
| `--color-ground-3` | `#17223a` | wells / inset displays |
| `--color-line` | `#1e2942` | hairlines |
| `--color-line-2` | `#2c3a58` | stronger dividers |
| `--color-ink` | `#f4f8ff` | primary text (18.2:1) |
| `--color-ink-dim` | `#a4b2c9` | body / secondary (8.9:1) |
| `--color-ink-faint` | `#7c8ba6` | captions, mono labels (5.4:1) |
| `--color-accent` | `#4392f1` | cobalt — primary brand / structure |
| `--color-accent-text` | `#6fabf5` | luminous cobalt text |
| `--color-accent-wash` | `#12203a` | cobalt's own well |
| `--color-gold` | `#ffd166` | sunglow — live/attention |
| `--color-pass` | `#5fd8c0` | teal — verified/automatic |
| `--color-danger` | `#ec8175` | coral — cost/danger |
| `.on-dark` grounds | `#060c17 / #0c1423 / #131c30` | the deeper "bookend" scope |

### Section hues (chromatic rail rhythm — `--hue-1..5`)
Each `SectionFrame` cycles a hue used only for its rail, panel edge, and meaningful data marks. Homepage chapters override that generic cycle semantically (cobalt for evidence/comparison, teal for product/verification, plum for judgment, clay for economics). Meaning is preserved and always paired with text/glyphs:
`hue-1 cobalt #4392f1 · hue-2 teal #5fd8c0 · hue-3 sunglow #ffd166 · hue-4 supporting plum #b59fb2 · hue-5 coral #ec8175`.

### Type ramp (fluid `clamp()`)
`--text-stat` 46–74 · `--text-hero` 34–60 · `--text-h2` 30–48 · `--text-figure` 23–34 · `--text-h3` 20–26 · `--text-lead` 16–19 · `--text-body` 15–16. Headings are `text-display` (white by default) via `<Heading>`; `<Accent>` = weight bump in the display color; `<Hot>` = the scarce accent-colored emphasis.

### Spacing
`--space-section` clamp(56,5.5vw,84) · `--space-block` clamp(32,4vw,56) · `--gutter` clamp(20,4vw,56). Container max‑width 1240 (1560 `wide`).

### The section system — `SectionFrame` (the page's spine)
Every major band is a `SectionFrame`: a hairline top rule, a **sticky numbered rail** (mono index + label + hue rule) in a 128px left column, and the content on the right. Props: `index`, `label`, `hue?`, `motion?`, `wide?`. `motion` is semantic (`split`, `dock`, `sequence`, `orbit`, `reconcile`, `scan`, `conversation`, `dial`, `spread`, `meter`, `stack`, `hash`) so each section moves according to what it explains. `/manifesto` uses bespoke section markup.

### Motion (`data-fx` vocabulary, driven by `MotionRoot` + CSS view-timelines)
The base `data-fx` vocabulary remains: `rise`, `words`, `draw`, `chain`, `lift`, `meter`, `seq`, `label`. `SectionFrame.motion` now reinterprets those entrances per section. The new `SystemSequence` uses a native named view-timeline to dock a tilted control-room screen as the reader scrolls; on mobile it becomes ordinary document flow. A fixed **3%‑opacity fractal-noise grain** prevents dark-gradient banding. **Reduced-motion is fully respected** — everything is authored visible; animation only enhances.

### Canvases
- **Hero:** particle globe — `hero/GlobeHero.tsx` + `three/globe/ParticleGlobe.tsx` (FBO/GPGPU-style particle field on a sphere). The cobalt-blue particle globe sits asymmetrically beside the thesis and carries a `14 / 14` accountability readout.
- **Legacy:** `three/WaveGrid.tsx` (wave‑propagation cube grid) and `Scene3D.tsx` still in the tree from an earlier hero.
- Shared perf tiers + WebGL error boundary + in‑view gating in `three/gl.tsx` (only the on-screen canvas renders).

### Infographics (a house style)
Abstract, geometric, palette‑themed SVG diagrams — never screenshots — built on a shared grammar (1.5px strokes, 8px radii, mono labels, colors via CSS vars so they theme on any ground). Examples: `manifesto/figures.tsx` (bottleneck pipeline, 95/5 bar, gate boundary zones, hash‑chain, cost table, pyramid), `manifesto/GateRail.tsx` (all 14 gates from `gates.ts`), `book/DemoFlow.tsx` (the ticket's journey through a live session), `system/GateChain.tsx`, `system/charts.tsx`.

### Data model / single sources of truth
- `lib/gates.ts` — the **14 gates** verbatim (name, evidence, `actor: auto|human`); 3 are human (04 plan, 12 review, 13 merge). A dev‑mode invariant enforces exactly 3 human gates across `gates.ts` + `timeline.ts`.
- `lib/stats.ts` — `RECEIPT`, `ECON`, `LINES` (see §1).
- `content/timeline.ts` — the 7‑beat idea→shipped rail.
- `content/features.ts`, `content/faq.ts`, `content/receipts.ts`, `lib/pricing.ts`, `lib/contact.ts`.

---

## 4. Page inventory

| Route | What it is |
|---|---|
| **`/`** (home) | Asymmetric particle-globe hero leading on the core thesis → pale-sage scroll-docking `SystemSequence` (founding run, all 14 gates, 3 signatures, merge receipt) → six distinct cobalt-led scenes: converging 75/95 evidence · four-card sticky product stack · fourteen-row gate workflow · three-decision carousel · cost-era ledger · split competitive scanner → integration console → sourced receipt marquee → closing CTA. The decision carousel advances only while visible, pauses on interaction, exposes direct controls, and does not auto-run under reduced motion. |
| **`/product`** | "From ticket to merged PR — every step gated." Hero + Mission‑Control screenshot → five‑phase lifecycle with per‑phase gate chips → three human decisions → ReviewLoop → AutonomyDial → the fleet → CTA. |
| **`/pricing`** | Three tiers (per‑PR $150 / per‑seat / enterprise) → cost‑eras ledger → interactive savings `PricingCalculator` → FAQ → CTA. |
| **`/security`** | The gate chain / governance model (7 `SectionFrame` bands). |
| **`/manifesto`** | Long‑form essay (Vorflux‑inspired): 9 sections, each with one conceptual diagram; numbers in monospace; closes on an image, not a CTA. |
| **`/book`** | Two‑column "book a demo": left = form (`DemoForm` → FormSubmit); right = dark panel with the `DemoFlow` ticket‑journey infographic + receipt figures + cobalt bloom. Single viewport, no footer (`FooterGate`), no page scroll on desktop. |

---

## 5. Deploy & workflow

- **Deploy:** push to `master` → `.github/workflows/deploy.yml` builds (`pnpm exec next build`, static export) and publishes to GitHub Pages at **toorunt.ai**. Remote: `git@github.com:aman90291/toorunt-ai-site.git`.
- **Local dev:** `npm run dev` (Turbopack) on `http://localhost:3000`. **Never run `next build` while the dev server is running** — they share `.next` and the build corrupts the dev chunks. Stop the server, build, then restart with a clean `.next`.
- **Verification loop:** `npx tsc --noEmit` + headless‑Chrome screenshots (SwiftShader/ANGLE flags for WebGL) before declaring anything done.
- **LOCAL‑FIRST palette rule (standing user instruction):** every visual/color change goes to localhost, gets screenshotted, and **waits for an explicit "go live"** before commit/push. Colour is judged in place, not from hex values.

---

## 6. Current release state

- **`master`** is the production branch and deploys automatically to GitHub Pages at **toorunt.ai**.
- The **Deep Cobalt Control Room** redesign supersedes the earlier `598a2f1` cobalt-on-white release: numbered `SectionFrame` rails, particle-globe hero, FAQ search, proof components, the singular pale-sage system sequence, and the six-scene homepage anthology.
- The rejected blanket sage/plum alternation is not part of the release. Cobalt remains the brand foundation throughout.

---

## 7. History — how we got here (design evolution)

1. **Cobalt palette** — replaced an amber/brown scheme with a five‑hue cobalt system (`#4392f1` primary); fixed a laggy scroll‑snap and a CTA hover layout‑shift; frosted‑glass "Book a demo" button.
2. **Wave‑grid hero** — ported Codrops' interactive wave‑propagation cube grid into the hero; later tuned darker for headline contrast; full‑viewport.
3. **On‑scroll typography** — per‑word masked heading reveals on native CSS view‑timelines (`SplitWords`), replacing a GSAP approach.
4. **`/book` page** — replaced the demo modal with a real two‑column route; later swapped its particle panel for the `DemoFlow` infographic.
5. **Manifesto redesign** — a 9‑section essay with conceptual SVG figures + `GateRail`.
6. **Home + product raise** — claim‑led hero, receipt strips, gate chips, citations, mobile fixes; a 29‑agent adversarial review caught and fixed 20 real defects (contrast, invalid `<dl>` order, hover‑only content, color‑only cues).
7. **FBO particles + globe** — added a curl‑noise particle cloud (`/book`) and a particle globe; the globe was tried behind the home timeline & manifesto, then **removed** per feedback (kept as the hero).
8. **Deep‑Cobalt dark‑first revamp** (uncommitted) — the whole site went dark navy with the `SectionFrame` rail system, globe hero, grain dither, and depth‑based rhythm.
9. **Warm light/dark experiment** (rejected and removed) — blanket sage/plum alternation solved contrast but not composition.
10. **Deep Cobalt Control Room** (uncommitted, under review) — the established cobalt theme retained; supporting sage/plum/clay accents; asymmetric thesis hero; Horeca-inspired screen docking; Skills Directory-style system density; per-page signal instruments; and semantic motion per section.

---

## 8. Current release — "Deep Cobalt Control Room"

**User feedback:** the user approved the cobalt-led redesign, requested distinct Horeca-inspired interactions for the homepage chapters, corrected the repeated floating-screen treatment, and approved publishing the resulting release. The established blue theme remains non-negotiable; supporting colors can enrich it without replacing it. The earlier strict light/dark alternation using `dceed1-aac0aa-736372-a18276-7a918d` remains rejected and removed.

**Status:** approved for production and published through the `master` GitHub Pages workflow. The rejected `.tone-light` / `.tone-dark` scopes and `SectionFrame.band` alternation are removed.

**Verification completed for this release:** TypeScript passes; all routes return successfully; desktop and 390px mobile renders have no horizontal overflow; the screen sequence falls back to document flow on mobile; the decision carousel cycles, pauses, and responds to direct controls; and reduced motion disables autoplay and scene animations.

### Design references the user provided (inspiration)
- **Vorflux** (`vorflux.com`, `/manifesto`) — manifesto structure, inline conceptual infographics, mono fact tables.
- **Factory.ai** (`/product/software-factory`) — data‑dashboard proof, outcome metrics, building‑blocks layering.
- **Pavel Mazhuga** (`pavelmazhuga.com/lab/fbo-particles`, `/lab/distorted-scroller`) — advanced 3D/particle motion.
- **Codrops** (`tympanus.net/codrops`) — the wave grid, typography animations.
- **Motion / Zajno** (`motion.zajno.com`), a CodePen UI ref, `clodo.ai` (reviews section), two Dribbble AI/energy dashboards — advanced motion and dashboard UI inspiration.

---

## 9. Guardrails (do not break these)

- **Never fabricate** customers, testimonials, logos, or commercial terms (spots, discounts, deadlines). Every number/mechanism must trace to `gates.ts` / `stats.ts` / the real product.
- **Measure contrast** for every color pairing against the ground it sits on (AA: 4.5:1 text, 3:1 non‑text). Never signal meaning by color alone — pair it with a label or glyph.
- **Local‑first for visuals** — screenshot on localhost, wait for explicit "go live" before commit/push.
- **Motion is progressive enhancement** — the page must be fully readable with no JS and under `prefers-reduced-motion`.
- **One canvas rendering at a time** — gate WebGL to the visible section.
- **Don't build while dev server runs** (shared `.next`).

---

## 10. Out of scope / unrelated

A prompt for a separate product — **"TrustXD ExamOS"** (a zero‑leakage AI exam‑proctoring platform for NEET/JEE/UPSC etc.) — was pasted mid‑session. It is **not part of this website** and has not been acted on. Confirm with the user before treating it as related work.

---

_This brief describes the repository as it stands on disk (working tree), which is ahead of and different from the live site. See §6 before assuming what production looks like._
