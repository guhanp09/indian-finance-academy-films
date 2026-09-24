/* SUBTITLES — the channel's caption treatment, laid out for 9:16.
 *
 * Same behaviour as the long-form films' captions, and deliberately the same module: pages are built by
 * `buildCaptionPages` from src/shared, so sentence splitting, comma/clause breaks and the
 * 5.2s page cap behave identically rather than approximately. What changes here is the layout —
 * a 1080-wide frame needs a bigger relative size and fewer characters per line than a 1920-wide
 * one, or the captions are unreadable in the hand.
 *
 * The treatment: no plate, bottom-anchored, condensed and heavy, off-white with a hard dark
 * stroke so it holds over any part of the picture, and the word being spoken lifts into the
 * film's warning yellow at 1.16x with a 72ms attack and an 86ms release.
 */
import type { Caption } from '@remotion/captions';
import React, { useMemo } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { mergeAdjoiningTokens } from '../shared/caption-sentences.mjs';
import { captionPages, captionsFromWords } from './caption-pages.mjs';
import { C, FPS } from './design';
import { NARR } from './timeline';

const TAIL_MS = 180;
const ACTIVE_SCALE = 1.16;
const ATTACK_MS = 72;
const RELEASE_MS = 86;
const WORD_GAP_PX = 12;
const LINE_WIDTH_PX = 952;
const BOTTOM_PX = 214;
const FACE = '"Avenir Next Condensed", "Avenir Next", "Trebuchet MS", sans-serif';
/* a 9:16 frame is 1080 wide, not 1920, so the page has to step down a size sooner */
const baseSize = (length: number) => (length > 112 ? 44 : length > 86 ? 48 : 54);
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type DisplayWord = { text: string; fromMs: number; toMs: number };

const estimateWidth = (text: string, fontSize: number) => [...text.trim()].reduce((sum, ch) => {
  if (/[ilI1.,:;!'"|]/.test(ch)) return sum + fontSize * 0.25;
  if (/[mwMW@%]/.test(ch)) return sum + fontSize * 0.72;
  if (/[A-Z0-9]/.test(ch)) return sum + fontSize * 0.54;
  return sum + fontSize * 0.45;
}, 0);

const splitLines = (words: DisplayWord[], fontSize: number) => {
  const lines: DisplayWord[][] = [];
  let line: DisplayWord[] = [];
  let width = 0;
  for (const word of words) {
    const w = estimateWidth(word.text, fontSize);
    if (line.length && width + WORD_GAP_PX + w > LINE_WIDTH_PX) { lines.push(line); line = []; width = 0; }
    line.push(word);
    width += (line.length > 1 ? WORD_GAP_PX : 0) + w;
  }
  if (line.length) lines.push(line);
  return lines;
};

const emphasisAt = (timeMs: number, w: DisplayWord) => {
  if (timeMs < w.fromMs || timeMs >= w.toMs + RELEASE_MS) return 0;
  if (timeMs < w.fromMs + ATTACK_MS)
    return interpolate(timeMs, [w.fromMs, w.fromMs + ATTACK_MS], [0.52, 1],
      { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (timeMs < w.toMs) return 1;
  return interpolate(timeMs, [w.toMs, w.toMs + RELEASE_MS], [1, 0],
    { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

/* The word map and the paging rules live in ./caption-pages.mjs, imported here and by
   tools/upi-scam/script.mjs, so the lines a recording script quotes are the lines the film draws. */
const CAPTIONS = captionsFromWords(NARR.words);

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const pages = useMemo(() => captionPages(CAPTIONS), []);
  const timeMs = (frame + 0.5) * 1000 / FPS;

  let lo = 0, hi = pages.length - 1, index = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (pages[mid].startMs <= timeMs) { index = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (index < 0) return null;
  const page = pages[index];
  const endMs = Math.min(page.endMs + TAIL_MS, pages[index + 1]?.startMs ?? Infinity);
  if (timeMs >= endMs) return null;

  const fontSize = baseSize(page.text.length);
  const lines = splitLines(mergeAdjoiningTokens(page.tokens), fontSize);

  return (
    <AbsoluteFill style={{
      justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none', zIndex: 1000,
    }}>
      <div style={{
        width: LINE_WIDTH_PX + 40, marginBottom: BOTTOM_PX, color: C.ink, fontFamily: FACE,
        fontSize, fontWeight: 800, lineHeight: 1.18, letterSpacing: 0.2, textAlign: 'center',
        textShadow: '0 3px 8px rgba(4,8,24,0.92), 0 1px 2px rgba(4,8,24,0.95)',
        WebkitTextStroke: '1.4px #090D20',
      }}>
        {lines.map((line, li) => (
          <div key={`${page.startMs}-${li}`} style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'center',
            gap: WORD_GAP_PX, whiteSpace: 'nowrap', minHeight: fontSize * 1.18,
          }}>
            {line.map((word, wi) => {
              const active = word.fromMs <= timeMs && word.toMs > timeMs;
              const emphasis = emphasisAt(timeMs, word);
              const scale = 1 + (ACTIVE_SCALE - 1) * emphasis;
              const pad = estimateWidth(word.text, fontSize) * (scale - 1) / 2;
              return (
                <span key={`${word.fromMs}-${wi}`}
                  style={{ display: 'inline-block', marginLeft: pad, marginRight: pad }}>
                  <span style={{
                    display: 'inline-block',
                    color: active ? C.yellow : C.ink,
                    scale: `${scale}`,
                    translate: `0 ${-2 * emphasis}px`,
                    transformOrigin: '50% 72%',
                    textShadow: active
                      ? '0 3px 8px rgba(4,8,24,0.92), 0 0 14px rgba(255,211,90,0.40)'
                      : '0 3px 8px rgba(4,8,24,0.92), 0 1px 2px rgba(4,8,24,0.95)',
                  }}>{word.text.trimStart()}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
