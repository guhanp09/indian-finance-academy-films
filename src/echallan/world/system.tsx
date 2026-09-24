/* THE ANDROID SURFACES — four gates, four surfaces, never merged.
 *
 * premortem F4: the script itself hedges ("another Android installation OR security prompt") and
 * the standing temptation is to collapse install-source permission, package installation, runtime
 * permissions and VPN consent into one generic Allow card. They are four different things and the
 * film shows four different surfaces, in order:
 *
 *   1 InstallSourceSheet  a settings toggle — "allow THIS APP to install unknown apps"
 *   2 InstallerPanel      the package installer — the package's own identity, Install / Cancel
 *   3 PermissionDialog    a runtime permission — centred icon, Allow / Don't allow
 *   4 VpnConsent          a system-level connection request — wider, system chrome, a key
 *
 * Wording is generic Material-inspired throughout. No OEM is quoted, because no OEM's wording is
 * universal and inventing one would be a factual claim the film cannot support.
 */
import React from 'react';
import { AppTile } from '../v2/mark';
import { C, R, S, SCREEN, T } from '../design';
import { Glow, Label, Plate, Recess, Solid, lit, shade } from './kit';

const SHEET = '#EDF1F8';
const SYS_INK = '#141B2E';

/* a system text button — Android's are text, not filled pills, and that is diagnostic */
const TextButton: React.FC<{
  x: number; y: number; w: number; label: string; strong?: boolean; press?: number;
}> = ({ x, y, w, label, strong = false, press = 0 }) => (
  <g transform={`translate(0 ${press * 1.5})`}>
    {strong && <Solid x={x} y={y} w={w} h={56} r={R.button} base={C.cobalt} litK={0.2}
      shadeK={0.16} elevation={3 - press * 2.4} />}
    <Label x={x + w / 2} y={y + 37} size={25} fill={strong ? '#FFFFFF' : C.cobalt} weight={700}
      anchor="middle" track={0.6}>{label}</Label>
  </g>
);

/* ── GATE 1 · install-source permission ─────────────────────────────────────────────────────
   A settings row with a real toggle. The barrier this releases is drawn in interior.tsx — here
   the point is that Android is waiting for an EXPLICIT choice, so the surface is rigid and the
   toggle is the only thing on it that can move. */
export const InstallSourceSheet: React.FC<{
  y: number; on?: number; press?: number; warn?: number;
}> = ({ y, on = 0, press = 0, warn = 1 }) => {
  const x = SCREEN.x, w = SCREEN.w, h = 476;
  const tx = x + w - 122, ty = y + 300;
  return (
    <g>
      <Plate x={x - 4} y={y} w={w + 8} h={h + 40} r={30} base={SHEET} elevation={26} />
      <rect x={x + w / 2 - 34} y={y + 16} width={68} height={6} rx={3} fill="#B9C2D6" />

      {/* the warning: amber, restrained, and it is an ICON not an alarm */}
      <g opacity={warn}>
        <path d={`M${x + 52} ${y + 108} L${x + 86} ${y + 50} L${x + 120} ${y + 108} Z`}
          fill={C.amber} stroke={shade(C.amber, 0.35)} strokeWidth={S.detail} strokeLinejoin="round" />
        <rect x={x + 83} y={y + 68} width={6} height={22} rx={3} fill="#4A320A" />
        <circle cx={x + 86} cy={y + 98} r={3.4} fill="#4A320A" />
      </g>

      <Label x={x + 52} y={y + 168} size={34} fill={SYS_INK} weight={800}>Install unknown apps</Label>
      <Label x={x + 52} y={y + 214} size={23} fill="#5A6480" weight={600}>
        Your phone and data are more vulnerable
      </Label>
      <Label x={x + 52} y={y + 246} size={23} fill="#5A6480" weight={600}>
        to attack by unknown apps.
      </Label>

      {/* the source app, named — the film must never lose WHERE the package came from */}
      <Recess x={x + 40} y={y + 282} w={w - 80} h={92} r={16} host={SHEET} depthK={0.10} />
      <Solid x={x + 62} y={y + 304} w={50} h={50} r={14} base={C.chatGreen} litK={0.22} shadeK={0.2} />
      <path d={`M${x + 76} ${y + 318} h22 M${x + 76} ${y + 329} h22 M${x + 76} ${y + 340} h13`}
        stroke="#0B3A26" strokeWidth={3.4} strokeLinecap="round" />
      <Label x={x + 128} y={y + 322} size={25} fill={SYS_INK} weight={700}>Messenger</Label>
      <Label x={x + 128} y={y + 352} size={20} fill="#6C7690" weight={600}>Allow from this source</Label>

      {/* the toggle: the one moving part */}
      <Solid x={tx} y={ty} w={82} h={44} r={22} base={on > 0.5 ? C.green : '#AEB7CB'}
        litK={0.18} shadeK={0.18} elevation={2} />
      <circle cx={tx + 22 + on * 38} cy={ty + 22} r={26 - press * 2}
        fill={on > 0.5 ? lit(C.green, 0.45) : '#F7F9FD'} />
      <circle cx={tx + 22 + on * 38} cy={ty + 22} r={26 - press * 2} fill="none"
        stroke={shade(on > 0.5 ? C.green : '#AEB7CB', 0.3)} strokeWidth={1.4} />
    </g>
  );
};

