// Helpers de desafios entre alunos. Modelo em supabase/migrations/009_desafios.sql.

export type ChallengeStatus = 'scheduled' | 'active' | 'ended';

export type LeaderboardRow = {
  student_id: string;
  full_name: string | null;
  avatar_url: string | null;
  score: number;
  place: number;
};

/** Status do desafio a partir das datas (comparando por dia). */
export function challengeStatus(startDate: string, endDate: string, today = new Date()): ChallengeStatus {
  const t = ymd(today);
  if (t < startDate) return 'scheduled';
  if (t > endDate) return 'ended';
  return 'active';
}

export const STATUS_LABEL: Record<ChallengeStatus, string> = {
  scheduled: 'Agendado',
  active: 'Em andamento',
  ended: 'Encerrado',
};

/** Medalha/ícone para as três primeiras posições. */
export function medal(position: number): string | null {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return null;
}

/** Dias restantes até o fim (>= 0). Null se já encerrado. */
export function daysLeft(endDate: string, today = new Date()): number | null {
  const end = new Date(endDate + 'T00:00:00');
  const t = new Date(ymd(today) + 'T00:00:00');
  const diff = Math.ceil((end.getTime() - t.getTime()) / 86_400_000);
  return diff < 0 ? null : diff;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
