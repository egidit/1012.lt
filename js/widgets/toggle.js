// ── Premium Toggle Switch ──
import { haptics } from '../utils/haptics.js';

export function initToggle(containerId) {
  const container = document.getElementById(containerId);
  let active = false;

  // Build DOM
  const track = document.createElement('div');
  track.className = 'toggle-track';
  const thumb = document.createElement('div');
  thumb.className = 'toggle-thumb';
  track.appendChild(thumb);
  container.appendChild(track);

  // Color variants
  const colors = [
    { active: 'rgba(124, 91, 245, 0.35)', border: 'rgba(124, 91, 245, 0.5)', shadow: 'rgba(124, 91, 245, 0.5)' },
    { active: 'rgba(245, 91, 154, 0.35)', border: 'rgba(245, 91, 154, 0.5)', shadow: 'rgba(245, 91, 154, 0.5)' },
    { active: 'rgba(91, 245, 200, 0.35)', border: 'rgba(91, 245, 200, 0.5)', shadow: 'rgba(91, 245, 200, 0.5)' },
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  function toggle() {
    active = !active;
    track.classList.toggle('active', active);
    haptics.toggle();

    if (active) {
      track.style.background = color.active;
      track.style.borderColor = color.border;
      thumb.style.boxShadow = `0 2px 12px ${color.shadow}`;
    } else {
      track.style.background = '';
      track.style.borderColor = '';
      thumb.style.boxShadow = '';
    }

    // Scale pulse
    track.style.transform = 'scale(1.08)';
    setTimeout(() => {
      track.style.transform = '';
    }, 150);
  }

  track.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    toggle();
  });
}
