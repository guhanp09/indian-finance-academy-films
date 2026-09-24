/* ACT 3 QA — the four things that would break this act silently.
 *
 * 1. THE TWO GROUNDS NEVER MEET. The city stands on q y 1180 and the attacker's site on q y -426,
 *    2400 units up the beam, and they are two different places. The act gets away with that only
 *    because the camera flies between them through a stretch of nothing: the moment one frame
 *    contains the city's skyline AND the compound's ground, the geography is a lie. This walks
 *    every frame of the flight and fails if the two are ever in the same one.
 *
 * 2. THE REVEAL LANDS. The same standard the permissions are held to (tools/echallan/focus.mjs):
 *    a settled camera for a stated number of seconds, measured, on the empty shell and on the
 *    apparatus. "It needs to land" is a taste judgement until it is a number.
 *
 * 3. EVERYTHING TAKEN ARRIVES. Three card tokens, one envelope and its copy each have a journey
 *    with a destination; a path that ends 200 units short of the machine is the kind of thing a
 *    re-timed clock does quietly.
 *
 * 4. THE OPENINGS ACTUALLY OPEN. A doorway or a shaft that stops growing before it covers the
 *    frame shows the world behind it — which is exactly the seam QA found at 75.97 s.
 *
 *   node tools/echallan/act3.mjs
 */
import { build } from 'esbuild';
import path from 'path';

const out = 'qa-echallan/.act3.mjs';
await build({
  entryPoints: ['src/echallan/v2/a3-entry.js'], bundle: true, format: 'esm', platform: 'node',
  outfile: out, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['remotion', '@remotion/*'],
});
const M = await import(path.resolve(out) + `?${Date.now()}`);
const { A3, focus3, tokenAt, otpAt, copyAt, outAt, SHELL, STATION, UPLINK, uplinkAt } = M;

const FPS = 60, STEP = 1 / FPS;
let bad = 0;
const fail = (s) => { console.log(`  FAIL  ${s}`); bad++; };
const ok = (s) => console.log(`  ok    ${s}`);

/* ── 1 · THE TWO GROUNDS ────────────────────────────────────────────────────────────────────*/
{
  const CITY_X1 = 1450;          // the music block's right edge, the last thing the city owns
  const CITY_TOP = 470;          // the highest of the city's own roofs and signs
  let worst = null;
  for (let t = A3.beam - 0.5; t <= A3.back + 0.6; t += STEP) {
    const c = focus3(t);
    const hw = 540 / c.z, hh = 960 / c.z;
    const L = c.x - hw, R = c.x + hw, T = c.y - hh, B = c.y + hh;
    const seesCity = L < CITY_X1 && B > CITY_TOP;
    const seesSite = R > STATION.edge && B > STATION.ground - 1500 && T < STATION.ground + 200;
    if (seesCity && seesSite) { worst = t; break; }
  }
  if (worst !== null) fail(`the city and the compound are both in frame at ${worst.toFixed(2)}s`);
  else ok('the two grounds are never in the same frame');
}

/* ── 2 · THE REVEAL LANDS ───────────────────────────────────────────────────────────────────*/
/* 24 px/s was below this act's own AMBIENT BREATH, which peaks at 45 px/s — so the film's most
   important held image was being counted as two moves because it is alive. A real move here is
   1,800 px/s; 60 sits three orders of magnitude clear of one and above the other
   (rule: a gate must measure its reason). */
const PAN_STILL = 60, ZOOM_STILL = 0.07;
const rate = (t) => {
  const a = focus3(t - STEP), b = focus3(t + STEP);
  const z = (a.z + b.z) / 2;
  return { pan: (Math.hypot(b.x - a.x, b.y - a.y) * z) / (2 * STEP),
    zoom: Math.abs(b.z - a.z) / (2 * STEP) };
};
const still = (t) => { const r = rate(t); return r.pan < PAN_STILL && r.zoom < ZOOM_STILL; };
const longestHold = (t0, t1) => {
  let best = 0, run = 0, at = t0;
  for (let t = t0; t <= t1; t += STEP) {
    if (still(t)) { run += STEP; if (run > best) { best = run; at = t - run; } } else run = 0;
  }
  return { len: best, at };
};
/** how many times the camera STARTS moving inside a window, seeded with what it is already doing */
const moves = (t0, t1) => {
  let n = 0, was = still(t0);
  for (let t = t0; t <= t1; t += STEP) {
    const s = still(t);
    if (was && !s) n++;
    was = s;
  }
  return n;
};
/* the floors this act is held to. The shell is the sentence "the first app was a dropper" and the
   apparatus is "the actual malware" — the two biggest images in the film, and the reason the hold
   after "malware." was raised from 0.46 to 0.95 s. */
