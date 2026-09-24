/* THE CAMERA, AND THE DEVICE RIG'S JOURNEY — the two keyframed moves in the film.
 *
 * Both are anchored to measured words, never to the clock, so a different read re-times them.
 * They are allowed to STRETCH with that read and that is deliberate: these are slow drifts, and
 * capping them would make them arrive early and then hold, which ADDS stillness to a slower read.
 * Anything with MASS is protected instead by `paced()` in timeline.ts.
 *
 * The camera is the heaviest object in the film. It moves only when the move changes what the
 * viewer understands:
 *   push in       attention narrowing onto a local action
 *   hold          trust, or tension
 *   pull back     systems comprehension
 *   micro-recoil  revelation — ONE of these in the whole film, at the dropper
 *   settle        resolution
 * No shake, no handheld, no decorative rotation, no zoom per beat.
 */
import { clamp01, ease, lerp } from './design';
import { B, CUE, DURATION, PHASE_START } from './timeline';

const END = DURATION / 60;

type Key = [t: number, scale: number, y: number];
export const CAM: Key[] = [
  /* the frame ARRIVES — a 1.4% settle across the first half-second, so the opening is a shot
     being taken rather than a still being held. Done well before the card lands. */
  [0.00, 0.986, 10],
  [0.62, 1.006, 0],
  [CUE.cardLand, 1.010, -4],            // the impact, absorbed rather than chased
  [CUE.tileLift, 1.040, -16],           // push: the attachment becomes the subject
  [CUE.nameReveal, 1.062, -24],
  [CUE.apkTap, 1.070, -26],
  /* the barrier HOLDS. The camera stops thinking while the system waits for a choice. */
  [CUE.barrierSet, 1.046, -14],
  [CUE.toggleIn, 1.058, -20],
  [CUE.togglePress, 1.062, -22],
  [CUE.barrierOpens, 1.040, -12],
  [CUE.installerIn, 1.020, -6],
  [CUE.installProgress, 1.004, 2],
  [CUE.iconDocks, 0.994, 6],
  /* the fake service: the widest, calmest framing so far — it should feel SAFE */
  [CUE.appOpens, 0.980, 10],
  [B(53), 0.978, 12],
  [CUE.updateRise, 1.026, -10],         // push: the intrusion is local and personal
  [CUE.updateWords, 1.040, -18],
  [CUE.updatePress, 1.044, -20],
  /* the interior opens for the first time. The camera pulls back to make room for it, and from
     here until the recap the film has two registers in frame at once. */
  [CUE.payloadAppears, 1.000, 4],
  [CUE.installer2, 0.986, 12],
  [CUE.payloadLands, 0.968, 20],
  [CUE.appResurfaces, 0.966, 20],
  /* permissions: pull back, because this is where the film stops being about a screen and
     starts being about a system */
  [CUE.smsCard, 0.962, 14],
  [CUE.callCard, 0.952, 18],
  [CUE.bgConcept, 0.944, 22],
  [CUE.vpnCard, 0.934, 26],
  [CUE.tunnelGrows, 0.922, 30],
  [CUE.allFour, 0.910, 34],       // the widest the film has been: the system is the subject
  [CUE.hastyStart, 0.918, 30],
  [CUE.irony, 0.906, 34],
  /* payment: LOCKED. A camera that keeps moving is a camera that is worried, and the victim is
     not worried. This is the stillest stretch in the film. */
  [CUE.foldToPayment, 0.974, 6],
  [CUE.formFocus, 0.978, 4],
  [CUE.typing, 0.978, 4],
  [CUE.payPress, 0.978, 4],
  [CUE.successLands, 0.980, 3],
  [CUE.falseEnd, 0.980, 3],
  /* THE REVEAL. One micro-recoil of 2.4% on the turn, and then a slow push into the exposed core.
     The only recoil in the film. */
  [CUE.thin, 0.980, 3],
  [CUE.seamsCatch, 0.986, 1],
  [CUE.shellOpens, 0.956, 16],          // the recoil
  [CUE.shellOpens + 0.15, 0.982, 4],   // recoil settles before "in reality," arrives
  /* never before the recoil above it has settled: on the recorded read "in reality," arrives
     0.04 s sooner than the settle finishes, and this table only sorts at bundle time — which
     took the whole film's render down, v2 comps included. */
  [Math.max(CUE.push, CUE.shellOpens + 0.25), 0.972, 8],
  [CUE.payloadExposed, 0.960, 13],
  [CUE.drain, 0.958, 14],
  [CUE.routesBend, 0.948, 18],
  [CUE.coreTurns, 0.986, 2],            // the push into the core
  [CUE.allPathsTerminate, 0.944, 20],
  /* theft: the frame opens out until the whole path is legible at once, and then holds while the
     narration names its two halves. */
  [CUE.fieldsReturn, 0.948, 18],
  [CUE.credToCore, 0.936, 22],
  [CUE.smsNamed, 0.956, 14],       // back in for the message: the OTP is ON the phone
  [CUE.otpArrives, 0.962, 12],
  [CUE.duplicate, 0.958, 14],
  [CUE.exfil, 0.930, 24],
  [CUE.serverReceives, 0.912, 30],
  [CUE.pullBack, 0.896, 36],
  [CUE.bothPresent, 0.902, 34],
  [CUE.capability, 0.898, 35],
  /* recap: the widest and stillest framing in the film — it is a system being explained, and the
     camera's job is to stop having opinions about it */
  [CUE.chainStarts, 0.884, 40],
  [CUE.chainFlows, 0.878, 42],
  [CUE.endpointWakes, 0.882, 40],
  [CUE.chainEnds, 0.890, 36],
  /* prevention: push back in, because the lesson is a single object again */
  [CUE.messageReturns, 0.944, 18],
  [CUE.xStroke1, 0.968, 6],
  [CUE.safeRouteShown, 0.956, 12],
  [CUE.fingerRedirects, 0.950, 14],
  /* resolution: settle, symmetric, still. The last frame is a poster. */
  [CUE.browserGrows, 0.944, 14],
  [CUE.portalLands, 0.936, 16],
  [CUE.lookup, 0.932, 17],
  [CUE.verified, 0.930, 18],
  [CUE.settle, 0.928, 18],
  [END, 0.927, 18],
];

