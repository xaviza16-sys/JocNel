import { test, expect, type Page } from '@playwright/test';
import levels from '../src/data/levels.json' with { type: 'json' };

async function choose(page: Page, title: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Triar capítol' }).click();
  await page.getByRole('button', { name: title, exact: false }).click();
}

async function playBaby(page: Page) {
  await page.keyboard.down('ArrowRight'); await page.keyboard.down('w');
  await expect(page.locator('#status')).toContainText('1 grimpades', { timeout: 6000 });
  await page.keyboard.up('w'); await page.keyboard.down('Space');
  await expect(page.locator('#status')).toContainText('ESCALA 1 A PUNT', { timeout: 13000 });
  await page.keyboard.up('Space'); await page.keyboard.down('w');
  await expect(page.locator('#status')).toContainText('3 grimpades', { timeout: 5000 });
  await expect(page.locator('#status')).toContainText('GOS: FET', { timeout: 6000 });
  await page.keyboard.up('w'); await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: 'test-results/nel-dog.png', fullPage: true });
  await page.keyboard.down('Space'); await page.keyboard.down('ArrowRight');
  await expect(page.locator('#status')).toContainText('ESCALA 2 A PUNT', { timeout: 16000 });
  await page.keyboard.up('Space'); await page.keyboard.down('w');
  await expect(page.locator('#status')).toContainText('100%', { timeout: 9000 });
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await page.screenshot({ path: 'test-results/baby-hug-before-result.png', fullPage: true });
  await expect(page.getByRole('button', { name: /Següent:/ })).toBeVisible({ timeout: 9000 });
  await page.keyboard.up('w'); await page.keyboard.up('ArrowRight');
}

async function playForest(page: Page) {
  await page.keyboard.down('ArrowRight'); await page.keyboard.down('w');
  await expect(page.locator('#status')).toContainText('1 tirolines', { timeout: 14000 });
  await expect(page.locator('#status')).toContainText('1 lianes', { timeout: 5000 });
  await page.waitForTimeout(900); await page.screenshot({ path: 'test-results/forest-vine-one.png', fullPage: true });
  await page.keyboard.press('Space');
  await expect(page.locator('#status')).toContainText('2 lianes', { timeout: 6000 });
  await page.waitForTimeout(900); await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /Següent:/ })).toBeVisible({ timeout: 10000 });
  await page.keyboard.up('ArrowRight'); await page.keyboard.up('w');
}

