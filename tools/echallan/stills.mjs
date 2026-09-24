/* Batch stills: bundle ONCE, render many frames, tile them into rows of six at phone size.
   usage: node tools/echallan/stills.mjs <Comp> <out-prefix> f1 f2 f3 ... */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { syncPublicDir } from './publicdir.mjs';
const FF = '/opt/homebrew/bin/ffmpeg';
const [comp, prefix, ...rest] = process.argv.slice(2);
const frames = rest.map(Number);
fs.mkdirSync('qa-echallan/stills', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/echallan/index.tsx'),
  publicDir: syncPublicDir() });
const composition = await selectComposition({ serveUrl, id: comp, inputProps: {} });
const files = [];
for (const f of frames) {
  const output = `qa-echallan/stills/${prefix}_f${String(f).padStart(4, '0')}.png`;
  await renderStill({ serveUrl, composition, frame: f, output, inputProps: {} });
  files.push(output);
  process.stdout.write(`  ${output} t=${(f / 60).toFixed(2)}\n`);
}
for (let r = 0; r * 6 < files.length; r++) {
  const row = files.slice(r * 6, r * 6 + 6);
  const out = `qa-echallan/${prefix}_row${r}.png`;
  execFileSync(FF, ['-y', ...row.flatMap((f) => ['-i', f]), '-filter_complex',
    `${row.map((_, i) => `[${i}:v]scale=360:-1,drawbox=t=2:c=0x2a3a6a[v${i}]`).join(';')};`
    + `${row.map((_, i) => `[v${i}]`).join('')}${row.length > 1 ? `hstack=inputs=${row.length}` : 'null'}`, out],
    { stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('  ' + out);
}