export function camera(t: number) {
  let i = 0;
  while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  const u = b[0] === a[0] ? 1 : ease.inOut(clamp01((t - a[0]) / (b[0] - a[0])));
  /* the frame is never locked: an ambient drift slower than anything inside it */
  const drift = Math.sin(t * 0.21) * 3.1 + Math.sin(t * 0.097 + 1.9) * 1.9;
  return { s: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u) + drift * 0.55, x: drift * 0.8 };
}

/* THE DEVICE'S OWN JOURNEY. It is the same phone at every scale and is never swapped out. It
   recedes when the film needs to show the system it is part of, and returns whenever the thing
   being explained is on its screen. */
type SKey = [t: number, s: number, x: number, y: number];
export const STAGE: SKey[] = [
  [0, 1, 0, 0],
  [CUE.apkTap, 1, 0, 0],
  [CUE.systemRise, 1, 0, 0],
  [CUE.appOpens, 1, 0, 0],
  [CUE.updateRise, 1, 0, 0],
  /* the interior opens under the device for the first time: the phone rises and gives up its
     lower third, and from here to the recap the two registers are both always visible */
  [CUE.payloadAppears, 0.92, 0, -70],
  [CUE.installer2, 0.86, 0, -118],
  [CUE.payloadLands, 0.80, 0, -158],
  [CUE.appResurfaces, 0.79, 0, -164],
  [CUE.smsCard, 0.76, 0, -150],
  [CUE.vpnCard, 0.74, 0, -152],
  [CUE.allFour, 0.70, 0, -168],
  [CUE.hastyStart, 0.70, 0, -168],
  [CUE.irony, 0.66, 0, -186],
  /* payment: the screen IS the scene again, so the device comes back nearly full size */
  [CUE.foldToPayment, 0.88, 0, -118],
  [CUE.falseEnd, 0.88, 0, -118],
  /* the reveal belongs to the interior; the device recedes to make room for what it contains */
  [CUE.thin, 0.88, 0, -118],
  [CUE.shellOpens, 0.74, 0, -170],
  [CUE.payloadExposed, 0.60, 0, -182],
  [CUE.coreTurns, 0.58, 0, -184],
  [CUE.allPathsTerminate, 0.58, 0, -184],
  /* the OTP is ON the phone, so the device is legible for it, and then recedes for the exfil */
  [CUE.smsNamed, 0.66, 0, -186],
  [CUE.otpArrives, 0.70, 0, -178],
  [CUE.duplicate, 0.70, 0, -178],
  [CUE.exfil, 0.58, -92, -196],
  [CUE.pullBack, 0.50, -150, -208],
  [CUE.capability, 0.50, -150, -208],
  /* the recap reduces the device to one node among many — it is a memory now */
  [CUE.chainStarts, 0.30, -318, -338],
  [CUE.chainEnds, 0.30, -318, -338],
  /* prevention brings the message back to full size; the device is the subject again */
  [CUE.messageReturns, 0.86, 0, -96],
  [CUE.fingerRedirects, 0.86, 0, -96],
  [CUE.browserGrows, 0.92, 0, -64],
  [END, 0.92, 0, -64],
];

export function stage(t: number) {
  let i = 0;
  while (i < STAGE.length - 1 && t > STAGE[i + 1][0]) i++;
  const a = STAGE[i], b = STAGE[Math.min(i + 1, STAGE.length - 1)];
  const u = b[0] === a[0] ? 1 : ease.inOut(clamp01((t - a[0]) / (b[0] - a[0])));
  return { s: lerp(a[1], b[1], u), x: lerp(a[2], b[2], u), y: lerp(a[3], b[3], u) };
}

/** guard: the two key tables must stay monotonic in time, or a move runs backwards */
for (const [name, k] of [['CAM', CAM], ['STAGE', STAGE]] as const) {
  /* every violation at once — a re-measured read moves the whole table, and finding them one
     bundle failure at a time costs a render each */
  const back = k.map((row, i) => (i && row[0] < k[i - 1][0]
    ? `key ${i} at ${row[0].toFixed(2)}s is before key ${i - 1} at ${k[i - 1][0].toFixed(2)}s`
    : null)).filter(Boolean);
  if (back.length) throw new Error(`${name} no longer sorts:\n    ${back.join('\n    ')}`);
}
