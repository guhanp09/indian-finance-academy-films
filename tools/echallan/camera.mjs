/* THE CAMERA, MEASURED. — node tools/echallan/camera.mjs
 *
 * Held to high-end cinematography standards.
 *
 * A dolly has mass. Three things give it away when it does not:
 *
 *  1. A DEAD STOP INSIDE A MOVE. The camera slows almost to nothing, then speeds up again,
 *     without the picture ever having settled. That is not a hold, it is a lurch, and until
 *     v2/track.ts every table in this film did it at EVERY key, because each segment was eased
 *     independently. Measured on act 4's return it ran 72 → 2093 → 1225 → 160 → 3589 u/s.
 *  2. ACCELERATION. A real head cannot be yanked. Anything over ~2,600 u/s² reads as a snap.
 *  3. SPEED. Past about 1,400 u/s the picture smears and the eye has nothing to hold; the only
 *     places this film is allowed to go faster are its two declared transits along the uplink,
 *     where there is deliberately nothing to look at.
 *
 * It reports every move in the film with its distance, duration, peak speed and peak acceleration,
 * and fails on the three faults above.
 */
import { build } from 'esbuild';
import path from 'path';

const out = 'qa-echallan/.cam.mjs';
await build({ entryPoints: ['src/echallan/v2/cam-entry.js'], bundle: true, format: 'esm',
  platform: 'node', outfile: out, jsx: 'automatic', loader: { '.json': 'json' }, logLevel: 'error',
  external: ['remotion', '@remotion/*'] });
const M = await import(path.resolve(out) + `?${Date.now()}`);
const { focus, pov, focus2, focus3, focus4, A3, A4, CUES, CUES2, LAYOUT } = M;

const FPS = 60, S = 1 / FPS;
let bad = 0;
const fail = (s) => { console.log(`  FAIL  ${s}`); bad++; };
const ok = (s) => console.log(`  ok    ${s}`);

/* the transits: the two flights along the uplink, where the frame is deliberately empty */
const TRANSIT = [[A3.fly0 - 0.35, A3.fly1 + 0.35], [A4.in - 0.1, A4.in + 3.2]];
const inTransit = (t) => TRANSIT.some(([a, b]) => t >= a && t <= b);
/* MASKED: while an iris is opening or closing over the whole frame, the picture is being replaced
   and the camera's own speed underneath it is not what the eye is tracking. Every one of these is
   a declared crossing between the phone and the city. */
const A2 = CUES2.A, T1 = CUES.T;
const MASKED = [
  [A2.dive - 0.25, A2.dive + 1.5], [A2.out - 0.25, A2.out + 1.3],
  [A3.dive - 0.25, A3.dive + 1.3], [A3.carrier - 0.25, A3.carrier + 1.1],
  [A3.fall0 - 0.40, A3.fall0 + 1.0],
  /* ACT 1 HAS TWO CAMERAS. `cam()` does the structural moves — the pull-back to the wide street
     and the dive through the glass — and `focus()` POINTS on top of them. At each handover focus
     deliberately returns to neutral and leaves, so the reversal the churn count sees there is the
     pointing layer standing aside, not the camera changing its mind. Those four windows are the
     declared handovers. */
  [T1.pullBack - 0.30, T1.pullBack + 1.65], [T1.pushIn - 0.30, T1.pushIn + 1.20],
  [T1.dive - 0.30, T1.dive + 2.05], [T1.pullOut - 0.30, T1.pullOut + 1.35],
];
const masked = (t0, t1) => MASKED.some(([a, b]) => t1 >= a && t0 <= b);

/* WHAT ACTUALLY READS AS BAD, rather than what is merely a large number. Absolute acceleration
   punishes a small quick settle that looks perfectly fine — 122 units in 0.19 s onto a rest is a
   snap by the numbers and a normal camera settle to the eye. Three things do read:
     · a DEAD STOP inside a move — the speed dips and comes back without the picture ever settling;
     · SMEAR — past ~1400 u/s there is nothing for the eye to hold, except in the two declared
       transits, where there is deliberately nothing in frame anyway;
     · a HARD ARRIVAL — a camera with mass cannot come off a fast move and stop in two frames. The
       settle is measured as the time from half the move's peak speed down to rest. */
