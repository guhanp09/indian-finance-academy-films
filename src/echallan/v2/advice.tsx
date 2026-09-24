/* ACT 4 — THE ADVICE, PUT ON THE THING THE ADVICE IS ABOUT.
 *
 * "Please be aware that a legitimate traffic challan does not require you to install an APK sent
 *  over WhatsApp. If you receive a challan message, verify it yourself through the official
 *  e-Challan portal or your state traffic police website before opening it."
 *
 * Two sentences of instruction, and instructions are given about a PHONE. The first cut of this
 * played them entirely in the city — the wall sealing itself and a courier turned away — which is
 * a good image of the consequence and a poor image of the instruction, because the thing the
 * viewer has to do is on a screen in their hand.
 *
 * So the phone comes back up, in front of the city rather than instead of it, exactly as act 1
 * first showed it: a slab at frame scale with the world behind it. Both refusals then happen at
 * once and they are the same refusal at two scales — the attachment declines to be opened, and
 * four hundred units behind it the wall the victim cut declines to be flown through.
 *
 * Nothing here is a new asset. It is act 1's chat, act 1's notice, act 1's attachment tile and the
 * film's own envelope, which is how every message in this film has travelled since the OTP.
 */
import React from 'react';
import { C, LAYOUT, R, S, SCREEN, STATUS_H, clamp01, ease, lerp, mix } from '../design';
import { ApkTile, Bubble, CHALLAN_H, ChallanDoc, ChatFurniture, ChatHeader } from '../world/chat';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { Label, Plate } from '../world/kit';
import { Light } from './style';

/** where act 1 puts the notice and its attachment inside the bubble — one copy of the layout */
const BUB_X = SCREEN.x + 28, BUB_W = SCREEN.w - 92;
const BUB_Y = SCREEN.y + STATUS_H + 150;
export const DOC_W = BUB_W - 28;
export const NOTICE = {
  x: BUB_X + 14, y: BUB_Y + 14, w: DOC_W,
  /** the notice's own centre, in frame coordinates — where the envelope leaves from */
  cx: BUB_X + 14 + DOC_W / 2, cy: BUB_Y + 14 + (CHALLAN_H * (DOC_W / 422)) / 2,
};
const APK_Y = NOTICE.y + CHALLAN_H * (DOC_W / 422) + 16;

/** THE ATTACHMENT, REFUSED — and this is the single most important image in the last thirty
 *  seconds, because it is the one piece of advice the whole film exists to give. The first cut
 *  turned the download chevron into a small red bar in its own well: correct, mechanical, and far
 *  too quiet. A viewer with the sound off saw a 60-pixel badge change colour.
 *
 *  It is staged now, in three moves, and every one of them is about the file and nothing else:
 *
 *    1. IT COMES FORWARD. The chat, the bubble and the notice recede a little and go down to a
 *       quarter strength; the tile scales up and gains a real shadow under it. Nothing has been
 *       added — the frame has simply separated into a thing and its background.
 *    2. IT IS REFUSED, in the one sign every human being on earth reads without being taught: a
 *       heavy ring and a bar through it, DRAWN over the file rather than faded onto it, at a size
 *       that covers it. The screen answers with one red flash, which is what the boundary wall's
 *       field has done every time something hit it since act 1.
 *    3. AND IT GOES. The paper loses its white, the shadow collapses, and the file falls out of
 *       the message it arrived in — because that is the point of the sentence: it was never part
 *       of a real challan.
 */
const TILE_CX = BUB_X + 14 + DOC_W / 2, TILE_CY = APK_Y + 48;

