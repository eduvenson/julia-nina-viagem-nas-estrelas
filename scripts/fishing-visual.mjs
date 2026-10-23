import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => localStorage.setItem('nina-julia-aventura-v1', JSON.stringify({ version: 1, stage: 4, leader: 'nina' })));
  await page.goto('http://127.0.0.1:4173/aventura.html'); await page.waitForFunction(() => window.aventura);
  await page.locator('#resume').tap(); await page.locator('#begin').tap();
  await page.keyboard.down('w'); await page.waitForFunction(() => window.aventura.snapshot().d > 5.5); await page.keyboard.up('w');
  await page.locator('#action').tap(); await page.waitForTimeout(250); await page.screenshot({ path: 'test-results/visual/fishing-cast.png' });
  await page.waitForFunction(() => window.aventura.snapshot().fish.phase === 'bite');
  let s = await page.evaluate(() => window.aventura.snapshot());
  assert.equal(s.fishingVisual.line, true); assert.equal(s.fishingVisual.segments, 32); assert.equal(s.fishingVisual.fish, true);
  await page.screenshot({ path: 'test-results/visual/fishing-bite.png' });
  await page.locator('#action').tap(); await page.waitForFunction(() => window.aventura.snapshot().fishingVisual.fishY > 1.3);
  await page.screenshot({ path: 'test-results/visual/fishing-reel.png' });
  s = await page.evaluate(() => window.aventura.snapshot()); assert.equal(s.fish.phase, 'reeling'); assert.equal(s.count, 1); assert.equal(s.fishingVisual.fish, true);
  await page.waitForFunction(() => window.aventura.snapshot().fish.phase === 'idle');
  assert.deepEqual(errors, []); console.log('VARA, LINHA 3D, MORDIDA, FISGADA E DEVOLUÇÃO: PASSARAM NO NAVEGADOR.');
} finally { await browser.close(); }
