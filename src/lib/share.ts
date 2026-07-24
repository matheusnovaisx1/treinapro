// Compartilhamento do treino concluído. Usa a Web Share API (abre o menu
// nativo do celular: GymRats, Instagram, WhatsApp...) com fallback para copiar
// o texto na área de transferência quando o navegador não suporta.

import { buildWorkoutImageBlob } from './workout-image';
import { formatDurationLabel } from './workout-format';

export type ShareResult = 'shared' | 'cancelled' | 'copied' | 'downloaded' | 'unsupported';

export type WorkoutShare = {
  dayLabel: string;
  exerciseCount: number;
  pse: number;
  streak?: number;
  brandName?: string | null;
  durationSeconds?: number;
};

export function buildShareText({ dayLabel, exerciseCount, pse, streak, durationSeconds }: WorkoutShare): string {
  const time = durationSeconds && durationSeconds > 0 ? ` · ${formatDurationLabel(durationSeconds)}` : '';
  const lines = [
    `💪 Treino concluído: ${dayLabel}`,
    `${exerciseCount} exercício${exerciseCount === 1 ? '' : 's'} · esforço ${pse}/10${time}`,
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

/**
 * Gera uma imagem do treino e compartilha via Web Share (com o arquivo). Se o
 * navegador não permitir compartilhar arquivos, baixa a imagem para o usuário
 * postar manualmente. Cai para o compartilhamento de texto se a imagem falhar.
 */
export async function shareWorkoutImage(data: WorkoutShare): Promise<ShareResult> {
  let file: File;
  try {
    const blob = await buildWorkoutImageBlob({
      dayLabel: data.dayLabel,
      exerciseCount: data.exerciseCount,
      pse: data.pse,
      streak: data.streak,
      brandName: data.brandName,
      durationSeconds: data.durationSeconds,
    });
    file = new File([blob], 'treino-treinapro.png', { type: 'image/png' });
  } catch {
    return shareWorkout(data); // fallback: texto
  }

  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: buildShareText(data) });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }

  // Fallback: baixa a imagem
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return 'downloaded';
  } catch {
    return 'unsupported';
  }
}
