/* THE PHONE — what the victim sees.
 *
 * There is exactly ONE phone in this film. It is never destroyed and re-created: the seller holds
 * it, the marketplace assembles around it, the crowd shrinks it to one instance among many, and
 * the parents take the same device in phase F. "Different hands, same phone" is what lets the
 * whole second half be transitions rather than cuts.
 *
 * Live assembly applies to the NARRATIVE objects inside it — the request card, the keypad, the
 * PIN dots, the rule card all have a true t0 and build on screen. The device and its app bar are
 * the room, not a narrative object, and exist from frame 0 so that "UPI" is readable before the
 * first word (premortem F7).
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  C, FPS, LAYOUT, T, antic, betrayal, clamp01, ease, hash01, impact, lerp, shadow, sp, tracking,
} from '../design';
import { B, CUE, NARR, paced } from '../timeline';
import { PointingHand } from './hand';
import { hexA } from './Backdrop';

const P = LAYOUT.phone;
const SCR = { x: P.x + 16, y: P.y + 16, w: P.w - 32, h: P.h - 32 };
const CARD = { x: P.x + 40, w: P.w - 80, h: 400, home: P.y + 190 };
const KEY = { x: P.x + 30, y: P.y + 610, pitchX: 156, pitchY: 82, w: 138, h: 68 };
const PIN_CODE = [4, 8, 2, 6];

export const keyPos = (n: number) => {
  const col = n === 0 ? 1 : (n - 1) % 3;
  const row = n === 0 ? 3 : Math.floor((n - 1) / 3);
  return { x: KEY.x + col * KEY.pitchX + KEY.w / 2, y: KEY.y + row * KEY.pitchY + KEY.h / 2 };
};

/* ── EPISODES ────────────────────────────────────────────────────────────────────────────────
   The request card is ONE object for the whole film, but the film shows three different requests:
   the one that robs the seller, the one that arrives in the marketplace, and the one the parents
   are about to approve. A phone does not grow a second card for a second notification — the card
   updates. So the content slides over within the same frame, which keeps the object permanent and
   is also exactly what the device would really do.

   Without this the debit card from 14s sat on screen, unchanged, for the entire second half. */
type Episode = { at: number; handle: string; amount: string; morphs: boolean };
const EPISODES: Episode[] = [
  { at: -1, handle: 'buyer@upi', amount: '8,450', morphs: true },
  /* This request returns on the word "anyone", NOT during the online-seller sentence. It is the
     stimulus the crowd reacts to: it has to be on screen before a single chin is stroked, or the
     people are responding to something the viewer has not been shown. */
  { at: CUE.requestReturns, handle: 'cust_2019@upi', amount: '3,200', morphs: false },
  { at: NARR.words[73].s - 0.30, handle: 'pay_req@upi', amount: '2,000', morphs: false },
];
/* a card is dismissed shortly before the next one arrives; the first is dismissed on its own cue,
   because the whole point of that moment is to uncover the screen underneath it */
const dismissAt = (i: number) =>
  i === 0 ? CUE.cardDismiss : EPISODES[i + 1] ? EPISODES[i + 1].at - 0.42 : Infinity;

function episode(t: number) {
  let i = 0;
  for (let k = 1; k < EPISODES.length; k++) if (t >= EPISODES[k].at) i = k;
  return { ...EPISODES[i], index: i, dismiss: dismissAt(i) };
}

/* ── the card's life, as numbers ───────────────────────────────────────────────────────────── */
export function cardState(t: number) {
  /* the card has mass: it lands ON the beat, and it always crosses at the speed it was tuned to */
  const F = paced(CUE.requestLaunch, CUE.requestLand, 1.93);
  /* the reversal is the tightest move in the film — it keeps its own duration whatever the read */
  const SNAP = paced(CUE.fold, CUE.snap, 2.18);
  const fly = clamp01((t - F.from) / F.span);
  const landed = t >= CUE.requestLand;
  const lift = clamp01((t - CUE.keypadRise) / 0.5)
    * (1 - clamp01((t - B(35)) / 0.7));    // makes room for the keypad, and releases when calm
  const morph = clamp01((t - B(27)) / 0.55);                     // INCOMING -> PAYING
  const sign = clamp01((t - B(28)) / 0.35);                      // + becomes -
  const ep = episode(t);
  /* only the first request ever turns: the later two are still telling the same lie, and the
     film has already taught the viewer what that lie becomes */
  const p = ep.morphs
    ? Math.max(clamp01((t - SNAP.from) / SNAP.span) * 0.86, clamp01((t - CUE.snap) / 0.3))
    : 0;
  return { fly, landed, lift: ep.morphs ? lift : 0, morph: ep.morphs ? morph : 0,
    sign: ep.morphs ? sign : 0, p, ep };
}

