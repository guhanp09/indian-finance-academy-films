/* THE ORGANS — what a granted permission BUILDS on the app's own building.
 *
 * The antenna asks. The victim's own building is where the ✓ is pressed. But the thing that
 * CHANGES when a permission is granted is the app: it grows the apparatus that uses it, bolted
 * onto the civic building it has been pretending to be. Four permissions, four pieces of
 * apparatus, and not one of them looks like any other:
 *
 *    SMS   a sorting conveyor climbing out of the city into a hooded intake in the left flank
 *    CALL  a line-tap cabinet on the right flank: the city's telephone riser cut and patched
 *          through a jackfield, with the handset lifted off its hook
 *    BG    the lens on the pediment opens its iris — and the sky opens with it
 *    VPN   a satellite climbs out of the roof, unfolds and aims a dish out of the world
 *
 * Every one of them ERECTS: a bracket swings out and locks, a truss telescopes, a leg drops, a
 * belt threads on, doors swing, a cord plugs in. Nothing fades up.
 *
 * Coordinates are the interior's q frame, so these can be placed against the office's own
 * geometry (fortress: OFFICE_MOUNT) without a second coordinate system.
 */
import React from 'react';
import { breathe, clamp01, ease, lerp, mix } from '../design';
import { CAP_COL, Q, outBack } from './fortress';
import { AppLens } from './mark';
import { LinGrad, Light, gid } from './style';

const st = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/* ══ SMS — THE MAIL HOIST ═══════════════════════════════════════════════════════════════════
   A raked conveyor needed 250 units of clear ground and there is none: the app's plot is 430 wide
   and the city stands on both sides of it. So the apparatus goes UP. A boot pushes through the
   cornice, a tower telescopes out of it, the head hinges over, a belt threads on, and a column of
   envelopes climbs it and is tipped into the building. Vertical, compact, and the one thing it
   carries is the one thing that has to be recognised at a glance. */

export const Envelope: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-19} y={-13} width={38} height={26} rx={2.5} fill="#FFFFFF" />
    <path d="M-19 -13 L0 4 L19 -13" fill="none" stroke="#6E7DAB" strokeWidth={3} strokeLinejoin="round" />
    <rect x={-19} y={9} width={38} height={4} fill="#C9D6F0" />
  </g>
);

