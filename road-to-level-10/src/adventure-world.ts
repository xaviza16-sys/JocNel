import Phaser from 'phaser';
import type { Level } from './model';
import { prop } from './adventure-art';

export function adventureWorld(scene: Phaser.Scene, level: Level) {
  const { mode, width } = level;
  if (mode === 'hospital') {
    // One world-space corridor: decoration and floor never drift apart.
    for (let x = 0; x < width; x += 480) {
      scene.add.image(x, 0, 'hospital-corridor').setOrigin(0).setDisplaySize(480, 270).setDepth(-4);
    }
    for (const x of [400, 950, 1280]) {
      const trolley = scene.add.image(x, 230, 'hospital', 'trolley').setOrigin(.5, 1).setDepth(-1);
      trolley.setDisplaySize(42, 42 * trolley.frame.height / trolley.frame.width);
    }
    scene.add.text(level.finish, 113, 'MATERNITAT ♡', { fontFamily: 'monospace', fontSize: '9px', color: '#294c43', backgroundColor: '#fff0cf', padding: { x: 5, y: 4 } }).setOrigin(.5).setDepth(2);
    const floor = scene.add.zone(width / 2, 250, width, 40);
    scene.physics.add.existing(floor, true); return floor;
  }
  const g = scene.add.graphics().setDepth(-4);
  const rect = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(x, y, w, h);
  const snowy = mode === 'snow', inside = mode === 'baby', forest = mode === 'nature';
  rect(0, 0, width, 270, inside ? 0xf0dfbc : snowy ? 0xc6e8f0 : forest ? 0xb3d2b2 : 0xb5dcdd);
  if (inside) {
    for (let x = 0; x < width; x += 24) rect(x, 0, 2, 225, 0xe4cfab);
    rect(0, 185, width, 43, 0xb5c6a9);
    for (let x = 100; x < width; x += 340) {
      rect(x - 3, 35, 94, 103, 0xbe9672); rect(x + 3, 41, 82, 90, 0xb2d9d8);
      rect(x + 41, 41, 4, 90, 0xffeed1); rect(x + 3, 82, 82, 4, 0xffeed1);
      prop(scene, 'bookshelf', x + 180, 230, 90, -2);
    }
  } else {
    const distant = scene.add.graphics().setScrollFactor(.18, 1).setDepth(-3);
    distant.fillStyle(snowy ? 0x92b8c5 : forest ? 0x799f85 : 0x97bda4);
    for (let x = -100; x < width; x += 190) distant.fillTriangle(x, 220, x + 140, snowy ? 38 : 92, x + 300, 220);
    if (snowy) {
      distant.fillStyle(0xf0f8ed);
      for (let x = -100; x < width; x += 190) distant.fillTriangle(x + 90, 103, x + 140, 38, x + 193, 103);
    }
    const background = scene.add.container(0, 0).setDepth(-2).setScrollFactor(forest ? 1 : .55, 1).setAlpha(forest ? .4 : 1);
    for (let x = 80; x < width; x += snowy || forest ? 125 : 230) {
      const frame = snowy ? 'fir' : forest || mode === 'toddler' ? 'tree' : mode === 'skate' ? 'bench' : 'school';
      const item = prop(scene, frame, x, 230, snowy || forest ? 104 : 125, -2);
      background.add(item);
    }
    if (snowy) prop(scene, 'cabin', level.finish + 25, 230, 130);
    if (forest) {
      // The lookout uses the final physical deck, rather than an unrelated
      // tower sprite whose illustrated floor sits at a different position.
      const deck = level.platforms.find(p => Math.abs(p.y - level.goalY) < 1 && Math.abs(level.finish - p.x) < p.width / 2)!;
      const sign = scene.add.graphics().setDepth(2);
      sign.fillStyle(0x715334).fillRect(level.finish - 3, deck.y - 38, 6, 38);
      sign.fillStyle(0xf4d99b).fillRect(level.finish - 25, deck.y - 40, 50, 15);
      scene.add.text(level.finish, deck.y - 37, 'ARRIBADA', { fontFamily: 'monospace', fontSize: '7px', color: '#294c43' }).setOrigin(.5, 0).setDepth(3);
      scene.add.text(level.finish, 215, 'ARRIBADA →', { fontFamily: 'monospace', fontSize: '7px', color: '#294c43', backgroundColor: '#fff0cf', padding: { x: 3, y: 2 } }).setOrigin(.5).setDepth(3);
    }
    if (mode === 'skate') prop(scene, 'party', level.finish + 10, 230, 95, 1);
  }
  rect(0, 230, width, 40, inside ? 0xc79d74 : snowy ? 0x879eaa : mode === 'skate' ? 0x717f89 : 0x8e7657);
  rect(0, 230, width, snowy ? 11 : 6, inside ? 0xb68560 : snowy ? 0xf4fcf4 : mode === 'skate' ? 0xc3c8bd : 0x7b9e50);
  for (let x = 0; x < width; x += 32) {
    rect(x, 242, 1, 28, inside ? 0xaf805e : 0x718275);
    if (!inside) rect(x + 10, 254, 5, 3, snowy ? 0xc5d8dc : 0xb6a07c);
  }
  const floor = scene.add.zone(width / 2, 250, width, 40); scene.physics.add.existing(floor, true); return floor;
}

