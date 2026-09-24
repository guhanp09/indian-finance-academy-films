/* THE FILM'S EMOTIONAL SHAPE, AS DATA. — node tools/echallan/score-arc.mjs
 *
 * A score cannot be judged by reading the code that generates it, and it cannot be judged by
 * loudness alone — a passage can hold its level and still go emotionally flat, which is what this
 * film's second half was doing: one stab at the reveal and then fifty-five seconds inside a 3 dB
 * band with the same material under all of it.
 *
 * So this measures the five things an audience actually hears change, per section, off the music
 * stem the build just wrote:
 *
 *   LEVEL     mean and peak RMS, in dB — how big it is
 *   DENSITY   onsets per second — how busy it is
 *   BRIGHT    spectral centroid, in Hz — how bright/sharp it is (dread is dark, alarm is bright)
 *   LOW/HIGH  the split of energy below 200 Hz and above 2 kHz — where the weight sits
 *   MOVE      how much the level changes ACROSS the section (last third minus first third), which
 *             is the one number that says whether a passage goes anywhere
 *
 * and prints them beside what the narration is saying there, because that is what they have to fit.
 */
import fs from 'fs';
import { execFileSync } from 'child_process';

const FF = '/opt/homebrew/bin/ffmpeg';
const SR = 48000;
const CHECK = process.argv.includes('--check');
const STEM = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || '.tts-echallan/opening/music.wav';
/* sections that are SUPPOSED to sit still: two designed silences, the stab the reveal lands on,
   and the sign-off, which is a settle by definition */
const STILL = new Set(['held', 'sink', 'body', 'stop', 'card']);
const SECS = JSON.parse(fs.readFileSync('.tts-echallan/opening/sections.json', 'utf8'));
const N = JSON.parse(fs.readFileSync('src/echallan/narration.json', 'utf8'));

execFileSync(FF, ['-y', '-v', 'error', '-i', STEM, '-f', 's16le', '-ac', '1', '-ar', String(SR), '/tmp/_arc.raw']);
const b = fs.readFileSync('/tmp/_arc.raw');
const pcm = new Int16Array(b.buffer, b.byteOffset, Math.floor(b.length / 2));
const dB = (v) => 20 * Math.log10(Math.max(1e-9, v / 32768));

/* frame the stem once: 40 ms windows, 10 ms hop, with a coarse 3-band split from a real DFT */
const WIN = Math.round(0.040 * SR), HOP = Math.round(0.010 * SR);
const NF = Math.max(0, Math.floor((pcm.length - WIN) / HOP));
const lvl = new Float32Array(NF), cen = new Float32Array(NF);
const low = new Float32Array(NF), high = new Float32Array(NF);
const BINS = 64, FMAX = 8000;
const cosT = [], sinT = [];
for (let k = 0; k < BINS; k++) {
  const f = (k + 1) * (FMAX / BINS), c = new Float32Array(WIN), s2 = new Float32Array(WIN);
  for (let i = 0; i < WIN; i++) { const a = 2 * Math.PI * f * i / SR; c[i] = Math.cos(a); s2[i] = Math.sin(a); }
  cosT.push(c); sinT.push(s2);
}
for (let i = 0; i < NF; i++) {
  const o = i * HOP;
  let e = 0; for (let j = o; j < o + WIN; j++) e += pcm[j] * pcm[j];
  lvl[i] = Math.sqrt(e / WIN);
  if (lvl[i] < 8) continue;                       // silence: no spectrum worth taking
  let num = 0, den = 0, lo = 0, hi = 0;
  for (let k = 0; k < BINS; k += 2) {              // every other bin: this is a shape, not an FFT
    const f = (k + 1) * (FMAX / BINS);
    let re = 0, im = 0;
    for (let j = 0; j < WIN; j += 4) { re += pcm[o + j] * cosT[k][j]; im += pcm[o + j] * sinT[k][j]; }
    const m = Math.hypot(re, im);
    num += f * m; den += m;
    if (f < 200) lo += m; if (f > 2000) hi += m;
  }
  cen[i] = den ? num / den : 0;
  low[i] = den ? lo / den : 0; high[i] = den ? hi / den : 0;
}
/* onsets: a rise in level of 4 dB or more over 30 ms, not within 60 ms of the last one */
const onset = new Uint8Array(NF);
let lastOn = -99;
for (let i = 3; i < NF; i++) {
  if (dB(lvl[i]) - dB(lvl[i - 3]) > 4 && lvl[i] > 40 && i - lastOn > 6) { onset[i] = 1; lastOn = i; }
}

