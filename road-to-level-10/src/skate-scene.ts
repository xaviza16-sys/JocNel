import Phaser from 'phaser';
import type { Level } from './model';
import { InputManager, type AudioManager } from './systems';
import { SkateController, skateGround, skateSlope, quarterLips } from './skate-model';
import { outdoorBackdrop } from './outdoor-art';
import { prop } from './adventure-art';

interface Hooks { begin: (level: Level) => void; complete: (level: Level, copy: string) => void; pause: () => void; audio: AudioManager; reducedMotion: boolean }
export class Skatepark extends Phaser.Scene {
  level!: Level;
  controls!: InputManager;
  finished = false;
  private board = new SkateController();
  private rider!: Phaser.GameObjects.Image;
  private target!: Phaser.GameObjects.Zone;
  private hud!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private elapsed = 0;
  private protectedUntil = 0;
  private checkpoint = 64;
  private bumps = 0;
  private collected = 0;
  private landingUntil = 0;
  private stars: { image: Phaser.GameObjects.Image; taken: boolean }[] = [];
  private hazards: { image: Phaser.GameObjects.Image; anchor: number; range: number; kind: string }[] = [];
  constructor(private hooks: Hooks) { super('Skatepark'); }
  init(data: { level: Level }) {
    this.level = data.level; this.board = new SkateController(); this.finished = false;
    this.elapsed = this.protectedUntil = this.bumps = this.collected = this.landingUntil = 0;
    this.checkpoint = data.level.spawn; this.stars = []; this.hazards = [];
  }
  create() {
    this.hooks.begin(this.level);
    outdoorBackdrop(this, 'skatepark-bg', this.level.width);
    const track = this.add.graphics().setDepth(0), points = [];
    for (let x = 0; x <= this.level.width + 4; x += 2) points.push({ x, y: skateGround(x) });
    track.fillStyle(0xbeb9af).fillPoints([...points, { x: this.level.width + 4, y: 310 }, { x: 0, y: 310 }], true);
    track.fillStyle(0x77b9ba).fillPoints([...points, ...points.map(p => ({ x: p.x, y: p.y + 8 })).reverse()], true);
    track.lineStyle(2, 0x515e60).strokePoints(points);
    for (const lip of quarterLips) {
      track.lineStyle(3, 0xd7dfd9).lineBetween(lip - 4, 177, lip + 27, 177);
      track.lineStyle(1, 0x9a938b).lineBetween(lip + 30, 199, lip + 48, 205);
      this.add.text(lip + 18, 145, 'QUARTER', { fontFamily: 'monospace', fontSize: '7px', color: '#344e4e' }).setOrigin(.5);
    }
    this.level.stars.forEach(s => {
      const image = this.add.image(s.x, skateGround(s.x) - 32, 'race-street', 'star').setDisplaySize(14, 14).setDepth(3);
      this.stars.push({ image, taken: false });
    });
    this.level.enemies.forEach(e => {
      const image = this.add.image(e.x, skateGround(e.x), 'foods', `${e.kind}-0`).setOrigin(.5, 1).setDepth(3).setDisplaySize(27, 29);
      this.hazards.push({ image, anchor: e.x, range: Math.min(e.range, 35), kind: e.kind });
    });
    prop(this, 'party', this.level.finish + 18, skateGround(this.level.finish), 80, 1);
    this.target = this.add.zone(64, 135, 1, 1);
    this.rider = this.add.image(64, this.board.feet, 'nel-skate', 'ride').setOrigin(.5, 1).setDepth(5);
    this.cameras.main.setBounds(0, 0, this.level.width, 270).startFollow(this.target, true, this.hooks.reducedMotion ? 1 : .16, 1, -65, 0);
    const style = { fontFamily: 'monospace', fontSize: '9px', color: '#244c49', backgroundColor: '#fff0d1', padding: { x: 6, y: 5 } };
    this.hud = this.add.text(9, 9, '', style).setScrollFactor(0).setDepth(20);
    this.hint = this.add.text(240, 43, '→ Impulsa’t · ← Frena · ESPAI Ollie · Agafa aire als quarters!', { ...style, fontSize: '8px' }).setOrigin(.5).setScrollFactor(0).setDepth(20);
    this.controls = new InputManager(this);
    const escape = this.input.keyboard!.addKey('ESC'); escape.on('down', this.hooks.pause);
    this.events.once('shutdown', () => escape.off('down', this.hooks.pause));
    this.events.on('resume', () => this.controls.reset()); this.paint();
  }
  update(_time: number, delta: number) {
    if (this.finished) return;
    this.elapsed += Math.min(delta, 100);
    const wasAirborne = this.board.airborne, quarters = this.board.quarters.size;
    this.board.step(delta / 1000, this.controls.axis(), this.controls.jumpPressed());
    if (!wasAirborne && this.board.airborne) this.hooks.audio.sfx('jump');
    if (wasAirborne && !this.board.airborne) { this.landingUntil = this.elapsed + 180; this.hooks.audio.sfx('land'); }
    if (this.board.quarters.size > quarters) this.hooks.audio.sfx('checkpoint');
    for (const point of this.level.checkpoints) if (this.board.x >= point) this.checkpoint = point;
    this.hazards.forEach((h, i) => {
      const x = h.anchor + Math.sin(this.elapsed / 850 + i) * h.range;
      h.image.setFrame(`${h.kind}-${this.hooks.reducedMotion ? 0 : 1 + Math.floor(this.elapsed / 210) % 2}`).setPosition(x, skateGround(x));
      if (this.elapsed >= this.protectedUntil && Math.abs(this.board.x - x) < 22 && this.board.feet > skateGround(x) - 24) {
        this.board.reset(this.checkpoint); this.protectedUntil = this.elapsed + 2000; this.bumps++; this.hooks.audio.sfx('hit');
      }
    });
    for (const star of this.stars) if (!star.taken && Math.abs(this.board.x - star.image.x) < 24 && Math.abs(this.board.feet - 22 - star.image.y) < 36) {
      star.taken = true; star.image.setVisible(false); this.collected++; this.hooks.audio.sfx('collect');
    }
    this.paint();
    if (this.board.x >= this.level.finish) this.complete();
  }
  private paint() {
    const b = this.board, slope = skateSlope(b.x), axis = this.controls.axis();
    const pose = this.hooks.reducedMotion ? b.airborne ? 'ollie' : 'ride' : b.airborne ? b.quarters.size && b.vy < 0 ? 'air' : 'ollie' : this.elapsed < this.landingUntil ? 'land' : slope < -.6 ? 'quarter' : slope > .6 ? 'pump' : axis > 0 && Math.floor(this.elapsed / 200) % 3 === 0 ? 'push' : 'ride';
    this.rider.setFrame(pose).setPosition(b.x, b.feet + 1).setAngle(this.hooks.reducedMotion ? 0 : b.airborne ? -6 : pose === 'quarter' ? 0 : Math.max(-45, Math.min(45, Math.atan(slope) * 180 / Math.PI)));
    this.rider.setDisplaySize(50 * this.rider.frame.realWidth / this.rider.frame.realHeight, 50).setTint(this.elapsed < this.protectedUntil ? 0xd2f1ed : 0xffffff);
    this.target.setPosition(b.x, 135);
    const pct = Math.min(100, Math.round(b.x / this.level.finish * 100));
    this.hud.setText(`QUARTERS ${b.quarters.size}/4 · ★ ${this.collected} · ${pct}%`);
    this.hint.setVisible(this.elapsed < 5000);
    document.getElementById('status')!.textContent = `SKATEPARK · ${b.quarters.size} quarters · ${b.ollies} salts · ${this.bumps} ensopegades · ${pct}%`;
  }
  complete() {
    this.finished = true; this.scene.pause();
    this.hooks.complete(this.level, `Nivell 10, Nel! Has volat per ${this.board.quarters.size} quarters del skatepark i has arribat a la festa. Ara toca celebrar-ho junts!`);
  }
}
