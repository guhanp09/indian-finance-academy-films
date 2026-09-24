/* THE WORLD THE DEVICE SITS IN — phase 1-2's environment.
 *
 * A top-down road abstraction: the film opens on a moving world, not on a motionless tableau
 * (plan, FIRST-SECOND KINETIC DESIGN). It is a LOW-VOLUME NARRATOR (addendum §31): its motion is
 * event-driven, so when the challan lands the road visibly decelerates, which is what makes the
 * message feel physically consequential rather than decorative.
 *
 * Everything here is receded by COLOUR toward the ground and drawn opaque
 * (rule: depth is drawn, not dissolved) — no group alpha, so nothing ever reads through anything.
 */
import React from 'react';
import { C, H, S, W, breathe, hash01, mix } from '../design';
import { Label, Solid, lit, shade } from './kit';

/* lane dashes scroll UP; `scroll` is distance in px, supplied by the caller so the world can be
   decelerated by an event rather than running on its own clock. */
export const Road: React.FC<{
  scroll: number; ground: { deep: string; high: string; accent: string }; t: number;
  dim?: number;
}> = ({ scroll, ground, t, dim = 0 }) => {
  const G = ground.deep;
  const tarmac = mix('#1C2440', G, 0.16 + dim * 0.4);
  const paint = mix('#93A2C6', G, 0.34 + dim * 0.35);
  const kerb = mix('#222C48', G, 0.34 + dim * 0.4);

  const LANE_X = [150, 396, 684, 930];
  const PITCH = 210, DASH = 96;

  return (
    <g>
      {/* carriageway */}
      <rect x={72} y={-40} width={W - 144} height={H + 80} fill={tarmac} />
      {/* kerbs — a thickness, so the road is a surface and not a fill */}
      <rect x={72} y={-40} width={14} height={H + 80} fill={shade(kerb, 0.2)} />
      <rect x={W - 86} y={-40} width={14} height={H + 80} fill={lit(kerb, 0.08)} />
      <rect x={86} y={-40} width={5} height={H + 80} fill={lit(tarmac, 0.10)} />
      <rect x={W - 91} y={-40} width={5} height={H + 80} fill={shade(tarmac, 0.35)} />

      {/* lane dashes */}
      {LANE_X.map((lx, li) => (
        <g key={lx}>
          {Array.from({ length: Math.ceil((H + PITCH * 2) / PITCH) }, (_, i) => {
            const y = ((i * PITCH - (scroll * (li === 0 || li === 3 ? 0.86 : 1)) % PITCH) + PITCH)
              % (H + PITCH * 2) - PITCH;
            return (
              <rect key={i} x={lx} y={y} width={13} height={DASH} rx={6.5}
                fill={li === 0 || li === 3 ? shade(paint, 0.24) : paint} />
            );
          })}
        </g>
      ))}

      {/* GPS grid: a faint survey lattice over the whole world, breathing aperiodically */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          {Array.from({ length: 16 }, (_, j) => {
            const cx = 60 + i * 120, cy = 40 + j * 124;
            const k = 0.9 + breathe(t, i * 17 + j, 0.42) * 0.35;
            return <circle key={j} cx={cx} cy={cy} r={2.1 * k}
              fill={mix(ground.accent, G, 0.62 + dim * 0.3)} />;
          })}
        </g>
      ))}
    </g>
  );
};

/* ── TRAFFIC SIGNAL ─────────────────────────────────────────────────────────────────────────
   Diagnostic details: the rounded housing with a visor over each lamp, and three lamps stacked.
   Without the visors it is three dots in a box. */
export const Signal: React.FC<{
  x: number; y: number; s: number; phase: number; ground: string; depth?: number;
}> = ({ x, y, s, phase, ground, depth = 0.45 }) => {
  const body = mix('#28324E', ground, depth);
  const lamps = [C.red, C.amber, C.green];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Solid x={0} y={0} w={44} h={112} r={10} base={body} litK={0.14} shadeK={0.22} />
      <rect x={19} y={112} width={6} height={54} fill={shade(body, 0.3)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {/* lamps CROSS-FADE; a hard switch is a one-frame step, and a real lamp has a filament */}
          <circle cx={22} cy={22 + i * 34} r={12} fill={shade(body, 0.42)} />
          <circle cx={22} cy={22 + i * 34} r={12}
            fill={mix(lamps[i], ground, depth * 0.35)}
            opacity={Math.max(0, 1 - Math.abs(phase - i) * 3.4)} />
          <circle cx={22} cy={22 + i * 34} r={17} fill={lamps[i]}
            opacity={0.14 * Math.max(0, 1 - Math.abs(phase - i) * 3.4)} />
          {/* visor */}
          <path d={`M8 ${13 + i * 34} q14 -7 28 0`} fill="none" stroke={shade(body, 0.36)}
            strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

/* ── CITY BLOCK ─────────────────────────────────────────────────────────────────────────────
   Buildings at the frame's outer edges. Diagnostic detail: a window grid with a few lit cells —
   an unlit slab is a rectangle, a slab with four lit windows is a building at night. */
export const Block: React.FC<{
  x: number; y: number; w: number; h: number; seed: number; ground: string; depth: number;
}> = ({ x, y, w, h, seed, ground, depth }) => {
  const body = mix('#20294A', ground, depth);
  const cols = Math.max(2, Math.floor(w / 26)), rows = Math.max(3, Math.floor(h / 34));
  return (
    <g>
      <Solid x={x} y={y} w={w} h={h} r={4} base={body} litK={0.12} shadeK={0.24} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const on = hash01(seed * 131 + r * 17 + c, 7) > 0.74;
          return (
            <rect key={`${r}-${c}`} x={x + 8 + c * ((w - 16) / cols)} y={y + 12 + r * ((h - 20) / rows)}
              width={(w - 16) / cols - 7} height={(h - 20) / rows - 11} rx={1.5}
              fill={on ? mix(C.yellow, ground, 0.34 + depth * 0.4) : shade(body, 0.30)} />
          );
        }))}
    </g>
  );
};

/** The whole outer world for the opening: road, kerbside blocks, one signal, one distant vehicle. */
export const RoadWorld: React.FC<{
  t: number; scroll: number; ground: { deep: string; high: string; accent: string }; dim?: number;
}> = ({ t, scroll, ground, dim = 0 }) => (
  <g>
    <Road scroll={scroll} ground={ground} t={t} dim={dim} />
    <Block x={-18} y={132} w={92} h={300} seed={3} ground={ground.deep} depth={0.52 + dim * 0.3} />
    <Block x={-26} y={470} w={104} h={240} seed={9} ground={ground.deep} depth={0.58 + dim * 0.3} />
    <Block x={W - 78} y={1180} w={100} h={330} seed={21} ground={ground.deep} depth={0.55 + dim * 0.3} />
    <Block x={W - 70} y={210} w={86} h={220} seed={33} ground={ground.deep} depth={0.62 + dim * 0.3} />
    {/* the cycle is continuous, so the crossfade above has something to interpolate */}
    <Signal x={96} y={1508} s={0.9} phase={(t / 3.7) % 3}
      ground={ground.deep} depth={0.46 + dim * 0.3} />
  </g>
);