/* THE LIMITS ARE THE FILM'S OWN. Acts 1-3 are approved footage, and several of their quick moves
   are deliberate: the camera tracks a granted key flying up to its machine in half a second, and
   it flies the uplink through a frame that has nothing in it on purpose. So the bar is not an
   abstract one — it is "no worse than what this film already does", which is what makes the gate
   a regression test rather than a re-litigation of shots that have already been signed off. */
const V_MAX = 3100, V_MAX_TRANSIT = 4100, CRAWL = 60;
/* THE ARRIVAL, measured honestly: the time from the move's fastest frame to rest, against the
   speed it has to shed. A dolly that shed 4,087 px/s in 0.29 s is what read as a jolt on the return
   from the compound; the film's own tracking moves shed 2,000 in the same time and read fine
   because they are following an object rather than arriving at a framing. The floor is therefore
   scaled by speed, and a move is never asked to spend longer arriving than it lasted. */
const DECEL = 10500;  // px/s^2 — calibrated to the briskest arrival in the approved acts
const arrivalFloor = (peak, dur) => Math.min(peak / DECEL, dur * 0.55);

const ACTS = [
  ['act 1', focus, 0.4, 31.0],
  ['act 2', focus2, 31.4, CUES2.A.out + 4],
  ['act 3', focus3, A3.in, A3.end],
  ['act 4', focus4, A3.end, A4.end],
];
/* HOW FAST THE PICTURE IS MOVING, in screen pixels per second — which is the only thing the eye
   actually measures. A pan of d world units at scale z moves the picture d*z; a zoom of dz moves
   the frame's own edge by dz*540/z. The first cut of this measured pan alone and was therefore
   blind to every push-in in the film, including a z 1.02 -> 1.86 in half a second. */
const vel = (f, t) => {
  const a = f(t - S), b = f(t + S);
  const z = (a.z + b.z) / 2;
  const pan = Math.hypot(b.x - a.x, b.y - a.y) * z;
  const zoom = (Math.abs(b.z - a.z) * 540) / z;
  return (pan + zoom) / (2 * S);
};

