// Motion primitives. Every statistic in this film is the numeric readout of a
// visual transformation, so both read from the same progress function: a scene
// computes one `roll()` value and feeds it to the counter, the stack and the
// dot field at once.

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Symmetric ramp — zero velocity at both ends. Used for anything that moves a
 *  long way on screen, where a hard start or stop reads as a stutter. */
export const smooth = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };

/**
 * Odometer transport: spins fast, then brakes hard into the target.
 * 58% of the time covers 72% of the distance; the rest brakes the remaining
 * 28% into place so the final digits are readable before they lock.
 */
export const rollEase = (t: number) => {
  const x = clamp01(t);
  if (x < 0.58) return 0.72 * Math.pow(x / 0.58, 1.05);
  const u = (x - 0.58) / 0.42;
  // quadratic (not cubic) tail: still braking hard, but the last frames of the
  // approach stay visible instead of flattening out early
  return 0.72 + 0.28 * (1 - Math.pow(1 - u, 2));
};

/** Progress of a roll that *finishes* on `landFrame`. */
export const roll = (f: number, landFrame: number, dur = 26) =>
  rollEase((f - (landFrame - dur)) / dur);

/** Value of a quantity mid-roll — the single source both number and graphic use. */
export const rolled = (f: number, landFrame: number, from: number, to: number, dur = 26) =>
  lerp(from, to, roll(f, landFrame, dur));

/** Generic eased 0→1 ramp. */
export const pr = (f: number, at: number, dur = 20, ease = easeOutCubic) =>
  ease(clamp01((f - at) / dur));

/** Fade in, optionally back out. */
export const fade = (f: number, at: number, out?: number, dur = 14) => {
  const a = clamp01((f - at) / dur);
  const b = out === undefined ? 1 : 1 - clamp01((f - out) / dur);
  return Math.min(a, b);
};

/**
 * A highlight is a pointer, not a state.
 *
 * Its whole job is to tell the viewer which figure the narrator is talking
 * about *right now*, so it has to rise on the word that names the figure and
 * fall the moment the narration moves on. An accent left burning after that
 * stops directing attention and starts competing for it: the eye stays on the
 * last thing that glowed while the voice has already moved somewhere else, and
 * the viewer reads the wrong number against the wrong sentence.
 *
 * `until` is required for exactly that reason — there is no such thing as a
 * highlight without an end.
 */
export const accent = (f: number, on: number, until: number, dur = 15) =>
  fade(f, on - dur + 1, until, dur);

/**
 * Small settle as a value locks: scale only, never a bounce.
 *
 * It swells into the landing frame and relaxes out of it, so the scale curve is
 * continuous in value *and* velocity. The earlier form jumped from 1.000 to
 * 1.045 in a single frame, which reads as a stutter rather than an accent.
 */
export const settle = (f: number, at: number) => {
  const up = smooth((f - (at - 7)) / 7);
  const down = smooth((f - at) / 15);
  return 1 + 0.045 * (up - down);
};

/** Deterministic jitter so a stack of notes looks hand-stacked, not extruded. */
export const jitter = (i: number, amp: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2 * amp;
};

/** Accelerating. An object that *leaves* rather than easing to a stop: used for
 *  exits and for the flight of an expense icon, which has to arrive with force
 *  because its arrival is what moves the meter. */
const easeInQuad = (t: number) => { const x = clamp01(t); return x * x; };

export const EASE = { out: easeOutCubic, move: easeOutCubic, smooth, toss: easeInQuad };
