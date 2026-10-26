import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const input = await readFile('assets/adventure/garden-terrain-v1.png');
  const output = await page.evaluate(async base64 => {
    const image = new Image(); image.src = 'data:image/png;base64,' + base64; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(image, 0, 0, 256, 256);
    return canvas.toDataURL('image/webp', .97).split(',')[1];
  }, input.toString('base64'));
  await writeFile('assets/adventure/garden-terrain-v1.webp', Buffer.from(output, 'base64'));
} finally { await browser.close(); }
