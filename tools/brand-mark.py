"""Builds public/brand/ifa-mark.png from the channel logo.

The watermark is line art, not a sticker: the cream disc the logo is drawn on
is dropped entirely and every stroke is re-cut in the film's own ink with an
alpha taken from how far the pixel sits from that paper. That way the mark can
be held at one low opacity over a near-black frame without carrying a bright
disc behind it.

The mark is the channel's identity, so nothing about it may be clipped. The
crop is squared about the ring's own centre, a margin is added outside the
outermost ink, and the resize is done by ffmpeg over the whole image — an
earlier version binned 1221px into 256 with integer-sized bins and quietly
dropped the last 197 rows and columns, which took a bite out of the ring.

  usage:  .venv-asr/bin/python tools/brand-mark.py
"""
import subprocess, numpy as np, zlib, struct, os

SRC = 'public/brand/ifa-logo-source.jpg'
OUT = 'public/brand/ifa-mark.png'
SIZE = 512                      # delivery size; the film draws it at ~46px
# One file per ink the film uses. The mark is line art with an alpha channel, so
# the colour has to be baked: tinting a raster at render time would mean a CSS
# mask, and Remotion does not wait on mask images the way it waits on <Img>.
INKS = {"": (243, 240, 232),            # C.ink — the film's off-white
        "-teal": (62, 152, 135),        # the logo's own ring colour, lifted for a dark ground
        "-gold": (214, 160, 60)}        # the chevron's gold
HI, LO = 238.0, 120.0           # cream paper -> transparent, teal/charcoal -> solid
MARGIN = 0.025                  # breathing room outside the outermost stroke

probe = subprocess.run(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-select_streams', 'v:0',
                        '-show_entries', 'stream=width,height', '-of', 'csv=p=0', SRC],
                       capture_output=True, text=True).stdout.strip().split(',')
W, H = int(probe[0]), int(probe[1])
raw = subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-i', SRC,
                      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
img = np.frombuffer(raw, dtype=np.uint8).reshape(H, W, 3).astype(np.float32)
lum = 0.2126 * img[..., 0] + 0.7152 * img[..., 1] + 0.0722 * img[..., 2]
alpha = np.clip((HI - lum) / (HI - LO), 0, 1)

ys, xs = np.where(alpha > 0.25)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
r = max(x1 - x0, y1 - y0) / 2 * (1 + MARGIN)
print(f"source {W}x{H}   ink bbox {x1-x0}x{y1-y0} at ({x0},{y0})   centre ({cx:.1f},{cy:.1f})  r {r:.1f}")

# the square that holds the whole mark, padded with transparency if the source
# has less room around the ring than the margin asks for
side = int(round(r * 2))
pad = np.zeros((side, side), np.float32)
sx0, sy0 = int(round(cx - r)), int(round(cy - r))
gx0, gy0 = max(0, sx0), max(0, sy0)
gx1, gy1 = min(W, sx0 + side), min(H, sy0 + side)
pad[gy0 - sy0:gy1 - sy0, gx0 - sx0:gx1 - sx0] = alpha[gy0:gy1, gx0:gx1]

# the ring must survive intact: check the alpha that lands on its own circle
th = np.linspace(0, 2 * np.pi, 720, endpoint=False)
rr = (side / 2) / (1 + MARGIN) * 0.985
probe_a = pad[np.clip((side / 2 + rr * np.sin(th)).astype(int), 0, side - 1),
              np.clip((side / 2 + rr * np.cos(th)).astype(int), 0, side - 1)]
print(f"ring sweep: min alpha {probe_a.min():.2f}  mean {probe_a.mean():.2f}  "
      f"gaps below 0.5: {(probe_a < 0.5).sum()} of 720")
assert probe_a.min() > 0.5, "the ring is not continuous — the crop is cutting it"

def png(path, arr):
    h, w = arr.shape[:2]
    rows = b''.join(b'\x00' + arr[y].tobytes() for y in range(h))
    def chunk(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))

for suffix, ink in INKS.items():
    full = np.zeros((side, side, 4), np.uint8)
    full[..., 0], full[..., 1], full[..., 2] = ink
    full[..., 3] = np.clip(pad * 255 + 0.5, 0, 255).astype(np.uint8)
    tmp = 'public/brand/.ifa-mark-full.png'
    out = OUT.replace('.png', f'{suffix}.png')
    png(tmp, full)
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-y', '-i', tmp,
                    '-vf', f'scale={SIZE}:{SIZE}:flags=lanczos', '-pix_fmt', 'rgba', out], check=True)
    os.remove(tmp)
    print(f"{out}  {SIZE}x{SIZE}  {os.path.getsize(out)} bytes  (from a {side}px square)")
