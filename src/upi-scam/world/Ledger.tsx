/* THE LEDGER — what is actually happening, drawn above what the victim sees.
 *
 * YOU on the left, the other party on the right, for the whole film. That geography is taught in
 * the first two seconds and never broken, which is the only reason the reversal can feel like a
 * betrayal rather than a graphic. The flow between them is ONE elastic object with a continuous
 * life: it grows out of the scammer node, runs inbound and green, loads, folds through its own
 * tail, and snaps outbound and red. It is never destroyed and rebuilt.
 *
 * Greyscale survival (premortem F4): the reveal is carried by DIRECTION (the head crosses the
 * frame), SHAPE (a soft chevron becomes a barbed point), SIGN (+ becomes -), the BALANCE, and
 * POSITION (the tokens end up inside the other node) — colour is the fifth channel, not the only.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  C, FPS, LAYOUT, T, betrayal, clamp01, ease, hash01, impact, lerp, shadow, sp, tracking,
  mix,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { hexA } from './Backdrop';

const { ledger } = LAYOUT;
const XA = ledger.left + ledger.nodeR + 10;      // ribbon end at YOU
const XB = ledger.right - ledger.nodeR - 10;     // ribbon end at THEM
const Y = ledger.y;

/* ── the ribbon: sampled centreline, offset both ways, so it can bow, taper and compress ──── */
function ribbon(x0: number, x1: number, bow: number, w0: number, w1: number) {
  const S = 26, top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= S; i++) {
    const u = i / S;
    const x = lerp(x0, x1, u);
    const y = Y + Math.sin(u * Math.PI) * bow;
    const w = lerp(w0, w1, u) / 2;
    top.push(`${x.toFixed(1)},${(y - w).toFixed(1)}`);
    bot.push(`${x.toFixed(1)},${(y + w).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`;
}

/* head shapes. `barb` 0 = the soft, friendly chevron of the lie; 1 = the barbed point of the
   truth. Interpolated, so the head visibly hardens as the colour walks. */
function head(x: number, y: number, dirSign: number, size: number, barb: number) {
  const d = dirSign, L = size * (1 - barb * 0.18), Wd = size * (0.92 - barb * 0.2);
  const backIn = barb * size * 0.42;                       // concave back edge = the barb
  return `M${x + d * L},${y}`
    + `L${x - d * (L * 0.55)},${y - Wd}`
    + `L${x - d * (L * 0.55 - backIn)},${y}`
    + `L${x - d * (L * 0.55)},${y + Wd}Z`;
}

export const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  /* ── the ribbon's life ─────────────────────────────────────────────────────────────────── */
  const grow = clamp01((t - CUE.requestLaunch) / 0.85);                 // vector path growth
  const L = paced(CUE.load, CUE.fold, 0.28), Fo = paced(CUE.fold, CUE.snap, 2.18);
  const load = clamp01((t - L.from) / L.span);                          // elastic compression
  const fold = clamp01((t - Fo.from) / Fo.span);                        // head crosses, colour walks
  const snap = clamp01((t - CUE.snap) / 0.30);
  const settle = clamp01((t - CUE.snap) / 1.5);

  /* colour and shape walk together, both driven by `fold`, so they can never disagree */
  const p = Math.max(fold * 0.86, snap);
  const haze = clamp01((t - B(36)) / 1.8) * 0.62;
  const col = mix(betrayal(p), '#31427A', haze);
  const barb = ease.out(p);

  /* compression stores energy: the ribbon gets SHORTER and FATTER, then releases past its rest
     length at the snap and settles back. This is the one place in the film where an object
     overshoots by more than a couple of percent, because it is the one place that is a release. */
  const squeeze = load * 0.085 - snap * 0.05 + (1 - ease.out(settle)) * 0.0;
  const over = snap * (1 - ease.out(clamp01((t - CUE.snap) / 0.55))) * 0.06;
  const span = (XB - XA) * (1 - squeeze + over);
  const mid = (XA + XB) / 2;
  const x0 = mid - span / 2, x1 = mid + span / 2;
  const bow = load * 16 - snap * 8 + impact(t, CUE.snap, 10, 6, 7);

  /* the head's journey: sits at YOU while the lie holds, crosses to THEM through the fold */
  const hp = ease.inOut(fold);
  /* while the ribbon is still growing, the head IS the growing tip — an arrowhead waiting at the
     destination for a line that has not reached it yet is the clearest possible tell of a
     pre-built asset being revealed rather than an object being drawn. */
  const growTip = lerp(x1, x0, ease.out(grow));
  const hx = grow < 1 ? Math.max(x0, growTip) : lerp(x0, x1, hp);
  const dirSign = hp < 0.5 ? -1 : 1;                          // which way the point faces
  const thick = lerp(21, 30, load) * (1 + snap * 0.25);

  /* growth reveal, right-to-left: the ribbon is drawn from the scammer node toward the user */
  const gx0 = lerp(x1, x0, ease.out(grow));
  const visible = grow > 0.01;

  const bal = balance(t);
  /* every inbound token that reaches YOU gives the node a small knock: the arrivals are what
     make the illusion feel like it is happening TO someone */
  let youKick = impact(t, CUE.snap, 9, 8, 10) + impact(t, CUE.absorb, 3, 7, 9);
  if (t > B(7) && t < CUE.however) {
    for (let i = 0; i < 9; i++) {
      const seed = hash01(i, 137), speed = 0.30 + (i % 3) * 0.10 + seed * 0.08;
      const k = Math.floor((t - B(7)) * speed + seed);
      const arrive = B(7) + (k + 1 - seed) / speed;
      youKick += impact(t, arrive, 2.4, 9, 13);
    }
  }
  const themKick = impact(t, CUE.absorb, 11, 7.5, 8) + impact(t, CUE.requestLaunch, 5, 8, 10);
  const contract = clamp01((t - CUE.balanceRoll) / 0.6) * (1 - clamp01((t - B(36)) / 1.4));

  return (
    <g>
      <defs>
        <linearGradient id="rib" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={col} stopOpacity={hp < 0.5 ? 0.30 : 0.95} />
          <stop offset="100%" stopColor={col} stopOpacity={hp < 0.5 ? 0.95 : 0.30} />
        </linearGradient>
        <radialGradient id="glowY"><stop offset="0%" stopColor={C.teal} stopOpacity="0.30" />
          <stop offset="100%" stopColor={C.teal} stopOpacity="0" /></radialGradient>
      </defs>

      {/* The rail the flow lives on — drawn before anything travels it, so travel has a road. It
          now REACHES: it runs out from the scammer toward you across the film's first fifth of a
          second and completes exactly as the request is launched along it, so the opening reads as
          a connection being made and then used, rather than a diagram that was always there. */}
      <path d={ribbon(lerp(XB - 14, XA, ease.out(clamp01(t / CUE.requestLaunch))), XB, 0, 5, 5)}
        fill={hexA('#8CA8EB', 0.13)} />

      {visible && (
        <g>
          <path d={ribbon(gx0, x1, bow, thick * 0.45, thick)} fill="url(#rib)" />
          <path d={head(hx, Y + Math.sin(hp * Math.PI) * bow, dirSign, 34 + snap * 9, barb)}
            fill={col} style={{ filter: `drop-shadow(${shadow(6, 0.5)})` }} />
          <RibbonFlow t={t} x0={gx0} x1={x1} col={col} hp={hp} />
          <Inbound t={t} x0={x0} x1={x1} />
        </g>
      )}


      {/* ── YOU ──────────────────────────────────────────────────────────────────────────── */}
      <g transform={`translate(${ledger.left + youKick * 0.5} ${Y}) scale(${1 - contract * 0.07})`}>
        <circle r={ledger.nodeR + 26} fill="url(#glowY)" />
        <circle r={ledger.nodeR} fill="#16204A" stroke={hexA(C.teal, 0.75)} strokeWidth={3} />
        <Person y={-4} s={1} tone={C.teal} />
        <text y={ledger.nodeR + 46} textAnchor="middle" fill={C.ink}
          style={{ font: `800 ${T.small}px ${T.face}`, ...tracking(4) }}>YOU</text>
        <g transform={`translate(0 ${ledger.nodeR + 96})`}>
          <rect x={-114} y={-34} width={228} height={64} rx={18}
            fill="#0D1533" stroke={hexA(bal.dropping ? C.red : '#8CA8EB', bal.dropping ? 0.7 : 0.26)}
            strokeWidth={2} />
          <Odometer value={bal.value} roll={bal.dropping ? 1 : 0} y={11} fill={bal.dropping ? C.red : C.ink} />
        </g>
      </g>

      {/* ── THEM ─────────────────────────────────────────────────────────────────────────── */}
      <g transform={`translate(${ledger.right + themKick * 0.6} ${Y})`}>
        <circle r={ledger.nodeR * (1 + clamp01((t - CUE.absorb) / 0.7) * 0.10)}
          fill="#1C1533" stroke={hexA(p > 0.5 ? C.red : '#8CA8EB', 0.4 + p * 0.5)} strokeWidth={3} />
        <Unknown t={t} p={p} />
        <text y={ledger.nodeR + 46} textAnchor="middle" fill={p > 0.6 ? C.red : C.grey}
          style={{ font: `700 ${T.micro}px ${T.mono}`, ...tracking(2) }}>buyer@upi</text>
      </g>
    </g>
  );
};

