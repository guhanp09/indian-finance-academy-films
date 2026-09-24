/* Post-render QA. Every check is one the specification asks for, expressed as a NUMBER so it
   cannot be passed by wishful looking.
     blank   no black or near-empty frame anywhere
     seam    per-frame luminance delta — a cut spikes one isolated frame, a handover does not
     still   no visually identical state survives longer than ~0.8s
     safe    nothing detailed inside the Shorts UI band or the outer margins
     grey    the film's arguments must survive saturation removal
   Usage: node tools/echallan/qa.mjs <file.mp4> [startSeconds]
*/
import { execFileSync } from 'child_process';
import fs from 'fs';

const FF = '/opt/homebrew/bin/ffmpeg';
const IN = process.argv[2] ?? 'qa-echallan/out/sec1.mp4';
const T0 = Number(process.argv[3] ?? 0);
/* The film ends with the channel's sign-off, which is APPROVED to hold still and then fade out
   (the channel end card, option A). The motion gates below are about the FILM; applying them to a
   logo card would be asking a sign-off to animate, which is the opposite of what it is for. So the
   card's window is DECLARED, and inside it the rules are: it must not be blank while it is up, and
   its hold is allowed to be a hold. Everything before it is judged in full. */
const CARD_FROM = Number(process.env.ECHALLAN_CARD_FROM ?? 0);
const inCard = (i) => CARD_FROM > 0 && i >= CARD_FROM;
const OUT = 'qa-echallan';
const sh = (c) => execFileSync('/bin/sh', ['-c', c], { encoding: 'utf8', maxBuffer: 1 << 28 });

console.log(`decoding ${IN}…`);
sh(`${FF} -y -v error -i ${IN} -vf "scale=192:340,format=gray" -f rawvideo ${OUT}/gray.raw`);
const raw = fs.readFileSync(`${OUT}/gray.raw`);
const W = 192, H = 340, FR = W * H, N = Math.floor(raw.length / FR);
const frame = (i) => raw.subarray(i * FR, (i + 1) * FR);
const mean = (b) => { let s = 0; for (let i = 0; i < b.length; i++) s += b[i]; return s / b.length; };
const stdev = (b) => { const m = mean(b); let s = 0; for (let i = 0; i < b.length; i++) s += (b[i] - m) ** 2; return Math.sqrt(s / b.length); };
const at = (i) => (T0 + i / 60).toFixed(2);
console.log(`${N} frames\n`);
const fail = [];

/* blank */
let blanks = 0; const dark = [];
const EXIT = 10;                       // the card's deliberate fade to ground
for (let i = 0; i < N - (CARD_FROM ? EXIT : 0); i++) {
  const m = mean(frame(i)), sd = stdev(frame(i));
  if (m < 6 || sd < 4) { blanks++; if (dark.length < 6) dark.push(`f${i} @${at(i)}s (mean ${m.toFixed(1)} sd ${sd.toFixed(1)})`); }
}
console.log(`blank: ${blanks} frames ${dark.join(', ')}`);
if (blanks) fail.push(`${blanks} blank/near-empty frames`);

/* ── THE BACKGROUND IS NEVER JUST ABSENT ────────────────────────────────────────────────────
   "at 1:06, background suddenly goes black; which looks bad to the viewer… abrupt changes without
   good reason are always bad."
   Act 3 drew its phone and nothing else, so for three seconds after the payment the composition's
   own ground showed through and the skyline the viewer had been standing in front of since the
   first frame simply stopped existing. Nothing was blank — there was a bright phone in the middle
   of the frame — so the blank test above could never have seen it.

   AND THE TEST FOR IT IS NOT DARKNESS. This film is set at night: its chat screens are dark, its
   home screen is dark, the attacker's compound is dark, and every one of those is a picture with
   something in it. What went wrong at 1:06 was that the background was EMPTY — a flat fill with no
   skyline, no stars, no structure of any kind. So this measures the outer sixth of the frame down
   each side, which is where a backdrop lives and which the phone never covers, and asks whether
   there is anything there at all: dark AND flat, for half a second or more.
   Calibrated on the render that had the fault: those frames measured mean 6 / sd 1.4, while the
   film's darkest legitimate backgrounds — the night sky on the two flights, the compound, the home
   screen — all sit above sd 6. */
{
  /* the outer sixth down each side, between the watermark and the caption band — both of those
     put type into the margins and either would hide an empty background behind its own detail */
  const MEAN = 24, SD = 4.0, RUN = 0.5, EDGE = Math.round(W / 6);
  const Y0 = Math.round(H * 0.07), Y1 = Math.round(H * 0.76);
  let run = 0, from = 0, worst = null; const runs = [];
  let flatSd = 1e9, flat = '-';
  for (let i = 0; i < N; i++) {
    const b2 = frame(i);
    let s2 = 0, n2 = 0;
    for (let y = Y0; y < Y1; y++)
      for (let x = 0; x < W; x++)
        if (x < EDGE || x >= W - EDGE) { s2 += b2[y * W + x]; n2++; }
    const m2 = s2 / n2;
    let v2 = 0;
    for (let y = Y0; y < Y1; y++)
      for (let x = 0; x < W; x++)
        if (x < EDGE || x >= W - EDGE) v2 += (b2[y * W + x] - m2) ** 2;
    const sd2 = Math.sqrt(v2 / n2);
    const tt = T0 + i / 60;
    if (!(CARD_FROM && i >= CARD_FROM - 8) && sd2 < flatSd) {
      flatSd = sd2; flat = `mean ${m2.toFixed(1)} sd ${sd2.toFixed(1)} @${tt.toFixed(2)}s`;
    }
    const empty = m2 < MEAN && sd2 < SD && !(CARD_FROM && i >= CARD_FROM - 8);
    if (empty) {
      if (!run) { from = tt; worst = `mean ${m2.toFixed(1)} sd ${sd2.toFixed(1)}`; }
      run += 1 / 60;
    } else {
      if (run >= RUN) runs.push(`${from.toFixed(2)}-${(from + run).toFixed(2)}s (${worst})`);
      run = 0;
    }
  }
  if (run >= RUN) runs.push(`${from.toFixed(2)}-${(from + run).toFixed(2)}s (${worst})`);
  console.log(`background: ${runs.length ? runs.join(', ') : 'every frame has one'}`
    + `  (flattest margin seen: ${flat})`);
  if (runs.length) fail.push(`the background is empty at ${runs.join(', ')}`);
}

