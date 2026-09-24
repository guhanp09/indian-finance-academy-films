/* Renders the hand's own geometry module to a raster for auditing — the SAME module the film
   draws, so the audit measures what is on screen, not what the constants intend. */
import fs from 'fs';
import { contour, toPath, nailPath, creasePaths, place } from '../../src/upi-scam/world/hand-geometry.mjs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : Number(process.argv[i + 1]); };
const FWPX = arg('--fw', 110), bend = arg('--bend', 0), press = arg('--press', 0);
const sil = process.argv.includes('--sil');
const pts = contour({ forearm: arg('--forearm', 14), bend, press });
const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
const ox = (-Math.min(...xs) + 1) * FWPX, oy = (-Math.min(...ys) + 0.6) * FWPX;
const W = Math.ceil((Math.max(...xs) - Math.min(...xs) + 2) * FWPX);
const H = Math.ceil((Math.max(...ys) - Math.min(...ys) + 1.2) * FWPX);
const g = `translate(${ox} ${oy}) scale(${FWPX})`;
const sw = 3 / FWPX;
const body = sil
  ? `<g transform="${g}"><path d="${toPath(pts)}" fill="#000"/></g>`
  : `<g transform="${g}" stroke="#A9744F" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">
       <path d="${toPath(pts)}" fill="#E8BE9B"/>
       <path d="${nailPath()}" fill="none" stroke-width="${sw * 0.7}"/>
       ${creasePaths().map((c) => `<path d="${c}" fill="none" stroke-width="${sw * 0.7}"/>`).join('')}
     </g>`;
fs.writeFileSync(process.argv[2], `<style>body{margin:0;background:${sil ? '#fff' : '#101733'}}</style>`
  + `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`);
console.log(JSON.stringify({ W, H }));
