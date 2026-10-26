import rawLevels from './data/levels.json';
import { validRace, type RaceConfig } from './race-model';
import { type PlatformMode, type EnemyKind } from './platform-model';
import type { PushBlock } from './baby-puzzle';
import type { Zipline, Vine } from './traversal';

export interface Level {
  id: string; title: string; subtitle: string; mode: PlatformMode | 'moto'; ageMin: number;
  width: number; spawn: number; finish: number; hint: string;
  stars: { x: number; y: number }[]; checkpoints: number[];
  platforms: { x: number; y: number; width: number; height: number }[];
  enemies: { kind: EnemyKind; x: number; range: number }[];
  ladders: { x: number; top: number; bottom: number }[];
  goalY: number;
  race?: RaceConfig;
  blocks?: PushBlock[];
  ziplines?: Zipline[];
  vines?: Vine[];
  dog?: { x: number; width: number; height: number };
}

export function validateLevels(data: unknown): Level[] {
  if (!Array.isArray(data) || !data.length) throw new Error('No hi ha nivells');
  const ids = new Set<string>();
  for (const item of data) {
    const l = item as Level;
    if (!l || typeof l.id !== 'string' || ids.has(l.id) || !['baby', 'toddler', 'moto', 'hospital', 'snow', 'nature', 'skate'].includes(l.mode)
      || typeof l.title !== 'string' || typeof l.subtitle !== 'string' || typeof l.hint !== 'string'
      || !Number.isFinite(l.width) || !Number.isFinite(l.spawn) || !Number.isFinite(l.finish)
      || l.spawn < 0 || l.spawn >= l.finish || l.finish >= l.width
      || !Number.isFinite(l.ageMin) || l.ageMin < 0 || !Number.isFinite(l.goalY) || l.goalY < 60 || l.goalY > 230
      || !Array.isArray(l.stars) || !l.stars.every(s => s && Number.isFinite(s.x) && s.x > 0 && s.x < l.width && Number.isFinite(s.y) && s.y > 20 && s.y < 230)
      || !Array.isArray(l.checkpoints) || !l.checkpoints.every(x => Number.isFinite(x) && x > l.spawn && x < l.finish)
      || !Array.isArray(l.platforms) || !l.platforms.every(p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.y >= 60 && p.y < 230 && p.x - p.width / 2 > 0 && p.x + p.width / 2 < l.width && p.width > 0 && p.height > 0 && p.height <= 110)
      || !Array.isArray(l.ladders) || !l.ladders.every(p => p && Number.isFinite(p.x) && p.x > 0 && p.x < l.width && p.top >= 50 && p.top < p.bottom && p.bottom <= 230)
      || !Array.isArray(l.enemies) || !l.enemies.every(e => e && ['yogurt', 'tomato', 'pepper', 'ball', 'snowball', 'doctor', 'nurse'].includes(e.kind) && Number.isFinite(e.x) && e.x > 80 && e.x < l.finish && Number.isFinite(e.range) && e.range > 0 && e.range <= 160 && (l.ageMin >= 4 || ['ball', 'snowball'].includes(e.kind)) && (!['doctor', 'nurse'].includes(e.kind) || l.mode === 'hospital'))
      || l.mode === 'moto' && !validRace(l.race)) {
      throw new Error('Configuració de nivell no vàlida');
    }
    if (l.blocks && !l.blocks.every(b => b && typeof b.id === 'string' && [b.x, b.width, b.height, b.minX, b.targetX].every(Number.isFinite) && b.width > 0 && b.height > 0 && b.height <= 90 && b.minX <= b.x && b.x <= b.targetX && b.targetX < l.finish)) throw new Error('Blocs no vàlids');
    if (l.ziplines && !l.ziplines.every(z => z && [z.x1, z.x2, z.y1, z.y2].every(Number.isFinite) && z.x1 > 0 && z.x2 > z.x1 && z.x2 < l.finish && z.y1 >= 50 && z.y2 <= 200)) throw new Error('Tirolines no vàlides');
    if (l.vines && !l.vines.every(v => v && [v.x, v.y, v.length].every(Number.isFinite) && v.x > 0 && v.x < l.finish && v.y >= 0 && v.length > 40 && v.length <= 160)) throw new Error('Lianes no vàlides');
    if (l.dog && (l.mode !== 'baby' || ![l.dog.x, l.dog.width, l.dog.height].every(Number.isFinite) || l.dog.x <= l.spawn || l.dog.x + l.dog.width / 2 >= l.finish || l.dog.width < 30 || l.dog.height <= 0 || l.dog.height > 32)) throw new Error('Configuració del gos no vàlida');
    ids.add(l.id);
  }
  return data as Level[];
}
export const levels = validateLevels(rawLevels);
export function nextLevel(id: string): Level | undefined {
  const index = levels.findIndex(l => l.id === id);
  return index < 0 ? undefined : levels[index + 1];
}
export interface Progress { completed: string[]; muted: boolean }
export class SaveManager {
  constructor(private storage?: Pick<Storage, 'getItem' | 'setItem'>) {}
  read(): Progress {
    try {
      const saved = JSON.parse(this.storage?.getItem('road-to-10-v1') || '{}');
      return { completed: Array.isArray(saved.completed) ? saved.completed.filter((id: unknown) => levels.some(l => l.id === id)) : [], muted: saved.muted !== false };
    } catch { return { completed: [], muted: true }; }
  }
  write(progress: Progress) { try { this.storage?.setItem('road-to-10-v1', JSON.stringify(progress)); } catch { /* Private browsing: play without persistence. */ } }
}
export function whatsAppUrl(phone: string): string | null {
  const clean = phone.replace(/[\s()+-]/g, '');
  return /^\d{8,15}$/.test(clean) ? `https://wa.me/${clean}?text=${encodeURIComponent('Ens apuntem a la festa d’en Nel!')}` : null;
}
