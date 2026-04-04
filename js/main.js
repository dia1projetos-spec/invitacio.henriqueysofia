// AUDIO
let audio, musicStarted = false;

function ga() {
  if (!audio) {
    audio = document.getElementById('wa');
    if (audio) { audio.loop = true; audio.volume = 0.6; }
  }
  return audio;
}

function startMusic() {
  const a = ga(); if (!a || musicStarted) return;
  a.play().catch(() => {});
  musicStarted = true;
  updateMusicUI();
}

function toggleMusic(e) {
  const a = ga(); if (!a) return;
  if (e) e.stopPropagation();
  a.paused ? a.play() : a.pause();
  updateMusicUI();
}

function updateMusicUI() {
  const a = ga();
  const w = document.querySelector('.mwaves');
  if (w && a) w.classList.toggle('paused', a.paused);
}

document.addEventListener('click', () => startMusic());
document.addEventListener('touchstart', () => startMusic(), { passive: true });

// Ripple on click
document.addEventListener('click', function(e) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = e.clientX + 'px';
  r.style.top = e.clientY + 'px';
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 800);
});

// Music bar click
document.addEventListener('DOMContentLoaded', function() {
  const bar = document.getElementById('music-bar');
  if (bar) bar.addEventListener('click', e => { e.stopPropagation(); musicStarted ? toggleMusic(e) : startMusic(); });
});

// LOADER
window.addEventListener('load', function() {
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) { l.classList.add('fade-out'); setTimeout(() => l.style.display = 'none', 1400); }
  }, 3500);
});

// REVEAL ON SCROLL
function checkReveal() {
  document.querySelectorAll('.reveal,.card,.ticket,.deadline').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('visible');
  });
}
window.addEventListener('scroll', checkReveal, { passive: true });
setTimeout(checkReveal, 200);

// PARALLAX
window.addEventListener('scroll', function() {
  const bg = document.querySelector('.hero-bg');
  if (bg && window.scrollY < window.innerHeight) bg.style.transform = `scale(1.06) translateY(${window.scrollY * 0.22}px)`;
}, { passive: true });

// PARTICLES
(function() {
  const c = document.querySelector('.hero-particles'); if (!c) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*3+2}px;height:${Math.random()*3+2}px;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*10}s`;
    c.appendChild(p);
  }
})();

// PETALS
const petals = ['🌸','✨','🌺','⭐','🌼'];
function mkPetal() {
  const p = document.createElement('div');
  p.className = 'petal';
  p.textContent = petals[Math.floor(Math.random()*petals.length)];
  p.style.cssText = `left:${Math.random()*100}vw;animation-duration:${Math.random()*6+7}s;font-size:${Math.random()*.8+.6}rem`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 14000);
}
setInterval(() => { if (musicStarted) mkPetal(); }, 3000);

// COUNTDOWN
function updateCD() {
  const target = new Date('2025-04-24T20:30:00'), now = new Date();
  let diff = target - now;
  const pad = n => String(Math.max(0,n)).padStart(2,'0');
  const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = pad(v); };
  if (diff <= 0) { ['cd-d','cd-h','cd-m','cd-s'].forEach(id => set(id,0)); return; }
  set('cd-d', Math.floor(diff/86400000));
  set('cd-h', Math.floor((diff%86400000)/3600000));
  set('cd-m', Math.floor((diff%3600000)/60000));
  set('cd-s', Math.floor((diff%60000)/1000));
}
updateCD(); setInterval(updateCD, 1000);
