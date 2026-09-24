/* THE FAKE APP'S SCREENS — what the victim sees, from "it opened" to "it worked".
 *
 * Phase 9 is governed by premortem F6: this has to be the CALMEST, most credible screen in the
 * film. If it still looks sinister, nobody believes a person would type their card into it, and
 * the film becomes a story about an idiot instead of a story about a well-built trap. So: clean
 * spacing, institutional blue and white, restrained green, no warning colour anywhere, and the
 * danger present only in the interior below, carried by slow motion at low contrast.
 */
import React from 'react';
import { C, R, S, SCREEN, STATUS_H, T } from '../design';
import { Glow, Label, Plate, Recess, Solid, lit, shade } from './kit';
import { AppIcon, PermIcon } from './system';
import { Seal, NumberPlate } from './chat';

const PAPER = '#F3F6FC';
const INK = '#141B30';

/** the fake service's app bar — the institutional identity, reused on every one of its screens */
export const AppChrome: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <g>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={STATUS_H + 104} fill={C.cobalt} />
    <rect x={SCREEN.x} y={SCREEN.y + STATUS_H + 100} width={SCREEN.w} height={4} fill={C.yellow} />
    <Seal cx={SCREEN.x + 48} cy={SCREEN.y + STATUS_H + 50} r={23} color="#D9E4FF" />
    <Label x={SCREEN.x + 86} y={SCREEN.y + STATUS_H + 44} size={29} fill="#FFFFFF" weight={800}
      track={1.4}>{title}</Label>
    {sub && (
      <Label x={SCREEN.x + 86} y={SCREEN.y + STATUS_H + 74} size={19} fill="#BFD2FA" weight={600}
        track={1.2}>{sub}</Label>
    )}
  </g>
);

/* ── THE FAKE SERVICE ───────────────────────────────────────────────────────────────────────
   Symmetrical, orderly, institutional. It is meant to feel SAFER than the Android warning that
   preceded it — the calm is the deception. */
export const EchallanApp: React.FC<{
  detail?: number; amount?: number; cta?: number; ctaLabel?: string; ctaPress?: number;
}> = ({ detail = 1, amount = 1, cta = 1, ctaLabel = 'PAY NOW', ctaPress = 0 }) => {
  const x = SCREEN.x + 26, w = SCREEN.w - 52;
  const top = SCREEN.y + STATUS_H + 104;
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#E9EEF7" />
      <AppChrome title="e-Challan Services" sub="TRAFFIC VIOLATION PAYMENT" />

      <g opacity={detail}>
        <Plate x={x} y={top + 36} w={w} h={250} r={18} base={PAPER} elevation={6} />
        <Label x={x + 24} y={top + 76} size={19} fill="#6A748E" weight={700} track={1.6}>
          VEHICLE NUMBER
        </Label>
        <NumberPlate x={x + 24} y={top + 90} w={w * 0.46} reveal={detail} />
        <Label x={x + w - 24} y={top + 76} size={19} fill="#6A748E" weight={700} track={1.6}
          anchor="end">CHALLAN NO.</Label>
        <Label x={x + w - 24} y={top + 120} size={25} fill={INK} weight={700} anchor="end" mono>
          2419703
        </Label>
        <path d={`M${x + 24} ${top + 160} H${x + w - 24}`} stroke="#DCE2EF" strokeWidth={2} />
        <Label x={x + 24} y={top + 196} size={19} fill="#6A748E" weight={700} track={1.6}>
          OFFENCE
        </Label>
        <Label x={x + 24} y={top + 232} size={26} fill={INK} weight={700}>
          Signal violation
        </Label>
        <Label x={x + w - 24} y={top + 196} size={19} fill="#6A748E" weight={700} track={1.6}
          anchor="end">DATE</Label>
        <Label x={x + w - 24} y={top + 232} size={26} fill={INK} weight={700} anchor="end" mono>
          14 / 03
        </Label>
      </g>

      <g opacity={amount}>
        <Plate x={x} y={top + 310} w={w} h={150} r={18} base={PAPER} elevation={6} />
        <Label x={x + 24} y={top + 352} size={19} fill="#6A748E" weight={700} track={1.6}>
          TOTAL PAYABLE
        </Label>
        <Label x={x + 24} y={top + 420} size={58} fill={INK} weight={800}>{'₹ 1,000'}</Label>
        <Solid x={x + w - 148} y={top + 370} w={124} h={42} r={R.chip} base={C.yellow} litK={0.24}
          shadeK={0.18} elevation={2} />
        <Label x={x + w - 86} y={top + 399} size={20} fill="#3A2B06" weight={800} anchor="middle"
          track={1.2}>PENDING</Label>
      </g>

      <g opacity={cta} transform={`translate(0 ${ctaPress * 3})`}>
        <Solid x={x} y={top + 506} w={w} h={82} r={R.button} base={C.cobalt} litK={0.22}
          shadeK={0.2} elevation={8 - ctaPress * 6} />
        <Label x={x + w / 2} y={top + 557} size={30} fill="#FFFFFF" weight={800} anchor="middle"
          track={1.8}>{ctaLabel}</Label>
      </g>

      {/* the reassurance line — the lie that costs the least to tell */}
      <g opacity={cta * 0.9}>
        <path d="M0 0" />
        <g transform={`translate(${SCREEN.x + SCREEN.w / 2 - 92} ${top + 620})`}>
          <rect x={0} y={4} width={17} height={14} rx={3} fill="#7F8AA3" />
          <path d="M3.5 4 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke="#7F8AA3" strokeWidth={2.6} />
          <Label x={28} y={17} size={19} fill="#7F8AA3" weight={600}>
            Secure government payment
          </Label>
        </g>
      </g>
    </g>
  );
};

