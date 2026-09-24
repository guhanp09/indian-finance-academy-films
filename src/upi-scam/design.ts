/* UPI SCAM 1 — the one design system.
 *
 * Everything visual in this film resolves through this file: the palette and its narrative
 * phases, the spring families, the single light direction, the layout bands, the type scale and
 * the deterministic RNG. Nothing downstream is allowed to invent a colour, a spring or a shadow.
 * That is what makes 68 dense blocks read as one authored world rather than 68 designs.
 */
import { interpolate, interpolateColors, spring } from 'remotion';
import narration from './narration.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;

/* ── LAYOUT ───────────────────────────────────────────────────────────────────────────────────
   Two registers, stacked, and one foreground.

     LEDGER  (y 120-430)   what is ACTUALLY happening: YOU on the left, THEM on the right,
                           and the flow between them. This is the mechanism.
     PHONE   (y 470-1430)  what the victim SEES. This is the experience.
     FORE    (y 1300+)     the seller, cropped by the frame edge so the frame feels larger
                           than the composition.
     SUBS    (y 1560-1700) reserved. No narrative object may enter it.
     DEAD    (y 1740+)     Shorts UI. Nothing legible lives here.

   The two registers are physically linked — the PIN dots leave the phone and become the tokens
   that travel the ledger — which is what makes the reveal land in both at once. */
export const LAYOUT = {
  ledger: { y: 275, left: 186, right: 894, nodeR: 74 },
  phone: { x: 285, y: 470, w: 510, h: 960, r: 46 },
  subs: { y: 1596, w: 900 },
  safeX: 96,
  deadY: 1740,
} as const;

export const PHONE_CX = LAYOUT.phone.x + LAYOUT.phone.w / 2;

/* ── LIGHT ────────────────────────────────────────────────────────────────────────────────────
   One notional key from upper-left, for the whole film. Every shadow offset in the film is
   `shadow()` — there is no second opinion about where the light is. */
export const LIGHT = { x: -0.38, y: 1, blurPerUnit: 1.9 };
export const shadow = (elevation: number, opacity = 0.34) =>
  `${(LIGHT.x * elevation).toFixed(1)}px ${(LIGHT.y * elevation).toFixed(1)}px `
  + `${(elevation * LIGHT.blurPerUnit).toFixed(1)}px rgba(4,8,24,${opacity})`;

/* ── PALETTE ─────────────────────────────────────────────────────────────────────────────────*/
export const C = {
  navy: '#101733',
  navy2: '#1C2854',
  cobalt: '#3156D9',
  teal: '#23B7C5',
  green: '#42D37A',
  yellow: '#FFD35A',
  amber: '#FFAA3D',
  orange: '#FF6B45',
  red: '#EC3D5A',
  lavender: '#8378D8',
  ink: '#F6F7FB',
  grey: '#A9B0C7',
  card: '#F6F7FB',
  cardInk: '#141B33',
} as const;

/* The colour SCRIPT: the environment is a function of story time, not of scene index. Each stop
   is (time, deep ground, upper ground, ambient accent). Phases blend continuously, so no cut
   ever coincides with a colour change — the ground is always already becoming the next phase. */
/* ANCHORED TO WORDS, NOT TO THE CLOCK. These stops were hand-timed against one read, as numbers
   of seconds; on a slower read that walks the whole colour narrative out of step with the story it
   describes — the ground would turn to loss before the reversal, warm for the parents before they
   arrive. Each stop now names the word it is about, and every one of them landed within 0.22s of
   the number it replaced. */
const WORDS = narration.words;
const at = (i: number) => WORDS[i].s;
const GROUND: [number, string, string, string][] = [
  [0.0, '#0C1229', '#16204A', '#23B7C5'],        // A  false safety: cool, orderly, trustworthy
  [at(21), '#0B1128', '#1A2551', '#3156D9'],     // B  "approve"     commitment tightens
  [at(39), '#0B1026', '#1B2450', '#FFD35A'],     // C1 "however,"    tension
  [at(47), '#120F20', '#2A1733', '#EC3D5A'],     // C2 "leaves"      loss: the ground itself cools
  [at(50), '#0D1330', '#1B264F', '#3156D9'],     // D  "While"       context, no warning fatigue
  [at(61), '#0C1330', '#1B264F', '#23B7C5'],     // E  "unfamiliar"  the broad network
  [at(72), '#111433', '#232551', '#8378D8'],     // F  "If" (parents) a degree warmer, not red
  [at(87), '#0C1229', '#19224A', '#42D37A'],     // G  "UPI" (the rule) cleanest frame in the film
  [WORDS[WORDS.length - 1].e, '#0C1229', '#19224A', '#42D37A'],
];
const ramp = (t: number, i: 1 | 2 | 3) => {
  const ts = GROUND.map((g) => g[0]);
  const cs = GROUND.map((g) => g[i] as string);
  return interpolateColors(t, ts, cs);
};
export const ground = (t: number) => ({
  deep: ramp(t, 1),
  high: ramp(t, 2),
  accent: ramp(t, 3),
});

