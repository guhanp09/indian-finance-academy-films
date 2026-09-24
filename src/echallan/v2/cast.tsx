/* THE CAST OF THE OPENING — the person, their car, the hand that holds the phone, the message.
 *
 * Recognisability rules (assets must be recognisable):
 *   · the car is seen from BEHIND, because that is the view in which its NUMBER PLATE is the
 *     largest thing on it — and the plate is the link the whole hook turns on ("they know my car")
 *   · the person has a head at ~1/6 of height, a tapered torso and a hip line, and their face is
 *     lit by the phone, because the phone is where their attention is
 *   · the holding hand shows the three things a person identifies a grip by: fingertips over one
 *     edge, the thumb over the other, and the heel of the palm under the device
 * No outlines anywhere: form comes from value — a lit face, a shaded face, a rim.
 */
import React from 'react';
import { mix } from '../design';
import { LinGrad, Light, P, RadGrad, gid } from './style';

/* ── THE CAR, FROM BEHIND ───────────────────────────────────────────────────────────────────*/
export const CarRear: React.FC<{ x: number; y: number; s: number; plateGlow?: number;
  tail?: number; plateText?: string }> =
  ({ x, y, s, plateGlow = 0, tail = 1, plateText = 'MH 02 CJ 4471' }) => {
    const body = '#3D7BE0', bodyD = '#2A57A8', bodyL = '#6FA3F2';
    const gb = gid('carBody'), gw = gid('carGlass');
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <defs>
          <LinGrad id={gb} stops={[[0, bodyL], [0.35, body], [1, bodyD]]} />
          <LinGrad id={gw} stops={[[0, '#9FC2FF'], [0.5, '#3C5A9C'], [1, '#1B2A55']]} />
        </defs>
        {/* ground shadow */}
        <ellipse cx={0} cy={4} rx={210} ry={22} fill="#06041A" opacity={0.55} />
        {/* wheels, peeking under the body — seen from behind they are dark blocks */}
        <rect x={-176} y={-58} width={58} height={62} rx={14} fill="#0E0B22" />
        <rect x={118} y={-58} width={58} height={62} rx={14} fill="#0E0B22" />
        {/* cabin */}
        <path d="M-124 -236 Q-118 -262 -92 -266 L92 -266 Q118 -262 124 -236 L150 -150 L-150 -150 Z"
          fill={`url(#${gb})`} />
        {/* the rear windscreen — the largest diagnostic surface on a car from behind */}
        <path d="M-104 -238 Q-100 -254 -82 -256 L82 -256 Q100 -254 104 -238 L124 -168 L-124 -168 Z"
          fill={`url(#${gw})`} />
        <path d="M-60 -250 L-20 -250 L-46 -176 L-86 -176 Z" fill="#FFFFFF" opacity={0.10} />
        {/* a silhouette of the headrests, so the cabin has an inside */}
        <rect x={-70} y={-210} width={46} height={34} rx={14} fill="#142043" opacity={0.8} />
        <rect x={24} y={-210} width={46} height={34} rx={14} fill="#142043" opacity={0.8} />
        {/* body */}
        <path d="M-196 -150 Q-200 -170 -170 -172 L170 -172 Q200 -170 196 -150 L200 -60
                 Q200 -40 180 -40 L-180 -40 Q-200 -40 -200 -60 Z" fill={`url(#${gb})`} />
        <path d="M-190 -164 L190 -164" stroke={bodyL} strokeWidth={3} opacity={0.7} />
        {/* boot line and the lip over the plate */}
        <path d="M-150 -150 L150 -150" stroke={bodyD} strokeWidth={4} opacity={0.6} />
        {/* tail lights: the second thing you identify a car by at night, and they LIGHT */}
        {[-1, 1].map((d) => (
          <g key={d}>
            <Light cx={d * 158} cy={-128} r={130} color="#FF6A4D" k={0.55 * tail} core={0.1} />
            <path d={`M${d * 196} -146 L${d * 120} -146 Q${d * 116} -120 ${d * 124} -110 L${d * 196} -110 Z`}
              fill="#FF6A4D" />
            <path d={`M${d * 190} -140 L${d * 128} -140 L${d * 128} -132 L${d * 190} -132 Z`}
              fill="#FFC2A8" opacity={0.85} />
          </g>
        ))}
        {/* bumper */}
        <rect x={-204} y={-70} width={408} height={34} rx={14} fill="#1E2F62" />
        {/* THE PLATE — white ground, black keyline, four groups. It is the reason the car exists. */}
        {plateGlow > 0.01 && <Light cx={0} cy={-104} r={220} color={P.cyan} k={plateGlow} core={0.2} />}
        <rect x={-92} y={-128} width={184} height={50} rx={6} fill="#F3F5F2" />
        <rect x={-86} y={-122} width={172} height={38} rx={4} fill="none" stroke="#141820"
          strokeWidth={3} />
        <text x={0} y={-95} fontSize={22} fontWeight={800} textAnchor="middle" fill="#101319"
          fontFamily='"SF Mono",ui-monospace,monospace' textLength={156} lengthAdjust="spacingAndGlyphs">
          {plateText}</text>
      </g>
    );
  };

