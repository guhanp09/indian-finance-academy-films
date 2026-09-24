/* THE APP'S MARK — one object, five scales.
 *
 * The fake service is an e-Challan app, and a real e-Challan comes off a TRAFFIC CAMERA. So the
 * app's icon is a camera lens: a bezel, a six-bladed iris, a barrel and a pupil. At icon size it
 * is an ordinary, plausible, almost boring government-app mark — which is the point, because it
 * is the same object that later opens over the city as an eye. Nothing is added to make it
 * sinister; ONE red pilot light comes on inside it, and the whole reading changes.
 *
 * It appears on the home screen, on the service's own header, carved into the office's pediment,
 * on the update case, on the courier, and as the iris of the eye. Every one of those is this file.
 */
import React from 'react';
import { clamp01, ease, lerp, mix } from '../design';

export const LENS = {
  bezel: '#DCE6FF', bezelLo: '#8E9DC6', blade: '#AEBEE2', bladeLo: '#66759F',
  barrel: '#131B36', pupil: '#05080F', rec: '#FF3B30', cobalt: '#3461DC', cobaltLo: '#24408F',
};

/** the lens itself, centred on (0,0), outer radius `r`.
 *  `open`  the iris, 0 = shut to a slit, 1 = wide
 *  `rec`   the recording light, which burns BEHIND the blades and is therefore only visible
 *          through the aperture — exactly as much of it as the iris is currently letting out
 *
 *  THE HOLE IS THE PUPIL. The first cut drew a separate pupil circle on top of the blades and
 *  offset it by the eye's gaze, so a shut lens showed TWO dark spots — the aperture hole at the
 *  centre and the pupil beside it — and on the pediment that read as a clock face with two dots.
 *  A real diaphragm has one hole. Gaze is the CALLER's job: whatever is looking around translates
 *  the whole lens, it does not slide the pupil inside it.
 */
export const AppLens: React.FC<{ r: number; open?: number; rec?: number; glass?: number }> =
  ({ r, open = 0.62, rec = 0, glass = 1 }) => {
    const o = clamp01(open);
    const R = r * 0.86;                       // the barrel the blades sweep inside
    const r0 = lerp(r * 0.11, r * 0.50, ease.inOut(o));   // the aperture's apothem
    const spin = lerp(16, -4, o);             // a real iris rotates as it opens
    /* THE BLADES MUST OVERLAP. The first cut gave each one an outer half-width of 0.26R against
       a sector of 0.58R, so six narrow trapezoids sat in an annulus with daylight between them —
       a turbine, not an iris. Each blade now spans +-46 degrees at the barrel and is cut off by a
       chord at the aperture, so they lap over each other the way a real diaphragm does and the
       only hole left is the hexagon in the middle. */
    const wIn = r0 * 0.5774;
    const pt = (a: number) => `${Math.cos(a) * R} ${Math.sin(a) * R}`;
    const blade = `M${r0} ${-wIn} L${r0} ${wIn} L${pt(0.80)} A${R} ${R} 0 0 0 ${pt(-0.80)} Z`;
    return (
      <g>
        {/* the barrel behind everything, so the aperture is a hole into something */}
        <circle r={r * 0.90} fill={LENS.pupil} />
        {/* and what is burning down it */}
        {rec > 0.01 && (
          <g opacity={rec}>
            <circle r={r * 0.90} fill={LENS.rec} opacity={0.18} />
            <circle r={Math.max(2, r * 0.26)} fill={LENS.rec} />
            <circle r={Math.max(1, r * 0.11)} fill="#FFE4E1" />
          </g>
        )}
        <g transform={`rotate(${spin})`}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <g key={k} transform={`rotate(${k * 60})`}>
              <path d={blade} fill={mix(mix(LENS.blade, LENS.bladeLo, 0.55),
                k % 2 ? LENS.blade : mix(LENS.blade, LENS.bladeLo, 0.32), 0.25 + 0.75 * o)} />
              {/* the leading edge of each blade: six straight edges spiralling into a hexagonal
                  hole. They FADE OUT as the iris shuts, because six visible seams on a nearly
                  closed disc is a clock face — and a blind read took the medallion on the
                  pediment as a clock for ten frames running. */}
              <path d={`M${r0} ${-wIn} L${pt(-0.80)}`} fill="none" stroke={LENS.bladeLo}
                strokeWidth={r * 0.045} strokeLinecap="round" opacity={0.05 + 0.95 * o} />
            </g>
          ))}
        </g>
        {/* the bezel: a machined ring, lit from the upper left */}
        <circle r={r * 0.94} fill="none" stroke={LENS.bezelLo} strokeWidth={r * 0.14} />
        <path d={`M${-r * 0.94} 0 A${r * 0.94} ${r * 0.94} 0 0 1 0 ${-r * 0.94}`} fill="none"
          stroke={LENS.bezel} strokeWidth={r * 0.14} strokeLinecap="round" />
        {/* the knurl: what makes it read as a LENS and not a target ring */}
        {glass > 0.01 && Array.from({ length: 12 }, (_, k) => (
          <rect key={k} x={-r * 0.035} y={-r * 1.03} width={r * 0.07} height={r * 0.16} rx={r * 0.03}
            fill={LENS.bezelLo} opacity={0.75} transform={`rotate(${k * 30})`} />
        ))}
        {/* one specular streak across the glass */}
        {glass > 0.01 && (
          <path d={`M${-r * 0.56} ${-r * 0.40} A${r * 0.72} ${r * 0.72} 0 0 1 ${-r * 0.06} ${-r * 0.70}`}
            fill="none" stroke="#FFFFFF" strokeWidth={r * 0.10} strokeLinecap="round"
            opacity={0.30 * glass} />
        )}
      </g>
    );
  };

/** the mark as an APP: a cobalt squircle with the lens on it. `s` is the tile's half-width. */
export const AppTile: React.FC<{ s: number; rec?: number; open?: number; dim?: number }> =
  ({ s, rec = 0, open = 0.62, dim = 0 }) => {
    const base = dim > 0 ? mix(LENS.cobalt, '#000000', dim * 0.5) : LENS.cobalt;
    return (
      <g>
        <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={s * 0.26} fill={LENS.cobaltLo} />
        <rect x={-s * 0.94} y={-s * 0.94} width={s * 1.88} height={s * 1.88} rx={s * 0.23} fill={base} />
        <rect x={-s * 0.94} y={-s * 0.94} width={s * 1.88} height={s * 0.62} rx={s * 0.22}
          fill="#FFFFFF" opacity={0.10} />
        <AppLens r={s * 0.64} open={open} rec={rec} />
      </g>
    );
  };
