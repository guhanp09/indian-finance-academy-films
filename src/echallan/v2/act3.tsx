/* ACT 3 — "You think you've settled your challan…" … "…unauthorised transactions."
 *
 * TWO SENTENCES, ONE ARGUMENT: everything you watched was true, and only its PURPOSE was hidden.
 *
 * So this act introduces no villain and builds no new machine. It re-reads what is already
 * standing, and it proves the re-reading physically:
 *
 *   THE REVEAL. A dropper is a container, so the way to prove one is to OPEN it. We go in through
 *   the portal the viewer has been looking at for thirty seconds — the lit lobby with the door
 *   ajar — and there is no lobby. One volume, plinth to roof. The two storeys of lit windows this
 *   building shows the street are four bare bulbs aimed at four holes cut in a facade ONE PANEL
 *   THICK, propped from behind like a set flat. The only real things in the room are the service
 *   shaft and the app's own courier, parked on a cradle, on charge: the delivery vehicle is
 *   garaged inside the thing it delivered. Then the camera rises the full height of the empty
 *   shell, out through the shaft, and onto the roof — where, on "malware.", the antenna, the
 *   hoist, the line tap, the eye and the satellite pulse ONCE, together, as one body.
 *
 *   THE THEFT. The feeders reverse. Through the permissions every bead ran head -> machine: the
 *   antenna handing a capability out. Now they run the other way, and nothing had to be added to
 *   say it. The card details are handed over — they were typed into the app's own form — and the
 *   OTP is taken, by a duplicate that peels out of the breach the SMS grant left open while the
 *   original never moves, with no hand anywhere in the frame. Both leave on the dish's beam, and
 *   the camera flies the beam to the far end of it.
 *
 * NOTHING IS PLACED AT A WALL-CLOCK TIME. Every beat below is an offset from a MEASURED word.
 */
import React from 'react';
import {
  C, LAYOUT, SCREEN, STATUS_H, W, band, breathe, clamp01, ease, lerp, mix, win,
} from '../design';
import { B, W as WORD } from '../timeline';
import { City } from './city';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { EchallanApp, PaymentForm, PaymentSuccess, UpdateCard } from '../world/screens';
import {
  A, CAP_T, EYE, FEED_DROP, FEED_FROM, FEED_TO, Inside2, K, LC, MAST, MNT, OFFICE_S, TIP, TOP,
  Undercurrent, pov2,
} from './act2';
import type { Cap } from './act2';
import { CAP_COL, CAP_ORDER, PLOT3, F } from './fortress';
import { Envelope, GrantKey, feederPoint, gaze } from './organs';
import {
  CardToken, CodeToken, DECK_N, PaneEdge, RX_RAIL, STATION, Station, Tally, UPLINK, deckPane,
  uplinkAt,
} from './shell';
import { Light } from './style';
import { makeTrack, register } from './track';
import type { FK } from './track';

/* ── THE CLOCK ─────────────────────────────────────────────────────────────────────────────*/
/* B(i) is BEATS[i] and BEATS is ZERO-INDEXED — B(111) is the 112th block. The clock below was
   first written against the one-indexed labels the block dump prints and every anchor came out
   one block late, which put the reveal's carrier ahead of the reveal itself. The comment on each
   line names the WORD, which is the thing that cannot silently drift. */
export const A3 = {
  in: B(111),                  // 66.755  "You"                 the act inherits the settled tick
  ringGo: B(115) + 0.10,       // 69.265  "but"                 the confirmation ring releases
  dive: B(116) + 0.02,         // 69.380  "in reality,"         and opens into the city
  push: B(118) + 0.10,         // 70.760  "first app"           one small push: the office is named
  unlock: B(119) + 0.10,       // 71.360  "was"                 the front's latches let go
  sink: B(121),                // 71.740  "dropper, and"        and it goes down into the plinth
  /* ON THE WORD AFTER THE COMMA, not a fixed offset from the block. The front takes its own time
     to sink and the camera must be still for all of it; a recorded read that says "was a dropper,
     and" in 0.36 s left the whole descent 0.62 s of window. There is a designed hold on that comma
     now, so anchoring here to "and" means the hollow is reached when the sentence resumes, however
     fast the sentence is spoken. */
  hollow: WORD(121, 'and'),    // 67.930                        it is down, and there is nothing in it
  /* +0.16: the crane may not start until the empty shell has been LOOKED AT, and the gate's floor
     for that is 0.80 s. The read says "…a dropper, (pause) and the subsequent update" with only
     0.20 s between "and" and "subsequent", so the beat has to take the difference from the crane,
     which has 2.0 s of its own and can spare it. */
  climb0: B(123) + 0.16,       // 72.740  "subsequent “update”" the camera cranes up the open building
  /* anchored to "had actually installed" and not to the word after it: the recorded read makes
     B(125) a single unstressed "a" 0.24 s before "malware.", which left the crane 0.08 s to
     cover its last 124 units and then stop dead on the apparatus. */
  climb1: B(124) + 0.55,       // 69.790  "had actually…"       arriving at the roof
  body: B(126) + 0.16,         // 75.400  "malware."            the apparatus pulses once, as one
  /* B(127) sits at the end of the 0.95 s designed hold after "malware." — the reveal's landing.
     The hold is why the wide is allowed to be a wide; see tools/echallan/narration.mjs. */
  carrier: B(127) - 0.22,      // 76.769                        the head sends one carrier up
  deck: B(128),                // 77.329  "financial details"   THE DECK: the app's four screens
  /* ON THE WORD "details", not a second and a half after it. The confirmation screen is what the
     viewer was left holding, so the shot may OPEN on it — but the sentence is about the details
     you typed, and the deck used to sit on "Payment successful" through "financial details you
     enter into those" before turning over. It turns over on the word itself. */
  fan: WORD(128, 'details'),      // 78.060  "details"             it spreads; the top card deals off
  lift: B(134) + 0.06,         // 81.240  "can"                 three tokens leave the fields
  fall0: B(135) + 0.10,        // 81.640  "be stolen"           drawn down through the glass
  fall1: B(137) + 0.32,        // 82.780  "the malware,"        into the machine's head
  hoist: B(139) + 0.10,        // 83.980  "because you’ve"      the hoist, already running
  post: B(143),                // 85.920  "to"                  the post office, breach still open
  otp0: B(144) + 0.42,         // 86.640  "your SMS,"           an ordinary envelope comes in
  otp1: B(145) - 0.02,         // 87.592                        it drops into the slot
  split: B(146) + 0.30,        // 88.240  "incoming OTPs"       a DUPLICATE peels; the original stays
  run0: B(147) + 0.10,         // 89.380  "can"                 the copy starts for the app
  run1: B(148) + 0.92,         // 90.520  "be automatically"    up the hoist — no hand anywhere
  up0: B(150),                 // 91.260  "to"                  onto the feeder, running backwards
  up1: B(151) + 0.10,          // 91.520  "the attacker’s"      out to the dish
  beam: B(152) - 0.10,         // 92.080  "server"              and away
  fly0: B(152) + 0.20,         // 92.380                        the camera follows the beam out
  fly1: B(153) + 0.50,         // 86.383                        and arrives
  /* ON THE WORD "credentials", not on "both your bank" before it. The recorded read says that
     phrase in 0.38 s where the placeholder took 1.0 s, which ran the docking into the arrival of
     the flight that carries it — and the word it belongs on was always the noun. */
  dock0: WORD(156, 'credentials'), // 87.000 "credentials"        the credentials dock, card slot
  dock1: B(158) + 0.20,        // 95.480  "the verification"    the code docks, letter slot
  forge: B(160),               // 96.620  "needed to"           the two are made into one key
  turn: B(161) + 0.12,         // 97.360  "carry"               it is turned
  accept: B(162) + 0.30,       // 97.860  "out unauthorised"    the console accepts
  back: B(163) + 0.10,         // 98.800  "transactions."       a line runs back toward the city
  end: B(164) - 0.05,          // 99.982                        held, for the recap to grow out of
} as const;
export const ACT3_END = A3.end;

