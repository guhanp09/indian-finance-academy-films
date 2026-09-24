/* THE CHANNEL MARK.
 *
 * The one element in the film that never moves, never fades and never responds to the narration —
 * so it has to stand somewhere the film itself never goes. That place was measured, not guessed:
 * every 4th frame of the finished render was reduced to a map of where this film ever puts ink,
 * and the candidate corners were scored against it.
 *
 *   top-right,  y 28–112    ink on   15/639 frames (2.3%)   <- this one
 *   top-right,  y 120–204   ink on  288/639 frames (45.1%)  the ledger's THEM node lives here
 *   top-right,  y 220–304   ink on  319/639 frames (49.9%)
 *   top-left,   y 28–112    ink on   18/639 frames (2.8%)   symmetrical, but YOU's balance is under it
 *   bottom-right            ink on  539/639 frames (84.4%)  subtitles, and the Shorts UI band
 *
 * The 15 frames of contact in the chosen band are one contiguous second, 20.27–21.20s, and they
 * are the seller wave passing across the whole frame. A mark standing behind a full-frame wipe for
 * one second is a signature the picture crosses, not a mark standing in front of something.
 *
 * SIZE IS NOT SCALED FROM THE 16:9 FILM. That one sets a 48px mark and 12px text on a 1920-wide
 * frame; scaled by width to 1080 the name would be 6.75px, which is a quarter of this film's
 * 26px floor for anything legible in the hand. It is sized for the phone instead, and held at the
 * same low opacity, because it is a signature and must never compete with the picture.
 */
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, T, tracking } from './design';

const MARK = 52;
const OP = 0.22;

export const Watermark: React.FC = () => (
  <div style={{
    position: 'absolute', right: 60, top: 40,
    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
    opacity: OP,
  }}>
    {/* the full square, never trimmed to fit — the ring has to close */}
    <Img src={staticFile('brand/ifa-mark.png')}
      style={{ width: MARK, height: MARK, display: 'block' }} />
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {['INDIAN FINANCE', 'ACADEMY'].map((l) => (
        <span key={l} style={{
          font: `600 26px ${T.face}`, lineHeight: '30px', color: C.ink,
          whiteSpace: 'nowrap', ...tracking(2),
        }}>{l}</span>
      ))}
    </div>
  </div>
);
