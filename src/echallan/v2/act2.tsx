/* ACT 2 — "Then when you proceed to pay, it asks you to install an update first" … "settle the fine."
 *
 * ONE OBJECT CARRIES THIS ACT. The app's update is a cased, folded antenna (fortress: UpdateTile).
 * It is the glyph on the update dialog, so pressing INSTALL UPDATE is pressing on THAT object; it
 * sinks into the glass at the point the finger touched; it falls through into the city; the app's
 * own drone catches it, flies it THROUGH the doorway the user cut open in act 1, climbs to the
 * office roof and sets it down. The case then opens and telescopes into the antenna — and the
 * courier, which has now done the only job it had, flies back out the way it came.
 *
 * THE PERMISSION MECHANISM, stated once:
 *
 *    1. THE ANTENNA ASKS. A circular wavefront leaves its head and crosses the city. It carries
 *       the colour of the permission it is asking for and a brighter lobe aimed at the building
 *       it is addressed to.
 *    2. THE BUILDING ASKS WHEN THE FRONT REACHES IT — not a moment before. The hatch on that
 *       building's own facade opens the instant the ring arrives, and the arrival is timed so it
 *       lands on the word.
 *    3. THE ANSWER GOES BACK THE SAME WAY. Pressing ✓ sends a pulse in along the radial the
 *       question came out on; it reaches the antenna, and runs DOWN the tower.
 *    4. AND THE APP GROWS THE ORGAN THAT USES IT. Each grant erects a different piece of
 *       apparatus on the app's own building — a mail hoist, a line tap, an eye, a satellite — and
 *       leaves a permanent feeder from the antenna to it.
 *
 * Nothing appears from nowhere, nothing is deleted, and every step is the visible cause of the
 * next one.
 */
import React from 'react';
import {
  C, LAYOUT, SCREEN, STATUS_H, W, band, breathe, clamp01, ease, lerp, win,
} from '../design';
import { B, WEnd } from '../timeline';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { EchallanApp, PaymentForm, PaymentSuccess, UpdateCard } from '../world/screens';
import { Hand } from '../world/hand';
import { City } from './city';
import {
  CAP_COL, CAP_ORDER, City3, DRONE_G, DeployMast, Drone, F, NEAR3, OFFICE_MOUNT, Office3, PLOT3,
  PlayGate, Plaza, Q, GrantHatch, SatHatch, Satellite, Sky3, UpdateTile, Wall3, WallState,
  mastTipAt,
} from './fortress';
import {
  Backwash, CallTap, Feeder, GrantKey, MailHoist, WatchEye, Wavefront, feederPoint, gaze,
} from './organs';
import { Light } from './style';
import { makeTrack, register } from './track';
import type { FK } from './track';
import { Shell } from './shell';

/* ── THE CLOCK ─────────────────────────────────────────────────────────────────────────────
   NOTHING HERE IS A WALL-CLOCK TIME ANY MORE. The delivery used to carry five hand-set seconds
   (roof 37.34, deploy 37.38-38.30, away, ping) and a script edit moved every measured word under
   them by 2.24 s, which would have had the courier setting the case down after the antenna had
   already asked for two permissions. Every one of them is now an offset from a MEASURED word, so
   the chain re-times with the read exactly like the rest of the film — see the rule "beat-index shift".

   The chain is also SOLVED, not chosen: the antenna has to be standing before it can ask, so
   "the app BEGINS" (B(74)) is when the mast locks, "asking for" (B(75)) is when the carrier
   goes, and the first coloured wavefront leaves at ask − distance/700 — 1.13 s before "to
   access" — which is 0.05 s after the carrier. That ordering is what the delivery has to clear. */
export const A = {
  start: B(56),                       // 31.36  "Then"
  /* THE UPDATE NOW HAS A CAUSE. It used to rise out of nothing 0.3 s into the sentence; the
     narration now says "when you proceed to pay, it asks you to install an update FIRST", so the
     finger lands on the same PAY NOW it will press again after the permissions, and the demand
     is what the press returns. This is the trick as it is actually run: the victim is made to
     feel one step from being finished. */
  payTap: B(59) + 0.10,               // 32.92  "pay,"        the finger lands on PAY NOW
  cardUp: B(60) + 0.04,               // 33.39  "it asks"     and the panel comes up under it
  tapUpdate: B(66) - 0.05,            // 36.63  "that"
  dive: B(66) + 0.16,                 //        it goes into the glass and we follow it
  inside: B(68) + 0.30,               //        we are through
  fall0: B(66) + 0.50,                //        it is already falling when we arrive
  /* THE DELIVERY IS A DELIVERY, NOT A SCRAMBLE. Round 6 compressed this chain to buy deploy time
     and left the climb 0.18 s long — 716 units in eleven frames, nearly 4 000 units/s, which read
     as the courier bolting for the roof. The catch is 0.5 s earlier (on "the", not "update") and
     the whole flight is one continuous path now, so the climb has 0.78 s and a speed profile
     instead of five stop-start legs. */
  catch: B(69) + 0.10,                // 37.70  "the"         the hook takes it
  gate0: B(70) + 0.20,                // 38.00  "update"      lined up with the doorway
  gate1: B(71) + 0.12,                // 38.32  "installs."   through it
  roof: B(71) + 1.34,                 // 39.54  set down on the office roof
  deploy0: B(71) + 1.38,              // 39.58  the case opens and the antenna telescopes out
  deploy1: B(75) - 0.04,              // 40.40  "asking for" — and locks
  away0: B(71) + 1.40,                // 39.60  the courier leaves: its one job is done
  away1: B(75) - 0.14,                // 40.30  clear of frame before the last segment is up
  ping: B(75) + 0.04,                 // 40.48  the strobe lights, the carrier goes
  /* THE ASKS ARE NO LONGER WRITTEN HERE. One wave asks the whole city at once and each hatch
     opens when the front reaches it, so the ask is a distance divided by a speed — see PERM. These
     four are kept only because act 3 reads CAP_T; nothing in act 2 uses them.
     THE GRANTS ARE PINNED TO THE END OF THE WORD THAT NAMES THEM, so the finger presses ✓ as the
     narrator finishes saying "SMS", "calls", "background", "VPN connection" — one after another,
     with nothing waited for in between. */
  smsAsk: B(77), smsGrant: WEnd(79, 'SMS,') - 0.12,
  callAsk: B(80), callGrant: WEnd(81, 'calls,') - 0.12,
  bgAsk: B(82), bgGrant: WEnd(86, 'background,') - 0.12,
  /* the VPN's ✓ lands on the word VPN, not on "connection." — partly because that is the word
     that names the permission, and partly because the dish then has the whole of the sentence's
     last word plus its hold to finish AIMING before it transmits, which the assert below checks. */
  vpnAsk: B(88), vpnGrant: WEnd(91, 'VPN') + 0.10,
  satBeam: B(91) + 1.64,              // 51.60  the dish has finished aiming; only then does it send
  /* NOT B(93), and NOT B(111) below. tools/echallan/align.mjs snaps a word's onset to the silence
     detector, so a SHORT designed hold shows up in the measured word times but a LONG one gets
     swallowed: the word after it is placed before the pause has even finished. Measured gaps at
     the seven hold anchors were 0.53 / 1.50 / 1.56 / 0.43 — then 0.058 / 0.080 / 0.077 at
     "connection.", "fine." and "malware.", whose real pauses are 0.60s, 1.05s and 0.46s.
     So any cue anchored to the block immediately AFTER a long hold reads early: B(93) truncated
     the VPN beat, and B(111) landed before the payment resolution finished and crashed the
     camera rig with "FOCUS2 key 28 runs backwards". Both anchor off the block BEFORE the hold,
     which measures correctly. */
  /* the 1.12 s hold after "connection." is now long enough that the aligner DOES resolve the
     word after it, so this anchors off B(93) rather than guessing past a swallowed pause. The
     beat it buys is the point of the hold: the dish finishes turning, and only then transmits —
     three pulses leaving a dish aimed out of the world is the last image of the act, and the old
     cut left while the first one was still on screen. */
  out: B(93) + 0.50,                  // 55.01
  challan: B(97),                     // 57.18  "you finally arrive"
  payNow: B(97) + 0.55,               // 54.95  it is tapped ON the arrival line
  form: B(98) + 0.10,                 //        so we ARE on the payment screen by "screen."
  fieldTap: B(103) + 0.02,
  typed0: B(103) + 0.15, typed1: B(109),
  pay: B(110) + 0.08,                 // 60.02  "fine."
  spin: B(110) + 0.20, tick: B(110) + 0.45, ok: B(110) + 0.75,
  end: B(110) + 1.05,                 // past the real 1.05s pause after "fine." — see the note above
} as const;