/* every beat must run forwards, or an edit upstream has quietly reordered the act */
(() => {
  /* EVERY collision, not the first — a re-measured read moves the whole clock at once */
  const ks = Object.entries(A3);
  const bad = ks.map(([k, v], i) => (i && (v as number) < (ks[i - 1][1] as number) - 1e-6
    ? `A3.${k} (${(v as number).toFixed(3)}) runs before A3.${ks[i - 1][0]} `
      + `(${(ks[i - 1][1] as number).toFixed(3)}) by ${((ks[i - 1][1] as number) - (v as number)).toFixed(3)}s`
    : null)).filter(Boolean);
  if (bad.length) throw new Error(`act 3's clock runs backwards:\n    ${bad.join('\n    ')}`);
})();

/* ── THE TWO SPACES, exactly as act 2 joins them ───────────────────────────────────────────
   dz 0 = the phone in the frame; dz 1 = inside, where q maps 1:1 to the frame. The act crosses
   three times and every crossing is the same iris this film has used since the first dive: it
   OPENS to go in and CLOSES to come out, always centred on the thing that causes it. */
const Z_IN = 1 / K;
export function dz3(t: number) {
  const inA = win(t, A3.dive, A3.dive + 1.05);
  const out = win(t, A3.carrier, A3.carrier + 0.80);
  const inB = win(t, A3.fall0 - 0.14, A3.fall0 + 0.66);
  return ease.inOut(clamp01(inA - out + inB));
}
export function pov3(t: number) {
  const dz = dz3(t);
  return { s: Math.exp(lerp(0, Math.log(Z_IN), dz)), cx: LC.x, cy: LC.y + (960 - LC.y) * dz, dz };
}
const povT3 = (t: number) => {
  const p = pov3(t);
  return `translate(${p.cx} ${p.cy}) scale(${p.s}) translate(${-LC.x} ${-LC.y})`;
};
/** a q point, in the phone screen's own coordinates — the frame both irises are measured in */
export const qToScreen = (x: number, y: number) =>
  ({ x: SCREEN.x + K * x, y: LC.y - 960 * K + K * y });

/* the three crossings, and where each one is centred */
const TICK = { x: SCREEN.x + SCREEN.w / 2, y: TOP + 190 };
/* the confirmation disc's own radius — world/screens.tsx draws it at 62 */
const TICK_R = 62;
const MASTQ = qToScreen(TIP.x, TIP.y);
const FORMQ = { x: SCREEN.x + 26 + 160, y: TOP + 174 };

/* ── THE CAMERA ────────────────────────────────────────────────────────────────────────────
   Phone keys are in the frame; city keys are in q, which is the same thing once we are inside.
   The discipline from round 7 holds: two held positions and one move per beat, and the move
   tracks the object rather than cutting to where it is going. */
