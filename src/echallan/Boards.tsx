/* DESIGN BOARDS — the four moments boarded before any animation.
 *
 * These are still compositions, not the film. They exist to settle the hardest questions in the
 * production early, while changing them is still cheap (rule: mockups before renders):
 *
 *   3  PERMISSION TOPOLOGY   how the two registers coexist without making the phone transparent
 *   4  PAYMENT               whether the calm is credible enough for the victim to be believable
 *   5  DROPPER REVEAL        whether the shell coming off reads, and whether the payload is the
 *                            SAME object the viewer saw installed
 *   6  OTP EXFILTRATION      whether "copied, not taken" is legible, and whether credentials and
 *                            OTPs stay distinct
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  C, FPS, H, LAYOUT, R, S, SCREEN, T, W, breathe, ground, lerp, mix, tAt,
} from './design';
import { Glow, Label, Plate, Solid, recede } from './world/kit';
import { PhoneFurniture, PhoneShell, StatusBar } from './world/device';
import { PermissionDialog, VpnConsent } from './world/system';
import {
  AppShell, CapNode, Chamber, CredPacket, Endpoint, OtpPacket, Payload, Route, VpnTunnel,
} from './world/interior';
import { EchallanApp, PaymentForm, PaymentSuccess, SmsInbox } from './world/screens';

/* The phone rig's journey: it is the SAME device at every scale, never swapped. `s` and `dy` are
   the only things that change, and the two registers are always both legible. */
const Rig: React.FC<{ s: number; dy: number; dx?: number; children: React.ReactNode }> =
  ({ s, dy, dx = 0, children }) => {
    const ax = LAYOUT.phone.x + LAYOUT.phone.w / 2, ay = LAYOUT.phone.y;
    return (
      <g transform={`translate(${ax + dx} ${ay + dy}) scale(${s}) translate(${-ax} ${-ay})`}>
        {children}
      </g>
    );
  };

const Title: React.FC<{ n: string; t: string; sub: string }> = ({ n, t, sub }) => (
  <g>
    <rect x={0} y={H - 178} width={W} height={178} fill="#05070F" opacity={0.86} />
    <Label x={56} y={H - 124} size={22} fill={C.grey} weight={800} track={2.4}>BOARD {n}</Label>
    <Label x={56} y={H - 82} size={32} fill={C.ink} weight={800} track={0.6}>{t}</Label>
    <Label x={56} y={H - 46} size={20} fill={C.greyDim} weight={600}>{sub}</Label>
  </g>
);

/* ══ BOARD 3 · PERMISSION TOPOLOGY ═════════════════════════════════════════════════════════
   The device recedes and rises; the space it vacates becomes a milled chamber. Both registers
   are readable at once: the prompt the victim is answering, and the capability it opens. */
const PERM_LAYOUT = {
  /* the chamber's rim crosses the foot of the device, so the phone plugs INTO its own interior
     rather than sitting above a diagram of one */
  chamber: { x: 50, y: 958, w: 980, h: 562 },
  shell: { cx: 540, cy: 1244, w: 330, h: 208 },
  /* the payload's lower third sits behind the shell's front lip — that occlusion is the whole
     "it is INSIDE the app" reading */
  payload: { cx: 540, cy: 1234, w: 152 },
  nodes: {
    sms: [148, 1104], call: [932, 1104], bg: [148, 1414], vpn: [932, 1414],
  } as Record<string, [number, number]>,
};

