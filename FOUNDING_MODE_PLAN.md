# Founding Mode — go-to-market & client access (proposal)

> Branch: `founding-mode-flow`. **The live homepage is untouched.** This adds a
> standalone `/founding` page + this doc so we can review the flow before anything
> ships to `main`.

## The core split — two modes, two audiences
The site today sells **Engineer Mode** (governed AI engineering teams, SDLC
automation) to **technical buyers**, sales-led via *Book a demo*.

**Founding Mode** is a different audience and motion:

| | Engineer Mode (today) | Founding Mode (new) |
|---|---|---|
| Who | technical teams, CTOs | **non-technical founders** |
| Promise | "the org the brain works inside" | **"describe your app, we build it"** |
| Motion | sales-led · Book a demo | **product-led · Start building free** |
| Entry | `/` (homepage) | `/founding` |

One site, two clear doors — a hero fork: *"I have a team" → Engineer*, *"I have an idea" → Founding*.

## The funnel (self-serve, product-led)
Get them to a built, **live preview for free** — that's the aha — then convert.

1. **Land** — "I have an idea" → `/founding`
2. **Start free** — sign up, no card
3. **Describe it** — voice/text intake captures everything (idea, payments, infra, DB)
4. **Watch it build** — live preview + updates
5. **Go live free** — `yourapp.toorunt.app`
6. **Convert** — own domain · more products · voice cofounder

## Use it anywhere — one account, one backend, every client
A founder signs up **once**; the same account + product state follow them everywhere.

| Client | How | When |
|---|---|---|
| **Web app** | instant at `app.toorunt.ai` | now |
| **PWA** | Add to Home Screen (icon, push, offline) | now |
| **iPhone (native)** | TestFlight → App Store (+ voice, calls) | after the RN app |
| **Android (native)** | Play internal → Play Store | after the RN app |

**Rule:** every client is a thin front door onto the same hosted backend — which is
why hosting the backend (AWS P-1) comes first.

## Pricing (illustrative)
- **Free — $0:** describe + build + live preview on Stage · 1 product · Toorunt subdomain
- **Founder — $49/mo:** own domain · up to 5 products · voice cofounder · native apps
- **Scale — $199/mo + usage:** own cloud · higher limits · on-call/SLAs · team seats

Compute (the AI build) is the real cost — meter it, bundle generously, show it in-app
so it never silently stalls.

## Consolidated roadmap
1. **Host the backend** (AWS P-1) — the prerequisite for any client + self-serve
2. **Self-serve accounts + web client** — the first real Founding funnel
3. **PWA** — installable web + push
4. **Native apps** (React Native, iOS+Android) — + the voice cofounder
5. **GTM** — add the Founding door to the site (this branch) + billing → launch

## What's in this branch
- `src/app/founding/page.tsx` — the self-serve Founding page (matches the gallery theme)
- `FOUNDING_MODE_PLAN.md` — this doc

Nothing here is wired to signup/billing yet — it demonstrates the flow for review.
