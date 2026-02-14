// ── Squishable Blob ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { TAU, distance, lerp } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initBlob(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const pointCount = 10;
  const baseRadius = () => Math.min(width, height) * 0.3;
  let points = [];
  let time = 0;

  function createPoints() {
    const r = baseRadius();
    points = [];
    for (let i = 0; i < pointCount; i++) {
      const a = (TAU / pointCount) * i;
      points.push({
        restX: width / 2 + Math.cos(a) * r,
        restY: height / 2 + Math.sin(a) * r,
        x: width / 2 + Math.cos(a) * r,
        y: height / 2 + Math.sin(a) * r,
        vx: 0,
        vy: 0,
        angle: a,
      });
    }
  }

  createPoints();

  const spring = 0.08;
  const damping = 0.88;
  const pushStrength = 60;

  onInteract(canvas, {
    onStart(x, y) {
      pushPoints(x, y);
      haptics.heavy();
    },
    onMove(x, y) {
      pushPoints(x, y);
    },
  });

  function pushPoints(tx, ty) {
    for (const p of points) {
      const d = distance(tx, ty, p.x, p.y);
      if (d < baseRadius() * 1.5 && d > 0) {
        const force = pushStrength / (d * 0.1 + 1);
        const dx = p.x - tx;
        const dy = p.y - ty;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
  }

  registerAnimCallback(pageIndex, (dt) => {
    time += dt;
    ctx.clearRect(0, 0, width, height);

    // Update points with spring physics
    for (const p of points) {
      // Breathing idle animation
      const breathe = Math.sin(time * 1.5 + p.angle * 2) * 3;
      const targetX = p.restX + Math.cos(p.angle) * breathe;
      const targetY = p.restY + Math.sin(p.angle) * breathe;

      // Spring force toward rest
      const dx = targetX - p.x;
      const dy = targetY - p.y;
      p.vx += dx * spring;
      p.vy += dy * spring;
      p.vx *= damping;
      p.vy *= damping;
      p.x += p.vx;
      p.y += p.vy;
    }

    // Draw blob
    ctx.save();

    // Outer glow
    const glowGrad = ctx.createRadialGradient(
      width / 2, height / 2, baseRadius() * 0.5,
      width / 2, height / 2, baseRadius() * 1.3
    );
    glowGrad.addColorStop(0, 'rgba(124, 91, 245, 0.15)');
    glowGrad.addColorStop(1, 'rgba(124, 91, 245, 0)');
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, baseRadius() * 1.3, 0, TAU);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Blob shape using cubic bezier curves
    ctx.beginPath();
    for (let i = 0; i < pointCount; i++) {
      const curr = points[i];
      const next = points[(i + 1) % pointCount];
      const cpx = (curr.x + next.x) / 2;
      const cpy = (curr.y + next.y) / 2;

      if (i === 0) {
        const prev = points[pointCount - 1];
        const firstCpx = (prev.x + curr.x) / 2;
        const firstCpy = (prev.y + curr.y) / 2;
        ctx.moveTo(firstCpx, firstCpy);
      }
      ctx.quadraticCurveTo(curr.x, curr.y, cpx, cpy);
    }
    ctx.closePath();

    // Fill gradient
    const grad = ctx.createRadialGradient(
      width / 2 - baseRadius() * 0.2,
      height / 2 - baseRadius() * 0.2,
      0,
      width / 2,
      height / 2,
      baseRadius()
    );
    grad.addColorStop(0, 'rgba(160, 130, 255, 0.7)');
    grad.addColorStop(0.5, 'rgba(124, 91, 245, 0.5)');
    grad.addColorStop(1, 'rgba(80, 50, 200, 0.3)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(
      width / 2 - baseRadius() * 0.15,
      height / 2 - baseRadius() * 0.15,
      baseRadius() * 0.4,
      0, TAU
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    ctx.restore();
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
    createPoints();
  });
}
