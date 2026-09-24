/* UPI SCAM 1 — SFX and score, synthesised from the film's own physics.
 *
 * Every sound is derived from the object that makes it: MASS sets the centre frequency, SPEED
 * sets the transient sharpness, ELASTICITY buys a tension glide, DISTANCE removes top end, and
 * DIRECTION is a gentle stereo move (never load-bearing — most people hear a Short on one
 * speaker). Nothing is sonified unless it is a cause: the film has dozens of reactions per second
 * and fewer than thirty sounds.
 *
 *   node tools/upi-scam/score.mjs
 */
import fs from 'fs';
import { execFileSync } from 'child_process';
import {
  SR, add, ar, buffer, expDecay, gain, hp, lp, mul, mulberry32, noise, put, rev, tone, writeWav,
} from './synth.mjs';

const C = JSON.parse(fs.readFileSync('src/upi-scam/cues.gen.json', 'utf8'));
const Q = C.cue, DUR = C.duration + 0.4;
const FF = '/opt/homebrew/bin/ffmpeg';

/* ════ SFX ═══════════════════════════════════════════════════════════════════════════════════ */
const fx = buffer(DUR);
const EVENTS = [];
const at = (t, name, s, pan = 0, g = 1) => { EVENTS.push({ t, name }); put(fx, t, s, pan, g); };

/** shift a voice later inside a composed effect, so one `at()` can hold a small sequence */
const put2 = (delay, v) => {
  const o = new Float32Array(v.length + Math.round(delay * SR));
  o.set(v, Math.round(delay * SR));
  return o;
};

/* — LIGHT class: a notification. Short, bright, no body. — */
const notify = (f = 1560, seed = 3) => add(
  gain(tone(0.09, f, f * 1.34, expDecay(0.09 * SR, 0.022), 'sine'), 0.5),
  gain(hp(noise(0.03, expDecay(0.03 * SR, 0.006), seed), 3800), 0.14),
);

/* — MEDIUM class: a card. Air, then a soft synthetic body, then a tiny click, then a tail. — */
const cardLand = (seed = 11) => add(
  gain(lp(noise(0.26, ar(0.26 * SR, 0.16, 0.05), seed), 900, 320), 0.30),       // the air it moved
  gain(lp(tone(0.19, 210, 96, expDecay(0.19 * SR, 0.045), 'sine'), 700), 0.52), // the body
  gain(hp(noise(0.018, expDecay(0.018 * SR, 0.004), seed + 1), 4200), 0.17),    // the contact
  gain(tone(0.34, 640, 610, expDecay(0.34 * SR, 0.10), 'sine'), 0.07),          // the tail
);

/* — a tactile control. Compact: click, muted low, and a release a few ms later. — */
const buttonPress = () => add(
  gain(hp(noise(0.014, expDecay(0.014 * SR, 0.0032), 21), 2600), 0.34),
  gain(lp(tone(0.10, 176, 118, expDecay(0.10 * SR, 0.024), 'sine'), 520), 0.40),
);
const buttonRelease = () => gain(hp(noise(0.009, expDecay(0.009 * SR, 0.002), 22), 3400), 0.16);

/* — four PIN taps: one family, four instances. ±1.5 semitones, small timbre drift, and the
     fourth fractionally firmer because it is the one that completes the authorisation. — */
const pinTap = (i) => {
  const semis = [0, 1.2, -0.9, 0.4][i], f = 1180 * Math.pow(2, semis / 12);
  const firm = i === 3 ? 1.24 : 1;
  return add(
    gain(tone(0.055, f, f * 0.86, expDecay(0.055 * SR, 0.012 + i * 0.001), 'sine'), 0.40 * firm),
    gain(hp(noise(0.011, expDecay(0.011 * SR, 0.0026), 40 + i), 3000), 0.20 * firm),
    gain(lp(tone(0.07, 150, 104, expDecay(0.07 * SR, 0.017), 'sine'), 480), 0.20 * firm),
  );
};

/* — HEAVY class: a weighted drawer. Low, slow, filtered. — */
const drawer = () => add(
  gain(lp(noise(0.42, ar(0.42 * SR, 0.22, 0.12), 55), 300, 1100), 0.26),
  gain(lp(tone(0.40, 62, 104, ar(0.40 * SR, 0.24, 0.10), 'sine'), 400), 0.24),
);