const FOCUS3: FK[] = [
  /* FOCUS2's last key, repeated. Act 2 hands the frame over at A.end and its camera is at
     (540, 900); starting this table at (540, 960) moved the picture 60 units on the frame the
     acts changed hands, which is a cut with no cause. */
  [A.end, 540, 900, 1.00],
  [A3.in, 540, 942, 1.00],
  [A3.ringGo, 540, 906, 1.06],            // "but"            one small push onto the tick
  [A3.dive + 0.06, 540, 960, 1.00],       //                  the dive takes over
  /* ── in q from here ────────────────────────────────────────────────────────────────────*/
  [A3.push - 0.60, 690, 858, 1.02],       // "the"            the office, whole, at rest
  [A3.push + 0.02, 690, 858, 1.02],       // "first app"      HELD — this is the thing about to open
  /* THE CAMERA NEVER CROSSES THE THRESHOLD. It used to push through the portal, and it did not
     read: the doorway grew past the frame while the room behind it stayed the size it was, so it
     played as a jump to somewhere else, and what you arrived in had nothing in it that said which
     building it belonged to. The building opens instead, and the camera stays in the street.
     BUT IT HAS TO GET CLOSE. At z 1.24 the room behind the front was 37% of the frame's width and
     everything in it was two pixels wide — the reveal's whole argument, drawn at the size of a
     detail. This push takes the building to 70% of the width, which is as tight as it can go and
     still keep the pediment and the medallion in shot, so you never lose which building opened.
     It runs on "first app" and SETTLES BEFORE THE LATCHES LET GO: the camera is at rest for the
     whole of the mechanism, which is the rule the first cut of this beat broke. */
  [A3.unlock - 0.04, 690, 906, 1.86],     // "was"            the front becomes the subject
  [A3.climb0 + 0.56, 690, 906, 1.86],     //                  HELD through the sink AND after it
  [A3.climb1, 690, 468, 1.30],            // "the actual"     and then one crane, up the open building
  /* NOT A WIDE. Act 2 already ends on the city at z 0.82 — "four breaches, four machines, an eye
     over the whole skyline" — and the first cut of this beat repeated that framing almost exactly,
     so the biggest image in the film arrived looking like one the viewer had already been given.
     It goes the other way instead: close enough that the antenna, the hoist, the line tap, the
     satellite and the four feeders between them fill the frame as ONE object. */
  /* it ARRIVES BEFORE the shot it is the subject of. At body-0.12 the crane was still settling
     inside the window act3.mjs measures the apparatus over, which counts as a move in it. */
  [A3.body - 0.42, 700, 344, 1.30],       // "malware."       the apparatus, as one body
  /* held until the move to the deck needs to start — the read says "malware. The financial
     details" with 0.10 s between "The" and "financial", and hanging this on A3.carrier left
     0.16 s to cross 571 units. */
  [A3.deck - 0.60, 700, 344, 1.30],       //                  HELD through the designed hold
  /* ── back out to the phone ─────────────────────────────────────────────────────────────*/
  [A3.deck - 0.16, 540, 892, 1.30],       // "financial…"     the deck
  [A3.fan + 0.42, 540, 872, 1.12],        // "fake payment"   all four of them
  [A3.lift - 0.24, 540, 706, 1.38],       // "can"            the fields, where they were typed
  /* the tilt keeps going the way it was going. Widening back DOWN to 864 here, between a lean
     up onto the fields and a crane up to the head, was a third change of shot inside two
     seconds — the camera following the tokens by changing its mind about them. */
  [A3.fall0 + 0.26, 540, 620, 1.34],      // "be stolen"      and down
  /* ── in q again ────────────────────────────────────────────────────────────────────────*/
  [A3.fall1 + 0.10, 690, 306, 1.28],      // "the malware,"   the head takes them
  [A3.hoist + 0.24, 560, 476, 1.26],      // "because you’ve" the hoist, running, unattended
  [A3.post + 0.16, 140, 566, 1.20],       // "to"             the post office
  [A3.split + 0.34, 140, 566, 1.20],      // "incoming OTPs"  HELD: it lands, the copy peels
  /* it TRAVELS with the copy rather than widening to 0.92 and pushing back in to 1.16 — a 26%
     zoom out and back inside two seconds, which is the camera stepping back to look at a journey
     it is already following. The span reads perfectly well from the move itself. */
  [A3.run0 + 0.46, 372, 546, 1.12],       // "can also"       it runs for the app
  [A3.run1 + 0.24, 556, 470, 1.16],       //                  up the hoist
  [A3.up1 + 0.06, 706, 330, 1.22],        // "the attacker’s" the feeder, backwards, to the head
  [A3.beam + 0.10, 846, 292, 1.28],       // "server"         the dish, and away
  [A3.fly0 + 0.52, 1500, -380, 1.14],     //                  along the ray
  /* +0.26, not +0.10: 1,211 units in 0.48 s peaks at 4,274 u/s where the limit is 4,100 — the
     monotone cubic runs faster in the middle of a leg than its average, so a transit is sized by
     its PEAK. The extra 0.16 s brings it to 3,100 and lets the arrival settle before the console
     beat, at no cost to anything either side of it. */
  [A3.fly1 + 0.26, 2570, -948, 1.30],     //                  arrive
  [A3.dock0 + 0.14, 2470, -700, 1.72],    // "both your"      the console, centred
  [A3.dock1 + 0.46, 2462, -704, 1.78],    // "the verification"
  [A3.forge + 0.14, 2426, -790, 2.00],    // "needed to"      the lock
  [A3.accept + 0.34, 2426, -790, 2.00],   // "out unauthorised" HELD
  [A3.back + 0.34, 2372, -640, 1.00],     // "transactions."  pull back; the line leaves frame
  [A3.end, 2344, -616, 0.95],
];
const track3 = makeTrack(register('act3', FOCUS3));
/* the breath, on the same terms as act 2: a held camera is not a locked one */
const BREATH_A = 11;
const breath = (t: number) => ({
  x: breathe(t, 5, 0.29) * BREATH_A,
  y: breathe(t, 23, 0.25) * BREATH_A * 0.62,
  z: breathe(t, 43, 0.21) * 0.0045,
});
export function focus3(t: number) {
  const p = track3(t);
  /* on inside the city and at the station; off on the phone, where a drifting frame is a wobble */
  const k = Math.max(band(t, A3.dive, A3.dive + 1.5, A3.carrier - 0.6, A3.carrier + 0.2),
    band(t, A3.fall0, A3.fall0 + 1.0, A3.end + 1, A3.end + 2));
  const br = breath(t);
  return { x: p.x + br.x * k, y: p.y + br.y * k, z: p.z + br.z * k };
}

/* ── WHAT IS TAKEN, AND THE WAY IT GOES ────────────────────────────────────────────────────
   The credentials are HANDED OVER: they were typed into the app's own form, so they come down
   out of the glass on their own, drawn by the machine that drew the form. The code is TAKEN: it
   arrives at the post office addressed to the victim, and a copy of it is lifted out through the
   breach the SMS grant left open while the original goes on into the building.

   Two different journeys because they are two different crimes, and the film has to be able to
   say so without a word of commentary. */

/** the three fields, in q — where the tokens start is where the victim typed them */
const FIELD_Q = ([[160, 174], [96, 290], [150, 406]] as const).map(([dx, dy]) => {
  const sx = SCREEN.x + 26 + dx, sy = TOP + dy;
  return { x: (sx - SCREEN.x) / K, y: (sy - (LC.y - 960 * K)) / K };
});
const HEAD_Q = { x: TIP.x + 4, y: TIP.y + 44 };
/** a card token's journey: out of its field, down through the glass, into the machine's head */
export function tokenAt(i: number, t: number) {
  const t0 = A3.lift + i * 0.10, t1 = A3.fall0 + 0.16 + i * 0.12, t2 = A3.fall1 + i * 0.13;
  if (t < t0 - 0.001) return null;
  const f = FIELD_Q[i];
  if (t < t1) {
    /* it rises out of the field first — a thing being taken leaves the slot it was in */
    const u = ease.out(clamp01((t - t0) / (t1 - t0)));
    return { x: f.x, y: f.y - u * 58, s: lerp(Z_IN * 2.5, Z_IN * 2.3, u), k: 1, rot: u * 4 };
  }
  if (t > t2 + 0.42) return null;
  /* and then it is DRAWN down, accelerating the whole way: it is not falling, it is being pulled */
  const u = clamp01((t - t1) / (t2 - t1));
  const e = ease.in(u);
  const arrive = clamp01((t - t2) / 0.42);
  return {
    x: lerp(f.x, HEAD_Q.x, e), y: lerp(f.y - 54, HEAD_Q.y, e),
    s: lerp(Z_IN * 2.3, 1, e) * (1 - arrive * 0.55),
    k: 1 - ease.in(arrive), rot: 4 + e * 16,
  };
}

