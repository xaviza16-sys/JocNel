import Phaser from 'phaser';
import { InputManager, type AudioManager } from './systems';
import { RaceController, type RoadKind } from './race-model';
import type { Level } from './model';

interface RaceHooks {
  begin: (level: Level) => void;
  complete: (level: Level, copy: string) => void;
  pause: () => void;
  audio: AudioManager;
  reducedMotion: boolean;
}
const HORIZON = 75, ROAD_BOTTOM = 258, VIEW_DISTANCE = 150;

export class MotoRace extends Phaser.Scene {
  level!: Level;
  controls!: InputManager;
  race!: RaceController;
  finished = false;
  private graphics!: Phaser.GameObjects.Graphics;
  private effects!: Phaser.GameObjects.Graphics;
  private rider!: Phaser.GameObjects.Image;
  private sprites: Phaser.GameObjects.Image[] = [];
  private usedSprites = 0;
  private clock = 0;
  private collectUntil = 0;
  private hud!: Phaser.GameObjects.Text;
  private effect!: Phaser.GameObjects.Text;
  private toast!: Phaser.GameObjects.Text;
  private meter!: Phaser.GameObjects.Graphics;
  constructor(private hooks: RaceHooks) { super('MotoRace'); }
  init(data: { level: Level }) {
    this.level = data.level; this.finished = false; this.clock = 0; this.collectUntil = 0;
    this.sprites = []; this.usedSprites = 0; this.race = new RaceController(data.level.race!);
  }
  create() {
    this.hooks.begin(this.level);
    this.graphics = this.add.graphics();
    this.effects = this.add.graphics().setDepth(11);
    this.rider = this.add.image(240, 261, 'race-rider', 'ride-0').setOrigin(.5, 1).setDisplaySize(85, 85).setDepth(10);
    this.meter = this.add.graphics().setDepth(12);
    const style = { fontFamily: 'monospace', fontSize: '9px', color: '#fff3d2', backgroundColor: '#102a3d', padding: { x: 6, y: 6 } };
    this.hud = this.add.text(7, 7, '', style).setDepth(12);
    this.effect = this.add.text(473, 7, '', style).setOrigin(1, 0).setDepth(12);
    this.toast = this.add.text(240, 44, '', { ...style, color: '#203d45', backgroundColor: '#fff1bc' }).setOrigin(.5, 0).setDepth(12);
    this.controls = new InputManager(this);
    const escape = this.input.keyboard!.addKey('ESC'); escape.on('down', this.hooks.pause);
    this.events.once('shutdown', () => escape.off('down', this.hooks.pause));
    this.events.on('resume', () => this.controls.reset()); this.paint();
  }
  update(_time: number, delta: number) {
    if (this.finished) return;
    this.clock += Math.min(delta, 100);
    const pickups = this.race.step(delta / 1000, this.controls.axis());
    if (pickups.length) this.collectUntil = this.clock + 320;
    pickups.forEach(kind => this.hooks.audio.chime(kind === 'star' || kind === 'coin' ? 660 : 880));
    this.paint(); if (this.race.finished) this.complete();
  }
  complete() {
    this.finished = true; this.scene.pause();
    this.hooks.complete(this.level, `Has arribat a l’escola bressol! ${this.race.stars} estrelles, ${this.race.coins} monedes i ${this.race.memories}/3 fotos de record. Has esquivat ${this.race.avoided} obstacles. Ara anem a l’escola!`);
  }
  private project(distance: number, lane: number) {
    const t = Phaser.Math.Clamp(1 - distance / VIEW_DISTANCE, 0, 1), depth = t * t;
    return { x: 240 + lane * (17 + depth * 195), y: HORIZON + depth * (ROAD_BOTTOM - HORIZON), scale: .12 + depth * 1.38 };
  }
  private sprite(frame: string, x: number, y: number, width: number, flip = false) {
    const sprite = this.sprites[this.usedSprites] ?? this.add.image(0, 0, 'race-street', frame);
    this.sprites[this.usedSprites++] = sprite;
    sprite.setTexture('race-street', frame).setVisible(true).setOrigin(.5, 1).setPosition(Math.round(x), Math.round(y)).setFlipX(flip).setDepth(2 + y / 300);
    sprite.setDisplaySize(Math.round(width), Math.round(width * sprite.frame.height / sprite.frame.width));
  }
  private paint() {
    const g = this.graphics, race = this.race; g.clear(); this.effects.clear(); this.usedSprites = 0;
    const rect = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
    rect(0, 0, 480, 270, 0x8ac6df);
    for (const [x, y] of [[30, 38], [133, 24], [320, 38], [415, 26]]) {
      rect(x, y, 48, 7, 0xfff4db); rect(x + 8, y - 6, 30, 10, 0xfff4db); rect(x + 16, y - 9, 13, 5, 0xfff4db);
    }
    // A distant neighborhood rather than the old open-country horizon.
    for (let i = 0; i < 20; i++) {
      const x = i * 27 - 18, h = 12 + i * 13 % 25;
      rect(x, HORIZON - h, 25, h + 8, i % 2 ? 0xd3b998 : 0xe7cfa6);
      rect(x - 2, HORIZON - h - 3, 29, 4, 0xba8a72);
      rect(x + 5, HORIZON - h + 4, 4, 6, 0x819c8f); rect(x + 16, HORIZON - h + 4, 4, 6, 0x819c8f);
    }
    // Continuous paved street with tiled sidewalks and raised curbs.
    for (let y = HORIZON; y < 270; y += 2) {
      const d = (y - HORIZON) / (ROAD_BOTTOM - HORIZON), half = 17 + d * 195;
      rect(0, y, 480, 2, 0xa4ad82);
      rect(240 - half - 40 * d, y, half * 2 + 80 * d, 2, 0xc5bca1);
      rect(240 - half - 3 * d, y, half * 2 + 6 * d, 2, 0xe9dbb8);
      rect(240 - half, y, half * 2, 2, 0x747f87);
    }
    // World-space stone rows preserve the racing perspective as they approach.
    const base = Math.floor(race.distance / 5) * 5;
    for (let row = 0; row < 31; row++) {
      const z = base + row * 5 - race.distance;
      if (z + 5 <= 0 || z >= VIEW_DISTANCE) continue;
      const near = this.project(Math.max(0, z), 1), far = this.project(z + 5, 1);
      const nearHalf = near.x - 240, farHalf = far.x - 240;
      for (let col = 0; col < 8; col++) {
        const l = -1 + col / 4, r = l + .25;
        const color = [0x90999a, 0x8b9294, 0x9a9fa0, 0x7e898f][Math.abs((base / 5 + row) * 3 + col * 7) % 4];
        g.fillStyle(color).fillPoints([
          { x: 240 + l * nearHalf + 1, y: near.y }, { x: 240 + r * nearHalf - 1, y: near.y },
          { x: 240 + r * farHalf - 1, y: far.y + .6 }, { x: 240 + l * farHalf + 1, y: far.y + .6 },
        ], true);
      }
      for (const side of [-1, 1]) {
        const p = this.project(Math.max(0, z), side * 1.1);
        rect(p.x - 8 * p.scale, p.y, 16 * p.scale, 1, 0x9e9a85);
      }
    }
    // All roadside sprites use the same projection and ground baseline.
    const scenery: { z: number; lane: number; frame: string; width: number; flip?: boolean }[] = [];
    const add = (offset: number, lane: number, frame: string, width: number, flip = false) => {
      const z = ((offset - race.distance) % 180 + 180) % 180;
      if (z < VIEW_DISTANCE) scenery.push({ z, lane, frame, width, flip });
    };
    for (let i = 0; i < 7; i++) {
      const at = i * 27;
      add(at, -1.74, i % 2 ? 'house-cream' : 'house-brick', 102);
      add(at + 8, 1.75, i % 2 ? 'house-brick' : 'house-cream', 102);
      add(at + 4, -1.28, i % 2 ? 'tree-green' : 'tree-gold', 78);
      add(at + 15, 1.31, i % 2 ? 'tree-gold' : 'tree-green', 78);
      if (i % 2 === 0) {
        add(at + 12, 1.12, 'car-blue', 54, true);
        add(at + 21, -1.12, 'car-white', 54);
        add(at + 8, -1.46, 'hedge', 65);
      } else {
        add(at + 19, -1.09, 'lamp', 18);
        add(at + 2, 1.13, 'crossing', 21);
      }
    }
    scenery.sort((a, b) => b.z - a.z).forEach(item => {
      const p = this.project(item.z, item.lane);
      this.sprite(item.frame, p.x, p.y, item.width * p.scale, item.flip);
    });
    // Fallen leaves remain decoration; they never create invisible hazards.
    for (let i = 0; i < 60; i++) {
      const z = ((i * 11 - race.distance) % 160 + 160) % 160;
      if (z >= VIEW_DISTANCE) continue;
      const lane = (i % 2 ? -1 : 1) * (.78 + i * 17 % 30 / 100);
      const p = this.project(z, lane), size = Math.max(1, Math.round(p.scale * 2));
      rect(p.x, p.y, size * 2, size, [0xd88839, 0xf4b341, 0xc16c36][i % 3]);
      rect(p.x + size, p.y - size, size, size * 3, i % 2 ? 0xe99d36 : 0xc77a35);
    }
    const remaining = this.level.race!.length - race.distance;
    if (remaining < VIEW_DISTANCE) {
      const p = this.project(remaining, 0);
      this.sprite('house-cream', p.x, p.y, 110 * Math.min(p.scale, 1));
    }
    this.level.race!.events.forEach((event, index) => {
      if (race.resolved.has(index) || event.distance - race.distance >= VIEW_DISTANCE) return;
      const p = this.project(event.distance - race.distance, event.lane * .64);
      this.drawItem(event.kind, p.x, p.y, p.scale);
    });
    for (let i = this.usedSprites; i < this.sprites.length; i++) this.sprites[i].setVisible(false);
    this.drawRider(240 + race.steering * 212);
    this.hud.setText(`★ ${race.stars}  ◉ ${race.coins}  FOTO ${race.memories}/3`);
    const effects = [race.shield > 0 ? `ESCUT ${Math.ceil(race.shield)}s` : '', race.boost > 0 ? `TURBO ${Math.ceil(race.boost)}s` : '', race.magnet > 0 ? `IMANT ${Math.ceil(race.magnet)}s` : ''].filter(Boolean);
    this.effect.setText(effects.join(' · ') || `${Math.round(race.distance / this.level.race!.length * 100)}% CAP A L’ESCOLA BRESSOL`);
    this.toast.setVisible(race.distance < 45 || race.feedbackTime > 0);
    this.toast.setText(race.feedbackTime > 0 ? race.feedback : '← → Condueix · Esquiva obstacles i recull records');
    this.meter.clear().fillStyle(0x102a3d).fillRect(7, 33, 125, 3).fillStyle(0xf3c969).fillRect(7, 33, 125 * race.distance / this.level.race!.length, 3);
    document.getElementById('status')!.textContent = `★ ${race.stars} · ${race.powerups} potenciadors · ${race.memories}/3 fotos · ${race.hits} ensopegades · ${Math.round(race.distance / this.level.race!.length * 100)}% del camí`;
  }
  private drawItem(kind: RoadKind, x: number, y: number, s: number) {
    if (['cone', 'puddle', 'blocks', 'star', 'coin', 'memory'].includes(kind)) {
      const widths: Record<string, number> = { cone: 24, puddle: 34, blocks: 26, star: 21, coin: 18, memory: 23 };
      this.sprite(kind, x, y, widths[kind] * s); return;
    }
    // Power-up icons retain their established colors and recognizable symbols.
    const g = this.graphics;
    const rect = (dx: number, dy: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(Math.round(x + dx * s), Math.round(y + dy * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
    const color = kind === 'shield' ? 0x83cde0 : kind === 'magnet' ? 0xa6d58a : 0xffd46a;
    rect(-11, -26, 22, 24, 0x233f49); rect(-9, -24, 18, 20, color);
    if (kind === 'shield') { rect(-5, -20, 10, 10, 0xf2f3d8); rect(-3, -10, 6, 3, 0xf2f3d8); }
    if (kind === 'magnet') { rect(-5, -20, 3, 12, 0x34594c); rect(2, -20, 3, 12, 0x34594c); rect(-3, -10, 6, 3, 0x34594c); }
    if (kind === 'boost') { rect(0, -22, 5, 8, 0xa66b38); rect(-4, -16, 8, 5, 0xa66b38); rect(-4, -12, 4, 6, 0xa66b38); }
  }
  private drawRider(x: number) {
    const race = this.race, g = this.effects;
    const axis = this.controls.axis();
    let frame = this.hooks.reducedMotion ? 'ride-0' : `ride-${Math.floor(this.clock / 140) % 4}`;
    if (axis) frame = axis < 0 ? 'left' : 'right';
    if (this.collectUntil > this.clock) frame = 'collect';
    if (race.slow > 0) frame = 'bump';
    this.rider.setFrame(frame).setPosition(Math.round(x), 261);
    if (race.shield > 0) g.lineStyle(1, 0xb6e3e0, .9).strokeEllipse(x, 222, 64, 77);
    if (race.boost > 0) g.fillStyle(0xffd46a).fillRect(x - 8, 256, 16, 6).fillStyle(0xdf883c).fillRect(x - 4, 262, 8, 4);
    if (!this.hooks.reducedMotion) for (let i = 0; i < 4; i++) {
      const phase = (this.clock / 90 + i * 2) % 7;
      g.fillStyle(race.boost > 0 ? 0xffe2aa : 0xe8e2cb, 1 - phase / 8).fillRect(Math.round(x + (i % 2 ? 1 : -1) * (18 + phase)), Math.round(247 + phase * 2), 2 + i % 2, 2);
    }
  }
}
