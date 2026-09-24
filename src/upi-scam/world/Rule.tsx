/* THE RULE — one object, in three states, each one arriving when the narration reaches it.
 *
 *   1. a card on the phone        it slides between the parent's finger and Approve, bends the
 *                                 misleading arrow on its edge, and assembles RECEIVE -> NO PIN
 *   2. forward, alone             on "…pin TO 'receive' money" it leaves the phone's plane and
 *                                 comes toward camera, centred and large, because it is now the
 *                                 subject of the sentence rather than an overlay on a device
 *   3. the comparison             only on "ONLY to send it" does SEND exist: RECEIVE steps left
 *                                 to make room and SEND arrives from the right
 *
 * It is never replaced. The panel you read at the end is the card that stopped the tap, twice
 * enlarged. Directional law holds in both halves: the user sits on the panel's own left and the
 * world on its right, exactly as in the ledger, so RECEIVE flows toward its user and SEND away.
 */
import React from 'react';
import { C, T, clamp01, ease, impact, lerp, mix, shadow, tracking } from '../design';
import { B, CUE, paced } from '../timeline';
import { hexA } from './Backdrop';

const CARD = { x: 316, y: 596, w: 448, h: 400 };     // on the phone
const SOLO = { x: 126, y: 462, w: 828, h: 812 };     // forward, alone
const LEFT = { x: 52, y: 414, w: 486, h: 872 };      // the comparison
const RIGHT = { x: 558, y: 414, w: 486, h: 872 };

const box = (a: typeof CARD, b: typeof CARD, u: number) => ({
  x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u),
  w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u),
});

export const Rule: React.FC<{ t: number; stage: { s: number; x: number; y: number } }> =
  ({ t, stage }) => {
    const slide = clamp01((t - CUE.ruleCard) / 0.42);
    if (slide <= 0) return null;
    /* forward: a heavier, slower move than the card's own arrival — it is a bigger object now */
    const fwd = ease.inOut(clamp01((t - CUE.receiveForward) / 0.72));
    const pair = ease.inOut(clamp01((t - CUE.sendIn) / 0.62));
    const e = ease.out(slide);

    const b = pair > 0 ? box(SOLO, LEFT, pair) : box(CARD, SOLO, fwd);
    /* while it is a card it lives in the phone's coordinate frame; as it comes forward it takes
       over the world's. Blending the transform is what makes it read as the same object moving
       toward camera rather than a new graphic appearing in front of one. */
    const ss = lerp(stage.s, 1, fwd), sx = stage.x * (1 - fwd), sy = stage.y * (1 - fwd);
    const enterX = lerp(-520, 0, e);
    const kick = impact(t, CUE.ruleCard + 0.34, 5, 8, 11);
    /* the swell as it comes at the lens, and a matching settle */
    const swell = 1 + 0.035 * Math.sin(clamp01((t - CUE.receiveForward) / 0.72) * Math.PI);
    const g = Math.max(fwd, pair * 0.92);            // how "big" the layout should read

    return (
      <g transform={`translate(${540 + sx} ${950 + sy}) scale(${ss}) translate(-540 -950) `
        + `translate(${(enterX + kick) / ss} 0)`} opacity={Math.min(1, slide * 1.6)}>
        {/* a backing behind BOTH halves. Without it the 20px divider between them is a window
            onto the device parked behind, and a bright sliver of app bar shows through the
            film's conclusion. */}
        {pair > 0.02 && (
          <rect x={LEFT.x - 10} y={LEFT.y - 10} opacity={pair}
            width={RIGHT.x + RIGHT.w + 10 - (LEFT.x - 10)} height={LEFT.h + 20} rx={46}
            fill="#080C1E" />
        )}
        {pair > 0.02 && <Send t={t} pair={pair} />}
        <g transform={`translate(${b.x + b.w / 2} ${b.y + b.h / 2}) scale(${swell}) `
          + `translate(${-(b.x + b.w / 2)} ${-(b.y + b.h / 2)})`}>
          <g style={{ filter: `drop-shadow(${shadow(lerp(20, 40, g), 0.52)})` }}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={lerp(26, 40, g)} fill="#0D1534"
              stroke={hexA(C.teal, lerp(0.7, 0.42, g))} strokeWidth={3} />
          </g>
          <Receive t={t} b={b} g={g} />
        </g>
      </g>
    );
  };