/* internal flow particles — direction is the message, so they are never omitted while the
   ribbon is visible, and they stop dead during the held breath rather than reversing early. */
const RibbonFlow: React.FC<{ t: number; x0: number; x1: number; col: string; hp: number }> =
  ({ t, x0, x1, col, hp }) => {
    const frozen = t > CUE.however && t < CUE.snap;
    const dir = hp < 0.5 ? -1 : 1;
    const dots = [];
    for (let i = 0; i < 11; i++) {
      const s = hash01(i, 71);
      let u = frozen ? s : ((t * (0.30 + s * 0.14) * (dir < 0 ? -1 : 1)) + s) % 1;
      if (u < 0) u += 1;
      const x = lerp(x0, x1, u);
      const jitter = (hash01(i, 91) - 0.5) * 13;
      dots.push(<circle key={i} cx={x} cy={LAYOUT.ledger.y + jitter} r={4.6}
        fill={col} opacity={frozen ? 0.25 : 0.8} />);
    }
    return <g>{dots}</g>;
  };

/* ── THE ILLUSION ────────────────────────────────────────────────────────────────────────────
   The money that appears to be arriving. Without this the first six seconds are a card sitting on
   a phone, and the reveal has nothing to reverse: the viewer has to BELIEVE money is coming in,
   because the whole film is the correction of that belief.
   Three depth planes, right to left, each token arriving at the YOU node and making it pulse —
   cause, then reaction. It thins once the PIN is being entered (foreshadow, not reveal) and is
   gone by the fold, because by then the truth is taking the same road. */
