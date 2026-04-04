(function(){
'use strict';
const C = document.getElementById('ic');
const ctx = C.getContext('2d');
let W,H,raf,t0;

// Stars
let stars=[];
function mkStars(){
  stars=[];
  for(let i=0;i<Math.min(220,W*H/5000);i++)
    stars.push({x:Math.random()*W,y:Math.random()*H*.88,r:Math.random()*1.3+.2,a:Math.random()*.8+.2,ph:Math.random()*6.28,sp:Math.random()+.5});
}
function drawStars(ts){
  stars.forEach(s=>{
    const tw=.45+.55*Math.abs(Math.sin(ts*.001*s.sp+s.ph));
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);
    ctx.fillStyle=`rgba(255,255,255,${s.a*tw})`;ctx.fill();
  });
}

// South America outline (normalized 0-1)
const SA=[[.50,.02],[.52,.02],[.54,.02],[.56,.03],[.58,.04],[.60,.05],[.62,.06],[.64,.07],[.66,.09],[.68,.11],[.70,.13],[.72,.16],[.74,.19],[.76,.22],[.78,.26],[.80,.30],[.82,.34],[.84,.38],[.86,.43],[.87,.48],[.87,.53],[.86,.58],[.85,.63],[.83,.68],[.80,.72],[.77,.76],[.73,.80],[.69,.83],[.65,.86],[.61,.89],[.57,.92],[.53,.94],[.49,.96],[.45,.97],[.42,.96],[.39,.94],[.36,.91],[.33,.87],[.31,.83],[.29,.78],[.28,.73],[.27,.68],[.26,.63],[.25,.57],[.25,.51],[.25,.46],[.26,.41],[.27,.36],[.28,.31],[.29,.26],[.31,.22],[.33,.18],[.36,.14],[.39,.11],[.42,.08],[.45,.06],[.48,.04],[.50,.02]];
function p(nx,ny){return{x:.08*W+nx*W*.84,y:.06*H+ny*H*.88};}
function drawMap(al){
  ctx.save();ctx.globalAlpha=al;
  const pts=SA.map(([nx,ny])=>p(nx,ny));
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
  pts.forEach(q=>ctx.lineTo(q.x,q.y));ctx.closePath();
  const g=ctx.createLinearGradient(W*.25,0,W*.87,H);
  g.addColorStop(0,'rgba(12,28,56,.97)');g.addColorStop(1,'rgba(18,38,70,.97)');
  ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(70,120,200,.3)';ctx.lineWidth=1.5;ctx.stroke();
  // subtle inner grid
  ctx.save();ctx.clip();
  ctx.setLineDash([1,9]);ctx.strokeStyle='rgba(70,120,200,.07)';ctx.lineWidth=1;
  for(let i=0;i<9;i++){const y=H*(.06+i*.11);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.setLineDash([]);ctx.restore();
  ctx.restore();
}

// City markers
function dot(nx,ny,flag,label,al,pulse){
  const {x,y}=p(nx,ny);
  ctx.save();ctx.globalAlpha=al;
  const g2=ctx.createRadialGradient(x,y,0,x,y,22);
  g2.addColorStop(0,'rgba(201,168,76,.45)');g2.addColorStop(1,'rgba(201,168,76,0)');
  ctx.fillStyle=g2;ctx.beginPath();ctx.arc(x,y,22,0,6.28);ctx.fill();
  ctx.beginPath();ctx.arc(x,y,5,0,6.28);ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(201,168,76,.9)';ctx.shadowBlur=12;ctx.fill();
  ctx.beginPath();ctx.arc(x,y,9+pulse*7,0,6.28);
  ctx.strokeStyle=`rgba(201,168,76,${.5*(1-pulse)})`;ctx.lineWidth=1.5;ctx.stroke();
  const fs=Math.max(10,W*.022);
  ctx.font=`600 ${fs}px 'Cinzel',serif`;
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.shadowBlur=8;ctx.shadowColor='rgba(0,0,0,.9)';
  ctx.fillText(flag+' '+label,x,y-16);
  ctx.restore();
}

// ── COUPLE SVG-style drawn with canvas ─────────────────────────────────
// Fully animated: walk in, turn to face each other, heart floats up
function drawCouple(cx,cy,scale,phase,phaseT){
  // phase: 0=walk-in  1=face-each-other  2=heart
  const s=scale;
  ctx.save();ctx.translate(cx,cy);

  // ── HER (left) ────────────────────────────────────────────────────────
  const hOffset = phase===0 ? (-W*.6*(1-phaseT)) : 0;
  const hScale  = 1;
  ctx.save();ctx.translate(hOffset,0);

  // Dress (white flowing)
  ctx.beginPath();
  ctx.moveTo(-s*.18,-s*.55);
  ctx.bezierCurveTo(-s*.25,-s*.3,-s*.38,s*.1,-s*.35,s*.55);
  ctx.bezierCurveTo(-s*.22,s*.65,-s*.05,s*.65,s*.05,s*.55);
  ctx.bezierCurveTo(s*.08,s*.1,-s*.04,-s*.3,-s*.06,-s*.55);
  ctx.closePath();
  const dg=ctx.createLinearGradient(0,-s*.55,0,s*.65);
  dg.addColorStop(0,'rgba(248,242,235,1)');dg.addColorStop(1,'rgba(235,228,218,1)');
  ctx.fillStyle=dg;
  ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=8;
  ctx.fill();

  // Dress detail lace
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const yy=-s*.5+i*s*.22;
    ctx.moveTo(-s*.16,yy);ctx.lineTo(s*.04,yy);
  }
  ctx.strokeStyle='rgba(201,168,76,.25)';ctx.lineWidth=.6;ctx.stroke();

  // Body/torso
  ctx.beginPath();
  ctx.ellipse(-s*.07,-s*.65,s*.12,s*.14,0,0,6.28);
  const bg=ctx.createRadialGradient(-s*.07,-s*.65,0,-s*.07,-s*.65,s*.14);
  bg.addColorStop(0,'rgba(230,195,170,1)');bg.addColorStop(1,'rgba(210,170,145,1)');
  ctx.fillStyle=bg;ctx.fill();

  // Head
  ctx.beginPath();ctx.arc(-s*.07,-s*.85,s*.18,0,6.28);
  const hg=ctx.createRadialGradient(-s*.07,-s*.85,0,-s*.07,-s*.85,s*.18);
  hg.addColorStop(0,'rgba(235,200,175,1)');hg.addColorStop(1,'rgba(215,178,153,1)');
  ctx.fillStyle=hg;ctx.shadowBlur=0;ctx.fill();

  // Hair (long, honey blonde)
  ctx.beginPath();
  ctx.moveTo(-s*.22,-s*.78);
  ctx.bezierCurveTo(-s*.3,-s*.6,-s*.35,-s*.2,-s*.3,s*.1);
  ctx.lineTo(-s*.22,s*.1);
  ctx.bezierCurveTo(-s*.25,-s*.15,-s*.2,-s*.55,-s*.1,-s*.72);
  ctx.closePath();
  const hairG=ctx.createLinearGradient(-s*.25,-s*.78,-s*.25,s*.1);
  hairG.addColorStop(0,'rgba(160,120,70,1)');hairG.addColorStop(1,'rgba(130,90,45,1)');
  ctx.fillStyle=hairG;ctx.fill();

  // Hair top
  ctx.beginPath();ctx.arc(-s*.07,-s*.9,s*.19,Math.PI,0);
  ctx.fillStyle='rgba(148,108,60,1)';ctx.fill();

  // Hat (sun hat)
  ctx.beginPath();
  ctx.ellipse(-s*.07,-s*1.04,s*.28,s*.07,-.1,0,6.28);
  ctx.fillStyle='rgba(210,185,140,1)';ctx.fill();
  ctx.beginPath();ctx.ellipse(-s*.07,-s*1.02,s*.14,s*.1,0,0,6.28);
  ctx.fillStyle='rgba(190,165,120,1)';ctx.fill();

  // Arm (reaching toward partner)
  const armRot = phase>=1 ? -Math.PI*.15*phaseT : 0;
  ctx.save();ctx.translate(-s*.06,-s*.6);ctx.rotate(-armRot);
  ctx.beginPath();ctx.roundRect(-s*.05,-s*.02,s*.22,s*.07,s*.03);
  ctx.fillStyle='rgba(230,195,170,1)';ctx.fill();
  ctx.restore();

  // Bouquet (flowers)
  ctx.save();ctx.translate(s*.1,-s*.55);
  [0,1.2,2.4].forEach(a=>{
    ctx.beginPath();ctx.arc(Math.cos(a)*s*.1,Math.sin(a)*s*.1+s*.02,s*.08,0,6.28);
    ctx.fillStyle=a===0?'rgba(220,80,100,.9)':a===1.2?'rgba(255,180,200,.9)':'rgba(255,230,200,.9)';
    ctx.shadowColor='rgba(220,80,100,.3)';ctx.shadowBlur=4;ctx.fill();
  });
  ctx.restore();

  // Face details
  ctx.beginPath();ctx.arc(-s*.12,-s*.84,s*.03,0,6.28);ctx.fillStyle='rgba(80,50,30,1)';ctx.fill();
  ctx.beginPath();ctx.arc(-s*.02,-s*.84,s*.03,0,6.28);ctx.fillStyle='rgba(80,50,30,1)';ctx.fill();
  // smile
  ctx.beginPath();ctx.arc(-s*.07,-s*.82,s*.06,0,Math.PI);ctx.strokeStyle='rgba(180,100,80,.8)';ctx.lineWidth=1.2;ctx.stroke();
  // blush
  ctx.beginPath();ctx.ellipse(-s*.14,-s*.8,s*.04,s*.025,0,0,6.28);
  ctx.fillStyle='rgba(230,130,130,.35)';ctx.fill();
  ctx.beginPath();ctx.ellipse(0,-s*.8,s*.04,s*.025,0,0,6.28);
  ctx.fillStyle='rgba(230,130,130,.35)';ctx.fill();

  ctx.restore(); // her

  // ── HIM (right) ───────────────────────────────────────────────────────
  const himOff = phase===0 ? (W*.6*(1-phaseT)) : 0;
  ctx.save();ctx.translate(himOff,0);

  // Suit jacket (dark navy)
  ctx.beginPath();
  ctx.moveTo(s*.12,-s*.55);
  ctx.bezierCurveTo(s*.18,-s*.3,s*.26,s*.1,s*.24,s*.55);
  ctx.bezierCurveTo(s*.14,s*.62,s*.04,s*.62,-s*.02,s*.55);
  ctx.bezierCurveTo(-s*.04,s*.1,s*.02,-s*.3,s*.07,-s*.55);
  ctx.closePath();
  const jg=ctx.createLinearGradient(0,-s*.55,0,s*.65);
  jg.addColorStop(0,'rgba(22,40,72,1)');jg.addColorStop(1,'rgba(14,26,50,1)');
  ctx.fillStyle=jg;ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=10;ctx.fill();

  // Lapel
  ctx.beginPath();
  ctx.moveTo(s*.1,-s*.55);ctx.lineTo(s*.09,-s*.35);ctx.lineTo(s*.16,-s*.45);ctx.closePath();
  ctx.fillStyle='rgba(35,58,100,1)';ctx.fill();
  // Tie
  ctx.beginPath();ctx.moveTo(s*.1,-s*.55);ctx.lineTo(s*.08,-s*.3);ctx.lineTo(s*.12,-s*.3);ctx.lineTo(s*.1,-s*.55);ctx.closePath();
  ctx.fillStyle='rgba(160,30,50,1)';ctx.fill();
  // Boutonnière
  ctx.beginPath();ctx.arc(s*.2,-s*.45,s*.04,0,6.28);
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.shadowBlur=2;ctx.fill();
  ctx.beginPath();ctx.arc(s*.2,-s*.45,s*.02,0,6.28);
  ctx.fillStyle='rgba(201,168,76,1)';ctx.fill();

  // Trousers
  ctx.beginPath();
  ctx.moveTo(-s*.01,s*.55);ctx.lineTo(-s*.04,s*.95);ctx.lineTo(s*.06,s*.95);ctx.lineTo(s*.07,s*.55);ctx.closePath();
  ctx.fillStyle='rgba(22,34,60,1)';ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*.1,s*.55);ctx.lineTo(s*.13,s*.95);ctx.lineTo(s*.22,s*.95);ctx.lineTo(s*.21,s*.55);ctx.closePath();
  ctx.fillStyle='rgba(22,34,60,1)';ctx.fill();

  // Shoes
  ctx.beginPath();ctx.ellipse(s*.01,s*.97,s*.07,s*.04,-.1,0,6.28);ctx.fillStyle='rgba(20,20,20,1)';ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.17,s*.97,s*.07,s*.04,-.1,0,6.28);ctx.fillStyle='rgba(20,20,20,1)';ctx.fill();

  // Head
  ctx.beginPath();ctx.arc(s*.11,-s*.85,s*.17,0,6.28);
  const hg2=ctx.createRadialGradient(s*.11,-s*.85,0,s*.11,-s*.85,s*.17);
  hg2.addColorStop(0,'rgba(195,155,120,1)');hg2.addColorStop(1,'rgba(170,130,100,1)');
  ctx.fillStyle=hg2;ctx.shadowBlur=0;ctx.fill();

  // Dark hair
  ctx.beginPath();ctx.arc(s*.11,-s*.9,s*.17,Math.PI,0);
  ctx.fillStyle='rgba(28,20,14,1)';ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.11,-s*.72,s*.12,s*.04,0,0,6.28);
  ctx.fillStyle='rgba(28,20,14,1)';ctx.fill();

  // Fedora hat
  ctx.save();ctx.translate(s*.11,-s*1.0);
  ctx.beginPath();ctx.ellipse(0,s*.06,s*.26,s*.07,.05,0,6.28);
  ctx.fillStyle='rgba(30,25,20,1)';ctx.fill();
  ctx.beginPath();ctx.ellipse(0,0,s*.13,s*.14,0,0,6.28);
  ctx.fillStyle='rgba(40,33,26,1)';ctx.fill();
  ctx.beginPath();ctx.moveTo(-s*.13,0);ctx.lineTo(s*.13,0);
  ctx.strokeStyle='rgba(100,80,50,.5)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();

  // Beard
  ctx.beginPath();ctx.ellipse(s*.11,-s*.74,s*.09,s*.06,0,0,Math.PI);
  ctx.fillStyle='rgba(35,25,15,1)';ctx.fill();

  // Eyes
  ctx.beginPath();ctx.arc(s*.05,-s*.84,s*.025,0,6.28);ctx.fillStyle='rgba(30,20,10,1)';ctx.fill();
  ctx.beginPath();ctx.arc(s*.17,-s*.84,s*.025,0,6.28);ctx.fillStyle='rgba(30,20,10,1)';ctx.fill();
  // sunglasses
  ctx.beginPath();ctx.ellipse(s*.05,-s*.84,s*.046,s*.034,-.1,0,6.28);
  ctx.strokeStyle='rgba(10,10,10,1)';ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle='rgba(10,10,10,.7)';ctx.fill();
  ctx.beginPath();ctx.ellipse(s*.17,-s*.84,s*.046,s*.034,.1,0,6.28);
  ctx.strokeStyle='rgba(10,10,10,1)';ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle='rgba(10,10,10,.7)';ctx.fill();
  ctx.beginPath();ctx.moveTo(s*.096,-s*.845);ctx.lineTo(s*.124,-s*.845);
  ctx.strokeStyle='rgba(10,10,10,1)';ctx.lineWidth=2;ctx.stroke();
  // bridge
  ctx.beginPath();ctx.moveTo(-s*.01,-s*.845);ctx.lineTo(s*.01,-s*.845);
  ctx.strokeStyle='rgba(20,20,20,1)';ctx.lineWidth=1.5;ctx.stroke();

  // Smile
  ctx.beginPath();ctx.arc(s*.11,-s*.78,s*.055,0,Math.PI);
  ctx.strokeStyle='rgba(180,120,80,.8)';ctx.lineWidth=1.2;ctx.stroke();

  // His arm toward her
  const armRot2 = phase>=1 ? Math.PI*.12*phaseT : 0;
  ctx.save();ctx.translate(s*.09,-s*.58);ctx.rotate(armRot2);
  ctx.beginPath();ctx.roundRect(-s*.22,-s*.03,s*.22,s*.07,s*.03);
  ctx.fillStyle='rgba(195,155,120,1)';ctx.fill();
  ctx.restore();

  ctx.restore(); // him

  // ── FLOATING HEARTS (phase 2) ─────────────────────────────────────────
  if(phase>=2){
    const n=Math.floor(phaseT*6)+1;
    for(let i=0;i<n;i++){
      const hy=-s*(0.8+i*0.4+phaseT*0.6);
      const hx=s*((i%2===0?.06:-.06)+(Math.sin(i*2.1+phaseT*4)*.08));
      const ha=Math.min(1,(phaseT*6-i)*.8);
      const hs=s*(.12+i*.04);
      if(ha<=0)continue;
      ctx.save();ctx.translate(hx,hy);ctx.globalAlpha=ha;
      ctx.shadowColor='rgba(220,50,80,.8)';ctx.shadowBlur=12;
      drawHeart(hs);
      ctx.restore();
    }
  }

  ctx.restore(); // couple
}