/* the OTP: the post office's slot, the breach the SMS grant opened, and the hoist's boot */
/* the sorting hall's own posting slot, under its canopy (fortress: Building, kind 'mail') — this
   is the thing "access your SMS" opened, so it is where the victim's message lands. */
const SLOT_Q = { x: 46, y: 588 };
const BREACH_Q = { x: 46, y: 672 };   // the hatch the SMS grant opened, 84 units under the slot
const BOOT_Q = { x: MNT.sms.x, y: MNT.sms.y - 14 };
const qbez = (a: { x: number; y: number }, c: { x: number; y: number },
  b: { x: number; y: number }, e: number) => {
  const m = 1 - e;
  return { x: m * m * a.x + 2 * m * e * c.x + e * e * b.x,
    y: m * m * a.y + 2 * m * e * c.y + e * e * b.y };
};
/** the message that is really the victim's: in over the skyline, into the slot, and then in. */
export function otpAt(t: number) {
  if (t < A3.otp0 - 0.001 || t > A3.split + 0.62) return null;
  if (t <= A3.otp1) {
    const u = ease.inOut(clamp01((t - A3.otp0) / (A3.otp1 - A3.otp0)));
    /* IN OVER THE SKYLINE, from off the left edge, on an arc that stays clear of the frame's top
       band. It started at x -460 once, where the camera never saw it until the last two frames of
       its flight; then it came in high, and the caption for this sentence moved to the top edge —
       so a message the sentence is about was crossing the words describing it. It comes in at
       roof height now, flies over the city's own rooftops, and drops into the slot. */
    const p = qbez({ x: -292, y: 286 }, { x: -60, y: 420 }, SLOT_Q, u);
    return { x: p.x, y: p.y, s: lerp(0.74, 1, u), rot: lerp(-18, 0, u), k: 1 };
  }
  /* it goes on into the building, exactly as it should: the victim still gets their message */
  const u = clamp01((t - A3.otp1) / 0.62);
  return { x: SLOT_Q.x, y: lerp(SLOT_Q.y, SLOT_Q.y + 108, ease.in(u)), s: 1, rot: 0,
    k: 1 - clamp01((u - 0.5) / 0.5) };
}
/** and the copy of it that nobody asked for.
 *
 *  IT COMES OUT OF THE BREACH, EDGE ON. The first cut started it at the posting slot 26 units
 *  above and slid it down to the hatch, which put it in mid-air at the exact moment the original
 *  had finished fading — so the duplicate appeared out of nothing beside a slot it never came
 *  through. It leaves the way a letter leaves any slot instead: it is inside the hatch, and it
 *  emerges edge-first, widening from nothing to its full width as it clears the opening. The
 *  cause is the hatch the SMS grant cut in this building, which is still standing open. */
export function copyAt(t: number) {
  if (t < A3.split - 0.001 || t > A3.up1 + 0.12) return null;
  const peel = clamp01((t - A3.split) / 0.52);
  if (t < A3.run0) {
    const e = ease.out(peel);
    return { x: BREACH_Q.x + 8 + e * 54, y: BREACH_Q.y, s: 1, sx: e,
      rot: lerp(0, -8, peel), k: 1 };
  }
  if (t <= A3.run1) {
    const u = ease.inOut(clamp01((t - A3.run0) / (A3.run1 - A3.run0)));
    const p = qbez({ x: BREACH_Q.x + 46, y: BREACH_Q.y }, { x: 300, y: 300 }, BOOT_Q, u);
    const n = qbez({ x: BREACH_Q.x + 46, y: BREACH_Q.y }, { x: 300, y: 300 }, BOOT_Q,
      Math.min(1, u + 0.03));
    return { x: p.x, y: p.y, s: 1, sx: 1,
      rot: (Math.atan2(n.y - p.y, n.x - p.x) * 180) / Math.PI * 0.35, k: 1 };
  }
  if (t <= A3.up0) {
    /* up the hoist's own tower, which has been doing this since the grant */
    const u = ease.inOut(clamp01((t - A3.run1) / (A3.up0 - A3.run1)));
    return { x: BOOT_Q.x, y: lerp(BOOT_Q.y, MNT.sms.y - 182, u), s: 1, sx: 1, rot: 0, k: 1 };
  }
  /* and onto the feeder, running the wrong way up it */
  const u = ease.inOut(clamp01((t - A3.up0) / (A3.up1 - A3.up0)));
  const p = feederPoint(FEED_FROM.sms, FEED_TO.sms, FEED_DROP.sms, 1 - u);
  return { x: p.x, y: p.y, s: lerp(1, 0.6, u), sx: 1, rot: 0,
    k: 1 - clamp01((u - 0.82) / 0.18) };
}

/* what leaves on the beam, and when. Both halves travel the SAME ray and stay distinct.
 *
 * AND THEY COME DOWN THE MAST. The ray ends at the receiving bowl, nine hundred units above the
 * console, and the first cut of this simply faded a card into the slot while the travelling one
 * was still up at the dish — the only object in the act that crosses two worlds teleported its
 * last leg. It follows the waveguide instead: the pipe RxDish already draws down the lattice and
 * in to the hall is the only route anything that dish hears can take.
 *
 * ONE eased progress runs the whole polyline, never one per leg: easing each leg separately brings
 * the object to a dead stop at every corner, which reads as a series of landings rather than as a
 * journey (rule: eased legs make false stops). */
const OUT0 = A3.beam + 0.12, OUT1 = A3.dock0 + 0.10;
const OUT2 = A3.beam + 0.30, OUT3 = A3.dock1 + 0.10;
const RX_DOWN = { x: STATION.mast.x + 30, y: STATION.ground - STATION.hall.h - 106 };
const RX_TURN = { x: RX_RAIL, y: RX_DOWN.y };
const walk = (pts: { x: number; y: number }[], u: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(u) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const f = seg[i] > 1e-6 ? clamp01(d / seg[i]) : 1;
      return { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f) };
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
/** the whole journey of one stolen half: out of the app's feed, up the ray, down the receiving
 *  mast's waveguide, across to the hall and into its own slot. */
