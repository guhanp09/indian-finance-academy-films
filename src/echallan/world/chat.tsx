/* THE MESSAGE REGISTER — the chat, the challan notice, the plate, the vehicle, the attachment.
 *
 * This is the film's hook, and premortem F13 rules it: the stop must come from COMPOSITION, not
 * from a warning. Everything here is built to look CREDIBLE. Nothing in this file is allowed to
 * hint that the message is hostile — no red, no alarm, no label. The contradiction the viewer is
 * meant to feel is structural: an official traffic notice arriving as a chat attachment, with an
 * installable file on the bottom of it.
 *
 * The notice is deliberately GENERIC. It carries no state name, no real emblem and no real
 * department: the plan requires the sender be "generic enough not to counterfeit a specific
 * authority", and a film about forgery must not ship a usable forgery.
 */
import React from 'react';
import { C, R, S, SCREEN, STATUS_H, T } from '../design';
import { Label, Plate, Solid, lit, shade } from './kit';

export const BUBBLE = '#1F2C34';

/* ── NUMBER PLATE ───────────────────────────────────────────────────────────────────────────
   Diagnostic details: white ground, black keyline, and the 4-group alphanumeric rhythm. Those
   three are what make it a plate rather than a white box. */
export const NumberPlate: React.FC<{
  x: number; y: number; w: number; reveal?: number;
}> = ({ x, y, w, reveal = 1 }) => {
  const h = w * 0.30;
  /* MECHANICAL SPACING. Characters sit on a fixed monospace pitch derived from the plate's inner
     width, so the string can never overflow at any of the four sizes the film renders it at, and
     each character appears IN ITS FINAL POSITION rather than the row re-flowing as it grows.
     The 2-2-2-4 grouping is the diagnostic rhythm — the gaps carry it, so they are real cells. */
  const CELLS = 'MH 02 CJ 4471';
  const inner = w - h * 0.34;
  const pitch = inner / CELLS.length;
  const fs = pitch / 0.60;
  const n = reveal * CELLS.length;
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} r={5} base="#F0F2F1" elevation={2} />
      <rect x={x + h * 0.075} y={y + h * 0.075} width={w - h * 0.15} height={h * 0.85} rx={3}
        fill="none" stroke="#14181F" strokeWidth={Math.max(1.6, h * 0.045)} />
      {[...CELLS].map((ch, i) => ch === ' ' ? null : (
        <Label key={i} x={x + h * 0.17 + pitch * (i + 0.5)} y={y + h * 0.70} size={fs}
          fill="#101319" weight={800} anchor="middle" mono
          opacity={Math.max(0, Math.min(1, n - i))}>{ch}</Label>
      ))}
    </g>
  );
};

/* ── VEHICLE ────────────────────────────────────────────────────────────────────────────────
   Side silhouette. Diagnostic details: the greenhouse (window line stepping down to the bonnet),
   two wheels with hubs, and an arch cut over each wheel. A capsule with two circles is a toy. */
export const Car: React.FC<{ x: number; y: number; w: number; fill?: string }> =
  ({ x, y, w, fill = C.sky }) => {
    const s = w / 100;
    const body = shade(fill, 0.10), roof = lit(fill, 0.18);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* greenhouse first, so the body overlaps it and the window line reads as a step */}
        <path d="M30 18 L62 18 Q72 18 77 27 L82 36 L26 36 Z" fill={roof} />
        <path d="M34 22 L47 22 L47 34 L30 34 Z M51 22 L60 22 Q67 22 71 28 L75 34 L51 34 Z"
          fill="#0B1226" opacity={0.55} />
        {/* body with wheel arches cut out */}
        <path d="M10 36 L92 36 Q97 36 97 42 L97 52 Q97 56 93 56 L83 56
                 A11 11 0 0 0 61 56 L39 56 A11 11 0 0 0 17 56 L9 56 Q5 56 5 52 L5 43 Q5 38 10 36 Z"
          fill={body} />
        <path d="M6 42 L96 42" stroke={lit(fill, 0.30)} strokeWidth={1.6} opacity={0.5} />
        <path d="M5 55 L97 55" stroke={shade(fill, 0.55)} strokeWidth={2} opacity={0.8} />
        <path d="M47 37 L47 55" stroke={shade(fill, 0.45)} strokeWidth={1.5} opacity={0.65} />
        <path d="M74 44 a3 3 0 1 1 0.1 0" fill={lit(fill, 0.4)} opacity={0.8} />
        {[28, 72].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={54} r={11.5} fill="#0C1120" />
            <circle cx={cx} cy={54} r={10} fill="#141B2E" />
            <circle cx={cx} cy={54} r={6} fill={shade(fill, 0.30)} />
            <circle cx={cx} cy={54} r={2.4} fill={lit(fill, 0.38)} />
          </g>
        ))}
        <rect x={92} y={39} width={6} height={4} rx={1.6} fill={C.yellow} opacity={0.9} />
      </g>
    );
  };

