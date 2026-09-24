/* ACT 4 — "So what looked like a routine traffic fine…" … "…before opening it."
 *
 * THE LAST THIRTY SECONDS, and the only ones the viewer will still be holding when they decide
 * what they think of the film. Three sentences, three movements, and not one new idea between
 * them — everything here is the film's own world, re-read once more.
 *
 *   1 · THE ROUTE  ("a step-by-step process designed to make you install… approve… hand over…")
 *      The camera comes back down the beam and, for the first and only time, pulls out to the
 *      WHOLE thing: the wall with the hole in it, the plot, the office standing open, the four
 *      breached buildings, the machine on the roof. Then the red line that came home at the end of
 *      act 3 draws itself BACKWARDS down the route it used — dish, head, shaft, office, breach —
 *      and arrives, on the word "you", at the pavement where the message landed. The route ends at
 *      you. Then it runs forward: four pulses on four verbs, each one lighting the thing the
 *      victim actually did. No node, no label, no diagram — one line on real architecture.
 *
 *   2 · THE DOOR  ("a legitimate traffic challan does not require you to install an APK")
 *      Down to the hole the victim cut in their own wall in act 1, and it CLOSES: the panel rises
 *      back out of the threshold, the bolts shoot home, the field draws over it. Then WhatsApp's
 *      courier arrives with the same parcel on the same path — and there is nothing to fly through.
 *      The reversal is the lesson; the same mechanism, run the other way.
 *
 *   3 · THE OTHER PLACE  ("verify it yourself through the official e-Challan portal…")
 *      A message still arrives, because messages do. It lands on the pavement and is never opened.
 *      The camera leaves it there and tracks west along the plaza, past the store gate — the door
 *      that was always the right one — to a building this film has never shown and never needed to:
 *      the real office, standing on the public side of the wall the whole time. Its shutters roll
 *      UP to show a counter, which is the opposite of the front that sank to show a machine, and
 *      the last frame of this film has no red in it at all.
 *
 * NOTHING IS PLACED AT A WALL-CLOCK TIME. Every beat is an offset from a MEASURED word.
 */
import React from 'react';
import { C, H, W, clamp01, ease, lerp, win, breathe, band } from '../design';
import { makeTrack, register } from './track';
import type { FK } from './track';
import { B, W as WORD } from '../timeline';
import {
  A, EYE, FEED_DROP, FEED_FROM, FEED_TO, Inside2, MNT,
} from './act2';
import type { Cap } from './act2';
import { Box3, CAP_COL, CAP_ORDER, Drone, F, Q } from './fortress';
import { ACT3_END } from './act3';
import { BAY, CIVIC, Civic } from './civic';
import { Envelope, feederPoint, gaze } from './organs';
import { CardToken, CodeToken, STATION, Station, Tally, UPLINK, uplinkAt } from './shell';
import { AdviceScreen, DOC_W, Held, LIFT_RISE, NOTICE, heldPoint, liftCurve, phoneScale } from './advice';
import { CHALLAN_H, ChallanDoc, NOTICE_NO } from '../world/chat';
import { LinGrad, Light, P, gid } from './style';

/* ── THE CLOCK ─────────────────────────────────────────────────────────────────────────────*/
export const A4 = {
  in: B(164),                  // 100.032  "So"                the camera lets go of the compound
  street: B(170),              // 102.920  "actually"          and arrives on the street it started on
  draw: B(171),                // 103.460  "a step-by-step"    the route sets off, from the pavement
  install: B(176),             // 106.280  "install the"       up the shaft it built for itself
  approve: B(178),             // 107.982  "approve its"       the four cables the grants left
  hand: B(181),                // 109.720  "hand over"         and what came back along them
  fire: B(186),                // 112.300  "carry"             the head fires the dish
  gone: B(188) + 0.20,         // 113.380  "attack."           and it is away
  /* ── the door ──────────────────────────────────────────────────────────────────────────*/
  /* THE PHONE COMES UP INSIDE THE WORD. "Please" is a long, deliberate 1.05 s in this read, and
     starting the lift on the block's first frame put the slab into the air at the instant the
     previous sentence stopped — it read as arriving BEFORE the word rather than on it. 0.18 s in,
     over 0.80 s, puts it visually settled 55% of the way through "Please" and fully at rest just
     before the word ends. */
  door: WORD(189, 'Please') + 0.18,  // 107.400  "Please"       down to the hole you cut
  rise: B(192),                // 115.060  "a legitimate"      the panel comes back up
  shut: B(194) + 0.40,         // 116.620  "challan does"      the bolts shoot home
  deny: B(196) + 0.46,         // 117.700  "require you"       the file comes forward to be refused
  apk0: B(198) - 0.17,         // 118.050  "install an"        the courier arrives with the parcel
  apk1: B(200),                // 119.560  "sent over"         and meets a wall
  turn: B(201) + 0.30,         // 120.560  "WhatsApp."         it turns and goes
  /* ── the other place ───────────────────────────────────────────────────────────────────*/
  notice: B(202) + 0.10,       // 121.265  "If"                the notice lights: this is what came
  away: B(206),                // 123.402  "verify"            it leaves the phone, and we go with it
  real: B(209),                // 125.080  "the official"      the real one, where it has been
  left: B(210),                // 125.950  "e-Challan"         its first shutter rolls up
  arrive: B(211) + 0.10,       // 126.720                      the message reaches the counter
  right: B(212) + 0.20,        // 127.220  "or your"           and its second shutter
  open: B(214),                // 127.920  "traffic police"    its light reaches the pavement
  /* ── AND THEN THE FILM STOPS TALKING. The read and the answer used to run UNDER the last
     clause, so the one practical thing the film asks the viewer to do was competing with the
     words asking them to do it. They now begin AFTER "before opening it." — the last two and a
     half seconds are silent picture, which is the only part of this film where the image is on
     its own and has to carry the whole argument by itself. */
  scan: B(217) + 0.60,         // 131.400                      the counter reads it
  answer: B(217) + 1.65,       // 132.450                      and the portal answers, itself
  /* the last camera key, and it must land ON or BEFORE the sign-off's handover, which
     EndCard derives from the last measured word — so the card always takes over a frame
     that has already stopped moving. */
  end: B(217) + 3.00,          // 133.800                      held, for the sign-off
} as const;
export const ACT4_END = A4.end;

