export interface SpriteBounds { x: number; y: number; width: number; height: number }

// Generated sheets have slightly uneven gutters. A neighboring shoe or curl
// can enter a nominal cell: keep the main connected silhouette, not that chip.
export function silhouetteBounds(data: Uint8ClampedArray, stride: number, region: SpriteBounds): SpriteBounds {
  const { x, y, width, height } = region;
  const visited = new Uint8Array(width * height);
  let largest = 0, result: SpriteBounds | undefined;
  const opaque = (local: number) => data[((y + Math.floor(local / width)) * stride + x + local % width) * 4 + 3] >= 150;
  for (let start = 0; start < visited.length; start++) {
    if (visited[start] || !opaque(start)) continue;
    const pending = [start]; visited[start] = 1;
    let count = 0, left = width, right = 0, top = height, bottom = 0;
    while (pending.length) {
      const at = pending.pop()!, px = at % width, py = Math.floor(at / width);
      count++; left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!visited[next] && opaque(next)) { visited[next] = 1; pending.push(next); }
      }
    }
    if (count > largest) {
      largest = count; result = { x: x + left, y: y + top, width: right - left + 1, height: bottom - top + 1 };
    }
  }
  if (!result) throw new Error('Sprite sense silueta');
  return result;
}

export interface SheetBlob { left: number; top: number; right: number; bottom: number; cx: number; cy: number; count: number }

// Labels every opaque 8-connected blob of a whole sheet once, so a sprite that
// crosses a nominal cell edge is measured complete instead of being clipped.
export function sheetBlobs(data: Uint8ClampedArray, width: number, height: number, alpha = 150): SheetBlob[] {
  const seen = new Uint8Array(width * height), blobs: SheetBlob[] = [], pending: number[] = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4 + 3] < alpha) continue;
    seen[start] = 1; pending.push(start);
    let left = width, right = 0, top = height, bottom = 0, sx = 0, sy = 0, count = 0;
    while (pending.length) {
      const at = pending.pop()!, px = at % width, py = (at - px) / width;
      count++; sx += px; sy += py;
      if (px < left) left = px; if (px > right) right = px; if (py < top) top = py; if (py > bottom) bottom = py;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!seen[next] && data[next * 4 + 3] >= alpha) { seen[next] = 1; pending.push(next); }
      }
    }
    blobs.push({ left, top, right, bottom, cx: sx / count, cy: sy / count, count });
  }
  return blobs;
}

// A blob belongs to the cell holding its centre of mass: neighbours' shoes or
// wheels are left out and the cell's own feet or hair are kept even past the
// edge. Returns undefined when a blob spills too far, i.e. two drawings touch.
export function ownedBounds(blobs: SheetBlob[], region: SpriteBounds, spill = .15): SpriteBounds | undefined {
  const { x, y, width, height } = region, mx = width * spill, my = height * spill;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const b of blobs) {
    if (b.cx < x || b.cx >= x + width || b.cy < y || b.cy >= y + height) continue;
    if (b.left < x - mx || b.right >= x + width + mx || b.top < y - my || b.bottom >= y + height + my) return undefined;
    left = Math.min(left, b.left); top = Math.min(top, b.top); right = Math.max(right, b.right); bottom = Math.max(bottom, b.bottom);
  }
  return left > right ? undefined : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
