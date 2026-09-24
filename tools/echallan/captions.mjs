/* WHICH EDGE EACH CAPTION PAGE STANDS ON.
 *
 * The captions are bottom-anchored, and for most of this film that is right: the bottom of the
 * frame is ground, plaza, pavement and the phone's lower bezel. But the act 3 rebuild moved the
 * subject down into that band — the courier sits at screen y 1197 and the post office's slot at
 * 1100 — and a caption over the thing the sentence is about is the one thing a caption may never
 * do.
 *
 * THE DECISION IS MEASURED, NOT TYPED. A list of hand-picked times would drift the moment a beat
 * moves; this asks the picture. For every caption page the film is rendered WITHOUT its captions
 * at three points across the page, and each frame is reduced to a map of FOCAL MASS — this film's
 * own definition of a focal point, from v2/style.tsx: "the brightest, most saturated,
 * highest-contrast thing in frame is the subject". Then:
 *
 *     share = (focal mass inside a band) / (total focal mass) / (the band's share of the height)
 *
 * so 1.0 means the band holds exactly its fair share and 2.0 means twice it. A page moves to the
 * top when the bottom band is carrying the picture and the top band is not.
 *
 *   node tools/echallan/captions.mjs            measure and write src/echallan/caption-side.json
 *   node tools/echallan/captions.mjs --check    fail if the baked table disagrees with the picture
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { captionPages, captionsFromWords } from '../../src/echallan/caption-pages.mjs';
import { syncPublicDir } from './publicdir.mjs';

const FF = '/opt/homebrew/bin/ffmpeg';
const CHECK = process.argv.includes('--check');
const OUT = 'src/echallan/caption-side.json';
const TMP = 'qa-echallan/capscan';
const FPS = 60, W = 1080, H = 1920;

/* the bands, in the finished frame. BOT is where a three-line page actually sits (the block is
   anchored 214 up from the bottom and can be 191 tall); TOP is the same height, below the Shorts
   title row and clear of the channel mark at y 40..92. */
const BOT = [1500, 1740], TOP = [150, 390];
const BAND_H = BOT[1] - BOT[0];
const ROWS = `${TMP}/rows.json`;

const narration = JSON.parse(fs.readFileSync('src/echallan/narration.json', 'utf8'));
const pages = captionPages(captionsFromWords(narration.words));
console.log(`${pages.length} caption pages`);

/* ── one frame, reduced to DRAWN CONTENT ────────────────────────────────────────────────────
   Not brightness. The first cut of this measured focal mass — luminance above the median, squared,
   weighted by saturation — and it flagged ten pages, six of which were sitting over nothing but a
   lit plaza or a white plinth. Bright is not the same as drawn.

   So it counts EDGES, the way tools/echallan/qa.mjs counts strokes: a plaza, a sky, a ground plane
   and a wall are smooth and score near zero however bright they are, while a form, a keypad, a
   machine, a rack of louvres or a phone's chrome is nothing but edges. A caption over the first is
   invisible; a caption over the second is the thing the review objected to. */
const SW = 270, SH = 480, EDGE = 26;
const density = (file) => {
  const raw = execFileSync(FF, ['-v', 'error', '-i', file, '-vf', `scale=${SW}:${SH}`,
    '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 });
  const band = ([y0px, y1px]) => {
    const y0 = Math.max(1, Math.round((y0px / H) * SH)), y1 = Math.min(SH - 1, Math.round((y1px / H) * SH));
    let n = 0, a = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 1; x < SW - 1; x++) {
        const i = y * SW + x;
        const g = Math.abs(raw[i + 1] - raw[i - 1]) + Math.abs(raw[i + SW] - raw[i - SW]);
        a++; if (g > EDGE) n++;
      }
    }
    return a ? n / a : 0;
  };
  return { bot: band(BOT), top: band(TOP) };
};

if (process.argv.includes('--again')) {
  decide(JSON.parse(fs.readFileSync(ROWS, 'utf8')));
  process.exit(process.exitCode ?? 0);
}
fs.mkdirSync(TMP, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/echallan/index.tsx'),
  publicDir: syncPublicDir() });
