/* The background is a low-volume narrator, not wallpaper.
 *
 * One canvas, one draw call per frame, one seeded PRNG. It carries the transaction network whose
 * geometry and flow direction ARE the story state: orderly and converging while the deception
 * holds, recoiling and reversing at the betrayal, re-forming as a marketplace, opening into a
 * broad payment network, simplifying for the parents, resolving into symmetry for the rule.
 *
 * Nothing in here is decorative. A pulse exists because a cause pushed it; a node moves because
 * the network is becoming a different kind of network. Amplitude never exceeds ~15% of the
 * primary event, enforced by `energy` below.
 */
import React, { useLayoutEffect, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { C, FPS, H, LAYOUT, W, clamp01, ease, ground, hash01, lerp } from '../design';
import { B, CUE, paced } from '../timeline';

/* the field is dragged through zero at the snap — a tuned move, not a gap-filler */
const BK = paced(CUE.load, CUE.snap, 2.46);

const N = 62;
const EDGES: [number, number][] = [];
const BASE: [number, number][] = [];
{
  /* a loose organic grid — 7 columns x 9 rows, jittered, so it reads as a network and not as
     graph paper. Seeded, so it is the same network in every render. */
  for (let i = 0; i < N; i++) {
    const col = i % 7, row = Math.floor(i / 7);
    BASE.push([
      60 + col * 160 + (hash01(i, 11) - 0.5) * 96,
      -40 + row * 232 + (hash01(i, 23) - 0.5) * 120,
    ]);
  }
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const dx = BASE[i][0] - BASE[j][0], dy = BASE[i][1] - BASE[j][1];
    if (dx * dx + dy * dy < 292 * 292) EDGES.push([i, j]);
  }
}

/* the four layouts the network passes through. Nodes never teleport between them: the film
   cross-fades POSITIONS, so the marketplace grid visibly *is* the earlier network, rearranged. */
