import Phaser from 'phaser';

export function drawWorld(scene: Phaser.Scene, mode: 'baby' | 'moto', width: number) {
  const g = scene.add.graphics();
  const rect = (x: number, y: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(x, y, w, h);
  if (mode === 'baby') {
    rect(0, 0, width, 270, 0xf2dfb8);
    for (let x = 0; x < width; x += 24) rect(x, 0, 2, 214, 0xe8d2ab);
    rect(0, 180, width, 35, 0xbed0b4); rect(0, 211, width, 6, 0x819776);
    for (let x = 100; x < width; x += 400) {
      rect(x - 6, 28, 110, 108, 0xe6c18d); rect(x, 34, 98, 96, 0x95c6cc);
      rect(x + 6, 40, 86, 83, 0xc4e5d8); rect(x + 45, 34, 5, 96, 0xfff1d2); rect(x, 79, 98, 5, 0xfff1d2);
      rect(x - 16, 24, 18, 120, 0xd39270); rect(x + 98, 24, 18, 120, 0xd39270);
      rect(x + 160, 143, 102, 10, 0xa07554); rect(x + 168, 154, 7, 61, 0xb3865e); rect(x + 248, 154, 7, 61, 0xb3865e);
      rect(x + 177, 122, 18, 21, 0xb0bc78); rect(x + 200, 114, 12, 29, 0xd28f6a); rect(x + 217, 126, 20, 17, 0x7fa6a4);
    }
    for (let x = 300; x < width; x += 340) {
      rect(x, 203, 20, 12, 0xc78462); rect(x + 25, 198, 15, 17, 0x8cac9a); rect(x + 46, 205, 14, 10, 0xd9b25e);
      rect(x - 40, 216, 145, 9, 0xd69c79);
    }
    rect(0, 230, width, 40, 0xc5976b);
    for (let x = 0; x < width; x += 60) { rect(x, 232, 1, 38, 0xb78b62); rect(x, 251, 60, 1, 0xb78b62); }
  } else {
    rect(0, 0, width, 270, 0xb6d8ce);
    for (let x = 30; x < width; x += 180) {
      rect(x, 32, 47, 10, 0xe5edcf); rect(x + 10, 24, 25, 20, 0xe5edcf);
      rect(x - 20, 103, 140, 112, x % 360 === 30 ? 0xd8b88d : 0xdbca9d);
      rect(x - 28, 95, 156, 12, 0xb78670);
      for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
        rect(x + col * 39, 115 + row * 46, 23, 29, 0xf4e6bd); rect(x + col * 39 + 3, 118 + row * 46, 17, 22, 0x749b97);
      }
      rect(x + 100, 150, 7, 66, 0x827658);
      rect(x + 82, 134, 43, 30, 0x7f9b67); rect(x + 90, 121, 29, 17, 0x7f9b67);
    }
    rect(0, 213, width, 17, 0xc6ceab); rect(0, 230, width, 7, 0xe7daba); rect(0, 237, width, 33, 0x899e94);
    for (let x = 0; x < width; x += 40) rect(x, 229, 1, 8, 0x9caa92);
    for (let x = 10; x < width; x += 90) rect(x, 254, 36, 3, 0xcbd2b2);
  }
  // A physical floor independent of the decorative pixels.
  const floor = scene.add.zone(width / 2, 250, width, 40);
  scene.physics.add.existing(floor, true);
  return floor;
}
