/* THE SECOND REGISTER — what is ACTUALLY happening, underneath what the victim sees.
 *
 * The film's spine is two registers visible at once: the phone's SCREEN (the experience) and the
 * device's INTERIOR (the mechanism). The interior is established during the permission phase, runs
 * faintly under the payment, and is what the reveal re-focuses on — so by the time the shell comes
 * off, the viewer has been looking at the payload for thirty seconds without knowing it
 * (premortem F3).
 *
 * The interior is NEVER shown by making the phone transparent — (rule: depth is drawn, not dissolved).
 * The device recedes and rises, and the space it vacates becomes a milled chamber. Everything in
 * that chamber is drawn fully opaque and pushed back by COLOUR.
 */
import React from 'react';
import { C, R, S, breathe, hash01, lerp, mix } from '../design';
import { Glow, Grown, Label, Plate, Recess, Solid, lit, recede, shade } from './kit';

export type Cap = 'sms' | 'call' | 'bg' | 'vpn';
export const CAP_COLOR: Record<Cap, string> = {
  sms: C.smsCyan, call: C.callViolet, bg: C.bgAmber, vpn: C.vpnRose,
};
export const CAP_NAME: Record<Cap, string> = {
  sms: 'SMS', call: 'CALLS', bg: 'BACKGROUND', vpn: 'VPN',
};

/* ── THE CHAMBER ────────────────────────────────────────────────────────────────────────────
   A milled well in the world, with a fine lattice floor. It is a place, not a diagram, so it has
   a floor, a depth and an edge. */
export const Chamber: React.FC<{
  x: number; y: number; w: number; h: number; ground: string; t: number; open?: number;
}> = ({ x, y, w, h, ground, t, open = 1 }) => {
  const host = mix('#2A3560', ground, 0.14);
  const hh = h * Math.max(0.02, open);
  return (
    <g>
      <Recess x={x} y={y + h - hh} w={w} h={hh} r={26} host={host} depthK={0.26} />
      {/* lattice floor: a survey grid that says "inside a machine" without being circuitry */}
      <g clipPath="none">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`v${i}`} d={`M${x + 34 + i * ((w - 68) / 8)} ${y + h - hh + 16}
                                  V${y + h - 16}`}
            stroke={mix(C.sky, ground, 0.66)} strokeWidth={1.7} opacity={open} />
        ))}
        {Array.from({ length: 5 }, (_, j) => (
          <path key={`h${j}`} d={`M${x + 24} ${y + h - hh + 22 + j * ((hh - 44) / 4)} H${x + w - 24}`}
            stroke={mix(C.sky, ground, 0.72)} strokeWidth={1.7} opacity={open} />
        ))}
      </g>
      <Label x={x + 28} y={y + h - hh + 40} size={20} fill={mix(C.grey, ground, 0.24)} weight={700}
        track={2.2} opacity={open * 0.9}>DEVICE</Label>
    </g>
  );
};

/* ── THE APP SHELL ──────────────────────────────────────────────────────────────────────────
   The first app: a CONTAINER. It is drawn as an open-topped carrier with two side walls and a
   floor, so that something can be seen to be sitting inside it long before the film says the word
   "dropper" — and so that at the reveal it can come apart along seams the viewer has already seen.
   `split` separates the two halves; nothing fades. */
