import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const levels = JSON.parse(await readFile('src/data/levels.json', 'utf8'));
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const level of levels) {
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('button', { name: 'Elegir capítulo' }).click();
    if (level.id === 'baby') await page.screenshot({ path: 'test-results/album.png', fullPage: true });
    await page.getByRole('button', { name: level.title, exact: false }).click();
    await page.waitForTimeout(650);
    await page.screenshot({ path: `test-results/preview-${level.id}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Vista previa de ${levels.length} capítulos sin errores de navegador.`);
} finally { await browser.close(); }
