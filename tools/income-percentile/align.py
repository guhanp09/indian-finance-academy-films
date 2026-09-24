"""
Word-level cue frames for the income percentile film.

Every statistic in this film has to finish its roll on the exact frame the
narrator finishes saying it, so beat-level timing is not enough. This runs ASR
with word timestamps over the narration, aligns that word stream against the
known script by DP over normalised tokens, and writes the landing frame of each
named cue to src/income-percentile/cues.json.

  usage:  .venv-asr/bin/python tools/income-percentile/align.py [--asr]
          --asr  re-run transcription (otherwise reuse .align-income-percentile/words.json)
"""
import json, re, os, sys, subprocess, difflib

FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK = os.path.join(ROOT, ".align-income-percentile")
AUDIO = os.path.join(ROOT, "public/Audio/income-percentile-vo.mp3")
TIMING = os.path.join(ROOT, "src/income-percentile/timing.json")
OUT = os.path.join(ROOT, "src/income-percentile/cues.json")

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()

def n2w(n):
    n = int(n)
    if n < 20: return [ONES[n]]
    if n < 100:
        o = [TENS[n // 10]]
        return o + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000:
        return [ONES[n // 100], "hundred"] + (n2w(n % 100) if n % 100 else [])
    if n < 1000000:
        return n2w(n // 1000) + ["thousand"] + (n2w(n % 1000) if n % 1000 else [])
    return n2w(n // 1000000) + ["million"] + (n2w(n % 1000000) if n % 1000000 else [])

def tokenise(text):
    """text -> flat token list, numbers spelled out so both sides compare."""
    t = text.lower().replace("’", "'").replace("—", " ")
    t = t.replace("%", " percent ").replace("$", " ").replace("₹", " ")
    t = re.sub(r"(\d),(\d)", r"\1\2", t)
    out = []
    for w in re.findall(r"[a-z']+|\d+", t):
        if w.isdigit(): out.extend(n2w(w))
        else: out.append(w)
    return out

# ---------------------------------------------------------------- transcribe
os.makedirs(WORK, exist_ok=True)
wpath = os.path.join(WORK, "vo-words.json")
if "--asr" in sys.argv or not os.path.exists(wpath):
    wav = os.path.join(WORK, "narr16k.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", AUDIO,
                    "-ac", "1", "-ar", "16000", wav], check=True)
    import mlx_whisper
    r = mlx_whisper.transcribe(wav, path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                               word_timestamps=True, language="en", condition_on_previous_text=False)
    words = [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)}
             for seg in r["segments"] for w in seg.get("words", [])]
    json.dump(words, open(wpath, "w"))
    print("ASR words:", len(words))
asr = json.load(open(wpath))

# expand each ASR word into tokens, splitting its span evenly across them
atok, atime = [], []
for w in asr:
    ts = tokenise(w["w"]) or [""]
    span = (w["e"] - w["s"]) / len(ts)
    for k, t in enumerate(ts):
        atok.append(t)
        atime.append((w["s"] + k * span, w["s"] + (k + 1) * span))

# ----------------------------------------------------------------- script side
timing = json.load(open(TIMING))
beats = timing["beats"]
stok, sowner = [], []                      # token -> (beat index, position in beat)
for b in beats:
    for j, t in enumerate(tokenise(b["tts"])):
        stok.append(t); sowner.append((b["i"], j))

# ----------------------------------------------------------------------- align
sm = difflib.SequenceMatcher(None, stok, atok, autojunk=False)
stime = [None] * len(stok)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1):
            stime[i1 + k] = atime[j1 + k]
    else:
        # unmatched run: spread the corresponding ASR span evenly over it
        if i2 > i1:
            lo = atime[j1][0] if j1 < len(atime) else atime[-1][1]
            hi = atime[j2 - 1][1] if j2 > j1 else lo
            n = i2 - i1
            for k in range(n):
                stime[i1 + k] = (lo + (hi - lo) * k / n, lo + (hi - lo) * (k + 1) / n)

# any token the aligner could not place falls back to its beat's own span
per_beat = {}
for idx, (bi, j) in enumerate(sowner):
    per_beat.setdefault(bi, []).append(idx)
for bi, idxs in per_beat.items():
    b = beats[bi]
    for k, idx in enumerate(idxs):
        if stime[idx] is None:
            n = len(idxs)
            stime[idx] = (b["start"] + (b["end"] - b["start"]) * k / n,
                          b["start"] + (b["end"] - b["start"]) * (k + 1) / n)
    # keep every token inside its own beat — ASR drift must never leak across
    for idx in idxs:
        s, e = stime[idx]
        stime[idx] = (min(max(s, b["start"]), b["end"]), min(max(e, b["start"]), b["end"]))

# ------------------------------------------------------------------- the cues
CUES = [
    # India: salary lands first, rank second
    ("in.12k",          0, ["twelve", "thousand"]),
    ("in.50",           0, ["half"]),
    ("in.32k",          1, ["thirty", "two", "thousand"]),
    ("in.t10",          1, ["top", "ten", "percent"]),
    ("in.75k",          2, ["seventy", "five", "thousand"]),
    ("in.t1",           2, ["top", "one", "percent"]),
    ("pivot.mislead",   3, ["misleading"]),
    # US: rank lands first, salary second
    ("us.50",           5, ["half"]),
    ("us.4400",         5, ["four", "thousand", "four", "hundred"]),
    ("us.90",           6, ["ninety", "percent"]),
    ("us.12900",        6, ["twelve", "thousand", "nine", "hundred"]),
    ("us.99",           7, ["ninety", "nine", "percent"]),
    ("us.37500",        7, ["thirty", "seven", "thousand", "five", "hundred"]),
    # the lifestyle basket
    ("life.usa",        9, ["usa"]),
    ("life.rent",       10, ["rent"]),
    ("life.food",       10, ["food"]),
    ("life.util",       10, ["utilities"]),
    ("life.tran",       10, ["transport"]),
    ("life.leis",       10, ["leisure"]),
    # US money states
    ("us.cost",         11, ["two", "thousand", "five", "hundred", "eighty"]),
    ("us.left.med",     12, ["one", "thousand", "eight", "hundred", "twenty"]),
    ("us.tax",          13, ["taxes"]),
    ("us.left.tax",     13, ["one", "thousand", "one", "hundred"]),
    ("us.left.t10",     14, ["seven", "thousand", "two", "hundred"]),
    ("us.left.t1",      15, ["twenty", "three", "thousand", "two", "hundred"]),
    # India money states
    ("in.cost",         16, ["thirty", "five", "thousand", "four", "hundred"]),
    ("in.short.med",    17, ["twenty", "three", "thousand", "four", "hundred"]),
    ("in.even.t10",     18, ["even"]),
    ("in.short.t10",    18, ["three", "thousand", "four", "hundred"]),
    ("in.only.t1",      19, ["only"]),
    ("in.left.t1",      19, ["thirty", "nine", "thousand", "six", "hundred"]),

    # ---- the question the second half answers ----
    ("q.us",            20, ["below"]),
    ("q.in",            21, ["above"]),
    ("q.why",           22, ["exist"]),

    # ---- a price, taken apart: the five examples are named up front ----
    ("apart.go",        23, ["constitutes"]),
    ("apart.hair",      24, ["haircut"]),
    ("apart.phone",     24, ["phone"]),
    ("apart.food",      24, ["food"]),
    ("apart.tran",      24, ["transport"]),
    ("apart.rent",      24, ["rent"]),
    ("apart.local",     24, ["local", "inputs"]),
    ("apart.global",    24, ["global", "inputs"]),
    ("apart.wider",     24, ["wider", "market"]),

    # ---- the two ends of the spectrum ----
    ("hair.in",         25, ["haircut"]),
    ("hair.local",      25, ["local", "labour"]),
    ("hair.extreme",    25, ["one", "extreme"]),
    ("hair.21x",        26, ["twenty", "one", "times"]),
    ("phone.in",        27, ["phone"]),
    ("phone.extreme",   27, ["other", "extreme"]),
    ("phone.chain",     28, ["global", "supply", "chains"]),
    ("phone.same",      28, ["necessarily"]),

    # ---- everything in between ----
    ("mid.between",     29, ["between"]),
    ("mid.food",        30, ["food"]),
    ("mid.tran",        31, ["transport"]),
    ("mid.rent",        32, ["rent"]),
    ("mid.land",        33, ["located", "land"]),

    # ---- the basket, and the wage beside it ----
    ("basket.together", 34, ["together"]),
    ("basket.6x",       34, ["six", "times"]),
    ("basket.inIndia",  34, ["in", "india"]),
    ("basket.inUS",     34, ["in", "america"]),
    ("basket.if6",      35, ["six", "times", "lower"]),
    ("basket.31x",      36, ["thirty", "one", "times"]),
    ("basket.prices",   37, ["indian", "prices"]),
    ("basket.dispro",   37, ["disproportionately"]),

    # ---- productivity ----
    ("prod.q",          38, ["place"]),
    ("prod.word",       39, ["productivity"]),
    ("prod.27x",        40, ["twenty", "seven", "times"]),
    ("prod.pay",        41, ["pay"]),
    ("prod.value",      41, ["value"]),
    ("prod.cap",        41, ["produce"]),

    # ---- the sector theory, granted then tested ----
    ("sect.q",          42, ["value"]),
    ("sect.half",       43, ["nearly", "half"]),
    ("sect.agri",       43, ["agriculture"]),
    ("sect.us",         43, ["not", "the", "case"]),
    ("sect.scrutiny",   44, ["scrutiny"]),
    ("sect.move",       45, ["service", "industry"]),
    ("sect.17x",        45, ["one", "seven", "times"]),
    ("sect.subst",      47, ["substantial"]),
    ("hyp.17",          48, ["one", "seven"]),
    ("hyp.2x",          48, ["two", "times"]),
    ("hyp.blame",       48, ["blame"]),
    ("sect.27x",        49, ["twenty", "seven", "fold"]),
    ("sect.no",         50, ["main", "reason"]),

    # ---- inside the sectors ----
    ("ins.claim",       51, ["inside"]),
    ("ins.34x",         52, ["thirty", "four", "times"]),
    ("ins.23x",         53, ["twenty", "three", "times"]),
    ("ins.14x",         53, ["fourteen", "times"]),
    ("ins.remain",      54, ["remain"]),
    # beat 54 is the hinge: the half we have just ruled out, then the half we
    # are about to spend the rest of the film on
    ("ins.kind",        55, ["kind", "of", "work"]),
    ("ins.kindwork",    55, ["the", "kind", "of", "work", "people", "do"]),
    ("ins.peopledo",    55, ["people", "do"]),
    ("ins.itsalso",     55, ["also", "about"]),
    ("ins.disposal",    55, ["disposal"]),

    # ---- what each worker has behind them ----
    # the hinge frame has said everything it has to say by the end of beat 54,
    # so the handover is cued off the subject of the next sentence rather than
    # off its first named item, which is four seconds later
    ("cap.amer",        56, ["american", "workers"]),
    ("cap.farmore",     56, ["far", "more"]),
    # beat 55 enumerates five things; each icon lands on its own word
    ("cap.word",        56, ["capital"]),
    ("cap.mach",        56, ["machinery"]),
    ("cap.tech",        56, ["technology"]),
    ("cap.infra",       56, ["infrastructure"]),
    ("cap.org",         56, ["organizational"]),
    ("cap.hour",        56, ["hour"]),
    ("cap.farm",        57, ["farmer"]),
    ("cap.fact",        58, ["factory"]),
    ("cap.serv",        59, ["service", "worker"]),
    ("cap.concl",       60, ["within"]),

    # ---- back to the meter ----
    ("back.in",         61, ["back"]),
    ("back.basket",     62, ["cost", "basket"]),
    ("back.6x",         62, ["six", "times"]),
    ("back.wage",       62, ["indian", "wage"]),
    ("back.31x",        63, ["thirty", "one", "times"]),
    ("back.sixfold",    64, ["six", "fold"]),
    ("back.31fold",     64, ["thirty", "one", "fold"]),
    ("back.fell",       64, ["wages", "fell"]),
    ("back.meter",      65, ["meter"]),

    # ---- the close ----
    ("end.t10",         66, ["ten", "percent"]),
    ("end.floor",       66, ["floor"]),
    ("end.rank",        68, ["rank"]),
    ("end.gap",         69, ["gap"]),
    ("end.income",      69, ["your", "income"]),
    ("end.cost",        69, ["the", "cost"]),
]

def find(bi, phrase):
    idxs = per_beat.get(bi, [])
    toks = [stok[i] for i in idxs]
    n = len(phrase)
    for p in range(len(toks) - n + 1):
        if toks[p:p + n] == phrase:
            return idxs[p], idxs[p + n - 1]
    return None

cues, missing = {}, []
for name, bi, phrase in CUES:
    hit = find(bi, phrase)
    if not hit:
        missing.append((name, bi, " ".join(phrase))); continue
    i0, i1 = hit
    cues[name] = {
        "beat": bi,
        "startFrame": int(round(stime[i0][0] * FPS)),
        "frame": int(round(stime[i1][1] * FPS)),      # lands when the word ends
        "words": " ".join(phrase),
    }

json.dump({"fps": FPS, "cues": cues}, open(OUT, "w"), indent=1)
print(f"\n{len(cues)} cues -> src/income-percentile/cues.json")
for name, bi, ph in missing:
    print(f"  MISSING  {name}  beat {bi}  '{ph}'")
for k, v in cues.items():
    print(f"  {k:<14} beat {v['beat']:>2}  f{v['startFrame']:>5}->{v['frame']:<5}  {v['words']}")
