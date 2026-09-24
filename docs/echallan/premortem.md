# Fake e-Challan Malware — Pre-Mortem

Written before implementation, against the three governing documents (the 111 s hyper-dense plan,
the premium-immersion addendum, and the failure-prevention brief).

**The brief for this document:** predict every way the plan could be followed to the letter and
still produce something confusing, cheap, physically incoherent, exhausting, or generically
templated — and name the mechanism that prevents each one.

Nothing here simplifies the film. Every finding below either (a) corrects a number the plan got
wrong, or (b) names a place where *literal* compliance produces the failure the plan forbids.

Numbers are measured off the actual read (`src/echallan/narration.json`), never estimated.

---

## F1 — FATAL: the plan's clock is a word-count estimate, and it is 17% short

The plan declares a "provisional full runtime: 111.0 seconds, derived from the locked script at a
natural explanatory pace," then builds 222 blocks on that grid.

The locked script is **317 words**. 111.0 s implies **171 wpm**. That is not an explanatory pace —
it is a fast read. This channel's previous film in the same series was delivered at 141 wpm.

Synthesised at a natural **150 wpm** and force-aligned, the read measures:

| | plan | measured |
|---|---|---|
| runtime | 111.000 s | **129.791 s** |
| frames @60 | 6 660 | **7 787** |
| last word ends | — | 128.27 s |

So **every one of the plan's 222 timestamps is wrong**, by a drift that reaches ~19 s at the tail.
Taken literally the film would put the malware reveal at 57.5 s — where the narrator is still
typing payment details — and the closing advice would fire 17 s before it is spoken.

The plan anticipates this and rules on it: *"conform the timestamps to the real waveform without
deleting, shortening, or collapsing semantic beats."* That is what is being done. The film is
**~130 s**, not 111 s. The content is not compressed to defend a provisional number.

**Prevention.** `src/echallan/timeline.ts` contains **no wall-clock times at all**. Every beat is
anchored to a measured word index. Re-record the narration, re-run one tool, and the whole film
re-times itself semantically — because the numbers move and the structure does not.

**Reassuring corollary:** the plan's half-second grid turns out to be *real*. At 150 wpm the
measured median block span is **0.548 s** (min 0.140, max 2.007). The plan's fragmentation was
sound; only its arithmetic was wrong.

### The measured phase map

| # | phase | plan | measured |
|---|---|---|---|
| 1 | Stop-scroll hook | 0.0–5.0 | **0.00–4.51** |
| 2 | Vehicle / fine / `RTO Challan.apk` | 5.0–11.0 | **4.51–12.62** |
| 3 | Unknown-source barrier | 11.0–22.5 | **12.62–23.56** |
| 4 | First app installs, fake service opens | 22.5–28.0 | **23.56–30.57** |
| 5 | "Install Update" | 28.0–30.5 | **30.57–33.40** |
| 6 | Second install / security flow | 30.5–36.0 | **33.40–40.74** |
| 7 | Permission escalation | 36.0–46.5 | **40.74–52.63** |
| 8 | Hasty Allow | 46.5–51.0 | **52.63–57.13** |
| 9 | False resolution — payment | 51.0–57.5 | **57.13–63.73** |
| 10 | Reveal — dropper | 57.5–65.5 | **63.73–73.91** |
| 11 | Credentials + OTP exfiltration | 65.5–84.0 | **73.91–97.15** |
| 12 | Retrospective causal chain | 84.0–96.5 | **97.15–111.24** |
| 13 | Prevention | 96.5–103.0 | **111.24–118.35** |
| 14 | Safe verification | 103.0–111.0 | **118.35–128.27** |

All fourteen phases survive, in order, at their planned proportions. Nothing was cut.

---

## F2 — the density contract, implemented literally, *is* the template-motion signature it forbids

Three separate mechanisms in the plan produce template animation if typed as written.

**(a) The 125 ms micro-phases are boilerplate, not direction.** Across all 222 blocks the four
quarter-blocks are the *same five sentences* with the block's event substituted in:
"Prepare the action: X. Anticipation begins before peak motion." / "Commit to the first readable
change…" / "Let the first physical consequence propagate…" / "Begin visually seeding the next
causal step…". Implemented literally this gives **every object in the film the same envelope** —
which is precisely the "DO NOT APPLY ONE SPRING PRESET TO EVERYTHING" failure.

> **Prevention.** The micro-phase text is honoured as a *shape* — anticipate → commit → propagate
> → seed — and realised through the object's own material class. A heavy system panel and a light
> badge both obey that shape and must not share a curve. Six spring families in `design.ts`, one
> class per object for the whole film, no local re-tuning.

