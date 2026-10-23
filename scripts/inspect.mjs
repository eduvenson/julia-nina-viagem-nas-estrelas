import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/visual', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
for (const [name, viewport, touch] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 844, height: 390 }, true], ['portrait', { width: 390, height: 844 }, true]]) {
  const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:4173/aventura.html'); await page.waitForFunction(() => window.aventura);
  if (await page.locator('#rotate-hint').isVisible()) { await page.screenshot({path:`test-results/visual/${name}-rotate.png`}); await page.locator('#portrait-continue').click(); }
  await page.screenshot({ path: `test-results/visual/${name}-welcome.png` });
  await page.locator('#start').click(); await page.screenshot({ path: `test-results/visual/${name}-choose.png` }); await page.locator('#choose-julia').click(); await page.locator('#begin').click();
  await page.screenshot({ path: `test-results/visual/${name}-terra.png` });
  console.log(name, 'Terra', await page.evaluate(() => window.aventura.snapshot()));
  for (let index = 1; index <= 6; index++) {
    await page.evaluate(i => localStorage.setItem('nina-julia-aventura-v1', JSON.stringify({ version: 1, stage: i, completed: i === 6 })), index);
    await page.reload(); await page.waitForFunction(() => window.aventura); if (await page.locator('#rotate-hint').isVisible()) await page.locator('#portrait-continue').click(); await page.locator('#resume').click();
    if (index !== 6) await page.locator('#begin').click();
    await page.screenshot({ path: `test-results/visual/${name}-${index}.png` });
    const overflow = await page.evaluate(() => [...document.querySelectorAll('button,a,input')].filter(el => el.getClientRects().length).filter(el => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1; }).map(el => el.id || el.textContent));
    console.log(name, index, 'overflow', overflow, 'render', await page.evaluate(() => window.aventura.snapshot().render));
  }
  await context.close();
}
await browser.close(); console.log('ERRORS', errors); if (errors.length) process.exitCode = 1;
