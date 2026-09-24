// The productivity half of the answer, and its own measuring stick.
//
// Prices and wages are drawn in rupees. Output per worker is a different
// quantity, so it gets its own scale, indexed so India today is exactly 1 and
// America is 27. The construction is otherwise identical to the money bars:
// the bar grows from a fixed left edge, its icon rides the growing right edge
// from inside, and its figure rides just outside that edge and counts up with
// it, so the number can never finish ahead of the length.
import React from 'react';
import { C, T, SECTOR_GAP } from './tokens';
import { Txt, Chip, Flag, Odometer } from './kit';
import { Icon, IconName } from './icons';
import { WriteOn, WriteLayer } from './writeon';
import { withA, mixHex } from './priceb';
import { clamp01, lerp } from './anim';

export type Axis = { x: number; w: number; max: number };
/** The experiment's scale, and the by-sector scale. */
export const PAX: Axis = { x: 470, w: 1080, max: 28 };
export const SAX: Axis = { x: 520, w: 1010, max: 34 };
export const axAt = (a: Axis, v: number) => a.x + (Math.min(v, a.max) / a.max) * a.w;

const PTICKS = [1, 2, 5, 10, 15, 20, 25];

/** The output-per-worker scale. India today is one unit of it, by construction. */
export const ProdAxis: React.FC<{ y: number; draw: number; axis?: Axis; label?: string }> =
  ({ y, draw, axis = PAX, label }) => {
    const d = clamp01(draw);
    return (
      <>
        <div style={{ position: 'absolute', left: axis.x, top: y - 1, width: (axis.w + 26) * d, height: 2, background: C.hair }} />
        {PTICKS.filter((t) => t <= axis.max).map((t) => (
          <React.Fragment key={t}>
            <div style={{
              position: 'absolute', left: axAt(axis, t) - 1, top: y, width: 2, height: 11,
              background: C.hair, opacity: clamp01((d - 0.4) / 0.6),
            }} />
            <div style={{ position: 'absolute', left: axAt(axis, t) - 50, top: y + 18, width: 100, opacity: clamp01((d - 0.4) / 0.6) }}>
              <Txt size={T.micro} color={C.dim} weight={600} align="center" tabular>{t}×</Txt>
            </div>
          </React.Fragment>
        ))}
        {label ? (
          <div style={{ position: 'absolute', left: axis.x, top: y - 52, width: 860, opacity: clamp01((d - 0.5) / 0.5) }}>
            <Txt size={T.micro} color={C.muted} weight={700} track={2.6}>{label}</Txt>
          </div>
        ) : null}
      </>
    );
  };

const ICON = 42;

/**
 * A bar on a ratio scale. Same construction as the money bars: one `draw`
 * drives the length, the icon's seat on the right edge and the counter, so the
 * three cannot disagree, and `hi` is the accent used when the narration names
 * this figure.
 */
