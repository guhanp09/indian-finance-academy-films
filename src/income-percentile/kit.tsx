// The film's objects: a 100-dot population field, a fixed-ceiling cash meter
// built from layered banknotes, the odometer that reads them out, and the
// braces that make "left" and "short" spatially explicit.
//
// Nothing here decides *when* anything happens; scenes pass a single
// progress-derived value so a number and its graphic cannot disagree.
import React from 'react';
import { C, T, METER, FONT } from './tokens';
import { jitter, clamp01, lerp } from './anim';
import { wheelPos } from './odo';
import { WriteOn, WriteLayer, circlePath, arcPath } from './writeon';

/* ------------------------------------------------------------------ text -- */

export const Txt: React.FC<{
  children: React.ReactNode; size: number; color?: string; weight?: number;
  track?: number; align?: 'left' | 'center' | 'right'; tabular?: boolean; lh?: number;
}> = ({ children, size, color = C.ink, weight = 600, track = 0, align = 'left', tabular, lh = 1.12 }) => (
  <div style={{
    fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: lh,
    letterSpacing: track, textAlign: align,
    fontVariantNumeric: tabular ? 'tabular-nums' : undefined,
  }}>{children}</div>
);

export const At: React.FC<{
  x: number; y: number; w?: number; op?: number; children: React.ReactNode; s?: number;
}> = ({ x, y, w, op = 1, s = 1, children }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, opacity: op,
    transform: s === 1 ? undefined : `scale(${s})`, transformOrigin: 'left top',
  }}>{children}</div>
);

export const Chip: React.FC<{ x: number; y: number; text: string; op?: number; color?: string; draw?: number }> =
  ({ x, y, text, op = 1, color = C.muted, draw = 1 }) => (
    <div style={{ position: 'absolute', left: x, top: y, opacity: op, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 26 * clamp01(draw), height: 2, background: color }} />
      <Txt size={T.label} color={color} weight={700} track={6.5}>{text}</Txt>
    </div>
  );

/** A value with its unit, so a viewer arriving mid-film knows it is monthly. */
export const Money: React.FC<{
  value: string; size: number; color: string; weight?: number; unit?: string; align?: 'left' | 'right';
}> = ({ value, size, color, weight = 800, unit = '/month', align = 'left' }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 1, whiteSpace: 'nowrap',
    justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    fontFamily: FONT, color, fontVariantNumeric: 'tabular-nums',
  }}>
    <span style={{ fontSize: size, fontWeight: weight, lineHeight: 1 }}>{value}</span>
    {unit ? <span style={{ fontSize: size * 0.6, fontWeight: 700, lineHeight: 1, opacity: 0.88 }}>{unit}</span> : null}
  </div>
);

/* -------------------------------------------------------------- odometer -- */

const DIGIT_W = 0.60, COMMA_W = 0.30, CELL = 1.16;

