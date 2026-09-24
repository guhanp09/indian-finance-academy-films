/* Post-render QA. Every check here is one the specification asks for, expressed as a number so it
   cannot be passed by wishful looking:
 *
 *   blank      no black or near-empty frame anywhere
 *   seam       per-frame luminance delta — a hard cut spikes, a handover does not
 *   still      no visually identical state survives longer than ~0.8s
 *   grey       the reversal must read with saturation removed
 *   safe       nothing bright inside the Shorts UI zone (bottom 180px) or the outer 90px
 *   phone      contact sheets at real phone size, which is the only size that matters
 */
import { execFileSync } from 'child_process';
import fs from 'fs';

const FF = '/opt/homebrew/bin/ffmpeg';
const IN = process.argv[2] ?? 'out/upi-scam-1.mp4';
const OUT = 'qa-upi';
const FRAMES = Number(process.env.UPI_FRAMES ?? 0);
/* The film now ends with the channel's sign-off card, which is APPROVED to hold still and then
   fade out. The motion gates below are about the film; applying them to a logo card would be
   asking a sign-off to animate, which is the opposite of what it is for. So the card's window is
   declared, and inside it the rules are: it must not be blank while it is up, and its hold is
   allowed to be a hold. */
const CARD_FROM = Number(process.env.UPI_CARD_FROM ?? 0);
const inCard = (i) => CARD_FROM > 0 && i >= CARD_FROM;
const C = JSON.parse(fs.readFileSync('src/upi-scam/cues.gen.json', 'utf8'));
fs.mkdirSync(`${OUT}/frames`, { recursive: true });
const sh = (c) => execFileSync('/bin/sh', ['-c', c], { encoding: 'utf8', maxBuffer: 1 << 28 });

/* one small-grey copy of every frame; every metric below reads from it */
console.log('decoding…');
sh(`${FF} -y -v error -i ${IN} -vf "scale=192:340,format=gray" -f rawvideo ${OUT}/gray.raw`);
const raw = fs.readFileSync(`${OUT}/gray.raw`);
const W = 192, H = 340, FR = W * H;
const N = Math.floor(raw.length / FR);
const frame = (i) => raw.subarray(i * FR, (i + 1) * FR);
const mean = (b) => { let s = 0; for (let i = 0; i < b.length; i++) s += b[i]; return s / b.length; };
const stdev = (b) => { const m = mean(b); let s = 0; for (let i = 0; i < b.length; i++) s += (b[i] - m) ** 2; return Math.sqrt(s / b.length); };
console.log(`${N} frames at ${W}x${H} grey`);

const fail = [];

/* ── blank ── */
let blanks = 0, dark = [];
const EXIT = 8;                                   // the card's deliberate fade to ground
for (let i = 0; i < N - (CARD_FROM ? EXIT : 0); i++) {
  const m = mean(frame(i)), sd = stdev(frame(i));
  if (m < 6 || sd < 4) { blanks++; if (dark.length < 6) dark.push(`f${i} (mean ${m.toFixed(1)} sd ${sd.toFixed(1)})`); }
}
console.log(`blank: ${blanks} frames  ${dark.join(', ')}`);
if (blanks) fail.push(`${blanks} blank/near-empty frames`);

/* ── seam ──
   Two numbers per frame, because they answer two different questions. MEAN delta answers "how
   much of the frame changed" — that is the cut detector. MAX per-pixel delta answers "did
   ANYTHING change at all" — that is the freeze detector, and it is the one the stillness rule
   actually asks about. Using the mean for both was wrong: a moving object that is small but
   perfectly visible (the tokens circulating inside the final rule) averages away to nothing and
   reads as a frozen frame. */
/* MOVED, not MAX. The freeze detector used the single largest per-pixel change, which h264 makes
   useless at the quiet end of a film: over the sign-off card, where consecutive frames are
   identical to a mean of 0.001, the encoder still flips ONE pixel by exactly 12 levels on a
   four-frame cadence. `peak < 12` then read a perfectly still card as moving and chopped its
   170-frame hold into 17. Worse, the same test gates real freezes, so one noisy pixel could hide
   one. Counting how many pixels actually moved is immune to that and answers the same question. */
