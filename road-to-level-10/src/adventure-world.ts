import Phaser from 'phaser';
import type { Level } from './model';
import { prop } from './adventure-art';
import { outdoorBackdrop } from './outdoor-art';
import { gardenGround, gardenPlatform } from './garden-terrain';

export function adventureWorld(scene: Phaser.Scene, level: Level) {
  const { mode, width } = level;
  if (mode === 'hospital') {
    // One world-space corridor: decoration and floor never drift apart.
    for (let x = 0; x < width; x += 480) {
      // Adjacent sections share the same edge pixels, including floor lines.
      scene.add.image(x, 0, 'hospital-corridor').setOrigin(0).setDisplaySize(480, 270).setFlipX((x / 480) % 2 === 1).setDepth(-4);
    }
    for (const x of [400, 950, 1280]) {
      const trolley = scene.add.image(x, 230, 'hospital', 'trolley').setOrigin(.5, 1).setDepth(-1);
      trolley.setDisplaySize(42, 42 * trolley.frame.height / trolley.frame.width);
    }
    scene.add.text(level.finish, 113, 'MATERNITAT ♡', { fontFamily: 'monospace', fontSize: '9px', color: '#294c43', backgroundColor: '#fff0cf', padding: { x: 5, y: 4 } }).setOrigin(.5).setDepth(2);
    const floor = scene.add.zone(width / 2, 250, width, 40);
    scene.physics.add.existing(floor, true); return floor;
  }
  const g = scene.add.graphics().setDepth(-3);
  const rect = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(x, y, w, h);
  const snowy = mode === 'snow', inside = mode === 'baby', forest = mode === 'nature';
  if (mode !== 'toddler' && !forest) rect(0, 0, width, 270, inside ? 0xfaf9f5 : snowy ? 0xc6e8f0 : 0xb5dcdd);
  if (inside) {
    rect(0, 222, width, 8, 0xe2d6c4);
    for (const x of [85, 710, 1450]) {
      rect(x, 46, 90, 95, 0xe4dfd4); rect(x + 4, 50, 82, 87, 0xcce6e7);
      rect(x + 43, 50, 3, 87, 0xffffff); rect(x + 4, 92, 82, 3, 0xffffff);
      rect(x - 5, 139, 100, 5, 0xc6ad88);
    }
    for (const [frame, x, w] of [['shelf', 335, 125], ['sofa', 720, 145]] as const) {
      const furniture = scene.add.image(x, 230, 'home', frame).setOrigin(.5, 1).setDepth(-2);
      furniture.setDisplaySize(w, w * furniture.frame.height / furniture.frame.width);
    }
    // The raised bedroom shares the same coordinates as the final landing.
    rect(1538, 34, 5, 112, 0xe3ded5); rect(1538, 34, width - 1538, 5, 0xd6c4a9);
    rect(1538, 146, width - 1538, 84, 0xf0ede7); rect(1538, 146, width - 1538, 5, 0xc7aa81);
    scene.add.text(1490, 93, 'HABITACIÓ →', { fontFamily: 'monospace', fontSize: '7px', color: '#566558' }).setOrigin(.5).setDepth(1);
    // One continuous oak handrail above the three compact, connected treads.
    g.lineStyle(3, 0xc1a078).lineBetween(1313, 131, 1394, 107).lineBetween(1394, 107, 1528, 107);
    for (const x of [1316, 1344, 1372]) {
      const top = 162 - Math.floor((x - 1316) / 28) * 8;
      rect(x, top - 32, 2, 32, 0xb8a994);
    }
    for (const x of [1402, 1452, 1502]) rect(x, 108, 2, 38, 0xb8a994);
  } else {
    if (mode === 'toddler' || forest) outdoorBackdrop(scene, forest ? 'forest-bg' : 'garden-bg', width);
    else {
    const distant = scene.add.graphics().setScrollFactor(.18, 1).setDepth(-3);
    distant.fillStyle(snowy ? 0x92b8c5 : forest ? 0x799f85 : 0x97bda4);
    for (let x = -100; x < width; x += 190) distant.fillTriangle(x, 220, x + 140, snowy ? 38 : 92, x + 300, 220);
    if (snowy) {
      distant.fillStyle(0xf0f8ed);
      for (let x = -100; x < width; x += 190) distant.fillTriangle(x + 90, 103, x + 140, 38, x + 193, 103);
    }
    const background = scene.add.container(0, 0).setDepth(-2).setScrollFactor(forest ? 1 : .55, 1).setAlpha(forest ? .4 : 1);
    for (let x = 80; x < width; x += snowy || forest ? 125 : 230) {
      const frame = snowy ? 'fir' : mode === 'skate' ? 'bench' : 'school';
      const item = prop(scene, frame, x, 230, snowy || forest ? 104 : 125, -2);
      background.add(item);
    }
    if (snowy) prop(scene, 'cabin', level.finish + 25, 230, 130);
    }
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
  if (mode === 'toddler') {
    gardenGround(scene, width);
    const floor = scene.add.zone(width / 2, 250, width, 40); scene.physics.add.existing(floor, true); return floor;
  }
  rect(0, 230, width, 40, inside ? 0xdac5a4 : snowy ? 0x879eaa : mode === 'skate' ? 0x717f89 : 0x8e7657);
  rect(0, 230, width, snowy ? 11 : 6, inside ? 0xc4aa85 : snowy ? 0xf4fcf4 : mode === 'skate' ? 0xc3c8bd : 0x7b9e50);
  for (let x = 0; x < width; x += 32) {
    rect(x, 242, 1, 28, inside ? 0xaf805e : 0x718275);
    if (!inside) rect(x + 10, 254, 5, 3, snowy ? 0xc5d8dc : 0xb6a07c);
  }
  if (level.water) {
    const { left, right } = level.water;
    rect(left, 222, right - left, 48, 0x398d9c);
    for (let x = left; x < right; x += 23) { rect(x, 226, Math.min(13, right - x), 2, 0xa4e3df); rect(x + 3, 245, Math.max(0, Math.min(9, right - x - 3)), 2, 0x65b9c3); }
    const banks = scene.physics.add.staticGroup();
    for (const [a, b] of [[0, left], [right, width]]) {
      const bank = scene.add.zone((a + b) / 2, 250, b - a, 40); scene.physics.add.existing(bank, true); banks.add(bank);
    }
    return banks;
  }
  const floor = scene.add.zone(width / 2, 250, width, 40); scene.physics.add.existing(floor, true); return floor;
}

export function platformArt(scene: Phaser.Scene, level: Level, p: Level['platforms'][number]) {
  if (level.mode === 'toddler') { gardenPlatform(scene, p); return; }
  if (level.mode === 'baby') {
    if (p.x >= 1538) return; // The bed sprite supplies its visible mattress.
    const g = scene.add.graphics().setDepth(0);
    const left = p.x - p.width / 2;
    if (p.x >= 1310) {
      g.fillStyle(0xeeeae2).fillRect(left, p.y, p.width, p.height);
      g.fillStyle(0xb59975).fillRect(left - 1, p.y, p.width + 2, 4);
      g.fillStyle(0xe1c6a0).fillRect(left, p.y, p.width, 2);
      g.fillStyle(0xd4c9b9).fillRect(left, p.y + 4, 2, p.height - 4);
      return;
    }
    g.fillStyle(0xf2f0e9).fillRect(left, p.y, p.width, p.height);
    g.fillStyle(0xd1b78f).fillRect(left, p.y, p.width, 4);
    g.lineStyle(1, 0xd6d0c5).strokeRect(left, p.y + 4, p.width, p.height - 4);
    if (p.x < 800) {
      g.lineStyle(1, 0xd6d0c5).lineBetween(left + p.width / 2, p.y + 8, left + p.width / 2, p.y + p.height - 3);
      g.fillStyle(0x9e988d).fillRect(left + p.width / 2 - 9, p.y + 12, 4, 2).fillRect(left + p.width / 2 + 5, p.y + 12, 4, 2);
    }
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
  const tree = scene.add.image(x, ground, 'forest-trunk', 'trunk').setOrigin(.5, 1).setDepth(-1);
  const height = ground - canopyTop;
  tree.setDisplaySize(height * tree.frame.width / tree.frame.height, height);
  // Preserve the illustrated trunk and proportions; the tree shares the
  // world-space anchor used by climbing, ropes and platform supports.
}
