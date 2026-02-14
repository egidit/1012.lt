// ── Bubble Wrap ──
import { haptics } from '../utils/haptics.js';

export function initBubbles(containerId) {
  const container = document.getElementById(containerId);
  const count = 25; // 5x5 grid
  let poppedCount = 0;

  const grid = document.createElement('div');
  grid.className = 'bubble-grid';
  container.appendChild(grid);

  const bubbles = [];
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.dataset.index = i;
    grid.appendChild(bubble);
    bubbles.push(bubble);

    bubble.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (bubble.classList.contains('popped')) return;
      bubble.classList.add('popped');
      haptics.pop();
      poppedCount++;

      // Scale pop animation
      bubble.style.transition = 'none';
      bubble.style.transform = 'scale(0.7)';
      requestAnimationFrame(() => {
        bubble.style.transition = '';
        bubble.style.transform = '';
        bubble.classList.add('popped');
      });

      // All popped — reset with wave
      if (poppedCount >= count) {
        setTimeout(() => resetBubbles(), 600);
      }
    });
  }

  function resetBubbles() {
    poppedCount = 0;
    bubbles.forEach((bubble, i) => {
      setTimeout(() => {
        bubble.classList.remove('popped');
        bubble.style.animation = 'bubbleInflate 0.3s var(--ease-bounce)';
        bubble.addEventListener('animationend', () => {
          bubble.style.animation = '';
        }, { once: true });
      }, i * 40); // Wave delay
    });
    haptics.heavy();
  }
}
