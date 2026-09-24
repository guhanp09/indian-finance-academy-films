/* Frame grabber for inspection. Renders a set of frames and tiles them so several moments
   can be judged against each other in one look — and at phone size, which is the only size that
   matters for a Short. */
import { execFileSync } from 'child_process';
import fs from 'fs';
const FF = '/opt/homebrew/bin/ffmpeg';
const frames = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
fs.mkdirSync('qa-upi', { recursive: true });
const files = [];
for (const f of frames) {
  const out = `qa-upi/f${String(f).padStart(4, '0')}.png`;
  execFileSync('npx', ['remotion', 'still', 'src/upi-scam/index.tsx', 'UpiScam1', out,
    `--frame=${f}`, '--log=error'], { stdio: ['ignore', 'pipe', 'pipe'] });
  files.push(out);
  console.log('  ' + out + '  t=' + (f / 60).toFixed(2) + 's');
}
if (files.length > 1) {
  const args = files.flatMap((f) => ['-i', f]);
  const n = files.length;
  execFileSync(FF, ['-y', ...args, '-filter_complex',
    `${files.map((_, i) => `[${i}:v]scale=340:-1,drawbox=t=2:c=0x2a3a6a[v${i}]`).join(';')};`
    + `${files.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${n}`,
    'qa-upi/strip.png'], { stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('  qa-upi/strip.png');
}