/* ── THE REVERSAL ────────────────────────────────────────────────────────────────────────────
   The hero sound, built in six parts so it describes the same physics the picture does: air is
   pulled in, an elastic loads, it releases, the release travels left-to-right, it lands with a
   short low body, and it rings out briefly. Short, and never louder than the narration. */
const suction = () => gain(rev(lp(noise(0.55, ar(0.55 * SR, 0.02, 0.16), 71), 1800, 380)), 0.20);
const tension = () => gain(lp(tone(0.62, 128, 305, ar(0.62 * SR, 0.34, 0.18), 'tri', 0.004), 1500), 0.16);
const snapHit = () => add(
  gain(hp(noise(0.03, expDecay(0.03 * SR, 0.0055), 81), 2200), 0.52),           // the snap
  gain(lp(tone(0.22, 300, 58, expDecay(0.22 * SR, 0.042), 'sine'), 900), 0.60), // the body
  gain(lp(tone(0.42, 172, 118, expDecay(0.42 * SR, 0.13), 'tri'), 1400), 0.14), // the tail
);
const whoosh = () => gain(lp(noise(0.34, ar(0.34 * SR, 0.05, 0.09), 91), 2600, 700), 0.24);

/* — money: light digital ticks, never coin jingles — */
const tick = (i) => add(
  gain(tone(0.05, 880 * Math.pow(2, ((i * 7) % 5 - 2) / 12), 700, expDecay(0.05 * SR, 0.011), 'sine'), 0.26),
  gain(hp(noise(0.008, expDecay(0.008 * SR, 0.002), 100 + i), 5200), 0.10),
);
const arrive = (i) => gain(lp(tone(0.14, 150 + i * 9, 82, expDecay(0.14 * SR, 0.03), 'sine'), 600), 0.30);

/* — protection: clean, restrained, never fantasy sparkle — */
const ruleHit = () => add(
  gain(lp(tone(0.17, 250, 132, expDecay(0.17 * SR, 0.035), 'sine'), 800), 0.46),
  gain(hp(noise(0.016, expDecay(0.016 * SR, 0.0035), 61), 2400), 0.20),
);
const chime = (f = 1046) => add(
  gain(tone(0.5, f, f, expDecay(0.5 * SR, 0.14), 'sine'), 0.20),
  gain(tone(0.5, f * 1.5, f * 1.5, expDecay(0.5 * SR, 0.09), 'sine'), 0.08),
);

/* ── placement ──────────────────────────────────────────────────────────────────────────────
   Pan follows the picture: the false incoming travels right-to-left, the debit left-to-right. */
at(Q.requestLaunch, 'request leaves', notify(1320, 5), 0.42, 0.5);
at(Q.requestLand, 'request lands', cardLand(), -0.16, 0.9);
at(Q.approvePress, 'approve', buttonPress(), -0.05, 0.95);
at(Q.approvePress + 0.085, 'approve release', buttonRelease(), -0.05, 0.8);
at(Q.keypadRise, 'keypad rises', drawer(), 0, 0.75);
Q.pinTaps.forEach((t, i) => at(t, `pin ${i + 1}`, pinTap(i), -0.10 + i * 0.06, 0.9));
at(Q.commit, 'commit', gain(chime(784), 0.45), 0, 0.55);

at(Q.load, 'the elastic loads', tension(), 0, 0.34);
at(Q.preSnap - 0.42, 'inhale', suction(), 0.1, 0.85);
[0, 1, 2, 3].forEach((i) => at(Q.dotsBecomeMoney + 0.05 + i * 0.055, `dot ${i} becomes money`, tick(i), -0.24, 0.55));
at(Q.snap, 'THE SNAP', snapHit(), -0.10, 1.0);
at(Q.snap + 0.02, 'snap travel', whoosh(), 0.30, 0.9);
/* the balance: a mechanical roll, not a sweep — one tiny detent per column, slowing */
for (let i = 0; i < 9; i++)
  at(Q.balanceRoll + 0.04 + i * (0.052 + i * 0.009), `roll ${i}`,
    gain(hp(noise(0.012, expDecay(0.012 * SR, 0.003), 130 + i), 2000), 0.22), -0.42, 0.7);
[0, 1, 2, 3].forEach((i) => at(Q.absorb + i * 0.085, `absorbed ${i}`, arrive(i), 0.44, 0.62));

