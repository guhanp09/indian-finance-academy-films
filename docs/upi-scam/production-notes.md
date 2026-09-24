# UPI Scam 1 — production notes

9:16 · 1080×1920 · 60 fps · **50.217 s (3013 frames)** — the film plus the approved channel
sign-off · H.264 / yuv420p · AAC 48 kHz stereo · −14.3 LUFS, true peak −2.5 dBFS
Narration: **recorded**, two parts joined with the hold (`tools/upi-scam/voice.mjs`)
Master: `out/upi-scam-1.mp4` (one deliverable; the separate no-card cut is retired)

---

## 1. The rule that governs everything

**No visual event is placed at a wall-clock time.** Every one of the 78 beats is anchored to a
word index in `src/upi-scam/narration.json`, whose start time was measured. Re-record the voice, run
`tools/upi-scam/narration.mjs`, and the film re-times itself semantically — the numbers move, the
structure does not.

See `premortem.md` F1 for why the storyboard's own times could not be used.

## 2. Pipeline

```
tools/upi-scam/fragments.mjs    the locked script + its 68 fragments; assertScript() proves they
                           reconstruct the script character-for-character
tools/upi-scam/narration.mjs    say -> atempo -> pad -> whisper word timestamps -> character-wise
                           forced alignment -> silence-detector onset refinement
                           => src/upi-scam/narration.json, public/Audio/upi-narration.{wav,mp3}
tools/upi-scam/dump-cues.ts     exports the beat map so the sound design reads the same numbers
tools/upi-scam/score.mjs        synthesises every SFX and the score from scratch, mixes with the
                           music side-chained to the voice => public/Audio/upi-mix.m4a
tools/upi-scam/shot.mjs         frame grabber + contact strips for inspection
tools/upi-scam/qa.mjs           post-render gates (below)
```

Re-run order after any narration change:
`narration.mjs` → `dump-cues.ts` → `score.mjs` → `remotion render` → `qa.mjs`.

## 3. The world

| file | what it owns |
|---|---|
| `design.ts` | the palette and its narrative phases, six spring classes, one light direction, the layout bands, the type scale, the seeded PRNG, the one colour mixer |
| `world/Backdrop.tsx` | the network — a low-volume narrator on one canvas, one draw call per frame |
| `world/Ledger.tsx` | YOU left, THEM right, the elastic flow between them, the inbound illusion, the four hero tokens, the odometer |
| `world/Phone.tsx` | one phone for the whole film: app bar, home screen, request card (three episodes), Approve, keypad, PIN dots, the hand |
| `world/Figures.tsx` | the staggered human rig, the seller's arc, the crowd, the parents |
| `world/Market.tsx` | the parcel that becomes a listing, the peripheral listings, the chat bubble |
| `world/Rule.tsx` | the rule card that grows into the final comparison |
| `Subtitles.tsx` | phrase-advancing captions in a reserved band |

**Two registers.** `LEDGER` (y 120–430) is what is actually happening; `PHONE` (y 470–1430) is what
the victim sees. They are physically linked: the PIN dots leave the phone and become the tokens
that travel the ledger. That is why the reveal lands in both at once.

**One of everything.** One phone, one flow arrow, one card, one rule object. The seller holds the
phone, the marketplace assembles around it, the crowd shrinks it to one instance among many, and
the parents take the same device. Nothing is destroyed and rebuilt.

## 4. Screen geography — never broken

```
YOU / seller / account ........ left        THEM / buyer / scammer ....... right
false incoming ................ RIGHT -> LEFT
actual debit .................. LEFT  -> RIGHT
```

Both final panels put the user on their own left and the world on their right, so RECEIVE still
flows toward its user and SEND still flows away. (premortem F14)

## 5. The reversal — three staged events, not one

| at | word | what happens |
|---|---|---|
| 12.25 s | *however,* | stimulation drops: particles thin to 15%, the network stops advancing, the camera decelerates, the music falls 13 dB. The arrow keeps loading — the one thing still moving. |
| 12.62 s | *(silence)* | the arrow compresses lengthwise, storing energy |
| 13.01 s | *instead* | it folds through its own tail; the head starts to cross; green → yellow |
| 13.64 s | *you* | the card morphs PAYMENT INCOMING → PAYING buyer@upi; yellow → amber |
| 13.84 s | *getting* | the amount takes a minus; the chevron hardens into a barb |
| 14.12 s | *paid,* | amber → orange; the phone recoils |
| 14.58 s | *(breath)* | the frame inhales |
| 14.79 s | *money* | the four PIN dots detach and become rupee tokens |
| **15.20 s** | **leaves** | **SNAP** — outward, red, left to right. The loudest audiovisual moment in the film. |
| 15.56 s | *your* | the balance rolls down mechanically; the account node contracts |
| 15.88 s | *account.* | the scammer node absorbs the tokens one at a time; the seller slumps, late |

