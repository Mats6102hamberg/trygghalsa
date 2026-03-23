import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const appUserId = session.metadata?.appUserId;

      if (appUserId && session.subscription) {
        await prisma.user.update({
          where: { id: appUserId },
          data: {
            plan: 'premium',
            planStatus: 'active',
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: isActive ? 'premium' : 'free',
            planStatus: isActive ? 'active' : 'inactive',
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: 'free',
          planStatus: 'inactive',
          stripeSubscriptionId: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
