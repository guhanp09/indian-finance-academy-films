/* ACT 3 — THE THINGS THE REVEAL AND THE THEFT NEED, and nothing the earlier acts already own.
 *
 * Three objects live here:
 *
 *   1. THE SHELL — the inside of the fake e-Challan office, and the film's hero asset. The reveal's
 *      whole argument is that the civic building was a FRONT, so what comes off it has to be the
 *      thing it was a front for: a delivery plant. Bare steel instead of storeys, the lamps that
 *      faked the lit windows still burning at nothing, the mast's shaft running the full height of
 *      the room to a loading head, and the app's own courier in a painted bay with the next payload
 *      in the claw above it. See the section header for how each piece is derived.
 *
 *   2. THE DECK — the app's four screens as one physical stack. "those fake payment screens" is
 *      plural on purpose; the app drew every one of them, and a deck of panes with real thickness
 *      says that in a way a single screen cannot. The card details sit in the second pane down,
 *      exactly where the victim typed them.
 *
 *   3. THE STATION — where the tunnel ends. Cold, functional, and a business: a receiving dish,
 *      a shed of machines, and two more sheds behind it, because the victim is one of many. No
 *      hooded figure, no green terminal, no skull. The only interface on it is a mechanical lock.
 *
 * Everything obeys the v2 grammar: no outlines, form from value, recession by colour, light from
 * a named source.
 */
import React from 'react';
import { C, SCREEN, STATUS_H, clamp01, ease, hash01, lerp, mix } from '../design';
import { CAP_COL, Drone, Q } from './fortress';
import { LinGrad, Light, P, RadGrad, Stars, gid } from './style';

const st = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/* ══ 1 · THE SHELL ═══════════════════════════════════════════════════════════════════════════
   WHAT THE FRONT WAS HIDING — and the film's hero asset, built as one.

   The sentence is "the first app was a dropper". A dropper is not an empty room; it is a
   DELIVERY PLANT. So what the facade comes off is the machine's own lower half, and the reveal
   makes four statements in the order the eye reads them:

     1. THERE IS NO OFFICE. No storeys, no stair, no counter, no records, nobody. What holds this
        building up is two bare steel stanchions and their bracing — a shed, dressed as a temple.
     2. THE WINDOWS WERE PROPS. Two rails of bare lamps stand at exactly the heights and exactly
        the x positions of the facade's eight lit windows, aimed forward at the holes that were
        cut for them. The front sinks; the lamps stay, still burning, now shining at nothing.
     3. THE BUILDING IS THE MACHINE. The service shaft the mast stands on does not begin at the
        roof — it runs the full height of this room to a loading head, and the apparatus on the
        cornice is bolted THROUGH the ceiling on anchors you can see the underside of from here.
     4. THIS IS A DISPATCH BAY. What comes down the shaft is clamped under the courier, and the
        courier is parked facing the opening where the portal was — the doorway it flew the update
        in through. The vehicle is garaged inside the thing it delivered. That is what a dropper IS.

   Nothing in here is placed. The lamp rails come off Office3's own window table, the ceiling
   anchors off OFFICE_MOUNT, the bay is centred on the portal, the trunk is drawn around the
   service spine fortress.tsx has been drawing since act 2, and the stanchions stand under the two
   roof machines that need carrying. Move the office and every one of them moves with it.

   Lit by what is actually in the room: eight bare lamps that throw their light OUT (they were
   never lighting this room — they were lighting the windows), one bay lamp over the courier on a
   cord, the shaft's own traffic, and the city, now that the front is down. */
export const SHELL = {
  x0: 488, x1: 892,            // the block's own width: Office3's -176..176 at x 690, s 1.15
  floor: 1127,                 // the plinth's top — the deck the front sinks into
  /* THE CEILING IS THE UNDERSIDE OF THE FRIEZE, not of the architrave. Office3's entablature is
     four courses deep and the lowest of them — the cobalt band that sits on the columns — runs to
     local beamY+2, q 646. The first cut put this at 606 and the whole ceiling, its joists and all
     three of the apparatus's anchor bolts drew forty units UP INSIDE the entablature, where the
     building's own stonework covers them: the load path was in the file and not on the screen. */
  roof: 646,
  deck: 1046,                  // where the back wall stops and the floor plane starts
  cradle: { x: 690, y: 1104 },
  /* THE TWO STANCHIONS STAND UNDER THE TWO ROOF MACHINES THAT NEED CARRYING, and the shaft
     carries the third. OFFICE_MOUNT puts the mail hoist at 690-134*1.15 and the line tap at
     690+136*1.15; these are those numbers, so the load path is real from the cornice to the slab. */
  post: [536, 846],
  anchor: [536, 690, 846],
  /* the service shaft's casing, drawn around fortress's own spine (q x 668..712) */
  trunk: { x0: 638, x1: 742 },
  /* THE WINDOW TABLE, lifted off Office3 so a lamp can never drift off the hole it was lighting:
     rows at local by+44+r*76 and columns at local ±95 / ±32, through x 690, base 1180, s 1.15. */
  win: { xs: [581, 653, 727, 799], rows: [730, 817] },
};
const SH_TRUNK_C = (SHELL.trunk.x0 + SHELL.trunk.x1) / 2;

/** ONE OF THE EIGHT. A bare lamp on a stem under a rail, with a shallow shade over it so its
 *  light goes forward and down — out through the hole in the panel, which is the only job it has
 *  ever had. It is deliberately a poor light for the room it stands in. */
const Bulb: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g>
    <rect x={x - 3.5} y={y} width={7} height={19} fill="#39446E" />
    <path d={`M${x - 21} ${y + 22} h42 l-11 -6 h-20 Z`} fill="#2A3358" />
    <path d={`M${x - 21} ${y + 22} h42 l-8 12 h-26 Z`} fill="#55628F" />
    {on > 0.01 && (
      <g opacity={on}>
        <circle cx={x} cy={y + 39} r={10.5} fill={mix(Q.window, '#FFF3D6', 0.5)} />
        <circle cx={x} cy={y + 39} r={4.6} fill="#FFFFFF" />
        <Light cx={x} cy={y + 34} r={118} color={Q.window} k={0.46} />
      </g>
    )}
  </g>
);

/** the rail they hang off: a folded channel spanning the bay, bolted to both stanchions.
 *  ONLY THE UPPER ROW IS LAMPED. The facade has two rows of windows but the boundary wall stands
 *  420 units in front of this building and its cap crosses at q 820 — the lower row has never once
 *  been visible from the street, so lamps there would be four glows cut in half by a steel beam,
 *  which is what the first cut of this looked like. The lower rail stays as what it actually is:
 *  a piece of framing. */
const LampRail: React.FC<{ y: number; on: number }> = ({ y, on }) => (
  <g>
    <rect x={SHELL.post[0]} y={y} width={SHELL.post[1] - SHELL.post[0]} height={15} fill="#2A3558" />
    <rect x={SHELL.post[0]} y={y} width={SHELL.post[1] - SHELL.post[0]} height={4.5} fill="#8290BE" />
    <rect x={SHELL.post[0]} y={y + 11} width={SHELL.post[1] - SHELL.post[0]} height={4} fill="#080D1C" />
    {on > 0.001 && SHELL.win.xs.map((x) => <Bulb key={x} x={x} y={y + 14} on={on} />)}
  </g>
);

