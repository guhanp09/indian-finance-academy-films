/* ACT 4 — THE ONE THING THE FILM RECOMMENDS.
 *
 * "verify it yourself through the official e-Challan portal or your state traffic police website"
 *
 * Every other building in this film stands in the court, which is inside the phone. This one does
 * not: it stands on the PLAZA, on the public side of the boundary wall, which is where this film
 * has put everything that is not yours since its first frame. That is the whole sentence, drawn as
 * geography — the fake office was delivered in a box and erected inside your wall, and this one has
 * been standing out here the entire time. You go to it. It does not come to you.
 *
 * SO IT MUST NEVER BE MISTAKEN FOR THE OTHER ONE. Every borrowed thing the fake office used is
 * absent, and the absences are the design:
 *
 *     the fake office                       this one
 *     ────────────────────────────────────  ───────────────────────────────────────────
 *     a colonnade and a pediment            a flat parapet, a flag and a public clock
 *     a medallion that is a camera lens     a lettered board you can actually read
 *     a mast, a dish and a hoist on its roof nothing on the roof but sky
 *     cool white stone and cobalt           warm limestone
 *     a front that SANK to show a machine   shutters that ROLL UP to show a counter
 *
 * The last line is the act's rhyme and the only reason the shutters exist: the same axis, the
 * opposite direction, and the opposite thing behind it.
 */
import React from 'react';
import { clamp01, ease, lerp, mix } from '../design';
import { F, Q } from './fortress';
import { LinGrad, Light, gid } from './style';

/** WHERE IT STANDS. On the plaza, west of the store gate and clear of it — the gate's jamb is at
 *  x 60 and the conveyor's chevrons converge on x 170, so this plot ends at 20 and touches
 *  neither (rule: two layout tables drift). Its base is 30 units in FRONT of the wall's foot, which
 *  is what puts it on the public side of the wall rather than behind it. */
export const CIVIC = {
  x: -230, w: 520,
  base: F.ground + 30,          // 1270 — standing on the pavement, in front of the wall's foot
  top: 560,                     // its parapet clears the wall's cap by 260
  bay: [-152, 152],             // the two counters the sentence names, left and right
  door: 0,                      // the way in, between them
} as const;
const CX0 = CIVIC.x - CIVIC.w / 2, CX1 = CIVIC.x + CIVIC.w / 2;
const FASCIA = 1086;            // the underside of the board band
const SILL = 1156;              // the doorway's head
const STONE = '#C9C2B4', STONE_D = '#8E887C', STONE_DD = '#5C574E';

/** THE SERVING WINDOW, as ONE table — because act 4 lays a document on this sill, a lamp in this
 *  soffit reads it and a slip comes back out of this slot, and a paper drawn from one set of
 *  numbers and a fitting drawn from another will drift apart (rule: two layout tables drift).
 *
 *  The first cut put the head at 1152, which left a 92-unit opening with a 74-unit notice standing
 *  in it: the paper filled the window, the lamp that was supposed to be reading it was BEHIND it,
 *  and the horizontal fittings that were left visible read as a chest of drawers rather than as a
 *  counter. The head is now 40 units higher and the interior is cleared down the middle, so the
 *  document is framed by lit window on all four sides and the thing lighting it is above it. */
export const BAY = {
  w: 176,
  top: 1112,                    // the head of the opening
  bot: CIVIC.base - 26,         // 1244 — its cill course
  sill: CIVIC.base - 70,        // 1200 — the top of the projecting sill: where paper is laid
  lamp: 1112 + 22,              // 1134 — the underside of the reader's lens, over that sill
  slot: CIVIC.base - 57,        // 1213 — the delivery slot in the face of the sill
  slotW: 176,                   // WIDER than the slip that comes out of it, so the slot stays
                                //        visible either side of it and the slip has a source
} as const;

/** one counter: a roller shutter that goes UP, and a lit counter behind it.
 *  `open` 0 = shut, 1 = rolled fully into its box. */
