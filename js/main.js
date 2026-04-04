// ── AUDIO ──────────────────────────────────────────────────
let audio = null;
let musicStarted = false;

function getAudio() {
  if (!audio) audio = document.getElementById('wa');
  return audio;
}

function startMusic() {
  if (musicStarted) return;
  const a = getAudio();
  if (!a) return;
  a.loop = true;
  a.volume = 0.65;
  const p = a.play();
  if (p && typeof p.then === 'function') {
    p.then(() => { musicStarted = true; updateMusicUI(); }).catch(() => {});
  } else {
    musicStarted = true;
    updateMusicUI();
  }
}

function toggleMusic(e) {
  if (e) e.stopPropagation();
  const a = getAudio();
  if (!a) return;
  a.paused ? a.play() : a.pause();
  updateMusicUI();
}

function updateMusicUI() {
  const a = getAudio();
  const w = document.querySelector('.mwaves');
  if (w && a) w.classList.toggle('paused', a.paused);
}

// Try autoplay on load
document.addEventListener('DOMContentLoaded', () => setTimeout(startMusic, 800));

// Retry on ANY gesture
['click','touchstart','touchend','scroll','keydown','pointerdown'].forEach(evt =>
  document.addEventListener(evt, startMusic, { passive: true })
);

// Music bar toggle
document.addEventListener('DOMContentLoaded', function() {
  const bar = document.getElementById('music-bar');
  if (bar) bar.addEventListener('click', e => { e.stopPropagation(); !musicStarted ? startMusic() : toggleMusic(e); });
});

// Ripple
document.addEventListener('click', function(e) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = e.clientX + 'px';
  r.style.top = e.clientY + 'px';
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 800);
});

// ── LOADER ──────────────────────────────────────────────────
window.addEventListener('load', function() {
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) { l.classList.add('fade-out'); setTimeout(() => l.style.display = 'none', 1400); }
  }, 3500);
});

// ── REVEALS ─────────────────────────────────────────────────
function checkReveal() {
  document.querySelectorAll('.reveal,.card,.ticket,.deadline').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('visible');
  });
}
window.addEventListener('scroll', checkReveal, { passive: true });
setTimeout(checkReveal, 200);

// ── PARALLAX ────────────────────────────────────────────────
window.addEventListener('scroll', function() {
  const bg = document.querySelector('.hero-bg');
  if (bg && window.scrollY < window.innerHeight)
    bg.style.transform = `scale(1.06) translateY(${window.scrollY * 0.22}px)`;
}, { passive: true });

// ── PARTICLES ───────────────────────────────────────────────
(function() {
  const c = document.querySelector('.hero-particles'); if (!c) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*3+2}px;height:${Math.random()*3+2}px;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*10}s`;
    c.appendChild(p);
  }
})();

// ── PETALS ──────────────────────────────────────────────────
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
