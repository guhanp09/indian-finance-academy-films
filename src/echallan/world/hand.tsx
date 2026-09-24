/* THE HAND — reused, not redrawn.
 *
 * The geometry is the audited rig from the previous film in this series (src/upi-scam/world/
 * hand-geometry.mjs, spec at docs/upi-scam/hand-spec.md): FW units, a declared chirality, the
 * fingertip PAD as the contact point rather than the apex, a graded knuckle row and a wrist bend
 * spread over a band. premortem F12 — rebuilding it is how hand continuity gets lost, and that rig
 * already survived a raster audit that caught two bugs no amount of reading the constants would.
 *
 * This component only places and paints. It does not shape.
 */
import React from 'react';
import { shadow } from '../design';
import {
  PAD, WRIST_C, contour, creasePaths, nailPath, place, toPath,
} from '../../upi-scam/world/hand-geometry.mjs';

const SKIN = { hand: '#E4B996', line: '#9E6B48' };

export const Hand: React.FC<{
  tip: { x: number; y: number };
  from: { x: number; y: number };
  hand?: 'right' | 'left';
  fw: number;
  bend?: number;
  press?: number;
  opacity?: number;
}> = ({ tip, from, hand = 'right', fw, bend = 12, press = 0, opacity = 1 }) => {
  const { theta, mirror, forearm } = place({ tip, from, fw, hand, bend });
  const pts = contour({ forearm, bend, press });
  const sw = 3 / fw;
  const T = `translate(${tip.x} ${tip.y}) rotate(${theta}) `
    + `scale(${fw * mirror} ${fw}) translate(${-PAD[0]} ${-PAD[1]})`;
  return (
    <g opacity={opacity}>
      {/* contact: the SURFACE answers. A tight shadow under the pad appearing as the pad lands —
          not the whole hand's shadow dropping, which would lay the forearm on the glass too. */}
      {press > 0.01 && (
        <g transform={T} opacity={press * 0.5} style={{ filter: `blur(${0.1 * fw}px)` }}>
          <ellipse cx={PAD[0]} cy={PAD[1] + 0.16} rx={0.26} ry={0.46} fill="#050B1E" />
        </g>
      )}
      <g transform={T} style={{ filter: `drop-shadow(${shadow(16, 0.42)})` }}
        stroke={SKIN.line} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
        <path fill={SKIN.hand} d={toPath(pts)} />
        <path fill="none" strokeWidth={sw * 0.7} d={nailPath()} />
        {creasePaths().map((d: string, i: number) => (
          <path key={i} fill="none" strokeWidth={sw * 0.7} d={d} />
        ))}
      </g>
    </g>
  );
};

/** a curved approach: the hand never travels in a straight line to a control */
export const approach = (
  a: { x: number; y: number }, b: { x: number; y: number }, p: number, lift = 90,
) => {
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const k = Math.sin(e * Math.PI);
  return { x: a.x + (b.x - a.x) * e - k * lift * 0.34, y: a.y + (b.y - a.y) * e - k * lift };
};
