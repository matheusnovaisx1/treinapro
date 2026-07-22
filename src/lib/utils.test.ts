import { describe, it, expect } from 'vitest';
import { formatCurrencyBRL, initials, getYoutubeId, youtubeThumbnail, cn, calculateStreak, daysSince, hexToHslString, validateImageFile } from './utils';

describe('formatCurrencyBRL', () => {
  it('formats a number as BRL currency', () => {
    expect(formatCurrencyBRL(49.9)).toBe('R$\u00A049,90');
  });

  it('formats zero correctly', () => {
    expect(formatCurrencyBRL(0)).toBe('R$\u00A00,00');
  });
});

describe('initials', () => {
  it('returns the first letters of the first two words', () => {
    expect(initials('João Silva')).toBe('JS');
  });

  it('handles a single name', () => {
    expect(initials('Maria')).toBe('M');
  });

  it('falls back to a placeholder when there is no name', () => {
    expect(initials(null)).toBe('?');
    expect(initials(undefined)).toBe('?');
    expect(initials('')).toBe('?');
  });

  it('ignores extra names beyond the first two', () => {
    expect(initials('Ana Paula Souza Lima')).toBe('AP');
  });
});

describe('getYoutubeId', () => {
  it('extracts the id from a watch URL', () => {
    expect(getYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from a short youtu.be URL', () => {
    expect(getYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from an embed URL', () => {
    expect(getYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(getYoutubeId('https://example.com/video')).toBeNull();
  });

  it('returns null when no url is given', () => {
    expect(getYoutubeId(null)).toBeNull();
    expect(getYoutubeId(undefined)).toBeNull();
  });
});

describe('youtubeThumbnail', () => {
  it('builds a thumbnail URL from a valid video URL', () => {
    expect(youtubeThumbnail('https://youtu.be/dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('returns null for an invalid url', () => {
    expect(youtubeThumbnail('not-a-url')).toBeNull();
  });
});

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('calculateStreak', () => {
  function daysAgoIso(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  it('returns 0 for no workouts', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('counts a streak ending today', () => {
    expect(calculateStreak([daysAgoIso(0), daysAgoIso(1), daysAgoIso(2)])).toBe(3);
  });

  it('still counts the streak if today has no workout yet but yesterday does', () => {
    expect(calculateStreak([daysAgoIso(1), daysAgoIso(2)])).toBe(2);
  });

  it('stops the streak at a gap', () => {
    expect(calculateStreak([daysAgoIso(0), daysAgoIso(1), daysAgoIso(5)])).toBe(2);
  });

  it('breaks the streak if the last workout was 2+ days ago', () => {
    expect(calculateStreak([daysAgoIso(3), daysAgoIso(4)])).toBe(0);
  });

  it('deduplicates multiple workouts on the same day', () => {
    expect(calculateStreak([daysAgoIso(0), daysAgoIso(0), daysAgoIso(1)])).toBe(2);
  });
});

describe('daysSince', () => {
  it('returns null when no date is given', () => {
    expect(daysSince(null)).toBeNull();
    expect(daysSince(undefined)).toBeNull();
  });

  it('returns 0 for a timestamp from today', () => {
    expect(daysSince(new Date().toISOString())).toBe(0);
  });

  it('returns the correct number of days for a past date', () => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    expect(daysSince(d.toISOString())).toBe(5);
  });
});

describe('hexToHslString', () => {
  it('converts pure orange correctly', () => {
    expect(hexToHslString('#ea580c')).toBe('21 90% 48%');
  });

  it('converts black to 0 0% 0%', () => {
    expect(hexToHslString('#000000')).toBe('0 0% 0%');
  });

  it('converts white to 0 0% 100%', () => {
    expect(hexToHslString('#ffffff')).toBe('0 0% 100%');
  });

  it('returns null for an invalid hex string', () => {
    expect(hexToHslString('not-a-color')).toBeNull();
    expect(hexToHslString('#zzzzzz')).toBeNull();
  });
});

describe('validateImageFile', () => {
  const maxSize = 5 * 1024 * 1024;

  it('accepts a valid PNG under the size limit', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    expect(validateImageFile(file, maxSize)).toBeNull();
  });

  it('rejects a disallowed file type', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateImageFile(file, maxSize)).toMatch(/PNG, JPEG ou WebP/);
  });

  it('rejects a file over the size limit', () => {
    const big = new Uint8Array(6 * 1024 * 1024);
    const file = new File([big], 'huge.png', { type: 'image/png' });
    expect(validateImageFile(file, maxSize)).toMatch(/5MB/);
  });
});
