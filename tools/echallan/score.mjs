/* FAKE e-CHALLAN MALWARE — SFX and score, synthesised from the film's own physics.
 *
 * Every sound is derived from the object that makes it: MASS sets the centre frequency, SPEED the
 * transient sharpness, ELASTICITY buys a tension glide, DISTANCE removes top end, DIRECTION is a
 * gentle stereo move (never load-bearing — most people hear a Short on one speaker). Nothing is
 * sonified unless it is a CAUSE: the film has hundreds of reactions and fewer than sixty sounds.
 *
 * Nothing is a sample. Everything here is generated from numbers (tools/echallan/synth.mjs), so
 * the bed is original by construction and two runs are bit-identical.
 *
 * The one rule the mix serves: NARRATION ALWAYS WINS. The music is side-chained to the voice and
 * the SFX sit between the two.
 *
 *   node tools/echallan/score.mjs
 */
import fs from 'fs';
import { execFileSync } from 'child_process';
import {
  SR, add, ar, buffer, expDecay, gain, hp, lp, mul, mulberry32, noise, put, rev, tone, writeWav,
} from './synth.mjs';

const C = JSON.parse(fs.readFileSync('src/echallan/cues.gen.json', 'utf8'));
const Q = C.cue, DUR = C.duration + 0.6;
const FF = '/opt/homebrew/bin/ffmpeg';

/* ════ SFX ═══════════════════════════════════════════════════════════════════════════════════ */
const fx = buffer(DUR);
const EVENTS = [];
const at = (t, name, s, pan = 0, g = 1) => {
  if (!Number.isFinite(t)) throw new Error(`cue missing for "${name}"`);
  EVENTS.push({ t: +t.toFixed(3), name }); put(fx, t, s, pan, g);
};

/* ── LIGHT: a notification. Short, bright, no body. ──────────────────────────────────────────*/
const notify = (f = 1520, seed = 3) => add(
  gain(tone(0.095, f, f * 1.32, expDecay(0.095 * SR, 0.023), 'sine'), 0.50),
  gain(hp(noise(0.03, expDecay(0.03 * SR, 0.006), seed), 3800), 0.14),
);
/* ── MEDIUM: a document card. Air, a soft body, a contact click, a tail. ─────────────────────*/
const cardLand = (seed = 11) => add(
  gain(lp(noise(0.28, ar(0.28 * SR, 0.17, 0.05), seed), 900, 320), 0.32),
  gain(lp(tone(0.20, 208, 94, expDecay(0.20 * SR, 0.046), 'sine'), 700), 0.54),
  gain(hp(noise(0.018, expDecay(0.018 * SR, 0.004), seed + 1), 4200), 0.18),
  gain(tone(0.34, 640, 610, expDecay(0.34 * SR, 0.10), 'sine'), 0.07),
);
/* ── a tactile control: click, muted low, release a few ms later ─────────────────────────────*/
const tap = (bright = 1) => add(
  gain(hp(noise(0.014, expDecay(0.014 * SR, 0.0032), 21), 2600), 0.34 * bright),
  gain(lp(tone(0.10, 176, 118, expDecay(0.10 * SR, 0.024), 'sine'), 520), 0.40),
);
const release = () => gain(hp(noise(0.009, expDecay(0.009 * SR, 0.002), 22), 3400), 0.16);
/* ── HEAVY: a weighted system surface rising ─────────────────────────────────────────────────*/
const drawer = (up = true) => add(
  gain(lp(noise(0.44, ar(0.44 * SR, 0.24, 0.12), 55), 300, up ? 1100 : 260), 0.26),
  gain(lp(tone(0.42, up ? 60 : 104, up ? 104 : 58, ar(0.42 * SR, 0.24, 0.10), 'sine'), 400), 0.24),
);
/* ── the BARRIER: a dead stop. Nothing rings; a blocked thing does not resonate. ─────────────*/
const block = () => add(
  gain(lp(tone(0.09, 150, 74, expDecay(0.09 * SR, 0.016), 'sine'), 420), 0.52),
  gain(lp(noise(0.05, expDecay(0.05 * SR, 0.010), 66), 700), 0.26),
);
/* ── a gate releasing: compact, mechanical-digital ───────────────────────────────────────────*/
const gateOpen = () => add(
  gain(hp(noise(0.022, expDecay(0.022 * SR, 0.0045), 31), 2000), 0.36),
  gain(tone(0.16, 420, 690, expDecay(0.16 * SR, 0.036), 'tri'), 0.24),
  gain(lp(tone(0.26, 128, 96, expDecay(0.26 * SR, 0.07), 'sine'), 600), 0.20),
);
/* ── a package moving through the system: soft procedural ticks, never a laser ───────────────*/
const travel = (dur = 0.5, seed = 7) => gain(
  lp(noise(dur, ar(dur * SR, dur * 0.35, dur * 0.4), seed), 1500, 520), 0.16);
