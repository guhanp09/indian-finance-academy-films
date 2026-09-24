/* INSIDE THE PHONE, v3 — the protected city and the wall around it.
 *
 * COLOUR CARRIES THE ARGUMENT. Three territories, three temperatures:
 *   · OUTSIDE the wall is VIOLET — the same night the scam arrived from on the street. Everything
 *     that comes from outside keeps that colour cast.
 *   · THE WALL is Android's install protection: cold engineered steel-blue, and a CYAN field that
 *     runs along its crest. Cyan = the system's trust, everywhere in this film.
 *   · INSIDE the wall is navy with WARM windows: your apps and what is in them. The warmth is the
 *     thing at stake; it is the only warm light in the scene until the door is opened, and then it
 *     spills OUT onto the violet ground.
 *   · Amber = the system warning. Green ✓ = permission. WhatsApp's green = the source. Cobalt =
 *     the fake office's borrowed authority, the same blue as the e-Challan service it becomes.
 *
 * MECHANISM, NOT DECORATION. The wall is precast panels between seams, which is what lets ONE
 * panel leave. That panel is held by steel bolts across both of its seams. The permission panel
 * beside it is wired to those bolts by a visible conduit: ✓ → pulse → bolts retract → the field
 * over that panel dies → the panel sinks under its lintel. A doorway, made by a button.
 *
 * Coordinates are the interior's own 1080x1920 frame (q); at full dive q maps 1:1 to the frame.
 */
import React from 'react';
import { H, W, clamp01, ease, hash01, lerp, mix } from '../design';
import { APPS, Symbol } from './inside';
import type { Sym } from './inside';
import { AppLens } from './mark';
import { LinGrad, Light, RadGrad, Stars, gid } from './style';

/* ── GEOMETRY ───────────────────────────────────────────────────────────────────────────────*/
export const F = {
  ground: 1240, wallTop: 820, capH: 34, panelW: 220, edge0: -600,
  /* THE STORE GATE moved 80 left so the breach could grow: the wall is now tiled OUTWARD from its
     two openings rather than from a fixed grid, and the panel between them is a closure panel. */
  gate: { x0: 60, x1: 280, cx: 170, top: 740 },
  /* THE BREACH — 340 wide, from 220. The app's building is 464 wide with its colonnade spanning
     545..835; at 220 we saw less than half of it and the lintel cut 28 more off the top. The
     opening now clears the whole colonnade, and there is no beam over it: this is a piece of wall
     that LEFT, not a doorway someone built. */
  door: { x0: 520, x1: 860, cx: 690 },
  box: { x0: 300, x1: 480, y0: 900, y1: 1176 },
  allow: { x: 430, y: 1088, r: 36 },
  deny: { x: 344, y: 1088, r: 25 },
  court: 1180,                     // the ground behind the wall, where buildings stand
} as const;
/** the leaf's bolts: three per jamb, horizontal, driven through the leaf's stiles into the jamb.
 *  With no lintel there is nothing above the leaf to hang bolts from, so it is held at its sides
 *  and DROPS into the threshold pocket when they clear — which is what the sink has always been. */
export const JAMB_BOLT_Y = [944, 1052, 1160];
/** overshoot-and-settle, for things that LOCK into place */
export const outBack = (v: number) => { const u = clamp01(v), c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
/** THE WALL'S PANELS, tiled outward from the two openings. A precast wall is made of panels and
 *  CLOSURE panels; the run between the store gate and the breach is one of those. Nothing is a
 *  fixed grid any more, so either opening can change width without a seam crossing it. */
export const PANELS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let x = F.gate.x0; x > -700; x -= F.panelW) out.push([x - F.panelW, x]);
  out.push([F.gate.x1, F.door.x0]);                       // the closure panel between them
  for (let x = F.door.x1; x < W + 700; x += F.panelW) out.push([x, x + F.panelW]);
  return out;
})();

/* ── PALETTE (semantic, see header) ─────────────────────────────────────────────────────────*/
export const Q = {
  sky0: '#070D26', sky1: '#0E1A45', sky2: '#1A2B63', glowIn: '#FFB25E',
  plaza0: '#2C2458', plaza1: '#1A1538', plaza2: '#0F0C24',
  steelHi: '#B7C5E4', steel: '#8C9CC4', steelLo: '#5E6E9A', steelDD: '#3A4670', seam: '#2B355A',
  cap: '#2E3860', field: '#63E6FF', warn: '#FFB23E', allow: '#2BD576', deny: '#E5484D',
  wa: '#25D366', waD: '#128C7E', window: '#FFC56B', cobalt: '#3461DC',
  court0: '#1B2550', court1: '#2A2E5E',
};

/* ── SKY: navy, and a warm glow low behind the city — the life inside ──────────────────────*/
export const Sky3: React.FC<{ t: number }> = ({ t }) => {
  const g = gid('sky3'), w = gid('sky3warm');
  return (
    <g>
      <defs>
        <LinGrad id={g} stops={[[0, Q.sky0], [0.5, Q.sky1], [1, Q.sky2]]} />
        <RadGrad id={w} cx={0.5} cy={1} r={0.9} stops={[[0, Q.glowIn, 0.30], [0.5, Q.glowIn, 0.08], [1, Q.glowIn, 0]]} />
      </defs>
      {/* the sky has to reach further up than the old camera ever went: the eye beat pulls back to
          z 0.60 and the frame's top edge was landing above y=-700, where there was nothing at all
          and the picture simply stopped in a hard black band */}
      {/* ACT 3 FLIES THE UPLINK OUT PAST THE CITY, so the night has to reach out there too: the
          old width stopped at x=1780 and the transit frames showed a hard vertical edge where the
          sky simply ran out. */}
      <rect x={-700} y={-2900} width={W + 2300} height={2200} fill={Q.sky0} />
      <rect x={-700} y={-700} width={W + 2300} height={F.court + 700} fill={`url(#${g})`} />
      <ellipse cx={W / 2} cy={F.wallTop} rx={1000} ry={420} fill={`url(#${w})`} />
      <Stars n={60} w={W} h={F.wallTop - 420} t={t} seed={9} k={0.55} />
      {/* WEST OF THE PLOT. Act 4's last shot stands out on the plaza at x -210, where the original
          field — laid out over 0..W — simply had no stars, so half that frame's sky was empty while
          the other half was not. Added as its own field rather than by widening the first one,
          because widening moves every star in the three acts before it. */}
      <g transform="translate(-760 0)">
        <Stars n={38} w={760} h={F.wallTop - 420} t={t} seed={41} k={0.5} />
      </g>
      <g transform={`translate(1000 -1500)`}><Stars n={46} w={1500} h={1900} t={t} seed={31} k={0.5} /></g>
    </g>
  );
};

/* ── THE CITY: every building is shaped by what its app DOES ────────────────────────────────
   A post office has a gable and a letter slot; a bank has columns and a vault; the chat tower's
   windows are speech bubbles. The rooftop sign is the app's icon, and it is what lifts off to
   become the home-screen icon at the end. */
type Arch = 'mail' | 'music' | 'chat' | 'bank' | 'calendar' | 'phone';
/* ── WHERE THE CITY STANDS, AND WHY IT STANDS THERE ─────────────────────────────────────────
   The first cut allocated these positions from one table and the app's apparatus from another,
   and the two tables did not know about each other. The chat tower was at 380-510 and the mail
   hoist bolted on at 506; the bank was at 900-1036 and the line tap's handset reached 997. So
   two machines were drawn straight through two buildings and their rooftop signs, and the whole
   middle band of the frame became one pile of small bright objects.

   The fix is not a nudge. The app's apparatus now DECLARES the air it occupies (APP_ZONE below,
   derived from the mounts and each machine's real half-width), the city is tiled outside it with
   a stated clearance, and an assertion at module load fails the build if anything crosses. Move
   an organ later and the city has to be moved with it — that is the point. */
export const NEAR3: { kind: Arch; app: number; x: number; w: number; top: number }[] = [
  { kind: 'mail', app: 0, x: -34, w: 160, top: 392 },
  { kind: 'phone', app: 8, x: 140, w: 150, top: 430 },
  { kind: 'chat', app: 4, x: 302, w: 132, top: 300 },
  { kind: 'bank', app: 6, x: 980, w: 150, top: 470 },
  { kind: 'calendar', app: 5, x: 1144, w: 128, top: 356 },
  /* THE CITY MAY NOT STOP AT ITS LAST HOST. The VPN is asked for on the bank, the furthest right
     of the four, and the camera has to look at it — so with the skyline ending 130 units past the
     bank a quarter of that frame was wall and empty sky. One more block continues it past the
     edge of every framing in the act. */
  { kind: 'music', app: 9, x: 1286, w: 132, top: 452 },
];
export const PLOT3 = { cx: 690, x0: 470, x1: 900 };
/** the rooftop sign's centre, in q */
export const sign3At = (i: number) => {
  const b = NEAR3[i];
  return { x: b.x + b.w / 2, y: b.top - 70 };
};

const winOn = (i: number, j: number, seed: number) => hash01(i * 7 + j * 13, seed) > 0.42;

/** the sign on a roof is a SIGN: a steel frame on legs bolted through the parapet, with a visor
 *  over it and its own spill on the roof it stands on. Never a tile floating above a box. */
const RoofSign: React.FC<{ cx: number; roofY: number; col: string; sym: Sym; dark: string;
  edge: string; hideSym?: boolean }> = ({ cx, roofY, col, sym, dark, edge, hideSym = false }) => (
  <g>
    <rect x={cx - 34} y={roofY - 4} width={68} height={9} rx={3} fill={dark} />
    {[-24, 17].map((dx) => <rect key={dx} x={cx + dx} y={roofY - 44} width={7} height={46} fill={dark} />)}
    {[-27, 20].map((dx) => <circle key={dx} cx={cx + dx + 3.5} cy={roofY + 1} r={3} fill="#0B1022" />)}
    <rect x={cx - 40} y={roofY - 98} width={80} height={80} rx={13} fill={dark} />
    <rect x={cx - 33} y={roofY - 91} width={66} height={66} rx={10} fill={col} />
    <rect x={cx - 33} y={roofY - 91} width={66} height={16} rx={8} fill="#FFFFFF" opacity={0.12} />
    {/* the glyph is drawn by whatever has taken it, when something has */}
    {!hideSym && <Symbol kind={sym} cx={cx} cy={roofY - 58} s={1.08} />}
    <rect x={cx - 45} y={roofY - 107} width={90} height={10} rx={5} fill={edge} />
    <Light cx={cx} cy={roofY - 52} r={96} color={col} k={0.32} />
  </g>
);

/** Where a building's identity sign actually stands. The exchange's is off-centre so it does not
 *  collide with its roof gantry — anything that attaches to a sign must ask for this, not guess. */
export const signCxOf = (b: typeof NEAR3[0]) => b.x + b.w / 2 + (b.kind === 'phone' ? 26 : 0);

