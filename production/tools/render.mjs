// PAGE=index.html node ../tools/render.mjs --fps 30 --from 0 --to 20.8 --sub 2 --out out/silent.mp4   (run from the film folder)
// --sub 2 = two sub-frames per output frame blended (tmix) → natural motion blur
// Fast path: page.screenshot JPEG (the locator PNG path was ~20x slower in this sandbox)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const CRF = arg('crf', '18'), FPS = +arg('fps', 30), FROM = +arg('from', 0), TO = +arg('to', 20.8), SUB = +arg('sub', 2), OUT = arg('out', 'out/silent.mp4');
mkdirSync('out', { recursive: true });
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: +(process.env.VW || 1080), height: +(process.env.VH || 1920) }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('ERR', e.message));
await page.goto(pathToFileURL(resolve(process.env.PAGE || 'index.html')).href);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB` : 'null';
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', CRF, '-pix_fmt', 'yuv420p', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round((TO - FROM) * FPS * SUB), t0 = Date.now();
for (let i = 0; i < total; i++) {
  // centre each subframe inside its output frame for symmetric motion blur
  const t = FROM + (i + 0.5) / (FPS * SUB) - 0.5 / FPS + (SUB > 1 ? 0.5 / (FPS * SUB) * 0 : 0);
  await page.evaluate((t) => window.seek(t), Math.max(0, t));
  const jpg = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % (FPS * SUB * 2) === 0) console.log(`${OUT}: ${(i / (FPS * SUB) + FROM).toFixed(1)}s  (${((Date.now() - t0) / 1000).toFixed(0)}s elapsed)`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await browser.close();
console.log('done ->', OUT, ((Date.now() - t0) / 1000).toFixed(0) + 's');