const Counter: React.FC<{ cx: number; open: number; t: number; a: string; b: string;
  read?: number }> =
  ({ cx, open, t, a, b, read = 0 }) => {
    const W = BAY.w, X = cx - W / 2, TOP = BAY.top, BOT = BAY.bot;
    const k = ease.inOut(clamp01(open));
    const gl = gid(`civGlass${a}`);
    return (
      <g>
        <defs>
          <LinGrad id={gl} stops={[[0, mix(Q.glowIn, '#FFF3DC', 0.55)], [1, mix(Q.glowIn, '#8A5A22', 0.35)]]} />
        </defs>
        {/* the reveal the shutter runs in: this wall has thickness */}
        <rect x={X - 9} y={TOP - 9} width={W + 18} height={BOT - TOP + 9} fill={STONE_DD} />
        <rect x={X - 9} y={TOP - 9} width={W + 18} height={7} fill={STONE_D} />
        {/* what is behind it: a lit counter, a shelf, and the two things on every real one */}
        <rect x={X} y={TOP} width={W} height={BOT - TOP} fill="#171A28" />
        <g opacity={k}>
          {/* THE ROOM BEHIND IT. The first cut of this was a flat brown rectangle with two pale
              bars floating in it, which at full size read as a hole rather than as a place where a
              person serves you. It has a back wall, a lit soffit with the reader in it, a shelf
              either side of the serving light, and — the thing that actually makes it a counter —
              a SILL that projects out of the wall, with something lying on it. */}
          <rect x={X} y={TOP} width={W} height={BOT - TOP} fill={`url(#${gl})`} opacity={0.62} />
          <rect x={X + 14} y={TOP + 30} width={W - 28} height={BOT - TOP - 88} rx={3}
            fill="#2A2317" opacity={0.5} />
          {/* THE READER, in the soffit over the counter — a housing and a lens under it, directly
              above the place a document is laid. The last sentence of this film is lit by this
              fitting, so it is a thing you can point at, not a glow with no source; and when it is
              working it goes over to the portal's own colour, which is the one colour in this film
              that has meant "the state's system" since act 1. */}
          <rect x={X + 8} y={TOP + 2} width={W - 16} height={20} rx={4} fill="#241E12" />
          <rect x={X + 12} y={TOP + 5} width={W - 24} height={5} rx={2.5} fill="#3A3324" />
          <rect x={cx - 58} y={TOP + 14} width={116} height={8} rx={4}
            fill={mix(mix(Q.glowIn, '#FFFFFF', 0.72), Q.field, read)} />
          <Light cx={cx} cy={TOP + 28} r={150} color={mix(Q.glowIn, Q.field, read)}
            k={0.5 + 0.3 * read} />
          {/* the shelf across the back and the forms on it — drawn EITHER SIDE of the serving
              light, so the middle of the window stays clear for what is handed in at it */}
          {[[X + 14, cx - 54], [cx + 54, X + W - 14]].map(([x0, x1], i) => (
            <g key={i}>
              <rect x={x0} y={BOT - 96} width={x1 - x0} height={7} rx={2}
                fill={mix(STONE, '#7A6A4A', 0.5)} />
              <rect x={x0 + 5} y={BOT - 112} width={22} height={16} rx={2}
                fill={mix('#EFF2F8', Q.glowIn, 0.22)} />
            </g>
          ))}
          {/* THE SILL. It projects out of the wall, it catches the light from above, and it is the
              one line that turns an opening into a counter. */}
          <rect x={X - 12} y={BOT - 44} width={W + 24} height={17} rx={3}
            fill={mix(STONE, '#FFFFFF', 0.30)} />
          <rect x={X - 12} y={BOT - 44} width={W + 24} height={5} rx={2.5} fill="#FFFFFF"
            opacity={0.55} />
          <rect x={X - 12} y={BOT - 28} width={W + 24} height={9} rx={2} fill={STONE_DD} />
          {/* THE DELIVERY SLOT, cut in the FACE of the sill — where the portal's answer comes back
              out. A slip that rises from a slot has somewhere to have come from; one that fades up
              in mid-air has not. */}
          <rect x={cx - BAY.slotW / 2 - 5} y={BAY.slot - 4} width={BAY.slotW + 10} height={17}
            rx={4} fill={STONE_DD} />
          <rect x={cx - BAY.slotW / 2} y={BAY.slot} width={BAY.slotW} height={9} rx={4}
            fill="#120F0C" />
          <rect x={cx - BAY.slotW / 2} y={BAY.slot} width={BAY.slotW} height={3} rx={1.5}
            fill="#000000" opacity={0.55} />
          {/* and what is lying on the sill beside it: a docket, and the queue ticket */}
          <rect x={cx - 84} y={BOT - 56} width={30} height={13} rx={2} fill="#F4F6FB" />
          <rect x={cx - 80} y={BOT - 52} width={20} height={3} fill="#8E887C" />
          <rect x={cx + 56} y={BOT - 54} width={20} height={11} rx={2}
            fill={mix('#F4F6FB', Q.glowIn, 0.3)} />
        </g>
        {/* THE SHUTTER, rolling UP into its box. The fake office's front went DOWN into its plinth
            to uncover a machine; this goes the other way and uncovers a counter. */}
        <g>
          <rect x={X} y={TOP} width={W} height={(BOT - TOP) * (1 - k)} fill="#39424F" />
          {Array.from({ length: 13 }, (_, i) => {
            const yy = TOP + 7 + i * 15;
            if (yy > TOP + (BOT - TOP) * (1 - k) - 5) return null;
            return (
              <g key={i}>
                <rect x={X} y={yy} width={W} height={7} fill="#4E5868" />
                <rect x={X} y={yy} width={W} height={2.4} fill="#7C8798" />
              </g>
            );
          })}
          {/* its bottom rail, which is the edge that actually moves */}
          <rect x={X - 4} y={TOP + (BOT - TOP) * (1 - k) - 9} width={W + 8} height={11} rx={2}
            fill="#5E6A7C" />
          <rect x={X - 4} y={TOP + (BOT - TOP) * (1 - k) - 9} width={W + 8} height={3.4} rx={1.7}
            fill="#9AA6B8" />
          {/* the box it rolls into, above the opening */}
          <rect x={X - 11} y={TOP - 30} width={W + 22} height={24} rx={4} fill="#2C3440" />
          <rect x={X - 11} y={TOP - 30} width={W + 22} height={6} rx={3} fill="#5E6A7C" />
        </g>
        {/* THE BOARD. The one place this film spends type is the one place the viewer is being
            given an address to go to, and it is sized to be read in the hand
            (rule: type is read on a phone): 28 units is 42px at this act's framing. */}
        <g>
          <rect x={X - 13} y={FASCIA - 74} width={W + 26} height={66} rx={4} fill="#20262F" />
          <rect x={X - 13} y={FASCIA - 74} width={W + 26} height={5} rx={2.5} fill={STONE_D} />
          <text x={cx} y={FASCIA - 44} fontFamily="Inter, system-ui, sans-serif" fontSize={27}
            fontWeight={800} fill="#F2EFE6" textAnchor="middle" letterSpacing={0.6}>{a}</text>
          <text x={cx} y={FASCIA - 16} fontFamily="Inter, system-ui, sans-serif" fontSize={27}
            fontWeight={800} fill="#F2EFE6" textAnchor="middle" letterSpacing={0.6}>{b}</text>
          {k > 0.02 && <Light cx={cx} cy={FASCIA - 40} r={118} color={Q.glowIn} k={0.2 * k} />}
        </g>
      </g>
    );
  };

