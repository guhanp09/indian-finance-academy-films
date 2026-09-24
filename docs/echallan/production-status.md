# Fake e-Challan Malware — production status

Where the film stands, what is approved, the clock, the tooling, and what each phase inherits.

---

## 1 · Status

| | |
|---|---|
| Master | **`out/echallan-v7.mp4`** — the current film, `Opening`, acts 1–4 plus the approved sign-off. Renders go to a fresh filename every round so the previous one can be compared against. |
| Narration | **RECORDED.** `~/Downloads/fin-ch.mp3`, 120.0 s of speech at 165 wpm, ingested by `voice.mjs`. The read is the authority — eight of its rewordings were adopted into the locked script and therefore into the subtitles. 319 words, 218 blocks, **128.5 s** after the six designed holds are spliced in. |
| Approved | pre-mortem, runtime, design direction (boards 01–06) |
| Built | all four acts, blocks 1–218, plus the sign-off card |
| Score / SFX | 330 synthesised sounds + a 13-section generated score, side-chained under the voice. Two builds from one file: `ECHALLAN_SCORE=a` (default) and `=b` (contrary motion). |
| Subtitles, watermark, sign-off | ported from the approved previous film in the series |

> **The word map is measured per UTTERANCE now, not per file (round 12).** `align.mjs` segments the
> recording with a VAD before it transcribes it, transcribes each utterance on its own, and pins the
> first and last word of each to the utterance's measured edges. This was not a refinement: ASR word
> times smear across silence, and the old map was wrong by 0.2–1.1 s at exactly the places the film
> cuts and cues. It put the end of "background," 204 ms early, the start of "You" 900 ms early and
> the start of "Please" **1.07 s** early — which is why three holds were spliced into the middle of a
> word and why the phone rose before the narrator spoke. `voice.mjs` also no longer re-measures the
> file it just spliced; the spliced map is the measured map plus arithmetic. See
> `opening-transitions.md` §ROUND 12.
>
> **Every hold is now the TOTAL silence at its anchor**, not a number added on top of whatever pause
> the read already took. Several were raised to compensate — the permission holds in particular —
> because the picture had been getting the designed hold *plus* the read's own pause.

### QA — every gate passes on `out/echallan-v7.mp4`

| gate | result |
|---|---|
| **splices** | **every word whole, every hold exact, every join in silence.** The delivered narration is re-segmented, every utterance transcribed on its own, and the result diffed against the source read: **all 326 sounds identical — the splice damaged nothing**. Each hold's utterance before it ends on the anchor word and the one after begins on the next word. Loudest point inside any hold: −41 dBFS, and that one is a breath |
| holds | service. 0.72 / SMS, 2.45 / calls, 2.40 / background, 2.05 / connection. 1.12 / fine. 0.82 / dropper, 0.44 / malware. 1.70 — all at or over their designed length. **"dropper," needs no cut at all** and "fine." needs 72 ms into a 748 ms silence |
| the phone | starts rising **197 ms into "Please"** (the word runs 108.87–109.13 s) — it cannot begin before the word, and it is settled before "be" |
| the bounce | carries **71 px** past the resting pose (was 46) at a **0.31 s** damped period (was 0.95), three visible swings, and never closer than **26 px** to the top of the frame |
| the street at 1:38 | **142 px** above the mast's spire, **139 px** below the ground mark to the Shorts UI line (was 103 / 280), subject at z 1.16 (was 1.077) |
| audit | 218 blocks, 99 named cues, all derived from the beat map, all inside the film |
| camera | one C1-continuous dolly (`v2/track.ts`) for all four acts; no dead stop inside any move; peak optical flow act 1 1927 / act 2 2475 / act 3 3138 / act 4 1606 px/s, every arrival within the floor its speed demands |
| camera, deliberateness | at most **2 changes of shot in any two seconds** anywhere in the film, sharpest heading swing mid-move **67°/s** |
| camera, subject | the phone never sits more than **23 px** off the middle of the frame it fills |
| act 3 | the two grounds never share a frame · the office 0.65 s / the front comes down 0.88 s / the hollow 0.82 s / the apparatus 1.92 s · all five stolen objects arrive · the uplink ray misses its bowl by 1 unit |
| act 4 | the return never holds both grounds · the whole machine 4.98 s / 0 moves, the door 9.38 s / 0, the place to go 8.05 s / 0 · the route only ever climbs and sets off clear of whichever band the caption is on · the door shuts IN ORDER and before it is tested · the message reaches the counter **0 px off** · the card takes over a settled frame |
| the antenna | its spire is never higher than **y 93** at any frame of the climb, measured off `MAST_TOP` |
| focus | 1.67–2.48 s settled per question, **0.73–1.15 s** per machine, 2 moves each |
| taps | all land; no-touch box clear |
| the eye | act 3 mean 0.387/s, act 4 0.265/s; longest fixation 0.35 s (limit 0.75) |
| caption side | measured, not typed: **11 of 31** pages stand at the top |
| mix | −14.1 LUFS, TP −1.0 dBFS, 330 SFX; voice clears the ducked bed by median **25.7 dB** |

