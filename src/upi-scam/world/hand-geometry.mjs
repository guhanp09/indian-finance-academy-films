/* THE POINTING HAND — geometry, in FW units.
 *
 * FW = the index finger's width at its base. Every number here is in FW, so the drawing is
 * scale-free and the audit can measure the render without knowing what scale it was drawn at.
 *
 * This module is the ONE source of truth: the Remotion component draws it, and tools/upi-scam/hand-audit
 * renders the same exported contour to a raster and measures it. Both failures that survived four
 * attempts at this hand ("W" widening the finger from two different bases, a knuckle normal that
 * pointed into the hand) were cases of the code not drawing what its variable names said — which no
 * amount of reading the constants can catch, and measuring the render does.
 *
 * Frame: apex of the fingertip at (0, 0), +y down the hand toward the wrist, finger axis x = 0.
 * A RIGHT hand seen from the BACK: thumb side −x, knuckles +x. The left hand is this mirrored.
 *
 * Spec: docs/upi-scam/hand-spec.md
 */

const D = Math.PI / 180;
const hyp = Math.hypot;

/* ── the numbers ─────────────────────────────────────────────────────────────────────────────*/
export const S = {
  tipHalf: 0.42,          // half-width at the tip — the cap is a semicircle of this radius
  baseHalf: 0.50,         // half-width at the base: a 16% taper, so it is not a capsule
  notchY: 3.56,           // apex → the bottom of the ulnar web
  webR: 0.10,             // the web fillet: tight, and asymmetric by construction
  rowStart: [0.62, 3.56], // first valley of the knuckle row
  rowTilt: 24,            // the row descends away from the finger
  steps: [1.16, 1.10, 0.98],   // x-steps — graded: the middle knuckle is the most prominent
  sagittas: [0.36, 0.32, 0.26],
  lobeFillet: 0.12,
  wristY: 9.0,
  wristRad: -0.50,        // the finger's axis enters the wrist 15% in from the thumb edge
  wristUln: 2.80,
  foreHalfEnd: 1.85,      // the forearm reaches 3.70 wide…
  foreRamp: 3.0,          // …no sooner than 3 FW below the wrist
  thenarPeak: [-1.38, 6.4],
  fingerRadAt43: -0.518,
  bendFrom: 8.0,          // the bend is spread over this band, not hinged at a point
  bendTo: 10.4,
  nail: { halfW: 0.30, closedY: 0.95, openY: 0.40 },
  creaseLen: 0.35,
};
export const WRIST_C = [(S.wristRad + S.wristUln) / 2, S.wristY];
/** where the fingertip PAD sits — the contact point, behind the apex, not the apex itself */
export const PAD = [0, S.tipHalf];

/* ── small geometry helpers ──────────────────────────────────────────────────────────────────*/
const ang = (c, p) => Math.atan2(p[1] - c[1], p[0] - c[0]) / D;
const onCircle = (c, r, a) => [c[0] + r * Math.cos(a * D), c[1] + r * Math.sin(a * D)];
/** An arc from p0 to p1 about (c, r), with the sweep stated rather than guessed.
 *  The loop is walked apex → ulnar → wrist → forearm → radial → apex, which is clockwise on screen,
 *  so a CONVEX boundary arc runs with the angle increasing (dir +1) and a CONCAVE fillet with it
 *  decreasing (dir −1). Guessing "the short way" silently turns a knuckle into a scoop. */
const arcTo = (c, r, p0, p1, dir, n = 22) => {
  const a0 = ang(c, p0);
  let a1 = ang(c, p1);
  if (dir > 0) { while (a1 < a0) a1 += 360; } else { while (a1 > a0) a1 -= 360; }
  return Array.from({ length: n + 1 }, (_, i) => onCircle(c, r, a0 + (a1 - a0) * (i / n)));
};
const CONVEX = 1, CONCAVE = -1;
const cubic = (p0, p1, p2, p3, n = 26) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [0, 1].map((k) =>
      u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
  });
