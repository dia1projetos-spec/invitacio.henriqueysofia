(function () {
  // ── MUSIC ──────────────────────────────────────────────────────────────
  let audio, playing = false, started = false;

  function initAudio() {
    audio = new Audio(window.__AUDIO_SRC || 'musica.mp3');
    audio.loop = true;
    audio.volume = 0;
  }

  function fadeVolume(target, duration) {
    const step = (target - audio.volume) / (duration / 50);
    const iv = setInterval(() => {
      audio.volume = Math.max(0, Math.min(1, audio.volume + step));
      if (Math.abs(audio.volume - target) < 0.01) {
        audio.volume = target;
        clearInterval(iv);
      }
    }, 50);
  }

  function startMusic() {
    if (started) return;
    started = true;
    audio.play().then(() => {
      playing = true;
      fadeVolume(0.72, 2000);
      updateMusicBtn();
    }).catch(() => { started = false; });
  }

  function toggleMusic() {
    if (!started) { startMusic(); return; }
    if (playing) {
      fadeVolume(0, 800);
      setTimeout(() => { audio.pause(); playing = false; updateMusicBtn(); }, 800);
    } else {
      audio.play(); playing = true;
      fadeVolume(0.72, 800);
      updateMusicBtn();
    }
  }

  function updateMusicBtn() {
    const btn = document.getElementById('music-btn');
    if (!btn) return;
    btn.classList.toggle('paused', !playing);
  }

  // Try auto-start when main section becomes visible
  function watchForMain() {
    const main = document.getElementById('main');
    const obs = new MutationObserver(() => {
      if (main.classList.contains('in')) {
        obs.disconnect();
        setTimeout(startMusic, 800);
      }
    });
    obs.observe(main, { attributes: true, attributeFilter: ['class'] });
  }

  // Fallback: first interaction
  function onInteract() {
    startMusic();
    document.removeEventListener('click', onInteract);
    document.removeEventListener('touchstart', onInteract);
  }

  // ── SCROLL REVEALS ─────────────────────────────────────────────────────
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('revealed'), +delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => io.observe(el));
  }

  // ── COUNTDOWN ──────────────────────────────────────────────────────────
  function initCountdown() {
    const el = document.getElementById('cd');
    if (!el) return;
    const target = new Date('2026-04-24T20:30:00-03:00');
    function tick() {
      const diff = target - new Date();
      if (diff <= 0) { el.innerHTML = `<span class="cd-unit"><b>¡Hoy!</b></span>`; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = `
        <span class="cd-unit"><b>${d}</b><small>días</small></span>
        <span class="cd-sep">:</span>
        <span class="cd-unit"><b>${String(h).padStart(2,'0')}</b><small>hs</small></span>
        <span class="cd-sep">:</span>
        <span class="cd-unit"><b>${String(m).padStart(2,'0')}</b><small>min</small></span>
        <span class="cd-sep">:</span>
        <span class="cd-unit"><b>${String(s).padStart(2,'0')}</b><small>seg</small></span>
      `;
    }
    tick(); setInterval(tick, 1000);
  }

  // ── MUSIC BTN ─────────────────────────────────────────────────────────
  function initMusicBtn() {
    const btn = document.getElementById('music-btn');
    if (btn) btn.addEventListener('click', toggleMusic);
  }

  // ── INIT ──────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    initAudio();
    watchForMain();
    initReveal();
    initCountdown();
    initMusicBtn();
    document.addEventListener('click', onInteract, { passive: true });
    document.addEventListener('touchstart', onInteract, { passive: true });
  });
})();