/* ── HOW A CARD LEAVES AND ARRIVES ───────────────────────────────────────────────────────────
   A dismissed card is FLUNG, the way a notification is flung off a phone: a few pixels of
   anticipation against the direction of travel, then cubic acceleration downward with a little
   rotation, gone in under half a second. It does not fade — fading would leave the viewer unsure
   whether anything happened, and the whole reason it leaves is to uncover the record underneath.
   The next card comes back UP from the same edge it left by, on the medium-class spring. */
function cardMotion(t: number, frame: number, ep: ReturnType<typeof episode>) {
  const born = ep.index === 0 ? CUE.requestLand : ep.at;
  if (t < ep.dismiss) {
    if (ep.index === 0) return { y: 0, rot: 0, sc: 1, gone: false };
    const r = sp(frame, born * FPS, 'medium');
    return { y: (1 - r) * 760, rot: (1 - r) * -3.5, sc: 1, gone: false };
  }
  const d = clamp01((t - ep.dismiss) / 0.44);
  const anticipate = d < 0.2 ? -20 * Math.sin((d / 0.2) * Math.PI) : 0;
  return {
    y: anticipate + d * d * d * 1240,          // momentum: slow to leave, then very fast
    rot: d * d * 5.5, sc: lerp(1, 0.93, d), gone: d >= 1,
  };
}