/* ── THE UPDATE INTRUSION ───────────────────────────────────────────────────────────────────
   Rises from WITHIN the app, not from outside the phone: the plan is explicit, and it is what
   makes the second install feel like part of the same trustworthy thing. Amber rim only. */
export const UpdateCard: React.FC<{ y: number; press?: number; rim?: number }> =
  ({ y, press = 0, rim = 1 }) => {
    const x = SCREEN.x + 30, w = SCREEN.w - 60, h = 404;
    const cx = SCREEN.x + SCREEN.w / 2;
    /* a dialog: a raised card with its own margins, content inset from every edge, and its
       actions on a row that sits ABOVE the bottom edge rather than on it */
    return (
      <g>
        <Plate x={x} y={y} w={w} h={h} r={28} base={PAPER} elevation={26} />
        <rect x={x} y={y} width={w} height={h} rx={28} fill="none" stroke={C.amber}
          strokeWidth={3} opacity={rim * 0.9} />
        <rect x={x + 2} y={y + 2} width={w - 4} height={26} rx={26} fill="#FFFFFF" opacity={0.5} />
        {/* the update glyph */}
        <g transform={`translate(${cx} ${y + 96})`}>
          <circle cx={0} cy={0} r={46} fill={shade(C.cobalt, 0.86)} />
          <circle cx={0} cy={0} r={46} fill={C.cobalt} opacity={0.10} />
          <path d="M0 -28 a28 28 0 1 1 -24 13" fill="none" stroke={C.cobalt} strokeWidth={5.6}
            strokeLinecap="round" />
          <path d="M0 -37 l0 18 l-14 -9 Z" fill={C.cobalt} />
          <path d="M0 -6 v18 M-10 4 l10 10 l10 -10" fill="none" stroke={C.cobalt} strokeWidth={4.8}
            strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <Label x={cx} y={y + 190} size={33} fill={INK} weight={800} anchor="middle">Update required</Label>
        <Label x={cx} y={y + 232} size={22} fill="#6A748E" weight={600} anchor="middle">
          A newer version is needed to
        </Label>
        <Label x={cx} y={y + 262} size={22} fill="#6A748E" weight={600} anchor="middle">
          process your payment.
        </Label>
        <path d={`M${x + 28} ${y + 292} H${x + w - 28}`} stroke="#E4E9F4" strokeWidth={2} />
        {/* the actions, inset, with the dismissive one written as plain text as a dialog does */}
        <Label x={x + 46} y={y + 350} size={23} fill="#7A85A0" weight={800} track={1.1}>LATER</Label>
        <g transform={`translate(0 ${press * 3})`}>
          <Solid x={x + w - 28 - 268} y={y + 316} w={268} h={64} r={R.button} base={C.cobalt}
            litK={0.22} shadeK={0.2} elevation={7 - press * 5} />
          <Label x={x + w - 28 - 134} y={y + 356} size={23} fill="#FFFFFF" weight={800}
            anchor="middle" track={0.9}>INSTALL UPDATE</Label>
        </g>
      </g>
    );
  };

