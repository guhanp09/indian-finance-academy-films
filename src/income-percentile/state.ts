// The film's single source of truth.
//
// The meter has one fixed ceiling and one fixed on-screen geometry. It is never
// rescaled, so ₹12,000 occupies 12% of it from the first frame it appears and
// the smallness of the median is felt rather than described.
import raw from './cues.json';
import timing from './timing.json';
import { rolled, IN, US, clamp01 } from './anim-bridge';

type Cue = { beat: number; startFrame: number; frame: number; words: string };
const CUES = (raw as { cues: Record<string, Cue> }).cues;

export const cue = (n: string): number => {
  const c = CUES[n];
  if (!c) throw new Error(`unknown cue "${n}"`);
  return c.frame;
};
export const cueIn = (n: string): number => CUES[n].startFrame;
export const beat = (i: number) => timing.beats[i].startFrame;
export const beatEnd = (i: number) => timing.beats[i].endFrame;

/**
 * Lead-in that cannot reach back into the line before it.
 *
 * Scenes are cued as "n frames before beat i" so that they have arrived by the
 * time the words land. That was safe while the narration was synthesised, where
 * every line was followed by a gap; a recorded voice does not work that way —
 * most beats here begin the instant the previous one ends, and a few overlap.
 * Against that, `beat(i) - 30` is not lead-in at all: it is a second inside the
 * sentence still being spoken, and the picture visibly pre-empts the voice.
 *
 * So the lead-in is taken out of the silence where there is silence, and where
 * there is none it may reach a bounded six frames into the tail of the previous
 * line — a fifth of a second, under the threshold at which a viewer registers
 * the picture as moving first, and enough that the scene reads as caused by the
 * voice rather than chasing it. Clamping all the way to `beatEnd` was the other
 * error: five transitions then began on the very first frame of the sentence
 * they serve and only arrived a second into it.
 */
const ANTICIPATE = 6;   // frames a transition may reach into the previous line
export const lead = (i: number, frames: number) =>
  Math.max(beat(i) - frames, i > 0 ? beatEnd(i - 1) - ANTICIPATE : 0);
export const TOTAL = timing.totalFrames;

/* The channel card begins as the closing frame fades, and the film ends when it
   does. TOTAL is the content — the last word plus the hold to sit with it. */
export const CARD_START = TOTAL - 24;

export type Stage = { land: number; from: number; to: number; dur?: number };

/**
 * How long a figure should take to roll: exactly as long as it is being spoken.
 *
 * Every stage used to carry a duration picked by hand against a synthesised
 * voice — 28 frames, say, ending on the word. A person says "thirty seven
 * thousand five hundred" over 69 frames, so a 28-frame roll sits perfectly
 * still for the first 41 of them and then hurries to catch up. The number
 * visibly starts late, and what the viewer feels is the picture chasing the
 * voice rather than moving with it.
 *
 * Taking the duration from the phrase itself makes the motion and the sentence
 * the same length: the roll is under way on the first syllable and comes to
 * rest on the last. The lead-in is small and deliberate — a figure that begins
 * moving a breath before the words reads as anticipating them, which is what
 * every well-cut explainer does; one that begins after reads as lagging.
 */
const ROLL = { lead: 8, min: 22, max: 96 };
export const spoken = (name: string) =>
  Math.max(ROLL.min, Math.min(ROLL.max, cue(name) - cueIn(name) + ROLL.lead));

/**
 * Start frame and duration for anything that must be in motion while a figure
 * is spoken and come to rest on its last syllable — spread straight into `pr`:
 *
 *   const grow = pr(f, ...onWord('sect.27x'), EASE.smooth);
 *
 * Every bar in this film is the same object as the number beside it, so the two
 * have to be driven from one window or they disagree on screen.
 */
export const onWord = (name: string): [number, number] => {
  const d = spoken(name);
  return [cue(name) - d, d];
};

/**
 * The frame a figure's roll begins.
 *
 * Whatever displays that figure has to be on screen by then. Gates written as
 * `cue(x) - 34` were correct while every roll was 34 frames long; once the roll
 * takes its length from the phrase instead, the same constant mounts the
 * readout up to 56 frames *after* its own number started moving — so it appears
 * from nothing, already most of the way through its roll, and then snaps.
 */
