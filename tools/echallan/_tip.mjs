import { build } from 'esbuild';
import path from 'path';
await build({ entryPoints: ['src/echallan/v2/cam-entry.js'], bundle: true, format: 'esm',
  platform: 'node', outfile: 'qa-echallan/.tp.mjs', jsx: 'automatic', loader: { '.json': 'json' },
  logLevel: 'error', external: ['remotion', '@remotion/*'] });
const M = await import(path.resolve('qa-echallan/.tp.mjs') + `?${Date.now()}`);
const { focus4, A4, TIP } = M;
let worst = 1e9, at = 0;
for (let t = A4.street - 1.2; t <= A4.gone + 0.4; t += 1/60) {
  const c = focus4(t);
  const y = 960 + (TIP.y - c.y) * c.z;
  if (y < worst) { worst = y; at = t; }
}
console.log(`antenna tip: lowest screen y ${worst.toFixed(0)} at ${at.toFixed(2)}s  (TIP.y=${TIP.y.toFixed(0)})`);
for (const t of [A4.street-0.8, A4.street-0.4, A4.street, A4.draw, A4.draw+0.6, A4.install, A4.approve]) {
  const c = focus4(t);
  console.log(`t=${t.toFixed(2)} cam=(${c.x.toFixed(0)},${c.y.toFixed(0)},${c.z.toFixed(3)}) tip y=${(960+(TIP.y-c.y)*c.z).toFixed(0)}`);
}
