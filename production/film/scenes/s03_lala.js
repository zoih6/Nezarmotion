// sh05–07 · vocalise (42.6–59.9): the valley sings — لا syllables bloom and rise like petals
(() => {
  const V1 = [42.6, 43.4, 44.2, 45.2, 46.0, 46.8];
  const V2 = [47.3, 49.3, 51.6];
  const V3 = [54.4, 54.9, 55.4, 55.9, 56.6, 57.1, 57.6, 58.1, 58.6, 59.1];
  const spread = (n, i, l = 200, r = 880) => r - (r - l) * (n === 1 ? .5 : i / (n - 1)); // RTL-ish spread

  // sh05 · lala I — petals over the valley
  SHOTS.push({ a: 42.6, b: 47.3, tin: 'cut', draw: (t) => {
    set(A.valley, t, 42.6, 47.5, { dim: .32, s0: 1.06, s1: 1.1, fx0: .5, fy0: .5, fx1: .46, fy1: .46, ray: null });
    NZ.tint(PAL.gold, .1);
    rays(t, { x: 480, y: 420, ang: -1.2, n: 5, int: .14, spread: .8 });
    NZ.ribbon(t, 1350, 46, PAL.gold, .5); NZ.ribbon(t, 1520, 60, PAL.rose, .4, 1.4, 2);
    V1.forEach((bt, i) => NZ.syl(i % 2 ? NZ.laCream : NZ.laGold, t, bt, spread(6, i) + Math.sin(i * 3.7) * 60, 1620 - (i % 3) * 130, 2.6, 320, 1 + (i % 3) * .15, 50 + i));
    NZ.mist(t, 1700, 50, .22, 2.2, 29);
    NZ.vignTop(.45);
  } });

  // sh06 · lala II — three great blossoms over the cloud sea
  SHOTS.push({ a: 47.3, b: 54.4, tin: 'cut', draw: (t) => {
    set(A.clouds, t, 47.3, 54.6, { dim: .3, s0: 1.04, s1: 1.1, fx0: .5, fy0: .55, fx1: .5, fy1: .48, ray: null });
    NZ.tint(PAL.gold, .12);
    rays(t, { x: 540, y: 760, ang: -1.45, n: 6, int: .18, spread: .9 });
    NZ.ribbon(t, 1300, 54, PAL.goldL, .55, 1.5, 1); NZ.ribbon(t, 1560, 44, PAL.gold, .4, 2, 2);
    V2.forEach((bt, i) => {
      NZ.syl(NZ.laGold, t, bt, spread(3, i), 1580 - i * 90, 3.4, 420, 1.5, 60 + i);
      NZ.syl(NZ.laCream, t, bt + 1.0, spread(3, (i + 1) % 3) + 90, 1720, 2.2, 260, .55, 70 + i); // echo petal
    });
    NZ.vignTop(.4);
  } });

  // sh07 · lala III — cascade + the sun revealed; the seed climbs into the sun
  SHOTS.push({ a: 54.4, b: 59.9, tin: 'cut', draw: (t) => {
    set(A.peak, t, 54.4, 60.1, { dim: .28, s0: 1.0, s1: 1.08, fx0: .5, fy0: .5, fx1: .5, fy1: .44, ray: null });
    NZ.tint(PAL.gold, .14);
    rays(t, { x: 550, y: 845, ang: -1.5, n: 8, int: lerp(.15, .3, ease(54.4, 59, t)), spread: 1.1 });
    const k = ease(54.6, 59.4, t);
    NZ.seed(lerp(540, 550, k), lerp(1520, 845, k), lerp(15, 5, k), t);
    V3.forEach((bt, i) => NZ.syl(i % 2 ? NZ.laCream : NZ.laGold, t, bt, spread(10, i) + Math.sin(i * 2.9) * 70, 1660 - (i % 4) * 110, 2.2, 340, .95 + (i % 4) * .12, 80 + i));
    NZ.ribbon(t, 1420, 50, PAL.goldL, .5, 2.2, 2);
    NZ.vignTop(.4);
  } });
})();