Five redundant channels carry it, so it survives greyscale and a muted viewing: direction, head
shape, the sign on the amount, the balance, and final position. Colour is the fifth.

## 6. Sound

Everything is synthesised in `tools/upi-scam/synth.mjs` — no sample libraries, so the bed is original
and two runs are bit-identical. Mass sets centre frequency, speed sets transient sharpness,
elasticity buys a tension glide, distance removes top end, direction is a gentle stereo move that
is never load-bearing.

25 hard-sync hits in the whole film, in four composed groups plus singles. The density cap
(one distinct sonic event per 450 ms) is **enforced** by `score.mjs`, which throws.

Mastering is measure-then-static-gain, not single-pass `loudnorm` — see premortem finding 6.
Final: −13.0 LUFS, true peak −0.3 dBFS.

## 7. QA gates (`node tools/upi-scam/qa.mjs`)

| gate | threshold |
|---|---|
| blank | zero frames with mean < 6 or stdev < 4 |
| seam | no per-frame luminance delta above 9× median, except designed impacts listed by name |
| stillness | no near-static run longer than 48 frames (0.8 s) |
| safe zone | < 5% of frames with detailed content in the bottom 180 px |
| container | 1080×1920, 60 fps, h264, yuv420p, audio present, duration within 80 ms |

It also writes `qa-upi/grey_reversal.png`, `qa-upi/phone_sheet.png` and
`qa-upi/phone_sheet_grey.png` — the greyscale sheet is the mute test.

## 8. What a real VO changes

Only `narration.json`. Replace the `say` synthesis in `tools/upi-scam/narration.mjs` with the recorded
file, keep the forced alignment, re-run the pipeline. Every beat, every camera move, every SFX
placement and the whole music arc follow the new word positions automatically, because none of
them is a constant.


---

# Revision 2 — review notes, implemented

## R1 · The debit had nowhere to land

The account's payment history was showing the debit while the request card sat on top of it, so
the one piece of evidence the sentence is about was obstructed. Fixed as a staged sequence, and
**the narration now waits for it**: `tools/upi-scam/narration.mjs` inserts a measured 1.20 s hold at one
word boundary (after "account."), which opens a 1.68 s gap. Not one word of the script changes —
the read simply waits, and every downstream number re-derives from the new measurement.

| at | what |
|---|---|
| 16.42 s | the request card is **flung** — 20 px of anticipation, then cubic acceleration downward with rotation, gone in 0.44 s. It does not fade. |
| 16.78 s | the debit lands in the history on its own plate, pushing the list down |
| 17.05 s | a specular **shine** travels left→right across that row, 0.78 s |
| 17.80 s | the shine ends; the next sentence begins at 17.95 s |

Sound follows the same physics: the fling pitches *down* as it accelerates away; the record is the
driest sound in the film; the shine is barely there. The device is also at its largest of the whole
film here (stage 1.06, camera 1.03) because the screen is the only thing that matters.

Cards now leave and arrive physically for the rest of the film — dismissed downward, re-arriving
from the same edge on the medium-class spring. The old content cross-slide is gone.

## R2 · "Online sellers" failed the mute test

A camera pull-back does not say "online sellers". The listing the parcel became now **multiplies**:
twelve tiles fly out of it — a seller's head over their own listing, the thing they are selling, a
price, and on more than half of them a green ₹ request already waiting — fill the frame, and then
sweep right-to-left off the left edge. Three of them are born from the three peripheral listings
rather than from the parcel, so nothing on screen is discarded to build the field.

The sweep **is** the transition: what is behind the tiles when they go is the crowd of the next
sentence. The parcel's rest position moved to the right of frame so the field has somewhere to
come from.

## R3 · "Anyone can fall for it" now happens in front of the viewer

The request badges used to be sitting there already. Now, per person and staggered 0.44 s apart:
the popup **lands** (with its own notification) → the eyes go to it (+90 ms) → the head tilts
(+180 ms) → **the hand comes up to the chin** and rubs (+300 ms) → the question mark pops last
(+620 ms), because it is the conclusion rather than the reflex. The person who receives money
safely never strokes their chin — the differentiation is the argument.

The crowd is also larger, higher in frame, and now in place *before* the tiles clear, so the sweep
reveals them instead of cutting to them.

## R4 · The phone was too small where it was the subject

