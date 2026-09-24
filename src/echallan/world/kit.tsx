/* THE PRIMITIVE KIT — the only way anything in this film is allowed to be drawn.
 *
 * Three production rules (docs/production-rules.md) are enforced here rather than remembered per asset:
 *
 *  MATERIAL, NOT OUTLINE. A solid gets a VALUE RAMP (lit upper face -> mid ->
 *      shaded lower face) plus a bevel pair: a thin bright catch line on the top edge and a dark
 *      line on the bottom. That pair is what turns flat 2D geometry into a solid with thickness,
 *      and it costs two paths. A stroke around a dark fill on a dark ground reads as see-through.
 *
 *  DEPTH IS DRAWN, NOT DISSOLVED. Recession is a COLOUR operation, never group alpha.
 *      `recede()` mixes a part's own palette toward the local ground and draws it fully opaque —
 *      which is exactly what compositing at alpha would have produced over the real background,
 *      and is immune to the X-ray defect the moment anything sits behind the subject.
 *      Alpha is for LIGHT only: glows, washes, field lines, shading over an opaque surface.
 *
 *  TYPE IS READ ON A PHONE. No shadow, stroke or detail thinner than S.detail, which
 *      is the floor that survives H.264 at Shorts bitrate.
 *
 * Shadows are stacked translucent shapes, not SVG filters — premortem F10 budgets 7 787 frames at
 * 1080x1920 and a filter stack per object is how that becomes unrenderable.
 */
import React from 'react';
import { C, LIGHT, S, hash01, mix } from '../design';

/* ── colour helpers ─────────────────────────────────────────────────────────────────────────*/
export const lit = (base: string, k = 0.16) => mix(base, '#FFFFFF', k);
export const shade = (base: string, k = 0.22) => mix(base, '#000212', k);
/** push a part back into depth by mixing toward the ground it sits on. Draw the result OPAQUE. */
export const recede = (base: string, ground: string, amount: number) => mix(base, ground, amount);

/* A content-hashed gradient id: two instances asking for the same ramp share one definition, and
   a duplicate id therefore always resolves to an identical gradient. */
const gid = (a: string, b: string, ang: number) =>
  'g' + Math.floor(hash01(a.length * 7919 + b.length * 104729 + Math.round(ang * 10),
    (a.charCodeAt(1) || 3) * 131 + (b.charCodeAt(1) || 5)) * 1e9).toString(36);

export const Ramp: React.FC<{ id: string; from: string; to: string; vertical?: boolean }> =
  ({ id, from, to, vertical = true }) => (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  );

/* ── SHADOW ─────────────────────────────────────────────────────────────────────────────────
   One global key from upper-left, so every shadow in the film falls down and to the right.
   `elevation` is the object's height off its surface, in px — a pressed button gets 1, a card
   lying on the chat gets 6, a system sheet gets 22. Shadow BEHAVIOUR is the object's, not its
   own: it tightens when the object lands and collapses when the object is pressed. */
export const Shadow: React.FC<{
  x: number; y: number; w: number; h: number; r: number; elevation: number; opacity?: number;
}> = ({ x, y, w, h, r, elevation, opacity = 1 }) => {
  if (elevation <= 0.2) return null;
  const dx = LIGHT.x * elevation, dy = LIGHT.y * elevation;
  /* three stacked, progressively larger and fainter — a soft edge without a blur filter */
  return (
    <g>
      {[[1.9, 0.055], [1.15, 0.075], [0.55, 0.085]].map(([k, a], i) => {
        const g = elevation * k * 0.85;
        return (
          <rect key={i} x={x + dx - g} y={y + dy - g} width={w + g * 2} height={h + g * 2}
            rx={r + g} fill="#01030C" opacity={a * opacity} />
        );
      })}
    </g>
  );
};

/* ── SOLID ──────────────────────────────────────────────────────────────────────────────────
   A physical surface. Never a stroked outline.
     body      vertical ramp, lit at the top because the key is above
     catch     a bright hairline along the lit (top) edge
     under     a dark line along the shaded (bottom) edge
   `depth` recedes it by colour toward `ground`, opaque. */