/* ── the debit reveal ────────────────────────────────────────────────────────────────────────
   Three sounds telling one story: a card is flung away, a record is written, and a light travels
   across it. The fling pitches DOWN as it accelerates, because that is what a receding object
   does; the record is the smallest, driest sound in the film; the shine is barely there. */
at(Q.cardDismiss, 'the request is flung away', add(
  gain(lp(noise(0.30, ar(0.30 * SR, 0.05, 0.10), 171), 2600, 480), 0.26),
  gain(lp(tone(0.26, 330, 96, ar(0.26 * SR, 0.03, 0.07), 'sine'), 1200), 0.22),
), -0.12, 0.85);
at(Q.historyLand, 'the debit is recorded', add(
  gain(hp(noise(0.013, expDecay(0.013 * SR, 0.003), 181), 2800), 0.26),
  gain(lp(tone(0.13, 196, 132, expDecay(0.13 * SR, 0.028), 'sine'), 700), 0.34),
), -0.26, 0.9);
at(Q.shine, 'the record is read', add(
  gain(hp(lp(noise(0.52, ar(0.52 * SR, 0.24, 0.20), 191), 900, 6200), 1800), 0.11),
  gain(tone(0.5, 1480, 2050, ar(0.5 * SR, 0.22, 0.18), 'sine'), 0.055),
), 0.20, 0.8);

/* ── THE SELLER WAVE ─────────────────────────────────────────────────────────────────────────
   Sound built the way the picture is: three layers arriving at three moments, each nearer, each
   louder and lower, and the whole thing moving right to left in the stereo field the way the
   tiles do. The near layer's pass is the only loud part, and it lands on the covered frame. */
for (let i = 0; i < 5; i++)
  at(Q.waveSeed + 0.02 + i * 0.16, `seller buds ${i}`,
    gain(notify(1240 + i * 55, 200 + i), 0.26), 0.35 - i * 0.06, 0.42);
at(Q.waveBuild, 'the wave builds', add(
  gain(lp(noise(1.5, ar(1.5 * SR, 0.85, 0.45), 211), 1500, 700), 0.17),
  gain(lp(tone(1.4, 96, 132, ar(1.4 * SR, 0.8, 0.4), 'sine'), 500), 0.08),
), 0.42, 0.8);
at(Q.waveNear - 0.06, 'the near layer passes', add(
  gain(lp(noise(1.15, ar(1.15 * SR, 0.62, 0.34), 221), 2700, 520), 0.34),
  gain(lp(tone(1.0, 190, 62, ar(1.0 * SR, 0.55, 0.30), 'sine'), 700), 0.26),
  gain(hp(noise(0.05, expDecay(0.05 * SR, 0.012), 231), 2000), 0.10),
), 0.55, 1.0);
at(Q.waveOpen, 'and it opens again',
  gain(lp(noise(0.85, ar(0.85 * SR, 0.10, 0.42), 241), 2200, 900), 0.20), -0.5, 0.85);

/* ── four people, four requests landing in front of the viewer ── */
for (let i = 0; i < 4; i++)
  at(Q.crowdAlert + i * 0.38, `request reaches person ${i + 1}`,
    add(gain(notify(1420 - i * 90, 230 + i), 0.62),
      gain(lp(tone(0.09, 150, 110, expDecay(0.09 * SR, 0.02), 'sine'), 560), 0.20)),
    [-0.3, 0.2, -0.05, 0.34][i], 0.8);

at(Q.parcelMorph, 'parcel becomes listing',
  gain(lp(noise(0.30, ar(0.30 * SR, 0.10, 0.12), 141), 1400, 3200), 0.16), -0.34, 0.8);
/* the returning request. It used to sound during the online-seller sentence, where there is now
   no card at all; it belongs on "anyone", because it is the thing the people are about to react
   to and it has to be heard landing before any of them moves. */
at(Q.requestReturns, 'the request returns', gain(cardLand(31), 0.70), -0.10, 0.8);
/* `widen` and `crowd` used to be sonified here. The redesign gave both of those jobs to sounds
   that are actually caused by something on screen — the field sweeping, and four requests landing
   one per person — so keeping them would be two sounds describing the same event. Removed, not
   moved: the density cap is a limit on what the viewer has to process, not on the cue list. */
