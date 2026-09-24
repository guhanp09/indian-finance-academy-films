/* THE OPENING, OVERHAULED — 0.0 to 31.4 s, one continuous camera.
 *
 * The first pass held a phone in the middle of a flat road for thirty seconds and drew Android as
 * two UI sheets. This pass builds a WORLD and moves through it:
 *
 *   0.0   the phone, in a hand, against the night sky. The message streaks in over the city.
 *   5.2   PULL BACK and tilt down: the person, beside their own car. The plate lifts off the
 *         notice and lands on the car's plate — they know my car. Push back in; ₹1,000 is stamped.
 *   9.2   the attachment slides out and becomes what it is: a PARCEL, with an app inside.
 *  13.4   the finger taps it. We DIVE through the glass into the phone.
 *  14.5   inside, the phone is a walled city. The store is its one gate. The parcel arrives at the
 *         wall by the messenger's courier and is stopped DEAD; the shield slams onto the wall.
 *  20.4   the user's fingertip comes down through the glass, knocks the warning aside, and presses
 *         the switch; a section of the wall sinks into the ground. A door has been cut.
 *  23.6   the parcel goes through, and an official-looking office erects itself in the city.
 *  25.6   PULL OUT: the city's rooftop signs lift into a grid — the city IS the home screen — and
 *         the office's sign lands as the new app. It opens into the fake e-Challan service.
 *
 * Every event sits on the word that names it (timeline.ts). Every tap is a CONTACT between two
 * points in one coordinate system, and CONTACTS below is what tools/echallan/taps.mjs proves.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, SCREEN, STATUS_H, W, band, clamp01, ease, hash01, impact, lerp, mix, win, winOut,
} from '../design';
import { B } from '../timeline';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import {
  ApkTile, Bubble, CHALLAN_H, ChallanDoc, ChatFurniture, ChatHeader, NumberPlate,
} from '../world/chat';
import { AppIcon } from '../world/system';
import { EchallanApp } from '../world/screens';
import { Hand } from '../world/hand';
import { City, Streetlight } from './city';
import { CarRear, MessageComet, Person } from './cast';
import { APPS, Parcel, Symbol } from './inside';
import {
  Box3, City3, DRONE_G, Drone, F, NEAR3, Office3, PLOT3, PlayGate, Plaza, Shield3, Sky3, StoreQueue, Wall3,
  WallState, officeSealAt, sign3At,
} from './fortress';
import { Light, P } from './style';
import { makeTrack, register } from './track';
import type { FK } from './track';

/* ── THE CLOCK: every moment below is a measured word ──────────────────────────────────────*/
export const T = {
  launch: B(1), land: B(3), plate: B(7), amount: B(8),
  pullBack: B(11), plateMatch: B(13), pushIn: B(14), stamp: B(16),
  tileSlide: B(17), pkg: B(19), name: B(20), nameDone: B(21) + 0.6, pop: B(21) + 0.75,
  tap: B(23), dive: B(23) + 0.2, inside: B(24) + 0.55,
  courier: B(24) + 0.1, hit: B(29), fromOutside: B(33), play: B(35), warnEnd: B(36),
  overlook: B(37), brush: B(39), press: B(42), open: B(43), mark: B(43) + 0.2,
  through: B(45), office: B(46) + 0.35, pullOut: B(47), newIcon: B(49), opens: B(51),
  end: B(56),
} as const;

/* ── GEOMETRY ──────────────────────────────────────────────────────────────────────────────*/
const LC = { x: LAYOUT.phone.x + LAYOUT.phone.w / 2, y: SCREEN.y + SCREEN.h / 2 };  // (540, 842)
const PH = LAYOUT.phone;
/* the wide shot: where the person stands and where the phone sits in their hand */
const PERSON = { x: 290, y: 1660, s: 1.12 };
const CAR = { x: 720, y: 1640, s: 1.42 };
const PWC = { x: 336, y: 1190 };                  // phone centre, in the wide world
const PS = 0.075;                                 // phone scale, in the wide world
const CAR_PLATE = { x: CAR.x, y: CAR.y - 103 * CAR.s, w: 184 * CAR.s };
/* the chat: bubble, notice, tile — the same numbers the chat components are drawn with */
const BX = SCREEN.x + 16, BW = SCREEN.w - 64;
const BH = 16 + CHALLAN_H + 12 + 96 + 34;
const BY = SCREEN.y + SCREEN.h - 118 - BH;
const TILE = { x: BX + 16, y: BY + 16 + CHALLAN_H + 12, w: BW - 32, h: 96 };
const DOC = { x: BX + 16, y: BY + 16, w: BW - 32 };
/* the interior is drawn INSIDE the screen: q (1080x1920) -> screen coordinates */
const K = SCREEN.w / 1080;
const q2s = (qx: number, qy: number) => ({ x: SCREEN.x + qx * K, y: LC.y + (qy - 960) * K });
const Z_IN = 1 / K;                               // the dive zoom at which q maps 1:1 to the frame

/* ── THE CAMERA ────────────────────────────────────────────────────────────────────────────
   Two moves, both anchored to words. `uw` is the pull-back to the wide street; `dz` is the dive
   through the glass. The foreground, the street and the sky each take a different share of the
   move — that is what makes it a camera and not a zoom. */
export function cam(t: number) {
  const out = win(t, T.pullBack, T.pullBack + 1.35);
  const back = win(t, T.pushIn, T.pushIn + 0.9);
  const uw = ease.inOut(clamp01(out - back));
  const din = win(t, T.dive, T.dive + 1.75);
  const dout = win(t, T.pullOut, T.pullOut + 1.05);
  const dz = ease.inOut(clamp01(din - dout));
  return { uw, dz };
}

/* ── THE FOCUS CAMERA ──────────────────────────────────────────────────────────────────────
   On top of the two structural moves, the camera POINTS: at each beat it leans onto the thing the
   narration is naming, and eases back when the next thing needs room. Each key is (time, the
   frame point to centre, zoom). It never shakes and never zooms for its own sake — every key
   below is a word. */
