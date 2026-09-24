/* One source of truth for timing: the sound designer reads the same beat map the animation does.
   Run after any change to the beat map or the narration. */
import fs from 'fs';
import { BEATS, CUE, DURATION, NARR } from '../../src/upi-scam/timeline';
fs.writeFileSync('src/upi-scam/cues.gen.json', JSON.stringify({
  duration: NARR.duration, durationInFrames: DURATION,
  cue: CUE, beats: BEATS.map((b) => ({ n: b.n, phase: b.phase, t: b.t, on: b.on })),
  words: NARR.words,
}, null, 1));
console.log('cues ->', BEATS.length, 'beats,', NARR.duration.toFixed(3) + 's');