at(Q.parentsFocal, 'parents', gain(chime(659), 0.26), 0, 0.5);
at(Q.ruleCard, 'the rule intercepts', ruleHit(), -0.22, 0.95);
at(Q.shield, 'shield closes', gain(chime(1046), 0.7), 0, 0.7);
at(Q.receiveForward, 'the rule comes forward', add(
  gain(lp(noise(0.66, ar(0.66 * SR, 0.34, 0.26), 161), 1100, 2600), 0.15),
  gain(lp(tone(0.6, 132, 196, ar(0.6 * SR, 0.30, 0.24), 'sine'), 900), 0.13),
), 0, 0.8);
at(Q.sendIn, 'and SEND arrives beside it', add(
  gain(lp(noise(0.34, ar(0.34 * SR, 0.13, 0.14), 251), 2000, 640), 0.20),
  gain(lp(tone(0.22, 250, 118, expDecay(0.22 * SR, 0.05), 'sine'), 800), 0.30),
), 0.38, 0.85);
at(Q.noPin, 'no PIN', gain(chime(880), 0.55), 0, 0.75);

/* ── THE DEMONSTRATION ───────────────────────────────────────────────────────────────────────
   A PIN is entered on the SEND panel with no hand, so the taps have to carry the whole gesture:
   the same four-tap family as the victim's PIN in act two, deliberately — the viewer has heard
   this exact sound before, and that is the point. Then the payment succeeds. */
const PIN_STEP = (Q.pinDone - Q.pinEntry) / 3;
for (let i = 0; i < 4; i++)
  at(Q.pinEntry + i * PIN_STEP, `demo PIN ${i + 1}`, gain(pinTap(i), 0.74), 0.34, 0.85);

/* The success tone. Two notes, rising, clean — the sound a real payment makes. It is the most
   reassuring sound in the film and it is playing over money leaving, which is the sentence. */
at(Q.paid, 'PAID', add(
  gain(tone(0.30, 880, 880, ar(0.30 * SR, 0.006, 0.10), 'sine'), 0.34),
  put2(0.085, gain(tone(0.52, 1174.7, 1174.7, ar(0.52 * SR, 0.008, 0.18), 'sine'), 0.34)),
  put2(0.085, gain(tone(0.52, 2349.3, 2349.3, ar(0.52 * SR, 0.010, 0.12), 'sine'), 0.08)),
  gain(lp(tone(0.34, 196, 196, expDecay(0.34 * SR, 0.09), 'sine'), 700), 0.16),
), 0.30, 0.9);
for (let i = 0; i < 3; i++)
  at(Q.moneyOut + i * 0.11, `it leaves ${i}`, gain(tick(i + 4), 0.7), 0.1 + i * 0.16, 0.75);

/* ── the density cap, enforced ───────────────────────────────────────────────────────────────
   The rule is one distinct sonic EVENT per 450ms, not one placement. A composed effect's layers
   (the press and its release; the snap and its travel) are one event, and so is a sequence the
   film deliberately designs as a sequence (the four PIN taps, the 150ms in/out replay). Textures
   — the balance detents, the token ticks — are not events at all. Anything else inside 450ms is
   a mistake, and this throws rather than warns. */
const TEXTURE = /roll |dot |absorbed |seller buds |it leaves /;
const GROUP = [
  [Q.approvePress, Q.keypadRise + 0.01, 'the press and what it opens'],
  [Q.pinTaps[0], Q.commit + 0.01, 'the PIN sequence and its confirmation'],
  [Q.snap, Q.snap + 0.05, 'the reversal, layered'],
  [Q.replay, Q.noPin + 0.01, 'the directional replay and the rule'],
  [Q.cardDismiss, Q.shine + 0.01, 'the debit reveal: fling, record, shine'],
  [Q.waveSeed, Q.waveSeed + 0.9, 'the first sellers budding off the listing'],
  [Q.waveNear - 0.1, Q.waveOpen + 0.01, 'the near layer passing and opening'],
  /* The whole ending is ONE demonstration: the rule comes forward, SEND arrives beside it, a PIN
     is typed on it and the payment goes through. Overlapping ranges would put its parts in
     different groups and the cap would (correctly) reject them, so it is declared as one. */
  [Q.receiveForward, Q.paid + 0.01, 'the rule comes forward and the payment is demonstrated'],
  [Q.requestReturns, Q.crowdAlert + 1.2, 'one request lands, then the four people it reaches'],
];
const grouped = (t) => GROUP.findIndex(([a, b]) => t >= a - 1e-6 && t <= b);
const hits = EVENTS.filter((e) => !TEXTURE.test(e.name)).sort((a, b) => a.t - b.t);
const bad = [];
for (let i = 1; i < hits.length; i++) {
  const d = hits[i].t - hits[i - 1].t;
  if (d >= 0.45) continue;
  const g = grouped(hits[i].t);
  if (g >= 0 && g === grouped(hits[i - 1].t)) continue;
  bad.push(`${hits[i - 1].name} -> ${hits[i].name} (${d.toFixed(3)}s)`);
}
if (bad.length) throw new Error('SFX density cap broken:\n  ' + bad.join('\n  '));
console.log(`SFX: ${EVENTS.length} placements, ${hits.length} hits in ${GROUP.length} groups `
  + `+ singles — density cap holds`);

