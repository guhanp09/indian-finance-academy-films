# UPI Scam 1 — the narration

> **This is now a record of the DELIVERED read, not a brief.** The recording came back with a
> different opening from the locked draft — 20 of the first 28 words — and the decision was to
> cut the film to what was said rather than re-record. Sentences 1–2 below are the recorded
> wording; everything from "The moment you enter your PIN…" onward is the original script, spoken
> verbatim. The direction in §4 is kept because it describes how the delivered read performs.

Everything below is measured off the narration the film is currently cut to, not estimated.
Pace: **141 wpm** gross. Total narration 47.47 s; last word ends at 46.02 s.

The film's timing is **word-anchored** — every visual event is pinned to a measured word onset, so
a new read re-times the whole film automatically. The one exception is the hold in §3, which the
picture is cut *into*. That one has to be right.

---

## 1. Delivery

| | |
|---|---|
| Register | **Natural.** A 100-word factual read; flattening it loses the reversal in §3, which is the whole point of the film. |
| Speed | **As read.** Do not speed-correct — the cut follows the read, not the other way round. |
| Character | none; this is not a character performance |

**Say "UPI" as three letters.** It is written `U.P.I.` throughout below. If a take runs them
together, re-record the sentence.

The direction is carried mostly by punctuation, capitalisation and sentence shape — see §4.

---

## 2. Record it in TWO parts

This is the safe way to get the hold exactly right. Nobody performs a reliable 1.66 s of silence —
so don't ask for one. Record two files and butt them together with measured silence between.

### Part 1

```
The scammer will send you a U.P.I. request disguised to look like an incoming payment. All you seem to have to do is enter your U.P.I. PIN to receive it.

The moment you enter your PIN and approve it, however, instead of you getting paid, the money LEAVES your account.
```

### Part 2

```
While the common targets for this scam are online sellers, anyone unfamiliar with the basics of U.P.I. transactions can fall for it.

If your parents use U.P.I., let them know that they never need to enter their U.P.I. PIN when receiving money. If a screen asks for their PIN, they are authorising money to leave their account.
```

### Then join them

```
part1.wav  +  1.662 s silence  +  part2.wav
```

`node tools/upi-scam/voice.mjs "part 1.mp3" "part 2.mp3"` does the join and re-measures the film.

---

## 3. The gap — 1.656 s as delivered, after "…leaves your account."

Not a breath. Three things happen on screen inside it, and the next sentence starts when the last
of them finishes:

| after the word "account." | what the picture does |
|---|---|
| +0.15 s | the fraudulent request card is flung off screen |
| +0.51 s | the debit lands in the payment history |
| +0.78 s | a highlight starts sweeping across that new record |
| +1.53 s | the sweep finishes |
| **+1.66 s** | **"While…" begins** |

The beat exists because the evidence of the money leaving had been hidden behind the request card.
Short-change this and the viewer never sees it. Anything from **1.5 s to 1.8 s** cuts fine; under
1.3 s the sweep gets stepped on.

**Every other gap is an ordinary one** — the read sets them and the picture follows. As delivered:

| break | measured |
|---|---|
| "…an incoming payment." → "All you seem…" | 1067 ms |
| "…to receive it." → "The moment…" | 1062 ms |
| "…leaves your account." → "While…" | **1656 ms** — the hold |
| "…can fall for it." → "If your parents…" | 1392 ms |
| "…when receiving money." → "If a screen asks…" | 1210 ms |
| "…do is" → "enter…" | 288 ms |
| "however," → "instead…" | 834 ms |
| "…getting paid," → "the money…" | 664 ms |
| "…use UPI," → "let them know…" | 413 ms |
| "…asks for their PIN," → "they are…" | 347 ms |

The reader left 1.0–1.4 s at each sentence boundary where the reference draft had 0.13–0.41 s. That
is where the film's extra 7.6 s comes from — not from slower speech (141 wpm against 170).

---

## 4. Direction, sentence by sentence

**1 · "The scammer will send you a U.P.I. request disguised to look like an incoming payment."**
Level, unhurried, matter-of-fact. This is the setup and it must sound *ordinary* — the scam works
because it looks normal. No warning colour in the voice yet. "disguised" is where the picture puts
its first beat, and "incoming" is where the false money starts flowing on screen.

