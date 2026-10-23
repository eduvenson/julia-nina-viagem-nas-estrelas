import { CHORDS, THEMES } from '../aventura/score.js';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
// Composição original compartilhada com o jogo, renderizada localmente; sem API ou gravação.
await mkdir('aventura/audio', { recursive: true });
const rate = 22050;
for (const [name, theme] of Object.entries(THEMES)) {
  const stepDuration = 60 / theme.bpm / 2, length = Math.round(64 * stepDuration * rate);
  const samples = new Float64Array(length);
  function note(pitch, start, seconds, gain, bass = false) {
    if (!pitch) return;
    const hz = 440 * 2 ** ((pitch - 69) / 12), n = Math.round(seconds * rate), offset = Math.round(start * rate);
    for (let i = 0; i < n; i++) {
      const t = i / rate, env = Math.min(1, t / .018) * Math.exp(-t / (seconds * .3)) * Math.min(1, (seconds - t) / .05);
      const wave = Math.sin(t * hz * Math.PI * 2) + Math.sin(t * hz * Math.PI * 4) * (bass ? .08 : .22) + Math.sin(t * hz * Math.PI * 6) * .05;
      samples[(offset + i) % length] += wave * env * gain;
    }
  }
  for (let step = 0; step < 64; step++) {
    const chord = CHORDS[Math.floor(step / 8) % 4], time = step * stepDuration;
    const melody = theme.melody[step % 16];
    note(melody, time, stepDuration * 3, .18); note(melody && melody + 12, time, stepDuration * 2, .022);
    note(chord[step % 3] + 12, time, stepDuration * 2, .05);
    if (step % 4 === 0) { note(chord[0] - 12, time, stepDuration * 3.5, .2, true); chord.forEach(n => note(n, time, stepDuration * 6, .035)); }
    // Bateria eletrônica original, com ruído determinístico e viradas a cada oito compassos.
    if (name !== 'birthday') {
      const intense = ['battle', 'chase'].includes(name), offset = Math.round(time * rate);
      let seed = step + 701;
      const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
      const kick = step % 2 === 0 || intense && step % 16 === 15;
      const snare = step % 8 === 4 || intense && step % 32 >= 29;
      for (let i = 0; i < rate * .18; i++) {
        const t = i / rate, n = noise();
        const drum = kick ? Math.sin((48 * t + 1.3 * (1 - Math.exp(-t * 40))) * Math.PI * 2) * Math.exp(-t * 25) * (intense ? .34 : .24) : 0;
        const clap = snare ? (n * .16 + Math.sin(t * 185 * Math.PI * 2) * .065) * Math.exp(-t * 30) : 0;
        const hat = n * (step % 2 ? .045 : .025) * Math.exp(-t * 140);
        samples[(offset + i) % length] += drum + clap + hat;
      }
      // Baixo pulsante e arpejo de oitavas dão impulso sem aumentar só o volume.
      note(chord[0] - 12 + (step % 4 === 3 ? 12 : 0), time, stepDuration * .8, intense ? .22 : .13, true);
      if (intense) note(chord[step % 3] + 24, time + stepDuration / 2, stepDuration * .6, .045);
    }
  }
  const pcm = new Int16Array(length * 2);
  for (let i = 0; i < length; i++) {
    const l = samples[i] + samples[(i - Math.round(rate * .19) + length) % length] * .16;
    const r = samples[i] + samples[(i - Math.round(rate * .29) + length) % length] * .16;
    pcm[i * 2] = Math.tanh(l * 1.8) * 30000; pcm[i * 2 + 1] = Math.tanh(r * 1.8) * 30000;
  }
  const header = Buffer.alloc(44); header.write('RIFF'); header.writeUInt32LE(36 + pcm.byteLength, 4); header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22); header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.byteLength, 40);
  const wav = `aventura/audio/${name}.wav`; await writeFile(wav, Buffer.concat([header, Buffer.from(pcm.buffer)]));
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-18:TP=-2:LRA=8', '-codec:a', 'libmp3lame', '-b:a', '80k', '-metadata', 'artist=Nina e Julia - composicao original', `aventura/audio/${name}.mp3`]);
  await rm(wav); console.log(`Trilha original: ${name}`);
}