const Building: React.FC<{ b: typeof NEAR3[0]; t: number; fold?: number; sign?: boolean;
  takeover?: number; sleep?: number; hideSym?: boolean }> =
  ({ b, t, fold = 0, sign = true, takeover = 0, sleep = 0, hideSym = false }) => {
    const app = APPS[b.app];
    const body = mix(mix(app.col, Q.sky1, 0.62), '#1A2450', 0.25);
    const lit = mix(body, '#FFFFFF', 0.10), dark = mix(body, '#000000', 0.30);
    const edge = mix(body, '#FFFFFF', 0.24);
    const { x, w, top } = b;
    const base = F.court, hgt = base - top;
    /* what is lit in this building is the app's, once it is allowed to keep running */
    /* `dark` puts this building to sleep — its lit windows fall back toward its own body */
    const win = mix(mix(Q.window, '#6E9BFF', clamp01(takeover)), '#141C38', clamp01(sleep));
    const cx = x + w / 2;
    const signCx = signCxOf(b), gx = cx - 48;
    const feat: React.ReactNode[] = [];

    if (b.kind === 'mail') {
      /* A SORTING HALL. Gable and ridge, a canopy on brackets over the posting slot, a clerestory
         band where the sorting floor is, and bay doors at street level. */
      feat.push(<g key="roof">
        <path d={`M${x - 12} ${top + 52} L${cx} ${top - 26} L${x + w + 12} ${top + 52} Z`} fill={dark} />
        <path d={`M${x - 12} ${top + 52} L${cx} ${top - 26} L${cx} ${top + 52} Z`} fill={body} opacity={0.55} />
        <rect x={cx - 4} y={top - 26} width={8} height={78} fill={edge} opacity={0.5} />
      </g>);
      feat.push(<g key="clere">
        <rect x={x + 10} y={top + 68} width={w - 20} height={34} rx={4} fill="#0B1022" opacity={0.5} />
        {[0, 1, 2, 3, 4].map((k) => (
          <rect key={k} x={x + 18 + k * ((w - 44) / 5)} y={top + 74} width={(w - 44) / 5 - 8} height={22}
            rx={2} fill={win} opacity={0.6} />
        ))}
      </g>);
      /* the posting slot, under its own canopy — this is what "access your SMS" opens */
      feat.push(<g key="slot">
        <rect x={cx - 74} y={top + 150} width={148} height={12} rx={4} fill={edge} />
        {[-62, 54].map((dx) => <path key={dx} d={`M${cx + dx} ${top + 162} l8 22`} stroke={dark} strokeWidth={6} />)}
        <rect x={cx - 58} y={top + 190} width={116} height={30} rx={6} fill="#0B1022" />
        <rect x={cx - 50} y={top + 197} width={100} height={8} rx={4} fill={win} opacity={0.55} />
      </g>);
      for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++)
        if (winOn(r, c, 3)) feat.push(<rect key={`w${r}${c}`} x={x + 20 + c * ((w - 40) / 3)} y={top + 246 + r * 58}
          width={(w - 40) / 3 - 14} height={30} rx={3} fill={win} opacity={0.5} />);
      /* bay doors on the ground floor */
      feat.push(<g key="bays">{[0, 1].map((k) => (
        <rect key={k} x={x + 18 + k * (w - 76)} y={base - 96} width={58} height={96} rx={4} fill="#0B1022" opacity={0.7} />
      ))}</g>);
    } else if (b.kind === 'phone') {
      /* AN EXCHANGE. A roof gantry carrying the cross-arms, banks of switch-hall windows, and the
         cable head where the lines actually enter the building. The gantry stands on the LEFT half
         of the roof because the identity sign stands on the right — they used to be drawn through
         each other. */
      feat.push(<g key="gantry">
        <rect x={gx - 38} y={top - 8} width={76} height={12} rx={3} fill={dark} />
        <rect x={gx - 5} y={top - 104} width={10} height={100} fill={dark} />
        {[0, 1, 2].map((k) => {
          const ay = top - 92 + k * 28;
          return (
            <g key={k}>
              <rect x={gx - 29} y={ay} width={58} height={6} rx={3} fill={dark} />
              {[-23, -11, 11, 23].map((dx) => (
                <g key={dx}>
                  <rect x={gx + dx - 3} y={ay - 9} width={6} height={10} fill={dark} />
                  <ellipse cx={gx + dx} cy={ay - 11} rx={6} ry={3.5} fill={edge} opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })}
      </g>);
      feat.push(<rect key="band" x={x} y={top + 14} width={w} height={22} fill={edge} opacity={0.35} />);
      /* switch halls: tight banks of small windows, which is what an exchange looks like */
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++)
        if (winOn(r, c, 12)) feat.push(<rect key={`w${r}${c}`} x={x + 14 + c * ((w - 28) / 4)} y={top + 58 + r * 52}
          width={(w - 28) / 4 - 9} height={26} rx={2} fill={win} opacity={0.52} />);
      /* the cable head: where the wires come down into the building */
      feat.push(<g key="head">
        <rect x={cx - 30} y={base - 130} width={60} height={64} rx={6} fill={dark} />
        {[0, 1, 2].map((k) => <rect key={k} x={cx - 22 + k * 15} y={base - 122} width={8} height={48} rx={3} fill={edge} opacity={0.5} />)}
      </g>);
    } else if (b.kind === 'bank') {
      feat.push(<path key="p" d={`M${x - 12} ${top + 34} L${cx} ${top - 22} L${x + w + 12} ${top + 34} Z`} fill={lit} />);
      feat.push(<rect key="e" x={x - 8} y={top + 34} width={w + 16} height={18} fill={lit} />);
      feat.push(<rect key="e2" x={x - 8} y={top + 52} width={w + 16} height={6} fill={dark} opacity={0.5} />);
      [0, 1, 2, 3].forEach((k) => {
        const kx = x + 14 + k * ((w - 40) / 3);
        feat.push(<g key={`k${k}`}>
          <rect x={kx} y={top + 58} width={13} height={166} fill={lit} opacity={0.9} />
          <rect x={kx - 3} y={top + 58} width={19} height={7} rx={2} fill={lit} />
          <rect x={kx - 3} y={top + 218} width={19} height={7} rx={2} fill={lit} />
        </g>);
      });
      feat.push(<g key="vault">
        <circle cx={cx} cy={top + 296} r={36} fill={dark} />
        <circle cx={cx} cy={top + 296} r={27} fill="none" stroke={win} strokeWidth={4} opacity={0.65} />
        <circle cx={cx} cy={top + 296} r={7} fill={win} opacity={0.6} />
        {[0, 45, 90, 135].map((ang) => (
          <path key={ang} d={`M${cx - 20} ${top + 296} h40`} stroke={win} strokeWidth={3} opacity={0.5}
            transform={`rotate(${ang} ${cx} ${top + 296})`} />
        ))}
      </g>);
    } else if (b.kind === 'chat') {
      feat.push(<rect key="drum" x={cx - 30} y={top - 26} width={60} height={30} rx={10} fill={dark} />);
      for (let r = 0; r < 11; r++) for (let c = 0; c < 2; c++) {
        if (!winOn(r, c, 5)) continue;
        const wx = x + 20 + c * 56, wy = top + 46 + r * 70;
        feat.push(<path key={`b${r}${c}`} d={`M${wx} ${wy} h34 q6 0 6 6 v18 q0 6 -6 6 h-18 l-9 8 v-8 h-7 q-6 0 -6 -6 v-18 q0 -6 6 -6 z`} fill={win} opacity={0.58} />);
      }
    } else if (b.kind === 'calendar') {
      [0.3, 0.7].forEach((k, i) => feat.push(<path key={`ring${i}`} d={`M${x + w * k - 10} ${top} v-24 a10 10 0 0 1 20 0 v24`} fill="none" stroke={dark} strokeWidth={8} />));
      feat.push(<rect key="hd" x={x} y={top} width={w} height={42} fill={mix(app.col, Q.sky1, 0.35)} />);
      for (let r = 0; r < 13; r++) for (let c = 0; c < 4; c++)
        if (winOn(r, c, 8)) feat.push(<rect key={`d${r}${c}`} x={x + 14 + c * ((w - 28) / 4)} y={top + 64 + r * 48}
          width={(w - 28) / 4 - 10} height={22} rx={3} fill={win} opacity={0.5} />);
    } else if (b.kind === 'music') {
      feat.push(<path key="d" d={`M${x} ${top + 30} A${w / 2} 42 0 0 1 ${x + w} ${top + 30} Z`} fill={dark} />);
      [0, 1].forEach((k) => {
        const cy2 = top + 110 + k * 120;
        feat.push(<circle key={`c${k}`} cx={cx} cy={cy2} r={38} fill={dark} />);
        feat.push(<circle key={`r${k}`} cx={cx} cy={cy2} r={24} fill="none" stroke={win} strokeWidth={4} opacity={0.6} />);
      });
    }

    const fy = 1 - ease.inOut(fold);
    return (
      <g>
        <g transform={`translate(0 ${base}) scale(1 ${Math.max(0.001, fy)}) translate(0 ${-base})`}>
          {/* the shell, with structure: pilasters, a lit edge, a shaded edge, a cap and a plinth */}
          <rect x={x} y={top} width={w} height={hgt + 40} fill={body} />
          {Array.from({ length: Math.max(2, Math.round(w / 46)) }, (_, i) => (
            <rect key={`pil${i}`} x={x + 8 + i * ((w - 16) / Math.max(2, Math.round(w / 46)))} y={top}
              width={4} height={hgt + 40} fill={dark} opacity={0.22} />
          ))}
          <rect x={x} y={top} width={8} height={hgt + 40} fill={edge} opacity={0.75} />
          <rect x={x + w - 8} y={top} width={8} height={hgt + 40} fill={dark} opacity={0.75} />
          {feat}
          {/* parapet cap and its shadow: a building stops with an edge, not a cut */}
          <rect x={x - 7} y={top - 12} width={w + 14} height={15} rx={3} fill={edge} />
          <rect x={x - 7} y={top + 3} width={w + 14} height={6} fill="#0B1022" opacity={0.45} />
          <rect x={x - 9} y={base - 20} width={w + 18} height={24} fill={dark} />
        </g>
        {sign && fold < 0.01 && (
          <RoofSign cx={signCx} roofY={top - 12} col={app.col} sym={app.sym} dark={dark} edge={edge}
            hideSym={hideSym} />
        )}
      </g>
    );
  };

const FarRow: React.FC<{ fold?: number; takeover?: number }> = ({ fold = 0, takeover = 0 }) => {
  const fy = Math.max(0.001, 1 - ease.inOut(fold));
  return (
    <g transform={`translate(0 ${F.court}) scale(1 ${fy}) translate(0 ${-F.court})`}>
      {Array.from({ length: 14 }, (_, i) => {
        const x = -300 + i * 118 + hash01(i, 3) * 30, w = 80 + hash01(i, 4) * 60;
        const top = 440 + hash01(i, 5) * 260;
        const col = mix('#24306A', Q.sky2, 0.45);
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={F.court - top} fill={col} />
            {Array.from({ length: 12 }, (_, r) => hash01(i * 11 + r, 6) > 0.6 && (
              <rect key={r} x={x + w * 0.3} y={top + 30 + r * 50} width={w * 0.4} height={8} rx={3}
                fill={mix(Q.window, '#6E9BFF', clamp01(takeover * 1.8 - (i % 5) * 0.12))} opacity={0.22} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

export const City3: React.FC<{ t: number; fold?: number; signs?: boolean; takeover?: number;
  sleep?: number; hideSym?: Sym }> =
  ({ t, fold = 0, signs = true, takeover = 0, sleep = 0, hideSym }) => {
  const cg = gid('court3');
  return (
    <g>
      <FarRow fold={fold} takeover={takeover} />
      {NEAR3.map((b, i) => (
        <Building key={i} b={b} t={t} sign={signs} fold={clamp01(fold * 1.4 - i * 0.08)}
          takeover={clamp01(takeover * 1.8 - i * 0.16)} sleep={clamp01(sleep * 1.9 - i * 0.18)}
          hideSym={hideSym !== undefined && APPS[b.app].sym === hideSym} />
      ))}
      {/* the courtyard behind the wall: only ever seen through an opening */}
      <defs><LinGrad id={cg} stops={[[0, Q.court1], [1, Q.court0]]} /></defs>
      <rect x={-700} y={F.court} width={W + 1400} height={F.ground - F.court + 40} fill={`url(#${cg})`} />
      <rect x={-700} y={F.court} width={W + 1400} height={3} fill={Q.window} opacity={0.18} />
    </g>
  );
};

/* ── THE PLAZA — outside the wall: violet, the outside world's colour ───────────────────────*/
export const Plaza: React.FC<{ t: number; spill?: number }> = ({ t, spill = 0 }) => {
  const g = gid('plaza3'), cv = gid('conveyor3'), sp = gid('spill3');
  const gx0 = F.gate.x0 + 18, gx1 = F.gate.x1 - 18;
  const vx = F.gate.cx, vy = F.ground;
  return (
    <g>
      <defs>
        <LinGrad id={g} stops={[[0, Q.plaza0], [0.35, Q.plaza1], [1, Q.plaza2]]} />
        <LinGrad id={cv} stops={[[0, '#6CF5B0', 0.34], [1, '#6CF5B0', 0.04]]} />
        <LinGrad id={sp} stops={[[0, Q.glowIn, 0.42], [1, Q.glowIn, 0]]} />
      </defs>
      <rect x={-700} y={F.ground} width={W + 1400} height={H + 700} fill={`url(#${g})`} />
      {/* the wall's own shadow on the ground in front of it */}
      <rect x={-700} y={F.ground} width={W + 1400} height={46} fill="#000000" opacity={0.28} />
      {/* paving joints in perspective, converging on the gate */}
      {Array.from({ length: 15 }, (_, i) => (
        <path key={i} d={`M${vx + (i - 7) * 26} ${vy} L${vx + (i - 7) * 330} ${H + 200}`}
          stroke="#8C7FE0" strokeWidth={2} opacity={0.08} />
      ))}
      {Array.from({ length: 8 }, (_, j) => {
        const yy = F.ground + Math.pow((j + 1) / 8, 1.7) * (H - F.ground + 160);
        return <rect key={j} x={-700} y={yy} width={W + 1400} height={2} fill="#8C7FE0" opacity={0.07} />;
      })}
      {/* the store's conveyor: the one lit path, and its chevrons all point INTO the gate */}
      <path d={`M${gx0} ${vy} L${gx1} ${vy} L${gx1 + 250} ${H + 60} L${gx0 - 250} ${H + 60} Z`} fill={`url(#${cv})`} />
      {Array.from({ length: 7 }, (_, i) => {
        const u = ((t * 0.35 + i / 7) % 1);
        const k = Math.pow(1 - u, 1.6);
        const yy = lerp(vy + 12, H + 20, k), half = lerp(26, 150, k);
        return <path key={`ch${i}`} d={`M${vx - half} ${yy + half * 0.32} L${vx} ${yy} L${vx + half} ${yy + half * 0.32}`}
          fill="none" stroke="#9BFFD0" strokeWidth={lerp(2, 7, k)} opacity={0.35 * Math.sin(u * Math.PI)}
          strokeLinecap="round" strokeLinejoin="round" />;
      })}
      {/* once the door is open, the inside's warm light spills OUT across the violet */}
      {spill > 0.01 && (
        <path d={`M${F.door.x0 + 6} ${vy} L${F.door.x1 - 6} ${vy} L${F.door.x1 + 330} ${H + 60} L${F.door.x0 - 330} ${H + 60} Z`}
          fill={`url(#${sp})`} opacity={spill} />
      )}
    </g>
  );
};

/* ── THE WALL ───────────────────────────────────────────────────────────────────────────────*/
export type WallState = {
  hit: number; hitX: number;            // field impact flare, 0..1, and where
  wake: number;                          // the permission panel wakes (the source is at the door)
  ask: number;                           // ✓ pulses, asking
  press: number;                         // ✓ is physically pressed
  lit: number;                           // ✓ has been accepted (stays lit)
  pulse: number;                         // 0..1 along the conduit
  boltL: number; boltR: number;          // bolts retracted, 0..1
  stow?: number;                         // the panel closes and goes flush once it is done
  fieldOff: number;                      // the field over the door panel dies
  sink: number;                          // the door panel sinks, 0..1
};
export const WALL_IDLE: WallState = {
  hit: 0, hitX: F.door.cx, wake: 0, ask: 0, press: 0, lit: 0, pulse: 0, boltL: 0, boltR: 0, fieldOff: 0, sink: 0,
};

const Panel: React.FC<{ x0: number; x1: number; seed: number; mark?: boolean }> = ({ x0, x1, seed, mark = true }) => {
  const g = gid('panel3');
  const y0 = F.wallTop + F.capH, y1 = F.ground;
  const cx = (x0 + x1) / 2;
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${g})`} />
      {/* a horizontal reveal and a faint stain gradient: cast concrete, not a cartoon brick */}
      <rect x={x0} y={y0 + (y1 - y0) * 0.36} width={x1 - x0} height={4} fill={Q.steelDD} opacity={0.35} />
      <rect x={x0} y={y0 + (y1 - y0) * 0.36 + 4} width={x1 - x0} height={2} fill={Q.steelHi} opacity={0.35} />
      {/* the protection's mark, cast into every panel */}
      {mark && (
        <g transform={`translate(${cx} ${y0 + 52})`} opacity={0.55}>
          <path d="M0 -22 L18 -15 V1 C18 13 9 19 0 23 C-9 19 -18 13 -18 1 V-15 Z" fill={Q.steelLo} />
          <path d="M-7 0 l5 5 l9 -10" stroke={Q.steelHi} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* anchor points */}
      {[0.2, 0.8].map((k) => <circle key={k} cx={x0 + (x1 - x0) * k} cy={y1 - 30} r={4} fill={Q.steelDD} opacity={0.6} />)}
      <rect x={x0} y={y1 - 14} width={x1 - x0} height={14} fill={Q.steelDD} opacity={0.5} />
    </g>
  );
};

/* a lintel bolt: a steel bar that drops from the beam into the top of the door panel and holds
   it up. Unlocking draws it UP into its housing; the housing lamp goes from red to green. */
export const Bolt3: React.FC<{ x: number; headY: number; headH: number; out: number; s?: number }> =
  ({ x, headY, headH, out, s = 1 }) => {
    const yb = headY + headH;                       // underside of the head beam
    const lamp = mix(Q.deny, Q.allow, clamp01(out * 1.4));
    return (
      <g>
        <rect x={x - 9 * s} y={yb - (10 + out * 40) * s} width={18 * s} height={50 * s} rx={4 * s} fill="#D6DEEF" />
        <rect x={x - 9 * s} y={yb - (10 + out * 40) * s} width={5 * s} height={50 * s} rx={2 * s} fill="#FFFFFF" opacity={0.6} />
        <rect x={x - 22 * s} y={headY + 16 * s} width={44 * s} height={headH - 18 * s} rx={6 * s} fill={Q.steelDD} />
        <rect x={x - 18 * s} y={headY + 20 * s} width={36 * s} height={6 * s} rx={3 * s} fill={Q.steel} opacity={0.5} />
        <circle cx={x} cy={headY + 42 * s} r={6 * s} fill={lamp} />
        <Light cx={x} cy={headY + 42 * s} r={26 * s} color={lamp} k={0.6} />
      </g>
    );
  };
/* THE JAMB SHOT BOLT — the wall's own lock, now that the breach has no beam over it. A square
   bar driven horizontally out of a housing on the jamb, through the leaf's stile. `out` withdraws
   it: the bar slides back into its housing and the housing lamp goes red -> green. When the last
   one clears, nothing is holding the leaf and it drops. `dir` is the direction it EXTENDS. */
/** `idle` puts the tell-tale on standby. The bolts clear ONCE, in act 1, and that is the event —
 *  but they then sit in shot for the rest of the film, and by act 3 the camera is close enough to
 *  the breach that six saturated green lamps were the highest-contrast thing in a frame whose
 *  subject is 400 units behind them. A finished indicator goes quiet; it does not go out. */
export const ShotBolt: React.FC<{ x: number; y: number; dir: 1 | -1; out: number; idle?: number }> =
  ({ x, y, dir, out, idle = 0 }) => {
    const q = 1 - 0.62 * clamp01(idle);
    const lamp = mix(mix(Q.deny, Q.allow, clamp01(out * 1.4)), '#101A30', (1 - q) * 0.62);
    const L = 52, rec = clamp01(out) * 40;            // how far it has pulled back
    const tip = x + dir * (L - rec);                   // the free end, inside the leaf
    const root = x - dir * 16;                         // always buried in the housing
    const bx = Math.min(tip, root), bw = Math.abs(tip - root);
    return (
      <g>
        {/* the bar */}
        <rect x={bx} y={y - 10} width={bw} height={20} rx={4} fill="#D6DEEF" />
        <rect x={bx} y={y - 10} width={bw} height={6} rx={3} fill="#FFFFFF" opacity={0.6} />
        <rect x={dir > 0 ? tip - 7 : tip} y={y - 10} width={7} height={20} fill={Q.steelLo} opacity={0.8} />
        {/* the housing, bolted to the jamb */}
        <rect x={dir > 0 ? x - 40 : x - 4} y={y - 22} width={44} height={44} rx={7} fill={Q.steelDD} />
        <rect x={dir > 0 ? x - 36 : x} y={y - 18} width={36} height={7} rx={3} fill={Q.steel} opacity={0.55} />
        {[-13, 13].map((dy) => (
          <circle key={dy} cx={x + dir * -18} cy={y + dy} r={3.4} fill="#0B1022" opacity={0.8} />
        ))}
        <circle cx={x + dir * -18} cy={y} r={6} fill={lamp} />
        <Light cx={x + dir * -18} cy={y} r={30} color={lamp} k={0.7 * q} />
      </g>
    );
  };

/** the permission panel: WHO is asking (screen), and the two answers. The green answer is wired. */
export const PermissionPanel: React.FC<{ s: WallState; t: number }> = ({ s, t }) => {
  const stow = ease.inOut(clamp01(s.stow ?? 0));
  if (stow > 0.995) return (
    <g>
      {/* what is left behind: a flush hatch with a lamp that says it was allowed */}
      <rect x={F.box.x0 + 8} y={F.box.y0 + 10} width={F.box.x1 - F.box.x0 - 16} height={F.box.y1 - F.box.y0 - 20} rx={10} fill={Q.steelLo} />
      <rect x={F.box.x0 + 8} y={F.box.y0 + 10} width={F.box.x1 - F.box.x0 - 16} height={7} rx={3} fill={Q.steelHi} opacity={0.5} />
      <circle cx={(F.box.x0 + F.box.x1) / 2} cy={F.box.y1 - 40} r={6} fill={Q.allow} />
      <Light cx={(F.box.x0 + F.box.x1) / 2} cy={F.box.y1 - 40} r={40} color={Q.allow} k={0.35} />
    </g>
  );
  const b = F.box, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
  const scr = { x: b.x0 + 16, y: b.y0 + 18, w: bw - 32, h: 110 };
  const on = ease.out(s.wake);
  const ring = s.ask > 0.01 ? ((t * 1.4) % 1) : 0;
  const allowCol = mix(mix('#2E7D55', Q.allow, on), '#8BFFC0', s.lit * 0.5);
  return (
    <g>
      <rect x={b.x0 - 4} y={b.y0 + 6} width={bw + 8} height={bh} rx={16} fill="#000000" opacity={0.3} />
      <rect x={b.x0} y={b.y0} width={bw} height={bh} rx={14} fill="#232C4F" />
      <rect x={b.x0} y={b.y0} width={bw} height={bh} rx={14} fill="none" stroke={Q.steelLo} strokeWidth={3} />
      {[[8, 8], [bw - 8, 8], [8, bh - 8], [bw - 8, bh - 8]].map(([dx, dy], i) => (
        <circle key={i} cx={b.x0 + dx} cy={b.y0 + dy} r={3} fill={Q.steel} />
      ))}
      {/* the screen: idle, a closed padlock. Woken, the SOURCE — the chat app that is asking */}
      <rect x={scr.x} y={scr.y} width={scr.w} height={scr.h} rx={8} fill={mix('#0A1026', '#0E2A22', on)} />
      <g opacity={1 - on}>
        <rect x={scr.x + scr.w / 2 - 12} y={scr.y + 40} width={24} height={20} rx={4} fill={Q.steelLo} />
        <path d={`M${scr.x + scr.w / 2 - 8} ${scr.y + 40} v-8 a8 8 0 0 1 16 0 v8`} fill="none" stroke={Q.steelLo} strokeWidth={4} />
      </g>
      {on > 0.01 && (
        <g opacity={on}>
          <Light cx={scr.x + scr.w / 2} cy={scr.y + scr.h / 2} r={90} color={Q.wa} k={0.35} />
          <circle cx={scr.x + 44} cy={scr.y + scr.h / 2} r={32} fill={Q.wa} />
          <Symbol kind="chat" cx={scr.x + 44} cy={scr.y + scr.h / 2} s={1.3} />
          {/* an arrow into a doorway: "wants to come in" */}
          <path d={`M${scr.x + 86} ${scr.y + scr.h / 2} h24`} stroke="#CFFFE6" strokeWidth={5} strokeLinecap="round" />
          <path d={`M${scr.x + 102} ${scr.y + scr.h / 2 - 9} l9 9 l-9 9`} stroke="#CFFFE6" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${scr.x + scr.w - 30} ${scr.y + 26} h16 v58 h-16`} stroke="#CFFFE6" strokeWidth={5} fill="none" strokeLinejoin="round" />
        </g>
      )}
      {/* DENY — smaller, red, and it stays unpressed */}
      <circle cx={F.deny.x} cy={F.deny.y + 3} r={F.deny.r} fill="#000000" opacity={0.35} />
      <circle cx={F.deny.x} cy={F.deny.y} r={F.deny.r} fill={mix('#6A2B34', Q.deny, on * 0.8)} />
      <path d={`M${F.deny.x - 9} ${F.deny.y - 9} l18 18 M${F.deny.x + 9} ${F.deny.y - 9} l-18 18`} stroke="#FFE3E5" strokeWidth={5} strokeLinecap="round" opacity={0.5 + on * 0.5} />
      {/* ALLOW — bigger, green, a real button: a housing ring, a cap that TRAVELS when pressed */}
      {ring > 0 && s.lit < 0.5 && (
        <circle cx={F.allow.x} cy={F.allow.y} r={F.allow.r + 6 + ring * 26} fill="none" stroke={Q.allow} strokeWidth={4 * (1 - ring)} opacity={s.ask * (1 - ring)} />
      )}
      <circle cx={F.allow.x} cy={F.allow.y + 2} r={F.allow.r + 6} fill="#141A33" />
      <circle cx={F.allow.x} cy={F.allow.y + 5} r={F.allow.r} fill={mix(allowCol, '#000000', 0.45)} />
      <g transform={`translate(0 ${s.press * 5})`}>
        <circle cx={F.allow.x} cy={F.allow.y} r={F.allow.r} fill={allowCol} />
        <circle cx={F.allow.x - 7} cy={F.allow.y - 9} r={F.allow.r * 0.45} fill="#FFFFFF" opacity={0.18} />
        <path d={`M${F.allow.x - 15} ${F.allow.y + 1} l10 11 l20 -22`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {s.lit > 0.01 && <Light cx={F.allow.x} cy={F.allow.y} r={110} color={Q.allow} k={0.7 * s.lit} />}
      {/* engraved: the two answers */}
      <text x={F.deny.x} y={b.y1 - 14} textAnchor="middle" fontSize={20} fontWeight={800} letterSpacing={1}
        fill="#9AA6C8" fontFamily='"Inter Tight","Inter",Arial,sans-serif'>DENY</text>
      <text x={F.allow.x} y={b.y1 - 14} textAnchor="middle" fontSize={23} fontWeight={800} letterSpacing={1}
        fill={mix('#9AA6C8', '#CFFFE6', on)} fontFamily='"Inter Tight","Inter",Arial,sans-serif'>ALLOW</text>
    </g>
  );
};

/* the conduit from the panel to the bolts. TWO runs, because the leaf is now held at both jambs:
   the trunk climbs out of the panel, turns under the cap, crosses the breach's head and drops
   down the LEFT jamb; the spur breaks off over the breach and drops down the RIGHT one. A pulse
   travels each, the spur a beat later — which is exactly the order the bolts clear in. */
const CY = F.wallTop + F.capH + 18;
const CONDUIT = `M${(F.box.x0 + F.box.x1) / 2} ${F.box.y0} V${CY} H${F.door.x0 - 13} V${JAMB_BOLT_Y[2]}`;
const CONDUIT_SPUR = `M${F.door.x0 - 13} ${CY} H${F.door.x1 + 13} V${JAMB_BOLT_Y[2]}`;

export const Wall3: React.FC<{ s: WallState; t: number; shake?: number }> = ({ s, t }) => {
  const pg = gid('panel3'), fg = gid('field3'), hg = gid('hitGlow3');
  const y0 = F.wallTop, capB = F.wallTop + F.capH;
  const fieldCol = (x: number) => {
    const d = Math.abs(x - s.hitX);
    return mix(Q.field, Q.warn, clamp01(s.hit * 1.5 * Math.exp(-d / 220)));
  };
  const overDoor = (x: number) => x > F.door.x0 && x < F.door.x1;
  /* THE RELEASE. The instant the last bolt clears, the leaf is standing on nothing: it drops a
     few units onto its own threshold and then goes. Without this the bolts retract and the panel
     waits politely, which is the single most common way a mechanism stops being one. */
  const rel = ease.out(Math.min(clamp01(s.boltL), clamp01(s.boltR)));
  const sinkY = ease.in(clamp01(s.sink)) * (F.ground - capB + 12) + rel * 11;
  const land = clamp01((s.sink - 0.82) / 0.18);
  return (
    <g>
      <defs>
        <LinGrad id={pg} stops={[[0, Q.steelHi], [0.12, Q.steel], [1, Q.steelLo]]} />
        <LinGrad id={fg} stops={[[0, Q.field, 0], [0.75, Q.field, 0.10], [1, Q.field, 0.26]]} />
        <RadGrad id={hg} stops={[[0, Q.warn, 0.75], [0.5, Q.warn, 0.25], [1, Q.warn, 0]]} />
      </defs>
      {/* THE FIELD: a curtain of light rising off the crest. It is what things actually hit. */}
      {[[-700, F.gate.x0 - 20], [F.gate.x1 + 20, F.door.x0], [F.door.x0, F.door.x1], [F.door.x1, W + 700]].map(([a, b], i) => (
        <rect key={i} x={a} y={y0 - 230} width={b - a} height={230} fill={`url(#${fg})`}
          opacity={i === 2 ? 1 - s.fieldOff : 1} />
      ))}
      {s.hit > 0.01 && (
        <g>
          <ellipse cx={s.hitX} cy={y0 - 70} rx={240} ry={150} fill={`url(#${hg})`} opacity={s.hit} />
          {/* hexagonal ripples: the field has a structure, and the impact shows it */}
          {[0, 1, 2].map((k) => {
            const ph = clamp01(1 - s.hit + k * 0.18);
            const r = 30 + ph * 170;
            const pts = Array.from({ length: 6 }, (_, j) => {
              const a = (Math.PI / 3) * j + Math.PI / 6;
              return `${s.hitX + Math.cos(a) * r},${y0 - 70 + Math.sin(a) * r * 0.62}`;
            }).join(' ');
            return <polygon key={k} points={pts} fill="none" stroke={Q.warn} strokeWidth={4 * (1 - ph)}
              opacity={s.hit * (1 - ph)} />;
          })}
        </g>
      )}
      {/* THE THRESHOLD POCKET — the slot in the ground the leaf drops into. Without it the leaf
          sinks into nothing and the opening reads as a wipe; with it the wall has somewhere to
          put its own panel, and the descent is a mechanism. */}
      <rect x={F.door.x0 - 6} y={F.ground - 20} width={F.door.x1 - F.door.x0 + 12} height={28} rx={3} fill="#0A0E1E" />
      <rect x={F.door.x0 - 6} y={F.ground - 20} width={F.door.x1 - F.door.x0 + 12} height={6} rx={3} fill={Q.steelDD} />
      {/* fixed panels (the two openings are not panels) */}
      {PANELS.map(([x0, x1], i) => <Panel key={i} x0={x0} x1={x1} seed={i} />)}
      {/* THE LEAF: the same material, held at both jambs; it drops into the threshold */}
      <defs><clipPath id="doorSlot3"><rect x={F.door.x0 - 2} y={capB - 2} width={F.door.x1 - F.door.x0 + 4} height={F.ground - capB + 20} /></clipPath></defs>
      <g clipPath="url(#doorSlot3)">
        <g transform={`translate(0 ${sinkY})`}>
          <Panel x0={F.door.x0} x1={F.door.x1} seed={99} />
          {/* the stiles the bolts are driven through, down both edges of the leaf */}
          {[F.door.x0 + 3, F.door.x1 - 15].map((sx) => (
            <rect key={sx} x={sx} y={capB} width={12} height={F.ground - capB} fill={Q.steelDD} opacity={0.7} />
          ))}
        </g>
      </g>
      {/* seams, with a sharp highlight on one lip: this is how panels meet */}
      {PANELS.map(([, x1], i) => (i === PANELS.length - 1 ? null : (
        <g key={i}>
          <rect x={x1 - 2} y={capB} width={4} height={F.ground - capB} fill={Q.seam} />
          <rect x={x1 + 2} y={capB} width={2} height={F.ground - capB} fill={Q.steelHi} opacity={0.4} />
        </g>
      )))}
      {/* the cap: a continuous steel beam with the field emitters in its face. It runs over the
          breach too — a wall's crest does not stop because a panel left — but it is only 34 deep,
          so it takes nothing off the opening. The 62-deep lintel that used to hang here is gone. */}
      {[[-700, F.gate.x0 - 20], [F.gate.x1 + 20, W + 700]].map(([a, b], i) => (
        <g key={i}>
          <rect x={a} y={y0} width={b - a} height={F.capH} fill={Q.cap} />
          <rect x={a} y={y0} width={b - a} height={4} fill={Q.steelHi} opacity={0.55} />
          {Array.from({ length: Math.ceil((b - a) / 30) }, (_, j) => {
            const ex = a + 10 + j * 30;
            const off = overDoor(ex) ? s.fieldOff : 0;
            const col = off > 0.5 ? '#3A4468' : fieldCol(ex);
            return <rect key={j} x={ex} y={y0 + 10} width={14} height={6} rx={3} fill={col}
              opacity={overDoor(ex) ? 1 - off * 0.4 + (off > 0.1 && off < 0.5 ? Math.sin(t * 90) * 0.4 : 0) : 1} />;
          })}
        </g>
      ))}
      {/* THE WALL HAS THICKNESS. Without this the office's white colonnade and the wall's white
          jamb posts met edge to edge and a blind read said the bars and the columns "merge into
          one striped field" — the centre of the composition was the worst-reading part of it.
          A reveal of shade inside the opening separates the two planes. */}
      {s.sink > 0.4 && (
        <g opacity={clamp01((s.sink - 0.4) / 0.3)}>
          <defs>
            <linearGradient id="breachShade" gradientUnits="userSpaceOnUse"
              x1={F.door.x0} y1={0} x2={F.door.x0 + 54} y2={0}>
              <stop offset="0" stopColor="#05080F" stopOpacity="0.62" />
              <stop offset="1" stopColor="#05080F" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="breachShade2" gradientUnits="userSpaceOnUse"
              x1={F.door.x1} y1={0} x2={F.door.x1 - 54} y2={0}>
              <stop offset="0" stopColor="#05080F" stopOpacity="0.52" />
              <stop offset="1" stopColor="#05080F" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x={F.door.x0} y={capB} width={54} height={F.ground - capB} fill="url(#breachShade)" />
          <rect x={F.door.x1 - 54} y={capB} width={54} height={F.ground - capB} fill="url(#breachShade2)" />
          <rect x={F.door.x0} y={capB} width={F.door.x1 - F.door.x0} height={26} fill="#05080F" opacity={0.45} />
        </g>
      )}
      {/* THE JAMBS — the two cut edges of the wall, with a steel edge channel capping each. This
          is what a panel leaves behind, and it is what the bolts are housed in. */}
      {[[F.door.x0 - 13, 1], [F.door.x1 - 13, -1]].map(([jx, dir], i) => (
        <g key={i}>
          <rect x={jx} y={capB - 6} width={26} height={F.ground - capB + 12} fill={Q.steelDD} />
          <rect x={jx + (dir > 0 ? 0 : 20)} y={capB - 6} width={6} height={F.ground - capB + 12}
            fill={Q.steelHi} opacity={0.45} />
          <rect x={jx - 3} y={capB - 12} width={32} height={12} rx={3} fill={Q.steel} />
        </g>
      ))}
      {/* the crest line of the field, bright and continuous */}
      {[[-700, F.gate.x0 - 20], [F.gate.x1 + 20, F.door.x0], [F.door.x0, F.door.x1], [F.door.x1, W + 700]].map(([a, b], i) => (
        <rect key={`cl${i}`} x={a} y={y0 - 3} width={b - a} height={4} fill={fieldCol((a + b) / 2)}
          opacity={(i === 2 ? 1 - s.fieldOff : 1) * 0.9} />
      ))}
      {/* the conduit: a channel, and a pulse that runs from ALLOW to the bolts down both jambs */}
      {[CONDUIT, CONDUIT_SPUR].map((d, k) => (
        <g key={k}>
          <path d={d} fill="none" stroke={Q.steelDD} strokeWidth={10} strokeLinejoin="round" />
          <path d={d} fill="none" stroke={mix(Q.steel, Q.allow, s.lit)} strokeWidth={3} opacity={0.7} strokeLinejoin="round" />
        </g>
      ))}
      {[CONDUIT, CONDUIT_SPUR].map((d, k) => {
        const u = clamp01((s.pulse - k * 0.22) / (1 - k * 0.22));
        if (u <= 0.001 || u >= 0.999) return null;
        return <path key={k} d={d} fill="none" stroke="#B8FFD8" strokeWidth={8} pathLength={1}
          strokeDasharray="0.12 1.2" strokeDashoffset={0.12 - u * 1.12} strokeLinecap="round" />;
      })}
      {/* THE SIX SHOT BOLTS, three per jamb. The left rank clears first, the right a beat later —
          so the leaf is briefly hanging on one side, and then it is hanging on nothing. */}
      {JAMB_BOLT_Y.map((by, i) => (
        <g key={by}>
          <ShotBolt x={F.door.x0 + 13} y={by} dir={1} out={clamp01(s.boltL * 1.25 - i * 0.12)}
            idle={s.stow ?? 0} />
          <ShotBolt x={F.door.x1 - 13} y={by} dir={-1} out={clamp01(s.boltR * 1.25 - i * 0.12)}
            idle={s.stow ?? 0} />
        </g>
      ))}
      <PermissionPanel s={s} t={t} />
      {/* IT LANDS. 340 of precast hitting the threshold throws dust up both jambs. */}
      {land > 0.01 && land < 0.999 && (
        <g opacity={(1 - land) * 0.8}>
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const sx = (k % 2 ? 1 : -1) * (30 + (k >> 1) * 74);
            const u = ease.out(land);
            return <ellipse key={k} cx={F.door.cx + sx * (0.6 + u * 0.7)} cy={F.ground - 14 - u * (26 + (k >> 1) * 9)}
              rx={20 + u * 42} ry={9 + u * 20} fill="#9FAFD4" opacity={0.30} />;
          })}
        </g>
      )}
      {/* the shutter that comes down over it — it does not simply vanish */}
      {(s.stow ?? 0) > 0.01 && (s.stow ?? 0) < 0.995 && (
        <g>
          <rect x={F.box.x0 + 4} y={F.box.y0 + 6} width={F.box.x1 - F.box.x0 - 8}
            height={(F.box.y1 - F.box.y0 - 12) * ease.inOut(clamp01(s.stow ?? 0))} rx={8} fill={Q.steelLo} />
          <rect x={F.box.x0 + 4} y={F.box.y0 + 6 + (F.box.y1 - F.box.y0 - 12) * ease.inOut(clamp01(s.stow ?? 0)) - 7}
            width={F.box.x1 - F.box.x0 - 8} height={7} rx={3} fill={Q.steelHi} />
        </g>
      )}
    </g>
  );
};

/* ── THE PLAY GATE: the one sanctioned way in ───────────────────────────────────────────────*/
export const PlayGate: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => {
  const g = F.gate, cg = gid('curtain3');
  const sweep = (t * 0.8) % 1;
  const LH = 62;                                    // the lintel is deep enough to carry the mark
  const pyl = (px: number) => (
    <g>
      <rect x={px - 4} y={g.top - 10} width={48} height={16} rx={3} fill={Q.steelHi} />
      <rect x={px} y={g.top} width={40} height={F.ground - g.top} fill={Q.steel} />
      <rect x={px} y={g.top} width={8} height={F.ground - g.top} fill={Q.steelHi} opacity={0.7} />
      <rect x={px + 32} y={g.top} width={8} height={F.ground - g.top} fill={Q.steelDD} opacity={0.6} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={px + 16} y={g.top + 96 + i * 50} width={8} height={24} rx={4} fill="#6CF5B0"
          opacity={0.45 + 0.45 * Math.sin(t * 3 - i)} />
      ))}
      <rect x={px - 6} y={F.ground - 26} width={52} height={28} rx={3} fill={Q.steelDD} />
    </g>
  );
  return (
    <g>
      <defs><LinGrad id={cg} stops={[[0, '#6CF5B0', 0.10], [1, '#6CF5B0', 0.34]]} /></defs>
      <rect x={g.x0 + 20} y={g.top + LH} width={g.x1 - g.x0 - 40} height={F.ground - g.top - LH}
        fill={`url(#${cg})`} opacity={k} />
      <rect x={g.x0 + 20} y={g.top + LH + sweep * (F.ground - g.top - LH - 6)} width={g.x1 - g.x0 - 40}
        height={5} fill="#CFFFE6" opacity={0.9 * k} />
      {pyl(g.x0 - 20)}
      {pyl(g.x1 - 20)}
      {/* the lintel beam */}
      <rect x={g.x0 - 30} y={g.top} width={g.x1 - g.x0 + 60} height={LH} fill={Q.steel} />
      <rect x={g.x0 - 30} y={g.top} width={g.x1 - g.x0 + 60} height={7} rx={3} fill={Q.steelHi} />
      <rect x={g.x0 - 30} y={g.top + LH - 7} width={g.x1 - g.x0 + 60} height={7} fill={Q.steelDD} opacity={0.8} />
      {/* THE STORE'S MARK, CUT INTO THE BEAM — a recess with a shadow on its upper lip and a lit
          lower chamfer, the way a mark carved into metal actually reads. Nothing floats. */}
      <g transform={`translate(${g.cx} ${g.top + LH / 2})`}>
        <path d="M-17 -21 L20 -2 L-17 19 Z" fill="#000000" opacity={0.45}
          transform="translate(0 -2)" />
        <path d="M-17 -21 L20 -2 L-17 19 Z" fill={Q.steelDD} />
        <path d="M-17 -21 L4 -8 L-17 3 Z" fill="#00B8FF" opacity={0.85} />
        <path d="M-17 -21 L20 -2 L4 -8 Z" fill="#00D873" opacity={0.85} />
        <path d="M-17 19 L4 -8 L20 -2 Z" fill="#FFC23A" opacity={0.8} />
        <path d="M-17 19 L-17 3 L4 -8 Z" fill="#FF4D5E" opacity={0.8} />
        <path d="M-17 -21 L20 -2 L-17 19" fill="none" stroke={Q.steelHi} strokeWidth={2.4} opacity={0.7}
          transform="translate(0 2)" />
      </g>
      <Light cx={g.cx} cy={g.top + LH / 2} r={150} color="#6CF5B0" k={0.18 + 0.12 * k} />
    </g>
  );
};

