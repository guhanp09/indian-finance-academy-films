# UPI Scam 1 — Pre-Mortem

Written against the measured narration (`src/upi-scam/narration.json`), not against the storyboard's
word-count estimate. Every finding below is a way the film could satisfy all three specification
documents literally and still be bad. Each one names the mechanism that prevents it.

Nothing here shortens the runtime, rewrites the script, removes a storyboard event, or reduces
density. Finding 1 is the only change to the documents as written, and the documents themselves
mandate it ("the actual narration waveform is authoritative for final synchronization").

---

## F1 — FATAL: the storyboard contains two clocks, and they disagree by up to 5.5 seconds

Each 0.5s block carries **two** pieces of timing information that were derived independently:

* a **narration fragment** ("however, instead"), assigned by slicing 94 words across 68 slots, and
* a **visual event** ("use 'however' as a tension beat"), authored on a wall-clock assumption.

They do not line up. Measured against the real read:

| block | fragment (actually spoken at) | the block's visual event | error |
|---|---|---|---|
| 17 | `entering` — 8.0 s | "use **however** as a tension beat" | −4.3 s |
| 19 | `UPI PIN.` — 8.8 s | fold the arrow back, green→yellow→orange | −4.2 s |
| 20 | `The` — 9.3 s | **snap the arrow fully outward in red** | −5.5 s |
| 33 | `money leaves` — 15.2 s | *reduce* the fraud motion, seed the next context | +0.0 s, inverted meaning |
| 53 | `parents` — 26.1 s | a user's finger almost reaches Approve, stops short | parents not yet on screen |

Implemented literally, **the money turns red and leaves the account at 9.3 s, while the narrator is
still saying "you just need to approve it by entering your UPI PIN."** The word "however" arrives
at 12.25 s to describe a betrayal the viewer watched three seconds ago. The single most important
requirement in all three documents — that the reversal surprise — is destroyed, and no amount of
craft downstream recovers it.

**Prevention.** The 68 primary focal events are the deliverable; their attachment to a 0.5 s grid
is the estimate the specification instructs me to remap. Every event is kept, in order, and
re-anchored to the narration fragment it semantically belongs to, using measured word onsets.
Block durations become uneven (0.16 s–0.90 s) — that is what conforming to a waveform means.
The resulting phase map is in `src/upi-scam/timeline.ts` and reproduced at the end of this document.

A useful side effect: the remap *improves* the pacing curve. The hook gains 2.1 s (8 events
across 6.1 s — establishing shots get room), and the reversal tightens to 3.6 s (9 events at
~0.4 s each — the climax gets rapid-fire). The storyboard had these the wrong way round.

## F2 — the density contract, implemented literally, IS the template-motion signature it forbids

The storyboard's "secondary" and "ambient" bullets are eight sentences rotated through all 68
blocks in fixed order. Implemented as written, every block re-triggers the same four behaviours,
so all 68 blocks acquire *identical ambient texture* — which is precisely the "repeated animation
signature" the pre-mortem specification bans in §9.

**Prevention.** Those bullets are read as a description of **persistent world systems**, not as
per-block instructions. The film runs exactly one background network, one particle field, one
parallax rig, one shadow light, one camera. They are always on, and what they do at time *t* is a
function of the current *cause* (a card landing, an arrow snapping), never of the block index.
Nothing is "re-triggered" at a block boundary, so no block boundary is visible.

## F3 — 68 primary events read as 68 mini-scenes unless the cast is fixed in advance

If each block constructs the object it needs, the film becomes a slideshow of well-animated
fragments and every transition becomes a fade.

**Prevention.** A fixed cast of persistent objects is declared once and never destroyed:
seller, phone, request card, amount, Approve button, keypad, four PIN dots, flow arrow, rupee
tokens (pooled), balance, scammer node, parcel, listing card, rule card. Objects change **role**
(PIN dots *become* rupee tokens; the parcel *becomes* the listing; the listing grid *becomes* the
payment network; the rule card *becomes* the final comparison). An object never disappears and
reappears — `object-permanence-in-transitions`. A seam metric over the assembled film enforces it.

## F4 — the green→red reversal is unreadable in greyscale, and that is how most people scan a Short

Colour carries the entire reveal in the documents' own description. A viewer with a red-green
deficiency, or anyone whose brightness is down, sees nothing change.

**Prevention.** The reversal is carried by five redundant, non-chromatic channels: **direction**
(arrowhead crosses the frame), **shape** (the arrowhead inverts from a soft chevron to a hard
barbed point), **the amount's sign and label** (`+₹8,450 REQUESTED` → `−₹8,450 PAID`), **the
balance** (mechanically rolling down), and **position** (tokens end up inside the scammer node).
A greyscale QA pass renders the reversal window with saturation zeroed and requires the direction
to remain legible.

