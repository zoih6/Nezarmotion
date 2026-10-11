import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const base=resolve('..'),port=Number(process.env.PORT||3000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf','.mp4':'video/mp4','.mp3':'audio/mpeg','.srt':'text/plain; charset=utf-8'};
const ui=`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>فيلم نزار — ومض</title><style>@font-face{font-family:Plex;src:url('/production/assets/fonts/IBMPlexSansArabic-Medium.ttf')}*{box-sizing:border-box}body{margin:0;background:#102e2c;color:#eee5cf;font-family:Plex,sans-serif}main{max-width:940px;margin:auto;padding:32px}h1{font-size:32px;margin:0 0 8px}p{color:#b6c8b9}video{display:block;width:min(100%,380px);max-height:78vh;margin:24px auto;background:#102e2c}a{color:#e5b965;display:inline-block;padding:12px 18px;background:#1d4641;border-radius:12px;margin:8px 0}footer{font-size:13px;color:#b6c8b9}</style><main><h1>القصيدة التي تصير صباحًا</h1><p>كلمات الشاعر الأنيق نزار القدسي · تصميم وهندسة صوتية: ومض</p><video controls playsinline preload="metadata" poster="/deliverables/poster.jpg"><source src="/deliverables/nezar-poetic-motion.mp4" type="video/mp4"></video><a href="/deliverables/nezar-poetic-motion.mp4" download>تنزيل الفيديو</a> <a href="/deliverables/contact-sheet.jpg">مشاهدة إطارات الفيلم</a> <a href="/production/index.html">Canvas البرمجي</a><footer>120 ثانية · 1080×1920 · 30fps · H.264 / AAC</footer></main></html>`;
createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://preview').pathname);
 if(pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(ui);return}
 if(!pathname.startsWith('/production/')&&!pathname.startsWith('/deliverables/')){res.writeHead(404);res.end();return}
 const file=resolve(base,'.'+pathname);
 if(!file.startsWith(base+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end();return}
 const size=statSync(file).size,headers={'Content-Type':types[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
 const range=req.headers.range;
 if(range){const m=/bytes=(\d+)-(\d*)/.exec(range);if(!m){res.writeHead(416);res.end();return}const start=+m[1],end=Math.min(m[2]?+m[2]:size-1,size-1);if(start>size-1||end<start){res.writeHead(416);res.end();return}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res)}else{res.writeHead(200,{...headers,'Content-Length':size});createReadStream(file).pipe(res)}
}).listen(port,'0.0.0.0',()=>console.log(`Motion film preview on ${port}`));
