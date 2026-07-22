import { describe, it, expect } from 'vitest';
import { computeAchievements, nextAchievement } from './achievements';

describe('computeAchievements', () => {
  it('returns nothing when streak and total are both below the first milestone', () => {
    expect(computeAchievements(1, 2)).toEqual([]);
  });

  it('unlocks the first streak milestone at 3 days', () => {
    const result = computeAchievements(3, 0);
    expect(result.map((a) => a.id)).toContain('streak-3');
  });

  it('unlocks multiple streak milestones at once when the streak is high', () => {
    const result = computeAchievements(30, 0);
    expect(result.map((a) => a.id)).toEqual(expect.arrayContaining(['streak-3', 'streak-7', 'streak-14', 'streak-30']));
    expect(result.map((a) => a.id)).not.toContain('streak-100');
  });

  it('unlocks total-workout milestones independently of streak', () => {
    const result = computeAchievements(0, 25);
    expect(result.map((a) => a.id)).toEqual(expect.arrayContaining(['total-10', 'total-25']));
  });

  it('combines streak and total milestones', () => {
    const result = computeAchievements(7, 10);
    expect(result.map((a) => a.id)).toEqual(expect.arrayContaining(['streak-3', 'streak-7', 'total-10']));
  });
});

describe('nextAchievement', () => {
  it('suggests the closest upcoming milestone', () => {
    const result = nextAchievement(1, 8);
    // faltam 2 dias de streak (pro milestone de 3) vs faltam 2 treinos (pro milestone de 10)
    expect(result?.remaining).toBe(2);
  });

  it('returns null when every milestone has been reached', () => {
    expect(nextAchievement(1000, 1000)).toBeNull();
  });

  it('picks streak over total when streak is closer', () => {
    const result = nextAchievement(2, 0);
    expect(result?.label).toBe('3 dias seguidos');
  });
});