/* ── GATE 2 · the package installer ─────────────────────────────────────────────────────────
   Shows the PACKAGE's own identity, which is what makes this a different surface from gate 1 and
   what lets the viewer recognise the same app again when it opens. */
export const InstallerPanel: React.FC<{
  y: number; progress?: number; press?: number; title?: string; icon?: React.ReactNode;
}> = ({ y, progress = -1, press = 0, title = 'e-Challan Services', icon }) => {
  const x = SCREEN.x + 16, w = SCREEN.w - 32, h = 372;
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} r={26} base={SHEET} elevation={24} />
      <g transform={`translate(${x + w / 2 - 44} ${y + 40})`}>{icon}</g>
      <Label x={x + w / 2} y={y + 178} size={31} fill={SYS_INK} weight={800} anchor="middle">
        {title}
      </Label>
      {progress < 0 ? (
        <>
          <Label x={x + w / 2} y={y + 222} size={23} fill="#5A6480" weight={600} anchor="middle">
            Do you want to install this app?
          </Label>
          <TextButton x={x + 36} y={y + 272} w={150} label="CANCEL" />
          <TextButton x={x + w - 214} y={y + 272} w={178} label="INSTALL" strong press={press} />
        </>
      ) : (
        <>
          <Label x={x + w / 2} y={y + 222} size={23} fill="#5A6480" weight={600} anchor="middle">
            Installing…
          </Label>
          <Recess x={x + 46} y={y + 262} w={w - 92} h={14} r={7} host={SHEET} depthK={0.14} />
          <rect x={x + 46} y={y + 262} width={(w - 92) * Math.max(0, Math.min(1, progress))}
            height={14} rx={7} fill={C.cobalt} />
        </>
      )}
    </g>
  );
};

/* ── GATE 3 · a runtime permission ──────────────────────────────────────────────────────────
   Material's shape: icon centred above the text, two text buttons. Each permission gets its own
   ICON SILHOUETTE and its own colour, kept for the life of the film, because the viewer has to
   recognise the capability again 40 seconds later at the reveal. */
