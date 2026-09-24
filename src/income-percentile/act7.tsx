// Movement seven: the two figures the film has been building towards, back in
// the drawing they were first made in.
//
// Nothing new is introduced and nothing is dimmed on arrival. The same four
// bars return in the same order — income above cost, America above India — all
// four at full strength, and the accent moves to whichever figure the narrator
// is naming.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, PAYOFF, FOLD } from './tokens';
import { Txt, Odometer } from './kit';
import { PayBar, PAY, ROW, rupees } from './priceb';
import { cue, cueIn, beat, lead, beatEnd, onWord, spoken, onSaid } from './state';
import { pr, fade, accent, clamp01, settle, EASE } from './anim';

export const ACT7_START = lead(61, 26) + 4;
export const ACT7_END = cue('back.meter') + 4;

const MAX = PAYOFF.usIncome;

/** The two multiples, counted out on the same drum the bars use, each landing
 *  on its own word and settling with a scale accent. */
const Fold: React.FC<{ f: number; at: number; n: number; color: string; label: string; dur?: number }> =
  ({ f, at, n, color, label, dur = 26 }) => {
    const d = pr(f, at - dur, dur, EASE.smooth);
    const dP = pr(f - 1, at - dur, dur, EASE.smooth);
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, opacity: clamp01(d * 4),
        transform: `scale(${settle(f, at)})`, transformOrigin: 'left center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Odometer value={n * d} prev={n * dP} size={64} step={1} color={color} />
          <Txt size={64} color={color} weight={800} lh={1}>×</Txt>
        </div>
        <Txt size={T.body} color={C.muted} weight={600} lh={1}>{label}</Txt>
      </div>
    );
  };

export const ActReturn: React.FC = () => {
  const f = useCurrentFrame();

  const enter = pr(f, ACT7_START, 26, EASE.smooth);

  /* The accent follows the sentence and nothing else, so each row lights only
     while it is the one being spoken about and both are dark in between. In the
     recording the basket and the wage are named inside a single sentence —
     "while the urban cost basket is about 6 times cheaper in India, the median
     Indian wage is disproportionately lower…" — so the cost accent has to let
     go on the words that turn to wages rather than at the end of the line, or
     both rows sit lit together for four seconds. The wage accent then carries
     across into "About 31 times lower", which finishes that same thought.
     The fractions, once given, stay: they are content. */
  const hiCost = Math.max(
    accent(f, onSaid('back.basket'), cueIn('back.wage') - 8),
    accent(f, onSaid('back.sixfold'), cue('back.31fold') - 20),
  );
  const hiWage = Math.max(
    accent(f, onSaid('back.wage'), beatEnd(63) + 6),
    accent(f, onSaid('back.31fold'), beatEnd(64) + 8),
  );
  const noteCost = fade(f, cueIn('back.6x'), undefined, 14);
  /* on "thirty-one times", not after it — keyed to the end of the phrase the
     note only became legible six frames past the words */
  const noteWage = fade(f, cueIn('back.31x'), undefined, 14);
  const fell = pr(f, ...onWord('back.sixfold'), EASE.move);
  /* Act 8 only reaches full strength 28 frames after it mounts, so throwing act
     7 clear at -58 left the frame all but empty across "That's the gap you're
     seeing on the meter". The two now genuinely cross. */
  const exit = pr(f, cue('back.meter') - 40, 20, EASE.toss);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateY(${(1 - enter) * -600 + exit * -1200}px)`, opacity: enter,
    }}>
      <div style={{ position: 'absolute', left: PAY.label, top: 108, width: 1400, opacity: enter }}>
        <Txt size={T.micro} color={C.ink} weight={700} track={2.8}>
          THE TWO NUMBERS WE STARTED WITH
        </Txt>
      </div>

      <PayBar y={ROW.a} label="USA INCOME" country="us" icon="wage"
        value={PAYOFF.usIncome} max={MAX} color={C.wage} draw={1} roll={false} show={enter} />
      <PayBar y={ROW.b} label="USA COST" country="us" icon="basket"
        value={PAYOFF.usCost} max={MAX} color={C.cost} draw={1} roll={false} show={enter} />

      <div style={{
        position: 'absolute', left: PAY.label, top: ROW.rule,
        width: (PAY.x + PAY.w + 300 - PAY.label) * clamp01(enter * 1.4 - 0.4),
        height: 1, background: C.hair,
      }} />

      <PayBar y={ROW.c} label="INDIA INCOME" country="in" icon="wage"
        value={PAYOFF.inIncome} max={MAX} color={C.wage} draw={1} roll={false} show={enter}
        hi={hiWage}
        note={`≈ 1/${FOLD.wage} OF ${rupees(PAYOFF.usIncome)}`} noteDraw={noteWage} />
      <PayBar y={ROW.d} label="INDIA COST" country="in" icon="basket"
        value={PAYOFF.inCost} max={MAX} color={C.cost} draw={1} roll={false} show={enter}
        hi={hiCost}
        note={`≈ 1/${FOLD.cost} OF ${rupees(PAYOFF.usCost)}`} noteDraw={noteCost} />

      {/* the sentence the whole film reduces to, counted out rather than typed */}
      <div style={{ position: 'absolute', left: PAY.label, top: ROW.cap, display: 'flex', gap: 76 }}>
        {/* each counter runs for exactly as long as its figure is spoken — "31"
            used to sit still through "thirty-one-" and hurry through "-fold" */}
        <Fold f={f} at={cue('back.sixfold')} n={FOLD.cost} color={C.cost} label="lower prices"
          dur={spoken('back.sixfold')} />
        <Fold f={f} at={cue('back.31fold')} n={FOLD.wage} color={C.wage} label="lower wages"
          dur={spoken('back.31fold')} />
      </div>

      <div style={{ position: 'absolute', left: PAY.label, top: ROW.cap + 96, width: 1700, opacity: clamp01(fell * 1.3 - 0.3) }}>
        <Txt size={T.body} color={C.ink} weight={600} lh={1.4}>
          The income bar is shorter than the cost bar. That is the gap on the meter.
        </Txt>
      </div>
    </div>
  );
};
