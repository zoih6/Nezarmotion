// ═══════════════════════════════════════════════════════════════════
//  «فوق ثغر الربا» — كلمات الشاعر الأنيق نزار القدسي
//  Vertical 9:16 · 120.024 s · colour script: night indigo → rose dawn → golden sunrise → cream (Wamd)
// ═══════════════════════════════════════════════════════════════════
const R = {};   // pre-rendered pieces

function build() {
  buildTextures();
  // stickers
  R.gazelle = sticker(A.gazelle, 600, { border: 11, seed: 4 });
  R.flowersL = sticker(A.flowers, 560, { border: 11, seed: 5 });
  R.flowersR = sticker(A.flowers, 560, { border: 11, seed: 6, flip: true });
  R.branchL = sticker(A.branch, 1000, { border: 9, seed: 7 });
  R.branchR = sticker(A.branch, 1000, { border: 9, seed: 8, flip: true });
  // intro manuscript page split by a vertical tear
  const page = mk(W, H), px = page.getContext('2d');
  px.drawImage(TEX.paper, 0, 0);
  withCtx(page, () => {
    const lines = DATA.lyrics.slice(3).map(l => l[2]);
    lines.forEach((s, i) => txt(s, W / 2, 470 + i * 92, 54, { color: PAL.ink, alpha: .33 }));
    txt('نزار القدسي', W / 2, 360, 40, { fam: UI, color: PAL.goldD, alpha: .7 });
  });
  const ep = edgePts(77, H, 26, 16).map(([a, b]) => [W / 2 + b, a]);
  const half = (left) => { const c = mk(W, H), x = c.getContext('2d'); x.beginPath(); ep.forEach(([X, Y], i) => i ? x.lineTo(X, Y) : x.moveTo(X, Y));
    if (left) { x.lineTo(-10, H + 20); x.lineTo(-10, -20); } else { x.lineTo(W + 10, H + 20); x.lineTo(W + 10, -20); } x.closePath();
    x.save(); x.clip(); x.drawImage(page, 0, 0); x.restore();
    x.strokeStyle = 'rgba(255,252,245,.9)'; x.lineWidth = 7; x.stroke(); return { c, s: shadowOf(c, 16), pad: 0 }; };
  R.pageL = half(true); R.pageR = half(false);
  // intro foreground hills (cut indigo paper with a pale rim)
  R.hills = [[0x51, '#2c2559', 80, 0], [0x52, '#1d1842', 95, 1], [0x53, '#120f2c', 70, 2]].map(([seed, col, amp, i]) => {
    const w = W + 260, h = 820, c = mk(w, h), x = c.getContext('2d'), r = rng(seed), p1 = r() * 6, p2 = r() * 6, pts = [];
    for (let X = -10; X <= w + 10; X += 9) pts.push([X, 160 + Math.sin(X / w * 3.1 * (1.2 + i * .35) + p1) * amp * .6 + Math.sin(X / w * 9 + p2) * amp * .18 + (r() - .5) * 3]);
    x.beginPath(); pts.forEach(([X, Y], k) => k ? x.lineTo(X, Y) : x.moveTo(X, Y)); x.lineTo(w + 10, h); x.lineTo(-10, h); x.closePath();
    x.save(); x.clip(); x.fillStyle = col; x.fillRect(0, 0, w, h); x.globalAlpha = .35; x.globalCompositeOperation = 'multiply'; x.drawImage(TEX.paper, 0, 0); x.restore();
    x.beginPath(); pts.forEach(([X, Y], k) => k ? x.lineTo(X, Y - 2) : x.moveTo(X, Y - 2)); x.strokeStyle = 'rgba(232,214,240,.55)'; x.lineWidth = 3; x.stroke();
    return { c, s: shadowOf(c, 18), pad: 0 };
  });
  // paper cloud puffs
  R.puffs = [1, 2, 3].map(k => { const r = rng(300 + k), w = 520 + k * 60, h = 420, c = mk(w + 120, h), x = c.getContext('2d');
    x.beginPath(); for (let i = 0; i < 7; i++) { const cx = 90 + (w - 60) * i / 6, s = Math.sin(i / 6 * Math.PI), rr = 42 + r() * 34 + s * 62, cy = 300 - s * 70 + (r() - .5) * 16; x.moveTo(cx + rr, cy); x.arc(cx, cy, rr, 0, 6.29); }
    x.rect(90, 300, w - 60, 70);
    x.save(); x.clip(); x.drawImage(TEX.paper, 0, 0); const gr = x.createLinearGradient(0, 120, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(236,140,150,.55)');
    x.fillStyle = gr; x.globalCompositeOperation = 'multiply'; x.fillRect(0, 0, w + 120, h); x.restore();
    return { c, s: shadowOf(c, 14), pad: 0 }; });
  // horizon strips for the dawn assembly (hills plate cut in 6 torn bands)
  R.strips = [0, 1, 2, 3, 4, 5].map(i => { const h = H / 6 + 46, w = W + 80, s = w / A.hills.width, ch = h / s / A.hills.height, cy = clamp((i * H / 6 - 23) / s / A.hills.height, 0, 1 - ch);
    return tornPiece(A.hills, w, h, { crop: [0, cy, 1, ch], seed: 400 + i, rough: 8, rim: 8 }); });
  R.window = tornPiece(A.hills, 780, 920, { crop: [.06, .22, .88, .66], seed: 501, rough: 9, rim: 12 });
  // mist
  R.mist = (() => { const c = mk(1600, 520), x = c.getContext('2d'), r = rng(61); x.filter = 'blur(40px)';
    for (let i = 0; i < 9; i++) { x.fillStyle = `rgba(255,236,236,${.25 + r() * .3})`; x.beginPath(); x.ellipse(120 + r() * 1360, 260 + (r() - .5) * 160, 180 + r() * 220, 60 + r() * 50, 0, 0, 6.29); x.fill(); }
    return c; })();
  // stars
  const rs = rng(90); R.stars = Array.from({ length: 95 }, () => [rs() * W, rs() * H * .58, .6 + rs() * 1.8, rs() * 6.28, .6 + rs() * 2.2]);
  // tapes for the poet card
  const tape = (bg, fg, seed) => { const unit = '   كلمات الشاعر الأنيق نزار القدسي   •', c = mk(3600, 84), x = c.getContext('2d');
    const st = strip(3560, 64, bg, seed, { rough: 3 }); x.drawImage(st.c, 20 - st.pad, 10 - st.pad);
    withCtx(c, () => { const uw = measure(unit, 34, UI, '600'); for (let X = 3600; X > -uw; X -= uw) txt(unit, X, 44, 34, { fam: UI, w: '600', color: fg, align: 'right' }); });
    return c; };
  R.tapeA = tape(PAL.cream, PAL.ink, 21); R.tapeB = tape(PAL.rose, PAL.ink, 22);
  // outro backdrop
  R.outroBg = (() => { const c = mk(W, H), x = c.getContext('2d'); x.drawImage(TEX.paper, 0, 0);
    const blob = (X, Y, r, col) => { const gr = x.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); };
    x.globalCompositeOperation = 'multiply'; blob(W + 60, -40, 700, 'rgba(236,31,134,.22)'); blob(-80, H * .55, 700, 'rgba(43,59,224,.16)'); blob(W + 40, H + 40, 760, 'rgba(31,138,91,.18)'); blob(-60, -60, 520, 'rgba(123,53,217,.14)');
    return c; })();
  buildLyrics();
}

