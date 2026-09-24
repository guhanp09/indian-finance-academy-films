/* THE DOLLY — one reader for every camera table in the film.
 *
 * Every table here is a list of [t, x, y, z] keys, and every one of them used to be read with
 * `ease.inOut` BETWEEN CONSECUTIVE KEYS. That eases to a stop at EVERY key, so a move built out of
 * three keys is not one move: it is three lurches with two dead stops inside it. Measured on act
 * 4's return from the attacker's compound, the camera ran
 *
 *     72 → 2093 → 1225 → 160 → 3589 → 1   units per second
 *
 * with peak accelerations over 70,000 u/s². It is exactly the defect this film already has a law
 * about for objects (rule: eased legs make false stops) — "piecewise inOut stops the object dead at
 * every junction" — and nobody had thought to apply it to the thing doing the looking.
 *
 * This reads the same tables with a MONOTONE CUBIC (Fritsch–Carlson PCHIP), per axis:
 *
 *   · velocity is continuous everywhere, so there are no lurches;
 *   · a key whose neighbours differ gets a real tangent, so the camera PASSES THROUGH it at speed;
 *   · a key sitting next to a repeat of itself — which is how this film writes a hold — gets a zero
 *     tangent, so a move still eases in at its start and eases out at its end, and a hold is still
 *     perfectly still;
 *   · and being monotone it cannot overshoot, so the camera never sails past a framing and swims
 *     back to it.
 *
 * KEY TIMES ARE NOT TOUCHED. Several tables put a key on a spoken word, and re-timing keys to even
 * out the speed would desync the picture from the read. Where a segment's authored speed is wrong,
 * the fix is that key's time, not the curve — tools/echallan/camera.mjs measures every segment in
 * the film and names the ones that are too fast.
 */
export type FK = [number, number, number, number];

/** Fritsch–Carlson slopes: C1, shape-preserving, and zero wherever the data turns or rests. */
const slopes = (t: number[], v: number[]) => {
  const n = t.length;
  const m = new Array<number>(n).fill(0);
  if (n < 2) return m;
  const d = new Array<number>(n - 1);
  for (let i = 0; i < n - 1; i++) d[i] = (v[i + 1] - v[i]) / Math.max(1e-6, t[i + 1] - t[i]);
  if (n === 2) { m[0] = 0; m[1] = 0; return m; }
  /* the table opens and closes at rest */
  m[0] = 0; m[n - 1] = 0;
  for (let i = 1; i < n - 1; i++) {
    /* a turning point, or either side at rest (a hold): the camera stops turning here */
    if (d[i - 1] * d[i] <= 0) { m[i] = 0; continue; }
    const h0 = Math.max(1e-6, t[i] - t[i - 1]), h1 = Math.max(1e-6, t[i + 1] - t[i]);
    const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
    m[i] = (w0 + w1) / (w0 / d[i - 1] + w1 / d[i]);
  }
  return m;
};

const hermite = (t0: number, t1: number, v0: number, v1: number, m0: number, m1: number,
  t: number) => {
  const h = Math.max(1e-6, t1 - t0);
  const s = Math.max(0, Math.min(1, (t - t0) / h)), s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * h * m0
    + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * h * m1;
};

/** compile a camera table once, at module load, into a reader */
export const makeTrack = (keys: FK[]) => {
  /* EVERY violation, not the first. A re-measured read moves every beat at once, so a table that
     has gone out of order has usually gone out of order in several places, and fixing them one
     crash at a time is a waste of a re-measure. */
  const back = keys.map((k, i) => (i && k[0] < keys[i - 1][0]
    ? `key ${i} at ${k[0].toFixed(3)}s is before key ${i - 1} at ${keys[i - 1][0].toFixed(3)}s `
      + `(by ${(keys[i - 1][0] - k[0]).toFixed(3)}s)` : null)).filter(Boolean);
  if (back.length) throw new Error(`camera table runs backwards:\n    ${back.join('\n    ')}`);
  const T = keys.map((k) => k[0]);
  const X = keys.map((k) => k[1]), Y = keys.map((k) => k[2]), Z = keys.map((k) => k[3]);
  const mx = slopes(T, X), my = slopes(T, Y), mz = slopes(T, Z);
  return (t: number) => {
    if (t <= T[0]) return { x: X[0], y: Y[0], z: Z[0] };
    const last = T.length - 1;
    if (t >= T[last]) return { x: X[last], y: Y[last], z: Z[last] };
    let i = 0;
    while (i < last - 1 && t > T[i + 1]) i++;
    return {
      x: hermite(T[i], T[i + 1], X[i], X[i + 1], mx[i], mx[i + 1], t),
      y: hermite(T[i], T[i + 1], Y[i], Y[i + 1], my[i], my[i + 1], t),
      z: hermite(T[i], T[i + 1], Z[i], Z[i + 1], mz[i], mz[i + 1], t),
    };
  };
};

/** every compiled table, for tools/echallan/camera.mjs to report on */
export const TABLES: Record<string, FK[]> = {};
export const register = (name: string, keys: FK[]) => { TABLES[name] = keys; return keys; };