const FOCUS: FK[] = [
  /* ── THE PHONE STAYS IN THE MIDDLE OF THE FRAME. ───────────────────────────────────────────
     This is the law for every shot in the film whose subject is the phone, and it is the thing
     that was actually wrong with the opening — not the number of keys.
     At z 1.30 a 560-unit phone is 728 px of a 1080-px frame. There are 176 px of slack on each
     side, so a camera that leans 85 units left to look at the number plate throws the whole slab
     185 px off centre and crops it against one edge. Six of those leans in twenty seconds is a
     phone sliding around inside the frame, and that — not the zoom — is what reads as a camera
     moving about for no reason. The plate, the fee and the filename are all INSIDE the phone, so
     the camera points at them the only way it can without losing the object that contains them:
     it descends and it tightens. `x` does not move while the phone is the subject.

     And it is ONE move. Four seconds of a static slab do not need a push, a pull and a push: the
     card lands, the fields fill and the fee stamps on their own. The camera makes a single slow
     descent from the whole phone onto the notice, and holds there for the pull-back to take. */
  [0.00, 540, 900, 1.10],         // the hook: the phone owns the frame, whole
  [B(5), 540, 1000, 1.20],        // "like"          down onto the notice as it fills in
  [B(8), 540, 1075, 1.30],        // "challan on"    and onto the fine
  [B(9) + 0.30, 540, 1075, 1.30], // "WhatsApp."     HELD — the pull-back takes it from here
  [B(11), 540, 960, 1.00],        //                 the pull-back takes over
  [B(12) + 0.3, 540, 1180, 1.00],
  [B(13) + 0.5, 560, 1300, 1.10], // "vehicle details" the plate leaves the phone for the car
  [B(14), 560, 1340, 1.10],       //                 ...and lands on it
  [B(14) + 0.35, 540, 960, 1.00], //                 the push-in takes over
  /* AND THE SAME AGAIN THROUGH THE ATTACHMENT — same law, same reason. This stretch swung the
     phone from 87 px left of centre to 83 px right of it while zooming 1.24 → 1.20 → 1.10 → 1.32
     → 1.40 → 1.26 → 1.22. It is one tilt down as the file slides out of the message, a HOLD while
     the name is typed, one push onto the name — the whole point of the line — a hold on it, and
     one release for the tap. The frame's centre line never leaves the phone's. */
  /* on the word — but never before the structural push-in has handed over, which is the key
     above. The recorded read says "vehicle details, an amount due" 36% faster than the placeholder
     did and closed a 0.59 s gap to 0.38 s; a key that is a word AND a consequence needs both. */
  [Math.max(B(16) - 0.05, B(14) + 0.48), 540, 1065, 1.24], // "due, and"  the fee is stamped
  [B(18), 540, 1130, 1.24],       // "file named"    it slides out: tilt, no zoom
  [B(19) + 0.2, 540, 1130, 1.24], //                 HELD while the name is typed
  [B(21) + 0.3, 540, 1190, 1.36], // "Challan.apk”." onto the name
  [B(21) + 0.9, 540, 1190, 1.36], //                 HELD: this is the line's one fact
  [B(23), 540, 1120, 1.24],       // "tap the"       one release, as the parcel lifts and it is tapped
  [B(23) + 0.25, 540, 960, 1.00], //                 the dive takes over
  [B(24) + 0.9, 660, 720, 1.06],  //                 the parcel falls through; the drone catches it
  [B(28), 690, 755, 1.18],        // "WhatsApp"      the source, carrying it
  [B(29), 690, 790, 1.20],        // "isn't"         the field stops it
  /* the widen-and-push-back-in that used to sit between these two ("allowed to" / "install") was
     the third change of direction inside two seconds. The refusal happens twice and it happens in
     the same place, so the camera states it once and then simply watches it happen again. */
  [B(31), 680, 830, 1.16],        // "install"       again, and stopped again
  [B(33), 470, 880, 1.16],        // "from outside"  one pan toward the store
  [B(35), 186, 900, 1.20],        // "Play"          the one sanctioned way in (the gate moved
  //                                                 80 left when the breach was widened to 340)
  /* AND ONE MORE. "but you overlook the warning and tap on Allow from this source" ran
     186 → 560 → 590 → 680 → 430 → 620 → 690 across the frame and 1.20 → 1.02 → 1.10 → 1.30 → 1.06
     in the lens: the camera crossed the wall three times to watch three things that are all within
     a few hundred units of each other. It makes the crossing ONCE, holds the door and the panel in
     the same frame, pushes onto the button that is pressed, and leaves through the doorway. */
  [B(37) + 0.4, 470, 940, 1.18],  // "you"           the door and the panel, in one frame
  [B(39), 470, 975, 1.22],        // "warning"       pushed back down
  [B(42), 430, 1030, 1.30],       // "“Allow"        the button
  [B(43) + 0.12, 455, 1022, 1.28], // "from this"    conduit → jamb bolts → the leaf drops
  [B(45), 690, 980, 1.06],        // "The"           through the doorway
  [B(46) + 0.6, 690, 820, 1.02],  // "app installs," the office unpacks out of it
  [B(47), 540, 960, 1.00],        //                 the pull-out takes over
  /* ON the word, not a third of a second into it: the recorded read gets from "on your" to
     "phone," in 0.38 s, so the old +0.3 left 0.08 s to travel 130 units and 0.18 of zoom. */
  [B(48), 540, 820, 1.08],        // "on your"       the signs become icons
  /* same law again: the icon is a detail ON the phone, so the camera goes DOWN to it and tightens
     rather than leaning 65 units left and carrying the whole slab 82 px off the middle with it */
  [B(49), 540, 690, 1.26],        // "phone,"        the new one lands
  [B(51) - 0.1, 540, 720, 1.18],  // "to"            it opens
  [B(52) + 0.4, 540, 960, 1.00],
  [B(54), 540, 1020, 1.05],       // "an e-Challan"  the service, calm
  [B(56), 540, 960, 1.00],
];
const track1 = makeTrack(register('act1', FOCUS));
export function focus(t: number) { return track1(t); }
FOCUS.forEach((k, i) => {
  if (i && k[0] < FOCUS[i - 1][0]) throw new Error(`FOCUS key ${i} runs backwards in time`);
});

