import Phaser from 'phaser';
import type { Level } from './model';
import { InputManager, type AudioManager } from './systems';
import { movement, enemyIntent, JumpBuffer, type PlatformMode, type EnemyKind } from './platform-model';
import { prop } from './adventure-art';
import { adventureWorld, platformArt, forestTree } from './adventure-world';
import { BabyPuzzle, canMantle } from './baby-puzzle';
import { zipPose, vinePose, nextSwingAngle } from './traversal';

interface Hooks { begin: (level: Level) => void; complete: (level: Level, copy: string) => void; pause: () => void; audio: AudioManager; reducedMotion: boolean }
interface Enemy { body: Phaser.Physics.Arcade.Image; art: Phaser.GameObjects.Image; kind: EnemyKind; anchor: number; range: number; direction: number; phase: number; lastJump: number }

export class PlatformLevel extends Phaser.Scene {
  level!: Level;
  controls!: InputManager;
  finished = false;
  player!: Phaser.Physics.Arcade.Image;
  private hero!: Phaser.GameObjects.Image;
  private hazards: Enemy[] = [];
  private collected = 0;
  private checkpoint = 64;
  private clock = 0;
  private protectedUntil = 0;
  private climbing?: Level['ladders'][number];
  private jumpBuffer = new JumpBuffer();
  private hud!: Phaser.GameObjects.Text;
  private note!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private jumps = 0;
  private bumps = 0;
  private climbTime = 0;
  private bonusUntil = 0;
  private puzzle?: BabyPuzzle;
  private blocks: { zone: Phaser.GameObjects.Zone; art: Phaser.GameObjects.Image; index: number }[] = [];
  private mantle?: { x: number; feet: number; targetX: number; targetFeet: number; elapsed: number };
  private mantles = 0;
  private zip?: { index: number; progress: number };
  private vine?: { index: number; angle: number };
  private zipped = new Set<number>();
  private swung = new Set<number>();
  private grabAfter = 0;
  private momentumUntil = 0;
  private ropes!: Phaser.GameObjects.Graphics;
  private mother?: Phaser.GameObjects.Image;
  private lastPushSound = 0;
  private dogArt?: Phaser.GameObjects.Image;
  private dogMounted = false;
  private dogCrossed = false;
  constructor(private hooks: Hooks) { super('PlatformLevel'); }
  init(data: { level: Level }) {
    this.level = data.level; this.finished = false; this.collected = 0; this.clock = 0; this.checkpoint = data.level.spawn;
    this.protectedUntil = 0; this.climbing = undefined; this.hazards = []; this.jumpBuffer.reset();
    this.jumps = this.bumps = this.climbTime = this.bonusUntil = 0;
    this.puzzle = data.level.mode === 'baby' ? new BabyPuzzle(data.level.blocks || []) : undefined;
    this.blocks = []; this.mantle = undefined; this.mantles = 0; this.zip = this.vine = undefined;
    this.zipped.clear(); this.swung.clear(); this.grabAfter = this.momentumUntil = this.lastPushSound = 0; this.mother = undefined;
    this.dogArt = undefined; this.dogMounted = this.dogCrossed = false;
  }
  create() {
    this.hooks.begin(this.level);
    const config = movement[this.level.mode as PlatformMode];
    const floor = adventureWorld(this, this.level);
    this.physics.world.setBounds(0, -200, this.level.width, 550);
    // Physics is a small independent proxy; changing art poses never resizes it.
    this.player = this.physics.add.image(this.level.spawn, 218, 'star').setVisible(false).setCollideWorldBounds(true);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(this.level.mode === 'baby' ? 20 : 18, this.level.mode === 'baby' ? 18 : 30);
    this.player.setMaxVelocity(290, 450);
    this.hero = this.add.image(this.player.x, 230, 'heroes', `${config.actor}-0`).setOrigin(.5, 1).setDepth(6);
    const platforms = this.physics.add.staticGroup();
    this.level.platforms.forEach(p => {
      const zone = this.add.zone(p.x, p.y + p.height / 2, p.width, p.height); this.physics.add.existing(zone, true); platforms.add(zone);
      platformArt(this, this.level, p);
    });
    if (this.level.dog) {
      const dog = this.level.dog;
      const surface = this.add.zone(dog.x, 230 - dog.height / 2, dog.width, dog.height);
      this.physics.add.existing(surface, true); platforms.add(surface);
      this.dogArt = this.add.image(dog.x, 230, 'family', 'dog-rest').setOrigin(.5, 1).setDepth(4);
      this.add.text(dog.x, 184, 'El gos descansa… ↑ passa-hi per sobre', { fontFamily: 'monospace', fontSize: '7px', color: '#294c43', backgroundColor: '#fff0cf', padding: { x: 3, y: 3 } }).setOrigin(.5).setDepth(4);
    }
    this.physics.add.collider(this.player, floor);
    const normalCollisions = () => !this.climbing && !this.mantle && !this.zip && !this.vine;
    this.physics.add.collider(this.player, platforms, undefined, normalCollisions);
    const blockBodies = this.physics.add.staticGroup();
    this.puzzle?.blocks.forEach((block, index) => {
      const zone = this.add.zone(block.x, 230 - block.height / 2, block.width, block.height);
      this.physics.add.existing(zone, true); blockBodies.add(zone);
      const art = this.add.image(block.x, 230, 'worlds', 'cushions').setOrigin(.5, 1).setDisplaySize(block.width, block.height).setDepth(3);
      this.blocks.push({ zone, art, index });
    });
    this.physics.add.collider(this.player, blockBodies, undefined, normalCollisions);
    const stars = this.physics.add.group({ allowGravity: false, immovable: true });
    this.level.stars.forEach(s => {
      const star = stars.create(s.x, s.y, 'race-street', 'star') as Phaser.Physics.Arcade.Image;
      star.setDisplaySize(14, 14).setDepth(4); (star.body as Phaser.Physics.Arcade.Body).setSize(star.width * .8, star.height * .8);
      if (!this.hooks.reducedMotion) this.tweens.add({ targets: star, y: s.y - 3, yoyo: true, repeat: -1, duration: 850 });
    });
    this.physics.add.overlap(this.player, stars, (_p, obj) => {
      const star = obj as Phaser.Physics.Arcade.Image;
      if (!star.active) return; star.disableBody(true, true); this.collected++; this.bonusUntil = this.clock + 600; this.hooks.audio.sfx('collect');
    });
    const enemies = this.physics.add.group();
    this.level.enemies.forEach((spawn, i) => {
      const body = enemies.create(spawn.x, 218, 'star') as Phaser.Physics.Arcade.Image;
      body.setVisible(false).setCollideWorldBounds(true); (body.body as Phaser.Physics.Arcade.Body).setSize(18, 20);
      const frame = ['ball', 'snowball'].includes(spawn.kind) ? spawn.kind : `${spawn.kind}-0`;
      const art = this.add.image(spawn.x, 230, 'foods', frame).setOrigin(.5, 1).setDepth(5);
      this.hazards.push({ body, art, kind: spawn.kind, anchor: spawn.x, range: spawn.range, direction: -1, phase: i * 670, lastJump: -9999 });
    });
    this.physics.add.collider(enemies, floor); this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(this.player, enemies, () => this.retry());
    this.level.checkpoints.forEach(x => {
      this.add.rectangle(x, 211, 2, 38, 0x6e7b56).setDepth(2); this.add.rectangle(x + 8, 197, 15, 10, 0xedbe5d).setDepth(2);
    });
    this.ropes = this.add.graphics().setDepth(4);
    this.level.ladders.forEach(l => {
      if (this.level.mode === 'nature') forestTree(this, l.x, l.top - 48, l.bottom);
      else prop(this, 'ladder', l.x, l.bottom, 17, 3).setDisplaySize(17, l.bottom - l.top);
    });
    // Canopy trees visibly support the zipline and vine attachment points.
    this.level.vines?.forEach(v => forestTree(this, v.x, v.y - 8, 230));
    this.level.ziplines?.forEach(z => {
      for (const point of [{ x: z.x1, y: z.y1 - 48 }, { x: z.x2, y: z.y2 - 48 }]) {
        forestTree(this, point.x, point.y - 8, 230);
        this.add.rectangle(point.x, point.y, 10, 6, 0xd3b779).setDepth(4);
      }
    });
    if (this.level.mode === 'baby') {
      this.mother = this.add.image(this.level.finish + 10, this.level.goalY, 'family', 'mother').setOrigin(.5, 1).setDepth(5);
      this.mother.setDisplaySize(74 * this.mother.frame.width / this.mother.frame.height, 74);
    } else {
      const goal = this.add.image(this.level.finish + 6, this.level.goalY, 'foods', this.level.mode === 'skate' ? 'cake' : 'bear').setOrigin(.5, 1).setDepth(4);
      goal.setDisplaySize(this.level.mode === 'skate' ? 31 : 25, this.level.mode === 'skate' ? 31 : 27);
    }
    this.add.text(this.level.finish, this.level.goalY - (this.level.mode === 'baby' ? 91 : 45), this.level.mode === 'baby' ? 'LA MAMA! ♡' : this.level.mode === 'nature' ? 'EL MIRADOR ↑' : this.level.mode === 'skate' ? 'NIVELL 10' : 'ARRIBADA!', { fontFamily: 'monospace', fontSize: '8px', color: '#254a42', backgroundColor: '#fff0c8', padding: { x: 4, y: 3 } }).setOrigin(.5).setDepth(5);
    this.cameras.main.setBounds(0, 0, this.level.width, 270).startFollow(this.player, true, this.hooks.reducedMotion ? 1 : .15, 1, -72, 0);
    const style = { fontFamily: 'monospace', fontSize: '9px', color: '#24483e', backgroundColor: '#fff0d1', padding: { x: 6, y: 5 } };
    this.hud = this.add.text(9, 9, '', style).setScrollFactor(0).setDepth(20);
    this.note = this.add.text(471, 9, '', style).setOrigin(1, 0).setScrollFactor(0).setDepth(20);
    this.hint = this.add.text(240, 44, '', { ...style, fontSize: '8px' }).setOrigin(.5, 0).setScrollFactor(0).setDepth(20);
    this.progressBar = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.controls = new InputManager(this);
    const escape = this.input.keyboard!.addKey('ESC'); escape.on('down', this.hooks.pause);
    this.events.once('shutdown', () => escape.off('down', this.hooks.pause));
    this.events.on('resume', () => { this.controls.reset(); this.jumpBuffer.reset(); });
    this.updateHud();
  }
  private retry() {
    if (this.clock < this.protectedUntil || this.finished) return;
    this.bumps++; this.protectedUntil = this.clock + 1800; this.climbing = undefined; this.jumpBuffer.reset();
    (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = true;
    this.player.setPosition(this.checkpoint, 208).setVelocity(0, 0);
    this.zip = this.vine = undefined; this.mantle = undefined;
    this.hooks.audio.sfx('hit');
  }
  update(_time: number, delta: number) {
    if (!this.player || this.finished) return;
    this.clock += Math.min(delta, 100);
    const config = movement[this.level.mode as PlatformMode], axis = this.controls.axis();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let speed = axis * config.speed;
    if (this.level.mode === 'snow' || this.level.mode === 'skate') speed = config.speed * (axis < 0 ? .35 : axis > 0 ? 1.15 : .72);
    if (this.clock < this.momentumUntil && !body.blocked.down) speed += 115;
    if (this.level.mode === 'baby') this.babyInteraction(delta, axis, body);
    if (this.level.mode === 'nature') this.forestInteraction(delta, axis, body);
    if (this.level.mode === 'nature' && this.controls.climbHeld() && !this.climbing && !this.zip && !this.vine) {
      this.climbing = this.level.ladders.find(l => Math.abs(this.player.x - l.x) < 22 && body.bottom > l.top + 4 && body.bottom <= l.bottom + 5);
    }
    if (this.mantle || this.zip || this.vine) {
      // These interactions place the independent physics proxy along a path.
    } else if (this.climbing) {
      if (!this.controls.climbHeld()) { this.climbing = undefined; body.allowGravity = true; }
      else {
        this.climbTime += delta; body.allowGravity = false; this.player.setX(this.climbing.x).setVelocity(0, -85);
        if (body.bottom <= this.climbing.top) {
          this.player.setPosition(this.climbing.x + 24, this.climbing.top - body.height / 2 - 2);
          this.player.setVelocity(0, 0); body.allowGravity = true; this.climbing = undefined; this.hooks.audio.sfx('climb');
        }
      }
    } else {
      body.allowGravity = true; this.player.setVelocityX(speed);
      const jump = this.controls.jumpPressed();
      if (this.level.mode !== 'baby' && this.jumpBuffer.step(this.clock, body.blocked.down, jump)) {
        this.player.setVelocityY(-config.jump); this.jumps++; this.hooks.audio.sfx('jump');
      }
    }
    const airborne = !body.blocked.down;
    let frame = axis || this.level.mode === 'snow' || this.level.mode === 'skate' ? 1 + Math.floor(this.clock / 150) % 2 : 0;
    if (this.hooks.reducedMotion && !airborne) frame = this.level.mode === 'snow' ? 1 : 0;
    if (airborne) frame = this.level.mode === 'skate' ? 2 : 3;
    if (this.climbing) frame = 3;
    if (this.level.mode === 'nature' && airborne && !this.climbing) frame = 2;
    if (this.level.mode === 'nature' && !airborne && !this.climbing) frame = axis ? 1 : 0;
    if (this.level.mode === 'skate' && !airborne) frame = this.clock < this.bonusUntil ? 3 : axis > 0 ? 1 : 0;
    const special = this.mantle ? 'baby-climb' : this.level.mode === 'baby' && this.controls.actionHeld() && axis ? 'baby-push' : this.zip ? 'zip' : this.vine ? 'vine' : undefined;
    this.hero.setTexture(special ? 'mechanics' : 'heroes', special || `${config.actor}-${this.level.mode === 'baby' && airborne ? 1 : frame}`).setPosition(this.player.x, body.bottom).setFlipX(axis < 0 && this.level.mode !== 'snow' && this.level.mode !== 'skate');
    const targetHeight = this.level.mode === 'baby' && airborne ? 38 : config.height;
    this.hero.setDisplaySize(targetHeight * this.hero.frame.width / this.hero.frame.height, targetHeight);
    this.hero.setTint(this.clock < this.protectedUntil ? 0xd4ebf4 : 0xffffff);
    if (this.level.dog && this.dogArt) {
      const dog = this.level.dog, top = 230 - dog.height, right = dog.x + dog.width / 2;
      const resting = Math.abs(this.player.x - dog.x) < 180 || this.hooks.reducedMotion;
      this.dogArt.setFrame(resting ? 'dog-rest' : 'dog-awake');
      this.dogArt.setDisplaySize(dog.width, dog.width * this.dogArt.frame.height / this.dogArt.frame.width);
      if (this.player.x >= dog.x - dog.width / 2 && this.player.x <= right + 4 && body.bottom <= top + 5) this.dogMounted = true;
      if (this.dogMounted && this.player.x > right + 3 && body.bottom <= top + 9) this.dogCrossed = true;
    }
    this.hazards.forEach(enemy => {
      const eb = enemy.body.body as Phaser.Physics.Arcade.Body;
      if (enemy.body.x < enemy.anchor - enemy.range) enemy.direction = 1;
      if (enemy.body.x > enemy.anchor + enemy.range) enemy.direction = -1;
      const intent = enemyIntent(enemy.kind, this.clock + enemy.phase, enemy.direction);
      enemy.body.setVelocityX(intent.vx);
      if (intent.jump && eb.blocked.down && this.clock - enemy.lastJump > 800) { enemy.body.setVelocityY(enemy.kind === 'pepper' ? -230 : -165); enemy.lastJump = this.clock; }
      const animation = intent.warn ? 1 : !eb.blocked.down ? 3 : 1 + Math.floor(this.clock / 160) % 2;
      enemy.art.setFrame(['ball', 'snowball'].includes(enemy.kind) ? enemy.kind : `${enemy.kind}-${animation}`);
      enemy.art.setPosition(enemy.body.x, eb.bottom).setFlipX(enemy.direction > 0).setTint(intent.warn ? 0xffd59b : 0xffffff);
      const h = ['ball', 'snowball'].includes(enemy.kind) ? 21 : 29;
      enemy.art.setDisplaySize(h * enemy.art.frame.width / enemy.art.frame.height, h);
      if (enemy.kind === 'ball' || enemy.kind === 'snowball') enemy.art.setOrigin(.5, .5).setY(eb.bottom - h / 2).setAngle(this.hooks.reducedMotion ? 0 : enemy.body.x * 3);
    });
    for (const point of this.level.checkpoints) if (this.player.x >= point && point > this.checkpoint) { this.checkpoint = point; this.hooks.audio.sfx('checkpoint'); }
    if (this.player.y > 300) this.retry();
    this.updateHud();
    // Recovering along the ground must not leave the forest exit locked by
    // optional traversal counters or by the height of the lookout platform.
    const atExitHeight = this.level.mode === 'nature' || body.bottom <= this.level.goalY + 5;
    if ((!this.level.dog || this.dogCrossed) && this.player.x >= this.level.finish && atExitHeight) this.complete();
  }
  private babyInteraction(delta: number, axis: number, body: Phaser.Physics.Arcade.Body) {
    const dt = Math.min(delta, 60) / 1000;
    if (this.mantle) {
      const m = this.mantle; m.elapsed += dt;
      const progress = Math.min(1, m.elapsed / .46);
      const vertical = Math.min(1, progress / .65), horizontal = Math.max(0, (progress - .3) / .7);
      body.allowGravity = false; this.player.setVelocity(0, 0);
      this.player.setPosition(m.x + (m.targetX - m.x) * horizontal, m.feet + (m.targetFeet - m.feet) * vertical - body.height / 2);
      if (progress >= 1) { this.mantle = undefined; body.allowGravity = true; this.mantles++; this.hooks.audio.sfx('climb'); }
      return;
    }
    const pushing = this.controls.actionHeld();
    if (pushing && axis && body.bottom >= 226) {
      const block = this.puzzle?.blocks.find(b => Math.abs((b.x - axis * b.width / 2) - (this.player.x + axis * body.width / 2)) < 8);
      if (block && this.puzzle!.push(block.id, axis * 46 * dt)) {
        if (this.clock - this.lastPushSound > 220) { this.hooks.audio.sfx('push'); this.lastPushSound = this.clock; }
        this.blocks.forEach(item => {
          const state = this.puzzle!.blocks[item.index]; item.zone.setX(state.x); item.art.setX(state.x);
          (item.zone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
        });
      }
    }
    if (!pushing && this.controls.climbHeld() && axis) {
      const surfaces = [
        ...this.level.platforms.map(p => ({ left: p.x - p.width / 2, right: p.x + p.width / 2, top: p.y })),
        ...(this.puzzle?.blocks || []).map(b => ({ left: b.x - b.width / 2, right: b.x + b.width / 2, top: 230 - b.height })),
        ...(this.level.dog ? [{ left: this.level.dog.x - this.level.dog.width / 2, right: this.level.dog.x + this.level.dog.width / 2, top: 230 - this.level.dog.height }] : []),
      ];
      const surface = surfaces.find(s => canMantle(body.bottom, s.top, axis > 0 ? s.left - body.right : body.left - s.right));
      if (surface) {
        this.mantle = { x: this.player.x, feet: body.bottom, targetX: axis > 0 ? surface.left + body.width / 2 + 5 : surface.right - body.width / 2 - 5, targetFeet: surface.top - 1, elapsed: 0 };
        body.allowGravity = false; this.player.setVelocity(0, 0);
      }
    }
  }
  private forestInteraction(delta: number, axis: number, body: Phaser.Physics.Arcade.Body) {
    const dt = Math.min(delta, 60) / 1000;
    if (this.zip) {
      const zip = this.level.ziplines![this.zip.index];
      this.zip.progress = Math.min(1, this.zip.progress + 175 * dt / Math.hypot(zip.x2 - zip.x1, zip.y2 - zip.y1));
      const p = zipPose(zip, this.zip.progress); body.allowGravity = false; this.player.setVelocity(0, 0).setPosition(p.x, p.y - body.height / 2);
      this.controls.jumpPressed();
      if (this.zip.progress >= 1) { this.zipped.add(this.zip.index); this.zip = undefined; body.allowGravity = true; this.grabAfter = this.clock + 200; this.hooks.audio.sfx('land'); }
    } else if (this.vine) {
      this.vine.angle = nextSwingAngle(this.vine.angle, axis, dt);
      const p = vinePose(this.level.vines![this.vine.index], this.vine.angle);
      body.allowGravity = false; this.player.setVelocity(0, 0).setPosition(p.x, p.y - body.height / 2);
      if (this.controls.jumpPressed()) {
        this.vine = undefined; body.allowGravity = true; this.grabAfter = this.clock + 300; this.momentumUntil = this.clock + 650;
        this.player.setVelocity(235, -220); this.jumps++; this.hooks.audio.sfx('vine');
      }
    } else if (!this.climbing && this.controls.climbHeld() && this.clock >= this.grabAfter) {
      const zipIndex = this.level.ziplines?.findIndex(z => Math.abs(this.player.x - z.x1) < 27 && Math.abs(body.bottom - z.y1) < 28) ?? -1;
      if (zipIndex >= 0) { this.zip = { index: zipIndex, progress: 0 }; this.hooks.audio.sfx('zip'); }
      else {
        const index = this.level.vines?.findIndex(v => { const p = vinePose(v, -.65); return Math.abs(this.player.x - p.x) < 42 && Math.abs(body.bottom - p.y) < 72; }) ?? -1;
        if (index >= 0) { this.vine = { index, angle: -.65 }; this.swung.add(index); this.hooks.audio.sfx('vine'); }
      }
    }
    this.ropes.clear();
    this.level.ziplines?.forEach(z => {
      this.ropes.lineStyle(2, 0x564d3b).lineBetween(z.x1, z.y1 - 48, z.x2, z.y2 - 48);
      this.ropes.lineStyle(1, 0xc8c4a2).lineBetween(z.x1, z.y1 - 50, z.x2, z.y2 - 50);
    });
    this.level.vines?.forEach((v, i) => {
      const angle = this.vine?.index === i ? this.vine.angle : -.65, p = vinePose(v, angle);
      this.ropes.lineStyle(3, 0x658348).lineBetween(v.x, v.y, p.x, p.y - 26);
      this.ropes.fillStyle(0x83a652).fillEllipse(v.x - 4, v.y + 8, 12, 5);
    });
  }
  private updateHud() {
    const pct = Math.min(100, Math.max(0, Math.round(this.player.x / this.level.finish * 100)));
    this.hud.setText(`★ ${this.collected}/${this.level.stars.length}  ·  ${pct}%`);
    this.note.setText(this.zip ? 'TIROLINA' : this.vine ? `LIANA ${this.vine.index + 1}` : this.climbing || this.mantle ? '↑ GRIMPANT' : this.clock < this.protectedUntil ? 'POTS CONTINUAR!' : this.checkpoint > this.level.spawn ? '✓ PUNT DESAT' : 'INTENTS IL·LIMITATS');
    this.hint.setVisible(this.clock < 5200 || !!this.climbing || !!this.vine || !!this.zip || this.level.mode === 'baby');
    this.hint.setText(this.level.mode === 'baby' ? this.controls.actionHeld() ? 'Mantén ESPAI + →: acosta els blocs. Deixa l’espai i prem ↑ per grimpar.' : '↑ + direcció: grimpa · ESPAI + direcció: empeny · Busca la mama' : this.vine ? '→ Gronxa’t · ESPAI: deixa’t anar · Mantén ↑ per agafar la següent' : this.zip ? 'Travessant les capçades!' : this.climbing ? 'Mantén ↑ / W o GRIMPAR per pujar per l’arbre' : this.level.mode === 'nature' ? '↑: arbre / agafar-se · →: gronxar-se · ESPAI: saltar o deixar-se anar' : this.level.mode === 'skate' ? '→: impulsa’t · ESPAI: ollie · ←: frena' : '← →: mou-te · ESPAI: salta i esquiva');
    this.progressBar.clear().fillStyle(0xead7ab).fillRect(9, 33, 100, 3).fillStyle(0x6d9b70).fillRect(9, 33, pct, 3);
    document.getElementById('status')!.textContent = this.level.mode === 'baby'
      ? `NEL · ${this.jumps} salts · ${this.mantles} grimpades · ${Math.round(this.puzzle?.moved || 0)} empès · ESCALA ${this.puzzle?.readyCount || 0} A PUNT · GOS: ${this.dogCrossed ? 'FET' : 'PENDENT'} · ${pct}%`
      : `★ ${this.collected} records · ${this.jumps} salts · ${Math.round(this.climbTime / 1000)} s grimpant · ${this.zipped.size} tirolines · ${this.swung.size} lianes · ${this.bumps} ensopegades · ${pct}%`;
  }
  complete() {
    this.finished = true; this.player.setVelocity(0, 0); this.scene.pause();
    if (this.mother) { this.hero.setVisible(false); this.mother.setFrame('hug').setDisplaySize(74 * this.mother.frame.width / this.mother.frame.height, 74); }
    this.hooks.complete(this.level, this.level.mode === 'baby' ? 'Has trobat la mama, Nel! Has passat per damunt del gos i has construït les teves escales fins a arribar als seus braços.' : this.level.mode === 'skate' ? `Nivell 10, Nel! Has arribat a la festa amb ${this.collected} records. Ara toca celebrar-ho junts.` : `Record completat! Has recollit ${this.collected} de ${this.level.stars.length} estrelles i has fet ${this.jumps} salts. T’espera una nova aventura.`);
  }
}
