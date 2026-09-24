/* Caption paging for this film — one copy, imported by both the renderer and the script dump, so
   what a recording script says the lines are cannot drift from what the film puts on screen.
 *
 * Sentence splitting, comma/clause breaks and the 5.2s cap come from the shared module
 * (src/shared/caption-sentences.mjs), on purpose: this film uses the channel's caption
 * treatment, not an approximation of it. What
 * lives here is the one thing that script does not handle — see splitStillLong. */
import { buildCaptionPages } from '../shared/caption-sentences.mjs';

export const MAX_PAGE_MS = 5600;
/* 180ms was too coarse for a recorded read. On "The scammer will send you a UPI request disguised
   to look like an incoming payment." the only gaps that cleared it were after "a" (190ms) and after
   "UPI" (187ms), so the page broke as "…send you a UPI" / "request disguised…" — splitting a noun
   from its modifier, which is the very failure the note above warns about. At 85ms the break after
   "request" (91ms) becomes a candidate, and the balance score prefers it: halves of 3.24s / 2.62s
   against 2.43s / 3.26s. The scoring already rejects lopsided splits, so the lower floor only adds
   options; it does not make worse ones win. */
export const MIN_GAP_MS = 85;
export const MIN_HALF_MS = 2000;

const makePage = (tk) => ({
  startMs: tk[0].fromMs, endMs: tk[tk.length - 1].toMs, tokens: tk,
  text: tk.map((x) => x.text).join('').trimStart(),
});

export function splitStillLong(page) {
  /* The em dash is the only grammatical break in sentence 1, and the shared module does not look
     for one — it looks for commas and clause starts. Left alone, that sentence came back as a
     single 8.5-second page; split on a pause instead, it came back broken across "a UPI |
     request". So the dash is taken first, wherever it appears, and the duration rule only runs
     on what is left. */
  const dash = page.tokens.findIndex((tk) => tk.text.trim() === '—');
  if (dash > 0 && dash < page.tokens.length - 1) {
    return [makePage(page.tokens.slice(0, dash + 1)), makePage(page.tokens.slice(dash + 1))]
      .flatMap(splitStillLong);
  }
  if (page.endMs - page.startMs <= MAX_PAGE_MS || page.tokens.length < 6) return [page];
  /* otherwise: the most BALANCED real pause, not the largest — the largest is often a tiny gap
     near one end, which halves the page into a stub and a wall */
  let best = -1, bestScore = Infinity;
  for (let i = 1; i < page.tokens.length - 1; i++) {
    const gap = page.tokens[i].fromMs - page.tokens[i - 1].toMs;
    if (gap < MIN_GAP_MS) continue;
    const left = page.tokens[i - 1].toMs - page.startMs;
    const right = page.endMs - page.tokens[i].fromMs;
    if (left < MIN_HALF_MS || right < MIN_HALF_MS) continue;
    const score = Math.abs(left - right);
    if (score < bestScore) { bestScore = score; best = i; }
  }
  if (best < 0) return [page];
  return [makePage(page.tokens.slice(0, best)), makePage(page.tokens.slice(best))]
    .flatMap(splitStillLong);
}

/** measured words -> the caption objects the treatment expects. An em dash is welded to the word
    before it — a lone "—" on a caption line reads as a mistake. */
export const captionsFromWords = (words) => words.map((w, i) => ({
  text: w.w === '\u2014' ? '\u00A0\u2014' : (i === 0 ? '' : ' ') + w.w,
  startMs: w.s * 1000, endMs: w.e * 1000, timestampMs: w.s * 1000, confidence: 1,
}));

/** the pages the film actually draws */
export const captionPages = (captions) => buildCaptionPages(captions).flatMap(splitStillLong);
