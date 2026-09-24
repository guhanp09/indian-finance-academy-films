/* Dump the beat map's cues for the audio tools. The score is built from the SAME numbers the
   picture is, so a sound can never be placed at a moment the picture does not have. */
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
await build({ entryPoints: ['src/echallan/timeline.ts'], bundle: true, format: 'esm',
  outfile: '.tts-echallan/tl.mjs', platform: 'node', loader: { '.json': 'json' },
  logLevel: 'error', external: ['react', 'react-dom', 'remotion'] });
const T = await import(path.resolve('.tts-echallan/tl.mjs'));
const cue = {};
for (const [k, v] of Object.entries(T.CUE)) {
  if (typeof v === 'number') cue[k] = +v.toFixed(4);
  else if (Array.isArray(v)) cue[k] = v.map((x) => +x.toFixed(4));
  else if (v && typeof v === 'object') cue[k] = Object.fromEntries(
    Object.entries(v).map(([a, b]) => [a, +(+b).toFixed(4)]));
}
const out = {
  duration: +(T.DURATION / 60).toFixed(4), frames: T.DURATION, fps: 60, cue,
  blocks: T.BEATS.map((b) => ({ i: b.i, t: +b.t.toFixed(4), phase: b.phase, text: b.text })),
  phases: Object.fromEntries(Object.entries(T.PHASE_START).map(([k, v]) => [k, +v.toFixed(4)])),
};
fs.writeFileSync('src/echallan/cues.gen.json', JSON.stringify(out, null, 1));
console.log(`wrote src/echallan/cues.gen.json — ${Object.keys(cue).length} cues, `
  + `${out.blocks.length} blocks, ${out.duration}s`);
