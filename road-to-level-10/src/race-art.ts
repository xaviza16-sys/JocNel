import Phaser from 'phaser';
import riderUrl from '../assets/race/nel-promenade-rider-v1.webp';
import promenadeUrl from '../assets/race/promenade-v1.webp';
import { register } from './adventure-art';
import streetUrl from '../assets/race/autumn-street-v2.webp';
import atlas from '../assets/race/atlas.json';

export function loadRaceArt(scene: Phaser.Scene) {
  scene.load.image('race-rider', riderUrl);
  scene.load.image('race-street', streetUrl);
  scene.load.image('promenade', promenadeUrl);
}

export function createRaceFrames(scene: Phaser.Scene) {
  register(scene, 'race-rider', [...Array.from({ length: 8 }, (_, i) => `ride-${i}`), 'left', 'right', 'fall-0', 'fall-1', 'fallen', 'rise-0', 'rise-1', 'upright'], 4, 4, [0, .265, .52, .765, 1], undefined, true);
  register(scene, 'promenade', ['plane', 'hedge-wall', 'stone-wall', 'white-gate', 'grate', 'leaves', 'poop', 'boost'], 4, 2, [0, .34, .52]);
  register(scene, 'promenade', Array.from({ length: 8 }, (_, i) => `family-${i}`), 4, 2, [.52, .75, 1], undefined, true);
  const street = scene.textures.get('race-street');
  const source = street.getSourceImage() as HTMLImageElement;
  const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height).data;
  // The generated sheet has uneven row heights: use measured regions and trim
  // transparent margins rather than cutting the supplied mockup into sprites.
  atlas.street.frames.forEach((name, index) => {
    const col = index % 4, row = Math.floor(index / 4);
    const x0 = Math.round(atlas.street.columns[col] * source.width);
    const x1 = Math.round(atlas.street.columns[col + 1] * source.width);
    const y0 = Math.round(atlas.street.rows[row] * source.height);
    const y1 = Math.round(atlas.street.rows[row + 1] * source.height);
    let left = x1, top = y1, right = x0, bottom = y0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (pixels[(y * source.width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    if (left > right) throw new Error(`Recurs buit: ${name}`);
    street.add(name, 0, left, top, right - left + 1, bottom - top + 1);
  });
}
