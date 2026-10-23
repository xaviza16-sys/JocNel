import { describe, expect, it } from 'vitest';
import { babyAnimationFrame } from './baby-animation';

const base = { distance: 0, time: 0, moving: false, pushing: false, reducedMotion: false };

describe('baby pose timing', () => {
  it('advances crawling with actual travel and rests when blocked', () => {
    const cycle = Array.from({ length: 8 }, (_, i) => babyAnimationFrame({ ...base, moving: true, distance: i * 7 }));
    expect(new Set(cycle).size).toBe(8);
    expect(babyAnimationFrame({ ...base, moving: true, distance: 56 })).toBe(cycle[0]);
    expect(babyAnimationFrame({ ...base, distance: 35, time: 1000 })).toMatch(/^idle-/);
  });
  it('finishes climbing on its last pose instead of looping back to reaching', () => {
    const sequence = Array.from({ length: 8 }, (_, i) => babyAnimationFrame({ ...base, climbProgress: i / 8 }));
    expect(new Set(sequence).size).toBe(8);
    expect(babyAnimationFrame({ ...base, climbProgress: 1 })).toBe(sequence[7]);
    expect(babyAnimationFrame({ ...base, climbProgress: 1.5 })).toBe(sequence[7]);
  });
  it('keeps still poses with reduced motion while showing different actions', () => {
    for (const time of [0, 500, 2000]) {
      expect(babyAnimationFrame({ ...base, time, reducedMotion: true })).toBe('idle-0');
      expect(babyAnimationFrame({ ...base, time, distance: time, moving: true, reducedMotion: true })).toBe('crawl-0');
      expect(babyAnimationFrame({ ...base, time, pushing: true, reducedMotion: true })).toBe('push-0');
    }
  });
});
