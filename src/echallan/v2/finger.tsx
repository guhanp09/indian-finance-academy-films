/* THE USER'S FINGER — one asset, used for every tap in the film.
 *
 * The user is on OUR side of the glass, so their finger always enters from the viewer's side, from
 * the bottom-right, and we see its BACK: the nail is the diagnostic detail. It is foreground — it
 * is allowed to be big and to leave the frame. Inside the phone it is the same finger at the same
 * frame size (the world behind the glass is just smaller), so the two taps read as one person.
 *
 * Local frame: the CONTACT POINT is the origin, the finger runs back along +y. `ang` swings the
 * base toward the right (degrees). `press` flattens the pad and shortens the finger a touch —
 * foreshortening as it pushes into the glass.
 */
import React from 'react';
import { LinGrad, P, RadGrad, gid } from './style';
import { mix } from '../design';

export const FINGER_ANG = 28;

export const Finger: React.FC<{ x: number; y: number; w: number; ang?: number; press?: number;
  rim?: string }> = ({ x, y, w, ang = FINGER_ANG, press = 0, rim = '#9FE7FF' }) => {
  const gs = gid('fingerSkin'), gh = gid('handSkin'), gn = gid('fingerNail');
  const L = w * 4.2 * (1 - press * 0.04);   // index finger, tip to knuckle
  const r = w / 2;
  const tipY = -w * 0.34;                    // the end of the finger sits just past the contact
  const skin = P.skin, shade = P.skinShade;
  return (
    <g transform={`translate(${x} ${y}) rotate(${-ang})`}>
      <defs>
        <LinGrad id={gs} x1={0} y1={0} x2={1} y2={0}
          stops={[[0, mix(shade, '#000000', 0.12)], [0.3, skin], [0.62, mix(skin, '#FFFFFF', 0.18)], [1, shade]]} />
        <LinGrad id={gh} x1={0} y1={0} x2={1} y2={0}
          stops={[[0, mix(shade, '#000000', 0.2)], [0.45, skin], [1, mix(shade, '#000000', 0.1)]]} />
        <RadGrad id={gn} cx={0.45} cy={0.35} r={0.8}
          stops={[[0, '#FFE6DA', 1], [0.6, '#F4C3AE', 1], [1, '#E3A58C', 1]]} />
      </defs>
      {/* the contact shadow on whatever it touches: tight and dark at contact, soft on approach */}
      <ellipse cx={w * 0.12} cy={w * 0.1} rx={r * (1.05 + press * 0.1)} ry={r * 0.55}
        fill="#000000" opacity={0.18 + press * 0.14} transform={`rotate(${ang})`} />
      {/* the back of the hand and the curled fingers, mostly out of frame */}
      <path d={`M${-r * 1.1} ${L * 0.92} C${-r * 2.6} ${L * 1.02} ${-r * 3.6} ${L * 1.35} ${-r * 3.4} ${L * 2.4}
                L${r * 3.8} ${L * 2.4} C${r * 3.4} ${L * 1.5} ${r * 2.2} ${L * 1.0} ${r * 1.1} ${L * 0.86} Z`}
        fill={`url(#${gh})`} />
      {/* curled middle/ring knuckles: the bumps that make it a HAND, pointing */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={-r * (1.7 + i * 1.05)} cy={L * (1.02 + i * 0.1)} rx={r * 0.82} ry={r * 0.62}
          fill={mix(skin, shade, 0.35 + i * 0.12)} />
      ))}
      {/* the index finger itself */}
      <path d={`M${-r} ${L} L${-r} ${tipY + r} A${r} ${r} 0 0 1 ${r} ${tipY + r} L${r} ${L} Z`}
        fill={`url(#${gs})`} />
      {/* the screen's light, caught along the edge that faces it */}
      <path d={`M${-r + 3} ${L * 0.8} L${-r + 3} ${tipY + r} A${r - 3} ${r - 3} 0 0 1 ${-r * 0.2} ${tipY + 4}`}
        fill="none" stroke={rim} strokeWidth={w * 0.05} opacity={0.35} strokeLinecap="round" />
      {/* knuckle creases */}
      {[1.35, 2.55].map((k) => (
        <path key={k} d={`M${-r * 0.62} ${w * k} Q0 ${w * k + w * 0.08} ${r * 0.62} ${w * k}`}
          fill="none" stroke={mix(shade, '#000000', 0.15)} strokeWidth={w * 0.035} strokeLinecap="round"
          opacity={0.55} />
      ))}
      {/* the nail: seen from behind, the one detail that says FINGER */}
      <path d={`M${-r * 0.6} ${w * 0.62} L${-r * 0.6} ${tipY + r * 0.95} A${r * 0.6} ${r * 0.62} 0 0 1 ${r * 0.6}
                ${tipY + r * 0.95} L${r * 0.6} ${w * 0.62} Q0 ${w * 0.72} ${-r * 0.6} ${w * 0.62} Z`}
        fill={`url(#${gn})`} />
      <path d={`M${-r * 0.3} ${tipY + r * 0.9} Q${-r * 0.1} ${tipY + r * 0.55} ${r * 0.2} ${tipY + r * 0.6}`}
        fill="none" stroke="#FFFFFF" strokeWidth={w * 0.05} opacity={0.6} strokeLinecap="round" />
      {/* the pad flattening against the glass shows either side of the nail as it presses */}
      {press > 0.02 && (
        <ellipse cx={0} cy={tipY + r * 0.35} rx={r * (1.02 + press * 0.08)} ry={r * 0.3}
          fill="#FFD9C4" opacity={press * 0.5} />
      )}
    </g>
  );
};

/** a tap as deliberate motion: travel in along the finger's own axis, a hover beat, press, lift.
 *  Returns the contact point (= target at the contact instant) and the press amount. */
export function tapPose(t: number, target: { x: number; y: number }, o: {
  tIn: number; tHit: number; tOut: number; reach: number; ang?: number;
}) {
  const ang = ((o.ang ?? FINGER_ANG) * Math.PI) / 180;
  const bx = Math.sin(ang), by = Math.cos(ang);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const eo = (u: number) => 1 - Math.pow(1 - u, 3);
  const ei = (u: number) => u * u * u;
  if (t < o.tIn || t > o.tOut) return null;
  let d: number;
  const hover = 70;
  const tHover = o.tHit - Math.min(0.28, (o.tHit - o.tIn) * 0.35);
  if (t < tHover) d = hover + (o.reach - hover) * (1 - eo(clamp((t - o.tIn) / (tHover - o.tIn))));
  else if (t < o.tHit) { const u = clamp((t - tHover) / (o.tHit - tHover)); d = hover * (1 - u * u); }
  else {
    const hold = 0.1;
    if (t < o.tHit + hold) d = 0;
    else d = o.reach * ei(clamp((t - o.tHit - hold) / (o.tOut - o.tHit - hold)));
  }
  const press = t >= o.tHit - 0.03 && t < o.tHit + 0.16
    ? Math.sin(clamp((t - (o.tHit - 0.03)) / 0.19) * Math.PI) : 0;
  return { x: target.x + bx * d, y: target.y + by * d, press, d };
}
