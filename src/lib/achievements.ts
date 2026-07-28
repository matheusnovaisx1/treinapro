export type Achievement = { id: string; emoji: string; label: string };

const STREAK_MILESTONES: { days: number; emoji: string; label: string }[] = [
  { days: 3, emoji: '🔥', label: '3 dias seguidos' },
  { days: 7, emoji: '🔥', label: 'Uma semana seguida' },
  { days: 14, emoji: '🔥', label: 'Duas semanas seguidas' },
  { days: 30, emoji: '🔥', label: 'Um mês seguido' },
  { days: 60, emoji: '🔥', label: 'Dois meses seguidos' },
  { days: 100, emoji: '🔥', label: '100 dias seguidos' },
];

const TOTAL_WORKOUT_MILESTONES: { count: number; emoji: string; label: string }[] = [
  { count: 10, emoji: '💪', label: '10 treinos concluídos' },
  { count: 25, emoji: '💪', label: '25 treinos concluídos' },
  { count: 50, emoji: '🏆', label: '50 treinos concluídos' },
  { count: 100, emoji: '🏆', label: '100 treinos concluídos' },
  { count: 200, emoji: '🏆', label: '200 treinos concluídos' },
  { count: 365, emoji: '👑', label: '365 treinos concluídos' },
];

const RECORD_MILESTONES: { count: number; emoji: string; label: string }[] = [
  { count: 1, emoji: '🏅', label: 'Primeiro recorde de carga' },
  { count: 5, emoji: '🏅', label: '5 recordes de carga' },
  { count: 10, emoji: '🥇', label: '10 recordes de carga' },
  { count: 25, emoji: '🥇', label: '25 recordes de carga' },
];

/**
 * Deriva as conquistas desbloqueadas a partir do streak, do total de treinos e
 * do número de exercícios com carga registrada — sem tabela nova no banco.
 */
export function computeAchievements(streak: number, totalWorkouts: number, recordsCount = 0): Achievement[] {
  const unlocked: Achievement[] = [];

  for (const m of STREAK_MILESTONES) {
    if (streak >= m.days) unlocked.push({ id: `streak-${m.days}`, emoji: m.emoji, label: m.label });
  }
  for (const m of TOTAL_WORKOUT_MILESTONES) {
    if (totalWorkouts >= m.count) unlocked.push({ id: `total-${m.count}`, emoji: m.emoji, label: m.label });
  }
  for (const m of RECORD_MILESTONES) {
    if (recordsCount >= m.count) unlocked.push({ id: `record-${m.count}`, emoji: m.emoji, label: m.label });
  }

  return unlocked;
}

/** A próxima conquista ainda não desbloqueada, para mostrar "faltam X" e criar expectativa. */
export function nextAchievement(
  streak: number,
  totalWorkouts: number,
  recordsCount = 0
): { emoji: string; label: string; remaining: number } | null {
  const nextStreak = STREAK_MILESTONES.find((m) => streak < m.days);
  const nextTotal = TOTAL_WORKOUT_MILESTONES.find((m) => totalWorkouts < m.count);
  const nextRecord = RECORD_MILESTONES.find((m) => recordsCount < m.count);

  const candidates = [
    nextStreak && { emoji: nextStreak.emoji, label: nextStreak.label, remaining: nextStreak.days - streak },
    nextTotal && { emoji: nextTotal.emoji, label: nextTotal.label, remaining: nextTotal.count - totalWorkouts },
    nextRecord && { emoji: nextRecord.emoji, label: nextRecord.label, remaining: nextRecord.count - recordsCount },
  ].filter((c): c is { emoji: string; label: string; remaining: number } => !!c);

  if (!candidates.length) return null;
  return candidates.sort((a, b) => a.remaining - b.remaining)[0];
}
