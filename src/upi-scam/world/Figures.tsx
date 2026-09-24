/* PEOPLE.
 *
 * Faceless film, so the acting is anatomical rather than facial: eyes move, then the head, then
 * the shoulders, then the lean. Every channel of every figure is read from the same mood track
 * through a DIFFERENT delay, which makes synchronised whole-body motion structurally impossible.
 *
 * The seller's arc is continuous — neutral, interested, confident, focused, expectant, confused,
 * realising, disappointed — and each state begins slightly BEFORE the narration names it.
 * The parents are competent throughout: their uncertainty is one held look, not confusion.
 */
import React from 'react';
import { C, FPS, T, clamp01, ease, hash01, impact, lerp, mix, shadow, sp, tracking } from '../design';
import { B, CUE } from '../timeline';
import { hexA } from './Backdrop';
import { PointingHand, wristAt } from './hand';

export type Mood = {
  t: number; lid: number; brow: number; tilt: number; shoulder: number; lean: number;
  gx: number; gy: number;
};
const M = (t: number, lid: number, brow: number, tilt: number, shoulder: number,
  lean: number, gx: number, gy: number): Mood => ({ t, lid, brow, tilt, shoulder, lean, gx, gy });

/* channel delays, in seconds. The eyes are the only channel with zero delay. */
const DELAY = { lid: 0, gx: 0, gy: 0, brow: 0.05, tilt: 0.11, shoulder: 0.23, lean: 0.34 };

function track(keys: Mood[], t: number, ch: keyof typeof DELAY) {
  const tt = t - DELAY[ch];
  if (tt <= keys[0].t) return keys[0][ch];
  for (let i = 1; i < keys.length; i++) {
    if (tt < keys[i].t) {
      const u = ease.inOut((tt - keys[i - 1].t) / (keys[i].t - keys[i - 1].t));
      return lerp(keys[i - 1][ch] as number, keys[i][ch] as number, u);
    }
  }
  return keys[keys.length - 1][ch];
}

/* ── THE SELLER ─────────────────────────────────────────────────────────────────────────────
   Anticipation is built into the track: "interested" starts 0.15s before the card lands,
   "confusion" starts before "however" finishes, "realisation" before the snap. */
const SELLER: Mood[] = [
  M(0.00, 1.00, 0.00, 0.0, 0.0, 0.00, 0.10, 0.00),   // neutral
  M(2.20, 1.06, 0.14, -2.0, -2.0, 0.06, 0.55, -0.30), // interested (card arriving)
  M(3.90, 1.02, 0.22, -3.0, -4.0, 0.12, 0.45, -0.10), // confident (money incoming)
  M(6.40, 0.92, 0.10, 1.5, -3.0, 0.16, 0.30, 0.25),   // focused (approve)
  M(9.60, 0.88, 0.06, 2.5, -2.0, 0.18, 0.20, 0.45),   // concentrating (PIN)
  M(11.70, 1.04, 0.18, -1.0, -3.5, 0.10, 0.35, 0.05), // a flicker of relief
  M(12.55, 1.14, -0.10, 0.5, -1.0, 0.06, 0.62, -0.10), // something is wrong (before "instead")
  M(14.40, 1.22, -0.26, 3.0, 1.5, -0.04, 0.75, -0.05), // realisation
  M(15.60, 1.10, -0.34, 5.5, 7.0, -0.14, 0.60, 0.20),  // the money goes
  M(16.60, 0.86, -0.30, 7.0, 13.0, -0.20, 0.25, 0.35), // slump
  M(20.00, 0.92, -0.18, 5.0, 9.0, -0.12, 0.30, 0.10),
  M(26.00, 0.94, -0.10, 3.0, 6.0, -0.08, 0.35, 0.00),
];

