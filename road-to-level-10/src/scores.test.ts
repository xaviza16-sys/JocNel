import { describe, expect, it } from 'vitest';
import { ScoreManager, scorePoints, runPoints } from './scores';

const memory = () => { let text: string | null = null; return { getItem: () => text, setItem: (_key: string, value: string) => { text = value; } }; };
describe('points and player history', () => {
  it('rewards progress, collectibles and unique objectives, with bounded collision penalties', () => {
    expect(scorePoints({ progress: 100, stars: 2, complete: true, bumps: 2 })).toBe(900);
    expect(scorePoints({ progress: 0, quarters: 4 })).toBe(800);
    expect(scorePoints({ progress: -20, stars: NaN, bumps: 500 })).toBe(0);
  });
  it('keeps each player and unfinished run across reloads and exports everyone', () => {
    const storage = memory(), scores = new ScoreManager(storage);
    scores.begin('  Ona  '); scores.update('baby', { progress: 50, stars: 1 });
    scores.begin('Pau'); scores.update('moto', { progress: 100, boosts: 2, complete: true });
    const restored = new ScoreManager(storage);
    expect(restored.runs.map(run => run.player)).toEqual(['Pau', 'Ona']);
    expect(restored.active?.player).toBe('Pau');
    const exported = JSON.parse(restored.exportFile());
    expect(exported.runs).toHaveLength(2); expect(exported.runs[0].points).toBe(850);
    expect(exported.runs[1].endedAt).toBeTruthy();
  });
  it('does not farm points by replaying completed chapters or revisiting results', () => {
    const scores = new ScoreManager(memory()); scores.begin('Nel');
    scores.update('baby', { progress: 100, stars: 1, complete: true });
    scores.update('baby', { progress: 0 }); scores.update('baby', { progress: 100, stars: 1, complete: true });
    expect(scores.total).toBe(850);
    scores.update('baby', { progress: 100, stars: 2, complete: true });
    expect(runPoints(scores.active!)).toBe(950);
  });
  it('recovers from corrupt or unavailable storage and still exports the in-memory session', () => {
    expect(new ScoreManager({ getItem: () => '{', setItem() {} }).runs).toEqual([]);
    const scores = new ScoreManager({ getItem() { throw new Error(); }, setItem() { throw new Error(); } });
    scores.begin(' '); scores.update('baby', { progress: 100, complete: true });
    expect(scores.persistent).toBe(false); expect(JSON.parse(scores.exportFile()).runs[0].player).toBe('Jugador');
  });
});
