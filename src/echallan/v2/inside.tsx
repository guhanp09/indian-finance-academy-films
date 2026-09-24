/* INSIDE THE PHONE — the walled city.
 *
 * The metaphor carries the mechanism, and symbols carry the meaning; labels are the exception.
 *
 *   THE WALL        Android's install rule. Solid, continuous, and it glows along its crest where
 *                   the security field runs. Shield symbols mark it as a defence.
 *   THE STORE GATE  the ONE sanctioned way in: an arch under a bag-and-play symbol, with a scanning
 *                   curtain that every arriving app passes through and comes out ticked.
 *   THE PARCEL      the .apk from the chat. It arrives by the messenger's own courier — a green
 *                   chat-bubble craft — at a stretch of wall with NO gate in it, and it is stopped
 *                   dead. The field ripples, the shield lights amber.
 *   THE SIDE DOOR   "Allow from this source": a switch marked with the source's own symbol, and a
 *                   section of wall that OPENS under it. The user has cut a door in their own wall,
 *                   and the door stays open.
 *
 * Every building inside is an app, identified by the symbol on its roof, not by a name.
 */
import React from 'react';
import { H, W, clamp01, ease, hash01, lerp, mix } from '../design';
import { LinGrad, Light, P, RadGrad, Stars, gid } from './style';

export const I = {
  wallTop: 860, wallH: 190,
  gateX: 262, gateW: 220,
  doorX: 780, doorW: 190,
  ground: 1050,
} as const;

const WALL = '#DDE9FF', WALL_D = '#9DB2DA', WALL_DD = '#6C80AE';