const instTick = (i) => gain(hp(noise(0.010, expDecay(0.010 * SR, 0.0024), 140 + i), 2400), 0.15);
/* ── an app docking: light, one small body ───────────────────────────────────────────────────*/
const dock = () => add(
  gain(tone(0.12, 760, 520, expDecay(0.12 * SR, 0.025), 'sine'), 0.26),
  gain(lp(tone(0.18, 150, 104, expDecay(0.18 * SR, 0.04), 'sine'), 500), 0.24),
);
/* ── PERMISSIONS: one family, four instances. Each capability keeps its pitch for the film, so
      the viewer learns them without being told. ──────────────────────────────────────────────*/
const CAP_HZ = { sms: 1240, call: 980, bg: 760, vpn: 620 };
const permPop = (k) => add(
  gain(tone(0.075, CAP_HZ[k] * 0.86, CAP_HZ[k], expDecay(0.075 * SR, 0.017), 'sine'), 0.30),
  gain(hp(noise(0.012, expDecay(0.012 * SR, 0.0026), 41), 3000), 0.14),
);
const lockOpen = (k) => add(
  gain(hp(noise(0.018, expDecay(0.018 * SR, 0.0038), 51), 2400), 0.28),
  gain(tone(0.13, CAP_HZ[k], CAP_HZ[k] * 1.5, expDecay(0.13 * SR, 0.028), 'tri'), 0.22),
);
const routeOn = (k) => gain(
  lp(tone(0.50, CAP_HZ[k] * 0.5, CAP_HZ[k] * 0.75, ar(0.50 * SR, 0.10, 0.22), 'sine'), 2200), 0.14);
/* ── the VPN: wider, lower, and it TRAVELS. The one elastic sound in the film. ───────────────*/
const tunnel = () => add(
  gain(lp(tone(0.78, 150, 330, ar(0.78 * SR, 0.30, 0.26), 'tri', 0.004), 1600), 0.17),
  gain(lp(noise(0.72, ar(0.72 * SR, 0.26, 0.28), 77), 900, 2400), 0.12),
);
const tunnelSettle = () => gain(lp(tone(0.32, 300, 214, expDecay(0.32 * SR, 0.08), 'sine'), 900), 0.22);
/* ── payment: clean, calm, and the confirmation is a RELIEF, not a fanfare ───────────────────*/
const key = (i) => add(
  gain(tone(0.042, 1020 + (i % 3) * 60, 860, expDecay(0.042 * SR, 0.009), 'sine'), 0.20),
  gain(hp(noise(0.008, expDecay(0.008 * SR, 0.0018), 90 + i), 3600), 0.09),
);
const chime = (f = 1046, g0 = 0.20) => add(
  gain(tone(0.60, f, f, expDecay(0.60 * SR, 0.16), 'sine'), g0),
  gain(tone(0.60, f * 1.5, f * 1.5, expDecay(0.60 * SR, 0.10), 'sine'), g0 * 0.4),
);
/* ── THE REVEAL. Six parts, because it describes the same physics the picture does: the room is
      pulled in, a shell separates, a low body lands, the routes reorient, and it rings out
      briefly. Short, and never louder than the narration. ───────────────────────────────────*/