/** the POV plane: the phone, in screen space */
export function pov(t: number) {
  const { uw, dz } = cam(t);
  /* the hand's position in the wide shot, as the street plane moves under it */
  /* the street arrives FAST and the phone travels on a lead, so the hand is always under it */
  const Zw = lerp(1.35, 1, uw), dy = 1250 * Math.pow(1 - uw, 3);
  const hx = (PWC.x - 540) * Zw + 540, hy = (PWC.y - 960) * Zw + 960 + dy;
  const s = Math.exp(lerp(0, Math.log(PS), uw)) * Math.exp(lerp(0, Math.log(Z_IN), dz));
  const lead = Math.sqrt(uw);
  const cx = lerp(LC.x, hx, lead);
  const cy = lerp(LC.y, hy, lead) + (960 - LC.y) * dz;
  /* a breath of push-in on the hook: the frame is taken, not held */
  const hook = 1 + (1 - win(t, 0, 1.2)) * -0.035;
  return { s: s * hook, cx, cy, uw, dz, Zw, dy };
}
const povT = (t: number) => {
  const p = pov(t);
  return `translate(${p.cx} ${p.cy}) scale(${p.s}) translate(${-LC.x} ${-LC.y})`;
};
/** a point in phone (LAYOUT) coordinates -> the frame */
const toFrame = (t: number, x: number, y: number) => {
  const p = pov(t);
  return { x: (x - LC.x) * p.s + p.cx, y: (y - LC.y) * p.s + p.cy, s: p.s };
};

/* ── WHAT THE SCREEN SHOWS ─────────────────────────────────────────────────────────────────*/
const parcelPop = (t: number) => win(t, T.pop, T.pop + 0.55);
const parcelSink = (t: number) => win(t, T.tap + 0.02, T.tap + 0.28);
/** where the parcel hovers over the tile — the tap's TARGET, in phone coordinates */
export const parcelAt = (t: number) => {
  const p = ease.out(parcelPop(t));
  /* out of the tile's glyph, up into the empty chat above the notice — nothing else is there */
  return { x: lerp(TILE.x + 58, LC.x, p), y: lerp(TILE.y + 46, SCREEN.y + 430, p), s: 0.6 + p * 0.85 };
};

const Chat: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  const land = ease.outQuint(clamp01((t - (T.land - 0.42)) / 0.42));
  const cardX = lerp(SCREEN.w + 200, 0, land);
  const cardY = lerp(-240, 0, land) + impact(f, T.land * FPS, 10, 7.4, 10);
  const header = win(t, T.land - 0.3, T.land);
  const plate = win(t, T.plate, T.plate + 0.6);
  const amount = win(t, T.amount, T.amount + 0.5);
  const slide = Math.max(win(t, B(9), B(9) + 0.5) * 0.16, win(t, T.tileSlide, T.tileSlide + 0.6));
  const name = win(t, T.name, T.nameDone);
  const pkg = win(t, T.pkg, T.pkg + 0.7);
  /* when the parcel lifts out of it, the tile's own glyph is left EMPTY — the thing left the file */
  const empty = parcelPop(t) > 0.05 || t > T.tap;
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill={C.chatBg} />
      <ChatFurniture notice={1} />
      <defs><clipPath id="v2bubble"><rect x={BX - 4} y={BY} width={BW + 8} height={BH} rx={20} /></clipPath></defs>
      {land > 0.001 && (
        <g transform={`translate(${cardX} ${cardY})`}>
          <Bubble x={BX} y={BY} w={BW} h={BH}>
            <ChallanDoc x={DOC.x} y={DOC.y} w={DOC.w} header={header} plate={plate} amount={amount}
              chip={false} />
          </Bubble>
          <g clipPath="url(#v2bubble)">
            <g transform={`translate(0 ${(1 - slide) * 90})`}>
              <ApkTile x={TILE.x} y={TILE.y} w={TILE.w} pkg={pkg} name={name}
                press={band(t, T.tap - 0.04, T.tap, T.tap + 0.08, T.tap + 0.2)} />
              {empty && <rect x={TILE.x + 20} y={TILE.y + 18} width={60} height={60} rx={8}
                fill="#D8DEEA" />}
            </g>
          </g>
          <Stamp t={t} />
        </g>
      )}
      <ChatHeader />
    </g>
  );
};

/* the fee is STAMPED: a rubber stamp comes down on the notice and leaves a mark. The mark is a
   symbol — a ring, a ₹ and a clock hand, "money, due" — not a sentence. */
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const down = win(t, T.stamp - 0.18, T.stamp);
  const up = winOut(t, T.stamp + 0.12, T.stamp + 0.55);
  const mark = win(t, T.stamp, T.stamp + 0.05);
  const sx = DOC.x + DOC.w - 84, sy = DOC.y + 250;
  const lift = (1 - down) * 260 + up * 320;
  const ink = '#5A48D6';
  return (
    <g>
      {mark > 0 && (
        <g transform={`translate(${sx} ${sy}) rotate(-12)`} opacity={0.88 * mark}>
          <circle r={62} fill="none" stroke={ink} strokeWidth={7} />
          <circle r={50} fill="none" stroke={ink} strokeWidth={2.5} strokeDasharray="6 5" />
          <text x={0} y={10} fontSize={36} fontWeight={900} textAnchor="middle" fill={ink}
            fontFamily='"Inter Tight","Inter",Arial,sans-serif'>{'₹'}</text>
          <path d="M28 -30 l0 -12 M28 -30 l9 5" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <circle cx={28} cy={-30} r={14} fill="none" stroke={ink} strokeWidth={3.5} />
        </g>
      )}
      {up < 0.999 && t > T.stamp - 0.4 && (
        <g transform={`translate(${sx} ${sy - 60 - lift})`}>
          {/* the stamp: a handle, a neck and an inked foot */}
          <ellipse cx={0} cy={-120} rx={36} ry={30} fill="#7A4A2A" />
          <rect x={-12} y={-100} width={24} height={60} fill="#9A6440" />
          <rect x={-66} y={-44} width={132} height={40} rx={8} fill="#5A3A22" />
          <rect x={-60} y={-8} width={120} height={14} rx={4} fill={ink} />
        </g>
      )}
    </g>
  );
};