/* every beat must run forwards, or an edit upstream has quietly reordered the act */
(() => {
  const ks = Object.entries(A4);
  ks.forEach(([k, v], i) => {
    if (i && v < (ks[i - 1][1] as number) - 1e-6)
      throw new Error(`A4.${k} (${(v as number).toFixed(3)}) runs before A4.${ks[i - 1][0]}`);
  });
})();

/* ── THE CAMERA ────────────────────────────────────────────────────────────────────────────
   Act 3 hands the frame over at (2344, -616, 0.95) and this table's first key repeats it, so the
   acts change hands on a frame where nothing moves. The return follows the SAME three points act 3
   flew out on, in reverse, because a straight line from the station to the city puts the compound
   and the skyline in one frame and gives the geography away — tools/echallan/act4.mjs walks it. */
/* ── COMING HOME FROM THE COMPOUND ─────────────────────────────────────────────────────────
 *
 * The longest unbroken move in the film, across a part of the world with nothing in it, and it has
 * to read as ONE decision: the camera lets go of the attacker's console and returns to the street
 * the message landed on. Hand-placed waypoints could not do it. Two of them gave a path that bulged
 * 589 units off the line and a speed that went 1363 → 800 → 1136 → 0, and the dip in the middle is
 * what reads as the camera losing its way and then remembering where it was going.
 *
 * So the move is DESIGNED rather than keyed: a path, and a speed profile along it.
 *
 *   · the path is a polyline that curves gently from the compound down into the city, and it stays
 *     HIGH until it is well clear of the compound, because one frame holding the attacker's ground
 *     on the right and the city's skyline on the left is the one thing the geography cannot
 *     survive (tools/echallan/act4.mjs walks every frame of the return for it);
 *   · the profile is smoothstep along SCREEN-WEIGHTED arc length — pixels, not world units, since
 *     a unit crossed at z 1.16 is a longer journey for the eye than one crossed at 0.95 — so the
 *     camera accelerates once, holds one speed, and decelerates once.
 *
 * The last point also fixes the arrival's framing: at (690, 1020, 1.22) the app building's antenna
 * — the thing the whole recap is about to climb — sat 104 px ABOVE the top of the frame. At
 * (690, 900, 1.16) its tip is at y 91 and the pavement the route sets off from is at 1424.
 */
const HOME_A = { x: 2344, y: -616, z: 0.95 };   // the attacker's console, where act 3 left us
/* THE STREET, FRAMED FOR WHAT IS IN IT — AND THE MARGINS ARE MEASURED, NOT JUDGED.
 *
 * The recap climbs this building, so the shot owes the whole of it: the mast's spire at the top,
 * and at the bottom the spot on the pavement the route sets off from INCLUDING the ripple the
 * ground answers with, which is the widest the mark ever gets. Those two numbers are 95 and
 * 1354.6 in the interior, so the subject is 1,259.6 units tall and its middle is at 725 — and
 * that, not taste, is where the camera's y goes. Anything else is a bias.
 *
 * It has been wrong twice. At z 1.157 the spire sat at y 52 and the mark at y 1446. Re-cut once
 * to "110 px of air each side" — but measured against the 1,520 px the captions leave rather than
 * against the frame, which is not what a viewer sees: in the delivered frame that was 103 px above
 * the spire and 460 px below the ripple, four and a half times as much, and it reads exactly as
 * what it is, a shot pushed down. The margin is equal now, and it is equal in the part of the
 * frame that carries picture: 0 to 1740, the line the Shorts UI covers. At (800, 1.16) the spire
 * lands at y 142 and the bottom of the ground mark at y 1603, which is 137 from that line — 142
 * above and 137 below, against 103 and 280 before. The subject is also BIGGER than it was
 * (z 1.077 -> 1.16), which is the other half of what "bottom-biased" was: the building was small
 * AND low.
 *
 * TWO NUMBERS DECIDE IT AND BOTH ARE FORCED. The spire has to stay clear of the caption's top
 * band, which starts at y 150 — captions.mjs measures this page as the busiest bottom band in the
 * act and stands it at the top, which is also what frees the floor for the ground mark. And the
 * mark itself has to stay out of whichever band the caption is actually on, which is why
 * tools/echallan/act4.mjs now reads caption-side.json instead of assuming the bottom. */
const HOME_B = { x: 690, y: 800, z: 1.16 };     // the street the message landed on
/* THE TWO CONTROL POINTS, and the geography they are solving.
   The compound's edge leaves the frame at camera x < 2180 - 540/z; the city's skyline enters it at
   camera y > 470 - 960/z. The first has to happen BEFORE the second, or one frame holds the
   attacker's base on the right and the victim's rooftops on the left and the 2,400 units the film
   has put between them collapse. That forces the shape: the camera runs west almost level while it
   gets clear of the compound, and only then turns down into the city. Two control points let it do
   that as ONE curve with continuous curvature — the previous cut did the same shape as two straight
   legs meeting at a corner, which is what the speed dip in the middle actually was. */
const HOME_C1 = { x: 2010, y: -672 };
const HOME_C2 = { x: 1075, y: -628 };
const bez = (u: number) => {
  const v = 1 - u, a = v * v * v, b2 = 3 * u * v * v, c = 3 * u * u * v, d = u * u * u;
  return {
    x: a * HOME_A.x + b2 * HOME_C1.x + c * HOME_C2.x + d * HOME_B.x,
    y: a * HOME_A.y + b2 * HOME_C1.y + c * HOME_C2.y + d * HOME_B.y,
  };
};
const homeKeys = (t0: number, t1: number, n = 13): FK[] => {
  /* SCREEN-WEIGHTED ARC LENGTH: the eye measures pixels, and a unit crossed at z 1.16 is a longer
     journey than the same unit at 0.95, so the table is built against px and not world units. */
  const N = 400, cum = [0];
  const zAt = (u: number) => lerp(HOME_A.z, HOME_B.z, u * u * (3 - 2 * u));
  for (let i = 1; i <= N; i++) {
    const p = bez((i - 1) / N), q = bez(i / N);
    cum.push(cum[i - 1] + Math.hypot(q.x - p.x, q.y - p.y) * zAt((i - 0.5) / N));
  }
  const total = cum[N];
  const uAt = (sq: number) => {
    let lo = 0, hi = N;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < sq) lo = m + 1; else hi = m; }
    const i = Math.max(1, lo);
    const f = (sq - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return (i - 1 + f) / N;
  };
  /* SMOOTHSTEP, not the film's ease.inOut. ease.inOut is the piecewise cubic, whose slope peaks at
     THREE times the mean — across a 2,600-px journey that is a 2,000 px/s dash through the middle
     with a hard shoulder on either side of it. Smoothstep peaks at 1.5x, which is a camera that
     gets going, travels at one speed, and comes off it. */
  const smooth = (u: number) => u * u * (3 - 2 * u);
  return Array.from({ length: n }, (_, i) => {
    const w = i / (n - 1), u = uAt(total * smooth(w)), p = bez(u);
    return [lerp(t0, t1, w), p.x, p.y, zAt(u)] as FK;
  });
};

