// Does anything on screen move before the narration that motivates it?
//
// Scenes are cued as "n frames before beat i" and statistics as "n frames
// before the word". Both were written against a synthesised narration where
// every line was followed by a gap. A recorded voice runs lines together, so
// the same lead-in can now start inside the sentence still being spoken — the
// picture pre-empting the voice, which is exactly what a viewer notices.
//
// This resolves every timing expression in the acts and asks two questions:
//   · a beat-relative start must not fall inside the previous spoken line
//   · a cue-relative start must not fall in a beat before the cue's own
// and finally that every act seam still overlaps, so nothing goes blank.
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const tmp = path.resolve('.qa-sync-state.mjs');
await build({
  entryPoints: [path.resolve('src/income-percentile/state.ts')],
  bundle: true, format: 'esm', outfile: tmp, platform: 'neutral',
  loader: { '.json': 'json' }, logLevel: 'error',
});
const S = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const timing = JSON.parse(fs.readFileSync('src/income-percentile/timing.json', 'utf8'));
const cues = JSON.parse(fs.readFileSync('src/income-percentile/cues.json', 'utf8')).cues;
const B = timing.beats;
const mm = (f) => `${Math.floor(f / 30 / 60)}:${String((f / 30) % 60).padStart(5, '0').slice(0, 5)}`;
const beat = (i) => B[i].startFrame;
const beatEnd = (i) => B[i].endFrame;
/* must match src/income-percentile/state.ts exactly — it did not, and every boundary this
   gate printed was six frames out from the film it claimed to be checking */
const ANTICIPATE = 6;
const lead = (i, n) => Math.max(beat(i) - n, i > 0 ? beatEnd(i - 1) - ANTICIPATE : 0);
const spokenAt = (f) => B.findIndex((b) => f >= b.startFrame && f <= b.endFrame);