/* ════ THE INTERIOR — q coordinates (1080x1920), drawn inside the screen ═══════════════════════
   Every moving thing below is a function of time built from named beats, and every one of them
   has a CAUSE on screen:
     the parcel falls through the glass (it was pushed in by the tap) → the source's drone catches
     it → carries it at the wall → the FIELD stops it (twice) → the warning is raised out of the
     field → the drone waits at the door and its presence wakes the permission panel → the user's
     hand pushes the warning back down → presses ALLOW → the pulse runs the conduit → the bolts
     withdraw → the field over that panel dies → the panel sinks → the drone carries the parcel
     through and sets it down → the parcel unpacks into the office. */
const HIT1 = T.hit, HIT2 = B(31);
const OFFICE_S = 1.15;
const CATCH = T.inside + 0.28;
const DRONE_K: [number, number, number, number][] = [
  [T.dive + 0.3, 1330, 420, 1.4],
  [CATCH - 0.12, 690, 470, 1.4],
  [CATCH + 0.45, 700, 540, 1.3],
  [HIT1 - 0.34, 690, 600, 1.02],
  [HIT1, 690, 606, 0.95],
  [HIT1 + 0.46, 760, 820, 1.25],
  [HIT2 - 0.34, 720, 760, 1.1],
  [HIT2, 690, 612, 0.96],
  [HIT2 + 0.44, 800, 880, 1.28],
  [B(36) + 0.2, 830, 900, 1.26],
  [B(37) + 0.45, 690, 880, 1.0],
  [T.through, 690, 886, 1.0],
  [T.through + 0.42, 690, 960, 0.76],
  [T.through + 0.72, 690, 1011, 0.72],
  [T.through + 0.98, 690, 900, 0.72],
  [T.pullOut - 0.1, 600, 160, 0.56],
];
const RELEASE = T.through + 0.74;
const HANG = 138 * DRONE_G;                        // tether + half the box, in world units at s=1
const kPos = (t: number) => {
  let i = 0;
  while (i < DRONE_K.length - 2 && t > DRONE_K[i + 1][0]) i++;
  const a = DRONE_K[i], b = DRONE_K[i + 1];
  const u = ease.inOut(clamp01((t - a[0]) / (b[0] - a[0])));
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u) };
};
const hitDecay = (t: number, at: number, k = 5) => (t > at ? Math.exp(-(t - at) * k) : 0);
export function droneAt(t: number) {
  const p = kPos(t);
  const bob = Math.sin(t * 5.2) * 5 + Math.sin(t * 2.3) * 3;
  /* the catch: the weight arriving on the hook pulls the drone down, and it recovers */
  const dip = t > CATCH ? Math.exp(-(t - CATCH) * 5) * Math.sin((t - CATCH) * 16) * 22 : 0;
  const dt = 1 / 60;
  const v = (tt: number) => (kPos(tt + dt).x - kPos(tt - dt).x) / (2 * dt);
  const vx = v(t), ax = (v(t) - v(t - 0.12)) / 0.12;
  const kick = hitDecay(t, HIT1) + hitDecay(t, HIT2);
  const tilt = Math.max(-24, Math.min(24, vx * 0.03)) + kick * 26;
  const swing = Math.max(-34, Math.min(34, -ax * 0.006)) - kick * 30 * Math.cos((t - HIT1) * 9);
  return { x: p.x, y: p.y + bob + dip, s: p.s, tilt, swing };
}
/** the parcel's centre in q, whichever state it is in — the object the camera and QA follow */
export function parcelQ(t: number) {
  if (t < CATCH) {
    const u = clamp01((t - (T.inside - 0.4)) / (CATCH - (T.inside - 0.4)));
    const d = droneAt(CATCH);
    /* it comes through the glass — from the camera — so it starts big and near and falls away */
    return { x: lerp(600, d.x, u), y: lerp(-320, d.y + HANG * d.s, ease.in(u)), s: lerp(2.6, d.s * DRONE_G, ease.in(u)),
      rot: (1 - u) * 160, free: true };
  }
  if (t < RELEASE) { const d = droneAt(t); return { x: d.x, y: d.y + HANG * d.s, s: d.s * DRONE_G, rot: d.swing, free: false }; }
  const d = droneAt(RELEASE);
  return { x: d.x, y: F.court - 50 * 0.72 * DRONE_G, s: 0.72 * DRONE_G, rot: 0, free: true };
}

/** the wall's whole state as a function of time */
export function wallAt(t: number): WallState {
  const f = t * FPS;
  const hit = Math.max(hitDecay(t, HIT1, 2.4), hitDecay(t, HIT2, 2.4));
  return {
    hit, hitX: F.door.cx,
    wake: win(t, B(37) + 0.3, B(37) + 0.6),
    ask: band(t, B(37) + 0.5, B(37) + 0.8, T.press - 0.1, T.press),
    press: band(t, T.press - 0.05, T.press, T.press + 0.1, T.press + 0.24),
    lit: win(t, T.press, T.press + 0.12),
    pulse: clamp01((t - (T.press + 0.04)) / 0.2),
    boltL: win(t, T.press + 0.22, T.press + 0.36),
    boltR: win(t, T.press + 0.28, T.press + 0.42),
    fieldOff: clamp01((t - (T.press + 0.36)) / 0.18),
    sink: clamp01((t - (T.press + 0.5)) / 0.62),
    /* it has done its one job, so it shutters and goes flush — it does not stand there lit */
    stow: win(t, T.press + 1.9, T.press + 2.7),
    ...(f < 0 ? {} : {}),
  };
}