Stage scale raised where the device is the sole focal object: **1.06** through the debit reveal
(was shrinking through it), **0.94** into the marketplace, **0.72** under the crowd, **1.00** for
the parents (was 0.88), and it now holds full size until the rule card has started becoming the
full-frame panel rather than shrinking while it is still being read.

## R5 · The mark on the DECLINE button

Not a rendering fault — the parcel-listing's absorption path ran diagonally across the frame and
passed directly over the focal card. Listings and the parcel now contract **in place** and hand
off to the tile field, so nothing crosses the phone.

## R6 · Subtitles

Rebuilt in the channel's long-form caption style, importing the same shared
`buildCaptionPages`/`mergeAdjoiningTokens` so the paging behaves identically rather than
approximately: sentence pages, split at commas and clause starts, capped by duration. No plate,
bottom-anchored, condensed and heavy, off-white with a hard dark stroke, and the spoken word lifts
into the film's yellow at 1.16× with a 72 ms attack and an 86 ms release.

Two 9:16 adaptations: the type steps down a size sooner (1080 wide, not 1920), and an **em-dash
split** was added — sentence 1 has no comma and no clause start, so the shared module returned it
as a single 8.5 s page, and splitting it on a pause broke it across "a UPI | request". Ten pages
became eight, every one a clause.

## R7 · The score was cut off

It was still playing at full strength when the file ended. The bed now has a resolution section
after the last word and a silent section before the end, the closing chord rings for 3 s instead
of 1.9 s, and there are explicit fades on both the music and the final mix. Measured tail:
−15.5 dB → −20 → −39.6 → −47.6 → −63.3 dB, ending in digital silence with no click.

## What this revision did NOT change

The script, the visual concept, the beat map's structure and indices (a guard now throws if the
beat count changes, because every renderer addresses beats by index), the reversal, the colour
script, the directional law, the physics classes, or the QA gates. Two SFX were removed —
`widen` and `crowd` — because the sweep and the four request landings now sonify those exact
events, and keeping them would have been two sounds describing one thing.


---

# Revision 3 — review notes, implemented

## R8 · The ₹3,200 request came back at the wrong time

It was returning at 18.0 s, during the online-seller sentence, which was never asked for. It now
returns on the word **"anyone"** (21.78 s) and it is the **stimulus for the crowd**: the card lands
first, and only then does anyone move. Reaction order per person, staggered 0.38 s apart, starting
0.32 s after the card is readable — popup on their own phone → eyes → head → hand to the chin →
question mark. Nobody reacts to something the viewer has not been shown.

## R9 · The seller wave is now a transition, not a field

Three depth layers, each entering at its own moment so the wave *builds*: a far layer that buds
off the listing already on screen (0.46 scale, −430 px/s), a midground (0.92, −880), and a near
layer that arrives on "online" (3.15, −1560) and swells as it passes the lens. Trajectories are
defined by where each tile IS at the peak plus velocity × time, so nothing is born or killed on
screen — objects simply pass.

At **21.02 s, on the word "sellers", the frame is 100 % occupied by sellers, and the scene changes
inside that cover**: the phone's scale and position, the camera, and the seller figure all jump to
their next-scene values across two keyframes 0.04 s apart. Verified by rendering both sides of the
cut — neither frame shows one pixel of anything but tiles.

Each tile is person + phone + listing + product + price. The far layer drops the phone and the
label (at 0.46 scale they would be noise), and sits back into the ground by colour rather than by
opacity.

One fix this exposed: `SellerWave` was drawn inside the foreground layer, so the seller figure
painted **over** the cover and the cut was visible through him. The wave is the nearest object to
camera and is now its own final layer.

## R10 · The rule arrives in two moves

| at | word | what |
|---|---|---|
| 29.08 s | *let* | the card slides between finger and Approve, assembles RECEIVE → NO PIN |
| 32.34 s | *to* (…pin **to** "receive" money) | it leaves the phone's plane and comes **forward** — centred, large, with a swell as it approaches the lens. RECEIVE alone, because that is what is being discussed. |
| 33.60 s | *only* (**only** to send it) | SEND arrives from the right — the direction its own money travels — and RECEIVE steps left into the comparison |

The device now goes fully behind the panel it produced, rather than leaving an app bar above the
film's conclusion.

## R11 · One deliverable

The end card is approved, so `UpiScam1` includes it and the separate cut is gone. The QA gates were
scoped accordingly: the sign-off is *allowed* to hold still (2.95 s) and to fade out — applying the
film's motion rules to a logo card would be asking a sign-off to animate.

## Mastering bug found while doing this