/* ── SEAL ───────────────────────────────────────────────────────────────────────────────────
   A generic official mark: a ring, a radial tick band, and an abstract chevron device. It reads
   "government stationery" at 40px without being any real authority's emblem. */
export const Seal: React.FC<{ cx: number; cy: number; r: number; color: string; opacity?: number }> =
  ({ cx, cy, r, color, opacity = 1 }) => (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={S.detail} />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={color} strokeWidth={1.4} opacity={0.7} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <path key={i}
            d={`M${cx + Math.cos(a) * r * 0.80} ${cy + Math.sin(a) * r * 0.80}
                L${cx + Math.cos(a) * r * 0.93} ${cy + Math.sin(a) * r * 0.93}`}
            stroke={color} strokeWidth={1.3} opacity={0.75} />
        );
      })}
      <path d={`M${cx - r * 0.34} ${cy + r * 0.20} L${cx} ${cy - r * 0.34} L${cx + r * 0.34} ${cy + r * 0.20}`}
        fill="none" stroke={color} strokeWidth={S.detail} strokeLinejoin="round" />
      <path d={`M${cx - r * 0.30} ${cy + r * 0.44} L${cx + r * 0.30} ${cy + r * 0.44}`}
        stroke={color} strokeWidth={S.detail} strokeLinecap="round" />
    </g>
  );

/* ── ODOMETER ───────────────────────────────────────────────────────────────────────────────
   A figure that is READ OFF something, not faded in. Each column rolls down into place on its own
   stagger and settles with a small overshoot, and the last column lands a few frames after the
   others — the plan asks for exactly that. */
export const Odometer: React.FC<{
  x: number; y: number; size: number; p: number; value: string;
}> = ({ x, y, size, p, value }) => {
  const chars = [...('\u20B9 ' + value)];
  const adv = size * 0.60;
  /* the columns arrive from ABOVE and are clipped to the row, so a digit in flight can never
     hang below the document it is printed on */
  const cid = `odo${Math.round(x)}_${Math.round(y)}`;
  return (
    <g clipPath={`url(#${cid})`}>
      <defs>
        <clipPath id={cid}>
          <rect x={x - size * 0.2} y={y - size * 1.02} width={adv * chars.length + size * 0.5}
            height={size * 1.28} />
        </clipPath>
      </defs>
      {chars.map((ch, i) => {
        /* columns land left to right, and the LAST digit is given an extra beat */
        const d = i / Math.max(1, chars.length - 1);
        const late = i === chars.length - 1 ? 0.16 : 0;
        const q = Math.max(0, Math.min(1, (p - d * 0.30 - late) / 0.34));
        if (q <= 0) return null;
        const over = Math.sin(q * Math.PI) * 0.16;
        const dy = -(1 - q) * size * 0.78 + over * size * 0.10;
        return (
          <g key={i} clipPath="none">
            <Label x={x + i * adv} y={y + dy} size={size} fill={C.cardInk} weight={800}
              opacity={Math.min(1, q * 2.4)}>{ch}</Label>
          </g>
        );
      })}
    </g>
  );
};

