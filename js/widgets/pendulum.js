// ── Pendulum ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { TAU, distance } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initPendulum(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const pivotX = () => width / 2;
  const pivotY = () => 20;
  const rodLength = () => Math.min(width, height) * 0.55;
  const bobRadius = () => Math.min(width, height) * 0.06;
  const gravity = 9.81;

  let theta = Math.PI / 4; // Start angle
  let omega = 0; // Angular velocity
  const damping = 0.998;
  let dragging = false;
  const trail = [];
  const maxTrail = 40;

  // Double pendulum
  let theta2 = Math.PI / 3;
  let omega2 = 0;
  let doubleMode = false;
  const rod2Length = () => rodLength() * 0.7;

  function getBobPos() {
    const L = rodLength();
    return {
      x: pivotX() + L * Math.sin(theta),
      y: pivotY() + L * Math.cos(theta),
    };
  }

  function getBob2Pos() {
    const bob1 = getBobPos();
    const L2 = rod2Length();
    return {
      x: bob1.x + L2 * Math.sin(theta2),
      y: bob1.y + L2 * Math.cos(theta2),
    };
  }

  onInteract(canvas, {
    onStart(x, y) {
      const bob = doubleMode ? getBob2Pos() : getBobPos();
      if (distance(x, y, bob.x, bob.y) < bobRadius() * 3) {
        dragging = true;
        omega = 0;
        omega2 = 0;
        haptics.tick();
      }
    },
    onMove(x, y) {
      if (!dragging) return;
      if (doubleMode) {
        const bob1 = getBobPos();
        theta2 = Math.atan2(x - bob1.x, y - bob1.y);
      } else {
        theta = Math.atan2(x - pivotX(), y - pivotY());
      }
    },
    onEnd(x, y, id, vel) {
      if (dragging) {
        // Add momentum from flick
        if (!doubleMode) {
          omega = vel.vx * 0.003;
        } else {
          omega2 = vel.vx * 0.003;
        }
        dragging = false;
      }
    },
    onTap(x, y) {
      // Toggle double pendulum mode if tapping pivot area
      if (distance(x, y, pivotX(), pivotY()) < 30) {
        doubleMode = !doubleMode;
        haptics.toggle();
        trail.length = 0;
      }
    },
  });

  registerAnimCallback(pageIndex, (dt) => {
    ctx.clearRect(0, 0, width, height);

    if (!dragging) {
      if (!doubleMode) {
        // Simple pendulum physics
        const alpha = -(gravity / rodLength()) * Math.sin(theta) * 50;
        omega += alpha * dt;
        omega *= damping;
        theta += omega * dt;
      } else {
        // Simplified double pendulum (not full Lagrangian, but looks cool)
        const L1 = rodLength();
        const L2 = rod2Length();
        const m1 = 1, m2 = 1;
        const g = gravity * 50;

        // First pendulum
        const alpha1 = (-g * (2 * m1 + m2) * Math.sin(theta) -
          m2 * g * Math.sin(theta - 2 * theta2) -
          2 * Math.sin(theta - theta2) * m2 *
          (omega2 * omega2 * L2 + omega * omega * L1 * Math.cos(theta - theta2))) /
          (L1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta - 2 * theta2)));

        // Second pendulum
        const alpha2 = (2 * Math.sin(theta - theta2) *
          (omega * omega * L1 * (m1 + m2) +
          g * (m1 + m2) * Math.cos(theta) +
          omega2 * omega2 * L2 * m2 * Math.cos(theta - theta2))) /
          (L2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta - 2 * theta2)));

        omega += alpha1 * dt;
        omega2 += alpha2 * dt;
        omega *= damping;
        omega2 *= damping;
        theta += omega * dt;
        theta2 += omega2 * dt;
      }
    }

    const bob1 = getBobPos();
    const bob2 = doubleMode ? getBob2Pos() : null;
    const trailTarget = doubleMode ? bob2 : bob1;

    // Trail
    trail.push({ x: trailTarget.x, y: trailTarget.y });
    if (trail.length > maxTrail) trail.shift();

    // Draw trail
    for (let i = 1; i < trail.length; i++) {
      const alpha = (i / trail.length) * 0.4;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(124, 91, 245, ${alpha})`;
      ctx.lineWidth = (i / trail.length) * 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw rod(s)
    ctx.beginPath();
    ctx.moveTo(pivotX(), pivotY());
    ctx.lineTo(bob1.x, bob1.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (doubleMode && bob2) {
      ctx.beginPath();
      ctx.moveTo(bob1.x, bob1.y);
      ctx.lineTo(bob2.x, bob2.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Pivot
    ctx.beginPath();
    ctx.arc(pivotX(), pivotY(), 5, 0, TAU);
    ctx.fillStyle = doubleMode ? 'rgba(245, 91, 154, 0.8)' : 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Bob 1
    const bRad = bobRadius();
    const grad1 = ctx.createRadialGradient(
      bob1.x - bRad * 0.3, bob1.y - bRad * 0.3, 0,
      bob1.x, bob1.y, bRad
    );
    grad1.addColorStop(0, 'rgba(124, 91, 245, 0.9)');
    grad1.addColorStop(1, 'rgba(124, 91, 245, 0.3)');
    ctx.beginPath();
    ctx.arc(bob1.x, bob1.y, bRad, 0, TAU);
    ctx.fillStyle = grad1;
    ctx.fill();

    // Bob 2
    if (doubleMode && bob2) {
      const grad2 = ctx.createRadialGradient(
        bob2.x - bRad * 0.3, bob2.y - bRad * 0.3, 0,
        bob2.x, bob2.y, bRad * 0.8
      );
      grad2.addColorStop(0, 'rgba(245, 91, 154, 0.9)');
      grad2.addColorStop(1, 'rgba(245, 91, 154, 0.3)');
      ctx.beginPath();
      ctx.arc(bob2.x, bob2.y, bRad * 0.8, 0, TAU);
      ctx.fillStyle = grad2;
      ctx.fill();
    }

    // Mode indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(doubleMode ? 'DOUBLE · tap pivot to toggle' : 'SINGLE · tap pivot to toggle', width / 2, height - 8);
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
    trail.length = 0;
  });
}
