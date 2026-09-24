/* FAKE e-CHALLAN MALWARE — the beat map.
 *
 * THE ONE RULE: no visual event in this film is placed at a wall-clock time. There is not a single
 * number of seconds in this file. Every beat is anchored to a MEASURED word (whisper word
 * timestamps, character-wise forced-aligned, onsets snapped to detected silence edges). Re-record
 * the narration, run one tool, and the whole film re-times itself semantically — because the
 * numbers move and the structure does not.
 *
 * WHY THE PLAN'S OWN TIMES ARE NOT USED — premortem F1. The plan's 111.0 s is a word-count
 * estimate at 171 wpm; the read measures 129.791 s at a natural 150. Taken literally the plan puts
 * the malware reveal at 57.5 s, where the narrator is still typing payment details. Every planned
 * event is kept and kept in order; only its anchor moves, onto the word whose meaning it
 * illustrates.
 *
 * ONE BEAT PER BLOCK. The plan's 222 half-second blocks are carried here one-for-one, each with
 * its PRIMARY SEMANTIC EVENT verbatim in intent, so that "no semantic beat was deleted" is an
 * auditable claim rather than an assurance. Block i is anchored to the first word of fragment i.
 *
 * WHAT A BEAT IS NOT: a beat may not SPAWN its subject (premortem F2c). Every event below is a
 * state change of something already on screen, and every block overlaps its neighbours — the
 * previous move is still settling for the first ~100 ms and the next is anticipating in the last
 * ~150 ms. Enforced after render by the seam metric.
 */
import narration from './narration.json';
import { FPS, at as wordIndexOf, wordAt } from './design';

export const NARR = narration as {
  duration: number; durationInFrames: number;
  words: { w: string; s: number; e: number }[];
  blocks: { i: number; text: string; start: number; end: number; until: number }[];
};

export const DURATION = NARR.durationInFrames;
export const BLOCKS = NARR.blocks;

/** the 14 phases of the plan, in order */
export type Phase =
  | 'hook' | 'apk' | 'barrier' | 'firstapp' | 'update' | 'secondinstall' | 'permissions'
  | 'hasty' | 'payment' | 'reveal' | 'theft' | 'recap' | 'prevention' | 'verify';

export const PHASE_OF: Phase[] = [];
const span = (p: Phase, a: number, b: number) => { for (let i = a; i <= b; i++) PHASE_OF[i] = p; };
span('hook', 0, 9);
span('apk', 10, 21);
span('barrier', 22, 44);
span('firstapp', 45, 55);
span('update', 56, 60);
span('secondinstall', 61, 71);
span('permissions', 72, 92);
span('hasty', 93, 101);
span('payment', 102, 110);
span('reveal', 111, 126);
span('theft', 127, 163);
span('recap', 164, 188);
span('prevention', 189, 201);
span('verify', 202, 217);

