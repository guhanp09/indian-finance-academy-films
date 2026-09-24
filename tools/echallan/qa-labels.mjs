/* BUTTON-LABEL FIT. A label that touches the edges of the control it sits on is the single most
   obvious "unfinished" tell in a UI, and it is invisible in a diff. This scans the UI modules for
   a Solid/Plate control immediately followed by its Label, estimates the label's rendered width
   with the same per-character heuristic the subtitle layout uses, and fails when the text does not
   clear the control's edges by MIN_PAD on each side.
 *
 *   node tools/echallan/qa-labels.mjs
 */
import fs from 'fs';

const FILES = ['src/echallan/world/screens.tsx', 'src/echallan/world/system.tsx',
  'src/echallan/world/chat.tsx', 'src/echallan/world/device.tsx'];
const MIN_PAD = 14;

const width = (text, size, track = 0) => [...text].reduce((sum, ch) => {
  if (/[ilI1.,:;!'"|]/.test(ch)) return sum + size * 0.26;
  if (/[mwMW@%]/.test(ch)) return sum + size * 0.80;
  if (/[A-Z0-9₹]/.test(ch)) return sum + size * 0.62;
  return sum + size * 0.50;
}, 0) + Math.max(0, text.length - 1) * track;

let fails = 0, checked = 0;
for (const f of FILES) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  /* a control with a literal width, then the next Label with a literal size and literal text */
  /* Only a label CENTRED on its control is a button label. A label placed beside a control (an
     app-icon square with its name next to it) is not, and pairing those produced false alarms —
     a checker that cries wolf teaches you to ignore it. */
  const re = /<Solid[^>]*?\sw=\{(\d+)\}[\s\S]{0,500}?<Label(?=[^>]*anchor="middle")[^>]*?size=\{(\d+)\}[^>]*?(?:track=\{([\d.]+)\})?[^>]*?>\s*(?:\{'([^']+)'\}|([^<{]+?))\s*<\/Label>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, wRaw, sRaw, tRaw, quoted, plain] = m;
    const text = (quoted ?? plain ?? '').trim();
    if (!text || /^\s*$/.test(text)) continue;
    const w = Number(wRaw), size = Number(sRaw), track = Number(tRaw ?? 0);
    const tw = width(text, size, track);
    const pad = (w - tw) / 2;
    checked++;
    const ok = pad >= MIN_PAD;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${f.split('/').pop().padEnd(12)} `
      + `"${text}" size ${size} in ${w}px -> text ${tw.toFixed(0)}px, padding ${pad.toFixed(0)}px/side`);
  }
}
console.log(`\n${checked} labels checked; ${fails} too tight (need >= ${MIN_PAD}px each side)`);
process.exit(fails ? 1 : 0);
