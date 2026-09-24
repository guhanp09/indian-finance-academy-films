/* PHASE 11 · CREDENTIAL THEFT AND OTP EXFILTRATION   (blocks 131-167, 74.7-97.2 s)
 *
 * The longest phase in the film and the most precisely staged, because the two things it has to
 * teach are both things the naive version gets WRONG:
 *
 *   premortem F8 — "OTP appears, OTP flies to hacker" teaches that malware REMOVES the message.
 *   It does not, and that error matters: the reason victims do not notice is precisely that the
 *   code is still sitting in their inbox. So: the OTP arrives with entirely normal styling, the
 *   route granted at 45 s lights up ON ITS OWN, a DUPLICATE peels away along a visible seam, and
 *   the original never moves for the rest of the sequence.
 *
 *   premortem F9 — credentials and codes must stay distinguishable IN GREYSCALE, so they differ in
 *   silhouette rather than hue (a wide card token with a stripe vs a compact square tile of six
 *   digits), they travel on separate lanes, and they are only ever side by side in the endpoint's
 *   receiving tray.
 *
 * The endpoint is a rack. No hood, no skull, no terminal, no matrix: the point of the film is that
 * the victim's own phone and permissions did the work, and a melodramatic villain would weaken it.
 */
import React from 'react';
import {
  C, FPS, H, LAYOUT, SCREEN, band, clamp01, ease, ground, hash01, impact, lerp, win, winOut,
} from '../design';
import { B, CUE } from '../timeline';
import { Label, Solid, recede } from '../world/kit';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { PaymentForm, SmsInbox } from '../world/screens';
import {
  CredPacket, Endpoint, OtpPacket, Payload,
} from '../world/interior';
import { EGRESS, NODES, PAY, Topology } from './permissions';

const CX = SCREEN.x + SCREEN.w / 2;
/* the endpoint lives outside the device, low and right, and it is HEAVY: it barely moves */
/* The device sits top-left at this point in the film, so the whole right of the frame is free.
   The data goes UP and OUT, away from the phone, to a rack that stands beside it. */
export const OX = 0;
export const ENDPOINT: [number, number] = [872, 792];

/* ── LANES ──────────────────────────────────────────────────────────────────────────────────
   Two arcs from the core to the endpoint. They never cross, and a packet on one is never the
   shape of a packet on the other. */
const lane = (p: number, hi: boolean): [number, number] => {
  const a: [number, number] = [PAY[0] + 88, PAY[1] + 6], b: [number, number] =
    [ENDPOINT[0] - 30, ENDPOINT[1] + 118];
  const x = lerp(a[0], b[0], p);
  const y = lerp(a[1], b[1], p);
  const k = Math.sin(p * Math.PI);
  /* the two lanes bow to opposite sides and never cross */
  return [x + (hi ? 62 * k : -70 * k), y + (hi ? -70 * k : 58 * k)];
};
/* the form's fields, as they sit on the screen — the packets are born AT them */
const FIELD = (i: number): [number, number] =>
  [SCREEN.x + 120 + (i % 2) * 260, SCREEN.y + 470 + Math.floor(i / 2) * 116];

const Screen: React.FC<{ t: number }> = ({ t }) => {
  /* the payment form returns as a MEMORY of what was typed, and is hollowed as its values leave */
  const formIn = band(t, CUE.fieldsReturn - 0.35, CUE.fieldsReturn + 0.2,
    CUE.smsNamed - 0.55, CUE.smsNamed - 0.05);
  /* an app switch is a physical thing on Android: the inbox slides in over the form */
  const inboxIn = win(t, CUE.smsNamed - 0.5, CUE.smsNamed + 0.15);
  const hollow = win(t, CUE.credDetach, CUE.credToCore + 0.4);
  return (
    <g>
      <g opacity={1} transform={`translate(${-inboxIn * SCREEN.w * 0.34} 0)`}>
        <PaymentForm typed={1} caret={0} />
        {/* hollowed: the values it collected are gone from it, and the wells are empty */}
        {hollow > 0.01 && [0, 1, 2, 3].map((i) => (
          <rect key={i} x={SCREEN.x + 46 + (i % 2) * 254} y={SCREEN.y + 430 + Math.floor(i / 2) * 116}
            width={i === 0 ? SCREEN.w - 92 : 210} height={72} rx={12} fill="#EEF2F9"
            opacity={hollow * 0.95} />
        ))}
      </g>
      {inboxIn > 0.002 && (
        <g transform={`translate(${(1 - ease.out(inboxIn)) * SCREEN.w} 0)`}>
          <SmsInbox arrive={win(t, CUE.otpArrives, CUE.otpArrives + 0.45)} />
        </g>
      )}
      <StatusBar tint={inboxIn > 0.5 ? '#8DA0C2' : '#7E8CA8'} label="10:53" />
    </g>
  );
};

