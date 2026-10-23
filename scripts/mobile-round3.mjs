import { chromium, webkit, devices } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/rodada3', { recursive: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
for (const [name, engine, launchOptions] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  const browser = await engine.launch({ ...launchOptions, headless: true });
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${base}/aventura.html`); await page.waitForFunction(() => window.aventura);
    assert.equal(await page.locator('#rotate-hint').isVisible(), true);
    await page.screenshot({ path: `test-results/rodada3/${name}-rotate.png` });
    await page.setViewportSize({ width: 844, height: 390 }); await page.locator('#rotate-hint').waitFor({ state: 'hidden' });
    await page.locator('#welcome-sound').tap();
    await page.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing' && window.aventura.snapshot().audio.currentTime > .05);
    await page.locator('#start').tap(); await page.locator('#choose-nina').tap(); await page.locator('#begin').tap();
    const hud = await page.locator('.mission').boundingBox(); assert.ok(hud.y + hud.height <= 64, `${name}: HUD precisa liberar o cenário`);
    await page.locator('#objective-toggle').tap(); assert.equal(await page.locator('#objective-detail').isVisible(), true); const objectiveTime=await page.evaluate(()=>window.aventura.snapshot().time); await page.waitForTimeout(180); assert.equal(await page.evaluate(()=>window.aventura.snapshot().time),objectiveTime); await page.locator('#objective-toggle').tap();
    await page.screenshot({ path: `test-results/rodada3/${name}-hud.png` });
    await page.locator('#soundtrack').evaluate(audio => audio.pause());
    await page.locator('#audio-recover').waitFor({ state: 'visible' }); await page.locator('#audio-recover').tap();
    await page.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing' && !window.aventura.snapshot().audio.paused);
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('#rotate-hint').waitFor({ state: 'visible' });
    const paused = await page.evaluate(() => window.aventura.snapshot().time); await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.aventura.snapshot().time), paused); assert.equal(await page.locator('#soundtrack').evaluate(a => a.paused), true);
    await page.setViewportSize({ width: 844, height: 390 }); await page.locator('#rotate-hint').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => window.aventura.snapshot().phase), 'panel');
    await page.locator('#panel-primary').tap(); await page.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing');
    assert.equal(await page.evaluate(() => window.aventura.snapshot().phase), 'play');
    await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true); await page.reload(); await page.waitForFunction(() => window.aventura); await page.locator('#resume').tap(); await page.locator('#begin').tap();
    await page.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing' && window.aventura.snapshot().audio.currentTime > .05);
    const range = await page.evaluate(async () => { const r = await fetch('aventura/audio/adventure.mp3', { headers: { Range: 'bytes=0-15' } }); return { status: r.status, length: (await r.arrayBuffer()).byteLength }; });
    assert.deepEqual(range, {status:206,length:16}); assert.deepEqual(errors, []);
    console.log(`${name}: primeira abertura, rotação, HUD <=64px, áudio nativo, interrupção e retomada PASSARAM`);
    await context.close();
    if (name === 'chrome') {
      const denied = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
      await denied.addInitScript(() => { const play = HTMLMediaElement.prototype.play; let first = true; HTMLMediaElement.prototype.play = function() { if (first) { first = false; return Promise.reject(new DOMException('Sem gesto', 'NotAllowedError')); } return play.call(this); }; });
      const blocked = await denied.newPage(); await blocked.goto(`${base}/aventura.html`); await blocked.waitForFunction(() => window.aventura);
      await blocked.locator('#welcome-sound').tap(); await blocked.locator('#audio-recover').waitFor({ state: 'visible' });
      assert.equal(await blocked.evaluate(() => window.aventura.snapshot().audio.playback), 'blocked');
      await blocked.locator('#audio-recover').tap(); await blocked.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing');
      await denied.close(); console.log('Bloqueio de reprodução simulado: feedback e recuperação por toque PASSARAM');
      const lossContext = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
      await lossContext.addInitScript(() => localStorage.setItem('nina-julia-aventura-v1', JSON.stringify({ version: 1, stage: 1, leader: 'nina' })));
      const loss = await lossContext.newPage(); await loss.goto(`${base}/aventura.html`); await loss.waitForFunction(() => window.aventura);
      await loss.locator('#resume').tap(); await loss.locator('#begin').tap(); await loss.keyboard.down(' ');
      await loss.waitForFunction(() => window.aventura.snapshot().phase === 'panel', null, { timeout: 45000 }); await loss.keyboard.up(' ');
      const state = await loss.evaluate(() => window.aventura.snapshot()); assert.equal(state.mode, 'retry'); assert.equal(state.hearts, 0); assert.ok(state.count < 9);
      assert.equal(await loss.locator('#panel-title').textContent(), 'Fim da missão');
      await loss.screenshot({ path: 'test-results/rodada3/derrota-nave.png' });
      await loss.locator('#panel-primary').tap(); assert.equal(await loss.evaluate(() => window.aventura.snapshot().index), 1);
      assert.equal(await loss.evaluate(() => window.aventura.snapshot().hearts), 3); assert.equal(await loss.evaluate(() => window.aventura.snapshot().leader), 'nina');
      await lossContext.close(); console.log('Nave parada atirando: DERROTA real; retry só do trecho, com Nina e três corações: PASSOU');
    }
  } catch (error) { console.error(name, error); process.exitCode = 1; }
  finally { await browser.close(); }
}
