/* THE DESIGN BOARD FOR ACT 3 — the reveal and the theft, drawn from the film's own components
 * before a frame of it is animated. (rule: mockups before renders)
 *
 *   node tools/echallan/stills.mjs Act3Board a3 0 1 2 3 4 5 6 7 8 9 10 11
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, H, SCREEN, STATUS_H, W } from '../design';
import { Inside2, MNT, TIP } from './act2';
import { PaymentForm, PaymentSuccess, EchallanApp, UpdateCard } from '../world/screens';
import { PhoneShell, StatusBar } from '../world/device';
import { CardToken, CodeToken, DECK_N, PaneEdge, SHELL, STATION, Station, Tally, deckPane }
  from './shell';

type Shot = { label: string; what: 'city' | 'shell' | 'deck' | 'station';
  x: number; y: number; z: number; t?: number; k?: Record<string, number> };

const SHOTS: Shot[] = [
  /* where the act starts, and what it inherits */
  { label: '1 · THE LIE — the phone, settled, the tick holding', what: 'deck', x: 540, y: 960, z: 1.00,
    k: { deck: 0, success: 1 } },
  { label: '2 · THE FRONT — the office at rest, the machine above it', what: 'city', t: 62,
    x: 690, y: 780, z: 1.02 },
  { label: '3 · THE THRESHOLD — the portal, and the lamp that makes it a lobby', what: 'city', t: 62,
    x: 690, y: 1000, z: 2.20 },
  { label: '4 · HALF DOWN — the lamps appear before the room does', what: 'shell',
    x: 690, y: 906, z: 1.86, k: { front: 0.5 } },
  { label: '5 · THE REVEAL — as filmed  (690, 906, 1.86)', what: 'shell',
    x: 690, y: 906, z: 1.86, k: { front: 1 } },
  { label: 'detail · THE BAY  (690, 1010, 2.60)', what: 'shell', x: 690, y: 1010, z: 2.60,
    k: { front: 1 } },
  { label: 'detail · THE PROPS AND THE FRAME  (690, 740, 2.30)', what: 'shell', x: 690, y: 740,
    z: 2.30, k: { front: 1 } },
  { label: '8 · THE FIELDS — the details, where they were typed', what: 'deck', x: 540, y: 720,
    z: 1.30, k: { deck: 1 } },
  { label: '9 · SMS — the hoist, already running, and the post office it draws from',
    what: 'city', t: 62, x: 300, y: 600, z: 0.92 },
  { label: '10 · THE UPLINK — head, feeder, dish, and out', what: 'city', t: 62,
    x: 840, y: 360, z: 1.24 },
  { label: '11 · THE STATION — the other end of the tunnel', what: 'station', x: 2632, y: -872,
    z: 1.42, k: { wake: 1, docked: 1, code: 1 } },
  { label: '12 · BOTH HALVES — a key made of what you gave away', what: 'station', x: 2408,
    y: -662, z: 2.70, k: { wake: 1, docked: 1, code: 1, forge: 1, turn: 1, accept: 1 } },
];
export const A3_FRAMES = SHOTS.length;

export const Deck: React.FC<{ split: number }> = ({ split }) => {
  const panes = [
    <PaymentSuccess key="s" draw={1} settle={1} />,
    <PaymentForm key="f" typed={1} caret={0} />,
    <UpdateBed key="u" />,
    <EchallanApp key="a" detail={1} amount={1} cta={1} />,
  ];
  const CX = SCREEN.x + SCREEN.w / 2, CY = SCREEN.y + SCREEN.h / 2;
  return (
    <g>
      {Array.from({ length: DECK_N }, (_, i) => DECK_N - 1 - i).map((i) => {
        const p = deckPane(i, split);
        return (
          <g key={i} transform={`translate(${CX} ${CY}) translate(0 ${p.dy}) scale(${p.s})
               translate(${-CX} ${-CY})`}>
            <PaneEdge x={SCREEN.x} y={SCREEN.y} w={SCREEN.w} h={SCREEN.h} />
            <g>{panes[i]}</g>
            {p.dim > 0.001 && (
              <rect x={SCREEN.x - 5} y={SCREEN.y - 5} width={SCREEN.w + 10} height={SCREEN.h + 10}
                rx={10} fill="#050A1C" opacity={p.dim} />
            )}
          </g>
        );
      })}
    </g>
  );
};
/** the app's screen with its update dialog on it — the third card in the deck */
const UpdateBed: React.FC = () => (
  <g>
    <EchallanApp detail={1} amount={1} cta={1} />
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#0A1020" opacity={0.34} />
    <UpdateCard y={SCREEN.y + 470} rim={1} />
  </g>
);

export const Act3Board: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(f, SHOTS.length - 1)];
  const k = s.k ?? {};
  const t = s.t ?? 62;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${s.z}) translate(${-s.x} ${-s.y})`}>
          {s.what === 'city' && <Inside2 t={t} a3={{ beam: t > 61 ? 1 : 0 }} />}
          {s.what === 'shell' && (
            <Inside2 t={t} a3={{ front: k.front ?? 1, shell: 1, spine: 0.4 }} />
          )}
          {s.what === 'station' && (
            <g>
              <Station t={t} wake={k.wake ?? 0} docked={k.docked ?? 0} code={k.code ?? 0}
                forge={k.forge ?? 0} turn={k.turn ?? 0} accept={k.accept ?? 0} hot={0.8} />
              <Tally x={STATION.tally.x} y={STATION.tally.y} n={4106} k={k.accept ?? 0} />
            </g>
          )}
          {s.what === 'deck' && (
            <g>
              <rect x={0} y={0} width={W} height={H} fill="#0B1026" />
              <PhoneShell screenBase="#E9EEF7">
                <g />
              </PhoneShell>
              <Deck split={k.deck ?? 0} />
              <StatusBar tint="#C3D0E6" label="10:43" />
            </g>
          )}
        </g>
        {/* the caption is board furniture, never film */}
        <rect x={0} y={H - 96} width={W} height={96} fill="#05040F" opacity={0.86} />
        <text x={36} y={H - 38} fontFamily="Inter, system-ui, sans-serif" fontSize={30}
          fontWeight={700} fill="#CFE0FF">{s.label}</text>
      </svg>
    </AbsoluteFill>
  );
};

export const _ = { C, STATUS_H, TIP, MNT, SHELL, CardToken, CodeToken };
