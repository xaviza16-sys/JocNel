import { expect, it } from 'vitest';
import { silhouetteBounds } from './sprite-bounds';

it('excludes a neighboring frame fragment while retaining diagonal pixel outlines', () => {
  const data = new Uint8ClampedArray(16 * 16 * 4);
  const pixel = (x: number, y: number) => { data[(y * 16 + x) * 4 + 3] = 255; };
  for (let y = 4; y < 12; y++) for (let x = 4; x < 9; x++) pixel(x, y);
  pixel(9, 12); // Diagonal shoe remains part of the silhouette.
  pixel(3, 1); pixel(4, 1); // Curl belonging to the row above.
  expect(silhouetteBounds(data, 16, { x: 2, y: 0, width: 12, height: 16 })).toEqual({ x: 4, y: 4, width: 6, height: 9 });
});
