import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';
import { getPlanTier } from '@/lib/plans';

// POST /api/invites  { email?: string }
// Cria um convite (token único) para o personal autenticado adicionar um aluno.
// Bloqueia se o plano atual já atingiu o limite de alunos, devolvendo um código que o
// frontend usa para abrir o modal de upgrade.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role, plan').eq('id', user.id).single();

  if (!profile || profile.role !== 'personal') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const tier = getPlanTier(profile.plan);

  if (tier.studentLimit !== null) {
    const { count } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('personal_id', user.id);

    if ((count ?? 0) >= tier.studentLimit) {
      return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 402 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const token = nanoid(24);

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({ personal_id: user.id, token, email: body.email ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`;
  return NextResponse.json({ invite, inviteUrl });
}
