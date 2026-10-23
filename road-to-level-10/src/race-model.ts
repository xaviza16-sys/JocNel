export type RoadKind = 'star' | 'coin' | 'memory' | 'cone' | 'puddle' | 'blocks' | 'shield' | 'boost' | 'magnet';
export interface RoadEvent { distance: number; lane: -1 | 0 | 1; kind: RoadKind }
export interface RaceConfig { length: number; speed: number; events: RoadEvent[] }
export const roadKinds: RoadKind[] = ['star', 'coin', 'memory', 'cone', 'puddle', 'blocks', 'shield', 'boost', 'magnet'];

export function validRace(value: RaceConfig | undefined): boolean {
  return !!value && Number.isFinite(value.length) && value.length >= 200
    && Number.isFinite(value.speed) && value.speed >= 10 && value.speed <= 60
    && Array.isArray(value.events) && value.events.every(e => e && Number.isFinite(e.distance)
      && e.distance > 0 && e.distance < value.length && [-1, 0, 1].includes(e.lane) && roadKinds.includes(e.kind))
    && value.events.every((e, i, all) => !all.some((other, j) => i !== j && e.distance === other.distance && e.lane === other.lane));
}

export class RaceController {
  distance = 0;
  steering = 0;
  stars = 0;
  coins = 0;
  memories = 0;
  hits = 0;
  avoided = 0;
  powerups = 0;
  shield = 0;
  boost = 0;
  magnet = 0;
  grace = 0;
  slow = 0;
  resolved = new Set<number>();
  feedback = '';
  feedbackTime = 0;
  constructor(readonly config: RaceConfig) {}
  get finished() { return this.distance >= this.config.length; }
  get speed() { return this.config.speed * (this.slow > 0 ? .45 : this.boost > 0 ? 1.5 : 1); }
  step(seconds: number, axis: number): RoadKind[] {
    if (this.finished) return [];
    const dt = Math.max(0, Math.min(seconds, .1));
    this.steering = Math.max(-.9, Math.min(.9, this.steering + axis * dt * 1.8));
    for (const key of ['shield', 'boost', 'magnet', 'grace', 'slow', 'feedbackTime'] as const) this[key] = Math.max(0, this[key] - dt);
    this.distance = Math.min(this.config.length, this.distance + this.speed * dt);
    const collected: RoadKind[] = [];
    this.config.events.forEach((event, index) => {
      if (this.resolved.has(index) || event.distance > this.distance) return;
      this.resolved.add(index);
      const obstacle = ['cone', 'puddle', 'blocks'].includes(event.kind);
      const nearby = Math.abs(this.steering - event.lane * .64) < .28;
      if (obstacle) {
        if (!nearby) { this.avoided++; return; }
        if (this.grace > 0) return;
        if (this.shield > 0) {
          this.shield = 0; this.grace = 1; this.message('L’escut et protegeix!');
        } else {
          this.hits++; this.slow = .8; this.grace = 1.8; this.message('Ui! Continua, no passa res');
        }
      } else if (nearby || ['star', 'coin'].includes(event.kind) && this.magnet > 0) {
        collected.push(event.kind);
        if (event.kind === 'star') this.stars++;
        else if (event.kind === 'coin') this.coins++;
        else if (event.kind === 'memory') { this.memories++; this.message('Una foto més per a l’àlbum!'); }
        else {
          this.powerups++;
          if (event.kind === 'shield') { this.shield = 7; this.message('ESCUT · Protecció per a una topada'); }
          if (event.kind === 'boost') { this.boost = 4; this.message('TURBO · Som-hi!'); }
          if (event.kind === 'magnet') { this.magnet = 7; this.message('IMANT · Les estrelles venen cap a tu'); }
        }
      }
    });
    return collected;
  }
  private message(text: string) { this.feedback = text; this.feedbackTime = 2.5; }
}
