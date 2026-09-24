/* The channel sign-off, laid out for 9:16.
 *
 * The approved card (the channel end card, option A "the mark arrives"), reused unchanged from the
 * previous film in this series. The mark is scaled, never cropped — the ring has to close
 * (rule: the brand mark is never cropped).
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
/* THE SIGN-OFF WAITS FOR THE CLOSING SHOT TO FINISH. It used to follow the last word by half a
   second, because at that point there was nothing after the words: holding 2.8s of silent film
   read as the film having ended twice. There is something now — the counter reads the notice and
   prints its answer, and that happens with the narration already over, so the image carries the
   last two and a half seconds on its own. The card takes over when that has settled.
   tools/echallan/act4.mjs asserts ACT4_END lands on or before this. */
export const TAIL_SHOT = 3.00;
export const HANDOVER = Math.round((LAST_WORD_END + TAIL_SHOT) * FPS);   // the card begins
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