export const AppShell: React.FC<{
  cx: number; cy: number; w: number; h: number; ground: string; depth?: number;
  split?: number; label?: boolean; dim?: number; back?: boolean; front?: boolean;
}> = ({ cx, cy, w, h, ground, depth = 0, split = 0, label = true, dim = 0,
  back = true, front = true }) => {
  /* A CONTAINER, read as one: a back wall, two side walls, and a FRONT WALL that covers the
     lower half of whatever is inside it. That front lip is what makes the payload read as being
     IN the app rather than next to it — and it is the seam the reveal opens, so the viewer has
     been looking at the join for thirty seconds before it gives way.
     `split` drops the front wall forward on its bottom edge and parts the sides. Nothing fades. */
  const base = recede(mix(C.cobalt, '#243056', 0.58), ground, depth + dim * 0.35);
  const x = cx - w / 2, y = cy - h / 2;
  /* narrow, square side rails and a LOW front lip: wide rounded walls with a tall front
     panel read as an armchair, and the contents have to stay visible above the lip. */
  const wall = w * 0.065;
  const frontH = h * 0.34;
  /* modest, physical displacement. A flat front-on view cannot read a hinge, so the front
     panel SLIDES DOWN out of the box and tips; the rails part a little and drop. */
  const dropF = split * h * 1.12;
  return (
    <g>
      {/* back wall — the box's inside face, darkest */}
      {back && <Solid x={x + wall * 0.5} y={y} w={w - wall} h={h} r={10} base={shade(base, 0.40)}
        litK={0.06} shadeK={0.16} elevation={4} />}
      {back && <g>
      {/* side rails */}
      <g>
        <Solid x={x} y={y - h * 0.03} w={wall} h={h * 1.06} r={4} base={base} litK={0.20}
          shadeK={0.26} elevation={6} />
      </g>
      <g>
        <Solid x={x + w - wall} y={y - h * 0.03} w={wall} h={h * 1.06} r={4}
          base={shade(base, 0.16)} litK={0.12} shadeK={0.28} elevation={6} />
      </g>
      </g>}
      {/* FRONT wall — hinges forward on its bottom edge, so the contents are uncovered from above */}
      {front && <g transform={`translate(0 ${dropF}) rotate(${split * 7} ${cx} ${y + h})`}>
        <Solid x={x + wall * 0.5} y={y + h - frontH} w={w - wall} h={frontH} r={10} base={base}
          litK={0.20} shadeK={0.24} elevation={8} />
        <path d={`M${x + wall} ${y + h - frontH + 5} H${x + w - wall}`} stroke={lit(base, 0.26)}
          strokeWidth={S.detail} strokeLinecap="round" opacity={0.8} />
        {label && (
          <Label x={cx} y={y + h - frontH * 0.36} size={Math.max(17, h * 0.13)}
            fill={recede('#CBD9F6', ground, 0.10 + dim * 0.4)} weight={800} anchor="middle"
            track={2}>APP</Label>
        )}
      </g>}
    </g>
  );
};

/* ── THE PAYLOAD ────────────────────────────────────────────────────────────────────────────
   The film's memory test. It is installed at ~36s and has to be RECOGNISED at ~66s, so it gets a
   silhouette a person can hold: a compact double-walled block with TWO NOTCHES cut from its top
   edge and one diagonal seam across the core. It is darker and denser than the shell, and at
   install it is not red, not labelled and not sinister — it is just a smaller, heavier package
   (premortem F3).
   `live` lights the core; it stays faintly alive from the moment it lands. */
