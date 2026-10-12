// sh01 · title (4–14): the terraces revealed; the poet's name written in huge gold letters
(() => {
  const P = {};
  INITS.push(async () => {
    P.title = textImg([{ t: 'صباحٌ يُغنَّى', size: 62, color: PAL.cream }]);
    P.kicker = textImg([{ t: 'من كلمات الشاعر الأنيق', size: 40, font: UI, weight: 600, color: PAL.goldL }]);
    P.name = textImg([{ t: 'نزار القدسي', size: 148, color: PAL.cream }]);
    P.nameGold = goldify(P.name);
  });
  SHOTS.push({ a: 4, b: 14, draw: (t) => {
    set(A.terraces, t, 4, 14.2, { dim: .52, s0: 1.0, s1: 1.1, fx0: .5, fy0: .42, fx1: .5, fy1: .36, ray: null });
    NZ.tint('#141a33', lerp(.3, .04, ease(4, 12, t)));
    rays(t, { x: 540, y: 700, ang: -1.35, n: 6, int: lerp(.05, .2, ease(6, 13, t)), spread: .9 });
    NZ.vignTop(.55);
    const ko = ease(13.2, 14.2, t), lift = -ko * 70, aOut = 1 - ko;
    // divider draws first
    line([[330, 700], [750, 700]], easeOut(4.3, 5.3, t), { color: PAL.gold, width: 2.5, alpha: aOut });
    if (t > 5.2) { const s = sp(t, 5.2, 'snap'); nuqta(g, 540, 700 - ko * 70, 14 * Math.min(s, 1.2), PAL.gold); }
    // film title whispers in
    { const k = sp(t, 4.6, 'soft'); if (k > 0) { g.save(); g.globalAlpha = clamp(k * 2) * aOut;
      g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16;
      g.drawImage(P.title, 540 - P.title.width / 2, 600 + lift + (1 - Math.min(k, 1)) * 60 - P.title.height / 2); g.restore(); } }
    // kicker writes on RTL
    writeOn(P.kicker, 540, 800 + lift, easeOut(5.6, 6.6, t), { alpha: aOut });
    // the name: hero entrance
    { const k = sp(t, 6.4, 'soft'); if (k > 0) { const s = lerp(1.18, 1, Math.min(k, 1.1));
      geoHalo(t, 6.8, 540, 1010 + lift, 330, PAL.gold);
      g.save(); g.globalAlpha = clamp(k * 2) * aOut; g.translate(540, 1010 + lift); g.scale(s, s);
      g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
      g.drawImage(P.nameGold, -P.nameGold.width / 2, -P.nameGold.height / 2); g.restore(); } }
  } });
})();
