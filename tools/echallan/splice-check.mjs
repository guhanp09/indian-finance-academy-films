/* THE SPLICES, CHECKED AGAINST THE DELIVERED FILE. — node tools/echallan/splice-check.mjs
 *
 * This is the gate that should have caught the bug it is named for, and did not exist when it was
 * written the first time. The old version printed an amplitude envelope either side of each hold
 * and left a human to read it; a human read it and concluded the joins were fine, because a join
 * CAN look like a clean decay and still be in the middle of a word — the /p/ closure in "dropper"
 * is 60 ms of genuine silence and it plots as a perfect decay.
 *
 * So this does not look at the shape of the join. It asks the only question that matters:
 *
 *     IS EVERY WORD STILL WHOLE?
 *
 * It re-segments the delivered narration acoustically, transcribes every utterance on its own, and
 * checks the result against the locked script three ways:
 *   1. the whole read, word for word, so a syllable lost anywhere in the film shows up;
 *   2. at each designed hold, that the utterance before it ENDS on the anchor word and the one
 *      after it BEGINS on the next word — the direct test for "backgrou … und";
 *   3. that the silence at each anchor is the length the picture is cut to.
 * and it measures the level at each join, because a splice laid into speech is loud and a splice
 * laid into silence is not.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { HOLDS, SCRIPT, assertScript } from './fragments.mjs';
import { activity } from './align.mjs';

assertScript();
const FF = '/opt/homebrew/bin/ffmpeg';
const CACHE = path.resolve('.tts-echallan');
const FILE = process.argv[2] || 'public/Audio/echallan-narration.wav';
const N = JSON.parse(fs.readFileSync('src/echallan/narration.json', 'utf8'));
const SR = 48000;
const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
const near = (a, b) => {
  if (a === b) return true;
  const lim = Math.floor(Math.max(a.length, b.length) / 5);
  if (lim < 1 || Math.abs(a.length - b.length) > lim) return false;
  let p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const r = [i];
    for (let j = 1; j <= b.length; j++) r[j] = Math.min(p[j] + 1, r[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = r;
  }
  return p[b.length] <= lim;
};

const { segs } = activity(FILE, CACHE);
const utt = segs.filter((g) => g.speech);
console.log(`${path.basename(FILE)}: ${utt.length} utterances`);

/* transcribe every utterance on its own */
const clips = utt.map((g, i) => {
  const f = path.join(CACHE, `sc_${i}.wav`);
  sh(FF, ['-y', '-v', 'error', '-ss', g.s.toFixed(6), '-t', (g.e - g.s).toFixed(6), '-i', FILE,
    '-ar', '16000', '-ac', '1', f]);
  return f;
});
const outJson = path.join(CACHE, 'sc_texts.json');
const r = spawnSync('python3', ['-c', `
import json, warnings, mlx_whisper
warnings.filterwarnings("ignore")
clips = json.load(open(${JSON.stringify(path.join(CACHE, 'sc_clips.json'))}))
json.dump([mlx_whisper.transcribe(c, path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
    language="en", condition_on_previous_text=False)["text"].strip() for c in clips],
    open(${JSON.stringify(outJson)}, "w"))
`], { encoding: 'utf8', input: fs.writeFileSync(path.join(CACHE, 'sc_clips.json'), JSON.stringify(clips)) });
if (r.status !== 0) { process.stderr.write(r.stderr || ''); throw new Error('ASR failed'); }
const texts = JSON.parse(fs.readFileSync(outJson, 'utf8'));
clips.forEach((f) => fs.rmSync(f, { force: true }));

const fail = [];

