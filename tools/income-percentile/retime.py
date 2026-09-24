"""Rebuilds src/income-percentile/timing.json from a human voice-over.

The film is parameterised by beat -> frame: every scene animates against
beat(i) / beatEnd(i) and every statistic lands on a word cue, so re-deriving
that map from the actual recording retimes the whole film semantically and
locally. No global stretch is applied anywhere — each beat gets the span its
own words occupy in the recording, so a sentence read slowly gets more room and
one read quickly gets less, exactly as spoken.

  ASR word stream (with timestamps)  <->  script beats (known transcript)
        aligned by DP over normalised tokens
        -> per-beat start/end seconds -> frames

  usage:  .venv-asr/bin/python tools/income-percentile/retime.py [--dry]
"""
import json, re, difflib, math, os, sys

FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPT = os.path.join(ROOT, "docs/income-percentile/script.md")
WORDS = os.path.join(ROOT, ".align-income-percentile/vo-words.json")
OUT = os.path.join(ROOT, "src/income-percentile/timing.json")
AUDIO_REL = "Audio/income-percentile-vo.mp3"
TAIL = 85                     # frames the closing frame holds after the last word
                              # (~2.8s: long enough to read the final line and
                              # sit with it before the channel card takes over)

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()

def n2w(n):
    n = int(n)
    if n < 20: return [ONES[n]]
    if n < 100:
        return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000:
        return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    if n < 100000:
        return n2w(n // 1000) + ["thousand"] + (n2w(n % 1000) if n % 1000 else [])
    if n < 10000000:
        return n2w(n // 100000) + ["lakh"] + (n2w(n % 100000) if n % 100000 else [])
    return n2w(n // 10000000) + ["crore"] + (n2w(n % 10000000) if n % 10000000 else [])

def norm(text):
    """script text or ASR text -> comparable token list"""
    t = text.lower().replace("₹", " ").replace("’", "'").replace("‘", "'")
    def dec(m):
        a, b = m.group(1), m.group(2)
        return " " + " ".join(n2w(int(a.replace(",", "")))) + " point " + " ".join(ONES[int(d)] for d in b) + " "
    t = re.sub(r"(\d[\d,]*)\.(\d+)", dec, t)
    t = re.sub(r"\d[\d,]*", lambda m: " " + " ".join(n2w(m.group(0).replace(",", ""))) + " ", t)
    t = re.sub(r"[^a-z' ]+", " ", t)
    drop = {"rupees", "rupee", "rs", "dollars", "dollar", "a", "an", "the"}
    return [w for w in t.split() if w and w not in drop]

# ------------------------------------------------------------------ the script
beats, section, sec_i = [], "OPEN", -1
for line in open(SCRIPT, encoding="utf8").read().split("\n"):
    t = line.strip()
    if not t or t.startswith("# "): continue
    if t.startswith("## "): section = t[3:].strip(); sec_i += 1; continue
    clean = t.replace("**", "").replace("*", "").strip()
    beats.append({"i": len(beats), "text": clean, "section": section,
                  "sectionIndex": max(sec_i, 0), "words": len(clean.split())})

words = json.load(open(WORDS))

s_tokens, s_owner = [], []
for b in beats:
    for w in norm(b["text"]):
        s_tokens.append(w); s_owner.append(b["i"])
a_tokens, a_idx = [], []
for k, w in enumerate(words):
    for tok in norm(w["w"]):
        a_tokens.append(tok); a_idx.append(k)
print(f"script tokens {len(s_tokens)}   asr tokens {len(a_tokens)}")

# ------------------------------------------------------------------- alignment
sm = difflib.SequenceMatcher(a=s_tokens, b=a_tokens, autojunk=False)
match = [None] * len(s_tokens)
for blk in sm.get_matching_blocks():
    for d in range(blk.size):
        match[blk.a + d] = blk.b + d
hit = sum(1 for m in match if m is not None)
print(f"matched {hit}/{len(s_tokens)} script tokens ({100 * hit / len(s_tokens):.1f}%)")

# per-beat match rate, so a beat whose wording drifted is visible rather than
# quietly interpolated into the wrong place
weak = []
for b in beats:
    idx = [i for i, o in enumerate(s_owner) if o == b["i"]]
    got = sum(1 for i in idx if match[i] is not None)
    b["matchRate"] = got / max(1, len(idx))
    if b["matchRate"] < 0.6: weak.append(b)

for i in range(len(match)):
    if match[i] is not None: continue
    prev = next_ = None
    for j in range(i - 1, -1, -1):
        if match[j] is not None: prev = (j, match[j]); break
    for j in range(i + 1, len(match)):
        if match[j] is not None: next_ = (j, match[j]); break
    if prev and next_:
        f = (i - prev[0]) / (next_[0] - prev[0])
        match[i] = int(round(prev[1] + f * (next_[1] - prev[1])))
    elif prev: match[i] = min(prev[1] + (i - prev[0]), len(a_tokens) - 1)
    else: match[i] = max(0, next_[1] - (next_[0] - i))

def tok_time(ti):
    w = words[a_idx[max(0, min(ti, len(a_tokens) - 1))]]
    return w["s"], w["e"]

spans = {}
for si, owner in enumerate(s_owner):
    st, en = tok_time(match[si])
    if owner not in spans: spans[owner] = [st, en]
    else:
        spans[owner][0] = min(spans[owner][0], st)
        spans[owner][1] = max(spans[owner][1], en)

out, prev_end = [], 0.0
for b in beats:
    st, en = spans.get(b["i"], [prev_end, prev_end + 0.4])
    st = max(st, prev_end)
    en = max(en, st + 0.20)
    out.append((st, en)); prev_end = en

last_end = out[-1][1]
timing = {
    "fps": FPS,
    "source": AUDIO_REL,
    "durationSeconds": round(last_end, 3),
    "totalFrames": int(math.ceil(last_end * FPS)) + TAIL,
    "beats": [],
}
for b, (st, en) in zip(beats, out):
    timing["beats"].append({
        "i": b["i"], "text": b["text"], "tts": b["text"],
        "section": b["section"], "sectionIndex": b["sectionIndex"], "words": b["words"],
        "start": round(st, 3), "end": round(en, 3), "dur": round(en - st, 3),
        "gapAfter": 0.0,
        "startFrame": int(round(st * FPS)), "endFrame": int(round(en * FPS)),
    })
for i in range(len(timing["beats"]) - 1):
    timing["beats"][i]["gapAfter"] = round(
        timing["beats"][i + 1]["start"] - timing["beats"][i]["end"], 3)

mm = lambda x: f"{int(x // 60)}:{x % 60:05.2f}"
if weak:
    print(f"\n{len(weak)} beats matched under 60% — check the wording against the recording:")
    for b in weak:
        print(f"  beat {b['i']:>2} ({b['matchRate']*100:.0f}%)  {b['text'][:78]}")
if "--dry" in sys.argv:
    print(f"\n[dry run] film would be {mm(last_end)}  ({timing['totalFrames']} frames)")
    sys.exit(0)
json.dump(timing, open(OUT, "w"), indent=1)
print(f"\nfilm: {mm(last_end)}  ({timing['totalFrames']} frames @ {FPS}fps)  -> {OUT}")
last_sec = None
for t in timing["beats"]:
    if t["section"] != last_sec:
        print(f"  {mm(t['start']):>8}  {t['section']}")
        last_sec = t["section"]
