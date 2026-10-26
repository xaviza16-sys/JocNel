import { describe, it, expect } from 'vitest';
import { enemyIntent, JumpBuffer, movement } from './platform-model';

describe('enemy behavior', () => {
  it('keeps hospital staff walking without hops or dashes', () => {
    expect(enemyIntent('doctor', 30, -1)).toEqual({ vx: -28, jump: false, warn: false });
    expect(enemyIntent('nurse', 1200, 1)).toEqual({ vx: 36, jump: false, warn: false });
  });
  it('makes yogurt hop periodically while tomato stays rolling', () => {
    expect(enemyIntent('yogurt', 30, -1)).toMatchObject({ vx: -24, jump: true });
    expect(enemyIntent('yogurt', 500, 1).jump).toBe(false);
    expect(enemyIntent('tomato', 30, 1)).toEqual({ vx: 48, jump: false, warn: false });
  });
  it('telegraphs pepper dashes before moving, then leaps', () => {
    expect(enemyIntent('pepper', 400, 1)).toMatchObject({ vx: 0, warn: true });
    expect(enemyIntent('pepper', 800, -1)).toMatchObject({ vx: -88, warn: false });
    expect(enemyIntent('pepper', 1200, 1).jump).toBe(true);
    expect(enemyIntent('pepper', 1900, 1).jump).toBe(false);
  });
});
describe('forgiving platform controls', () => {
  it('buffers a press before landing and permits a late jump from an edge', () => {
    const buffer = new JumpBuffer();
    expect(buffer.step(100, false, true)).toBe(false);
    expect(buffer.step(170, true, false)).toBe(true);
    expect(buffer.step(180, false, false)).toBe(false);
    buffer.step(500, true, false);
    expect(buffer.step(570, false, true)).toBe(true);
  });
  it('expires stale input and never grants repeated air jumps', () => {
    const buffer = new JumpBuffer();
    buffer.step(0, false, true);
    expect(buffer.step(500, true, false)).toBe(false);
    expect(buffer.step(510, true, true)).toBe(true);
    expect(buffer.step(530, false, true)).toBe(false);
  });
  it('disables baby jumping while keeping later jumping stages', () => {
    expect(movement.baby.jump).toBe(0);
    expect(movement.skate.jump).toBeGreaterThan(movement.baby.jump);
  });
});