export const Phone: React.FC<{ dim?: number }> = ({ dim = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = cardState(t);

  /* the device is HEAVY: it recoils when something lands on it, and it settles slowly. Its
     reactions are always smaller than the thing that caused them. */
  const recoil = impact(t, CUE.requestLand, 7, 6.5, 9)
    + impact(t, CUE.approvePress, 4, 8, 11)
    + CUE.pinTaps.reduce((a, c, i) => a + impact(t, c, 2.2 + i * 0.25, 9.5, 13), 0)
    + impact(t, CUE.snap, 15, 5.5, 7)
    + impact(t, CUE.ruleCard, 5, 7, 9);
  const tiltR = recoil * 0.055;

  return (
    <g transform={`translate(${recoil * 0.5} ${recoil * 0.85}) rotate(${tiltR} ${P.x + P.w / 2} ${P.y + P.h / 2})`}
      opacity={1 - dim}>
      {/* shell */}
      <rect x={P.x} y={P.y} width={P.w} height={P.h} rx={P.r} fill="#27325F"
        style={{ filter: `drop-shadow(${shadow(26, 0.5)})` }} />
      <rect x={P.x + 2} y={P.y + 2} width={P.w - 4} height={P.h - 4} rx={P.r - 2}
        fill="none" stroke={hexA('#9FB8F0', 0.5)} strokeWidth={2.5} />
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={P.r - 14} fill="#0C1330" />
      <clipPath id="scr">
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={P.r - 14} />
      </clipPath>
      <linearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="45%" stopColor="#FFE2E8" stopOpacity="0.55" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.62" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      <g clipPath="url(#scr)">
        <Home t={t} />
        <AppBar t={t} />
        <PinArea t={t} />
        <Keypad t={t} />
        <RequestCard t={t} s={s} />
      </g>

      {/* the glass: a single moving sheen, and only when it helps point at something */}
      <Sheen t={t} />
    </g>
  );
};

/* The app's own home screen. It exists from frame 0 — the device has to look like a payments app
   in use BEFORE the request arrives, or the first second is a black rectangle and the viewer
   scrolls (premortem F7). It is deliberately quiet: low contrast, no motion of its own beyond a
   single balance figure that agrees with the ledger above. */
const Home: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    ['Groceries', '− ₹640'], ['Rahul S.', '+ ₹1,200'], ['Electricity', '− ₹1,830'],
    ['Tea stall', '− ₹40'], ['Ananya M.', '+ ₹2,500'],
  ];
  /* The debit is not just a number going down: it becomes a LINE IN THE HISTORY, and the rest of
     the list is physically pushed down by it. The big balance changes when the money leaves; the
     record posts a moment later, once the request card has been flung out of the way — which is
     the whole reason the narration waits here. Then a shine travels across the new row, because
     it is the one thing on screen the viewer is meant to read. */
  const rolled = clamp01((t - CUE.balanceRoll) / 0.75);
  const debit = ease.out(clamp01((t - CUE.historyLand) / 0.34));
  const shine = clamp01((t - CUE.shine) / 0.78);
  const push = clamp01((t - CUE.requestLand) / 0.5) * 16;   // the list is shoved down by the card
  /* PIN entry owns the lower half of the screen: the list does not compete with it, it recedes.
     It comes back once the keypad is gone, because it was never destroyed. */
  const yield_ = clamp01((t - CUE.keypadRise) / 0.4) * (1 - clamp01((t - CUE.dotsBecomeMoney) / 0.4));
  /* THE OPEN. The film used to begin on a settled tableau and hold it, silent, for half a second
     before a word was spoken. The lead-in silence is gone, and now the screen ASSEMBLES under the
     first words instead of waiting for them. The balance is THERE on frame one — an empty phone is
     a weak first frame, and this one has to be legible as a wallet instantly — and it is the
     history that arrives, one row behind the next. Done by t = 0.19s, before the request is
     launched at "scammer" (0.22s), so the motion is continuous into the first beat and nothing
     downstream ever sees this. */
  const open = (d: number) => ease.out(clamp01((t - d) / 0.15));
  return (
    <g opacity={0.82 * (1 - yield_ * 0.82)}>
      <rect x={SCR.x} y={SCR.y + 96} width={SCR.w} height={122} fill="#0F1838" />
      <text x={SCR.x + 30} y={SCR.y + 140} fill="#6C779E"
        style={{ font: `600 ${T.micro - 2}px ${T.face}`, ...tracking(3) }}>UPI BALANCE</text>
      <text x={SCR.x + 30} y={SCR.y + 192} fill={rolled > 0.5 ? C.red : C.ink}
        style={{ font: `800 ${T.head}px ${T.face}` }}>
        {rolled > 0.5 ? '₹3,850' : '₹12,300'}
      </text>
      <text x={SCR.x + 30} y={SCR.y + 268 + push} opacity={open(0)} fill="#5D688F"
        style={{ font: `700 ${T.micro - 4}px ${T.face}`, ...tracking(3) }}>RECENT</text>
      {debit > 0 && (
        <g transform={`translate(${(1 - debit) * 64} ${SCR.y + 320 + push})`} opacity={debit}>
          {/* the row gets its own plate so the shine has a surface to travel across */}
          <rect x={SCR.x + 14} y={-34} width={SCR.w - 28} height={68} rx={16}
            fill="#2A1030" opacity={0.55 + 0.45 * Math.sin(clamp01(shine) * Math.PI)} />
          <circle cx={SCR.x + 48} cy={0} r={21} fill="#4A1C38" />
          <text x={SCR.x + 86} y={10} fill="#F6D6DE"
            style={{ font: `700 ${T.small - 4}px ${T.face}` }}>buyer@upi</text>
          <text x={SCR.x + SCR.w - 30} y={10} textAnchor="end" fill={C.red}
            style={{ font: `800 ${T.small - 4}px ${T.mono}` }}>− ₹8,450</text>
          {shine > 0 && shine < 1 && (
            <g>
              <clipPath id="shineclip">
                <rect x={SCR.x + 14} y={-34} width={SCR.w - 28} height={68} rx={16} />
              </clipPath>
              <g clipPath="url(#shineclip)">
                <rect x={lerp(SCR.x - 200, SCR.x + SCR.w + 40, ease.inOut(shine))} y={-40}
                  width={180} height={80} fill="url(#shineGrad)" transform="skewX(-16)" />
              </g>
              <rect x={SCR.x + 14} y={-34} width={SCR.w - 28} height={68} rx={16} fill="none"
                stroke={C.red} strokeWidth={2}
                opacity={0.75 * Math.sin(clamp01(shine) * Math.PI)} />
            </g>
          )}
        </g>
      )}
      {rows.map((r, i) => {
        const o = open(0.015 + i * 0.03);       // the history cascades in, one row behind the next
        return (
        <g key={i} opacity={o}
          transform={`translate(${(1 - o) * 30} ${SCR.y + 320 + (i + debit) * 76 + push})`}>
          <circle cx={SCR.x + 48} cy={0} r={21} fill="#1B2550" />
          <text x={SCR.x + 86} y={10} fill="#8E99BC" style={{ font: `600 ${T.small - 4}px ${T.face}` }}>{r[0]}</text>
          <text x={SCR.x + SCR.w - 30} y={10} textAnchor="end"
            fill={r[1][0] === '+' ? '#3E7A57' : '#6C779E'}
            style={{ font: `700 ${T.small - 4}px ${T.mono}` }}>{r[1]}</text>
        </g>
        );
      })}
    </g>
  );
};