`alimiter` defaults to `level=enabled`, which normalises its output straight back to 0 dBFS — so the
`limit` was setting a ceiling and the filter was immediately undoing it. The mix had been sitting at
0.0 dBFS true peak with 12,613 samples hard-clipped. Explicitly disabled; now −14.2 LUFS,
true peak −2.6 dBFS, sample peak −2.85 dBFS.


---

# Revision 4 — review notes, implemented

## R12 · Script — the ending

The final sentence was replaced. Everything before it is untouched, and the change re-times the
whole film automatically because no beat is a constant.

> …If your parents use UPI, **let them know that they never need to enter their UPI PIN when
> receiving money. If a screen asks for their PIN, they are authorising money to leave their
> account.**

*Judgement call recorded:* the replacement was given starting at a capitalised "Let", but
"let them know" needs an antecedent — without "If your parents use UPI," the word *them* refers to
nobody, and the whole parents sequence loses its subject. So that clause is kept as the lead-in and
the two new sentences follow it. Film runs 35.967 s → **39.850 s**.

## R13 · RECEIVE comes forward on "they"

Moved from *"…pin **to** 'receive' money"* to *"…know that **they** never need…"* — word 79,
29.72 s. It leaves the phone's plane there and is at full size well before the sentence names what
it is about.

## R14 · The last sentence is demonstrated, not diagrammed

| at | words | what |
|---|---|---|
| 33.60 s | *If* | SEND arrives from the right; RECEIVE steps left |
| 33.98–35.24 s | *a screen asks for their PIN* | four keys light in sequence and four dots fill — **no hand**, because the sentence is about what a screen asks for, not who is holding it. The taps are the same four-tap family as the victim's PIN in act two, deliberately: the viewer has heard this exact sound before. |
| 36.30 s | *they are authorising* | the keypad collapses and the **success tick draws** — ring, then check — with the two-note rising tone a real payment makes |
| 37.50 s | *money to leave their account* | three red ₹ tokens leave along the SEND arrow toward THEM |

The tick is green, because that is what the app shows. The money leaving a beat later is red.
That contradiction is the sentence. Both halves now share the same 3×4 keypad object at the same
scale and the same height in their panel — the comparison only works if the thing crossed out on
the left is visibly the thing being typed on the right.

## R15 · The wave: nothing appears, nothing disappears

The previous version gated each layer on **time**, so a third of the near layer switched on already
half-way into frame — which is precisely what "a wave materialises out of nowhere" looks like. Now
a tile's entire life is `x = peak + (t − peak)·v`, the **only** visibility test is position, and the
layer speeds (760 / 1120 / 1620 px/s) are chosen so every tile is still past x = 1900 when the
sentence starts. They enter by travelling and leave by travelling.

The listings already on screen **join the flow**: the parcel-listing and the three peripheral
listings start moving left at the far layer's speed at `waveSeed` and leave with it, instead of
contracting or fading. The wave is not laid over this shot — it is this shot leaving.

## R16 · The tiles are sellers, not SIM cards

A white card with a coloured rectangle and a dark chip reads as a SIM. Each tile is now a
**person** — head, shoulders, a phone in their hand with the same request already on it — beside a
**parcel** with tape and a shipping label, a price, and AVAILABLE/SOLD. Everything sits inside the
card bounds, so a tile overlapped by its neighbour still shows a whole seller. The near layer went
from 14 tiles at 3.15× (four giant parcels filling the frame) to **24 at 1.55×** — a crowd.

## R17 · The transition is now something the viewer watches

The hidden cut is **gone**. The wave passes, and when it has passed we are in the same shot we were
in before it — same phone, same size, same place. Then, over 1.2 s while the narration says
*"unfamiliar with the basics of"*, the change happens on camera:

* the camera leans **into** the wave as it crosses (near objects passing the lens pull the frame
  with them), settles back into the shot it was already in, and only then pulls back
* the device recedes from 0.90 to 0.72 and repositions
* the seller **steps back** into the group on an arc, on camera, rather than being somewhere else
  when the cover lifts
* the four other people **walk in** — two from the sides, two from below — on the heavy spring,
  staggered 0.22 s apart, each on its own vector with its own arc
* only once they have arrived do they react: popup → eyes → head → hand to chin → question mark

A transition the viewer watches is worth more than one they are prevented from seeing.


---

# Revision 5 — review notes, implemented

## R18 · The hand

Rebuilt from the ground up after four rejected attempts, against a reference photograph
and an adversarial review run over four rounds. The full argument is **`hand-spec.md`**; the
short version is that the hand is now a **measured** asset, not a drawn one:

