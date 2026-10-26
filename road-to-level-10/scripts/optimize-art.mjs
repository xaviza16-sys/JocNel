// Format-only delivery optimization. Original generated PNGs remain untouched.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const files = ['assets/race/rider-rear-v1.png', 'assets/race/autumn-street-v2.png', 'assets/adventure/evolution-v2.png', 'assets/adventure/enemies-v1.png', 'assets/adventure/worlds-v1.png', 'assets/adventure/mechanics-v1.png', 'assets/adventure/family-nel-v1.png', 'assets/adventure/family-nel-v2.png', 'assets/adventure/baby-nel-v1.png', 'assets/adventure/baby-nel-hug-v1.png'];
const browser = await chromium.launch();
files.push('assets/adventure/toddler-nel-v1.png', 'assets/adventure/toy-moto-parked-v1.png');
files.push('assets/race/nel-promenade-rider-v1.png', 'assets/race/promenade-v1.png');
files.push('assets/race/nel-moto-spin-v1.png');
files.push('assets/race/nel-moto-spin-v2.png');
files.push('assets/adventure/hospital-family-v1.png', 'assets/adventure/hospital-corridor-v1.png');
files.push('assets/adventure/home-bedroom-v1.png', 'assets/adventure/toddler-walk-v2.png', 'assets/adventure/hospital-walk-v2.png');
files.push(...['nel-nature', 'nel-skate', 'nel-snow', 'garden', 'forest', 'mountain', 'skatepark', 'home-cushions'].map(name => `assets/adventure/${name}-v2.png`));
files.push('assets/adventure/forest-trunk-v2.png');
try {
  const page = await browser.newPage();
  for (const file of files) {
    const input = await readFile(file);
    const encoded = await page.evaluate(async base64 => {
      const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', .94).split(',')[1];
    }, input.toString('base64'));
    const output = Buffer.from(encoded, 'base64'); const destination = file.replace(/\.png$/, '.webp');
    await writeFile(destination, output); console.log(`${destination}: ${input.length} → ${output.length} bytes`);
  }
} finally { await browser.close(); }
