/* Frame grabber for inspection. Renders stills and tiles them so several moments can be
   judged against each other in one look — and at phone size, which is the only size that matters. */
import { execFileSync } from 'child_process';
import fs from 'fs';
const FF = '/opt/homebrew/bin/ffmpeg';
const comp = process.argv[2] ?? 'Sheet';
const props = process.argv[3] && process.argv[3].startsWith('{') ? process.argv[3] : null;
const frames = process.argv.slice(props ? 4 : 3).map(Number).filter((n) => !Number.isNaN(n));
if (!frames.length) frames.push(0);
fs.mkdirSync('qa-echallan', { recursive: true });
const files = [];
for (const f of frames) {
  const tag = props ? '_' + props.replace(/[^a-zA-Z0-9]/g, '') : '';
  const out = `qa-echallan/${comp}${tag}_f${String(f).padStart(4, '0')}.png`;
  const a = ['remotion', 'still', 'src/echallan/index.tsx', comp, out, `--frame=${f}`, '--log=error'];
  if (props) a.push(`--props=${props}`);
  execFileSync('npx', a, { stdio: ['ignore', 'inherit', 'inherit'] });
  files.push(out);
  console.log('  ' + out + '  t=' + (f / 60).toFixed(2) + 's');
}
if (files.length > 1) {
  execFileSync(FF, ['-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
    `${files.map((_, i) => `[${i}:v]scale=360:-1,drawbox=t=2:c=0x2a3a6a[v${i}]`).join(';')};`
    + `${files.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${files.length}`,
    'qa-echallan/strip.png'], { stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('  qa-echallan/strip.png');
}