const FOCUS4: FK[] = [
  [ACT3_END, 2344, -616, 0.95],
  [A4.in + 0.12, 2344, -616, 0.95],       // "So"              one beat, still out there
  /* ── THE RETURN, GENERATED (see homeKeys above), not hand-placed. Two hand-placed waypoints
     could not hold a speed: the camera ran 1363 px/s, dropped to 800 in the middle and built back
     to 1136 before it settled, which is exactly what "it loses its way in the middle and then
     remembers where to go" looks like as a number. */
  ...homeKeys(A4.in + 0.12, A4.street).slice(1),
  [A4.draw + 0.30, HOME_B.x, HOME_B.y, HOME_B.z],   // HELD while the route sets off
  /* and then ONE rise, with the thing that is climbing. The camera lags it a little, so the route
     climbs up the frame instead of sitting in the middle of it. */
  [A4.approve - 0.06, 690, 660, 1.52],    // 107.92            onto the whole of what it became
  [A4.gone + 0.34, 690, 660, 1.52],       // 113.72            HELD: approve, hand over, attack
  /* THE STREET GOES LOW so the phone can sit above it. At (690, 900, 1.42) the wall ran from
     screen 846 to 1443 and the phone covers 252 to 1432, so every frame of the leaf rising, the
     bolts driving and the field closing happened behind a slab of glass. */
  [A4.rise - 0.22, 690, 690, 1.30],       // 114.84            down to the hole you cut
  [A4.away - 0.10, 690, 690, 1.30],       // 123.30            HELD: it closes, and is tested
  /* AND WEST ALONG THE PLAZA, ONTO THE BUILDING — and then it stops, and it does not move again
     until the sign-off takes the frame.
     The cut before this one pushed on from here into the LEFT bay alone, which made the last
     sentence read as being about the e-Challan portal and not about the traffic police counter
     beside it, although the sentence names both. It is one framing now, held for eight seconds:
     CENTRED ON THE BUILDING, so the two counters sit either side of the frame's middle at equal
     size and equal distance, with the whole width of the facade in shot and a margin of daylight
     down both sides. Everything that happens after this — the shutters, the notice landing, the
     read, the answer — happens inside a frame that has stopped moving, which is what a closing
     shot is. The numbers are chosen against the tallest and widest things in the building:
     z 1.80 puts the facade at 87% of the frame's width, the flagstaff's finial at y 96 and the
     plinth at y 1694, clear of the Shorts UI band. tools/echallan/act4.mjs measures all of it. */
  [A4.real + 0.90, CIVIC.x, 862, 1.80],
  [A4.end, CIVIC.x, 862, 1.80],               // LOCKED: both counters, to the sign-off
];
/* read with the film's dolly, not with ease.inOut between neighbours — see v2/track.ts */
const track4 = makeTrack(register('act4', FOCUS4));
/* the same breath, on the same absolute clock and the same amplitude as act 3, so the handover
   frame does not jump: it is literally the same curve continuing */
const BREATH_A = 11;
const breath = (t: number) => ({
  x: breathe(t, 5, 0.29) * BREATH_A,
  y: breathe(t, 23, 0.25) * BREATH_A * 0.62,
  z: breathe(t, 43, 0.21) * 0.0045,
});
/* AND IT IS LOCKED OFF FOR THE LAST SHOT. The breath is 11 units, which is nothing while the
   camera is working — but held on one framing for eight seconds it walks the frame 20 px sideways,
   and by the end the two counters the closing shot is about were 44 px out of balance
   (tools/echallan/act4.mjs measures that pair at both ends of the hold). A closing shot is locked
   off on purpose, so the breath is damped out as the camera settles on the building. There is
   plenty still moving inside the frame — the shutters, the flag, the clock's second hand, the eye,
   the read and the answer — so nothing about it reads as a freeze. */
const LOCK0 = A4.real + 0.30, LOCK1 = A4.real + 1.70;
export function focus4(t: number) {
  const p = track4(t), br = breath(t);
  const live = 1 - ease.inOut(clamp01((t - LOCK0) / (LOCK1 - LOCK0)));
  return { x: p.x + br.x * live, y: p.y + br.y * live, z: p.z + br.z * live };
}

/* ── THE ROUTE ─────────────────────────────────────────────────────────────────────────────
   The attack's own path through the city, as one polyline on things that are actually there: the
   pavement where the message landed, the hole in the wall, the office's floor, its dispatch bay,
   the service shaft, the roofline, the antenna's head, and the dish's feed. It is very nearly one
   straight vertical line, which is the truest thing this film can say about it. */
export const ROUTE = [
  { x: 700, y: 1300 },   // out on the pavement — where it started, and the exact spot the
                         // next message lands on in the third movement
  { x: 690, y: 1246 },   // the threshold of the hole the victim cut in act 1
  { x: 690, y: 1129 },   // the office's own floor, just inside
  { x: 690, y: 1004 },   // the dispatch bay, where the courier is parked
  { x: 690, y: 700 },    // up the service shaft
  { x: 692, y: 452 },    // out through the roof, at the pediment's apex
  { x: 694, y: 198 },    // the antenna's head
  { x: 860, y: 271 },    // and away, on the dish's own feed
];
const SEG = ROUTE.slice(1).map((p, i) => Math.hypot(p.x - ROUTE[i].x, p.y - ROUTE[i].y));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
/** the u at each vertex, so a stage can be named by the thing it ends at rather than by a number */
export const AT = SEG.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s / TOTAL], [0]);
export const routeAt = (u: number) => {
  let d = clamp01(u) * TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i] || i === SEG.length - 1) {
      const f = SEG[i] > 1e-6 ? clamp01(d / SEG[i]) : 1;
      return { x: lerp(ROUTE[i].x, ROUTE[i + 1].x, f), y: lerp(ROUTE[i].y, ROUTE[i + 1].y, f) };
    }
    d -= SEG[i];
  }
  return ROUTE[ROUTE.length - 1];
};
const ROUTE_D = ROUTE.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

