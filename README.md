# Hälsakoll

Din hälsa, tryggt samlad på ett ställe.

Hälsakoll hjälper dig hålla koll på mediciner, läkarbesök, diagnoser och frågor till vården. Enkel att använda — även för dig som inte är van vid appar.

## Stack

- **Framework:** Next.js 16 (Turbopack)
- **Database:** Neon PostgreSQL + Prisma 7
- **Auth:** Clerk
- **Payments:** Stripe (checkout + webhooks)
- **AI:** Claude API (health summaries, question generation)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Features

- Medicinlista med tider och markering av intag
- Kommande vårdbesök
- Frågor till vården (manuella + AI-genererade)
- Tidslinje med medicinsk historik
- Hälsoöversikt med diagnoser och AI-sammanfattning
- Anhörigåtkomst (Premium)
- Nödnummer (112, 1177)
- "Viktigt idag"-dashboard
- Exportfunktion

## Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

Öppna [http://localhost:4567](http://localhost:4567).

## Environment Variables

Skapa `.env` med:

```
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

## Deploy

Deployas automatiskt via Vercel vid push till `main`.

Live: [trygghalsa.vercel.app](https://trygghalsa.vercel.app) (snart halsakoll.se)