/** THE REAL OFFICE. `open` rolls the two counters up in turn; `spill` lays their light across the
 *  pavement toward the gate the viewer is supposed to leave by. */
export const Civic: React.FC<{ t: number; left?: number; right?: number; spill?: number;
  read?: number }> =
  ({ t, left = 0, right = 0, spill = 0, read = 0 }) => {
    const g = gid('civicFace'), sp = gid('civicSpill');
    const flag = Math.sin(t * 1.4), flag2 = Math.sin(t * 1.4 + 1.1);
    const lit = Math.max(left, right);
    return (
      <g>
        <defs>
          <LinGrad id={g} x1={0} y1={0} x2={1} y2={0}
            stops={[[0, mix(STONE, '#FFFFFF', 0.10)], [0.42, STONE], [1, STONE_D]]} />
          <LinGrad id={sp} stops={[[0, Q.glowIn, 0.34], [1, Q.glowIn, 0]]} />
        </defs>

        {/* ── the light it throws across the pavement, toward the gate you came out of */}
        {spill > 0.01 && (
          <g opacity={ease.out(clamp01(spill))}>
            <path d={`M${CX0 + 24} ${CIVIC.base} H${CX1 - 24} L${CX1 + 250} 1900 H${CX0 - 250} Z`}
              fill={`url(#${sp})`} />
          </g>
        )}

        {/* ── THE BLOCK. Flat, plain, and standing on the ground it was built on. */}
        <rect x={CX0} y={CIVIC.top} width={CIVIC.w} height={CIVIC.base - CIVIC.top}
          fill={`url(#${g})`} />
        {/* its own shadow on the pavement, so it is ON the plaza and not floating over it */}
        <rect x={CX0 - 14} y={CIVIC.base} width={CIVIC.w + 28} height={20} fill="#000000" opacity={0.34} />
        {/* THE EMPHASIS IS HORIZONTAL, and that is the point: the fake office borrowed its
            authority from a colonnade, which is five strong verticals. This one has none. It has
            string courses, a deep cornice shadow and a darker base course — a working building,
            read across rather than up. */}
        <rect x={CX0} y={CIVIC.top + 4} width={CIVIC.w} height={26} fill={STONE_DD} opacity={0.42} />
        <rect x={CX0} y={FASCIA - 120} width={CIVIC.w} height={CIVIC.base - FASCIA + 120}
          fill={STONE_DD} opacity={0.20} />
        {[CIVIC.top + 92, CIVIC.top + 214, CIVIC.top + 336, FASCIA - 92].map((y) => (
          <g key={y}>
            <rect x={CX0 - 8} y={y} width={CIVIC.w + 16} height={13} fill={mix(STONE, '#FFFFFF', 0.18)} />
            <rect x={CX0 - 8} y={y + 10} width={CIVIC.w + 16} height={6} fill={STONE_DD} opacity={0.72} />
          </g>
        ))}
        {/* ── THE WINDOWS. A plain grid, nothing in front of them, and you can count them — which
              is exactly what you could not do on the other building. */}
        {[0, 1].map((r) => (
          <g key={r}>
            {[-196, -98, 0, 98, 196].map((wx) => {
              const wy = CIVIC.top + 122 + r * 122;
              return (
                <g key={wx}>
                  <rect x={CIVIC.x + wx - 25} y={wy} width={50} height={72} rx={3} fill={STONE_DD} />
                  <rect x={CIVIC.x + wx - 20} y={wy + 5} width={40} height={62} rx={2} fill="#232838" />
                  <rect x={CIVIC.x + wx - 20} y={wy + 5} width={40} height={62} rx={2}
                    fill={mix(Q.glowIn, '#2A2438', 0.55)} opacity={0.55 + 0.35 * lit} />
                  <rect x={CIVIC.x + wx - 20} y={wy + 5} width={40} height={26} rx={2}
                    fill={mix(Q.glowIn, '#FFE9C4', 0.4)} opacity={0.30 + 0.3 * lit} />
                  <rect x={CIVIC.x + wx - 20} y={wy + 33} width={40} height={3} fill="#232838" />
                  <rect x={CIVIC.x + wx - 25} y={wy} width={50} height={5} rx={2} fill={STONE} />
                  <rect x={CIVIC.x + wx - 30} y={wy + 70} width={60} height={9} rx={2}
                    fill={mix(STONE, '#FFFFFF', 0.3)} />
                  <rect x={CIVIC.x + wx - 30} y={wy + 79} width={60} height={5} rx={2}
                    fill={STONE_DD} opacity={0.55} />
                </g>
              );
            })}
          </g>
        ))}
        {/* ── THE PARAPET, and the two things on it the other building never had. */}
        <rect x={CX0 - 16} y={CIVIC.top - 20} width={CIVIC.w + 32} height={24} rx={3} fill={STONE} />
        <rect x={CX0 - 16} y={CIVIC.top - 20} width={CIVIC.w + 32} height={6} rx={3}
          fill={mix(STONE, '#FFFFFF', 0.4)} />
        <rect x={CX0 - 8} y={CIVIC.top + 4} width={CIVIC.w + 16} height={7} fill={STONE_DD} opacity={0.6} />
        {/* the flagpole: a plain civic pennant, no emblem, and it moves because there is weather */}
        <g>
          <rect x={CX0 + 42} y={CIVIC.top - 168} width={7} height={150} fill={STONE_D} />
          <circle cx={CX0 + 45.5} cy={CIVIC.top - 172} r={6} fill={mix(STONE, '#FFFFFF', 0.5)} />
          <path d={`M${CX0 + 49} ${CIVIC.top - 162}
                    q28 ${4 + flag * 5} 56 ${flag2 * 6} l0 40 q-28 ${-flag2 * 6} -56 ${-flag * 5} Z`}
            fill={mix(Q.glowIn, '#C05A3A', 0.45)} />
        </g>
        {/* the public clock, reading what the phone read: 10:43 */}
        <g transform={`translate(${CIVIC.x + 148} ${CIVIC.top - 62})`}>
          <rect x={-7} y={38} width={14} height={26} fill={STONE_D} />
          <circle r={38} fill={STONE_DD} />
          <circle r={32} fill="#EFF2F8" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-1.6} y={-30} width={3.2} height={7} rx={1.6} fill="#5C574E"
              transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-2.6} y={-19} width={5.2} height={21} rx={2.6} fill="#2B2F3C"
            transform="rotate(-38)" />
          <rect x={-2} y={-26} width={4} height={28} rx={2} fill="#2B2F3C" transform="rotate(258)" />
          <rect x={-1.3} y={-29} width={2.6} height={33} rx={1.3} fill="#5C574E"
            transform={`rotate(${(Math.floor(t * 1) % 60) * 6})`} />
          <circle r={3.4} fill="#2B2F3C" />
        </g>

        {/* ── THE GROUND FLOOR: two counters and the way in between them. */}
        <rect x={CX0} y={FASCIA} width={CIVIC.w} height={CIVIC.base - FASCIA} fill={STONE_D} />
        <rect x={CX0} y={FASCIA} width={CIVIC.w} height={8} fill={mix(STONE, '#FFFFFF', 0.3)} />
        {/* the doorway: open, with a step up to it and a handrail */}
        {(() => {
          const dx = CIVIC.x + CIVIC.door, DW = 82, DY = SILL - 44;
          return (
            <g>
              <rect x={dx - DW / 2 - 10} y={DY - 10} width={DW + 20} height={CIVIC.base - DY + 10}
                rx={4} fill={STONE_DD} />
              <rect x={dx - DW / 2} y={DY} width={DW} height={CIVIC.base - DY} fill="#171A28" />
              {/* a lobby, not a dark slot: a back wall with a counter across it and a lamp over it.
                  The fake office's portal was the same idea — a lit room with a door ajar — and this
                  is the honest version of it. */}
              <rect x={dx - DW / 2} y={DY} width={DW} height={CIVIC.base - DY}
                fill={mix(Q.glowIn, '#4A3316', 0.34)} opacity={0.45 + 0.5 * lit} />
              <rect x={dx - DW / 2 + 8} y={DY + 30} width={DW - 16} height={9} rx={4}
                fill={mix(Q.glowIn, '#FFFFFF', 0.7)} opacity={0.55 + 0.45 * lit} />
              <rect x={dx - DW / 2 + 6} y={CIVIC.base - 96} width={DW - 12} height={13} rx={3}
                fill={mix(STONE, '#FFFFFF', 0.2)} opacity={0.5 + 0.5 * lit} />
              <rect x={dx - DW / 2 + 6} y={CIVIC.base - 83} width={DW - 12} height={9}
                fill={STONE_DD} opacity={0.6 + 0.4 * lit} />
              {lit > 0.02 && <Light cx={dx} cy={CIVIC.base - 90} r={190} color={Q.glowIn} k={0.42 * lit} />}
              {/* one leaf, standing open against the jamb — the same door act 2's lobby had */}
              <path d={`M${dx - DW / 2} ${DY} L${dx - DW / 2 + 22} ${DY + 14}
                        L${dx - DW / 2 + 22} ${CIVIC.base - 12} L${dx - DW / 2} ${CIVIC.base} Z`}
                fill={STONE_D} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={dx - DW / 2 - 18 - i * 9} y={CIVIC.base - 8 + i * 9}
                  width={DW + 36 + i * 18} height={10} rx={2}
                  fill={i % 2 ? mix(STONE, '#FFFFFF', 0.24) : STONE} />
              ))}
            </g>
          );
        })()}
        <Counter cx={CIVIC.x + CIVIC.bay[0]} open={left} t={t} a="e-CHALLAN" b="PORTAL"
          read={read} />
        <Counter cx={CIVIC.x + CIVIC.bay[1]} open={right} t={t} a="TRAFFIC" b="POLICE" />
        {/* the kerb, and the bollards on it. A building is only standing on a street if the street
            is drawn under it. */}
        <g>
          <rect x={CX0 - 210} y={CIVIC.base + 96} width={CIVIC.w + 420} height={11} rx={3}
            fill={mix(STONE_DD, '#FFFFFF', 0.22)} opacity={0.45} />
          <rect x={CX0 - 210} y={CIVIC.base + 107} width={CIVIC.w + 420} height={7}
            fill="#0F0B22" opacity={0.5} />
          {[CIVIC.x - 270, CIVIC.x + 270].map((bx) => (
            <g key={bx}>
              <rect x={bx - 9} y={CIVIC.base + 52} width={18} height={50} rx={6} fill={STONE_DD} />
              <rect x={bx - 9} y={CIVIC.base + 52} width={6} height={50} rx={3} fill={STONE_D} />
            </g>
          ))}
        </g>
        {/* the queue rail on the pavement: this is a place people stand in line at */}
        <g>
          {[CX0 + 40, CX1 - 40].map((px) => (
            <g key={px}>
              <rect x={px - 5} y={CIVIC.base + 22} width={10} height={54} rx={3} fill={STONE_DD} />
              <rect x={px - 5} y={CIVIC.base + 22} width={3.4} height={54} fill={STONE_D} />
            </g>
          ))}
          <rect x={CX0 + 36} y={CIVIC.base + 26} width={CIVIC.w - 72} height={7} rx={3.5}
            fill={mix(STONE_D, '#FFFFFF', 0.2)} />
        </g>
      </g>
    );
  };

export const _civic = { lerp };
