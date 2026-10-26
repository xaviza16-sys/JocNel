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
  await expect(page.locator('#status')).toContainText('100%', { timeout: 15000 });
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
  test.setTimeout(75000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await choose(page, 'On és la mama?');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(3000);
  await expect(page.locator('#status')).toContainText('0 salts');
  await expect(page.locator('#status')).toContainText('11%');
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
    let motoSteering = '';
    for (let i = 0; i < (level.mode === 'moto' ? 120 : 480); i++) {
      if (await page.getByRole('button', { name: /Següent:|Descobrir la invitació/ }).isVisible()) { done = true; break; }
      if (level.mode === 'moto') {
        const status = await page.locator('#status').innerText();
        const distance = Number(status.match(/(\d+)%/)?.[1] || 0) * level.race!.length / 100;
        // Follow the clear side of the promenade, crossing early before the
        // left-lane poop. Inputs are real keys, including standing after falls.
        const target = distance > 295 && distance < 375 ? 'ArrowRight' : 'ArrowLeft';
        if (target !== motoSteering) {
          if (motoSteering) await page.keyboard.up(motoSteering);
          await page.keyboard.down(target); motoSteering = target;
        }
        if (status.includes('CAIGUT')) await page.keyboard.press('Space');
      } else await page.keyboard.press('Space');
      if (i === 10) await page.screenshot({ path: `test-results/chapter-${level.id}.png`, fullPage: true });
      await page.waitForTimeout(level.mode === 'moto' ? 400 : 100);
    }
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('ArrowLeft'); await page.keyboard.up('w');
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

test('motorcycle leaves slow down, pedestrians require getting up, and poop spins then resumes on mobile', async ({ browser }) => {
  test.setTimeout(45000);
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await choose(page, 'Cap a l’escola bressol!');
  await expect(page.locator('#status')).toContainText('1 potenciadors', { timeout: 7000 });
  await expect(page.locator('#status')).toContainText('FULLES', { timeout: 5000 });
  await expect(page.locator('#status')).toContainText('CAIGUT', { timeout: 7000 });
  await page.waitForTimeout(1100);
  const fallen = await page.locator('#status').innerText();
  await page.waitForTimeout(450);
  await expect(page.locator('#status')).toHaveText(fallen);
  await page.screenshot({ path: 'test-results/promenade-fallen-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Aixecar-se', exact: true }).tap();
  await expect(page.locator('#status')).not.toContainText('CAIGUT', { timeout: 4000 });
  await expect(page.locator('#status')).toContainText('PATINANT', { timeout: 8000 });
  const spinning = await page.locator('#status').innerText();
  await page.waitForTimeout(350); await expect(page.locator('#status')).toHaveText(spinning);
  await expect(page.getByRole('button', { name: 'Tornar a començar →' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/promenade-spin-mobile.png', fullPage: true });
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('road-to-10-v1') || '{}'));
  expect(save.completed || []).not.toContain('moto');
  await expect(page.locator('#status')).not.toContainText('PATINANT', { timeout: 2500 });
  await page.waitForTimeout(500);
  await expect(page.locator('#status')).toContainText('1 potenciadors');
  await expect(page.locator('#status')).toContainText('1 caigudes');
  await expect(page.locator('#status')).toContainText('1 patinades');
  const after = Number((await page.locator('#status').innerText()).match(/(\d+)%/)?.[1]);
  expect(after).toBeGreaterThan(Number(spinning.match(/(\d+)%/)?.[1]));
  expect(errors).toEqual([]); await context.close();
});

test('hospital staff can be avoided and Nel meets his newborn brother before continuing', async ({ page }) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 844, height: 390 });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await choose(page, 'Coneixem el germanet!');
  await page.keyboard.down('ArrowRight');
  // A missed dodge returns to the checkpoint and permits another attempt.
  await expect(page.locator('#status')).toContainText('1 ensopegades', { timeout: 6000 });
  for (let i = 0; i < 90; i++) {
    if ((await page.locator('#status').innerText()).includes('GERMANET TROBAT')) break;
    await page.keyboard.press('Space'); await page.waitForTimeout(250);
  }
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#status')).toContainText('GERMANET TROBAT');
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await page.screenshot({ path: 'test-results/hospital-family-reunion.png', fullPage: true });
  await page.waitForTimeout(900);
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await expect(page.getByText(/Ja ets el germà gran, Nel!/)).toBeVisible();
  await page.getByRole('button', { name: /Següent:/ }).click();
  await expect(page.locator('#chapter')).toContainText('SURF DE NEU');
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

test('river prevents bypassing the zipline on foot and permits a safe retry', async ({ page }) => {
  test.setTimeout(45000);
  await choose(page, 'Aventura entre les capçades');
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('#status')).toContainText('1 ensopegades', { timeout: 7000 });
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#status')).toContainText('0 tirolines · 0 lianes');
  expect(Number((await page.locator('#status').innerText()).match(/(\d+)%/)?.[1])).toBeLessThan(40);
  await expect(page.getByRole('button', { name: /Següent:/ })).not.toBeVisible();
  await page.screenshot({ path: 'test-results/forest-river-retry.png', fullPage: true });
  await playForest(page);
});

test('skatepark rides four curved quarters and reaches the invitation', async ({ page }) => {
  test.setTimeout(45000);
  await choose(page, 'Al skatepark fins al nivell 10');
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 85; i++) {
    if (await page.getByRole('button', { name: /Descobrir la invitació/ }).isVisible()) break;
    await page.keyboard.press('Space'); await page.waitForTimeout(250);
    if (i === 12) await page.screenshot({ path: 'test-results/skatepark-quarter.png', fullPage: true });
  }
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#status')).toContainText('4 quarters');
  await page.getByRole('button', { name: /Descobrir la invitació/ }).click();
  await expect(page.getByRole('heading', { name: 'En Nel arriba al nivell 10!' })).toBeVisible();
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
