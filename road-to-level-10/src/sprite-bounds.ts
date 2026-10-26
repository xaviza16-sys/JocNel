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
