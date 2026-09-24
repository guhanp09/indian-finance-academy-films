/* UPI SCAM 1 — assembly.
 *
 * Layers, and the camera that moves them at different rates. The camera is the heaviest object in
 * the film: it accelerates slowly, decelerates for a long time, overshoots by under 1%, and never
 * moves without a narrative reason. Each layer takes a different fraction of its motion, which is
 * what makes a 2D push-in read as depth rather than as a PowerPoint zoom.
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, H, W, clamp01, ease, lerp } from './design';
import { B, CUE, DURATION } from './timeline';
import { camera, stage } from './camera';
import { Backdrop } from './world/Backdrop';
import { Ledger, Tokens } from './world/Ledger';
import { Phone, Hand } from './world/Phone';
import { Crowd, Parents, Seller } from './world/Figures';
import { ChatBubble, Listings, Parcel, SellerWave } from './world/Market';
import { Rule } from './world/Rule';
import { Subtitles } from './Subtitles';
import { Watermark } from './Watermark';
import { EndCard, TOTAL as CARD_TOTAL, dimAt } from './EndCard';

/** a layer takes `depth` of the camera's motion: >1 foreground, <1 background. */
const Layer: React.FC<{ depth: number; t: number; children: React.ReactNode }> =
  ({ depth, t, children }) => {
    const c = camera(t);
    const s = 1 + (c.s - 1) * depth;
    return (
      <g transform={`translate(${W / 2} ${H * 0.52}) scale(${s}) translate(${-W / 2} ${-H * 0.52}) translate(${c.x * depth} ${c.y * depth})`}>
        {children}
      </g>
    );
  };

export const UpiFilm: React.FC<{ endCard?: boolean }> = ({ endCard = true }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const st = stage(t);
  const dim = endCard ? dimAt(frame) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070B1B' }}>
      <AbsoluteFill style={{ opacity: 1 - dim }}>
      <Backdrop />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0 }}>
        {/* rear: the ledger sits behind the action and takes less of the camera. Once the
            transaction is over it recedes toward the network it was always a part of — and it is
            gone for good from the moment the seller wave engulfs the frame, because nothing after
            that point refers to it and a dead diagram at the top of every later shot is clutter.
            It leaves inside the cover, which is the one thing the cover is still used for. */}
        {t < CUE.wavePeak && (
          <Layer depth={0.55} t={t}>
            <g transform={`translate(540 275) scale(${lerp(1, 0.62, ease.inOut(clamp01((t - B(36)) / 1.8)))}) translate(-540 -275)`}>
              <Ledger />
            </g>
          </Layer>
        )}

        {/* mid: the phone rig and everything that lives on it */}
        <Layer depth={1} t={t}>
          <Listings t={t} />
          <g transform={`translate(${540 + st.x} ${950 + st.y}) scale(${st.s}) translate(${-540} ${-950})`}>
            <Phone />
            <ChatBubble t={t} />
          </g>
        </Layer>

        {/* people live in front of the device plane and keep their own scale, so a pull-back that
            makes the phone small does not make a face unreadable */}
        <Layer depth={1.1} t={t}><Crowd t={t} /></Layer>

        {/* the money itself: parented to the phone's plane, because that is where it starts */}
        <Layer depth={1} t={t}><Tokens t={t} /></Layer>

        {/* fore: people and objects closest to camera move most */}
        <Layer depth={1.22} t={t}>
          <Parcel t={t} />
          <Seller t={t} x={64} y={1264} s={1.46} />
          <Parents t={t} stage={st} />
          <Hand t={t} stage={st} />
          <Rule t={t} stage={st} />
        </Layer>

        {/* NEAREST TO CAMERA, and therefore last. The wave has to pass in FRONT of everything —
            when it was drawn inside the foreground layer the seller figure painted over it and
            the scene change underneath was visible through him. */}
        <Layer depth={1.35} t={t}><SellerWave t={t} /></Layer>
      </svg>

      <Subtitles />
      {/* last, so it is never behind anything; inside the dim, so it yields to the sign-off
          rather than sitting on top of the full lockup the card already shows */}
      <Watermark />
      </AbsoluteFill>
      {endCard && <EndCard />}
      {/* narration + original score + synthesised SFX, pre-mixed with the music side-chained
          to the voice so speech is never masked */}
      <Audio src={staticFile('Audio/upi-mix.m4a')} />
    </AbsoluteFill>
  );
};

export const UPI_DURATION = DURATION;
export const UPI_WITH_CARD = CARD_TOTAL;
