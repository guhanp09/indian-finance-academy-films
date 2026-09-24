import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path'; import fs from 'fs';
const OUT = process.env.QA_OUT ?? path.resolve('qa-income-percentile');
fs.mkdirSync(OUT, { recursive: true });
const frames = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
console.log(`rendering ${frames.length} stills`);
const serveUrl = await bundle({ entryPoint: path.resolve('src/income-percentile/index.tsx') });
const composition = await selectComposition({ serveUrl, id: 'IncomePercentile' });
let n = 0;
for (const f of frames) {
  await renderStill({
    composition, serveUrl, output: path.join(OUT, `${String(f).padStart(5, '0')}.png`),
    frame: f, imageFormat: 'png', scale: Number(process.env.QA_SCALE ?? 0.5),
    chromiumOptions: { gl: 'angle' },
  });
  if (++n % 6 === 0) console.log(`  ${n}/${frames.length}`);
}
console.log('done');
