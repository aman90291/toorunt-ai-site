# Toorunt AI — marketing site

The public site for Toorunt AI: governed AI engineering teams. Dark, engineering-grade,
built to be inspected.

## Stack
- **Next.js 15** (App Router, React 19, TypeScript) — static export (`output: "export"`)
- **Tailwind CSS v4** — theme is CSS-first in `src/app/globals.css` (`@theme`), no JS config
- **Motion** — animation, loaded via `LazyMotion` in leaf client islands only
- **Lora / Inter / Geist Mono** — display / body / data (all self-hosted via `next/font`)

## Develop
```bash
pnpm install
pnpm dev            # http://localhost:3000
```

## Build & preview the static export
```bash
pnpm build          # → ./out  (fully static, Vercel-ready)
pnpm dlx serve out  # or: (cd out && python3 -m http.server 4321)
```

## Screenshots (privacy-critical)
Product screenshots are generated from Retina originals in `~/Downloads` by
`scripts/images.mjs` — it crops off all browser chrome and the personal bookmarks
bar, then emits AVIF/WebP into `public/shots/` and the typed manifest `src/lib/shots.ts`.

```bash
node scripts/images.mjs   # regenerate shots, OG images, and the app icon
```
**The originals are never committed.** After running, eyeball `public/shots/*` for any
residual chrome before publishing.

## Structure
- `src/app/*` — the five routes (home, product, security, pricing, manifesto) + sitemap/robots/icon
- `src/components/*` — UI; the signature pieces are `HeroPipeline`, `GateChain`, `AuditTrailTicker`,
  `PricingCalculator`, `AutonomyDial`, `ReviewLoop`, `BrowserFrame`
- `src/lib/*` — `gates.ts` (the canonical 14 gates, from the product), `stats.ts`, `pricing.ts`, `shots.ts` (generated)

## Notes
- Dark-only by design — tokens are the theme; no `dark:` variants.
- Every animation degrades to a meaningful static frame under `prefers-reduced-motion`.
- The domain is a placeholder (`toorunt.ai`) in metadata — swap in `src/app/layout.tsx`,
  `sitemap.ts`, `robots.ts`, and `scripts/images.mjs`.
