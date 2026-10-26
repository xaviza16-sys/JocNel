import type { ScoreRun } from './scores';

export interface SharedRun extends ScoreRun { points: number; updatedAt: string }
interface CloudState { credentials: Record<string, { id: string; token: string }>; pending: Record<string, ScoreRun> }
const cloudKey = 'nel-score-cloud-v1';
export class ScoreCloud {
  private state: CloudState = { credentials: {}, pending: {} };
  private timer?: ReturnType<typeof setTimeout>;
  private inFlight?: Promise<void>;
  onStatus?: (status: string) => void;
  constructor(readonly endpoint: string, private storage?: Pick<Storage, 'getItem' | 'setItem'>, private request: typeof fetch = fetch) {
    try { const saved = JSON.parse(storage?.getItem(cloudKey) || 'null'); if (saved?.credentials && saved?.pending) this.state = saved; } catch { /* Local scores remain usable. */ }
    if (this.enabled && Object.keys(this.state.pending).length) this.schedule();
  }
  get enabled() { return !!this.endpoint; }
  get pending() { return Object.keys(this.state.pending).length; }
  queue(run: ScoreRun) {
    if (!this.enabled || !Object.keys(run.chapters).length) return;
    this.state.pending[run.id] = structuredClone(run); this.save(); this.schedule();
  }
  private schedule(delay = 2000) {
    if (this.timer) return;
    this.timer = setTimeout(() => { this.timer = undefined; void this.flush(); }, delay);
  }
  flush(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.inFlight) return this.inFlight;
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
    this.inFlight = this.sendPending().finally(() => { this.inFlight = undefined; });
    return this.inFlight;
  }
  private async json(path: string, init?: RequestInit) {
    const res = await this.request(`${this.endpoint}${path}`, { ...init, signal: AbortSignal.timeout(10000), credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error('Marcador no disponible');
    return res.json();
  }
  private async sendPending() {
    try {
      for (const [localId, snapshot] of Object.entries(this.state.pending)) {
        let credential = this.state.credentials[localId];
        if (!credential) {
          credential = await this.json('/api/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player: snapshot.player }) });
          if (typeof credential.id !== 'string' || typeof credential.token !== 'string') throw new Error('Resposta incorrecta');
          this.state.credentials[localId] = credential; this.save();
        }
        await this.json(`/api/runs/${encodeURIComponent(credential.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${credential.token}` }, body: JSON.stringify({ chapters: snapshot.chapters, finished: !!snapshot.endedAt }) });
        if (JSON.stringify(this.state.pending[localId]) === JSON.stringify(snapshot)) delete this.state.pending[localId];
        this.save();
      }
      this.onStatus?.(this.pending ? 'Enviant puntuacions…' : 'Puntuacions sincronitzades');
      if (this.pending) this.schedule();
    } catch { this.onStatus?.('Sense connexió amb el marcador. Punts desats al mòbil; ho tornarem a provar.'); this.schedule(15000); }
  }
  async list(): Promise<SharedRun[]> {
    if (!this.enabled) throw new Error('No hi ha servei de classificació configurat');
    const data = await this.json('/api/scores');
    if (!Array.isArray(data.runs)) throw new Error('Resposta incorrecta');
    return data.runs;
  }
  private save() { try { this.storage?.setItem(cloudKey, JSON.stringify(this.state)); } catch { /* Keep pending updates in memory. */ } }
}