/* ════ MUSIC ═════════════════════════════════════════════════════════════════════════════════
   Original, minimal, and dynamic: the arc is written as sections, not as one loop laid under the
   whole film. Narration always wins — this bed is mixed low and side-chained to the voice. */
const mus = buffer(DUR);
const A = 55;                                   // A1
const N = (semi) => A * Math.pow(2, semi / 12);
/* i - VI - III - VII in A minor, and a lift to the relative major for the parents */
/* `fade` is how long this section takes to arrive. Everything crossfades except the drop at
   "however", which has to be fast enough to be heard as a drop rather than as a diminuendo. */
const SECTIONS = [
  { t: 0.0, root: 0, mode: 'min', pulse: 0.46, air: 0.48, lead: 0.28, fade: 1.2 },
  { t: Q.requestLand, root: 0, mode: 'min', pulse: 0.62, air: 0.55, lead: 0.34, fade: 1.2 },
  { t: Q.approvePress, root: 0, mode: 'min', pulse: 1.0, air: 0.62, lead: 0.46, fade: 0.8 },
  { t: Q.commit - 0.30, root: 0, mode: 'min', pulse: 0.86, air: 0.58, lead: 0.0, fade: 0.4 },
  { t: Q.however, root: 0, mode: 'min', pulse: 0.0, air: 0.10, lead: 0.0, fade: 0.16 },  // THE DROP
  { t: Q.fold, root: 0, mode: 'min', pulse: 0.0, air: 0.30, lead: 0.0, fade: 0.5 },
  { t: Q.snap, root: -2, mode: 'min', pulse: 0.62, air: 0.86, lead: 0.38, fade: 0.30 },
  { t: Q.pullBack, root: 3, mode: 'min', pulse: 0.62, air: 0.55, lead: 0.30, fade: 1.2 },
  { t: Q.widen, root: 5, mode: 'min', pulse: 0.66, air: 0.5, lead: 0.32, fade: 1.2 },
  { t: Q.parentsIn, root: 3, mode: 'maj', pulse: 0.46, air: 0.62, lead: 0.28, fade: 1.2 },
  { t: Q.split, root: 0, mode: 'maj', pulse: 0.34, air: 0.7, lead: 0.24, fade: 1.2 },
  /* THE RESOLUTION. Without these two the bed was still playing at full strength when the file
     ended, which is heard as the music being cut off rather than as the film finishing. */
  { t: C.words[C.words.length - 1].e + 0.15, root: 0, mode: 'maj', pulse: 0.12, air: 0.52, lead: 0.10, fade: 0.9 },
  { t: C.duration - 0.75, root: 0, mode: 'maj', pulse: 0, air: 0, lead: 0, fade: 0.75 },
];
const sec = (t) => { let s = SECTIONS[0]; for (const x of SECTIONS) if (t >= x.t) s = x; return s; };
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (t, key) => {                     // sections cross-fade; music never cuts
  let i = 0; while (i < SECTIONS.length - 1 && t > SECTIONS[i + 1].t) i++;
  const a = SECTIONS[i], b = SECTIONS[Math.min(i + 1, SECTIONS.length - 1)];
  const u = b.t === a.t ? 1 : Math.min(1, Math.max(0, (t - a.t) / Math.min(b.fade, b.t - a.t)));
  return lerp(a[key], b[key], u);
};