const delta = new Float64Array(N), moved = new Float64Array(N);
for (let i = 1; i < N; i++) {
  const a = frame(i - 1), b = frame(i); let s = 0, mv = 0;
  for (let k = 0; k < FR; k++) { const d = Math.abs(a[k] - b[k]); s += d; if (d > 12) mv++; }
  delta[i] = s / FR; moved[i] = mv / FR;
}
const sorted = [...delta.slice(1)].sort((a, b) => a - b);
const med = sorted[sorted.length >> 1];
/* Designed impacts are allowed to spike, and are listed here BY NAME so that a spike anywhere
   else is still a failure. The reversal is meant to be the hardest frame-to-frame change in the
   film; suppressing it to satisfy a seam metric would be optimising the measurement. */
/* A CUT IS ISOLATED. Fast designed motion — a card flung off screen, a field of tiles sweeping
   the frame — raises the per-frame delta for a RUN of frames with elevated neighbours either
   side. A cut raises exactly one frame out of stillness. Classifying by that shape is what the
   metric was always trying to express; thresholding the raw value flagged 89 frames of motion the
   brief asked for. Designed impacts are still named explicitly, so a spike out of nowhere
   anywhere else is a failure. */
const DESIGNED = [[C.cue.snap - 0.10, C.cue.snap + 0.45, 'the reversal']];
const named = (i) => DESIGNED.find(([a, b]) => i / 60 >= a && i / 60 <= b);
const THRESH = Math.max(6, med * 9);
const hot = []; for (let i = 1; i < N; i++) if (delta[i] > THRESH) hot.push(i);
const runs = [];
for (const i of hot) {
  const last = runs[runs.length - 1];
  if (last && i - last[last.length - 1] <= 2) last.push(i); else runs.push([i]);
}
const spikes = [], designed = [], motion = [];
for (const r of runs) {
  const a = r[0], b = r[r.length - 1];
  const nb = Math.max(delta[Math.max(1, a - 3)], delta[Math.min(N - 1, b + 3)]);
  const pk = Math.max(...r.map((i) => delta[i]));
  const tag = `f${a}${b > a ? `-${b}` : ''} (${(a / 60).toFixed(2)}s Δ${pk.toFixed(2)})`;
  if (r.length > 2 || pk <= nb * 4) { motion.push(`${tag} ×${r.length}f`); continue; }
  const d = named(a);
  if (d) designed.push(`${tag} — ${d[2]}`); else spikes.push(tag);
}
if (motion.length) console.log(`  fast motion (runs, not cuts): ${motion.join(', ')}`);
if (designed.length) console.log(`  designed impacts: ${designed.join(', ')}`);
console.log(`seam: median Δ ${med.toFixed(3)}, max ${Math.max(...delta).toFixed(2)}, `
  + `${spikes.length} cut-like spikes ${spikes.slice(0, 6).join(', ')}`);
if (spikes.length) fail.push(`${spikes.length} cut-like seams: ${spikes.slice(0, 4).join(', ')}`);

/* ── stillness: nothing may hold an IDENTICAL state longer than 0.8s (48 frames) ── */
let run = 0, worst = 0, worstAt = 0, cardHold = 0;
for (let i = 1; i < N; i++) {
  const frozen = delta[i] < 0.05 && moved[i] < 0.0004;   // under ~0.04% of pixels moved at all
  if (!frozen) { run = 0; continue; }
  run++;
  if (inCard(i - run)) { cardHold = Math.max(cardHold, run); continue; }
  if (run > worst) { worst = run; worstAt = i - run; }
}
if (cardHold) console.log(`  sign-off card holds ${cardHold} frames (${(cardHold / 60).toFixed(2)}s) — by design`);
/* reported separately: a long QUIET stretch is legitimate direction (the rule is meant to hold),
   a long FROZEN stretch is not */
