"""Word-level transcript of a human voice-over.

The recording, not the written script, is the authority on what is said and
when — so this transcribes it in full and keeps every word's own start and end.
`tools/income-percentile/retime.py` then aligns the script against this stream and rebuilds
the beat -> frame map from it.

Kept in tools/ rather than a scratch directory on purpose: Python puts the
script's own folder first on sys.path, so a stray file next to it (a coverage.py,
say) can shadow a real package and take numba — and with it Whisper's word
timestamps — down with a confusing AttributeError.

  usage:  .venv-asr/bin/python tools/income-percentile/transcribe.py [audio] [outPrefix]
          defaults: public/Audio/income-percentile-vo.mp3  ->  .align-income-percentile/vo
"""
import json, os, subprocess, sys

# mlx_whisper shells out to a bare `ffmpeg` of its own when it loads audio, so
# the tool has to put homebrew on PATH itself rather than trust the caller's
# shell to have done it.
os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:" + os.environ.get("PATH", "")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AUDIO = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else "public/Audio/income-percentile-vo.mp3")
PREFIX = os.path.join(ROOT, sys.argv[2] if len(sys.argv) > 2 else ".align-income-percentile/vo")
os.makedirs(os.path.dirname(PREFIX), exist_ok=True)

wav = PREFIX + "16k.wav"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", AUDIO,
                "-ac", "1", "-ar", "16000", wav], check=True)

import mlx_whisper
r = mlx_whisper.transcribe(wav, path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                           word_timestamps=True, language="en", condition_on_previous_text=False)

words = [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)}
         for seg in r["segments"] for w in seg.get("words", [])]
segs = [{"s": round(s["start"], 2), "e": round(s["end"], 2), "t": s["text"].strip()}
        for s in r["segments"]]
json.dump(words, open(PREFIX + "-words.json", "w"))
json.dump(segs, open(PREFIX + "-segments.json", "w"), indent=1)
print(f"words {len(words)}  segments {len(segs)}  last word ends {words[-1]['e']:.2f}s")
