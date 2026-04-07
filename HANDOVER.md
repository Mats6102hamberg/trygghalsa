# Handover — Hälsakoll (formerly TryggHälsa)

## Pending tasks (when Loopia DNS transfer completes)

### 1. DNS CNAME records for Clerk
Add these 5 CNAME records in Vercel DNS for `halsakoll.se`:

| Name | Value |
|---|---|
| `clerk` | `frontend-api.clerk.services` |
| `accounts` | `accounts.clerk.services` |
| `clkmail` | `mail.1h1vl4wmp7g8.clerk.services` |
| `clk._domainkey` | `dkim1.1h1vl4wmp7g8.clerk.services` |
| `clk2._domainkey` | `dkim2.1h1vl4wmp7g8.clerk.services` |

Then verify in Clerk Dashboard → Configure → Developers → Domains → "Verify configuration"

### 2. Switch to Clerk Production keys
Update in Vercel env vars:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → (pk_live from Clerk Dashboard → Production → API keys)
- `CLERK_SECRET_KEY` → (sk_live from Clerk Dashboard → Production → API keys)

### 3. Connect halsakoll.se to Vercel project
- Vercel → trygghalsa project → Settings → Domains → Add `halsakoll.se`

### 4. Update NEXT_PUBLIC_APP_URL
- Change from `https://trygghalsa.vercel.app` to `https://halsakoll.se`

### 5. Update Stripe webhook URL
- Stripe Dashboard → Webhooks → Edit endpoint URL to `https://halsakoll.se/api/stripe/webhook`
- Or create a new webhook endpoint and delete the old one

### 6. Google OAuth for Clerk Production
- Clerk Overview shows "Setup social connection credentials 0/1 Complete"
- Need to create Google OAuth 2.0 Client ID in Google Cloud Console
- Add redirect URI from Clerk, paste Client ID + Secret in Clerk → SSO connections

### 7. ~~Rename middleware.ts to proxy.ts~~ ✅ KLAR
- Genomfört: `src/middleware.ts` → `src/proxy.ts` i commit `8a01bcd`

## PWA — Kvarvarande (valfritt)
- `public/sw.js` är genererad vid build — lägg till i `.gitignore` om du vill undvika att committa den i framtiden
- Serwist v9 stöder inte Turbopack ännu; följ https://github.com/serwist/serwist/issues/54 — när det löses kan `--webpack` tas bort från build-scriptet
- Testa background sync på riktig mobil (Chrome DevTools → Application → Background Sync)

## Current Clerk setup
- **Old app (dev, currently active):** wealthy-krill-15 (keys in Vercel env vars)
- **New app (production, waiting for DNS):** halsakoll.se (keys in Clerk Dashboard)

## Environment
- **Vercel project:** "safety" (displays as safety, repo is trygghalsa)
- **Live URL:** trygghalsa.vercel.app
- **Future URL:** halsakoll.se
- **Repo:** github.com/Mats6102hamberg/trygghalsa
- **Branch:** main
- **Latest commit:** `401be90` feat: rename to Hälsakoll, add full marketing landing page
