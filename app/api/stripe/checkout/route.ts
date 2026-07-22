import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { getPlanTier, type PlanId } from '@/lib/plans';

// POST /api/stripe/checkout  { tier: 'pro' | 'premium' }
// Cria uma sessão do Stripe Checkout para o personal assinar o plano Pro ou Premium.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tier: PlanId = body.tier === 'pro' ? 'pro' : 'premium';
  const plan = getPlanTier(tier);
  const priceId = plan.stripePriceEnvVar ? process.env[plan.stripePriceEnvVar] : undefined;

  if (!priceId) {
    return NextResponse.json({ error: 'PLAN_NOT_CONFIGURED' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, stripe_customer_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'personal') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  let customerId = profile.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/personal/configuracoes/plano?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/personal/configuracoes/plano?canceled=1`,
    metadata: { supabase_user_id: user.id, plan_tier: tier },
    subscription_data: { metadata: { supabase_user_id: user.id, plan_tier: tier } },
  });

  return NextResponse.json({ url: session.url });
}