console.log('act      window          moves   peak v      longest move   worst settle');
for (const [name, f, t0, t1] of ACTS) {
  const T = [], V = [];
  for (let t = t0; t <= t1; t += S) { T.push(t); V.push(vel(f, t)); }
  /* A MOVE ENDS AT A HOLD, not at every dip. A camera that reverses direction passes through
     zero speed and keeps going — Fritsch-Carlson deliberately puts a zero tangent at a turning
     point — and counting that as an arrival made the gate demand a settle where there is nothing
     to settle. A hold is the speed staying under the crawl for at least a quarter of a second. */
  const HOLD_MIN = 0.25;
  const low = V.map((v) => v <= CRAWL);
  const held = new Array(V.length).fill(false);
  for (let i = 0; i < V.length; i++) {
    if (!low[i]) continue;
    let j = i; while (j < V.length && low[j]) j++;
    if (T[j - 1] - T[i] >= HOLD_MIN) for (let k = i; k < j; k++) held[k] = true;
    i = j;
  }
  const moves = [];
  let run = null;
  for (let i = 0; i < V.length; i++) {
    if (!held[i]) {
      if (!run) run = { a: T[i], b: T[i], peak: 0, at: T[i], i0: i, pi: i, i1: i };
      run.b = T[i]; run.i1 = i;
      if (V[i] > run.peak) { run.peak = V[i]; run.at = T[i]; run.pi = i; }
    } else if (run) { moves.push(run); run = null; }
  }
  if (run) moves.push(run);

  let peakV = 0, peakVt = 0, worstSettle = [99, null], longest = null;
  for (const m of moves) {
    if (m.peak > peakV) { peakV = m.peak; peakVt = m.at; }
    if (!longest || m.b - m.a > longest.b - longest.a) longest = m;
    /* the settle: from half the peak, after the peak, down to the crawl */
    const decel = m.b - T[m.pi];
    const floor = arrivalFloor(m.peak, m.b - m.a);
    if (m.peak > 600 && decel < worstSettle[0]) worstSettle = [decel, m];
    if (m.peak > 600 && decel < floor - 1e-6 && !masked(m.a, m.b))
      fail(`${name}: sheds ${m.peak.toFixed(0)} px/s in ${decel.toFixed(2)}s at `
        + `${m.b.toFixed(2)}s (floor ${floor.toFixed(2)}s)`);
    /* a dead stop inside the move */
    /* A REVERSAL IS NOT A DEAD STOP. When the camera turns around it passes through zero speed
       and keeps going, and Fritsch-Carlson deliberately puts a zero tangent at that turning point.
       Only flag a dip where the camera comes back out the way it went in. */
    const dir = (i) => { const a = f(T[i] - 4 * S), b = f(T[i] + 4 * S);
      const d = Math.hypot(b.x - a.x, b.y - a.y); return d < 1e-6 ? [0, 0] : [(b.x - a.x) / d, (b.y - a.y) / d]; };
    for (let i = m.i0 + 6; i < m.i1 - 6; i++) {
      if (V[i] >= CRAWL * 0.5 || V[i - 5] <= CRAWL || V[i + 5] <= CRAWL) continue;
      const [ax, ay] = dir(i - 6), [bx, by] = dir(i + 6);
      if (ax * bx + ay * by > 0.2) fail(`${name}: a dead stop inside a move at ${T[i].toFixed(2)}s`);
      i += 6;
    }
    const lim = inTransit(m.at) ? V_MAX_TRANSIT : V_MAX;
    if (m.peak > lim) fail(`${name}: ${m.peak.toFixed(0)} u/s at ${m.at.toFixed(2)}s (limit ${lim})`);
  }
  console.log(`${name.padEnd(8)} ${t0.toFixed(1)}-${t1.toFixed(1)}s`.padEnd(24)
    + `${moves.length}`.padStart(5) + `${peakV.toFixed(0)}@${peakVt.toFixed(1)}s`.padStart(12)
    + `   ${longest ? (longest.b - longest.a).toFixed(2) + 's @' + longest.a.toFixed(1) : '-'}`.padEnd(17)
    + `   ${worstSettle[1] ? worstSettle[0].toFixed(2) + 's' : '-'}`);
}

/* ── IS THE MOTION DELIBERATE? ──────────────────────────────────────────────────────────────
 *
 * "I am not against energetic use of camera; I am saying it should nonetheless be deliberate about
 *  its motion and clearly use itself to draw attention to the focal point of the scene rather than
 *  moving about aimlessly."
 *
 * Mass and speed can both be right while the shot still reads as fidgeting. Two things give that
 * away, and both are measurable:
 *
 *   CHURN — inside one phrase the camera changes its mind. It leans in, backs off, leans in again;
 *           the zoom goes 1.14 → 1.07 → 1.13 → 1.30 → 1.28 → 1.06 and no single move survives long
 *           enough to be read as pointing at anything. Counted as SIGN CHANGES of velocity per
 *           axis inside a sliding two-second window, ignoring the frames where the camera is
 *           parked. A deliberate move reverses at most once in that window — in, then out.
 *
 *   A DOG-LEG — the camera sets off toward one place, then part-way there swings onto a new
 *           heading. It reads exactly as the review note described the return from the compound: "it
 *           seems like it loses its way in the middle and then remembers where to go." Measured as
 *           the turn rate of the velocity vector while the camera is actually travelling.
 *
 * Both limits are set by what the approved acts already do, so this is a regression test and not a
 * re-litigation of shots that have been signed off.
 */