const inhale = () => gain(rev(lp(noise(0.62, ar(0.62 * SR, 0.02, 0.18), 71), 1800, 360)), 0.20);
const shellOff = () => add(
  gain(hp(noise(0.05, ar(0.05 * SR, 0.004, 0.02), 81), 1600), 0.30),   // the seam parting
  gain(lp(tone(0.30, 240, 88, expDecay(0.30 * SR, 0.06), 'sine'), 800), 0.46),  // the body
  gain(lp(tone(0.55, 160, 122, expDecay(0.55 * SR, 0.16), 'tri'), 1300), 0.12), // the tail
);
const reorient = (i) => gain(
  lp(tone(0.34, 300 - i * 30, 190 - i * 18, expDecay(0.34 * SR, 0.08), 'tri'), 1400), 0.13);
/* ── data: very small digital ticks. Most packets are SILENT. ────────────────────────────────*/
const packet = (i) => add(
  gain(tone(0.045, 900 * Math.pow(2, ((i * 5) % 5 - 2) / 12), 720, expDecay(0.045 * SR, 0.010), 'sine'), 0.20),
  gain(hp(noise(0.007, expDecay(0.007 * SR, 0.0018), 100 + i), 5200), 0.08),
);
/* ── the extraction: the one WRONG-sounding thing in the film, and it is quiet ───────────────*/
const extract = () => gain(rev(add(
  gain(lp(noise(0.36, ar(0.36 * SR, 0.03, 0.14), 111), 2600, 700), 0.30),
  gain(tone(0.36, 520, 300, ar(0.36 * SR, 0.04, 0.12), 'tri'), 0.14),
)), 0.9);
const endpointHit = (i) => gain(lp(tone(0.15, 148 + i * 10, 84, expDecay(0.15 * SR, 0.032), 'sine'), 620), 0.30);
/* ── prevention and resolution: restrained, never fantasy sparkle ────────────────────────────*/
const stroke = (i) => add(
  gain(hp(noise(0.10, ar(0.10 * SR, 0.006, 0.05), 121 + i), 1800), 0.26),
  gain(tone(0.14, 300 - i * 40, 150, expDecay(0.14 * SR, 0.03), 'tri'), 0.18),
);
const retract = (i) => gain(lp(tone(0.22, 260 - i * 22, 150, expDecay(0.22 * SR, 0.05), 'sine'), 800), 0.13);
const uiSoft = () => add(
  gain(tone(0.09, 640, 820, expDecay(0.09 * SR, 0.02), 'sine'), 0.20),
  gain(hp(noise(0.010, expDecay(0.010 * SR, 0.0022), 131), 3200), 0.10),
);

/* ════ PLACEMENT ═════════════════════════════════════════════════════════════════════════════
   Pan follows the picture: the message arrives from the right, the exfiltration leaves to the
   right, the barrier is central. Stereo is polish; every meaning survives mono. */
at(Q.cardArrive, 'the message leaves', notify(1300, 5), 0.42, 0.45);
at(Q.cardLand, 'the card lands', cardLand(), -0.10, 0.95);
at(Q.plateSet, 'plate sets', uiSoft(), -0.1, 0.35);
at(Q.amountRoll, 'the amount rolls', add(...[0, 1, 2, 3, 4].map((i) => {
  const v = instTick(i * 3); const o = new Float32Array(v.length + Math.round(i * 0.055 * SR));
  o.set(v, Math.round(i * 0.055 * SR)); return o;
})), -0.05, 0.9);
at(Q.tileLift, 'the attachment lifts', gain(travel(0.34, 9), 0.9), 0, 0.7);
at(Q.glyphBecomesPackage, 'it becomes a package', uiSoft(), 0, 0.5);
at(Q.apkTap, 'the tap', tap(), -0.05, 1.0);
at(Q.apkTap + 0.085, 'release', release(), -0.05, 0.8);
at(Q.systemRise, 'the system rises', drawer(true), 0, 0.8);
at(Q.warningLands, 'the warning lands', add(
  gain(lp(tone(0.22, 330, 214, expDecay(0.22 * SR, 0.05), 'tri'), 1200), 0.26),
  gain(hp(noise(0.02, expDecay(0.02 * SR, 0.004), 61), 2200), 0.16)), 0.05, 0.85);
