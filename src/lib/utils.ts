import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date)
  );
}

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Extrai o ID do vídeo do YouTube de qualquer formato de URL comum. */
export function getYoutubeId(url?: string | null) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function youtubeThumbnail(url?: string | null) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Calcula a sequência (streak) de dias consecutivos com pelo menos um treino
 * concluído, terminando hoje ou ontem (permite 1 dia de folga sem quebrar a
 * sequência). Recebe uma lista de timestamps `completed_at` (mais recente
 * primeiro ou em qualquer ordem).
 */
export function calculateStreak(completedAtList: string[]): number {
  if (!completedAtList.length) return 0;

  const uniqueDays = Array.from(
    new Set(completedAtList.map((ts) => new Date(ts).toISOString().slice(0, 10)))
  ).sort((a, b) => (a < b ? 1 : -1)); // desc

  const today = new Date();
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

  let cursor = new Date(today);
  let streak = 0;

  // Se não treinou hoje, permite começar a contagem a partir de ontem.
  if (uniqueDays[0] !== toDateStr(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (const day of uniqueDays) {
    if (day === toDateStr(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (day < toDateStr(cursor)) {
      break;
    }
  }

  return streak;
}

/** Dias corridos desde a data informada (para alertas de inatividade). */
export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Validação de imagem no frontend (feedback imediato). O bucket no Supabase
 * também tem `allowed_mime_types`/`file_size_limit` — esta é só a primeira
 * camada, mais rápida para o usuário.
 */
export function validateImageFile(file: File, maxSizeBytes: number): string | null {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Envie apenas imagens PNG, JPEG ou WebP.';
  }
  if (file.size > maxSizeBytes) {
    return `A imagem precisa ter até ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`;
  }
  return null;
}

/**
 * Converte uma cor hex (#rrggbb) para a string "H S% L%" usada nas CSS
 * variables do design system (ex: --accent). Usado para aplicar a cor de
 * marca própria de cada personal na experiência do aluno.
 */
export function hexToHslString(hex: string): string | null {
  const match = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!match) return null;

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
