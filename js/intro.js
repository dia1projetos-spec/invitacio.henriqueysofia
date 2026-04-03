(function(){
'use strict';

const canvas = document.getElementById('intro-canvas');
const ctx = canvas.getContext('2d');
let W, H, raf;

// ── STARS ───────────────────────────────────────────────────────────────
let stars = [];
function buildStars(){
  stars = [];
  const n = Math.floor(W*H/4500);
  for(let i=0;i<n;i++) stars.push({
    x:Math.random()*W, y:Math.random()*H*0.9,
    r:Math.random()*1.3+0.2,
    a:Math.random()*0.7+0.3,
    ph:Math.random()*Math.PI*2,
    sp:Math.random()*0.8+0.4
  });
}
function drawStars(t){
  stars.forEach(s=>{
    const tw=0.5+0.5*Math.sin(t*0.001*s.sp+s.ph);
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${s.a*tw})`;
    ctx.fill();
  });
}

// ── SOUTH AMERICA SILHOUETTE ────────────────────────────────────────────
// Carefully crafted normalized coords [0..1]
const SA = [
  [.500,.020],[.518,.018],[.540,.022],[.558,.030],[.572,.042],[.590,.050],
  [.612,.056],[.635,.062],[.655,.070],[.672,.082],[.688,.096],[.700,.112],
  [.714,.128],[.724,.146],[.736,.162],[.748,.180],[.758,.200],[.764,.220],
  [.772,.240],[.778,.262],[.782,.282],[.786,.302],[.792,.322],[.798,.342],
  [.806,.362],[.816,.380],[.826,.398],[.836,.416],[.844,.436],[.850,.458],
  [.856,.480],[.860,.502],[.862,.524],[.862,.546],[.860,.568],[.856,.590],
  [.850,.610],[.842,.630],[.832,.650],[.820,.668],[.806,.684],[.790,.698],
  [.772,.712],[.754,.724],[.736,.736],[.716,.746],[.696,.754],[.674,.760],
  [.652,.764],[.630,.768],[.608,.772],[.586,.778],[.566,.784],[.546,.792],
  [.528,.802],[.512,.814],[.498,.828],[.486,.842],[.474,.858],[.464,.872],
  [.456,.886],[.450,.900],[.445,.916],[.442,.930],[.440,.944],[.438,.954],
  [.436,.962],[.432,.968],[.427,.972],[.420,.974],[.412,.972],[.404,.966],
  [.396,.958],[.388,.948],[.380,.936],[.372,.922],[.364,.906],[.358,.890],
  [.352,.872],[.346,.854],[.340,.834],[.334,.814],[.328,.794],[.322,.772],
  [.316,.750],[.310,.728],[.304,.706],[.298,.682],[.292,.658],[.286,.634],
  [.280,.610],[.275,.586],[.270,.562],[.265,.538],[.260,.514],[.256,.490],
  [.252,.466],[.250,.442],[.248,.418],[.248,.394],[.249,.370],[.251,.346],
  [.254,.322],[.258,.300],[.263,.278],[.269,.258],[.276,.238],[.283,.220],
  [.291,.202],[.300,.186],[.310,.170],[.321,.156],[.333,.142],[.346,.130],
  [.360,.118],[.374,.108],[.389,.098],[.404,.090],[.420,.082],[.436,.074],
  [.452,.068],[.467,.062],[.480,.055],[.490,.044],[.496,.033],[.500,.020]
];

function toXY(nx,ny){ 
  const px=0.08, py=0.06;
  return { x: px*W + nx*W*(1-px*2), y: py*H + ny*H*(1-py*2) }; 
}

function drawContinent(alpha){
  ctx.save(); ctx.globalAlpha=alpha;
  const pts = SA.map(([nx,ny])=>toXY(nx,ny));
  
  // Fill with gradient
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.closePath();
  const gf=ctx.createLinearGradient(W*.25,H*.02,W*.86,H*.97);
  gf.addColorStop(0,'rgba(14,30,60,0.95)');
  gf.addColorStop(0.5,'rgba(18,38,72,0.95)');
  gf.addColorStop(1,'rgba(22,46,82,0.95)');
  ctx.fillStyle=gf; ctx.fill();
  
  // Border glow
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.closePath();
  ctx.strokeStyle='rgba(80,130,200,0.4)';
  ctx.lineWidth=1.8; ctx.stroke();
  
  // Inner subtle grid
  ctx.save();
  ctx.clip();
  ctx.setLineDash([1,10]);
  ctx.strokeStyle='rgba(80,130,200,0.08)';
  ctx.lineWidth=1;
  for(let i=0;i<10;i++){
    const y=H*(0.05+i*0.1);
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    const x=W*(0.05+i*0.1);
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  ctx.restore();
}

// ── CITY MARKERS ────────────────────────────────────────────────────────
const BRAZIL    = {nx:0.66, ny:0.36, flag:'🇧🇷', name:'Brasil'};
const ARGENTINA = {nx:0.43, ny:0.76, flag:'🇦🇷', name:'Argentina'};

function drawMarker(nx,ny,flag,name,alpha,pulse){
  const {x,y}=toXY(nx,ny);
  ctx.save(); ctx.globalAlpha=alpha;
  
  // Halo rings
  const r1=10+pulse*8, r2=20+pulse*12;
  let g=ctx.createRadialGradient(x,y,0,x,y,r2);
  g.addColorStop(0,'rgba(201,168,76,0.3)');
  g.addColorStop(1,'rgba(201,168,76,0)');
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(x,y,r2,0,Math.PI*2); ctx.fill();
  
  ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(201,168,76,0.9)'; ctx.shadowBlur=14;
  ctx.fill();
  
  ctx.beginPath(); ctx.arc(x,y,r1,0,Math.PI*2);
  ctx.strokeStyle=`rgba(201,168,76,${0.5*(1-pulse)})`;
  ctx.lineWidth=1.5; ctx.stroke();
  
  // Label
  const fs=Math.max(11,W*0.024);
  ctx.font=`600 ${fs}px 'Cinzel',serif`;
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.9)';
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.fillText(flag+' '+name, x, y-16);
  ctx.restore();
}

// ── FLIGHT PATH (cubic bezier) ───────────────────────────────────────────
// Brazil → high arc → loop heart mid-air → Argentina
const CP0 = BRAZIL;
const CP1 = {nx:0.32, ny:0.16}; // high left arc
const CP2 = {nx:0.22, ny:0.52};
const CP3 = ARGENTINA;

function cubicBez(t,p0,p1,p2,p3){
  const mt=1-t;
  return {
    nx: mt*mt*mt*p0.nx + 3*mt*mt*t*p1.nx + 3*mt*t*t*p2.nx + t*t*t*p3.nx,
    ny: mt*mt*mt*p0.ny + 3*mt*mt*t*p1.ny + 3*mt*t*t*p2.ny + t*t*t*p3.ny
  };
}
function cubicBezTan(t,p0,p1,p2,p3){
  const mt=1-t;
  return {
    nx: 3*mt*mt*(p1.nx-p0.nx)+6*mt*t*(p2.nx-p1.nx)+3*t*t*(p3.nx-p2.nx),
    ny: 3*mt*mt*(p1.ny-p0.ny)+6*mt*t*(p2.ny-p1.ny)+3*t*t*(p3.ny-p2.ny)
  };
}

// Heart drawn around center at t=0.40..0.78
const HEART_T0=0.40, HEART_T1=0.78;
const HEART_CX=0.46, HEART_CY=0.54;
const HEART_R=0.085;

function heartPt(a){ // a=0..2π
  const s=Math.sin(a);
  const hx=16*s*s*s;
  const hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));
  const c=toXY(HEART_CX,HEART_CY);
  const r=HEART_R*Math.min(W,H);
  return {x:c.x+hx*r/16, y:c.y+hy*r/16};
}

function getState(p){ // p=0..1 overall progress
  if(p<HEART_T0){
    const t=p/HEART_T0 * HEART_T0; // remap
    const bp=cubicBez(p/HEART_T0*HEART_T0,CP0,CP1,CP2,CP3); // wrong, fix:
    const bpos=cubicBez(p,CP0,CP1,CP2,CP3);
    const btan=cubicBezTan(p,CP0,CP1,CP2,CP3);
    const xy=toXY(bpos.nx,bpos.ny);
    const angle=Math.atan2(btan.ny,btan.nx);
    return {x:xy.x,y:xy.y,angle,phase:'fly',hp:0};
  } else if(p<HEART_T1){
    const hp=(p-HEART_T0)/(HEART_T1-HEART_T0); // 0..1
    const a=hp*Math.PI*2-Math.PI/2;
    const a2=(hp+0.008)*Math.PI*2-Math.PI/2;
    const pos=heartPt(a);
    const pos2=heartPt(a2);
    const angle=Math.atan2(pos2.y-pos.y,pos2.x-pos.x);
    return {x:pos.x,y:pos.y,angle,phase:'heart',hp};
  } else {
    const t=(p-HEART_T1)/(1-HEART_T1);
    const bpos=cubicBez(HEART_T1+t*(1-HEART_T1),CP0,CP1,CP2,CP3);
    const btan=cubicBezTan(HEART_T1+t*(1-HEART_T1),CP0,CP1,CP2,CP3);
    const xy=toXY(bpos.nx,bpos.ny);
    const angle=Math.atan2(btan.ny,btan.nx);
    return {x:xy.x,y:xy.y,angle,phase:'land',hp:1};
  }
}

// ── REALISTIC AIRPLANE DRAWING ───────────────────────────────────────────
function drawPlane(x,y,angle,scale,bankAngle){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  
  const s=Math.max(16,Math.min(W,H)*0.038)*scale;
  // banking: skew transform
  ctx.transform(1,0,Math.sin(bankAngle)*0.3,Math.cos(bankAngle*0.5),0,0);
  
  ctx.shadowColor='rgba(255,220,150,0.7)';
  ctx.shadowBlur=20;
  
  // FUSELAGE - tapered tube
  ctx.beginPath();
  // Nose
  ctx.moveTo(s*1.6,0);
  // Upper fuselage
  ctx.bezierCurveTo(s*1.2,-s*0.12, s*0.4,-s*0.18, -s*0.5,-s*0.18);
  ctx.bezierCurveTo(-s*0.9,-s*0.18, -s*1.2,-s*0.14, -s*1.5,-s*0.08);
  // Tail cone
  ctx.lineTo(-s*1.8,0);
  // Lower fuselage (mirror)
  ctx.lineTo(-s*1.5,s*0.08);
  ctx.bezierCurveTo(-s*1.2,s*0.14, -s*0.9,s*0.18, -s*0.5,s*0.18);
  ctx.bezierCurveTo(s*0.4,s*0.18, s*1.2,s*0.12, s*1.6,0);
  ctx.closePath();
  const fg=ctx.createLinearGradient(s*1.6,-s*0.18,s*1.6,s*0.18);
  fg.addColorStop(0,'rgba(230,235,245,1)');
  fg.addColorStop(0.3,'rgba(255,255,255,1)');
  fg.addColorStop(0.7,'rgba(210,218,230,1)');
  fg.addColorStop(1,'rgba(180,190,205,1)');
  ctx.fillStyle=fg; ctx.fill();
  
  // COCKPIT windows
  ctx.beginPath();
  ctx.ellipse(s*1.1,-s*0.06,s*0.2,s*0.1,0,0,Math.PI*2);
  ctx.fillStyle='rgba(140,200,255,0.85)';
  ctx.shadowBlur=4; ctx.fill();
  
  // MAIN WINGS - swept
  ctx.beginPath();
  ctx.moveTo(s*0.3,-s*0.1);
  ctx.bezierCurveTo(s*0.1,-s*0.6, -s*0.4,-s*1.4, -s*0.7,-s*1.6);
  ctx.lineTo(-s*1.0,-s*1.6);
  ctx.bezierCurveTo(-s*0.8,-s*1.2, -s*0.3,-s*0.5, -s*0.1,-s*0.18);
  ctx.closePath();
  const wg=ctx.createLinearGradient(s*0.3,-s*0.1,-s*1.0,-s*1.6);
  wg.addColorStop(0,'rgba(220,225,235,1)');
  wg.addColorStop(1,'rgba(180,188,205,1)');
  ctx.fillStyle=wg; ctx.fill();
  ctx.strokeStyle='rgba(150,160,180,0.5)'; ctx.lineWidth=0.5; ctx.stroke();
  
  // Wing mirror (below)
  ctx.beginPath();
  ctx.moveTo(s*0.3,s*0.1);
  ctx.bezierCurveTo(s*0.1,s*0.6, -s*0.4,s*1.4, -s*0.7,s*1.6);
  ctx.lineTo(-s*1.0,s*1.6);
  ctx.bezierCurveTo(-s*0.8,s*1.2, -s*0.3,s*0.5, -s*0.1,s*0.18);
  ctx.closePath();
  ctx.fillStyle=wg; ctx.fill();
  ctx.strokeStyle='rgba(150,160,180,0.5)'; ctx.lineWidth=0.5; ctx.stroke();
  
  // WINGLETS (tips) 
  ctx.save();
  ctx.translate(-s*0.85,-s*1.58);
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-s*0.05,-s*0.22); ctx.lineTo(s*0.1,-s*0.18); ctx.lineTo(s*0.08,0);
  ctx.closePath(); ctx.fillStyle='rgba(192,50,60,0.9)'; ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(-s*0.85,s*1.58);
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(-s*0.05,s*0.22); ctx.lineTo(s*0.1,s*0.18); ctx.lineTo(s*0.08,0);
  ctx.closePath(); ctx.fillStyle='rgba(192,50,60,0.9)'; ctx.fill();
  ctx.restore();
  
  // HORIZONTAL STABILIZER (tail wings)
  ctx.beginPath();
  ctx.moveTo(-s*1.3,-s*0.05);
  ctx.bezierCurveTo(-s*1.4,-s*0.2,-s*1.55,-s*0.55,-s*1.6,-s*0.7);
  ctx.lineTo(-s*1.75,-s*0.7);
  ctx.bezierCurveTo(-s*1.7,-s*0.45,-s*1.55,-s*0.2,-s*1.45,-s*0.08);
  ctx.closePath();
  ctx.fillStyle='rgba(215,220,230,1)'; ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-s*1.3,s*0.05);
  ctx.bezierCurveTo(-s*1.4,s*0.2,-s*1.55,s*0.55,-s*1.6,s*0.7);
  ctx.lineTo(-s*1.75,s*0.7);
  ctx.bezierCurveTo(-s*1.7,s*0.45,-s*1.55,s*0.2,-s*1.45,s*0.08);
  ctx.closePath();
  ctx.fillStyle='rgba(215,220,230,1)'; ctx.fill();
  
  // VERTICAL STABILIZER
  ctx.beginPath();
  ctx.moveTo(-s*1.3,0);
  ctx.bezierCurveTo(-s*1.35,-s*0.15,-s*1.45,-s*0.5,-s*1.48,-s*0.75);
  ctx.lineTo(-s*1.65,-s*0.75);
  ctx.bezierCurveTo(-s*1.6,-s*0.4,-s*1.5,-s*0.15,-s*1.42,0);
  ctx.closePath();
  ctx.fillStyle='rgba(192,50,60,0.85)'; ctx.fill();
  
  // ENGINE pods (below wings)
  [-s*0.48, s*0.48].forEach(wy=>{
    ctx.save();
    ctx.translate(s*0.05, wy);
    ctx.beginPath();
    ctx.ellipse(-s*0.08,0,s*0.28,s*0.1,0,0,Math.PI*2);
    ctx.fillStyle='rgba(60,65,80,0.9)'; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-s*0.2,0,s*0.1,s*0.07,0,0,Math.PI*2);
    ctx.fillStyle='rgba(30,35,50,0.95)'; ctx.fill();
    ctx.restore();
  });
  
  // Fuselage stripe (color band)
  ctx.beginPath();
  ctx.moveTo(s*1.0,-s*0.17);
  ctx.lineTo(-s*1.3,-s*0.14);
  ctx.lineTo(-s*1.3,s*0.14);
  ctx.lineTo(s*1.0,s*0.17);
  ctx.strokeStyle='rgba(192,50,60,0.6)'; ctx.lineWidth=s*0.06;
  ctx.stroke();
  
  // Windows row
  for(let i=0;i<6;i++){
    ctx.beginPath();
    ctx.ellipse(s*(0.7-i*0.25),-s*0.06,s*0.06,s*0.08,0,0,Math.PI*2);
    ctx.fillStyle='rgba(160,215,255,0.7)'; ctx.fill();
  }
  
  ctx.restore();
}

// ── ENGINE TRAILS ──────────────────────────────────────────────────────
let trail=[], heartPts=[];

function drawTrail(){
  if(trail.length<2)return;
  ctx.save();
  for(let i=1;i<trail.length;i++){
    const r=i/trail.length;
    const p=trail[i],pp=trail[i-1];
    ctx.beginPath(); ctx.moveTo(pp.x,pp.y); ctx.lineTo(p.x,p.y);
    ctx.strokeStyle=`rgba(180,200,255,${r*0.35})`;
    ctx.lineWidth=1+r*1.5;
    ctx.shadowColor='rgba(180,200,255,0.3)'; ctx.shadowBlur=4;
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(){
  if(heartPts.length<3)return;
  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';
  // Outer glow
  ctx.shadowColor='rgba(220,40,70,1)'; ctx.shadowBlur=24;
  ctx.strokeStyle='rgba(220,40,70,0.4)'; ctx.lineWidth=10;
  ctx.beginPath(); ctx.moveTo(heartPts[0].x,heartPts[0].y);
  heartPts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
  // Mid
  ctx.shadowBlur=12; ctx.strokeStyle='rgba(240,60,90,0.85)'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(heartPts[0].x,heartPts[0].y);
  heartPts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
  // Core
  ctx.shadowBlur=0; ctx.strokeStyle='rgba(255,180,200,0.95)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(heartPts[0].x,heartPts[0].y);
  heartPts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
  // Sparks
  const now=Date.now();
  heartPts.forEach((p,i)=>{
    if(i%8===0){
      const sp=0.5+0.5*Math.sin(now*0.007+i*0.4);
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5*sp+0.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,210,220,${sp*0.9})`; ctx.fill();
    }
  });
  ctx.restore();
}

