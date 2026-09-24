// The cost-of-living analysis, written once and run twice.
//
// The five categories are physically carried into the meter one at a time, and
// each arrival is what pushes the expense up — the icon's motion is the cause,
// not an illustration beside it. Only the narrated total makes the decisive,
// measured move.
import React from 'react';
import { C, T, METER } from './tokens';
import { Txt, Chip, Odometer, Meter, MeterMarker, Brace, Flag, Zone, Hatch, yAt } from './kit';
import { Icon, IconName } from './icons';
import { pr, fade, settle, clamp01, lerp, EASE } from './anim';
import { BASKET_SHOW, TRAVEL_IN, TRAVEL_DRAW } from './state';

export const BASKET: { n: IconName; l: string }[] = [
  { n: 'rent', l: 'RENT' },
  { n: 'groceries', l: 'FOOD' },
  { n: 'utilities', l: 'UTILITIES' },
  { n: 'transport', l: 'TRANSPORT' },
  { n: 'leisure', l: 'LEISURE' },
];

/* The expense column owns its own vertical channel. It starts well to the
   right of the hero figure so that the block it heads — EXPENSES, the flag,
   and everything that falls under them — is a separate object rather than
   something crowding the "/month" suffix. */
const ICON_X = 908, ICON_SIZE = 72, ICON_TOP = 262, ICON_PITCH = 138;
const LABEL_X = ICON_X - 316, LABEL_W = 300;

/**
 * Five categories staged beside the meter, then carried into it. The travel
 * lands on the same frame as its step, so the two read as one event.
 */
export const Basket: React.FC<{
  f: number; showAt: number[]; travelAt: number[]; targets: number[];
  country: 'in' | 'us';
}> = ({ f, showAt, travelAt, targets, country }) => (
  <>
    {/* the column is named and flagged, so it is never ambiguous whose expenses
        these are — and each icon leaves a faded print where it started, so the
        row reads as a list being emptied rather than things appearing at random */}
    <div style={{
      position: 'absolute', left: LABEL_X, top: ICON_TOP - 88, width: ICON_X + ICON_SIZE - LABEL_X - 62,
      opacity: pr(f, showAt[0] - 14, 18, EASE.move),
    }}>
      <Txt size={T.small} color={C.cost} weight={700} track={3.4} align="right">EXPENSES</Txt>
    </div>
    <Flag country={country} x={ICON_X + ICON_SIZE - 46} y={ICON_TOP - 92} w={46}
      op={pr(f, showAt[0] - 10, 18, EASE.move)} />
    {BASKET.map((b, i) => {
      const restY = ICON_TOP + i * ICON_PITCH;
      const ghost = pr(f, travelAt[i] - 4, 16, EASE.move);
      if (ghost <= 0.001) return null;
      return (
        <div key={`g-${b.n}`} style={{
          position: 'absolute', left: ICON_X, top: restY, opacity: ghost * 0.22,
        }}>
          <Icon name={b.n} size={ICON_SIZE} color={C.cost} />
        </div>
      );
    })}
    {BASKET.map((b, i) => {
      const restY = ICON_TOP + i * ICON_PITCH;
      const draw = pr(f, showAt[i], TRAVEL_DRAW, EASE.move);
      if (draw <= 0.001) return null;
      const t = pr(f, travelAt[i] - TRAVEL_IN, TRAVEL_IN, EASE.toss);
      const done = clamp01((t - 0.82) / 0.18);
      if (done >= 1) return null;
      const x = lerp(ICON_X, METER.x + METER.w / 2 - ICON_SIZE / 2, t);
      const y = lerp(restY, targets[i] - ICON_SIZE / 2, t);
      return (
        <React.Fragment key={b.n}>
          <div style={{
            position: 'absolute', left: x, top: y,
            transform: `scale(${lerp(1, 0.34, t)})`, transformOrigin: 'center center',
            opacity: 1 - done,
          }}>
            <Icon name={b.n} size={ICON_SIZE} color={C.cost} draw={draw} />
          </div>
          <div style={{
            position: 'absolute', left: LABEL_X, top: restY + ICON_SIZE / 2 - 12, width: LABEL_W,
            opacity: clamp01((draw - 0.3) / 0.7) * (1 - clamp01((t - 0.3) / 0.35)),
          }}>
            <Txt size={T.micro} color={C.cost} weight={700} track={2.4} align="right">{b.l}</Txt>
          </div>
        </React.Fragment>
      );
    })}
  </>
);

