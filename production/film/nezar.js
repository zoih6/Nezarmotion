// ════════════════════════════════════════════════════════════════════
//  صباحٌ يُغنَّى · shared helpers — pure functions of t (1080×1920)
// ════════════════════════════════════════════════════════════════════
const NZ = {};

// ── music data (window.NEZ_AUDIO: 30fps energy + pulse, 3600 frames) ──
NZ.frame = (t) => Math.max(0, Math.min(3599, Math.floor(t * 30)));
NZ.E = (t) => window.NEZ_AUDIO.energy[NZ.frame(t)];
NZ.PUL = (t) => window.NEZ_AUDIO.pulse[NZ.frame(t)];

// ── veils & tints ────────────────────────────────────────────────────
NZ.veil = (stops) => { const gr = g.createLinearGradient(0, 0, 0, H);
  stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
NZ.tint = (color, alpha, mode = 'soft-light') => { if (alpha <= 0) return;
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = alpha; g.fillStyle = color; g.fillRect(0, 0, W, H); g.restore(); };
NZ.vignTop = (a = .5) => NZ.veil([[0, `rgba(10,8,20,${a})`], [.28, 'rgba(10,8,20,0)'], [.62, 'rgba(10,8,20,0)'], [1, 'rgba(10,8,20,.62)']]);

// ── ridge silhouette (seeded, deterministic) ─────────────────────────
NZ.ridge = (seed, baseY, amp, color, edge) => {
  const R = rng(seed), n = 14, pts = [], ph1 = R() * 6.28, ph2 = R() * 6.28, ph3 = R() * 6.28;
  for (let i = 0; i <= n; i++) { const x = -60 + (W + 120) * i / n;
    const y = baseY - (Math.sin(i / n * 6.28 + ph1) * .5 + .5) * amp
      - (Math.sin(i / n * 12.5 + ph2) * .5 + .5) * amp * .35
      - (Math.sin(i / n * 3.1 + ph3) * .5 + .5) * amp * .5;
    pts.push([x, y]); }
  g.save(); g.fillStyle = color; g.beginPath(); g.moveTo(-60, H + 80);
  pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W + 60, H + 80); g.closePath(); g.fill();
  if (edge) { g.strokeStyle = edge; g.lineWidth = 2.5; g.globalAlpha = .85; g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
  g.restore();
};

// ── bird (two-stroke flapping silhouette) ────────────────────────────
NZ.bird = (x, y, s, t, ph, color = 'rgba(25,18,28,.9)') => {
  const w = Math.sin(t * 7 + ph) * .6;
  g.save(); g.strokeStyle = color; g.lineWidth = Math.max(2, 3.2 * s); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - 15 * s, y - w * 11 * s); g.quadraticCurveTo(x - 5 * s, y + 3 * s, x, y);
  g.quadraticCurveTo(x + 5 * s, y + 3 * s, x + 15 * s, y - w * 11 * s); g.stroke(); g.restore();
};

// ── flowing song ribbon ──────────────────────────────────────────────
NZ.ribbon = (t, yBase, amp, color, alpha, speed = 1.7, k = 1) => {
  const pts = [];
  for (let i = 0; i <= 44; i++) { const x = -40 + (W + 80) * i / 44;
    pts.push([x, yBase + Math.sin(i / 44 * 6.28 * k + t * speed) * amp + Math.sin(i / 44 * 12.5 - t * speed * 1.35) * amp * .3]); }
  line(pts, 1, { color, width: 5, alpha });
  line(pts.map(([x, y]) => [x, y + 16]), 1, { color, width: 2, alpha: alpha * .55 });
};

// ── sun-seed: the film's motif (gold dot + glow, pulsing with music) ─
NZ.seed = (x, y, r, t) => {
  const p = 1 + NZ.PUL(t) * .3 + Math.sin(t * 2.2) * .05;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .95;
  g.drawImage(NZ.glow, x - r * 4.5 * p, y - r * 4.5 * p, r * 9 * p, r * 9 * p); g.restore();
  g.save(); g.fillStyle = '#ffdf9e'; g.beginPath(); g.arc(x, y, r * p, 0, 6.283); g.fill();
  g.fillStyle = '#fff6e2'; g.beginPath(); g.arc(x, y, r * .55 * p, 0, 6.283); g.fill(); g.restore();
};