/** HOW FAR ALONG THE ROUTE IT HAS TRAVELLED — forward, from the pavement, and only forward.
 *  The first cut drew the line BACKWARDS from the dish down to the ground and then ran pulses back
 *  up it, and the note that found it was exactly right: "something appears to go into the ground
 *  and come back up", which says nothing at all with the sound off. It is one continuous climb
 *  now, even along its own length, and the words land on the parts of the building it is passing
 *  through as it passes through them. */
export const travel = (t: number) => {
  const t0 = A4.draw, t1 = A4.approve - 0.08;
  if (t < t0) return 0;
  const u = clamp01((t - t0) / (t1 - t0));
  /* eased only at its two ends: it sets off, it arrives, and in between it climbs steadily */
  const e = u < 0.12 ? ease.in(u / 0.12) * 0.12
    : u > 0.88 ? 0.88 + ease.out((u - 0.88) / 0.12) * 0.12 : u;
  return e * AT[6];
};

const RouteLine: React.FC<{ t: number }> = ({ t }) => {
  const u = travel(t);
  const fade = 1 - clamp01((t - A4.gone) / 0.7);
  if (u <= 0.0005 || fade <= 0.01) return null;
  /* and the last leg, on "carry out an attack": off the head and away on the dish */
  const out = t > A4.fire ? ease.inOut(clamp01((t - A4.fire) / (A4.gone - A4.fire))) : 0;
  const far = Math.max(u, out > 0 ? lerp(AT[6], 1, out) : 0);
  const tip = routeAt(far);
  const moving = t < A4.approve - 0.04 || out > 0.001;
  return (
    <g opacity={fade}>
      {/* what it has already travelled — thin, because the weight belongs to what is moving */}
      <path d={ROUTE_D} fill="none" stroke={C.red} strokeWidth={2.2} strokeLinecap="round"
        strokeLinejoin="round" opacity={0.26} pathLength={1} strokeDasharray="1 1"
        strokeDashoffset={1 - far} />
      {/* and the length of it still hot behind the head */}
      {moving && (
        <path d={ROUTE_D} fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round"
          strokeLinejoin="round" opacity={0.68} pathLength={1} strokeDasharray="0.12 0.88"
          strokeDashoffset={1 - far} />
      )}
      {moving && (
        <g>
          <circle cx={tip.x} cy={tip.y} r={10} fill="#FFE7EC" />
          <circle cx={tip.x} cy={tip.y} r={19} fill="none" stroke={C.red} strokeWidth={4}
            opacity={0.75} />
          <Light cx={tip.x} cy={tip.y} r={200} color={C.red} k={0.75} />
        </g>
      )}
      {/* every corner it has turned, marked where it turned */}
      {ROUTE.map((v, i) => {
        if (i === 0) return null;
        const on = clamp01((far - AT[i]) / 0.05);
        if (on <= 0.02) return null;
        return <circle key={i} cx={v.x} cy={v.y} r={4.6} fill={C.red} opacity={0.5 * on} />;
      })}
      {/* IT SETS OFF FROM THE PAVEMENT, and the pavement answers — flat, the way ground does */}
      {(() => {
        const go = clamp01((t - A4.draw) / 0.60);
        if (go <= 0.001 || go >= 1) return null;
        const e = ease.out(go), k = 1 - go, v = ROUTE[0];
        return (
          <g opacity={k}>
            <ellipse cx={v.x} cy={v.y} rx={22 + e * 160} ry={(22 + e * 160) * 0.30} fill="none"
              stroke={C.red} strokeWidth={6 - e * 3.4} />
            {[0, 1, 2, 3].map((j) => {
              const sx = j % 2 ? 1 : -1, d = 20 + (j >> 1) * 46;
              return <ellipse key={j} cx={v.x + sx * d * (0.5 + e)} cy={v.y - e * (10 + (j >> 1) * 7)}
                rx={14 + e * 30} ry={6 + e * 13} fill="#C9A9B4" opacity={0.22 * k} />;
            })}
            <Light cx={v.x} cy={v.y} r={280} color={C.red} k={0.75 * k} />
          </g>
        );
      })()}
    </g>
  );
};

/* ── WHAT IS HANDED OVER, coming back up the way it went ───────────────────────────────────
   Three card tokens rise out of the building the victim typed them into, and the message the SMS
   grant let the app read comes back along the feeder that grant left behind. Four things, one
   destination, and every one of them is the object act 3 used. */
const HEAD = { x: 694, y: 198 };
const handAt = (i: number, t: number) => {
  const t0 = A4.hand + i * 0.26, t1 = A4.fire - 0.30;
  if (t < t0 || t > t1) return null;
  const u = ease.inOut(clamp01((t - t0) / (t1 - t0)));
  /* NOTHING APPEARS. Each of these comes edge-first out of the opening it is leaving — the bay for
     the cards, the hoist for the message — which is the same emergence act 3's duplicate used to
     get out of the SMS hatch. A thing that fades up at its source has no source. */
  const sx = ease.out(clamp01(u / 0.14));
  if (i < 3) {
    const from = { x: 690 + (i - 1) * 74, y: 1004 };
    return { x: lerp(from.x, HEAD.x, u * u), y: lerp(from.y, HEAD.y, u), kind: 'card' as const, u, sx };
  }
  const p = feederPoint(FEED_FROM.sms, FEED_TO.sms, FEED_DROP.sms, 1 - u);
  return { x: p.x, y: p.y, kind: 'code' as const, u, sx };
};

/* ── THE DOOR CLOSES ───────────────────────────────────────────────────────────────────────
   Act 1's mechanism, run backwards, in its own order: the leaf comes up out of the threshold it
   dropped into, then the bolts drive back through its stiles into the jambs, and only then does
   the field draw across the gap they used to leave. */
export const wallShut = (t: number) => ({
  sink: 1 - ease.inOut(clamp01((t - A4.rise) / 1.12)),
  boltL: 1 - clamp01((t - A4.shut) / 0.24),
  boltR: 1 - clamp01((t - (A4.shut + 0.09)) / 0.24),
  fieldOff: 1 - clamp01((t - (A4.shut + 0.60)) / 0.22),
});