const AppBar: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 1 + Math.max(0, impact(t, B(3), 0.055, 6, 10));
  return (
    <g>
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={94} fill="#111A3E" />
      <g transform={`translate(${SCR.x + 26} ${SCR.y + 47}) scale(${pulse})`}>
        <rect x={0} y={-26} width={118} height={52} rx={14} fill={C.teal} />
        <text x={59} y={12} textAnchor="middle" fill="#06223A"
          style={{ font: `900 ${T.label - 6}px ${T.face}`, ...tracking(2) }}>UPI</text>
      </g>
      <text x={SCR.x + 160} y={SCR.y + 58} fill={C.grey}
        style={{ font: `600 ${T.micro}px ${T.face}`, ...tracking(3) }}>PAYMENTS</text>
      <circle cx={SCR.x + SCR.w - 40} cy={SCR.y + 47} r={19} fill="#26325F" />
      <rect x={SCR.x} y={SCR.y + 93} width={SCR.w} height={2} fill={hexA('#8CA8EB', 0.22)} />
    </g>
  );
};

const RequestCard: React.FC<{ t: number; s: ReturnType<typeof cardState> }> = ({ t, s }) => {
  if (s.fly <= 0) return null;
  /* flight: from the scammer node in the ledger, right-to-left and down into the phone. The card
     is MEDIUM class — it overshoots ~4% and its shadow settles two frames after it does. */
  const ep = s.ep;
  const frame = Math.round(t * FPS);
  const m = cardMotion(t, frame, ep);
  if (m.gone) return null;
  /* THE APPROACH.
   *
   * `ease.inOut` across a 1.9s flight left the card at 4% of the distance and 20% of its size 0.4s
   * in — the film's principal object parked through the window that decides whether a Short is
   * watched — and then crawling into its own landing.
   *
   * The first fix was worse in a way that is easy to miss and impossible to unsee: two eases butted
   * together, a fast break and a slow close, BOTH of which have zero slope at the join. The card
   * decelerated to a dead stop at 0.57s and started again. A velocity that touches zero mid-flight
   * is a pause, however smooth each half is on its own.
   *
   * So the curve is one continuous function whose velocity never approaches zero:
   *
   *     e(u) = u + A·sin(2πu)/2π        e'(u) = 1 + A·cos(2πu)
   *
   * With A = 0.34 the speed runs 1.34 → 0.66 → 1.34 of the average: it leaves with impulse, eases
   * once through the middle the way a thrown object does, and arrives with speed into the impact
   * that stops it. Monotone, C-infinity, and there is no join to stop at. */
  const A = 0.34;
  const e = ep.index === 0
    ? s.fly + (A * Math.sin(2 * Math.PI * s.fly)) / (2 * Math.PI)
    : ease.inOut(s.fly);
  const land = s.landed ? 1 + impact(t, CUE.requestLand, 0.045, 7, 12) : 1;
  const x = ep.index === 0 ? lerp(LAYOUT.ledger.right - CARD.w / 2, CARD.x, e) : CARD.x;
  const y0 = ep.index === 0 ? lerp(LAYOUT.ledger.y - 40, CARD.home, e) : CARD.home;
  const y = lerp(y0, CARD.home - 152, ease.out(s.lift)) + m.y;
  const sc = (ep.index === 0 ? lerp(0.18, 1, e) : 1)
    * lerp(1, 0.84, ease.out(s.lift)) * land * m.sc;
  const rot = (ep.index === 0 ? lerp(-7, 0, ease.out(s.fly)) : 0)
    + impact(t, CUE.requestLand, 1.4, 7, 11) + m.rot;
  const elev = lerp(46, 18, e) + m.y * 0.02;
  const col = betrayal(s.p);
  const inbound = s.morph < 0.5;

  return (
    <g transform={`translate(${x + CARD.w / 2} ${y + CARD.h / 2}) scale(${sc}) rotate(${rot}) translate(${-CARD.w / 2} ${-CARD.h / 2})`}
      style={{ filter: `drop-shadow(${shadow(elev, 0.45)})` }}>
      <rect width={CARD.w} height={CARD.h} rx={30} fill={C.card} />
      <rect width={CARD.w} height={6} rx={3} fill={col} opacity={0.9} />
      <g>

      {/* who */}
      <circle cx={52} cy={68} r={27} fill="#DDE3F5" />
      <text x={52} y={79} textAnchor="middle" fill="#5B6791" style={{ font: `800 30px ${T.face}` }}>?</text>
      <text x={94} y={62} fill={C.cardInk}
        style={{ font: `700 ${T.small - (ep.handle.length > 11 ? 6 : 0)}px ${T.mono}` }}>{ep.handle}</text>
      <text x={94} y={94} fill="#6C779E"
        style={{ font: `600 ${T.micro - 6}px ${T.face}`, ...tracking(1.5) }}>
        UPI COLLECT REQUEST
      </text>
      <rect x={34} y={118} width={CARD.w - 68} height={2} fill="#E2E6F3" />

      {/* how much — stable, high contrast, never bounces */}
      <g transform={`translate(${CARD.w / 2} 214)`}>
        <text textAnchor="middle" fill={C.cardInk} style={{ font: `800 ${T.amount}px ${T.face}` }}>
          {s.sign > 0.5 ? '−' : ''}₹{ep.amount}
        </text>
      </g>

      {/* which way — the direction line. Chevron and words say the same thing, so the film still
          works for a viewer who cannot separate the two colours. */}
      <g transform={`translate(${CARD.w / 2} 268)`}>
        <g transform={`translate(${-178} 0) rotate(${lerp(0, 180, ease.inOut(s.morph))})`}>
          <path d="M10,0 L-8,-15 L-8,15 Z" fill={col} />
        </g>
        <text x={22} y={11} textAnchor="middle" fill={col}
          style={{ font: `800 ${T.small - 6}px ${T.face}`, ...tracking(1.5) }}>
          {inbound ? 'PAYMENT INCOMING' : `PAYING ${ep.handle}`}
        </text>
      </g>

      <Buttons t={t} lift={s.lift} ep={ep.index} spent={s.p > 0.2} />
      </g>
    </g>
  );
};