**(b) The "simultaneous secondary fronts" are a rotating list of three.** In the plan the same
three bullets alternate across consecutive blocks (blocks 1/3/5/7/9 share one triple, 2/4/6/8
another). Scheduled per block, they fire on a perfectly periodic cadence — the exact "AVOID
PERFECTLY PERIODIC MOTION" failure, and it would be visible as a pulse under the whole film.

> **Prevention.** Secondary fronts are implemented as **standing behaviours of persistent
> objects**, event-driven and aperiodic (seeded hash offsets per element), not as a per-block
> schedule. A shadow lagging its parent is not a scheduled event; it is a property of the shadow.

**(c) Every block's "primary semantic event" is phrased as a complete action.** 222 complete
actions is 222 start-stops — the slide-deck cadence the plan explicitly bans.

> **Prevention.** No block may *spawn* its subject. Every block's event is expressed as a **state
> change of an object that is already on screen**, and every block overlaps its neighbours: the
> previous move is still settling for the first ~100 ms and the next is anticipating in the last
> ~150 ms. Enforced after render by the seam metric (a cut spikes one isolated frame; a handover
> does not).

---

## F3 — the reveal depends on a memory the viewer was never given time to form

The film's semantic peak is *"Oh — THAT was the malware."* That requires the viewer to recognise,
at **~66–74 s**, a silhouette last seen at **~36–40 s**.

Thirty seconds, across two intervening phases, is far beyond visual working memory for an object
that appeared briefly and left. If the second-stage payload is on screen for 0.4 s during the
second install and is then gone, the reveal introduces a stranger and the climax collapses into a
generic malware graphic.

**Prevention — three requirements, all load-bearing:**
1. The payload gets a **distinctive, non-sinister silhouette** at install: a recessed, compact,
   double-shelled package, darker and denser than the app shell, with one diagnostic detail. Not
   red, not labelled, not spiky.
2. It is **held**, not flashed — it owns the focal point for its beat in phase 6.
3. It **stays faintly alive underneath** through permissions, hasty-allow and payment (the plan
   asks for exactly this: *"the deeper payload remains faintly alive beneath it"*). The reveal is
   then a **re-focus on something continuously present**, not a reintroduction.

This also protects against the opposite failure: the payload must never be legible enough during
the payment phase to spoil the false ending. It is present, low-contrast, and *moving slowly* —
see F5 for why motion rather than contrast is the right carrier.

---

## F4 — Android has four distinct gates and the script hedges about one of them

The narration says *"go through another Android installation **or** security prompt"* — the script
itself is unsure. The temptation is to collapse everything into one generic Allow card, which the
brief forbids outright.

Four gates, four visually distinct system surfaces, in this order, never merged:

| gate | what it is | surface |
|---|---|---|
| 1 | **install-source permission** — "allow *this app* to install unknown apps" | a settings-style toggle row; the barrier is *rigid* and physically blocks the package |
| 2 | **package installer confirmation** — Install / Cancel on a package | an installer panel with the package's own identity on it |
| 3 | **runtime permissions** — SMS, phone | the Material runtime dialog: Allow / Don't allow |
| 4 | **VPN consent** — a system-level connection request | wider, system-chrome, visually *not* one of the runtime cards |

Background-persistence is deliberately **not** drawn as a fifth popup: it is not a universal
prompt, and inventing one would be a factual error. It is shown as what it actually is — a
battery/background-access settings surface, and then as the app's core continuing to glow after
its window recedes.

No OEM-specific wording anywhere. Generic Material-inspired system UI. The claim the film makes is
*"this behaves like Android"*, never *"this is your exact phone."*

---

## F5 — the hidden infrastructure has to be invisible to the victim and visible to the viewer, and 10–15% contrast is neither

The plan asks for the malicious topology to sit under the payment UI at "10–15% contrast". On a
deep-navy ground, at phone size, after H.264 at Shorts bitrate, **10–15% contrast is gone** — the
dramatic irony simply does not render. Raise it and the payment scene stops feeling safe, which
breaks the victim's believability (F6).

**Prevention: carry it with MOTION, not contrast.** A slow, continuous packet drift along an
already-established route is perceptible at very low contrast *because it moves*, while a static
low-contrast line is not. Static contrast stays low; the route stays alive. Verified on an encoded
sample, not in the browser preview.

The same reasoning governs every thin line in the film: route weights are chosen against an
encoded still, because vector preview lies about what survives the encoder.

---

## F6 — the payment scene must be the calmest in the film, or the victim's behaviour is unbelievable

If ominous colour, aggressive motion and dark ambience persist into the payment phase, the viewer
stops believing a person would type their card details into it — and the whole film becomes a
story about an idiot rather than a story about a well-built trap.

**Prevention.** Phase 9 is a genuine colour and energy *reset*: clean blue/white, restrained green,
locked camera, orderly spacing, the fewest moving elements of any phase, simplest music. Energy
target 3/10 against the reveal's 10/10. The danger is present only as F5's slow drift.

