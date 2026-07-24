import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/push/subscribe  { endpoint, keys: { p256dh, auth } }
// Guarda a inscrição de push do dispositivo atual para o usuário logado.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const sub = await request.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'INVALID_SUBSCRIPTION' }, { status: 400 });
  }

  // Upsert por endpoint: se o mesmo dispositivo reinscrever, atualiza o dono.
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    return NextResponse.json({ error: 'SAVE_FAILED', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
