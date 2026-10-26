import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('shared score client uses the native browser fetch for registration, updates and ranking', async ({ page }) => {
  await page.goto('/');
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  let uploaded = false;
  await page.route('https://marcador.example.test/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    let data: object;
    if (request.method() === 'POST') data = { id: 'shared-1', token: 'test-owner-key' };
    else if (request.method() === 'PUT') {
      expect(request.headers().authorization).toBe('Bearer test-owner-key');
      expect(request.postDataJSON().chapters.baby.stats.stars).toBe(1);
      uploaded = true; data = { points: 100 };
    } else data = { runs: [{ player: 'Ona', points: 100 }] };
    await route.fulfill({ status: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  });
  const result = await page.evaluate(async () => {
    const path = '/src/score-cloud.ts';
    const { ScoreCloud } = await import(path);
    const cloud = new ScoreCloud('https://marcador.example.test');
    cloud.queue({ id: 'local-1', player: 'Ona', startedAt: new Date().toISOString(), chapters: { baby: { points: 100, stats: { progress: 20, stars: 1 } } } });
    await cloud.flush();
    return { pending: cloud.pending, runs: await cloud.list() };
  });
  expect(uploaded).toBe(true); expect(result.pending).toBe(0); expect(result.runs[0].player).toBe('Ona');
});

test('player scores survive reloads and the downloaded file includes all players', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Ona Sol', 'Pau']) {
    await page.getByLabel('Nom del jugador').fill(name);
    await page.getByRole('button', { name: /Començar l’aventura/ }).click();
    await expect(page.locator('#status')).toContainText('0 salts');
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('w');
    await expect(page.locator('#score')).not.toHaveText('0 PTS', { timeout: 6000 });
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('w');
    await page.getByRole('button', { name: 'Pausa', exact: true }).click();
    await page.getByRole('button', { name: 'Desar i acabar partida' }).click();
    await expect(page.getByRole('heading', { name: 'Puntuacions' })).toBeVisible();
    await page.getByRole('button', { name: 'Tornar a l’inici', exact: true }).click();
  }
  await page.reload();
  await expect(page.getByLabel('Nom del jugador')).toHaveValue('Pau');
  await page.getByRole('button', { name: 'Puntuacions', exact: true }).click();
  await expect(page.locator('.score-list li')).toHaveCount(2);
  await expect(page.locator('.score-list')).toContainText('Ona Sol');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descarregar puntuacions (.json)' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('puntuacions-nel.json');
  const data = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(data.format).toBe('puntuacions-nel');
  expect(data.runs.map((run: { player: string }) => run.player).sort()).toEqual(['Ona Sol', 'Pau']);
  expect(data.runs.every((run: { points: number; endedAt: string }) => run.points > 0 && run.endedAt)).toBe(true);
  const textDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descarregar fitxer de text (.txt)' }).click();
  const textDownload = await textDownloadPromise;
  expect(textDownload.suggestedFilename()).toBe('puntuacions-nel.txt');
  expect(await readFile((await textDownload.path())!, 'utf8')).toContain('Ona Sol\t100');
});

test('mobile controller shows A and B, supports held feedback and fits landscape', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: /Començar l’aventura/ }).click();
  const right = page.getByRole('button', { name: 'Moure cap a la dreta' });
  const climb = page.getByRole('button', { name: 'Grimpar', exact: true });
  await expect(right).toBeVisible(); await expect(climb).toBeVisible();
  await expect(climb.locator('.control-glyph')).toHaveText('B');
  await expect(page.getByRole('button', { name: 'Empènyer', exact: true }).locator('.control-glyph')).toHaveText('A');
  await right.dispatchEvent('pointerdown', { pointerId: 11, pointerType: 'touch' });
  await climb.dispatchEvent('pointerdown', { pointerId: 12, pointerType: 'touch' });
  await expect(right).toHaveClass(/pressed/); await expect(climb).toHaveClass(/pressed/);
  await right.dispatchEvent('pointercancel', { pointerId: 11, pointerType: 'touch' });
  await expect(right).not.toHaveClass(/pressed/); await expect(climb).toHaveClass(/pressed/);
  await climb.dispatchEvent('pointerup', { pointerId: 12, pointerType: 'touch' });
  await expect(page.locator('#touch-controls')).toBeVisible();
  for (const button of await page.locator('#touch-controls button:visible').all()) {
    const bounds = (await button.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(54);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(390);
  }
  const shell = (await page.locator('.game-shell').boundingBox())!;
  expect(shell.x).toBe(0); expect(shell.y).toBe(0); expect(shell.width).toBe(844);
  expect(shell.y + shell.height).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/gamer-controls-landscape.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.screenshot({ path: 'test-results/gamer-controls-portrait.png' });
  await context.close();
});

test('direction stick reverses while dragging and resets on pause without interrupting A/B', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await page.goto('/');
  await page.getByRole('button', { name: /Començar l’aventura/ }).click();
  await expect(page.locator('#status')).toContainText('0 salts');
  const stick = page.locator('#direction-stick'), bounds = (await stick.boundingBox())!;
  const y = bounds.y + bounds.height / 2, x = bounds.x + bounds.width / 2;
  await stick.dispatchEvent('pointerdown', { pointerId: 21, pointerType: 'touch', clientX: x + 30, clientY: y });
  await expect(stick).toHaveClass(/active/);
  await expect.poll(async () => stick.evaluate(el => parseFloat((el as HTMLElement).style.getPropertyValue('--stick-x')))).toBeGreaterThan(0);
  const percent = async () => Number((await page.locator('#status').textContent())?.match(/(\d+)%/)?.[1] || 0);
  await expect.poll(percent).toBeGreaterThan(4);
  const forward = await percent();
  const climb = page.getByRole('button', { name: 'Grimpar', exact: true });
  await climb.dispatchEvent('pointerdown', { pointerId: 22, pointerType: 'touch' });
  await stick.dispatchEvent('pointermove', { pointerId: 21, pointerType: 'touch', clientX: x - 30, clientY: y });
  await expect.poll(async () => stick.evaluate(el => parseFloat((el as HTMLElement).style.getPropertyValue('--stick-x')))).toBeLessThan(0);
  await expect(climb).toHaveClass(/pressed/);
  await expect.poll(percent).toBeLessThan(forward);
  await page.getByRole('button', { name: 'Pausa', exact: true }).click();
  const time = await page.locator('#level-time').textContent();
  await expect(stick).not.toHaveClass(/active/); await expect(page.locator('[data-action="climb"]')).not.toHaveClass(/pressed/);
  await page.waitForTimeout(1100); await expect(page.locator('#level-time')).toHaveText(time!);
  await context.close();
});