// ── lyric system ────────────────────────────────────────────────────
const LY = [
  { a: 59.9, b: 62.0, rows: [['فوق', 'ثغر'], ['الربا']], st: 'label', y: 470 },
  { a: 62.0, b: 66.4, rows: [['بين', 'صفو'], ['التلال']], st: 'free', y: 1200 },
  { a: 66.4, b: 72.7, rows: [['تحت', 'ظل'], ['السحاب']], st: 'free', y: 450 },
  { a: 72.7, b: 75.0, rows: [['حيث', 'مرعى'], ['الغزال']], st: 'label', y: 470 },
  { a: 75.0, b: 79.3, rows: [['في', 'عيون'], ['الضحى']], st: 'label', y: 1300 },
  { a: 79.3, b: 84.1, rows: [['أو', 'صدور'], ['الجبال']], st: 'free', y: 1200 },
  { a: 84.1, b: 90.0, rows: [['أو', 'عناق'], ['الزهور']], st: 'ink', y: 380 },
  { a: 90.0, b: 92.2, rows: [['فوق', 'خصر'], ['الدلال']], st: 'label', y: 470 },
  { a: 92.2, b: 98.5, rows: [['حيث', 'غنى'], ['الصباح']], st: 'label', y: 450 },
  { a: 98.5, b: 103.5, rows: [['في', 'خدود'], ['الجمال']], st: 'ink', y: 450 },
  { a: 103.5, b: 108.0, rows: [['والشروق'], ['يبتسم']], st: 'ink', y: 400, size: 190 },
  { a: 108.0, b: 111.85, rows: [['للغصون'], ['الطوال']], st: 'ink', y: 640, size: 190 },
];
function buildLyrics() {
  LY.forEach((L, li) => {
    const size = L.size || 176, ks = size * 1.2, n = L.rows.flat().length, dur = L.b - L.a;
    const gap = clamp((dur - .4) / (n + .6), .3, 1.0);
    L.items = []; let wi = 0;
    const flip = li % 2 ? 1 : -1;
    L.rows.forEach((row, ri) => {
      const key = ri === L.rows.length - 1, sz = key ? ks : size, gw = sz * .28;
      const ws = row.map(w => measure(w, sz)), tot = ws.reduce((a, b) => a + b, 0) + gw * (row.length - 1);
      const y = L.y + (ri ? size * .62 + ks * .62 : 0), cx = W / 2 + (key ? flip * 40 : -flip * 30);
      let xr = cx + tot / 2;
      const rowItem = { row: true, ri, y, xr, tot, sz, key, t: L.a + wi * gap - .06, seed: li * 10 + ri };
      if (key) rowItem.strip = strip(tot + sz * .5, sz * 1.0, PAL.gold, 600 + li, { rough: 6 });
      else if (L.st === 'label') rowItem.strip = strip(tot + sz * .45, sz * .92, PAL.cream, 700 + li, { rough: 5 });
      rowItem.rot = (hash(li, ri) - .5) * .05;
      L.items.push(rowItem);
      row.forEach((w, k) => { L.items.push({ w, x: xr, y, sz, key, t: L.a + wi * gap, rot: rowItem.rot, cx: rowItem.xr - tot / 2 }); xr -= ws[k] + gw; wi++; });
    });
  });
}
function drawLyric(L, t) {
  if (t < L.a - .1 || t > L.b + .05) return;
  const te = L.b - .24, out = easeIn(te, L.b, t);
  for (const it of L.items) {
    if (t < it.t) continue;
    if (it.row) {
      if (!it.strip) continue;
      const k = sp(t, it.t, 'snap'), sw = it.strip.w, cx = it.xr - it.tot / 2, ax = cx + sw / 2;
      const sx = Math.max(.001, clamp(k, 0, 1.15) * (1 - out)) * (1 + (it.key ? .02 * beatPulse(t) : 0));
      g.save(); g.translate(ax, it.y + it.sz * .08 - out * 50); g.rotate(it.rot); g.scale(sx, 1);
      drawPiece(it.strip, -sw / 2, 0); g.restore();
      continue;
    }
    const L2 = it, p = sp(t, it.t, it.key ? 'snap' : 'card'), rev = easeOut(it.t, it.t + .32, t);
    const ink = it.key || L.st !== 'free';
    const color = ink ? PAL.ink : PAL.cream;
    g.save(); g.translate(0, -out * 50); g.translate(it.cx, it.y); g.rotate(it.rot); g.translate(-it.cx, -it.y);
    // mask wipe from the baseline upward
    const top = it.y - it.sz * .8, bot = it.y + it.sz * .62;
    g.beginPath(); g.rect(0, lerp(bot, top - 20, rev), W, (bot - top) + 60); g.clip();
    const sc = it.key ? 1.25 - .25 * p : 1, dy = (1 - p) * 46;
    g.translate(it.x, it.y + dy); g.scale(sc, sc);
    txt(L2.w, 0, 0, it.sz, { color, align: 'right', alpha: 1 - out, shadow: L.st === 'free' && !it.key ? 1 : 0 });
    g.restore();
  }
}

// ── small procedural motifs ─────────────────────────────────────────
function stars(t, alpha = 1, dy = 0) {
  g.save();
  for (const [x, y, s, ph, f] of R.stars) {
    const tw = .35 + .65 * Math.pow(Math.sin(t * f + ph) * .5 + .5, 2), a = alpha * tw;
    if (a < .02) continue;
    g.globalAlpha = a; g.fillStyle = '#fff6e6';
    if (s > 2.1) { const L = s * 4.5; g.beginPath(); g.moveTo(x, y + dy - L); g.quadraticCurveTo(x, y + dy, x + L, y + dy); g.quadraticCurveTo(x, y + dy, x, y + dy + L); g.quadraticCurveTo(x, y + dy, x - L, y + dy); g.quadraticCurveTo(x, y + dy, x, y + dy - L); g.fill(); }
    else { g.beginPath(); g.arc(x, y + dy, s, 0, 6.29); g.fill(); }
  }
  g.restore();
}
function birds(t, t0, t1, seed, n, y0, dir = -1, size = 18, col = 'rgba(36,22,58,.85)') {
  if (t < t0 || t > t1) return; const r = rng(seed), k = (t - t0) / (t1 - t0);
  g.save(); g.strokeStyle = col; g.lineWidth = 3.2; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ox = r() * 320, oy = (r() - .5) * 180, ph = r() * 6, s = size * (.7 + r() * .6);
    const x = dir < 0 ? lerp(W + 120 + ox, -200 - 320 + ox, k) : lerp(-120 - ox, W + 520 - ox, k);
    const y = y0 + oy + Math.sin(t * 1.3 + ph) * 14, f = Math.sin(t * 11 + ph);
    g.beginPath(); g.moveTo(x - s, y - f * s * .5); g.quadraticCurveTo(x - s * .45, y - s * .25 - f * s * .2, x, y); g.quadraticCurveTo(x + s * .45, y - s * .25 - f * s * .2, x + s, y - f * s * .5); g.stroke();
  }
  g.restore();
}
function mist(t, y, speed, alpha, sc = 1) {
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = alpha;
  const x = ((t * speed) % 1600 + 1600) % 1600;
  g.drawImage(R.mist, x - 1600, y - 260 * sc, 1600, 520 * sc); g.drawImage(R.mist, x, y - 260 * sc, 1600, 520 * sc); g.restore();
}
function sparkle(x, y, L, a, col = '#fff8ea') {
  if (a <= .01) return; g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath();
  g.moveTo(x, y - L); g.quadraticCurveTo(x, y, x + L * .7, y); g.quadraticCurveTo(x, y, x, y + L); g.quadraticCurveTo(x, y, x - L * .7, y); g.quadraticCurveTo(x, y, x, y - L); g.fill(); g.restore();
}
function strokeProgress(pts, k, width, col) {
  if (k <= 0) return; let total = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let rem = total * k; g.save(); g.strokeStyle = col; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const d = seg[i - 1]; if (rem >= d) g.lineTo(...pts[i]); else { const u = rem / d; g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); } rem -= d; }
  g.stroke(); g.restore();
}
const kz = t => 1 + .007 * beatPulse(t, 9);

