import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

await mkdir('test-results/journey', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage(), errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const cdp = await context.newCDPSession(page), fingers = new Map();
async function touch(id, x, y) {
  const existed = fingers.has(id); fingers.set(id, { id, x, y });
  await cdp.send('Input.dispatchTouchEvent', { type: existed ? 'touchMove' : 'touchStart', touchPoints: [...fingers.values()] });
}
async function release(id) {
  if (!fingers.has(id)) return; const ended = fingers.get(id); fingers.delete(id);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: fingers.size ? [ended] : [] });
}
async function tap(id) {
  const r = await page.locator(`#${id}`).boundingBox(); assert.ok(r, `Botão ${id} visível`);
  await touch(2, r.x + r.width / 2, r.y + r.height / 2); await release(2);
}
const snapshot = () => page.evaluate(() => window.aventura.snapshot());
async function moveTo(x, d) {
  const r = await page.locator('#joystick').boundingBox(); assert.ok(r);
  let lastJump = 0;
  for (let n = 0; n < 350; n++) {
    const s = await snapshot();
    if (s.mode === 'complete') { await release(1); return; }
    assert.equal(s.phase, 'play', `Movimento não pode ficar preso: ${JSON.stringify(s)}`);
    const dx = x - s.x, dd = d - s.d;
    if (Math.abs(dx) < .45 && Math.abs(dd) < .45) { await release(1); return; }
    const len = Math.max(.9, Math.hypot(dx, dd));
    await touch(1, r.x + r.width / 2 + dx / len * 32, r.y + r.height / 2 - dd / len * 32);
    const danger = s.obstacles.some(o => Math.abs(o.x - s.x) < 2 && o.d - s.d > -.4 && o.d - s.d < (s.index === 5 ? 3.2 : 2.4));
    if (danger && s.y === 0 && Date.now() - lastJump > 600 && s.index !== 1) { await tap('jump'); lastJump = Date.now(); }
    await page.waitForTimeout(75);
  }
  throw new Error(`Não chegou em ${x},${d}: ${JSON.stringify(await snapshot())}`);
}
async function waitPhase(phase) { await page.waitForFunction(p => window.aventura.snapshot().phase === p, phase); }
try {
  await page.goto('http://127.0.0.1:4173/aventura.html'); await page.waitForFunction(() => window.aventura);
  await page.locator('#start').tap(); await page.locator('#choose-nina').tap(); await page.locator('#begin').tap();
  assert.equal((await snapshot()).leader, 'nina');
  // Multitoque: movimento e salto simultâneos; cancelar toque também solta o analógico.
  const stick = await page.locator('#joystick').boundingBox();
  await touch(1, stick.x + stick.width / 2, stick.y + stick.height / 2 - 30); await tap('jump');
  await page.waitForTimeout(180); let check = await snapshot(); assert.ok(check.d > .2 && check.y > .3, 'Analógico e pulo funcionam juntos');
  await release(1); const stopped = (await snapshot()).d; await page.waitForTimeout(140); assert.ok(Math.abs((await snapshot()).d - stopped) < .05);
  // Câmera por arraste não aciona movimento; volta ao mesmo ângulo para o percurso.
  await touch(3, 550, 190); await touch(3, 600, 190); await release(3); assert.ok(Math.abs((await snapshot()).yaw) > .2);
  await touch(3, 600, 190); await touch(3, 550, 190); await release(3); assert.ok(Math.abs((await snapshot()).yaw) < .01);
  // Pausa congela o mundo, preferências são reais e não mudam a etapa.
  await page.locator('#pause').tap(); const paused = await snapshot(); await page.waitForTimeout(160);
  assert.equal((await snapshot()).d, paused.d); await page.locator('[data-lang="es"]').last().tap();
  assert.equal(await page.locator('html').getAttribute('lang'), 'es-AR');
  await page.locator('[data-lang="pt"]').last().tap(); await page.locator('#panel-primary').tap();
  for (let index = 0; index < 6; index++) {
    let s = await snapshot(); assert.equal(s.index, index); console.log(`JOGANDO ${index}: ${await page.locator('#stage-title').textContent()}`);
    await page.waitForFunction(() => window.aventura.snapshot().audio.playback === 'playing' && window.aventura.snapshot().audio.currentTime > .05);
    if ([0, 2, 5].includes(index)) {
      if (index === 2 || index === 5) await tap('action');
      const targets = s.targets;
      for (const target of targets) await moveTo(target.x, target.d);
      await moveTo(0, [34, 34, 52, 30, 12, 64][index]);
    } else if ([1, 3].includes(index)) {
      // Espaço contínuo no voo e botão de ação mantido no toque em Dubai.
      if (index === 1) await page.keyboard.down(' ');
      else { const r = await page.locator('#action').boundingBox(); await touch(2, r.x + r.width / 2, r.y + r.height / 2); }
      for (let n = 0; n < 500; n++) {
        s = await snapshot(); if (s.mode === 'complete') break;
        assert.equal(s.mode, 'playing', 'Batalha permite vencer sem ficar travada');
        const r = await page.locator('#joystick').boundingBox();
        const desiredX = Math.sin(s.time * (index === 1 ? 1.15 : .85)) * (index === 1 ? 5.8 : 4.5);
        const worldX = Math.max(-1, Math.min(1, (desiredX - s.x) * 2));
        const worldForward = index === 3 ? Math.max(-1, Math.min(1, (7 - s.d) * 2)) : 0;
        const screenX = worldX * Math.cos(s.yaw) + worldForward * Math.sin(s.yaw);
        const screenForward = -worldX * Math.sin(s.yaw) + worldForward * Math.cos(s.yaw);
        await touch(1, r.x + r.width / 2 + screenX * 34, r.y + r.height / 2 - screenForward * 34);
        if (index === 3 && s.y === 0 && n % 12 === 0) {
          await release(2); await tap('jump'); const action = await page.locator('#action').boundingBox(); await touch(2, action.x + action.width / 2, action.y + action.height / 2);
        }
        await page.waitForTimeout(80);
      }
      await page.keyboard.up(' '); await release(1); await release(2);
    } else {
      // Rota sobre plataformas reais, três saltos e quotas em três pontos.
      await moveTo(-2, 6);
      await tap('action'); await page.waitForTimeout(400); await tap('action'); assert.equal((await snapshot()).count, 0);
      await page.waitForTimeout(360);
      const catchFish = async quota => { for (let n = 0; n < quota; n++) { await page.waitForFunction(() => window.aventura.snapshot().fish.phase === 'idle' && window.aventura.snapshot().cooldown === 0); await tap('action'); assert.equal((await snapshot()).fish.phase, 'waiting', 'Lançamento precisa iniciar após toque'); await page.waitForFunction(() => window.aventura.snapshot().fish.phase === 'bite'); await tap('action'); await page.waitForFunction(() => window.aventura.snapshot().mode === 'complete' || window.aventura.snapshot().fish.phase === 'idle' && window.aventura.snapshot().cooldown === 0); } };
      await catchFish(2);
      for (const [x, d] of [[-3,10.7],[-3,11.1]]) await moveTo(x,d);
      const jumpGap = async (x, from, to) => {
        await moveTo(x,from); const r=await page.locator('#joystick').boundingBox();
        await touch(1,r.x+r.width/2,r.y+r.height/2-32); await tap('jump');
        await page.waitForFunction(target=>window.aventura.snapshot().d>target,to); await release(1);
      };
      await jumpGap(-3,11.1,14.4); await moveTo(-3,19); await moveTo(3,20); await moveTo(3,25.9);
      await jumpGap(3,26,29.3); await moveTo(3,34); await moveTo(0,34); await catchFish(2);
      await moveTo(-2,35); await moveTo(-2,40);
      await jumpGap(-2,40,43.3); await moveTo(-2,49); await moveTo(0,52); await catchFish(1);
    }
    await waitPhase('panel'); s = await snapshot(); assert.equal(s.mode, 'complete');
    assert.equal(s.count, [3, 9, 3, 6, 5, 5][index]);
    await page.screenshot({ path: `test-results/journey/${index}-concluido.png` });
    console.log(`CONCLUÍDO ${index}: ${s.count} objetivos, ${s.hearts} corações`);
    await page.locator('#panel-primary').tap();
    if (index < 5) await page.locator('#begin').tap();
  }
  await waitPhase('party'); assert.equal((await snapshot()).index, 6);
  await page.locator('#celebrate').tap(); await page.screenshot({ path: 'test-results/journey/aniversario-mobile.png' });
  const audio = (await snapshot()).audio; assert.equal(audio.playback, 'playing'); assert.equal(audio.theme, 'birthday');
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('nina-julia-aventura-v1'))); assert.equal(save.completed, true);
  await page.reload(); await page.waitForFunction(() => window.aventura); await page.locator('#resume').tap(); await waitPhase('party');
  console.log('RETOMADA DO ANIVERSÁRIO OK');
  // Offline real, depois da instalação do cache completo; nenhum mock de rede.
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true); await page.reload(); await page.waitForFunction(() => window.aventura); await page.locator('#resume').tap(); await waitPhase('party');
  console.log('OFFLINE REAL OK'); await context.setOffline(false);
  assert.deepEqual(errors, []); console.log('PASSOU: aventura completa no celular horizontal, multitoque, câmera, pausa, idioma, áudio, retomada e offline.');
} catch (error) {
  await page.screenshot({ path: 'test-results/journey/falha.png' }).catch(() => {});
  console.error(error); console.error('ESTADO', await snapshot().catch(() => null)); process.exitCode = 1;
} finally { await browser.close(); }
