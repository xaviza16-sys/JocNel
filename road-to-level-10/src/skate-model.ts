export const quarterLips = [460, 980, 1500, 2020];
const radius = 70;
export function skateGround(x: number) {
  const local = ((x % 520) + 520) % 520;
  if (local < 170 || local >= 460) return 178;
  if (local < 240) return 178 + Math.sqrt(Math.max(0, radius ** 2 - (radius - (local - 170)) ** 2));
  if (local < 390) return 248;
  return 178 + Math.sqrt(Math.max(0, radius ** 2 - (local - 390) ** 2));
}
export const skateSlope = (x: number) => (skateGround(x + 1) - skateGround(x - 1)) / 2;

export class SkateController {
  x = 64;
  feet = skateGround(64);
  speed = 100;
  vy = 0;
  airborne = false;
  ollies = 0;
  quarters = new Set<number>();
  step(seconds: number, axis: number, jump: boolean) {
    const dt = Math.max(0, Math.min(seconds, .06)), before = this.x;
    const target = axis < 0 ? 55 : axis > 0 ? 180 : 110;
    this.speed += (target - this.speed) * Math.min(1, dt * 3);
    if (jump && !this.airborne) { this.vy = -265; this.airborne = true; this.ollies++; }
    this.x += this.speed * dt;
    for (const lip of quarterLips) if (before < lip && this.x >= lip) {
      this.quarters.add(lip);
      this.feet = Math.min(this.feet, skateGround(lip));
      if (!this.airborne) { this.airborne = true; this.vy = -205; }
    }
    if (this.airborne) { this.vy += 730 * dt; this.feet += this.vy * dt; }
    const ground = skateGround(this.x);
    if (!this.airborne || this.feet >= ground && (this.vy >= 0 || ground < skateGround(before))) { this.feet = ground; this.vy = 0; this.airborne = false; }
  }
  reset(x: number) { this.x = x; this.feet = skateGround(x); this.speed = 100; this.vy = 0; this.airborne = false; }
}