export const Solid: React.FC<{
  x: number; y: number; w: number; h: number; r?: number;
  base: string; ground?: string; depth?: number;
  litK?: number; shadeK?: number; elevation?: number; bevel?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, r = 12, base, ground = C.navy, depth = 0, litK = 0.15, shadeK = 0.20,
  elevation = 0, bevel = 1, children }) => {
  const b = depth > 0 ? recede(base, ground, depth) : base;
  const top = lit(b, litK * (1 - depth * 0.6));
  const bot = shade(b, shadeK * (1 - depth * 0.4));
  const id = gid(top, bot, 90);
  const inset = Math.min(r * 0.42, 6);
  return (
    <g>
      <Shadow x={x} y={y} w={w} h={h} r={r} elevation={elevation} />
      <defs><Ramp id={id} from={top} to={bot} /></defs>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id})`} />
      {bevel > 0 && (
        <>
          {/* catch line on the lit edge */}
          <path d={`M${x + r * 0.55} ${y + 1.2} Q${x + w / 2} ${y + 1.2} ${x + w - r * 0.55} ${y + 1.2}`}
            stroke={lit(b, 0.34 * bevel)} strokeWidth={S.detail} strokeLinecap="round" fill="none"
            opacity={0.9} />
          {/* under line on the shaded edge */}
          <path d={`M${x + r * 0.55} ${y + h - 1.2} Q${x + w / 2} ${y + h - 1.2} ${x + w - r * 0.55} ${y + h - 1.2}`}
            stroke={shade(b, 0.40 * bevel)} strokeWidth={S.detail} strokeLinecap="round" fill="none"
            opacity={0.85} />
        </>
      )}
      {children}
      <rect x={x} y={y} width={w} height={h} rx={r} fill="none"
        stroke={shade(b, 0.30)} strokeWidth={1.2} opacity={0.5} />
      {inset > 0 && null}
    </g>
  );
};

/* ── PLATE ──────────────────────────────────────────────────────────────────────────────────
   A light surface — paper, a card face, a screen panel. Same material logic, inverted: the ramp
   runs the other way because a light surface picks up more sky at the top. */
export const Plate: React.FC<{
  x: number; y: number; w: number; h: number; r?: number; base?: string;
  elevation?: number; ground?: string; depth?: number; children?: React.ReactNode;
}> = ({ x, y, w, h, r = 14, base = C.card, elevation = 0, ground = C.navy, depth = 0, children }) => {
  const b = depth > 0 ? recede(base, ground, depth) : base;
  const id = gid(lit(b, 0.05), shade(b, 0.07), 90);
  return (
    <g>
      <Shadow x={x} y={y} w={w} h={h} r={r} elevation={elevation} />
      <defs><Ramp id={id} from={lit(b, 0.05)} to={shade(b, 0.07)} /></defs>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id})`} />
      <path d={`M${x + r * 0.5} ${y + 1} L${x + w - r * 0.5} ${y + 1}`}
        stroke="#FFFFFF" strokeWidth={S.detail} strokeLinecap="round" opacity={0.55} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="none"
        stroke={shade(b, 0.16)} strokeWidth={1.2} opacity={0.75} />
      {children}
    </g>
  );
};

/* ── RECESS ─────────────────────────────────────────────────────────────────────────────────
   A milled well in a surface: darker than its host, with the bevel pair REVERSED (the dark line
   is on top and the catch is at the bottom, because a hole is lit from the opposite side). This
   is how a schematic or a screen sits inside something material without reading as a sticker. */
export const Recess: React.FC<{
  x: number; y: number; w: number; h: number; r?: number; host: string; depthK?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, r = 10, host, depthK = 0.30, children }) => {
  const b = shade(host, depthK);
  const id = gid(shade(b, 0.10), lit(b, 0.05), 90);
  return (
    <g>
      <defs><Ramp id={id} from={shade(b, 0.10)} to={lit(b, 0.05)} /></defs>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id})`} />
      <path d={`M${x + r * 0.5} ${y + 1.2} L${x + w - r * 0.5} ${y + 1.2}`}
        stroke={shade(host, 0.55)} strokeWidth={S.detail} strokeLinecap="round" opacity={0.85} />
      <path d={`M${x + r * 0.5} ${y + h - 1.2} L${x + w - r * 0.5} ${y + h - 1.2}`}
        stroke={lit(host, 0.22)} strokeWidth={S.detail} strokeLinecap="round" opacity={0.5} />
      {children}
    </g>
  );
};

/* ── TEXT ───────────────────────────────────────────────────────────────────────────────────
   Typography has a material role (addendum §23): system UI is rigid, labels respond, amounts roll.
   This is the rigid one — everything that is part of an interface surface. */
export const Label: React.FC<{
  x: number; y: number; size: number; fill: string; weight?: number; anchor?: 'start' | 'middle' | 'end';
  mono?: boolean; track?: number; opacity?: number; children: React.ReactNode;
}> = ({ x, y, size, fill, weight = 600, anchor = 'start', mono = false, track = 0, opacity = 1, children }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor}
    opacity={opacity} letterSpacing={track}
    fontFamily={mono ? '"SF Mono",ui-monospace,"Roboto Mono",monospace'
      : '"Inter Tight","Inter","Helvetica Neue",Arial,sans-serif'}
    style={{ dominantBaseline: 'alphabetic' }}>
    {children}
  </text>
);

/* ── STROKE-GROWN PATH ──────────────────────────────────────────────────────────────────────
   For the things that ARE representations and may legitimately be drawn on
   (rule: object creation matches its nature): routes, network lines, the recap's causal chain, a
   traced shield. Physical objects must never use this — they assemble, slide, unfold or lock. */
export const Grown: React.FC<{
  d: string; len: number; p: number; stroke: string; width?: number; cap?: 'round' | 'butt';
  opacity?: number; dash?: string;
}> = ({ d, len, p, stroke, width = S.route, cap = 'round', opacity = 1, dash }) => (
  <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap={cap}
    strokeLinejoin="round" opacity={opacity}
    strokeDasharray={dash ?? `${len} ${len}`}
    strokeDashoffset={dash ? undefined : len * (1 - Math.max(0, Math.min(1, p)))} />
);

/* ── GLOW ───────────────────────────────────────────────────────────────────────────────────
   Alpha is for light. Restrained by policy: a halo needs a gap to fall off into
   (rule: lights need room to glow), so this is two soft rings, never a bloom over a dense region. */
export const Glow: React.FC<{ cx: number; cy: number; r: number; color: string; k?: number }> =
  ({ cx, cy, r, color, k = 1 }) => (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.75} fill={color} opacity={0.055 * k} />
      <circle cx={cx} cy={cy} r={r * 1.18} fill={color} opacity={0.085 * k} />
    </g>
  );