/* ── GEOMETRY (identical to the opening's, so the hand-off is exact) ───────────────────────*/
export const LC = { x: LAYOUT.phone.x + LAYOUT.phone.w / 2, y: SCREEN.y + SCREEN.h / 2 };
export const TOP = SCREEN.y + STATUS_H + 104;
export const K = SCREEN.w / 1080;
const Z_IN = 1 / K;
export const CARD_Y = SCREEN.y + 470;

/* ── CAMERA ────────────────────────────────────────────────────────────────────────────────*/
export function cam2(t: number) {
  const din = win(t, A.dive, A.dive + 1.25);
  const dout = win(t, A.out, A.out + 1.20);
  return { dz: ease.inOut(clamp01(din - dout)) };
}
export function pov2(t: number) {
  const { dz } = cam2(t);
  return { s: Math.exp(lerp(0, Math.log(Z_IN), dz)), cx: LC.x, cy: LC.y + (960 - LC.y) * dz, dz };
}
export const povT2 = (t: number) => {
  const p = pov2(t);
  return `translate(${p.cx} ${p.cy}) scale(${p.s}) translate(${-LC.x} ${-LC.y})`;
};
/* ── THE PERMISSION PANEL, compact — the same grammar the wall taught: who asks, ✕, ✓ ──────*/
export type Cap = 'sms' | 'call' | 'bg' | 'vpn';
export const askAt = (x: number, y: number) => ({ x: x + 38, y: y + 36 });
/* CapGlyph now lives in fortress.tsx, where the service hatch also uses it — one copy. */
/* the floating dialog panel is gone: a permission is now asked for ON its building. */

/** WHAT A PERMISSION ACTUALLY GIVES AWAY — drawn inside the hatch's recess, so opening the leaf
 *  and seeing the contents are the same act. Each is the building's own working stock. */