/* ── the space inside the device: deep, cool, with motes of data drifting in it ─────────────*/
export const InsideSky: React.FC<{ t: number }> = ({ t }) => {
  const id = gid('insideSky'), gl = gid('insideGlow');
  return (
    <g>
      <defs>
        <LinGrad id={id} stops={[[0, '#071A2E'], [0.45, '#0D2E4A'], [0.8, '#14506A'], [1, '#1B6B80']]} />
        <RadGrad id={gl} cx={0.5} cy={1} r={0.8} stops={[[0, '#3FE3D0', 0.35], [1, '#3FE3D0', 0]]} />
      </defs>
      <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill={`url(#${id})`} />
      <ellipse cx={W / 2} cy={I.wallTop} rx={900} ry={520} fill={`url(#${gl})`} />
      {/* a faint lattice: the device's own architecture, far behind everything */}
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${-100 + i * 110} 0 L${-100 + i * 110 + 60} ${I.wallTop}`}
          stroke="#4FD8E8" strokeWidth={1.5} opacity={0.06} />
      ))}
      <Stars n={70} w={W} h={I.wallTop - 300} t={t} seed={4} k={0.7} />
    </g>
  );
};

/* ── APP BUILDINGS — each identified by the SYMBOL on its roof ──────────────────────────────*/
export type Sym = 'mail' | 'camera' | 'music' | 'pin' | 'chat' | 'calendar' | 'bank' | 'play'
  | 'clock' | 'phone' | 'photo' | 'cart' | 'cloud' | 'heart' | 'news' | 'game';
export const Symbol: React.FC<{ kind: Sym; cx: number; cy: number; s: number; color?: string }> =
  ({ kind, cx, cy, s, color = '#FFFFFF' }) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} fill={color}>
      {kind === 'mail' && <><rect x={-16} y={-11} width={32} height={22} rx={3} />
        <path d="M-15 -9 L0 3 L15 -9" fill="none" stroke="#00000055" strokeWidth={3} /></>}
      {kind === 'camera' && <><rect x={-16} y={-9} width={32} height={20} rx={4} />
        <rect x={-6} y={-14} width={12} height={6} rx={2} />
        <circle cx={0} cy={1} r={6} fill="#00000044" /></>}
      {kind === 'music' && <><rect x={2} y={-14} width={4} height={22} /><rect x={2} y={-14} width={12} height={5} />
        <circle cx={-1} cy={9} r={6} /></>}
      {kind === 'pin' && <><path d="M0 16 C-12 2 -12 -4 -12 -6 A12 12 0 0 1 12 -6 C12 -4 12 2 0 16 Z" />
        <circle cx={0} cy={-6} r={4.5} fill="#00000044" /></>}
      {kind === 'chat' && <path d="M-15 -12 H15 Q17 -12 17 -10 V6 Q17 8 15 8 H-4 L-12 15 V8 H-15 Q-17 8 -17 6 V-10 Q-17 -12 -15 -12 Z" />}
      {kind === 'calendar' && <><rect x={-14} y={-12} width={28} height={26} rx={3} />
        <rect x={-14} y={-12} width={28} height={8} fill="#00000033" /></>}
      {kind === 'bank' && <><path d="M-16 -4 L0 -15 L16 -4 Z" /><rect x={-14} y={-2} width={4} height={12} />
        <rect x={-2} y={-2} width={4} height={12} /><rect x={10} y={-2} width={4} height={12} />
        <rect x={-16} y={11} width={32} height={4} /></>}
      {kind === 'play' && <path d="M-7 -11 L11 0 L-7 11 Z" />}
      {kind === 'cloud' && <path d="M-12 10 A8 8 0 0 1 -11 -5 A10 10 0 0 1 7 -8 A8 8 0 0 1 12 10 Z" />}
      {kind === 'heart' && <path d="M0 14 C-18 2 -16 -14 -6 -13 Q-1 -12 0 -6 Q1 -12 6 -13 C16 -14 18 2 0 14 Z" />}
      {kind === 'news' && <><rect x={-14} y={-13} width={28} height={26} rx={3} />
        <rect x={-10} y={-8} width={20} height={5} fill="#00000044" /><rect x={-10} y={1} width={9} height={8} fill="#00000044" />
        <rect x={2} y={1} width={8} height={2.5} fill="#00000044" /><rect x={2} y={6} width={8} height={2.5} fill="#00000044" /></>}
      {kind === 'game' && <><rect x={-16} y={-8} width={32} height={18} rx={9} />
        <path d="M-9 1 H-3 M-6 -2 V4" stroke="#00000055" strokeWidth={3} strokeLinecap="round" />
        <circle cx={6} cy={-1} r={2.5} fill="#00000055" /><circle cx={10} cy={4} r={2.5} fill="#00000055" /></>}
      {kind === 'clock' && <><circle cx={0} cy={0} r={14} /><path d="M0 -8 V0 L6 5" stroke="#00000055"
        strokeWidth={3.5} fill="none" strokeLinecap="round" /></>}
      {kind === 'phone' && <path d="M-10 -14 Q-4 -15 -3 -9 L-5 -4 Q-1 4 5 6 L9 3 Q15 4 14 10 L12 14
        Q-14 12 -14 -10 Z" />}
      {kind === 'photo' && <><rect x={-15} y={-12} width={30} height={24} rx={4} />
        <path d="M-12 9 L-3 -1 L3 5 L7 1 L12 9 Z" fill="#00000044" /><circle cx={7} cy={-5} r={3} fill="#00000044" /></>}
      {kind === 'cart' && <><path d="M-16 -12 H-10 L-6 6 H11 L15 -6 H-8" stroke="#FFFFFF" strokeWidth={4}
        fill="none" strokeLinejoin="round" /><circle cx={-4} cy={12} r={3} /><circle cx={9} cy={12} r={3} /></>}
    </g>
  );

export const APPS: { sym: Sym; col: string }[] = [
  { sym: 'mail', col: '#E8554E' }, { sym: 'camera', col: '#F2A33A' }, { sym: 'music', col: '#E0487F' },
  { sym: 'pin', col: '#3FB36A' }, { sym: 'chat', col: '#25B47E' }, { sym: 'calendar', col: '#4C8BF0' },
  { sym: 'bank', col: '#7C5CE8' }, { sym: 'clock', col: '#3A4A66' }, { sym: 'phone', col: '#2FB85A' },
  { sym: 'photo', col: '#F0784A' }, { sym: 'cart', col: '#F2B53A' },
  { sym: 'cloud', col: '#4FA3E8' }, { sym: 'heart', col: '#E84A6A' }, { sym: 'news', col: '#5A6B8C' },
  { sym: 'game', col: '#8A5CF0' },
];

export const AppBuilding: React.FC<{ x: number; base: number; w: number; h: number; app: typeof APPS[0];
  seed: number; t: number; far?: number; hideSign?: boolean }> =
  ({ x, base, w, h, app, seed, t, far = 0, hideSign = false }) => {
  const body = mix(mix(app.col, '#1A3350', 0.55), '#0D2E4A', far);
  const face = mix(body, '#FFFFFF', 0.10);
  const sign = mix(app.col, '#0D2E4A', far * 0.8);
  const y = base - h;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h + 80} fill={body} />
      <rect x={x} y={y} width={w * 0.14} height={h + 80} fill={face} />
      {/* windows as horizontal bands: a building, not a spreadsheet */}
      {Array.from({ length: Math.floor((h - 70) / 44) }, (_, r) => (
        <rect key={r} x={x + w * 0.2} y={y + 70 + r * 44} width={w * 0.6} height={12} rx={3}
          fill="#9FF3FF" opacity={(hash01(seed + r, 5) > 0.35 ? 0.35 : 0.08) * (1 - far * 0.6)} />
      ))}
      {/* the rooftop sign is the app's IDENTITY: a rounded tile with its symbol */}
      {!hideSign && far < 0.7 && <>
        <rect x={x + w / 2 - 30} y={y - 70} width={60} height={60} rx={16} fill={sign} />
        <rect x={x + w / 2 - 3} y={y - 12} width={6} height={12} fill={body} />
        <Symbol kind={app.sym} cx={x + w / 2} cy={y - 40} s={1.05} color={mix('#FFFFFF', '#0D2E4A', far * 0.6)} />
      </>}
      {far < 0.3 && <Light cx={x + w / 2} cy={y - 40} r={90} color={app.col} k={0.35} />}
    </g>
  );
};

/* the city behind the wall. It has one job — say "apps live here" — and then it must get out of
   the way, so it is DARK and low in contrast, and only the nearer row carries a lit sign. The near
   row is exported as data: at the end of the scene each sign lifts off its own roof and becomes an
   icon on the home screen, because the city of apps IS the home screen. */
export const NEAR = [
  { x: 60, w: 122, h: 196, app: 0 }, { x: 250, w: 118, h: 150, app: 2 },
  { x: 432, w: 122, h: 232, app: 4 }, { x: 1000, w: 118, h: 170, app: 5 },
  { x: 610, w: 110, h: 132, app: 6 },
];
/* the plot the new app will be built on: left EMPTY until it is */
export const PLOT = { x: 800, w: 150 };
export const signAt = (i: number) => {
  const b = NEAR[i];
  return { x: b.x + b.w / 2, y: I.wallTop + 20 - b.h - 40 };
};
export const AppCity: React.FC<{ t: number; lift?: number }> = ({ t, lift = 0 }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => (
      <AppBuilding key={`f${i}`} x={-340 + i * 168} base={I.wallTop + 20} w={116}
        h={240 + hash01(i, 71) * 150} app={APPS[(i + 3) % APPS.length]} seed={i * 11} t={t} far={0.8} />
    ))}
    {NEAR.map((b, k) => (
      <AppBuilding key={`n${k}`} x={b.x} base={I.wallTop + 20} w={b.w} h={b.h} app={APPS[b.app]}
        seed={k * 17 + 3} t={t} far={0.40} hideSign={lift > 0.001} />
    ))}
  </g>
);

/* ── THE WALL ───────────────────────────────────────────────────────────────────────────────
   A defence, drawn as one: a thick front face, a walkway on top, rounded merlons, a glowing
   crest where the security field runs, and a shield on each bay. `open` lowers the side door. */
export const Wall: React.FC<{ t: number; field?: number; hit?: number; doorOpen?: number;
  doorMark?: number }> = ({ t, field = 1, hit = 0, doorOpen = 0, doorMark = 0 }) => {
  const gf = gid('wallFace');
  const y = I.wallTop, h = I.wallH;
  const g0 = I.gateX - I.gateW / 2, g1 = I.gateX + I.gateW / 2;
  const d0 = I.doorX - I.doorW / 2, d1 = I.doorX + I.doorW / 2;
  const seg = (a: number, b: number, key: string) => (
    <g key={key}>
      <rect x={a} y={y} width={b - a} height={h} fill={`url(#${gf})`} />
      {/* masonry courses: fabrication, so it is a wall and not a bar */}
      {[0.33, 0.66].map((k) => <rect key={k} x={a} y={y + h * k} width={b - a} height={3} fill={WALL_DD} opacity={0.45} />)}
      {Array.from({ length: Math.ceil((b - a) / 90) }, (_, i) => (
        <rect key={i} x={a + i * 90 + (Math.floor(i) % 2) * 45} y={y + h * 0.33} width={3} height={h * 0.33}
          fill={WALL_DD} opacity={0.35} />
      ))}
      {/* merlons along the top */}
      {Array.from({ length: Math.floor((b - a) / 56) }, (_, i) => (
        <rect key={`m${i}`} x={a + 8 + i * 56} y={y - 34} width={38} height={40} rx={9} fill={WALL} />
      ))}
    </g>
  );
  /* the security field along the crest: a line of light that ripples where something hits it */
  const crest = (a: number, b: number) => {
    const pts: string[] = [];
    for (let x = a; x <= b; x += 12) {
      const d = Math.abs(x - I.doorX);
      const ripple = hit * Math.exp(-d / 110) * Math.sin(d * 0.08 - t * 18) * 14;
      pts.push(`${x},${y - 40 + ripple}`);
    }
    return pts.join(' ');
  };
  const fieldCol = mix(P.teal, P.amber, clamp01(hit * 1.6));
  return (
    <g>
      <defs><LinGrad id={gf} stops={[[0, WALL], [0.18, WALL_D], [1, WALL_DD]]} /></defs>
      {/* behind: the gate's passage and the door's gap show the city through them */}
      {seg(-500, g0, 'a')}
      {seg(g1, d0, 'b')}
      {seg(d1, W + 500, 'c')}
      {/* THE SIDE DOOR: a section of the SAME wall that lowers like a drawbridge when allowed */}
      <defs>
        <clipPath id="doorSlot"><rect x={d0 - 4} y={y - 60} width={d1 - d0 + 8} height={h + 60} /></clipPath>
      </defs>
      {/* through the opening the lit city shows — the gap is a PASSAGE, not a missing texture */}
      <defs><LinGrad id={gid('doorLight')} x1={0} y1={0} x2={0} y2={1}
        stops={[[0, '#0E4A5E'], [0.55, '#2C9BA6'], [1, '#8BF7E2']]} /></defs>
      <rect x={d0} y={y} width={d1 - d0} height={h} fill={`url(#${gid('doorLight')})`} />
      {/* light spills OUT of the new opening onto the plaza: something is now let through */}
      {doorOpen > 0.02 && <>
        <path d={`M${d0} ${I.ground} L${d1} ${I.ground} L${d1 + 260} ${I.ground + 700} L${d0 - 260} ${I.ground + 700} Z`}
          fill="#8BF7E2" opacity={0.16 * doorOpen} />
        <Light cx={I.doorX} cy={y + h} r={260} color="#8BF7E2" k={0.5 * doorOpen} />
      </>}
      <g clipPath="url(#doorSlot)">
        <g transform={`translate(0 ${ease.inOut(doorOpen) * (h + 60)})`}>
          {seg(d0, d1, 'door')}
        </g>
      </g>
      {/* the slot's lintel: the door went INTO the wall's foot, and this is where */}
      <rect x={d0 - 6} y={y + h - 6} width={d1 - d0 + 12} height={12} fill={WALL_DD} opacity={doorOpen} />
      {/* the security field: visible, continuous, and it is what the parcel actually hits */}
      <polyline points={crest(-500, W + 500)} fill="none" stroke={fieldCol} strokeWidth={5}
        opacity={0.55 * field} strokeLinecap="round" />
      <polyline points={crest(-500, W + 500)} fill="none" stroke={fieldCol} strokeWidth={16}
        opacity={0.12 * field} strokeLinecap="round" />
      {/* the impact, on the FACE of the wall: rings spreading from the point of contact */}
      {hit > 0.02 && [0, 1, 2].map((i) => {
        const ph = ((t * 1.6) + i / 3) % 1;
        return <ellipse key={i} cx={I.doorX} cy={y + h * 0.55} rx={30 + ph * 150} ry={14 + ph * 70}
          fill="none" stroke={P.amber} strokeWidth={4 * (1 - ph)} opacity={hit * (1 - ph) * 0.8} />;
      })}
      {/* shields on the bays: the wall says what it is without a word */}
      {[g1 + (d0 - g1) / 2].map((cx, i) => (
        <g key={i} transform={`translate(${cx} ${y + h * 0.52})`}>
          <path d="M0 -34 L28 -24 V2 C28 20 14 30 0 36 C-14 30 -28 20 -28 2 V-24 Z" fill={WALL_DD} />
          <path d="M0 -26 L20 -19 V1 C20 14 10 22 0 26 C-10 22 -20 14 -20 1 V-19 Z" fill={WALL} />
        </g>
      ))}
      {/* the source's mark over the new door, arriving as the door opens */}
      {doorMark > 0.01 && (
        <g transform={`translate(${I.doorX} ${y - 100}) scale(${0.6 + ease.out(doorMark) * 0.4})`}
          opacity={doorMark}>
          <Light cx={0} cy={0} r={110} color="#25D98F" k={0.6} />
          <rect x={-40} y={-40} width={80} height={80} rx={22} fill="#1FB483" />
          <Symbol kind="chat" cx={0} cy={0} s={1.5} />
        </g>
      )}
    </g>
  );
};

/* ── THE STORE GATE — the one sanctioned way in ─────────────────────────────────────────────*/
export const StoreGate: React.FC<{ t: number; scan?: number }> = ({ t, scan = 1 }) => {
  const x0 = I.gateX - I.gateW / 2, y = I.wallTop;
  const gb = gid('gateBeam');
  const sweep = (t * 0.9) % 1;
  return (
    <g>
      <defs><LinGrad id={gb} x1={0} y1={0} x2={0} y2={1}
        stops={[[0, '#45F0B0', 0.0], [0.5, '#45F0B0', 0.45], [1, '#45F0B0', 0.0]]} /></defs>
      {/* the towers either side of the arch — heavier than the wall, because a gate is guarded */}
      {[x0 - 30, x0 + I.gateW - 20].map((tx, i) => (
        <g key={i}>
          <rect x={tx} y={y - 140} width={50} height={I.wallH + 140} rx={10} fill={WALL} />
          <rect x={tx} y={y - 140} width={10} height={I.wallH + 140} fill="#FFFFFF" opacity={0.4} />
          <rect x={tx - 6} y={y - 160} width={62} height={28} rx={10} fill={WALL_D} />
        </g>
      ))}
      {/* the arch over the passage */}
      <path d={`M${x0 + 20} ${y + 10} Q${I.gateX} ${y - 130} ${x0 + I.gateW - 20} ${y + 10}`}
        fill="none" stroke={WALL} strokeWidth={26} />
      {/* the store's symbol: a bag with a play triangle — no name needed */}
      <g transform={`translate(${I.gateX} ${y - 250})`}>
        <Light cx={0} cy={0} r={230} color="#45F0B0" k={0.85} />
        <path d="M-50 -30 H50 L42 48 Q41 56 33 56 H-33 Q-41 56 -42 48 Z" fill="#1E8C66" />
        <path d="M-24 -30 V-44 A24 24 0 0 1 24 -44 V-30" fill="none" stroke="#1E8C66" strokeWidth={8} />
        <path d="M-14 -6 L22 14 L-14 34 Z" fill="#E9FFF5" />
      </g>
      {/* the scanning curtain: a sheet of light every app passes through */}
      <Light cx={I.gateX} cy={y + I.wallH * 0.5} r={260} color="#45F0B0" k={0.55 * scan} />
      <rect x={x0 + 22} y={y + 6} width={I.gateW - 44} height={I.wallH - 6} fill={`url(#${gb})`}
        opacity={0.85 * scan} />
      <rect x={x0 + 22} y={y + 6 + sweep * (I.wallH - 14)} width={I.gateW - 44} height={6}
        fill="#8BFFD2" opacity={0.85 * scan} />
    </g>
  );
};

/* ── THE PARCEL — the .apk, as a thing ──────────────────────────────────────────────────────
   Cardboard, taped, and stamped with an app-grid glyph: it is a PACKAGE, and it contains an app. */
export const Parcel: React.FC<{ x: number; y: number; s: number; rot?: number; squash?: number }> =
  ({ x, y, s, rot = 0, squash = 0 }) => {
    const gp = gid('parcel');
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + squash * 0.12)} ${s * (1 - squash * 0.12)})`}>
        <defs><LinGrad id={gp} stops={[[0, '#E2B07A'], [0.5, '#C98E55'], [1, '#9E6A3C']]} /></defs>
        <ellipse cx={0} cy={52} rx={60} ry={10} fill="#00000055" />
        <rect x={-54} y={-46} width={108} height={96} rx={8} fill={`url(#${gp})`} />
        {/* the lid edge and the tape: the two things that make a box a parcel */}
        <rect x={-54} y={-46} width={108} height={20} rx={6} fill="#EBC08E" />
        <rect x={-9} y={-46} width={18} height={96} fill="#F3D9A8" opacity={0.9} />
        {/* the glyph: an app grid, stencilled */}
        <g transform="translate(24 16)" fill="#6B4323" opacity={0.85}>
          {[0, 1].map((r) => [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={-12 + c * 13} y={-12 + r * 13} width={10} height={10} rx={2.5} />
          )))}
        </g>
      </g>
    );
  };