function drawHeart(r){
  ctx.beginPath();
  for(let i=0;i<64;i++){
    const a=(i/64)*Math.PI*2-Math.PI/2;
    const x=16*Math.pow(Math.sin(a),3)*r/16;
    const y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*r/16;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle='rgba(230,50,80,1)';ctx.fill();
}

// ── TIMING ───────────────────────────────────────────────────────────────
// 0-600ms: bg+stars fade in
// 600-1400ms: map fades in
// 1400-1900ms: dots appear
// 1900-3200ms: couple walks in
// 3200-4400ms: couple turns, arms
// 4400-5800ms: hearts float + title
// 5800-6800ms: final hold
// 6800-7600ms: fade out → invite

function resize(){W=C.width=window.innerWidth;H=C.height=window.innerHeight;}

function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

function loop(ts){
  if(!t0)t0=ts;
  const el=ts-t0;
  ctx.clearRect(0,0,W,H);

  // BG
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#010507');bg.addColorStop(.6,'#030e1e');bg.addColorStop(1,'#071426');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W*.5,H*.75,0,W*.5,H*.75,W*.7);
  rg.addColorStop(0,'rgba(92,17,34,.12)');rg.addColorStop(1,'rgba(92,17,34,0)');
  ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);

  const starsA=Math.min(1,el/600);
  if(starsA>0){ctx.globalAlpha=starsA;drawStars(ts);ctx.globalAlpha=1;}

  const mapA=Math.min(1,Math.max(0,(el-600)/800));
  if(mapA>0) drawMap(mapA);

  // Brazil dot
  const brA=Math.min(1,Math.max(0,(el-1400)/300));
  if(brA>0) dot(.66,.36,'🇧🇷','Brasil',brA,.5+.5*Math.sin(ts*.003));
  // Argentina dot
  const arA=Math.min(1,Math.max(0,(el-1700)/300));
  if(arA>0) dot(.42,.74,'🇦🇷','Argentina',arA,.5+.5*Math.sin(ts*.003+1));

  // top label
  const lblA=Math.min(1,Math.max(0,(el-1000)/600))*(el>6800?Math.max(0,1-(el-6800)/500):1);
  if(lblA>0){
    ctx.save();ctx.globalAlpha=lblA;ctx.textAlign='center';
    ctx.font=`400 ${Math.max(10,W*.024)}px 'Cinzel',serif`;
    ctx.fillStyle='rgba(201,168,76,.9)';
    ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=8;
    ctx.fillText('UN AMOR QUE CRUZÓ FRONTERAS',W/2,H*.055);
    ctx.restore();
  }

  // Couple
  if(el>1900){
    const cx=W*.5, cy=H*.72;
    const sc=Math.min(W,H)*.38;
    let phase=0,phaseT=0;
    if(el<3200){ phase=0; phaseT=ease(Math.min(1,(el-1900)/1300)); }
    else if(el<4400){ phase=1; phaseT=ease(Math.min(1,(el-3200)/1200)); }
    else { phase=2; phaseT=ease(Math.min(1,(el-4400)/1400)); }
    drawCouple(cx,cy,sc,phase,phaseT);
  }

  // Names
  const nmA=Math.min(1,Math.max(0,(el-4800)/700))*(el>6800?Math.max(0,1-(el-6800)/500):1);
  if(nmA>0){
    ctx.save();ctx.globalAlpha=nmA;ctx.textAlign='center';
    const fs=Math.max(24,W*.085);
    ctx.font=`300 italic ${fs}px 'Cormorant Garamond',serif`;
    ctx.shadowColor='rgba(220,50,80,.7)';ctx.shadowBlur=30;
    ctx.fillStyle='#fff';
    ctx.fillText('Henrique & Sofia',W/2,H*.12);
    ctx.font=`400 ${Math.max(8,W*.018)}px 'Cinzel',serif`;
    ctx.fillStyle='rgba(201,168,76,.9)';ctx.shadowBlur=6;
    ctx.fillText('NOS CASAMOS · 24 DE ABRIL 2026',W/2,H*.12+fs*.65);
    ctx.restore();
  }

  // Exit
  if(el>6800){
    const ex=Math.min(1,(el-6800)/700);
    ctx.fillStyle=`rgba(1,5,7,${ex})`;ctx.fillRect(0,0,W,H);
    if(ex>=1){
      document.getElementById('intro').classList.add('out');
      document.getElementById('main').classList.add('in');
      cancelAnimationFrame(raf);return;
    }
  }
  raf=requestAnimationFrame(loop);
}

function init(){resize();mkStars();window.addEventListener('resize',()=>{resize();mkStars();});raf=requestAnimationFrame(loop);}
window.addEventListener('DOMContentLoaded',init);
})();
