/* PHASES 5-6 · THE UPDATE INTRUSION AND THE SECOND INSTALL   (blocks 56-71, 31.4-41.1 s)
 *
 * This is the film's MEMORY TEST (premortem F3). The payload installed here has to be recognised
 * at ~71 s, forty seconds and three phases later. So it is:
 *   · given a silhouette a person can hold — a compact double-walled block with two notches and
 *     one diagonal seam, darker and denser than the app that carries it;
 *   · HELD, not flashed: it owns the focal point for its own beats;
 *   · and kept FAINTLY ALIVE underneath for the rest of the film, so the reveal is a re-focus on
 *     something continuously present rather than the introduction of a stranger.
 * It is not red, not labelled and not sinister. It is just a smaller, heavier package.
 *
 * The interior opens here for the first time. The device rises and gives up its lower third, and
 * the space it vacates becomes a milled chamber — it is never made transparent
 * (rule: depth is drawn, not dissolved).
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, SCREEN, band, clamp01, ease, ground, impact, lerp, win, winOut,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { AppIcon, InstallerPanel } from '../world/system';
import { EchallanApp, UpdateCard } from '../world/screens';
import { AppShell, Chamber, Payload } from '../world/interior';
import { Hand, approach } from '../world/hand';

const CX = SCREEN.x + SCREEN.w / 2;

/* the chamber, and what stands in it. These are the film's coordinates from here to the recap. */
export const INT = {
  chamber: { x: 50, y: 1012, w: 980, h: 508 },
  shell: { cx: 540, cy: 1246, w: 330, h: 206 },
  payload: { cx: 540, cy: 1230, w: 176 },
} as const;

const REST = { x: CX + 40, y: H + 300 };
const FROM = { x: SCREEN.x + SCREEN.w + 220, y: H + 420 };

function handAt(t: number) {
  const btn = { x: CX + 40, y: SCREEN.y + 700 };
  const ok = { x: SCREEN.x + SCREEN.w - 128, y: SCREEN.y + 692 };
  const one = (from: number, press: number, target: { x: number; y: number }, max: number) => {
    const a = paced(from, press, max);
    const inP = clamp01((t - a.from) / a.span);
    const outP = ease.in(clamp01((t - (press + 0.08)) / 0.62));
    if (inP <= 0.001 || outP >= 0.999) return null;
    return { tip: approach(REST, target, inP * (1 - outP), 140), fw: 30,
      press: band(t, press - 0.05, press, press + 0.08, press + 0.19) };
  };
  return one(CUE.updateWords - 0.35, CUE.updatePress, btn, 1.05)
    ?? one(CUE.installer2 + 0.3, CUE.confirm2, ok, 0.9);
}

/* ── THE SCREEN ─────────────────────────────────────────────────────────────────────────────*/
const Screen: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  /* the app is underneath the whole time — it never leaves, which is what makes the update feel
     like part of the same trustworthy thing */
  const yieldK = win(t, CUE.updateRise, CUE.updateRise + 0.7) * 0.025
    * (1 - win(t, CUE.appResurfaces, CUE.appResurfaces + 0.5));

  const rise = win(t, CUE.updateRise, CUE.updateRise + 0.62);
  const words = win(t, CUE.updateWords, CUE.updateWords + 0.34);
  const press = band(t, CUE.updatePress - 0.05, CUE.updatePress, CUE.updatePress + 0.08,
    CUE.updatePress + 0.20);
  /* the panel does not vanish: it UNFOLDS into the package handoff and leaves downward */
  const unfold = winOut(t, CUE.updatePress + 0.10, CUE.payloadAppears + 0.40);

  const inst = band(t, CUE.installer2 - 0.12, CUE.installer2 + 0.42,
    CUE.payloadDescends - 0.10, CUE.payloadDescends + 0.48);
  const instProg = t < CUE.confirm2 ? -1
    : clamp01((t - CUE.confirm2) / Math.max(0.3, CUE.payloadLands - CUE.confirm2));

  const back = win(t, CUE.appResurfaces, CUE.appResurfaces + 0.55);
  const EXIT = SCREEN.h + 60;

  return (
    <g>
      <g transform={`translate(${CX} ${SCREEN.y + 300}) scale(${1 - yieldK})
                     translate(${-CX} ${-(SCREEN.y + 300)})`}>
        <EchallanApp detail={1} amount={1} cta={1} />
      </g>
      {/* the system scrim is LIGHT over an opaque surface, which is what alpha is for */}
      {rise > 0.002 && (
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#060B18"
          opacity={rise * 0.42 * (1 - back)} />
      )}

      {rise > 0.002 && unfold < 0.999 && (
        <g transform={`translate(0 ${(1 - ease.out(rise)) * EXIT + unfold * EXIT})`}>
          <UpdateCard y={SCREEN.y + 470 + impact(f, (CUE.updateRise + 0.62) * FPS, 5, 6.4, 9)}
            press={press} rim={words} />
        </g>
      )}

      {inst > 0.002 && (
        <g transform={`translate(0 ${(1 - inst) * EXIT})`}>
          <InstallerPanel y={SCREEN.y + 412} progress={instProg}
            title="System update" press={band(t, CUE.confirm2 - 0.14, CUE.confirm2 - 0.09,
              CUE.confirm2 - 0.02, CUE.confirm2 + 0.07)}
            icon={<AppIcon x={0} y={0} s={1} dim={0.25} />} />
        </g>
      )}

      <StatusBar tint="#9CADCA" label="10:45" />
    </g>
  );
};

/* ── THE INTERIOR — it opens here, and it never closes again ───────────────────────────────*/
export const Interior: React.FC<{ t: number; open: number; live: number }> =
  ({ t, open, live }) => {
    const g = ground(t);
    const L = INT;
    /* the payload DESCENDS out of the device into the chamber: it is carried down, not spawned */
    const drop = win(t, CUE.payloadDescends, CUE.payloadLands + 0.2);
    const y = lerp(L.chamber.y - 120, L.payload.cy, ease.inOut(drop))
      + impact(t * FPS, (CUE.payloadLands + 0.2) * FPS, 7, 6.2, 10);
    return (
      <g>
        <Chamber x={L.chamber.x} y={L.chamber.y} w={L.chamber.w} h={L.chamber.h}
          ground={g.deep} t={t} open={open} />
        {open > 0.05 && (
          <>
            <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h}
              ground={g.deep} depth={0.16} front={false} label={false} />
            {drop > 0.004 && (
              <Payload cx={L.payload.cx} cy={y} w={L.payload.w} ground={g.deep} depth={0.10}
                live={live} />
            )}
            <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h}
              ground={g.deep} depth={0.16} back={false} />
          </>
        )}
      </g>
    );
  };

export const Install2Device: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <PhoneShell screenBase="#E9EEF7"><Screen t={t} /></PhoneShell>
        <PhoneFurniture />
      </g>
    );
  };

export const Install2Hand: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
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
