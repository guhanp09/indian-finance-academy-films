import { build } from 'esbuild';
import path from 'path';
await build({ entryPoints: ['src/echallan/timeline.ts'], bundle: true, format: 'esm',
  outfile: '.tts-echallan/tl.mjs', platform: 'node', loader: { '.json': 'json' },
  logLevel: 'error', external: ['react', 'react-dom', 'remotion'] });
await build({ entryPoints: ['src/echallan/design.ts'], bundle: true, format: 'esm',
  outfile: '.tts-echallan/dz.mjs', platform: 'node', loader: { '.json': 'json' },
  logLevel: 'error', external: ['react', 'react-dom'] });
const T = await import(path.resolve('.tts-echallan/tl.mjs'));
const D = await import(path.resolve('.tts-echallan/dz.mjs'));
const { CUE } = T, { band } = D;
const scrim = (t) => Math.max(
  band(t, CUE.smsCard - 0.1, CUE.smsCard + 0.4, CUE.callGrant + 0.5, CUE.callGrant + 0.9),
  band(t, CUE.bgConcept - 0.1, CUE.bgConcept + 0.4, CUE.bgGrant + 0.5, CUE.bgGrant + 0.9),
  band(t, CUE.vpnCard - 0.1, CUE.vpnCard + 0.4, CUE.vpnGrant + 0.5, CUE.vpnGrant + 0.9),
  band(t, CUE.hastyStart, CUE.hastyStart + 0.3, CUE.hastyEnd, CUE.hastyEnd + 0.5));
let worst = 0, at = 0;
for (let f = 3100; f < 3459; f++) {
  const a = scrim(f / 60), b = scrim((f + 1) / 60);
  if (Math.abs(b - a) > worst) { worst = Math.abs(b - a); at = f; }
}
console.log(`scrim: biggest single-frame change ${worst.toFixed(5)} at f${at} (${(at/60).toFixed(3)}s)`);
for (const f of [3274, 3275, 3276, 3277]) console.log(`  f${f} scrim=${scrim(f/60).toFixed(5)}`);
console.log('hastyTaps', CUE.hastyTaps.map(x=>x.toFixed(3)).join(' '), ' hastyEnd', CUE.hastyEnd.toFixed(3));