## F5 — "however" is 0.32 s long, and the micro-pause the specification demands does not fit

The documents ask for a freeze / drop in stimulation at "however". Measured: "however," runs
12.25–12.57 s, and "instead" begins at 13.01 s. The available hole is **0.76 s**, and 0.44 s of it
is silence. A literal freeze of the whole frame for 0.76 s in a film this dense reads as a dropped
frame or a render fault, not as tension.

**Prevention.** The drop is in *stimulation*, not in motion: the particle field thins to ~15%,
the network stops advancing, the camera's drift decelerates to near zero, secondary objects hold —
but the green arrow keeps loading elastically (it is the one thing still moving, so it is the one
thing the eye is on) and the seller's eyes do the only acting in the frame. Sound drops harder
than picture, which is what actually creates the sensation of a held breath.

## F6 — the reversal and the debit are two different events 2.9 s apart, and the storyboard fuses them

"however, instead of you getting paid" (12.25–14.40) and "the money leaves your account"
(14.79–16.29) are separated by a real 0.39 s breath. Fusing them spends the climax in one second
and leaves 2 s of narration with nothing to do but repeat itself.

**Prevention.** Three distinct staged events: **tension** on "however" (elastic load), **betrayal**
on "instead of you getting paid" (the arrow folds through its own tail, colour walks
green→yellow→amber→orange), **loss** on "the money leaves your account" (snap outward, PIN dots
launch as tokens, balance rolls, scammer node absorbs). Each has its own energy peak. The film's
loudest moment is the snap at "leaves" (15.20 s).

## F7 — the first second must sell UPI, and the lead-in is only 0.45 s

"UPI" is first spoken at 1.82 s. If the UPI mark appears when it is spoken, the first 1.8 s are a
generic phone and the viewer scrolls.

**Prevention.** The phone, the UPI-marked app bar and the seller exist from frame 0 and are fully
assembled by 0.35 s — before the first word. Live assembly still applies to *narrative* objects
(the request card, the arrow, the network, the rule card), which have a true t₀ later. The
establishing cast is not a narrative object; it is the room.

## F8 — sixty frames a second of pooled particles plus SVG character rigs will not render

At 1080×1920×60 fps × 2086 frames, a 400-node SVG particle field is a 4-hour render and an
unstable one.

**Prevention.** Particles, the background network and the token field render to a **single
`<canvas>`** driven by a deterministic seeded PRNG, one draw call per frame. SVG is reserved for
the ~14 narrative objects. No full-frame filters; no nested blurs; glow is a pre-baked radial
gradient, not `feGaussianBlur`. Every random value derives from `mulberry32(seed)` keyed on frame,
so two renders are bit-identical.

## F9 — the tail is 3.77 s of dead air

The last word ends at 33.41 s; the file runs to 34.77 s. Measured against the storyboard, the
"final rule" phase is 3.4 s of narration followed by 1.4 s of nothing.

**Prevention.** The tail is the rule's hold — the specification explicitly asks for the final rule
to stay readable and memorable. Motion during the tail is reduced to the internal arrow particles
and one shield pulse, then settles. Nothing new is introduced after the last word.

## F10 — a 9:16 frame with a phone in it wastes 60% of the canvas

A vertical phone inside a vertical frame is the single most common way this idea looks cheap.

**Prevention.** The phone is never the whole composition. It occupies the central band
(y 620–1440) at ~52% of frame width; the seller occupies the lower-left foreground and is
cropped by the frame edge (which increases perceived scale); the scammer node and the network
occupy the upper-right; the amount and the flow arrow cross the phone's bezel into world space.
Objects leave the frame rather than shrinking to fit.

## F11 — "parents" rendered as the storyboard describes risks being condescending

Two figures, one phone, an intervention — it is one design decision away from "old people can't
use apps."

**Prevention.** The parent figures are competent: they are already mid-transaction, their posture
is upright, and the uncertainty is a single 0.25 s eye-hold, not confusion. The rule card is not
handed to them by an external authority — it **grows out of the phone's own interface**, which
frames the knowledge as something the system should have told them. No caricature markers
(no stoop, no oversized glasses, no tremor).

## F12 — subtitles at 170 wpm become the most energetic thing in frame

68 fragments in 34 s means a word change roughly every 0.36 s. Per-word bouncing at that rate
out-moves everything else on screen.