### What is NOT done

- **A full watch at 0.25× and on a phone.** The numeric gates cover abrupt motion, seams, blanks,
  safe zones and greyscale; they cannot judge taste. The weakest stretches, in my own judgement, are
  listed in §7.

## 2 · The one rule

**No visual event in this film is placed at a wall-clock time.** `src/echallan/timeline.ts`
contains no seconds. Every beat is anchored to a MEASURED word. Re-record the narration, run one
tool, and the whole film re-times itself — the numbers move, the structure does not.

Anchors are by PHRASE (`at('Android may warn')`), not by index, so a script edit cannot silently
shift an act boundary — see the rule "beat-index shift".

---

## 3 · Files

```
docs/echallan/premortem.md      14 failure modes + what the boards settled. Read before changing anything.
docs/echallan/production-status.md        this file

tools/echallan/fragments.mjs    the LOCKED script + the plan's 222 blocks. assertScript() is called by
                                every tool that touches narration, so the script cannot drift.
tools/echallan/narration.mjs    synthesise → align → insert the 3 designed holds → re-measure → ship
tools/echallan/voice.mjs        the same, from a RECORDED read
tools/echallan/align.mjs        forced alignment. Shared by both, so they measure identically.
tools/echallan/synth.mjs        pure-DSP audio kit — every sound in the film is generated from numbers
tools/echallan/audit.mjs        proves the beat map: 222 blocks, 14 phases, 87 cues in range
tools/echallan/camchk.mjs       proves the camera and rig tables are monotonic
tools/echallan/shot.mjs         stills + contact strips for inspection
tools/echallan/render.mjs       render, then normalise to limited-range yuv420p  ← ALWAYS USE THIS
tools/echallan/qa.mjs           post-render gates, each expressed as a number
tools/echallan/focus.mjs        does each permission LAND? settled-time floors + the flight profile
tools/echallan/act3.mjs         does the REVEAL land? the two grounds, the held shots, the stolen
                                objects, the front's travel, where the beam's cargo ends up, and the
                                size the hero asset is framed at
tools/echallan/captions.mjs     which edge each caption page stands on, measured off the picture
                                with the captions switched off; --check fails if the bake is stale
tools/echallan/act4.mjs         the outro: the return's geography, its three holds, that the route
                                only ever climbs, that the door shuts IN ORDER and before it is
                                tested, that the message reaches the counter, that the notice is
                                laid on the sill and under the lens and the slip is narrower than
                                the slot it comes out of, and that the sign-off inherits a settled
                                frame
tools/echallan/eye.mjs          the background eye is neither dead nor busy: the longest fixation,
                                the mean pupil rate, and both limits calibrated on approved footage
tools/echallan/cam-profile.mjs  what a camera move is DOING, a quarter-second at a time — position,
                                zoom, screen flow, pan speed, heading. The diagnostic behind every
                                camera fix; a single-number gate cannot show a mid-move speed dip
tools/echallan/cam-keys.mjs     the authored camera keys in a time window, resolved to seconds
tools/echallan/camera.mjs       every camera in the film as screen-space optical flow: no dead stop
                                inside a move, no smear, and no arrival harder than the speed it
                                has to shed
tools/echallan/a3chk.mjs        act 3's clock and camera, printed — `a3chk.mjs clock` for the beat table

src/echallan/narration.json     THE CLOCK. 317 measured words, 222 blocks. Everything derives from it.
src/echallan/design.ts          palette, 12-stop colour script (word-anchored), 7 spring families,
                                one light, type scale, seeded RNG, aperiodic `breathe`
src/echallan/timeline.ts        222 blocks × their primary semantic event, 14 phases, 87 named cues
src/echallan/camera.ts          the camera and the device rig's journey
src/echallan/Film.tsx           layers + parallax + audio
src/echallan/scenes/*.tsx       the v1 film (archive for blocks 1–164; still live for 165+)
src/echallan/v2/opening.tsx     ACT 1 — the hook, the barrier, the install
src/echallan/v2/act2.tsx        ACT 2 — the update, the permissions, the payment. Owns the city's geometry.
src/echallan/v2/act3.tsx        ACT 3 — the reveal and the theft
src/echallan/v2/shell.tsx       act 3's three new objects: the DELIVERY PLANT behind the facade
                                (the act's hero asset), the screen deck, the station
src/echallan/v2/act4.tsx        the recap, the door closing, and the way out — the last 31 s
src/echallan/v2/civic.tsx       the REAL office, on the public side of the wall: act 4's hero
src/echallan/v2/fortress.tsx    the city, the wall, the office, the mast, the satellite
src/echallan/v2/organs.tsx      the four machines a permission buys, and the feeders between them
src/echallan/world/             kit, device, chat, road, system, screens, interior, hand
src/echallan/Sheet.tsx          asset sheet (not part of the film)
src/echallan/Boards.tsx         design boards 03–06 (not part of the film)
```