/* pad: two detuned saws through a slow filter — the air of the room */
{
  const n = mus.len; let p1 = 0, p2 = 0, y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, s = sec(t);
    const f = N(s.root + (s.mode === 'maj' ? 0 : 0)) * 2;
    p1 += (2 * Math.PI * f) / SR; p2 += (2 * Math.PI * f * 1.005) / SR;
    const raw = (Math.sin(p1) + Math.sin(p2) * 0.8 + Math.sin(p1 * 1.5) * 0.28) / 2;
    const cutoff = 220 + smooth(t, 'air') * 520;
    const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
    y += a * (raw - y);
    mus.L[i] += y * 0.085 * smooth(t, 'air'); mus.R[i] += y * 0.085 * smooth(t, 'air');
  }
}
/* pulse: a plucked eighth at 104bpm, gated by the section's pulse amount */
{
  const bpm = 104, beat = 60 / bpm / 2;
  for (let k = 0; k * beat < DUR; k++) {
    const t = k * beat, s = sec(t), amt = smooth(t, 'pulse');
    if (amt < 0.04) continue;
    const deg = s.mode === 'maj' ? [0, 7, 4, 7, 0, 9, 4, 7] : [0, 7, 3, 7, 0, 8, 3, 7];
    const f = N(s.root + deg[k % 8] + 24);
    const v = gain(lp(tone(0.20, f, f, expDecay(0.20 * SR, 0.055), 'tri'), 2400), 0.07 * amt);
    put(mus, t, v, ((k % 4) - 1.5) * 0.12, 1);
  }
}
/* lead: a slow four-note figure, one layer that is REMOVED before the reveal */
{
  const bpm = 104, bar = 60 / bpm * 2;
  for (let k = 0; k * bar < DUR; k++) {
    const t = k * bar, s = sec(t), amt = smooth(t, 'lead');
    if (amt < 0.03) continue;
    const deg = s.mode === 'maj' ? [12, 16, 19, 16] : [12, 15, 19, 15];
    const f = N(s.root + deg[k % 4] + 12);
    put(mus, t, gain(lp(tone(1.1, f, f, ar(1.1 * SR, 0.08, 0.34), 'sine'), 1800), 0.055 * amt), 0.18, 1);
  }
}
/* one short accent ON the reversal — an accent, not a trailer drop */
put(mus, Q.snap, add(
  gain(lp(tone(0.9, N(-2) * 2, N(-2) * 2, expDecay(0.9 * SR, 0.24), 'tri'), 900), 0.10),
  gain(lp(tone(0.9, N(-2) * 3, N(-2) * 3, expDecay(0.9 * SR, 0.16), 'sine'), 1400), 0.05),
), 0, 1);
/* and a resolving tone under the rule, which rings on past the last word and decays to nothing */
put(mus, Q.noPin - 0.1, add(
  gain(lp(tone(3.0, N(0) * 4, N(0) * 4, ar(3.0 * SR, 0.12, 1.15), 'sine'), 2200), 0.075),
  gain(lp(tone(3.0, N(7) * 3, N(7) * 3, ar(3.0 * SR, 0.18, 1.05), 'sine'), 2200), 0.048),
  gain(lp(tone(3.0, N(0) * 2, N(0) * 2, ar(3.0 * SR, 0.20, 1.3), 'sine'), 900), 0.055),
), 0, 1);

fs.mkdirSync('.tts-upi', { recursive: true });
const p1 = writeWav('.tts-upi/sfx.wav', fx, fs);
const p2 = writeWav('.tts-upi/music.wav', mus, fs);
console.log(`sfx peak ${p1.peak.toFixed(2)}  music peak ${p2.peak.toFixed(2)}`);

/* ════ MIX ═══════════════════════════════════════════════════════════════════════════════════
   Narration is the loudest storytelling layer at every instant. The music is side-chained to the
   voice so it ducks under dense speech instead of being ridden by hand, and the SFX sit between
   the two. The reversal is allowed to be the loudest event in the film — and only just. */
const MIXGRAPH = '[0:a]aformat=channel_layouts=stereo[v];'
  + '[v]asplit=3[vmix][sc1][sc2];'
  + `[1:a]volume=0.40,afade=t=out:st=${(C.duration - 1.5).toFixed(2)}:d=1.45[m];`
  + '[m][sc1]sidechaincompress=threshold=0.05:ratio=9:attack=12:release=340:makeup=1[mduck];'
  + '[2:a]volume=0.66[s];'
  + '[s][sc2]sidechaincompress=threshold=0.10:ratio=3:attack=6:release=180:makeup=1[sduck];'
  + `[vmix][mduck][sduck]amix=inputs=3:duration=longest:normalize=0,`
  + `afade=t=out:st=${(C.duration - 0.35).toFixed(2)}:d=0.34[out]`;
