/* PHASES 1-4 · HOOK -> ATTACHMENT -> BARRIER -> FIRST APP   (blocks 0-55, 0.0-31.4 s)
 *
 * ONE OBJECT runs through all of it, and that is the point: the attachment the scammer sends is
 * the same tile the finger taps, the same package the barrier blocks, the same package that
 * travels the install rail, the same icon that docks in the grid, and the same mark that becomes
 * the service's header. It is never faded out and replaced
 * (rule: object permanence in transitions). `pkg()` is that object's entire journey.
 *
 * Nothing here warns. premortem F13: the hook must be CREDIBLE or the reveal at 65 s has nothing
 * to reveal. There is no red and no label anywhere in this file — the amber on the system warning
 * is Android's own, and it is an icon, not a siren.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, S, SCREEN, STATUS_H, W, band, clamp01, ease, ground, impact, lerp, mix, win, winOut,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { Label, Solid, shade } from '../world/kit';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { ApkTile, Bubble, CHALLAN_H, ChallanDoc, ChatFurniture, ChatHeader } from '../world/chat';
import { RoadWorld } from '../world/road';
import { AppIcon, InstallSourceSheet, InstallerPanel } from '../world/system';
import { EchallanApp } from '../world/screens';
import { Hand, approach } from '../world/hand';

const CX = SCREEN.x + SCREEN.w / 2;
const CY = SCREEN.y + SCREEN.h / 2;
const BX = SCREEN.x + 16, BW = SCREEN.w - 64;
const BH = 16 + CHALLAN_H + 12 + 96 + 34;
const BY = SCREEN.y + SCREEN.h - 118 - BH;
const TILE_Y = BY + 16 + CHALLAN_H + 12;

const SYS_X = CX - 62, SYS_Y = SCREEN.y + 232;
const BARRIER_Y = SCREEN.y + 316;
const SHEET_Y = SCREEN.y + 392;
/* exit travel: far enough that nothing is ever unmounted while still visible */
const EXIT = SCREEN.h + 60;
const RAIL_Y = SCREEN.y + 470;
const GRID_X = SCREEN.x + 96, GRID_Y = SCREEN.y + 762;

/* ── THE PACKAGE'S JOURNEY — one object, five stations, no cuts ─────────────────────────────*/
export function pkg(t: number) {
  const lift = win(t, CUE.tileLift, CUE.tileLift + 0.55);
  const toSys = win(t, CUE.systemRise, CUE.systemRise + 0.85);
  const blocked = band(t, CUE.packageBlocked, CUE.packageBlocked + 0.18,
    CUE.barrierOpens, CUE.barrierOpens + 0.26);
  const through = win(t, CUE.installerIn - 0.05, CUE.installerIn + 0.45);
  const rail = win(t, CUE.installProgress + 0.25, CUE.iconAssembles + 0.35);
  const becomeIcon = win(t, CUE.iconAssembles, CUE.iconDocks);
  const forward = win(t, CUE.iconForward, CUE.appOpens);

  let x = BX + 16, y = TILE_Y - lift * 8, scale = 1, form = 0;
  if (toSys > 0) {
    x = lerp(BX + 16, SYS_X, ease.inOut(toSys));
    y = lerp(TILE_Y - 8, SYS_Y, ease.inOut(toSys));
    scale = lerp(1, 0.74, ease.inOut(toSys));
    form = toSys;
  }
  if (through > 0) y = lerp(SYS_Y, RAIL_Y, ease.inOut(through));
  if (rail > 0) {
    x = lerp(SYS_X, GRID_X, ease.inOut(rail));
    y = lerp(RAIL_Y, GRID_Y, ease.inOut(rail));
  }
  if (forward > 0) {
    x = lerp(GRID_X, CX - 44, ease.inOut(forward));
    y = lerp(GRID_Y, SCREEN.y + STATUS_H + 10, ease.inOut(forward));
    scale = lerp(scale, scale * 0.86, forward);
  }
  /* the block: the package stops DEAD against the barrier and rebounds; nothing squeezes past */
  const push = blocked * (1 - through)
    * (2 + impact(t * FPS, CUE.packageBlocked * FPS, 13, 5.6, 6.5));
  return { x, y: y - push, scale, form, becomeIcon, forward, blocked, rail };
}

