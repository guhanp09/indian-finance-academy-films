/* UPI SCAM 1 — the beat map.
 *
 * THE ONE RULE: no visual event in this film is placed at a wall-clock time. Every event is
 * anchored to a word index in `narration.json`, whose start time was MEASURED (whisper word
 * timestamps, character-wise forced-aligned, with onsets snapped to detected silence edges).
 * Re-record the voice, re-run tools/upi-scam/narration.mjs, and the whole film re-times itself
 * semantically, because the numbers move and the structure does not.
 *
 * WHY THE STORYBOARD'S OWN TIMES ARE NOT USED — see docs/upi-scam/premortem.md F1. The
 * storyboard carries two clocks that disagree by up to 5.5s; taken literally, the money turns red
 * and leaves the account at 9.3s, while the narrator is still explaining the setup, and the word
 * "however" arrives three seconds after the betrayal it announces. Every storyboard event is kept
 * and kept in order; only its anchor moves, onto the word whose meaning it illustrates.
 */
import narration from './narration.json';
import { FPS } from './design';

export const NARR = narration as {
  duration: number; durationInFrames: number;
  words: { w: string; s: number; e: number }[];
  fragments: { i: number; text: string; start: number; end: number; until: number }[];
};

export const DURATION = NARR.durationInFrames;
export const wordAt = (i: number) => NARR.words[i].s;

/* A MOVE THAT LANDS ON ITS BEAT.
 *
 * Everything here is anchored to measured words, so a slower read spreads the film out on its own.
 * That is right for the camera — a drift should breathe with the narration — but wrong for anything
 * with mass: a card flying between two cues, the reversal folding, a hand crossing to a button. If
 * those are interpolated across the gap they get slower as the gap grows, which is the one thing a
 * physical move must never do.
 *
 * So the beat says WHEN a move lands; `max` says how long it takes — set to its duration in the
 * approved cut, which makes this inert for that read and a speed floor for every slower one. A
 * faster read still compresses it, because arriving late is worse than arriving quickly. */
export const paced = (start: number, end: number, max: number) => {
  const span = Math.min(end - start, max);
  return { from: end - span, span: Math.max(0.001, span) };
};

/** Anchor: a word index, or a position inside the SILENCE after a word — because some beats have
 *  to live in a breath rather than on a syllable (the pre-snap inhale is the clearest example).
 *
 *  There is deliberately no wall-clock option. Five beats used to carry explicit seconds and they
 *  were the film's last hard dependency on one particular read: on a recorded VO the held breath
 *  after "…your UPI PIN." landed 1.9s before the word it was meant to follow, and the beat-order
 *  guard caught it. `frac` places a beat proportionally through whatever pause the reader leaves;
 *  `plus` places it a fixed distance after a word, for the tail where there is no next word. */
type A = number | { after: number; frac: number } | { after: number; plus: number };
const sec = (a: A): number => {
  if (typeof a === 'number') return wordAt(a);
  const w = NARR.words, end = w[a.after].e;
  if ('plus' in a) return end + a.plus;
  const next = a.after + 1 < w.length ? w[a.after + 1].s : end;
  return end + (next - end) * a.frac;
};

export type Beat = {
  n: number; phase: Phase; t: number; f: number;
  /** the storyboard's primary focal event for this beat, verbatim in intent */
  event: string;
  /** the word being spoken when it fires — the thing that makes it feel caused by the narration */
  on: string;
};
export type Phase = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

