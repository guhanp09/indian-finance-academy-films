/* PHASES 7-8 · PERMISSION ESCALATION AND HASTY COMPLIANCE   (blocks 72-101, 41.1-57.6 s)
 *
 * The most important semantic system in the film. Every Allow must leave a PERMANENT CONSEQUENCE,
 * and no capability may be active before it is granted — those two rules are what make the reveal
 * at 71 s land, because by then the viewer has watched the attack infrastructure being built one
 * boring prompt at a time.
 *
 * Board 03 is the approved staging: the device recedes and rises, the space it vacates is the
 * chamber, and both registers are legible at once — the prompt the victim is answering, and the
 * capability it opens. The phone is never made transparent.
 *
 * The four identities set here are the film's vocabulary for the rest of its runtime:
 *   SMS cyan · CALLS violet · BACKGROUND amber · VPN teal.
 *
 * Phase 8 adds NO new capability. "You hastily press Allow on everything" is a characterisation of
 * what the viewer has just watched, so what accelerates is the BEHAVIOUR — the hand's intervals
 * shorten, the gaze stops reading — while the topology, now complete, becomes the subject.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, SCREEN, band, breathe, clamp01, ease, ground, hash01, impact, lerp, win, winOut,
} from '../design';
import { B, CUE, paced } from '../timeline';
import { Label, Solid } from '../world/kit';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { PermIcon, PermissionDialog, VpnConsent } from '../world/system';
import { EchallanApp } from '../world/screens';
import {
  AppShell, Cap, CapNode, Chamber, Payload, Route, VpnTunnel,
} from '../world/interior';
import { Hand, approach } from '../world/hand';
import { INT } from './install2';

const CX = SCREEN.x + SCREEN.w / 2;
const REST = { x: CX + 40, y: H + 300 };
const FROM = { x: SCREEN.x + SCREEN.w + 220, y: H + 420 };

/* the capability nodes, in the chamber. Board 03's positions. */
export const NODES: Record<Cap, [number, number]> = {
  sms: [148, 1104], call: [932, 1104], bg: [148, 1414], vpn: [932, 1414],
};
export const PAY: [number, number] = [INT.payload.cx, INT.payload.cy];
/* the tunnel is the only thing in the film that crosses the device boundary */
export const EGRESS: [number, number] = [1046, 1470];

/** how far each capability has been granted, at time t. 0 until its own grant, then permanent. */
export function caps(t: number) {
  return {
    sms: win(t, CUE.smsGrant, CUE.smsGrant + 0.34),
    call: win(t, CUE.callGrant, CUE.callGrant + 0.34),
    bg: win(t, CUE.bgGrant, CUE.bgGrant + 0.34),
    vpn: win(t, CUE.vpnGrant, CUE.vpnGrant + 0.34),
  } as Record<Cap, number>;
}
/** a route exists only after its grant, and then it never goes away */
export function routes(t: number) {
  const g = caps(t);
  return {
    sms: { grow: win(t, CUE.smsGrant + 0.10, CUE.smsGrant + 0.85), on: g.sms },
    call: { grow: win(t, CUE.callGrant + 0.10, CUE.callGrant + 0.85), on: g.call },
    bg: { grow: win(t, CUE.bgGrant + 0.10, CUE.bgGrant + 0.85), on: g.bg },
    vpn: { grow: win(t, CUE.tunnelGrows, CUE.tunnelSettles + 0.18), on: g.vpn },
  };
}

