
(function () {
  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, raf;

  // ── South America path (normalized 0-1 coords) ──────────────────────────
  const SA_PATH = [
    [0.50,0.02],[0.55,0.03],[0.62,0.05],[0.68,0.09],[0.74,0.14],[0.78,0.19],
    [0.82,0.25],[0.85,0.30],[0.87,0.37],[0.86,0.43],[0.88,0.50],[0.87,0.57],
    [0.84,0.63],[0.80,0.69],[0.75,0.75],[0.70,0.80],[0.64,0.85],[0.58,0.90],
    [0.52,0.94],[0.47,0.97],[0.43,0.98],[0.40,0.96],[0.37,0.92],[0.34,0.87],
    [0.33,0.82],[0.32,0.76],[0.30,0.70],[0.28,0.64],[0.27,0.58],[0.26,0.52],
    [0.27,0.46],[0.26,0.40],[0.25,0.34],[0.27,0.28],[0.29,0.22],[0.32,0.17],
    [0.36,0.12],[0.40,0.08],[0.44,0.05],[0.48,0.03],[0.50,0.02]
  ];

  // Brazil dot (approx center-right)
  const BRAZIL = { nx: 0.65, ny: 0.35, label: '🇧🇷 Brasil' };
  // Argentina dot (lower center-left)
  const ARGENTINA = { nx: 0.42, ny: 0.78, label: '🇦🇷 Argentina' };

  function toXY(nx, ny) {
    // Map fits inside canvas with padding
    const PAD = 0.10;
    return {
      x: PAD * W + nx * W * (1 - PAD * 2),
      y: PAD * H + ny * H * (1 - PAD * 2)
    };
  }

  // ── Flight path: Brazil → mid-air → Argentina ───────────────────────────
  // Cubic bezier control points (normalized)
  const P0 = { nx: BRAZIL.nx, ny: BRAZIL.ny };
  const P1 = { nx: 0.30, ny: 0.20 }; // high arc
  const P2 = { nx: 0.25, ny: 0.55 };
  const P3 = { nx: ARGENTINA.nx, ny: ARGENTINA.ny };

  function bezier(t) {
    const mt = 1 - t;
    return {
      nx: mt*mt*mt*P0.nx + 3*mt*mt*t*P1.nx + 3*mt*t*t*P2.nx + t*t*t*P3.nx,
      ny: mt*mt*mt*P0.ny + 3*mt*mt*t*P1.ny + 3*mt*t*t*P2.ny + t*t*t*P3.ny
    };
  }
  function bezierTangent(t) {
    const mt = 1 - t;
    return {
      nx: 3*mt*mt*(P1.nx-P0.nx) + 6*mt*t*(P2.nx-P1.nx) + 3*t*t*(P3.nx-P2.nx),
      ny: 3*mt*mt*(P1.ny-P0.ny) + 6*mt*t*(P2.ny-P1.ny) + 3*t*t*(P3.ny-P2.ny)
    };
  }

  // Heart: drawn around a center while flying
  // Heart starts at t=0.38 of the flight, ends at t=0.82
  const HEART_START_T = 0.38;
  const HEART_END_T   = 0.82;
  // Heart center (mid-continent area)
  const HEART_CENTER  = { nx: 0.50, ny: 0.54 };
  const HEART_RADIUS  = 0.095; // normalized

  function heartPoint(a) {
    // parametric heart, a = 0..2π
    const hx = 16 * Math.pow(Math.sin(a), 3);
    const hy = -(13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a));
    // normalize: max extent ~16
    const c = toXY(HEART_CENTER.nx, HEART_CENTER.ny);
    const r = HEART_RADIUS * Math.min(W, H);
    return { x: c.x + hx * r / 16, y: c.y + hy * r / 16 };
  }

  // The plane's position is determined by a combined path:
  // flight bezier up to HEART_START_T → heart loop → bezier from HEART_END_T to 1
  function getPlaneState(progress) {
    // progress 0..1 over total animation
    if (progress < HEART_START_T) {
      // pure bezier
      const t = progress / HEART_START_T;
      const pos = bezier(t * HEART_START_T + (1-t) * 0); // just use bezier(progress)
      const p = bezier(progress / HEART_START_T * HEART_START_T);
      const bPos = bezier(progress);
      const tang = bezierTangent(progress);
      const angle = Math.atan2(tang.ny, tang.nx);
      const xy = toXY(bPos.nx, bPos.ny);
      return { x: xy.x, y: xy.y, angle, phase: 'fly' };
    } else if (progress < HEART_END_T) {
      // drawing heart
      const hp = (progress - HEART_START_T) / (HEART_END_T - HEART_START_T);
      const angle_h = hp * Math.PI * 2 - Math.PI / 2;
      const next_h = (hp + 0.01) * Math.PI * 2 - Math.PI / 2;
      const pos = heartPoint(angle_h);
      const posN = heartPoint(next_h);
      const angle = Math.atan2(posN.y - pos.y, posN.x - pos.x);
      return { x: pos.x, y: pos.y, angle, phase: 'heart', heartProgress: hp };
    } else {
      // resume bezier to Argentina
      const t = (progress - HEART_END_T) / (1 - HEART_END_T);
      const bPos = bezier(HEART_END_T + t * (1 - HEART_END_T));
      const tang = bezierTangent(HEART_END_T + t * (1 - HEART_END_T));
      const angle = Math.atan2(tang.ny, tang.nx);
      const xy = toXY(bPos.nx, bPos.ny);
      return { x: xy.x, y: xy.y, angle, phase: 'land' };
    }
  }

  // ── RENDERING ────────────────────────────────────────────────────────────

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Starfield
  let stars = [];
  function buildStars() {
    stars = [];
    const n = Math.min(300, Math.floor(W * H / 5000));
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random(), y: Math.random() * 0.85,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.002 + 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function drawBG() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#020810');
    g.addColorStop(0.6, '#071428');
    g.addColorStop(1, '#0d1f3c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t) {
    stars.forEach(s => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
      ctx.fill();
    });
  }

  // South America silhouette
  function drawContinent(mapAlpha) {
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    const pts = SA_PATH.map(([nx, ny]) => toXY(nx, ny));

    // Fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const gf = ctx.createLinearGradient(W*0.25, H*0.05, W*0.88, H*0.95);
    gf.addColorStop(0, 'rgba(17,34,64,0.9)');
    gf.addColorStop(1, 'rgba(25,44,80,0.9)');
    ctx.fillStyle = gf;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(100,140,200,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Grid lines inside continent (latitude feel)
    ctx.setLineDash([2, 8]);
    ctx.strokeStyle = 'rgba(100,140,200,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = H * (0.1 + i * 0.11);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // City dot
  function drawDot(nx, ny, label, alpha, glowColor) {
    const { x, y } = toXY(nx, ny);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer glow
    const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
    g.addColorStop(0, glowColor.replace('1)', '0.5)'));
    g.addColorStop(1, glowColor.replace('1)', '0)'));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();

    // Dot
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = glowColor; ctx.lineWidth = 2; ctx.stroke();

    // Pulse ring
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
    ctx.beginPath(); ctx.arc(x, y, 8 + pulse * 6, 0, Math.PI * 2);
    ctx.strokeStyle = glowColor.replace('1)', `${0.4 * (1 - pulse)})`);;
    ctx.lineWidth = 1.5; ctx.stroke();

    // Label
    const fs = Math.max(10, W * 0.022);
    ctx.font = `600 ${fs}px 'Cinzel', serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(label, x, y - 18);
    ctx.restore();
  }

  // Flight trail
  let trailPoints = [];

  function drawTrail() {
    if (trailPoints.length < 2) return;
    ctx.save();
    for (let i = 1; i < trailPoints.length; i++) {
      const ratio = i / trailPoints.length;
      const p = trailPoints[i], pp = trailPoints[i-1];
      ctx.beginPath();
      ctx.moveTo(pp.x, pp.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(201,168,76,${ratio * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(201,168,76,0.4)';
      ctx.shadowBlur = 4;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Heart trail
  let heartPoints = [];

  function drawHeart() {
    if (heartPoints.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Glow pass
    ctx.shadowColor = 'rgba(220,50,80,1)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(220,50,80,0.5)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(heartPoints[0].x, heartPoints[0].y);
    heartPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Core line
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ff4466';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(heartPoints[0].x, heartPoints[0].y);
    heartPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Bright core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,200,210,0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(heartPoints[0].x, heartPoints[0].y);
    heartPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Sparkles
    heartPoints.forEach((p, i) => {
      if (i % 12 === 0) {
        const sp = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() * 0.006 + i));
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * sp, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,230,${sp})`;
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // Airplane
  function drawPlane(x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const s = Math.max(14, Math.min(W, H) * 0.032) * scale;
    ctx.shadowColor = 'rgba(220,200,100,0.9)';
    ctx.shadowBlur = 16;

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(s * 1.4, 0);
    ctx.lineTo(-s * 0.9, -s * 0.28);
    ctx.lineTo(-s * 0.6, 0);
    ctx.lineTo(-s * 0.9, s * 0.28);
    ctx.closePath(); ctx.fill();

    // Main wing
    ctx.fillStyle = 'rgba(201,168,76,0.95)';
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.05);
    ctx.lineTo(-s * 0.2, -s * 0.9);
    ctx.lineTo(-s * 0.55, -s * 0.12);
    ctx.closePath(); ctx.fill();

    // Tail
    ctx.fillStyle = 'rgba(201,168,76,0.8)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, 0);
    ctx.lineTo(-s * 0.9, -s * 0.45);
    ctx.lineTo(-s * 0.75, 0);
    ctx.closePath(); ctx.fill();

    // Window
    ctx.fillStyle = 'rgba(180,220,255,0.8)';
    ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.06, s * 0.09, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // Text overlays
  function drawTitle(alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const fs = Math.max(12, W * 0.028);
    ctx.font = `400 ${fs}px 'Cinzel', serif`;
    ctx.fillStyle = 'rgba(201,168,76,0.9)';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10;
    ctx.fillText('UN AMOR SIN FRONTERAS', W/2, H * 0.06);
    ctx.restore();
  }

  function drawFinalMsg(alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';

    const fs1 = Math.max(28, W * 0.10);
    ctx.font = `300 italic ${fs1}px 'Cormorant Garamond', serif`;
    ctx.shadowColor = 'rgba(220,50,80,0.8)'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#fff';
    ctx.fillText('Henrique & Sofia', W/2, H * 0.88);

    const fs2 = Math.max(10, W * 0.022);
    ctx.font = `400 ${fs2}px 'Cinzel', serif`;
    ctx.fillStyle = 'rgba(201,168,76,0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText('NOS CASAMOS · 24 DE ABRIL', W/2, H * 0.88 + fs1 * 0.7);
    ctx.restore();
  }

  // ── ANIMATION LOOP ───────────────────────────────────────────────────────
  const TOTAL_MS   = 7500;
  const FADE_IN_MS = 800;   // continent fade in
  const DOT_IN_MS  = 1400;  // Brazil dot appears
  const FLY_START  = 1800;  // plane starts moving
  const FLY_END    = 6200;  // plane arrives Argentina
  const MSG_START  = 5800;  // names appear
  const EXIT_START = 7000;  // screen fades out

  let startTime = null;

  function loop(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const total = Math.min(elapsed / TOTAL_MS, 1);

    ctx.clearRect(0, 0, W, H);
    drawBG();
    drawStars(ts);

    // Continent fade in
    const mapAlpha = Math.min(1, elapsed / FADE_IN_MS);
    drawContinent(mapAlpha);

    // Brazil dot
    const brAlpha = Math.max(0, Math.min(1, (elapsed - DOT_IN_MS) / 400));
    if (brAlpha > 0) drawDot(BRAZIL.nx, BRAZIL.ny, BRAZIL.label, brAlpha, 'rgba(0,200,100,1)');

    // Argentina dot (appears when plane is close)
    const arAlpha = elapsed > FLY_END - 1200 ? Math.min(1, (elapsed - (FLY_END - 1200)) / 600) : 0;
    if (arAlpha > 0) drawDot(ARGENTINA.nx, ARGENTINA.ny, ARGENTINA.label, arAlpha, 'rgba(100,160,255,1)');

    // Title
    drawTitle(Math.min(1, elapsed / 1000) * (1 - Math.max(0, (elapsed - EXIT_START) / 600)));

    // Plane flight
    if (elapsed >= FLY_START && elapsed <= FLY_END + 300) {
      const flyProgress = Math.min(1, (elapsed - FLY_START) / (FLY_END - FLY_START));
      const state = getPlaneState(flyProgress);

      // Accumulate trail / heart points
      if (state.phase === 'heart') {
        heartPoints.push({ x: state.x, y: state.y });
      } else {
        trailPoints.push({ x: state.x, y: state.y });
        if (trailPoints.length > 160) trailPoints.shift();
      }

      drawTrail();
      drawHeart();

      const planeScale = elapsed > FLY_END ? Math.max(0, 1 - (elapsed - FLY_END) / 300) : 1;
      if (planeScale > 0) drawPlane(state.x, state.y, state.angle, planeScale);
    } else if (elapsed > FLY_END + 300) {
      drawTrail();
      drawHeart();
    }

    // Names reveal
    const msgAlpha = elapsed > MSG_START ? Math.min(1, (elapsed - MSG_START) / 600) : 0;
    drawFinalMsg(msgAlpha);

    // Exit fade
    if (elapsed > EXIT_START) {
      const exitAlpha = Math.min(1, (elapsed - EXIT_START) / 600);
      ctx.fillStyle = `rgba(2,8,16,${exitAlpha})`;
      ctx.fillRect(0, 0, W, H);

      if (exitAlpha >= 1) {
        // Show main content
        document.getElementById('intro').classList.add('out');
        document.getElementById('main').classList.add('in');
        cancelAnimationFrame(raf);
        return;
      }
    }

    raf = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    buildStars();
    window.addEventListener('resize', () => { resize(); buildStars(); });
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