const said = (t0, t1) => N.words.filter((w) => w.s >= t0 - 0.2 && w.s < t1)
  .map((w) => w.w).join(' ').slice(0, 52) || '—';
const span = (t0, t1, arr) => {
  const a = Math.max(0, Math.round(t0 * SR / HOP)), z = Math.min(NF, Math.round(t1 * SR / HOP));
  let s = 0, n = 0; for (let i = a; i < z; i++) { s += arr[i]; n++; }
  return n ? s / n : 0;
};
const peak = (t0, t1) => {
  const a = Math.max(0, Math.round(t0 * SR / HOP)), z = Math.min(NF, Math.round(t1 * SR / HOP));
  let p = 0; for (let i = a; i < z; i++) if (lvl[i] > p) p = lvl[i];
  return p;
};

const rows = [];
console.log('section        start    len   level  peak   move  dens  bright   low  high   narration');
console.log('─'.repeat(118));
for (const s of SECS) {
  const d = s.t1 - s.t0;
  if (d <= 0.05) continue;
  const third = d / 3;
  const mv = dB(span(s.t1 - third, s.t1, lvl)) - dB(span(s.t0, s.t0 + third, lvl));
  const a = Math.max(0, Math.round(s.t0 * SR / HOP)), z = Math.min(NF, Math.round(s.t1 * SR / HOP));
  let on = 0; for (let i = a; i < z; i++) on += onset[i];
  rows.push({ name: s.name, d, mv, lvl: dB(span(s.t0, s.t1, lvl)), pk: dB(peak(s.t0, s.t1)) });
  console.log(
    `${s.name.padEnd(8)} ${s.t0.toFixed(1).padStart(7)} ${d.toFixed(1).padStart(6)}s`
    + ` ${dB(span(s.t0, s.t1, lvl)).toFixed(1).padStart(6)}`
    + ` ${dB(peak(s.t0, s.t1)).toFixed(1).padStart(6)}`
    + ` ${(mv >= 0 ? '+' : '') + mv.toFixed(1)}`.padStart(7)
    + ` ${(on / d).toFixed(1).padStart(5)}`
    + ` ${Math.round(span(s.t0, s.t1, cen)).toString().padStart(7)}`
    + ` ${(span(s.t0, s.t1, low) * 100).toFixed(0).padStart(5)}`
    + ` ${(span(s.t0, s.t1, high) * 100).toFixed(0).padStart(5)}`
    + `   ${said(s.t0, s.t1)}`);
}
console.log('─'.repeat(118));
console.log('level/peak dBFS · move = last third minus first third, dB · dens = onsets/s · '
  + 'bright = centroid Hz · low = % under 200Hz · high = % over 2kHz');

/* ── THE GATE ───────────────────────────────────────────────────────────────────────────────
 * What this is for: the score had drifted into a state where twenty-three sections all sat inside
 * a five-decibel band and four consecutive passages totalling forty-seven seconds moved less than
 * three decibels between them. Nothing failed, because nothing was measuring it. These three
 * numbers are the ones that would have.
 */
if (CHECK) {
  const bad = [];
  for (const r of rows) {
    if (STILL.has(r.name) || r.d < 6) continue;
    if (Math.abs(r.mv) < 2.0) bad.push(`"${r.name}" runs ${r.d.toFixed(1)}s and moves `
      + `${r.mv >= 0 ? '+' : ''}${r.mv.toFixed(1)} dB — a passage that long has to go somewhere`);
  }
  const loud = rows.reduce((a, b) => (b.lvl > a.lvl ? b : a));
  const quiet = rows.reduce((a, b) => (b.lvl < a.lvl ? b : a));
  const range = loud.lvl - quiet.lvl;
  console.log(`\ndynamic range: "${quiet.name}" ${quiet.lvl.toFixed(1)} -> "${loud.name}" `
    + `${loud.lvl.toFixed(1)} = ${range.toFixed(1)} dB`);
  if (range < 12) bad.push(`the whole score lives in ${range.toFixed(1)} dB — it has no dynamics`);
  const top = rows.reduce((a, b) => (b.pk > a.pk ? b : a));
  console.log(`loudest single moment: "${top.name}" at ${top.pk.toFixed(1)} dB`);
  if (top.name !== 'body') bad.push(`the loudest moment in the film is "${top.name}", not the `
    + `reveal — the score's peak must be the picture's peak`);
  console.log('');
  if (bad.length) { bad.forEach((b) => console.log(`  FAIL  ${b}`)); process.exit(1); }
  console.log('  the arc moves, it has dynamics, and it peaks where the picture does.');
}
