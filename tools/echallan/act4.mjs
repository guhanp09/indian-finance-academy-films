/* ACT 4 QA — the last thirty seconds, which is the stretch a viewer judges the film by.
 *
 * Seven things that would break it silently:
 *
 *  1. THE TWO GROUNDS. The return flies from the attacker's compound back to the city, and the
 *     moment one frame holds both the skyline and the compound the geography is a lie. Act 3 has
 *     the same walk for the outbound leg; this is the inbound one.
 *  2. THE HOLDS LAND. Three shots carry this act — the whole machine, the door, and the place to go
 *     instead — and each is held for a stated number of seconds with a stated number of moves.
 *  3. THE ROUTE ENDS AT YOU. It has to arrive on the pavement, in frame, on the word "you", clear
 *     of the band the Shorts UI covers. That is the sentence's whole point.
 *  4. THE DOOR ACTUALLY SHUTS, and shuts BEFORE it is tested: panel, then bolts, then field, all
 *     the way to zero, and all of it done before the courier arrives.
 *  5. THE COURIER NEVER GETS IN. It must stay on the plaza side of the wall's crest and leave.
 *  6. THE REAL OFFICE STANDS CLEAR of the store gate and of the conveyor that feeds it
 *     (rule: two layout tables drift), and is framed big enough to be read.
 *  7. THE SIGN-OFF INHERITS A HELD FRAME: the act must still be running when the card takes over.
 *
 *   node tools/echallan/act4.mjs
 */
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { SCRIPT } from './fragments.mjs';
import { captionPages, captionsFromWords } from '../../src/echallan/caption-pages.mjs';
const NARR = createRequire(import.meta.url)('../../src/echallan/narration.json');

const out = 'qa-echallan/.act4.mjs';
await build({
  entryPoints: ['src/echallan/v2/a4-entry.js'], bundle: true, format: 'esm', platform: 'node',
  outfile: out, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['remotion', '@remotion/*'],
});
const M = await import(path.resolve(out) + `?${Date.now()}`);
const { A4, ACT4_END, focus4, ROUTE, routeAt, travel, wallShut, courierAt, msgAt, SEAL1,
  COUNTER_Q, COUNTER, BAY, CIVIC, MAST_TOP, DOC_W, phoneScale, liftAt, phoneTopY, LIFT_RISE,
  STATION, F, HANDOVER, TOTAL } = M;

const FPS = 60, STEP = 1 / FPS;
let bad = 0;
const fail = (s) => { console.log(`  FAIL  ${s}`); bad++; };
const ok = (s) => console.log(`  ok    ${s}`);

/* ── 1 · THE TWO GROUNDS ────────────────────────────────────────────────────────────────────*/
{
  const CITY_X1 = 1450, CITY_TOP = 470;
  let worst = null;
  for (let t = A4.in - 0.2; t <= A4.street + 1.0; t += STEP) {
    const c = focus4(t);
    const hw = 540 / c.z, hh = 960 / c.z;
    const L = c.x - hw, R = c.x + hw, T = c.y - hh, B = c.y + hh;
    if (L < CITY_X1 && B > CITY_TOP
      && R > STATION.edge && B > STATION.ground - 1500 && T < STATION.ground + 200) { worst = t; break; }
  }
  if (worst !== null) fail(`the city and the compound are both in frame at ${worst.toFixed(2)}s`);
  else ok('the return never holds both grounds in one frame');
}

