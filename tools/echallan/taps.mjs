/* TAP QA. Every contact in the opening is declared in CONTACTS as two functions — where the
   fingertip is, and where the thing it touches is — in ONE coordinate system. This proves:
     1. at the contact instant the tip is ON the target (≤ TOL units),
     2. the tip actually ARRIVES: it is far away 0.5 s before, and it comes to rest (it is not
        passing through at speed),
     3. the finger is on screen at that instant (it exists, not just its maths).
   A failure here is a tap the viewer would see miss. */
import { build } from 'esbuild';
import path from 'path';
const out = 'qa-echallan/.taps.mjs';
await build({
  entryPoints: ['src/echallan/v2/taps-entry.js'], bundle: true, format: 'esm', platform: 'node',
  outfile: out, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['remotion', '@remotion/*'],
});
const M = await import(path.resolve(out) + `?${Date.now()}`);
const ALL = [...M.CONTACTS, ...(M.CONTACTS2 ?? [])];
const TOL = 12;
const fail = [];
for (const c of ALL) {
  const tip = c.tip(c.t), tgt = c.target(c.t);
  if (!tip) { fail.push(`${c.name}: no finger at t=${c.t.toFixed(2)}`); continue; }
  const d = Math.hypot(tip.x - tgt.x, tip.y - tgt.y);
  const before = c.tip(c.t - 0.5);
  const dBefore = before ? Math.hypot(before.x - tgt.x, before.y - tgt.y) : Infinity;
  const a = c.tip(c.t - 1 / 60), b = c.tip(c.t + 1 / 60);
  const speed = a && b ? Math.hypot(b.x - a.x, b.y - a.y) / (2 / 60) : NaN;
  const ok = d <= TOL && dBefore > 40 && speed < 400;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name.padEnd(26)} t=${c.t.toFixed(2)}s  miss ${d.toFixed(1)}  `
    + `0.5s before ${Number.isFinite(dBefore) ? dBefore.toFixed(0) : 'off'}  speed@contact ${speed.toFixed(0)}/s  [${c.space}]`);
  if (!ok) fail.push(c.name);

  /* ── AND IT MAY NOT APPEAR TO TAP ANYTHING ELSE ON THE WAY.
     The four reaches into the city cross the boundary wall to get to a hatch above it, and the
     old two-leg approach came to a dead stop at the junction between its legs — which lands ON
     the wall. The viewer sees a fingertip arrive on a surface, stop, and then move on: a tap on
     the wall, then a second tap on the button. So the approach is measured, not assumed.
       NO STALL      — outside the final SETTLE seconds, the tip never drops below STALL units/s.
       NO FALSE TAP  — whenever it is slower than SLOW units/s it is already near its own target. */
  if (c.approach) {
    const WINDOW = 1.2, SETTLE = 0.34, STALL = 130, SLOW = 330, NEAR = 150;
    let minV = Infinity, minVat = 0, worstSlow = 0, worstSlowAt = 0;
    for (let k = 0; k <= WINDOW * 60; k++) {
      const tt = c.t - WINDOW + k / 60;
      const p0 = c.tip(tt - 1 / 60), p1 = c.tip(tt + 1 / 60);
      if (!p0 || !p1) continue;
      const v = Math.hypot(p1.x - p0.x, p1.y - p0.y) / (2 / 60);
      const here = c.tip(tt);
      const dist = Math.hypot(here.x - tgt.x, here.y - tgt.y);
      if (c.t - tt > SETTLE && v < minV) { minV = v; minVat = tt; }
      if (v < SLOW && dist > worstSlow) { worstSlow = dist; worstSlowAt = tt; }
    }
    const stallOK = minV >= STALL;
    const nearOK = worstSlow <= NEAR;
    console.log(`      approach: slowest ${minV.toFixed(0)}/s @${minVat.toFixed(2)}s `
      + `(floor ${STALL})  |  furthest-while-slow ${worstSlow.toFixed(0)}u @${worstSlowAt.toFixed(2)}s `
      + `(limit ${NEAR})  ${stallOK && nearOK ? 'OK' : '<-- FAIL'}`);
    if (!stallOK) fail.push(`${c.name}: stalls at ${minV.toFixed(0)}/s mid-flight`);
    if (!nearOK) fail.push(`${c.name}: slows to a crawl ${worstSlow.toFixed(0)} units off target`);

    /* ── AND IT MAY NOT PASS THROUGH SOMETHING THAT LOOKS PRESSABLE.
       The exchange stands directly behind the Play Store's portal; an approach that puts the
       fingertip on its sign, even in passing, shows a finger about to press the one thing this
       film says the victim did not press. */
    if (c.avoid) {
      let inside = 0, worstT = 0;
      for (let k = 0; k <= 2.4 * 60; k++) {
        const tt = c.t - 1.6 + k / 60;
        const q = c.tip(tt);
        if (!q) continue;
        if (q.x > c.avoid.x0 && q.x < c.avoid.x1 && q.y > c.avoid.y0 && q.y < c.avoid.y1) {
          inside++; worstT = tt;
        }
      }
      console.log(`      no-touch box: ${inside ? `${inside} frame(s) inside @${worstT.toFixed(2)}s` : 'clear'}`
        + `  ${inside ? '<-- FAIL' : 'OK'}`);
      if (inside) fail.push(`${c.name}: the tip is inside the no-touch box for ${inside} frame(s)`);
    }
  }
}
console.log(fail.length ? `\nFAIL: ${fail.join(', ')}` : '\nall taps land');
process.exit(fail.length ? 1 : 0);