test('all player interfaces use Catalan and the invitation names Nel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
  await expect(page).toHaveTitle(/Nel/);
  await expect(page.getByRole('heading', { name: 'L’aventura d’en Nel' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Sonido|Volver|Elegir|recuerdos|ESPACIO|ROAD TO|LEVEL 10/);
  await page.getByRole('button', { name: 'Triar capítol' }).click();
  await expect(page.locator('.level-card')).toHaveCount(7);
  await page.getByRole('button', { name: 'Veure la invitació ↗' }).click();
  await expect(page.getByRole('heading', { name: 'En Nel arriba al nivell 10!' })).toBeVisible();
  await expect(page.getByText('Per confirmar')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Tornar a l’inici' })).toBeVisible();
});

test('baby cannot jump and reaches mother by pushing and climbing', async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await choose(page, 'On és la mama?');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(3000);
  await expect(page.locator('#status')).toContainText('0 salts');
  await expect(page.locator('#status')).toContainText('14%');
  await page.screenshot({ path: 'test-results/baby-before-jump.png', fullPage: true });
  await page.keyboard.press('Space'); await page.waitForTimeout(300);
  await expect(page.locator('#status')).toContainText('0 salts');
  await page.keyboard.up('ArrowRight');
  await playBaby(page);
  await expect(page.locator('#status')).toContainText('GOS: FET');
  await expect(page.locator('#status')).toContainText('0 salts');
  await expect(page.getByText(/Has trobat la mama/)).toBeVisible();
  await page.screenshot({ path: 'test-results/baby-mother.png', fullPage: true });
  // Keep a clear art-review capture of the family pose behind the result panel.
  await page.locator('#overlay').evaluate(element => { element.style.visibility = 'hidden'; });
  await page.screenshot({ path: 'test-results/nel-mother-v2.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('toddler finds the toy motorcycle before continuing to the rear-view race', async ({ page }) => {
  test.setTimeout(45000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await choose(page, 'Les primeres passes');
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 75; i++) {
    if ((await page.locator('#status').innerText()).includes('MOTO TROBADA')) break;
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
  }
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#status')).toContainText('MOTO TROBADA');
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await page.waitForTimeout(850);
  await page.screenshot({ path: 'test-results/toddler-found-moto.png', fullPage: true });
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await expect(page.getByText(/Has trobat la teva moto de joguina, Nel!/)).toBeVisible();
  await page.getByRole('button', { name: /Següent: Cap a l’escola bressol/ }).click();
  await expect(page.locator('#chapter')).toContainText('LA PRIMERA MOTO');
  expect(errors).toEqual([]);
});

test('plays all seven chapters with real input and reveals the final invitation', async ({ page }) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
  await page.goto('/'); await page.getByRole('button', { name: 'Començar l’aventura! →' }).click();
  for (const level of levels) {
    await expect(page.locator('#chapter')).toHaveText(level.subtitle.toUpperCase());
    if (level.mode === 'baby') {
      await playBaby(page);
      await page.getByRole('button', { name: /Següent:/ }).click();
      continue;
    } else if (level.mode === 'nature') {
      await playForest(page);
      await page.getByRole('button', { name: /Següent:/ }).click();
      continue;
    } else if (level.mode === 'moto') {
      await expect(page.locator('#status')).toContainText('1 potenciadors', { timeout: 7000 });
      await page.screenshot({ path: 'test-results/chapter-moto.png', fullPage: true });
    } else {
      await page.keyboard.down('ArrowRight');
      if (level.mode === 'nature') await page.keyboard.down('w');
    }
    let done = false;
    for (let i = 0; i < 120; i++) {
      if (await page.getByRole('button', { name: /Següent:|Descobrir la invitació/ }).isVisible()) { done = true; break; }
      if (level.mode !== 'moto') await page.keyboard.press('Space');
      if (i === 10) await page.screenshot({ path: `test-results/chapter-${level.id}.png`, fullPage: true });
      await page.waitForTimeout(400);
    }
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('w');
    if (!done) {
      await page.screenshot({ path: `test-results/stuck-${level.id}.png`, fullPage: true });
      throw new Error(`Capítulo atascado: ${level.id}: ${await page.locator('#status').textContent()}`);
    }
    if (level.mode === 'nature') await expect(page.locator('#status')).not.toContainText('0 s grimpant');
    await page.getByRole('button', { name: /Següent:|Descobrir la invitació/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'En Nel arriba al nivell 10!' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('road-to-10-v1') || '{}').completed)).toEqual(levels.map(l => l.id));
  expect(errors).toEqual([]);
});

test('pause, chapter skip, invitation and sound work in the full campaign', async ({ page }) => {
  await choose(page, 'Les primeres passes');
  await page.getByRole('button', { name: 'Pausa', exact: true }).click();
  await page.getByRole('button', { name: 'Ometre aquest capítol →' }).click();
  await expect(page.locator('#chapter')).toContainText('LA PRIMERA MOTO');
  await page.getByRole('button', { name: 'Veure la invitació ↗' }).click();
  await expect(page.getByText('Per confirmar')).toHaveCount(3);
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tornar al joc' }).click();
  await page.getByRole('button', { name: 'Continuar jugant →' }).click();
  await expect(page.locator('#status')).toContainText('potenciadors');
  await page.getByRole('button', { name: 'Activar el so' }).click();
  await expect(page.getByRole('button', { name: 'Silenciar el so' })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading', { name: 'Al teu ritme', exact: true })).toBeVisible();
});

test('forest supports tree climbing, a zipline and jumping between two vines', async ({ page }) => {
  test.setTimeout(45000);
  await choose(page, 'Aventura entre les capçades');
  await playForest(page);
});

test('forest exit still completes after recovering on the ground without traversal counters', async ({ page }) => {
  test.setTimeout(45000);
  await choose(page, 'Aventura entre les capçades');
  await page.keyboard.down('ArrowRight');
  // Avoid the food enemies, then approach the exit walking along the ground.
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Space'); await page.waitForTimeout(350);
    const status = await page.locator('#status').innerText();
    const percent = Number(status.match(/(\d+)%/)?.[1] || 0);
    if (percent >= 81) break;
  }
  await expect(page.getByRole('button', { name: /Següent:/ })).toBeVisible({ timeout: 12000 });
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#status')).toContainText('0 tirolines · 0 lianes');
  await page.screenshot({ path: 'test-results/forest-ground-exit.png', fullPage: true });
});

test('snowboard descends a slope, jumps and can complete the run', async ({ page }) => {
  test.setTimeout(45000);
  await choose(page, 'Surf de neu: tot de baixada!');
  await expect(page.locator('#status')).toContainText('SURF DE NEU');
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 65; i++) {
    if (await page.getByRole('button', { name: /Següent:/ }).isVisible()) break;
    await page.keyboard.press('Space'); await page.waitForTimeout(400);
    if (i === 12) await page.screenshot({ path: 'test-results/snowboard-downhill.png', fullPage: true });
  }
  await page.keyboard.up('ArrowRight');
  await expect(page.getByRole('button', { name: /Següent:/ })).toBeVisible();
  await expect(page.locator('#status')).not.toContainText('Baixada 0 m');
});

test('retro music starts after a gesture and stops scheduling when muted or paused', async ({ page }) => {
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    (window as unknown as { audioVoices: number }).audioVoices = 0;
    AudioContext.prototype.createOscillator = function () { (window as unknown as { audioVoices: number }).audioVoices++; return original.call(this); };
  });
  await choose(page, 'Les primeres passes');
  const voices = () => page.evaluate(() => (window as unknown as { audioVoices: number }).audioVoices);
  expect(await voices()).toBe(0);
  await page.getByRole('button', { name: 'Activar el so' }).click(); await page.waitForTimeout(1000);
  expect(await voices()).toBeGreaterThan(6);
  await page.getByRole('button', { name: 'Pausa', exact: true }).click();
  const paused = await voices(); await page.waitForTimeout(500); expect(await voices()).toBe(paused);
  await page.getByRole('button', { name: 'Continuar jugant →' }).click(); await page.waitForTimeout(400);
  expect(await voices()).toBeGreaterThan(paused);
  await page.getByRole('button', { name: 'Silenciar el so' }).click();
  const muted = await voices(); await page.waitForTimeout(500); expect(await voices()).toBe(muted);
});