/* ── THE COURIER — the messenger's own craft, a green chat bubble that carries the parcel ───*/
export const Courier: React.FC<{ x: number; y: number; s: number; t: number; carry?: boolean }> =
  ({ x, y, s, t, carry = true }) => {
    const bob = Math.sin(t * 5) * 4;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <Light cx={0} cy={70} r={120} color="#25D98F" k={0.45} />
        {/* thrust under it, so it is a thing that moves, not a sticker */}
        <path d="M-30 58 L-18 96 L-6 58 Z M6 58 L18 96 L30 58 Z" fill="#8BFFCF" opacity={0.55} />
        <path d="M-70 -28 Q-70 -48 -50 -48 H50 Q70 -48 70 -28 V30 Q70 50 50 50 H-20 L-46 70 L-40 50
                 H-50 Q-70 50 -70 30 Z" fill="#1FB483" />
        <path d="M-60 -40 H56" stroke="#8BF3CC" strokeWidth={5} strokeLinecap="round" />
        <Symbol kind="chat" cx={-28} cy={4} s={1.4} color="#E9FFF5" />
        {carry && <Parcel x={36} y={-78} s={0.7} />}
      </g>
    );
  };

/* ── THE WARNING — a shield with an exclamation, large, on the wall at the point of impact ──*/
export const WarnShield: React.FC<{ x: number; y: number; s: number; on: number }> =
  ({ x, y, s, on }) => (
    <g transform={`translate(${x} ${y}) scale(${s * (0.7 + ease.out(on) * 0.3)})`} opacity={on}>
      <Light cx={0} cy={0} r={200} color={P.amber} k={0.7} />
      <path d="M0 -84 L70 -58 V6 C70 50 36 76 0 92 C-36 76 -70 50 -70 6 V-58 Z" fill="#B4651A" />
      <path d="M0 -70 L56 -49 V5 C56 41 28 62 0 76 C-28 62 -56 41 -56 5 V-49 Z" fill={P.amber} />
      <rect x={-9} y={-44} width={18} height={62} rx={9} fill="#4A2A06" />
      <circle cx={0} cy={40} r={11} fill="#4A2A06" />
    </g>
  );

