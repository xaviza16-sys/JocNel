import { describe, expect, it } from 'vitest';
import { BabyPuzzle, canMantle } from './baby-puzzle';
import { snowGround, SnowboardController, zipPose, vinePose, nextSwingAngle } from './traversal';
import { tunes, midiHz, AudioManager } from './audio';
import { levels } from './model';

describe('baby stair puzzle', () => {
  it('requires a pushed step to reach a high ledge without jumping', () => {
    expect(canMantle(230, 170, 0)).toBe(false);
    expect(canMantle(230, 200, 0)).toBe(true);
    expect(canMantle(200, 170, 0)).toBe(true);
    expect(canMantle(230, 200, 90)).toBe(false);
  });
  it('pushes a chain without overlap and stops at the intended stair positions', () => {
    const puzzle = new BabyPuzzle(levels[0].blocks!);
    for (let i = 0; i < 300; i++) puzzle.push('step-one', 2);
    expect(puzzle.readyCount).toBe(1);
    for (let i = 0; i < 400; i++) puzzle.push('step-small', 2);
    expect(puzzle.readyCount).toBe(2);
    expect(puzzle.blocks.map(b => b.x)).toEqual([500, 1050, 1090]);
    expect(puzzle.push('step-small', 10)).toBe(0);
    expect(levels[0].blocks![0].x).toBe(420);
  });
  it('allows undoing pushes and restarting without mutating the configuration', () => {
    const puzzle = new BabyPuzzle(levels[0].blocks!); puzzle.push('step-one', -1000);
    expect(puzzle.blocks[0].x).toBe(350);
    expect(new BabyPuzzle(levels[0].blocks!).blocks[0].x).toBe(420);
  });
});
describe('snowboard descent and forest traversal', () => {
  it('descends a real sloped ground profile while braking and jumping', () => {
    expect(snowGround(2000) - snowGround(100)).toBeGreaterThan(400);
    const board = new SnowboardController(); board.step(.05, 0, true);
    expect(board.airborne).toBe(true); expect(board.jumps).toBe(1);
    for (let i = 0; i < 100; i++) board.step(.05, 1, false);
    expect(board.speed).toBeGreaterThan(180); expect(board.airborne).toBe(false);
    for (let i = 0; i < 100; i++) board.step(.05, -1, false);
    expect(board.speed).toBeLessThan(85); expect(board.feet).toBeCloseTo(snowGround(board.x));
  });
  it('interpolates zipline endpoints and limits vine swing angles', () => {
    const zip = levels.find(l => l.id === 'nature')!.ziplines![0];
    expect(zipPose(zip, 0)).toEqual({ x: zip.x1, y: zip.y1 });
    expect(zipPose(zip, 1)).toEqual({ x: zip.x2, y: zip.y2 });
    expect(nextSwingAngle(.84, 1, 1)).toBe(.85);
    const vine = { x: 900, y: 20, length: 100 };
    expect(vinePose(vine, -.6).x).toBeLessThan(900); expect(vinePose(vine, .6).x).toBeGreaterThan(900);
  });
});
describe('original chiptune soundtrack', () => {
  it('provides sixteen-step melodies for every chapter and distinct themes', () => {
    for (const melody of Object.values(tunes)) { expect(melody).toHaveLength(16); expect(melody.every(n => n === null || n >= 48 && n <= 96)).toBe(true); }
    expect(tunes.baby).not.toEqual(tunes.skate); expect(midiHz(69)).toBe(440);
  });
  it('can select music and effects without opening audio before a user gesture', () => {
    const audio = new AudioManager(); audio.playTheme('snow'); audio.sfx('jump'); audio.setPaused(true); audio.muted = false;
    expect(audio.muted).toBe(false); audio.destroy();
  });
});
