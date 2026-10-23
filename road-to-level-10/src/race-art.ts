import Phaser from 'phaser';
import riderUrl from '../assets/race/rider-rear-v1.webp';
import streetUrl from '../assets/race/autumn-street-v2.webp';
import atlas from '../assets/race/atlas.json';

export function loadRaceArt(scene: Phaser.Scene) {
  scene.load.image('race-rider', riderUrl);
  scene.load.image('race-street', streetUrl);
}

export function createRaceFrames(scene: Phaser.Scene) {
  const rider = scene.textures.get('race-rider');
  const image = rider.getSourceImage() as HTMLImageElement;
  atlas.rider.frames.forEach((name, index) => {
    const col = index % 4, row = Math.floor(index / 4);
    const x = Math.round(col * image.width / 4), y = Math.round(row * image.height / 2);
    rider.add(name, 0, x, y, Math.round((col + 1) * image.width / 4) - x, Math.round((row + 1) * image.height / 2) - y);
  });
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
