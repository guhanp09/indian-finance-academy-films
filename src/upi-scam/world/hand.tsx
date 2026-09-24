/* THE POINTING HAND.
 *
 * The drawing is in `hand-geometry.mjs`, in FW units (FW = the index finger's width at its base),
 * and `tools/upi-scam/hand-shot.mjs` + the audit render THAT module and measure the raster. Four
 * attempts failed here, and the two that were bugs rather than misjudgements — a finger widened
 * from two different bases, a knuckle normal pointing into the hand — were both cases of the code
 * not drawing what its variable names said. Reading constants cannot catch that; measuring the
 * render can. So the component is deliberately thin: it places and paints, it does not shape.
 *
 * What it paints, and why (the full argument is docs/upi-scam/hand-spec.md):
 *   · The BACK of the hand. From the palm side the folded fingers sit in front of the extended one
 *     and the eye reads the extended digit as the furthest away — the little finger.
 *   · Chirality is DECLARED, never derived from the angle. An arm entering from the lower right is
 *     the viewer's right hand; from the lower left, the left. Deriving it flips the hand mid-move
 *     the moment a gesture crosses the vertical.
 *   · The target point is the fingertip's PAD, not its apex — the pad is what touches the key.
 */
import React from 'react';
import { shadow } from '../design';
import {
  PAD, WRIST_C, contour, creasePaths, nailPath, place, toPath,
} from './hand-geometry.mjs';

const SKIN = { hand: '#E8BE9B', line: '#A9744F' };

export type HandSide = 'right' | 'left';

export const PointingHand: React.FC<{
  tip: { x: number; y: number };      // where the fingertip's PAD rests
  from: { x: number; y: number };     // the body the arm belongs to, or a point off frame
  hand: HandSide;                     // required: see the note above
  fw: number;                         // screen px per finger-width
  bend?: number;                      // degrees of ULNAR wrist bend
  press?: number;
  opacity?: number;
  /** 'full' = the film's contour language. 'flat' = the figures' language: fill only, no contour,
   *  no interior marks — used when the hand belongs to one of the small figures. */
  detail?: 'full' | 'flat';
  /** 'to' draws the forearm out to `from`; 'none' cuts it at the wrist for a figure's own arm. */
  arm?: 'to' | 'none';
  skin?: string;
}> = ({ tip, from, hand, fw, bend = 12, press = 0, opacity = 1,
        detail = 'full', arm = 'to', skin = SKIN.hand }) => {
  const { theta, mirror, forearm } = place({ tip, from, fw, hand, bend });
  const pts = contour({ forearm: arm === 'none' ? 0 : forearm, bend, press });
  const sw = 3 / fw;
  const place3 = `translate(${tip.x} ${tip.y}) rotate(${theta}) `
    + `scale(${fw * mirror} ${fw}) translate(${-PAD[0]} ${-PAD[1]})`;

  return (
    <g opacity={opacity}>
      {/* contact: the surface answers. A tight shadow under the pad, its long axis along the
          finger, appearing as the pad lands — not the whole hand's shadow dropping, which would
          lay the forearm flat on the glass too. */}
      {press > 0.01 && (
        <g transform={place3} opacity={press * 0.5}
          style={{ filter: `blur(${0.1 * fw}px)` }}>
          <ellipse cx={PAD[0]} cy={PAD[1] + 0.16} rx={0.26} ry={0.46} fill="#050B1E" />
        </g>
      )}
      <g transform={place3} style={{ filter: `drop-shadow(${shadow(16, 0.42)})` }}
        stroke={detail === 'flat' ? 'none' : SKIN.line}
        strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
        <path fill={skin} d={toPath(pts)} />
        {detail === 'full' && (
          <>
            {/* the nail: the one mark that says this is the BACK of the hand */}
            <path fill="none" strokeWidth={sw * 0.7} d={nailPath()} />
            {creasePaths().map((d, i) => (
              <path key={i} fill="none" strokeWidth={sw * 0.7} d={d} />
            ))}
          </>
        )}
      </g>
    </g>
  );
};

/** where the wrist lands on screen — so a figure's own arm can be drawn up to it */
export const wristAt = (
  tip: { x: number; y: number }, from: { x: number; y: number },
  hand: HandSide, fw: number, bend: number,
) => {
  const { theta, mirror } = place({ tip, from, fw, hand, bend });
  const r = (theta * Math.PI) / 180;
  const dx = (WRIST_C[0] - PAD[0]) * mirror * fw, dy = (WRIST_C[1] - PAD[1]) * fw;
  return { x: tip.x + dx * Math.cos(r) - dy * Math.sin(r),
           y: tip.y + dx * Math.sin(r) + dy * Math.cos(r) };
};
