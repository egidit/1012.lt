// ── Satisfying Slider & Snap Slider ──
import { onInteract } from '../utils/touch.js';
import { clamp, mapRange } from '../utils/math.js';
import { haptics } from '../utils/haptics.js';

export function initSlider(containerId) {
  const container = document.getElementById(containerId);
  let value = 0.5;

  const wrapper = document.createElement('div');
  wrapper.className = 'slider-container';

  const track = document.createElement('div');
  track.className = 'slider-track';
  const fill = document.createElement('div');
  fill.className = 'slider-fill';
  const thumbEl = document.createElement('div');
  thumbEl.className = 'slider-thumb';
  const tooltip = document.createElement('div');
  tooltip.className = 'slider-tooltip';
  tooltip.textContent = '50';
  thumbEl.appendChild(tooltip);
  track.appendChild(fill);
  track.appendChild(thumbEl);
  wrapper.appendChild(track);
  container.appendChild(wrapper);

  function updateVisual() {
    const pct = value * 100;
    fill.style.width = pct + '%';
    thumbEl.style.left = pct + '%';
    tooltip.textContent = Math.round(pct);
  }

  updateVisual();

  onInteract(track, {
    onStart(x) {
      thumbEl.classList.add('dragging');
      setValue(x);
    },
    onMove(x) {
      setValue(x);
    },
    onEnd() {
      thumbEl.classList.remove('dragging');
    },
  });

  function setValue(x) {
    const rect = track.getBoundingClientRect();
    const newVal = clamp(x / rect.width, 0, 1);
    // Haptic tick every 10%
    const oldStep = Math.round(value * 10);
    const newStep = Math.round(newVal * 10);
    if (oldStep !== newStep) {
      haptics.tick();
    }
    value = newVal;
    updateVisual();
  }
}

export function initSnapSlider(containerId) {
  const container = document.getElementById(containerId);
  const snaps = 10;
  let value = 5;

  const wrapper = document.createElement('div');
  wrapper.className = 'slider-container';

  const track = document.createElement('div');
  track.className = 'slider-track';
  const fill = document.createElement('div');
  fill.className = 'slider-fill';
  const thumbEl = document.createElement('div');
  thumbEl.className = 'slider-thumb';
  const tooltip = document.createElement('div');
  tooltip.className = 'slider-tooltip';
  tooltip.textContent = String(value);
  thumbEl.appendChild(tooltip);

  // Snap tick marks
  for (let i = 0; i <= snaps; i++) {
    const tick = document.createElement('div');
    tick.style.cssText = `
      position: absolute;
      left: ${(i / snaps) * 100}%;
      top: 50%;
      width: 2px;
      height: 12px;
      transform: translateX(-50%) translateY(-50%);
      background: rgba(255,255,255,0.15);
      border-radius: 1px;
      pointer-events: none;
    `;
    track.appendChild(tick);
  }

  track.appendChild(fill);
  track.appendChild(thumbEl);
  wrapper.appendChild(track);
  container.appendChild(wrapper);

  function updateVisual() {
    const pct = (value / snaps) * 100;
    fill.style.width = pct + '%';
    thumbEl.style.left = pct + '%';
    tooltip.textContent = String(value);
  }

  updateVisual();

  onInteract(track, {
    onStart(x) {
      thumbEl.classList.add('dragging');
      snapTo(x);
    },
    onMove(x) {
      snapTo(x);
    },
    onEnd() {
      thumbEl.classList.remove('dragging');
    },
  });

  function snapTo(x) {
    const rect = track.getBoundingClientRect();
    const raw = clamp(x / rect.width, 0, 1);
    const newVal = Math.round(raw * snaps);
    if (newVal !== value) {
      haptics.snap();
      // Micro-bounce on snap
      thumbEl.style.transform = 'translate(-50%, -50%) scale(1.3)';
      setTimeout(() => {
        thumbEl.style.transform = '';
      }, 100);
    }
    value = newVal;
    updateVisual();
  }
}
