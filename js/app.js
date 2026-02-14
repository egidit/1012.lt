// ── App initialization and page navigation ──

const pages = document.getElementById('pages');
const dots = document.querySelectorAll('.dock-dot');
const sections = document.querySelectorAll('.page');
let currentPage = 0;
const initializedPages = new Set();

// ── Animation loop system (multiple callbacks per page) ──
const pageCallbacks = new Map(); // pageIndex -> [callback, ...]
const pageLoops = new Map();     // pageIndex -> { resume, pause }

function getOrCreateLoop(pageIndex) {
  if (pageLoops.has(pageIndex)) return pageLoops.get(pageIndex);

  let rafId = null;
  let running = false;
  let lastTime = 0;

  function frame(time) {
    if (!running) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;
    const cbs = pageCallbacks.get(pageIndex) || [];
    for (const cb of cbs) cb(dt, time);
    rafId = requestAnimationFrame(frame);
  }

  const loop = {
    resume() {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    },
    pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };

  pageLoops.set(pageIndex, loop);
  return loop;
}

export function registerAnimCallback(pageIndex, callback) {
  if (!pageCallbacks.has(pageIndex)) pageCallbacks.set(pageIndex, []);
  pageCallbacks.get(pageIndex).push(callback);
  const loop = getOrCreateLoop(pageIndex);
  // Start if this is the current page
  if (currentPage === pageIndex) loop.resume();
  return loop;
}

// ── Page visibility & entrance animations ──
function setActivePage(index) {
  currentPage = index;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  sections.forEach((section, i) => {
    section.classList.toggle('visible', i === index);
  });

  // Lazy-init widgets for this page
  if (!initializedPages.has(index)) {
    initializedPages.add(index);
    initPageWidgets(index);
  }

  // Pause/resume animation loops
  pageLoops.forEach((loop, pageIdx) => {
    if (pageIdx === index) {
      loop.resume();
    } else {
      loop.pause();
    }
  });
}

// ── Scroll-snap observer ──
let scrollTimeout;
pages.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const scrollLeft = pages.scrollLeft;
    const pageWidth = pages.clientWidth;
    const newPage = Math.round(scrollLeft / pageWidth);
    if (newPage !== currentPage && newPage >= 0 && newPage < sections.length) {
      setActivePage(newPage);
    }
  }, 60);
}, { passive: true });

// ── Dock navigation ──
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const pageIdx = parseInt(dot.dataset.page);
    sections[pageIdx].scrollIntoView({ behavior: 'smooth', inline: 'start' });
    setActivePage(pageIdx);
  });
});

// ── Lazy widget initialization ──
async function initPageWidgets(pageIndex) {
  switch (pageIndex) {
    case 0: {
      const { initSpinner } = await import('./widgets/spinner.js');
      const { initToggle } = await import('./widgets/toggle.js');
      const { initSlider } = await import('./widgets/slider.js');
      const { initDraggable } = await import('./widgets/draggable.js');
      initSpinner('w-spinner', 0);
      initToggle('w-toggle-1');
      initToggle('w-toggle-2');
      initSlider('w-slider');
      initDraggable('w-draggable');
      break;
    }
    case 1: {
      const { initBlob } = await import('./widgets/blob.js');
      const { initRipple } = await import('./widgets/ripple.js');
      const { initBubbles } = await import('./widgets/bubbles.js');
      initBlob('w-blob', 1);
      initRipple('w-ripple', 1);
      initBubbles('w-bubbles');
      break;
    }
    case 2: {
      const { initBouncyBalls } = await import('./widgets/bouncy-balls.js');
      const { initPendulum } = await import('./widgets/pendulum.js');
      const { initSprings } = await import('./widgets/spring.js');
      initBouncyBalls('w-bouncy', 2);
      initPendulum('w-pendulum', 2);
      initSprings('w-springs', 2);
      break;
    }
    case 3: {
      const { initKnob } = await import('./widgets/knob.js');
      const { initButton } = await import('./widgets/button.js');
      const { initSnapSlider } = await import('./widgets/slider.js');
      initKnob('w-knob-1');
      initKnob('w-knob-2');
      initSnapSlider('w-snap-slider');
      initButton('w-btn-1', 'accent');
      initButton('w-btn-2', 'pink');
      initButton('w-btn-3', 'teal');
      initButton('w-btn-4', 'accent');
      break;
    }
    case 4: {
      const { initParticles } = await import('./widgets/particles.js');
      const { initDrawing } = await import('./widgets/drawing.js');
      initParticles('w-particles', 4);
      initDrawing('w-drawing', 4);
      break;
    }
  }
}

// ── Canvas resize helper ──
export function setupCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height, dpr };
}

// ── Init ──
setActivePage(0);

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    window.dispatchEvent(new CustomEvent('canvas-resize'));
  }, 200);
}, { passive: true });
