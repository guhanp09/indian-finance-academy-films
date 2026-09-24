# Production rules

The standing rules these films are built and checked against. Each one came out of a real defect in
a real cut, and the code refers to them by name — `(rule: depth is drawn, not dissolved)` in a
comment means the code below it exists to enforce that rule.

## Process

**Mockups before renders.** Every hard moment is boarded as still frames — rendered from the film's
own components, in the film's own lighting — and settled before a frame of it is animated. Changing a
board is cheap; changing a render is not.

**The silent test.** Turn the sound off and describe the frame. If the description does not state
the relationship the narration is claiming — who did what to whom — the picture is not doing its job,
however good it looks.

**A gate must measure its reason.** When an automated QA gate fails a shot that reads correctly, the
fix goes into the gate, not the film — and a gate has to measure the thing it exists to protect. A
check that averages over the whole frame cannot see one object move.

**Beat-index shift.** Visual events are anchored to measured *phrases* in the narration, never to a
beat's position in a list. An edit that inserts one sentence silently moves every boundary that was
referenced by index.

## Assets

**Assets must be recognisable.** A silhouette plus the one or two details a person actually
identifies the object by — a shop gets its half-lowered shutter, a phone its camera island.
Recognisability comes from choosing which lines to draw, not from adding rendering.

**Assets need material, not outline.** A stroke around a dark fill on a dark ground reads as
see-through. Every solid gets a value ramp (lit upper face → mid → shaded lower face) and a bevel
pair: a bright catch line on the top edge and a dark line on the bottom.

**Depth is drawn, not dissolved.** Solid objects never go transparent to look far away. Recession is
a colour operation — mix the part's palette toward the local ground and draw it fully opaque. Alpha
is for light only.

**Lights need room to glow.** Density and glow compete. A halo needs a gap to fall off into, so
light is placed where there is dark around it, never bloomed over a dense region.

**Type is read on a phone.** 13 px at 1080p is about 2.6 pt in the hand. Every size has a floor, and
in the 9:16 films nothing load-bearing is set under 40 px.

**The brand mark is never cropped.** The channel mark is identity, not content. It is scaled,
never trimmed to fit.

## Motion and continuity

**Object creation matches its nature.** Only representations — graphs, routes, schematics — are
drawn on with a growing stroke. Physical things assemble, unfold, extend, slide or lock into place.

**Object permanence in transitions.** Nothing is destroyed and rebuilt between shots. An object that
returns comes back from where it was parked, and the thing the viewer presses is the thing that
arrives.

**Eased legs make false stops.** Easing each segment between keyframes stops the object dead at
every junction, and a stop on a surface reads as a tap. A multi-key move is read through one smooth
curve across all of its keys.

**Two layout tables drift.** Objects placed by tables that do not know about each other will
eventually collide. Where two layouts share space, declare the keep-out zone and assert it when the
module loads.

## Sound

**The sound must not outrun the picture.** A sound cue that names an event the picture never shows is
a missing mechanism, not a mixing problem. Every cue is checked against the render at half speed.

**The channel end card.** One sign-off for every film — option A, "the mark arrives" — with fixed
timing, laid over a dimmed last frame.