const Inbound: React.FC<{ t: number; x0: number; x1: number }> = ({ t, x0, x1 }) => {
  const on = clamp01((t - B(7) + 0.25) / 0.5)
    * (1 - 0.45 * clamp01((t - B(21)) / 0.6))          // weakens on PIN tap 3
    * (1 - clamp01((t - CUE.however) / 0.45));         // and is gone before the turn
  if (on <= 0.02) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const plane = i % 3;
    const seed = hash01(i, 137);
    const speed = 0.30 + plane * 0.10 + seed * 0.08;
    let u = ((t - B(7)) * speed + seed) % 1;
    if (u < 0) u += 1;
    const x = lerp(x1, x0, u);
    const y = LAYOUT.ledger.y + (plane - 1) * 38 + Math.sin(u * 5 + seed * 6) * 5;
    const r = 13 + plane * 5;
    out.push(
      <g key={i} transform={`translate(${x} ${y})`} opacity={on * (0.5 + plane * 0.22)}>
        <circle r={r} fill={C.green} stroke="#06301A" strokeWidth={2.5} />
        <text y={r * 0.44} textAnchor="middle" fill="#06301A"
          style={{ font: `900 ${r * 1.3}px ${T.face}` }}>₹</text>
      </g>,
    );
  }
  return <g>{out}</g>;
};

/* ── the four hero tokens ────────────────────────────────────────────────────────────────────
   These ARE the PIN dots. They leave the phone at `dotsBecomeMoney`, arc up into the ledger, run
   the ribbon and are absorbed one at a time. Varied launch angles, varied spin, varied speed —
   one trajectory cloned four times is the clearest possible tell of template motion. */