/* ── THE SWITCH — "Allow from this source", as a symbol: the source's mark and a toggle ─────*/
export const SourceSwitch: React.FC<{ x: number; y: number; s: number; on: number; press: number }> =
  ({ x, y, s, on, press }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-150} y={-62} width={300} height={124} rx={30} fill="#EAF1FF" />
      <rect x={-150} y={-62} width={300} height={124} rx={30} fill="none" stroke={WALL_DD} strokeWidth={4} />
      <rect x={-128} y={-40} width={80} height={80} rx={22} fill="#1FB483" />
      <Symbol kind="chat" cx={-88} cy={0} s={1.5} />
      {/* the toggle: the one moving part */}
      <g transform={`translate(0 ${press * 3})`}>
        <rect x={-10} y={-30} width={130} height={60} rx={30}
          fill={mix('#A9B5CE', P.green, ease.out(on))} />
        <circle cx={20 + ease.out(on) * 70} cy={0} r={25 - press * 3} fill="#FFFFFF" />
      </g>
    </g>
  );

/* ── THE FAKE OFFICE — the app, as a building, and it looks like a government office ───────
   `build` erects it in construction order: plinth, columns, entablature, pediment, seal. */
export const Office: React.FC<{ x: number; base: number; s: number; build: number }> =
  ({ x, base, s, build }) => {
    const st = (a: number, b: number) => ease.out(clamp01((build - a) / (b - a)));
    const plinth = st(0, 0.2), cols = st(0.15, 0.55), beam = st(0.5, 0.7), ped = st(0.65, 0.85), seal = st(0.8, 1);
    const stone = '#EEF2FA', stoneD = '#B8C3DC';
    return (
      <g transform={`translate(${x} ${base}) scale(${s})`}>
        {plinth > 0 && <rect x={-150} y={-24 * plinth} width={300} height={24 * plinth} fill={stoneD} />}
        {plinth > 0 && <rect x={-160} y={-24 * plinth - 12} width={320} height={12} rx={3} fill={stone} />}
        {[-112, -56, 0, 56, 112].map((cx, i) => {
          const hh = 150 * clamp01(cols * 1.25 - i * 0.06);
          return hh > 0 ? <g key={i}>
            <rect x={cx - 14} y={-36 - hh} width={28} height={hh} fill={stone} />
            <rect x={cx - 14} y={-36 - hh} width={7} height={hh} fill="#FFFFFF" opacity={0.6} />
          </g> : null;
        })}
        {beam > 0 && <rect x={-170} y={-186 - 20 * beam} width={340} height={22} rx={4} fill={stone}
          opacity={beam} />}
        {ped > 0 && <path d={`M-176 ${-208} L0 ${-208 - 86 * ped} L176 ${-208} Z`} fill={stone} />}
        {seal > 0 && (
          <g transform={`translate(0 -240) scale(${seal})`}>
            <circle r={22} fill="#3461DC" />
            <circle r={15} fill="none" stroke="#DCE6FF" strokeWidth={3} />
            <path d="M-8 4 L0 -8 L8 4" fill="none" stroke="#DCE6FF" strokeWidth={3.5} />
          </g>
        )}
        {/* the flag: the official thing, flying — and it is generic, no real flag */}
        {seal > 0.5 && (
          <g>
            <rect x={150} y={-330} width={5} height={130} fill={stoneD} />
            <path d={`M155 -330 q 40 ${-6 + Math.sin(build * 10) * 4} 70 6 v 36 q -34 -10 -70 -2 Z`}
              fill="#3461DC" />
          </g>
        )}
      </g>
    );
  };

