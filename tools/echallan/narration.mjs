/* FAKE e-CHALLAN MALWARE — narration synthesis and MEASURED word map.
 *
 * The production plan makes the waveform authoritative: "conform the timestamps to the real
 * waveform without deleting, shortening, or collapsing semantic beats." So no visual beat in this
 * film is ever placed from a word-count estimate. This tool speaks the locked script ONCE (one
 * utterance, so the prosody is a narrator's rather than 14 phrase-final drops), retimes it to a
 * target pace, inserts the designed holds at word boundaries, and then MEASURES where every one of
 * the 317 words actually starts and ends.
 *
 * Measurement is tools/echallan/align.mjs — the same forced aligner the recorded-voice path uses,
 * so a synthesised read and a recorded one are measured identically and the film re-times from
 * either without a single hand adjustment.
 *
 *   node tools/echallan/narration.mjs [wpm] [leadIn] [tail]
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { HOLDS, SCRIPT, FRAGMENTS, assertScript, toSpeech } from './fragments.mjs';
import { measure as measureFile } from './align.mjs';

assertScript();

const ROOT = path.resolve('.');
const A = process.argv.slice(2);
const TARGET_WPM = Number(A[0] ?? 150);
const LEAD_IN = Number(A[1] ?? 0.08);   // the film opens ON the voice — see premortem H1
const TAIL = Number(A[2] ?? 1.30);
const VOICE = process.env.TTS_VOICE ?? 'Rishi';
const FPS = 60;
const CACHE = path.join(ROOT, '.tts-echallan');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const FFPROBE = '/opt/homebrew/bin/ffprobe';

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'src/echallan'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/Audio'), { recursive: true });

const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', f]).toString().trim());
const TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,'
  + 'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse';



/* ── 1. the read: whole script, one utterance ───────────────────────────────────────────────*/
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
const tempo = TARGET_WPM / rawWpm;   // atempo=T scales pace by T
console.log(`raw read ${rawDur.toFixed(3)}s = ${rawWpm.toFixed(1)} wpm -> atempo ${tempo.toFixed(4)}`);

const readWav = path.join(CACHE, `read_${h}_${tempo.toFixed(4)}.wav`);
if (!fs.existsSync(readWav))
  sh(FFMPEG, ['-y', '-i', rawWav, '-af', `atempo=${tempo.toFixed(4)}`, '-ar', '48000', '-ac', '1', readWav]);
const readDur = dur(readWav);

/* ── 2. pad to the film's clock ─────────────────────────────────────────────────────────────*/
const narrWav = path.join(CACHE, 'narration.wav');
sh(FFMPEG, ['-y', '-i', readWav, '-af',
  `adelay=${Math.round(LEAD_IN * 1000)}|${Math.round(LEAD_IN * 1000)},apad=pad_dur=${TAIL},`
  + 'loudnorm=I=-17:TP=-1.5:LRA=9',
  '-ar', '48000', '-ac', '1', narrWav]);
console.log(`read ${readDur.toFixed(3)}s  +lead ${LEAD_IN}  +tail ${TAIL}  = ${dur(narrWav).toFixed(3)}s`);

/* ── 3. MEASURE, INSERT THE HOLDS, MEASURE AGAIN ────────────────────────────────────────────
   Two passes on purpose: the only way to know where a word boundary is in the audio is to measure
   the audio. Pass 1 finds the boundaries, pass 2 measures the held read, and pass 2 is
   authoritative for the entire film. */
const measure = (f) => measureFile(f, SCRIPT, CACHE);
const SW = SCRIPT.split(/\s+/);
/** where each designed hold actually is in the shipped audio — filled in after the second pass */
const HOLD_SPANS = [];
let W = measure(narrWav);