**2 · "All you seem to have to do is enter your U.P.I. PIN to receive it."**
Lighter and slightly quicker — this is the scammer's offer in the victim's head, the reasonable-
sounding part. "seem" is doing the work: it is the only word in the sentence that is not the scam's
own voice. Falling cadence on "it." 

**3 · "The moment you enter your PIN and approve it, however, instead of you getting paid, the
money LEAVES your account."**
The hinge of the film. Start it still level, then:
- **Do not swallow the commas around "however."** They are 388 ms and 431 ms and the score drops
  15 dB in that space. Let the sentence hang there.
- "instead of you getting paid," — slight rise, holding the expectation open.
- **"LEAVES"** is the loudest word in the film and the picture is cut to it. Land it. Don't shout
  it — weight, not volume. Then let "your account" fall away flat and final.

**4 · "While the common targets for this scam are online sellers, anyone unfamiliar with the basics
of U.P.I. transactions can fall for it."**
Serious, cooler, wider, more explanatory — the camera pulls back here and the voice should too.
Lift very slightly on "anyone" so it reads as *including you*. "can fall for it" lands plain, no
drama.

**5 · "If your parents use U.P.I., let them know that they never need to enter their U.P.I. PIN
when receiving money."**
Warmest line in the film. Direct address — you are asking a favour, not issuing a warning. Gentle
lift on "let them know". "**never**" carries the meaning; give it a little space either side.
"receiving" is a cut point — don't rush off it.

**6 · "If a screen asks for their PIN, they are authorising money to leave their account."**
The closing rule. Slow down a little, drop the pitch, and make it declarative — no upward inflection
at the end. "authorising" is the pivot and "leave" is where the picture answers. Land "account" and
stop; the sign-off comes half a second later, so don't trail off into breath.

---

## 5. If it is recorded in one pass

Workable, but check the gap after "…leaves your account." afterwards and pad it to ~1.66 s if it
comes up short. A performed pause is a *request*, not a guarantee — measure it.

---

## 6. What breaks the cut

- **Rushing the commas around "however."** The score's drop lives in that space. Fill it and the
  reversal has nowhere to land. (Delivered: 834 ms — ample.)
- **Trailing off after "leave their account."** The sign-off card comes up 0.5 s later. A long
  breathy tail collides with it.
- **A pause anywhere not listed in §3.** Every other beat is anchored to a word, so an invented
  pause pulls the picture out of sync with itself — the visuals follow the read, but only where
  the read is doing what the cut expects.
- **Speed-correcting in post.** It shifts every word onset and the whole beat map with it.

---

## 7. The subtitle, as it appears on screen

Nine pages, built from the measured word times. Times are from the start of the film.

| # | in–out | on screen |
|---|---|---|
| 1 | 0.47–6.26 s | The scammer will send you a UPI request disguised to look like an incoming payment. |
| 2 | 7.32–11.98 s | All you seem to have to do is enter your UPI PIN to receive it. |
| 3 | 13.04–15.93 s | The moment you enter your PIN and approve it, however, |
| 4 | 16.76–20.63 s | instead of you getting paid, the money leaves your account. |
| | **20.63–22.28 s** | *— the hold. No caption. —* |
| 5 | 22.28–26.98 s | While the common targets for this scam are online sellers, anyone unfamiliar |
| 6 | 27.04–31.06 s | with the basics of UPI transactions can fall for it. |
| 7 | 32.45–34.05 s | If your parents use UPI, |
| 8 | 34.46–39.98 s | let them know that they never need to enter their UPI PIN when receiving money. |
| 9 | 41.19–46.02 s | If a screen asks for their PIN, they are authorising money to leave their account. |

On screen "UPI" is spelled as a word; only the *spoken* script uses `U.P.I.`

### The script as one block, for reference

> The scammer will send you a UPI request disguised to look like an incoming payment. All you seem
> to have to do is enter your UPI PIN to receive it. The moment you enter your PIN and approve it, however,
> instead of you getting paid, the money leaves your account. While the common targets for this
> scam are online sellers, anyone unfamiliar with the basics of UPI transactions can fall for it.
> If your parents use UPI, let them know that they never need to enter their UPI PIN when receiving
> money. If a screen asks for their PIN, they are authorising money to leave their account.

*Regenerate the measurements in this file with `node tools/upi-scam/script.mjs`.*
