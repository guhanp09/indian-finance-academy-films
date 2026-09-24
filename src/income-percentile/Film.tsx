import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { C } from './tokens';
import { CARD_START } from './state';

import { pr, EASE } from './anim';
import { Backdrop } from './kit';
import { ActPercentiles, ACT1_END } from './act1';
import { ActUSCost, ACT2_START, ACT2_END } from './act2';
import { ActIndiaCost, ACT3_START, ACT3_END } from './act3';
import { ActCompare, ACT4_START, ACT4_END } from './act4';
import { ActPrices, ACT5_START, ACT5_END } from './act5';
import { ActProductivity, ACT6_START, ACT6_END } from './act6';
import { ActReturn, ACT7_START, ACT7_END } from './act7';
import { ActClose, ACT8_START } from './act8';
import { EndCard, CARD_LEN, CardVariant } from './endcard';
import { Watermark } from './brand';

/** Which channel card the film ends on. */
export const CARD: CardVariant = 'quiet';
export const FILM_TOTAL = CARD_START + CARD_LEN[CARD];

export const IncomePercentileFilm: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop />
      {/* the recorded narration is the film's timing authority — timing.json
          and cues.json are both derived from this exact file */}
      <Audio src={staticFile('Audio/income-percentile-vo.mp3')} />
      {f < ACT1_END ? <ActPercentiles /> : null}
      {/* The two cost scenes travel as one strip: the outgoing panel reads the
          same eased progress the incoming one does, so the distance between
          them never changes mid-slide. */}
      {f >= ACT2_START && f < ACT2_END ? (
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-pr(f, ACT3_START, 26, EASE.move) * 2000}px)` }}>
          <ActUSCost />
        </div>
      ) : null}
      {f >= ACT3_START && f < ACT3_END ? <ActIndiaCost /> : null}
      {f >= ACT4_START && f < ACT4_END ? <ActCompare /> : null}
      {f >= ACT5_START && f < ACT5_END ? <ActPrices /> : null}
      {f >= ACT6_START && f < ACT6_END ? <ActProductivity /> : null}
      {f >= ACT7_START && f < ACT7_END ? <ActReturn /> : null}
      {/* the film's own content dims out under the card rather than cutting */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - pr(f, CARD_START, 22, EASE.move) }}>
        {f >= ACT8_START ? <ActClose /> : null}
      </div>
      {f >= CARD_START ? <EndCard f={f - CARD_START} variant={CARD} /> : null}
      {/* last, so it is above every scene, and unconditional, so it is in the
          same place on all 11,129 frames */}
      {/* the corner mark steps aside for the card — on the homecoming variant it
          is the same object arriving in the middle, so it must not be in both */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - pr(f, CARD_START, 12, EASE.move) }}>
        <Watermark />
      </div>
    </AbsoluteFill>
  );
};