export const Tokens: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const t0 = CUE.dotsBecomeMoney + 0.05 + i * 0.055;
    const flight = 1.18 + hash01(i, 5) * 0.24;
    const u = clamp01((t - t0) / flight);
    if (u <= 0 || u >= 1) continue;
    const sx = 386 + i * 76, sy = 1006;                       // where the PIN dots sit
    const ex = LAYOUT.ledger.right, ey = LAYOUT.ledger.y;
    /* STAGE 1 (u<0.30): straight up and out of the phone, clearing the card.
       STAGE 2: the crossing, left to right, on its own ballistic arc. */
    const lift = clamp01(u / 0.30), cross = clamp01((u - 0.30) / 0.70);
    const mx = sx + (hash01(i, 61) - 0.5) * 46, my = 470 - hash01(i, 17) * 90;
    const le = ease.out(lift), ce = ease.inOut(cross);
    const x = cross <= 0 ? lerp(sx, mx, le) : lerp(mx, ex, ce);
    const apex = -70 - hash01(i, 17) * 70;
    const y = cross <= 0 ? lerp(sy, my, le)
      : lerp(my, ey, ce) + Math.sin(cross * Math.PI) * apex * (1 - i * 0.08);
    const spin = (hash01(i, 29) - 0.5) * 900 * u + u * 260;
    const sc = lerp(1.15, 0.82, u);
    const pu = clamp01(u - 0.055);
    const pl = clamp01(pu / 0.30), pc = clamp01((pu - 0.30) / 0.70);
    const ple = ease.out(pl), pce = ease.inOut(pc);
    const px2 = pc <= 0 ? lerp(sx, mx, ple) : lerp(mx, ex, pce);
    const py2 = pc <= 0 ? lerp(sy, my, ple)
      : lerp(my, ey, pce) + Math.sin(pc * Math.PI) * apex * (1 - i * 0.08);
    out.push(
      <g key={`tr${i}`}>
        <line x1={px2} y1={py2} x2={x} y2={y} stroke={C.red} strokeWidth={9}
          strokeLinecap="round" opacity={0.28 * Math.sin(u * Math.PI)} />
      </g>);
    out.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${spin}) scale(${sc})`}>
        <circle r={31} fill={C.red} style={{ filter: `drop-shadow(${shadow(7, 0.5)})` }} />
        <circle r={31} fill="none" stroke="#FFC2CE" strokeWidth={2.5} opacity={0.5} />
        <text y={16} textAnchor="middle" fill="#2A0410"
          style={{ font: `900 ${T.label}px ${T.face}` }}>₹</text>
      </g>,
    );
  }
  return <g>{out}</g>;
};

/* ── balance ─────────────────────────────────────────────────────────────────────────────────
   DATA CHANGE -> VISIBLE SYSTEM CHANGE -> NUMBER CHANGE. The number moves only after the tokens
   have physically left, and it rolls mechanically; it never dissolves or counts. */
function balance(t: number) {
  const roll = clamp01((t - CUE.balanceRoll) / 0.75);
  const v = lerp(12300, 3850, ease.inOut(roll));
  return { value: v, dropping: roll > 0.02 && roll < 1, done: roll >= 1 };
}

/* A real odometer has FIXED COLUMNS. Formatting the live value as a string gave it moving
   columns — the comma walked left as 12,300 fell below 10,000 and the number was unreadable at
   the one moment it has to be read. Columns here are positional: units, tens, hundreds, a comma,
   thousands, ten-thousands. Each wheel turns at its own rate, which is what makes it mechanical,
   and a leading zero shows as blank rather than as "0". */
const Odometer: React.FC<{ value: number; roll: number; y: number; fill: string }> =
  ({ value, roll, y, fill }) => {
    const cw = 30;
    const slots: ({ k: number } | { c: string })[] =
      [{ k: 4 }, { k: 3 }, { c: ',' }, { k: 2 }, { k: 1 }, { k: 0 }];
    const total = (slots.length + 1) * cw;
    const font = `800 ${T.body}px ${T.mono}`;
    return (
      <g transform={`translate(${-total / 2} 0)`}>
        <text x={cw / 2} y={y} textAnchor="middle" fill={fill} style={{ font }}>₹</text>
        {slots.map((sl, i) => {
          const cx = (i + 1) * cw + cw / 2;
          if ('c' in sl)
            return <text key={i} x={cx} y={y} textAnchor="middle" fill={fill} style={{ font }}>,</text>;
          const p10 = Math.pow(10, sl.k);
          const exact = value / p10;
          const d = Math.floor(exact) % 10;
          const off = roll > 0.001 ? exact - Math.floor(exact) : 0;
          if (value < p10 && roll <= 0.001) return null;      // blank, not "0"
          return (
            <g key={i}>
              <clipPath id={`od${sl.k}`}>
                <rect x={cx - cw / 2} y={y - 35} width={cw} height={45} />
              </clipPath>
              <g clipPath={`url(#od${sl.k})`}>
                <text x={cx} y={y + off * 45} textAnchor="middle" fill={fill} style={{ font }}>{d}</text>
                {off > 0.01 && (
                  <text x={cx} y={y + off * 45 - 45} textAnchor="middle" fill={fill} style={{ font }}>
                    {(d + 1) % 10}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>
    );
  };

const Person: React.FC<{ y: number; s: number; tone: string }> = ({ y, s, tone }) => (
  <g transform={`translate(0 ${y}) scale(${s})`} fill={tone}>
    <circle cy={-15} r={14} />
    <path d="M-25,24 A25,25 0 0 1 25,24 L25,28 L-25,28 Z" />
  </g>
);

const Unknown: React.FC<{ t: number; p: number }> = ({ t, p }) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  return (
    <g>
      <circle r={30} fill="none" stroke={hexA(p > 0.6 ? C.red : C.lavender, 0.35 + pulse * 0.2)}
        strokeWidth={3} strokeDasharray="9 11" transform={`rotate(${t * 26})`} />
      <text y={14} textAnchor="middle" fill={p > 0.6 ? C.red : C.lavender}
        style={{ font: `800 ${T.label}px ${T.face}` }}>?</text>
    </g>
  );
};
