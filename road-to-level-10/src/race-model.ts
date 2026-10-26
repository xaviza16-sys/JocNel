export type RoadKind = 'family' | 'leaves' | 'poop' | 'boost';
export interface RoadEvent { distance: number; lane: -1 | 0 | 1; kind: RoadKind }
export interface RaceConfig { length: number; speed: number; events: RoadEvent[] }
export const roadKinds: RoadKind[] = ['family', 'leaves', 'poop', 'boost'];
export const FALL_SECONDS = 2.8;
export const SPIN_SECONDS = 1.6;

export function validRace(value: RaceConfig | undefined): boolean {
  return !!value && Number.isFinite(value.length) && value.length >= 200
    && Number.isFinite(value.speed) && value.speed >= 10 && value.speed <= 60
    && Array.isArray(value.events) && value.events.every(e => e && Number.isFinite(e.distance)
      && e.distance > 0 && e.distance < value.length && [-1, 0, 1].includes(e.lane) && roadKinds.includes(e.kind))
    && value.events.every((e, i, all) => !all.some((other, j) => i !== j && e.distance === other.distance && e.lane === other.lane))
    && value.events.every((e, i, all) => i === 0 || e.distance >= all[i - 1].distance);
}

export class RaceController {
  distance = 0;
  steering = 0;
  hits = 0;
  avoided = 0;
  powerups = 0;
  boost = 0;
  grace = 0;
  slow = 0;
  fall = 0;
  gettingUp = false;
  spin = 0;
  spins = 0;
  resolved = new Set<number>();
  feedback = '';
  feedbackTime = 0;
  constructor(readonly config: RaceConfig) {}
  get finished() { return this.spin === 0 && this.fall === 0 && this.distance >= this.config.length; }
  get speed() { return this.spin > 0 || this.fall > 0 ? 0 : this.config.speed * (this.slow > 0 ? .45 : this.boost > 0 ? 1.65 : 1); }
  get needsGetUp() { return this.fall > 0 && this.fall <= 1.9 && !this.gettingUp; }
  step(seconds: number, axis: number, getUp = false): RoadKind[] {
    if (this.finished) return [];
    const dt = Math.max(0, Math.min(seconds, .1));
    for (const key of ['boost', 'grace', 'slow', 'feedbackTime'] as const) this[key] = Math.max(0, this[key] - dt);
    if (this.spin > 0) {
      this.spin = Math.max(0, this.spin - dt);
      if (this.spin === 0) { this.grace = Math.max(this.grace, 1); this.message('Ja tornes a tenir el control! Som-hi!'); }
      return [];
    }
    if (this.fall > 0) {
      if (getUp) this.gettingUp = true;
      if (this.gettingUp) this.fall = Math.max(0, this.fall - dt);
      else this.fall = Math.max(1.9, this.fall - dt);
      if (this.fall === 0) { this.gettingUp = false; this.grace = 1.4; this.message('Ja ens hem aixecat! Som-hi!'); }
      return [];
    }
    this.steering = Math.max(-.9, Math.min(.9, this.steering + axis * dt * 1.8));
    this.distance = Math.min(this.config.length, this.distance + this.speed * dt);
    const contacts: RoadKind[] = [];
    for (let index = 0; index < this.config.events.length; index++) {
      const event = this.config.events[index];
      if (event.distance > this.distance) break;
      if (this.resolved.has(index)) continue;
      this.resolved.add(index);
      const collisionWidth = { family: .28, leaves: .24, poop: .19, boost: .22 }[event.kind];
      const nearby = Math.abs(this.steering - event.lane * .64) < collisionWidth;
      if (!nearby) { if (event.kind !== 'boost') this.avoided++; continue; }
      if (event.kind === 'family' && this.grace > 0) continue;
      contacts.push(event.kind);
      if (event.kind === 'boost') {
        this.powerups++; this.boost = 1.8; this.slow = 0; this.message('FLETXES TURBO · Acceleració!');
      } else if (event.kind === 'leaves') {
        this.boost = 0; this.slow = 1.8; this.message('FULLES · La moto va més a poc a poc');
      } else if (event.kind === 'family') {
        this.hits++; this.fall = FALL_SECONDS; this.boost = this.slow = 0;
        this.distance = event.distance; this.message('Ui! Hem caigut. Ara ens aixequem!');
        break;
      } else {
        this.spin = SPIN_SECONDS; this.spins++; this.boost = this.slow = 0; this.distance = event.distance;
        this.message('Una caca de gos! La moto patina i dona voltes!'); break;
      }
    }
    return contacts;
  }
  private message(text: string) { this.feedback = text; this.feedbackTime = 2.5; }
}