at(Q.packageBlocked, 'BLOCKED', block(), 0, 1.0);
at(Q.toggleIn, 'the control enters', uiSoft(), 0.1, 0.5);
at(Q.togglePress, 'the toggle', tap(1.1), 0.12, 1.0);
at(Q.togglePress + 0.09, 'the toggle settles', release(), 0.12, 0.7);
at(Q.barrierOpens, 'the barrier opens', gateOpen(), 0, 0.95);
at(Q.installerIn, 'the installer', drawer(true), 0, 0.55);
at(Q.installProgress, 'INSTALL', tap(), 0.1, 0.95);
for (let i = 0; i < 12; i++)
  at(Q.installProgress + 0.18 + i * (0.09 + i * 0.012), `install ${i}`, instTick(i), -0.2 + i * 0.03, 0.6);
at(Q.iconDocks, 'the icon docks', dock(), -0.15, 0.85);
at(Q.appOpens, 'the service opens', chime(784, 0.16), 0, 0.5);

at(Q.updateRise, 'the update intrudes', drawer(true), 0, 0.7);
at(Q.updateWords, 'amber', gain(tone(0.5, 300, 300, ar(0.5 * SR, 0.2, 0.2), 'tri'), 0.07), 0, 0.8);
at(Q.updatePress, 'INSTALL UPDATE', tap(), -0.05, 1.0);
at(Q.payloadAppears, 'a second package', gain(travel(0.6, 19), 1.0), 0, 0.7);
at(Q.installer2, 'the OS steps in', drawer(true), 0, 0.5);
at(Q.confirm2, 'confirmed', tap(), 0.08, 0.95);
for (let i = 0; i < 8; i++)
  at(Q.confirm2 + 0.2 + i * 0.13, `install2 ${i}`, instTick(i + 20), -0.1, 0.5);
at(Q.payloadLands, 'the payload lands', add(
  gain(lp(tone(0.28, 132, 66, expDecay(0.28 * SR, 0.06), 'sine'), 560), 0.46),
  gain(lp(noise(0.05, expDecay(0.05 * SR, 0.012), 88), 900), 0.20)), 0, 0.9);
at(Q.appResurfaces, 'the app returns', uiSoft(), 0, 0.45);

/* permissions: one family, four instances, each keeping its pitch for the rest of the film */
const grants = [['sms', Q.smsCard, Q.smsGrant], ['call', Q.callCard, Q.callGrant],
  ['bg', Q.bgConcept, Q.bgGrant], ['vpn', Q.vpnCard, Q.vpnGrant]];
for (const [k, card, grant] of grants) {
  at(card, `${k} prompt`, permPop(k), 0, 0.7);
  at(grant, `${k} ALLOW`, tap(), -0.05, 0.95);
  at(grant + 0.07, `${k} unlocks`, lockOpen(k), 0, 0.85);
  at(grant + 0.14, `${k} route`, routeOn(k), k === 'sms' ? -0.3 : k === 'call' ? 0.3 : 0, 0.8);
}
at(Q.tunnelGrows, 'the tunnel extends', tunnel(), 0.28, 0.95);
at(Q.tunnelSettles, 'the tunnel settles', tunnelSettle(), 0.34, 0.85);
Q.hastyTaps.forEach((t, i) => {
  at(t - 0.16, `hasty prompt ${i}`, permPop(['sms', 'call', 'sms'][i]), 0, 0.5);
  at(t, `hasty allow ${i}`, tap(1 + i * 0.06), -0.05 + i * 0.05, 0.9);
});

at(Q.foldToPayment, 'the card folds', uiSoft(), 0, 0.45);
for (let i = 0; i < 14; i++)
  at(Q.typing + 0.12 + i * (0.115 + (i % 3) * 0.02), `key ${i}`, key(i), -0.08 + (i % 4) * 0.04, 0.75);
at(Q.payPress, 'PAY', tap(1.15), 0, 1.0);
for (let i = 0; i < 5; i++)
  at(Q.spinner + 0.1 + i * 0.22, `processing ${i}`, gain(instTick(i + 40), 0.7), 0, 0.45);