export type CostFrame = {
  f: number;
  chip: string; country: 'in' | 'us'; cap: number; prefix: string;
  zones: Zone[];
  cost: number; costPrev: number; active: number; vHi: number;
  taxTop?: number;
  hero?: { value: number; prev: number; color: string; step: number; land: number };
  markers: { v: number; value: string; label: string; color: string; op?: number; labelOp?: number }[];
  costMarker?: { value: string; op: number; labelOp?: number; draw: number };
  brace?: { v0: number; v1: number; value: string; label: string; color: string; draw: number };
  basket?: { showAt: number[]; travelAt: number[]; targets: number[]; country: 'in' | 'us' };
  provisional?: boolean;
  reveal?: number;
  /** Fades the working-out — the running figure, the expense column and the
   *  brace — while the meter, its flag and its named levels stay exactly where
   *  they are. The scene is then a finished object that the next movement can
   *  pick up and carry, rather than a picture that has to be thrown away. */
  clear?: number;
};

export const CostScene: React.FC<CostFrame> = (p) => {
  const { f, cap } = p;
  const kept = 1 - clamp01(p.clear ?? 0);
  const hatch: Hatch[] = [{ from: 0, to: p.cost / cap, kind: 'cost' }];
  if (p.taxTop !== undefined) hatch.push({ from: p.cost / cap, to: p.taxTop, kind: 'tax' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Chip x={80} y={110} text={p.chip} />

      {p.hero ? (
        <>
          <div style={{
            position: 'absolute', left: 80, top: 200, opacity: kept,
            transform: `scale(${settle(f, p.hero.land)})`, transformOrigin: 'left center',
          }}>
            <Odometer value={p.hero.value} prev={p.hero.prev} prefix={p.prefix} suffix="/month"
              size={T.stat - 16} step={p.hero.step} color={p.hero.color} />
          </div>
        </>
      ) : null}

      {p.basket ? (
        <div style={{ position: 'absolute', inset: 0, opacity: kept }}>
          <Basket f={f} {...p.basket} />
        </div>
      ) : null}

      <Meter vHi={p.vHi} zones={p.zones} hatch={hatch} active={1} reveal={p.reveal ?? 1} />
      <Flag country={p.country} x={METER.x + METER.w / 2 - 32} y={METER.base + 26} />

      {/* the expense boundary: solid while measured, provisional while it is
          still only the sum of a few categories */}
      <div style={{
        position: 'absolute', left: METER.x - 8, width: METER.w + 16,
        top: yAt(p.cost / cap, p.vHi) - 1.5, height: 3, borderRadius: 2,
        background: p.provisional
          ? `repeating-linear-gradient(90deg, ${C.cost} 0 9px, transparent 9px 17px)`
          : C.cost,
        opacity: p.cost > 0 && yAt(p.cost / cap, p.vHi) > 170 ? 1 : 0,
      }} />

      {p.markers.map((m) => (
        <MeterMarker key={m.value} v={m.v / cap} vHi={p.vHi} value={m.value} label={m.label}
          color={m.color} op={m.op ?? 1} labelOp={m.labelOp ?? 1} />
      ))}

      {p.costMarker ? (
        <MeterMarker v={p.cost / cap} vHi={p.vHi} value={p.costMarker.value} label="COST OF LIVING"
          color={C.cost} op={p.costMarker.op} labelOp={p.costMarker.labelOp ?? 1}
          draw={p.costMarker.draw} size={30} />
      ) : null}

      {p.brace ? (
        <div style={{ position: 'absolute', inset: 0, opacity: kept }}>
          <Brace v0={p.brace.v0} v1={p.brace.v1} vHi={p.vHi} value={p.brace.value} label={p.brace.label}
            color={p.brace.color} draw={p.brace.draw} />
        </div>
      ) : null}
    </div>
  );
};
