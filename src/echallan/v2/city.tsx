/* THE CITY AT NIGHT — the world the film opens in, and the backdrop it keeps.
 *
 * Replaces the flat top-down road. Four skyline planes with atmospheric perspective (far planes
 * lighter and bluer, near planes darker and warmer-windowed), a horizon glow the sky falls toward,
 * stars, and street furniture in the foreground. Every building is seeded, so the city is the same
 * city in every frame and every render.
 */
import React from 'react';
import { H, W, hash01, lerp, mix } from '../design';
import { LinGrad, Light, P, RadGrad, Stars, gid, haze } from './style';

export const Sky: React.FC<{ t: number; horizonY?: number; k?: number }> = ({ t, horizonY = 1200, k = 1 }) => {
  const id = gid('skyV2');
  const hz = gid('horizonGlow');
  return (
    <g>
      <defs>
        <LinGrad id={id} stops={[[0, P.sky0], [0.38, P.sky1], [0.72, P.sky2], [0.9, P.sky3],
          [1, P.horizon]]} />
        <RadGrad id={hz} cx={0.5} cy={1} r={0.9}
          stops={[[0, P.horizon, 0.55], [0.4, P.sky3, 0.25], [1, P.sky2, 0]]} />
      </defs>
      {/* the gradient keeps its own proportions; above it, the zenith colour continues seamlessly
          for any camera move that looks higher */}
      <rect x={-400} y={-200} width={W + 800} height={horizonY + 200} fill={`url(#${id})`} />
      <rect x={-400} y={-2400} width={W + 800} height={2201} fill={P.sky0} />
      <ellipse cx={W / 2} cy={horizonY} rx={W * 0.95} ry={520} fill={`url(#${hz})`} />
      <Stars n={120} w={W + 200} h={horizonY * 0.62} t={t} k={k} />
    </g>
  );
};

/* a building: a silhouette with ONE diagnostic detail per type — a stepped crown, an antenna, a
   water tank, a flat block — and a seeded window grid in which only some cells are lit */
type BType = 'block' | 'step' | 'spire' | 'tank';
const Building: React.FC<{
  x: number; base: number; w: number; h: number; type: BType; body: string; lit: string;
  seed: number; winK: number; t: number;
}> = ({ x, base, w, h, type, body, lit, seed, winK, t }) => {
  const y = base - h;
  const cols = Math.max(2, Math.round(w / 22)), rows = Math.max(3, Math.round(h / 30));
  const cw = w / cols, rh = (h - 24) / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h + 400} fill={body} />
      {/* the face nearer the horizon glow picks up a little light: a rim, not an outline */}
      <rect x={x} y={y} width={Math.max(2, w * 0.06)} height={h + 400}
        fill={mix(body, P.horizon, 0.18)} />
      {type === 'step' && <rect x={x + w * 0.18} y={y - h * 0.08} width={w * 0.64} height={h * 0.08 + 1} fill={body} />}
      {type === 'step' && <rect x={x + w * 0.34} y={y - h * 0.14} width={w * 0.32} height={h * 0.06 + 1} fill={body} />}
      {type === 'spire' && (
        <g>
          <rect x={x + w / 2 - 2} y={y - h * 0.22} width={4} height={h * 0.22} fill={body} />
          <circle cx={x + w / 2} cy={y - h * 0.22} r={3.2}
            fill={P.red} opacity={0.4 + 0.6 * (Math.sin(t * 2.2 + seed) > 0.4 ? 1 : 0.15)} />
        </g>
      )}
      {type === 'tank' && (
        <g>
          <rect x={x + w * 0.58} y={y - 22} width={w * 0.26} height={18} rx={4} fill={body} />
          <rect x={x + w * 0.62} y={y - 5} width={3} height={6} fill={body} />
          <rect x={x + w * 0.78} y={y - 5} width={3} height={6} fill={body} />
        </g>
      )}
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const hv = hash01(seed * 97 + r * 13 + c, 3);
        /* windows come in FLOORS that are lived in, not a uniform scatter */
        const floorOn = hash01(seed * 53 + r, 11) < 0.55;
        if (hv > winK || !floorOn) return null;
        /* a few windows change over the film — a city is lived in, not painted */
        const flick = hash01(seed * 31 + r * 7 + c, 9) > 0.93
          ? (Math.sin(t * 0.3 + seed + r) > 0 ? 1 : 0.2) : 1;
        return (
          <rect key={`${r}-${c}`} x={x + c * cw + cw * 0.28} y={y + 16 + r * rh}
            width={cw * 0.44} height={rh * 0.46} rx={1}
            fill={hv < winK * 0.18 ? P.cool : lit} opacity={(0.55 + hv * 0.45) * flick} />
        );
      }))}
    </g>
  );
};

/* one skyline plane: a seeded row of buildings across the width, with a band of mist at its foot
   so it separates from the plane in front of it */
