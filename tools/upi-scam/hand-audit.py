"""v3 §7 audit, on the raster. Input: an UPRIGHT silhouette (ink dark on light, finger up, a RIGHT
hand: knuckles on the viewer's right) rendered at >= 100 px per FW.

Nothing here reads a constant from the drawing code: FW itself is measured off the finger.
Usage: python3 audit3.py sil.png [--bend DEG]
"""
import json, math, subprocess, sys

def load(path):
    p = subprocess.run(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height', '-of', 'json', path], capture_output=True, text=True)
    s = json.loads(p.stdout)['streams'][0]
    raw = subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-i', path, '-vf', 'format=gray', '-f',
                          'rawvideo', '-'], capture_output=True).stdout
    return s['width'], s['height'], raw

def runs(raw, W, y):
    row, out, x = raw[y * W:(y + 1) * W], [], 0
    while x < W:
        if row[x] < 128:
            a = x
            while x < W and row[x] < 128: x += 1
            out.append((a, x - 1))
        else: x += 1
    return out

def smooth(v, k):
    h = k // 2
    return [sum(v[max(0, i - h):i + h + 1]) / len(v[max(0, i - h):i + h + 1]) for i in range(len(v))]

def verdict(name, val, lo, hi, unit='FW'):
    ok = lo <= val <= hi
    print(f"  {'PASS' if ok else 'FAIL'}  {name:<46} {val:7.3f} {unit}   [{lo:g} … {hi:g}]")
    return ok

def FWguess(fin):
    b = fin[int(len(fin) * 0.9):]
    return sum(x2 - x1 + 1 for _, x1, x2 in b) / len(b)


