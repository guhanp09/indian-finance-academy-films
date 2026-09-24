/* THE MARKETPLACE — grown out of the parcel, never cut to.
 *
 * The parcel exists in the foreground from frame 0 (it is why this person is a seller). At the
 * end of the fraud it rises, travels, and its own faces REPROPORTION into a listing card:
 * the shipping label becomes the title bar, the tape becomes the price chip, the box face becomes
 * the thumbnail. One object, two roles. Nothing fades.
 *
 * The background micro-stories (a listing quietly going SOLD, a typing indicator, a second seller
 * dismissing a request) are deliberately low-contrast and non-essential — a living world that
 * rewards attention without ever asking for it.
 */
import React from 'react';
import { C, FPS, T, clamp01, ease, hash01, impact, lerp, mix, shadow, sp, tracking } from '../design';
import { B, CUE, paced } from '../timeline';
import { hexA } from './Backdrop';

const HOME = { x: 946, y: 1372, s: 1 };          // foreground right, cropped by the frame
export const ORIGIN = { x: 900, y: 1096 };
const DEST = ORIGIN;

export const Parcel: React.FC<{ t: number }> = ({ t }) => {
  const rise = clamp01((t - B(36)) / 0.55);
  const P = paced(B(37), B(38) + 0.45, 0.63);
  const travel = ease.inOut(clamp01((t - P.from) / P.span));
  const morph = ease.inOut(clamp01((t - B(38)) / 0.6));
  /* it does not hand off, shrink or fade: when the wave starts, this listing starts moving with
     it and leaves the frame the same way everything else in the wave does */
  const drift = waveDrift(t);

  const x = lerp(HOME.x, DEST.x, travel) - drift;
  if (x < -420) return null;
  const y = lerp(HOME.y, DEST.y, travel) - rise * 26 - Math.sin(travel * Math.PI) * 70;
  const rot = lerp(-8, 0, travel) + Math.sin(travel * Math.PI) * 6;
  const sc = lerp(1, 1.06, travel);

  /* geometry morph: the box is 236x200 and the listing card is 236x330 */
  const w = 236, h = lerp(200, 346, morph);
  const labelH = lerp(52, 62, morph);
  const body = morph < 0.5 ? '#C69B6D' : '#F6F7FB';
  const bodyMix = mix('#C69B6D', '#F6F7FB', morph);
  const flapO = 1 - clamp01(morph * 2.2);

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}
      opacity={1}
      style={{ filter: `drop-shadow(${shadow(lerp(18, 12, morph), 0.45)})` }}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={lerp(6, 20, morph)} fill={bodyMix} />
      {/* the tape becomes the price chip: same stripe, new meaning */}
      <rect x={lerp(-14, -w / 2 + 22, morph)} y={lerp(-h / 2, h / 2 - 76, morph)}
        width={lerp(28, 132, morph)} height={lerp(h, 50, morph)} rx={lerp(0, 14, morph)}
        fill={mix('#E2C08C', '#1E2A55', morph)} />
      <text x={lerp(0, -w / 2 + 88, morph)} y={lerp(0, h / 2 - 42, morph)} textAnchor="middle"
        fill={C.ink} opacity={morph} style={{ font: `800 30px ${T.face}` }}>₹8,450</text>
      {/* the shipping label becomes the title bar */}
      <rect x={-w / 2 + 18} y={lerp(-h / 2 + 26, -h / 2 + 150, morph)}
        width={w - 36} height={labelH} rx={lerp(3, 10, morph)}
        fill={mix('#F0E4D2', '#E6EAF6', morph)} />
      <g opacity={morph}>
        <rect x={-w / 2 + 30} y={-h / 2 + 166} width={128} height={9} rx={4} fill="#9AA4C6" />
        <rect x={-w / 2 + 30} y={-h / 2 + 184} width={86} height={9} rx={4} fill="#BAC2DC" />
      </g>
      <g opacity={1 - morph}>
        <rect x={-w / 2 + 30} y={-h / 2 + 38} width={110} height={7} rx={3} fill="#8D7354" />
        <rect x={-w / 2 + 30} y={-h / 2 + 52} width={72} height={7} rx={3} fill="#A98B67" />
      </g>
      {/* box flaps: they close as the object stops being a box */}
      <path d={`M${-w / 2},${-h / 2} L0,${-h / 2 - 26} L${w / 2},${-h / 2}`} fill="none"
        stroke="#A9814F" strokeWidth={4} opacity={flapO} />
      {/* the thumbnail the box face becomes */}
      <rect x={-w / 2 + 18} y={-h / 2 + 18} width={w - 36} height={124} rx={10}
        fill="#22305F" opacity={morph} />
      <g opacity={morph * 0.85}>
        <circle cy={-h / 2 + 70} r={26} fill="#3E5296" />
        <path d={`M${-46},${-h / 2 + 108} L${-10},${-h / 2 + 72} L${16},${-h / 2 + 98} L${44},${-h / 2 + 70} L${44},${-h / 2 + 130} L${-46},${-h / 2 + 130} Z`}
          fill="#3E5296" />
      </g>
    </g>
  );
};

