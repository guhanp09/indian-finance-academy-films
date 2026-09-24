/* The recording data, measured off the narration the film is cut to — not estimated. Prints the
   caption pages the film actually draws (same module Subtitles.tsx uses), every inter-sentence
   gap, and the pace, so a recording direction can quote real numbers. */
import { captionPages, captionsFromWords } from '../../src/upi-scam/caption-pages.mjs';
import N from '../../src/upi-scam/narration.json' with { type: 'json' };

const W = N.words;
const pages = captionPages(captionsFromWords(W));
const s2 = (x) => x.toFixed(2);

console.log(`narration ${s2(N.duration)}s · ${W.length} words · `
  + `${Math.round(W.length / ((W[W.length - 1].e - W[0].s) / 60))} wpm gross\n`);

console.log('CAPTION PAGES (what is on screen)');
pages.forEach((p, i) => console.log(
  `${String(i + 1).padStart(2)}  ${s2(p.startMs / 1000).padStart(5)}–${s2(p.endMs / 1000).padStart(5)}s  `
  + `(${s2((p.endMs - p.startMs) / 1000)}s)  ${p.text.trim()}`));

console.log('\nGAPS between sentences (measured, silence between word ends and next word start)');
const ends = /[.!?]$/;
W.forEach((w, i) => {
  if (i === W.length - 1 || !ends.test(w.w)) return;
  const gap = W[i + 1].s - w.e;
  /* only ONE gap is the designed hold — the one the picture is cut into. Flagging every pause
     over a second as "the hold" was wrong the moment a human read left pauses of their own. */
  console.log(`  after "${w.w}" -> "${W[i + 1].w}"   ${(gap * 1000).toFixed(0)} ms`
    + (w.w === 'account.' ? '   <-- the hold the picture is cut into' : ''));
});

console.log('\nCOMMA / CLAUSE gaps over 250 ms');
W.forEach((w, i) => {
  if (i === W.length - 1 || ends.test(w.w)) return;
  const gap = W[i + 1].s - w.e;
  if (gap >= 0.25) console.log(`  after "${w.w}" -> "${W[i + 1].w}"   ${(gap * 1000).toFixed(0)} ms`);
});

console.log('\nWORDS THE PICTURE IS CUT TO (a beat lands on each)');
const CUES = ['send', 'money', 'approve', 'PIN.', 'enter', 'however,', 'instead', 'paid,',
  'leaves', 'While', 'sellers,', 'anyone', 'basics', 'parents', 'they', 'receiving', 'If',
  'screen', 'PIN,', 'authorising', 'leave'];
CUES.forEach((c) => {
  const i = W.findIndex((w) => w.w === c);
  if (i >= 0) console.log(`  ${s2(W[i].s).padStart(5)}s  ${c}`);
});