/* ── THE GROUND OUTSIDE THE WALL, and the road to the gate ──────────────────────────────────*/
export const Approach: React.FC<{ t: number }> = ({ t }) => {
  const gg = gid('approachGround');
  const x0 = I.gateX - I.gateW / 2 + 22, x1 = I.gateX + I.gateW / 2 - 22;
  return (
    <g>
      <defs><LinGrad id={gg} stops={[[0, '#1F6E80'], [0.4, '#154B63'], [1, '#0B2438']]} /></defs>
      <rect x={-600} y={I.ground} width={W + 1200} height={H + 600} fill={`url(#${gg})`} />
      <rect x={-600} y={I.ground} width={W + 1200} height={6} fill="#5FD6E4" opacity={0.35} />
      {/* paving in perspective, radiating from the gate: the plaza is a SURFACE with depth, and
          every line in it leads the eye to the one sanctioned way in */}
      {Array.from({ length: 13 }, (_, i) => {
        const bx = -520 + i * 190;
        return <path key={`r${i}`} d={`M${I.gateX + (i - 6) * 10} ${I.ground} L${bx} ${H + 300}`}
          stroke="#7FE3EE" strokeWidth={2} opacity={0.10} />;
      })}
      {Array.from({ length: 7 }, (_, j) => {
        const yy = I.ground + Math.pow((j + 1) / 7, 1.8) * (H - I.ground + 200);
        return <rect key={`c${j}`} x={-600} y={yy} width={W + 1200} height={2} fill="#7FE3EE"
          opacity={0.09} />;
      })}
      {/* data motes rising off the plaza: the device is alive, quietly */}
      {Array.from({ length: 22 }, (_, i) => {
        const u = ((t * (0.05 + (i % 5) * 0.012) + i * 0.137) % 1);
        const xx = -60 + ((i * 197) % 1200);
        return <circle key={`m${i}`} cx={xx + Math.sin(t + i) * 10} cy={lerp(H + 100, I.ground - 400, u)}
          r={2 + (i % 3)} fill="#8BF7E2" opacity={0.25 * Math.sin(u * Math.PI)} />;
      })}
      {/* the store's road: it widens toward camera, which is what gives the plaza depth */}
      <path d={`M${x0} ${I.ground} L${x1} ${I.ground} L${x1 + 260} ${H + 40} L${x0 - 220} ${H + 40} Z`}
        fill="#2A8A8C" opacity={0.40} />
      <path d={`M${x0 + 30} ${I.ground} L${x1 - 30} ${I.ground} L${x1 + 150} ${H + 40} L${x0 - 110} ${H + 40} Z`}
        fill="#45F0B0" opacity={0.07} />

    </g>
  );
};

