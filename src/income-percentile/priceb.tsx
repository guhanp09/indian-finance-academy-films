// The second half's drawing language: quantities drawn as lengths.
//
// There is no ratio anywhere in here. Every quantity is a bar whose length is
// the amount, in one currency, with America above and India below in that order
// every single time. The only rule a viewer has to hold is "longer costs more",
// which is the rule they already have.
//
// One construction, used by every bar in the film:
//   · the bar grows from a fixed left edge;
//   · its icon rides the growing right edge from inside the bar;
//   · its figure rides just outside that edge and counts up with it, so the
//     number is mechanically attached to the length rather than printed beside
//     it. Nothing is ever left stranded where the bar used to end.
import React from 'react';
import { C, T, PriceRow } from './tokens';
import { Txt, Flag, Odometer } from './kit';
import { Icon, IconName } from './icons';
import { clamp01, lerp, jitter } from './anim';

/** ₹ with Indian digit grouping, so ₹1,10,500 reads as a lakh and not as 110k. */
export const rupees = (n: number) => {
  const v = Math.round(n);
  if (v < 1000) return `₹${v}`;
  const s = String(v);
  const tail = s.slice(-3);
  const head = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${head},${tail}`;
};

const HEX = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const withA = (hex: string, a: number) => {
  const [r, g, b] = HEX(hex);
  return `rgba(${r},${g},${b},${a})`;
};
export const mixHex = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = HEX(a); const [r2, g2, b2] = HEX(b);
  const k = clamp01(t);
  return `rgb(${Math.round(lerp(r1, r2, k))},${Math.round(lerp(g1, g2, k))},${Math.round(lerp(b1, b2, k))})`;
};

const MIXC = [C.priceLocal, C.priceWorld];
const MIXL = ['LOCAL INPUTS', 'GLOBAL INPUTS'];

/* ------------------------------------------------------- the item table --- */

export const TAB = {
  icon: 88, name: 152, comp: 372, compW: 430,
  price: 906, priceW: 700, fig: 1636,
  top: 246, pitch: 152,
};

/**
 * What a price is made of. A qualitative split in exactly two colours — it
 * carries no percentages, because the film has no evidence for a precise one
 * and inventing one would be the same sin as the axis this replaces.
 */
export const CompBar: React.FC<{
  y: number; mix: [number, number]; draw: number; legend?: number; frame?: number;
}> = ({ y, mix, draw, legend = 0, frame = 0 }) => {
  const d = clamp01(draw);
  let acc = 0;
  const segs = mix.map((m, i) => { const s = { i, from: acc, w: m }; acc += m; return s; });
  return (
    <>
      {frame > 0.01 ? (
        <div style={{
          position: 'absolute', left: TAB.comp, top: y + 4, width: TAB.compW * frame, height: 30,
          borderRadius: 4, border: `1px solid ${C.hair}`, boxSizing: 'border-box',
          opacity: 1 - d,
        }} />
      ) : null}
      <div style={{
        position: 'absolute', left: TAB.comp, top: y + 4, width: TAB.compW * d, height: 30,
        borderRadius: 4, overflow: 'hidden',
      }}>
        {segs.map((s) => (s.w < 0.004 ? null : (
          <div key={s.i} style={{
            position: 'absolute', left: `${s.from * 100}%`, width: `${s.w * 100}%`,
            top: 0, height: '100%', background: MIXC[s.i],
            boxShadow: 'inset -1px 0 0 rgba(14,22,33,0.55)',
          }} />
        )))}
      </div>
      {legend > 0.01 ? segs.map((s) => {
        const op = legend * clamp01((s.w - 0.06) / 0.1);
        return op < 0.01 ? null : (
          <div key={s.i} style={{
            position: 'absolute', left: TAB.comp + (s.from + s.w / 2) * TAB.compW - 110,
            top: y - 26, width: 220, textAlign: 'center', opacity: op,
          }}>
            <Txt size={T.micro} color={MIXC[s.i]} weight={700} track={2} align="center">{MIXL[s.i]}</Txt>
          </div>
        );
      }) : null}
    </>
  );
};

/**
 * One item's two prices. America is always the upper bar and the full width of
 * the lane; India is always the lower one, at its own true length beside it.
 * Each figure rides the end of its own bar and counts with it, so ₹120 is read
 * off the end of a stub and ₹42,000 off the end of a full lane.
 */
export const PricePair: React.FC<{
  y: number; row: PriceRow; draw: number; drawPrev?: number; scale?: number;
}> = ({ y, row, draw, drawPrev, scale }) => {
  const d = clamp01(draw);
  const dP = clamp01(drawPrev ?? draw);
  const max = scale ?? Math.max(row.us, row.in);
  const w = (v: number, k: number) => (v / max) * TAB.priceW * k;
  const over = row.in > row.us;
  const inColor = over ? C.priceWorld : C.priceLocal;
  return (
    <>
      <Flag country="us" x={TAB.price - 54} y={y - 1} w={34} op={d} />
      <div style={{
        position: 'absolute', left: TAB.price, top: y, height: 22, width: w(row.us, d),
        background: C.dim, borderRadius: 3, opacity: d < 0.005 ? 0 : 1,
      }} />
      <div style={{
        position: 'absolute', left: TAB.price + w(row.us, d) + 18, top: y - 6,
        opacity: clamp01(d * 5), whiteSpace: 'nowrap',
      }}>
        <Odometer value={row.us * d} prev={row.us * dP} size={T.small} step={10}
          prefix="₹" group="in" color={C.muted} weight={600} />
      </div>

      <Flag country="in" x={TAB.price - 54} y={y + 37} w={34} op={d} />
      <div style={{
        position: 'absolute', left: TAB.price, top: y + 36, height: 26, width: w(row.in, d),
        background: inColor, borderRadius: 3, opacity: d < 0.005 ? 0 : 1,
      }} />
      <div style={{
        position: 'absolute', left: TAB.price + w(row.in, d) + 18, top: y + 31,
        opacity: clamp01(d * 5), whiteSpace: 'nowrap',
      }}>
        <Odometer value={row.in * d} prev={row.in * dP} size={T.small} step={10}
          prefix="₹" group="in" color={inColor} weight={700} />
      </div>
    </>
  );
};

/** The item's name and picture, on the left of its own row. */
export const RowHead: React.FC<{ y: number; row: PriceRow; draw: number; dim?: number; hideIcon?: boolean }> =
  ({ y, row, draw, dim = 0, hideIcon = false }) => (
    <>
      {hideIcon ? null : (
        <div style={{ position: 'absolute', left: TAB.icon, top: y - 2, opacity: draw * (1 - dim * 0.6) }}>
          <Icon name={row.icon as IconName} size={46} color={C.ink} draw={draw} />
        </div>
      )}
      <div style={{ position: 'absolute', left: TAB.name, top: y + 10, width: 200, opacity: draw * (1 - dim * 0.6) }}>
        <Txt size={T.small} color={C.ink} weight={700} track={1.6}>{row.label}</Txt>
      </div>
    </>
  );

/* ------------------------------------------------------- the payoff frame -- */

export const PAY = { label: 96, labelW: 300, flag: 428, x: 512, w: 1016, h: 62, icon: 42 };

/** Row sets. One with a bare eyebrow above it, one with a heading and an
 *  answer above it — the bars keep the same construction in both. */
export const ROW = { a: 300, b: 422, rule: 552, c: 660, d: 782, cap: 892 };
export const PROW = { a: 344, b: 460, rule: 584, c: 686, d: 802, cap: 900 };

export const barEnd = (value: number, max: number, d = 1) =>
  PAY.x + (Math.max(value, 0) / max) * PAY.w * clamp01(d);

/**
 * One bar on the payoff scale.
 *
 * `draw` is the single progress the whole row reads: the length, the icon's
 * seat on the right edge and the odometer are all functions of it, so the
 * number can never finish ahead of the bar or lag behind it. `drawPrev` is the
 * same value one frame earlier and only drives the digit blur.
 *
 * `hi` is the accent used whenever the narration names this figure: the bar
 * lifts out of the frame with a soft halo and its figure grows, so the eye is
 * sent to the right place without a caption saying so.
 */
export const PayBar: React.FC<{
  y: number; label: string; country: 'in' | 'us'; icon: IconName;
  value: number; max: number; color: string;
  draw: number; drawPrev?: number;
  roll?: boolean; step?: number; prefix?: string;
  note?: string; noteDraw?: number;
  hi?: number; mute?: number; h?: number;
  /** Presence, independent of length: a row can stand at zero with its icon
   *  parked at the origin while things are still being dropped into it. */
  show?: number;
}> = ({
  y, label, country, icon, value, max, color, draw, drawPrev,
  roll = true, step = 100, prefix = '₹', note, noteDraw = 1, hi = 0, mute = 0, h = PAY.h, show,
}) => {
  const d = clamp01(draw);
  const dPrev = clamp01(drawPrev ?? draw);
  const shown = roll ? value * d : value;
  const prev = roll ? value * dPrev : value;
  const end = barEnd(value, max, d);
  const len = end - PAY.x;
  const I = PAY.icon;
  /* The icon hugs the bar's right edge from inside — but never at the cost of
     the length, which is the only thing on screen actually carrying the value.
     A bar too short to hold the icon hands it out past its right end instead,
     and every position is interpolated on the same `fit`, so a growing bar
     slides its icon in rather than snapping it. */
  const fit = clamp01((len - (I + 8)) / 30);
  const iconLeft = lerp(end + 10, end - 12 - I, fit);
  const inside = fit;
  const figX = lerp(end + I + 24, end + 20, fit);
  const rowOp = (1 - 0.52 * clamp01(mute)) * clamp01(show ?? (d < 0.0005 ? 0 : 1));
  const k = clamp01(hi);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: rowOp }}>
      <div style={{ position: 'absolute', left: PAY.label, top: y + h / 2 - 13, width: PAY.labelW }}>
        <Txt size={T.small} color={mixHex(C.muted, color, k)} weight={700} track={2.6} align="right">{label}</Txt>
      </div>
      <Flag country={country} x={PAY.flag} y={y + h / 2 - 14} w={40} />

      <div style={{
        position: 'absolute', left: PAY.x, top: y, height: h, borderRadius: 5,
        width: Math.max(len, 0), background: color,
        transform: `scaleY(${1 + 0.16 * k})`, transformOrigin: 'center center',
        filter: k > 0.01 ? `brightness(${1 + 0.12 * k})` : undefined,
        boxShadow: k > 0.01 ? `0 0 ${36 * k}px ${withA(color, 0.6 * k)}` : undefined,
      }} />

      <div style={{
        position: 'absolute', left: iconLeft, top: y + h / 2 - I / 2,
        transform: `scale(${1 + 0.1 * k})`, transformOrigin: 'center center',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: inside }}>
          <Icon name={icon} size={I} color={C.bg} sw={8} />
        </div>
        <div style={{ opacity: 1 - inside }}>
          <Icon name={icon} size={I} color={color} sw={8} />
        </div>
      </div>

      <div style={{
        position: 'absolute', left: figX, top: y + h / 2 - 23,
        transform: `scale(${1 + 0.16 * k})`, transformOrigin: 'left center',
      }}>
        <Odometer value={shown} prev={prev} prefix={prefix} size={T.lead - 6}
          step={step} color={color} group="in" />
        {note ? (
          <div style={{ marginTop: 7, opacity: clamp01(noteDraw), whiteSpace: 'nowrap' }}>
            <Txt size={T.micro} color={color} weight={700} track={1.6}>{note}</Txt>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* --------------------------------------------------- filling the baskets --- */

export type FlightFrom = { icon: IconName; x: number; y: number };
export type FlightTo = { x: number; y: number };

const CUB = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

/**
 * The five things, going into the two baskets.
 *
 * Each icon leaves its row in full colour — it has been sitting dimmed in the
 * table and has to be visible in flight — arcs over on its own path, and comes
 * down the last stretch dead vertical, because the basket is open at the top
 * and that is the only way into it. Launch order and arc height are jittered so
 * five things falling into a basket look like five things falling into a
 * basket, not a queue.
 */
export const flyT0 = (start: number, i: number, k: number, stagger = 6) =>
  start + i * stagger + k * 3 + Math.round(jitter(i * 7 + k * 31, 3));

export const BasketFlight: React.FC<{
  f: number; start: number; from: FlightFrom[]; to: FlightTo[];
  size?: number; dur?: number; stagger?: number;
}> = ({ f, start, from, to, size = 46, dur = 28, stagger = 6 }) => (
  <>
    {from.map((src, i) => to.map((dst, k) => {
      const seed = i * 7 + k * 31;
      const t0 = flyT0(start, i, k, stagger);
      const t = clamp01((f - t0) / dur);
      if (t <= 0 || t >= 1) return null;
      // rest-to-rest travel: no frame carries more than a fifth of the path
      const e = t * t * (3 - 2 * t);
      const wob = jitter(seed + 1, 90);
      const apex = Math.min(src.y, dst.y) - 250 - jitter(seed + 2, 70);
      const x = CUB(src.x, src.x + (dst.x - src.x) * 0.28 + wob, dst.x, dst.x, e);
      const y = CUB(src.y, apex, dst.y - 215, dst.y, e);
      const land = clamp01((e - 0.86) / 0.14);
      return (
        <div key={`${i}-${k}`} style={{
          position: 'absolute', left: x - size / 2, top: y - size / 2,
          transform: `rotate(${jitter(seed + 3, 46) * e}deg) scale(${lerp(1, 0.34, land) * lerp(0.92, 1, e)})`,
          transformOrigin: 'center center', opacity: 1 - land * 0.9,
        }}>
          <Icon name={src.icon} size={size} color={C.cost} sw={8} />
        </div>
      );
    }))}
  </>
);

export { lerp, clamp01 };
