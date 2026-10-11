import { spring, clamp, HEAVY, DEFAULT, SNAPPY, PLAYFUL } from './scripts/motion.js';
import { DATA } from './assets/data.js';

// All animation is analytic. Seeking backwards or in random order is identical.
// No per-frame state, no simulations, no timers, no unseeded randomness.
const W=1080,H=1920,TAU=Math.PI*2,P=DATA.palette;
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d',{alpha:false});
ctx.direction='rtl';
const images={},backgrounds={},petals=[];
let bounds=[];
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const S=(t,p=DEFAULT)=>spring(t,...p);
const hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)};
const color=(dark)=>dark?P.cream:P.ink;
const sin=Math.sin,cos=Math.cos;
function image(name,url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{images[name]=i;resolve()};i.onerror=()=>reject(new Error(url));i.src=url})}
function envelope(t){const n=t*DATA.envRate,i=Math.floor(n);return lerp(DATA.envelope[Math.max(0,i)]||0,DATA.envelope[Math.max(0,i+1)]||0,n-i)}
function pulse(t){let l=0,r=DATA.beats.length-1,last=-10;while(l<=r){const m=(l+r)>>1;if(DATA.beats[m]<=t){last=DATA.beats[m];l=m+1}else r=m-1}return Math.exp(-(t-last)*7.8)}
function disk(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,TAU);ctx.fillStyle=fill;ctx.fill()}
function ellipse(x,y,rx,ry,fill,rot=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);ctx.fillStyle=fill;ctx.fill()}
function line(x1,y1,x2,y2,col,width=3){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke()}
function material(dark){ctx.drawImage(backgrounds[dark?'dark':'paper'],0,0)}
function inkPath(fn,col,width=3){ctx.beginPath();fn(ctx);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function shadow(){ctx.shadowColor='rgba(10,30,25,.14)';ctx.shadowOffsetY=10;ctx.shadowBlur=14}
function clearShadow(){ctx.shadowColor='transparent';ctx.shadowOffsetY=0;ctx.shadowBlur=0}

function text(txt,x,y,size,fill,{font='Amiri',weight=700,alpha=1,scale=1,align='center',maxWidth=820,mask=1,depth=false,track=true}={}){
  if(alpha<=0||scale<.002||mask<=0)return;
  ctx.save();ctx.direction='rtl';ctx.textAlign=align;ctx.textBaseline='alphabetic';
  ctx.font=`${weight} ${size}px ${font}`;
  const width=ctx.measureText(txt).width;
  if(width>maxWidth){size*=maxWidth/width;ctx.font=`${weight} ${size}px ${font}`}
  const m=ctx.measureText(txt),ww=m.width,asc=m.actualBoundingBoxAscent||size*.9,desc=m.actualBoundingBoxDescent||size*.28;
  ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
  if(mask<1){ctx.beginPath();ctx.rect(-ww/2-20,-asc-30,ww+40,(asc+desc+60)*clamp(mask));ctx.clip()}
  if(depth){ctx.fillStyle='rgba(10,35,30,.12)';for(let i=8;i>=1;i-=2)ctx.fillText(txt,i*1.1,i*1.4)}
  ctx.fillStyle=fill;ctx.fillText(txt,0,0);
  if(track)bounds.push({text:txt,x:x-(align==='center'?ww*.5:align==='right'?ww:0)*scale,y:y-asc*scale,width:ww*scale,height:(asc+desc)*scale,fontSize:size*scale});
  ctx.restore();
}

function sun(x,y,r,age,t,dark,{rays=28,hollow=false,smile=false}={}){
  const g=S(age,HEAVY),beat=pulse(t), rr=r*(.9+.035*envelope(t))*g;
  ctx.save();ctx.translate(x,y);ctx.rotate(.025*sin(t*.2));
  if(hollow){ctx.beginPath();ctx.arc(0,0,Math.max(1,rr),0,TAU);ctx.strokeStyle=P.gold;ctx.lineWidth=7;ctx.stroke()}
  else disk(0,0,rr,P.gold);
  for(let i=0;i<rays;i++){
    const th=i/rays*TAU+.03*sin(t*.25),gg=S(age-.025*i,SNAPPY),a=rr+18,b=a+(40+(i%3)*14+beat*16)*gg;
    line(cos(th)*a,sin(th)*a,cos(th)*b,sin(th)*b,dark?P.gold:P.clay,i%3===0?6:3);
  }
  if(smile){inkPath(c=>c.arc(0,0,Math.max(1,rr*.48),.23,Math.PI-.23),P.ink,8);disk(-rr*.33,-rr*.16,9,P.ink);disk(rr*.33,-rr*.16,9,P.ink)}
  ctx.restore();
}

function flower(x,y,size,age,t,rotation=0){
  const im=images.flower,cx=im.width*.5,cy=im.height*.54,sc=size/im.width;
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation+.018*sin(t*.8));
  for(let i=0;i<5;i++){
    const grow=S(age-i*.075,PLAYFUL),th=-Math.PI/2+i*TAU/5,open=(1-clamp(grow))*42;
    ctx.save();ctx.translate(cos(th)*open,sin(th)*open);ctx.rotate(.016*sin(t*1.2+i));ctx.scale(sc*(.25+.75*grow),sc*(.25+.75*grow));ctx.globalAlpha=clamp(grow*1.6);ctx.drawImage(petals[i],-cx,-cy);ctx.restore();
  }
  const cc=clamp(S(age-.24,HEAVY));ctx.save();ctx.scale(sc*cc,sc*cc);ctx.drawImage(im,cx-52,cy-52,104,104,-52,-52,104,104);ctx.restore();
  ctx.restore();
}