// ── scenes ──────────────────────────────────────────────────────────
const S = {};

S.night = t => {
  const z = 1.14 - .1 * ease(0, 25, t), P = plate(A.night, { z, fx: .5, fy: .42, dy: lerp(-30, 30, ease(0, 25, t)) });
  stars(t, .9 * smooth(.6, 2.5, t));
  // pre-dawn glow creeping in
  radial(W / 2, H * .78, 1100, 'rgba(160,90,170,1)', 'screen', .35 * ease(14, 25, t));
  // moon ring + constellation
  const mx = P.x + 557 * P.s, my = P.y + 346 * P.s;
  const ringK = easeOut(14.6, 15.8, t) * (1 - easeIn(23.9, 24.6, t));
  if (ringK > 0) { g.save(); g.strokeStyle = PAL.gold; g.globalAlpha = .85; g.lineWidth = 2.5; g.beginPath(); g.arc(mx, my, 70, -Math.PI / 2, -Math.PI / 2 + 6.283 * ringK); g.stroke();
    g.globalAlpha = .5; g.beginPath(); g.arc(mx, my, 92, Math.PI / 2, Math.PI / 2 + 6.283 * ringK * .8); g.stroke(); g.restore(); }
  const cst = [[mx, my], [mx + 210, my - 60], [mx + 330, my + 70], [mx + 250, my + 200], [mx - 230, my + 120], [mx - 360, my - 40], [mx - 300, my + 250]];
  const ck = easeOut(19.8, 22.2, t) * (1 - easeIn(23.9, 24.6, t));
  if (ck > 0) { strokeProgress([cst[0], cst[1], cst[2], cst[3]], ck, 2, 'rgba(244,184,96,.75)'); strokeProgress([cst[0], cst[4], cst[5], cst[6], cst[4]], ck, 2, 'rgba(244,184,96,.75)');
    cst.slice(1).forEach(([x, y], i) => sparkle(x, y, 14 * sp(t, 19.8 + i * .3, 'snap'), .95)); }
  // cut-paper hills rise on the three opening hits
  [[2.55, 0, 1500, .25], [3.13, 1, 1620, .45], [3.58, 2, 1730, .7]].forEach(([t0, i, y, depth]) => {
    const k = sp(t, t0, 'card'), h = R.hills[i];
    const x = -130 + Math.sin(t * .12 + i) * 30 * depth - ease(16.8, 25, t) * 60 * depth;
    g.save(); g.globalAlpha = .5; g.drawImage(h.s.c, x - h.s.p, y + (1 - k) * 760 - h.s.p - 14); g.restore();
    g.drawImage(h.c, x, y + (1 - k) * 760);
  });
  poetCard(t);
  // the torn manuscript (hook)
  if (t < 2.4) {
    const k = ease(.32, 1.75, t), lift = smooth(.2, .5, t);
    g.save(); const s0 = 1 + .025 * smooth(0, .4, t);
    drawPiece(R.pageR, W / 2 + 820 * k, H / 2 + 120 * k, { rot: .2 * k, sc: s0, lift });
    drawPiece(R.pageL, W / 2 - 820 * k, H / 2 + 60 * k, { rot: -.16 * k, sc: s0, lift });
    g.restore();
  }
};

