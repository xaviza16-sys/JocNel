export interface ScoreStats {
  progress: number;
  stars?: number;
  boosts?: number;
  dodges?: number;
  ziplines?: number;
  vines?: number;
  quarters?: number;
  puzzles?: number;
  dog?: boolean;
  bumps?: number;
  complete?: boolean;
}
export interface ChapterScore { points: number; stats: ScoreStats }
export interface ScoreRun {
  id: string; player: string; startedAt: string; endedAt?: string;
  chapters: Record<string, ChapterScore>;
}
interface ScoreData { version: 1; player: string; activeId?: string; runs: ScoreRun[] }
export const scoreKey = 'nel-scores-v1';
const count = (value: number | undefined, max: number) => Math.min(max, Math.max(0, Math.floor(Number.isFinite(value) ? value! : 0)));
export function normalizedStats(stats: ScoreStats): ScoreStats {
  return { progress: count(stats.progress, 100) / 10 | 0, stars: count(stats.stars, 30), boosts: count(stats.boosts, 30), dodges: count(stats.dodges, 50), ziplines: count(stats.ziplines, 5), vines: count(stats.vines, 5), quarters: count(stats.quarters, 4), puzzles: count(stats.puzzles, 2), dog: stats.dog === true, bumps: count(stats.bumps, 100), complete: stats.complete === true };
}
export function scorePoints(stats: ScoreStats) {
  const s = normalizedStats(stats);
  return Math.max(0, s.progress * 25 + s.stars! * 100 + s.boosts! * 50 + s.dodges! * 25 + s.ziplines! * 150 + s.vines! * 100 + s.quarters! * 200 + s.puzzles! * 100 + (s.dog ? 100 : 0) + (s.complete ? 500 : 0) - s.bumps! * 25);
}
export const runPoints = (run: ScoreRun) => Object.values(run.chapters).reduce((total, chapter) => total + chapter.points, 0);
export const playerAlias = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 24) || 'Jugador';

export class ScoreManager {
  private data: ScoreData = { version: 1, player: 'Jugador', runs: [] };
  private lastUpdate = '';
  persistent = true;
  constructor(private storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    this.persistent = !!storage;
    try {
      const saved = JSON.parse(storage?.getItem(scoreKey) || 'null') as ScoreData | null;
      if (saved?.version === 1 && Array.isArray(saved.runs)) {
        this.data = { version: 1, player: playerAlias(typeof saved.player === 'string' ? saved.player : ''), activeId: saved.activeId, runs: saved.runs.filter(run => run && typeof run.id === 'string' && typeof run.player === 'string' && typeof run.startedAt === 'string' && run.chapters && Object.values(run.chapters).every(chapter => chapter && Number.isFinite(chapter.points) && chapter.points >= 0 && chapter.stats && Number.isFinite(chapter.stats.progress))) };
      }
    } catch { /* A damaged save never prevents playing. */ }
  }
  get player() { return this.data.player; }
  get active() { return this.data.runs.find(run => run.id === this.data.activeId); }
  get runs() { return [...this.data.runs].sort((a, b) => runPoints(b) - runPoints(a) || b.startedAt.localeCompare(a.startedAt)); }
  get total() { return this.active ? runPoints(this.active) : 0; }
  begin(player: string) {
    this.finish();
    const run: ScoreRun = { id: crypto.randomUUID(), player: playerAlias(player), startedAt: new Date().toISOString(), chapters: {} };
    this.data.player = run.player; this.data.activeId = run.id; this.data.runs.push(run); this.lastUpdate = ''; this.save(); return run;
  }
  ensure() { return this.active && !this.active.endedAt ? this.active : this.begin(this.player); }
  update(levelId: string, stats: ScoreStats) {
    const run = this.ensure(), normalized = normalizedStats(stats), signature = `${run.id}:${levelId}:${JSON.stringify(normalized)}`;
    if (signature === this.lastUpdate) return;
    this.lastUpdate = signature;
    const old = run.chapters[levelId], points = scorePoints(stats);
    // Keep a completed chapter's best result: replaying never adds it twice.
    if (!old?.stats.complete || stats.complete && points > old.points) {
      run.chapters[levelId] = { points, stats: { ...stats, progress: normalized.progress * 10 } }; this.save();
    }
  }
  finish() { const run = this.active; if (run && !run.endedAt) { run.endedAt = new Date().toISOString(); this.save(); } }
  exportFile() { return JSON.stringify({ format: 'puntuacions-nel', version: 1, exportedAt: new Date().toISOString(), runs: this.runs.map(run => ({ ...run, points: runPoints(run) })) }, null, 2); }
  private save() {
    try { if (!this.storage) { this.persistent = false; return; } this.storage.setItem(scoreKey, JSON.stringify(this.data)); }
    catch { this.persistent = false; }
  }
}