/** store apps on the conveyor: they ride in, pass the scan, are ticked, and go through */
export const StoreQueue: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 4 }, (_, i) => {
      const u = ((t * 0.16 + i / 4) % 1);
      const k = Math.pow(1 - u, 1.5);
      const yy = lerp(F.ground - 30, H - 120, k);
      const s = lerp(0.72, 1.9, k);
      const app = APPS[[1, 3, 7, 9][i]];
      const ticked = u > 0.86;
      if (u > 0.97) return null;
      return (
        <g key={i} transform={`translate(${F.gate.cx} ${yy}) scale(${s})`}>
          <ellipse cx={0} cy={40} rx={36} ry={7} fill="#000000" opacity={0.35} />
          <rect x={-32} y={-32} width={64} height={64} rx={17} fill={app.col} />
          <Symbol kind={app.sym} cx={0} cy={0} s={1.1} />
          {ticked && (
            <g transform={`translate(28 -28) scale(${ease.out(clamp01((u - 0.86) / 0.05))})`}>
              <circle r={14} fill="#6CF5B0" /><path d="M-6 0 l4 4 l8 -9" stroke="#0A3A24" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/* ── THE WARNING SHIELD — projected up out of the field emitter, hinged at the crest ──────────
   `unfold` raises it out of the emitter and spreads its wings; `tip` swings it backward about its
   hinge on the crest until it falls behind the wall (the warning, pushed aside). */
export const Shield3: React.FC<{ x: number; unfold: number; tip: number; flash?: number }> = ({ x, unfold, tip, flash = 0 }) => {
  if (unfold <= 0.001) return null;
  const hinge = F.wallTop;
  const u = outBack(unfold);
  const rise = (1 - clamp01(unfold * 1.6)) * 190;
  const wing = clamp01(unfold * 1.3);
  const fy = Math.cos(clamp01(tip) * Math.PI * 0.5);
  const shade = mix('#FFB23E', '#8A5A1A', clamp01(tip * 1.2));
  return (
    <g>
      <defs><clipPath id="shieldAbove3"><rect x={x - 400} y={-800} width={800} height={hinge + 800} /></clipPath></defs>
      <g clipPath="url(#shieldAbove3)">
        <g transform={`translate(${x} ${hinge}) scale(1 ${Math.max(0.001, fy)}) translate(${-x} ${-hinge})`}>
          <g transform={`translate(${x} ${hinge - 150 + rise}) scale(${lerp(0.5, 1, u)} 1)`}>
            <Light cx={0} cy={0} r={230} color={Q.warn} k={(0.55 + flash * 0.4) * (1 - tip)} />
            {/* the mast: it is attached to the wall, not floating */}
            <rect x={-6} y={80} width={12} height={80} fill="#8A5A1A" />
            <path d="M0 -104 L86 -72 V8 C86 62 44 94 0 112 C-44 94 -86 62 -86 8 V-72 Z" fill="#8A5A1A" />
            <path d="M0 -88 L70 -61 V7 C70 51 36 78 0 94 C-36 78 -70 51 -70 7 V-61 Z" fill={shade} />
            {/* two plates meeting at the spine: it assembled from the sides */}
            <path d={`M0 -88 V94`} stroke="#8A5A1A" strokeWidth={3} opacity={0.5 * wing} />
            <g opacity={clamp01((unfold - 0.55) / 0.3)}>
              <rect x={-11} y={-52} width={22} height={76} rx={11} fill="#3E2404" />
              <circle cx={0} cy={50} r={13} fill="#3E2404" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
};

export const DRONE_G = 1.25;
/* ── THE SOURCE: WhatsApp's delivery drone ──────────────────────────────────────────────────*/
export const Drone: React.FC<{ x: number; y: number; s: number; tilt: number; t: number;
  line?: number; swing?: number; carry?: boolean; led?: number; parcel?: React.ReactNode;
  body?: string; bodyDark?: string; mark?: React.ReactNode; rig?: string }> =
  ({ x, y, s, tilt, t, line = 86, swing = 0, carry = true, led = 0, parcel,
     body, bodyDark, mark, rig }) => {
    const CB = body ?? Q.wa, CD = bodyDark ?? Q.waD, CR = rig ?? '#0B3B2E';
    const blur = (ph: number) => (
      <g>
        <ellipse cx={0} cy={0} rx={52} ry={7} fill="#DDF8EC" opacity={0.28} />
        <ellipse cx={0} cy={0} rx={52 * Math.abs(Math.cos(t * 60 + ph))} ry={3} fill="#FFFFFF" opacity={0.5} />
        <circle r={6} fill={CR} />
      </g>
    );
    return (
      <g transform={`translate(${x} ${y}) scale(${s * DRONE_G})`}>
        {/* the tether and what hangs from it: a pendulum that lags the drone's own motion */}
        {carry && (
          <g transform={`rotate(${swing})`}>
            <path d={`M0 22 V${line}`} stroke={CR} strokeWidth={3} />
            <path d={`M-8 ${line} h16 l-3 8 h-10 z`} fill={CR} />
            <g transform={`translate(0 ${line + 52})`}>{parcel}</g>
          </g>
        )}
        <g transform={`rotate(${tilt})`}>
          {/* arms and rotors */}
          <path d="M-40 -8 L-96 -26 M40 -8 L96 -26" stroke={CD} strokeWidth={9} strokeLinecap="round" />
          <rect x={-102} y={-40} width={12} height={16} rx={3} fill={CD} />
          <rect x={90} y={-40} width={12} height={16} rx={3} fill={CD} />
          <g transform="translate(-96 -42)">{blur(0)}</g>
          <g transform="translate(96 -42)">{blur(1.3)}</g>
          {/* the pod: the source's colour, and its mark */}
          <rect x={-54} y={-30} width={108} height={52} rx={22} fill={CD} />
          <rect x={-54} y={-34} width={108} height={46} rx={22} fill={CB} />
          <rect x={-40} y={-30} width={60} height={8} rx={4} fill="#FFFFFF" opacity={0.3} />
          <circle cx={0} cy={-11} r={17} fill="#FFFFFF" />
          {mark ?? <g transform="translate(0 -11) scale(0.62)"><Symbol kind="chat" cx={0} cy={0} s={1} color={CB} /></g>}
          <circle cx={0} cy={20} r={5} fill={mix('#1A4D3C', '#B8FFE6', led)} />
          {led > 0.05 && <Light cx={0} cy={20} r={40} color="#B8FFE6" k={led * 0.7} />}
        </g>
      </g>
    );
  };

/* ── THE PARCEL, able to OPEN: flaps swing up about the box's top corners ───────────────────*/
export const Box3: React.FC<{ s?: number; open?: number; rot?: number; squash?: number; collapse?: number }> =
  ({ s = 1, open = 0, rot = 0, squash = 0, collapse = 0 }) => {
    const gp = gid('box3');
    const o = ease.out(clamp01(open));
    const c = ease.in(clamp01(collapse));
    return (
      <g transform={`rotate(${rot}) scale(${s * (1 + squash * 0.12)} ${s * (1 - squash * 0.12)})`}>
        <defs><LinGrad id={gp} stops={[[0, '#E2B07A'], [0.5, '#C98E55'], [1, '#9E6A3C']]} /></defs>
        {/* flaps behind the box when open */}
        <g transform={`rotate(${-o * 130} -54 -46)`}><rect x={-54} y={-62} width={56} height={18} rx={3} fill="#D6A26A" /></g>
        <g transform={`rotate(${o * 130} 54 -46)`}><rect x={-2} y={-62} width={56} height={18} rx={3} fill="#D6A26A" /></g>
        <g transform={`translate(0 ${c * 60}) scale(1 ${1 - c * 0.85})`}>
          <rect x={-54} y={-46} width={108} height={96} rx={8} fill={`url(#${gp})`} />
          {o < 0.3 && <rect x={-54} y={-46} width={108} height={20} rx={6} fill="#EBC08E" opacity={1 - o / 0.3} />}
          {o > 0.05 && <rect x={-50} y={-46} width={100} height={12} rx={3} fill="#3A2412" opacity={o} />}
          <rect x={-9} y={-46} width={18} height={96} fill="#F3D9A8" opacity={0.9 * (1 - o)} />
          <g transform="translate(24 16)" fill="#6B4323" opacity={0.85}>
            {[0, 1].map((r) => [0, 1].map((cc) => (
              <rect key={`${r}${cc}`} x={-12 + cc * 13} y={-12 + r * 13} width={10} height={10} rx={2.5} />
            )))}
          </g>
        </g>
      </g>
    );
  };

/** HOW FAR THE FRONT HAS TO GO. The panel runs from the plinth's top (-46) to the architrave's
 *  underside (beamY - 34), and it has to end up entirely inside the plinth or a band of stone is
 *  left standing in the opening. Solved from the panel's own height, not typed. */
export const FRONT_DROP = (colH: number) => (-46) - (-46 - colH - 34) + 10;

/* ── THE FAKE OFFICE — it unpacks OUT of the parcel ──────────────────────────────────────────
   Construction order: the plinth slides out of the box, columns extend up, the beam drops and
   locks, the pediment closes over it, the seal is set, the flag goes up. Cobalt: borrowed
   authority, the same blue as the service it will open into. */
export const Office3: React.FC<{ x: number; base: number; s: number; build: number; t: number;
  colH?: number; spine?: number; eye?: number; rec?: number; front?: number; latch?: number }> =
  ({ x, base, s, build, t, colH = 420, spine = 0, eye = 0, rec = 0, front = 0, latch = 0 }) => {
    const st = (a2: number, b2: number) => clamp01((build - a2) / (b2 - a2));
    const plinth = ease.out(st(0, 0.18)), cols = ease.out(st(0.12, 0.5)), beam = st(0.46, 0.64),
      ped = ease.out(st(0.6, 0.8)), seal = st(0.76, 0.92);
    const stone = '#EEF2FA', stoneD = '#B8C3DC', stoneDD = '#8D9AB8', blue = Q.cobalt;
    const beamY = -46 - colH;
    const drop = (1 - outBack(beam)) * -90;
    /* how far the LAST pin has cleared — the panel is held until every one of them is out */
    const pinRel = ease.out(Math.min(...[0, 1, 2, 3]
      .map((i) => clamp01((clamp01(latch) - i * 0.131) / 0.476))));
    const glow = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2));
    return (
      <g transform={`translate(${x} ${base}) scale(${s})`}>
        {/* ── steps and plinth */}
        {plinth > 0 && <>
          {[0, 1, 2].map((k) => (
            <rect key={k} x={(-192 + k * 10) * plinth} y={-16 - k * 11} width={(384 - k * 20) * plinth}
              height={12} rx={2} fill={k % 2 ? stoneD : stone} />
          ))}
          <rect x={-170 * plinth} y={-46} width={340 * plinth} height={30} fill={stoneD} />
          <rect x={-182 * plinth} y={-52} width={364 * plinth} height={10} rx={3} fill={stone} />
        </>}
        {/* ── THE SERVICE SPINE: the shaft from the lobby to the roof. What arrives below travels
              up it, and the mast is what comes out of the top. This is the causal path, drawn. */}
        {cols > 0.8 && (
          <g>
            <rect x={-19} y={beamY + 6} width={38} height={colH - 190} rx={6} fill="#182349" />
            <rect x={-13} y={beamY + 12} width={26} height={colH - 202} rx={4} fill="#0D1430" />
            {spine > 0.01 && (() => {
              const y0 = -46 - 214 + 40, y1 = beamY + 16;
              const yy = lerp(y0, y1, ease.inOut(clamp01(spine)));
              return (
                <g>
                  <rect x={-13} y={y1} width={26} height={y0 - y1} fill="#8FE8FF" opacity={0.14} />
                  <rect x={-13} y={yy} width={26} height={Math.max(0, y0 - yy)} fill="#8FE8FF" opacity={0.34} />
                  <rect x={-13} y={yy - 18} width={26} height={24} rx={5} fill="#CFF8FF" opacity={0.9} />
                  <Light cx={0} cy={yy} r={150} color="#8FE8FF" k={0.6} />
                </g>
              );
            })()}
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-22} y={beamY + 40 + k * ((colH - 240) / 4)} width={44} height={6} rx={3} fill="#101835" />
            ))}
          </g>
        )}
        {/* ── THE FRONT, WHICH SINKS ────────────────────────────────────────────────────────────
              The lit storeys, the portal and the colonnade are ONE PANEL, and act 3 drops it into
              the plinth — the same mechanism the boundary wall used in act 1, where a precast
              panel sank under its lintel to make a doorway. The film has already taught that a
              panel sinks, so the app's own front doing it needs no explaining: what it uncovers is
              that there was never anything behind it.
              Everything OUTSIDE this group stays: the plinth it sinks into, the service spine it
              was standing in front of, and the entablature, pediment and medallion the machine is
              bolted through. The roof is real. The front was not. */}
        {(() => null)()}
        <g clipPath={front > 0.001 ? `url(#${gid('officeFront')})` : undefined}>
          <defs>
            <clipPath id={gid('officeFront')}>
              <rect x={-260} y={beamY - 120} width={520} height={-46 - (beamY - 120)} />
            </clipPath>
          </defs>
          {/* THE RELEASE. The instant the last pin clears, the panel is standing on nothing: it
              settles nine units onto its own travel and then goes. Without it the pins retract and
              the facade waits politely, which is the single most common way a mechanism stops
              being one — the boundary wall's leaf in act 1 has had this since it was built. */}
          <g transform={`translate(0 ${pinRel * 9
            + ease.inOut(clamp01(front)) * (FRONT_DROP(colH) - 9)})`}>
        {/* ── the block the colonnade stands in front of, so the portal is a room and not a hole */}
        {cols > 0.55 && (() => {
          /* the storeys the colonnade stands in front of. Lit, and built out of the same stone —
             a civic building is occupied, and a dark field between columns reads as a hole. */
          const by = -46 - colH + 30, bh = colH - 30;
          return (
            <g>
              <rect x={-176} y={by} width={352} height={bh} fill="#33477E" />
              <rect x={-176} y={by} width={13} height={bh} fill="#4A63A2" />
              <rect x={163} y={by} width={13} height={bh} fill="#22315C" />
              <rect x={-176} y={by} width={352} height={11} fill="#22315C" />
              {/* THE WINDOWS HAVE TO READ AS WINDOWS. They were 44 wide standing behind a
                  colonnade whose gaps are 29, so every one of them was clipped to a sliver by the
                  columns in front and the four of them merged into one continuous warm band —
                  which makes the reveal's punchline ("those were four bare lamps") land on
                  something the viewer never saw as windows. They are narrower than their gap now,
                  with a reveal the thickness of the panel and a transom across the middle, and
                  their x positions are the ones shell.tsx hangs its lamps on. */}
              {[0, 1].map((r) => (
                <g key={r}>
                  {[-95, -32, 32, 95].map((wx) => {
                    const wy = by + 44 + r * 76;
                    return (
                      <g key={wx}>
                        <rect x={wx - 12.5} y={wy} width={25} height={58} rx={2.5} fill="#0B1228" />
                        <rect x={wx - 9} y={wy + 4} width={18} height={50} rx={2}
                          fill={mix(Q.window, '#3C2A10', 0.44)} />
                        <rect x={wx - 9} y={wy + 4} width={18} height={23} rx={2}
                          fill={mix(Q.window, '#FFF0CC', 0.22)} />
                        <rect x={wx - 9} y={wy + 27} width={18} height={3} fill="#0B1228" />
                        <rect x={wx - 12.5} y={wy} width={25} height={4} rx={2} fill="#1B2647" />
                      </g>
                    );
                  })}
                </g>
              ))}
            </g>
          );
        })()}
        {/* ── THE PORTAL: a lit lobby, a framed opening, a door standing ajar. Never a black slab.
              The payload is taken in here, and its light is what runs up the spine. */}
        {cols > 0.7 && (() => {
          const pH = 214, pW = 150, pY = -46 - pH;
          return (
            <g>
              <rect x={-pW / 2 - 16} y={pY - 16} width={pW + 32} height={pH + 16} rx={6} fill={stoneD} />
              <rect x={-pW / 2 - 8} y={pY - 8} width={pW + 16} height={pH + 8} rx={4} fill={stoneDD} />
              {/* the lobby behind it: warm, deep, and it recedes */}
              <rect x={-pW / 2} y={pY} width={pW} height={pH} fill="#3A2E24" />
              <rect x={-pW / 2} y={pY} width={pW} height={pH} fill={`url(#${gid('officeLobby')})`} />
              <defs>
                <LinGrad id={gid('officeLobby')} stops={[[0, '#6B5636'], [0.55, '#2A2436'], [1, '#141A30']]} />
              </defs>
              {/* the floor of the lobby, catching the light */}
              <path d={`M${-pW / 2} -46 L${pW / 2} -46 L${pW / 2 - 34} ${pY + pH * 0.55} L${-pW / 2 + 34} ${pY + pH * 0.55} Z`}
                fill={Q.glowIn} opacity={0.13} />
              {/* one leaf of the door, standing open against the jamb */}
              <path d={`M${-pW / 2} ${pY} L${-pW / 2 + 40} ${pY + 22} L${-pW / 2 + 40} ${-68} L${-pW / 2} -46 Z`}
                fill={stoneD} opacity={0.9} />
              <rect x={-pW / 2 + 34} y={pY + 90} width={5} height={22} rx={2} fill={stone} />
              <rect x={-pW / 2 - 16} y={pY - 22} width={pW + 32} height={10} rx={3} fill={stone} />
              {/* what is inside, once it has been taken in */}
              {spine > 0.01 && <Light cx={0} cy={pY + pH * 0.62} r={150} color="#8FE8FF" k={0.30 * glow * spine} />}
            </g>
          );
        })()}
        {/* ── the colonnade: bases, flutes, capitals */}
        {[-126, -63, 0, 63, 126].map((cxx, i) => {
          const hh = colH * clamp01(cols * 1.3 - i * 0.07);
          if (hh <= 0) return null;
          const ty = -46 - hh;
          return (
            <g key={i}>
              <rect x={cxx - 19} y={-52} width={38} height={12} rx={2} fill={stoneD} />
              <rect x={cxx - 17} y={ty} width={34} height={hh} fill={stone} />
              <rect x={cxx - 17} y={ty} width={7} height={hh} fill="#FFFFFF" opacity={0.75} />
              <rect x={cxx + 10} y={ty} width={7} height={hh} fill={stoneD} opacity={0.75} />
              {[-6, 2].map((fx) => <rect key={fx} x={cxx + fx} y={ty + 10} width={3} height={hh - 20} fill={stoneD} opacity={0.5} />)}
              <rect x={cxx - 22} y={ty - 14} width={44} height={16} rx={3} fill={stone} />
              <rect x={cxx - 22} y={ty + 2} width={44} height={5} fill={stoneD} opacity={0.6} />
            </g>
          );
        })}
            {/* ── THE FOUR PINS THE FRONT HANGS FROM ─────────────────────────────────────
                  A panel this size does not stand up on its own, and the score has been playing
                  four bolts letting go on "was" while the picture released nothing. The colonnade
                  leaves exactly four gaps, and the band between the block's head and the
                  entablature's underside is visible only through them — so that is where the pins
                  are, bridging the one joint you can actually see. They are drawn inside the
                  sinking group, so they go down with the thing they were holding. */}
            {[-95, -32, 32, 95].map((lx, i) => {
              const out = clamp01((clamp01(latch) - i * 0.131) / 0.476);
              const e = ease.in(out);
              return (
                <g key={lx}>
                  {/* the socket in the entablature's underside the pin was driven into */}
                  <rect x={lx - 9} y={beamY + 1} width={18} height={6} rx={2} fill="#0A1024" />
                  {/* the housing bolted to the panel's head */}
                  <rect x={lx - 14} y={beamY + 27} width={28} height={21} rx={3} fill="#2A3558" />
                  <rect x={lx - 14} y={beamY + 27} width={28} height={5} rx={2.5} fill="#8290BE" />
                  {[-9, 9].map((dx) => (
                    <circle key={dx} cx={lx + dx} cy={beamY + 42} r={2.8} fill="#0A1024" />
                  ))}
                  <g transform={`translate(0 ${e * 30})`}>
                    <rect x={lx - 6} y={beamY + 3} width={12} height={31} fill={stoneD} />
                    <rect x={lx - 6} y={beamY + 3} width={4} height={31} fill={stone} />
                    <rect x={lx - 9} y={beamY + 25} width={18} height={8} rx={2} fill="#5E6E9A" />
                  </g>
                </g>
              );
            })}
            {/* the panel's own top edge, which is all the thickness it has */}
            {front > 0.004 && (
              <g>
                <rect x={-182} y={beamY - 34} width={364} height={13} rx={3} fill={stone} />
                <rect x={-182} y={beamY - 23} width={364} height={5} fill="#7E8CB8" />
              </g>
            )}
          </g>
        </g>
        {/* ── entablature: architrave, a cobalt frieze, a cornice with dentils */}
        {beam > 0 && <g transform={`translate(0 ${drop})`}>
          <rect x={-192} y={beamY - 30} width={384} height={16} fill={stone} />
          <rect x={-192} y={beamY - 14} width={384} height={16} fill={blue} />
          {Array.from({ length: 19 }, (_, k) => (
            <rect key={k} x={-184 + k * 20} y={beamY - 40} width={11} height={11} fill={stoneD} />
          ))}
          <rect x={-200} y={beamY - 52} width={400} height={13} rx={3} fill={stone} />
        </g>}
        {/* ── pediment with a recessed tympanum */}
        {ped > 0 && <>
          <path d={`M-202 ${beamY - 52} L0 ${beamY - 52 - 112 * ped} L202 ${beamY - 52} Z`} fill={stone} />
          <path d={`M-164 ${beamY - 58} L0 ${beamY - 58 - 88 * ped} L164 ${beamY - 58} Z`} fill={stoneDD} opacity={0.55} />
          <rect x={-206} y={beamY - 58} width={412} height={8} rx={3} fill={stone} />
        </>}
        {/* THE MEDALLION — the app's own mark, set into the tympanum as relief. It is a camera
            lens, which is what an e-Challan actually comes off, so at a glance it is a plausible
            government seal. It is also an eye, and `eye` opens its iris: nothing is added to make
            it sinister, ONE light comes on inside it and the reading changes. */}
        {seal > 0 && (
          <g transform={`translate(0 ${beamY - 100}) scale(${outBack(seal)})`}>
            <circle r={48} fill={stoneDD} opacity={0.75} />
            <circle r={44} fill={mix(blue, '#0B1330', 0.25)} />
            <AppLens r={38} open={lerp(0.14, 0.94, ease.inOut(clamp01(eye)))} rec={rec} glass={0.8} />
            {/* the stone bezel it is bedded into, lit from above like the rest of the pediment */}
            <circle r={46} fill="none" stroke={stone} strokeWidth={4} opacity={0.55} />
            <path d={`M-44 0 A44 44 0 0 1 0 -44`} fill="none" stroke={stone} strokeWidth={5}
              strokeLinecap="round" opacity={0.85} />
            {rec > 0.05 && <Light cx={0} cy={0} r={150} color="#FF5A4E" k={0.30 * rec} />}
          </g>
        )}
      </g>
    );
  };