/* ── THE PERSON ─────────────────────────────────────────────────────────────────────────────
   Standing, three-quarter, looking DOWN at the phone held at the chest. Feet at (0,0). */
export const Person: React.FC<{ x: number; y: number; s: number; screen?: number; look?: number;
  breathe?: number; shoulders?: number; noPhone?: boolean; handTo?: [number, number] }> =
  ({ x, y, s, screen = 1, look = 0, breathe = 0, shoulders = 0, noPhone = false,
    handTo = [20, -384] }) => {
    const gs = gid('shirt'), gt = gid('trousers'), gf = gid('faceGlow');
    const by = -breathe * 3 + shoulders * 8;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <defs>
          <LinGrad id={gs} stops={[[0, '#5AA0FF'], [0.5, P.shirt], [1, P.shirtShade]]} />
          <LinGrad id={gt} stops={[[0, '#322E5C'], [1, '#1A1735']]} />
          <RadGrad id={gf} stops={[[0, P.cool, 0.55], [0.5, P.cool, 0.14], [1, P.cool, 0]]} />
        </defs>
        <ellipse cx={0} cy={2} rx={96} ry={14} fill="#06041A" opacity={0.5} />
        {/* legs — tapered, with a gap, and a knee line so they are legs and not a skirt */}
        <path d="M-50 -304 L-4 -304 L-14 -10 L-54 -10 Z" fill={`url(#${gt})`} />
        <path d="M4 -304 L50 -304 L54 -10 L14 -10 Z" fill={`url(#${gt})`} />
        <path d="M-62 -14 Q-60 2 -30 2 L-6 2 L-10 -14 Z" fill="#0F0C22" />
        <path d="M10 -14 L6 2 L34 2 Q64 2 62 -14 Z" fill="#0F0C22" />
        <g transform={`translate(0 ${by})`}>
          {/* torso: shoulders wider than hips, a waist, and a hip line */}
          <path d="M-82 -500 Q-92 -470 -76 -420 L-56 -302 L56 -302 L76 -420 Q92 -470 82 -500
                   Q46 -524 0 -524 Q-46 -524 -82 -500 Z" fill={`url(#${gs})`} />
          <path d="M-52 -306 L52 -306" stroke="#1D3E86" strokeWidth={6} opacity={0.8} />
          {/* collar */}
          <path d="M-24 -518 L0 -490 L24 -518" fill="none" stroke="#2A5BBF" strokeWidth={6} />
          {/* the far arm, behind */}
          <path d="M58 -490 Q88 -440 70 -400 L40 -392" fill="none" stroke={P.shirtShade}
            strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          {/* the phone, held at the chest, lighting what faces it */}
          <circle cx={30} cy={-470} r={190} fill={`url(#${gf})`} opacity={screen} />
          {!noPhone && <>
            <rect x={10} y={-432} width={46} height={82} rx={8} fill={P.body}
              transform="rotate(-18 33 -391)" />
            <rect x={14} y={-428} width={38} height={74} rx={6} fill={P.cool}
              opacity={0.35 + screen * 0.65} transform="rotate(-18 33 -391)" />
          </>}
          {/* the near arm, in front, bent to hold it */}
          <path d={`M-58 -490 Q-86 -430 -40 -392 L${handTo[0]} ${handTo[1]}`} fill="none"
            stroke={`url(#${gs})`} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
          {!noPhone && <circle cx={24} cy={-386} r={18} fill={P.skin} />}
          {/* neck and head, tipped down toward the screen */}
          <rect x={-14} y={-548} width={28} height={36} rx={10} fill={P.skinShade} />
          <g transform={`rotate(${16 - look * 22} 0 -548)`}>
            <circle cx={0} cy={-600} r={64} fill={P.skin} />
            {/* the face is lit from BELOW by the screen: a cool wash on the lower half */}
            <circle cx={30} cy={-588} r={40} fill={P.cool} opacity={0.06 * screen} />
            {/* hair: one mass with a parting, which is what makes it hair and not a hat */}
            <path d="M-66 -604 Q-70 -674 -8 -678 Q60 -682 68 -618 Q46 -650 8 -646 Q-26 -644 -46 -618
                     Q-56 -604 -66 -604 Z" fill={P.hair} />
            <ellipse cx={-54} cy={-594} rx={10} ry={15} fill={P.skinShade} />
            {/* the eye, looking down at the phone */}
            <ellipse cx={34} cy={-594} rx={6.5} ry={4.6} fill="#1A1233" />
            <path d="M25 -608 q 11 -6 20 0" stroke={P.hair} strokeWidth={4.5} fill="none"
              strokeLinecap="round" />
            <path d="M40 -566 q 8 3 14 -2" stroke={P.skinShade} strokeWidth={3.5} fill="none"
              strokeLinecap="round" />
          </g>
        </g>
      </g>
    );
  };

