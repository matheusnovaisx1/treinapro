// Periodização de treino — fonte única da lógica de macro/meso/microciclos.
// A modelagem do banco está em supabase/migrations/008_periodizacao.sql.
//
// Filosofia: o personal continua no controle. Este arquivo apenas SUGERE um
// macrociclo (sequência de fases) a partir de poucas respostas, e calcula em
// que fase/semana o aluno está hoje. Nada aqui muda carga sozinho no banco —
// os multiplicadores são referência para o personal montar as fichas.

import { addDays, differenceInCalendarDays } from 'date-fns';

export type TrainingGoal = 'emagrecimento' | 'hipertrofia' | 'forca' | 'condicionamento';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type CycleStatus = 'draft' | 'active' | 'completed' | 'paused';
export type MesocycleFocus = 'adaptacao' | 'hipertrofia' | 'forca' | 'deload';
export type MicrocycleStatus = 'upcoming' | 'current' | 'done' | 'skipped';

// ---------------------------------------------------------
// Rótulos amigáveis (sem jargão) — para a tia entender.
// ---------------------------------------------------------
export const GOAL_LABELS: Record<TrainingGoal, string> = {
  emagrecimento: 'Emagrecer',
  hipertrofia: 'Ganhar massa',
  forca: 'Ficar mais forte',
  condicionamento: 'Condicionamento',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

type PhaseMeta = {
  label: string; // nome amigável exibido ao aluno
  technical: string; // nome técnico (para o personal)
  emoji: string;
  // Classe Tailwind de cor de destaque da fase (usada em badges/barras).
  color: string;
  description: string; // 1 frase para leigos
};

export const PHASE_META: Record<MesocycleFocus, PhaseMeta> = {
  adaptacao: {
    label: 'Adaptação',
    technical: 'Adaptação anatômica',
    emoji: '🌱',
    color: 'text-emerald-500',
    description: 'Preparando o corpo com cargas leves e técnica.',
  },
  hipertrofia: {
    label: 'Construção',
    technical: 'Hipertrofia',
    emoji: '🔨',
    color: 'text-accent',
    description: 'Volume maior para o músculo crescer.',
  },
  forca: {
    label: 'Força',
    technical: 'Força máxima',
    emoji: '💪',
    color: 'text-orange-500',
    description: 'Cargas pesadas para ficar mais forte.',
  },
  deload: {
    label: 'Descanso ativo',
    technical: 'Deload',
    emoji: '😴',
    color: 'text-sky-400',
    description: 'Semana leve para o corpo se recuperar e evoluir.',
  },
};

// ---------------------------------------------------------
// Templates de macrociclo por objetivo.
// Cada bloco: foco, semanas planejadas, volume/intensidade relativos.
// Sempre termina com um deload de 1 semana.
// ---------------------------------------------------------
type MesoTemplate = {
  focus: MesocycleFocus;
  weeks: number;
  targetVolume: number;
  targetIntensity: number;
};

const BASE_TEMPLATES: Record<TrainingGoal, MesoTemplate[]> = {
  hipertrofia: [
    { focus: 'adaptacao', weeks: 3, targetVolume: 0.8, targetIntensity: 0.7 },
    { focus: 'hipertrofia', weeks: 5, targetVolume: 1.0, targetIntensity: 0.85 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
    { focus: 'hipertrofia', weeks: 5, targetVolume: 1.1, targetIntensity: 0.9 },
    { focus: 'forca', weeks: 4, targetVolume: 0.8, targetIntensity: 1.0 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
  ],
  forca: [
    { focus: 'adaptacao', weeks: 3, targetVolume: 0.8, targetIntensity: 0.75 },
    { focus: 'hipertrofia', weeks: 4, targetVolume: 1.0, targetIntensity: 0.85 },
    { focus: 'forca', weeks: 5, targetVolume: 0.8, targetIntensity: 1.0 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
    { focus: 'forca', weeks: 4, targetVolume: 0.85, targetIntensity: 1.05 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
  ],
  emagrecimento: [
    { focus: 'adaptacao', weeks: 3, targetVolume: 0.85, targetIntensity: 0.7 },
    { focus: 'hipertrofia', weeks: 4, targetVolume: 1.0, targetIntensity: 0.8 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
    { focus: 'hipertrofia', weeks: 4, targetVolume: 1.05, targetIntensity: 0.85 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
  ],
  condicionamento: [
    { focus: 'adaptacao', weeks: 3, targetVolume: 0.85, targetIntensity: 0.7 },
    { focus: 'hipertrofia', weeks: 4, targetVolume: 1.0, targetIntensity: 0.8 },
    { focus: 'forca', weeks: 3, targetVolume: 0.85, targetIntensity: 0.95 },
    { focus: 'deload', weeks: 1, targetVolume: 0.6, targetIntensity: 0.6 },
  ],
};

// Iniciante começa mais leve e evita a fase de força máxima; avançado encara
// o template cheio. Ajuste simples, transparente para o personal.
function adjustForExperience(templates: MesoTemplate[], level: ExperienceLevel): MesoTemplate[] {
  if (level === 'iniciante') {
    return templates
      .filter((t) => t.focus !== 'forca')
      .map((t) => ({ ...t, targetIntensity: Math.min(t.targetIntensity, 0.85) }));
  }
  if (level === 'avancado') {
    return templates.map((t) =>
      t.focus === 'deload' ? t : { ...t, targetIntensity: Math.min(1.1, t.targetIntensity + 0.05) }
    );
  }
  return templates;
}

// ---------------------------------------------------------
// Estruturas geradas (ainda sem IDs — o banco gera os UUIDs).
// ---------------------------------------------------------
export type GeneratedMicrocycle = {
  weekNumber: number;
  startDate: string; // yyyy-mm-dd
  endDate: string;
  volumeMultiplier: number;
  intensityMultiplier: number;
};

export type GeneratedMesocycle = {
  ord: number;
  focus: MesocycleFocus;
  plannedWeeks: number;
  startDate: string;
  endDate: string;
  targetVolume: number;
  targetIntensity: number;
  microcycles: GeneratedMicrocycle[];
};

export type GeneratedPlan = {
  startDate: string;
  endDate: string;
  totalWeeks: number;
  mesocycles: GeneratedMesocycle[];
};

export type OnboardingAnswers = {
  goal: TrainingGoal;
  experience: ExperienceLevel;
  weeklyFrequency: number;
  sessionMinutes?: number | null;
  restrictions?: string | null;
  startDate: Date;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Gera o macrociclo sugerido. Cada microciclo = 1 semana (7 dias).
 * A intensidade dentro de um mesociclo sobe suavemente semana a semana
 * (progressão), exceto no deload (semana leve constante).
 */
export function generatePlan(answers: OnboardingAnswers): GeneratedPlan {
  const templates = adjustForExperience(BASE_TEMPLATES[answers.goal], answers.experience);
  const mesocycles: GeneratedMesocycle[] = [];

  let cursor = new Date(answers.startDate);
  let ord = 1;

  for (const tpl of templates) {
    const mesoStart = new Date(cursor);
    const micros: GeneratedMicrocycle[] = [];

    for (let w = 1; w <= tpl.weeks; w++) {
      const weekStart = new Date(cursor);
      const weekEnd = addDays(weekStart, 6);

      // Rampa de intensidade: no deload fica constante; nas demais fases sobe
      // ~3% por semana sobre a intensidade-alvo do bloco.
      const isDeload = tpl.focus === 'deload';
      const intensity = isDeload
        ? tpl.targetIntensity
        : round2(tpl.targetIntensity * (1 + 0.03 * (w - 1)));

      micros.push({
        weekNumber: w,
        startDate: iso(weekStart),
        endDate: iso(weekEnd),
        volumeMultiplier: tpl.targetVolume,
        intensityMultiplier: intensity,
      });

      cursor = addDays(weekStart, 7);
    }

    mesocycles.push({
      ord,
      focus: tpl.focus,
      plannedWeeks: tpl.weeks,
      startDate: iso(mesoStart),
      endDate: micros[micros.length - 1].endDate,
      targetVolume: tpl.targetVolume,
      targetIntensity: tpl.targetIntensity,
      microcycles: micros,
    });
    ord++;
  }

  const totalWeeks = mesocycles.reduce((sum, m) => sum + m.plannedWeeks, 0);
  return {
    startDate: iso(answers.startDate),
    endDate: mesocycles[mesocycles.length - 1].endDate,
    totalWeeks,
    mesocycles,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------
// Cálculo de "onde o aluno está" a partir das datas do plano.
// Funciona com os dados vindos do banco (mesos + micros já persistidos).
// ---------------------------------------------------------
export type PlanProgress = {
  currentPhase: MesocycleFocus;
  currentOrd: number; // ord do mesociclo atual (útil para destacar na timeline)
  phaseMeta: PhaseMeta;
  weekInPhase: number; // semana atual dentro da fase (1-based)
  weeksInPhase: number; // total de semanas da fase
  overallWeek: number; // semana atual no macrociclo inteiro
  totalWeeks: number;
  overallPercent: number; // 0..100 progresso do macrociclo
  phasePercent: number; // 0..100 progresso da fase atual
  finished: boolean;
};

// Formato mínimo esperado das linhas do banco para o cálculo.
export type MesocycleRow = {
  ord: number;
  focus: MesocycleFocus;
  planned_weeks: number;
  start_date: string;
  end_date: string;
};

/**
 * Dado o conjunto de mesociclos (ordenados) e a data de hoje, resolve a fase
 * e a semana atuais. Robusto a "buracos": se o aluno atrasou, continua na
 * última fase cuja data já começou.
 */
export function computeProgress(mesocycles: MesocycleRow[], today = new Date()): PlanProgress | null {
  if (!mesocycles.length) return null;
  const sorted = [...mesocycles].sort((a, b) => a.ord - b.ord);
  const totalWeeks = sorted.reduce((s, m) => s + m.planned_weeks, 0);
  const t = startOfDay(today);

  const planStart = startOfDay(new Date(sorted[0].start_date));
  const planEnd = startOfDay(new Date(sorted[sorted.length - 1].end_date));

  // Antes de começar → mostra a primeira fase, semana 1.
  if (t < planStart) {
    return buildProgress(sorted, 0, 1, totalWeeks, false);
  }
  // Depois do fim → concluído.
  if (t > planEnd) {
    const last = sorted.length - 1;
    return buildProgress(sorted, last, sorted[last].planned_weeks, totalWeeks, true);
  }

  // Encontra a fase que contém hoje.
  let weeksBefore = 0;
  for (let i = 0; i < sorted.length; i++) {
    const meso = sorted[i];
    const mStart = startOfDay(new Date(meso.start_date));
    const mEnd = startOfDay(new Date(meso.end_date));
    if (t >= mStart && t <= mEnd) {
      const dayOffset = differenceInCalendarDays(t, mStart);
      const weekInPhase = Math.min(meso.planned_weeks, Math.floor(dayOffset / 7) + 1);
      return buildProgress(sorted, i, weekInPhase, totalWeeks, false);
    }
    weeksBefore += meso.planned_weeks;
  }

  // Fallback (buraco entre datas): usa a última fase iniciada.
  let idx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (t >= startOfDay(new Date(sorted[i].start_date))) idx = i;
  }
  return buildProgress(sorted, idx, sorted[idx].planned_weeks, totalWeeks, false);
}

function buildProgress(
  sorted: MesocycleRow[],
  phaseIndex: number,
  weekInPhase: number,
  totalWeeks: number,
  finished: boolean
): PlanProgress {
  const meso = sorted[phaseIndex];
  const weeksBefore = sorted.slice(0, phaseIndex).reduce((s, m) => s + m.planned_weeks, 0);
  const overallWeek = Math.min(totalWeeks, weeksBefore + weekInPhase);
  return {
    currentPhase: meso.focus,
    currentOrd: meso.ord,
    phaseMeta: PHASE_META[meso.focus],
    weekInPhase,
    weeksInPhase: meso.planned_weeks,
    overallWeek,
    totalWeeks,
    overallPercent: Math.round((overallWeek / totalWeeks) * 100),
    phasePercent: Math.round((weekInPhase / meso.planned_weeks) * 100),
    finished,
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