function poetCard(t) {
  if (t > 25.1) return;
  const exit = (d = 0) => easeIn(23.8 + d, 24.5 + d, t);
  const gy = -330 * sp(t, 16.8, 'soft'), gs = 1 - .2 * sp(t, 16.8, 'soft');
  // diagonal tapes behind the name
  [[R.tapeA, -.09, 1, 12.5, 1560], [R.tapeB, .07, -1, 12.75, 1650]].forEach(([tp, rot, dir, t0, y]) => {
    const k = sp(t, t0, 'card'), off = (1 - k) * 2400 * dir + exit() * 2400 * -dir, scroll = (t * 70 * dir) % 600;
    if (k <= 0) return;
    g.save(); g.translate(W / 2, y); g.rotate(rot); g.globalAlpha = .96; g.drawImage(tp, -1800 + off + scroll - 300, -42); g.restore();
  });
  g.save(); g.translate(W / 2, 900 + gy); g.scale(gs, gs); g.translate(-W / 2, -900);
  // line 1: هذه الأغنية من كلمات
  const l1 = ['هذه', 'الأغنية', 'من', 'كلمات'], t1 = [3.6, 3.95, 4.35, 4.6];
  let xr = W / 2 + measure(l1.join(' '), 44, UI, '500') / 2;
  l1.forEach((w, i) => { const ww = measure(w, 44, UI, '500'), k = sp(t, t1[i], 'card'), e = exit(i * .04);
    if (t > t1[i]) txt(w, xr, 640 + (1 - k) * 30 - e * 60, 44, { fam: UI, w: '500', color: PAL.cream, align: 'right', alpha: clamp(k * 1.4) * (1 - e), shadow: .8 });
    xr -= ww + measure(' ', 44, UI, '500'); });
  // line 2: الشاعر الأنيق (الأنيق on a rose strip)
  const sz2 = 104, w1 = measure('الشاعر', sz2), w2 = measure('الأنيق', sz2), gap = 64, tot = w1 + w2 + gap, x0 = W / 2 + tot / 2;
  if (!R.aneeq) R.aneeq = strip(w2 + 54, 118, PAL.rose, 811, { rough: 5 });
  const k1 = sp(t, 5.3, 'card'), k2 = sp(t, 5.85, 'snap'), e2 = exit(.1);
  if (t > 5.3) txt('الشاعر', x0, 770 + (1 - k1) * 40 - e2 * 60, sz2, { color: PAL.cream, align: 'right', alpha: clamp(k1 * 1.5) * (1 - e2), shadow: 1 });
  if (t > 5.75) { const sx = clamp(sp(t, 5.75, 'snap'), 0, 1.1) * (1 - e2), cx = x0 - w1 - gap - w2 / 2;
    g.save(); g.translate(cx + w2 / 2 + 27, 778 - e2 * 60); g.rotate(-.03); g.scale(Math.max(.001, sx), 1); drawPiece(R.aneeq, -w2 / 2 - 27, 0); g.restore();
    txt('الأنيق', x0 - w1 - gap, 770 - e2 * 60, sz2 * (1.2 - .2 * k2), { color: PAL.ink, align: 'right', alpha: clamp((t - 5.85) * 10) * (1 - e2) }); }
  // the name — lands on the first downbeat
  const nameSize = 214, nw = measure('نزار القدسي', nameSize), fit = Math.min(1, 940 / nw), kN = sp(t, 8.24, 'snap'), eN = exit(.18);
  if (t > 8.2) {
    const sc = (1.55 - .55 * kN) * fit, sh = shake(t, 8.3, 10);
    g.save(); g.translate(W / 2 + sh, 975 - eN * 80); g.scale(sc, sc);
    txt('نزار القدسي', 0, 0, nameSize, { color: PAL.gold, alpha: clamp((t - 8.2) * 12) * (1 - eN), shadow: 1.4 });
    g.restore();
    // calligraphic swash under the name
    const sw = []; for (let i = 0; i <= 60; i++) { const u = i / 60; sw.push([W / 2 + 380 - u * 760, 1100 + Math.sin(u * Math.PI * 2.2 + .4) * 18 - u * 6]); }
    g.save(); g.globalAlpha = 1 - eN; strokeProgress(sw, easeOut(10.3, 11.4, t), 5, PAL.gold); g.restore();
    sparkle(W / 2 - 382, 1094, 18 * sp(t, 11.3, 'snap'), 1 - eN, PAL.gold);
  }
  g.restore();
  // song title (after the name rises)
  if (t > 17.2) {
    const e = exit(.25), kL = sp(t, 17.3, 'card');
    txt('أغنية', W / 2, 1180 + (1 - kL) * 30 - e * 60, 40, { fam: UI, w: '500', color: PAL.blush, alpha: clamp(kL * 1.4) * (1 - e), shadow: .8 });
    const sz = 138, words = ['فوق', 'ثغر', 'الربا'], ts = [17.6, 17.95, 18.35], ws = words.map(w => measure(w, sz)), gp = 34, tt = ws.reduce((a, b) => a + b) + gp * 2;
    let x = W / 2 + tt / 2;
    if (!R.titleStrip) R.titleStrip = strip(ws[2] + 60, 150, PAL.gold, 812, { rough: 6 });
    words.forEach((w, i) => { const k = sp(t, ts[i], i === 2 ? 'snap' : 'card');
      if (t > ts[i]) {
        if (i === 2) { const sx = clamp(sp(t, ts[i] - .08, 'snap'), 0, 1.1) * (1 - e); g.save(); g.translate(x + 30, 1312 - e * 60); g.rotate(.025); g.scale(Math.max(.001, sx), 1); drawPiece(R.titleStrip, -ws[2] / 2 - 30, 0); g.restore(); }
        txt(w, x, 1300 + (1 - k) * 36 - e * 60, sz * (i === 2 ? 1.2 - .2 * k : 1), { color: i === 2 ? PAL.ink : PAL.cream, align: 'right', alpha: clamp(k * 1.6) * (1 - e), shadow: i === 2 ? 0 : 1 });
      }
      x -= ws[i] + gp; });
  }
}

S.clouds1 = t => {
  const k = ease(24.6, 34.5, t);
  plate(A.clouds, { z: 1.32 * kz(t), fx: .5, fy: lerp(.22, .74, k) });
  grade('rgba(40,30,95,1)', 'rgba(90,50,120,1)', 'multiply', .62 * (1 - smooth(25, 33, t)));
  [[26.2, 0, 640, 1.1, -1], [28.6, 1, 1180, .9, 1], [31.0, 2, 420, 1.25, -1]].forEach(([t0, i, y, sc, dir]) => {
    const u = (t - t0) / 6.5; if (u < -.1 || u > 1.1) return;
    const p = R.puffs[i], x = dir < 0 ? lerp(W + 420, -420, u) : lerp(-420, W + 420, u);
    drawPiece(p, x, y + Math.sin(t * .8 + i) * 12, { sc, alpha: 1, lift: .4 });
  });
  birds(t, 30.6, 35.5, 31, 7, 760, 1, 16, 'rgba(36,22,58,.8)');
};

S.dawn = t => {
  S.clouds1(t);
  const b0 = lastBeat(33.6) + 1, push = 1 + .05 * ease(36.5, 42.6, t);
  g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
  [5, 4, 3, 2, 1, 0].forEach((i, n) => {
    const t0 = BEATS[b0 + n], k = sp(t, t0, 'card'); if (t < t0) return;
    const dir = n % 2 ? 1 : -1, br = (t > 38.5 ? dir * 7 * beatPulse(t, 6) : 0);
    const x = W / 2 + (1 - k) * 1300 * dir + br, y = i * H / 6 + H / 12;
    drawPiece(R.strips[i], x, y, { rot: (hash(i, 9) - .5) * .02 + (1 - k) * .05 * dir, lift: .2 });
  });
  g.restore();
  // sunrise glow and a gold horizon thread
  radial(W * .5, H * .36, 900, 'rgba(255,190,120,1)', 'screen', .45 * ease(37.5, 42.6, t));
  const hk = easeOut(38.4, 40.0, t); if (hk > 0) { g.save(); g.strokeStyle = PAL.gold; g.lineWidth = 3; g.globalAlpha = .9; g.beginPath(); g.moveTo(W, H * .36); g.lineTo(W - W * hk, H * .36 + 6); g.stroke(); g.restore(); }
  birds(t, 39.8, 44, 41, 5, 520, -1, 18);
};

// ── the «لا» section: kinetic type on the beat ──────────────────────
const LA_A = [[42.82, 700, 560, 520, -.06, 'c'], [43.35, 370, 860, 440, .06, 'g'], [43.96, 620, 1180, 580, -.03, 'p'],
              [45.02, 360, 560, 480, .07, 'g'], [45.51, 720, 860, 520, -.05, 'c'], [46.10, 520, 1190, 640, .02, 'p']];
