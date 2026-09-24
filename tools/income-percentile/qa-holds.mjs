// Does the picture ever stop moving while the narration keeps going?
//
// The other gates all audit intent — a duration against a phrase, a start
// against a beat — and every one of them passes a scene that has resolved and
// then sits there. That is the failure a viewer actually feels: the voice is
// still delivering an argument and the frame has become a photograph.
//
// This measures the finished render instead of the source. It samples every
// frame at low resolution, compares each with the one before, and reports every
// run of visually identical frames together with the narration spoken across it.
//
// A held frame is not automatically wrong — a diagram that has just resolved
// should be still while it is discussed. What is wrong is a hold long enough
// that the viewer finishes reading and waits. Treat the output as a list to
// judge, not a pass/fail.
//
//   usage:  node tools/income-percentile/qa-holds.mjs output/income-percentile-preview.mp4 [minSeconds]
import { spawn } from 'child_process';
import fs from 'fs';

const FILE = process.argv[2] ?? 'output/income-percentile-preview.mp4';
const MIN = Number(process.argv[3] ?? 5) * 30;
const W = 160, H = 90, THRESH = 2;

const timing = JSON.parse(fs.readFileSync('src/income-percentile/timing.json', 'utf8'));
const mm = (f) => `${Math.floor(f / 30 / 60)}:${String(((f / 30) % 60).toFixed(2)).padStart(5, '0')}`;
const said = (a, b) => timing.beats
  .filter((x) => x.endFrame > a && x.startFrame < b)
  .map((x) => `[${x.i}] ${x.text}`);

const ff = spawn('ffmpeg', ['-v', 'error', '-i', FILE,
  '-vf', `scale=${W}:${H}:flags=area,format=gray`, '-f', 'rawvideo', '-']);
const frame = W * H;
let buf = Buffer.alloc(0), prev = null, n = 0, runStart = 0;
const runs = [];

ff.stdout.on('data', (d) => {
  buf = buf.length ? Buffer.concat([buf, d]) : d;
  while (buf.length >= frame) {
    const cur = buf.subarray(0, frame);
    buf = buf.subarray(frame);
    if (prev) {
      let moved = 0;
      for (let i = 0; i < frame; i++) if (Math.abs(cur[i] - prev[i]) > THRESH) { moved++; if (moved > 6) break; }
      if (moved > 6) {
        if (n - runStart >= MIN) runs.push([runStart, n - 1]);
        runStart = n;
      }
    }
    prev = Buffer.from(cur);
    n++;
  }
});

ff.on('close', () => {
  if (n - runStart >= MIN) runs.push([runStart, n - 1]);
  const held = runs.reduce((a, [s, e]) => a + (e - s + 1), 0);
  console.log(`— the picture holds still —  ${FILE}, ${n} frames`);
  console.log(`  ${runs.length} runs of ${MIN / 30}s or longer, ${(held / 30).toFixed(1)}s of ${(n / 30).toFixed(1)}s total\n`);
  for (const [s, e] of runs.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))) {
    console.log(`  ${((e - s + 1) / 30).toFixed(1)}s  ${mm(s)} -> ${mm(e)}`);
    for (const line of said(s, e)) console.log(`         ${line.slice(0, 96)}`);
  }
});