/** where the office's medallion sits in q — the mark that becomes the new app icon */
export const officeSealAt = (x: number, base: number, s: number, colH = 420) =>
  ({ x, y: base + (-46 - colH - 100) * s });

/** WHERE THE APPARATUS BOLTS ON. One source of truth for every organ's mount, derived from the
 *  building's own mouldings rather than guessed, so moving the office moves everything with it.
 *  All of it is ON THE CORNICE: the plot is 430 wide with the city hard against both sides, and
 *  the pediment hides the roof behind it, so the cornice ledge is the only surface this building
 *  has that clears the boundary wall AND is wide enough to stand machinery on. */
export const OFFICE_MOUNT = (x: number, base: number, s: number, colH = 420) => {
  const beamY = -46 - colH;
  const corn = base + (beamY - 52) * s;          // the cornice's top: the ledge
  /* the pediment's sloping face, as a function of how far out along it you are. The hoist tips
     its load into this slope and the satellite breaks out through it — both need the roofline,
     not a guess at it. */
  const rake = (lx: number) => base + ((beamY - 52) - 112 * (1 - Math.abs(lx) / 202)) * s;
  const SAT = 117;                                // how far out the satellite stands, in local x
  return {
    ledgeY: corn,
    ledgeX0: x - 200 * s, ledgeX1: x + 200 * s,
    apex: { x, y: base + (beamY - 52 - 112) * s },   // the pediment's point: the mast stands here
    seal: { x, y: base + (beamY - 100) * s },
    /* THE MAIL HOIST moved 26 local units inboard. Its hopper hangs a further 65 off the boot,
       and at the old mount that hopper was over the chat tower's parapet. */
    sms: { x: x - 134 * s, y: corn },
    /* where the hoist tips its load: an intake recessed into the pediment's own face, on the rake */
    duct: { x: x - 82 * s, y: base + (beamY - 118) * s },
    /* THE SATELLITE IS NOT ON THE LEDGE. Its stem rises from the roof BEHIND the pediment, so
       the foot of it is hidden by the slope — which is both how a mast on a roof actually reads
       from the street and the only way this one can stand clear of the antenna to its left and
       the line tap below it. `vpnRoof` is where it breaks the roofline: the hatch is there, and
       so is the end of its feeder. */
    vpn: { x: x + SAT * s, y: corn },
    vpnRoof: { x: x + SAT * s, y: rake(SAT) },
    /* THE LINE TAP hangs BELOW the cornice on a bracket, down the building's right flank — it
       is the only organ that is not on the roof, because the satellite needs the roof's right
       half and a service cabinet belongs on a wall anyway. */
    call: { x: x + 136 * s, y: corn + 50 },
  };
};