export const ProdBar: React.FC<{
  y: number; h?: number; axis?: Axis;
  value: number; prev?: number; color: string; icon: IconName;
  chip?: string; chipX?: number; chipW?: number; country?: 'in' | 'us'; flagX?: number;
  decimals?: number; note?: string; op?: number; hi?: number; mute?: number;
  /** hollow: the counterfactual, drawn as an outline rather than a solid */
  hollow?: number;
}> = ({
  y, h = 54, axis = PAX, value, prev, color, icon, chip, chipX = 80, chipW = 280,
  country, flagX = 372, decimals = 0, note, op = 1, hi = 0, mute = 0, hollow = 0,
}) => {
  const end = axAt(axis, value);
  const len = end - axis.x;
  /* same rule as the money bars: the length is never covered by its own icon */
  const fit = clamp01((len - (ICON + 8)) / 30);
  const iconLeft = lerp(end + 10, end - 12 - ICON, fit);
  const inside = fit * (1 - hollow);
  const figX = lerp(end + ICON + 24, end + 20, fit);
  const k = clamp01(hi);
  const rowOp = op * (1 - 0.52 * clamp01(mute));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: rowOp }}>
      {chip ? (
        <div style={{ position: 'absolute', left: chipX, top: y + h / 2 - 13, width: chipW }}>
          <Txt size={T.small} color={mixHex(C.muted, color, k)} weight={700} track={2.6} align="right">{chip}</Txt>
        </div>
      ) : null}
      {country ? <Flag country={country} x={flagX} y={y + h / 2 - 15} w={44} /> : null}
      <div style={{
        position: 'absolute', left: axis.x, top: y, height: h, borderRadius: 5,
        width: Math.max(len, 0),
        background: hollow > 0.5 ? withA(color, 0.16) : color,
        border: hollow > 0.5 ? `2px dashed ${color}` : undefined,
        boxSizing: 'border-box',
        transform: `scaleY(${1 + 0.16 * k})`, transformOrigin: 'center center',
        filter: k > 0.01 ? `brightness(${1 + 0.12 * k})` : undefined,
        boxShadow: k > 0.01 ? `0 0 ${36 * k}px ${withA(color, 0.6 * k)}` : undefined,
      }} />
      <div style={{
        position: 'absolute', left: iconLeft, top: y + h / 2 - ICON / 2,
        transform: `scale(${1 + 0.1 * k})`, transformOrigin: 'center center',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: inside }}>
          <Icon name={icon} size={ICON} color={C.bg} sw={8} />
        </div>
        <div style={{ opacity: 1 - inside }}>
          <Icon name={icon} size={ICON} color={color} sw={8} />
        </div>
      </div>
      <div style={{
        position: 'absolute', left: figX, top: y + h / 2 - 26,
        transform: `scale(${1 + 0.16 * k})`, transformOrigin: 'left center', whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Odometer value={value} prev={prev} size={42} step={decimals > 0 ? 0.1 : 1}
            decimals={decimals} color={color} />
          <Txt size={42} color={color} weight={800} lh={1}>×</Txt>
        </div>
        {note ? (
          <div style={{ marginTop: 2 }}>
            <Txt size={T.micro} color={color} weight={700} track={2}>{note}</Txt>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ------------------------------------------- the gap inside every sector -- */

/**
 * One sector, both countries, counted rather than measured: each dot is one
 * unit of output per worker, India's single dot beside America's block of
 * thirty-four. The ratio is the same one the bars carry, but a viewer can
 * check this one by eye.
 */
export const CapitalRow: React.FC<{
  y: number; icon: IconName; who: string; sector: number; draw: number;
}> = ({ y, icon, who, sector, draw }) => {
  const g = SECTOR_GAP[sector];
  const d = clamp01(draw);
  const shown = Math.round(d * g.x);
  const DOT = 19, GAP = 8, COLS = 17;
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: y + 4, opacity: d }}>
        <Icon name={icon} size={62} color={g.color} draw={d} />
      </div>
      <div style={{ position: 'absolute', left: 158, top: y + 12, width: 420, opacity: d }}>
        <Txt size={T.small} color={C.ink} weight={700} track={0.4}>{who}</Txt>
        <div style={{ marginTop: 3 }}>
          <Txt size={T.micro} color={g.color} weight={700} track={2.2}>{g.label}</Txt>
        </div>
      </div>

      {/* India: one */}
      <Flag country="in" x={620} y={y + 2} w={34} op={d} />
      <div style={{ position: 'absolute', left: 662, top: y + 6, opacity: d }}>
        <Txt size={T.micro} color={C.dim} weight={700} track={2}>IN</Txt>
      </div>
      <div style={{
        position: 'absolute', left: 620, top: y + 34, width: DOT, height: DOT,
        borderRadius: '50%', background: g.color, opacity: d,
      }} />

      {/* America: the same dot, that many times over */}
      <Flag country="us" x={760} y={y + 2} w={34} op={d} />
      <div style={{ position: 'absolute', left: 802, top: y + 6, opacity: d }}>
        <Txt size={T.micro} color={C.dim} weight={700} track={2}>US</Txt>
      </div>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: 760 + (i % COLS) * (DOT + GAP),
          top: y + 34 + Math.floor(i / COLS) * (DOT + GAP),
          width: DOT, height: DOT, borderRadius: '50%', background: g.color,
        }} />
      ))}
      <div style={{
        position: 'absolute', left: 760 + COLS * (DOT + GAP) + 26, top: y + 28,
        opacity: clamp01((d - 0.8) / 0.2), whiteSpace: 'nowrap',
      }}>
        <Txt size={38} color={g.color} weight={800} tabular>{g.x}×</Txt>
      </div>
    </>
  );
};

/** The bracket that says a distance is the whole point. */
export const GapBracket: React.FC<{
  x0: number; x1: number; y: number; value: string; label: string; color: string; draw: number;
}> = ({ x0, x1, y, value, label, color, draw }) => {
  const d = clamp01(draw);
  return (
    <>
      <WriteLayer>
        <WriteOn progress={d} color={color} strokeWidth={3}
          d={`M ${x0} ${y - 20} L ${x0} ${y} L ${x1} ${y} L ${x1} ${y - 20}`} />
      </WriteLayer>
      <div style={{
        position: 'absolute', left: (x0 + x1) / 2 - 400, top: y + 14, width: 800,
        textAlign: 'center', opacity: clamp01((d - 0.7) / 0.3),
      }}>
        <Txt size={56} color={color} weight={800} align="center" tabular>{value}</Txt>
        <div style={{ marginTop: 4 }}>
          <Txt size={T.small} color={C.muted} weight={700} track={2.2} align="center">{label}</Txt>
        </div>
      </div>
    </>
  );
};

export { lerp, Chip };
