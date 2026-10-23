import { describe, expect, it } from 'vitest';
import { toddlerAnimationFrame } from './toddler-animation';

const base = { distance: 0, time: 0, moving: false, airborne: false, vy: 0, airTime: 0, landingAge: Infinity, reducedMotion: false };

describe('toddler motion', () => {
  it('advances eight walking poses with travel, then rests when stopped', () => {
    const cycle = Array.from({ length: 8 }, (_, i) => toddlerAnimationFrame({ ...base, moving: true, distance: i * 8 }));
    expect(new Set(cycle).size).toBe(8);
    expect(toddlerAnimationFrame({ ...base, moving: true, distance: 64 })).toBe(cycle[0]);
    expect(toddlerAnimationFrame({ ...base, distance: 24 })).toMatch(/^idle-/);
  });
  it('follows ascent, apex, descent and soft landing instead of looping a jump', () => {
    expect(toddlerAnimationFrame({ ...base, airborne: true, vy: -295, airTime: 0 })).toBe('jump-0');
    expect(toddlerAnimationFrame({ ...base, airborne: true, vy: -240, airTime: 100 })).toBe('jump-1');
    expect(toddlerAnimationFrame({ ...base, airborne: true, vy: 0, airTime: 450 })).toBe('jump-4');
    expect(toddlerAnimationFrame({ ...base, airborne: true, vy: 200, airTime: 700 })).toBe('jump-6');
    expect(toddlerAnimationFrame({ ...base, landingAge: 20 })).toBe('jump-6');
    expect(toddlerAnimationFrame({ ...base, landingAge: 180 })).toBe('jump-7');
    expect(toddlerAnimationFrame({ ...base, landingAge: 300 })).toMatch(/^idle-/);
  });
  it('shows still action poses with reduced motion', () => {
    expect(toddlerAnimationFrame({ ...base, distance: 40, time: 1000, moving: true, reducedMotion: true })).toBe('walk-0');
    expect(toddlerAnimationFrame({ ...base, airborne: true, vy: -150, reducedMotion: true })).toBe('jump-4');
  });
});