/* ── THE PAYMENT FORM ───────────────────────────────────────────────────────────────────────
   The calmest screen in the film. Values are masked and generic: the film depicts a trap, it does
   not teach one. `typed` fills the fields in the order a person actually fills them. */
export const PaymentForm: React.FC<{
  typed?: number; press?: number; caret?: number;
}> = ({ typed = 1, press = 0, caret = 0 }) => {
  const x = SCREEN.x + 26, w = SCREEN.w - 52;
  const top = SCREEN.y + STATUS_H + 104;
  const field = (fy: number, label: string, value: string, fw = w, fx = x, active = false) => (
    <g>
      <Label x={fx + 4} y={fy - 12} size={19} fill="#6A748E" weight={700} track={1.4}>{label}</Label>
      <Plate x={fx} y={fy} w={fw} h={72} r={12} base="#FFFFFF" elevation={2} />
      <rect x={fx} y={fy} width={fw} height={72} rx={12} fill="none"
        stroke={active ? C.cobalt : '#D5DDEC'} strokeWidth={active ? 3 : 2} />
      <Label x={fx + 20} y={fy + 48} size={28} fill={INK} weight={700} mono track={1.6}>{value}</Label>
      {active && caret > 0.5 && (
        <rect x={fx + 24 + value.length * 17} y={fy + 22} width={3} height={30} fill={C.cobalt} />
      )}
    </g>
  );
  const card = '5241 88'.slice(0, Math.round(Math.min(1, typed / 0.45) * 7))
    + (typed > 0.45 ? '•• •••• 4417'.slice(0,
      Math.round(Math.min(1, (typed - 0.45) / 0.3) * 14)) : '');
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#E9EEF7" />
      <AppChrome title="Secure Payment" sub="CHALLAN 2419703" />
      <Label x={x} y={top + 58} size={22} fill="#5D6880" weight={600}>Paying</Label>
      <Label x={x + w} y={top + 58} size={32} fill={INK} weight={800} anchor="end">{'₹ 1,000'}</Label>
      <path d={`M${x} ${top + 82} H${x + w}`} stroke="#D9E0EE" strokeWidth={2} />

      {field(top + 138, 'CARD NUMBER', card, w, x, typed < 0.78)}
      {field(top + 254, 'EXPIRY', typed > 0.78 ? '09 / 27' : '', w * 0.46, x,
        typed >= 0.78 && typed < 0.9)}
      {field(top + 254, 'CVV', typed > 0.9 ? '•••' : '', w * 0.46,
        x + w * 0.54, typed >= 0.9)}
      {field(top + 370, 'NAME ON CARD', typed > 0.96 ? 'R. KULKARNI' : '', w, x, false)}

      <g transform={`translate(0 ${press * 3})`} opacity={typed > 0.97 ? 1 : 0.45}>
        <Solid x={x} y={top + 486} w={w} h={82} r={R.button} base={typed > 0.97 ? C.green : '#9EA9C0'}
          litK={0.22} shadeK={0.2} elevation={8 - press * 6} />
        <Label x={x + w / 2} y={top + 537} size={30} fill="#08301C" weight={800} anchor="middle"
          track={1.6}>{'PAY ₹ 1,000'}</Label>
      </g>
      <g transform={`translate(${SCREEN.x + SCREEN.w / 2 - 78} ${top + 600})`}>
        <rect x={0} y={4} width={17} height={14} rx={3} fill="#7F8AA3" />
        <path d="M3.5 4 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke="#7F8AA3" strokeWidth={2.6} />
        <Label x={28} y={17} size={19} fill="#7F8AA3" weight={600}>256-bit encrypted</Label>
      </g>
    </g>
  );
};

/* ── THE FALSE ENDING ───────────────────────────────────────────────────────────────────────
   premortem F7: the loop has to CLOSE. The tick DRAWS (it never pops full-formed), the receipt
   settles, and everything else in the frame stops moving. */
