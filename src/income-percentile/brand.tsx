// The channel mark.
//
// It is the one element in the film that never moves, never fades and never
// responds to the narration, so it has to sit somewhere the film itself never
// goes. That place was measured rather than guessed: every 4th frame of the
// finished render was reduced to a map of where this film ever puts ink, and
// every watermark-sized box was scored against it. The banknote meter owns
// x 1400–1640 for a third of the running time, top to bottom; the film's own
// right margin is 80. The 196px between those two lines, in the band above the
// headings, is the only place a mark can stand for six minutes without ever
// standing in front of something — 1.5s of contact in 6:11, all of it panels
// sliding past on a scene change.
//
// The mark is drawn as line art in the film's own ink and held at one low
// opacity: it is a signature, not an element, and it must never compete with a
// figure the narrator is naming.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, FONT } from './tokens';

export const WM = {
  /** the meter's right edge — nothing may cross it */
  wall: 1640,
  margin: 80,
  op: 0.22,
  markA: 48,
  markB: 48,
  text: 12,
  track: 1.4,
} as const;

const Words: React.FC<{ align: 'left' | 'center' }> = ({ align }) => (
  <div style={{ display: 'flex', flexDirection: 'column', opacity: 0.9, textAlign: align }}>
    {['INDIAN FINANCE', 'ACADEMY'].map((l) => (
      <span key={l} style={{
        fontFamily: FONT, fontSize: WM.text, lineHeight: '15px', fontWeight: 600,
        letterSpacing: WM.track, color: C.ink, whiteSpace: 'nowrap',
      }}>{l}</span>
    ))}
  </div>
);

/**
 * `header` — mark first, name beside it, in the band above the headings.
 * `seal`   — the same corner, stacked: mark over name.
 * `footer` — bottom right; only safe once the caption band has been pulled in.
 */
export const Watermark: React.FC<{ variant?: 'header' | 'seal' | 'footer' }> =
  ({ variant = 'header' }) => {
    const stacked = variant === 'seal';
    return (
      <div style={{
        position: 'absolute',
        right: WM.margin,
        top: stacked ? 32 : variant === 'footer' ? 998 : 48,
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: stacked ? 9 : 12,
        opacity: WM.op,
      }}>
        <Img
          src={staticFile('brand/ifa-mark.png')}
          style={{ width: stacked ? WM.markB : WM.markA, height: stacked ? WM.markB : WM.markA, display: 'block' }}
        />
        <Words align={stacked ? 'center' : 'left'} />
      </div>
    );
  };