/* ── RECEIVE ────────────────────────────────────────────────────────────────────────────────*/
const Receive: React.FC<{ t: number; b: typeof CARD; g: number }> = ({ t, b, g }) => {
  const a1 = clamp01((t - CUE.ruleCard - 0.14) / 0.28);
  const a2 = clamp01((t - CUE.ruleCard - 0.44) / 0.3);
  const a3 = clamp01((t - B(66)) / 0.3);
  /* THE NEGATION. A thin line laid over an unchanged keypad is an annotation, not an event — in a
     film where everything else arrives with mass it was the one mark that merely appeared, it left
     its target untouched, and it only clipped a corner of the grid. So: the prohibition mark, drawn.
     The ring sweeps closed around the pad, the bar drives through it and LANDS, and the pad dies
     under it. Being a closed form the ring owns the whole pad instead of crossing part of it. */
  const ring = ease.out(clamp01((t - B(66) - 0.10) / 0.34));
  const bar = ease.out(clamp01((t - B(66) - 0.46) / 0.16));
  const HIT = B(66) + 0.60;
  const jolt = impact(t, HIT, 4.5, 8, 10);          // the pad reacts to being struck
  /* inert, not erased: dimmed all the way to the panel's own value the pad vanishes and the mark
     ends up encircling nothing. It has to stay legible as the thing being refused. */
  const dead = ease.out(clamp01((t - HIT) / 0.30)) * 0.55;
  const lab = ease.out(clamp01((t - B(66) - 0.76) / 0.30));
  const R = lerp(40, 116, g), SW = lerp(5, 13, g);
  const CIRC = 2 * Math.PI * R, DIAG = R * Math.SQRT1_2;
  const emph = 1 + Math.max(0, impact(t, CUE.noPin, 0.062, 5, 9));
  const cx = b.x + b.w / 2;
  const f = flow(t).a;
  return (
    <g>
      <text x={cx} y={b.y + lerp(72, 116, g)} textAnchor="middle" fill={C.ink} opacity={a1}
        style={{ font: `800 ${lerp(34, 60, g)}px ${T.face}`, ...tracking(6) }}>RECEIVE</text>
      <g opacity={a2} transform={`translate(${cx} ${b.y + lerp(186, 348, g)})`}>
        <Node x={-lerp(112, 178, g)} label="YOU" tone={C.teal} s={lerp(0.66, 1.04, g)} />
        <Node x={lerp(112, 158, g)} label="THEM" tone={C.grey} s={lerp(0.66, 1.04, g)} dim />
        <Arrow from={lerp(80, 122, g)} to={-lerp(80, 140, g)} col={C.green} phase={f}
          barb={0} flowT={t} w={lerp(7, 11, g)} />
      </g>
      <g opacity={a3} transform={`translate(${cx} ${b.y + lerp(308, 586, g)}) scale(${emph})`}>
        {/* the digits are on: you cannot forcefully negate a pad the viewer has not read as a PIN
            pad, and this side had been a grid of blank blobs while SEND carried its numbers */}
        <g transform={`translate(${jolt} ${jolt * 0.5})`}>
          <Keyglyph s={lerp(0.52, 1.5, g)} live dim={dead} />
        </g>
        <circle r={R} fill="none" stroke={C.red} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - ring)} transform="rotate(-90)" />
        {bar > 0 && (
          <line x1={-DIAG} y1={DIAG} x2={lerp(-DIAG, DIAG, bar)} y2={lerp(DIAG, -DIAG, bar)}
            stroke={C.red} strokeWidth={SW} strokeLinecap="round" />
        )}
        {/* clear of the ring: the mark and the words must not sit on top of each other */}
        <text y={lerp(86, 196, g) + (1 - lab) * lerp(6, 16, g)} textAnchor="middle" fill={C.green}
          opacity={lab} style={{ font: `900 ${lerp(38, 82, g)}px ${T.face}`, ...tracking(3) }}>
          NO PIN</text>
      </g>
    </g>
  );
};

/* ── SEND ───────────────────────────────────────────────────────────────────────────────────
   It does not exist until the last sentence begins, and when it does it is not a diagram. A PIN
   is entered on it — key by key, with NO HAND, because the sentence is about what a screen asks
   for, not about who is holding the phone — and then the payment SUCCEEDS: the tick draws exactly
   the way a real UPI payment's does. The tick is green, because that is what the app shows. The
   money that leaves a beat later is red. That contradiction is the whole sentence. */
