import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getWebPush, type PushPayload } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/cron/lembrete-treino
// Chamado pelo Vercel Cron (diário). Envia um lembrete de treino aos alunos
// inscritos em push. Protegido pelo CRON_SECRET. Retorna diagnóstico.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID_MISSING' }, { status: 500 });
  }

  const admin = createAdminClient();

  // Todas as inscrições e, à parte, os ids de alunos (evita depender do embed).
  const { data: subs } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth, user_id');
  const totalSubs = subs?.length ?? 0;
  if (!totalSubs) {
    return NextResponse.json({ ok: true, totalSubs: 0, targets: 0, sent: 0 });
  }

  const userIds = Array.from(new Set(subs!.map((s) => s.user_id)));
  const { data: alunos } = await admin.from('profiles').select('id').eq('role', 'aluno').in('id', userIds);
  const alunoIds = new Set((alunos ?? []).map((a) => a.id));
  const targets = subs!.filter((s) => alunoIds.has(s.user_id));

  const webpush = getWebPush();
  const payload: PushPayload = {
    title: 'Bora treinar? 💪',
    body: 'Seu treino de hoje te espera no TreinaPro.',
    url: '/aluno/dashboard',
  };
  const body = JSON.stringify(payload);

  let sent = 0;
  const stale: string[] = [];
  const failures: { status?: number; message?: string }[] = [];

  await Promise.all(
    targets.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body);
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          stale.push(s.endpoint);
        } else {
          failures.push({ status: err?.statusCode, message: String(err?.body ?? err?.message ?? err).slice(0, 160) });
        }
      }
    })
  );

  if (stale.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', stale);
  }

  return NextResponse.json({
    ok: true,
    totalSubs,
    targets: targets.length,
    sent,
    removed: stale.length,
    failed: failures.length,
    sampleError: failures[0] ?? null,
  });
}