const BoardPermissions: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(tAt('your phone calls'));
  const L = PERM_LAYOUT;
  const pay: [number, number] = [L.payload.cx, L.payload.cy];
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <rect x={0} y={0} width={W} height={H * 0.56} fill={g.high} opacity={0.5} />

      <Rig s={0.74} dy={-126}>
        <PhoneShell screenBase="#E9EEF7">
          {/* the app is STILL THERE behind the dialog — receded by colour, drawn opaque, with the
              system scrim over it as light. (rule: depth is drawn, not dissolved) */}
          <EchallanApp cta={1} ctaLabel="PAY NOW" />
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#060B18"
            opacity={0.52} />
          <PermissionDialog y={SCREEN.y + 392} kind="call" press={0.6} />
          <StatusBar tint="#9CADCA" label="10:47" />
        </PhoneShell>
        <PhoneFurniture />
      </Rig>

      {/* the device PLUGS INTO its own interior: the chamber rim is drawn after the phone, so the
          foot of the device passes behind it and the two registers are physically one object */}
      <Chamber x={L.chamber.x} y={L.chamber.y} w={L.chamber.w} h={L.chamber.h} ground={g.deep}
        t={t} open={1} />

      <Route from={L.nodes.sms} to={pay} cap="sms" ground={g.deep} grow={1} strength={0.55}
        flow={t * 1.6} bend={0.30} />
      <Route from={L.nodes.call} to={pay} cap="call" ground={g.deep} grow={0.74} strength={1}
        flow={t * 1.1} bend={-0.30} />

      {/* back wall + rails, then the payload, then the front lip over it — draw order IS the
          depth here, and it is what makes the payload read as contained */}
      <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h} ground={g.deep}
        depth={0.16} front={false} label={false} />
      <Payload cx={L.payload.cx} cy={L.payload.cy} w={L.payload.w} ground={g.deep} depth={0.10}
        live={0.30} />
      <AppShell cx={L.shell.cx} cy={L.shell.cy} w={L.shell.w} h={L.shell.h} ground={g.deep}
        depth={0.16} back={false} />

      <CapNode cx={L.nodes.sms[0]} cy={L.nodes.sms[1]} r={48} cap="sms" ground={g.deep}
        granted={1} depth={0.12} t={t} />
      <CapNode cx={L.nodes.call[0]} cy={L.nodes.call[1]} r={48} cap="call" ground={g.deep}
        granted={0.74} depth={0.06} t={t} />
      <CapNode cx={L.nodes.bg[0]} cy={L.nodes.bg[1]} r={48} cap="bg" ground={g.deep}
        granted={0} depth={0.30} t={t} />
      <CapNode cx={L.nodes.vpn[0]} cy={L.nodes.vpn[1]} r={48} cap="vpn" ground={g.deep}
        granted={0} depth={0.30} t={t} />

      <Title n="03" t="PERMISSION TOPOLOGY"
        sub={'t \u2248 46 s \u00b7 SMS is granted and live \u00b7 CALLS is arriving \u00b7 the other two have no route at all'} />
    </g>
  );
};

/* ══ BOARD 4 · PAYMENT ═════════════════════════════════════════════════════════════════════
   premortem F6. The calmest, lightest ground in the film; the topology present only as slow
   motion at low contrast (F5), because 10-15% static contrast does not survive H.264. */
const BoardPayment: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(tAt('payment') + 4);
  const pay: [number, number] = [540, 1392];
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <rect x={0} y={0} width={W} height={H * 0.70} fill={g.high} opacity={0.55} />

      <Rig s={0.88} dy={-118}>
        <PhoneShell screenBase="#E9EEF7">
          <PaymentForm typed={0.93} caret={1} />
          <StatusBar tint="#7E8CA8" label="10:51" />
        </PhoneShell>
        <PhoneFurniture />
      </Rig>

      {/* the infrastructure is STILL THERE and still running — quiet, low contrast, IN MOTION,
          because a static faint line does not survive the encoder but a moving one does */}
      <Chamber x={50} y={1248} w={980} h={300} ground={g.deep} t={t} open={1} />
      <Route from={[144, 1330]} to={pay} cap="sms" ground={g.deep} strength={0.14} flow={t * 1.4}
        bend={0.20} />
      <Route from={[144, 1486]} to={pay} cap="call" ground={g.deep} strength={0.11} flow={t * 1.0}
        bend={-0.16} />
      <Route from={[936, 1330]} to={pay} cap="bg" ground={g.deep} strength={0.11} flow={t * 0.8}
        bend={-0.20} />
      <AppShell cx={540} cy={1384} w={232} h={150} ground={g.deep} depth={0.60} label={false} />
      <Payload cx={pay[0]} cy={pay[1]} w={112} ground={g.deep} depth={0.52} live={0.16} />
      <VpnTunnel from={[598, 1392]} to={[1030, 1490]} ground={g.deep} strength={0.13}
        flow={t * 1.3} />

      <Title n="04" t="FALSE RESOLUTION · PAYMENT"
        sub="t ≈ 62 s · nothing in frame warns; the danger is carried by motion, not colour" />
    </g>
  );
};