const RAW: [Phase, A, string][] = [
  /* ── A · HOOK — "The scammer will send you a UPI request that looks like money is coming to you —"
     The illusion is built here and must be BELIEVED. Nothing in phase A hints at the scam. */
  ['A', 0, 'world settles: seller, phone, parcel, scammer node, ledger already exist'],
  ['A', 1, 'a request buds off the scammer node and is launched down the network path'],
  ['A', 3, 'the request card travels right-to-left, shadow growing as it nears camera'],
  ['A', 6, 'the UPI mark asserts itself in the app bar — the film names its subject'],
  ['A', 7, 'the card LANDS: phone recoils, badge lags, shadow compresses, seller eyes move'],
  ['A', 8, 'the amount swells and the card reads PAYMENT INCOMING — the lie, stated'],
  ['A', 10, 'green inbound direction appears in the ledger: THEM -> YOU'],
  ['A', 13, 'a layered stream of green rupee tokens moves toward the seller across three planes'],
  ['A', 14, 'the stream is guided into the YOU/account node — the false reading made undeniable'],
  ['A', 15, "the seller's expectation: eyes, then head, then shoulders, then a small lean in"],
  ['A', 16, 'the green flow curves downward toward Approve — the deception leads the eye to the danger'],
  ['A', 19, 'camera pushes in; the Approve control enters the composition'],

  /* ── B · APPROVE & PIN — "you just need to approve it by entering your UPI PIN. / The moment you
     enter your PIN and approve it," — the mechanism is shown in sentence 1 and EXECUTED in
     sentence 2. That split is what gives the four taps a full 2.4s to breathe. */
  ['B', 21, 'Approve rises into focal priority; the green illusion still runs behind it'],
  ['B', 22, "the seller's finger travels a curved path, anticipation and hover"],
  ['B', 23, 'Approve is PRESSED: button compresses, shadow collapses, card shifts, phone takes the force'],
  ['B', 24, 'the PIN keypad drawer rises with weight; the card physically moves up to make room'],
  ['B', 25, 'the keypad locks; UPI PIN takes a short emphasis'],
  ['B', 26, 'four empty PIN dots stage as the new focal target'],
  ['B', { after: 29, frac: 0.36 }, 'held breath: camera still, flow still inbound, nothing yet wrong'],
  ['B', 32, 'PIN tap 1 — key compression, dot spring, ripple, hand rebound, tiny phone recoil'],
  ['B', 33, 'PIN tap 2 — different finger arc, slightly altered keypad response'],
  ['B', 35, 'PIN tap 3 — and the green inbound flow weakens very slightly. Foreshadow, not reveal'],
  ['B', 37, 'PIN tap 4 — firmest of the four; then almost all motion is removed'],
  ['B', 38, 'commit: the card locks, the world settles, the seller feels a flicker of relief'],

  /* ── C · REVERSAL & DEBIT — "however, instead of you getting paid, the money leaves your account."
     THE HERO SEQUENCE. Three staged events, not one: tension / betrayal / loss. */
  ['C', 39, 'HOWEVER: stimulation drops — particles thin, network stops advancing, camera decelerates'],
  ['C', { after: 39, frac: 0.35 }, 'the green arrow loads elastically, compressing lengthwise; the only thing moving'],
  ['C', 40, 'the arrow folds back through its own tail; the arrowhead starts to cross; green -> yellow'],
  ['C', 42, 'the card subline morphs PAYMENT INCOMING -> PAYING buyer@upi; yellow -> amber'],
  ['C', 43, 'the amount takes a minus sign and the chevron inverts to a hard barbed point'],
  ['C', 44, 'amber -> orange; the phone recoils; the UI rattles once'],
  ['C', { after: 44, frac: 0.79 }, 'pre-snap: the frame inhales — everything draws fractionally inward'],
  ['C', 46, 'the four PIN dots DETACH and become rupee tokens. The authorisation IS the money'],
  ['C', 47, 'SNAP — outward, red, left-to-right. Tokens launch on varied ballistic arcs'],
  ['C', 48, 'the balance rolls down mechanically; the account node contracts'],
  ['C', 49, 'the scammer node absorbs the tokens one by one; the seller slumps, late'],

  /* ── D · ONLINE SELLERS — "While the common targets for this scam are online sellers," */
  ['D', { after: 49, frac: 0.16 }, 'the paid request is flung away — the screen underneath it is the point'],
  ['D', 50, 'the fraud motion subsides; the parcel rises out of the foreground'],
  ['D', 51, 'the parcel moves toward centre and its surfaces prepare to become interface'],
  ['D', 52, 'the parcel face MORPHS into a marketplace listing: label->title, sticker->price'],
  ['D', 53, 'more sellable objects arrive, each with its own material physics'],
  ['D', 54, 'a buyer chat reads "Payment sent" while a second UPI request starts travelling'],
  ['D', 55, 'that request lands inside the marketplace context'],
  ['D', 56, 'ticks, avatar, price and amount all live at once — the request stays the only loud thing'],
  ['D', 57, 'the expectation loop replays in miniature: paid -> request -> glance at Approve'],
  ['D', 58, 'the seller/listing cluster is bracketed as the common target'],
  ['D', 59, 'camera pulls farther: the marketplace becomes one region of something larger'],

  /* ── E · ANYONE — "anyone unfamiliar with the basics of UPI transactions can fall for it." */
  ['E', 60, 'the seller shrinks slightly as other user silhouettes resolve behind and around'],
  ['E', 61, 'the marketplace grid lines transform into UPI network lines'],
  ['E', 62, 'one faint listing is kept behind the seller so the previous idea stays readable'],
  ['E', 63, 'focus shifts to the broader field; the seller remains as one example, not discarded'],
  ['E', 64, 'a young worker appears; their phone lights; their eyes react before their head'],
  ['E', 65, 'an office worker and a homemaker arrive from different depth planes'],
  ['E', 66, 'an older adult joins — same visual language, no caricature'],
  ['E', 67, 'question-mark paths rise from phones to heads; one user dismisses, one hesitates'],
  ['E', 68, 'a small receive-vs-pay diagram builds in the background as ambient education'],
  ['E', 69, 'request notifications duplicate across phones on staggered springs'],
  ['E', 70, 'one finger almost reaches Approve and stops short — tension without repetition'],
  ['E', 71, 'a soft risk field wraps the group, then contracts toward the older adult'],

  /* ── F · PARENTS — "If your parents use UPI, let them know that they never need to enter their
     UPI pin" — warmer, lavender rather than red, and never condescending. */
  ['F', 72, 'the group parts into a corridor; the camera begins a smooth push'],
  ['F', 73, 'the parent figures move from midground into the focal plane'],
  ['F', 74, 'two parents, one shared phone, UPI immediately readable'],
  ['F', 75, 'a fresh request arrives on their phone — restrained spring, amount and Approve, no clutter'],
  ['F', 76, "the holder's finger starts toward Approve while the other parent's hand starts to point"],
  ['F', 77, 'a rule card slides between finger and button; the misleading green arrow bends on its edge'],
  ['F', 79, 'the finger decelerates naturally and retracts; the rule card takes focal priority'],
  ['F', 81, 'RECEIVE MONEY -> NO PIN assembles in stages; the request is pushed back in depth'],
  ['F', 82, 'a PIN keypad spawns beside RECEIVE and is struck through'],
  ['F', 84, 'a shield line traces clockwise around the phone; on closure, one restrained pulse'],
  ['F', 85, 'the dangerous request shrinks further away; the safe rule grows'],
  ['F', 87, 'every surviving element begins reorganising into the final comparison — no cut'],
  ['F', 88, 'the parents move outward into supportive context; the rule becomes the protagonist'],

  /* ── G · THE RULE — "…when receiving money. If a screen asks for their PIN, they are
     authorising money to leave their account."
     The ending is no longer a static comparison: the SEND side is DEMONSTRATED. A PIN is entered
     on it, key by key, with no hand — and then the payment succeeds, exactly the way a real UPI
     payment succeeds, which is the point: that screen is not receiving anything. */
  ['G', 89, 'RECEIVE stands forward and alone, fully readable — there is no keypad on this side'],
  ['G', 90, 'NO PIN takes its emphasis while the inbound flow keeps running'],
  ['G', 91, 'it settles; the statement is complete'],
  ['G', 92, 'SEND arrives from the right and RECEIVE steps left into the comparison'],
  ['G', 95, 'the keypad on SEND lights key by key — a PIN being entered, and no hand doing it'],
  ['G', 101, 'PAID: the tick draws, and the money leaves toward them'],
  ['G', { after: 106, plus: 0.70 }, 'exit: the rule dominant, the parents faint, the world nearly still'],
];