export const MailHoist: React.FC<{ x: number; y: number; duct: { x: number; y: number };
  grow: number; run: number; t: number }> = ({ x, y, duct, grow, run, t }) => {
    if (grow <= 0.001) return null;
    const g = clamp01(grow);
    const boot = ease.out(st(g, 0, 0.20));          // the boot comes up through the cornice
    const tower = outBack(st(g, 0.16, 0.54));       // and the tower telescopes out of it, and locks
    const head = ease.inOut(st(g, 0.50, 0.70));     // the head hinges over toward the building
    const belt = ease.out(st(g, 0.64, 0.84));       // the belt and its flights thread on
    const HW = 31, HT = 156, BH = 26;
    const top = y - BH - HT * tower;
    const tg = gid('hoistPost'), cl = gid('hoistClip');
    const phase = run > 0.01 ? (t * 0.26) % 1 : 0;
    const N = 4;
    const winH = Math.max(0, y - BH - top - 8);
    return (
      <g>
        <defs>
          <LinGrad id={tg} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#C2CEEA'], [0.4, '#7B89B6'], [1, '#39456F']]} />
          <clipPath id={cl}>
            <rect x={x - HW + 6} y={top + 12} width={HW * 2 - 12} height={winH} />
          </clipPath>
        </defs>
        {/* ── THE BOOT: a hatch in the cornice, the plate the tower stands on, and the hopper
              the letters go INTO. Everything above this is one machine doing one thing. */}
        <g transform={`translate(${x} ${y}) scale(1 ${boot})`}>
          <rect x={-HW - 10} y={-BH} width={HW * 2 + 20} height={BH} rx={4} fill="#2A3358" />
          <rect x={-HW - 10} y={-BH} width={HW * 2 + 20} height={6} rx={3} fill="#9FB0D8" opacity={0.7} />
          {[-HW - 4, HW - 6].map((dx) => <rect key={dx} x={dx} y={-BH + 9} width={10} height={12} rx={3} fill="#111938" />)}
          <path d={`M${-HW - 34} ${-BH - 20} L${-HW - 6} ${-BH - 20} L${-HW - 6} ${-2} L${-HW - 24} ${-2} Z`}
            fill="#39456F" />
          <path d={`M${-HW - 34} ${-BH - 20} L${-HW - 6} ${-BH - 20} L${-HW - 6} ${-BH - 13} L${-HW - 31} ${-BH - 13} Z`}
            fill="#B4C2E4" opacity={0.75} />
        </g>
        {tower > 0.01 && (
          <g>
            {/* ── THE TOWER. The shaft behind the belt is nearly black on purpose: white paper on
                  a mid-grey casing was a rack of cards, and a rack of cards is not a machine. */}
            <rect x={x - HW} y={top} width={HW * 2} height={y - BH - top} fill="#05080F" />
            {[-HW, HW - 10].map((dx) => (
              <rect key={dx} x={x + dx} y={top} width={10} height={y - BH - top} fill={`url(#${tg})`} />
            ))}
            {(() => {
              const bays = Math.max(1, Math.round((y - BH - top) / 34));
              const h2 = (y - BH - top) / bays;
              return (
                <g>
                  {Array.from({ length: bays + 1 }, (_, k) => (
                    <g key={k}>
                      <rect x={x - HW - 5} y={top + k * h2 - 3} width={16} height={6} rx={2} fill="#4A5680" />
                      <rect x={x + HW - 11} y={top + k * h2 - 3} width={16} height={6} rx={2} fill="#39456F" />
                    </g>
                  ))}
                </g>
              );
            })()}
            {/* ── WHAT IS CLIMBING IT. One envelope per flight, full size, white, unmistakable. */}
            {belt > 0.01 && (
              <g clipPath={`url(#${cl})`} opacity={belt}>
                {Array.from({ length: N }, (_, k) => {
                  const u = ((k + phase) / N) % 1;
                  const py = y - BH - 10 - u * winH;
                  return (
                    <g key={k}>
                      <rect x={x - 21} y={py + 13} width={42} height={5} rx={2} fill="#8C9AC6" />
                      {run > 0.02 && <g transform={`translate(${x} ${py})`} opacity={run}><Envelope /></g>}
                    </g>
                  );
                })}
              </g>
            )}
            {/* ── THE HEAD, and THE DISCHARGE. The first cut stopped at a little chute pointing
                  at the sky, so the machine lifted letters to nowhere. A duct now runs from the
                  head down into the building's own roof: that is the whole sentence — your post,
                  lifted off the street and tipped inside the app. */}
            {head > 0.01 && (() => {
              const dx = duct.x - x, dy = duct.y - top, L = Math.hypot(dx, dy);
              return (
                <g transform={`translate(${x} ${top}) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI})`}>
                  <rect x={0} y={-17} width={L * head} height={34} rx={4} fill="#2E3A63" />
                  <rect x={0} y={-17} width={L * head} height={8} rx={4} fill="#B4C2E4" opacity={0.85} />
                  <rect x={0} y={9} width={L * head} height={8} rx={4} fill="#151D3C" opacity={0.8} />
                  {Array.from({ length: Math.max(1, Math.round((L * head) / 30)) }, (_, k) => (
                    <rect key={k} x={10 + k * 30} y={-19} width={5} height={38} rx={2} fill="#4A5680" />
                  ))}
                  {/* WHAT IS IN THE DUCT. A blind read of the whole stretch said nothing
                      was ever seen in transit anywhere — the machines asserted extraction and
                      never performed it. One envelope at a time now runs the duct and is
                      swallowed by the hood, and the hoist's column feeds it. */}
                  {run > 0.02 && Array.from({ length: 2 }, (_, k) => {
                    const u = ((t * 0.30 + k * 0.5) % 1);
                    if (u > 0.94) return null;
                    return (
                      <g key={k} transform={`translate(${16 + u * (L * head - 26)} 0)
                                             rotate(${-(Math.atan2(duct.y - top, duct.x - x) * 180) / Math.PI})`}
                        opacity={run * clamp01((0.94 - u) / 0.14)}>
                        <Envelope s={0.78} />
                      </g>
                    );
                  })}
                  {/* WHERE IT GOES IN. The first cut put a hood on the far END of the duct, which
                      from any distance is a muzzle: a blind read called this machine "a gun
                      aimed down at the city". The duct now runs INTO the roof and stops — the
                      opening is a recess in the building with a lip over it, and the envelopes
                      disappear into it. */}
                  <g transform={`translate(${L * head} 0)`}>
                    <rect x={-8} y={-21} width={26} height={42} rx={4} fill="#05080F" />
                    <rect x={-10} y={-25} width={30} height={9} rx={4} fill="#9FB0D8" />
                    <rect x={-10} y={17} width={30} height={9} rx={4} fill="#39456F" />
                  </g>
                  {run > 0.02 && <Light cx={L * head} cy={0} r={74} color={CAP_COL.sms} k={0.34 * run} />}
                </g>
              );
            })()}
            <g transform={`translate(${x} ${top})`}>
              <rect x={-HW - 8} y={-18} width={HW * 2 + 16} height={22} rx={5} fill="#5A6796" />
              <rect x={-HW - 8} y={-18} width={HW * 2 + 16} height={6} rx={3} fill="#DCE4F6" />
              <circle cx={0} cy={-7} r={9} fill="#161E3C" />
            </g>
          </g>
        )}
      </g>
    );
  };

