/* THE EYE IS ALIVE. — node tools/echallan/eye.mjs
 *
 * "the eye in the background should not be static; it should be alive and preferably be looking at
 *  whatever feels active in the city… just as an extra layer of immersion, not to be used as a
 *  mechanism for stealing focus at all."
 *
 * Two failures are possible and they are opposites, so both are measured:
 *
 *   DEAD — the pupil sits at one offset for seconds at a time and the thing reads as a painted
 *          prop. A real eye is never still: between saccades it drifts, and it tremors.
 *   BUSY — it moves so much, or so far, that it becomes the thing you watch. The brief is
 *          explicit that it must not steal focus, so the mean rate is capped as well as floored.
 *
 * The units are PUPIL OFFSET, where 1.0 is the full travel the socket allows in that axis.
 */
import { build } from 'esbuild';
import path from 'path';

const out = 'qa-echallan/.eye.mjs';
await build({ entryPoints: ['src/echallan/v2/eye-entry.js'], bundle: true, format: 'esm',
  platform: 'node', outfile: out, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['remotion', '@remotion/*'] });
const M = await import(path.resolve(out) + `?${Date.now()}`);

const FPS = 60;
let bad = 0;
const fail = (s) => { console.log(`  FAIL  ${s}`); bad++; };
const ok = (s) => console.log(`  ok    ${s}`);

/* calibrated on the footage the film was approved on: anything under 0.004/frame-second is a
   pupil that has not moved a pixel, and the longest a real eye holds one fixation is about 0.6s */
const STILL = 0.004, DWELL_MAX = 0.75, MEAN_MIN = 0.08, MEAN_MAX = 1.20;

console.log('act    mean    peak   still   longest fixation');
for (const [name, f, a, b] of [['act 3', M.look3, 67, 100], ['act 4', M.look4, 100, 131]]) {
  let n = 0, still = 0, peak = 0, sum = 0, run = 0, worst = 0, worstAt = a;
  let prev = f(a);
  for (let t = a; t <= b; t += 1 / FPS) {
    const v = f(t);
    const d = Math.hypot(v.x - prev.x, v.y - prev.y) * FPS;
    if (d < STILL) { run += 1 / FPS; if (run > worst) { worst = run; worstAt = t; } } else run = 0;
    if (d < STILL) still++;
    peak = Math.max(peak, d); sum += d; n++; prev = v;
  }
  const mean = sum / n;
  console.log(`${name}  ${mean.toFixed(3)}  ${peak.toFixed(2)}  ${(100 * still / n).toFixed(1)}%`
    + `   ${worst.toFixed(2)}s @${worstAt.toFixed(1)}s`);
  if (worst > DWELL_MAX) fail(`${name}: the eye holds one offset for ${worst.toFixed(2)}s at `
    + `${worstAt.toFixed(1)}s — that reads as a painted prop`);
  else if (mean < MEAN_MIN) fail(`${name}: the eye barely moves (${mean.toFixed(3)}/s)`);
  else if (mean > MEAN_MAX) fail(`${name}: the eye moves enough to steal focus (${mean.toFixed(3)}/s)`);
  else ok(`${name}: it watches, it drifts, and it stays in the background`);
}
console.log(bad ? `\n${bad} problem(s)` : '\nthe eye is alive');
process.exit(bad ? 1 : 0);