/* ── THE CHALLAN NOTICE ─────────────────────────────────────────────────────────────────────
   A document, not a card: a printed header band, a rule, a two-row field grid with the labels
   set small and the values set large, and the amount given its own weight. */
export const ChallanDoc: React.FC<{
  x: number; y: number; w: number;
  header?: number; plate?: number; amount?: number; amountValue?: string; focus?: number;
  chip?: boolean;
}> = ({ x, y, w, header = 1, plate = 1, amount = 1, amountValue = '1,000', focus = 0, chip = true }) => {
  /* every measurement is a fraction of w, because the notice is rendered at 422px in the bubble,
     at ~300px in the recap and at ~190px in the prevention ghost, and fixed offsets collided at
     all three. k is the scale relative to the in-bubble size. */
  const k = w / 422;
  const HB = 78 * k;
  const h = HB + (104 + 116) * k;
  const pad = 24 * k;
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} r={R.tile} base={C.card} elevation={5} />

      {/* header band */}
      <g opacity={header} clipPath="none">
        <path d={`M${x} ${y + R.tile} Q${x} ${y} ${x + R.tile} ${y} L${x + w - R.tile} ${y}
                  Q${x + w} ${y} ${x + w} ${y + R.tile} L${x + w} ${y + HB} L${x} ${y + HB} Z`}
          fill={C.cobalt} />
        <path d={`M${x} ${y + HB - 3 * k} L${x + w} ${y + HB - 3 * k}`} stroke={C.yellow}
          strokeWidth={3 * k} />
        <Seal cx={x + 44 * k} cy={y + HB / 2} r={23 * k} color="#DCE6FF" />
        <Label x={x + 82 * k} y={y + 36 * k} size={27 * k} fill="#FFFFFF" weight={800}
          track={2.2 * k}>e-CHALLAN</Label>
        <Label x={x + 82 * k} y={y + 60 * k} size={17 * k} fill="#BFD1F8" weight={600}
          track={1.4 * k}>TRAFFIC VIOLATION NOTICE</Label>
      </g>

      {/* vehicle row */}
      <g opacity={header}>
        <Label x={x + pad} y={y + HB + 34 * k} size={18 * k} fill={C.greyDim} weight={700}
          track={1.6 * k}>VEHICLE NUMBER</Label>
        {/* the focus beat: the plate lifts on its own shadow rather than being re-drawn */}
        <g transform={`translate(${-focus * w * 0.012} ${-focus * 4}) scale(${1 + focus * 0.045})`}
          style={{ transformOrigin: `${x + pad + w * 0.215}px ${y + HB + 46 * k + w * 0.065}px` }}>
          <NumberPlate x={x + pad} y={y + HB + 46 * k} w={w * 0.43} reveal={plate} />
        </g>
        <rect x={x + w - pad - 118 * k} y={y + HB + 56 * k} width={118 * k} height={3 * k}
          fill={C.cardLine} opacity={plate > 0.05 ? 0 : 1} />
        <Label x={x + w - pad} y={y + HB + 34 * k} size={18 * k} fill={C.greyDim} weight={700}
          track={1.6 * k} anchor="end">NOTICE NO.</Label>
        <Label x={x + w - pad} y={y + HB + 78 * k} size={24 * k} fill={C.cardInk} weight={700}
          anchor="end" mono opacity={plate > 0.05 ? 1 : 0}>{NOTICE_NO}</Label>
      </g>

      <path d={`M${x + pad} ${y + HB + 104 * k} L${x + w - pad} ${y + HB + 104 * k}`}
        stroke={C.cardLine} strokeWidth={2 * k} />

      {/* amount — the warm cue, and the only warm thing in the opening */}
      <g opacity={header}>
        <Label x={x + pad} y={y + HB + 138 * k} size={18 * k} fill={C.greyDim} weight={700}
          track={1.6 * k}>AMOUNT DUE</Label>
        <Odometer x={x + pad} y={y + HB + 196 * k} size={54 * k} p={amount} value={amountValue} />
        <g opacity={chip ? amount : 0}>
          <Solid x={x + w - 150 * k} y={y + HB + 148 * k} w={126 * k} h={44 * k} r={R.chip * k}
            base={C.yellow} litK={0.24} shadeK={0.18} elevation={2} />
          <Label x={x + w - 87 * k} y={y + HB + 178 * k} size={20 * k} fill="#3A2B06" weight={800}
            anchor="middle" track={1.2 * k}>PENDING</Label>
        </g>
      </g>
    </g>
  );
};
/** the notice's number — quoted back by the portal's answer in act 4, so the two are the same
 *  string and can never drift apart */
