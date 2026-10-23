import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  if (process.env.STYLE_UNDER_TEST) {
    const body = await readFile(process.env.STYLE_UNDER_TEST, 'utf8');
    await page.route('**/aventura/style.css', route => route.fulfill({ contentType: 'text/css', body }));
  }
  await page.goto('http://127.0.0.1:4173/aventura.html'); await page.waitForFunction(() => window.aventura);
  await page.locator('#start').tap(); await page.locator('#choose-nina').tap(); await page.locator('#begin').tap();
  const mission = await page.locator('.mission').boundingBox();
  assert.ok(mission.y + mission.height <= 64, `HUD cobre o jogo: fundo em ${mission.y + mission.height}px`);
  await page.locator('#objective-toggle').tap(); const time = await page.evaluate(() => window.aventura.snapshot().time);
  await page.waitForTimeout(150); assert.equal(await page.evaluate(() => window.aventura.snapshot().time), time);
  assert.equal(await page.locator('#objective-detail').isVisible(), true); console.log('HUD compacto e objetivo completo sem consumir o tempo: PASSARAM');
} finally { await browser.close(); }