function leaf(x,y,ang,size,grow,t,fill=P.sage){
  const gg=clamp(grow);if(gg<.01)return;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang+.035*sin(t*.9+x*.009));ctx.scale(size*gg,size*gg);
  ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(30,-35,87,-34,108,0);ctx.bezierCurveTo(65,24,25,27,0,0);ctx.fillStyle=fill;ctx.fill();
  inkPath(c=>{c.moveTo(0,0);c.bezierCurveTo(36,-2,73,2,103,0)},fill===P.gold?P.clay:P.ink,1.5);
  for(let i=1;i<6;i++)line(i*16,0,i*16+9,-16,fill===P.gold?P.clay:P.ink,.7);
  ctx.restore();
}
function branch(x,y,len,age,t,dark,{side=1,angle=0,leaves=7,thickness=5}={}){
  const g=clamp(S(age,HEAVY));ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const sway=sin(t*.4+x*.01)*18;
  inkPath(c=>{c.moveTo(0,0);c.bezierCurveTo(side*60*g,-len*.3*g,(side*120+sway)*g,-len*.65*g,(side*140+sway)*g,-len*g)},dark?P.gold:P.ink,thickness);
  for(let i=0;i<leaves;i++){
    const f=(i+1)/(leaves+1),u=1-f,xx=(3*u*u*f*side*60+3*u*f*f*(side*120+sway)+f*f*f*(side*140+sway))*g,yy=(-3*u*u*f*len*.3-3*u*f*f*len*.65-f*f*f*len)*g;
    const gg=S(age-.1-i*.11,SNAPPY);leaf(xx,yy,(i%2?Math.PI:0)+side*.25,.65+f*.4,gg,t,i%3===0?P.gold:dark?P.sage:P.ink);
  }
  ctx.restore();
}