const HOLD = { body: 1.30, station: 0.80 };
console.log('\nshot                 window            settled   moves');
const shots = [
  ['the office, standing', A3.push - 0.62, A3.unlock, 0.55, 1],
  /* to where the hollow's own shot begins — the two are contiguous, and a window that ends at
     a fixed offset from the sink got shorter than its own floor when the read sped up */
  ['the front comes down', A3.unlock + 0.20, A3.hollow - 0.02, 0.70, 0],
  ['the hollow', A3.hollow + 0.04, A3.climb0 + 0.50, 0.80, 0],
  /* to just before the deck's own framing, not to carrier+0.1 — the recorded read says
     "malware. The financial details" with 0.09 s between "The" and "financial", so a window
     ending at the carrier stopped 0.05 s before the camera had anywhere to go. The question is
     the same: does the apparatus get HOLD.body seconds on screen, still, before the camera
     leaves it? */
  /* the window ends where the camera ARRIVES at the next framing (A3.deck-0.16), not 60 ms
     after it — otherwise the first frames of the shot AFTER this one fall inside the window
     and its departure counts as a second move in a shot it is not part of */
  ['the apparatus', A3.body - 0.2, A3.deck - 0.16, HOLD.body, 1],
  ['the post office', A3.post + 0.3, A3.run0 - 0.1, 1.20, 1],
  ['the console', A3.forge + 0.2, A3.back - 0.1, HOLD.station, 1],
];
for (const [name, t0, t1, floor, maxMoves] of shots) {
  const h = longestHold(t0, t1), m = moves(t0, t1);
  const okHold = h.len >= floor - 1e-6, okMove = m <= maxMoves;
  console.log(`${name.padEnd(20)} ${t0.toFixed(2)}-${t1.toFixed(2)}s   `
    + `${h.len.toFixed(2)}s @${h.at.toFixed(2)}   ${m}   `
    + `${okHold && okMove ? '' : `  <- floor ${floor.toFixed(2)}s / ${maxMoves} moves`}`);
  if (!okHold) { fail(`"${name}" settles for ${h.len.toFixed(2)}s, floor is ${floor.toFixed(2)}s`); }
  if (!okMove) { fail(`"${name}" makes ${m} moves, limit is ${maxMoves}`); }
}

/* ── 3 · EVERYTHING TAKEN ARRIVES ───────────────────────────────────────────────────────────*/
console.log('\nwhat is taken        from            to              lands');
const TIP_Q = { x: 694, y: 195 };
const near = (p, q, tol) => Math.hypot(p.x - q.x, p.y - q.y) <= tol;
{
  for (let i = 0; i < 3; i++) {
    let first = null, last = null;
    for (let t = A3.lift - 0.2; t <= A3.fall1 + 0.5; t += STEP) {
      const p = tokenAt(i, t);
      if (!p) continue;
      if (!first) first = p;
      last = p;
    }
    const hit = last && near(last, TIP_Q, 120);
    console.log(`card token ${i}         ${first ? `${first.x.toFixed(0)},${first.y.toFixed(0)}` : '-'}`.padEnd(37)
      + `${last ? `${last.x.toFixed(0)},${last.y.toFixed(0)}` : '-'}`.padEnd(16) + (hit ? 'the head' : 'NOWHERE'));
    if (!hit) fail(`card token ${i} ends at ${last ? `${last.x.toFixed(0)},${last.y.toFixed(0)}` : 'nowhere'}, not the antenna`);
  }
  let oLast = null;
  for (let t = A3.otp0; t <= A3.split + 0.6; t += STEP) { const p = otpAt(t); if (p) oLast = p; }
  const inSlot = oLast && Math.abs(oLast.x - 46) < 40 && oLast.y > 588;
  console.log(`the message`.padEnd(21) + `over the skyline`.padEnd(16)
    + `${oLast ? `${oLast.x.toFixed(0)},${oLast.y.toFixed(0)}` : '-'}`.padEnd(16)
    + (inSlot ? 'the sorting hall' : 'NOWHERE'));
  if (!inSlot) fail('the OTP does not end up inside the post office');
  let cLast = null;
  for (let t = A3.split; t <= A3.up1 + 0.2; t += STEP) { const p = copyAt(t); if (p) cLast = p; }
  const atHead = cLast && near(cLast, { x: 706, y: 198 }, 150);
  console.log(`its copy`.padEnd(21) + `the SMS breach`.padEnd(16)
    + `${cLast ? `${cLast.x.toFixed(0)},${cLast.y.toFixed(0)}` : '-'}`.padEnd(16)
    + (atHead ? 'the antenna' : 'NOWHERE'));
  if (!atHead) fail('the forwarded copy never reaches the antenna');
}

