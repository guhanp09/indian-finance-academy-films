import React from 'react';
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from 'remotion';
import { FPS, H, W } from '../design';
import { Opening, OPENING_END } from './opening';
import { ACT2_END, Act2 } from './act2';
import { ACT3_END, Act3 } from './act3';
import { ACT4_END, Act4 } from './act4';
import { Subtitles } from '../Subtitles';
import { Watermark } from '../Watermark';
import { EndCard, TOTAL as CARD_TOTAL, dimAt } from '../EndCard';

/* THE FILM — picture, subtitles, watermark and its own mix. The v2 rebuild began as the opening on
   its own and grew to cover all four acts plus the sign-off, so this composition (id "Opening") is
   the delivered film; "Echallan" is the first-pass cut, kept for reference. */
/* the comp's length is the LAST measured beat plus its tail, never a frame count typed in by
   hand: a script edit moved every word under this act by 2.24 s and a literal 3681 would simply
   have truncated the payment. */
/* THE WHOLE FILM, including the sign-off card, whose length is derived from the LAST MEASURED
   WORD rather than typed — EndCard.TOTAL is (last word + 0.5s) + 3.7s of card. */
export const OPENING_FRAMES = CARD_TOTAL;

export const OpeningComp: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  /* tools/echallan/captions.mjs renders this comp WITHOUT its captions, to measure where the
     picture's focal mass actually is before deciding which edge each caption page is anchored
     to. Measuring a frame that already has the caption burnt into it would measure the caption. */
  const subs = (getInputProps() as { subs?: boolean }).subs !== false;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {t < OPENING_END ? <Opening t={t} />
          : t < ACT2_END ? <Act2 t={t} />
            : t < ACT3_END ? <Act3 t={t} /> : <Act4 t={t} />}
      </svg>
      {subs && <Subtitles />}
      <Watermark />
      {/* the approved sign-off (the channel end card), unchanged, over a dimmed last frame */}
      <div style={{ position: 'absolute', inset: 0, background: '#05040F',
        opacity: dimAt(useCurrentFrame()) * 0.92, pointerEvents: 'none' }} />
      <EndCard />
      <Audio src={staticFile('Audio/echallan-opening-mix.m4a')} />
    </AbsoluteFill>
  );
};
