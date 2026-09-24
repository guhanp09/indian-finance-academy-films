import type { Caption } from '@remotion/captions';
export type Page = {
  startMs: number; endMs: number; text: string;
  tokens: { text: string; fromMs: number; toMs: number }[];
};
export const MAX_PAGE_MS: number;
export const MIN_GAP_MS: number;
export const MIN_HALF_MS: number;
export function splitStillLong(page: Page): Page[];
export function captionPages(captions: Caption[]): Page[];
export function captionsFromWords(
  words: { w: string; s: number; e: number }[]): Caption[];