export const PermIcon: React.FC<{ kind: 'sms' | 'call' | 'bg' | 'vpn'; cx: number; cy: number; s: number }> =
  ({ kind, cx, cy, s }) => {
    const col = { sms: C.smsCyan, call: C.callViolet, bg: C.bgAmber, vpn: C.vpnRose }[kind];
    return (
      <g transform={`translate(${cx} ${cy}) scale(${s})`}>
        <circle cx={0} cy={0} r={46} fill={shade(col, 0.72)} />
        <circle cx={0} cy={0} r={46} fill={col} opacity={0.22} />
        {kind === 'sms' && (
          <g fill="none" stroke={col} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M-26 -19 h52 a6 6 0 0 1 6 6 v25 a6 6 0 0 1 -6 6 h-30 l-16 13 v-13 h-6
                     a6 6 0 0 1 -6 -6 v-25 a6 6 0 0 1 6 -6 Z" fill={shade(col, 0.5)} />
            <path d="M-14 -3 h28 M-14 9 h17" />
          </g>
        )}
        {kind === 'call' && (
          /* the classic handset silhouette — the single most recognisable phone glyph */
          <path d="M-22 -24 a9 9 0 0 1 13 -1 l7 8 a8 8 0 0 1 -1 11 l-5 4 a34 34 0 0 0 15 15 l4 -5
                   a8 8 0 0 1 11 -1 l8 7 a9 9 0 0 1 -1 13 l-6 5 c-6 5 -15 4 -24 -2
                   a72 72 0 0 1 -26 -26 c-6 -9 -7 -18 -2 -24 Z"
            fill={col} stroke={shade(col, 0.4)} strokeWidth={2.4} strokeLinejoin="round" />
        )}
        {kind === 'bg' && (
          <g>
            {/* a core that keeps running: a filled centre inside an orbit with a gap */}
            <circle cx={0} cy={0} r={12} fill={col} />
            <path d="M0 -26 a26 26 0 1 1 -18 7" fill="none" stroke={col} strokeWidth={5}
              strokeLinecap="round" />
            <path d="M-24 -6 l6 13 l13 -6" fill="none" stroke={col} strokeWidth={5}
              strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {kind === 'vpn' && (
          <g>
            <path d="M0 -28 l24 10 v16 c0 14 -10 24 -24 30 c-14 -6 -24 -16 -24 -30 v-16 Z"
              fill={shade(col, 0.45)} stroke={col} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={0} cy={-2} r={7} fill="none" stroke={col} strokeWidth={4.4} />
            <path d="M0 5 v14 M0 12 h7" stroke={col} strokeWidth={4.4} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

export const PermissionDialog: React.FC<{
  y: number; kind: 'sms' | 'call'; press?: number; scale?: number;
}> = ({ y, kind, press = 0, scale = 1 }) => {
  const x = SCREEN.x + 22, w = SCREEN.w - 44, h = 396;
  const body = kind === 'sms'
    ? ['Allow e-Challan Services to', 'send and view SMS messages?']
    : ['Allow e-Challan Services to', 'make and manage phone calls?'];
  return (
    <g transform={`translate(${SCREEN.x + SCREEN.w / 2} ${y + h / 2}) scale(${scale}) translate(${-(SCREEN.x + SCREEN.w / 2)} ${-(y + h / 2)})`}>
      <Plate x={x} y={y} w={w} h={h} r={28} base={SHEET} elevation={24} />
      <PermIcon kind={kind} cx={SCREEN.x + SCREEN.w / 2} cy={y + 92} s={0.9} />
      {body.map((line, i) => (
        <Label key={i} x={SCREEN.x + SCREEN.w / 2} y={y + 186 + i * 40} size={28} fill={SYS_INK}
          weight={700} anchor="middle">{line}</Label>
      ))}
      <Label x={SCREEN.x + SCREEN.w / 2} y={y + 268} size={21} fill="#6C7690" weight={600}
        anchor="middle">1 of 3</Label>
      <TextButton x={x + 24} y={y + 300} w={196} label="DON'T ALLOW" />
      <TextButton x={x + w - 190} y={y + 300} w={166} label="ALLOW" strong press={press} />
    </g>
  );
};

/* ── GATE 4 · VPN consent ───────────────────────────────────────────────────────────────────
   Deliberately NOT one of the runtime cards: wider, squarer, with system chrome and a key, because
   it is a system-level connection request and the film's claim is that this is a different kind of
   thing to agree to. */
export const VpnConsent: React.FC<{ y: number; press?: number }> = ({ y, press = 0 }) => {
  const x = SCREEN.x + 8, w = SCREEN.w - 16, h = 414;
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} r={18} base="#E4E9F2" elevation={28} />
      <rect x={x} y={y} width={w} height={64} rx={18} fill={C.slate} />
      <rect x={x} y={y + 40} width={w} height={24} fill={C.slate} />
      <Label x={x + 24} y={y + 42} size={23} fill="#CBD5EA" weight={700} track={1.6}>
        CONNECTION REQUEST
      </Label>
      <PermIcon kind="vpn" cx={x + 78} cy={y + 150} s={0.82} />
      <Label x={x + 146} y={y + 132} size={28} fill={SYS_INK} weight={800}>
        e-Challan Services
      </Label>
      <Label x={x + 146} y={y + 168} size={22} fill="#5A6480" weight={600}>
        wants to set up a VPN connection
      </Label>
      <Recess x={x + 26} y={y + 214} w={w - 52} h={92} r={14} host="#E4E9F2" depthK={0.10} />
      <Label x={x + 48} y={y + 250} size={21} fill="#5A6480" weight={600}>
        This allows it to monitor network
      </Label>
      <Label x={x + 48} y={y + 282} size={21} fill="#5A6480" weight={600}>
        traffic. Only accept if you trust it.
      </Label>
      <TextButton x={x + 30} y={y + 330} w={140} label="CANCEL" />
      <TextButton x={x + w - 170} y={y + 330} w={140} label="OK" strong press={press} />
    </g>
  );
};

/* ── THE FAKE APP'S IDENTITY ────────────────────────────────────────────────────────────────
   One icon, from the moment the package becomes an app to the moment the shell comes off it. */
export const AppIcon: React.FC<{ x: number; y: number; s: number; dim?: number; rec?: number;
  open?: number }> = ({ x, y, s, dim = 0, rec = 0, open = 0.62 }) => (
    /* THE MARK IS A CAMERA LENS. An e-Challan comes off a traffic camera, so at icon size this is
       an ordinary, plausible, faintly boring government-app mark — and it is the same object that
       later opens over the city as an eye. See v2/mark.tsx: nothing is added to make it sinister,
       ONE red light comes on inside it. */
    <g transform={`translate(${x + 44 * s} ${y + 44 * s}) scale(${s})`}>
      <AppTile s={44} dim={dim} rec={rec} open={open} />
    </g>
  );