export const Skyline: React.FC<{
  base: number; minH: number; maxH: number; body: string; lit: string; seed: number;
  winK: number; t: number; dx?: number; gap?: number; mist?: string; mistH?: number;
}> = ({ base, minH, maxH, body, lit, seed, winK, t, dx = 0, gap = 6, mist, mistH = 180 }) => {
  const mid = gid(`mist${mist}${mistH}`);
  const out: React.ReactNode[] = [];
  let x = -160 + dx;
  let i = 0;
  const types: BType[] = ['block', 'step', 'block', 'spire', 'block', 'tank'];
  while (x < W + 160) {
    const w = 60 + hash01(i, seed) * 110;
    const h = lerp(minH, maxH, Math.pow(hash01(i, seed + 5), 1.4));
    out.push(<Building key={i} x={x} base={base} w={w} h={h} type={types[Math.floor(hash01(i, seed + 9) * types.length)]}
      body={body} lit={lit} seed={seed * 100 + i} winK={winK} t={t} />);
    x += w + gap + hash01(i, seed + 3) * 18;
    i++;
  }
  return (
    <g>
      {out}
      {mist && (
        <>
          <defs><LinGrad id={mid} stops={[[0, mist, 0], [1, mist, 0.92]]} /></defs>
          <rect x={-200} y={base - mistH} width={W + 400} height={mistH} fill={`url(#${mid})`} />
          <rect x={-200} y={base} width={W + 400} height={600} fill={mist} opacity={0.92} />
        </>
      )}
    </g>
  );
};

/* the street: kerb, pavement and the road surface, seen low and near, with reflections of the
   lights in it — a surface you could stand on, not a map */
export const Street: React.FC<{ y: number; t: number }> = ({ y, t }) => {
  const road = gid('roadV2');
  return (
    <g>
      <defs>
        <LinGrad id={road} stops={[[0, '#2A2356'], [0.35, '#1B1640'], [1, '#0D0A24']]} />
      </defs>
      {/* pavement */}
      <rect x={-200} y={y} width={W + 400} height={60} fill="#2F2862" />
      <rect x={-200} y={y} width={W + 400} height={5} fill="#4B3F88" />
      {/* kerb face */}
      <rect x={-200} y={y + 60} width={W + 400} height={18} fill="#1C173F" />
      {/* road */}
      <rect x={-200} y={y + 78} width={W + 400} height={H} fill={`url(#${road})`} />
      {/* the wet sheen of the road, carrying the city's light down into the foreground */}
      <rect x={-200} y={y + 78} width={W + 400} height={120} fill={P.horizon} opacity={0.08} />
      {/* lane markings, in perspective: they get wider as they come toward camera */}
      {Array.from({ length: 7 }, (_, i) => {
        const u = ((i / 7 + t * 0.018) % 1);
        const x = lerp(-120, W + 120, u);
        return <rect key={i} x={x} y={y + 250} width={110} height={10} rx={5}
          fill="#6E62B8" opacity={0.55} />;
      })}
    </g>
  );
};

export const Streetlight: React.FC<{ x: number; y: number; h: number; on?: number }> =
  ({ x, y, h, on = 1 }) => (
    <g>
      <Light cx={x + 60} cy={y - h - 10} r={520} color={P.lamp} k={0.75 * on} core={0.06} />
      {/* the cone: light has a direction, and it lands on something */}
      <path d={`M${x + 46} ${y - h - 8} L${x + 74} ${y - h - 8} L${x + 330} ${y + 20} L${x - 210} ${y + 20} Z`}
        fill={P.lamp} opacity={0.055 * on} />
      <ellipse cx={x + 60} cy={y + 14} rx={300} ry={40} fill={P.lamp} opacity={0.16 * on} />
      <rect x={x - 6} y={y - h} width={12} height={h} rx={5} fill="#15112F" />
      <path d={`M${x} ${y - h + 4} q 4 -34 58 -30`} fill="none" stroke="#15112F" strokeWidth={10}
        strokeLinecap="round" />
      <path d={`M${x + 38} ${y - h - 32} h 44 l -8 16 h -28 Z`} fill="#15112F" />
      <ellipse cx={x + 60} cy={y - h - 15} rx={14} ry={5} fill={P.lamp} opacity={on} />
    </g>
  );

/** the whole city, framed for a 9:16 shot. `horizon` is where the skyline stands. */
export const City: React.FC<{ t: number; horizon?: number; street?: number; dx?: number }> =
  ({ t, horizon = 1180, street = 1540, dx = 0 }) => (
    <g>
      <Sky t={t} horizonY={horizon + 120} />
      {/* a low moon, well off the focal axis: the one cool light source in the sky */}
      <Light cx={930} cy={170} r={240} color="#BFD0FF" k={0.35} core={0.12} />
      <circle cx={930} cy={170} r={42} fill="#EAF0FF" />
      <circle cx={917} cy={159} r={10} fill="#D2DBF5" />
      <circle cx={945} cy={181} r={6} fill="#D2DBF5" />
      <Skyline base={horizon + 20} minH={90} maxH={260} body={haze(P.city0, 0.18)}
        lit={haze(P.warm, 0.62, P.city0)} seed={3} winK={0.20} t={t} dx={dx * 0.2} gap={2}
        mist={haze(P.sky3, 0.2)} mistH={150} />
      <Skyline base={horizon + 140} minH={120} maxH={420} body={P.city1}
        lit={haze(P.warm, 0.40, P.city1)} seed={11} winK={0.24} t={t} dx={dx * 0.4}
        mist={mix(P.city1, P.sky3, 0.45)} mistH={170} />
      <Skyline base={horizon + 290} minH={170} maxH={560} body={P.city2}
        lit={haze(P.warm, 0.12, P.city2)} seed={23} winK={0.26} t={t} dx={dx * 0.65} gap={16}
        mist={mix(P.city2, P.sky2, 0.30)} mistH={160} />
      <Street y={street} t={t} />
    </g>
  );