/** the user's hand inside — the UPI rig, placed the UPI way: arm from beyond the right edge */
const REST_Q = { x: 1180, y: 1700 };
const SHIELD_Q = { x: F.door.cx + 58, y: F.wallTop - 176 };
const SWEEP_Q = { x: F.door.cx - 36, y: F.wallTop - 250 };
const ALLOW_Q = { x: F.allow.x, y: F.allow.y };
export function handQ(t: number) {
  const legs = [
    { t0: T.overlook, t1: T.brush, a: REST_Q, b: SHIELD_Q, bow: -90, b0: 10, b1: 18 },
    { t0: T.brush + 0.02, t1: T.brush + 0.3, a: SHIELD_Q, b: SWEEP_Q, bow: -20, b0: 18, b1: 16 },
    { t0: T.brush + 0.36, t1: T.press, a: SWEEP_Q, b: ALLOW_Q, bow: -70, b0: 16, b1: 26 },
    { t0: T.press + 0.18, t1: T.press + 0.85, a: ALLOW_Q, b: REST_Q, bow: -60, b0: 26, b1: 10 },
  ];
  if (t < T.overlook || t > T.press + 0.85) return null;
  let pos = REST_Q, bend = 10;
  for (const L of legs) {
    if (t >= L.t0) {
      const u = clamp01((t - L.t0) / (L.t1 - L.t0));
      const e = ease.inOut(u);
      pos = { x: lerp(L.a.x, L.b.x, e), y: lerp(L.a.y, L.b.y, e) + Math.sin(u * Math.PI) * L.bow };
      bend = lerp(L.b0, L.b1, e);
    }
  }
  const press = Math.max(
    t > T.press - 0.05 && t < T.press + 0.16 ? Math.sin(clamp01((t - T.press + 0.05) / 0.21) * Math.PI) : 0,
    t > T.brush - 0.03 && t < T.brush + 0.3 ? 0.5 : 0);
  return { tip: pos, bend, press };
}
const shieldTip = (t: number) => ease.in(clamp01((t - T.brush - 0.04) / 0.34));

const Inside: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  const d = droneAt(t);
  const pq = parcelQ(t);
  const ws = wallAt(t);
  const unfold = Math.max(win(t, HIT1 + 0.04, HIT1 + 0.6), 0);
  const flash = hitDecay(t, HIT2, 4);
  const build = clamp01((t - (T.office + 0.2)) / (T.pullOut - 0.12 - (T.office + 0.2)));
  const open = win(t, T.office - 0.05, T.office + 0.2);
  const collapse = clamp01((t - (T.office + 0.35)) / 0.4);
  const behind = t > T.through + 0.33;             // the drone has crossed the wall's plane
  /* the panel's landing is felt by everything standing on the ground */
  const thud = impact(f, (T.press + 1.12) * FPS, 7, 6, 10);
  const led = band(t, B(37) + 0.1, B(37) + 0.2, B(37) + 0.45, B(37) + 0.6);
  const hand = handQ(t);
  const box = (s: number, rot: number) => (
    <Box3 s={1} rot={0} squash={0} />
  );
  const drone = (
    <Drone x={d.x} y={d.y} s={d.s} tilt={d.tilt} t={t} swing={d.swing} led={led}
      carry={t >= CATCH && t < RELEASE} parcel={box(1, 0)} />
  );
  return (
    <g transform={`translate(0 ${thud})`}>
      <Sky3 t={t} />
      <City3 t={t} />
      {/* behind the wall: the office rising out of the parcel, and the drone once it is through */}
      {t > RELEASE && build < 1 && collapse < 1 && (
        <g transform={`translate(${pq.x} ${pq.y}) scale(${pq.s})`}>
          <Box3 open={open} collapse={collapse} />
        </g>
      )}
      {build > 0 && <Office3 x={PLOT3.cx} base={F.court} s={OFFICE_S} build={build} t={t} />}
      {behind && drone}
      {/* the wall's light through the opening, onto the courtyard */}
      <Wall3 s={ws} t={t} />
      <PlayGate t={t} k={0.6 + 0.4 * band(t, T.fromOutside - 0.3, T.fromOutside + 0.2, T.warnEnd, T.warnEnd + 0.5)} />
      <Plaza t={t} spill={win(t, T.press + 0.6, T.press + 1.2)} />
      <StoreQueue t={t} />
      <Shield3 x={F.door.cx} unfold={unfold} tip={shieldTip(t)} flash={flash} />
      {!behind && drone}
      {pq.free && t < CATCH && (
        <g transform={`translate(${pq.x} ${pq.y}) scale(${pq.s}) rotate(${pq.rot})`}><Box3 /></g>
      )}
      {hand && <Hand tip={hand.tip} from={{ x: 1340, y: 1900 }} hand="right" fw={30}
        bend={hand.bend} press={hand.press} />}
    </g>
  );
};

/* the home screen, assembled from the city: every rooftop sign lifts into a slot while the city
   folds flat beneath it like a pop-up page closing. The far row's signs unfold off their roofs
   first (they were too far to read), the store's queue drops into the dock, and the office's
   seal lands LAST in the one slot left open for it. */
const COLS = [170, 403, 677, 910];
const ROWS = [300, 560, 820, 1080];
const SLOTS = ROWS.flatMap((y) => COLS.map((x) => [x, y] as const));
const NEW_SLOT = 5;
const DOCK_Y = 1640;
export const newIconAt = () => ({ x: SLOTS[NEW_SLOT][0], y: SLOTS[NEW_SLOT][1] });
const DOCK_APPS = [2, 1, 12, 11];              // music, camera, health, cloud
const FAR_APPS = APPS.map((_, i) => i).filter((i) => !NEAR3.some((n) => n.app === i) && !DOCK_APPS.includes(i));
const FAR_SIGNS = [0, 1, 2, 3, 4, 5].map((k) => ({ x: 120 + k * 170, y: 520 + (k % 2) * 70, app: APPS[FAR_APPS[k % FAR_APPS.length]] }));
const SOURCES = [
  ...NEAR3.map((b, i) => ({ ...sign3At(i), app: APPS[b.app], far: false })),
  ...FAR_SIGNS.map((b) => ({ x: b.x, y: b.y, app: b.app, far: true })),
];
const HOME_SLOTS = SLOTS.map((_, i) => i).filter((i) => i !== NEW_SLOT);