export const TheftDevice: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + rig.x} ${ay + rig.y}) scale(${rig.s}) translate(${-ax} ${-ay})`}>
        <PhoneShell screenBase="#0F1729"><Screen t={t} /></PhoneShell>
        <PhoneFurniture />
      </g>
    );
  };

/* ── THE MECHANISM ──────────────────────────────────────────────────────────────────────────*/
/* ── THE FLIGHT ─────────────────────────────────────────────────────────────────────────────
   Where every packet is at time t. Shared by the packet layer and by anything that needs to know
   whether the endpoint has been reached, so the two can never disagree. */
function flight(t: number, rig: { s: number; x: number; y: number }) {
  const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
  /* where a field sits ON SCREEN in world coordinates, so a packet born at a field really is born
     at that field even as the device moves and scales under it */
  const onDevice = ([x, y]: [number, number]): [number, number] =>
    [ax + rig.x + (x - ax) * rig.s, ay + rig.y + (y - ay) * rig.s];

    /* CREDENTIALS: detach from the fields, travel to the core, rest there, then leave on the low
     lane. Each has its own stagger and its own arc; no two trajectories are identical. */
  const cred = [0, 1, 2, 3].map((i) => {
    const off = i * 0.13;
    const toCore = win(t, CUE.credDetach + off, CUE.credInCore + off * 0.5);
    const out = win(t, CUE.exfil + 0.10 + off * 0.8, CUE.serverReceives + off * 0.5);
    const a = onDevice(FIELD(i));
    const mid: [number, number] = [PAY[0] + OX - 40 + i * 26, PAY[1] - 6];
    let x: number, y: number, s = 1, rot = -10 + i * 6;
    if (out > 0.001) {
      const [lx, ly] = lane(ease.inOut(out), false);
      x = lerp(mid[0], lx, Math.min(1, out * 1.4));
      y = lerp(mid[1], ly, Math.min(1, out * 1.4));
      s = lerp(1, 0.86, out);
      rot += out * 14;
    } else {
      const e = ease.inOut(toCore);
      x = lerp(a[0], mid[0], e);
      y = lerp(a[1], mid[1], e) - Math.sin(e * Math.PI) * 70;
      s = lerp(0.8, 1, toCore);
    }
    return { i, x, y, s, rot, on: toCore > 0.002 && out < 0.999, arrived: out };
  });

  /* THE OTP. The original stays. The duplicate peels along a seam and leaves on the HIGH lane. */
  const otpSeen = win(t, CUE.otpArrives, CUE.otpArrives + 0.45);
  const dupP = win(t, CUE.duplicate, CUE.duplicate + 0.55);
  const otpOut = win(t, CUE.exfil, CUE.serverReceives - 0.1);
  /* the code well on the inbox card, in world coordinates */
  const codeAt = onDevice([SCREEN.x + 199 + 20, SCREEN.y + SCREEN.h * 0 + 46 + 96 + 120 + 172]);
  const otp = (() => {
    if (otpOut > 0.001) {
      const [lx, ly] = lane(ease.inOut(otpOut), true);
      return { x: lx, y: ly, s: 1, rot: 6 - otpOut * 10, on: otpOut < 0.999 };
    }
    if (dupP > 0.001) {
      const e = ease.out(dupP);
      return { x: codeAt[0] + e * 150, y: codeAt[1] - e * 54, s: lerp(1.1, 1, e),
        rot: e * 8, on: true };
    }
    return { x: 0, y: 0, s: 1, rot: 0, on: false };
  })();


  return { cred, otp };
}

/** the packets, in their own layer in FRONT of the device — data leaving it */
export const TheftPackets: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const p = flight(t, rig);
    return (
      <g>
        {p.cred.map((c) => c.on && (
          <CredPacket key={c.i} cx={c.x} cy={c.y} s={c.s} rot={c.rot} hot={1} />
        ))}
        {p.otp.on && <OtpPacket cx={p.otp.x} cy={p.otp.y} s={p.otp.s} rot={p.otp.rot} hot={1} />}
      </g>
    );
  };

export const TheftWorld: React.FC<{ t: number; rig: { s: number; x: number; y: number } }> =
  ({ t, rig }) => {
    const g = ground(t);
    const f = t * FPS;
    const arrivals = [CUE.serverReceives, CUE.serverReceives + 0.22, CUE.serverReceives + 0.4];
    const trayIn = win(t, CUE.credHighlight - 0.3, CUE.bothPresent);
    const credHi = band(t, CUE.credHighlight, CUE.credHighlight + 0.2, CUE.codeHighlight - 0.2,
      CUE.codeHighlight);
    const codeHi = band(t, CUE.codeHighlight, CUE.codeHighlight + 0.2, CUE.bothPresent,
      CUE.bothPresent + 0.25);
    const bothHi = win(t, CUE.bothPresent, CUE.bothPresent + 0.3);
    const endIn = win(t, CUE.exfil - 0.9, CUE.exfil - 0.1);

    return (
      <g>
        <Topology t={t} strength={1} live={1} danger={1} split={1} toward={1} flowK={2.4}
          ox={OX} shed={win(t, CUE.fieldsReturn, CUE.smsNamed)}
          egress={[ENDPOINT[0] - 18, ENDPOINT[1] + 96]} />

        {/* the endpoint ARRIVES before anything reaches it, so nothing pops into an empty frame */}
        {endIn > 0.004 && (
          <g transform={`translate(0 ${(1 - ease.out(endIn)) * 240})`} opacity={1}>
            <Endpoint cx={ENDPOINT[0]} cy={ENDPOINT[1]} s={0.68} ground={g.deep} t={t}
              awake={win(t, CUE.serverReceives, CUE.serverReceives + 0.4)} arrivals={arrivals} />
          </g>
        )}

        {/* the receiving tray: the endpoint holding two DIFFERENT things, which is the sentence
            the narration is speaking. They are only ever together here. */}
        {trayIn > 0.004 && (
          <g transform={`translate(0 ${(1 - ease.out(trayIn)) * 60})`}>
            <Solid x={ENDPOINT[0] - 130} y={ENDPOINT[1] + 118} w={286} h={100} r={16}
              base={recede('#1E2848', g.deep, 0.14)} litK={0.12} shadeK={0.2} elevation={8} />
            <g transform={`scale(${1 + credHi * 0.10}) translate(${-(ENDPOINT[0] - 72) * credHi * 0.10 / (1 + credHi * 0.10)} ${-(ENDPOINT[1] + 168) * credHi * 0.10 / (1 + credHi * 0.10)})`}>
              <CredPacket cx={ENDPOINT[0] - 72} cy={ENDPOINT[1] + 168} s={0.95} hot={1} />
            </g>
            <OtpPacket cx={ENDPOINT[0] + 16} cy={ENDPOINT[1] + 168} s={0.76 + codeHi * 0.10}
              hot={1} />
            <Label x={ENDPOINT[0] + 92} y={ENDPOINT[1] + 160} size={20} fill={C.ink} weight={700}
              opacity={0.45 + credHi * 0.55}>card</Label>
            <Label x={ENDPOINT[0] + 92} y={ENDPOINT[1] + 186} size={20} fill={C.ink} weight={700}
              opacity={0.45 + codeHi * 0.55}>+ code</Label>
            {/* the capability: an account node becoming enabled. No instructional steps. */}
            {bothHi > 0.01 && (
              <g opacity={bothHi}>
                <rect x={ENDPOINT[0] - 130} y={ENDPOINT[1] + 118} width={286} height={100} rx={16}
                  fill="none" stroke={C.red} strokeWidth={3}
                  opacity={0.5 + impact(f, CUE.capability * FPS, 0.45, 3.2, 3) } />
              </g>
            )}
          </g>
        )}
      </g>
    );
  };
