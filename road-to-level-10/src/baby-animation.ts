export const babyFrameNames = [
  ...Array.from({ length: 8 }, (_, i) => `crawl-${i}`),
  ...Array.from({ length: 8 }, (_, i) => `climb-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `push-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `idle-${i}`),
];

export function babyAnimationFrame(state: {
  distance: number; time: number; moving: boolean; pushing: boolean;
  climbProgress?: number; reducedMotion: boolean;
}) {
  if (state.climbProgress !== undefined) {
    const pose = state.reducedMotion ? 4 : Math.min(7, Math.max(0, Math.floor(state.climbProgress * 8)));
    return `climb-${pose}`;
  }
  if (state.pushing) return `push-${state.reducedMotion ? 0 : Math.floor(state.time / 110) % 4}`;
  if (state.moving) return `crawl-${state.reducedMotion ? 0 : Math.floor(state.distance / 7) % 8}`;
  return `idle-${state.reducedMotion ? 0 : Math.floor(state.time / 420) % 4}`;
}
