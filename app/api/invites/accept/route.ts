import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/invites/accept  { token, userId, fullName, email }
// Chamado logo após o supabase.auth.signUp() do aluno no fluxo de convite.
// Usa o client admin (service role) porque o novo usuário ainda não tem
// permissão via RLS para se auto-vincular a um personal.
export async function POST(request: Request) {
  const { token, userId, fullName, email, phone } = await request.json();

  if (!token || !userId || !email) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin.from('invites').select('*').eq('token', token).single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'INVITE_NOT_FOUND' }, { status: 404 });
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: 'INVITE_ALREADY_USED' }, { status: 409 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    await admin.from('invites').update({ status: 'expired' }).eq('id', invite.id);
    return NextResponse.json({ error: 'INVITE_EXPIRED' }, { status: 410 });
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    role: 'aluno',
    full_name: fullName,
    email,
    phone: phone || null,
    personal_id: invite.personal_id,
    plan: 'free',
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // O trigger enforce_student_plan_limit dispara aqui e barra o insert
  // se o personal estiver no plano gratuito com 1 aluno já cadastrado.
  const { data: student, error: studentError } = await admin
    .from('students')
    .insert({ personal_id: invite.personal_id, profile_id: userId })
    .select()
    .single();

  if (studentError) {
    // desfaz o profile criado para não deixar usuário órfão
    await admin.from('profiles').delete().eq('id', userId);

    if (studentError.message.includes('PLAN_LIMIT_REACHED')) {
      return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 402 });
    }
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }

  await admin.from('invites').update({ status: 'accepted' }).eq('id', invite.id);

  return NextResponse.json({ student });
}