/* peripheral listings — arriving with genuinely different material physics, never one spring */
const LISTINGS = [
  { id: 0, x: 212, y: 1122, w: 246, h: 186, at: () => B(36) + 0.05, kind: 'slide' as const, label: 'AVAILABLE' },
  { id: 1, x: 486, y: 1310, w: 214, h: 164, at: () => B(36) + 0.18, kind: 'roll' as const, label: 'SOLD' },
  { id: 2, x: 176, y: 800, w: 208, h: 158, at: () => B(36) + 0.30, kind: 'swing' as const, label: 'AVAILABLE' },
];

export const Listings: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {LISTINGS.map((L) => {
      const u = clamp01((t - L.at()) / 0.7);
      if (u <= 0) return null;
      /* each listing is handed to a tile at the same frame — the field is made OF them */
      const e = ease.out(u);
      /* four sellable objects, four material behaviours: one slides and settles, one rolls in
         with rotation, one swings from a pivot. Same physics family, different instances. */
      const dx = L.kind === 'slide' ? lerp(-240, 0, e) : L.kind === 'roll' ? lerp(300, 0, e) : 0;
      const dy = L.kind === 'swing' ? lerp(-180, 0, e) : 0;
      const rot = L.kind === 'roll' ? lerp(-140, 0, e)
        : L.kind === 'swing' ? Math.sin((1 - e) * 7) * 14 * (1 - e) : 0;
      const sold = L.label === 'SOLD' ? clamp01((t - B(43)) / 0.5) : 0;
      /* they join the flow rather than contracting in place — nothing on screen may vanish */
      const ldrift = waveDrift(t) * (0.94 + hash01(L.id, 41) * 0.16);
      if (L.x + dx - ldrift < -400) return null;
      return (
        <g key={L.id}
          transform={`translate(${L.x + dx - ldrift} ${L.y + dy - ldrift * 0.032}) rotate(${rot})`}
          opacity={u * 0.94} style={{ filter: `drop-shadow(${shadow(10, 0.4)})` }}>
          <rect x={-L.w / 2} y={-L.h / 2} width={L.w} height={L.h} rx={14} fill="#E9EDF8" />
          <rect x={-L.w / 2} y={-L.h / 2} width={L.w} height={L.h * 0.52} rx={14} fill="#2E3D6E" />
          <rect x={-L.w / 2 + 14} y={L.h / 2 - 34} width={62} height={9} rx={4} fill="#9AA4C6" />
          <text x={L.w / 2 - 14} y={L.h / 2 - 24} textAnchor="end"
            fill={sold > 0.5 ? C.grey : C.cobalt}
            style={{ font: `800 17px ${T.face}`, ...tracking(1) }}>
            {sold > 0.5 ? 'SOLD' : 'AVAILABLE'}
          </text>
        </g>
      );
    })}
  </g>
);

/* the buyer's message — the lie in words, arriving before the second request does */
export const ChatBubble: React.FC<{ t: number }> = ({ t }) => {
  const u = clamp01((t - (CUE.shineEnd + 0.30)) / 0.34);
  const out = clamp01((t - CUE.waveSeed - 0.25) / 0.4);
  if (u <= 0 || out >= 1) return null;
  const pop = ease.out(u);
  return (
    <g transform={`translate(${lerp(700, 676, pop)} ${lerp(520, 494, pop)}) scale(${lerp(0.86, 1, pop)})`}
      opacity={u * (1 - out)} style={{ filter: `drop-shadow(${shadow(9, 0.4)})` }}>
      <path d="M-150,-44 h300 a16,16 0 0 1 16,16 v56 a16,16 0 0 1 -16,16 h-274 l-26,26 v-26 a16,16 0 0 1 -16,-16 v-56 a16,16 0 0 1 16,-16 z"
        fill="#E9EDF8" />
      <text y={4} textAnchor="middle" fill="#1B2445"
        style={{ font: `700 26px ${T.face}` }}>Payment sent ✓✓</text>
    </g>
  );
};