/** THE FIELD COMES BACK ACROSS. The wall's curtain of light is what things actually hit in this
 *  film, and for a hundred seconds there has been a hole in it. It does not fade up: it closes
 *  from BOTH JAMBS INWARD and meets in the middle, because that is the only way a field strung
 *  between two posts can re-establish — and the meeting is the moment the door is shut. */
export const SEAL0 = A4.shut + 0.20;
export const SEAL1 = A4.shut + 0.62;
const Seal: React.FC<{ t: number }> = ({ t }) => {
  const u = ease.inOut(clamp01((t - SEAL0) / (SEAL1 - SEAL0)));
  if (u <= 0.002) return null;
  const cx = (F.door.x0 + F.door.x1) / 2, half = (F.door.x1 - F.door.x0) / 2;
  const meet = band(t, SEAL1 - 0.05, SEAL1 + 0.04, SEAL1 + 0.28, SEAL1 + 1.0);
  const g = gid('a4seal');
  return (
    <g>
      <defs>
        <LinGrad id={g} stops={[[0, Q.field, 0], [0.7, Q.field, 0.14], [1, Q.field, 0.36]]} />
      </defs>
      {[-1, 1].map((sx) => {
        const x0 = sx < 0 ? F.door.x0 : cx + half * (1 - u);
        return (
          <g key={sx}>
            <rect x={x0} y={F.wallTop - 196} width={half * u} height={196} fill={`url(#${g})`} />
            <rect x={x0} y={F.wallTop - 5} width={half * u} height={9} rx={4.5} fill={Q.field}
              opacity={0.95} />
          </g>
        );
      })}
      {u < 0.999 && [-1, 1].map((sx) => (
        <Light key={sx} cx={cx + sx * half * (1 - u)} cy={F.wallTop} r={132} color={Q.field}
          k={0.8} />
      ))}
      {meet > 0.01 && (
        <g opacity={meet}>
          <circle cx={cx} cy={F.wallTop} r={16 + (1 - meet) * 54} fill="none" stroke={Q.field}
            strokeWidth={6} />
          <Light cx={cx} cy={F.wallTop} r={300} color={Q.field} k={0.9} />
        </g>
      )}
    </g>
  );
};

/* ── THE DELIVERY THAT DOES NOT GET IN ─────────────────────────────────────────────────────
   WhatsApp's own courier, with the same parcel, on the same approach it flew in act 1 — and this
   time the wall is there. It does not bounce and it does not comically recoil: it arrives, the
   field it has run into flares once where it touched, it holds, and it takes the parcel away. */
const COURIER = { in: { x: 250, y: 660 }, at: { x: 690, y: 1012 }, out: { x: 214, y: 540 } };
export const courierAt = (t: number) => {
  if (t < A4.apk0 || t > A4.turn + 1.5) return null;
  if (t <= A4.apk1) {
    const u = ease.inOut(clamp01((t - A4.apk0) / (A4.apk1 - A4.apk0)));
    return { x: lerp(COURIER.in.x, COURIER.at.x, u), y: lerp(COURIER.in.y, COURIER.at.y, u),
      tilt: lerp(-9, 4, u), k: clamp01((t - A4.apk0) / 0.22), turn: 0 };
  }
  if (t <= A4.turn) {
    const u = clamp01((t - A4.apk1) / (A4.turn - A4.apk1));
    return { x: COURIER.at.x, y: COURIER.at.y - Math.sin(u * Math.PI) * 16, tilt: lerp(4, -2, u),
      k: 1, turn: 0 };
  }
  const u = ease.inOut(clamp01((t - A4.turn) / 1.5));
  return { x: lerp(COURIER.at.x, COURIER.out.x, u), y: lerp(COURIER.at.y, COURIER.out.y, u),
    tilt: lerp(-2, -13, Math.min(1, u * 2)), k: 1 - clamp01((u - 0.72) / 0.28), turn: u };
};

/* ── THE MESSAGE, AND WHERE IT IS TAKEN ────────────────────────────────────────────────────
   It does not land on the pavement and lie there any more. It is on the phone, because that is
   where a challan message actually is, and when the viewer is told to verify it themselves it
   LEAVES the phone and is carried to the counter that can answer it. The flight is computed in
   FRAME coordinates at both ends — it starts at the notice's place on the glass and ends at the
   counter's sill, which is a point in the city that the camera is moving past — so one object
   crosses the two spaces without either of them having to bend. */
/* ON THE SILL OF THE COUNTER IT WAS HANDED IN AT, with the portal's answer coming out in front of
   it — stacked, both on the bay's own centre line, so the push-in puts the pair in the middle of
   the frame instead of hard against its left edge. */
const BAY_CX = CIVIC.x + CIVIC.bay[0];
/** IT LANDS SMALLER THAN IT LEFT — 127 px on the glass at the framing it arrives in, not 161.
 *  The counter is 176 city units wide and a 161-px notice filled it corner to corner, so the
 *  lamp that reads it had nowhere to be and the window it was handed in at had no light showing
 *  round it. The push-in that follows takes it back up to 213 px, larger than it has ever been
 *  in the city: the object goes away from you, and the camera goes after it. */
export const MSG_W0 = DOC_W, MSG_W1 = 127;
/** the notice's size IN THE CITY, and therefore where it sits when it is laid on the sill: its
 *  bottom edge ON the sill course, its top clear of the reader's lens by ten units. Everything
 *  the counter does to it is measured off these, so the paper and the fitting cannot drift. */
const DOC_QW = MSG_W1 / 1.55, DOC_QH = CHALLAN_H * (DOC_QW / 422);
export const COUNTER_Q = { x: BAY_CX, y: BAY.sill - DOC_QH / 2 };
/** the last shot of the film, as numbers, so tools/echallan/act4.mjs can MEASURE it rather than
 *  trust it: the paper's size, and the slip's — which must stay narrower than the slot it is fed
 *  out of, or it covers its own source and reads as a sign stuck on the front of the building. */
export const COUNTER = { docW: DOC_QW, docH: DOC_QH, slipW: 150, slipH: 66 } as const;
/** and where the answer comes out: the slot in the face of the sill, which it hangs from */
const SLIP_Q = { x: BAY_CX, y: BAY.slot };
/** THE LIFT, as one curve used by everything that depends on it: the phone's transform, the veil
 *  behind it, and the point on the glass the notice leaves from. It rises on the film's heavy
 *  spring (see advice.tsx) and it LEAVES on an ease-in, because going down out of shot is a hand
 *  lowering, not a hand catching. */
