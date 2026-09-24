/* UPI SCAM 1 — narration synthesis and MEASURED word map.
 *
 * The production spec makes the waveform authoritative: no visual beat may be placed from a
 * word-count estimate. So this tool speaks the locked script ONCE (one utterance, so the prosody
 * is a narrator's and not a series of phrase-final drops), retimes it to the target pace, and then
 * measures where every one of the 94 words actually starts and ends.
 *
 * Measurement is by forced alignment: ASR with word timestamps gives a time-stamped token stream,
 * which is aligned CHARACTER-WISE against the known transcript. Character-wise alignment is used
 * rather than token-wise because ASR tokenises acronyms unpredictably ("UPI" / "U P I" / "U.P.I.")
 * and a character stream is immune to that. Times inside a matched ASR token are interpolated by
 * character fraction, which is what makes a word inside a multi-word token still placeable.
 *
 *   node tools/upi-scam/narration.mjs [wpm] [leadIn] [tail]
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { SCRIPT, FRAGMENTS, assertScript, toSpeech } from './fragments.mjs';
import { measure as measureFile } from './align.mjs';

assertScript();

const ROOT = path.resolve('.');
const A = process.argv.slice(2);
const TARGET_WPM = Number(A[0] ?? 170);
const LEAD_IN = Number(A[1] ?? 0.45);
const TAIL = Number(A[2] ?? 1.15);
const VOICE = process.env.TTS_VOICE ?? 'Rishi';
const FPS = 60;
const CACHE = path.join(ROOT, '.tts-upi');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const FFPROBE = '/opt/homebrew/bin/ffprobe';

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'src/upi-scam'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/Audio'), { recursive: true });

const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', f]).toString().trim());
const TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,'
  + 'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse';

/* ── 1. the read: whole script, one utterance ── */
const speech = toSpeech(SCRIPT);
const h = crypto.createHash('md5').update(`${VOICE}|${speech}`).digest('hex').slice(0, 12);
const rawWav = path.join(CACHE, `raw_${h}.wav`);
if (!fs.existsSync(rawWav)) {
  const aiff = path.join(CACHE, `t_${h}.aiff`);
  sh('say', ['-v', VOICE, '-o', aiff, speech]);
  sh(FFMPEG, ['-y', '-i', aiff, '-ac', '1', '-ar', '48000', '-af', TRIM, rawWav]);
  fs.unlinkSync(aiff);
}
const rawDur = dur(rawWav);
const words = SCRIPT.split(/\s+/).length;
const rawWpm = (words / rawDur) * 60;
// atempo=T scales duration by 1/T, so it scales pace by T: T = target/raw.
const tempo = TARGET_WPM / rawWpm;
console.log(`raw read ${rawDur.toFixed(3)}s = ${rawWpm.toFixed(1)} wpm -> atempo ${tempo.toFixed(4)}`);

const readWav = path.join(CACHE, `read_${h}_${tempo.toFixed(4)}.wav`);
if (!fs.existsSync(readWav))
  sh(FFMPEG, ['-y', '-i', rawWav, '-af', `atempo=${tempo.toFixed(4)}`, '-ar', '48000', '-ac', '1', readWav]);
const readDur = dur(readWav);

/* ── 2. pad to the film's clock ── */
const narrWav = path.join(CACHE, 'narration.wav');
sh(FFMPEG, ['-y', '-i', readWav, '-af',
  `adelay=${Math.round(LEAD_IN * 1000)}|${Math.round(LEAD_IN * 1000)},apad=pad_dur=${TAIL},`
  + 'loudnorm=I=-17:TP=-1.5:LRA=9',
  '-ar', '48000', '-ac', '1', narrWav]);
const totalDur = dur(narrWav);
console.log(`read ${readDur.toFixed(3)}s  +lead ${LEAD_IN}  +tail ${TAIL}  = ${totalDur.toFixed(3)}s`);

/* ── 3. MEASUREMENT — tools/upi-scam/align.mjs, shared with the recorded-voice path ───────────────
   Run more than once on purpose: the film needs a HOLD inserted at a word boundary, and the only
   way to know where that boundary is in the audio is to measure the audio first. Pass 1 finds it,
   pass 2 measures the held read, and pass 2 is authoritative. */