/* ── 2 · THE HOLDS ──────────────────────────────────────────────────────────────────────────*/
const PAN_STILL = 24, ZOOM_STILL = 0.07;
const rate = (t) => {
  const a = focus4(t - STEP), b = focus4(t + STEP);
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
const moves = (t0, t1) => {
  let n = 0, was = still(t0);
  for (let t = t0; t <= t1; t += STEP) { const s = still(t); if (was && !s) n++; was = s; }
  return n;
};
console.log('\nshot                     window            settled   moves');
for (const [name, t0, t1, floor, maxMoves] of [
  ['the whole machine', A4.approve + 0.10, A4.gone + 0.30, 4.50, 0],
  ['the door you cut', A4.rise - 0.10, A4.away - 0.16, 7.00, 0],
  /* ONE SHOT from the moment it arrives on the building to the sign-off: the shutters, the
     notice landing, the read and the answer all happen inside a frame that has stopped. */
  ['the place to go instead, held', A4.real + 1.05, ACT4_END - 0.05, 7.00, 0],
]) {
  const h = longestHold(t0, t1), m = moves(t0, t1);
  const okHold = h.len >= floor - 1e-6, okMove = m <= maxMoves;
  console.log(`${name.padEnd(24)} ${t0.toFixed(2)}-${t1.toFixed(2)}s   `
    + `${h.len.toFixed(2)}s @${h.at.toFixed(2)}   ${m}   `
    + `${okHold && okMove ? '' : `  <- floor ${floor.toFixed(2)}s / ${maxMoves} moves`}`);
  if (!okHold) fail(`"${name}" settles for ${h.len.toFixed(2)}s, floor is ${floor.toFixed(2)}s`);
  if (!okMove) fail(`"${name}" makes ${m} moves, limit is ${maxMoves}`);
}

/* ── 3 · THE ROUTE SETS OFF AT THE VIEWER'S FEET, AND ONLY EVER CLIMBS ──────────────────────
   The first cut drew this line BACKWARDS from the dish down into the ground and then ran pulses
   back up it. With the sound off that is a thing going into the pavement and coming out again,
   which conveys nothing. It runs forward now, once, and this proves it. */
{
  const c = focus4(A4.draw), v = ROUTE[0];
  const sx = 540 + (v.x - c.x) * c.z, sy = 960 + (v.y - c.y) * c.z;
  console.log(`\nthe route sets off at screen ${sx.toFixed(0)}, ${sy.toFixed(0)}`);
  if (sx < 90 || sx > 990) fail(`it sets off ${sx.toFixed(0)} px across, off to the side`);
  /* THE LIMIT IS WHERE THE CAPTION ACTUALLY IS, not where captions usually are. A flat 1500 is
     the bottom band's top edge, and it is the right number only while this moment's page stands
     at the bottom. captions.mjs measures every page against the picture and moves the busy ones
     up; when this one is up, the floor below the building is clear all the way to the 1740 line
     the Shorts UI covers, and holding the shot 240 px higher than it needs to be is what made the
     framing bottom-heavy in the first place (rule: a gate must measure its reason). */
  const side = JSON.parse(fs.readFileSync('src/echallan/caption-side.json', 'utf8'));
  const page = captionPages(captionsFromWords(NARR.words))
    .find((pg) => A4.draw * 1000 >= pg.startMs - 1 && A4.draw * 1000 <= pg.endMs + 1);
  const up = !!(page && side[String(page.startMs)] === 'top');
  const limit = up ? 1700 : 1500;
  console.log(`  the caption over this beat stands at the ${up ? 'TOP' : 'bottom'}, `
    + `so the floor is clear to y ${limit}`);
  if (sy > limit) fail(`it sets off at y ${sy.toFixed(0)}, under the caption`);
  if (sy < 700) fail(`it sets off at y ${sy.toFixed(0)}, too high to read as ground at your feet`);
  const ends = routeAt(1);
  if (Math.hypot(ends.x - 860, ends.y - 271) > 6) fail('the route does not end on the dish');
  let prev = -1, back = null;
  for (let t = A4.draw - 0.2; t <= A4.gone + 0.2; t += STEP) {
    const u = travel(t);
    if (u < prev - 1e-6 && back === null) back = t;
    prev = Math.max(prev, u);
  }
  if (back !== null) fail(`the route runs backwards at ${back.toFixed(2)}s`);
  else if (sx >= 90 && sx <= 990 && sy <= limit && sy >= 700)
    ok('it sets off at the viewer\'s feet and only ever climbs');
}

/* ── 3b · THE ANTENNA IS NEVER CLIPPED BY THE TOP OF THE FRAME ──────────────────────────────
   The recap cranes up this mast and the mast is the thing it is about, so the frame owes it its
   whole height at every frame of the move — not just at the two keys either end of it. It was
   framed off TIP, which is the RADIATOR'S CENTRE and 56 units below the spire, so the top of the
   antenna sat off the frame for about two seconds while the camera pushed in. This walks every
   frame from the arrival to the moment it fires. */
{
  let worst = 1e9, at = 0;
  for (let t = A4.street - 0.6; t <= A4.gone + 0.3; t += STEP) {
    const c = focus4(t);
    const y = 960 + (MAST_TOP - c.y) * c.z;
    if (y < worst) { worst = y; at = t; }
  }
  console.log(`\nthe antenna's spire is never higher than y ${worst.toFixed(0)} (at ${at.toFixed(2)}s)`);
  if (worst < 36) fail(`the antenna is clipped by the top of the frame at ${at.toFixed(2)}s `
    + `(y ${worst.toFixed(0)}, floor 36)`);
  else ok('the antenna stands clear of the top of the frame the whole way up');
}

/* ── 4 · THE DOOR SHUTS, AND SHUTS FIRST ────────────────────────────────────────────────────*/
{
  const at = (t) => wallShut(t);
  const shutBy = A4.apk0;
  const w = at(shutBy);
  console.log(`\nat the courier's arrival: panel ${w.sink.toFixed(3)} bolts `
    + `${w.boltL.toFixed(3)}/${w.boltR.toFixed(3)} field ${w.fieldOff.toFixed(3)}  (0 = shut)`);
  for (const [k, v] of Object.entries(w)) if (v > 0.001) fail(`the wall's ${k} is still ${v.toFixed(3)} when the parcel arrives`);
  /* and in the right order: the leaf is up before the bolts drive, and the field is last */
  const leafDone = A4.rise + 1.12, boltDone = A4.shut + 0.33, fieldDone = SEAL1;
  console.log(`order: leaf ${leafDone.toFixed(2)}s  bolts ${boltDone.toFixed(2)}s  field ${fieldDone.toFixed(2)}s`);
  if (!(leafDone < boltDone && boltDone < fieldDone)) fail('the wall closes out of order');
  else if (Object.values(w).every((v) => v <= 0.001)) ok('the door is shut, in order, before it is tested');
}

/* ── 5 · THE COURIER TRIES THE SAME DOOR, AND LEAVES ────────────────────────────────────────
   "Never gets in" cannot be tested as a y coordinate: this is a flat world, and the plaza side and
   the court side of the wall differ by draw order, not by height. What IS testable is the thing
   the shot actually has to say — it comes to the SAME opening the first parcel came through, the
   opening is shut at that moment (check 4), and it goes away again rather than hanging there. */
{
  const at = courierAt(A4.apk1);
  const mid = (F.door.x0 + F.door.x1) / 2;
  let last = null, seen = 0;
  for (let t = A4.apk0; t <= A4.turn + 1.6; t += STEP) {
    const d = courierAt(t);
    if (d) { last = d; seen++; }
  }
  console.log(`\nthe courier arrives at ${at ? `${at.x.toFixed(0)},${at.y.toFixed(0)}` : '-'} `
    + `(the breach is ${F.door.x0}..${F.door.x1}) and ends at `
    + `${last ? `${last.x.toFixed(0)},${last.y.toFixed(0)} k=${last.k.toFixed(2)}` : '-'}`);
  if (!at || at.x < F.door.x0 + 40 || at.x > F.door.x1 - 40)
    fail('the courier does not come to the opening the first parcel came through');
  else if (!last || Math.abs(last.x - mid) < 300)
    fail('the courier never gets clear of the wall again');
  else if (last.k > 0.02) fail('the courier is still on screen when the beat ends');
  else ok('it tries the same door, is refused, and goes');
  /* and the message the third movement is about leaves the phone and reaches the counter */
  const a = msgAt(A4.away + 0.02), b = msgAt(A4.arrive - 0.02);
  if (!a || !b) fail('the message never leaves the phone');
  else {
    const c = focus4(A4.arrive - 0.02);
    /* measured against the place the CITY draws the landed notice, not against a number typed
       here a second time — a gate with its own copy of a coordinate stops measuring its reason
       the moment the picture moves (rule: a gate must measure its reason) */
    const want = { x: 540 + (COUNTER_Q.x - c.x) * c.z, y: 960 + (COUNTER_Q.y - c.y) * c.z };
    const d = Math.hypot(b.x - want.x, b.y - want.y);
    /* AND IT LEAVES AT THE SIZE IT WAS. The phone is held at `phoneScale`, so a notice drawn
     DOC_W wide on the glass is narrower than that in the frame — and the flight used to start at
     the design width, so the object grew 9% on the one frame it detached. */
  const onGlass = DOC_W * phoneScale(liftAt(A4.away));
  console.log(`it leaves the glass ${a.w.toFixed(1)} px wide; on the glass it is `
    + `${onGlass.toFixed(1)} px`);
  if (Math.abs(a.w - onGlass) > 1)
    fail(`the message changes size by ${Math.abs(a.w - onGlass).toFixed(1)} px the frame it leaves`);
  else ok('it leaves the glass at exactly the size it was on it');
  console.log(`the message leaves the glass at ${a.x.toFixed(0)},${a.y.toFixed(0)} and reaches `
      + `the counter ${d.toFixed(0)} px off`);
    if (d > 60) fail(`the message misses the counter by ${d.toFixed(0)} px`);
  }
}

/* ── 5b · THE HELD PHONE IS NEVER CROPPED, AND IT ARRIVES ON THE WORD ───────────────────────
 *
 * Two faults that have both actually shipped. The phone's top edge ran off the top of the frame,
 * which reads as a mistake rather than as a bounce; and the lift began almost a second before the
 * narrator said the word it is cued to, because the word map was wrong about where "Please" is.
 * Neither is visible in a still of the settled pose, so both are walked frame by frame here.
 */
{
  const P0 = SCRIPT.split(/\s+/).indexOf('Please');
  const please = NARR.words[P0], next = NARR.words[P0 + 1];
  let worst = 1e9, at = 0, first = null;
  for (let t = A4.door - 1.5; t <= A4.away + 1.6; t += STEP) {
    const e = liftAt(t);
    if (e <= 0.002) continue;
    if (first === null) first = t;
    const y = phoneTopY(e);
    if (y < worst) { worst = y; at = t; }
  }
  if (worst < 18) fail(`the held phone's top edge reaches y ${worst.toFixed(0)} at ${at.toFixed(2)}s `
    + `— it is cropped by the top of the frame`);
  else ok(`the held phone stays ${worst.toFixed(0)} px inside the top of the frame `
    + `(peak of the bounce, ${at.toFixed(2)}s)`);
  /* and the bounce has to be worth the name: how far past its rest does it actually go */
  const rest = phoneTopY(1), over = rest - worst;
  if (over < 55) fail(`the bounce peaks only ${over.toFixed(0)} px above the resting pose — `
    + `that is a settle, not a bounce`);
  else ok(`the bounce carries ${over.toFixed(0)} px past the resting pose`);
  /* THE WORD. It must start rising after the narrator is INTO "Please", and be clear of the
     previous sentence entirely. */
  if (first === null) fail('the phone never appears');
  else if (first < please.s) fail(`the phone starts rising at ${first.toFixed(3)}s, `
    + `${((please.s - first) * 1000).toFixed(0)}ms BEFORE the narrator says "Please" (${please.s.toFixed(3)}s)`);
  else if (first > next.s) fail(`the phone does not start until ${first.toFixed(3)}s, after "Please" `
    + `is finished and "${next.w}" has begun (${next.s.toFixed(3)}s)`);
  else ok(`the phone starts rising ${((first - please.s) * 1000).toFixed(0)}ms into "Please" `
    + `(the word runs ${please.s.toFixed(2)}-${next.s.toFixed(2)}s)`);
}

/* ── 6 · THE REAL OFFICE: CLEAR, AND BIG ENOUGH TO READ ─────────────────────────────────────*/
{
  const x0 = CIVIC.x - CIVIC.w / 2, x1 = CIVIC.x + CIVIC.w / 2;
  console.log(`\nthe real office spans ${x0}..${x1}; the store gate is ${F.gate.x0}..${F.gate.x1}`);
  if (x1 >= F.gate.x0) fail(`it overlaps the store gate by ${(x1 - F.gate.x0).toFixed(0)} units`);
  /* THE CLOSING FRAME, MEASURED AT BOTH ENDS OF AN EIGHT-SECOND HOLD. The sentence names two
     places — the e-Challan portal and the traffic police — so the frame owes them the same size,
     the same distance from the middle and the same amount of daylight. It also owes the building
     its full width, its flagstaff and its plinth, because a closing shot that crops its subject
     reads as a mistake rather than as a choice. */
  const FLAG = 382, PLINTH = 1270;            // the finial, and the foot of the facade
  for (const [when, t] of [['arrives', A4.real + 1.05], ['ends  ', ACT4_END - 0.05]]) {
    const c = focus4(t);
    const X = (q) => 540 + (q - c.x) * c.z, Y = (q) => 960 + (q - c.y) * c.z;
    const L = X(x0), R = X(x1), w = (R - L) / 1080;
    const half = (BAY.w / 2 + 9) * c.z;
    const a0 = X(CIVIC.x + CIVIC.bay[0]), a1 = X(CIVIC.x + CIVIC.bay[1]);
    const bias = Math.abs((a0 + a1) / 2 - 540);
    const spread = Math.abs((540 - a0) - (a1 - 540));
    console.log(`${when}: facade ${L.toFixed(0)}..${R.toFixed(0)} (${(w * 100).toFixed(0)}%), `
      + `bays ${(a0 - half).toFixed(0)}..${(a0 + half).toFixed(0)} and `
      + `${(a1 - half).toFixed(0)}..${(a1 + half).toFixed(0)}, `
      + `finial y ${Y(FLAG).toFixed(0)}, plinth y ${Y(PLINTH).toFixed(0)}`);
    if (L < 16 || R > 1064) fail(`the facade runs off the frame (${L.toFixed(0)}..${R.toFixed(0)})`);
    else if (w < 0.80) fail(`the facade is ${(w * 100).toFixed(0)}% of the width — the camera can `
      + 'come closer without cutting it');
    else if (a0 - half < 16 || a1 + half > 1064)
      fail('one of the two counters is cut off by the frame edge');
    else if (bias > 26) fail(`the frame favours one counter: the pair sits ${bias.toFixed(0)} px `
      + 'off the middle');
    else if (spread > 26) fail(`the two counters are not the same distance from the middle `
      + `(${spread.toFixed(0)} px apart)`);
    else if (Y(FLAG) < 36) fail(`the flagstaff is off the top of the frame at y ${Y(FLAG).toFixed(0)}`);
    else if (Y(PLINTH) > 1730) fail(`the plinth is in the Shorts UI band at y ${Y(PLINTH).toFixed(0)}`);
    else ok(`${when.trim()}: both counters, whole and equal, inside a whole facade`);
  }
}

/* ── 7 · AND WHAT THE COUNTER DOES WITH IT. The last four seconds of the film are a document laid
      on a sill, a lamp reading it and a slip coming back out of a slot, and every one of those four
      things used to be a number typed into two files. They are measured here. */
{
  const bot = COUNTER_Q.y + COUNTER.docH / 2, top = COUNTER_Q.y - COUNTER.docH / 2;
  console.log(`\nthe notice is ${COUNTER.docW.toFixed(0)}x${COUNTER.docH.toFixed(0)} in the city, `
    + `laid at ${top.toFixed(0)}..${bot.toFixed(0)}; the sill is ${BAY.sill}, the lens ${BAY.lamp}`);
  if (Math.abs(bot - BAY.sill) > 0.75) fail('the notice does not rest on the sill it was handed in at');
  else if (top < BAY.lamp + 6) fail('the notice is up inside the reader instead of under it');
  else if (top > BAY.top + (BAY.sill - BAY.top) * 0.62)
    fail('the notice sits too low in the window to be framed by it');
  else ok('the notice is laid on the sill, under the lens, framed by the window');

  console.log(`the slip is ${COUNTER.slipW} wide out of a ${BAY.slotW}-wide slot`);
  if (COUNTER.slipW + 12 > BAY.slotW)
    fail('the slip is as wide as its slot, so it covers the thing it came out of');
  else ok('the slip is fed out of a slot that stays visible either side of it');

  /* and both of them are big enough on the glass to be READ, at the moment they are read */
  const c = focus4(A4.answer + 0.62);
  const dw = COUNTER.docW * c.z, sw = COUNTER.slipW * c.z;
  console.log(`on screen when the answer is out: notice ${dw.toFixed(0)} px, slip ${sw.toFixed(0)} px`);
  if (dw < 140) fail('the notice is too small on screen to be the thing being answered about');
  else if (sw < 205) fail('the answer is too small on screen to be read');
  else ok('the answer, and what it is about, are both legible');
}

/* ── 8 · THE SIGN-OFF INHERITS A HELD FRAME ─────────────────────────────────────────────────*/
{
  const hand = HANDOVER / FPS;
  console.log(`\nthe act runs to ${ACT4_END.toFixed(2)}s; the card takes over at ${hand.toFixed(2)}s `
    + `and the film ends at ${(TOTAL / FPS).toFixed(2)}s`);
  if (ACT4_END > hand + 0.001) fail('the act runs past the card’s handover');
  if (!still(hand - 0.1)) fail('the camera is still moving when the card takes over');
  else if (ACT4_END <= hand + 0.001) ok('the card takes over a settled frame');
}

console.log(bad ? `\n${bad} FAILURE${bad > 1 ? 'S' : ''}` : '\nact 4 holds');
process.exitCode = bad ? 1 : 0;
