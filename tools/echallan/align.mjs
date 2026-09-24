/* FORCED ALIGNMENT — where every word of the locked script actually is in a given recording.
 *
 * THE UNIT OF MEASUREMENT IS THE UTTERANCE, NOT THE FILE.
 *
 * This used to hand the whole recording to ASR and trust the word timestamps that came back. They
 * cannot be trusted at the one place the film cares about most — the edges of a pause. Whisper's
 * word times come from cross-attention, and around a silence it smears: on this film's read it put
 * "You" at 57.400s when the audio is at the noise floor from 57.60s to 58.30s, and it ended
 * "background," at 46.016s when the voice goes on to 46.220s. Both errors are ~0.2-0.9s, both are
 * invisible in a subtitle, and both are fatal to anything that cuts.
 *
 * So the recording is first cut into UTTERANCES by a hysteresis voice-activity detector, and each
 * one is transcribed on its own. That changes the problem: a segment's start and end are no longer
 * estimates, they are measurements of the waveform, and ASR is only ever asked the one thing it is
 * reliable at — what was said inside a continuous piece of speech, and roughly where. The segment
 * word streams are concatenated in order with their times shifted into absolute time, and from
 * there the old machinery runs unchanged: a CHARACTER-WISE alignment against the known transcript,
 * because ASR tokenises acronyms unpredictably ("APK" / "A P K" / "A.P.K.") and a character stream
 * is immune to it. Times inside a matched token are interpolated by character fraction.
 *
 * Finally the first and last word of every utterance are PINNED to that utterance's measured
 * boundaries. Those two numbers per segment are facts; everything between them is an estimate.
 *
 * Breaths are segments too, and they must not be transcribed into the stream — ASR hallucinates
 * words into them ("Yeah.", "Let's go."). They are separated by level: on this read speech peaks
 * between -7 and -14 dBFS and every breath peaked at -41. The split is drawn relative to the read's
 * own speech level, not at an absolute number, so it survives a different voice or normalisation.
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

/* ── VOICE ACTIVITY ───────────────────────────────────────────────────────────────────────────
 * 20 ms frames every 2 ms, with hysteresis so a frame hovering at the threshold cannot chatter the
 * state. Thresholds are set from the read's OWN speech level (95th-percentile frame) rather than
 * absolutely, so a different voice, a different loudnorm target or a noisier booth does not move
 * them. Stop closures inside a word (/p/ in "dropper", /kg/ in "background") are 20-80 ms of true
 * silence and are NOT pauses, so gaps under BRIDGE are welded shut before anything else looks at
 * the result — that closure is precisely what an energy-minimum search would otherwise cut on.
 */
const SR = 48000, HOP = 96 /* 2ms */, WIN = 960 /* 20ms */;
const BRIDGE = Number(process.env.VAD_BRIDGE ?? 0.090);  // see MERGE below: this is a floor, not a judgement       // shorter than any real pause, longer than any stop closure
const MIN_SEG = 0.060;