/** a stanchion: an I-section seen face on, welded up in lifts, with a head plate under the
 *  ceiling and a base plate bolted through the slab. This is the whole structure of the building. */
const Post: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => (
  <g>
    <rect x={x - 15} y={y0} width={30} height={y1 - y0} fill="#141C36" />
    <rect x={x - 15} y={y0} width={7} height={y1 - y0} fill="#5A6892" />
    <rect x={x + 8} y={y0} width={7} height={y1 - y0} fill="#0B1122" />
    {/* the splices, where one lift of steel is bolted onto the next */}
    {[0.3, 0.62].map((f) => {
      const yy = y0 + (y1 - y0) * f;
      return (
        <g key={f}>
          <rect x={x - 21} y={yy} width={42} height={16} rx={2} fill="#2B3557" />
          <rect x={x - 21} y={yy} width={42} height={4} rx={2} fill="#7683AE" />
          {[-13, 13].map((dx) => <circle key={dx} cx={x + dx} cy={yy + 9} r={2.6} fill="#070C18" />)}
        </g>
      );
    })}
    {/* head plate */}
    <rect x={x - 26} y={y0} width={52} height={13} rx={2} fill="#333E64" />
    <rect x={x - 26} y={y0} width={52} height={4} rx={2} fill="#8390BC" />
    {/* base plate, on the slab, with four holding-down bolts */}
    <rect x={x - 30} y={y1 - 15} width={60} height={15} rx={2} fill="#2B3557" />
    <rect x={x - 30} y={y1 - 15} width={60} height={4} rx={2} fill="#7683AE" />
    {[-21, -7, 7, 21].map((dx) => (
      <rect key={dx} x={x + dx - 2.6} y={y1 - 22} width={5.2} height={9} rx={1.6} fill="#5A6892" />
    ))}
    {/* the haunch back to the wall: the only thing stopping it folding sideways */}
    <path d={`M${x - 15} ${y0 + 34} L${x - 15} ${y0 + 84} L${x - 56} ${y0 + 34} Z`} fill="#1B2440" />
  </g>
);

/** the bracing in one side bay: a K, from the stanchion's mid splice out to the trunk */
const Brace: React.FC<{ x0: number; x1: number; y0: number; y1: number }> = ({ x0, x1, y0, y1 }) => {
  const mid = (y0 + y1) / 2, w = 11;
  const leg = (ax: number, ay: number, bx: number, by: number, lit: boolean) => (
    <g>
      <path d={`M${ax} ${ay} L${bx} ${by}`} stroke="#1A2340" strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ax} ${ay} L${bx} ${by}`} stroke={lit ? '#4E5C88' : '#0E1428'} strokeWidth={3.4}
        strokeLinecap="round" transform="translate(0 -3)" />
    </g>
  );
  return (
    <g>
      {leg(x0, y0, x1, mid, true)}
      {leg(x0, y1, x1, mid, false)}
      <circle cx={x1} cy={mid} r={9} fill="#2B3557" />
      <circle cx={x1} cy={mid} r={3.4} fill="#070C18" />
    </g>
  );
};

/** THE SHAFT'S CASING. fortress draws the bright spine inside this from q 652 to 916; the casing
 *  goes the whole way — ceiling to loading head — because that is the point: the mast on the roof
 *  and the bay on the floor are the two ends of ONE pipe. */
const Trunk: React.FC<{ y0: number; y1: number }> = ({ y0, y1 }) => {
  const { x0, x1 } = SHELL.trunk, w = x1 - x0;
  const g = gid('shTrunk');
  return (
    <g>
      <defs>
        <LinGrad id={g} x1={0} y1={0} x2={1} y2={0}
          stops={[[0, '#3A4670'], [0.34, '#1A2340'], [1, '#0A0F20']]} />
      </defs>
      <rect x={x0} y={y0} width={w} height={y1 - y0} fill={`url(#${g})`} />
      <rect x={x0 + 16} y={y0} width={w - 32} height={y1 - y0} fill="#090E1E" />
      {/* ribs: a duct this size is stiffened every few feet */}
      {Array.from({ length: Math.ceil((y1 - y0) / 64) }, (_, i) => {
        const yy = y0 + 26 + i * 64;
        if (yy > y1 - 20) return null;
        return (
          <g key={i}>
            <rect x={x0 - 7} y={yy} width={w + 14} height={11} rx={2} fill="#26304F" />
            <rect x={x0 - 7} y={yy} width={w + 14} height={3.4} rx={1.7} fill="#6A78A6" />
          </g>
        );
      })}
      {/* the loom strapped to its right flank: what the feeders on the roof are the top end of */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x1 - 9 + i * 3.4} y={y0} width={2.4} height={y1 - y0}
          fill={['#2B3557', '#1B2340', '#2B3557'][i]} />
      ))}
    </g>
  );
};

/** WHAT THE SHAFT DELIVERS. Light, not cardboard: what arrived on the dish was never a parcel, and
 *  the film has drawn the app's traffic as cyan since the first wavefront. A steel flask with a
 *  window in it, so the thing inside is visible but contained — and it carries the app's own mark,
 *  because this is the app's stock, not somebody else's. */
const Flask: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <Light cx={0} cy={0} r={170} color="#8FE8FF" k={0.42 + 0.10 * pulse} />
      {/* the bail the claw hooks into */}
      <path d="M-26 -22 V-32 H26 V-22" fill="none" stroke="#6A78A6" strokeWidth={7}
        strokeLinejoin="round" />
      {/* the flask: end caps, a band of glass, and what is behind the glass */}
      <rect x={-52} y={-22} width={104} height={44} rx={12} fill="#2A3558" />
      <rect x={-52} y={-22} width={104} height={9} rx={4.5} fill="#8290BE" />
      <rect x={-52} y={13} width={104} height={9} rx={4.5} fill="#0B1020" />
      {[-1, 1].map((sx) => (
        <rect key={sx} x={sx < 0 ? -52 : 30} y={-22} width={22} height={44} rx={11} fill="#3D4A78" />
      ))}
      <rect x={-27} y={-13} width={54} height={26} rx={7} fill="#04101E" />
      <rect x={-27} y={-13} width={54} height={26} rx={7} fill="#5FDCFF" />
      <rect x={-24} y={-10} width={48} height={20} rx={5} fill="#BFF4FF"
        opacity={0.55 + 0.30 * pulse} />
      <rect x={-17} y={-6} width={34} height={9} rx={4} fill="#FFFFFF" opacity={0.75} />
    </g>
  );
};

/** THE LOADING HEAD at the foot of the shaft: the hopper the shaft discharges into, and a claw
 *  holding the next flask over the vehicle that will carry it out. The building received it; the
 *  claw is putting it on the courier; the courier goes out through the door the victim opened.
 *  The whole chain of "the update installed the malware" is one vertical line through this room. */
