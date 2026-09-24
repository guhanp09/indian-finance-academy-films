/* The channel sign-off, laid out for 9:16.
 *
 * The existing card in src/income-percentile is built for a 1920x1080 frame, so this is a re-layout rather
 * than a port — the lockup is re-centred for a vertical frame and the mark is scaled, never
 * cropped (the ring has to close; see the brand rule).
 *
 * Shape, unchanged from the approved card: the closing frame holds briefly after the last spoken
 * word, then the content dims while the mark fades up at centre with a small scale settle and the
 * name arrives under it. 3.7s of card.
 */
import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FPS, T, clamp01, ease, lerp, tracking } from './design';
import { NARR } from './timeline';

const LAST_WORD_END = NARR.words[NARR.words.length - 1].e;
/* The sign-off follows the last word closely — the mark starts fading up half a second after it,
   and is fully up by ~0.95s. Holding 2.8s of silent film first read as the film having ended
   twice. */
export const HANDOVER = Math.round((LAST_WORD_END + 0.5) * FPS);   // the card begins
export const CARD_LEN = Math.round(3.7 * FPS);
export const TOTAL = HANDOVER + CARD_LEN;

const MARK = 320;

/** How much the film underneath should be dimmed at this frame (0 = untouched). */
export const dimAt = (frame: number) => ease.inOut(clamp01((frame - HANDOVER) / 24));

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - HANDOVER;
  if (f < 0) return null;

  /* the mark arrives: it fades up and settles, it does not pop */
  const up = ease.out(clamp01(f / 26));
  const settle = 1 - Math.exp(-f / 9) * 0.0;
  const scale = lerp(0.955, 1, ease.out(clamp01(f / 34))) * settle;
  const nameIn = ease.out(clamp01((f - 16) / 22));
  const out = clamp01((f - (CARD_LEN - 10)) / 10);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - out }}>
      <div style={{
        position: 'absolute', left: 540 - MARK / 2, top: 830 - MARK / 2,
        width: MARK, height: MARK, opacity: up,
        transform: `scale(${scale})`, transformOrigin: 'center',
      }}>
        <Img src={staticFile('brand/ifa-mark-teal.png')}
          style={{ width: MARK, height: MARK, display: 'block' }} />
      </div>
      <div style={{
        position: 'absolute', left: 0, top: 830 + MARK / 2 + 58, width: '100%',
        textAlign: 'center', opacity: nameIn,
        transform: `translateY(${(1 - nameIn) * 10}px)`,
        font: `700 ${T.label - 4}px ${T.face}`, color: C.ink, ...tracking(9),
        whiteSpace: 'nowrap',
      }}>
        INDIAN FINANCE ACADEMY
      </div>
    </div>
  );
};