export const Seller: React.FC<{ t: number; x: number; y: number; s: number; dim?: number }> =
  ({ t, x, y, s, dim = 0 }) => {
    /* "anyone" — the seller does not leave when the film widens. He takes his place among the
       others, at their scale, and is still there at the end. */
    /* he steps back into the group ON CAMERA, on an arc, while the frame opens out around him —
       he is not somewhere else when the cover lifts, he walks there */
    const join = ease.inOut(clamp01((t - CUE.crowdArrive) / 1.2));
    const leave = ease.inOut(clamp01((t - B(58)) / 1.1));
    x = lerp(x, 120, join) - leave * 300;
    y -= Math.sin(join * Math.PI) * 46;          // the arc of stepping back
    y = lerp(y, 1372, join) + leave * 70;
    s = lerp(s, 0.72, join);
    const m = {
      lid: track(SELLER, t, 'lid'), brow: track(SELLER, t, 'brow'),
      tilt: track(SELLER, t, 'tilt'), shoulder: track(SELLER, t, 'shoulder'),
      lean: track(SELLER, t, 'lean'), gx: track(SELLER, t, 'gx'), gy: track(SELLER, t, 'gy'),
    };
    /* the world's impacts reach the body late and small */
    const jolt = impact(t, CUE.snap, 7, 5, 8) + impact(t, CUE.requestLand, 2, 7, 12);
    if (leave >= 0.99) return null;
    return <Figure x={x + jolt * 0.3} y={y + m.shoulder + jolt * 0.5} s={s} m={m} seed={1}
      tone="#2C6C7A" skin="#E7BE9E" t={t} dim={dim} />;
  };

/* ── GENERIC FIGURE ─────────────────────────────────────────────────────────────────────────*/
export const Figure: React.FC<{
  x: number; y: number; s: number; m: Omit<Mood, 't'>; seed: number;
  tone: string; skin: string; t: number; dim?: number; grey?: boolean; chin?: number;
  point?: React.ReactNode;
}> = ({ x, y, s, m, seed, tone, skin, t, dim = 0, grey, chin = 0, point }) => {
  /* blinks: irregular, seeded per figure, and more frequent after a shock */
  const stress = t > CUE.however && t < CUE.absorb + 1.5 ? 1.8 : 1;
  const period = (2.6 + hash01(seed, 3) * 2.2) / stress;
  const ph = hash01(seed, 7) * period;
  const bt = ((t + ph) % period) / period;
  const blink = bt > 0.965 ? Math.sin((bt - 0.965) / 0.035 * Math.PI) : 0;
  const lid = clamp01(m.lid * (1 - blink));
  const eyeH = 7 * lid;
  const body = grey ? mix(tone, '#3A4775', 0.45) : tone;

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim}
      style={{ filter: `drop-shadow(${shadow(14, 0.4)})` }}>
      {/* torso: the lean is a rotation about the hips, so the shoulders travel further than the waist */}
      <g transform={`rotate(${m.lean * 9} 0 210)`}>
        <path d="M-96,210 C-96,116 -50,84 0,84 C50,84 96,116 96,210 L96,300 L-96,300 Z" fill={body} />
        <path d="M-96,210 C-96,150 -52,120 0,120 L0,300 L-96,300 Z" fill="#000" opacity={0.13} />
        {/* the hand comes up to the chin: the universal "I am not sure about this" — it rises
            on an arc from the shoulder, and it does not arrive and freeze, it rubs */}
        {chin > 0.01 && (() => {
          const u = ease.out(chin);
          const rub = Math.sin(t * 5.2) * 5 * u;
          const hx = lerp(-92, -16 + rub, u), hy = lerp(150, 42, u);
          return (
            <g>
              <path d={`M-86,208 Q${lerp(-108, -78, u)},${lerp(178, 112, u)} ${hx},${hy}`}
                stroke={skin} strokeWidth={30} fill="none" strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={17} fill={skin} />
            </g>
          );
        })()}
        {point}
        {/* head */}
        <g transform={`translate(0 ${-6}) rotate(${m.tilt} 0 40)`}>
          <path d="M-52,-4 C-52,-62 -30,-88 0,-88 C30,-88 52,-62 52,-4 C52,34 30,52 0,52 C-30,52 -52,34 -52,-4 Z"
            fill={skin} />
          <path d="M-54,-22 C-46,-74 -18,-96 0,-96 C18,-96 46,-74 54,-22 C54,-40 40,-74 0,-74 C-40,-74 -54,-40 -54,-22 Z"
            fill="#2A2430" />
          {/* eyes lead everything */}
          {[-20, 20].map((ex) => (
            <g key={ex} transform={`translate(${ex} -4)`}>
              <ellipse rx={10} ry={Math.max(0.6, eyeH)} fill="#FFFFFF" opacity={0.92} />
              <circle cx={m.gx * 5} cy={m.gy * 4} r={Math.min(5.2, Math.max(1, eyeH * 0.8))} fill="#1B2233" />
            </g>
          ))}
          {/* brows carry the emotion; they are 50ms behind the eyes */}
          {[-20, 20].map((ex, i) => (
            <path key={ex}
              d={`M${ex - 13},${-22 - m.brow * 5} L${ex + 13},${-22 + (i ? -1 : 1) * m.brow * 7}`}
              stroke="#2A2430" strokeWidth={4.5} strokeLinecap="round" />
          ))}
        </g>
      </g>
    </g>
  );
};