const Loader: React.FC<{ y: number; hot: number; t: number }> = ({ y, hot, t }) => {
  const cx = SH_TRUNK_C, CAN = y + 110;
  return (
    <g>
      {/* the cross beam it hangs off, spanning between the stanchions */}
      <rect x={SHELL.post[0]} y={y - 12} width={SHELL.post[1] - SHELL.post[0]} height={18} fill="#1C2542" />
      <rect x={SHELL.post[0]} y={y - 12} width={SHELL.post[1] - SHELL.post[0]} height={5} fill="#6D7BA8" />
      {/* the hopper: the shaft's mouth, narrowing to a throat */}
      <path d={`M${cx - 62} ${y + 6} H${cx + 62} L${cx + 26} ${y + 62} H${cx - 26} Z`} fill="#2A3558" />
      <path d={`M${cx - 52} ${y + 6} H${cx + 52} L${cx + 20} ${y + 54} H${cx - 20} Z`} fill="#0B1020" />
      {hot > 0.01 && (
        <g opacity={hot}>
          <path d={`M${cx - 46} ${y + 10} H${cx + 46} L${cx + 18} ${y + 52} H${cx - 18} Z`}
            fill="#8FE8FF" opacity={0.22 + 0.10 * Math.sin(t * 2.1)} />
          <Light cx={cx} cy={y + 44} r={110} color="#8FE8FF" k={0.40} />
        </g>
      )}
      {/* the block, and a hook through the flask's bail. ONE hook, not a pair of arms: two arms
          either side of the flask read as part of the flask, and the film already owns this shape —
          it is the hoist's, on the cornice directly above this room. */}
      <rect x={cx - 30} y={y + 58} width={60} height={22} rx={5} fill="#38436C" />
      <rect x={cx - 30} y={y + 58} width={60} height={5} rx={2.5} fill="#93A0CA" />
      <circle cx={cx} cy={y + 69} r={7} fill="#0B1020" />
      <path d={`M${cx} ${y + 76} V${y + 88}`} stroke="#4E5C88" strokeWidth={10} strokeLinecap="round" />
      <path d={`M${cx - 13} ${y + 88} h26 l-4 10 h-18 Z`} fill="#6A78A6" />
      <path d={`M${cx} ${y + 98} v10 a13 13 0 1 0 -13 -13`} fill="none" stroke="#8290BE"
        strokeWidth={9} strokeLinecap="round" />
      <Flask x={cx} y={CAN} t={t} />
    </g>
  );
};

/** THE CRADLE the courier stands in: a low steel trestle on the painted bay, wheeled, because it
 *  gets pushed out to the doorway and pushed back. */
const Cradle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    {/* the deck it stands on */}
    <rect x={x - 62} y={y - 48} width={124} height={13} rx={3} fill="#3B4772" />
    <rect x={x - 62} y={y - 48} width={124} height={4} rx={2} fill="#8B97C2" />
    {/* the two side frames, and the rail between them */}
    {[-1, 1].map((sx) => (
      <g key={sx}>
        <path d={`M${x + sx * 52} ${y - 35} L${x + sx * 84} ${y - 6} h${sx * 22} l${-sx * 54} ${-29} Z`}
          fill="#232D4E" />
        <rect x={x + sx * 84 - 13} y={y - 12} width={26} height={16} fill="#2E3960" />
      </g>
    ))}
    <rect x={x - 100} y={y - 8} width={200} height={14} rx={3} fill="#28324F" />
    <rect x={x - 100} y={y - 8} width={200} height={4} rx={2} fill="#7C8AB6" />
    {[-80, 80].map((dx) => (
      <g key={dx}>
        <circle cx={x + dx} cy={y + 10} r={11} fill="#0D1226" />
        <circle cx={x + dx} cy={y + 10} r={4.4} fill="#55638F" />
      </g>
    ))}
    {/* the drum the charge lead is wound on */}
    <g transform={`translate(${x + 124} ${y - 24})`}>
      <rect x={-17} y={-17} width={34} height={34} rx={5} fill="#232D4E" />
      <rect x={-17} y={-17} width={34} height={4} rx={2} fill="#6A78A6" />
      <circle r={12} fill="#161E3A" />
      <circle r={12} fill="none" stroke="#5A6892" strokeWidth={3} />
    </g>
  </g>
);

/** THE SHELL. Drawn behind Office3 and in front of the sky, in the same q the city stands in — it
 *  is the inside of this building, not a second place. */
