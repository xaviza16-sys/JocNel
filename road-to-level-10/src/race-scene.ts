import Phaser from 'phaser';
import { InputManager, type AudioManager } from './systems';
import { RaceController, FALL_SECONDS, SPIN_SECONDS, type RoadKind } from './race-model';
import type { Level } from './model';

interface RaceHooks {
  begin: (level: Level) => void;
  complete: (level: Level, copy: string) => void;
  pause: () => void;
  audio: AudioManager;
  reducedMotion: boolean;
}
const HORIZON = 65, ROAD_BOTTOM = 258, VIEW_DISTANCE = 150;

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
  private hud!: Phaser.GameObjects.Text;
  private effect!: Phaser.GameObjects.Text;
  private toast!: Phaser.GameObjects.Text;
  private meter!: Phaser.GameObjects.Graphics;
  constructor(private hooks: RaceHooks) { super('MotoRace'); }
  init(data: { level: Level }) {
    this.level = data.level; this.finished = false; this.clock = 0;
    this.sprites = []; this.usedSprites = 0; this.race = new RaceController(data.level.race!);
  }
  create() {
    this.hooks.begin(this.level);
    this.graphics = this.add.graphics(); this.effects = this.add.graphics().setDepth(11);
    this.rider = this.add.image(240, 261, 'race-rider', 'ride-0').setOrigin(.5, 1).setDepth(10);
    this.meter = this.add.graphics().setDepth(12);
    const style = { fontFamily: 'monospace', fontSize: '9px', color: '#fff3d2', backgroundColor: '#263a39', padding: { x: 6, y: 6 } };
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
    const contacts = this.race.step(delta / 1000, this.controls.axis(), this.controls.jumpPressed());
    contacts.forEach(kind => kind === 'boost' ? this.hooks.audio.chime(880) : this.hooks.audio.sfx('hit'));
    this.paint();
    if (this.race.finished) this.complete();
  }
  complete() {
    this.finished = true; this.scene.pause();
    this.hooks.complete(this.level, `Has arribat a l’escola bressol, Nel! Has esquivat ${this.race.avoided} obstacles i has passat per ${this.race.powerups} fletxes turbo. Ara anem a l’escola!`);
  }
  private project(distance: number, lane: number) {
    const t = Phaser.Math.Clamp(1 - distance / VIEW_DISTANCE, 0, 1), depth = t * t;
    return { x: 240 + lane * (17 + depth * 195), y: HORIZON + depth * (ROAD_BOTTOM - HORIZON), scale: .12 + depth * 1.38 };
  }
  private sprite(frame: string, x: number, y: number, width: number, flip = false) {
    const sprite = this.sprites[this.usedSprites] ?? this.add.image(0, 0, 'promenade', frame);
    this.sprites[this.usedSprites++] = sprite;
    sprite.setTexture('promenade', frame).setVisible(true).setOrigin(.5, 1).setPosition(Math.round(x), Math.round(y)).setFlipX(flip).setDepth(2 + y / 300);
    sprite.setDisplaySize(Math.max(1, Math.round(width)), Math.max(1, Math.round(width * sprite.frame.realHeight / sprite.frame.realWidth)));
  }
  private paint() {
    const g = this.graphics, race = this.race; g.clear(); this.effects.clear(); this.usedSprites = 0;
    const rect = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
    rect(0, 0, 480, 270, 0xd9ddd1);
    for (let y = 0; y < HORIZON; y += 5) rect(0, y, 480, 5, [0xc5cdbf, 0xccd3c5, 0xd5dbce, 0xe0e4d8][Math.min(3, Math.floor(y / 17))]);
    for (let y = HORIZON; y < 270; y += 2) {
      const d = (y - HORIZON) / (ROAD_BOTTOM - HORIZON), half = 17 + d * 195;
      rect(0, y, 480, 2, 0x8c9786);
      rect(240 - half - 44 * d, y, half * 2 + 88 * d, 2, 0x9da69b);
      rect(240 - half, y, half * 2, 2, 0x929c97);
    }
    // Gray rectangular pavers share the projection used by all road hazards.
    const base = Math.floor(race.distance / 5) * 5;
    for (let row = 0; row < 31; row++) {
      const z = base + row * 5 - race.distance;
      if (z + 5 <= 0 || z >= VIEW_DISTANCE) continue;
      const near = this.project(Math.max(0, z), 1), far = this.project(z + 5, 1);
      for (let col = 0; col < 8; col++) {
        const l = -1 + col / 4, r = l + .25;
        const color = [0xb7b8af, 0xaeb3b1, 0xbfc1b8, 0xa9aea9][Math.abs((base / 5 + row) * 3 + col * 7) % 4];
        g.fillStyle(color).fillPoints([
          { x: 240 + l * (near.x - 240) + 1, y: near.y }, { x: 240 + r * (near.x - 240) - 1, y: near.y },
          { x: 240 + r * (far.x - 240) - 1, y: far.y + .6 }, { x: 240 + l * (far.x - 240) + 1, y: far.y + .6 },
        ], true);
      }
    }
    const scenery: { z: number; lane: number; frame: string; width: number; flip: boolean }[] = [];
    const add = (offset: number, lane: number, frame: string, width: number, flip = false) => {
      const z = ((offset - race.distance) % 180 + 180) % 180;
      if (z < VIEW_DISTANCE) scenery.push({ z, lane, frame, width, flip });
    };
    for (let i = 0; i < 7; i++) {
      const at = i * 27;
      add(at, -1.68, i % 3 ? 'hedge-wall' : 'stone-wall', 110, true);
      add(at + 8, 1.68, i % 3 ? 'stone-wall' : 'white-gate', 110);
      for (const side of [-1, 1]) {
        add(at + 4, side * 1.19, 'grate', 57);
        add(at + 4, side * 1.21, 'plane', 110, side > 0);
      }
    }
    scenery.sort((a, b) => b.z - a.z).forEach(item => {
      const p = this.project(item.z, item.lane); this.sprite(item.frame, p.x, p.y, item.width * p.scale, item.flip);
    });
    // Small decorative leaves stay at the edges; hazard piles occupy lanes.
    for (let i = 0; i < 36; i++) {
      const z = ((i * 11 - race.distance) % 160 + 160) % 160;
      if (z >= VIEW_DISTANCE) continue;
      const p = this.project(z, (i % 2 ? -1 : 1) * (1.02 + i % 3 * .05));
      const size = Math.max(1, Math.round(p.scale * 2));
      rect(p.x, p.y, size * 2, size, i % 2 ? 0xc9a36b : 0x9b7f53);
    }
    const remaining = this.level.race!.length - race.distance;
    if (remaining < VIEW_DISTANCE) {
      const p = this.project(remaining, 0); this.sprite('white-gate', p.x, p.y, 110 * Math.min(p.scale, 1));
    }
    this.level.race!.events.forEach((event, index) => {
      if (race.resolved.has(index) || event.distance - race.distance >= VIEW_DISTANCE) return;
      const p = this.project(event.distance - race.distance, event.lane * .64);
      this.drawItem(event.kind, p.x, p.y, p.scale);
    });
    for (let i = this.usedSprites; i < this.sprites.length; i++) this.sprites[i].setVisible(false);
    this.drawRider(240 + race.steering * 212);
    const pct = Math.round(race.distance / this.level.race!.length * 100);
    this.hud.setText(`TURBOS ${race.powerups} · CAIGUDES ${race.hits}`);
    this.effect.setText(race.spin > 0 ? 'PATINADA! ↻' : race.needsGetUp ? 'AIXECA’T ↑' : race.fall > 0 ? 'TORNANT A PUJAR' : race.slow > 0 ? 'FULLES · A POC A POC' : race.boost > 0 ? `TURBO ${race.boost.toFixed(1)}s` : `${pct}% CAP A L’ESCOLA BRESSOL`);
    this.toast.setVisible(race.distance < 45 || race.feedbackTime > 0 || race.fall > 0);
    this.toast.setText(race.needsGetUp ? 'Prem ESPAI o AIXECAR-SE per tornar a la moto' : race.feedbackTime > 0 ? race.feedback : '← → Condueix · Les fletxes del terra donen turbo');
    this.meter.clear().fillStyle(0x263a39).fillRect(7, 33, 125, 3).fillStyle(0xf3c969).fillRect(7, 33, 125 * race.distance / this.level.race!.length, 3);
    const action = document.querySelector<HTMLButtonElement>('[data-action="jump"]')!;
    action.hidden = race.fall === 0; action.textContent = 'AIXECAR-SE ↑'; action.setAttribute('aria-label', 'Aixecar-se');
    document.getElementById('status')!.textContent = `${race.powerups} potenciadors · ${race.hits} caigudes · ${race.spins} patinades · ${race.avoided} obstacles esquivats · ${pct}% del camí${race.fall > 0 ? ' · CAIGUT' : ''}${race.slow > 0 ? ' · FULLES' : ''}${race.spin > 0 ? ' · PATINANT' : ''}`;
  }
  private drawItem(kind: RoadKind, x: number, y: number, s: number) {
    const frame = kind === 'family' ? `family-${this.hooks.reducedMotion ? 0 : Math.floor(this.clock / 150) % 8}` : kind;
    this.sprite(frame, x, y, ({ family: 43, leaves: 43, poop: 22, boost: 39 })[kind] * s);
  }
  private drawRider(x: number) {
    const race = this.race, g = this.effects, axis = this.controls.axis();
    let frame = this.hooks.reducedMotion ? 'ride-0' : `ride-${Math.floor(this.clock / 100) % 8}`;
    if (axis) frame = axis < 0 ? 'left' : 'right';
    if (race.spin > 0) frame = 'upright';
    if (race.fall > 0) {
      const elapsed = FALL_SECONDS - race.fall;
      frame = elapsed < .3 ? 'fall-0' : elapsed < .65 ? 'fall-1' : elapsed < 1.2 ? 'fallen' : elapsed < 1.85 ? 'rise-0' : elapsed < 2.5 ? 'rise-1' : 'upright';
      if (race.needsGetUp || this.hooks.reducedMotion) frame = 'fallen';
    }
    const progress = race.spin > 0 ? 1 - race.spin / SPIN_SECONDS : 0;
    const rotation = 1 - (1 - progress) ** 2;
    if (race.spin > 0) this.rider.setTexture('race-spin', `spin-${this.hooks.reducedMotion ? 0 : Math.floor(rotation * 16) % 8}`);
    else this.rider.setTexture('race-rider', frame);
    this.rider.setPosition(Math.round(x), 261).setAngle(0).setFlipX(false);
    const riderHeight = 88 * .6;
    this.rider.setDisplaySize(riderHeight * this.rider.frame.realWidth / this.rider.frame.realHeight, riderHeight);
    if (race.spin > 0) {
      if (!this.hooks.reducedMotion) {
        // Eight actual views show two complete turns around the vertical axis.
        // The small skid offset never changes the physical road lane.
        const angle = rotation * Math.PI * 4;
        this.rider.setX(x + Math.sin(angle) * 9).setY(261 - Math.sin(progress * Math.PI) * 3).setAngle(Math.sin(angle) * 5);
        g.lineStyle(1, 0xa78654, .75).strokeEllipse(x, 255, 39, 6);
      } else this.rider.setAngle(5);
    }
    if (race.boost > 0 && !this.hooks.reducedMotion) {
      g.lineStyle(2, 0xffe4a2, .9);
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) g.lineBetween(x + side * (17 + i * 4), 241 + i * 3, x + side * (20 + i * 5), 258);
    }
  }
}