export const BEATS: Beat[] = RAW.map(([phase, a, event], n) => {
  const t = sec(a);
  return {
    n, phase, t, f: Math.round(t * FPS), event,
    on: typeof a === 'number' ? NARR.words[a].w : '(between words)',
  };
});

/* The beat array is INDEX-STABLE. Every renderer addresses beats as B(n), so inserting one in the
   middle would silently move every act boundary in the film. Sub-choreography that lives inside a
   beat's window is added to CUE below instead, never to this array. */
if (RAW.length !== 78) throw new Error(`beat count changed (${RAW.length}) — every B(n) reference `
  + 'in the renderers is now pointing at a different moment. Add cues, not beats.');

/* monotonic + minimum spacing: two primary focal events must never fire on the same frame,
   or the "exactly one focal point" rule is broken at the moment it matters most. */
BEATS.forEach((b, i) => {
  if (i && b.t <= BEATS[i - 1].t + 0.05)
    throw new Error(`beat ${i} ("${b.event.slice(0, 40)}") at ${b.t.toFixed(2)}s `
      + `collides with beat ${i - 1} at ${BEATS[i - 1].t.toFixed(2)}s`);
});

/** seconds elapsed since beat n fired (negative before it) */
export const since = (t: number, n: number) => t - BEATS[n].t;
/** frames elapsed since beat n fired */
export const sinceF = (frame: number, n: number) => frame - BEATS[n].f;
/** time of beat n */
export const B = (n: number) => BEATS[n].t;

export const PHASE_START: Record<Phase, number> = (() => {
  const o = {} as Record<Phase, number>;
  for (const b of BEATS) if (!(b.phase in o)) o[b.phase] = b.t;
  return o;
})();

/* ── NAMED CUES ──────────────────────────────────────────────────────────────────────────────
   The handful of moments that the camera, the colour script and the sound design all have to
   agree about. They are derived from the beat map, never typed twice. */
