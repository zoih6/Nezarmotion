// ═══════════════════════════════════════════════════════════════════
//  «فوق ثغر الربا» · vertical engine (1080×1920 canvas 2D)
//  Pure function of t: seeded RNG only, no timers / CSS / Math.random.
//  Built on the motion-doc-studio rules (springs, one display face + one
//  UI face, one accent, torn-paper collage vocabulary).
// ═══════════════════════════════════════════════════════════════════
const cv = document.getElementById('c');
const W = cv.width, H = cv.height;
let g = cv.getContext('2d');
const MAIN = g;

// ── math / motion ────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (a, b, x) => { const k = prog(a, b, x); return k * k * (3 - 2 * k); };
const ease = (a, b, x) => { const k = prog(a, b, x); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (a, b, x) => { const k = prog(a, b, x); return 1 - Math.pow(1 - k, 3); };
const easeIn = (a, b, x) => { const k = prog(a, b, x); return k * k * k; };
const expoOut = (a, b, x) => { const k = prog(a, b, x); return k >= 1 ? 1 : 1 - Math.pow(2, -10 * k); };
function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}
// the film's three motion presets
const SPR = { card: [150, 19], snap: [320, 24], soft: [55, 14] };
const sp = (t, t0, kind = 'card') => spring(t - t0, ...SPR[kind]);
function track(t, keys, kind = 'soft') { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * sp(t, keys[i][0], kind); return v; }
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (a, b = 0) => rng((a * 73856093) ^ (b * 19349663))();
const shake = (t, t0, amp, f = 55) => t < t0 ? 0 : amp * Math.exp(-(t - t0) * 8) * Math.sin((t - t0) * f);

// ── music ────────────────────────────────────────────────────────────
const BEATS = DATA.beats;
function lastBeat(t) { let lo = 0, hi = BEATS.length - 1; if (t < BEATS[0]) return -1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (BEATS[m] <= t) lo = m; else hi = m - 1; } return lo; }
const beatPulse = (t, decay = 7) => { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-(t - BEATS[i]) * decay); };
const env = (arr, t) => { const f = t * 30, i = Math.floor(f), k = f - i; return lerp(arr[clamp(i, 0, arr.length - 1)] || 0, arr[clamp(i + 1, 0, arr.length - 1)] || 0, k); };
const rmsAt = t => env(DATA.rms, t), lowAt = t => env(DATA.low, t);

// ── palette & type ───────────────────────────────────────────────────
const PAL = {
  night: '#141233', indigo: '#26204f', violet: '#4b3a7a', rose: '#e58a94', blush: '#f4c3bd',
  coral: '#f0996b', gold: '#f4b860', goldD: '#c9822e', cream: '#f6ecdc', paper: '#efe3cf', ink: '#24163a',
  // logo palette (outro only)
  wPink: '#ec1f86', wViolet: '#7b35d9', wBlue: '#2b3be0', wGreen: '#1f8a5b'
};
const DISPLAY = 'Ruqaa', UI = 'Alexandria';
const font = (size, fam = DISPLAY, w = '') => `${w} ${Math.round(size)}px ${fam}`.trim();

// ── assets ───────────────────────────────────────────────────────────
const A = {};
const loadImg = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { A[k] = i; r(); }; i.onerror = () => { console.log('MISSING ' + src); r(); }; i.src = src; });
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const withCtx = (c, fn) => { const prev = g; g = c.getContext('2d'); try { fn(g); } finally { g = prev; } };