/** the plan's primary semantic event for every one of the 222 blocks, in order */
export const EVENT: string[] = [
  /* ── HOOK ──────────────────────────────────────────────────────────────────────────────── */
  'cold open on a phone already at ~62% of frame height, road moving underneath',
  'a message impulse appears just beyond the upper-right edge',
  'the impulse accelerates into the phone; it already carries a document silhouette and a fee cue',
  'the card LANDS: the heavy phone takes 3-4px, badge lags, shadow compresses, gaze moves',
  'the header resolves into an official traffic-notice identity; the sender stays generic',
  'a vehicle plate emerges inside the card',
  'the fine amount rolls into place; one digit settles a few frames after the others',
  'the chat context stays unmistakable: bubble tail and sender furniture around official styling',
  'the index finger begins entering from the bottom before the card has finished settling',
  'the attachment is already peeking into view, so the next sentence is discovery, not a reset',
  /* ── APK ───────────────────────────────────────────────────────────────────────────────── */
  'the card expands without a cut; the vehicle field takes the upper focal position',
  'plate characters assemble on mechanical spacing',
  'the amount steps back to secondary while the attachment slides up from the card foot',
  'the document hierarchy is readable: vehicle -> amount due -> attachment',
  'the file tile lifts 4-8px off the message plane; its shadow grows and softens',
  'the filename reveals left to right, holding ".apk" back',
  '".apk" takes a neutral high-legibility emphasis by contrast isolation, never a warning colour',
  'the glyph changes from paper-like to package-like as the viewer understands it can be installed',
  'the finger tracks toward the tile on a curved path and decelerates before contact',
  'background density drops ~30% so the filename wins the frame',
  'anticipation: the tile compresses fractionally; the phone tilts under 0.5deg into the finger',
  'the tap lands: the tile depresses, the chat plane compresses back, the system layer starts rising',
  /* ── BARRIER ───────────────────────────────────────────────────────────────────────────
     RE-ANCHORED. The plan places the installer, the progress rail and the icon dock inside this
     phase — but on the measured read those blocks are the words "from outside the Play Store",
     and the narration does not say "installs" until 23.6 s. Every planned event is KEPT and kept
     in order; the install events simply move onto the sentence that describes them. This is
     premortem F1's remedy applied: the anchor moves, the content does not. */
  'the finger is already descending; the tile is under it',
  'THE TAP: contact completes, the tile depresses, the chat plane compresses backward',
  'the tile releases and the Android layer starts rising from below',
  'the system surface rises, carrying the source app up with it',
  'the warning lands with medium-heavy physics; it is an icon, not an alarm',
  'the gaze moves from the package to the warning heading before the hand moves again',
  'the source relationship is explicit: the messenger feeds the blocked package path',
  'the restriction appears as a barrier between the source and the package',
  'the package physically STOPS against the barrier — blocked, not merely warned',
  'decorative traffic dims out; the barrier is the only lit thing in the world',
  'the package presses against the barrier and rebounds slightly; nothing gives',
  'the meaning is stated spatially: the route from outside the store is the closed one',
  'the settings surface offers the only route through the barrier',
  'the source row resolves — the messenger named, with its toggle',
  'the toggle is the single moving part; every other surface stays rigid',
  'the gaze passes over the warning without stopping on it',
  'the hand starts toward the control while the barrier is still visibly closed',
  'the warning stays lit and unread — the quietest indictment in the film',
  'the finger hovers; the system is waiting for an explicit choice and shows it',
  'anticipation: the toggle surface compresses before its state changes',
  'THE PRESS: the knob travels and green is confined to the gate it just opened',
  'the barrier unlocks with a small mechanical separation',
  'the package advances; the chassis absorbs about a pixel of recoil',
  /* ── FIRST APP ─────────────────────────────────────────────────────────────────────────
     The install now lives where the narration puts it: "The app installs, appears on your phone,
     and opens to what looks like an e-Challan service." */
  'the installer surface replaces the settings surface; the hand retracts and redirects',
  'the package travels a clean system rail; progress begins, quick then slow, hesitating at 90%',
  'an empty slot is prepared, and the package assembles into an app icon',
  'the icon docks; its neighbours shift 1-2px and settle independently of it',
  'the grid settles — the app is now part of the device, and the messenger is gone from behind',
  'the icon is carried forward by scaling toward camera; there is no cut here',
  'the scale completes and the icon becomes the header of the service',
  'the background straightens into institutional symmetry — this should feel SAFER, not scarier',
  'the vehicle panel arrives with restrained motion and precise alignment',
  'the amount rolls into place; the status chip appears only after the field has settled',
  'the seal aligns with no bounce at all; the shoulders lower; the tension visibly relaxes',
  /* ── UPDATE ────────────────────────────────────────────────────────────────────────────── */
  'the update panel rises from WITHIN the app, not from outside the phone',
  'the challan UI yields 2-3% of scale — it gives way spatially rather than bouncing',
  '"Install Update" resolves only after the panel lands, so the reveal of the words is clean',
  'the button takes a narrow amber rim; no danger colour yet',
  'the finger begins a curved approach and enters a short hover',
  /* ── SECOND INSTALL ────────────────────────────────────────────────────────────────────── */
  'the button is depressed: its shadow collapses, the panel shifts 1px, the chassis reacts last',
  'the button rebounds after the finger; the panel unfolds into a package handoff',
  'the first app stays visible AS A CONTAINER while a second package becomes apparent inside it',
  'the installer inserts itself between shell and payload — the OS is not bypassed',
  'the second package moves toward the gate; the first app stays parked above as visual memory',
  'the confirmation wording stays generic Android-like; no OEM is quoted',
  'the second install is confirmed; the gate opens and the payload passes deeper',
  'the payload is darker and more compact than the app — and is NOT labelled',
  'the rail fills; the payload descends one layer below the visible icon',
  'the first app returns to the foreground, preserving the illusion that this was an update',
  'the interface resurfaces while the payload stays faintly alive beneath it',
  /* ── PERMISSIONS ───────────────────────────────────────────────────────────────────────── */
  'the first runtime card rises over the app; SMS is the focal request',
  'the SMS subsystem stays LOCKED until Allow; the app remains behind as context',
  'Allow is tapped: the lock opens and a cyan route from the SMS store to the app core appears',
  'the card slides away; the route it opened stays alive behind it',
  'the call card replaces it; its handset silhouette is unmistakably not the SMS glyph',
  'Allow unlocks a violet call route; the SMS route continues at low amplitude',
  'the app is pushed behind other layers while its core keeps glowing — that IS persistence',
  'the foreground dims and shifts while the core persists; no invented universal popup',
  'a background-access settings surface briefly contextualises it without dominating',
  'the hidden glow continues after the visible window recedes, proving persistence',
  'the VPN request arrives as a SYSTEM-level connection card, shaped unlike the runtime cards',
  'the VPN anchor sets inside the device; an unformed route waits beyond the boundary',
  'OK is tapped; the anchor compresses and releases',
  'the tunnel grows elastically outward, tip accelerating, body stretching behind it',
  'the tip overshoots and settles; only now does anything move inside the tunnel',
  'all four consequences are visible at once, at controlled hierarchy',
  'the next prompt overlaps residual route motion, building pressure',
  'the finger intervals shorten; the gaze stops fully reading the prompts',
  'the internal network densifies while the focal card stays at full contrast',
  'the repeated Allow forms a rhythm without becoming a montage',
  'the device is visibly threaded by live routes — and the foreground still looks normal',
  /* ── HASTY ALLOW ───────────────────────────────────────────────────────────────────────── */
  'a rapid Allow begins with the prompt already in place; no re-establishing shot',
  'the prompt exits upward before the button has finished rebounding; the next enters from below',
  'the second tap runs a shorter hand arc — the finger never teleports',
  'the SMS route pulses once in response to the new system activity',
  'the third prompt arrives while the previous shadow is still settling',
  'the third tap has almost no hover; the routes behind stay alive',
  'the fourth completes; the prompts collapse and the service begins resurfacing',
  'the routes stay active below the foreground — the dramatic irony is established here',
  'the last card FOLDS into the first payment panel; the transition is the card itself',
  /* ── PAYMENT ───────────────────────────────────────────────────────────────────────────── */
  'the payment form is already open; the infrastructure stays beneath it',
  'the amount MATCHES the original notice — continuity is what earns trust',
  'the card field takes focus; the caret blinks on a calm, predictable beat',
  'entry begins; each press has a precise tactile response and a small caret move',
  'digits populate without flourish — seriousness requires restraint',
  'beneath the opaque form, the granted routes keep moving at very low contrast',
  'the finger approaches Pay; background motion deliberately calms further',
  'the button compresses; the spinner starts on a stable, reassuring rhythm',
  'the tick DRAWS and the false resolution HOLDS — this calm is what the reveal reopens',
  /* ── REVEAL ────────────────────────────────────────────────────────────────────────────── */
  'the confirmation holds; attention leaves the phone and nothing hostile has happened',
  'the ambient layer thins — the only thing moving is the current under the glass',
  'the tick is the calm the reveal has to reopen, so it is left completely alone',
  'the false resolution is allowed to be believed for one more beat',
  'the turn: the confirmation RING lets go',
  'and it opens — the reassurance is the way down into the city',
  'we are through the glass; the office stands exactly where it was',
  'the camera names its subject and starts walking at the portal',
  'the lit lobby is still a lit lobby; nothing about it has changed yet',
  'the threshold — the doorway grows because we are approaching it, and swallows the frame',
  'INSIDE: one hollow volume, plinth to roof, and the app\'s own courier parked in it',
  'the four "occupied storeys" are four bare bulbs behind a facade one panel thick',
  'the camera rises the full height of the shell, up its service shaft',
  'the shaft is the only lit thing in the building, and it is the way out',
  'out through the shaft mouth, the same device the portal used, reversed',
  'ON THE ROOF: antenna, hoist, line tap, eye and dish pulse ONCE, as one body',
  /* ── THEFT ─────────────────────────────────────────────────────────────────────────────── */
  'the head sends one carrier straight up, and we go back through the glass with it',
  'the app\'s screens, as the physical deck they always were',
  'and the details are exactly where the victim typed them: the second pane down',
  'the fan begins to open, pivoting on the form rather than on the top card',
  'the confirmation is dealt off the top — it is only the top card',
  'four identical app headers stack up: the app drew every one of these',
  '"screens" is plural, and the deck is what makes it literal',
  'the three fields are the only thing left in focus',
  'a card, an expiry and a holder lift out, and the fields are left empty',
  'they are DRAWN down, accelerating: nothing about this is a drop',
  'into the machine\'s head — typed into the app\'s own form, so this was handed over',
  'the feeders REVERSE: every bead that ran head-to-machine now runs the other way',
  'the camera finds the mail hoist, already running, with nobody at it',
  '"already" is told by building nothing: it has been there since the grant',
  'no new machine, no new route, no new permission',
  'the breach the SMS grant opened is still open, and still theirs',
  'the camera moves to the sorting hall',
  'an ordinary message comes in over the skyline, with an ordinary chime',
  'it lands in the posting slot — the thing "access your SMS" opened',
  'a DUPLICATE peels out through the breach; the original does not move',
  'the original goes on into the building: the victim still gets their message',
  'the copy starts for the app, and there is no hand anywhere in the frame',
  '"automatically" is drawn as absence: the first transfer that needs no finger',
  'it rides the hoist\'s own tower and transfers onto the feeder, the wrong way up it',
  'it reaches the antenna\'s head, where the card details already are',
  'out along the VPN feeder to the dish, and the dish transmits',
  'the camera follows the beam out of the world, through a stretch of nothing',
  'the far end: its own ground, its own violet night, never in frame with the city',
  'a hall of racks with a dish on it, and two more behind it — you are one job among many',
  'the credentials dock in a CARD slot',
  'they stay a card, and they stay separate',
  'the code arrives separately and docks in a LETTER slot: shape carries the distinction',
  'the two sit side by side, still distinct',
  '"both ... and ..." is two objects in two slots, not one merged stream',
  'the two halves are made into ONE KEY — forged by the attacker out of what was given',
  'it is turned in a mechanical lock, and the console accepts with a card machine\'s beep',
  'the counter goes up by one, to 4107, and a line runs back toward the city',
  /* ── RECAP ─────────────────────────────────────────────────────────────────────────────── */
  'the original message is pulled out of memory and docked as step 1',
  'the attachment follows, keeping its exact silhouette and filename',
  'the unknown-source gate folds in as step 2, with the remembered toggle on it',
  'the first installed icon docks as step 3',
  'the fake service collapses into a small trustworthy shell node',
  'the Install Update control detaches and becomes the next node',
  'the payload drops beneath the update node, making the dropper relationship explicit',
  'the SMS permission docks, its route still connected',
  'the call permission docks next, with its own colour',
  'the persistence symbol docks without inventing a universal wording',
  'the tunnel contracts into a concise route symbol and docks',
  'the payment form folds into a card-shaped node',
  'credential packets detach from the payment node toward the core',
  'the OTP docks separately and then creates its duplicate route',
  'the two paths converge only at the endpoint',
  'causal flow animates through every earlier action in sequence',
  'every node uses the ORIGINAL asset, miniaturised — recognition is the payoff',
  '"you install the malware" is traced across the install nodes by the victim-driven taps',
  '"approve its access" illuminates the permission nodes in the order they were granted',
  '"hand over the information" illuminates the payment fields and the duplication',
  'the endpoint stays passive until every user-enabled path has reached it',
  'only then does it activate — capability was assembled step by step',
  'the character presence reduces; this section is comprehension, not acting',
  'the ground goes clean and quiet with generous negative space around the chain',
  'the very first node is isolated, so prevention can target the earliest break point',
  /* ── PREVENTION ────────────────────────────────────────────────────────────────────────── */
  'the original message returns to full size out of the first node',
  'the attachment stays visible; every later node fades to a faint ghost path behind it',
  'the first stroke of a restrained X is drawn across the attachment; the tile shifts under it',
  'the second stroke completes; tile and shadow settle separately',
  'the legitimate route is shown opposite as a clean browser path with no installable file',
  'authority comes from a verified route and independent navigation, not from a pile of logos',
  '"a message sends you a file" is set against "you open the portal yourself"',
  'the ghost path retracts backward: endpoint -> code -> permissions -> update -> package',
  'each retracted segment loses its colour, disabling the chain at its source',
  'the attachment stays crossed out and stationary while the safe route gains prominence',
  'the finger approaches the phone and deliberately moves AWAY from the attachment',
  'it redirects toward the browser — the behavioural reversal IS the lesson',
  'that redirected motion carries directly into the final scene',
  /* ── VERIFY ────────────────────────────────────────────────────────────────────────────── */
  'the browser grows out of the redirected path; the message moves into the background',
  'the user navigates to an official portal rather than following anything they were sent',
  'the portal lands with heavy, stable motion — less bounce than any messaging surface',
  'the lookup field appears, reusing the SAME vehicle number for continuity',
  'the challan is looked up independently: no package, no gate, no permission prompt',
  'a simple verified result appears with a calm confirmation',
  'the state-police route appears as a secondary option, not a competing focal card',
  'the suspicious message stays tiny in the background with its attachment crossed out',
  'a clean two-path comparison: the received route collapsed, the independent route open',
  'the camera settles; the road world returns to orderly motion',
  'the score resolves; the network ambience disappears',
  'the final advice takes negative space rather than a glow',
  'the verified route gives one restrained confirmation pulse',
  'all secondary motion halves so the practical action is what is remembered',
  'the behaviour is held long enough to be read at phone size',
  'the last frame is a poster: the message small behind, independent verification in front',
];

