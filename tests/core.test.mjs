import test from 'node:test';
import assert from 'node:assert/strict';
import { makeState, tick, act, jump, damage, readSave, saveData, STAGES, DOGS } from '../aventura/core.js';
const advance = (s, seconds, input = {}) => { for (let n = 0; n < Math.round(seconds * 50); n++) tick(s, input, .02); };

test('a aventura contém toda a sequência e os cinco cães com os vínculos informados', () => {
  assert.deepEqual(STAGES.map(s => s.id), ['sol', 'espaco', 'casa', 'dubai', 'valdomeira', 'irigoyen', 'festa']);
  assert.deepEqual(DOGS.filter(d => d.owner === 'nina').map(d => d.name), ['Marcha', 'Chucha', 'Luca']);
  assert.deepEqual(DOGS.filter(d => d.owner === 'julia').map(d => d.name), ['Jujuba', 'Bidu']);
});
test('nenhuma fase de percurso termina só por alcançar a chegada', () => {
  for (const i of [0, 2, 5]) { const s = makeState(i); s.d = s.stage.length; tick(s, {}, .02); assert.equal(s.mode, 'playing'); }
});
test('coletar não duplica pontos e a vitória exige objetivo e chegada', () => {
  const s = makeState(0); for (const t of s.targets) { s.x = t.x; s.d = t.d; tick(s, {}, .02); tick(s, {}, .02); }
  assert.equal(s.count, 3); assert.equal(s.mode, 'playing'); s.d = s.stage.length; tick(s, {}, .02); assert.equal(s.mode, 'complete');
  act(s); tick(s, { forward: 1 }, .05); assert.equal(s.count, 3);
});
test('bolhas viajam antes de acertar, e completar exige vencer as duas ondas', () => {
  const s = makeState(1); act(s); assert.equal(s.count, 0); assert.equal(s.shots.length, 1);
  for (let n = 0; n < 600 && s.mode === 'playing'; n++) { if (n % 16 === 0) act(s); tick(s, {}, .02); }
  assert.equal(s.count, 6); assert.equal(s.wave, 1); assert.equal(s.mode, 'complete');
});
test('colisão tira um coração, respeita invulnerabilidade e permite recomeçar', () => {
  const s = makeState(2); const o = s.obstacles[0]; s.x = o.x; s.d = o.d;
  tick(s, {}, .02); assert.equal(s.hearts, 4); advance(s, 1); assert.equal(s.hearts, 4);
  for (let i = 0; i < 4; i++) { s.invincible = 0; damage(s); }
  assert.equal(s.mode, 'retry'); const retry = makeState(s.index); assert.equal(retry.hearts, 5); assert.equal(retry.index, 2);
});
test('pular passa acima do obstáculo e volta ao chão', () => {
  const s = makeState(2); jump(s); advance(s, .2); assert.ok(s.y > .85);
  s.x = s.obstacles[0].x; s.d = s.obstacles[0].d; tick(s, {}, .02); assert.equal(s.hearts, 5);
  s.x = 7; advance(s, 2); assert.equal(s.y, 0); assert.equal(s.vy, 0);
});
test('pesca distingue lançamento, puxada antecipada, mordida e janela perdida', () => {
  const s = makeState(4); s.x = -2; s.d = 6; act(s); assert.equal(s.fish.phase, 'waiting'); advance(s, .4); act(s); assert.equal(s.count, 0); assert.equal(s.fish.phase, 'idle');
  advance(s, .4); act(s); advance(s, 1.3); assert.equal(s.fish.phase, 'bite'); act(s); assert.equal(s.count, 1);
  advance(s, 2.3); act(s); assert.equal(s.fish.phase, 'waiting'); advance(s, 3.5); assert.equal(s.fish.phase, 'idle'); assert.equal(s.count, 1); assert.ok(s.events.some(e => e.type === 'miss'));
});
test('cinco capturas corretas completam a pesca sem punir erros', () => {
  const s = makeState(4); for (const spot of s.fishingSpots) { s.x = spot.x; s.d = spot.d; for (let i = 0; i < spot.quota; i++) { advance(s, 2.3); act(s); while (s.fish.phase === 'waiting') tick(s, {}, .02); act(s); advance(s, 2.3); } }
  assert.equal(s.mode, 'complete'); assert.equal(s.count, 5); assert.equal(s.hearts, 5);
});
test('movimento diagonal tem mesma velocidade, limites e delta limitado', () => {
  const a = makeState(), b = makeState(); tick(a, { forward: 1 }, .05); tick(b, { forward: 1, x: 1 }, .05);
  assert.ok(Math.abs(a.d - Math.hypot(b.x, b.d)) < .001);
  tick(a, { forward: 1 }, 1000); assert.ok(a.d <= .5); advance(a, 20, { x: 1 }); assert.equal(a.x, 7);
});
test('pause/complete/retry impedem qualquer avanço do motor', () => {
  for (const mode of ['paused', 'complete', 'retry']) { const s = makeState(); s.mode = mode; advance(s, 1, { forward: 1 }); assert.equal(s.d, 0); assert.equal(s.time, 0); }
});
test('save malformado, fora do intervalo, versão antiga e tipo incorreto são descartados', () => {
  for (const raw of ['undefined', '{}', 'null', '{"version":1,"stage":99}', '{"version":1,"stage":-1}', '{"version":1,"stage":"3"}', '{"version":2,"stage":0}', '{"version":1,"stage":2.5}']) assert.equal(readSave(raw), null);
  for (let i = 0; i < 7; i++) assert.deepEqual(readSave(JSON.stringify(saveData(i))), saveData(i));
});
test('festa só começa após os seis trechos e nenhuma ação cria nova pontuação', () => {
  const s = makeState(6); assert.equal(s.mode, 'party'); act(s); assert.equal(s.events[0].type, 'celebrate'); assert.equal(s.count, 0);
});
