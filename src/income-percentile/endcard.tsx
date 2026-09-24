// The channel card the film ends on.
//
// Three things it has to do, in this order of importance: let the last sentence
// land before anything moves, name the channel clearly enough to be remembered,
// and get out. A logo hold that outstays its welcome is the most common way an
// otherwise good explainer loses its last ten seconds of watch time — the
// picture stops carrying information and the viewer leaves, which the platform
// reads as the video ending badly.
//
// So the card is built as: a beat of the closing frame with nothing happening
// (the film's own last thought, undisturbed), a short handover, and a still
// hold of the mark. Every variant below keeps that skeleton and differs only in
// how the mark arrives and which ink it wears.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, FONT, T } from './tokens';
import { pr, fade, clamp01, lerp, EASE } from './anim';

export type CardVariant = 'quiet' | 'homecoming' | 'rule' | 'endscreen';

/** How long each variant runs, from the first frame of the handover. */
export const CARD_LEN: Record<CardVariant, number> = {
  quiet: 112,        // 3.7s
  homecoming: 124,   // 4.1s
  rule: 118,         // 3.9s
  endscreen: 360,    // 12.0s — long enough for YouTube's clickable cards
};

const MARK = 264;
const NAME = { size: T.label, track: 9 };

const Name: React.FC<{ op: number; color: string; y: number }> = ({ op, color, y }) => (
  <div style={{
    position: 'absolute', left: 0, top: y, width: '100%', textAlign: 'center',
    opacity: op, fontFamily: FONT, fontSize: NAME.size, fontWeight: 700,
    letterSpacing: NAME.track, color, whiteSpace: 'nowrap',
  }}>
    INDIAN FINANCE ACADEMY
  </div>
);

/**
 * `quiet`      — the mark simply arrives at centre and settles. Nothing else
 *                moves. The safest and the most common, for good reason.
 * `homecoming` — the watermark that has sat in the corner for the whole film
 *                detaches and travels to the middle, growing as it goes. The
 *                film already uses this device once (the worker walks from the
 *                middle of the hinge into the corner of the next frame), so the
 *                ending is in the same grammar rather than bolted on.
 * `rule`       — a hairline rule draws across the centre, the mark above it and
 *                the name below. The film's divider language, used once more at
 *                the end. The quietest of the three.
 */
export const EndCard: React.FC<{ f: number; variant: CardVariant }> = ({ f, variant }) => {
  /* the corner the watermark occupies all film, in this frame's coordinates */
  /* measured from the real lockup: right margin 80, mark 48 wide, 12 gap, then
     a ~118px two-line wordmark — so the mark's own centre sits here */
  const corner = { cx: 1840 - 118 - 12 - 24, cy: 48 + 24, size: 48 };
  const centre = { cx: 960, cy: 470 };

  if (variant === 'homecoming') {
    const travel = pr(f, 8, 40, EASE.smooth);
    const size = lerp(corner.size, MARK, travel);
    const cx = lerp(corner.cx, centre.cx, travel);
    const cy = lerp(corner.cy, centre.cy, travel);
    return (
      <>
        <div style={{
          position: 'absolute', left: cx - size / 2, top: cy - size / 2,
          opacity: lerp(0.22, 1, clamp01(travel * 1.4)),
        }}>
          <Img src={staticFile('brand/ifa-mark-teal.png')}
            style={{ width: size, height: size, display: 'block' }} />
        </div>
        <Name op={pr(f, 44, 22, EASE.move)} color={C.ink} y={centre.cy + MARK / 2 + 46} />
      </>
    );
  }

  if (variant === 'rule') {
    const draw = pr(f, 2, 30, EASE.move);
    const up = pr(f, 16, 24, EASE.move);
    return (
      <>
        <div style={{
          position: 'absolute', left: 960 - 300 * draw, top: centre.cy + MARK / 2 + 22,
          width: 600 * draw, height: 2, background: C.dim,
        }} />
        <div style={{
          position: 'absolute', left: centre.cx - MARK / 2,
          top: centre.cy - MARK / 2 + (1 - up) * 14, opacity: up,
        }}>
          <Img src={staticFile('brand/ifa-mark.png')}
            style={{ width: MARK, height: MARK, display: 'block' }} />
        </div>
        <Name op={pr(f, 30, 22, EASE.move)} color={C.brandTeal} y={centre.cy + MARK / 2 + 48} />
      </>
    );
  }

  if (variant === 'endscreen') {
    /* YouTube's end-screen elements are laid over the finished frame, and the
       suggested-video card takes the right of it. A centred lockup ends up
       underneath them, so the branding moves into the left third and the rest
       of the frame is deliberately left empty for the platform to fill. */
    const up = pr(f, 8, 26, EASE.move);
    const cx = 620;
    return (
      <>
        <div style={{
          position: 'absolute', left: cx - MARK / 2, top: centre.cy - MARK / 2 + (1 - up) * 10,
          opacity: up,
        }}>
          <Img src={staticFile('brand/ifa-mark.png')}
            style={{ width: MARK, height: MARK, display: 'block' }} />
        </div>
        <div style={{
          position: 'absolute', left: cx - 320, top: centre.cy + MARK / 2 + 46, width: 640,
          textAlign: 'center', opacity: fade(f, 26, undefined, 20), fontFamily: FONT,
          fontSize: NAME.size, fontWeight: 700, letterSpacing: NAME.track, color: C.ink,
          whiteSpace: 'nowrap',
        }}>
          INDIAN FINANCE ACADEMY
        </div>
      </>
    );
  }

  const up = pr(f, 8, 26, EASE.move);
  const s = lerp(0.94, 1, up);
  return (
    <>
      <div style={{
        position: 'absolute', left: centre.cx - (MARK * s) / 2, top: centre.cy - (MARK * s) / 2,
        opacity: up,
      }}>
        <Img src={staticFile('brand/ifa-mark.png')}
          style={{ width: MARK * s, height: MARK * s, display: 'block' }} />
      </div>
      <Name op={fade(f, 26, undefined, 20)} color={C.ink} y={centre.cy + MARK / 2 + 46} />
    </>
  );
};
