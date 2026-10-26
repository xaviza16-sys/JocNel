import { describe, expect, it } from 'vitest';
import { levels, nextLevel, SaveManager, validateLevels, whatsAppUrl } from './model';

describe('level configuration and progression', () => {
  it('provides the complete ordered campaign through age ten', () => {
    expect(levels.map(l => l.mode)).toEqual(['baby', 'toddler', 'moto', 'hospital', 'snow', 'nature', 'skate']);
    expect(nextLevel('baby')?.id).toBe('toddler');
    expect(nextLevel('moto')?.id).toBe('school');
    expect(nextLevel('skate')).toBeUndefined();
    expect(nextLevel('missing')).toBeUndefined();
  });
  it('rejects unreachable goals, duplicate ids and invalid platforms', () => {
    expect(() => validateLevels([{ ...levels[0], finish: 2000 }])).toThrow();
    expect(() => validateLevels([levels[0], levels[0]])).toThrow();
    expect(() => validateLevels([{ ...levels[1], platforms: [{ x: 50, width: 30, height: 500 }] }])).toThrow();
  });
  it('replaces the fourth chapter with hospital staff while preserving saved progress IDs', () => {
    const hospital = levels[3];
    expect(hospital.id).toBe('school');
    expect(hospital.mode).toBe('hospital');
    expect(new Set(hospital.enemies.map(e => e.kind))).toEqual(new Set(['doctor', 'nurse']));
    expect(hospital.goalY).toBe(230);
    expect(() => validateLevels([{ ...levels[1], enemies: [{ kind: 'doctor', x: 200, range: 30 }] }])).toThrow();
  });
  it('keeps food enemies out of the early years and gives the baby real climbing obstacles', () => {
    for (const level of levels.filter(l => l.ageMin < 4)) expect(level.enemies.every(e => e.kind === 'ball' || e.kind === 'snowball')).toBe(true);
    expect(levels[0].goalY).toBeLessThan(180);
    expect(levels[0].platforms.length).toBeGreaterThan(1);
    expect(levels[0].blocks!.length).toBe(3);
    expect(levels.find(l => l.id === 'nature')!.vines!.length).toBe(2);
    expect(levels.find(l => l.id === 'nature')!.ziplines!.length).toBe(1);
    expect(() => validateLevels([{ ...levels[0], enemies: [{ kind: 'tomato', x: 200, range: 30 }] }])).toThrow();
    expect(levels.find(l => l.id === 'nature')!.ladders.length).toBeGreaterThan(0);
  });
});
describe('local progress', () => {
  it('recovers from malformed storage and filters obsolete levels', () => {
    expect(new SaveManager({ getItem: () => '{', setItem() {} }).read()).toEqual({ completed: [], muted: true });
    const save = new SaveManager({ getItem: () => '{"completed":["baby","removed"],"muted":false}', setItem() {} });
    expect(save.read()).toEqual({ completed: ['baby'], muted: false });
  });
  it('still works when local storage is blocked', () => {
    const save = new SaveManager({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
    expect(save.read().completed).toEqual([]);
    expect(() => save.write({ completed: ['baby'], muted: true })).not.toThrow();
  });
});
describe('invitation links', () => {
  it('never creates a link for an empty or unsafe RSVP value', () => {
    expect(whatsAppUrl('')).toBeNull();
    expect(whatsAppUrl('javascript:alert(1)')).toBeNull();
    expect(whatsAppUrl('+34 600 000 000')).toMatch(/^https:\/\/wa.me\/34600000000\?text=/);
  });
});
