# Fake e-Challan Malware — the narration

The recording brief, written before the read. Every number below was measured off the read the film
was cut to at the time, and one command re-measures a new recording: the whole film re-times itself
— every beat, cue, camera key, colour stop, sound and subtitle. Nothing is hand-tuned to one read.

The delivered read differed from this draft in eight places. Those rewordings were adopted into the
locked script (and therefore the subtitles), and the holds were re-set against the delivered audio —
see `production-status.md` for the final figures.

**Script:** 307 words · **target pace ≈ 150 wpm** · **132.45 s** including the seven holds in §3.

---

## 1. Holds are cut in, not performed

The seven silences in this film are cut lengths, not performance. The permission act is five events
long and needs about 3.0 s to land; a 0.6 s pause where the picture needs 1.85 s interrupts its own
machine, and no read can be relied on to produce an exact three-second pause on cue.

**So the pipeline owns them.** `tools/echallan/voice.mjs` measures the read, looks at the gap that is
actually there at each of the seven anchors, and **tops it up** to the designed length — inserting
`designed − existing`, never the whole hold on top of a pause the read already took. Whatever the
read does, the film gets the lengths it is cut to.

**Which means the read is ONE continuous file.** No marked pauses, no splitting.

---

## 2. The acronyms are load-bearing

This film is unintelligible if these are read as words. Four of them are the whole subject. The
script in §4 already has them spelled out.

| written | say |
|---|---|
| `RTO Challan.apk` | **R.T.O. Challan dot A.P.K.** |
| `APK` | **A.P.K.** |
| `SMS` | **S.M.S.** |
| `VPN` | **V.P.N.** |
| `OTPs` | **O.T.P.s** (plural — "oh-tee-pees") |
| `e-Challan` | **ee-challan** (not "eee-shallan", not "e dash challan") |

Each letter separately. If a take runs any of them together, re-record that sentence.

---

## 3. The seven holds — read straight through them

**Do not pause for these and do not mark them.** Read the script continuously, at one pace; the tool
cuts the silence in afterwards. This matters most in the permission sentence: no natural read takes
1.85 s mid-list, and pausing there would make the voice re-attack "your phone calls" as though
starting a new sentence. The film wants those four items to sound like **four equal items in one
sentence**, and then be separated in the cut.

| after | hold | what the picture does in it |
|---|---|---|
| "…**service.**" | **0.34 s** | the calm the update is about to intrude on |
| "…**SMS,**" | **1.85 s** | the post office opens, the ✓ is pressed, and the mail hoist is erected on the app |
| "…**calls,**" | **1.85 s** | the exchange opens, and the line tap is hung off the app's cornice |
| "…**background,**" | **1.35 s** | the lens on the pediment opens its iris — and the sky opens with it, over the whole skyline |
| "…**connection.**" | **1.12 s** | the dish finishes turning, and only then transmits. The last image of the act. |
| "…**fine.**" | **0.82 s** | **the false ending.** The spinner resolves, the tick draws, the hand leaves, the shoulders drop. Without this the viewer's brain never closes the loop and the reveal has nothing to reopen. |
| "…**malware.**" | **0.95 s** | the reveal lands on the whole apparatus lit as one body, and is allowed to sit before its consequences are explained |

`voice.mjs` prints what it found and what it added, per anchor, so it is visible whether the read
was already close.

---

## 4. The script

Generated from the locked script (`tools/echallan/fragments.mjs` → `toSpeech()`), so it cannot drift
from what the film is cut to. If the script changes, regenerate it — do not edit it here.
`voice.mjs` stops and names any word in the read that is not in the locked script, because the
subtitles *are* the script.

```
The scammer will send you what looks like an official traffic challan on WhatsApp. It may include your vehicle details, an amount due, and a file named something like R.T.O. Challan dot A.P.K.. You tap the file. Android may warn you that WhatsApp isn't allowed to install apps from outside the Play Store, but you overlook the warning and tap on Allow from this source. The app installs, appears on your phone, and opens to what looks like an ee challan service. Then when you proceed to pay, it asks you to install an update first, you tap that too, and the update installs. Now the app begins asking for permissions to access your S.M.S., your phone calls, permission to keep running in the background, and even permission to set up a V.P.N. connection. After allowing all permissions, you finally arrive at the challan payment screen. You enter the details needed to settle the fine. You think you've settled your challan, but in reality, the first app was a dropper, and the subsequent update installed the actual malware. The financial details you enter into those fake payment screens can be stolen by the malware, and because you've already given it access to your S.M.S., your incoming O.T.P.s can also be automatically forwarded to the attacker's server , giving them both your credentials and the verification codes needed to carry out unauthorised transactions. So what looked like a routine traffic fine was actually a step-by-step process designed to make you install the malware, approve its access, and hand over all the information it needs to carry out an attack. Please be aware that a legitimate traffic challan does not require you to install an A.P.K. sent over WhatsApp. If you receive a challan message, verify it yourself through the official ee challan portal or your state traffic police website before opening it.
```

---

## 5. The performance

The film's argument is that the trap is **boring**. It is not a thriller, and the read should not
be one.

- **Sentences 1–5 (0 → 31 s): calm, plain and procedural.** Nothing here is sinister and the voice
  must not know that it is. If "A.P.K." gets an ominous colour, the reveal at 75 s has nothing left.
- **"Now the app begins asking for permissions…" (39 s): flatten, slightly.** The list is meant to
  feel like a list — the tedium is the point. Let "S.M.S.", "phone calls", "background" and
  "V.P.N." land as four equal items, **not as an escalation**.
- **"…settle the fine." (66 s): resolve it.** Full stop, falling intonation, done. The viewer
  should believe this sentence ended the story.
- **"but in reality," (69.3 s): THE TURN.** The single most important word in the read is **"but"**.
  Not louder — *reappraising*. Everything before it was a description; everything after it is a
  correction. Reassuring up to the comma, serious from "but".
- **"…the actual malware." (75 s): let it sit.** No emphasis needed; the picture is doing the work.
- **"So what looked like a routine traffic fine…" (100 s): explanatory, level.** This is the
  comprehension section and it must not sound like an accusation — thoughtful, not grave.
- **"Please be aware…" (114 s): direct address.** The one place the film speaks *to* the viewer
  rather than about the scam. Firm, and slightly slower.
- **The last sentence (121 s): practical, and warm.** The ending is advice, not a warning. After
  it the film runs **2.9 s with no voice at all** while the counter reads the notice and prints its
  answer, so land the full stop cleanly and let it go.

---

## 6. Ingesting the recording

```
node tools/echallan/voice.mjs narration.mp3
node tools/echallan/dump-cues.mjs
node tools/echallan/score-opening.mjs                 # or ECHALLAN_SCORE=b for the alternative
node tools/echallan/captions.mjs
ECHALLAN_COMP=Opening node tools/echallan/render.mjs out/echallan-v5.mp4
ECHALLAN_CARD_FROM=$(node -e "const n=require('./src/echallan/narration.json');console.log(Math.round((n.words.at(-1).e+3.0)*60))") \
  node tools/echallan/qa.mjs out/echallan-v5.mp4
```

`voice.mjs` takes one file or many — several arguments are joined with the legacy `GAPS` between
them before the holds are topped up. It will **stop** if the read does not say the locked script,
and name the words that differ. That is deliberate: the subtitles are the script, so a drifted read
would show words the viewer cannot hear.
