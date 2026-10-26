import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('player scores survive reloads and the downloaded file includes all players', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Ona Sol', 'Pau']) {
    await page.getByLabel('Nom del jugador').fill(name);
    await page.getByRole('button', { name: /Començar l’aventura/ }).click();
    await page.keyboard.down('ArrowRight');
    await expect(page.locator('#score')).not.toHaveText('0 PTS', { timeout: 6000 });
    await page.keyboard.up('ArrowRight');
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
  expect(shell.y + shell.height).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/gamer-controls-landscape.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.screenshot({ path: 'test-results/gamer-controls-portrait.png' });
  await context.close();
});
