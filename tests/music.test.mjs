import test from 'node:test';
import assert from 'node:assert/strict';
import { Music } from '../aventura/music.js';
class Media extends EventTarget {
  constructor() { super(); this.paused = true; this.calls = 0; this.currentTime = 0; this.error = null; this.readyState = 4; }
  setAttribute() {}
  play() { this.calls++; if (this.blocked) return Promise.reject(new DOMException('Gesture required', 'NotAllowedError')); this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
}
class EffectsUnavailable { constructor() { throw new Error('Sem Web Audio'); } }
test('música só tenta tocar depois de gesto e define sessão playback quando suportada', async () => {
  const audioSession = { type: 'ambient' }; const prior = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { audioSession }, configurable: true });
  try {
    const media = new Media(), music = new Music({ media, contextFactory: EffectsUnavailable });
    await music.play(); assert.equal(media.calls, 0); assert.equal(music.status, 'locked');
    assert.equal(await music.unlock(), true); assert.equal(audioSession.type, 'playback'); assert.equal(music.status, 'playing');
  } finally { if (prior) Object.defineProperty(globalThis, 'navigator', prior); else delete globalThis.navigator; }
});
test('bloqueio não é declarado como áudio pronto; novo toque recupera', async () => {
  const media = new Media(); media.blocked = true; const music = new Music({ media, contextFactory: EffectsUnavailable });
  assert.equal(await music.unlock(), false); assert.equal(music.status, 'blocked');
  media.blocked = false; assert.equal(await music.unlock(), true); assert.equal(music.status, 'playing');
});
test('interrupção, retomada, troca de tema e silêncio respeitam intenção da jogadora', async () => {
  const media = new Media(), music = new Music({ media, contextFactory: EffectsUnavailable });
  await music.unlock(); media.pause(); assert.equal(music.status, 'blocked'); await music.unlock();
  music.setTheme('battle'); await Promise.resolve(); assert.match(media.src, /battle\.mp3$/); assert.equal(media.loop, true);
  music.pause(); assert.equal(media.paused, true); assert.equal(music.status, 'paused');
  music.enabled = false; const calls = media.calls; await music.unlock(); assert.equal(media.calls, calls);
});
