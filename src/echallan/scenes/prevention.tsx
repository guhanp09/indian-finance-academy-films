/* PHASES 13-14 · PREVENTION AND SAFE VERIFICATION   (blocks 193-221, 111.3-128.3 s)
 *
 * The strongest prevention visual is BEHAVIOURAL (addendum §55). Earlier in this film a finger
 * approached the attachment and tapped it. Here the same finger, on the same path, approaches the
 * same attachment — and turns away. That reversal is the lesson; the red X is only its punctuation,
 * and it is confined to the forbidden route rather than thrown over the frame.
 *
 * The ending is a MEMORY IMAGE (§56): the suspicious message small in the background with its
 * attachment crossed out, and the independent verification the viewer drove themselves in front.
 * Nothing moves fast, nothing new is introduced, and the last thing on screen is the action to
 * take rather than the thing to fear.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, S, SCREEN, STATUS_H, band, clamp01, ease, ground, impact, lerp, mix, win,
  winOut,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { Grown, Label, Plate, Solid, recede } from '../world/kit';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import {
  ApkTile, Bubble, CHALLAN_H, ChallanDoc, ChatFurniture, ChatHeader,
} from '../world/chat';
import { Browser } from '../world/screens';
import { Hand, approach } from '../world/hand';

const CX = SCREEN.x + SCREEN.w / 2;
const BX = SCREEN.x + 16, BW = SCREEN.w - 64;
const BH = 16 + CHALLAN_H + 12 + 96 + 34;
const BY = SCREEN.y + SCREEN.h - 118 - BH;
const TILE_Y = BY + 16 + CHALLAN_H + 12;
const REST = { x: CX + 40, y: H + 300 };
const FROM = { x: SCREEN.x + SCREEN.w + 220, y: H + 420 };

const Screen: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  const chatIn = win(t, CUE.messageReturns - 0.4, CUE.messageReturns + 0.3);
  /* the browser slides in over the chat — an app switch, and the chat stays behind it */
  const web = win(t, CUE.browserGrows - 0.2, CUE.browserGrows + 0.55);

  /* two strokes, drawn, with the tile taking each one */
  const x1 = win(t, CUE.xStroke1, CUE.xStroke1 + 0.26);
  const x2 = win(t, CUE.xStroke2, CUE.xStroke2 + 0.26);
  const tx = BX + 16, ty = TILE_Y, tw = BW - 32, th = 96;
  const kick = impact(f, CUE.xStroke1 * FPS, 3.2, 7, 11) + impact(f, CUE.xStroke2 * FPS, 3.4, 7, 11);

  return (
    <g>
      <g opacity={chatIn * (1 - Math.max(0, Math.min(1, (web - 0.55) / 0.3)))}
        transform={`translate(${-web * SCREEN.w * 0.34} 0)`}>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill={C.chatBg} />
        <ChatFurniture notice={1} />
        <Bubble x={BX} y={BY} w={BW} h={BH}>
          <ChallanDoc x={BX + 16} y={BY + 16} w={BW - 32} />
        </Bubble>
        <g transform={`translate(${kick * 0.4} ${kick})`}>
          <ApkTile x={tx} y={ty} w={tw} pkg={1} />
          {/* the X is on the ATTACHMENT, not on the message: the notice is not the crime */}
          <Grown d={`M${tx + 22} ${ty + 18} L${tx + tw - 22} ${ty + th - 18}`}
            len={Math.hypot(tw - 44, th - 36)} p={x1} stroke={C.red} width={9} />
          <Grown d={`M${tx + tw - 22} ${ty + 18} L${tx + 22} ${ty + th - 18}`}
            len={Math.hypot(tw - 44, th - 36)} p={x2} stroke={C.red} width={9} />
        </g>
        <ChatHeader />
      </g>

      {web > 0.002 && (
        <g transform={`translate(${(1 - ease.out(web)) * SCREEN.w} 0)`}>
          <Browser
            typed={win(t, CUE.browserGrows + 0.25, CUE.portalLands)}
            loaded={win(t, CUE.portalLands, CUE.portalLands + 0.4)}
            looked={win(t, CUE.lookup, CUE.verified - 0.35)}
            verified={win(t, CUE.verified, CUE.verified + 0.7)}
            state={win(t, CUE.stateRoute, CUE.stateRoute + 0.5)} />
        </g>
      )}
      <StatusBar tint={web > 0.5 ? '#6E7C99' : '#C3D0E6'} label="10:56" />
    </g>
  );
};

/* ── THE REVERSAL ───────────────────────────────────────────────────────────────────────────
   The same approach as at 13 s, to the same object — and then the finger turns away and goes to
   the browser instead. It is one continuous move, not two. */
