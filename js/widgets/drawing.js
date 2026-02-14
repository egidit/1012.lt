// ── Finger Drawing with Glow & Fade ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { distance, clamp, TAU } from '../utils/math.js';

export function initDrawing(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  // Drawing state
  const strokes = new Map(); // pointerId -> { points: [] }
  let hue = 0;
  let glowMode = true;
  let fadeMode = true;
  let time = 0;

  // Mode buttons
  const controls = document.createElement('div');
  controls.className = 'art-controls';
  container.appendChild(controls);

  const glowBtn = document.createElement('button');
  glowBtn.className = 'art-btn active';
  glowBtn.textContent = 'Glow';
  glowBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    glowMode = !glowMode;
    glowBtn.classList.toggle('active', glowMode);
  });
  controls.appendChild(glowBtn);

  const fadeBtn = document.createElement('button');
  fadeBtn.className = 'art-btn active';
  fadeBtn.textContent = 'Fade';
  fadeBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    fadeMode = !fadeMode;
    fadeBtn.classList.toggle('active', fadeMode);
  });
  controls.appendChild(fadeBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'art-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    ctx.clearRect(0, 0, width, height);
  });
  controls.appendChild(clearBtn);

  onInteract(canvas, {
    onStart(x, y, id) {
      strokes.set(id, {
        points: [{ x, y, time: performance.now() }],
        hue: hue,
      });
    },
    onMove(x, y, id) {
      const stroke = strokes.get(id);
      if (!stroke) return;
      stroke.points.push({ x, y, time: performance.now() });

      // Draw segment immediately
      const pts = stroke.points;
      if (pts.length < 2) return;

      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      const speed = distance(prev.x, prev.y, curr.x, curr.y);
      const lineWidth = clamp(15 - speed * 0.08, 1.5, 15);

      ctx.save();
      ctx.beginPath();
      if (pts.length >= 3) {
        const pprev = pts[pts.length - 3];
        const cpx = prev.x;
        const cpy = prev.y;
        ctx.moveTo((pprev.x + prev.x) / 2, (pprev.y + prev.y) / 2);
        ctx.quadraticCurveTo(cpx, cpy, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
      } else {
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
      }

      const h = stroke.hue;
      ctx.strokeStyle = `hsl(${h}, 80%, 65%)`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (glowMode) {
        ctx.shadowBlur = lineWidth * 2;
        ctx.shadowColor = `hsl(${h}, 90%, 55%)`;
      }

      ctx.stroke();
      ctx.restore();

      // Keep only recent points for smoothing
      if (pts.length > 50) pts.splice(0, pts.length - 50);
    },
    onEnd(x, y, id) {
      strokes.delete(id);
      // Shift hue for next stroke
      hue = (hue + 25) % 360;
    },
    onTap(x, y) {
      // Double-tap detection for clear
      // (using simple timestamp)
    },
  });

  // Fade animation
  registerAnimCallback(pageIndex, (dt) => {
    time += dt;

    if (fadeMode) {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.01)';
      ctx.fillRect(0, 0, width, height);
    }

    // Slowly shift hue over time
    hue = (hue + dt * 8) % 360;
  });

  window.addEventListener('canvas-resize', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ({ ctx, width, height } = setupCanvas(canvas));
    ctx.putImageData(imageData, 0, 0);
  });
}
