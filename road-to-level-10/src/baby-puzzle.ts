export interface PushBlock { id: string; x: number; width: number; height: number; minX: number; targetX: number }
export class BabyPuzzle {
  readonly blocks: PushBlock[];
  moved = 0;
  constructor(config: PushBlock[]) { this.blocks = config.map(block => ({ ...block })); }
  get readyCount() {
    const first = this.blocks.find(b => b.id === 'step-one');
    const pair = this.blocks.filter(b => b.id !== 'step-one');
    return Number(!!first && Math.abs(first.x - first.targetX) < .5) + Number(pair.length > 0 && pair.every(b => Math.abs(b.x - b.targetX) < .5));
  }
  push(id: string, delta: number): number {
    const block = this.blocks.find(b => b.id === id); if (!block || !delta) return 0;
    const sign = Math.sign(delta);
    let travel = Math.min(Math.abs(delta), sign > 0 ? block.targetX - block.x : block.x - block.minX);
    const neighbor = this.blocks.filter(b => b !== block && (b.x - block.x) * sign > 0)
      .sort((a, b) => Math.abs(a.x - block.x) - Math.abs(b.x - block.x))[0];
    if (neighbor) {
      const gap = Math.max(0, Math.abs(neighbor.x - block.x) - (block.width + neighbor.width) / 2);
      if (travel > gap) travel = Math.min(travel, gap + Math.abs(this.push(neighbor.id, sign * (travel - gap))));
    }
    const actual = Math.max(0, travel) * sign;
    block.x += actual; this.moved += Math.abs(actual); return actual;
  }
}
export function canMantle(feet: number, ledge: number, gap: number, reach = 32.5) {
  return feet - ledge > 3 && feet - ledge <= reach && gap >= -8 && gap <= 20;
}