function handAt(t: number) {
  const tile = { x: BX + 132, y: TILE_Y + 46 };
  const a = paced(CUE.safeRouteShown, CUE.fingerRedirects, 1.4);
  const inP = clamp01((t - a.from) / a.span);
  /* THE REVERSAL. The approach stops at 66% — short of contact — hesitates, and then withdraws.
     It does not travel on to another control: dragging a forearm across the device to reach the
     URL bar hides the very thing the shot is about. The person simply does not tap it. */
  const hold = band(t, CUE.fingerRedirects - 0.30, CUE.fingerRedirects - 0.05,
    CUE.fingerRedirects + 0.10, CUE.fingerRedirects + 0.22);
  const turn = ease.in(clamp01((t - (CUE.fingerRedirects + 0.10)) / 0.70));
  if (inP <= 0.001 || turn >= 0.999) return null;
  const reach = Math.min(0.66, inP) * (1 - turn);
  const tip = approach(REST, tile, reach, 130);
  /* the withdrawal curves AWAY to the right rather than retracing exactly — a decision, not a
     rewind */
  return { tip: { x: tip.x + turn * 190, y: tip.y + turn * 120 }, fw: 30, press: 0,
    hesitate: hold };
}

export const PrevDevice: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <PhoneShell screenBase={C.chatBg}><Screen t={t} /></PhoneShell>
        <PhoneFurniture />
      </g>
    );
  };

export const PrevHand: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const h = handAt(t);
    if (!h) return null;
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <Hand tip={h.tip} from={FROM} hand="right" fw={h.fw} bend={14} press={h.press} />
      </g>
    );
  };

/* ── THE GHOST CHAIN RETRACTS ───────────────────────────────────────────────────────────────
   The whole attack path is still behind the message, faint. It withdraws BACKWARD — endpoint,
   code, permissions, update, package — and each segment loses its colour as it goes, which is
   what "disabling the chain at its source" looks like. */
/* the message, reduced to a token and stood beside the device: RECEIVED FILE = NO. It is the same
   notice and the same crossed-out attachment, at a quarter size, and it does not move again. */
export const MemoryImage: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(t);
  const p = win(t, CUE.browserGrows + 0.35, CUE.portalLands + 0.2);
  if (p <= 0.004) return null;
  const w = 268, x = 74, y = 1236;
  return (
    <g transform={`translate(0 ${(1 - ease.out(p)) * 90})`} opacity={p}>
      <Solid x={x - 18} y={y - 24} w={w + 36} h={352} r={20}
        base={recede('#1A2440', g.deep, 0.16)} litK={0.10} shadeK={0.2} elevation={8} />
      <ChallanDoc x={x} y={y} w={w} />
      <g transform={`translate(${x} ${y + 218})`}>
        <ApkTile x={0} y={0} w={w} pkg={1} name={1} />
        <path d={`M14 12 L${w - 14} 72 M${w - 14} 12 L14 72`} stroke={C.red} strokeWidth={7}
          strokeLinecap="round" />
      </g>
      <Label x={x + w / 2} y={y + 360} size={22} fill={recede(C.red, g.deep, 0.10)} weight={800}
        anchor="middle" track={1.6}>DO NOT INSTALL</Label>
    </g>
  );
};

export const Ghost: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(t);
  const show = band(t, CUE.messageReturns - 0.2, CUE.messageReturns + 0.5,
    CUE.ghostRetracts, CUE.ghostRetracts + 1.1);
  if (show <= 0.004) return null;
  const retract = win(t, CUE.ghostRetracts, CUE.ghostRetracts + 1.0);
  const N = 6;
  const pts: [number, number][] = [
    [176, 1546], [330, 1408], [500, 1500], [672, 1372], [838, 1470], [986, 1330],
  ];
  return (
    <g opacity={show}>
      {pts.map((p, i) => {
        if (i === 0) return null;
        const a = pts[i - 1];
        /* the LAST segment goes first — the chain is disabled from its far end back */
        const k = clamp01((retract - (N - 1 - i) * 0.14) / 0.3);
        const len = Math.hypot(p[0] - a[0], p[1] - a[1]);
        return (
          <path key={i} d={`M${a[0]} ${a[1]} L${p[0]} ${p[1]}`} fill="none"
            stroke={mix(recede(C.red, g.deep, 0.42), g.deep, k)} strokeWidth={S.secondary}
            strokeLinecap="round" strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len * k} />
        );
      })}
      {pts.map((p, i) => {
        const k = clamp01((retract - (N - 1 - i) * 0.14) / 0.3);
        return <circle key={`n${i}`} cx={p[0]} cy={p[1]} r={9 * (1 - k)}
          fill={recede(C.red, g.deep, 0.34)} />;
      })}
    </g>
  );
};