/* ══ CALL — THE LINE-TAP CABINET ════════════════════════════════════════════════════════════
   The city's telephone riser comes up through the cornice on a gland; the cabinet cuts it and
   patches both ends through its own jackfield, so every call now passes through the app. The
   handset comes off its hook and stays off: the line is open, and somebody is on it. */

/* FOUR PASSES. 40 units: "a white smudge". 78 units dark, in front of the pediment: "two dark
   cylinders on a bar — a barbell". 88 units ivory, against the bank: "twin white cylinders on a
   swivel". The shape was the problem, not the size or the value: a symmetric bar with two equal
   flares is a dumbbell from any distance. This is the receiver silhouette everybody on earth
   already knows, built as a solid with a lit upper face and a shaded under face. */
const Handset: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-30 -32 a12 12 0 0 1 18 -2 l8 10 a10 10 0 0 1 -2 16 l-6 4 a42 42 0 0 0 20 20 l4 -6
             a10 10 0 0 1 16 -2 l10 8 a12 12 0 0 1 -2 18 l-6 6 c-8 6 -22 4 -32 -2
             a94 94 0 0 1 -34 -34 c-6 -10 -8 -24 -4 -32 Z" fill="#E8EDF9" />
    <path d="M-30 -32 a12 12 0 0 1 18 -2 l8 10 a10 10 0 0 1 -2 16 l-4 3 l-6 -8
             c-6 -8 -10 -14 -14 -19 Z" fill="#FFFFFF" />
    <path d="M14 22 l4 -6 a10 10 0 0 1 16 -2 l10 8 a12 12 0 0 1 -2 18 l-6 6 l-8 -7
             c-6 -5 -11 -10 -14 -17 Z" fill="#C7D2EC" />
    <circle cx={-16} cy={-20} r={5} fill="#1A2240" />
    <circle cx={22} cy={30} r={5} fill="#1A2240" />
  </g>
);

/** a telephone cord, which is a coil — the one line that says what this machine is on */
const coilPath = (len: number, n: number, amp: number) => {
  let d = 'M0 0';
  for (let i = 0; i < n; i++) {
    const y0 = (i * len) / n, y1 = ((i + 1) * len) / n;
    d += ` Q${i % 2 ? -amp : amp} ${(y0 + y1) / 2} 0 ${y1}`;
  }
  return d;
};

