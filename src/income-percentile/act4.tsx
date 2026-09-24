// Movement four: the two completed systems side by side.
//
// Nothing here is built and nothing here is thrown away.
//
// The film's world is one horizontal strip — the USA panel, and India to its
// right. Movement two held the USA; movement three slid that strip 2,000px
// left, which brought India to the middle of the screen and parked the USA
// meter, still whole, at screen x −600. This frame is that strip pulled back
// far enough to hold both panels at once. India therefore barely moves: it is
// the same object movement three finished with, picked up on the very next
// frame, narrowed and opened to its true ceiling on the way to its column. The
// USA meter is not introduced — it walks back in through the edge it went out
// by, from the exact coordinate it was left at, at the width it was left at.
//
// It used to arrive from x +2230, off the right, an edge it had never been
// near, while India was tossed off the top and rebuilt where it had stood.
//
// Every marker is computed from the *live* geometry, so a label can never
// float free of the stack it belongs to while the stack is still moving.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, IN, US, METER, zonesOf } from './tokens';
import { Txt, Chip, Meter, MeterMarker, Flag, Hatch, yAt } from './kit';
import { WriteOn, WriteLayer } from './writeon';
import { beat, lead, cue } from './state';
import { pr, fade, clamp01, lerp, EASE } from './anim';
import { money } from './fmt';

/** The frame the meter changes hands — the frame "In America" begins.
 *  Written as beat(20) rather than imported from act 3 so the sync gate can
 *  resolve it; it must equal IN_HANDOVER there, and the seam check fails if the
 *  two ever drift apart. */
export const ACT4_START = beat(20);
export const ACT4_END = lead(23, 20) + 12;   // act 5 is already drawn beneath by then

/* The destination layout: both stacks at true scale, markers in one lane to the
   right of each — the same construction and the same side as everywhere else.
   The USA takes the left column because that is the side it comes back in on,
   and the sentence agrees: "In America… whereas in India…". */
const G = {
  base: 980, band: 820, w: 150,
  us: { x: 620, lane: 856 },
  in: { x: 1330, lane: 1566 },
};
/* Where movement three left the USA panel, in screen coordinates. */
const PARK = 2000;
const US_FROM = METER.x - PARK;              // −600
const US_FROM_LANE = METER.markerX - PARK;   // −332

/** The interval the narration is pointing at, drawn hard against the stack.
 *  It carries no text: the sentence being spoken is the label. */
const StackMark: React.FC<{ v0: number; v1: number; x: number; color: string; draw: number }> =
  ({ v0, v1, x, color, draw }) => {
    const a = yAt(Math.min(v0, v1), 1, G.base, G.band);
    const b = yAt(Math.max(v0, v1), 1, G.base, G.band);
    return (
      <WriteLayer>
        <WriteOn progress={draw} color={color} strokeWidth={5}
          d={`M ${x + 15} ${a} L ${x} ${a} L ${x} ${b} L ${x + 15} ${b}`} />
      </WriteLayer>
    );
  };