---

## 4 · Laws this film is built on

- **material, not outline** — every solid has a value ramp + bevel pair. `world/kit.tsx` enforces it.
- **recession is colour, never alpha** — `recede()`. Alpha is for light only.
- **object permanence** — the attachment is the same object as the package, the icon, and the app
  mark. `pkg()` in `scenes/early.tsx` is its whole journey. Nothing is faded out and replaced.
- **a surface is never unmounted while visible** — this caused every seam the metric found. Exit
  travel is `EXIT = SCREEN.h + 60`, and the hand retreats along its own arc to `REST`.
- **no capability before it is granted** — no SMS route before SMS, no tunnel before VPN consent.
- **nothing warns before the reveal** — no red anywhere before `tAt('dropper, and')`.

---

## 5a · What the next phase inherits (blocks 165+, the recap)

At **t = 99.98 s** the world is:

- we are at **the attacker's site**, not in the city: its own ground (q y −426), its own violet
  night, 2400 units up the beam from the app's dish. The city is off-frame and has been since 92.5 s.
- the console has both halves — the **card** in its slot and the **letter** in its slot — the key is
  turned, the accept ring is lit, and the counter reads **4107**.
- a **red line is running back down the uplink toward the city**, out of the lower-left of frame.
  That line is the hand-off: the recap traces the chain it belongs to.
- the machine in the city is intact and running; every organ, every feeder and every breach is
  still there. Nothing in act 3 destroyed anything.
- the camera is at (2372, −640) z 1.00 and the ground colour is at stop 9, the deepest in the film.

The recap (blocks 165–188) is **not built in v2**. `src/echallan/scenes/recap.tsx` is the v1 version
and is the most diagram-like minute of the old film (§7). The v2 grammar it should inherit: every
node is the ORIGINAL asset, and the chain it draws is the one physically standing in the city.