export const Payload: React.FC<{
  cx: number; cy: number; w: number; ground: string; depth?: number; live?: number;
  danger?: number; dim?: number;
}> = ({ cx, cy, w, ground, depth = 0, live = 0, danger = 0, dim = 0 }) => {
  const h = w * 0.64;
  const x = cx - w / 2, y = cy - h / 2;
  const body = recede(mix('#4A5478', '#1A2140', 0.30), ground, depth + dim * 0.3);
  const core = mix(recede(C.teal, ground, 0.30 + dim * 0.3), C.red, danger);
  const notch = w * 0.14;
  return (
    <g>
      {/* outer wall, with the two notches — the diagnostic detail */}
      <Solid x={x} y={y} w={w} h={h} r={9} base={body} litK={0.14} shadeK={0.30} elevation={7} />
      <rect x={x + w * 0.22 - notch / 2} y={y - 1} width={notch} height={h * 0.19} rx={3}
        fill={shade(body, 0.52)} />
      <rect x={x + w * 0.70 - notch / 2} y={y - 1} width={notch} height={h * 0.19} rx={3}
        fill={shade(body, 0.52)} />
      {/* the inner core, set into the wall — "double-shelled" */}
      <Recess x={x + w * 0.14} y={y + h * 0.30} w={w * 0.72} h={h * 0.50} r={6} host={body}
        depthK={0.34} />
      <rect x={x + w * 0.14} y={y + h * 0.30} width={w * 0.72} height={h * 0.50} rx={6}
        fill={core} opacity={0.16 + live * 0.74} />
      {/* the core is a WINDOW into the thing, so it gets its own inner shading rather than being
          a flat panel of colour */}
      <rect x={x + w * 0.14} y={y + h * 0.30} width={w * 0.72} height={h * 0.16} rx={6}
        fill="#FFFFFF" opacity={0.10 * (0.3 + live)} />
      {/* the diagonal seam */}
      <path d={`M${x + w * 0.16} ${y + h * 0.76} L${x + w * 0.84} ${y + h * 0.34}`}
        stroke={mix(shade(body, 0.55), core, live * 0.7)} strokeWidth={S.secondary}
        strokeLinecap="round" />
      {live > 0.04 && <Glow cx={cx} cy={cy} r={w * 0.30} color={core} k={live * (0.35 + danger * 0.5)} />}
    </g>
  );
};

/* ── A CAPABILITY NODE ──────────────────────────────────────────────────────────────────────
   The subsystem the permission opens: the SMS store, the call subsystem, the scheduler, the
   network egress. Locked until granted, and then it stays unlocked for the rest of the film. */
export const CapNode: React.FC<{
  cx: number; cy: number; r: number; cap: Cap; ground: string; granted?: number; depth?: number;
  t?: number; label?: boolean;
}> = ({ cx, cy, r, cap, ground, granted = 0, depth = 0, t = 0, label = true }) => {
  const col = recede(CAP_COLOR[cap], ground, depth);
  const body = recede('#222B4C', ground, depth * 0.8);
  const pulse = granted > 0.5 ? 1 + breathe(t, cap.charCodeAt(0), 0.5) * 0.04 : 1;
  return (
    <g>
      <Solid x={cx - r} y={cy - r} w={r * 2} h={r * 2} r={R.node + r * 0.22} base={body}
        litK={0.15} shadeK={0.26} elevation={6} />
      <g transform={`translate(${cx} ${cy}) scale(${pulse})`}>
        <circle cx={0} cy={0} r={r * 0.52} fill={granted > 0.02 ? col : shade(body, 0.4)} />
        {/* the lock: present until granted, and it OPENS rather than disappearing */}
        {granted < 0.98 && (
          <g opacity={1 - granted} transform={`translate(0 ${-r * 0.06})`}>
            <rect x={-r * 0.23} y={-r * 0.06} width={r * 0.46} height={r * 0.38} rx={r * 0.07}
              fill={shade(body, 0.62)} />
            <path d={`M${-r * 0.15} ${-r * 0.06} v${-r * 0.16} a${r * 0.15} ${r * 0.15} 0 0 1 ${r * 0.30} 0
                      v${r * 0.16 * (1 - granted * 1.6)}`}
              fill="none" stroke={shade(body, 0.62)} strokeWidth={r * 0.08} strokeLinecap="round"
              transform={`rotate(${granted * 34} ${-r * 0.15} ${-r * 0.06})`} />
          </g>
        )}
      </g>
      {label && (
        <Label x={cx} y={cy + r + 30} size={20} fill={recede(CAP_COLOR[cap], ground, 0.22 + depth * 0.5)}
          weight={800} anchor="middle" track={1.6} opacity={0.35 + granted * 0.65}>
          {CAP_NAME[cap]}
        </Label>
      )}
    </g>
  );
};

/* ── A ROUTE ────────────────────────────────────────────────────────────────────────────────
   Granted capability -> payload. A route is a REPRESENTATION, so it may legitimately be traced on
   (rule: object creation matches its nature), and it stays alive for the rest of the film once it
   exists. Under the payment scene it is carried by MOTION rather than contrast (premortem F5):
   `flow` keeps moving at very low `strength`, which is perceptible where a static faint line is
   not. */
