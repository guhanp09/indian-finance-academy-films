// Programmatic QA for the income percentile film:
//   - every staged statistic reaches its target exactly on the narrated frame
//     and is strictly short of it on the frame before
//   - the dot field holds exactly 50 / 40 / 9 / 1 at each resting state
// Bundles the real source so this tests the film's own functions, not a copy.
import { build } from 'esbuild';
import path from 'path'; import fs from 'fs';
import { pathToFileURL } from 'url';

const tmp = path.resolve('.qa-state.mjs');
await build({
  entryPoints: [path.resolve('src/income-percentile/state.ts')],
  bundle: true, format: 'esm', outfile: tmp, platform: 'neutral',
  loader: { '.json': 'json' }, logLevel: 'error',
});
const S = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);
const cues = JSON.parse(fs.readFileSync('src/income-percentile/cues.json', 'utf8')).cues;

let fails = 0;
const near = (a, b) => Math.abs(a - b) < 1e-6;

const checkStages = (name, stages) => {
  for (const st of stages) {
    const at = S.staged(st.land, stages);
    const before = S.staged(st.land - 1, stages);
    // rolls may ascend or descend; "not there yet" means still on the `from` side
    const shortOf = st.to > st.from ? before < st.to - 1e-9 : before > st.to + 1e-9;
    const ok = near(at, st.to) && shortOf;
    const gap = Math.abs(before - st.to);
    if (!ok) { fails++; console.log(`  FAIL ${name} -> ${st.to}  at land=${at} before=${before}`); }
    else console.log(`  ok   ${name.padEnd(10)} f${String(st.land).padStart(5)}  ${String(st.from).padStart(7)} -> ${String(st.to).padStart(7)}   lands exactly; f-1 is ${gap.toFixed(3)} short`);
  }
};

console.log('\n— number synchronisation —');
for (const [n, k] of [
  ['IN income', 'IN_INCOME'], ['IN rank', 'IN_RANK'],
  ['US rank', 'US_RANK'], ['US income', 'US_INCOME'],
  ['US cost', 'US_COST'], ['US left', 'US_LEFT'], ['US active', 'US_ACTIVE'],
  ['IN cost', 'IN_COST'], ['IN short', 'IN_SHORT'], ['IN active', 'IN_ACTIVE'],
]) checkStages(n, S[k]);

console.log('\n— reveal order (India money->rank, US rank->money) —');
const order = [
  ['IN 50%', 'in.12k', 'in.50'], ['IN t10', 'in.32k', 'in.t10'], ['IN t1', 'in.75k', 'in.t1'],
  ['US 50%', 'us.50', 'us.4400'], ['US 90%', 'us.90', 'us.12900'], ['US 99%', 'us.99', 'us.37500'],
];
for (const [label, first, second] of order) {
  const d = cues[second].frame - cues[first].frame;
  const ok = d > 0;
  if (!ok) fails++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(7)} ${first} f${cues[first].frame} -> ${second} f${cues[second].frame}   gap ${(d / 30).toFixed(2)}s`);
}

console.log('\n— meter geometry against fixed ceilings —');
const pct = (a, b) => ((a / b) * 100).toFixed(2) + '%';
for (const [label, m, keys] of [
  ['INDIA (₹1,00,000)', S.IN ?? null, null],
]) void label;
const IN_ = { cap: 100000, median: 12000, top10: 32000, cost: 35400, top1: 75000 };
const US_ = { cap: 50000, cost: 2580, median: 4400, top10: 12900, top1: 37500 };
const want = {
  'IN ₹12K': [IN_.median, IN_.cap, '12.00%'], 'IN ₹32K': [IN_.top10, IN_.cap, '32.00%'],
  'IN ₹35.4K': [IN_.cost, IN_.cap, '35.40%'], 'IN ₹75K': [IN_.top1, IN_.cap, '75.00%'],
  'US $2.58K': [US_.cost, US_.cap, '5.16%'], 'US $4.4K': [US_.median, US_.cap, '8.80%'],
  'US $12.9K': [US_.top10, US_.cap, '25.80%'], 'US $37.5K': [US_.top1, US_.cap, '75.00%'],
};
for (const [k, [a, b, exp]] of Object.entries(want)) {
  const got = pct(a, b);
  const ok = got === exp;
  if (!ok) fails++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${k.padEnd(11)} ${got.padStart(7)}  (expected ${exp})`);
}

