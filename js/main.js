(function(){
'use strict';
// ── MUSIC ────────────────────────────────────────────────────────────────
let audio,started=false,playing=false;
function initAudio(){
  audio=new Audio(window.IMG_MUSIC||'musica.mp3');
  audio.loop=true;audio.volume=0;
}
function fadeVol(t,ms){
  const step=(t-audio.volume)/(ms/40);
  const iv=setInterval(()=>{
    audio.volume=Math.max(0,Math.min(1,audio.volume+step));
    if(Math.abs(audio.volume-t)<.01){audio.volume=t;clearInterval(iv);}
  },40);
}
function startMusic(){
  if(started)return;started=true;
  audio.play().then(()=>{playing=true;fadeVol(.72,2500);showMbtn();}).catch(()=>{started=false;});
}
function showMbtn(){const b=document.getElementById('mbtn');if(b)b.classList.add('on');}
function toggleMusic(){
  if(!started){startMusic();return;}
  if(playing){fadeVol(0,600);setTimeout(()=>{audio.pause();playing=false;upMbtn();},600);}
  else{audio.play();playing=true;fadeVol(.72,700);upMbtn();}
}
function upMbtn(){const b=document.getElementById('mbtn');if(b)b.classList.toggle('muted',!playing);}

// Watch for intro ending → try auto-play
function watchIntro(){
  const m=document.getElementById('main');if(!m)return;
  const ob=new MutationObserver(()=>{
    if(m.classList.contains('in')){ob.disconnect();setTimeout(startMusic,500);}
  });
  ob.observe(m,{attributes:true,attributeFilter:['class']});
}
// First scroll → music
let sf=false;
function onScroll(){if(sf)return;sf=true;startMusic();}
// First tap/click fallback
document.addEventListener('click',()=>startMusic(),{once:true,passive:true});
document.addEventListener('touchstart',()=>startMusic(),{once:true,passive:true});

// ── GALLERY ──────────────────────────────────────────────────────────────
function initGallery(){
  const wrap=document.getElementById('gallery');
  if(!wrap)return;
  const slides=wrap.querySelectorAll('.gslide');
  const dots=document.querySelectorAll('.gdot');
  let cur=0,locked=false;

  function activate(n){
    if(locked)return;locked=true;
    const prev=cur;
    cur=(n+slides.length)%slides.length;

    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit');
    slides[cur].classList.add('entering');

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      slides[cur].classList.add('active');
      slides[cur].classList.remove('entering');
    }));

    setTimeout(()=>{
      slides[prev].classList.remove('exit');
      locked=false;
    },1100);

    dots.forEach((d,i)=>d.classList.toggle('on',i===cur));
  }

  // Auto-advance with pause on interaction
  let auto=setInterval(()=>activate(cur+1),5000);
  function resetAuto(){clearInterval(auto);auto=setInterval(()=>activate(cur+1),5000);}

  // Touch swipe
  let tx=0;
  wrap.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
  wrap.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-tx;
    if(Math.abs(dx)>45){activate(dx<0?cur+1:cur-1);resetAuto();}
  },{passive:true});

  // Arrows
  document.querySelectorAll('[data-gd]').forEach(b=>{
    b.addEventListener('click',()=>{activate(cur+(b.dataset.gd==='n'?1:-1));resetAuto();});
  });
  // Dots
  dots.forEach((d,i)=>d.addEventListener('click',()=>{activate(i);resetAuto();}));

  // Init first
  slides[0].classList.add('active');
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────
function initReveal(){
  const els=document.querySelectorAll('[data-r]');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('rev'),+(e.target.dataset.delay||0));
        io.unobserve(e.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -50px 0px'});
  els.forEach(el=>io.observe(el));
}

// ── COUNTDOWN ────────────────────────────────────────────────────────────
function initCd(){
  const el=document.getElementById('cd');if(!el)return;
  const tgt=new Date('2026-04-24T20:30:00-03:00');
  function tick(){
    const d=tgt-new Date();
    if(d<=0){el.innerHTML='<span class="cdu"><b>¡Hoy!</b></span>';return;}
    const days=Math.floor(d/86400000);
    const h=Math.floor((d%86400000)/3600000);
    const m=Math.floor((d%3600000)/60000);
    const s=Math.floor((d%60000)/1000);
    el.innerHTML=`
      <span class="cdu"><b>${days}</b><small>días</small></span>
      <span class="sep">:</span>
      <span class="cdu"><b>${String(h).padStart(2,'0')}</b><small>hs</small></span>
      <span class="sep">:</span>
      <span class="cdu"><b>${String(m).padStart(2,'0')}</b><small>min</small></span>
      <span class="sep">:</span>
      <span class="cdu"><b>${String(s).padStart(2,'0')}</b><small>seg</small></span>`;
  }
  tick();setInterval(tick,1000);
}

// ── PARALLAX ─────────────────────────────────────────────────────────────
function initParallax(){
  const img=document.querySelector('.hero__bg');if(!img)return;
  window.addEventListener('scroll',()=>{
    img.style.transform=`scale(1.06) translateY(${window.scrollY*.28}px)`;
  },{passive:true});
}

// ── INIT ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  initAudio();watchIntro();
  window.addEventListener('scroll',onScroll,{once:true,passive:true});
  window.addEventListener('touchmove',onScroll,{once:true,passive:true});
  document.getElementById('mbtn')?.addEventListener('click',toggleMusic);
  initGallery();initReveal();initCd();initParallax();
});
})();
