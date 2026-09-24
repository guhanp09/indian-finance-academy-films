/* THE LEAN PUBLIC DIR.
 *
 * Remotion copies the whole of `public/` into every bundle it builds. This repo's public folder is
 * 4.1 GB — 3.3 GB of it belongs to a different film — so every still, every render and every score
 * pass was writing a 4.4 GB bundle into /tmp, and three of them in a row filled the disk and killed
 * the render with ENOSPC.
 *
 * This film needs six files. They are HARD-LINKED (same filesystem, no copy, no extra bytes) into
 * .echallan-public/, and every tool here points Remotion at that instead. Bundles drop from 4.4 GB
 * to about 20 MB.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
export const PUBLIC_DIR = path.join(ROOT, '.echallan-public');
const WANT = [
  'Audio/echallan-opening-mix.m4a',
  'Audio/echallan-mix.m4a',
  'Audio/echallan-narration.mp3',
  'Audio/echallan-narration.wav',
  'brand/ifa-mark.png',
  'brand/ifa-mark-teal.png',
];

export function syncPublicDir() {
  for (const rel of WANT) {
    const src = path.join(ROOT, 'public', rel);
    const dst = path.join(PUBLIC_DIR, rel);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    const s = fs.statSync(src);
    if (fs.existsSync(dst)) {
      const d = fs.statSync(dst);
      if (d.ino === s.ino) continue;              // already the same file
      fs.rmSync(dst);
    }
    try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); }
  }
  return PUBLIC_DIR;
}