/* NOTE: alimiter defaults to level=enabled, which normalises the output back to 0 dBFS — so the
   `limit` was setting a ceiling and then the filter was undoing it. Disabled explicitly below. */

const build = (extra, out) => execFileSync(FF, ['-y',
  '-i', 'public/Audio/upi-narration.wav', '-i', '.tts-upi/music.wav', '-i', '.tts-upi/sfx.wav',
  '-filter_complex', `${MIXGRAPH};${extra}`, '-map', '[fin]', '-ar', '48000', '-ac', '2', out],
  { stdio: ['ignore', 'pipe', 'pipe'] });

/* TWO PASS, and deliberately NOT loudnorm's single-pass mode. Single-pass loudnorm is a dynamic
   normaliser: it flattened this mix to an LRA of 1.1 LU, which would have erased the one thing
   the sound design exists for — the drop in stimulation at "however" and the release at the snap.
   So: measure once, apply ONE static gain, and catch peaks with a limiter. The arc survives. */
build('[out]anull[fin]', '.tts-upi/mix_raw.wav');
const js = JSON.parse(execFileSync('/bin/sh', ['-c',
  `${FF} -i .tts-upi/mix_raw.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 `
  + `| sed -n '/^{/,/^}/p'`], { encoding: 'utf8' }));
const measured = parseFloat(js.input_i), lra = parseFloat(js.input_lra);
const adjust = Math.min(12, -14 - measured);
console.log(`mix measured ${measured.toFixed(1)} LUFS, LRA ${lra.toFixed(1)} LU -> gain ${adjust.toFixed(2)} dB`);
build(`[out]volume=${adjust.toFixed(2)}dB,alimiter=limit=0.72:attack=3:release=80:level=disabled[fin]`, '.tts-upi/mix.wav');

const after = JSON.parse(execFileSync('/bin/sh', ['-c',
  `${FF} -i .tts-upi/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 `
  + `| sed -n '/^{/,/^}/p'`], { encoding: 'utf8' }));
console.log(`final ${parseFloat(after.input_i).toFixed(1)} LUFS, `
  + `LRA ${parseFloat(after.input_lra).toFixed(1)} LU, TP ${parseFloat(after.input_tp).toFixed(1)} dBFS`);

/* ── the check that matters ──────────────────────────────────────────────────────────────────
   Global LRA is the wrong instrument here: 34 seconds of near-continuous narration is flat by
   construction, and an LRA threshold would fail a perfectly good mix. What the design actually
   promises is a DROP IN STIMULATION at "however" — so measure exactly that, on the bed alone
   (music + SFX, voice excluded, because the voice is still speaking through it). */
const bedRms = (a, b) => {
  const out = execFileSync('/bin/sh', ['-c',
    `${FF} -i .tts-upi/music.wav -i .tts-upi/sfx.wav -filter_complex `
    + `"[0:a]volume=0.40[m];[1:a]volume=0.72[s];[m][s]amix=inputs=2:normalize=0,`
    + `atrim=${a}:${b},astats=metadata=1:reset=0" -f null - 2>&1 | grep -m1 "RMS level dB"`],
    { encoding: 'utf8' });
  return parseFloat(out.split(':')[1]);
};
const before = bedRms(Q.however - 1.6, Q.however - 0.05);
const during = bedRms(Q.however + 0.02, Q.however + 0.52);
const releaseAfter = bedRms(Q.snap, Q.snap + 1.2);
console.log(`stimulation at "however": bed ${before.toFixed(1)} dB before -> ${during.toFixed(1)} dB `
  + `during -> ${releaseAfter.toFixed(1)} dB at the snap`);
if (during > before - 3)
  throw new Error(`no audible drop at "however" (${(before - during).toFixed(1)} dB) — the `
    + 'micro-pause the design depends on is not there');
if (releaseAfter < during + 4)
  throw new Error('the reversal is not the release the drop was setting up');

execFileSync(FF, ['-y', '-i', '.tts-upi/mix.wav', '-c:a', 'aac', '-b:a', '192k',
  'public/Audio/upi-mix.m4a'], { stdio: ['ignore', 'pipe', 'pipe'] });
const dur = execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries',
  'format=duration', '-of', 'csv=p=0', '.tts-upi/mix.wav']).toString().trim();
console.log(`mix -> public/Audio/upi-mix.m4a  (${(+dur).toFixed(3)}s)`);