/* ── THE KEEP-OUT ───────────────────────────────────────────────────────────────────────────
   The air the app's machinery occupies, in q, measured from the mounts above plus each machine's
   own real half-width: the hoist's hopper reaches 65 left of its boot, the line tap's gland 60
   right of its centre, the satellite's dish 72 right of its stem. CLEAR is the gap the city has
   to leave around it. Nothing below this line is decorative — if it fails, the render is wrong. */
const ZONE_MOUNT = OFFICE_MOUNT(PLOT3.cx, F.court, 1.15);
export const APP_ZONE = {
  x0: ZONE_MOUNT.sms.x - 66,
  x1: Math.max(ZONE_MOUNT.call.x + 88, ZONE_MOUNT.vpn.x + 90),
};
export const ZONE_CLEAR = 30;
NEAR3.forEach((b) => {
  if (b.x < APP_ZONE.x1 + ZONE_CLEAR && b.x + b.w > APP_ZONE.x0 - ZONE_CLEAR)
    throw new Error(`the ${b.kind} building (${b.x}..${b.x + b.w}) stands inside the app's `
      + `apparatus zone ${(APP_ZONE.x0 - ZONE_CLEAR).toFixed(0)}..`
      + `${(APP_ZONE.x1 + ZONE_CLEAR).toFixed(0)} — move the building or the organ, not the assert`);
});
/* and no two identity signs may crowd each other: an 80-wide sign needs its own air or the two
   read as one object at the distance this film watches the city from */
NEAR3.forEach((b, i) => {
  if (!i) return;
  const a = NEAR3[i - 1];
  const gap = (b.x + b.w / 2 + (b.kind === 'phone' ? 26 : 0))
    - (a.x + a.w / 2 + (a.kind === 'phone' ? 26 : 0)) - 90;
  const vOverlap = Math.min(a.top, b.top) + 107 > Math.max(a.top, b.top);
  if (gap < 26 && vOverlap)
    throw new Error(`the ${a.kind} and ${b.kind} signs are ${gap.toFixed(0)} apart at the same height`);
});

/* ════ ACT 2 — inside the phone: the payload, the mast, the wired facilities ═══════════════════
   The second install and the permissions happen in the SAME city, so the film stays one place.
   The "update" is the real malware: a dense double-shelled capsule, darker than everything and
   never red, carried in through the door the user opened and docked into the fake office. From
   the office a MAST rises; each permission the victim grants strings a live cable from a city
   FACILITY (its capability's colour) to that mast. The VPN is a tunnel bored under the wall out
   to the violet world. All four colours are the ones the later theft/recap acts reuse. */