export const NOTICE_NO = '2419703';
export const CHALLAN_H = 78 + 104 + 116;
export const challanH = (w: number) => (78 + 104 + 116) * (w / 422);

/* ── THE ATTACHMENT ─────────────────────────────────────────────────────────────────────────
   The hook's payload, and the object the whole film turns on. It must be legible as a FILE that
   can be installed — the plan has its glyph change from paper-like to package-like as the viewer
   understands that — so the glyph is drawn as both, with `pkg` crossfading the flap into a taped
   carton seam. ".apk" gets contrast isolation, never a warning colour. */
export const ApkTile: React.FC<{
  x: number; y: number; w: number; pkg?: number; name?: number; press?: number; lift?: number;
}> = ({ x, y, w, pkg = 0, name = 1, press = 0, lift = 0 }) => {
  const h = 96;
  const full = 'RTO Challan.apk';
  const chars = Math.round(name * full.length);
  const shown = full.slice(0, chars);
  const stem = shown.slice(0, Math.min(shown.length, 11));
  const ext = shown.slice(11);
  const gx = x + 20, gy = y + 18, gs = 60;
  return (
    <g transform={`translate(0 ${-lift + press * 2})`}>
      <Plate x={x} y={y} w={w} h={h} r={R.tile} base="#E9EDF6" elevation={3 + lift * 0.5 - press * 2.4} />

      {/* the glyph: a page that becomes a package */}
      <g>
        <Solid x={gx} y={gy} w={gs} h={gs} r={8} base={C.slate} litK={0.20} shadeK={0.24} />
        {/* paper: a folded corner. package: a taped seam + a flap line. */}
        <path d={`M${gx + gs - 20} ${gy} L${gx + gs} ${gy + 20} L${gx + gs - 20} ${gy + 20} Z`}
          fill={lit(C.slate, 0.36)} opacity={1 - pkg} />
        <g opacity={pkg}>
          <path d={`M${gx} ${gy + gs * 0.36} L${gx + gs} ${gy + gs * 0.36}`}
            stroke={lit(C.slate, 0.30)} strokeWidth={S.secondary} />
          <path d={`M${gx + gs / 2} ${gy} L${gx + gs / 2} ${gy + gs * 0.36}`}
            stroke={shade(C.slate, 0.40)} strokeWidth={S.secondary} />
          <rect x={gx + gs / 2 - 9} y={gy + gs * 0.36 - 7} width={18} height={14} rx={3}
            fill={lit(C.slate, 0.42)} />
        </g>
        <Label x={gx + gs / 2} y={gy + gs * 0.82} size={17} fill="#D6DEF2" weight={800}
          anchor="middle" track={1}>APK</Label>
      </g>

      <Label x={gx + gs + 18} y={y + 45} size={28} fill={C.cardInk} weight={700}>
        {stem}<tspan fill="#0A0F1E" fontWeight={800}>{ext}</tspan>
      </Label>
      <Label x={gx + gs + 18} y={y + 74} size={20} fill={C.greyDim} weight={600}>
        2.4 MB{'  ·  '}APK
      </Label>

      {/* the affordance: a download chevron in a well */}
      <circle cx={x + w - 44} cy={y + h / 2} r={22} fill={C.cardLine} opacity={0.75} />
      <path d={`M${x + w - 44} ${y + h / 2 - 9} L${x + w - 44} ${y + h / 2 + 7}
                M${x + w - 53} ${y + h / 2 - 1} L${x + w - 44} ${y + h / 2 + 8} L${x + w - 35} ${y + h / 2 - 1}`}
        stroke={C.cardInk} strokeWidth={S.secondary} fill="none" strokeLinecap="round"
        strokeLinejoin="round" />
    </g>
  );
};

