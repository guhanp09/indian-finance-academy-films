# The hand — spec

How a flat, contour-led drawing reads as **a hand with the index finger extended**, and what the
film builds to. Written after four attempts were rejected, and refined over four rounds of
adversarial review, each one trying to break it. The failures are kept because each names a
different way of drawing the right parts and still not drawing a hand:

| attempt | read as | why |
|---|---|---|
| 1 | a mitten | the parts were named, then drawn as a blob with lines on top |
| 2 | "pressing with the little finger" | the PALM side: the folded fingers sat in front of the extended one, so the eye put the extended digit furthest away |
| 3 | a paw with a sausage | back view, but an invented thumb on the near side and no sign of the folded fingers |
| 4 | still wrong | knuckles as overlapping discs, and a LEFT hand on an arm entering from the right |

Two of those were plain bugs — a finger widened from two different bases, and a knuckle normal
that pointed into the hand — and neither is visible in the source. Both were found by measuring the
render. Hence §8: an audit is a measurement of the raster, never a reading of the constants.

**Files**: `src/upi-scam/world/hand-geometry.mjs` (the drawing, in FW units) · `hand.tsx` (places and
paints, nothing more) · `tools/upi-scam/hand-shot.mjs` + `tools/upi-scam/hand-audit.py` (renders that same
module and measures it) · `tools/upi-scam/hand-angles.mjs` (the finger's angle at every tap).

v3 plus round 3. **[R3]** marks what changed. This file is the spec the component is built from.

## 0. Unit, view, scale

- **Unit: FW** = the index finger's width at its base. All geometry in FW.
- **View: the back of the hand.** The tap-icon convention; it holds only while the finger is
  **≥ 50° from horizontal**, coming from below.
- **Scale, per shot [R3]:**

| shot | px per FW | why | floor |
|---|---|---|---|
| phone press, and the phase-F reach for APPROVE | **26 × `stage.s`** | tip 22 px on a 138 px key. Deliberately below life size so the hand never hides the keypad it demonstrates. `stage.s` eases 1.00 → 1.06 across the taps, so a fixed scale drifts ≈ 5 % against the keys. | 24 |
| parent B's point | **the figure's own arm width ÷ 3.70** — 8.1 local units, ≈ 6.5 px at s 0.80 | the hand is attached to a figure drawn far below the phone's scale; see §5 | — |

## 1. The silhouette — ONE closed loop

RIGHT hand, back to camera, finger up: thumb side = −x, knuckles = +x. Apex (0, 0), +y toward
the wrist, finger axis x = 0.

| # | segment | spec (FW) |
|---|---|---|
| 1 | fingertip cap | semicircle, diameter = tip width 0.84, centre (0, 0.42) |
| 2 | finger | straight axis; straight sides tapering 0.84 → 1.00; apex → ulnar notch **3.56** [R3 — the construction's own value, not a rounder number it misses by 0.04] |
| 3 | ulnar web | concave fillet **r 0.10** tangent to the finger's ulnar edge and knuckle 1; its bottom **0.13** below knuckle 1's top [R3]. Knuckle 1 rises ≈ 0.1 from the web — a **low shoulder**. Asymmetric: one long straight wall (the finger), one low rise. |
| 4 | knuckle row | valleys on a line through **V0 = (0.62, 3.56)** at **24°**. **x-steps 1.16 / 1.10 / 0.98** (sum 3.24 → the row ends at 3.86). Chords along the row 1.27 / 1.20 / 1.07; **sagittas 0.36 / 0.32 / 0.26**, graded. Concave fillets r 0.12 between lobes, never cusps. Derived tops, which the audit checks: **(1.05, 3.43) (2.16, 3.97) (3.20, 4.49)**; ulnar extreme **3.88** [R3]. |
| 5 | ulnar flank | the last lobe is **flush**: a straight line tangent to lobe 3, running to the wrist's ulnar point. No notch under it, nothing proud of it. |
| 6 | wrist | y **9.0**, x **−0.50 → +2.80** (3.30 wide), ±0.15. Centre 1.15 on the middle finger's axis; the index axis enters 15 % in from the thumb edge. |
| 7 | forearm | 3.30 at the wrist → **3.70**, reached no sooner than 3 FW below it. One silhouette with the hand — no contour across the wrist. |
| 8 | radial side | wrist → **thenar swell**, peak 0.88 beyond the finger's radial edge at y **6.4** → long shallow **concave** run → meets the finger's radial edge at y ≈ 4.3 → straight up. An S, no corner. **Bounded**: min radius of curvature ≥ **1.0**; height where the offset is ≥ 75 % of the peak between **1.3 and 2.0** [R3 — the upper bound; without it a slab-sided thenar passes every number and reads as a boxy mitten with a cuff, which is attempt #1's failure]; dip inside the peak→wrist chord ≤ **0.15**. |
| 9 | no thumb | folded behind; the thenar is its only evidence. |

**Width steps**: finger 1 → wrist 3.30 → forearm 3.70 → hand across 5.24.

## 2. Why each part reads

- The extended digit is the **INDEX** because the thenar is beside it and every knuckle is on its
  other side. Any *other* lateral bulge changes the gesture: a knob on the ulnar flank makes it the
  little finger; a knob-shaped thenar makes it a finger-gun; a slab-sided thenar makes it a mitten.
- The **knuckles** read as knuckles because they are wide, shallow, graded, one finger-width apart,
  and beside the finger's base.
- The **limb** reads as one object because of the width steps and the finger's axis entering the
  wrist's band — not because an edge is unbroken.
- The **finger** reads as a finger because of near-parallel tapering sides, a round cap exactly the
  tip's width, and a straight axis.

## 3. The bend [R3]

- **Ulnar** — the forearm swings toward the little-finger side below the wrist.
- **Spread over y 8.0 → 10.4** by a smoothstep rotation about the wrist centre (1.15, 9.0). v3's
  8.4 → 9.6 band broke v3's own no-corner rule at 13° (14.5°/0.1 FW) and crimped visibly at 24°.
- **No single value works.** The arm pivots at a fixed off-screen origin, so the forearm's screen
  angle differs at every target, and the finger must stay ≥ 50°. Per target:

| target | forearm | bend | finger |
|---|---|---|---|
| APPROVE | 44.7° | **7°** | 52° |
| PIN 4 | 26.5° | **26°** | 52° |
| PIN 8 | 26.3° | **26°** | 52° |
| PIN 2 | 35.8° | **16°** | 52° |
| PIN 6 | 37.7° | **14°** | 52° |
| phase-F APPROVE (left hand) | 42.8° | **9°** | 52° |

  The bend eases between targets on the same curve as the fingertip, so the wrist straightens and
  bends as the hand travels. **Audited at every tap**, not once.
- **Beyond 13° the no-corner rule applies to the OUTER (radial) contour only**; the inner contour
  of a bent wrist genuinely folds. At 26° the outer side turns 4.2°/0.1 FW and the inner forms a
  14.0° concave fold, with no self-intersection.

## 4. Chirality

- The failure is **silhouette chirality** — which side of the finger the fist hangs on. #2 reached
  it via a palm view, #4 via a left hand drawn from the back. Same silhouette, two routes.
- Arm from the lower **right** ⇒ the viewer's **right** hand. From the lower **left** ⇒ **left**,
  mirrored. `hand: 'right' | 'left'` is **required**; no angle-derived fallback.
- **Phase F reaches APPROVE from the lower left ⇒ `hand: 'left'`, and it is a PRESS**, so it takes
  the press rules and a 9° bend, not the pointing rules [R3].

## 5. The parents' scene [R3 — ruling]

v3's FW 22 produced a hand wider than parent B's 83 px head, with an 81 px forearm (3.4× the
figure's own arm) that had to run 961 px — 44 FW — to touch the card. A real forearm is ~13 FW.
No value of FW fixes a touch from 900 px away. **Decision: the gesture stays parent B's.**

- The pointing hand is drawn **in the figure's own local space**, so it scales with the figure.
- **FW = the figure's arm width ÷ 3.70** (30 local ÷ 3.70 = 8.1 local). The hand is then ≈ 34 px
  across at s 0.80, against the figure's existing 27 px round hand — the same family.
- The arm is **the figure's own arm**: the same curved stroke the chin-stroke gesture uses, same
  width, same skin colour, from the shoulder at local (−86, 208).
- It **points from arm's length and does not touch the card** — total reach ≈ 29 FW. The direction
  carries the meaning; that is how pointing works.
- **`detail: 'flat'`** — flat fill, **no contour, no nail, no creases**. The film's figures carry no
  outline at all, and at 6.5 px per FW the nail would be 4 px. Matching the figure is the rule here,
  not matching the press hand.
- Parent A is s 0.94: head 98 px, arm 28 px, so FW 7.6 px if they ever point.

## 6. Contact

- The contact point is the **pad — 0.42 FW behind the apex**. The component's target is the pad;
  the apex lies 0.42 FW beyond it.
- **No pad flattening** (it faces the glass). On press the tip spreads sideways 3–5 %; nothing
  shortens.
- The arm's drop shadow stays at hover elevation. A **separate contact shadow** fades in with the
  press: a soft ellipse under the pad, **long axis along the finger** [R3], ≈ 0.9 × 0.5 FW.

## 7. Stroke translation

- Silhouette, hand + forearm: one closed path, full contour weight (3 px on screen) — `detail: 'full'`.
- Interior marks: open strokes only, never a closed shape per lobe; 0.7 × weight; full opacity;
  contour colour; ≤ 0.4 FW — **except the nail**.
- **Nail**: open U, 0.60 wide, closed end at y **0.95**, arms ending y ≈ 0.40 (≈ 0.27 short of the
  cap). Position is what makes it a nail.
- **Knuckle creases**: from the fillets between lobes 1–2 and 2–3, 0.35 FW, aimed at the wrist centre.
- `detail: 'flat'` drops all of it, including the contour.

## 8. Audit — on the raster, ≥ 100 px per FW, absolute tolerances

| measure | target | tol |
|---|---|---|
| finger length, apex → ulnar notch | 3.56 | ±0.04 |
| tip ÷ base width | 0.84 | ±0.03 |
| finger axis deviation | 0 | ≤0.03 |
| web depth below knuckle 1's top | 0.13 | ±0.03 |
| knuckle tops | (1.05,3.43) (2.16,3.97) (3.20,4.49) | ±0.05 |
| ulnar extreme | 3.88 | ±0.05 |
| ulnar flank re-expansion / proud of the flank line | 0 | ≤0.03 |
| thenar offset, and its y | 0.88 @ 6.4 | ±0.05 / ±0.2 |
| thenar min radius of curvature | ≥1.0 | — |
| thenar height at ≥75 % offset | 1.3 … **2.0** | — |
| dip inside the peak→wrist chord | ≤0.15 | — |
| wrist span | −0.50 → 2.80 | ±0.15 |
| forearm width at wrist + 3 FW | 3.70 | ±0.10 |
| nail closed-end y | 0.95 | ±0.05 |
| knuckle side vs. arm entry side | right from the lower right | exact |
| bend direction | ulnar | exact |
| turning per 0.1 FW at the wrist | outer ≤6°; inner ≤6° under 13°, concave-only above | — |
| **finger angle from horizontal, at every tap** | ≥50° | — |
| **px per FW** | ≥ the shot's floor | — |

The instrument is validated: it reads the known-good build at min radius 1.24 (true 1.28), and
fails the finger-gun at 0.39 and the slab at its height bound.

**Final gate — a cold read.** Show the upright silhouette and the posed frames to someone who has
not seen this spec and ask: which hand, which finger, back or palm, what gesture.

## 9. Counterexamples and what excludes each

| # | reads as | excluded by |
|---|---|---|
| A | paisley / flame | §1.2 sides + cap, §1.8 S-curve, §1.6 wrist |
| B | little finger | §1.5 flush lobe + flank audit |
| B′ | finger-gun | §1.8 min radius + dip |
| **slab** | boxy mitten | §1.8 height ≤ 2.0 [R3] |
| C | palm side | §4 + the nail |


## 10. As built

- Per-target bends were re-derived from the film's own itinerary rather than taken from the review's
  table: `tools/upi-scam/hand-angles.mjs` reports the finger's angle at every tap, and three targets came
  in at 47.7–49.7° on the review's numbers. Final: APPROVE 7°, PIN 2 20°, PIN 6 19°, PIN 4/8 28°,
  phase-F APPROVE 15° — every tap between 50.3° and 68.8°.
- Two bugs found by the audit during the build, both invisible in the source:
  - the web fillet solved for the **wrong root**, putting its tangent at y 4.9 — below the finger's
    base — so the contour folded back on itself;
  - `bendAt` rotated the **opposite way** to what `place()` assumed, so the wrist leaned radial
    while the aiming maths thought it leaned ulnar. The hand was quietly mis-aimed at every tap.
- The forearm is a single straight tube with no elbow, matching the figures' own elbowless arms.
  At the taps 16–17 FW of it is visible before it leaves frame; anatomy would put an elbow at ~13 FW,
  just inside. Recorded as a deliberate choice.