// procedural paper texture (fibres + tooth), generated once
function paperTex(w, h, seed, base = [246, 236, 220], amt = 1) {
  const c = mk(w, h), x = c.getContext('2d'), id = x.createImageData(w, h), d = id.data, r = rng(seed);
  // low-frequency blotches via a tiny upscaled noise canvas
  const sm = mk(Math.ceil(w / 48), Math.ceil(h / 48)), sx = sm.getContext('2d'), sd = sx.createImageData(sm.width, sm.height);
  for (let i = 0; i < sd.data.length; i += 4) { const v = 128 + (r() - .5) * 60; sd.data[i] = sd.data[i + 1] = sd.data[i + 2] = v; sd.data[i + 3] = 255; }
  sx.putImageData(sd, 0, 0); const big = mk(w, h), bx = big.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(sm, 0, 0, w, h);
  const bd = bx.getImageData(0, 0, w, h).data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - .5) * 16 * amt + (bd[i] - 128) * .22 * amt;
    d[i] = base[0] + n; d[i + 1] = base[1] + n * .95; d[i + 2] = base[2] + n * .85; d[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  // fibres
  x.globalAlpha = .07 * amt; x.strokeStyle = '#5a4630'; x.lineWidth = .8;
  for (let i = 0; i < w * h / 2600; i++) { const px = r() * w, py = r() * h, a = r() * 6.28, l = 6 + r() * 22; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * .5 + (r() - .5) * 6, py + Math.sin(a) * l * .5 + (r() - .5) * 6, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  x.globalAlpha = 1; return c;
}
function tornPoly(w, h, seed, rough = 6, step = 10) {
  const r = rng(seed), pts = [];
  const edge = (x0, y0, x1, y1, nx, ny) => { const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / step)), ph = r() * 6.28, fr = 1 + r() * 2;
    for (let i = 0; i < n; i++) { const k = i / n, o = (r() - .5) * rough * 1.4 + Math.sin(k * 6.28 * fr + ph) * rough * .8; pts.push([x0 + (x1 - x0) * k + nx * o, y0 + (y1 - y0) * k + ny * o]); } };
  edge(0, 0, w, 0, 0, -1); edge(w, 0, w, h, 1, 0); edge(w, h, 0, h, 0, 1); edge(0, h, 0, 0, -1, 0); return pts;
}
const pathPoly = (c, pts, ox = 0, oy = 0) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x + ox, y + oy) : c.moveTo(x + ox, y + oy)); c.closePath(); };
// fake soft shadow without per-frame blur: pre-rendered once
function shadowOf(c, blur = 14, color = 'rgba(20,10,30,1)') {
  const p = blur * 2, s = mk(c.width + p * 2, c.height + p * 2), x = s.getContext('2d');
  x.filter = `blur(${blur}px)`; x.drawImage(c, p, p); x.filter = 'none';
  x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, s.width, s.height);
  return { c: s, p };
}

// torn photographic piece: paper rim + image + baked shadow
function tornPiece(img, w, h, { crop = [0, 0, 1, 1], seed = 1, rough = 7, rim = 9, tint = null } = {}) {
  const pad = 30, c = mk(w + pad * 2, h + pad * 2), x = c.getContext('2d');
  const outer = tornPoly(w + rim * 2, h + rim * 2, seed, rough, 9), inner = tornPoly(w, h, seed + 7, rough * .55, 7);
  x.save(); pathPoly(x, outer, pad - rim, pad - rim); x.clip(); x.drawImage(TEX.paper, 0, 0); x.restore();
  x.save(); pathPoly(x, inner, pad, pad); x.clip();
  const [cx, cy, cw, ch] = crop, sw = img.width * cw, sh = img.height * ch, s = Math.max(w / sw, h / sh);
  x.drawImage(img, img.width * cx + (sw - w / s) / 2, img.height * cy + (sh - h / s) / 2, w / s, h / s, pad, pad, w, h);
  if (tint) { x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; }
  x.globalAlpha = .18; x.globalCompositeOperation = 'multiply'; x.drawImage(TEX.paper, 0, 0); x.restore();
  return { c, s: shadowOf(c, 12), w, h, pad };
}
// sticker cut-out: paper border around an alpha subject + baked shadow
function sticker(img, targetW, { border = 10, seed = 3, flip = false } = {}) {
  const s = targetW / img.width, w = targetW, h = img.height * s, pad = border + 26;
  const base = mk(w + pad * 2, h + pad * 2), bx = base.getContext('2d'), r = rng(seed);
  // dilate alpha → border
  const sil = mk(w + pad * 2, h + pad * 2), sx = sil.getContext('2d');
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28, rr = border * (.85 + r() * .3); sx.drawImage(img, pad + Math.cos(a) * rr, pad + Math.sin(a) * rr, w, h); }
  sx.drawImage(img, pad, pad, w, h);
  sx.globalCompositeOperation = 'source-in'; sx.drawImage(TEX.paper, 0, 0);
  bx.drawImage(sil, 0, 0); bx.drawImage(img, pad, pad, w, h);
  let out = base;
  if (flip) { out = mk(base.width, base.height); const ox = out.getContext('2d'); ox.translate(base.width, 0); ox.scale(-1, 1); ox.drawImage(base, 0, 0); }
  return { c: out, s: shadowOf(out, 10), w, h, pad };
}
// draw a pre-rendered piece centred at x,y
function drawPiece(p, x, y, { rot = 0, sc = 1, alpha = 1, lift = 0, sx = 1 } = {}) {
  if (!p || alpha <= .003 || sc <= .002) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * sx, sc);
  const ox = -p.c.width / 2, oy = -p.c.height / 2;
  g.globalAlpha = alpha * (.55 - lift * .1); g.drawImage(p.s.c, ox - p.s.p + 5 + lift * 18, oy - p.s.p + 9 + lift * 26);
  g.globalAlpha = alpha; g.drawImage(p.c, ox, oy); g.restore();
}
// full-bleed plate with focus point, zoom and offset; never shows edges
function plate(img, { z = 1, fx = .5, fy = .5, dx = 0, dy = 0, alpha = 1, rot = 0 } = {}) {
  if (!img || alpha <= 0) return;
  const s0 = Math.max(W / img.width, H / img.height), s = s0 * z, dw = img.width * s, dh = img.height * s;
  let x = W / 2 + dx - fx * dw, y = H / 2 + dy - fy * dh;
  x = clamp(x, W - dw, 0); y = clamp(y, H - dh, 0);
  g.save(); g.globalAlpha = alpha;
  if (rot) { g.translate(W / 2, H / 2); g.rotate(rot); g.translate(-W / 2, -H / 2); }
  g.drawImage(img, x, y, dw, dh); g.restore();
  return { x, y, s };
}
function grade(top, bot, mode = 'multiply', alpha = 1) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = alpha; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
function radial(x, y, r, col, mode = 'screen', alpha = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = alpha; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}