/* ── THE CROWD ───────────────────────────────────────────────────────────────────────────────
   Not clones: different depth planes, different scales, different entry times, different phone
   behaviour, different reactions. One safely ignores a request; one hesitates; one dismisses. */
/* Four people, arranged across the lower half at sizes a phone viewer can actually read — not a
   diorama of specks. Different depth planes, different entry times, different scales, and four
   DIFFERENT behaviours: one reacts, one dismisses a request, one receives money safely with no
   PIN at all, one hesitates. The variety is the argument: unfamiliarity is the vulnerability,
   not who you are. */
/* They ENTER. Each from off frame, on its own vector, with its own delay and its own settle —
   two from the sides, two from below — so the group assembles rather than appearing. `from` is
   where the figure starts, in its own local offset. */
const CROWD = [
  { id: 0, order: 0, x: 344, y: 1286, s: 1.06, delay: 0.00, from: [-210, 430] as const, tone: '#3E5FA8', skin: '#D9A987', act: 'react' },
  { id: 1, order: 1, x: 712, y: 1196, s: 0.88, delay: 0.22, from: [520, 120] as const, tone: '#7A5C9E', skin: '#EBC3A4', act: 'dismiss' },
  { id: 2, order: 3, x: 958, y: 1338, s: 0.78, delay: 0.46, from: [450, 40] as const, tone: '#2F7E86', skin: '#C79271', act: 'safe' },
  { id: 3, order: 2, x: 560, y: 1446, s: 0.84, delay: 0.66, from: [70, 500] as const, tone: '#8A6A4E', skin: '#E3B994', act: 'hesitate' },
];

export const Crowd: React.FC<{ t: number }> = ({ t }) => {
  const out = CROWD.map((c) => {
    /* HEAVY class: people have mass. They accelerate in, overshoot barely, and settle. */
    const enter = sp(t * FPS, (CUE.crowdArrive + c.delay) * FPS, 'heavy');
    if (enter <= 0.001) return null;
    const u = Math.min(1, enter);
    /* THE REALISATION, staggered per person and always in anatomical order:
       the request lands -> the eyes go to it -> the head tilts -> the hand comes to the chin ->
       the question mark arrives last, because it is the conclusion, not the reflex. */
    const alert = CUE.crowdAlert + c.order * 0.34;
    const popup = clamp01((t - alert) / 0.22);
    const look = clamp01((t - alert - 0.09) / 0.2);
    const chin = c.act === 'safe' ? 0
      : clamp01((t - alert - 0.30) / 0.42) * (1 - clamp01((t - alert - 2.6) / 0.5));
    /* the crowd parts rather than vanishing: they slide outward to open the corridor the
       parents walk into, and the two furthest out leave frame entirely */
    const part = ease.inOut(clamp01((t - B(58)) / 1.1));
    const side = c.x < 540 ? -1 : 1;
    const fade = 1 - clamp01((t - B(59)) / 1.0);
    if (fade <= 0.02) return null;
    /* eyes first, always: gaze snaps to the phone 90ms before the body acknowledges it */
    const lean = c.act === 'hesitate' ? clamp01((t - alert - 0.5) / 0.5) * 0.20
      : c.act === 'dismiss' ? -clamp01((t - alert - 0.5) / 0.5) * 0.16 : 0;
    const toward = c.x < 540 ? 1 : -1;
    const m = {
      lid: 1 + look * 0.12,
      brow: lerp(0.08, c.act === 'safe' ? 0.18 : -0.24, look),
      tilt: lerp(0, toward * 4, look), shoulder: 0, lean,
      gx: lerp(0, toward * 0.85, look), gy: 0.35 * look,
    };
    const rise = ease.out(u);
    /* the remaining distance is what the spring closes, plus a small arc so nobody slides in on
       a straight line */
    const back = 1 - Math.min(1, enter);
    const ex = c.x + c.from[0] * back;
    const ey = c.y + c.from[1] * back - Math.sin(Math.min(1, enter) * Math.PI) * 34;
    return (
      <g key={c.id} opacity={fade * u}>
        <Figure x={ex + side * part * 330} y={ey + part * 60}
          s={c.s * lerp(0.94, 1, Math.min(1, enter))} m={m} chin={chin}
          seed={c.id + 3} tone={c.tone} skin={c.skin} t={t} grey />
        <MiniPhone t={t} x={ex + side * part * 330 + (c.x < 540 ? 96 : -96) * c.s}
          y={ey + 78 * c.s + part * 60} s={c.s} act={c.act} id={c.id}
          popup={popup} alert={alert} />
        {c.act !== 'safe' && (
          <QMark t={t} at={alert + 0.62}
            x={ex + side * part * 330} y={ey + part * 60 - 130 * c.s} s={c.s} />
        )}
      </g>
    );
  });
  return <g>{out}</g>;
};

