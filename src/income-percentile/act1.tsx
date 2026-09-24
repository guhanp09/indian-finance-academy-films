// Movement one: two percentile builds that deliberately disagree about order.
// India goes salary -> rank; the US goes rank -> salary.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, IN, US } from './tokens';
import { CountryRig, RigMarker } from './rig';
import { cue, beat, IN_INCOME, IN_RANK, US_INCOME, US_RANK, onSaid } from './state';
import { pr, accent, EASE } from './anim';

const IN_MARKERS: RigMarker[] = [
  { v: IN.median, value: '₹12K', label: 'MEDIAN',  color: C.band50, valueAt: cue('in.12k'), labelAt: cue('in.50') },
  { v: IN.top10,  value: '₹32K', label: 'TOP 10%', color: C.band90, valueAt: cue('in.32k'), labelAt: cue('in.t10') },
  { v: IN.top1,   value: '₹75K', label: 'TOP 1%',  color: C.band99, valueAt: cue('in.75k'), labelAt: cue('in.t1') },
];
/* the label states a rank, so it lands on the rank word — the USA says the rank
   first and the money second, and the marker has to follow that order too */
const US_MARKERS: RigMarker[] = [
  { v: US.median, value: '$4.4K',  label: 'MEDIAN',  color: C.band50, valueAt: cue('us.4400'),  labelAt: cue('us.50') },
  { v: US.top10,  value: '$12.9K', label: 'TOP 10%', color: C.band90, valueAt: cue('us.12900'), labelAt: cue('us.90') },
  { v: US.top1,   value: '$37.5K', label: 'TOP 1%',  color: C.band99, valueAt: cue('us.37500'), labelAt: cue('us.99') },
];

/* Not beat(8): in the recording the next line begins on the very frame the
   $37,500 counter comes to rest, so cutting there took the figure off screen at
   the instant it landed. The ladder holds a beat past its own last number and
   the next scene arrives during the sentence that introduces it. */
export const ACT1_END = cue('us.37500') + 50;   // 36 frames of hold, then a 14-frame handover

export const ActPercentiles: React.FC = () => {
  const f = useCurrentFrame();
  // the pivot holds up the finished system — all three landmarks, not one —
  // and lets go of it the moment the next line starts
  /* lit for three frames it read as a flicker; it now holds through the pause
     after "misleading" and lets go as the pivot line begins */
  const hiAll = accent(f, onSaid('pivot.mislead'), beat(4) + 6);
  const slide = pr(f, beat(4) + 22, 28, EASE.move);

  /* The ladder used to be switched off in one frame, taking the $37,500 readout
     and both marker labels with it mid-sentence. It now fades under act 2,
     which continues the same meter, so the handover reads as the dot field
     giving way rather than as a cut. */
  const handOver = pr(f, ACT1_END - 14, 14, EASE.move);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - handOver }}>
      {slide < 0.999 ? (
        <CountryRig f={f} chip="INDIA" country="in" prefix="₹" step={1000} cap={IN.cap}
          income={IN_INCOME} rank={IN_RANK} markers={IN_MARKERS}
          appear={pr(f, 4, 34, EASE.smooth)} dx={-slide * 2000} hiAll={hiAll} />
      ) : null}
      {slide > 0.001 ? (
        <CountryRig f={f} chip="USA" country="us" prefix="$" step={100} cap={US.cap}
          income={US_INCOME} rank={US_RANK} markers={US_MARKERS}
          appear={pr(f, beat(4) + 24, 32, EASE.smooth)} dx={(1 - slide) * 2000} />
      ) : null}
    </div>
  );
};
