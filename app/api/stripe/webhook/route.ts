import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST /api/stripe/webhook
// Mantém profiles.plan sincronizado com o status da assinatura no Stripe.
// Configure este endpoint no Dashboard do Stripe (ou via `stripe listen` em dev)
// assinando: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'MISSING_SIGNATURE' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const tier = session.metadata?.plan_tier === 'pro' ? 'pro' : 'premium';
      if (userId) {
        await admin
          .from('profiles')
          .update({
            plan: tier,
            stripe_subscription_id: (session.subscription as string) ?? null,
            stripe_customer_id: (session.customer as string) ?? undefined,
          })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const tier = subscription.metadata?.plan_tier === 'pro' ? 'pro' : 'premium';
      const isActive = ['active', 'trialing'].includes(subscription.status);
      if (userId) {
        await admin
          .from('profiles')
          .update({ plan: isActive ? tier : 'free', stripe_subscription_id: subscription.id })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        await admin.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('id', userId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