if (EVENT.length !== 218) throw new Error(`EVENT has ${EVENT.length} entries, the script has 218`);
if (BLOCKS.length !== 218) throw new Error(`narration has ${BLOCKS.length} blocks, expected 218`);
if (PHASE_OF.length !== 218 || PHASE_OF.some((p) => !p))
  throw new Error('every block must belong to exactly one phase');

export type Beat = {
  i: number; phase: Phase; t: number; f: number; until: number; text: string; event: string;
};
export const BEATS: Beat[] = BLOCKS.map((b, i) => ({
  i, phase: PHASE_OF[i], t: b.start, f: Math.round(b.start * FPS), until: b.until,
  text: b.text, event: EVENT[i],
}));

/* monotonic: two primary focal events must never fire on the same frame, or the "exactly one
   focal point at any instant" rule is broken at the moment it matters most */
BEATS.forEach((b, i) => {
  if (i && b.t <= BEATS[i - 1].t)
    throw new Error(`block ${i} ("${b.text}") at ${b.t} collides with block ${i - 1}`);
});

/** time of block i */
export const B = (i: number) => BEATS[i].t;

/** THE START OF ONE MEASURED WORD INSIDE A BLOCK.
 *
 *  Every beat in this film is an offset from a measured word, never a wall-clock time — but the
 *  offsets are taken from BLOCKS, and a block can hold two words. Where the direction is "this
 *  happens ON that word" the block start is the wrong anchor: the app's screens turn over on
 *  "details", and block 128 is "financial details", so anchoring to the block fired it 0.75 s
 *  early, on "financial". This finds the word itself, so the beat still moves by itself when the
 *  read is re-measured or replaced with a recorded one. */