let fails = 0;
const rows = [];
for (const file of fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'))) {
  const src = fs.readFileSync(path.join('src/income-percentile', file), 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, li) => {
    // the opening frame of any timing: pr / fade / accent, or an act boundary
    /* the first argument may itself contain commas — lead(38,26), onWord('x'),
       Math.min(a, b) — so it is read by walking to the first comma at depth
       zero. Splitting on the first comma silently skipped every one of them. */
    let expr = null;
    const call = line.match(/(?:pr|fade|accent)\(f(?:\s*-\s*1)?,\s*/);
    if (call) {
      let i = call.index + call[0].length, depth = 0, arg = '';
      for (; i < line.length; i++) {
        const ch = line[i];
        if (ch === '(') depth++;
        if (ch === ')') { if (depth === 0) break; depth--; }
        if (ch === ',' && depth === 0) break;
        arg += ch;
      }
      expr = arg.trim();
    } else {
      const decl = line.match(/export const ACT\d_(?:START|END) = ([^;]+);/);
      if (decl) expr = decl[1].trim();
    }
    if (!expr) return;
    let ref = null;                       // which beat/cue the timing claims to serve
    const bm = expr.match(/(?:lead|beat|beatEnd)\((\d+)/);
    const cm = expr.match(/(?:cue|cueIn|onWord|onSaid|rollStart)\('([^']+)'\)/);
    if (bm) ref = { kind: 'beat', i: +bm[1] };
    else if (cm) ref = { kind: 'cue', name: cm[1] };
    else return;
    let frame;
    try {
      const spoken = (n) => Math.max(22, Math.min(96, cues[n].frame - cues[n].startFrame + 8));
      frame = Function('beat', 'beatEnd', 'lead', 'cue', 'cueIn', 'spoken', 'onWord', 'onSaid', 'rollStart',
        `return (${expr})`)(beat, beatEnd, lead,
          (n) => cues[n].frame, (n) => cues[n].startFrame, spoken,
          (n) => cues[n].frame - spoken(n), (n) => cues[n].startFrame + 6,
          (n) => cues[n].frame - spoken(n));
    } catch { return; }
    if (!Number.isFinite(frame)) return;

    /* A bounded reach into the tail of the previous line is the design: with a
       recorded voice most beats begin the instant the last one ends, and a
       transition that waits for the very first frame of its own sentence reads
       as lagging. Six frames is a fifth of a second — under the point at which
       a viewer registers the picture as having moved first. Anything past that
       is pre-emption and fails. */
    let bad = null;
    if (ref.kind === 'beat' && ref.i > 0 && frame < beatEnd(ref.i - 1) - ANTICIPATE) {
      const into = beatEnd(ref.i - 1) - frame;
      bad = `starts ${into} frames (${(into / 30).toFixed(2)}s) inside beat ${ref.i - 1}`;
    }
    if (ref.kind === 'cue') {
      const own = cues[ref.name].beat;
      const at = spokenAt(frame);
      if (at >= 0 && at < own) bad = `reaches back into beat ${at}, before cue's own beat ${own}`;
    }
    if (bad) fails++;
    rows.push({ file, li: li + 1, expr, frame, bad });
  });
}
rows.sort((a, b) => a.frame - b.frame);
console.log('— nothing moves before the narration that motivates it —');
for (const r of rows) {
  console.log(`  ${r.bad ? 'FAIL' : 'ok  '} ${`${r.file}:${r.li}`.padEnd(17)}${r.expr.padEnd(30)}f${String(r.frame).padStart(6)} ${mm(r.frame).padStart(8)}${r.bad ? `  <-- ${r.bad}` : ''}`);
}
console.log(`       ${rows.length} timings checked`);

console.log('\n— act seams still overlap —');
const val = (name) => {
  for (const file of fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'))) {
    const m = fs.readFileSync(path.join('src/income-percentile', file), 'utf8')
      .match(new RegExp(`export const ${name} = ([^;]+);`));
    if (m) return Function('beat', 'beatEnd', 'lead', 'cue', 'cueIn', `return (${m[1]})`)(
      beat, beatEnd, lead, (n) => cues[n].frame, (n) => cues[n].startFrame);
  }
  return null;
};
const seams = [['act1>2', 'ACT1_END', 'ACT2_START'], ['act2>3', 'ACT2_END', 'ACT3_START'],
  ['act3>4', 'ACT3_END', 'ACT4_START'], ['act4>5', 'ACT4_END', 'ACT5_START'],
  ['act5>6', 'ACT5_END', 'ACT6_START'], ['act6>7', 'ACT6_END', 'ACT7_START'],
  ['act7>8', 'ACT7_END', 'ACT8_START']];
for (const [name, a, b] of seams) {
  const out = val(a), inn = val(b);
  const ov = out - inn;
  const ok = ov >= 0;
  if (!ok) fails++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}  out ends f${out}  in starts f${inn}  overlap ${ov} frames`);
}
/* ---------------------------------------------------------------------------
   A figure has to be moving while it is being said, and still afterwards.

   Two failures the film has actually shipped, both invisible to every other
   check: a roll whose fixed duration was shorter than the phrase, so the number
   sat still through the first second of its own sentence and then hurried; and
   a scene that unmounted on the very frame its last counter came to rest, so
   the label it had just earned was never readable. Kurzgesagt and 3Blue1Brown
   both animate against a locked voice-over for exactly this reason — the motion
   is cut to the clause, not to a convenient round number of frames — and both
   hold a revealed value still before anything else moves.
--------------------------------------------------------------------------- */
console.log('\n— every figure moves while it is spoken, and rests after —');
{
  const STAGE_SETS = ['IN_INCOME', 'IN_RANK', 'US_RANK', 'US_INCOME',
    'US_COST', 'US_LEFT', 'US_ACTIVE', 'IN_COST', 'IN_ACTIVE', 'IN_SHORT', 'IN_LEFT'];
  const byFrame = new Map();
  for (const [name, c] of Object.entries(cues)) byFrame.set(c.frame, name);
  let n = 0, worstLate = 0;
  for (const set of STAGE_SETS) {
    const stages = S[set];
    if (!stages) continue;
    stages.forEach((st, k) => {
      const name = byFrame.get(st.land);
      if (!name) return;                       // travel steps land on no word
      const dur = st.dur ?? 26;
      const ps = cues[name].startFrame, pe = cues[name].frame;
      const rollStart = st.land - dur;
      const late = rollStart - ps;             // + means the roll begins after the phrase
      const prev = k > 0 ? stages[k - 1].land : -1e9;
      const overlaps = rollStart < prev;
      const why = late > 6 ? `starts ${late} frames after "${cues[name].words}" begins`
        : overlaps ? `starts before the previous figure has landed`
        : null;
      if (why) fails++;
      worstLate = Math.max(worstLate, late);
      n++;
      console.log(`  ${why ? 'FAIL' : 'ok  '} ${`${set}.${name}`.padEnd(30)}phrase ${pe - ps} fr, roll ${dur} fr, begins ${late >= 0 ? '+' : ''}${late}${why ? `  <-- ${why}` : ''}`);
    });
  }
  console.log(`       ${n} figures checked, worst start ${worstLate >= 0 ? '+' : ''}${worstLate} frames`);
}

console.log('\n— a landed figure is readable before its scene leaves —');
{
  const HOLD = 24;                             // 0.8s of stillness, minimum
  const LANDS = new Set();
  for (const set of ['IN_INCOME', 'IN_RANK', 'US_RANK', 'US_INCOME', 'US_COST',
    'US_LEFT', 'US_ACTIVE', 'IN_COST', 'IN_ACTIVE', 'IN_SHORT', 'IN_LEFT']) {
    for (const st of S[set] ?? []) {
      for (const [name, c] of Object.entries(cues)) if (c.frame === st.land) LANDS.add(name);
    }
  }
  const ends = {};
  for (const file of fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'))) {
    const src = fs.readFileSync(path.join('src/income-percentile', file), 'utf8');
    for (const m of src.matchAll(/export const (ACT\d)_(START|END) = ([^;]+);/g)) {
      try {
        ends[`${m[1]}_${m[2]}`] = Function('beat', 'beatEnd', 'lead', 'cue', 'cueIn',
          `return (${m[3]})`)(beat, beatEnd, lead, (x) => cues[x].frame, (x) => cues[x].startFrame);
      } catch { /* not resolvable here */ }
    }
  }
  ends.ACT8_END = timing.totalFrames;
  const inAct = (fr, a, b) => fr >= a && fr <= b;
  for (const act of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const a = act === 1 ? 0 : ends[`ACT${act}_START`];
    const b = ends[`ACT${act}_END`];
    if (a === undefined || b === undefined) continue;
    /* only figures that actually land a number: a text cue like "exist" is the
       last word of a question that has been legible for two seconds already */
    let last = -1, lastName = null;
    for (const [name, c] of Object.entries(cues)) {
      if (!LANDS.has(name)) continue;
      if (inAct(c.frame, a, b) && c.frame > last) { last = c.frame; lastName = name; }
    }
    if (last < 0) continue;
    const held = b - last;
    const good = held >= HOLD;
    if (!good) fails++;
    console.log(`  ${good ? 'ok  ' : 'FAIL'} act${act}  last figure "${lastName}" lands f${last}, scene ends f${b} — held ${held} frames (${(held / 30).toFixed(2)}s)${good ? '' : `  <-- needs ${HOLD}`}`);
  }
}

console.log(fails ? `\n${fails} FAILURES` : '\nALL SYNC CHECKS PASSED');
process.exit(fails ? 1 : 0);