export const CUE = {
  requestLaunch: B(1),
  requestLand: B(4),
  illusionPeak: B(8),
  approvePress: B(14),
  keypadRise: B(15),
  pinTaps: [B(19), B(20), B(21), B(22)] as const,
  commit: B(23),
  however: B(24),
  load: B(25),
  fold: B(26),
  preSnap: B(30),
  dotsBecomeMoney: B(31),
  snap: B(32),
  balanceRoll: B(33),
  absorb: B(34),
  /* ── the debit reveal, staged inside the hold after "account." ────────────────────────────
     The narration waits here (see narration.mjs, THE HOLD) so that the request card can leave,
     the transaction can land in the account's own history, and a shine can travel across it
     before the next sentence starts. Derived from the measured word, never typed as a constant. */
  /* The hold after "…leaves your account." The picture is cut INTO this gap — the card is flung,
     the debit lands, a sweep crosses it — and the next sentence was directed to wait for the sweep
     to finish. The offsets are tuned to that choreography, so they are kept as they are and only
     COMPRESSED if a read leaves less room than the 1.662s this was built on. A longer gap holds
     still at the end instead of playing the same moves more slowly. */
  ...(() => {
    const a = NARR.words[49].e, gap = NARR.words[50].s - a;
    const k = Math.min(1, gap / 1.662);
    return {
      cardDismiss: a + 0.15 * k,
      historyLand: a + 0.51 * k,
      shine: a + 0.78 * k,
      shineEnd: a + 1.53 * k,
    };
  })(),

  /* ── THE SELLER WAVE: a transition, not an effect ──────────────────────────────────────────
     It grows out of the listing already on screen, gains depth and density as it crosses, covers
     the frame completely for about a quarter of a second — and the scene underneath changes
     inside that cover — then keeps moving and uncovers what is now a different shot.
     Anchored so that FULL COVERAGE lands on the word "sellers". */
  waveSeed: wordAt(52),         // "common"  — the first, far, small ones bud off the listing
  waveBuild: wordAt(54),        // "for"     — the midground joins, density climbs
  waveNear: wordAt(58),         // "online"  — the near layer arrives, large and fast
  /* The wave is a physical crossing at a tuned speed, so its own choreography is FIXED relative to
     full coverage — 0.28s to start uncovering, 0.67s to be clear — not stretched between two words.
     Coverage wants to land on "sellers", but it must also be CLEAR before "anyone", because the
     request card returns on that word and it cannot return underneath the tiles. On the read this
     was built to, those two demands coincide to the millisecond; a reader who runs "sellers" and
     "anyone" closer together pulls the whole crossing fractionally earlier instead of colliding. */
  wavePeak: Math.min(wordAt(59) + 0.22, wordAt(60) - 0.69),
  waveOpen: Math.min(wordAt(59) + 0.22, wordAt(60) - 0.69) + 0.28,
  waveClear: Math.min(wordAt(59) + 0.22, wordAt(60) - 0.69) + 0.67,

  /* ── the crowd's realisation ───────────────────────────────────────────────────────────────
     ONE request appears, on the phone, and then the people react to it — eyes, head, hand to the
     chin, question mark. The reaction chain starts after the popup is on screen, never before,
     or they are reacting to something the viewer has not seen. */
  requestReturns: wordAt(60) + 0.06,   // "anyone"   the request lands, in the OLD composition
  crowdArrive: wordAt(60) + 0.30,      //            the people walk in and the shot opens out
  crowdAlert: wordAt(64),              // "basics"   only then do they react

  /* ── the rule, staged across two sentences ────────────────────────────────────────────────
     RECEIVE comes forward on the word "they" — the moment the sentence turns to what the parents
     personally do — and holds while it is being discussed. SEND does not exist until the last
     sentence begins, and then it is not a diagram: a PIN is entered on it and the payment goes
     through, which is the argument. */
  receiveForward: wordAt(81),   // "they"       (…know that THEY never need…)
  sendIn: wordAt(92),           // "If"         (IF a screen asks…)
  pinEntry: wordAt(94),         // "screen"     keys begin lighting
  pinDone: wordAt(98),          // "PIN,"       the fourth key
  paid: wordAt(101),             // "authorising" the tick
  moneyOut: wordAt(104),        // "leave"      the money goes

  pullBack: B(35),
  /* kept for the renderers that still address them */
  parcelMorph: B(38),
  marketRequest: B(41),
  widen: B(45),
  crowd: B(50),
  parentsIn: B(58),
  parentsFocal: B(60),
  ruleCard: B(63),
  ruleAssemble: B(65),
  shield: B(67),
  split: B(71),
  replay: B(74),
  noPin: wordAt(90),          // "receiving" — where NO PIN takes its emphasis
  pinLights: B(75),
} as const;