if (HOLDS.length) {
  /* resolve every boundary against pass 1, then cut once */
  let from = 0;
  const cuts = HOLDS.map(({ after, hold }) => {
    const k = SW.indexOf(after, from);
    if (k < 0) throw new Error(`hold anchor "${after}" not found in the script after word ${from}`);
    from = k + 1;
    const at = (W[k].e + W[k + 1].s) / 2;
    console.log(`  hold ${hold.toFixed(2)}s after "${after}" (word ${k}) at ${at.toFixed(3)}s`);
    return { at, hold, k, after };
  }).sort((a, b) => a.at - b.at);

  const pieces = [];
  let prev = 0;
  cuts.forEach((c, i) => {
    const seg = path.join(CACHE, `hold_seg${i}.wav`);
    sh(FFMPEG, ['-y', '-ss', prev.toFixed(4), '-i', narrWav, '-t', (c.at - prev).toFixed(4),
      '-ar', '48000', '-ac', '1', seg]);
    const sil = path.join(CACHE, `hold_sil${i}.wav`);
    sh(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', c.hold.toFixed(3), sil]);
    pieces.push(seg, sil);
    prev = c.at;
  });
  const last = path.join(CACHE, 'hold_last.wav');
  sh(FFMPEG, ['-y', '-ss', prev.toFixed(4), '-i', narrWav, '-ar', '48000', '-ac', '1', last]);
  pieces.push(last);

  const list = path.join(CACHE, 'hold.txt');
  fs.writeFileSync(list, pieces.map((f) => `file '${f}'`).join('\n'));
  const held = path.join(CACHE, 'narration_held.wav');
  sh(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', held]);
  fs.renameSync(held, narrWav);
  W = measure(narrWav);

  /* ── THE HOLDS ARE KNOWN, SO THEY ARE NOT RE-ESTIMATED ─────────────────────────────────────
     Pass 2 measures the held read from scratch, and a SHORT designed hold can be swallowed: ASR
     ran "malware. The" together and gave "The" an onset 0.28s before the inserted silence even
     began, so the aligner's detector snap — which only considers words starting at or after a
     silence — never saw it, and B(128) came out 0.739s early. One broken anchor, on the sentence
     that opens the theft.

     It is not an estimation problem. This tool CUT the audio and inserted the silence, so it
     knows to the sample where each hold is and which word sits on either side of it: word k is
     the last word before hold k and word k+1 is the first word after it. A word cannot be spoken
     across a digital silence, so those two boundaries are facts, not measurements, and they are
     applied here after the measurement rather than hoped for from it. */
  let acc = 0, pinned = 0;
  for (const c of cuts) {
    const s0 = c.at + acc, s1 = s0 + c.hold; acc += c.hold;
    const before = W[c.k], after = W[c.k + 1];
    if (before && before.e > s0 + 1e-3) { before.e = Math.max(before.s + 0.05, s0); pinned++; }
    if (after && after.s < s1 - 1e-3) {
      after.s = s1; after.e = Math.max(after.e, after.s + 0.05); after.pinned = true; pinned++;
    }
    HOLD_SPANS.push({ after: c.after, s: s0, e: s1 });
  }
  for (let k = 1; k < W.length; k++) if (W[k].s < W[k - 1].s + 0.02) W[k].s = W[k - 1].s + 0.02;
  for (let k = 0; k < W.length; k++) if (W[k].e < W[k].s + 0.03) W[k].e = W[k].s + 0.03;
  console.log(`  designed holds: ${HOLD_SPANS.length}, boundaries pinned ${pinned}`);
  /* and no word may be left starting inside a hold this tool put there */
  for (const h of HOLD_SPANS) {
    const bad = W.filter((w) => w.s > h.s + 0.02 && w.s < h.e - 0.02);
    if (bad.length)
      throw new Error(`${bad.length} word(s) start inside the designed hold after "${h.after}" `
        + `(${h.s.toFixed(3)}..${h.e.toFixed(3)}): ${bad.map((w) => `"${w.w}"`).join(', ')}`);
  }
}
const total = dur(narrWav);
console.log(`final read ${total.toFixed(3)}s`);

/* ── 4. fragments: the plan's 222 blocks, given measured clocks ─────────────────────────────*/
let wi = 0;
const frags = FRAGMENTS.map((text, fi) => {
  const count = text.split(/\s+/).length;
  const ws = W.slice(wi, wi + count); wi += count;
  return { i: fi, text, start: ws[0].s, end: ws[ws.length - 1].e };
});
if (wi !== W.length) throw new Error(`fragment words ${wi} != script words ${W.length}`);
/* a block OWNS the clock up to the next block's first word, so nothing falls in a crack */
frags.forEach((f, k) => { f.until = k + 1 < frags.length ? frags[k + 1].start : f.end; });

/* ── 5. ship ────────────────────────────────────────────────────────────────────────────────*/
sh(FFMPEG, ['-y', '-i', narrWav, '-c:a', 'libmp3lame', '-q:a', '2',
  path.join(ROOT, 'public/Audio/echallan-narration.mp3')]);
sh('cp', [narrWav, path.join(ROOT, 'public/Audio/echallan-narration.wav')]);

const spoken = W[W.length - 1].e - W[0].s - HOLDS.reduce((a, b) => a + b.hold, 0);
const out = {
  voice: VOICE, provisional: true, targetWpm: TARGET_WPM, fps: FPS,
  leadIn: LEAD_IN, tail: TAIL, holds: HOLDS,
  holdSpans: HOLD_SPANS.map((h) => ({ after: h.after, s: +h.s.toFixed(3), e: +h.e.toFixed(3) })),
  duration: +total.toFixed(4), durationInFrames: Math.round(total * FPS),
  actualWpm: +((words / spoken) * 60).toFixed(1),
  method: 'one-utterance say + whisper word timestamps + character-wise forced alignment + '
    + 'detector onsets; designed holds inserted at word boundaries, then re-measured',
  words: W.map((x) => ({ w: x.w, s: +x.s.toFixed(3), e: +x.e.toFixed(3),
    ...(x.guessed ? { guessed: true } : {}), ...(x.snapped ? { snapped: x.snapped } : {}),
    ...(x.pinned ? { pinned: true } : {}) })),
  blocks: frags.map((f) => ({ i: f.i, text: f.text, start: +f.start.toFixed(3),
    end: +f.end.toFixed(3), until: +f.until.toFixed(3) })),
};
fs.writeFileSync(path.join(ROOT, 'src/echallan/narration.json'), JSON.stringify(out, null, 1));
const guessed = W.filter((x) => x.guessed).length;
console.log(`\nduration ${out.duration}s = ${out.durationInFrames} frames @${FPS}  `
  + `(${out.actualWpm} wpm spoken, ${words} words)`);
if (guessed) console.log(`  !! ${guessed} word(s) had no ASR match and were interpolated`);
console.log('wrote src/echallan/narration.json, public/Audio/echallan-narration.{wav,mp3}');