/* ── THE CHAMBER, FROM HERE TO THE RECAP ────────────────────────────────────────────────────*/
export const Topology: React.FC<{
  t: number; strength?: number; live?: number; danger?: number; split?: number; toward?: number;
  flowK?: number; ox?: number; shed?: number; egress?: [number, number];
}> = ({ t, strength = 1, live = 0.46, danger = 0, split = 0, toward = 0, flowK = 1, ox = 0,
  shed = 0, egress }) => {
  const g = ground(t);
  const R = routes(t);
  const c = caps(t);
  const L = INT;
  /* a tunnel tip that OVERSHOOTS and settles — it is elastic, and it is anchored */
  const grow = R.vpn.grow;
  /* the tunnel's far end. During the exfiltration it visibly TERMINATES at the server — it is
     the same tunnel that was authorised at 52s, not a new path. */
  const END: [number, number] = egress ?? EGRESS;
  const over = 1 + impact(t * FPS, CUE.tunnelSettles * FPS, 0.045, 5.2, 8) * (grow > 0.98 ? 1 : 0);

  return (
    <g transform={`translate(${ox} 0)`}>
      <Chamber x={L.chamber.x} y={L.chamber.y} w={L.chamber.w} h={L.chamber.h} ground={g.deep}
        t={t} open={1} />

      {/* ROUTES: only where a capability has actually been granted */}
      {R.sms.on > 0.01 && (
        <Route from={NODES.sms} to={PAY} cap="sms" ground={g.deep} grow={R.sms.grow}
          strength={strength} flow={t * 1.6 * flowK} bend={0.30} toward={toward} />
      )}
      {R.call.on > 0.01 && (
        <Route from={NODES.call} to={PAY} cap="call" ground={g.deep} grow={R.call.grow}
          strength={strength} flow={t * 1.35 * flowK} bend={-0.30} toward={toward} />
      )}
      {R.bg.on > 0.01 && (
        <Route from={NODES.bg} to={PAY} cap="bg" ground={g.deep} grow={R.bg.grow}
          strength={strength} flow={t * 1.1 * flowK} bend={-0.26} toward={toward} />
      )}
      {R.vpn.on > 0.01 && (
        <VpnTunnel from={[PAY[0] + 92, PAY[1] + 16]}
          to={[lerp(PAY[0] + 92, END[0], over), lerp(PAY[1] + 16, END[1], over)]}
          ground={g.deep} grow={grow} strength={strength}
          flow={grow > 0.6 ? t * 2.4 * flowK : 0} hot={danger} />
      )}

      {/* the container, the payload inside it, and the container's front lip over it */}
      <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h} ground={g.deep}
        depth={0.16} split={split} front={false} label={false} />
      <Payload cx={L.payload.cx} cy={L.payload.cy} w={L.payload.w} ground={g.deep} depth={0.06}
        live={live} danger={danger} />
      <g transform={`translate(${-shed * 520} ${shed * 150}) rotate(${shed * 16} ${L.shell.cx} ${L.shell.cy})`}>
        <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h} ground={g.deep}
          depth={0.16 + shed * 0.4} split={split} back={false} />
      </g>

      {/* the nodes. A locked node has NO route; an unlocked one keeps its colour for the film. */}
      {(['sms', 'call', 'bg', 'vpn'] as Cap[]).map((k) => (
        <CapNode key={k} cx={NODES[k][0]} cy={NODES[k][1]} r={48} cap={k} ground={g.deep}
          granted={c[k]} depth={c[k] > 0.5 ? 0.08 : 0.30} t={t} />
      ))}
    </g>
  );
};