/** a concave fillet of radius r sitting in the notch between two circles, outside both */
const filletBetween = (A, B, r) => {
  const d = hyp(B.c[0] - A.c[0], B.c[1] - A.c[1]);
  const along = [(B.c[0] - A.c[0]) / d, (B.c[1] - A.c[1]) / d];
  const out = [along[1], -along[0]];                       // toward the outside of the hand
  const ra = A.r + r, rb = B.r + r;
  const x = (d * d + ra * ra - rb * rb) / (2 * d);
  const y = Math.sqrt(Math.max(0, ra * ra - x * x));
  const f = [A.c[0] + along[0] * x + out[0] * y, A.c[1] + along[1] * x + out[1] * y];
  return {
    c: f, r,
    ta: [A.c[0] + (f[0] - A.c[0]) * A.r / ra, A.c[1] + (f[1] - A.c[1]) * A.r / ra],
    tb: [B.c[0] + (f[0] - B.c[0]) * B.r / rb, B.c[1] + (f[1] - B.c[1]) * B.r / rb],
  };
};

/* ── the knuckle row ─────────────────────────────────────────────────────────────────────────*/
const tan = Math.tan(S.rowTilt * D);
const VALLEYS = (() => {
  const v = [S.rowStart.slice()];
  let x = S.rowStart[0];
  for (const st of S.steps) { x += st; v.push([x, S.rowStart[1] + (x - S.rowStart[0]) * tan]); }
  return v;
})();
export const LOBES = S.sagittas.map((s, i) => {
  const a = VALLEYS[i], b = VALLEYS[i + 1];
  const h = hyp(b[0] - a[0], b[1] - a[1]) / 2;
  const r = (h * h + s * s) / (2 * s);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const nIn = [-Math.sin(S.rowTilt * D), Math.cos(S.rowTilt * D)];   // into the hand
  return { c: [mid[0] + nIn[0] * (r - s), mid[1] + nIn[1] * (r - s)], r, chord: 2 * h, sag: s };
});
const F12 = filletBetween(LOBES[0], LOBES[1], S.lobeFillet);
const F23 = filletBetween(LOBES[1], LOBES[2], S.lobeFillet);

/* the web: a fillet tangent to the finger's ulnar edge and to knuckle 1 */
const FING_A = [S.tipHalf, S.tipHalf], FING_B = [S.baseHalf, S.notchY];
const WEB = (() => {
  const L = hyp(FING_B[0] - FING_A[0], FING_B[1] - FING_A[1]);
  const e = [(FING_B[0] - FING_A[0]) / L, (FING_B[1] - FING_A[1]) / L];
  const n = [e[1], -e[0]];                                  // +x side of the finger's edge
  const C1 = LOBES[0], rr = S.webR;
  const Q = [FING_A[0] + n[0] * rr - C1.c[0], FING_A[1] + n[1] * rr - C1.c[1]];
  const b = Q[0] * e[0] + Q[1] * e[1];
  const cc = Q[0] * Q[0] + Q[1] * Q[1] - (C1.r + rr) * (C1.r + rr);
  /* two circles of radius r touch both the finger's edge and knuckle 1 — one above that knuckle's
     centre and one below it. The web is the one ABOVE: the minus root. The plus root lands below
     the finger's base and folds the contour back on itself. */
  const s = -b - Math.sqrt(Math.max(0, b * b - cc));
  const c = [FING_A[0] + e[0] * s + n[0] * rr, FING_A[1] + e[1] * s + n[1] * rr];
  return {
    c, r: rr,
    tLine: [FING_A[0] + e[0] * s, FING_A[1] + e[1] * s],
    tArc: [C1.c[0] + (c[0] - C1.c[0]) * C1.r / (C1.r + rr),
           C1.c[1] + (c[1] - C1.c[1]) * C1.r / (C1.r + rr)],
  };
})();

/* the flank: the last knuckle is FLUSH — the flank is the line tangent to it */
const FLANK_T = (() => {
  const L3 = LOBES[2], W = [S.wristUln, S.wristY];
  const dx = L3.c[0] - W[0], dy = L3.c[1] - W[1], d = hyp(dx, dy);
  const a = Math.asin(Math.min(1, L3.r / d)), base = Math.atan2(dy, dx);
  let p = onCircle(L3.c, L3.r, (base + a + Math.PI / 2) / D);
  if (p[0] < L3.c[0]) p = onCircle(L3.c, L3.r, (base - a - Math.PI / 2) / D);
  return p;
})();
export const ULNAR_EXTREME = Math.max(...arcTo(LOBES[2].c, LOBES[2].r, F23.tb, FLANK_T, CONVEX, 60)
  .map((p) => p[0]));

