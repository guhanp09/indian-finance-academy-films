/* UPI SCAM 1 — ingest a RECORDED narration and re-measure the film to it.
 *
 * Same contract as narration.mjs, different source: instead of speaking the script, this takes the
 * two recorded parts, joins them with the hold the picture is cut into, and then measures where
 * every word of the locked script actually is. Everything downstream — 78 beats, every cue, the
 * camera, the score, the subtitles — re-times from that measurement. Nothing is hand-adjusted.
 *
 * The script is NOT re-written to match the read. If the read drifts from the locked script the
 * forced alignment says so and this stops, because the subtitles and every beat are keyed to the
 * script's own word order.
 *
 *   node tools/upi-scam/voice.mjs "part 1.mp3" "part 2.mp3" [gap] [leadIn] [tail]
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { SCRIPT, FRAGMENTS, assertScript } from './fragments.mjs';
import { measure } from './align.mjs';

assertScript();
const ROOT = path.resolve('.');
const A = process.argv.slice(2);
if (A.length < 2) throw new Error('give the two recorded parts');
const [P1, P2] = A;
/* the gap the picture is cut into: the card is flung, the debit lands, the sweep crosses it */
const GAP = Number(A[2] ?? 1.662);
/* The film opens ON the voice. Half a second of silence over a motionless tableau was the first
   thing the viewer got; 60ms is enough that the first consonant is not clipped by the encoder. */
const LEAD_IN = Number(A[3] ?? 0.06);
const TAIL = Number(A[4] ?? 1.15);
const FPS = 60;
const CACHE = path.join(ROOT, '.tts-upi');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const FFPROBE = '/opt/homebrew/bin/ffprobe';
fs.mkdirSync(CACHE, { recursive: true });

const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', f]).toString().trim());
/* trim each part's own head and tail silence, so the join is exactly the gap asked for and not
   the gap plus whatever the recording booth left on the ends */
const TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,'
  + 'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse';

const parts = [P1, P2].map((src, i) => {
  const out = path.join(CACHE, `voice_part${i + 1}.wav`);
  sh(FFMPEG, ['-y', '-i', src, '-ac', '1', '-ar', '48000', '-af', TRIM, out]);
  console.log(`  part ${i + 1}: ${dur(src).toFixed(3)}s -> ${dur(out).toFixed(3)}s trimmed`);
  return out;
});

const sil = path.join(CACHE, 'voice_gap.wav');
sh(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', GAP.toFixed(3), sil]);
const list = path.join(CACHE, 'voice_join.txt');
fs.writeFileSync(list, [parts[0], sil, parts[1]].map((f) => `file '${f}'`).join('\n'));
const joined = path.join(CACHE, 'voice_joined.wav');
sh(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);

/* lead-in, tail and the same loudness the mix was built against */
const narrWav = path.join(CACHE, 'narration.wav');
sh(FFMPEG, ['-y', '-i', joined, '-af',
  `adelay=${Math.round(LEAD_IN * 1000)}|${Math.round(LEAD_IN * 1000)},apad=pad_dur=${TAIL},`
  + 'loudnorm=I=-17:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '1', narrWav]);
const total = dur(narrWav);
console.log(`joined ${dur(joined).toFixed(3)}s  +lead ${LEAD_IN}  +tail ${TAIL}  = ${total.toFixed(3)}s`);

const W = measure(narrWav, SCRIPT, CACHE);

/* ── fragments ── */
let wi = 0;
const frags = FRAGMENTS.map((text, fi) => {
  const count = text.split(/\s+/).length;
  const ws = W.slice(wi, wi + count); wi += count;
  return { i: fi, text, words: ws.map((x) => x.w), start: ws[0].s, end: ws[ws.length - 1].e };
});
if (wi !== W.length) throw new Error(`fragment words ${wi} != script words ${W.length}`);
frags.forEach((f, k) => { f.until = k + 1 < frags.length ? frags[k + 1].start : f.end; });

sh(FFMPEG, ['-y', '-i', narrWav, '-c:a', 'libmp3lame', '-q:a', '2',
  path.join(ROOT, 'public/Audio/upi-narration.mp3')]);
sh('cp', [narrWav, path.join(ROOT, 'public/Audio/upi-narration.wav')]);

const words = SCRIPT.split(/\s+/).length;
const spoken = W[W.length - 1].e - W[0].s - GAP;
const out = {
  voice: 'recorded', source: [P1, P2].map((p) => path.basename(p)), fps: FPS,
  leadIn: LEAD_IN, tail: TAIL, hold: GAP, holdAfter: 'account.',
  duration: +total.toFixed(4), durationInFrames: Math.round(total * FPS),
  actualWpm: +((words / spoken) * 60).toFixed(1),
  method: 'recorded VO in two parts, joined with a measured hold, then whisper word timestamps + '
    + 'character-wise forced alignment + detector onsets',
  words: W.map((x) => ({ w: x.w, s: +x.s.toFixed(3), e: +x.e.toFixed(3),
    ...(x.guessed ? { guessed: true } : {}), ...(x.snapped ? { snapped: x.snapped } : {}) })),
  fragments: frags.map((f) => ({ i: f.i, text: f.text, start: +f.start.toFixed(3),
    end: +f.end.toFixed(3), until: +f.until.toFixed(3) })),
};
fs.writeFileSync(path.join(ROOT, 'src/upi-scam/narration.json'), JSON.stringify(out, null, 1));
const guessed = W.filter((x) => x.guessed).length;
console.log(`\nduration ${out.duration}s = ${out.durationInFrames} frames @${FPS}  (${out.actualWpm} wpm spoken)`);
if (guessed) console.log(`  !! ${guessed} word(s) had no ASR match and were interpolated`);
console.log('wrote src/upi-scam/narration.json, public/Audio/upi-narration.{wav,mp3}');