export const PaymentSuccess: React.FC<{ draw?: number; settle?: number }> =
  ({ draw = 1, settle = 1 }) => {
    const x = SCREEN.x + 26, w = SCREEN.w - 52;
    const top = SCREEN.y + STATUS_H + 104;
    const cy = top + 190;
    const L = 150;
    return (
      <g>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#E9EEF7" />
        <AppChrome title="e-Challan Services" sub="PAYMENT CONFIRMATION" />
        <Plate x={x} y={top + 56} w={w} h={470} r={20} base={PAPER} elevation={8} />
        <circle cx={SCREEN.x + SCREEN.w / 2} cy={cy} r={62} fill={shade(C.green, 0.80)} />
        <circle cx={SCREEN.x + SCREEN.w / 2} cy={cy} r={62} fill={C.green} opacity={0.18} />
        <path d={`M${SCREEN.x + SCREEN.w / 2 - 30} ${cy + 2}
                  L${SCREEN.x + SCREEN.w / 2 - 8} ${cy + 24}
                  L${SCREEN.x + SCREEN.w / 2 + 32} ${cy - 22}`}
          fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={L} strokeDashoffset={L * (1 - Math.max(0, Math.min(1, draw)))} />
        <g opacity={settle}>
          <Label x={SCREEN.x + SCREEN.w / 2} y={cy + 128} size={35} fill={INK} weight={800}
            anchor="middle">Payment successful</Label>
          <Label x={SCREEN.x + SCREEN.w / 2} y={cy + 172} size={23} fill="#6A748E" weight={600}
            anchor="middle">Challan 2419703 has been settled.</Label>
          <path d={`M${x + 34} ${cy + 204} H${x + w - 34}`} stroke="#DCE2EF" strokeWidth={2} />
          <Label x={x + 34} y={cy + 246} size={22} fill="#6A748E" weight={600}>Amount paid</Label>
          <Label x={x + w - 34} y={cy + 246} size={28} fill={INK} weight={800} anchor="end">
            {'₹ 1,000'}
          </Label>
        </g>
      </g>
    );
  };

/* ── THE MESSAGES APP ───────────────────────────────────────────────────────────────────────
   The OTP arrives here, with ENTIRELY NORMAL styling and no malicious colour, and it STAYS here
   for the rest of the sequence — premortem F8. The reason victims do not notice is precisely that
   the message is still sitting in their inbox. */
export const SmsInbox: React.FC<{ arrive?: number; peel?: number }> = ({ arrive = 1, peel = 0 }) => {
  const x = SCREEN.x + 20, w = SCREEN.w - 40;
  const top = SCREEN.y + STATUS_H + 96;
  const cy = top + 120;
  const H = 234;
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#0F1729" />
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={STATUS_H + 96} fill="#17223A" />
      <Label x={SCREEN.x + 28} y={SCREEN.y + STATUS_H + 60} size={31} fill="#EDF2FC" weight={800}>
        Messages
      </Label>
      <PermIcon kind="sms" cx={SCREEN.x + SCREEN.w - 56} cy={SCREEN.y + STATUS_H + 48} s={0.38} />

      {/* the OTP, normal in every way — and it STAYS here for the rest of the sequence */}
      <g transform={`translate(0 ${(1 - arrive) * -80})`} opacity={arrive}>
        <Solid x={x} y={cy} w={w} h={H} r={16} base="#1B2740" litK={0.10} shadeK={0.14}
          elevation={6} />
        <circle cx={x + 44} cy={cy + 48} r={26} fill="#2B3A5C" />
        <Label x={x + 44} y={cy + 57} size={24} fill="#9FB2D6" weight={800} anchor="middle">B</Label>
        <Label x={x + 84} y={cy + 44} size={26} fill="#DEE7F7" weight={700}>BK-VERIFY</Label>
        <Label x={x + w - 20} y={cy + 44} size={20} fill="#7788AA" weight={600} anchor="end">now</Label>
        <Label x={x + 84} y={cy + 86} size={23} fill="#A9B8D4" weight={600}>
          OTP for a transaction of
        </Label>
        <Label x={x + 84} y={cy + 118} size={23} fill="#A9B8D4" weight={600}>
          {'\u20B9 1,000. Do not share it.'}
        </Label>
        {/* the code: the thing the malware is after, and the largest type on the screen */}
        <Recess x={x + 84} y={cy + 140} w={230} h={64} r={10} host="#1B2740" depthK={0.34} />
        <Label x={x + 199} y={cy + 187} size={40} fill="#EFF4FF" weight={800} mono anchor="middle"
          track={4}>418207</Label>
      </g>
    </g>
  );
};

/* ── THE SAFE ROUTE ─────────────────────────────────────────────────────────────────────────
   A browser the user drove themselves. Its authority comes from the ROUTE — a URL bar with a lock
   that the viewer watched being typed — not from a pile of logos (addendum §55). Deliberately the
   least busy surface in the film. */