export const rollStart = (name: string) => cue(name) - spoken(name);

/**
 * The frame an accent should reach full strength on.
 *
 * `accent(f, on, until)` ramps *up to* `on`, and every call site was passing
 * `cue(name)` — the last frame of the phrase. So a highlight meant to say "this
 * one, now" spent the entire phrase dark and then blinked once the word was
 * over: on "the actual gap is roughly twenty-seven-fold" the bar grew for 78
 * frames unlit and the accent fired for 22 after the sentence had moved on.
 *
 * Lighting six frames into the word puts the pointer where the voice is.
 */
export const onSaid = (name: string) => cueIn(name) + 6;

export const staged = (f: number, stages: Stage[]) => {
  let v = stages[0].from;
  for (const s of stages) {
    const d = s.dur ?? 26;
    if (f >= s.land - d) v = rolled(f, s.land, s.from, s.to, d);
  }
  return v;
};
export const stagedPrev = (f: number, stages: Stage[]) => staged(f - 1, stages);

/* ---------------------------------------------------------------- India -- */
/* salary first, rank second */

export const IN_INCOME: Stage[] = [
  { land: cue('in.12k'), from: 0, to: IN.median, dur: spoken('in.12k') },
  { land: cue('in.32k'), from: IN.median, to: IN.top10, dur: spoken('in.32k') },
  { land: cue('in.75k'), from: IN.top10, to: IN.top1, dur: spoken('in.75k') },
];
export const IN_RANK: Stage[] = [
  { land: cue('in.50'), from: 0, to: 50, dur: spoken('in.50') },
  { land: cue('in.t10'), from: 50, to: 90, dur: spoken('in.t10') },
  { land: cue('in.t1'), from: 90, to: 99, dur: spoken('in.t1') },
];

/* ------------------------------------------------------------------- US -- */
/* rank first, salary second */

export const US_RANK: Stage[] = [
  { land: cue('us.50'), from: 0, to: 50, dur: spoken('us.50') },
  { land: cue('us.90'), from: 50, to: 90, dur: spoken('us.90') },
  { land: cue('us.99'), from: 90, to: 99, dur: spoken('us.99') },
];
export const US_INCOME: Stage[] = [
  { land: cue('us.4400'), from: 0, to: US.median, dur: spoken('us.4400') },
  { land: cue('us.12900'), from: US.median, to: US.top10, dur: spoken('us.12900') },
  { land: cue('us.37500'), from: US.top10, to: US.top1, dur: spoken('us.37500') },
];

/* -------------------------------------------------- the expense apparatus -- */

export const BASKET_N = 5;

export const LIFE_CUES_US = ['life.rent', 'life.food', 'life.util', 'life.tran', 'life.leis'] as const;

/**
 * One category at a time, and each one lands on the meter within half a second
 * of the word that names it — the icon is flung in, its arrival *is* the step
 * the expense takes, and the whole basket is stacked by the time the narrator
 * finishes listing it. Nothing waits around to be looked at.
 */
export const BASKET_SHOW = 32;    // frames before the landing that the icon draws on
export const TRAVEL_IN = 12;      // frames the flight itself takes
export const TRAVEL_DRAW = 10;    // frames the icon takes to draw on

export const US_TRAVEL = LIFE_CUES_US.map((n) => cue(n) + 18);
/** India re-stacks the same five as a recap: no words to hit, so it runs flat
 *  out and is finished long before the total is spoken. */
/* A cascade, not a metronome. America's five icons each land on the word that
   names them; India's recap has no such words, and spreading them evenly across
   three and a half seconds made the difference audible — the same apparatus
   suddenly keeping its own time. They now restack quickly, inside the clause
   that says it is the same basket. */
export const IN_TRAVEL = Array.from({ length: BASKET_N }, (_, i) => beat(16) + 52 + i * 12);

/* Deliberately uneven, and well short of the total: the categories establish
   that cost accumulates, the narrated figure alone establishes how much. */
const STEP = [0.05, 0.09, 0.13, 0.16, 0.19];

const buildCost = (travel: readonly number[], totalCue: number, amount: number, dur: number): Stage[] => [
  ...travel.map((land, i) => ({
    land, from: i === 0 ? 0 : amount * STEP[i - 1], to: amount * STEP[i], dur: 9,
  })),
  { land: totalCue, from: amount * STEP[4], to: amount, dur },
];