const Buttons: React.FC<{ t: number; lift: number; ep: number; spent: boolean }> =
  ({ t, lift, ep, spent }) => {
  const rise = ep > 0 ? 1 : ease.out(clamp01((t - B(12)) / 0.42));
  const press = ep > 0 ? 0
    : clamp01((t - CUE.approvePress) / 0.09) * (1 - clamp01((t - CUE.approvePress - 0.09) / 0.18));
  /* a request that has already been paid has nothing left to decide: the controls do not come
     back when the card returns to its resting size */
  if (spent) return null;
  const gone = ease.out(lift);
  if (gone > 0.98) return null;
  const depress = press * 5;
  return (
    <g opacity={1 - gone}>
      <rect x={30} y={322} width={168} height={62} rx={18} fill="none" stroke="#C3CADF" strokeWidth={2} />
      <text x={114} y={362} textAnchor="middle" fill="#8791B4"
        style={{ font: `700 ${T.micro}px ${T.face}`, ...tracking(2) }}>DECLINE</text>
      {/* the Approve control RISES into focal priority: it gains elevation, not glow */}
      <g transform={`translate(${CARD.w - 30 - 178} ${322 + depress})`}
        style={{ filter: `drop-shadow(${shadow(lerp(2, 11, rise) * (1 - press * 0.85), 0.4)})` }}>
        <rect width={178} height={62} rx={18} fill={C.green}
          transform={`scale(${lerp(0.97, 1, rise) * (1 - press * 0.03)} ${1 - press * 0.06})`}
          style={{ transformOrigin: '89px 31px' }} />
        <text x={89} y={42} textAnchor="middle" fill="#073B1E"
          style={{ font: `900 ${T.small - 2}px ${T.face}`, ...tracking(2) }}>APPROVE</text>
      </g>
      {/* tap ripple — a consequence of the press, and it expands from the contact point */}
      {press > 0 && <Ripple t={t} at={CUE.approvePress} x={CARD.w - 30 - 89} y={353} col="#0B4A26" />}
    </g>
  );
};

