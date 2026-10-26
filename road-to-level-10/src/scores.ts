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
  elapsedSeconds?: number;
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
  return { progress: count(stats.progress, 100) / 10 | 0, stars: count(stats.stars, 30), boosts: count(stats.boosts, 30), dodges: count(stats.dodges, 50), ziplines: count(stats.ziplines, 5), vines: count(stats.vines, 5), quarters: count(stats.quarters, 4), puzzles: count(stats.puzzles, 2), dog: stats.dog === true, bumps: count(stats.bumps, 100), complete: stats.complete === true, elapsedSeconds: typeof stats.elapsedSeconds === 'number' ? count(stats.elapsedSeconds, 7200) : undefined };
}
export function speedPoints(stats: ScoreStats) { return stats.complete && typeof stats.elapsedSeconds === 'number' ? Math.max(0, 1000 - count(stats.elapsedSeconds, 7200) * 5) : 0; }
export function scorePoints(stats: ScoreStats) {
  const s = normalizedStats(stats);
  return Math.max(0, s.stars! * 100 + s.boosts! * 50 + speedPoints(s) - s.bumps! * 25);
}
export const runPoints = (run: ScoreRun) => Object.values(run.chapters).reduce((total, chapter) => total + chapter.points, 0);
export const playerAlias = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 24) || 'Jugador';

export class ScoreManager {
  onChange?: (run: ScoreRun) => void;
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
      for (const run of this.data.runs) for (const chapter of Object.values(run.chapters)) chapter.points = scorePoints(chapter.stats);
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
    const run = this.ensure(), normalized = normalizedStats(stats), signature = `${run.id}:${levelId}:${JSON.stringify({ ...normalized, elapsedSeconds: normalized.complete ? normalized.elapsedSeconds : 0 })}`;
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
  exportText() { return scoreText(this.runs); }
  private save() {
    if (this.active) this.onChange?.(this.active);
    try { if (!this.storage) { this.persistent = false; return; } this.storage.setItem(scoreKey, JSON.stringify(this.data)); }
    catch { this.persistent = false; }
  }
}
export function scoreText(runs: ScoreRun[]) {
  return ['PUNTUACIONS D’EN NEL', 'Posició\tJugador\tPunts\tData\tEstat', ...runs.map((run, i) => `${i + 1}\t${run.player.replace(/[\t\r\n]/g, ' ')}\t${runPoints(run)}\t${run.startedAt}\t${run.endedAt ? 'Acabada' : 'En curs'}`)].join('\n') + '\n';
}
