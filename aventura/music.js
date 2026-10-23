// Trilha original local em mídia nativa; Web Audio fica responsável pelos efeitos.
// No iPhone, uma sessão ambiente pode ser silenciada mesmo com AudioContext rodando.
import { THEMES } from './score.js';
export class Music {
  constructor({ media, contextFactory } = {}) {
    this.enabled = true; this.effects = true; this.volume = .55; this.theme = 'adventure';
    this.voices = new Set(); this.active = false; this.requested = false; this.status = 'locked'; this.generation = 0;
    this.media = media || (typeof document !== 'undefined' && document.getElementById('soundtrack')) || new Audio(); this.contextFactory = contextFactory; this.onStatus = () => {};
    this.media.loop = true; this.media.preload = 'auto'; this.media.setAttribute?.('playsinline', '');
    this.media.src = this.url(this.theme); this.media.volume = this.volume;
    this.media.addEventListener('playing', () => { if (this.active && this.enabled) this.setStatus('playing'); });
    this.media.addEventListener('pause', () => { if (this.active && this.enabled) this.setStatus('blocked'); });
    this.media.addEventListener('error', () => this.setStatus('error'));
  }
  url(theme) { return new URL(`./audio/${theme}.mp3`, import.meta.url).href; }
  setStatus(status) { if (this.status !== status) { this.status = status; this.onStatus(status); } }
  ensureEffects() {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const Context = this.contextFactory || window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        this.ctx = new Context(); this.master = this.ctx.createGain(); this.master.gain.value = this.volume;
        const compressor = this.ctx.createDynamicsCompressor(); this.master.connect(compressor); compressor.connect(this.ctx.destination);
        this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 256; this.master.connect(this.analyser);
      }
      // Chamar resume dentro do gesto, sem esperar outras promessas.
      if (this.ctx.state !== 'running') Promise.resolve(this.ctx.resume()).catch(() => {});
    } catch { /* A trilha nativa continua disponível mesmo sem efeitos. */ }
  }
  unlock() {
    this.requested = true; this.active = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
    if (this.media.error) this.media.load();
    const playback = this.tryPlay(); this.ensureEffects(); return playback;
  }
  tryPlay() {
    if (!this.enabled || !this.active) return Promise.resolve(false);
    if (!this.requested) { this.setStatus('locked'); return Promise.resolve(false); }
    const generation = ++this.generation; this.setStatus('loading');
    let playback;
    try { playback = this.media.play(); } catch { this.setStatus('blocked'); return Promise.resolve(false); }
    return new Promise(resolve => {
      const timeout = setTimeout(() => { if (generation === this.generation && this.active) this.setStatus('blocked'); resolve(false); }, 3500);
      Promise.resolve(playback).then(() => {
        clearTimeout(timeout);
        const ok = generation === this.generation && this.active && !this.media.paused;
        if (ok) this.setStatus('playing'); resolve(ok);
      }, () => {
        clearTimeout(timeout); if (generation === this.generation && this.active) this.setStatus(this.media.error ? 'error' : 'blocked'); resolve(false);
      });
    });
  }
  setTheme(theme) {
    if (!THEMES[theme] || theme === this.theme) return;
    this.generation++; this.theme = theme; this.media.src = this.url(theme);
    if (this.active && this.enabled) this.tryPlay();
  }
  play() { this.active = true; return this.tryPlay(); }
  pause() {
    this.active = false; this.generation++; this.media.pause(); this.setStatus('paused');
    for (const voice of this.voices) { try { voice.stop(); } catch {} } this.voices.clear();
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value)); this.media.volume = this.volume;
    if (this.master) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, .08);
  }
  energy() {
    if (!this.analyser) return 0;
    const buffer = new Float32Array(256); this.analyser.getFloatTimeDomainData(buffer);
    return Math.sqrt(buffer.reduce((sum, n) => sum + n * n, 0) / buffer.length);
  }
  tone(note, when, duration, gain) {
    if (!this.ctx || this.ctx.state !== 'running' || this.voices.size > 24) return;
    const osc = this.ctx.createOscillator(), amp = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 440 * 2 ** ((note - 69) / 12);
    amp.gain.setValueAtTime(0, when); amp.gain.linearRampToValueAtTime(gain, when + .018); amp.gain.exponentialRampToValueAtTime(.001, when + duration);
    osc.connect(amp); amp.connect(this.master); osc.start(when); osc.stop(when + duration + .03);
    this.voices.add(osc); osc.onended = () => { this.voices.delete(osc); osc.disconnect(); amp.disconnect(); };
  }
  sound(type) {
    if (!this.effects || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const notes = { collect: [79,84], assistCollect: [76,84], caught: [76,79,84], hit: [72,79], impact: [86,79], shot: [84,91], alienShot: [60,65], wave: [60,67,72], splash: [67,55], complete: [72,76,79,84], defeat: [60,55,48,43], celebrate: [72,76,79,84,88], jump: [67,72], bite: [88,88], bump: [48,43], boost: [60,67,72], cast: [76,67] }[type];
    notes?.forEach((note, i) => this.tone(note, now + i * .09, .22, .1));
  }
}
