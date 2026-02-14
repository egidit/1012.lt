// ── Fidget Spinner ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { TAU } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initSpinner(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const cx = () => width / 2;
  const cy = () => height / 2;
  const armLength = () => Math.min(width, height) * 0.32;
  const bobRadius = () => Math.min(width, height) * 0.085;
  const centerRadius = () => Math.min(width, height) * 0.065;

  let rotation = 0;
  let angularVelocity = 0;
  const friction = 0.993;
  const arms = 3;

  // Ghost frames for motion blur
  const ghostCount = 5;
  const ghostOpacity = 0.08;

  // Interaction
  let dragging = false;
  let lastAngle = 0;

  onInteract(canvas, {
    onStart(x, y) {
      dragging = true;
      lastAngle = Math.atan2(y - cy(), x - cx());
      angularVelocity = 0;
    },
    onMove(x, y) {
      if (!dragging) return;
      const a = Math.atan2(y - cy(), x - cx());
      let delta = a - lastAngle;
      // Handle wrapping around ±π
      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;
      angularVelocity = delta * 60; // Convert per-frame to per-second feel
      rotation += delta;
      lastAngle = a;
    },
    onEnd() {
      dragging = false;
    },
  });

  function drawSpinner(rot, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx(), cy());
    ctx.rotate(rot);

    const aLen = armLength();
    const bRad = bobRadius();
    const cRad = centerRadius();

    // Arms
    for (let i = 0; i < arms; i++) {
      const a = (TAU / arms) * i;
      const ex = Math.cos(a) * aLen;
      const ey = Math.sin(a) * aLen;

      // Arm body
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * alpha})`;
      ctx.lineWidth = bRad * 0.6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bob
      const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, bRad);
      gradient.addColorStop(0, `rgba(124, 91, 245, ${0.9 * alpha})`);
      gradient.addColorStop(0.6, `rgba(124, 91, 245, ${0.5 * alpha})`);
      gradient.addColorStop(1, `rgba(124, 91, 245, ${0.1 * alpha})`);
      ctx.beginPath();
      ctx.arc(ex, ey, bRad, 0, TAU);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bob shine
      ctx.beginPath();
      ctx.arc(ex - bRad * 0.25, ey - bRad * 0.25, bRad * 0.35, 0, TAU);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * alpha})`;
      ctx.fill();
    }

    // Center hub
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cRad);
    hubGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 * alpha})`);
    hubGrad.addColorStop(0.5, `rgba(200, 200, 220, ${0.15 * alpha})`);
    hubGrad.addColorStop(1, `rgba(150, 150, 170, ${0.05 * alpha})`);
    ctx.beginPath();
    ctx.arc(0, 0, cRad, 0, TAU);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, cRad * 0.3, 0, TAU);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
    ctx.fill();

    ctx.restore();
  }

  // Haptic click tracking
  let lastClickAngle = 0;
  const clickInterval = TAU / 12; // 12 clicks per revolution

  registerAnimCallback(pageIndex, (dt) => {
    if (!dragging) {
      angularVelocity *= friction;
      rotation += angularVelocity * dt;
      if (Math.abs(angularVelocity) < 0.01) angularVelocity = 0;
    }

    // Haptic clicks at high speed
    if (Math.abs(angularVelocity) > 2) {
      const angleDiff = Math.abs(rotation - lastClickAngle);
      if (angleDiff > clickInterval) {
        haptics.click();
        lastClickAngle = rotation;
      }
    }

    // Draw
    ctx.clearRect(0, 0, width, height);

    // Motion blur ghosts
    const speed = Math.abs(angularVelocity);
    if (speed > 1) {
      const ghostSpread = Math.min(speed * 0.008, 0.15);
      for (let i = ghostCount; i >= 1; i--) {
        const ghostRot = rotation - angularVelocity * dt * i * 0.3;
        drawSpinner(ghostRot, ghostOpacity * (1 - i / (ghostCount + 1)));
      }
    }

    drawSpinner(rotation, 1);

    // Speed glow
    if (speed > 3) {
      const glowIntensity = Math.min(speed / 30, 0.3);
      ctx.save();
      ctx.translate(cx(), cy());
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, armLength() + bobRadius());
      glow.addColorStop(0, `rgba(124, 91, 245, ${glowIntensity})`);
      glow.addColorStop(1, 'rgba(124, 91, 245, 0)');
      ctx.beginPath();
      ctx.arc(0, 0, armLength() + bobRadius(), 0, TAU);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.restore();
    }
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
  });
}
