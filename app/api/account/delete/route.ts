import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

// POST /api/account/delete
// Exclui a conta do usuário autenticado (LGPD): cancela a assinatura na Stripe
// (se houver) e apaga o usuário do Auth — o que cascateia todos os dados
// (profile, alunos, treinos, mensagens, etc.). Ação irreversível.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single();

  // Cancela a assinatura ativa, se existir (não bloqueia a exclusão se falhar).
  if (profile?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch (err) {
      console.error('Falha ao cancelar assinatura na exclusão de conta:', err);
    }
  }

  // Apaga o usuário do Auth (cascateia profiles -> students -> demais dados).
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: 'DELETE_FAILED', detail: error.message }, { status: 500 });
  }

  // Encerra a sessão local do usuário que acabou de ser removido.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
