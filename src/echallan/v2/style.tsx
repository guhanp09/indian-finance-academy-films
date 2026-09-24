/* V2 STYLE — the overhaul's visual grammar.
 *
 * The first pass drew UI panels on a flat road. This pass draws a WORLD: layered silhouettes with
 * atmospheric perspective, light that has a source and falls off, soft value ramps inside shapes,
 * and no keylines. The rules, stated once so every asset obeys them:
 *
 *   1. NO OUTLINES on world objects. Form comes from value: a lit face, a shaded face, a rim.
 *   2. DISTANCE IS COLOUR. Far layers are lighter, hazier and bluer; near layers are darker and more
 *      saturated. Recession is `haze()`, never opacity (rule: depth is drawn, not dissolved).
 *   3. LIGHT HAS A SOURCE. Every glow belongs to a lamp, a screen or a window, and it falls off
 *      into darkness — a halo needs room (rule: lights need room to glow).
 *   4. ONE FOCAL POINT. The brightest, most saturated, highest-contrast thing in frame is the
 *      subject; everything else is pushed down in value until it supports it.
 */
import React from 'react';
import { hash01, mix } from '../design';

export const P = {
  /* night sky, top to horizon */
  sky0: '#0E0B2E', sky1: '#1D1655', sky2: '#3A2677', sky3: '#6B3486', horizon: '#C2548E',
  /* skyline, far to near */
  city0: '#4A3A8A', city1: '#33296E', city2: '#211A4F', city3: '#140F33',
  /* lights */
  warm: '#FFC56A', warm2: '#FF9A55', lamp: '#FFE3A0', cool: '#7FE6FF',
  /* accents */
  teal: '#2FE3CF', cyan: '#52C8FF', pink: '#FF5E9C', violet: '#8A6CFF',
  amber: '#FFB23E', red: '#FF4D5E', green: '#3FE08A',
  /* the device */
  body: '#1A1D38', glass: '#0B0F24',
  /* skin & cloth */
  skin: '#F2B48E', skinShade: '#D48E6C', shirt: '#3E8BFF', shirtShade: '#2C66C9',
  hair: '#1C1433', trousers: '#262347',
} as const;

/** push a colour toward the atmosphere at `k` (0 near, 1 lost in haze) */
export const haze = (c: string, k: number, air: string = P.sky2) => mix(c, air, k);

let GID = 0;
const idCache = new Map<string, string>();
/** a stable id for a gradient definition keyed by its content */
export const gid = (key: string) => {
  let v = idCache.get(key);
  if (!v) { v = `v2g${(GID++).toString(36)}`; idCache.set(key, v); }
  return v;
};

export const LinGrad: React.FC<{ id: string; stops: [number, string, number?][];
  x1?: number; y1?: number; x2?: number; y2?: number; }> =
  ({ id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1 }) => (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
    </linearGradient>
  );

export const RadGrad: React.FC<{ id: string; stops: [number, string, number?][];
  cx?: number; cy?: number; r?: number; }> = ({ id, stops, cx = 0.5, cy = 0.5, r = 0.5 }) => (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
    </radialGradient>
  );

/** a light: a soft radial falloff, additive-looking, with a hot core. Alpha is for LIGHT. */
export const Light: React.FC<{ cx: number; cy: number; r: number; color: string; k?: number;
  core?: number; }> = ({ cx, cy, r, color, k = 1, core = 0.18 }) => {
  const id = gid(`light${color}${core}`);
  return (
    <g>
      <defs>
        <RadGrad id={id} stops={[[0, color, 0.55], [core, color, 0.30], [0.55, color, 0.08],
          [1, color, 0]]} />
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} opacity={k} />
    </g>
  );
};

/** a vertical value ramp fill for a shape: lit top -> base -> shaded foot */
export const rampId = (base: string, lit = 0.14, shade = 0.22) => {
  const id = gid(`ramp${base}${lit}${shade}`);
  return { id, def: (
    <LinGrad id={id} stops={[[0, mix(base, '#FFFFFF', lit)], [0.45, base],
      [1, mix(base, '#02010A', shade)]]} />
  ) };
};

/** deterministic star field */
export const Stars: React.FC<{ n: number; w: number; h: number; t: number; seed?: number;
  k?: number }> = ({ n, w, h, t, seed = 1, k = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = hash01(i, seed * 7) * w, y = hash01(i, seed * 13) * h;
      const r = 0.8 + hash01(i, seed * 17) * 1.9;
      const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + hash01(i, seed * 3) * 1.4) + hash01(i, 5) * 6.28);
      return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF"
        opacity={(0.25 + hash01(i, seed * 19) * 0.55) * tw * k} />;
    })}
  </g>
);