export const Route: React.FC<{
  from: [number, number]; to: [number, number]; cap: Cap; ground: string;
  grow?: number; strength?: number; flow?: number; bend?: number; toward?: number;
}> = ({ from, to, cap, ground, grow = 1, strength = 1, flow = 0, bend = 0.35, toward = 0 }) => {
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  /* the control point is pushed perpendicular, and `toward` bends the whole route further into
     the payload — which is what the reveal does to all four at once */
  const nx = -dy / len, ny = dx / len;
  const k = bend * len * 0.38 * (1 + toward * 0.5);
  const cxp = mx + nx * k, cyp = my + ny * k;
  const d = `M${x1} ${y1} Q${cxp} ${cyp} ${x2} ${y2}`;
  const col = recede(CAP_COLOR[cap], ground, 0.10 + (1 - strength) * 0.70);
  return (
    <g>
      <Grown d={d} len={len * 1.35} p={grow} stroke={col} width={S.route * (0.6 + strength * 0.5)}
        opacity={1} />
      {/* internal flow: short dashes travelling along the route. Direction is the meaning. */}
      {flow > 0.01 && (
        <path d={d} fill="none" stroke={lit(col, 0.34)} strokeWidth={S.route * 0.52}
          strokeLinecap="round" strokeDasharray="10 44"
          strokeDashoffset={-flow * 54} opacity={0.55 + strength * 0.45} />
      )}
    </g>
  );
};

/* ── THE VPN TUNNEL ─────────────────────────────────────────────────────────────────────────
   Not a route: a TUBE. It has two walls and an interior, it leaves the device, and it is the only
   thing in the film that crosses the device boundary. It grows elastically from an anchor and its
   tip overshoots before it settles. */
export const VpnTunnel: React.FC<{
  from: [number, number]; to: [number, number]; ground: string; grow?: number; flow?: number;
  strength?: number; hot?: number;
}> = ({ from, to, ground, grow = 1, flow = 0, strength = 1, hot = 0 }) => {
  const [x1, y1] = from, [x2, y2] = to;
  const ex = lerp(x1, x2, Math.min(1, grow)), ey = lerp(y1, y2, Math.min(1, grow));
  const dx = ex - x1, dy = ey - y1, len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len, ny = dx / len;
  const wall = 17;
  const col = recede(C.vpnRose, ground, 0.12 + (1 - strength) * 0.6);
  const inner = recede(shade(C.vpnRose, 0.62), ground, 0.26 + (1 - strength) * 0.4);
  /* the TRAFFIC is what turns — a granted capability is not itself hostile */
  const traffic = mix(lit(col, 0.30), C.red, hot);
  return (
    <g>
      <path d={`M${x1 + nx * wall} ${y1 + ny * wall} L${ex + nx * wall} ${ey + ny * wall}
                L${ex - nx * wall} ${ey - ny * wall} L${x1 - nx * wall} ${y1 - ny * wall} Z`}
        fill={inner} />
      <path d={`M${x1 + nx * wall} ${y1 + ny * wall} L${ex + nx * wall} ${ey + ny * wall}`}
        stroke={col} strokeWidth={S.secondary} strokeLinecap="round" />
      <path d={`M${x1 - nx * wall} ${y1 - ny * wall} L${ex - nx * wall} ${ey - ny * wall}`}
        stroke={shade(col, 0.30)} strokeWidth={S.secondary} strokeLinecap="round" />
      {flow > 0.01 && (
        <path d={`M${x1} ${y1} L${ex} ${ey}`} stroke={traffic} strokeWidth={wall * 0.52}
          strokeDasharray="5 34" strokeDashoffset={-flow * 39} strokeLinecap="round"
          opacity={0.5 + strength * 0.4} />
      )}
    </g>
  );
};

