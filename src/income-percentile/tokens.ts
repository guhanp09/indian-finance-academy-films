// Income percentile film — design tokens.
//
// Percentile colours encode rank and are identical for both countries. They are
// chosen to separate on BOTH hue and lightness — a deep teal, a mid gold and a
// pale lilac — because the earlier pass separated only on hue and the median
// and top-1% zones collapsed into each other at note-tint strength.

export const C = {
  bg: '#0E1621',
  surface: '#151F2B',
  ink: '#F3F0E8',
  muted: '#89939F',
  dim: '#5A6673',
  hair: 'rgba(243,240,232,0.12)',

  /* percentile bands — bright, for labels, markers and dots */
  band50: '#4FC3E8',   // teal-cyan   · lum ~0.48
  band90: '#F5BE3E',   // gold        · lum ~0.60
  band99: '#C9B4FF',   // pale lilac  · lum ~0.55, very different hue
  bandTop: '#7E76A0',  // the top band, continued past the last named line
  unreached: '#33404E',

  /* the same four as banknote paper — a value ramp from dark to light, so the
     ladder reads even in a thumbnail */
  note: '#C6BFAE',      // generic banknote paper, for stacks that are not a meter
  note50: '#2F7E9B',
  note90: '#C68F2C',
  note99: '#B8A6E6',
  /* Above the last named line the notes have no tier of their own, so they are
     drawn in exactly the neutral the meter uses for anything not yet narrated.
     Same colour, same strength, in every act — the stack above the top-1% line
     must never appear to change colour just because a scene changed. */
  noteTop: '#5A6673',

  /* money states */
  cost: '#F0584A',     // living cost — hatched over the notes, never replacing them
  costSoft: 'rgba(240,88,74,0.92)',
  tax: '#7C8FA3',
  taxSoft: 'rgba(124,143,163,0.85)',
  surplus: '#4ED08B',

  /* employment / output sectors — a separate family, used only in the rings */
  secAgri: '#7FA860',
  secInd: '#C2704A',
  secSer: '#6B7FCC',

  /* what a price is made of. The whole second half turns on this one
     distinction, so it gets exactly two colours and keeps them from the first
     frame they appear to the last:
       local — somebody's time, which is cheap in India
       world — bought in a market that does not care what Indians earn */
  priceLocal: '#4FC3E8',
  priceWorld: '#F0584A',

  /* the two quantities the film ends up comparing */
  wage: '#8FE3B4',

  /* the channel's own colours, for the end card only — the logo's ring teal and
     its chevron gold, both lifted enough to hold on the film's dark ground */
  brandTeal: '#3E9887',
  brandGold: '#D6A03C',
} as const;

export const T = {
  hero: 144,
  stat: 108,
  h1: 72,
  h2: 54,
  lead: 40,
  body: 34,
  label: 28,
  small: 23,
  micro: 19,
} as const;

export const L = { W: 1920, H: 1080, margin: 80 } as const;

/**
 * The meter. One fixed, round ceiling and one fixed on-screen geometry — it is
 * never rescaled and never masked, so a marker can never end up pointing at
 * something that is not on screen.
 */
export const METER: {
  base: number; band: number; x: number; w: number;
  markerX: number; braceX: number; pitch: number;
} = {
  base: 960,
  band: 800,
  // Landscape. The stack lives in the right third; the readouts and the
  // apparatus that feeds it live in the left two thirds, so the hero figure can
  // never run under the notes however far the frame pushes in.
  x: 1400, w: 240,
  markerX: 1668,
  braceX: 1372,
  pitch: 11,
};

export const IN = {
  cap: 100000, median: 12000, top10: 32000, top1: 75000, cost: 35400,
  shortMed: 23400, shortT10: 3400, leftT1: 39600,
} as const;
export const US = {
  cap: 50000, median: 4400, top10: 12900, top1: 37500, cost: 2580,
  leftMed: 1820, leftTax: 1100, leftT10: 7200, leftT1: 23200,
} as const;

export const zonesOf = (m: typeof IN | typeof US) => [
  { to: m.median / m.cap, color: C.note50 },
  { to: m.top10 / m.cap, color: C.note90 },
  { to: m.top1 / m.cap, color: C.note99 },
  { to: 1.001, color: C.noteTop },
];

/* Sector composition. Employment shares from India's PLFS 2023-24 and US BLS
   2023; output shares from India's GVA 2023-24 and US BEA. Rounded, and the
   point of the chart is the gap between the two rings, not the third decimal. */
export const SECTORS = [
  { key: 'agri', label: 'AGRICULTURE', color: C.secAgri },
  { key: 'ind', label: 'INDUSTRY', color: C.secInd },
  { key: 'ser', label: 'SERVICES', color: C.secSer },
] as const;
export const COMPOSITION = {
  in: { workers: [46, 26, 28], output: [18, 28, 54] },
  us: { workers: [2, 19, 79], output: [1, 18, 81] },
} as const;

export const FONT = 'Inter, system-ui, sans-serif';


/* ------------------------------------------------------- prices as prices -- */
/*
 * Nothing in the second half is drawn as a ratio. Every price is drawn at its
 * own length in one currency, America above and India below, so "longer costs
 * more" is the only rule a viewer has to know. `mix` is what the price is made
 * of — a qualitative split, never given a percentage, because the film has no
 * evidence for a precise one.
 */
export type PriceRow = {
  key: string; label: string; icon: string;
  us: number; in: number;                 // ₹ per month, at ₹85 per US dollar
  mix: [number, number];                  // local inputs / global inputs
};

export const PRICES: PriceRow[] = [
  { key: 'hair',  label: 'A HAIRCUT', icon: 'scissors',  us: 2550,   in: 120,   mix: [0.95, 0.05] },
  { key: 'phone', label: 'A PHONE',   icon: 'phone',     us: 39950,  in: 42000, mix: [0.10, 0.90] },
  { key: 'food',  label: 'FOOD',      icon: 'groceries', us: 38250,  in: 8000,  mix: [0.55, 0.45] },
  { key: 'tran',  label: 'TRANSPORT', icon: 'transport', us: 21250,  in: 3400,  mix: [0.50, 0.50] },
  { key: 'rent',  label: 'RENT',      icon: 'rent',      us: 110500, in: 15000, mix: [0.58, 0.42] },
];

/** The payoff, all on one scale in one currency. */
export const PAYOFF = {
  usIncome: 374000,
  usCost: 219300,
  inIncome: 12000,
  inCost: 35400,
  usOutput: 186500,     // output per worker per year, market exchange rates
  inOutput: 6980,       // 186500 / 6980 = 26.7x, the ratio the narration names
} as const;

/** The two ratios the film names out loud, kept next to the figures they
 *  divide so a caption and a bar can never disagree. */
export const FOLD = { cost: 6, wage: 31 } as const;

/** Output per worker, US ÷ India, inside each sector. */
export const SECTOR_GAP = [
  { key: 'agri', label: 'FARMING',  x: 34, color: C.secAgri },
  { key: 'ind',  label: 'INDUSTRY', x: 23, color: C.secInd },
  { key: 'ser',  label: 'SERVICES', x: 14, color: C.secSer },
] as const;

/* Output per worker, indexed so India today is exactly 1.
   Both are held to the precision the counters can actually land on: a drum
   that stops 70% of the way between 6 and 7 reads as a fault, not a figure.
   186500 / 6980 = 26.7, which is the "roughly twenty-seven-fold" the
   narration names; the counterfactual is 1.7, as spoken. */
export const RATIO = { shift: 1.7, output: 27, axisMax: 33 } as const;
