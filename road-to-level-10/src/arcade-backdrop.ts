import Phaser from 'phaser';

// Attract-mode night for the invitation: a pyjama-party sky, a neon grid
// rolling towards the player and every age of Nel marching across the floor.
const W = 480, H = 270, HORIZON = 176;
const SKY = [0x0a0624, 0x100833, 0x170b42, 0x220d4f, 0x31105a, 0x461462, 0x5f1a69, 0x7c2170];
const SPARKS = [0xffd84d, 0x4ef2ff, 0xff4fb8, 0x9dff6a, 0xffffff];
const PARADE: { key: string; frames: string[]; height: number; stride: number }[] = [
  { key: 'baby-nel', frames: Array.from({ length: 8 }, (_, i) => `crawl-${i}`), height: 15, stride: 5 },
  { key: 'toddler-walk', frames: Array.from({ length: 8 }, (_, i) => `walk-${i}`), height: 21, stride: 6 },
  { key: 'hospital-walk', frames: Array.from({ length: 8 }, (_, i) => `walk-${i}`), height: 25, stride: 6 },
  { key: 'nel-nature', frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], height: 30, stride: 9 },
  { key: 'nel-skate', frames: ['ride', 'push', 'ride', 'ride'], height: 30, stride: 14 },
];

export function arcadeBackdrop(scene: Phaser.Scene, reducedMotion: boolean) {
  const sky = scene.add.graphics().setDepth(-10);
  const band = Math.ceil(HORIZON / SKY.length);
  SKY.forEach((color, i) => sky.fillStyle(color).fillRect(0, i * band, W, band));

  // Striped neon moon resting on the horizon.
  const moon = scene.add.graphics().setDepth(-9);
  for (let y = -46; y <= 0; y++) {
    const half = Math.floor(Math.sqrt(46 * 46 - y * y)), depth = -y;
    if (depth < 22 && depth % 6 < (22 - depth) / 6) continue;
    const t = (y + 46) / 46;
    moon.fillStyle(Phaser.Display.Color.GetColor(255, Math.round(222 - t * 140), Math.round(90 + t * 90))).fillRect(240 - half, HORIZON + y, half * 2, 1);
  }

  // Pixel skyline with a few lit windows: everyone is awake for the party.
  const city = scene.add.graphics().setDepth(-8);
  const rng = new Phaser.Math.RandomDataGenerator(['nel-10']);
  for (let x = 0; x < W;) {
    const w = rng.between(14, 30), h = rng.between(10, 34);
    if (x < 170 || x > 290) {
      city.fillStyle(0x0b0420).fillRect(x, HORIZON - h, w, h);
      for (let wy = HORIZON - h + 4; wy < HORIZON - 3; wy += 5) for (let wx = x + 3; wx < x + w - 3; wx += 5) {
        if (rng.frac() < .3) city.fillStyle(rng.pick([0xffd84d, 0xff9bd8, 0x7ff6ff])).fillRect(wx, wy, 2, 2);
      }
    }
    x += w + rng.between(1, 4);
  }

  const stars = Array.from({ length: 64 }, () => {
    const size = rng.frac() < .2 ? 2 : 1;
    return scene.add.rectangle(rng.between(0, W), rng.between(4, HORIZON - 40), size, size, 0xffffff, rng.realInRange(.4, 1)).setOrigin(0).setDepth(-9);
  });
  if (!reducedMotion) stars.forEach((star, i) => scene.tweens.add({ targets: star, alpha: .15, duration: 600 + (i % 7) * 260, yoyo: true, repeat: -1, delay: (i * 137) % 1600 }));

  const floor = scene.add.graphics().setDepth(-7);
  let scroll = 0;
  const drawFloor = () => {
    floor.clear().fillStyle(0x12051f).fillRect(0, HORIZON, W, H - HORIZON);
    floor.lineStyle(1, 0xff4fd8, .75);
    for (let x = -480; x <= 960; x += 40) floor.lineBetween(240 + (x - 240) * .08, HORIZON, x, H);
    for (let i = 0; i < 9; i++) {
      const t = ((i + scroll) % 9) / 9, y = HORIZON + (H - HORIZON) * t * t;
      floor.lineStyle(1, 0xff4fd8, .25 + t * .6).lineBetween(0, Math.round(y), W, Math.round(y));
    }
    floor.fillStyle(0x4ef2ff).fillRect(0, HORIZON, W, 1).fillStyle(0x4ef2ff, .3).fillRect(0, HORIZON - 1, W, 1);
  };
  drawFloor();

  const walkers = PARADE.map((who, i) => {
    const image = scene.add.image(0, H - 6, who.key, who.frames[0]).setOrigin(.5, 1).setDepth(-5);
    return { who, image, x: i * 96 - 40, shadow: scene.add.ellipse(0, H - 6, 18, 3, 0x000000, .45).setDepth(-6) };
  });
  const placeWalkers = (distance: number) => walkers.forEach(({ who, image, x, shadow }) => {
    const at = ((x + distance) % (W + 80) + W + 80) % (W + 80) - 40;
    const frame = who.frames[reducedMotion ? 0 : Math.floor((at + 40) / who.stride) % who.frames.length];
    image.setFrame(frame).setPosition(Math.round(at), H - 6);
    image.setDisplaySize(who.height * image.frame.realWidth / image.frame.realHeight, who.height);
    shadow.setPosition(Math.round(at), H - 6);
  });
  placeWalkers(0);

  // CRT scanlines over the whole scene; the invitation text stays crisp above.
  const scan = scene.add.graphics().setDepth(20);
  scan.fillStyle(0x000000, .22);
  for (let y = 0; y < H; y += 3) scan.fillRect(0, y, W, 1);

  if (reducedMotion) return;
  scene.time.addEvent({ delay: 850, loop: true, callback: () => burst(scene, rng) });
  let distance = 0;
  const tick = (_time: number, delta: number) => {
    scroll = (scroll + delta / 900) % 9; distance += delta * .028;
    drawFloor(); placeWalkers(distance);
  };
  scene.events.on('update', tick);
  scene.events.once('shutdown', () => scene.events.off('update', tick));
}

function burst(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator) {
  const x = rng.between(40, W - 40), y = rng.between(18, HORIZON - 70), color = rng.pick(SPARKS);
  for (let i = 0; i < 14; i++) {
    const angle = i / 14 * Math.PI * 2, reach = rng.between(16, 26);
    const spark = scene.add.rectangle(x, y, 2, 2, color).setDepth(-8);
    scene.tweens.add({
      targets: spark, x: x + Math.cos(angle) * reach, y: y + Math.sin(angle) * reach + 6, alpha: 0,
      duration: 900, ease: 'Quad.easeOut', onComplete: () => spark.destroy(),
    });
  }
}