/* the lift is written in seconds now and carries its own rise time, ring and decay — see
   advice.tsx. It is NOT clamped on the way up: the overshoot is the point. */
export const RISE = LIFT_RISE;
export const liftAt = (t: number) => liftCurve(t - A4.door)
  - ease.in(clamp01((t - (A4.away + 0.25)) / 1.05));
type P = { x: number; y: number };
export const qToFrame = (q: P, cam: { x: number; y: number; z: number }): P =>
  ({ x: 540 + (q.x - cam.x) * cam.z, y: 960 + (q.y - cam.y) * cam.z });
/** THE THING THAT TRAVELS IS THE NOTICE. Not an envelope standing for it — the notice itself, at
 *  the size and in the place it was on the glass the frame before it left, so there is never an
 *  instant where one object becomes another. The first cut faded the notice out and started a
 *  generic envelope at the same point, and it read exactly as it was: "the message went black and
 *  an envelope came out of it". What crosses is what you were looking at.
 *
 *  It shrinks as it goes, because it is going away from you and into the world, and it keeps its
 *  own slight tilt from the lift-off. It lands at the counter at the size the counter can hold. */
export const msgAt = (t: number) => {
  if (t < A4.away || t > A4.arrive) return null;
  /* it SETTLES on the sill a fraction before the handover, so the frame where the flying one
     gives way to the one the city draws is a frame where neither of them is moving */
  const u = ease.inOut(clamp01((t - A4.away) / (A4.arrive - 0.14 - A4.away)));
  const to = qToFrame(COUNTER_Q, focus4(t));
  /* it lifts off the glass and then goes: an arc, so it leaves the surface rather than sliding
     along it, and the arc is highest where it is furthest from both ends */
  const lift = Math.sin(u * Math.PI) * 150;
  /* IT LEAVES FROM WHERE THE GLASS ACTUALLY IS. The phone is lifted AND slightly reduced, so the
     notice's place in the frame is its place on the screen put through the same transform — not
     its design coordinate with a constant subtracted from it. */
  const from = heldPoint({ x: NOTICE.cx, y: NOTICE.cy }, liftAt(A4.away));
  /* AND AT THE SIZE IT IS ON THE GLASS. The held phone is drawn at PHONE_S, so a notice that is
     DOC_W wide in the phone's own coordinates is DOC_W * PHONE_S wide in the frame. Starting the
     flight at DOC_W made the notice jump 9% larger on the single frame it left the screen — small,
     and exactly the kind of thing that tells a viewer two different objects were involved. */
  const W0 = MSG_W0 * phoneScale(liftAt(A4.away));
  return { x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u) - lift,
    w: lerp(W0, MSG_W1, ease.inOut(u)), rot: lerp(0, -5, Math.sin(u * Math.PI)), u,
    /* the shadow it casts on the glass while it is still over it */
    off: clamp01(u / 0.22) };
};

const Leftover: React.FC<{ t: number }> = ({ t }) => {
  if (t > A4.street - 0.8) return null;
  return (
    <g>
      <Station t={t} wake={1} docked={1} code={1} forge={1} turn={1} accept={1} hot={0} />
      <Tally x={STATION.tally.x} y={STATION.tally.y} n={4107} k={1} />
    </g>
  );
};

/* THE TUNNEL IS GONE, AND IT STAYS GONE. Act 3 fires one thing along the uplink — the credentials
 * and the code, out to the compound — and the line's whole job is that shot. It was kept faintly
 * alive through the return so the camera had something to come home along, and the effect of that
 * was a line between the city and the attacker's base REAPPEARING after it had served its purpose,
 * which says the channel is still open when the film's next sentence is about how the attack was
 * already complete. The camera now carries the return by itself, on one designed move (`homeKeys`
 * above) rather than by following a thread. Nothing is drawn between the two places again.
 */

/* ── THE CITY, IN ACT 4 ────────────────────────────────────────────────────────────────────*/
const feedDir4 = (t: number) => (t >= A4.hand - 0.1 ? -1 : 1);

/** "APPROVE ITS ACCESS" — the four cables the four grants left behind, lit in the order they were
 *  granted. The first cut of this flared the four HATCHES, which are cut into four buildings at
 *  x 46, 215, 368 and 1055; at the framing this beat is actually played at, three of the four are
 *  off the side of the frame, so one building would have flashed and three would not. The feeders
 *  are all on the roof, all in shot, and they are the more honest object anyway: a hatch is the
 *  permission, a feeder is the access it became. */