export const Refusal: React.FC<{ k: number }> = ({ k }) => {
  const fwd = ease.out(clamp01(k / 0.30));
  const mark = clamp01((k - 0.26) / 0.34);
  const ring = ease.out(clamp01(mark / 0.55));
  const bar = ease.out(clamp01((mark - 0.45) / 0.55));
  const go = ease.in(clamp01((k - 0.64) / 0.36));
  const grey = clamp01((k - 0.52) / 0.24);
  const R0 = 92;
  const d = R0 * 0.62;
  return (
    <g>
      <g transform={`translate(${TILE_CX} ${TILE_CY}) scale(${1 + fwd * 0.20})
                     translate(${-TILE_CX} ${-TILE_CY + go * 620}) rotate(${go * 5} ${TILE_CX} ${TILE_CY})`}
        opacity={1 - clamp01((go - 0.55) / 0.45)}>
        {/* the shadow it casts once it is off the surface — and which collapses when it falls */}
        <rect x={BUB_X + 6} y={APK_Y + 16} width={DOC_W + 16} height={96} rx={R.tile + 4}
          fill="#000000" opacity={0.42 * fwd * (1 - go)} />
        <ApkTile x={BUB_X + 14} y={APK_Y} w={DOC_W} pkg={1} name={1} />
        {/* the paper loses its white */}
        <rect x={BUB_X + 14} y={APK_Y} width={DOC_W} height={96} rx={R.tile}
          fill="#7E8698" opacity={0.62 * grey} />
        {/* THE SIGN. Drawn, at the size of the thing it is about. */}
        {mark > 0.001 && (
          <g>
            <circle cx={TILE_CX} cy={TILE_CY} r={R0} fill="#2A0C12" opacity={0.30 * ring} />
            <circle cx={TILE_CX} cy={TILE_CY} r={R0} fill="none" stroke={C.red} strokeWidth={17}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring}
              transform={`rotate(-90 ${TILE_CX} ${TILE_CY})`} />
            <path d={`M${TILE_CX - d} ${TILE_CY + d} L${TILE_CX + d} ${TILE_CY - d}`}
              stroke={C.red} strokeWidth={17} strokeLinecap="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bar} />
            <Light cx={TILE_CX} cy={TILE_CY} r={330} color={C.red} k={0.46 * ring} />
          </g>
        )}
      </g>
      {/* the screen answers once, the way the wall's field answers a hit */}
      {(() => {
        const f = Math.max(0, Math.sin(clamp01((k - 0.40) / 0.26) * Math.PI));
        if (f < 0.01) return null;
        return (
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={R.screen}
            fill={C.red} opacity={0.20 * f} />
        );
      })()}
    </g>
  );
};

/** the screen: act 1's chat, with the notice the victim was sent and the file that came with it */
export const AdviceScreen: React.FC<{ deny: number; lift: number; gone: number }> =
  ({ deny, lift, gone }) => {
    /* while the file is being refused, everything that is not the file recedes and goes quiet */
    const back = ease.out(clamp01(deny / 0.30)) * (1 - ease.in(clamp01((deny - 0.70) / 0.30)));
    const cx = SCREEN.x + SCREEN.w / 2, cy = SCREEN.y + SCREEN.h / 2;
    return (
      <g>
        <ChatFurniture notice={1} />
        <ChatHeader />
        <g transform={`translate(${cx} ${cy}) scale(${1 - back * 0.055}) translate(${-cx} ${-cy})`}
          opacity={1 - back * 0.74}>
          <Bubble x={BUB_X} y={BUB_Y} w={BUB_W} h={CHALLAN_H * (DOC_W / 422) + 126} />
          {/* the notice — and when the viewer is told to go and check it, it is the thing that goes */}
          <g opacity={1 - gone}>
            <g transform={`translate(0 ${-lift * 14})`}>
              <ChallanDoc x={NOTICE.x} y={NOTICE.y} w={DOC_W} focus={lift} />
            </g>
            {lift > 0.02 && (
              <Light cx={NOTICE.cx} cy={NOTICE.cy} r={330} color={C.sky} k={0.22 * lift} />
            )}
          </g>
        </g>
        <Refusal k={deny} />
        <StatusBar tint="#C3D0E6" label="10:43" />
      </g>
    );
  };

/** THE PHONE, HELD UP.
 *
 *  IT SITS HIGH IN THE FRAME. At its natural place the phone is 61% of the height with its middle
 *  at 842, which put the whole of the boundary wall — and therefore the whole of the wall closing
 *  itself behind it — underneath the slab. Lifted, the two stack: the instruction on the glass,
 *  and the consequence in the street below it, both completely visible.
 *
 *  But lifting a 1180-unit slab by 290 ran its top edge 38 units off the top of the frame, and a
 *  phone cropped by the frame edge reads as a mistake. So it is lifted 240 and drawn at 0.91 —
 *  which is also the truer picture, because a phone raised in a hand goes slightly further away
 *  from you as it goes up. Its top clears the frame by 65 units at rest and by 48 at the top of its
 *  bounce, and its bottom still sits on the wall's cap. Both numbers live here and `heldPoint`
 *  below maps the glass to the frame with them, so the notice leaves the screen from exactly where
 *  the screen actually is. */
export const PHONE_UP = 208, PHONE_S = 0.91;
/** how much the held phone — and therefore everything drawn on its glass — is reduced at lift `e`.
 *  ONE function, used by the phone's own transform, by `heldPoint`, and by the notice that flies
 *  off the glass: the notice used to leave at its design width while the glass under it was drawn
 *  at 0.91, so it jumped 9% larger on the single frame it left the screen. */
export const phoneScale = (e: number) => lerp(1, PHONE_S, clamp01(e));
export const PHONE_CY = LAYOUT.phone.y + LAYOUT.phone.h / 2;

