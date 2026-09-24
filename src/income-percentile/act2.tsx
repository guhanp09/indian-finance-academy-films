// Movement two: an actual life, priced against the US income hierarchy.
// The meter carries over untouched; the dot field is un-drawn to make room.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, US, zonesOf } from './tokens';
import { DotField, Txt, yAt } from './kit';
import { DOT_BANDS, DOTS, RankReadout } from './rig';
import { CostScene, BASKET } from './cost';
import {
  cue, beat, rollStart, staged, stagedPrev, usV, usTax,
  US_COST, US_LEFT, US_ACTIVE, US_TRAVEL, US_VIEW, BASKET_SHOW, LIFE_CUES_US,
} from './state';
import { pr, fade, clamp01, EASE } from './anim';
import { money } from './fmt';

export const ACT2_START = cue('us.37500') + 36;   // hands over exactly where act 1 lets go
/* Beat 16 is "At the top 1%, about $23,200 is left." — the last thing this
   frame is asked to show. It holds until India takes the screen at beat 17. */
export const ACT2_END = beat(16) + 14;

const Z = zonesOf(US);

export const ActUSCost: React.FC = () => {
  const f = useCurrentFrame();

  const vHi = staged(f, US_VIEW);
  const cost = staged(f, US_COST);
  const costPrev = stagedPrev(f, US_COST);
  const active = staged(f, US_ACTIVE);
  const left = staged(f, US_LEFT);
  const leftPrev = stagedPrev(f, US_LEFT);

  /* Each readout is mounted from its own roll, not from a constant, so it can
     never appear part-way through its own number. The tax band is the one that
     answers to a different word: it belongs to "federal and payroll taxes",
     which is said a second and a half before the figure it produces. */
  /* exactly on the first frame of each roll: a lead of even six frames mounts
     the readout while `staged()` is still returning the stage's `from`, which
     is zero — the film briefly stating "$0/month" in the colour of the claim */
  const totalOn = f >= rollStart('us.cost');
  const leftOn = f >= rollStart('us.left.med');
  const taxOn = f >= cue('us.tax') - 10;
  const tax = taxOn ? usTax(active, left) : 0;
  const taxTop = taxOn ? (US.cost + tax) / US.cap : undefined;

  /* the dot field un-draws; the meter stays exactly where it is */
  const dotsOut = pr(f, ACT2_START + 6, 46, EASE.smooth);

  const heroLand = !leftOn ? cue('us.cost')
    : f < rollStart('us.left.tax') ? cue('us.left.med')
      : f < rollStart('us.left.t10') ? cue('us.left.tax')
        : f < rollStart('us.left.t1') ? cue('us.left.t10') : cue('us.left.t1');
  /* One anchor, drawn once. Moving it at each phase sent `draw` from 1 to 0 in
     a single frame and left nothing bracketed for four seconds — across "even
     if you account for federal and payroll taxes, the median earner *still*
     has…", where "still" refers to the bracket that had just vanished. The
     endpoints track the values continuously, so it retargets without redrawing. */
  const braceDraw = leftOn ? pr(f, cue('us.left.med') - 30, 34, EASE.move) : 0;
  const greenFrom = taxOn ? (taxTop as number) : US.cost / US.cap;
  const targets = US_COST.slice(0, 5).map((st) => yAt(st.to / US.cap, vHi));

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {dotsOut < 0.999 ? (
        <>
          <DotField x={DOTS.x} bottom={DOTS.bottom} cell={DOTS.cell} r={DOTS.r}
            fill={99} bands={DOT_BANDS} write={1 - dotsOut} />
          <RankReadout value={99} color={C.band99} op={1 - clamp01(dotsOut * 2.4)} />
        </>
      ) : null}

      <CostScene
        f={f} chip="USA" country="us" cap={US.cap} prefix="$" zones={Z}
        cost={cost} costPrev={costPrev} active={active} taxTop={taxTop}
        provisional={!totalOn}
        vHi={vHi}
        basket={{ showAt: US_TRAVEL.map((t) => t - BASKET_SHOW), travelAt: US_TRAVEL, targets, country: 'us' }}
        hero={totalOn ? {
          value: leftOn ? left : cost, prev: leftOn ? leftPrev : costPrev,
          color: leftOn ? C.surplus : C.cost, step: 10, land: heroLand,
        } : undefined}
        costMarker={totalOn ? {
          value: money(US.cost, '$'), op: fade(f, cue('us.cost') - 10, undefined, 14),
          labelOp: fade(f, cue('us.cost') - 6, undefined, 14),
          draw: pr(f, cue('us.cost') - 6, 16, EASE.move),
        } : undefined}
        markers={[
          // at the widest view the median sits 37px under the cost floor, so it
          // keeps its rule and gives up its label rather than colliding
          { v: US.median, value: '$4.4K', label: 'MEDIAN', color: C.band50, op: vHi > 0.46 ? 0 : 1 },
          { v: US.top10, value: '$12.9K', label: 'TOP 10%', color: C.band90 },
          { v: US.top1, value: '$37.5K', label: 'TOP 1%', color: C.band99 },
        ]}
        brace={leftOn ? {
          v0: greenFrom, v1: active / US.cap, value: money(Math.round(left), '$'),
          label: 'LEFT', color: C.surplus, draw: braceDraw,
        } : undefined}
      />

      {taxOn && taxTop !== undefined ? (
        <div style={{
          position: 'absolute', left: 1052, width: 300,
          top: yAt((US.cost / US.cap + taxTop) / 2, vHi) - 11,
          opacity: fade(f, cue('us.left.tax') - 26, undefined, 16),
        }}>
          <Txt size={T.micro} color={C.tax} weight={700} track={2.4} align="right">FEDERAL + PAYROLL TAX</Txt>
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: 84, top: 330, width: 620, opacity: fade(f, cue('us.cost') - 6, cue('us.left.t10') - 44, 16) }}>
        <Txt size={T.micro} color={C.dim} weight={600} track={1.4} lh={1.4}>
          2026 estimate · one person, 1BR outside the centre
        </Txt>
      </div>
    </div>
  );
};
