// ── Tap Ripple Effects ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { TAU } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initRipple(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const ripples = [];
  const maxRipples = 25;
  const accentColors = [
    [124, 91, 245],
    [245, 91, 154],
    [91, 245, 200],
    [245, 168, 91],
  ];
  let colorIndex = 0;

  function spawnRipple(x, y) {
    if (ripples.length >= maxRipples) ripples.shift();
    const color = accentColors[colorIndex % accentColors.length];
    colorIndex++;
    ripples.push({
      x, y,
      radius: 0,
      maxRadius: Math.max(width, height) * 0.6,
      speed: 220,
      opacity: 0.7,
      color,
      lineWidth: 3,
    });
    haptics.tick();
  }

  onInteract(canvas, {
    onStart(x, y) {
      spawnRipple(x, y);
    },
    onMove(x, y, id, vel) {
      // Spawn ripples while dragging (throttled)
      if (ripples.length === 0 || ripples[ripples.length - 1].radius > 15) {
        spawnRipple(x, y);
      }
    },
  });

  registerAnimCallback(pageIndex, (dt) => {
    ctx.clearRect(0, 0, width, height);

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed * dt;
      r.opacity = Math.max(0, 0.7 * (1 - r.radius / r.maxRadius));
      r.lineWidth = Math.max(0.5, 3 * (1 - r.radius / r.maxRadius));

      if (r.opacity <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      const [cr, cg, cb] = r.color;

      // Main ring
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, TAU);
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${r.opacity})`;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();

      // Inner glow
      if (r.radius < r.maxRadius * 0.3) {
        const glowGrad = ctx.createRadialGradient(
          r.x, r.y, 0,
          r.x, r.y, r.radius
        );
        glowGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${r.opacity * 0.15})`);
        glowGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, TAU);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }
    }

    // Check intersections
    for (let i = 0; i < ripples.length; i++) {
      for (let j = i + 1; j < ripples.length; j++) {
        const a = ripples[i];
        const b = ripples[j];
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        const overlap = (a.radius + b.radius) - dist;
        if (overlap > 0 && overlap < 20) {
          // Flash at midpoint
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const flashAlpha = Math.min(a.opacity, b.opacity) * 0.4;
          ctx.beginPath();
          ctx.arc(mx, my, 6, 0, TAU);
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fill();
        }
      }
    }
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
  });
}
