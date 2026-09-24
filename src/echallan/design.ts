/* FAKE e-CHALLAN MALWARE — the one design system.
 *
 * Everything visual in this film resolves through this file: the palette and its narrative
 * phases, the spring families, the single light direction, the layout bands, the type scale and
 * the deterministic RNG. Nothing downstream is allowed to invent a colour, a spring or a shadow.
 * That is what makes 222 dense blocks read as one authored world rather than 222 designs.
 *
 * See docs/echallan/premortem.md F2 for why this file exists in this shape.
 */
import { interpolate, interpolateColors, spring } from 'remotion';
import narration from './narration.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;

/* ── WORD ANCHORS ────────────────────────────────────────────────────────────────────────────
   The whole film is anchored to the MEASURED narration, and it is anchored BY PHRASE rather than
   by word index. `at('Android may warn')` is legible in a diff; `at(41)` is not, and an index is
   silently invalidated the moment a script edit shifts the array (see the rule "beat-index shift").
   Phrases are resolved once, here, against the measured map. */
const WORDS = narration.words as { w: string; s: number; e: number }[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const NORM = WORDS.map((x) => norm(x.w));

/** index of the first word of `phrase`, searched at or after `from`. Throws if absent. */
export const at = (phrase: string, from = 0): number => {
  const q = phrase.trim().split(/\s+/).map(norm).filter(Boolean);
  for (let i = from; i <= NORM.length - q.length; i++) {
    let ok = true;
    for (let j = 0; j < q.length; j++) if (NORM[i + j] !== q[j]) { ok = false; break; }
    if (ok) return i;
  }
  throw new Error(`narration anchor not found: "${phrase}" (from word ${from})`);
};
/** start time, in seconds, of the first word of `phrase` */
export const tAt = (phrase: string, from = 0) => WORDS[at(phrase, from)].s;
export const wordAt = (i: number) => WORDS[i].s;
export const wordEnd = (i: number) => WORDS[i].e;
export const LAST_WORD = WORDS[WORDS.length - 1].e;

/* ── LAYOUT ───────────────────────────────────────────────────────────────────────────────────
   One device, centred, large — this film IS the phone, unlike the previous film in the series
   which had to share the frame with a ledger diagram.

     WORLD   (everywhere)   the road/system/network the device sits in. Never wallpaper.
     PHONE   (y 252-1432)   62% of frame height at rest. What the victim SEES.
     INNER   (behind it)    the device's interior — routes, payload, topology. What is HAPPENING.
     FORE    (y 1330+)      the hand, cropped by the frame edge so the frame feels larger.
     SUBS    (y 1540-1690)  reserved. No narrative object may enter it.
     DEAD    (y 1740+)      Shorts UI. Nothing legible lives here.
*/
export const LAYOUT = {
  phone: { x: 260, y: 252, w: 560, h: 1180, r: 56, bezel: 13 },
  subs: { y: 1548, w: 900 },
  safeX: 96,
  deadY: 1740,
} as const;

export const SCREEN = {
  x: LAYOUT.phone.x + LAYOUT.phone.bezel,
  y: LAYOUT.phone.y + LAYOUT.phone.bezel,
  w: LAYOUT.phone.w - LAYOUT.phone.bezel * 2,
  h: LAYOUT.phone.h - LAYOUT.phone.bezel * 2,
  r: LAYOUT.phone.r - LAYOUT.phone.bezel,
} as const;
export const PHONE_CX = LAYOUT.phone.x + LAYOUT.phone.w / 2;
export const SCREEN_CX = SCREEN.x + SCREEN.w / 2;
/** status bar height inside the screen */
export const STATUS_H = 46;

/* ── LIGHT ────────────────────────────────────────────────────────────────────────────────────
   One notional key from upper-LEFT, for the whole film, so every shadow falls down and to the
   right. Every shadow offset in the film is `shadow()` — there is no second opinion. */
export const LIGHT = { x: 0.34, y: 1, blurPerUnit: 1.9 };
export const shadow = (elevation: number, opacity = 0.34) =>
  `${(LIGHT.x * elevation).toFixed(1)}px ${(LIGHT.y * elevation).toFixed(1)}px `
  + `${(elevation * LIGHT.blurPerUnit).toFixed(1)}px rgba(3,7,20,${opacity})`;
/** the same light, as an SVG filter-free drop: an offset, blurred copy drawn behind a shape */
export const dropOffset = (elevation: number) =>
  ({ dx: LIGHT.x * elevation, dy: LIGHT.y * elevation, blur: elevation * LIGHT.blurPerUnit });

/* ── PALETTE ─────────────────────────────────────────────────────────────────────────────────
   Two families that must never be confused: the SYSTEM (cool, institutional, trustworthy) and the
   CAPABILITIES the user hands over (each with its own identity, kept for the whole film). Danger
   red is not in the general palette — it is earned at the reveal and is used nowhere before it. */
export const C = {
  /* ground */
  navy: '#0B1026',
  navy2: '#151C3C',
  navy3: '#20294F',
  slate: '#2D3760',
  /* institutional / trust */
  cobalt: '#3461DC',
  teal: '#22B4C6',
  sky: '#63A6F5',
  green: '#3FCB86',
  /* friction */
  amber: '#F5A93C',
  yellow: '#FFD35A',
  /* danger — earned at the reveal, never before */
  orange: '#FF7A45',
  red: '#EA3D57',
  /* capability identities — one each, for the life of the film */
  smsCyan: '#2FD0D8',
  callViolet: '#9A86EE',
  bgAmber: '#E3A24B',
  vpnRose: '#E2569B',   // was #1D8E9E — indistinguishable from smsCyan (~6 deg apart)
  /* surfaces */
  ink: '#F4F6FB',
  grey: '#9AA3BE',
  greyDim: '#66708C',
  card: '#F5F7FC',
  cardInk: '#131A32',
  cardLine: '#D8DEEC',
  /* the WhatsApp-like chat register — recognisable without being a trademark */
  chatGreen: '#00A884',
  chatBg: '#0B141A',
} as const;

/* ── THE COLOUR SCRIPT ───────────────────────────────────────────────────────────────────────
   The environment is a function of STORY time, not of scene index, and every stop is anchored to
   a word so a different read re-times the whole narrative arc with it. Phases blend continuously,
   so no cut ever coincides with a colour change — the ground is always already becoming the next
   phase. (addendum §19)

   Each stop is [time, deep ground, upper ground, ambient accent]. */
const GROUND: [number, string, string, string][] = [
  /* 1 trust — credible, modern, official. The warm cue on the amount is the only warm thing. */
  [0.0,                          '#080D24', '#17224C', '#22B4C6'],
  /* 2 friction — the system boundary. The blue drains OUT of the ground: it goes grey, which is
     what an OS looks like, and the amber has something neutral to be amber against. */
  [tAt('Android may warn'),      '#0A0D1C', '#1E2340', '#F5A93C'],
  /* 3 false legitimacy — the app opens. The brightest, most saturated institutional blue so far;
     the frame itself relaxes, because this is the moment the victim stops worrying. */
  [tAt('The app installs'),      '#0A1430', '#1E2C60', '#3461DC'],
  /* 4 mild anomaly — the update intrudes. Blue holds, ground cools a step, amber rises. */
  [tAt('Then when you'),          '#0C1128', '#22254E', '#E9B055'],
  /* 5 incremental reach — the foreground stays clean and the ground goes quiet, so the
     accumulating capability colours underneath are the only thing gaining. */
  [tAt('Now the app begins'),    '#070C20', '#141E48', '#2FD0D8'],
  /* 6 FALSE RESOLUTION — the LIGHTEST, calmest ground in the film. premortem F6: if this frame
     is not genuinely reassuring the victim's behaviour is not believable. */
  [tAt('payment'),            '#0E1836', '#23335F', '#3FCB86'],
  /* 7 the drain — green leaves first, through neutral. Nothing is red yet. */
  [tAt('but in reality'),        '#0A0E22', '#1B203F', '#E9B055'],
  /* 8 REVEAL — the ground turns, once, toward violet-black. Localized danger, and only now. */
  [tAt('dropper, and'),          '#100B1E', '#2A1B3A', '#FF7A45'],
  /* 9 attack — the DEEPEST and quietest ground in the film, so the malicious paths are the only
     bright thing in frame and red never has to shout to be seen. */
  [tAt('The financial details'), '#06091A', '#12142E', '#EA3D57'],
  /* 10 explanation — neutral and legible; this section is comprehension, not threat. */
  [tAt('So what looked'),        '#0A1029', '#1A2350', '#63A6F5'],
  /* 11 prevention — clean authority returns. Red survives only on the forbidden route. */
  [tAt('Please be aware'),       '#0B1430', '#1E2A58', '#3461DC'],
  /* 12 resolution — stable and verified; the least busy frame in the film. */
  [tAt('If you receive'),        '#0D1836', '#22335E', '#3FCB86'],
  [LAST_WORD + 3.0,              '#0D1836', '#22335E', '#3FCB86'],
];

const ramp = (t: number, i: 1 | 2 | 3) =>
  interpolateColors(t, GROUND.map((g) => g[0]), GROUND.map((g) => g[i] as string));
export const ground = (t: number) => ({
  deep: ramp(t, 1), high: ramp(t, 2), accent: ramp(t, 3),
});

/* The one colour PATH the film teaches: a capability that was granted turning into the thing it
   was granted for. Same function drives the routes, the packets and the payload core, so they can
   never disagree about how far through the betrayal they are. */
export const betrayal = (p: number) =>
  interpolateColors(p, [0, 0.3, 0.55, 0.78, 1], [C.green, C.yellow, C.amber, C.orange, C.red]);

/* ── SPRING FAMILIES ─────────────────────────────────────────────────────────────────────────
   Seven classes, and an object belongs to exactly ONE for the whole film. A phone never borrows
   the badge spring because a particular frame would look nicer. Overshoot targets are the plan's
   physics bible: heavy 0.5-2%, medium 2-5%, light 5-9%. Verified by tools/echallan/springs.mjs. */
export const CLASS = {
  heavy: { mass: 1.55, stiffness: 140, damping: 26 },   // phone, system panels, torso, portal
  medium: { mass: 1.0, stiffness: 205, damping: 20 },   // message / permission / update / payment cards
  light: { mass: 0.5, stiffness: 330, damping: 17 },    // badges, locks, chips, OTP tiles
  elastic: { mass: 0.8, stiffness: 170, damping: 13 },  // routes, arrows, the VPN tunnel
  ballistic: { mass: 0.7, stiffness: 240, damping: 21 },// packet arrivals (travel is on a path)
  human: { mass: 0.9, stiffness: 190, damping: 22 },    // eyes, head, shoulders, hand
  camera: { mass: 3.2, stiffness: 40, damping: 26 },    // heavier than anything it frames
} as const;
export type ClassName = keyof typeof CLASS;

export const sp = (frame: number, atF: number, cls: ClassName, opts?: { durationInFrames?: number }) =>
  spring({ frame: frame - atF, fps: FPS, config: CLASS[cls], durationInFrames: opts?.durationInFrames });

/* Anticipation -> overshoot -> settle, as one call. `back` is the recoil before the move, in the
   same units as the result, so a heavy object can be given a small one and a light object a large
   one without either of them borrowing the other's spring. */
export const antic = (frame: number, atF: number, cls: ClassName, back = 0.07) => {
  const pre = interpolate(frame - atF, [-8, -2, 0], [0, -back, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return sp(frame, atF, cls) + pre;
};

/* Decaying reaction: what the WORLD does when something lands on it. SINE, not cosine — a struck
   object starts at rest with maximum VELOCITY, not maximum displacement; a cosine steps to full
   amplitude on the impact frame, which is a teleport and reads as a cut. */
export const impact = (frame: number, atF: number, amp: number, hz = 7.5, decay = 9) => {
  const d = (frame - atF) / FPS;
  if (d < 0 || d > 1.6) return 0;
  const peak = Math.exp(-decay * (0.25 / hz));
  return (amp / Math.max(0.25, peak)) * Math.exp(-decay * d) * Math.sin(2 * Math.PI * hz * d);
};

/* ── DETERMINISTIC RNG ───────────────────────────────────────────────────────────────────────
   Seeded and keyed per element, so the ten-thousandth packet has a stable identity across frames
   rather than being re-rolled, and two renders are bit-identical. Never Math.random(). */
export const hash01 = (i: number, salt = 0) => {
  let h = Math.imul(i ^ salt, 2246822519); h = (h << 13) | (h >>> 19);
  h = Math.imul(h ^ (h >>> 15), 3266489917);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export const mulberry32 = (a: number) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/* an APERIODIC standing wobble: two incommensurable periods, phase-offset per element. Used for
   every ambient behaviour in the film, because a single sine on a shared period is the "perfectly
   periodic motion" the brief forbids (premortem F2b). */
export const breathe = (t: number, i: number, rate = 1) => {
  const a = hash01(i, 11), b = hash01(i, 23);
  return Math.sin(t * rate * (0.61 + a * 0.23) + a * 6.283)
       + Math.sin(t * rate * (0.37 + b * 0.19) + b * 6.283) * 0.55;
};

/* ── TYPE ────────────────────────────────────────────────────────────────────────────────────
   A phone-first scale. 13px at 1080p is 2.6pt in the hand, so nothing in this film is under 26px
   and nothing load-bearing is under 40px. (rule: type is read on a phone) */
export const T = {
  face: '"Inter Tight","Inter","Helvetica Neue",Arial,sans-serif',
  mono: '"SF Mono",ui-monospace,"Roboto Mono",monospace',
  micro: 26, small: 32, body: 40, label: 46, head: 58, amount: 92, hero: 112,
} as const;
export const tracking = (px: number) => ({ letterSpacing: `${px}px` });

/* ── CORNER RADIUS BY MATERIAL (addendum §61) ───────────────────────────────────────────────
   Repeated arbitrary radii are what make a world feel generated. One radius per material class. */
export const R = {
  device: 56, screen: 43, systemCard: 22, chatBubble: 20, tile: 14,
  packet: 6, chip: 18, node: 10, button: 26,
} as const;

/* ── STROKE SYSTEM (addendum §60) ───────────────────────────────────────────────────────────
   Three weights only. Anything thinner than `detail` does not survive H.264 at Shorts bitrate. */
export const S = { primary: 4.5, secondary: 3, detail: 2, route: 5 } as const;

/* ── UTIL ────────────────────────────────────────────────────────────────────────────────────*/
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = {
  out: (t: number) => 1 - Math.pow(1 - clamp01(t), 3),
  in: (t: number) => Math.pow(clamp01(t), 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: (t: number) => 1 - Math.pow(1 - clamp01(t), 5),
};
/** 0 before `a`, DECELERATING 0->1 across [a,b], 1 after. For ARRIVALS: a thing that comes into
 *  frame begins fast and settles. */
export const win = (t: number, a: number, b: number) => ease.out((t - a) / Math.max(1e-6, b - a));
/** the same window, ACCELERATING. For EXITS (addendum §7.1: "an object leaving may accelerate
 *  out, without wasting time settling offscreen"). Using the arrival curve for a departure gives
 *  the leaving object its maximum velocity on its FIRST frame, which is a teleport — it moved a
 *  permission dialog 277px in one frame and the seam metric correctly called it a cut. */
export const winOut = (t: number, a: number, b: number) =>
  ease.in((t - a) / Math.max(1e-6, b - a));
/** a hold: 0 outside [a,d], ramping in over [a,b] and out over [c,d] */
export const band = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(win(t, a, b), 1 - win(t, c, d));

/* Parse either "#rrggbb" or the "rgba(r, g, b, a)" that interpolateColors returns. Assuming hex
   silently turned the previous film's hero object black. */
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
/** relative luminance, for the greyscale-legibility gate */
export const luma = (c: string) => {
  const [r, g, b] = parseColor(c);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
