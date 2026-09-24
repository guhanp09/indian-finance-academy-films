// Movement three: the identical cost analysis run against India's meter.
// Same apparatus, same icons carried in, same coral hatching, same braces.
// Only where the numbers land differs — which is the entire point.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, IN, zonesOf } from './tokens';
import { yAt, Txt } from './kit';
import { CostScene } from './cost';
import {
  cue, beat, lead, staged, stagedPrev, inV, IN_COST, IN_ACTIVE, IN_SHORT, IN_TRAVEL, IN_VIEW, BASKET_SHOW, rollStart, IN_LEFT,
} from './state';
import { pr, fade, EASE } from './anim';
import { money } from './fmt';

export const ACT3_START = lead(16, 18);

/* The handover to the comparison.
 *
 * The India meter is not a picture of act 3 — it is an object the film has
 * built, and act 4 goes on using it. It used to be thrown 1,200px off the top
 * of the frame and faded out, leaving one frame of bare backdrop before an
 * identical meter appeared at the coordinates the old one had just left from:
 * the film making the viewer watch an object leave and come back.
 *
 * So act 3 no longer throws anything away. Across the pause after "…roughly
 * ₹39,600 left" it dissolves only its working-out — the running figure, the
 * expense column and the green brace — and leaves the stack, its flag and its
 * three named levels standing exactly where they are. Act 4 mounts on
 * IN_HANDOVER reproducing that frame note for note and carries it from there;
 * the measured difference across the seam is 0.3 of 255. */
export const IN_HANDOVER = beat(20);          // the frame act 4 takes the meter over
/* Beat 20 is "Only at the top 1% do you have roughly ₹39,600 left." — this
   frame is the only thing that can show it, so it stays until the comparison
   takes it over. There is no overlap to hide a seam any more, because the two
   frames either side of it are the same picture. */
export const ACT3_END = beat(20);

const Z = zonesOf(IN);


export const ActIndiaCost: React.FC = () => {
  const f = useCurrentFrame();

  const vHi = staged(f, IN_VIEW);
  const cost = staged(f, IN_COST);
  const costPrev = stagedPrev(f, IN_COST);
  const active = staged(f, IN_ACTIVE);
  const short = staged(f, IN_SHORT);
  const shortPrev = stagedPrev(f, IN_SHORT);

  /* mounted from the rolls themselves — and on the same offsets the USA uses,
     since this scene is act 2 run again with the other country's numbers */
  const totalOn = f >= rollStart('in.cost');
  const shortOn = f >= rollStart('in.short.med');

  const phase = !shortOn ? 'cost' : f < rollStart('in.short.t10') ? 'med'
    : f < rollStart('in.left.t1') ? 't10' : 't1';
  const heroLand = phase === 'cost' ? cue('in.cost') : phase === 'med' ? cue('in.short.med')
    : phase === 't10' ? cue('in.short.t10') : cue('in.left.t1');
  const heroVal = phase === 'cost' ? cost : phase === 't1' ? staged(f, IN_LEFT) : short;
  const heroPrev = phase === 'cost' ? costPrev : phase === 't1' ? stagedPrev(f, IN_LEFT) : shortPrev;
  const braceDraw = shortOn ? pr(f, cue('in.short.med') - 30, 34, EASE.move) : 0;
  const brace = !shortOn ? undefined
    : phase === 't1'
      /* the label rides the same staged value the hero does, as America's has
         always done — a brace that states a figure the odometer has not reached
         yet is the picture contradicting itself */
      ? { v0: inV(IN.cost), v1: inV(IN.top1), value: money(Math.round(staged(f, IN_LEFT)), '₹'),
          label: 'LEFT', color: C.surplus, draw: braceDraw }
      : {
        v0: active / IN.cap, v1: cost / IN.cap,
        value: money(Math.round(short), '₹'),
        label: 'SHORT', color: C.cost, draw: braceDraw,
      };

  const slideIn = pr(f, ACT3_START, 26, EASE.move);
  /* The scene does not leave — only its working-out does, and it is gone on
     exactly the frame act 4 takes over. `lead(20, 14)` is written out rather
     than named so the sync gate can resolve it: it is the beat-relative anchor
     this dissolve answers to. */
  const clear = pr(f, lead(20, 14), IN_HANDOVER - lead(20, 14), EASE.move);
  const targets = IN_COST.slice(0, 5).map((st) => yAt(st.to / IN.cap, vHi));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateX(${(1 - slideIn) * 2000}px)`,
    }}>
      <CostScene
        f={f} chip="INDIA" country="in" cap={IN.cap} prefix="₹" zones={Z}
        cost={cost} costPrev={costPrev} active={active} provisional={!totalOn}
        vHi={vHi}
        clear={clear}
        basket={{ showAt: IN_TRAVEL.map((t) => t - BASKET_SHOW), travelAt: IN_TRAVEL, targets, country: 'in' }}
        hero={totalOn ? { value: heroVal, prev: heroPrev, color: phase === 't1' ? C.surplus : C.cost, step: 100, land: heroLand } : undefined}
        costMarker={totalOn ? {
          value: money(IN.cost, '₹'), op: fade(f, cue('in.cost') - 30, undefined, 14),
          draw: pr(f, cue('in.cost') - 26, 18, EASE.move),
        } : undefined}
        markers={[
          { v: IN.median, value: '₹12K', label: 'MEDIAN', color: C.band50 },
          // once the frame opens out for the top 1%, ₹32K sits close under the
          // cost floor: it keeps its rule and gives up its label
          { v: IN.top10, value: '₹32K', label: 'TOP 10%', color: C.band90, op: vHi > 0.46 ? 0 : 1 },
          { v: IN.top1, value: '₹75K', label: 'TOP 1%', color: C.band99 },
        ]}
        brace={brace}
      />
      <div style={{ position: 'absolute', left: 84, top: 330, width: 620, opacity: fade(f, cue('in.cost') - 20, cue('in.short.med') - 40, 16) }}>
        <Txt size={T.micro} color={C.dim} weight={600} track={1.4} lh={1.4}>2026 estimate · the same basket, priced in India</Txt>
      </div>
    </div>
  );
};