export function activity(file, CACHE) {
  const raw = path.join(CACHE, 'vad_scan.raw');
  sh(FFMPEG, ['-y', '-v', 'error', '-i', file, '-f', 's16le', '-ac', '1', '-ar', String(SR), raw]);
  const b = fs.readFileSync(raw);
  const pcm = new Int16Array(b.buffer, b.byteOffset, Math.floor(b.length / 2));
  const n = Math.max(0, Math.floor((pcm.length - WIN) / HOP));
  const E = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let a = 0; const o = i * HOP;
    for (let j = o; j < o + WIN; j++) a += pcm[j] * pcm[j];
    E[i] = 20 * Math.log10(Math.max(1e-9, Math.sqrt(a / WIN) / 32768));
  }
  const sorted = Float32Array.from(E).sort();
  const p95 = sorted[Math.floor(n * 0.95)] || -12;      // the read's speech level
  const HI = p95 - 28, LO = p95 - 42;
  let on = false, st = 0; const rawSegs = [];
  for (let i = 0; i < n; i++) {
    if (!on && E[i] > HI) { on = true; st = i; }
    else if (on && E[i] < LO) { on = false; rawSegs.push([st, i]); }
  }
  if (on) rawSegs.push([st, n]);
  const merged = [];
  for (const s of rawSegs) {
    const last = merged[merged.length - 1];
    if (last && (s[0] - last[1]) * HOP / SR < BRIDGE) last[1] = s[1]; else merged.push(s.slice());
  }
  const segs = merged.map(([i0, i1]) => {
    let pk = -200; for (let i = i0; i < i1; i++) if (E[i] > pk) pk = E[i];
    return { s: i0 * HOP / SR, e: i1 * HOP / SR, peak: pk };
  }).filter((g) => g.e - g.s >= MIN_SEG);
  /* a breath carries no words. 18 dB below the read's speech level is a wide moat: measured on
     this film, speech segments peak -7.4 to -13.6 and every breath peaks -41. */
  const BREATH = p95 - 18;
  segs.forEach((g) => { g.speech = g.peak >= BREATH; });
  for (const g of segs) {
    if (!g.speech && g.e - g.s > 0.35) throw new Error(`a ${(g.e - g.s).toFixed(2)}s segment at `
      + `${g.s.toFixed(2)}s peaks at ${g.peak.toFixed(1)} dBFS, ${(p95 - g.peak).toFixed(0)} dB `
      + `under the read — too long to be a breath and too quiet to transcribe. Inspect the audio.`);
  }
  return { segs, p95, floor: sorted[Math.floor(n * 0.05)] };
}