const Wheel: React.FC<{ pos: number; size: number; color: string; weight: number; blur: number }> =
  ({ pos, size, color, weight, blur }) => {
    const cell = size * CELL;
    const d = Math.floor(pos);
    const frac = pos - d;
    const at = (k: number) => ((d + k) % 10 + 10) % 10;
    return (
      <div style={{
        position: 'relative', width: size * DIGIT_W, height: cell, overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-frac * cell}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
          {[-1, 0, 1].map((k) => (
            <div key={k} style={{
              position: 'absolute', top: k * cell, left: 0, width: '100%', height: cell,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT, fontSize: size, fontWeight: weight, color,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{at(k)}</div>
          ))}
        </div>
      </div>
    );
  };

const Glyph: React.FC<{ ch: string; size: number; color: string; weight: number; w: number }> =
  ({ ch, size, color, weight, w }) => (
    <div style={{
      width: size * w, height: size * CELL, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: 1,
    }}>{ch}</div>
  );

const groupIN = (v: number) => {
  const s = String(Math.round(Math.abs(v)));
  if (s.length <= 3) return s;
  return `${s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${s.slice(-3)}`;
};

/**
 * Rolling-counter statistic. Only the lowest live wheel spins freely; wheels
 * above it move only while the wheel below is carrying, which is what makes it
 * read as a mechanical drum rather than digits scrambling independently.
 */
export const Odometer: React.FC<{
  value: number; prev?: number; prefix?: string; suffix?: string; size: number; step?: number;
  color?: string; weight?: number;
  /** Indian digit grouping — ₹3,74,000 reads as lakhs, ₹374,000 does not. */
  group?: 'en' | 'in';
  /** Fixed decimal places. With `step` at 0.1 the tenths wheel is the one that
   *  spins freely, so 1.0× -> 1.7× rolls exactly like a money drum. */
  decimals?: number;
}> = ({
  value, prev, prefix, suffix, size, step = 100,
  color = C.ink, weight = 800, group = 'en', decimals = 0,
}) => {
  const u = Math.max(value, 0) / step;
  const uPrev = Math.max(prev ?? value, 0) / step;
  const shown = Math.round(u) * step;
  const posOf = wheelPos;
  const text = decimals > 0 ? shown.toFixed(decimals)
    : group === 'in' ? groupIN(shown) : Math.round(shown).toLocaleString('en-US');
  const tail = Math.max(0, Math.round(Math.log10(step)));
  const chars = text.split('');
  let place = 0;
  const out: React.ReactNode[] = [];
  for (let i = chars.length - 1; i >= 0; i--) {
    const ch = chars[i];
    if (ch === ',' || ch === '.') {
      out.unshift(<Glyph key={i} ch={ch} size={size} color={color} weight={weight} w={COMMA_W} />);
      continue;
    }
    if (place < tail) {
      out.unshift(<Glyph key={i} ch={ch} size={size} color={color} weight={weight} w={DIGIT_W} />);
    } else {
      const k = place - tail;
      const pos = posOf(u, k);
      const b = Math.min(8, Math.abs(pos - posOf(uPrev, k)) * 2.4);
      out.unshift(<Wheel key={i} pos={pos} size={size} color={color} weight={weight} blur={b} />);
    }
    place++;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {prefix ? <Glyph ch={prefix} size={size * 0.78} color={color} weight={weight} w={DIGIT_W * 1.05} /> : null}
      {out}
      {suffix ? (
        <span style={{
          fontFamily: FONT, fontSize: size * 0.42, fontWeight: 700, color, opacity: 0.86,
          alignSelf: 'flex-end', paddingBottom: size * 0.16,
        }}>{suffix}</span>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------- dot field -- */

export type Band = { upTo: number; color: string };

const bandOf = (k: number, bands: Band[]) => {
  for (const b of bands) if (k < b.upTo) return b.color;
  return C.unreached;
};

export const DotField: React.FC<{
  x: number; bottom: number; cell: number; r: number;
  fill: number; bands: Band[]; op?: number; dim?: number; appear?: number; write?: number;
}> = ({ x, bottom, cell, r, fill, bands, op = 1, dim = 0, appear = 1, write = 1 }) => {
  const top = bottom - cell * 10;
  if (write < 0.999) {
    // un-drawing: each dot is a stroked arc wide enough to read as a filled
    // disc, so it erases like a pen lifting rather than dissolving
    return (
      <svg style={{ position: 'absolute', left: x, top, overflow: 'visible', opacity: op }}
        width={cell * 10} height={cell * 10}>
        {Array.from({ length: 100 }).map((_, k) => {
          const p = clamp01(write * 1.5 - (k / 100) * 0.5);
          if (p <= 0.001) return null;
          const row = 9 - Math.floor(k / 10), col = k % 10;
          const t = clamp01(fill - k);
          return (
            <WriteOn key={k} progress={p} strokeWidth={r}
              color={t > 0.001 ? bandOf(k, bands) : C.unreached}
              d={circlePath(col * cell + cell / 2, row * cell + cell / 2, r / 2)} />
          );
        })}
      </svg>
    );
  }
  return (
    <div style={{ position: 'absolute', left: x, top, width: cell * 10, height: cell * 10, opacity: op }}>
      {Array.from({ length: 100 }).map((_, k) => {
        const row = 9 - Math.floor(k / 10);
        const col = k % 10;
        const t = clamp01(fill - k);
        const born = clamp01(appear * 1.4 - (k / 100) * 0.4);
        if (born <= 0) return null;
        const size = r * 2 * lerp(0.84, 1, t) * lerp(0.4, 1, born);
        return (
          <div key={k} style={{
            position: 'absolute',
            left: col * cell + (cell - size) / 2,
            top: row * cell + (cell - size) / 2,
            width: size, height: size, borderRadius: '50%',
            background: t > 0.001 ? bandOf(k, bands) : C.unreached,
            opacity: (t > 0.001 ? lerp(0.35, 1, t) : 1) * (1 - dim * 0.62) * born,
          }} />
        );
      })}
    </div>
  );
};

/* ----------------------------------------------------------- the meter --- */

export type Zone = { to: number; color: string };
export type MoneyState = { from: number; to: number; color: string };

/**
 * Screen y of a meter fraction. `vHi` is the fraction of the meter sitting at
 * the top of the reference band: 1 shows the whole ceiling, 0.12 pushes in on
 * the bottom eighth. The meter above simply runs off the top of the frame — it
 * is never faded, masked or truncated, so nothing can end up labelled that is
 * not there.
 */
export const yAt = (v: number, vHi = 1, base = METER.base, band = METER.band) =>
  base - (v / vHi) * band;

/**
 * A fixed-ceiling stack of layered banknotes. The ceiling never changes; the
 * window onto it does, so pushing in on the low thresholds enlarges the bottom
 * of the meter without ever implying the meter ends there.
 */
export type Hatch = { from: number; to: number; kind: 'cost' | 'tax' };

const HATCH: Record<'cost' | 'tax', string> = {
  cost: `repeating-linear-gradient(45deg, ${C.costSoft} 0 5px, rgba(0,0,0,0) 5px 15px)`,
  tax: `repeating-linear-gradient(-45deg, ${C.taxSoft} 0 4px, rgba(0,0,0,0) 4px 14px)`,
};

/**
 * A fixed-ceiling stack of layered banknotes.
 *
 * Claims on the income — living cost, tax — are drawn as hatching *over* the
 * notes rather than as a fill replacing them, so the percentile ladder stays
 * readable underneath and the viewer can see exactly which rungs the cost eats
 * through. Above the income under discussion the notes stay in their own
 * colours at reduced strength: present and identifiable, visibly not yours.
 */
export const Meter: React.FC<{
  x?: number; w?: number; base?: number; band?: number; pitch?: number;
  vHi?: number; zones: Zone[]; hatch?: Hatch[];
  active?: number; reveal?: number; op?: number;
  /** 'neutral' hides zone colours above the income earned so far, so a
   *  threshold is never revealed before it is narrated. Used only while the
   *  percentile ladder is still being built. */
  aboveMode?: 'neutral' | 'band';
}> = ({
  x = METER.x, w = METER.w, base = METER.base, band = METER.band, pitch = METER.pitch,
  vHi = 1, zones, hatch = [], active = 1, reveal = 1, op = 1, aboveMode = 'band',
}) => {
  const screenH = band / vHi;                    // the whole ceiling, in screen px
  const n = Math.min(Math.ceil(screenH / pitch), Math.ceil(base / pitch) + 2);
  const shown = Math.round(clamp01(reveal) * n);
  /* Two situations produce the same picture and must therefore produce the
     same pixels: a note above the income under discussion while the ladder is
     still being built, and a note above the highest line the film ever names.
     Both are "paper this film has not labelled", both are drawn in C.noteTop at
     the same strength — so nothing in the stack can appear to change colour
     merely because one scene handed over to the next. */
  const colourAt = (v: number, above: boolean) => {
    if (above && aboveMode === 'neutral') return C.noteTop;
    for (const z of zones) if (v < z.to) return z.color;
    return C.noteTop;
  };
  return (
    <div style={{
      position: 'absolute', left: x, top: base - band, width: w, height: band,
      overflow: 'visible', opacity: op,
    }}>
      {Array.from({ length: shown }).map((_, i) => {
        const v = ((i + 0.5) * pitch) / screenH;
        const above = v > active + 1e-6;
        const col = colourAt(v, above);
        const unnamed = col === C.noteTop;
        return (
          <div key={i} style={{
            position: 'absolute', left: jitter(i, 2.6), bottom: i * pitch,
            width: w, height: pitch - 2, borderRadius: 2,
            background: col,
            opacity: unnamed ? 0.32 : 1,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 0 rgba(0,0,0,0.34)',
          }}>
            <div style={{
              position: 'absolute', left: w * 0.33, top: (pitch - 2) / 2 - 1,
              width: w * 0.34, height: 2, background: 'rgba(0,0,0,0.20)', borderRadius: 1,
            }} />
          </div>
        );
      })}
      {hatch.map((h, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, width: w,
          bottom: h.from * screenH, height: Math.max(0, (h.to - h.from) * screenH),
          backgroundImage: HATCH[h.kind], pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
};

/**
 * A level on the meter. One construction for every level in the film — income
 * thresholds and the cost floor alike: a dot on the note edge, a straight rule
 * out to the lane, the value and its unit. No variants, so nothing reads as a
 * different kind of thing.
 */
export const MeterMarker: React.FC<{
  v: number; vHi?: number; value: string; label?: string; color: string;
  x?: number; stackX?: number; stackW?: number; base?: number; band?: number;
  op?: number; labelOp?: number; draw?: number; scale?: number; size?: number;
  unit?: string; side?: 'right' | 'left';
  /** Where the block sits against its own rule. Two levels a few percent apart
   *  — a cost floor and the threshold beside it — keep their own dot and rule
   *  and step apart vertically, one sitting on its rule and one hanging under
   *  it, so neither label is ever detached from the level it names. */
  anchor?: 'middle' | 'above' | 'below';
}> = ({
  v, vHi = 1, value, label, color, x, stackX = METER.x, stackW = METER.w,
  base = METER.base, band = METER.band, op = 1, labelOp = 1, draw = 1, scale = 1,
  size = 34, unit = '/month', side = 'right', anchor = 'middle',
}) => {
  const y = yAt(v, vHi, base, band);
  if (y < 176 || y > base + 40) return null;         // off-frame levels stay silent
  const left = side === 'left';
  const lx = x ?? (left ? METER.braceX : METER.markerX);
  const x0 = left ? stackX : stackX + stackW;
  const d = clamp01(draw);
  const runW = Math.abs(x0 - lx) + 8;
  const blockH = size + (label ? 26 : 0);
  const blockTop = anchor === 'above' ? y - blockH - 7 : anchor === 'below' ? y + 7 : y - blockH / 2;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <div style={{
        position: 'absolute', left: left ? x0 + 8 - runW * d : x0 - 8, top: y - 1,
        width: runW * d, height: 2, background: color,
      }} />
      <div style={{
        position: 'absolute', left: left ? x0 - 11 : x0 + 1, top: y - 5,
        width: 10, height: 10, borderRadius: '50%', background: color, opacity: d > 0.05 ? 1 : 0,
      }} />
      <div style={{
        position: 'absolute', left: left ? lx - 312 : lx + 12, top: blockTop,
        width: left ? 300 : undefined, opacity: clamp01((d - 0.55) / 0.45),
        transform: `scale(${scale})`, transformOrigin: left ? 'right center' : 'left center',
        whiteSpace: 'nowrap',
      }}>
        <Money value={value} unit={unit} size={size} color={color} align={left ? 'right' : 'left'} />
        {label ? (
          <div style={{ marginTop: 7, opacity: labelOp }}>
            <Txt size={T.micro} color={color} weight={700} track={2.6} align={left ? 'right' : 'left'}>{label}</Txt>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** The explicit magnitude of a gap: a bracket spanning the exact interval,
 *  traced on, with a straight stub out to its figure. */
export const Brace: React.FC<{
  v0: number; v1: number; vHi?: number; value: string; label: string; color: string;
  x?: number; base?: number; band?: number; draw?: number; op?: number; unit?: string;
  side?: 'left' | 'right'; labelW?: number;
}> = ({
  v0, v1, vHi = 1, value, label, color, x = METER.braceX, base = METER.base, band = METER.band,
  draw = 1, op = 1, unit = '', side = 'left', labelW = 300,
}) => {
  const yLo = Math.min(base + 40, yAt(Math.min(v0, v1), vHi, base, band));
  const yHi = Math.max(150, yAt(Math.max(v0, v1), vHi, base, band));
  const ym = (yLo + yHi) / 2;
  const d = clamp01(draw);
  const CAP = 24, STUB = 26;
  const sgn = side === 'left' ? 1 : -1;
  const spine = `M ${x + CAP * sgn} ${yHi} L ${x} ${yHi} L ${x} ${yLo} L ${x + CAP * sgn} ${yLo}`;
  const stub = `M ${x} ${ym} L ${x - STUB * sgn} ${ym}`;
  const right = side === 'right';
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <WriteLayer>
        <WriteOn d={spine} progress={d} color={color} strokeWidth={3} />
        <WriteOn d={stub} progress={clamp01((d - 0.6) / 0.4)} color={color} strokeWidth={3} strokeLinecap="butt" />
      </WriteLayer>
      <div style={{
        position: 'absolute',
        left: right ? x + STUB + 14 : x - STUB - 14 - labelW, top: ym - 34, width: labelW,
        opacity: clamp01((d - 0.75) / 0.25), textAlign: right ? 'left' : 'right',
      }}>
        <div style={{ display: 'flex', justifyContent: right ? 'flex-start' : 'flex-end' }}>
          <Money value={value} unit={unit} size={38} color={color} align={right ? 'left' : 'right'} />
        </div>
        <div style={{ marginTop: 6 }}>
          <Txt size={T.micro} color={color} weight={700} track={3} align={right ? 'left' : 'right'}>{label}</Txt>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------- free-standing stacks --- */

/** A stack of notes that is not a meter — used for wages in the explanation. */
export const NoteStack: React.FC<{
  x: number; base: number; w: number; full: number; h: number;
  pitch?: number; color?: string; op?: number; reveal?: number;
}> = ({ x, base, w, full, h, pitch = 11, color = C.note, op = 1 }) => {
  const vis = clamp01(h) * full;
  const n = Math.ceil(vis / pitch);
  return (
    <div style={{ position: 'absolute', left: x, top: base - vis, width: w, height: vis, overflow: 'hidden', opacity: op }}>
      {Array.from({ length: Math.max(n, 0) }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: jitter(i, 2.2), bottom: i * pitch, width: w, height: pitch - 2,
          background: color, borderRadius: 2,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 0 rgba(0,0,0,0.34)',
        }} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ ring -- */

/** A composition ring. Segments are traced on in order, so the chart is built
 *  rather than presented. */
export const Ring: React.FC<{
  cx: number; cy: number; r: number; thickness: number;
  shares: number[]; colors: string[]; draw?: number; dim?: number[]; gapDeg?: number;
}> = ({ cx, cy, r, thickness, shares, colors, draw = 1, dim = [], gapDeg = 2.5 }) => {
  const total = shares.reduce((a, b) => a + b, 0) || 1;
  let a0 = 0;
  const segs = shares.map((sh, i) => {
    const sweep = (sh / total) * 360;
    const seg = { i, a0: a0 + gapDeg / 2, a1: a0 + sweep - gapDeg / 2 };
    a0 += sweep;
    return seg;
  });
  const d = clamp01(draw);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.hair} strokeWidth={thickness} />
      {segs.map((s2) => {
        const share = s2.i / Math.max(segs.length, 1);
        const p = clamp01((d - share * 0.35) / (1 - share * 0.35 || 1));
        if (s2.a1 <= s2.a0) return null;
        return (
          <WriteOn key={s2.i} progress={p} strokeWidth={thickness} strokeLinecap="butt"
            color={colors[s2.i]} opacity={dim[s2.i] ? 1 - dim[s2.i] * 0.72 : 1}
            d={arcPath(cx, cy, r, s2.a0, s2.a1)} />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ flag -- */

/** Orientation aid under each meter. Small, never a decorative colour wash. */
export const Flag: React.FC<{ country: 'in' | 'us'; x: number; y: number; w?: number; op?: number; draw?: number }> =
  ({ country, x, y, w = 64, op = 1, draw = 1 }) => {
    const h = w * 0.66;
    const d = clamp01(draw);
    return (
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: op * d, overflow: 'hidden', borderRadius: 2 }}>
        <svg width={w} height={h} viewBox="0 0 30 20" style={{ display: 'block' }}>
          {country === 'in' ? (
            <>
              <rect x="0" y="0" width="30" height="6.67" fill="#FF9933" />
              <rect x="0" y="6.67" width="30" height="6.66" fill="#F7F4EC" />
              <rect x="0" y="13.33" width="30" height="6.67" fill="#138808" />
              <circle cx="15" cy="10" r="2.5" fill="none" stroke="#0A3D91" strokeWidth="0.7" />
              <circle cx="15" cy="10" r="0.6" fill="#0A3D91" />
            </>
          ) : (
            <>
              {Array.from({ length: 7 }).map((_, i) => (
                <rect key={i} x="0" y={i * 2.857} width="30" height="2.857" fill={i % 2 ? '#F7F4EC' : '#B22234'} />
              ))}
              <rect x="0" y="0" width="13" height="10" fill="#3C3B6E" />
              {Array.from({ length: 9 }).map((_, i) => (
                <circle key={i} cx={2.6 + (i % 3) * 4} cy={2.4 + Math.floor(i / 3) * 2.8} r="0.72" fill="#F7F4EC" />
              ))}
            </>
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(243,240,232,0.22)', borderRadius: 2 }} />
      </div>
    );
  };

/* ------------------------------------------------------------ background -- */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export const Backdrop: React.FC<{ glowY?: number }> = ({ glowY = 52 }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: C.bg }} />
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 62% 34% at 50% ${glowY}%, rgba(96,146,196,0.085), rgba(14,22,33,0) 72%)`,
    }} />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, opacity: 0.055, mixBlendMode: 'overlay' }} />
  </>
);