/** ITS ENTRANCE HAS WEIGHT — AND THE BOUNCE IS TWO NUMBERS, NOT ONE.
 *
 *  This was a second-order step response, and a step response cannot separate how FAR a thing
 *  bounces from how FAST: both come out of the same damping ratio, and asking it for a bigger
 *  bounce also asks it for a slower one. Tuned for 3.8% of travel it rang with a damped period of
 *  0.95 s — 46 px spread over half a second, which the eye reads as a drift, not a bounce. That is
 *  why raising the amplitude alone did not make it visible.
 *
 *  So the motion is written the way it actually happens. The HAND raises the phone over LIFT_RISE
 *  and then stops; the phone does not, because it is a mass on a wrist and a forearm, so it
 *  carries past the stop and rings down about it. That gives an amplitude (OVER) and a frequency
 *  (RING_HZ) and a decay (RING_DECAY) which are three independent numbers, and a bounce that is
 *  FAST and visible without being large. The hand's profile is the cubic that leaves with exactly
 *  the velocity the ring starts with, so the join is continuous in position AND velocity: the
 *  phone never jumps.
 *
 *  OVER IS CAPPED BY THE FRAME, not by taste. At rest the phone's top clears the top edge by 97
 *  units; the peak of the bounce eats into that, and a phone cropped by the frame edge reads as a
 *  mistake — it is the fault the lift was re-cut for in the first place. 6% of the 1,188-unit
 *  travel is 71 px at the peak and leaves 26 units of air. `tools/echallan/act4.mjs` walks every
 *  frame of the lift and fails if that number ever goes under 18, so this cannot drift again.
 *  (PHONE_UP came down from 240 to 208 to buy that headroom: the phone rests 32 units lower and
 *  its bounce now peaks about where it used to sit.) */
export const LIFT_RISE = 0.42;          // seconds: the hand's own travel
const OVER = 0.060;                     // first overshoot, as a fraction of the travel
const RING_HZ = 3.2, RING_DECAY = 6.0;  // how fast it rings, and how fast the ring dies
const WD = 2 * Math.PI * RING_HZ;
/* the ring's opening velocity that produces OVER at its first peak, and the hand's terminal
   velocity, which must equal it */
const TPEAK = Math.atan(WD / RING_DECAY) / WD;
const V0 = OVER / (Math.exp(-RING_DECAY * TPEAK) * Math.sin(WD * TPEAK) / WD);
const M = V0 * LIFT_RISE;               // that velocity in the hand cubic's own units
/** @param dt seconds since the lift began. May exceed 1 on the overshoot — not clamped. */
export const liftCurve = (dt: number) => {
  if (dt <= 0) return 0;
  if (dt < LIFT_RISE) { const u = dt / LIFT_RISE; return (M - 2) * u * u * u + (3 - M) * u * u; }
  const t = dt - LIFT_RISE;
  return 1 + (V0 / WD) * Math.exp(-RING_DECAY * t) * Math.sin(WD * t);
};

/** the frame y of the held phone's TOP EDGE at lift `e`. The frame is what caps the bounce, so
 *  the number the cap is expressed in lives here, next to the numbers that decide it, and a gate
 *  walks it. A phone cropped by the frame edge reads as a mistake, and it has happened once. */
export const phoneTopY = (e: number) => {
  const s = phoneScale(e);
  return PHONE_CY + (LAYOUT.phone.y - PHONE_CY) * s + (1 - e) * 980 - PHONE_UP * e;
};

/** where a point drawn on the glass actually lands in the frame, at lift `e` */
export const heldPoint = (p: { x: number; y: number }, e: number) => {
  const s = phoneScale(e);
  return {
    x: 540 + (p.x - 540) * s,
    y: PHONE_CY + (p.y - PHONE_CY) * s + (1 - e) * 980 - PHONE_UP * e,
  };
};

/** It comes in from below because that is where a phone in a hand comes from, and it goes back
 *  down the same way when the viewer is told to go and look somewhere else. `e` is already shaped
 *  by liftCurve — it may exceed 1 on the overshoot, so it is not clamped here. */
export const Held: React.FC<{ e: number; children: React.ReactNode }> = ({ e, children }) => {
  if (e <= 0.002) return null;
  const s = phoneScale(e);
  return (
    <g transform={`translate(0 ${(1 - e) * 980 - PHONE_UP * e})
                   translate(540 ${PHONE_CY}) scale(${s}) translate(${-540} ${-PHONE_CY})`}
      opacity={Math.min(1, e * 3)}>
      {/* and it is LIT — one soft fall-off behind the slab, so the eye is taken to it rather than
          having to find it against a city the veil has only half taken away */}
      <Light cx={540} cy={PHONE_CY} r={860} color="#FFFFFF" k={0.12 * clamp01(e)} />
      <PhoneShell clipId="a4scr" screenBase={C.chatBg} elevation={44}>{children}</PhoneShell>
      <PhoneFurniture />
    </g>
  );
};

export const _adv = { Plate, Label, lerp };