/* ── the closed contour ──────────────────────────────────────────────────────────────────────*/
const foreHalf = (h) => 1.65 + (S.foreHalfEnd - 1.65) * Math.min(1, h / S.foreRamp);

/** the whole silhouette, hand + forearm, as one closed loop of points.
 *  `forearm` = how far below the wrist the arm runs, in FW (0 = stop at the wrist). */
export function contour({ forearm = 14, bend = 0, press = 0 } = {}) {
  const pts = [];
  const push = (a) => { for (const p of a) pts.push(p); };
  const lerpTo = (a, b, d) => {            // a point d FW from a, toward b
    const L = hyp(b[0] - a[0], b[1] - a[1]);
    return [a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L];
  };
  const quad = (p0, p1, p2, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [0, 1].map((k) => u * u * p0[k] + 2 * u * t * p1[k] + t * t * p2[k]);
  });

  /* ── ulnar side: apex → finger → web → three knuckles → flank ──────────────────────────── */
  push(arcTo(PAD, S.tipHalf, [0, 0], FING_A, CONVEX, 14));
  pts.push(WEB.tLine);
  push(arcTo(WEB.c, WEB.r, WEB.tLine, WEB.tArc, CONCAVE, 8));
  push(arcTo(LOBES[0].c, LOBES[0].r, WEB.tArc, F12.ta, CONVEX, 18));
  push(arcTo(F12.c, F12.r, F12.ta, F12.tb, CONCAVE, 8));
  push(arcTo(LOBES[1].c, LOBES[1].r, F12.tb, F23.ta, CONVEX, 18));
  push(arcTo(F23.c, F23.r, F23.ta, F23.tb, CONCAVE, 8));
  push(arcTo(LOBES[2].c, LOBES[2].r, F23.tb, FLANK_T, CONVEX, 18));

  /* ── the wrist and the forearm ─────────────────────────────────────────────────────────────
     The flank converges on the wrist at ~16° and the forearm leaves it near-vertical, so the two
     meet at a corner. A hand does not have a corner at the wrist: both joins are rounded, and the
     forearm is part of the same closed loop — there is no contour line across the wrist. */
  const WU = [S.wristUln, S.wristY], WR = [S.wristRad, S.wristY];
  const K = 0.42;                                        // how far the rounding reaches
  if (forearm > 0.01) {
    const N = 16;
    const uEdge = (h) => [WRIST_C[0] + foreHalf(h), S.wristY + h];
    const rEdge = (h) => [WRIST_C[0] - foreHalf(h), S.wristY + h];
    push(quad(lerpTo(WU, FLANK_T, K), WU, uEdge(K)));

    for (let i = 1; i <= N; i++) pts.push(uEdge((forearm * i) / N));
    const e = foreHalf(forearm);
    push(arcTo([WRIST_C[0], S.wristY + forearm], e, uEdge(forearm), rEdge(forearm), CONVEX, 12));
    for (let i = N - 1; i >= 1; i--) pts.push(rEdge((forearm * i) / N));
    /* round into the thenar curve itself: take the point K along that curve and quad through the
       wrist point to it. Moving the curve's START without moving its control points makes it
       double back on the wrist, which is a tighter radius than anything on a hand. */
    const lower = cubic(WR, [-0.62, 8.10], [-1.38, 7.40], S.thenarPeak, 40);
    const j = lower.findIndex((q) => hyp(q[0] - WR[0], q[1] - WR[1]) >= K);
    push(quad(rEdge(K), WR, lower[j]));
    push(lower.slice(j + 1));
  } else {
    pts.push(WU, WR);
    push(cubic(WR, [-0.62, 8.10], [-1.38, 7.40], S.thenarPeak));
  }

  /* ── radial side: the thenar, the first web space, and up the finger ───────────────────────*/
  push(cubic(S.thenarPeak, [-1.38, 5.50], [S.fingerRadAt43, 5.20], [S.fingerRadAt43, 4.30]));
  pts.push([-S.baseHalf, S.notchY], [-S.tipHalf, S.tipHalf]);
  push(arcTo(PAD, S.tipHalf, [-S.tipHalf, S.tipHalf], [0, 0], CONVEX, 10).slice(1, -1));

  /* the press: the pad spreads sideways. Nothing shortens — the pad faces the glass, and a finger
     that gets shorter when it touches something is a finger that is telescoping. */
  const out = press > 0.001
    ? pts.map(([x, y]) => (y < 1.2 ? [x * (1 + 0.045 * press * (1 - y / 1.2)), y] : [x, y]))
    : pts;
  return bend === 0 ? out : bendAt(out, bend);
}

