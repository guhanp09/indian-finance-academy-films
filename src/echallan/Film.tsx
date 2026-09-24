/* FAKE e-CHALLAN MALWARE — assembly.
 *
 * Layers, and one camera that moves them at different rates. The camera is the heaviest object in
 * the film: it accelerates slowly, decelerates for a long time, and never moves without a reason.
 * Each layer takes a different FRACTION of its motion, which is what makes a 2D push-in read as
 * depth rather than as a uniform zoom (addendum §15).
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, H, W, ground } from './design';
import { DURATION } from './timeline';
import { camera, stage } from './camera';
import { Subtitles } from './Subtitles';
import { Watermark } from './Watermark';
import { EndCard, TOTAL as CARD_TOTAL, dimAt } from './EndCard';
import { EarlyDevice, EarlyHand, EarlyWorld } from './scenes/early';
import { Install2Device, Install2Hand, Interior } from './scenes/install2';
import { PermDevice, PermHand, Topology } from './scenes/permissions';
import { PayDevice, PayHand, PayTopology } from './scenes/payment';
import { TheftDevice, TheftPackets, TheftWorld } from './scenes/theft';
import { Recap } from './scenes/recap';
import { Ghost, MemoryImage, PrevDevice, PrevHand } from './scenes/prevention';
import { CUE } from './timeline';
import { win } from './design';

/** a layer takes `depth` of the camera's motion: >1 nearer than the focal plane, <1 further */
const Layer: React.FC<{ depth: number; t: number; children: React.ReactNode }> =
  ({ depth, t, children }) => {
    const c = camera(t);
    const s = 1 + (c.s - 1) * depth;
    return (
      <g transform={`translate(${W / 2} ${H * 0.5}) scale(${s}) translate(${-W / 2} ${-H * 0.5}) `
        + `translate(${c.x * depth} ${c.y * depth})`}>
        {children}
      </g>
    );
  };

export const EchallanFilm: React.FC<{ endCard?: boolean }> = ({ endCard = true }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rig = stage(t);
  const g = ground(t);
  const dim = endCard ? dimAt(frame) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: g.deep }}>
      <AbsoluteFill style={{ opacity: 1 - dim }}>
      {/* the ground is a function of story time, and it is always already becoming the next
          phase, so no cut ever coincides with a colour change */}
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, ${g.high} 0%, ${g.deep} 58%, ${g.deep} 100%)`,
      }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {/* PHASE CROSSOVER. The two scene files overlap by half a second rather than swapping on
            a frame: the service is drawn by whichever one owns the clock, and the handover happens
            while both are showing the same settled screen. */}
        <Layer depth={0.32} t={t}><EarlyWorld t={t} /></Layer>
        {t < CUE.updateRise + 0.25 && (
          <>
            <Layer depth={1.0} t={t}><EarlyDevice t={t} rig={rig} /></Layer>
            <Layer depth={1.18} t={t}><EarlyHand t={t} rig={rig} /></Layer>
          </>
        )}
        {t >= CUE.updateRise - 0.25 && t < CUE.smsCard + 0.25 && (
          <>
            {/* the interior sits BEHIND the device, and its rim is drawn after, so the foot of the
                phone passes behind it and the two registers are physically one object */}
            <Layer depth={0.72} t={t}>
              <Interior t={t} open={win(t, CUE.payloadAppears, CUE.installer2)}
                live={win(t, CUE.payloadLands, CUE.appResurfaces + 0.6) * 0.46} />
            </Layer>
            <Layer depth={1.0} t={t}><Install2Device t={t} rig={rig} /></Layer>
            <Layer depth={1.18} t={t}><Install2Hand t={t} rig={rig} /></Layer>
          </>
        )}
        {t >= CUE.smsCard - 0.25 && t < CUE.foldToPayment + 0.25 && (
          <>
            <Layer depth={0.72} t={t}><Topology t={t} /></Layer>
            <Layer depth={1.0} t={t}><PermDevice t={t} rig={rig} /></Layer>
            <Layer depth={1.18} t={t}><PermHand t={t} rig={rig} /></Layer>
          </>
        )}
        {t >= CUE.foldToPayment - 0.25 && t < CUE.fieldsReturn + 0.25 && (
          <>
            <Layer depth={0.72} t={t}><PayTopology t={t} /></Layer>
            <Layer depth={1.0} t={t}><PayDevice t={t} rig={rig} /></Layer>
            <Layer depth={1.18} t={t}><PayHand t={t} rig={rig} /></Layer>
          </>
        )}
        {t >= CUE.fieldsReturn - 0.25 && t < CUE.chainStarts + 0.25 && (
          <>
            <Layer depth={0.72} t={t}><TheftWorld t={t} rig={rig} /></Layer>
            <Layer depth={1.0} t={t}><TheftDevice t={t} rig={rig} /></Layer>
            {/* the packets are DATA LEAVING the device, so they pass in front of it */}
            <Layer depth={1.10} t={t}><TheftPackets t={t} rig={rig} /></Layer>
          </>
        )}
        {t >= CUE.chainStarts - 0.25 && t < CUE.messageReturns + 0.25 && (
          <Layer depth={0.86} t={t}><Recap t={t} /></Layer>
        )}
        {t >= CUE.messageReturns - 0.25 && (
          <>
            <Layer depth={0.60} t={t}><Ghost t={t} /></Layer>
            <Layer depth={0.88} t={t}><MemoryImage t={t} /></Layer>
            <Layer depth={1.0} t={t}><PrevDevice t={t} rig={rig} /></Layer>
            <Layer depth={1.18} t={t}><PrevHand t={t} rig={rig} /></Layer>
          </>
        )}
      </svg>

      <Subtitles />
      {/* last, so it is never behind anything; inside the dim, so it yields to the sign-off */}
      <Watermark />
      </AbsoluteFill>
      {endCard && <EndCard />}
      {/* narration + original score + synthesised SFX, pre-mixed with the music side-chained to
          the voice so speech is never masked */}
      <Audio src={staticFile('Audio/echallan-mix.m4a')} />
    </AbsoluteFill>
  );
};

export const FILM_FRAMES = DURATION;
export const FILM_WITH_CARD = CARD_TOTAL;