const Ripple: React.FC<{ t: number; at: number; x: number; y: number; col: string }> =
  ({ t, at, x, y, col }) => {
    const u = clamp01((t - at) / 0.42);
    if (u <= 0 || u >= 1) return null;
    return <circle cx={x} cy={y} r={8 + u * 78} fill="none" stroke={col}
      strokeWidth={3 * (1 - u)} opacity={0.5 * (1 - u)} />;
  };

/* ── PIN ─────────────────────────────────────────────────────────────────────────────────────
   The four dots are the object that becomes the money. They are staged empty, filled one at a
   time with different weights, and at `dotsBecomeMoney` they are handed to the ledger — this
   component simply stops drawing them at the exact frame the tokens take over. */
const PinArea: React.FC<{ t: number }> = ({ t }) => {
  const show = clamp01((t - B(16)) / 0.4);
  const gone = clamp01((t - CUE.dotsBecomeMoney) / 0.12);
  if (show <= 0 || gone >= 1) return null;
  const label = 1 + Math.max(0, impact(t, B(16), 0.06, 5.5, 9));
  return (
    <g opacity={show}>
      <text x={P.x + P.w / 2} y={P.y + 470} textAnchor="middle" fill={C.grey}
        style={{ font: `700 ${T.micro}px ${T.face}`, ...tracking(5) }}
        transform={`scale(${label})`} transform-origin={`${P.x + P.w / 2}px ${P.y + 470}px`}>
        ENTER UPI PIN
      </text>
      {PIN_CODE.map((_, i) => {
        const at = CUE.pinTaps[i];
        const fill = clamp01((t - at) / 0.1);
        const pop = i < 4 ? sp(t * FPS, at * FPS, 'light') : 0;
        const r = 17 + (fill > 0 ? (1 - Math.abs(pop - 1)) * 5 : 0);
        return (
          <g key={i} opacity={1 - gone}>
            <circle cx={386 + i * 76} cy={P.y + 536} r={17} fill="none"
              stroke={hexA('#8CA8EB', 0.45)} strokeWidth={3} />
            {fill > 0 && <circle cx={386 + i * 76} cy={P.y + 536} r={r * Math.min(1, pop * 1.4)}
              fill={C.teal} />}
          </g>
        );
      })}
    </g>
  );
};