at(Q.tickDraws, 'the tick draws', gain(lp(noise(0.20, ar(0.20 * SR, 0.05, 0.10), 151), 2600), 0.13), 0, 0.7);
at(Q.successLands, 'PAID', chime(1046, 0.22), 0, 0.85);

/* THE REVEAL — the film's loudest moment, and only just */
at(Q.shellOpens - 0.52, 'inhale', inhale(), 0.08, 0.9);
at(Q.shellOpens, 'THE SHELL COMES OFF', shellOff(), -0.08, 1.0);
at(Q.payloadExposed, 'the payload, exposed', gain(lp(tone(0.42, 190, 128,
  expDecay(0.42 * SR, 0.11), 'sine'), 900), 0.30), 0, 0.9);
[0, 1, 2].forEach((i) => at(Q.routesBend + i * 0.20, `route ${i} bends`, reorient(i),
  [-0.3, 0.3, -0.15][i], 0.8));
at(Q.coreTurns, 'the core turns', add(
  gain(lp(tone(0.9, 96, 62, expDecay(0.9 * SR, 0.26), 'tri'), 700), 0.24),
  gain(lp(tone(0.9, 192, 150, expDecay(0.9 * SR, 0.18), 'sine'), 1100), 0.10)), 0, 0.95);

/* theft: sparse and procedural. Most packets are silent; the ones that are not are the argument */
[0, 1, 2, 3].forEach((i) => at(Q.credDetach + i * 0.14, `credential ${i}`, packet(i), -0.12, 0.6));
at(Q.credInCore, 'into the core', endpointHit(0), -0.1, 0.55);
at(Q.smsNamed, 'the SMS route lights', routeOn('sms'), -0.25, 0.9);
at(Q.otpArrives, 'a perfectly normal OTP', notify(1560, 13), -0.1, 0.85);
at(Q.duplicate, 'the copy', extract(), 0.1, 0.9);
at(Q.exfil, 'out through the tunnel', gain(travel(0.9, 29), 1.0), 0.3, 0.8);
[0, 1, 2].forEach((i) => at(Q.serverReceives + i * 0.22, `received ${i}`, endpointHit(i), 0.42, 0.85));
at(Q.bothPresent, 'both halves', add(endpointHit(1), gain(tone(0.5, 300, 300,
  expDecay(0.5 * SR, 0.13), 'tri'), 0.10)), 0.4, 0.9);

/* recap: each object keeps a faint version of its own sound as it docks */
const dockSounds = ['cardLand', 'travel', 'gateOpen', 'dock', 'tap', 'payloadLands',
  'sms', 'call', 'bg', 'vpn', 'key', 'packet'];
for (let i = 0; i < 12; i++) {
  const t = Q.chainNodes[0] + (i / 11) * (Q.chainFlows - 0.4 - Q.chainNodes[0]);
  const k = dockSounds[i];
  const s = k === 'cardLand' ? cardLand(3) : k === 'travel' ? travel(0.3, 33) : k === 'gateOpen'
    ? gateOpen() : k === 'dock' ? dock() : k === 'tap' ? tap() : k === 'payloadLands'
      ? gain(lp(tone(0.2, 130, 70, expDecay(0.2 * SR, 0.05), 'sine'), 560), 0.4)
      : ['sms', 'call', 'bg', 'vpn'].includes(k) ? permPop(k) : k === 'key' ? key(2) : packet(3);
  at(t, `recap ${k}`, s, -0.3 + (i % 3) * 0.3, 0.30);
}
at(Q.endpointWakes, 'and only then does it work', add(endpointHit(2),
  gain(lp(tone(0.7, 88, 62, expDecay(0.7 * SR, 0.2), 'tri'), 640), 0.20)), 0.3, 0.9);