/* ══ BOARD 5 · THE DROPPER REVEAL ══════════════════════════════════════════════════════════
   The shell SEPARATES. The plan says "becomes partially transparent"; the rule
   "depth is drawn, not dissolved" forbids dissolving a solid, and the plan's own §50 says
   "fake-app shell separates" — so it comes apart along the seam the viewer has been looking at
   since the second install. Recorded as a deliberate refinement in the ledger. */
const BoardReveal: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(tAt('dropper, and') + 1.4);
  const pay: [number, number] = [540, 1150];
  const nodes: Record<string, [number, number]> = {
    sms: [146, 990], call: [934, 990], bg: [146, 1388], vpn: [934, 1388],
  };
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <rect x={0} y={0} width={W} height={H * 0.44} fill={g.high} opacity={0.45} />

      <Rig s={0.58} dy={-176}>
        <PhoneShell screenBase="#E9EEF7">
          <PaymentSuccess draw={1} settle={1} />
          <StatusBar tint="#6E7C99" label="10:52" />
        </PhoneShell>
        <PhoneFurniture />
      </Rig>

      <Chamber x={36} y={862} w={1008} h={660} ground={g.deep} t={t} open={1} />


      <AppShell cx={540} cy={1168} w={396} h={250} ground={g.deep} depth={0.04} split={0.92}
        front={false} label={false} />
      {/* every granted route now bends INTO the payload — one at a time in the film */}
      <Route from={nodes.sms} to={pay} cap="sms" ground={g.deep} strength={1} flow={t * 2.6}
        bend={0.30} toward={1} />
      <Route from={nodes.call} to={pay} cap="call" ground={g.deep} strength={1} flow={t * 2.3}
        bend={-0.30} toward={1} />
      <Route from={nodes.bg} to={pay} cap="bg" ground={g.deep} strength={1} flow={t * 2.0}
        bend={-0.26} toward={1} />
      <VpnTunnel from={[648, 1172]} to={[1046, 1404]} ground={g.deep} strength={1} flow={t * 3.2}
        hot={0.78} />
      <Payload cx={pay[0]} cy={pay[1]} w={246} ground={g.deep} live={1} danger={0.72} />
      <AppShell cx={540} cy={1168} w={396} h={250} ground={g.deep} depth={0.04} split={0.92}
        back={false} />

      {(['sms', 'call', 'bg', 'vpn'] as const).map((k) => (
        <CapNode key={k} cx={nodes[k][0]} cy={nodes[k][1]} r={46} cap={k} ground={g.deep}
          granted={1} depth={0.10} t={t} />
      ))}

      <Title n="05" t="THE REVEAL · DROPPER"
        sub="t ≈ 71 s · the shell comes apart on its own seam; the payload is the SAME object" />
    </g>
  );
};

/* ══ BOARD 6 · OTP EXFILTRATION ════════════════════════════════════════════════════════════
   premortem F8. The original stays in the inbox — it is the largest type on the phone and it does
   not move. A DUPLICATE leaves along the SMS route that was granted at 44 s. Credentials and OTPs
   travel on SEPARATE LANES in distinct silhouettes and only meet in the endpoint's tray. */