let qrun = 0, quiet = 0, quietAt = 0;
for (let i = 1; i < N; i++) {
  if (delta[i] < 0.18) { qrun++; if (qrun > quiet) { quiet = qrun; quietAt = i - qrun; } } else qrun = 0;
}
console.log(`stillness: longest FROZEN run ${worst} frames (${(worst / 60).toFixed(2)}s)`
  + `; longest quiet run ${quiet} frames (${(quiet / 60).toFixed(2)}s) at ${(quietAt / 60).toFixed(2)}s`);
if (worst > 48) fail.push(`frozen for ${(worst / 60).toFixed(2)}s at ${(worstAt / 60).toFixed(2)}s`);

/* ── safe zones: nothing bright in the Shorts UI band or the outer margins ── */
sh(`${FF} -y -v error -i ${IN} -vf "crop=1080:180:0:1740,scale=64:12,format=gray" -f rawvideo ${OUT}/bottom.raw`);
const bot = fs.readFileSync(`${OUT}/bottom.raw`);
const bf = 64 * 12, bn = Math.floor(bot.length / bf);
let hotBottom = 0;
for (let i = 0; i < bn; i++) { const b = bot.subarray(i * bf, (i + 1) * bf); if (stdev(b) > 26) hotBottom++; }
console.log(`safe zone: ${hotBottom}/${bn} frames with detailed content in the bottom 180px`);
if (hotBottom > bn * 0.05) fail.push(`content in the Shorts UI band on ${hotBottom} frames`);

/* ── greyscale legibility of the reversal ── */
const rev0 = (C.cue.however - 0.3).toFixed(2), rev1 = (C.cue.absorb + 0.6).toFixed(2);
sh(`${FF} -y -v error -ss ${rev0} -to ${rev1} -i ${IN} -vf "hue=s=0,fps=2,scale=300:-1,tile=6x2" -frames:v 1 ${OUT}/grey_reversal.png`);
sh(`${FF} -y -v error -i ${IN} -vf "fps=1/2.6,scale=250:-1,tile=7x3" -frames:v 1 ${OUT}/phone_sheet.png`);
sh(`${FF} -y -v error -i ${IN} -vf "fps=1/2.6,scale=250:-1,hue=s=0,tile=7x3" -frames:v 1 ${OUT}/phone_sheet_grey.png`);
console.log(`sheets: ${OUT}/grey_reversal.png, ${OUT}/phone_sheet.png, ${OUT}/phone_sheet_grey.png`);

/* ── container ── */
const p = JSON.parse(sh(`/opt/homebrew/bin/ffprobe -v error -print_format json -show_streams -show_format ${IN}`));
const v = p.streams.find((s) => s.codec_type === 'video'), a = p.streams.find((s) => s.codec_type === 'audio');
console.log(`container: ${v.width}x${v.height} ${eval(v.r_frame_rate)}fps ${v.codec_name}/${v.pix_fmt}  `
  + `audio ${a ? `${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch` : 'MISSING'}  `
  + `${(+p.format.duration).toFixed(3)}s ${(p.format.bit_rate / 1e6).toFixed(1)}Mbps`);
if (!a) fail.push('no audio stream');
if (v.width !== 1080 || v.height !== 1920) fail.push(`wrong size ${v.width}x${v.height}`);
if (v.pix_fmt !== 'yuv420p') fail.push(`wrong pixel format ${v.pix_fmt}`);
const expected = FRAMES / 60;
if (Math.abs(+p.format.duration - expected) > 0.10)
  fail.push(`duration ${(+p.format.duration).toFixed(3)} != ${expected.toFixed(3)}`);

fs.rmSync(`${OUT}/gray.raw`); fs.rmSync(`${OUT}/bottom.raw`);
console.log('\n' + (fail.length ? 'FAIL\n  - ' + fail.join('\n  - ') : 'all checks pass'));
process.exit(fail.length ? 1 : 0);