const MiniPhone: React.FC<{
  t: number; x: number; y: number; s: number; act: string; id: number; popup: number; alert: number;
}> = ({ t, x, y, s, act, id, popup, alert }) => {
    /* the request is NOT sitting there waiting: it lands, in shot, and everything the person does
       is a reaction to having watched it land */
    const on = popup;
    const dismissed = act === 'dismiss' ? clamp01((t - alert - 1.5) / 0.4) : 0;
    const col = act === 'safe' ? C.green : act === 'dismiss' ? C.grey : C.amber;
    const land = 1 + Math.max(0, impact(t, alert, 0.10, 8, 12));
    return (
      <g transform={`translate(${x} ${y}) scale(${s * 1.15 * land})`}>
        <rect x={-34} y={-58} width={68} height={116} rx={13} fill="#242F5E"
          stroke={hexA('#A8BEF2', 0.55)} strokeWidth={2.5} />
        {on > 0 && (
          <g opacity={1 - dismissed} transform={`translate(0 ${(1 - on) * -26}) scale(${on})`}>
            <rect x={-30} y={-50} width={60} height={40} rx={9} fill={col} />
            <text y={-21} textAnchor="middle" fill="#0C1330"
              style={{ font: `900 28px ${T.face}` }}>₹</text>
            <rect x={-27} y={-2} width={54} height={9} rx={4} fill="#41508A" />
            <rect x={-27} y={14} width={36} height={9} rx={4} fill="#41508A" />
          </g>
        )}
      </g>
    );
  };

/* the question mark is the conclusion, so it arrives after the hand does — and it pops with a
   light spring rather than drifting up, because it is a thought, not a balloon */
const QMark: React.FC<{ t: number; at: number; x: number; y: number; s: number }> =
  ({ t, at, x, y, s }) => {
    const u = clamp01((t - at) / 1.9);
    if (u <= 0 || u >= 1) return null;
    const pop = clamp01((t - at) / 0.2);
    const hover = Math.sin((t - at) * 2.4) * 5;
    const fade = Math.min(1, (1 - u) * 4);
    return (
      <g transform={`translate(${x} ${y + hover}) scale(${s * (0.5 + pop * 0.55)})`}
        opacity={fade * 0.95}>
        <circle r={40} fill="#1A2148" stroke={hexA(C.lavender, 0.75)} strokeWidth={3} />
        <text y={17} textAnchor="middle" fill={C.lavender}
          style={{ font: `900 52px ${T.face}` }}>?</text>
      </g>
    );
  };

/* ── THE PARENTS ─────────────────────────────────────────────────────────────────────────────
   Two competent adults already mid-transaction. They flank the phone rather than being dwarfed
   by it. The uncertainty is a 0.25s held look between them — nothing more. */
