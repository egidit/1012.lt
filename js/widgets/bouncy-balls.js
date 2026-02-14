// ── Bouncy Balls ──
import { setupCanvas, registerAnimCallback } from '../app.js';
import { onInteract } from '../utils/touch.js';
import { applyGravity, applyFriction, eulerStep, bounceOffWalls, circleCollision } from '../utils/physics.js';
import { randomRange, TAU } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initBouncyBalls(containerId, pageIndex) {
  const container = document.getElementById(containerId);
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let { ctx, width, height } = setupCanvas(canvas);

  const balls = [];
  const maxBalls = 30;
  const colors = [
    [124, 91, 245],   // purple
    [245, 91, 154],   // pink
    [91, 245, 200],   // teal
    [245, 168, 91],   // warm
    [91, 168, 245],   // blue
  ];

  function spawnBall(x, y, vx = 0, vy = 0) {
    if (balls.length >= maxBalls) balls.shift();
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = randomRange(12, 24);
    balls.push({
      x, y, vx, vy,
      ax: 0, ay: 0,
      radius,
      mass: radius * 0.1,
      restitution: 0.75,
      color,
      trail: [],
    });
    haptics.pop();
  }

  // Spawn initial balls
  for (let i = 0; i < 5; i++) {
    spawnBall(
      randomRange(40, width - 40),
      randomRange(20, height * 0.4),
      randomRange(-100, 100),
      randomRange(-50, 50)
    );
  }

  onInteract(canvas, {
    onTap(x, y) {
      spawnBall(x, y, randomRange(-80, 80), randomRange(-200, -50));
    },
    onEnd(x, y, id, vel) {
      spawnBall(x, y, vel.vx * 0.3, vel.vy * 0.3);
    },
  });

  const bounds = { left: 0, top: 0, right: width, bottom: height };

  registerAnimCallback(pageIndex, (dt) => {
    bounds.right = width;
    bounds.bottom = height;

    ctx.clearRect(0, 0, width, height);

    // Update physics
    for (const ball of balls) {
      applyGravity(ball, 600, dt);
      applyFriction(ball, 0.9995);
      eulerStep(ball, dt);
      bounceOffWalls(ball, bounds, ball.restitution);

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) ball.trail.shift();
    }

    // Collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        circleCollision(balls[i], balls[j]);
      }
    }

    // Draw trails
    for (const ball of balls) {
      const [r, g, b] = ball.color;
      for (let i = 0; i < ball.trail.length; i++) {
        const t = ball.trail[i];
        const alpha = (i / ball.trail.length) * 0.15;
        const radius = ball.radius * (i / ball.trail.length) * 0.6;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, TAU);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }
    }

    // Draw balls
    for (const ball of balls) {
      const [r, g, b] = ball.color;

      // Shadow
      ctx.beginPath();
      ctx.ellipse(ball.x, height - 4, ball.radius * 0.8, 3, 0, 0, TAU);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * (1 - ball.y / height)})`;
      ctx.fill();

      // Ball
      const grad = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
        ball.x, ball.y, ball.radius
      );
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.95)`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.6)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.2)`);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, TAU);
      ctx.fillStyle = grad;
      ctx.fill();

      // Shine
      ctx.beginPath();
      ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.25, 0, TAU);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }
  });

  window.addEventListener('canvas-resize', () => {
    ({ ctx, width, height } = setupCanvas(canvas));
  });
}
