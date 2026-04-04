// ── SPLASH → MUSIC (único gesto, garantido) ─────────────────
function enterSite() {
  const a = document.getElementById('wa');
  a.loop = true;
  a.volume = 0.65;
  // Play DIRETO no onclick — isso é um gesto de usuário, sempre funciona
  a.play().then(() => {
    updateMusicUI(a);
  }).catch(() => {});

  // Esconde splash
  const splash = document.getElementById('splash');
  splash.classList.add('gone');
  setTimeout(() => splash.style.display = 'none', 1300);

  // Mostra loader animado
  const loader = document.getElementById('loader');
  loader.style.display = 'flex';
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => loader.style.display = 'none', 1400);
  }, 3200);
}

// ── MUSIC BAR TOGGLE ────────────────────────────────────────
function updateMusicUI(a) {
  const w = document.querySelector('.mwaves');
  if (!a) a = document.getElementById('wa');
  if (w && a) w.classList.toggle('paused', a.paused);
}

document.addEventListener('DOMContentLoaded', function() {
  const bar = document.getElementById('music-bar');
  if (bar) {
    bar.addEventListener('click', function(e) {
      e.stopPropagation();
      const a = document.getElementById('wa');
      if (!a) return;
      a.paused ? a.play() : a.pause();
      updateMusicUI(a);
    });
  }
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

// ── SCROLL REVEALS ──────────────────────────────────────────
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
setInterval(() => {
  const a = document.getElementById('wa');
  if (a && !a.paused) mkPetal();
}, 3000);
