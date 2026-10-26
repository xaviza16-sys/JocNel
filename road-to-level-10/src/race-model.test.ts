import { describe, expect, it } from 'vitest';
import { RaceController, validRace, type RaceConfig } from './race-model';
import { levels } from './model';

const config = (events: RaceConfig['events']): RaceConfig => ({ length: 200, speed: 20, events });
const advance = (race: RaceController, target: number, axis = 0, getUp = false) => {
  for (let i = 0; race.distance < target && i < 5000; i++) race.step(.05, axis, getUp);
};

describe('promenade motorcycle race', () => {
  it('accepts only the four new road kinds and rejects overlapping or unordered events', () => {
    expect(validRace(levels.find(l => l.id === 'moto')!.race)).toBe(true);
    expect(validRace(config([{ distance: 220, lane: 0, kind: 'poop' }]))).toBe(false);
    const event = { distance: 20, lane: 0, kind: 'boost' } as const;
    expect(validRace(config([event, event]))).toBe(false);
    expect(validRace(config([{ distance: 30, lane: 0, kind: 'leaves' }, event]))).toBe(false);
    for (const kind of ['star', 'shield', 'magnet', 'cone', 'memory']) expect(validRace(config([{ ...event, kind } as never]))).toBe(false);
  });
  it('moves automatically with bounded steering and clamps resume deltas', () => {
    const race = new RaceController(config([])); race.step(100, 0); expect(race.distance).toBe(2);
    advance(race, 20, 1); expect(race.steering).toBe(.9);
    advance(race, 60, -1); expect(race.steering).toBe(-.9);
  });
  it('applies each arrow once, only in the correct lane, and expires its short turbo', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'boost' }, { distance: 3, lane: 1, kind: 'boost' }]));
    advance(race, 5); expect(race.powerups).toBe(1); expect(race.speed).toBe(33);
    advance(race, 100); expect(race.boost).toBe(0); expect(race.speed).toBe(20);
  });
  it('slows on leaves, cancels turbo and recovers normal speed without restarting', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'boost' }, { distance: 4, lane: 0, kind: 'leaves' }]));
    advance(race, 5); expect(race.boost).toBe(0); expect(race.speed).toBe(9); expect(race.spin).toBe(0);
    advance(race, 40); expect(race.speed).toBe(20); expect(race.hits).toBe(0);
  });
  it('lets arrows clear an active leaf slowdown', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'leaves' }, { distance: 3, lane: 0, kind: 'boost' }]));
    advance(race, 4); expect(race.slow).toBe(0); expect(race.speed).toBe(33);
  });
  it('falls on people, stays stopped until asked to stand, then resumes with grace', () => {
    const race = new RaceController(config([{ distance: 5, lane: 0, kind: 'family' }]));
    advance(race, 5); const at = race.distance;
    for (let i = 0; i < 100; i++) race.step(.05, 1);
    expect(race.distance).toBe(at); expect(race.speed).toBe(0); expect(race.needsGetUp).toBe(true); expect(race.hits).toBe(1);
    race.step(.05, 0, true);
    for (let i = 0; i < 45; i++) race.step(.05, 0);
    expect(race.fall).toBe(0); expect(race.distance).toBeGreaterThan(at); expect(race.grace).toBeGreaterThan(0);
  });
  it('spins on poop, briefly locks steering and resumes without losing progress', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'boost' }, { distance: 5, lane: 0, kind: 'poop' }]));
    advance(race, 5); expect(race.spin).toBeGreaterThan(0); expect(race.spins).toBe(1); expect(race.boost).toBe(0);
    for (let i = 0; i < 20; i++) race.step(.05, 1, true);
    expect(race.distance).toBe(5); expect(race.steering).toBe(0); expect(race.speed).toBe(0);
    advance(race, 30); expect(race.spin).toBe(0); expect(race.speed).toBe(20); expect(race.powerups).toBe(1); expect(race.spins).toBe(1);
    advance(race, 200); expect(race.finished).toBe(true);
  });
  it('recovery grace never protects against poop', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'family' }, { distance: 3, lane: 0, kind: 'poop' }]));
    advance(race, 10, 0, true); expect(race.spins).toBe(1); expect(race.distance).toBeGreaterThanOrEqual(10);
  });
  it('avoids off-lane hazards and completes without granting old collectibles', () => {
    const race = new RaceController(config([{ distance: 5, lane: 1, kind: 'family' }, { distance: 10, lane: -1, kind: 'poop' }, { distance: 15, lane: 1, kind: 'leaves' }]));
    advance(race, 200); expect(race.avoided).toBe(3); expect(race.finished).toBe(true); expect(race.powerups).toBe(0);
    race.step(1, 1); expect(race.distance).toBe(200);
  });
});