const composition = await selectComposition({ serveUrl, id: 'Opening',
  inputProps: { subs: false } });

/* ── measure every page at three points ─────────────────────────────────────────────────────*/
const rows = [];
for (let p = 0; p < pages.length; p++) {
  const pg = pages[p];
  const t0 = pg.startMs / 1000, t1 = Math.min(pg.endMs / 1000, composition.durationInFrames / FPS - 0.02);
  const ts = [t0 + (t1 - t0) * 0.15, (t0 + t1) / 2, t0 + (t1 - t0) * 0.85];
  let bot = 0, top = 0;
  for (const t of ts) {
    const f = Math.min(composition.durationInFrames - 1, Math.round(t * FPS));
    const file = `${TMP}/p${String(p).padStart(3, '0')}_${f}.png`;
    await renderStill({ serveUrl, composition, frame: f, output: file,
      inputProps: { subs: false }, scale: 0.5 });
    const m = density(file);
    bot = Math.max(bot, m.bot); top = Math.max(top, m.top);
    fs.rmSync(file);
  }
  rows.push({ p, key: String(Math.round(pg.startMs)), t0, t1, bot, top, text: pg.text.slice(0, 44) });
  process.stdout.write(`\r  measured ${p + 1}/${pages.length}`);
}
process.stdout.write('\n');

fs.writeFileSync(ROWS, JSON.stringify(rows, null, 1));
decide(rows);

/* ── the rule, and the hysteresis that stops it flickering ──────────────────────────────────
   UP is set from the pictures, not from taste: a caption band with more than 4.5% of its pixels
   on an edge is sitting on something that was drawn — the payment form's lower fields, the deck,
   the phone's chrome — while plaza, sky, ground and wall all come in under 2%. A page also only
   moves if the top band is clearly quieter, because the alternative has to be better than what it
   replaces. Once it is up there it stays up until the bottom is comfortably clear again: a caption
   that changes edge between two consecutive pages is worse than one in a slightly busy corner. */
function decide(rows) {
  /* AND A BAND CAN BE TOO BUSY TO USE AT ALL. HEAD asks the top to be clearly quieter than the
     bottom before a page moves, which is right when the bottom is merely occupied — but it kept
     the closing advice at the bottom over a band that was 33.5% edges, sitting on the two counters
     and the notice the sentence is about, while the middle of that frame was empty stone. Past
     BUSY the question stops being "is the top better" and becomes "is the top any worse", because
     at that density the caption is not on a background, it is on the subject. */
  const UP = 0.045, DOWN = 0.030, HEAD = 0.62, BUSY = 0.28;
  let side = 'bottom';
  const out = {};
  console.log('\npage   window            bottom   top     side');
  for (const r of rows) {
    const wantUp = r.bot > UP
      && (r.top < r.bot * HEAD || (r.bot > BUSY && r.top < r.bot * 0.95));
    const stayUp = side === 'top' && r.bot > DOWN && r.top < r.bot * 0.9;
    side = wantUp || stayUp ? 'top' : 'bottom';
    r.side = side;
    if (side === 'top') out[r.key ?? String(Math.round(pages[r.p].startMs))] = 'top';
    console.log(`${String(r.p).padStart(4)}   ${r.t0.toFixed(2)}-${r.t1.toFixed(2)}s`.padEnd(22)
      + `${(r.bot * 100).toFixed(1)}%`.padStart(7) + `${(r.top * 100).toFixed(1)}%`.padStart(8)
      + `   ${side === 'top' ? 'TOP' : '-'}   ${r.text}`);
  }
  const moved = rows.filter((x) => x.side === 'top');
  console.log(`\n${moved.length} of ${rows.length} pages stand at the top`);
  if (CHECK) {
    const have = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    if (JSON.stringify(have) !== JSON.stringify(out)) {
      console.log('FAIL  the baked table no longer matches the picture'); process.exitCode = 1;
    } else console.log('the baked table still matches the picture');
  } else {
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
    console.log(`-> ${OUT}`);
  }
}
