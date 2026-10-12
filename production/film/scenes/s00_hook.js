// sh00 · hook (0–4): a single gold dot pulses with the first notes, then blooms into a horizon line
(() => {
  SHOTS.push({ a: 0, b: 4, tin: 'cut', draw: (t) => {
    set(A.terraces, t, 0, 4.2, { dim: .78, s0: 1.0, s1: 1.05, fx0: .5, fy0: .42, fx1: .5, fy1: .40, ray: null });
    NZ.tint('#141a33', .3); NZ.tint('#d9a441', .05);
    const k = sp(t, .25, 'soft');
    if (k > 0) NZ.seed(540, 730, 13 + 9 * ease(.3, 2.0, t), t);
    const ring = easeOut(.8, 2.1, t); // expanding gold ring = the first action
    if (ring > 0 && ring < 1) arc(540, 730, 20 + ring * 300, 1, { color: PAL.goldL, width: 3, alpha: (1 - ring) * .8 });
    const kb = easeOut(1.9, 3.2, t);
    if (kb > 0) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = kb * .55;
      const gw = Math.max(1, 960 * kb);
      g.drawImage(NZ.glow, 540 - gw / 2, 730 - 190, gw, 380); g.restore();
      line([[-40, 730], [1120, 730]], kb, { color: '#d9a441', width: 14, alpha: kb * .35 });
      line([[-40, 730], [1120, 730]], kb, { color: '#f2cf7e', width: 3, alpha: kb * .9 });
      NZ.tint('#d9a441', kb * .13);
    }
  } });
})();
