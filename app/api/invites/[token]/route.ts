import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/invites/[token]
// Verifica um convite pelo token, sem expor a tabela `invites` inteira ao
// público (ver nota de segurança em supabase/schema.sql). Devolve apenas o
// necessário para a tela de cadastro do aluno: se é válido, o nome do
// personal e o e-mail pré-preenchido (se houver).
export async function GET(request: Request, { params }: { params: { token: string } }) {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from('invites')
    .select('status, expires_at, email, personal:profiles!invites_personal_id_fkey(full_name)')
    .eq('token', params.token)
    .single();

  if (!invite || invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    personalName: (invite.personal as any)?.full_name ?? null,
    email: invite.email ?? null,
  });
}