export const CallTap: React.FC<{ x: number; y: number; grow: number; live: number; t: number }> =
  ({ x, y, grow, live, t }) => {
    if (grow <= 0.001) return null;
    const g = clamp01(grow);
    const brk = ease.out(st(g, 0, 0.18));           // the bracket lands on the cornice
    const rise = outBack(st(g, 0.14, 0.50));        // and the cabinet is lowered out of it
    const riser = st(g, 0.44, 0.62);                // the city's line is drawn up the flank into it
    const doors = ease.inOut(st(g, 0.52, 0.74));    // and the cabinet opens
    const cord = ease.out(st(g, 0.70, 0.86));       // both cut ends are patched through
    const hook = ease.out(st(g, 0.84, 1));          // the handset comes off the hook
    /* ── IT HANGS BELOW THE CORNICE, AND IT GREW.
       Two things were wrong with the first cut. The handset was bracketed off the right flank,
       out over whatever the city had standing there — which was the bank and the bank's own
       identity sign, so the one detail that says what this machine IS was drawn across another
       building. And the cabinet stood on the ledge in the same 130 units of air the satellite's
       stem needs, so the stem's foot vanished behind it and the satellite appeared to be growing
       out of a switch box.
       So the cabinet came off the roof. It is hung off the cornice on a bracket, down the
       building's right flank, where a service cabinet on a real building is — the satellite now
       has the roof and the line tap has the wall, and they are 70 units apart in height instead
       of fighting over the same shelf. The receiver hangs INSIDE it, on its own cord, against the
       blackest field anywhere on this building. */
    const CW = 150, CH = 128;
    const cy = y + 14;                              // the cabinet's top, just under the bracket
    const drop = CH * rise;
    const col = CAP_COL.call;
    const swing = hook > 0.02 ? Math.sin(t * 2.2) * 7 * (0.35 + 0.65 * Math.exp(-st(g, 0.84, 1) * 1.2)) : 0;
    const cg = gid('callCab');
    return (
      <g>
        <defs>
          <LinGrad id={cg} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#9DABD2'], [0.32, '#55628F'], [1, '#232C4C']]} />
        </defs>
        {/* the bracket, bolted through the cornice: what the cabinet hangs from */}
        <g transform={`translate(${x} ${y}) scale(${brk} 1)`}>
          <rect x={-CW / 2 - 14} y={-18} width={CW + 28} height={20} rx={4} fill="#3B4771" />
          <rect x={-CW / 2 - 14} y={-18} width={CW + 28} height={5} rx={2} fill="#9FB0D8" opacity={0.75} />
          {[-CW / 2 - 6, CW / 2 - 8].map((dx) => <circle key={dx} cx={dx + 6} cy={-8} r={3.6} fill="#0B1022" />)}
          {/* the two hangers the cabinet is slung on */}
          {[-1, 1].map((sx) => (
            <rect key={sx} x={sx * (CW / 2 - 16) - 5} y={2} width={10} height={16} fill="#2A3358" />
          ))}
        </g>
        {rise > 0.01 && (
          <g>
            <rect x={x - CW / 2} y={cy} width={CW} height={drop} fill={`url(#${cg})`} />
            <rect x={x - CW / 2} y={cy + drop - 9} width={CW} height={9} rx={3} fill="#151D3C" />
            <rect x={x - CW / 2} y={cy} width={CW} height={7} rx={3} fill="#DCE4F6" />
            {/* the interior, behind the doors: a jackfield across the top, and the two cut ends
                of the city's line patched through it */}
            {doors > 0.02 && (
              <g>
                <rect x={x - CW / 2 + 8} y={cy + 14} width={CW - 16} height={CH - 28} fill="#05080F" />
                <rect x={x - CW / 2 + 8} y={cy + 14} width={CW - 16} height={6} fill="#151D3C" />
                {/* the jackfield takes the right half; the left half is where the receiver hangs */}
                {[0, 1, 2, 3].map((r) => [0, 1, 2].map((k) => (
                  <circle key={`${r}${k}`} cx={x + 24 + k * 21} cy={cy + 26 + r * 20} r={5}
                    fill={(r * 3 + k) % 3 === 0 ? mix('#1E2647', col, live) : '#1E2647'} />
                )))}
                {live > 0.3 && <Light cx={x + 40} cy={cy + 60} r={104} color={col} k={0.42 * live} />}
              </g>
            )}
            {/* THE CITY'S LINE, climbing the flank from below and cut at this box. It comes UP
                out of the street — which is where a telephone line comes from — rather than
                down out of the app's own roof, so what is being intercepted is legibly the
                city's and not the app's. */}
            {riser > 0.01 && (
              <path d={`M${x + 56} ${cy + CH + 120} C${x + 56} ${cy + CH + 40} ${x + 54} ${cy + CH + 30} ${x + 54} ${cy + CH - 14}`}
                fill="none" stroke={mix('#5A6796', col, live * 0.5)} strokeWidth={7} strokeLinecap="round"
                pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - riser} />
            )}
            {cord > 0.01 && [0, 1].map((n) => {
              const d = n
                ? `M${x + 54} ${cy + CH - 14} Q${x + 60} ${cy + 96} ${x + 60} ${cy + 86}`
                : `M${x + 54} ${cy + CH - 26} Q${x + 34} ${cy + 100} ${x + 20} ${cy + 86}`;
              return (
                <g key={n}>
                  <path d={d} fill="none" stroke={col} strokeWidth={5.5} strokeLinecap="round"
                    pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cord} opacity={0.95} />
                  {/* the calls themselves, passing through the patch */}
                  {live > 0.5 && (
                    <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round"
                      pathLength={1} strokeDasharray="0.12 0.88"
                      strokeDashoffset={n ? -((t * 0.5) % 1) : (t * 0.5 + 0.5) % 1} opacity={0.6} />
                  )}
                </g>
              );
            })}
            {/* the doors, swung open on their hinges */}
            {[-1, 1].map((sx) => (
              <g key={sx} transform={`translate(${x + sx * CW / 2} ${cy}) scale(${sx * Math.cos(doors * 1.36)} 1)`}>
                <rect x={0} y={5} width={CW / 2} height={CH - 10} fill={sx < 0 ? '#63709F' : '#3B4771'} />
                <rect x={0} y={5} width={7} height={CH - 10} fill="#B4C2E4" opacity={0.55} />
                <rect x={4} y={11} width={CW / 2 - 10} height={CH - 22} fill="none" stroke="#2A3358" strokeWidth={3} />
                <circle cx={CW / 2 - 10} cy={CH / 2} r={4} fill="#DCE4F6" />
              </g>
            ))}
            {/* ── THE HANDSET. The one detail that says who is on the line, drawn at the size of
                  a thing you can see: the first pass hung a 40-unit receiver off the side of the
                  box and it read as a white smudge, and three more passes failed on shape before
                  the plain receiver silhouette worked. It hangs INSIDE the open cabinet on its own
                  coiled cord — and it stays off the hook for the rest of the film. */}
            {doors > 0.3 && (
              <g transform={`translate(${x - 34} ${cy + 26})`}>
                <rect x={-11} y={-13} width={22} height={26} rx={5} fill="#2A3358" />
                <rect x={-11} y={-13} width={22} height={6} rx={3} fill="#8E9DC6" />
                <g transform={`rotate(${swing * 0.5})`}>
                  <path d={coilPath(14 + 34 * hook, 3 + Math.round(hook * 3), 9)} fill="none"
                    stroke="#9FADD4" strokeWidth={3.6} />
                  {/* it hangs level, because the cord is on its middle — and level is the pose the
                      shape is actually recognisable in */}
                  <g transform={`translate(${16 * hook} ${16 + 34 * hook}) rotate(${-40 + hook * 52 + swing})`}>
                    <Handset s={0.94} />
                  </g>
                </g>
                {hook > 0.4 && <Light cx={16 * hook} cy={16 + 34 * hook} r={96} color={col} k={0.26 * hook} />}
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

/* ══ BG — THE EYE ═══════════════════════════════════════════════════════════════════════════
   Running in the background is not a fifth dialog and it is not a lamp left on. It is the app
   being BEHIND everything — so the sky itself parts, and what is behind the city is the app's own
   lens, at a size that makes the whole skyline something being looked at. The lids are the night;
   the iris is the icon from the home screen; the red light inside it is the only thing that has
   changed about that icon. */
/** the saccade, shared by the pediment medallion and the eye behind the city so the two are
 *  unmistakably ONE object at two sizes. It holds, then flicks — a smooth sweep is a searchlight,
 *  a flick is something looking at things one at a time. Kept for anything that wants an idle eye
 *  with nothing in particular to watch; everything in acts 2 and 3 uses `gaze` below instead. */
export const saccade = (t: number) => {
  const step = Math.floor(t * 0.42);
  const frac = clamp01(((t * 0.42) % 1) * 7);
  const h = (n: number) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
  return {
    x: lerp(h(step) - 0.5, h(step + 1) - 0.5, ease.inOut(frac)) * 0.62,
    y: lerp(h(step + 37) - 0.5, h(step + 38) - 0.5, ease.inOut(frac)) * 0.34,
  };
};

/** WHERE THE EYE IS LOOKING.
 *
 *  An eye that drifts on a slow curve reads as a painted backdrop — which is what this one was —
 *  and an eye that sweeps smoothly reads as a searchlight. This one looks at WHATEVER THE FILM IS
 *  LOOKING AT: the caller hands it the camera's own centre, because every key in this film's
 *  camera tables is a thing rather than a position, so the gaze is derived and follows any change
 *  to the staging without a table of its own.
 *
 *  It gets there the way an eye gets anywhere. It HOLDS on a target for a beat, then FLICKS to the
 *  next in 90 ms, with a tremor underneath because a held eye is not a still one. The target is
 *  sampled at the dwell boundaries, never continuously, so the eye never tracks a moving camera
 *  smoothly — it catches up to it in jumps, which is what makes it read as looking rather than
 *  as being dragged.
 *
 *  IT IS DELIBERATELY QUIET. The gaze is clamped to about half an iris-width of travel and nothing
 *  about it brightens, so it is an extra layer of life behind the city and never a second event
 *  competing with the one in front of it. */
/* FIXATION IS NOT STILLNESS. A held eye makes small step movements a couple of times a second,
   drifts slowly between them, and tremors underneath all of it — and without them the iris sits
   dead in its socket for seconds at a time and reads as a painted prop rather than as something
   looking. This is the difference between an eye that is watching and a decal of one. */
const DWELL = 0.58, FLICK = 0.09;
const MICRO = 0.40;          // one small step about every four tenths of a second
const MICRO_A = 0.085;       // and about a twelfth of the socket when it makes one
const DRIFT_A = 0.026;
const TREMOR = 0.012;
const hsh = (n: number) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
const micro = (t: number) => {
  const i = Math.floor(t / MICRO);
  const f = ease.inOut(clamp01((t - i * MICRO) / 0.05));      // the step itself is fast
  /* every fourth one is bigger, because a run of identical twitches is its own kind of mechanism */
  const amp = (n: number) => (n % 4 === 0 ? 2.1 : 1);
  const p = (n: number) => ({ x: (hsh(n) - 0.5) * 2 * amp(n), y: (hsh(n + 91) - 0.5) * 2 * amp(n) });
  const a = p(i - 1), b = p(i);
  return {
    x: lerp(a.x, b.x, f) * MICRO_A + breathe(t, 7, 0.55) * DRIFT_A,
    y: lerp(a.y, b.y, f) * MICRO_A * 0.70 + breathe(t, 19, 0.47) * DRIFT_A * 0.70,
  };
};
export const gaze = (t: number, targetAt: (s: number) => { x: number; y: number },
  eye: { cx: number; cy: number }) => {
  /* how far off-centre the iris goes for a target that far off the eye's own axis. The divisors
     are the city's own reach: 760 across gets from the post office to the bank, 620 down gets from
     the roofline to the plaza, and past either the eye is simply looking as far as it can. */
  const aim = (p: { x: number; y: number }) => ({
    x: Math.max(-1, Math.min(1, (p.x - eye.cx) / 760)) * 0.50,
    y: Math.max(-1, Math.min(1, (p.y - eye.cy) / 620)) * 0.55,
  });
  const i = Math.floor(t / DWELL);
  const a = aim(targetAt((i - 1) * DWELL)), b = aim(targetAt(i * DWELL));
  const u = ease.inOut(clamp01((t - i * DWELL) / FLICK));
  const m = micro(t);
  return {
    x: lerp(a.x, b.x, u) + m.x + breathe(t, 31, 1.7) * TREMOR,
    y: lerp(a.y, b.y, u) + m.y + breathe(t, 43, 1.5) * TREMOR * 0.7,
  };
};

export const WatchEye: React.FC<{ cx: number; cy: number; rx: number; ry: number;
  open: number; rec: number; look: { x: number; y: number } }> = ({ cx, cy, rx, ry, open, rec, look }) => {
    if (open <= 0.002) return null;
    const o = ease.inOut(clamp01(open));
    const up = ry * o, dn = ry * 0.72 * o;
    /* THE LIDS ARE NOT DRAWN. The first cut painted them as two sky-coloured plates across the
       whole width, and a flat plate over a graded sky is a visible rectangle — there was a hard
       black edge running off the side of the frame. The eye is a HOLE in the night instead: the
       socket is clipped to the almond, and the only thing marking the lids is the lit rim where
       they have parted and the shadow the upper one throws inside. */
    const lid = `M${cx - rx} ${cy} Q${cx} ${cy - up * 2.15} ${cx + rx} ${cy}
                 Q${cx} ${cy + dn * 2.15} ${cx - rx} ${cy} Z`;
    const ir = ry * 0.74;   // it must not reach the antenna's x, or the tower bisects the pupil
    const cp = gid('eyeClip'), sg = gid('eyeSclera');
    return (
      <g>
        <defs>
          <clipPath id={cp}><path d={lid} /></clipPath>
          {/* a COLD, DARK socket. It was pale, and a pale dome behind a pale pediment merged into
              one shape — the office's own roof disappeared into the eye. The iris has to be the
              brightest thing inside it, because the iris is the thing that means something. */}
          <LinGrad id={sg} x1={0} y1={0} x2={0} y2={1}
            stops={[[0, '#28304F'], [0.3, '#5D6B96'], [0.62, '#46527C'], [1, '#1B2038']]} />
        </defs>
        {/* the orbit: a soft dark halo so it is set INTO the night rather than laid on top of it */}
        <path d={lid} fill="none" stroke="#04071A" strokeWidth={ry * 0.5} opacity={0.55} />
        <g clipPath={`url(#${cp})`}>
          <rect x={cx - rx} y={cy - ry * 1.3} width={rx * 2} height={ry * 2.6} fill={`url(#${sg})`} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const sx = k % 2 ? 1 : -1, f = 0.40 + (k >> 1) * 0.18;
            return <path key={k}
              d={`M${cx + sx * rx} ${cy + ((k % 3) - 1) * ry * 0.28}
                  q${-sx * rx * f * 0.5} ${ry * 0.10} ${-sx * rx * f} ${(k % 2 ? 1 : -1) * ry * 0.05}`}
              fill="none" stroke="#B9727C" strokeWidth={2.6} opacity={0.22} />;
          })}
          {/* THE IRIS — the app's own lens, at city scale */}
          <g transform={`translate(${cx + look.x * rx * 0.34} ${cy + look.y * ry * 0.40})`}>
            <circle r={ir * 1.06} fill="#080D1E" opacity={0.7} />
            <AppLens r={ir} open={lerp(0.26, 0.84, o)} rec={rec} glass={0.45} />
          </g>
          {/* the shadow the upper lid throws into the socket */}
          <path d={`M${cx - rx} ${cy} Q${cx} ${cy - up * 2.15} ${cx + rx} ${cy}`} fill="none"
            stroke="#04071A" strokeWidth={ry * 0.30} opacity={0.65} />
        </g>
        {/* the wet line along both lids, which is the only place they are visible at all */}
        {[[-up, 1], [dn, 1]].map(([d2], i) => (
          <path key={i} d={`M${cx - rx} ${cy} Q${cx} ${cy + d2 * 2.15} ${cx + rx} ${cy}`} fill="none"
            stroke={i ? '#6E80B4' : '#A8BCE8'} strokeWidth={i ? 3 : 4.6} opacity={(i ? 0.42 : 0.7) * o} />
        ))}
        {rec > 0.05 && <Light cx={cx + look.x * rx * 0.34} cy={cy + look.y * ry * 0.40} r={ir * 1.9}
          color="#FF5A4E" k={0.18 * rec * o} />}
      </g>
    );
  };

/* ══ THE FEEDERS ════════════════════════════════════════════════════════════════════════════
   What the antenna keeps. Each grant that comes back down the mast leaves a permanent feeder in
   its capability's colour, running from the head, down the tower and out to the apparatus it now
   drives. Four grants, four feeders, four different destinations — the antenna visibly ends the
   scene running four things it did not run a minute ago. */
export const Feeder: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number };
  col: string; grow: number; drop?: number; t?: number; phase?: number; dir?: number }> =
  ({ from, to, col, grow, drop = 30, t = 0, phase = 0, dir = 1 }) => {
    if (grow <= 0.002) return null;
    /* A cable leaves a mast head DOWNWARD and comes out horizontally at the equipment it feeds;
       it does not fly across the roof on a parabola. The first cut did, and four parabolas over
       the pediment buried the medallion the whole scene turns on. */
    const vy = to.y - drop;
    const d = `M${from.x} ${from.y} C${from.x} ${vy} ${to.x} ${vy} ${to.x} ${to.y}`;
    return (
      <g>
        <path d={d} fill="none" stroke="#0D1329" strokeWidth={6} strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(grow)} />
        <path d={d} fill="none" stroke={col} strokeWidth={2.6} strokeLinecap="round" opacity={0.85}
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(grow)} />
        {/* once it is live, something is ON it. A blind read of the whole stretch said
            extraction was "asserted by static cables, never shown" — so each feeder now carries
            one slow bead down from the head into the apparatus it drives. One, and slow: four
            busy cables over a roof is the clutter the same viewer complained about. */}
        {/* DIRECTION IS THE ARGUMENT. Through the permissions the bead runs head -> machine: the
            antenna is handing a capability out. In the theft it runs the other way, because the
            road the victim built is being used in the direction they never pictured. Same cable,
            same bead, opposite sign — nothing is added to say it. */}
        {grow > 0.995 && (
          <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.55}
            pathLength={1} strokeDasharray="0.035 0.965"
            strokeDashoffset={-dir * ((t * 0.34 + phase) % 1)} />
        )}
      </g>
    );
  };

