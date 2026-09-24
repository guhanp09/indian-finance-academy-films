/* PACE REPORT — what a given read does to the film's motion.
 *
 * The beat map is word-anchored, so a slower read spreads the film out automatically. What it does
 * NOT do by itself is keep the motion feeling the same: a move interpolated across the gap to the
 * next keyframe gets slower as the gap grows. This measures that, plus the dead air a slower read
 * opens up, so the fix can be aimed at the spots that actually go slack.
 *
 *   node tools/upi-scam/pace.mjs            the current read
 *   node tools/upi-scam/pace.mjs --scale 1.25   the same read, 25% slower, as a stress test
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
const scale = (() => { const i = process.argv.indexOf('--scale');
  return i < 0 ? 1 : Number(process.argv[i + 1]); })();

/* the film's modules import each other without file extensions, which Node's own resolver will
   not follow — so the probe is bundled first. Reading the real tables, never a copy of them. */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'upi-pace-'));
const entry = path.join(tmp, 'probe.ts');
fs.writeFileSync(entry, `
import { CAM, STAGE } from '${process.cwd()}/src/upi-scam/camera';
import { BEATS, NARR } from '${process.cwd()}/src/upi-scam/timeline';
console.log(JSON.stringify({ CAM, STAGE, beats: BEATS.map((b) => b.t),
  dur: NARR.duration, last: NARR.words[NARR.words.length - 1].e }));`);
/* the bundle must sit inside the project: `remotion` stays external and is resolved from here */
const out = path.join(process.cwd(), '.upi-pace.gen.mjs');
execFileSync('node_modules/.bin/esbuild', [entry, '--bundle', '--format=esm',
  '--platform=node', '--log-level=error', '--external:remotion', `--outfile=${out}`]);
const D = JSON.parse(execFileSync('node', [out], { encoding: 'utf8' }).trim().split('\n').pop());
fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(out, { force: true });

const gaps = (rows, i = 0) => rows.slice(1).map((r, k) => (r[i] - rows[k][i]) * scale);
const stat = (xs) => ({ max: Math.max(...xs), med: xs.slice().sort((a, b) => a - b)[xs.length >> 1] });

for (const [name, rows] of [['camera', D.CAM], ['phone rig', D.STAGE]]) {
  const g = gaps(rows).filter((x) => x > 0.001);
  const s = stat(g);
  console.log(`${name}: ${rows.length} keyframes · longest move ${s.max.toFixed(2)}s · median ${s.med.toFixed(2)}s`);
  rows.slice(1).forEach((r, k) => {
    const d = (r[0] - rows[k][0]) * scale;
    if (d > 2.2) console.log(`   long move ${d.toFixed(2)}s  ending at ${(r[0] * scale).toFixed(2)}s`);
  });
}
const bg = gaps(D.beats.map((t) => [t]));
console.log(`beats: ${D.beats.length} · longest gap between beats ${Math.max(...bg).toFixed(2)}s`);
bg.forEach((d, k) => { if (d > 1.6) console.log(`   quiet ${d.toFixed(2)}s from ${(D.beats[k] * scale).toFixed(2)}s`); });
console.log(`narration ${(D.dur * scale).toFixed(2)}s · last word ends ${(D.last * scale).toFixed(2)}s`);