const Send: React.FC<{ t: number; pair: number }> = ({ t, pair }) => {
  const b = RIGHT;
  const dx = (1 - pair) * 620;
  const cx = b.x + b.w / 2;
  const f = flow(t).b;

  /* four keys, evenly spaced between the two measured words that bracket the entry */
  /* four keys at a typing speed, landing on the beat the tick answers — a slower read gives the
     hand longer to arrive, never a slower hand */
  const K = paced(CUE.pinEntry, CUE.pinDone, 1.26);
  const step = K.span / 3;
  const keyAt = (i: number) => K.from + i * step;
  const typed = PIN_DEMO.filter((_, i) => t >= keyAt(i));
  const lit = PIN_DEMO.filter((_, i) => t >= keyAt(i) && t < keyAt(i) + 0.19);

  const paid = clamp01((t - CUE.paid) / 0.52);
  const collapse = ease.inOut(clamp01((t - CUE.paid) / 0.34));

  return (
    <g transform={`translate(${dx} 0)`} opacity={Math.min(1, pair * 2.2)}>
      <g style={{ filter: `drop-shadow(${shadow(40, 0.52)})` }}>
        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={40} fill="#180F2C"
          stroke={hexA(C.orange, 0.42)} strokeWidth={3} />
      </g>
      <text x={cx} y={b.y + 116} textAnchor="middle" fill={C.ink}
        style={{ font: `800 60px ${T.face}`, ...tracking(6) }}>SEND</text>
      <g transform={`translate(${cx} ${b.y + 340})`}>
        <Node x={-158} label="YOU" tone={C.teal} s={1.04} />
        <Node x={178} label="THEM" tone={C.grey} s={1.04} dim />
        <Arrow from={-122} to={140} col={C.orange} phase={f} barb={1} flowT={t + 1.19} w={11} />
      </g>

      {/* the PIN going in */}
      {collapse < 1 && (
        <g opacity={1 - collapse} transform={`translate(0 ${-collapse * 40})`}>
          {PIN_DEMO.map((_, i) => (
            <circle key={i} cx={cx - 75 + i * 50} cy={b.y + 442} r={16}
              fill={t >= keyAt(i) ? C.orange : 'none'}
              stroke={hexA('#A8BEF2', 0.5)} strokeWidth={3} />
          ))}
          <g transform={`translate(${cx} ${b.y + 610})`}>
            <Keyglyph s={1.5} lit={lit} live />
          </g>
        </g>
      )}

      {/* PAID — the tick draws, the way a real one does */}
      {paid > 0 && <Tick t={t} cx={cx} cy={b.y + 592} p={paid} />}
      {paid > 0.25 && (
        <g opacity={clamp01((paid - 0.25) / 0.3)}>
          <text x={cx} y={b.y + 760} textAnchor="middle" fill={C.ink}
            style={{ font: `800 56px ${T.face}`, ...tracking(5) }}>PAID</text>
          <text x={cx} y={b.y + 818} textAnchor="middle" fill={C.orange}
            style={{ font: `800 42px ${T.face}` }}>− ₹8,450</text>
        </g>
      )}
      {/* and the money goes */}
      <OutMoney t={t} cx={cx} cy={b.y + 340} />
    </g>
  );
};

/* the success tick: a ring sweeps closed, then the check strokes on. Both are drawn, not faded —
   this is the one moment in the film that quotes a real interface exactly. */
const Tick: React.FC<{ t: number; cx: number; cy: number; p: number }> = ({ cx, cy, p }) => {
  const ring = clamp01(p / 0.45);
  const check = clamp01((p - 0.34) / 0.42);
  const R = 74, CIRC = 2 * Math.PI * R;
  const CHECK_LEN = 118;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${lerp(0.86, 1, ease.out(p))})`}>
      <circle r={R} fill="none" stroke={hexA(C.green, 0.22)} strokeWidth={9} />
      <circle r={R} fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round"
        strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - ease.inOut(ring))}
        transform="rotate(-90)" />
      <path d="M-32,2 L-11,24 L34,-24" fill="none" stroke={C.green} strokeWidth={11}
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={CHECK_LEN} strokeDashoffset={CHECK_LEN * (1 - ease.out(check))} />
    </g>
  );
};

/* the consequence, one beat later: the same amount leaving, in the colour the film has spent
   thirty seconds teaching */
const OutMoney: React.FC<{ t: number; cx: number; cy: number }> = ({ t, cx, cy }) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const u = clamp01((t - (CUE.moneyOut + i * 0.11)) / 0.72);
    if (u <= 0 || u >= 1) continue;
    const e = ease.inOut(u);
    const x = cx + lerp(-122, 150, e);
    const y = cy + Math.sin(u * Math.PI) * (-34 - i * 12);
    out.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${u * 260 + i * 40})`}>
        <circle r={19} fill={C.red} />
        <text y={10} textAnchor="middle" fill="#2A0410"
          style={{ font: `900 26px ${T.face}` }}>₹</text>
      </g>,
    );
  }
  return <g>{out}</g>;
};

