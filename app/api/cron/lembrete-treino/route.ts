import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getWebPush, type PushPayload } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/cron/lembrete-treino
// Chamado pelo Vercel Cron (diário). Envia um lembrete de treino aos alunos
// inscritos em push. Protegido pelo CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Inscrições de push que pertencem a alunos.
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, profiles!inner(role)')
    .eq('profiles.role', 'aluno');

  if (!subs?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const webpush = getWebPush();
  const payload: PushPayload = {
    title: 'Bora treinar? 💪',
    body: 'Seu treino de hoje te espera no TreinaPro.',
    url: '/aluno/dashboard',
  };
  const body = JSON.stringify(payload);

  let sent = 0;
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent++;
      } catch (err: any) {
        // 404/410 = inscrição expirada: remove.
        if (err?.statusCode === 404 || err?.statusCode === 410) stale.push(s.endpoint);
      }
    })
  );

  if (stale.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', stale);
  }

  return NextResponse.json({ ok: true, sent, removed: stale.length });
}
