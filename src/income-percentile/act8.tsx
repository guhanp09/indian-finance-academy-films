// Movement eight: the empirical conclusion, then the distinction the film
// exists to make. One continuous landscape layout — the meter and the dot field
// travel between columns rather than cross-fading, so neither object is ever
// lost, and the gap the whole film has been measuring is bracketed on the meter
// one last time before the argument closes.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, IN, METER, zonesOf } from './tokens';
import { Txt, Chip, DotField, Meter, MeterMarker, Brace, Flag, Hatch } from './kit';
import { DOT_BANDS } from './rig';
import { cue, beat, lead, beatEnd, inV, onWord, onSaid } from './state';
import { pr, fade, accent, lerp, clamp01, settle, EASE } from './anim';
import { money } from './fmt';

/* Early enough that this frame is already rising while act 7 is still leaving:
   the two overlap, so there is never a frame with nothing on it. */
export const ACT8_START = cue('back.meter') - 56;

export const ActClose: React.FC = () => {
  const f = useCurrentFrame();

  const enter = pr(f, ACT8_START, 22, EASE.smooth);            // meter rises into place as act 7 leaves
  const toRank = pr(f, lead(68, 26), 34, EASE.smooth);        // meter leaves right, dots take centre
  const toGap = pr(f, cue('end.gap') - 76, 46, EASE.smooth);   // dots step aside, meter returns

  /* the dot field's journey: left column, then centre and large, then left again */
  const dotX = lerp(lerp(160, 700, toRank), 150, toGap);
  const dotCell = lerp(lerp(40, 62, toRank), 44, toGap);
  const dotBottom = lerp(lerp(820, 900, toRank), 880, toGap);

  /* the meter's journey: in from below, out to the right, back in from the right */
  const meterX = lerp(lerp(METER.x, 2140, toRank), 1000, toGap);
  const lane = meterX + METER.w + 22;
  const meterDy = (1 - enter) * 700;
  /* The swap changes note count, band heights, hatch extent and the whole
     marker set at once, so it has to happen while the meter is off the right
     edge rather than half way through its travel — at 0.5 it landed in full
     view, on the word "Your". */
  const conclusion = toRank < 0.02;
  const vHi = conclusion ? 0.5 : 1;

  const YOU = 0.58;      // an income between the top-10% and top-1% lines
  const CORAL = 0.40;
  const hatch: Hatch[] = conclusion
    ? [{ from: 0, to: inV(IN.cost), kind: 'cost' }]
    : [{ from: 0, to: CORAL, kind: 'cost' }];

  /* beat 64 names the gap; beat 65 narrows it to the top-10% line */
  const gapBrace = fade(f, cue('back.meter') - 20, cue('end.floor') - 26, 18);
  const shortBrace = pr(f, ...onWord('end.floor'), EASE.move);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* ---- the meter, wherever it currently is ---- */}
      <div style={{ transform: `translateY(${meterDy}px)` }}>
        <Meter x={meterX} vHi={vHi} zones={zonesOf(IN)} hatch={hatch} active={1} reveal={enter} />
        <Flag country="in" x={meterX + METER.w / 2 - 32} y={METER.base + 26} op={enter * (1 - toRank)} />

        {conclusion ? (
          <>
            <Chip x={80} y={110} text="INDIA" op={enter * (1 - toRank)} draw={enter} />
            <MeterMarker v={inV(IN.median)} vHi={vHi} value="₹12K" label="MEDIAN" color={C.band50}
              stackX={meterX} x={lane} op={1 - toRank} draw={enter} />
            <MeterMarker v={inV(IN.top10)} vHi={vHi} value="₹32K" label="TOP 10%" color={C.band90}
              stackX={meterX} x={lane} op={1 - toRank} anchor="below"
              draw={pr(f, cue('end.t10') - 26, 20, EASE.move)}
              scale={1 + 0.12 * accent(f, onSaid('end.t10'), cue('end.floor') - 22)} />
            <MeterMarker v={inV(IN.cost)} vHi={vHi} value={money(IN.cost, '₹')} label="COST OF LIVING"
              color={C.cost} size={30} stackX={meterX} x={lane} op={1 - toRank} anchor="above"
              draw={pr(f, ACT8_START + 14, 22, EASE.move)}
              scale={1 + 0.12 * accent(f, onSaid('end.floor'), beatEnd(66) + 8)} />

            {/* the gap the film has been measuring, bracketed one last time */}
            <div style={{ opacity: gapBrace * (1 - toRank) }}>
              <Brace v0={inV(IN.median)} v1={inV(IN.cost)} vHi={vHi} value={money(IN.shortMed, '₹')}
                label="SHORT EVERY MONTH" color={C.cost} x={meterX - 30} labelW={280} draw={enter} />
            </div>
            <div style={{ opacity: (1 - toRank) }}>
              <Brace v0={inV(IN.top10)} v1={inV(IN.cost)} vHi={vHi} value={money(IN.shortT10, '₹')}
                label="SHORT" color={C.cost} x={meterX - 30} labelW={280} draw={shortBrace} />
            </div>
          </>
        ) : (
          <>
            {/* The last sentence names these three in order — "the gap between
                your income and the cost of maintaining your life" — so each one
                draws on the words that name it. They used to be keyed off
                "gap" alone and arrived two and a half seconds before the voice
                reached them, which turned the film's closing line into a
                caption for a picture already finished. */}
            <MeterMarker v={YOU} value="YOUR INCOME" unit="" label="SOMEWHERE IN HERE" color={C.ink}
              stackX={meterX} x={meterX + METER.w + 70} size={28}
              draw={pr(f, ...onWord('end.income'), EASE.move)} />
            <MeterMarker v={CORAL} value="COST OF LIVING" unit="" label="EVERY MONTH" color={C.cost}
              stackX={meterX} x={meterX + METER.w + 70} size={28}
              draw={pr(f, ...onWord('end.cost'), EASE.move)} />
            <Brace side="right" v0={CORAL} v1={YOU} x={meterX + METER.w + 30} labelW={240}
              value="WHAT'S" label="LEFT" color={C.surplus}
              draw={pr(f, cue('end.cost') + 6, 30, EASE.move)} />
          </>
        )}
      </div>

      {/* ---- the population field, travelling with it ---- */}
      <DotField x={dotX} bottom={dotBottom} cell={dotCell} r={dotCell * 0.34}
        fill={90} bands={DOT_BANDS} appear={enter} />
      {/* the count captions its own grid, on the grid's left edge and optically
          centred against its label rather than sharing a baseline with it */}
      <div style={{
        position: 'absolute', left: dotX, top: dotBottom + 26,
        display: 'flex', alignItems: 'center', gap: lerp(14, 18, toRank),
        opacity: fade(f, cue('end.t10') - 24, undefined, 16),
        transform: `scale(${settle(f, cue('end.t10'))})`, transformOrigin: 'left center',
      }}>
        <Txt size={lerp(56, 72, toRank)} color={C.band90} weight={800} tabular lh={1}>90</Txt>
        <Txt size={T.small} color={C.muted} weight={700} track={2.6} lh={1}>OF 100 EARN LESS</Txt>
      </div>
      {/* on the word "rank" — it used to arrive with the dot field's own move and
          then leave six seconds of a motionless frame under the sentence */}
      <div style={{ position: 'absolute', left: dotX, top: dotBottom + 122,
        opacity: Math.min(clamp01(toRank * 2 - 0.4), pr(f, cue('end.rank') - 18, 18, EASE.move)) }}>
        <Txt size={T.small} color={C.muted} weight={700} track={3.4}>WHERE YOU RANK</Txt>
      </div>
    </div>
  );
};