// ── LABELS / TEXT ──────────────────────────────────────────────────────
function drawLabel(txt,x,y,alpha,size){
  ctx.save(); ctx.globalAlpha=alpha; ctx.textAlign='center';
  ctx.font=`400 ${size||Math.max(11,W*0.023)}px 'Cinzel',serif`;
  ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=10;
  ctx.fillStyle='rgba(201,168,76,0.95)';
  ctx.fillText(txt,x,y);
  ctx.restore();
}

function drawFinalNames(alpha){
  if(alpha<=0)return;
  ctx.save(); ctx.globalAlpha=alpha; ctx.textAlign='center';
  const fs=Math.max(28,W*0.09);
  ctx.font=`300 italic ${fs}px 'Cormorant Garamond',serif`;
  ctx.shadowColor='rgba(220,50,80,0.9)'; ctx.shadowBlur=40;
  ctx.fillStyle='#fff';
  ctx.fillText('Henrique & Sofia',W/2,H*0.86);
  ctx.font=`400 ${Math.max(9,W*0.02)}px 'Cinzel',serif`;
  ctx.fillStyle='rgba(201,168,76,0.9)'; ctx.shadowBlur=8;
  ctx.fillText('NOS CASAMOS · 24 DE ABRIL',W/2,H*0.86+fs*0.62);
  ctx.restore();
}

