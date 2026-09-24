/* A tiny deterministic synthesis kit. Everything the film hears is generated here from numbers —
   there are no sample libraries, so the whole bed is original, and two runs are bit-identical. */
export const SR = 48000;

export const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const buffer = (seconds) => ({
  L: new Float32Array(Math.ceil(seconds * SR)),
  R: new Float32Array(Math.ceil(seconds * SR)),
  len: Math.ceil(seconds * SR),
});

/** add a mono voice into the buffer at `at` seconds, panned -1..1 */
export function put(buf, at, samples, pan = 0, gain = 1) {
  const i0 = Math.round(at * SR);
  const l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < samples.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= buf.len) continue;
    buf.L[j] += samples[i] * l * gain * 1.414;
    buf.R[j] += samples[i] * r * gain * 1.414;
  }
}

/* ── envelopes ── */
export const expDecay = (n, tau) => { n = Math.round(n); const e = new Float32Array(n); for (let i = 0; i < n; i++) e[i] = Math.exp(-i / (tau * SR)); return e; };
export const ar = (n, a, r) => {
  n = Math.round(n);
  const e = new Float32Array(n), ai = Math.max(1, a * SR);
  for (let i = 0; i < n; i++) e[i] = i < ai ? i / ai : Math.exp(-(i - ai) / (r * SR));
  return e;
};

/* ── sources ── */
export function tone(dur, f0, f1, env, shape = 'sine', detune = 0) {
  const n = Math.round(dur * SR), o = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n, f = f0 * Math.pow(f1 / f0, u) * (1 + detune * Math.sin(i / SR * 5.5));
    ph += (2 * Math.PI * f) / SR;
    const s = shape === 'sine' ? Math.sin(ph)
      : shape === 'tri' ? (2 / Math.PI) * Math.asin(Math.sin(ph))
        : shape === 'saw' ? ((ph / Math.PI) % 2) - 1
          : Math.sign(Math.sin(ph));
    o[i] = s * env[Math.min(i, env.length - 1)];
  }
  return o;
}

export function noise(dur, env, seed = 1) {
  const n = Math.round(dur * SR), o = new Float32Array(n), r = mulberry32(seed);
  for (let i = 0; i < n; i++) o[i] = (r() * 2 - 1) * env[Math.min(i, env.length - 1)];
  return o;
}

/* one-pole filters — enough to give a sound a size without any library */
export function lp(x, hz, sweepTo = null) {
  const o = new Float32Array(x.length); let y = 0;
  for (let i = 0; i < x.length; i++) {
    const f = sweepTo === null ? hz : hz * Math.pow(sweepTo / hz, i / x.length);
    const a = 1 - Math.exp(-2 * Math.PI * f / SR);
    y += a * (x[i] - y); o[i] = y;
  }
  return o;
}
export function hp(x, hz) {
  const o = new Float32Array(x.length); let y = 0;
  for (let i = 0; i < x.length; i++) {
    const a = 1 - Math.exp(-2 * Math.PI * hz / SR);
    y += a * (x[i] - y); o[i] = x[i] - y;
  }
  return o;
}
export const mul = (a, b) => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * b[Math.min(i, b.length - 1)]; return o; };
export const add = (...xs) => {
  const n = Math.max(...xs.map((x) => x.length)), o = new Float32Array(n);
  for (const x of xs) for (let i = 0; i < x.length; i++) o[i] += x[i];
  return o;
};
export const gain = (x, g) => { const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) o[i] = x[i] * g; return o; };
export const rev = (x) => Float32Array.from(x).reverse();

/* ── 16-bit stereo WAV ── */
export function writeWav(path, buf, fs) {
  const n = buf.len, bytes = n * 4, b = Buffer.alloc(44 + bytes);
  b.write('RIFF', 0); b.writeUInt32LE(36 + bytes, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(bytes, 40);
  let peak = 0, bad = 0;
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(buf.L[i]) || !Number.isFinite(buf.R[i])) { bad++; buf.L[i] = 0; buf.R[i] = 0; }
    peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  }
  if (bad) throw new Error(`${path}: ${bad} non-finite samples — a voice is producing NaN`);
  const norm = peak > 0.98 ? 0.98 / peak : 1;
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.L[i] * norm * 32767))), 44 + i * 4);
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.R[i] * norm * 32767))), 46 + i * 4);
  }
  fs.writeFileSync(path, b);
  return { peak, norm };
}