export const Parents: React.FC<{ t: number; stage: { s: number; x: number; y: number } }> = ({ t, stage }) => {
  const u = clamp01((t - CUE.parentsIn) / 0.9);
  if (u <= 0) return null;
  const out = clamp01((t - B(70)) / 1.0);
  const look = clamp01((t - B(61)) / 0.3) * (1 - clamp01((t - B(63)) / 0.4));  // the shared glance
  const eased = ease.out(u);

  const A = {
    lid: 1, brow: lerp(0.05, -0.16, look), tilt: lerp(2, -2, look),
    shoulder: 0, lean: 0.1 - look * 0.06, gx: lerp(0.55, 0.9, look), gy: 0.25 - look * 0.3,
  };
  const Bm = {
    lid: 1, brow: lerp(0.02, 0.2, clamp01((t - CUE.ruleCard) / 0.6)),
    tilt: lerp(-3, 1, look), shoulder: 0, lean: -0.14,
    gx: lerp(-0.6, -0.95, look), gy: 0.3,
  };
  return (
    <g opacity={eased * (1 - out * 0.55)}>
      <Figure x={lerp(30, 162, eased) - out * 96} y={lerp(1560, 1462, eased)}
        s={0.94 * lerp(0.88, 1, eased)} m={A} seed={21} tone="#3B6E8F" skin="#D8A176" t={t} />
      {/* the second parent's hand starts to point BEFORE the rule card exists — the card is the
          answer to their gesture, not an interruption of nowhere. It is drawn UNDER that parent so
          the arm comes out from behind their shoulder; an arm laid over the body is a plank lying
          on a person, and the elbow end has nowhere to go. */}
      <Figure x={lerp(1052, 914, eased) + out * 96} y={lerp(1596, 1502, eased)}
        s={0.80 * lerp(0.88, 1, eased)} m={Bm} seed={22} tone="#7C5B8A" skin="#E2B489" t={t}
        point={<Pointer t={t} skin="#E2B489" />} />
    </g>
  );
};

/* THE SECOND PARENT'S POINT.
 *
 * This gesture belongs to parent B, so it is drawn at parent B's scale, in their local space, in
 * their language. The earlier version borrowed the phone's hand at a size between the two: it came
 * out wider than their head, on a forearm 3.4x the width of their own arm, which had to run 961 px
 * — 44 finger-widths, where a real forearm is 13 — to touch the card. No size fixes a touch from
 * that far away, so it does not touch: it points, from arm's length, and the direction carries it.
 *
 * Two registers coexist in this frame on purpose — the phone is a stage roughly 18x the figures'
 * scale, so the hand reaching APPROVE is ~4x this one. That is the composition, not a mistake.
 */
const ARM_W = 30;                       // the figures' own arm, as the chin-stroke gesture draws it
const FW_LOC = ARM_W / 3.70;            // a forearm is 3.70 finger-widths, so this fixes FW
const REACH = 29 * FW_LOC;              // shoulder to fingertip, at the figures' proportions
const SHOULDER: [number, number] = [-86, 208];

const Pointer: React.FC<{ t: number; skin: string }> = ({ t, skin }) => {
  const u = clamp01((t - B(62)) / 0.7);
  const back = clamp01((t - B(64)) / 0.6);
  if (u <= 0 || back >= 0.98) return null;
  /* the target is the card on the phone, in this figure's local space — the arm aims at it, and
     stops at arm's length */
  /* the card sits at ~(700, 728) in world while the parents hold the frame, and parent B stands at
     (914, 1502) at s 0.80 — so in this figure's own space the card is here. Both are inside the
     same camera layer, so the relative geometry is unaffected by the camera. */
  const aim = { x: (700 - 914) / 0.80, y: (728 - 1502) / 0.80 };
  const rise = ease.out(u) * (1 - ease.in(back) * 0.55);
  const L = Math.hypot(aim.x - SHOULDER[0], aim.y - SHOULDER[1]);
  const dir = { x: (aim.x - SHOULDER[0]) / L, y: (aim.y - SHOULDER[1]) / L };
  /* it starts with the arm down by the side and swings up onto that line */
  const a0 = Math.atan2(0.96, 0.28), a1 = Math.atan2(dir.y, dir.x);
  const ang = lerp(a0, a1, rise);
  const reach = REACH * lerp(0.62, 1, rise);
  const tip = { x: SHOULDER[0] + Math.cos(ang) * reach, y: SHOULDER[1] + Math.sin(ang) * reach };
  const from = { x: SHOULDER[0], y: SHOULDER[1] };
  const w = wristAt(tip, from, 'right', FW_LOC, 6);
  return (
    <g opacity={Math.min(1, 1 - back * 0.4) * clamp01(u * 1.6)}>
      {/* the figure's own arm, in the figure's own language: one stroke, no contour, round cap.
          The cap is wider than the wrist, so it covers the straight cut the hand ends on. */}
      <path d={`M${SHOULDER[0]},${SHOULDER[1]} Q${lerp(SHOULDER[0], w.x, 0.45) - 14},`
        + `${lerp(SHOULDER[1], w.y, 0.45)} ${w.x},${w.y}`}
        stroke={skin} strokeWidth={ARM_W} fill="none" strokeLinecap="round" />
      <PointingHand tip={tip} from={from} hand="right" fw={FW_LOC} bend={6}
        detail="flat" arm="none" skin={skin} />
    </g>
  );
};