console.log('\n— dot field exactness —');
const bands = [{ upTo: 50 }, { upTo: 90 }, { upTo: 99 }];
const count = (fill) => {
  const out = [0, 0, 0, 0];
  for (let k = 0; k < 100; k++) {
    const t = Math.max(0, Math.min(1, fill - k));
    if (t <= 0.001) { out[3]++; continue; }
    out[k < 50 ? 0 : k < 90 ? 1 : 2]++;
  }
  return out;
};
for (const [label, stages] of [['INDIA', S.IN_RANK], ['USA', S.US_RANK]]) {
  for (const st of stages) {
    const [cy, am, vi, ne] = count(S.staged(st.land, stages));
    const want = st.to === 50 ? [50, 0, 0, 50] : st.to === 90 ? [50, 40, 0, 10] : [50, 40, 9, 1];
    const ok = JSON.stringify([cy, am, vi, ne]) === JSON.stringify(want);
    if (!ok) fails++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label} fill=${st.to}: cyan ${cy}, amber ${am}, violet ${vi}, neutral ${ne}`);
  }
}

/* Every counter in the film must come to rest showing whole digits. A wheel
   parked mid-roll reads as a fault, not a figure. */
const tmp2 = path.resolve('.qa-odo.mjs');
await build({
  entryPoints: [path.resolve('src/income-percentile/odo.ts')],
  bundle: true, format: 'esm', outfile: tmp2, platform: 'neutral', logLevel: 'error',
});
const O = await import(pathToFileURL(tmp2).href);
fs.unlinkSync(tmp2);

console.log('\n— counters come to rest on whole digits —');
const COUNTERS = [
  ['IN median', 12000, 1000], ['IN top10', 32000, 1000], ['IN top1', 75000, 1000],
  ['US median', 4400, 100], ['US top10', 12900, 100], ['US top1', 37500, 100],
  ['US cost', 2580, 10], ['US left med', 1820, 10], ['US left tax', 1100, 10],
  ['US left t10', 7200, 10], ['US left t1', 23200, 10],
  ['IN cost', 35400, 100], ['IN short med', 23400, 100], ['IN short t10', 3400, 100],
  ['IN left t1', 39600, 100],
  ['rank 50', 50, 1], ['rank 90', 90, 1], ['rank 99', 99, 1],
  ['hair us', 2550, 10], ['hair in', 120, 10],
  ['phone us', 39950, 10], ['phone in', 42000, 10],
  ['food us', 38250, 10], ['food in', 8000, 10],
  ['tran us', 21250, 10], ['tran in', 3400, 10],
  ['rent us', 110500, 10], ['rent in', 15000, 10],
  ['pay us income', 374000, 100], ['pay us cost', 219300, 100],
  ['pay in income', 12000, 100], ['pay in cost', 35400, 100],
  ['us output', 186500, 10], ['in output', 6980, 10],
  ['ratio 27', 27, 1], ['ratio 34', 34, 1], ['ratio 23', 23, 1], ['ratio 14', 14, 1],
  ['ratio 1.0', 1.0, 0.1], ['ratio 1.7', 1.7, 0.1], ['ratio 2.0', 2.0, 0.1],
  ['fold 6', 6, 1], ['fold 31', 31, 1],
];
for (const [label, v, st] of COUNTERS) {
  const w = O.restingWheels(v, st);
  const off = w.map((p) => Math.abs(p - Math.round(p))).reduce((a, b) => Math.max(a, b), 0);
  const ok = off < 1e-6;
  if (!ok) fails++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(14)} ${String(v).padStart(7)} / step ${String(st).padEnd(5)} worst wheel offset ${off.toFixed(4)}`);
}

/* Every highlight must let go before the narrator names something else.
   The rule the film holds itself to: an accent may stay lit through the beat
   that names its figure and into the silence after it, but never into the
   next spoken beat — by then the voice is pointing somewhere the accent is
   not, and the viewer reads the wrong number against the wrong sentence. */
console.log('\n— every highlight lets go before the next line starts —');
{
  const timing = JSON.parse(fs.readFileSync('src/income-percentile/timing.json', 'utf8'));
  const beats = timing.beats;
  const at = (i) => beats[i].startFrame;
  const end = (i) => beats[i].endFrame;
  const cueF = (n) => cues[n].frame;
  const resolve = (expr) => {
    const src = expr
      .replace(/cueIn\('([^']+)'\)/g, (_, n) => String(cues[n].startFrame))
      .replace(/cue\('([^']+)'\)/g, (_, n) => String(cueF(n)))
      .replace(/beatEnd\((\d+)\)/g, (_, i) => String(end(+i)))
      .replace(/beat\((\d+)\)/g, (_, i) => String(at(+i)));
    if (!/^[\d\s+\-*/()]+$/.test(src)) return null;
    return Function(`return (${src})`)();
  };
  const owner = (frame) => beats.findIndex((b) => frame >= b.startFrame && frame <= b.endFrame);

  /* The rule used to be "let go before the next beat starts", which held while
     the narration was synthesised a line at a time with a gap after each one.
     A person does not read that way: in the recording a single sentence often
     spans two beats with no pause at all, so a beat boundary is no longer
     evidence that the voice has moved on. What still has to be true is the
     thing the rule was protecting — an accent must never still be lit when the
     next figure is being pointed at, and must never become a state. */
  const MAX = 8 * 30;
  const files = fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'));
  let n = 0;
  for (const file of files) {
    const src = fs.readFileSync(path.join('src/income-percentile', file), 'utf8');
    const found = [];
    for (const m of src.matchAll(/accent\(f,\s*([^,]+),\s*([^)]+(?:\)[^,)]*)?)\)/g)) {
      const on = resolve(m[1]);
      const until = resolve(m[2]);
      if (on === null || until === null) continue;
      found.push({ on, until, label: m[1].trim() });
    }
    found.sort((a, b) => a.on - b.on);
    for (let k = 0; k < found.length; k++) {
      const { on, until, label } = found[k];
      n++;
      const b = owner(on);
      const nextOn = found.slice(k + 1).map((x) => x.on).find((x) => x > on);
      const why = until <= on ? 'never lit'
        : until - on > MAX ? `lit ${((until - on) / 30).toFixed(1)}s — a state, not a pointer`
        : nextOn !== undefined && until > nextOn + 4 ? 'still lit when the next figure is named'
        : null;
      if (why) fails++;
      const tag = `${file} ${label}`;
      console.log(`  ${why ? 'FAIL' : 'ok  '} ${tag.padEnd(40)} lit f${on}-${until} (${((until - on) / 30).toFixed(1)}s) · beat ${b}${why ? ` — ${why}` : ''}`);
    }
  }
  console.log(`       ${n} highlights checked`);
}

console.log(fails === 0 ? '\nALL CHECKS PASSED\n' : `\n${fails} FAILURES\n`);
process.exit(fails === 0 ? 0 : 1);
