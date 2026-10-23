import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { makeState, tick, act, damage } = await import(process.env.CORE_UNDER_TEST ? pathToFileURL(process.env.CORE_UNDER_TEST).href : '../aventura/core.js');

test('regressão R3: ficar parado e segurar tiro na nave perde antes de vencer', () => {
  const s = makeState(1);
  for (let n = 0; n < 3500 && s.mode === 'playing'; n++) { act(s); tick(s, {}, .02); }
  assert.equal(s.mode, 'retry'); assert.equal(s.hearts, 0); assert.ok(s.count < s.stage.goal); assert.ok(s.time < 25);
});
test('desviar permite vencer três ondas, com duas trajetórias diferentes e sem mutar a simulação', () => {
  for (const frequency of [.95, 1.15]) {
    const s = makeState(1);
    for (let n = 0; n < 3500 && s.mode === 'playing'; n++) {
      act(s); const desired = Math.sin(s.time * frequency) * 5.8;
      tick(s, { x: Math.max(-1, Math.min(1, (desired - s.x) * 2)) }, .02);
    }
    assert.equal(s.mode, 'complete', `trajetória ${frequency}`); assert.equal(s.wave, 2); assert.equal(s.count, 9); assert.ok(s.hearts > 0);
  }
});
test('regressão R3: três impactos esgotam vidas, sem escudo automático escondido', () => {
  const s = makeState(1); s.time = 20;
  assert.equal(s.hearts, 3);
  for (let i = 0; i < 3; i++) { s.invincible = 0; damage(s); }
  assert.equal(s.mode, 'retry'); assert.equal(s.lossReason, 'hearts');
  const retry = makeState(s.index, s.leader); assert.equal(retry.hearts, 3); assert.equal(retry.time, 0); assert.equal(retry.count, 0);
});
test('regressão R3: acabar o tempo também perde e pausa não consome o cronômetro', () => {
  const s = makeState(2); s.mode = 'paused'; const before = s.timeLeft; tick(s, {}, .05); assert.equal(s.timeLeft, before);
  s.mode = 'playing'; s.time = s.timeLimit - .01; tick(s, {}, .05);
  assert.equal(s.mode, 'retry'); assert.equal(s.lossReason, 'time'); assert.equal(s.hearts, 0);
});
test('perigos têm posição física variável na corrida e nos patins', () => {
  for (const index of [2, 5]) {
    const s = makeState(index), before = s.obstacles.map(o => o.x);
    for (let i = 0; i < 50; i++) tick(s, {}, .02);
    assert.ok(s.obstacles.some((o, i) => Math.abs(o.x - before[i]) > .3));
  }
});
test('salto com os pés acima do bloco não sofre dano por uma altura invisível', () => {
  const s = makeState(2); const obstacle = s.obstacles[0]; s.x = obstacle.x; s.d = obstacle.d; s.y = .84;
  tick(s, {}, .02); assert.equal(s.hearts, 3);
});