export const Shell: React.FC<{ t: number; lamp?: number; open?: number }> =
  ({ t, lamp = 1, open = 1 }) => {
    const S = SHELL;
    const Wd = S.x1 - S.x0;
    const k = clamp01(open);
    if (k <= 0.002) return null;
    const led = 0.26 + 0.74 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.35), 3);
    const back = gid('shBack'), side = gid('shSide'), spill = gid('shSpill'),
      floor = gid('shFloor'), wash = gid('shWash');
    /* THE VERTICAL CHAIN, and the only reason these numbers are what they are: hopper 872-928,
       flask in the claw 942-982, the courier's rotors at 1002, its body 1010-1060, the cradle to
       1112, the slab's front lip at 1127. Every link is clear of the one under it, because the
       first cut stacked them and the flask disappeared inside the cradle. */
    const LOAD = 866;                                // the loading head's beam
    return (
      <g>
        <defs>
          <LinGrad id={back} stops={[[0, '#232C4E'], [0.42, '#161E3A'], [1, '#080D1C']]} />
          <LinGrad id={side} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#4A5680'], [0.5, '#242D4C'], [1, '#0E1526']]} />
          <LinGrad id={spill} stops={[[0, '#A8C0F0', 0], [1, '#A8C0F0', 0.22]]} />
          <LinGrad id={floor} stops={[[0, '#252F55'], [0.5, '#313D68'], [1, '#3D4A78']]} />
          <RadGrad id={wash} cx={0.5} cy={0.42} r={0.62}
            stops={[[0, Q.window, 0.16], [0.55, Q.window, 0.05], [1, Q.window, 0]]} />
        </defs>

        {/* ── THE VOLUME. Plinth to ceiling, one room, no storeys. */}
        <rect x={S.x0} y={S.roof - 10} width={Wd} height={S.deck - S.roof + 10} fill={`url(#${back})`} />
        {/* precast joints: the panels this box was tilted up out of, and nothing else */}
        {[96, 176, 256, 336].map((d) => (
          <g key={d}>
            <rect x={S.x0} y={S.roof + d} width={Wd} height={4} fill="#070C18" opacity={0.7} />
            <rect x={S.x0} y={S.roof + d + 4} width={Wd} height={2.4} fill="#3D4A78" opacity={0.55} />
          </g>
        ))}
        {/* the warm wash the eight lamps leave on the wall behind them: almost nothing, because
            they are aimed the other way */}
        <rect x={S.x0} y={S.roof + 60} width={Wd} height={360} fill={`url(#${wash})`} />

        {/* ── THE SIDE RETURNS: this building is one panel thick on every face. */}
        {[-1, 1].map((sx) => {
          const x = sx < 0 ? S.x0 : S.x1 - 30;
          return (
            <g key={sx}>
              <rect x={x} y={S.roof - 10} width={30} height={S.deck - S.roof + 10} fill={`url(#${side})`}
                transform={sx > 0 ? `translate(${x * 2 + 30} 0) scale(-1 1)` : undefined} />
              <rect x={sx < 0 ? x + 26 : x} y={S.roof - 10} width={4} height={S.deck - S.roof + 10}
                fill="#C6D2F0" opacity={0.30} />
            </g>
          );
        })}

        {/* ── THE CEILING: the underside of the entablature, and the bolts of the three machines
              standing on it. The apparatus is not sitting on this building; it is THROUGH it. */}
        <rect x={S.x0} y={S.roof - 10} width={Wd} height={28} fill="#1A2340" />
        <rect x={S.x0} y={S.roof + 16} width={Wd} height={5} fill="#050912" />
        {Array.from({ length: 8 }, (_, i) => {
          const jx = S.x0 + 24 + i * 47;
          if (jx > S.trunk.x0 - 20 && jx < S.trunk.x1) return null;
          return (
            <g key={i}>
              <rect x={jx} y={S.roof + 18} width={16} height={24} rx={3} fill="#28324F" />
              <rect x={jx} y={S.roof + 18} width={16} height={5} rx={2} fill="#6472A0" opacity={0.7} />
            </g>
          );
        })}
        {S.anchor.map((ax) => (
          <g key={ax}>
            <rect x={ax - 46} y={S.roof + 19} width={92} height={22} rx={3} fill="#4E5C88" />
            <rect x={ax - 46} y={S.roof + 19} width={92} height={6} rx={3} fill="#B2BEE2" />
            <rect x={ax - 46} y={S.roof + 36} width={92} height={5} rx={2} fill="#0B1122" />
            {[-30, -10, 10, 30].map((dx) => (
              <g key={dx}>
                <rect x={ax + dx - 5.5} y={S.roof + 41} width={11} height={19} rx={2} fill="#6A78A6" />
                <rect x={ax + dx - 8} y={S.roof + 57} width={16} height={9} rx={2} fill="#38436C" />
                <rect x={ax + dx - 8} y={S.roof + 57} width={16} height={3} rx={1.5} fill="#93A0CA" />
              </g>
            ))}
          </g>
        ))}

        {/* ── THE STRUCTURE. Two stanchions and their bracing: all there is. */}
        <Brace x0={S.post[0] + 15} x1={S.trunk.x0} y0={S.roof + 56} y1={S.roof + 186} />
        <Brace x0={S.post[1] - 15} x1={S.trunk.x1} y0={S.roof + 56} y1={S.roof + 186} />
        {/* the shaft runs up BEHIND the entablature, which is what a shaft through a floor does */}
        <Trunk y0={S.roof - 40} y1={LOAD} />
        {S.post.map((x) => <Post key={x} x={x} y0={S.roof + 18} y1={S.deck} />)}

        {/* ── THE PROPS. Four bare lamps, on the facade's own window grid, still burning at the
              holes that are no longer in front of them. */}
        <LampRail y={S.win.rows[0]} on={lamp} />
        <LampRail y={S.win.rows[1] - 17} on={0} />
        {/* the conduit that feeds them, down the left stanchion to a time switch clamped to it:
            somebody wired this, and somebody set it to come on at dusk */}
        <path d={`M${S.post[0] + 21} ${S.win.rows[0] + 7} V${S.deck - 152}`}
          fill="none" stroke="#131A32" strokeWidth={7} />
        <g transform={`translate(${S.post[0] + 21} ${S.deck - 126})`}>
          <rect x={-23} y={-26} width={46} height={52} rx={5} fill="#1C2542" />
          <rect x={-23} y={-26} width={46} height={5} rx={2.5} fill="#6A78A6" />
          <circle cx={0} cy={2} r={13} fill="#0B1020" />
          <circle cx={0} cy={2} r={13} fill="none" stroke="#3B4772" strokeWidth={4} />
          <path d="M-9 -7 A13 13 0 0 1 9 -7 L0 2 Z" fill={Q.window} opacity={0.75} />
        </g>
        {/* THE BAY LAMP, on a bracket off the right stanchion and aimed into the bay. It is the
            only light in here that was ever meant to light this room, and it is over the vehicle
            because that is the only thing in here worth looking at. */}
        <g>
          <path d={`M${S.cradle.x + 116} ${S.roof + 30} V${LOAD + 4}`} stroke="#141C36"
            strokeWidth={5} />
          <path d={`M${S.cradle.x + 82} ${LOAD + 40} h68 l-17 -38 h-34 Z`} fill="#38436C" />
          <path d={`M${S.cradle.x + 82} ${LOAD + 40} h68 l-6 -12 h-56 Z`} fill="#A2AFD8" />
          <circle cx={S.cradle.x + 116} cy={LOAD + 44} r={8} fill="#F2F7FF" />
          <path d={`M${S.cradle.x + 84} ${LOAD + 44} L${S.cradle.x + 148} ${LOAD + 44}
                    L${S.cradle.x + 56} ${S.floor} L${S.cradle.x - 130} ${S.floor} Z`}
            fill="#CFE3FF" opacity={0.06} />
          <Light cx={S.cradle.x + 116} cy={LOAD + 50} r={230} color="#CFE3FF" k={0.36} />
          <Light cx={S.cradle.x - 10} cy={S.cradle.y - 40} r={250} color="#AFCCFF" k={0.26} />
        </g>

        {/* ── THE FLOOR, receding: a slab with the bay painted on it. */}
        <path d={`M${S.x0} ${S.floor} H${S.x1} L${S.x1 - 46} ${S.deck} H${S.x0 + 46} Z`}
          fill={`url(#${floor})`} />
        <rect x={S.x0} y={S.deck - 5} width={Wd} height={7} fill="#080D1C" opacity={0.8} />
        {/* the painted bay, and the scuffs of everything that has ever been wheeled out of it */}
        <g opacity={0.62}>
          <path d={`M${S.cradle.x - 150} ${S.floor - 4} H${S.cradle.x + 150}
                    L${S.cradle.x + 122} ${S.deck + 14} H${S.cradle.x - 122} Z`}
            fill="none" stroke="#C9A24B" strokeWidth={5} />
          {[-1, 1].map((sx) => (
            <path key={sx} d={`M${S.cradle.x + sx * 150} ${S.floor - 4}
                               L${S.cradle.x + sx * 112} ${S.floor - 4}`}
              stroke="#C9A24B" strokeWidth={11} />
          ))}
        </g>
        {[-1, 1].map((sx) => (
          <path key={sx} d={`M${S.cradle.x + sx * 78} ${S.deck + 20} L${S.cradle.x + sx * 96} ${S.floor}`}
            stroke="#0B1020" strokeWidth={13} opacity={0.5} strokeLinecap="round" />
        ))}
        {/* what the open front lets in: the city's cold light, across the slab and up the back */}
        <path d={`M${S.x0} ${S.floor} H${S.x1} L${S.x1 - 46} ${S.deck} H${S.x0 + 46} Z`}
          fill={`url(#${spill})`} opacity={k} />

        {/* ── THE LOADING HEAD, and under it the vehicle it loaded. */}
        <Loader y={LOAD} hot={1} t={t} />
        <ellipse cx={S.cradle.x} cy={S.floor - 12} rx={126} ry={15} fill="#02040B" opacity={0.6} />
        <Cradle x={S.cradle.x} y={S.cradle.y} />
        {/* ── THE BAY IS EMPTY, AND THAT IS THE POINT. A second courier used to stand here on the
              cradle, charging. It carried no narrative weight — the film's courier is the one
              flying outside, and a duplicate of it parked in the reveal read as a thing the viewer
              was supposed to identify and could not. What is left is a loading bay between jobs:
              the head above it, the cradle it sets a vehicle down on, and the charge lead STOWED —
              looped back onto its own drum and hooked, rather than running out to nothing. */}
        <path d={`M${S.cradle.x + 118} ${S.cradle.y - 26}
                  C ${S.cradle.x + 150} ${S.cradle.y - 52} ${S.cradle.x + 150} ${S.cradle.y - 4}
                    ${S.cradle.x + 112} ${S.cradle.y - 6}`}
          fill="none" stroke="#0D1226" strokeWidth={10} strokeLinecap="round" />
        <path d={`M${S.cradle.x + 118} ${S.cradle.y - 26}
                  C ${S.cradle.x + 150} ${S.cradle.y - 52} ${S.cradle.x + 150} ${S.cradle.y - 4}
                    ${S.cradle.x + 112} ${S.cradle.y - 6}`}
          fill="none" stroke={C.cobalt} strokeWidth={2.6} strokeLinecap="round" opacity={0.5} />
        {/* the hook it is stowed on */}
        <rect x={S.cradle.x + 104} y={S.cradle.y - 12} width={14} height={5} rx={2.5}
          fill="#2A3557" />

        {/* dust in the two beams, because an open room at night has air in it */}
        {Array.from({ length: 14 }, (_, i) => {
          const sp = 0.010 + hash01(i, 5) * 0.018;
          const yy = S.floor - ((t * sp * 240 + hash01(i, 9) * 520) % 520);
          const xx = S.x0 + 40 + hash01(i, 3) * (Wd - 80);
          return <circle key={i} cx={xx} cy={yy} r={1.4 + hash01(i, 11) * 1.5} fill="#CFE3FF"
            opacity={(0.10 + hash01(i, 13) * 0.16) * k} />;
        })}
      </g>
    );
  };

