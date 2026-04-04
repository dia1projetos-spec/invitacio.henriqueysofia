'use strict';

// ── PARTICLES on splash ──────────────────────────────────────────────────
(function spawnParticles(){
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = [
      `width:${size}px`, `height:${size}px`,
      `left:${Math.random()*100}%`,
      `opacity:${Math.random()*.5+.1}`,
      `animation-duration:${Math.random()*8+6}s`,
      `animation-delay:${Math.random()*6}s`
    ].join(';');
    wrap.appendChild(p);
  }
})();

// ── SPLASH → INVITE ──────────────────────────────────────────────────────
function showInvite() {
  document.getElementById('splash').classList.add('gone');
  const inv = document.getElementById('inv');
  inv.classList.add('show');
  tryAutoMusic();
}
// Splash shows for 2.8s then transitions
setTimeout(showInvite, 2800);

// ── PHOTOS inject ────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('h-img').src  = _P1;
  document.getElementById('g1').src     = _P1;
  document.getElementById('g2').src     = _P2;
  document.getElementById('g3').src     = _P3;
  document.getElementById('g4').src     = _P4;
  document.getElementById('g5').src     = _P5;
  document.getElementById('g6').src     = _P6;
  document.getElementById('g7').src     = _P7;
});

// ── MUSIC ────────────────────────────────────────────────────────────────
var audio, mStarted = false, mPlaying = false;

function initMusic() {
  audio = new Audio(_MUS);
  audio.loop = true;
  audio.volume = 0;
}

function fadeVol(target, ms) {
  var step = (target - audio.volume) / (ms / 40);
  var iv = setInterval(function(){
    audio.volume = Math.max(0, Math.min(1, audio.volume + step));
    if (Math.abs(audio.volume - target) < .01) { audio.volume = target; clearInterval(iv); }
  }, 40);
}

function startMusic() {
  if (mStarted) return;
  mStarted = true;
  audio.play().then(function(){
    mPlaying = true;
    fadeVol(.72, 2500);
    document.getElementById('mbtn').classList.add('show');
  }).catch(function(){ mStarted = false; });
}

function tryAutoMusic() { setTimeout(startMusic, 600); }

function toggleMusic() {
  if (!mStarted) { startMusic(); return; }
  if (mPlaying) {
    fadeVol(0, 500);
    setTimeout(function(){ audio.pause(); mPlaying = false; updBtn(); }, 500);
  } else {
    audio.play(); mPlaying = true; fadeVol(.72, 600); updBtn();
  }
}
function updBtn() {
  document.getElementById('mbtn').classList.toggle('off', !mPlaying);
}

// First scroll/touch → music
var scrollFired = false;
function onFirstInteract() {
  if (scrollFired) return;
  scrollFired = true;
  startMusic();
}

// ── GALLERY ──────────────────────────────────────────────────────────────
var gCur = 0, gLocked = false, gAuto;

function initGallery() {
  var slides   = document.querySelectorAll('.gslide');
  var dots     = document.querySelectorAll('.gdot');
  var capEl    = document.getElementById('gcap');
  var total    = slides.length;

  function setCap(n) {
    capEl.style.opacity = '0';
    setTimeout(function(){
      capEl.textContent = slides[n].dataset.caption || '';
      capEl.style.opacity = '1';
    }, 300);
  }

  function go(n) {
    if (gLocked) return;
    gLocked = true;
    slides[gCur].classList.remove('cur');
    dots[gCur].classList.remove('on');
    gCur = (n + total) % total;
    slides[gCur].classList.add('cur');
    dots[gCur].classList.add('on');
    setCap(gCur);
    setTimeout(function(){ gLocked = false; }, 1100);
  }

  function resetAuto() {
    clearInterval(gAuto);
    gAuto = setInterval(function(){ go(gCur + 1); }, 5200);
  }

  // Init
  slides[0].classList.add('cur');
  dots[0].classList.add('on');
  setCap(0);
  gAuto = setInterval(function(){ go(gCur + 1); }, 5200);

  // Build dots
  var dotsWrap = document.getElementById('gdots');
  dotsWrap.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var d = document.createElement('button');
    d.className = 'gdot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', String(i+1));
    (function(idx){ d.addEventListener('click', function(){ go(idx); resetAuto(); }); })(i);
    dotsWrap.appendChild(d);
  }

  // Arrows
  document.getElementById('gp').addEventListener('click', function(){ go(gCur - 1); resetAuto(); });
  document.getElementById('gn').addEventListener('click', function(){ go(gCur + 1); resetAuto(); });

  // Touch swipe
  var tx = 0, ty = 0;
  var track = document.getElementById('gtrack');
  track.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  track.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - tx;
    var dy = Math.abs(e.changedTouches[0].clientY - ty);
    if (Math.abs(dx) > 44 && dy < 60) { go(dx < 0 ? gCur + 1 : gCur - 1); resetAuto(); }
  }, { passive: true });
}

// ── COUNTDOWN ────────────────────────────────────────────────────────────
function initCountdown() {
  var el = document.getElementById('cd');
  if (!el) return;
  var target = new Date('2026-04-24T20:30:00-03:00');
  function tick() {
    var d = target - new Date();
    if (d <= 0) { el.innerHTML = '<span class="cdu"><b>¡Hoy!</b></span>'; return; }
    var days = Math.floor(d / 86400000);
    var h = Math.floor((d % 86400000) / 3600000);
    var m = Math.floor((d % 3600000) / 60000);
    var s = Math.floor((d % 60000) / 1000);
    el.innerHTML =
      '<span class="cdu"><b>' + days + '</b><small>días</small></span>' +
      '<span class="cdsep">:</span>' +
      '<span class="cdu"><b>' + pad(h) + '</b><small>hs</small></span>' +
      '<span class="cdsep">:</span>' +
      '<span class="cdu"><b>' + pad(m) + '</b><small>min</small></span>' +
      '<span class="cdsep">:</span>' +
      '<span class="cdu"><b>' + pad(s) + '</b><small>seg</small></span>';
  }
  function pad(n) { return String(n).padStart(2,'0'); }
  tick(); setInterval(tick, 1000);
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────
function initReveal() {
  var els = document.querySelectorAll('[data-reveal]');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        var delay = +(e.target.dataset.delay || 0);
        setTimeout(function(){ e.target.classList.add('on'); }, delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el){ io.observe(el); });
}

// ── HERO PARALLAX ────────────────────────────────────────────────────────
function initParallax() {
  var img = document.querySelector('.hero-img');
  if (!img) return;
  window.addEventListener('scroll', function(){
    img.style.transform = 'scale(1.06) translateY(' + (window.scrollY * .25) + 'px)';
  }, { passive: true });
}

// ── INIT ─────────────────────────────────────────────────────────────────
initMusic();
window.addEventListener('scroll',    onFirstInteract, { once: true, passive: true });
window.addEventListener('touchstart',onFirstInteract, { once: true, passive: true });
window.addEventListener('touchmove', onFirstInteract, { once: true, passive: true });
window.addEventListener('click',     onFirstInteract, { once: true, passive: true });

document.getElementById('mbtn').addEventListener('click', toggleMusic);

window.addEventListener('DOMContentLoaded', function(){
  initGallery();
  initCountdown();
  initReveal();
  initParallax();
});
