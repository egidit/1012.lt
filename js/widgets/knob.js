// ── Rotary Knob ──
import { setupCanvas } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { clamp, mapRange, TAU } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initKnob(containerId) {
  const container = document.getElementById(containerId);

  const canvas = document.createElement('canvas');
  canvas.style.position = 'relative';
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const cx = () => width / 2;
  const cy = () => height / 2;
  const knobRadius = () => Math.min(width, height) * 0.3;
  const ticks = 20;
  const startAngle = Math.PI * 0.75;  // 135 degrees
  const endAngle = Math.PI * 2.25;    // 405 degrees (= 45 degrees, past full circle)
  const range = endAngle - startAngle;

  let value = 0.3; // 0-1
  let lastTickValue = Math.floor(value * ticks);

  function angleFromValue(v) {
    return startAngle + v * range;
  }

  onInteract(canvas, {
    onStart(x, y) {
      updateFromPointer(x, y);
    },
    onMove(x, y) {
      updateFromPointer(x, y);
    },
  });

  function updateFromPointer(x, y) {
    let a = Math.atan2(y - cy(), x - cx());
    if (a < 0) a += TAU;
    // Map angle to value
    let normalized = a - startAngle;
    if (normalized < -Math.PI) normalized += TAU;
    if (normalized > Math.PI + range) normalized -= TAU;
    const newValue = clamp(normalized / range, 0, 1);

    const newTick = Math.floor(newValue * ticks);
    if (newTick !== lastTickValue) {
      haptics.tick();
      lastTickValue = newTick;
    }

    value = newValue;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const r = knobRadius();
    const centerX = cx();
    const centerY = cy();

    // Background ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, r + 8, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const valueAngle = angleFromValue(value);
    ctx.beginPath();
    ctx.arc(centerX, centerY, r + 8, startAngle, valueAngle);
    const grad = ctx.createLinearGradient(
      centerX - r, centerY, centerX + r, centerY
    );
    grad.addColorStop(0, 'rgba(124, 91, 245, 0.8)');
    grad.addColorStop(1, 'rgba(245, 91, 154, 0.8)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks;
      const a = angleFromValue(t);
      const inner = r + 14;
      const outer = r + 20;
      const active = t <= value;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(a) * inner,
        centerY + Math.sin(a) * inner
      );
      ctx.lineTo(
        centerX + Math.cos(a) * outer,
        centerY + Math.sin(a) * outer
      );
      ctx.strokeStyle = active
        ? 'rgba(124, 91, 245, 0.7)'
        : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Knob body
    const bodyGrad = ctx.createRadialGradient(
      centerX - r * 0.2, centerY - r * 0.2, 0,
      centerX, centerY, r
    );
    bodyGrad.addColorStop(0, 'rgba(60, 60, 80, 0.8)');
    bodyGrad.addColorStop(0.7, 'rgba(35, 35, 55, 0.9)');
    bodyGrad.addColorStop(1, 'rgba(20, 20, 35, 0.95)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, TAU);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Indicator line
    const indicatorAngle = angleFromValue(value);
    const innerR = r * 0.4;
    const outerR = r * 0.85;
    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(indicatorAngle) * innerR,
      centerY + Math.sin(indicatorAngle) * innerR
    );
    ctx.lineTo(
      centerX + Math.cos(indicatorAngle) * outerR,
      centerY + Math.sin(indicatorAngle) * outerR
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center value
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `bold ${r * 0.35}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value * 100), centerX, centerY);
  }

  draw();

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
    draw();
  });
}
