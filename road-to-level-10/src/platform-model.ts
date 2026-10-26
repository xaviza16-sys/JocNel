export type PlatformMode = 'baby' | 'toddler' | 'hospital' | 'snow' | 'nature' | 'skate';
export type EnemyKind = 'yogurt' | 'tomato' | 'pepper' | 'ball' | 'snowball' | 'doctor' | 'nurse';
export const movement: Record<PlatformMode, { speed: number; jump: number; actor: string; height: number }> = {
  baby: { speed: 80, jump: 0, actor: 'baby', height: 32 },
  toddler: { speed: 110, jump: 295, actor: 'toddler', height: 40 },
  hospital: { speed: 125, jump: 310, actor: 'child', height: 44 },
  snow: { speed: 135, jump: 300, actor: 'snow', height: 42 },
  nature: { speed: 120, jump: 315, actor: 'explorer', height: 46 },
  skate: { speed: 160, jump: 325, actor: 'skater', height: 46 },
};
export function enemyIntent(kind: EnemyKind, time: number, direction: number) {
  const cycle = (time % 2800 + 2800) % 2800;
  if (kind === 'doctor' || kind === 'nurse') return { vx: direction * (kind === 'doctor' ? 28 : 36), jump: false, warn: false };
  if (kind === 'yogurt') return { vx: direction * 24, jump: cycle < 90, warn: false };
  if (kind === 'tomato') return { vx: direction * 48, jump: false, warn: false };
  if (kind === 'pepper') return { vx: cycle < 650 ? 0 : direction * (cycle < 1150 ? 88 : 22), jump: cycle >= 1150 && cycle < 1240, warn: cycle < 650 };
  return { vx: direction * (kind === 'ball' ? 29 : 45), jump: false, warn: false };
}
export class JumpBuffer {
  private queuedUntil = -Infinity;
  private groundUntil = -Infinity;
  reset() { this.queuedUntil = this.groundUntil = -Infinity; }
  step(now: number, grounded: boolean, pressed: boolean) {
    if (grounded) this.groundUntil = now + 90;
    if (pressed) this.queuedUntil = now + 130;
    if (now <= this.queuedUntil && now <= this.groundUntil) {
      this.reset(); return true;
    }
    return false;
  }
}