export const outPath = (kind: 'card' | 'code') => {
  const slot = kind === 'card' ? STATION.slotA : STATION.slotB;
  return [uplinkAt(0), uplinkAt(1), RX_DOWN, RX_TURN, { x: RX_RAIL, y: slot.y }, slot];
};
/** how much of a journey is the ray itself, so the two halves can be timed separately */
const rayFrac = (kind: 'card' | 'code') => {
  const p = outPath(kind);
  const seg = p.slice(1).map((q, i) => Math.hypot(q.x - p[i].x, q.y - p[i].y));
  return seg[0] / seg.reduce((a, b) => a + b, 0);
};
/* THE CODE IS CAUGHT, and you see it happen. Both halves used to be one eased sweep from the app's
   feed to the slot, and because the code leaves a third of a second later it was still out on the
   ray when the camera arrived at the compound — so the first the viewer saw of it was an envelope
   halfway down the building, out of nowhere. Its journey is in three parts now, which is what it
   physically is: it crosses on the ray, the receiving bowl CATCHES it and holds it for four tenths
   of a second while the dish answers, and then it is fed down the mast and the console's rail into
   its slot. The card keeps the single sweep: it docks 1.6 s earlier and has no room for a pause. */
export const CATCH = { in: A3.beam + 1.50, out: A3.beam + 1.92 };
export const outAt = (kind: 'card' | 'code', t: number) => {
  const path = outPath(kind);
  if (kind === 'card') {
    if (t < OUT0 || t > OUT1) return null;
    const u = ease.inOut(clamp01((t - OUT0) / (OUT1 - OUT0)));
    return { ...walk(path, u), u, caught: 0 };
  }
  if (t < OUT2 || t > OUT3) return null;
  const R = rayFrac('code');
  if (t <= CATCH.in) {
    const u = ease.inOut(clamp01((t - OUT2) / (CATCH.in - OUT2))) * R;
    return { ...walk(path, u), u, caught: 0 };
  }
  if (t <= CATCH.out) return { ...walk(path, R), u: R, caught: 1 };
  const u = R + ease.inOut(clamp01((t - CATCH.out) / (OUT3 - CATCH.out))) * (1 - R);
  return { ...walk(path, u), u, caught: 0 };
};
export const rayK = (t: number) => clamp01(win(t, A3.beam - 0.08, A3.beam + 0.34)
  - win(t, A3.accept + 0.5, A3.accept + 1.2));

/* ── THE DECK ──────────────────────────────────────────────────────────────────────────────
   The app's screens, as the deck they always were. Four panes, one app, and the confirmation is
   only the top card. */