const LA_B = [47.30, 50.40, 52.50];
function laWord(x, y, size, rot, style, sc, alpha, slice = 0) {
  if (alpha <= .01 || sc <= .01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = alpha;
  if (style === 'p') { if (!R['laP' + size]) R['laP' + size] = strip(size * .95, size * .9, PAL.cream, 900 + size, { rough: 7 }); drawPiece(R['laP' + size], 0, size * .06); }
  const col = style === 'g' ? PAL.gold : style === 'p' ? PAL.ink : PAL.cream;
  if (slice > .01) { // sliced landing: 3 bands offset sideways, collapsing to aligned
    for (let b = 0; b < 3; b++) { g.save(); g.beginPath(); g.rect(-size, -size * .7 + b * size * .45, size * 2, size * .45); g.clip();
      txt('لا', (b - 1) * slice * 60 * (b % 2 ? -1 : 1), 0, size, { color: col, shadow: style === 'p' ? 0 : 1 }); g.restore(); }
  } else txt('لا', 0, 0, size, { color: col, shadow: style === 'p' ? 0 : 1 });
  g.restore();
}
S.lala = t => {
  const dawnK = ease(42.6, 59.9, t);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, `rgb(${lerp(38, 92, dawnK)},${lerp(30, 58, dawnK)},${lerp(84, 126, dawnK)})`);
  gr.addColorStop(.55, `rgb(${lerp(150, 214, dawnK)},${lerp(80, 120, dawnK)},${lerp(130, 140, dawnK)})`);
  gr.addColorStop(1, `rgb(${lerp(226, 246, dawnK)},${lerp(140, 176, dawnK)},${lerp(120, 110, dawnK)})`);
  plate(A.clouds, { z: 1.25 * kz(t), fx: .5, fy: lerp(.3, .6, dawnK) });
  g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = .55; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .25; g.drawImage(TEX.paper, 0, 0); g.restore();
  // the sun foreshadowed behind the hills (rises through the section)
  const sunY = lerp(1750, 1300, ease(47.3, 59.0, t)), sr = 230 + 20 * beatPulse(t, 5);
  g.save(); g.fillStyle = PAL.gold; g.globalAlpha = .95; g.beginPath(); g.arc(W / 2, sunY, sr, 0, 6.29); g.fill(); g.restore();
  drawPiece(R.strips[4], W / 2 + 6 * beatPulse(t, 6), 1560, { rot: -.012 }); drawPiece(R.strips[5], W / 2 - 6 * beatPulse(t, 6), 1800, { rot: .01 });
  // A: two triplets
  LA_A.forEach(([t0, x, y, size, rot, st], i) => {
    if (t < t0) return; const grp = i < 3 ? 0 : 1, tOut = grp ? 47.15 : 44.85;
    const k = sp(t, t0, 'snap'), o = easeIn(tOut, tOut + .3, t), sl = Math.exp(-(t - t0) * 9);
    laWord(x, y - o * 120, size, rot + o * .3 * (i % 2 ? 1 : -1), st, (1.45 - .45 * k) * (1 - o), clamp((t - t0) * 14) * (1 - o), sl);
  });
  // B: three sustained «لا» stretching like a held note, with echo outlines on beats
  LA_B.forEach((t0, i) => {
    const t1 = LA_B[i + 1] || 54.3; if (t < t0 - .05 || t > t1 + .4) return;
    const k = sp(t, t0, 'snap'), stretch = 1 + .32 * ease(t0, t1, t), o = easeIn(t1 - .05, t1 + .3, t);
    const st = ['c', 'g', 'p'][i], size = 720;
    // echoes
    const b = lastBeat(t); for (let j = 0; j < 3; j++) { const bt = BEATS[b - j]; if (bt === undefined || bt < t0) continue; const u = (t - bt) / 1.4; if (u > 1) continue;
      g.save(); g.translate(W / 2, 900); g.scale(stretch * (1 + u * .5), 1 + u * .5); g.globalAlpha = (1 - u) * .5 * (1 - o);
      g.font = font(size); g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeStyle = st === 'g' ? PAL.gold : PAL.cream; g.lineWidth = 3; g.strokeText('لا', 0, 0); g.restore(); }
    g.save(); g.translate(W / 2, 900 - o * 200); g.scale(stretch, 1); laWord(0, 0, size, 0, st, (1.4 - .4 * k) * (1 - o * .6), clamp((t - t0) * 12) * (1 - o)); g.restore();
  });
  // C: sixteen rapid «لا» stamped into a 4×4 grid, then gathered into the sun
  if (t > 54.3) {
    const gather = easeIn(59.35, 59.9, t);
    for (let i = 0; i < 16; i++) {
      const t0 = 54.4 + i * (5.45 / 16); if (t < t0) continue;
      const col = i % 4, row = i >> 2, x = [835, 635, 440, 245][col], y = 520 + row * 250;
      const k = sp(t, t0, 'snap'), st = row < 2 ? 'c' : 'g';
      laWord(lerp(x, W / 2, gather), lerp(y, 960, gather), 230, (hash(i, 5) - .5) * .12 * (1 - gather), st, (1.5 - .5 * k) * (1 - gather * .95), clamp((t - t0) * 14));
    }
    const dot = 70 * easeOut(59.45, 59.9, t); if (dot > 0) { g.save(); g.fillStyle = PAL.gold; g.beginPath(); g.arc(W / 2, 960, dot, 0, 6.29); g.fill(); g.restore(); }
  }
};