/* ── THE SCREEN — four surfaces, never merged (premortem F4) ───────────────────────────────*/
const Screen: React.FC<{ t: number }> = ({ t }) => {
  const f = t * FPS;
  const scrim = Math.max(
    band(t, CUE.smsCard - 0.1, CUE.smsCard + 0.4, CUE.callGrant + 0.5, CUE.callGrant + 0.9),
    band(t, CUE.bgConcept - 0.1, CUE.bgConcept + 0.4, CUE.bgGrant + 0.5, CUE.bgGrant + 0.9),
    band(t, CUE.vpnCard - 0.1, CUE.vpnCard + 0.4, CUE.vpnGrant + 0.5, CUE.vpnGrant + 0.9),
    band(t, CUE.hastyStart, CUE.hastyStart + 0.3, CUE.hastyEnd, CUE.hastyEnd + 0.5),
  );
  const EXIT = SCREEN.h + 60;

  /* gate 3a — SMS. It rises, is answered, and SLIDES AWAY; its route stays. */
  const smsIn = win(t, CUE.smsCard, CUE.smsCard + 0.5);
  const smsOut = winOut(t, CUE.smsGrant + 0.18, CUE.smsGrant + 0.72);
  /* gate 3b — calls. Its icon silhouette is unmistakably not the SMS one. */
  const callIn = win(t, CUE.callCard, CUE.callCard + 0.42);
  const callOut = winOut(t, CUE.callGrant + 0.16, CUE.callGrant + 0.66);
  /* background is NOT a popup: the app window recedes and its core keeps glowing */
  const bgRecede = band(t, CUE.bgConcept, CUE.bgConcept + 0.6, CUE.bgGrant + 0.4, CUE.bgGrant + 1.0);
  /* gate 4 — VPN consent, a system-level surface */
  const vpnIn = win(t, CUE.vpnCard, CUE.vpnCard + 0.46);
  const vpnOut = winOut(t, CUE.vpnGrant + 0.16, CUE.vpnGrant + 0.70);

  return (
    <g>
      {/* the app is underneath the whole phase; during the background beat it RECEDES rather than
          disappearing, which is the point of that beat */}
      <g transform={`translate(${CX} ${SCREEN.y + 300}) scale(${1 - bgRecede * 0.085})
                     translate(${-CX} ${-(SCREEN.y + 300)})`}>
        <EchallanApp detail={1} amount={1} cta={1} />
      </g>
      {scrim > 0.002 && (
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#060B18"
          opacity={scrim * 0.46} />
      )}

      {smsIn > 0.002 && smsOut < 0.999 && (
        <g transform={`translate(0 ${(1 - ease.out(smsIn)) * EXIT - smsOut * EXIT})`}>
          <PermissionDialog y={SCREEN.y + 420} kind="sms"
            press={band(t, CUE.smsGrant - 0.05, CUE.smsGrant, CUE.smsGrant + 0.08,
              CUE.smsGrant + 0.19)} />
        </g>
      )}
      {callIn > 0.002 && callOut < 0.999 && (
        <g transform={`translate(0 ${(1 - ease.out(callIn)) * EXIT - callOut * EXIT})`}>
          <PermissionDialog y={SCREEN.y + 420} kind="call"
            press={band(t, CUE.callGrant - 0.05, CUE.callGrant, CUE.callGrant + 0.08,
              CUE.callGrant + 0.19)} />
        </g>
      )}
      {vpnIn > 0.002 && vpnOut < 0.999 && (
        <g transform={`translate(0 ${(1 - ease.out(vpnIn)) * EXIT + vpnOut * EXIT})`}>
          <VpnConsent y={SCREEN.y + 396}
            press={band(t, CUE.vpnGrant - 0.05, CUE.vpnGrant, CUE.vpnGrant + 0.08,
              CUE.vpnGrant + 0.19)} />
        </g>
      )}

      {/* PHASE 8: a short tail of generic prompts, dispatched on SHORTENING intervals. They add no
          capability — what accelerates is the behaviour. */}
      {CUE.hastyTaps.map((tap, i) => {
        const inP = win(t, tap - (0.42 - i * 0.09), tap - (0.16 - i * 0.04));
        /* exits accelerate, and are given room to travel: a 0.19s window over a full screen-height
           is 277px on the first frame */
        const outP = winOut(t, tap + 0.04, tap + 0.52 - i * 0.05);
        if (inP <= 0.002 || outP >= 0.999) return null;
        return (
          <g key={i} transform={`translate(0 ${(1 - ease.out(inP)) * EXIT - outP * EXIT})`}>
            <PermissionDialog y={SCREEN.y + 450} kind={i % 2 ? 'call' : 'sms'} scale={0.94}
              press={band(t, tap - 0.04, tap, tap + 0.06, tap + 0.14)} />
          </g>
        );
      })}

      <StatusBar tint="#9CADCA" label="10:47" />
    </g>
  );
};

/* ── THE HAND — the intervals shorten and the arcs get shorter; it never teleports ──────────*/
function handAt(t: number) {
  const allow = { x: SCREEN.x + SCREEN.w - 108, y: SCREEN.y + 726 };
  const ok = { x: SCREEN.x + SCREEN.w - 104, y: SCREEN.y + 726 };
  const one = (from: number, press: number, target: { x: number; y: number }, max: number,
    lift: number, out = 0.6) => {
    const a = paced(from, press, max);
    const inP = clamp01((t - a.from) / a.span);
    const outP = ease.in(clamp01((t - (press + 0.06)) / out));
    if (inP <= 0.001 || outP >= 0.999) return null;
    return { tip: approach(REST, target, inP * (1 - outP), lift), fw: 30,
      press: band(t, press - 0.05, press, press + 0.07, press + 0.17) };
  };
  return one(CUE.smsCard + 0.55, CUE.smsGrant, allow, 1.25, 150)
    ?? one(CUE.callCard + 0.20, CUE.callGrant, allow, 0.95, 130, 0.5)
    ?? one(CUE.vpnCard + 0.30, CUE.vpnGrant, ok, 0.85, 120, 0.46)
    /* by the tail the arcs are short and the hover has gone entirely */
    ?? CUE.hastyTaps.reduce<ReturnType<typeof one>>((acc, tap, i) =>
      acc ?? one(tap - 0.34 + i * 0.06, tap, allow, 0.30 - i * 0.05, 74 - i * 16, 0.26), null);
}

export const PermDevice: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <PhoneShell screenBase="#E9EEF7"><Screen t={t} /></PhoneShell>
        <PhoneFurniture />
      </g>
    );
  };

export const PermHand: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
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