const Keypad: React.FC<{ t: number }> = ({ t }) => {
  /* a HEAVY drawer: it is dragged up, overshoots barely, and settles slowly. It is the reason the
     card above it physically moves — the phone has finite room and the film shows that. */
  const rise = sp(t * FPS, CUE.keypadRise * FPS, 'heavy');
  const out = clamp01((t - CUE.dotsBecomeMoney) / 0.35);
  if (rise <= 0.001 || out >= 1) return null;
  const dy = lerp(420, 0, rise);
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, -2];
  return (
    <g transform={`translate(0 ${dy + out * 180})`} opacity={(1 - out) * Math.min(1, rise * 2)}>
      <rect x={SCR.x} y={KEY.y - 34} width={SCR.w} height={400} fill="#131C42" />
      <rect x={SCR.x} y={KEY.y - 34} width={SCR.w} height={2} fill={hexA('#8CA8EB', 0.2)} />
      {keys.map((n, i) => {
        if (n < 0) return null;
        const p = keyPos(n);
        const ti = PIN_CODE.indexOf(n);
        const tapAt = ti >= 0 ? CUE.pinTaps[ti] : null;
        const press = tapAt === null ? 0
          : clamp01((t - tapAt) / 0.055) * (1 - clamp01((t - tapAt - 0.055) / (0.13 + ti * 0.012)));
        /* four taps, four slightly different keypad responses — never a cloned animation */
        const amt = [1, 0.88, 1.06, 1.18][Math.max(0, ti)];
        return (
          <g key={n} transform={`translate(${p.x} ${p.y}) scale(${1 - press * 0.05 * amt})`}>
            <rect x={-KEY.w / 2} y={-KEY.h / 2} width={KEY.w} height={KEY.h} rx={16}
              fill={press > 0.05 ? '#2B3A72' : '#1B2550'}
              style={{ filter: press > 0.05 ? 'none' : `drop-shadow(${shadow(4, 0.4)})` }} />
            <text y={13} textAnchor="middle" fill={C.ink}
              style={{ font: `700 ${T.body}px ${T.mono}` }}>{n}</text>
            {press > 0.02 && <Ripple t={t} at={tapAt!} x={0} y={0} col={C.teal} />}
          </g>
        );
      })}
    </g>
  );
};

const Sheen: React.FC<{ t: number }> = ({ t }) => {
  /* one sheen, and only where it points at something: it sweeps toward Approve as it rises, and
     once more as the keypad locks. It is never idle decoration. */
  const events = [B(12), B(16)];
  const hit = events.find((e) => t > e && t < e + 0.34);
  if (!hit) return null;
  const u = (t - hit) / 0.34;
  const x = lerp(P.x - 160, P.x + P.w + 160, ease.inOut(u));
  return (
    <g clipPath="url(#scr)" opacity={Math.sin(u * Math.PI) * 0.14}>
      <rect x={x} y={P.y} width={120} height={P.h} fill="#FFFFFF" transform={`skewX(-14)`} />
    </g>
  );
};

/* ── the hand ────────────────────────────────────────────────────────────────────────────────
   Enters from the right, travels on arcs, and never stops dead. The fingertip leads; the forearm
   follows it two frames late, which is what makes the arm feel attached to a body off frame. */
export const Hand: React.FC<{ t: number; stage: { s: number; x: number; y: number } }> =
  ({ t, stage }) => {
    const map = (p: { x: number; y: number }) => ({
      x: 540 + stage.x + (p.x - 540) * stage.s,
      y: 950 + stage.y + (p.y - 950) * stage.s,
    });
    const raw = fingerTip(t);
    if (raw.a <= 0.01) return null;
    const tip = map(raw);
    /* This hand has no body on screen, so its arm has to leave the frame rather than stop inside
       it. The origin is placed outside the side edge it comes from — not below the bottom, which
       would run the forearm straight through the band the Shorts UI sits in. */
    /* Phase F's arm leaves through the left edge ABOVE the parents. At the forearm's true width it
       used to cross straight over the left parent's head, which read as that small figure's giant
       arm — the one thing this hand must not be, since it is the viewer's hand returning. */
    const from = raw.side < 0 ? { x: -300, y: 1400 } : { x: 1286, y: 1664 };
    /* Which hand this is, is a fact about where the arm comes from — stated, never derived from
       the angle. It lives in the phone's plane, so its size follows the phone: a fixed scale would
       drift ~5% against the keys as the stage eases 1.00 -> 1.06 across the taps. */
    return <PointingHand tip={tip} from={from} hand={raw.side < 0 ? 'left' : 'right'}
      fw={26 * stage.s} bend={raw.bend} press={raw.press} opacity={raw.a} />;
  };