const BoardOtp: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(tAt('incoming OTPs') + 1);
  const pay: [number, number] = [326, 1146];
  const end: [number, number] = [848, 1180];
  /* two lanes: the OTP arcs high out of the SMS route, credentials run low out of the form */
  const lane = (p: number, hi: boolean): [number, number] => {
    const x = lerp(pay[0] + 88, end[0] - 116, p);
    const k = Math.sin(p * Math.PI);
    return [x, pay[1] + (hi ? -78 * k - 6 : 96 * k + 10)];
  };
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <rect x={0} y={0} width={W} height={H * 0.44} fill={g.high} opacity={0.4} />

      <Rig s={0.62} dy={-176}>
        <PhoneShell screenBase="#0F1729">
          <SmsInbox arrive={1} />
          <StatusBar tint="#8DA0C2" label="10:53" />
        </PhoneShell>
        <PhoneFurniture />
      </Rig>

      <Chamber x={36} y={912} w={1008} h={560} ground={g.deep} t={t} open={1} />

      {/* the SMS route granted at 44 s is the route the copy leaves on — never a new path */}
      <Route from={[404, 936]} to={pay} cap="sms" ground={g.deep} strength={1} flow={t * 3.4}
        bend={0.26} />
      <Route from={[120, 1382]} to={pay} cap="call" ground={g.deep} strength={0.26} flow={t * 1.2}
        bend={-0.24} />
      <AppShell cx={326} cy={1166} w={268} h={178} ground={g.deep} depth={0.26} split={0.94}
        front={false} label={false} />
      <Payload cx={pay[0]} cy={pay[1]} w={150} ground={g.deep} live={1} danger={0.8} />
      <AppShell cx={326} cy={1166} w={268} h={178} ground={g.deep} depth={0.26} split={0.94}
        back={false} />
      <VpnTunnel from={[404, 1152]} to={[end[0] - 108, 1176]} ground={g.deep} strength={1}
        flow={t * 4.2} hot={0.8} />

      {/* TWO LANES, TWO SILHOUETTES. They are only ever side by side in the endpoint's tray. */}
      {[0.16, 0.52, 0.86].map((p, i) => {
        const [cx, cy] = lane(p, false);
        return <CredPacket key={`c${i}`} cx={cx} cy={cy} s={1} rot={-8 + i * 5} />;
      })}
      {[0.30, 0.70].map((p, i) => {
        const [cx, cy] = lane(p, true);
        return <OtpPacket key={`o${i}`} cx={cx} cy={cy} s={1} rot={6 - i * 4} />;
      })}

      <Endpoint cx={end[0]} cy={end[1]} s={0.82} ground={g.deep} t={t} awake={1}
        arrivals={[t - 0.2]} />

      {/* what arrived, docked in the rack's own tray — the endpoint RECEIVING, not a caption */}
      <g>
        <Solid x={end[0] - 92} y={end[1] + 138} w={260} h={96} r={14}
          base={recede('#1E2848', g.deep, 0.14)} litK={0.12} shadeK={0.2} elevation={8} />
        <CredPacket cx={end[0] - 44} cy={end[1] + 186} s={0.92} />
        <OtpPacket cx={end[0] + 40} cy={end[1] + 186} s={0.74} />
        <Label x={end[0] + 104} y={end[1] + 180} size={19} fill={C.ink} weight={700}>card</Label>
        <Label x={end[0] + 104} y={end[1] + 204} size={19} fill={C.ink} weight={700}>+ code</Label>
      </g>

      <Title n="06" t="OTP EXFILTRATION"
        sub="t ≈ 88 s · copied, not taken — the original is still the biggest thing on the phone" />
    </g>
  );
};

export const Boards: React.FC<{ page?: number }> = ({ page = 3 }) => {
  const t = useCurrentFrame() / FPS;
  const P = { 3: BoardPermissions, 4: BoardPayment, 5: BoardReveal, 6: BoardOtp }[page]
    ?? BoardPermissions;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <P t={t} />
      </svg>
    </AbsoluteFill>
  );
};
