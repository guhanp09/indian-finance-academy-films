import type {Caption} from '@remotion/captions';

export type CaptionSentence={
  startMs:number;
  endMs:number;
  text:string;
  tokens:{text:string;fromMs:number;toMs:number}[];
};

export function buildCaptionSentences(captions:Caption[]):CaptionSentence[];
export function buildCaptionPages(captions:Caption[]):CaptionSentence[];
export function mergeAdjoiningTokens(tokens:CaptionSentence['tokens']):CaptionSentence['tokens'];