/* prevention and resolution */
at(Q.xStroke1, 'no', stroke(0), -0.12, 0.9);
at(Q.xStroke2, 'no', stroke(1), 0.12, 0.9);
for (let i = 0; i < 5; i++) at(Q.ghostRetracts + i * 0.14, `retract ${i}`, retract(i), 0.2 - i * 0.1, 0.6);
at(Q.browserGrows, 'a route you drove', uiSoft(), 0, 0.6);
at(Q.portalLands, 'the portal', add(
  gain(lp(tone(0.24, 200, 130, expDecay(0.24 * SR, 0.055), 'sine'), 700), 0.34),
  gain(hp(noise(0.016, expDecay(0.016 * SR, 0.0035), 161), 2400), 0.12)), 0, 0.8);
at(Q.lookup, 'checked', tap(0.9), 0, 0.8);
at(Q.verified, 'verified', chime(1318, 0.19), 0, 0.85);

console.log(`${EVENTS.length} sounds placed`);
{
  const sorted = [...EVENTS].sort((a, b) => a.t - b.t);
  let min = 99, at1 = '';
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i].t - sorted[i - 1].t;
    if (d < min) { min = d; at1 = `${sorted[i - 1].name} -> ${sorted[i].name}`; }
  }
  console.log(`  closest pair ${min.toFixed(3)}s apart (${at1})`);
  console.log(`  density ${(EVENTS.length / C.duration).toFixed(2)} sounds/s — the plan asks for `
    + 'causes, not sonified motion');
}

/* ════ MUSIC ═════════════════════════════════════════════════════════════════════════════════
   Not one track ridden up and down: ten sections with their own layers, so the score DECONSTRUCTS
   at the reveal instead of getting louder. The trusted motif returns in the final scene, resolved. */
const mus = buffer(DUR);
const N = (semi) => 55 * Math.pow(2, semi / 12);
const SECTIONS = [
  /* t, root, mode, pad, pulse, lead, label */
  [0, 0, 'min', 0.55, 0.50, 0.30, 'curious'],
  [C.phases.barrier, -2, 'min', 0.60, 0.42, 0.16, 'friction'],
  [C.phases.firstapp, 3, 'maj', 0.62, 0.34, 0.34, 'reassurance'],
  [C.phases.update, 0, 'min', 0.58, 0.46, 0.20, 'anomaly'],
  [C.phases.permissions, 0, 'min', 0.52, 0.70, 0.12, 'accumulation'],
  [C.phases.hasty, 0, 'min', 0.48, 0.92, 0.08, 'habit'],
  [C.phases.payment, 3, 'maj', 0.64, 0.26, 0.30, 'false calm'],
  [Q.thin, 3, 'maj', 0.46, 0.10, 0.00, 'a layer removed'],
  [Q.shellOpens, -4, 'min', 0.70, 0.16, 0.00, 'the reveal'],
  [C.phases.theft, -4, 'min', 0.50, 0.64, 0.00, 'procedural'],
  [C.phases.recap, -2, 'min', 0.52, 0.40, 0.14, 'explanation'],
  [C.phases.prevention, 0, 'maj', 0.56, 0.26, 0.22, 'clean'],
  [C.phases.verify, 3, 'maj', 0.60, 0.16, 0.34, 'resolved'],
];
const sec = (t) => { let s = SECTIONS[0]; for (const x of SECTIONS) if (t >= x[0]) s = x;
  return { root: s[1], mode: s[2], pad: s[3], pulse: s[4], lead: s[5] }; };
