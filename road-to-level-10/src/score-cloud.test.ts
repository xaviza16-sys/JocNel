import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScoreCloud } from './score-cloud';
import type { ScoreRun } from './scores';
const run = (): ScoreRun => ({ id: 'local-1', player: 'Ona', startedAt: '2026-01-01T00:00:00Z', chapters: { baby: { points: 25, stats: { progress: 10 } } } });
const memory = () => { let saved: string | null = null; return { getItem: () => saved, setItem: (_key: string, data: string) => { saved = data; } }; };
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
describe('shared score synchronisation', () => {
  it('persists offline updates and reuses the same private credential when retrying', async () => {
    vi.useFakeTimers(); const storage = memory();
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ id: 'remote-1', token: 'private-token' })).mockRejectedValueOnce(new Error('offline'));
    const cloud = new ScoreCloud('https://scores.test', storage, request);
    cloud.queue(run()); await cloud.flush(); expect(cloud.pending).toBe(1);
    const retryRequest = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ points: 25 }));
    const restored = new ScoreCloud('https://scores.test', storage, retryRequest); await restored.flush();
    expect(restored.pending).toBe(0); expect(retryRequest).toHaveBeenCalledTimes(1);
    expect(retryRequest.mock.calls[0][0]).toBe('https://scores.test/api/runs/remote-1');
    expect(retryRequest.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer private-token' });
  });
  it('never drops a newer snapshot that arrives while an older one is uploading', async () => {
    vi.useFakeTimers(); let registered!: (response: Response) => void;
    const request = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise(resolve => { registered = resolve; })).mockImplementation(async () => Response.json({ points: 25 }));
    const cloud = new ScoreCloud('https://scores.test', memory(), request);
    cloud.queue(run()); const first = cloud.flush();
    const updated = run(); updated.chapters.baby = { points: 750, stats: { progress: 100, complete: true } }; updated.endedAt = '2026-01-01T00:01:00Z'; cloud.queue(updated);
    registered(Response.json({ id: 'remote-1', token: 'private-token' })); await first;
    expect(cloud.pending).toBe(1); await cloud.flush(); expect(cloud.pending).toBe(0);
    const last = JSON.parse(request.mock.calls.at(-1)![1]!.body as string);
    expect(last.finished).toBe(true); expect(last.chapters.baby.stats.progress).toBe(100);
  });
  it('reads the shared ranking without exposing write credentials', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ runs: [{ player: 'Pau', points: 750 }] }));
    const cloud = new ScoreCloud('https://scores.test', memory(), request);
    expect(await cloud.list()).toEqual([{ player: 'Pau', points: 750 }]);
    expect(request.mock.calls[0][1]?.credentials).toBe('omit');
    expect(request.mock.calls[0][1]?.headers).toBeUndefined();
  });
});
