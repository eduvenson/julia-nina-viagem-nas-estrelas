export const DOGS = [
  { name: 'Marcha', owner: 'nina', coat: '#be8651' },
  { name: 'Chucha', owner: 'nina', coat: '#f0e2cd' },
  { name: 'Luca', owner: 'nina', coat: '#5e493e' },
  { name: 'Jujuba', owner: 'julia', coat: '#c99750' },
  { name: 'Bidu', owner: 'julia', coat: '#23252d' }
];
export const STAGES = [
  { id: 'sol', title: ['Do Sol à Terra', 'Del Sol a la Tierra'], place: ['Estação Solar · Nossa partida', 'Estación Solar · Nuestra salida'],
    story: ['Nossa aventura começa no Sol, na estação imaginária da Nina! Juntem três estrelas e embarquem rumo à Terra com os dogs.', '¡Nuestra aventura empieza en el Sol, en la estación imaginaria de Nina! Junten tres estrellas y suban rumbo a la Tierra con los perritos.'],
    objective: ['Encontrem 3 estrelas e cheguem ao foguete', 'Encuentren 3 estrellas y lleguen al cohete'],
    action: ['Chamar os dogs', 'Llamar a los perritos'], length: 34, goal: 3, type: 'walk', item: 'star', color: '#452742', music: 'adventure' },
  { id: 'espaco', title: ['Batalha das bolhas', 'Batalla de burbujas'], place: ['Órbita da Terra', 'Órbita de la Tierra'],
    story: ['As duas no comando! Os aliens patrulham e lançam bolhas. Desviem dos disparos e revidem! Espaço ou segurar o botão para atirar.', '¡Las dos al mando! Los aliens patrullan y lanzan burbujas. ¡Esquiven y respondan! Espacio o mantener el botón para disparar.'],
    objective: ['Acertem 6 naves com bolhas', 'Alcancen 6 naves con burbujas'],
    action: ['Soltar bolha', 'Lanzar burbuja'], length: 34, goal: 6, type: 'space', item: 'alien', color: '#101c41', music: 'battle' },
  { id: 'casa', title: ['Vem, Nina!', '¡Vení, Nina!'], place: ['Nossa casinha nas estrelas', 'Nuestra casita en las estrellas'],
    story: ['“Vem, Nina! O foguete está esperando!” Peguem três baterias, pulem os obstáculos e embarquem juntas.', '“¡Vení, Nina! ¡El cohete nos espera!” Junten tres baterías, salten los obstáculos y suban juntas.'],
    objective: ['Peguem 3 baterias e corram até o foguete', 'Junten 3 baterías y corran al cohete'],
    action: ['Acelerar', 'Acelerar'], length: 52, goal: 3, type: 'run', item: 'battery', color: '#222447', music: 'chase' },
  { id: 'dubai', title: ['Halloween em Dubai', 'Halloween en Dubái'], place: ['Uma missão de arrepiar… de rir!', '¡Una misión para morirse… de risa!'],
    story: ['Zumbis de Halloween invadiram a praça! As bolhas desfazem o feitiço e todos voltam a dançar.', '¡Zombis de Halloween invadieron la plaza! Las burbujas rompen el hechizo y todos vuelven a bailar.'],
    objective: ['Libertem 6 zumbis do feitiço', 'Liberen a 6 zombis del hechizo'],
    action: ['Soltar bolha', 'Lanzar burbuja'], length: 30, goal: 6, type: 'battle', item: 'zombie', color: '#efb78d', music: 'battle' },
  { id: 'valdomeira', title: ['Pescaria em Valdomeira', 'Pesca en Valdomeira'], place: ['Um respiro em casa', 'Un descanso en casa'],
    story: ['Vamos explorar o lago! Sigam as pontes, pulem os vãos e encontrem três pontos de pesca. Esperem a mordida e puxem na hora certa!', '¡Exploremos el lago! Sigan los puentes, salten los huecos y encuentren tres puntos de pesca. ¡Esperen la mordida y tiren a tiempo!'],
    objective: ['Explorem as pontes e pesquem 5 peixes', 'Exploren los puentes y pesquen 5 peces'],
    action: ['Lançar linha', 'Lanzar la línea'], length: 56, goal: 5, type: 'fish', item: 'fish', color: '#b3ded2', music: 'calm' },
  { id: 'irigoyen', title: ['Patins em Bernardo de Irigoyen', 'Patines en Bernardo de Irigoyen'], place: ['Argentina · À beira do lago', 'Argentina · Junto al lago'],
    story: ['Última parada! Coloquem os capacetes, sigam a pista do lago e juntem cinco estrelas. A surpresa está chegando!', '¡Última parada! Pónganse los cascos, sigan la pista del lago y junten cinco estrellas. ¡Se viene la sorpresa!'],
    objective: ['Juntem 5 estrelas e cruzem a chegada', 'Junten 5 estrellas y crucen la meta'],
    action: ['Acelerar', 'Acelerar'], length: 64, goal: 5, type: 'skate', item: 'star', color: '#b3dce4', music: 'chase' },
  { id: 'festa', title: ['Feliz aniversário, Júlia!', '¡Feliz cumpleaños, Julia!'], place: ['8 anos de aventuras', '8 años de aventuras'],
    story: ['Essa aventura é meu presente para você. Com carinho, Nina.', 'Esta aventura es mi regalo para vos. Con cariño, Nina.'],
    objective: ['Uma amizade que vai além das estrelas', 'Una amistad que va más allá de las estrellas'],
    action: ['Celebrar!', '¡Celebrar!'], length: 0, goal: 0, type: 'party', color: '#243954', music: 'birthday' }
];

