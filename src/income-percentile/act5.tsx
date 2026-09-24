// Movement five: what a price is made of, what it actually costs, and why the
// wage beside it is a different story.
//
// Three drawings, one language. First a table: five things you spend on, each
// with a qualitative split of what its price contains and, beside it, the two
// real prices — America above, India below, every time. Then those five things
// are physically tipped into two baskets, and the baskets are priced. Then the
// same construction, once more, for what a worker is paid against what a worker
// produces.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, PRICES, PAYOFF, FOLD, RATIO } from './tokens';
import { Txt } from './kit';
import { Icon, IconName } from './icons';
import {
  TAB, PAY, ROW, PROW, CompBar, PricePair, RowHead, PayBar, BasketFlight, flyT0, rupees,
} from './priceb';
import { cue, beat, lead, beatEnd, onWord, onSaid } from './state';
import { pr, fade, accent, clamp01, lerp, EASE } from './anim';

export const ACT5_START = lead(23, 20);
export const ACT5_END = lead(42, 34) + 28;

type Mix = [number, number];
const NEUTRAL: Mix = [0.5, 0.5];

/** Each row's composition is a single interpolated value, so the boundary
 *  between local and global slides rather than cutting. */
const mixAt = (f: number, at: number, to: Mix, dur = 26): Mix => {
  const t = pr(f, at - dur, dur, EASE.smooth);
  return NEUTRAL.map((v, i) => lerp(v, to[i], t)) as Mix;
};

const MAX = PAYOFF.usIncome;
const OMAX = PAYOFF.usOutput;

/* Where the five icons start from, and the two mouths they end in. Both are
   fixed points in the frame, so the flight is the same arc every render. */
const ORIGINS = PRICES.map((r, i) => ({
  icon: r.icon as IconName, x: TAB.icon + 23, y: TAB.top + i * TAB.pitch + 21,
}));
const MOUTH = PAY.x + 6 + PAY.icon / 2;
const TARGETS = [
  { x: MOUTH, y: ROW.b + PAY.h / 2 },
  { x: MOUTH, y: ROW.d + PAY.h / 2 },
];

