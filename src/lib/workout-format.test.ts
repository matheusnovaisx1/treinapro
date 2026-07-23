import { describe, it, expect } from 'vitest';
import { formatScheme, supersetLabel, groupConsecutive } from './workout-format';

describe('formatScheme', () => {
  it('formata repetições e isometria', () => {
    expect(formatScheme({ sets: 3, reps: '10-12' })).toBe('3x10-12');
    expect(formatScheme({ sets: 4, reps: '30', unit: 'seg' })).toBe('4x30s');
    expect(formatScheme({ sets: 3, reps: '12', unit: 'reps' })).toBe('3x12');
  });
});

describe('supersetLabel', () => {
  it('nomeia conforme o tamanho', () => {
    expect(supersetLabel(2)).toBe('Bi-set');
    expect(supersetLabel(3)).toBe('Tri-set');
    expect(supersetLabel(4)).toBe('Super-set');
  });
});

describe('groupConsecutive', () => {
  it('agrupa vizinhos com o mesmo group e isola os demais', () => {
    const items = [
      { uid: 'a', group: null },
      { uid: 'b', group: 'g1' },
      { uid: 'c', group: 'g1' },
      { uid: 'd', group: null },
      { uid: 'e', group: 'g2' },
    ];
    const blocks = groupConsecutive(items);
    expect(blocks.map((b) => b.map((x) => x.uid))).toEqual([['a'], ['b', 'c'], ['d'], ['e']]);
  });

  it('não junta grupos iguais mas não-consecutivos', () => {
    const items = [
      { uid: 'a', group: 'g1' },
      { uid: 'b', group: null },
      { uid: 'c', group: 'g1' },
    ];
    const blocks = groupConsecutive(items);
    expect(blocks.length).toBe(3);
  });
});