const Home: React.FC<{ t: number }> = ({ t }) => {
  const m = win(t, T.pullOut + 0.3, T.newIcon - 0.2);
  const nw = win(t, T.newIcon - 0.4, T.newIcon + 0.1);
  const f = t * FPS;
  const sink = ease.in(m) * 1600;
  const seal = officeSealAt(PLOT3.cx, F.court, OFFICE_S);
  const office = (1 - ease.inOut(clamp01(nw * 1.2)));
  return (
    <g>
      <Sky3 t={t} />
      <City3 t={t} fold={m} signs={false} />
      {office > 0.001 && (
        <g transform={`translate(0 ${F.court}) scale(1 ${office}) translate(0 ${-F.court})`}>
          <Office3 x={PLOT3.cx} base={F.court} s={OFFICE_S} build={1} t={t} />
        </g>
      )}
      <g transform={`translate(0 ${sink})`}>
        <Wall3 s={{ ...wallAt(T.pullOut), hit: 0 }} t={t} />
        <PlayGate t={t} k={0.6} />
        <Plaza t={t} spill={1} />
      </g>
      <rect x={60} y={lerp(H + 40, DOCK_Y - 110, ease.out(m))} width={960} height={220} rx={60}
        fill="#CFE0FF" opacity={0.12} />
      {SOURCES.slice(0, HOME_SLOTS.length).map((src, i) => {
        const to = SLOTS[HOME_SLOTS[i]];
        const u = ease.inOut(clamp01((m - i * 0.03) / 0.62));
        const x = lerp(src.x, to[0], u), y = lerp(src.y, to[1], u) - Math.sin(u * Math.PI) * 120;
        const s = src.far ? lerp(0, 2.4, ease.out(clamp01(u * 1.6))) * (u > 0.62 ? 1 : 1) : lerp(1.07, 2.4, u);
        if (s <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x={-30} y={-30} width={60} height={60} rx={16} fill={src.app.col} />
            <Symbol kind={src.app.sym} cx={0} cy={0} s={1.05} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const u = ease.out(clamp01((m - 0.25 - i * 0.05) / 0.6));
        if (u <= 0) return null;
        const app = APPS[DOCK_APPS[i]];
        const x = lerp(F.gate.cx, COLS[i], u), y = lerp(H + 120, DOCK_Y, u);
        return (
          <g key={`d${i}`} transform={`translate(${x} ${y}) scale(2.4)`}>
            <rect x={-30} y={-30} width={60} height={60} rx={16} fill={app.col} />
            <Symbol kind={app.sym} cx={0} cy={0} s={1.05} />
          </g>
        );
      })}
      {/* the office's seal comes off its pediment and lands as the new app */}
      {(() => {
        const u = ease.inOut(nw);
        const to = SLOTS[NEW_SLOT];
        const x = lerp(seal.x, to[0], u), y = lerp(seal.y, to[1], u) - Math.sin(u * Math.PI) * 160;
        const s = lerp(0.68, 1.62, u) * (1 + impact(f, T.newIcon * FPS, 0.06, 5, 8));
        return (
          <g transform={`translate(${x} ${y}) scale(${s}) translate(-44 -44)`}>
            {nw > 0.9 && <Light cx={44} cy={44} r={120} color="#6FA8FF" k={0.5} />}
            <AppIcon x={0} y={0} s={1} />
            {nw > 0.95 && <circle cx={84} cy={6} r={10} fill={C.cobalt} stroke="#FFFFFF" strokeWidth={3} />}
          </g>
        );
      })()}
    </g>
  );
};

/* ── THE WHOLE SCREEN, by time ─────────────────────────────────────────────────────────────*/
const Screen: React.FC<{ t: number }> = ({ t }) => {
  /* the interior is revealed through an IRIS that opens from the point the finger touched */
  const iris = win(t, T.tap + 0.05, T.dive + 1.1);
  const tp = parcelAt(T.tap);
  const home = t > T.pullOut + 0.3;
  const appOpen = win(t, HOME_TAP_T + 0.10, HOME_TAP_T + 0.65);   // released by the tap above
  const ni = q2s(newIconAt().x, newIconAt().y);
  return (
    <g>
      {(iris < 0.999 || t < T.tap) && pov(t).dz < 0.97 && <Chat t={t} />}
      {iris > 0.001 && appOpen < 0.999 && (
        <g clipPath={pov(t).dz > 0.97 ? undefined : 'url(#v2iris)'}>
          <defs>
            <clipPath id="v2iris">
              <circle cx={tp.x} cy={tp.y} r={ease.in(iris) * 1500 + 1} />
            </clipPath>
          </defs>
          <g transform={`translate(${SCREEN.x} ${LC.y - 960 * K}) scale(${K})`}>
            {home ? <Home t={t} /> : <Inside t={t} />}
          </g>
        </g>
      )}
      {appOpen > 0.001 && (
        <g clipPath="url(#v2appopen)">
          <defs>
            <clipPath id="v2appopen">
              <rect x={lerp(ni.x - 36, SCREEN.x, ease.out(appOpen))} y={lerp(ni.y - 36, SCREEN.y, ease.out(appOpen))}
                width={lerp(72, SCREEN.w, ease.out(appOpen))} height={lerp(72, SCREEN.h, ease.outQuint(appOpen))}
                rx={lerp(18, 0, appOpen)} />
            </clipPath>
          </defs>
          <EchallanApp detail={win(t, T.opens + 0.15, B(52) + 0.35)} amount={win(t, B(53), B(54) + 0.2)}
            cta={win(t, B(54) + 0.2, B(55) + 0.3)} />
        </g>
      )}
      {(iris < 0.999 || home) && <StatusBar tint={t > T.opens ? '#B7C8E6' : '#C3D0E6'} label="10:43" />}
    </g>
  );
};

/* ── THE TAPPING HAND — the UPI rig, placed exactly as the UPI film places it ────────────────
   Arm from just beyond the right edge (1286, 1664), 26px finger width in the phone's plane, a
   bowed approach, the wrist bending as it arrives. It lives in the phone's plane so it cannot
   drift off its target as the camera moves. */
const REST_P = { x: 1120, y: 1620 };
export function tapHand(t: number) {
  const target = parcelAt(T.tap);
  const t0 = T.tap - 0.95, t1 = T.tap, t2 = T.tap + 0.14, t3 = T.tap + 0.8;
  if (t < t0 || t > t3) return null;
  let tip = REST_P, bend = 10;
  if (t <= t1) {
    const u = clamp01((t - t0) / (t1 - t0)), e = ease.inOut(u);
    tip = { x: lerp(REST_P.x, target.x, e), y: lerp(REST_P.y, target.y, e) + Math.sin(u * Math.PI) * -120 };
    bend = lerp(10, 24, e);
  } else if (t <= t2) { tip = { x: target.x, y: target.y }; bend = 24; }
  else {
    const u = clamp01((t - t2) / (t3 - t2)), e = ease.inOut(u);
    tip = { x: lerp(target.x, REST_P.x, e), y: lerp(target.y, REST_P.y, e) + Math.sin(u * Math.PI) * -80 };
    bend = lerp(24, 10, e);
  }
  const d = t - T.tap;
  const press = d > -0.05 && d < 0.16 ? Math.sin(clamp01((d + 0.05) / 0.21) * Math.PI) : 0;
  return { tip, press, bend, target };
}

/* the app does NOT open by itself: the same hand returns and taps the icon that just landed, and
   the launch is released by that press. */
const P_REST2 = { x: 1120, y: 1660 };
export const homeTapAt = () => q2s(newIconAt().x, newIconAt().y);
export const HOME_TAP_T = T.opens - 0.12;
export function homeTap(t: number) {
  const tgt = homeTapAt();
  const t0 = HOME_TAP_T - 0.85, t1 = HOME_TAP_T, t2 = HOME_TAP_T + 0.14, t3 = HOME_TAP_T + 0.80;
  if (t < t0 || t > t3) return null;
  let tip = P_REST2, bend = 10;
  if (t <= t1) {
    const u = clamp01((t - t0) / (t1 - t0)), e = ease.inOut(u);
    tip = { x: lerp(P_REST2.x, tgt.x, e), y: lerp(P_REST2.y, tgt.y, e) + Math.sin(u * Math.PI) * -110 };
    bend = lerp(10, 24, e);
  } else if (t <= t2) { tip = tgt; bend = 24; } else {
    const u = clamp01((t - t2) / (t3 - t2)), e = ease.inOut(u);
    tip = { x: lerp(tgt.x, P_REST2.x, e), y: lerp(tgt.y, P_REST2.y, e) + Math.sin(u * Math.PI) * -80 };
    bend = lerp(24, 10, e);
  }
  const d = t - t1;
  const press = d > -0.05 && d < 0.16 ? Math.sin(clamp01((d + 0.05) / 0.21) * Math.PI) : 0;
  return { tip, press, bend };
}

/* ── TAP QA — every contact in this scene, as two points in one coordinate system ──────────*/
export const CONTACTS = [
  { name: 'tap the file', t: T.tap, space: 'phone',
    tip: (t: number) => tapHand(t)?.tip, target: (t: number) => parcelAt(t) },
  { name: 'open the app', t: HOME_TAP_T, space: 'phone',
    tip: (t: number) => homeTap(t)?.tip, target: () => homeTapAt() },
  { name: 'push the warning back', t: T.brush, space: 'inside',
    tip: (t: number) => handQ(t)?.tip, target: (_t: number) => SHIELD_Q },
  { name: 'ALLOW', t: T.press, space: 'inside',
    tip: (t: number) => handQ(t)?.tip, target: (_t: number) => ({ x: F.allow.x, y: F.allow.y }) },
];

/* ── ASSEMBLY ──────────────────────────────────────────────────────────────────────────────*/
export const Opening: React.FC<{ t: number }> = ({ t }) => {
  const p = pov(t);
  const f = t * FPS;
  const inside = p.dz > 0.98;               // the frame is entirely the interior: skip the world
  /* the street plane and the sky plane take DIFFERENT shares of the move */
  const Zc = lerp(1.10, 1, p.uw), dyc = lerp(430, 0, p.uw);
  const plateFly = win(t, T.plateMatch + 0.15, T.plateMatch + 0.95) * (1 - ease.inOut(clamp01((t - T.pushIn) / 0.7)));
  const plateOn = band(t, T.plateMatch + 0.1, T.plateMatch + 0.3, T.pushIn + 0.62, T.pushIn + 0.72);
  const matched = win(t, T.plateMatch + 0.95, T.plateMatch + 1.2) * (1 - win(t, T.pushIn, T.pushIn + 0.4));
  const kick = impact(f, T.land * FPS, 4, 5.4, 9);
  /* the buzz: a notification is FELT — three fast, decaying lateral shakes with ring lines */
  const buzz = impact(f, (T.land - 0.05) * FPS, 7, 22, 9);
  /* the comet: from beyond the top-right of the sky into the screen */
  const cp = clamp01((t - T.launch) / (T.land - T.launch - 0.1));
  const comet = cp > 0 && cp < 1;
  const ce = ease.inOut(cp);
  const cEnd = toFrame(T.land, SCREEN.x + SCREEN.w - 10, BY + 40);
  const cx = lerp(1000, cEnd.x, ce), cy = lerp(330, cEnd.y, ce) - Math.sin(cp * Math.PI) * 120;
  const plateFrom = toFrame(t, DOC.x + 25 + DOC.w * 0.215, DOC.y + 81 + DOC.w * 0.065);
  const hand = tapHand(t);
  const hTap = homeTap(t);
  const fc = focus(t);
  return (
    <g transform={`translate(540 960) scale(${fc.z}) translate(${-fc.x} ${-fc.y})`}>
      {!inside && (
        <>
          <g transform={`translate(540 ${960 + dyc}) scale(${Zc}) translate(-540 -960)`}>
            <City t={t} />
          </g>
          <g transform={`translate(540 ${960 + p.dy}) scale(${p.Zw}) translate(-540 -960)`}>
            <Streetlight x={120} y={1440} h={700} />
            <CarRear x={CAR.x} y={CAR.y} s={CAR.s} plateGlow={matched * 0.7} />
            <Person x={PERSON.x} y={PERSON.y} s={PERSON.s} noPhone
              look={band(t, T.plateMatch + 0.8, T.plateMatch + 1.1, T.pushIn + 0.1, T.pushIn + 0.5)}
              handTo={[(PWC.x + 3 - PERSON.x) / PERSON.s, (PWC.y + 64 - PERSON.y) / PERSON.s]} />
          </g>
        </>
      )}
      {comet && <MessageComet x={cx} y={cy} s={0.9 + cp * 0.3} ang={154} trail={420 + cp * 200} />}
      {/* the screen's light on the world in front of it */}
      {!inside && p.uw < 0.5 && (
        <Light cx={p.cx} cy={p.cy} r={760 * p.s} color={P.cool} k={0.22 * (1 - p.uw * 2)} core={0.1} />
      )}
      <g transform={povT(t)}>
        <g transform={`translate(${buzz} ${kick})`}>
          {p.dz > 0.97 ? (
            /* fully inside: the interior is the whole frame, unclipped by the glass */
            <Screen t={t} />
          ) : (
            <>
              <PhoneShell screenBase={C.chatBg}><Screen t={t} /></PhoneShell>
              <PhoneFurniture />
            </>
          )}
          {/* the parcel lifts OUT of the file, above the glass: the file was a package */}
          {parcelPop(t) > 0.01 && parcelSink(t) < 0.999 && (() => {
            const pa = parcelAt(t);
            const sk = parcelSink(t);
            return (
              <g>
                <Light cx={pa.x} cy={pa.y} r={200 * pa.s} color={P.warm} k={0.6 * parcelPop(t) * (1 - sk)} />
                <Parcel x={pa.x} y={pa.y + sk * 20} s={pa.s * (1 - sk * 0.9)}
                  rot={Math.sin(t * 2.2) * 3 * parcelPop(t)} squash={band(t, T.tap - 0.04, T.tap, T.tap + 0.04, T.tap + 0.12)} />
              </g>
            );
          })()}
          {hand && <Hand tip={hand.tip} from={{ x: 1286, y: 1664 }} hand="right" fw={26}
            bend={hand.bend} press={hand.press} />}
          {hTap && <Hand tip={hTap.tip} from={{ x: 1286, y: 1664 }} hand="right" fw={26}
            bend={hTap.bend} press={hTap.press} />}
        </g>
      </g>
      {/* the buzz, as ring lines either side of the device — sound, drawn */}
      {(() => {
        const r = clamp01((t - (T.land - 0.05)) / 0.6);
        if (r <= 0 || r >= 1 || p.uw > 0.1) return null;
        return [-1, 1].map((d) => (
          <g key={d} opacity={1 - r}>
            {[0, 1].map((j) => (
              <path key={j} d={`M${p.cx + d * (330 + j * 34 + r * 60)} ${p.cy - 60 - j * 20}
                q ${d * 22} 60 0 ${120 + j * 40}`} fill="none" stroke={P.cool} strokeWidth={6}
                strokeLinecap="round" />
            ))}
          </g>
        ));
      })()}
      {/* THE PLATE MATCH: the plate lifts off the notice and lands on the car's own plate */}
      {plateOn > 0.01 && (() => {
        const u = ease.inOut(plateFly);
        const x = lerp(plateFrom.x, CAR_PLATE.x, u), y = lerp(plateFrom.y, CAR_PLATE.y, u) - Math.sin(u * Math.PI) * 160;
        const w = lerp(DOC.w * 0.43 * plateFrom.s, CAR_PLATE.w, u);
        return (
          <g opacity={plateOn}>
            <path d={`M${plateFrom.x} ${plateFrom.y} Q${(plateFrom.x + x) / 2} ${Math.min(plateFrom.y, y) - 200} ${x} ${y}`}
              fill="none" stroke={P.cyan} strokeWidth={4} strokeDasharray="10 12" opacity={0.7} />
            <g transform={`translate(${x - w / 2} ${y - w * 0.15})`}>
              <NumberPlate x={0} y={0} w={w} />
            </g>
            {matched > 0.02 && (
              <g transform={`translate(${CAR_PLATE.x + CAR_PLATE.w / 2 + 20} ${CAR_PLATE.y - 50}) scale(${ease.out(matched)})`}>
                <circle r={30} fill={P.cyan} />
                <path d="M-13 0 l9 9 l17 -19" stroke="#06283A" strokeWidth={6} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })()}
    </g>
  );
};

export const OPENING_END = T.end;

/* ── SOUND CUES — the score reads the picture's own clocks, so a sound cannot drift off its
   event. tools/echallan/score-opening.mjs bundles this file and places every SFX from here. */
export const CUES = {
  T, HIT1, HIT2, CATCH, RELEASE,
  officeBuild: [T.office + 0.2, T.pullOut - 0.12] as const,
  boxOpen: T.office - 0.05,
  wake: B(37) + 0.3, ping: B(37) + 0.1,
  press: T.press, pulse: T.press + 0.04, bolts: [T.press + 0.22, T.press + 0.28, T.press + 0.34],
  fieldOff: T.press + 0.36, sinkStart: T.press + 0.5, sinkLand: T.press + 1.12,
  shieldUp: HIT1 + 0.04, shieldLock: HIT1 + 0.6, shieldPush: T.brush, shieldFall: T.brush + 0.38,
  fold: [T.pullOut + 0.3, T.newIcon - 0.2] as const,
  appOpen: T.opens, details: T.opens + 0.2,
  end: T.end,
};
export { droneAt as droneTrack, wallAt as wallTrack };