/* ══ THE ASK ════════════════════════════════════════════════════════════════════════════════
   What "the app begins asking for permissions" actually looks like. The antenna's head is the
   centre of a circular wavefront that crosses the city at a speed you can watch, and a building
   starts asking at the instant the front reaches IT. One wavefront per permission, each carrying
   its capability's colour and a brighter lobe aimed at the building it is addressed to, so four
   identical rings never go out and leave the viewer guessing which one meant what. */
const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
  return `M${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
};

export const Wavefront: React.FC<{ cx: number; cy: number; r: number; col: string; k: number;
  bearing?: number }> = ({ cx, cy, r, col, k, bearing }) => {
    if (k <= 0.01 || r < 4) return null;
    const lobe = Math.PI * 0.36;
    /* WITH NO BEARING THE CIRCLE *IS* THE SIGNAL. When this carried a lobe the ring behind it was
       deliberately subliminal — the lobe was the address and a bright circle only competed with it.
       The permission act asks the whole city at once now, so there is no address to carry and the
       ring has to be the thing you watch: it is drawn at full weight, with a softer echo behind it
       so it reads as a front moving outwards rather than as a circle being scaled. */
    if (bearing === undefined) return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={6} opacity={0.85 * k} />
        <circle cx={cx} cy={cy} r={r * 0.965} fill="none" stroke={col} strokeWidth={2.4}
          opacity={0.34 * k} />
        <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke={col} strokeWidth={1.4}
          opacity={0.16 * k} />
      </g>
    );
    return (
      <g>
        {/* the full circle is nearly subliminal: at 0.26 it crossed the eye like a scratch on
            the lens. The LOBE is what carries the address. */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={2.2} opacity={0.15 * k} />
        {bearing !== undefined && (
          <g>
            <path d={arcPath(cx, cy, r, bearing - lobe, bearing + lobe)} fill="none" stroke={col}
              strokeWidth={7.5} strokeLinecap="round" opacity={0.85 * k} />
            <path d={arcPath(cx, cy, r * 0.93, bearing - lobe * 0.7, bearing + lobe * 0.7)} fill="none"
              stroke={col} strokeWidth={3} strokeLinecap="round" opacity={0.42 * k} />
          </g>
        )}
      </g>
    );
  };

/** and what comes back: a short arc on the SAME radial, sliding inward to the antenna. The answer
 *  travels the path the question took, which is why the antenna is where it lands. */
export const Backwash: React.FC<{ cx: number; cy: number; r: number; col: string; k: number;
  bearing: number }> = ({ cx, cy, r, col, k, bearing }) => {
    if (k <= 0.01 || r < 4) return null;
    const lobe = Math.PI * 0.16;
    return (
      <g>
        <path d={arcPath(cx, cy, r, bearing - lobe, bearing + lobe)} fill="none" stroke={col}
          strokeWidth={9} strokeLinecap="round" opacity={0.95 * k} />
        <path d={arcPath(cx, cy, r + 16, bearing - lobe * 0.8, bearing + lobe * 0.8)} fill="none"
          stroke={col} strokeWidth={4} strokeLinecap="round" opacity={0.4 * k} />
      </g>
    );
  };

/* ══ THE KEY ════════════════════════════════════════════════════════════════════════════════
   Both blind reads landed on the same sentence: nothing is ever seen in transit. The sequence
   asserted a pipeline — rings, cables, machines — and never once showed an object in the pipe.
   So the grant now HAS a physical token. Pressing ✓ hands over a key; the key goes back along the
   radial the question came out on, lands on the antenna, and rides the tip of the feeder the
   antenna pays out to whichever machine that permission has just bought. One object, one
   continuous journey, no cut — and it is a KEY rather than a sack of letters because what the
   victim gives away at that instant is not their post, it is the right to it. */
export const GrantKey: React.FC<{ col: string; s?: number }> = ({ col, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle cx={-14} cy={0} r={10} fill={col} />
    <circle cx={-14} cy={0} r={4.4} fill="#070C1C" />
    <rect x={-7} y={-3.8} width={28} height={7.6} rx={2.4} fill={col} />
    <rect x={11} y={3.4} width={4.4} height={8} rx={1} fill={col} />
    <rect x={18} y={3.4} width={4.4} height={5.4} rx={1} fill={col} />
    <rect x={-7} y={-3.8} width={28} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.5} />
    <circle cx={-14} cy={-6} r={3} fill="#FFFFFF" opacity={0.35} />
  </g>
);

/** a point on a Feeder's own curve, so the key rides the exact path the cable is drawn on */
export const feederPoint = (from: { x: number; y: number }, to: { x: number; y: number },
  drop: number, u: number) => {
  const vy = to.y - drop, m = 1 - u;
  return {
    x: m * m * m * from.x + 3 * m * m * u * from.x + 3 * m * u * u * to.x + u * u * u * to.x,
    y: m * m * m * from.y + 3 * m * m * u * vy + 3 * m * u * u * vy + u * u * u * to.y,
  };
};
