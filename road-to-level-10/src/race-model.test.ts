import { describe, expect, it } from 'vitest';
import { RaceController, validRace, type RaceConfig } from './race-model';
import { levels } from './model';

const config = (events: RaceConfig['events']): RaceConfig => ({ length: 200, speed: 20, events });
const advance = (race: RaceController, target: number, axis = 0) => {
  for (let i = 0; race.distance < target && i < 5000; i++) race.step(.05, axis);
};
describe('rear-view motorcycle race', () => {
  it('validates the route and rejects invalid events', () => {
    expect(validRace(levels.find(l => l.id === 'moto')!.race)).toBe(true);
    expect(validRace(config([{ distance: 220, lane: 0, kind: 'cone' }]))).toBe(false);
    const event = { distance: 20, lane: 0, kind: 'star' } as const;
    expect(validRace(config([event, event]))).toBe(false);
  });
  it('moves forward automatically, limits steering and never leaves the road', () => {
    const race = new RaceController(config([]));
    advance(race, 20, 1); expect(race.steering).toBe(.9);
    advance(race, 60, -1); expect(race.steering).toBe(-.9);
    expect(race.distance).toBeGreaterThanOrEqual(60);
  });
  it('collects each item only once and ignores other lanes without a magnet', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'star' }, { distance: 3, lane: 1, kind: 'star' }]));
    advance(race, 10); expect(race.stars).toBe(1); expect(race.resolved.size).toBe(2);
  });
  it('uses up a shield on collision and gives time to recover', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'shield' }, { distance: 4, lane: 0, kind: 'cone' }, { distance: 6, lane: 0, kind: 'blocks' }]));
    advance(race, 10); expect(race.shield).toBe(0); expect(race.hits).toBe(0); expect(race.powerups).toBe(1);
  });
  it('collects distant stars with the magnet and expires the effect', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'magnet' }, { distance: 10, lane: -1, kind: 'star' }, { distance: 180, lane: 1, kind: 'star' }]));
    advance(race, 195); expect(race.stars).toBe(1); expect(race.magnet).toBe(0);
  });
  it('boosts temporarily and still completes after collisions', () => {
    const race = new RaceController(config([{ distance: 1, lane: 0, kind: 'boost' }, { distance: 20, lane: 0, kind: 'puddle' }]));
    advance(race, 2); expect(race.speed).toBe(30);
    advance(race, 22); expect(race.hits).toBe(1); expect(race.speed).toBe(9);
    advance(race, 200); expect(race.finished).toBe(true); expect(race.boost).toBe(0);
    const distance = race.distance; race.step(5, 1); expect(race.distance).toBe(distance);
  });
  it('counts avoided obstacles and protects against large resume deltas', () => {
    const race = new RaceController(config([{ distance: 5, lane: 1, kind: 'cone' }]));
    race.step(100, 0); expect(race.distance).toBe(2);
    advance(race, 10); expect(race.avoided).toBe(1); expect(race.hits).toBe(0);
  });
  it('counts coins and memory cards separately without treating them as power-ups', () => {
    const race = new RaceController(config([
      { distance: 1, lane: 0, kind: 'magnet' },
      { distance: 4, lane: -1, kind: 'coin' },
      { distance: 8, lane: 1, kind: 'memory' },
      { distance: 12, lane: 0, kind: 'memory' },
    ]));
    advance(race, 20);
    expect(race.coins).toBe(1); expect(race.memories).toBe(1); expect(race.powerups).toBe(1);
    advance(race, 200); expect(race.finished).toBe(true);
  });
});
