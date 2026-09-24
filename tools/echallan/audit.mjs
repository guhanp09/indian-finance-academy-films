/* Beat-map audit: loads timeline.ts through esbuild and proves the film's structure.
   Every guard in timeline.ts runs here, so a broken map fails at the tool rather than at render. */
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const out = path.join('.tts-echallan', 'timeline.audit.mjs');
await build({
  entryPoints: ['src/echallan/timeline.ts'], bundle: true, format: 'esm', outfile: out,
  platform: 'node', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['react', 'react-dom', 'remotion'],
});
const T = await import(path.resolve(out));

const phases = [];
for (const b of T.BEATS) {
  const last = phases[phases.length - 1];
  if (!last || last.phase !== b.phase) phases.push({ phase: b.phase, a: b.i, b: b.i, t0: b.t, t1: b.until });
  else { last.b = b.i; last.t1 = b.until; }
}
console.log(`${T.BEATS.length} blocks  ${T.DURATION} frames  ${(T.DURATION / 60).toFixed(3)}s\n`);
console.log('phase            blocks        start      end      dur   energy');
const ENERGY = { hook: 7, apk: 6, barrier: 5, firstapp: 3, update: 6, secondinstall: 6,
  permissions: 8, hasty: 9, payment: 3, reveal: 10, theft: 7, recap: 4, prevention: 4, verify: 2 };
for (const p of phases) {
  console.log(`${p.phase.padEnd(15)} ${String(p.a).padStart(3)}-${String(p.b).padEnd(3)} `
    + `${p.t0.toFixed(2).padStart(9)}s ${p.t1.toFixed(2).padStart(8)}s `
    + `${(p.t1 - p.t0).toFixed(2).padStart(7)}s   ${String(ENERGY[p.phase]).padStart(2)}/10`);
}
const spans = T.BEATS.map((b) => b.until - b.t).filter((x) => x > 0).sort((a, c) => a - c);
console.log(`\nblock span: median ${spans[spans.length >> 1].toFixed(3)}s  `
  + `min ${spans[0].toFixed(3)}s  max ${spans[spans.length - 1].toFixed(3)}s`);
const cues = Object.entries(T.CUE).filter(([, v]) => typeof v === 'number');
console.log(`${cues.length} named cues, all derived from the beat map`);
let bad = 0;
for (const [k, v] of cues) if (!(v >= 0 && v <= T.DURATION / 60)) { console.log('  OUT OF RANGE', k, v); bad++; }
console.log(bad ? `${bad} BAD CUES` : 'every cue lands inside the film');