export const ActPrices: React.FC = () => {
  const f = useCurrentFrame();

  const enter = pr(f, ACT5_START, 22, EASE.smooth);
  const exit = pr(f, lead(42, 34), 20, EASE.toss);

  /* ---------------------------------------------------------- the table -- */
  const head = pr(f, ACT5_START + 2, 22, EASE.move);
  const rowCue = ['apart.hair', 'apart.phone', 'apart.food', 'apart.tran', 'apart.rent'];
  const rowIn = rowCue.map((c) => pr(f, cue(c) - 14, 20, EASE.move));
  const legend = pr(f, ...onWord('apart.local'), EASE.move);
  /* The list exists from the moment this scene does — it draws while act 4 is
     still leaving, so the handover never shows a bare frame — and each row
     lights on its own word after that. */
  const frameIn = pr(f, ACT5_START + 6, 26, EASE.move);

  /* when each row's split resolves, and when its two prices are drawn */
  /* Each row's composition resolves on the words that justify it, not on the
     word that merely introduces the object: the haircut settles as "almost
     entirely local labour" finishes, and the phone as "come through global
     supply chains" does — that clause is the whole reason its bar is mostly
     red, and it used to arrive nearly seven seconds after the bar had. */
  /* Each bar leaves neutral on the word that names the thing and comes to rest
     on the words that justify its split, so the composition is *arriving* while
     the argument for it is being made. Landing it on the justification alone
     was worse than landing it early: the phone's bar then sat at a flat 50/50
     for eleven seconds — the film asserting a split it had not earned — and
     resolved in one move after the explanation was over. */
  /* "A phone sits much closer to the other extreme" IS the claim about where
     the phone's price sits — "because the chips…" is only the reason for it. A
     bar that waits for the reason spends the claim showing a composition that
     contradicts the sentence being spoken. Each row therefore resolves on the
     words that state its position, and the justification that follows confirms
     what the viewer is already looking at. */
  const SPLIT = [cue('hair.extreme'), cue('phone.extreme'), cue('mid.food') + 6, cue('mid.tran') + 6, cue('mid.rent') + 6];
  /* The filled bar arrives on the words that justify its split, over a move
     long enough to read. Drifting it there across the whole argument instead
     was worse than either extreme: too slow to register as motion, yet the row
     spent the time asserting a 50/50 composition it had not earned. The empty
     outline carries the row from the moment it is named. */
  const compIn = SPLIT.map((sp) => pr(f, sp - 40, 40, EASE.smooth));
  const PRICED = [cue('hair.21x') - 24, cue('phone.same') - 24, cue('mid.food') + 52, cue('mid.tran') + 52, cue('mid.rent') + 62];
  const land = pr(f, ...onWord('mid.land'), EASE.move);
  const midOn = pr(f, cue('mid.between') - 20, 24, EASE.move);

  /* ------------------------------------------------ tipping them in ----- */
  const clear = cue('basket.together') - 18;      // the table leaves
  const FLY = cue('basket.together') + 10;        // the five icons follow it
  const tableOut = pr(f, clear, 20, EASE.toss);
  const payIn = pr(f, clear + 8, 26, EASE.smooth);
  const rowsOn = pr(f, clear + 14, 20, EASE.move);

  /* --------------------------------------------------------- the payoff -- */
  const grow = pr(f, ...onWord('basket.6x'), EASE.smooth);
  const growP = pr(f - 1, ...onWord('basket.6x'), EASE.smooth);
  /* Every accent lands on the word that names its figure and is gone by the
     time the narration is naming something else — see `accent`. The notes are
     not accents: once a figure has been given its fraction it keeps it. */
  const hiIN = accent(f, onSaid('basket.inIndia'), cue('basket.inUS') - 18);
  /* "…six times less in India than in America, which may sound good…" is one
     unbroken sentence in the recording, so the beat boundary is no longer a
     place the voice stops: the accent lets go a beat after the word instead. */
  const hiUS = accent(f, onSaid('basket.inUS'), cue('basket.inUS') + 20);
  const noteIN = fade(f, cue('basket.inIndia') - 12, undefined, 16);
  const usInc = pr(f, ...onWord('basket.if6'), EASE.smooth);
  const usIncP = pr(f - 1, ...onWord('basket.if6'), EASE.smooth);
  const inInc = pr(f, ...onWord('basket.31x'), EASE.smooth);
  const inIncP = pr(f - 1, ...onWord('basket.31x'), EASE.smooth);
  const hiWage = accent(f, onSaid('basket.31x'), beat(37) - 4);
  const noteWage = fade(f, cue('basket.31x') - 8, undefined, 16);
  /* beat 36 names prices first, then wages: the accent follows the sentence */
  const hiPrices = accent(f, onSaid('basket.prices'), cue('basket.dispro') - 22);
  const hiDispro = accent(f, onSaid('basket.dispro'), beatEnd(37) + 8);
  const dispro = pr(f, ...onWord('basket.dispro'), EASE.move);
  const payOut = pr(f, lead(38, 26), 22, EASE.toss);

  /* ------------------------------------------------- income against output */
  const prodIn = pr(f, lead(38, 26) + 6, 26, EASE.smooth);
  const ask = pr(f, lead(38, 26) + 16, 24, EASE.move);
  const answer = pr(f, cue('prod.word') - 16, 24, EASE.move);
  /* the question and its one-word answer hold the frame on their own for two
     beats, so they are a title card until the bars arrive and take it back */
  const inc = pr(f, lead(40, 14), 24, EASE.move);
  /* The bars are named at the start of the sentence and their figure at the end
     of it, so they grow across the whole clause rather than waiting five
     seconds and then filling in one move. */
  const out = pr(f, lead(40, 14), cue('prod.27x') - lead(40, 14), EASE.smooth);
  const outP = pr(f - 1, lead(40, 14), cue('prod.27x') - lead(40, 14), EASE.smooth);
  const noteOut = fade(f, cue('prod.27x') - 10, undefined, 16);
  const hiOut = accent(f, onSaid('prod.27x'), cue('prod.27x') + 46);
  /* the sentence hands over mid-way: "what employers can sustainably PAY is
     constrained by how much VALUE workers can produce" — so does the pointer */
  const hiPay = accent(f, onSaid('prod.pay'), cue('prod.pay') + 8);
  /* Lit across "produce" itself and released as the word ends — act 5 begins
     translating off two frames later, and an accent still burning then points
     at a row already leaving the frame. The clamp this replaced put `until`
     *before* `on`, so the highlight never reached full strength at all. */
  const hiProd = accent(f, onSaid('prod.value'), cue('prod.cap') + 2);

  const payLive = payIn > 0.001 && payOut < 0.999;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateY(${(1 - enter) * 180 + exit * -1200}px)`, opacity: enter,
    }}>

      {/* ================================================== the item table == */}
      {tableOut < 0.999 ? (
        <div style={{ transform: `translateY(${tableOut * -1200}px)` }}>
          <div style={{ position: 'absolute', left: 88, top: 108, width: 1200, opacity: head }}>
            <Txt size={T.micro} color={C.ink} weight={700} track={2.8}>
              WHAT A PRICE IS MADE OF · AND WHAT IT ACTUALLY COSTS
            </Txt>
          </div>

          {/* the two column heads, named on the words that name them */}
          <div style={{ position: 'absolute', left: TAB.comp, top: 170, width: TAB.compW, opacity: legend }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: pr(f, ...onWord('apart.local')) }}>
                <div style={{ width: 15, height: 15, borderRadius: 3, background: C.priceLocal }} />
                <Txt size={T.micro} color={C.priceLocal} weight={700} track={1.8}>LOCAL INPUTS</Txt>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: pr(f, ...onWord('apart.global')) }}>
                <div style={{ width: 15, height: 15, borderRadius: 3, background: C.priceWorld }} />
                <Txt size={T.micro} color={C.priceWorld} weight={700} track={1.8}>GLOBAL INPUTS</Txt>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: TAB.price, top: 176, width: 500, opacity: pr(f, PRICED[0] - 40, 22, EASE.move) }}>
            <Txt size={T.micro} color={C.muted} weight={700} track={2.4}>WHAT IT COSTS · PER MONTH, IN RUPEES</Txt>
          </div>

          {PRICES.map((row, i) => {
            const y = TAB.top + i * TAB.pitch;
            const dim = row.key === 'hair' || row.key === 'phone' ? midOn * (1 - pr(f, PRICED[2] - 40, 20)) : 0;
            return (
              <React.Fragment key={row.key}>
                <RowHead y={y} row={row} draw={Math.max(rowIn[i], frameIn)}
                  dim={Math.min(1, dim + (1 - rowIn[i]) * 0.6)}
                  hideIcon={f >= clear} />
                <CompBar y={y} mix={mixAt(f, SPLIT[i], row.mix)} draw={compIn[i]} frame={frameIn} />
                {pr(f, PRICED[i] - 30, 30, EASE.smooth) > 0.001 ? (
                  <PricePair y={y - 6} row={row}
                    draw={pr(f, PRICED[i] - 30, 30, EASE.smooth)}
                    drawPrev={pr(f - 1, PRICED[i] - 30, 30, EASE.smooth)} />
                ) : null}
              </React.Fragment>
            );
          })}

          {/* land is not a third colour: it is named where it actually sits,
              inside the local half of the one price that contains it */}
          <div style={{
            position: 'absolute', left: TAB.comp + TAB.compW * PRICES[4].mix[0] * 0.5 - 1,
            top: TAB.top + 4 * TAB.pitch + 36, width: 2, height: 10 * land,
            background: C.priceLocal, opacity: land,
          }} />
          <div style={{
            position: 'absolute', left: TAB.comp, top: TAB.top + 4 * TAB.pitch + 52,
            width: TAB.compW + 60, opacity: land,
          }}>
            <Txt size={T.micro} color={C.priceLocal} weight={700} track={1.6}>
              INCLUDING WELL-LOCATED LAND
            </Txt>
          </div>

          <div style={{ position: 'absolute', left: 88, top: 1006, width: 1760, opacity: clamp01(rowIn[4] * 1.4 - 0.4) }}>
            <Txt size={T.micro} color={C.dim} weight={600} track={1.4}>
              Each pair is scaled to its own American price. Converted at ₹85 per US dollar · the composition split is indicative, not measured.
            </Txt>
          </div>
        </div>
      ) : null}

      {/* The table slides out from under its own icons: the five things stay
          exactly where they were, take back full colour — they have been
          sitting dimmed in the table and have to be legible in flight — and
          wait for their turn to be tipped in. */}
      {PRICES.map((row, i) => {
        const t0 = flyT0(FLY, i, 0);
        if (f < clear || f >= t0) return null;
        const warm = pr(f, clear, 20, EASE.move);
        return (
          <div key={`wait-${row.key}`} style={{
            position: 'absolute', left: ORIGINS[i].x - 23, top: ORIGINS[i].y - 23,
            transform: `scale(${lerp(1, 1.1, warm)})`, transformOrigin: 'center center',
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - warm }}>
              <Icon name={row.icon as IconName} size={46} color={C.ink} />
            </div>
            <div style={{ opacity: warm }}>
              <Icon name={row.icon as IconName} size={46} color={C.cost} sw={8} />
            </div>
          </div>
        );
      })}
      <BasketFlight f={f} start={FLY} from={ORIGINS} to={TARGETS} />

      {/* ===================================== the basket, and the wage ===== */}
      {payLive ? (
        <div style={{ transform: `translateY(${(1 - payIn) * 620 + payOut * -1200}px)` }}>
          <div style={{ position: 'absolute', left: PAY.label, top: 108, width: 1400, opacity: payIn }}>
            <Txt size={T.micro} color={C.ink} weight={700} track={2.8}>
              ONE SCALE · ONE CURRENCY · PER MONTH
            </Txt>
          </div>

          <PayBar y={ROW.a} label="USA INCOME" country="us" icon="wage"
            value={PAYOFF.usIncome} max={MAX} color={C.wage} draw={usInc} drawPrev={usIncP}
            show={Math.max(rowsOn * 0.34, clamp01(usInc * 8))} />
          <PayBar y={ROW.b} label="USA COST" country="us" icon="basket"
            value={PAYOFF.usCost} max={MAX} color={C.cost} draw={grow} drawPrev={growP}
            show={rowsOn} hi={hiUS} />

          <div style={{
            position: 'absolute', left: PAY.label, top: ROW.rule,
            width: (PAY.x + PAY.w + 300 - PAY.label) * clamp01(payIn * 1.4 - 0.4),
            height: 1, background: C.hair,
          }} />

          <PayBar y={ROW.c} label="INDIA INCOME" country="in" icon="wage"
            value={PAYOFF.inIncome} max={MAX} color={C.wage} draw={inInc} drawPrev={inIncP}
            show={Math.max(rowsOn * 0.34, clamp01(inInc * 8))} hi={Math.max(hiWage, hiDispro)}
            note={`≈ 1/${FOLD.wage} OF ${rupees(PAYOFF.usIncome)}`} noteDraw={noteWage} />
          <PayBar y={ROW.d} label="INDIA COST" country="in" icon="basket"
            value={PAYOFF.inCost} max={MAX} color={C.cost} draw={grow} drawPrev={growP}
            show={rowsOn} hi={Math.max(hiIN, hiPrices)}
            note={`≈ 1/${FOLD.cost} OF ${rupees(PAYOFF.usCost)}`} noteDraw={noteIN} />

          {/* while only half the table is filled, it says what it is */}
          <div style={{
            position: 'absolute', left: PAY.label, top: ROW.cap, width: 1700,
            opacity: clamp01(rowsOn * 1.4 - 0.4) * (1 - clamp01(usInc * 3)),
          }}>
            <Txt size={T.body} color={C.muted} weight={600} lh={1.4}>
              The same basket of expenses, priced in each country.
            </Txt>
          </div>
          <div style={{ position: 'absolute', left: PAY.label, top: ROW.cap, width: 1700, opacity: dispro }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <Txt size={T.h2} color={C.cost} weight={800} tabular>{FOLD.cost}×</Txt>
              <Txt size={T.body} color={C.muted} weight={600}>lower prices, but</Txt>
              <Txt size={T.h2} color={C.wage} weight={800} tabular>{FOLD.wage}×</Txt>
              <Txt size={T.body} color={C.muted} weight={600}>lower wages.</Txt>
            </div>
          </div>
        </div>
      ) : null}

      {/* ======================================== income against output ===== */}
      {prodIn > 0.001 ? (
        <div style={{ transform: `translateY(${(1 - prodIn) * 620}px)` }}>
          <div style={{
            position: 'absolute', left: PAY.label, top: lerp(292, 96, inc), width: 1560,
            transform: `scale(${lerp(1.4, 1, inc)})`, transformOrigin: 'left top',
          }}>
            <div style={{ opacity: ask }}>
              <Txt size={T.h2} color={C.muted} weight={700} lh={1.16}>
                So why are Indian wages so much lower?
              </Txt>
            </div>
            <div style={{
              marginTop: 26, display: 'flex', alignItems: 'center', gap: 18, opacity: answer,
            }}>
              <div style={{ width: 34 * answer, height: 4, borderRadius: 2, background: C.wage }} />
              <Txt size={64} color={C.ink} weight={800} lh={1.1}>Productivity.</Txt>
            </div>
          </div>

          <PayBar y={PROW.a} label="USA INCOME" country="us" icon="wage"
            value={PAYOFF.usIncome} max={MAX} color={C.wage} draw={1} roll={false}
            show={inc} hi={hiPay} mute={Math.max(hiOut, hiProd)} />
          <PayBar y={PROW.b} label="USA OUTPUT" country="us" icon="machine"
            value={PAYOFF.usOutput} max={OMAX} color={C.tax} draw={out} drawPrev={outP} step={10}
            show={Math.max(inc * 0.34, clamp01(out * 8))}
            hi={Math.max(hiOut, hiProd)} mute={hiPay} />

          <div style={{
            position: 'absolute', left: PAY.label, top: PROW.rule,
            width: (PAY.x + PAY.w + 300 - PAY.label) * clamp01(inc * 1.4 - 0.4),
            height: 1, background: C.hair,
          }} />

          <PayBar y={PROW.c} label="INDIA INCOME" country="in" icon="wage"
            value={PAYOFF.inIncome} max={MAX} color={C.wage} draw={1} roll={false}
            show={inc} hi={hiPay} mute={Math.max(hiOut, hiProd)}
            note={`≈ 1/${FOLD.wage} OF ${rupees(PAYOFF.usIncome)}`} noteDraw={inc} />
          <PayBar y={PROW.d} label="INDIA OUTPUT" country="in" icon="machine"
            value={PAYOFF.inOutput} max={OMAX} color={C.tax} draw={out} drawPrev={outP} step={10}
            show={Math.max(inc * 0.34, clamp01(out * 8))}
            hi={Math.max(hiOut, hiProd)} mute={hiPay}
            note={`≈ 1/${RATIO.output} OF ${rupees(PAYOFF.usOutput)}`} noteDraw={noteOut} />

          <div style={{ position: 'absolute', left: PAY.label, top: PROW.cap, width: 1700, opacity: fade(f, lead(41, 8), undefined, 18) }}>
            <Txt size={T.body} color={C.ink} weight={600} lh={1.4}>
              Over the long run, what a worker is paid is held down by what a worker produces.
            </Txt>
          </div>
          <div style={{ position: 'absolute', left: PAY.label, top: 1012, width: 1700, opacity: clamp01(out * 1.4 - 0.4) }}>
            <Txt size={T.micro} color={C.dim} weight={600} track={1.4}>
              Income is the median monthly wage; output is GDP per employed worker per year. Each pair is scaled to its own American figure.
            </Txt>
          </div>
        </div>
      ) : null}
    </div>
  );
};
