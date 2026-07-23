import { describe, it, expect } from 'vitest';
import { generatePlan, computeProgress, type MesocycleRow } from './periodization';

describe('generatePlan', () => {
  it('gera macrociclo de hipertrofia com semanas contíguas', () => {
    const plan = generatePlan({
      goal: 'hipertrofia',
      experience: 'intermediario',
      weeklyFrequency: 4,
      startDate: new Date('2026-01-05'),
    });

    // Soma das semanas confere com totalWeeks.
    const somaSemanas = plan.mesocycles.reduce((s, m) => s + m.plannedWeeks, 0);
    expect(somaSemanas).toBe(plan.totalWeeks);

    // Cada microciclo dura 7 dias e são contíguos (sem buraco/sobreposição).
    const micros = plan.mesocycles.flatMap((m) => m.microcycles);
    for (let i = 1; i < micros.length; i++) {
      const prevEnd = new Date(micros[i - 1].endDate);
      const curStart = new Date(micros[i].startDate);
      const diff = (curStart.getTime() - prevEnd.getTime()) / 86_400_000;
      expect(diff).toBe(1); // começa exatamente 1 dia após o fim do anterior
    }
  });

  it('iniciante não recebe fase de força máxima', () => {
    const plan = generatePlan({
      goal: 'forca',
      experience: 'iniciante',
      weeklyFrequency: 3,
      startDate: new Date('2026-01-05'),
    });
    expect(plan.mesocycles.some((m) => m.focus === 'forca')).toBe(false);
  });
});

describe('computeProgress', () => {
  const mesos: MesocycleRow[] = [
    { ord: 1, focus: 'adaptacao', planned_weeks: 3, start_date: '2026-01-05', end_date: '2026-01-25' },
    { ord: 2, focus: 'hipertrofia', planned_weeks: 5, start_date: '2026-01-26', end_date: '2026-03-01' },
    { ord: 3, focus: 'deload', planned_weeks: 1, start_date: '2026-03-02', end_date: '2026-03-08' },
  ];

  it('detecta a fase e a semana corretas no meio do bloco', () => {
    // Hipertrofia começa 26/01. 28/01 cai na semana 1 desse mesociclo.
    const p = computeProgress(mesos, new Date('2026-01-28'));
    expect(p?.currentPhase).toBe('hipertrofia');
    expect(p?.weekInPhase).toBe(1);
    expect(p?.overallWeek).toBe(4); // 3 semanas de adaptação + 1

    // 02/02 já é a semana 2 (7 dias após o início do bloco).
    const p2 = computeProgress(mesos, new Date('2026-02-02'));
    expect(p2?.weekInPhase).toBe(2);
    expect(p2?.overallWeek).toBe(5);
  });

  it('antes do início mostra a primeira fase, semana 1', () => {
    const p = computeProgress(mesos, new Date('2025-12-20'));
    expect(p?.currentPhase).toBe('adaptacao');
    expect(p?.weekInPhase).toBe(1);
    expect(p?.finished).toBe(false);
  });

  it('depois do fim marca como concluído', () => {
    const p = computeProgress(mesos, new Date('2026-04-01'));
    expect(p?.finished).toBe(true);
    expect(p?.overallPercent).toBe(100);
  });
});