/* layers cross-fade over 1.2s so no section boundary is a step */
const smooth = (t, key) => {
  const i = { pad: 3, pulse: 4, lead: 5 }[key];
  let prev = SECTIONS[0], next = SECTIONS[0];
  for (const x of SECTIONS) if (t >= x[0]) prev = x;
  for (const x of SECTIONS) if (x[0] > prev[0]) { next = x; break; }
  const span = 1.2;
  if (next[0] > prev[0] && t > next[0] - span) {
    const u = Math.min(1, (t - (next[0] - span)) / span);
    return prev[i] + (next[i] - prev[i]) * u;
  }
  return prev[i];
};
/* pad */
for (let t = 0; t < DUR; t += 0.5) {
  const s = sec(t), amt = smooth(t, 'pad');
  if (amt < 0.02) continue;
  const chord = s.mode === 'maj' ? [0, 7, 16] : [0, 7, 15];
  for (const d of chord) {
    const f = N(s.root + d);
    put(mus, t, gain(lp(tone(0.92, f, f, ar(0.92 * SR, 0.30, 0.42), 'sine'), 900),
      0.030 * amt), (d % 5) * 0.08 - 0.1, 1);
  }
}
/* pulse: a plucked eighth at 100bpm, gated by the section's pulse amount */
{
  const beat = 60 / 100 / 2;
  for (let k = 0; k * beat < DUR; k++) {
    const t = k * beat, s = sec(t), amt = smooth(t, 'pulse');
    if (amt < 0.04) continue;
    const deg = s.mode === 'maj' ? [0, 7, 4, 7, 0, 9, 4, 7] : [0, 7, 3, 7, 0, 8, 3, 7];
    const f = N(s.root + deg[k % 8] + 24);
    put(mus, t, gain(lp(tone(0.19, f, f, expDecay(0.19 * SR, 0.052), 'tri'), 2400), 0.058 * amt),
      ((k % 4) - 1.5) * 0.12, 1);
  }
}
/* lead: a slow four-note figure — the TRUSTED motif. It is removed entirely before the reveal and
   returns, resolved, in the final scene. */
{
  const bar = 60 / 100 * 2;
  for (let k = 0; k * bar < DUR; k++) {
    const t = k * bar, s = sec(t), amt = smooth(t, 'lead');
    if (amt < 0.03) continue;
    const deg = s.mode === 'maj' ? [12, 16, 19, 16] : [12, 15, 19, 15];
    const f = N(s.root + deg[k % 4] + 12);
    put(mus, t, gain(lp(tone(1.05, f, f, ar(1.05 * SR, 0.08, 0.34), 'sine'), 1800), 0.048 * amt),
      0.18, 1);
  }
}
/* one short accent ON the reveal — an accent, not a trailer drop */
put(mus, Q.shellOpens, add(
  gain(lp(tone(1.0, N(-4) * 2, N(-4) * 2, expDecay(1.0 * SR, 0.26), 'tri'), 900), 0.095),
  gain(lp(tone(1.0, N(-4) * 3, N(-4) * 3, expDecay(1.0 * SR, 0.17), 'sine'), 1400), 0.045),
), 0, 1);
/* and a resolving tone under the verification, ringing past the last word */
put(mus, Q.verified - 0.15, add(
  gain(lp(tone(3.4, N(3) * 4, N(3) * 4, ar(3.4 * SR, 0.12, 1.3), 'sine'), 2200), 0.070),
  gain(lp(tone(3.4, N(10) * 3, N(10) * 3, ar(3.4 * SR, 0.18, 1.2), 'sine'), 2200), 0.044),
  gain(lp(tone(3.4, N(3) * 2, N(3) * 2, ar(3.4 * SR, 0.20, 1.5), 'sine'), 900), 0.050),
), 0, 1);

fs.mkdirSync('.tts-echallan', { recursive: true });
const p1 = writeWav('.tts-echallan/sfx.wav', fx, fs);
const p2 = writeWav('.tts-echallan/music.wav', mus, fs);
console.log(`sfx peak ${p1.peak.toFixed(2)}  music peak ${p2.peak.toFixed(2)}`);

/* ════ MIX ═══════════════════════════════════════════════════════════════════════════════════
   Narration is the loudest storytelling layer at every instant. The music is side-chained to the
   voice so it ducks under dense speech instead of being ridden by hand; the SFX sit between. */
const MIXGRAPH = '[0:a]aformat=channel_layouts=stereo[v];'
  + '[v]asplit=3[vmix][sc1][sc2];'
  + `[1:a]volume=0.42,afade=t=out:st=${(C.duration - 2.0).toFixed(2)}:d=1.9[m];`
  + '[m][sc1]sidechaincompress=threshold=0.05:ratio=9:attack=12:release=340:makeup=1[mduck];'
  + '[2:a]volume=0.70[s];'
  + '[s][sc2]sidechaincompress=threshold=0.10:ratio=3:attack=6:release=180:makeup=1[sduck];'
  + `[vmix][mduck][sduck]amix=inputs=3:duration=longest:normalize=0,`
  + `afade=t=out:st=${(C.duration - 0.40).toFixed(2)}:d=0.38[out]`;

