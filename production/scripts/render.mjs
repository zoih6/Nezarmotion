import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';

const value=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1]};
const FPS=Number(value('fps',30)),DUR=Number(value('dur',120)),START=Number(value('start',0));
const SUB=Number(value('sub',1)),OUT=resolve(value('out','out/silent.mp4'));
mkdirSync(dirname(OUT),{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--allow-file-access-from-files','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
page.on('pageerror',e=>console.error('BROWSER ERROR',String(e)));
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.waitForFunction(()=>window.filmReady||window.filmError,{timeout:45000});
const error=await page.evaluate(()=>window.filmError);if(error){await browser.close();throw new Error(error)}
const filters=SUB>1?`tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB-1})',setpts=N/${FPS}/TB`:'null';
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','warning','-threads','2','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS*SUB),'-i','-','-vf',filters,'-r',String(FPS),'-an','-c:v','libx264','-preset','medium','-crf','21','-maxrate','2500k','-bufsize','5000k','-threads','2','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
let ffError=null;ff.on('error',e=>{ffError=e});ff.stdin.on('error',e=>{ffError=e});
const done=new Promise((res,rej)=>ff.on('close',code=>code===0?res():rej(new Error('ffmpeg exit '+code))));
const total=Math.round(FPS*SUB*DUR),begin=Date.now();
try{
 for(let i=0;i<total;i++){
   if(ffError)throw ffError;
   const encoded=await page.evaluate(t=>{window.seek(t);return document.getElementById('c').toDataURL('image/jpeg',.95).split(',')[1]},START+i/(FPS*SUB));
   const frame=Buffer.from(encoded,'base64');
   if(!ff.stdin.write(frame))await once(ff.stdin,'drain');
   if(i%(FPS*SUB*5)===0)console.log(`rendered ${(i/(FPS*SUB)).toFixed(1)} / ${DUR}s, ${i} frames, elapsed ${((Date.now()-begin)/1000).toFixed(1)}s`);
 }
 ff.stdin.end();await done;console.log(`DONE: ${OUT} (${total/SUB} frames, ${FPS}fps, ${DUR}s)`);
}catch(e){ff.kill('SIGTERM');throw e}finally{await browser.close()}