// ── karaoke lyric line ───────────────────────────────────────────────
// words: ['فوق','ثغر','الربا'] → items with 3 states (upcoming/sung/active)
NZ.lyric = (words, size = 86) => {
  const items = words.map((w) => {
    const mkc = (color) => textImg([{ t: w, size, font: DISPLAY, weight: 700, color }]);
    const c = mkc(PAL.cream);
    return { w, wpx: c.width, hpx: c.height, dim: mkc('#7d7462'), cream: c, gold: mkc(PAL.goldL) };
  });
  const gap = size * .62, Wd = items.reduce((a, it) => a + it.wpx, 0) + gap * (items.length - 1);
  return { items, gap, Wd, size };
};
NZ.drawLyric = (L, t, a, b, cx, cy) => {
  const n = L.items.length, dur = (b - a) / n;
  const ko = ease(b - .25, b + .5, t), yOff = -ko * 46, aOut = 1 - ko;
  let x = cx + L.Wd / 2; // RTL: first word starts at the right
  L.items.forEach((it, i) => {
    const s0 = a + dur * i, s1 = s0 + dur;
    const e = sp(t, s0, 'snap');
    const active = t >= s0 && t < s1, sung = t >= s1;
    const img = active ? it.gold : sung ? it.cream : it.dim;
    const sc = lerp(.45, 1, Math.min(e, 1.15)) * (active ? 1 + NZ.PUL(t) * .07 : 1);
    const al = clamp(e * 2.5) * aOut * (t < s0 ? .85 : 1);
    const cxi = x - it.wpx / 2;
    if (al > .01) { g.save(); g.globalAlpha = al;
      g.shadowColor = active ? 'rgba(242,207,126,.75)' : 'rgba(0,0,0,.7)'; g.shadowBlur = active ? 26 : 16;
      g.drawImage(img, cxi - it.wpx * sc / 2, cy + yOff - it.hpx * sc / 2, it.wpx * sc, it.hpx * sc); g.restore(); }
    x -= it.wpx + L.gap;
  });
};

// ── rising لا syllable (vocalise sections) ───────────────────────────
NZ.syl = (img, t, beat, x0, y0, life = 2.6, rise = 300, sc0 = 1, seed = 1) => {
  const lt = t - beat; if (lt < -.2 || lt > life) return;
  const e = sp(t, beat, 'snap'), R = rng(seed * 131 + 7);
  const sway = Math.sin(lt * 2.4 + R() * 6) * 34 * lt;
  const x = x0 + sway, y = y0 - Math.max(0, lt) * (rise / life) - (1 - Math.min(e, 1)) * -60;
  const sc = sc0 * lerp(.4, 1.1, Math.min(e, 1.1));
  const al = clamp(e * 3) * (1 - smooth(life * .62, life, lt));
  if (al <= .01) return;
  g.save(); g.globalAlpha = al; g.translate(x, y); g.rotate(Math.sin(lt * 1.8 + seed) * .16 + (R() - .5) * .2); g.scale(sc, sc);
  g.shadowColor = 'rgba(242,207,126,.8)'; g.shadowBlur = 22;
  g.drawImage(img, -img.width / 2, -img.height / 2); g.restore();
};

// ── drifting mist band (uses pre-rendered NZ.mist sprite) ────────────
NZ.mist = (t, yBase, speed, alpha, sc, seed) => {
  const span = W + 900, x = ((seed * 613 + t * speed) % span + span) % span - 450;
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = alpha;
  const w = NZ.mistImg.width * sc, h = NZ.mistImg.height * sc;
  g.drawImage(NZ.mistImg, x - w / 2, yBase - h / 2 + Math.sin(t * .5 + seed) * 12, w, h); g.restore();
};

// ── sweeping light blade (screen blend) ────────────────────────────────
NZ.blade = (t, t0, dur, yC, tall, color, alpha) => {
  const k = ease(t0, t0 + dur, t); if (k <= 0 || k >= 1) return;
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = alpha * Math.sin(k * Math.PI);
  g.translate(lerp(-320, W + 320, k), yC); g.rotate(.48); g.fillStyle = color;
  g.fillRect(-70, -tall / 2, 140, tall); g.restore();
};

// ── pre-rendered sprites (glow + mist + لالا) ────────────────────────
INITS.push(async () => {
  { const c = mk(256, 256), x = c.getContext('2d');
    const gr = x.createRadialGradient(128, 128, 4, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,224,150,1)'); gr.addColorStop(.25, 'rgba(255,200,120,.55)');
    gr.addColorStop(.6, 'rgba(230,160,80,.16)'); gr.addColorStop(1, 'rgba(230,160,80,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256); NZ.glow = c; }
  { const c = mk(512, 192), x = c.getContext('2d'), R = rng(41);
    for (let i = 0; i < 7; i++) { const px = 60 + R() * 392, py = 60 + R() * 72, pr = 60 + R() * 90;
      const gr = x.createRadialGradient(px, py, 2, px, py, pr);
      gr.addColorStop(0, 'rgba(235,230,220,.5)'); gr.addColorStop(1, 'rgba(235,230,220,0)');
      x.fillStyle = gr; x.beginPath(); x.arc(px, py, pr, 0, 6.283); x.fill(); }
    NZ.mistImg = c; }
  NZ.laGold = textImg([{ t: 'لا', size: 96, font: DISPLAY, weight: 700, color: PAL.goldL }]);
  NZ.laCream = textImg([{ t: 'لا', size: 96, font: DISPLAY, weight: 700, color: PAL.cream }]);
});