/* ══ 2 · THE DECK ════════════════════════════════════════════════════════════════════════════
   The app's screens, as the physical stack they always were. Drawn in the phone's own screen
   coordinates so the panes land exactly where the surfaces they represent have been all film.
   `lift` takes the confirmation off the top of the deck; `split` opens the gaps so the viewer can
   count them. */
export const DECK_N = 4;
/** THE FAN PIVOTS ON THE FORM, not on the top card. Closed, the deck is exactly the screen the
 *  victim is looking at. Open, the confirmation slides DOWN and forward — it is only the top card
 *  — and the form the details were typed into is the middle of the spread, with the app's two
 *  earlier screens stacked behind it. One motion exposes the subject and makes the plural
 *  ("screens") literal, and the draw order never changes, so nothing ever pops in front of
 *  anything else. */
export const deckPane = (i: number, split: number) => {
  /* the confirmation is the card being DEALT OFF: it travels a screen height while the three
     behind it spread by a header each, so one motion both makes the plural literal and clears the
     form it was covering. */
  if (i === 0) return { dy: split * 1200, s: 1 + split * 0.05, dim: 0 };
  const d = (i - 1) * (16 + split * 230);
  return { dy: -d, s: 1 - (i - 1) * split * 0.05, dim: (i - 1) * (0.05 + split * 0.14) };
};
/** where the fan puts the form's own centre, in the phone's coordinates */
export const deckFormY = SCREEN.y + SCREEN.h / 2;

export const PaneEdge: React.FC<{ x: number; y: number; w: number; h: number; k?: number }> =
  ({ x, y, w, h, k = 1 }) => (
    <g opacity={k}>
      {/* a screen with thickness: a lit top edge, a dark bottom, and a cool rim down the side */}
      <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx={10} fill="#0E1528" />
      <rect x={x - 5} y={y - 5} width={w + 10} height={5} rx={2.5} fill="#9FB2D6" opacity={0.7} />
      <rect x={x - 5} y={y + h} width={w + 10} height={5} rx={2.5} fill="#05080F" opacity={0.85} />
      <rect x={x - 5} y={y - 5} width={4} height={h + 10} fill="#63A6F5" opacity={0.28} />
    </g>
  );

/* ══ 3 · WHAT IS TAKEN ═══════════════════════════════════════════════════════════════════════
   Two tokens, and they must never be mistaken for each other: the credentials are a CARD, the
   verification code is a LETTER. Shape carries it, not colour, so the difference survives the
   greyscale check — and the film's grammar already owns both shapes. */
export const CardToken: React.FC<{ s?: number; k?: number }> = ({ s = 1, k = 1 }) => (
  <g transform={`scale(${s})`} opacity={k}>
    <rect x={-34} y={-22} width={68} height={44} rx={6} fill="#EDF2FC" />
    <rect x={-34} y={-22} width={68} height={10} rx={5} fill="#FFFFFF" />
    <rect x={-34} y={-8} width={68} height={7} fill="#2B3557" />
    <rect x={-26} y={4} width={17} height={13} rx={3} fill="#D2A63E" />
    <rect x={-26} y={8} width={17} height={2.4} fill="#8C6E22" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-4 + i * 12} y={9} width={8} height={4} rx={2} fill="#7E8CB8" />
    ))}
  </g>
);

/** the OTP, as the film has drawn every message: an envelope. `code` shows the digits once the
 *  camera is near enough to read them — at distance it is simply post. */
export const CodeToken: React.FC<{ s?: number; k?: number; code?: number }> =
  ({ s = 1, k = 1, code = 0 }) => (
    <g transform={`scale(${s})`} opacity={k}>
      <rect x={-34} y={-24} width={68} height={48} rx={3} fill="#FFFFFF" />
      <path d="M-34 -24 L0 6 L34 -24" fill="none" stroke="#6E7DAB" strokeWidth={3.4}
        strokeLinejoin="round" />
      <rect x={-34} y={17} width={68} height={7} fill="#C9D6F0" />
      {/* WHAT IS IN IT, drawn as the six boxes every OTP field in the world is drawn as. It used
          to be the digits themselves at 15px, which at the size this token is ever seen was an
          illegible smudge pretending to be information — and a code you cannot read says nothing
          that six filled boxes do not say instantly. */}
      {code > 0.01 && (
        <g opacity={code}>
          <rect x={-28} y={-15} width={56} height={22} rx={3} fill="#121B30" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-24 + i * 8.4} y={-11} width={5.6} height={14} rx={1.4}
              fill="#EFF4FF" />
          ))}
        </g>
      )}
    </g>
  );

/* ══ 4 · THE STATION ═════════════════════════════════════════════════════════════════════════
   The other end of the tunnel. It is somewhere else: its own ground, its own violet sky — the
   colour this film has given everything OUTSIDE your phone since the first frame — reached by
   following the beam, and never seen in the same frame as the city.

   It is a BUSINESS, not a lair: a hall of racks with a dish on the roof, and two more halls
   behind it, because you are one job among many. No hooded figure, no green terminal, no skull.
   The only interface anywhere on it is a mechanical lock with two slots beside it, because what
   it does is take two things it was given and turn them.

   It is built UPRIGHT. A long low shed is a landscape object and this film is 9:16 — the first
   pass put two thirds of the frame into empty sky. A tower reads at phone size, and it rhymes
   with the mast the app stood up on the roof: the two ends of the tunnel are the same shape. */
/* WHERE IT STANDS IS SOLVED, NOT CHOSEN. The app's dish was turned 46 degrees off vertical in
   round 6 and it has been aimed there ever since; the beam leaves its feed at (860, 271) on the
   bearing (sin46, -cos46). This site's receiving bowl is placed ON THAT RAY, 2400 units out — so
   the uplink is one straight line from one bowl to the other and the camera can simply fly along
   it. Move the app's dish and this has to move with it; act3 re-solves the ray from the satellite's
   own mount and asserts the two still agree. */
