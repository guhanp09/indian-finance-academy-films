// Movement six: why an Indian worker produces less, and why the obvious answer
// is the wrong one.
//
// The sector explanation is granted before it is tested. India's workforce ring
// is drawn, then America's beside it, so the viewer sees the composition claim
// at its strongest. Only then is the experiment run — on the same three-row
// chart the answer will have to survive: India today, India after every farm
// worker moves, and America. The size the American bar would have to be for the
// sector answer to work is drawn first, in its own lane, hollow. Then the real
// one grows straight past it.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T, FONT, RATIO, SECTOR_GAP, COMPOSITION, SECTORS } from './tokens';
import { Txt, Chip, Ring, Flag } from './kit';
import { Icon, IconName } from './icons';
import { ProdAxis, ProdBar, CapitalRow, GapBracket, axAt, SAX, PAX } from './productivity';
import { mixHex } from './priceb';
import { cue, cueIn, beat, lead, beatEnd, onWord, onSaid } from './state';
import { pr, fade, accent, clamp01, lerp, EASE } from './anim';

export const ACT6_START = lead(42, 34) + 10;
export const ACT6_END = lead(61, 26) + 24;

const RING = { r: 172, th: 56, cy: 500, in: 560, us: 1320 };

/* The hinge frame. One worker holds the centre; what is said about them
   changes. Both lines are the narrator's own words, so nothing has to be
   translated between what is heard and what is read. */
const HINGE = {
  line1: 286, line2: 690, size: 50,
  /* the worker is one object throughout, so it is held by its centre and its
     size — it grows into the subject of the next sentence, then walks into the
     corner of the frame that enumerates what stands behind it */
  worker: { cx: 960, cy: 505, size: 150 },
  subject: 300,
  /* capTop / capCx are where the caption ends up: on the strip's own caption
     line, and pushed right of the worker's centre so its left edge lands on the
     film's margin — a label centred under a figure that starts at x80 would
     hang off the edge of the grid */
  parked: { cx: 132, cy: 198, size: 104, capTop: 252, capCx: 135, capW: 150 },
};

/** A line of the narration, struck through at its own width. The rule is an
 *  absolutely-positioned child of the inline box, so it can never run past the
 *  words or stop short of them however the type sets. */
const Struck: React.FC<{ text: string; draw: number; op: number; y: number }> =
  ({ text, draw, op, y }) => (
    <div style={{ position: 'absolute', left: 0, top: y, width: '100%', textAlign: 'center', opacity: op }}>
      <span style={{
        display: 'inline-block', position: 'relative',
        fontFamily: FONT, fontSize: HINGE.size, fontWeight: 700, lineHeight: 1.2,
        color: mixHex(C.ink, C.dim, clamp01(draw * 1.6)),
      }}>
        {text}
        <span style={{
          position: 'absolute', left: 0, top: '54%', height: 5, borderRadius: 3,
          width: `${clamp01(draw) * 100}%`, background: C.cost,
        }} />
      </span>
    </div>
  );
const COLORS = SECTORS.map((s) => s.color);

/** One country's workforce. India's agriculture arc is the only one that moves:
 *  it is swept into services rather than swapped, so the experiment is visibly
 *  performed instead of merely reported. */