/** the orderly queue: apps from the store arriving in single file and passing the scan, ticked */
export const Queue: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => (
  <g>
    {Array.from({ length: 4 }, (_, i) => {
      const u = ((t * 0.14 + i / 4) % 1);
      const yy = lerp(H - 90, I.ground - 40, u);
      const s = lerp(1.5, 0.7, u);
      const xx = lerp(I.gateX + 30, I.gateX, u);
      const scanned = u > 0.93;
      const app = APPS[(i * 3) % APPS.length];
      return (
        <g key={i} transform={`translate(${xx} ${yy}) scale(${s})`} opacity={k * (u > 0.985 ? 0 : 1)}>
          <ellipse cx={0} cy={44} rx={40} ry={8} fill="#00000044" />
          <rect x={-36} y={-36} width={72} height={72} rx={20} fill={app.col} />
          <Symbol kind={app.sym} cx={0} cy={0} s={1.2} />
          {/* the tick is EARNED at the curtain; it is not decoration */}
          {scanned && <g transform="translate(30 -30)">
            <circle r={16} fill="#45F0B0" /><path d="M-7 0 l5 5 l9 -10" stroke="#063" strokeWidth={4} fill="none" />
          </g>}
        </g>
      );
    })}
  </g>
);

/* ── THE USER'S FINGERTIP, seen from INSIDE the phone ──────────────────────────────────────
   From under the glass you see the PAD of a finger: a broad rounded tip, the whorl of a print, and
   — where it presses — a flattened pale contact patch. The print is the diagnostic detail: it is
   what makes this a fingertip and not a pink capsule. */