export const UPLINK = {
  from: { x: 860, y: 271 },
  dir: { x: Math.sin((46 * Math.PI) / 180), y: -Math.cos((46 * Math.PI) / 180) },
  len: 2400,
};
export const uplinkAt = (u: number) => ({
  x: UPLINK.from.x + UPLINK.dir.x * UPLINK.len * u,
  y: UPLINK.from.y + UPLINK.dir.y * UPLINK.len * u,
});
export const STATION = {
  ground: -426,
  hall: { x: 2456, w: 348, h: 604 },     // the near hall: windowless, ventilated, lit by nobody
  mast: { x: 2630, top: -1351 },
  dish: { x: 2586, y: -1397 },           // the bowl's centre — where the beam has to land
  edge: 2180,                            // the compound's boundary; past it there is nothing
  slotA: { x: 2352, y: -530 },           // the credentials dock here, in a CARD slot
  slotB: { x: 2352, y: -662 },           // and the code here, in a LETTER slot: a different shape
  lock: { x: 2352, y: -798 },
  tally: { x: 2352, y: -946 },   // above the lock, where the camera is when it turns
};
const S_TOP = STATION.ground - STATION.hall.h;
/** where the waveguide turns down the console's face — one number, used by the rail that is drawn
 *  and by the path act3 walks the stolen halves along, so the two can never disagree. */
export const RX_RAIL = STATION.mast.x - 160;

/** one hall. `far` pushes it into the air by COLOUR, never by alpha. */
const Hall: React.FC<{ x: number; y: number; w: number; h: number; far: number; live: number;
  t: number }> = ({ x, y, w, h, far, live, t }) => {
    const base = mix('#241D46', '#5A4E96', far * 0.62);
    const g = gid(`hall${far}`);
    const rows = Math.max(3, Math.round(h / 96));
    return (
      <g>
        <defs>
          <LinGrad id={g} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, mix(base, '#9C8EE0', 0.30)], [0.34, base], [1, mix(base, '#04030C', 0.45)]]} />
        </defs>
        {/* the block */}
        <rect x={x} y={y - h} width={w} height={h} fill={`url(#${g})`} />
        {/* the parapet and the plant deck on it: a machine hall is mostly cooling */}
        <rect x={x - 16} y={y - h - 16} width={w + 32} height={20} rx={4}
          fill={mix(base, '#B4A6F0', 0.42)} />
        <rect x={x - 16} y={y - h - 16} width={w + 32} height={6} rx={3}
          fill={mix(base, '#FFFFFF', 0.45)} />
        {[0.18, 0.5, 0.82].map((f) => (
          <g key={f}>
            <rect x={x + w * f - 34} y={y - h - 62} width={68} height={48} rx={4}
              fill={mix(base, '#FFFFFF', 0.13)} />
            <rect x={x + w * f - 28} y={y - h - 70} width={56} height={10} rx={4}
              fill={mix(base, '#FFFFFF', 0.3)} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={x + w * f - 26} y={y - h - 54 + k * 12} width={52} height={5} rx={2}
                fill={mix(base, '#05040F', 0.4)} />
            ))}
          </g>
        ))}
        {/* THE LOUVRES. The one detail that says "machines, ventilated" at any distance, and the
            only rhythm on the whole building. */}
        {Array.from({ length: rows }, (_, r) => (
          <g key={r}>
            <rect x={x + 22} y={y - h + 42 + r * ((h - 74) / rows)} width={w - 44}
              height={(h - 74) / rows - 26} rx={4} fill={mix(base, '#04030C', 0.5)} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={x + 26} y={y - h + 48 + r * ((h - 74) / rows) + k * 13} width={w - 52}
                height={6} rx={3} fill={mix(base, '#CFC2FF', 0.34 - far * 0.18)} opacity={0.8} />
            ))}
          </g>
        ))}
        {/* eaves lamps: hard, small, white, evenly spaced. Nobody decorated this. */}
        {Array.from({ length: Math.max(2, Math.round(w / 116)) }, (_, i) => {
          const lx = x + 58 + i * 116;
          if (lx > x + w - 20) return null;
          return (
            <g key={i}>
              <rect x={lx - 8} y={y - h + 14} width={16} height={8} rx={3}
                fill={mix(base, '#FFFFFF', 0.42)} />
              <circle cx={lx} cy={y - h + 26} r={4.4} fill="#EAF1FF" opacity={0.5 + live * 0.5} />
              <Light cx={lx} cy={y - h + 26} r={62} color="#DDE8FF"
                k={(0.12 + live * 0.18) * (1 - far * 0.7)} />
            </g>
          );
        })}
        {/* and the ground floor: a roller door and a bollard, so it has a scale a person fits */}
        <rect x={x + w * 0.5 - 46} y={y - 118} width={92} height={118} fill={mix(base, '#04030C', 0.55)} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={x + w * 0.5 - 46} y={y - 112 + i * 16} width={92} height={6}
            fill={mix(base, '#8E80D4', 0.22)} />
        ))}
        {live > 0.02 && (
          <circle cx={x + w * 0.5 + 74} cy={y - 132} r={5}
            fill={mix('#3A3170', '#FFD9A0', 0.5 + 0.5 * Math.sin(t * 1.1))} />
        )}
      </g>
    );
  };