const layoutMarket = (i: number): [number, number] => {
  const col = i % 7, row = Math.floor(i / 7);
  return [96 + col * 148, 120 + row * 214];
};
const layoutBroad = (i: number): [number, number] => {
  const a = (i / N) * Math.PI * 2 * 3.2, r = 180 + (i % 5) * 172;
  return [540 + Math.cos(a) * r * 0.86, 880 + Math.sin(a) * r * 1.02];
};
const layoutSym = (i: number): [number, number] => {
  const [x, y] = BASE[i];
  return [x < 540 ? x : 1080 - (1080 - x), y];
};

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext('2d'); if (!g) return;
    g.clearRect(0, 0, W, H);

    const gr = ground(t);

    /* ── STATE ────────────────────────────────────────────────────────────────────────────────
       Every number below is a function of story time, so the background can never disagree with
       the foreground about which phase the film is in. */
    const toMarket = clamp01((t - B(37)) / 1.5);
    const toBroad = clamp01((t - B(46)) / 2.0);
    const toCalm = clamp01((t - B(58)) / 1.8);
    const toSym = clamp01((t - B(70)) / 1.6);

    /* flow direction: +1 = left-to-right (debit), -1 = right-to-left (the false incoming).
       It does not cut. It is DRAGGED through zero at the snap, which is what makes the whole
       field visibly change its mind. */
    const dir = t < CUE.load ? -1
      : t < CUE.snap ? lerp(-1, 0, clamp01((t - BK.from) / BK.span))
        : lerp(0, 1, clamp01((t - CUE.snap) / 0.42));

    /* energy: the ONE dial that keeps the background subordinate. It collapses at "however" —
       this is the drop in stimulation the spec asks for, and it is done by taking the world's
       energy away rather than by freezing frames. */
    let energy = 1;
    if (t > CUE.however) energy = lerp(1, 0.16, clamp01((t - CUE.however) / 0.34));
    if (t > CUE.snap) energy = lerp(0.16, 1.35, clamp01((t - CUE.snap) / 0.5));
    if (t > B(35)) energy = lerp(1.35, 0.8, clamp01((t - B(35)) / 1.6));
    if (t > B(58)) energy = lerp(0.8, 0.42, clamp01((t - B(58)) / 2.0));
    if (t > B(71)) energy = lerp(0.42, 0.5, clamp01((t - B(71)) / 1.0));

    /* node positions */
    const px = new Float32Array(N), py = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let [x, y] = BASE[i];
      const m = layoutMarket(i), b = layoutBroad(i), s = layoutSym(i);
      x = lerp(x, m[0], ease.inOut(toMarket) * (1 - toBroad));
      y = lerp(y, m[1], ease.inOut(toMarket) * (1 - toBroad));
      x = lerp(x, b[0], ease.inOut(toBroad) * (1 - toSym));
      y = lerp(y, b[1], ease.inOut(toBroad) * (1 - toSym));
      x = lerp(x, s[0], ease.inOut(toSym)); y = lerp(y, s[1], ease.inOut(toSym));
      /* ambient drift: offset loops, never synchronised — the field breathes, it does not bob */
      const ph = hash01(i, 7) * Math.PI * 2, sp2 = 0.5 + hash01(i, 13) * 0.55;
      x += Math.sin(t * sp2 + ph) * 2.4 * energy;
      y += Math.cos(t * sp2 * 0.82 + ph * 1.7) * 2.0 * energy;
      /* the snap shoves the whole field outward from the phone, then it recovers */
      const k = Math.exp(-3.4 * Math.max(0, t - CUE.snap)) * (t > CUE.snap ? 1 : 0);
      if (k > 0.001) {
        const dx = x - 540, dy = y - 900, d = Math.hypot(dx, dy) || 1;
        x += (dx / d) * 26 * k; y += (dy / d) * 26 * k;
      }
      px[i] = x; py[i] = y;
    }

    /* ── EDGES ── */
    const fade = 1 - toCalm * 0.45;
    g.lineWidth = 1.4;
    for (let e = 0; e < EDGES.length; e++) {
      const [i, j] = EDGES[e];
      const x1 = px[i], y1 = py[i], x2 = px[j], y2 = py[j];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len > 420) continue;                       // a stretched layout must not web the frame
      const near = 1 - clamp01((Math.abs((y1 + y2) / 2 - 900) - 300) / 900);
      const a = (0.05 + near * 0.05) * fade;
      g.strokeStyle = `rgba(140,168,235,${a.toFixed(3)})`;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();

      /* PULSES — the flow. One per edge, phase-offset by edge identity so nothing marches. */
      const seed = hash01(e, 3);
      const speed = 0.24 + seed * 0.2;
      let u = (t * speed * energy + seed) % 1;
      if (dir < 0) u = 1 - u;
      else if (dir === 0) u = seed;                  // at the turn, the field simply stops
      const bias = Math.abs(dir);
      if (bias > 0.05) {
        const cx = lerp(x1, x2, u), cy = lerp(y1, y2, u);
        const col = t < CUE.fold ? gr.accent : t < CUE.snap ? C.amber : C.red;
        const pa = 0.34 * bias * fade * clamp01(energy);
        g.fillStyle = hexA(col, pa);
        g.beginPath(); g.arc(cx, cy, 2.6, 0, 6.2832); g.fill();
      }
    }

    /* ── NODES ── */
    for (let i = 0; i < N; i++) {
      const r = 2.2 + hash01(i, 31) * 2.4;
      const lit = 0.10 + 0.10 * (0.5 + 0.5 * Math.sin(t * (0.7 + hash01(i, 5)) + hash01(i, 9) * 6.28));
      g.fillStyle = hexA(gr.accent, lit * fade * (0.5 + 0.5 * clamp01(energy)));
      g.beginPath(); g.arc(px[i], py[i], r, 0, 6.2832); g.fill();
    }

    /* ── AMBIENT MOTES ───────────────────────────────────────────────────────────────────────
       Depth, not confetti: one mote crosses a plane roughly every 0.5s, foreground faster and
       larger, and the whole field thins to nothing at the reveal so it cannot compete. */
    const MOTES = 46;
    const thin = clamp01(energy) * (t > CUE.however && t < CUE.snap ? 0.22 : 1);
    for (let i = 0; i < MOTES; i++) {
      const plane = i % 3;                                  // 0 rear, 1 mid, 2 fore
      const sp2 = (0.028 + plane * 0.032) * (1 + hash01(i, 41) * 0.5);
      const u = ((t * sp2 * (dir < 0 ? 1 : -1) * energy) + hash01(i, 17)) % 1;
      const uu = u < 0 ? u + 1 : u;
      const x = dir < 0 ? lerp(1140, -60, uu) : lerp(-60, 1140, uu);
      const y = 90 + hash01(i, 53) * 1560 + Math.sin(t * 0.7 + i) * (6 + plane * 5);
      const a = (0.05 + plane * 0.055) * thin * fade;
      if (a < 0.004) continue;
      g.fillStyle = hexA(t < CUE.fold ? C.green : t < CUE.snap ? C.amber : C.red, a);
      g.beginPath(); g.arc(x, y, 1.8 + plane * 1.5, 0, 6.2832); g.fill();
    }
  }, [frame, t]);

  const gr = ground(t);
  /* the vignette and floor are painted, not filtered — no full-frame blur anywhere in this film */
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 80% at 50% 18%, ${gr.high} 0%, ${gr.deep} 62%, #070B1B 100%)`,
      }} />
      <canvas ref={ref} width={W} height={H}
        style={{ position: 'absolute', inset: 0, width: W, height: H }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, top: LAYOUT.deadY - 60, bottom: 0,
        background: `linear-gradient(to bottom, rgba(7,11,27,0) 0%, rgba(7,11,27,0.55) 55%, rgba(7,11,27,0.85) 100%)`,
      }} />
    </>
  );
};

export function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