/* ── THE HAND — three approaches, each curved, decelerating, with a rebound ─────────────────*/
const REST = { x: CX + 40, y: H + 300 };
const FROM = { x: SCREEN.x + SCREEN.w + 220, y: H + 420 };

/* A HAND ARRIVES AND LEAVES; it is never mounted or unmounted while it is on screen. Both of
   those were one-frame appearances and the seam metric caught both. It approaches on a curved
   path, decelerates into contact, rebounds, and then RETREATS along the same path to rest — which
   is also the follow-through the plan asks for. */
function reach(t: number, opts: {
  from: number; press: number; target: { x: number; y: number }; lift: number; max: number;
}) {
  const OUT = 0.62;                       // the retreat, in seconds
  const a = paced(opts.from, opts.press, opts.max);
  const inP = clamp01((t - a.from) / a.span);
  const outP = ease.in(clamp01((t - (opts.press + 0.08)) / OUT));
  if (inP <= 0.001 || outP >= 0.999) return null;
  const p = Math.min(1, inP) * (1 - outP) + outP * 0;     // forward, then back down the same arc
  const tip = approach(REST, opts.target, inP * (1 - outP), opts.lift);
  return {
    tip, fw: 30,
    press: band(t, opts.press - 0.05, opts.press, opts.press + 0.08, opts.press + 0.19),
  };
}

function handAt(t: number) {
  const tile = { x: BX + 132, y: TILE_Y + 46 };
  const toggle = { x: SCREEN.x + SCREEN.w - 84, y: SCREEN.y + 752 };
  const install = { x: SCREEN.x + SCREEN.w - 128, y: SCREEN.y + 692 };
  return reach(t, { from: B(8), press: CUE.apkTap, target: tile, lift: 120, max: 1.30 })
    ?? reach(t, { from: CUE.toggleHover - 1.0, press: CUE.togglePress, target: toggle,
      lift: 155, max: 1.15 })
    ?? reach(t, { from: CUE.installerIn + 0.15, press: CUE.installProgress - 0.06,
      target: install, lift: 135, max: 0.80 });
}