/** the wrist bend, spread across the waist so neither contour turns a corner */
export function bendAt(pts, deg) {
  const { bendFrom: a, bendTo: b } = S;
  return pts.map(([x, y]) => {
    if (y <= a) return [x, y];
    const u = Math.min(1, (y - a) / (b - a));
    const t = (u * u * (3 - 2 * u)) * deg * D;                 // smoothstep
    /* positive = ULNAR: below the wrist the forearm swings toward the little-finger side (+x),
       which is what `place` assumes when it points the arm at its origin. Rotating the other way
       leans it radial, past what a wrist does, and quietly mis-aims the whole hand. */
    const dx = x - WRIST_C[0], dy = y - WRIST_C[1];
    return [WRIST_C[0] + dx * Math.cos(t) + dy * Math.sin(t),
            WRIST_C[1] - dx * Math.sin(t) + dy * Math.cos(t)];
  });
}

/* ── interior marks ──────────────────────────────────────────────────────────────────────────*/
export function nailPath() {
  const { halfW: w, closedY: c, openY: o } = S.nail;
  return `M${-w},${o} L${-w},${c - w} `
    + arcTo([0, c - w], w, [-w, c - w], [w, c - w], CONCAVE, 14).map((p) => `L${p[0]},${p[1]}`).join(' ')
    + ` L${w},${o}`;
}
export function creasePaths() {
  const nIn = [-Math.sin(S.rowTilt * D), Math.cos(S.rowTilt * D)];
  return [F12, F23].map((F) => {
    const p = [F.c[0] + nIn[0] * F.r, F.c[1] + nIn[1] * F.r];
    const d = [WRIST_C[0] - p[0], WRIST_C[1] - p[1]];
    const L = hyp(d[0], d[1]);
    return `M${p[0]},${p[1]} L${p[0] + d[0] / L * S.creaseLen},${p[1] + d[1] / L * S.creaseLen}`;
  });
}

/* ── placement ───────────────────────────────────────────────────────────────────────────────
   The caller says where the fingertip PAD rests and where the arm comes from. Everything else —
   how far the forearm has to run, and which way the whole hand is rotated — follows in closed
   form, so nothing is re-derived per frame by search. */
export function place({ tip, from, fw, hand, bend }) {
  const m = hand === 'left' ? -1 : 1;
  const d = hyp(from.x - tip.x, from.y - tip.y) / fw;
  const A = [WRIST_C[0] - PAD[0], WRIST_C[1] - PAD[1]];
  const u = [Math.sin(bend * D), Math.cos(bend * D)];         // the bent forearm's axis
  const Au = A[0] * u[0] + A[1] * u[1];
  const AA = A[0] * A[0] + A[1] * A[1];
  const t = Math.max(0.5, -Au + Math.sqrt(Math.max(0.01, Au * Au + d * d - AA)));
  const V = [A[0] + u[0] * t, A[1] + u[1] * t];               // pad → arm origin, in local units
  const theta = Math.atan2(from.y - tip.y, from.x - tip.x) / D - Math.atan2(V[1], m * V[0]) / D;
  return { theta, mirror: m, forearm: t };
}

export const toPath = (pts) =>
  'M' + pts.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`).join('L') + 'Z';
