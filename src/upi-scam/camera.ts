/* THE CAMERA, AND THE PHONE RIG'S JOURNEY — the two keyframed moves in the film.
 *
 * Both are anchored to WORDS, never to the clock, so a different read re-times them.
 *
 * They are also allowed to STRETCH with that read, and that is deliberate. It was measured before
 * it was decided (tools/upi-scam/pace.mjs): the long intervals here are not moves that would crawl, they
 * are slow drifts — the phone rig takes 16.3s to go from 1.00 to 1.06, the camera's median move is
 * 1.38s. Capping those would make them arrive early and then hold, which ADDS stillness to a
 * slower read, the opposite of what is wanted. A camera that breathes with the narration is right;
 * a camera that finishes and waits is not.
 *
 * What must never stretch is anything with mass — a card crossing the frame, the reversal folding,
 * a hand reaching a button. Those are held to their approved durations by `paced` in timeline.ts.
 *
 * The frame is never static regardless: `drift` below is a function of wall-clock time and the
 * backdrop keeps breathing underneath it.
 */
import { clamp01, ease, lerp } from './design';
import { B, CUE, NARR } from './timeline';

/** the film ends when the narration does — never a wall-clock number past it */
const END = NARR.words[NARR.words.length - 1].e + 3.2;
const LAST = (s: number, y: number): Key => [END, s, y];

/* ── CAMERA ──────────────────────────────────────────────────────────────────────────────────
   Semantic only: push in = attention narrowing, hold = suspicion, micro-recoil = revelation,
   pull back = context, push = personal relevance, settle = understanding. */
type Key = [t: number, scale: number, y: number];
export const CAM: Key[] = [
  /* the frame ARRIVES: a 2% settle over the first half-second, so the opening is a shot being
     taken rather than a still being held. Done by 0.55s, well before the first anchored beat. */
  [0.00, 0.986, 7],
  [1.00, 1.008, 0],     // settles across the whole opening, so the frame is never quite at rest
  [B(11), 1.048, -18],          // "need to" — narrowing on the control
  [B(17), 1.082, -30],          // PIN dots staged
  [CUE.however, 1.086, -30],    // held: the camera stops thinking
  [CUE.snap, 1.062, 6],         // micro-recoil, and only 2.4%
  [CUE.snap + 0.5, 1.072, -4],
  [CUE.cardDismiss, 1.030, -6], // lean in on the record being written
  [CUE.shineEnd, 1.030, -6],
  [B(38), 0.972, 12],           // pull back: context
  [B(45), 0.936, 22],
  /* the camera leans INTO the wave as it passes — near objects crossing the lens pull the frame
     with them — and then settles back into the shot it was already in. Only afterwards does it
     pull back, with the people, deliberately and visibly. */
  [CUE.waveNear, 0.966, 12],
  [CUE.wavePeak, 0.994, 0],
  [CUE.waveClear, 0.948, 16],
  [CUE.crowdArrive, 0.944, 18],
  [CUE.crowdAlert, 0.898, 30],
  [B(53), 0.898, 30],
  [CUE.parentsIn, 0.902, 26],   // push: personal relevance
  [CUE.parentsFocal, 0.960, 8],
  [CUE.ruleCard, 0.970, 2],
  [CUE.split, 0.930, 0],        // settle, symmetric
  LAST(0.926, 0),
];

export function camera(t: number) {
  let i = 0;
  while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  const u = b[0] === a[0] ? 1 : ease.inOut(clamp01((t - a[0]) / (b[0] - a[0])));
  /* ambient drift: the frame is never locked, but the drift is slower than anything in it */
  const drift = Math.sin(t * 0.23) * 3.4 + Math.sin(t * 0.11 + 1.4) * 2.1;
  return { s: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u) + drift * 0.6, x: drift };
}


/* the phone rig's own journey through the film — it recedes for context and returns for the
   parents. It is the SAME phone at every scale; it is never swapped out. */
type SKey = [t: number, s: number, x: number, y: number];
export const STAGE: SKey[] = [
  [0, 1, 0, 0],
  /* the debit reveal: the screen is the only thing in frame that matters, so the device is the
     largest it is all film and the camera leans in rather than backing off */
  [CUE.cardDismiss, 1.06, 0, 16],
  [CUE.shineEnd, 1.06, 0, 16],
  [B(38), 0.94, 112, -22],
  /* THE WAVE DOES NOT HIDE A CUT. It passes, and when it has passed we are in the SAME shot we
     were in before it — same phone, same size, same place. The change to the next scene then
     happens ON CAMERA, over 1.2s, while the narration says "unfamiliar with the basics of":
     the device recedes and the frame opens out as the people walk into it. A transition the
     viewer watches is worth more than one they are prevented from seeing. */
  [CUE.waveNear, 0.90, 124, -40],
  [CUE.crowdArrive, 0.90, 124, -40],
  /* with the ledger gone from here on, the top of the frame is free: everything after the
     transition sits higher and larger than it did when it had to duck under a diagram */
  [CUE.crowdAlert, 0.78, 14, -366],
  [B(53), 0.76, 14, -374],
  [CUE.parentsIn, 0.90, 6, -240],
  /* the parents' phone is the focal object of its own scene — it is not allowed to be small */
  [CUE.parentsFocal, 1.00, 0, -132],
  [CUE.ruleCard, 1.00, 0, -132],
  /* the device stays full size while the rule card on it is the thing being read; it only
     recedes once the card has started becoming the full-frame panel */
  [CUE.split - 0.30, 1.00, 0, -132],
  /* the device goes fully behind the panel it produced — a sliver of app bar above the film's
     conclusion reads as a leftover rather than as depth */
  [CUE.sendIn - 0.25, 0.60, 0, -96],
  [END, 0.60, 0, -96],
  ];

export function stage(t: number) {
  /* The phone's own journey. It recedes to make room for context and returns for the parents,
     but it never shrinks so far that "UPI" stops being readable at phone size, and it never
     drifts so high that the lower third of a 9:16 frame becomes dead space — which is what the
     first pass did for the entire second half. */
  const k = STAGE;

  let i = 0; while (i < k.length - 1 && t > k[i + 1][0]) i++;
  const a = k[i], b = k[Math.min(i + 1, k.length - 1)];
  const u = b[0] === a[0] ? 1 : ease.inOut(clamp01((t - a[0]) / (b[0] - a[0])));
  return { s: lerp(a[1], b[1], u), x: lerp(a[2], b[2], u), y: lerp(a[3], b[3], u) };
}