const WorkforceRing: React.FC<{
  cx: number; chip: string; country: 'in' | 'us';
  shares: readonly number[]; draw: number; move: number; focus: number;
}> = ({ cx, chip, country, shares, draw, move, focus }) => {
  const live = [
    lerp(shares[0], 0.001, move),
    shares[1],
    lerp(shares[2], shares[2] + shares[0], move),
  ];
  const dim = [0, focus * 0.72, focus * 0.72 * (1 - move)];
  const pct = Math.round(lerp(shares[0], 0, move));
  return (
    <>
      <Ring cx={cx} cy={RING.cy} r={RING.r} thickness={RING.th}
        shares={live} colors={COLORS} draw={draw} dim={dim} />
      <div style={{
        position: 'absolute', left: cx - 180, top: RING.cy - 66, width: 360,
        textAlign: 'center', opacity: clamp01((draw - 0.55) / 0.45),
      }}>
        <Txt size={82} color={C.secAgri} weight={800} align="center" tabular>{pct}%</Txt>
        <div style={{ marginTop: 4 }}>
          <Txt size={T.micro} color={C.secAgri} weight={700} track={2.4} align="center">
            IN AGRICULTURE
          </Txt>
        </div>
      </div>
      {/* flag and name are one label, set well clear of the ring so neither
          reads as part of the chart's own geometry */}
      <div style={{
        position: 'absolute', left: cx - 200, top: RING.cy + RING.r + 74, width: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        opacity: clamp01(draw * 2 - 1),
      }}>
        <div style={{ position: 'relative', width: 50, height: 33 }}>
          <Flag country={country} x={0} y={0} w={50} />
        </div>
        <Txt size={T.label} color={C.muted} weight={700} track={6} lh={1}>{chip}</Txt>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------- scene */

export const ActProductivity: React.FC = () => {
  const f = useCurrentFrame();

  const enter = pr(f, ACT6_START, 22, EASE.move);
  const exit = pr(f, lead(61, 26), 20, EASE.toss);

  /* --- the sector explanation, granted at full strength --- */
  /* the question is on screen before act 5 has finished leaving, so the
     handover never shows a bare frame — and it stays: this whole section is
     the answer to it, so nothing dissolves into it later */
  const q = pr(f, ACT6_START - 4, 20, EASE.move);
  /* The ring is drawn and its figure counted from one progress value, so the
     chart can never stand on screen with an empty middle. Bringing the arc in
     early and gating the numeral separately did break the wait, but at the cost
     of a hollow ring — the question card holds the frame instead, which is what
     that beat is: a rhetorical question, asked and left hanging. */
  const ringIn = pr(f, cue('sect.half') - 34, 26, EASE.move);
  const ringUs = pr(f, cue('sect.us') - 30, 26, EASE.move);
  const focus = pr(f, cue('sect.agri') - 20, 22, EASE.move);
  /* The sweep is the experiment being performed, so it runs for as long as the
     sentence that performs it — "you moved every one of those agricultural
     workers into the service industry" — instead of finishing a second in and
     leaving the chart standing still for the rest of the line. */
  const move = pr(f, cueIn('sect.move') - 96, 150, EASE.smooth);
  const ringOut = pr(f, cue('sect.17x') - 52, 18, EASE.toss);

  /* --- and then tested --- */
  const axis = pr(f, cue('sect.17x') - 40, 22, EASE.move);
  const grow = pr(f, ...onWord('sect.17x'), EASE.smooth);
  const growP = pr(f - 1, ...onWord('sect.17x'), EASE.smooth);
  /* the length America would have to be for the sector answer to work */
  const hyp = pr(f, ...onWord('hyp.17'), EASE.smooth);
  const hypP = pr(f - 1, ...onWord('hyp.17'), EASE.smooth);
  const hyp2 = pr(f, ...onWord('hyp.2x'), EASE.smooth);
  const hyp2P = pr(f - 1, ...onWord('hyp.2x'), EASE.smooth);
  /* "No doubt, that's substantial" is a sentence about the bar that has just
     grown, and nothing on screen moved for either of the two beats it sits in */
  const hiSubst = accent(f, onSaid('sect.subst'), beatEnd(47) + 4);
  const blame = accent(f, onSaid('hyp.blame'), beatEnd(48) + 6);
  const need = pr(f, ...onWord('sect.27x'), EASE.smooth);
  const needP = pr(f - 1, ...onWord('sect.27x'), EASE.smooth);
  const hiGap = accent(f, onSaid('sect.27x'), beatEnd(49) + 8);
  const unexplained = pr(f, cue('sect.no') - 24, 28, EASE.move);
  const sectorOut = pr(f, cue('ins.claim') - 26, 20, EASE.toss);

  /* --- the gap that was inside the sectors all along --- */
  const inside = pr(f, cue('ins.claim') - 20, 24, EASE.move);
  const SEC_NAMES = ['ins.34x', 'ins.23x', 'ins.14x'] as const;
  const secCue = SEC_NAMES.map(cue);
  const bar = SEC_NAMES.map((n) => pr(f, ...onWord(n), EASE.smooth));
  const barP = SEC_NAMES.map((n) => pr(f - 1, ...onWord(n), EASE.smooth));
  const secOn = secCue.map((c) => pr(f, c - 40, 22, EASE.move));
  /* Each accent lasts exactly as long as the clause that names it. The three
     figures used to be three beats, one accent ending with each; in the
     recording they are spoken as one sentence — "34 times higher in farming,
     around 23 times higher in industry, and about 14 times higher even in
     services" — so each one now hands over on the word that names the next,
     and only the last waits for the end of the sentence. */
  const secHi = SEC_NAMES.map((n, i) => accent(f, onSaid(n),
    [cueIn('ins.23x') - 6, cueIn('ins.14x') - 6, beatEnd(53) + 4][i]));
  /* the conclusion has to be readable before the frame changes, so it lands
     with the sentence rather than with the sentence's last word */
  const remain = pr(f, lead(54, 8), 26, EASE.move);
  const insideOut = pr(f, lead(55, 34), 26, EASE.toss);

  /* --- the hinge: the half we have ruled out, and the half we have not --- */
  const hinge = pr(f, lead(55, 34) + 4, 28, EASE.smooth);
  /* drawn across "the kind of work people do" as it is said, starting on "the"
     and finishing on "do" — it used to be a 12-frame flick on the last two
     words, which struck out a line the viewer had already finished hearing */
  const strike = pr(f, cueIn('ins.kindwork'),
    cue('ins.kindwork') - cueIn('ins.kindwork'), EASE.smooth);
  const second = pr(f, cue('ins.itsalso') - 8, 34, EASE.smooth);

  /* the worker is held alone for three seconds while the sentence winds up, so
     it is named on the words that name it rather than left as an unlabelled
     figure */
  const named = pr(f, cueIn('cap.amer') + 2, 20, EASE.move);

  /* --- and what is behind each pair of hands --- */
  /* The hinge has said everything it has to say by the end of beat 54, so the
     frame changes on the subject of the next sentence — "American workers" —
     rather than on its first named item four seconds later. The worker then
     holds the empty frame as that subject while the sentence winds up, and
     only takes its corner on "far more", the word the list starts from. */
  /* clamped: "American workers" begins the instant "…to do that work" ends, so
     an 18-frame run-up would clear the hinge while that line is still being said */
  const hand = pr(f, lead(56, 18), 30, EASE.move);
  const park = pr(f, cueIn('cap.farmore') - 20, 30, EASE.move);
  const cap = hand;
  const TOOLS = [
    { n: 'machine' as IconName, l: 'CAPITAL', c: 'cap.word' },
    { n: 'factory' as IconName, l: 'MACHINERY', c: 'cap.mach' },
    { n: 'internet' as IconName, l: 'TECHNOLOGY', c: 'cap.tech' },
    { n: 'transport' as IconName, l: 'INFRASTRUCTURE', c: 'cap.infra' },
    { n: 'wrench' as IconName, l: 'ORGANISATION', c: 'cap.org' },
  ];
  const tool = TOOLS.map((t) => pr(f, cue(t.c) - 16, 20, EASE.move));
  /* The sentence is not "American workers have capital" but "American workers
     have FAR MORE capital", and the row of icons only carried the first half.
     Each arrow lands a beat after the icon it belongs to, so it reads as a
     claim made about that icon rather than as part of its shape. */
  const more = TOOLS.map((t) => pr(f, cue(t.c) - 6, 16, EASE.move));
  /* Each row fills across its own sentence rather than in a 30-frame burst: the
     dots are the "far more" being described, so they should still be arriving
     while it is described. Twenty-five seconds of this strip used to contain
     thirty frames of movement. */
  const rows = (['cap.farm', 'cap.fact', 'cap.serv'] as const).map((n, i) =>
    pr(f, cue(n) - 12, Math.max(30, beatEnd(57 + i) - cue(n) + 12), EASE.move));

  const workerSize = lerp(lerp(HINGE.worker.size, HINGE.subject, hand), HINGE.parked.size, park);
  const capW = lerp(600, HINGE.parked.capW, park);
  /* The caption hangs off the worker's own lower edge the whole way across, and
     only the size of the gap changes — interpolating its top towards a fixed
     landing line instead sent it up through the figure mid-flight, because that
     line sits above where the worker still is halfway through the move. */
  const workerBottom = lerp(HINGE.worker.cy, HINGE.parked.cy, park) + workerSize / 2;
  const parkedBottom = HINGE.parked.cy + HINGE.parked.size / 2;
  const capTop = workerBottom + lerp(34, HINGE.parked.capTop - parkedBottom, park);

  const hypTo = lerp(RATIO.shift, 2, hyp2) * hyp;
  const hypToP = lerp(RATIO.shift, 2, hyp2P) * hypP;
  const ROWY = { a: 316, b: 452, c: 588 };
  const SEC_ICON: IconName[] = ['land', 'factory', 'internet'];

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - enter) * 200 + exit * -1200}px)`, opacity: enter }}>

      {/* ---- can the sector mix explain it? ---- */}
      {ringOut < 0.999 ? (
        <div style={{ transform: `translateY(${ringOut * -1200}px)` }}>
          {/* It holds the frame on its own for a beat, so it is a title card
              until the rings arrive and demote it to the section's heading.
              It is the only heading this section has — the eyebrow arrives
              underneath it rather than replacing it. */}
          {/* Centred while it is alone — the line sets to 1097px at this size, so
              at 1.34 scale a 145px shift puts it on the frame's axis — and it
              travels to the heading position as the chart arrives to replace it. */}
          <div style={{
            position: 'absolute', left: 80, top: lerp(430, 110, ringIn), width: 1400, opacity: q,
            transform: `translateX(${lerp(145, 0, ringIn)}px) scale(${lerp(1.34, 1, ringIn)})`,
            transformOrigin: 'left top',
          }}>
            <Txt size={T.h2} color={C.ink} weight={700} lh={1.2}>
              Why does an Indian worker produce less?
            </Txt>
          </div>
          {/* after the heading has landed, not during its travel: the question
              passes straight through y=188 on its way up from the centre, and
              the two lines briefly printed over each other */}
          <div style={{ position: 'absolute', left: 80, top: 188, width: 1200,
            opacity: pr(f, cue('sect.half') + 2, 16, EASE.move) }}>
            <Txt size={T.micro} color={C.muted} weight={700} track={2.8}>THE OBVIOUS ANSWER · IT IS THE SECTOR MIX</Txt>
          </div>

          {ringIn > 0.002 ? (
            <WorkforceRing cx={lerp(960, RING.in, ringUs)} chip="INDIA" country="in"
              shares={COMPOSITION.in.workers} draw={ringIn} move={move} focus={focus} />
          ) : null}
          {ringUs > 0.002 ? (
            <WorkforceRing cx={RING.us} chip="USA" country="us"
              shares={COMPOSITION.us.workers} draw={ringUs} move={0} focus={focus} />
          ) : null}

          <div style={{
            position: 'absolute', left: 80, top: 900, width: 1760,
            display: 'flex', gap: 40, justifyContent: 'center', opacity: clamp01(ringIn * 1.6 - 0.6),
          }}>
            {SECTORS.map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: s.color }} />
                <Txt size={T.micro} color={C.muted} weight={700} track={1.8}>{s.label}</Txt>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 80, top: 976, width: 1760,
            opacity: pr(f, cue('sect.scrutiny') - 16, 26, EASE.move) }}>
            <Txt size={T.body} color={C.muted} weight={600} align="center">
              A thought experiment: move every Indian farm worker into services, at India&apos;s own service productivity.
            </Txt>
          </div>
        </div>
      ) : null}

      {/* ---- and it does not ---- */}
      {axis > 0.001 && sectorOut < 0.999 ? (
        <div style={{ transform: `translateY(${(1 - axis) * 700 + sectorOut * -1200}px)` }}>
          <div style={{ position: 'absolute', left: 80, top: 110, width: 1400 }}>
            <Txt size={T.micro} color={C.ink} weight={700} track={2.8}>WHAT THE EXPERIMENT BUYS</Txt>
            <div style={{ marginTop: 12 }}>
              <Txt size={T.h2} color={C.ink} weight={700} lh={1.2}>Output per worker</Txt>
            </div>
          </div>

          <ProdBar y={ROWY.a} value={1} color={C.dim} icon="machine" decimals={1}
            chip="TODAY" country="in" op={axis} />
          <ProdBar y={ROWY.b} value={lerp(1, RATIO.shift, grow)} prev={lerp(1, RATIO.shift, growP)}
            color={C.secSer} icon="machine" decimals={1} hi={hiSubst}
            chip="AFTER THE MOVE" country="in" op={axis} note="EVERY FARM WORKER MOVED" />

          {/* The counterfactual, in America's own lane and on America's own
              row: this is the length the sector answer needs America to be. It
              is hollow and it says so on itself, so it is never mistaken for a
              measurement while it is the only thing in the row. */}
          {hyp > 0.002 && need < 0.2 ? (
            <ProdBar y={ROWY.c} value={hypTo} prev={hypToP} color={C.secAgri} icon="machine"
              decimals={1} chip="TODAY" country="us" hollow={1}
              op={hyp * (1 - clamp01(need * 5))} hi={blame}
              note="IF THE SECTOR MIX WERE THE ANSWER" />
          ) : null}

          {need > 0.002 ? (
            <>
              <ProdBar y={ROWY.c} value={RATIO.output * need} prev={RATIO.output * needP}
                color={C.wage} icon="machine" chip="TODAY" country="us" hi={hiGap}
                note="AMERICA ÷ INDIA" />
              {/* the mark the real bar has to be seen going straight past */}
              <div style={{
                position: 'absolute', left: axAt(PAX, 2) - 1.5, top: ROWY.c - 18,
                width: 3, height: 90, background: C.bg,
                boxShadow: `0 0 0 1.5px ${C.secAgri}`,
              }} />
              <div style={{
                position: 'absolute', left: axAt(PAX, 2) - 170, top: ROWY.c + 80, width: 340,
                textAlign: 'center', opacity: 0.9,
              }}>
                <Txt size={T.micro} color={C.secAgri} weight={700} track={1.8} align="center">
                  WHAT THE THEORY ALLOWS
                </Txt>
              </div>
            </>
          ) : null}

          <ProdAxis y={800} draw={axis} />

          <GapBracket x0={axAt(PAX, RATIO.shift)} x1={axAt(PAX, RATIO.output)} y={880}
            value={`still ${Math.round(RATIO.output / RATIO.shift)}× behind`}
            label="WHERE INDIANS WORK IS NOT THE MAIN REASON"
            color={C.cost} draw={unexplained} />
        </div>
      ) : null}

      {/* ---- the gap inside each sector ---- */}
      {inside > 0.001 && insideOut < 0.999 ? (
        <div style={{ transform: `translateY(${(1 - inside) * 700}px)` }}>
          <div style={{ position: 'absolute', left: 80, top: 110, width: 1400, opacity: 1 - clamp01(insideOut * 1.6) }}>
            <Txt size={T.micro} color={C.ink} weight={700} track={2.8}>OUTPUT PER WORKER · AMERICA ÷ INDIA</Txt>
            <div style={{ marginTop: 12 }}>
              <Txt size={T.h2} color={C.ink} weight={700} lh={1.2}>Inside every single sector</Txt>
            </div>
          </div>
          {/* They do not slide away: all three converge on the one idea they add
              up to — "the kind of work people do" — which is the thing the next
              sentence is about to rule out. */}
          {SECTOR_GAP.map((g, i) => {
            const y = 300 + i * 210;
            const k = clamp01(secHi[i]);
            const io = insideOut;
            return (
              <div key={g.key} style={{
                position: 'absolute', inset: 0,
                transform: `translate(${-40 * io}px, ${(HINGE.line1 + 26 - (y + 50)) * io}px) scale(${lerp(1, 0.2, io)})`,
                transformOrigin: `1000px ${y + 50}px`,
                opacity: 1 - io,
              }}>
                <div style={{ position: 'absolute', left: 80, top: y + 37, width: 340, opacity: secOn[i] }}>
                  <Txt size={T.small} color={mixHex(C.muted, g.color, k)} weight={700} track={2.4} align="right">{g.label}</Txt>
                </div>
                {/* America above, India below — the film's order everywhere */}
                <ProdBar y={y} h={44} axis={SAX} value={g.x * bar[i]} prev={g.x * barP[i]}
                  color={g.color} icon={SEC_ICON[i]} country="us" flagX={444}
                  op={secOn[i]} hi={k} />
                <ProdBar y={y + 56} h={44} axis={SAX} value={1} color={C.dim} icon={SEC_ICON[i]}
                  country="in" flagX={444} op={secOn[i]} />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 80, top: 930, width: 1760, opacity: remain * (1 - clamp01(insideOut * 1.6)) }}>
            <Txt size={T.body} color={C.ink} weight={600} lh={1.4}>
              There is no sector where India is close. A rich-country sector mix would leave almost all of this gap exactly where it is.
            </Txt>
          </div>
        </div>
      ) : null}

      {/* ---- the hinge, and what each worker has behind them ---- */}
      {hinge > 0.001 ? (
        <>
          {/* the half the last three frames just ruled out, in the narrator's
              own words, struck through on the words that finish it */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `scale(${lerp(0.74, 1, hinge)})`,
            transformOrigin: `960px ${HINGE.line1 + 26}px`,
          }}>
            <Struck text="The kind of work people do" draw={strike}
              op={hinge * (1 - clamp01(cap * 2.2))} y={HINGE.line1} />
          </div>

          {/* and the half the rest of the film is about, arriving as it is said */}
          <div style={{
            position: 'absolute', left: 0, top: HINGE.line2 + (1 - second) * 26, width: '100%',
            textAlign: 'center', opacity: second * (1 - clamp01(cap * 2.2)),
          }}>
            <Txt size={HINGE.size} color={C.ink} weight={700} lh={1.2} align="center">
              What each worker has at their disposal to do that work
            </Txt>
          </div>

          {/* the one object that survives the change: the worker itself, which
              walks from the middle of the hinge into the corner of the next
              frame rather than being cut and redrawn there */}
          <div style={{
            position: 'absolute',
            left: lerp(HINGE.worker.cx, HINGE.parked.cx, park) - workerSize / 2,
            top: lerp(HINGE.worker.cy, HINGE.parked.cy, park) - workerSize / 2,
            opacity: clamp01(hinge * 2),
          }}>
            <Icon name="person" size={workerSize} color={C.ink} draw={hinge} />
          </div>
          {/* Its caption travels with it. The worker is the only figure in the
              strip that is not one of the five things, so if the label were
              dropped at the corner it would be the one icon in a row of
              labelled icons with nothing under it. It shrinks into the strip's
              own caption size as it goes, and lands on the strip's caption
              line. */}
          {/* The box narrows as it travels, so the label sets on one line under
              the portrait and breaks onto two by the time it reaches the strip
              — where the space between the film's left margin and CAPITAL is
              only wide enough for one word. */}
          <div style={{
            position: 'absolute',
            left: lerp(HINGE.worker.cx, HINGE.parked.capCx, park) - capW / 2,
            top: capTop,
            width: capW, textAlign: 'center',
            opacity: named,
            transform: `translateY(${(1 - named) * 12}px)`,
          }}>
            <Txt size={lerp(T.label, T.micro, park)} color={C.muted} weight={700}
              track={lerp(6, 1.4, park)} align="center" lh={1.3}>
              AMERICAN WORKER
            </Txt>
          </div>
        </>
      ) : null}

      {cap > 0.001 ? (
        <div>
          {/* The flag leads the heading the way the rule leads a chip elsewhere,
              so the country is part of the label rather than an ornament beside
              it — and the heading sits directly over the worker it describes. */}
          <div style={{
            position: 'absolute', left: 80, top: 106, display: 'flex', alignItems: 'center', gap: 14,
            opacity: clamp01(cap * 1.6 - 0.6),
          }}>
            <div style={{ position: 'relative', width: 34, height: 23 }}>
              <Flag country="us" x={0} y={0} w={34} />
            </div>
            <Txt size={T.micro} color={C.ink} weight={700} track={2.8} lh={1}>
              BEHIND EACH HOUR OF LABOUR IN THE USA
            </Txt>
          </div>
          {/* the five things are enumerated out loud, so each one draws on the
              word that names it and keeps that word underneath it */}
          <div style={{ position: 'absolute', left: 236, top: 158, display: 'flex' }}>
            {TOOLS.map((t, i) => (
              <div key={t.n} style={{
                width: 214, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                opacity: tool[i],
                transform: `translateY(${(1 - tool[i]) * 14}px)`,
              }}>
                {/* the icon keeps the row's even rhythm; the arrow hangs off it */}
                <div style={{ position: 'relative', width: 82, height: 82 }}>
                  <Icon name={t.n} size={82} color={C.tax} draw={tool[i]} />
                  <div style={{
                    position: 'absolute', left: 90, top: 19 + (1 - more[i]) * 10,
                    opacity: more[i],
                  }}>
                    {/* sw is set so the arrow's stroke is physically the same
                        weight as the icon's — 7/100 of 82px */}
                    <Icon name="up" size={44} sw={13} color={C.wage} draw={more[i]} />
                  </div>
                </div>
                <Txt size={T.micro} color={C.tax} weight={700} track={1.1} align="center">{t.l}</Txt>
              </div>
            ))}
          </div>

          <CapitalRow y={400} icon="land" who="A farmer with better machinery" sector={0} draw={rows[0]} />
          <CapitalRow y={600} icon="factory" who="A worker in a better-equipped plant" sector={1} draw={rows[1]} />
          <CapitalRow y={800} icon="internet" who="A service worker with better systems" sector={2} draw={rows[2]} />

          <div style={{ position: 'absolute', left: 80, top: 968, width: 1760, opacity: clamp01(rows[2] * 1.3 - 0.3) }}>
            <Txt size={T.micro} color={C.dim} weight={600} track={1.4}>
              Each dot is one unit of output per worker in that sector, America against India.
            </Txt>
          </div>
          <div style={{ position: 'absolute', left: 80, top: 1010, width: 1760, opacity: fade(f, beat(60) + 24, undefined, 22) }}>
            <Txt size={T.body} color={C.ink} weight={600}>
              Moving workers between sectors does not help if you cannot raise what each worker can produce inside them.
            </Txt>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { Chip, Flag };