/* ── 1. every word of the film, still whole ─────────────────────────────────────────────────── */
{
  const want = norm(SCRIPT), got = texts.flatMap(norm);
  const L = Array.from({ length: want.length + 1 }, () => new Int32Array(got.length + 1));
  for (let a = 1; a <= want.length; a++) for (let b = 1; b <= got.length; b++)
    L[a][b] = near(want[a - 1], got[b - 1]) ? L[a - 1][b - 1] + 1 : Math.max(L[a - 1][b], L[a][b - 1]);
  const same = L[want.length][got.length];
  const pct = same / want.length;
  console.log(`  the read still says ${same}/${want.length} of the script's words (${(pct * 100).toFixed(1)}%)`);
  if (pct < 0.96) {
    let a = want.length, b = got.length; const miss = [];
    while (a > 0) {
      if (b > 0 && near(want[a - 1], got[b - 1])) { a--; b--; }
      else if (b > 0 && L[a][b - 1] >= L[a - 1][b]) b--;
      else miss.push(want[--a]);
    }
    fail.push(`${want.length - same} script words are no longer in the audio: ${miss.reverse().slice(0, 12).join(' ')}`);
  }
  /* ── THE DIFFERENTIAL. The delivered file is the source recording with silence inserted into
     pauses, so it must transcribe to EXACTLY the same sounds. Comparing against the script instead
     cannot separate "the splicer damaged a word" from "ASR misspells challan" — this comparison
     has no opinion about spelling at all, because both sides are the same recogniser on the same
     voice. Any difference is something the splice did. */
  const src = (N.heard || []).flatMap(norm);
  if (!src.length) console.log('  (no source transcript recorded — re-run voice.mjs for the differential)');
  else {
    const now = texts.flatMap(norm);
    let i = 0, j = 0; const diffs = [];
    while (i < src.length || j < now.length) {
      if (i < src.length && j < now.length && near(src[i], now[j])) { i++; j++; continue; }
      const jump = [...Array(6).keys()].map((d) => d + 1)
        .find((d) => (i + d < src.length && j < now.length && near(src[i + d], now[j]))
                  || (j + d < now.length && i < src.length && near(src[i], now[j + d])));
      diffs.push(`${src[i] ?? '-'} -> ${now[j] ?? '-'} (at word ${j})`);
      if (!jump) { i++; j++; } else if (i + jump < src.length && near(src[i + jump], now[j])) i += jump; else j += jump;
      if (diffs.length > 8) break;
    }
    if (diffs.length) fail.push(`the spliced audio no longer transcribes like the source read `
      + `(${src.length} sounds -> ${now.length}): ${diffs.slice(0, 6).join(', ')}`);
    else console.log(`  differential against the source read: all ${src.length} sounds identical — `
      + `the splice damaged nothing`);
  }
}

/* ── 2 & 3. each designed hold ──────────────────────────────────────────────────────────────── */
const raw = path.join(CACHE, 'sc_scan.raw');
sh(FF, ['-y', '-v', 'error', '-i', FILE, '-f', 's16le', '-ac', '1', '-ar', String(SR), raw]);
const bb = fs.readFileSync(raw);
const pcm = new Int16Array(bb.buffer, bb.byteOffset, Math.floor(bb.length / 2));
const rms = (i0, n) => { let a = 0; for (let i = i0; i < i0 + n && i < pcm.length; i++) a += pcm[i] * pcm[i]; return Math.sqrt(a / n); };
const dB = (v) => 20 * Math.log10(Math.max(1e-9, v / 32768));
const peak = (t0, t1) => { let p = -200; for (let t = t0; t < t1; t += 0.004) { const v = dB(rms(Math.round(t * SR), Math.round(0.020 * SR))); if (v > p) p = v; } return p; };

const SW = SCRIPT.split(/\s+/);
let from = 0;
console.log('\n  anchor          designed   measured   utterance before ends / after begins        loudest in the gap');
for (const { after, hold } of HOLDS) {
  const k = SW.indexOf(after, from); from = k + 1;
  const e = N.words[k].e, s = N.words[k + 1].s;
  const gap = s - e;
  const uBefore = utt.reduce((best, g) => (Math.abs(g.e - e) < Math.abs(best.e - e) ? g : best), utt[0]);
  const uAfter = utt.reduce((best, g) => (Math.abs(g.s - s) < Math.abs(best.s - s) ? g : best), utt[0]);
  const tB = norm(texts[utt.indexOf(uBefore)]), tA = norm(texts[utt.indexOf(uAfter)]);
  const wantB = norm(after).pop(), wantA = norm(SW[k + 1]).pop();
  const okB = tB.length && near(tB[tB.length - 1], wantB);
  const okA = tA.length && near(tA[0], wantA);
  const lvl = peak(e + 0.030, s - 0.030);
  const okGap = gap >= hold - 0.015;
  console.log(`  ${after.padEnd(14)} ${hold.toFixed(2).padStart(6)}s ${gap.toFixed(3).padStart(9)}s`
    + `   …${(tB.slice(-2).join(' ') || '?').padEnd(16)} | ${(tA.slice(0, 2).join(' ') || '?').padEnd(14)}`
    + `  ${lvl.toFixed(0).padStart(5)} dBFS`
    + `  ${okB && okA && okGap ? 'ok' : '** FAIL'}`);
  if (!okB) fail.push(`the utterance before "${after}" ends on "${tB[tB.length - 1]}", not "${wantB}" — the word is cut`);
  if (!okA) fail.push(`the utterance after "${after}" begins on "${tA[0]}", not "${wantA}" — the word is cut`);
  if (!okGap) fail.push(`the hold after "${after}" is ${gap.toFixed(3)}s, short of ${hold.toFixed(2)}s`);
  if (lvl > -40) fail.push(`the pause after "${after}" peaks at ${lvl.toFixed(0)} dBFS — that is speech inside a hold`);
}

console.log('');
if (fail.length) { fail.forEach((f) => console.log(`  ** ${f}`)); process.exit(1); }
console.log('  every word whole, every hold exact, every join in silence.');
