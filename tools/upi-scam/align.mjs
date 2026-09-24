/* FORCED ALIGNMENT — where every word of the locked script actually is in a given recording.
 *
 * ASR with word timestamps gives a time-stamped token stream; that stream is aligned CHARACTER-WISE
 * against the known transcript. Character-wise rather than token-wise because ASR tokenises
 * acronyms unpredictably ("UPI" / "U P I" / "U.P.I.") and a character stream is immune to it —
 * which is also what lets a human saying "U.P.I." align against a script that writes "UPI".
 * Times inside a matched token are interpolated by character fraction, so a word inside a
 * multi-word token is still placeable. Onsets preceded by real silence are then snapped to the
 * silence detector, because there the onset is not an estimate, it is measurable.
 *
 * One copy, used by both the synthesised read (narration.mjs) and a recorded one (voice.mjs):
 * the two must measure identically or the film is cut to a map of a different waveform.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync, spawnSync } from 'child_process';

const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const FFPROBE = '/opt/homebrew/bin/ffprobe';
const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', f]).toString().trim());

/** @param file audio to measure  @param SCRIPT the locked transcript  @param CACHE scratch dir */
export function measure(file, SCRIPT, CACHE, MAX_DEV = 0.85) {

  const align16 = path.join(CACHE, 'align16.wav');
  sh(FFMPEG, ['-y', '-i', file, '-ar', '16000', '-ac', '1', align16]);
  /* The cache key MUST cover the audio, not just the script: an earlier run of this tool at a
     different tempo produced a different waveform, and a script-keyed cache silently served its
     word times against the new audio — a 2.4s error at the tail that looked like a plausible map. */
  const audioKey = crypto.createHash('md5')
    .update(fs.readFileSync(align16)).digest('hex').slice(0, 12);
  const wordsJson = path.join(CACHE, `words_${audioKey}.json`);
  if (!fs.existsSync(wordsJson) || process.env.FORCE_ASR) {
    const py = `
import json, mlx_whisper
r = mlx_whisper.transcribe(${JSON.stringify(align16)},
    path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
    word_timestamps=True, language="en", condition_on_previous_text=False)
out=[]
for seg in r["segments"]:
    for w in seg.get("words", []):
        out.append({"w": w["word"].strip(), "s": round(w["start"],3), "e": round(w["end"],3)})
json.dump(out, open(${JSON.stringify(wordsJson)}, "w"))
print("ASR words", len(out))
`;
    const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    if (r.status !== 0) throw new Error('ASR failed');
  }
  const asr = JSON.parse(fs.readFileSync(wordsJson, 'utf8'));

  /* character streams: letters+digits only, each char remembering which token it came from */
  function stream(tokens, textOf) {
    const chars = [], owner = [], frac = [];
    tokens.forEach((t, i) => {
      const norm = textOf(t).toLowerCase().replace(/[^a-z0-9]/g, '');
      [...norm].forEach((c, j) => { chars.push(c); owner.push(i); frac.push(norm.length > 1 ? j / norm.length : 0); });
    });
    return { chars, owner, frac };
  }
  const scriptWords = SCRIPT.split(/\s+/);
  const S = stream(scriptWords, (w) => w);
  const R = stream(asr, (t) => t.w);

  const n = S.chars.length, m = R.chars.length;
  const GAP = -2, MIS = -3, HIT = 2;
  let prev = new Int32Array(m + 1), cur = new Int32Array(m + 1);
  const bt = new Uint8Array((n + 1) * (m + 1));
  for (let j = 0; j <= m; j++) { prev[j] = j * GAP; bt[j] = 3; }
  for (let i = 1; i <= n; i++) {
    cur[0] = i * GAP; bt[i * (m + 1)] = 2;
    for (let j = 1; j <= m; j++) {
      const d = prev[j - 1] + (S.chars[i - 1] === R.chars[j - 1] ? HIT : MIS);
      const u = prev[j] + GAP, l = cur[j - 1] + GAP;
      let best = d, op = 1;
      if (u > best) { best = u; op = 2; }
      if (l > best) { best = l; op = 3; }
      cur[j] = best; bt[i * (m + 1) + j] = op;
    }
    const t = prev; prev = cur; cur = t;
  }
  const mapTo = new Int32Array(n).fill(-1);
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const op = (i === 0) ? 3 : (j === 0) ? 2 : bt[i * (m + 1) + j];
    if (op === 1) { mapTo[i - 1] = j - 1; i--; j--; }
    else if (op === 2) { i--; }
    else { j--; }
  }
  const matched = mapTo.reduce((a, v) => a + (v >= 0 ? 1 : 0), 0);
  console.log(`  alignment: ${matched}/${n} chars (${(matched / n * 100).toFixed(1)}%)`);
  if (matched / n < 0.9) throw new Error('forced alignment is not trustworthy — inspect the read');

  /* DOES THE READ SAY THE SCRIPT? Character coverage alone does not answer that: a recorded take
     that replaced 20 of 105 words still scored 96.5%, because the words it substituted shared most
     of their letters with the ones they replaced. The film survived it — every beat still landed on
     SOME word — but the subtitles then showed a sentence the voice never said. So the read is
     checked at word level too, and the mismatching words are named. */
  {
    const sWords = SCRIPT.split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const hWords = asr.map((t) => t.w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
    const L = Array.from({ length: sWords.length + 1 }, () => new Int32Array(hWords.length + 1));
    for (let a = 1; a <= sWords.length; a++) for (let b = 1; b <= hWords.length; b++)
      L[a][b] = sWords[a - 1] === hWords[b - 1] ? L[a - 1][b - 1] + 1
        : Math.max(L[a - 1][b], L[a][b - 1]);
    const same = L[sWords.length][hWords.length];
    const pct = same / sWords.length;
    console.log(`  read matches the script on ${same}/${sWords.length} words (${(pct * 100).toFixed(1)}%)`);
    if (pct < 0.95) {
      let a = sWords.length, b = hWords.length; const miss = [];
      while (a > 0) {
        if (b > 0 && sWords[a - 1] === hWords[b - 1]) { a--; b--; }
        else if (b > 0 && L[a][b - 1] >= L[a - 1][b]) b--;
        else miss.push(SCRIPT.split(/\s+/)[--a]);
      }
      throw new Error(`the recording does not say the locked script: ${sWords.length - same} of `
        + `${sWords.length} words differ, starting near "${miss[miss.length - 1]}". `
        + `The subtitles are the script, so they would show words the voice never says. `
        + `Heard: "${asr.map((t) => t.w).join(' ').slice(0, 160)}…"`);
    }
  }

  const timeAt = (rc) => { const t = asr[R.owner[rc]]; return t.s + (t.e - t.s) * R.frac[rc]; };
  const W = scriptWords.map((w, k) => {
    const idx = []; for (let c = 0; c < n; c++) if (S.owner[c] === k && mapTo[c] >= 0) idx.push(mapTo[c]);
    return { k, w, s: idx.length ? timeAt(idx[0]) : null, e: idx.length ? timeAt(idx[idx.length - 1]) : null };
  });
  for (let k = 0; k < W.length; k++) {
    if (W[k].s !== null) continue;
    let a = k - 1; while (a >= 0 && W[a].e === null) a--;
    let b = k + 1; while (b < W.length && W[b].s === null) b++;
    const t0 = a >= 0 ? W[a].e : 0, t1 = b < W.length ? W[b].s : dur(file);
    const f = (k - a) / (b - a);
    W[k].s = t0 + (t1 - t0) * f; W[k].e = t0 + (t1 - t0) * ((k - a + 0.8) / (b - a));
    W[k].guessed = true;
  }
  for (let k = 1; k < W.length; k++) if (W[k].s < W[k - 1].s + 0.02) W[k].s = W[k - 1].s + 0.02;
  for (let k = 0; k < W.length; k++) if (W[k].e < W[k].s + 0.03) W[k].e = W[k].s + 0.03;

  /* detector refinement: where a word is preceded by real silence its onset is not an estimate,
     it is measurable, and the measurement wins. */
  const r2 = spawnSync(FFMPEG, ['-i', file, '-af', 'silencedetect=noise=-42dB:d=0.16',
    '-f', 'null', '-'], { encoding: 'utf8' });
  const ss = [...r2.stderr.matchAll(/silence_start: ([-\d.]+)/g)].map((x) => +x[1]);
  const se = [...r2.stderr.matchAll(/silence_end: ([-\d.]+)/g)].map((x) => +x[1]);
  const SIL = ss.map((v, k) => ({ s: v, e: se[k] })).filter((x) => x.e !== undefined);
  /* ONE SILENCE CLAIMS ONE WORD — the first that follows it.
     Matching every word within 250ms of a silence's end snapped whole runs onto the same instant:
     on a recorded read "If", "a" and "screen" all landed on 41.498s and were then prised apart by
     20ms each by the monotonic fix-up below. Only the word that STARTS the phrase after a silence
     has a measurable onset; the ones after it are still ASR's estimate, and that is fine. */
  let snapped = 0, maxDev = 0;
  const big = [];
  const taken = new Set();
  for (const x of SIL) {
    const w = W.find((q, qi) => !taken.has(qi) && q.s > x.s - 0.05 && q.s < x.e + 0.25
      && (taken.add(W.indexOf(q)), true));
    if (!w) continue;
    const dev = Math.abs(x.e - w.s);
    if (dev > maxDev) maxDev = dev;
    if (dev > 0.12) big.push({ w: w.w, asr: +w.s.toFixed(3), detector: +x.e.toFixed(3), dev: +dev.toFixed(3) });
    if (dev > 0.004) {
      w.s = x.e; w.e = Math.max(w.e, w.s + 0.05); w.snapped = +dev.toFixed(3); snapped++;
    }
  }
  for (let k = 1; k < W.length; k++) if (W[k].s < W[k - 1].s + 0.02) W[k].s = W[k - 1].s + 0.02;
  for (let k = 0; k < W.length; k++) if (W[k].e < W[k].s + 0.03) W[k].e = W[k].s + 0.03;
  console.log(`  detector: ${SIL.length} silences, snapped ${snapped}, max correction ${maxDev.toFixed(3)}s`);
  if (big.length) {
    console.log('  corrections over 120ms (ASR onset -> measured silence end):');
    big.forEach((b) => console.log(`    "${b.w}"  ${b.asr}s -> ${b.detector}s  (+${b.dev}s)`));
  }
  /* THE GUARD, aimed at what can actually be wrong now. A big correction is not itself a fault —
     on a recorded read with long pauses, ASR routinely places a phrase's first word up to 600ms
     early, and the detector is the measurement, not the estimate (verified against the waveform:
     at one flagged onset the audio was at -84dB and speech began exactly where the detector said).
     What WOULD be a fault is a word left sitting inside silence, which means it was never placed
     on speech at all. */
  const inSilence = W.filter((w) => SIL.some((x) => w.s > x.s + 0.03 && w.s < x.e - 0.03));
  if (inSilence.length > W.length * 0.05) {
    throw new Error(`${inSilence.length} of ${W.length} word onsets sit inside measured silence `
      + `(${inSilence.slice(0, 6).map((w) => `"${w.w}"`).join(', ')}) — the map is not on the speech`);
  }
  if (maxDev > MAX_DEV) {
    throw new Error(`a snap moved a word by ${(maxDev * 1000).toFixed(0)}ms (limit `
      + `${(MAX_DEV * 1000).toFixed(0)}ms) — inspect the words listed above before trusting this map`);
  }
  return W;
}
