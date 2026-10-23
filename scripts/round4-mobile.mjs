import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results/rodada4',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
await page.goto(`${base}/aventura.html`);await page.waitForFunction(()=>window.aventura);
await page.locator('#start').tap();await page.locator('#choose-julia').tap();await page.locator('#begin').tap();
await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');await page.waitForTimeout(200);
const before=await page.evaluate(()=>window.aventura.snapshot());
await page.locator('#swap').tap();await page.waitForFunction(()=>window.aventura.snapshot().actors.girls.find(g=>g.roleVisible)?.name==='nina');const after=await page.evaluate(()=>window.aventura.snapshot());
assert.equal(after.leader,'nina');assert.ok(Math.abs(after.x-before.helper.x)<.05);assert.ok(Math.abs(after.d-before.helper.d)<.05);
assert.equal(after.actors.girls.filter(g=>g.roleVisible).length,1);assert.equal(after.actors.girls.find(g=>g.roleVisible).name,'nina');
assert.match(await page.locator('#leader').textContent(),/Você: Nina/);
await page.locator('#action').tap();await page.waitForFunction(()=>window.aventura.snapshot().bonusCount>0);
const bonus=await page.evaluate(()=>window.aventura.snapshot());assert.equal(bonus.count,0);assert.ok(bonus.dogFetch);
assert.ok(bonus.actors.dogs.some(d=>['return','fetch'].includes(d.activity)));await page.screenshot({path:'test-results/rodada4/busca-dog.png'});
for(const stage of [3,4,5]){
await page.evaluate(i=>localStorage.setItem('nina-julia-aventura-v1',JSON.stringify({version:1,stage:i,leader:'nina'})),stage);
await page.reload();await page.waitForFunction(()=>window.aventura);await page.locator('#resume').tap();await page.locator('#begin').tap();
if(stage===3) assert.ok((await page.evaluate(()=>window.aventura.snapshot())).actors.girls.every(g=>g.costume==='witch'));
else if(stage===4){
 await page.keyboard.down('w');await page.waitForFunction(()=>window.aventura.snapshot().d>5.5);await page.keyboard.up('w');
 await page.locator('#action').tap();await page.waitForFunction(()=>window.aventura.snapshot().fish.phase==='waiting');
 assert.equal(await page.locator('#swap').isDisabled(),true);assert.match(await page.locator('#leader').textContent(),/pescando/);
 await page.waitForFunction(()=>window.aventura.snapshot().fish.phase==='bite');await page.locator('#action').tap();
 await page.waitForFunction(()=>window.aventura.snapshot().fish.phase==='reeling');assert.equal(await page.locator('#swap').isDisabled(),true);
 await page.waitForFunction(()=>window.aventura.snapshot().fish.phase==='idle');assert.equal(await page.locator('#swap').isEnabled(),true);
 assert.equal((await page.evaluate(()=>window.aventura.snapshot())).count,1);
 }else {
 // Rampa real sem mutar estado: dirigir até o primeiro arco pelo teclado.
 await page.keyboard.down('w');await page.waitForFunction(()=>window.aventura.snapshot().bonusCount>0,null,{timeout:10000});await page.keyboard.up('w');
 const s=await page.evaluate(()=>window.aventura.snapshot());assert.ok(s.y>.5);assert.equal(s.combo,1);assert.ok(s.bonuses[0].collected);
}
await page.screenshot({path:`test-results/rodada4/etapa-${stage}.png`});
}
assert.deepEqual(errors,[]);console.log('R4: controle mantém corpos, um rótulo ativo, busca com brinquedo, bruxinhas e rampa/arco por comandos reais PASSARAM');
}finally{await browser.close();}