function hatchContent(c: Cap, t: number): React.ReactNode {
  const h = HATCH[c];
  if (c === 'sms') {
    return (
      <g>
        <rect x={h.x - 62} y={h.y - 12} width={124} height={4} fill="#1A2440" />
        <rect x={h.x - 62} y={h.y + 12} width={124} height={4} fill="#1A2440" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${h.x - 40 + (i % 3) * 40} ${h.y - 24 + Math.floor(i / 3) * 24}) rotate(${-6 + (i % 3) * 6}) scale(0.74)`}>
            <rect x={-14} y={-10} width={28} height={20} rx={2.5} fill="#F2F6FF" />
            <path d="M-14 -10 L0 2 L14 -10" fill="none" stroke="#9FB0D4" strokeWidth={2.6} />
          </g>
        ))}
      </g>
    );
  }
  if (c === 'call') {
    /* a jackfield: the exchange's own switchboard, every line on it live */
    return (
      <g>
        {[0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5].map((k) => (
          <circle key={`${r}${k}`} cx={h.x - 50 + k * 20} cy={h.y - 20 + r * 20} r={5.5}
            fill={(r * 6 + k) % 4 === 0 ? CAP_COL.call : '#26304F'} />
        )))}
        <rect x={h.x - 58} y={h.y + 14} width={116} height={5} rx={2} fill="#3A456B" />
      </g>
    );
  }
  if (c === 'bg') {
    /* the meter that never stops turning once it is theirs */
    const sp = t * 40;
    return (
      <g>
        <rect x={h.x - 58} y={h.y - 26} width={116} height={52} rx={4} fill="#101833" />
        <circle cx={h.x} cy={h.y} r={20} fill="#1A2440" />
        <g transform={`rotate(${sp} ${h.x} ${h.y})`}>
          <rect x={h.x - 2} y={h.y - 18} width={4} height={36} rx={2} fill={CAP_COL.bg} />
        </g>
        <circle cx={h.x} cy={h.y} r={4} fill="#3A456B" />
        {[-44, 44].map((dx) => <rect key={dx} x={h.x + dx - 4} y={h.y - 20} width={8} height={40} rx={3} fill="#2A3352" />)}
      </g>
    );
  }
  /* vpn: the route out of the city, and the only one that leaves it */
  return (
    <g>
      <rect x={h.x - 58} y={h.y - 24} width={116} height={48} rx={4} fill="#0D1A2A" />
      <path d={`M${h.x - 44} ${h.y + 14} L${h.x - 12} ${h.y - 10} L${h.x + 14} ${h.y + 4} L${h.x + 44} ${h.y - 16}`}
        fill="none" stroke={CAP_COL.vpn} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {[-44, -12, 14, 44].map((dx, i) => (
        <circle key={i} cx={h.x + dx} cy={[h.y + 14, h.y - 10, h.y + 4, h.y - 16][i]} r={4.5} fill="#8FE8FF" />
      ))}
    </g>
  );
}

/* ── WHERE EVERYTHING STANDS ───────────────────────────────────────────────────────────────*/
export const OFFICE_S = 1.15;
/** every mount comes off the building's own mouldings — see fortress: OFFICE_MOUNT */
export const MNT = OFFICE_MOUNT(PLOT3.cx, F.court, OFFICE_S);
export const MAST = { x: PLOT3.cx, base: MNT.apex.y + 4 };
/** the antenna's radiator: the centre of every wavefront and the root of every feeder */
export const TIP = { x: MAST.x, y: mastTipAt(MAST.base).y };
/** THE TOP OF THE ANTENNA AS DRAWN, which is NOT `TIP` — TIP is the radiator's centre, and the
 *  radiator, its collar and its finial stand 56 units above it. Act 4 cranes up this mast twice and
 *  both times it was framed off TIP, so the spire was clipped by the top of the frame for about two
 *  seconds while the camera pushed in. tools/echallan/act4.mjs now guards this number. */
export const MAST_TOP = mastTipAt(MAST.base).y - 56;
/** Each hatch is centred on its host's own facade — so these are not free numbers: move a
 *  building in fortress:NEAR3 and its hatch has to come with it, or the permission is asked for
 *  on thin air. The wavefront table below re-solves from them, so the timing follows too. */
export const HATCH: Record<Cap, { x: number; y: number }> = {
  sms: { x: 46, y: 672 },     // the post office, in its facade under its own letter slot
  call: { x: 215, y: 580 },   // the exchange, under its cable band
  bg: { x: 368, y: 600 },     // the chat tower: the app stays awake behind your own apps
  vpn: { x: 1055, y: 640 },   // the bank: the route by which everything leaves the city
};
(Object.keys(HATCH) as Cap[]).forEach((c) => {
  const b = NEAR3.find((n) => ({ sms: 'mail', call: 'phone', bg: 'chat', vpn: 'bank' } as const)[c] === n.kind);
  if (!b) throw new Error(`no host building for ${c}`);
  const over = Math.max(b.x - (HATCH[c].x - 70), (HATCH[c].x + 70) - (b.x + b.w));
  if (over > 8) throw new Error(`the ${c} hatch overhangs the ${b.kind} building by ${over.toFixed(0)}`);
});
/** when each permission is asked for and granted */
/* only the GRANTS are written against the read now — each lands on the word that names it. The
   asks are derived from the wave's geometry in PERM below. */
export const CAP_T: Record<Cap, { ask: number; grant: number }> = {
  sms: { ask: A.smsAsk, grant: A.smsGrant },
  call: { ask: A.callAsk, grant: A.callGrant },
  bg: { ask: A.bgAsk, grant: A.bgGrant },
  vpn: { ask: A.vpnAsk, grant: A.vpnGrant },
};

/* ── THE SIGNAL, AS A CLOCK ────────────────────────────────────────────────────────────────
   A wavefront is not decoration, so it is not given a speed that looks nice: it is given a speed
   and then the launch time is SOLVED so the front arrives at the building on the word. 700 q/s
   crosses the widest reach (789 units, the post office) in 1.13 s — slow enough to watch, fast
   enough that the question does not outstay the sentence. The answer comes back at 2400 q/s,
   because an answer is not a question. */
const OUT_SPEED = 700, IN_SPEED = 2400;
/* ── ONE WAVE, ON ALL SIDES ─────────────────────────────────────────────────────────────────
 * This act used to send FOUR wavefronts, one per permission, each launched so that it arrived at
 * its own building on the word that names it — which made the act four repetitions of the same
 * five-beat cycle, seventeen seconds long, with the narration holding its breath between each.
 * On a Short that is the stretch a viewer leaves on.
 *
 * It is one wave now, and it goes everywhere. The antenna asks the whole city at once, and each
 * building's hatch opens THE INSTANT the front reaches it — so the ask is geometry, not script.
 * From the radiator at (690, 151) the chat tower is 553 units away, the bank 610, the exchange 640
 * and the post office 828, so at 700 q/s all four are open inside 1.18 s of each other. The bank
 * is the only one on the RIGHT of the antenna, at a bearing of 53 degrees against the others'
 * 126-141, which is exactly why a single directed lobe could never serve it and why the wave has
 * to be a circle.
 *
 * What is left for the finger to do is then a list, not a queue: four questions standing open, and
 * it answers them one after another as the narrator names them, with no wait between. */
export const WAVE0 = A.ping + 0.26;
/* how long each machine takes to build. Trimmed a little all round so the camera's hold on the
   FINISHED machine is a hold on something finished, not a race against the next question — and
   the eye from 1.76 to 1.25, because the eye now gets a 1.15 s static wide of its own. */
const GROW_S: Record<Cap, number> = { sms: 0.72, call: 0.74, bg: 1.25, vpn: 0.80 };
export const PERM = (() => {
  const out = {} as Record<Cap, { ask: number; grant: number; dist: number; bearing: number;
    launch: number; back0: number; back1: number; down0: number; down1: number;
    grow0: number; grow1: number }>;
  (CAP_ORDER as readonly Cap[]).forEach((c) => {
    const h = HATCH[c];
    const dist = Math.hypot(h.x - TIP.x, h.y - TIP.y);
    const bearing = Math.atan2(h.y - TIP.y, h.x - TIP.x);
    const { grant } = CAP_T[c];
    const ask = WAVE0 + dist / OUT_SPEED;      // the front reaches it; it asks. Nothing else.
    const back0 = grant + 0.05, back1 = back0 + dist / IN_SPEED;
    const down0 = back1 - 0.04, down1 = down0 + 0.22;
    const grow0 = down0 + 0.12;
    out[c] = { ask, grant, dist, bearing, launch: WAVE0,
      back0, back1, down0, down1, grow0, grow1: grow0 + GROW_S[c] };
  });
  return out;
})();
/* THE BEAM MAY NOT PRECEDE THE AIM. A.satBeam is anchored to a measured word and the rise is
   anchored to the grant, so a re-measure can slide one past the other — and a dish that starts
   transmitting while it is still swinging is a dish that is not aimed at anything. */
(() => {
  const aimDone = PERM.vpn.grow0 + (PERM.vpn.grow1 - PERM.vpn.grow0) * 0.90;
  if (A.satBeam < aimDone - 0.01)
    throw new Error(`the VPN dish transmits at ${A.satBeam.toFixed(2)} but finishes aiming at `
      + `${aimDone.toFixed(2)} — move A.satBeam later or shorten GROW_S.vpn`);
})();

/** where each feeder starts and ends. The key rides the same curve, so the cable and the thing
 *  travelling it can never disagree. */
/** EACH FEEDER LEAVES ITS OWN PORT. The head's equipment box carries four coloured terminals
 *  (fortress: DeployMast) and each cable now starts at the one that lights for it, instead of all
 *  four erupting from a single point — which at this camera distance was a knot. */
export const FEED_FROM: Record<Cap, { x: number; y: number }> = {
  sms: { x: TIP.x + 16, y: MAST.base - 270 + 8 },
  call: { x: TIP.x + 27, y: MAST.base - 270 + 8 },
  bg: { x: TIP.x + 16, y: MAST.base - 270 + 19 },
  vpn: { x: TIP.x + 27, y: MAST.base - 270 + 19 },
};
export const FEED_DROP: Record<Cap, number> = { sms: 26, call: 14, bg: 60, vpn: 40 };
/** and each ENDS somewhere the eye can tell apart from the other three: the hoist's drive, the
 *  cabinet's outboard gland, the medallion's upper-left rim, and the roof hatch the satellite
 *  climbed out of. Two cables landing within 40 units of each other read as one cable. */
export const FEED_TO: Record<Cap, { x: number; y: number }> = {
  sms: { x: MNT.sms.x + 34, y: MNT.sms.y - 44 },
  call: { x: MNT.call.x + 58, y: MNT.call.y - 22 },
  bg: { x: MNT.seal.x - 34, y: MNT.seal.y - 30 },
  vpn: { x: MNT.vpnRoof.x - 2, y: MNT.vpnRoof.y - 12 },
};
/** THE EYE'S PLACEMENT IS CONSTRAINED FROM THREE SIDES: the pupil must not sit behind a rooftop
 *  sign (it landed squarely behind the chat tower's), the iris must not reach the antenna's x or
 *  the tower bisects it, and the lower lid must stay behind the skyline so the city is INSIDE the
 *  gaze rather than under a floating shape. This is the one position that satisfies all three. */

/* ── THE CAMERA ────────────────────────────────────────────────────────────────────────────
   THE PERMISSION SECTION IS GENERATED, NOT TYPED. The previous cut hand-listed five keys per
   permission and the camera never rested: it arrived at the building, pushed in for the ✓,
   pulled wide to follow the key, pushed in again for the organ, and left — five moves inside
   four seconds, so nothing was on screen long enough to be read. It was not a pacing problem;
   it was a camera problem, and adding time alone would only have made a restless shot longer.

   Each permission now gets exactly TWO held positions and ONE move between them:

       THE BUILDING — held from before the ring lands until after the ✓ is pressed (~2 s).
                      The hatch opening, the hand arriving and the press all happen in one
                      settled frame.
       one move      — in the direction the key travels, so the camera is tracking the object
                      rather than cutting to where it is going.
       THE ORGAN     — held while the machine is built and after it is finished (~0.7-1.2 s),
                      and the next ring is launched out of that hold.

   `tools/echallan/focus.mjs` measures those dwells off the built table and fails below the
   minimums in SHOT_HOLD, so a future edit cannot quietly go back to five moves. */
/** the floor, in seconds, that focus.mjs holds this scene to */
export const SHOT_HOLD = { ask: 1.45, organ: 0.68 };
const FOCUS2: FK[] = [
  [A.start, 540, 960, 1.00],
  [A.payTap - 0.30, 540, 1006, 1.10],  // "proceed to"    down onto the button he is reaching for
  [B(60) + 0.30, 540, 900, 1.06],      // "it asks"       and the panel the press returns
  [B(62), 540, 1010, 1.14],            // "install"
  [B(65), 540, 1020, 1.16],            // "tap"
  [A.dive + 0.05, 540, 960, 1.00],     //                 the dive takes over
  [A.catch - 0.30, 940, 980, 0.92],    // "the"           it falls, and the drone comes for it
  [A.catch + 0.24, 830, 1024, 1.00],   // "update"        the hook takes it
  [A.gate1 + 0.04, 690, 1030, 1.10],   // "installs."     through the doorway
  /* one crane, matched to the climb, instead of a cut to the roof */
  [A.roof - 0.10, 690, 690, 1.34],     //                 set down on the roof
  [A.deploy1 - 0.06, 690, 555, 1.46],  // "asking for"    the antenna runs out and locks
  /* THE WIDE SITS ON THE LINE THE CAMERA IS ALREADY TRAVELLING. From the antenna at y 555 it
     used to drop to 690 and then climb back to 640 for the question — a dip, and with the hold
     between them gone it read as a 288 deg/s swing onto a new heading in the middle of one move.
     At y 585 the pull-out and the push to the question are the same journey. */
  [A.ping + 0.10, 620, 585, 0.80],     //                 WIDE: the first wavefront crosses the city
  /* the hold that used to sit here is gone. Widening the first permission's approach to the
     0.44 s it needs left this hold 0.16 s long — which is not a hold, it is the camera stopping
     dead in the middle of a move (rule: eased legs make false stops). The crossing is already
     held by the key above it; the camera now eases out of that straight into the question. */
  /* ── ONE MOVE FOR THE WHOLE PERMISSION ACT ───────────────────────────────────────────────
   * This used to be four cycles of the same four keys: settle on the question, track to the organ
   * it bought, hold on the machine, leave for the next question. Twelve moves in seventeen
   * seconds, and the narration held its breath through each of them so the camera could arrive —
   * which is what made this the weakest stretch of the film and the likeliest place to lose a
   * viewer on a Short.
   *
   * The wave asks the whole city at once now, so there is nothing to visit in turn: every question
   * is open, every answer is given in the same frame, and every machine is built in it. The camera
   * makes ONE decision across the act — a slow push, about ten per cent — and otherwise gets out
   * of the way.
   *
   * z 0.885 IS A CEILING, NOT A PREFERENCE. The post office's hatch sits at x 46, hard against the
   * left edge of the world, and the bank's at x 1055; holding both of them whole with a margin
   * puts the camera at x 550 and caps the lens at 0.888. The act is wide because what is being
   * said is wide. */
  [PERM.vpn.grant + 0.55, 550, 540, 0.885],
  /* the last image of the act: four breaches, four machines, an eye over the whole skyline and
     a dish aimed out of the world. The city is 1450 units across now, so this is 0.82. */
  [A.satBeam + 0.98, 606, 356, 0.82],
  [A.out - 0.04, 606, 356, 0.82],      // "connection."   HELD
  [A.out + 0.46, 540, 960, 1.00],      //                 and the pull-out takes over
  [B(97), 540, 960, 1.02],             // "finally arrive"
  [A.payNow - 0.25, 540, 980, 1.10],   // "finally arrive"  PAY NOW
  [A.form + 0.40, 540, 870, 1.06],     // "payment screen."
  [B(105) + 0.10, 540, 640, 1.16],     // "details"
  [B(109), 540, 900, 1.12],            // "the"              PAY
  [A.tick, 540, 860, 1.06],
  [A.ok + 0.20, 540, 810, 1.02],
  [A.end, 540, 900, 1.00],
];
(() => {
  /* every violation, with its times — a re-measured read moves the whole table at once */
  const back = FOCUS2.map((k, i) => (i && k[0] < FOCUS2[i - 1][0]
    ? `key ${i} at ${k[0].toFixed(3)}s is before key ${i - 1} at ${FOCUS2[i - 1][0].toFixed(3)}s`
    : null)).filter(Boolean);
  if (back.length) throw new Error(`FOCUS2 runs backwards:\n    ${back.join('\n    ')}`);
})();
/* ── THE BREATH ────────────────────────────────────────────────────────────────────────────
   Holding the camera still is what lets a permission land, but a locked frame is a dead frame:
   the QA stillness metric went from 0.27 s to 0.55 s of no change at all the moment the holds
   were put in. So while we are inside the city the camera is never quite locked — an aperiodic
   drift of about ten screen-pixels a second, which is a tenth of what the eye registers as a
   move and enough that the image is alive under the machine that is running in it. It is off on
   the phone, where the surface is flat UI and a drifting frame would read as a wobble. */
const BREATH_A = 11;
const breath = (t: number) => ({
  x: breathe(t, 3, 0.30) * BREATH_A,
  y: breathe(t, 17, 0.26) * BREATH_A * 0.62,
  z: breathe(t, 41, 0.22) * 0.0045,
});
const track2 = makeTrack(register('act2', FOCUS2));
export function focus2(t: number) {
  const p = track2(t);
  const k = band(t, A.dive, A.dive + 1.6, A.out - 0.8, A.out + 0.2);
  const br = breath(t);
  return { x: p.x + br.x * k, y: p.y + br.y * k, z: p.z + br.z * k };
}

export const EYE = { cx: 488, cy: 178, rx: 612, ry: 250 };

const WALL_A2: WallState = {
  hit: 0, hitX: F.door.cx, wake: 0, ask: 0, press: 0, lit: 0, pulse: 1,
  boltL: 1, boltR: 1, fieldOff: 1, sink: 1, stow: 1,
};

/* ── THE DELIVERY ──────────────────────────────────────────────────────────────────────────
   Moves with holds between them, each eased on its own: a drone accelerates, cruises, slows and
   holds station. It flies THROUGH the doorway and climbs behind the wall to the roof — and then
   it goes. It is WhatsApp's courier; it brought a parcel; it has no business in the permissions
   and it used to be given one, which is why the old cut had the app's own request arriving by
   road freight. It leaves along the rooftops to the right, inside the wall it is already inside,
   shrinking as it goes, and it is clear of the tight deploy frame before the second segment is
   out. */
const HANG2 = 138 * DRONE_G;
const ROOF = { x: MAST.x, y: MAST.base - 52 };
/* ── THE FLIGHT, AS ONE PATH ───────────────────────────────────────────────────────────────
   It used to be five independent legs, each eased inOut, which means the drone came to a DEAD
   STOP at every waypoint and then sprinted to the next. The numbers were absurd: 0.34 s to cross
   the 40 units of the doorway, then 0.18 s to climb 716 — nearly 4 000 units/s — so the delivery
   read as a courier bolting for the roof rather than flying a load up to it.

   The waypoints are the same story beats; what changed is that they are now knots on ONE
   C1-continuous Hermite path. The tangent at each knot is the Catmull-Rom secant, and it is ZERO
   only where the flight genuinely stops: on station over the roof. Speed is continuous
   everywhere else, so the drone decelerates INTO the doorway, threads it, and climbs out of that
   same motion. */
type WP = { t: number; x: number; y: number; s: number; hold?: boolean };
const FLIGHT: WP[] = [
  { t: A.catch - 0.56, x: 1460, y: 760, s: 1.50 },        // in from the right, already moving
  { t: A.catch, x: 900, y: 1010, s: 1.15 },               // the hook takes the falling case
  { t: A.gate0, x: 790, y: 1042, s: 1.05 },               // slowing, lining up on the breach
  { t: A.gate1, x: 690, y: 1002, s: 0.95 },               // through it
  { t: A.roof - 0.44, x: 690, y: 300, s: 0.55, hold: true },   // station over the roof
  { t: A.away0, x: 690, y: 300, s: 0.55, hold: true },    // held while the case is lowered
  { t: A.away1, x: 1540, y: 206, s: 0.24 },               // and away along the rooftops
];
const flightAt = (t: number) => {
  const n = FLIGHT.length;
  let i = 0;
  while (i < n - 2 && t > FLIGHT[i + 1].t) i++;
  const p0 = FLIGHT[i], p1 = FLIGHT[i + 1];
  const h = p1.t - p0.t;
  const u = clamp01((t - p0.t) / h);
  /* the Catmull-Rom tangent at a knot, per unit time; zero where the flight is declared to stop */
  const tan = (k: number) => {
    const w = FLIGHT[k];
    if (w.hold) return { x: 0, y: 0, s: 0 };
    const a = FLIGHT[Math.max(0, k - 1)], b = FLIGHT[Math.min(n - 1, k + 1)];
    const dt = b.t - a.t || 1;
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt, s: (b.s - a.s) / dt };
  };
  const m0 = tan(i), m1 = tan(i + 1);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const at = (a: number, ma: number, b: number, mb: number) =>
    h00 * a + h10 * h * ma + h01 * b + h11 * h * mb;
  return {
    x: at(p0.x, m0.x, p1.x, m1.x),
    y: at(p0.y, m0.y, p1.y, m1.y),
    s: at(p0.s, m0.s, p1.s, m1.s),
  };
};
export function drone2At(t: number) {
  const tc = Math.max(FLIGHT[0].t, Math.min(FLIGHT[FLIGHT.length - 1].t, t));
  const p = flightAt(tc);
  const dt = 1 / 60;
  const a = flightAt(Math.max(FLIGHT[0].t, tc - dt)), b = flightAt(Math.min(FLIGHT[FLIGHT.length - 1].t, tc + dt));
  const vx = (b.x - a.x) / (2 * dt), vy = (b.y - a.y) / (2 * dt);
  /* it hangs on its rotors when it is not going anywhere, and leans into its own acceleration */
  const still = clamp01(1 - Math.hypot(vx, vy) / 180);
  const bob = (2.2 + 2.8 * still) * Math.sin(t * 5.0) + 2 * Math.sin(t * 2.1);
  const tilt = Math.max(-18, Math.min(18, vx * 0.022));
  const dip = t > A.catch && t < A.catch + 0.7 ? Math.exp(-(t - A.catch) * 5) * Math.sin((t - A.catch) * 15) * 20 : 0;
  return { x: p.x, y: p.y + bob + dip, s: p.s, tilt, swing: -tilt * 0.8 };
}
/** the tether: short while carrying, paid out to set the case down on the roof, then wound in */
export function tetherAt(t: number) {
  const L0 = A.roof - 0.40, L1 = A.roof;
  if (t < L0) return 86;
  if (t <= A.roof + 0.34) {
    const d = drone2At(L1);
    const full = (ROOF.y - d.y) / (d.s * DRONE_G) - 52;
    if (t <= L1) return lerp(86, full, ease.inOut(clamp01((t - L0) / (L1 - L0))));
    return lerp(full, 86, ease.inOut(clamp01((t - L1) / 0.34)));    // wound back in as it leaves
  }
  return 86;
}
/** the update's centre in q, in every state. It is never removed: once it is down, DeployMast
 *  draws the same case opening. */
export function payloadAt(t: number) {
  if (t < A.catch) {
    const u = clamp01((t - A.fall0) / (A.catch - A.fall0));
    const d = drone2At(A.catch);
    return { x: lerp(880, d.x, ease.out(u)), y: lerp(-420, d.y + HANG2 * d.s, ease.out(u)),
      s: lerp(1.9, d.s * DRONE_G, ease.out(u)), rot: (1 - u) * 90 };
  }
  if (t < A.roof) {
    const d = drone2At(t);
    /* as it is lowered it comes forward onto the building's own plane, so it arrives at the size
       the case actually is — the mast then opens out of exactly that object */
    const land = ease.inOut(clamp01((t - (A.roof - 0.40)) / 0.40));
    return { x: d.x, y: d.y + (tetherAt(t) + 52) * d.s * DRONE_G,
      s: lerp(d.s * DRONE_G, 1, land), rot: d.swing * (1 - land) };
  }
  return { x: ROOF.x, y: ROOF.y, s: 1, rot: 0 };
}

/** every grant, as one function of time */
export function grants(t: number) {
  return {
    sms: win(t, A.smsGrant, A.smsGrant + 0.5),
    call: win(t, A.callGrant, A.callGrant + 0.5),
    bg: win(t, A.bgGrant, A.bgGrant + 0.5),
    vpn: win(t, A.vpnGrant, A.vpnGrant + 0.5),
  };
}

/* ── THE ASK, AS A PICTURE ─────────────────────────────────────────────────────────────────
   Four wavefronts and four answers, every one of them a function of the same table. The carrier
   set at A.ping is uncoloured: it is the antenna clearing its throat, and it teaches the grammar
   one beat before the first coloured ring has to carry meaning. */
const Signals: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* the carrier: the antenna clearing its throat, one beat before the question itself */}
    {[0].map((k) => {
      const r = (t - A.ping) * OUT_SPEED;
      if (r <= 0 || r > 900) return null;
      return <Wavefront key={`c${k}`} cx={TIP.x} cy={TIP.y} r={r} col="#BFE9FF"
        k={0.40 * clamp01(1 - r / 900)} />;
    })}
    {/* AND THE QUESTION, ASKED OF THE WHOLE CITY AT ONCE. It does not stop at a building, because
        it is not addressed to one: it passes THROUGH each of them and each one answers by opening.
        It keeps going to the edge of the world, which is the point — everything within reach of
        this antenna has just been asked. */}
    {(() => {
      const r = (t - WAVE0) * OUT_SPEED;
      if (r <= 0 || r > 1800) return null;
      return <Wavefront cx={TIP.x} cy={TIP.y} r={r} col="#CFE6FF"
        k={0.95 * clamp01(r / 90) * clamp01(1 - (r - 900) / 800)} />;
    })()}
    {(CAP_ORDER as readonly Cap[]).map((c) => {
      const P = PERM[c];
      if (t < P.back0 || t > P.back1) return null;
      const u = ease.in(clamp01((t - P.back0) / (P.back1 - P.back0)));
      return <Backwash key={`b${c}`} cx={TIP.x} cy={TIP.y} r={lerp(P.dist, 16, u)} col={CAP_COL[c]}
        k={1} bearing={P.bearing} />;
    })}
    {/* THE KEY, in transit. Phase 1 rides the answer back along the radial; phase 2 rides the tip
        of the feeder the antenna is paying out to the machine that grant just bought. */}
    {(CAP_ORDER as readonly Cap[]).map((c) => {
      const P = PERM[c], end = P.down1 + 0.34;
      if (t < P.back0 || t > end) return null;
      const h = HATCH[c];
      let pos; let rot;
      if (t <= P.back1) {
        const u = ease.inOut(clamp01((t - P.back0) / (P.back1 - P.back0)));
        pos = { x: lerp(h.x, TIP.x, u), y: lerp(h.y, TIP.y, u) };
        rot = (Math.atan2(TIP.y - h.y, TIP.x - h.x) * 180) / Math.PI;
      } else {
        const u = ease.inOut(clamp01((t - P.down0) / (end - P.down0)));
        pos = feederPoint(FEED_FROM[c], FEED_TO[c], FEED_DROP[c], u);
        const nxt = feederPoint(FEED_FROM[c], FEED_TO[c], FEED_DROP[c], Math.min(1, u + 0.03));
        rot = (Math.atan2(nxt.y - pos.y, nxt.x - pos.x) * 180) / Math.PI;
      }
      const fade = clamp01((end - t) / 0.16);
      return (
        <g key={`k${c}`} transform={`translate(${pos.x} ${pos.y}) rotate(${rot})`} opacity={fade}>
          <GrantKey col={CAP_COL[c]} s={1} />
          <Light cx={0} cy={0} r={72} color={CAP_COL[c]} k={0.45} />
        </g>
      );
    })}
    {/* the arrival: the ring reaching a building is an EVENT at that building, not just a ring
        that happens to be passing through it */}
    {(CAP_ORDER as readonly Cap[]).map((c) => {
      const P = PERM[c];
      const u = clamp01((t - P.ask) / 0.34);
      if (u <= 0 || u >= 1) return null;
      return <Light key={`a${c}`} cx={HATCH[c].x} cy={HATCH[c].y} r={90 + u * 150} color={CAP_COL[c]}
        k={0.8 * (1 - u)} />;
    })}
  </g>
);

/* ── THE HAND, INSIDE ──────────────────────────────────────────────────────────────────────
   ONE MOVE PER GRANT, AND THE ONLY PLACE IT STOPS IS THE BUTTON.

   The hand used to fly in two legs with a "standoff" between them, and because both legs were
   eased inOut it came to a DEAD STOP at the junction. That junction sits on the boundary wall —
   so at every permission the fingertip arrived on the wall, paused there, and only then went up
   to the control. It read as a tap on the wall, then a second tap on the button.

   There is no standoff now. A trapezoidal speed profile — a short acceleration, a cruise, a long
   deceleration — carries the finger from off-frame to the button in one continuous move, with
   zero velocity only at the two ends. The path is a quadratic Bézier whose control point is
   chosen so the tip never loiters over the Play Store's portal on the way. */
const REST_Q = { x: 1500, y: 2000 };
const REST_QL = { x: -420, y: 2000 };
const target = (c: Cap) => askAt(HATCH[c].x, HATCH[c].y);

/** the move profile: ACC of the leg accelerating, DEC decelerating, cruise between. Velocity is
 *  zero at u=0 and u=1 and nowhere in between, which is the whole point. */
const ACC = 0.16, DEC = 0.52, VMAX = 1 / (1 - (ACC + DEC) / 2);
const glide = (u: number) => {
  const v = clamp01(u);
  if (v <= ACC) return (VMAX * v * v) / (2 * ACC);
  if (v <= 1 - DEC) return VMAX * (ACC / 2 + (v - ACC));
  const w = (v - (1 - DEC)) / DEC;
  return VMAX * (ACC / 2 + (1 - DEC - ACC)) + VMAX * DEC * (w - (w * w) / 2);
};
const bez = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, e: number) => {
  const m = 1 - e;
  return { x: m * m * a.x + 2 * m * e * c.x + e * e * b.x,
    y: m * m * a.y + 2 * m * e * c.y + e * e * b.y };
};
type Reach = { cap: Cap; from: { x: number; y: number }; via: { x: number; y: number };
  in: number; dwell: number; out: number };
const REACH: Reach[] = [
  { cap: 'sms', from: REST_QL, via: { x: -340, y: 900 }, in: 1.45, dwell: 0.16, out: 0.62 },
  /* the exchange stands directly behind the Play Store's portal, so this one's control point is
     pushed hard left: the tip stays outboard of the jamb until it is above the gate's head */
  { cap: 'call', from: REST_QL, via: { x: -300, y: 690 }, in: 1.42, dwell: 0.16, out: 0.60 },
  /* and this one hard RIGHT, for the same reason from the other side */
  { cap: 'bg', from: REST_QL, via: { x: 660, y: 1180 }, in: 1.45, dwell: 0.16, out: 0.58 },
  { cap: 'vpn', from: REST_Q, via: { x: 1360, y: 980 }, in: 1.45, dwell: 0.16, out: 0.66 },
];
const TAPS_Q = [A.smsGrant, A.callGrant, A.bgGrant, A.vpnGrant];
const leftHanded = (t: number) => t < A.bgGrant + 0.9;
export function handQ2(t: number) {
  for (const R of REACH) {
    const tp = CAP_T[R.cap].grant;
    const t0 = tp - R.in, t1 = tp + R.dwell, t2 = t1 + R.out;
    if (t < t0 || t > t2) continue;
    const e = t <= tp ? glide((t - t0) / R.in)
      : t <= t1 ? 1
        : 1 - glide((t - t1) / R.out);
    const pos = bez(R.from, R.via, target(R.cap), e);
    let press = 0;
    for (const x of TAPS_Q) {
      const d = t - x;
      if (d > -0.05 && d < 0.17) press = Math.max(press, Math.sin(clamp01((d + 0.05) / 0.22) * Math.PI));
    }
    return { tip: pos, bend: lerp(10, 24, e), press,
      side: leftHanded(t) ? ('left' as const) : ('right' as const) };
  }
  return null;
}

/* ── THE HAND, OUTSIDE ─────────────────────────────────────────────────────────────────────*/
const REST_P = { x: 1120, y: 1640 };
const PARK_P = { x: 985, y: 1515 };
const P_UPDATE = { x: SCREEN.x + 30 + (SCREEN.w - 60) - 28 - 134, y: CARD_Y + 348 };
const P_PAYNOW = { x: 540, y: TOP + 547 };
const P_FIELD = { x: 470, y: TOP + 174 };
const P_PAY = { x: 540, y: TOP + 527 };
/* the OUTSIDE hand keeps the leg model: on the phone there is no wall to be misread as a target,
   and the taps are a sequence on one surface rather than four reaches into a city. */
type Leg = { t0: number; t1: number; a: { x: number; y: number }; b: { x: number; y: number };
  bow: number; b0: number; b1: number };
const LEGS_P: Leg[] = [
  /* THE FIRST PRESS ON PAY NOW. Same button, same target, same finger as the one after the
     permissions — that repetition IS the point: the first press buys an update, the second one
     buys a payment screen, and the viewer has to recognise the second as the same act. */
  { t0: A.payTap - 0.80, t1: A.payTap, a: REST_P, b: P_PAYNOW, bow: -112, b0: 10, b1: 24 },
  { t0: A.payTap + 0.16, t1: A.payTap + 0.74, a: P_PAYNOW, b: REST_P, bow: -66, b0: 24, b1: 10 },
  { t0: A.tapUpdate - 0.85, t1: A.tapUpdate, a: REST_P, b: P_UPDATE, bow: -120, b0: 10, b1: 24 },
  { t0: A.tapUpdate + 0.16, t1: A.tapUpdate + 0.80, a: P_UPDATE, b: REST_P, bow: -70, b0: 24, b1: 10 },
  { t0: A.payNow - 0.80, t1: A.payNow, a: REST_P, b: P_PAYNOW, bow: -110, b0: 10, b1: 24 },
  { t0: A.payNow + 0.18, t1: A.payNow + 1.10, a: P_PAYNOW, b: PARK_P, bow: -60, b0: 24, b1: 12 },
  { t0: A.fieldTap - 0.62, t1: A.fieldTap, a: PARK_P, b: P_FIELD, bow: -95, b0: 12, b1: 22 },
  { t0: A.fieldTap + 0.18, t1: A.pay, a: P_FIELD, b: P_PAY, bow: -70, b0: 22, b1: 24 },
  { t0: A.pay + 0.18, t1: A.pay + 0.95, a: P_PAY, b: REST_P, bow: -80, b0: 24, b1: 10 },
];
const TAPS_P = [A.payTap, A.tapUpdate, A.payNow, A.fieldTap, A.pay];
export function handP2(t: number) {
  const on = (t > A.payTap - 0.85 && t < A.payTap + 0.76)
    || (t > A.tapUpdate - 0.9 && t < A.tapUpdate + 0.8)
    || (t > A.payNow - 0.85 && t < A.pay + 0.95);
  if (!on) return null;
  let pos = REST_P, bend = 10;
  for (const L of LEGS_P) {
    if (t >= L.t0) {
      const u = clamp01((t - L.t0) / (L.t1 - L.t0));
      const e = ease.inOut(u);
      pos = { x: lerp(L.a.x, L.b.x, e), y: lerp(L.a.y, L.b.y, e) + Math.sin(u * Math.PI) * L.bow };
      bend = lerp(L.b0, L.b1, e);
    }
  }
  let press = 0;
  for (const tp of TAPS_P) {
    const d = t - tp;
    if (d > -0.05 && d < 0.17) press = Math.max(press, Math.sin(clamp01((d + 0.05) / 0.22) * Math.PI));
  }
  return { tip: pos, bend, press };
}

/* ── THE INTERIOR ─────────────────────────────────────────────────────────────────────────*/
/** WHAT ACT 3 CHANGES ABOUT THIS CITY, and nothing else. The interior is ONE component for the
 *  whole film — a second copy of it would drift from this one the way the two layout tables did
 *  (rule: two layout tables drift) — so the reveal and the theft reach in through this prop rather
 *  than rebuilding the city they inherit. */
export type Act3Over = { beam?: number; feedDir?: number; look?: { x: number; y: number };
  latch?: number;
  /** act 3 sinks the office's front into its plinth and draws what is behind it */
  front?: number; shell?: number; spine?: number;
  /** act 4 re-lights each granted hatch as the recap names it, and CLOSES the breach */
  flare?: Partial<Record<Cap, number>>;
  wall?: Partial<WallState> };
export const Inside2: React.FC<{ t: number; a3?: Act3Over }> = ({ t, a3 }) => {
  const d = drone2At(t);
  const pay = payloadAt(t);
  const flying = t > FLIGHT[0].t && t < FLIGHT[FLIGHT.length - 1].t + 0.1;
  const behind = t > A.gate0 + 0.22;
  const deploy = win(t, A.deploy0, A.deploy1);
  const hand = handQ2(t);
  /* EVERY ORGAN IS A FUNCTION OF THE SAME TABLE: the answer lands, runs down the tower, and the
     apparatus that answer pays for is built. The feeder follows it out and stays. */
  const org = (c: Cap) => win(t, PERM[c].grow0, PERM[c].grow1);
  /* the cable is paid out at exactly the rate the key travels it: the key is at its tip */
  const fed = (c: Cap) => win(t, PERM[c].down0, PERM[c].down1 + 0.34);
  const feeders = { sms: fed('sms'), call: fed('call'), bg: fed('bg'), vpn: fed('vpn') };
  const mastPulse = (() => {
    for (const c of CAP_ORDER as readonly Cap[]) {
      const P = PERM[c];
      if (t >= P.down0 && t <= P.down1) return { cap: c, k: (t - P.down0) / (P.down1 - P.down0) };
    }
    return null;
  })();
  /* THE EYE. Its iris and the medallion's iris are the same object at two sizes, so they open
     together and they look in the same direction. */
  const eye = org('bg');
  const rec = win(t, PERM.bg.grow0 + 0.62, PERM.bg.grow1);
  /* THE EYE WATCHES THE ACT, in act 2 as in act 3: the target is this act's own camera centre,
     which is the permission being asked, and while the picture is on the phone it watches the
     antenna's head — the thing in the city that is actually doing something. Act 3 hands its own
     target down through `a3.look`. */
  const look = a3?.look ?? gaze(t, (s) => (cam2(s).dz < 0.55
    ? { x: TIP.x, y: TIP.y } : { x: focus2(s).x, y: focus2(s).y }), EYE);
  const sleep = win(t, PERM.bg.grow0, PERM.bg.grow1);
  const takeover = win(t, PERM.bg.grow0 + 0.20, PERM.bg.grow1 + 0.40);
  const satRise = win(t, PERM.vpn.grow0, PERM.vpn.grow1);
  const tileEl = t < A.deploy0 + 0.02 ? (
    <g transform={`translate(${pay.x} ${pay.y}) rotate(${pay.rot}) scale(${pay.s})`}>
      <UpdateTile glow={0.5} />
    </g>
  ) : null;
  const droneEl = flying ? (
    <Drone x={d.x} y={d.y} s={d.s} tilt={d.tilt} t={t} swing={d.swing} line={tetherAt(t)}
      carry={tetherAt(t) > 92} led={1}
      body={C.cobalt} bodyDark="#24408F" rig="#1B2C5E"
      mark={<g transform="translate(0 -11)"><circle r={9} fill="none" stroke={C.cobalt} strokeWidth={3} />
        <path d="M-5 2 L0 -5 L5 2" fill="none" stroke={C.cobalt} strokeWidth={3} strokeLinejoin="round" /></g>} />
  ) : null;
  return (
    <g>
      <Sky3 t={t} />
      {/* BEHIND THE CITY, because that is what "in the background" means. The lids are the night
          itself; what is inside them is the icon off the home screen, at a size that makes the
          skyline something being looked at. */}
      <WatchEye cx={EYE.cx} cy={EYE.cy} rx={EYE.rx} ry={EYE.ry} open={eye} rec={rec} look={look} />
      {/* WHY THE SKY OPENS. The medallion on the pediment and the iris behind the city are one
          object at two sizes, and for the half second the lids are parting there is a column of
          light between them saying so. Without it a blind read said the eye "was retconned into
          the background" — it had no cause anywhere on screen. */}
      {(() => {
        const k = Math.sin(clamp01(win(t, PERM.bg.grow0 - 0.06, PERM.bg.grow0 + 0.86)) * Math.PI);
        if (k <= 0.01) return null;
        return (
          <g opacity={k * 0.5}>
            <path d={`M${MNT.seal.x - 26} ${MNT.seal.y} L${EYE.cx - 150} ${EYE.cy}
                      L${EYE.cx + 150} ${EYE.cy} L${MNT.seal.x + 26} ${MNT.seal.y} Z`}
              fill={CAP_COL.bg} opacity={0.16} />
            <Light cx={MNT.seal.x} cy={MNT.seal.y} r={210} color="#FFD9A0" k={0.55} />
          </g>
        );
      })()}
      <City3 t={t} takeover={takeover} />
      {/* the city goes quiet under it: one dark radial settles over everything that is not the
          thing on the roof. Silent, uniform, everywhere — never a second focal point. */}
      {sleep > 0.01 && (
        <g opacity={sleep}>
          <defs>
            <radialGradient id="a2sleep" gradientUnits="userSpaceOnUse" cx={MAST.x} cy={640} r={780}>
              <stop offset="0" stopColor="#050A1C" stopOpacity="0" />
              <stop offset="0.5" stopColor="#050A1C" stopOpacity="0.24" />
              <stop offset="1" stopColor="#050A1C" stopOpacity="0.50" />
            </radialGradient>
          </defs>
          <rect x={-700} y={-700} width={W + 1400} height={F.ground + 700} fill="url(#a2sleep)" />
        </g>
      )}
      {/* ── THE SATELLITE STANDS BEHIND THE BUILDING. Drawn before the office on purpose: the
            foot of its stem is hidden by the pediment's slope, which is what a mast on a roof
            looks like from the street, and it is what lets this one stand in clear air instead
            of on the ledge between the antenna and the line tap. */}
      <Satellite x={MNT.vpn.x} groundY={MNT.vpn.y} rise={satRise}
        beam={a3?.beam ?? win(t, A.satBeam, A.satBeam + 0.6)} t={t} s={1.12} climb={250} />
      {/* THE SHELL, when act 3 takes the front off. Drawn HERE — behind the office and in front of
          the sky — because it is the inside of this building, not a second place: the plinth it
          sinks into, the service spine and the entablature all draw over it. */}
      {(a3?.shell ?? 0) > 0.002 && <Shell t={t} lamp={1} open={a3!.shell!} />}
      <Office3 x={PLOT3.cx} base={F.court} s={OFFICE_S} build={1} t={t} spine={a3?.spine ?? 0}
        latch={a3?.latch ?? 0}
        eye={eye} rec={rec} front={a3?.front ?? 0} />
      <SatHatch x={MNT.vpnRoof.x} y={MNT.vpnRoof.y}
        open={win(t, PERM.vpn.grow0, PERM.vpn.grow0 + 0.16)} />
      {/* ── THE APPARATUS, on the building's own cornice: the mail hoist on the left corner, the
            antenna on the apex between them, and the line tap on the right. */}
      <MailHoist x={MNT.sms.x} y={MNT.sms.y} duct={MNT.duct} grow={org('sms')}
        run={win(t, PERM.sms.grow1 - 0.34, PERM.sms.grow1 - 0.02)} t={t} />
      <CallTap x={MNT.call.x} y={MNT.call.y} grow={org('call')} live={win(t, PERM.call.grow1 - 0.34, PERM.call.grow1 - 0.02)} t={t} />
      {behind && droneEl}
      {behind && tileEl}
      {t >= A.deploy0 && <DeployMast x={MAST.x} baseY={MAST.base} deploy={deploy} t={t}
        feeders={feeders} pulse={mastPulse} ports={win(t, A.deploy1 - 0.04, A.ping)} />}
      {/* WHAT THE ANTENNA KEEPS: one feeder per grant, from the head to the thing it now drives */}
      {(CAP_ORDER as readonly Cap[]).map((c) => (
        <Feeder key={c} from={FEED_FROM[c]} to={FEED_TO[c]} col={CAP_COL[c]} grow={feeders[c]} t={t}
          phase={CAP_ORDER.indexOf(c) * 0.27} drop={FEED_DROP[c]} dir={a3?.feedDir ?? 1} />
      ))}
      <Signals t={t} />
      <Wall3 s={a3?.wall ? { ...WALL_A2, ...a3.wall } : WALL_A2} t={t} />
      <PlayGate t={t} k={0.55} />
      <Plaza t={t} spill={1} />
      {!behind && droneEl}
      {!behind && tileEl}
      {/* EVERY PERMISSION IS ASKED FOR ON THE BUILDING IT OPENS, in the boundary wall's own
          grammar — and it is asked THE INSTANT the wavefront reaches it, not before. A granted
          hatch STAYS open: the city accumulates its breaches. */}
      {(CAP_ORDER as readonly Cap[]).map((c) => {
        const h = HATCH[c], k = PERM[c];   // ask = when the wave arrived; grant = the word
        return (
          <GrantHatch key={c} x={h.x} y={h.y} cap={c} t={t}
            /* LINEAR, not win(). win() is ease.out — it spends 70% of the window in its first
               third, so the five build stages all landed inside 0.2 s and the hatch still
               effectively popped. A construction sequence gets a construction clock. */
            on={clamp01((t - (k.ask - 0.04)) / 0.62)}
            ask={band(t, k.ask + 0.52, k.ask + 0.72, k.grant - 0.08, k.grant)}
            press={band(t, k.grant - 0.05, k.grant, k.grant + 0.1, k.grant + 0.24)}
            lit={win(t, k.grant, k.grant + 0.12)}
            glow={Math.max(win(t, k.grant, k.grant + 0.12), a3?.flare?.[c] ?? 0)}
            retire={win(t, k.grant + 0.85, k.grant + 1.35)}
            content={hatchContent(c, t)} />
        );
      })}
      {hand && (
        <Hand tip={hand.tip} hand={hand.side} fw={30} bend={hand.bend} press={hand.press}
          from={hand.side === 'left' ? { x: -600, y: 2170 } : { x: 1700, y: 2170 }} />
      )}
    </g>
  );
};

/* ── WHAT IS UNDER THE GLASS DURING THE PAYMENT ───────────────────────────────────────────*/
export const Undercurrent: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0.01) return null;
  const y0 = TOP + 668, y1 = SCREEN.y + SCREEN.h - 10;
  const vp = { x: SCREEN.x + SCREEN.w / 2, y: y1 + 120 };
  const caps = (['sms', 'call', 'bg', 'vpn'] as const);
  return (
    <g opacity={k}>
      {caps.map((c, i) => {
        const x0 = SCREEN.x + 40 + i * ((SCREEN.w - 80) / 3);
        const d = `M${x0} ${y0} Q${x0} ${(y0 + vp.y) / 2} ${vp.x} ${vp.y}`;
        return (
          <g key={c}>
            <path d={d} fill="none" stroke={CAP_COL[c]} strokeWidth={2.6} opacity={0.24} />
            {[0, 1].map((n) => {
              const u = ((t * 0.16 + n * 0.5 + i * 0.13) % 1);
              const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * x0 + u * u * vp.x;
              const py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * ((y0 + vp.y) / 2) + u * u * vp.y;
              return <circle key={n} cx={px} cy={py} r={4.2} fill={CAP_COL[c]} opacity={0.46 * Math.sin(u * Math.PI)} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/* ── THE PHONE'S SCREEN, by time ───────────────────────────────────────────────────────────*/
const Screen2: React.FC<{ t: number }> = ({ t }) => {
  const p = pov2(t);
  const iris = win(t, A.tapUpdate + 0.06, A.dive + 0.95);
  const closing = win(t, A.out + 0.15, A.out + 0.90);
  const irisR = (ease.in(iris) * 1500 + 1) * (1 - ease.inOut(closing));
  const inside = t > A.tapUpdate + 0.02 && closing < 0.999;
  const barK = Math.max(1 - ease.in(iris), ease.out(clamp01((closing - 0.3) / 0.45)));
  const SC = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };
  const ix = lerp(P_UPDATE.x, SC.x, ease.inOut(closing));
  const iy = lerp(P_UPDATE.y, SC.y, ease.inOut(closing));
  const cardUp = win(t, A.cardUp, A.cardUp + 0.55);
  const cardGone = win(t, A.tapUpdate + 0.10, A.tapUpdate + 0.45);
  const form = win(t, A.form, A.form + 0.6);
  const success = win(t, A.ok - 0.02, A.ok + 0.5);
  const typed = clamp01((t - A.typed0) / (A.typed1 - A.typed0));
  return (
    <g>
      {form < 0.999 && (
        <g>
          <EchallanApp detail={1} amount={1} cta={1}
            ctaPress={Math.max(band(t, A.payTap - 0.05, A.payTap, A.payTap + 0.1, A.payTap + 0.24),
              band(t, A.payNow - 0.05, A.payNow, A.payNow + 0.1, A.payNow + 0.24))} />
          <Undercurrent t={t} k={0.55 * win(t, A.out + 0.5, A.out + 1.3)} />
          {cardUp > 0.002 && cardGone < 0.999 && (
            <g opacity={1 - cardGone} transform={`translate(0 ${(1 - cardUp) * 420 + cardGone * 40})`}>
              <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#0A1020"
                opacity={0.34 * cardUp} />
              <UpdateCard y={CARD_Y} rim={cardUp}
                press={band(t, A.tapUpdate - 0.05, A.tapUpdate, A.tapUpdate + 0.1, A.tapUpdate + 0.24)} />
            </g>
          )}
        </g>
      )}
      {form > 0.002 && success < 0.999 && (
        <g transform={`translate(0 ${(1 - form) * 520})`}>
          <PaymentForm typed={typed} caret={(t * 2) % 1 > 0.5 ? 1 : 0}
            press={band(t, A.pay - 0.05, A.pay, A.pay + 0.1, A.pay + 0.24)} />
          <Undercurrent t={t} k={0.5} />
        </g>
      )}
      {success > 0.002 && (
        <g>
          <PaymentSuccess draw={win(t, A.tick, A.ok)} settle={win(t, A.ok + 0.05, A.ok + 0.5)} />
          <Undercurrent t={t} k={0.42} />
        </g>
      )}
      {/* the update goes INTO the glass at the point the finger touched — and it is the same
          object that falls through on the other side */}
      {(() => {
        const k = win(t, A.tapUpdate + 0.04, A.tapUpdate + 0.34);
        if (k <= 0.002 || k >= 0.999) return null;
        const from = { x: SCREEN.x + SCREEN.w / 2, y: CARD_Y + 96 };
        const e = ease.in(k);
        return (
          <g transform={`translate(${lerp(from.x, P_UPDATE.x, e)} ${lerp(from.y, P_UPDATE.y, e)})
                         scale(${lerp(0.62, 0.05, e)}) rotate(${e * 40})`}>
            <UpdateTile />
          </g>
        );
      })()}
      {iris > 0.001 && inside && (
        <g clipPath="url(#a2iris)">
          <defs><clipPath id="a2iris"><circle cx={ix} cy={iy} r={irisR} /></clipPath></defs>
          <g transform={`translate(${SCREEN.x} ${LC.y - 960 * K}) scale(${K})`}>
            <Inside2 t={t} />
          </g>
        </g>
      )}
      {closing > 0.01 && closing < 0.99 && (
        <circle cx={ix} cy={iy} r={irisR} fill="none" stroke="#63E6FF" strokeWidth={5}
          opacity={0.5 * Math.sin(closing * Math.PI)} />
      )}
      {barK > 0.01 && (
        <g opacity={barK}>
          <StatusBar tint={t > A.form ? '#C3D0E6' : '#B7C8E6'} label="10:43" />
        </g>
      )}
    </g>
  );
};

/* ── TAP QA ────────────────────────────────────────────────────────────────────────────────*/
/** the Play Store's portal, with a margin. No reach into the city may put a fingertip inside it:
 *  a finger that appears to be pressing the store is the one thing this whole film says the
 *  victim did NOT do. taps.mjs walks each approach and fails on any frame inside this box. */
export const NO_TOUCH = { x0: 52, y0: 730, x1: 288, y1: 1248 };
export const CONTACTS2 = [
  { name: 'PAY NOW (1st)', t: A.payTap, space: 'phone', tip: (t: number) => handP2(t)?.tip, target: () => P_PAYNOW },
  { name: 'INSTALL UPDATE', t: A.tapUpdate, space: 'phone', tip: (t: number) => handP2(t)?.tip, target: () => P_UPDATE },
  { name: 'allow SMS', t: A.smsGrant, space: 'inside', approach: true, avoid: NO_TOUCH, tip: (t: number) => handQ2(t)?.tip, target: () => target('sms') },
  { name: 'allow calls', t: A.callGrant, space: 'inside', approach: true, avoid: NO_TOUCH, tip: (t: number) => handQ2(t)?.tip, target: () => target('call') },
  { name: 'allow background', t: A.bgGrant, space: 'inside', approach: true, avoid: NO_TOUCH, tip: (t: number) => handQ2(t)?.tip, target: () => target('bg') },
  { name: 'allow VPN', t: A.vpnGrant, space: 'inside', approach: true, avoid: NO_TOUCH, tip: (t: number) => handQ2(t)?.tip, target: () => target('vpn') },
  { name: 'PAY NOW', t: A.payNow, space: 'phone', tip: (t: number) => handP2(t)?.tip, target: () => P_PAYNOW },
  { name: 'card field', t: A.fieldTap, space: 'phone', tip: (t: number) => handP2(t)?.tip, target: () => P_FIELD },
  { name: 'PAY ₹1,000', t: A.pay, space: 'phone', tip: (t: number) => handP2(t)?.tip, target: () => P_PAY },
];

/* ── ASSEMBLY ──────────────────────────────────────────────────────────────────────────────*/
export const Act2: React.FC<{ t: number }> = ({ t }) => {
  const p = pov2(t);
  const fc = focus2(t);
  const hand = handP2(t);
  const inside = p.dz > 0.98;
  return (
    <g transform={`translate(540 960) scale(${fc.z}) translate(${-fc.x} ${-fc.y})`}>
      {!inside && (
        <g transform={`translate(540 ${960 + 430}) scale(1.10) translate(-540 -960)`}>
          <City t={t} />
        </g>
      )}
      <g transform={povT2(t)}>
        {p.dz > 0.97 ? (
          <Screen2 t={t} />
        ) : (
          <>
            <PhoneShell screenBase="#E9EEF7"><Screen2 t={t} /></PhoneShell>
            <PhoneFurniture />
          </>
        )}
        {hand && p.dz < 0.5 && (
          <Hand tip={hand.tip} from={{ x: 1286, y: 1664 }} hand="right" fw={26}
            bend={hand.bend} press={hand.press} />
        )}
      </g>
    </g>
  );
};

export const ACT2_END = A.end;

/* ── SOUND CUES ────────────────────────────────────────────────────────────────────────────*/
export const CUES2 = {
  A, PERM,
  grants: [A.smsGrant, A.callGrant, A.bgGrant, A.vpnGrant],
  caps: ['sms', 'call', 'bg', 'vpn'],
};