export function platformArt(scene: Phaser.Scene, level: Level, p: Level['platforms'][number]) {
  if (level.mode === 'baby') {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x7da9bb).fillRoundedRect(p.x - p.width / 2, p.y, p.width, p.height, 4);
    g.lineStyle(2, 0xf0cf68).strokeRoundedRect(p.x - p.width / 2 + 2, p.y + 2, p.width - 4, p.height - 4, 3);
    prop(scene, 'cushions', p.x, p.y + p.height, p.width, 1).setDisplaySize(p.width, p.height);
  } else if (level.mode === 'nature') {
    const left = p.x - p.width / 2;
    const g = scene.add.graphics().setDepth(2);
    // Every visible deck starts exactly at the top of its collision surface.
    g.fillStyle(0x66482e).fillRect(left, p.y, p.width, p.height);
    g.fillStyle(0xc39757).fillRect(left, p.y, p.width, 4);
    for (let x = left + 12; x < left + p.width; x += 18) g.fillStyle(0x94683c).fillRect(x, p.y + 4, 2, p.height - 4);
    g.lineStyle(3, 0x795631);
    for (const x of [left + 8, left + p.width - 8]) g.lineBetween(x, p.y + p.height, x + (x < p.x ? 24 : -24), 230);
    if (p.x > level.finish - p.width) {
      for (let x = left + 8; x < left + p.width; x += 30) g.fillStyle(0x94683c).fillRect(x, p.y - 20, 3, 20);
      g.fillStyle(0xc39757).fillRect(left, p.y - 20, p.width, 3);
    }
  } else {
    const frame = level.mode === 'snow' ? 'snow-tile' : level.mode === 'skate' ? 'city-tile' : 'grass-tile';
    const image = prop(scene, frame, p.x, p.y + p.height, p.width, 0); image.setDisplaySize(p.width, p.height);
    if (level.mode === 'skate') prop(scene, 'ramp', p.x, 230, p.width, 1).setDisplaySize(p.width, 230 - p.y);
  }
}

export function forestTree(scene: Phaser.Scene, x: number, canopyTop: number, ground: number) {
  const tree = prop(scene, 'tree', x, ground, 130, -1);
  const height = ground - canopyTop;
  tree.setDisplaySize(height * tree.frame.width / tree.frame.height, height);
  // Preserve the illustrated trunk and proportions; the tree shares the
  // world-space anchor used by climbing, ropes and platform supports.
}
