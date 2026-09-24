#!/bin/bash
# Renders the income percentile film in chunks, then muxes the narration back in one piece.
#
# A single 11,129-frame pass hung twice with
#   ProtocolError: Protocol error (Page.bringToFront): Target closed
# — the renderer tab dies, and the parent then sits at 0% CPU waiting for it
# forever rather than failing. Both times another Remotion render was competing
# for the same cores. So: chunks bound each browser's lifetime, and a watchdog
# watches the CPU of each chunk's own process tree and restarts a chunk that
# has gone quiet, instead of letting the whole film stall behind it.
#
# The chunks render muted and the narration is muxed on at the end from the
# original mp3. Concatenating chunks that each carry their own AAC would put a
# join every few thousand frames, and AAC frames do not land on video frame
# boundaries — a few milliseconds of drift per join is exactly what a film cut
# to individual words cannot absorb.
#
#   usage:  tools/income-percentile/render.sh
#           FORCE=1 …               ignore cached chunks
#           ALLOW_CONCURRENT=1 …    proceed while another render is running
#           CHUNK=3000 CONC=4 …     chunk size and per-chunk concurrency
set -e
cd "$(dirname "$0")/../.."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# NB: the bracket keeps this pattern from matching its own command line — a
# plain "remotion render" here matches the search itself and never returns false.
if pgrep -f "[r]emotion render" >/dev/null 2>&1 && [ "$ALLOW_CONCURRENT" != "1" ]; then
  echo "a render is already running (ALLOW_CONCURRENT=1 to go anyway):" >&2
  ps -eo pid,command | grep "[r]emotion render" | cut -c1-100 >&2
  exit 1
fi

# Ask Remotion, not timing.json: timing.json ends where the narration's content
# ends, and the composition runs past that for the channel card. Taking the
# length from the wrong one silently truncates the ending.
TOTAL=$(npx remotion compositions src/income-percentile/index.tsx 2>/dev/null | tr '\r' '\n' | awk '$1=="IncomePercentile"{print $4}')
[ -n "$TOTAL" ] || { echo "could not read the IncomePercentile composition's length" >&2; exit 1; }
CHUNK=${CHUNK:-3000}
CONC=${CONC:-4}
IDLE_LIMIT=${IDLE_LIMIT:-5}          # 30s samples below 1% cpu before we call it hung
TRIES=${TRIES:-3}
OUT=output/income-percentile-preview.mp4
# the recorded narration — the same file timing.json and cues.json are derived
# from, so the mux cannot drift from what the visuals were cut to
AUDIO=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/income-percentile/timing.json','utf8')).source)" | sed 's|^|public/|')
WORK=output/.income-percentile-chunks

# Only ever this render's own processes — another render's browsers come out
# of the same node_modules, so a pattern-based kill would take its film down too.
descendants() { echo "$1"; for c in $(pgrep -P "$1" 2>/dev/null); do descendants "$c"; done; }
kill_tree() { for p in $(descendants "$1" | tac); do kill -9 "$p" 2>/dev/null || true; done; }
tree_cpu() {
  local list; list=$(descendants "$1" | paste -sd, -)
  ps -o pcpu= -p "$list" 2>/dev/null | awk '{s+=$1} END{printf "%.1f", s+0}'
}

render_chunk() {                      # $1 out  $2 start  $3 end
  npx remotion render src/income-percentile/index.tsx IncomePercentile "$1" \
    --frames="$2-$3" --muted --concurrency="$CONC" --log=error &
  local pid=$! idle=0 cpu
  while kill -0 "$pid" 2>/dev/null; do
    sleep 30
    kill -0 "$pid" 2>/dev/null || break
    cpu=$(tree_cpu "$pid")
    if awk "BEGIN{exit !($cpu < 1.0)}"; then idle=$((idle + 1)); else idle=0; fi
    if [ "$idle" -ge "$IDLE_LIMIT" ]; then
      echo "    stalled at ${cpu}% cpu for $((IDLE_LIMIT * 30))s — killing it"
      kill_tree "$pid"; wait "$pid" 2>/dev/null || true; return 1
    fi
  done
  wait "$pid"
}

mkdir -p "$WORK"
# Cached chunks are keyed by index, so they are only valid for the plan that
# produced them: a different CHUNK size would silently reuse c02 for a different
# range of frames. Stamp the plan and throw the cache away if it changed.
# Each chunk is cached against its own frame range rather than one global plan
# stamp, so changing the length of the ending re-renders the last chunk and
# leaves the rest alone.
: > "$WORK/list.txt"
echo "short: $TOTAL frames · chunks of $CHUNK · concurrency $CONC"
i=0; start=0
while [ "$start" -lt "$TOTAL" ]; do
  end=$((start + CHUNK - 1))
  [ "$end" -ge "$TOTAL" ] && end=$((TOTAL - 1))
  f=$(printf "%s/c%02d.mp4" "$WORK" "$i")
  stamp="$WORK/$(printf 'c%02d' "$i").range"
  if [ -f "$f" ] && [ "$(cat "$stamp" 2>/dev/null)" = "$start-$end" ] && [ "$FORCE" != "1" ]; then
    echo "chunk $i ($start-$end) — cached"
  else
    n=1
    until render_chunk "$f" "$start" "$end"; do
      n=$((n + 1))
      [ "$n" -gt "$TRIES" ] && { echo "chunk $i failed $TRIES times" >&2; exit 1; }
      echo "chunk $i ($start-$end) — retry $n/$TRIES"
      rm -f "$f"
    done
    echo "$start-$end" > "$stamp"
    echo "chunk $i ($start-$end) — done $(date '+%H:%M:%S')"
  fi
  echo "file '$(cd "$WORK" && pwd)/$(basename "$f")'" >> "$WORK/list.txt"
  i=$((i + 1)); start=$((end + 1))
done

echo "joining $i chunks and muxing the narration…"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/silent.mp4"
# No -shortest: the film deliberately outlives its narration — the last frames
# hold after the closing line — and -shortest cut 32 frames off the end to make
# the video match the mp3.
ffmpeg -y -loglevel error -i "$WORK/silent.mp4" -i "$AUDIO" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k "$OUT"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
ffprobe -v error -show_entries stream=index,codec_type,width,height,nb_frames -of csv=p=0 "$OUT"
