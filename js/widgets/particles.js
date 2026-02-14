// ── Multi-Mode Particle System ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { TAU, randomRange, clamp } from '../utils/math.js';

export function initParticles(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const maxParticles = 400;
  const pool = [];
  let activeCount = 0;

  // Pre-allocate pool
  for (let i = 0; i < maxParticles; i++) {
    pool.push({
      active: false,
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0,
      size: 0,
      r: 0, g: 0, b: 0,
      rotation: 0,
      rotationSpeed: 0,
    });
  }

  const modes = [
    { name: 'Fireflies', colors: [[255, 220, 100], [255, 180, 50], [200, 255, 100]], gravity: 0, speed: 30, size: [2, 5], life: [1.5, 3], glow: true },
    { name: 'Galaxy', colors: [[124, 91, 245], [180, 130, 255], [91, 168, 245]], gravity: 0, speed: 60, size: [1, 3], life: [2, 4], spiral: true, glow: true },
    { name: 'Rain', colors: [[120, 180, 255], [180, 220, 255], [200, 240, 255]], gravity: 500, speed: 20, size: [1, 3], life: [0.8, 1.5], streak: true },
    { name: 'Confetti', colors: [[245, 91, 154], [124, 91, 245], [91, 245, 200], [245, 168, 91]], gravity: 200, speed: 120, size: [3, 7], life: [1, 2.5], spin: true },
  ];
  let currentMode = 0;

  // Mode buttons
  const controls = document.createElement('div');
  controls.className = 'art-controls';
  container.appendChild(controls);

  const modeBtns = modes.map((mode, i) => {
    const btn = document.createElement('button');
    btn.className = 'art-btn' + (i === 0 ? ' active' : '');
    btn.textContent = mode.name;
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      currentMode = i;
      modeBtns.forEach((b, j) => b.classList.toggle('active', j === i));
    });
    controls.appendChild(btn);
    return btn;
  });

  function spawn(x, y) {
    const mode = modes[currentMode];
    for (let i = 0; i < 3; i++) {
      const p = pool.find(p => !p.active);
      if (!p) return;
      activeCount++;
      const color = mode.colors[Math.floor(Math.random() * mode.colors.length)];
      const angle = randomRange(0, TAU);
      const speed = randomRange(mode.speed * 0.5, mode.speed);

      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - (mode.gravity ? 50 : 0);
      p.life = randomRange(mode.life[0], mode.life[1]);
      p.maxLife = p.life;
      p.size = randomRange(mode.size[0], mode.size[1]);
      p.r = color[0];
      p.g = color[1];
      p.b = color[2];
      p.rotation = randomRange(0, TAU);
      p.rotationSpeed = mode.spin ? randomRange(-5, 5) : 0;
    }
  }

  // Track active emitters (multi-touch)
  const emitters = new Map();

  onInteract(canvas, {
    onStart(x, y, id) {
      emitters.set(id, { x, y });
    },
    onMove(x, y, id) {
      emitters.set(id, { x, y });
    },
    onEnd(x, y, id) {
      emitters.delete(id);
    },
  });

  registerAnimCallback(pageIndex, (dt) => {
    const mode = modes[currentMode];

    // Emit from active touches
    for (const [id, pos] of emitters) {
      spawn(pos.x, pos.y);
    }

    // Semi-transparent clear for trails
    ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    for (const p of pool) {
      if (!p.active) continue;

      // Physics
      p.vy += (mode.gravity || 0) * dt;
      if (mode.spiral) {
        // Orbital motion
        const cx = width / 2;
        const cy = height / 2;
        const dx = p.x - cx;
        const dy = p.y - cy;
        p.vx -= dy * 0.5 * dt;
        p.vy += dx * 0.5 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.rotation += p.rotationSpeed * dt;

      if (p.life <= 0) {
        p.active = false;
        activeCount--;
        continue;
      }

      const alpha = clamp(p.life / p.maxLife, 0, 1);
      const fadeAlpha = alpha * 0.8;

      ctx.save();

      if (mode.glow) {
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, ${fadeAlpha * 0.5})`;
      }

      if (mode.streak) {
        // Rain streak
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * dt * 3, p.y - p.vy * dt * 3);
        ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${fadeAlpha})`;
        ctx.lineWidth = p.size * 0.7;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (mode.spin) {
        // Confetti rectangles
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${fadeAlpha})`;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Circles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, TAU);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${fadeAlpha})`;
        ctx.fill();
      }

      ctx.restore();
    }
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
  });
}
