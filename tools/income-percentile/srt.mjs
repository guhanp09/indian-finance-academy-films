// Writes output/<film>.srt from src/<film>/timing.json.
//
//   node tools/income-percentile/srt.mjs                      → the income percentile film
//   node tools/income-percentile/srt.mjs <film>               → src/<film>/timing.json
//
// The cues sit on exactly the beats the scenes animate against, which means a
// subtitle appearing is the same instant a visual event is cued.
//
// Narration text is never altered. Long beats are split into readable cues at
// clause boundaries.
//
// Where a forced alignment of the recording exists (.align-<film>/vo-words.json)
// each cue is timed from the actual words: it appears on the first frame of its
// own first word and clears on the last frame of its last word. Otherwise the
// split is timed by word position through the beat, which is close but drifts —
// on beat 0 of the income percentile film the proportional cut fell 0.25s into the pause after
// "in India,", so the line hung around after the clause had finished.
import fs from 'fs';
import path from 'path';

const FILM = (process.argv[2] ?? 'income-percentile').replace(/[^a-z0-9-]/gi, '');
const ROOT = path.resolve(process.argv[3] ?? '.');
const MAX_CHARS = 84;   // per cue, across at most two lines
/* 45, not 44: "A factory worker in a larger, better-equipped plant can produce
   far more goods." is inside the cue limit but has no break anywhere in it that
   leaves both lines under 44, and the best available split is 45/33. Still well
   under the ~50 a YouTube player renders without shrinking the text. */
const LINE = 45;        // wrap width
const MIN_CUE = 0.9;    // seconds
const CPS = 21;         // characters per second a cue is given time to be read

const src = path.join(ROOT, `src/${FILM}/timing.json`);
if (!fs.existsSync(src)) {
  console.error(`no timing at ${src}`);
  process.exit(1);
}
const t = JSON.parse(fs.readFileSync(src, 'utf8'));

