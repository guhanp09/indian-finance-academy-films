/* THE DESIGN BOARD — the permission mechanism, rendered from the FILM'S OWN components at the
 * film's own times, so nothing here can be true of the board and false of the cut.
 * Rule "mockups before renders": this is the surface the direction is agreed on before animating.
 *
 *   node tools/echallan/stills.mjs PermBoard perm 0 1 2 3 4 5 6 7 8 9 10 11
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { H, W } from '../design';
import { Inside2 } from './act2';
import { F, PlayGate, Plaza, Q, Sky3, Wall3, WallState } from './fortress';
import { AppTile } from './mark';

type Shot = { t: number; x: number; y: number; z: number; label: string };
const SHOTS: Shot[] = [
  { t: 52.00, x: 540, y: 660, z: 0.60, label: 'the whole argument: four organs, one eye' },
  { t: 52.00, x: 680, y: 505, z: 1.42, label: 'the app building, colonised' },
  { t: 38.30, x: 690, y: 300, z: 1.90, label: 'the antenna, locked' },
  { t: 38.95, x: 560, y: 560, z: 0.70, label: 'the ask: a wavefront crossing the city' },
  { t: 39.62, x: 150, y: 620, z: 1.55, label: 'it arrives, and the post office asks' },
  { t: 41.55, x: 430, y: 520, z: 0.82, label: 'the answer goes back the way it came' },
  { t: 42.60, x: 548, y: 500, z: 2.00, label: 'SMS: the mail hoist' },
  { t: 45.30, x: 872, y: 512, z: 2.00, label: 'CALLS: the line tap, off the hook' },
  { t: 49.30, x: 540, y: 430, z: 0.84, label: 'BACKGROUND: the eye' },
  { t: 51.85, x: 800, y: 400, z: 1.75, label: 'VPN: the satellite' },
];

const GATE: WallState[] = [
  { hit: 0, hitX: F.door.cx, wake: 1, ask: 1, press: 0, lit: 0, pulse: 0, boltL: 0, boltR: 0, fieldOff: 0, sink: 0 },
  { hit: 0, hitX: F.door.cx, wake: 1, ask: 0, press: 1, lit: 1, pulse: 0.62, boltL: 0.7, boltR: 0.4, fieldOff: 0.3, sink: 0 },
  { hit: 0, hitX: F.door.cx, wake: 1, ask: 0, press: 0, lit: 1, pulse: 1, boltL: 1, boltR: 1, fieldOff: 1, sink: 0.55 },
  { hit: 0, hitX: F.door.cx, wake: 1, ask: 0, press: 0, lit: 1, pulse: 1, boltL: 1, boltR: 1, fieldOff: 1, sink: 1, stow: 0.4 },
];

export const PERM_FRAMES = SHOTS.length + GATE.length + 1;

/* THE SILENT TEST SURFACE. The same beats, in film order, with no caption, no subtitle and no
   sound — which is the only honest way to ask someone who knows nothing about this film what they
   think is happening. One frame per beat. */
const SILENT: Shot[] = [
  { t: 37.40, x: 690, y: 700, z: 1.38, label: '' },
  { t: 38.30, x: 690, y: 555, z: 1.46, label: '' },
  { t: 38.90, x: 640, y: 680, z: 0.84, label: '' },
  { t: 39.46, x: 200, y: 556, z: 1.02, label: '' },
  { t: 41.10, x: 168, y: 618, z: 1.12, label: '' },
  { t: 41.32, x: 420, y: 470, z: 0.78, label: '' },
  { t: 41.72, x: 600, y: 420, z: 1.10, label: '' },
  { t: 42.10, x: 560, y: 552, z: 1.20, label: '' },
  { t: 42.70, x: 560, y: 552, z: 1.20, label: '' },
  { t: 44.90, x: 812, y: 556, z: 1.20, label: '' },
  { t: 45.30, x: 812, y: 556, z: 1.20, label: '' },
  { t: 47.96, x: 560, y: 470, z: 0.68, label: '' },
  { t: 48.60, x: 540, y: 470, z: 0.60, label: '' },
  { t: 51.30, x: 610, y: 424, z: 1.02, label: '' },
  { t: 51.95, x: 610, y: 330, z: 0.94, label: '' },
  { t: 52.10, x: 540, y: 660, z: 0.62, label: '' },
];
export const SILENT_FRAMES = SILENT.length;
export const PermSilent: React.FC = () => {
  const f = useCurrentFrame();
  const s = SILENT[Math.min(f, SILENT.length - 1)];
  return (
    <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${s.z}) translate(${-s.x} ${-s.y})`}>
          <Inside2 t={s.t} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <g>
    <rect x={0} y={H - 96} width={W} height={96} fill="#05040F" opacity={0.86} />
    <text x={38} y={H - 38} fontSize={34} fontWeight={800} fill="#8FE8FF"
      fontFamily='"Inter Tight","Inter",Arial,sans-serif'>{String(n).padStart(2, '0')}</text>
    <text x={104} y={H - 38} fontSize={32} fontWeight={600} fill="#DCE6FF"
      fontFamily='"Inter Tight","Inter",Arial,sans-serif'>{text}</text>
  </g>
);

export const PermBoard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SHOTS.length) {
    const s = SHOTS[f];
    return (
      <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 960) scale(${s.z}) translate(${-s.x} ${-s.y})`}>
            <Inside2 t={s.t} />
          </g>
          <Caption n={f} text={s.label} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (f < SHOTS.length + GATE.length) {
    const k = f - SHOTS.length;
    const label = ['the wall, shut — six shot bolts, no beam over it',
      'ALLOW: the pulse runs, the left rank clears first',
      'nothing is holding it: 340 of precast drops into the threshold',
      'open — the whole colonnade, where a fifth of it used to show'][k];
    return (
      <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 960) scale(1.30) translate(-640 -1000)`}>
            <Sky3 t={3} />
            <Inside2 t={52.0} />
            <g>
              <Wall3 s={GATE[k]} t={3} />
              <PlayGate t={3} k={0.55} />
              <Plaza t={3} spill={GATE[k].sink} />
            </g>
          </g>
          <Caption n={f} text={label} />
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0F22' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <text x={W / 2} y={230} fontSize={40} fontWeight={800} fill="#DCE6FF" textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>THE MARK</text>
        <text x={W / 2} y={286} fontSize={27} fontWeight={500} fill="#8FA6DC" textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>a traffic camera, which is where an e-Challan comes from</text>
        {[[270, 132, 0], [540, 132, 0], [810, 132, 1]].map(([x, s2, rec], i) => (
          <g key={i} transform={`translate(${x} 560)`}>
            <AppTile s={s2} rec={rec} open={rec ? 0.9 : 0.62} />
          </g>
        ))}
        {[[270, 44], [540, 30], [810, 20]].map(([x, s2], i) => (
          <g key={`s${i}`} transform={`translate(${x} 860)`}><AppTile s={s2} /></g>
        ))}
        <text x={270} y={980} fontSize={25} fill="#9FB0D8" textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>home screen</text>
        <text x={540} y={980} fontSize={25} fill="#9FB0D8" textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>app header</text>
        <text x={810} y={980} fontSize={25} fill="#9FB0D8" textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>notification</text>
        <text x={810} y={396} fontSize={25} fill={Q.deny} textAnchor="middle"
          fontFamily='"Inter Tight","Inter",Arial,sans-serif'>+ one light, once it may run in the background</text>
        <Caption n={PERM_FRAMES - 1} text="the app's identity, at the sizes it is actually seen" />
      </svg>
    </AbsoluteFill>
  );
};