// ── BACKGROUND ─────────────────────────────────────────────────────────
function drawBG(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#010609');
  g.addColorStop(0.5,'#030e1e');
  g.addColorStop(1,'#071426');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // subtle horizon
  const hg=ctx.createRadialGradient(W*0.5,H*0.7,0,W*0.5,H*0.7,W*0.7);
  hg.addColorStop(0,'rgba(92,17,34,0.12)');
  hg.addColorStop(1,'rgba(92,17,34,0)');
  ctx.fillStyle=hg; ctx.fillRect(0,0,W,H);
}

// ── TIMING ─────────────────────────────────────────────────────────────
const T_TOTAL  = 8200;
const T_MAP    = 700;
const T_DOTS   = 1200;
const T_FLY    = 1800;  // plane starts
const T_ARRIVE = 7000;  // plane stops
const T_NAMES  = 6400;
const T_EXIT   = 7600;

let t0=null, prevProg=-1, bankV=0;

function loop(ts){
  if(!t0) t0=ts;
  const el=ts-t0;
  ctx.clearRect(0,0,W,H);
  drawBG();
  drawStars(ts);
  
  const mapAlpha=Math.min(1,el/T_MAP);
  drawContinent(mapAlpha);
  
  // Brazil always visible after T_DOTS
  const brA=Math.min(1,Math.max(0,(el-T_DOTS)/400));
  const brPulse=(0.5+0.5*Math.sin(ts*0.003))*(1-brA*0.3);
  if(brA>0) drawMarker(BRAZIL.nx,BRAZIL.ny,BRAZIL.flag,BRAZIL.name,brA,brPulse);
  
  // Argentina appears near end of flight
  const arA=Math.min(1,Math.max(0,(el-(T_ARRIVE-1400))/500));
  const arPulse=0.5+0.5*Math.sin(ts*0.003+1);
  if(arA>0) drawMarker(ARGENTINA.nx,ARGENTINA.ny,ARGENTINA.flag,ARGENTINA.name,arA,arPulse);
  
  // top label
  const lbA=Math.min(1,el/1200)*(1-Math.max(0,(el-T_EXIT)/500));
  if(lbA>0) drawLabel('UN AMOR SIN FRONTERAS',W/2,H*0.055,lbA,Math.max(10,W*0.025));
  
  // Plane flight
  if(el>=T_FLY && el<=T_ARRIVE+400){
    const raw=Math.min(1,(el-T_FLY)/(T_ARRIVE-T_FLY));
    // Ease in-out
    const prog=raw<0.5?2*raw*raw:1-Math.pow(-2*raw+2,2)/2;
    
    // Banking: derivative of angle change
    const st=getState(prog);
    const st2=getState(Math.min(1,prog+0.005));
    const dAngle=st2.angle-st.angle;
    bankV=bankV*0.85+dAngle*18; // smooth bank
    const bank=Math.max(-0.6,Math.min(0.6,bankV));
    
    // Accumulate points
    if(st.phase==='heart'){
      if(!heartPts.length||Math.hypot(st.x-heartPts[heartPts.length-1].x,st.y-heartPts[heartPts.length-1].y)>1.5)
        heartPts.push({x:st.x,y:st.y});
    } else {
      if(!trail.length||Math.hypot(st.x-trail[trail.length-1].x,st.y-trail[trail.length-1].y)>2)
        trail.push({x:st.x,y:st.y});
      if(trail.length>180) trail.shift();
    }
    
    drawTrail();
    drawHeart();
    
    const pScale=el>T_ARRIVE?Math.max(0,1-(el-T_ARRIVE)/400):1;
    if(pScale>0) drawPlane(st.x,st.y,st.angle,pScale,bank);
    
  } else if(el>T_ARRIVE+400){
    drawTrail(); drawHeart();
  }
  
  // Names
  const nmA=el>T_NAMES?Math.min(1,(el-T_NAMES)/700):0;
  drawFinalNames(nmA);
  
  // Exit fade
  if(el>T_EXIT){
    const ex=Math.min(1,(el-T_EXIT)/600);
    ctx.fillStyle=`rgba(1,6,9,${ex})`;
    ctx.fillRect(0,0,W,H);
    if(ex>=1){
      document.getElementById('intro').classList.add('out');
      document.getElementById('main').classList.add('in');
      cancelAnimationFrame(raf); return;
    }
  }
  
  raf=requestAnimationFrame(loop);
}

function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
function init(){ resize(); buildStars(); window.addEventListener('resize',()=>{resize();buildStars();}); raf=requestAnimationFrame(loop); }
window.addEventListener('DOMContentLoaded',init);
})();