/** @param file audio to measure  @param SCRIPT the locked transcript  @param CACHE scratch dir */
export function measure(file, SCRIPT, CACHE) {

  const align16 = path.join(CACHE, 'align16.wav');
  sh(FFMPEG, ['-y', '-i', file, '-ar', '16000', '-ac', '1', align16]);
  /* The cache key MUST cover the audio, not just the script: an earlier run of this tool at a
     different tempo produced a different waveform, and a script-keyed cache silently served its
     word times against the new audio — a 2.4s error at the tail that looked like a plausible map. */
  const audioKey = crypto.createHash('md5')
    .update(fs.readFileSync(align16)).digest('hex').slice(0, 12);

  const { segs, p95 } = activity(file, CACHE);
  const utt = segs.filter((g) => g.speech);
  console.log(`  voice activity: ${segs.length} segments, ${utt.length} spoken, `
    + `${segs.length - utt.length} breaths (speech ${p95.toFixed(1)} dBFS)`);

  /* ── PER-UTTERANCE ASR ─────────────────────────────────────────────────────────────────────
   * One python process, the model loaded once, every utterance transcribed with word timestamps
   * and shifted into absolute time. Cached against the audio AND the segmentation, because a
   * change to either invalidates it. */
  const key = crypto.createHash('md5').update(audioKey)
    .update(utt.map((g) => `${g.s.toFixed(3)},${g.e.toFixed(3)}`).join(';')).digest('hex').slice(0, 12);
  const wordsJson = path.join(CACHE, `uwords_${key}.json`);
  if (!fs.existsSync(wordsJson) || process.env.FORCE_ASR) {
    const clips = utt.map((g, i) => {
      const f = path.join(CACHE, `utt_${key}_${i}.wav`);
      sh(FFMPEG, ['-y', '-v', 'error', '-ss', g.s.toFixed(6), '-t', (g.e - g.s).toFixed(6),
        '-i', file, '-ar', '16000', '-ac', '1', f]);
      return { f, t0: g.s };
    });
    const py = `
import json, warnings, mlx_whisper
warnings.filterwarnings("ignore")
clips = json.load(open(${JSON.stringify(path.join(CACHE, `uttlist_${key}.json`))}))
out = []
for c in clips:
    r = mlx_whisper.transcribe(c["f"], path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
        word_timestamps=True, language="en", condition_on_previous_text=False)
    for seg in r["segments"]:
        for w in seg.get("words", []):
            out.append({"w": w["word"].strip(),
                        "s": round(c["t0"] + w["start"], 3),
                        "e": round(c["t0"] + w["end"], 3)})
json.dump(out, open(${JSON.stringify(wordsJson)}, "w"))
print("  ASR words", len(out), "from", len(clips), "utterances")
`;
    fs.writeFileSync(path.join(CACHE, `uttlist_${key}.json`), JSON.stringify(clips));
    const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    if (r.status !== 0) throw new Error('ASR failed');
    clips.forEach((c) => fs.rmSync(c.f, { force: true }));
  }
  const asr = JSON.parse(fs.readFileSync(wordsJson, 'utf8'));
  /* ASR's local times are clamped into their own utterance: a word cannot begin before the sound
     did or end after it stopped. */
  for (const t of asr) {
    const g = utt.find((u) => t.s >= u.s - 0.06 && t.s <= u.e + 0.06)
      || utt.find((u) => t.e > u.s && t.s < u.e);
    if (!g) continue;
    t.s = Math.min(Math.max(t.s, g.s), g.e); t.e = Math.min(Math.max(t.e, t.s), g.e);
    t.g = utt.indexOf(g);
  }

  /* ── NUMBER ORTHOGRAPHY ───────────────────────────────────────────────────────────────────
   * ASR writes numbers as digits. A script writes them as words, because a subtitle that reads
   * "ten percent" is spoken and a subtitle that reads "10%" is displayed. Character-wise, "one"
   * and "1" share nothing, so a faithful read of "one rupee ten paise" scored 85% at word level
   * and this aligner refused it — the gate firing on a spelling rather than on a substitution.
   * (rule: a gate must measure its reason)
   *
   * So both streams are canonicalised to digits before they are compared. Whole tokens only, so
   * "someone" is untouched, and it is applied symmetrically, so a script and a read that already
   * agree still agree. A film whose script contains no numbers is unaffected. */
  const NUMW = {
    zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
    eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13', fourteen: '14',
    fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20',
    thirty: '30', forty: '40', fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
    hundred: '100',
  };
  const canon = (w) => {
    const t = w.toLowerCase().replace(/%/g, 'percent').replace(/[^a-z0-9]/g, '');
    return NUMW[t] ?? t;
  };

  /* character streams: letters+digits only, each char remembering which token it came from */
  function stream(tokens, textOf) {
    const chars = [], owner = [], frac = [];
    tokens.forEach((t, i) => {
      const norm = canon(textOf(t));
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
    const sWords = SCRIPT.split(/\s+/).map(canon);
    const hWords = asr.map((t) => canon(t.w)).filter(Boolean);
    /* SAME WORD, ASR's SPELLING. This gate exists to catch a reader who said something else, and
       it was reading 15 false mismatches on a faithful take — "challan"/"chalan",
       "unauthorised"/"unauthorized", "e-Challan"/"eChalan" — which left one word of headroom
       before it would have stopped a good recording. A pair counts as the same word when it is
       within a fifth of its length in edits, which absorbs a spelling and still separates
       "an"/"in" (half the string) or any substituted word. */
    const near = (a, b) => {
      if (a === b) return true;
      const lim = Math.floor(Math.max(a.length, b.length) / 5);
      if (lim < 1 || Math.abs(a.length - b.length) > lim) return false;
      let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j);
      for (let i = 1; i <= a.length; i++) {
        const row = [i];
        for (let j = 1; j <= b.length; j++) row[j] = Math.min(prevRow[j] + 1, row[j - 1] + 1,
          prevRow[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prevRow = row;
      }
      return prevRow[b.length] <= lim;
    };
    const L = Array.from({ length: sWords.length + 1 }, () => new Int32Array(hWords.length + 1));
    for (let a = 1; a <= sWords.length; a++) for (let b = 1; b <= hWords.length; b++)
      L[a][b] = near(sWords[a - 1], hWords[b - 1]) ? L[a - 1][b - 1] + 1
        : Math.max(L[a - 1][b], L[a][b - 1]);
    const same = L[sWords.length][hWords.length];
    const pct = same / sWords.length;
    console.log(`  read matches the script on ${same}/${sWords.length} words (${(pct * 100).toFixed(1)}%)`);
    if (pct < 0.95) {
      let a = sWords.length, b = hWords.length; const miss = [];
      while (a > 0) {
        if (b > 0 && near(sWords[a - 1], hWords[b - 1])) { a--; b--; }
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
    const gs = idx.map((c) => asr[R.owner[c]].g).filter((g) => g !== undefined);
    return { k, w, s: idx.length ? timeAt(idx[0]) : null, e: idx.length ? timeAt(idx[idx.length - 1]) : null,
      g: gs.length ? gs[0] : null, gEnd: gs.length ? gs[gs.length - 1] : null };
  });
  for (let k = 0; k < W.length; k++) {
    if (W[k].s !== null) continue;
    let a = k - 1; while (a >= 0 && W[a].e === null) a--;
    let b = k + 1; while (b < W.length && W[b].s === null) b++;
    const t0 = a >= 0 ? W[a].e : 0, t1 = b < W.length ? W[b].s : dur(file);
    const f = (k - a) / (b - a);
    W[k].s = t0 + (t1 - t0) * f; W[k].e = t0 + (t1 - t0) * ((k - a + 0.8) / (b - a));
    W[k].guessed = true;
    /* a guessed word belongs to whichever utterance its neighbours do — never to a silence */
    W[k].g = W[k].gEnd = (a >= 0 && W[a].gEnd !== null && W[a].gEnd === (b < W.length ? W[b].g : null))
      ? W[a].gEnd : null;
  }
  const mono = () => {
    for (let k = 1; k < W.length; k++) if (W[k].s < W[k - 1].s + 0.02) W[k].s = W[k - 1].s + 0.02;
    for (let k = 0; k < W.length; k++) if (W[k].e < W[k].s + 0.03) W[k].e = W[k].s + 0.03;
  };
  mono();

  /* ── A BOUNDARY INSIDE A WORD IS NOT A BOUNDARY ───────────────────────────────────────────
   * No bridging constant can be right for every read: a stop closure in careful speech can run to
   * 110 ms and a hurried pause can be 150. Picking one number and hoping is what put a segment
   * boundary inside "update" ("...install an up | date first...") and then pinned the following
   * word to it, 240 ms early. So the constant is only a floor, and the SPLIT ITSELF IS CHECKED:
   * if a script word's characters were transcribed across two utterances, that silence was inside
   * a word, not between two, and the two utterances are welded. Self-correcting, and it needs no
   * re-transcription — merging only drops an interior boundary, and the outer edges (the measured
   * ones, the ones that get pinned) are unchanged. */
  const parent = utt.map((_, i) => i);
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const weld = [];
  for (const w of W) {
    if (w.g === null || w.gEnd === null || w.g === w.gEnd) continue;
    weld.push(`"${w.w}"`);
    for (let a = w.g; a < w.gEnd; a++) { const x = find(a), y = find(a + 1); if (x !== y) parent[Math.max(x, y)] = Math.min(x, y); }
  }
  if (weld.length) console.log(`  welded ${new Set(weld).size} utterance split(s) that fell inside `
    + `a word: ${[...new Set(weld)].slice(0, 6).join(', ')}`);
  const group = utt.map((_, i) => find(i));
  const GRP = new Map();
  group.forEach((r, i) => {
    const g = GRP.get(r) || { s: utt[i].s, e: utt[i].e };
    g.s = Math.min(g.s, utt[i].s); g.e = Math.max(g.e, utt[i].e); GRP.set(r, g);
  });
  W.forEach((w) => { if (w.g !== null && w.g !== undefined) { w.g = group[w.g]; w.gEnd = group[w.gEnd]; } });
  const U = (gi) => GRP.get(gi);

  /* ── THE PIN ───────────────────────────────────────────────────────────────────────────────
   * The first word of an utterance starts when the utterance starts and the last word of one ends
   * when it ends. These are the only two times per segment that are MEASURED rather than inferred,
   * and they are exactly the ones the film cuts on, so they overwrite whatever ASR said. Every
   * word is also confined to its own utterance, so no word can be left sitting in a silence. */
  let pinned = 0; const moved = [];
  const first = new Map(), last = new Map();
  W.forEach((w, k) => {
    if (w.g === null || w.g === undefined) return;
    if (!first.has(w.g)) first.set(w.g, k);
    last.set(w.gEnd ?? w.g, k);
  });
  for (const [gi, k] of first) {
    const g = U(gi); if (!g) continue;
    const dev = W[k].s - g.s;
    if (Math.abs(dev) > 0.12) moved.push(`"${W[k].w}" ${W[k].s.toFixed(3)} -> ${g.s.toFixed(3)}`);
    if (Math.abs(dev) > 0.004) { W[k].snapped = +dev.toFixed(3); pinned++; }
    W[k].s = g.s;
  }
  for (const [gi, k] of last) {
    const g = U(gi); if (!g) continue;
    if (Math.abs(W[k].e - g.e) > 0.12) moved.push(`"${W[k].w}" ends ${W[k].e.toFixed(3)} -> ${g.e.toFixed(3)}`);
    W[k].e = g.e; pinned++;
  }
  /* everything else is clamped inside its own utterance */
  for (const w of W) {
    const g = U(w.g); if (!g) continue;
    w.s = Math.min(Math.max(w.s, g.s), g.e);
    w.e = Math.min(Math.max(w.e, w.s), (U(w.gEnd) || g).e);
  }
  mono();
  console.log(`  pinned ${pinned} word boundaries to measured utterance edges`);
  if (moved.length) {
    console.log('  corrections over 120ms (ASR -> measured):');
    moved.slice(0, 24).forEach((s) => console.log(`    ${s}`));
    if (moved.length > 24) console.log(`    …and ${moved.length - 24} more`);
  }

  /* ── THE GUARDS ────────────────────────────────────────────────────────────────────────────
   * What can still be wrong is a word left outside every utterance, or an utterance with no words
   * in it — both mean the transcript and the waveform have come apart somewhere. */
  const homeless = W.filter((w) => w.g === null || w.g === undefined);
  if (homeless.length > W.length * 0.06) {
    throw new Error(`${homeless.length} of ${W.length} words are not inside any measured `
      + `utterance (${homeless.slice(0, 6).map((w) => `"${w.w}"`).join(', ')}) — the map is not `
      + `on the speech`);
  }
  const empty = [...GRP.entries()].map(([gi, g]) => ({ gi, g })).filter(({ gi }) => !first.has(gi));
  if (empty.length) {
    throw new Error(`${empty.length} spoken segment(s) got no words: `
      + empty.slice(0, 4).map(({ g }) => `${g.s.toFixed(2)}-${g.e.toFixed(2)}s`).join(', ')
      + ' — the read and the script have come apart there');
  }
  const inGap = W.filter((w) => ![...GRP.values()].some((g) => w.s >= g.s - 0.02 && w.s <= g.e + 0.02));
  if (inGap.length > W.length * 0.05) {
    throw new Error(`${inGap.length} of ${W.length} word onsets sit outside the measured speech `
      + `(${inGap.slice(0, 6).map((w) => `"${w.w}"`).join(', ')})`);
  }
  W.forEach((w) => { delete w.gEnd; });
  W.utterances = [...GRP.values()].sort((a, b) => a.s - b.s);
  W.heard = asr.map((t) => t.w);   // what ASR actually heard, for a differential check later
  return W;
}