**Prevention.** Subtitles hold 4–7 words, advance on phrase boundaries (not per word), and only
the nine priority words receive emphasis — a 9% scale and a brightness lift over 110 ms, with no
overshoot. Filler words are inert. Subtitles sit in a reserved band (y 1500–1660) that no
narrative object enters, above the Shorts UI zone.

## F13 — SFX on every micro-event turns a 34 s Short into an arcade

The object-interaction rule guarantees dozens of reactions per second. Sonifying them is the
failure mode §15 of the pre-mortem spec names.

**Prevention.** A hard cap: **at most one hard-sync SFX per 0.45 s**, and a fixed list of 24
sonified events for the whole film. Everything else is silent. All SFX are synthesised
procedurally from the object's physical class (mass → centre frequency, speed → transient
sharpness, elasticity → tension glide), so material consistency is structural rather than
curated, and the whole bed is original and deterministic.

## F14 — the storyboard's directional law is violated by its own final composition

Sections 4 and 10 lock seller = left, scammer = right, so false-incoming is RIGHT→LEFT and the
debit is LEFT→RIGHT. Block 62 then asks for "RECEIVE on the left and SEND on the right." RECEIVE
means money arriving at the user — a LEFT-ward motion — but it is now drawn on the left half,
where the arrow must travel leftward *out of* its own panel.

**Prevention.** Each final panel keeps a local "you" node on its **outer** edge and the world on
its **inner** edge, so RECEIVE still flows toward its user (rightward-into-left-panel reads as
inbound because the user icon is at the panel's left) and SEND still flows away. Verified by the
mute test: the two panels must read as opposite directions with the labels covered.

---

## The re-anchored phase map (measured)

| phase | narration | measured window | storyboard said | events |
|---|---|---|---|---|
| A · hook | "The scammer will send you a UPI request…" | 0.45 – 6.52 s | 0.0 – 4.0 | 12 |
| B · approve & PIN | "…you just need to approve it by entering your UPI PIN." | 6.52 – 12.25 s | 4.0 – 9.0 | 12 |
| C · reversal & debit | "however, instead of you getting paid, the money leaves your account." | 12.25 – 15.88 s | 9.0 – 14.5 | 11 |
| D · online-seller context | "While the common targets for this scam are online sellers," | 15.88 – 20.52 s | 14.5 – 20.5 | 11 |
| E · anyone | "anyone unfamiliar with the basics of UPI transactions can fall for it." | 20.52 – 26.08 s | 20.5 – 25.5 | 12 |
| F · parents | "If your parents use UPI, let them know that they never need to enter their UPI pin" | 26.08 – 31.34 s | 25.5 – 31.0 | 13 |
| G · final rule | "to \"receive\" money, only to send it." | 31.34 – 34.77 s | 31.0 – 34.0 | 7 |

**78 beats implement the 68 storyboard events.** Ten extra beats come from F6: events the storyboard
fuses are staged separately (tension / betrayal / loss are three beats, not one; the marketplace
absorption and the crowd arrivals get their own anchors). Nothing was merged or dropped.
Runtime 34.767 s / 2086 frames @ 60 fps.

---

## What the pre-mortem caught during implementation

The findings above were written before any animation code. These were found by the checks the
findings put in place, and are recorded because each one would have shipped silently:

| | found by | what it was |
|---|---|---|
| 1 | F1's measurement | The ASR word map was cached on the SCRIPT, not the audio, so a re-render at a different tempo silently served the old word times — a 2.4 s error at the tail that looked entirely plausible. Cache key now covers the waveform. |
| 2 | F3's permanence audit | `Ledger` returned a nested `<svg>`, which establishes a new viewport and clips its children. The rupee tokens launch from y=1006, outside it — **the money was never visible leaving the phone**, in a film about money leaving a phone. |
| 3 | frame inspection | `interpolateColors` returns `rgba(...)`, not hex. Two separate colour mixers assumed hex, so the flow ribbon and then the parcel rendered pure black. One mixer now parses both. |
| 4 | F4's legibility pass | The balance odometer formatted the live value as a string, so the comma walked left as ₹12,300 fell below ₹10,000 and the number was unreadable at the one moment it must be read. Columns are now positional. |
| 5 | F8's determinism rule | `0.018 × 48000` is `863.9999…`, so envelope buffers came out one sample short of the voices reading them; a single `undefined` produced one NaN that poisoned an entire audio buffer. Lengths are rounded and non-finite samples now throw. |
| 6 | F5's own check | The first mastering pass used single-pass `loudnorm`, which is a dynamic normaliser — it flattened the mix to 1.5 LU and would have erased the "however" drop entirely. Replaced with measure-then-static-gain. The drop is now measured directly on the bed: **−32.8 dB before → −45.9 dB during → −26.6 dB at the snap**. |
