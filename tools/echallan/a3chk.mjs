import { build } from 'esbuild';
import path from 'path';
const out = path.join('.tts-echallan', 'a3chk.gen.mjs');
await build({ entryPoints: ['src/echallan/v2/a3-entry.js'], bundle: true, format: 'esm', outfile: out,
  platform: 'node', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['react', 'react-dom', 'remotion'] });
const M = await import(path.resolve(out));
const A = M.A3;
if (process.argv[2] === 'clock') {
  for (const [k, v] of Object.entries(A)) console.log('  ' + k.padEnd(9), v.toFixed(3));
  console.log('ACT3_END', M.ACT3_END.toFixed(3), 'frames', Math.round((M.ACT3_END + 0.55) * 60));
  process.exit(0);
}
const ts = process.argv.slice(2).map(Number);
for (const t of ts) {
  const c = M.focus3(t);
  const o = M.otpAt(t), cp = M.copyAt(t);
  console.log(`t=${t.toFixed(2)}  cam ${c.x.toFixed(0)},${c.y.toFixed(0)} z${c.z.toFixed(2)}  `
    + `dz ${M.dz3(t).toFixed(2)}  otp ${o ? `${o.x.toFixed(0)},${o.y.toFixed(0)} k${o.k.toFixed(2)}` : '-'}  `
    + `copy ${cp ? `${cp.x.toFixed(0)},${cp.y.toFixed(0)}` : '-'}`);
}
