# Session Summary — 2026-04-07

## What was done (2026-04-07)

### PWA — Offline-stöd och installationsprompt
- `src/sw.ts` — Serwist service worker med background sync för `/api/medications/log` (kö offline i 24h), StaleWhileRevalidate för kritiska endpoints, NetworkOnly för Clerk
- `src/components/OfflineBanner.tsx` — Amber-banner när användaren är offline
- `src/components/InstallPrompt.tsx` — iOS + Android install-prompt med localStorage-dismissed
- `src/hooks/useOnlineStatus.ts` — `useSyncExternalStore`-baserad online/offline-hook
- `public/manifest.json` — Web App Manifest (start_url: /dashboard, standalone)
- `public/icons/` — 192/384/512/maskable PNG-ikoner
- `src/app/layout.tsx` — PWA metadata (manifest, appleWebApp, viewport themeColor)
- `src/app/(dashboard)/layout.tsx` — OfflineBanner + InstallPrompt monterade
- `src/app/(dashboard)/dashboard/medications/page.tsx` — Optimistisk UI-uppdatering + 202-hantering för queued requests
- `next.config.ts` — Serwist-wrapper med `disable: dev`
- `package.json` — `--webpack` flag i build (Serwist v9 ej Turbopack-kompatibelt ännu)
- `src/proxy.ts` — Rename från `middleware.ts` (Next.js 16 deprecation fix)
- **Commit:** `8a01bcd`

## What was done (tidigare)

### Stripe Webhooks
- Created webhook endpoint in Stripe Dashboard for `https://trygghalsa.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Added `STRIPE_WEBHOOK_SECRET` to Vercel env vars
- Webhook handler already in code at `src/app/api/stripe/webhook/route.ts`

### Vercel Environment Variables
Added missing env vars to Vercel production:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID` (`price_1TEAKKJjhIlYlC5Y6lw0Bfyj`)
- `NEXT_PUBLIC_APP_URL` (`https://halsakoll.se` — currently using trygghalsa.vercel.app)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Rebrand: TryggHälsa → Hälsakoll
- Renamed across all 9 source files (page.tsx, layout.tsx, help, billing, email, AI prompt, export, care API)
- New domain `halsakoll.se` purchased via Vercel
- Commit: `401be90` — pushed to main

### New Landing Page
Full marketing page at `src/app/page.tsx` with:
- Hero section with CTA
- Target audience cards (elderly, caregivers, doctor visits)
- 9 feature cards
- "Get started in 2 minutes" steps
- Pricing (Free vs Premium 29 kr/mån)
- FAQ (6 expandable items)
- CTA + footer

### Clerk Production Setup (partial)
- Created new Clerk app "Min ansökan" with production instance for `halsakoll.se`
- Production keys generated (stored in Clerk Dashboard, not committed)
- **Blocked:** Domain `halsakoll.se` DNS transfer from Loopia not complete yet
- Currently reverted to dev keys (wealthy-krill-15) so site stays live

## Current state
- Site is live at `trygghalsa.vercel.app` with dev Clerk keys
- All features working: dashboard, medications, appointments, timeline, questions, care, help
- Landing page live with Hälsakoll branding
