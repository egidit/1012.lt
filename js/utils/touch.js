// ── Unified pointer/touch interaction handler ──

export function onInteract(element, { onStart, onMove, onEnd, onTap, preventDefault = true } = {}) {
  const pointers = new Map();
  const TAP_THRESHOLD = 10; // px
  const TAP_TIME = 300; // ms

  function getXY(e) {
    const rect = element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }

  element.addEventListener('pointerdown', (e) => {
    if (preventDefault) e.preventDefault();
    element.setPointerCapture(e.pointerId);
    const pos = getXY(e);
    pointers.set(e.pointerId, {
      startX: pos.x,
      startY: pos.y,
      startTime: performance.now(),
      lastX: pos.x,
      lastY: pos.y,
      lastTime: performance.now(),
      vx: 0,
      vy: 0,
    });
    onStart?.(pos.x, pos.y, e.pointerId, e);
  });

  element.addEventListener('pointermove', (e) => {
    if (preventDefault) e.preventDefault();
    const data = pointers.get(e.pointerId);
    if (!data) return;
    const pos = getXY(e);
    const now = performance.now();
    const elapsed = now - data.lastTime;
    if (elapsed > 0) {
      data.vx = (pos.x - data.lastX) / elapsed * 1000;
      data.vy = (pos.y - data.lastY) / elapsed * 1000;
    }
    data.lastX = pos.x;
    data.lastY = pos.y;
    data.lastTime = now;
    onMove?.(pos.x, pos.y, e.pointerId, { vx: data.vx, vy: data.vy }, e);
  });

  function handleEnd(e) {
    if (preventDefault) e.preventDefault();
    const data = pointers.get(e.pointerId);
    if (!data) return;
    const pos = getXY(e);
    const dist = Math.sqrt(
      (pos.x - data.startX) ** 2 + (pos.y - data.startY) ** 2
    );
    const elapsed = performance.now() - data.startTime;

    onEnd?.(pos.x, pos.y, e.pointerId, { vx: data.vx, vy: data.vy }, e);

    if (dist < TAP_THRESHOLD && elapsed < TAP_TIME) {
      onTap?.(data.startX, data.startY, e.pointerId, e);
    }

    pointers.delete(e.pointerId);
  }

  element.addEventListener('pointerup', handleEnd);
  element.addEventListener('pointercancel', handleEnd);

  // Prevent context menu on long press
  element.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    destroy() {
      pointers.clear();
    }
  };
}

// Get velocity from a series of pointer events (for momentum)
export function trackVelocity() {
  let lastX = 0, lastY = 0, lastTime = 0;
  let vx = 0, vy = 0;

  return {
    update(x, y) {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0 && lastTime > 0) {
        vx = (x - lastX) / dt * 1000;
        vy = (y - lastY) / dt * 1000;
      }
      lastX = x;
      lastY = y;
      lastTime = now;
    },
    get() {
      return { vx, vy };
    },
    reset() {
      vx = 0;
      vy = 0;
      lastTime = 0;
    }
  };
}
