import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const folder=resolve(process.argv[2]||'/home/user/.cache/nezar/review-1');mkdirSync(folder,{recursive:true});
const times=[.65,1.6,3.8,8.5,15,20.5,27,32,40,44.5,51,57,60.8,64,69,73.8,77,81.5,86.5,91.3,95,101,105.5,110,115.6,118.5];
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--allow-file-access-from-files','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
let errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(pathToFileURL(resolve('index.html')).href);await page.waitForFunction(()=>window.filmReady||window.filmError,{timeout:45000});
const err=await page.evaluate(()=>window.filmError);if(err)throw new Error(err);
let states=[];
for(let i=0;i<times.length;i++){
 const t=times[i];const data=await page.evaluate(t=>{const state=window.seek(t);return {state,image:document.getElementById('c').toDataURL('image/png').split(',')[1]}},t);
 writeFileSync(`${folder}/${String(i).padStart(2,'0')}-${t.toFixed(2)}.png`,Buffer.from(data.image,'base64'));states.push(data.state);
}
writeFileSync(folder+'/states.json',JSON.stringify({times,states,errors},null,2));
await browser.close();console.log('Captured',times.length,'review frames to',folder);
