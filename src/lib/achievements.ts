export type Achievement = { id: string; emoji: string; label: string };

const STREAK_MILESTONES: { days: number; emoji: string; label: string }[] = [
  { days: 3, emoji: '🔥', label: '3 dias seguidos' },
  { days: 7, emoji: '🔥', label: 'Uma semana seguida' },
  { days: 14, emoji: '🔥', label: 'Duas semanas seguidas' },
  { days: 30, emoji: '🔥', label: 'Um mês seguido' },
  { days: 100, emoji: '🔥', label: '100 dias seguidos' },
];

const TOTAL_WORKOUT_MILESTONES: { count: number; emoji: string; label: string }[] = [
  { count: 10, emoji: '💪', label: '10 treinos concluídos' },
  { count: 25, emoji: '💪', label: '25 treinos concluídos' },
  { count: 50, emoji: '🏆', label: '50 treinos concluídos' },
  { count: 100, emoji: '🏆', label: '100 treinos concluídos' },
];

/**
 * Deriva as conquistas desbloqueadas a partir do streak atual e do total de
 * treinos concluídos — sem precisar de uma tabela nova no banco.
 */
export function computeAchievements(streak: number, totalWorkouts: number): Achievement[] {
  const unlocked: Achievement[] = [];

  for (const m of STREAK_MILESTONES) {
    if (streak >= m.days) unlocked.push({ id: `streak-${m.days}`, emoji: m.emoji, label: m.label });
  }
  for (const m of TOTAL_WORKOUT_MILESTONES) {
    if (totalWorkouts >= m.count) unlocked.push({ id: `total-${m.count}`, emoji: m.emoji, label: m.label });
  }

  return unlocked;
}

/** A próxima conquista ainda não desbloqueada, para mostrar "faltam X" e criar expectativa. */
export function nextAchievement(streak: number, totalWorkouts: number): { emoji: string; label: string; remaining: number } | null {
  const nextStreak = STREAK_MILESTONES.find((m) => streak < m.days);
  const nextTotal = TOTAL_WORKOUT_MILESTONES.find((m) => totalWorkouts < m.count);

  const candidates = [
    nextStreak && { emoji: nextStreak.emoji, label: nextStreak.label, remaining: nextStreak.days - streak },
    nextTotal && { emoji: nextTotal.emoji, label: nextTotal.label, remaining: nextTotal.count - totalWorkouts },
  ].filter((c): c is { emoji: string; label: string; remaining: number } => !!c);

  if (!candidates.length) return null;
  return candidates.sort((a, b) => a.remaining - b.remaining)[0];
}