/* ── THE HAND THAT HOLDS THE PHONE ─────────────────────────────────────────────────────────
   Drawn in the phone's own coordinates, so it is the same object as the phone and can never drift
   off it. It is TWO drawings: the palm and wrist BEHIND the device (only the heel shows, below its
   foot), and the fingertips and thumb IN FRONT of it, each overlapping the bezel by a pad's width.
   Drawn as one shape in front, it covered the screen. */
export const HandBehind: React.FC<{ px: number; py: number; pw: number; ph: number }> =
  ({ px, py, pw, ph }) => {
    const gh = gid('holdPalm');
    return (
      <g>
        <defs><LinGrad id={gh} stops={[[0, P.skin], [1, P.skinShade]]} /></defs>
        {/* palm behind the lower half, the heel emerging below the device, the wrist leaving frame */}
        {/* the thumb MOUND, the part of the palm that shows beyond the device's right edge — the
            thumb has to grow out of something or it reads as a floating capsule */}
        <path d={`M${px + pw * 0.80} ${py + ph * 0.74} Q${px + pw + 96} ${py + ph * 0.80}
                  ${px + pw + 70} ${py + ph + 40} Q${px + pw * 0.96} ${py + ph + 160}
                  ${px + pw * 0.80} ${py + ph + 140} Z`} fill={P.skinShade} />
        <path d={`M${px + pw * 0.06} ${py + ph * 0.56} Q${px - pw * 0.04} ${py + ph * 0.86}
                  ${px + pw * 0.20} ${py + ph * 1.02} Q${px + pw * 0.32} ${py + ph + 160}
                  ${px + pw * 0.32} ${py + ph + 520} L${px + pw * 0.80} ${py + ph + 520}
                  Q${px + pw * 0.80} ${py + ph + 150} ${px + pw * 0.84} ${py + ph * 0.98}
                  Q${px + pw * 1.02} ${py + ph * 0.80} ${px + pw * 0.94} ${py + ph * 0.56} Z`}
          fill={`url(#${gh})`} />
        {/* cuff: the thing that says an ARM continues out of frame */}
        <rect x={px + pw * 0.28} y={py + ph + 230} width={pw * 0.56} height={70} rx={22}
          fill={P.shirtShade} />
        <rect x={px + pw * 0.28} y={py + ph + 230} width={pw * 0.56} height={10} rx={5}
          fill={mix(P.shirtShade, '#FFFFFF', 0.2)} />
      </g>
    );
  };

