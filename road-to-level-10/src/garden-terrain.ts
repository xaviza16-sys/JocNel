import Phaser from 'phaser';
import type { Level } from './model';
import terrainUrl from '../assets/adventure/garden-terrain-v1.webp';

export function loadGardenTerrain(scene: Phaser.Scene) { scene.load.image('garden-terrain', terrainUrl); }
export function createGardenTerrain(scene: Phaser.Scene) {
  const texture = scene.textures.get('garden-terrain');
  texture.add('stone', 0, 128, 0, 128, 128);
  texture.add('grass', 0, 0, 0, 128, 26);
  texture.add('oak', 0, 0, 128, 128, 128);
  texture.add('soil', 0, 128, 160, 128, 96);
  texture.add('lawn', 0, 128, 128, 128, 26);
}
function tile(scene: Phaser.Scene, frame: string, x: number, y: number, width: number, height: number, depth = 0) {
  // Fixed texture scale: wider ledges repeat the material instead of stretching it.
  return scene.add.tileSprite(x, y, width, height, 'garden-terrain', frame).setOrigin(0).setTileScale(.5).setDepth(depth);
}
export function gardenGround(scene: Phaser.Scene, width: number) {
  tile(scene, 'soil', 0, 230, width, 40, -2);
  tile(scene, 'lawn', 0, 218, width, 13, -1);
}
export function gardenPlatform(scene: Phaser.Scene, p: Level['platforms'][number]) {
  const left = p.x - p.width / 2;
  const details = scene.add.graphics().setDepth(-1);
  details.fillStyle(0x334932, .17).fillEllipse(p.x, 230, p.width + 12, 5);
  if (p.height <= 12) {
    // Raised, open garden benches replace the floating turf slabs.
    for (const x of [left + 9, left + p.width - 15]) {
      details.fillStyle(0x8c7557).fillRect(x, p.y + p.height, 6, 230 - p.y - p.height);
      details.fillStyle(0xc6ae85).fillRect(x, p.y + p.height, 2, 230 - p.y - p.height);
    }
    details.fillStyle(0xa18a67).fillRect(left + 7, p.y + p.height + 6, p.width - 14, 4);
    tile(scene, 'oak', left, p.y, p.width, p.height);
    const edge = scene.add.graphics().setDepth(1);
    edge.fillStyle(0xf0d8aa).fillRect(left, p.y, p.width, 1);
    edge.fillStyle(0x866b4f).fillRect(left, p.y + p.height - 2, p.width, 2);
  } else {
    tile(scene, 'stone', left, p.y + 5, p.width, p.height - 5);
    tile(scene, 'grass', left, p.y, p.width, Math.min(13, p.height), 1);
    const edge = scene.add.graphics().setDepth(1);
    edge.fillStyle(0x74846b, .25).fillRect(left, p.y + 13, 2, p.height - 13);
    edge.fillStyle(0xf0e2c4, .35).fillRect(left + p.width - 2, p.y + 13, 2, p.height - 13);
  }
}
