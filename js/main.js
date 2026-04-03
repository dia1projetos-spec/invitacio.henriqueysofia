(function(){
'use strict';

// ── MUSIC ───────────────────────────────────────────────────────────────
let audio, started=false, playing=false;

function initAudio(){
  audio = new Audio(window.A_MUSIC || 'musica.mp3');
  audio.loop = true;
  audio.volume = 0;
}

function fadeVol(target, ms){
  const step=(target-audio.volume)/(ms/40);
  const iv=setInterval(()=>{
    audio.volume=Math.max(0,Math.min(1,audio.volume+step));
    if(Math.abs(audio.volume-target)<0.01){ audio.volume=target; clearInterval(iv); }
  },40);
}

function startMusic(){
  if(started) return;
  started=true;
  audio.play().then(()=>{ playing=true; fadeVol(0.70,2500); showMusicBtn(); })
    .catch(()=>{ started=false; });
}

function showMusicBtn(){
  const btn=document.getElementById('mbtn');
  if(btn) btn.classList.add('visible');
}

function toggleMusic(){
  if(!started){ startMusic(); return; }
  if(playing){ fadeVol(0,600); setTimeout(()=>{ audio.pause(); playing=false; updateBtn(); },600); }
  else { audio.play(); playing=true; fadeVol(0.70,800); updateBtn(); }
}
function updateBtn(){
  const btn=document.getElementById('mbtn');
  if(btn) btn.classList.toggle('off',!playing);
}

// Try auto after intro
function watchIntro(){
  const main=document.getElementById('main');
  if(!main) return;
  const ob=new MutationObserver(()=>{
    if(main.classList.contains('in')){ ob.disconnect(); setTimeout(startMusic,600); }
  });
  ob.observe(main,{attributes:true,attributeFilter:['class']});
}

// SCROLL TRIGGER — fires on FIRST scroll in any direction
let scrollFired=false;
function onScroll(){
  if(scrollFired) return;
  scrollFired=true;
  startMusic();
  window.removeEventListener('scroll',onScroll,{passive:true});
  window.removeEventListener('touchmove',onScroll,{passive:true});
  window.removeEventListener('wheel',onScroll,{passive:true});
}

// Also on any tap/click fallback
let clickFired=false;
function onAnyClick(){
  if(clickFired) return;
  clickFired=true;
  startMusic();
}

// ── GALLERY ─────────────────────────────────────────────────────────────
function initGallery(){
  const slides=document.querySelectorAll('.slide');
  if(!slides.length) return;
  let cur=0, dragging=false, startX=0, moved=0;

  function go(n){
    slides[cur].classList.remove('active');
    cur=(n+slides.length)%slides.length;
    slides[cur].classList.add('active');
    // Update dots
    document.querySelectorAll('.gdot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  }

  slides[0].classList.add('active');

  // Auto-advance
  let auto=setInterval(()=>go(cur+1),4200);
  function resetAuto(){ clearInterval(auto); auto=setInterval(()=>go(cur+1),4200); }

  // Touch/drag
  const gallery=document.getElementById('gallery');
  if(!gallery) return;
  gallery.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;moved=0;},{ passive:true });
  gallery.addEventListener('touchmove',e=>{moved=e.touches[0].clientX-startX;},{ passive:true });
  gallery.addEventListener('touchend',()=>{
    if(Math.abs(moved)>40){ go(moved<0?cur+1:cur-1); resetAuto(); }
  });

  // Arrow buttons
  document.querySelectorAll('[data-gdir]').forEach(btn=>{
    btn.addEventListener('click',()=>{ go(cur+(btn.dataset.gdir==='next'?1:-1)); resetAuto(); });
  });
  // Dot buttons
  document.querySelectorAll('.gdot').forEach((d,i)=>{
    d.addEventListener('click',()=>{ go(i); resetAuto(); });
  });
}

// ── SCROLL REVEALS ──────────────────────────────────────────────────────
function initReveal(){
  const els=document.querySelectorAll('[data-r]');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('revealed'),+(e.target.dataset.delay||0));
        io.unobserve(e.target);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
}

// ── COUNTDOWN ───────────────────────────────────────────────────────────
function initCountdown(){
  const el=document.getElementById('cd');
  if(!el) return;
  const target=new Date('2026-04-24T20:30:00-03:00');
  function tick(){
    const d=target-new Date();
    if(d<=0){ el.innerHTML='<span class="cdu"><b>¡Hoy!</b></span>'; return; }
    const days=Math.floor(d/86400000);
    const hrs=Math.floor((d%86400000)/3600000);
    const min=Math.floor((d%3600000)/60000);
    const sec=Math.floor((d%60000)/1000);
    el.innerHTML=`
      <span class="cdu"><b>${days}</b><small>días</small></span>
      <span class="cdsep">:</span>
      <span class="cdu"><b>${String(hrs).padStart(2,'0')}</b><small>hs</small></span>
      <span class="cdsep">:</span>
      <span class="cdu"><b>${String(min).padStart(2,'0')}</b><small>min</small></span>
      <span class="cdsep">:</span>
      <span class="cdu"><b>${String(sec).padStart(2,'0')}</b><small>seg</small></span>`;
  }
  tick(); setInterval(tick,1000);
}

// ── PARALLAX HERO ───────────────────────────────────────────────────────
function initParallax(){
  const img=document.querySelector('.hero__img');
  if(!img) return;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    img.style.transform=`scale(1.05) translateY(${y*0.3}px)`;
  },{passive:true});
}

// ── INIT ────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  initAudio();
  watchIntro();
  // Scroll fires music
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('touchmove',onScroll,{passive:true});
  window.addEventListener('wheel',onScroll,{passive:true});
  // Any click fallback
  document.addEventListener('click',onAnyClick,{once:true,passive:true});
  document.addEventListener('touchstart',onAnyClick,{once:true,passive:true});

  document.getElementById('mbtn')?.addEventListener('click',toggleMusic);
  initGallery();
  initReveal();
  initCountdown();
  initParallax();
});
})();