// ── text ─────────────────────────────────────────────────────────────
function txt(s, x, y, size, { fam = DISPLAY, color = PAL.cream, align = 'center', alpha = 1, shadow = 0, w = '' } = {}) {
  g.save(); g.font = font(size, fam, w); g.direction = 'rtl'; g.textAlign = align; g.textBaseline = 'middle'; g.globalAlpha *= alpha;
  if (shadow) { g.shadowColor = `rgba(18,8,32,${.55 * shadow})`; g.shadowBlur = 22; g.shadowOffsetY = 6; }
  g.fillStyle = color; g.fillText(s, x, y); g.restore();
}
function measure(s, size, fam = DISPLAY, w = '') { g.save(); g.font = font(size, fam, w); g.direction = 'rtl'; const m = g.measureText(s).width; g.restore(); return m; }
// torn paper strip (label / highlighter) pre-rendered
function strip(w, h, color, seed, { rough = 5, texAlpha = .35 } = {}) {
  const pad = 24, c = mk(w + pad * 2, h + pad * 2), x = c.getContext('2d');
  const pts = tornPoly(w, h, seed, rough, 8);
  x.save(); pathPoly(x, pts, pad, pad); x.clip(); x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  x.globalAlpha = texAlpha; x.globalCompositeOperation = 'multiply'; x.drawImage(TEX.paper, -seed * 13 % 300, -seed * 29 % 500); x.restore();
  x.save(); pathPoly(x, pts, pad, pad); x.strokeStyle = 'rgba(255,250,240,.55)'; x.lineWidth = 1.5; x.stroke(); x.restore();
  return { c, s: shadowOf(c, 9), w, h, pad };
}

// ── grain + vignette (pre-rendered) ──────────────────────────────────
const TEX = {};
function buildTextures() {
  TEX.paper = paperTex(W, H, 11);
  TEX.paperDark = paperTex(540, 960, 12, [60, 50, 90], 1.4);
  TEX.grain = [0, 1, 2, 3].map(k => { const c = mk(540, 960), x = c.getContext('2d'), id = x.createImageData(540, 960), r = rng(100 + k);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); return c; });
  const v = mk(W, H), vx = v.getContext('2d'), gr = vx.createRadialGradient(W / 2, H * .45, H * .28, W / 2, H * .5, H * .78);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,4,20,.55)'); vx.fillStyle = gr; vx.fillRect(0, 0, W, H); TEX.vign = v;
}
function finish(t, { grain = .09, vign = 1 } = {}) {
  if (vign > 0) { g.save(); g.globalAlpha = vign; g.drawImage(TEX.vign, 0, 0); g.restore(); }
  const k = Math.floor(t * 24) % 4;
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = grain; g.drawImage(TEX.grain[k], 0, 0, W, H); g.restore();
}

