// sh08 · line 1 (59.9–62): فوق ثغر الربا — a smile arc draws over the hilltop + karaoke
(() => {
  const P = {};
  INITS.push(async () => { P.l01 = NZ.lyric(['فوق', 'ثغر', 'الربا'], 92); });
  SHOTS.push({ a: 59.9, b: 62, tin: 'cut', draw: (t) => {
    set(A.valley, t, 59.9, 62.2, { dim: .34, s0: 1.12, s1: 1.16, fx0: .62, fy0: .34, fx1: .6, fy1: .32, ray: null });
    NZ.tint(PAL.gold, .12);
    rays(t, { x: 640, y: 400, ang: -1.2, n: 5, int: .14, spread: .8 });
    // the smile of the highlands draws over the hill (snap timing)
    const p = easeOut(60.1, 61.3, t) * .36;
    if (p > 0) {
      arc(670, 540, 195, p, { a0: Math.PI * .14, dir: 1, color: PAL.gold, width: 16, alpha: .4 });
      arc(670, 540, 195, p, { a0: Math.PI * .14, dir: 1, color: PAL.goldL, width: 6, alpha: .95 });
      if (p > .34) { const s = sp(t, 61.25, 'snap');
        nuqta(g, 670 - 195 * Math.cos(Math.PI * .14), 540 + 195 * Math.sin(Math.PI * .14), 12 * s, PAL.goldL);
        nuqta(g, 670 + 195 * Math.cos(Math.PI * .14), 540 + 195 * Math.sin(Math.PI * .14), 12 * s, PAL.goldL); }
    }
    g.save(); g.globalAlpha = clamp((t - 59.9) * 2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5;
    g.drawImage(NZ.glow, 670 - 300, 540 - 300, 600, 600); g.restore();
    NZ.veil([[0, 'rgba(8,6,16,0)'], [.5, 'rgba(8,6,16,0)'], [1, 'rgba(8,6,16,.72)']]);
    NZ.drawLyric(P.l01, t, 59.9, 62.0, 540, 1400);
    NZ.vignTop(.35);
  } });
})();