## 5 · What the OLD v1 phase inherited (blocks 72+, archive)

At **t = 41.13 s** the world is:

- the fake service is back in front, at rest, illusion intact; camera 0.966, device rig 0.79
- ground = phase-4 "mild anomaly" ramping toward phase-5 "incremental reach"
- **the interior is open and stays open** — `INT` in `scenes/install2.tsx` holds its coordinates:
  chamber `(50, 1012, 980×508)`, shell centred `(540, 1246)`, payload `(540, 1230, w 176)`
- **the payload is in the chamber and faintly alive** (`live ≈ 0.46`). It must never leave, never
  be redrawn, and never be re-introduced — the reveal at ~71 s re-focuses on THIS object
- no capability node exists yet, and no route exists yet. None may exist before its grant.
- the hand is at `REST`, below frame

The next scene file is `src/echallan/scenes/permissions.tsx` (blocks 72–101: four gates, then the
hasty Allow). Board 03 is the approved staging. The load-bearing rules for it:

1. **every Allow leaves a permanent consequence** — a node unlocks and a route appears, and both
   stay for the rest of the film;
2. **nothing is active before it is granted** — no SMS route before `CUE.smsGrant`, no tunnel
   before `CUE.vpnGrant`;
3. background persistence is **not** a fifth popup (premortem F4) — it is a settings surface plus
   the core continuing to glow after the window recedes;
4. the four gates keep the colours they are given here for the life of the film:
   SMS cyan · calls violet · background amber · VPN teal.

## 6 · Commands

```
node tools/echallan/narration.mjs            # re-measure the read (rebuilds the clock)
node tools/echallan/audit.mjs                # prove the beat map
node tools/echallan/camchk.mjs               # prove the camera tables
node tools/echallan/taps.mjs                 # every contact lands, and nothing else looks tapped
node tools/echallan/splice-check.mjs         # IS EVERY WORD STILL WHOLE? the holds, against the delivered audio
node tools/echallan/focus.mjs                # every permission LANDS: dwell floors + the flight profile
node tools/echallan/act3.mjs                 # the reveal lands, both grounds stay apart, everything taken arrives
node tools/echallan/a3chk.mjs clock          # act 3's clock, every beat off a measured word
ECHALLAN_COMP=Opening node tools/echallan/render.mjs out/echallan-v8.mp4   # ALWAYS a fresh name
node tools/echallan/shot.mjs Echallan 0 600  # stills
node tools/echallan/render.mjs qa-echallan/out/sec12.mp4 0-2480
node tools/echallan/qa.mjs qa-echallan/out/sec12.mp4
```

Render rate is ~46 fps, so the full 7 787-frame film is about **3 minutes**. Performance is not a
constraint (premortem F10 is satisfied).

---

## 7 · Where I would look first

Honest list of the stretches I think are weakest, in priority order. None of them fail a gate.

1. **The recap (97–111 s).** It reads as a grid of labelled cards. Recognition works — every node
   is the original asset — but it is the most diagram-like minute of the film.
2. **The theft packets (85–90 s)** are small at that camera distance; the two lanes separate but
   the eye has to look for them.
3. **The prevention ghost chain (111–117 s)** is an abstract red zig-zag. It retracts correctly
   but it does not *look* like the attack path the viewer watched.
4. **The background-persistence grant (~49 s)** has no surface of its own by design (premortem F4),
   so it is the least legible of the four grants.
5. **Subtitles sit close to the dead band** (~y 1706). The type-scale gate passes, but it is tight.
6. **The pause after "background," is a breath, not silence** — the speaker inhales through the
   whole 404 ms of it at −41 dBFS. The splice goes at the quietest point of it and is inaudible
   under the score, but it is the one join in the film that is not laid into true silence. If that
   sentence is ever re-recorded, a clean half-second there would remove the only compromise left in
   the audio.