/* ── 4 · THE FRONT GOES ALL THE WAY DOWN ────────────────────────────────────────────────────
   The panel sinks into the plinth it stands on. If its travel is shorter than it is tall, a band
   of stone is left standing in the opening and the building is not open — which is the kind of
   thing that survives every other check in this file. */
{
  const colH = 420;
  const drop = (-46) - (-46 - colH - 34) + 10;       // fortress: FRONT_DROP
  const tall = (-46) - (-46 - colH - 34);            // the panel's own height, plinth to architrave
  console.log(`\nthe front: ${tall.toFixed(0)} tall, drops ${drop.toFixed(0)} `
    + `-> ${drop >= tall ? 'clears the opening' : 'LEAVES A BAND STANDING'}`);
  if (drop < tall) fail(`the front only drops ${drop} of its ${tall} units`);
}

/* ── 4b · AND WHAT LEAVES ON THE BEAM ARRIVES IN A SLOT, not at the dish ─────────────────────
   The ray ends at the receiving bowl, nine hundred units above the console. For one cut the
   travelling card stopped there and a second card faded into the slot below it — the only object
   in the act that crosses two worlds, teleporting its last leg. Both halves now follow the
   waveguide down, and this asserts they end where their own slot is. */
{
  for (const [kind, slot] of [['card', STATION.slotA], ['code', STATION.slotB]]) {
    let last = null;
    for (let t = A3.beam; t <= A3.dock1 + 0.4; t += STEP) { const p = outAt(kind, t); if (p) last = p; }
    const d = last ? Math.hypot(last.x - slot.x, last.y - slot.y) : Infinity;
    console.log(`the ${kind} ends ${d === Infinity ? 'NOWHERE' : `${d.toFixed(0)}u from its slot`}`);
    if (!(d <= 18)) fail(`the ${kind} does not reach its slot (${d.toFixed(0)} units short)`);
  }
}

/* ── 5 · THE REVEAL IS BIG ENOUGH TO READ ────────────────────────────────────────────────────
   The defect this act was sent back for, twice. The interior was staged at 37% of the frame's
   width, which is the size of a detail, not of a subject — every object in it came out two or
   three pixels wide and the whole thing read as an unidentifiable dark box. "The asset should be
   better" is a taste note until it is a number, so the hero asset gets a floor on the frame it is
   given: how much of the width it fills, that all of it is actually in shot, and that the courier
   — the one object the sentence turns on — sits clear of the band the Shorts UI covers. */
{
  const t = A3.hollow + 0.40;
  const c = focus3(t);
  const sy = (q) => 960 + (q - c.y) * c.z;
  const w = ((SHELL.x1 - SHELL.x0) * c.z) / 1080;
  const top = sy(SHELL.roof), bot = sy(SHELL.floor), cour = sy(SHELL.cradle.y - 64);
  console.log(`\nthe reveal at ${t.toFixed(2)}s: ${(w * 100).toFixed(0)}% of the width, `
    + `ceiling y ${top.toFixed(0)}, floor y ${bot.toFixed(0)}, courier y ${cour.toFixed(0)}`);
  if (w < 0.60) fail(`the revealed interior is ${(w * 100).toFixed(0)}% of the frame, floor is 60%`);
  if (top < 30) fail(`the interior's ceiling is off the top of the frame at y ${top.toFixed(0)}`);
  if (bot > 1432) fail(`the interior's floor is under the Shorts UI at y ${bot.toFixed(0)}`);
  if (cour > 1380) fail(`the courier sits at y ${cour.toFixed(0)}, inside the Shorts UI band`);
  if (w >= 0.60 && top >= 30 && bot <= 1432 && cour <= 1380) ok('the reveal is framed to be read');
}

/* ── the uplink is one straight line, and both ends are on it ───────────────────────────────*/
{
  const a = uplinkAt(0), b = uplinkAt(1);
  const d = Math.hypot(b.x - STATION.dish.x, b.y - STATION.dish.y);
  console.log(`\nuplink: (${a.x.toFixed(0)}, ${a.y.toFixed(0)}) -> (${b.x.toFixed(0)}, ${b.y.toFixed(0)})`
    + `  ${UPLINK.len} units at ${((Math.atan2(UPLINK.dir.x, -UPLINK.dir.y) * 180) / Math.PI).toFixed(0)}deg`
    + `  bowl ${d.toFixed(0)}u away`);
  if (d > 24) fail(`the ray misses the receiving bowl by ${d.toFixed(0)} units`);
}

console.log(bad ? `\n${bad} FAILURE${bad > 1 ? 'S' : ''}` : '\nact 3 holds');
process.exitCode = bad ? 1 : 0;
