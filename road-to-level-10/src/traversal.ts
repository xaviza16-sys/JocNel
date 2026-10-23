export interface Zipline { x1: number; y1: number; x2: number; y2: number }
export interface Vine { x: number; y: number; length: number }
export const zipPose = (zip: Zipline, progress: number) => ({ x: zip.x1 + (zip.x2 - zip.x1) * progress, y: zip.y1 + (zip.y2 - zip.y1) * progress });
export const vinePose = (vine: Vine, angle: number) => ({ x: vine.x + Math.sin(angle) * vine.length, y: vine.y + Math.cos(angle) * vine.length + 26 });
export const nextSwingAngle = (angle: number, axis: number, dt: number) => Math.max(-.85, Math.min(.85, angle + (axis || .45) * dt * 1.5));
export const snowGround = (x: number) => 165 + x * .23 + Math.sin(x / 135) * 7;
export class SnowboardController {
  x = 64;
  feet = snowGround(64);
  speed = 110;
  vy = 0;
  airborne = false;
  jumps = 0;
  step(seconds: number, axis: number, jump: boolean) {
    const dt = Math.max(0, Math.min(seconds, .06));
    const target = axis < 0 ? 75 : axis > 0 ? 195 : 145;
    this.speed += (target - this.speed) * Math.min(1, dt * 2);
    if (jump && !this.airborne) { this.vy = -285; this.airborne = true; this.jumps++; }
    this.x += this.speed * dt;
    if (this.airborne) { this.vy += 750 * dt; this.feet += this.vy * dt; }
    if (!this.airborne || this.feet >= snowGround(this.x)) { this.feet = snowGround(this.x); this.vy = 0; this.airborne = false; }
  }
  reset(x: number) { this.x = x; this.feet = snowGround(x); this.vy = 0; this.speed = 105; this.airborne = false; }
}