const clock = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0');
  const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, '0')}`;
};

/**
 * Break a long beat into readable cues.
 *
 * Cuts are placed near the even division of the text rather than as late as
 * they will fit, so a beat never ends on a three-word orphan; and a clause
 * boundary wins over a word boundary whenever taking it still leaves every
 * remaining piece inside the cue limit, so "…in India, / you're already…"
 * beats "…roughly half / of Indian workers."
 */
function split(text) {
  if (text.length <= MAX_CHARS) return [text];
  const out = [];
  let rest = text;
  while (rest.length > MAX_CHARS) {
    const k = Math.ceil(rest.length / MAX_CHARS);
    const want = rest.length / k;
    const win = rest.slice(0, MAX_CHARS + 1);
    /* a word break must not force an extra cue; a clause break may, because a
       comma-separated list reads far better broken on its own commas */
    const fitsWord = (cut) => rest.length - cut - 1 <= (k - 1) * MAX_CHARS;
    const fitsClause = (cut) => rest.length - cut - 1 <= k * MAX_CHARS;

    let cut = -1, best = Infinity;
    for (const mark of ['; ', ' — ', ', ', ': ']) {
      for (let i = win.indexOf(mark); i >= 0; i = win.indexOf(mark, i + 1)) {
        const end = i + mark.length - 1;
        const d = Math.abs(end - want);
        if (end >= 12 && end >= want * 0.45 && fitsClause(end) && d < best) { best = d; cut = end; }
      }
    }
    if (cut < 0) {
      for (let i = win.indexOf(' '); i >= 0; i = win.indexOf(' ', i + 1)) {
        const d = Math.abs(i - want);
        if (i >= 12 && fitsWord(i) && d < best) { best = d; cut = i; }
      }
    }
    if (cut < 0) cut = Math.min(MAX_CHARS, rest.length - 1);

    out.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}

/**
 * Wrap one cue onto at most two lines, balanced.
 *
 * Filling the first line to the brim and letting the rest fall onto the second
 * put 49 characters on the lower line of "A factory worker in a larger, /
 * better-equipped plant can produce far more goods." — a bottom-heavy cue that
 * runs past the limit. The break is now chosen to make the longer of the two
 * lines as short as possible, and a break that follows punctuation wins ties,
 * because a line that ends on a clause is easier to read than one that ends
 * wherever the measure ran out.
 */
function wrap(s) {
  if (s.length <= LINE) return s;
  const words = s.split(' ');
  let best = null;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(' ');
    const b = words.slice(k).join(' ');
    const longest = Math.max(a.length, b.length);
    /* a top line no longer than the bottom reads better, and a clause break
       better still — both are worth one character of imbalance */
    const score = longest + (a.length <= b.length ? 0 : 1) + (/[,;:—]$/.test(a) ? -1 : 0);
    if (!best || score < best.score) best = { score, text: `${a}\n${b}` };
  }
  return best ? best.text : s;
}

const words = (s) => s.split(/\s+/).filter(Boolean).length;

/* The recording's own word timings, if this film has been force-aligned. Both
   the script and the transcript were written from the same pass, so the two
   agree once punctuation and number formatting are stripped: "₹12,000" and the
   transcript's "12" + ",000" are both "12000". */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
let VO = null;
for (const c of [`.align-${FILM}/vo-words.json`, `.align-${FILM}/words.json`]) {
  const f = path.join(ROOT, c);
  if (fs.existsSync(f)) { VO = JSON.parse(fs.readFileSync(f, 'utf8')); break; }
}

/**
 * Time each part of a beat from the words actually spoken in it.
 *
 * A word belongs to a beat when it is *contained* by it. Testing for overlap
 * instead pulled the first word of the next line into this one — the beats abut
 * that closely — and half the film fell back to arithmetic for no reason.
 *
 * Boundaries are then placed by character fraction rather than by matching the
 * two texts letter for letter: the script is edited after transcription (the
 * recording says "center", the script prints "centre") and an exact match would
 * throw away a good span over one letter. A fraction lands inside the right
 * word, and the word's own start and end times are what the cue actually uses,
 * so the cue still begins and ends on a real word boundary.
 */
function timeByWord(b, parts) {
  if (!VO) return null;
  const span = VO.filter((x) => x.s >= b.start - 0.02 && x.e <= b.end + 0.02);
  if (span.length < parts.length) return null;
  const len = span.map((x) => norm(x.w).length);
  const spanChars = len.reduce((a, c) => a + c, 0);
  const parted = parts.map((p) => norm(p).length);
  const scriptChars = parted.reduce((a, c) => a + c, 0);
  if (!spanChars || !scriptChars) return null;
  /* the transcript of this beat has to be this beat, give or take the odd
     respelling — 12% is a whole short word out of a short line */
  if (Math.abs(spanChars - scriptChars) > Math.max(6, scriptChars * 0.12)) return null;

  /** which word holds the character at this fraction through the beat */
  const wordAt = (frac) => {
    const target = frac * spanChars;
    let acc = 0;
    for (let i = 0; i < len.length; i++) { acc += len[i]; if (acc > target) return i; }
    return len.length - 1;
  };

  /* Only each part's FIRST word is located; a part then runs to the word before
     the next part begins. Locating both ends independently let a boundary that
     fell inside a single word hand that word to both parts, and the cue times
     ran backwards. */
  const starts = [];
  let acc = 0;
  for (let i = 0; i < parted.length; i++) {
    const want = wordAt(acc / scriptChars);
    const at = i === 0 ? 0 : Math.max(want, starts[i - 1] + 1);
    if (at > span.length - 1) return null;
    starts.push(at);
    acc += parted[i];
  }

  const out = starts.map((a, i) => ({
    from: span[a].s,
    to: span[i === starts.length - 1 ? span.length - 1 : starts[i + 1] - 1].e,
  }));
  return out;
}

const cues = [];
let byWord = 0;
for (const b of t.beats) {
  const parts = split(b.text);
  const timed = timeByWord(b, parts);
  if (timed) byWord++;
  const total = words(b.text) || 1;
  let acc = 0;
  parts.forEach((p, i) => {
    let from, to;
    if (timed) { from = timed[i].from; to = timed[i].to; } else {
      const w = words(p);
      from = b.start + (b.dur * acc) / total;
      acc += w;
      to = b.start + (b.dur * acc) / total;
    }
    cues.push({ from, to: Math.max(to, from + MIN_CUE), text: wrap(p), last: i === parts.length - 1, beat: b.i });
  });
}

/* Let a cue linger into the silence after it, but never over the next one. A
   line the speaker rushes needs longer on screen than it took to say, so the
   hold is whichever is greater: the pause that follows, or the time it takes to
   read at CPS — capped, always, at the frame before the next cue appears. */
for (let i = 0; i < cues.length; i++) {
  const c = cues[i];
  const next = cues[i + 1];
  const readable = c.from + Math.max(MIN_CUE, c.text.replace(/\n/g, ' ').length / CPS);
  if (!next) { c.to = Math.max(c.to + 1.2, readable); continue; }
  const ceiling = next.from - 0.05;
  c.to = Math.min(ceiling, Math.max(c.to + (c.last ? 0.9 : 0.12), readable));
  if (c.to < c.from + 0.3) c.to = Math.min(next.from - 0.02, c.from + 0.3);
}

const srt = cues
  .map((c, i) => `${i + 1}\n${clock(c.from)} --> ${clock(c.to)}\n${c.text}\n`)
  .join('\n');

const out = path.join(ROOT, `output/${FILM}.srt`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, srt);

/* WebVTT as well: YouTube takes either, and .vtt is what every browser player
   and every editing tool wants. Same cues, same text, different clock. */
fs.writeFileSync(path.join(ROOT, `output/${FILM}.vtt`), `WEBVTT\n\n${cues
  .map((c, i) => `${i + 1}\n${clock(c.from).replace(',', '.')} --> ${clock(c.to).replace(',', '.')}\n${c.text}\n`)
  .join('\n')}`);

console.log(`output/${FILM}.srt + .vtt  —  ${cues.length} cues from ${t.beats.length} beats`);
console.log(`${byWord}/${t.beats.length} beats timed from the recording's own words` +
  (byWord < t.beats.length ? `, ${t.beats.length - byWord} from word position` : ''));
console.log(`runs ${clock(cues[0].from)} -> ${clock(cues[cues.length - 1].to)}`);
{
  let overlap = 0, tooFast = 0, tooLong = 0, longest = 0;
  cues.forEach((c, i) => {
    if (cues[i + 1] && c.to > cues[i + 1].from) overlap++;
    const n = c.text.replace(/\n/g, ' ').length;
    if (n / (c.to - c.from) > 24) tooFast++;
    if (n > MAX_CHARS) tooLong++;
    longest = Math.max(longest, n);
    for (const line of c.text.split('\n')) if (line.length > LINE) tooLong++;
  });
  console.log(`  ${overlap} overlaps · ${tooFast} cues above 24 chars/s · ${tooLong} over the line limit · longest cue ${longest} chars`);
}
if (t.title) {
  console.log(`title card holds in silence at ${clock(t.title.startFrame / t.fps)} (no cue, by design)`);
}
