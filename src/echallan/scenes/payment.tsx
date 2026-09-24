/* PHASES 9-10 · FALSE RESOLUTION AND THE REVEAL   (blocks 102-130, 57.6-74.7 s)
 *
 * These two are one movement and are written together on purpose: the reveal is only worth
 * anything if the payment genuinely closed the loop first.
 *
 * PAYMENT (premortem F6). The calmest, lightest, stillest stretch in the film. Clean institutional
 * blue and white, a locked camera, the form the only thing in frame, no warning colour anywhere.
 * If this frame is not genuinely reassuring, nobody believes a person would type their card into
 * it, and the film becomes a story about an idiot instead of a story about a well-built trap.
 * The topology below it is present but carried by MOTION at very low contrast (F5), because
 * 10-15% static contrast does not survive H.264.
 *
 * THE REVEAL (premortem F3, and the film's semantic peak). It does not cut to a diagram. It
 * DECONSTRUCTS the scene the viewer is already looking at: the app's front lip slides off the seam
 * that has been visible since the second install, and the payload underneath is the same object
 * installed at 39 s. The routes that were granted one at a time bend into it, one at a time.
 * Danger colour appears here for the first time in the whole film, and only at the core.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, SCREEN, band, clamp01, ease, ground, impact, lerp, win, winOut,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { PaymentForm, PaymentSuccess } from '../world/screens';
import { Hand, approach } from '../world/hand';
import { Topology } from './permissions';

const CX = SCREEN.x + SCREEN.w / 2;
const REST = { x: CX + 40, y: H + 300 };
const FROM = { x: SCREEN.x + SCREEN.w + 220, y: H + 420 };

/** how far through the reveal we are, 0-1. Drives the colour drain and the danger. */
export const revealP = (t: number) => win(t, CUE.shellOpens, CUE.allPathsTerminate);
export const dangerP = (t: number) => win(t, CUE.drain, CUE.coreTurns + 0.5);
export const splitP = (t: number) => win(t, CUE.shellOpens, CUE.payloadExposed + 0.3);

const Screen: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  /* the caret blinks on a calm, PREDICTABLE beat — the one periodic thing in the film, because a
     text caret is the one thing in the world that really is periodic */
  const caret = Math.floor((t - CUE.formFocus) * 1.6) % 2 === 0 ? 1 : 0;
  /* typing: the fields fill in the order a person actually fills them */
  const typed = win(t, CUE.typing, CUE.payPress - 0.28);
  const press = band(t, CUE.payPress - 0.05, CUE.payPress, CUE.payPress + 0.08, CUE.payPress + 0.20);

  const success = win(t, CUE.successLands - 0.30, CUE.successLands + 0.18);
  const tick = win(t, CUE.tickDraws, CUE.successLands + 0.10);
  const settle = win(t, CUE.successLands + 0.06, CUE.successLands + 0.45);

  /* the spinner: stable, reassuring, and NOT linear — it eases at each revolution like a real one */
  const spin = (t - CUE.spinner) * 300;

  return (
    <g>
      {success < 0.999 && (
        <g opacity={1}>
          <PaymentForm typed={typed} press={press} caret={typed < 0.99 ? caret : 0} />
          {t > CUE.payPress && success < 0.6 && (
            <g transform={`translate(${CX} ${SCREEN.y + 820}) rotate(${spin})`}>
              <circle cx={0} cy={0} r={26} fill="none" stroke="#C9D3E6" strokeWidth={5} />
              <path d="M0 -26 a26 26 0 0 1 22 13" fill="none" stroke={C.cobalt} strokeWidth={5}
                strokeLinecap="round" />
            </g>
          )}
        </g>
      )}
      {success > 0.002 && (
        <g clipPath="url(#payClip)">
          <defs>
            <clipPath id="payClip">
              {/* the receipt arrives by WIPING down over the form it replaces — the form is not
                  dissolved, it is covered by the thing it produced */}
              <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w}
                height={SCREEN.h * ease.out(success)} />
            </clipPath>
          </defs>
          <PaymentSuccess draw={tick} settle={settle} />
        </g>
      )}
      <StatusBar tint={success > 0.5 ? '#7E8CA8' : '#7E8CA8'} label="10:51" />
    </g>
  );
};

function handAt(t: number) {
  const pay = { x: CX, y: SCREEN.y + 830 };
  const a = paced(CUE.typing + 0.2, CUE.payPress, 1.1);
  const inP = clamp01((t - a.from) / a.span);
  /* the hand LEAVES after the payment, slowly — the plan asks for relief, not a snatch */
  const outP = ease.in(clamp01((t - (CUE.payPress + 0.30)) / 0.95));
  if (inP <= 0.001 || outP >= 0.999) return null;
  return { tip: approach(REST, pay, inP * (1 - outP), 140), fw: 30,
    press: band(t, CUE.payPress - 0.05, CUE.payPress, CUE.payPress + 0.08, CUE.payPress + 0.20) };
}

export const PayDevice: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    /* the device takes nothing from the reveal: the compromise is digital, not a collision */
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <PhoneShell screenBase="#E9EEF7"><Screen t={t} /></PhoneShell>
        <PhoneFurniture />
      </g>
    );
  };

export const PayHand: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const h = handAt(t);
    if (!h) return null;
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <Hand tip={h.tip} from={FROM} hand="right" fw={h.fw} bend={14} press={h.press} />
      </g>
    );
  };

/* ── THE INTERIOR THROUGH BOTH PHASES ───────────────────────────────────────────────────────
   Under the payment it is quiet and low-contrast but never still; at the reveal it becomes the
   subject. The SAME component, with three numbers changing. */
export const PayTopology: React.FC<{ t: number }> = ({ t }) => {
  /* F5: a static faint line does not survive the encoder, a moving one does. So under the payment
     the contrast drops but the FLOW does not stop. */
  const calm = band(t, CUE.foldToPayment - 0.6, CUE.foldToPayment + 0.4,
    CUE.seamsCatch, CUE.shellOpens);
  const strength = lerp(1, 0.14, calm);
  const rp = revealP(t);
  return (
    <Topology t={t} strength={strength}
      live={lerp(0.46, 1, win(t, CUE.payloadExposed, CUE.coreTurns))}
      danger={dangerP(t)}
      split={splitP(t)}
      toward={win(t, CUE.routesBend, CUE.allPathsTerminate)}
      flowK={lerp(1, 2.4, rp)} />
  );
};
