export const toddlerFrameNames = [
  ...Array.from({ length: 8 }, (_, i) => `walk-${i}`),
  ...Array.from({ length: 8 }, (_, i) => `jump-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `idle-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `discover-${i}`),
];

export function toddlerAnimationFrame(state: {
  distance: number; time: number; moving: boolean; airborne: boolean;
  vy: number; airTime: number; landingAge: number; reducedMotion: boolean;
}) {
  if (state.airborne) {
    if (state.reducedMotion) return 'jump-4';
    const pose = state.airTime < 55 && state.vy < 0 ? 0 : state.vy < -210 ? 1 : state.vy < -110 ? 2 : state.vy < -35 ? 3 : state.vy < 50 ? 4 : state.vy < 160 ? 5 : 6;
    return `jump-${pose}`;
  }
  if (!state.reducedMotion && state.landingAge < 250) return state.landingAge < 140 ? 'jump-6' : 'jump-7';
  // A full stride takes 128 world pixels (~1.16 s at walking speed).
  if (state.moving) return `walk-${state.reducedMotion ? 0 : Math.floor(state.distance / 16) % 8}`;
  return `idle-${state.reducedMotion ? 0 : Math.floor(state.time / 450) % 4}`;
}