export const Fingertip: React.FC<{ x: number; y: number; s: number; press?: number }> =
  ({ x, y, s, press = 0 }) => {
    const gf = gid('fingerPad');
    const w = 176;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <defs><LinGrad id={gf} x1={0} y1={0} x2={1} y2={0}
          stops={[[0, '#D9906C'], [0.35, '#F2B48E'], [0.7, '#F7C6A4'], [1, '#D08A66']]} /></defs>
        {/* its shadow falls on the world below it — it is ABOVE everything, on the glass */}
        <ellipse cx={34} cy={60} rx={w * 0.52} ry={46} fill="#021018" opacity={0.28 * (1 - press * 0.5)} />
        <path d={`M${-w / 2} -1400 L${-w / 2} -${w * 0.5} A${w / 2} ${w / 2} 0 0 0 ${w / 2} -${w * 0.5}
                  L${w / 2} -1400 Z`} fill={`url(#${gf})`} transform={`translate(0 ${w * 0.5 - 8})`} />
        {/* the print: nested arcs around the pad's centre */}
        {/* the print: a whorl — nested loops around the pad's centre, the one mark that says
            FINGERTIP from underneath */}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={0} cy={-34} rx={16 + i * 13} ry={11 + i * 10} fill="none"
            stroke="#B8704E" strokeWidth={4} opacity={0.5 - i * 0.05} />
        ))}
        {/* the crease at the first joint, higher up the finger */}
        <path d={`M${-w / 2 + 10} -300 Q0 -286 ${w / 2 - 10} -300`} stroke="#B8704E" strokeWidth={5}
          fill="none" opacity={0.45} />
        {/* the contact patch: skin flattened against glass goes pale */}
        <ellipse cx={0} cy={-30} rx={70 + press * 22} ry={40 + press * 10} fill="#FFE3D2"
          opacity={0.22 + press * 0.55} />
      </g>
    );
  };

/* the control, on a post in the plaza in front of the wall: the source's mark and a toggle */
export const SwitchPost: React.FC<{ x: number; y: number; on: number; press: number }> =
  ({ x, y, on, press }) => (
    <g>
      <ellipse cx={x} cy={y + 170} rx={90} ry={16} fill="#00000044" />
      <rect x={x - 16} y={y + 40} width={32} height={130} rx={10} fill={WALL_DD} />
      <rect x={x - 16} y={y + 40} width={9} height={130} fill={WALL} opacity={0.5} />
      <SourceSwitch x={x} y={y} s={0.95} on={on} press={press} />
    </g>
  );
/** where the toggle knob is, in the same coordinates — the finger's target, and QA's */
export const knobAt = (x: number, y: number, on: number) => ({ x: x + (20 + on * 70) * 0.95, y });

/* a puff of dust where something lands: a few round clouds that expand and thin */
export const Puff: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <g opacity={1 - p}>
      {[-1, -0.4, 0.4, 1].map((d, i) => (
        <circle key={i} cx={x + d * (30 + p * 90)} cy={y - p * 30 * (1 - Math.abs(d) * 0.4)}
          r={18 + p * 26} fill="#CFE8F0" opacity={0.5} />
      ))}
    </g>
  );
};