const FeederFlare: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {(CAP_ORDER as readonly Cap[]).map((c, i) => {
      const t0 = A4.approve + 0.06 + i * 0.32, t1 = t0 + 0.42;
      if (t < t0 || t > t1 + 1.8) return null;
      const u = ease.inOut(clamp01((t - t0) / (t1 - t0)));
      const p = feederPoint(FEED_FROM[c], FEED_TO[c], FEED_DROP[c], u);
      const land = band(t, t1 - 0.05, t1 + 0.05, t1 + 1.05, t1 + 1.8);
      return (
        <g key={c}>
          {u < 0.999 && (
            <g>
              <circle cx={p.x} cy={p.y} r={8} fill="#FFFFFF" />
              <Light cx={p.x} cy={p.y} r={148} color={CAP_COL[c]} k={0.72} />
            </g>
          )}
          {land > 0.01 && (
            <g opacity={land}>
              <circle cx={FEED_TO[c].x} cy={FEED_TO[c].y} r={17 + 16 * (1 - land)} fill="none"
                stroke={CAP_COL[c]} strokeWidth={6} />
              <circle cx={FEED_TO[c].x} cy={FEED_TO[c].y} r={7} fill="#FFFFFF" />
              <Light cx={FEED_TO[c].x} cy={FEED_TO[c].y} r={210} color={CAP_COL[c]} k={0.85} />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

const gazeTarget4 = (t: number) => {
  const c = focus4(t);
  return c.x > 1400 ? { x: MNT.vpn.x, y: MNT.vpn.y } : { x: c.x, y: c.y };
};
export const look4 = (t: number) => gaze(t, gazeTarget4, EYE);

const Inside4: React.FC<{ t: number }> = ({ t }) => {
  /* the shaft carries what the route is carrying — one object, one machine, no second clock */
  const spine = clamp01((travel(t) - AT[3]) / (AT[4] - AT[3]));
  return (
    <g>
      <Inside2 t={Math.max(t, A.out + 2)}
        a3={{
          beam: band(t, A4.fire + 0.20, A4.fire + 0.50, A4.gone + 0.10, A4.gone + 0.70),
          feedDir: feedDir4(t), look: look4(t), latch: 1,
          front: 1, shell: 1, spine,
          wall: t > A4.rise - 0.05 ? wallShut(t) : undefined,
        }} />
      <RouteLine t={t} />
      <FeederFlare t={t} />
      <Seal t={t} />
      <Leftover t={t} />
      {/* what was handed over, going back up the way it came */}
      {[0, 1, 2, 3].map((i) => {
        const p = handAt(i, t);
        if (!p) return null;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})
               scale(${lerp(1.15, 0.72, p.u) * p.sx} ${lerp(1.15, 0.72, p.u)})`}>
            <Light cx={0} cy={0} r={104} color={p.kind === 'card' ? '#63A6F5' : CAP_COL.sms} k={0.4} />
            {p.kind === 'card' ? <CardToken /> : <Envelope s={2.0} />}
          </g>
        );
      })}
      {/* THE DELIVERY THAT DOES NOT GET IN */}
      {(() => {
        const d = courierAt(t);
        if (!d) return null;
        const hit = band(t, A4.apk1 - 0.06, A4.apk1 + 0.04, A4.apk1 + 0.20, A4.apk1 + 0.80);
        return (
          <g opacity={d.k}>
            {hit > 0.01 && (
              <g opacity={hit}>
                <path d={`M${F.door.x0} ${F.wallTop} Q690 ${F.wallTop - 118} ${F.door.x1} ${F.wallTop}`}
                  fill="none" stroke={Q.field} strokeWidth={9} strokeLinecap="round" />
                <Light cx={690} cy={F.wallTop - 26} r={340} color={Q.field} k={0.6} />
              </g>
            )}
            <g transform={`scale(${d.turn > 0.5 ? -1 : 1} 1) translate(${d.turn > 0.5 ? -2 * d.x : 0} 0)`}>
              <Drone x={d.x} y={d.y} s={0.68} tilt={d.tilt} t={t} line={96} swing={d.tilt * 0.5}
                carry parcel={<Box3 s={0.62} />} led={0.5} />
            </g>
          </g>
        );
      })()}
      {/* ── AND THE PLACE TO GO INSTEAD, which has been standing out here the whole film */}
      <Civic t={t}
        left={clamp01((t - A4.left) / 0.92)}
        right={clamp01((t - A4.right) / 0.92)}
        spill={clamp01((t - A4.open) / 1.0)}
        /* the lens over the sill goes to the portal's colour while it is working, and comes back
           off it when it has answered — the source of the light in the last shot of the film */
        read={Math.sin(clamp01((t - (A4.scan - 0.22)) / 1.30) * Math.PI)} />
      {/* ── AND WHAT IT SENDS. The dish does not merely flare on "carry out an attack": the card and
            the message go out ON the beam, and they leave the frame, because this is the last we
            see of them and the film does not follow them again. */}
      {(() => {
        const out = clamp01((t - (A4.fire + 0.12)) / 1.25);
        if (out <= 0.001 || out >= 1) return null;
        const a = uplinkAt(0);
        const send = (k: 'card' | 'code', off: number) => {
          const u = ease.in(clamp01((out - off) / (1 - off)));
          if (u <= 0.001) return null;
          const D = 470 * u;
          const x = a.x + UPLINK.dir.x * D, y = a.y + UPLINK.dir.y * D;
          return (
            <g key={k} transform={`translate(${x} ${y}) scale(${lerp(1.05, 0.5, u)})`}
              opacity={1 - clamp01((u - 0.7) / 0.3)}>
              <Light cx={0} cy={0} r={150} color={C.red} k={0.7} />
              {k === 'card' ? <CardToken /> : <CodeToken code={0} />}
            </g>
          );
        };
        return (
          <g>
            {/* the radiation it rides out on */}
            <path d={`M${a.x} ${a.y} L${a.x + UPLINK.dir.x * 620} ${a.y + UPLINK.dir.y * 620}`}
              stroke={C.red} strokeWidth={13} strokeLinecap="round"
              opacity={0.30 * Math.sin(out * Math.PI)} />
            {send('card', 0)}
            {send('code', 0.16)}
          </g>
        );
      })()}
      {/* ── WHAT THE COUNTER DOES WITH IT. This is the sentence the whole film exists to give, so
            it is staged as three plain mechanical facts and nothing else:
              1. THE PAPER IS LAID ON THE SILL, under the reader's lens, framed by lit window on
                 all four sides — so it is unmistakably AT a counter, being dealt with.
              2. THE COUNTER READS IT. The lens goes over to the portal's own colour, its light
                 falls on the paper as a wedge you can see, and the edge of that light travels down
                 the document: at every instant you can see how much of it has been read.
              3. THE PORTAL ANSWERS, out of the slot in the face of the sill, PRINTING AS IT FEEDS
                 — the way every counter in the country answers anything: with a slip.

            AND THE ANSWER IS "NO RECORD", which is a correction. The earlier cut printed a green
            tick, and that is the one reading this film cannot afford: a viewer with the sound off
            watches a scam notice carried to the official portal and TICKED. What verifying this
            message actually returns is that no such challan exists — which is the entire reason
            for telling anyone to verify. The slip quotes the notice's OWN number so the answer is
            visibly about this document and not about the counter, and the document's official blue
            then goes out of its head, because it never was one. */}
      {t >= A4.arrive - 0.02 && (() => {
        const sc = clamp01((t - A4.scan) / 0.85);
        const ans = clamp01((t - A4.answer) / 0.62);
        const cx = COUNTER_Q.x, cy = COUNTER_Q.y;
        const x0 = cx - DOC_QW / 2, y0 = cy - DOC_QH / 2, y1 = cy + DOC_QH / 2;
        const yBar = lerp(y0, y1, sc);
        const dead = clamp01((t - (A4.answer + 0.34)) / 0.42);
        const cl = gid('a4read');
        return (
          <g>
            <defs>
              <clipPath id={cl}>
                <rect x={x0} y={y0} width={DOC_QW} height={DOC_QH} rx={4} />
              </clipPath>
            </defs>
            <ChallanDoc x={x0} y={y0} w={DOC_QW} />
            {/* the official blue goes out of its head once the register has answered */}
            {dead > 0.002 && (
              <rect x={x0} y={y0} width={DOC_QW} height={DOC_QH * 0.262} rx={4}
                fill="#818899" opacity={0.86 * dead} />
            )}
            {/* THE READ — sourced at the lens, and progressive across the thing being read */}
            {sc > 0.001 && sc < 1 && (
              <g opacity={1 - clamp01((sc - 0.86) / 0.14)}>
                <path d={`M${cx - 58} ${BAY.lamp} L${cx + 58} ${BAY.lamp}
                          L${x0 + DOC_QW + 5} ${y1} L${x0 - 5} ${y1} Z`}
                  fill={Q.field} opacity={0.24 * clamp01(sc / 0.10)} />
                <g clipPath={`url(#${cl})`}>
                  <rect x={x0} y={y0} width={DOC_QW} height={Math.max(0, yBar - y0)}
                    fill={Q.field} opacity={0.30} />
                </g>
                <rect x={x0 - 7} y={yBar - 3} width={DOC_QW + 14} height={6} rx={3} fill={Q.field} />
                <rect x={x0 - 7} y={yBar - 1.1} width={DOC_QW + 14} height={2.2} rx={1.1}
                  fill="#FFFFFF" opacity={0.9} />
                <Light cx={cx} cy={yBar} r={88} color={Q.field} k={0.5} />
              </g>
            )}
            {/* THE ANSWER, fed out of the slot and printed as it comes out of it */}
            {ans > 0.001 && (() => {
              const e = ease.out(ans), W2 = COUNTER.slipW, H2 = COUNTER.slipH, TOP2 = 4;
              const out = e * (H2 + 2);
              const cp = gid('a4slip');
              /* and it is RELEASED: one damped swing on the slot it is hanging from, which is what
                 a strip of paper does the instant a printer lets go of it */
              const s2 = clamp01((t - (A4.answer + 0.58)) / 0.40);
              const rot = s2 > 0 && s2 < 1 ? Math.sin(s2 * Math.PI * 2.2) * 1.9 * (1 - s2) : 0;
              return (
                <g transform={`translate(${SLIP_Q.x} ${SLIP_Q.y}) rotate(${rot} 0 ${TOP2})`}>
                  <defs>
                    <clipPath id={cp}>
                      <rect x={-W2 / 2 - 6} y={TOP2} width={W2 + 12} height={out} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#${cp})`}>
                    <rect x={-W2 / 2 + 3} y={TOP2 + 5} width={W2} height={H2} rx={3}
                      fill="#000000" opacity={0.34} />
                    <rect x={-W2 / 2} y={TOP2} width={W2} height={H2} rx={3} fill="#F7F8FB" />
                    {/* THE NUMBER IT WAS ASKED ABOUT, and then the answer. The camera does not come
                        in for this any more — the closing shot holds both counters — so the slip is
                        223 px on the glass and not 322, and every element on it is sized for that:
                        the small grey caption is gone, the number is set large, and the verdict is
                        WHITE ON SOLID RED rather than red on pink, because at this size contrast is
                        what carries a word, not colour. */}
                    <text x={0} y={TOP2 + 26} textAnchor="middle" fontSize={22} fontWeight={700}
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fill="#1E2533">
                      {NOTICE_NO}
                    </text>
                    <rect x={-W2 / 2 + 7} y={TOP2 + 34} width={W2 - 14} height={27} rx={3}
                      fill={C.red} />
                    <text x={0} y={TOP2 + 54} textAnchor="middle" fontSize={21} fontWeight={800}
                      fontFamily="Inter, system-ui, sans-serif" letterSpacing={-0.2} fill="#FFFFFF">
                      NO RECORD
                    </text>
                  </g>
                </g>
              );
            })()}
          </g>
        );
      })()}
    </g>
  );
};

/* ── ASSEMBLY ──────────────────────────────────────────────────────────────────────────────*/
export const Act4: React.FC<{ t: number }> = ({ t }) => {
  const fc = focus4(t);
  /* THE PHONE IS A FOREGROUND OBJECT, not part of the city — so it is drawn OUTSIDE the camera,
     at frame scale, over a world that is dimmed behind it. Act 1 composites exactly this way. */
  const rise = liftAt(t);
  const m = msgAt(t);
  return (
    <g>
      <g transform={`translate(540 960) scale(${fc.z}) translate(${-fc.x} ${-fc.y})`}>
        <Inside4 t={t} />
      </g>
      {/* THE CITY GOES QUIET BEHIND IT. The veil was 0.28, which left the street reading almost as
          strongly as the glass in front of it, and the eye had to choose. It is 0.40 now, and the
          phone carries its own soft light (in `Held`) — between them the frame states which of the
          two things in it is being spoken about, without taking the street away. */}
      {rise > 0.002 && (
        <rect x={0} y={0} width={W} height={H} fill="#05040F" opacity={0.40 * clamp01(rise)} />
      )}
      <Held e={rise}>
        <AdviceScreen deny={clamp01((t - A4.deny) / 2.40)}
          lift={clamp01((t - A4.notice) / 0.5) * (1 - clamp01((t - A4.away) / 0.25))}
          gone={t >= A4.away ? 1 : 0} />
      </Held>
      {/* AND THE ONE OBJECT THAT CROSSES OUT OF IT, which is the notice itself */}
      {m && (() => {
        const h = CHALLAN_H * (m.w / 422);
        return (
          <g transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`}>
            {/* it detaches: a shadow opens under it as it comes off the glass */}
            <rect x={-m.w / 2 + 8} y={-h / 2 + 10} width={m.w} height={h} rx={10} fill="#000000"
              opacity={0.34 * m.off * (1 - clamp01((m.u - 0.5) / 0.5))} />
            <Light cx={0} cy={0} r={m.w * 0.8} color={C.sky} k={0.18} />
            <ChallanDoc x={-m.w / 2} y={-h / 2} w={m.w} />
          </g>
        );
      })()}
    </g>
  );
};

export const _a4 = { win };

/* the act's clock, for tools/echallan/score-opening.mjs — one number, two consumers */
export const CUES4 = { A4, SEAL0, SEAL1, LIFT_RISE };
