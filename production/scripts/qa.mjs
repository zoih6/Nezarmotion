import { chromium } from 'playwright';
import { readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const failures=[],checks=[];
const ok=(cond,msg)=>{checks.push({test:msg,passed:!!cond});if(!cond)failures.push(msg)};
const source=readFileSync('film.js','utf8');
ok(!/Math\.random\s*\(/.test(source),'No unseeded randomness');
ok(!/requestAnimationFrame\s*\(|setTimeout\s*\(|setInterval\s*\(/.test(source),'No timers or frame-state animation in the renderer');
const browser=await chromium.launch({args:['--no-sandbox','--allow-file-access-from-files','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1080,height:1920}});
page.on('pageerror',e=>failures.push(String(e)));
await page.goto(pathToFileURL(resolve('index.html')).href);await page.waitForFunction(()=>window.filmReady||window.filmError,{timeout:45000});
ok(!(await page.evaluate(()=>window.filmError)),'Renderer initializes without errors');
ok(await page.evaluate(()=>document.fonts.check('700 160px Amiri','نزار القدسي')&&document.fonts.check('500 90px Plex','السحاب')),'Arabic font files loaded');
const data=await page.evaluate(()=>({duration:window.filmData.duration,scenes:window.filmData.scenes,lyrics:window.filmData.lyrics}));
ok(data.duration===120,'120 second exact timeline');
for(let i=1;i<data.scenes.length;i++)ok(data.scenes[i-1].end===data.scenes[i].start,'Contiguous scene '+(i+1));
const h=async t=>{const b=await page.evaluate(t=>{window.seek(t);return document.getElementById('c').toDataURL('image/png')},t);return createHash('sha256').update(b).digest('hex')};
for(const t of [.65,3.8,27,44.5,69,86.5,118.5]){
 const a=await h(t);await h(103.8);await h(.1);const b=await h(t);ok(a===b,`Frame ${t}s is deterministic after arbitrary seeks`);
}
for(const l of data.lyrics){
 const state=await page.evaluate(t=>window.seek(t),l.start+.8*(l.end-l.start));
 ok(state.lyric===l.text,`Phrase timing ${l.start}-${l.end}`);
 for(const b of state.bounds){ok(b.x>=80&&b.x+b.width<=972&&b.y>=290&&b.y+b.height<=1536,`Text safe area: ${b.text}`);ok(b.fontSize>=48,`Phone-readable font size: ${b.text}`)}
}
for(const t of [3.8,8.5,20.5,115.6,118.5]){
 const state=await page.evaluate(t=>window.seek(t),t);for(const b of state.bounds)ok(b.x>=80&&b.x+b.width<=972&&b.y>=290&&b.y+b.height<=1536,`Credit/title bounds ${t}s: ${b.text}`)
}
for(const t of [15,27,32,51,69,81.5,86.5,95,110,118])ok(await h(t)!==await h(t+.25),`Active analytic motion at ${t}s`);
await browser.close();
const report={checks:checks.length,passed:checks.filter(c=>c.passed).length,failures,details:checks};writeFileSync('docs/qa.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({checks:report.checks,passed:report.passed,failures},null,2));if(failures.length)process.exitCode=1;
