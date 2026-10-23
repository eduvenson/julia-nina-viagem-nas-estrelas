// Trilha original procedural: nenhuma gravação, rede ou música de terceiros.
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
const THEMES = {
  adventure: { bpm: 108, melody: [72, 76, 79, 76, 74, 72, 67, 71, 72, 76, 81, 79, 76, 74, 72, 67], bass: .10, lead: .10 },
  battle: { bpm: 136, melody: [72, 0, 79, 76, 74, 79, 83, 79, 81, 79, 76, 74, 72, 74, 79, 0], bass: .14, lead: .10 },
  chase: { bpm: 124, melody: [76, 79, 81, 79, 76, 72, 74, 76, 79, 83, 84, 83, 79, 76, 74, 72], bass: .10, lead: .10 },
  calm: { bpm: 76, melody: [72, 0, 76, 0, 79, 0, 76, 74, 72, 0, 69, 0, 67, 0, 71, 0], bass: .06, lead: .08 },
  birthday: { bpm: 88, melody: [72, 76, 79, 84, 83, 79, 76, 74, 76, 81, 84, 88, 86, 84, 79, 72], bass: .08, lead: .11 }
};
export class Music {
  constructor() { this.enabled = true; this.effects = true; this.volume = .55; this.theme = 'adventure'; this.voices = new Set(); this.active = false; }
  async unlock() {
    try {
      if (!this.ctx) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return false;
        this.ctx = new Context(); this.master = this.ctx.createGain(); this.master.gain.value = this.volume;
        const compressor = this.ctx.createDynamicsCompressor(); this.master.connect(compressor); compressor.connect(this.ctx.destination);
        // Reverberação curta original, calculada localmente para dar espaço à melodia.
        const hall = this.ctx.createConvolver(), wet = this.ctx.createGain(); wet.gain.value = .16;
        const impulse = this.ctx.createBuffer(2, this.ctx.sampleRate * 1.3, this.ctx.sampleRate);
        let seed = 17;
        for (let channel = 0; channel < 2; channel++) {
          const data = impulse.getChannelData(channel);
          for (let i = 0; i < data.length; i++) { seed = seed * 16807 % 2147483647; data[i] = (seed / 2147483647 * 2 - 1) * (1 - i / data.length) ** 3; }
        }
        hall.buffer = impulse; this.master.connect(hall); hall.connect(wet); wet.connect(compressor);
        this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 256; this.master.connect(this.analyser);
        this.timer = setInterval(() => this.schedule(), 80);
      }
      await this.ctx.resume(); return true;
    } catch { return false; }
  }
  energy() {
    if (!this.analyser) return 0;
    const buffer = new Float32Array(256); this.analyser.getFloatTimeDomainData(buffer);
    return Math.sqrt(buffer.reduce((sum, n) => sum + n * n, 0) / buffer.length);
  }
  setTheme(theme) { this.theme = theme; this.beat = 0; this.next = this.ctx?.currentTime ?? 0; }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); if (this.master) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, .08); }
  play() { this.active = true; if (this.ctx) this.next = this.ctx.currentTime + .08; }
  pause() {
    this.active = false;
    for (const v of this.voices) { try { v.stop(); } catch {} }
    this.voices.clear();
  }
  tone(note, when, duration, gain, wave = 'sine') {
    if (!this.ctx || this.voices.size > 30 || !gain) return;
    const osc = this.ctx.createOscillator(), amp = this.ctx.createGain();
    osc.type = wave; osc.frequency.value = 440 * 2 ** ((note - 69) / 12);
    amp.gain.setValueAtTime(0, when); amp.gain.linearRampToValueAtTime(gain, when + .018);
    amp.gain.exponentialRampToValueAtTime(.001, when + duration);
    osc.connect(amp); amp.connect(this.master); osc.start(when); osc.stop(when + duration + .03);
    this.voices.add(osc); osc.onended = () => { this.voices.delete(osc); osc.disconnect(); amp.disconnect(); };
  }
  schedule() {
    if (!this.active || !this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const t = THEMES[this.theme], eighth = 60 / t.bpm / 2;
    if (this.next < this.ctx.currentTime - .5) this.next = this.ctx.currentTime;
    while (this.next < this.ctx.currentTime + .18) {
      const step = this.beat || 0, chord = CHORDS[Math.floor(step / 8) % 4];
      const melody = t.melody[step % 16];
      if (melody) { this.tone(melody, this.next, eighth * 2.8, t.lead, 'triangle'); this.tone(melody + 12, this.next, eighth * 1.7, t.lead * .18); }
      this.tone(chord[step % 3] + 12, this.next, eighth * 2, .035, 'sine');
      if (step % 4 === 0) { this.tone(chord[0] - 12, this.next, eighth * 3.5, t.bass, 'triangle'); chord.forEach(n => this.tone(n, this.next, eighth * 5, .025)); }
      if (this.theme === 'battle' && step % 2 === 0) { this.tone(31, this.next, .10, .15); this.tone(95, this.next, .035, .015, 'triangle'); }
      this.beat = step + 1; this.next += eighth;
    }
  }
  sound(type) {
    if (!this.effects || !this.ctx || this.ctx.state !== 'running') return;
    const n = this.ctx.currentTime;
    const phrase = { collect: [79, 84], assistCollect: [76, 84], assistShield: [72, 79, 84], caught: [76, 79, 84], hit: [72, 79], impact: [86, 79], shot: [84, 91], alienShot: [60, 65], wave: [60, 67, 72], splash: [67, 55], complete: [72, 76, 79, 84],
      celebrate: [72, 76, 79, 84, 88], jump: [67, 72], bubble: [84, 91], bite: [88, 88], bump: [48, 43], boost: [60, 67, 72], cast: [76, 67] }[type];
    phrase?.forEach((note, i) => this.tone(note, n + i * .09, .2, .10, 'sine'));
  }
}