/* ── 3b. THE HOLD ───────────────────────────────────────────────────────────────────────────
   The debit has to finish telling its story before the next sentence starts: the request card
   has to leave, the transaction has to land in the history, and the shine has to travel across
   it. That takes about 1.4s and the narrator's own breath after "account." is only 0.46s, so
   silence is inserted at that boundary. The SCRIPT IS UNCHANGED — not a word is added, removed
   or reordered; the read simply waits. Everything downstream re-times from the new measurement. */
const HOLD_AFTER = 'account.';
const HOLD = Number(process.env.UPI_HOLD ?? 1.20);

const measure = (f) => measureFile(f, SCRIPT, CACHE);
let W = measure(narrWav);
if (HOLD > 0.01) {
  const k = SCRIPT.split(/\s+/).indexOf(HOLD_AFTER);
  if (k < 0) throw new Error(`hold anchor "${HOLD_AFTER}" is not a word in the script`);
  const split = (W[k].e + W[k + 1].s) / 2;
  console.log(`inserting ${HOLD.toFixed(2)}s hold after "${HOLD_AFTER}" at ${split.toFixed(3)}s`);
  const a = path.join(CACHE, 'hold_a.wav'), b = path.join(CACHE, 'hold_b.wav');
  const sil = path.join(CACHE, `hold_sil.wav`);
  sh(FFMPEG, ['-y', '-i', narrWav, '-t', split.toFixed(4), '-ar', '48000', '-ac', '1', a]);
  sh(FFMPEG, ['-y', '-ss', split.toFixed(4), '-i', narrWav, '-ar', '48000', '-ac', '1', b]);
  sh(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', HOLD.toFixed(3), sil]);
  const list = path.join(CACHE, 'hold.txt');
  fs.writeFileSync(list, [a, sil, b].map((f) => `file '${f}'`).join('\n'));
  const held = path.join(CACHE, 'narration_held.wav');   // ffmpeg picks the muxer from the
  sh(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', held]);   // extension
  fs.renameSync(held, narrWav);
  W = measure(narrWav);
}
const totalDur2 = dur(narrWav);
console.log(`final read ${totalDur2.toFixed(3)}s`);

/* ── 4. fragments ── */
let wi = 0;
const frags = FRAGMENTS.map((text, fi) => {
  const count = text.split(/\s+/).length;
  const ws = W.slice(wi, wi + count); wi += count;
  return { i: fi, text, words: ws.map((x) => x.w), start: ws[0].s, end: ws[ws.length - 1].e };
});
if (wi !== W.length) throw new Error(`fragment words ${wi} != script words ${W.length}`);
/* a fragment OWNS the clock up to the next fragment's first word, so nothing falls in a crack */
frags.forEach((f, k) => { f.until = k + 1 < frags.length ? frags[k + 1].start : f.end; });

/* ── 5. ship ── */
sh(FFMPEG, ['-y', '-i', narrWav, '-c:a', 'libmp3lame', '-q:a', '2',
  path.join(ROOT, 'public/Audio/upi-narration.mp3')]);
sh('cp', [narrWav, path.join(ROOT, 'public/Audio/upi-narration.wav')]);

const out = {
  voice: VOICE, targetWpm: TARGET_WPM, fps: FPS,
  leadIn: LEAD_IN, tail: TAIL, hold: HOLD, holdAfter: HOLD_AFTER,
  readDur: +readDur.toFixed(4), duration: +totalDur2.toFixed(4),
  durationInFrames: Math.round(totalDur2 * FPS),
  actualWpm: +((words / readDur) * 60).toFixed(1),
  method: 'one-utterance say + whisper word timestamps + character-wise forced alignment + detector onsets; a hold inserted at one word boundary',
  words: W.map((x) => ({ w: x.w, s: +x.s.toFixed(3), e: +x.e.toFixed(3), ...(x.guessed ? { guessed: true } : {}), ...(x.snapped ? { snapped: x.snapped } : {}) })),
  fragments: frags.map((f) => ({ i: f.i, text: f.text, start: +f.start.toFixed(3), end: +f.end.toFixed(3), until: +f.until.toFixed(3) })),
};
fs.writeFileSync(path.join(ROOT, 'src/upi-scam/narration.json'), JSON.stringify(out, null, 1));
console.log(`\nduration ${out.duration}s = ${out.durationInFrames} frames @${FPS}  (${out.actualWpm} wpm)`);
console.log('wrote src/upi-scam/narration.json, public/Audio/upi-narration.{wav,mp3}');