| file | what it is |
|---|---|
| `src/upi-scam/world/hand-geometry.mjs` | the drawing, in FW units (FW = the finger's width at its base) |
| `src/upi-scam/world/hand.tsx` | places and paints it — it does not shape anything |
| `tools/upi-scam/hand-shot.mjs` + `tools/upi-scam/hand-audit.py` | render **that same module** and measure the raster |
| `tools/upi-scam/hand-angles.mjs` | the finger's angle from horizontal at every tap |

**Why the audit exists.** Two of the four failures were bugs invisible in the source: a finger
widened from two different bases (so it was 54 units wide where the code said 30), and a knuckle
normal that pointed into the hand (so lobes protruded `2r − p`). Reading constants cannot catch
that. Two more were found the same way during this rebuild: the web fillet solved for the wrong
root, and `bendAt` rotated opposite to what `place()` assumed — so the wrist leaned radial while
the aiming maths thought it leaned ulnar, quietly mis-aiming the hand at every tap.

**What makes it read.** Back of the hand, never the palm — from the palm side the folded fingers
sit in front of the extended one and the eye calls it the little finger. The folded fingers are
three wide, shallow, graded **knuckle lobes** beside the finger's base. The radial edge is an **S**
— a long concave run into a bounded **thenar** swell — and those bounds are what stop it becoming a
finger-gun (a knob) or a mitten (a slab). **Chirality is declared**, never derived from the angle:
from the lower right it is the right hand, from the lower left the left.

**The wrist bends, by a different amount at every target.** The arm's origin is fixed off screen,
so the forearm arrives at a different angle at each key; one bend cannot serve them all, and at the
low-left keys an unbent wrist lays the finger flat and reads as pointing, not pressing. Ulnar,
spread over a band rather than hinged, eased with the fingertip: APPROVE 7°, PIN 2 20°, PIN 6 19°,
PIN 4/8 28°, phase-F 29° — every tap lands between 50.3° and 68.8°.

**The parents' scene, by ruling.** Parent B's point is *their* gesture, so it is
drawn in their own local space at their own scale — FW = the figure's arm width ÷ 3.70 — using the
figures' own single-stroke arm, flat-filled with no contour, pointing from arm's length instead of
touching the card. Borrowing the phone's hand there had produced one wider than their head on a
forearm 3.4× their own, which had to run 961 px (44 FW, where a real forearm is 13) to reach.

The phase-F hand stays the viewer's hand and leaves through the left edge **above** the parents:
at its true width it had been crossing straight over the left parent's head, which read as that
small figure's giant arm.

**Cold read** (only the frames, no spec): hand, index finger, back of hand,
pressing — all correct. Two notes recorded and not acted on: left-vs-right sits at ~50 % confidence
because no thumb is visible, and the finger has no middle-joint bend. The reference photograph
is thumbless with a straight finger and reads correctly, so neither was changed unilaterally.

## R19 · The ledger leaves with the wave

The YOU / buyer@upi row is never referred to again after the online-seller transition, so it is
not on screen after it. It stops drawing at `wavePeak` — inside the full coverage, which is the one
thing the cover is still used for.

That freed the top of the frame, so everything after the transition was raised and enlarged: the
phone goes 0.72 → **0.78** under the crowd and 0.90 → **1.00** for the parents, and the final
panels moved up 72 px. A backing plate now sits behind both halves of the comparison — without it
the 20 px divider was a window onto the device parked behind, and a bright sliver of app bar showed
through the film's conclusion.

## R20 · Recording script

`docs/upi-scam/recording-script.md` — the script with the **one** pause the film actually needs
(1.7 s after "…leaves your account.", so the flung card, the posted record and the sweep across it
all finish before the next sentence), plus four delivery notes that are not pauses. No pauses were
invented: every other beat is anchored to a measured word onset, so the animation conforms to the
read rather than the read conforming to the animation.

## R21 · The negation, and the sign-off's cue

**The PIN pad is refused, not annotated.** A thin red line laid across an unchanged keypad was the
one mark in the film that merely *appeared*: it left its target untouched, it clipped only a corner
of the grid (two keys were never crossed), the pad it negated carried no digits so it read as a grid
of blank blobs, and it borrowed the red that means *money leaving your account* for a second job.

Chosen from six animated candidates (`docs/upi-scam/nopin-options.html` — powers down, a bar
lands, keys fall out, becomes the words, ring and bar, against the current line as a baseline):
**the prohibition mark, drawn as an event.** The ring sweeps closed around the pad over 0.34 s, the
bar drives through it and LANDS — a damped-sine impact that jolts the pad — and the pad then goes
inert beneath it. Being a closed form the ring owns the whole pad instead of crossing part of it.

Two things came with it. The RECEIVE pad now carries its **digits**, because you cannot forcefully
negate something the viewer has not read as a PIN pad; and the pad dims only to 0.55, because dimmed
to the panel's own value it disappears and the mark ends up encircling nothing. **NO PIN** sits
clear below the ring's outer edge — the mark and the words must not overlap.

**The sign-off now follows the last word.** `HANDOVER` was `last word + 2.8 s`; it is `+ 0.5 s`.
The mark starts fading up half a second after "…account." and is fully up by ~0.95 s. Nearly three
seconds of silent, still film before the logo read as the film ending twice. Total: 44.949 s →
**42.600 s**. The score is untouched — it is keyed to the narration, so its fade now carries the
first second of the sign-off instead of finishing before it.

## R22 · The channel mark

Top right, the same lockup as the 16:9 films: the line-art mark, then the name on two lines, held
at 0.22. `src/upi-scam/Watermark.tsx`.

**Where it stands was measured, not chosen.** Every 4th frame of the finished render was reduced to
a map of where this film puts ink, and the candidate corners were scored against it:

| band | frames with ink | |
|---|---|---|
| top-right, y 28–112 | **15 / 639 (2.3 %)** | **chosen** |
| top-right, y 120–204 | 288 / 639 (45.1 %) | the ledger's THEM node lives here |
| top-right, y 220–304 | 319 / 639 (49.9 %) | |
| top-left, y 28–112 | 18 / 639 (2.8 %) | symmetrical, but YOU's balance runs under it |
| bottom-right | 539 / 639 (84.4 %) | subtitles, and the Shorts UI band |

The 15 frames of contact are one contiguous second — 20.27–21.20 s — and they are the seller wave
crossing the whole frame. A mark the picture sweeps across for a second is a signature; a mark
standing in front of the thing being named is not.

**It is not scaled down from the 16:9 films.** Those set a 48 px mark and 12 px text on a 1920-wide
frame; scaled by width to 1080 the name lands at 6.75 px, a quarter of this film's 26 px floor for
anything meant to be legible in the hand. Sized for the phone instead — 52 px mark, 26 px name — and
held at the same opacity, because what carries across the channel is the treatment, not the pixels.

It sits inside the end-card dim, so it fades out as the sign-off arrives rather than sitting on top
of the full lockup that card already shows.

## R23 · Made ready for a slower, human read

A human VO is coming and it will be slower. The beat map is word-anchored, so the film re-times
itself — but that alone does not keep the motion feeling the same, and the failure mode is not the
obvious one. Audited before changing anything (`tools/upi-scam/pace.mjs`):

**Three outright bugs, fixed.**

1. **The colour script was on the wall clock.** `design.ts` held nine stops as absolute seconds —
   6.5, 12.2, 15.2, 18.0, 22.0, 26.1, 31.3. On a slower read the ground would have turned to loss
   *before* the reversal and warmed for the parents *before* they arrived. Each stop now names the
   word it is about — "approve", "however,", "leaves", "While", "unfamiliar", "If", "UPI" — and
   every one landed within 0.22 s of the number it replaced.
2. **Two terminal keyframes were absolute** (`36.5` in the camera, `41.5` in the phone rig). Both
   are now the narration's own end.
3. **The hold after "…leaves your account." could be overrun.** Its four sub-beats were fixed
   offsets from that word; a human leaving a shorter gap would have had the sweep still running
   when the next sentence started — breaking the thing that was directed in R1. They now compress
   to fit a shorter gap and keep their tuned speed in a longer one:

   | gap | sweep ends | air before "While" | |
   |---|---|---|---|
   | 1.00 s | 0.92 s in | 0.08 s | compressed |
   | 1.66 s | 1.53 s in | 0.13 s | as built |
   | 3.00 s | 1.53 s in | 1.47 s | holds |

**What must not stretch, and what must.** Eight animations were interpolated across the gap between
two anchors, so they got slower as the gap grew. Five are objects with mass — the request card
crossing the frame, the reversal folding, the parcel, the parent's hand reaching APPROVE, the PIN
keys — and those now use `paced()` in `timeline.ts`: **the beat says when a move LANDS, a constant
says how long it takes**, set to its duration in the approved cut. Inert for this read, a speed
floor for every slower one, and still compressible by a faster one.

The camera and the phone rig were deliberately **left to stretch**, against first instinct. The
measurement is why: their long intervals are not moves that would crawl, they are slow drifts — the
rig takes 16.3 s to go from 1.00 to 1.06, and the camera's median move is 1.38 s. Capping those
would make them arrive early and then hold, which *adds* stillness to a slower read. A camera that
breathes with the narration is right; one that finishes and waits is not.

**What a 25 % slower read would do**, measured: camera median move 1.38 s → 1.72 s (fine), longest
gap between beats 2.80 s → 3.50 s. That last number is the real risk — slack, not crawl — and it is
in one place, the closing rule. `pace.mjs` prints it for any read, so when the VO lands the fix can
be aimed at the spots that actually go slack rather than applied globally.

**Verified inert**: eight frames spanning the film, rendered against the delivered cut, all match
to compression noise.

## R24 · The recorded narration

The read arrived as two files and the film was re-measured to it: `tools/upi-scam/voice.mjs` trims each
part, joins them with the hold, and hands the result to the same forced alignment the synthesised
read used (`tools/upi-scam/align.mjs`, now one copy shared by both paths). Nothing was hand-adjusted —
78 beats, every cue, the camera, the score and the subtitles all re-derive from the measurement.

**142.5 wpm spoken** against 170 for the reference read; narration 39.85 s → 47.47 s. Almost none of
that is slower speech: the reader left **1.2–1.9 s at every sentence boundary** where the reference
had 0.13–0.41 s. The hold itself came out at **1656 ms** against the 1662 ms it was cut for.

**Four things the read broke, all caught by the film's own guards, none by eye:**

1. **The detector snap collapsed runs of words.** Matching every word within 250 ms of a silence's
   end snapped "If", "a" and "screen" all onto 41.498 s, then the monotonic fix-up prised them apart
   by 20 ms each. One silence now claims **one** word — the one that starts the phrase after it.
   Checked against the waveform first: at that onset the audio was at −84 dB and speech began
   exactly where the detector said, so the detector was right and ASR was 600 ms early.
2. **The ±300 ms ASR-vs-detector guard was measuring the wrong thing.** On a recorded read with real
   pauses, ASR routinely places a phrase's first word up to 600 ms early; that is not a fault. The
   guard now fails on what would actually be one — word onsets left sitting **inside** measured
   silence, i.e. never placed on speech at all — and names the words either way.
3. **Five beats still carried wall-clock times.** The `{ at: 9.05 }` anchors for beats that live in
   a breath rather than on a syllable. The held breath after "…your UPI PIN." landed 1.9 s before
   the word it follows and the beat-order guard stopped the build. They are now `{ after, frac }` —
   proportionally through whatever pause the reader leaves — and the wall-clock anchor type is gone.
4. **The seller wave collided with the request's return.** The wave is a physical crossing at a
   tuned speed, so its choreography is now fixed relative to full coverage (0.28 s to start
   uncovering, 0.67 s to be clear) rather than stretched between two words. Coverage wants to land
   on "sellers" but must be CLEAR before "anyone", because the request card returns on that word.
   On the reference read those two demands coincide to the millisecond; this reader ran the words
   0.54 s apart, so the crossing pulls 0.15 s earlier instead of colliding. The SFX density cap had
   caught it first, at 100 ms between two distinct events.

**Pace, measured**: camera median move 1.38 s → 1.70 s; longest gap between beats 2.80 s → 2.94 s.
The closing section's internal rhythm is unchanged — pinDone→paid 1.06 s → 1.08 s, paid→moneyOut
1.20 s → 1.22 s — because those cues sit inside one sentence this reader did not stretch. No frame
freezes: longest frozen run 3 frames (0.05 s).

**Sync verified against the audio itself**, not just against the map: every anchor word's onset
sits on speech, with digital silence before the ones that follow a pause ("While" at 22.28 s,
−180 dB before, −19.5 dB at onset).

## R25 · The read said something else, and the film was cut to it

The delivered subtitles did not match the voice. Not a timing fault — cross-correlating the voice
stem against the delivered mix put them 40 ms apart, under three frames. **The recording did not say
the locked script.** Its opening was rewritten:

| | |
|---|---|
| locked draft | "…a UPI request **that looks like money is coming to you — you just need to approve it by entering your UPI PIN.**" |
| recorded | "…a UPI request **disguised to look like an incoming payment. All you seem to have to do is enter your UPI PIN to receive it.**" |

20 of the first 28 words; everything from "The moment you enter your PIN…" onward verbatim. The
decision was to cut the film to the recorded wording.

**Why editing the subtitles alone would have been wrong.** Every beat is anchored to a word INDEX.
`approvePress` — the frame the finger presses APPROVE — was pinned to script word 23, "by" in
"approve it *by* entering". Forced alignment had dutifully placed that index somewhere inside "all
you have to do *is* enter", so the press was already landing on a word nobody said. The phase A/B
visuals were cued to meanings absent from the audio.

So the script in `fragments.mjs` was replaced with the recorded wording and **every anchor in the
changed region was re-mapped by hand, semantically**, not by offset: the ledger's inbound stream
moved from "money" to "incoming", the stream landing from "coming" to "payment.", the APPROVE press
from "by" to "enter". Everything after the change shifted +2. The colour script moved with them.
Word count 105 → 107. Alignment is now **100 % of characters and 106/107 words** (the one
"mismatch" is ASR spelling "authorizing" against the script's "authorising").

Every directed beat still lands on its word: the card on "request", the snap on "leaves", the
₹3,200 return on "anyone", RECEIVE forward on "they", PAID on "authorising", the money out on
"leave". The one compromise is the seller wave, which peaks 0.15 s before "sellers" instead of on
it, because it must be clear before "anyone" — see R24.

**The guard that should have caught this, and now does.** Character coverage alone cannot answer
"does the read say the script": the substituted words shared most of their letters with the ones
they replaced, so a take that changed 20 words still scored **96.5 %** and passed a 90 % threshold.
`align.mjs` now also checks at WORD level, fails under 95 %, and names where the divergence starts
and what was heard instead. On the take that shipped it reported 85.7 %.

## R26 · The opening, measured

The film opened on half a second of silence over a motionless tableau. Fixed in two passes; the
second was aimed by measurement rather than taste — per-frame change across the first two seconds,
against the film's median of 0.32.

**Pass 1 — the voice on frame one.** Lead-in 0.45 s → 0.06 s (enough that the first consonant is
not clipped). Because every beat is word-anchored, this alone pulled the whole opening 0.42 s
earlier: the request now launches at **frame 13** instead of frame 37. The phone's history also
cascades in under the first words — the balance is present on frame one, because an empty screen is
a weak first frame and this one has to read as a wallet instantly.

**Pass 2 — the lull nobody could see.** The profile showed a **0.7 s hole from 0.42 s to 1.1 s**,
bottoming at **0.058** — effectively frozen, in the exact window that decides a swipe. The cause was
specific: the request card's flight used `ease.inOut` on position AND scale, so 0.4 s into a 1.9 s
flight it had covered **3 % of the distance at 20 % of its size**. The film's principal object was
parked through its most valuable second, and it decelerated to 0.102 just before landing.

**Two wrong fixes before the right one, both instructive.** The first used a 1.6 exponent and merely
moved the dead spot to 1.3 s — the card left well and then loitered. The second, a 1.15 exponent,
measured better everywhere and was shipped — and on review the card visibly **paused**. It did: the
curve was two eases butted together, a fast break and a slow close, and *both have zero slope at the
join*. Velocity fell to 0.099 of average at t = 0.57 s — a dead stop — and started again. Each half
was smooth; the seam was not. A per-frame delta profile cannot see this, because the rest of the
frame keeps moving.

The curve is now one continuous function whose velocity never approaches zero:

```
e(u) = u + A·sin(2πu)/2π        e'(u) = 1 + A·cos(2πu)        A = 0.34
```

Speed runs 1.34 → 0.66 → 1.34 of average: it leaves with impulse, eases once through the middle the
way a thrown object does, and arrives with speed into the impact that stops it. Monotone, C-infinity,
no join to stop at. The landing itself is untouched.

**The lesson for the next timing change**: when a move is built by blending two eases, check the
derivative at the seam, not just the shape of each piece. Zero-slope endpoints are what every ease
has, and butting two of them together manufactures a stall.

| first 2.2 s | before | after |
|---|---|---|
| deepest per-frame change | 0.058 | **0.199** |
| mean | 0.943 | 1.010 |

Alongside: the ledger rail now **reaches** — it runs out from the scammer toward you across the
first fifth of a second and completes exactly as the request is launched along it, so the opening
reads as a connection being made and then used rather than a diagram that was always there. The
camera settle was extended 0.55 s → 1.0 s so the frame is never quite at rest under the lull.

**The caption was broken, and it was the splitter's own documented failure.** The opening page read
"The scammer will send you a **UPI**" / "**request** disguised to look like…" — a noun split from
its modifier. `MIN_GAP_MS` of 180 ms admitted only the gaps after "a" (190 ms) and after "UPI"
(187 ms); the break the line actually wants, after "request", is 91 ms. At **85 ms** the balance
score prefers it — halves of 3.24 s / 2.62 s against 2.43 s / 3.26 s. The lower floor only adds
candidates; the existing scoring still rejects lopsided ones, and the other nine pages are unchanged.

**What was left alone**: starting the green "incoming" tokens earlier (they are anchored to the word
"incoming" — moving them breaks the word-anchoring the whole film rests on), and a pulse on the
₹12,300 balance at frame 0 (no narrative cause yet, so it would be decoration).
