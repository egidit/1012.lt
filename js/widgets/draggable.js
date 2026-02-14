// ── Draggable Floating Objects ──
import { onInteract } from '../utils/touch.js';
import { clamp, randomRange } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initDraggable(containerId) {
  const container = document.getElementById(containerId);
  container.style.overflow = 'hidden';

  const variants = ['purple', 'pink', 'teal', 'warm'];
  const items = [];

  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = `draggable-item draggable-item--${variants[i % variants.length]}`;
    container.appendChild(el);

    const item = {
      el,
      x: randomRange(30, 200),
      y: randomRange(30, 150),
      vx: randomRange(-30, 30),
      vy: randomRange(-30, 30),
      dragging: false,
      size: 52,
    };
    items.push(item);

    el.style.left = item.x + 'px';
    el.style.top = item.y + 'px';

    let offsetX = 0, offsetY = 0;

    onInteract(el, {
      onStart(x, y, id, e) {
        item.dragging = true;
        item.vx = 0;
        item.vy = 0;
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        el.style.transform = 'scale(1.15)';
        el.style.boxShadow = el.style.boxShadow?.replace('4px 16px', '8px 24px') || '';
        el.style.zIndex = '20';
        haptics.tick();
      },
      onMove(x, y, id, vel, e) {
        if (!item.dragging) return;
        const containerRect = container.getBoundingClientRect();
        item.x = e.clientX - containerRect.left - offsetX;
        item.y = e.clientY - containerRect.top - offsetY;
        item.vx = vel.vx;
        item.vy = vel.vy;
        el.style.left = item.x + 'px';
        el.style.top = item.y + 'px';
      },
      onEnd(x, y, id, vel) {
        item.dragging = false;
        item.vx = vel.vx * 0.15;
        item.vy = vel.vy * 0.15;
        el.style.transform = '';
        el.style.zIndex = '10';
      },
    });
  }

  // Physics animation for released items
  const friction = 0.97;
  const restitution = 0.6;

  function animate() {
    const rect = container.getBoundingClientRect();
    const maxX = rect.width - 52;
    const maxY = rect.height - 52;

    for (const item of items) {
      if (item.dragging) continue;
      if (Math.abs(item.vx) < 0.1 && Math.abs(item.vy) < 0.1) continue;

      item.vx *= friction;
      item.vy *= friction;
      item.x += item.vx * 0.016;
      item.y += item.vy * 0.016;

      // Bounce off walls
      if (item.x < 0) { item.x = 0; item.vx = Math.abs(item.vx) * restitution; haptics.click(); }
      if (item.x > maxX) { item.x = maxX; item.vx = -Math.abs(item.vx) * restitution; haptics.click(); }
      if (item.y < 0) { item.y = 0; item.vy = Math.abs(item.vy) * restitution; haptics.click(); }
      if (item.y > maxY) { item.y = maxY; item.vy = -Math.abs(item.vy) * restitution; haptics.click(); }

      item.el.style.left = item.x + 'px';
      item.el.style.top = item.y + 'px';
    }

    requestAnimationFrame(animate);
  }

  animate();
}
