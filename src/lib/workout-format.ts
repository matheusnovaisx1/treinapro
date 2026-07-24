// Formatação e agrupamento de exercícios de um dia de treino.
// Campos novos (opcionais, guardados no JSON de workouts.days):
//   unit:  'reps' (padrão) | 'seg'  → isometria: o valor de reps são segundos
//   group: string | null            → exercícios consecutivos com o mesmo id
//                                      formam um bi-set/tri-set (super-set)

export type SchemeItem = {
  sets: number;
  reps: string;
  rest_seconds: number;
  unit?: 'reps' | 'seg' | null;
  group?: string | null;
};

/** "3x10-12" para repetições, "3x30s" para isometria. */
export function formatScheme(ex: { sets: number; reps: string; unit?: 'reps' | 'seg' | null }): string {
  const suffix = ex.unit === 'seg' ? 's' : '';
  return `${ex.sets}x${ex.reps}${suffix}`;
}

/** Cronômetro: segundos → "MM:SS" (ou "H:MM:SS" acima de 1h). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Rótulo curto de duração: "42 min", "1h05", "38s". */
export function formatDurationLabel(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m} min`;
}

/** Rótulo do super-set conforme o número de exercícios agrupados. */
export function supersetLabel(size: number): string {
  if (size === 2) return 'Bi-set';
  if (size === 3) return 'Tri-set';
  return 'Super-set';
}

/**
 * Agrupa exercícios consecutivos que compartilham o mesmo `group` (não nulo).
 * Exercícios sem grupo (ou com grupo diferente do anterior) formam blocos de 1.
 */
export function groupConsecutive<T extends { group?: string | null }>(items: T[]): T[][] {
  const blocks: T[][] = [];
  for (const it of items) {
    const last = blocks[blocks.length - 1];
    if (last && it.group && last[0].group === it.group) {
      last.push(it);
    } else {
      blocks.push([it]);
    }
  }
  return blocks;
}