/* ══ THE SELLER WAVE ════════════════════════════════════════════════════════════════════════
 * A crowd of online sellers crosses the frame and, for a moment, there is nothing else in it.
 *
 * TWO RULES, both learned the hard way:
 *
 * 1. NOTHING APPEARS AND NOTHING DISAPPEARS. Every tile's whole life is x = peak + (t−peak)·v,
 *    and the layer speeds are chosen so that at `waveSeed` EVERY tile is still past x=1900, off
 *    the right edge. They enter by travelling, they leave by travelling. The earlier version
 *    gated layers on time instead of position, so a third of the near layer switched on already
 *    half-way into frame — which is exactly what "a wave materialises out of nowhere" looks like.
 *
 * 2. THE LISTINGS ON SCREEN JOIN IT. The parcel-listing and the three peripheral listings do not
 *    contract, absorb or fade when the wave starts: they start moving left at the far layer's
 *    speed and leave with it. The wave is not laid over this shot, it is this shot leaving.
 *
 * And the tile itself is a person, not a card: head and shoulders, a listing with a PARCEL in it
 * (the one object nobody mistakes for anything else), a price, and the phone in their hand with
 * the same request already waiting on it.
 */
type Lay = { z: 0 | 1 | 2; px: number; py: number; seed: number };

const bell = (d: number, w: number) => Math.exp(-(d * d) / (2 * w * w));

/* Peak positions = where a tile IS at the moment of full coverage. The near set blankets the
   central band; the layers behind it are texture and depth. */
/* A 3x5 lattice, jittered, at a scale where a whole SELLER is legible on each tile — the earlier
   near layer was so large that only four giant parcels fitted the frame, which reads as boxes
   rather than as a crowd of people who sell things. */
/* A 4x5 lattice with the rows offset, at a scale where a WHOLE seller fits on screen. Twenty of
   them engulf the frame as a crowd; four giant ones engulfed it as parcels. */
/* 4 x 6, rows offset. Spacing is deliberately looser than the tiles are wide: enough overlap to
   engulf the frame, loose enough that most tiles still show the whole person on them. Twenty-four
   sellers read as a crowd; four giant ones read as parcels. */
const NEAR: [number, number][] = [
  [60, 150], [390, 138], [720, 166], [1040, 142],
  [128, 510], [458, 524], [788, 498], [1096, 530],
  [60, 870], [390, 882], [720, 858], [1040, 890],
  [128, 1230], [458, 1218], [788, 1246], [1096, 1222],
  [60, 1590], [390, 1602], [720, 1578], [1040, 1610],
  [128, 1900], [458, 1888], [788, 1916], [1096, 1894],
];
const MID: [number, number][] = [
  [200, 430], [700, 360], [1030, 640], [120, 980], [620, 1010],
  [960, 1300], [330, 1430], [790, 1500], [480, 660], [60, 1620],
];
const FAR: [number, number][] = [
  [150, 330], [430, 250], [720, 420], [980, 300], [270, 640],
  [600, 700], [890, 760], [180, 1020], [520, 1100], [840, 1060],
  [340, 1380], [660, 1330], [980, 1450],
];

/* v is chosen so that (1900 − minPeakX) / v <= wavePeak − waveSeed for every layer: the whole
   formation is off the right edge when the sentence starts and streams in from there. */
export const WAVE_V = [760, 1120, 1620];
const BASE_SCALE = [0.44, 0.86, 1.55];

const WAVE: Lay[] = [
  ...FAR.map(([px, py], i) => ({ z: 0 as const, px, py, seed: i * 7 + 1 })),
  ...MID.map(([px, py], i) => ({ z: 1 as const, px, py, seed: i * 11 + 3 })),
  ...NEAR.map(([px, py], i) => ({ z: 2 as const, px, py, seed: i * 13 + 5 })),
];

/** how far anything caught up in the wave has travelled left by time t (used by the listings) */
export const waveDrift = (t: number, v = WAVE_V[0]) => Math.max(0, t - CUE.waveSeed) * v;

export const SellerWave: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUE.waveSeed - 0.1) return null;
  const out: { z: number; node: React.ReactNode }[] = [];

  WAVE.forEach((L, i) => {
    const jv = L.z === 2 ? 0.95 + hash01(L.seed, 3) * 0.10 : 0.86 + hash01(L.seed, 3) * 0.28;
    const vx = -WAVE_V[L.z] * jv, vy = -(24 + L.z * 46) * jv;
    const spread = L.z === 2 ? 0.035 : 0.11;
    const peak = CUE.wavePeak + (hash01(L.seed, 9) - 0.5) * spread;
    const d = t - peak;
    const jx = (hash01(L.seed, 51) - 0.5) * 44, jy = (hash01(L.seed, 57) - 0.5) * 44;
    const x = L.px + jx + d * vx;
    const y = L.py + jy + d * vy + Math.sin(d * 1.7 + L.seed) * 10 * (L.z + 1);
    /* it swells as it passes the lens — near objects do, and it is what turns a moving grid into
       something going past the camera */
    const sc = BASE_SCALE[L.z] * (1 + 0.22 * bell(d, 0.42) * L.z);
    const rot = (hash01(L.seed, 21) - 0.5) * 12 + d * vx * 0.0016;
    /* the ONLY visibility test is position. There is no time gate, so nothing can switch on. */
    if (x < -820 || x > 1960) return;
    out.push({ z: L.z, node: <WaveTile key={i} i={i} x={x} y={y} s={sc} rot={rot} z={L.z} t={t} /> });
  });

  out.sort((a, b) => a.z - b.z);          // painter's order: far first, near last
  return <g>{out.map((o) => o.node)}</g>;
};

