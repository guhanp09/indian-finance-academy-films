// Scratch narration (macOS `say`) + master timing map for the film.
// Same beat->frame contract as the other films, but with the tighter gap
// structure this film needs. Word-level cue frames are derived separately by
// tools/income-percentile/align.py from forced alignment.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

const ROOT = path.resolve('.');
const SCRIPT = 'docs/income-percentile/script.md';
const TIMING_OUT = 'src/income-percentile/timing.json';
const AUDIO_REL = 'Audio/income-percentile-scratch.mp3';
const CACHE = path.join(ROOT, '.tts-income-percentile');
const FPS = 30;
const TARGET_WPM = Number(process.argv[2] ?? 156);
const LEAD_IN = 0.7;
const VOICE = process.env.TTS_VOICE ?? 'Rishi';
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'src/income-percentile'), { recursive: true });

const sh = (c, a) => execFileSync(c, a, { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = (f) => Number(sh('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString().trim());

const raw = fs.readFileSync(path.join(ROOT, SCRIPT), 'utf8');
const beats = [];
let section = 'OPEN', sectionIndex = -1;
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('# ')) continue;
  if (t.startsWith('## ')) { section = t.slice(3).trim(); sectionIndex++; continue; }
  const clean = t.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  beats.push({
    i: beats.length, text: clean, section, sectionIndex: Math.max(sectionIndex, 0),
    words: clean.split(/\s+/).length, tts: toSpeech(clean),
  });
}

function toSpeech(s) {
  return s
    .replace(/₹\s*([\d.,]+)/g, '$1 rupees')
    .replace(/\$\s*([\d.,]+)/g, '$1 dollars')
    .replace(/top-(\d+)%/gi, 'top $1 percent')
    .replace(/(\d)%/g, '$1 percent')
    .replace(/cost-of-living/gi, 'cost of living')
    .replace(/one-bedroom/gi, 'one bedroom')
    .replace(/low-productivity/gi, 'low productivity')
    .replace(/\bUS\b/g, 'U S')
    .replace(/—/g, ',')
    .replace(/\s+/g, ' ').trim();
}

/* gaps: tight editorial rhythm, with air only where an idea has to land */
beats.forEach((b, i) => {
  const next = beats[i + 1];
  let g = 0.30;
  if (b.words <= 5) g = 0.40;
  if (/\?$/.test(b.text)) g = 0.62;              // "And at roughly ₹75,000?"
  if (next && next.sectionIndex !== b.sectionIndex) g = 0.72;
  if (!next) g = 2.0;
  b.gapAfter = g;
});

console.log(`synthesising ${beats.length} beats (voice ${VOICE})…`);
beats.forEach((b) => {
  const h = crypto.createHash('md5').update(`${VOICE}|${b.tts}`).digest('hex').slice(0, 12);
  b.rawFile = path.join(CACHE, `raw_${h}.wav`);
  if (!fs.existsSync(b.rawFile)) {
    const aiff = path.join(CACHE, `t_${h}.aiff`);
    sh('say', ['-v', VOICE, '-o', aiff, b.tts]);
    sh('ffmpeg', ['-y','-i',aiff,'-ac','1','-ar','48000','-af',
      'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse',
      b.rawFile]);
    fs.unlinkSync(aiff);
  }
  b.rawDur = dur(b.rawFile);
  // a raw clip far shorter than its word count means `say` was interrupted
  // mid-synthesis and left a truncated file in the cache; redo it once.
  if (b.rawDur < b.words * 0.13) {
    console.log(`  re-synthesising truncated beat ${b.i} (${b.rawDur.toFixed(2)}s for ${b.words} words)`);
    fs.unlinkSync(b.rawFile);
    const aiff = path.join(CACHE, `t_fix_${b.i}.aiff`);
    sh('say', ['-v', VOICE, '-o', aiff, b.tts]);
    sh('ffmpeg', ['-y','-i',aiff,'-ac','1','-ar','48000','-af',
      'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse',
      b.rawFile]);
    fs.unlinkSync(aiff);
    b.rawDur = dur(b.rawFile);
    if (b.rawDur < b.words * 0.13) throw new Error(`beat ${b.i} still truncated: ${b.rawDur}s`);
  }
});

const totalWords = beats.reduce((a, b) => a + b.words, 0);
const totalSpeech = beats.reduce((a, b) => a + b.rawDur, 0);
const rawWpm = (totalWords / totalSpeech) * 60;
const tempo = TARGET_WPM / rawWpm;   // atempo > 1 plays faster
console.log(`raw ${rawWpm.toFixed(1)} wpm -> atempo ${tempo.toFixed(4)} -> ${(rawWpm*tempo).toFixed(1)} wpm`);

for (const b of beats) {
  const out = b.rawFile.replace('raw_', `s${tempo.toFixed(4)}_`);
  if (!fs.existsSync(out)) sh('ffmpeg', ['-y','-i',b.rawFile,'-af',`atempo=${tempo.toFixed(4)}`,out]);
  b.file = out; b.dur = dur(out);
}

const sil = (s) => {
  const f = path.join(CACHE, `sil_${s.toFixed(3)}.wav`);
  if (!fs.existsSync(f)) sh('ffmpeg', ['-y','-f','lavfi','-i','anullsrc=r=48000:cl=mono','-t',s.toFixed(3),f]);
  return f;
};
const parts = [`file '${sil(LEAD_IN)}'`];
let t = LEAD_IN;
for (const b of beats) {
  b.start = t; b.end = t + b.dur; t = b.end + b.gapAfter;
  parts.push(`file '${b.file}'`, `file '${sil(b.gapAfter)}'`);
}
fs.writeFileSync(path.join(CACHE, 'concat.txt'), parts.join('\n'));
const wav = path.join(CACHE, 'narration.wav');
sh('ffmpeg', ['-y','-f','concat','-safe','0','-i',path.join(CACHE,'concat.txt'),'-c','copy',wav]);
fs.mkdirSync(path.join(ROOT, 'public/Audio'), { recursive: true });
sh('ffmpeg', ['-y','-i',wav,'-codec:a','libmp3lame','-b:a','160k', path.join(ROOT,'public',AUDIO_REL)]);

const total = dur(wav);
const timing = {
  fps: FPS, source: `public/${AUDIO_REL}`, wpm: TARGET_WPM,
  durationSeconds: +total.toFixed(3), totalFrames: Math.ceil(total * FPS) + 30,
  beats: beats.map((b) => ({
    i: b.i, text: b.text, tts: b.tts, section: b.section, sectionIndex: b.sectionIndex, words: b.words,
    start: +b.start.toFixed(3), end: +b.end.toFixed(3), dur: +b.dur.toFixed(3), gapAfter: b.gapAfter,
    startFrame: Math.round(b.start * FPS), endFrame: Math.round(b.end * FPS),
  })),
};
fs.writeFileSync(path.join(ROOT, TIMING_OUT), JSON.stringify(timing, null, 1));
const mm = (x) => `${Math.floor(x/60)}:${String(Math.floor(x%60)).padStart(2,'0')}`;
console.log(`\n${beats.length} beats · ${mm(total)} · ${timing.totalFrames} frames`);