/* ── CHAT CHROME ────────────────────────────────────────────────────────────────────────────
   Recognisability comes from the tail, the double ticks and the top bar's avatar+name+back —
   not from any trademark. */
export const ChatHeader: React.FC<{ title?: string }> = ({ title = 'Traffic Notice' }) => {
  const top = SCREEN.y + STATUS_H;
  const midY = top + 46;
  const rightX = SCREEN.x + SCREEN.w;
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={STATUS_H + 92} fill="#1F2C34" />
      {/* back */}
      <path d={`M${SCREEN.x + 32} ${midY - 12} L${SCREEN.x + 19} ${midY} L${SCREEN.x + 32} ${midY + 12}`}
        stroke="#E9EDEF" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* avatar */}
      <circle cx={SCREEN.x + 72} cy={midY} r={26} fill="#6A7A85" />
      <circle cx={SCREEN.x + 72} cy={midY - 8} r={9} fill="#CFD9DE" />
      <path d={`M${SCREEN.x + 56} ${midY + 18} a16 14 0 0 1 32 0 Z`} fill="#CFD9DE" />
      <Label x={SCREEN.x + 110} y={midY - 2} size={26} fill="#E9EDEF" weight={600}>{title}</Label>
      <Label x={SCREEN.x + 110} y={midY + 24} size={18} fill="#8696A0" weight={500}>
        +91 88••• ••412
      </Label>
      {/* video, call, menu */}
      <g fill="none" stroke="#E9EDEF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <rect x={rightX - 128} y={midY - 10} width={26} height={20} rx={4} />
        <path d={`M${rightX - 102} ${midY - 4} l10 -6 v20 l-10 -6 z`} />
        <path d={`M${rightX - 74} ${midY - 12} a5 5 0 0 1 7 -1 l3 4 a4 4 0 0 1 -1 6 l-2 2
                  a17 17 0 0 0 8 8 l2 -2 a4 4 0 0 1 6 -1 l4 3 a5 5 0 0 1 -1 7 l-2 2
                  c-4 3 -9 2 -13 -1 a38 38 0 0 1 -14 -14 c-3 -4 -3 -9 -1 -13 z`} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={rightX - 26} cy={midY - 10 + i * 10} r={2.6} fill="#E9EDEF" />
      ))}
    </g>
  );
};

/* The furniture that makes a chat a chat rather than a panel with a bubble on it: the date
   divider, the not-in-contacts notice a real messenger shows for an unknown sender (an authentic
   detail that seeds doubt without any warning colour), and the composer at the foot. */