/** the receiving dish, on its lattice mast, facing back down the beam it is fed by */
const RxDish: React.FC<{ x: number; y: number; foot: number; hot: number; t: number }> =
  ({ x, y, foot, hot, t }) => {
    const DR = 92, DY = 75, aim = -44;      // it looks down-left, into the beam's arrival
    const g = gid('rxdish');
    const bays = Math.max(2, Math.round((foot - y) / 58));
    return (
      <g>
        <defs>
          <LinGrad id={g} x1={0} y1={0} x2={1} y2={0.4}
            stops={[[0, '#E7ECFA'], [0.36, '#A9B3D6'], [1, '#474F78']]} />
        </defs>
        {/* the lattice: two legs, a zig-zag web, and a platform at the head */}
        <g>
          {[-1, 1].map((sx) => (
            <rect key={sx} x={x + sx * 26 - 5} y={y} width={10} height={foot - y}
              fill={sx < 0 ? '#6E62A8' : '#150F30'} />
          ))}
          {Array.from({ length: bays }, (_, i) => (
            <g key={i}>
              <path d={`M${x - 24} ${y + i * 58} L${x + 24} ${y + (i + 1) * 58}`} stroke="#4A3F82"
                strokeWidth={5} />
              <path d={`M${x + 24} ${y + i * 58} L${x - 24} ${y + (i + 1) * 58}`} stroke="#372E68"
                strokeWidth={5} />
              <rect x={x - 28} y={y + i * 58 - 3} width={56} height={6} rx={3} fill="#5A5090" />
            </g>
          ))}
          <rect x={x - 44} y={y - 8} width={88} height={14} rx={4} fill="#6A5FA8" />
          <rect x={x - 44} y={y - 8} width={88} height={4.5} rx={2} fill="#C7BAFF" opacity={0.8} />
        </g>
        {/* the waveguide down the mast: what the dish hears has to GO somewhere */}
        <path d={`M${x + 30} ${y + 10} V${foot - 30} H${x - 160}`} fill="none" stroke="#2C2358"
          strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${x + 30} ${y + 10} V${foot - 30} H${x - 160}`} fill="none" stroke="#7E6ECC"
          strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        {hot > 0.01 && [0, 1].map((k) => {
          const u = ((t * 0.55 + k * 0.5) % 1);
          const L1 = foot - 40 - y, L2 = 190, tot = L1 + L2;
          const d = u * tot;
          const px = d < L1 ? x + 30 : x + 30 - (d - L1);
          const py = d < L1 ? y + 10 + d : foot - 30;
          return <circle key={k} cx={px} cy={py} r={6} fill="#FFD0E6" opacity={hot * 0.9} />;
        })}
        <g transform={`translate(${x} ${y}) rotate(${aim})`}>
          {[-1, 1].map((sx) => (
            <path key={sx} d={`M${sx * 13} 12 L${sx * 27} -32`} stroke="#5A5090" strokeWidth={8}
              strokeLinecap="round" />
          ))}
          <rect x={-5} y={-34} width={10} height={32} fill="#6A5FA8" />
          <g transform="translate(0 -64)">
            <ellipse cx={0} cy={0} rx={DR} ry={DY} fill={`url(#${g})`} />
            <ellipse cx={0} cy={4} rx={DR - 15} ry={DY - 15} fill="#8A93BC" opacity={0.45} />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 6 + 0.26) * (DR - 9)}
                y2={Math.sin((k * Math.PI) / 6 + 0.26) * (DY - 9)} stroke="#6E7AA8" strokeWidth={3}
                opacity={0.7} />
            ))}
            <ellipse cx={0} cy={0} rx={DR} ry={DY} fill="none" stroke="#FFFFFF" strokeWidth={5.5}
              opacity={0.65} />
            {[-1, 0, 1].map((k) => (
              <line key={k} x1={k * DR * 0.62} y1={k === 0 ? DY * 0.52 : -DY * 0.34} x2={0} y2={-50}
                stroke="#C7D2EC" strokeWidth={3.2} />
            ))}
            <path d="M-12 -62 L12 -62 L7 -40 L-7 -40 Z" fill="#DCE4F6" />
            {hot > 0.01 && (
              <g opacity={hot}>
                {/* what is arriving, drawn as a wedge INTO the bowl: a receiving dish that only
                    glows is a dish that might be transmitting. This one is being fed. */}
                <path d="M-30 -66 L0 -46 L30 -66 L0 -560 Z" fill={CAP_COL.vpn} opacity={0.16} />
                <path d="M-12 -62 L0 -50 L12 -62 L0 -560 Z" fill="#FFD0E6" opacity={0.13} />
                {[0, 1, 2].map((k) => {
                  const u = 1 - ((t * 0.5 + k / 3) % 1);
                  return <circle key={k} cx={0} cy={-50 - u * 480} r={5.5 - u * 2.6} fill="#FFD0E6"
                    opacity={0.85 * (1 - u * 0.5)} />;
                })}
                <circle cx={0} cy={-51} r={11 + 5 * Math.sin(t * 6)} fill={CAP_COL.vpn} />
                <Light cx={0} cy={-51} r={190} color={CAP_COL.vpn} k={0.75} />
              </g>
            )}
          </g>
        </g>
      </g>
    );
  };

