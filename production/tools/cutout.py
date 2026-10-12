#!/usr/bin/env python3
"""Cutout for generated subjects on flat light backgrounds:
quadratic background model from the border -> diff -> grabCut refine -> despill -> RGBA crop.
usage: cutout.py in.png out.png"""
import sys, numpy as np, cv2
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src).astype(np.float32); h, w = im.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]; yn, xn = yy / h, xx / w
b = np.zeros((h, w), bool); m = 6; b[:m] = b[-m:] = True; b[:, :m] = b[:, -m:] = True
A = np.stack([np.ones_like(xn), xn, yn, xn * xn, yn * yn, xn * yn], -1)
bg = np.zeros_like(im)
for c in range(3):
    coef, *_ = np.linalg.lstsq(A[b], im[..., c][b], rcond=None); bg[..., c] = A @ coef
diff = np.abs(im - bg).max(-1)
diff = cv2.GaussianBlur(diff, (3, 3), 0)
gc = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
gc[diff > 14] = cv2.GC_PR_FGD; gc[diff > 45] = cv2.GC_FGD
n, lab = cv2.connectedComponents((diff < 5).astype(np.uint8))
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
for k in edge:
    if k: gc[lab == k] = cv2.GC_BGD
import os
T=float(os.environ.get('INNER','0'))
if T: gc[diff < T] = cv2.GC_BGD  # also key trapped interior background
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(im.astype(np.uint8), gc, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
hard = np.isin(gc, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)
# keep components of meaningful size
n, lab, st, _ = cv2.connectedComponentsWithStats(hard)
keep = np.zeros_like(hard)
big = st[1:, cv2.CC_STAT_AREA].max()
for k in range(1, n):
    if st[k, cv2.CC_STAT_AREA] > big * 0.004: keep[lab == k] = 1
# soft edge: combine hard mask with diff-based ramp near edges
soft = np.clip((diff - 4) / 22, 0, 1)
if T: keep[diff < T] = 0
dil = cv2.dilate(keep, np.ones((5, 5), np.uint8)); ero = cv2.erode(keep, np.ones((3, 3), np.uint8))
a = np.where(ero > 0, 1.0, np.where(dil > 0, soft, 0.0)).astype(np.float32)
a = cv2.GaussianBlur(a, (3, 3), 0)
# despill: remove background colour contribution
aa = np.maximum(a, 1e-3)[..., None]
col = np.clip((im - (1 - aa) * bg) / aa, 0, 255)
col = np.where(a[..., None] > 0.98, im, col)
out = np.dstack([col, a * 255]).astype(np.uint8)
ys, xs = np.where(a > 0.02); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max(); p = 4
out = out[max(0, y0 - p):y1 + p, max(0, x0 - p):x1 + p]
cv2.imwrite(dst, out); print(dst, out.shape)
