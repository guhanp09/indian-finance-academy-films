# Opening (0:00–0:31.6): every transition, and the mechanism that justifies it

Each row is a hand-off between two states. For each one: what physically causes it, what carries over across it, and what was wrong before. Code lives in `src/echallan/v2/opening.tsx`, `fortress.tsx` and `cast.tsx`. Sound for each one is placed from the same clock by `tools/echallan/score-opening.mjs`.

| # | Transition | Cause (what makes it happen) | What survives it | Was |
|---|---|---|---|---|
| 1 | Sky → phone: the message arrives | The green message comet flies from the sky into the phone's screen edge, at the bubble's height. | The comet's direction becomes the card's entry direction (from top-right). | The comet ended in open sky and the card slid in from elsewhere. |
| 2 | Card lands | Its arrival is felt: three motor pulses (the buzz), ring lines, and a settle. | – | – |
| 3 | Phone → street (pull-back) | The camera retreats; the street rises quickly. The phone travels on a lead so it stays over the person's hand the whole way. | The phone itself, continuously. | The phone floated half a screen away from the hand mid-move. |
| 4 | Notice plate → car plate | The plate lifts off the notice, arcs across, and clacks onto the car's own plate. A tick confirms the match. | The plate object. | – |
| 5 | Car plate → notice | As the camera pushes back in, the chip flies back into the notice it came from. | The plate object returns to where it was parked. | The chip just faded out. |
| 6 | Fee stamped | A stamp drops from above frame, strikes on "due", and lifts away, leaving its mark. | The mark stays. | – |
| 7 | Attachment → parcel | The parcel lifts out of the file tile's glyph and leaves the glyph hollow. | The emptied tile shows where it came from. | – |
| 8 | Tap → dive | A fingertip presses the parcel. The parcel sinks into the glass, an iris opens from that exact point, and the camera dives through. | The tap point is the iris centre, and the parcel goes through the glass. | – |
| 9 | Glass → interior | The parcel falls from the camera's side (it was pushed through the glass), large and near, and WhatsApp's drone catches it on its hook. The drone dips under the weight. | The parcel, continuously, from tap to hook. | The parcel vanished at the tap and reappeared on a courier. |
| 10 | Drone → field (×2) | The field stops the parcel. It flares amber with hex ripples, the drone is thrown back (tilt), and the parcel swings on its tether. The second hit is identical: it's a rule. | – | One hit only. The wall was cartoon merlons. |
| 11 | Warning appears | The shield is raised out of the field emitter at the impact point. It rises, spreads, and locks, and is mounted on a mast on the crest. | – | The shield dropped in from the sky. |
| 12 | Store gate | Apps ride the conveyor, whose chevrons point into the gate. Each is scanned, earns a tick at the curtain, and passes behind it. | – | – |
| 13 | Drone at the door → panel wakes | The drone's light pings the panel. The panel's screen changes from a padlock to the source (chat icon → doorway), and ALLOW starts pulsing. | The panel was on the wall from the first frame inside. | The switch appeared from nowhere on a signpost. |
| 14 | Warning pushed aside | The user's hand (the UPI rig, same placement as the UPI film) pushes the shield. It swings back on its crest hinge and falls behind the wall. | The hand continues to ALLOW. | – |
| 15 | ALLOW → doorway | The button cap travels down and bottoms out, then a pulse runs the visible conduit. Three lintel bolts withdraw up into the beam (lamps red → green), the field over that panel dies, and the panel grinds down into the ground and lands. Warm light spills out onto the violet ground. | The lintel stays, so it reads as a doorway, not a missing piece. | A toggle on a sign beside a wall section that slid away with no connection. |
| 16 | Parcel through the door | The drone carries it through, crossing the wall's plane inside the opening, sets it down and unhooks it, then rises away over the wall. | The parcel. | The parcel hopped over the wall by itself. |
| 17 | Parcel → office | The flaps open. The office builds itself out of the box in construction order (plinth, columns, beam locks, pediment, seal, flag), and the cardboard collapses under it. | The box becomes the building's footprint. | A puff, and the office rose from bare ground. |
| 18 | Interior → home screen | The camera pulls back out through the glass. Buildings fold flat onto their bases like a pop-up page closing, and each rooftop sign detaches to its home-screen slot. Far-row signs unfold off their roofs first, and the store's apps drop into the dock. | Every icon is a sign that was already there. | – |
| 19 | Office → new app | The office's seal leaves its pediment and lands in the one slot left open, with a badge, as the office folds away. | The seal is the icon. | – |
| 20 | Icon → app | The icon expands into the app window (the platform's own launch motion). | – | – |

## Colour, by territory

- **Violet ground outside the wall:** the same night the scam arrived from on the street. Whatever comes from outside keeps that cast.
- **Steel-blue wall with a cyan field:** Android's install protection. Cyan means system trust throughout the film.
- **Navy city with warm windows behind the wall:** the apps, and what's in them. The warmth is what's at stake, and it spills out when the door opens.
- **Amber:** the system's warning.
- **Green ✓:** permission.
- **WhatsApp green:** the source.
- **Cobalt:** the fake office's borrowed authority, in the same blue as the e-Challan service it opens into.

## QA

- `node tools/echallan/taps.mjs`: every contact (tap the file, push the warning, ALLOW) lands with a 0.0 unit miss, arrives from more than 40 units away, and has settled at contact.
- `node tools/echallan/score-opening.mjs`: in the speech band (300 Hz–4 kHz), while the narrator is speaking, the voice clears the ducked bed by a median of 17.7 dB, and by 9.1 dB in the worst 10% of windows. The script fails if the median drops below 12 dB or the worst decile below 8 dB.

---

# Act 2 (0:31.4–1:05.0): every transition

Same rules. Code is `src/echallan/v2/act2.tsx` with the interior pieces in `fortress.tsx`; sound is placed from `CUES2` by the same score script, so act 1 and act 2 share one continuous arrangement.

| # | Transition | Cause (what makes it happen) | What survives it |
|---|---|---|---|
| 21 | App → update card | The app pushes the card up from inside itself, and dims its own screen behind it. | The fake service stays underneath, unchanged. |
| 22 | Update card → Android's installer | Tapping INSTALL UPDATE makes the app ask to install a package, so the system's own sheet slides up over it — cooler, heavier, in the wall's steel and cyan, carrying the package's identity. | The app's icon appears on the system's sheet. |
| 23 | Installer tap → dive | The iris opens from the exact point the finger touched and the camera goes through the glass — deliberately the same move, and the same sound, as the first dive. | The tap point. |
| 24 | Outside → the city | The "update" comes in along the violet ground from outside the wall and passes through the doorway the user cut open at 0:23. | The doorway is still open, and still lit. |
| 25 | Payload → office | The office's own dark door swallows it. A light keeps breathing behind that door for the rest of the film. | The payload, alive and never removed. |
| 26 | Payload → mast | A mast rises from the office roof carrying four empty sockets. | The sockets are what the four permissions will fill. |
| 27 | Mast → asking | The mast pings once and the first panel wakes; the permissions have a cause on screen. | |
| 28 | Each ✓ → a live cable | The same ✕/✓ panel the wall taught at 0:22, now on each place the app wants into. On ✓ a cable in that capability's colour strings to a mast socket and stays. | The four colours are the ones the theft and recap acts reuse. |
| 29 | Background granted → the city sleeps | The city's windows dim away from the office; the one building allowed to stay awake stays lit. | |
| 30 | VPN consent → the tunnel | A bore leaves the office, passes under the wall, surfaces on the violet side and runs out of the city. | The route the stolen data leaves by later. |
| 31 | Hasty Allow | The panels now pop on the office itself, one after another, and the hand hammers ✓ without pausing to read. | |
| 32 | City → phone | Pull back out through the glass, mirroring the dive. | The app is exactly where it was left. |
| 33 | Challan → payment form | PAY NOW expands into the form; ₹1,000 carries across as "Paying ₹1,000". | The amount. |
| 34 | Form → receipt | PAY, a short spinner, the tick draws rather than popping, the receipt settles, and everything else in frame stops moving. | The false ending the reveal will break. |

## What is under the glass during the payment

The premortem's F5 problem: at phone size, after H.264, a 10–15% contrast line is gone, but raising it would make the payment scene feel dangerous and the victim unbelievable. So the four granted routes are carried by **motion instead of contrast** — a slow drift in the empty lower third of the payment screen, where nothing else is competing. It is visible because it moves, not because it is bright.

## Act 2's own checks

- All ten of act 2's contacts pass `tools/echallan/taps.mjs` (thirteen across the film), each with a 0.0 unit miss and a real approach.
- The mix gate covers the whole 65 s: voice over ducked bed, median 19.4 dB, worst 10% 9.7 dB.

## The 0:00–1:05 render

`out/echallan-first65.mp4` — 1080×1920, 60 fps, h264/yuv420p, AAC 48 kHz, 65.045 s.
`tools/echallan/qa.mjs` passes on it: 0 blank frames, **0 cut-like seams** (median frame delta
1.76, max 24.77 — all of the peaks are designed moves: the pull-back at 5.5 s, the push-in at
7.9 s, the two dives), longest frozen run 0.10 s, nothing in the Shorts UI band.

Two defects QA caught in act 2 and what they were:
- **A cut at 56.47 s.** The dive opened an iris through the glass but the pull-out never closed
  it, so the interior vanished in a single frame when its visibility test flipped. The pull-out
  now closes the same iris it opened, revealing the app underneath from the edges in.
- **Anything standing on the plaza has to be drawn after `<Plaza>`.** Both the payload and the
  VPN tunnel were drawn before it, so the ground painted over them — the payload, which the whole
  reveal depends on recognising later, was invisible for its entire approach.

---

# Act 2, revised: recognition and motion

The first build of the permission sequence was a diagram wearing a city as a costume — floating
panels carrying icons, parked beside buildings, joined by glowing arcs with dots travelling on
them. It was rebuilt against three tests: **is every asset instantly recognisable**, **is every
motion tied to the nature of the thing that moves**, and **does the permission logic belong to
this world natively**.

## Every capability is a place you could point at

| Permission | The place | How you know what it is |
|---|---|---|
| SMS | the post office | a building-sized envelope on its gable and a letter slot in its face |
| Phone calls | the telephone exchange | a shopfront-scale handset, over a hall of switch windows, under a mast of cross-arms |
| Running in the background | the substation | a transformer tank with bushings, cooling fins and a bolt on its face |
| VPN | the wall itself | the one system-level consent, on the structure that is the system |

The panel, the building and the traffic on the line all say the same thing: the SMS junction wears
an envelope, stands on the post office, and carries letters.

## A granted permission is a connection, not a line

Each one is: a junction box **bolted** to the structure it governs (post, base plate, bolts), a
**socket** under it with a lamp, and a cable the office **pays out** — a plug head travels the
span and seats in the socket, and only then does the line carry anything. What it carries is what
the permission gave away: letters off the post office, current off the substation.

## Motion follows the object

- **The update is flown in, not slid.** It arrives under the app's own cobalt drone — the same rig,
  physics and read as WhatsApp's green one in act 1, in the colours of whoever sent it. It is large
  and legible on the approach and recedes as it passes through the opening, so the shrink is
  perspective rather than an object getting smaller.
- **The payload hangs.** It tips the drone into its travel and lags behind it on the tether,
  because it is the densest thing in the film.
- **The wall's own panel recedes.** Granted half a minute earlier, it stays lit but dim, instead of
  competing with whichever junction is being pressed.

## The hand does not cover what it is granting access to

Chirality is **declared per leg**, never derived from the angle mid-move (the UPI rig's own rule).
The post office and the exchange stand on the left of the city, so the **left** hand works them
from the left edge; the substation, the wall and the office are worked by the **right** hand from
the right. Between the two sides the hand genuinely leaves frame rather than flipping over in the
air — which also buys the one clean beat where all three facilities are readable at once, with no
arm across them.

The substation's bolt is drawn heavy with its own outline, because at the distance the city is
framed from, a thin zigzag read as a squiggle rather than as electricity.

---

# The asset and environment pass

The city was reading as a diagram: flat boxes with icons applied to them, marks floating in the
air, and connections drawn as strokes. Everything below is now built the way the thing itself is
built, so the mechanics have something real to happen on.

## The app's own building

It had a black rectangle where its entrance should be. It now has:

- **A portal, not a hole.** A framed opening with jambs and a lintel, one door leaf standing open
  against the jamb, and a warm lobby that recedes into the building. This is where the update is
  taken in, and the light that stays behind that door for the rest of the film is the payload.
- **A service spine.** A shaft running from the lobby to the roof deck, with the mast mounted at
  the top of it. This is the causal path, drawn: what arrives below travels up it, and the mast is
  what comes out of the top.
- **Storeys behind the colonnade**, lit, so the building is occupied rather than hollow.
- Columns with bases, flutes and capitals; an entablature with architrave, frieze and a dentil
  cornice; a pediment with a recessed tympanum carrying the seal as relief; steps up to the plinth.

## The other structures

- **Every building** gets pilasters, a lit edge and a shaded edge, a parapet cap with its own
  shadow, and a plinth — so it stops being a rectangle.
- **The post office** is a sorting hall: gable and ridge, a clerestory band over the sorting floor,
  a canopy on brackets over the posting slot, and bay doors at street level.
- **The exchange** is an exchange: a roof gantry carrying cross-arms with insulators, banks of
  switch-hall windows, and a cable head where the lines enter the building.
- **Roof signs are signs**: a steel frame on legs bolted through the parapet, a visor over the
  tile, and the sign's own spill on the roof beneath it. One per building — the duplicate emblems
  applied to the facades are gone.
- **The store's mark is carved into the gateway beam** — a recess with a shadowed upper lip and a
  lit lower chamfer. Nothing floats above the city.

## The connections

- **Overhead line plant**: a dark conductor with a lit crown, terminated on insulator stacks on
  brackets at both ends, run out by a plug head that seats into the socket. Letters hang from the
  mail line on hangers; current runs inside the conductor rather than as dots beside it.
- **The VPN is civil engineering**: a headwall portal with wing walls and an arch cut into it,
  and a kerbed trench of cover slabs running away out of the city, with the traffic visible in the
  seam between them.

## The mast

The four services terminate on it, so it is built like something they could terminate on: a
tapering braced lattice on a bolted roof frame, with a head platform and beacon, and a terminal
box, insulator pair and lamp for each service. It was the last object still drawn as a pole with
beads on it, in a scene where everything around it had been rebuilt.

## What is still true, and what is not

- The app building's lit lobby reads during the delivery, seen through the wall's doorway. At the
  wider permission framings the wall hides the building's lower half, so the portal is not doing
  work there — the colonnade, entablature and pediment are.
- Motion smoothness cannot be judged from stills. The delivery is one spline through its
  waypoints, and frame spacing at 4 fps is even, but only playback confirms the feel.

---

# Round 4: the UI, the object chain, and the flight

## The chat is WhatsApp

Dark ground (#0B141A) with the wallpaper's faint doodles; a #1F2C34 bar carrying back, avatar,
name, number, video, call and overflow; a TODAY pill and the unknown-sender notice in #182229;
incoming bubbles in #1F2C34 with a tail off the upper-left corner and the timestamp inside the
bubble at bottom-right; the composer as a pill with emoji, placeholder, attach and camera, and a
round green send key. The document row inside the bubble is how a received file actually looks.

## The update prompt is a dialog

A raised card with its own margins, content inset from every edge, and its actions on a row that
sits **above** the bottom edge — a plain-text LATER beside the filled INSTALL UPDATE — instead of
a button welded to the card's lower border.

## One object, from the button to the building

The failure was that the drone arrived carrying something the viewer had never seen. Now the
**installer sheet carries the payload itself**: the capsule is the sheet's icon, so pressing
INSTALL is visibly pressing on that object. On the press it sinks into the glass at the point the
finger touched, the iris opens from there, and inside the city the same capsule falls through,
decelerating, and the app's own drone takes it on the hook — the exact grammar act 1 taught with
the first parcel. It is then lowered on the tether into the lobby, where it **stays**, lit, for
the rest of the film. Nothing appears from nowhere and nothing is deleted.

## The flight is deliberate

A single spline through all the waypoints made the craft rush through the middle. The flight is
now a list of **moves with holds between them** — accelerate, cruise, decelerate, hover — each
eased on its own, because a drone really does stop and hold station. It banks into its travel,
stands up when it stops, dips when the load arrives on the hook, and never sits perfectly still.

## Asking is a physical act

When the mast asks, it **runs its line out** — the conductor pays out from the mast and stops
short of the socket, with the plug head hanging there unconnected. Pressing ✓ is what seats the
plug. The request and the grant are one continuous mechanical act rather than a panel lighting up
next to an unrelated wire.

## The VPN is a pipeline

A valve manifold on the app's own building, a main that climbs over the boundary wall on trestles
and runs off out of the city, and a wheel that turns when the permission is given — after which
the city's traffic visibly runs out through it. The buried trench read as ambiguous; a pipeline
with a valve does not.

---

# Round 5 — what was reported, what was actually changed

Each row names the mechanism that was wrong, not just the symptom, and what replaced it.

| Reported | What it was | What it is now |
|---|---|---|
| WhatsApp UI not convincing; composer icons bad | Attach and camera sat 6px from the pill's right edge, overlapping each other and crowding the send key | Both icons moved inside the pill on computed positions with even spacing and a real margin; the camera is drawn as a camera (body, bump, lens) rather than a box with a circle |
| Install Update popup not a popup; button on the edge | The button's lower border **was** the card's lower border; the label was 209px in a 222px button (6px/side) | Card is 404px with the action row inset 28px from the bottom; button 268px, label 189px → 40px each side; a plain-text LATER makes it a dialog with a choice. A new check, `tools/echallan/qa-labels.mjs`, fails any button whose label does not clear its edges by 14px |
| Drone's cargo not connected to pressing Install | The installer sheet showed the *app icon*; the drone then arrived carrying an unrelated capsule | The update **is** a cased folded antenna (`UpdateTile`). It is the dialog's own glyph, so you press INSTALL UPDATE on that object; it sinks into the glass at the tap point, falls through, and the drone takes that same object on the hook |
| Drone motion jerky, too fast in the middle | One Catmull-Rom spline with uniform parameterisation — speed spiked between widely spaced keys | Discrete **moves with holds**: accelerate, cruise, decelerate, hold station. Each eased on its own, with banking from measured velocity and a dip when the load lands |
| Drone doesn't fly through the gate | It hovered *above* the wall and lowered on a tether; it never entered the opening | The route now passes **through the doorway** (lined up, through, then climbing behind the wall), at a scale that fits the 220-unit opening |
| The update vanishes, then the antenna rises | The payload was swallowed by a door and a separate mast rose elsewhere | The drone sets the case **on the roof**, and the mast telescopes **out of that case**: latches, panels hinge flat into the base plate, three stages extend, and the seal rides to the top as the beacon |
| Permission plugs run the wrong way | Lines grew from each building **to** the mast | Lines now run **out from the mast** to the place each permission opens; the plug head travels outward and stops short until ✓ seats it |
| VPN metaphor unclear | A buried trench, then a pipeline | A **satellite**: it climbs out, its solar wings unfold on their hinges, the dish gimbals up to look at the sky, and only then does it transmit |
| Background permission not shown | Only a local dim around the office | The app takes over **every lit window in the city**, sweeping building by building from warm to cold — no new objects, nothing competing for attention |
| Flag on the app's building | A cobalt flag on a pole | Removed |
| App opens with no tap | `appOpen` was driven by the clock alone | A hand returns and taps the icon; the launch window is released by that press, and the contact is proved by `taps.mjs` |
| Gate popup stays active after Allow | It stayed lit for the rest of the film | It **shutters**: a cover slides down over the face and it becomes a flush hatch with a green lamp |

## Script changes

- "Then it asks you to “Install Update.” You tap that too, go through another Android installation
  or security prompt, and the update installs." → **"Then it asks you to install an update, you tap
  that too, and the update installs."**
- "You hastily press Allow on everything so you can get to your challan." → **"After allowing all
  permissions, you finally arrive at the challan payment screen."** No finger approving generic
  prompts is shown on this line; the permissions were already granted before it.

Both sentences were re-fragmented to **the same block counts** (16 and 9), so the film's 218-block
map still reconciles and no downstream beat index renumbered. The read was re-synthesised and
re-measured; act 2 now runs 31.07 → 61.87.

---

## The permission mechanisms — the wire scrapped

The wire system (`Line` / `Socket` / `SupportPole`) was the weakest part of the film and is being
replaced. Candidates are built in `src/echallan/v2/permits.tsx` and rendered **in the real
interior** by the `PermBoard` composition, which maps `frame = option * 3 + state` so
`tools/echallan/stills.mjs` can shoot all 18 variants with no inputProps plumbing. The board is
`docs/echallan/permission-options.html`; its stills are `docs/echallan/perm/f0…f17.png`.

**The law they are built on.** Granting a permission does not deliver hardware to your building.
It converts the building's **own working part** — the part hinges, extends or lifts, and its
working surfaces turn cobalt. Your building; their function. No wire, no delivery flight, no icon.

**What the environment allowed**, which ruled out the first two "recommended" options entirely:

- The film has **no cut-away language** — every building is drawn solid, so nothing can happen
  inside one. Sorting halls and relay racks would introduce a language that appears nowhere else.
- The wall hides everything below `y 820`, and the Play gate's lintel crosses the post office
  below `y 700` — so a mechanism has ~90 units of room under the slot and must be wide, not long.
- Buildings are 130–186 units across. The old permission panel was **208** — wider than the
  building it sat on. Nothing in `permits.tsx` exceeds ~144.

| Defect found while building the board | What it was | What it is now |
|---|---|---|
| The exchange's roof gantry and its identity sign were drawn **through each other** | Gantry occupied `top-104 … top+4`, the sign `top-107 … top+8`, at the same `cx` | The gantry stands on the **left half** of the roof (`cx-48`, arms 58 wide) and the sign on the right (`signCxOf()`, `cx+26`). That separation is what freed the handset to become a mechanism |
| The satellite's solar wings **folded shut as it climbed** | `rotate(sx * wings * 90)` — at `wings=0` they were already deployed, and they rotated to vertical as it rose | `rotate(sx * (1 - wings) * 88)` — it rides up folded against the body and the wings swing out on their hinges as it climbs |
| Permission apparatus read as bolted-on foreign equipment | Cobalt boxes clamped to a facade they had no relationship with | Outer shells use the building's **own body colour** (`bodyOf()`), only the working surfaces are cobalt |
| Candidate cameras were the film's wide framings | The post office is 167px in a 1080 frame at `z 0.9` — any mechanism is invisible | Each permission beat **pushes in** on the building it opens (`z 2.1–2.3` for SMS and calls) |
| CALLS·A was a cup feeding a twin-reel recorder | Rebuilt twice; still read as a snowflake on top of the sign at the size the film shows it | Replaced with **the extension** — a second cobalt handset lifting off the same cradle. A mechanism that needs a close-up to be legible is the wrong mechanism |

**The four candidates**, on one axis so the film keeps a single rule about what a permission costs
you: **copy** (nothing of yours stops) versus **seize** (yours goes dark).

| | SMS — the posting slot | CALLS — the handset on the sign |
|---|---|---|
| **A · copy** | A chute telescopes out of the facade into a hopper; every letter posted drops a second letter in. A letter is still going into **your** slot | A second handset, in cobalt, lifts off **the same cradle**, cord running back to yours. Yours never leaves its hook |
| **B · seize** | A plate is bolted over your slot; their collection box rides up the facade's rails and seats beneath it | A fork lifts **your** handset off the hook; it hangs on its coiled cord and the sign wears a dark, empty cradle |

`BACKGROUND` and `VPN` are **not** offered as choices — both were already directed. They are on the
board rendered in the same environment for confirmation only.

---

## The permission mechanism, rebuilt on the wall's own grammar

The candidate mechanisms failed a simple test: described with the sound off they read as *"a chute
opens under a post office and letters fall into a box"*. Nothing said who opened it, who receives
it, or that the viewer allowed it. Two links were missing, and both were structural — the app was
never in frame, and the granting was never depicted. Removing the wire had taken the connection
with it and left a colour code doing three jobs it cannot do.

**The correction.** The grant is the **same act every time** and should look the same every time;
only the consequence differs. So each building gets an Android **service hatch** built from the
boundary wall's own grammar — the protection's shield cast into the leaf, bolts that retract, a
lamp red → green, a leaf that sinks exactly as the door panel sinks. The hatch is also the
aperture: what is behind it is the thing the permission gives away, so one object carries the ask,
the grant and the consequence. Five beats: ask · grant · collect · carry · deliver.

**Status: proven on SMS only, pending approval.** `GrantHatch` + `CapGlyph` live in `fortress.tsx`;
`SmsHatch` and `MastIntake` in `permits.tsx`; the board is the `PermBoard` composition at five
frames per option. Act 2 still plays the floating dialog panel and the wires.

| Fix applied this round | What it was | What it is now | Proof |
|---|---|---|---|
| The wall's lintel bolt could not be reused | `LintelBolt` hardcoded `F.wallTop + F.lintelH`, so a building hatch would have needed a second copy — the asset drift the production rules forbid | `Bolt3` takes its own head beam and scale; `LintelBolt` is a thin wrapper passing the wall's numbers. The hatch uses the **same** asset | Re-rendered `PermBoard` f12 and diffed the raw IDAT against the pre-refactor still — **identical bytes** |
| The drone's rig was WhatsApp green on the cobalt drone | Tether, hook and rotor hubs hardcoded `#0B3B2E` even when `body`/`bodyDark` were overridden — the source's colour on the fake app's courier, a colour-law violation | `rig` prop, defaulting to that exact green so both existing call sites are unchanged by construction; the app's drone passes cobalt | Rendered `Echallan` f2220 (drone mid-flight) before and after — **identical bytes** |
| `CapGlyph` existed in two files | I added a copy to `fortress.tsx` for the hatch while `act2.tsx` still defined its own — two copies that would drift | One copy in `fortress.tsx`; `act2.tsx` imports it | `tsc` clean; film frame renders |
| The sack read as parked on a shelf | It hung at y650, dead on the top row of letters at y648 | Tether shortened so it hoists into the upper cell, and that row is cleared into it — and **stays** cleared through the carry and deliver beats | Re-rendered and inspected at magnification |

**A trap worth knowing about, not yet changed.** `tools/echallan/render.mjs` renders
`process.env.ECHALLAN_COMP ?? 'Echallan'`. `Echallan` is the **abandoned legacy film** — at 43s it
plays a flat schematic panel labelled DEVICE / APP with four capability squares and two curved
lines. The delivered renders are the **`Opening`** composition (the fortress). Any render run
without `ECHALLAN_COMP=Opening` silently ships the wrong film. Left as-is pending a decision.

---

## The mast, the hatches, and three bugs found by testing rather than looking

### The relay mast — rebuilt as a receiver

The old mast was a thin dark stick: ~287px of a 1920 frame, no material, terminations invisible,
and the case the drone delivered was not readable at its base. It is now a lattice tower that
carries **four shuttered intake buckets into the air as it telescopes**, one per capability,
colour-keyed and labelled — so the permission system is legible *before* the first grant. Every
stage lands on its own existing sound cue (latches 38.10, case opens 38.26, stages 38.52/38.72/
38.92, locks 39.05, asks 39.22), and each bucket is mounted on the segment that carries it, so
they rise with the mast rather than appearing once it has finished.

**Verified by five blind reads** — one frame, no context, each time:

| | verdict 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| sending / receiving | sending | **receiving** | sending | receiving | receiving | **receiving** |
| icons tellable apart | n/a | no | no | no | yes | **yes** |
| icon legibility | — | — | — | 2/5 | 2/5 | **3/5** |
| beacon vs gable emblem | — | — | same | same | **different** | **different** |
| mast rank for attention | — | — | 6th | 5th | 4th | 4th |

The reversal at verdict 3 was mine: enlarging the rims to fix a visibility score made the taper
more horn-like and flipped "receiving" back to "sending". **A truncated cone is geometrically a
horn** — the read cannot be stabilised by tuning it. Only changing to a flat-bottomed bucket with
a bail handle settled it, and the bail then turned out to be drawn *under* the rim and painted
out entirely, which is why the first bucket pass still read as ambiguous.

| Defect found | Cause | Fix |
|---|---|---|
| Vessels read as loudspeakers broadcasting | a tapered cone is a horn silhouette | flat-bottomed bucket + a bail handle over the mouth, drawn **over** the rim |
| Shaft read as "a drill bit or an auger" | X-bracing so dense and regular it read as a screw thread | sparse bays with a horizontal chord at every node |
| Four capabilities indistinguishable | rims colour-keyed only once granted; two glyphs collapsed to the same shape at size | rims carry colour from birth; background → a **clock**, VPN → a **route-out arrow** |
| Icons "washed out, I had to stare" | the rim ellipse crossed in front of the plate and ate the top of every glyph | plate moved clear of the rim (separation, not dimming — the rims carry the 4/5 visibility) |
| Beacon read as a second copy of the gable emblem | concentric ring + glyph **is** badge language | the seal opens into a **lamp** — cowl and lens, no rings — on the lock beat |
| SMS and VPN colours indistinguishable | `#2FD0D8` vs `#1D8E9E`, ~6° apart in hue | VPN moved off the cyan family to `#E2569B`; token renamed `vpnTeal` → `vpnRose` in both palettes |

### Three bugs that only testing found

| Bug | Why it was invisible | Fix |
|---|---|---|
| **Three of four hatches had no leaf and no contents** | `gid()` is keyed by its string, so a constant key gave every hatch one shared `<clipPath>` id — and SVG resolves duplicate ids to the **first in document order**, so every hatch clipped itself to the SMS hatch's rect. Only the first one on screen ever worked. | ids made per-instance |
| **The caption was clipped at the frame edge** | `splitLines` broke lines on each word's **base** width, but the spoken word renders at `ACTIVE_SCALE` 1.16 — so a full line overflowed the moment its widest word was spoken. Found by a blind reader, not by me. | reserve the emphasis growth at break time |
| **Long designed holds were being swallowed by the aligner** | `align.mjs` snaps onsets to the silence detector, so short holds appear in the measured word times and long ones do not. Measured gaps at the seven anchors: 0.53 / 1.50 / 1.56 / 0.43 — then **0.058 / 0.080 / 0.077** where the real pauses are 0.60s, 1.05s and 0.46s. **`fine.` and `malware.` are original holds: the film's designed pause at the false ending has never actually been playing.** | **any cue must anchor off the block BEFORE a long hold, never the one after it** |

That last one was crashing the film: `A.end = B(111)` sits after the `fine.` hold, so it measured
early, landed before the payment resolution finished, and threw `FOCUS2 key 28 runs backwards`.
`out: B(93) + 0.30` had the same fault and was truncating the VPN beat. Both now anchor off
`B(92)` / `B(110)`.

### Pacing — the holds that buy the mechanism

Anchors resolve against a moving `from` pointer and **`"SMS,"` occurs twice** (word 105 at 40.60s
in the permission sentence, word 194 at 77.58s in the theft sentence). Appended at the end of the
array they resolved past the first and silently targeted the wrong sentence — the run threw only
because `"calls,"` does not exist that late. They must sit in **script order**.

| | before | after |
|---|---|---|
| SMS | 2.26s | **3.04s** |
| CALLS | **1.48s** (0.35s to collect, carry and deliver) | **2.99s** (1.51s) |
| BACKGROUND | 3.11s | **3.31s** |
| VPN | 2.72s | **3.42s** |

Read 122.98s → 126.08s; `Opening` 3520 → 3681 frames; mix rebuilt at −14.0 LUFS, masking gate
11.0 dB worst decile. The script is unchanged — not a word added, removed or reordered.

---

## The collection run — making the theft an event instead of a tableau

Every blind read of the mast said the same thing in different words: *"nothing is shown leaving
them"*, *"the 'in' reading is inferred, not asserted"*, and finally *"nothing is being put in. The
four pails are just sitting there, already occupied."* The buckets were legible; the **taking**
was not. This round built it.

**The route.** The drone used to fly off-screen once the mast was up. It now sweeps left to right
— post office (97) → exchange (280) → chat tower (445) → bank (968) → mast (690) — arriving at
each hatch exactly as that permission is granted, then closing on the mast. A shuttle
(mast→hatch→mast per capability) was rejected on arithmetic: it needs ~870 units/s inside a 1.36s
window and reads frantic. The sweep runs 47–244 u/s.

| Fault | Cause | Fix |
|---|---|---|
| No hook at the pickups | `carry` was gated on the load, and the load is empty at the exact moment of collecting | `carry` follows the tether as well as the load |
| The hook stopped above the hatch | the tether is drawn inside the drone's own `scale(s·DRONE_G)`, so a reach of 162 local is only ~94 world units | aim into the hatch, not at its lintel |
| The carried load never appeared | crates were sized 44×32 to match the mast buckets — but the buckets are world-space and the parcel slot is inside the drone's scale, so they rendered at ~half size | the load is drawn in **world space** beside the drone, not through the parcel slot |
| The load was dragged into the hatch at every pickup | the parcel hangs at `line + 52`, and `line` is long during a collection | same fix — the load rides under the pod; only the hook descends |
| Half the unload played to an empty stage | it ran `A.out − 0.62 … A.out + 0.56`, but `cam2()` starts the dive-out **at** `A.out` — the last two crates landed into a dissolving interior | unload finishes at `A.out − 0.14`; crates launch from `drone2At(t)` so they fly ahead while the drone is still closing |
| Crates passed *behind* the buckets | they targeted `py + 14`; the bucket's mouth is its rim at `py − 14` and the body runs to `py + 28`, so each crate was swallowed by the front wall while still 28 units too low | arrive **at the rim** and shrink through it — the same occlusion then sells the delivery instead of hiding it |
| **The delivery could not register at all** | **every bucket already wore its capability glyph from the moment the mast deployed.** A crate arriving with the same glyph as the bucket it enters changes nothing on screen — the mast was a finished trophy rack before it had taken anything, and a loose crate read as *"a stray decal"* | buckets start **empty** — rim and dark cavity only — and gain their contents when the crate lands. `filled` is a separate signal from `lit`, because `lit` fires at the grant, well before the crate arrives |

That last one is the general lesson, and it cost the most to find: **a container that already
displays its contents cannot depict receiving them.** Arrival has to change something.

Verified frame by frame at 50.90 / 51.25 / 51.55 / 51.85 / 52.05: all four buckets empty before
the run, then filled one at a time in order as each crate lands, with the drone's four-crate stack
legible alongside.

**A note on measuring this.** The camera is mid-pull-back through the unload, so the mast travels
diagonally across the frame (fx 423 → 687 between 51.20 and 52.10). A fixed crop window returns
empty sky for the early beats; every crop has to be computed per frame from the `FOCUS2` keys.

**The taps, and why three of the four grants were lying.** `tools/echallan/taps.mjs` failed
`allow calls` after the rewire — but not as a miss: the fingertip was exactly on the button
(`miss 0.0`). It failed `0.5s before 37`, against a rule requiring the tip to be **>40 units away**
half a second earlier. The finger was already parked on the control and never visibly arrived.
`allow SMS` scored exactly **40** — passing by a hair — and background and VPN only 53 and 38.

The cause is **the easing profile, not the distance**. `handQ2` eases every leg `inOut`, so the
final half-second of a long leg is the flat tail: the hand creeps the last few units however far
back it began. Adding a retreat waypoint made it *worse* (two failures instead of one), because
retreating further does nothing about a tail that is flat by construction.

The fix is a short, late approach: the hand loiters at a standoff and covers the distance in the
last 0.55s. `inOut` still decelerates into the button, so contact speed stays far below the 400/s
ceiling while the half-second-before distance becomes large. The already-passing contacts confirm
the pattern — `ALLOW` scored 487 and `PAY NOW` 630 precisely because their legs begin near the
contact and are still travelling.

| | before | after |
|---|---|---|
| allow SMS | 40 (marginal) | **415** |
| allow calls | 37 **FAIL** | **549** |
| allow background | 53 | **556** |
| allow VPN | 38 **FAIL** | **493** |

All twelve contacts now land, at 170–198/s contact speed.

**One more attachment law.** Moving the carried load into world space fixed its scale but severed
it from the aircraft — a blind read: *"no claw, cable, hook or grabber, so whether it is carrying
that tile is a guess."* Nothing may float beside a carrier unattached; the load hangs from a
visible hanger and hook.

**Two legibility faults the QA gate could not see.** Both came from blind reads, and neither is
the kind of thing a numeric check catches.

*Empty versus full.* The buckets signalled their state only by a 40-unit pale plate appearing on
the body — about 15px at full frame — inside a cavity that was near-black either way. A blind
viewer: *"empty vs full is not clearly signalled... at normal size they look almost identical."*
The state now lives on the **mouth**: black cavity and a thin steely rim while empty, a
colour-washed cavity and a thick saturated rim once something is in it — a 68-unit change instead
of a 40-unit one. Verified at 50.90 / 51.55 / 51.85 / 52.05, and confirmed legible in the
full-frame strip, which is the test that actually matters here.

*The load read as a legend.* The carried crates rendered at `translate(0, i * 40)` — a vertical
column of identical plates at even spacing, each with its own connector stub. A blind read
called it *"a vertical strip of coloured icon chips... they look like a legend or a list but have
no visible relationship to the buckets"*, and **counted it among the mast's containers** (five
where there are four). Freight is one object, so the crates are now clustered and overlapping
inside a slung net that swings as a single mass.

**Post-render QA, full `Opening` composition, 3681 frames.** All checks pass. Worth recording the
safe-zone number specifically: **3/3681 frames** against a 73-frame budget, and all three sit at
5.47–7.88s in the opening — *nothing* at the deploy beat, so the camera push at the mast cost
nothing. `seam` 0 cut-like spikes (median d 1.618); longest frozen run 0.22s; 0 blank frames;
container 1080x1920 60fps yuv420p with audio, 61.397s.

**The cargo, and two lessons about scale.** The carried load went through three designs, and the
first two were approved off magnified crops and failed at 1:1:

1. *A vertical column of labelled plates* — a legend by construction (`translate(0, i * 40)`).
2. *A slung net holding the same plates* — better magnified, but at 1:1 the net's cords are 2px and
   its dark body vanishes into a dark sky, so all that survives is four white tiles with
   pictograms in a cluster, which **is** an app-icon grid. A blind read: *"visually identical to
   an app icon grid, a legend swatch block, or a row of buttons."*
3. *One sack, no labels* — dark silhouette, coloured studs at irregular offsets. What is inside is
   already said twice, by the hatch it left and the bucket it lands in; the third statement was
   what destroyed the read.

**Judge cargo-scale detail at 1:1, never magnified.** Two designs passed inspection at 2x and
failed at true scale. The magnified view shows the construction; only the true-scale view shows
what a viewer gets.

**The cluster was the real fault, not the assets.** With the sack in place a blind read still
could not parse the top of frame: it attributed the MAST'S buckets to the drone, counted five or
six containers, saw no tether, and said *"nothing has clear ownership of anything else"* and
*"visually they look like they belong to the sky, not the building."* The cause was structural —
the courier's final leg ended at (690, 205), directly **above** all four buckets, so it climbed
through the entire bucket stack to get there. It now stands off at (846, 300), beside the mast
across clear sky, and crates fly in from the side. Buckets belong to the mast; the sack belongs to
the drone; the two groups no longer overlap.

**Final post-render QA, `Opening`, 3681 frames — all checks pass.** blank 0; seam 0 cut-like
spikes (median d 1.621); longest frozen run 0.18s; **safe zone 3/3681** against a 73-frame budget,
all three at 5.47–7.88s in the opening and none at the mast; container 1080x1920 60fps yuv420p
with audio, 61.397s. `taps.mjs`: all twelve contacts land.

---

# ROUND 5 — THE PERMISSION MECHANISM, REBUILT AROUND THE ANTENNA

The review note that started it: *"The antenna indicates the update installed, so the correct
physical metaphor for it requesting permissions should be a metaphor emerging from the antenna,
not the drone that delivered the update… The drone mechanism for permission granting is to be
removed… all permissions should not [be] reflected like they're the same using buckets… acceptance
of permission should be indicated on the building itself, unique to each permission."*

## 1 · What was wrong

The old act 2 had the antenna deploy, four hatches open on the victim's buildings, and then the
**courier fly a collection round** — pick up at each hatch, carry the load to the mast, drop it in
one of four identical buckets. Three separate failures in one mechanism:

1. **The causality was inverted.** The app asks for permission, so the ASK must come from the app's
   own organ. It came from nowhere, and the answer was collected by a delivery drone that belonged
   to a different company and had already finished its job.
2. **The consequence was generic.** Four identical buckets said "the app now has four things" and
   nothing about WHAT it has. A permission is not a payload; it is a capability, and four
   capabilities that look the same are one capability drawn four times.
3. **The courier had no reason to be there.** It is WhatsApp's drone. It brought a parcel. Giving
   it the permissions round made the app's own request arrive by road freight.

## 2 · The mechanism now

```
  the antenna transmits          a circular wavefront leaves the radiator, colour-keyed to the
                                 permission, with a brighter lobe aimed at the building addressed
  the building asks              the instant the front REACHES it — the hatch opens on that word
  ✓ is pressed                   ✕ DENY and ✓ ALLOW, the wall's own grammar
  the key goes back              a physical key rides the radial the question came out on
  it lands on the antenna        the tower flashes and conducts it down
  the feeder is paid out         and the key rides its tip to the machine that grant just bought
  the app grows an organ         a different one every time
```

**The launch time is SOLVED, not chosen.** A wavefront crosses at 700 q-units/s; the launch is
`ask − distance/700`. The post office is 789 units from the radiator, so its ring leaves at 38.29
and lands at 39.42 — which is the measured onset of the words *"to access"*. That constraint is
what set the whole delivery 0.6 s earlier: the antenna has to be STANDING before it can ask.

## 3 · The four organs

All four mount on the **cornice** — the plot is 430 wide with the city hard against both sides, and
the pediment hides the roof behind it, so the cornice ledge is the only surface this building has
that clears the boundary wall and can stand machinery on. `fortress: OFFICE_MOUNT` derives every
mount from the building's own mouldings.

| | organ | what it is | what says so |
|---|---|---|---|
| SMS | `MailHoist` | a boot through the cornice, a telescoping tower, a belt of flights | a column of **envelopes** climbing, tipped down a duct into the roof |
| CALL | `CallTap` | a gland, a cabinet, the city's line cut and patched through a jackfield | the **handset off its hook**, hanging on a coiled cord, and pulses running the patch cords |
| BG | the medallion + `WatchEye` | the app's own lens on the pediment opens its iris — and the sky opens with it | a **red recording light** in a pupil the size of the skyline |
| VPN | `Satellite` | a canister in the ledge, a stem, solar wings, a ribbed **dish on a gimbal yoke** | it aims at the sky, not at the city |

## 4 · The mark

`v2/mark.tsx` — one object, five scales. The app's icon is a **traffic camera lens**, because that
is where a real e-Challan comes from: at icon size it is an ordinary, plausible, faintly boring
government-app mark. It is also the iris of the eye. Nothing is added to make it sinister; **one
red light comes on inside it** and the reading changes. It appears on the home screen, the service
header, the update case's maker's plate, the antenna's plinth, the pediment and the sky.

## 5 · The breach

The lintel is gone and the opening went from 220 to **340** — the colonnade spans 545…835 and we
were seeing less than half of it. Consequences, all of them mechanical:

- the wall is **tiled outward from its two openings** (`PANELS`) instead of off a fixed grid, so
  either opening can change width without a seam crossing it; the run between them is a closure panel
- with no beam over it the leaf cannot hang from above, so it is held by **six jamb shot bolts**,
  three a side, `boltL`/`boltR` driving a rank each — the left clears first, then the right, and
  then the leaf is standing on nothing
- it drops 11 units onto its own **threshold pocket** and then goes, and throws dust up both jambs
- the store gate moved 80 left to make room; act 1's "Play" and "Allow" camera keys followed it

## 6 · What the blind reads changed

Two readers, no sound, no subtitles, no context (`PermSilent`, 16 uncaptioned frames).

**Read 1 got the argument right** — *"one tapped permission at a time… until the whole skyline sits
inside an opening red eye"* — and then listed what was broken:

| finding | fix |
|---|---|
| "the ring lands on the post office, then the next two just keep expanding and leave frame without touching anything" | **the wavefront dies where it arrives.** It is a question addressed to one building; reaching it spends it |
| "the tick precedes the tap" — a lone ✓ on the sill reads as already granted | **✕ DENY beside ✓ ALLOW.** A pair reads as a question; the ✕ greys out once the other is pressed |
| "the delivered object and the installed object do not match" — the case wore the same lens as the pediment | the case now carries a **folded lattice embossed on its lid** and the mark only as a small maker's plate |
| "the eye was retconned into the background" | a **column of light between the medallion and the iris** for the half second the lids part |
| "the drone's exit is sloppy — a tiny cropped shape at the top right" | it is clear of frame before the antenna's second stage |
| the hand "lies diagonally across half the frame and occludes the building it is authorising" | the background grant is **left-handed** (its hatch is at x 445), and the hand is off screen for the whole of the eye |

**Read 2 named the thing both reads were circling:** *"Not one object travels from one machine to
another anywhere in these 14 frames. The sequence asserts a pipeline and never shows anything in
the pipe."* — so the grant got a physical token. Pressing ✓ hands over a **key**; it rides the
radial back, lands on the antenna, and rides the tip of the feeder out to the machine. A key rather
than a sack of letters because what is given away at that instant is not the post, it is the right
to it.

It also found, and these are fixed:

- **"a gun aimed down at the city"** — the hoist's discharge hood was on the far END of the duct,
  which at any distance is a muzzle. The duct now runs INTO the roof and stops at a recess.
- **"twin white cylinders on a swivel"** — the fourth failed handset. 40 units was a smudge, 78
  dark against the pediment was "a barbell", 88 ivory was "two cylinders". The shape was the
  problem: a symmetric bar with two equal flares is a dumbbell from any distance. It is now the
  receiver silhouette everybody already knows, as a solid with a lit upper and a shaded under face.
- **"the pediment dial reads as a clock for ten frames"** — the iris's blade edges now fade out as
  it shuts, so closed it is a smooth dark lens under a bezel and open it is visibly a diaphragm.
- **"two competing reds in the sky"** — the mast's obstruction strobe is white. Red is reserved for
  the recording light.
- **"bars and columns merge into one striped field"** — a wall has thickness; the breach throws
  shade on what is behind it.
- **"the mast bisects the eye's pupil"** — the eye's placement is constrained from three sides: the
  pupil must not sit behind a rooftop sign, the iris must not reach the antenna's x, and the lower
  lid must stay behind the skyline. `EYE = (488, 178) r 612×250` is the position that satisfies all three.

## 7 · The tooling fix that unblocked all of it

Remotion copies `public/` into every bundle it builds. This repo's public folder is **4.1 GB**, of
which 3.3 GB belongs to a different film — so every still, render and score pass wrote a **4.4 GB**
bundle into /tmp, and three in a row filled the disk and killed the render with `ENOSPC`. This film
needs six files. `tools/echallan/publicdir.mjs` hard-links them into `.echallan-public/` and every
tool points Remotion there: **bundles went from 4.4 GB to 41 MB.**

## 8 · Verified

- `taps.mjs` — all twelve contacts land; miss 0.0, closest approach 415 units 0.5 s before contact
- `score-opening.mjs` — 213 SFX; voice clears the bed by median 23.5 dB, worst decile 11.0 dB
- `qa.mjs` on the 3681-frame master — blank 0, **0 cut-like seams** (median d 1.907), longest
  frozen run 0.23 s, safe zone **10/3681** against a 73-frame budget, 1080×1920 60 fps yuv420p

---

# ROUND 6 — THE UPDATE GETS A CAUSE, AND THE CITY GETS OUT OF THE MACHINERY'S WAY

Four notes, in the order they were given. The clutter one was marked most important and was done
first; the others follow from it.

## 1 · "The update popup appears out of nowhere"

**The script changed.** `Then it asks you to install an update` became
**`Then when you proceed to pay, it asks you to install an update first`** — anchoring the demand
to the pay button, so the victim is made to feel one step from being finished rather than
ambushed. That is how the trick is actually run.

The sentence is re-fragmented to the **same 16 blocks** so no downstream beat index renumbers
(rule: beat-index shift) — the third time this sentence has been re-cut under that constraint. Two
of the new blocks are single beats on purpose:

| block | words | event |
|---|---|---|
| 059 | `pay,` | the finger lands on **PAY NOW** |
| 060 | `it asks` | and the panel the press returns comes up under it |

It is the **same button, same target, same finger** as the PAY NOW after the permissions. That
repetition is the point: the first press buys an update, the second buys a payment screen, and
the viewer has to recognise the second as the same act. The score repeats too — same click family,
plus a small "the app thinks about it" chirp in the 0.47 s between the press and the panel.

### And the clock stopped being a clock

The delivery carried five hand-set wall-clock seconds (`roof 37.34`, `deploy0 37.38`,
`deploy1 38.30`, `away 37.40/38.24`, `ping 38.34`). The script edit moved every measured word under
them by **+2.24 s**, which would have had the courier setting the case down *after* the antenna
had already asked for two permissions. Every one of them is now an offset from a measured word:

```
roof    B(71)+1.10      deploy0 B(71)+1.14      deploy1 B(75)-0.16
away0   B(71)+1.12      away1   B(75)-0.24      ping    B(75)-0.08
```

The chain is still *solved*, not chosen: the first coloured wavefront leaves at `ask − dist/700`,
which is **40.51 s**, so the mast must be locked by "begins" (40.04) and the carrier must go on
"asking for" (40.44). The delivery has to clear that, and now it does by construction.

Two stale phrase anchors elsewhere pointed at `'Then it asks'` and would have thrown at module
load (`design.ts`'s colour script and `timeline.ts`'s hold table). The legacy v1 cues
`updateRise / updateWords / updatePress` were re-anchored from B(56)/B(59)/B(62) to
B(60)/B(62)/B(66) so the full-film composition still plays the sentence it is cut to. And the
`Opening` composition's length is no longer the literal `3681` — it is `(ACT2_END + 0.55) × FPS`.

## 2 · "The icons are overlapping and the scene looks cluttered"

**Root cause, stated plainly:** the city's positions came from one table (`NEAR3`) and the app's
apparatus from another (`OFFICE_MOUNT`), and **neither table knew the other existed.** The chat
tower stood at 380–510 and the mail hoist bolted on at 506. The bank stood at 900–1036 and the
line tap's handset reached 997. Two machines were drawn straight through two buildings and their
rooftop signs, and the whole middle band of the frame — five roof signs, four hatches, four
machines and a medallion inside 300 units of height — became one pile of small bright objects.

So the fix is not a nudge. Four things changed:

### 2a · The apparatus declares its air, and the assert is the gate

`APP_ZONE` is derived from the mounts plus each machine's real half-width — the hoist's hopper
reaches 66 left of its boot, the line tap's bracket 88 right of its centre, the satellite's dish
90. `NEAR3` is then tiled outside it with a stated clearance, and **a building inside the zone
throws at module load**, naming the building and the span. A second assert refuses two identity
signs closer than 26 units at the same height, and a third refuses a hatch that overhangs its host
building by more than 8. Move an organ later and the city has to move with it — that is the point.

### 2b · The city was re-laid, and it grew one building

```
mail   -34..126   sign  46      phone  140..290  sign 241      chat  302..434  sign 368
                         [ APP_ZONE  470 .. 934 ]
bank   980..1130  sign 1055     calendar 1144..1272            photo 1286..1418
```

The sixth building is not decoration. The VPN is asked for on the bank, the furthest right of the
four hosts, and the camera has to look at it — with the skyline ending 130 units past the bank, a
quarter of that frame was boundary wall and empty sky.

### 2c · The line tap came off the roof

It was standing on the cornice in the same 130 units of air the satellite's stem needs, so the
stem's foot vanished behind it and the satellite appeared to be growing out of a switch box. It is
now **hung off the cornice on a bracket, down the building's right flank** — where a service
cabinet on a real building is. The satellite has the roof, the line tap has the wall, and they are
**70 units apart in height** instead of fighting over one shelf.

That also solved the handset, which had failed five times. It now hangs **inside the open cabinet**
on its coiled cord, against the blackest field anywhere on this building, instead of out over the
bank's facade. And the city's telephone riser now climbs the flank **from below** — from the
street, which is where a telephone line comes from — rather than down out of the app's own roof,
so what is being intercepted is legibly the city's and not the app's.

The four organs now attach in four different ways: a boot **through** the cornice, a bracket
**hung off** it, a lens **set into** the pediment, a mast **through** the roof.

### 2d · An answered question stops being asked

Every hatch kept its ✕ and its ✓ lit for the rest of the act: **eight bright badges, red and
green, repeating across the one band of the frame everything else was happening in.** The console
now folds flat into its sill about a second after the press — the same `cos()` hinge the line
tap's doors use, so it is one grammar used twice. What is left is the capability's label, one
small bead in its colour, and the thing that actually cost something: an open hole in the building
with its contents being taken out of it.

At any instant **exactly one** permission is being asked.

### 2e · And the feeders stopped being a knot

Four cables erupted from a single point at the mast head. Each now leaves **its own port** — the
head's equipment box already carried four coloured terminals — and each ends somewhere the eye can
tell apart from the other three: the hoist's drive, the cabinet's outboard gland, the medallion's
upper-left rim, and the roof hatch the satellite climbed out of.

### 2f · The hand stopped pointing at the Play Store

The exchange stands directly behind the store's portal (60–280), and the approach to its hatch
flew the fingertip **straight over the Play Store's sign**. For a third of a second the film showed
a finger about to press the one thing in this world the victim did not press. The hand now stands
off outboard of the gate's jamb at (6, 860) and comes over the top of it; the background approach
was moved right for the same reason. `taps.mjs` still passes at 256 units/s into contact.

## 3 · "The satellite leans left, into the antenna"

It did — `rotate(-aim * 46)` — so the one thing this machine does, point somewhere and send,
happened behind a lattice tower. It now turns **right**, into the only open quadrant of sky this
city has, and the beam leaves at 46° through clear air: no sign, no building, no mast. The
transmission is also worth watching now — a wider wedge, a hot core, and four ring pulses instead
of three dots.

Two things had to change with it. The **solar arrays** were navy-on-navy at 48 units and read as
two dark tabs beside a rod; they are bigger, lit (a solar panel is a mirror — it is the one surface
up here that catches the city), and **drooped 24°** so both tips come out from under the bowl.
Level, the right one disappeared behind the dish entirely. And the **stem** was a plain 16-wide rod
250 long, which is a wire; it is now a three-section telescoping mast with a collar at each joint,
drawn in the same language as the antenna on the apex.

## 4 · "The rod appears to start from nowhere"

Taken exactly as directed. The satellite is drawn **before** the office, so the pediment's slope
covers the foot of its stem, and what the viewer sees break open is `SatHatch` — a coaming and two
leaves thrown back **along the rake**, at the point where the stem breaks the roofline
(`OFFICE_MOUNT.vpnRoof`, derived from the pediment's own geometry, not guessed). The root is never
seen, which is the honest reading of a mast on a roof you are looking at from the street, and it is
what lets this one stand in clear air instead of on a ledge between two other machines.

The erection still reads — the law is `structures-are-erected-not-revealed`, and the hatch
breaking open on the roof is the erection. Only the part that could not be drawn honestly is
hidden.

## 5 · "The gap should be half a second longer"

The hold after **"connection."** went **0.60 → 1.12 s**, and `A.out` moved from a guess past a
swallowed pause (`B(92)+1.60`) to `B(93)+0.50` — the aligner now resolves the word after that hold,
so the anchor is real. The VPN beat went from **1.80 s to 2.39 s** of grant-to-exit, and the beam
is on screen for **1.17 s** instead of being cut while its first pulse was still travelling.

There is an assert for it: if a re-measure ever slides `A.satBeam` before the dish finishes aiming,
the build fails and says so. A dish that transmits while it is still swinging is not aimed at
anything.

---

# ROUND 7 — THE CAMERA STOPS MOVING, AND EVERYTHING ELSE GETS A SPEED PROFILE

Four notes. Three of them are the same bug in three places: **a motion that stops where it should
not stop, or does not stop where it should.**

## 1 · "The finger taps the boundary wall first"

Correct, and it was introduced in round 6. The hand flew in **two legs** with a "standoff" between
them, and because both legs were eased `inOut` it came to a **dead stop at the junction**. That
junction sits on the boundary wall. So at every permission the fingertip arrived on the wall,
stopped, and only then went up to the control — a tap on the wall, then a second tap on the button.
Round 6 made it worse by moving the call standoff to (6, 860), which is the wall's own cap.

**There is no standoff now.** One move per grant, from off-frame to the button, on a trapezoidal
speed profile — a short acceleration, a cruise, a long deceleration — so velocity is zero at the
two ends and **nowhere in between**. The path is a quadratic Bézier whose control point is placed
so the tip never loiters over the Play Store's portal on the way (hard left for the exchange, hard
right for the chat tower).

And it is measured, not asserted. `taps.mjs` now runs two more checks on each reach:

| check | floor | what it caught |
|---|---|---|
| **NO STALL** — outside the last 0.34 s, the tip never drops below 130 units/s | 130 | the dead stop at the standoff |
| **NO FALSE TAP** — whenever it is slower than 330 units/s it is within 150 units of its own target | 150 | slowing down on the wall |

Measured: slowest mid-flight **433–567 units/s**, and the furthest it is ever slow from its own
button is **41 units**. There is no longer anywhere for the eye to read a second tap.

## 2 · "The drone rushes to the top"

Also correct, also round 6. The flight was five independent `inOut` legs, so the drone came to a
dead halt at every waypoint and sprinted to the next. The numbers:

```
                        ROUND 6                      NOW
  lining up             1336 u/s                     407 u/s
  through the doorway    115 u/s  (0.34s for 40u)    410 u/s
  the climb             3978 u/s  (0.18s for 716u)   852 u/s
```

0.34 s to cross the doorway and then 0.18 s to climb 716 units is not a delivery, it is a scramble —
and the inversion is what made it read that way, not the speed alone.

The waypoints are the same story beats; they are now knots on **one C1-continuous Hermite path**.
The tangent at each knot is the Catmull-Rom secant and is **zero only where the flight genuinely
stops** — on station over the roof. The drone decelerates *into* the doorway, threads it, and
climbs out of the same motion. The catch also moved half a second earlier (onto "the" rather than
"update") to buy the climb its 0.82 s.

`focus.mjs` prints the profile and fails any leg running more than **3.2× the flight's mean**.
Worst leg now: **1.59×**.

## 3 · "Each permission isn't given enough focus to register"

The review note's own diagnosis was right: *"this could largely be attributed to poor camera handling so
focus keeps shifting without allowing anything to land."* Round 6 hand-listed **five camera keys
per permission** — arrive at the building, push in for the ✓, pull wide for the key, push in for
the organ, leave — five moves inside four seconds. Nothing was ever still long enough to be read,
and adding time alone would only have made a restless shot longer.

**The permission camera is now generated from a table, not typed.** Each permission gets exactly
**two held positions and one move**:

- **THE BUILDING**, held from before the ring lands until after the ✓ is pressed. The hatch
  opening, the hand arriving and the press all happen in one settled frame.
- **one move**, in the direction the key travels — the camera tracks the object rather than cutting
  to where it is going.
- **THE MACHINE**, held while it is built and after it is finished. The next ring is launched out
  of that hold.

Time was added too, but less than the camera fix was worth: the holds after "SMS," and "calls,"
went 1.15 → 1.85 s and the one after "background," went **0.20 → 1.35 s** (the eye is the largest
image in the film and had 1.31 s before the next ring left). The four organs also build a little
faster, so the hold on a finished machine is a hold on something finished. Net **+2.55 s** across a
section that now runs 17.7 s — about 4.4 s per permission, each containing five events.

`tools/echallan/focus.mjs` is new and is the gate:

```
cap    ask     grant   built   |  settled ON THE ASK   settled ON THE MACHINE  moves
sms    41.64  43.32  44.52  |  2.05s              0.82s                   2
call   45.39  46.88  48.02  |  1.87s              0.93s                   2
bg     49.09  51.09  52.70  |  2.38s              1.20s                   2
vpn    53.54  55.18  56.36  |  2.02s              0.77s                   2
```

Floors: **1.45 s** on the question, **0.68 s** on the machine, **2** moves. "Settled" is defined,
not felt: under 14 screen-px/s of pan and 0.06/s of zoom.

## 4 · "The popups appear with no animation"

They did — `opacity={ease.out(on)}`, which is the one entrance this film's craft laws name as
banned. A permission dialog on a building is not a dialog: it is **a hole somebody cut in the
facade**, and the wavefront that just landed is what cut it. So it is built, in the boundary wall's
own order:

1. the ring lands and **scribes** the opening's outline onto the stone, in the capability's colour;
2. the **head beam extrudes up** out of the wall and the **sill extrudes down**;
3. the **jambs** run between them, carrying the bolts;
4. the **opening widens from its centre line**, and the steel leaf is behind it;
5. and the **console swings up out of the sill** — on the same hinge it folds back into when the
   question has been answered. One hinge, both directions.

One trap worth recording: the first cut drove this with `win()`, which is `ease.out` — it spends
70% of its window in the first third, so all five stages landed inside 0.2 s and the hatch still
effectively popped. **A construction sequence gets a construction clock**: the build is driven by a
linear ramp over 0.62 s.

## 5 · The gates this round added

Three of the four notes were things a number could have caught before a review had to. So they are
numbers now.

`tools/echallan/focus.mjs` (new) — for each permission: seconds the camera is **settled** on the
question, seconds settled on the machine, and the count of camera moves. Floors 1.45 s / 0.68 s /
2 moves. It also prints the delivery's speed profile and fails any leg over 3.2× the flight mean.
"Settled" is defined as under 24 screen-px/s of pan and 0.07/s of zoom — not mathematical zero,
because the camera carries a deliberate breath.

`tools/echallan/taps.mjs` (extended) — three more checks on every reach into the city:

| check | what it catches |
|---|---|
| **NO STALL** — outside the last 0.34 s the tip never drops below 130 units/s | a dead stop mid-flight |
| **NO FALSE TAP** — whenever it is slower than 330 units/s it is within 150 units of its own target | slowing down on a surface it is not pressing |
| **NO-TOUCH BOX** — the tip is never inside the Play Store's portal | a finger that appears to press the one thing the victim did not press |

The last one earned its keep immediately: it found the SMS **withdrawal** grazing the portal's
corner for two frames, which no amount of watching the approach would have caught.

## 6 · Verified

| gate | result |
|---|---|
| `taps.mjs` | 13/13 land · slowest mid-flight 433–567 u/s · furthest-while-slow 32–41 units · no-touch clear |
| `focus.mjs` | settled 1.87–2.40 s on each question, 0.77–1.22 s on each machine, 2 moves each; worst flight leg 1.59× mean |
| `qa.mjs` | 4 013 frames · blank 0 · **0 cut-like seams** (median d 1.23) · longest frozen run **0.28 s** · safe zone 3/4013 · 66.94 s |
| `score-opening.mjs` | 216 SFX; voice clears the bed by median 23.1 dB, worst decile 10.1 dB |
| `audit.mjs` · `camchk.mjs` | beat map and rig tables proven |

Two of those moved for a reason worth recording. The **frozen run** went 0.27 → 0.55 s the moment
the camera holds went in, and back to **0.28 s** once the breath was added: holding a camera and
locking it are not the same thing. And the **safe zone** went 11 → 3 frames, because the hand no
longer loiters in the bottom band on its way anywhere.

---

# ACT 3 — THE REVEAL AND THE THEFT (66.76 → 99.98 s)

Two whole sentences, blocks 112–164. The act break, not a 30-second slice: cutting at exactly
30 s lands mid-phrase on "carry / out unauthorised / transactions," and the line after this one
("So what looked like a routine traffic fine…") opens the recap.

## 0 · The clock had a broken anchor, and it is fixed at the tool

The 0.46 s designed hold after **"malware."** was short enough that ASR ran *"malware. The"*
together: it gave "The" an onset **0.739 s before the inserted silence even began**, so the
aligner's detector snap — which only considers words starting at or after a silence — never saw
it. `B(127)` came out 0.739 s early, on the sentence that opens the theft.

It was never an estimation problem. `narration.mjs` **cuts that audio and inserts that silence**,
so it knows to the sample where each hold is and which word sits on either side of it: word *k* is
the last word before hold *k* and word *k+1* is the first after it. A word cannot be spoken across
a digital silence, so those two boundaries are facts. They are now applied after the measurement
instead of hoped for from it, and the tool **fails the build** if any word onset is left sitting
inside a hold it created.

The same hold was **raised 0.46 → 0.95 s**. The reveal now ends on the whole apparatus lit as one
body, and at 0.46 the camera had 1.2 s settled on it — less than the permission act gives its
closing wide, for an image ten times more important. Only blocks 128+ moved, so **acts 1 and 2 are
byte-identical** and the existing 66 s render stayed valid while this was built.

## 1 · The argument: nothing new arrives

The reveal is not "an app was malicious." It is a **re-reading**: everything the viewer watched was
true and only its purpose was hidden. So the act introduces no villain, builds no new machine, and
adds no label. It re-frames what is already standing, and it proves the re-reading physically.

**Literal ideas rejected:** a red MALWARE banner over the app; the app icon cracking into a skull;
a hooded figure at a terminal receiving the data. *I am discarding these because they are literal
and uninspired.*

## 2 · "the first app was a dropper" — so the building opens

**The first version of this did not read, and the note that found it was the right one:** *"I am
not sure how you go from the scene on the left to the right, and what the scene on the right is
supposed to represent isn't clear either."*

What it did was push the camera through the office's portal into an interior drawn behind it. Two
things were wrong, and they were the same thing. Frame by frame, between 71.30 s and 71.45 s **the
doorway's frame flew past the edges of the screen while the room behind it stayed exactly the size
it was** — because in a flat world a single camera scale moves both at the same rate, and entering
requires them to move at different ones. So it played as a jump to somewhere else. And what you
arrived in — a tall narrow shaft with a drone at the bottom — had nothing in it that identified it
as the inside of the wide civic building you had been looking at a second earlier.

**The fix was to delete the transition.** The building opens instead, in the frame it is already in:

> **the app's own front sinks into its own plinth**, exactly the way the boundary wall's precast
> panel sank under its lintel in act 1 when the victim pressed ALLOW.

The film has already taught that a panel sinks, so the app's facade doing it needs no explaining.
The latches let go on **"was"** and the front goes down through **"dropper,"**, uncovering the room
from the top down — which is the right order, because it means the lamps are the first thing you
see and the courier is the last.

The camera does not cross the threshold. It pushes in once, on **"first app"**, and settles *before*
the latches release; the whole mechanism then happens in a frame at rest.

What sinks and what stays is decided by what is real:

| sinks | stays |
|---|---|
| the lit storeys, the portal, the colonnade | the plinth it sinks into |
| — i.e. everything the street was asked to believe | the service spine it stood in front of |
| | the entablature, pediment and medallion the machine is bolted through |

The roof is real; it holds a mast. The front was not. And the travel is solved from the panel's own
height rather than typed — `FRONT_DROP` in `fortress.tsx`, asserted by `act3.mjs`, because a panel
that drops 450 of its 454 units leaves a band of stone standing in the opening.

## 2a · The second note: the asset was not good enough to carry the idea

The mechanism was right and the contents were not. The note: *"the quality of the assets needed for
it to be visually convincing is higher — not sure why there are arrows in there, analyse/justify
the existence of the drone… give it primary importance since it is the focal point of the scene."*

Correct on every count. What was behind the front was **a hollow room with props in it**: a flat
dark box, four hairline "sheet metal" strokes, two stencilled shipping arrows at 15% opacity that
read as stray marks, a drone the size of a detail sitting on a table, and a floating rounded square
standing in for a light. Two failures, one of scale and one of content.

**Scale.** The room was staged at **37% of the frame's width**. Every object in it came out two or
three pixels wide. No amount of drawing fixes an asset rendered at the size of a detail, so the
push on "first app" was made to do real work — **z 1.02 → 1.86**, which puts the building at 70% of
the width and is as tight as it can go while keeping the pediment and the medallion in shot, so you
never lose *which* building opened. `act3.mjs` now holds that as a number (§7).

**Content.** A dropper is not an empty room; it is a **delivery plant**. So the interior was rebuilt
as the machine's own lower half, and it makes four statements in the order the eye reads them:

| | what you see | why it is there |
|---|---|---|
| 1 | two bare steel stanchions, spliced, bolted to the slab, with K-bracing | there is no office — no storeys, no stair, no counter, nobody. A shed, dressed as a temple |
| 2 | four bare lamps on a rail, still burning at nothing | the windows were props. The rail sits at the facade's own window row, at the facade's own four x positions |
| 3 | the mast's shaft, running the full height of the room to a loading head | the building **is** the machine. The apparatus on the cornice is bolted **through** the ceiling, and you can see the underside of all three anchors |
| 4 | a painted bay, the courier on a wheeled cradle, and the next payload in the claw above it | this is a dispatch bay. The bay is centred on the portal, which is the doorway the courier flew the update in through |

Nothing in it is placed. The lamp rail comes off `Office3`'s own window table; the three ceiling
anchors are `OFFICE_MOUNT`'s `sms` / `mast` / `call` x positions, so the two stanchions stand under
the two roof machines that need carrying and the shaft carries the third; the trunk is drawn around
the service spine `fortress.tsx` has drawn since act 2. Move the office and every one of them moves
with it.

**And four things were wrong in the first build of it, each found by rendering and looking:**

- The room's ceiling was at q 606 — **inside the entablature**. Office3's lowest course runs to
  q 646, so the ceiling, its joists and all three anchor bolts were drawing forty units up behind
  the building's own stonework. The load path was in the file and not on the screen.
- The lower lamp row sat at q 817 and the boundary wall's cap crosses at q 820. Four glows cut in
  half by a steel beam. That row has never been visible from the street either, so it is now what it
  actually is: a piece of framing.
- The payload was clamped under the courier, which put it inside the cradle. It is in the claw above
  the vehicle instead — the shaft delivered it, the claw is setting it down — and the claw is **one
  hook through a bail**, because two arms either side of a flask read as part of the flask.
- The tie-down straps, the shipping arrows and the trapezoid cradle arms were the "arrows". All gone.

One thing outside the shell changed with it. Six saturated green lamps on the breach's jamb bolts
were the highest-contrast objects in a frame whose subject is 400 units behind them. They clear
**once**, in act 1, and that is the event — but they then sit in shot for the rest of the film. A
finished indicator now goes to standby (`ShotBolt`'s `idle`, derived from the wall's own `stow`), so
it goes quiet without going out.

## 2b · The half-second pass: what the picture was claiming and not showing

A frame-by-frame walk of the whole act at 0.5 s, against the rule that **every transition must be
caused, and caused by something the object itself could do.** Five things failed it.

| | what it was | what it is |
|---|---|---|
| **the dive** | the score played *"the ring lets go"* on **"but"** and nothing on screen released; the iris then opened from a point at the tick | the confirmation's own ring **lifts off the disc at the disc's own radius** and opens outward. The iris is the hole that ring leaves, always 66 units behind it, and the ring carries its colour across — it leaves as the confirmation's green and arrives as the film's field cyan |
| **the front** | four latch sounds on **"was"**, and a facade that started sinking 0.38 s later with nothing having let go of it | **four pins** hold the panel to the entablature, standing in the only joint you can see — the four gaps in the colonnade. They retract on their own cues, and the instant the last clears the panel settles nine units onto its travel and goes, which is the release the boundary wall's leaf has had since act 1 |
| **the duplicate** | started at the posting slot 26 units above the breach, at the exact moment the original finished fading — a copy appearing out of nothing beside a slot it never came through | it comes **out of the breach, edge-first**, widening from nothing as it clears the opening, and the hatch that does the copying flashes in its own grant colour first |
| **what leaves on the beam** | the ray ends at the receiving bowl, 900 units above the console; the card stopped there and a second card faded into the slot below it | both halves follow the **waveguide** down the mast, across, and down the console's own **feed rail** into their slots. One eased progress runs the whole polyline, never one per leg (rule: eased legs make false stops) |
| **the iris, closing** | closed to radius 8, not 0 | it closes to nothing. The 8 left an eight-unit pinhole of the city sitting on the payment screen for four seconds — a dark dot beside "Amount paid" that looked like a rendering fault, because it was one |

Two asset faults came out of the same pass. The facade's **eight lit windows were 44 wide standing
behind a colonnade whose gaps are 29**, so every one was clipped to a sliver and the four of them
merged into a single warm band — which means the reveal's punchline ("those were four bare lamps")
was landing on something the viewer had never seen as windows. They are narrower than their gap
now, with a reveal the thickness of the panel and a transom across the middle. And the **code in the
console's slot was the six digits at 15 px**, an illegible smudge pretending to be information; it
is the six boxes every OTP field in the world is drawn as, which says the same thing without being
read.

## 2c · The eye is watching the act

*"The eye in the background should not be static; it should be alive and preferably be looking at
whatever feels active in the city."*

It was drifting on a slow `breathe` curve, which at that speed is indistinguishable from a painted
backdrop. It now looks at **whatever the film is looking at**: the target is the act's own camera
centre, because every key in `FOCUS3` is a thing rather than a position, so the gaze is derived and
follows any change to the staging without a table of its own. Two cases the camera cannot answer
are derived too — while the picture is on the phone it watches the antenna's head, which is what is
actually doing something in the city, and once the camera leaves along the uplink it holds on the
dish it just watched the theft leave by.

It **holds and flicks**, 90 ms per move, with a tremor underneath: the target is sampled at dwell
boundaries, never continuously, so it never tracks a moving camera smoothly — it catches up in
jumps, which is what makes it read as *looking* rather than as being dragged. A smooth sweep would
be a searchlight. It is clamped to about half an iris-width of travel and nothing about it
brightens, because the brief was an extra layer of life, never a second event. Act 2's eye was
given the same treatment off its own camera.

## 2d · The captions get out of the way

*"Move the subtitles to the upper edge when it overlaps with visuals to be focused on."*

Bottom is still the default and is right for most of this film — the bottom of the frame is ground,
plaza and the phone's lower bezel. Which pages move is **measured, not typed**: `tools/echallan/captions.mjs`
renders the film *without its captions* (the composition takes a `subs` input prop for exactly this)
and reduces three frames of every page to a map of **drawn edges**, the way `qa.mjs` counts strokes.

The first cut of the tool measured focal mass — luminance above the median, squared, weighted by
saturation — and flagged ten pages, six of them sitting over nothing but a lit plaza or a white
plinth. *Bright is not the same as drawn.* An edge count puts plaza, sky, ground and wall under 2%
and a form, a keypad, a machine or a phone's chrome over 13%, which is the distinction that
actually matters. Eight of thirty-three pages move; the table is keyed by exact page start and
baked to `caption-side.json`, and the tool's `--check` mode fails if it ever stops matching the
picture.

The one page it leaves where it is, deliberately, is **"and the subsequent 'update' installed the
actual malware."** — 37% at the bottom against 35.5% at the top. The crane drags the open building
down through the caption band for about 1.3 s, but the top of that shot holds the pediment and the
medallion at its start and the mast at its end, and covering the thing that says *which building
opened* is worse than covering the room while we are leaving it.

## 3 · What that removed

The two apertures went with it: the doorway you walked through and the shaft mouth you left by,
along with their drawn lips and the 1/d growth law they needed. The act is simpler for it — one
push, one held frame while the building opens, and one crane up to the roof.

It also removed the act's one cut-like seam. The shaft aperture had stopped growing at 60% of the
frame, showing the shell under the city for half a second at 75.97 s; that whole class of bug no
longer exists here.

## 4 · "the actual malware" — and the framing that had to change

The camera rises the full height of the empty shell, out through the shaft, onto the roof, and on
**"malware."** the antenna, the hoist, the line tap, the eye and the satellite pulse **once,
together**, from the head outward along the four feeders. One animal.

The first cut framed that at z 0.80 — **which is almost exactly the shot act 2 already ends on**
("four breaches, four machines, an eye over the whole skyline"). The biggest image in the film
arrived looking like one the viewer had already been given. It goes the other way now: z 1.30,
close enough that the mast, the four organs and the feeders between them fill the frame as one
object.

## 5 · The theft: the road you built runs both ways

The single idea this section turns on costs nothing new. Through the permissions every feeder bead
ran **head → machine**: the antenna handing a capability out. In the theft **the feeders reverse.**
Same cable, same bead, opposite sign, and nothing was added to say it.

Two things are taken, by two different routes, because they are two different crimes:

| | the credentials | the verification code |
|---|---|---|
| how it goes | **handed over** — typed into the app's own form | **taken** — a duplicate lifted through a breach |
| the token | a **card** | a **letter** |
| the journey | out of the field, down through the glass, onto the mast head | in over the skyline, into the sorting hall's posting slot, and a copy peels out of the SMS hatch and rides the hoist |

Shape carries the distinction, not colour, so it survives the greyscale check.

**"those fake payment screens"** is plural on purpose: the app's four screens are drawn as one
physical deck, and the fan pivots on the form. The confirmation is dealt off the top — *it is only
the top card* — and the form the details were typed into is the middle of the spread with the app's
two earlier screens behind it. Four identical app headers stacked says *the app drew every one of
these* better than any label could.

**"automatically"** is told by absence. The OTP arrives with an ordinary, friendly chime, lands in
the slot, and the original never moves. The copy is lifted with a sound so small you would miss it,
and **there is no hand anywhere in the frame** — the first transfer in this film that does not need
the victim's finger.

## 6 · The other end of the tunnel

The station is placed by solving, not choosing. The app's dish was turned 46° off vertical in round
6 and has been aimed there since; the beam leaves its feed at (860, 271) on that bearing, and the
site's receiving bowl sits **on that ray, 2400 units out**. The uplink is one straight line between
two bowls and the camera simply flies along it. `act3.mjs` re-solves the ray from the satellite's
own mount and fails if the two disagree — the bowl currently sits **1 unit** off the ray.

It is a **business, not a lair**: a hall of racks with a dish on the roof and two more halls behind
it, because you are one job among many. No hooded figure, no green terminal, no skull. The only
interface anywhere on it is a mechanical lock with two slots beside it — a card slot and a letter
slot — and a counter that goes from **4106 to 4107**.

It is built upright. A long low shed is a landscape object and this film is 9:16; the first pass
put two thirds of the frame into empty sky. A tower reads at phone size and it rhymes with the mast
the app stood up on its own roof: the two ends of the tunnel are the same shape.

It also has **its own night and its own ground**, and the two grounds are never in the same frame —
the camera flies the beam through a stretch of nothing to get there. `act3.mjs` walks every frame
of the flight and fails if the city's skyline and the compound's ground ever share one.

## 7 · The safe-zone gate was measuring the wrong thing

The gate exists so that nothing the viewer has to **read** sits under the Shorts UI. It counted
bright horizontal edges at 256×40 — and could not tell a number plate from a colonnade. Act 3
frames the app's building from the roof, its columns land in the strip, and the gate reported
**225 "legible" frames of architecture** while the one real hit in the film — the scooter's number
plate at 5.47 s — scored no higher than they did.

It measures **stroke width** now, at 540×90 where type still has strokes: a run of bright pixels
bounded by dark (or dark bounded by bright) three pixels wide or less, with real contrast across
it, is a letter stroke or the gap inside one. Everything this film draws as architecture is an
order of magnitude wider. Measured on this master:

| what is in the band | score |
|---|---|
| the scooter's number plate (a real hit) | 237–246 |
| the film's own captions | 265–1222 |
| the app building's colonnade | 42–104 |
| the shell's interior | 48 |
| clean sky, the station, the deck | 0 |

The threshold sits at **170**, between them. Two framings were genuinely wrong and were fixed
rather than excused: the deck put the phone's bright screen in the strip (the rule is now written
down — `(1432 − y) · z < 780`), and the act boundary jumped 60 units because `FOCUS3` did not start
where `FOCUS2` ended.

## 8 · Sound

The reveal is **mostly quiet**. Everything before it has been getting busier, and the one thing
that makes a re-reading land is the floor going out from under the sound: the turn takes the pulse
away, the shell has a room tone and a standby light and almost nothing else, and the biggest sound
in the film is saved for one beat — the apparatus answering in the four pitches the permissions
were granted on.

The theft is quieter still where it matters. The OTP's chime is the friendliest sound in the film
and the copy of it is lifted almost silently. That asymmetry *is* the sentence: the theft does not
sound like a theft. The console's only voice is a card machine saying yes.

The interior bed was also wrong and is fixed: it hard-coded act 1's dive and pull-out, so acts 2
and 3 played twenty seconds of city under a **street** bed. It follows `dz3` and act 2's own two
cues now, so the ear goes through the glass exactly when the camera does — three times — and the
station has a third bed of its own (three-phase plant and a wall of fans).

## 9 · Verified

| gate | result |
|---|---|
| `qa.mjs` | 6 032 frames · 100.59 s · blank 0 · **0 cut-like seams** (median d 1.14) · longest frozen run **0.25 s** · type in the UI band **17/6032** (0.28%) |
| `act3.mjs` | the two grounds never share a frame · the office holds 0.67 s, the sink 0.73 s, the hollow 0.85 s, the apparatus 1.55 s · all five stolen objects arrive · the front drops 464 of its 454 units · the ray misses the bowl by 1 unit |
| `taps.mjs` | 13/13 land (act 3 has no taps — that is the point) |
| `focus.mjs` | acts 1–2 unchanged: 1.87–2.40 s per question, 0.77–1.22 s per machine, 2 moves each |
| `score-opening.mjs` | 267 SFX · −14.0 LUFS · TP −1.1 dBFS · voice clears the bed by median **24.3 dB**, worst decile 12.0 dB |
| `audit.mjs` · `camchk.mjs` | 218 blocks, 99 cues in range; camera and rig tables monotonic |

The 17 flagged frames are the act-1 number plate (3, pre-existing) and the app building's **column
fluting** (14) — 3-unit stone reeding that is genuinely stroke-width. Both are architecture under a
UI bar, not content.

---

# ACT 4 — THE LAST THIRTY SECONDS

*"So what looked like a routine traffic fine was actually a step-by-step process designed to make
you install the malware, approve its access, and hand over all the information it needs to carry
out an attack. Please be aware that a legitimate traffic challan does not require you to install an
APK sent over WhatsApp. If you receive a challan message, verify it yourself through the official
e-Challan portal or your state traffic police website before opening it."*

**100.03 → 131.03 s, then 3.7 s of the approved sign-off card.** The brief: *"this is the final
stretch of the short so it is the most important, since after watching this, a viewer decides if
the channel is worth subscribing to… the memory of how a short handles its last stretch is fresher
in the mind of the viewer than any other part."*

## 0 · What was there, and why none of it could stay

The v1 film's last minute was **a 3×4 flowchart** — twelve miniaturised assets in a serpentine
grid with grey labels under them, on a road background, followed by a browser mock. The *instinct*
was right (recognition: use the film's own objects) and the *execution* introduced an entirely new
visual language in the last minute of a film that had spent a hundred seconds building a city. Every
anti-amateur rule I work to names it: stock infographic layout, generic icons as the primary
metaphor, a collection of icons. It is gone.

## 1 · The argument, and why it is one continuous crane

The recap sentence is about a **sequence**, and a wide shows everything at once and therefore shows
no sequence at all. The first cut of this act tried one anyway — pull back to the whole city at
z 0.90 — and it did not read: the city is a dense skyline, so everything in it came out small and
the recap's line was a bare red stroke laid across a crowd of buildings.

It goes the other way instead. **One crane, all the way down the route**, with the red line that
came home at the end of act 3 retreating in front of the camera — dish, head, roof, shaft, the open
building, the hole in the wall — landing on the pavement **on the word "you"**. The route ends at
you. It is also the exact inverse of act 3's crane, which went up this same axis.

Then it runs forward, and each verb lights the thing the victim actually did:

| the word | what happens | on what object |
|---|---|---|
| **"install the malware,"** | one pulse runs the whole climb: pavement, hole, building, bay, shaft, roof, head | the route |
| **"approve its access,"** | four beads run out along the four feeders in the order they were granted, and each lands on its own machine in its own colour | the four cables the grants left behind |
| **"hand over all the information"** | three cards come edge-first out of the bay and the message comes back down the SMS feeder, all four converging on the head | act 3's own objects |
| **"carry out an attack."** | the head fires the dish and it is away | the satellite |

The first cut flared the four **hatches** instead of the feeders. Three of the four are cut into
buildings at x 46, 215 and 1055 — off the side of the frame at the framing this beat is played at —
so one building would have flashed and three would not. The feeders are all on the roof, all in
shot, and they are the more honest object anyway: *a hatch is the permission; a feeder is the access
it became.*

**Where it lands is punctuated.** The route arrives on a horizontal surface, so the ring it throws
is flat and the dust goes sideways — the same landing the boundary wall's leaf made in act 1 when
it hit its threshold. Without it, the film's single most pointed moment was a line that simply
stopped.

## 2 · The door, run backwards

*"a legitimate traffic challan does not require you to install an APK sent over WhatsApp."*

The camera comes down to the hole the victim cut in their own wall in act 1, and **act 1's mechanism
runs backwards, in its own order**: the leaf grinds up out of the threshold it dropped into, the
bolts drive home through its stiles, and only then does the field draw across.

The field **closes from both jambs inward and meets in the middle**, because that is the only way a
curtain strung between two posts can re-establish — and the meeting is the moment the door is shut.
It does not fade up. `act4.mjs` asserts all four states reach zero, in that order, and that all of
it is done **before** the door is tested.

Then WhatsApp's own courier arrives with the same parcel on the same approach it flew in act 1, and
there is nothing to fly through. It does not bounce and it does not comically recoil: it arrives,
what it ran into answers once, it holds, and it takes the parcel away.

## 3 · The place that was always there

*"verify it yourself through the official e-Challan portal or your state traffic police website"*

Every other building in this film stands in the court, which is inside the phone. The real office
does not: it stands on the **plaza**, on the public side of the boundary wall, which is where this
film has put everything that is not yours since its first frame. **That is the sentence, drawn as
geography** — the fake office was delivered in a box and erected inside your wall; this one has been
standing out here the whole time, and you go to it.

A message still arrives, because messages do. It lands on the pavement — on the exact spot the
route's own tail ended, three movements earlier — and nothing opens it. The camera leaves it there
and tracks west along the plaza, **past the store gate**, which is the door that was always the
right one.

It must never be mistaken for the other one, so every borrowed thing the fake office used is absent:

| the fake office | this one |
|---|---|
| a colonnade and a pediment | a flat parapet, a flag and a public clock |
| a medallion that is a camera lens | a lettered board you can actually read |
| a mast, a dish and a hoist on its roof | nothing on the roof but sky |
| cool white stone and cobalt | warm limestone, and horizontal emphasis throughout |
| **a front that SANK to show a machine** | **shutters that ROLL UP to show a counter** |

That last line is the act's rhyme and the only reason the shutters exist: the same axis, the
opposite direction, and the opposite thing behind it. They roll up one at a time, on the two options
the sentence names. The last frame of the film has no red in it at all.

## 4 · What the half-second pass caught

- **The act boundary was a cut.** Act 3's last frame is the attacker's console with the counter at
  4107 and a red line running out of it; act 4 did not draw the station, so at 100.03 s the compound
  vanished and left empty violet sky. It draws what act 3 left, and drops it only once the camera
  is past it.
- **The return was a second of nothing** at the top of the act that matters most. It follows that
  red line home instead — the same thread, unbroken, from the attacker's console to the victim's
  pavement.
- **The route read as a stripe.** At this framing it runs straight down the building's own axis, so
  drawn in the film's cable grammar it looked like red paint on a building. Nearly all the weight
  moved onto the thing that is travelling; the thread it leaves is 2.2 units at 26%.
- **The three cards popped into existence** in the bay. They come edge-first out of the opening they
  are leaving, which is the emergence act 3's duplicate used to get out of the SMS hatch.
- **The counters were flat brown holes** at full size. They have a back wall, a lit soffit, a shelf
  with forms on it and — the thing that actually makes an opening a counter — a **sill that projects
  out of the wall**, with a docket and a queue ticket lying on it.
- **The counter could not hold the scene it had to carry.** Its head was at 1152, which left a
  92-unit opening with a 74-unit notice standing in it. Three separate failures followed from that
  one number: the paper filled the window corner to corner, the lamp that was supposed to be
  *reading* it was **behind** it, and the horizontal fittings left visible round the edges read as a
  chest of drawers. The head is now at **1112**, the middle of the interior is cleared (the mullions
  are gone, the shelf is split either side of the serving light), and the notice arrives at **127 px
  instead of 161** so it is framed by lit window on all four sides. The bay's geometry is one
  exported table, `BAY` in `v2/civic.tsx`, because the paper and the fitting were being drawn from
  two sets of numbers (rule: two layout tables drift).
- **The push-in stopped 24% short.** z 2.10 → **2.60**, centred on the one bay: the counter is
  **457 px** across instead of 369, and the board over it and the doorway beside it are still in
  frame, so it is a counter in a building rather than a diagram of one.
- **The reader was a floating line.** It is now a fitting: a housing and a lens in the soffit
  directly above where paper is laid, which goes over to **the portal's own colour** while it is
  working; its light falls on the notice as a wedge you can see; and the part of the document the
  light has already crossed stays washed in that colour, so at every instant you can see how much
  has been read.
- **The answer was a green tick, and that was the one reading this film cannot afford.** A viewer
  with the sound off watched a scam notice carried to the official portal and *ticked*. What
  verifying this message actually returns is that there is no such challan — which is the entire
  reason for telling anyone to verify. The portal now prints a slip out of the slot in the face of
  the sill, **printing as it feeds** (one clip reveals the paper and its type together), carrying
  the notice's **own number** so the answer is visibly about this document: `NOTICE NO. 2419703 —
  NO RECORD`. The slip is 124 units out of a 152-unit slot, so the slot stays visible either side of
  it and the thing has a source. Then the official blue goes out of the notice's head, because it
  never was one. Sound follows the picture: the feed is a printer, and the chime — the film's one
  consonance — lands on the **release**, when the answer is readable, not on the feed.
- **Act 4's whole dish-send and counter block was in the file twice**, the second copy the earlier
  draft of both. Everything in it was drawing at double strength over its own replacement. Found by
  looking at a render at full size, not by any gate.
- **THE FILM STOPPED TALKING BEFORE IT STOPPED SHOWING.** The read and the answer used to run under
  "…or your state traffic police website before opening it", so the one practical instruction in the
  film competed with the words giving it. They now begin **after** the last measured word: the film
  runs 137.69 s and its last 2.9 s are silent picture. `EndCard.TAIL_SHOT` is the gap, and the mix's
  own length is taken from `EndCard.TOTAL` rather than typed, so a longer closing shot can never
  silently cut the sign-off off.
- **The closing shot ignored half of its own sentence.** It pushed in on the e-Challan portal bay
  alone while the narration named the portal **and** the traffic police. It is one framing now,
  held for eight seconds and locked off: centred on the building, both counters the same size and
  the same distance from the middle, the whole facade in shot with daylight down both sides, the
  flagstaff at y 96 and the plinth at 1694. `act4.mjs` measures the pair at both ends of the hold —
  it caught the camera's 11-unit breath walking the frame 22 px sideways over those eight seconds,
  so the breath is now damped out as the camera settles. A closing shot is locked off on purpose.
- **The whole-frame ceiling on the answer.** At "whole facade in frame" the counter can only ever be
  about 34% of the frame's width, so the slip inside it tops out near 270 px however the building is
  scaled — scaling the building scales the counter with it. The slip is therefore designed *for*
  that size: no small grey caption, the number set large, and the verdict **white on solid red**
  rather than red on pink, because at 38-px caps contrast carries a word and colour does not.
- **The return from the compound lost its way in the middle.** Two hand-placed waypoints gave a path
  that bulged 589 units off the line and a speed of 1363 → **800** → 1136 → 0 px/s. The move is
  *designed* now rather than keyed: a cubic Bézier whose two control points solve the geography (the
  compound's edge must leave the frame before the city's skyline enters it, or the 2,400 units the
  film has put between them collapse), sampled at **screen-weighted arc length** under a smoothstep
  profile. One acceleration, one peak at 1241 px/s, one deceleration, no dip; the heading sweeps
  178° → 106° without a kink. Smoothstep and not the film's own `ease.inOut`, whose slope peaks at
  three times the mean.
- **The antenna was cut off at the arrival.** At (690, 1020, 1.22) the app building's mast head —
  the thing the recap is about to climb — sat **104 px above** the top of the frame. The return now
  ends at (690, 900, 1.16): the tip is at y 91 and the pavement the route sets off from at 1424.
- **The line between the city and the compound came back after it had done its job.** It was kept
  faintly alive so the camera had a thread to come home along; the effect was a channel that
  reappears at the exact moment the film says the attack is already complete. Deleted. The camera
  carries the return by itself.
- **The camera fidgeted.** A new measurement in `camera.mjs` counts *changes of shot* — reversals of
  pan, tilt or zoom, with simultaneous ones collapsed into one decision — inside any two seconds of
  movement, and the sharpest heading swing mid-move. The film scored **8 changes in two seconds** at
  16.4 s and **563°/s** at 8.1 s. Three stretches were rebuilt:
  · **0–4 s** went 1.14 → 1.07 → 1.13 → 1.30 → 1.28 → 1.06 in the lens with the tilt going down, up,
    down, up. It is one accelerating push onto the card — header, plate, fine, each closer than the
    last — and one pull-back on "WhatsApp." that says the whole thing is sitting in a chat.
  · **8–13 s** made four changes of mind in five seconds, none big enough to read as a decision. One
    tilt as the file slides out, a hold while the name is typed, one push onto the name, a hold, one
    release for the tap.
  · **16–19 s** widened and pushed back in between the wall's two refusals. The refusal happens
    twice in the same place: the camera states it once and then watches it happen again.
  Act 3's OTP copy no longer zooms out 26% and back in to look at a journey it is already following.
  The film is now at **2 changes in any two seconds** and **13°/s**.
- **The phone came up on an ease, and its top was off the frame.** Lifting a 1180-unit slab by 290
  ran its top edge 38 units past the top. It is lifted 240 and drawn at 0.91 — a phone raised in a
  hand does go further away — clearing the frame by 65 units at rest and 48 at the top of its
  bounce. And it has a bounce: the film's own heavy spring written out, 1.5% overshoot, the middle
  of the plan's 0.5–2% band for heavy objects. The city behind it goes to 0.40 (was 0.28) and the
  slab carries its own soft fall-off, so the frame states which of the two things in it is being
  spoken about without taking the street away.
- **The confirmation screen outstayed its sentence.** "The financial details you enter into those
  fake payment screens…" played over *Payment successful* until "fake payment", 1.5 s after the word
  that names what the shot is about. The deck turns over on the word **"details"** — which needed a
  new accessor, `W(block, word)` in `timeline.ts`, because beats are offsets from BLOCKS and block
  128 is "financial details". Same law as before: measured, never a wall-clock time.
- **THE PHONE STAYS IN THE MIDDLE OF THE FRAME**, and this is now a law with a gate behind it.
  Rebuilding the opening as one clean push and one clean pull did not fix it, because the fault was
  never the number of keys: at z 1.30 a 560-unit phone is 728 px of a 1080-px frame, so an 85-unit
  lean to look at the number plate threw the whole slab 185 px off centre and cropped it against
  one edge. Six of those leans in twenty seconds is a phone sliding around inside the frame while
  the lens behaves perfectly. The plate, the fee, the filename and the new app icon are all INSIDE
  the phone, so the camera points at them the only way it can without losing the object that
  contains them: it descends and it tightens. `camera.mjs` now measures the composed transform of
  the phone — act 1's pointing camera on top of its structural one — whenever the phone fills more
  than 55% of the width, and fails if it drifts more than 60 px off the middle or touches a side
  edge. Worst now: 29 px.
- **The antenna was clipped for two seconds while the camera climbed it.** The arrival was framed
  off `TIP`, which is the RADIATOR'S CENTRE — the spire, its collar and its finial stand 56 units
  above it. `MAST_TOP` is now exported from where the mast is actually drawn, and `act4.mjs` walks
  every frame from the arrival to the moment it fires: the spire is never higher than y 54.
- **The message changed size on the frame it left the glass.** The held phone is drawn at 0.91, so
  a notice DOC_W wide on the glass is 0.91 × DOC_W in the frame — and the flight started at the
  design width, so the object grew 9% on one frame. `phoneScale` is now one function used by the
  phone's transform, by `heldPoint` and by the flight, and the gate compares the two widths.
- **The background went black for three seconds at 1:06, and again at the deck.** Act 3 drew its
  phone and nothing else, so the composition's own ground showed through and the skyline the viewer
  had been standing in front of since the first frame simply stopped existing. It draws act 2's
  `City`, with act 2's transform, so the act boundary is not a boundary in the picture.
  The gate for it does NOT measure darkness — this film is set at night, and its chat screens, its
  home screen and the attacker's compound are all dark pictures with something in them. It measures
  the outer sixth down each side, between the watermark and the caption band, and asks whether
  there is anything there at all: the faulty render read mean 4.0 / sd 0.0, the film's darkest
  legitimate background (the night sky on the return) reads mean 17.5 / sd 5.6.
- **The message landed under the caption.** Moved up to the foot of the wall, 70 px clear.
- **The sky had no stars west of x 0**, where the last shot lives, so half that frame's sky was
  empty and half was not. A second field was added beside the first rather than by widening it,
  because widening moves every star in the three acts before it.

## 5 · Sound

The film's harmony has been D minor with a flattened second souring every chord since the file
appeared. Act 4 is the only part of it allowed to resolve, and it resolves once, at the end:

- **the recap** takes the pulse away entirely — the case is stated, not argued — over plain D minor
  and a half-time kick;
- **the door** keeps the b2 until the field meets in the middle, where the score plays **D and A over
  the root: a bare fifth, and the first consonance in two minutes.** That is the sound of the door
  being shut;
- **the last ten seconds are D major** — the same root the first frame started on, finally with a
  major third under it;
- and under the final frame, **a public clock ticks once a second**, quiet enough to be almost
  subliminal. It is the only sound in the film that says a place is open *right now*, and it is the
  last thing the viewer hears before the sign-off.

Every other sound here is one this film has already made, run again or run backwards: the panel's
grind rises instead of falling, the shutters' grind rises where the office's front's fell, and the
four cables sing the four pitches they were granted on.

---

# THE CAMERA, AND THE OUTRO'S SECOND PASS

The note: hold the camera movement to high-end cinematography standards, and fix it wherever it
falls even slightly short.

## 1 · Every camera in this film stopped dead at every key

The note was about one move — the return from the attacker's compound — but the cause was
structural and film-wide. Every camera table was read with `ease.inOut` **between consecutive
keys**, which eases to a stop at *each* key. A move built out of three keys is therefore not one
move: it is three lurches with two dead stops inside it. Measured on the return:

```
 72 → 2093 → 1225 → 160 → 3589 → 1   px/s,  peak acceleration 72,000 px/s²
```

It is exactly the defect this project already has a law about for objects
(`eased-legs-make-false-stops` — *"piecewise inOut stops the object dead at every junction"*), and
nobody had thought to apply it to the thing doing the looking.

All four acts now read their tables through one dolly (`v2/track.ts`), a **monotone cubic**
(Fritsch–Carlson PCHIP), per axis:

- velocity is continuous everywhere, so there are no lurches;
- a key whose neighbours differ gets a real tangent, so the camera **passes through it at speed**;
- a key next to a repeat of itself — which is how this film writes a hold — gets a zero tangent, so
  a move still eases in and out and a hold is still perfectly still;
- and being monotone it cannot overshoot, so the camera never sails past a framing and swims back.

**Key times are untouched.** Several tables put a key on a spoken word, and re-timing keys to even
out speed would desync the picture from the read. Where a segment's authored speed is wrong, the
fix is that key, not the curve.

## 2 · And the gate that keeps it honest

`tools/echallan/camera.mjs` measures every camera in the film as **screen-space optical flow** —
pan × scale *plus* zoom × 540/z, which is the only quantity the eye actually measures. The first
cut of the gate measured pan alone and was therefore blind to every push-in in the film, including
a z 1.02 → 1.86 in half a second.

It fails on the three things that actually read:

| | what it catches |
|---|---|
| **a dead stop inside a move** | speed dips and comes back without the picture ever settling. A *reversal* is exempt — the camera passes through zero when it turns around, and Fritsch–Carlson puts a zero tangent there on purpose |
| **smear** | past ~3,100 px/s outside the two declared transits along the uplink, where there is deliberately nothing in frame |
| **a hard arrival** | the time from a move's fastest frame to rest, against the speed it has to shed. The return shed 4,087 px/s in 0.23 s |

The limits are **the film's own**. Acts 1–3 are approved footage and several of their quick moves
are deliberate — the camera tracks a granted key up to its machine in half a second — so the bar is
"no worse than what this film already does", which makes the gate a regression test rather than a
re-litigation of shots that are already signed off. Iris crossings are exempt: while the picture is
being replaced, the camera's speed underneath it is not what the eye is tracking.

The return is now **1,474 px/s peak with a 1.02 s arrival**, and every act passes.

## 3 · The rest of the second pass

| the note | what it was | what it is |
|---|---|---|
| **a division in the sky** | the compound's sky and ground began at a hard left edge at x 1920, with a near-black band painted over the join to hide it — which hid nothing and added a vertical seam of its own | a 700-unit atmospheric blend, masked, so the division still exists (it is a different place, a long way off) but reads as **distance** rather than as a mistake |
| **the laser back at the city** | a red line ran from the attacker's console to the city on "transactions." It read as the compound firing a weapon, which is not what the sentence says and not what happens | gone, along with everything that depended on it. The return follows the **uplink that is already there** instead |
| **something goes into the ground and comes back up** | the recap's line drew *backwards* from the dish down to the pavement and then ran pulses back up it | it runs **forward only**, once, from the pavement to the antenna, at an even speed along its own length. `act4.mjs` walks every frame and fails if it ever decreases |
| **the block rising is vague and slow** | the service shaft's payload was on a **looping sawtooth**, `(t*0.22) % 1`, with no relationship to anything being said — so the antenna lighting a moment later had no visible cause | one climb, accelerating the whole way (a 2.6-power ease over 2.9 s), crossing the shaft, the roof and the mast and **landing at the antenna's head on the word "malware."** The head answers with an impact ring, and the four feeders carry it outward from that point |
| **the code appears out of nowhere** | both stolen halves were one eased sweep, so the code — which leaves a third of a second later — was still out on the ray when the camera arrived and first appeared halfway down the building | three parts, which is what it physically is: it crosses on the ray, the **bowl catches it** and holds it for four tenths of a second while the dish answers, then it is fed down the mast and the console's rail. The camera holds wide enough to keep the dish in shot while it happens |

## 4 · The advice is given about a phone

*"Since we're dispensing advice, it is important to have a phone on scene… the primary one should
be the phone."*

Correct, and the first cut played both sentences entirely in the city. The phone comes back up —
act 1's chat, act 1's notice, act 1's attachment tile, nothing new — **in front of** the city rather
than instead of it, and both refusals then happen at once and are the same refusal at two scales:
the attachment declines to open, and four hundred units below it the wall the victim cut declines
to be flown through.

It is **lifted 290 px above its natural place**, because at its normal position the phone is 61% of
the frame height with its middle at y 842, which put the entire boundary wall — and therefore every
frame of the wall closing itself — underneath a slab of glass. Lifted, the two stack: the
instruction on the screen, the consequence in the street below it, both completely visible.

And the last sentence is the one the whole film is for. The notice **leaves the phone**: it lifts
off the glass, arcs out over the city, crosses the plaza past the store gate, and is handed in at
the counter of the office that can answer it. A reader passes over it once, and the portal answers
with **its own slip, out of its own counter** — the green belongs to the answer, not to the message.
What has been verified is that you asked the right place.

The flight is computed in **frame coordinates at both ends** — it starts at the notice's place on
the glass and ends at a point in the city the camera is moving past — so one object crosses the two
spaces without either of them having to bend.

---

# ROUND 12 — the cut that kept landing inside the word

The note that opened this round: the narrator says *"backgrou"*, the cut lands, and *"und"* arrives in
the next segment — for the second time in a row. Twice was right, and the reason
both earlier fixes missed is worth writing down, because neither of them was a bad fix — they were
fixes to the wrong thing.

## 1 · The gap the tool believed did not exist

`voice.mjs` takes the pause at each designed hold from the word map: `W[k].e → W[k+1].s`. Those two
numbers are **not measurements**. They come from ASR, and ASR's word times come from
cross-attention, which smears exactly where a cut happens — at the edge of a pause.

Measured against the waveform of `fin-ch.mp3`:

| the map said | the recording does |
|---|---|
| "background," ends 46.016 | the voice runs on to **46.220** |
| "You" starts 57.400 | the file is at its noise floor from 57.548 to **58.296** |
| "dropper," ends 63.089 | the voice runs on to **63.222** |
| "Please" starts 107.22 | the word begins at **108.29** |

So the tool computed pauses of **44 ms, 80 ms and 51 ms** at three anchors where the recording
actually pauses for **404 ms, 748 ms and 440 ms**. Believing there was no pause, it did the only
thing it could: hunted for "the quietest 10 ms" inside what was really continuous speech. In
continuous speech that search has exactly one kind of answer — a **stop closure** or a **nasal**,
both of which are real silence *inside a word*: the /p/ in "dro-pper", the /n/ in "fi-ne", the
unreleased /d/ where "background," runs into "and". It cut there, three times, and the shaped
exponential fade added in round 11 made the chop *decay beautifully* without making it any less a
chop. That is why looking at the envelope passed it: **a stop closure plots as a perfect decay.**

The same wrong number is why the phone arrived early. The map put "Please" at 107.22 s; the word
begins at 108.29. The lift was cued 0.18 s after a word that had not started, so it rose almost a
second before the narrator spoke. One defect, two symptoms.

## 2 · The unit of measurement is the utterance

`align.mjs` no longer hands the whole file to ASR. It segments the recording first, with a
hysteresis VAD whose thresholds come from the read's own speech level (95th-percentile frame), and
transcribes **each utterance on its own**, shifting the word times into absolute time. The
character-wise alignment against the locked script then runs exactly as before over that stream.

The point of the change: a segment's start and end are measurements of the waveform, so the first
and last word of every utterance can be **pinned** to them. ASR is only ever asked what it is
reliable at — what was said inside one continuous piece of speech. On this read the 40 utterances
transcribe to the script's own text, in order, with no assistance:

```
 18  44.300..46.220  peak  -8.9  "permission to keep running in the background"
 19  46.298..46.486  peak -41.4  "Yeah."                       <- a breath
 20  46.622..49.264  peak -10.1  "and even permission to set up a VPN connection."
 24  54.792..57.548  peak  -9.8  "where you enter the details needed to settle the fine."
 25  58.296..60.168  peak  -9.8  "You think you've settled your Chalan."
 27  61.776..63.222  peak  -8.7  "The first app was a dropper."
 28  63.660..64.970  peak -10.1  "and the subsequent update"
```

Four details decide whether this works, and each was found by it going wrong first:

- **A silence inside a word is not a pause.** A stop closure reaches 110 ms in careful speech, so no
  bridging constant is safe. The VAD bridges by a floor and then **checks its own split**: if a
  script word's characters were transcribed across two segments, that silence was inside a word and
  the two segments weld. It caught "an up | date first" and fixed it without being told.
- **Breaths hallucinate.** Segment 19 above is an inhale and Whisper hears "Yeah."; elsewhere it
  heard "Let's go." and "most videos are already watching this video so". They are separated by
  level, relative to the read's own speech: speech peaks −7 to −14 dBFS here and every breath peaks
  −41, an 18 dB moat.
- **The read-says-the-script gate had one word of headroom.** Per-utterance ASR spells "challan" as
  "chalan" and "unauthorised" as "unauthorized", which the word-level check counted as 15 real
  mismatches — 95.3% against a 95% floor. It now compares within a fifth of a word's length in
  edits, which absorbs a spelling and still separates "an" from "in". 97.5%.
- **Never re-measure a file you built.** `voice.mjs` used to splice the holds in and then run the
  whole alignment again on the result. That threw away the one thing it knew for certain. The
  spliced map is now the measured map **plus arithmetic**, exact by construction — and that alone
  removed the 1.07 s error on "Please".

## 3 · What the splices actually do now

With the gaps measured, two of the three anchors the note named needed **no cut at all**:

| anchor | designed | the read's own pause | inserted |
|---|---|---|---|
| service. | 0.34 s | 0.724 s | — |
| SMS, | 2.45 s | 0.388 s | 2.062 s |
| calls, | 2.40 s | 0.430 s | 1.970 s |
| background, | 2.05 s | 0.404 s | 1.646 s |
| connection. | 1.12 s | 0.760 s | 0.360 s |
| **fine.** | 0.82 s | **0.748 s** | **0.072 s** |
| **dropper,** | 0.42 s | **0.440 s** | **— none** |
| malware. | 1.70 s | 0.676 s | 1.024 s |

The splice point is the quietest 20 ms inside the measured pause, and among equally quiet points
the one nearest its middle, with 30 ms excluded at each end so a fade can never reach a word. Room
tone from the read's own floor, 12 ms fades. Every join now sits at **−58 dBFS or below** and the
one that is loudest is a *breath*, not speech — worth naming, because the pause after "background,"
is not silent at all: the speaker inhales for the whole 404 ms of it at −41 dBFS over an −84 floor.
There is nothing better to do there than splice at the quietest moment of it, and the tool says so
rather than pretending it found silence. An early version of it *did* pretend: its fallback
returned the whole gap when no quiet run was found, and its own guard then read that as 0.404 s of
silence and passed.

## 4 · The gate that would have caught it

`splice-check.mjs` used to print the envelope either side of each hold for a human to read. A human
read it and concluded the joins were fine. It now asks the only question that matters — **is every
word still whole?** — three ways:

1. every utterance of the delivered narration, transcribed on its own, against the script;
2. at each hold, that the utterance before it **ends on the anchor word** and the one after it
   **begins on the next word**. This is the direct test for "backgrou … und";
3. a **differential against the source read**: the delivered file is the recording with silence
   added, so it must transcribe to exactly the same sounds. This has no opinion about spelling,
   because it is the same recogniser on the same voice — any difference is something the splice did.

It reports `all 326 sounds identical — the splice damaged nothing`.

## 5 · The bounce is two numbers, not one

*"the bounce effect includes both amplitude and frequency, not just amplitude."* Exactly right, and
the reason the last attempt was invisible: the lift was a **second-order step response**, and a step
response cannot separate how far a thing bounces from how fast. Both come out of the damping ratio,
so asking it for a bigger bounce also asks it for a slower one. At 3.8% overshoot it rang with a
damped period of **0.95 s** — 46 px spread over half a second, which the eye reads as a drift.

It is written the way it happens now. The **hand** raises the phone over `LIFT_RISE` and stops; the
phone does not, because it is a mass on a wrist, so it carries past the stop and rings down about
it. Amplitude (`OVER`), frequency (`RING_HZ`) and decay (`RING_DECAY`) are three independent
numbers, and the hand's profile is the cubic that leaves with exactly the velocity the ring starts
with, so the join is continuous in position *and* velocity.

| | before | now |
|---|---|---|
| first overshoot | 46 px | **71 px** |
| damped period | 0.95 s | **0.31 s** |
| visible swings | one | **+71, −28, +11 px** |
| settled | 0.80 s | ~1.0 s |

**The amplitude is capped by the frame, not by taste.** At `PHONE_UP` 240 the phone's top cleared
the frame by 65 units at rest, so a 71 px overshoot would have run it off the top — the exact fault
the lift was re-cut for two rounds ago. `PHONE_UP` came down to 208: the phone rests 32 units lower
and its bounce now peaks about where it used to sit, leaving **26 units of air** at the top of the
bounce. `act4.mjs` walks every frame of the lift and fails under 18, and fails if the bounce carries
less than 55 px, so neither can drift again.

And it has a sound. Three, on the three things the picture does: the whoosh cut to `LIFT_RISE`
(it used to run 0.9 s and was still rising after the phone had stopped), a soft low **load** at the
moment the hand stops — which is what gives the overshoot a cause you can hear — and the small
chime when the ring has died.

## 6 · The street, framed off its own two numbers

*"look at how much empty space there is in the bottom where nothing is happening… the gaps above
the antenna and below where the signal originates should be roughly equal."*

Measured in the delivered frame, the shot at 1:38 sat **103 px above the spire and 460 px below the
ground mark** — four and a half times as much below as above. The previous round's note claimed
"110 px of air each side", and it was not lying: it had balanced the subject inside **the 1,520 px
the captions leave**, not inside the frame a viewer looks at. A margin measured against a box the
audience cannot see is not a margin.

The subject's two numbers are exported and the framing is derived from them: the mast's spire at
`MAST_TOP` = 95, and the bottom of the ripple the pavement answers with at 1354.6 — 1,259.6 units,
middle at 725.

The constraint that decides the rest is that **1,740 down is where the Shorts UI starts** and the
caption takes 240 px of whichever end it stands on. `captions.mjs` measures this page's bottom band
as the busiest in the act and stands it at the top, which frees the floor — so the margins are equal
in the part of the frame that carries picture:

| | before | now |
|---|---|---|
| above the spire | 103 px | **142 px** |
| below the ripple, to the UI line | 280 px | **139 px** |
| the subject | z 1.077 | **z 1.16** |

`act4.mjs` used to test the ground mark against a flat y 1500 — the top edge of the bottom caption
band — which is the right number only while the caption is down there. It reads `caption-side.json`
now and tests against where the caption actually is.

## 7 · What the honest measurement cost, and what paid for it

Measuring the pauses correctly made the film's silences **shorter** — they had been getting the
designed hold *plus* the read's own pause. Four gates failed on the first sweep, and all four were
the picture losing time it had been getting by accident:

| gate | what failed | what paid for it |
|---|---|---|
| `focus` | the background machine was looked at for 0.43 s (floor 0.68) | the hold after "background," 1.50 → **2.05 s** |
| `camera` | act 2 shed 2,257 px/s in 0.20 s (floor 0.21) coming off the film's **widest** shot (z 0.58) into a close question | that one transition leaves its machine 0.22 s earlier — `LEAVE` is per-permission now, not one constant |
| `act3` | "the hollow" was still for 0.67 s (floor 0.80) | `climb0` +0.16 s: the crane may not start until the empty shell has been looked at |
| `camera` | act 3's flight to the compound peaked at 4,274 u/s (limit 4,100) | the leg given 0.16 s more — a transit is sized by its **peak**, and a monotone cubic runs faster mid-leg than its average |

---

# ROUND 13 — the score, given an emotional shape

The note: *"After narrator says 'installed a malware', there is a tension escalating score that can
be heard briefly. However, the score doesn't persist it or something equally tensed in the
explanation of what the malware can do… the score needs work to reflect the correct emotional cues
throughout."*

## 1 · What was actually there

**A silent wiring fault.** The score asked for a beat called `A3.cross`. The picture had renamed it
to `A3.hollow`. Nothing failed — `t < undefined` is simply false — so the two sections either side
of the film's biggest moment **never matched**: the floor never dropped under "but in reality", the
held note under the empty shell was never played, and every bar of both fell through the kick's
DEFAULT of 0.16, the loudest setting in the file, exactly where the design says there should be
nothing at all. Both cue tables are behind a proxy now; asking for a beat the picture does not
define throws.

**And the arc was flat.** `tools/echallan/score-arc.mjs` was written for this round: it measures
the music stem per section for level, peak, movement (last third minus first third), onset density,
spectral centroid and the low/high energy split, and prints them beside what the narration says
there. On the delivered film it read:

| passage | length | movement |
|---|---|---|
| theft — *"what the malware can do"* | 12.8 s | **+0.3 dB** |
| recap — *"so what looked like…"* | 13.2 s | **−1.1 dB** |
| door — *"please be aware…"* | 7.5 s | **+0.0 dB** |
| go — *"verify it yourself…"* | 13.5 s | **−2.6 dB** |

Forty-seven seconds — over a third of the film — in which the music did not move. Every section
from the hook to the sign-off sat between −24 and −29 dB.

**The cause was one line.** A root two octaves down, on every beat, at a fixed 0.13, for the whole
film bar three short holds. A constant that large *sets* the level; everything written on top of it
was decoration on a flat surface. It follows the arc now, like every other voice, and where act 3's
two engines lay their own pedals it gets out of the way entirely.

## 2 · The four passages

**THE THEFT** is the peak of the film's *argument* the way the reveal is the peak of its *picture*,
and it was the flattest stretch in the second half. The sentence is a chain — the details are taken,
the malware already has your SMS, so the codes are taken too, so they have both, so they can
transact — so the music is built as that chain. Six stations, each fastened to a frame where the
picture does the thing, and at each one all three parameters move together: **the pedal drops a
semitone, the cell's period shortens, the level comes up.** One per beat at "The financial details"
to one per sixteenth at the console; a pedal on the root to one five semitones below it. It does
not release at the beam, because the sentence is not over — the console is where the credentials and
the codes are put *together*, and that is the worst moment in the film. It stops dead on
"transactions."

Measured: **−28.6 dB at "financial details" to −20.1 at the console, +8.5 dB with no holes in it.**
The first cut of it *did* have holes — fifteen decibels between plucks, because the pedal's decay
constant was half a second and it was gone within a second of each station. A machine that
hesitates is not tense.

**THE RECAP** is not tension, it is realisation, which is a different musical job. Two things make
it work and both come from the picture. First a **real hole** — the camera lets go of the attacker's
console and crosses ground with nothing on it, and the score goes with it; three seconds at the
bottom of the film's range is what makes what follows feel like understanding rather than like more
of the same. Second, **it assembles**: "…make you INSTALL the malware, APPROVE its access, and HAND
OVER all the information" is three clauses and three things the victim did, drawn as a route
climbing the building it built, so the score climbs with it — one note per clause, each higher than
the last and **each one staying**, so that by "carry out an attack" they are all sounding at once
and the chord *is* the whole machine. It ends unresolved, on the fourth. Density a third of the
theft's: a thing being explained is not a thing being done to you. **−1.1 dB → +11.3 dB.**

**THE ADVICE** is the one place the film speaks *to* the viewer, and direct address needs room and
then one unambiguous gesture. The gesture was already in the picture: the panel the victim cut into
their own wall comes back up, the bolts drive home. So the score agrees with it, using the plainest
thing in tonal music and the one this film has withheld for two minutes — **a perfect cadence.** The
bass steps to the fifth as the panel rises and lands on the root as the bolts seat, and the fourth
the recap left hanging falls at the same instant. It is not major yet: a door being shut is safety,
not warmth, so it lands on a bare open fifth with no third in it.

**THE WAY OUT** blooms, and it blooms on what the picture does — the notice lights, leaves the
phone, the real office rolls up one shutter and then the other, and its light reaches the pavement.
Each adds a voice and lifts the register, so the chord is widest exactly when the building is. Then
the narration stops and the last two and a half seconds are picture alone, which is where **the root
finally arrives in the bass**. The film has been in D the whole time and had never once landed on it.

## 3 · Two things that were structurally wrong underneath all of it

**`ar()` has no sustain.** It is attack-then-exponential-decay, so `rel` is a time constant and
every "held" pad in this score was really a slow fade — a pad written with rel 2.4 has lost two
thirds of itself six seconds later, whatever its `dur` says. That is why the closing bloom sagged
nine decibels while its picture was still opening. Everything that has to HOLD a section now carries
a release on the order of the section's own length.

**The film was mono.** Measured on the delivered mix, the side channel sat **30 dB** under the mid
from the first frame to the last. Every element here is a mono source placed with a constant-power
pan, and panning a mono source does not make a stereo image — it moves a point along a line. Two
changes fixed it:

- a pad is no longer one source with a pan; its five detuned voices are generated separately,
  spread across the field and offset from each other by a few milliseconds — detune, position and
  time, the three things that decorrelate two channels;
- the city bed ran **one noise stream into both channels** at 0.9 and 1.0. A room tone is the one
  element that should be fully decorrelated — it is the air around the picture, and air does not
  come from a point. Two independent brown-noise chains now feed the two channels, while everything
  tonal in that bed stays centred, because a pitch coming from two places smears instead of widening.

Side went from −46.9 to −30.5 dB: **16 dB of image**, on a film that had none. The bottom stays in
the middle — spread tapers to zero below 150 Hz, so every kick, sub and pedal is centred.

And the ceiling: `alimiter` limits *sample* peak, and a lossy encode reconstructs inter-sample peaks
above it. At limit 0.80 the mix measured **−0.6 dBTP**, which clips after a platform transcode. At
0.66 it lands at −2.1 with the loudness untouched, because a limiter buys headroom out of the peaks
rather than out of the whole programme.

## 4 · And the gate that keeps it

`node tools/echallan/score-arc.mjs --check` fails if any section longer than six seconds moves less
than 2 dB (excluding the two designed silences, the reveal's stab and the sign-off), if the whole
score lives inside 12 dB, or if the loudest single moment in the film is not the reveal.
`score-opening.mjs` additionally fails if the true peak exceeds −1.5 dBTP or the mix collapses to
within 22 dB of mono. None of these existed; all four of the faults above would have been caught by
one of them.

| | before | after |
|---|---|---|
| dynamic range across the film | ~5 dB | **17.2 dB** |
| theft | +0.3 dB | **+3.7**, and +8.5 across theft→close |
| recap | −1.1 dB | **+11.3** |
| the way out | −2.6 dB | **+3.8**, and +6.0 on the silent picture |
| stereo, mid over side | 30 dB | **13.4 dB** |
| true peak | −0.6 dBTP | **−2.1 dBTP** |
| voice over the ducked bed | median 25.7 dB | median 26.4 dB |