// ── verses ──────────────────────────────────────────────────────────
S.hills = t => {
  const z = (1.2 - .06 * ease(59.9, 66.4, t)) * kz(t), dy0 = lerp(-320, 0, ease(59.9, 62.4, t));
  if (t < 62.0) { plate(A.hills, { z, fx: .5, fy: .52, dy: dy0 }); }
  else {
    // the plate cracks into three parallax bands
    const k = ease(62.0, 66.4, t), crack = sp(t, 62.0, 'snap');
    const bands = [[-100, 690, -70], [690, 1160, 40], [1160, H + 100, 95]];
    const e1 = EDGES.h1 || (EDGES.h1 = edgePts(611, W, 16)), e2 = EDGES.h2 || (EDGES.h2 = edgePts(612, W, 16));
    bands.forEach(([y0, y1, dx], i) => {
      g.save(); g.beginPath();
      const top = i === 0 ? null : (i === 1 ? e1 : e2), bot = i === 0 ? e1 : (i === 1 ? e2 : null);
      if (top) top.forEach(([x, y], j) => j ? g.lineTo(x, y0 + y) : g.moveTo(x, y0 + y)); else { g.moveTo(-50, -50); g.lineTo(W + 50, -50); }
      if (bot) bot.slice().reverse().forEach(([x, y]) => g.lineTo(x, y1 + y)); else { g.lineTo(W + 50, H + 50); g.lineTo(-50, H + 50); }
      g.closePath(); g.clip();
      plate(A.hills, { z, fx: .5, fy: .52, dx: dx * k + (i - 1) * 8 * crack * Math.exp(-(t - 62) * 3), dy: dy0 + (i === 0 ? -14 : i === 2 ? 10 : 0) * crack });
      g.restore();
    });
    [[e1, 690], [e2, 1160]].forEach(([e, y]) => { g.save(); g.globalAlpha = clamp(crack); g.strokeStyle = 'rgba(255,248,236,.95)'; g.lineWidth = 11; g.beginPath(); e.forEach(([x, yy], j) => j ? g.lineTo(x, y + yy) : g.moveTo(x, y + yy)); g.stroke();
      g.strokeStyle = 'rgba(30,12,40,.22)'; g.lineWidth = 10; g.translate(0, 8); g.stroke(); g.restore(); });
    mist(t, 1020, 60, .55 * smooth(62, 63.5, t)); mist(t + 7, 1300, -40, .4 * smooth(62.5, 64, t), .8);
  }
  grade('rgba(255,210,220,1)', 'rgba(255,255,255,1)', 'soft-light', .4);
};
S.clouds2 = t => {
  plate(A.clouds, { z: (1.04 + .12 * ease(66.4, 72.9, t)) * kz(t), fx: .55, fy: .4 });
  // a cloud shadow sweeps across
  const u = ease(67.2, 72.4, t), sx = lerp(W + 500, -500, u);
  g.save(); g.globalCompositeOperation = 'multiply'; const gr = g.createRadialGradient(sx, 1250, 0, sx, 1250, 700); gr.addColorStop(0, 'rgba(70,40,110,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  [[66.2, 0, 1480, .9, 1], [68.6, 2, 820, .7, -1]].forEach(([t0, i, y, sc, dir]) => { const v = (t - t0) / 7; if (v < 0 || v > 1.1) return;
    drawPiece(R.puffs[i], dir < 0 ? lerp(W + 400, -400, v) : lerp(-400, W + 400, v), y, { sc, lift: .5 }); });
};
S.meadow = t => {
  plate(A.hills, { z: 1.62 * kz(t), fx: lerp(.45, .55, ease(72.7, 75.2, t)), fy: .8 });
  grade('rgba(255,220,200,1)', 'rgba(255,255,255,1)', 'soft-light', .35);
  const u = (t - 72.95) / 1.85;
  if (u > -.05 && u < 1.15) {
    const pos = v => [lerp(W + 380, -380, v), 1330 - 300 * Math.sin(Math.PI * clamp(v, 0, 1))];
    for (let e = 2; e >= 0; e--) { const v = u - e * .07, [x, y] = pos(v), slope = -Math.cos(Math.PI * clamp(v, 0, 1)) * .22;
      drawPiece(R.gazelle, x, y, { rot: slope, alpha: e ? .28 / e : 1, lift: .6 }); }
  }
};
S.eye = t => {
  const z = t < 78.3 ? lerp(1.05, 1.3, ease(75.0, 78.3, t)) : lerp(1.3, 3.0, easeIn(78.3, 79.6, t));
  plate(A.eye, { z: z * kz(t), fx: 548 / 1080, fy: 928 / 1935 });
  const gl = easeOut(76.0, 76.6, t) * (1 - smooth(77.8, 78.3, t)); sparkle(W / 2 + 40 * 1.2, 940, 26 * gl, gl);
};
S.mountains = t => {
  plate(A.mountains, { z: lerp(1.38, 1.06, easeOut(79.3, 84.3, t)) * kz(t), fx: .5, fy: .42 });
  mist(t, 960, 45, .5 * smooth(80.2, 81.6, t), 1.2); mist(t + 4, 1180, -30, .35 * smooth(81, 82.5, t));
  grade('rgba(255,200,170,1)', 'rgba(120,80,150,1)', 'soft-light', .35);
};
S.flowers = t => {
  g.drawImage(TEX.paper, 0, 0); radial(W / 2, H * .6, 900, 'rgba(240,150,160,.55)', 'multiply', .9);
  const kw = sp(t, 84.25, 'card');
  drawPiece(R.window, W / 2, 1140 + (1 - kw) * 1200, { rot: -.035 + (1 - kw) * .1, lift: .3 });
  const hug = ease(85.5, 89.8, t);
  const kL = sp(t, 84.6, 'card'), kR = sp(t, 84.95, 'card');
  drawPiece(R.flowersR, lerp(W + 520, 700 - hug * 70, kR), 1440 + Math.sin(t * 1.1 + 1) * 8, { sc: 1.3, rot: lerp(-.6, -.22 + hug * .1, kR), lift: .5 });
  drawPiece(R.flowersL, lerp(-520, 380 + hug * 70, kL), 1480 + Math.sin(t * 1.2) * 8, { sc: 1.3, rot: lerp(.6, .22 - hug * .1, kL), lift: .5 });
  // drifting petals
  const r = rng(808); for (let i = 0; i < 9; i++) { const t0 = 85 + r() * 4, v = (t - t0) / 4; const x0 = r() * W, ph = r() * 6; if (v < 0 || v > 1) continue;
    const x = x0 + Math.sin(v * 6 + ph) * 60, y = lerp(700, 1500, v); g.save(); g.translate(x, y); g.rotate(v * 5 + ph); g.fillStyle = i % 2 ? '#f6c8cc' : '#fbe7e4'; g.globalAlpha = .9;
    g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, 6.29); g.fill(); g.restore(); }
};
function ribbon(t, k) {
  const n = 150, pts = [];
  for (let i = 0; i <= n; i++) { const s = i / n; pts.push([lerp(-140, W + 140, s), 1180 + Math.sin(s * Math.PI * 2.1 + t * 1.3) * 230 - Math.sin(s * Math.PI) * 140, s * 9 + t * 2.2]); }
  const m = Math.floor(n * clamp(k)); if (m < 2) return;
  for (let i = n - m; i < n; i++) {   // drawn from the right (RTL)
    const [x0, y0, a0] = pts[i], [x1, y1, a1] = pts[i + 1];
    const w0 = 58 * Math.cos(a0), w1 = 58 * Math.cos(a1), nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny), ux = nx / L, uy = ny / L;
    const front = Math.cos(a0) > 0, shade = Math.abs(Math.cos(a0));
    g.fillStyle = front ? `rgb(${lerp(190, 240, shade)},${lerp(30, 70, shade)},${lerp(110, 150, shade)})` : `rgb(${lerp(140, 175, shade)},20,${lerp(80, 100, shade)})`;
    g.beginPath(); g.moveTo(x0 + ux * w0, y0 + uy * w0); g.lineTo(x1 + ux * w1, y1 + uy * w1); g.lineTo(x1 - ux * w1, y1 - uy * w1); g.lineTo(x0 - ux * w0, y0 - uy * w0); g.closePath(); g.fill();
  }
}
S.ribbon = t => {
  plate(A.hills, { z: 1.28 * kz(t), fx: .5, fy: .42, dx: lerp(30, -30, ease(90, 92.4, t)) });
  grade('rgba(255,190,190,1)', 'rgba(255,230,200,1)', 'soft-light', .5);
  g.save(); g.globalAlpha = .35; g.translate(10, 26); g.filter = 'none'; g.globalCompositeOperation = 'multiply'; ribbon(t, easeOut(90.0, 91.3, t)); g.restore();
  ribbon(t, easeOut(90.0, 91.3, t));
};
const SUN = { x: 504 / 1080, y: 947 / 1935 };
function sunPlate(t, z, fy) { return plate(A.sunrise, { z, fx: .48, fy }); }
S.morning = t => {
  const P = sunPlate(t, 2.25 * kz(t), lerp(.2, .24, ease(92.2, 98.7, t)));
  // the song itself drawn as a singing horizon
  const k = easeOut(92.4, 93.6, t), y0 = 1260, n = 120;
  if (k > 0) {
    g.save(); g.beginPath();
    const pts = []; for (let i = 0; i <= n; i++) { const s = i / n, x = W - s * W * k, a = rmsAt(t - s * 2.2) * 260 * (.35 + .65 * Math.sin(s * Math.PI)); pts.push([x, a]); }
    pts.forEach(([x, a], i) => i ? g.lineTo(x, y0 - a) : g.moveTo(x, y0 - a)); pts.slice().reverse().forEach(([x, a]) => g.lineTo(x, y0 + a * .6)); g.closePath();
    g.fillStyle = 'rgba(255,246,230,.38)'; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 4; g.stroke(); g.restore();
  }
  birds(t, 93.6, 98.6, 93, 9, 900, -1, 20, 'rgba(60,30,50,.8)');
};
S.petals = t => {
  plate(A.petals, { z: (1.02 + .14 * ease(98.5, 103.7, t)) * kz(t), fx: .55, fy: .55 });
  [[640, 1120, 99.3], [470, 1420, 100.4], [760, 1500, 101.6], [560, 980, 102.5]].forEach(([x, y, t0]) => { const a = Math.exp(-Math.abs(t - t0) * 2.2); sparkle(x, y, 20 * a, a); });
};
S.sunrise = t => {
  const k = ease(103.5, 107.2, t), z = lerp(2.25, 1.08, k) * kz(t), fy = lerp(.22, .43, k);
  const P = sunPlate(t, z, fy), sx = P.x + 504 * P.s, sy = P.y + 947 * P.s;
  // rays
  const rk = smooth(104.6, 106.0, t);
  if (rk > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.translate(sx, sy);
    for (let i = 0; i < 11; i++) { g.save(); g.rotate(-Math.PI / 2 + (i - 5) * .27 + Math.sin(t * .4 + i) * .03); const gr = g.createLinearGradient(0, 0, 0, -1400); gr.addColorStop(0, `rgba(255,214,140,${.3 * rk})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-70, -1400); g.lineTo(70, -1400); g.lineTo(8, 0); g.fill(); g.restore(); }
    g.restore(); }
  // the smile under the sun
  const sm = easeOut(105.6, 106.6, t); if (sm > 0) { g.save(); g.strokeStyle = PAL.gold; g.lineWidth = 7; g.lineCap = 'round'; g.globalAlpha = .95; g.beginPath(); g.arc(sx, sy + 20, 190, Math.PI * .2 + Math.PI * .6 * (1 - sm), Math.PI * .8); g.stroke(); g.restore(); }
  // long branches grow
  [[R.branchL, 108.0, -30, 300, .2, 1], [R.branchR, 108.35, W + 30, 1560, -.14, -1]].forEach(([b, t0, bx, by, rot, side]) => {
    if (t < t0) return; const gk = easeOut(t0, t0 + 1.7, t), sway = Math.sin(t * 1.2 + side) * .018;
    g.save(); g.translate(bx, by); g.rotate(rot + sway);
    const w = b.c.width, h = b.c.height; g.beginPath(); side > 0 ? g.rect(0, -h, w * gk, h * 2) : g.rect(-w * gk, -h, w * gk, h * 2); g.clip();
    drawPiece(b, side > 0 ? w / 2 - b.pad : -w / 2 + b.pad, 0, { lift: .4 }); g.restore();
  });
  if (t > 108.5) { const r = rng(1088); for (let i = 0; i < 16; i++) { const t0 = 108.5 + r() * 3.2, v = (t - t0) / 3.5, x0 = 80 + r() * 900, ph = r() * 6; if (v < 0 || v > 1) continue;
    g.save(); g.translate(x0 + Math.sin(v * 5 + ph) * 70, lerp(330, 1700, v)); g.rotate(v * 6 + ph); g.fillStyle = i % 3 ? '#fde9ea' : '#f5c6cf'; g.globalAlpha = .95; g.beginPath(); g.ellipse(0, 0, 12, 7, 0, 0, 6.29); g.fill(); g.restore(); } }
};

// ── outro: «هندسة صوتية وتصميم» + Wamd logo animation ──────────────
const LG = { cx: 623, cy: 630.5, R: 558.25, rin: 524 };
function logo(t, X, Y, D) {
  const s = D / (2 * LG.R), M = A.logoMeta.boxes, pulse = 1 + .008 * beatPulse(t, 7) * smooth(115, 116, t);
  g.save(); g.translate(X, Y); g.scale(pulse, pulse);
  const P = (bx, by) => [(bx - LG.cx) * s, (by - LG.cy) * s];
  // inner illustration through a growing circle
  const ki = sp(t, 112.85, 'card');
  if (ki > 0) { g.save(); g.beginPath(); g.arc(0, 0, Math.max(0, LG.rin * s * Math.min(ki, 1.04) + 2), 0, 6.29); g.clip();
    const zi = 1.18 - .18 * clamp(sp(t, 112.85, 'soft')); g.scale(zi, zi); g.drawImage(A.logo_inner, -LG.cx * s, -LG.cy * s, 1254 * s, 1254 * s);
    // one glint pass
    const gx = lerp(-700, 700, ease(116.4, 117.4, t)); if (t > 116.4 && t < 117.4) { const gr = g.createLinearGradient(gx - 120, 0, gx + 120, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.rotate(.4); g.fillRect(-900, -900, 1800, 1800); }
    g.restore(); }
  // gradient ring draws itself while turning into place
  const kr = ease(112.45, 113.45, t);
  if (kr > 0) { g.save(); const rot = (1 - kr) * -.9 + Math.sin(t * .3) * .01; g.rotate(rot); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, LG.R * s + 20, -Math.PI / 2, -Math.PI / 2 + 6.2832 * kr); g.closePath(); g.clip();
    g.drawImage(A.logo_ring, -LG.cx * s, -LG.cy * s, 1254 * s, 1254 * s); g.restore(); }
  const part = (key, t0, mode) => {
    if (t < t0) return; const [x0, y0, x1, y1] = M[key], [px, py] = P(x0, y0), w = (x1 - x0) * s, h = (y1 - y0) * s, img = A['logo_' + key];
    g.save();
    if (mode === 'pop') { const k = sp(t, t0, 'snap'); g.translate(px + w / 2, py + h / 2); g.rotate((1 - k) * 2.4); g.scale(k, k); g.drawImage(img, -w / 2, -h / 2, w, h); }
    else if (mode === 'mark') { const k = sp(t, t0, 'card'); g.translate(px + w / 2 + (1 - k) * 160, py + h / 2); g.rotate((1 - k) * -.5); g.scale(.4 + .6 * k, .4 + .6 * k); g.globalAlpha = clamp(k * 2); g.drawImage(img, -w / 2, -h / 2, w, h); }
    else if (mode === 'rtl') { const k = easeOut(t0, t0 + .55, t); g.beginPath(); g.rect(px + w * (1 - k), py - 10, w * k + 4, h + 20); g.clip(); g.drawImage(img, px, py, w, h); }
    else if (mode === 'ltr') { const k = easeOut(t0, t0 + .55, t); g.beginPath(); g.rect(px - 2, py - 10, w * k + 4, h + 20); g.clip(); g.drawImage(img, px, py, w, h); }
    else if (mode === 'rise') { const k = sp(t, t0, 'card'); g.beginPath(); g.rect(px - 4, py - 4, w + 8, h + 8); g.clip(); g.drawImage(img, px, py + (1 - k) * h, w, h); }
    g.restore();
  };
  part('dpink', 113.3, 'pop'); part('dgreen', 113.45, 'pop');
  part('mark', 113.55, 'mark'); part('word', 113.9, 'rtl'); part('wamd', 114.2, 'ltr'); part('tag', 114.45, 'rise');
  g.restore();
}
S.outro = t => {
  g.drawImage(R.outroBg, 0, 0);
  // floating diamonds in logo colours
  const r = rng(1201); ['#ec1f86', '#1f8a5b', '#7b35d9', '#2b3be0', '#ec1f86', '#1f8a5b'].forEach((c, i) => {
    const t0 = 114.4 + i * .18, k = sp(t, t0, 'snap'); if (k <= 0) { r(); r(); r(); return; }
    const a = r() * 6.28, d = 470 + r() * 110, x = W / 2 + Math.cos(a) * d * .95, y = 860 + Math.sin(a) * d + Math.sin(t * .9 + i) * 14, sz = 16 + r() * 16;
    g.save(); g.translate(x, y); g.rotate(t * .4 + i); g.scale(k, k); g.fillStyle = c; g.globalAlpha = .85; g.beginPath(); g.moveTo(0, -sz * 1.6); g.lineTo(sz * .8, 0); g.lineTo(0, sz * 1.6); g.lineTo(-sz * .8, 0); g.closePath(); g.fill(); g.restore();
  });
  logo(t, W / 2, 870, 760 * (1 + .045 * ease(115, 120, t)));
  // credit: هندسة صوتية وتصميم
  const ws = ['هندسة', 'صوتية', 'وتصميم'], ts = [114.6, 114.85, 115.1], sz = 122, gp = 32, wd = ws.map(w => measure(w, sz)), tot = wd.reduce((a, b) => a + b) + gp * 2;
  let x = W / 2 + tot / 2;
  ws.forEach((w, i) => { if (t > ts[i]) { const k = sp(t, ts[i], 'card'); g.save(); g.beginPath(); g.rect(0, 180, W, 210); g.clip(); txt(w, x, 285 + (1 - k) * 110, sz, { color: PAL.ink, align: 'right' }); g.restore(); } x -= wd[i] + gp; });
  const ul = []; for (let i = 0; i <= 40; i++) { const u = i / 40; ul.push([W / 2 + tot / 2 - u * tot, 395 + Math.sin(u * Math.PI * 2) * 8]); }
  const grU = g.createLinearGradient(W / 2 + tot / 2, 0, W / 2 - tot / 2, 0); grU.addColorStop(0, PAL.wPink); grU.addColorStop(.5, PAL.wViolet); grU.addColorStop(1, PAL.wBlue);
  strokeProgress(ul, easeOut(115.35, 116.2, t), 6, grU);
  // studio name
  if (t > 115.6) { const k = sp(t, 115.6, 'snap'); g.save(); g.translate(W / 2, 1350); g.scale(1.3 - .3 * k, 1.3 - .3 * k);
    const gr = g.createLinearGradient(160, 0, -160, 0); gr.addColorStop(0, PAL.wPink); gr.addColorStop(.55, PAL.wViolet); gr.addColorStop(1, PAL.wBlue);
    txt('ومض', 0, 0, 200, { color: gr, alpha: clamp((t - 115.6) * 10) }); g.restore(); }
  const dw = ['استديو', 'الإنتاج', 'والإبداع', 'الفني'], dsz = 46, dgap = measure(' ', dsz, UI, '500'), dws = dw.map(w => measure(w, dsz, UI, '500')), dtot = dws.reduce((a, b) => a + b) + dgap * 3;
  let dx = W / 2 + dtot / 2;
  dw.forEach((w, i) => { const t0 = 116.0 + i * .16; if (t > t0) { const k = sp(t, t0, 'card'); txt(w, dx, 1490 + (1 - k) * 30, dsz, { fam: UI, w: '500', color: PAL.ink, align: 'right', alpha: clamp(k * 1.5) }); } dx -= dws[i] + dgap; });
};

// ── timeline ────────────────────────────────────────────────────────
const TL = [
  [0, 25.0, S.night], [25.0, 33.6, S.clouds1], [33.6, 42.6, S.dawn], [42.6, 59.9, S.lala],
  [59.9, 66.4, S.hills], [66.4, 72.7, S.clouds2], [72.7, 75.0, S.meadow], [75.0, 79.3, S.eye],
  [79.3, 84.1, S.mountains], [84.1, 90.0, S.flowers], [90.0, 92.2, S.ribbon], [92.2, 98.5, S.morning],
  [98.5, 103.5, S.petals], [103.5, 112.0, S.sunrise], [112.0, 121, S.outro],
];
// transitions at scene boundaries: [T, kind, start offset, duration, seed]
const TR = {
  25.0: ['up', -.3, .8, 11], 42.6: ['down', -.12, .5, 12], 59.9: ['iris', 0, .75, 13], 66.4: ['down', -.15, .6, 14],
  72.7: ['left', -.12, .5, 15], 75.0: ['right', -.12, .5, 16], 79.3: ['iris', -.05, .65, 17], 84.1: ['up', -.15, .6, 18],
  90.0: ['left', -.1, .5, 19], 92.2: ['down', -.15, .6, 20], 98.5: ['right', -.15, .6, 21], 103.5: ['up', -.15, .7, 22], 112.0: ['up', -.25, 1.0, 23],
};
const SCENE_END = { 33.6: true };   // dawn draws clouds1 underneath: no wipe
function drawFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  let i = TL.findIndex(([a, b]) => t >= a && t < b); if (i < 0) i = TL.length - 1;
  // transition into the next scene already in progress?
  let drawn = false;
  for (let j = 1; j < TL.length; j++) {
    const T = TL[j][0], tr = TR[T]; if (!tr) continue;
    const [kind, off, dur, seed] = tr, t0 = T + off, t1 = t0 + dur;
    if (t >= t0 && t < t1) {
      const A_ = TL[j - 1][2], B_ = TL[j][2], k = ease(t0, t1, t);
      B_(t);
      if (kind === 'iris') { const c = T === 79.3 ? [W / 2, 960] : [W / 2, 960]; irisOver(lerp(T === 59.9 ? 70 : 20, 1250, Math.pow(prog(t0, t1, t), 1.5)), c[0], c[1], A_, seed, t); }
      else tearOver(k, A_, kind, seed, t);
      drawn = true; break;
    }
  }
  if (!drawn) TL[i][2](t);
  for (const L of LY) drawLyric(L, t);
  finish(t, { grain: t > 112.2 ? .06 : .1, vign: t > 112.2 ? .25 : .9 });
}
