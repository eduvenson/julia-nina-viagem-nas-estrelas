import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('test-results/visual', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  if (process.env.LEGACY_INDEX_UNDER_TEST) {
    const body = await readFile(process.env.LEGACY_INDEX_UNDER_TEST, 'utf8');
    await page.route('**/index.html', route => route.fulfill({ contentType: 'text/html', body }));
  }
  await page.goto(`${process.env.BASE_URL || 'http://127.0.0.1:4173'}/index.html`);
  const link = page.locator('.new-adventure-link, #welcome a[href="aventura.html"]');
  await link.waitFor({ state: 'visible' });
  const box = await link.boundingBox(); assert.ok(box.y >= 0 && box.y + box.height <= 390, 'CTA da nova fase precisa estar na tela horizontal');
  await page.screenshot({ path: 'test-results/visual/entrada-horizontal.png' });
  await link.tap({ timeout: 5000 }); await page.waitForFunction(() => window.aventura);
  assert.match(page.url(), /aventura\.html/); console.log('ENTRADA PELA ABERTURA MOBILE HORIZONTAL: PASSOU');
} finally { await browser.close(); }