/** the malware payload — premortem F3: distinctive, compact, double-shelled, one diagnostic light,
 *  NOT sinister-looking. Kept alive faintly from here to the reveal. */
export const Payload3: React.FC<{ s?: number; rot?: number; open?: number; pulse?: number }> =
  ({ s = 1, rot = 0, open = 0, pulse = 0 }) => {
    const g = gid('payload3');
    const o = ease.out(clamp01(open));
    const glow = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(pulse * 2 * Math.PI));
    return (
      <g transform={`rotate(${rot}) scale(${s})`}>
        <defs><LinGrad id={g} stops={[[0, '#3A4468'], [0.5, '#232C4B'], [1, '#141A30']]} /></defs>
        {/* outer shell: two halves parted by `open` */}
        <g transform={`translate(0 ${-o * 34})`}><path d="M-46 -6 q0 -40 46 -40 q46 0 46 40 l-4 6 h-84 Z" fill="#2A3352" /></g>
        <g transform={`translate(0 ${o * 34})`}><path d="M-46 6 q0 40 46 40 q46 0 46 -40 l-4 -6 h-84 Z" fill="#20283F" /></g>
        {/* inner core: a rounded capsule with a machined seam and one live light */}
        <rect x={-40} y={-44} width={80} height={88} rx={22} fill={`url(#${g})`} />
        {/* a cold rim down one edge: without it a dark object on a dark ground is a hole */}
        <path d="M-40 -22 v44 a22 22 0 0 0 22 22 h6" fill="none" stroke="#6E85C8" strokeWidth={3.5}
          strokeLinecap="round" opacity={0.75} />
        <rect x={-40} y={-6} width={80} height={5} fill="#0C1120" opacity={0.7} />
        <rect x={-34} y={-38} width={22} height={9} rx={4} fill="#4A5888" opacity={0.75} />
        <circle cx={0} cy={22} r={11} fill={mix('#2A3352', '#8FE8FF', glow)} />
        <circle cx={0} cy={22} r={11} fill="none" stroke="#0C1120" strokeWidth={2} />
        {pulse > 0 && <circle cx={0} cy={22} r={11 + glow * 10} fill="none" stroke="#8FE8FF" strokeWidth={2.4} opacity={0.45 * glow} />}
      </g>
    );
  };

/** the mast that rises from the fake office roof once the payload is docked: the thing the
 *  permission cables plug into. A dark spine with a socket ring per capability. */
export const CAP_ORDER = ['sms', 'call', 'bg', 'vpn'] as const;
export type Cap3 = typeof CAP_ORDER[number];
export const CAP_COL: Record<Cap3, string> = { sms: '#2FD0D8', call: '#9A86EE', bg: '#E3A24B', vpn: '#E2569B' };
/** THE UPDATE ITSELF — a cased, folded antenna.
 *  This one object is the app's update icon on the dialog, the thing the drone carries through the
 *  doorway, and the thing that becomes the mast. It is drawn as a case with a seam and four
 *  latched panels precisely so that opening it is believable: real deployable masts ship folded
 *  in a case exactly like this. `s` scales it about its own centre. */
export const UpdateTile: React.FC<{ s?: number; glow?: number }> = ({ s = 1, glow = 0 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-52} y={-52} width={104} height={104} rx={26} fill="#24408F" />
    <rect x={-52} y={-52} width={104} height={104} rx={26} fill="none" stroke="#16295E" strokeWidth={4} />
    <rect x={-44} y={-44} width={88} height={88} rx={20} fill={Q.cobalt} />
    <rect x={-44} y={-44} width={88} height={30} rx={16} fill="#FFFFFF" opacity={0.12} />
    {/* the seam the case opens on, and the four latches that hold it shut */}
    <path d="M-44 0 H44" stroke="#16295E" strokeWidth={3} opacity={0.75} />
    <path d="M0 -44 V44" stroke="#16295E" strokeWidth={3} opacity={0.45} />
    {[[-30, -30], [30, -30], [-30, 30], [30, 30]].map(([lx, ly], i) => (
      <rect key={i} x={lx - 6} y={ly - 4} width={12} height={8} rx={2} fill="#16295E" opacity={0.8} />
    ))}
    {/* WHAT IS FOLDED INSIDE, embossed on the lid — so the case and the thing that telescopes
        out of it are visibly the same object. It used to carry the app's lens at r 21, which put
        a second aperture in the same frame as the one on the pediment and a blind read said
        the delivered object and the installed object did not match. */}
    <g stroke="#16295E" strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.8}>
      <path d="M-13 26 V-24 M13 26 V-24" />
      <path d="M-13 14 L13 2 M13 14 L-13 2 M-13 2 L13 -10 M13 2 L-13 -10 M-13 -10 L13 -22 M13 -10 L-13 -22" />
      <path d="M-13 26 H13 M-13 2 H13 M-13 -10 H13" />
    </g>
    <path d="M-22 -28 h44" stroke="#DCE6FF" strokeWidth={5} strokeLinecap="round" opacity={0.9} />
    {/* the maker's plate: the app's mark, small, where a badge belongs */}
    <circle cx={0} cy={34} r={12} fill="#1A2444" />
    <AppLens r={10} open={0.4} glass={0} />
    {glow > 0.01 && <Light cx={0} cy={0} r={110} color="#8FB4FF" k={0.4 * glow} />}
  </g>
);

/** THE ANTENNA — the app's organ, and the thing that ASKS.
 *
 *  It does not collect anything. It is an interrogator: a braced lattice tower carrying a
 *  collinear omni radiator, and what it does is BROADCAST — concentric wavefronts leave its head
 *  and cross the city, and a building starts asking when the front reaches it. What comes back
 *  runs DOWN the tower and out along a feeder to the apparatus that grant has just built, so the
 *  antenna visibly ends the scene running four things it was not running a minute before.
 *
 *  THE EMERGENCE IS MECHANICAL, AND EVERY STAGE LANDS ON ITS OWN SOUND
 *  (tools/echallan/score-opening.mjs, times for deploy0 = 38.00, deploy1 = 39.10):
 *      d 0.09-0.15   38.10  latches      four bolts snap out of the case's corners
 *      d 0.24-0.46   38.26  case opens   the four panels hinge DOWN flat and become the base plate
 *      d 0.47-0.66   38.52  stage 1      the first segment is pushed out of the plinth
 *      d 0.66-0.84   38.72  stage 2      out of the first
 *      d 0.84-0.94   38.92  stage 3      out of the second
 *      d 0.90-0.98   39.00  the head     the radiator runs out of the top section and the guys
 *                                        snap taut
 *      d 0.98-1.00   39.06  it locks     a collar clamps and the whole mast recoils once
 *      ports 0-1     39.22  it asks      the strobe lights and the first wavefront leaves
 */
const SEG_H = [96, 82, 66] as const;         // the three telescoping segments, bottom to top
const PLINTH_H = 26;                          // what is left of the case once it has opened
const RAD_H = 74;                             // the radiator that runs out of the top section
export const MAST_H = PLINTH_H + SEG_H[0] + SEG_H[1] + SEG_H[2];   // 270, to the top collar
/** the radiator's centre — where every wavefront is centred and every feeder starts */
export const mastTipAt = (baseY: number) => ({ x: 0, y: baseY - MAST_H - RAD_H * 0.52 });

export const DeployMast: React.FC<{ x: number; baseY: number; deploy: number;
  t: number; ports?: number; feeders?: Record<Cap3, number>; pulse?: { cap: Cap3; k: number } | null }> =
  ({ x, baseY, deploy, t, ports = 0, feeders, pulse }) => {
    const d = clamp01(deploy);
    const stg = (a2: number, b2: number) => clamp01((d - a2) / (b2 - a2));
    const latch = ease.out(stg(0.09, 0.15));
    const open = ease.inOut(stg(0.236, 0.455));
    const e = [ease.out(stg(0.473, 0.655)), ease.out(stg(0.655, 0.836)), ease.out(stg(0.836, 0.94))];
    const rad = ease.out(stg(0.90, 0.98));
    const lock = stg(0.98, 1);
    const po = ease.out(clamp01(ports));
    /* the lock is felt, not just heard: the whole mast settles once, hard */
    const recoil = lock > 0 && lock < 1 ? Math.sin(lock * Math.PI * 3) * (1 - lock) * 3.2 : 0;

    const mg = gid('mastRail'), pg = gid('mastPlinth'), rg = gid('mastRadome');
    /* segment heads, in order, after however much each has extended */
    const head: number[] = [];
    let cur = baseY - PLINTH_H;
    SEG_H.forEach((h, i) => { cur -= h * e[i]; head.push(cur); });
    const topY = head[2];
    const radY = topY - RAD_H * rad;               // the radiator's foot, as it runs out
    const strobe = po > 0.3 ? 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * 2.4)), 6) : 0;

    /* a segment: twin rails with X-bracing between them — a lattice tower, not a stick. Form is
       value only, per the style law: a lit left rail, a shaded right one, no keylines. */
    const segment = (i: number) => {
      const w = [38, 30, 23][i];
      const y0 = head[i], y1 = i === 0 ? baseY - PLINTH_H : head[i - 1];
      const hgt = y1 - y0;
      if (hgt < 1) return null;
      const bays = Math.max(1, Math.round(hgt / 42));
      return (
        <g key={i}>
          <rect x={x - w / 2} y={y0} width={w} height={hgt + 6} fill={`url(#${mg})`} />
          <g stroke="#7E90C4" strokeWidth={Math.max(2.6, 5 - i)} opacity={0.9} strokeLinecap="round">
            {Array.from({ length: bays }, (_, k) => {
              const a1 = y0 + (k * hgt) / bays, a2 = y0 + ((k + 1) * hgt) / bays;
              return (
                <g key={k}>
                  <line x1={x - w / 2 + 4} y1={a1} x2={x + w / 2 - 4} y2={a2} />
                  <line x1={x + w / 2 - 4} y1={a1} x2={x - w / 2 + 4} y2={a2} />
                  {/* the horizontal chord at every node: this is what makes it a tower and not
                      a thread — without it the repeating diagonals read as an auger */}
                  <line x1={x - w / 2 + 2} y1={a2} x2={x + w / 2 - 2} y2={a2} />
                </g>
              );
            })}
          </g>
          {/* the collar it was pushed out of: a real telescoping joint has a lip */}
          <rect x={x - w / 2 - 4} y={y1 - 5} width={w + 8} height={10} rx={4} fill="#2C3758" />
        </g>
      );
    };

    return (
      <g transform={`translate(0 ${recoil})`}>
        <defs>
          <LinGrad id={mg} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#93A4D2'], [0.28, '#5E6E9A'], [0.72, '#333D63'], [1, '#202844']]} />
          <LinGrad id={pg} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#6E9BFF'], [0.34, '#4E7BEE'], [1, '#22377A']]} />
          <LinGrad id={rg} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#FFFFFF'], [0.34, '#DCE4F6'], [1, '#7C8BB4']]} />
        </defs>

        {/* THE BASE PLATE — the case's four panels, hinged down flat */}
        <g opacity={open}>
          {[-1, 1].map((sx) => (
            <g key={sx} transform={`translate(${x} ${baseY - PLINTH_H}) rotate(${sx * open * 86})`}>
              <rect x={sx < 0 ? -58 : 2} y={-9} width={56} height={18} rx={4} fill="#24408F" />
              <rect x={sx < 0 ? -58 : 2} y={-9} width={56} height={5} rx={2} fill={Q.cobalt} opacity={0.85} />
            </g>
          ))}
          <path d={`M${x - 46} ${baseY} L${x + 46} ${baseY} L${x + 36} ${baseY - 11} L${x - 36} ${baseY - 11} Z`}
            fill="#1A2140" />
          {[-33, 0, 33].map((dx) => <circle key={dx} cx={x + dx} cy={baseY - 3} r={3.6} fill="#0B0F1E" />)}
        </g>

        {/* THE PLINTH — the body of the case it arrived in, still here, still cobalt, still
            wearing the app's own mark on its face */}
        <rect x={x - 34} y={baseY - PLINTH_H} width={68} height={PLINTH_H} rx={5} fill={`url(#${pg})`} />
        <rect x={x - 34} y={baseY - PLINTH_H} width={68} height={6} rx={3} fill="#8FB4FF" opacity={0.45} />
        <g transform={`translate(${x} ${baseY - PLINTH_H / 2})`}><AppLens r={9} open={0.5} glass={0} /></g>
        {/* the four latch bolts, snapped out of its corners */}
        {[-1, 1].map((sx) => [0, 1].map((k) => (
          <rect key={`${sx}${k}`} x={sx < 0 ? x - 38 - latch * 7 : x + 30 + latch * 7}
            y={baseY - PLINTH_H + 4 + k * 12} width={8} height={7} rx={2} fill="#8C9CC4" />
        )))}

        {[0, 1, 2].map((i) => segment(i))}

        {/* ── THE HEAD. A collinear omni radiator: a radome with choke rings, which is what a
              thing that talks to a whole CITY looks like. It is deliberately not a dish — the
              dish on the roof below aims out of the world, this one aims at everyone in it. */}
        {rad > 0.005 && (
          <g>
            {/* the guys, snapping taut off the top collar as the radiator runs out */}
            {[-1, 1].map((sx) => (
              <line key={sx} x1={x + sx * 3} y1={radY + 6} x2={x + sx * 34} y2={topY + 30}
                stroke="#6E7DAB" strokeWidth={2.2} opacity={0.55 * rad} />
            ))}
            <rect x={x - 8} y={radY} width={16} height={topY - radY + 8} fill={`url(#${rg})`} />
            {[0.22, 0.5, 0.78].map((f, k) => (
              <g key={k}>
                <ellipse cx={x} cy={radY + RAD_H * rad * f} rx={17} ry={4.6} fill="#B9C6E2" />
                <ellipse cx={x} cy={radY + RAD_H * rad * f - 2} rx={17} ry={4.6} fill="#EEF3FF" />
              </g>
            ))}
            <path d={`M${x - 8} ${radY + 8} L${x} ${radY - 9} L${x + 8} ${radY + 8} Z`} fill="#EEF3FF" />
            {/* the obstruction strobe, and the beat the wavefronts leave on. It used to be RED,
                which put a second red light in the sky competing with the one that matters — the
                recording light in the eye. An aviation strobe is white; red is now reserved. */}
            <circle cx={x} cy={radY - 13} r={5} fill={mix('#2A3352', '#EAF6FF', strobe)} />
            {strobe > 0.1 && <Light cx={x} cy={radY - 13} r={74} color="#BFE9FF" k={0.55 * strobe} />}
            {/* the equipment box on the head frame: where every feeder terminates */}
            <rect x={x + 10} y={topY - 4} width={26} height={30} rx={4} fill="#2A3358" />
            <rect x={x + 10} y={topY - 4} width={26} height={6} rx={3} fill="#7C8BB4" />
            {CAP_ORDER.map((c, i) => (
              <circle key={c} cx={x + 16 + (i % 2) * 11} cy={topY + 8 + Math.floor(i / 2) * 11} r={3.4}
                fill={mix('#141C38', CAP_COL[c], clamp01(feeders ? feeders[c] ?? 0 : 0))} />
            ))}
          </g>
        )}

        {/* WHAT COMES BACK. A grant runs down the tower as a bright travelling collar in its own
            colour — the antenna does not merely register the answer, it CONDUCTS it to the thing
            the answer just built. */}
        {pulse && pulse.k > 0.001 && pulse.k < 0.999 && (() => {
          const y = lerp(radY, baseY - PLINTH_H, ease.inOut(pulse.k));
          return (
            <g>
              <rect x={x - 26} y={y - 7} width={52} height={14} rx={7} fill={CAP_COL[pulse.cap]} opacity={0.9} />
              <Light cx={x} cy={y} r={120} color={CAP_COL[pulse.cap]} k={0.7} />
            </g>
          );
        })()}
      </g>
    );
  };

/** THE UPLINK — the VPN, as a satellite the app erects on its own roof and aims out of the city.
 *  It climbs out of a roof canister on a telescoping stem, the solar wings unfold off their
 *  hinges, and the DISH — a ribbed paraboloid on a gimbal yoke with a feed horn on three struts —
 *  pitches up until it is looking at the sky. Only then does it transmit. The dish is the whole
 *  point of the object: the antenna on the tower talks to the city, this one talks to somewhere
 *  the city cannot see. */