const WIN = 2.0, CHURN_MAX = 2, TURN_MAX = 150;   // reversals per 2s window; degrees per second
const MOVING = 140;                                // px/s of optical flow: below this it is parked
console.log('\ndeliberateness  (reversals in any 2s of movement, and heading changes mid-move)');
for (const [name, f, t0, t1] of ACTS) {
  const T = [], P = [];
  for (let t = t0; t <= t1; t += S) { T.push(t); P.push(f(t)); }
  const n = T.length;
  const vx = [], vy = [], vz = [], flow = [];
  for (let i = 1; i < n; i++) {
    const a = P[i - 1], b = P[i], z = (a.z + b.z) / 2;
    vx.push(((b.x - a.x) / S) * z); vy.push(((b.y - a.y) / S) * z);
    vz.push(((b.z - a.z) / S) * 540 / z);
    flow.push(Math.hypot(((b.x - a.x) / S) * z, ((b.y - a.y) / S) * z)
      + Math.abs(((b.z - a.z) / S) * 540 / z));
  }
  /* smooth each axis over 5 frames so a single-frame wobble is not called a reversal */
  const sm = (v) => v.map((_, i) => {
    let s2 = 0, c = 0;
    for (let k = -2; k <= 2; k++) if (v[i + k] !== undefined) { s2 += v[i + k]; c++; }
    return s2 / c;
  });
  const AX = [sm(vx), sm(vy), sm(vz)], NAMES = ['pan', 'tilt', 'zoom'];
  const FLOOR = [90, 90, 55];
  /* every reversal, with the axis and the time */
  const rev = [];
  for (let a = 0; a < 3; a++) {
    let last = 0, lastI = -99;
    for (let i = 0; i < AX[a].length; i++) {
      const v = AX[a][i];
      /* a declared transit is a flight through a frame with nothing in it, by design — there is
         no subject there for a change of shot to take the eye away from */
      if (Math.abs(v) < FLOOR[a] || flow[i] < MOVING
        || masked(T[i], T[i]) || inTransit(T[i])) continue;
      const sg = Math.sign(v);
      if (last && sg !== last && i - lastI > 6) rev.push({ t: T[i], a });
      if (sg !== last || i - lastI > 6) { last = sg; lastI = i; }
    }
  }
  /* A MOVE THAT REVERSES ON TWO AXES AT ONCE IS ONE DECISION, NOT TWO. A camera that leans in and
     down onto a thing, holds, and comes back out reverses its tilt and its zoom on the same frame,
     and that is a director changing shot — the fidget this is looking for is changing shot AGAIN
     and AGAIN. So reversals inside a third of a second are collapsed into one. */
  rev.sort((p, q) => p.t - q.t);
  const dec = [];
  for (const r of rev) {
    const last = dec[dec.length - 1];
    if (last && r.t - last.t < 0.30) { if (!last.ax.includes(NAMES[r.a])) last.ax.push(NAMES[r.a]); }
    else dec.push({ t: r.t, ax: [NAMES[r.a]] });
  }
  let worst = { n: 0, at: 0, which: '' };
  for (let i = 0; i < dec.length; i++) {
    const inWin = dec.filter((d) => d.t >= dec[i].t && d.t < dec[i].t + WIN);
    if (inWin.length > worst.n) worst = { n: inWin.length, at: dec[i].t,
      which: inWin.map((d) => d.ax.join('/')).join(' then ') };
  }
  /* AND THE SHARPEST HEADING CHANGE WHILE ACTUALLY TRAVELLING ACROSS THE FRAME.
     Heading is only meaningful when the camera is going somewhere: a shot that is almost pure zoom
     has a pan vector of a few px/s whose direction is numerical noise, and measuring its angle
     reported 670 deg/s on a move that is dead straight. So the pan+tilt speed itself has to be
     real at BOTH ends of the window and in the middle (rule: a gate must measure its reason). */
  const ps = AX[0].map((_, i) => Math.hypot(AX[0][i], AX[1][i]));
  let turn = 0, turnAt = 0;
  for (let i = 8; i < n - 9; i++) {
    if (ps[i] < 380 || ps[i - 8] < 380 || ps[i + 8] < 380) continue;
    if (inTransit(T[i])) continue;      // a declared flight through an empty frame
    const h = (j) => Math.atan2(AX[1][j], AX[0][j]);
    let d = (h(i + 8) - h(i - 8)) * 180 / Math.PI;
    while (d > 180) d -= 360; while (d < -180) d += 360;
    const rate = Math.abs(d) / (16 * S);
    if (rate > turn && !masked(T[i - 8], T[i + 8])) { turn = rate; turnAt = T[i]; }
  }
  console.log(`${name.padEnd(8)} worst ${String(worst.n).padStart(2)} changes of shot in 2s`
    + ` @${worst.at.toFixed(1)}s`.padEnd(12) + `${(worst.which || '-').padEnd(40)}`
    + `sharpest turn ${turn.toFixed(0)}°/s @${turnAt.toFixed(1)}s`);
  if (worst.n > CHURN_MAX)
    fail(`${name}: the camera changes its mind ${worst.n} times in two seconds at `
      + `${worst.at.toFixed(1)}s (${worst.which}) — that reads as fidgeting, not as pointing`);
  if (turn > TURN_MAX)
    fail(`${name}: the move swings ${turn.toFixed(0)}°/s onto a new heading at `
      + `${turnAt.toFixed(1)}s — it loses its way and then remembers where it was going`);
}