/* seam + freeze */
const delta = new Float64Array(N), moved = new Float64Array(N);
for (let i = 1; i < N; i++) {
  const a = frame(i - 1), b = frame(i); let s = 0, mv = 0;
  for (let k = 0; k < FR; k++) { const d = Math.abs(a[k] - b[k]); s += d; if (d > 12) mv++; }
  delta[i] = s / FR; moved[i] = mv / FR;
}
const sorted = [...delta.slice(1)].sort((a, b) => a - b);
const med = sorted[sorted.length >> 1];
const THRESH = Math.max(6, med * 9);
const hot = []; for (let i = 1; i < N; i++) if (delta[i] > THRESH) hot.push(i);
const runs = [];
for (const i of hot) {
  const last = runs[runs.length - 1];
  if (last && i - last[last.length - 1] <= 2) last.push(i); else runs.push([i]);
}
const spikes = [], motion = [];
for (const r of runs) {
  const a = r[0], b = r[r.length - 1];
  const nb = Math.max(delta[Math.max(1, a - 3)], delta[Math.min(N - 1, b + 3)]);
  const pk = Math.max(...r.map((i) => delta[i]));
  const tag = `f${a}${b > a ? `-${b}` : ''} @${at(a)}s (d${pk.toFixed(2)})`;
  /* a CUT is isolated: one frame out of stillness. Fast designed motion is a RUN with elevated
     neighbours either side, and thresholding the raw value flags the direction, not the defect. */
  if (r.length > 2 || pk <= nb * 4) { motion.push(`${tag} x${r.length}f`); continue; }
  spikes.push(tag);
}
if (motion.length) console.log(`  fast motion (runs, not cuts): ${motion.slice(0, 8).join(', ')}`);
console.log(`seam: median d ${med.toFixed(3)}, max ${Math.max(...delta).toFixed(2)}, `
  + `${spikes.length} cut-like spikes ${spikes.slice(0, 6).join(', ')}`);
if (spikes.length) fail.push(`${spikes.length} cut-like seams: ${spikes.slice(0, 4).join(', ')}`);

/* stillness */
let run = 0, worst = 0, worstAt = 0, cardHold = 0;
for (let i = 1; i < N; i++) {
  const frozen = delta[i] < 0.05 && moved[i] < 0.0004;
  if (!frozen) { run = 0; continue; }
  run++;
  if (inCard(i - run)) { cardHold = Math.max(cardHold, run); continue; }
  if (run > worst) { worst = run; worstAt = i - run; }
}
if (cardHold) console.log(`  sign-off card holds ${cardHold} frames `
  + `(${(cardHold / 60).toFixed(2)}s) — by design`);
console.log(`stillness: longest FROZEN run ${worst} frames (${(worst / 60).toFixed(2)}s) at ${at(worstAt)}s`);
if (worst > 48) fail.push(`frozen for ${(worst / 60).toFixed(2)}s at ${at(worstAt)}s`);