export const Satellite: React.FC<{ x: number; groundY: number; rise: number; beam: number; t: number;
  s?: number; climb?: number }> = ({ x, groundY, rise, beam, t, s = 1, climb = 250 }) => {
    if (rise <= 0.001) return null;
    const r = clamp01(rise);
    const up = ease.out(clamp01(r / 0.55)) * climb;
    const wings = ease.out(clamp01((r - 0.38) / 0.30));
    const aim = ease.inOut(clamp01((r - 0.60) / 0.30));
    const y = groundY - up;
    const drift = Math.sin(t * 0.8) * 3;
    const dg = gid('satDish'), bg2 = gid('satBus');
    const DR = 52, DY = 43;                       // the dish: a foreshortened paraboloid
    return (
      <g>
        <defs>
          <LinGrad id={dg} x1={0} y1={0} x2={1} y2={0.4}
            stops={[[0, '#FFFFFF'], [0.34, '#D3DCF0'], [1, '#6E7DAB']]} />
          <LinGrad id={bg2} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#6B79A8'], [0.36, '#333D63'], [1, '#1B2138']]} />
        </defs>
        {/* no canister on the ledge any more: the foot of this thing is BEHIND the pediment and
            is never seen. What the viewer sees break open is SatHatch, on the roof slope. */}
        <g transform={`translate(${x} ${y + drift}) scale(${s})`}>
          {/* THE STEM it climbed on — a telescoping mast, and drawn as one: three sections with
              a collar at each joint, the way the antenna on the apex is drawn, so the two read as
              the same kind of machine. A plain 16-wide rod 250 long was a wire. */}
          <rect x={-11} y={0} width={22} height={Math.max(0, up)} fill="#2A3358" />
          <rect x={-11} y={0} width={6} height={Math.max(0, up)} fill="#7E8CB8" />
          <rect x={5} y={0} width={6} height={Math.max(0, up)} fill="#161E3C" />
          {[0.34, 0.67].map((f) => up * f > 12 && (
            <g key={f}>
              <rect x={-15} y={up * f - 5} width={30} height={11} rx={4} fill="#4C5A85" />
              <rect x={-15} y={up * f - 5} width={30} height={3.5} rx={2} fill="#B4C2E4" opacity={0.8} />
            </g>
          ))}
          {/* Solar wings, unfolding on their hinges — they ride up FOLDED against the body, and
              they settle DROOPED at 24°. Level, they finished inside the dish's own silhouette:
              the right one disappeared behind the bowl entirely and the left one read as a loose
              blue box beside it. Drooped, both tips come out below the bowl and the object reads
              as one machine with a dish on it. */}
          {[-1, 1].map((sx) => (
            <g key={sx} transform={`translate(0 7) rotate(${sx * ((1 - wings) * 88 + wings * 24)})`}>
              {/* the spar out to the array — without it the panel is a tab floating beside a rod */}
              <rect x={sx < 0 ? -26 : 6} y={-3} width={20} height={6} rx={2} fill="#6B79A8" />
              {/* THE ARRAY. It was #1E3A6E carrying #3E6BC4 cells — navy on navy, against a navy
                  sky, at 48 units: from any distance two small dark tabs beside the mast. A solar
                  panel is a mirror; it is the one surface up here that catches the city. */}
              <rect x={sx < 0 ? -80 : 24} y={-15} width={56} height={30} rx={3} fill="#2B4E92" />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={(sx < 0 ? -77 : 27) + k * 17} y={-11} width={14} height={22} rx={2}
                  fill="#5E93E8" opacity={0.95} />
              ))}
              <rect x={sx < 0 ? -80 : 24} y={-15} width={56} height={5} rx={2.5} fill="#B4D3FF" opacity={0.8} />
              <rect x={sx < 0 ? -80 : 24} y={10} width={56} height={5} rx={2.5} fill="#16294F" opacity={0.9} />
            </g>
          ))}
          {/* the bus */}
          <rect x={-20} y={-22} width={40} height={44} rx={5} fill={`url(#${bg2})`} />
          <rect x={-20} y={-22} width={40} height={8} rx={4} fill="#8E9DC6" />
          {[-9, 3].map((dy) => <rect key={dy} x={-13} y={dy} width={26} height={5} rx={2} fill="#141C38" />)}
          {/* THE DISH, held clear of the wings on its gimbal yoke, pitching up AND OVER TO THE
              RIGHT. It used to lean
              left, straight into the antenna standing beside it, so the one thing this machine
              does — point somewhere and send — happened behind a lattice tower. It now turns
              away from the mast into the only open quadrant of the sky this city has. */}
          <g transform={`translate(0 -26) rotate(${aim * 46})`}>
            {/* the yoke: two arms and the elevation pivot */}
            {[-1, 1].map((sx) => (
              <path key={sx} d={`M${sx * 9} 8 L${sx * 19} -22`} stroke="#4C5A85" strokeWidth={6}
                strokeLinecap="round" />
            ))}
            <rect x={-4} y={-24} width={8} height={24} fill="#5A6796" />
            <circle cx={0} cy={-22} r={6.5} fill="#6B79A8" />
            <g transform="translate(0 -44)">
              {/* the bowl */}
              <ellipse cx={0} cy={0} rx={DR} ry={DY} fill={`url(#${dg})`} />
              <ellipse cx={0} cy={2} rx={DR - 9} ry={DY - 9} fill="#9EACD0" opacity={0.55} />
              {/* radial ribs: without them a dish is a plate */}
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 6 + 0.26) * (DR - 6)}
                  y2={Math.sin((k * Math.PI) / 6 + 0.26) * (DY - 6)} stroke="#7E8CB8" strokeWidth={2.4}
                  opacity={0.7} />
              ))}
              <ellipse cx={0} cy={0} rx={DR} ry={DY} fill="none" stroke="#FFFFFF" strokeWidth={4}
                opacity={0.7} />
              <ellipse cx={0} cy={0} rx={DR} ry={DY} fill="none" stroke="#5E6B94" strokeWidth={4}
                opacity={0.45} strokeDasharray={`${DR * 1.6} ${DR * 6}`} strokeDashoffset={DR * 0.5} />
              {/* the feed horn, held at the focus on three struts */}
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={k * DR * 0.62} y1={k === 0 ? DY * 0.52 : -DY * 0.34} x2={0} y2={-30}
                  stroke="#C7D2EC" strokeWidth={2.6} />
              ))}
              <path d="M-8 -38 L8 -38 L5 -24 L-5 -24 Z" fill="#DCE4F6" />
              <rect x={-3} y={-46} width={6} height={9} rx={2} fill="#8E9DC6" />
            </g>
          </g>
          {/* and only then does it transmit */}
          {beam > 0.02 && (
            <g opacity={beam} transform={`rotate(${aim * 46})`}>
              <path d="M-34 -78 L0 -56 L34 -78 L0 -640 Z" fill={CAP_COL.vpn} opacity={0.14} />
              <path d="M-13 -74 L0 -60 L13 -74 L0 -640 Z" fill={CAP_COL.vpn} opacity={0.12} />
              {[0, 1, 2, 3].map((k) => {
                const u = ((t * 0.42 + k / 4) % 1);
                return (
                  <g key={k} opacity={0.9 * (1 - u * 0.86)}>
                    <circle cx={0} cy={-62 - u * 540} r={6 - u * 3.4} fill="#FFD0E6" />
                    <ellipse cx={0} cy={-62 - u * 540} rx={20 - u * 10} ry={5 - u * 2.4}
                      fill="none" stroke="#FFA9D0" strokeWidth={3 - u * 1.6} opacity={0.75} />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </g>
    );
  };

/** WHERE THE SATELLITE BREAKS OUT. A hatch set into the pediment's slope — a coaming, two leaves
 *  thrown back along the rake, and the hole the stem climbs through. Everything below this is
 *  behind the roof and is never seen, which is both the honest reading of a mast on a roof you
 *  are looking at from the street and what lets this one stand clear of the antenna beside it.
 *  Drawn AFTER the office and the satellite, so the leaves lie on the stone and the stem passes
 *  up through them. */
export const SatHatch: React.FC<{ x: number; y: number; open: number; rake?: number }> =
  ({ x, y, open, rake = 29 }) => {
    const o = ease.out(clamp01(open));
    if (o <= 0.002) return null;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rake})`}>
        {/* the coaming: a curb around the opening, so the hole is built and not cut */}
        <rect x={-36} y={-9} width={72} height={19} rx={4} fill="#5A6796" />
        <rect x={-30} y={-6} width={60} height={13} rx={3} fill="#070C1C" />
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`rotate(${sx * o * 112})`}>
            <rect x={sx < 0 ? -31 : 3} y={-10} width={28} height={14} rx={3} fill="#8E9DC6" />
            <rect x={sx < 0 ? -31 : 3} y={-10} width={28} height={4} rx={2} fill="#EEF3FF" opacity={0.85} />
            <circle cx={sx < 0 ? -6 : 6} cy={-3} r={2.6} fill="#2A3358" />
          </g>
        ))}
        <rect x={-40} y={-11} width={9} height={22} rx={3} fill="#B4C2E4" />
        <rect x={31} y={-11} width={9} height={22} rx={3} fill="#4A5680" />
      </g>
    );
  };

/** a live cable strung from a facility to the mast socket, in the capability's colour. `grow`
 *  draws it (strokeDash), `flow` runs bright dots along it once live. */
export const Cable: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number };
  col: string; grow: number; t: number; sag?: number }> = ({ from, to, col, grow, t, sag = 90 }) => {
  if (grow <= 0.001) return null;
  const mx = (from.x + to.x) / 2, my = Math.max(from.y, to.y) + sag;
  const d = `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`;
  const g = ease.inOut(clamp01(grow));
  return (
    <g>
      <path d={d} fill="none" stroke="#0C1120" strokeWidth={9} strokeLinecap="round" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - g} />
      <path d={d} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - g} opacity={0.9} />
      {grow > 0.98 && [0, 1, 2].map((k) => {
        const u = ((t * 0.5 + k / 3) % 1);
        const bx = from.x + (to.x - from.x) * u, by = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * my + u * u * to.y;
        return <circle key={k} cx={bx} cy={by} r={4} fill="#EAFBFF" opacity={0.7} />;
      })}
    </g>
  );
};

/** the VPN tunnel. It is BORED: out of the office, under the wall, surfacing on the violet side
 *  and running off out of the city — the line the later acts send the stolen data along. */
/** a support pole: the spans between buildings are CARRIED, like every other line in this city */
export const SupportPole: React.FC<{ x: number; top: number; col: string; on: number }> =
  ({ x, top, col, on }) => (
    <g>
      <rect x={x - 8} y={top} width={16} height={F.ground - top} fill="#2A3352" />
      <rect x={x - 8} y={top} width={5} height={F.ground - top} fill="#4C5A85" />
      <rect x={x - 34} y={top + 14} width={68} height={8} rx={3} fill="#212941" />
      {[-26, 26].map((dx) => (
        <g key={dx}>
          <rect x={x + dx - 3} y={top + 2} width={6} height={13} fill="#3D4A6E" />
          {[0, 1].map((k) => <ellipse key={k} cx={x + dx} cy={top + 2 + k * 5} rx={7 - k * 1.5} ry={3} fill="#7C8BB4" />)}
        </g>
      ))}
      <circle cx={x} cy={top + 6} r={5} fill={col} opacity={0.35 + on * 0.5} />
    </g>
  );

/** THE VPN — a private main leaving the city.
 *  Not a buried trench and not a glowing hose: a pipeline. It starts at a valve manifold on the
 *  app's own building, climbs over the boundary wall on trestles, and runs off out of the city.
 *  When the valve is opened, the city's traffic visibly runs out through it. */
export const Pipeline: React.FC<{ grow: number; open: number; t: number }> =
  ({ grow, open, t }) => {
    if (grow <= 0.001) return null;
    const g = ease.inOut(clamp01(grow));
    /* the route, in order: the manifold, up over the crest, down onto the violet, and away */
    const R: { x: number; y: number }[] = [
      { x: 880, y: 712 }, { x: 1010, y: 726 }, { x: 1120, y: 838 },
      { x: 1238, y: 1052 }, { x: 1360, y: 1286 }, { x: 1560, y: 1560 },
    ];
    const total = R.slice(1).reduce((acc, p, i) => acc + Math.hypot(p.x - R[i].x, p.y - R[i].y), 0);
    let run = 0;
    const segs = R.slice(1).map((p, i) => {
      const L = Math.hypot(p.x - R[i].x, p.y - R[i].y);
      const s0 = run / total; run += L;
      return { a: R[i], b: p, s0, s1: run / total };
    });
    const built = (sg: { s0: number; s1: number }) => clamp01((g - sg.s0) / Math.max(1e-6, sg.s1 - sg.s0));
    const at2 = (u: number) => {
      const d = u * total; let acc = 0;
      for (let i = 0; i < segs.length; i++) {
        const L = Math.hypot(segs[i].b.x - segs[i].a.x, segs[i].b.y - segs[i].a.y);
        if (acc + L >= d || i === segs.length - 1) {
          const k = clamp01((d - acc) / L);
          return { x: lerp(segs[i].a.x, segs[i].b.x, k), y: lerp(segs[i].a.y, segs[i].b.y, k) };
        }
        acc += L;
      }
      return R[R.length - 1];
    };
    return (
      <g>
        {/* trestles, where the main is over open ground */}
        {segs.map((sg, i) => {
          const k = built(sg);
          if (k <= 0.02 || sg.b.y < F.ground - 40) return null;
          return (
            <g key={`t${i}`} opacity={k}>
              <path d={`M${sg.b.x - 34} ${sg.b.y + 150} L${sg.b.x} ${sg.b.y + 10} L${sg.b.x + 34} ${sg.b.y + 150}`}
                fill="none" stroke="#1B3040" strokeWidth={11} strokeLinecap="round" />
              <rect x={sg.b.x - 26} y={sg.b.y + 66} width={52} height={8} rx={3} fill="#1B3040" />
            </g>
          );
        })}
        {/* the main: a dark cylinder with a lit crown and a flange at every joint */}
        {segs.map((sg, i) => {
          const k = built(sg);
          if (k <= 0.001) return null;
          const bx = lerp(sg.a.x, sg.b.x, k), by = lerp(sg.a.y, sg.b.y, k);
          return (
            <g key={`p${i}`}>
              <line x1={sg.a.x} y1={sg.a.y} x2={bx} y2={by} stroke="#08131B" strokeWidth={42} strokeLinecap="round" />
              <line x1={sg.a.x} y1={sg.a.y} x2={bx} y2={by} stroke="#1E4A5A" strokeWidth={32} strokeLinecap="round" />
              <line x1={sg.a.x} y1={sg.a.y} x2={bx} y2={by} stroke="#3E7E92" strokeWidth={8} strokeLinecap="round"
                opacity={0.55} transform="translate(0 -9)" />
              {k > 0.98 && <ellipse cx={sg.b.x} cy={sg.b.y} rx={26} ry={26} fill="#16323F" />}
            </g>
          );
        })}
        {/* what is running out through it, once the valve is open */}
        {open > 0.5 && [0, 1, 2, 3, 4].map((k) => {
          const u = ((t * 0.16 + k / 5) % 1);
          const q = at2(u);
          return <circle key={k} cx={q.x} cy={q.y} r={7} fill="#8BF0FF" opacity={0.75} />;
        })}
        {/* the valve manifold on the building, and its wheel, which turns when it is opened */}
        <g transform={`translate(${R[0].x} ${R[0].y})`}>
          <rect x={-40} y={-34} width={80} height={68} rx={8} fill="#16323F" />
          <rect x={-40} y={-34} width={80} height={10} rx={4} fill="#3E7E92" opacity={0.7} />
          <rect x={-52} y={-22} width={14} height={44} rx={4} fill="#1E4A5A" />
          <g transform={`rotate(${open * 160})`}>
            <circle r={20} fill="none" stroke={CAP_COL.vpn} strokeWidth={7} />
            <path d="M-20 0 H20 M0 -20 V20" stroke={CAP_COL.vpn} strokeWidth={6} strokeLinecap="round" />
          </g>
          {open > 0.4 && <Light cx={0} cy={0} r={130} color="#8BF0FF" k={0.35 * open} />}
        </g>
      </g>
    );
  };


/* ════ THE UTILITIES — what a granted permission actually looks like in a city ════════════════
   Not a glowing arc with dots on it. A line here is a strung cable: it is paid out by a plug head
   that travels to the socket and seats in it, it hangs under its own weight, it terminates on
   insulators, and it carries the thing the permission gave away — letters, current, speech. */

/** a cable strung between two points. `grow` drives a PLUG HEAD along it, paying the cable out
 *  behind itself, so the connection is an act rather than a line drawing itself. */
export const Line: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number };
  col: string; grow: number; t: number; sag?: number; cargo?: 'mail' | 'current' | 'none';
  live?: number }> = ({ from, to, col, grow, t, sag = 120, cargo = 'none', live = 0 }) => {
  if (grow <= 0.001) return null;
  const g = ease.inOut(clamp01(grow));
  const mx = (from.x + to.x) / 2, my = Math.max(from.y, to.y) + sag;
  const at2 = (u: number) => ({
    x: (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * mx + u * u * to.x,
    y: (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * my + u * u * to.y,
  });
  const d = `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`;
  const head = at2(g);
  const ang = (() => { const a2 = at2(Math.max(0, g - 0.02)); return (Math.atan2(head.y - a2.y, head.x - a2.x) * 180) / Math.PI; })();
  /* an insulator stack on a bracket: how a conductor is actually terminated on a structure */
  const Term: React.FC<{ p: { x: number; y: number }; flip: number }> = ({ p, flip }) => (
    <g>
      <rect x={p.x - 7 + flip * 14} y={p.y - 4} width={22} height={9} rx={3} fill="#2A3352" />
      <rect x={p.x - 4} y={p.y - 26} width={8} height={26} fill="#3E4A72" />
      {[0, 1, 2].map((k) => (
        <ellipse key={k} cx={p.x} cy={p.y - 20 + k * 8} rx={12 - k * 2} ry={4} fill="#7C8BB4" />
      ))}
      <circle cx={p.x} cy={p.y - 28} r={5} fill={col} opacity={0.5 + live * 0.5} />
    </g>
  );
  return (
    <g>
      {/* the conductor: a dark core with a lit crown, so it has roundness rather than being a line */}
      <path d={d} fill="none" stroke="#080D1A" strokeWidth={13} strokeLinecap="round"
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
      <path d={d} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" opacity={0.5 + live * 0.4}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.22}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} transform="translate(0 -3)" />
      {g > 0.995 && <><Term p={from} flip={1} /><Term p={to} flip={-1} /></>}
      {/* the plug head, while the line is still being run out to the socket */}
      {g < 0.995 && (
        <g transform={`translate(${head.x} ${head.y}) rotate(${ang})`}>
          <rect x={-20} y={-11} width={32} height={22} rx={5} fill="#4A5472" />
          <rect x={-20} y={-11} width={32} height={6} rx={3} fill="#8B97BC" />
          <rect x={10} y={-6} width={15} height={5} rx={2.5} fill="#C7D2EC" />
          <rect x={10} y={2} width={15} height={5} rx={2.5} fill="#C7D2EC" />
        </g>
      )}
      {/* letters ride the line HANGING from it, on hangers — a conveyor, not dots on a curve */}
      {live > 0.5 && cargo === 'mail' && [0, 1, 2].map((k) => {
        const u = 1 - ((t * 0.2 + k / 3) % 1);
        const p = at2(u);
        return (
          <g key={k} transform={`translate(${p.x} ${p.y})`}>
            <rect x={-1.5} y={0} width={3} height={13} fill="#6B7BA8" />
            <g transform="translate(0 26) rotate(-6)">
              <rect x={-15} y={-11} width={30} height={21} rx={2} fill="#F2F6FF" />
              <path d="M-15 -11 L0 0 L15 -11" fill="none" stroke="#9FB0D4" strokeWidth={2.6} />
            </g>
          </g>
        );
      })}
      {/* current runs INSIDE the conductor */}
      {live > 0.5 && cargo === 'current' && (
        <path d={d} fill="none" stroke="#FFE2A8" strokeWidth={4} strokeLinecap="round" pathLength={1}
          strokeDasharray="0.05 0.22" strokeDashoffset={-((t * 0.35) % 1)} opacity={0.9} />
      )}
    </g>
  );
};

/** the socket a line plugs into: bolted to the structure, with a lamp that changes on connection */
export const Socket: React.FC<{ x: number; y: number; col: string; on: number }> =
  ({ x, y, col, on }) => (
    <g>
      <rect x={x - 22} y={y - 20} width={44} height={40} rx={7} fill="#2A3352" />
      <rect x={x - 22} y={y - 20} width={44} height={7} rx={3} fill="#4C5A85" />
      {[[-15, -13], [15, -13], [-15, 13], [15, 13]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={2.6} fill="#10162B" />
      ))}
      <rect x={x - 9} y={y - 8} width={18} height={16} rx={3} fill="#0A1020" />
      <circle cx={x} cy={y + 13} r={4} fill={mix('#6A2B34', col, clamp01(on * 1.3))} />
      {on > 0.4 && <Light cx={x} cy={y} r={70} color={col} k={0.4 * on} />}
    </g>
  );


/* ── THE SERVICE HATCH — how a permission is asked for and granted, ON the building ─────────
 *  This replaces the floating dialog panel. It is deliberately the wall's grammar at a smaller
 *  scale, because the viewer learned that grammar twenty seconds earlier and should not have to
 *  learn a second one: Android steel, the protection's shield cast into the leaf, bolts that
 *  retract, a lamp that goes red → green, and a leaf that SINKS the way the door panel sinks.
 *
 *  It is also the aperture, not a second object beside one. What is behind the leaf is the thing
 *  the permission gives away, so one object carries the ask, the grant and the consequence.
 */
export const CapGlyph: React.FC<{ cap: Cap3; col: string }> = ({ cap, col }) => (
  <g fill="none" stroke={col} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
    {cap === 'sms' && <><rect x={-18} y={-13} width={36} height={26} rx={3} />
      <path d="M-18 -13 L0 2 L18 -13" /></>}
    {cap === 'call' && <path d="M-15 -16 a6 6 0 0 1 9 -1 l4 5 a5 5 0 0 1 -1 8 l-3 2 a21 21 0 0 0 10 10 l2 -3 a5 5 0 0 1 8 -1 l5 4 a6 6 0 0 1 -1 9 l-3 3 c-4 3 -11 2 -16 -1 a47 47 0 0 1 -17 -17 c-3 -5 -4 -12 -2 -16 Z" fill={col} />}
    {cap === 'bg' && <><circle cx={0} cy={0} r={16} /><path d="M0 -9 V1 L7 6" /></>}
    {cap === 'vpn' && <><path d="M-6 -14 h-10 v28 h10" /><path d="M-9 0 h18" /><path d="M9 -8 l9 8 l-9 8" /></>}
  </g>
);

/** (x, y) is the hatch's own origin. The ✓ sits at (x+38, y+36) so `askAt()` — and therefore the
 *  hand's existing legs — still land on it unchanged. `content` is drawn INSIDE the recess. */
export const GrantHatch: React.FC<{ x: number; y: number; cap: Cap3; on: number; ask: number;
  press: number; lit: number; t: number; glow?: number; retire?: number; content?: React.ReactNode }> =
  ({ x, y, cap, on, ask, press, lit, t, glow, retire = 0, content }) => {
    if (on <= 0.002) return null;
    const o = clamp01(on);
    const col = CAP_COL[cap];
    /* ── HOW IT ARRIVES. It used to be `opacity={ease.out(on)}` — the asset existed and was faded
       up, which is the one entrance this film's craft laws name as banned. A permission dialog on
       a building is not a dialog: it is a hole somebody CUT in the facade, and the wavefront that
       just landed is what cut it. So it is built, in the boundary wall's own order, out of the
       arrival bloom:
           the ring lands and SCRIBES the opening's outline onto the stone
           the head beam extrudes up out of the wall and the sill extrudes down
           the jambs run between them
           the opening widens from its centre line, and the steel leaf is behind it
           and the console swings up out of the sill — on the same hinge it will fold back into
             when the question has been answered. */
    const sg = (a2: number, b2: number) => clamp01((o - a2) / (b2 - a2));
    const scribe = sg(0, 0.36);
    const beam = outBack(sg(0.14, 0.54));
    const jamb = ease.out(sg(0.34, 0.70));
    const mouth = ease.inOut(sg(0.44, 0.86));
    const rig = outBack(sg(0.62, 1));
    /* these ids MUST be per-instance. gid() is keyed by its string, so a constant key gave all
       four hatches one shared <clipPath> id — and SVG resolves duplicate ids to the FIRST in
       document order, so every hatch clipped its leaf (and its contents) to the SMS hatch's
       rect and vanished. Only the first hatch on screen ever worked. */
    const key = `${cap}${x}${y}`;
    const lg = gid('hatchLeaf3' + key), cp = gid('hatchClip3' + key);
    const HW = 62, LT = y - 38, LH = 62;             // 114 tall overall: it has to fit between
    //                                                  a building's own features, not float over them
    const sink = ease.in(clamp01(lit)) * (LH - 8);
    const ring = ask > 0.01 ? ((t * 1.5) % 1) : 0;
    const ax = x + 38, ay = y + 36;
    /* the console folds about the sill's bottom edge, the way the line tap's doors fold about
       their hinges — one grammar for "a panel closing", used twice */
    const ret = ease.inOut(clamp01(retire));
    /* ONE HINGE, BOTH DIRECTIONS: `rig` swings the console up out of the sill when the question
       is asked, `cos(ret)` folds it flat back into the sill when it has been answered. */
    const fold = rig * Math.cos(ret * Math.PI * 0.5);
    const SILL_B = LT + LH + 30;
    const MW = HW * Math.max(0.001, mouth);
    return (
      <g>
        <defs>
          <LinGrad id={lg} stops={[[0, Q.steelHi], [0.12, Q.steel], [1, Q.steelLo]]} />
          <clipPath id={cp}><rect x={x - MW} y={LT} width={MW * 2} height={LH} /></clipPath>
        </defs>
        {/* THE CUT. The ring's arrival scribes the outline onto the facade before anything of the
            hatch exists, and the line burns out as the frame it described arrives. */}
        {scribe < 0.999 && (
          <g opacity={1 - scribe * 0.42}>
            <rect x={x - HW - 8} y={LT - 22} width={HW * 2 + 16} height={LH + 52} rx={3} fill="none"
              stroke="#FFFFFF" strokeWidth={6.5} opacity={0.35}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - scribe} />
            <rect x={x - HW - 8} y={LT - 22} width={HW * 2 + 16} height={LH + 52} rx={3} fill="none"
              stroke={col} strokeWidth={4} pathLength={1} strokeDasharray="1 1"
              strokeDashoffset={1 - scribe} />
          </g>
        )}
        {/* the recess: what the leaf is covering */}
        <rect x={x - MW} y={LT} width={MW * 2} height={LH} fill="#070C1C" />
        <g clipPath={`url(#${cp})`}>{content}</g>
        {/* the leaf, which sinks into the building the way the door panel sinks into the wall */}
        <g clipPath={`url(#${cp})`}>
          <g transform={`translate(0 ${sink})`}>
            <rect x={x - HW} y={LT} width={HW * 2} height={LH} fill={`url(#${lg})`} />
            <rect x={x - HW} y={LT + LH * 0.38} width={HW * 2} height={3} fill={Q.steelDD} opacity={0.35} />
            {/* cast into the leaf as relief, not printed on it: a dark recess with a lit lower
                lip, so it reads as the protection's own mark at the size the film shows it */}
            <g transform={`translate(${x} ${LT + 28}) scale(0.66)`}>
              <path d="M0 -22 L18 -15 V1 C18 13 9 19 0 23 C-9 19 -18 13 -18 1 V-15 Z"
                fill={Q.steelDD} opacity={0.85} />
              <path d="M0 -19 L15 -13 V0 C15 10 8 16 0 19 C-8 16 -15 10 -15 0 V-13 Z"
                fill={Q.steel} opacity={0.5} />
              <path d="M-7 0 l5 5 l9 -10" stroke={Q.steelHi} strokeWidth={3.4} fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </g>
        {/* the head beam, extruded UP out of the wall, carrying the bolts with it */}
        <g transform={`translate(0 ${LT}) scale(1 ${Math.max(0.001, beam)}) translate(0 ${-LT})`}>
          <rect x={x - HW - 8} y={LT - 22} width={HW * 2 + 16} height={22} fill={Q.cap} />
          <rect x={x - HW - 8} y={LT - 22} width={HW * 2 + 16} height={3} fill={Q.steelHi} opacity={0.55} />
          {[-30, 30].map((dx) => <Bolt3 key={dx} x={x + dx} headY={LT - 22} headH={22} out={clamp01(lit)} s={0.38} />)}
        </g>
        {/* and the jambs run down out of it */}
        <g transform={`translate(0 ${LT}) scale(1 ${Math.max(0.001, jamb)}) translate(0 ${-LT})`}>
          {[[-HW - 8, 8], [HW, 8]].map(([dx, w], i) => (
            <rect key={i} x={x + dx} y={LT} width={w} height={LH + 4} fill={Q.steelDD} />
          ))}
        </g>
        {/* THE SILL. Permanent: the frame's own lip, the capability's label, and — once the
            question has been answered and the console has folded away — one small bead in the
            capability's colour. The label is a label; it does not retract. */}
        <g transform={`translate(0 ${LT + LH + 4}) scale(1 ${Math.max(0.001, beam)}) translate(0 ${-(LT + LH + 4)})`}>
          <rect x={x - HW - 8} y={LT + LH + 4} width={HW * 2 + 16} height={26} rx={3} fill={Q.cap} />
          <rect x={x - HW - 8} y={LT + LH + 4} width={HW * 2 + 16} height={3} fill={Q.steelHi} opacity={0.5} />
        </g>
        {beam > 0.6 && (
          <g opacity={clamp01((beam - 0.6) / 0.35)}>
            <g transform={`translate(${x - 46} ${ay}) scale(0.60)`}><CapGlyph cap={cap} col={col} /></g>
          </g>
        )}
        {ret > 0.05 && (
          <g opacity={ret}>
            <circle cx={ax} cy={ay} r={7} fill={col} />
            <circle cx={ax} cy={ay - 2} r={2.6} fill="#FFFFFF" opacity={0.55} />
            <Light cx={ax} cy={ay} r={44} color={col} k={0.30 * ret} />
          </g>
        )}
        {/* ── THE CONSOLE, which is only there while there is a question.
            TWO ANSWERS, NOT ONE. A lone ✓ sitting on the sill before anything has been pressed is
            indistinguishable from a ✓ that has been: a blind read took the hatch as already
            granted a beat BEFORE the finger arrived, and then as granted again after. The wall
            taught this grammar in act 1 — ✕ DENY beside ✓ ALLOW — and a pair reads as a question.

            AND A QUESTION THAT HAS BEEN ANSWERED STOPS BEING ASKED. The first cut left all four
            consoles lit on the city for the rest of the act: eight bright badges, red and green,
            repeating across the one band of the frame everything else was already happening in.
            The console now folds flat into its sill the way the line tap's doors fold, about a
            second after the press — so at any instant exactly ONE permission is being asked, and
            what stays behind is what the grant actually cost: an open hole in the building with
            its contents being taken out of it. */}
        {fold > 0.004 && (
          <g transform={`translate(0 ${SILL_B}) scale(1 ${fold}) translate(0 ${-SILL_B})`}>
            <circle cx={x + 2} cy={ay + 2} r={12} fill="#2A1218" />
            <circle cx={x + 2} cy={ay} r={12} fill={mix('#7A3038', '#3A2026', clamp01(lit))} />
            <path d={`M${x - 4} ${ay - 6} l12 12 M${x + 8} ${ay - 6} l-12 12`} stroke="#FFD9DC"
              strokeWidth={3.6} strokeLinecap="round" opacity={0.85 - 0.5 * clamp01(lit)} />
            {ring > 0 && lit < 0.5 && (
              <circle cx={ax} cy={ay} r={17 + ring * 18} fill="none" stroke={Q.allow}
                strokeWidth={3.5 * (1 - ring)} opacity={ask * (1 - ring)} />
            )}
            <circle cx={ax} cy={ay + 3} r={17} fill="#10331F" />
            <g transform={`translate(0 ${press * 4})`}>
              <circle cx={ax} cy={ay} r={17}
                fill={lit > 0.5 ? mix('#227A50', Q.allow, 0.35 + 0.65 * clamp01(glow ?? lit)) : '#26543E'} />
              <circle cx={ax - 5} cy={ay - 6} r={7} fill="#FFFFFF" opacity={0.18} />
              <path d={`M${ax - 8} ${ay + 1} l5 6 l10 -11`} stroke="#FFFFFF" strokeWidth={4} fill="none"
                strokeLinecap="round" strokeLinejoin="round" opacity={lit > 0.5 ? 1 : 0.62} />
            </g>
            {(glow ?? lit) > 0.02 && fold > 0.5
              && <Light cx={ax} cy={ay} r={70} color={Q.allow} k={0.55 * (glow ?? lit) * fold} />}
          </g>
        )}
      </g>
    );
  };