const wordIn = (i: number, word: string) => {
  const b = BEATS[i];
  const norm = (s: string) => s.replace(/[^A-Za-z0-9’']/g, '').toLowerCase();
  const hit = NARR.words.find((w) => w.s >= b.t - 1e-3 && w.s < b.until + 1e-3
    && norm(w.w) === norm(word));
  if (!hit) throw new Error(`block ${i} ("${b.text}") has no word "${word}"`);
  return hit;
};
export const W = (i: number, word: string) => wordIn(i, word).s;
/** when a word FINISHES. A beat that has to coincide with the narrator naming something wants the
 *  end of the word, not a fixed offset from a block: a block can be a word long or four, and once
 *  the designed holds inside the permission sentence were removed, `B(79) + 0.50` stopped landing
 *  on "SMS," and started landing on "your phone calls" two words later. */
export const WEnd = (i: number, word: string) => wordIn(i, word).e;
/** seconds elapsed since block i began (negative before) */
export const since = (t: number, i: number) => t - BEATS[i].t;
/** the window a block owns, [start, until) */
export const owns = (t: number, i: number) => t >= BEATS[i].t && t < BEATS[i].until;

export const PHASE_START = {} as Record<Phase, number>;
export const PHASE_END = {} as Record<Phase, number>;
for (const b of BEATS) {
  if (!(b.phase in PHASE_START)) PHASE_START[b.phase] = b.t;
  PHASE_END[b.phase] = b.until;
}

/* A MOVE THAT LANDS ON ITS BEAT.
 * Everything is anchored to measured words, so a slower read spreads the film out on its own.
 * That is right for a camera drift and wrong for anything with mass: a card crossing the frame, a
 * shell coming off, a hand reaching a button. If those interpolate across a growing gap they get
 * slower as the gap grows, which is the one thing a physical move must never do.
 * The beat says WHEN it lands; `max` says how long it takes. Inert on this read, a speed floor on
 * every slower one. */
export const paced = (start: number, end: number, max: number) => {
  const s = Math.min(end - start, max);
  return { from: end - s, span: Math.max(0.001, s) };
};

/* ── NAMED CUES ──────────────────────────────────────────────────────────────────────────────
   The handful of moments the camera, the colour script and the sound design all have to agree
   about. Derived from the beat map or from a word, never typed twice as a constant. */
const w = (phrase: string, from = 0) => wordAt(wordIndexOf(phrase, from));

export const CUE = {
  /* hook */
  cardArrive: B(1),
  cardLand: B(3),
  plateSet: B(5),
  amountRoll: B(6),
  /* the attachment */
  tileLift: B(14),
  nameReveal: B(15),
  extEmphasis: B(16),
  glyphBecomesPackage: B(17),
  /* the barrier — four gates, four surfaces, never merged (premortem F4) */
  apkTap: B(23),
  systemRise: B(24),
  warningLands: B(26),
  sourceShown: B(28),
  barrierSet: B(29),
  packageBlocked: B(30),
  toggleIn: B(34),
  toggleHover: B(40),
  togglePress: B(42),
  barrierOpens: B(43),
  /* the install, on the sentence that describes it */
  installerIn: B(45),
  installProgress: B(46),
  iconAssembles: B(47),
  iconDocks: B(48),
  iconForward: B(50),
  appOpens: B(51),
  /* the update, and the second install — anchored on the words that describe them.
     RE-ANCHORED when the sentence became "Then when you proceed to pay, it asks you to install an
     update first": the demand is now a consequence of pressing PAY, so the panel may not rise on
     "Then" — it rises on "it asks". */
  updateRise: B(60),        // "it asks"              the panel rises from within the app
  updateWords: B(62),       // "install"              the words resolve after the panel lands
  updatePress: B(66),       // "that"                 THE PRESS
  payloadAppears: B(67),    // "too,"                 a second package becomes apparent inside
  installer2: B(68),        // "and"                  the OS inserts itself; it is not bypassed
  confirm2: B(69),          // "the"                  the second confirmation
  payloadDescends: B(69),   // "and"                  it goes one layer below the visible icon
  payloadLands: B(70),      // "the update"           it settles in the chamber, and stays alive
  appResurfaces: B(71),     // "installs."            the service returns, illusion intact
  /* permissions — each grant leaves a permanent consequence, and nothing is active before it is
     granted. Anchored so every Allow lands ON the word that names the capability. */
  smsCard: B(75),           // "asking for"      the first runtime card rises over the app
  smsGrant: B(79) + 0.42,   // "SMS,"            the tap, on the word
  callCard: B(80),          // "your phone"
  callGrant: B(81) + 0.34,  // "calls,"
  bgConcept: B(82),         // "permission to"   NOT a popup — a settings surface and persistence
  bgGrant: B(86) + 0.30,    // "background,"
  vpnCard: B(88),           // "permission"      a SYSTEM-level card, shaped unlike the others
  vpnGrant: B(91) + 0.20,   // "a VPN"
  tunnelGrows: B(91) + 0.34,
  tunnelSettles: B(92),     // "connection."
  allFour: B(92) + 0.30,
  /* hasty — the narration's "on everything" is a characterisation of the behaviour, so this
     phase adds NO new capability. The topology becomes the subject, and a short tail of generic
     prompts is dispatched on shortening intervals: habit has replaced judgement (addendum §47). */
  hastyStart: B(93),
  hastyTaps: [B(94) + 0.15, B(96) + 0.10, B(98) + 0.05] as const,
  hastyEnd: B(99),
  irony: B(100),
  foldToPayment: B(101),
  /* payment — the calmest stretch in the film (premortem F6). The false ending lives inside the
     0.82 s hold after "fine.", which is why that hold exists (F7). */
  formFocus: B(102),          // "You"      the form is open and takes focus
  typing: B(103),             // "enter"
  payPress: B(110) + 0.18,    // inside the hold after "fine."
  spinner: B(110) + 0.34,
  tickDraws: B(110) + 0.62,
  successLands: B(110) + 0.95,
  falseEnd: B(110) + 1.25,    // the loop CLOSES here. The reveal has something to reopen.
  /* the reveal — the semantic peak. The turn is ON the word "but". */
  thin: B(112),               // "think you\u2019ve"   the ambient layer thins; nothing hostile yet
  seamsCatch: B(114),         // "your challan,"   the join becomes visible before it gives way
  shellOpens: B(115),         // "but"             THE TURN
  push: B(116),               // "in reality,"     one small push; there is no horror zoom
  payloadExposed: B(118),     // "first app"       revealed as a CONTAINER
  drain: B(119),              // "was"             green leaves first, through neutral
  dropperShown: B(121),       // "dropper, and"
  routesBend: B(123),         // "subsequent \u201Cupdate\u201D"
  coreTurns: B(125),          // "the actual"      the FIRST justified danger colour in the film
  allPathsTerminate: B(126),  // "malware."
  /* theft — the longest phase in the film, and the most precisely staged. premortem F8: the
     original OTP never leaves the inbox, and credentials and codes stay distinct until the
     endpoint. Every beat sits on the clause that describes it. */
  fieldsReturn: B(127),      // "The"                 the entered fields return as objects
  credDetach: B(130),        // "enter into"          fragments detach from the form
  credToCore: B(135),        // "be stolen"           they route to the payload
  credInCore: B(137),        // "the malware,"        ...by the malware. They rest in the core.
  smsNamed: B(144),          // "your SMS,"           the route granted at 45s lights on its own
  otpArrives: B(146),        // "incoming OTPs"       normal styling, ordinary ping
  duplicate: B(148),         // "be automatically"    a COPY is made; the original does not move
  exfil: B(149),             // "forwarded"           both leave, on separate lanes
  serverReceives: B(152),    // "server"
  pullBack: B(153),          // "\u2014 giving"           the whole path readable in one frame
  credHighlight: B(156),     // "credentials"
  codeHighlight: B(159),     // "codes"
  bothPresent: B(160),       // "needed to"           the two halves, side by side
  capability: B(162),        // "out unauthorised"    an account node becoming enabled
  /* recap — the film's own earlier assets, miniaturised and docked as a causal chain. The payoff
     is RECOGNITION, so every node is the original object, not a replacement icon. */
  chainStarts: B(164),        // "So"
  chainNodes: [
    B(165), B(167), B(169), B(170), B(171), B(172), B(173), B(174), B(175), B(176), B(177),
  ] as const,
  chainFlows: B(178),         // "approve its"   the causal flow runs through what was granted
  installTrace: B(176),       // "install the"   victim-driven taps traced across the install nodes
  accessTrace: B(178),        // "approve its"
  handoverTrace: B(181),      // "hand over"
  endpointWakes: B(185),      // "needs to"      only after every user-enabled path has reached it
  chainEnds: B(188),          // "attack."
  /* prevention — the behavioural reversal, not a warning card */
  messageReturns: B(189),     // "Please"
  xStroke1: B(195),           // "not"
  xStroke2: B(196),           // "require you"
  safeRouteShown: B(198),     // "install an"
  ghostRetracts: B(199),      // "APK"
  fingerRedirects: B(201),    // "WhatsApp."     the finger starts toward it and turns away
  /* verification — the replacement behaviour, and the memory image */
  browserGrows: B(202),       // "If"
  portalLands: B(205),        // "challan message,"
  lookup: B(207),             // "it yourself"
  verified: B(210),           // "e-Challan"
  stateRoute: B(213),         // "state"
  settle: B(215),             // "website"
  lastFrame: B(217),          // "it."

  /* the three designed holds, as windows the picture is cut INTO (premortem F7) */
  holdUpdate: { a: w('service.') , b: w('Then when you') },
  holdFalseEnd: { a: w('fine.'), b: w('You think') },
  holdReveal: { a: w('malware.'), b: w('The financial details') },
} as const;
