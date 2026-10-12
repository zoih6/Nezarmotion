// PAGE=index.html node ../tools/still.mjs t1 t2 ...  -> tmp/still_<t>.png  (run from the film folder)
import { chromium } from 'playwright';
import { resolve } from 'node:path'; import { mkdirSync } from 'node:fs'; import { pathToFileURL } from 'node:url';
mkdirSync('tmp', { recursive: true });
const ts = process.argv.slice(2).map(Number);
const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +(process.env.VW || 1080), height: +(process.env.VH || 1920) } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(pathToFileURL(resolve(process.env.PAGE || 'index.html')).href);
await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
for (const t of ts) { const t0 = Date.now(); await p.evaluate(t => window.seek(t), t);
  await p.locator('#c').screenshot({ path: `tmp/still_${t.toFixed(2).padStart(7, "0")}.png` }); console.log('t', t, Date.now() - t0, 'ms'); }
await b.close();
