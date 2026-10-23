import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const core = await import(process.env.CORE_UNDER_TEST ? pathToFileURL(process.env.CORE_UNDER_TEST).href : '../aventura/core.js');
const { makeState, tick, act } = core;
import {dogPose} from '../aventura/motion.js';
test('regressão R4: trocar transfere o controle sem teleportar os corpos nem apagar objetivos', () => {
 const s=makeState(0,'julia'); s.x=3; s.d=10; s.helper.x=-2; s.helper.d=6; s.count=1;
 assert.equal(typeof core.swapLeader,'function'); assert.equal(core.swapLeader(s),true);
 assert.equal(s.leader,'nina'); assert.deepEqual([s.x,s.d,s.helper.x,s.helper.d],[ -2,6,3,10]); assert.equal(s.count,1);
 assert.equal(core.swapLeader(makeState(1)),false);
});
test('regressão R4: amiga mantém distância e evita empilhar as duas fora de pontes estreitas', () => {
 const s=makeState(0); s.d=15;
 for(let n=0;n<150;n++) tick(s,{},.02);
 assert.ok(Math.hypot(s.x-s.helper.x,s.d-s.helper.d)>4);
});
test('brinquedo buscado pelo dog dá bônus uma única vez e não substitui a missão', () => {
 const s=makeState(0); act(s); assert.ok(s.dogFetch); const before=s.timeLimit;
 for(let n=0;n<80;n++) tick(s,{},.02);
 assert.equal(s.bonusCount,1); assert.equal(s.count,0); assert.equal(s.mode,'playing'); assert.equal(s.timeLimit,before+3);
 for(let n=0;n<80;n++) tick(s,{},.02); assert.equal(s.bonusCount,1); assert.equal(s.timeLimit,before+3);
});
test('arcos exigem altura, combo tem limite e rampa lança em vez de dar vitória automática', () => {
 const s=makeState(5); const b=s.bonuses[0]; s.x=b.x;s.d=b.d; tick(s,{},.02); assert.equal(s.bonusCount,0);
 s.y=1; tick(s,{},.02); assert.equal(s.bonusCount,1); assert.equal(s.count,0);
 const ramp=makeState(5); ramp.d=16.2; tick(ramp,{forward:1},.02); assert.ok(ramp.vy>0);assert.equal(ramp.bonusCount,0);
});
test('cinco dogs comemoram com ações diferentes e mantêm nomes intermitentes', () => {
 const poses=Array.from({length:5},(_,i)=>dogPose(i,1,false,false,true));
 assert.equal(new Set(poses.map(p=>p.activity)).size,5); assert.ok(poses.filter(p=>p.showName).length<=1);
});

test('dogs buscam automaticamente ao se aproximar, com ida antes da recompensa', () => {
 const s=makeState(2); const b=s.bonuses[0];s.x=b.x;s.d=b.d-2;
 tick(s,{},.02);assert.ok(s.dogFetch);assert.equal(s.bonusCount,0);
 for(let n=0;n<75;n++)tick(s,{},.02);
 assert.equal(s.bonusCount,1);assert.equal(s.events.filter(e=>e.type==='dogToy').length,1);
});

test('regressão R4: troca não abandona a vara durante espera, mordida ou recolhimento', () => {
 for (const phase of ['waiting','bite','reeling']) {
  const s=makeState(4);s.d=6;s.fish={phase,timer:1,spot:0};const position=[s.x,s.d,s.helper.x,s.helper.d];
  assert.equal(core.swapLeader(s),false);assert.equal(s.leader,'julia');assert.deepEqual([s.x,s.d,s.helper.x,s.helper.d],position);
  tick(s,{},.02);assert.equal(s.fish.phase,phase);assert.ok(!s.events.some(e=>e.type==='findSpot'));
 }
 const idle=makeState(4);assert.equal(core.swapLeader(idle),true);
});