/* the fingertip's whole itinerary, as one function of time. Written as a list of targets with
   arcs between them so that no leg is linear and no arrival is instantaneous. */
function fingerTip(t: number) {
  const approve = { x: CARD.x + CARD.w - 30 - 89, y: CARD.home + 353 };
  const rest = { x: 1120, y: 1620 };
  /* The wrist bends ULNAR by however much it takes to hold the finger at ~52 degrees from
     horizontal at each target. The arm's origin is fixed off screen, so the forearm arrives at a
     different angle at every key: one bend cannot serve them all, and at the low-left keys an
     unbent wrist lays the finger flat across the keypad, which reads as pointing, not pressing. */
  const BEND: Record<number, number> = { 4: 28, 8: 28, 2: 20, 6: 19 };
  const legs: { t0: number; t1: number; from: typeof rest; to: typeof rest; bow: number;
    b0: number; b1: number }[] = [
    { t0: B(13), t1: CUE.approvePress, from: rest, to: approve, bow: -120, b0: 10, b1: 7 },
    { t0: CUE.approvePress + 0.12, t1: CUE.keypadRise + 0.5, from: approve,
      to: { x: 880, y: 1210 }, bow: -60, b0: 7, b1: 20 },
  ];
  CUE.pinTaps.forEach((tap, i) => {
    const k = keyPos(PIN_CODE[i]);
    const prev = i === 0 ? { x: 880, y: 1210 } : keyPos(PIN_CODE[i - 1]);
    legs.push({ t0: tap - 0.26 - i * 0.01, t1: tap, from: prev, to: k, bow: -46 + i * 9,
      b0: i === 0 ? 20 : BEND[PIN_CODE[i - 1]], b1: BEND[PIN_CODE[i]] });
  });
  legs.push({
    t0: CUE.commit + 0.1, t1: CUE.commit + 0.7,
    from: keyPos(PIN_CODE[3]), to: rest, bow: -80, b0: BEND[PIN_CODE[3]], b1: 10,
  });

  let pos = rest, press = 0, a = 0, side = 1, bend = 10;
  for (const L of legs) {
    if (t >= L.t0) {
      const u = clamp01((t - L.t0) / (L.t1 - L.t0));
      const e = ease.inOut(u);
      pos = {
        x: lerp(L.from.x, L.to.x, e),
        y: lerp(L.from.y, L.to.y, e) + Math.sin(u * Math.PI) * L.bow,
      };
      bend = lerp(L.b0, L.b1, e);      // the wrist straightens and bends as the hand travels
    }
  }
  const taps = [CUE.approvePress, ...CUE.pinTaps];
  for (const tp of taps) {
    const d = t - tp;
    if (d > -0.05 && d < 0.16) press = Math.max(press, Math.sin(clamp01((d + 0.05) / 0.21) * Math.PI));
  }
  a = clamp01((t - B(13) + 0.2) / 0.3) * (1 - clamp01((t - CUE.commit - 0.55) / 0.3));
  /* phase F: the same hand returns for the parents, and is stopped by the rule card */
  if (t > CUE.parentsFocal) {
    const app2 = { x: CARD.x + CARD.w - 30 - 89, y: CARD.home + 353 };
    /* stopped by the rule card — the stop is the beat, the approach keeps its speed */
    const R = paced(B(62), CUE.ruleCard + 0.55, 1.48);
    const u = clamp01((t - R.from) / R.span);
    const brake = clamp01((t - CUE.ruleCard) / 0.5);
    const e = ease.out(u) * (1 - brake * 0.22);               // decelerates, does not stop dead
    side = -1;
    bend = 29;                         // a press, from the other side: the left hand, same rules
    pos = { x: lerp(120, app2.x, e), y: lerp(1660, app2.y, e) + Math.sin(u * Math.PI) * -60 };
    a = clamp01((t - B(62) + 0.15) / 0.3) * (1 - clamp01((t - B(64) - 0.5) / 0.5));
    press = 0;
  }
  return { ...pos, press, a, side, bend };
}