const DeckPane: React.FC<{ i: number; split: number }> = ({ i, split }) => {
  const p = deckPane(i, split);
  const CX = SCREEN.x + SCREEN.w / 2, CY = SCREEN.y + SCREEN.h / 2;
  const body = i === 0 ? <PaymentSuccess draw={1} settle={1} />
    : i === 1 ? <PaymentForm typed={1} caret={0} />
      : i === 2 ? (
        <g>
          <EchallanApp detail={1} amount={1} cta={1} />
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#0A1020"
            opacity={0.34} />
          <UpdateCard y={SCREEN.y + 470} rim={1} />
        </g>
      ) : <EchallanApp detail={1} amount={1} cta={1} />;
  return (
    <g transform={`translate(${CX} ${CY}) translate(0 ${p.dy}) scale(${p.s})
                   translate(${-CX} ${-CY})`}>
      {split > 0.012 && <PaneEdge x={SCREEN.x} y={SCREEN.y} w={SCREEN.w} h={SCREEN.h} />}
      {body}
      {p.dim > 0.001 && (
        <rect x={SCREEN.x - 5} y={SCREEN.y - 5} width={SCREEN.w + 10} height={SCREEN.h + 10}
          rx={10} fill="#050A1C" opacity={Math.min(0.62, p.dim)} />
      )}
    </g>
  );
};
export const Deck: React.FC<{ t: number }> = ({ t }) => {
  const split = ease.inOut(clamp01(win(t, A3.fan, A3.fan + 1.05)));
  return (
    <g>
      {[3, 2, 1, 0].map((i) => <DeckPane key={i} i={i} split={split} />)}
      {/* the fields empty as their contents leave: the form is visibly hollowed of what it took */}
      {[0, 1, 2].map((i) => {
        const k = clamp01((t - (A3.lift + i * 0.10)) / 0.26);
        if (k <= 0.01) return null;
        const p = deckPane(1, split);
        const CX = SCREEN.x + SCREEN.w / 2, CY = SCREEN.y + SCREEN.h / 2;
        const box = [[26, 138, SCREEN.w - 52], [26, 254, (SCREEN.w - 52) * 0.46],
          [26, 370, SCREEN.w - 52]][i];
        return (
          <g key={i} transform={`translate(${CX} ${CY}) translate(0 ${p.dy}) scale(${p.s})
                                 translate(${-CX} ${-CY})`} opacity={k}>
            <rect x={SCREEN.x + box[0] + 14} y={TOP + box[1] + 14} width={box[2] - 28} height={44}
              rx={5} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

/* ── THE CITY, IN ACT 3 ────────────────────────────────────────────────────────────────────*/
const feedDir = (t: number) => (t > A3.fall1 - 0.6 ? -1 : 1);
const satBeam = (t: number) => win(t, A3.beam - 0.22, A3.beam + 0.18)
  * (1 - win(t, A3.accept + 0.5, A3.accept + 1.1));
/** WHAT THE EYE IS WATCHING. It used to drift on a slow breathe curve, which at this speed is
 *  indistinguishable from a painted backdrop. It watches the act instead: the camera's own centre
 *  is this act's focal point — every key in FOCUS3 is a thing, not a position — so that is the
 *  target, and `gaze` holds on it and flicks to the next rather than tracking it.
 *
 *  Two cases the camera cannot answer, both derived rather than typed:
 *    · while the picture is on the phone there is nothing in the city for it to look at, and what
 *      is ACTIVE in the city is the machine on the roof, so it watches the antenna's head;
 *    · once the camera leaves along the uplink it is a thousand units past the city's edge and the
 *      eye is long off-screen, so it holds on the dish it just watched the theft leave by. */
const gazeTarget = (t: number) => {
  if (dz3(t) < 0.55) return { x: TIP.x, y: TIP.y };
  const c = focus3(t);
  return c.x > 1400 ? { x: MNT.vpn.x, y: MNT.vpn.y } : { x: c.x, y: c.y };
};
export const look3 = (t: number) => gaze(t, gazeTarget, EYE);

/** the one pulse that says the whole apparatus is one animal */
const BodyPulse: React.FC<{ t: number }> = ({ t }) => {
  const k = clamp01((t - A3.body) / 1.05);
  if (k <= 0 || k >= 1) return null;
  const env = Math.sin(k * Math.PI);
  /* WHAT LIT IT. The climb lands here, and the head answers before anything else does — the ring
     is the impact, and the four feeders carry it outward from this point. */
  const hit = Math.sin(Math.min(1, k / 0.22) * Math.PI);
  return (
    <g>
      {hit > 0.01 && (
        <g opacity={hit}>
          <circle cx={TIP.x} cy={TIP.y} r={20 + (1 - hit) * 90} fill="none" stroke="#CFF8FF"
            strokeWidth={7} />
          <Light cx={TIP.x} cy={TIP.y} r={360} color="#8FE8FF" k={0.9} />
        </g>
      )}
      {(CAP_ORDER as readonly Cap[]).map((c) => {
        const d = { sms: 0.10, call: 0.16, bg: 0.30, vpn: 0.22 }[c];
        const u = clamp01((k - d) / 0.34);
        if (u <= 0) return null;
        const p = feederPoint(FEED_FROM[c], FEED_TO[c], FEED_DROP[c], ease.out(u));
        return (
          <g key={c}>
            <Light cx={p.x} cy={p.y} r={110} color={CAP_COL[c]} k={0.8 * Math.sin(u * Math.PI)} />
            <circle cx={p.x} cy={p.y} r={7} fill="#FFFFFF" opacity={0.85 * Math.sin(u * Math.PI)} />
          </g>
        );
      })}
      <Light cx={TIP.x} cy={TIP.y} r={300} color="#FFE2B8" k={0.55 * env} />
      <Light cx={EYE.cx} cy={EYE.cy} r={520} color="#FF7A45" k={0.16 * env} />
    </g>
  );
};

/** the uplink, as one straight line between two bowls, and what travels it */
const Uplink: React.FC<{ t: number }> = ({ t }) => {
  const k = rayK(t);
  if (k <= 0.01) return null;
  const a = uplinkAt(0), b = uplinkAt(1);
  return (
    <g>
      <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke={CAP_COL.vpn} strokeWidth={5}
        opacity={0.20 * k} strokeLinecap="round" />
      <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="#FFD0E6" strokeWidth={1.8}
        opacity={0.28 * k} strokeLinecap="round" />
    </g>
  );
};

/** WHAT IS ON THE RAY, drawn AFTER the station rather than with the ray itself. The last third of
 *  the journey runs down the receiving mast and the console's own feed rail — both of which are IN
 *  FRONT of nothing and BEHIND the hall — so cargo drawn with the beam disappeared behind the
 *  building for the whole arrival, which is the half of the trip that matters. */
const Cargo: React.FC<{ t: number }> = ({ t }) => {
  if (rayK(t) <= 0.01) return null;
  return (
    <g>
      {(['card', 'code'] as const).map((kind) => {
        const p = outAt(kind, t);
        if (!p) return null;
        return (
          <g key={kind}>
            {/* THE CATCH. The bowl does not merely have it arrive: it closes on it, and the ring
                is what tells you the journey ended here and a different one begins. */}
            {p.caught > 0 && (() => {
              const e = clamp01((t - CATCH.in) / (CATCH.out - CATCH.in));
              return (
                <g opacity={1 - e * 0.5}>
                  <circle cx={p.x} cy={p.y} r={26 + ease.out(e) * 66} fill="none"
                    stroke={CAP_COL.vpn} strokeWidth={6 - ease.out(e) * 3} />
                  <Light cx={p.x} cy={p.y} r={300} color={CAP_COL.vpn} k={0.9} />
                </g>
              );
            })()}
            <g transform={`translate(${p.x} ${p.y}) scale(${lerp(0.9, 1.25, p.u)})`}>
              <Light cx={0} cy={0} r={120} color={CAP_COL.vpn} k={0.55} />
              {kind === 'card' ? <CardToken /> : <CodeToken code={0} />}
            </g>
          </g>
        );
      })}
    </g>
  );
};

/* THE LINE THAT USED TO RUN BACK TO THE CITY IS GONE. It read as the compound firing a weapon at
   the city — "useless and misleading" — and it was: the attack had already happened, and nothing
   about this sentence says anything travels back. Act 4 opens on the compound and simply leaves
   it; the tunnel it flies down is the uplink that is already there. */

/** THE UPDATE GOING IN. The service shaft used to carry a bright block on a LOOP — `(t*0.22)%1`,
 *  a sawtooth with no relationship to anything being said — so the one object in this shot that
 *  could show the malware arriving instead rose slowly, vaguely, and repeatedly, and the antenna
 *  lighting a moment later had no visible cause.
 *
 *  It is one climb now. It starts slow and accelerates the whole way (a cubic ease-in over 2.9 s),
 *  it crosses the whole building — up the shaft, out through the roof, up the mast — and it lands
 *  at the antenna's head on the word "malware." The apparatus lights BECAUSE it arrived. The
 *  camera cranes up with it and is settled and waiting at the roof before it gets there, which is
 *  what makes the last four hundred units read as an arrival rather than as motion. */
const LIFT0 = A3.climb0 - 0.20, SHAFT = 0.62;
const lift = (t: number) => Math.pow(clamp01((t - LIFT0) / (A3.body - LIFT0)), 2.6);
/** where the head of it is on the mast, once it is out of the shaft: the roofline to the radiator */
const MAST_FROM = { x: 690, y: 655 }, MAST_TO = { x: TIP.x, y: TIP.y + 6 };
const Lift: React.FC<{ t: number }> = ({ t }) => {
  const u = clamp01((lift(t) - SHAFT) / (1 - SHAFT));
  if (u <= 0.001 || t > A3.body + 0.5) return null;
  const x = lerp(MAST_FROM.x, MAST_TO.x, u), y = lerp(MAST_FROM.y, MAST_TO.y, u);
  const k = 1 - clamp01((t - A3.body) / 0.3);
  return (
    <g opacity={k}>
      <path d={`M${MAST_FROM.x} ${MAST_FROM.y} L${x} ${y}`} stroke="#8FE8FF" strokeWidth={9}
        strokeLinecap="round" opacity={0.28} />
      <rect x={x - 13} y={y - 13} width={26} height={26} rx={6} fill="#CFF8FF" />
      <Light cx={x} cy={y} r={190} color="#8FE8FF" k={0.8} />
    </g>
  );
};

export const Inside3: React.FC<{ t: number }> = ({ t }) => {
  /* the front sinks into its own plinth, the way the boundary wall's panel did in act 1 — and
     what it uncovers is drawn in the office's own footprint, at the office's own scale, in the
     frame it is already in. There is no transition to follow. */
  const front = clamp01((t - A3.sink) / (A3.hollow - A3.sink));
  /* THE ROOM IS UP BEFORE THE FRONT MOVES. The colonnade's capitals sit 33 units below the frieze,
     so between the columns there is a band of what is BEHIND the building — and mounting the shell
     at the same instant the panel starts to travel filled that band in one frame. It comes up
     during the push instead, while the camera is still moving and the band is 3 pixels tall. */
  const shell = clamp01((t - (A3.unlock - 0.52)) / 0.42);
  const city = (
    <Inside2 t={Math.max(t, A.out + 2)}
      a3={{ beam: satBeam(t), feedDir: feedDir(t), look: look3(t),
        latch: clamp01((t - A3.unlock) / 0.42),
        front, shell, spine: clamp01(lift(t) / SHAFT) }} />
  );
  return (
    <g>
      {city}
      <Lift t={t} />
      <BodyPulse t={t} />
      {/* the courier's message, and the copy of it that nobody asked for */}
      {(() => {
        const o = otpAt(t);
        if (!o) return null;
        return (
          <g transform={`translate(${o.x} ${o.y}) rotate(${o.rot}) scale(${o.s})`} opacity={o.k}>
            <Envelope s={2.3} />
          </g>
        );
      })()}
      {/* THE HATCH DOES THE COPYING, so the hatch is what lights. One short flash in the SMS
          grant's own colour at the opening the duplicate comes out of — the cause, before the
          effect, at the place the effect happens. */}
      {(() => {
        const f = band(t, A3.split - 0.10, A3.split + 0.04, A3.split + 0.30, A3.split + 0.72);
        if (f < 0.01) return null;
        return <Light cx={BREACH_Q.x} cy={BREACH_Q.y} r={190} color={CAP_COL.sms} k={0.55 * f} />;
      })()}
      {(() => {
        const c = copyAt(t);
        if (!c) return null;
        return (
          <g transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${c.s * c.sx} ${c.s})`}
            opacity={c.k}>
            <Light cx={0} cy={0} r={82} color={CAP_COL.sms} k={0.42} />
            <Envelope s={2.3} />
          </g>
        );
      })()}
      <Uplink t={t} />
      {/* THE OTHER END. Its own ground, its own night, and never in the same frame as the city. */}
      {t > A3.fly0 - 0.4 && (
        <g>
          <Station t={t} wake={win(t, A3.fly1 - 0.5, A3.fly1 + 0.7)}
            docked={clamp01((t - (A3.dock0 + 0.08)) / 0.1)}
            code={clamp01((t - (A3.dock1 + 0.08)) / 0.1)}
            forge={win(t, A3.forge, A3.forge + 0.55)} turn={ease.inOut(clamp01(win(t, A3.turn, A3.turn + 0.52)))}
            accept={win(t, A3.accept, A3.accept + 0.24)} hot={rayK(t)} />
          <Cargo t={t} />
          {/* the counter is bolted to the console; it does not fade up as we arrive, because it
              was already running before we got here — that is the whole point of it */}
          <Tally x={STATION.tally.x} y={STATION.tally.y} n={4106 + (t > A3.accept + 0.1 ? 1 : 0)}
            k={1} />
          {/* the key, made out of the two halves and nothing else */}
          {(() => {
            const f = win(t, A3.forge - 0.34, A3.forge + 0.18);
            if (f <= 0.01 || t > A3.turn + 0.1) return null;
            const from = [{ x: STATION.slotA.x, y: STATION.slotA.y },
              { x: STATION.slotB.x, y: STATION.slotB.y }];
            const to = { x: STATION.lock.x, y: STATION.lock.y };
            return (
              <g>
                {from.map((p, i) => {
                  const u = ease.inOut(clamp01((f - i * 0.12) / 0.86));
                  return (
                    <g key={i} transform={`translate(${lerp(p.x, to.x, u)} ${lerp(p.y, to.y, u)})
                                           scale(${lerp(0.9, 1.1, u)})`} opacity={1 - u * 0.2}>
                      <GrantKey col={i ? '#FF9AB8' : '#FFD0E6'} s={1.3} />
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};

/* ── THE PHONE'S SCREEN, by time ───────────────────────────────────────────────────────────*/
const Screen3: React.FC<{ t: number }> = ({ t }) => {
  const p = pov3(t);
  /* the three crossings share one iris: it opens on the way in and closes on the way out */
  const cross = (() => {
    /* THE FIRST CROSSING IS THE CONFIRMATION'S OWN RING LETTING GO. The act opens on two and a
       half seconds of a settled tick, and "but in reality" lands on it: the ring around the tick
       lifts off the disc AT THE DISC'S OWN RADIUS and opens outward, and what is behind it is the
       city. The iris is the hole that ring leaves — it does not appear at a point and grow out of
       nothing, which is what it used to do, with a sound cue claiming a release the picture never
       showed. It also carries its own colour across: it leaves as the confirmation's green and
       arrives as the film's field cyan, because that is exactly what the sentence does to it. */
    const a = win(t, A3.ringGo, A3.dive + 0.98);
    const b = win(t, A3.carrier, A3.carrier + 0.78);
    const c = win(t, A3.fall0 - 0.14, A3.fall0 + 0.62);
    if (t < A3.carrier) {
      /* THE WIND-UP. A mechanism that lets go has to be seen HOLDING first, or the release is just
         a thing that starts. Over the half second before the word, the ring tightens four units
         onto the disc and comes up to half strength — far too small to notice on its own, which is
         the point: it is the anticipation that makes the release read as a release. */
      const pre = ease.inOut(clamp01((t - (A3.ringGo - 0.55)) / 0.55));
      const ring = TICK_R - pre * 4 + ease.in(a) * 1780;
      const grown = ring - TICK_R;
      return { r: Math.max(0, ring - 66), c: TICK, edge: 0, ring,
        ringK: Math.max(pre * 0.55, clamp01(1 - grown / 980) * clamp01(grown / 8)),
        ringCol: mix(C.green, '#63E6FF', clamp01(grown / 240)),
        ringW: lerp(7, 4, clamp01(grown / 420)) };
    }
    if (t < A3.fall0 - 0.14) {
      const e = ease.inOut(b);
      /* IT CLOSES TO NOTHING. The +8 that used to be here left an eight-unit pinhole of the city
         sitting on the payment screen for the whole deck section — a dark dot beside "Amount paid"
         that looked like a rendering fault, because it was one. An iris that shuts, shuts. */
      return { r: (1 - e) * 1700,
        c: { x: lerp(MASTQ.x, SCREEN.x + SCREEN.w / 2, e), y: lerp(MASTQ.y, SCREEN.y + SCREEN.h / 2, e) },
        edge: b * (1 - b) * 4, ring: 0, ringK: 0, ringCol: '#63E6FF', ringW: 4 };
    }
    return { r: ease.in(c) * 1900, c: FORMQ, edge: c * (1 - c) * 4, ring: 0, ringK: 0,
      ringCol: '#63E6FF', ringW: 4 };
  })();
  const inside = cross.r > 2;
  const barK = 1 - clamp01(cross.r / 380);
  return (
    <g>
      {p.dz < 0.999 && (
        <g>
          <Deck t={t} />
          <Undercurrent t={t} k={0.42 + 0.22 * win(t, A3.deck - 0.4, A3.deck + 0.8)} />
        </g>
      )}
      {inside && (
        <g clipPath="url(#a3iris)">
          <defs><clipPath id="a3iris"><circle cx={cross.c.x} cy={cross.c.y} r={cross.r} /></clipPath></defs>
          <g transform={`translate(${SCREEN.x} ${LC.y - 960 * K}) scale(${K})`}>
            <Inside3 t={t} />
          </g>
        </g>
      )}
      {/* THE TOKENS ARE NOT INSIDE THE IRIS. They are the one thing that belongs to both sides of
          the glass: they start in a field the victim typed into and end in a machine under it, and
          clipping them would cut the only object that crosses. */}
      <g transform={`translate(${SCREEN.x} ${LC.y - 960 * K}) scale(${K})`}>
        {[0, 1, 2].map((i) => {
          const q = tokenAt(i, t);
          if (!q) return null;
          return (
            <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.rot}) scale(${q.s})`}
              opacity={q.k}>
              <Light cx={0} cy={0} r={96} color="#63A6F5" k={0.34} />
              <CardToken />
            </g>
          );
        })}
      </g>
      {cross.edge > 0.02 && (
        <circle cx={cross.c.x} cy={cross.c.y} r={cross.r} fill="none" stroke="#63E6FF"
          strokeWidth={5} opacity={0.5 * cross.edge} />
      )}
      {/* the released ring itself, always a little ahead of the hole it is opening */}
      {cross.ringK > 0.01 && (
        <g opacity={cross.ringK}>
          <circle cx={cross.c.x} cy={cross.c.y} r={cross.ring} fill="none" stroke={cross.ringCol}
            strokeWidth={cross.ringW} />
          <circle cx={cross.c.x} cy={cross.c.y} r={cross.ring} fill="none" stroke={cross.ringCol}
            strokeWidth={cross.ringW * 3.4} opacity={0.22} />
        </g>
      )}
      {barK > 0.01 && (
        <g opacity={barK}><StatusBar tint="#C3D0E6" label="10:43" /></g>
      )}
    </g>
  );
};

/* ── ASSEMBLY ──────────────────────────────────────────────────────────────────────────────*/
export const Act3: React.FC<{ t: number }> = ({ t }) => {
  const p = pov3(t);
  const fc = focus3(t);
  const inside = p.dz > 0.98;
  return (
    <g transform={`translate(540 960) scale(${fc.z}) translate(${-fc.x} ${-fc.y})`}>
      {/* THE CITY IS STILL THERE. Act 3 drew the phone and nothing else, so for the four seconds
          between the payment and the dive the composition's own ground — a near-black #05040F —
          was the background, and the skyline the previous act had been standing in front of simply
          vanished between two frames. The viewer has not gone anywhere: they are in the same street
          they have been in since the first frame. Same component, same transform as act 2's, so
          the act boundary is not a boundary in the picture at all. */}
      {!inside && (
        <g transform={`translate(540 ${960 + 430}) scale(1.10) translate(-540 -960)`}>
          <City t={t} />
        </g>
      )}
      <g transform={povT3(t)}>
        {p.dz > 0.97 ? (
          <Screen3 t={t} />
        ) : (
          <>
            <PhoneShell screenBase="#E9EEF7"><Screen3 t={t} /></PhoneShell>
            <PhoneFurniture />
          </>
        )}
      </g>
    </g>
  );
};

/* ── THE UPLINK MUST POINT AT THE STATION ──────────────────────────────────────────────────
   The satellite's aim is drawn in fortress.tsx from its own mount; the ray and the site are in
   shell.tsx. Two files, one line — exactly the shape of the bug that put two buildings inside
   each other in round 6 (rule: two layout tables drift). So it is checked here, at module load. */
(() => {
  const corn = F.court + (-46 - 420 - 52) * OFFICE_S;
  const busY = corn - 250, busX = PLOT3.cx + 117 * OFFICE_S;
  const rad = (46 * Math.PI) / 180;
  const feed = { x: busX + Math.sin(rad) * 44 * 1.12, y: busY + (-26 - Math.cos(rad) * 44) * 1.12 };
  const dErr = Math.hypot(feed.x - UPLINK.from.x, feed.y - UPLINK.from.y);
  if (dErr > 12)
    throw new Error(`UPLINK.from is ${dErr.toFixed(0)} units off the dish's actual feed `
      + `(${feed.x.toFixed(0)}, ${feed.y.toFixed(0)}) — the beam would leave from thin air`);
  const end = uplinkAt(1);
  const sErr = Math.hypot(end.x - STATION.dish.x, end.y - STATION.dish.y);
  if (sErr > 24)
    throw new Error(`the ray ends ${sErr.toFixed(0)} units from the station's bowl — move the `
      + 'station onto the ray, not the ray onto the station');
})();

/* ── SOUND CUES ────────────────────────────────────────────────────────────────────────────*/
export const CUES3 = { A3, OUT0, OUT1, OUT2, OUT3 };
export const _a3 = { W, LAYOUT, STATUS_H, MAST, CAP_T, DECK_N };