export const ChatFurniture: React.FC<{ notice?: number }> = ({ notice = 1 }) => {
  const cx = SCREEN.x + SCREEN.w / 2;
  const top = SCREEN.y + STATUS_H + 92;
  const barY = SCREEN.y + SCREEN.h - 96;
  return (
    <g>
      {/* the wallpaper's faint doodles — the texture a real chat sits on */}
      <g opacity={0.05} fill="none" stroke="#E9EDEF" strokeWidth={2.4} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const gx = SCREEN.x + 30 + (i % 3) * (SCREEN.w / 3), gy = top + 40 + Math.floor(i / 3) * 150;
          const k = i % 4;
          if (k === 0) return <path key={i} d={`M${gx} ${gy} h22 a5 5 0 0 1 5 5 v13 a5 5 0 0 1 -5 5 h-12 l-7 6 v-6 h-3 a5 5 0 0 1 -5 -5 v-13 a5 5 0 0 1 5 -5 z`} />;
          if (k === 1) return <path key={i} d={`M${gx} ${gy + 14} l7 7 l14 -16`} />;
          if (k === 2) return <circle key={i} cx={gx + 10} cy={gy + 10} r={11} />;
          return <path key={i} d={`M${gx} ${gy + 18} v-12 a9 9 0 0 1 18 0 v12 z`} />;
        })}
      </g>
      <g opacity={notice}>
        <rect x={cx - 48} y={top + 18} width={96} height={32} rx={8} fill="#182229" />
        <Label x={cx} y={top + 40} size={17} fill="#8696A0" weight={600} anchor="middle">TODAY</Label>
        <rect x={SCREEN.x + 30} y={top + 66} width={SCREEN.w - 60} height={52} rx={10} fill="#182229" />
        <Label x={cx} y={top + 98} size={18} fill="#8696A0" weight={500} anchor="middle">
          This sender is not in your contacts
        </Label>
      </g>
      {/* the composer: a pill with emoji, placeholder, attach and camera, then the round send key */}
      <rect x={SCREEN.x} y={barY - 12} width={SCREEN.w} height={108} fill={C.chatBg} />
      <rect x={SCREEN.x + 16} y={barY} width={SCREEN.w - 106} height={68} rx={34} fill="#1F2C34" />
      <circle cx={SCREEN.x + 50} cy={barY + 34} r={15} fill="none" stroke="#8696A0" strokeWidth={3} />
      <circle cx={SCREEN.x + 45} cy={barY + 30} r={2.2} fill="#8696A0" />
      <circle cx={SCREEN.x + 56} cy={barY + 30} r={2.2} fill="#8696A0" />
      <path d={`M${SCREEN.x + 44} ${barY + 39} a7 5 0 0 0 13 0`} stroke="#8696A0" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <Label x={SCREEN.x + 80} y={barY + 43} size={22} fill="#8696A0" weight={500}>Message</Label>
      {/* Attach and camera carry the SAME optical weight as the emoji (about 28px across, one
          stroke weight), evenly spaced, and clear of the pill's right edge. A paperclip has to be
          diagonal with a returning inner leg — drawn as a rounded loop it reads as an "0". */}
      <g fill="none" stroke="#8696A0" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <g transform={`translate(${SCREEN.x + SCREEN.w - 194} ${barY + 34}) rotate(-45) scale(0.78)`}>
          <path d="M5 -12 v20 a5.5 5.5 0 0 1 -11 0 v-22 a8.5 8.5 0 0 1 17 0 v24" />
        </g>
        <g transform={`translate(${SCREEN.x + SCREEN.w - 134} ${barY + 34})`}>
          <path d="M-15 -6 h5 l2.5 -5 h7 l2.5 5 h5 a3.5 3.5 0 0 1 3.5 3.5 v11 a3.5 3.5 0 0 1 -3.5 3.5
                   h-24 a3.5 3.5 0 0 1 -3.5 -3.5 v-11 a3.5 3.5 0 0 1 3.5 -3.5 z" />
          <circle cx={0} cy={3.5} r={5} />
        </g>
      </g>
      <circle cx={SCREEN.x + SCREEN.w - 48} cy={barY + 34} r={32} fill={C.chatGreen} />
      <path d={`M${SCREEN.x + SCREEN.w - 60} ${barY + 22} L${SCREEN.x + SCREEN.w - 34} ${barY + 34}
                L${SCREEN.x + SCREEN.w - 60} ${barY + 46} L${SCREEN.x + SCREEN.w - 54} ${barY + 34} Z`}
        fill="#0B141A" />
    </g>
  );
};

/** An incoming bubble: rounded, with a tail at the upper-left, a timestamp, and room for content. */
export const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; time?: string; children?: React.ReactNode;
}> = ({ x, y, w, h, time = '10:42', children }) => (
  <g>
    {/* the tail: a small wedge off the top-left corner, which is what makes it an INCOMING
        message rather than a card sitting on a background */}
    <path d={`M${x - 12} ${y} L${x + 14} ${y} L${x + 14} ${y + 22} Z`} fill={BUBBLE} />
    <rect x={x} y={y} width={w} height={h} rx={14} fill={BUBBLE} />
    {children}
    <Label x={x + w - 20} y={y + h - 18} size={18} fill="#8696A0" weight={500} anchor="end">{time}</Label>
  </g>
);
