import { describe, it, expect } from 'vitest';
import { buildShareText } from './share';

describe('buildShareText', () => {
  it('monta o texto com dia, exercícios e esforço', () => {
    const t = buildShareText({ dayLabel: 'Treino B - Costas', exerciseCount: 5, pse: 8 });
    expect(t).toContain('Treino B - Costas');
    expect(t).toContain('5 exercícios');
    expect(t).toContain('esforço 8/10');
    expect(t).toContain('#TreinaPro');
  });

  it('usa singular quando há 1 exercício', () => {
    const t = buildShareText({ dayLabel: 'Treino A', exerciseCount: 1, pse: 6 });
    expect(t).toContain('1 exercício ·');
  });

  it('inclui streak só quando maior que 1', () => {
    expect(buildShareText({ dayLabel: 'A', exerciseCount: 3, pse: 5, streak: 4 })).toContain('4 dias seguidos');
    expect(buildShareText({ dayLabel: 'A', exerciseCount: 3, pse: 5, streak: 1 })).not.toContain('seguidos');
  });
});
