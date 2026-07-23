import { describe, it, expect } from 'vitest';
import { challengeStatus, medal, daysLeft } from './challenges';

describe('challengeStatus', () => {
  it('classifica agendado/ativo/encerrado', () => {
    expect(challengeStatus('2026-08-01', '2026-08-31', new Date('2026-07-20'))).toBe('scheduled');
    expect(challengeStatus('2026-08-01', '2026-08-31', new Date('2026-08-15'))).toBe('active');
    expect(challengeStatus('2026-08-01', '2026-08-31', new Date('2026-09-01'))).toBe('ended');
  });

  it('inclui os dias de borda como ativo', () => {
    expect(challengeStatus('2026-08-01', '2026-08-31', new Date('2026-08-01'))).toBe('active');
    expect(challengeStatus('2026-08-01', '2026-08-31', new Date('2026-08-31'))).toBe('active');
  });
});

describe('medal', () => {
  it('dá medalha só para o pódio', () => {
    expect(medal(1)).toBe('🥇');
    expect(medal(2)).toBe('🥈');
    expect(medal(3)).toBe('🥉');
    expect(medal(4)).toBeNull();
  });
});

describe('daysLeft', () => {
  it('conta dias restantes e null quando encerrado', () => {
    expect(daysLeft('2026-08-31', new Date('2026-08-29'))).toBe(2);
    expect(daysLeft('2026-08-31', new Date('2026-09-05'))).toBeNull();
  });
});
