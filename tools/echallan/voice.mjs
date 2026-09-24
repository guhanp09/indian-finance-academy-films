/* FAKE e-CHALLAN MALWARE — ingest a RECORDED narration and re-measure the film to it.
 *
 * Same contract as narration.mjs, different source. Give it the recorded parts; it joins them,
 * measures where every one of the 317 words actually is, and rewrites the clock. Everything
 * downstream — 222 blocks, every cue, the camera, the rig, the colour script, the score and the
 * subtitles — re-times from that measurement. Nothing is hand-adjusted.
 *
 * The script is NOT re-written to match the read. If the read drifts from the locked script the
 * forced alignment says so and this stops, because the subtitles ARE the script and they would
 * otherwise show words the voice never says.
 *
 *   node tools/echallan/voice.mjs part1.mp3 [part2.mp3 ...]
 *
 * then:  node tools/echallan/dump-cues.mjs && node tools/echallan/score.mjs
 *        node tools/echallan/render.mjs out/echallan.mp4
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { HOLDS, SCRIPT, FRAGMENTS, assertScript } from './fragments.mjs';
import { measure, activity } from './align.mjs';

assertScript();
const ROOT = path.resolve('.');
const PARTS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!PARTS.length) throw new Error('give at least one recorded part');
const LEAD_IN = Number(process.env.LEAD_IN ?? 0.08);
const TAIL = Number(process.env.TAIL ?? 1.30);
/* IF the read is delivered in parts, these are the gaps between them — but they are no longer the
   mechanism the film relies on. The seven designed holds are topped up to their exact lengths
   below, wherever they are and however the read produced them, so a single-file read works just as
   well as four. Kept only so an old four-part delivery still joins the way it used to. */
const GAPS = (process.env.GAPS ?? '0.34,0.82,0.95').split(',').map(Number);
const FPS = 60;
const CACHE = path.join(ROOT, '.tts-echallan');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const FFPROBE = '/opt/homebrew/bin/ffprobe';
fs.mkdirSync(CACHE, { recursive: true });

const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', f]).toString().trim());
/* trim each part's own head and tail silence, so a join is exactly the gap asked for and not the
   gap plus whatever the booth left on the ends */
const TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,'
  + 'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse';

const parts = PARTS.map((src, i) => {
  const out = path.join(CACHE, `voice_part${i + 1}.wav`);
  sh(FFMPEG, ['-y', '-i', src, '-ac', '1', '-ar', '48000', '-af', TRIM, out]);
  console.log(`  part ${i + 1}: ${dur(src).toFixed(3)}s -> ${dur(out).toFixed(3)}s trimmed`);
  return out;
});

