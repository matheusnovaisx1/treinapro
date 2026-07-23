// Compartilhamento do treino concluído. Usa a Web Share API (abre o menu
// nativo do celular: GymRats, Instagram, WhatsApp...) com fallback para copiar
// o texto na área de transferência quando o navegador não suporta.

export type ShareResult = 'shared' | 'cancelled' | 'copied' | 'unsupported';

export type WorkoutShare = {
  dayLabel: string;
  exerciseCount: number;
  pse: number;
  streak?: number;
};

export function buildShareText({ dayLabel, exerciseCount, pse, streak }: WorkoutShare): string {
  const lines = [
    `💪 Treino concluído: ${dayLabel}`,
    `${exerciseCount} exercício${exerciseCount === 1 ? '' : 's'} · esforço ${pse}/10`,
  ];
  if (streak && streak > 1) lines.push(`🔥 ${streak} dias seguidos`);
  lines.push('', 'Bora treinar? 💪 #TreinaPro');
  return lines.join('\n');
}

export async function shareWorkout(data: WorkoutShare): Promise<ShareResult> {
  const text = buildShareText(data);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Meu treino de hoje', text });
      return 'shared';
    } catch (err) {
      // O usuário cancelar o menu de compartilhamento lança AbortError — não é erro.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Qualquer outra falha: tenta o fallback de copiar.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'unsupported';
    }
  }

  return 'unsupported';
}
