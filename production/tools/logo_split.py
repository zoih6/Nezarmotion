#!/usr/bin/env python3
"""Split the Wamd logo into animatable layers (coords in the 1254px source)."""
import numpy as np, cv2, json, sys
src = sys.argv[1]; out = sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_UNCHANGED).astype(np.float32)
h, w = im.shape[:2]; a = im[..., 3]
ys, xs = np.where(a > 128); cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
R = (xs.max() - xs.min() + ys.max() - ys.min()) / 4
yy, xx = np.mgrid[0:h, 0:w]; rr = np.hypot(xx - cx, yy - cy)
# ring inner radius: scan along +x from centre for first non-cream after cream region
cream = np.median(im[590:640, 1070:1110, :3].reshape(-1, 3), 0)
row = im[int(cy), int(cx):, :3]; d = np.abs(row - cream).max(-1)
rin = None
for i in range(int(1080 - cx), len(d)):
    if d[i] > 60 and d[i:i + 5].min() > 60: rin = i; break
print('centre', cx, cy, 'R', R, 'rin', rin, 'cream', cream)
def save(name, rgba): cv2.imwrite(f'{out}/logo_{name}.png', rgba.astype(np.uint8))
ring = im.copy(); ring[..., 3] = np.where(rr >= rin - 1, a, 0); save('ring', ring)
inner = im.copy(); inner[..., 3] = np.where(rr < rin + 2, a, 0)
boxes = {'mark': (722, 296, 1052, 493), 'word': (722, 493, 1062, 624), 'wamd': (722, 624, 1072, 694),
         'tag': (722, 694, 1072, 802), 'dpink': (295, 195, 402, 318), 'dgreen': (196, 355, 285, 492)}
meta = {'cx': float(cx), 'cy': float(cy), 'R': float(R), 'rin': int(rin), 'size': [w, h], 'boxes': {}}
for k, (x0, y0, x1, y1) in boxes.items():
    sub = im[y0:y1, x0:x1].copy(); dd = np.abs(sub[..., :3] - cream).max(-1)
    al = np.clip((dd - 10) / 40, 0, 1)
    aa = np.maximum(al, 1e-3)[..., None]
    sub[..., :3] = np.clip((sub[..., :3] - (1 - aa) * cream) / aa, 0, 255); sub[..., 3] = al * 255
    save(k, sub); meta['boxes'][k] = [x0, y0, x1, y1]
    fill = cv2.dilate((dd > 7).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32)
    fill = cv2.GaussianBlur(fill, (5, 5), 0)[..., None]
    noise = np.random.default_rng(1).normal(0, 2.0, sub[..., :3].shape)
    inner[y0:y1, x0:x1, :3] = inner[y0:y1, x0:x1, :3] * (1 - fill) + (cream + noise) * fill
save('inner', inner)
json.dump(meta, open(f'{out}/logo_meta.json', 'w'))