/* ── THE SCREEN ─────────────────────────────────────────────────────────────────────────────*/
const EarlyScreen: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  const P = pkg(t);

  /* the arrival: in from beyond the upper-right, hard deceleration, and a LAND the world answers */
  const arrive = paced(CUE.cardArrive, CUE.cardLand, 0.95);
  const ain = ease.outQuint(clamp01((t - arrive.from) / arrive.span));
  const cardX = lerp(SCREEN.w + 260, 0, ain);
  const cardY = lerp(-160, 0, ain) + impact(f, CUE.cardLand * FPS, 9, 7.6, 11);
  const cardRot = lerp(7, 0, ain) + impact(f, CUE.cardLand * FPS, 1.1, 6.4, 10);

  /* the document assembles in reading order, on the words that name each part */
  /* the notice ARRIVES printed: header, field labels and rules are part of the document,
     not something that fills in. Only the VALUES resolve, on the words that name them. */
  const header = win(t, CUE.cardArrive, CUE.cardArrive + 0.18);
  const plateP = win(t, B(7), B(7) + 0.62);
  /* block 13 re-focuses the finished plate rather than re-revealing it */
  const plateFocus = band(t, B(13), B(13) + 0.22, B(13) + 0.75, B(13) + 1.15);
  const amount = Math.max(win(t, B(8), B(8) + 0.40), win(t, B(15), B(16) + 0.25));

  const tileLift = win(t, CUE.tileLift, CUE.tileLift + 0.55);
  const slideUp = Math.max(win(t, B(9), B(9) + 0.5) * 0.18, win(t, B(12), B(13) + 0.1));
  const nameP = win(t, CUE.nameReveal, B(21) + 0.60);
  const pkgForm = win(t, CUE.glyphBecomesPackage, CUE.glyphBecomesPackage + 0.70);

  /* the chat compresses BACK; it never leaves, so the source of the package is never lost */
  const recede = win(t, CUE.apkTap + 0.12, CUE.systemRise + 0.5);
  const chatScale = 1 - recede * 0.06;
  const chatDim = recede * 0.60;

  const sysRise = win(t, CUE.systemRise, CUE.systemRise + 0.62);
  const sheetY = lerp(SCREEN.y + SCREEN.h, SHEET_Y, ease.out(sysRise))
    + impact(f, (CUE.systemRise + 0.62) * FPS, 5, 6, 9);
  const warn = win(t, CUE.warningLands, CUE.warningLands + 0.32);
  const toggleOn = win(t, CUE.togglePress + 0.03, CUE.togglePress + 0.32);
  const togglePress = band(t, CUE.togglePress - 0.05, CUE.togglePress, CUE.togglePress + 0.08,
    CUE.togglePress + 0.20);
  const sheetOut = winOut(t, CUE.installerIn - 0.34, CUE.installerIn + 0.50);
  const barrierOpen = win(t, CUE.barrierOpens, CUE.barrierOpens + 0.34);
  const barrierIn = win(t, CUE.barrierSet, CUE.barrierSet + 0.30);

  const instIn = win(t, CUE.installerIn - 0.12, CUE.installerIn + 0.48);
  const instOut = winOut(t, CUE.iconAssembles - 0.10, CUE.iconAssembles + 0.70);
  const rawP = clamp01((t - CUE.installProgress)
    / Math.max(0.3, CUE.iconAssembles - CUE.installProgress));
  /* non-linear, as the plan asks: quick start, slower middle, a hesitation near the end */
  const progress = t < CUE.installProgress ? -1
    : clamp01(rawP < 0.22 ? rawP * 2.1 : rawP < 0.86 ? 0.462 + (rawP - 0.22) * 0.62
      : 0.86 + (rawP - 0.86) * 1.0);

  const gridIn = win(t, CUE.iconAssembles - 0.85, CUE.iconAssembles - 0.05);
  const appOpen = win(t, CUE.appOpens, CUE.appOpens + 0.5);

  return (
    <g>
      <g transform={`translate(${CX} ${CY}) scale(${chatScale}) translate(${-CX} ${-CY})`}>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill={C.chatBg} />
        <ChatFurniture notice={1 - win(t, CUE.apkTap, CUE.apkTap + 0.4) * 0.5} />
        <defs>
          <clipPath id="bubbleClip">
            <rect x={BX - 4} y={BY} width={BW + 8} height={BH} rx={20} />
          </clipPath>
        </defs>
        {ain > 0.001 && (
          <g transform={`translate(${cardX} ${cardY}) rotate(${cardRot} ${BX + BW / 2} ${BY + BH / 2})`}>
            <Bubble x={BX} y={BY} w={BW} h={BH}>
              <g transform={`translate(0 ${-plateFocus * 3})`}>
                <ChallanDoc x={BX + 16} y={BY + 16} w={BW - 32} header={header} plate={plateP}
                  amount={amount} focus={plateFocus} />
              </g>
            </Bubble>
            {/* the attachment emerges from UNDER the notice, so the viewer sees where it came
                from. A sliver peeks from the card's foot at the end of the hook (block 9), and it
                slides fully out on "a file named" (block 18). */}
            {P.form < 0.02 && (
              <g clipPath="url(#bubbleClip)">
                <g transform={`translate(0 ${(1 - slideUp) * 82})`}>
                  <ApkTile x={BX + 16} y={TILE_Y} w={BW - 32} pkg={pkgForm} name={nameP}
                    lift={tileLift * 8} />
                </g>
              </g>
            )}
          </g>
        )}
        <ChatHeader />
        {chatDim > 0.001 && (
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#05091A"
            opacity={chatDim} />
        )}
      </g>

      {/* the app grid the icon will dock into — behind the surfaces, revealed as they leave */}
      {gridIn > 0.01 && appOpen < 0.7 && (
        <g opacity={gridIn * (1 - appOpen / 0.7)}>
          {Array.from({ length: 8 }, (_, i) => {
            const gx = SCREEN.x + 96 + (i % 4) * 106, gy = GRID_Y + Math.floor(i / 4) * 128;
            if (i === 0) {
              return <rect key={i} x={gx} y={gy} width={88} height={88} rx={22} fill="none"
                stroke={mix(C.grey, C.chatBg, 0.7)} strokeWidth={2.4} strokeDasharray="7 7" />;
            }
            const nudge = impact(f, CUE.iconDocks * FPS, 2.6 - i * 0.22, 7, 12);
            return <Solid key={i} x={gx} y={gy + nudge} w={88} h={88} r={22} elevation={4}
              base={mix(['#37406B', '#2E5A52', '#4A3A66', '#3C4E74', '#2F4260', '#45395E', '#334C6E'][i - 1],
                C.chatBg, 0.22)} litK={0.16} shadeK={0.22} />;
          })}
        </g>
      )}

      {/* the install rail is a REPRESENTATION, so it may legitimately be traced on */}
      {P.rail > 0.01 && P.forward < 0.5 && (
        <path d={`M${CX} ${RAIL_Y + 40} L${SCREEN.x + 140} ${GRID_Y + 10}`}
          stroke={mix(C.cobalt, C.chatBg, 0.42)} strokeWidth={S.route} strokeLinecap="round"
          strokeDasharray="300" strokeDashoffset={300 * (1 - P.rail)} opacity={0.75} />
      )}

      {/* the Android source-permission surface, and the barrier it governs */}
      {sysRise > 0.002 && sheetOut < 0.999 && (
        <g transform={`translate(0 ${sheetOut * EXIT})`}>
          <InstallSourceSheet y={sheetY} on={toggleOn} press={togglePress} warn={warn} />
        </g>
      )}

      {/* the BARRIER lives above the sheet's top edge, in the space the chat vacated — it is the
          only lit thing in the world while it holds, and it OPENS mechanically */}
      {barrierIn > 0.002 && sheetOut < 0.999 && (
        <g transform={`translate(0 ${sheetOut * EXIT})`}>
          <g opacity={barrierIn}>
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(${(i ? 1 : -1) * barrierOpen * 96} 0)`}>
                <Solid x={SCREEN.x + 18 + i * (SCREEN.w / 2 - 10)} y={BARRIER_Y}
                  w={SCREEN.w / 2 - 26} h={13} r={6} base={mix(C.amber, C.navy2, 0.30)}
                  litK={0.26} shadeK={0.2} elevation={5} />
                {[0, 1, 2, 3].map((j) => (
                  <rect key={j} x={SCREEN.x + 34 + i * (SCREEN.w / 2 - 10) + j * 56}
                    y={BARRIER_Y + 13} width={9} height={19} rx={4}
                    fill={shade(mix(C.amber, C.navy2, 0.30), 0.40)} />
                ))}
              </g>
            ))}
          </g>
        </g>
      )}

      {/* the package, in flight — the SAME object throughout */}
      {P.form > 0.02 && P.forward < 0.99 && (
        <g transform={`translate(${P.x} ${P.y}) scale(${P.scale})`}>
          <AppIcon x={0} y={0} s={1} dim={(1 - P.becomeIcon) * 0.55} />
          {P.becomeIcon < 0.62 && (
            <g opacity={1 - P.becomeIcon / 0.62}>
              <Solid x={5} y={5} w={78} h={78} r={12} base={C.slate} litK={0.2} shadeK={0.24} />
              <path d={`M5 ${5 + 78 * 0.36} h78 M44 5 v${78 * 0.36}`} stroke={shade(C.slate, 0.4)}
                strokeWidth={S.secondary} />
              <Label x={44} y={62} size={22} fill="#D6DEF2" weight={800} anchor="middle" track={1}>
                APK
              </Label>
            </g>
          )}
        </g>
      )}

      {/* the installer */}
      {instIn > 0.002 && instOut < 0.999 && (
        <g transform={`translate(0 ${(1 - instIn) * EXIT + instOut * EXIT})`}>
          <InstallerPanel y={SCREEN.y + 412} progress={progress}
            press={band(t, CUE.installProgress - 0.14, CUE.installProgress - 0.09,
              CUE.installProgress - 0.02, CUE.installProgress + 0.07)}
            icon={<AppIcon x={0} y={0} s={1} />} />
        </g>
      )}

      {/* the service */}
      {appOpen > 0.002 && (
        <g clipPath="url(#appOpenClip)">
          <defs>
            <clipPath id="appOpenClip">
              {/* grows from the icon's own position, in both axes, with the corner radius
                  relaxing out of the icon's squircle into the screen's */}
              <rect
                x={lerp(CX - 44, SCREEN.x, ease.out(appOpen))}
                y={lerp(SCREEN.y + STATUS_H + 10, SCREEN.y, ease.out(appOpen))}
                width={lerp(88, SCREEN.w, ease.out(appOpen))}
                height={lerp(88, SCREEN.h, ease.outQuint(appOpen))}
                rx={lerp(22, 0, appOpen)} />
            </clipPath>
          </defs>
          <g transform={`translate(${CX} ${SCREEN.y + 300}) scale(${lerp(1.06, 1, ease.out(appOpen))})
                         translate(${-CX} ${-(SCREEN.y + 300)})`}>
            <EchallanApp detail={win(t, CUE.appOpens + 0.12, B(52) + 0.3)}
              amount={win(t, B(53), B(54) + 0.2)} cta={win(t, B(54) + 0.2, B(55) + 0.3)} />
          </g>
        </g>
      )}

      <StatusBar tint={appOpen > 0.5 ? '#B7C8E6' : '#C3D0E6'} label="10:43" />
    </g>
  );
};

/* ── THE SECTION, SPLIT BY DEPTH ────────────────────────────────────────────────────────────
   The world and the device are separate layers so the camera can move them at different rates.
   A single group scaled uniformly is a PowerPoint zoom, not a push-in (addendum §15). */
export const EarlyWorld: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(t);
  /* the road DECELERATES when the message lands — event-driven background (addendum §31), and
     what makes the arrival physically consequential rather than decorative */
  const brake = band(t, CUE.cardLand - 0.05, CUE.cardLand + 0.02, CUE.cardLand + 0.5,
    CUE.cardLand + 1.6);
  return (
    <RoadWorld t={t} scroll={t * 96 - brake * 44} ground={g}
      dim={win(t, CUE.systemRise, CUE.systemRise + 0.9) * 0.5} />
  );
};

export const EarlyDevice: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    const kick = impact(t * FPS, CUE.cardLand * FPS, 3.6, 5.4, 9);
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <g transform={`translate(0 ${kick})`}>
          <PhoneShell><EarlyScreen t={t} /></PhoneShell>
          <PhoneFurniture />
        </g>
      </g>
    );
  };

export const EarlyHand: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const hand = handAt(t);
    if (!hand) return null;
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <Hand tip={hand.tip} from={FROM} hand="right" fw={hand.fw} bend={14} press={hand.press} />
      </g>
    );
  };
