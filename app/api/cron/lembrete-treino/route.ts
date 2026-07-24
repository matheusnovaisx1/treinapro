import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getWebPush, type PushPayload } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Data de "hoje" no fuso de São Paulo (BRT, UTC-3, sem horário de verão).
function todaySaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

// GET /api/cron/lembrete-treino
// Cron diário. Envia (prioridade nesta ordem):
//   1. Aviso de desafio para quem está a 1-2 treinos do 1º lugar.
//   2. Lembrete de treino para quem ainda não treinou hoje.
// Protegido pelo CRON_SECRET. Retorna diagnóstico.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID_MISSING' }, { status: 500 });
  }

  const admin = createAdminClient();
  const today = todaySaoPaulo();
  const startOfTodayUtc = `${today}T03:00:00Z`; // meia-noite BRT em UTC

  // Inscrições de push.
  const { data: subs } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth, user_id');
  if (!subs?.length) return NextResponse.json({ ok: true, totalSubs: 0, sent: 0 });

  // Perfis que são alunos, entre os inscritos, e seus student_id.
  const userIds = Array.from(new Set(subs.map((s) => s.user_id)));
  const { data: students } = await admin
    .from('students')
    .select('id, profile_id')
    .in('profile_id', userIds)
    .eq('status', 'active');
  const profileToStudent = new Map((students ?? []).map((s) => [s.profile_id, s.id]));
  const studentIds = (students ?? []).map((s) => s.id);

  // Quem já treinou hoje (BRT) → não recebe o lembrete padrão.
  const trained = new Set<string>();
  if (studentIds.length) {
    const { data: logs } = await admin
      .from('workout_logs')
      .select('student_id')
      .in('student_id', studentIds)
      .gte('completed_at', startOfTodayUtc);
    (logs ?? []).forEach((l) => trained.add(l.student_id));
  }

  // Aviso de desafio: para cada desafio ativo, quem está a 1-2 treinos do líder.
  // Map student_id → { name, gap } (menor gap, se estiver em vários desafios).
  const nudge = new Map<string, { name: string; gap: number }>();
  const { data: activeChallenges } = await admin
    .from('challenges')
    .select('id, name, start_date, end_date')
    .lte('start_date', today)
    .gte('end_date', today);

  for (const c of activeChallenges ?? []) {
    const { data: parts } = await admin
      .from('challenge_participants')
      .select('student_id')
      .eq('challenge_id', c.id);
    const partIds = (parts ?? []).map((p) => p.student_id);
    if (partIds.length < 2) continue;

    const { data: cLogs } = await admin
      .from('workout_logs')
      .select('student_id')
      .in('student_id', partIds)
      .gte('completed_at', `${c.start_date}T00:00:00Z`)
      .lte('completed_at', `${c.end_date}T23:59:59Z`);

    const score = new Map<string, number>(partIds.map((id) => [id, 0]));
    (cLogs ?? []).forEach((l) => score.set(l.student_id, (score.get(l.student_id) ?? 0) + 1));
    const leader = Math.max(...score.values());
    if (leader === 0) continue; // ninguém treinou ainda; sem "quase no topo"

    for (const [sid, sc] of score) {
      const gap = leader - sc;
      if (gap >= 1 && gap <= 2) {
        const prev = nudge.get(sid);
        if (!prev || gap < prev.gap) nudge.set(sid, { name: c.name, gap });
      }
    }
  }

  // Decide a mensagem por inscrição.
  const webpush = getWebPush();
  let sentChallenge = 0;
  let sentReminder = 0;
  const stale: string[] = [];
  const failures: { status?: number; message?: string }[] = [];

  await Promise.all(
    subs.map(async (s) => {
      const studentId = profileToStudent.get(s.user_id);
      if (!studentId) return; // não é aluno ativo

      let payload: PushPayload | null = null;
      const n = nudge.get(studentId);
      if (n) {
        payload = {
          title: '🏆 Você está quase no topo!',
          body: `Falta ${n.gap} treino${n.gap > 1 ? 's' : ''} pra assumir o 1º lugar em "${n.name}".`,
          url: '/aluno/desafios',
        };
      } else if (!trained.has(studentId)) {
        payload = {
          title: 'Bora treinar? 💪',
          body: 'Seu treino de hoje te espera no TreinaPro.',
          url: '/aluno/dashboard',
        };
      }
      if (!payload) return; // treinou hoje e não está perto no desafio

      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
        if (n) sentChallenge++;
        else sentReminder++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) stale.push(s.endpoint);
        else failures.push({ status: err?.statusCode, message: String(err?.body ?? err?.message ?? err).slice(0, 160) });
      }
    })
  );

  if (stale.length) await admin.from('push_subscriptions').delete().in('endpoint', stale);

  return NextResponse.json({
    ok: true,
    totalSubs: subs.length,
    alunos: profileToStudent.size,
    sent: sentChallenge + sentReminder,
    sentChallenge,
    sentReminder,
    removed: stale.length,
    failed: failures.length,
    sampleError: failures[0] ?? null,
  });
}