export const Station: React.FC<{ t: number; wake: number; docked: number; code: number;
  forge: number; turn: number; accept: number; hot: number }> =
  ({ t, wake, docked, code, forge, turn, accept, hot }) => {
    const S = STATION;
    const sky = gid('stnSky'), grd = gid('stnGround');
    const haze = gid('stnHaze'), hazeM = gid('stnHazeM');
    const w = ease.inOut(clamp01(wake));
    const X0 = S.edge, X1 = S.hall.x + 1700;
    return (
      <g>
        <defs>
          <LinGrad id={sky} stops={[[0, '#09071C'], [0.42, '#1E1748'], [1, '#402E72']]} />
          <LinGrad id={grd} stops={[[0, Q.plaza0], [0.35, Q.plaza1], [1, Q.plaza2]]} />
        </defs>
        {/* ── ITS OWN NIGHT. Violet: what this film calls OUTSIDE.
              IT HAS TO EMERGE, NOT BEGIN. The compound's sky and ground used to start at a hard
              left edge at x 1920 with a near-black band painted over the join to hide it — which
              hid nothing and added a vertical seam of its own, plainly visible as a colour change
              in the middle of the return. The division still has to exist, because this is a
              different place a long way from the city; it is a six-hundred-unit atmospheric blend
              now instead of a line, so it reads as distance rather than as a mistake. */}
        <defs>
          <LinGrad id={haze} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, '#FFFFFF', 0], [0.34, '#FFFFFF', 0.55], [1, '#FFFFFF', 1]]} />
          <mask id={hazeM} maskUnits="userSpaceOnUse"
            x={X0 - 700} y={S.ground - 3300} width={X1 - X0 + 700} height={5800}>
            <rect x={X0 - 700} y={S.ground - 3300} width={X1 - X0 + 700} height={5800}
              fill={`url(#${haze})`} />
          </mask>
        </defs>
        <g mask={`url(#${hazeM})`}>
          <rect x={X0 - 700} y={S.ground - 3200} width={X1 - X0 + 700} height={3400}
            fill={`url(#${sky})`} />
          <g transform={`translate(${X0} ${S.ground - 2600})`}>
            <Stars n={58} w={X1 - X0} h={2200} t={t} seed={23} k={0.45} />
          </g>
          <rect x={X0 - 700} y={S.ground} width={X1 - X0 + 700} height={2400} fill={`url(#${grd})`} />
        </g>
        <rect x={X0 - 60} y={S.ground} width={X1 - X0 + 60} height={44} fill="#000000"
          opacity={0.32} mask={`url(#${hazeM})`} />
        {/* the service road, running out of frame both ways: this is a site with deliveries */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={X0 + 140 + i * 380} y={S.ground + 196} width={150} height={7} rx={3}
            fill="#6E62A8" opacity={0.16} />
        ))}

        {/* ── THE OTHERS. Stepped back and lifted by colour, not by fading. */}
        <g transform="translate(452 -34)">
          <Hall x={S.hall.x} y={S.ground} w={S.hall.w} h={S.hall.h * 0.88} far={0.72} live={0} t={t} />
        </g>
        <g transform="translate(226 -16)">
          <Hall x={S.hall.x} y={S.ground} w={S.hall.w} h={S.hall.h * 0.94} far={0.4} live={0} t={t} />
        </g>
        <RxDish x={S.mast.x} y={S.mast.top} foot={S_TOP - 76} hot={hot} t={t} />
        <Hall x={S.hall.x} y={S.ground} w={S.hall.w} h={S.hall.h} far={0} live={w} t={t} />

        {/* ── THE CONSOLE, bolted to the near gable at head height: two slots and a lock. The
              whole interface of this operation is mechanical. */}
        <g>
          <rect x={S.slotA.x - 92} y={S.lock.y - 238} width={184} height={366} rx={10} fill="#17112F" />
          <rect x={S.slotA.x - 92} y={S.lock.y - 238} width={184} height={8} rx={4} fill="#6E62A8" />
          <rect x={S.slotA.x - 92} y={S.slotA.y + 46} width={184} height={8} rx={4} fill="#08060F" />
          <rect x={S.slotA.x - 92} y={S.slotB.y - 52} width={184} height={186} rx={10} fill="#17112F" />
          {/* THE FEED RAIL. What the bowl hears goes down the mast's waveguide, across, and then
              down THIS — the run the two stolen halves actually arrive on. Without it the ray
              ended nine hundred units above the console and the card simply appeared in its slot,
              which is the one thing the object that crosses two worlds may not do. */}
          <g>
            <path d={`M${RX_RAIL} ${S_TOP - 106} V${S.slotA.y + 34}`} stroke="#241D4A"
              strokeWidth={16} strokeLinecap="round" />
            <path d={`M${RX_RAIL} ${S_TOP - 106} V${S.slotA.y + 34}`} stroke="#4A3F82"
              strokeWidth={5} strokeLinecap="round" />
            {[S.slotA.y, S.slotB.y].map((sy) => (
              <g key={sy}>
                <rect x={S.slotA.x + 52} y={sy - 9} width={RX_RAIL - S.slotA.x - 44} height={18}
                  rx={5} fill="#241D4A" />
                <rect x={S.slotA.x + 52} y={sy - 9} width={RX_RAIL - S.slotA.x - 44} height={5}
                  rx={2.5} fill="#5A4E96" />
              </g>
            ))}
          </g>

          {/* the lock the two halves are made into one key for */}
          <g transform={`translate(${S.lock.x} ${S.lock.y})`}>
            <circle r={46} fill="#0A0718" />
            <circle r={37} fill="#241B50" />
            <g transform={`rotate(${turn * 94})`}>
              <rect x={-6} y={-29} width={12} height={41} rx={4}
                fill={mix('#6A5FA8', C.red, forge)} />
              <circle cy={17} r={12} fill={mix('#6A5FA8', C.red, forge)} />
              <rect x={-2} y={-24} width={9} height={5} fill="#0A0718" />
            </g>
            <circle r={46} fill="none" stroke="#3A3170" strokeWidth={4} />
            {accept > 0.01 && (
              <g opacity={accept}>
                <circle r={54} fill="none" stroke={P.green} strokeWidth={5} />
                <Light cx={0} cy={0} r={170} color={P.green} k={0.55} />
              </g>
            )}
          </g>
          {/* slot B — the code. A LETTER slot: long and thin, the shape of an envelope. */}
          <g>
            <rect x={S.slotB.x - 62} y={S.slotB.y - 34} width={124} height={68} rx={6} fill="#0A0718" />
            <rect x={S.slotB.x - 52} y={S.slotB.y - 24} width={104} height={7} rx={3} fill="#2B2358" />
            {code > 0.01 && (
              <g opacity={code} transform={`translate(${S.slotB.x} ${S.slotB.y + 6}) scale(0.92)`}>
                <CodeToken code={1} />
              </g>
            )}
            <circle cx={S.slotB.x - 78} cy={S.slotB.y} r={7} fill={code > 0.5 ? P.green : '#3A3170'} />
          </g>
          {/* slot A — the credentials. A CARD slot: the shape of a card, so the two can never be
              confused with each other, and the difference survives greyscale. */}
          <g>
            <rect x={S.slotA.x - 62} y={S.slotA.y - 34} width={124} height={68} rx={6} fill="#0A0718" />
            <rect x={S.slotA.x - 44} y={S.slotA.y - 24} width={88} height={9} rx={4} fill="#2B2358" />
            {docked > 0.01 && (
              <g opacity={docked} transform={`translate(${S.slotA.x} ${S.slotA.y + 6}) scale(0.92)`}>
                <CardToken />
              </g>
            )}
            <circle cx={S.slotA.x - 78} cy={S.slotA.y} r={7} fill={docked > 0.5 ? P.green : '#3A3170'} />
          </g>
        </g>

        {/* ── THE FENCE. Cheap, industrial, and it makes the halls a SITE rather than a skyline. */}
        <g>
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={X0 + 60 + i * 96} y={S.ground - 128} width={8} height={130}
              fill="#1A1338" />
          ))}
          {[0, 1, 2].map((r) => (
            <rect key={r} x={X0 + 56} y={S.ground - 124 + r * 54} width={X1 - X0 - 100} height={5}
              fill="#2B2358" />
          ))}
          {Array.from({ length: 56 }, (_, i) => (
            <g key={i}>
              <path d={`M${X0 + 60 + i * 38} ${S.ground - 128} l38 128`} stroke="#241D4A"
                strokeWidth={1.8} opacity={0.8} />
              <path d={`M${X0 + 60 + i * 38} ${S.ground} l38 -128`} stroke="#241D4A"
                strokeWidth={1.8} opacity={0.8} />
            </g>
          ))}
          {/* the corner post: a site has a boundary, and past it there is nothing */}
          <rect x={X0 + 52} y={S.ground - 154} width={17} height={156} fill="#2B2358" />
          <rect x={X0 + 52} y={S.ground - 154} width={5} height={156} fill="#6E62A8" opacity={0.7} />
        </g>
        {/* the one warm light on the site: the same bulb, over the same kind of door, as the
            crate had. Somebody works here; it is a job. */}
        <g>
          <circle cx={S.hall.x + S.hall.w * 0.5 + 74} cy={S.ground - 150} r={7}
            fill={mix(Q.window, '#FFFFFF', 0.4)} />
          <Light cx={S.hall.x + S.hall.w * 0.5 + 74} cy={S.ground - 150} r={170} color={Q.glowIn}
            k={0.32} />
        </g>
      </g>
    );
  };

/* the tally the site keeps. It is not a money counter and it does not explode: it is a job queue
   that goes up by one, which is the restrained version of "unauthorised transactions". */
export const Tally: React.FC<{ x: number; y: number; n: number; k: number }> = ({ x, y, n, k }) => (
  <g opacity={k}>
    <rect x={x - 62} y={y - 26} width={124} height={52} rx={6} fill="#0A0718" />
    <rect x={x - 62} y={y - 26} width={124} height={5} rx={2.5} fill="#4A3F82" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={x - 52 + i * 27} y={y - 17} width={22} height={34} rx={3} fill="#1B1438" />
        <text x={x - 41 + i * 27} y={y + 9} fontFamily="ui-monospace, Menlo, monospace" fontSize={23}
          fontWeight={800} fill="#D9CCFF" textAnchor="middle">
          {String(Math.floor(n / Math.pow(10, 3 - i)) % 10)}
        </text>
      </g>
    ))}
  </g>
);

/* ── the falling rate for anything the machine pulls down out of the glass. It is a DRAW, not a
   drop: the thing is being taken, so it accelerates the whole way instead of settling. */
export const drawn = (u: number) => ease.in(clamp01(u));

export const SCREEN_TOP = SCREEN.y + STATUS_H + 104;
export const deckHome = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };
export const shellCentre = { x: (SHELL.x0 + SHELL.x1) / 2, y: (SHELL.roof + SHELL.floor) / 2 };
export const fieldAt = (row: 0 | 1 | 2) =>
  [{ x: SCREEN.x + 26 + 120, y: SCREEN_TOP + 174 },
    { x: SCREEN.x + 26 + 96, y: SCREEN_TOP + 290 },
    { x: SCREEN.x + 26 + 150, y: SCREEN_TOP + 406 }][row];

export const _unused = { hash01, lerp, st, RadGrad };