export const US_COST = buildCost(US_TRAVEL, cue('us.cost'), US.cost, spoken('us.cost'));
export const IN_COST = buildCost(IN_TRAVEL, cue('in.cost'), IN.cost, spoken('in.cost'));

export const US_LEFT: Stage[] = [
  { land: cue('us.left.med'), from: 0, to: US.leftMed, dur: spoken('us.left.med') },
  { land: cue('us.left.tax'), from: US.leftMed, to: US.leftTax, dur: spoken('us.left.tax') },
  { land: cue('us.left.t10'), from: US.leftTax, to: US.leftT10, dur: spoken('us.left.t10') },
  { land: cue('us.left.t1'), from: US.leftT10, to: US.leftT1, dur: spoken('us.left.t1') },
];
/** The income under analysis. The meter itself never shrinks to match it. */
export const US_ACTIVE: Stage[] = [
  /* anchored to act 2's own arrival (us.37500 + 36) rather than to the beat, so
     the roll cannot begin before the scene it lives in is on screen */
  { land: cue('us.37500') + 82, from: US.top1, to: US.median, dur: 46 },
  { land: cue('us.left.t10'), from: US.median, to: US.top10, dur: spoken('us.left.t10') },
  { land: cue('us.left.t1'), from: US.top10, to: US.top1, dur: spoken('us.left.t1') },
];
export const IN_ACTIVE: Stage[] = [
  { land: cue('in.short.t10'), from: IN.median, to: IN.top10, dur: spoken('in.short.t10') },
  { land: cue('in.left.t1'), from: IN.top10, to: IN.top1, dur: spoken('in.left.t1') },
];
/**
 * The top-1% figure has to travel like every other number in the film. It used
 * to be the constant `IN.leftT1`, so the hero snapped from ₹3,400 to ₹39,600 in
 * a single frame — the one figure in either country that never rolled, and the
 * one place act 3 stopped being act 2 re-run.
 */
export const IN_LEFT: Stage[] = [
  { land: cue('in.left.t1'), from: IN.shortT10, to: IN.leftT1, dur: spoken('in.left.t1') },
];
export const IN_SHORT: Stage[] = [
  { land: cue('in.short.med'), from: 0, to: IN.shortMed, dur: spoken('in.short.med') },
  { land: cue('in.short.t10'), from: IN.shortMed, to: IN.shortT10, dur: spoken('in.short.t10') },
];

/* -------------------------------------------------------- the viewport --- */
/*
 * The ladder is built at the meter's true scale — ₹12,000 really is 12% of the
 * ceiling, and that smallness is the point. The cost analysis is a different
 * job: at full scale a $2,580 basket is 5% of the meter and the relationship
 * to the median is unreadable, so the frame pushes in *before* the expense
 * appears. The meter above simply runs off the top of the frame; it is never
 * masked, faded or cut short.
 */
export const US_VIEW: Stage[] = [
  /* anchored to act 2's own arrival: keyed to the beat it used to start moving
     before the scene it belongs to was even mounted, and act 1 was still fading
     over it — two note stacks at two scales, every label printed twice */
  { land: cue('us.37500') + 50 + 52, from: 1.0, to: 0.12, dur: 52 },
  { land: cue('us.left.t10') - 52, from: 0.12, to: 0.32, dur: 34 },
  { land: cue('us.left.t1') - 56, from: 0.32, to: 1.0, dur: 38 },
];
/* India opens at a scale suited to the median and the frame rises with the
   expense, so the coral is watched climbing past landmarks that slide down to
   meet it. */
export const IN_VIEW: Stage[] = [
  { land: beat(16) + 30, from: 1.0, to: 0.18, dur: 38 },
  { land: cue('in.cost'), from: 0.18, to: 0.404, dur: spoken('in.cost') },
  { land: cue('in.left.t1') - 54, from: 0.404, to: 0.85, dur: 40 },
];

/* ----------------------------------------------------------- geometry ---- */

export const inV = (rupees: number) => rupees / IN.cap;
export const usV = (dollars: number) => dollars / US.cap;
export const usTax = (gross: number, left: number) => Math.max(0, gross - US.cost - left);
export { clamp01 };
