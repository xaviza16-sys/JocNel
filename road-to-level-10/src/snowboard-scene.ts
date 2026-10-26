import type { ScoreStats } from './scores';
import Phaser from 'phaser';
import type { Level } from './model';
import { InputManager, type AudioManager } from './systems';
import { SnowboardController, snowGround } from './traversal';
import { prop } from './adventure-art';

interface Hooks { score: (level: Level, stats: ScoreStats) => void; begin: (level: Level) => void; complete: (level: Level, copy: string) => void; pause: () => void; audio: AudioManager; reducedMotion: boolean }
export class Snowboard extends Phaser.Scene {
  level!: Level;
  controls!: InputManager;
  finished = false;
  private board = new SnowboardController();
  private rider!: Phaser.GameObjects.Image;
  private target!: Phaser.GameObjects.Zone;
  private hud!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private track!: Phaser.GameObjects.Graphics;
  private stars: { x: number; image: Phaser.GameObjects.Image; taken: boolean }[] = [];
  private obstacles: { x: number; anchor: number; range: number; height: number; image: Phaser.GameObjects.Image }[] = [];
  private landingUntil = 0;
  private checkpoint = 64;
  private protectedUntil = 0;
  private elapsed = 0;
  private bumps = 0;
  private collected = 0;
  constructor(private hooks: Hooks) { super('Snowboard'); }
  init(data: { level: Level }) {
    this.level = data.level; this.board = new SnowboardController(); this.finished = false;
    this.stars = []; this.obstacles = []; this.checkpoint = 64; this.elapsed = this.bumps = this.collected = this.protectedUntil = this.landingUntil = 0;
  }
  create() {
    this.hooks.begin(this.level);
    this.add.image(240, 135, 'mountain-bg').setDisplaySize(675, 270).setScrollFactor(0).setDepth(-4);
    const terrain = this.add.graphics().setDepth(-2);
    const points: Phaser.Types.Math.Vector2Like[] = [];
    for (let x = 0; x <= this.level.width + 40; x += 20) points.push({ x, y: snowGround(x) });
    terrain.fillStyle(0x91acbb).fillPoints([...points, { x: this.level.width + 40, y: 1000 }, { x: 0, y: 1000 }], true);
    terrain.fillStyle(0xf3faf0).fillPoints([...points, ...points.map(p => ({ x: p.x, y: p.y + 18 })).reverse()], true);
    terrain.lineStyle(2, 0xd7e9e7).strokePoints(points);
    for (let x = 80; x < this.level.width; x += 190) prop(this, 'fir', x, snowGround(x) + 6, 95, -1);
    for (const x of this.level.checkpoints) {
      const y = snowGround(x); this.add.rectangle(x, y - 16, 2, 33, 0x68848d); this.add.rectangle(x + 9, y - 28, 16, 9, 0xeab854);
    }
    this.level.stars.forEach((s, i) => {
      const image = this.add.image(s.x, snowGround(s.x) - (i % 2 ? 65 : 27), 'race-street', 'star').setDisplaySize(15, 15).setDepth(3);
      this.stars.push({ x: s.x, image, taken: false });
    });
    this.level.enemies.forEach((spawn, i) => {
      const frame = spawn.kind === 'sled' ? i % 4 === 1 ? 'sled-rider' : 'sled' : i % 4 === 2 ? 'child' : 'person';
      const height = spawn.kind === 'sled' ? 27 : frame === 'child' ? 34 : 52;
      const image = this.add.image(spawn.x, snowGround(spawn.x), 'nel-snow', frame).setOrigin(.5, 1).setDepth(3);
      image.setDisplaySize(height * image.frame.width / image.frame.height, height);
      this.obstacles.push({ x: spawn.x, anchor: spawn.x, range: spawn.range, height, image });
    });
    prop(this, 'cabin', this.level.finish + 25, snowGround(this.level.finish + 25), 110, -1);
    this.add.text(this.level.finish, snowGround(this.level.finish) - 65, 'ARRIBADA!', { fontFamily: 'monospace', fontSize: '9px', color: '#274c51', backgroundColor: '#fff0ca', padding: { x: 5, y: 4 } }).setOrigin(.5);
    this.track = this.add.graphics().setDepth(4);
    this.target = this.add.zone(this.board.x, this.board.feet - 42, 1, 1);
    this.rider = this.add.image(64, this.board.feet, 'nel-snow', 'ride-0').setOrigin(.5, 1).setDepth(5);
    this.cameras.main.setBounds(0, 0, this.level.width, 1000).startFollow(this.target, true, this.hooks.reducedMotion ? 1 : .16, this.hooks.reducedMotion ? 1 : .13, -65, -5);
    const style = { fontFamily: 'monospace', fontSize: '9px', color: '#25474d', backgroundColor: '#eff7e7', padding: { x: 6, y: 5 } };
    this.hud = this.add.text(9, 9, '', style).setScrollFactor(0).setDepth(20);
    this.hud.setVisible(!matchMedia('(pointer: coarse)').matches);
    this.hint = this.add.text(240, 43, '← Frena · → Accelera · ESPAI Esquiva persones i trineus', { ...style, fontSize: '8px' }).setOrigin(.5).setScrollFactor(0).setDepth(20);
    this.controls = new InputManager(this);
    const escape = this.input.keyboard!.addKey('ESC'); escape.on('down', this.hooks.pause);
    this.events.once('shutdown', () => escape.off('down', this.hooks.pause));
    this.events.on('resume', () => this.controls.reset()); this.paint();
  }
  update(_time: number, delta: number) {
    if (this.finished) return;
    this.elapsed += Math.min(delta, 100);
    const wasAirborne = this.board.airborne;
    this.board.step(delta / 1000, this.controls.axis(), this.controls.jumpPressed());
    if (!wasAirborne && this.board.airborne) this.hooks.audio.sfx('jump');
    if (wasAirborne && !this.board.airborne) { this.landingUntil = this.elapsed + 180; this.hooks.audio.sfx('land'); }
    this.obstacles.forEach((o, i) => {
      o.x = o.anchor + Math.sin(this.elapsed / 1400 + i) * o.range;
      o.image.setPosition(o.x, snowGround(o.x));
    });
    for (const point of this.level.checkpoints) if (this.board.x >= point && point > this.checkpoint) this.checkpoint = point;
    for (const item of this.stars) {
      if (!item.taken && Math.abs(this.board.x - item.x) < 23 && Math.abs(this.board.feet - 23 - item.image.y) < 38) {
        item.taken = true; item.image.setVisible(false); this.collected++; this.hooks.audio.sfx('collect');
      }
    }
    const hit = this.obstacles.find(o => Math.abs(this.board.x - o.x) < 22 && this.board.feet > snowGround(o.x) - o.height + 9);
    if (this.elapsed >= this.protectedUntil && hit) {
      // Retry near the missed obstacle so repeated collisions never create
      // a long deterministic loop from the same distant checkpoint.
      this.board.reset(Math.max(this.checkpoint, hit.x - 80)); this.protectedUntil = this.elapsed + 1900; this.bumps++; this.hooks.audio.sfx('hit');
    }
    this.paint(); if (this.board.x >= this.level.finish) this.complete();
  }
  private paint() {
    const b = this.board;
    this.target.setPosition(b.x, b.feet - 42);
    const pose = b.airborne ? b.vy < -170 ? 'takeoff' : 'air' : this.elapsed < this.landingUntil ? 'land' : `ride-${this.hooks.reducedMotion ? 0 : Math.floor(this.elapsed / 200) % 4}`;
    this.rider.setFrame(pose).setPosition(b.x, b.feet + 2);
    this.rider.setDisplaySize(52 * this.rider.frame.realWidth / this.rider.frame.realHeight, 52).setAngle(this.hooks.reducedMotion ? 0 : b.airborne ? -8 : 11.5).setTint(this.elapsed < this.protectedUntil ? 0xcce9f1 : 0xffffff);
    this.track.clear();
    if (!b.airborne && !this.hooks.reducedMotion) {
      this.track.lineStyle(1, 0xb3d2d6).lineBetween(b.x - 30, snowGround(b.x - 30), b.x - 10, snowGround(b.x - 10));
      this.track.fillStyle(0xffffff).fillRect(b.x - 22, b.feet - 4, 3, 2).fillRect(b.x - 29, b.feet - 7, 2, 2);
    }
    const pct = Math.min(100, Math.round(b.x / this.level.finish * 100));
    this.hooks.score(this.level, { progress: pct, elapsedSeconds: this.elapsed / 1000, stars: this.collected, bumps: this.bumps });
    this.hud.setText(`★ ${this.collected}/${this.stars.length}  ·  ${Math.round(b.speed)} km/h  ·  ${pct}%`);
    this.hint.setVisible(this.elapsed < 4500);
    document.getElementById('status')!.textContent = `SURF DE NEU · ${b.jumps} salts · ${this.bumps} ensopegades · Baixada ${Math.round(snowGround(b.x) - snowGround(64))} m · ${pct}%`;
  }
  complete() {
    this.finished = true; this.scene.pause();
    this.hooks.complete(this.level, `Baixada completada amb la taula de neu! ${this.collected} estrelles i ${this.board.jumps} salts. Ens esperen els arbres i les lianes.`);
  }
}
