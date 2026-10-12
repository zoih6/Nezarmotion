// sh02–04 · world-building (14–42.6): terraces wake → mist flows → ascent above the clouds
(() => {
  const P = {};
  INITS.push(async () => {
    const w = (s, seed) => card([{ t: s, size: 33, font: UI, weight: 600, color: PAL.cream }], { seed, dark: true, padX: 52, padY: 26, rough: 4 });
    P.w1 = w('تستيقظ المدرَّجات', 21);
    P.w2 = w('يجري الضباب', 22);
    P.w3 = w('نصعد فوق السحاب', 23);
  });

  // sh02 · terraces wake (14–24): dawn blades sweep, mist parts, valley glows, birds enter
  SHOTS.push({ a: 14, b: 24, draw: (t) => {
    set(A.valley, t, 14, 24.2, { dim: .38, s0: 1.0, s1: 1.07, fx0: .5, fy0: .55, fx1: .5, fy1: .5, ray: null });
    NZ.tint(PAL.rose, lerp(0, .12, ease(14, 23, t)));
    rays(t, { x: 540, y: 420, ang: -1.2, n: 5, int: .1, spread: .8 });
    NZ.blade(t, 15.2, 3.2, 1150, 900, '#f2cf7e', .5);
    NZ.blade(t, 17.6, 3.4, 1250, 1000, '#e8a0b4', .35);
    const part = Math.sin(clamp((t - 14) / 10) * Math.PI); // mist parts mid-shot
    NZ.mist(t, 1290, 26, .22 - part * .12, 1.5, 3); NZ.mist(t, 1470, -18, .18, 1.9, 9); NZ.mist(t, 1120, 14, .14, 1.2, 15);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = lerp(0, .4, ease(15, 22, t));
    g.drawImage(NZ.glow, 540 - 420, 1450 - 190, 840, 380); g.restore();
    for (let i = 0; i < 5; i++) { const bt = 17 + i * .5; if (t > bt) {
      const x = 1150 - (t - bt) * 55 - i * 40, y = 520 + i * 66 + Math.sin(t * 1.1 + i * 2) * 14;
      if (x > -60) NZ.bird(x, y, 1.1 + (i % 3) * .3, t, i * 1.7); } }
    NZ.vignTop(.45);
    drawCard(P.w1, t, 15, 540, 1080, { rot: -.015, from: 'right' });
  } });

  // sh03 · mist river (24–33): fog flows through the valley, the sun-seed rises
  SHOTS.push({ a: 24, b: 33, draw: (t) => {
    set(A.valley, t, 24, 33.2, { dim: .3, s0: 1.05, s1: 1.13, fx0: .5, fy0: .55, fx1: .42, fy1: .5, ray: null });
    NZ.tint(PAL.rose, .1); NZ.tint(PAL.gold, lerp(0, .1, ease(24, 32, t)));
    rays(t, { x: 420, y: 420, ang: -1.2, n: 5, int: .12, spread: .8 });
    NZ.mist(t, 1420, 60, .3, 2.2, 5); NZ.mist(t, 1560, 44, .26, 2.6, 11);
    NZ.mist(t, 1290, -34, .2, 1.8, 17); NZ.mist(t, 1700, 70, .24, 2.4, 23);
    const k = ease(24.5, 32.5, t);
    NZ.seed(lerp(660, 540, k), lerp(1560, 640, k), lerp(15, 21, k), t);
    NZ.vignTop(.45);
    drawCard(P.w2, t, 25, 540, 1050, { rot: .015, from: 'right' });
  } });

  // sh04 · ascent (33–42.6): the camera breaks through the clouds; a held breath before the voice
  SHOTS.push({ a: 33, b: 42.6, draw: (t) => {
    set(A.clouds, t, 33, 42.8, { dim: .3, s0: 1.0, s1: 1.16, fx0: .5, fy0: .62, fx1: .5, fy1: .44, ray: null });
    NZ.tint(PAL.gold, lerp(.04, .14, ease(33, 41, t)));
    rays(t, { x: 540, y: 780, ang: -1.45, n: 7, int: lerp(.08, .24, ease(33, 41, t)), spread: 1 });
    NZ.mist(t, 1650, 40, .3, 2.6, 7); NZ.mist(t, 1480, -30, .22, 2.0, 13);
    NZ.seed(540, lerp(1500, 900, ease(33.5, 41, t)), 16, t);
    NZ.vignTop(.4);
    drawCard(P.w3, t, 34, 540, 1150, { rot: -.01, from: 'right' });
    const br = smooth(41.4, 42.45, t); // the held breath: everything glows, then the voice enters
    if (br > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = br * .16;
      g.fillStyle = '#ffe9c4'; g.fillRect(0, 0, W, H); g.restore(); }
  } });
})();