export const ActCompare: React.FC = () => {
  const f = useCurrentFrame();
  /* The USA crosses most of the frame, and an ease-out alone starts a travel
     that long with a jerk. This one is still at both ends. */
  const t = pr(f, ACT4_START, 30, EASE.smooth);
  const out = pr(f, lead(23, 20), 12, EASE.toss);       // thrown clear before the price bar draws
  /* the frame is read out loud, one side at a time: coral under the median on
     one meter, coral over the top 10% on the other */
  const readUS = pr(f, cue('q.us') - 26, 24, EASE.move);
  const readIN = pr(f, cue('q.in') - 26, 24, EASE.move);
  const ask = pr(f, lead(22, 16), 22, EASE.move);

  /* India morphs out of movement three's geometry; every consumer reads these */
  const inGeo = {
    stackX: lerp(METER.x, G.in.x, t),
    stackW: lerp(METER.w, G.w, t),
    base: lerp(METER.base, G.base, t),
    band: lerp(METER.band, G.band, t),
    vHi: lerp(0.85, 1, t),
    x: lerp(METER.markerX, G.in.lane, t),
  };
  /* The USA returns as the object it was, at the width it was, and narrows into
     its column as it arrives — the same change India is making beside it. */
  const usGeo = {
    stackX: lerp(US_FROM, G.us.x, t),
    stackW: lerp(METER.w, G.w, t),
    base: lerp(METER.base, G.base, t),
    band: lerp(METER.band, G.band, t),
    vHi: 1,
    x: lerp(US_FROM_LANE, G.us.lane, t),
  };

  /* Labels India already has on screen do not blink out and back: they are
     carried, and only shrink into the comparison's smaller type. Only ₹32K is
     new — movement three hid it under the cost floor — and it draws itself in
     as the frame opens out and makes room for it. */
  const inSize = lerp(34, 28, t);
  const costSize = lerp(30, 28, t);
  const t10Draw = pr(f, ACT4_START + 10, 20, EASE.move);
  /* Movement three anchors the cost label on its rule; the comparison hangs it
     above so ₹32K can sit under it. Swapped mid-travel, while everything moves. */
  const costAnchor = t < 0.35 ? 'middle' : 'above';
  /* Movement three's cost boundary is redundant once the two are side by side —
     the hatching and the marker both say it — so it dissolves as the meter moves */
  const ruleOp = 1 - clamp01(t * 3);
  /* The left column is the USA's flight path, and a caption written there while
     a meter is still sweeping over it is a caption behind a moving object. */
  const clearAt = ACT4_START + 25;
  const eyebrow = pr(f, clearAt, 16, EASE.move);
  /* The USA returns as a stack, and the frame names its levels once the stack
     is actually in the frame. Its marker lane sits to its right, so a lane
     drawn on departure would send four money labels across the screen ahead of
     the thing they label. +11 is the frame its leading edge crosses in. */
  const usDraw = pr(f, ACT4_START + 11, 18, EASE.move);

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${out * -1200}px)` }}>
      <div style={{ position: 'absolute', left: 80, top: 268, width: 430, opacity: eyebrow }}>
        <Txt size={T.micro} color={C.ink} weight={700} track={2.6} lh={1.5}>
          THE SAME LIFE, AGAINST EACH COUNTRY&apos;S OWN INCOME LADDER
        </Txt>
      </div>

      {/* ------------------------------------------------------------ US -- */}
      <Chip x={usGeo.stackX} y={112} text="USA" op={usDraw} draw={usDraw} />
      <Meter x={usGeo.stackX} w={usGeo.stackW} base={usGeo.base} band={usGeo.band} vHi={1}
        zones={zonesOf(US)} active={1}
        hatch={[{ from: 0, to: US.cost / US.cap, kind: 'cost' } as Hatch]} />
      <Flag country="us" x={usGeo.stackX + usGeo.stackW / 2 - 32} y={usGeo.base + 26} op={usDraw} />
      <MeterMarker {...usGeo} v={US.median / US.cap} size={inSize} anchor="above"
        value="$4.4K" label="MEDIAN" color={C.band50} draw={usDraw} />
      <MeterMarker {...usGeo} v={US.cost / US.cap} size={costSize} anchor="below"
        value={money(US.cost, '$')} label="COST OF LIVING" color={C.cost} draw={usDraw} />
      <MeterMarker {...usGeo} v={US.top10 / US.cap} size={inSize}
        value="$12.9K" label="TOP 10%" color={C.band90} draw={usDraw} />
      <MeterMarker {...usGeo} v={US.top1 / US.cap} size={inSize}
        value="$37.5K" label="TOP 1%" color={C.band99} draw={usDraw} />

      {/* ---------------------------------------------------------- India -- */}
      {/* the chip is India's name, not this scene's: it travels from the corner
          it has held since movement three to sit over the stack it names */}
      <Chip x={lerp(80, G.in.x, t)} y={lerp(110, 112, t)} text="INDIA" />
      <Meter x={inGeo.stackX} w={inGeo.stackW} base={inGeo.base} band={inGeo.band} vHi={inGeo.vHi}
        zones={zonesOf(IN)} active={1}
        hatch={[{ from: 0, to: IN.cost / IN.cap, kind: 'cost' } as Hatch]} />
      <Flag country="in" x={inGeo.stackX + inGeo.stackW / 2 - 32} y={inGeo.base + 26} />
      {ruleOp > 0 ? (
        <div style={{
          position: 'absolute', left: inGeo.stackX - 8, width: inGeo.stackW + 16,
          top: yAt(IN.cost / IN.cap, inGeo.vHi, inGeo.base, inGeo.band) - 1.5, height: 3,
          borderRadius: 2, background: C.cost, opacity: ruleOp,
        }} />
      ) : null}
      <MeterMarker {...inGeo} v={IN.median / IN.cap} size={inSize}
        value="₹12K" label="MEDIAN" color={C.band50} />
      <MeterMarker {...inGeo} v={IN.top10 / IN.cap} size={28} anchor="below"
        value="₹32K" label="TOP 10%" color={C.band90} draw={t10Draw} />
      <MeterMarker {...inGeo} v={IN.cost / IN.cap} size={costSize} anchor={costAnchor}
        value={money(IN.cost, '₹')} label="COST OF LIVING" color={C.cost} />
      <MeterMarker {...inGeo} v={IN.top1 / IN.cap} size={inSize}
        value="₹75K" label="TOP 1%" color={C.band99} />

      {/* what each picture says, marked on the picture itself */}
      <StackMark v0={US.cost / US.cap} v1={US.median / US.cap} x={G.us.x - 26}
        color={C.surplus} draw={readUS} />
      <StackMark v0={IN.top10 / IN.cap} v1={IN.cost / IN.cap} x={G.in.x - 26}
        color={C.cost} draw={readIN} />

      {/* the question lives in the left column, clear of both stacks */}
      <div style={{ position: 'absolute', left: 80, top: 380, width: 420, opacity: ask }}>
        <Txt size={T.h1} color={C.ink} weight={800} lh={1.14}>So why does this gap exist?</Txt>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 960, width: 420, opacity: fade(f, clearAt + 18, cue('q.why') - 30, 16) }}>
        <Txt size={T.micro} color={C.dim} weight={600} track={1.5} lh={1.5}>
          Each meter is at its own full ceiling — $50,000 and ₹1,00,000 a month.
        </Txt>
      </div>
    </div>
  );
};
