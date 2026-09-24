/* THE CAMERA'S SPEED, PRINTED. — node tools/echallan/cam-profile.mjs <act1|act2|act3|act4> <t0> <t1>
 *
 * camera.mjs says whether a move is good; this says what it is DOING, a quarter-second at a time:
 * position, zoom, screen-space flow, pan speed and heading. It is how the return from the compound
 * was diagnosed — 1363 px/s, then 800, then 1136, which is a camera losing its way in the middle
 * and then remembering where it was going, and which no single-number gate would have shown.
 */
import { build } from 'esbuild';
import path from 'path';
await build({ entryPoints: ['src/echallan/v2/cam-entry.js'], bundle: true, format: 'esm',
  platform: 'node', outfile: 'qa-echallan/.pr.mjs', jsx: 'automatic', loader: { '.json': 'json' },
  logLevel: 'error', external: ['remotion', '@remotion/*'] });
const M = await import(path.resolve('qa-echallan/.pr.mjs') + `?${Date.now()}`);
const N = await import(path.resolve('src/echallan/narration.json'), { with: { type: 'json' } });
const B = (i) => N.default.blocks[i].start;
const which = process.argv[2] ?? 'act1';
const f = { act1: M.focus, act2: M.focus2, act3: M.focus3, act4: M.focus4 }[which];
const [a, b] = [Number(process.argv[3]), Number(process.argv[4])];
const S = 1/60;
console.log('  t     x      y      z     flow  pan   head');
for (let t = a; t <= b; t += 0.25) {
  const p = f(t), q = f(t + S), z = (p.z + q.z) / 2;
  const vx = (q.x - p.x) / S * z, vy = (q.y - p.y) / S * z;
  const vz = (q.z - p.z) / S * 540 / z;
  console.log(`${t.toFixed(2)} ${p.x.toFixed(0).padStart(6)} ${p.y.toFixed(0).padStart(6)} `
    + `${p.z.toFixed(3)} ${(Math.hypot(vx,vy)+Math.abs(vz)).toFixed(0).padStart(6)} `
    + `${Math.hypot(vx,vy).toFixed(0).padStart(5)} ${(Math.atan2(vy,vx)*180/Math.PI).toFixed(0).padStart(5)}`);
}
if (process.argv[5] === 'beats') {
  for (let i = Number(process.argv[6]); i <= Number(process.argv[7]); i++)
    console.log('B('+i+') =', B(i).toFixed(2), N.default.blocks[i].text);
}