export const FISH_PATH = [
  { from: -4, to: 8, x: -2, width: 5 }, { from: 8, to: 16, x: -3, width: 2.8 },
  { from: 16, to: 23, x: 0, width: 8 }, { from: 23, to: 31, x: 3, width: 2.8 },
  { from: 31, to: 38, x: 0, width: 8 }, { from: 38, to: 46, x: -2, width: 2.8 },
  { from: 46, to: 59, x: 0, width: 8 }
];
export const FISH_GAPS = [{ from: 12, to: 13.5 }, { from: 27, to: 28.5 }, { from: 41, to: 42.5 }];
export function onFishPath(x, d) {
  return !FISH_GAPS.some(g => d > g.from && d < g.to) && FISH_PATH.some(p => d >= p.from && d <= p.to && Math.abs(x - p.x) <= p.width / 2);
}
export function readSave(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Number.isInteger(data.stage) || data.stage < 0 || data.stage > 6) return null;
    return { version: 1, stage: data.stage, completed: data.stage === 6 && data.completed === true, leader: data.leader === 'nina' ? 'nina' : 'julia' };
  } catch { return null; }
}
export function saveData(stage, leader = 'julia') { return { version: 1, stage, completed: stage === 6, leader }; }
export function makeState(index = 0, leader = 'julia') {
  const stage = STAGES[index]; if (!stage) throw new RangeError('Etapa inválida');
  const targets = [];
  for (let i = 0; i < stage.goal && stage.type !== 'fish'; i++) {
    const combat = ['space', 'battle'].includes(stage.type), x = combat ? [-4, 0, 4][i % 3] : [-3, 3, 0, -3, 3][i % 5];
    const d = combat ? (stage.type === 'space' ? 16 : 10) + Math.floor(i / 3) * 12 : 7 + i * ((stage.length - 15) / Math.max(1, stage.goal - 1));
    const hp = combat && (stage.type === 'battle' || i > 2) ? 2 : 1;
    targets.push({ id: i, x, d, baseX: x, baseD: d, hit: false, hp, maxHp: hp, active: stage.type !== 'space' || i < 3,
      shootAt: .8 + (i % 3) * .7, charge: 0, phase: 'patrol', timer: 0, aimX: 0, aimD: 0, flash: 0 });
  }
  const obstacles = [];
  if (!['fish', 'party'].includes(stage.type)) for (let i = 0; i < (stage.type === 'walk' ? 1 : 7); i++) obstacles.push({ id: i, x: [-3, 3, 0][i % 3], d: 12 + i * ((stage.length - 17) / 7), radius: .8 });
  const x = stage.type === 'fish' ? -2 : 0;
  return { index, stage, x, d: 0, y: 0, vy: 0, count: 0, hearts: 5, time: 0, mode: stage.type === 'party' ? 'party' : 'playing',
    targets, obstacles, invincible: 0, cooldown: 0, boost: 0, fish: { phase: 'idle', timer: 0, spot: null },
    fishingSpots: [{ id: 0, x: -2, d: 6, quota: 2, caught: 0 }, { id: 1, x: 0, d: 34, quota: 2, caught: 0 }, { id: 2, x: 0, d: 52, quota: 1, caught: 0 }],
    checkpoint: { x, d: 0 }, events: [], leader: leader === 'nina' ? 'nina' : 'julia',
    helper: { x: x - 1, d: -2.2, y: 0, action: 'follow', fireAt: 2.5, shieldAt: 12 }, assists: 0,
    shots: [], shotId: 0, wave: 0, playerFiredAt: -100, dogCallUntil: 0 };
}
export function jump(s) {
  if (s.mode === 'playing' && s.y === 0 && s.stage.type !== 'space') { s.vy = 8.5; s.events.push({ type: 'jump' }); }
}
export function primaryKey(s) { if (s.stage.type === 'space') act(s); else jump(s); }
function launch(s, helper = false) {
  const x = helper ? s.helper.x : s.x, d = helper ? s.helper.d : s.d;
  const target = s.targets.filter(t => !t.hit && t.active && (s.stage.type !== 'space' || t.d > d) && Math.hypot(t.x - x, t.d - d) < (s.stage.type === 'space' ? 30 : 14))
    .sort((a, b) => Math.hypot(a.x - x, a.d - d) - Math.hypot(b.x - x, b.d - d))[0];
  const dx = (target?.x ?? x) - x, dd = (target?.d ?? d + 25) - d, len = Math.hypot(dx, dd) || 1;
  if (s.shots.filter(p => p.owner !== 'alien').length >= 12) return;
  s.shots.push({ id: s.shotId++, owner: helper ? 'helper' : 'player', x, d: d + .6, vx: dx / len * 23, vd: dd / len * 23, life: 2, target: target?.id });
  s.events.push({ type: helper ? 'assistShot' : 'shot' });
}
export function act(s) {
  if (s.mode === 'party') { s.events.push({ type: 'celebrate' }); return; }
  if (s.mode !== 'playing' || s.cooldown > 0) return;
  s.cooldown = .28;
  if (s.stage.type === 'fish') {
    if (s.fish.phase === 'reeling') return;
    const spot = s.fishingSpots.find(p => p.caught < p.quota && Math.hypot(p.x - s.x, p.d - s.d) < 2.7);
    if (!spot) { s.events.push({ type: 'findSpot' }); return; }
    if (s.fish.phase === 'idle') { s.fish = { phase: 'waiting', timer: 1.1 + (s.count % 3) * .28, spot: spot.id }; s.events.push({ type: 'cast' }); }
    else if (s.fish.phase === 'bite') {
      spot.caught++; s.count++; s.checkpoint = { x: spot.x, d: spot.d }; s.fish = { phase: 'reeling', timer: 2.2, spot: spot.id }; s.helper.cheerUntil = s.time + 2.2;
      s.events.push({ type: 'caught' }); if (spot.caught === spot.quota && s.count < s.stage.goal) s.events.push({ type: 'nextSpot' }); checkComplete(s);
    } else { s.fish = { phase: 'idle', timer: 0, spot: null }; s.events.push({ type: 'early' }); }
  } else if (['space', 'battle'].includes(s.stage.type)) { launch(s); s.playerFiredAt = s.time; }
  else if (['run', 'skate'].includes(s.stage.type)) { s.boost = 1.5; s.events.push({ type: 'boost' }); }
  else { s.dogCallUntil = s.time + 4; s.events.push({ type: 'dogs' }); }
}
export function damage(s) {
  if (s.mode !== 'playing' || s.invincible > 0) return;
  if (s.time >= s.helper.shieldAt) { s.helper.shieldAt = s.time + 14; s.helper.action = 'shield'; s.invincible = 1.5; s.assists++; s.events.push({ type: 'assistShield' }); return; }
  s.hearts--; s.invincible = 2; s.boost = 0; s.events.push({ type: 'bump' });
  if (!s.hearts) { s.mode = 'retry'; s.events.push({ type: 'retry' }); }
}
function checkComplete(s) {
  if (s.mode !== 'playing') return;
  if (s.stage.type === 'fish' && s.fish.phase === 'reeling') return;
  if (s.count < s.stage.goal) return;
  if (!['fish', 'space', 'battle'].includes(s.stage.type) && s.d < s.stage.length - 2) return;
  s.mode = 'complete'; s.events.push({ type: 'complete' });
}
function hitTarget(s, t, owner) {
  if (t.hit) return; t.hp--; t.flash = .2; s.events.push({ type: 'impact', target: t.id });
  if (t.hp <= 0) { t.hit = true; s.count++; s.events.push({ type: 'hit', target: t.id }); if (owner === 'helper') s.assists++; }
}
function segmentDistance(x, d, ax, ad, bx, bd) {
  const vx = bx - ax, vd = bd - ad, ratio = Math.max(0, Math.min(1, ((x - ax) * vx + (d - ad) * vd) / (vx * vx + vd * vd || 1)));
  return Math.hypot(x - ax - vx * ratio, d - ad - vd * ratio);
}
function combat(s, dt) {
  const space = s.stage.type === 'space';
  if (space && s.wave === 0 && s.targets.slice(0, 3).every(t => t.hit)) {
    s.wave = 1; s.events.push({ type: 'wave' });
    s.targets.slice(3).forEach((t, i) => { t.active = true; t.baseD = s.d + 18; t.shootAt = s.time + 1.1 + i * .7; });
  }
  for (const t of s.targets) {
    t.flash = Math.max(0, t.flash - dt); if (t.hit || !t.active) continue;
    if (space) {
      t.x = t.baseX + Math.sin(s.time * (s.wave ? 1.3 : .85) + t.id * 2) * (s.wave ? 1.65 : 1.1);
      t.d = Math.max(s.d + 8, t.baseD + Math.cos(s.time * .9 + t.id) * 2);
      t.charge = Math.max(0, 1 - (t.shootAt - s.time) / 1.05);
      if (t.charge > 0 && t.phase !== 'charge') { t.phase = 'charge'; s.events.push({ type: 'warning', target: t.id }); }
      if (s.time >= t.shootAt) {
        const dx = s.x - t.x, dd = s.d - t.d, len = Math.hypot(dx, dd) || 1;
        if (s.shots.filter(p => p.owner === 'alien').length < 8) s.shots.push({ id: s.shotId++, owner: 'alien', x: t.x, d: t.d, vx: dx / len * 6, vd: dd / len * 6, life: 8, target: null });
        s.events.push({ type: 'alienShot', target: t.id }); t.shootAt = s.time + 4.8; t.phase = 'patrol'; t.charge = 0;
      }
    } else {
      const dx = s.x - t.x, dd = s.d - t.d, distance = Math.hypot(dx, dd) || 1;
      if (t.phase === 'windup') {
        t.timer -= dt; t.charge = 1 - t.timer / .85;
        if (t.timer <= 0) { t.phase = 'dash'; t.timer = .38; }
      } else if (t.phase === 'dash') {
        t.x += t.aimX * dt * 8; t.d += t.aimD * dt * 8; t.timer -= dt;
        if (t.timer <= 0) { t.phase = 'recover'; t.timer = 1.3; t.charge = 0; }
      } else if (t.phase === 'recover') { t.timer -= dt; if (t.timer <= 0) t.phase = 'patrol'; }
      else if (distance < 4.3) { t.phase = 'windup'; t.timer = .85; t.aimX = dx / distance; t.aimD = dd / distance; s.events.push({ type: 'zombieWarning', target: t.id }); }
      else if (distance < 19) { t.phase = 'chase'; t.x += dx / distance * dt * 1.2; t.d += dd / distance * dt * 1.2; }
      else { t.x = t.baseX + Math.sin(s.time + t.id) * 1.5; t.d = t.baseD + Math.cos(s.time * .7 + t.id); }
      t.x = Math.max(-7, Math.min(7, t.x));
      if (s.y < .8 && distance < 1.3 && t.phase !== 'recover') damage(s);
    }
  }
  if (s.time - s.playerFiredAt < 4 && s.time >= s.helper.fireAt) {
    s.helper.fireAt = s.time + 2.8; s.helper.action = 'shoot'; launch(s, true);
  }
  for (const p of s.shots) {
    const ox = p.x, od = p.d; p.life -= dt;
    if (p.owner !== 'alien') {
      const target = s.targets[p.target];
      if (target && !target.hit) {
        const dx = target.x - p.x, dd = target.d - p.d, length = Math.hypot(dx, dd) || 1;
        p.vx += (dx / length * 23 - p.vx) * Math.min(1, dt * 6); p.vd += (dd / length * 23 - p.vd) * Math.min(1, dt * 6);
      }
    }
    p.x += p.vx * dt; p.d += p.vd * dt;
    if (p.owner === 'alien') {
      if (segmentDistance(s.x, s.d, ox, od, p.x, p.d) < .95) { damage(s); p.life = 0; s.events.push({ type: 'enemyImpact' }); }
    } else for (const t of s.targets) {
      if (!t.hit && t.active && segmentDistance(t.x, t.d, ox, od, p.x, p.d) < 1) { hitTarget(s, t, p.owner); p.life = 0; break; }
    }
  }
  s.shots = s.shots.filter(p => p.life > 0);
}
export function tick(s, input, seconds) {
  if (s.mode !== 'playing') return;
  const dt = Math.min(Math.max(seconds, 0), .05); s.time += dt;
  s.invincible = Math.max(0, s.invincible - dt); s.cooldown = Math.max(0, s.cooldown - dt); s.boost = Math.max(0, s.boost - dt);
  let { x = 0, forward = 0 } = input; const magnitude = Math.hypot(x, forward); if (magnitude > 1) { x /= magnitude; forward /= magnitude; }
  const speed = (s.stage.type === 'skate' ? 7 : s.stage.type === 'space' ? 8 : 5) * (s.boost > 0 ? 1.65 : 1);
  s.x = Math.max(-7, Math.min(7, s.x + x * speed * dt)); s.d = Math.max(0, Math.min(s.stage.length, s.d + forward * speed * dt));
  if (s.y > 0 || s.vy > 0) { s.vy -= 20 * dt; s.y = Math.max(0, s.y + s.vy * dt); if (!s.y) s.vy = 0; }
  const gap = s.stage.type === 'fish' && !onFishPath(s.x, s.d) && s.y < .18;
  if (gap) { damage(s); s.x = s.checkpoint.x; s.d = s.checkpoint.d; s.y = 0; s.vy = 0; s.events.push({ type: 'splash' }); }
  const fish = s.stage.type === 'fish';
  const fishPlatform = fish && FISH_PATH.find(p => s.d >= p.from && s.d <= p.to);
  const side = fish ? fishPlatform?.width >= 5 ? -1.3 : 0 : s.leader === 'nina' ? 1 : -1;
  s.helper.x += (s.x + side - s.helper.x) * Math.min(1, dt * 3.5);
  s.helper.d += (s.d - 2.2 - s.helper.d) * Math.min(1, dt * 4);
  s.helper.y += (s.y - s.helper.y) * Math.min(1, dt * 7);
  if (fish) {
    const path = FISH_PATH.find(p => s.helper.d >= p.from && s.helper.d <= p.to);
    if (path) s.helper.x = Math.max(path.x - path.width / 2 + .35, Math.min(path.x + path.width / 2 - .35, s.helper.x));
    const gap = FISH_GAPS.find(g => s.helper.d > g.from - .6 && s.helper.d < g.to + .6);
    if (gap) s.helper.y = Math.max(s.helper.y, Math.sin((s.helper.d - gap.from + .6) / (gap.to - gap.from + 1.2) * Math.PI) * .9);
  }
  if (['space', 'battle'].includes(s.stage.type)) combat(s, dt);
  else if (!fish) for (const t of s.targets) {
    if (t.hit) continue;
    const playerNear = Math.hypot(t.x - s.x, t.d - s.d) < 1.5;
    const helperNear = Math.hypot(t.x - s.helper.x, t.d - s.helper.d) < 1.3;
    if (playerNear || helperNear) { t.hit = true; s.count++; s.events.push({ type: playerNear ? 'collect' : 'assistCollect', target: t.id }); if (!playerNear) s.assists++; }
  }
  for (const o of s.obstacles) if (s.y < .85 && Math.hypot(o.x - s.x, o.d - s.d) < o.radius + .45) damage(s);
  if (fish && s.fish.phase !== 'idle') {
    const spot = s.fishingSpots[s.fish.spot];
    if (s.fish.phase === 'reeling') {
      s.fish.timer -= dt;
      if (s.fish.timer <= 0) { s.fish = { phase: 'idle', timer: 0, spot: null }; s.events.push({ type: 'releaseFish' }); }
    }
    else if (Math.hypot(spot.x - s.x, spot.d - s.d) > 2.7) { s.fish = { phase: 'idle', timer: 0, spot: null }; s.events.push({ type: 'findSpot' }); }
    else {
      s.fish.timer -= dt;
      if (s.fish.timer <= 0) {
        if (s.fish.phase === 'waiting') { s.fish = { phase: 'bite', timer: 1.4 - s.count % 3 * .15, spot: spot.id }; s.events.push({ type: 'bite' }); }
        else { s.fish = { phase: 'idle', timer: 0, spot: null }; s.events.push({ type: 'miss' }); }
      }
    }
  }
  checkComplete(s);
}