export const Browser: React.FC<{
  typed?: number; loaded?: number; looked?: number; verified?: number; state?: number;
}> = ({ typed = 1, loaded = 1, looked = 0, verified = 0, state = 0 }) => {
  const x = SCREEN.x + 24, w = SCREEN.w - 48;
  const top = SCREEN.y + STATUS_H + 96;
  const url = 'echallan.gov-portal.example';
  const shown = url.slice(0, Math.round(typed * url.length));
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#EEF2F8" />
      {/* browser chrome */}
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={STATUS_H + 96} fill="#DDE4EF" />
      <Plate x={x} y={SCREEN.y + STATUS_H + 16} w={w} h={62} r={31} base="#FFFFFF" elevation={2} />
      <g transform={`translate(${x + 26} ${SCREEN.y + STATUS_H + 38})`}>
        <rect x={0} y={-2} width={17} height={14} rx={3} fill={C.green} />
        <path d="M3.5 -2 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke={C.green} strokeWidth={2.6} />
      </g>
      <Label x={x + 56} y={SCREEN.y + STATUS_H + 56} size={23} fill={INK} weight={600} mono>
        {shown}
      </Label>
      {typed < 0.99 && (
        <rect x={x + 58 + shown.length * 13} y={SCREEN.y + STATUS_H + 34} width={3} height={28}
          fill={C.cobalt} />
      )}

      {/* the page */}
      <g opacity={loaded}>
        <rect x={SCREEN.x} y={top} width={SCREEN.w} height={92} fill={C.slate} />
        <Seal cx={SCREEN.x + 46} cy={top + 46} r={22} color="#D9E4FF" />
        <Label x={SCREEN.x + 84} y={top + 40} size={26} fill="#FFFFFF" weight={800} track={1.2}>
          e-Challan
        </Label>
        <Label x={SCREEN.x + 84} y={top + 68} size={18} fill="#B9C6E4" weight={600} track={1.2}>
          OFFICIAL VERIFICATION PORTAL
        </Label>

        <Label x={x} y={top + 156} size={20} fill="#66708C" weight={700} track={1.4}>
          VEHICLE NUMBER
        </Label>
        <Plate x={x} y={top + 176} w={w} h={78} r={12} base="#FFFFFF" elevation={2} />
        <rect x={x} y={top + 176} width={w} height={78} rx={12} fill="none"
          stroke={looked > 0.1 ? C.cobalt : '#CFD8E8'} strokeWidth={looked > 0.1 ? 3 : 2} />
        {/* the SAME vehicle number from the notice — continuity is the argument */}
        <g opacity={looked}><NumberPlate x={x + 18} y={top + 190} w={w * 0.52} reveal={looked} /></g>

        <g opacity={Math.max(0, Math.min(1, (looked - 0.6) * 2.5))}>
          <Solid x={x} y={top + 282} w={w} h={74} r={R.button} base={C.cobalt} litK={0.22}
            shadeK={0.2} elevation={6} />
          <Label x={x + w / 2} y={top + 328} size={26} fill="#FFFFFF" weight={800} anchor="middle"
            track={1.6}>CHECK STATUS</Label>
        </g>

        {/* the result. Calm green, one restrained confirmation, no fanfare. */}
        <g opacity={verified}>
          <Plate x={x} y={top + 394} w={w} h={168} r={16} base="#FFFFFF" elevation={5} />
          <circle cx={x + 58} cy={top + 462} r={30} fill={shade(C.green, 0.82)} />
          <path d={`M${x + 44} ${top + 462} l11 12 l20 -22`} fill="none" stroke={C.green}
            strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={48} strokeDashoffset={48 * (1 - verified)} />
          <Label x={x + 104} y={top + 452} size={26} fill={INK} weight={800}>
            No pending challan
          </Label>
          <Label x={x + 104} y={top + 486} size={20} fill="#66708C" weight={600}>
            for MH 02 CJ 4471
          </Label>
        </g>

        {/* the state route, offered as a SECOND option, never a competing focal card */}
        <g opacity={state * 0.9}>
          <Label x={x} y={top + 614} size={20} fill="#66708C" weight={600}>
            or your state traffic police website
          </Label>
          <path d={`M${x} ${top + 626} H${x + 366}`} stroke="#9FAAC4" strokeWidth={2}
            strokeDasharray="6 6" />
        </g>
      </g>
    </g>
  );
};