test('mobile offers simultaneous movement and jump, and a dedicated climbing button', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await choose(page, 'Les primeres passes');
  await expect(page.getByRole('button', { name: 'Saltar', exact: true })).toBeVisible();
  await expect(page.locator('.rotate-hint')).toBeVisible();
  const right = page.getByRole('button', { name: 'Moure cap a la dreta' });
  const jump = page.getByRole('button', { name: 'Saltar', exact: true });
  await right.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch' });
  await page.waitForTimeout(1600);
  await jump.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch' });
  await page.waitForTimeout(150); await jump.dispatchEvent('pointerup', { pointerId: 2, pointerType: 'touch' });
  await page.waitForTimeout(500); await right.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch' });
  await expect(page.locator('#status')).toContainText('1 salts');
  await page.screenshot({ path: 'test-results/mobile-jump.png', fullPage: true });
  await choose(page, 'On és la mama?');
  await expect(page.getByRole('button', { name: 'Empènyer', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Grimpar', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Saltar', exact: true })).toHaveCount(0);
  await choose(page, 'Aventura entre les capçades');
  await expect(page.getByRole('button', { name: 'Grimpar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Veure la invitació ↗' }).tap();
  await expect(page.getByRole('heading', { name: 'En Nel arriba al nivell 10!' })).toBeVisible();
  await context.close();
});
