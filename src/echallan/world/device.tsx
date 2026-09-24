/* THE DEVICE — one phone, for the whole film.
 *
 * It is never swapped, never redrawn at a different scale, and never bounces: it is the heaviest
 * object on screen after the camera (plan, PHYSICS BIBLE: overshoot <1.5%, rotation <1.5deg).
 * Everything the victim sees happens inside SCREEN; everything that is actually happening happens
 * behind it, in the interior, which the reveal opens.
 *
 * Recognisability (rule: assets must be recognisable): the silhouette is a tall rounded slab with a
 * VISIBLE THICKNESS — the chassis reads around the screen on all four sides, a hairline speaker
 * slot and camera dot sit in the top margin, and two button nubs break the right edge. Those are
 * the details a person actually identifies a phone by; without the nubs and the slot it is a
 * rounded rectangle.
 */
import React from 'react';
import { C, LAYOUT, R, S, SCREEN, STATUS_H } from '../design';
import { Label, Plate, Recess, Shadow, Solid, lit, shade } from './kit';

const P = LAYOUT.phone;
export const CHASSIS = '#232B45';

/** The chassis. Children are drawn clipped to the screen. */
export const PhoneShell: React.FC<{
  children?: React.ReactNode; clipId?: string; screenBase?: string; elevation?: number;
}> = ({ children, clipId = 'scr', screenBase = C.chatBg, elevation = 30 }) => (
  <g>
    <Shadow x={P.x} y={P.y} w={P.w} h={P.h} r={P.r} elevation={elevation} />

    {/* chassis: a real slab, lit on top, with a rail line down each side so the edge has depth */}
    <Solid x={P.x} y={P.y} w={P.w} h={P.h} r={P.r} base={CHASSIS} litK={0.17} shadeK={0.26} />
    <path d={`M${P.x + 2.5} ${P.y + P.r} L${P.x + 2.5} ${P.y + P.h - P.r}`}
      stroke={lit(CHASSIS, 0.22)} strokeWidth={S.detail} opacity={0.55} strokeLinecap="round" />
    <path d={`M${P.x + P.w - 2.5} ${P.y + P.r} L${P.x + P.w - 2.5} ${P.y + P.h - P.r}`}
      stroke={shade(CHASSIS, 0.45)} strokeWidth={S.detail} opacity={0.7} strokeLinecap="round" />

    {/* side buttons — the detail that stops this being a rounded rectangle */}
    <rect x={P.x + P.w - 1} y={P.y + 232} width={7} height={54} rx={3.5} fill={shade(CHASSIS, 0.30)} />
    <rect x={P.x + P.w - 1} y={P.y + 306} width={7} height={96} rx={3.5} fill={shade(CHASSIS, 0.30)} />
    <rect x={P.x - 6} y={P.y + 262} width={7} height={70} rx={3.5} fill={shade(CHASSIS, 0.42)} />

    {/* the screen well: a milled recess, so the display sits INSIDE the body */}
    <Recess x={SCREEN.x - 3} y={SCREEN.y - 3} w={SCREEN.w + 6} h={SCREEN.h + 6} r={R.screen + 3}
      host={CHASSIS} depthK={0.42} />

    <defs>
      <clipPath id={clipId}>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={R.screen} />
      </clipPath>
    </defs>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={R.screen} fill={screenBase} />
    <g clipPath={`url(#${clipId})`}>{children}</g>

    {/* glass: one soft diagonal sheen, and the top furniture */}
    <path d={`M${SCREEN.x} ${SCREEN.y + SCREEN.h * 0.30} L${SCREEN.x + SCREEN.w} ${SCREEN.y - 10}
              L${SCREEN.x + SCREEN.w} ${SCREEN.y + 6} L${SCREEN.x} ${SCREEN.y + SCREEN.h * 0.40} Z`}
      fill="#FFFFFF" opacity={0.022} clipPath={`url(#${clipId})`} />
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={R.screen} fill="none"
      stroke="#000610" strokeWidth={2} opacity={0.55} />
  </g>
);

/** The status bar. Present on every screen state in the film — it is what says "this is a phone". */
export const StatusBar: React.FC<{ tint?: string; label?: string }> =
  ({ tint = C.grey, label = '9:41' }) => (
    <g>
      <Label x={SCREEN.x + 26} y={SCREEN.y + 31} size={23} fill={tint} weight={700}>{label}</Label>
      {/* signal, wifi, battery — three silhouettes, no detail, because they are never focal */}
      <g transform={`translate(${SCREEN.x + SCREEN.w - 104} ${SCREEN.y + 14})`} fill={tint}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 6} y={12 - i * 3.4} width={4} height={5 + i * 3.4} rx={1} opacity={0.9} />
        ))}
        <path d="M32 18 q7 -8 14 0 M35.5 21.5 q3.5 -4 7 0" stroke={tint} strokeWidth={2.4}
          fill="none" strokeLinecap="round" />
        <rect x={56} y={7} width={24} height={12} rx={3.5} fill="none" stroke={tint} strokeWidth={2} />
        <rect x={58.5} y={9.5} width={15} height={7} rx={1.5} />
        <rect x={81} y={10.5} width={2.5} height={5} rx={1.2} />
      </g>
    </g>
  );

/** Speaker slot + camera, in the top margin of the chassis. Drawn over the screen furniture. */
export const PhoneFurniture: React.FC = () => (
  <g>
    <rect x={SCREEN.x + SCREEN.w / 2 - 34} y={P.y + 6} width={68} height={5} rx={2.5}
      fill="#05080F" opacity={0.85} />
    <circle cx={SCREEN.x + SCREEN.w / 2 + 56} cy={P.y + 8.5} r={4.6} fill="#05080F" opacity={0.9} />
    <circle cx={SCREEN.x + SCREEN.w / 2 + 56} cy={P.y + 8.5} r={2.1} fill="#16203A" />
  </g>
);

/** An app bar inside the screen: the band that tells the viewer WHICH app is in front. */
export const AppBar: React.FC<{
  base: string; height?: number; children?: React.ReactNode;
}> = ({ base, height = 96, children }) => (
  <g>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={STATUS_H + height} fill={base} />
    <rect x={SCREEN.x} y={SCREEN.y + STATUS_H + height - 1.5} width={SCREEN.w} height={1.5}
      fill="#000814" opacity={0.35} />
    {children}
  </g>
);
