/* Render, then normalise the container. Remotion's h264 writes full-range yuvj420p; YouTube and
   every consumer decoder expect limited-range yuv420p, and the difference shows up as crushed
   blacks on some players. So the master is remuxed through one explicit range conversion. */
import { execFileSync } from 'child_process';
import fs from 'fs';
import { syncPublicDir } from './publicdir.mjs';
const FF = '/opt/homebrew/bin/ffmpeg';
const out = process.argv[2] ?? 'qa-echallan/out/film.mp4';
const range = process.argv[3];          // e.g. 0-1920
const tmp = out.replace(/\.mp4$/, '.raw.mp4');
fs.mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
const a = ['remotion', 'render', 'src/echallan/index.tsx', process.env.ECHALLAN_COMP ?? 'Opening', tmp,
  '--log=error', '--codec=h264', '--crf=18', `--public-dir=${syncPublicDir()}`];
if (range) a.push(`--frames=${range}`);
console.log('rendering…');
execFileSync('npx', a, { stdio: ['ignore', 'inherit', 'inherit'] });
console.log('normalising to limited-range yuv420p…');
execFileSync(FF, ['-y', '-v', 'error', '-i', tmp,
  '-vf', 'scale=in_range=full:out_range=limited',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
fs.rmSync(tmp);
console.log('wrote ' + out);