const pieces = [parts[0]];
for (let i = 1; i < parts.length; i++) {
  const g = GAPS[i - 1] ?? 0.4;
  const sil = path.join(CACHE, `voice_gap${i}.wav`);
  sh(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', g.toFixed(3), sil]);
  pieces.push(sil, parts[i]);
  console.log(`  gap ${i}: ${g.toFixed(2)}s`);
}
const list = path.join(CACHE, 'voice_join.txt');
fs.writeFileSync(list, pieces.map((f) => `file '${f}'`).join('\n'));
const joined = path.join(CACHE, 'voice_joined.wav');
sh(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);

const narrWav = path.join(CACHE, 'narration.wav');
sh(FFMPEG, ['-y', '-i', joined, '-af',
  `adelay=${Math.round(LEAD_IN * 1000)}|${Math.round(LEAD_IN * 1000)},apad=pad_dur=${TAIL},`
  + 'loudnorm=I=-17:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '1', narrWav]);
let total = dur(narrWav);
console.log(`joined ${dur(joined).toFixed(3)}s  +lead ${LEAD_IN}  +tail ${TAIL} = ${total.toFixed(3)}s`);

/* ── THE DESIGNED HOLDS ARE MADE EXACT ──────────────────────────────────────────────────────
 *
 * These are not performance; they are cut lengths. The permission act is five events long and
 * needs about 3.0 s to land, the false ending has to close the viewer's loop before the reveal can
 * reopen it, and the reveal itself has to sit. A read that pauses for 0.6 s where the picture
 * needs 1.85 s interrupts its own machine.
 *
 * So this tool measures the pause the read actually takes at each anchor and TOPS IT UP to the
 * designed length — inserting `hold - existing`, never the whole hold on top of a pause that is
 * already there. Whatever the read did, the film gets the lengths it is cut to.
 *
 * AND IT HAS TO BE INAUDIBLE. Exactly one thing decides that, and it is not the shape of the join:
 *
 *   IT MUST CUT IN SILENCE. Not near silence, not at an energy minimum — in it.
 *
 * That sounds obvious and it is the whole bug. This used to take the pause from the ASR word map:
 * gap = W[k].e -> W[k+1].s. Those two numbers are not measurements. On this film's read the map
 * put the end of "background," at 46.016 s when the voice runs on to 46.220, and the start of
 * "You" at 57.400 when the audio is at the noise floor until 58.296. The gaps it reported were
 * 44 ms, 80 ms and 51 ms; the gaps that are actually in the recording are 404 ms, 748 ms and
 * 440 ms. So the tool believed there was no pause, hunted for the quietest 10 ms inside what was
 * really continuous speech, and found what it was always going to find in continuous speech — the
 * stop closure in "dro(p)per" and the nasal in "fi(n)e" — and cut there. The listener heard
 * "backgrou", a second and a half of nothing, and then "und".
 *
 * align.mjs now segments the read acoustically before it transcribes it, so W[k].e IS the moment
 * the voice stopped and W[k+1].s IS the moment it started again. The gap between them is a
 * measurement, and every one of these anchors turns out to have a real pause in it. The insert
 * goes in the middle of the quietest run inside that pause — the FIRST such run when the speaker
 * breathes in the gap, so the breath stays attached to the phrase it leads into, which is where a
 * breath belongs. Room tone rather than digital silence, so the floor never steps, and short fades
 * either side so the splice cannot click.
 *
 * AND THE MAP IS NOT RE-MEASURED AFTERWARDS. It used to be, and that was the second half of the
 * same mistake: this tool knows exactly what it inserted and where, so the spliced map is the
 * measured map plus arithmetic — exact, by construction. Re-running ASR on the cut file threw that
 * away and re-introduced its errors, which is how "Please" ended up recorded at 107.22 s when the
 * word starts at 108.29 and the phone rose almost a second before the narrator spoke.
 */
/** the whole read as 16-bit samples, so the insert point can be chosen from the audio itself.
 *  Via a file, not a pipe: two minutes of 48 kHz mono is 11.6 MB and execFileSync's default
 *  buffer is 1 MB, which fails with ENOBUFS rather than with anything that names the cause. */
const pcmOf = (f) => {
  const raw = path.join(CACHE, 'vhold_scan.raw');
  sh(FFMPEG, ['-y', '-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', '48000', raw]);
  const b = fs.readFileSync(raw);
  return new Int16Array(b.buffer, b.byteOffset, Math.floor(b.length / 2));
};
const rms = (pcm, i0, n) => {
  let a = 0;
  for (let i = i0; i < i0 + n && i < pcm.length; i++) a += pcm[i] * pcm[i];
  return Math.sqrt(a / n);
};
const dB = (v) => 20 * Math.log10(Math.max(1e-9, v / 32768));

/* the segmentation of the read BEFORE anything is cut — the thing the result is checked against.
   Not W.utterances: those are welded where a silence fell inside a word, and the check wants the
   raw edges so a new boundary appearing anywhere is a failure. */
const PRE = activity(narrWav, CACHE).segs.filter((g) => g.speech).map((g) => ({ s: g.s, e: g.e }));
let W = measure(narrWav, SCRIPT, CACHE);
const HEARD = W.heard;   // the SOURCE read, as ASR heard it, before a single sample was cut
{
  const SW = SCRIPT.split(/\s+/);
  let from = 0;
  const pcm = pcmOf(narrWav);
  const SR = 48000, WIN = Math.round(0.008 * SR), STEP = Math.round(0.002 * SR);
  const floor = (() => {                       // the read's own noise floor, from its longest gap
    let best = -20, bs = 0;
    for (let i = 1; i < PRE.length; i++) if (PRE[i].s - PRE[i - 1].e > best) { best = PRE[i].s - PRE[i - 1].e; bs = PRE[i - 1].e; }
    return dB(rms(pcm, Math.round((bs + best / 2) * SR), Math.round(0.10 * SR)));
  })();
  const QUIET = floor + 8;
  console.log(`  read noise floor ${floor.toFixed(1)} dBFS; a splice must sit under ${QUIET.toFixed(1)}`);

  const cuts = HOLDS.map(({ after, hold }) => {
    const k = SW.indexOf(after, from);
    if (k < 0) throw new Error(`hold anchor "${after}" not found after word ${from}`);
    from = k + 1;
    const g0 = W[k].e, g1 = W[k + 1].s;
    const have = Math.max(0, g1 - g0);
    const need = hold - have;
    /* WHERE IN THE PAUSE. The quietest 20 ms in it, and among points that are equally quiet the
       one nearest its middle, with the first and last 30 ms excluded so a fade can never reach a
       word. Note that a pause is not always silent: the speaker breathes in three of these, and
       the breath after "background," fills the whole 0.40 s at -41 to -60 dBFS over a floor of
       -84. There is nothing better to do there than splice at the quietest moment of it and let
       the fade decay it, which is what an editor does by hand — but it is reported, because a
       splice into a breath is the one that would be heard first if it were done badly. */
    const EDGE = 0.030, LVL = Math.round(0.020 * SR);
    let at = (g0 + g1) / 2, lvl = 0;
    const a0 = Math.round((g0 + EDGE) * SR), a1 = Math.round((g1 - EDGE) * SR) - LVL;
    if (a1 > a0) {
      let best = Infinity;
      const scan = [];
      for (let i = a0; i <= a1; i += STEP) { const v = dB(rms(pcm, i, LVL)); scan.push([i, v]); if (v < best) best = v; }
      const mid = (g0 + g1) / 2 * SR;
      const pick = scan.filter(([, v]) => v <= best + 3).sort((x, y) => Math.abs(x[0] - mid) - Math.abs(y[0] - mid))[0];
      at = (pick[0] + LVL / 2) / SR; lvl = pick[1];
    }
    const kind = lvl < floor + 12 ? 'silent' : lvl < -40 ? 'a breath' : 'NOT SILENT';
    console.log(`  after "${after}": read pauses ${have.toFixed(3)}s, picture needs ${hold.toFixed(2)}s`
      + ` -> ${need > 0.02 ? `+${need.toFixed(3)}s` : 'left alone'}`
      + `   [splice ${at.toFixed(3)}s at ${lvl.toFixed(0)} dBFS — ${kind}]`);
    if (need > 0.02 && lvl > -40) throw new Error(`the quietest point in the pause after "${after}" `
      + `is ${lvl.toFixed(0)} dBFS, which is still speech — the read does not pause there and a `
      + `splice would be heard. Either the read must pause at that word or the hold must come out `
      + `of the picture.`);
    return { at, k, after, add: need > 0.02 ? need : 0, hold, have };
  }).filter((c) => c.add > 0).sort((a, b) => a.at - b.at);

  if (cuts.length) {
    /* room tone from the quietest half-second IN THE SPOKEN SPAN. Not the whole file: this tool
       pads the head and tail with digital silence itself, and sampling that would splice
       -180 dBFS into a read that has a floor — the very hole the room tone exists to avoid. */
    const TONE = Math.round(0.5 * SR);
    const lo = Math.round((W[0].s + 0.30) * SR);
    const hi = Math.round((W[W.length - 1].e - 0.30) * SR) - TONE;
    let tq = Infinity, ti = lo;
    for (let i = lo; i < hi; i += Math.round(0.05 * SR)) {
      const r = rms(pcm, i, TONE);
      if (r < tq) { tq = r; ti = i; }
    }
    const tone = path.join(CACHE, 'vhold_tone.wav');
    sh(FFMPEG, ['-y', '-ss', (ti / SR).toFixed(6), '-i', narrWav, '-t', '0.5',
      '-ar', '48000', '-ac', '1', tone]);
    console.log(`  room tone from ${(ti / SR).toFixed(2)}s (floor ${dB(tq).toFixed(1)} dBFS)`);

    /* THE SPLICE. Both sides are already silent, so the fades are only there to stop a step in the
       room tone from clicking; they are not hiding a truncated word, because no word is truncated.
       Everything is computed in SAMPLES and placed to six decimals — a fifth of a sample. */
    const FADE = 0.012;
    const pieces = [];
    let prev = 0;
    cuts.forEach((c, i) => {
      const seg = path.join(CACHE, `vhold_seg${i}.wav`);
      const len = c.at - prev;
      const af = [
        i ? `afade=t=in:st=0:d=${FADE}` : null,
        `afade=t=out:st=${Math.max(0, len - FADE).toFixed(6)}:d=${FADE}`,
      ].filter(Boolean).join(',');
      sh(FFMPEG, ['-y', '-ss', prev.toFixed(6), '-i', narrWav, '-t', len.toFixed(6),
        '-af', af, '-ar', '48000', '-ac', '1', seg]);
      const sil = path.join(CACHE, `vhold_sil${i}.wav`);
      sh(FFMPEG, ['-y', '-stream_loop', '-1', '-i', tone, '-t', c.add.toFixed(6),
        '-af', `afade=t=in:st=0:d=0.008,afade=t=out:st=${Math.max(0, c.add - 0.008).toFixed(6)}:d=0.008`,
        '-ar', '48000', '-ac', '1', sil]);
      pieces.push(seg, sil);
      prev = c.at;
    });
    const last = path.join(CACHE, 'vhold_last.wav');
    sh(FFMPEG, ['-y', '-ss', prev.toFixed(6), '-i', narrWav,
      '-af', `afade=t=in:st=0:d=${FADE}`, '-ar', '48000', '-ac', '1', last]);
    pieces.push(last);
    const hl = path.join(CACHE, 'vhold.txt');
    fs.writeFileSync(hl, pieces.map((f) => `file '${f}'`).join('\n'));
    const held = path.join(CACHE, 'voice_held.wav');
    sh(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', hl, '-c', 'copy', held]);
    fs.renameSync(held, narrWav);

    /* THE MAP IS ARITHMETIC. We cut the file, so we know where every word went: a time t moves by
       the total inserted before t, and nothing else changes. No second measurement, no pinning, no
       repair — and no chance of a fresh ASR error landing on a word the picture is cued to. */
    const shift = (t) => t + cuts.reduce((a, c) => a + (c.at <= t ? c.add : 0), 0);
    W.forEach((w) => { w.s = +shift(w.s).toFixed(6); w.e = +shift(w.e).toFixed(6); });
    PRE.forEach((u) => { u.s = shift(u.s); u.e = shift(u.e); });
    total = dur(narrWav);
    const added = cuts.reduce((a, c) => a + c.add, 0);
    console.log(`  ${cuts.length} hold(s) spliced, +${added.toFixed(3)}s`
      + ` — narration is now ${total.toFixed(3)}s`);

    /* ── AND IT IS CHECKED AGAINST THE FILE THAT WAS WRITTEN ────────────────────────────────
     * Re-segment the result and require that the voice stops and starts exactly where the map now
     * says it does, and that every designed hold is the length it was designed to be. If a splice
     * had landed inside a word, the utterance boundary would move and this would not add up. */
    const re = activity(narrWav, CACHE).segs.filter((g) => g.speech);
    if (re.length !== PRE.length) throw new Error(`the spliced read has ${re.length} utterances, `
      + `${PRE.length} before the splice — a cut landed inside speech`);
    let worst = 0, worstAt = '';
    re.forEach((g, i) => {
      for (const [a, b, what] of [[g.s, PRE[i].s, 'start'], [g.e, PRE[i].e, 'end']]) {
        if (Math.abs(a - b) > worst) { worst = Math.abs(a - b); worstAt = `${what} of utterance ${i} (${b.toFixed(3)}s)`; }
      }
    });
    if (worst > 0.012) throw new Error(`the spliced audio disagrees with the map by `
      + `${(worst * 1000).toFixed(0)}ms at the ${worstAt}`);
    let bad = [];
    from = 0;
    for (const { after, hold } of HOLDS) {
      const k = SW.indexOf(after, from); from = k + 1;
      const gap = W[k + 1].s - W[k].e;
      if (gap < hold - 0.015) bad.push(`"${after}" ${gap.toFixed(3)}s < ${hold.toFixed(2)}s`);
    }
    if (bad.length) throw new Error(`hold(s) short after splicing: ${bad.join(', ')}`);
    console.log(`  verified against the written file: utterance edges within `
      + `${(worst * 1000).toFixed(1)}ms, every hold at its designed length`);
  }
}

let wi = 0;
const blocks = FRAGMENTS.map((text, fi) => {
  const count = text.split(/\s+/).length;
  const ws = W.slice(wi, wi + count); wi += count;
  return { i: fi, text, start: ws[0].s, end: ws[ws.length - 1].e };
});
if (wi !== W.length) throw new Error(`fragment words ${wi} != script words ${W.length}`);
blocks.forEach((b, k) => { b.until = k + 1 < blocks.length ? blocks[k + 1].start : b.end; });

sh(FFMPEG, ['-y', '-i', narrWav, '-c:a', 'libmp3lame', '-q:a', '2',
  path.join(ROOT, 'public/Audio/echallan-narration.mp3')]);
sh('cp', [narrWav, path.join(ROOT, 'public/Audio/echallan-narration.wav')]);

const words = SCRIPT.split(/\s+/).length;
/* the true speaking rate: the span of the read minus every designed silence inside it */
const spoken = W[W.length - 1].e - W[0].s
  - HOLDS.reduce((a, h) => a + h.hold, 0)
  - GAPS.slice(0, parts.length - 1).reduce((a, b) => a + b, 0);
const out = {
  voice: 'recorded', provisional: false, source: PARTS.map((p) => path.basename(p)), fps: FPS,
  leadIn: LEAD_IN, tail: TAIL, gaps: GAPS.slice(0, parts.length - 1),
  holds: HOLDS.map((h) => ({ after: h.after, hold: h.hold })),
  duration: +total.toFixed(4), durationInFrames: Math.round(total * FPS),
  actualWpm: +((words / spoken) * 60).toFixed(1),
  method: 'recorded VO, joined with measured holds, then whisper word timestamps + character-wise '
    + 'forced alignment + detector onsets',
  heard: HEARD,
  words: W.map((x) => ({ w: x.w, s: +x.s.toFixed(3), e: +x.e.toFixed(3),
    ...(x.guessed ? { guessed: true } : {}), ...(x.snapped ? { snapped: x.snapped } : {}) })),
  blocks: blocks.map((b) => ({ i: b.i, text: b.text, start: +b.start.toFixed(3),
    end: +b.end.toFixed(3), until: +b.until.toFixed(3) })),
};
fs.writeFileSync(path.join(ROOT, 'src/echallan/narration.json'), JSON.stringify(out, null, 1));
console.log(`\nduration ${out.duration}s = ${out.durationInFrames} frames @${FPS} `
  + `(${out.actualWpm} wpm spoken)`);
console.log('wrote src/echallan/narration.json — now run dump-cues, score, render');