/* The reversal ramp. Direction, not decoration: this is the one colour path the film teaches,
   and the same function drives the arrow, the amount, the tokens and the balance so they can
   never disagree about how far through the betrayal they are. */
export const betrayal = (p: number) =>
  interpolateColors(p, [0, 0.28, 0.5, 0.72, 1], [C.green, C.yellow, C.amber, C.orange, C.red]);

/* ── SPRING FAMILIES ─────────────────────────────────────────────────────────────────────────
   Six classes, and an object belongs to exactly one for the whole film. A phone never borrows
   the badge spring because a particular frame would look nicer. */
export const CLASS = {
  heavy: { mass: 1.45, stiffness: 145, damping: 24 },       // phone, panels, torsos
  medium: { mass: 1.0, stiffness: 215, damping: 20 },       // request / listing / rule cards
  light: { mass: 0.55, stiffness: 310, damping: 18 },       // badges, PIN dots, chips
  elastic: { mass: 0.8, stiffness: 175, damping: 13 },      // arrows, connectors, shield traces
  camera: { mass: 3.0, stiffness: 42, damping: 26 },        // heavier than anything it frames
  human: { mass: 0.9, stiffness: 190, damping: 22 },        // heads, shoulders, hands
} as const;
export type ClassName = keyof typeof CLASS;

export const sp = (frame: number, at: number, cls: ClassName, opts?: { durationInFrames?: number }) =>
  spring({ frame: frame - at, fps: FPS, config: CLASS[cls], durationInFrames: opts?.durationInFrames });

/* Anticipation -> overshoot -> settle, as one call. `back` is the recoil before the move, in the
   same units as the result, so a heavy object can be given a small one and a light object a big
   one without either of them using the other's spring. */
export const antic = (frame: number, at: number, cls: ClassName, back = 0.07) => {
  const pre = interpolate(frame - at, [-7, -1, 0], [0, -back, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return sp(frame, at, cls) + pre;
};

/* Decaying reaction: what the WORLD does when something lands on it. Amplitude, not shape, is
   what differs between a card landing and an arrow snapping.
 *
 * SINE, not cosine. A struck object starts at rest with maximum VELOCITY, not at maximum
 * displacement — a cosine steps to full amplitude on the impact frame, which is a teleport, and
 * the seam metric correctly read it as a cut at the two hardest impacts in the film. With a sine
 * the object leaves rest and reaches its extreme a fraction of a cycle later, which is both the
 * correct impulse response and what makes the hit feel struck rather than jump-cut. */
export const impact = (frame: number, at: number, amp: number, hz = 7.5, decay = 9) => {
  const d = (frame - at) / FPS;
  if (d < 0 || d > 1.6) return 0;
  /* scaled so the first peak still reaches `amp` despite the decay eating into it */
  const peak = Math.exp(-decay * (0.25 / hz));
  return (amp / Math.max(0.25, peak)) * Math.exp(-decay * d) * Math.sin(2 * Math.PI * hz * d);
};

/* ── DETERMINISTIC RNG ───────────────────────────────────────────────────────────────────────
   Seeded, so two renders are bit-identical, and keyed per element so the ten thousandth particle
   has a stable identity across frames rather than being re-rolled. */
export const mulberry32 = (a: number) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const hash01 = (i: number, salt = 0) => {
  let h = Math.imul(i ^ salt, 2246822519); h = (h << 13) | (h >>> 19);
  h = Math.imul(h ^ (h >>> 15), 3266489917);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* ── TYPE ────────────────────────────────────────────────────────────────────────────────────
   A phone-first scale. 13px at 1080p is 2.6pt in the hand, so nothing in this film is under 26px
   and nothing load-bearing is under 40px. */
export const T = {
  face: '"Inter Tight","Inter","Helvetica Neue",Arial,sans-serif',
  mono: '"SF Mono",ui-monospace,"Roboto Mono",monospace',
  micro: 28, small: 34, body: 42, label: 48, head: 62, amount: 96, hero: 118,
} as const;

export const tracking = (px: number) => ({ letterSpacing: `${px}px` });

/* ── UTIL ────────────────────────────────────────────────────────────────────────────────────*/
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = {
  out: (t: number) => 1 - Math.pow(1 - clamp01(t), 3),
  in: (t: number) => Math.pow(clamp01(t), 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};
/* window helper: 0 before `a`, eased 0->1 across [a,b], 1 after */
export const win = (t: number, a: number, b: number) => ease.out((t - a) / Math.max(1e-6, b - a));

/* Parse either "#rrggbb" or the "rgba(r, g, b, a)" that interpolateColors returns. Mixing a
   colour is only safe if the mixer accepts every form the palette actually produces — assuming
   hex silently turned the film's hero object black. */
export const parseColor = (c: string): [number, number, number] => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) { const [r, g, b] = m[1].split(',').map((v) => parseFloat(v)); return [r, g, b]; }
  const h = c.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = parseColor(a), [r2, g2, b2] = parseColor(b);
  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`;
};