export const HandFront: React.FC<{ px: number; py: number; pw: number; ph: number;
  grip?: number }> = ({ px, py, pw, ph, grip = 0 }) => {
  const pad = 22;                     // how far each fingertip reaches onto the bezel
  return (
    <g>
      {/* four fingertips over the LEFT edge, graded, the index highest */}
      {[0, 1, 2, 3].map((i) => {
        const yy = py + ph * (0.60 + i * 0.075) - grip * 3;
        const h = ph * 0.062;
        return (
          <g key={i}>
            <path d={`M${px - 40} ${yy} L${px + pad - h / 2} ${yy}
                      A${h / 2} ${h / 2} 0 0 1 ${px + pad - h / 2} ${yy + h} L${px - 40} ${yy + h} Z`}
              fill={i === 0 ? '#F6C09C' : P.skin} />
            <path d={`M${px - 40} ${yy + h * 0.72} L${px + pad - h * 0.4} ${yy + h * 0.72}`}
              stroke={P.skinShade} strokeWidth={h * 0.26} strokeLinecap="round" opacity={0.6} />
            <ellipse cx={px + pad - h * 0.5} cy={yy + h * 0.34} rx={h * 0.22} ry={h * 0.14}
              fill="#FFE2D0" opacity={0.75} />
          </g>
        );
      })}
      {/* the thumb: ONE stroked digit growing out of the mound, bending up to lay its pad on the
          right bezel. A stroke with a round cap is exactly a digit: constant width, rounded end. */}
      <path d={`M${px + pw + 58} ${py + ph + 20} Q${px + pw + 70} ${py + ph * 0.78}
                ${px + pw - pad + 26} ${py + ph * 0.66}`}
        fill="none" stroke={P.skin} strokeWidth={48} strokeLinecap="round" />
      <path d={`M${px + pw + 50} ${py + ph + 10} Q${px + pw + 60} ${py + ph * 0.79}
                ${px + pw + 10} ${py + ph * 0.685}`}
        fill="none" stroke={P.skinShade} strokeWidth={10} strokeLinecap="round" opacity={0.45} />
      <ellipse cx={px + pw - pad + 22} cy={py + ph * 0.655} rx={10} ry={7} fill="#FFE2D0"
        opacity={0.8} />
    </g>
  );
};

/* ── THE MESSAGE, IN FLIGHT ────────────────────────────────────────────────────────────────
   A chat bubble carrying a document and a fee: a SYMBOL of the notice, not a UI card. It comes in
   from the sky with a tapering trail of light, and the trail is what says "it travelled to you". */
export const MessageComet: React.FC<{ x: number; y: number; s: number; ang: number; trail: number }> =
  ({ x, y, s, ang, trail }) => {
    const gt = gid('cometTrail');
    return (
      <g>
        <defs>
          <LinGrad id={gt} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, P.teal, 0], [0.7, P.teal, 0.35], [1, '#E9FFFB', 0.9]]} />
        </defs>
        <g transform={`translate(${x} ${y}) rotate(${ang})`}>
          <path d={`M${-trail} -6 L0 -26 L0 26 L${-trail} 6 Z`} fill={`url(#${gt})`} />
        </g>
        <Light cx={x} cy={y} r={150 * s} color={P.teal} k={0.8} core={0.15} />
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {/* the bubble, with its tail */}
          <path d="M-54 -40 Q-54 -54 -40 -54 L40 -54 Q54 -54 54 -40 L54 22 Q54 36 40 36 L-24 36
                   L-44 52 L-40 36 Q-54 36 -54 22 Z" fill="#1FB483" />
          <path d="M-46 -46 L46 -46" stroke="#7BF0C6" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
          {/* inside it: an official document — a band, a seal, and a fee */}
          <rect x={-30} y={-38} width={60} height={64} rx={5} fill="#F6F8FC" />
          <rect x={-30} y={-38} width={60} height={16} rx={5} fill="#3461DC" />
          <circle cx={-18} cy={-30} r={5} fill="#DCE6FF" />
          <text x={0} y={16} fontSize={24} fontWeight={800} textAnchor="middle" fill="#131A32"
            fontFamily='"Inter Tight","Inter",Arial,sans-serif'>{'₹'}</text>
        </g>
      </g>
    );
  };