function terrain(age,t,dark,{mountain=false,levels=7,base=1090,amp=145}={}){
  const g=S(age,HEAVY);ctx.save();
  const cols=dark?[P.sage,P.clay,P.gold,'#446E5B','#254B42',P.ink]:['#D2D4AF',P.sage,'#9FAD83','#C59F68',P.clay,'#496F54',P.ink];
  for(let j=0;j<levels;j++){
    const yy=base+j*100+(1-g)*430,phase=t*.12+j*.8,wave=amp*(1+j*.1),par=sin(t*.15)*22*j;
    ctx.beginPath();ctx.moveTo(-80,1940);
    const f=x=>yy+sin(x/370+phase)*wave+cos(x/690-j*.35)*wave*.5+(mountain? -130*Math.exp(-Math.pow((x-560)/190,2)):0);
    ctx.lineTo(-100+par,f(-100));for(let x=-100;x<1200;x+=70){const y0=f(x),y1=f(x+70),m0=(f(x+10)-f(x-10))/20,m1=(f(x+80)-f(x+60))/20;ctx.bezierCurveTo(x+par+70/3,y0+m0*70/3,x+par+140/3,y1-m1*70/3,x+par+70,y1)}ctx.lineTo(1280,1990);ctx.closePath();ctx.fillStyle=cols[j%cols.length];ctx.fill();
    ctx.save();ctx.clip();ctx.globalAlpha=.16;ctx.strokeStyle=dark?P.cream:P.ink;ctx.lineWidth=1.6;
    for(let k=1;k<7;k++){ctx.beginPath();for(let x=-120;x<=1300;x+=35){const yy2=f(x)+k*19+sin(x/125+k+t*.08)*8;x===-120?ctx.moveTo(x+par,yy2):ctx.lineTo(x+par,yy2)}ctx.stroke()}ctx.restore();
  }
  ctx.restore();
}

function contours(x,y,r,age,t,dark,{count=15,aspect=.65}={}){
  const g=S(age,HEAVY);ctx.save();ctx.translate(x,y);
  for(let k=count;k>0;k--){const f=k/count,rr=r*f*g;ctx.beginPath();for(let j=0;j<=64;j++){const a=j/64*TAU,r1=rr*(1+.08*sin(a*3+t*.22+k*.17)+.035*cos(a*7-t*.2));const xx=cos(a)*r1,yy=sin(a)*r1*aspect;j===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy)}ctx.strokeStyle=k%4===0?P.gold:dark?'#70967E':'#738D71';ctx.lineWidth=k%4===0?4:1.6;ctx.stroke()}
  ctx.restore();
}

function cloud(x,y,size,age,t,dark,seed=0){
  const g=S(age,DEFAULT);ctx.save();ctx.translate(x+sin(t*.24+seed)*25,y);ctx.scale(size*g,size*g);
  ctx.beginPath();ctx.moveTo(-190,40);ctx.bezierCurveTo(-230,-10,-185,-72,-131,-66);ctx.bezierCurveTo(-110,-148,-16,-154,15,-93);ctx.bezierCurveTo(70,-149,153,-105,158,-47);ctx.bezierCurveTo(231,-55,235,55,172,69);ctx.bezierCurveTo(46,86,-91,65,-190,40);ctx.closePath();
  ctx.save();shadow();ctx.fillStyle=dark?P.paper:P.cream;ctx.fill();clearShadow();ctx.restore();
  ctx.strokeStyle=dark?P.sage:'#899988';ctx.lineWidth=2;ctx.stroke();
  inkPath(c=>{c.moveTo(-145,9);c.bezierCurveTo(-53,-5,88,45,165,14)},P.gold,3);ctx.restore();
}

