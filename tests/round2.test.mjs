import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const core = await import(process.env.CORE_UNDER_TEST ? pathToFileURL(process.env.CORE_UNDER_TEST).href : '../aventura/core.js');
const { makeState, tick, act, primaryKey, FISH_GAPS, readSave, saveData } = core;
const advance = (s, seconds, input = {}) => { for (let n = 0; n < Math.round(seconds * 50); n++) tick(s, input, .02); };

test('regressão: espaço dispara na nave, cria projétil e não dá ponto instantâneo', () => {
  const s = makeState(1); primaryKey(s); assert.equal(s.count, 0); assert.equal(s.shots.length, 1);
  assert.equal(s.shots[0].owner, 'player'); advance(s, 1.4); assert.ok(s.count > 0);
});
test('regressão: aliens mudam de posição, avisam antes de atirar e atingem nave parada', () => {
  const s = makeState(1); const x = s.targets[0].x; advance(s, .2); assert.notEqual(s.targets[0].x, x);
  assert.equal(s.hearts, 5); advance(s, .2); assert.ok(s.events.some(e => e.type === 'warning'));
  assert.equal(s.shots.filter(p => p.owner === 'alien').length, 0);
  advance(s, 7); assert.ok(s.events.some(e => e.type === 'alienShot')); assert.ok(s.hearts < 5);
});
test('regressão: zumbi prepara o bote antes de atacar e pode acertar personagem parada', () => {
  const s = makeState(3); s.targets.forEach(t => { t.active = t.id === 0; }); s.targets[0].x = 0; s.targets[0].d = 3;
  advance(s, .5); assert.equal(s.targets[0].phase, 'windup'); assert.equal(s.hearts, 5);
  advance(s, 1.3); assert.ok(s.hearts < 5); assert.ok(s.events.some(e => e.type === 'zombieWarning'));
});
test('regressão: pesca requer explorar pontos diferentes, não cinco cliques no mesmo lugar', () => {
  const s = makeState(4); act(s); assert.equal(s.fish.phase, 'idle'); assert.equal(s.count, 0);
  assert.ok(s.fishingSpots.length >= 3); assert.ok(FISH_GAPS.length >= 3);
  s.x = -2; s.d = 6; advance(s, .3); act(s); assert.equal(s.fish.phase, 'waiting');
});
test('escolha da líder e save persistem Nina ou Júlia e mantêm compatibilidade', () => {
  assert.equal(makeState(0, 'nina').leader, 'nina');
  assert.equal(readSave(JSON.stringify(saveData(3, 'nina'))).leader, 'nina');
  assert.equal(readSave('{"version":1,"stage":3}').leader, 'julia');
});
test('pulo atravessa vão; andar no vazio volta ao checkpoint com um coração a menos', () => {
  const fall = makeState(4); fall.x = -3; fall.d = 12.7; tick(fall, {}, .02);
  assert.equal(fall.hearts, 4); assert.equal(fall.d, 0);
  const jump = makeState(4); jump.x = -3; jump.d = 11.2; core.jump(jump);
  advance(jump, .7, { forward: 1 }); assert.equal(jump.hearts, 5); assert.ok(jump.d > 13.5);
});
test('companheira segue atrás e ajuda a recolher uma estrela que a líder deixou', () => {
  const s = makeState(0, 'nina'); s.x = 4; s.d = 18; advance(s, 1);
  assert.ok(s.helper.d < s.d - 1); assert.ok(s.helper.x > s.x);
  const t = s.targets[0]; t.x = s.helper.x; t.d = s.helper.d; tick(s, {}, .02);
  assert.equal(t.hit, true); assert.equal(s.assists, 1);
});
test('projéteis respeitam limite e pausa congela ataques e posições', () => {
  const s = makeState(1); for (let i = 0; i < 100; i++) { act(s); tick(s, {}, .02); }
  assert.ok(s.shots.length <= 20); s.mode = 'paused'; const before = JSON.stringify(s); tick(s, { x: 1 }, .05); assert.equal(JSON.stringify(s), before);
});
test('animação de fisgada termina antes da vitória e não duplica o peixe', () => {
  const s = makeState(4); const spot = s.fishingSpots[2]; s.count = 4; s.x = spot.x; s.d = spot.d;
  act(s); advance(s, 1.5); assert.equal(s.fish.phase, 'bite'); act(s);
  assert.equal(s.count, 5); assert.equal(s.mode, 'playing'); assert.equal(s.fish.phase, 'reeling');
  advance(s, .4); act(s); assert.equal(s.count, 5); advance(s, 2); assert.equal(s.mode, 'complete');
});
test('o cenário de partida é o Sol, antes da órbita terrestre', () => {
  assert.equal(makeState(0).stage.id, 'sol'); assert.equal(makeState(1).stage.id, 'espaco');
});