/* the replay: inward first, outward 150ms later; otherwise both breathe */
function flow(t: number) {
  const loop = (t * 0.5) % 1;
  const r = t - CUE.replay;
  if (r > 0 && r < 0.9) return { a: clamp01(r / 0.55), b: clamp01((r - 0.15) / 0.55) };
  if (r >= 0.9 && r < 1.35) {
    const u = ease.inOut((r - 0.9) / 0.45);
    return { a: lerp(1, loop, u), b: lerp(1, (loop + 0.5) % 1, u) };
  }
  return { a: loop, b: (loop + 0.5) % 1 };
}

const Node: React.FC<{ x: number; label: string; tone: string; s: number; dim?: boolean }> =
  ({ x, label, tone, s, dim }) => (
    <g transform={`translate(${x} 0) scale(${s})`} opacity={dim ? 0.62 : 1}>
      <circle r={38} fill="#0A1030" stroke={hexA(tone, 0.82)} strokeWidth={3} />
      {label === 'YOU'
        ? <g fill={tone}><circle cy={-8} r={9} /><path d="M-16,15 A16,16 0 0 1 16,15 L16,18 L-16,18 Z" /></g>
        : <text y={13} textAnchor="middle" fill={tone} style={{ font: `800 34px ${T.face}` }}>?</text>}
      <text y={66} textAnchor="middle" fill={hexA(C.ink, dim ? 0.5 : 0.85)}
        style={{ font: `700 24px ${T.face}`, ...tracking(3) }}>{label}</text>
    </g>
  );

const Arrow: React.FC<{
  from: number; to: number; col: string; phase: number; barb: number; flowT: number; w: number;
}> = ({ from, to, col, phase, barb, flowT, w }) => {
  const d = Math.sign(to - from);
  const headX = lerp(from, to, Math.min(1, phase));
  return (
    <g>
      <line x1={from} y1={0} x2={to} y2={0} stroke={hexA(col, 0.22)} strokeWidth={w}
        strokeLinecap="round" />
      <line x1={from} y1={0} x2={headX} y2={0} stroke={col} strokeWidth={w} strokeLinecap="round" />
      {[0, 1, 2].map((k) => {
        let u = (flowT * 0.42 + k / 3) % 1; if (u < 0) u += 1;
        const r = (w + 1) * Math.sin(u * Math.PI) ** 0.35;
        return (
          <g key={k} transform={`translate(${lerp(from, to, u)} 0)`}>
            <circle r={r} fill={col} />
            <text y={r * 0.42} textAnchor="middle" fill="#0C1330"
              style={{ font: `900 ${r * 1.3}px ${T.face}` }}>₹</text>
          </g>
        );
      })}
      <path d={`M${headX + d * (w * 2)},0 L${headX - d * (w * 1.2)},${-w * 1.5} `
        + `L${headX - d * (w * 1.2 - barb * w * 0.66)},0 L${headX - d * (w * 1.2)},${w * 1.5} Z`}
        fill={col} />
    </g>
  );
};

/* ONE keypad, used on both sides. The comparison only works if the object being crossed out on
   the left is visibly the same object being typed on the right. */
export const PIN_DEMO = [3, 9, 1, 7];
const keyCell = (n: number) => ({
  c: n === 0 ? 1 : (n - 1) % 3,
  r: n === 0 ? 3 : Math.floor((n - 1) / 3),
});
const Keyglyph: React.FC<{ s: number; lit?: number[]; live?: boolean; dim?: number }> =
  ({ s, lit = [], live, dim = 0 }) => (
    <g transform={`scale(${s})`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => {
        const { c, r } = keyCell(n);
        const on = lit.includes(n);
        return (
          <g key={n} transform={`translate(${-58 + c * 58} ${-57 + r * 38})`}>
            <rect x={-24} y={-14} width={48} height={28} rx={8}
              fill={on ? C.orange : mix('#27346A', '#151C3C', dim)} />
            {live && (
              <text y={8} textAnchor="middle" fill={on ? '#2A1004' : '#7C8ABC'}
                opacity={on ? 1 : 1 - dim * 0.8}
                style={{ font: `800 21px ${T.mono}` }}>{n}</text>
            )}
          </g>
        );
      })}
    </g>
  );
