/* v4 §8: the finger's angle from horizontal AT EVERY TAP, not once. The arm's origin is fixed off
   screen, so the forearm arrives at a different angle at each key; the tap-icon read only holds
   while the finger is steep. */
import { place } from '../../src/upi-scam/world/hand-geometry.mjs';
import cues from '../../src/upi-scam/cues.gen.json' with { type: 'json' };
const P = { x: 88, y: 352, w: 904 };                       // phone frame, from Phone.tsx
const KEY = { x: P.x + 30, y: P.y + 610, pitchX: 156, pitchY: 82, w: 138, h: 68 };
const keyPos = (n) => {
  const col = n === 0 ? 1 : (n - 1) % 3, row = n === 0 ? 3 : Math.floor((n - 1) / 3);
  return { x: KEY.x + col * KEY.pitchX + KEY.w / 2, y: KEY.y + row * KEY.pitchY + KEY.h / 2 };
};
const CARD = { x: 128, y: 470, w: 824, home: 470 };
const approve = { x: CARD.x + CARD.w - 30 - 89, y: CARD.home + 353 };
const BEND = { 4: 28, 8: 28, 2: 20, 6: 19 };
const stage = (t) => (t < 17 ? 1.0 : 1.06);
const rows = [['APPROVE', approve, 7, 1], ...[4, 8, 2, 6].map((n) => [`PIN ${n}`, keyPos(n), BEND[n], 1])];
rows.push(['phase F APPROVE (left)', approve, 29, -1]);
let bad = 0;
for (const [name, target, bend, side] of rows) {
  const tip = { x: 540 + (target.x - 540) * 1, y: 950 + (target.y - 950) * 1 };
  const from = side < 0 ? { x: -300, y: 1400 } : { x: 1286, y: 1664 };
  const { theta } = place({ tip, from, fw: 26, hand: side < 0 ? 'left' : 'right', bend });
  const r = (theta * Math.PI) / 180;
  const dir = [Math.sin(r), -Math.cos(r)];                 // the finger's axis, pad -> apex
  const elev = Math.abs(Math.atan2(-dir[1], Math.abs(dir[0])) * 180 / Math.PI);
  const fore = Math.abs(Math.atan2(from.y - tip.y, Math.abs(from.x - tip.x)) * 180 / Math.PI);
  const ok = elev >= 50;
  if (!ok) bad++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(24)} forearm ${fore.toFixed(1)}°  `
    + `bend ${String(bend).padStart(2)}°  ->  finger ${elev.toFixed(1)}°   [>= 50]`);
}
console.log(bad ? `\n${bad} tap(s) below 50°` : '\nevery tap is steep enough to read as a press');
