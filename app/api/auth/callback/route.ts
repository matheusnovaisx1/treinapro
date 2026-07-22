import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Troca o código do OAuth (Google) pela sessão e garante que o profile exista.
// Login social é oferecido apenas para o fluxo do personal trainer.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: existingProfile } = await supabase.from('profiles').select('id, role').eq('id', data.user.id).single();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          role: 'personal',
          full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
          email: data.user.email!,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          plan: 'free',
        });
        return NextResponse.redirect(`${origin}/personal/dashboard`);
      }

      return NextResponse.redirect(`${origin}/${existingProfile.role === 'personal' ? 'personal' : 'aluno'}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