function melody(age,t,dark,index){
  const amp=envelope(t),beat=pulse(t),g=S(age,HEAVY);
  ctx.save();ctx.translate(520,1150);
  for(let k=0;k<6;k++){
    ctx.beginPath();for(let j=0;j<=96;j++){const a=j/96*TAU,r=165+k*32+sin(a*(3+index%2)+t*.45+k*.7)*(22+amp*18),xx=cos(a)*r*g,yy=sin(a)*r*g*(1.05+.08*sin(t*.18));j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.strokeStyle=k%3===0?P.gold:dark?'#698B76':P.ink;ctx.lineWidth=k%3===0?8:2;ctx.stroke();
  }
  const ph=t*TAU*DATA.bpm/60/8;
  for(let k=0;k<8;k++){const a=k/8*TAU+ph*.12,r=(310+beat*12)*g;leaf(cos(a)*r,sin(a)*r,a+.8,.45,S(age-k*.09,SNAPPY),t,k%2?P.gold:P.clay)}
  flower(0,0,170+amp*20,age-.4,t,ph*.018);ctx.restore();
  branch(85,1850,450,age-.3,t,dark,{side:1,angle:.1,leaves:5});
}

function ribbon(age,t,dark,{brand=false}={}){
  ctx.save();const g=S(age,HEAVY),tt=t*.38;
  for(let i=0;i<3;i++){
    const dx=(i-1)*72,col=brand?['#174FE3','#B6149C','#ED1689'][i]:[P.ink,P.gold,P.clay][i];
    ctx.beginPath();ctx.moveTo(220+dx,1730+(1-g)*350);ctx.bezierCurveTo(940+dx,1510+sin(tt)*50,110+dx,1170,830+dx,930);ctx.bezierCurveTo(180+dx,1100,1040+dx,1450+cos(tt)*40,430+dx,1700);ctx.closePath();ctx.fillStyle=col;ctx.fill();
    inkPath(c=>{c.moveTo(330+dx,1695);c.bezierCurveTo(1000+dx,1420,130+dx,1190,790+dx,961)},brand?'#F7D8DE':P.paper,2);
  }ctx.restore();
}

function gazelle(age,t,dark){
  const im=images.gazelle,ww=im.width,hh=im.height,scale=1.0*S(age,HEAVY),walk=sin(age*6.4),bob=-Math.abs(walk)*12;
  terrain(age,t,dark,{levels:4,base:1510,amp:65});
  ctx.save();ctx.translate(505+sin(age*.55)*28,1300+bob);ctx.scale(scale,scale);ctx.translate(-ww*.5,-hh*.6);
  const cut=hh*.58;
  for(let n=0;n<2;n++){
    ctx.save();const pivot=n?ww*.67:ww*.22;ctx.translate(pivot,cut);ctx.rotate((n?1:-1)*walk*.028);ctx.translate(-pivot,-cut);ctx.beginPath();ctx.rect(n?ww*.5:0,cut,n?ww*.5:ww*.5,hh-cut+4);ctx.clip();ctx.drawImage(im,0,0);ctx.restore();
  }
  ctx.save();ctx.beginPath();ctx.rect(0,0,ww,cut+3);ctx.clip();ctx.drawImage(im,0,0);ctx.restore();ctx.restore();
  branch(100,1740,270,age-.18,t,dark,{side:1,leaves:4});branch(930,1830,370,age-.35,t,dark,{side:-1,leaves:5});
}

function eye(age,t,dark){
  const g=S(age,HEAVY),x=540,y=1130,rx=360*g,ry=(185+18*sin(t*.45))*g;
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(-rx,0);ctx.bezierCurveTo(-rx*.45,-ry,rx*.45,-ry,rx,0);ctx.bezierCurveTo(rx*.45,ry,-rx*.45,ry,-rx,0);ctx.fillStyle=dark?P.paper:P.ink;ctx.fill();
  ctx.strokeStyle=P.gold;ctx.lineWidth=7;ctx.stroke();disk(0,0,112*g,P.gold);disk(0,0,43*g,P.ink);
  for(let k=0;k<20;k++){const a=k/20*TAU+t*.03;line(cos(a)*54*g,sin(a)*54*g,cos(a)*101*g,sin(a)*101*g,dark?P.clay:P.paper,2)}
  ctx.restore();sun(530,1490,80,age-.25,t,dark,{rays:16,hollow:true});
  branch(200,1800,480,age-.4,t,dark,{side:1,leaves:6});
}

function brand(age,t,stage){
  const show=Math.max(0,t-114),g=S(show,HEAVY),r=DATA.logo,w=570,h=w*r.height/r.width,ox=540-w/2,oy=710;
  for(let i=0;i<r.parts.length;i++){
    const p=r.parts[i],s=S(show-.16*i,HEAVY),dy=(1-s)*(180+i*50),dx=(1-s)*(i-1)*130;
    ctx.save();ctx.translate(ox+p.x*w/r.width+dx,oy+p.y*w/r.width+dy);ctx.rotate((1-s)*(i-1)*.23);ctx.globalAlpha=clamp(s*2);ctx.drawImage(images['logo'+i],0,0,p.w*w/r.width,p.h*w/r.width);ctx.restore();
  }
  const a=clamp(S(show-.65,DEFAULT));ctx.save();ctx.globalAlpha=a;const wi=images.logoWord;ctx.drawImage(wi,540-570/2,1090+(1-a)*70,570,570*wi.height/wi.width);ctx.restore();
  if(show>.02)text('هندسة صوتية وتصميم',540,510+50*(1-S(show-.04,SNAPPY)),62,P.ink,{font:'Plex',weight:500,mask:S(show-.04,SNAPPY)});
  if(show>1.1){text('استديو الإنتاج',540,1390+30*(1-S(show-1.1,DEFAULT)),62,P.ink,{font:'Plex',weight:500,mask:S(show-1.1,DEFAULT)});text('والإبداع الفني',540,1480+30*(1-S(show-1.3,DEFAULT)),62,P.ink,{font:'Plex',weight:500,mask:S(show-1.3,DEFAULT)})}
  // Ribbons are lower than all critical text and never form a screen border.
  ctx.save();ctx.beginPath();ctx.rect(0,1630,W,290);ctx.clip();ribbon(show-.2,t,false,{brand:true});ctx.restore();
}

function lightThread(t,dark,age=10){
  const aa=clamp(S(age-.18,DEFAULT));ctx.save();ctx.globalAlpha=.75*aa;
  inkPath(c=>{c.moveTo(-80,1510);c.bezierCurveTo(220,1360+sin(t*.3)*50,760,1630+cos(t*.2)*30,1170,1390)},P.gold,3);
  const q=(t*.1)%1,x=-60+q*1240,y=1500+sin(q*TAU)*75;disk(x,y,4+envelope(t)*3,P.gold);ctx.restore();
}

function drawArt(scene,t){
  const age=Math.max(0,t-scene.start),mode=scene.mode,dark=scene.dark,g=S(age,HEAVY);material(dark);
  if(!['hook','logo','end','bridge','ribbon'].includes(mode))lightThread(t,dark,age);
  switch(mode){
    case 'hook':{
      const xx=lerp(-700,490,clamp(S(age+.10,SNAPPY)));ctx.save();ctx.translate(xx,1240);ctx.rotate(-.32);ctx.drawImage(images.nib,-650,-175,1300,410);ctx.restore();
      inkPath(c=>{c.moveTo(70,1470);c.bezierCurveTo(120,1040,950,1500,1020,1130)},P.gold,14*clamp(S(age+.1,SNAPPY)));
      flower(1000,460,350,age-.32,t,-.3);break;
    }
    case 'poet':case 'credit':{
      const aa=mode==='credit'?age+5:age;
      sun(230,1160,165,aa-.18,t,false,{rays:22,hollow:true});
      ctx.save();ctx.translate(760+sin(t*.33)*40,1380);ctx.rotate(-.35+.025*sin(t*.6));ctx.drawImage(images.nib,-450,-140,900,283);ctx.restore();
      branch(110,1850,590,aa-.6,t,false,{leaves:7});
      flower(770,1570,280,aa-1.4,t,.24);if(mode==='credit'){branch(905,1810,520,age-.8,t,false,{side:-1,leaves:6});flower(310,1430,160,age-2.2,t,-.2)}lightThread(t,false,aa);break;
    }
    case 'atlas':{
      contours(490,925,500,age,t,true,{count:18,aspect:1.12});terrain(age-.35,t,true,{base:1530,amp:90,levels:4});
      sun(760,520,98,age-1.45,t,true,{rays:20});flower(290,1350,260,age-2.8,t);break;
    }
    case 'title':{
      sun(530,1250,240,age,t,false,{rays:32});
      branch(140,1840,610,age-.6,t,false,{leaves:7});branch(910,1860,550,age-.95,t,false,{side:-1,leaves:6});
      flower(500,1610,230,age-2.7,t,.2);break;
    }
    case 'garden':{
      branch(340,1850,1050,age,t,false,{leaves:10,side:1,angle:-.09});branch(850,1810,730,age-.8,t,false,{side:-1,leaves:7});
      flower(530,930,480,age-.35,t);flower(760,1330,280,age-2.25,t,.3);flower(225,1450,190,age-3.9,t,-.3);break;
    }
    case 'orbit':{
      melody(age,t,true,1);sun(500,510,102,age-.45,t,true,{rays:18,hollow:true});
      contours(520,1140,480,age-2.8,t,true,{count:5,aspect:1.1});break;
    }
    case 'portal':{
      const open=clamp(S(age-.2,HEAVY)),xx=520,yy=1120;
      for(let i=0;i<5;i++){
        const rr=440-i*54,phase=t*.055+i*.16;
        ctx.save();ctx.translate(xx,yy);ctx.rotate(phase);ctx.beginPath();ctx.ellipse(0,0,rr,rr*(.72+.18*sin(age*.45)),0,-Math.PI*open,Math.PI*open);ctx.strokeStyle=[P.ink,P.sage,P.gold,P.clay,P.ink][i];ctx.lineWidth=18-i*2;ctx.stroke();ctx.restore();
      }
      flower(520,1120,300,age-1,t,.2);branch(140,1820,450,age-3,t,false,{leaves:6});break;
    }
    case 'melody':melody(age,t,dark,scene.lyric);break;
    case 'hills':terrain(age,t,dark,{base:1100,amp:160});sun(760,1000,90,age-.2,t,dark,{rays:18});break;
    case 'valley':{
      terrain(age,t,dark,{base:1010,amp:210});contours(500,1270,310,age-.4,t,dark,{count:10,aspect:.72});sun(795,1050,85,age-2.1,t,dark,{rays:16});break;
    }
    case 'cloud':{
      terrain(age,t,false,{base:1420,amp:72,levels:4});cloud(370,1080,1.45,age,t,false,0);cloud(765,1310,1.14,age-.5,t,false,2);cloud(260,1460,.74,age-2.65,t,false,4);
      for(let i=0;i<8;i++)line(150+i*110,1240+sin(t*.4+i)*10,120+i*110,1500,P.gold,1.6);break;
    }
    case 'gazelle':gazelle(age,t,dark);break;
    case 'dawn':eye(age,t,dark);break;
    case 'mountains':{
      terrain(age,t,false,{mountain:true,levels:7,base:1090,amp:180});sun(805,1010,135,age-.3,t,false,{rays:26,hollow:true});
      contours(520,1390,285,age-2.3,t,false,{count:8,aspect:.63});break;
    }
    case 'flowers':{
      branch(525,1870,720,age,t,true,{leaves:8});
      flower(500,1120,440,age,t,0);flower(800,1500,290,age-1.1,t,.5);flower(180,1510,310,age-2.4,t,-.35);flower(590,1760,220,age-3.8,t,.2);break;
    }
    case 'ribbon':ribbon(age,t,false);flower(790,980,260,age-.35,t,.4);break;
    case 'morning':{
      sun(530,1180,230,age,t,false,{rays:30});
      for(let i=0;i<6;i++){const yy=1440+i*49;inkPath(c=>{c.moveTo(80,yy);c.bezierCurveTo(340,yy-70*sin(t*.2+i),750,yy+70*sin(t*.2+i),1040,yy)},i%2?P.ink:P.gold,i%3?2:5)}
      branch(900,1870,610,age-2.5,t,false,{side:-1,leaves:7});break;
    }
    case 'beauty':{
      const rr=210*g;ellipse(345,1150,rr,rr*.8,P.clay,.15);ellipse(740,1250,rr,rr*.8,P.gold,-.18);
      flower(510,1190,430,age-.2,t,.1);branch(200,1850,500,age-1.4,t,true,{leaves:6});branch(900,1900,520,age-2.8,t,true,{side:-1,leaves:6});break;
    }
    case 'sunrise':{
      sun(530,1170,245,age,t,false,{rays:32,smile:true});terrain(age-.3,t,false,{base:1520,amp:80,levels:4});flower(220,1520,240,age-2.1,t,-.2);break;
    }
    case 'branches':{
      for(let i=0;i<5;i++)branch(160+i*175,1890,720+(i%2)*220,age-i*.2,t,true,{side:i%2?1:-1,angle:(i-2)*.025,leaves:8});
      flower(690,1120,250,age-1.6,t,.2);break;
    }
    case 'bridge':ribbon(age,t,false,{brand:true});flower(270,1080,310,age,t,-.3);break;
    case 'logo':case 'end':brand(age,t,mode);break;
  }
}

function introText(scene,t){
  const a=t-scene.start,c=color(scene.dark);
  if(scene.mode==='hook'){
    text('حين',470,690+65*(1-S(a+.03,SNAPPY)),310,P.cream,{mask:S(a+.03,SNAPPY),scale:.88+.12*S(a+.03,SNAPPY),maxWidth:710});
    text('يُزهر الشعر',520,935+80*(1-S(a-.18,HEAVY)),222,P.gold,{mask:S(a-.18,HEAVY),maxWidth:790});
  }else if(['poet','credit'].includes(scene.mode)){
    const aa=scene.mode==='credit'?a+5:a;
    text('من كلمات الشاعر الأنيق',530,405+50*(1-S(aa-.08,DEFAULT)),62,c,{font:'Plex',weight:500,mask:S(aa-.08,DEFAULT)});
    text('نزار',500,710+65*(1-S(aa-.16,HEAVY)),366,c,{mask:S(aa-.16,HEAVY),depth:true,maxWidth:730});
    text('القدسي',540,1015+80*(1-S(aa-.35,HEAVY)),295,c,{mask:S(aa-.35,HEAVY),depth:true,maxWidth:820});
    if(aa>2.4){inkPath(c=>{c.moveTo(280,1070);c.bezierCurveTo(400,1100,750,1020,820,1080)},P.clay,6)}
  }else if(scene.mode==='title'){
    text('في عيون',500,545+65*(1-S(a,HEAVY)),142,c,{mask:S(a,HEAVY),maxWidth:790});
    text('الضحى',545,835+65*(1-S(a-.18,HEAVY)),300,c,{mask:S(a-.18,HEAVY),depth:true,maxWidth:820});
  }
}

const phraseParts=[null,null,null,['فوق','ثغر الربا'],['بين','صفو التلال'],['تحت ظل','السحاب'],['حيث مرعى','الغزال'],['في عيون','الضحى'],['أو صدور','الجبال'],['أو عناق','الزهور'],['فوق خصر','الدلال'],['حيث غنى','الصباح'],['في خدود','الجمال'],['والشروق','يبتسم'],['للغصون','الطوال']];
function lyricText(scene,t){
  if(scene.lyric===undefined)return;
  const l=DATA.lyrics[scene.lyric],a=t-l.start,remaining=l.end-t,c=color(scene.dark);
  // Text appears at the exact phrase boundary, never before it; no overlapping swaps.
  const exit=remaining<.14?clamp(remaining/.14):1;
  if(scene.lyric<3){
    const rows=l.text.split('\n'),f=scene.lyric===2?108:scene.lyric===0?132:182;
    rows.forEach((str,i)=>text(str,520,560+i*115+35*(1-S(a-.045*i,SNAPPY)),f,c,{font:'Plex',weight:500,maxWidth:800,mask:S(a-.045*i,SNAPPY),alpha:exit}));
    return;
  }
  const parts=phraseParts[scene.lyric],x=scene.lyric%3===0?510:scene.lyric%3===1?545:530;
  text(parts[0],x,505+45*(1-S(a,SNAPPY)),103,c,{font:'Plex',weight:500,mask:S(a,SNAPPY),alpha:exit,maxWidth:790});
  const heroColor=scene.dark?P.gold:P.ink;
  text(parts[1],x,758+70*(1-S(a-.065,HEAVY)),scene.lyric===3?224:268,heroColor,{mask:S(a-.065,HEAVY),alpha:exit,scale:.96+.04*S(a-.065,HEAVY),depth:!scene.dark,maxWidth:820});
  // A single material underline reacts to the actual music, not letter-by-letter deformation.
  const len=230+170*clamp(S(a-.24,SNAPPY)),yy=804;
  inkPath(c=>{c.moveTo(x-len/2,yy);c.bezierCurveTo(x-65,yy+14*envelope(t),x+65,yy-12*envelope(t),x+len/2,yy)},scene.dark?P.clay:P.gold,3);
}

function chooseScene(t){return DATA.scenes.findIndex(s=>t>=s.start&&t<s.end)}
window.seek=function(time){
  const t=Math.min(119.999999,Math.max(0,Number(time)||0));bounds=[];
  const index=chooseScene(t),scene=DATA.scenes[Math.max(0,index)],age=t-scene.start;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.direction='rtl';clearShadow();
  // Shape-driven reveal, not a slideshow crossfade. There is one visible scene per pixel.
  if(index>0&&age<.48&&!['credit','end'].includes(scene.mode)){
    const prev=DATA.scenes[index-1];drawArt(prev,prev.end-.001);
    const q=ease(age/.48),edge=W*(1-q);
    const wipe=()=>{ctx.beginPath();ctx.moveTo(W+50,-50);ctx.lineTo(edge+80,-50);ctx.bezierCurveTo(edge-100,520,edge+150,1150,edge-40,H+50);ctx.lineTo(W+50,H+50);ctx.closePath()};
    ctx.save();wipe();ctx.clip();drawArt(scene,t);ctx.restore();
    const alternate={...scene,dark:prev.dark};introText(alternate,t);lyricText(alternate,t);
    ctx.save();wipe();ctx.clip();introText(scene,t);lyricText(scene,t);ctx.restore();
    bounds=bounds.filter((b,i,arr)=>arr.findIndex(v=>v.text===b.text&&v.x===b.x&&v.y===b.y)===i);
  }else {drawArt(scene,t);introText(scene,t);lyricText(scene,t)}
  window.renderState={time:t,scene:index+1,mode:scene.mode,lyric:scene.lyric===undefined?null:DATA.lyrics[scene.lyric].text,bounds:bounds.map(b=>({...b})),envelope:envelope(t),pulse:pulse(t)};
  return window.renderState;
};

async function init(){
  const jobs=[image('flower','assets/flower.webp'),image('gazelle','assets/gazelle.webp'),image('nib','assets/nib.webp'),image('paper','assets/paper.webp'),image('logoWord','assets/logo-word.webp'),image('logoMark','assets/logo-mark.webp')];
  DATA.logo.parts.forEach((part,i)=>jobs.push(image('logo'+i,'assets/'+part.file)));
  await Promise.all(jobs);await document.fonts.ready;
  await Promise.all([document.fonts.load('700 160px Amiri','نزار القدسي'),document.fonts.load('500 100px Plex','في عيون الضحى')]);
  for(const dark of [false,true]){
    const c=document.createElement('canvas');c.width=W;c.height=H;const cx=c.getContext('2d');cx.fillStyle=dark?P.ink:P.paper;cx.fillRect(0,0,W,H);cx.globalAlpha=dark?.018:.047;cx.globalCompositeOperation=dark?'screen':'multiply';cx.fillStyle=cx.createPattern(images.paper,'repeat');cx.fillRect(0,0,W,H);backgrounds[dark?'dark':'paper']=c;
  }
  const im=images.flower,cx=im.width*.5,cy=im.height*.54;
  for(let i=0;i<5;i++){
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const p=c.getContext('2d');const a=-Math.PI/2+i*TAU/5;
    p.beginPath();p.moveTo(cx,cy);p.arc(cx,cy,im.width*1.4,a-Math.PI/5-.012,a+Math.PI/5+.012);p.closePath();p.clip();p.drawImage(im,0,0);petals.push(c);
  }
  window.filmData=DATA;window.seek(0);window.filmReady=true;
}
window.filmReady=false;
init().catch(error=>{window.filmError=String(error);console.error(error)});
