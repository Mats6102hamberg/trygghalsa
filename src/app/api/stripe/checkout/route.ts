import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDbUser } from '@/lib/auth/getOrCreateUser';
import { getStripe } from '@/lib/stripe';

export async function POST() {
  const dbUserResult = await getOrCreateDbUser();
  if ('error' in dbUserResult) {
    return NextResponse.json({ error: dbUserResult.error }, { status: dbUserResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUserResult.user.id },
    select: { id: true, email: true, clerkId: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Reuse existing Stripe customer or create new one
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? undefined,
      metadata: { appUserId: user.id, clerkUserId: user.clerkId },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4567';

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`,
    metadata: { appUserId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