/** 1 while the frame is engulfed. */
export const waveCoverage = (t: number) => {
  const a = clamp01((t - (CUE.wavePeak - 0.34)) / 0.34);
  const b = 1 - clamp01((t - CUE.waveOpen) / 0.34);
  return Math.min(a, b);
};

const SKIN = ['#E7BE9E', '#D2A07F', '#C08B63', '#EBC9A8', '#B97F55'];
const SHIRT = ['#3E5FA8', '#2F7E86', '#7A5C9E', '#8A6A4E', '#4B5B93'];
const TAPE = ['#C69B6D', '#BE8F5E', '#CFA878', '#B8875A', '#C9A070'];

const WaveTile: React.FC<{
  i: number; x: number; y: number; s: number; rot: number; z: number; t: number;
}> = ({ i, x, y, s, rot, z, t }) => {
  const W = 268, H = 236;
  const far = z === 0;
  const skin = far ? mix(SKIN[i % 5], '#27356A', 0.42) : SKIN[i % 5];
  const shirt = far ? mix(SHIRT[i % 5], '#27356A', 0.5) : SHIRT[i % 5];
  const box = far ? mix(TAPE[i % 5], '#27356A', 0.42) : TAPE[i % 5];
  const card = far ? mix('#EDF0F9', '#27356A', 0.42) : '#EDF0F9';
  const sold = hash01(i, 17) > 0.74;
  const ping = clamp01((t - (CUE.waveSeed - 0.5 + hash01(i, 23) * 1.6)) / 0.2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      style={{ filter: `drop-shadow(${shadow(9 + z * 7, 0.34 + z * 0.06)})` }}>
      {/* the listing card */}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={22} fill={card} />

      {/* RIGHT — what they are selling. A parcel with tape and a shipping label: the one object
          in this film's vocabulary nobody mistakes for anything else. */}
      <g transform="translate(58 -50)">
        <rect x={-58} y={-38} width={116} height={76} rx={6} fill={box} />
        <path d="M-58,-38 L0,-58 L58,-38" fill="none" stroke={far ? '#5B6A9A' : '#9C7444'}
          strokeWidth={5} strokeLinejoin="round" />
        <rect x={-9} y={-38} width={18} height={76} fill="#00000026" />
        <rect x={-58} y={-9} width={116} height={13} fill="#0000001c" />
        <rect x={-43} y={-29} width={38} height={22} rx={3} fill={far ? '#7E8AB4' : '#F2E7D4'} />
      </g>
      <rect x={0} y={35} width={116} height={34} rx={10} fill="#1E2A55" />
      <text x={58} y={60} textAnchor="middle" fill={C.ink}
        style={{ font: `800 25px ${T.face}` }}>₹{2 + (i % 7)},{1 + (i % 5)}00</text>
      {!far && (
        <text x={58} y={92} textAnchor="middle" fill={sold ? '#9AA4C6' : C.cobalt}
          style={{ font: `800 17px ${T.face}`, ...tracking(1) }}>
          {sold ? 'SOLD' : 'AVAILABLE'}
        </text>
      )}

      {/* LEFT — the person selling it, holding the phone the request arrives on. Entirely INSIDE
          the card, so a tile that is overlapped by its neighbour still shows a whole seller. */}
      <g transform="translate(-78 0)">
        <path d="M-44,72 C-44,16 -24,-14 0,-14 C24,-14 44,16 44,72 Z" fill={shirt} />
        <circle cy={-46} r={28} fill={skin} />
        <path d="M-28,-46 C-28,-88 28,-88 28,-46 C28,-71 -28,-71 -28,-46 Z"
          fill={far ? '#3B3550' : '#2A2430'} />
        <g transform="translate(48 18) rotate(12)">
          <rect x={-18} y={-32} width={36} height={64} rx={8} fill="#242F5E"
            stroke={hexA('#A8BEF2', far ? 0.3 : 0.55)} strokeWidth={2.5} />
          {ping > 0 && (
            <g transform={`scale(${ping})`}>
              <rect x={-13} y={-25} width={26} height={19} rx={5} fill={C.green} />
              <text y={-11} textAnchor="middle" fill="#06301A"
                style={{ font: `900 15px ${T.face}` }}>₹</text>
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
