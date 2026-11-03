import { expect, it } from 'vitest';
import { silhouetteBounds, sheetBlobs, ownedBounds } from './sprite-bounds';

it('excludes a neighboring frame fragment while retaining diagonal pixel outlines', () => {
  const data = new Uint8ClampedArray(16 * 16 * 4);
  const pixel = (x: number, y: number) => { data[(y * 16 + x) * 4 + 3] = 255; };
  for (let y = 4; y < 12; y++) for (let x = 4; x < 9; x++) pixel(x, y);
  pixel(9, 12); // Diagonal shoe remains part of the silhouette.
  pixel(3, 1); pixel(4, 1); // Curl belonging to the row above.
  expect(silhouetteBounds(data, 16, { x: 2, y: 0, width: 12, height: 16 })).toEqual({ x: 4, y: 4, width: 6, height: 9 });
});

it('keeps a sprite whole past its cell edge and leaves the neighbour chip out', () => {
  const data = new Uint8ClampedArray(20 * 10 * 4);
  const pixel = (x: number, y: number) => { data[(y * 20 + x) * 4 + 3] = 255; };
  for (let y = 2; y < 8; y++) for (let x = 2; x < 11; x++) pixel(x, y); // Left drawing: wheel crosses x = 10.
  for (let y = 3; y < 9; y++) for (let x = 13; x < 18; x++) pixel(x, y); // Right drawing.
  pixel(12, 0); // A separate sparkle of the right drawing.
  const blobs = sheetBlobs(data, 20, 10);
  expect(ownedBounds(blobs, { x: 0, y: 0, width: 10, height: 10 })).toEqual({ x: 2, y: 2, width: 9, height: 6 });
  expect(ownedBounds(blobs, { x: 10, y: 0, width: 10, height: 10 })).toEqual({ x: 12, y: 0, width: 6, height: 9 });
});

it('refuses ownership when two drawings touch and merge into one blob', () => {
  const data = new Uint8ClampedArray(20 * 4 * 4);
  for (let x = 0; x < 20; x++) data[(1 * 20 + x) * 4 + 3] = 255;
  expect(ownedBounds(sheetBlobs(data, 20, 4), { x: 0, y: 0, width: 10, height: 4 })).toBeUndefined();
});