// ── torn-edge transitions ────────────────────────────────────────────
// edge polyline across the frame (horizontal or vertical) with paper rim + shadow
function edgePts(seed, len, rough = 22, step = 14) {
  const r = rng(seed), n = Math.ceil(len / step) + 1, pts = [], ph = r() * 6.28, ph2 = r() * 6.28;
  for (let i = 0; i <= n; i++) { const k = i / n; pts.push([k * (len + 40) - 20, Math.sin(k * 7 + ph) * rough * .9 + Math.sin(k * 23 + ph2) * rough * .35 + (r() - .5) * rough * .9]); }
  return pts;
}
const EDGES = {};
// draws scene A over scene B (already painted), A kept on one side of a moving torn edge.
// dir: 'up' (A above edge, edge moves up), 'down', 'left', 'right'. k = 0..1 progress (0 = A full)
function tearOver(k, drawA, dir, seed, t) {
  if (k >= 1) return; if (k <= 0) { drawA(t); return; }
  const vert = dir === 'left' || dir === 'right', len = vert ? H : W, span = vert ? W : H;
  const pts = EDGES[seed + dir] || (EDGES[seed + dir] = edgePts(seed, len));
  const pos = (dir === 'up' || dir === 'left') ? lerp(span + 60, -60, k) : lerp(-60, span + 60, k);
  const tilt = (hash(seed, 3) - .5) * 160;
  const P = pts.map(([a, b], i) => { const o = pos + b + tilt * (i / pts.length - .5); return vert ? [o, a] : [a, o]; });
  const keepNeg = (dir === 'up' || dir === 'left');   // A lives on the low-coordinate side
  const region = (c, off) => { c.beginPath(); P.forEach(([x, y], i) => { const xx = vert ? x + off : x, yy = vert ? y : y + off; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); });
    if (vert) { if (keepNeg) { c.lineTo(-100, H + 100); c.lineTo(-100, -100); } else { c.lineTo(W + 100, H + 100); c.lineTo(W + 100, -100); } }
    else { if (keepNeg) { c.lineTo(W + 100, -100); c.lineTo(-100, -100); } else { c.lineTo(W + 100, H + 100); c.lineTo(-100, H + 100); } }
    c.closePath(); };
  const sgn = keepNeg ? 1 : -1;
  // shadow on B: a few widening translucent passes
  for (let i = 3; i >= 1; i--) { g.save(); region(g, sgn * i * 9); g.fillStyle = `rgba(15,6,25,${.12})`; g.fill(); g.restore(); }
  // paper rim (white fibrous back of the torn sheet)
  g.save(); region(g, sgn * 13); g.clip(); g.drawImage(TEX.paper, 0, 0); g.restore();
  g.save(); region(g, 0); g.clip(); drawA(t); g.restore();
}
// torn circular iris: B (painted) shows inside a growing torn hole cut in A
function irisOver(r, cx, cy, drawA, seed, t) {
  if (r <= 0) { drawA(t); return; }
  if (r > Math.hypot(W, H)) return;
  const n = 90, R = rng(seed), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.28, o = 1 + (R() - .5) * .08 + Math.sin(a * 5 + seed) * .03; pts.push([cx + Math.cos(a) * r * o, cy + Math.sin(a) * r * o]); }
  const hole = (c, sc) => { pts.forEach(([x, y], i) => { const xx = cx + (x - cx) * sc, yy = cy + (y - cy) * sc; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }); c.closePath(); };
  g.save(); g.beginPath(); g.rect(-10, -10, W + 20, H + 20); hole(g, 1); g.clip('evenodd'); drawA(t);
  g.restore();
  // rim
  g.save(); g.beginPath(); hole(g, 1); hole(g, Math.max(0, 1 - 16 / Math.max(r, 1))); g.clip('evenodd'); g.drawImage(TEX.paper, 0, 0); g.restore();
  g.save(); g.beginPath(); hole(g, Math.max(0, 1 - 16 / Math.max(r, 1))); g.strokeStyle = 'rgba(15,6,25,.25)'; g.lineWidth = 10; g.stroke(); g.restore();
}
