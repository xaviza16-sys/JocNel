import { expect, it } from 'vitest';
import { SkateController, skateGround, quarterLips } from './skate-model';

it('has continuous curved quarters and launches the rider from every lip', () => {
  expect(skateGround(170)).toBe(178);
  expect(skateGround(240)).toBe(248);
  expect(skateGround(390)).toBe(248);
  expect(skateGround(460)).toBe(178);
  for (const x of quarterLips) {
    const rider = new SkateController(); rider.reset(x - 2); rider.step(.03, 1, false);
    expect(rider.airborne).toBe(true); expect(rider.vy).toBeLessThan(0); expect(rider.quarters.has(x)).toBe(true);
  }
});
it('supports braking, an ollie and checkpoint recovery without losing quarters', () => {
  const rider = new SkateController(); rider.step(.06, -1, true);
  expect(rider.ollies).toBe(1); expect(rider.speed).toBeLessThan(100);
  rider.quarters.add(460); rider.reset(700);
  expect(rider.feet).toBe(skateGround(700)); expect(rider.airborne).toBe(false); expect(rider.quarters.size).toBe(1);
});
it('can traverse all four bowls without sinking through a curved wall', () => {
  const rider = new SkateController();
  for (let i = 0; i < 1500 && rider.x < 2250; i++) {
    rider.step(1 / 60, 1, i % 40 === 0);
    expect(rider.feet).toBeLessThanOrEqual(skateGround(rider.x) + .001);
  }
  expect(rider.x).toBeGreaterThanOrEqual(2250); expect(rider.quarters.size).toBe(4);
});