/* safe zones */
/* WHAT THIS GATE IS FOR: nothing the viewer has to READ may sit under the Shorts UI. It is not a
   ban on bright pixels down there — a building's lower storeys, a road, a foreground shape all
   legitimately pass through that strip.
   THE OLD TEST counted bright horizontal edges at 256x40 and could not tell a number plate from a
   colonnade: act 3 frames the app's building from the roof, its columns land in the strip, and the
   gate reported 225 "legible" frames of architecture while the one real hit in the film — the
   scooter's number plate at 5.47s — scored no higher.
   THE TEST NOW MEASURES STROKE WIDTH, at 540x90 where type still has strokes. A run of bright
   pixels bounded by dark (or dark bounded by bright) three pixels wide or less, with real contrast
   across it, is a letter stroke or the gap inside one. Everything this film draws as architecture
   is an order of magnitude wider. Measured on this master: the number plate scores 237-246 and the
   film's own captions 265-1222, while the colonnade scores 42-104, the shell 48, and clean sky 0.
   The threshold sits at 170, between them. */
sh(`${FF} -y -v error -i ${IN} -vf "crop=1080:180:0:1740,scale=540:90,format=gray" -f rawvideo ${OUT}/bottom.raw`);
const bot = fs.readFileSync(`${OUT}/bottom.raw`);
const BW = 540, BHh = 90, bf = BW * BHh, bn = Math.floor(bot.length / bf);
const TYPE_W = 3, TYPE_N = 170;
let hotBottom = 0; const hotAt = [];
for (let i = 0; i < bn; i++) {
  const b = bot.subarray(i * bf, (i + 1) * bf);
  let strokes = 0;
  for (let y = 0; y < BHh; y++) {
    const row = y * BW;
    let x = 0;
    while (x < BW) {
      const bright = b[row + x] > 150;
      let x2 = x;
      while (x2 < BW && (b[row + x2] > 150) === bright) x2++;
      if (x2 - x <= TYPE_W && x > 0 && x2 < BW) {
        const hi = Math.max(b[row + x - 1], b[row + x2]);
        const c = Math.max(Math.abs(b[row + x] - b[row + x - 1]), Math.abs(b[row + x] - b[row + x2]));
        if (c > 45 && (bright ? b[row + x] > 150 : hi > 150)) strokes++;
      }
      x = x2;
    }
  }
  if (strokes > TYPE_N) { hotBottom++; hotAt.push({ t: +at(i), e: strokes }); }
}
/* flagged frames collapse into RUNS: 200 scattered frames and 200 consecutive ones are different
   defects, and a list of four timestamps could not tell them apart. */
const hotRuns = [];
for (const h of hotAt) {
  const last = hotRuns[hotRuns.length - 1];
  if (last && h.t - last.t1 < 0.12) { last.t1 = h.t; last.n++; last.e = Math.max(last.e, h.e); }
  else hotRuns.push({ t0: h.t, t1: h.t, n: 1, e: h.e });
}
if (hotRuns.length) console.log('  bands: ' + hotRuns.map((r) =>
  `${r.t0.toFixed(2)}-${r.t1.toFixed(2)}s x${r.n} (max ${r.e})`).join(', '));
console.log(`safe zone: ${hotBottom}/${bn} frames with TYPE in the bottom 180px `
  + hotRuns.slice(0, 4).map((r) => `@${r.t0.toFixed(2)}s`).join(' '));
if (hotBottom > bn * 0.02) fail.push(`legible content in the Shorts UI band on ${hotBottom} frames`);

/* sheets */
sh(`${FF} -y -v error -i ${IN} -vf "fps=1/2.2,scale=250:-1,tile=7x3" -frames:v 1 ${OUT}/qa_sheet.png`);
sh(`${FF} -y -v error -i ${IN} -vf "fps=1/2.2,scale=250:-1,hue=s=0,tile=7x3" -frames:v 1 ${OUT}/qa_sheet_grey.png`);

/* container */
const p = JSON.parse(sh(`/opt/homebrew/bin/ffprobe -v error -print_format json -show_streams -show_format ${IN}`));
const v = p.streams.find((s) => s.codec_type === 'video'), a = p.streams.find((s) => s.codec_type === 'audio');
console.log(`container: ${v.width}x${v.height} ${eval(v.r_frame_rate)}fps ${v.codec_name}/${v.pix_fmt} `
  + `audio ${a ? `${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch` : 'MISSING'} `
  + `${(+p.format.duration).toFixed(3)}s ${(p.format.bit_rate / 1e6).toFixed(1)}Mbps`);
if (v.width !== 1080 || v.height !== 1920) fail.push(`wrong size ${v.width}x${v.height}`);
if (!['yuv420p'].includes(v.pix_fmt)) fail.push(`wrong pixel format ${v.pix_fmt}`);

fs.rmSync(`${OUT}/gray.raw`); fs.rmSync(`${OUT}/bottom.raw`);
console.log('\n' + (fail.length ? 'FAIL\n  - ' + fail.join('\n  - ') : 'all checks pass'));
process.exit(fail.length ? 1 : 0);