const build = (extra, out) => execFileSync(FF, ['-y',
  '-i', 'public/Audio/echallan-narration.wav', '-i', '.tts-echallan/music.wav',
  '-i', '.tts-echallan/sfx.wav',
  '-filter_complex', `${MIXGRAPH};${extra}`, '-map', '[fin]', '-ar', '48000', '-ac', '2', out],
  { stdio: ['ignore', 'pipe', 'pipe'] });

/* TWO PASS, and deliberately NOT loudnorm's single-pass mode: single-pass loudnorm is a dynamic
   normaliser and it would flatten the one thing the sound design exists for — the drop in
   stimulation before the reveal and the release at the shell. Measure once, apply ONE static gain,
   catch peaks with a limiter. The arc survives. */
build('[out]anull[fin]', '.tts-echallan/mix_raw.wav');
const js = JSON.parse(execFileSync('/bin/sh', ['-c',
  `${FF} -i .tts-echallan/mix_raw.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 `
  + `| sed -n '/^{/,/^}/p'`], { encoding: 'utf8' }));
const measured = parseFloat(js.input_i);
const adjust = Math.min(12, -14 - measured);
console.log(`mix measured ${measured.toFixed(1)} LUFS, LRA ${parseFloat(js.input_lra).toFixed(1)} `
  + `LU -> gain ${adjust.toFixed(2)} dB`);
build(`[out]volume=${adjust.toFixed(2)}dB,alimiter=limit=0.72:attack=3:release=80:level=disabled[fin]`,
  '.tts-echallan/mix.wav');
const after = JSON.parse(execFileSync('/bin/sh', ['-c',
  `${FF} -i .tts-echallan/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 `
  + `| sed -n '/^{/,/^}/p'`], { encoding: 'utf8' }));
console.log(`final ${parseFloat(after.input_i).toFixed(1)} LUFS, `
  + `LRA ${parseFloat(after.input_lra).toFixed(1)} LU, TP ${parseFloat(after.input_tp).toFixed(1)} dBFS`);

/* ── THE CHECK THAT MATTERS ──────────────────────────────────────────────────────────────────
   Global LRA is the wrong instrument: 128 seconds of near-continuous narration is flat by
   construction. What the design actually promises is a DROP IN STIMULATION before the reveal and
   a release at it — so measure exactly that, on the bed alone, with the voice excluded because
   the voice is still speaking through it. */
const bedRms = (a, b) => parseFloat(execFileSync('/bin/sh', ['-c',
  `${FF} -i .tts-echallan/music.wav -i .tts-echallan/sfx.wav -filter_complex `
  + `"[0:a]volume=0.42[m];[1:a]volume=0.70[s];[m][s]amix=inputs=2:normalize=0,`
  + `atrim=${a}:${b},astats=metadata=1:reset=0" -f null - 2>&1 | grep -m1 "RMS level dB"`],
  { encoding: 'utf8' }).split(':')[1]);
const before = bedRms(Q.thin - 1.8, Q.thin - 0.1);
const during = bedRms(Q.seamsCatch, Q.shellOpens - 0.05);
const release2 = bedRms(Q.shellOpens, Q.shellOpens + 1.2);
console.log(`stimulation before the reveal: bed ${before.toFixed(1)} -> ${during.toFixed(1)} `
  + `-> ${release2.toFixed(1)} dB at the shell`);
if (during > before - 2.5)
  throw new Error(`no audible drop before the reveal (${(before - during).toFixed(1)} dB) — the `
    + 'micro-pause the design depends on is not there');
if (release2 < during + 3)
  throw new Error('the reveal is not the release the drop was setting up');

execFileSync(FF, ['-y', '-i', '.tts-echallan/mix.wav', '-c:a', 'aac', '-b:a', '192k',
  'public/Audio/echallan-mix.m4a'], { stdio: ['ignore', 'pipe', 'pipe'] });
console.log('mix -> public/Audio/echallan-mix.m4a');