/* ── THE ATTACKER ENDPOINT ──────────────────────────────────────────────────────────────────
   Boringly functional, by design (addendum §53): a rack of four slots with indicator lamps. No
   hood, no skull, no terminal. The point of the film is that the victim's own phone and
   permissions did the work; a melodramatic villain would weaken that. It is HEAVY: it barely
   moves, and it reacts only when a packet actually arrives. */
export const Endpoint: React.FC<{
  cx: number; cy: number; s: number; ground: string; t: number; arrivals?: number[];
  awake?: number; label?: boolean;
}> = ({ cx, cy, s, ground, t, arrivals = [], awake = 0, label = true }) => {
  const w = 190, h = 250;
  const x = cx - w / 2, y = cy - h / 2;
  const body = recede('#252E4E', ground, 0.12);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <Solid x={x} y={y} w={w} h={h} r={14} base={body} litK={0.14} shadeK={0.30} elevation={12} />
      {[0, 1, 2, 3].map((i) => {
        const sy = y + 26 + i * 54;
        const on = arrivals.some((a) => t - a > 0 && t - a < 0.55 && Math.floor((t - a) * 14) % 2 === 0);
        const idle = breathe(t, i * 31, 0.9) > 0.55;
        return (
          <g key={i}>
            <Recess x={x + 14} y={sy} w={w - 28} h={40} r={6} host={body} depthK={0.30} />
            <circle cx={x + 34} cy={sy + 20} r={6}
              fill={on ? C.orange : idle && awake > 0.3 ? recede(C.green, ground, 0.3)
                : shade(body, 0.5)} />
            {[0, 1, 2, 3, 4].map((j) => (
              <rect key={j} x={x + 54 + j * 22} y={sy + 15} width={13} height={10} rx={2}
                fill={shade(body, 0.42)} />
            ))}
          </g>
        );
      })}
      <rect x={x + 22} y={y + h - 8} width={w - 44} height={12} rx={4} fill={shade(body, 0.4)} />
      {label && (
        <Label x={cx} y={y + h + 44} size={21} fill={recede(C.grey, ground, 0.2)} weight={700}
          anchor="middle" track={1.8}>REMOTE SERVER</Label>
      )}
    </g>
  );
};

/* ── PACKETS ────────────────────────────────────────────────────────────────────────────────
   Credentials and OTPs must remain DISTINCT, and distinct in greyscale (premortem F8/F9) — so
   they differ in SILHOUETTE, not hue: a credential is a wide card token with a stripe and two
   digit groups; an OTP is a compact square tile carrying six digits. They travel on separate
   lanes and are only ever shown together at the endpoint. */
export const CredPacket: React.FC<{ cx: number; cy: number; s: number; rot?: number; hot?: number }> =
  ({ cx, cy, s, rot = 0, hot = 1 }) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <Solid x={-34} y={-21} w={68} h={42} r={5} base={mix('#3A4468', C.orange, hot * 0.55)}
        litK={0.2} shadeK={0.24} elevation={3} />
      <rect x={-34} y={-11} width={68} height={9} fill={mix('#151B31', C.red, hot * 0.4)} />
      <rect x={-27} y={6} width={17} height={5} rx={2.5} fill="#C7D2EC" />
      <rect x={-6} y={6} width={17} height={5} rx={2.5} fill="#C7D2EC" />
      <rect x={15} y={6} width={12} height={5} rx={2.5} fill="#C7D2EC" />
    </g>
  );

export const OtpPacket: React.FC<{ cx: number; cy: number; s: number; rot?: number; hot?: number }> =
  ({ cx, cy, s, rot = 0, hot = 1 }) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <Solid x={-27} y={-27} w={54} h={54} r={10} base={mix('#33406B', C.orange, hot * 0.5)}
        litK={0.2} shadeK={0.24} elevation={3} />
      <Label x={0} y={-2} size={19} fill="#EAF0FF" weight={800} anchor="middle" mono track={0.4}>
        418
      </Label>
      <Label x={0} y={17} size={19} fill="#EAF0FF" weight={800} anchor="middle" mono track={0.4}>
        207
      </Label>
    </g>
  );
