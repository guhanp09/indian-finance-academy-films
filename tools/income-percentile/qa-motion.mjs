// Motion smoothness QA.
//
// Every animated property in this film is driven by one of a handful of easing
// functions, sampled once per frame. A curve is smooth on screen when it is
// continuous in value AND velocity, and when no single frame carries an
// unreasonable share of the whole move. This measures both, and separately
// scans the scene files for durations too short to be smooth at 30fps.
import { build } from 'esbuild';
import fs from 'fs'; import path from 'path'; import url from 'url';

const out = path.resolve('.qa-motion.mjs');
await build({
  entryPoints: [path.resolve('src/income-percentile/anim.ts')],
  bundle: true, format: 'esm', outfile: out, logLevel: 'silent',
});
const A = await import(url.pathToFileURL(out).href);
fs.unlinkSync(out);

let fails = 0;
const ok = (c, msg) => { console.log(`  ${c ? 'ok  ' : 'FAIL'} ${msg}`); if (!c) fails++; };

const profile = (fn, dur) => {
  const v = Array.from({ length: dur + 1 }, (_, i) => fn(i / dur));
  const d = v.slice(1).map((x, i) => x - v[i]);
  const dd = d.slice(1).map((x, i) => x - d[i]);
  return {
    first: d[0], last: d[d.length - 1],
    maxStep: Math.max(...d.map(Math.abs)),
    maxJerk: Math.max(...dd.map(Math.abs)),
    total: v[v.length - 1] - v[0],
  };
};

console.log('\n— easing curves: share of the move carried by one frame —');
for (const [name, fn] of Object.entries({ out: A.EASE.out, smooth: A.EASE.smooth, toss: A.EASE.toss, roll: A.rollEase })) {
  for (const dur of [14, 22, 30]) {
    const p = profile(fn, dur);
    const pct = (p.maxStep / Math.abs(p.total)) * 100;
    // one frame should never carry more than a quarter of the whole travel:
    // past that the eye reads a cut rather than a move
    ok(pct < 25, `${name.padEnd(7)} dur ${String(dur).padStart(2)}  worst frame ${pct.toFixed(1)}% of travel  jerk ${p.maxJerk.toFixed(4)}`);
  }
}

console.log('\n— endpoint velocities (0 = eases to rest, high = hard cut) —');
for (const [name, fn, wantStart, wantEnd] of [
  ['out', A.EASE.out, 'fast', 'rest'],
  ['smooth', A.EASE.smooth, 'rest', 'rest'],
  ['toss', A.EASE.toss, 'rest', 'fast'],
]) {
  const p = profile(fn, 24);
  const s = p.first * 24, e = p.last * 24;
  const okStart = wantStart === 'rest' ? s < 0.15 : s > 0.5;
  const okEnd = wantEnd === 'rest' ? e < 0.15 : e > 0.5;
  ok(okStart && okEnd, `${name.padEnd(7)} start ${s.toFixed(2)} (${wantStart})  end ${e.toFixed(2)} (${wantEnd})`);
}

console.log('\n— settle: the accent must not jump a frame —');
{
  const at = 100;
  const v = Array.from({ length: 40 }, (_, i) => A.settle(at - 10 + i, at));
  const d = v.slice(1).map((x, i) => x - v[i]);
  const maxStep = Math.max(...d.map(Math.abs));
  ok(maxStep < 0.012, `largest single-frame scale change ${(maxStep * 100).toFixed(2)}% (was 4.50% before the fix)`);
  ok(Math.abs(v[0] - 1) < 1e-9 && Math.abs(v[39] - 1) < 1e-6, `starts and ends at exactly 1.000`);
}

console.log('\n— rollEase: the odometer transport must not kink at its brake point —');
{
  const p1 = (A.rollEase(0.58) - A.rollEase(0.575)) / 0.005;
  const p2 = (A.rollEase(0.585) - A.rollEase(0.58)) / 0.005;
  ok(Math.abs(p1 - p2) / Math.max(p1, p2) < 0.12,
    `velocity across the join ${p1.toFixed(3)} -> ${p2.toFixed(3)} (${(Math.abs(p1 - p2) / p1 * 100).toFixed(1)}% step)`);
}

console.log('\n— scene sources: durations too short to read as motion —');
{
  const files = fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'));
  const hits = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join('src/income-percentile', f), 'utf8');
    // the second argument may itself be a call — lead(54, 8) — so the duration
    // is found by walking the argument list at depth 0 rather than splitting
    // on the first comma, which used to read the inner call's own number
    for (const m of src.matchAll(/\bpr\(\s*f\s*(?:-\s*1\s*)?,/g)) {
      let i = m.index + m[0].length, depth = 0, arg = '', args = [];
      for (; i < src.length && args.length < 2; i++) {
        const ch = src[i];
        if (ch === '(') depth++;
        if (ch === ')') { if (depth === 0) break; depth--; }
        if (ch === ',' && depth === 0) { args.push(arg.trim()); arg = ''; continue; }
        arg += ch;
      }
      if (args.length < 2) { if (arg.trim()) args.push(arg.trim()); }
      const dur = Number(args[1]);
      if (Number.isFinite(dur) && dur < 10) hits.push(`${f}: pr(..., ${dur})`);
    }
  }
  ok(hits.length === 0, hits.length ? `too fast to be smooth: ${hits.join(', ')}` : 'no ramp shorter than 10 frames');
}

/* A highlight exists to say "the narrator is talking about this one, now".
   One left burning after the sentence moves on points the eye at the wrong
   figure, so every accent has to come from `accent()`, whose signature makes
   an end frame mandatory. A raw `fade` with no `out` is the way that rule
   gets broken, and it is invisible until someone watches the render. */
console.log('\n— highlights are pointers, not states —');
{
  const files = fs.readdirSync('src/income-percentile').filter((f) => f.endsWith('.tsx'));
  const bad = [];
  let n = 0;
  for (const f of files) {
    const src = fs.readFileSync(path.join('src/income-percentile', f), 'utf8');
    for (const m of src.matchAll(/\bconst\s+(hi[A-Z][A-Za-z0-9]*|secHi)\s*=\s*([^;]+);/g)) {
      n++;
      const [, name, rhs] = m;
      const uses = rhs.includes('accent(');
      const raw = /\bfade\s*\(/.test(rhs);
      if (!uses || raw) bad.push(`${f}: ${name} = ${rhs.replace(/\s+/g, ' ').slice(0, 64)}`);
    }
  }
  ok(bad.length === 0, bad.length
    ? `accents without a mandatory end: ${bad.join(' | ')}`
    : `all ${n} highlights come from accent(), which cannot be written without an end frame`);
}

console.log(fails ? `\n${fails} FAILURES` : '\nALL MOTION CHECKS PASSED');
process.exit(fails ? 1 : 0);
