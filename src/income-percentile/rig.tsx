// The full-frame percentile rig, used identically for both countries.
// The meter is at its fixed scale from the first frame: ₹12,000 occupies 12% of
// it, so how little it takes to pass the median worker is felt, not asserted.
import React from 'react';
import { C, T, METER } from './tokens';
import { Txt, Chip, Odometer, DotField, Meter, MeterMarker, Flag, Zone, Band } from './kit';
import { staged, stagedPrev, Stage } from './state';
import { fade, settle, clamp01, lerp, pr, EASE } from './anim';

export const DOT_BANDS: Band[] = [
  { upTo: 50, color: C.band50 },
  { upTo: 90, color: C.band90 },
  { upTo: 99, color: C.band99 },
];

export const rankColor = (fill: number) =>
  fill <= 50.001 ? C.band50 : fill <= 90.001 ? C.band90 : C.band99;

export type RigMarker = {
  v: number; value: string; label: string; color: string;
  valueAt: number; labelAt: number;
};

/* Landscape: three columns. The readouts on the left, the population field in
   the middle, the cash meter on the right — so no two of them can ever reach
   into each other's space however large a figure gets. */
export const DOTS = { x: 760, bottom: 912, cell: 54, r: 17.5 };

/**
 * The rank readout belongs to the dot field, not to the frame: it sits on the
 * grid's own left edge, directly under its last row, and is centred against
 * its label rather than sitting on a shared baseline — a 76px numeral and a
 * 23px caps label have baselines 17px apart, which is what made the figure
 * float above its own words.
 */
export const READOUT_Y = DOTS.bottom + 26;

export const RankReadout: React.FC<{
  x?: number; y?: number; value: number; prev?: number; color: string; op: number; size?: number;
}> = ({ x = DOTS.x, y = READOUT_Y, value, prev, color, op, size = 68 }) => (
  <div style={{
    position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 18,
    opacity: op,
  }}>
    <Odometer value={value} prev={prev} size={size} step={1} color={color} />
    <Txt size={T.small} color={C.muted} weight={700} track={3} lh={1}>OF 100 EARN LESS</Txt>
  </div>
);

export const CountryRig: React.FC<{
  f: number; chip: string; country: 'in' | 'us'; prefix: string; step: number;
  cap: number; income: Stage[]; rank: Stage[]; markers: RigMarker[];
  dx?: number; op?: number; appear?: number; hiAll?: number;
}> = ({ f, chip, country, prefix, step, cap, income, rank, markers, dx = 0, op = 1, appear = 1, hiAll = 0 }) => {
  const v = staged(f, income);
  const vPrev = stagedPrev(f, income);
  const fill = staged(f, rank);
  const fillPrev = stagedPrev(f, rank);
  const rc = rankColor(fill);
  const incomeOn = f >= income[0].land - (income[0].dur ?? 26);
  const rankOn = f >= rank[0].land - (rank[0].dur ?? 26);
  const lastIncome = income.reduce((a, s) => (f >= s.land ? s.land : a), -1);
  const lastRank = rank.reduce((a, s) => (f >= s.land ? s.land : a), -1);

  const zones: Zone[] = [
    { to: markers[0].v / cap, color: C.note50 },
    { to: markers[1].v / cap, color: C.note90 },
    { to: markers[2].v / cap, color: C.note99 },
    { to: 1.001, color: C.noteTop },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${dx}px)`, opacity: op }}>
      <Chip x={80} y={110} text={chip} draw={clamp01(appear * 2)} />

      <div style={{
        position: 'absolute', left: 80, top: 230, opacity: incomeOn ? 1 - hiAll * 0.55 : 0,
        transform: `scale(${settle(f, lastIncome)})`, transformOrigin: 'left center',
      }}>
        <Odometer value={v} prev={vPrev} prefix={prefix} suffix="/month" size={T.stat + 4} step={step} />
      </div>

      <DotField x={DOTS.x} bottom={DOTS.bottom} cell={DOTS.cell} r={DOTS.r}
        fill={fill} bands={DOT_BANDS} appear={appear} />

      <div style={{
        position: 'absolute', inset: 0,
        transform: `scale(${settle(f, lastRank)})`,
        transformOrigin: `${DOTS.x}px ${READOUT_Y + 39}px`,
      }}>
        <RankReadout value={fill} prev={fillPrev} color={rc} op={rankOn ? 1 - hiAll * 0.55 : 0} />
      </div>

      <Meter zones={zones} active={v / cap} reveal={appear} aboveMode="neutral" />
      <Flag country={country} x={METER.x + METER.w / 2 - 32} y={METER.base + 26} op={clamp01(appear * 2 - 1)} />

      {markers.map((m) => (
        <MeterMarker key={m.value} v={m.v / cap} value={m.value} label={m.label} color={m.color}
          op={fade(f, m.valueAt - 2, undefined, 12)} labelOp={fade(f, m.labelAt - 2, undefined, 12)}
          draw={pr(f, m.valueAt - 14, 16, EASE.move)} scale={1 + 0.14 * hiAll} />
      ))}
    </div>
  );
};
