import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = 'http://127.0.0.1:4173';
try {
  // Save corrompido não permite pular a história nem impede a partida.
  let context = await browser.newContext(); let page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('nina-julia-aventura-v1', '{"version":1,"stage":99}'));
  await page.goto(`${base}/aventura.html`); await page.waitForFunction(() => window.aventura);
  assert.equal(await page.locator('#resume').isVisible(), false); await page.locator('#start').click(); await page.locator('#choose-julia').click(); assert.equal((await page.evaluate(() => window.aventura.snapshot())).index, 0);
  await context.close(); console.log('SAVE INVÁLIDO OK');
  // Safari em modo restrito / storage indisponível: partida e controles ainda funcionam.
  context = await browser.newContext(); page = await context.newPage();
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('Negado', 'SecurityError'); }; Storage.prototype.setItem = () => { throw new DOMException('Negado', 'SecurityError'); }; });
  await page.goto(`${base}/aventura.html`); await page.waitForFunction(() => window.aventura); await page.locator('#start').click(); await page.locator('#choose-julia').click(); await page.locator('#begin').click();
  await page.keyboard.down('w'); await page.waitForTimeout(180); await page.keyboard.up('w');
  assert.ok((await page.evaluate(() => window.aventura.snapshot())).d > .2); await context.close(); console.log('STORAGE NEGADO OK');
  // Falta de WebGL tem mensagem e saída para o jogo antigo.
  context = await browser.newContext(); page = await context.newPage();
  await page.addInitScript(() => { const old = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : old.call(this, type, ...args); }; });
  await page.goto(`${base}/aventura.html`); await page.locator('#error').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#loading').isVisible(), false); assert.equal(await page.locator('#error a').getAttribute('href'), 'index.html');
  await context.close(); console.log('WEBGL INDISPONÍVEL OK');
  // Falha ao baixar módulo: mensagem em vez de carregamento infinito.
  context = await browser.newContext({ serviceWorkers: 'block' }); page = await context.newPage();
  await page.route('**/aventura/world.js', route => route.abort()); await page.goto(`${base}/aventura.html`);
  await page.locator('#error').waitFor({ state: 'visible' }); assert.equal(await page.locator('#loading').isVisible(), false);
  await context.close(); console.log('MÓDULO INDISPONÍVEL OK');
  // O seletor antigo continua oferecendo as três fases e a nova aventura.
  context = await browser.newContext(); page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/index.html`); await page.locator('#startBtn').click(); await page.locator('#cJ').click(); await page.locator('#pkG').click(); await page.locator('#skipBtn').click();
  for (const id of ['ph1', 'ph2', 'ph3', 'ph4']) assert.equal(await page.locator(`#${id}`).isVisible(), true);
  await page.locator('#ph4').click(); await page.waitForFunction(() => window.aventura); assert.deepEqual(errors, []);
  await context.close(); console.log('ENTRADA PELO JOGO ANTIGO OK');
} finally { await browser.close(); }
