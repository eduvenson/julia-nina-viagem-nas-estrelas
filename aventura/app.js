import { STAGES, makeState, tick, act, jump, primaryKey, readSave, saveData } from './core.js';
import { World } from './world.js';
import { Music } from './music.js';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'nina-julia-aventura-v1';
const SETTINGS_KEY = 'nina-julia-settings-v1';
const translations = {
  chooseTitle: ['Quem vai guiar a aventura?', '¿Quién va a guiar la aventura?'], chooseHelp: ['Você escolhe quem vai na frente. A amiga vem atrás e ajuda!', '¡Elegís quién va adelante. Tu amiga te sigue y ayuda!'],
  brazil: ['Camisa do Brasil', 'Camiseta de Brasil'], argentina: ['Camisa da Argentina', 'Camiseta de Argentina'], back: ['Voltar', 'Volver'],
  old: ['← Fases anteriores', '← Fases anteriores'], headline: ['Uma amizade.<br>Um universo inteiro.', 'Una amistad.<br>Un universo entero.'],
  lead: ['O presente da Nina para os 8 anos da Júlia. Uma nova aventura 3D, com as duas e seus cinco dogs.', 'El regalo de Nina para los 8 años de Julia. Una nueva aventura 3D, con las dos y sus cinco perritos.'],
  start: ['Vamos juntas ↗', 'Vamos juntas ↗'], resume: ['Continuar aventura', 'Continuar aventura'],
  hint: ['Mova, pule, explore. A amiga e os dogs vão com você.', 'Movete, saltá, explorá. Tu amiga y los perritos van con vos.'],
  authorship: ['Uma história da Nina · Feita com o Tio Du', 'Una historia de Nina · Hecha con el Tío Du'],
  go: ['Vamos lá!', '¡Vamos!'], keys: ['WASD / setas · mover<br>Arraste · câmera · Espaço · pular · E · ação', 'WASD / flechas · mover<br>Arrastrá · cámara · Espacio · saltar · E · acción'],
  jump: ['Pular', 'Saltar'], music: ['Música da aventura', 'Música de la aventura'], effects: ['Efeitos sonoros', 'Efectos de sonido'],
  volume: ['Volume', 'Volumen'], language: ['Idioma', 'Idioma'], home: ['Voltar ao início', 'Volver al inicio'],
  controlGuide: ['No celular: analógico à esquerda, pulo e ação à direita. Arraste o cenário para girar a câmera. No computador: WASD ou setas, espaço para pular e E para agir.', 'En el celular: palanca a la izquierda, salto y acción a la derecha. Arrastrá el escenario para girar la cámara. En la compu: WASD o flechas, espacio para saltar y E para actuar.'],
  age: ['8 anos de aventuras', '8 años de aventuras'], birthday: ['Feliz aniversário,<br><span>Júlia!</span>', '¡Feliz cumpleaños,<br><span>Julia!</span>'],
  dedication: ['Essa aventura é meu presente para você.<br>Com carinho, Nina.', 'Esta aventura es mi regalo para vos.<br>Con cariño, Nina.'],
  celebrate: ['Mais confete!', '¡Más confeti!'], replay: ['Jogar de novo juntas', 'Jugar de nuevo juntas'],
  errorTitle: ['O 3D precisa de uma ajudinha', 'El 3D necesita una ayudita'], tryAgain: ['Tentar de novo', 'Intentar de nuevo']
};
const messages = {
  collect: ['Boa! Mais uma para a nossa aventura.', '¡Bien! Una más para nuestra aventura.'],
  hit: ['Feitiço desfeito! Vamos juntas!', '¡Hechizo roto! ¡Vamos juntas!'],
  closer: ['Chegue um pouco mais perto para soltar a bolha.', 'Acercate un poquito para lanzar la burbuja.'],
  early: ['Quase! Espere a boia mexer antes de puxar.', '¡Casi! Esperá que se mueva la boya antes de tirar.'],
  miss: ['O peixinho escapou. Vamos tentar outra vez!', 'El pececito escapó. ¡Probemos otra vez!'],
  caught: ['Pegamos! Agora ele volta para o lago.', '¡Lo pescamos! Ahora vuelve al lago.'],
  bite: ['Agora! Puxe a linha!', '¡Ahora! ¡Tirá de la línea!'],
  bump: ['Ops! Tudo bem, vamos continuar.', '¡Ups! No pasa nada, seguimos juntas.'],
  dogs: ['Marcha, Chucha, Luca, Jujuba e Bidu: vamos!', '¡Marcha, Chucha, Luca, Jujuba y Bidu: vamos!'],
  boost: ['Juntas, mais rápido!', '¡Juntas, más rápido!'],
  missing: ['Ainda faltam estrelas! Siga a seta dourada.', '¡Todavía faltan estrellas! Seguí la flecha dorada.'],
  ready: ['Tudo pronto! Vamos até o foguete.', '¡Todo listo! Vamos hasta el cohete.']
  ,findSpot: ['Siga a seta até um ponto de pesca.', 'Seguí la flecha hasta un punto de pesca.'],
  nextSpot: ['Aqui já deu! Vamos explorar o próximo ponto.', '¡Este lugar ya está! Exploremos el siguiente.'],
  splash: ['Splash! Voltamos ao último ponto seguro. Pule os vãos!', '¡Splash! Volvimos al último lugar seguro. ¡Saltá los huecos!'],
  wave: ['Segunda onda! Estas naves têm escudo. Continuem atirando!', '¡Segunda oleada! Estas naves tienen escudo. ¡Sigan disparando!'],
  warning: ['Luz rosa! Vem uma bolha: mova a nave para desviar.', '¡Luz rosa! Viene una burbuja: mové la nave para esquivarla.'],
  zombieWarning: ['Olha o pulo do zumbi! Pule ou desvie!', '¡Ojo con el salto del zombi! ¡Saltá o esquivá!']
};
let lang = 'pt', world, state, phase = 'welcome', saved, toastUntil = 0, lastTime = 0, raf, music = new Music();
let panelKind = '', panelPrimary = () => {}, panelSecondary = () => {}, pausedFrom = 'play', activeBeforePanel;
const keys = new Set(), joystick = { x: 0, y: 0, id: null }, cameraDrag = { id: null, x: 0, y: 0 };
let input = { x: 0, forward: 0 }, missingHint = false;
let hudKey = '';
let selectedLeader = 'julia', fireHeld = false, warningAt = 0;
const t = pair => pair[lang === 'es' ? 1 : 0];
function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }
function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
function settings() {
  store(SETTINGS_KEY, { lang, music: music.enabled, effects: music.effects, volume: music.volume });
}
function restoreSettings() {
  try {
    const v = JSON.parse(stored(SETTINGS_KEY));
    if (!v) return;
    if (['pt', 'es'].includes(v.lang)) lang = v.lang;
    if (typeof v.music === 'boolean') music.enabled = v.music;
    if (typeof v.effects === 'boolean') music.effects = v.effects;
    if (typeof v.volume === 'number' && Number.isFinite(v.volume)) music.setVolume(v.volume);
  } catch { /* Preferências inválidas não bloqueiam a brincadeira. */ }
}
function applyLanguage() {
  document.documentElement.lang = lang === 'es' ? 'es-AR' : 'pt-BR';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(translations[el.dataset.i18n]); });
  document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
  $('pause').setAttribute('aria-label', t(['Pausar aventura', 'Pausar aventura']));
  $('jump').setAttribute('aria-label', t(['Pular', 'Saltar']));
  $('swap').setAttribute('aria-label', t(['Trocar personagem', 'Cambiar personaje']));
  $('joystick').setAttribute('aria-label', t(['Analógico de movimento', 'Palanca de movimiento']));
  syncSound();
  if (state && phase !== 'welcome') updateHud();
  if (panelKind) renderPanel();
  $('error-text').textContent = t(['Não foi possível abrir o mundo 3D. Tente um navegador atualizado com WebGL ativado.', 'No se pudo abrir el mundo 3D. Probá con un navegador actualizado y WebGL activado.']);
}
function syncSound() {
  $('sound').setAttribute('aria-pressed', String(music.enabled));
  $('sound').setAttribute('aria-label', music.enabled ? t(['Desligar música', 'Apagar música']) : t(['Ligar música', 'Encender música']));
  $('music-toggle').checked = music.enabled; $('effects-toggle').checked = music.effects; $('volume').value = music.volume * 100;
}
function clearInput() { keys.clear(); fireHeld = false; joystick.id = null; joystick.x = 0; joystick.y = 0; cameraDrag.id = null; $('stick').style.transform = ''; input = { x: 0, forward: 0 }; }
function toast(pair) { $('toast').textContent = t(pair); $('toast').classList.add('show'); toastUntil = performance.now() + 2800; }
function focus(id) { $(id).focus({ preventScroll: true }); }
function showWelcome() {
  clearInput(); music.pause(); phase = 'welcome'; panelKind = ''; $('choose').hidden = true; $('panel').hidden = true; $('hud').hidden = true; $('ending').hidden = true; $('welcome').hidden = false;
  document.body.classList.remove('night');
  state = makeState(0); world.build(state, true); saved = readSave(stored(SAVE_KEY)); $('resume').hidden = !saved;
  focus(saved ? 'resume' : 'start');
}
function beginChoice() {
  clearInput(); phase = 'choose'; panelKind = ''; $('panel').hidden = true; $('welcome').hidden = true; $('ending').hidden = true; $('hud').hidden = true; $('choose').hidden = false; focus('choose-julia');
}
function startStage(index) {
  clearInput(); missingHint = false; warningAt = 0; panelKind = ''; $('panel').hidden = true; $('welcome').hidden = true; $('ending').hidden = true;
  $('choose').hidden = true; state = makeState(index, selectedLeader); world.build(state); saved = saveData(index, selectedLeader);
  const persisted = store(SAVE_KEY, saved);
  document.body.classList.toggle('night', state.stage.id === 'sol' || ['space', 'run', 'party'].includes(state.stage.type));
  music.setTheme(state.stage.music); music.play();
  $('toast').classList.remove('show');
  if (index === 6) {
    phase = 'party'; $('hud').hidden = true; $('ending').hidden = false;
    state.events.push({ type: 'celebrate' }); focus('celebrate');
  } else {
    phase = 'intro'; $('hud').hidden = false; $('dialogue').hidden = false; $('controls').hidden = true; $('swap').hidden = true;
    updateHud(); focus('begin');
  }
  if (!persisted) toast(['Seu navegador não guardou o progresso. A aventura continua nesta aba.', 'Tu navegador no guardó el progreso. La aventura sigue en esta pestaña.']);
}
function begin() { phase = 'play'; $('dialogue').hidden = true; $('controls').hidden = false; $('swap').hidden = false; $('swap').disabled = state.stage.type === 'space'; $('begin').blur(); updateHud(); }
function updateHud() {
  const stage = state.stage;
  if (stage.type === 'fish') {
    $('fish-meter').style.width = state.fish.phase === 'idle' ? '0%' : `${Math.min(100, state.fish.timer / (state.fish.phase === 'bite' ? 1.6 : 1.25) * 100)}%`;
  }
  const nearSpotId = state.fishingSpots.find(p => p.caught < p.quota && Math.hypot(p.x - state.x, p.d - state.d) < 2.7)?.id ?? -1;
  const nextKey = `${lang}-${phase}-${state.index}-${state.count}-${state.hearts}-${state.leader}-${state.fish.phase}-${state.fish.spot}-${state.wave}-${state.assists}-${nearSpotId}`;
  if (nextKey === hudKey) return;
  hudKey = nextKey;
  $('place').textContent = t(stage.place); $('stage-title').textContent = t(stage.title); $('objective').textContent = t(stage.objective);
  $('story').textContent = t(stage.story); $('speaker').textContent = state.index === 2 ? 'Júlia' : 'Nina & Júlia';
  $('counter').textContent = `${state.count} / ${stage.goal}`; $('progress').style.transform = `scaleX(${Math.min(1, state.count / Math.max(1, stage.goal))})`;
  $('stage-number').textContent = state.stage.type === 'space' ? t([`Onda ${state.wave + 1} de 2`, `Oleada ${state.wave + 1} de 2`]) : t([`Trecho ${state.index + 1} de 6`, `Tramo ${state.index + 1} de 6`]);
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3 12C-3 5 6-1 12 6 18-1 27 5 21 12Z"/></svg>';
  $('hearts').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="${i >= state.hearts ? 'lost' : ''}">${heart}</span>`).join('');
  $('hearts').setAttribute('aria-label', t([`${state.hearts} corações`, `${state.hearts} corazones`]));
  $('leader').textContent = state.leader === 'julia' ? t(['Júlia', 'Julia']) : 'Nina';
  const fishing = stage.type === 'fish'; $('fish-status').hidden = !fishing || phase !== 'play';
  $('jump').hidden = stage.type === 'space'; $('joystick').hidden = false;
  $('action-label').textContent = fishing ? t(state.fish.phase === 'bite' ? ['Puxar agora!', '¡Tirar ahora!'] : state.fish.phase === 'reeling' ? ['Olha o peixe!', '¡Mirá el pez!'] : state.fish.phase === 'waiting' ? ['Esperar…', 'Esperar…'] : stage.action) : stage.type === 'space' ? t(['Atirar', 'Disparar']) : t(stage.action);
  document.querySelector('.keyboard-hint').innerHTML = stage.type === 'space' ? t(['WASD / setas · pilotar<br>Segure Espaço ou E · atirar', 'WASD / flechas · pilotar<br>Mantené Espacio o E · disparar']) : t(translations.keys);
  $('action-symbol').textContent = fishing ? '⌁' : ['space', 'battle'].includes(stage.type) ? '○' : stage.type === 'walk' ? '♡' : '»';
  if (fishing) {
    const nearby = state.fishingSpots.find(p => p.caught < p.quota && Math.hypot(p.x - state.x, p.d - state.d) < 2.7);
    $('fish-text').textContent = t(state.fish.phase === 'bite' ? ['Mordeu! Puxe agora!', '¡Picó! ¡Tirá ahora!'] : state.fish.phase === 'reeling' ? ['Pegamos! Depois, ele volta para o lago.', '¡Lo pescamos! Después vuelve al lago.'] : state.fish.phase === 'waiting' ? ['De olho na boia…', 'Ojo con la boya…'] : nearby ? ['Ponto de pesca! Lance a linha.', '¡Lugar de pesca! Lanzá la línea.'] : ['Pule os vãos e siga a seta até os peixes.', 'Saltá los huecos y seguí la flecha hasta los peces.']);
    $('fish-meter').style.width = state.fish.phase === 'idle' ? '0%' : `${Math.min(100, state.fish.timer / (state.fish.phase === 'bite' ? 1.6 : 1.25) * 100)}%`;
    document.querySelector('.fishing-meter').classList.toggle('bite', state.fish.phase === 'bite');
  }
}
function openPanel(kind) {
  activeBeforePanel = document.activeElement; pausedFrom = phase; phase = 'panel'; panelKind = kind;
  clearInput(); music.pause(); $('panel').hidden = false; $('controls').hidden = true; $('fish-status').hidden = true;
  renderPanel(); focus('panel-primary');
}
function closePanel() {
  $('panel').hidden = true; panelKind = ''; phase = pausedFrom; clearInput(); music.play();
  $('controls').hidden = phase !== 'play'; if (phase === 'play') updateHud(); activeBeforePanel?.focus();
}
function renderPanel() {
  $('settings').hidden = panelKind !== 'pause'; $('panel-secondary').hidden = false; $('panel-home').hidden = false;
  const values = {
    pause: { title: ['Uma pausa na aventura', 'Una pausa en la aventura'], text: ['A turma espera por você. O progresso é guardado a cada novo trecho.', 'La pandilla te espera. El progreso se guarda al llegar a cada nuevo tramo.'], primary: ['Continuar', 'Continuar'], secondary: ['Recomeçar este trecho', 'Reiniciar este tramo'], run: closePanel, second: () => startStage(state.index) },
    complete: { title: ['Conseguimos juntas!', '¡Lo logramos juntas!'], text: state.index === 5 ? ['Agora vem a surpresa que a Nina preparou…', 'Ahora viene la sorpresa que preparó Nina…'] : ['A amiga e os cinco dogs estão prontos para a próxima parada.', 'Tu amiga y los cinco perritos están listos para la próxima parada.'], primary: state.index === 5 ? ['Abrir a surpresa', 'Abrir la sorpresa'] : ['Próxima parada', 'Próxima parada'], secondary: ['Jogar este trecho de novo', 'Jugar este tramo de nuevo'], run: () => startStage(state.index + 1), second: () => startStage(state.index) },
    retry: { title: ['Vamos tentar juntas?', '¿Lo intentamos juntas?'], text: ['Um abraço, cinco corações novinhos e outra chance neste trecho. A aventura não acabou!', 'Un abrazo, cinco corazones nuevos y otra oportunidad en este tramo. ¡La aventura no terminó!'], primary: ['Tentar de novo', 'Intentar de nuevo'], secondary: ['Voltar ao início', 'Volver al inicio'], run: () => startStage(state.index), second: showWelcome },
    restart: { title: ['Uma nova aventura?', '¿Una nueva aventura?'], text: ['O progresso salvo será substituído. Quer começar da Terra outra vez?', 'Se reemplazará el progreso guardado. ¿Querés volver a empezar desde la Tierra?'], primary: ['Sim, começar de novo', 'Sí, empezar de nuevo'], secondary: ['Guardar minha aventura', 'Conservar mi aventura'], run: beginChoice, second: () => { if (pausedFrom === 'party') { $('panel').hidden = true; panelKind = ''; phase = 'party'; music.play(); focus('replay'); } else showWelcome(); } }
  }[panelKind];
  $('panel-title').textContent = t(values.title); $('panel-text').textContent = t(values.text);
  $('panel-place').textContent = panelKind === 'restart' ? 'Nina & Júlia' : t(state.stage.title);
  $('panel-primary').textContent = t(values.primary); $('panel-secondary').textContent = t(values.secondary);
  panelPrimary = values.run; panelSecondary = values.second;
  syncSound();
}
async function unlockAudio() {
  const ok = await music.unlock();
  if (!ok) toast(['O som não ficou disponível neste navegador. Dá para jogar normalmente.', 'El sonido no está disponible en este navegador. Podés jugar igual.']);
}
function action() { if (phase === 'play' || phase === 'party') act(state); }
function jumpAction() { if (phase === 'play') jump(state); }
function inputs() {
  const x = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + joystick.x;
  const forward = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - joystick.y;
  // Movimento relativo à câmera, como jogos de terceira pessoa.
  return { x: x * Math.cos(world.yaw) - forward * Math.sin(world.yaw), forward: forward * Math.cos(world.yaw) + x * Math.sin(world.yaw) };
}
function frame(time) {
  const dt = lastTime ? Math.min(.05, (time - lastTime) / 1000) : 0; lastTime = time;
  if (phase === 'play') {
    input = inputs();
    if (['space', 'battle'].includes(state.stage.type) && (fireHeld || keys.has('e') || state.stage.type === 'space' && keys.has(' '))) act(state);
    tick(state, input, dt);
    if (!missingHint && state.d >= state.stage.length - 1 && state.count < state.stage.goal && !['battle', 'space'].includes(state.stage.type)) {
      missingHint = true; toast(state.stage.item === 'battery' ? ['Faltam baterias! Volte e siga a seta dourada.', '¡Faltan baterías! Volvé y seguí la flecha dorada.'] : messages.missing);
    }
    if (state.mode === 'complete') openPanel('complete');
    else if (state.mode === 'retry') openPanel('retry');
    updateHud();
  }
  if (['welcome', 'choose', 'party'].includes(phase)) state.time += dt;
  if (phase !== 'panel') world.update(state, dt, phase === 'play' ? input : {});
  while (state.events.length) {
    const event = state.events.shift(); world.effect(event); music.sound(event.type);
    if (state.stage.type === 'fish' && ['bite', 'caught', 'nextSpot'].includes(event.type)) { $('toast').classList.remove('show'); toastUntil = 0; }
    else if (event.type === 'releaseFish' && state.count < state.stage.goal) toast(messages.nextSpot);
    else if (['warning', 'zombieWarning'].includes(event.type)) { if (state.time > warningAt) { toast(messages[event.type]); warningAt = state.time + 5; } }
    else if (event.type.startsWith('assist')) {
      if (event.type !== 'assistShot') { const name = state.leader === 'julia' ? 'Nina' : t(['Júlia', 'Julia']); toast([`${name} ajudou! Juntas é melhor.`, `¡${name} ayudó! Juntas es mejor.`]); }
    }
    else if (event.type === 'hit' && state.stage.type === 'space') toast(['Boa bolha! Mais uma nave voltou para casa.', '¡Buena burbuja! Otra nave volvió a casa.']);
    else if (messages[event.type]) toast(messages[event.type]);
    if (event.type === 'collect' && state.count === state.stage.goal && state.mode === 'playing') toast(messages.ready);
  }
  const pointer = phase === 'play' && !['space', 'battle'].includes(state.stage.type) ? world.projectTarget(state) : null;
  $('target-pointer').hidden = !pointer?.visible;
  if (pointer?.visible) { $('target-pointer').style.left = `${Math.max(20, Math.min(innerWidth - 20, pointer.x))}px`; $('target-pointer').style.top = `${Math.max(Math.min(225, innerHeight * .4), Math.min(innerHeight - 135, pointer.y))}px`; }
  if (time > toastUntil) $('toast').classList.remove('show');
  raf = requestAnimationFrame(frame);
}

$('start').addEventListener('click', () => { unlockAudio(); if (saved) openPanel('restart'); else beginChoice(); });
$('choose-julia').addEventListener('click', () => { selectedLeader = 'julia'; startStage(0); });
$('choose-nina').addEventListener('click', () => { selectedLeader = 'nina'; startStage(0); });
$('choose-back').addEventListener('click', showWelcome);
$('resume').addEventListener('click', () => { unlockAudio(); selectedLeader = saved.leader; startStage(saved.stage); });
$('begin').addEventListener('click', () => { unlockAudio(); begin(); });
$('pause').addEventListener('click', () => { if (['play', 'intro'].includes(phase)) openPanel('pause'); });
$('panel-primary').addEventListener('click', () => { unlockAudio(); panelPrimary(); });
$('panel-secondary').addEventListener('click', () => panelSecondary());
$('panel-home').addEventListener('click', showWelcome);
$('action').addEventListener('pointerdown', e => { e.preventDefault(); if (phase !== 'play') return; fireHeld = ['space', 'battle'].includes(state.stage.type); $('action').setPointerCapture(e.pointerId); action(); });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('action').addEventListener(type, () => { fireHeld = false; });
$('action').addEventListener('click', e => { if (e.detail === 0) action(); });
$('jump').addEventListener('pointerdown', e => { e.preventDefault(); jumpAction(); });
$('jump').addEventListener('click', e => { if (e.detail === 0) jumpAction(); });
$('swap').addEventListener('click', () => { if (phase !== 'play') return; state.leader = state.leader === 'julia' ? 'nina' : 'julia'; selectedLeader = state.leader; store(SAVE_KEY, saveData(state.index, selectedLeader)); updateHud(); toast(state.leader === 'julia' ? ['Agora a Júlia guia a turma!', '¡Ahora Julia guía al grupo!'] : ['Agora a Nina guia a turma!', '¡Ahora Nina guía al grupo!']); });
$('celebrate').addEventListener('click', () => { unlockAudio(); action(); });
$('replay').addEventListener('click', () => openPanel('restart'));
$('sound').addEventListener('click', () => { music.enabled = !music.enabled; if (!music.enabled) music.pause(); else { unlockAudio(); music.play(); } syncSound(); settings(); });
$('music-toggle').addEventListener('change', e => { music.enabled = e.target.checked; syncSound(); settings(); });
$('effects-toggle').addEventListener('change', e => { music.effects = e.target.checked; settings(); });
$('volume').addEventListener('input', e => { music.setVolume(Number(e.target.value) / 100); settings(); });
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => { lang = button.dataset.lang; applyLanguage(); settings(); }));

addEventListener('keydown', e => {
  if (e.key === 'Tab' && phase === 'panel') {
    const items = [...$('panel').querySelectorAll('button,input,a')].filter(el => !el.hidden && el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'Escape') { if (panelKind === 'pause') closePanel(); else if (['play', 'intro'].includes(phase)) openPanel('pause'); return; }
  if (phase !== 'play') return;
  const k = e.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e', 'shift'].includes(k)) {
    e.preventDefault(); keys.add(k);
    if (!e.repeat && k === ' ') primaryKey(state);
    if (!e.repeat && (k === 'e' || k === 'shift')) action();
  }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
function lostFocus() { clearInput(); if (phase === 'play') openPanel('pause'); }
addEventListener('blur', lostFocus);
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (phase === 'play') lostFocus(); music.pause(); } else { lastTime = 0; if (phase !== 'panel' && phase !== 'welcome') music.play(); } });
addEventListener('resize', () => world?.resize());
$('joystick').addEventListener('pointerdown', e => {
  if (phase !== 'play' || joystick.id !== null) return; e.preventDefault(); joystick.id = e.pointerId; $('joystick').setPointerCapture(e.pointerId); moveStick(e);
});
function moveStick(e) {
  if (e.pointerId !== joystick.id) return;
  const r = $('joystick').getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
  const max = 34, len = Math.max(max, Math.hypot(dx, dy)); joystick.x = dx / len; joystick.y = dy / len;
  $('stick').style.transform = `translate(${joystick.x * max}px,${joystick.y * max}px)`;
}
$('joystick').addEventListener('pointermove', moveStick);
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('joystick').addEventListener(type, e => {
  if (e.pointerId === joystick.id) { joystick.id = null; joystick.x = 0; joystick.y = 0; $('stick').style.transform = ''; }
});
$('world').addEventListener('pointerdown', e => { if (phase !== 'play' || cameraDrag.id !== null) return; cameraDrag.id = e.pointerId; cameraDrag.x = e.clientX; cameraDrag.y = e.clientY; $('world').setPointerCapture(e.pointerId); });
$('world').addEventListener('pointermove', e => {
  if (e.pointerId !== cameraDrag.id) return; world.orbit(e.clientX - cameraDrag.x, e.clientY - cameraDrag.y); cameraDrag.x = e.clientX; cameraDrag.y = e.clientY;
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('world').addEventListener(type, e => { if (e.pointerId === cameraDrag.id) cameraDrag.id = null; });
$('world').addEventListener('contextmenu', e => e.preventDefault());
$('world').addEventListener('webglcontextlost', e => { e.preventDefault(); if (phase === 'play') openPanel('pause'); toast(['O 3D foi interrompido. Recarregue para retomar este trecho.', 'El 3D se interrumpió. Recargá para retomar este tramo.']); });

try {
  restoreSettings(); applyLanguage(); saved = readSave(stored(SAVE_KEY));
  document.body.classList.toggle('touch', matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 0);
  world = new World($('world')); showWelcome(); $('loading').hidden = true;
  requestAnimationFrame(frame);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  // Observação somente leitura para diagnóstico local e testes de entradas reais.
  Object.defineProperty(window, 'aventura', { value: Object.freeze({ snapshot: () => ({ phase, index: state.index, stageId: state.stage.id, x: state.x, d: state.d, y: state.y,
    count: state.count, hearts: state.hearts, time: state.time, cooldown: state.cooldown, mode: state.mode, fish: { ...state.fish }, leader: state.leader, yaw: world.yaw,
    targets: state.targets.map(t => ({ ...t })), obstacles: state.obstacles.map(o => ({ ...o })), shots: state.shots.map(p => ({ ...p })), wave: state.wave,
    helper: { ...state.helper }, assists: state.assists, controls: { firing: fireHeld, x: joystick.x, y: joystick.y, keys: [...keys] }, fishingSpots: state.fishingSpots.map(p => ({ ...p })),
    actors: { girls: world.people.map(p => ({ name: p.name, x: p.root.position.x, y: p.root.position.y, z: p.root.position.z, head: p.head.rotation.y, stride: p.limbs[1].rotation.x })), dogs: world.dogs.map(d => ({ name: d.info.name, activity: d.activity, label: d.label.visible, x: d.root.position.x, y: d.root.position.y, z: d.root.position.z })) },
    fishingVisual: world.fishingRig ? { line: world.fishingRig.line.visible, segments: world.fishingRig.line.count, rod: world.fishingRig.rod.visible, fish: world.fishingRig.fish.visible, phase: world.fishingAction?.type, fishY: world.fishingRig.fish.position.y } : null,
    flight: world.ship ? { noseD: 2.65, crewHeading: world.people.map(p => p.root.rotation.y), panelZ: -.95, exhaustZ: 3 } : null,
    audio: { state: music.ctx?.state, theme: music.theme, voices: music.voices.size, energy: music.energy(), enabled: music.enabled },
    render: { calls: world.renderer.info.render.calls, triangles: world.renderer.info.render.triangles } }) }) });
} catch (error) {
  cancelAnimationFrame(raf); music.pause(); $('loading').hidden = true; $('welcome').hidden = true; $('hud').hidden = true; $('error').hidden = false;
  console.error('Falha ao iniciar aventura 3D:', error);
}
