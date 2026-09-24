import { build } from 'esbuild';
import path from 'path';
await build({ entryPoints: ['src/echallan/camera.ts'], bundle: true, format: 'esm',
  outfile: '.tts-echallan/cam.audit.mjs', platform: 'node', loader: { '.json': 'json' },
  logLevel: 'error', external: ['react', 'react-dom', 'remotion'] });
const M = await import(path.resolve('.tts-echallan/cam.audit.mjs'));
console.log(`camera keys ${M.CAM.length}, rig keys ${M.STAGE.length} — both monotonic`);
const sc = M.CAM.map((k) => k[1]);
console.log(`camera scale range ${Math.min(...sc).toFixed(3)} .. ${Math.max(...sc).toFixed(3)}`);
const rs = M.STAGE.map((k) => k[1]);
console.log(`device scale range ${Math.min(...rs).toFixed(3)} .. ${Math.max(...rs).toFixed(3)}`);
let biggest = 0, at = 0;
for (let t = 0; t < 129; t += 1 / 60) {
  const a = M.camera(t), b = M.camera(t + 1 / 60);
  const d = Math.abs(b.s - a.s) * 1000 + Math.abs(b.y - a.y);
  if (d > biggest) { biggest = d; at = t; }
}
console.log(`fastest camera frame: ${biggest.toFixed(2)} units at ${at.toFixed(2)}s`);