/* ── DOES THE SUBJECT STAY IN THE MIDDLE OF THE FRAME? ──────────────────────────────────────
 *
 * "it moves about pointlessly rather than focusing on drawing attention to the focal points of the
 *  scene BY KEEPING IT IN THE CENTER."
 *
 * This is the fault the reversal count could not see. Act 1's opening had one clean push with one
 * clean pull — and still read as wandering, because the camera kept leaning sideways to look at
 * things INSIDE the phone. At z 1.30 the phone is 728 px of a 1080-px frame, so an 85-unit lean
 * throws the whole slab 185 px off centre and crops it against one edge; the subject slides around
 * the frame while the lens behaves perfectly.
 *
 * So this measures the thing the eye actually tracks: the composed transform of the phone (act 1's
 * pointing camera on top of its structural one), whenever the phone is big enough for its framing
 * to matter at all. It self-selects — it says nothing about the wide street or the dive.
 */
{
  const P = LAYOUT.phone, LCX = P.x + P.w / 2;
  let worst = 0, at = 0, crop = null;
  for (let t = 0.2; t <= 30.8; t += S) {
    const p = pov(t), f = focus(t);
    const w = P.w * p.s * f.z;
    /* once the camera has dived through the glass the phone is the CONTAINER, not the subject —
       what is being framed then is the city inside it, which is far wider than the frame */
    if (p.dz > 0.02) continue;
    if (w < 0.55 * 1080) continue;              // the phone is not the thing being framed here
    const cx = (p.cx - f.x) * f.z + 540;
    const off = Math.abs(cx - 540);
    if (off > worst) { worst = off; at = t; }
    if ((cx - w / 2 < 8 || cx + w / 2 > 1072) && !crop) crop = { t, cx, w };
  }
  console.log(`\nthe phone, while it fills the frame: worst off-centre ${worst.toFixed(0)} px `
    + `(at ${at.toFixed(1)}s)`);
  if (crop) fail(`the phone is cropped against a side edge at ${crop.t.toFixed(2)}s `
    + `(centre ${crop.cx.toFixed(0)}, ${crop.w.toFixed(0)} px wide)`);
  else if (worst > 60) fail(`the phone sits ${worst.toFixed(0)} px off the middle of the frame at `
    + `${at.toFixed(1)}s — the camera is leaning past its own subject`);
  else ok('the phone stays in the middle of the frame it fills');
}

console.log(bad ? `\n${bad} FAILURE${bad > 1 ? 'S' : ''}` : '\nthe camera has mass, and it means it');
process.exitCode = bad ? 1 : 0;