def main(path, bend):
    W, H, raw = load(path)
    R = {y: runs(raw, W, y) for y in range(H)}
    ys = [y for y in range(H) if R[y]]
    apex = ys[0]
    # ── the free finger: a single run until the knuckle run appears beside it ──
    fin, second = [], None
    for y in ys:
        if len(R[y]) >= 2: second = y; break
        fin.append((y, *R[y][0]))
    # FW is the width AT THE BASE. The finger tapers, so sampling "near the base" reads low and
    # biases every ratio below it; fit the width over the straight run and evaluate it at the notch.
    notch0 = next(y for y in range(second, H) if len(R[y]) == 1)
    run_rows = [(y, a, b) for y, a, b in fin
                if 0.35 * (notch0 - apex) < y - apex < (second - apex) - 0.30 * FWguess(fin)]
    run = [(y, b - a + 1) for y, a, b in run_rows]
    my = sum(y for y, _ in run) / len(run); mw = sum(w for _, w in run) / len(run)
    sl = sum((y - my) * (w - mw) for y, w in run) / sum((y - my) ** 2 for y, _ in run)
    FW = mw + sl * (notch0 - my)
    def fit_at(vals, at):
        my = sum(y for y, _ in vals) / len(vals); mv = sum(v for _, v in vals) / len(vals)
        sl = sum((y - my) * (v - mv) for y, v in vals) / sum((y - my) ** 2 for y, _ in vals)
        return mv + sl * (at - my)
    rad_edge = fit_at([(y, a) for y, a, b in run_rows], notch0)
    uln_edge = fit_at([(y, b) for y, a, b in run_rows], notch0)
    axis = (rad_edge + uln_edge) / 2
    base = fin[int(len(fin) * 0.9):]
    notch = next(y for y in range(second, H) if len(R[y]) == 1)
    f = lambda px: px / FW
    Y = lambda y: f(y - apex)
    X = lambda x: f(x - axis)
    ok = []
    print(f'FW measured = {FW:.1f} px')
    ok.append(verdict('px per FW (audit render)', FW, 100, 1e6, 'px'))
    ok.append(verdict('finger length, apex -> ulnar notch', Y(notch), 3.52, 3.60))
    tip_y = apex + round(0.42 * FW)
    tw = next(b - a + 1 for y, a, b in fin if y >= tip_y)
    ok.append(verdict('tip / base width', tw / FW, 0.81, 0.87, ''))
    dev = max(abs((a + b) / 2 - axis) for y, a, b in fin if 0.6 < Y(y) < Y(second) - 0.35) / FW
    ok.append(verdict('finger axis deviation', dev, 0, 0.03))
    ok.append(verdict('web depth below knuckle 1 top', Y(notch) - Y(second), 0.10, 0.16))
    # ── knuckle row: top profile to the right of the finger ──
    top = []
    for x in range(int(uln_edge) + 2, W):
        col = next((y for y in range(apex, H) if raw[y * W + x] < 128), None)
        if col is None: break
        top.append((x, col))
    tx = [p[0] for p in top]; ty = smooth([p[1] for p in top], 5)
    crest = [i for i in range(3, len(ty) - 3) if ty[i] == min(ty[i - 3:i + 4]) and ty[i] < ty[i - 3] - 0.2 or
             (0 < i < len(ty) - 1 and ty[i] <= ty[i - 1] and ty[i] < ty[i + 1] and ty[i] == min(ty[max(0, i - int(0.3 * FW)):i + int(0.3 * FW)]))]
    cz = []
    for i in crest:
        if not cz or tx[i] - tx[cz[-1]] > 0.4 * FW: cz.append(i)
    # a circle's top is a PLATEAU: taking the first tied column reads its x low by ~0.06 FW.
    # Use the centre of the columns within 1 px of the local minimum instead.
    def plateau(i):
        lo = ty[i]
        j = k = i
        while j > 0 and ty[j - 1] <= lo + 1.0: j -= 1
        while k < len(ty) - 1 and ty[k + 1] <= lo + 1.0: k += 1
        return (tx[j] + tx[k]) / 2, lo
    peaks = [plateau(i) for i in cz]
    valley = [max(range(cz[k], cz[k + 1]), key=lambda i: ty[i]) for k in range(len(cz) - 1)]
    print('  crests (x, y) FW:', '  '.join(f'({X(px_):.2f}, {Y(py_):.2f})' for px_, py_ in peaks))
    if len(cz) == 3:
        for k, (tgx, tgy) in enumerate([(1.05, 3.43), (2.16, 3.97), (3.20, 4.49)]):
            ok.append(verdict(f'knuckle {k+1} top x', X(peaks[k][0]), tgx - 0.05, tgx + 0.05))
            ok.append(verdict(f'knuckle {k+1} top y', Y(peaks[k][1]), tgy - 0.05, tgy + 0.05))
        steps = [X(peaks[1][0]) - X(peaks[0][0]), X(peaks[2][0]) - X(peaks[1][0])]
        print('  crest x-steps FW:', ', '.join(f'{s:.2f}' for s in steps))
        V = [(uln_edge, notch)] + [(tx[i], ty[i]) for i in valley]
        for k in range(2):
            (ax_, ay), (bx, by) = V[k], V[k + 1]
            L = math.hypot(bx - ax_, by - ay)
            sag = max(((bx - ax_) * (ay - ty[i]) - (by - ay) * (ax_ - tx[i])) / L
                      for i in range(len(tx)) if ax_ <= tx[i] <= bx)
            print(f'  lobe {k + 1} sagitta ≈ {abs(sag) / FW:.2f} FW  (chord {L / FW:.2f})')
    else:
        print(f'  !! found {len(cz)} crests, expected 3'); ok.append(False)
    # ── ulnar flank: from lobe 3's ulnar extreme down. A flush lobe is tangent to the flank line. ──
    y3 = int(ty[cz[-1]]) if cz else notch
    band = [(y, max(b for a, b in R[y])) for y in range(y3, y3 + int(1.6 * FW)) if R[y]]
    ye, xe = max(band, key=lambda t: t[1])
    ok.append(verdict('ulnar extreme x', X(xe), 3.83, 3.93))
    prof = [(y, max(b for a, b in R[y])) for y in range(ye, ye + int(3.0 * FW)) if R[y]]
    worst, lo = 0, prof[0][1]
    for _, v in prof: lo = min(lo, v); worst = max(worst, v - lo)
    ok.append(verdict('ulnar flank re-expansion below lobe 3', worst / FW, 0, 0.03))
    fit = [(y, x) for y, x in prof if y >= ye + 0.8 * FW]
    n_ = len(fit); my_ = sum(y for y, _ in fit) / n_; mx_ = sum(x for _, x in fit) / n_
    sl = sum((y - my_) * (x - mx_) for y, x in fit) / sum((y - my_) ** 2 for y, _ in fit)
    over = max(x - (mx_ + sl * (y - my_)) for y, x in band + prof[: int(0.8 * FW)])
    ok.append(verdict('lobe 3 proud of the flank line', over / FW, -0.02, 0.04))
    # ── radial side: thenar ──
    rows = [(y, min(a for a, b in R[y])) for y in range(notch, notch + int(6.2 * FW)) if R[y]]
    py, px = min(rows, key=lambda t: t[1])
    ok.append(verdict('thenar offset beyond finger radial edge', f(rad_edge - px), 0.83, 0.93))
    ok.append(verdict('thenar peak y', Y(py), 6.2, 6.6))
    # waist: narrowest full row below the peak, before the forearm widens
    wr = [(y, max(b for a, b in R[y]) - min(a for a, b in R[y]) + 1) for y in range(py, py + int(3.5 * FW)) if R[y]]
    wy, ww = min(wr, key=lambda t: t[1])
    wa, wb = min(a for a, b in R[wy]), max(b for a, b in R[wy])
    ok.append(verdict('wrist thumb-side x', X(wa), -0.65, -0.35))
    ok.append(verdict('wrist ulnar-side x', X(wb), 2.65, 2.95))
    print(f'  (wrist waist at y {Y(wy):.2f} FW, width {ww / FW:.2f} FW, finger axis {(axis - wa) / (wb - wa) * 100:.0f}% in from the thumb edge)')
    # thenar curvature, from finger base to waist: a least-squares circle through the edge points in
    # a window of ±0.3 FW around each point. A second difference on a 1-px-quantised edge reads noise
    # as a tight radius; a fit over a real arc does not.
    seg = [(y, x) for y, x in rows if notch <= y <= min(wy, apex + int(8.0 * FW))]
    hw = int(0.3 * FW)
    rmin, at = 1e9, None
    for i in range(hw, len(seg) - hw, max(1, int(0.05 * FW))):
        pts = seg[i - hw:i + hw + 1]
        mx = sum(x for _, x in pts) / len(pts); my = sum(y for y, _ in pts) / len(pts)
        # a window a straight line already explains to within ~1.5 px is straight: no radius
        syy = sum((y - my) ** 2 for y, _ in pts)
        b = sum((y - my) * (x - mx) for y, x in pts) / syy
        if max(abs(x - (mx + b * (y - my))) for y, x in pts) < 1.5: continue
        u = [x - mx for _, x in pts]; v = [y - my for y, _ in pts]
        Suu = sum(a * a for a in u); Svv = sum(b * b for b in v); Suv = sum(a * b for a, b in zip(u, v))
        Suuu = sum(a ** 3 for a in u); Svvv = sum(b ** 3 for b in v)
        Suvv = sum(a * b * b for a, b in zip(u, v)); Svuu = sum(b * a * a for a, b in zip(u, v))
        det = Suu * Svv - Suv * Suv
        if abs(det) < 1e-9: continue
        uc = (0.5 * (Suuu + Suvv) * Svv - 0.5 * (Svvv + Svuu) * Suv) / det
        vc = (0.5 * (Svvv + Svuu) * Suu - 0.5 * (Suuu + Suvv) * Suv) / det
        r = math.sqrt(uc * uc + vc * vc + (Suu + Svv) / len(pts))
        if r < rmin: rmin, at = r, seg[i][0]
    ok.append(verdict('thenar min radius of curvature', rmin / FW, 1.0, 1e9))
    print(f'    (tightest at y {Y(at):.2f} FW)')
    off = [(y, rad_edge - x) for y, x in seg]
    tall = [y for y, o in off if o >= 0.75 * (rad_edge - px)]
    ok.append(verdict('thenar height at >= 75% offset', f(max(tall) - min(tall)) if tall else 0, 1.3, 2.0))
    # dip inside the straight chord from the peak to the waist's thumb-side point
    dip = 0
    for y, x in rows:
        if py < y < wy:
            cx = px + (wa - px) * (y - py) / (wy - py)
            dip = max(dip, x - cx)
    ok.append(verdict('dip inside the peak -> wrist chord', dip / FW, 0, 0.15))
    # forearm width, 3 FW below the waist, corrected for the bend
    fy = wy + int(3 * FW)
    if fy < H and R[fy]:
        fwid = (max(b for a, b in R[fy]) - min(a for a, b in R[fy]) + 1) * math.cos(math.radians(bend))
        ok.append(verdict('forearm width at waist + 3 FW', fwid / FW, 3.6, 3.8))
        c1 = (max(b for a, b in R[wy + int(1.5 * FW)]) + min(a for a, b in R[wy + int(1.5 * FW)])) / 2
        c2 = (max(b for a, b in R[fy]) + min(a for a, b in R[fy])) / 2
        ang = math.degrees(math.atan2(c2 - c1, fy - wy - int(1.5 * FW)))
        print(f'  forearm axis leans {ang:+.1f}° ({"ULNAR" if ang > 0.5 else "radial" if ang < -0.5 else "straight"})')
    # wrist corners, as a fitted radius over a window — a turning angle across a 0.1 FW chord is
    # ±5° of raster quantisation at these scales, i.e. below its own threshold.
    def min_radius(pts, hw):
        best = 1e9
        for i in range(hw, len(pts) - hw, max(1, hw // 4)):
            w = pts[i - hw:i + hw + 1]
            mx = sum(x for _, x in w) / len(w); my_ = sum(y for y, _ in w) / len(w)
            u = [x - mx for _, x in w]; v = [y - my_ for y, _ in w]
            Suu = sum(a * a for a in u); Svv = sum(b * b for b in v); Suv = sum(a * b for a, b in zip(u, v))
            syy = sum(b * b for b in v)
            if syy > 0:
                sl2 = Suv / syy
                if max(abs(x - (mx + sl2 * (y - my_))) for y, x in w) < 1.5: continue
            Suuu = sum(a ** 3 for a in u); Svvv = sum(b ** 3 for b in v)
            Suvv = sum(a * b * b for a, b in zip(u, v)); Svuu = sum(b * a * a for a, b in zip(u, v))
            det = Suu * Svv - Suv * Suv
            if abs(det) < 1e-9: continue
            uc = (0.5 * (Suuu + Suvv) * Svv - 0.5 * (Svvv + Svuu) * Suv) / det
            vc = (0.5 * (Svvv + Svuu) * Suu - 0.5 * (Suuu + Suvv) * Suv) / det
            best = min(best, math.sqrt(uc * uc + vc * vc + (Suu + Svv) / len(w)))
        return best
    # The OUTER edge of a bent wrist must stay smooth at any bend. The INNER edge genuinely folds
    # past ~13° — a real wrist creases there — so it is held to the same radius only below that.
    for side, pick in (('thumb', lambda r: min(a for a, b in r)), ('ulnar', lambda r: max(b for a, b in r))):
        e = [(y, pick(R[y])) for y in range(wy - int(1.3 * FW), wy + int(1.3 * FW)) if R[y]]
        r_ = min_radius(e, int(0.3 * FW)) / FW
        inner = (side == 'ulnar')
        if inner and abs(bend) > 13:
            print(f'  ----  wrist min radius (ulnar, inner) {r_:20.3f} FW   fold — exempt above 13°')
        else:
            ok.append(verdict(f'wrist min radius ({side} edge)', r_, 0.95, 1e9))
    print(f"\n{'ALL PASS' if all(ok) else 'FAILURES: ' + str(ok.count(False))}")

if __name__ == '__main__':
    b = float(sys.argv[sys.argv.index('--bend') + 1]) if '--bend' in sys.argv else 0.0
    main(sys.argv[1], b)