Then F7.

---

## F7 — a false ending only works if the loop actually closes, and the read gives it 0.46 s

The plan's §49 asks for a moment where the scene appears complete before *"but in reality…"*. In
the measured read the natural breath after "…settle the fine." is under half a second — not enough
for a spinner to resolve, a tick to draw, a hand to leave and posture to relax.

**Prevention.** A **0.82 s hold** is inserted at that word boundary (and 0.34 s before "Install
Update", and 0.46 s after "…the actual malware."). *The script is unchanged* — not a word added,
removed or reordered; the read simply waits while the picture finishes a thought. All three are
reductions the addendum asks for by name (§13, §41, §49), and everything downstream re-times from
the re-measured waveform.

---

## F8 — "OTP flies to hacker" is the default failure, and it is factually wrong

The naive implementation — OTP appears, OTP leaves — teaches the viewer that malware *removes* the
message. It does not, and that error matters: the reason victims do not notice is precisely that
the OTP is still sitting in their inbox.

**Prevention — the three-stage event, with the original permanently retained:**
1. a legitimate OTP arrives with **entirely normal** styling and an ordinary message ping;
2. the **previously granted** SMS route lights up — the same route, the same colour it was given
   when it was granted, not a new "hack path";
3. a **duplicate** peels away along a visible seam and travels out; the original stays in the
   inbox, unchanged, for the rest of the sequence.

Credential packets and OTP packets must also be distinguishable **in greyscale** — so they differ
in *silhouette* (a structured rectangular token vs a compact numbered tile), not only in hue, and
they travel on separate lanes, converging only at the endpoint.

---

## F9 — the colour argument is invisible to half the audience and most of the scanning

The film's whole thesis is carried by green→amber→red. Shorts are largely scanned peripherally, at
low brightness, and red/green is the most common colour-vision deficiency.

**Prevention.** Every safe/unsafe distinction is carried by at least two of: **direction**
(inbound vs outbound), **shape** (rounded route vs barbed path), **endpoint** (device vs remote
node), **position**, **motion**. Greyscale contact sheets are a render gate, not an opinion — the
reveal and the exfiltration must both read with saturation removed.

---

## F10 — 7 787 frames of routes, packets, grain and character rigs will not render

At 1080×1920×60 fps, a permission topology of four live routes, pooled packets, per-object shadows,
document grain and an SVG hand rig is a straightforward way to produce dropped frames and a
multi-hour render — and unstable playback *is* a quality failure.

**Prevention.** Precomputed path geometry; pooled particles with seeded identity (never
`Math.random()`); transform/opacity only; no full-frame blur or SVG filter stacks; grain as one
static tiled texture rather than a per-frame filter; a node-count budget checked at the densest
frame in the film (the permission topology under the payment form).

---

## F11 — 222 subtitle pages would become the most energetic object in the film

Paging captions per block means 222 changes in 130 s — the captions would out-move the animation
and cover exactly the things that must stay readable.

**Prevention.** Captions page by **phrase** (4–7 words, addendum §24), never per block, and are
laid out so they never cover the `.apk` filename, the Allow control, the permission identity, the
OTP, or the final advice. They live in a reserved band no narrative object may enter.

---

## F12 — the "premium 2D" bar is lost in the small assets, not the big ones

The film needs roughly thirty bespoke objects. The characteristic failure is not a bad phone — it
is that the phone is carefully drawn and the SMS icon is a generic glyph, so the world stops
looking like one illustrator made it.

**Prevention.** A single primitive kit (stroke weights, corner-radius classes by material, one
global light, one shading ramp, one level of abstraction) that **every** asset composes from, plus
an asset contact sheet rendered and judged *before* any of it is animated. Detail budget is
proportional to screen time: a 200 ms background icon gets a silhouette, not labels.

The existing hand rig from the previous film in this series is reused rather than redrawn — it is
already anatomically specified and audited, and rebuilding it is how hand continuity gets lost.

---

## F13 — the opening has to be credible and arresting at the same time

A thumb-stop normally means alarm, and alarm is banned here: if the first second looks malicious,
the reveal at 64 s has nothing left to reveal.

**Prevention.** The stop comes from **composition, not warning**. Inside the first frame, within
one phone-sized region: official challan chrome + WhatsApp chat context + a vehicle plate + a ₹
amount + a file affordance. The contradiction *is* the hook — an official traffic fine arriving as
a chat attachment — and it is legible before the first sentence finishes. No red, no skull, no
label, no title card, no logo, and the world is already in motion at frame 0.

---

## F14 — the narration is provisional, and that must not be hidden

The film is currently cut to a **synthesised** read (macOS `say`, voice Rishi, 150 wpm, then
force-aligned). It is a real, measured waveform — every beat is anchored to it honestly — but it is
not the delivered performance.

**This is the one dependency the pipeline cannot satisfy on its own.** When the recorded VO exists, the pipeline
is designed to absorb it: `tools/echallan/voice.mjs` re-measures it with the same forced aligner
and every beat, cue, camera key, colour stop and subtitle re-times automatically. Nothing is
hand-tuned to this read except the three holds in F7, which are declared at word boundaries and
survive re-measurement.

Anything with mass is additionally protected by a duration cap (`paced()`), so a slower read
spreads the film out without making a card crossing the frame crawl.

---

## Standing energy envelope (addendum §12/§78), against measured time

| phase | t | energy |
|---|---|---|
| hook | 0.0–4.5 | 7 |
| APK discovery | 4.5–12.6 | 6 |
| unknown-source barrier | 12.6–23.6 | 5 |
| first app | 23.6–30.6 | 3 |
| Install Update | 30.6–33.4 | 6 |
| second install | 33.4–40.7 | 6 |
| permissions | 40.7–52.6 | 8 |
| hasty Allow | 52.6–57.1 | 9 |
| **payment** | 57.1–63.7 | **3** |
| **reveal** | 63.7–73.9 | **10** |
| theft / OTP | 73.9–97.2 | 7 |
| recap | 97.2–111.2 | 4 |
| prevention | 111.2–118.4 | 4 |
| verification | 118.4–128.3 | 2 |

The amplitude breathes; the information density does not drop.

---

## What this pre-mortem changed before a line of animation was written

- runtime corrected 111.0 s → **129.791 s**, measured, with all 14 phases intact;
- three designed holds placed at word boundaries instead of hoping the read leaves room;
- the beat map forbidden from containing a single wall-clock number;
- the second-stage payload promoted from "shown at install" to "continuously present, faintly";
- the hidden topology re-specified from a *contrast* budget to a *motion* budget;
- four Android gates enumerated so they cannot be merged;
- background-persistence removed from the popup list — it is not a universal prompt.

---

## What the boards settled (checkpoint 2)

Four still boards were built before any animation, against premortem F3/F5/F6/F8. Each settled a
question that would have been expensive to discover in motion.

**B1 · The two registers coexist without ever making the phone transparent.** The device recedes
and rises; the space it vacates becomes a milled chamber, and the chamber's rim is drawn *after*
the phone so the foot of the device passes behind it. The phone plugs into its own interior. No
group alpha is used on any solid anywhere in the film — (rule: depth is drawn, not dissolved).

**B2 · The app is a CONTAINER, and the payload is visibly inside it.** The shell is a back wall,
two narrow side rails and a low front lip carrying the word APP. The payload's lower third sits
behind that lip, which is what makes "inside" read without a caption. Two earlier attempts failed:
wide rounded side walls plus a tall front panel read as an armchair, and a payload drawn behind
the front panel was invisible.

**B3 · REFINEMENT, recorded: the shell SEPARATES; it does not dissolve.** The plan asks for the
confirmation surface to become "partially transparent". The rule "depth is drawn, not dissolved" forbids
dissolving a solid, and the plan's own §50 says "fake-app shell separates" — so the front lip
slides down and out of the box on its own seam, and the husk stays whole. Two discarded versions
are worth naming: a front panel hinging about its bottom edge reads, in a flat front-on view, as
flipping *up across* the contents; and side rails flung outward read as blue sticks, not as a box
opening. One unmistakable mechanic beats three ambiguous ones.

**B4 · REFINEMENT, recorded: the VPN tunnel keeps its own colour; the TRAFFIC inside it turns.**
Tinting the tube toward orange produced a muddy maroon and, worse, said the wrong thing. The tube
stays the teal it was given when it was granted, and the packets moving through it go red. That is
the film's actual argument — a capability is not itself hostile; the use of it is.

**B5 · The payment screen is credible.** Clean institutional blue and white, locked camera, the
form the only thing in frame, no warning colour anywhere, "256-bit encrypted" at the foot. The
topology below it is quiet and, critically, *moving* — F5's motion budget rather than a contrast
budget.

**B6 · Credentials and OTPs are distinct in silhouette.** A credential is a wide card token with a
magnetic stripe and three digit groups; an OTP is a compact square tile carrying six digits. They
travel on two separate arcs and are only ever side by side in the endpoint's receiving tray. Both
survive greyscale.

**B7 · The OTP is the largest type on the phone and it does not move.** An earlier layout rendered
the message at 0.50 scale with the code overlapping the body text; the copy drawn on top of the
original read as a double exposure rather than a duplicate. The original now owns the screen, and
the duplicate leaves through the interior, on the SMS route that was granted at 44 s.
